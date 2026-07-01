import { reservationStore } from '_entities/order/reservationModel';
import { checkoutService } from '_shared/api/checkout/service';

jest.mock('_shared/api/checkout/service', () => ({
  checkoutService: {
    releaseReservation: jest.fn(),
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
