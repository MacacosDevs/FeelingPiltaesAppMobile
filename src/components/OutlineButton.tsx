import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';

type OutlineButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function OutlineButton({ label, onPress, icon, disabled = false, style }: OutlineButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      onPress={disabled ? undefined : onPress}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 46,
    flexDirection: 'row',
    gap: 8,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
  },
});
