import React from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";

interface RecordGraphicProps {
  recordingDuration: number;
}

export const RecordGraphic = ({ recordingDuration }: RecordGraphicProps) => {
  const size = 100;
  const r = (50 * recordingDuration) / 1000;

  return (
    <View style={styles.recordingCanvas}>
      <Canvas style={styles.recordingCanvas}>
        <Group blendMode="multiply">
          <Circle key={"first"} cx={100} cy={100} r={r} color={"#ff00ff"} />
          <Circle
            key={"second"}
            cx={size - r}
            cy={r / 2}
            r={r / 2}
            color="magenta"
          />
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 8,
  },

  recordingCanvas: {
    borderWidth: 1,
    borderColor: "black",
    display: "flex",
    flex: 1,
    height: 200,
  },

  playbackCanvas: {
    display: "flex",
    height: 60,
  },

  audioSpectrum: {
    display: "flex",
    height: 100,
    borderColor: "black",
    borderWidth: 1,
  },

  timer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    color: "red",
  },

  notesMapping: {
    marginLeft: 10,
    marginRight: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default RecordGraphic;
