import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  StarIcon,
} from 'react-native-heroicons/outline';
import {
  ArrowCircleBtn,
  FilterSlidersIcon,
  SearchMagnifierIcon,
} from '../components/LumaArt';
import { useSportMode } from '../context/SportModeContext';
import { PadelHomeScreen } from './PadelHomeScreen';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius, shadows } from '../theme';
import type { MainTabParamList } from '@/app/navigation/types';

type HomeNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

const iconLeafPng = require('../assets/images/icon-leaf.png');
const iconLotusPng = require('../assets/images/icon-lotus.png');
const iconDumbbellPng = require('../assets/images/icon-dumbbell.png');
const iconPackagePng = require('../assets/images/icon-package.png');

const imgYoga = require('../assets/images/yoga-wellness.jpg');
const imgSpa = require('../assets/images/spa-massage.jpg');
const imgReformer = require('../assets/images/pilates-reformer.jpg');

const accesosRapidos = [
  { id: 'reformer', label: 'Reformer', image: iconDumbbellPng, target: 'Clases' as const },
  { id: 'mat', label: 'Mat & Flow', image: iconLeafPng, target: 'Clases' as const },
  { id: 'bacufit', label: 'Bacu Fit', image: iconLotusPng, target: 'Clases' as const },
  { id: 'paquetes', label: 'Paquetes', image: iconPackagePng, target: 'Paquetes' as const },
] as const;

const destacados = [
  {
    id: 'reformer_mind',
    title: 'Pilates Reformer',
    subtitle: 'Equilibra tu cuerpo y tu mente.',
    tag: 'Fuerza & Control',
    image: imgYoga,
  },
  {
    id: 'bacu_sculpt',
    title: 'Bacu Fit & Sculpt',
    subtitle: 'Libera tensiones y renueva tu energía.',
    tag: 'Cardio & Ritmo',
    image: imgSpa,
  },
  {
    id: 'studio_reformer',
    title: 'Studio Reformer',
    subtitle: 'Fuerza profunda, control y postura.',
    tag: 'Alineación',
    image: imgReformer,
  },
];

const proximasClases = [
  { id: '1', hora: '9:00 am', nombre: 'Pilates Reformer', instructora: 'Con Vane Torres', sala: 'Sala Reformer' },
  { id: '2', hora: '10:15 am', nombre: 'Bacu Fit & Sculpt', instructora: 'Con Ale', sala: 'Sala Principal' },
  { id: '3', hora: '5:30 pm', nombre: 'Mat & Alignment', instructora: 'Con Sofía', sala: 'Sala Mat' },
] as const;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { sport } = useSportMode();
  const [busqueda, setBusqueda] = useState('');

  if (sport === 'padel') {
    return <PadelHomeScreen />;
  }

  return (
    <SafeAreaView style={commonStyles.screen} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Barra de Búsqueda estilo Luma */}
        <View style={styles.searchSection}>
          <Pressable
            style={styles.searchBar}
            onPress={() => navigation.navigate('Clases')}>
            <SearchMagnifierIcon size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar servicios, clases o instructoras..."
              placeholderTextColor={colors.textMuted}
              value={busqueda}
              onChangeText={setBusqueda}
              editable={false}
              pointerEvents="none"
            />
            <View style={styles.filterBtn}>
              <FilterSlidersIcon size={16} color={colors.textPrimary} />
            </View>
          </Pressable>
        </View>

        {/* Sección: Accesos rápidos con Ilustraciones Realistas Transparentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Accesos rápidos</Text>
            <Pressable onPress={() => navigation.navigate('Clases')}>
              <Text style={styles.sectionLink}>Ver todo</Text>
            </Pressable>
          </View>

          <View style={styles.quickAccessGrid}>
            {accesosRapidos.map((item) => (
              <Pressable
                key={item.id}
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate(item.target)}>
                <View style={styles.squircleIcon}>
                  <Image source={item.image} style={styles.squircleImg} resizeMode="contain" />
                </View>
                <Text style={styles.quickAccessLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sección: Destacados con Ilustraciones Realistas (Sin precios) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Destacados</Text>
            <Pressable onPress={() => navigation.navigate('Clases')}>
              <Text style={styles.sectionLink}>Ver todo</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredCardsScroll}>
            {destacados.map((item) => (
              <Pressable
                key={item.id}
                style={styles.featuredCard}
                onPress={() => navigation.navigate('Clases')}>
                {/* Visual Image Area */}
                <View style={styles.featuredArtContainer}>
                  <Image source={item.image} style={styles.featuredImg} resizeMode="cover" />
                </View>

                {/* Card Content */}
                <View style={styles.featuredCardContent}>
                  <Text style={styles.featuredCardTitle}>{item.title}</Text>
                  <Text style={styles.featuredCardSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>

                  <View style={styles.featuredCardFooter}>
                    <View style={styles.featuredTagPill}>
                      <Text style={styles.featuredTagText}>{item.tag}</Text>
                    </View>
                    <ArrowCircleBtn size={30} />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Sección: Para ti / Próximas Clases */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Para ti · Horario de hoy</Text>
            <Pressable onPress={() => navigation.navigate('Clases')}>
              <Text style={styles.sectionLink}>Ver todo</Text>
            </Pressable>
          </View>

          <View style={styles.classList}>
            {proximasClases.map((clase) => (
              <Pressable
                key={clase.id}
                style={styles.classCard}
                onPress={() => navigation.navigate('Clases')}>
                <View style={styles.timeBadge}>
                  <CalendarDaysIcon size={14} color={colors.accent} />
                  <Text style={styles.classHora}>{clase.hora}</Text>
                </View>

                <View style={styles.classInfo}>
                  <Text style={styles.className}>{clase.nombre}</Text>
                  <Text style={styles.classInstructora}>
                    {clase.instructora} · <Text style={styles.classSala}>{clase.sala}</Text>
                  </Text>
                </View>

                <View style={styles.arrowCircleSmall}>
                  <ChevronRightIcon size={16} color={colors.textPrimary} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Testimonio / Sello de Comunidad */}
        <View style={styles.testimonialCard}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon key={s} color={colors.gold} size={16} />
            ))}
          </View>
          <Text style={styles.testimonialQuote}>
            “Encontré mi lugar de calma y fuerza en medio de la semana. Las instructoras son increíbles y el ambiente es cálido.”
          </Text>
          <Text style={styles.testimonialAuthor}>— Sofía Álvarez, alumna activa</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollBody: {
    paddingBottom: 40,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 16,
    paddingRight: 6,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base + 1,
    color: colors.textPrimary,
    paddingHorizontal: 10,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg - 3,
    color: colors.textPrimary,
  },
  sectionLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAccessItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  squircleIcon: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 78,
    borderRadius: radius.category + 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    ...shadows.card,
  },
  squircleImg: {
    width: '92%',
    height: '92%',
  },
  quickAccessLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs + 1,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  featuredCardsScroll: {
    paddingRight: 20,
    gap: 16,
  },
  featuredCard: {
    width: 235,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  featuredArtContainer: {
    height: 165,
    backgroundColor: colors.surfaceSoft,
    overflow: 'hidden',
  },
  featuredImg: {
    width: '100%',
    height: '100%',
  },
  featuredCardContent: {
    padding: 14,
    gap: 4,
  },
  featuredCardTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.md + 2,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  featuredCardSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs + 1,
    color: colors.textMuted,
    lineHeight: 16,
    minHeight: 32,
  },
  featuredCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  featuredTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
  },
  featuredTagText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  classList: {
    gap: 10,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.category,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  timeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.chipBackground,
  },
  classHora: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.xs + 1,
    color: colors.textPrimary,
  },
  classInfo: {
    flex: 1,
    gap: 2,
  },
  className: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.classTitle,
    color: colors.textPrimary,
  },
  classInstructora: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  classSala: {
    color: colors.accent,
  },
  arrowCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialCard: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  testimonialQuote: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.base + 1,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  testimonialAuthor: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs + 1,
    color: colors.textMuted,
    marginTop: 4,
  },
});
