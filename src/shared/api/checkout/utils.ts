import {
  CHECKOUT_ISSUE_CODES,
  type CheckoutCartItem,
  type CheckoutIssue,
  type CheckoutRequest,
  type CheckoutResult,
} from './types';

const RESERVATION_TTL_MS = 30 * 60 * 1000;
const MIN_ORDER_PRICE = 1000;
const MAX_ORDER_PRICE = 2000;

function getRandomMinOrderPrice() {
  return Math.floor(Math.random() * (MAX_ORDER_PRICE - MIN_ORDER_PRICE + 1)) + MIN_ORDER_PRICE;
}

function simulateAvailableStock(_requested: number, listedStock: number): number {
  if (Math.random() < 0.25) {
    return Math.floor(Math.random() * (listedStock + 1));
  }

  return listedStock;
}

export function processCheckout({ items, minOrderPrice }: CheckoutRequest): CheckoutResult {
  const issues: Array<CheckoutIssue> = [];
  const updatedItems: Array<CheckoutCartItem> = [];

  for (const { product, quantity } of items) {
    const availableStock = simulateAvailableStock(quantity, product.stock);
    const updatedProduct = { ...product, stock: availableStock };

    if (availableStock === 0) {
      issues.push({
        code: CHECKOUT_ISSUE_CODES.OUT_OF_STOCK,
        productId: product.id,
        productName: product.name,
        requestedQuantity: quantity,
        availableQuantity: 0,
      });
      continue;
    }

    if (quantity > availableStock) {
      issues.push({
        code: CHECKOUT_ISSUE_CODES.STOCK_LIMIT_CHANGED,
        productId: product.id,
        productName: product.name,
        requestedQuantity: quantity,
        availableQuantity: availableStock,
      });
      updatedItems.push({ product: updatedProduct, quantity: availableStock });
      continue;
    }

    updatedItems.push({ product: updatedProduct, quantity });
  }

  const nextMinOrderPrice = Math.random() < 0.3 ? getRandomMinOrderPrice() : minOrderPrice;

  const totalPrice = updatedItems.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0,
  );

  if (totalPrice < nextMinOrderPrice) {
    issues.push({
      code: CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
      minOrderPrice: nextMinOrderPrice,
    });
  }

  if (issues.length > 0) {
    return {
      success: false,
      issues,
      items: updatedItems,
      minOrderPrice: nextMinOrderPrice,
    };
  }

  return {
    success: true,
    issues: [],
    items: updatedItems,
    minOrderPrice: nextMinOrderPrice,
    reservation: {
      id: `reservation-${Date.now()}`,
      expiresAt: Date.now() + RESERVATION_TTL_MS,
    },
  };
}
