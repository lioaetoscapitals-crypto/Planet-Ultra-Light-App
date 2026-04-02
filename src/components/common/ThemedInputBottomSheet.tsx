import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ProfileThemeTokens } from "../../theme/profileTheme";

type ThemedInputBottomSheetProps = {
  visible: boolean;
  title: string;
  initialValue: string;
  placeholder: string;
  onClose: () => void;
  onSave: (value: string) => void;
  theme: ProfileThemeTokens;
};

export default function ThemedInputBottomSheet({
  visible,
  title,
  initialValue,
  placeholder,
  onClose,
  onSave,
  theme
}: ThemedInputBottomSheetProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setValue(initialValue);
  }, [initialValue, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.gripWrap}>
          <View style={[styles.grip, { backgroundColor: theme.textMuted }]} />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>

        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          style={[
            styles.input,
            { color: theme.textPrimary, borderColor: theme.cardBorder, backgroundColor: theme.elevatedBg }
          ]}
          multiline
          textAlignVertical="top"
          maxLength={300}
        />

        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            style={[styles.button, { borderColor: theme.secondaryButtonBorder, backgroundColor: theme.cardBg }]}
          >
            <Text style={[styles.buttonText, { color: theme.secondaryButtonText }]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => onSave(value.trim())}
            style={[styles.button, { backgroundColor: theme.primaryButtonBg, borderColor: theme.primaryButtonBg }]}
          >
            <Text style={[styles.buttonText, { color: theme.primaryButtonText }]}>Save</Text>
          </Pressable>
        </View>
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
  input: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600"
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800"
  }
});

