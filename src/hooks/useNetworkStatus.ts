// src/hooks/useNetworkStatus.ts
// Custom hook để theo dõi trạng thái mạng

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isWifi: boolean;
  isCellular: boolean;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    isWifi: false,
    isCellular: false,
  });
  
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  
  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const newStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
      };
      
      setNetworkStatus(newStatus);
      
      // Hiển thị alert khi mất kết nối
      if (!state.isConnected) {
        setShowOfflineAlert(true);
      } else {
        setShowOfflineAlert(false);
      }
    });
    
    // Get initial state
    NetInfo.fetch().then((state) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Kiểm tra kết nối trước khi thực hiện action
  const checkConnection = useCallback((): boolean => {
    if (!networkStatus.isConnected) {
      return false;
    }
    return true;
  }, [networkStatus.isConnected]);
  
  // Đóng alert
  const dismissOfflineAlert = useCallback(() => {
    setShowOfflineAlert(false);
  }, []);
  
  return {
    ...networkStatus,
    showOfflineAlert,
    checkConnection,
    dismissOfflineAlert,
  };
};

export default useNetworkStatus;
