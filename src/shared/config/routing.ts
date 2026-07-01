export enum NavigatorRoutes {
    MAIN = "/main",
}

export enum ScreenRoutes {
    PRODUCTS = "/products",
    CART = "/cart",
    ORDER_CONFIRMATION = "/order-confirmation",
    ORDER_OPTIONS = "/order-options",
    ORDER_SUCCESS = "/order-success",
    ERROR = "/error",
}

export interface ScreensWithParams {
    [ScreenRoutes.ORDER_SUCCESS]: {
        orderId: string;
    };
    [ScreenRoutes.ERROR]: {
        title: string;
        message: string;
        headerTitle?: string;
        errorCode?: string;
        primaryButtonTitle?: string;
        secondaryButtonTitle?: string;
        returnToCartOnSecondary?: boolean;
    };
}

export type RootStackParamList = ScreensWithParams &
    Omit<Record<NavigatorRoutes | ScreenRoutes, undefined>, keyof ScreensWithParams> &
    Record<string, undefined>;

export type TabBarParamList = Pick<RootStackParamList, ScreenRoutes.PRODUCTS | ScreenRoutes.CART>;
