// src/screens/CheckinScreen.tsx
// Màn hình quét QR check-in - UI PREMIUM

import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Platform,
    SafeAreaView, StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';

import { CheckinStats, getCheckinStats } from '../api/checkin.api';
import apiClient from '../api/client';
import { alreadyUsedFeedback, checkinErrorFeedback, checkinSuccessFeedback } from '../utils/haptics';

const { width } = Dimensions.get('window');
const SCAN_SIZE = width * 0.7;

export default function CheckinScreen() {
  const route = useRoute<any>();
  const { eventId, eventTitle } = route.params || { eventId: '', eventTitle: 'Sự kiện' };

  const [permission, requestPermission] = useCameraPermissions();
  
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<CheckinStats | null>(null);
  const [gate, setGate] = useState('Cổng Chính'); 
  const [showGateModal, setShowGateModal] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);

  const [apiResult, setApiResult] = useState<{
    success: boolean;
    message: string;
    resultCode?: string;
    ticketInfo?: any;
  } | null>(null);

  const gates = ['Cổng Chính', 'Cổng VIP', 'Cổng Phụ', 'Cổng B', 'Cổng C'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getCheckinStats(eventId);
      setStats(data);
    } catch (error) {
      console.log('Lỗi tải stats:', error);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setApiResult(null);
    setIsLoading(false);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isLoading) return;

    setScanned(true);
    setIsLoading(true);
    Vibration.vibrate();

    try {
      const response = await apiClient.post('/check-in/scan', {
        qr_payload: data,
        gate: gate,
        device_id: 'MOBILE_APP_V1'
      });

      const resData = response.data;

      setApiResult({
        success: resData.valid,           // Dùng valid từ API
        message: resData.message,
        resultCode: resData.valid ? 'SUCCESS' : resData.reason,  // Dùng reason khi thất bại
        ticketInfo: resData.ticket,
      });

      if (resData.valid) {
        await checkinSuccessFeedback();
        // Delay nhẹ để đảm bảo backend đã cập nhật xong
        setTimeout(() => fetchStats(), 500);
      } else if (resData.reason === 'ALREADY_USED') {
        await alreadyUsedFeedback();
      } else {
        await checkinErrorFeedback();
      }

    } catch (error: any) {
      await checkinErrorFeedback();
      setApiResult({
        success: false,
        message: error.response?.data?.message || 'Lỗi kết nối Server',
        resultCode: 'ERROR',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getResultStyle = () => {
    // Kiểm tra resultCode: SUCCESS = xanh, ALREADY_USED = vàng, khác = đỏ
    if (apiResult?.resultCode === 'SUCCESS') return { bg: '#10B981', icon: 'checkmark-circle' };
    if (apiResult?.resultCode === 'ALREADY_USED') return { bg: '#F59E0B', icon: 'alert-circle' };
    return { bg: '#EF4444', icon: 'close-circle' };
  };

  const checkedIn = stats?.checked_in ?? 0;
  const total = stats?.total_issued ?? stats?.total_tickets ?? 0;
  const rate = stats?.checkin_rate ?? (total > 0 ? Math.round((checkedIn / total) * 100) : 0);

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.permissionContent}>
          <View style={styles.permissionIconWrap}>
            <Ionicons name="camera" size={50} color="#007AFF" />
          </View>
          <Text style={styles.permissionTitle}>Cho phép Camera</Text>
          <Text style={styles.permissionText}>
            Ứng dụng cần quyền camera để quét mã QR check-in khách
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.permissionButtonText}>Mở Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* CAMERA FULLSCREEN */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchEnabled}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* OVERLAY */}
      <View style={styles.overlay}>
        {/* TOP BAR */}
        <SafeAreaView style={styles.topBar}>
          <View style={styles.topBarContent}>
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCircle}>
                <Text style={styles.statNumber}>{checkedIn}</Text>
                <Text style={styles.statLabel}>đã vào</Text>
              </View>
              <View style={styles.statDivider}>
                <Text style={styles.statSlash}>/</Text>
              </View>
              <View style={styles.statCircle}>
                <Text style={[styles.statNumber, { color: '#94A3B8' }]}>{total}</Text>
                <Text style={styles.statLabel}>tổng</Text>
              </View>
            </View>
            
            {/* Rate Badge */}
            <View style={styles.rateBadge}>
              <Text style={styles.rateText}>{rate}%</Text>
            </View>
          </View>
          
          {/* Event Title & Gate */}
          <View style={styles.eventRow}>
            <Text style={styles.eventTitle} numberOfLines={1}>{eventTitle}</Text>
            <TouchableOpacity style={styles.gateButton} onPress={() => setShowGateModal(true)}>
              <Ionicons name="location" size={14} color="#007AFF" />
              <Text style={styles.gateText}>{gate}</Text>
              <Ionicons name="chevron-down" size={12} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* SCAN AREA */}
        {!scanned && !isLoading && (
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              {/* Corners */}
              <View style={[styles.corner, styles.tl]} />
              <View style={[styles.corner, styles.tr]} />
              <View style={[styles.corner, styles.bl]} />
              <View style={[styles.corner, styles.br]} />
            </View>
            <Text style={styles.scanHint}>Đưa mã QR vào khung</Text>
          </View>
        )}

        {/* LOADING */}
        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Đang xác minh...</Text>
          </View>
        )}

        {/* BOTTOM CONTROLS */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.controlButton, torchEnabled && styles.controlActive]}
            onPress={() => setTorchEnabled(!torchEnabled)}
          >
            <Ionicons 
              name={torchEnabled ? "flash" : "flash-outline"} 
              size={24} 
              color={torchEnabled ? "#FFD700" : "#fff"} 
            />
            <Text style={styles.controlText}>Đèn</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RESULT OVERLAY */}
      {apiResult && (
        <View style={[styles.resultOverlay, { backgroundColor: getResultStyle().bg }]}>
          <SafeAreaView style={styles.resultContent}>
            <Ionicons name={getResultStyle().icon as any} size={80} color="#fff" />
            <Text style={styles.resultTitle}>
              {apiResult.resultCode === 'SUCCESS' ? 'THÀNH CÔNG' : (apiResult.resultCode === 'ALREADY_USED' ? 'ĐÃ QUÉT' : 'THẤT BẠI')}
            </Text>
            <Text style={styles.resultMessage}>{apiResult.message}</Text>
            
            {apiResult.ticketInfo && (
              <View style={styles.ticketCard}>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Khách</Text>
                  <Text style={styles.ticketValue}>{apiResult.ticketInfo.attendee_name}</Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Loại vé</Text>
                  <Text style={styles.ticketValue}>{apiResult.ticketInfo.ticket_type}</Text>
                </View>
                {apiResult.ticketInfo.ticket_serial && (
                  <View style={styles.ticketRow}>
                    <Text style={styles.ticketLabel}>Mã vé</Text>
                    <Text style={[styles.ticketValue, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}>
                      {apiResult.ticketInfo.ticket_serial}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.continueButton} onPress={resetScanner}>
              <Text style={[styles.continueText, { color: getResultStyle().bg }]}>QUÉT TIẾP</Text>
              <Ionicons name="arrow-forward" size={20} color={getResultStyle().bg} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}

      {/* GATE MODAL */}
      <Modal visible={showGateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Chọn cổng</Text>
            
            {gates.map((g) => (
              <TouchableOpacity 
                key={g} 
                style={[styles.gateOption, g === gate && styles.gateOptionActive]}
                onPress={() => { setGate(g); setShowGateModal(false); }}
              >
                <Text style={[styles.gateOptionText, g === gate && styles.gateOptionTextActive]}>{g}</Text>
                {g === gate && <Ionicons name="checkmark" size={20} color="#007AFF" />}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowGateModal(false)}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  // Permission
  permissionContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  permissionContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  permissionIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 25,
  },
  permissionTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  permissionText: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 30, lineHeight: 24 },
  permissionButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#007AFF', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14,
  },
  permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  // Overlay
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  
  // Top Bar
  topBar: { backgroundColor: 'rgba(0,0,0,0.7)' },
  topBarContent: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingHorizontal: 20, paddingBottom: 10,
  },
  statsContainer: { flexDirection: 'row', alignItems: 'center' },
  statCircle: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#10B981' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: -2 },
  statDivider: { marginHorizontal: 12 },
  statSlash: { fontSize: 32, color: '#475569', fontWeight: '200' },
  rateBadge: {
    position: 'absolute', right: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  rateText: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  
  eventRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  eventTitle: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1, marginRight: 10 },
  gateButton: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  gateText: { color: '#007AFF', fontSize: 13, fontWeight: '500' },
  
  // Scan Area
  scanArea: { alignItems: 'center' },
  scanFrame: { width: SCAN_SIZE, height: SCAN_SIZE, position: 'relative' },
  corner: { position: 'absolute', width: 50, height: 50, borderColor: '#10B981' },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 20 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 20 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 20 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 20 },
  scanHint: {
    marginTop: 25, color: '#fff', fontSize: 15, fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25,
  },
  
  // Loading
  loadingBox: { alignItems: 'center', padding: 30 },
  loadingText: { color: '#fff', marginTop: 15, fontSize: 16 },
  
  // Bottom Bar
  bottomBar: { 
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)',
    width: 70, height: 70, borderRadius: 35, justifyContent: 'center',
  },
  controlActive: { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
  controlText: { color: '#fff', fontSize: 11, marginTop: 4 },
  
  // Result Overlay
  resultOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  resultContent: { alignItems: 'center', paddingHorizontal: 30, width: '100%' },
  resultTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 20, letterSpacing: 2 },
  resultMessage: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 8, textAlign: 'center' },
  ticketCard: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16,
    padding: 20, width: '100%', marginTop: 25,
  },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  ticketLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  ticketValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  continueButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, marginTop: 30,
  },
  continueText: { fontSize: 17, fontWeight: 'bold' },
  
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1E293B' },
  gateOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: '#F8FAFC',
  },
  gateOptionActive: { backgroundColor: '#EFF6FF' },
  gateOptionText: { fontSize: 16, color: '#475569' },
  gateOptionTextActive: { color: '#007AFF', fontWeight: '600' },
  modalCancel: { marginTop: 10, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
  modalCancelText: { fontSize: 16, color: '#64748B', fontWeight: '500' },
});