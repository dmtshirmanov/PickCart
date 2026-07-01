import { act } from '@testing-library/react-native';
import { runInAction } from 'mobx';
import { analyticsStore } from '_entities/analytics/model';
import { cartStore } from '_entities/cart/model';
import { orderStore } from '_entities/order/model';
import { productStore } from '_entities/product/model';
import { AnalyticsEvent } from '_shared/api/analytics/types';
import { initGlobalReactions } from '../../app/initGlobalReactions';
import { createProduct } from '../fixtures/product';

jest.mock('_entities/analytics/model', () => ({
  analyticsStore: {
    reportEvent: jest.fn(),
  },
}));

function resetStores() {
  runInAction(() => {
    cartStore.cartLines = {};
    cartStore.highlightedProductIds.clear();
    productStore.products.clear();
    productStore.stockById.clear();
    orderStore.options = {
      leaveAtTheDoor: false,
      callForDelivery: false,
      checkCompleteness: false,
    };
  });
}

describe('initGlobalReactions', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    initGlobalReactions();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.mocked(analyticsStore.reportEvent).mockReset();
    resetStores();
  });

  test('skips first cart change and sends CHECKOUT_STATE_CHANGED on next change', async () => {
    const product = createProduct({ id: 'p1', price: 500, stock: 5 });
    productStore.setStock('p1', 5);
    cartStore.add(product);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(analyticsStore.reportEvent).not.toHaveBeenCalled();

    cartStore.changeQuantity(product, 2);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(analyticsStore.reportEvent).toHaveBeenCalledWith(
      AnalyticsEvent.CHECKOUT_STATE_CHANGED,
      orderStore.checkoutSnapshot,
    );
  });
});
