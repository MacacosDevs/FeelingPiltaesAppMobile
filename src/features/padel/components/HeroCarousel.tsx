import React, { useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors, fontFamily, fontSize, fontWeight, radius } from '@/theme';

export type HeroSlide = {
  id: string;
  kicker: string;
  title: string;
  image?: ImageSourcePropType;
  tint?: string;
  Icon?: React.ComponentType<{ color?: string; size?: number }>;
};

const CAROUSEL_HEIGHT = 320;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const lastReportedIndex = useRef(0);

  function handleMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== lastReportedIndex.current) {
      lastReportedIndex.current = index;
      setActiveIndex(index);
    }
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}>
        {slides.map(slide => {
          const Icon = slide.Icon;
          return (
            <View key={slide.id} style={[styles.slide, { width, height: CAROUSEL_HEIGHT }]}>
              {slide.image ? (
                <Image source={slide.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: slide.tint }]} />
              )}

              {Icon && (
                <View style={styles.slideIconWrap}>
                  <Icon color="rgba(255,255,255,0.3)" size={140} />
                </View>
              )}

              <View style={styles.captionWrap}>
                <View style={styles.captionPill}>
                  <Text style={styles.captionKicker}>{slide.kicker}</Text>
                  <Text style={styles.captionTitle}>{slide.title}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((slide, index) => (
          <View key={slide.id} style={[styles.dot, index === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    justifyContent: 'flex-end',
  },
  slideIconWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionWrap: {
    padding: 20,
  },
  captionPill: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    borderRadius: radius.input,
    backgroundColor: 'rgba(43, 36, 32, 0.55)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  captionKicker: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
    letterSpacing: 1,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  captionTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.background,
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.accent,
  },
});
