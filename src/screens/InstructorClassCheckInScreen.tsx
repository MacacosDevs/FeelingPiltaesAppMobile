import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { ChevronLeftIcon, QrCodeIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAttendance } from '../context/AttendanceContext';
import { clases } from '../data/clases';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorClassCheckIn'>;

type Escaneo = {
  valor: string;
  correo: string | null;
  esDeEstaClase: boolean;
  hora: string;
};

// El formato "FEELINGPILATES|claseId|correo" ya lo genera ClassDetailScreen.tsx
// cuando una clienta reserva una clase (código QR de su reserva). Todavía no
// existe un backend de reservas, así que aquí solo detectamos y mostramos lo
// escaneado en esta sesión — no se guarda ni se marca asistencia en ningún
// lado todavía.
function parseCodigo(valor: string, claseId: string): { correo: string | null; esDeEstaClase: boolean } {
  const partes = valor.split('|');
  if (partes.length === 3 && partes[0] === 'FEELINGPILATES') {
    return { correo: partes[2], esDeEstaClase: partes[1] === claseId };
  }
  return { correo: null, esDeEstaClase: false };
}

export function InstructorClassCheckInScreen({ navigation, route }: Props) {
  const activeClase = clases.find(clase => clase.id === route.params.claseId) ?? clases[0];
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();
  const { hasPermission, requestPermission } = useCameraPermission();
  const { registrarAsistencia } = useAttendance();
  const [escaneados, setEscaneados] = useState<Escaneo[]>([]);
  const ultimoValorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  // Compartida entre el escáner real y el botón de prueba temporal de abajo:
  // así el botón ejerce exactamente el mismo camino de código que un escaneo
  // real de la cámara, en vez de simular el resultado por separado.
  const procesarCodigo = (valor: string) => {
    if (!valor || valor === ultimoValorRef.current) return;
    ultimoValorRef.current = valor;
    setEscaneados(prev => {
      if (prev.some(item => item.valor === valor)) return prev;
      const { correo, esDeEstaClase } = parseCodigo(valor, activeClase.id);
      const hora = new Date().toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
      // Todavía no hay sistema real de reservas que diga quién es cada
      // correo escaneado, así que cada escaneo válido de esta clase marca
      // como presente a la siguiente persona de la lista de ejemplo (ver
      // AttendanceContext.tsx e InstructorClassDetailScreen.tsx).
      if (esDeEstaClase) registrarAsistencia(activeClase.id);
      return [{ valor, correo, esDeEstaClase, hora }, ...prev];
    });
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      const valor = codes[0]?.value;
      if (valor) procesarCodigo(valor);
    },
  });

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} hitSlop={8} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon color={colors.textPrimary} size={22} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Pasar lista por QR</Text>
          <Text style={styles.headerSubtitle}>
            {activeClase.nombre} · {activeClase.sala} · {activeClase.hora}
          </Text>
        </View>
      </View>

      {!device ? (
        <View style={styles.centerMessage}>
          <Text style={styles.messageText}>No se encontró una cámara en este dispositivo.</Text>
        </View>
      ) : !hasPermission ? (
        <View style={styles.centerMessage}>
          <View style={styles.iconWrap}>
            <QrCodeIcon color={colors.accent} size={36} />
          </View>
          <Text style={styles.messageTitle}>Necesitamos acceso a tu cámara</Text>
          <Text style={styles.messageText}>Para escanear los códigos QR de asistencia.</Text>
          <View style={styles.permissionButton}>
            <PrimaryButton label="Dar acceso a la cámara" onPress={requestPermission} />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.cameraWrap}>
            <Camera style={StyleSheet.absoluteFill} device={device} isActive={isFocused} codeScanner={codeScanner} />
            <View style={styles.scanFrame} pointerEvents="none" />
          </View>

          <View style={styles.resultsWrap}>
            <Text style={styles.resultsLabel}>
              {escaneados.length === 0
                ? 'Apunta la cámara al código QR de la reserva'
                : `Escaneados en esta sesión (${escaneados.length})`}
            </Text>
            {escaneados.slice(0, 4).map(item => (
              <View key={item.valor} style={styles.resultRow}>
                <CheckCircleIcon
                  color={item.esDeEstaClase ? colors.spotsAvailable : colors.textMuted}
                  size={20}
                />
                <View style={styles.resultTextWrap}>
                  <Text style={styles.resultValue} numberOfLines={1}>
                    {item.correo ?? item.valor}
                  </Text>
                  <Text style={styles.resultMeta}>
                    {item.hora} · {item.esDeEstaClase ? 'Reserva de esta clase' : 'No coincide con esta clase'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  centerMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
    marginTop: -52,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    marginBottom: 4,
  },
  messageTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  messageText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 12,
    alignSelf: 'stretch',
  },
  cameraWrap: {
    flex: 1,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderRadius: radius.input,
    borderWidth: 3,
    borderColor: colors.background,
  },
  resultsWrap: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultsLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultTextWrap: {
    flex: 1,
  },
  resultValue: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  resultMeta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
