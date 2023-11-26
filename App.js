import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Button,
  TouchableOpacity,
} from "react-native";
import * as React from "react";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import { useRef, useState } from "react";
import questions from "./questions.json";
import * as MediaLibrary from "expo-media-library";

import { MaterialIcons } from "@expo/vector-icons";

export default function App() {
  const camera = useRef(null);

  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const [recording, setRecording] = useState(false);
  const [showYesResult, setShowYesResult] = useState(false);
  const [showNoResult, setShowNoResult] = useState(false);
  const [yesOptionSelected, setYesOptionSelected] = useState(false);
  const [noOptionSelected, setNoOptionSelected] = useState(false);
  const [yesColor, setYesColor] = useState("#369f04");
  const [noColor, setNoColor] = useState("#f91d1e");
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [rollAngle, setRollAngle] = useState(0);
  const [yawAngle, setYawAngle] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const question = questions[questionIndex];
  const [bounds, setBounds] = useState({
    origin: { x: 0, y: 0 },
    size: { height: 0, width: 0 },
  });

  const showResult = (result) => {
    yesCount > noCount ? setShowYesResult(true) : setShowNoResult(true);
  };

  const handleRecordVideo = async () => {
    if (!camera) {
      return;
    }
    setRecording(!recording);
    if (recording) {
      camera.current.stopRecording();
    } else {
      const data = await camera.current.recordAsync();
      const uri = data.uri;
      const permission = await requestMediaPermission();
      if (!permission.granted) {
        alert("izin vermediniz");
      }
      await MediaLibrary.saveToLibraryAsync(uri);
    }
  };
  const handleFacesDetected = ({ faces }) => {
    if (faces.length === 0) {
      return;
    }
    const face = faces[0];

    const { bounds, yawAngle, rollAngle } = face;
    setBounds(bounds);
    setYawAngle(yawAngle);
    setRollAngle(rollAngle);

    if (Math.abs(rollAngle) > 15) {
      if (Math.sign(rollAngle) === 1) {
        setNoOptionSelected(true);
        setNoCount(noCount + 1);
      } else {
        setYesOptionSelected(true);
        setYesCount(yesCount + 1);
      }

      setTimeout(() => {
        setYesOptionSelected(false);
        setNoOptionSelected(false);
        if (questionIndex === questions.length - 1) {
          showResult();
          return;
        }
        setQuestionIndex(questionIndex + 1);
      }, 1500);
    }
  };
  const [cameraPermission, requestCameraPermission] =
    Camera.useCameraPermissions();
  if (!cameraPermission) {
    // Camera permissions are still loading
    return (
      <Text style={{ textAlign: "center" }}>Permissions still loading</Text>
    );
  }
  if (!cameraPermission.granted) {
    requestCameraPermission();
    return null;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        type={Camera.Constants.Type.front}
        onFacesDetected={handleFacesDetected}
        style={styles.camera}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      >
        {/* <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.recordVideo}
            onPress={handleRecordVideo}
          >
            <View style={recording ? styles.stop : styles.record}></View>
          </TouchableOpacity>
        </View> */}
      </Camera>
      <View
        style={[
          styles.faceBorder,
          {
            left: bounds.origin.x - 25,
            top: bounds.origin.y - 150,
            transform: [
              { rotateX: "0deg" },
              { rotateY: `${0}deg` },
              { rotateZ: `${rollAngle}deg` },
            ],
          },
        ]}
      >
        {showYesResult && (
          <View style={[styles.result, { backgroundColor: yesColor }]}>
            <Text style={styles.resultText}>TOKSİK DEĞİL</Text>
          </View>
        )}
        {showNoResult && (
          <View style={[styles.result, { backgroundColor: noColor }]}>
            <Text style={styles.resultText}>TOKSİK İLİŞKİ</Text>
          </View>
        )}

        {!showYesResult && !showNoResult && (
          <>
            <View style={styles.questionBox}>
              <Text style={styles.text}>{question.text}</Text>
            </View>
            <View style={styles.options}>
              <View style={[styles.option, { backgroundColor: yesColor }]}>
                <Text style={styles.text}>EVET</Text>
                {yesOptionSelected && <Text style={styles.optionSign}>✅</Text>}
              </View>
              <View style={[styles.option, { backgroundColor: noColor }]}>
                <Text style={styles.text}>HAYIR</Text>
                {noOptionSelected && <Text style={styles.optionSign}>⛔️</Text>}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    flexDirection: "row",
  },
  faceBorder: {
    position: "absolute",
  },
  questionBox: {
    maxWidth: 300,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "white",
    backgroundColor: "dodgerblue",
    padding: 12,
  },
  text: {
    color: "white",
    fontSize: 25,
    textAlign: "center",
  },
  options: {
    flexDirection: "row",
    marginTop: 10,
    alignSelf: "center",
    gap: 8,
  },
  option: {
    width: 120,
    height: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  result: {
    width: 300,
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: {
    fontSize: 32,
    color: "white",
  },
  recordVideo: {
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: "white",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  record: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "red",
  },
  stop: {
    width: 25,
    height: 25,
    borderRadius: 4,
    backgroundColor: "red",
  },
  topBar: {
    flex: 0.2,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
  },
  bottomBar: {
    alignSelf: "flex-end",
    paddingBottom: 24,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  optionSign: {
    position: "absolute",
    top: 30,
    fontSize: 24,
  },
});
