import { Check } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { orderStore } from '_entities/order/model';
import { Separator } from '_shared/ui/Separator';

/** @scope * */
export const OrderOptionsSection = observer(OrderOptionsSectionComponent);

function OrderOptionsSectionComponent() {
  const { theme } = useUnistyles();
  const options = orderStore.optionsList;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Опции заказа</Text>

      <View style={styles.card}>
        {options.map((option, index) => (
          <View key={option.key}>
            {index > 0 && <Separator />}
            <Pressable style={styles.row} onPress={() => orderStore.toggleOption(option.key)}>
              <Text style={styles.label}>{option.label}</Text>
              <View style={[styles.checkbox, option.enabled && styles.checkboxChecked]}>
                {option.enabled && (
                  <Check color={theme.color.onPrimary} size={14} strokeWidth={3} />
                )}
              </View>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    paddingHorizontal: theme.offset.content,
    paddingTop: theme.offset.line,
    paddingBottom: theme.offset.line,
    borderTopWidth: 1,
    borderTopColor: theme.color.divider,
    gap: theme.offset.line,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.offset.line,
    paddingHorizontal: theme.offset.content,
    paddingVertical: theme.offset.line,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: theme.color.textPrimary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.color.primary,
    borderColor: theme.color.primary,
  },
}));
