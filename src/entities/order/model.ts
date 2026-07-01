import AsyncStorage from "@react-native-async-storage/async-storage";
import { analyticsStore } from "_entities/analytics/model";
import { cartStore } from "_entities/cart/model";
import { orderService } from "_shared/api/order/service";
import { AnalyticsEvent, type CheckoutStatePayload } from "_shared/api/analytics/types";
import { ORDER_ERROR_CODES, OrderApiError } from "_shared/api/order/errors";
import { Order } from "_shared/api/order/types";
import { makeAutoObservable, runInAction } from "mobx";
import { makePersistable } from "mobx-persist-store";

export const ORDER_OPTION_LABELS = {
    leaveAtTheDoor: "Оставить у двери",
    callForDelivery: "Позвонить по доставке",
    deliveryAtConvenientTime: "Доставка в удобное время",
    doNotCall: "Не звонить",
    checkCompleteness: "Проверить комплектность",
} as const;

export type OrderOptionKey = keyof typeof ORDER_OPTION_LABELS;

export interface OrderOption {
    key: OrderOptionKey;
    label: (typeof ORDER_OPTION_LABELS)[OrderOptionKey];
    enabled: boolean;
}

class OrderStore {
    loading = false;
    options: Record<OrderOptionKey, boolean> = {
        leaveAtTheDoor: false,
        callForDelivery: false,
        deliveryAtConvenientTime: false,
        doNotCall: false,
        checkCompleteness: false,
    };
    courierComment = "";
    minOrderPrice = 0;

    constructor() {
        makeAutoObservable(this);
        makePersistable(this, {
            name: "OrderStore",
            properties: ["options", "courierComment"],
            storage: AsyncStorage,
        }).catch(() => {});
        this.fetchMinOrderPrice();
    }

    async fetchMinOrderPrice() {
        const price = await orderService.getMinOrderPrice();

        runInAction(() => {
            this.minOrderPrice = price;
        });
    }

    async createOrder(data: Omit<Order, "id" | "status">) {
        const checkoutSnapshot = this.checkoutSnapshot;

        analyticsStore.reportEvent(AnalyticsEvent.ORDER_SUBMITTED, checkoutSnapshot);

        try {
            this.loading = true;
            const order = await orderService.create(data);
            cartStore.clear();

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

                if (error.code === ORDER_ERROR_CODES.MIN_ORDER_AMOUNT) {
                    await this.fetchMinOrderPrice();
                }

                return { error };
            }
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    setOption(key: OrderOptionKey, enabled: boolean) {
        this.options[key] = enabled;
    }

    toggleOption(key: OrderOptionKey) {
        this.options[key] = !this.options[key];
    }

    setCourierComment(comment: string) {
        this.courierComment = comment;
    }

    get optionsList(): OrderOption[] {
        return (Object.keys(ORDER_OPTION_LABELS) as OrderOptionKey[]).map(key => ({
            key,
            label: ORDER_OPTION_LABELS[key],
            enabled: this.options[key],
        }));
    }

    get activeOptions(): OrderOption[] {
        return this.optionsList.filter(option => option.enabled);
    }

    get checkoutSnapshot(): CheckoutStatePayload {
        return {
            products: cartStore.items.map(({ product, quantity }) => ({
                id: product.id,
                name: product.name,
                quantity,
                price: product.price,
            })),
            options: { ...this.options },
            courierComment: this.courierComment || undefined,
            totalPrice: cartStore.totalPrice,
        };
    }
}

export const orderStore = new OrderStore();
