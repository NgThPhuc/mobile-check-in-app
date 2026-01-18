// src/components/results/SuccessModal.tsx
// Modal hiển thị kết quả check-in thành công

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { TicketInfo } from '../../types';

interface SuccessModalProps {
  visible: boolean;
  ticketInfo?: TicketInfo;
  message?: string;
  onDismiss: () => void;
  autoDismissDelay?: number;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  ticketInfo,
  message = 'Check-in thành công',
  onDismiss,
  autoDismissDelay = 2500,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      // Auto dismiss sau delay
      const timer = setTimeout(() => {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, autoDismissDelay);
      
      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
        </View>
        
        {/* Title */}
        <Text style={styles.title}>HỢP LỆ</Text>
        <Text style={styles.message}>{message}</Text>
        
        {/* Ticket Info */}
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
            
            <View style={styles.infoRow}>
              <Ionicons name="pricetag" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>Loại vé: {ticketInfo.ticket_type}</Text>
            </View>
          </View>
        )}
        
        {/* Auto dismiss indicator */}
        <Text style={styles.autoDismiss}>Tự động đóng...</Text>
      </Animated.View>
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
    backgroundColor: '#4CAF50',
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
    marginBottom: 15,
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
  autoDismiss: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});

export default SuccessModal;
