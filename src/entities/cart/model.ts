/** @scopeDefault * */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { orderStore } from '_entities/order/model';
import { productStore } from '_entities/product/model';
import type { CheckoutCartItem, CheckoutIssue } from '_shared/api/checkout/types';
import { Product } from '_shared/api/product/types';

class CartStore {
  cartLines: Record<string, { quantity: number; product: Product }> = {};
  highlightedProductIds = new Set<string>();

  private readonly hydrationPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.hydrationPromise = makePersistable(this, {
      name: 'CartStore',
      properties: ['cartLines'],
      storage: AsyncStorage,
    })
      .then(() => {})
      .catch(error => {
        console.error('[CartStore] persistence failed', error);
      });
  }

  async waitForHydration() {
    await this.hydrationPromise;
  }

  isInCart(product: Product) {
    return product.id in this.cartLines;
  }

  isHighlighted(productId: string) {
    return this.highlightedProductIds.has(productId);
  }

  getQuantity(product: Product) {
    return this.cartLines[product.id]?.quantity ?? 0;
  }

  add(product: Product) {
    if (productStore.getStock(product.id) <= 0) {
      return;
    }

    this.cartLines[product.id] = { quantity: 1, product };
    this.clearHighlights();
  }

  remove(product: Product) {
    delete this.cartLines[product.id];
    this.clearHighlights();
  }

  changeQuantity(product: Product, quantity: number) {
    if (quantity <= 0) {
      this.remove(product);
      return;
    }

    const nextQuantity = Math.min(quantity, productStore.getStock(product.id));

    if (nextQuantity <= 0) {
      this.remove(product);
      return;
    }

    this.cartLines[product.id] = { quantity: nextQuantity, product };
    this.clearHighlights();
  }

  applyCheckoutResult(items: Array<CheckoutCartItem>, issues: Array<CheckoutIssue>) {
    const nextCartLines: Record<string, { quantity: number; product: Product }> = {};

    for (const { product, quantity } of items) {
      productStore.setStock(product.id, product.stock);

      if (quantity > 0) {
        nextCartLines[product.id] = { quantity, product };
      }
    }

    this.cartLines = nextCartLines;
    this.highlightedProductIds = new Set(
      issues.flatMap(issue => (issue.productId ? [issue.productId] : [])),
    );
  }

  clearHighlights() {
    this.highlightedProductIds.clear();
  }

  clear() {
    this.cartLines = {};
    this.clearHighlights();
  }

  get items(): Array<{ product: Product; quantity: number }> {
    return Object.values(this.cartLines).map(({ product, quantity }) => ({
      product: this.withStock(product),
      quantity,
    }));
  }

  get totalItems() {
    return Object.values(this.cartLines).reduce((acc, { quantity }) => acc + quantity, 0);
  }

  get totalPrice() {
    return this.items.reduce((acc, { product, quantity }) => acc + product.price * quantity, 0);
  }

  get canCheckout() {
    return this.totalItems > 0 && this.totalPrice >= orderStore.minOrderPrice;
  }

  get remainingToMinOrder() {
    return Math.max(0, orderStore.minOrderPrice - this.totalPrice);
  }

  private withStock(product: Product): Product {
    const stock = productStore.getStock(product.id);
    const fromCatalog = productStore.products.find(item => item.id === product.id);

    return { ...(fromCatalog ?? product), stock };
  }
}

export const cartStore = new CartStore();
