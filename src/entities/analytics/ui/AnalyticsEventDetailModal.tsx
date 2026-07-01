import { Modal, Pressable, StyleSheet as RNStyleSheet, ScrollView, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import {
  formatAnalyticsEventLabel,
  formatAnalyticsTimestamp,
} from '_entities/analytics/lib/format';
import { AnalyticsDeliveryStatus, type AnalyticsLogEntry } from '_shared/api/analytics/types';
import { Button, ButtonVariant } from '_shared/ui/Button';

interface Props {
  entry: AnalyticsLogEntry | null;
  onClose: () => void;
}

/** @scope * */
export function AnalyticsEventDetailModal({ entry, onClose }: Props) {
  if (!entry) {
    return null;
  }

  const isFailed = entry.status === AnalyticsDeliveryStatus.FAILED;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={RNStyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />

        <View style={styles.card}>
          <Text style={styles.title}>{formatAnalyticsEventLabel(entry.event)}</Text>
          <Text style={styles.meta}>{formatAnalyticsTimestamp(entry.timestamp)}</Text>

          {isFailed && entry.errorMessage && <Text style={styles.error}>{entry.errorMessage}</Text>}

          <ScrollView
            style={styles.payloadScroll}
            contentContainerStyle={styles.payloadContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            <Text style={styles.payload} selectable>
              {JSON.stringify(entry.payload, null, 2)}
            </Text>
          </ScrollView>

          <Button variant={ButtonVariant.Primary} title="Закрыть" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create(theme => ({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.offset.content,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: 12,
    padding: theme.offset.content,
    gap: theme.offset.line,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: theme.color.textSecondary,
  },
  error: {
    fontSize: 14,
    color: theme.color.error,
    lineHeight: 20,
  },
  payloadScroll: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: 280,
    backgroundColor: theme.color.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.color.divider,
  },
  payloadContent: {
    padding: theme.offset.itemHorizontal,
  },
  payload: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.color.textPrimary,
    fontFamily: 'Menlo',
  },
}));
