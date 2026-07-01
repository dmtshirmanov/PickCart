import { runInAction } from 'mobx';
import { AnalyticsScreen } from '_screens/AnalyticsScreen';
import { analyticsStore } from '_entities/analytics/model';
import {
  AnalyticsDeliveryStatus,
  AnalyticsEvent,
  type AnalyticsLogEntry,
} from '_shared/api/analytics/types';
import { render } from '../util';

function seedLogEntry(overrides: Partial<AnalyticsLogEntry> = {}): AnalyticsLogEntry {
  return {
    id: 'analytics-1',
    event: AnalyticsEvent.CHECKOUT_TAPPED,
    payload: {
      products: [{ id: 'p1', name: 'Товар', quantity: 1, price: 500 }],
      options: {
        leaveAtTheDoor: false,
        callForDelivery: true,
        checkCompleteness: false,
      },
      totalPrice: 500,
    },
    timestamp: Date.UTC(2026, 6, 1, 12, 30, 0),
    status: AnalyticsDeliveryStatus.SUCCESS,
    ...overrides,
  };
}

describe('AnalyticsScreen', () => {
  beforeEach(() => {
    runInAction(() => {
      analyticsStore.log.length = 0;
    });
  });

  test('renders empty state when log is empty', async () => {
    const { getByTestId } = await render(<AnalyticsScreen />);

    expect(getByTestId('analytics-empty')).toBeTruthy();
  });

  test('renders analytics events list', async () => {
    runInAction(() => {
      analyticsStore.log.push(seedLogEntry());
    });

    const { getByTestId, getByText } = await render(<AnalyticsScreen />);

    expect(getByTestId('analytics-list')).toBeTruthy();
    expect(getByText('Нажатие «Оформить»')).toBeTruthy();
    expect(getByText('Успешно')).toBeTruthy();
  });

  test('opens event details modal on item press', async () => {
    runInAction(() => {
      analyticsStore.log.push(
        seedLogEntry({
          event: AnalyticsEvent.ORDER_FAILED,
          payload: {
            errorCode: 'SERVICE_UNAVAILABLE',
            message: 'Сервис временно недоступен. Попробуйте позже',
            products: [{ id: 'p1', name: 'Товар', quantity: 1, price: 500 }],
            options: {
              leaveAtTheDoor: false,
              callForDelivery: true,
              checkCompleteness: false,
            },
            totalPrice: 500,
          },
        }),
      );
    });

    const { getByTestId, getByText, user } = await render(<AnalyticsScreen />);

    expect(getByText('Сервис временно недоступен. Попробуйте позже')).toBeTruthy();

    await user.press(getByTestId('analytics-event-analytics-1'));

    expect(getByText('Закрыть')).toBeTruthy();
    expect(getByText(/"errorCode": "SERVICE_UNAVAILABLE"/)).toBeTruthy();
  });
});
