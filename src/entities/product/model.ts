/** @scopeDefault * */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, observable, onBecomeObserved, runInAction } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { productService } from '_shared/api/product/service';
import { Product } from '_shared/api/product/types';

const PAGE_SIZE = 10;
const CATALOG_LOAD_ERROR_MESSAGE =
  'Не удалось загрузить каталог. Проверьте подключение и попробуйте снова';

class ProductStore {
  refreshing = false;
  loading = false;
  products = observable.array<Product>([]);
  stockById = new Map<string, number>();
  noMoreItems = false;
  catalogError?: string = undefined;

  private readonly hydrationPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.hydrationPromise = makePersistable(this, {
      name: 'ProductStore',
      properties: ['stockById'],
      storage: AsyncStorage,
    })
      .then(() => {})
      .catch(() => {});
    onBecomeObserved(this, 'products', () => {
      void this.get();
    });
  }

  async waitForHydration() {
    await this.hydrationPromise;
  }

  getStock(productId: string) {
    return this.stockById.get(productId) || 0;
  }

  setStock(productId: string, stock: number) {
    this.stockById.set(productId, stock);

    const catalogProduct = this.products.find(product => product.id === productId);

    if (catalogProduct) {
      catalogProduct.stock = stock;
    }
  }

  async get() {
    this.loading = true;
    this.catalogError = undefined;

    try {
      const products = await productService.get({ page: 0, limit: PAGE_SIZE });
      runInAction(() => {
        this.products.replace(products);
        products.forEach(({ id, stock }) => {
          this.setStock(id, stock);
        });
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
        products.forEach(({ id, stock }) => {
          this.setStock(id, stock);
        });
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
