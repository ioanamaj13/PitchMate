import { View, StyleSheet, Text } from "react-native";

import React from "react";
import { mapFreqToNote } from "../utils/mapFreqToNote";

interface PitchDisplayProps {
  pitch: string;
}

export const PitchDisplay = ({ pitch }: PitchDisplayProps) => {
  const pitchValue = parseFloat(pitch);
  const pitchLabel = pitchValue > 0 && pitchValue < 5000 ? pitchValue : "N/A";

  return (
    <View style={styles.pitchContainer}>
      <Text style={styles.pitchValue}>{mapFreqToNote(pitchValue)}</Text>
      <Text style={styles.pitchValue}>{pitchLabel}</Text>
      <Text style={styles.pitchLabel}>Aproximated Pitch</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pitchLabel: {
    fontSize: 30,
  },

  pitchValue: {
    fontSize: 50,
  },

  pitchContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
});

export default PitchDisplay;
