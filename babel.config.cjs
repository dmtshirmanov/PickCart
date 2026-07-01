module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'tsconfig-paths-module-resolver',
    [
      "react-native-unistyles/plugin",
      {
        root: "src",
      },
    ],
    'react-native-worklets/plugin'
  ],
};
