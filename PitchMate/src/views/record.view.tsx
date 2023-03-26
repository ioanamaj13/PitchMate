import { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Button, Text } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { cfft } from "../math/fft";
import {
  FFT_SIZE,
  calculateBins,
  SAMPLE_SIZE_MS,
  SAMPLING_RATE,
} from "../utils/constants";
import PlayerBar from "../components/playerBar.component";
import { AudioSpectrum } from "../components/audioSpectrum.component";
import RecordGraphic from "../components/recordingGraphic.component";
import yin from "../math/yin";
import React from "react";
import PitchDisplay from "../components/pitchDisplay.component";

export const RecordSound = () => {
  // Refs for the audio
  const AudioRecorder = useRef(new Audio.Recording());
  const AudioPlayer = useRef(new Audio.Sound());

  // States for UI
  const [RecordedURI, SetRecordedURI] = useState<string>("");
  const [AudioPermission, SetAudioPermission] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [soundStatus, setSoundStatus] = useState<AVPlaybackStatus>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [recordingPositionMillis, setRecordingPositionMillis] =
    useState<number>(0);

  const [recordings, setRecordings] = useState<string[]>([]);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  const [estimatedPitch, setEstimatedPitch] = useState<string>("0");

  // States for the audio spectrum
  const [binsToBarHeights, setBinsToBarHeights] = useState<number[]>([]);

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

    // console.log("sample: ", sample);
    const frequencyArray = cfft(
      sample.channels[0].frames.slice(0, FFT_SIZE)
    ).map((n) => n.mag());

    const channel0 = sample.channels[0].frames.slice(0, FFT_SIZE);

    const channel0yin = yin(channel0, SAMPLING_RATE);

    setEstimatedPitch(channel0yin);

    if (frequencyArray.some(isNaN)) return;

    const binValues = calculateBins(frequencyArray);

    setBinsToBarHeights(binValues);
  };

  // Function to get the audio permission
  const GetPermission = async () => {
    const getAudioPerm = await Audio.requestPermissionsAsync();
    SetAudioPermission(getAudioPerm.granted);
  };

  // Function to start recording
  const StartRecording = async () => {
    if (isPlaying) StopPlaying();

    setRecordingDuration(0);

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
          setIsRecording(true);

          AudioRecorder.current.setProgressUpdateInterval(100);
          AudioRecorder.current.setOnRecordingStatusUpdate((status) => {
            setRecordingDuration(status.durationMillis);
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
      setIsRecording(false);
    } catch (error) {}
  };

  // Function to play the recorded audio
  const PlayRecordedAudio = async () => {
    if (isRecording) StopRecording();
    setRecordingPositionMillis(0);
    try {
      // Load the Recorded URI
      await AudioPlayer.current.loadAsync(
        { uri: RecordedURI },
        { progressUpdateIntervalMillis: SAMPLE_SIZE_MS },
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
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <View>
        <Text>{recordingDuration / 1000}</Text>
      </View>

      {/* <PlayerBar
        currentPosition={recordingPositionMillis}
        duration={recordingDuration}
      /> */}

      <AudioSpectrum barHeights={binsToBarHeights} />

      <PitchDisplay pitch={estimatedPitch} />

      <View style={styles.recordingControls}>
        <Button
          disabled={isPlaying}
          title={isRecording ? "Stop Recording" : "Start Recording"}
          color={isRecording ? "red" : "green"}
          onPress={isRecording ? StopRecording : StartRecording}
        />
        <Button
          disabled={recordings.length === 0 || isRecording}
          title={isPlaying ? "Stop Sound" : "Play Sound"}
          color={isPlaying ? "red" : "orange"}
          onPress={isPlaying ? StopPlaying : PlayRecordedAudio}
        />
      </View>
      {/* <Text>{RecordedURI}</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    justifyContent: "center",
  },

  recordingControls: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },

  pitchLabel: {
    fontSize: 30,
  },

  pitchValue: {
    fontSize: 100,
  },

  pitchContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
});

export default RecordSound;
