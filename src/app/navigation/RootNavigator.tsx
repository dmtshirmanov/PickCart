import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OrderConfirmationScreen } from "_screens/OrderConfirmationScreen";
import { OrderOptionsScreen } from "_screens/OrderOptionsScreen";
import { NavigatorRoutes, ScreenRoutes, type RootStackParamList } from "_shared/config/routing";
import { TabBarNavigation } from "_widgets/TabBarNavigation";

const { Navigator, Screen } = createNativeStackNavigator<RootStackParamList>();

/** @scope .. */
export function RootNavigator() {
    return (
        <Navigator screenOptions={{
            headerShown: false,
        }}>
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
                    title: "Подтверждение заказа",
                    headerBackTitle: "",
                    headerBackButtonDisplayMode: "minimal",
                }}
            />
            <Screen
                name={ScreenRoutes.ORDER_OPTIONS}
                component={OrderOptionsScreen}
                options={{
                    headerShown: true,
                    title: "Опции заказа",
                    headerBackTitle: "",
                    headerBackButtonDisplayMode: "minimal",
                }}
            />
        </Navigator>
    );
}