// src/navigation/AppNavigator.tsx
// Navigator chính với SplashScreen

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';

// Import các màn hình
import EventListScreen from '../screens/EventListScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SplashScreen from '../screens/SplashScreen';
import MainTabNavigator from './MainTabNavigator';

import { useAuthStore } from '../store/authStore';

// Định nghĩa kiểu dữ liệu cho các màn hình (TypeScript)
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  EventList: undefined;
  MainTabs: { eventId: string; eventTitle: string };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  // Lấy trạng thái đăng nhập từ Store
  const { isAuthenticated, isLoading, checkLoginStatus } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  // Kiểm tra token và hiển thị splash
  useEffect(() => {
    const initialize = async () => {
      // Chờ minimum 1.5s để hiển thị splash
      const startTime = Date.now();
      await checkLoginStatus();
      const elapsedTime = Date.now() - startTime;
      
      // Đảm bảo splash hiển thị ít nhất 1.5s
      const remainingTime = Math.max(0, 1500 - elapsedTime);
      setTimeout(() => {
        setShowSplash(false);
      }, remainingTime);
    };
    
    initialize();
  }, []);

  // Màn hình chờ Splash
  if (showSplash || isLoading) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // === NHÓM MÀN HÌNH ĐÃ ĐĂNG NHẬP (AUTHENTICATED) ===
          <>
            {/* 1. Màn hình chính: Danh sách sự kiện */}
            <Stack.Screen 
              name="EventList" 
              component={EventListScreen} 
            />

            {/* 2. Màn hình check-in (Có Tab Bar dưới đáy) */}
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabNavigator} 
            />

            {/* 3. Màn hình Profile */}
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ 
                headerShown: true, 
                title: 'Tài khoản của tôi',
                headerBackTitle: 'Trở lại' 
              }} 
            />
          </>
        ) : (
          // === NHÓM MÀN HÌNH CHƯA ĐĂNG NHẬP (GUEST) ===
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ animationTypeForReplace: 'pop' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}