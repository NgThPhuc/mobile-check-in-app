// src/screens/ProfileScreen.tsx
// Màn hình hồ sơ người dùng - UI đã được cải thiện

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getProfile } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { getSoundEnabled, getVibrationEnabled, setSoundEnabled, setVibrationEnabled } from '../utils/storage';

export default function ProfileScreen() {
  const logoutAction = useAuthStore((state) => state.logoutAction);
  const user = useAuthStore((state) => state.user);
  
  const [userInfo, setUserInfo] = useState<any>(user);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);

  useEffect(() => {
    loadProfile();
    loadSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setUserInfo(data);
    } catch (error) {
      console.log('Lỗi tải profile', error);
    }
  };

  const loadSettings = async () => {
    const sound = await getSoundEnabled();
    const vibration = await getVibrationEnabled();
    setSoundEnabledState(sound);
    setVibrationEnabledState(vibration);
  };

  const toggleSound = async (value: boolean) => {
    setSoundEnabledState(value);
    await setSoundEnabled(value);
  };

  const toggleVibration = async (value: boolean) => {
    setVibrationEnabledState(value);
    await setVibrationEnabled(value);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất', 
      'Bạn có chắc chắn muốn đăng xuất?', 
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đồng ý', 
          style: 'destructive', 
          onPress: () => logoutAction() 
        }
      ]
    );
  };

  const displayName = userInfo?.full_name || 'Nhân viên Check-in';
  const email = userInfo?.email || 'staff@example.com';
  const role = userInfo?.platform_role || 'STAFF';
  const avatarUrl = userInfo?.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=007AFF&color=fff&size=200`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Background */}
      <View style={styles.headerBg}>
        <View style={styles.headerPattern} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
          
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#007AFF" />
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt ứng dụng</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#E8F4FD' }]}>
                  <Ionicons name="volume-high" size={20} color="#007AFF" />
                </View>
                <Text style={styles.settingLabel}>Âm thanh</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: '#E5E5EA', true: '#4CAF50' }}
                thumbColor="#fff"
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="phone-portrait" size={20} color="#FF9800" />
                </View>
                <Text style={styles.settingLabel}>Rung khi quét</Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={toggleVibration}
                trackColor={{ false: '#E5E5EA', true: '#4CAF50' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.infoRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="information-circle" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.settingLabel}>Phiên bản</Text>
              </View>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Ionicons name="code-slash" size={20} color="#9C27B0" />
                </View>
                <Text style={styles.settingLabel}>Build</Text>
              </View>
              <Text style={styles.infoValue}>2026.01</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>© 2026 Check-in App</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F2F2F7' 
  },
  
  // Header
  headerBg: { 
    height: 160, 
    backgroundColor: '#007AFF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    backgroundColor: '#fff',
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 20,
    paddingBottom: 40,
  },
  
  // Profile Card
  profileCard: { 
    marginTop: 40,
    marginHorizontal: 20, 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 25, 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 15, 
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  avatarContainer: { 
    marginTop: -65,
    marginBottom: 15,
    position: 'relative',
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: 'white',
  },
  name: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#000',
    marginBottom: 4,
  },
  email: { 
    fontSize: 15, 
    color: '#666', 
    marginBottom: 12 
  },
  roleBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD', 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 20,
    gap: 6,
  },
  roleText: { 
    color: '#007AFF', 
    fontWeight: '600', 
    fontSize: 13 
  },
  
  // Sections
  section: { 
    marginTop: 25, 
    paddingHorizontal: 20 
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#8E8E93', 
    marginBottom: 10, 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Settings Card
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    overflow: 'hidden',
  },
  settingRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingLabel: { 
    fontSize: 16,
    color: '#000',
  },
  
  // Info Row
  infoRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16,
  },
  infoValue: { 
    color: '#8E8E93',
    fontSize: 15,
  },
  
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginLeft: 66,
  },
  
  // Logout
  logoutButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 14,
    gap: 10,
  },
  logoutText: { 
    color: '#FF3B30', 
    fontWeight: '600', 
    fontSize: 17 
  },
  
  // Footer
  footer: {
    textAlign: 'center',
    color: '#C7C7CC',
    fontSize: 12,
    marginTop: 25,
  },
});