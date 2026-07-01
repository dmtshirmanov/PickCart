import { render } from '__tests__/util';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { screen } from '@testing-library/react-native';
import { ErrorScreen } from '_screens/ErrorScreen';
import { appInitStore } from '_entities/app-init/model';
import { productStore } from '_entities/product/model';
import { ErrorPrimaryAction, RootStackParamList, ScreenRoutes } from '_shared/config/routing';
import { getResetToCartAction } from '_shared/lib/navigation';

const mockGoBack = jest.fn();
const mockDispatch = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');

  return {
    ...actual,
    useNavigation: () => ({
      goBack: mockGoBack,
      dispatch: mockDispatch,
      navigate: jest.fn(),
      replace: jest.fn(),
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

type Props = NativeStackScreenProps<RootStackParamList, ScreenRoutes.ERROR>;

function renderErrorScreen(params: RootStackParamList[ScreenRoutes.ERROR]) {
  const route = {
    key: 'error',
    name: ScreenRoutes.ERROR,
    params,
  } as Props['route'];

  return render(<ErrorScreen route={route} navigation={{} as unknown as Props['navigation']} />);
}

describe('ErrorScreen', () => {
  beforeEach(() => {
    mockGoBack.mockReset();
    mockDispatch.mockReset();
    jest.spyOn(productStore, 'refresh').mockResolvedValue(undefined);
    jest.spyOn(appInitStore, 'init').mockResolvedValue(undefined);
    appInitStore.isReady = true;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders error content with error code', async () => {
    await renderErrorScreen({
      title: 'Ошибка загрузки',
      message: 'Не удалось загрузить каталог',
      errorCode: 'CATALOG_001',
      primaryButtonTitle: 'Повторить',
      primaryAction: ErrorPrimaryAction.RETRY_CATALOG,
    });

    expect(screen.getByText('Ошибка загрузки')).toBeTruthy();
    expect(screen.getByText('Не удалось загрузить каталог')).toBeTruthy();
    expect(screen.getByText('Код ошибки: CATALOG_001')).toBeTruthy();
    expect(screen.getByText('Повторить')).toBeTruthy();
  });

  test('hides error code when not provided', async () => {
    await renderErrorScreen({
      title: 'Ошибка',
      message: 'Что-то пошло не так',
    });

    expect(screen.queryByText(/Код ошибки:/)).toBeNull();
  });

  test('renders secondary button when title is provided', async () => {
    await renderErrorScreen({
      title: 'Ошибка',
      message: 'Что-то пошло не так',
      secondaryButtonTitle: 'В корзину',
    });

    expect(screen.getByText('В корзину')).toBeTruthy();
  });

  test('retries catalog on primary press', async () => {
    const { user } = await renderErrorScreen({
      title: 'Ошибка загрузки',
      message: 'Не удалось загрузить каталог',
      primaryAction: ErrorPrimaryAction.RETRY_CATALOG,
    });

    await user.press(screen.getByText('Повторить'));

    expect(productStore.refresh).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('retries app init and goes back on success', async () => {
    const { user } = await renderErrorScreen({
      title: 'Ошибка запуска',
      message: 'Не удалось инициализировать приложение',
      primaryAction: ErrorPrimaryAction.RETRY_APP_INIT,
    });

    await user.press(screen.getByText('Повторить'));

    expect(appInitStore.init).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('does not go back when app init retry fails', async () => {
    appInitStore.isReady = false;

    const { user } = await renderErrorScreen({
      title: 'Ошибка запуска',
      message: 'Не удалось инициализировать приложение',
      primaryAction: ErrorPrimaryAction.RETRY_APP_INIT,
    });

    await user.press(screen.getByText('Повторить'));

    expect(appInitStore.init).toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  test('goes back on primary press without action', async () => {
    const { user } = await renderErrorScreen({
      title: 'Ошибка',
      message: 'Что-то пошло не так',
    });

    await user.press(screen.getByText('Повторить'));

    expect(productStore.refresh).not.toHaveBeenCalled();
    expect(appInitStore.init).not.toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('resets navigation to cart on secondary press', async () => {
    const { user } = await renderErrorScreen({
      title: 'Ошибка',
      message: 'Что-то пошло не так',
      secondaryButtonTitle: 'В корзину',
      returnToCartOnSecondary: true,
    });

    await user.press(screen.getByText('В корзину'));

    expect(mockDispatch).toHaveBeenCalledWith(getResetToCartAction());
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  test('goes back on secondary press by default', async () => {
    const { user } = await renderErrorScreen({
      title: 'Ошибка',
      message: 'Что-то пошло не так',
      secondaryButtonTitle: 'Закрыть',
    });

    await user.press(screen.getByText('Закрыть'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
