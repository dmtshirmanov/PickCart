/** @scopeDefault * */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { orderStore } from '_entities/order/model';
import { productStore } from '_entities/product/model';
import type { CheckoutCartItem, CheckoutIssue } from '_shared/api/checkout/types';
import { Product } from '_shared/api/product/types';

interface CartProduct {
  product: Product;
  quantity: number;
}

class CartStore {
  products = new Map<string, CartProduct>();
  highlightedProductIds = new Set<string>();

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: 'CartStore',
      properties: ['products'],
      storage: AsyncStorage,
    }).catch(() => {});
  }

  isInCart(product: Product) {
    return this.products.has(product.id);
  }

  isHighlighted(productId: string) {
    return this.highlightedProductIds.has(productId);
  }

  getQuantity(product: Product) {
    return this.products.get(product.id)?.quantity ?? 0;
  }

  add(product: Product) {
    if (product.stock <= 0) {
      return;
    }

    productStore.setStock(product.id, product.stock);
    this.products.set(product.id, { product, quantity: 1 });
    this.clearHighlights();
  }

  remove(product: Product) {
    this.products.delete(product.id);
    this.clearHighlights();
  }

  changeQuantity(product: Product, quantity: number) {
    if (quantity <= 0) {
      this.remove(product);
      return;
    }

    const stock = productStore.getStock(product.id);
    const nextQuantity = Math.min(quantity, stock);

    if (nextQuantity <= 0) {
      this.remove(product);
      return;
    }

    this.products.set(product.id, { product, quantity: nextQuantity });
    this.clearHighlights();
  }

  applyCheckoutResult(items: Array<CheckoutCartItem>, issues: Array<CheckoutIssue>) {
    this.products.clear();

    for (const { product, quantity } of items) {
      productStore.setStock(product.id, product.stock);

      if (quantity > 0) {
        this.products.set(product.id, { product, quantity });
      }
    }

    this.highlightedProductIds = new Set(
      issues.flatMap(issue => (issue.productId ? [issue.productId] : [])),
    );
  }

  clearHighlights() {
    this.highlightedProductIds.clear();
  }

  clear() {
    this.products.clear();
    this.clearHighlights();
  }

  get items() {
    return Array.from(this.products.values());
  }

  get totalItems() {
    return this.items.reduce((acc, { quantity }) => acc + quantity, 0);
  }

  get totalPrice() {
    return this.items.reduce((acc, { product, quantity }) => {
      return acc + product.price * quantity;
    }, 0);
  }

  get canCheckout() {
    return this.totalItems > 0 && this.totalPrice >= orderStore.minOrderPrice;
  }

  get remainingToMinOrder() {
    return Math.max(0, orderStore.minOrderPrice - this.totalPrice);
  }
}

export const cartStore = new CartStore();
