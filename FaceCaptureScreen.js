import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import VoiceService from '../services/VoiceService';
import OfflineManager from '../services/OfflineManager';
import FaceProcessor from '../services/FaceProcessor';

const { width, height } = Dimensions.get('window');

const FaceCaptureScreen = ({ navigation, route }) => {
  const [sessionId, setSessionId] = useState(null);
  const [language, setLanguage] = useState('en');
  const [isCapturing, setIsCapturing] = useState(false);
  const [livenessStep, setLivenessStep] = useState(0);
  const [livenessInstructions, setLivenessInstructions] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [livenessScore, setLivenessScore] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  
  const cameraRef = useRef(null);
  const faceDetectionInterval = useRef(null);

  const livenessChecks = [
    { type: 'look_straight', instruction: 'Look straight at the camera' },
    { type: 'blink', instruction: 'Blink your eyes twice' },
    { type: 'smile', instruction: 'Smile naturally' },
    { type: 'turn_left', instruction: 'Turn your head slightly left' },
    { type: 'turn_right', instruction: 'Turn your head slightly right' }
  ];

  useEffect(() => {
    if (route.params) {
      setSessionId(route.params.sessionId);
      setLanguage(route.params.language || 'en');
    }
    
    initializeLivenessChecks();
    playInstructions();
    
    return () => {
      if (faceDetectionInterval.current) {
        clearInterval(faceDetectionInterval.current);
      }
    };
  }, []);

  const initializeLivenessChecks = () => {
    // Randomize liveness checks for security
    const shuffled = [...livenessChecks].sort(() => Math.random() - 0.5);
    setLivenessInstructions(shuffled.slice(0, 3)); // Use 3 random checks
  };

  const playInstructions = async () => {
    try {
      await VoiceService.speakInstruction('captureFace', language);
    } catch (error) {
      console.log('Voice instruction failed:', error);
    }
  };

  const getLocalizedText = (key, lang) => {
    const texts = {
      title: {
        en: 'Face Verification',
        hi: 'चेहरा सत्यापन',
        te: 'ముఖ ధృవీకరణ',
        ta: 'முக சரிபார்ப்பு'
      },
      instruction: {
        en: 'Position your face in the circle',
        hi: 'अपना चेहरा वृत्त में रखें',
        te: 'మీ ముఖాన్ని వృత్తంలో ఉంచండి',
        ta: 'உங்கள் முகத்தை வட்டத்தில் வைக்கவும்'
      },
      livenessTitle: {
        en: 'Liveness Check',
        hi: 'जीवंतता जांच',
        te: 'జీవత్వ తనిఖీ',
        ta: 'உயிர்த்தன்மை சரிபார்ப்பு'
      },
      lookStraight: {
        en: 'Look straight at the camera',
        hi: 'कैमरे की ओर सीधे देखें',
        te: 'కెమెరా వైపు నేరుగా చూడండి',
        ta: 'கேமராவை நேராகப் பாருங்கள்'
      },
      blink: {
        en: 'Blink your eyes twice',
        hi: 'अपनी आंखें दो बार झपकाएं',
        te: 'మీ కళ్లను రెండుసార్లు రెప్పవేయండి',
        ta: 'உங்கள் கண்களை இரண்டு முறை சிமிட்டுங்கள்'
      },
      smile: {
        en: 'Smile naturally',
        hi: 'स्वाभाविक रूप से मुस्कुराएं',
        te: 'సహజంగా నవ్వండి',
        ta: 'இயல்பாக புன்னகையுங்கள்'
      },
      turnLeft: {
        en: 'Turn your head slightly left',
        hi: 'अपना सिर थोड़ा बाईं ओर घुमाएं',
        te: 'మీ తలను కొద్దిగా ఎడమవైపు తిప్పండి',
        ta: 'உங்கள் தலையை சற்று இடதுபுறம் திருப்புங்கள்'
      },
      turnRight: {
        en: 'Turn your head slightly right',
        hi: 'अपना सिर थोड़ा दाईं ओर घुमाएं',
        te: 'మీ తలను కొద్దిగా కుడివైపు తిప్పండి',
        ta: 'உங்கள் தலையை சற்று வலதுபுறம் திருப்புங்கள்'
      },
      capture: {
        en: 'Capture Photo',
        hi: 'फोटो लें',
        te: 'ఫోటో తీయండి',
        ta: 'புகைப்படம் எடுக்கவும்'
      },
      processing: {
        en: 'Processing...',
        hi: 'प्रसंस्करण...',
        te: 'ప్రాసెసింగ్...',
        ta: 'செயலாக்கம்...'
      }
    };
    return texts[key]?.[lang] || texts[key]?.en || '';
  };

  const onCameraReady = () => {
    setCameraReady(true);
    startFaceDetection();
  };

  const startFaceDetection = () => {
    faceDetectionInterval.current = setInterval(async () => {
      if (cameraRef.current && cameraReady && !isCapturing) {
        try {
          // Simulate face detection
          const detected = Math.random() > 0.3; // 70% detection rate
          setFaceDetected(detected);
          
          if (detected) {
            const score = 0.6 + Math.random() * 0.4;
            setLivenessScore(score);
          }
        } catch (error) {
          console.log('Face detection failed:', error);
        }
      }
    }, 500);
  };

  const performLivenessCheck = async () => {
    if (livenessStep >= livenessInstructions.length) {
      await captureFace();
      return;
    }

    const currentCheck = livenessInstructions[livenessStep];
    const instruction = getLocalizedText(currentCheck.type, language);
    
    try {
      await VoiceService.speak(instruction, language);
    } catch (error) {
      console.log('Liveness instruction failed:', error);
    }

    // Simulate liveness check completion after 3 seconds
    setTimeout(() => {
      setLivenessStep(prev => prev + 1);
      if (livenessStep + 1 < livenessInstructions.length) {
        performLivenessCheck();
      } else {
        setTimeout(() => captureFace(), 1000);
      }
    }, 3000);
  };

  const captureFace = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      const options = {
        quality: 0.8,
        base64: true,
        skipProcessing: false,
        forceUpOrientation: true,
      };
      
      const data = await cameraRef.current.takePictureAsync(options);
      
      // Process face
      await processFace(data);
      
    } catch (error) {
      console.error('Face capture failed:', error);
      Alert.alert('Error', 'Failed to capture face. Please try again.');
      setIsCapturing(false);
    }
  };

  const processFace = async (imageData) => {
    try {
      await VoiceService.speakInstruction('processing', language);
      
      // Process face with AI
      const result = await FaceProcessor.processFace(imageData, sessionId);
      
      if (result.success && result.livenessScore > 0.7) {
        // Save face data offline
        await OfflineManager.saveFaceData(sessionId, {
          imageUri: imageData.uri,
          imageBase64: imageData.base64,
          livenessScore: result.livenessScore,
          matchScore: result.matchScore,
          livenessChecks: livenessInstructions.map(check => check.type),
          processedAt: new Date().toISOString()
        });
        
        await VoiceService.speakInstruction('faceCaptured', language);
        
        // Navigate to verification
        navigation.navigate('Verification', {
          sessionId: sessionId,
          language: language
        });
      } else {
        // Show retry option
        setIsCapturing(false);
        setLivenessStep(0);
        Alert.alert(
          'Face Verification Issue',
          result.error || 'Face verification failed. Please try again.',
          [
            { text: 'Retry', onPress: () => initializeLivenessChecks() },
            { text: 'Tips', onPress: showFaceTips }
          ]
        );
      }
    } catch (error) {
      console.error('Face processing failed:', error);
      setIsCapturing(false);
      Alert.alert('Error', 'Failed to process face. Please try again.');
    }
  };

  const showFaceTips = () => {
    Alert.alert(
      'Face Capture Tips',
      '• Ensure good lighting on your face\n• Look directly at the camera\n• Remove glasses or hat if possible\n• Keep your face within the circle\n• Follow liveness instructions carefully',
      [{ text: 'OK' }]
    );
  };

  const getCurrentInstruction = () => {
    if (livenessStep < livenessInstructions.length) {
      const currentCheck = livenessInstructions[livenessStep];
      return getLocalizedText(currentCheck.type, language);
    }
    return getLocalizedText('instruction', language);
  };

  const renderFaceOverlay = () => (
    <View style={styles.overlay}>
      {/* Face circle */}
      <View style={[
        styles.faceCircle,
        faceDetected && styles.faceDetected,
        livenessScore > 0.8 && styles.highQuality
      ]}>
        <View style={styles.faceGuide} />
      </View>
      
      {/* Liveness progress */}
      {livenessStep > 0 && (
        <View style={styles.livenessProgress}>
          <Text style={styles.progressText}>
            {getLocalizedText('livenessTitle', language)}: {livenessStep}/{livenessInstructions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(livenessStep / livenessInstructions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      )}
      
      {/* Face detection indicator */}
      <View style={styles.detectionIndicator}>
        <View style={[
          styles.detectionDot,
          faceDetected && styles.detectionActive
        ]} />
        <Text style={styles.detectionText}>
          {faceDetected ? 'Face Detected' : 'Position your face'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getLocalizedText('title', language)}</Text>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <RNCamera
          ref={cameraRef}
          style={styles.camera}
          type={RNCamera.Constants.Type.front}
          flashMode={RNCamera.Constants.FlashMode.off}
          captureAudio={false}
          onCameraReady={onCameraReady}
          faceDetectionMode={RNCamera.Constants.FaceDetection.fast}
          faceDetectionLandmarks={RNCamera.Constants.FaceDetection.all}
          faceDetectionClassifications={RNCamera.Constants.FaceDetection.all}
          onFacesDetected={({ faces }) => {
            setFaceDetected(faces.length > 0);
          }}
        >
          {renderFaceOverlay()}
        </RNCamera>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instruction}>
          {getCurrentInstruction()}
        </Text>
        
        {livenessStep === 0 && (
          <View style={styles.tips}>
            <Text style={styles.tip}>• Remove glasses or hat</Text>
            <Text style={styles.tip}>• Ensure good lighting</Text>
            <Text style={styles.tip}>• Look directly at camera</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {livenessStep === 0 ? (
          <TouchableOpacity 
            style={[
              styles.startButton,
              !faceDetected && styles.disabledButton
            ]}
            onPress={performLivenessCheck}
            disabled={!faceDetected || isCapturing}
          >
            <Text style={styles.startButtonText}>Start Verification</Text>
          </TouchableOpacity>
        ) : livenessStep >= livenessInstructions.length ? (
          <TouchableOpacity 
            style={[styles.captureButton, isCapturing && styles.capturingButton]}
            onPress={captureFace}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color="#ffffff" size="large" />
            ) : (
              <Text style={styles.captureIcon}>📸</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.livenessIndicator}>
            <ActivityIndicator color="#1a73e8" size="large" />
            <Text style={styles.livenessText}>Follow the instruction above</Text>
          </View>
        )}
        
        <Text style={styles.controlText}>
          {isCapturing ? getLocalizedText('processing', language) : 
           livenessStep === 0 ? 'Position your face and start' :
           livenessStep >= livenessInstructions.length ? getLocalizedText('capture', language) :
           'Follow instructions'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceDetected: {
    borderColor: '#4caf50',
  },
  highQuality: {
    borderColor: '#2196f3',
    shadowColor: '#2196f3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  faceGuide: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  livenessProgress: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 12,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  detectionIndicator: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f44336',
    marginRight: 8,
  },
  detectionActive: {
    backgroundColor: '#4caf50',
  },
  detectionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  instruction: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  tips: {
    alignItems: 'center',
  },
  tip: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 2,
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  startButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 12,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  capturingButton: {
    backgroundColor: '#666666',
  },
  captureIcon: {
    fontSize: 32,
  },
  livenessIndicator: {
    alignItems: 'center',
    marginBottom: 12,
  },
  livenessText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
  },
  controlText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
});

export default FaceCaptureScreen;
