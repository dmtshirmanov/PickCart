import { analyticsStore } from '_entities/analytics/model';
import { orderStore } from '_entities/order/model';
import { reservationStore } from '_entities/order/reservationModel';
import { AnalyticsEvent } from '_shared/api/analytics/types';
import { checkoutService } from '_shared/api/checkout/service';

jest.mock('_shared/api/checkout/service', () => ({
  checkoutService: {
    releaseReservation: jest.fn(),
  },
}));

jest.mock('_entities/analytics/model', () => ({
  analyticsStore: {
    reportEvent: jest.fn(),
  },
}));

function createReservation(expiresAt = Date.now() + 30 * 60 * 1000) {
  return {
    id: 'reservation-1',
    expiresAt,
  };
}

function resetReservationStore() {
  reservationStore.clearReservation();
}

describe('ReservationStore', () => {
  beforeEach(() => {
    jest.mocked(checkoutService.releaseReservation).mockReset();
    jest.mocked(checkoutService.releaseReservation).mockResolvedValue(undefined);
    jest.mocked(analyticsStore.reportEvent).mockReset();
    resetReservationStore();
  });

  test('hasReservation is true for active reservation', () => {
    reservationStore.setReservation(createReservation());

    expect(reservationStore.hasReservation).toBe(true);
  });

  test('hasReservation is false when reservation expired', () => {
    reservationStore.setReservation(createReservation(Date.now() - 1000));

    reservationStore.restorePersistedReservation();

    expect(reservationStore.hasReservation).toBe(false);
    expect(reservationStore.reservation).toBeUndefined();
  });

  test('releaseReservation clears reservation', async () => {
    reservationStore.setReservation(createReservation());

    await reservationStore.releaseReservation();

    expect(checkoutService.releaseReservation).toHaveBeenCalledWith('reservation-1');
    expect(reservationStore.reservation).toBeUndefined();
  });

  test('releaseReservation does nothing without reservation', async () => {
    await reservationStore.releaseReservation();

    expect(checkoutService.releaseReservation).not.toHaveBeenCalled();
    expect(analyticsStore.reportEvent).not.toHaveBeenCalled();
  });

  test('cancelReservation reports analytics and releases reservation', async () => {
    reservationStore.setReservation(createReservation());

    await reservationStore.cancelReservation();

    expect(analyticsStore.reportEvent).toHaveBeenCalledWith(AnalyticsEvent.RESERVATION_CANCELLED, {
      reservationId: 'reservation-1',
      ...orderStore.checkoutSnapshot,
    });
    expect(checkoutService.releaseReservation).toHaveBeenCalledWith('reservation-1');
    expect(reservationStore.reservation).toBeUndefined();
  });

  test('releaseReservation does not report analytics', async () => {
    reservationStore.setReservation(createReservation());

    await reservationStore.releaseReservation();

    expect(analyticsStore.reportEvent).not.toHaveBeenCalled();
  });

  test('runCartMutation runs action when there is no reservation', async () => {
    const action = jest.fn();

    await reservationStore.runCartMutation(action);

    expect(action).toHaveBeenCalled();
  });

  test('ensureCartEditable allows edit when there is no reservation', async () => {
    await expect(reservationStore.ensureCartEditable()).resolves.toBe(true);
  });

  test('handleReservationExpired releases reservation', async () => {
    reservationStore.setReservation(createReservation());

    await reservationStore.handleReservationExpired();

    expect(checkoutService.releaseReservation).toHaveBeenCalledWith('reservation-1');
    expect(reservationStore.reservation).toBeUndefined();
  });
});
