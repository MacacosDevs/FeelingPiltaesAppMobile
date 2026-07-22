import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { colors, fontFamily, fontSize } from '../theme';

type EmailInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function EmailInput({
  value,
  onChangeText,
  placeholder = 'Ingresa tu correo electrónico',
}: EmailInputProps) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 41,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
});
