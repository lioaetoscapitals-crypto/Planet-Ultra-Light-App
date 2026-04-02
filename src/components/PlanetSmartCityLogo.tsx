import React from "react";
import { Image, StyleSheet, View } from "react-native";

type Props = {
  compact?: boolean;
  width?: number;
};

const LOGO_SOURCE = require("../../assets/branding/planet-smart-city-logo.png");
const LOGO_RATIO = 1186 / 439;

export default function PlanetSmartCityLogo({ compact = false, width }: Props) {
  const baseWidth = compact ? 220 : 286;
  const resolvedWidth = width ?? baseWidth;
  const resolvedHeight = resolvedWidth / LOGO_RATIO;

  return (
    <View style={[styles.container, { width: resolvedWidth, height: resolvedHeight }]}>
      <Image source={LOGO_SOURCE} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    overflow: "visible"
  },
  image: {
    width: "100%",
    height: "100%"
  }
});
