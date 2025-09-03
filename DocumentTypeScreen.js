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
import VoiceService from '../services/VoiceService';

const { width } = Dimensions.get('window');

const documentTypes = [
  {
    id: 'aadhaar',
    icon: '📄',
    name: { en: 'Aadhaar Card', hi: 'आधार कार्ड', te: 'ఆధార్ కార్డ్', ta: 'ஆதார் அட்டை' },
    description: { en: 'Government ID with biometric data', hi: 'बायोमेट्रिक डेटा के साथ सरकारी पहचान', te: 'బయోమెట్రిక్ డేటాతో ప్రభుత్వ గుర్తింపు', ta: 'பயோமெட்ரிக் தரவுடன் அரசு அடையாள அட்டை' },
    popular: true
  },
  {
    id: 'pan',
    icon: '🆔',
    name: { en: 'PAN Card', hi: 'पैन कार्ड', te: 'పాన్ కార్డ్', ta: 'பான் அட்டை' },
    description: { en: 'Permanent Account Number', hi: 'स्थायी खाता संख्या', te: 'శాశ్వత ఖాతా సంఖ్య', ta: 'நிரந்தர கணக்கு எண்' },
    popular: true
  },
  {
    id: 'driving_license',
    icon: '🚗',
    name: { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस', te: 'డ్రైవింగ్ లైసెన్స్', ta: 'ஓட்டுநர் உரிமம்' },
    description: { en: 'Valid driving permit', hi: 'वैध ड्राइविंग परमिट', te: 'చెల్లుబాటు అయ్యే డ్రైవింగ్ అనుమతి', ta: 'செல்லுபடியாகும் ஓட்டுநர் அனுமதி' },
    popular: false
  },
  {
    id: 'voter_id',
    icon: '🗳️',
    name: { en: 'Voter ID', hi: 'वोटर आईडी', te: 'వోటర్ ఐడి', ta: 'வாக்காளர் அடையாள அட்டை' },
    description: { en: 'Election Commission ID', hi: 'चुनाव आयोग पहचान', te: 'ఎన్నికల కమిషన్ గుర్తింపు', ta: 'தேர்தல் ஆணைய அடையாள அட்டை' },
    popular: false
  },
  {
    id: 'passport',
    icon: '📘',
    name: { en: 'Passport', hi: 'पासपोर्ट', te: 'పాస్‌పోర్ట్', ta: 'கடவுச்சீட்டு' },
    description: { en: 'International travel document', hi: 'अंतर्राष्ट्रीय यात्रा दस्तावेज', te: 'అంతర్జాతీయ ప్రయాణ పత్రం', ta: 'சர்வதேச பயண ஆவணம்' },
    popular: false
  }
];

const DocumentTypeScreen = ({ navigation, route }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (route.params?.language) {
      setLanguage(route.params.language);
    }
    playInstructions();
  }, []);

  const playInstructions = async () => {
    try {
      const message = getLocalizedText('instruction', language);
      await VoiceService.speak(message, language);
    } catch (error) {
      console.log('Voice instruction failed:', error);
    }
  };

  const getLocalizedText = (key, lang) => {
    const texts = {
      title: {
        en: 'Choose Document Type',
        hi: 'दस्तावेज़ प्रकार चुनें',
        te: 'పత్రం రకాన్ని ఎంచుకోండి',
        ta: 'ஆவண வகையைத் தேர்ந்தெடுக்கவும்'
      },
      instruction: {
        en: 'Please select the document you want to verify',
        hi: 'कृपया उस दस्तावेज़ को चुनें जिसे आप सत्यापित करना चाहते हैं',
        te: 'దయచేసి మీరు ధృవీకరించాలనుకుంటున్న పత్రాన్ని ఎంచుకోండి',
        ta: 'தயவுசெய்து நீங்கள் சரிபார்க்க விரும்பும் ஆவணத்தைத் தேர்ந்தெடுக்கவும்'
      },
      popular: {
        en: 'Most Popular',
        hi: 'सबसे लोकप्रिय',
        te: 'అత్యంత ప్రసిద్ధ',
        ta: 'மிகவும் பிரபலமான'
      },
      continue: {
        en: 'Continue',
        hi: 'आगे बढ़ें',
        te: 'కొనసాగించు',
        ta: 'தொடரவும்'
      }
    };
    return texts[key]?.[lang] || texts[key]?.en || '';
  };

  const handleDocumentSelect = async (documentId) => {
    setSelectedDocument(documentId);
    
    const document = documentTypes.find(doc => doc.id === documentId);
    if (document) {
      try {
        const message = `You selected ${document.name.en}`;
        await VoiceService.speak(message, 'en');
      } catch (error) {
        console.log('Voice feedback failed:', error);
      }
    }
  };

  const handleContinue = async () => {
    if (!selectedDocument) return;
    
    try {
      await VoiceService.speak('Great! Now let us capture your document', language);
      navigation.navigate('DocumentCapture', { 
        documentType: selectedDocument,
        language: language 
      });
    } catch (error) {
      console.log('Navigation voice failed:', error);
      navigation.navigate('DocumentCapture', { 
        documentType: selectedDocument,
        language: language 
      });
    }
  };

  const renderDocumentOption = (document) => {
    const isSelected = selectedDocument === document.id;
    
    return (
      <TouchableOpacity
        key={document.id}
        style={[
          styles.documentOption,
          isSelected && styles.selectedOption,
          document.popular && styles.popularOption
        ]}
        onPress={() => handleDocumentSelect(document.id)}
        activeOpacity={0.7}
      >
        {document.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>{getLocalizedText('popular', language)}</Text>
          </View>
        )}
        
        <View style={styles.documentContent}>
          <Text style={styles.documentIcon}>{document.icon}</Text>
          <View style={styles.documentText}>
            <Text style={[
              styles.documentName,
              isSelected && styles.selectedText
            ]}>
              {document.name[language] || document.name.en}
            </Text>
            <Text style={[
              styles.documentDescription,
              isSelected && styles.selectedSubtext
            ]}>
              {document.description[language] || document.description.en}
            </Text>
          </View>
          {isSelected && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </TouchableOpacity>
    );
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
        <Text style={styles.title}>{getLocalizedText('title', language)}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instruction}>
          {getLocalizedText('instruction', language)}
        </Text>
      </View>

      {/* Document Options */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {documentTypes.map(renderDocumentOption)}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedDocument && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedDocument}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {getLocalizedText('continue', language)}
          </Text>
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
  instructionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  documentOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1a73e8',
  },
  popularOption: {
    borderColor: '#ff9800',
    borderWidth: 1,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  documentIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  documentText: {
    flex: 1,
  },
  documentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
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

export default DocumentTypeScreen;
