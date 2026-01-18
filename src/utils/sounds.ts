// src/utils/sounds.ts
// Quản lý âm thanh cho check-in

import { Audio } from 'expo-av';

let successSound: Audio.Sound | null = null;
let errorSound: Audio.Sound | null = null;

// Preload sounds khi app khởi động
export const loadSounds = async (): Promise<void> => {
  try {
    // Sử dụng system sounds hoặc custom sounds
    // Với Expo, chúng ta có thể sử dụng Audio.Sound
    // Tạm thời comment vì chưa có file âm thanh
    // const { sound: success } = await Audio.Sound.createAsync(
    //   require('../assets/sounds/success.mp3')
    // );
    // successSound = success;
    
    // const { sound: error } = await Audio.Sound.createAsync(
    //   require('../assets/sounds/error.mp3')
    // );
    // errorSound = error;
    
    console.log('Sounds loaded (placeholder)');
  } catch (error) {
    console.log('Error loading sounds:', error);
  }
};

// Phát âm thanh thành công
export const playSuccessSound = async (): Promise<void> => {
  try {
    if (successSound) {
      await successSound.replayAsync();
    } else {
      // Fallback: Sử dụng console log nếu chưa có sound file
      console.log('🔊 Success sound played');
    }
  } catch (error) {
    console.log('Error playing success sound:', error);
  }
};

// Phát âm thanh lỗi
export const playErrorSound = async (): Promise<void> => {
  try {
    if (errorSound) {
      await errorSound.replayAsync();
    } else {
      console.log('🔊 Error sound played');
    }
  } catch (error) {
    console.log('Error playing error sound:', error);
  }
};

// Phát âm thanh cảnh báo (vé đã check-in)
export const playWarningSound = async (): Promise<void> => {
  // Có thể dùng chung với error sound hoặc tạo riêng
  await playErrorSound();
};

// Giải phóng sounds khi không dùng nữa
export const unloadSounds = async (): Promise<void> => {
  try {
    if (successSound) {
      await successSound.unloadAsync();
      successSound = null;
    }
    if (errorSound) {
      await errorSound.unloadAsync();
      errorSound = null;
    }
  } catch (error) {
    console.log('Error unloading sounds:', error);
  }
};
