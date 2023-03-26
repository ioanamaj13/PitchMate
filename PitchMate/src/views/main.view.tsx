import React from "react";
import { View, StyleSheet } from "react-native";
import PitchMateLogo from "../components/logo.component";
import RecordSound from "./record.view";

export const PitchMateMain = () => {
  return (
    <View style={styles.container}>
      <RecordSound />
      <PitchMateLogo />
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignContent: "center",
    verticalAlign: "middle",
    height: "100%",
    borderWidth: 1,
    backgroundColor: "#ecf0f1",
  },

});

export default PitchMateMain;
