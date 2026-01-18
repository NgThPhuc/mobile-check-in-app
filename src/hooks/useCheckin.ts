// src/hooks/useCheckin.ts
// Custom hook cho check-in operations

import { useCallback, useEffect } from 'react';
import { useCheckinStore } from '../store/checkinStore';

interface UseCheckinProps {
  eventId: string;
  eventTitle: string;
}

export const useCheckin = ({ eventId, eventTitle }: UseCheckinProps) => {
  const {
    selectedGate,
    stats,
    history,
    isScanning,
    isLoadingStats,
    isLoadingHistory,
    lastScanResult,
    initializeForEvent,
    setGate,
    scan,
    refreshStats,
    refreshHistory,
    clearScanResult,
    reset,
  } = useCheckinStore();
  
  // Initialize khi mount
  useEffect(() => {
    if (eventId) {
      initializeForEvent(eventId, eventTitle);
    }
    
    return () => {
      // Không reset khi unmount vì có thể switch tabs
    };
  }, [eventId, eventTitle]);
  
  // Quét QR
  const handleScan = useCallback(async (qrPayload: string) => {
    return await scan(qrPayload);
  }, [scan]);
  
  // Đổi cổng
  const handleSetGate = useCallback((gate: string) => {
    setGate(gate);
  }, [setGate]);
  
  // Quét tiếp (clear result)
  const handleScanAgain = useCallback(() => {
    clearScanResult();
  }, [clearScanResult]);
  
  // Refresh stats
  const handleRefreshStats = useCallback(async () => {
    await refreshStats();
  }, [refreshStats]);
  
  // Refresh history
  const handleRefreshHistory = useCallback(async () => {
    await refreshHistory();
  }, [refreshHistory]);
  
  // Computed values
  const checkinCount = stats?.checked_in || 0;
  const totalTickets = stats?.total_tickets || 0;
  const checkinRate = stats?.checkin_rate || 0;
  const remainingTickets = stats?.not_checked_in || 0;
  
  // Kết quả scan
  const isSuccess = lastScanResult?.success === true;
  const isAlreadyUsed = lastScanResult?.result === 'ALREADY_USED';
  const isError = lastScanResult && !lastScanResult.success && lastScanResult.result !== 'ALREADY_USED';
  
  return {
    // State
    selectedGate,
    stats,
    history,
    isScanning,
    isLoadingStats,
    isLoadingHistory,
    lastScanResult,
    
    // Computed
    checkinCount,
    totalTickets,
    checkinRate,
    remainingTickets,
    isSuccess,
    isAlreadyUsed,
    isError,
    
    // Actions
    handleScan,
    handleSetGate,
    handleScanAgain,
    handleRefreshStats,
    handleRefreshHistory,
    reset,
  };
};

export default useCheckin;
