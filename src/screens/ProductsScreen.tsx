import { Product } from "_shared/api/product/types";
import { productStore } from "_entities/product/model";
import { ProductItem } from "_entities/product/ui/ProductItem";
import { Separator } from "_shared/ui/Separator";
import { FlashList } from "@shopify/flash-list";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import { RefreshControl, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Loader } from "_shared/ui/Loader";

/** @scope * */
export const ProductsScreen = observer(ProductsScreenComponent);

function ProductsScreenComponent() {
    const { products, loading, refreshing, refresh } = productStore;

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
    }, [refresh]);

    const keyExtractor = useCallback((item: Product) => item.id, []);

    return (
        <View style={styles.container}>
            {loading && products.length === 0 && !refreshing && (
                <View style={styles.loaderContainer}>
                    <Loader size={60} style={styles.loader} />
                </View>
            )}
            <FlashList
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
                ListFooterComponent={() =>
                    loading && products.length > 0 ? <Loader size={40} style={styles.loader} /> : null
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
        justifyContent: "center",
        alignItems: "center",
    },
    loader: {
        alignSelf: "center",
        justifyContent: "center",
    },
}));
