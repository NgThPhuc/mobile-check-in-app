// src/components/common/Button.tsx
// Button component tái sử dụng

import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  
  const getBackgroundColor = () => {
    if (isDisabled) return '#CCCCCC';
    switch (variant) {
      case 'primary': return '#007AFF';
      case 'secondary': return '#5856D6';
      case 'danger': return '#FF3B30';
      case 'outline': return 'transparent';
      default: return '#007AFF';
    }
  };
  
  const getTextColor = () => {
    if (isDisabled) return '#888888';
    switch (variant) {
      case 'outline': return '#007AFF';
      default: return '#FFFFFF';
    }
  };
  
  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large': return { paddingVertical: 16, paddingHorizontal: 32 };
      default: return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 18;
      default: return 16;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getPadding(),
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: '#007AFF',
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getFontSize() },
              icon ? { marginLeft: 8 } : {},
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  text: {
    fontWeight: '600',
  },
});

export default Button;
