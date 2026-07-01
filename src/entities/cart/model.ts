/** @scopeDefault * */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { orderStore } from '_entities/order/model';
import { Product } from '_shared/api/product/types';

interface CartProduct {
  product: Product;
  quantity: number;
}

class CartStore {
  products = new Map<string, CartProduct>();

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

  getQuantity(product: Product) {
    return this.products.get(product.id)?.quantity ?? 0;
  }

  add(product: Product) {
    this.products.set(product.id, { product, quantity: 1 });
  }

  remove(product: Product) {
    this.products.delete(product.id);
  }

  changeQuantity(product: Product, quantity: number) {
    if (quantity === 0) {
      this.remove(product);
    } else {
      this.products.set(product.id, { product, quantity });
    }
  }

  clear() {
    this.products.clear();
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
    return this.totalPrice >= orderStore.minOrderPrice;
  }

  get remainingToMinOrder() {
    return Math.max(0, orderStore.minOrderPrice - this.totalPrice);
  }
}

export const cartStore = new CartStore();
