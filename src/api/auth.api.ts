// src/api/auth.api.ts
import apiClient from './client';

export const login = async (email: string, password: string) => {
  // Gọi endpoint POST /auth/login như tài liệu
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

export const logout = async () => {
   // Nếu backend không yêu cầu gọi API logout thì chỉ cần xóa token ở client là đủ
   try {
     await apiClient.post('/auth/logout');
   } catch (error) {
     console.log('Logout API error ignore', error);
   }
};