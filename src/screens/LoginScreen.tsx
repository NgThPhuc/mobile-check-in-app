// src/screens/LoginScreen.tsx
// Màn hình đăng nhập với Remember Me

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { getRememberMe, setRememberMe } from '../utils/storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMeState] = useState(false);

  // Lấy hàm login từ Store
  const loginAction = useAuthStore((state) => state.loginAction);

  // Load Remember Me settings khi mount
  useEffect(() => {
    loadRememberMe();
  }, []);

  const loadRememberMe = async () => {
    const { remember, email: savedEmail } = await getRememberMe();
    setRememberMeState(remember);
    if (remember && savedEmail) {
      setEmail(savedEmail);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAction(email, password);
      
      // Lưu Remember Me setting
      await setRememberMe(rememberMe, email);
      
      // Không cần navigate thủ công, AppNavigator sẽ tự chuyển khi isAuthenticated = true
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', 'Kiểm tra lại email hoặc mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRememberMe = () => {
    setRememberMeState(!rememberMe);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="qr-code" size={50} color="#007AFF" />
          </View>
          <Text style={styles.logo}>CHECK-IN APP</Text>
          <Text style={styles.subtitle}>Dành cho nhân viên sự kiện</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="staff@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#888" 
              />
            </TouchableOpacity>
          </View>

          {/* Remember Me */}
          <TouchableOpacity style={styles.rememberMeContainer} onPress={toggleRememberMe}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F2F2F7' 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#007AFF', 
    letterSpacing: 1,
  },
  subtitle: { 
    fontSize: 15, 
    color: '#666', 
    marginTop: 5 
  },
  form: { 
    backgroundColor: '#fff', 
    padding: 25, 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: { 
    fontWeight: '600', 
    marginBottom: 8, 
    color: '#333',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: { 
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  rememberMeText: {
    color: '#666',
    fontSize: 14,
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A0C4FF',
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16,
    letterSpacing: 1,
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 30,
  },
});