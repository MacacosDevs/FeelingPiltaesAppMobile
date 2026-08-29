import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { ChevronLeftIcon, QrCodeIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon, XCircleIcon } from 'react-native-heroicons/solid';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '@/features/auth';
import { obtenerClase, registrarCheckin } from '@/features/classes';
import { ApiError } from '../api/client';
import type { ClaseResponse } from '../api/types';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import { formatHora } from '../utils/date';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorClassCheckIn'>;

type Escaneo = {
  valor: string;
  ok: boolean;
  mensaje: string;
  hora: string;
};

// La reserva es el boleto: ClassDetailScreen.tsx genera este mismo formato
// "FEELINGPILATES-RESERVA|<claseReservaId>|<claseId>" al mostrar el QR de una
// reserva confirmada. El backend valida dueño/estado/ventana de horario en
// cada escaneo, así que aquí solo se parsea el formato, no se decide nada.
function parseCodigo(valor: string): { reservaId: string; claseId: string } | null {
  const partes = valor.split('|');
  if (partes.length === 3 && partes[0] === 'FEELINGPILATES-RESERVA') {
    return { reservaId: partes[1], claseId: partes[2] };
  }
  return null;
}

export function InstructorClassCheckInScreen({ navigation, route }: Props) {
  const { token } = useAuth();
  const [activeClase, setActiveClase] = useState<ClaseResponse | null>(null);
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [escaneados, setEscaneados] = useState<Escaneo[]>([]);
  const ultimoValorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    let cancelado = false;
    obtenerClase(route.params.claseId)
      .then(data => {
        if (!cancelado) setActiveClase(data);
      })
      .catch(() => {
        if (!cancelado) setActiveClase(null);
      });
    return () => {
      cancelado = true;
    };
  }, [route.params.claseId]);

  const procesarCodigo = async (valor: string) => {
    if (!valor || valor === ultimoValorRef.current || !token) return;
    ultimoValorRef.current = valor;
    const hora = new Date().toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });

    const parsed = parseCodigo(valor);
    if (!parsed) {
      setEscaneados(prev => [{ valor, ok: false, mensaje: 'Código no reconocido', hora }, ...prev]);
      return;
    }
    if (parsed.claseId !== route.params.claseId) {
      setEscaneados(prev => [{ valor, ok: false, mensaje: 'Ese código no es de esta clase', hora }, ...prev]);
      return;
    }
    try {
      const resultado = await registrarCheckin(token, parsed.reservaId, parsed.claseId);
      setEscaneados(prev => [{ valor, ok: true, mensaje: `${resultado.clienteNombre} · presente`, hora }, ...prev]);
    } catch (err) {
      const mensaje = err instanceof ApiError ? err.message : 'No se pudo registrar el check-in';
      setEscaneados(prev => [{ valor, ok: false, mensaje, hora }, ...prev]);
    }
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
          {activeClase && (
            <Text style={styles.headerSubtitle}>
              {activeClase.tipoActividadNombre} · {activeClase.salonNombre} · {formatHora(activeClase.horaInicio)}
            </Text>
          )}
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
                {item.ok ? (
                  <CheckCircleIcon color={colors.spotsAvailable} size={20} />
                ) : (
                  <XCircleIcon color={colors.error} size={20} />
                )}
                <View style={styles.resultTextWrap}>
                  <Text style={styles.resultValue} numberOfLines={1}>
                    {item.mensaje}
                  </Text>
                  <Text style={styles.resultMeta}>{item.hora}</Text>
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
