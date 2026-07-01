import { createOrderProduct, createProduct } from '__tests__/fixtures/product';
import { render } from '__tests__/util';
import { screen } from '@testing-library/react-native';
import { CartScreen } from '_screens/CartScreen';
import { analyticsStore } from '_entities/analytics/model';
import { cartStore } from '_entities/cart/model';
import { orderStore } from '_entities/order/model';
import { reservationStore } from '_entities/order/reservationModel';
import { productStore } from '_entities/product/model';
import { AnalyticsEvent } from '_shared/api/analytics/types';
import { checkoutService } from '_shared/api/checkout/service';
import { CHECKOUT_ISSUE_CODES } from '_shared/api/checkout/types';
import { ScreenRoutes } from '_shared/config/routing';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');

  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
      replace: jest.fn(),
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

jest.mock('_shared/api/checkout/service', () => ({
  checkoutService: {
    reserve: jest.fn(),
    releaseReservation: jest.fn().mockResolvedValue(undefined),
    confirm: jest.fn(),
  },
}));

jest.mock('_entities/analytics/model', () => ({
  analyticsStore: {
    reportEvent: jest.fn(),
  },
}));

function resetStores() {
  cartStore.cartLines = {};
  cartStore.highlightedProductIds.clear();
  productStore.products.clear();
  productStore.stockById.clear();
  reservationStore.clearReservation();
  orderStore.checkoutIssues = [];
  orderStore.checkoutIssuesVisible = false;
  orderStore.minOrderPriceNotice = undefined;
  orderStore.minOrderPrice = 1000;
  orderStore.checkoutLoading = false;
  orderStore.loading = false;
}

function seedCheckoutReadyCart(product = createProduct({ id: 'p1', price: 500, stock: 5 })) {
  productStore.setStock(product.id, product.stock);
  cartStore.add(product);
  cartStore.changeQuantity(product, 2);

  return product;
}

describe('CartScreen', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.mocked(checkoutService.reserve).mockReset();
    jest.mocked(analyticsStore.reportEvent).mockReset();
    mockNavigate.mockReset();
    resetStores();
  });

  test('sends CHECKOUT_TAPPED when checkout button is pressed', async () => {
    const product = seedCheckoutReadyCart();
    jest.mocked(checkoutService.reserve).mockResolvedValue({
      success: true,
      issues: [],
      items: [
        { product: createOrderProduct({ id: product.id, stock: 5, quantity: 2 }), quantity: 2 },
      ],
      minOrderPrice: 1000,
      reservation: { id: 'reservation-1', expiresAt: Date.now() + 30 * 60 * 1000 },
    });

    const { user } = await render(<CartScreen />);
    const checkoutSnapshot = orderStore.checkoutSnapshot;

    await user.press(screen.getByText('Оформить заказ'));

    expect(analyticsStore.reportEvent).toHaveBeenCalledWith(
      AnalyticsEvent.CHECKOUT_TAPPED,
      checkoutSnapshot,
    );
    expect(mockNavigate).toHaveBeenCalledWith(ScreenRoutes.ORDER_CONFIRMATION);
  });

  test('shows empty state when cart is empty', async () => {
    await render(<CartScreen />);

    expect(screen.getByText('Корзина пуста')).toBeTruthy();
    expect(screen.getByText('Добавьте товары из каталога')).toBeTruthy();
    expect(screen.queryByText('Оформить заказ')).toBeNull();
  });

  test('renders cart items and total', async () => {
    const product = createProduct({ id: 'p1', name: 'Молоко', price: 500, stock: 5 });
    seedCheckoutReadyCart(product);

    await render(<CartScreen />);

    expect(screen.getByText('Молоко')).toBeTruthy();
    expect(screen.getByText('2 товара')).toBeTruthy();
    expect(screen.getByText('1 000 ₽')).toBeTruthy();
  });

  test('disables checkout below min order amount', async () => {
    const product = createProduct({ id: 'p1', price: 100, stock: 5 });
    productStore.setStock('p1', 5);
    cartStore.add(product);

    const { user } = await render(<CartScreen />);

    expect(screen.getByText(/До минимального заказа не хватает 900 ₽/)).toBeTruthy();

    await user.press(screen.getByText('Оформить заказ'));

    expect(analyticsStore.reportEvent).not.toHaveBeenCalled();
    expect(checkoutService.reserve).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows checkout issues modal on failed checkout', async () => {
    seedCheckoutReadyCart();
    jest.mocked(checkoutService.reserve).mockResolvedValue({
      success: false,
      issues: [
        {
          code: CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
          minOrderPrice: 1500,
        },
      ],
      items: [],
      minOrderPrice: 1500,
    });

    const { user } = await render(<CartScreen />);

    await user.press(screen.getByText('Оформить заказ'));

    expect(analyticsStore.reportEvent).toHaveBeenCalledWith(
      AnalyticsEvent.CHECKOUT_TAPPED,
      expect.objectContaining({ totalPrice: 1000 }),
    );
    expect(screen.getByText('Не удалось забронировать товары')).toBeTruthy();
    expect(screen.getByText(/Минимальная сумма заказа изменилась до 1.+500 ₽/)).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('navigates to confirmation when reservation already exists', async () => {
    seedCheckoutReadyCart();
    reservationStore.setReservation({
      id: 'reservation-1',
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    const { user } = await render(<CartScreen />);

    expect(screen.getByText('Продолжить оформление')).toBeTruthy();

    await user.press(screen.getByText('Продолжить оформление'));

    expect(analyticsStore.reportEvent).not.toHaveBeenCalled();
    expect(checkoutService.reserve).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ScreenRoutes.ORDER_CONFIRMATION);
  });
});
