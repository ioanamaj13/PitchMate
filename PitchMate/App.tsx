import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, StyleSheet } from "react-native";
import PitchMateMain from "./src/views/main.view";

export const App = () => {
  return (
    <View style={styles.appContainer}>
      <StatusBar style="auto" />
      <PitchMateMain />
    </View>
  );
};

export const styles = StyleSheet.create({
  appContainer: {
    padding: 10,
    paddingTop: 50,
    borderWidth: 6,
    borderColor: "blue",
    display: "flex",
    alignContent: "center",
    verticalAlign: "middle",
  },
});

export default App;
