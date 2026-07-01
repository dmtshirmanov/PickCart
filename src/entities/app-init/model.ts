/** @scopeDefault * */
import { makeAutoObservable, runInAction } from 'mobx';
import { orderStore } from '_entities/order/model';
import { productStore } from '_entities/product/model';

type InitTask = {
  name: string;
  run: () => Promise<void>;
};

class AppInitStore {
  isReady = false;
  isLoading = false;
  error?: string = undefined;

  private readonly tasks: Array<InitTask> = [
    {
      name: 'orderStoreHydration',
      run: () => orderStore.waitForHydration(),
    },
    {
      name: 'productStoreHydration',
      run: () => productStore.waitForHydration(),
    },
    {
      name: 'minOrderPrice',
      run: () => orderStore.fetchMinOrderPrice(),
    },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  registerTask(task: InitTask) {
    this.tasks.push(task);
  }

  async init() {
    this.isLoading = true;
    this.error = undefined;

    try {
      await Promise.all(this.tasks.map(task => task.run()));

      runInAction(() => {
        this.isReady = true;
      });
    } catch (error) {
      runInAction(() => {
        this.isReady = false;
        this.error =
          error instanceof Error ? error.message : 'Не удалось загрузить данные для запуска';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

/** @scope * */
export const appInitStore = new AppInitStore();
