import React, { useState, useRef, useEffect, useMemo } from "react";
import { View, StyleSheet, Button, Text, Dimensions } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import {
  Canvas,
  Circle,
  Group,
  Line,
  Rect,
  vec,
} from "@shopify/react-native-skia";
import {
  cancelAnimation,
  Extrapolate,
  interpolate,
  runOnUI,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AudioSpectrum from "../components/audioSpectrum.component";
import { useMeasure } from "../utils/useMeasure";
import { cfft } from "../math/fft";
import {
  NUM_BINS,
  FFT_SIZE,
  calculateBins,
  FIRST_BIN_FREQ,
  MAX_BIN_FREQ,
} from "../constants";

export const RecordSound = () => {
  // Refs for the audio
  const AudioRecorder = useRef(new Audio.Recording());
  const AudioPlayer = useRef(new Audio.Sound());

  // States for UI
  const [RecordedURI, SetRecordedURI] = useState<string>("");
  const [AudioPermission, SetAudioPermission] = useState<boolean>(false);
  const [IsRecording, SetIsRecording] = useState<boolean>(false);
  const [soundStatus, setSoundStatus] = useState<AVPlaybackStatus>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [recordingPositionMillis, setRecordingPositionMillis] =
    useState<number>(0);

  const [recordings, setRecordings] = useState<string[]>([]);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  // States for the audio spectrum
  const [binsToBarHeights, setBinsToBarHeights] = useState<number[]>([]);
  const binWidth = (Dimensions.get("window").width - 80) / NUM_BINS;

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    if (!playbackStatus.isLoaded) {
      // Update your UI for the unloaded state
      if (playbackStatus.error) {
        console.log(
          `Encountered a fatal error during playback: ${playbackStatus.error}`
        );
        // Send Expo team the error on Slack or the forums so we can help you debug!
      }
    } else {
      // Update your UI for the loaded state

      if (playbackStatus.isPlaying) {
        setRecordingPositionMillis(playbackStatus.positionMillis);
        // Update your UI for the playing state
      } else {
        // Update your UI for the paused state
      }

      if (playbackStatus.isBuffering) {
        // Update your UI for the buffering state
      }

      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        // The player has just finished playing and will stop. Maybe you want to play something else?
        StopPlaying();
      }
    }
  };

  AudioPlayer.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

  // Initial Load to get the audio permission
  useEffect(() => {
    GetPermission();
  }, []);

  const onSampleReceived = (sample: Audio.AudioSample) => {
    // Considerations below do not respect log scale!
    // sample rate = 44.1 kHz
    // picking 2048 samples -> 1024 usable bins
    // FFT bandwidth = sample_rate / 2 = 22.05 kHz
    // Bin width = bandwidth / 1024 bins = ~21 Hz - and that is our resolution
    // ----
    // we divide it into 8 bins (bandwidth / (1024/8) --> 21 Hz * 8 = 168 Hz Bin width)
    // mih freq = 168/2 = 84Hz
    // ---
    // but let's take 512 of these bins (bandwidth = 11 kHz)
    // then single original bin width = 21Hz (still)
    // we just ignore the higher part
    const freqs = cfft(sample.channels[0].frames.slice(0, FFT_SIZE)).map((n) =>
      n.mag()
    );

    // console.log("freqs: ", freqs);

    if (freqs.some(isNaN)) return;

    const binValues = calculateBins(freqs);

    setBinsToBarHeights(binValues);

    console.log("binValues: ", binValues);

    // runOnUI(updateBinHeights)(binValues);
    const a = 2;
  };

  const updateBinHeights = (values: number[]) => {
    "worklet";
    for (let i = 0; i < NUM_BINS; i++) {
      bins[i].value = interpolate(
        values[i],
        [0, 90, 200, 900],
        [1, 60, 90, 100],
        Extrapolate.CLAMP
      );
    }
  };

  const fadeBinsDown = () => {
    "worklet";
    for (let i = 0; i < NUM_BINS; i++) {
      cancelAnimation(bins[i]);
      bins[i].value = withTiming(1, { duration: 500 });
    }
  };

  // Function to get the audio permission
  const GetPermission = async () => {
    const getAudioPerm = await Audio.requestPermissionsAsync();
    SetAudioPermission(getAudioPerm.granted);
  };

  // Function to start recording
  const StartRecording = async () => {
    if (isPlaying) StopPlaying();

    try {
      // Check if user has given the permission to record
      if (AudioPermission === true) {
        try {
          // Prepare the Audio Recorder
          await AudioRecorder.current.prepareToRecordAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );

          // Start recording
          await AudioRecorder.current.startAsync();
          SetIsRecording(true);

          AudioRecorder.current.setProgressUpdateInterval(100);
          AudioRecorder.current.setOnRecordingStatusUpdate((status) => {
            console.log(status);
            setRecordingDuration(status.durationMillis);
            console.log(status.durationMillis);
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        // If user has not given the permission to record, then ask for permission
        GetPermission();
      }
    } catch (error) {}
  };

  // Function to stop recording
  const StopRecording = async () => {
    try {
      // Stop recording
      await AudioRecorder.current.stopAndUnloadAsync();

      // Get the recorded URI here
      const result = AudioRecorder.current.getURI();
      if (result) {
        SetRecordedURI(result);

        setRecordings([...recordings, result]);
      }

      // Reset the Audio Recorder
      AudioRecorder.current = new Audio.Recording();
      SetIsRecording(false);
    } catch (error) {}
  };

  // Function to play the recorded audio
  const PlayRecordedAudio = async () => {
    if (IsRecording) StopRecording();
    try {
      // Load the Recorded URI
      await AudioPlayer.current.loadAsync(
        { uri: RecordedURI },
        { progressUpdateIntervalMillis: 150 },
        true
      );

      // Get Player Status
      const playerStatus = await AudioPlayer.current.getStatusAsync();

      console.log("Status at play", playerStatus);
      // Play if song is loaded successfully
      if (playerStatus.isLoaded) {
        if (playerStatus.durationMillis === 0) return;

        if (playerStatus.isPlaying === false) {
          AudioPlayer.current.setOnAudioSampleReceived(onSampleReceived);
          AudioPlayer.current.playAsync();
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
          setSoundStatus(playerStatus);
          console.log(playerStatus.isPlaying);
        }
      }
    } catch (error) {}
  };

  // Function to stop the playing audio
  const StopPlaying = async () => {
    try {
      //Get Player Status
      const playerStatus = await AudioPlayer.current.getStatusAsync();

      console.log("Status at stop", playerStatus);
      // If song is playing then stop it
      if (playerStatus.isLoaded === true) {
        await AudioPlayer.current.unloadAsync();
      } else {
        setSoundStatus(playerStatus);

        console.log(playerStatus);
      }
      setIsPlaying(false);
      // runOnUI(fadeBinsDown)();
    } catch (error) {}
  };

  const size = 100;
  const r = (50 * recordingDuration) / 1000;

  const colorCoeficient = recordingDuration / 255;

  const firstColor = "#ff00ff";
  const progressColor = useMemo(
    () => `#${parseInt(colorCoeficient.toString())}0000`,
    [colorCoeficient]
  );

  const [dim, onLayout] = useMeasure();

  const bins = [...new Array(NUM_BINS)].map(() => useSharedValue(1));

  // console.log("bins: ", bins);

  return (
    <View style={styles.container}>
      <View>
        <Text>{recordingDuration / 1000}</Text>
      </View>

      <Canvas style={styles.recordingCanvas}>
        <Group blendMode="multiply">
          <Circle cx={100} cy={100} r={r} color={firstColor} />
          <Circle cx={size - r} cy={r / 2} r={r / 2} color="magenta" />
        </Group>
      </Canvas>

      <Canvas style={styles.playbackCanvas}>
        <Group blendMode="difference">
          <Circle
            cx={recordingPositionMillis / 100}
            cy={30}
            r={10}
            color={progressColor}
          />
          <Line
            p1={vec(0, 30)}
            p2={vec(1000, 30)}
            strokeWidth={4}
            color={progressColor}
          />
        </Group>
      </Canvas>

      <Canvas style={styles.audioSpectrum}>
        <Group>
          {binsToBarHeights.map((bin, i) => {

            console.log("bin: ", bin, 'i: ', i, 'binWidth: ', binWidth, 'height: ', bin);
            return (
              <>
                <Rect
                  key={i}
                  x={i * binWidth + 12}
                  y={0}
                  width={binWidth - 16}
                  height={bin}
                  color="red"
                />
                <Rect
                  key={`${i}_2`}
                  x={i * binWidth + 4}
                  y={0}
                  width={2}
                  height={bin}
                  color="green"
                />
              </>
            );
          })}
        </Group>
      </Canvas>

      <View style={styles.audioSpectrum} onLayout={onLayout}>
        <AudioSpectrum
          height={dim.height}
          bins={bins}
          frequencyRange={[FIRST_BIN_FREQ, MAX_BIN_FREQ]}
        />
      </View>

      <Button
        title={IsRecording ? "Stop Recording" : "Start Recording"}
        color={IsRecording ? "red" : "green"}
        onPress={IsRecording ? StopRecording : StartRecording}
      />
      <Button
        title={isPlaying ? "Stop Sound" : "Play Sound"}
        color={isPlaying ? "red" : "orange"}
        onPress={isPlaying ? StopPlaying : PlayRecordedAudio}
      />
      <Text>{RecordedURI}</Text>
      <Text>{soundStatus?.isLoaded}</Text>
      {/* <View>
        {recordings.map((item) => {
          return <Text>{item}</Text>;
        })}
      </View> */}
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
});

export default RecordSound;
