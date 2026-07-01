import type { RootStackParamList } from "_shared/config/routing";

declare global {
    namespace ReactNavigation {
        type RootParamList = RootStackParamList;
    }
}
