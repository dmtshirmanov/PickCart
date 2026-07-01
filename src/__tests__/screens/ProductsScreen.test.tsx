import { createProduct } from '__tests__/fixtures/product';
import { render } from '__tests__/util';
import { act, cleanup, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ProductsScreen } from '_screens/ProductsScreen';
import { productStore } from '_entities/product/model';
import { productService } from '_shared/api/product/service';

jest.mock('_shared/api/product/service', () => ({
  productService: {
    get: jest.fn(),
  },
}));

function resetProductStore() {
  productStore.products.clear();
  productStore.stockById.clear();
  productStore.loading = false;
  productStore.refreshing = false;
  productStore.noMoreItems = false;
  productStore.catalogError = undefined;
}

function createPage(count: number, startIndex = 0) {
  return Array.from({ length: count }, (_, index) =>
    createProduct({ id: `p${startIndex + index}`, name: `Product ${startIndex + index}` }),
  );
}

describe('ProductsScreen', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.mocked(productService.get).mockReset();
    resetProductStore();
  });

  afterEach(async () => {
    await cleanup();
  });

  test('shows initial loader while catalog is loading', async () => {
    jest.mocked(productService.get).mockReturnValue(new Promise(() => {}));

    await render(<ProductsScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('products-initial-loader')).toBeTruthy();
    });
  });

  test('renders products after catalog loads', async () => {
    jest
      .mocked(productService.get)
      .mockResolvedValue([createProduct({ id: 'p1', name: 'Молоко' })]);

    await render(<ProductsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Молоко')).toBeTruthy();
    });
    expect(screen.queryByTestId('products-initial-loader')).toBeNull();
    expect(screen.queryByTestId('products-footer-loader')).toBeNull();
  });

  test('pull-to-refresh reloads catalog', async () => {
    jest
      .mocked(productService.get)
      .mockResolvedValue([createProduct({ id: 'p1', name: 'Молоко' })]);

    await render(<ProductsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Молоко')).toBeTruthy();
    });

    jest.mocked(productService.get).mockClear();
    jest.mocked(productService.get).mockResolvedValue([createProduct({ id: 'p2', name: 'Хлеб' })]);

    const list = screen.getByTestId('products-list');
    await act(async () => {
      await list.props.refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(screen.getByText('Хлеб')).toBeTruthy();
    });
    expect(productService.get).toHaveBeenCalledWith({ page: 0, limit: 10 });
  });

  test('load more fetches next page on end reached', async () => {
    const page0 = createPage(10);
    jest.mocked(productService.get).mockResolvedValueOnce(page0);

    await render(<ProductsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Product 0')).toBeTruthy();
    });

    jest
      .mocked(productService.get)
      .mockResolvedValueOnce([createProduct({ id: 'p10', name: 'Product 10' })]);

    await act(async () => {
      fireEvent(screen.getByTestId('products-list'), 'endReached');
    });

    await waitFor(() => {
      expect(productStore.products).toHaveLength(11);
    });
    expect(productService.get).toHaveBeenLastCalledWith({ page: 1, limit: 10 });
    expect(productStore.products[10]?.name).toBe('Product 10');
  });

  test('shows footer loader while loading more', async () => {
    const page0 = createPage(10);
    let resolveMore: (value: ReturnType<typeof createPage>) => void = () => {};

    jest.mocked(productService.get).mockResolvedValueOnce(page0);

    await render(<ProductsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Product 0')).toBeTruthy();
    });

    jest.mocked(productService.get).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveMore = resolve;
        }),
    );

    await act(async () => {
      fireEvent(screen.getByTestId('products-list'), 'endReached');
    });

    await waitFor(() => {
      expect(screen.getByTestId('products-footer-loader')).toBeTruthy();
    });

    await act(async () => {
      resolveMore([createProduct({ id: 'p10', name: 'Product 10' })]);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('products-footer-loader')).toBeNull();
    });
  });
});
