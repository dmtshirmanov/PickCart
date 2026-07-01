export enum NavigatorRoutes {
    MAIN = "/main",
}

export enum ScreenRoutes {
    PRODUCTS = "/products",
    CART = "/cart",
    ORDER_CONFIRMATION = "/order-confirmation",
    ORDER_OPTIONS = "/order-options",
}

export type RootStackParamList = Record<NavigatorRoutes | ScreenRoutes, undefined>;

export type TabBarParamList = Pick<RootStackParamList, ScreenRoutes.PRODUCTS | ScreenRoutes.CART>;
