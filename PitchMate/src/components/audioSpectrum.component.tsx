import React from "react";
import { View, StyleSheet,  Text, Dimensions } from "react-native";
import {
  Canvas,
  Group,
  Path,
  Rect,
  Skia,
} from "@shopify/react-native-skia";
import {
  NUM_BINS,
} from "../utils/constants";

interface AudioSpectrumProps {
    barHeights: number[];
}

export const AudioSpectrum = ({barHeights}: AudioSpectrumProps) => {

  const binWidth = (Dimensions.get("window").width-60) / NUM_BINS;

  const binsToPath = (bins: number[]) => {
    const path = Skia.Path.Make();
    path.moveTo(0, 0);

    for (let i = 0; i < bins.length; i++) {
      const x = i * binWidth + 8;
      const y = bins[i] + 10;
      path.lineTo(i * binWidth + 8, bins[i] + 10);
    }

    path.lineTo(bins.length * binWidth + 8, 0);
    path.close();
    return path;
  };

  return (
    <View style={styles.container}>
      <Canvas style={styles.audioSpectrum}>
        <Group>
          {barHeights.map((bin, i) => {
            return (
              <Rect
                key={i}
                x={i * binWidth + 12}
                y={100}
                width={binWidth - 16}
                height={-bin}
                color="red"
              />
            );
          })}
        </Group>
      </Canvas>

      <View style={styles.notesMapping}>
        <Text>C</Text>
        <Text>C#</Text>
        <Text>D</Text>
        <Text>D#</Text>
        <Text>E</Text>
        <Text>F</Text>
        <Text>F#</Text>
        <Text>G</Text>
        <Text>G#</Text>
        <Text>A</Text>
        <Text>A#</Text>
        <Text>B</Text>
      </View>

      <Canvas style={{ flex: 1, height: 100 }}>
        <Path
          path={binsToPath(barHeights)}
          color="magenta"
          stroke={{ width: 1 }}
        />
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

export default AudioSpectrum;
