import { Pressable, PressableProps, StyleProp, Text, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Ghost = 'ghost',
}

export enum ButtonSize {
  Default = 'default',
  Compact = 'compact',
}

interface Props extends PressableProps {
  children?: React.ReactNode;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  title?: string;
  variant?: ButtonVariant;
}

export function Button({
  children,
  disabled,
  size = ButtonSize.Default,
  style,
  textStyle,
  title,
  variant = ButtonVariant.Ghost,
  ...props
}: Props) {
  return (
    <Pressable
      style={[
        styles.base,
        variant === ButtonVariant.Primary && styles.primary,
        variant === ButtonVariant.Primary && size === ButtonSize.Default && styles.primaryDefault,
        variant === ButtonVariant.Primary && size === ButtonSize.Compact && styles.primaryCompact,
        variant === ButtonVariant.Secondary && styles.secondary,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      {title ? (
        <Text
          style={[
            styles.label,
            variant === ButtonVariant.Primary && size === ButtonSize.Default && styles.primaryLabel,
            variant === ButtonVariant.Primary &&
              size === ButtonSize.Compact &&
              styles.primaryCompactLabel,
            variant === ButtonVariant.Secondary && styles.secondaryLabel,
            textStyle,
          ]}
        >
          {title}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create(theme => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.color.primary,
    borderRadius: 12,
  },
  primaryDefault: {
    paddingVertical: 16,
  },
  primaryCompact: {
    paddingHorizontal: theme.offset.block,
    paddingVertical: 14,
  },
  secondary: {
    backgroundColor: theme.color.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  label: {
    fontWeight: '600',
  },
  primaryLabel: {
    fontSize: 16,
    color: theme.color.onPrimary,
  },
  primaryCompactLabel: {
    fontSize: 15,
    color: theme.color.onPrimary,
  },
  secondaryLabel: {
    fontSize: 13,
    color: theme.color.primary,
  },
  disabled: {
    opacity: 0.5,
  },
}));
