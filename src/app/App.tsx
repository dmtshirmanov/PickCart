import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { appInitStore } from '_entities/app-init/model';
import { Button, ButtonVariant } from '_shared/ui/Button';
import { Loader } from '_shared/ui/Loader';
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

export const App = observer(AppComponent);

function AppComponent() {
  useEffect(() => {
    void appInitStore.init();
  }, []);

  if (appInitStore.isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.centered}>
          <Loader size={48} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (appInitStore.error) {
    return (
      <SafeAreaProvider>
        <View style={styles.centered}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Не удалось запустить приложение</Text>
            <Text style={styles.errorMessage}>{appInitStore.error}</Text>
            <Button
              variant={ButtonVariant.Primary}
              title="Повторить"
              onPress={() => {
                void appInitStore.init();
              }}
            />
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!appInitStore.isReady) {
    return;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
          <Navigation />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.color.background,
    paddingHorizontal: theme.offset.content,
  },
  errorCard: {
    width: '100%',
    gap: theme.offset.line,
    backgroundColor: theme.color.surface,
    borderRadius: 12,
    padding: theme.offset.content,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.color.textPrimary,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginBottom: theme.offset.itemHorizontal,
  },
}));
