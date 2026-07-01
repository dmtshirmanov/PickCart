import { createProduct } from '__tests__/fixtures/product';
import { render } from '__tests__/util';
import { screen } from '@testing-library/react-native';
import { ProductItem } from '_features/catalogProduct/ui/ProductItem';
import { cartStore } from '_entities/cart/model';
import { reservationStore } from '_entities/order/reservationModel';
import { productStore } from '_entities/product/model';

function resetStores() {
  cartStore.cartLines = {};
  cartStore.highlightedProductIds.clear();
  productStore.products.clear();
  productStore.stockById.clear();
  reservationStore.clearReservation();
}

describe('ProductItem', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    resetStores();
  });

  test('adds product to cart on В корзину press', async () => {
    const product = createProduct({ id: 'p1', stock: 5 });
    productStore.setStock('p1', 5);

    const { user } = await render(<ProductItem product={product} />);

    await user.press(screen.getByText('В корзину'));

    expect(cartStore.isInCart(product)).toBe(true);
    expect(cartStore.getQuantity(product)).toBe(1);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('+')).toBeTruthy();
  });

  test('renders product details', async () => {
    const product = createProduct({
      id: 'p1',
      name: 'Молоко',
      category: 'Молочное',
      price: 120,
      stock: 3,
    });
    productStore.setStock('p1', 3);

    await render(<ProductItem product={product} />);

    expect(screen.getByText('Молоко')).toBeTruthy();
    expect(screen.getByText('Молочное')).toBeTruthy();
    expect(screen.getByText('120 ₽')).toBeTruthy();
    expect(screen.getByText('В наличии: 3')).toBeTruthy();
    expect(screen.getByText('В корзину')).toBeTruthy();
  });

  test('shows disabled Раскупили when out of stock', async () => {
    const product = createProduct({ id: 'p1', stock: 0 });
    productStore.setStock('p1', 0);

    const { user } = await render(<ProductItem product={product} />);

    expect(screen.getAllByText('Раскупили')).toHaveLength(2);
    expect(screen.queryByText('В корзину')).toBeNull();

    await user.press(screen.getAllByText('Раскупили')[1]);

    expect(cartStore.isInCart(product)).toBe(false);
  });

  test('shows QuantityStepper when product is in cart', async () => {
    const product = createProduct({ id: 'p1', stock: 5 });
    productStore.setStock('p1', 5);
    cartStore.add(product);

    await render(<ProductItem product={product} />);

    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.queryByText('В корзину')).toBeNull();
  });

  test('increases quantity via stepper', async () => {
    const product = createProduct({ id: 'p1', stock: 5 });
    productStore.setStock('p1', 5);
    cartStore.add(product);

    const { user } = await render(<ProductItem product={product} />);

    await user.press(screen.getByText('+'));

    expect(cartStore.getQuantity(product)).toBe(2);
    expect(screen.getByText('2')).toBeTruthy();
  });

  test('decreases quantity via stepper', async () => {
    const product = createProduct({ id: 'p1', stock: 5 });
    productStore.setStock('p1', 5);
    cartStore.add(product);
    cartStore.changeQuantity(product, 2);

    const { user } = await render(<ProductItem product={product} />);

    await user.press(screen.getByText('−'));

    expect(cartStore.getQuantity(product)).toBe(1);
    expect(screen.getByText('1')).toBeTruthy();
  });

  test('removes product from cart when quantity reaches zero', async () => {
    const product = createProduct({ id: 'p1', stock: 5 });
    productStore.setStock('p1', 5);
    cartStore.add(product);

    const { user } = await render(<ProductItem product={product} />);

    await user.press(screen.getByText('−'));

    expect(cartStore.isInCart(product)).toBe(false);
    expect(screen.getByText('В корзину')).toBeTruthy();
  });

  test('does not increase above stock via stepper', async () => {
    const product = createProduct({ id: 'p1', stock: 2 });
    productStore.setStock('p1', 2);
    cartStore.add(product);
    cartStore.changeQuantity(product, 2);

    const { user } = await render(<ProductItem product={product} />);

    await user.press(screen.getByText('+'));

    expect(cartStore.getQuantity(product)).toBe(2);
  });
});
