// src/utils/haptics.ts
// Quản lý phản hồi rung (haptic feedback)

import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';
import { getVibrationEnabled } from './storage';

// Rung nhẹ khi bắt đầu quét
export const lightImpact = async (): Promise<void> => {
  const enabled = await getVibrationEnabled();
  if (!enabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Fallback cho thiết bị không hỗ trợ Haptics
    Vibration.vibrate(50);
  }
};

// Rung trung bình
export const mediumImpact = async (): Promise<void> => {
  const enabled = await getVibrationEnabled();
  if (!enabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    Vibration.vibrate(100);
  }
};

// Rung mạnh khi có lỗi
export const heavyImpact = async (): Promise<void> => {
  const enabled = await getVibrationEnabled();
  if (!enabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    Vibration.vibrate(200);
  }
};

// Rung thành công - Pattern: ngắn
export const successFeedback = async (): Promise<void> => {
  const enabled = await getVibrationEnabled();
  if (!enabled) return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Pattern: rung ngắn 1 lần
    Vibration.vibrate(100);
  }
};

// Rung cảnh báo - Pattern: 2 lần ngắn
export const warningFeedback = async (): Promise<void> => {
  const enabled = await getVibrationEnabled();
  if (!enabled) return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    // Pattern: rung 2 lần ngắn
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 100, 100, 100]);
    } else {
      Vibration.vibrate(100);
    }
  }
};

// Rung lỗi - Pattern: 3 lần mạnh
export const errorFeedback = async (): Promise<void> => {
  const enabled = await getVibrationEnabled();
  if (!enabled) return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    // Pattern: rung 3 lần
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 150, 100, 150, 100, 150]);
    } else {
      Vibration.vibrate(200);
    }
  }
};

// Rung khi quét được QR
export const scanDetectedFeedback = async (): Promise<void> => {
  await lightImpact();
};

// Rung khi check-in thành công
export const checkinSuccessFeedback = async (): Promise<void> => {
  await successFeedback();
};

// Rung khi check-in thất bại
export const checkinErrorFeedback = async (): Promise<void> => {
  await errorFeedback();
};

// Rung khi vé đã được sử dụng
export const alreadyUsedFeedback = async (): Promise<void> => {
  await warningFeedback();
};
