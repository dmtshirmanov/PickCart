/** @scopeDefault * */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { Alert } from 'react-native';
import { analyticsStore } from '_entities/analytics/model';
import { cartStore } from '_entities/cart/model';
import { productStore } from '_entities/product/model';
import { AnalyticsEvent, type CheckoutStatePayload } from '_shared/api/analytics/types';
import { checkoutService } from '_shared/api/checkout/service';
import {
  CHECKOUT_ISSUE_CODES,
  type CheckoutIssue,
  type CheckoutReservation,
} from '_shared/api/checkout/types';
import { OrderApiError } from '_shared/api/order/errors';
import { orderService } from '_shared/api/order/service';
import { Order } from '_shared/api/order/types';

export const ORDER_OPTION_LABELS = {
  leaveAtTheDoor: 'Оставить у двери',
  callForDelivery: 'Позвонить по доставке',
  checkCompleteness: 'Проверить комплектность',
} as const;

export type OrderOptionKey = keyof typeof ORDER_OPTION_LABELS;

export interface OrderOption {
  key: OrderOptionKey;
  label: (typeof ORDER_OPTION_LABELS)[OrderOptionKey];
  enabled: boolean;
}

class OrderStore {
  loading = false;
  checkoutLoading = false;
  minOrderPriceNotice?: string = undefined;
  reservation?: CheckoutReservation = undefined;
  checkoutIssues: Array<CheckoutIssue> = [];
  checkoutIssuesVisible = false;
  options: Record<OrderOptionKey, boolean> = {
    leaveAtTheDoor: false,
    callForDelivery: false,
    checkCompleteness: false,
  };
  minOrderPrice = 0;

  private readonly hydrationPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.hydrationPromise = makePersistable(this, {
      name: 'OrderStore',
      properties: ['options', 'reservation'],
      storage: AsyncStorage,
    })
      .then(() => {
        runInAction(() => {
          this.restorePersistedReservation();
        });
      })
      .catch(error => {
        console.error('[OrderStore] persistence failed', error);
      });
  }

  async waitForHydration() {
    await this.hydrationPromise;
  }

  restorePersistedReservation() {
    if (this.reservation && this.isReservationExpired) {
      this.reservation = undefined;
    }
  }

  async fetchMinOrderPrice() {
    const price = await orderService.getMinOrderPrice();

    runInAction(() => {
      this.minOrderPrice = price;
    });
  }

  get hasReservation() {
    return this.reservation !== undefined && !this.isReservationExpired;
  }

  get isReservationExpired() {
    if (!this.reservation) {
      return false;
    }

    return Date.now() >= this.reservation.expiresAt;
  }

  async checkout() {
    if (this.hasReservation) {
      return;
    }

    this.checkoutLoading = true;

    try {
      const result = await checkoutService.reserve({
        items: cartStore.items.map(({ product, quantity }) => {
          const stock = productStore.getStock(product.id);

          return {
            product: { ...product, stock, quantity },
            quantity,
          };
        }),
        totalPrice: cartStore.totalPrice,
        minOrderPrice: this.minOrderPrice,
      });

      runInAction(() => {
        cartStore.applyCheckoutResult(result.items, result.issues);
        this.minOrderPrice = result.minOrderPrice;

        if (!result.success) {
          this.reservation = undefined;
          this.checkoutIssues = result.issues;
          this.checkoutIssuesVisible = true;

          if (
            result.issues.some(
              issue => issue.code === CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
            )
          ) {
            this.minOrderPriceNotice = 'Минимальная сумма заказа изменилась';
          }

          return;
        }

        this.reservation = result.reservation;
        this.checkoutIssues = [];
        this.checkoutIssuesVisible = false;
        this.minOrderPriceNotice = undefined;
      });

      return result;
    } finally {
      runInAction(() => {
        this.checkoutLoading = false;
      });
    }
  }

  hideCheckoutIssues() {
    this.checkoutIssuesVisible = false;
  }

  async releaseReservation() {
    if (!this.reservation) {
      return;
    }

    const reservationId = this.reservation.id;
    await checkoutService.releaseReservation(reservationId);

    runInAction(() => {
      this.reservation = undefined;
    });
  }

  async ensureCartEditable(): Promise<boolean> {
    if (!this.hasReservation) {
      return true;
    }

    return new Promise(resolve => {
      Alert.alert('Отменить бронь?', 'Изменение корзины отменит бронирование товаров.', [
        { text: 'Нет', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Да',
          onPress: () => {
            this.releaseReservation().then(() => resolve(true));
          },
        },
      ]);
    });
  }

  async runCartMutation(action: () => void) {
    const canEdit = await this.ensureCartEditable();

    if (!canEdit) {
      return;
    }

    action();
  }

  async handleReservationExpired() {
    if (!this.reservation) {
      return;
    }

    await this.releaseReservation();

    runInAction(() => {
      this.checkoutIssues = [];
      this.checkoutIssuesVisible = false;
    });

    Alert.alert('Бронь истекла', 'Забронируйте товары заново из корзины.');
  }

  async confirmOrder(data: Omit<Order, 'id' | 'status'>) {
    if (!this.reservation || this.isReservationExpired) {
      await this.handleReservationExpired();
      return { expired: true as const };
    }

    const checkoutSnapshot = this.checkoutSnapshot;
    const reservationId = this.reservation.id;

    analyticsStore.reportEvent(AnalyticsEvent.ORDER_SUBMITTED, checkoutSnapshot);

    try {
      this.loading = true;
      const order = await checkoutService.confirm(reservationId, data);
      cartStore.clear();

      runInAction(() => {
        this.reservation = undefined;
      });

      analyticsStore.reportEvent(AnalyticsEvent.ORDER_CONFIRMED, {
        orderId: order.id,
        totalPrice: data.totalPrice,
      });

      return { order };
    } catch (error) {
      if (error instanceof OrderApiError) {
        analyticsStore.reportEvent(AnalyticsEvent.ORDER_FAILED, {
          errorCode: error.code,
          message: error.message,
          ...checkoutSnapshot,
        });

        return { error };
      }
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  toggleOption(key: OrderOptionKey) {
    this.options[key] = !this.options[key];
  }

  clearMinOrderPriceNotice() {
    this.minOrderPriceNotice = undefined;
  }

  get optionsList(): Array<OrderOption> {
    return (Object.keys(ORDER_OPTION_LABELS) as Array<OrderOptionKey>).map(key => ({
      key,
      label: ORDER_OPTION_LABELS[key],
      enabled: this.normalizedOptions[key],
    }));
  }

  get normalizedOptions(): Record<OrderOptionKey, boolean> {
    return (Object.keys(ORDER_OPTION_LABELS) as Array<OrderOptionKey>).reduce(
      (acc, key) => {
        acc[key] = this.options[key] ?? false;
        return acc;
      },
      {} as Record<OrderOptionKey, boolean>,
    );
  }

  get checkoutSnapshot(): CheckoutStatePayload {
    return {
      products: cartStore.items.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        quantity,
        price: product.price,
      })),
      options: this.normalizedOptions,
      totalPrice: cartStore.totalPrice,
    };
  }
}

export const orderStore = new OrderStore();
