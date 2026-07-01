/** @scopeDefault * */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { analyticsStore } from '_entities/analytics/model';
import { cartStore } from '_entities/cart/model';
import { reservationStore } from '_entities/order/reservationModel';
import { productStore } from '_entities/product/model';
import { AnalyticsEvent, type CheckoutStatePayload } from '_shared/api/analytics/types';
import { formatCheckoutIssueMessage } from '_shared/api/checkout/format';
import { checkoutService } from '_shared/api/checkout/service';
import { CHECKOUT_ISSUE_CODES, type CheckoutIssue } from '_shared/api/checkout/types';
import { OrderApiError } from '_shared/api/order/errors';
import { orderService } from '_shared/api/order/service';
import { Order, ORDER_OPTION_LABELS, type OrderOptionKey } from '_shared/api/order/types';

export { ORDER_OPTION_LABELS, type OrderOptionKey } from '_shared/api/order/types';

export interface OrderOption {
  key: OrderOptionKey;
  label: (typeof ORDER_OPTION_LABELS)[OrderOptionKey];
  enabled: boolean;
}

class OrderStore {
  loading = false;
  checkoutLoading = false;
  minOrderPriceNotice?: string = undefined;
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
      properties: ['options'],
      storage: AsyncStorage,
    })
      .then(() => {})
      .catch(error => {
        console.error('[OrderStore] persistence failed', error);
      });
  }

  async waitForHydration() {
    await this.hydrationPromise;
  }

  async fetchMinOrderPrice() {
    const price = await orderService.getMinOrderPrice();

    runInAction(() => {
      this.minOrderPrice = price;
    });
  }

  async checkout() {
    if (reservationStore.hasReservation) {
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
          reservationStore.clearReservation();
          this.checkoutIssues = result.issues;
          this.checkoutIssuesVisible = true;
          this.reportCheckoutFailed(result.issues);

          if (
            result.issues.some(
              issue => issue.code === CHECKOUT_ISSUE_CODES.MIN_ORDER_AMOUNT_CHANGED,
            )
          ) {
            this.minOrderPriceNotice = 'Минимальная сумма заказа изменилась';
          }

          return;
        }

        if (result.reservation) {
          reservationStore.setReservation(result.reservation);
        }

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

  async handleReservationExpired() {
    await reservationStore.handleReservationExpired();

    runInAction(() => {
      this.checkoutIssues = [];
      this.checkoutIssuesVisible = false;
    });
  }

  async confirmOrder(data: Omit<Order, 'id' | 'status'>) {
    if (!reservationStore.hasReservation || !reservationStore.reservation) {
      analyticsStore.reportEvent(AnalyticsEvent.ORDER_RESERVATION_EXPIRED, this.checkoutSnapshot);
      await this.handleReservationExpired();
      return { expired: true as const };
    }

    const checkoutSnapshot = this.checkoutSnapshot;
    const reservationId = reservationStore.reservation.id;

    analyticsStore.reportEvent(AnalyticsEvent.ORDER_SUBMITTED, checkoutSnapshot);

    try {
      this.loading = true;
      const order = await checkoutService.confirm(reservationId, data);
      cartStore.clear();

      runInAction(() => {
        reservationStore.clearReservation();
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

  private reportCheckoutFailed(issues: Array<CheckoutIssue>) {
    analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_FAILED, {
      ...this.checkoutSnapshot,
      issues: issues.map(issue => ({
        code: issue.code,
        message: formatCheckoutIssueMessage(issue),
      })),
    });
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
    const cartLines = Object.values(cartStore.cartLines);

    return {
      products: cartLines.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        quantity,
        price: product.price,
      })),
      options: this.normalizedOptions,
      totalPrice: cartLines.reduce(
        (sum, { product, quantity }) => sum + product.price * quantity,
        0,
      ),
    };
  }
}

export const orderStore = new OrderStore();
