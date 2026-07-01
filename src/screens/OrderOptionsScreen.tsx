import { useNavigation } from "@react-navigation/native";
import { Check } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useOrderOptionsWithVisuals } from "_entities/order/lib/orderOptionVisuals";
import { orderStore, type OrderOptionKey } from "_entities/order/model";
import { Button } from "_shared/ui/Button";
import { Separator } from "_shared/ui/Separator";
import { TextInput } from "_shared/ui/TextInput";

/** @scope * */
export const OrderOptionsScreen = observer(OrderOptionsScreenComponent);

function OrderOptionsScreenComponent() {
    const navigation = useNavigation();
    const { theme } = useUnistyles();
    const options = useOrderOptionsWithVisuals();
    const [draftOptions, setDraftOptions] = useState(() => ({ ...orderStore.options }));
    const [draftComment, setDraftComment] = useState(orderStore.courierComment);

    const toggleDraftOption = useCallback((key: OrderOptionKey) => {
        setDraftOptions(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    }, []);

    const handleSave = useCallback(() => {
        (Object.keys(draftOptions) as OrderOptionKey[]).forEach(key => {
            orderStore.setOption(key, draftOptions[key]);
        });
        orderStore.setCourierComment(draftComment);
        navigation.goBack();
    }, [draftComment, draftOptions, navigation]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Text style={styles.subtitle}>Выберите опции для заказа</Text>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.optionsCard}>
                    {options.map((option, index) => {
                        const { Icon, iconColor, backgroundColor, key, label } = option;
                        const isChecked = draftOptions[key];

                        return (
                            <View key={key}>
                                {index > 0 && <Separator />}
                                <Pressable
                                    style={styles.optionRow}
                                    onPress={() => toggleDraftOption(key)}
                                >
                                    <View style={[styles.iconWrapper, { backgroundColor }]}>
                                        <Icon color={iconColor} size={20} />
                                    </View>
                                    <Text style={styles.optionLabel}>{label}</Text>
                                    <View
                                        style={[
                                            styles.checkbox,
                                            isChecked && styles.checkboxChecked,
                                        ]}
                                    >
                                        {isChecked && (
                                            <Check color={theme.color.onPrimary} size={14} strokeWidth={3} />
                                        )}
                                    </View>
                                </Pressable>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.commentSection}>
                    <Text style={styles.commentLabel}>Комментарий для курьера</Text>
                    <TextInput
                        value={draftComment}
                        onChangeText={setDraftComment}
                        placeholder="Например, уточнить место доставки"
                        multiline
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button variant="primary" title="Сохранить опции" onPress={handleSave} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create(theme => ({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    subtitle: {
        marginTop: theme.offset.content,
        fontSize: 14,
        color: theme.color.textSecondary,
        paddingHorizontal: theme.offset.content,
        paddingBottom: theme.offset.line,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.offset.content,
        paddingBottom: theme.offset.line,
        gap: theme.offset.block,
    },
    optionsCard: {
        backgroundColor: theme.color.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.color.border,
        overflow: "hidden",
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.offset.line,
        paddingHorizontal: theme.offset.content,
        paddingVertical: theme.offset.line,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    optionLabel: {
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
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
        backgroundColor: theme.color.primary,
        borderColor: theme.color.primary,
    },
    commentSection: {
        gap: theme.offset.itemHorizontal,
    },
    commentLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: theme.color.textPrimary,
    },
    footer: {
        paddingHorizontal: theme.offset.content,
        paddingVertical: theme.offset.content,
        borderTopWidth: 1,
        borderTopColor: theme.color.divider,
    },
}));
