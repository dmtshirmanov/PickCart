import { appInitStore } from '_entities/app-init/model';
import { orderStore } from '_entities/order/model';

function resetAppInitStore() {
  appInitStore.isReady = false;
  appInitStore.isLoading = false;
  appInitStore.error = undefined;
}

describe('AppInitStore', () => {
  beforeEach(() => {
    resetAppInitStore();
    jest.spyOn(orderStore, 'fetchMinOrderPrice').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('init sets isReady when startup tasks succeed', async () => {
    await appInitStore.init();

    expect(appInitStore.isReady).toBe(true);
    expect(appInitStore.isLoading).toBe(false);
    expect(appInitStore.error).toBeUndefined();
  });

  test('init sets error when startup task fails', async () => {
    jest.spyOn(orderStore, 'fetchMinOrderPrice').mockRejectedValue(new Error('network'));

    await appInitStore.init();

    expect(appInitStore.isReady).toBe(false);
    expect(appInitStore.isLoading).toBe(false);
    expect(appInitStore.error).toBe('network');
  });

  test('init sets fallback error when failure is not an Error', async () => {
    jest.spyOn(orderStore, 'fetchMinOrderPrice').mockRejectedValue('timeout');

    await appInitStore.init();

    expect(appInitStore.isReady).toBe(false);
    expect(appInitStore.error).toBe('Не удалось загрузить данные для запуска');
  });
});
