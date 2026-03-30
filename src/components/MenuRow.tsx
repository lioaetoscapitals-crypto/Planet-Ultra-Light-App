import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SvgUri } from "react-native-svg";

type MenuRowProps = {
  label: string;
  iconUri: string;
  chevronUri?: string;
  isTop?: boolean;
  isBottom?: boolean;
  isParent?: boolean;
  indentDot?: boolean;
};

export default function MenuRow({
  label,
  iconUri,
  chevronUri,
  isTop = false,
  isBottom = false,
  isParent = false,
  indentDot = false
}: MenuRowProps) {
  return (
    <View
      style={[
        styles.row,
        isTop && styles.rowTop,
        isBottom && styles.rowBottom
      ]}
    >
      <View style={styles.content}>
        {indentDot ? <View style={styles.dotSpacer} /> : null}
        <View style={styles.iconWrap}>
          <SvgUri width={24} height={24} uri={iconUri} />
        </View>
        <Text style={[styles.label, isParent ? styles.parentLabel : styles.childLabel]}>{label}</Text>
      </View>

      {chevronUri ? (
        <View style={styles.chevronWrap}>
          <SvgUri width={20} height={20} uri={chevronUri} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: "#F9FAFB",
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 6
  },
  rowTop: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  rowBottom: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  dotSpacer: {
    width: 10,
    height: 10
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    flex: 1,
    fontFamily: "Noto Sans",
    fontSize: 14,
    lineHeight: 14,
    fontWeight: "500"
  },
  parentLabel: {
    color: "#161B26"
  },
  childLabel: {
    color: "#667085"
  },
  chevronWrap: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center"
  }
});
