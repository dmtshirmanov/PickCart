import {
    Pressable,
    PressableProps,
    StyleProp,
    Text,
    TextStyle,
    ViewStyle,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "compact";

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
    size = "default",
    style,
    textStyle,
    title,
    variant = "ghost",
    ...props
}: Props) {
    return (
        <Pressable
            style={[
                styles.base,
                variant === "primary" && styles.primary,
                variant === "primary" && size === "default" && styles.primaryDefault,
                variant === "primary" && size === "compact" && styles.primaryCompact,
                variant === "secondary" && styles.secondary,
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
                        variant === "primary" && size === "default" && styles.primaryLabel,
                        variant === "primary" && size === "compact" && styles.primaryCompactLabel,
                        variant === "secondary" && styles.secondaryLabel,
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
        alignItems: "center",
        justifyContent: "center",
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
        fontWeight: "600",
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
