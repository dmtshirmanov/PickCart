import { Modal, Pressable, ScrollView, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { formatCheckoutIssueMessage } from '_shared/api/checkout/format';
import type { CheckoutIssue } from '_shared/api/checkout/types';
import { Button, ButtonVariant } from '_shared/ui/Button';

interface Props {
  visible: boolean;
  issues: Array<CheckoutIssue>;
  onClose: () => void;
}

/** @scope * */
export function CheckoutIssuesModal({ visible, issues, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Не удалось забронировать товары</Text>
          <Text style={styles.subtitle}>Проверьте корзину и попробуйте снова</Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {issues.map((issue, index) => (
              <Text key={`${issue.code}-${issue.productId ?? index}`} style={styles.issue}>
                • {formatCheckoutIssueMessage(issue)}
              </Text>
            ))}
          </ScrollView>

          <Button variant={ButtonVariant.Primary} title="Понятно" onPress={onClose} />
        </Pressable>
      </Pressable>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.color.textSecondary,
    textAlign: 'center',
  },
  list: {
    maxHeight: 240,
  },
  listContent: {
    gap: theme.offset.itemHorizontal,
  },
  issue: {
    fontSize: 14,
    color: theme.color.textPrimary,
    lineHeight: 20,
  },
}));
