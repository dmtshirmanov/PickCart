import { formatPrice } from '_shared/utils/format';
import { CHECKOUT_ISSUE_CODES, type CheckoutIssue } from './types';

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
