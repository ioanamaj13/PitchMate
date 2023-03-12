import React from "react";
import { StyleSheet, Image } from "react-native";

export const PitchMateLogo = () => {
  return (
    <Image
      style={styles.logo}
      source={require("../../assets/logo/100w/pitchmate_logo.png")}
    />
  );
};

export const styles = StyleSheet.create({
  logo: {
    display: "flex",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});

export default PitchMateLogo;
