import { ORDER_ERROR_CODES, OrderApiError } from './errors';
import { Order } from './types';

/** @scope * */
export function createOrderId() {
  return `order-${Date.now()}`;
}

export function createOrderErrors(data: Omit<Order, 'id' | 'status'>, minOrderPrice: number) {
  const errors = [
    new OrderApiError(
      ORDER_ERROR_CODES.SERVICE_UNAVAILABLE,
      'Сервис временно недоступен. Попробуйте позже',
    ),
  ];

  if (data.totalPrice < minOrderPrice) {
    errors.push(
      new OrderApiError(ORDER_ERROR_CODES.MIN_ORDER_AMOUNT, 'Минимальная цена заказа изменилась'),
    );
  }

  if (data.products.length > 0) {
    const product = data.products[Math.floor(Math.random() * data.products.length)]!;

    errors.push(
      new OrderApiError(
        ORDER_ERROR_CODES.INSUFFICIENT_STOCK,
        `Недостаточно «${product.name}» на складе`,
      ),
    );
  } else {
    errors.push(
      new OrderApiError(ORDER_ERROR_CODES.INSUFFICIENT_STOCK, 'Недостаточно товаров на складе'),
    );
  }

  return errors;
}
