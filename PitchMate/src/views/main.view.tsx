import React from "react";
import { Text, View, StyleSheet } from "react-native";
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
    padding: 10,
    paddingTop: 50,
    borderWidth: 1,
    borderColor: "red",
  },

});

export default PitchMateMain;
