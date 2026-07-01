/** @scopeDefault * */
import { simulateResponse } from '../mock/simulateResponse';
import { Order, OrderStatus } from './types';
import { createOrderErrors, createOrderId } from './utils';

export const MIN_ORDER_AMOUNT = 1000;

class OrderService {
  create(data: Omit<Order, 'id' | 'status'>) {
    return simulateResponse(
      () => ({
        ...data,
        id: createOrderId(),
        status: OrderStatus.CONFIRMED,
      }),
      { errors: createOrderErrors(data, MIN_ORDER_AMOUNT) },
    );
  }

  getMinOrderPrice() {
    return new Promise<number>(resolve => {
      setTimeout(() => {
        resolve(MIN_ORDER_AMOUNT);
      }, 1000);
    });
  }
}

export const orderService = new OrderService();
