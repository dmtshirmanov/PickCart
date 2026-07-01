import { productStore } from '_entities/product/model';
import { productService } from '_shared/api/product/service';
import { createProduct } from '../../fixtures/product';

jest.mock('_shared/api/product/service', () => ({
  productService: {
    get: jest.fn(),
  },
}));

const CATALOG_LOAD_ERROR_MESSAGE =
  'Не удалось загрузить каталог. Проверьте подключение и попробуйте снова';

function resetProductStore() {
  productStore.products.clear();
  productStore.stockById.clear();
  productStore.loading = false;
  productStore.refreshing = false;
  productStore.noMoreItems = false;
  productStore.catalogError = undefined;
}

describe('ProductStore', () => {
  beforeEach(() => {
    jest.mocked(productService.get).mockReset();
    resetProductStore();
  });

  test('getStock returns 0 for unknown product', () => {
    expect(productStore.getStock('unknown')).toBe(0);
  });

  test('setStock stores value readable by getStock', () => {
    productStore.setStock('product-1', 4);

    expect(productStore.getStock('product-1')).toBe(4);
  });

  test('waitForHydration resolves after persistence init', async () => {
    await expect(productStore.waitForHydration()).resolves.toBeUndefined();
  });

  test('get loads products and syncs stock from catalog', async () => {
    const products = [createProduct({ id: 'p1', stock: 7 }), createProduct({ id: 'p2', stock: 2 })];
    jest.mocked(productService.get).mockResolvedValue(products);

    await productStore.get();

    expect(productStore.products).toHaveLength(2);
    expect(productStore.getStock('p1')).toBe(7);
    expect(productStore.getStock('p2')).toBe(2);
    expect(productStore.loading).toBe(false);
    expect(productStore.catalogError).toBeUndefined();
  });

  test('get overwrites stock from catalog', async () => {
    const product = createProduct({ id: 'p1', stock: 10 });
    productStore.setStock('p1', 3);
    jest.mocked(productService.get).mockResolvedValue([product]);

    await productStore.get();

    expect(productStore.getStock('p1')).toBe(10);
  });

  test('get sets catalogError on failure', async () => {
    jest.mocked(productService.get).mockRejectedValue(new Error('network'));

    await productStore.get();

    expect(productStore.catalogError).toBe(CATALOG_LOAD_ERROR_MESSAGE);
    expect(productStore.loading).toBe(false);
  });

  test('get sets noMoreItems when page is incomplete', async () => {
    jest.mocked(productService.get).mockResolvedValue([createProduct()]);

    await productStore.get();

    expect(productStore.noMoreItems).toBe(true);
  });

  test('more appends products from next page', async () => {
    const page0 = Array.from({ length: 10 }, (_, index) =>
      createProduct({ id: `p${index}`, stock: index }),
    );
    const page1 = [createProduct({ id: 'p10', stock: 10 })];
    jest.mocked(productService.get).mockResolvedValueOnce(page0).mockResolvedValueOnce(page1);

    await productStore.get();
    await productStore.more();

    expect(productStore.products).toHaveLength(11);
    expect(productStore.getStock('p10')).toBe(10);
    expect(productStore.noMoreItems).toBe(true);
  });

  test('more skips loading when catalog is exhausted', async () => {
    jest.mocked(productService.get).mockResolvedValue([createProduct()]);
    await productStore.get();
    jest.mocked(productService.get).mockClear();

    await productStore.more();

    expect(productService.get).not.toHaveBeenCalled();
  });

  test('refresh reloads catalog', async () => {
    const products = [createProduct({ id: 'p1' })];
    jest.mocked(productService.get).mockResolvedValue(products);

    await productStore.refresh();

    expect(productStore.products).toHaveLength(1);
    expect(productStore.refreshing).toBe(false);
  });
});
