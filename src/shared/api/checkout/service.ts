/** @scopeDefault * */
import { simulateResponse } from '../mock/simulateResponse';
import { ORDER_ERROR_CODES, OrderApiError } from '../order/errors';
import { Order, OrderStatus } from '../order/types';
import { createOrderId } from '../order/utils';
import { type CheckoutRequest, type CheckoutResult } from './types';
import { processCheckout } from './utils';

class CheckoutService {
  reserve(request: CheckoutRequest) {
    return new Promise<CheckoutResult>(resolve => {
      setTimeout(() => {
        resolve(processCheckout(request));
      }, 1000);
    });
  }

  releaseReservation(reservationId: string) {
    void reservationId;

    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 400);
    });
  }

  confirm(reservationId: string, data: Omit<Order, 'id' | 'status'>) {
    void reservationId;

    return simulateResponse(
      () => ({
        ...data,
        id: createOrderId(),
        status: OrderStatus.PROCESSING,
      }),
      {
        errors: [
          new OrderApiError(
            ORDER_ERROR_CODES.SERVICE_UNAVAILABLE,
            'Сервис временно недоступен. Попробуйте позже',
          ),
        ],
        failureRate: 0.2,
      },
    );
  }
}

export const checkoutService = new CheckoutService();
