// src/components/scanner/ScanOverlay.tsx
// Overlay hiển thị trên camera khi quét QR

import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

interface ScanOverlayProps {
  isScanning?: boolean;
  message?: string;
}

const ScanOverlay: React.FC<ScanOverlayProps> = ({
  isScanning = false,
  message = 'Đưa mã QR vào khung',
}) => {
  return (
    <View style={styles.container}>
      {/* Top overlay */}
      <View style={styles.overlay} />
      
      {/* Middle row */}
      <View style={styles.middleRow}>
        {/* Left overlay */}
        <View style={styles.overlay} />
        
        {/* Scan frame */}
        <View style={styles.scanFrame}>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {/* Scanning line animation placeholder */}
          {isScanning && (
            <View style={styles.scanLine} />
          )}
        </View>
        
        {/* Right overlay */}
        <View style={styles.overlay} />
      </View>
      
      {/* Bottom overlay with message */}
      <View style={[styles.overlay, styles.bottomOverlay]}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const CORNER_SIZE = 20;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_FRAME_SIZE,
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    borderRadius: 20,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#00FF00',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#00FF00',
  },
  bottomOverlay: {
    alignItems: 'center',
    paddingTop: 30,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ScanOverlay;
