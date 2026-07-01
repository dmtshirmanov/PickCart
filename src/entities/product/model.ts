/** @scopeDefault * */
import { makeAutoObservable, observable, onBecomeObserved, runInAction } from 'mobx';
import { productService } from '_shared/api/product/service';
import { Product } from '_shared/api/product/types';

const PAGE_SIZE = 10;
const CATALOG_LOAD_ERROR_MESSAGE =
  'Не удалось загрузить каталог. Проверьте подключение и попробуйте снова';

class ProductStore {
  refreshing = false;
  loading = false;
  products = observable.array<Product>([]);
  noMoreItems = false;
  catalogError?: string = undefined;

  constructor() {
    makeAutoObservable(this);
    onBecomeObserved(this, 'products', () => {
      this.get();
    });
  }

  async get() {
    this.loading = true;
    this.catalogError = undefined;

    try {
      const products = await productService.get({ page: 0, limit: PAGE_SIZE });
      runInAction(() => {
        this.products.replace(products);
        this.noMoreItems = products.length < PAGE_SIZE;
        this.catalogError = undefined;
      });
    } catch {
      runInAction(() => {
        this.catalogError = CATALOG_LOAD_ERROR_MESSAGE;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async more() {
    if (this.loading || this.noMoreItems) {
      return;
    }

    this.loading = true;

    try {
      const products = await productService.get({
        page: Math.floor(this.products.length / PAGE_SIZE),
        limit: PAGE_SIZE,
      });
      runInAction(() => {
        this.products.replace([...this.products, ...products]);
        this.noMoreItems = products.length < PAGE_SIZE;
      });
    } catch {
      runInAction(() => {
        this.catalogError = CATALOG_LOAD_ERROR_MESSAGE;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async refresh() {
    this.refreshing = true;
    this.noMoreItems = false;

    try {
      await this.get();
    } finally {
      runInAction(() => {
        this.refreshing = false;
      });
    }
  }
}

export const productStore = new ProductStore();
