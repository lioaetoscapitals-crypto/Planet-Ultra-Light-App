import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ProfileThemeTokens } from "../../theme/profileTheme";

export type BottomSheetOption = {
  id: string;
  label: string;
};

type ThemedBottomSheetProps = {
  visible: boolean;
  title: string;
  options: BottomSheetOption[];
  selectedId?: string;
  onClose: () => void;
  onSelect: (option: BottomSheetOption) => void;
  theme: ProfileThemeTokens;
};

export default function ThemedBottomSheet({
  visible,
  title,
  options,
  selectedId,
  onClose,
  onSelect,
  theme
}: ThemedBottomSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.gripWrap}>
          <View style={[styles.grip, { backgroundColor: theme.textMuted }]} />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsWrap}>
          {options.map((option) => {
            const selected = selectedId === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => onSelect(option)}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: selected ? theme.primaryButtonBg : theme.elevatedBg,
                    borderColor: selected ? theme.primaryButtonBg : theme.cardBorder
                  }
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: selected ? theme.primaryButtonText : theme.textPrimary }
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 7, 14, 0.6)"
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    minHeight: 320,
    maxHeight: "68%",
    paddingHorizontal: 16,
    paddingBottom: 28
  },
  gripWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 12
  },
  grip: {
    width: 52,
    height: 5,
    borderRadius: 999
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12
  },
  optionsWrap: {
    gap: 10,
    paddingBottom: 14
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  optionText: {
    fontSize: 16,
    fontWeight: "700"
  }
});

