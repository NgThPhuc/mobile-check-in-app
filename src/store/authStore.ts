// src/store/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, getProfile } from '../api/auth.api';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  loginAction: (email: string, password: string) => Promise<void>;
  logoutAction: () => Promise<void>;
  checkLoginStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Mặc định là đang load để check token cũ

  loginAction: async (email, password) => {
    try {
      // 1. Gọi API Login
      const data = await login(email, password);
      
      // 2. Lưu token vào bộ nhớ máy
      if (data.access_token) {
        await AsyncStorage.setItem('access_token', data.access_token);
        
        // 3. Cập nhật state
        set({ 
          token: data.access_token, 
          user: data.user, 
          isAuthenticated: true 
        });
      }
    } catch (error) {
      console.error('Login Failed:', error);
      throw error; // Ném lỗi ra để màn hình Login hiển thị Alert
    }
  },

  logoutAction: async () => {
    await AsyncStorage.removeItem('access_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkLoginStatus: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        // Nếu có token, thử lấy profile để verify
        // (Hoặc tạm thời chỉ set true để vào app nhanh nếu API chưa xong)
        set({ token, isAuthenticated: true, isLoading: false });
        
        // Uncomment dòng dưới nếu muốn verify token với server mỗi lần mở app
        // const user = await getProfile();
        // set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
    }
  },
}));