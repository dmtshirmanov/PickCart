import { render } from '__tests__/util';
import { screen } from '@testing-library/react-native';
import { orderStore } from '_entities/order/model';
import { OrderOptionsSection } from '_entities/order/ui/OrderOptionsSection';

function resetOrderStore() {
  orderStore.options = {
    leaveAtTheDoor: false,
    callForDelivery: false,
    checkCompleteness: false,
  };
}

describe('OrderOptionsSection', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    resetOrderStore();
  });

  test('renders all order options', async () => {
    await render(<OrderOptionsSection />);

    expect(screen.getByText('Опции заказа')).toBeTruthy();
    expect(screen.getByText('Оставить у двери')).toBeTruthy();
    expect(screen.getByText('Позвонить по доставке')).toBeTruthy();
    expect(screen.getByText('Проверить комплектность')).toBeTruthy();
  });

  test('toggles option on press', async () => {
    const { user } = await render(<OrderOptionsSection />);

    expect(orderStore.options.leaveAtTheDoor).toBe(false);

    await user.press(screen.getByText('Оставить у двери'));

    expect(orderStore.options.leaveAtTheDoor).toBe(true);
  });

  test('toggles option off on second press', async () => {
    orderStore.options.leaveAtTheDoor = true;

    const { user } = await render(<OrderOptionsSection />);

    await user.press(screen.getByText('Оставить у двери'));

    expect(orderStore.options.leaveAtTheDoor).toBe(false);
  });
});
