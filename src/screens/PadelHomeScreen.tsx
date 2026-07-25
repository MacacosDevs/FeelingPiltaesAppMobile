import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  UserGroupIcon,
  ClockIcon,
  Squares2X2Icon,
  MapPinIcon,
  StarIcon,
} from 'react-native-heroicons/outline';
import { PrimaryButton } from '../components/PrimaryButton';
import { OutlineButton } from '../components/OutlineButton';
import { HeroCarousel, type HeroSlide } from '../components/HeroCarousel';
import { canchaById, horarios } from '../data/canchas';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { MainTabParamList } from '../navigation/types';

type PadelHomeNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

// Todavía no hay fotos propias de las canchas; mientras se consiguen, estas
// diapositivas usan un color de marca de fondo en vez de una imagen (mismo
// criterio que heroSlides en HomeScreen.tsx).
const heroSlides: HeroSlide[] = [
  {
    id: 'canchas',
    kicker: 'Feeling · Padel',
    title: 'Tu cancha te está esperando',
    tint: colors.textPrimary,
  },
  {
    id: 'comunidad',
    kicker: 'Comunidad',
    title: 'Arma tu partido y comparte el juego',
    tint: colors.accent,
    Icon: UserGroupIcon,
  },
  {
    id: 'canchas-tipo',
    kicker: 'Canchas',
    title: 'Panorámica, Cristal y Techada',
    tint: colors.gold,
    Icon: Squares2X2Icon,
  },
];

const features = [
  {
    Icon: UserGroupIcon,
    title: 'Para todos los niveles',
    description: 'Juega individual o en dobles, sin importar tu nivel.',
  },
  {
    Icon: ClockIcon,
    title: 'Reserva en minutos',
    description: 'Elige cancha, duración y modalidad desde la app.',
  },
  {
    Icon: Squares2X2Icon,
    title: 'Techadas y al aire libre',
    description: 'Panorámica, Cristal y Techada, según el clima.',
  },
  {
    Icon: MapPinIcon,
    title: 'Studio 14',
    description: 'Un espacio boutique pensado también para tu partido.',
  },
] as const;

const stats = [
  { value: '+300', label: 'Jugadores activos' },
  { value: '3', label: 'Canchas disponibles' },
  { value: '4.8', label: 'Valoración promedio' },
] as const;

// No existe todavía un backend de reservas de padel; este avance usa
// contenido de referencia igual al de la pantalla de Canchas, hasta que esa
// API exista (mismo criterio que proximasClases en HomeScreen.tsx).
const proximasReservas = horarios.slice(0, 2).map(horario => ({
  hora: horario.hora,
  cancha: canchaById(horario.canchaId),
}));

export function PadelHomeScreen() {
  const navigation = useNavigation<PadelHomeNavigationProp>();

  return (
    <SafeAreaView style={styles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <HeroCarousel slides={heroSlides} />

        <View style={styles.content}>
          <View style={styles.intro}>
            <Text style={styles.kicker}>FEELING  ·  PADEL</Text>
            <Text style={styles.headline}>Tu cancha, tu partido, tu ritmo</Text>
            <Text style={styles.subtitle}>
              Reserva canchas, arma tu partido y comparte el juego en un solo lugar.
            </Text>
          </View>

          <View style={styles.ctaRow}>
            <View style={styles.ctaItem}>
              <PrimaryButton label="Explorar canchas" onPress={() => navigation.navigate('Clases')} />
            </View>
            <View style={styles.ctaItem}>
              <OutlineButton label="Ver paquetes" onPress={() => navigation.navigate('Paquetes')} />
            </View>
          </View>

          <View style={styles.statsRow}>
            {stats.map(stat => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Por qué elegirnos</Text>
            <View style={styles.featureList}>
              {features.map(feature => (
                <View key={feature.title} style={styles.featureRow}>
                  <View style={styles.featureIconWrap}>
                    <feature.Icon color={colors.accent} size={22} />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Próximas reservas</Text>
              <Text style={styles.sectionLink} onPress={() => navigation.navigate('Clases')}>
                Ver todas
              </Text>
            </View>
            <View style={styles.reservaList}>
              {proximasReservas.map(reserva => (
                <View key={reserva.cancha?.id} style={styles.reservaCard}>
                  <Text style={styles.reservaHora}>{reserva.hora}</Text>
                  <View style={styles.reservaDivider} />
                  <View style={styles.reservaInfo}>
                    <Text style={styles.reservaNombre}>{reserva.cancha?.nombre}</Text>
                    <Text style={styles.reservaUbicacion}>{reserva.cancha?.ubicacion}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.testimonial}>
            <StarIcon color={colors.gold} size={18} />
            <Text style={styles.testimonialQuote}>
              “Encontramos nuestra cancha favorita para el partido de los viernes. Reservar
              desde la app nos ahorra tiempo y siempre hay disponibilidad.”
            </Text>
            <Text style={styles.testimonialAuthor}>— Diego M., jugador desde 2024</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollBody: {
    paddingBottom: 40,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    gap: 28,
  },
  intro: {
    alignItems: 'center',
    gap: 10,
  },
  kicker: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.accent,
    textAlign: 'center',
  },
  headline: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  ctaItem: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 14,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statValue: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.accent,
  },
  statLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  sectionLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  featureList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  featureDescription: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  reservaList: {
    gap: 10,
  },
  reservaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  reservaHora: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  reservaDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  reservaInfo: {
    gap: 2,
  },
  reservaNombre: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.classTitle,
    color: colors.textPrimary,
  },
  reservaUbicacion: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.gold,
  },
  testimonial: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    padding: 24,
    borderRadius: radius.input,
    backgroundColor: colors.chipBackground,
  },
  testimonialQuote: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  testimonialAuthor: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
