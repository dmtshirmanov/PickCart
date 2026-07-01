/** @scopeDefault * */
export enum NavigatorRoutes {
  MAIN = '/main',
}

export enum ScreenRoutes {
  PRODUCTS = '/products',
  CART = '/cart',
  ANALYTICS = '/analytics',
  ORDER_CONFIRMATION = '/order-confirmation',
  ORDER_SUCCESS = '/order-success',
  ERROR = '/error',
}

export enum ErrorPrimaryAction {
  RETRY_CATALOG = 'retry_catalog',
  RETRY_APP_INIT = 'retry_app_init',
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
    primaryAction?: ErrorPrimaryAction;
    secondaryButtonTitle?: string;
    returnToCartOnSecondary?: boolean;
  };
}

export type RootStackParamList = ScreensWithParams &
  Omit<Record<NavigatorRoutes | ScreenRoutes, undefined>, keyof ScreensWithParams> &
  Record<string, undefined>;

export type TabBarParamList = Pick<
  RootStackParamList,
  ScreenRoutes.PRODUCTS | ScreenRoutes.CART | ScreenRoutes.ANALYTICS
>;
