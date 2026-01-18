// src/components/common/Card.tsx
// Card component tái sử dụng

import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'elevated',
  padding = 'medium',
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'small': return 10;
      case 'large': return 20;
      default: return 15;
    }
  };
  
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: '#E5E5EA',
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'flat':
        return {
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return {};
    }
  };
  
  const cardStyle: ViewStyle = {
    ...styles.card,
    padding: getPadding(),
    ...getVariantStyle(),
  };
  
  if (onPress) {
    return (
      <TouchableOpacity 
        style={[cardStyle, style]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;
