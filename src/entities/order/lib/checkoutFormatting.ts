import { CHECKOUT_ISSUE_CODES, type CheckoutIssue } from '_shared/api/checkout/types';
import { formatPrice } from '_shared/utils/format';

/** @scope * */
export function formatCheckoutIssueMessage(issue: CheckoutIssue): string {
  switch (issue.code) {
    case CHECKOUT_ISSUE_CODES.OUT_OF_STOCK:
      return `«${issue.productName}» — раскупили, убран из корзины`;
    case CHECKOUT_ISSUE_CODES.STOCK_LIMIT_CHANGED:
      return `«${issue.productName}» — доступно ${issue.availableQuantity} шт., количество уменьшено`;
    case CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED:
      return `Минимальная сумма заказа изменилась до ${formatPrice(issue.minOrderPrice ?? 0)}`;
    default:
      return 'Не удалось забронировать товары';
  }
}

/** @scope * */
export function formatReservationCountdown(expiresAt: number, now = Date.now()): string {
  const remainingMs = Math.max(0, expiresAt - now);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
