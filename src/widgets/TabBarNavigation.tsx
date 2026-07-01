import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Activity, ShoppingCart, Store } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { useUnistyles } from 'react-native-unistyles';
import { AnalyticsScreen } from '_screens/AnalyticsScreen';
import { CartScreen } from '_screens/CartScreen';
import { ProductsScreen } from '_screens/ProductsScreen';
import { cartStore } from '_entities/cart/model';
import { ScreenRoutes, type TabBarParamList } from '_shared/config/routing';

const Tab = createBottomTabNavigator<TabBarParamList>();

/** @scope * */
export const TabBarNavigation = observer(TabBarNavigationComponent);

function TabBarNavigationComponent() {
  const { theme } = useUnistyles();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.color.tabActive,
        tabBarInactiveTintColor: theme.color.tabInactive,
      }}
    >
      <Tab.Screen
        name={ScreenRoutes.PRODUCTS}
        component={ProductsScreen}
        options={{
          title: 'Каталог товаров',
          tabBarIcon: ({ color, size }) => <Store color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ScreenRoutes.CART}
        component={CartScreen}
        options={{
          tabBarBadge: cartStore.totalItems > 0 ? cartStore.totalItems : undefined,
          title: 'Корзина',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ScreenRoutes.ANALYTICS}
        component={AnalyticsScreen}
        options={{
          title: 'Аналитика',
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
