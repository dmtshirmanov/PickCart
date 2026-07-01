import { X } from 'lucide-react-native';
import {
  Pressable,
  TextInput as RNTextInput,
  StyleProp,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface Props extends TextInputProps {
  clearable?: boolean;
  onClear?: () => void;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export function TextInput({
  style,
  containerStyle,
  placeholderTextColor,
  multiline,
  textAlignVertical,
  clearable,
  onClear,
  value,
  ...props
}: Props) {
  const { theme } = useUnistyles();
  const showClearButton = clearable && Boolean(value);

  return (
    <View style={[styles.container, multiline && styles.multilineContainer, containerStyle]}>
      <RNTextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          showClearButton && styles.inputWithClear,
          style,
        ]}
        placeholderTextColor={placeholderTextColor ?? theme.color.textDisabled}
        multiline={multiline}
        textAlignVertical={textAlignVertical ?? (multiline ? 'top' : 'center')}
        value={value}
        {...props}
      />

      {showClearButton && (
        <Pressable
          style={[styles.clearButton, multiline && styles.clearButtonMultiline]}
          onPress={onClear}
          hitSlop={8}
        >
          <X color={theme.color.textSecondary} size={18} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 12,
    backgroundColor: theme.color.background,
  },
  multilineContainer: {
    alignItems: 'flex-end',
  },
  input: {
    paddingHorizontal: theme.offset.content,
    paddingVertical: theme.offset.line,
    fontSize: 15,
    color: theme.color.textPrimary,
  },
  inputWithClear: {
    paddingRight: 40,
  },
  multiline: {
    minHeight: 100,
    width: '100%',
  },
  clearButton: {
    position: 'absolute',
    right: theme.offset.line,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: theme.offset.tiny,
  },
  clearButtonMultiline: {
    top: theme.offset.line,
    bottom: undefined,
    justifyContent: 'flex-start',
  },
}));
