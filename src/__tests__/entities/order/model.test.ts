import { analyticsStore } from '_entities/analytics/model';
import { cartStore } from '_entities/cart/model';
import { orderStore } from '_entities/order/model';
import { reservationStore } from '_entities/order/reservationModel';
import { productStore } from '_entities/product/model';
import { checkoutService } from '_shared/api/checkout/service';
import { CHECKOUT_ISSUE_CODES } from '_shared/api/checkout/types';
import { OrderStatus } from '_shared/api/order/types';
import { createOrderProduct, createProduct } from '../../fixtures/product';

jest.mock('_shared/api/checkout/service', () => ({
  checkoutService: {
    reserve: jest.fn(),
    releaseReservation: jest.fn().mockResolvedValue(undefined),
    confirm: jest.fn(),
  },
}));

jest.mock('_entities/analytics/model', () => ({
  analyticsStore: {
    reportEvent: jest.fn(),
  },
}));

function resetCartStore() {
  cartStore.cartLines = {};
  cartStore.highlightedProductIds.clear();
}

function resetProductStore() {
  productStore.products.clear();
  productStore.stockById.clear();
}

function resetOrderStore() {
  orderStore.checkoutIssues = [];
  orderStore.checkoutIssuesVisible = false;
  orderStore.minOrderPriceNotice = undefined;
  orderStore.minOrderPrice = 1000;
  orderStore.checkoutLoading = false;
  orderStore.loading = false;
}

function resetReservationStore() {
  reservationStore.clearReservation();
}

function seedCart(product = createProduct({ id: 'p1', price: 500, stock: 5 })) {
  productStore.setStock(product.id, product.stock);
  cartStore.add(product);
  cartStore.changeQuantity(product, 2);

  return product;
}

describe('OrderStore', () => {
  beforeEach(() => {
    jest.mocked(checkoutService.reserve).mockReset();
    jest.mocked(checkoutService.confirm).mockReset();
    jest.mocked(analyticsStore.reportEvent).mockReset();
    resetCartStore();
    resetProductStore();
    resetOrderStore();
    resetReservationStore();
  });

  test('checkout creates reservation on success', async () => {
    const product = seedCart();
    const reservation = { id: 'reservation-1', expiresAt: Date.now() + 30 * 60 * 1000 };
    jest.mocked(checkoutService.reserve).mockResolvedValue({
      success: true,
      issues: [],
      items: [
        { product: createOrderProduct({ id: product.id, stock: 5, quantity: 2 }), quantity: 2 },
      ],
      minOrderPrice: 1000,
      reservation,
    });

    const result = await orderStore.checkout();

    expect(result?.success).toBe(true);
    expect(reservationStore.hasReservation).toBe(true);
    expect(reservationStore.reservation).toEqual(reservation);
    expect(orderStore.checkoutIssuesVisible).toBe(false);
  });

  test('checkout shows issues on failure', async () => {
    seedCart();
    jest.mocked(checkoutService.reserve).mockResolvedValue({
      success: false,
      issues: [
        {
          code: CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
          minOrderPrice: 1500,
        },
      ],
      items: [],
      minOrderPrice: 1500,
    });

    const result = await orderStore.checkout();

    expect(result?.success).toBe(false);
    expect(reservationStore.hasReservation).toBe(false);
    expect(orderStore.checkoutIssuesVisible).toBe(true);
    expect(orderStore.minOrderPriceNotice).toBe('Минимальная сумма заказа изменилась');
  });

  test('checkout skips when reservation already exists', async () => {
    reservationStore.setReservation({
      id: 'reservation-1',
      expiresAt: Date.now() + 30 * 60 * 1000,
    });
    seedCart();

    const result = await orderStore.checkout();

    expect(result).toBeUndefined();
    expect(checkoutService.reserve).not.toHaveBeenCalled();
  });

  test('confirmOrder clears cart and reservation on success', async () => {
    const product = seedCart();
    reservationStore.setReservation({
      id: 'reservation-1',
      expiresAt: Date.now() + 30 * 60 * 1000,
    });
    jest.mocked(checkoutService.confirm).mockResolvedValue({
      id: 'order-1',
      products: [{ ...product, quantity: 2 }],
      totalPrice: 1000,
      options: orderStore.normalizedOptions,
      status: OrderStatus.PROCESSING,
    });

    const result = await orderStore.confirmOrder({
      products: [{ ...product, quantity: 2 }],
      totalPrice: 1000,
      options: orderStore.normalizedOptions,
    });

    expect(result).toEqual({
      order: {
        id: 'order-1',
        products: [{ ...product, quantity: 2 }],
        totalPrice: 1000,
        options: orderStore.normalizedOptions,
        status: OrderStatus.PROCESSING,
      },
    });
    expect(cartStore.totalItems).toBe(0);
    expect(reservationStore.hasReservation).toBe(false);
  });

  test('confirmOrder returns expired when reservation is missing', async () => {
    const result = await orderStore.confirmOrder({
      products: [],
      totalPrice: 0,
      options: orderStore.normalizedOptions,
    });

    expect(result).toEqual({ expired: true });
    expect(checkoutService.confirm).not.toHaveBeenCalled();
  });
});
