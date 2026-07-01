/** @scopeDefault * */
import type { OrderOptionKey } from '_shared/api/order/options';

export enum AnalyticsEvent {
  CHECKOUT_STATE_CHANGED = 'checkout_state_changed',
  CHECKOUT_TAPPED = 'checkout_tapped',
  CHECKOUT_CONTINUED = 'checkout_continued',
  CHECKOUT_FAILED = 'checkout_failed',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  ORDER_SUBMITTED = 'order_submitted',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_FAILED = 'order_failed',
  ORDER_RESERVATION_EXPIRED = 'order_reservation_expired',
}

export interface AnalyticsProductItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CheckoutStatePayload {
  products: Array<AnalyticsProductItem>;
  options: Record<OrderOptionKey, boolean>;
  totalPrice: number;
}

export interface ReservationEventPayload extends CheckoutStatePayload {
  reservationId: string;
}

export interface AnalyticsCheckoutIssue {
  code: string;
  message: string;
}

export interface CheckoutFailedPayload extends CheckoutStatePayload {
  issues: Array<AnalyticsCheckoutIssue>;
}

export interface AnalyticsEventPayload {
  [AnalyticsEvent.CHECKOUT_STATE_CHANGED]: CheckoutStatePayload;
  [AnalyticsEvent.CHECKOUT_TAPPED]: CheckoutStatePayload;
  [AnalyticsEvent.CHECKOUT_CONTINUED]: ReservationEventPayload;
  [AnalyticsEvent.CHECKOUT_FAILED]: CheckoutFailedPayload;
  [AnalyticsEvent.RESERVATION_CANCELLED]: ReservationEventPayload;
  [AnalyticsEvent.ORDER_SUBMITTED]: CheckoutStatePayload;
  [AnalyticsEvent.ORDER_CONFIRMED]: {
    orderId: string;
    totalPrice: number;
  };
  [AnalyticsEvent.ORDER_FAILED]: {
    errorCode: string;
    message: string;
  } & CheckoutStatePayload;
  [AnalyticsEvent.ORDER_RESERVATION_EXPIRED]: CheckoutStatePayload;
}

export interface AnalyticsEventRequest<T extends AnalyticsEvent = AnalyticsEvent> {
  event: T;
  payload: AnalyticsEventPayload[T];
  timestamp: number;
}

export enum AnalyticsDeliveryStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface AnalyticsLogEntry {
  id: string;
  event: AnalyticsEvent;
  payload: AnalyticsEventPayload[AnalyticsEvent];
  timestamp: number;
  status: AnalyticsDeliveryStatus;
  errorMessage?: string;
}
