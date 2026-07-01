import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { match } from 'ts-pattern';
import { analyticsStore } from '_entities/analytics/model';
import { cartStore } from '_entities/cart/model';
import { CartItem } from '_entities/cart/ui/CartItem';
import { useReservationCountdown } from '_entities/order/lib/useReservationCountdown';
import { orderStore } from '_entities/order/model';
import { reservationStore } from '_entities/order/reservationModel';
import { AnalyticsEvent } from '_shared/api/analytics/types';
import { RootStackParamList, ScreenRoutes, type TabBarParamList } from '_shared/config/routing';
import { Button, ButtonSize, ButtonVariant } from '_shared/ui/Button';
import { CheckoutIssuesModal } from '_shared/ui/CheckoutIssuesModal';
import { ReservationBanner } from '_shared/ui/ReservationBanner';
import { Separator } from '_shared/ui/Separator';
import { formatItemsCount, formatPrice } from '_shared/utils/format';

type CartScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabBarParamList, ScreenRoutes.CART>,
  NativeStackNavigationProp<RootStackParamList>
>;

/** @scope * */
export const CartScreen = observer(CartScreenComponent);

function CartScreenComponent() {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const isFocused = useIsFocused();
  const { items, totalItems, totalPrice, canCheckout, remainingToMinOrder, highlightedProductIds } =
    cartStore;
  const { minOrderPriceNotice, checkoutLoading, checkoutIssues, checkoutIssuesVisible } =
    orderStore;
  const { hasReservation, reservation } = reservationStore;
  const reservationCountdown = useReservationCountdown({ enabled: isFocused });
  const isEmpty = items.length === 0;

  const checkoutButtonTitle = match({ checkoutLoading, hasReservation })
    .with({ checkoutLoading: true }, () => 'Бронируем...')
    .with({ hasReservation: true }, () => 'Продолжить оформление')
    .otherwise(() => 'Оформить заказ');

  const handleCheckout = useCallback(async () => {
    if (reservationStore.hasReservation) {
      const { reservation } = reservationStore;

      if (reservation) {
        analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_CONTINUED, {
          reservationId: reservation.id,
          ...orderStore.checkoutSnapshot,
        });
      }

      navigation.navigate(ScreenRoutes.ORDER_CONFIRMATION);
      return;
    }

    analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_TAPPED, orderStore.checkoutSnapshot);

    const result = await orderStore.checkout();

    if (result?.success) {
      navigation.navigate(ScreenRoutes.ORDER_CONFIRMATION);
    }
  }, [navigation]);

  const handleDismissMinOrderPriceNotice = useCallback(() => {
    orderStore.clearMinOrderPriceNotice();
  }, []);

  const handleCancelReservation = useCallback(() => {
    reservationStore.cancelReservation();
  }, []);

  const handleCloseCheckoutIssues = useCallback(() => {
    orderStore.hideCheckoutIssues();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof items)[number] }) => {
      return (
        <CartItem
          product={item.product}
          quantity={item.quantity}
          highlighted={highlightedProductIds.has(item.product.id)}
        />
      );
    },
    [highlightedProductIds],
  );

  const renderSeparator = useCallback(() => {
    return <Separator style={styles.separator} />;
  }, []);

  const keyExtractor = useCallback((item: (typeof items)[number]) => item.product.id, []);

  return (
    <View style={styles.container}>
      <CheckoutIssuesModal
        visible={checkoutIssuesVisible}
        issues={checkoutIssues}
        onClose={handleCloseCheckoutIssues}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Корзина</Text>
        {!isEmpty && <Text style={styles.subtitle}>{formatItemsCount(totalItems)}</Text>}
      </View>

      {hasReservation && reservation && (
        <ReservationBanner countdown={reservationCountdown} onCancel={handleCancelReservation} />
      )}

      {minOrderPriceNotice && (
        <View style={styles.noticeBlock}>
          <Text style={styles.noticeText}>{minOrderPriceNotice}</Text>
          <Pressable onPress={handleDismissMinOrderPriceNotice} hitSlop={8}>
            <Text style={styles.noticeDismiss}>Закрыть</Text>
          </Pressable>
        </View>
      )}

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.emptySubtitle}>Добавьте товары из каталога</Text>
        </View>
      ) : (
        <>
          <FlashList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={items}
            extraData={`${totalItems}-${highlightedProductIds.size}`}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={renderSeparator}
          />

          {!canCheckout && (
            <View style={styles.remainingBlock}>
              <Text style={styles.remainingHint}>
                До минимального заказа не хватает {formatPrice(remainingToMinOrder)}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <View style={styles.totalBlock}>
              <Text style={styles.totalLabel}>Сумма заказа</Text>
              <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
            </View>

            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Compact}
              title={checkoutButtonTitle}
              onPress={handleCheckout}
              disabled={hasReservation ? checkoutLoading : !canCheckout || checkoutLoading}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.color.background,
  },
  header: {
    paddingHorizontal: theme.offset.content,
    paddingTop: theme.offset.content,
    paddingBottom: theme.offset.line,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.color.textSecondary,
    marginTop: theme.offset.tiny,
  },
  noticeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.offset.itemHorizontal,
    marginHorizontal: theme.offset.content,
    marginBottom: theme.offset.line,
    paddingHorizontal: theme.offset.content,
    paddingVertical: theme.offset.itemHorizontal,
    backgroundColor: theme.color.warningLight,
    borderRadius: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: theme.color.textPrimary,
  },
  noticeDismiss: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.color.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.offset.content,
  },
  separator: {
    marginVertical: theme.offset.tiny,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.offset.content,
    gap: theme.offset.itemHorizontal,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.color.textPrimary,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.color.textSecondary,
    textAlign: 'center',
  },
  remainingBlock: {
    paddingHorizontal: theme.offset.content,
    paddingVertical: theme.offset.itemHorizontal,
    backgroundColor: theme.color.surfaceMuted,
    borderTopWidth: 1,
    borderTopColor: theme.color.divider,
  },
  remainingHint: {
    fontSize: 12,
    color: theme.color.textSecondary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.offset.content,
    paddingVertical: theme.offset.content,
    borderTopWidth: 1,
    borderTopColor: theme.color.divider,
    gap: theme.offset.line,
  },
  totalBlock: {
    flex: 1,
    gap: theme.offset.tiny,
  },
  totalLabel: {
    fontSize: 13,
    color: theme.color.textSecondary,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },
}));
