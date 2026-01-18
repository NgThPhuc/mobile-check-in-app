// src/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// QUAN TRỌNG: Thay đổi IP này thành IP máy tính của bạn
// Nếu dùng máy ảo Android: 'http://10.0.2.2:3000'
// Nếu dùng điện thoại thật: 'http://192.168.1.X:3000' (IP LAN)
// const API_BASE_URL = 'http://192.168.123.103:3000'; 
const API_BASE_URL = 'https://ticket-event-qr-api.onrender.com'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động gắn Token vào header trước khi gửi request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Xử lý lỗi 401 (Token hết hạn)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Xóa token và user data khi token hết hạn
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_data');
      
      // Log để debug
      console.log('[API Client] Token expired, cleared storage');
    }
    return Promise.reject(error);
  }
);

export default apiClient;