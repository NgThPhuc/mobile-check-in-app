// src/components/common/Input.tsx
// Input component tái sử dụng

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  secureTextEntry,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const hasError = !!error;
  
  const getBorderColor = () => {
    if (hasError) return '#FF3B30';
    if (isFocused) return '#007AFF';
    return '#E5E5EA';
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, { borderColor: getBorderColor() }]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={isFocused ? '#007AFF' : '#8E8E93'} 
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? { paddingLeft: 0 } : {},
            (isPassword || rightIcon) ? { paddingRight: 0 } : {},
          ]}
          placeholderTextColor="#C7C7CC"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          {...textInputProps}
        />
        
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={20} 
              color="#8E8E93" 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            <Ionicons name={rightIcon} size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
    padding: 4,
  },
  error: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
});

export default Input;
