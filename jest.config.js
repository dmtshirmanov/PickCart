/** @type {import('jest').Config} */
export default {
  preset: '@react-native/jest-preset',
  clearMocks: true,
  restoreMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['html', 'text', 'text-summary'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/__tests__/**'],
  setupFiles: ['react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  testMatch: ['<rootDir>/src/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    'react-dom': 'react-native',
    '^react-native-worklets$': '<rootDir>/node_modules/react-native-worklets/lib/module/mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native' +
      '|@react-native' +
      '|@react-navigation' +
      '|react-native-unistyles' +
      '|react-native-reanimated' +
      '|react-native-worklets' +
      '|react-native-safe-area-context' +
      '|react-native-screens' +
      '|react-native-gesture-handler' +
      '|react-native-svg' +
      '|@shopify/flash-list' +
      '|lucide-react-native' +
      ')/)',
  ],
};
