import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PencilSquareIcon } from 'react-native-heroicons/outline';
import { Avatar } from '@/components/Avatar';
import { GuestPrompt } from '../components/GuestPrompt';
import { OutlineButton } from '@/components/OutlineButton';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/api/client';
import { resolveMediaUrl } from '@/utils/media';
import { ACTIVITY_META } from '@/utils/activityMeta';
import { useSportMode } from '@/context/SportModeContext';
import { useMisReservas } from '@/features/classes';
import { PadelAccountScreen } from '@/features/padel';
import { paqueteActivoDe, useMisCompras, useMisPaquetesActivos, formatPrecio } from '@/features/packages';
import { formatDayMonth, formatHora, formatShortDate } from '@/utils/date';
import { isClasePast } from '@/data/clases';
import type { ClaseReservaResponse, CompraResponse } from '@/api/types';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius, shadows } from '@/theme';
import type { MainTabParamList, RootStackParamList } from '@/app/navigation/types';

type AccountNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Account'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ESTADO_COMPRA_META: Record<CompraResponse['estado'], { label: string; color: string }> = {
  pagada: { label: 'Pagado', color: colors.spotsAvailable },
  pendiente: { label: 'Pendiente', color: colors.gold },
  fallida: { label: 'Fallido', color: colors.error },
  cancelada: { label: 'Cancelado', color: colors.error },
};

function ordenClase(reserva: ClaseReservaResponse): string {
  return `${reserva.clase.fecha}T${reserva.clase.horaInicio}`;
}

// Estado mostrado junto a cada reserva. El backend ya excluye las reservas que
// canceló el propio usuario; una clase cancelada por el estudio sí aparece.
function estadoReserva(reserva: ClaseReservaResponse, pasada: boolean): { label: string; color: string } | null {
  if (reserva.clase.estado === 'CANCELADA') {
    return { label: 'Clase cancelada', color: colors.error };
  }
  if (!pasada) {
    return null;
  }
  return reserva.estado === 'ASISTIO'
    ? { label: 'Asististe', color: colors.spotsAvailable }
    : { label: 'No asististe', color: colors.textMuted };
}

export function AccountScreen() {
  const { user, logout, deleteAccount, photoVersion } = useAuth();
  const navigation = useNavigation<AccountNavigationProp>();
  const { sport } = useSportMode();
  const { reservas, recargar: recargarReservas } = useMisReservas();
  const avatarUri = resolveMediaUrl(user?.fotoUrl, photoVersion);
  const { paquetes: paquetesActivos, recargar: recargarPaquetes } = useMisPaquetesActivos();
  const { compras, recargar: recargarCompras } = useMisCompras();
  const [refrescando, setRefrescando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Próximas: de la más cercana a la más lejana. Historial: de la más reciente
  // a la más antigua.
  const { proximas, historial } = useMemo(() => {
    const ahora = new Date();
    const futuras: ClaseReservaResponse[] = [];
    const pasadas: ClaseReservaResponse[] = [];
    for (const reserva of reservas) {
      (isClasePast(reserva.clase, ahora) ? pasadas : futuras).push(reserva);
    }
    futuras.sort((a, b) => ordenClase(a).localeCompare(ordenClase(b)));
    pasadas.sort((a, b) => ordenClase(b).localeCompare(ordenClase(a)));
    return { proximas: futuras, historial: pasadas };
  }, [reservas]);

  // Al volver de reservar o cancelar en el detalle de clase, la lista se
  // actualiza sin tener que deslizar para refrescar.
  useFocusEffect(
    useCallback(() => {
      recargarReservas();
    }, [recargarReservas]),
  );

  function handleRefresh() {
    setRefrescando(true);
    recargarReservas();
    recargarPaquetes();
    recargarCompras();
    // Los hooks no exponen su propio estado de carga; se da tiempo a que la
    // petición vuelva antes de ocultar el indicador de refresco.
    setTimeout(() => setRefrescando(false), 600);
  }

  function handleEliminarCuenta() {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción no se puede deshacer. Se perderá el acceso a tus reservas, paquetes e historial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setEliminando(true);
            try {
              await deleteAccount();
            } catch (err) {
              const message = err instanceof ApiError ? err.message : 'Ocurrió un error inesperado';
              Alert.alert('No se pudo eliminar la cuenta', message);
            } finally {
              setEliminando(false);
            }
          },
        },
      ],
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.screen} edges={[]}>
        <GuestPrompt
          title="Inicia sesión para ver tu cuenta"
          subtitle="Consulta tus paquetes, tu historial de reservas y edita tu perfil."
          onLogin={() => navigation.navigate('Auth', { mode: 'login' })}
          onRegister={() => navigation.navigate('Auth', { mode: 'register' })}
        />
      </SafeAreaView>
    );
  }

  if (sport === 'padel') {
    return <PadelAccountScreen />;
  }

  return (
    <SafeAreaView style={commonStyles.screen} edges={[]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={handleRefresh} tintColor={colors.accent} />
        }>
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <View style={styles.avatarRing}>
              <Avatar uri={avatarUri} name={user?.nombre} size={60} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{user?.nombre ?? ''}</Text>
              <Text style={styles.email}>{user?.correo ?? ''}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.editChip, pressed && styles.editChipPressed]}
            onPress={() => navigation.navigate('EditProfile')}>
            <PencilSquareIcon color={colors.accent} size={15} />
            <Text style={styles.editLink}>Editar perfil</Text>
          </Pressable>
        </View>

        {(['pilates', 'bacufit'] as const).map(categoria => {
          const paquete = paqueteActivoDe(paquetesActivos, categoria);
          if (!paquete) return null;

          const inicio = new Date(paquete.fechaInicio).getTime();
          const expiracion = new Date(paquete.fechaExpiracion).getTime();
          const progreso =
            expiracion > inicio
              ? Math.min(1, Math.max(0, (Date.now() - inicio) / (expiracion - inicio)))
              : 0;

          return (
            <View key={categoria} style={styles.packageCard}>
              <Text style={styles.packageName}>{paquete.nombre}</Text>
              <Text style={styles.packageMeta}>
                <Text style={styles.packageRestantes}>
                  Vence el {formatDayMonth(new Date(paquete.fechaExpiracion))}
                </Text>
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progreso * 100}%` }]} />
              </View>
            </View>
          );
        })}

        {[
          { titulo: 'Próximas clases', lista: proximas, pasada: false, vacio: 'No tienes clases reservadas próximamente.' },
          { titulo: 'Historial', lista: historial, pasada: true, vacio: 'Aún no has tomado ninguna clase.' },
        ].map(seccion => (
          <View key={seccion.titulo}>
            <Text style={styles.sectionLabel}>{seccion.titulo}</Text>
            {seccion.lista.length === 0 ? (
              <View style={styles.historyEmpty}>
                <Text style={styles.historyEmptyText}>{seccion.vacio}</Text>
              </View>
            ) : (
              <View style={styles.historyCard}>
                {seccion.lista.map((reserva, index) => {
                  const meta = ACTIVITY_META[reserva.clase.tipoActividadNombre];
                  const Icon = meta?.Icon;
                  const estado = estadoReserva(reserva, seccion.pasada);
                  return (
                    <Pressable
                      key={reserva.id}
                      style={[
                        styles.historyRow,
                        index === seccion.lista.length - 1 && styles.historyRowLast,
                      ]}
                      onPress={() => navigation.navigate('ClassDetail', { claseId: reserva.clase.id })}>
                      <View style={styles.historyClaseRow}>
                        {Icon && (
                          <View style={[styles.historyIconWrap, { backgroundColor: `${meta.color}1f` }]}>
                            <Icon color={meta.color} size={16} />
                          </View>
                        )}
                        <View style={styles.paymentInfo}>
                          <Text style={styles.historyClase}>{reserva.clase.tipoActividadNombre}</Text>
                          <Text style={styles.paymentFecha}>
                            {formatShortDate(new Date(`${reserva.clase.fecha}T00:00:00`))} ·{' '}
                            {formatHora(reserva.clase.horaInicio)}
                          </Text>
                        </View>
                      </View>
                      {estado && (
                        <Text style={[styles.paymentEstado, { color: estado.color }]}>{estado.label}</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ))}

        <View>
          <Text style={styles.sectionLabel}>Historial de pagos</Text>
          {compras.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Text style={styles.historyEmptyText}>Aún no has comprado ningún paquete.</Text>
            </View>
          ) : (
            <View style={styles.historyCard}>
              {compras.map((compra, index) => {
                const estadoMeta = ESTADO_COMPRA_META[compra.estado];
                return (
                  <View
                    key={compra.id}
                    style={[
                      styles.historyRow,
                      index === compras.length - 1 && styles.historyRowLast,
                    ]}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.historyClase}>{compra.paqueteNombre}</Text>
                      <Text style={styles.paymentFecha}>
                        {formatDayMonth(new Date(compra.creadoEn))} ·{' '}
                        {formatPrecio(compra.montoCentavos)}
                      </Text>
                    </View>
                    <Text style={[styles.paymentEstado, { color: estadoMeta.color }]}>
                      {estadoMeta.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.logoutSection}>
          <OutlineButton label="Cerrar sesión" onPress={logout} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.deleteAccountButton, pressed && styles.deleteAccountButtonPressed]}
          disabled={eliminando}
          onPress={handleEliminarCuenta}>
          <Text style={styles.deleteAccountLabel}>
            {eliminando ? 'Eliminando cuenta…' : 'Eliminar cuenta'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  profileSection: {
    gap: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarRing: {
    padding: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg + 2,
    color: colors.textPrimary,
  },
  email: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: 2,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.pillBorder,
    backgroundColor: colors.surface,
  },
  editChipPressed: {
    backgroundColor: colors.chipBackground,
  },
  editLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  packageCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 6,
    ...shadows.card,
  },
  packageName: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md + 2,
    color: colors.textPrimary,
  },
  packageMeta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
  },
  packageRestantes: {
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs + 2,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  historyEmpty: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  historyEmptyText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyRowLast: {
    borderBottomWidth: 0,
  },
  historyClaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyClase: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  paymentInfo: {
    gap: 2,
  },
  paymentFecha: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
  paymentEstado: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
  logoutSection: {
    marginTop: 8,
  },
  deleteAccountButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  deleteAccountButtonPressed: {
    opacity: 0.6,
  },
  deleteAccountLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.error,
  },
});
