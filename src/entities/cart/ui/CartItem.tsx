import { Trash2 } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { Image, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { cartStore } from '_entities/cart/model';
import { Product } from '_shared/api/product/types';
import { Button } from '_shared/ui/Button';
import { QuantityStepper } from '_shared/ui/QuantityStepper';
import { formatPrice } from '_shared/utils/format';

interface Props {
  product: Product;
  quantity: number;
}

function CartItemComponent({ product, quantity }: Props) {
  const { theme } = useUnistyles();

  const changeQuantity = useCallback(
    (value: number) => {
      cartStore.changeQuantity(product, value);
    },
    [product],
  );

  const remove = useCallback(() => {
    cartStore.remove(product);
  }, [product]);

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={styles.info}>
            <Text style={styles.category} numberOfLines={1}>
              {product.category}
            </Text>
            <Text style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>

          <Button style={styles.deleteButton} onPress={remove}>
            <Trash2 color={theme.color.textSecondary} size={20} />
          </Button>
        </View>

        <QuantityStepper value={quantity} onChange={changeQuantity} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flexDirection: 'row',
    gap: theme.offset.line,
    paddingVertical: theme.offset.itemVertical,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: theme.color.surface,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 64,
    height: 64,
  },
  content: {
    flex: 1,
    gap: theme.offset.line,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.offset.itemHorizontal,
  },
  info: {
    flex: 1,
    gap: theme.offset.tiny,
  },
  category: {
    fontSize: 12,
    color: theme.color.textSecondary,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.color.textPrimary,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.color.textPrimary,
    marginTop: theme.offset.tiny,
  },
  deleteButton: {
    padding: theme.offset.tiny,
  },
}));

/** @scope * */
export const CartItem = observer(CartItemComponent);
