import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UserCircleIcon } from 'react-native-heroicons/outline';
import { OutlineButton } from './OutlineButton';
import { PrimaryButton } from './PrimaryButton';
import { colors, fontFamily, fontSize } from '../theme';

type GuestPromptProps = {
  title: string;
  subtitle: string;
  onLogin: () => void;
  onRegister: () => void;
};

export function GuestPrompt({ title, subtitle, onLogin, onRegister }: GuestPromptProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <UserCircleIcon color={colors.accent} size={40} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.actions}>
        <PrimaryButton label="Iniciar sesión" onPress={onLogin} />
        <OutlineButton label="Crear una cuenta" onPress={onRegister} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    marginBottom: 8,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
});
