import { runInAction } from 'mobx';
import { analyticsStore } from '_entities/analytics/model';
import { analyticsService } from '_shared/api/analytics/service';
import { AnalyticsDeliveryStatus, AnalyticsEvent } from '_shared/api/analytics/types';

jest.mock('_shared/api/analytics/service', () => ({
  analyticsService: {
    send: jest.fn(),
  },
}));

const checkoutPayload = {
  products: [],
  options: {
    leaveAtTheDoor: false,
    callForDelivery: false,
    checkCompleteness: false,
  },
  totalPrice: 0,
};

async function flushQueue() {
  await Promise.resolve();
  await Promise.resolve();
}

function resetAnalyticsLog() {
  runInAction(() => {
    analyticsStore.log.length = 0;
  });
}

describe('AnalyticsStore', () => {
  beforeEach(() => {
    jest.mocked(analyticsService.send).mockReset();
    jest.mocked(analyticsService.send).mockResolvedValue(undefined);
    resetAnalyticsLog();
  });

  test('reportEvent sends event to analytics service', async () => {
    analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_TAPPED, checkoutPayload);

    await flushQueue();

    expect(analyticsService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        event: AnalyticsEvent.CHECKOUT_TAPPED,
        payload: checkoutPayload,
      }),
    );
  });

  test('reportEvent attaches timestamp to event', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

    analyticsStore.reportEvent(AnalyticsEvent.ORDER_CONFIRMED, {
      orderId: 'order-1',
      totalPrice: 1000,
    });

    await flushQueue();

    expect(analyticsService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        event: AnalyticsEvent.ORDER_CONFIRMED,
        timestamp: 1_000_000,
      }),
    );

    now.mockRestore();
  });

  test('reportEvent processes queued events sequentially', async () => {
    analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_TAPPED, checkoutPayload);
    analyticsStore.reportEvent(AnalyticsEvent.ORDER_SUBMITTED, checkoutPayload);

    await flushQueue();

    expect(analyticsService.send).toHaveBeenCalledTimes(2);
  });

  test('reportEvent continues queue when send fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest
      .mocked(analyticsService.send)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(undefined);

    analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_TAPPED, checkoutPayload);
    analyticsStore.reportEvent(AnalyticsEvent.ORDER_SUBMITTED, checkoutPayload);

    await flushQueue();

    expect(analyticsService.send).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });

  test('reportEvent adds log entry with pending status', () => {
    analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_TAPPED, checkoutPayload);

    expect(analyticsStore.log).toHaveLength(1);
    expect(analyticsStore.log[0]).toMatchObject({
      event: AnalyticsEvent.CHECKOUT_TAPPED,
      payload: checkoutPayload,
      status: AnalyticsDeliveryStatus.PENDING,
    });
  });

  test('reportEvent marks log entry as success after send', async () => {
    analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_TAPPED, checkoutPayload);

    await flushQueue();

    expect(analyticsStore.log[0]?.status).toBe(AnalyticsDeliveryStatus.SUCCESS);
  });

  test('reportEvent marks log entry as failed when send rejects', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.mocked(analyticsService.send).mockRejectedValueOnce(new Error('Сервис недоступен'));

    analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_TAPPED, checkoutPayload);

    await flushQueue();

    expect(analyticsStore.log[0]).toMatchObject({
      status: AnalyticsDeliveryStatus.FAILED,
      errorMessage: 'Сервис недоступен',
    });

    consoleError.mockRestore();
  });

  test('logRevision changes when delivery status updates', async () => {
    analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_TAPPED, checkoutPayload);
    const pendingRevision = analyticsStore.logRevision;

    await flushQueue();

    expect(analyticsStore.logRevision).not.toBe(pendingRevision);
    expect(analyticsStore.log[0]?.status).toBe(AnalyticsDeliveryStatus.SUCCESS);
  });
});
