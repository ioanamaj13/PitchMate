import React from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { Canvas, Circle, Group, Line, vec } from "@shopify/react-native-skia";

interface PlayerBarProps {
  currentPosition: number;
  duration: number;
}

export const PlayerBar = ({ currentPosition, duration }: PlayerBarProps) => {
  const displayWidth = Dimensions.get("window").width - 80;

  return (
    <View>
      <Canvas style={styles.playbackCanvas}>
        <Group blendMode="difference">
          <Circle
            cx={(displayWidth * currentPosition) / duration}
            cy={30}
            r={10}
            color={"#000"}
          />
          <Line
            p1={vec(0, 30)}
            p2={vec(1000, 30)}
            strokeWidth={4}
            color={"#000"}
          />
        </Group>
      </Canvas>
      <View style={styles.timer}>
        <Text>{currentPosition}</Text>
        <Text>{duration - currentPosition}</Text>
      </View>
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

  playbackCanvas: {
    display: "flex",
    height: 60,
  },

  timer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    color: "red",
  },
});

export default PlayerBar;
