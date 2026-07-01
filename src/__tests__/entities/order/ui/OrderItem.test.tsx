import { createProduct } from '__tests__/fixtures/product';
import { render } from '__tests__/util';
import { screen } from '@testing-library/react-native';
import { OrderItem } from '_entities/order/ui/OrderItem';

describe('OrderItem', () => {
  test('renders product name and price line', async () => {
    const product = createProduct({ id: 'p1', name: 'Молоко', price: 120 });

    await render(<OrderItem product={product} quantity={2} />);

    expect(screen.getByText('Молоко')).toBeTruthy();
    expect(screen.getByText('120 ₽ × 2')).toBeTruthy();
  });

  test('renders quantity of one', async () => {
    const product = createProduct({ id: 'p1', name: 'Хлеб', price: 50 });

    await render(<OrderItem product={product} quantity={1} />);

    expect(screen.getByText('50 ₽ × 1')).toBeTruthy();
  });
});
