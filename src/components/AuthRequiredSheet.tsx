import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { OutlineButton } from './OutlineButton';
import { PrimaryButton } from './PrimaryButton';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';

type AuthRequiredSheetProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
  onLogin: () => void;
};

// Explica por qué se pide iniciar sesión antes de mandar al invitado a Auth,
// en vez de saltar directo sin contexto.
export function AuthRequiredSheet({ visible, message, onClose, onLogin }: AuthRequiredSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Inicia sesión para continuar</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <View style={styles.actionItem}>
              <OutlineButton label="Cancelar" onPress={onClose} />
            </View>
            <View style={styles.actionItem}>
              <PrimaryButton label="Iniciar sesión" onPress={onLogin} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(43, 36, 32, 0.4)',
  },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  title: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  message: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: -8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionItem: {
    flex: 1,
  },
});
