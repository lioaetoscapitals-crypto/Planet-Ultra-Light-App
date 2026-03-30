import React from "react";
import { StyleSheet, View } from "react-native";
import { MenuGroup as MenuGroupType } from "../assets/menuAssets";
import MenuRow from "./MenuRow";

type MenuGroupProps = {
  group: MenuGroupType;
};

export default function MenuGroup({ group }: MenuGroupProps) {
  return (
    <View style={styles.group}>
      <MenuRow
        label={group.title}
        iconUri={group.iconUri}
        chevronUri={group.chevronUri}
        isTop
        isParent
      />

      {group.rows.map((item, index) => {
        const isLast = index === group.rows.length - 1;

        return (
          <View key={item.id} style={styles.rowWrap}>
            <MenuRow
              label={item.label}
              iconUri={item.iconUri}
              chevronUri={item.hasChevron ? group.chevronUri : undefined}
              isBottom={isLast}
              indentDot={item.indentDot}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    width: "100%"
  },
  rowWrap: {
    marginTop: 1
  }
});
