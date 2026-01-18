// src/utils/storage.ts
// Wrapper cho AsyncStorage với type safety

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
  LAST_EMAIL: 'last_email',
  DEFAULT_GATE: 'default_gate',
  SOUND_ENABLED: 'sound_enabled',
  VIBRATION_ENABLED: 'vibration_enabled',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// ============== TOKEN ==============
export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
};

// ============== USER DATA ==============
export const saveUserData = async (user: any): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
};

export const getUserData = async (): Promise<any | null> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
};

export const removeUserData = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

// ============== REMEMBER ME ==============
export const setRememberMe = async (remember: boolean, email?: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
  if (remember && email) {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_EMAIL, email);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_EMAIL);
  }
};

export const getRememberMe = async (): Promise<{ remember: boolean; email: string | null }> => {
  const remember = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
  const email = await AsyncStorage.getItem(STORAGE_KEYS.LAST_EMAIL);
  return {
    remember: remember === 'true',
    email,
  };
};

// ============== SETTINGS ==============
export const saveDefaultGate = async (gate: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_GATE, gate);
};

export const getDefaultGate = async (): Promise<string> => {
  const gate = await AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_GATE);
  return gate || 'Cổng Chính';
};

export const setSoundEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, enabled.toString());
};

export const getSoundEnabled = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
  return value !== 'false'; // Mặc định là true
};

export const setVibrationEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.VIBRATION_ENABLED, enabled.toString());
};

export const getVibrationEnabled = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.VIBRATION_ENABLED);
  return value !== 'false'; // Mặc định là true
};

// ============== CLEAR ALL ==============
export const clearAllStorage = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.USER_DATA,
  ]);
};

export { STORAGE_KEYS };
