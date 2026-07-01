import {
  AnalyticsEvent,
  type AnalyticsEventPayload,
  type AnalyticsLogEntry,
} from '_shared/api/analytics/types';

const ANALYTICS_EVENT_LABELS: Record<AnalyticsEvent, string> = {
  [AnalyticsEvent.CHECKOUT_STATE_CHANGED]: 'Изменение корзины',
  [AnalyticsEvent.CHECKOUT_TAPPED]: 'Нажатие «Оформить»',
  [AnalyticsEvent.CHECKOUT_CONTINUED]: 'Продолжение оформления',
  [AnalyticsEvent.CHECKOUT_FAILED]: 'Ошибка бронирования',
  [AnalyticsEvent.RESERVATION_CANCELLED]: 'Отмена брони',
  [AnalyticsEvent.ORDER_SUBMITTED]: 'Отправка заказа',
  [AnalyticsEvent.ORDER_CONFIRMED]: 'Заказ подтверждён',
  [AnalyticsEvent.ORDER_FAILED]: 'Ошибка оформления',
  [AnalyticsEvent.ORDER_RESERVATION_EXPIRED]: 'Бронь истекла',
};

/** @scope * */
export function formatAnalyticsEventLabel(event: AnalyticsEvent) {
  return ANALYTICS_EVENT_LABELS[event];
}

/** @scope * */
export function formatAnalyticsTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** @scope * */
export function formatAnalyticsEventSummary(entry: AnalyticsLogEntry) {
  switch (entry.event) {
    case AnalyticsEvent.CHECKOUT_FAILED: {
      const payload = entry.payload as AnalyticsEventPayload[AnalyticsEvent.CHECKOUT_FAILED];
      return payload.issues.map(issue => issue.message).join(' · ');
    }
    case AnalyticsEvent.ORDER_FAILED: {
      const payload = entry.payload as AnalyticsEventPayload[AnalyticsEvent.ORDER_FAILED];
      return payload.message;
    }
    case AnalyticsEvent.ORDER_RESERVATION_EXPIRED:
      return 'Бронь истекла до подтверждения заказа';
    default:
      return undefined;
  }
}
