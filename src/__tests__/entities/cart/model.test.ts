import { cartStore } from '_entities/cart/model';
import { orderStore } from '_entities/order/model';
import { productStore } from '_entities/product/model';
import { CHECKOUT_ISSUE_CODES } from '_shared/api/checkout/types';
import { createOrderProduct, createProduct } from '../../fixtures/product';

function resetCartStore() {
  cartStore.cartLines = {};
  cartStore.highlightedProductIds.clear();
}

function resetProductStore() {
  productStore.products.clear();
  productStore.stockById.clear();
}

describe('CartStore', () => {
  beforeEach(() => {
    resetCartStore();
    resetProductStore();
    orderStore.minOrderPrice = 1000;
  });

  test('add puts product in cart when stock is available', () => {
    const product = createProduct({ id: 'p1', stock: 5 });
    productStore.setStock('p1', 5);

    cartStore.add(product);

    expect(cartStore.isInCart(product)).toBe(true);
    expect(cartStore.getQuantity(product)).toBe(1);
  });

  test('add does nothing when stock is zero', () => {
    const product = createProduct({ id: 'p1', stock: 0 });
    productStore.setStock('p1', 0);

    cartStore.add(product);

    expect(cartStore.isInCart(product)).toBe(false);
  });

  test('changeQuantity clamps to available stock', () => {
    const product = createProduct({ id: 'p1', stock: 3 });
    productStore.setStock('p1', 3);
    cartStore.add(product);

    cartStore.changeQuantity(product, 10);

    expect(cartStore.getQuantity(product)).toBe(3);
  });

  test('changeQuantity removes product at zero quantity', () => {
    const product = createProduct({ id: 'p1', stock: 5 });
    productStore.setStock('p1', 5);
    cartStore.add(product);

    cartStore.changeQuantity(product, 0);

    expect(cartStore.isInCart(product)).toBe(false);
  });

  test('canCheckout depends on min order price', () => {
    const product = createProduct({ id: 'p1', price: 500, stock: 5 });
    productStore.setStock('p1', 5);
    cartStore.add(product);

    expect(cartStore.canCheckout).toBe(false);

    cartStore.changeQuantity(product, 2);

    expect(cartStore.canCheckout).toBe(true);
  });

  test('items reads stock from productStore', () => {
    const product = createProduct({ id: 'p1', stock: 99 });
    productStore.setStock('p1', 4);
    cartStore.add(product);

    expect(cartStore.items[0].product.stock).toBe(4);
  });

  test('applyCheckoutResult syncs cart stock and highlights issues', () => {
    const product = createProduct({ id: 'p1', stock: 5 });
    productStore.setStock('p1', 5);
    cartStore.add(product);

    cartStore.applyCheckoutResult(
      [{ product: createOrderProduct({ id: 'p1', stock: 2, quantity: 2 }), quantity: 2 }],
      [
        {
          code: CHECKOUT_ISSUE_CODES.STOCK_LIMIT_CHANGED,
          productId: 'p1',
          productName: product.name,
          requestedQuantity: 5,
          availableQuantity: 2,
        },
      ],
    );

    expect(cartStore.getQuantity(product)).toBe(2);
    expect(productStore.getStock('p1')).toBe(2);
    expect(cartStore.isHighlighted('p1')).toBe(true);
  });

  test('applyCheckoutResult removes out of stock items', () => {
    const product = createProduct({ id: 'p1', stock: 5 });
    productStore.setStock('p1', 5);
    cartStore.add(product);

    cartStore.applyCheckoutResult(
      [{ product: createOrderProduct({ id: 'p1', stock: 0, quantity: 0 }), quantity: 0 }],
      [
        {
          code: CHECKOUT_ISSUE_CODES.OUT_OF_STOCK,
          productId: 'p1',
          productName: product.name,
          requestedQuantity: 1,
          availableQuantity: 0,
        },
      ],
    );

    expect(cartStore.isInCart(product)).toBe(false);
    expect(productStore.getStock('p1')).toBe(0);
  });
});
