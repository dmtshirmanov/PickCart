import { StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function Separator({ style }: Props) {
  return <View style={[styles.separator, style]} />;
}

const styles = StyleSheet.create(theme => ({
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: theme.color.separator,
  },
}));
