import { setUpTests } from 'react-native-reanimated';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import 'react-native-unistyles/mocks';
import '_shared/lib/unitstyles';

jest.mock('mobx-persist-store', () => ({
  makePersistable: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');

  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    State: {},
    Directions: {},
  };
});

jest.mock('@d11/react-native-fast-image', () => {
  const { View } = require('react-native');

  const resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };

  const FastImage = Object.assign(View, {
    resizeMode,
    priority: { low: 'low', normal: 'normal', high: 'high' },
  });

  return {
    __esModule: true,
    default: FastImage,
    resizeMode,
  };
});

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');

  return new Proxy(
    {},
    {
      get: () => View,
    },
  );
});

jest.mock('@react-native-async-storage/async-storage', () => require('./__mocks__/asyncStorage'));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');

  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

jest.mock('@shopify/flash-list', () => {
  const { FlatList } = require('react-native');

  return { FlashList: FlatList };
});

jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(jest.fn());

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

setUpTests();
