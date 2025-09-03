import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import VoiceService from '../services/VoiceService';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  useEffect(() => {
    // Play welcome message
    playWelcomeMessage();
  }, []);

  const playWelcomeMessage = async () => {
    try {
      await VoiceService.speak(
        'Welcome to Bharat KYC. We will help you verify your documents quickly and easily.',
        'en'
      );
      setIsVoiceEnabled(true);
    } catch (error) {
      console.log('Voice service not available');
    }
  };

  const handleContinue = async () => {
    if (isVoiceEnabled) {
      await VoiceService.speak('Let us select your language', 'en');
    }
    navigation.navigate('Language');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/india-flag.png')} 
          style={styles.flag}
        />
        <Text style={styles.title}>🇮🇳 Bharat KYC</Text>
        <Text style={styles.subtitle}>Digital Identity Verification</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.mainIcon}>📱</Text>
        </View>
        
        <Text style={styles.welcomeText}>
          Verify your identity in just 5 minutes
        </Text>
        
        <Text style={styles.description}>
          • Safe and secure verification{'\n'}
          • Works offline{'\n'}
          • Available in multiple languages{'\n'}
          • Voice guidance available
        </Text>

        {/* Voice Indicator */}
        {isVoiceEnabled && (
          <View style={styles.voiceIndicator}>
            <Text style={styles.voiceIcon}>🔊</Text>
            <Text style={styles.voiceText}>Voice Guide Active</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Get Started</Text>
          <Text style={styles.continueArrow}>→</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Secure • Private • Government Approved
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  flag: {
    width: 40,
    height: 30,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  mainIcon: {
    fontSize: 80,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 30,
  },
  description: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 30,
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  voiceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  voiceText: {
    fontSize: 16,
    color: '#2d7d2d',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 20,
    minWidth: width * 0.8,
    shadowColor: '#1a73e8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  continueArrow: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
