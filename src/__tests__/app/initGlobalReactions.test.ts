import { act } from '@testing-library/react-native';
import { runInAction } from 'mobx';
import { analyticsStore } from '_entities/analytics/model';
import { cartStore } from '_entities/cart/model';
import { orderStore } from '_entities/order/model';
import { productStore } from '_entities/product/model';
import { AnalyticsEvent } from '_shared/api/analytics/types';
import { productService } from '_shared/api/product/service';
import { initGlobalReactions } from '../../app/initGlobalReactions';
import { createProduct } from '../fixtures/product';

jest.mock('_shared/api/product/service', () => ({
  productService: {
    get: jest.fn(),
  },
}));

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
    jest.mocked(productService.get).mockReset();
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

  test('does not send CHECKOUT_STATE_CHANGED when catalog pagination loads', async () => {
    const page0 = Array.from({ length: 10 }, (_, index) =>
      createProduct({ id: `p${index}`, price: 100 + index, stock: 5 }),
    );
    const page1 = [createProduct({ id: 'p10', price: 200, stock: 3 })];
    const cartProduct = createProduct({ id: 'p1', price: 500, stock: 5 });

    productStore.setStock('p1', 5);
    cartStore.add(cartProduct);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    jest.mocked(analyticsStore.reportEvent).mockReset();

    jest.mocked(productService.get).mockResolvedValueOnce(page0).mockResolvedValueOnce(page1);

    await productStore.get();
    await productStore.more();

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(analyticsStore.reportEvent).not.toHaveBeenCalled();
  });
});
