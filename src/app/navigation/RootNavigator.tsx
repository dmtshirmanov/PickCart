import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ErrorScreen } from '_screens/ErrorScreen';
import { OrderConfirmationScreen } from '_screens/OrderConfirmationScreen';
import { OrderOptionsScreen } from '_screens/OrderOptionsScreen';
import { OrderSuccessScreen } from '_screens/OrderSuccessScreen';
import { TabBarNavigation } from '_widgets/TabBarNavigation';
import { NavigatorRoutes, ScreenRoutes, type RootStackParamList } from '_shared/config/routing';

const { Navigator, Screen } = createNativeStackNavigator<RootStackParamList>();

/** @scope .. */
export function RootNavigator() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Screen
        name={NavigatorRoutes.MAIN}
        component={TabBarNavigation}
        options={{
          headerShown: false,
        }}
      />
      <Screen
        name={ScreenRoutes.ORDER_CONFIRMATION}
        component={OrderConfirmationScreen}
        options={{
          headerShown: true,
          title: 'Подтверждение заказа',
          headerBackTitle: '',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Screen
        name={ScreenRoutes.ORDER_OPTIONS}
        component={OrderOptionsScreen}
        options={{
          headerShown: true,
          title: 'Опции заказа',
          headerBackTitle: '',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Screen
        name={ScreenRoutes.ORDER_SUCCESS}
        component={OrderSuccessScreen}
        options={{
          headerShown: true,
          title: 'Заказ оформлен',
          headerBackTitle: '',
          headerBackButtonDisplayMode: 'minimal',
          gestureEnabled: false,
        }}
      />
      <Screen
        name={ScreenRoutes.ERROR}
        component={ErrorScreen}
        options={({ route }) => ({
          presentation: 'modal',
          headerShown: true,
          title: route.params.headerTitle ?? route.params.title,
          headerBackTitle: '',
          headerBackButtonDisplayMode: 'minimal',
        })}
      />
    </Navigator>
  );
}
