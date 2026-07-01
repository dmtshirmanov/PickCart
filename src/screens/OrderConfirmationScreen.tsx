import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { cartStore } from '_entities/cart/model';
import { useReservationCountdown } from '_entities/order/lib/useReservationCountdown';
import { orderStore } from '_entities/order/model';
import { reservationStore } from '_entities/order/reservationModel';
import { OrderItem } from '_entities/order/ui/OrderItem';
import { OrderOptionsSection } from '_entities/order/ui/OrderOptionsSection';
import { ScreenRoutes, type RootStackParamList } from '_shared/config/routing';
import { Button, ButtonVariant } from '_shared/ui/Button';
import { ReservationBanner } from '_shared/ui/ReservationBanner';
import { Separator } from '_shared/ui/Separator';
import { formatPrice } from '_shared/utils/format';

type OrderConfirmationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  ScreenRoutes.ORDER_CONFIRMATION
>;

/** @scope * */
export const OrderConfirmationScreen = observer(OrderConfirmationScreenComponent);

function OrderConfirmationScreenComponent() {
  const navigation = useNavigation<OrderConfirmationNavigationProp>();
  const isFocused = useIsFocused();
  const { items, totalItems, totalPrice } = cartStore;
  const { normalizedOptions, loading } = orderStore;
  const { hasReservation, reservation } = reservationStore;

  const reservationCountdown = useReservationCountdown({
    enabled: isFocused,
    onExpired: () => navigation.goBack(),
  });

  useFocusEffect(
    useCallback(() => {
      if (!reservationStore.hasReservation) {
        navigation.goBack();
      }
    }, [navigation]),
  );

  const handleConfirmOrder = useCallback(async () => {
    const result = await orderStore.confirmOrder({
      products: items.map(({ product, quantity }) => ({
        ...product,
        quantity,
      })),
      totalPrice,
      options: normalizedOptions,
    });

    if (result?.order) {
      navigation.replace(ScreenRoutes.ORDER_SUCCESS, {
        orderId: result.order.id,
      });
      return;
    }

    if (result?.expired) {
      navigation.goBack();
      return;
    }

    if (result?.error) {
      navigation.navigate(ScreenRoutes.ERROR, {
        headerTitle: 'Ошибка оформления заказа',
        title: 'Не удалось оформить заказ',
        message: result.error.message,
        secondaryButtonTitle: 'Вернуться в корзину',
        returnToCartOnSecondary: true,
      });
    }
  }, [items, navigation, normalizedOptions, totalPrice]);

  const handleCancelReservation = useCallback(() => {
    reservationStore.cancelReservation().then(() => {
      navigation.goBack();
    });
  }, [navigation]);

  const keyExtractor = useCallback((item: (typeof items)[number]) => item.product.id, []);

  const renderItem = useCallback(({ item }: { item: (typeof items)[number] }) => {
    return <OrderItem product={item.product} quantity={item.quantity} />;
  }, []);

  if (!hasReservation || !reservation) {
    return;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Проверьте детали заказа</Text>

      <ReservationBanner countdown={reservationCountdown} onCancel={handleCancelReservation} />

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

      <OrderOptionsSection />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Итого</Text>
          <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
        </View>

        <Button
          variant={ButtonVariant.Primary}
          title={loading ? 'Оформляем...' : 'Подтвердить заказ'}
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
    paddingVertical: theme.offset.content,
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
    fontWeight: '700',
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
  footer: {
    paddingHorizontal: theme.offset.content,
    paddingVertical: theme.offset.content,
    borderTopWidth: 1,
    borderTopColor: theme.color.divider,
    gap: theme.offset.line,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color.textPrimary,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },
}));
