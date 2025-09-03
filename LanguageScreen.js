import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VoiceService from '../services/VoiceService';

const { width } = Dimensions.get('window');

const languages = [
  { code: 'hi', name: 'हिंदी', englishName: 'Hindi', flag: '🇮🇳' },
  { code: 'en', name: 'English', englishName: 'English', flag: '🇺🇸' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', flag: '🇮🇳' },
];

const LanguageScreen = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  useEffect(() => {
    initializeVoice();
    loadSavedLanguage();
  }, []);

  const initializeVoice = async () => {
    try {
      await VoiceService.initialize();
      setIsVoiceEnabled(true);
      await VoiceService.speak('Please select your preferred language', 'en');
    } catch (error) {
      console.log('Voice service initialization failed:', error);
    }
  };

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('userLanguage');
      if (saved) {
        setSelectedLanguage(saved);
      }
    } catch (error) {
      console.log('Failed to load saved language:', error);
    }
  };

  const handleLanguageSelect = async (languageCode) => {
    setSelectedLanguage(languageCode);
    
    if (isVoiceEnabled) {
      const language = languages.find(lang => lang.code === languageCode);
      await VoiceService.speak(`You selected ${language.englishName}`, 'en');
    }
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('userLanguage', selectedLanguage);
      
      if (isVoiceEnabled) {
        await VoiceService.speak('Great! Now let us choose your document type', selectedLanguage);
      }
      
      navigation.navigate('DocumentType', { language: selectedLanguage });
    } catch (error) {
      console.log('Failed to save language preference:', error);
    }
  };

  const getWelcomeText = () => {
    switch (selectedLanguage) {
      case 'hi': return 'अपनी भाषा चुनें';
      case 'te': return 'మీ భాషను ఎంచుకోండి';
      case 'ta': return 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்';
      case 'bn': return 'আপনার ভাষা নির্বাচন করুন';
      case 'gu': return 'તમારી ભાષા પસંદ કરો';
      default: return 'Select Your Language';
    }
  };

  const getContinueText = () => {
    switch (selectedLanguage) {
      case 'hi': return 'आगे बढ़ें';
      case 'te': return 'కొనసాగించు';
      case 'ta': return 'தொடரவும்';
      case 'bn': return 'এগিয়ে যান';
      case 'gu': return 'આગળ વધો';
      default: return 'Continue';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getWelcomeText()}</Text>
      </View>

      {/* Voice Indicator */}
      {isVoiceEnabled && (
        <View style={styles.voiceIndicator}>
          <Text style={styles.voiceIcon}>🔊</Text>
          <Text style={styles.voiceText}>Voice guidance active</Text>
        </View>
      )}

      {/* Language Options */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageOption,
              selectedLanguage === language.code && styles.selectedOption
            ]}
            onPress={() => handleLanguageSelect(language.code)}
            activeOpacity={0.7}
          >
            <View style={styles.languageContent}>
              <Text style={styles.flag}>{language.flag}</Text>
              <View style={styles.languageText}>
                <Text style={[
                  styles.languageName,
                  selectedLanguage === language.code && styles.selectedText
                ]}>
                  {language.name}
                </Text>
                <Text style={[
                  styles.englishName,
                  selectedLanguage === language.code && styles.selectedSubtext
                ]}>
                  {language.englishName}
                </Text>
              </View>
              {selectedLanguage === language.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedLanguage && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>{getContinueText()}</Text>
          <Text style={styles.continueArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#1a73e8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  voiceIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  voiceText: {
    fontSize: 14,
    color: '#2d7d2d',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  languageOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1a73e8',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  englishName: {
    fontSize: 16,
    color: '#666666',
  },
  selectedText: {
    color: '#1a73e8',
  },
  selectedSubtext: {
    color: '#1565c0',
  },
  checkmark: {
    fontSize: 24,
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
  },
  continueButton: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#1a73e8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  continueArrow: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LanguageScreen;
