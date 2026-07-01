/** @scopeDefault * */
import { OrderProduct } from '../order/types';

export const CHECKOUT_ISSUE_CODES = {
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  STOCK_LIMIT_CHANGED: 'STOCK_LIMIT_CHANGED',
  MIN_ORDER_AMOUNT_CHANGED: 'MIN_ORDER_AMOUNT_CHANGED',
} as const;

export type CheckoutIssueCode = (typeof CHECKOUT_ISSUE_CODES)[keyof typeof CHECKOUT_ISSUE_CODES];

export interface CheckoutIssue {
  code: CheckoutIssueCode;
  productId?: string;
  productName?: string;
  requestedQuantity?: number;
  availableQuantity?: number;
  minOrderPrice?: number;
}

export interface CheckoutCartItem {
  product: OrderProduct;
  quantity: number;
}

export interface CheckoutReservation {
  id: string;
  expiresAt: number;
}

export interface CheckoutRequest {
  items: Array<CheckoutCartItem>;
  totalPrice: number;
  minOrderPrice: number;
}

export interface CheckoutResult {
  success: boolean;
  issues: Array<CheckoutIssue>;
  items: Array<CheckoutCartItem>;
  minOrderPrice: number;
  reservation?: CheckoutReservation;
}
