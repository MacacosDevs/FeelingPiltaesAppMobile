import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Brand } from '../components/Brand';
import { EmailInput } from '../components/EmailInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Brand />
        <Text style={styles.closeIcon}>✕</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>
          Ingresa tu correo electrónico para crear tu cuenta.
        </Text>

        <EmailInput value={email} onChangeText={setEmail} />

        <PrimaryButton
          label="Continuar"
          onPress={() => navigation.replace('Home')}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>¿Ya tienes una cuenta? </Text>
          <Pressable onPress={() => navigation.replace('Login')}>
            <Text style={styles.switchLink}>Iniciar sesión</Text>
          </Pressable>
        </View>

        <Text style={styles.dividerText}>O continúa con:</Text>

        <Pressable style={styles.googleButton}>
          <View style={styles.googleDot} />
          <Text style={styles.googleLabel}>Continuar con Google</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeIcon: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.textPrimary,
  },
  body: {
    paddingHorizontal: 28,
    paddingVertical: 32,
    gap: 16,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  switchRow: {
    flexDirection: 'row',
  },
  switchText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  switchLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  dividerText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  googleButton: {
    height: 42,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  googleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.googleRed,
  },
  googleLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
});
