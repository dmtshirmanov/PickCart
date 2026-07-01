/** @scopeDefault * */
import type { OrderOptionKey } from '_entities/order/model';

export enum AnalyticsEvent {
  CHECKOUT_STATE_CHANGED = 'checkout_state_changed',
  CHECKOUT_TAPPED = 'checkout_tapped',
  ORDER_OPTIONS_OPENED = 'order_options_opened',
  ORDER_SUBMITTED = 'order_submitted',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_FAILED = 'order_failed',
}

export interface AnalyticsProductItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CheckoutStatePayload {
  products: AnalyticsProductItem[];
  options: Record<OrderOptionKey, boolean>;
  totalPrice: number;
}

export interface AnalyticsEventPayload {
  [AnalyticsEvent.CHECKOUT_STATE_CHANGED]: CheckoutStatePayload;
  [AnalyticsEvent.CHECKOUT_TAPPED]: CheckoutStatePayload;
  [AnalyticsEvent.ORDER_OPTIONS_OPENED]: CheckoutStatePayload;
  [AnalyticsEvent.ORDER_SUBMITTED]: CheckoutStatePayload;
  [AnalyticsEvent.ORDER_CONFIRMED]: {
    orderId: string;
    totalPrice: number;
  };
  [AnalyticsEvent.ORDER_FAILED]: {
    errorCode: string;
    message: string;
  } & CheckoutStatePayload;
}

export interface AnalyticsEventRequest<T extends AnalyticsEvent = AnalyticsEvent> {
  event: T;
  payload: AnalyticsEventPayload[T];
  timestamp: number;
}
