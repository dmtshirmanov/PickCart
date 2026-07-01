import { orderService } from "_shared/api/order/service";
import { ORDER_ERROR_CODES, OrderApiError } from "_shared/api/order/errors";
import { Order } from "_shared/api/order/types";
import { makeAutoObservable, runInAction } from "mobx";

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
    deliveryAddress = undefined;
    deliveryDate = undefined;
    phone = undefined;
    minOrderPrice = 0;

    constructor() {
        makeAutoObservable(this);
        this.fetchMinOrderPrice();
    }

    async fetchMinOrderPrice() {
        const price = await orderService.getMinOrderPrice();

        runInAction(() => {
            this.minOrderPrice = price;
        });
    }

    async createOrder(data: Omit<Order, "id" | "status">) {
        try {
            this.loading = true;
            return await orderService.create(data);
        } catch (error) {
            if (error instanceof OrderApiError) {
                switch (error.code) {
                    case ORDER_ERROR_CODES.MIN_ORDER_AMOUNT:
                        await this.fetchMinOrderPrice();
                        break;
                    default:
                        console.log(error);
                        break;
                }
            }
        } finally {
            this.loading = false;
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
}

export const orderStore = new OrderStore();
