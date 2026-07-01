import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { analyticsStore } from "_entities/analytics/model";
import { cartStore } from "_entities/cart/model";
import { ORDER_OPTION_ICONS } from "_entities/order/lib/orderOptionVisuals";
import { orderStore, type OrderOption } from "_entities/order/model";
import { OrderItem } from "_entities/order/ui/OrderItem";
import { ScreenRoutes, type RootStackParamList } from "_shared/config/routing";
import { AnalyticsEvent } from "_shared/api/analytics/types";
import { Button } from "_shared/ui/Button";
import { Separator } from "_shared/ui/Separator";
import { formatPrice } from "_shared/utils/format";

const optionIcons = ORDER_OPTION_ICONS;

type OrderConfirmationNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    ScreenRoutes.ORDER_CONFIRMATION
>;

/** @scope * */
export const OrderConfirmationScreen = observer(OrderConfirmationScreenComponent);

function OrderConfirmationScreenComponent() {
    const navigation = useNavigation<OrderConfirmationNavigationProp>();
    const { theme } = useUnistyles();
    const { items, totalItems, totalPrice } = cartStore;
    const { activeOptions, options, courierComment, loading } = orderStore;

    const handleConfirmOrder = useCallback(async () => {
        const result = await orderStore.createOrder({
            products: items.map(({ product }) => product),
            totalPrice,
            options,
            courierComment: courierComment || undefined,
        });

        if (result?.order) {
            navigation.replace(ScreenRoutes.ORDER_SUCCESS, {
                orderId: result.order.id,
            });
            return;
        }

        if (result?.error) {
            navigation.navigate(ScreenRoutes.ERROR, {
                headerTitle: "Ошибка оформления заказа",
                title: "Не удалось оформить заказ",
                message: result.error.message,
                secondaryButtonTitle: "Вернуться в корзину",
                returnToCartOnSecondary: true,
            });
        }
    }, [courierComment, items, navigation, options, totalPrice]);

    const handleEditOptions = useCallback(() => {
        analyticsStore.reportEvent(AnalyticsEvent.ORDER_OPTIONS_OPENED, orderStore.checkoutSnapshot);
        navigation.navigate(ScreenRoutes.ORDER_OPTIONS);
    }, [navigation]);

    const keyExtractor = useCallback((item: (typeof items)[number]) => item.product.id, []);

    const renderItem = useCallback(({ item }: { item: (typeof items)[number] }) => {
        return <OrderItem product={item.product} quantity={item.quantity} />;
    }, []);

    const renderOption = useCallback(
        (option: OrderOption) => {
            const Icon = optionIcons[option.key];

            return (
                <View key={option.key} style={styles.optionRow}>
                    <Icon color={theme.color.textSecondary} size={18} />
                    <Text style={styles.optionLabel}>{option.label}</Text>
                </View>
            );
        },
        [theme.color.textSecondary],
    );

    return (
        <View style={styles.container}>
            <Text style={styles.subtitle}>Проверьте детали заказа</Text>

            <View style={styles.productsSection}>
                <Text style={[styles.sectionTitle, styles.productsSectionTitle]}>
                    Товары ({totalItems})
                </Text>

                <FlashList
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    data={items}
                    extraData={totalItems}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <Separator style={styles.separator} />}
                />
            </View>

            <View style={styles.optionsSection}>
                <View style={styles.optionsHeader}>
                    <Text style={styles.sectionTitle}>Опции заказа</Text>
                    <Pressable onPress={handleEditOptions} hitSlop={8}>
                        <Text style={styles.editOptionsLink}>Изменить</Text>
                    </Pressable>
                </View>
                {activeOptions.length > 0 && (
                    <View style={styles.optionsCard}>{activeOptions.map(renderOption)}</View>
                )}
            </View>

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Итого</Text>
                    <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
                </View>

                <Button
                    variant="primary"
                    title={loading ? "Оформляем..." : "Подтвердить заказ"}
                    disabled={loading}
                    onPress={handleConfirmOrder}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create(theme => ({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
        paddingTop: theme.offset.content,
    },
    subtitle: {
        fontSize: 14,
        color: theme.color.textSecondary,
        paddingHorizontal: theme.offset.content,
        paddingBottom: theme.offset.line,
    },
    productsSection: {
        flex: 1,
        paddingHorizontal: theme.offset.content,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: theme.color.textPrimary,
    },
    productsSectionTitle: {
        marginBottom: theme.offset.line,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: theme.offset.line,
    },
    separator: {
        marginVertical: 0,
    },
    optionsSection: {
        paddingHorizontal: theme.offset.content,
        paddingTop: theme.offset.line,
        paddingBottom: theme.offset.line,
        borderTopWidth: 1,
        borderTopColor: theme.color.divider,
    },
    optionsHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: theme.offset.line,
    },
    editOptionsLink: {
        fontSize: 15,
        fontWeight: "500",
        color: theme.color.primary,
    },
    optionsCard: {
        backgroundColor: theme.color.surface,
        borderRadius: 12,
        padding: theme.offset.content,
        gap: theme.offset.line,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.offset.itemHorizontal,
    },
    optionLabel: {
        flex: 1,
        fontSize: 15,
        color: theme.color.textPrimary,
    },
    footer: {
        paddingHorizontal: theme.offset.content,
        paddingVertical: theme.offset.content,
        borderTopWidth: 1,
        borderTopColor: theme.color.divider,
        gap: theme.offset.line,
    },
    totalRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.color.textPrimary,
    },
    totalPrice: {
        fontSize: 22,
        fontWeight: "700",
        color: theme.color.textPrimary,
    },
}));
