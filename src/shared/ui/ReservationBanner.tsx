import { X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface Props {
  countdown: string;
  onCancel: () => void;
}

/** @scope * */
export function ReservationBanner({ countdown, onCancel }: Props) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>Товары забронированы</Text>
        <Text style={styles.subtitle}>Бронь действует: {countdown}</Text>
      </View>

      <Pressable
        onPress={onCancel}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Отменить бронь"
        style={styles.closeButton}
      >
        <X color={theme.color.textSecondary} size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.offset.itemHorizontal,
    marginHorizontal: theme.offset.content,
    marginBottom: theme.offset.line,
    padding: theme.offset.content,
    backgroundColor: theme.color.infoLight,
    borderRadius: 12,
  },
  textBlock: {
    flex: 1,
    gap: theme.offset.tiny,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.color.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.color.textSecondary,
  },
  closeButton: {
    padding: theme.offset.tiny,
  },
}));
