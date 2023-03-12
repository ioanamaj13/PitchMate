import React, { useState, useRef, useEffect, useMemo } from "react";
import { View, StyleSheet, Button, Text } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Canvas, Circle, Group, Line, vec } from "@shopify/react-native-skia";
import { color } from "react-native-reanimated";

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

  const [recordings, setRecordings] = useState<string[]>([]);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  // Initial Load to get the audio permission
  useEffect(() => {
    GetPermission();
  }, []);

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
      await AudioPlayer.current.loadAsync({ uri: RecordedURI }, {}, true);

      // Get Player Status
      const playerStatus = await AudioPlayer.current.getStatusAsync();

      // Play if song is loaded successfully
      if (playerStatus.isLoaded) {
        if (playerStatus.isPlaying === false) {
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

      console.log(playerStatus);
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

  const size = 100;
  const r = (50 * recordingDuration) / 1000;

  const colorCoeficient = recordingDuration/255; 


  console.log(colorCoeficient);

  const firstColor = "#ff00ff";
  const progressColor = useMemo(() => `#${(parseInt(colorCoeficient.toString()))}0000`, [colorCoeficient]) ;

  console.log(progressColor);

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
        <Group blendMode='difference'>
          <Circle cx={recordingDuration/100} cy={30} r={10}  color={progressColor} />
          <Line p1={vec(0,30)} p2={vec(1000,30)} strokeWidth={4} color={progressColor} />
        </Group>
      </Canvas>

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
});

export default RecordSound;
