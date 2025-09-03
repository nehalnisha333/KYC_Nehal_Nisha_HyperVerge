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
import DocumentProcessor from '../services/DocumentProcessor';

const { width, height } = Dimensions.get('window');

const DocumentCaptureScreen = ({ navigation, route }) => {
  const [documentType, setDocumentType] = useState('aadhaar');
  const [language, setLanguage] = useState('en');
  const [isCapturing, setIsCapturing] = useState(false);
  const [qualityScore, setQualityScore] = useState(0);
  const [qualityFeedback, setQualityFeedback] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [flashMode, setFlashMode] = useState('off');
  const [cameraReady, setCameraReady] = useState(false);
  
  const cameraRef = useRef(null);
  const qualityCheckInterval = useRef(null);

  useEffect(() => {
    if (route.params) {
      setDocumentType(route.params.documentType || 'aadhaar');
      setLanguage(route.params.language || 'en');
    }
    
    initializeSession();
    playInstructions();
    
    return () => {
      if (qualityCheckInterval.current) {
        clearInterval(qualityCheckInterval.current);
      }
    };
  }, []);

  const initializeSession = async () => {
    try {
      const sessionData = {
        documentType: documentType,
        language: language,
        startedAt: new Date().toISOString(),
      };
      
      const id = await OfflineManager.saveKYCSession(sessionData);
      setSessionId(id);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  };

  const playInstructions = async () => {
    try {
      const message = getLocalizedText('captureInstruction', language);
      await VoiceService.speakInstruction('captureDocument', language, { 
        documentType: getDocumentName(documentType, language) 
      });
    } catch (error) {
      console.log('Voice instruction failed:', error);
    }
  };

  const getLocalizedText = (key, lang) => {
    const texts = {
      title: {
        en: 'Capture Document',
        hi: 'दस्तावेज़ कैप्चर करें',
        te: 'పత్రాన్ని క్యాప్చర్ చేయండి',
        ta: 'ஆவணத்தைப் பிடிக்கவும்'
      },
      captureInstruction: {
        en: 'Place your document inside the frame',
        hi: 'अपने दस्तावेज़ को फ्रेम के अंदर रखें',
        te: 'మీ పత్రాన్ని ఫ్రేమ్ లోపల ఉంచండి',
        ta: 'உங்கள் ஆவணத்தை சட்டத்திற்குள் வைக்கவும்'
      },
      qualityTips: {
        en: 'Tips for better capture:',
        hi: 'बेहतर कैप्चर के लिए सुझाव:',
        te: 'మెరుగైన క్యాప్చర్ కోసం చిట్కాలు:',
        ta: 'சிறந்த பிடிப்புக்கான குறிப்புகள்:'
      },
      goodLighting: {
        en: '• Good lighting',
        hi: '• अच्छी रोशनी',
        te: '• మంచి వెలుతురు',
        ta: '• நல்ல வெளிச்சம்'
      },
      steadyHands: {
        en: '• Steady hands',
        hi: '• स्थिर हाथ',
        te: '• స్థిరమైన చేతులు',
        ta: '• நிலையான கைகள்'
      },
      allCorners: {
        en: '• All corners visible',
        hi: '• सभी कोने दिखाई दें',
        te: '• అన్ని మూలలు కనిపించాలి',
        ta: '• அனைத்து மூலைகளும் தெரியும்'
      },
      capture: {
        en: 'Capture',
        hi: 'कैप्चर करें',
        te: 'క్యాప్చర్',
        ta: 'பிடிக்கவும்'
      },
      retake: {
        en: 'Retake',
        hi: 'फिर से लें',
        te: 'మళ్లీ తీయండి',
        ta: 'மீண்டும் எடுக்கவும்'
      }
    };
    return texts[key]?.[lang] || texts[key]?.en || '';
  };

  const getDocumentName = (type, lang) => {
    const names = {
      aadhaar: { en: 'Aadhaar Card', hi: 'आधार कार्ड', te: 'ఆధార్ కార్డ్', ta: 'ஆதார் அட்டை' },
      pan: { en: 'PAN Card', hi: 'पैन कार्ड', te: 'పాన్ కార్డ్', ta: 'பான் அட்டை' },
      driving_license: { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस', te: 'డ్రైవింగ్ లైసెన్స్', ta: 'ஓட்டுநர் உரிமம்' },
      voter_id: { en: 'Voter ID', hi: 'वोटर आईडी', te: 'వోటర్ ఐడి', ta: 'வாக்காளர் அடையாள அட்டை' },
      passport: { en: 'Passport', hi: 'पासपोर्ट', te: 'పాస్‌పోర్ట్', ta: 'கடவுச்சீட்டு' }
    };
    return names[type]?.[lang] || names[type]?.en || type;
  };

  const onCameraReady = () => {
    setCameraReady(true);
    startQualityCheck();
  };

  const startQualityCheck = () => {
    qualityCheckInterval.current = setInterval(async () => {
      if (cameraRef.current && cameraReady && !isCapturing) {
        try {
          // Simulate quality check - in real app, this would analyze camera preview
          const mockQuality = await simulateQualityCheck();
          setQualityScore(mockQuality.score);
          setQualityFeedback(mockQuality.feedback);
        } catch (error) {
          console.log('Quality check failed:', error);
        }
      }
    }, 1000);
  };

  const simulateQualityCheck = async () => {
    // Simulate document quality analysis
    const score = Math.random() * 100;
    const feedback = [];
    
    if (score < 60) {
      feedback.push({ type: 'blur', message: 'Image appears blurry', icon: '📱' });
    }
    if (score < 70) {
      feedback.push({ type: 'lighting', message: 'Need better lighting', icon: '💡' });
    }
    if (score < 50) {
      feedback.push({ type: 'distance', message: 'Move closer to document', icon: '🔍' });
    }
    
    return { score, feedback };
  };

  const captureDocument = async () => {
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
      
      // Process document
      await processDocument(data);
      
    } catch (error) {
      console.error('Document capture failed:', error);
      Alert.alert('Error', 'Failed to capture document. Please try again.');
      setIsCapturing(false);
    }
  };

  const processDocument = async (imageData) => {
    try {
      // Show processing feedback
      await VoiceService.speakInstruction('processing', language);
      
      // Process document with AI
      const result = await DocumentProcessor.processDocument(imageData, documentType);
      
      if (result.success && result.qualityScore > 0.7) {
        // Save document data offline
        await OfflineManager.saveDocumentData(sessionId, {
          type: documentType,
          imageUri: imageData.uri,
          imageBase64: imageData.base64,
          extractedData: result.extractedData,
          qualityScore: result.qualityScore,
          processedAt: new Date().toISOString()
        });
        
        await VoiceService.speakInstruction('documentCaptured', language);
        
        // Navigate to face capture
        navigation.navigate('FaceCapture', {
          sessionId: sessionId,
          documentType: documentType,
          language: language
        });
      } else {
        // Show retry option
        setIsCapturing(false);
        Alert.alert(
          'Document Quality Issue',
          result.error || 'Document quality is too low. Please try again.',
          [
            { text: 'Retry', onPress: () => {} },
            { text: 'Tips', onPress: showQualityTips }
          ]
        );
      }
    } catch (error) {
      console.error('Document processing failed:', error);
      setIsCapturing(false);
      Alert.alert('Error', 'Failed to process document. Please try again.');
    }
  };

  const showQualityTips = () => {
    Alert.alert(
      'Quality Tips',
      '• Ensure good lighting\n• Hold camera steady\n• Keep document flat\n• All corners should be visible\n• Avoid shadows and glare',
      [{ text: 'OK' }]
    );
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  const renderQualityIndicator = () => {
    const getQualityColor = (score) => {
      if (score >= 80) return '#4caf50';
      if (score >= 60) return '#ff9800';
      return '#f44336';
    };

    return (
      <View style={styles.qualityContainer}>
        <View style={styles.qualityBar}>
          <Text style={styles.qualityText}>Quality: {Math.round(qualityScore)}%</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${qualityScore}%`, 
                  backgroundColor: getQualityColor(qualityScore) 
                }
              ]} 
            />
          </View>
        </View>
        
        {qualityFeedback.map((feedback, index) => (
          <View key={index} style={styles.feedbackItem}>
            <Text style={styles.feedbackIcon}>{feedback.icon}</Text>
            <Text style={styles.feedbackText}>{feedback.message}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCameraOverlay = () => (
    <View style={styles.overlay}>
      {/* Document frame */}
      <View style={styles.documentFrame}>
        <View style={styles.frameCorner} />
        <View style={[styles.frameCorner, styles.topRight]} />
        <View style={[styles.frameCorner, styles.bottomLeft]} />
        <View style={[styles.frameCorner, styles.bottomRight]} />
      </View>
      
      {/* Quality indicator */}
      {renderQualityIndicator()}
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
        <Text style={styles.title}>
          {getLocalizedText('title', language)} - {getDocumentName(documentType, language)}
        </Text>
        <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
          <Text style={styles.flashIcon}>{flashMode === 'on' ? '🔦' : '💡'}</Text>
        </TouchableOpacity>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <RNCamera
          ref={cameraRef}
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
          flashMode={flashMode === 'on' ? RNCamera.Constants.FlashMode.on : RNCamera.Constants.FlashMode.off}
          captureAudio={false}
          onCameraReady={onCameraReady}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        >
          {renderCameraOverlay()}
        </RNCamera>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instruction}>
          {getLocalizedText('captureInstruction', language)}
        </Text>
        
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>{getLocalizedText('qualityTips', language)}</Text>
          <Text style={styles.tip}>{getLocalizedText('goodLighting', language)}</Text>
          <Text style={styles.tip}>{getLocalizedText('steadyHands', language)}</Text>
          <Text style={styles.tip}>{getLocalizedText('allCorners', language)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.captureButton, isCapturing && styles.capturingButton]}
          onPress={captureDocument}
          disabled={isCapturing || qualityScore < 50}
        >
          {isCapturing ? (
            <ActivityIndicator color="#ffffff" size="large" />
          ) : (
            <Text style={styles.captureIcon}>📸</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.captureText}>
          {isCapturing ? 'Processing...' : getLocalizedText('capture', language)}
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
  flashButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashIcon: {
    fontSize: 24,
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
  documentFrame: {
    width: width * 0.8,
    height: width * 0.5,
    position: 'relative',
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#ffffff',
    borderWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  qualityContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 12,
  },
  qualityBar: {
    marginBottom: 8,
  },
  qualityText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedbackIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: 12,
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
  tipsTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  capturingButton: {
    backgroundColor: '#666666',
  },
  captureIcon: {
    fontSize: 32,
  },
  captureText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocumentCaptureScreen;
