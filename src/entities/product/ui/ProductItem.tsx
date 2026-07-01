import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { match } from 'ts-pattern';
import { cartStore } from '_entities/cart/model';
import { orderStore } from '_entities/order/model';
import { productStore } from '_entities/product/model';
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
  const stock = productStore.getStock(product.id);
  const isOutOfStock = stock === 0;
  const inCart = cartStore.isInCart(product);
  const quantity = cartStore.getQuantity(product);

  const add = useCallback(() => {
    orderStore.runCartMutation(() => {
      if (stock > 0) {
        cartStore.add(product);
      }
    });
  }, [product, stock]);

  const changeQuantity = useCallback(
    (value: number) => {
      orderStore.runCartMutation(() => {
        cartStore.changeQuantity(product, value);
      });
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
        <Text style={isOutOfStock ? styles.outOfStock : styles.stock}>
          {isOutOfStock ? 'Раскупили' : `В наличии: ${stock}`}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>

          {match({ inCart, isOutOfStock })
            .with({ inCart: true }, () => (
              <QuantityStepper value={quantity} max={stock} onChange={changeQuantity} />
            ))
            .with({ isOutOfStock: true }, () => (
              <Button variant={ButtonVariant.Secondary} title="Раскупили" disabled />
            ))
            .otherwise(() => (
              <Button variant={ButtonVariant.Secondary} title="В корзину" onPress={add} />
            ))}
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
  stock: {
    fontSize: 12,
    color: theme.color.textSecondary,
  },
  outOfStock: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.color.error,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },
}));
