import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect } from 'react';
import { RefreshControl, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ProductItem } from '_features/catalogProduct/ui/ProductItem';
import { productStore } from '_entities/product/model';
import { Product } from '_shared/api/product/types';
import {
  ErrorPrimaryAction,
  RootStackParamList,
  ScreenRoutes,
  type TabBarParamList,
} from '_shared/config/routing';
import { Loader } from '_shared/ui/Loader';
import { Separator } from '_shared/ui/Separator';

type ProductsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabBarParamList, ScreenRoutes.PRODUCTS>,
  NativeStackNavigationProp<RootStackParamList>
>;

/** @scope * */
export const ProductsScreen = observer(ProductsScreenComponent);

function ProductsScreenComponent() {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const { products, loading, refreshing, catalogError } = productStore;

  useEffect(() => {
    if (!catalogError) {
      return;
    }

    navigation.navigate(ScreenRoutes.ERROR, {
      headerTitle: 'Ошибка загрузки',
      title: 'Не удалось загрузить каталог',
      message: catalogError,
      primaryButtonTitle: 'Повторить',
      primaryAction: ErrorPrimaryAction.RETRY_CATALOG,
    });
  }, [catalogError, navigation]);

  const handleLoadMore = useCallback(() => {
    productStore.more();
  }, []);

  const renderItem = useCallback(({ item }: { item: Product }) => {
    return <ProductItem product={item} />;
  }, []);

  const renderSeparator = useCallback(() => {
    return <Separator style={styles.separator} />;
  }, []);

  const handleRefresh = useCallback(() => {
    productStore.refresh();
  }, []);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <View style={styles.container}>
      {loading && products.length === 0 && !refreshing && (
        <View style={styles.loaderContainer} testID="products-initial-loader">
          <Loader size={60} style={styles.loader} />
        </View>
      )}
      <FlashList
        testID="products-list"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        style={styles.list}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        data={products.slice()}
        extraData={products.length}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={renderSeparator}
        ListFooterComponent={
          loading && products.length > 0 ? (
            <View testID="products-footer-loader">
              <Loader size={40} style={styles.loader} />
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.color.background,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.offset.content,
  },
  separator: {
    marginVertical: theme.offset.tiny,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    alignSelf: 'center',
  },
}));
