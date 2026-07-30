import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  UsersIcon,
  CalendarDaysIcon,
  SparklesIcon,
  MapPinIcon,
  StarIcon,
} from 'react-native-heroicons/outline';
import { PrimaryButton } from '../components/PrimaryButton';
import { OutlineButton } from '../components/OutlineButton';
import { HeroCarousel, type HeroSlide } from '../components/HeroCarousel';
import { useSportMode } from '../context/SportModeContext';
import { PadelHomeScreen } from './PadelHomeScreen';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { MainTabParamList } from '../navigation/types';

type HomeNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

const heroImage = require('../assets/images/pilates-hero.jpg');

// El resto de las fotos del carrusel todavía no existen como assets propios;
// mientras se consiguen fotos reales del estudio, estas diapositivas usan un
// color de marca de fondo en vez de una imagen. Basta con añadir `image` a
// cada entrada (y quitar `tint`/`Icon`) cuando las fotos estén disponibles.
const heroSlides: HeroSlide[] = [
  {
    id: 'estudio',
    kicker: 'Reformer · Mat',
    title: 'Un estudio boutique en el corazón de la ciudad',
    image: heroImage,
  },
  {
    id: 'comunidad',
    kicker: 'Comunidad',
    title: 'Grupos reducidos, atención personalizada',
    tint: colors.accent,
    Icon: UsersIcon,
  },
  {
    id: 'horarios',
    kicker: 'Flexibilidad',
    title: 'Horarios pensados para tu rutina',
    tint: colors.gold,
    Icon: CalendarDaysIcon,
  },
  {
    id: 'instructoras',
    kicker: 'Instructoras',
    title: 'Certificadas y en constante formación',
    tint: colors.textPrimary,
    Icon: SparklesIcon,
  },
];

const features = [
  {
    Icon: UsersIcon,
    title: 'Grupos reducidos',
    description: 'Máximo 8 personas por clase para una atención cercana.',
  },
  {
    Icon: CalendarDaysIcon,
    title: 'Horarios flexibles',
    description: 'Clases desde las 7 am hasta las 8 pm, todos los días.',
  },
  {
    Icon: SparklesIcon,
    title: 'Instructoras certificadas',
    description: 'Formación continua en Reformer, Mat y Barre.',
  },
  {
    Icon: MapPinIcon,
    title: 'Studio 14',
    description: 'Un espacio boutique pensado para tu práctica.',
  },
] as const;

const stats = [
  { value: '+500', label: 'Alumnas activas' },
  { value: '12', label: 'Años de experiencia' },
  { value: '4.9', label: 'Valoración promedio' },
] as const;

// No existe todavía un backend de horario/reservas; este avance de clases
// usa contenido de referencia igual al de la pantalla de Horario, hasta que
// esa API exista.
const proximasClases = [
  { hora: '9:00 am', nombre: 'Reformer', instructora: 'Con Vane Torres' },
  { hora: '10:15 am', nombre: 'Barre Sculpt', instructora: 'Con Ale' },
] as const;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { sport } = useSportMode();

  if (sport === 'padel') {
    return <PadelHomeScreen />;
  }

  return (
    <SafeAreaView style={commonStyles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <HeroCarousel slides={heroSlides} />

        <View style={styles.content}>
          <View style={styles.intro}>
            <Text style={styles.kicker}>FEELING  ·  PILATES</Text>
            <Text style={styles.headline}>Tu espacio de movimiento y calma</Text>
            <Text style={styles.subtitle}>
              Reserva tus clases, paquetes y horarios favoritos en un solo lugar.
            </Text>
          </View>

          <View style={styles.ctaRow}>
            <View style={styles.ctaItem}>
              <PrimaryButton label="Ver horario" onPress={() => navigation.navigate('Clases')} />
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
              <Text style={styles.sectionTitle}>Próximas clases</Text>
              <Text style={styles.sectionLink} onPress={() => navigation.navigate('Clases')}>
                Ver todas
              </Text>
            </View>
            <View style={styles.classList}>
              {proximasClases.map(clase => (
                <View key={clase.nombre} style={styles.classCard}>
                  <Text style={styles.classHora}>{clase.hora}</Text>
                  <View style={styles.classDivider} />
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{clase.nombre}</Text>
                    <Text style={styles.classInstructora}>{clase.instructora}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.testimonial}>
            <StarIcon color={colors.gold} size={18} />
            <Text style={styles.testimonialQuote}>
              “Encontré mi lugar de calma en medio de la semana. Las instructoras
              son increíbles y el ambiente se siente como en casa.”
            </Text>
            <Text style={styles.testimonialAuthor}>— Fernanda R., alumna desde 2024</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  classList: {
    gap: 10,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  classHora: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  classDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  classInfo: {
    gap: 2,
  },
  className: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.classTitle,
    color: colors.textPrimary,
  },
  classInstructora: {
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
