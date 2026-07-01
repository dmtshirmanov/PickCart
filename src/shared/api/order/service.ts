/** @scopeDefault * */
import { simulateResponse } from '../mock/simulateResponse';
import { Order, OrderStatus } from './types';
import { createOrderErrors, createOrderId } from './utils';

const MIN_ORDER_PRICE = 1000;
const MAX_ORDER_PRICE = 2000;

function getRandomMinOrderPrice() {
  return Math.floor(Math.random() * (MAX_ORDER_PRICE - MIN_ORDER_PRICE + 1)) + MIN_ORDER_PRICE;
}

class OrderService {
  create(data: Omit<Order, 'id' | 'status'>) {
    const minOrderPrice = getRandomMinOrderPrice();

    return simulateResponse(
      () => ({
        ...data,
        id: createOrderId(),
        status: OrderStatus.CONFIRMED,
      }),
      { errors: createOrderErrors(data, minOrderPrice) },
    );
  }

  getMinOrderPrice() {
    return new Promise<number>(resolve => {
      setTimeout(() => {
        resolve(getRandomMinOrderPrice());
      }, 1000);
    });
  }
}

export const orderService = new OrderService();
