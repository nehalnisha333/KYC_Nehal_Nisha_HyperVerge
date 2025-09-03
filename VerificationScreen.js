import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import VoiceService from '../services/VoiceService';
import OfflineManager from '../services/OfflineManager';

const { width } = Dimensions.get('window');

const VerificationScreen = ({ navigation, route }) => {
  const [sessionId, setSessionId] = useState(null);
  const [language, setLanguage] = useState('en');
  const [verificationSteps, setVerificationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (route.params) {
      setSessionId(route.params.sessionId);
      setLanguage(route.params.language || 'en');
    }
    
    startVerification();
  }, []);

  const startVerification = async () => {
    try {
      await VoiceService.speakInstruction('processing', language);
      
      // Initialize verification steps
      const steps = [
        { id: 'document', name: 'Document Verification', status: 'processing' },
        { id: 'face', name: 'Face Verification', status: 'pending' },
        { id: 'matching', name: 'Face Matching', status: 'pending' },
        { id: 'final', name: 'Final Validation', status: 'pending' }
      ];
      
      setVerificationSteps(steps);
      
      // Process each step
      await processVerificationSteps(steps);
      
    } catch (error) {
      console.error('Verification failed:', error);
      // Handle error
    }
  };

  const processVerificationSteps = async (steps) => {
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // Update step status to processing
      const updatedSteps = [...steps];
      updatedSteps[i].status = 'processing';
      setVerificationSteps(updatedSteps);
      
      // Process the step
      const result = await processStep(steps[i]);
      
      // Update step status based on result
      updatedSteps[i].status = result.success ? 'completed' : 'failed';
      updatedSteps[i].score = result.score;
      updatedSteps[i].details = result.details;
      setVerificationSteps(updatedSteps);
      
      // Wait a bit before next step
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Calculate overall score and complete verification
    await completeVerification();
  };

  const processStep = async (step) => {
    switch (step.id) {
      case 'document':
        return await verifyDocument();
      case 'face':
        return await verifyFace();
      case 'matching':
        return await performFaceMatching();
      case 'final':
        return await performFinalValidation();
      default:
        return { success: false, score: 0 };
    }
  };

  const verifyDocument = async () => {
    // Get document data from offline storage
    const documents = await OfflineManager.getAllDocuments(sessionId);
    
    if (documents.length === 0) {
      return {
        success: false,
        score: 0,
        details: 'No document found'
      };
    }
    
    // Simulate document verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const document = documents[0];
    const score = document.qualityScore || 0.85;
    
    return {
      success: score > 0.7,
      score: score,
      details: {
        documentType: document.type,
        qualityScore: score,
        extractedData: document.extractedData
      }
    };
  };

  const verifyFace = async () => {
    // Get face data from offline storage
    const faceData = await OfflineManager.getFaceData(sessionId);
    
    if (!faceData) {
      return {
        success: false,
        score: 0,
        details: 'No face data found'
      };
    }
    
    // Simulate face verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const livenessScore = faceData.livenessScore || 0.88;
    
    return {
      success: livenessScore > 0.7,
      score: livenessScore,
      details: {
        livenessScore: livenessScore,
        livenessChecks: faceData.livenessChecks
      }
    };
  };

  const performFaceMatching = async () => {
    // Simulate face matching between document and selfie
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const matchScore = 0.82 + Math.random() * 0.15;
    
    return {
      success: matchScore > 0.75,
      score: matchScore,
      details: {
        matchScore: matchScore,
        confidence: 0.92
      }
    };
  };

  const performFinalValidation = async () => {
    // Perform final validation checks
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate overall score from all steps
    const completedSteps = verificationSteps.filter(step => step.status === 'completed');
    const avgScore = completedSteps.reduce((sum, step) => sum + (step.score || 0), 0) / completedSteps.length;
    
    setOverallScore(avgScore);
    
    return {
      success: avgScore > 0.75,
      score: avgScore,
      details: {
        overallScore: avgScore,
        completedSteps: completedSteps.length,
        totalSteps: verificationSteps.length
      }
    };
  };

  const completeVerification = async () => {
    setIsProcessing(false);
    
    const allCompleted = verificationSteps.every(step => step.status === 'completed');
    
    if (allCompleted && overallScore > 0.75) {
      await VoiceService.speakInstruction('success', language);
      
      // Update session with final result
      await OfflineManager.updateKYCSession(sessionId, {
        status: 'completed',
        verificationScore: overallScore,
        completedAt: new Date().toISOString()
      });
      
      // Navigate to success screen
      setTimeout(() => {
        navigation.navigate('Success', {
          sessionId: sessionId,
          language: language,
          score: overallScore
        });
      }, 2000);
    } else {
      await VoiceService.speakInstruction('retry', language);
      
      // Navigate back or show retry options
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
    }
  };

  const getLocalizedText = (key, lang) => {
    const texts = {
      title: {
        en: 'Verification in Progress',
        hi: 'सत्यापन प्रगति में',
        te: 'ధృవీకరణ ప్రగతిలో ఉంది',
        ta: 'சரிபார்ப்பு முன்னேற்றத்தில்'
      },
      processing: {
        en: 'Processing your verification...',
        hi: 'आपके सत्यापन को प्रोसेस कर रहे हैं...',
        te: 'మీ ధృవీకరణను ప్రాసెస్ చేస్తున్నాము...',
        ta: 'உங்கள் சரிபார்ப்பை செயலாக்குகிறோம்...'
      },
      documentVerification: {
        en: 'Document Verification',
        hi: 'दस्तावेज़ सत्यापन',
        te: 'పత్రం ధృవీకరణ',
        ta: 'ஆவண சரிபார்ப்பு'
      },
      faceVerification: {
        en: 'Face Verification',
        hi: 'चेहरा सत्यापन',
        te: 'ముఖ ధృవీకరణ',
        ta: 'முக சரிபார்ப்பு'
      },
      faceMatching: {
        en: 'Face Matching',
        hi: 'चेहरा मिलान',
        te: 'ముఖ మ్యాచింగ్',
        ta: 'முக பொருத்தம்'
      },
      finalValidation: {
        en: 'Final Validation',
        hi: 'अंतिम सत्यापन',
        te: 'చివరి ధృవీకరణ',
        ta: 'இறுதி சரிபார்ப்பு'
      },
      overallScore: {
        en: 'Overall Score',
        hi: 'समग्र स्कोर',
        te: 'మొత్తం స్కోర్',
        ta: 'ஒட்டுமொத்த மதிப்பெண்'
      }
    };
    return texts[key]?.[lang] || texts[key]?.en || '';
  };

  const getStepName = (stepId, lang) => {
    const names = {
      document: getLocalizedText('documentVerification', lang),
      face: getLocalizedText('faceVerification', lang),
      matching: getLocalizedText('faceMatching', lang),
      final: getLocalizedText('finalValidation', lang)
    };
    return names[stepId] || stepId;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'failed': return '❌';
      default: return '⭕';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'processing': return '#ff9800';
      case 'failed': return '#f44336';
      default: return '#cccccc';
    }
  };

  const renderVerificationStep = (step, index) => {
    const isActive = index === currentStep;
    const statusColor = getStatusColor(step.status);
    
    return (
      <View key={step.id} style={[styles.stepContainer, isActive && styles.activeStep]}>
        <View style={styles.stepHeader}>
          <View style={[styles.stepIcon, { backgroundColor: statusColor }]}>
            {step.status === 'processing' ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.stepIconText}>{getStatusIcon(step.status)}</Text>
            )}
          </View>
          <Text style={[styles.stepName, isActive && styles.activeStepName]}>
            {getStepName(step.id, language)}
          </Text>
          {step.score !== undefined && (
            <Text style={styles.stepScore}>{Math.round(step.score * 100)}%</Text>
          )}
        </View>
        
        {step.details && (
          <View style={styles.stepDetails}>
            {step.id === 'document' && step.details.extractedData && (
              <Text style={styles.detailText}>
                Name: {step.details.extractedData.name}
              </Text>
            )}
            {step.id === 'face' && (
              <Text style={styles.detailText}>
                Liveness Score: {Math.round((step.details.livenessScore || 0) * 100)}%
              </Text>
            )}
            {step.id === 'matching' && (
              <Text style={styles.detailText}>
                Match Score: {Math.round((step.details.matchScore || 0) * 100)}%
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{getLocalizedText('title', language)}</Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {getLocalizedText('processing', language)}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / verificationSteps.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressStep}>
          Step {currentStep + 1} of {verificationSteps.length}
        </Text>
      </View>

      {/* Verification Steps */}
      <ScrollView style={styles.stepsContainer} showsVerticalScrollIndicator={false}>
        {verificationSteps.map(renderVerificationStep)}
      </ScrollView>

      {/* Overall Score */}
      {!isProcessing && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>{getLocalizedText('overallScore', language)}</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{Math.round(overallScore * 100)}%</Text>
          </View>
          <Text style={styles.scoreStatus}>
            {overallScore > 0.75 ? 'Verification Successful' : 'Verification Failed'}
          </Text>
        </View>
      )}

      {/* Loading Indicator */}
      {isProcessing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>
            {verificationSteps[currentStep]?.name || 'Processing...'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#1a73e8',
    borderRadius: 3,
  },
  progressStep: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  stepsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeStep: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1a73e8',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIconText: {
    fontSize: 16,
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  activeStepName: {
    color: '#1a73e8',
  },
  stepScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4caf50',
  },
  stepDetails: {
    marginTop: 8,
    marginLeft: 44,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
  },
  scoreContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scoreStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
});

export default VerificationScreen;
