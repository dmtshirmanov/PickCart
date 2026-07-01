import { Image, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Product } from '_shared/api/product/types';
import { formatPrice } from '_shared/utils/format';

interface Props {
  product: Product;
  quantity: number;
}

/** @scope * */
export function OrderItem({ product, quantity }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.priceLine}>
          {formatPrice(product.price)} × {quantity}
        </Text>
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
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: theme.color.surface,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 44,
    height: 44,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.offset.tiny,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.color.textPrimary,
    lineHeight: 20,
  },
  priceLine: {
    fontSize: 14,
    color: theme.color.textSecondary,
  },
}));
