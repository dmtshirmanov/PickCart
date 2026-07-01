import { formatAnalyticsEventSummary } from '_entities/analytics/lib/format';
import {
  AnalyticsDeliveryStatus,
  AnalyticsEvent,
  type AnalyticsLogEntry,
} from '_shared/api/analytics/types';

function createEntry(
  event: AnalyticsEvent,
  payload: AnalyticsLogEntry['payload'],
): AnalyticsLogEntry {
  return {
    id: 'analytics-1',
    event,
    payload,
    timestamp: Date.UTC(2026, 6, 1, 12, 0, 0),
    status: AnalyticsDeliveryStatus.SUCCESS,
  };
}

describe('formatAnalyticsEventSummary', () => {
  test('returns checkout issue messages', () => {
    const summary = formatAnalyticsEventSummary(
      createEntry(AnalyticsEvent.CHECKOUT_FAILED, {
        products: [],
        options: {
          leaveAtTheDoor: false,
          callForDelivery: false,
          checkCompleteness: false,
        },
        totalPrice: 1000,
        issues: [
          {
            code: 'MIN_ORDER_AMOUNT_CHANGED',
            message: 'Минимальная сумма заказа изменилась до 1 500 ₽',
          },
        ],
      }),
    );

    expect(summary).toBe('Минимальная сумма заказа изменилась до 1 500 ₽');
  });

  test('returns order failed message', () => {
    const summary = formatAnalyticsEventSummary(
      createEntry(AnalyticsEvent.ORDER_FAILED, {
        errorCode: 'SERVICE_UNAVAILABLE',
        message: 'Сервис временно недоступен. Попробуйте позже',
        products: [],
        options: {
          leaveAtTheDoor: false,
          callForDelivery: false,
          checkCompleteness: false,
        },
        totalPrice: 1000,
      }),
    );

    expect(summary).toBe('Сервис временно недоступен. Попробуйте позже');
  });
});
