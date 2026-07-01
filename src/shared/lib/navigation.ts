import { CommonActions } from '@react-navigation/native';
import { NavigatorRoutes, ScreenRoutes } from '_shared/config/routing';

/** @scope * */
export function getResetToCartAction() {
  return CommonActions.reset({
    index: 0,
    routes: [
      {
        name: NavigatorRoutes.MAIN,
        state: {
          routes: [{ name: ScreenRoutes.CART }],
          index: 0,
        },
      },
    ],
  });
}
