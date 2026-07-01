import { formatCheckoutIssueMessage } from '_shared/api/checkout/format';
import { CHECKOUT_ISSUE_CODES } from '_shared/api/checkout/types';

describe('formatCheckoutIssueMessage', () => {
  test('formats out of stock issue', () => {
    expect(
      formatCheckoutIssueMessage({
        code: CHECKOUT_ISSUE_CODES.OUT_OF_STOCK,
        productName: 'Молоко',
      }),
    ).toBe('«Молоко» — раскупили, убран из корзины');
  });

  test('formats stock limit issue', () => {
    expect(
      formatCheckoutIssueMessage({
        code: CHECKOUT_ISSUE_CODES.STOCK_LIMIT_CHANGED,
        productName: 'Хлеб',
        availableQuantity: 2,
      }),
    ).toBe('«Хлеб» — доступно 2 шт., количество уменьшено');
  });

  test('formats min order amount issue', () => {
    expect(
      formatCheckoutIssueMessage({
        code: CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
        minOrderPrice: 1500,
      }),
    ).toBe(`Минимальная сумма заказа изменилась до ${(1500).toLocaleString('ru-RU')} ₽`);
  });

  test('formats unknown issue', () => {
    expect(
      formatCheckoutIssueMessage({
        code: 'UNKNOWN' as typeof CHECKOUT_ISSUE_CODES.OUT_OF_STOCK,
      }),
    ).toBe('Не удалось забронировать товары');
  });
});
