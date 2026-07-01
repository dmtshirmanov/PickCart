import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlarmClock } from 'lucide-react-native';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { appInitStore } from '_entities/app-init/model';
import { productStore } from '_entities/product/model';
import { ErrorPrimaryAction, ScreenRoutes, type RootStackParamList } from '_shared/config/routing';
import { getResetToCartAction } from '_shared/lib/navigation';
import { Button, ButtonVariant } from '_shared/ui/Button';

type ErrorScreenProps = NativeStackScreenProps<RootStackParamList, ScreenRoutes.ERROR>;

/** @scope * */
export function ErrorScreen({ route }: ErrorScreenProps) {
  const navigation = useNavigation();
  const { theme } = useUnistyles();
  const {
    title,
    message,
    errorCode,
    primaryButtonTitle = 'Повторить',
    primaryAction,
    secondaryButtonTitle,
    returnToCartOnSecondary = false,
  } = route.params;

  const handlePrimaryPress = useCallback(() => {
    if (primaryAction === ErrorPrimaryAction.RETRY_CATALOG) {
      productStore.refresh();
      navigation.goBack();
      return;
    }

    if (primaryAction === ErrorPrimaryAction.RETRY_APP_INIT) {
      appInitStore.init().then(() => {
        if (appInitStore.isReady) {
          navigation.goBack();
        }
      });
      return;
    }

    navigation.goBack();
  }, [navigation, primaryAction]);

  const handleSecondaryPress = useCallback(() => {
    if (returnToCartOnSecondary) {
      navigation.dispatch(getResetToCartAction());
      return;
    }

    navigation.goBack();
  }, [navigation, returnToCartOnSecondary]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <AlarmClock color={theme.color.error} size={40} strokeWidth={2} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {errorCode && <Text style={styles.errorCode}>Код ошибки: {errorCode}</Text>}

          <View style={styles.actions}>
            <Button
              variant={ButtonVariant.Primary}
              title={primaryButtonTitle}
              style={styles.primaryButton}
              onPress={handlePrimaryPress}
            />
            {secondaryButtonTitle && (
              <Button
                variant={ButtonVariant.Ghost}
                title={secondaryButtonTitle}
                style={styles.secondaryButton}
                textStyle={styles.secondaryButtonLabel}
                onPress={handleSecondaryPress}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.color.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.offset.content,
  },
  card: {
    borderRadius: 12,
    paddingVertical: theme.offset.block,
    paddingHorizontal: theme.offset.content,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.color.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.offset.block,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.color.error,
    textAlign: 'center',
    marginBottom: theme.offset.itemHorizontal,
  },
  message: {
    fontSize: 15,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginBottom: theme.offset.block,
  },
  errorCode: {
    fontSize: 14,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginBottom: theme.offset.block,
  },
  actions: {
    width: '100%',
    gap: theme.offset.line,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: theme.color.background,
  },
  secondaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color.textPrimary,
  },
}));
