import { render } from '__tests__/util';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { screen } from '@testing-library/react-native';
import { OrderSuccessScreen } from '_screens/OrderSuccessScreen';
import { NavigatorRoutes, RootStackParamList, ScreenRoutes } from '_shared/config/routing';

const mockDispatch = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');

  return {
    ...actual,
    useNavigation: () => ({
      dispatch: mockDispatch,
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

type Props = NativeStackScreenProps<RootStackParamList, ScreenRoutes.ORDER_SUCCESS>;

function renderOrderSuccessScreen(orderId = 'order-1') {
  const route = {
    key: 'order-success',
    name: ScreenRoutes.ORDER_SUCCESS,
    params: { orderId },
  } as Props['route'];

  return render(
    <OrderSuccessScreen route={route} navigation={{} as unknown as Props['navigation']} />,
  );
}

describe('OrderSuccessScreen', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  test('renders order success details', async () => {
    await renderOrderSuccessScreen('ORD-42');

    expect(screen.getByText('Спасибо за заказ!')).toBeTruthy();
    expect(screen.getByText('Скоро мы начнем его обработку')).toBeTruthy();
    expect(screen.getByText('Номер заказа')).toBeTruthy();
    expect(screen.getByText('№42')).toBeTruthy();
  });

  test('shows raw order id when it has no digits', async () => {
    await renderOrderSuccessScreen('abc');

    expect(screen.getByText('№abc')).toBeTruthy();
  });

  test('resets navigation to main on На главную press', async () => {
    const { user } = await renderOrderSuccessScreen();

    await user.press(screen.getByText('На главную'));

    expect(mockDispatch).toHaveBeenCalledWith(
      CommonActions.reset({
        index: 0,
        routes: [{ name: NavigatorRoutes.MAIN }],
      }),
    );
  });
});
