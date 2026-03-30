import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { menuGroups } from "../assets/menuAssets";
import MenuGroup from "../components/MenuGroup";

export default function SubMenusScreen() {
  const groupGapByIndex = [14, 21, 21, 21, 27, 21, 0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.column}>
          {menuGroups.map((group, index) => (
            <View
              key={group.id}
              style={[styles.groupWrap, { marginBottom: groupGapByIndex[index] ?? 0 }]}
            >
              <MenuGroup group={group} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  scrollContent: {
    paddingVertical: 24,
    alignItems: "center"
  },
  column: {
    width: 296
  },
  groupWrap: {
    marginBottom: 0
  }
});
