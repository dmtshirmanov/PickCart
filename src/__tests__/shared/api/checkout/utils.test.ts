import { CHECKOUT_ISSUE_CODES } from '_shared/api/checkout/types';
import { processCheckout } from '_shared/api/checkout/utils';
import { createOrderProduct } from '../../../fixtures/product';

const RESERVATION_TTL_MS = 30 * 60 * 1000;

function mockRandomSequence(...values: Array<number>) {
  let index = 0;

  return jest.spyOn(Math, 'random').mockImplementation(() => values[index++] ?? 0);
}

function createItem(overrides: Parameters<typeof createOrderProduct>[0], quantity: number) {
  return { product: createOrderProduct({ ...overrides, quantity }), quantity };
}

describe('processCheckout', () => {
  test('succeeds and creates reservation', () => {
    mockRandomSequence(0.5, 0.5);
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

    const item = createItem({ price: 500, stock: 5 }, 3);
    const result = processCheckout({
      items: [item],
      totalPrice: 1500,
      minOrderPrice: 1000,
    });

    expect(result).toMatchObject({
      success: true,
      issues: [],
      minOrderPrice: 1000,
      items: [{ product: { ...item.product, stock: 5 }, quantity: 3 }],
      reservation: {
        id: 'reservation-1000000',
        expiresAt: 1_000_000 + RESERVATION_TTL_MS,
      },
    });
  });

  test('returns OUT_OF_STOCK when available stock is zero', () => {
    mockRandomSequence(0.1, 0, 0.5);

    const item = createItem({ name: 'Молоко', stock: 5 }, 2);
    const result = processCheckout({
      items: [item],
      totalPrice: 200,
      minOrderPrice: 0,
    });

    expect(result.success).toBe(false);
    expect(result.items).toEqual([]);
    expect(result.issues).toEqual([
      {
        code: CHECKOUT_ISSUE_CODES.OUT_OF_STOCK,
        productId: item.product.id,
        productName: 'Молоко',
        requestedQuantity: 2,
        availableQuantity: 0,
      },
    ]);
  });

  test('returns STOCK_LIMIT_CHANGED and reduces quantity', () => {
    mockRandomSequence(0.1, 0.2, 0.5);

    const item = createItem({ name: 'Хлеб', stock: 5 }, 5);
    const result = processCheckout({
      items: [item],
      totalPrice: 500,
      minOrderPrice: 1000,
    });

    expect(result.success).toBe(false);
    expect(result.items).toEqual([{ product: { ...item.product, stock: 1 }, quantity: 1 }]);
    expect(result.issues).toEqual([
      {
        code: CHECKOUT_ISSUE_CODES.STOCK_LIMIT_CHANGED,
        productId: item.product.id,
        productName: 'Хлеб',
        requestedQuantity: 5,
        availableQuantity: 1,
      },
      {
        code: CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
        minOrderPrice: 1000,
      },
    ]);
  });

  test('returns MIN_ORDER_AMOUNT_CHANGED when total is below min order', () => {
    mockRandomSequence(0.5);

    const item = createItem({ price: 100, stock: 5 }, 2);
    const result = processCheckout({
      items: [item],
      totalPrice: 200,
      minOrderPrice: 1000,
    });

    expect(result.success).toBe(false);
    expect(result.items).toEqual([{ product: { ...item.product, stock: 5 }, quantity: 2 }]);
    expect(result.issues).toEqual([
      {
        code: CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
        minOrderPrice: 1000,
      },
    ]);
    expect(result.reservation).toBeUndefined();
  });

  test('uses new min order price from backend', () => {
    mockRandomSequence(0.5, 0.1, 1 - 1 / 1001);

    const item = createItem({ price: 500, stock: 5 }, 3);
    const result = processCheckout({
      items: [item],
      totalPrice: 1500,
      minOrderPrice: 1000,
    });

    expect(result.success).toBe(false);
    expect(result.minOrderPrice).toBe(2000);
    expect(result.issues).toContainEqual({
      code: CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
      minOrderPrice: 2000,
    });
  });

  test('keeps valid items when another is out of stock', () => {
    mockRandomSequence(0.1, 0, 0.5, 0.5);

    const milk = createItem({ id: 'milk', name: 'Молоко', price: 100, stock: 3 }, 2);
    const bread = createItem({ id: 'bread', name: 'Хлеб', price: 200, stock: 4 }, 2);
    const result = processCheckout({
      items: [milk, bread],
      totalPrice: 600,
      minOrderPrice: 1000,
    });

    expect(result.success).toBe(false);
    expect(result.items).toEqual([{ product: { ...bread.product, stock: 4 }, quantity: 2 }]);
    expect(result.issues).toEqual([
      {
        code: CHECKOUT_ISSUE_CODES.OUT_OF_STOCK,
        productId: 'milk',
        productName: 'Молоко',
        requestedQuantity: 2,
        availableQuantity: 0,
      },
      {
        code: CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
        minOrderPrice: 1000,
      },
    ]);
  });
});
