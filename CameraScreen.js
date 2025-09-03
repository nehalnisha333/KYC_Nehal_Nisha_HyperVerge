import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export default function CameraScreen({ type = 'document', onCapture, onBack }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted' && mediaLibraryStatus.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: false,
        });

        // Save to device
        const asset = await MediaLibrary.createAssetAsync(photo.uri);
        
        // Process the image based on type
        const processedData = await processImage(photo, type);
        
        onCapture({
          uri: photo.uri,
          base64: photo.base64,
          processed: processedData,
          type: type
        });

      } catch (error) {
        Alert.alert('Error', 'Failed to capture image: ' + error.message);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const processImage = async (photo, type) => {
    // Simulate real-time processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (type === 'document') {
      return {
        documentType: 'aadhaar',
        confidence: 0.94,
        extractedText: 'AADHAAR\n1234 5678 9012\nJohn Doe\nDOB: 01/01/1990',
        corners: [[100, 100], [300, 100], [300, 200], [100, 200]],
        quality: 'good'
      };
    } else if (type === 'face') {
      return {
        faceDetected: true,
        confidence: 0.96,
        livenessScore: 0.89,
        faceBox: [120, 150, 180, 220],
        landmarks: {
          leftEye: [140, 170],
          rightEye: [160, 170],
          nose: [150, 185],
          mouth: [150, 200]
        }
      };
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission denied</Text>
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        ratio="16:9"
      >
        <View style={styles.overlay}>
          {type === 'document' && (
            <View style={styles.documentFrame}>
              <Text style={styles.instruction}>Position document within frame</Text>
            </View>
          )}
          
          {type === 'face' && (
            <View style={styles.faceFrame}>
              <Text style={styles.instruction}>Position your face in the circle</Text>
            </View>
          )}
        </View>
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.controlText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.captureButton, isCapturing && styles.capturing]} 
          onPress={takePicture}
          disabled={isCapturing}
        >
          <Text style={styles.captureText}>
            {isCapturing ? 'Processing...' : 'Capture'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.flipButton} 
          onPress={() => setCameraType(
            cameraType === Camera.Constants.Type.back
              ? Camera.Constants.Type.front
              : Camera.Constants.Type.back
          )}
        >
          <Text style={styles.controlText}>Flip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentFrame: {
    width: 300,
    height: 200,
    borderWidth: 3,
    borderColor: '#00ff00',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#00ff00',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruction: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'black',
  },
  backButton: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    minWidth: 70,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  capturing: {
    backgroundColor: '#ffaa00',
  },
  flipButton: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    minWidth: 70,
    alignItems: 'center',
  },
  controlText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captureText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 25,
    margin: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
