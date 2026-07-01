import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./RootNavigator";

/** @scope .. */
export function Navigation() {
    return (
        <NavigationContainer>
            <RootNavigator />
        </NavigationContainer>
    );
}