import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { Navigation } from './navigation/Navigation';
/* eslint-disable export-scope/no-imports-outside-export-scope */
import '_shared/lib/unitstyles';
import '_entities/analytics/model';
import '_entities/cart/model';
import '_entities/order/model';
import '_entities/product/model';
/* eslint-enable export-scope/no-imports-outside-export-scope */
import { initGlobalReactions } from './initGlobalReactions';

initGlobalReactions();

export function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
          <Navigation />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
