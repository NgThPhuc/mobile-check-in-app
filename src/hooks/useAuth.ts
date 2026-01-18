// src/hooks/useAuth.ts
// Custom hook cho authentication

import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCheckinStore } from '../store/checkinStore';
import { useEventStore } from '../store/eventStore';

export const useAuth = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading,
    loginAction,
    logoutAction,
    checkLoginStatus,
  } = useAuthStore();
  
  const clearEvents = useEventStore((state) => state.clearEvents);
  const resetCheckin = useCheckinStore((state) => state.reset);
  
  // Login với cleanup
  const login = useCallback(async (email: string, password: string) => {
    await loginAction(email, password);
  }, [loginAction]);
  
  // Logout với cleanup tất cả stores
  const logout = useCallback(async () => {
    await logoutAction();
    clearEvents();
    resetCheckin();
  }, [logoutAction, clearEvents, resetCheckin]);
  
  // Kiểm tra quyền check-in
  const hasCheckinPermission = useCallback(() => {
    if (!user?.organizations) return false;
    
    const allowedRoles = ['CHECKIN_STAFF', 'EVENT_MANAGER', 'ORGANIZER_ADMIN'];
    return user.organizations.some((org: any) => 
      allowedRoles.includes(org.role)
    );
  }, [user]);
  
  // Lấy tên hiển thị
  const displayName = user?.full_name || user?.email || 'Staff';
  
  // Lấy avatar URL hoặc tạo placeholder
  const avatarUrl = user?.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
  
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    displayName,
    avatarUrl,
    login,
    logout,
    checkLoginStatus,
    hasCheckinPermission,
  };
};

export default useAuth;
