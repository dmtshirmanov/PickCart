import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { cartStore } from '_entities/cart/model';
import { CartItem } from '_entities/cart/ui/CartItem';
import { RootStackParamList, ScreenRoutes, type TabBarParamList } from '_shared/config/routing';
import { Button } from '_shared/ui/Button';
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
  const { items, totalItems, totalPrice, canCheckout, remainingToMinOrder } = cartStore;
  const isEmpty = items.length === 0;

  const handleCheckout = useCallback(() => {
    navigation.navigate(ScreenRoutes.ORDER_CONFIRMATION);
  }, [navigation]);

  const handleConfigureOptions = useCallback(() => {
    navigation.navigate(ScreenRoutes.ORDER_OPTIONS);
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: (typeof items)[number] }) => {
    return <CartItem product={item.product} quantity={item.quantity} />;
  }, []);

  const renderSeparator = useCallback(() => {
    return <Separator style={styles.separator} />;
  }, []);

  const keyExtractor = useCallback((item: (typeof items)[number]) => item.product.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Корзина</Text>
          {!isEmpty && <Text style={styles.subtitle}>{formatItemsCount(totalItems)}</Text>}
        </View>
        {!isEmpty && (
          <Pressable onPress={handleConfigureOptions} hitSlop={8}>
            <Text style={styles.editButton}>Опции заказа</Text>
          </Pressable>
        )}
      </View>

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
            extraData={totalItems}
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
              variant="primary"
              size="compact"
              title="Оформить заказ"
              onPress={handleCheckout}
              disabled={!canCheckout}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  editButton: {
    fontSize: 15,
    fontWeight: '500',
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
