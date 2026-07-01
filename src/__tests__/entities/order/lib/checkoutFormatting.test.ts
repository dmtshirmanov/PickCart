import {
  formatCheckoutIssueMessage,
  formatReservationCountdown,
} from '_entities/order/lib/checkoutFormatting';
import { CHECKOUT_ISSUE_CODES } from '_shared/api/checkout/types';

describe('checkoutFormatting', () => {
  test('formatCheckoutIssueMessage for out of stock', () => {
    expect(
      formatCheckoutIssueMessage({
        code: CHECKOUT_ISSUE_CODES.OUT_OF_STOCK,
        productName: 'Молоко',
      }),
    ).toBe('«Молоко» — раскупили, убран из корзины');
  });

  test('formatCheckoutIssueMessage for stock limit', () => {
    expect(
      formatCheckoutIssueMessage({
        code: CHECKOUT_ISSUE_CODES.STOCK_LIMIT_CHANGED,
        productName: 'Хлеб',
        availableQuantity: 2,
      }),
    ).toBe('«Хлеб» — доступно 2 шт., количество уменьшено');
  });

  test('formatCheckoutIssueMessage for min order amount', () => {
    expect(
      formatCheckoutIssueMessage({
        code: CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
        minOrderPrice: 1500,
      }),
    ).toBe(`Минимальная сумма заказа изменилась до ${(1500).toLocaleString('ru-RU')} ₽`);
  });

  test('formatCheckoutIssueMessage for unknown issue', () => {
    expect(
      formatCheckoutIssueMessage({
        code: 'UNKNOWN' as typeof CHECKOUT_ISSUE_CODES.OUT_OF_STOCK,
      }),
    ).toBe('Не удалось забронировать товары');
  });

  test('formatReservationCountdown shows remaining time', () => {
    const now = 1_000_000;

    expect(formatReservationCountdown(now + 30 * 60 * 1000, now)).toBe('30:00');
    expect(formatReservationCountdown(now + 5 * 60 * 1000 + 7 * 1000, now)).toBe('05:07');
    expect(formatReservationCountdown(now + 42 * 1000, now)).toBe('00:42');
  });

  test('formatReservationCountdown shows zero when expired', () => {
    const now = 1_000_000;

    expect(formatReservationCountdown(now, now)).toBe('00:00');
    expect(formatReservationCountdown(now - 1000, now)).toBe('00:00');
  });
});
