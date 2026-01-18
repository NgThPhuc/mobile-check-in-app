// src/components/results/ErrorModal.tsx
// Modal hiển thị kết quả check-in lỗi hoặc cảnh báo

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScanResultCode, TicketInfo } from '../../types';

interface ErrorModalProps {
  visible: boolean;
  result?: ScanResultCode;
  ticketInfo?: TicketInfo;
  message?: string;
  onDismiss: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  result,
  ticketInfo,
  message = 'Đã có lỗi xảy ra',
  onDismiss,
}) => {
  if (!visible) return null;
  
  // Xác định màu sắc và icon dựa trên loại lỗi
  const isWarning = result === 'ALREADY_USED';
  const backgroundColor = isWarning ? '#FFC107' : '#F44336';
  const iconName = isWarning ? 'warning' : 'close-circle';
  const title = isWarning ? 'ĐÃ CHECK-IN' : 'KHÔNG HỢP LỆ';
  
  const getResultMessage = (): string => {
    switch (result) {
      case 'ALREADY_USED':
        return 'Vé này đã được sử dụng trước đó';
      case 'NOT_FOUND':
        return 'Không tìm thấy vé với mã QR này';
      case 'REVOKED':
        return 'Vé đã bị thu hồi';
      case 'REFUNDED':
        return 'Vé đã được hoàn tiền';
      case 'EVENT_NOT_ACTIVE':
        return 'Sự kiện chưa bắt đầu hoặc đã kết thúc';
      case 'INVALID_STATUS':
        return 'Trạng thái vé không hợp lệ';
      default:
        return message;
    }
  };
  
  return (
    <View style={styles.overlay}>
      <View style={[styles.container, { backgroundColor }]}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={iconName as any} size={80} color="#FFFFFF" />
        </View>
        
        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{getResultMessage()}</Text>
        
        {/* Ticket Info (nếu có) */}
        {ticketInfo && (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>{ticketInfo.attendee_name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="ticket" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>{ticketInfo.ticket_serial}</Text>
            </View>
            
            {ticketInfo.checked_in_at && (
              <View style={styles.infoRow}>
                <Ionicons name="time" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoText}>
                  Check-in lúc: {new Date(ticketInfo.checked_in_at).toLocaleTimeString('vi-VN')}
                </Text>
              </View>
            )}
            
            {ticketInfo.checked_in_by && (
              <View style={styles.infoRow}>
                <Ionicons name="person-circle" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoText}>Bởi: {ticketInfo.checked_in_by}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Dismiss Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={onDismiss}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: backgroundColor }]}>QUÉT TIẾP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ErrorModal;
