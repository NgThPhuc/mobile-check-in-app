// src/store/checkinStore.ts
// Quản lý state cho Check-in

import { create } from 'zustand';
import { getCheckinHistory, getCheckinStats, scanQR } from '../api/checkin.api';
import { CheckinHistoryItem, CheckinStats, ScanQRResponse, ScanResultCode } from '../types';
import { alreadyUsedFeedback, checkinErrorFeedback, checkinSuccessFeedback } from '../utils/haptics';
import { playErrorSound, playSuccessSound, playWarningSound } from '../utils/sounds';
import { getDefaultGate } from '../utils/storage';

interface CheckinState {
  // State
  selectedEventId: string | null;
  selectedEventTitle: string;
  selectedGate: string;
  stats: CheckinStats | null;
  history: CheckinHistoryItem[];
  isScanning: boolean;
  isLoadingStats: boolean;
  isLoadingHistory: boolean;
  lastScanResult: ScanQRResponse | null;
  error: string | null;
  
  // Actions
  initializeForEvent: (eventId: string, eventTitle: string) => Promise<void>;
  setGate: (gate: string) => void;
  scan: (qrPayload: string) => Promise<ScanQRResponse>;
  refreshStats: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  clearScanResult: () => void;
  reset: () => void;
}

export const useCheckinStore = create<CheckinState>((set, get) => ({
  // Initial state
  selectedEventId: null,
  selectedEventTitle: '',
  selectedGate: 'Cổng Chính',
  stats: null,
  history: [],
  isScanning: false,
  isLoadingStats: false,
  isLoadingHistory: false,
  lastScanResult: null,
  error: null,
  
  // Khởi tạo cho một sự kiện
  initializeForEvent: async (eventId, eventTitle) => {
    // Load default gate từ storage
    const defaultGate = await getDefaultGate();
    
    set({ 
      selectedEventId: eventId, 
      selectedEventTitle: eventTitle,
      selectedGate: defaultGate,
      stats: null,
      history: [],
      lastScanResult: null,
      error: null,
    });
    
    // Fetch stats ngay khi khởi tạo
    await get().refreshStats();
  },
  
  // Set cổng soát vé
  setGate: (gate) => {
    set({ selectedGate: gate });
  },
  
  // Quét QR và check-in
  scan: async (qrPayload) => {
    const { selectedGate, selectedEventId } = get();
    
    set({ isScanning: true, error: null });
    
    try {
      const result = await scanQR({
        qr_payload: qrPayload,
        gate: selectedGate,
        device_id: 'MOBILE_APP_V1',
      });
      
      set({ lastScanResult: result, isScanning: false });
      
      // Feedback dựa trên kết quả
      if (result.success) {
        await Promise.all([
          checkinSuccessFeedback(),
          playSuccessSound(),
        ]);
        // Refresh stats sau khi check-in thành công
        get().refreshStats();
      } else if (result.result === 'ALREADY_USED') {
        await Promise.all([
          alreadyUsedFeedback(),
          playWarningSound(),
        ]);
      } else {
        await Promise.all([
          checkinErrorFeedback(),
          playErrorSound(),
        ]);
      }
      
      return result;
    } catch (error: any) {
      const errorResult: ScanQRResponse = {
        success: false,
        message: error.response?.data?.message || 'Lỗi kết nối server',
        result: 'ERROR' as ScanResultCode,
      };
      
      set({ lastScanResult: errorResult, isScanning: false });
      
      await Promise.all([
        checkinErrorFeedback(),
        playErrorSound(),
      ]);
      
      return errorResult;
    }
  },
  
  // Refresh thống kê
  refreshStats: async () => {
    const { selectedEventId } = get();
    if (!selectedEventId) return;
    
    set({ isLoadingStats: true });
    
    try {
      const stats = await getCheckinStats(selectedEventId);
      set({ stats, isLoadingStats: false });
    } catch (error: any) {
      set({ isLoadingStats: false });
      console.log('Error refreshing stats:', error);
    }
  },
  
  // Refresh lịch sử
  refreshHistory: async () => {
    const { selectedEventId } = get();
    if (!selectedEventId) return;
    
    set({ isLoadingHistory: true });
    
    try {
      const data = await getCheckinHistory(selectedEventId);
      const historyList = Array.isArray(data) ? data : (data as any)?.data || [];
      set({ history: historyList, isLoadingHistory: false });
    } catch (error: any) {
      set({ isLoadingHistory: false });
      console.log('Error refreshing history:', error);
    }
  },
  
  // Xóa kết quả scan để quét tiếp
  clearScanResult: () => {
    set({ lastScanResult: null });
  },
  
  // Reset store (khi thoát khỏi event)
  reset: () => {
    set({
      selectedEventId: null,
      selectedEventTitle: '',
      stats: null,
      history: [],
      lastScanResult: null,
      error: null,
    });
  },
}));
