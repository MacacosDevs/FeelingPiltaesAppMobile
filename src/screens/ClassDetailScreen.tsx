import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeftIcon,
  HeartIcon,
  MapPinIcon,
  SparklesIcon,
  StarIcon,
} from 'react-native-heroicons/outline';
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';
import QRCode from 'react-native-qrcode-svg';
import { PrimaryButton } from '../components/PrimaryButton';
import { OutlineButton } from '../components/OutlineButton';
import { AuthRequiredSheet } from '../components/AuthRequiredSheet';
import { CapacityIndicator } from '../components/CapacityIndicator';
import { MapPreview } from '../components/MapPreview';
import { INSTRUCTOR_META, SALON_ADDRESSES, isClasePast, salonGeocodeQuery, type Categoria } from '../data/clases';
import { obtenerClase, reservarClase } from '../api/clases';
import { ApiError } from '../api/client';
import type { ClaseResponse } from '../api/types';
import { useMisReservas } from '../hooks/useMisReservas';
import { paqueteActivoDe, useMisPaquetesActivos } from '../hooks/useMisPaquetesActivos';
import { useAuth } from '../context/AuthContext';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius, shadows } from '../theme';
import { formatDayMonth, formatFullDate, formatHora } from '../utils/date';
import { openDirections } from '../utils/directions';
import type { RootStackParamList } from '@/app/navigation/types';

const avatarPlaceholder = require('../assets/images/avatar-placeholder.jpg');
const imgYoga = require('../assets/images/yoga-wellness.jpg');
const imgSpa = require('../assets/images/spa-massage.jpg');
const imgReformer = require('../assets/images/pilates-reformer.jpg');

const NOMBRE_ACTIVIDAD_BACU_FIT = 'Bacu Fit';

type Props = NativeStackScreenProps<RootStackParamList, 'ClassDetail'>;

export function ClassDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const { reservas, recargar } = useMisReservas();
  const { paquetes: paquetesActivos, recargar: recargarPaquetes } = useMisPaquetesActivos();
  const [activeClase, setActiveClase] = useState<ClaseResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    obtenerClase(route.params.claseId)
      .then(data => {
        if (!cancelado) setActiveClase(data);
      })
      .catch(() => {
        if (!cancelado) setActiveClase(null);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [route.params.claseId]);

  async function handleRefresh() {
    setRefrescando(true);
    try {
      const data = await obtenerClase(route.params.claseId);
      setActiveClase(data);
    } catch {
      // Se conserva la clase ya cargada si falla el refresco.
    }
    recargar();
    recargarPaquetes();
    setRefrescando(false);
  }

  if (cargando || !activeClase) {
    return (
      <SafeAreaView style={[commonStyles.screen, styles.center]} edges={['top']}>
        {cargando ? (
          <ActivityIndicator color={colors.accent} size="large" />
        ) : (
          <Text style={styles.errorText}>No se encontró la información de esta clase.</Text>
        )}
      </SafeAreaView>
    );
  }

  const esBacuFit = activeClase.tipoActividadNombre === NOMBRE_ACTIVIDAD_BACU_FIT;
  const esReformer = activeClase.tipoActividadNombre.toLowerCase().includes('reformer');
  const heroImage = esBacuFit ? imgSpa : esReformer ? imgReformer : imgYoga;

  const categoria: Categoria = esBacuFit ? 'bacufit' : 'pilates';
  const paqueteDeLaClase = paqueteActivoDe(paquetesActivos, categoria);
  const tienePaquete = !!paqueteDeLaClase;
  const miReserva = reservas.find(r => r.clase.id === activeClase.id);
  const reserved = !!miReserva;
  const past = isClasePast(activeClase);
  const qrValue = miReserva ? `FEELINGPILATES-RESERVA|${miReserva.id}|${activeClase.id}` : '';

  const instructorName = activeClase.instructorNombre;
  const instructorMeta = INSTRUCTOR_META[`Con ${activeClase.instructorNombre}`];
  const address = SALON_ADDRESSES[activeClase.salonNombre];
  const locationLabel = address ? `${activeClase.salonNombre} · ${address}` : activeClase.salonNombre;
  const geocodeQuery = salonGeocodeQuery(activeClase.salonNombre);
  const directionsQuery = geocodeQuery ?? locationLabel;

  const beneficios = esBacuFit
    ? [
        { icon: '💧', text: 'Aceites esenciales' },
        { icon: '🎵', text: 'Música ambiental' },
        { icon: '♨️', text: 'Ambiente cálido' },
        { icon: '👤', text: 'Terapia personalizada' },
      ]
    : [
        { icon: '🍃', text: 'Reduce el estrés' },
        { icon: '🧘', text: 'Mejora la postura' },
        { icon: '〰️', text: 'Aumenta la flexibilidad' },
        { icon: '🤍', text: 'Bienestar integral' },
      ];

  async function handleConfirmarReserva() {
    if (!token || !activeClase || procesando) {
      return;
    }
    setProcesando(true);
    try {
      await reservarClase(token, activeClase.id);
      recargar();
      setConfirmModalOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Ocurrió un error inesperado';
      Alert.alert('No se pudo reservar', message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      {/* Top Header con botones circulares estilo Luma */}
      <View style={styles.topNav}>
        <Pressable
          style={styles.circleActionBtn}
          hitSlop={8}
          onPress={() => navigation.goBack()}>
          <ArrowLeftIcon color={colors.textPrimary} size={20} />
        </Pressable>

        <Pressable
          style={styles.circleActionBtn}
          hitSlop={8}
          onPress={() => setFavorito(!favorito)}>
          {favorito ? (
            <HeartIconSolid color={colors.accent} size={20} />
          ) : (
            <HeartIcon color={colors.textPrimary} size={20} />
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={handleRefresh} tintColor={colors.accent} />
        }>
        {/* Ilustración Escénica Central */}
        <View style={styles.heroArtCard}>
          <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />

          {/* Dots de Carrusel */}
          <View style={styles.carouselDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Título y Subtítulo Editorial */}
        <View style={styles.titleSection}>
          <Text style={styles.classTitle}>{activeClase.tipoActividadNombre}</Text>
          <Text style={styles.classSubtitle}>
            {esBacuFit
              ? 'Cardio dinámico y tonificación muscular consciente.'
              : 'Equilibrio y fuerza para cuerpo y mente.'}
          </Text>
          <Text style={styles.classDescription}>
            {esBacuFit
              ? 'Sesiones de alta energía combinando entrenamiento funcional y ritmo en un ambiente seguro y personalizado.'
              : 'Sesiones diseñadas para fortalecer el centro, mejorar la flexibilidad y conectar contigo misma en un espacio boutique.'}
          </Text>
        </View>

        {/* Beneficios (Grid de Pills con Iconos) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficios</Text>
          <View style={styles.badgeGrid}>
            {beneficios.map((b, i) => (
              <View key={i} style={styles.badgeChip}>
                <Text style={styles.badgeEmoji}>{b.icon}</Text>
                <Text style={styles.badgeText}>{b.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Capacidad & Disponibilidad */}
        <View style={styles.capacityCard}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityTitle}>Disponibilidad de cupos</Text>
            <CapacityIndicator
              ocupados={activeClase.lugaresOcupados}
              capacidad={activeClase.capacidad}
              size="md"
            />
          </View>
        </View>

        {/* Tarjeta de Instructora */}
        <Pressable
          style={styles.instructorCard}
          onPress={() => navigation.navigate('InstructorProfile', { instructora: `Con ${instructorName}` })}>
          <Image source={avatarPlaceholder} style={styles.instructorAvatar} />
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>Con {instructorName}</Text>
            {instructorMeta && (
              <View style={styles.ratingRow}>
                <StarIcon color={colors.gold} size={14} />
                <Text style={styles.ratingText}>
                  {instructorMeta.rating} · {instructorMeta.clasesImpartidas} clases impartidas
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.instructorLink}>Ver perfil →</Text>
        </Pressable>

        {/* Detalles de Fecha y Hora */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>{formatFullDate(new Date(`${activeClase.fecha}T00:00:00`))}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Horario</Text>
            <Text style={styles.infoValue}>
              {formatHora(activeClase.horaInicio)} - {formatHora(activeClase.horaFin)}
            </Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Paquete aplicable</Text>
            <Text style={styles.infoValue}>
              {tienePaquete
                ? `${paqueteDeLaClase!.nombre} · vence el ${formatDayMonth(new Date(paqueteDeLaClase!.fechaExpiracion))}`
                : 'Requiere un paquete activo'}
            </Text>
          </View>
        </View>

        {/* Código QR si ya está reservada */}
        {reserved && (
          <View style={styles.qrCard}>
            <Text style={styles.qrText}>
              Muestra este código en el salón para registrar tu asistencia.
            </Text>
            <Pressable style={styles.qrWrap} onPress={() => setQrModalOpen(true)}>
              <QRCode value={qrValue} size={140} />
            </Pressable>
            <Text style={styles.qrHint}>Toca para ampliar</Text>
          </View>
        )}

        {/* Mapa y Ubicación */}
        <View style={styles.locationSection}>
          {geocodeQuery ? (
            <MapPreview query={geocodeQuery} />
          ) : (
            <View style={styles.mapFallback}>
              <Text style={styles.mapFallbackText}>Ubicación exacta del salón</Text>
            </View>
          )}

          <View style={styles.locationRow}>
            <View style={styles.locationTextWrap}>
              <MapPinIcon color={colors.textMuted} size={16} />
              <Text style={styles.locationText}>{locationLabel}</Text>
            </View>
            <Pressable onPress={() => openDirections(directionsQuery)}>
              <Text style={styles.directionsLink}>Cómo llegar →</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar (Estado de Paquete / Créditos a la izquierda + Botón Reservar a la derecha) */}
      <View style={[styles.stickyFooter, { paddingBottom: 16 + insets.bottom }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>
            {tienePaquete ? '1 crédito' : 'Paquete'}
          </Text>
          <Text style={styles.priceLabel}>
            {tienePaquete ? paqueteDeLaClase!.nombre : 'Requiere paquete activo'}
          </Text>
        </View>

        <View style={styles.bookButtonContainer}>
          <PrimaryButton
            label={
              past
                ? 'Clase finalizada'
                : reserved
                  ? 'Reservado ✓'
                  : 'Reservar ahora'
            }
            onPress={() => {
              if (!user) {
                setAuthGateOpen(true);
                return;
              }
              setConfirmModalOpen(true);
            }}
            disabled={past || reserved}
          />
        </View>
      </View>

      <AuthRequiredSheet
        visible={authGateOpen}
        message="Necesitas iniciar sesión o crear una cuenta para reservar esta clase."
        onClose={() => setAuthGateOpen(false)}
        onLogin={() => {
          setAuthGateOpen(false);
          navigation.navigate('Auth', { mode: 'login' });
        }}
      />

      <Modal
        visible={confirmModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => (procesando ? undefined : setConfirmModalOpen(false))}>
        <Pressable style={styles.backdrop} onPress={() => (procesando ? undefined : setConfirmModalOpen(false))}>
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.confirmTitle}>¿Confirmar tu reserva?</Text>

            <View style={styles.confirmInfoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Clase</Text>
                <Text style={styles.infoValue}>{activeClase.tipoActividadNombre}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>{formatFullDate(new Date(`${activeClase.fecha}T00:00:00`))}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Hora</Text>
                <Text style={styles.infoValue}>{formatHora(activeClase.horaInicio)}</Text>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>Sala</Text>
                <Text style={styles.infoValue}>{activeClase.salonNombre}</Text>
              </View>
            </View>

            <View style={styles.confirmActions}>
              <View style={styles.confirmActionItem}>
                <OutlineButton
                  label="Cancelar"
                  onPress={() => setConfirmModalOpen(false)}
                  disabled={procesando}
                />
              </View>
              <View style={styles.confirmActionItem}>
                <PrimaryButton
                  label="Confirmar reserva"
                  onPress={handleConfirmarReserva}
                  loading={procesando}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={qrModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalOpen(false)}>
        <Pressable style={styles.qrBackdrop} onPress={() => setQrModalOpen(false)}>
          <View style={styles.qrModalCard}>
            <QRCode value={qrValue} size={260} />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topNav: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  circleActionBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 20,
  },
  heroArtCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.cardLg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingBottom: 12,
    ...shadows.card,
  },
  heroImage: {
    width: '100%',
    height: 245,
  },
  carouselDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    width: 16,
    backgroundColor: colors.accent,
  },
  titleSection: {
    gap: 6,
  },
  classTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl + 2,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  classSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base + 1,
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  classDescription: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md + 2,
    color: colors.textPrimary,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs + 2,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  capacityCard: {
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  capacityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capacityTitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  instructorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  instructorInfo: {
    flex: 1,
    gap: 3,
  },
  instructorName: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs + 1,
    color: colors.textMuted,
  },
  instructorLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
  infoCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  infoValue: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  locationSection: {
    gap: 10,
  },
  mapFallback: {
    height: 100,
    borderRadius: radius.card,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFallbackText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  locationTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  locationText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  directionsLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.tabBar,
  },
  priceContainer: {
    gap: 2,
  },
  priceAmount: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl + 2,
    color: colors.accent,
    fontWeight: fontWeight.bold,
  },
  priceLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  bookButtonContainer: {
    flex: 1,
    maxWidth: 200,
    marginLeft: 16,
  },
  qrCard: {
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  qrText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
  qrWrap: {
    padding: 12,
    borderRadius: radius.card,
    backgroundColor: colors.background,
  },
  qrHint: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  qrBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(43, 36, 32, 0.7)',
  },
  qrModalCard: {
    padding: 24,
    borderRadius: radius.card,
    backgroundColor: colors.background,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(43, 36, 32, 0.4)',
  },
  confirmCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
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
  confirmTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  confirmInfoList: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmActionItem: {
    flex: 1,
  },
});
