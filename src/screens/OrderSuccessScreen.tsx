import { CommonActions, useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Check } from "lucide-react-native";
import { useCallback } from "react";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { NavigatorRoutes, ScreenRoutes, type RootStackParamList } from "_shared/config/routing";
import { Button } from "_shared/ui/Button";

type OrderSuccessScreenProps = NativeStackScreenProps<RootStackParamList, ScreenRoutes.ORDER_SUCCESS>;

/** @scope * */
export function OrderSuccessScreen({ route }: OrderSuccessScreenProps) {
    const navigation = useNavigation();
    const { theme } = useUnistyles();
    const { orderId } = route.params;

    const handleGoHome = useCallback(() => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: NavigatorRoutes.MAIN }],
            }),
        );
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Check color={theme.color.success} size={40} strokeWidth={3} />
                </View>

                <Text style={styles.title}>Спасибо за заказ!</Text>
                <Text style={styles.subtitle}>Скоро мы начнем его обработку</Text>

                <View style={styles.orderCard}>
                    <Text style={styles.orderLabel}>Номер заказа</Text>
                    <Text style={styles.orderNumber}>№{orderId.replace(/\D/g, "") || orderId}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    variant="ghost"
                    title="На главную"
                    style={styles.homeButton}
                    textStyle={styles.homeButtonLabel}
                    onPress={handleGoHome}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create(theme => ({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: theme.offset.content,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.color.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: theme.offset.block,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: theme.color.textPrimary,
        textAlign: "center",
        marginBottom: theme.offset.itemHorizontal,
    },
    subtitle: {
        fontSize: 15,
        color: theme.color.textSecondary,
        textAlign: "center",
        marginBottom: theme.offset.block,
    },
    orderCard: {
        width: "100%",
        backgroundColor: theme.color.surface,
        borderRadius: 12,
        paddingVertical: theme.offset.line,
        paddingHorizontal: theme.offset.content,
        alignItems: "center",
        gap: theme.offset.tiny,
        marginBottom: theme.offset.line,
    },
    orderLabel: {
        fontSize: 13,
        color: theme.color.textSecondary,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: "700",
        color: theme.color.textPrimary,
    },
    footer: {
        paddingHorizontal: theme.offset.content,
        paddingBottom: theme.offset.content,
    },
    homeButton: {
        width: "100%",
        borderWidth: 1,
        borderColor: theme.color.border,
        borderRadius: 12,
        paddingVertical: 16,
        backgroundColor: theme.color.background,
    },
    homeButtonLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.color.textPrimary,
    },
}));
