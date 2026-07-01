import { Button } from "_shared/ui/Button";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface Props {
    value: number;
    onChange: (value: number) => void;
}

export function QuantityStepper({ value, onChange }: Props) {
    return (
        <View style={styles.container}>
            <Button style={styles.button} onPress={() => onChange(value - 1)}>
                <Text style={styles.symbol}>−</Text>
            </Button>

            <View style={styles.valueWrapper}>
                <Text style={styles.value}>{value}</Text>
            </View>

            <Button style={styles.button} onPress={() => onChange(value + 1)}>
                <Text style={styles.symbol}>+</Text>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create(theme => ({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: theme.color.background,
        alignSelf: "flex-start",
    },
    button: {
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    symbol: {
        fontSize: 18,
        fontWeight: "500",
        color: theme.color.textPrimary,
        lineHeight: 20,
    },
    valueWrapper: {
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: theme.color.border,
    },
    value: {
        fontSize: 15,
        fontWeight: "600",
        color: theme.color.textPrimary,
    },
}));
