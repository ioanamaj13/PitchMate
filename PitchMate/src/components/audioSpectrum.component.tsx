import { Canvas } from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, StyleSheet, View, Text } from "react-native";
import Reanimated, {
  Extrapolate,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AXIS_LABELS_HEIGHT = 20;

interface Props {
  /**
   * Bin height values, range [1, 100]
   */
  bins: SharedValue<number>[];
  /**
   * For bin labels - low and high frequency
   * Middle will be calculated automatically (log10 middle)
   */
  frequencyRange: [low: number, high: number];
  /**
   * Height for bins container / max bin height.
   */
  height: number;
}

export default function AudioSpectrum({ bins, frequencyRange, height }: Props) {
  height -= AXIS_LABELS_HEIGHT;
  const binWidth = (Dimensions.get("window").width - 120) / bins.length;

  const [lowFreq, highFreq] = frequencyRange;
  const midFreq = React.useMemo(
    () => Math.pow(10, Math.log10(lowFreq * highFreq) / 2),
    [lowFreq, highFreq]
  );

  const animatedStyles: any[] = new Array(bins.length);

  for (let i = 0; i < bins.length; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // as long as the hooks are always called in the same order, it's ok
    animatedStyles[i] = useAnimatedStyle(() => {
      const rawBin = bins[i].value;
      const value = interpolate(
        rawBin,
        [1, 100],
        [1, height],
        Extrapolate.CLAMP
      );
      return {
        height: withSpring(value, {
          mass: 1,
          damping: 500,
          stiffness: 1000,
        }),
      };
    }, [bins[i]]);
  }

  return (
    <View>
      <View style={[styles.binContainer, { height }]}>
        <Reanimated.View style={{ width: 0, height }} />
        {animatedStyles.map((style, idx) => (
          <Reanimated.View
            key={idx}
            style={[styles.bin, style, { width: binWidth }]}
          />
        ))}
      </View>
      <View style={styles.xAxisLabels}>
        <Text>{formatHertzString(lowFreq, { digits: 0 })} Hz</Text>
        <Text>{formatHertzString(midFreq, { digits: 0 })} Hz</Text>
        <Text>{formatHertzString(highFreq / 1000, { digits: 1 })} kHz</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  binContainer: {
    flexWrap: "nowrap",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: 'center',
  },
  bin: {
    backgroundColor: "#ff9900",
    alignSelf: "flex-end",
    borderColor: "#ff7700",
    borderRightWidth: 1,
    borderLeftWidth: 1,
  },
  xAxisLabels: {
    height: AXIS_LABELS_HEIGHT,
    width: Dimensions.get("window").width - 80,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 120,
    flex: 1,
  },
});

// `toLocaleString()` does not work in Hermes (https://github.com/facebook/react-native/issues/31152)
// doing it manually
const formatHertzString = (
  frequency: number,
  { digits }: { digits: number }
) => {
  const freqStr = frequency.toString();

  const dotIndex = freqStr.indexOf(".");
  if (dotIndex < 0) return freqStr;

  const offset = digits + Number(!!digits);
  return freqStr.substring(0, dotIndex + offset);
};