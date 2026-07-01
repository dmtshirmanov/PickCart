import { useIsFocused } from '@react-navigation/native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { analyticsStore } from '_entities/analytics/model';
import { AnalyticsEventDetailModal } from '_entities/analytics/ui/AnalyticsEventDetailModal';
import { AnalyticsEventItem } from '_entities/analytics/ui/AnalyticsEventItem';
import type { AnalyticsLogEntry } from '_shared/api/analytics/types';
import { Separator } from '_shared/ui/Separator';

/** @scope * */
export const AnalyticsScreen = observer(AnalyticsScreenComponent);

function AnalyticsScreenComponent() {
  const isFocused = useIsFocused();
  const listRef = useRef<FlashListRef<AnalyticsLogEntry>>(null);
  const previousHeadEventIdRef = useRef<string | undefined>(undefined);
  const { log, logRevision } = analyticsStore;
  const headEventId = log[0]?.id;
  const [selectedEntry, setSelectedEntry] = useState<AnalyticsLogEntry | null>(null);
  const isEmpty = log.length === 0;

  useEffect(() => {
    if (!isFocused || !headEventId || previousHeadEventIdRef.current === headEventId) {
      return;
    }

    const shouldAnimate = previousHeadEventIdRef.current !== undefined;
    previousHeadEventIdRef.current = headEventId;

    requestAnimationFrame(() => {
      listRef.current?.scrollToTop?.({ animated: shouldAnimate });
    });
  }, [headEventId, isFocused]);

  const handlePressItem = useCallback((entry: AnalyticsLogEntry) => {
    setSelectedEntry(entry);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  const keyExtractor = useCallback((item: AnalyticsLogEntry) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: AnalyticsLogEntry }) => {
      return <AnalyticsEventItem entry={item} onPress={handlePressItem} />;
    },
    [handlePressItem],
  );

  const renderSeparator = useCallback(() => {
    return <Separator style={styles.separator} />;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Аналитика</Text>
        {!isEmpty && <Text style={styles.subtitle}>{log.length} событий</Text>}
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer} testID="analytics-empty">
          <Text style={styles.emptyTitle}>Событий пока нет</Text>
          <Text style={styles.emptySubtitle}>
            Изменения корзины и оформление заказа появятся здесь
          </Text>
        </View>
      ) : (
        <FlashList
          ref={listRef}
          testID="analytics-list"
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={log.slice()}
          extraData={logRevision}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={renderSeparator}
        />
      )}

      <AnalyticsEventDetailModal entry={selectedEntry} onClose={handleCloseModal} />
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.color.background,
  },
  header: {
    paddingHorizontal: theme.offset.content,
    paddingTop: theme.offset.content,
    paddingBottom: theme.offset.line,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.color.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.color.textSecondary,
    marginTop: theme.offset.tiny,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.offset.content,
    paddingBottom: theme.offset.content,
  },
  separator: {
    marginVertical: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.offset.content,
    gap: theme.offset.itemHorizontal,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.color.textPrimary,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.color.textSecondary,
    textAlign: 'center',
  },
}));
