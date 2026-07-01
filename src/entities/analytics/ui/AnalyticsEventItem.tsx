import { observer } from 'mobx-react-lite';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { match } from 'ts-pattern';
import {
  formatAnalyticsEventLabel,
  formatAnalyticsEventSummary,
  formatAnalyticsTimestamp,
} from '_entities/analytics/lib/format';
import { AnalyticsDeliveryStatus, type AnalyticsLogEntry } from '_shared/api/analytics/types';

interface Props {
  entry: AnalyticsLogEntry;
  onPress: (entry: AnalyticsLogEntry) => void;
}

/** @scope * */
export const AnalyticsEventItem = observer(AnalyticsEventItemComponent);

function AnalyticsEventItemComponent({ entry, onPress }: Props) {
  const statusLabel = match(entry.status)
    .with(AnalyticsDeliveryStatus.SUCCESS, () => 'Успешно')
    .with(AnalyticsDeliveryStatus.FAILED, () => 'Ошибка')
    .otherwise(() => 'Отправка...');

  const summary = formatAnalyticsEventSummary(entry);

  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress(entry)}
      accessibilityRole="button"
      testID={`analytics-event-${entry.id}`}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{formatAnalyticsEventLabel(entry.event)}</Text>
        <View
          style={[
            styles.badge,
            entry.status === AnalyticsDeliveryStatus.SUCCESS && styles.badgeSuccess,
            entry.status === AnalyticsDeliveryStatus.FAILED && styles.badgeFailed,
            entry.status === AnalyticsDeliveryStatus.PENDING && styles.badgePending,
          ]}
        >
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      </View>

      <Text style={styles.timestamp}>{formatAnalyticsTimestamp(entry.timestamp)}</Text>

      {summary && (
        <Text style={styles.summary} numberOfLines={3}>
          {summary}
        </Text>
      )}

      {entry.status === AnalyticsDeliveryStatus.FAILED && entry.errorMessage && (
        <Text style={styles.error} numberOfLines={2}>
          Не отправлено: {entry.errorMessage}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    paddingVertical: theme.offset.itemVertical,
    gap: theme.offset.tiny,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.offset.line,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.color.textPrimary,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.color.surfaceMuted,
  },
  badgeSuccess: {
    backgroundColor: theme.color.primaryLight,
  },
  badgeFailed: {
    backgroundColor: theme.color.errorLight,
  },
  badgePending: {
    backgroundColor: theme.color.infoLight,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.color.textPrimary,
  },
  timestamp: {
    fontSize: 13,
    color: theme.color.textSecondary,
  },
  summary: {
    fontSize: 13,
    color: theme.color.textPrimary,
    lineHeight: 18,
  },
  error: {
    fontSize: 13,
    color: theme.color.error,
    lineHeight: 18,
  },
}));
