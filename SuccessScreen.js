import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  Share,
} from 'react-native';
import VoiceService from '../services/VoiceService';
import OfflineManager from '../services/OfflineManager';

const { width } = Dimensions.get('window');

const SuccessScreen = ({ navigation, route }) => {
  const [sessionId, setSessionId] = useState(null);
  const [language, setLanguage] = useState('en');
  const [verificationScore, setVerificationScore] = useState(0);
  const [sessionData, setSessionData] = useState(null);
  const [syncStatus, setSyncStatus] = useState('pending');

  useEffect(() => {
    if (route.params) {
      setSessionId(route.params.sessionId);
      setLanguage(route.params.language || 'en');
      setVerificationScore(route.params.score || 0);
    }
    
    loadSessionData();
    playCelebration();
    attemptSync();
  }, []);

  const loadSessionData = async () => {
    try {
      if (sessionId) {
        const session = await OfflineManager.getKYCSession(sessionId);
        const documents = await OfflineManager.getAllDocuments(sessionId);
        const faceData = await OfflineManager.getFaceData(sessionId);
        
        setSessionData({
          session,
          documents,
          faceData
        });
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  };

  const playCelebration = async () => {
    try {
      await VoiceService.speakInstruction('success', language);
    } catch (error) {
      console.log('Celebration voice failed:', error);
    }
  };

  const attemptSync = async () => {
    try {
      const syncResult = await OfflineManager.startBackgroundSync();
      setSyncStatus('completed');
    } catch (error) {
      console.log('Sync failed:', error);
      setSyncStatus('failed');
    }
  };

  const getLocalizedText = (key, lang) => {
    const texts = {
      title: {
        en: 'Verification Successful!',
        hi: 'सत्यापन सफल!',
        te: 'ధృవీకరణ విజయవంతమైంది!',
        ta: 'சரிபார்ப்பு வெற்றிகரமாக!'
      },
      subtitle: {
        en: 'Your identity has been verified',
        hi: 'आपकी पहचान सत्यापित हो गई है',
        te: 'మీ గుర్తింపు ధృవీకరించబడింది',
        ta: 'உங்கள் அடையாளம் சரிபார்க்கப்பட்டது'
      },
      score: {
        en: 'Verification Score',
        hi: 'सत्यापन स्कोर',
        te: 'ధృవీకరణ స్కోర్',
        ta: 'சரிபார்ப்பு மதிப்பெண்'
      },
      details: {
        en: 'Verification Details',
        hi: 'सत्यापन विवरण',
        te: 'ధృవీకరణ వివరాలు',
        ta: 'சரிபார்ப்பு விவரங்கள்'
      },
      documentVerified: {
        en: 'Document Verified',
        hi: 'दस्तावेज़ सत्यापित',
        te: 'పత్రం ధృవీకరించబడింది',
        ta: 'ஆவணம் சரிபார்க்கப்பட்டது'
      },
      faceVerified: {
        en: 'Face Verified',
        hi: 'चेहरा सत्यापित',
        te: 'ముఖం ధృవీకరించబడింది',
        ta: 'முகம் சரிபார்க்கப்பட்டது'
      },
      livenessConfirmed: {
        en: 'Liveness Confirmed',
        hi: 'जीवंतता पुष्ट',
        te: 'జీవత్వం నిర్ధారించబడింది',
        ta: 'உயிர்த்தன்மை உறுதி'
      },
      shareResults: {
        en: 'Share Results',
        hi: 'परिणाम साझा करें',
        te: 'ఫలితాలను పంచుకోండి',
        ta: 'முடிவுகளைப் பகிரவும்'
      },
      newVerification: {
        en: 'New Verification',
        hi: 'नया सत्यापन',
        te: 'కొత్త ధృవీకరణ',
        ta: 'புதிய சரிபார்ப்பு'
      },
      finish: {
        en: 'Finish',
        hi: 'समाप्त',
        te: 'ముగించు',
        ta: 'முடிக்கவும்'
      },
      syncPending: {
        en: 'Syncing to server...',
        hi: 'सर्वर से सिंक हो रहा है...',
        te: 'సర్వర్‌కు సింక్ అవుతోంది...',
        ta: 'சர்வருக்கு ஒத்திசைக்கிறது...'
      },
      syncCompleted: {
        en: 'Synced successfully',
        hi: 'सफलतापूर्वक सिंक हुआ',
        te: 'విజయవంతంగా సింక్ అయింది',
        ta: 'வெற்றிகரமாக ஒத்திசைக்கப்பட்டது'
      },
      syncFailed: {
        en: 'Sync failed - will retry later',
        hi: 'सिंक विफल - बाद में पुनः प्रयास करेगा',
        te: 'సింక్ విఫలమైంది - తర్వాత మళ్లీ ప్రయత్నిస్తుంది',
        ta: 'ஒத்திசைவு தோல்வி - பின்னர் மீண்டும் முயற்சிக்கும்'
      }
    };
    return texts[key]?.[lang] || texts[key]?.en || '';
  };

  const getScoreColor = (score) => {
    if (score >= 0.9) return '#4caf50';
    if (score >= 0.8) return '#8bc34a';
    if (score >= 0.7) return '#ff9800';
    return '#f44336';
  };

  const getScoreGrade = (score) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Good';
    if (score >= 0.7) return 'Fair';
    return 'Poor';
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `KYC Verification Completed!\nScore: ${Math.round(verificationScore * 100)}%\nVerified with Bharat KYC`,
        title: 'KYC Verification Results'
      };
      
      await Share.share(shareContent);
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  const handleNewVerification = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleFinish = () => {
    // In a real app, this would close the KYC flow and return to the parent app
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const renderSyncStatus = () => {
    const getSyncIcon = () => {
      switch (syncStatus) {
        case 'pending': return '⏳';
        case 'completed': return '✅';
        case 'failed': return '⚠️';
        default: return '⏳';
      }
    };

    const getSyncColor = () => {
      switch (syncStatus) {
        case 'pending': return '#ff9800';
        case 'completed': return '#4caf50';
        case 'failed': return '#f44336';
        default: return '#ff9800';
      }
    };

    return (
      <View style={[styles.syncContainer, { backgroundColor: getSyncColor() + '20' }]}>
        <Text style={styles.syncIcon}>{getSyncIcon()}</Text>
        <Text style={[styles.syncText, { color: getSyncColor() }]}>
          {syncStatus === 'pending' && getLocalizedText('syncPending', language)}
          {syncStatus === 'completed' && getLocalizedText('syncCompleted', language)}
          {syncStatus === 'failed' && getLocalizedText('syncFailed', language)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Success Animation Area */}
      <View style={styles.celebrationContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.title}>{getLocalizedText('title', language)}</Text>
        <Text style={styles.subtitle}>{getLocalizedText('subtitle', language)}</Text>
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>{getLocalizedText('score', language)}</Text>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor(verificationScore) }]}>
          <Text style={[styles.scoreValue, { color: getScoreColor(verificationScore) }]}>
            {Math.round(verificationScore * 100)}%
          </Text>
          <Text style={styles.scoreGrade}>{getScoreGrade(verificationScore)}</Text>
        </View>
      </View>

      {/* Verification Details */}
      <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.detailsTitle}>{getLocalizedText('details', language)}</Text>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📄</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{getLocalizedText('documentVerified', language)}</Text>
            <Text style={styles.detailValue}>
              {sessionData?.documents?.[0]?.type?.toUpperCase() || 'Document'}
            </Text>
          </View>
          <Text style={styles.detailCheck}>✓</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>👤</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{getLocalizedText('faceVerified', language)}</Text>
            <Text style={styles.detailValue}>
              {sessionData?.faceData ? 'Face Match Successful' : 'Face Verified'}
            </Text>
          </View>
          <Text style={styles.detailCheck}>✓</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>🔒</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{getLocalizedText('livenessConfirmed', language)}</Text>
            <Text style={styles.detailValue}>
              {Math.round((sessionData?.faceData?.livenessScore || 0.85) * 100)}% Confidence
            </Text>
          </View>
          <Text style={styles.detailCheck}>✓</Text>
        </View>

        {/* Sync Status */}
        {renderSyncStatus()}

        {/* Session Info */}
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionLabel}>Session ID:</Text>
          <Text style={styles.sessionValue}>{sessionId?.slice(-8) || 'N/A'}</Text>
        </View>
        
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionLabel}>Completed:</Text>
          <Text style={styles.sessionValue}>
            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareButtonText}>{getLocalizedText('shareResults', language)}</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleNewVerification}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>{getLocalizedText('newVerification', language)}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleFinish}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>{getLocalizedText('finish', language)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  celebrationContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  checkmark: {
    fontSize: 60,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreGrade: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#666666',
  },
  detailCheck: {
    fontSize: 24,
    color: '#4caf50',
  },
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  syncIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  syncText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sessionLabel: {
    fontSize: 14,
    color: '#666666',
  },
  sessionValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  shareIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a73e8',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1a73e8',
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default SuccessScreen;
