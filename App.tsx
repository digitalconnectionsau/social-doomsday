/**
 * Social Doomsday Kiosk App - React Native Port of PWA
 * LinkedIn Profile for Kyle Matthews - Escape Room Game
 * Ported from digitalconnectionsau/social-doomsday PWA
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  BackHandler,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
  Modal,
} from 'react-native';

// Configuration - matches PWA exactly
const CORRECT_PASSWORD = 'W@m+(5+2n5wh1';
const TOTAL_OVERSHARES = 6;
const RESET_TIMER_SECONDS = 60;
const PIN_CODE = '9856';
const EXIT_TAPS_REQUIRED = 6;
const EXIT_TIME_WINDOW = 5000; // 5 seconds
const AUTO_LOCK_TIME = 2 * 60 * 1000; // 2 minutes

function SocialApp(): React.JSX.Element {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Game state
  const [selectedOvershares, setSelectedOvershares] = useState(new Set<number>());
  const [submitError, setSubmitError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [resetTimer, setResetTimer] = useState(RESET_TIMER_SECONDS);
  
  // Kiosk state
  const [hiddenTapCount, setHiddenTapCount] = useState(0);
  const [lastHiddenTap, setLastHiddenTap] = useState(0);
  
  // Logout state
  const [showLogout, setShowLogout] = useState(false);
  const [logoutCode, setLogoutCode] = useState('');
  const [logoutError, setLogoutError] = useState('');

  // Update clock every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Auto-lock functionality
  useEffect(() => {
    if (isAuthenticated) {
      setShowInstructions(true);
      const timer = setTimeout(() => {
        autoLockApp();
      }, AUTO_LOCK_TIME);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Reset timer functionality
  useEffect(() => {
    if (showPin) {
      const interval = setInterval(() => {
        setResetTimer(prev => {
          if (prev <= 1) {
            resetGame();
            return RESET_TIMER_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showPin]);

  // Back handler for kiosk mode
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('🚫 Back button blocked - use hidden exit method');
      return true; // Prevent default back behavior
    });
    return () => backHandler.remove();
  }, []);

  const autoLockApp = () => {
    if (isAuthenticated) {
      resetGame();
    }
  };

  const resetGame = () => {
    setIsAuthenticated(false);
    setPassword('');
    setPasswordError('');
    setSubmitError('');
    setSelectedOvershares(new Set());
    setShowInstructions(false);
    setShowQuestions(false);
    setShowPin(false);
    setResetTimer(RESET_TIMER_SECONDS);
  };

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleHiddenExit = () => {
    const now = Date.now();
    
    if (now - lastHiddenTap > EXIT_TIME_WINDOW) {
      setHiddenTapCount(1);
    } else {
      setHiddenTapCount(prev => prev + 1);
    }
    
    setLastHiddenTap(now);
    
    if (hiddenTapCount >= EXIT_TAPS_REQUIRED - 1) {
      console.log('🚪 Hidden exit activated - exiting app');
      BackHandler.exitApp();
      setHiddenTapCount(0);
    }
  };

  const handleLogout = () => {
    if (logoutCode === '0000') {
      console.log('🚪 Logout code accepted - exiting kiosk mode');
      BackHandler.exitApp();
    } else {
      setLogoutError('Incorrect code. Please try again.');
      setLogoutCode('');
    }
  };

  const openLogout = () => {
    setShowLogout(true);
    setLogoutCode('');
    setLogoutError('');
  };

  const toggleOvershare = (id: number) => {
    const newSelected = new Set(selectedOvershares);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOvershares(newSelected);
  };

  const handleSubmit = () => {
    if (selectedOvershares.size === TOTAL_OVERSHARES) {
      setSubmitError('');
      setShowQuestions(true);
    } else {
      setSubmitError(`You have found ${selectedOvershares.size} of ${TOTAL_OVERSHARES} overshares. Keep looking!`);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Password/Lock Screen
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        
        <View style={styles.lockScreen}>
          <View style={styles.lockContent}>
            <Text style={styles.timeDisplay}>{formatTime(currentTime)}</Text>
            <Text style={styles.dateDisplay}>{formatDate(currentTime)}</Text>
            
            <View style={styles.loginSection}>
              <Text style={styles.passwordLabel}>Password</Text>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                onSubmitEditing={handlePasswordSubmit}
                placeholder=""
              />
              <Text style={styles.passwordError}>{passwordError}</Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handlePasswordSubmit}
              >
                <Text style={styles.loginButtonText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.hiddenExitAreaCenter}
          onPress={handleHiddenExit}
          activeOpacity={1}
        />
      </View>
    );
  }

  // LinkedIn Profile Screen
  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={styles.windowControls}>
          <View style={[styles.windowButton, {backgroundColor: '#FF5F57'}]} />
          <View style={[styles.windowButton, {backgroundColor: '#FFBD2E'}]} />
          <View style={[styles.windowButton, {backgroundColor: '#28CA42'}]} />
        </View>
        <Text style={styles.appTitle}>LinkedIn - Profile</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={openLogout}
        >
          <Text style={styles.logoutButtonText}>Exit</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.profileContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.bannerImage}>
            <Image 
              source={require('./images/plant1.webp')} 
              style={styles.banner}
              resizeMode="cover"
            />
          </View>
          <View style={styles.profileInfo}>
            <Image 
              source={require('./images/kyleM.webp')} 
              style={styles.profileImage}
            />
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>Kyle Matthews</Text>
              <Text style={styles.profileTitle}>Data Analyst at Infinite Glow</Text>
              <Text style={styles.profileLocation}>Burke County, Georgia, USA | Information Technology and Services</Text>
            </View>
            <View style={styles.companyInfo}>
              <Image 
                source={require('./glowLogo1.png')} 
                style={styles.companyLogo}
              />
              <View>
                <Text style={styles.companyName}>Infinite Glow</Text>
                <Text style={styles.companyLabel}>Company</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentGrid}>
          <View style={styles.leftColumn}>
            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>
                I have worked at Infinite Glow for the past nine years and I have broad experience in facilitating and building organization capacity through policy interventions and projects, especially in education, nature resources and agriculture domains. Specialized skills include: Cyber Security, PEN Testing, ISO Certification, project management, system analysis, research (qualitative & quantitative), science communication, stakeholder engagement, and regular risk oversight.
              </Text>
              <TouchableOpacity 
                style={[styles.overshareItem, selectedOvershares.has(1) && styles.overshareSelected]}
                onPress={() => toggleOvershare(1)}
              >
                <Text style={styles.overshareText}>"My mother's maiden name is Smith, which is funny because my first dog was a Jack Russell, a breed that originated in England!"</Text>
              </TouchableOpacity>
            </View>

            {/* Posts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity</Text>
              
              <TouchableOpacity 
                style={[styles.overshareItem, styles.postItem, selectedOvershares.has(2) && styles.overshareSelected]}
                onPress={() => toggleOvershare(2)}
              >
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar}>
                    <Text style={styles.avatarText}>KM</Text>
                  </View>
                  <View>
                    <Text style={styles.postAuthor}>Kyle Matthews</Text>
                    <Text style={styles.postTime}>2d ago</Text>
                  </View>
                </View>
                <Text style={styles.postContent}>Just got my new security badge! So shiny! This will get me into our new server room on Sub-level 3, Room B-12. Can't wait to start the migration. #WorkPerks #GlobalSecure</Text>
                <View style={styles.postImagePlaceholder}>
                  <Text style={styles.postImageText}>Security Badge ID: GSC-881-542A</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity 
                style={[styles.overshareItem, styles.postItem, selectedOvershares.has(3) && styles.overshareSelected]}
                onPress={() => toggleOvershare(3)}
              >
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar}>
                    <Text style={styles.avatarText}>KM</Text>
                  </View>
                  <View>
                    <Text style={styles.postAuthor}>Kyle Matthews</Text>
                    <Text style={styles.postTime}>1w ago</Text>
                  </View>
                </View>
                <Text style={styles.postContent}>So excited for my vacation to Hawaii next week! The house will be totally empty from the 15th to the 22nd, but our amazing dog-sitter, 'RoverWatcher123', has the spare key. Aloha! 🌴</Text>
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity 
                style={[styles.overshareItem, styles.postItem, selectedOvershares.has(4) && styles.overshareSelected]}
                onPress={() => toggleOvershare(4)}
              >
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar}>
                    <Text style={styles.avatarText}>KM</Text>
                  </View>
                  <View>
                    <Text style={styles.postAuthor}>Kyle Matthews</Text>
                    <Text style={styles.postTime}>2w ago</Text>
                  </View>
                </View>
                <Text style={styles.postContent}>Happy Birthday to my first ever pet, my childhood dog Fluffy! He was the best beagle. He would have been 15 today! Such a core memory. ❤️ #FirstPet #ChildhoodMemories</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rightColumn}>
            {/* Contact Info */}
            <TouchableOpacity 
              style={[styles.section, styles.overshareItem, selectedOvershares.has(5) && styles.overshareSelected]}
              onPress={() => toggleOvershare(5)}
            >
              <Text style={styles.sectionTitle}>Contact Info</Text>
              <Text style={styles.contactLabel}>Personal Email:</Text>
              <Text style={styles.contactEmail}>kyle.matthews1991@email.com</Text>
            </TouchableOpacity>

            {/* Experience */}
            <TouchableOpacity 
              style={[styles.section, styles.overshareItem, selectedOvershares.has(6) && styles.overshareSelected]}
              onPress={() => toggleOvershare(6)}
            >
              <Text style={styles.sectionTitle}>Experience</Text>
              <Text style={styles.experienceCompany}>Infinite Glow</Text>
              <Text style={styles.experienceTitle}>Data Analyst</Text>
              <Text style={styles.experienceDuration}>2020 - Present</Text>
              <Text style={styles.experienceDescription}>Responsible for analyzing customer data and maintaining the company's analytics dashboard, accessible through the secure data center in Sub-level 3, Room B-12.</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Findings</Text>
          </TouchableOpacity>
          <Text style={styles.submitError}>{submitError}</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modals */}
      <Modal visible={showInstructions} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Analyze the Compromised Profile</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                You are reviewing a LinkedIn profile that may have been used by hackers. Your goal is to identify overshared personal information. Click on any field that you think should have been kept private.
              </Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowInstructions(false)}
              >
                <Text style={styles.modalButtonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showQuestions} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Security Assessment</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>Did you have a good look at Kyle's LinkedIn Profile and what he has shared?</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowQuestions(false);
                  setShowPin(true);
                }}
              >
                <Text style={styles.modalButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPin} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Access Granted</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>Your next access code is:</Text>
              <Text style={styles.pinCode}>{PIN_CODE}</Text>
              <Text style={styles.modalText}>This screen will reset in...</Text>
              <Text style={styles.resetTimer}>{resetTimer}</Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showLogout} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Exit Kiosk Mode</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>Enter the exit code to close the app:</Text>
              <TextInput
                style={styles.logoutInput}
                value={logoutCode}
                onChangeText={setLogoutCode}
                secureTextEntry={true}
                autoCapitalize="none"
                onSubmitEditing={handleLogout}
                placeholder="Enter code"
                maxLength={4}
              />
              <Text style={styles.logoutError}>{logoutError}</Text>
              <View style={styles.logoutButtons}>
                <TouchableOpacity 
                  style={styles.logoutCancelButton}
                  onPress={() => setShowLogout(false)}
                >
                  <Text style={styles.logoutCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.logoutConfirmButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutConfirmText}>Exit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      
      <TouchableOpacity 
        style={styles.hiddenExitAreaCenter}
        onPress={handleHiddenExit}
        activeOpacity={1}
      />
    </View>
  );
}

// Styles
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Lock Screen
  lockScreen: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 40,
    borderRadius: 12,
  },
  timeDisplay: {
    fontSize: 72,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 8,
  },
  dateDisplay: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 32,
  },
  loginSection: {
    alignItems: 'center',
  },
  passwordLabel: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  passwordInput: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    width: 256,
    marginBottom: 8,
  },
  passwordError: {
    color: '#FF5F57',
    height: 24,
    fontSize: 14,
    marginBottom: 8,
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // App Header
  appHeader: {
    backgroundColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
  },
  windowControls: {
    flexDirection: 'row',
    marginRight: 16,
  },
  windowButton: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  appTitle: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#FF5F57',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Profile
  profileContainer: {
    flex: 1,
    backgroundColor: '#f3f2ef',
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  bannerImage: {
    height: 150,
    backgroundColor: '#1d4ed8',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    padding: 24,
    position: 'relative',
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#ffffff',
    position: 'absolute',
    top: -64,
    left: 32,
  },
  profileDetails: {
    marginTop: 64,
    marginLeft: 32,
    flex: 1,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: '#888',
  },
  companyInfo: {
    position: 'absolute',
    top: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  companyLabel: {
    fontSize: 12,
    color: '#888',
  },

  // Content Grid
  contentGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
  },

  // Sections
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },

  // Overshare Items
  overshareItem: {
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  overshareSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#fef2f2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 8,
  },
  overshareText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 8,
    borderRadius: 4,
  },

  // Posts
  postItem: {
    padding: 12,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#888',
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  postImagePlaceholder: {
    marginTop: 12,
    backgroundColor: '#f0f0f0',
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  postImageText: {
    fontSize: 12,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },

  // Contact & Experience
  contactLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: '#0077b5',
  },
  experienceCompany: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  experienceDuration: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },

  // Submit
  submitSection: {
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitError: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    height: 24,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    maxWidth: 500,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    backgroundColor: '#1d4ed8',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  modalHeaderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 24,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#707070',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  // PIN Display
  pinCode: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    letterSpacing: 16,
  },
  resetTimer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },

  // Hidden Exit
  hiddenExitAreaCenter: {
    position: 'absolute',
    top: height / 2 - 50,
    left: width / 2 - 50,
    width: 100,
    height: 100,
    backgroundColor: 'transparent',
  },
  bottomPadding: {
    height: 50,
  },

  // Logout Modal
  logoutInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    padding: 15,
    borderRadius: 8,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  logoutError: {
    color: '#FF5F57',
    fontSize: 14,
    textAlign: 'center',
    height: 20,
    marginBottom: 16,
  },
  logoutButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  logoutCancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: '#FF5F57',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});

function App(): React.JSX.Element {
  return <SocialApp />;
}

export default App;
