import { formatReservationCountdown } from '_entities/order/lib/checkoutFormatting';

describe('formatReservationCountdown', () => {
  test('shows remaining time', () => {
    const now = 1_000_000;

    expect(formatReservationCountdown(now + 30 * 60 * 1000, now)).toBe('30:00');
    expect(formatReservationCountdown(now + 5 * 60 * 1000 + 7 * 1000, now)).toBe('05:07');
    expect(formatReservationCountdown(now + 42 * 1000, now)).toBe('00:42');
  });

  test('shows zero when expired', () => {
    const now = 1_000_000;

    expect(formatReservationCountdown(now, now)).toBe('00:00');
    expect(formatReservationCountdown(now - 1000, now)).toBe('00:00');
  });
});
