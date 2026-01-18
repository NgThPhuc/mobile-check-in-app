// src/screens/SplashScreen.tsx
// Màn hình splash khi khởi động app

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const checkLoginStatus = useAuthStore((state) => state.checkLoginStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Animations
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start animations
    Animated.sequence([
      // Logo fade in and scale
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
      // Text fade in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Loading dots fade in
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Check auth status after animations
    const timer = setTimeout(async () => {
      await checkLoginStatus();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="qr-code" size={60} color="#FFFFFF" />
        </View>
      </Animated.View>
      
      {/* App Name */}
      <Animated.View style={{ opacity: textOpacity }}>
        <Text style={styles.appName}>CHECK-IN APP</Text>
        <Text style={styles.tagline}>Dành cho nhân viên sự kiện</Text>
      </Animated.View>
      
      {/* Loading Indicator */}
      <Animated.View style={[styles.loadingContainer, { opacity: dotOpacity }]}>
        <LoadingDots />
      </Animated.View>
      
      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

// Component hiển thị loading dots
const LoadingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ]).start();
      
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 150);
      
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 300);
    };
    
    animate();
    const interval = setInterval(animate, 900);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    marginTop: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 5,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
});

export default SplashScreen;
