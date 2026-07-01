import { createProduct } from '__tests__/fixtures/product';
import { render } from '__tests__/util';
import { cleanup, screen, waitFor } from '@testing-library/react-native';
import { OrderConfirmationScreen } from '_screens/OrderConfirmationScreen';
import { analyticsStore } from '_entities/analytics/model';
import { cartStore } from '_entities/cart/model';
import { orderStore } from '_entities/order/model';
import { reservationStore } from '_entities/order/reservationModel';
import { productStore } from '_entities/product/model';
import { AnalyticsEvent } from '_shared/api/analytics/types';
import { checkoutService } from '_shared/api/checkout/service';
import { ORDER_ERROR_CODES, OrderApiError } from '_shared/api/order/errors';
import { OrderStatus } from '_shared/api/order/types';
import { ScreenRoutes } from '_shared/config/routing';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');

  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      replace: mockReplace,
      goBack: mockGoBack,
    }),
    useFocusEffect: (effect: () => void) => {
      effect();
    },
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
  orderStore.options = {
    leaveAtTheDoor: false,
    callForDelivery: false,
    checkCompleteness: false,
  };
}

function seedConfirmationState(
  product = createProduct({ id: 'p1', name: 'Молоко', price: 500, stock: 5 }),
) {
  productStore.setStock(product.id, product.stock);
  cartStore.add(product);
  cartStore.changeQuantity(product, 2);
  reservationStore.setReservation({
    id: 'reservation-1',
    expiresAt: Date.now() + 30 * 60 * 1000,
  });

  return product;
}

describe('OrderConfirmationScreen', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.mocked(checkoutService.confirm).mockReset();
    jest.mocked(checkoutService.releaseReservation).mockReset();
    jest.mocked(checkoutService.releaseReservation).mockResolvedValue(undefined);
    jest.mocked(analyticsStore.reportEvent).mockReset();
    mockNavigate.mockReset();
    mockReplace.mockReset();
    mockGoBack.mockReset();
    resetStores();
  });

  afterEach(async () => {
    await cleanup();
  });

  test('goes back when opened without reservation', async () => {
    await render(<OrderConfirmationScreen />);

    expect(screen.queryByText('Проверьте детали заказа')).toBeNull();
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('renders confirmation details', async () => {
    seedConfirmationState();

    await render(<OrderConfirmationScreen />);

    expect(screen.getByText('Проверьте детали заказа')).toBeTruthy();
    expect(screen.getByText('Товары (2)')).toBeTruthy();
    expect(screen.getByText('Молоко')).toBeTruthy();
    expect(screen.getByText('1 000 ₽')).toBeTruthy();
    expect(screen.getByText('Опции заказа')).toBeTruthy();
    expect(screen.getByText('Подтвердить заказ')).toBeTruthy();
    expect(screen.getByText('Товары забронированы')).toBeTruthy();
  });

  test('confirms order and navigates to success with analytics', async () => {
    const product = seedConfirmationState();
    jest.mocked(checkoutService.confirm).mockResolvedValue({
      id: 'order-1',
      products: [{ ...product, quantity: 2 }],
      totalPrice: 1000,
      options: orderStore.normalizedOptions,
      status: OrderStatus.PROCESSING,
    });

    const { user } = await render(<OrderConfirmationScreen />);
    const checkoutSnapshot = orderStore.checkoutSnapshot;

    await user.press(screen.getByText('Подтвердить заказ'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(ScreenRoutes.ORDER_SUCCESS, {
        orderId: 'order-1',
      });
    });
    expect(analyticsStore.reportEvent).toHaveBeenCalledWith(
      AnalyticsEvent.ORDER_SUBMITTED,
      checkoutSnapshot,
    );
    expect(analyticsStore.reportEvent).toHaveBeenCalledWith(AnalyticsEvent.ORDER_CONFIRMED, {
      orderId: 'order-1',
      totalPrice: 1000,
    });
  });

  test('navigates to error screen on confirm failure with analytics', async () => {
    seedConfirmationState();
    jest
      .mocked(checkoutService.confirm)
      .mockRejectedValue(
        new OrderApiError(ORDER_ERROR_CODES.SERVICE_UNAVAILABLE, 'Сервис недоступен'),
      );

    const { user } = await render(<OrderConfirmationScreen />);
    const checkoutSnapshot = orderStore.checkoutSnapshot;

    await user.press(screen.getByText('Подтвердить заказ'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        ScreenRoutes.ERROR,
        expect.objectContaining({
          headerTitle: 'Ошибка оформления заказа',
          title: 'Не удалось оформить заказ',
          message: 'Сервис недоступен',
          secondaryButtonTitle: 'Вернуться в корзину',
          returnToCartOnSecondary: true,
        }),
      );
    });
    expect(analyticsStore.reportEvent).toHaveBeenCalledWith(
      AnalyticsEvent.ORDER_FAILED,
      expect.objectContaining({
        errorCode: ORDER_ERROR_CODES.SERVICE_UNAVAILABLE,
        message: 'Сервис недоступен',
        ...checkoutSnapshot,
      }),
    );
  });

  test('cancels reservation and goes back', async () => {
    seedConfirmationState();

    const { user } = await render(<OrderConfirmationScreen />);

    await user.press(screen.getByLabelText('Отменить бронь'));

    await waitFor(() => {
      expect(checkoutService.releaseReservation).toHaveBeenCalledWith('reservation-1');
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
