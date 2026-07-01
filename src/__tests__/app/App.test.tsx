import {
  cleanup,
  render as renderRNTL,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import { runInAction } from 'mobx';
import { appInitStore } from '_entities/app-init/model';
import { App } from '../../app/App';

jest.mock('../../app/navigation/Navigation', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Navigation: () => React.createElement(Text, null, 'app-navigation'),
  };
});

jest.mock('_shared/api/product/service', () => ({
  productService: {
    get: jest.fn().mockResolvedValue([]),
  },
}));

function resetAppInitStore() {
  runInAction(() => {
    appInitStore.isReady = false;
    appInitStore.isLoading = false;
    appInitStore.error = undefined;
  });
}

async function renderApp() {
  const user = userEvent.setup();

  return {
    user,
    ...(await renderRNTL(<App />)),
  };
}

describe('App', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    resetAppInitStore();
    jest.spyOn(appInitStore, 'init').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await cleanup();
  });

  test('shows loader while app is initializing', async () => {
    jest.spyOn(appInitStore, 'init').mockImplementation(() => {
      runInAction(() => {
        appInitStore.isLoading = true;
      });

      return new Promise(() => {});
    });

    await renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('app-loader')).toBeTruthy();
    });
  });

  test('shows error screen when init fails', async () => {
    jest.spyOn(appInitStore, 'init').mockImplementation(async () => {
      runInAction(() => {
        appInitStore.isLoading = false;
        appInitStore.error = 'network';
        appInitStore.isReady = false;
      });
    });

    await renderApp();

    await waitFor(() => {
      expect(screen.getByText('Не удалось запустить приложение')).toBeTruthy();
      expect(screen.getByText('network')).toBeTruthy();
    });
  });

  test('retries init from error screen', async () => {
    const init = jest
      .spyOn(appInitStore, 'init')
      .mockImplementationOnce(async () => {
        runInAction(() => {
          appInitStore.isLoading = false;
          appInitStore.error = 'network';
          appInitStore.isReady = false;
        });
      })
      .mockImplementationOnce(async () => {
        runInAction(() => {
          appInitStore.error = undefined;
          appInitStore.isReady = true;
        });
      });

    const { user } = await renderApp();

    await waitFor(() => {
      expect(screen.getByText('Повторить')).toBeTruthy();
    });

    await user.press(screen.getByText('Повторить'));

    expect(init).toHaveBeenCalledTimes(2);
  });

  test('renders navigation when app is ready', async () => {
    runInAction(() => {
      appInitStore.isLoading = false;
      appInitStore.isReady = true;
      appInitStore.error = undefined;
    });
    jest.spyOn(appInitStore, 'init').mockImplementation(async () => {});

    await renderApp();

    await waitFor(() => {
      expect(screen.getByText('app-navigation')).toBeTruthy();
    });
  });
});
