import { StyleSheet } from "react-native-unistyles";
import { lightTheme } from "_shared/config/themes";

interface AppThemes {
  light: typeof lightTheme;
}

declare module "react-native-unistyles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: {
    light: lightTheme,
  },
  settings: {
    initialTheme: "light",
  },
});
