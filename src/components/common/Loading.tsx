// src/components/common/Loading.tsx
// Loading component tái sử dụng

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  style?: ViewStyle;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = '#007AFF',
  text,
  fullScreen = false,
  overlay = false,
  style,
}) => {
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, { color }]}>{text}</Text>}
    </>
  );
  
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, overlay && styles.overlay, style]}>
        <View style={styles.contentContainer}>
          {content}
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 999,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Loading;
