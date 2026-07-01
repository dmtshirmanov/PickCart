/** @scopeDefault * */
const MIN_ORDER_PRICE = 1000;
const MAX_ORDER_PRICE = 2000;

function getRandomMinOrderPrice() {
  return Math.floor(Math.random() * (MAX_ORDER_PRICE - MIN_ORDER_PRICE + 1)) + MIN_ORDER_PRICE;
}

class OrderService {
  getMinOrderPrice() {
    return new Promise<number>(resolve => {
      setTimeout(() => {
        resolve(getRandomMinOrderPrice());
      }, 1000);
    });
  }
}

export const orderService = new OrderService();
