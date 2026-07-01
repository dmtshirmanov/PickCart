import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { cartStore } from '_entities/cart/model';
import { Product } from '_shared/api/product/types';
import { Button, ButtonVariant } from '_shared/ui/Button';
import { Image } from '_shared/ui/Image';
import { QuantityStepper } from '_shared/ui/QuantityStepper';
import { formatPrice } from '_shared/utils/format';

interface Props {
  product: Product;
}

/** @scope * */
export const ProductItem = observer(ProductItemComponent);

function ProductItemComponent({ product }: Props) {
  const add = useCallback(() => {
    cartStore.add(product);
  }, [product]);

  const changeQuantity = useCallback(
    (quantity: number) => {
      cartStore.changeQuantity(product, quantity);
    },
    [product],
  );

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image uri={product.image} />
      </View>

      <View style={styles.info}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>

          {cartStore.isInCart(product) ? (
            <QuantityStepper value={cartStore.getQuantity(product)} onChange={changeQuantity} />
          ) : (
            <Button variant={ButtonVariant.Secondary} title="В корзину" onPress={add} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: theme.offset.line,
    paddingVertical: theme.offset.itemVertical,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: theme.color.surface,
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    gap: theme.offset.tiny,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.offset.tiny,
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
  },
}));
