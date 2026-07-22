import { Platform } from 'react-native';

// Design uses "Inter Tight" (body) and "Playfair Display SC" (display) from
// Google Fonts. Those aren't bundled yet, so we fall back to the closest
// system fonts until the real font files are added to the project.
export const fontFamily = {
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: undefined }),
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
};

export const fontSize = {
  xs: 9,
  sm: 10,
  smMedium: 11,
  base: 12,
  md: 13,
  lg: 22,
  xl: 26,
};
