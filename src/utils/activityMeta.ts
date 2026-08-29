import type { ComponentType } from 'react';
import {
  BoltIcon,
  CogIcon,
  FireIcon,
  HeartIcon,
  Squares2X2Icon,
  SparklesIcon,
} from 'react-native-heroicons/outline';
import { colors } from '../theme';

type ActivityMeta = {
  color: string;
  Icon: ComponentType<{ color?: string; size?: number }>;
};

// Nombres reales del catálogo de tipo_actividad del backend (equipos de
// Pilates). 'Bacu Fit' se deja mapeado por si acaso, aunque hoy esa
// actividad todavía no existe en el catálogo real (sigue fuera de alcance).
export const ACTIVITY_META: Record<string, ActivityMeta> = {
  Reformer: { color: colors.accent, Icon: BoltIcon },
  Mat: { color: colors.spotsAvailable, Icon: HeartIcon },
  Cadillac: { color: colors.gold, Icon: SparklesIcon },
  Silla: { color: colors.accent, Icon: Squares2X2Icon },
  Barril: { color: colors.gold, Icon: FireIcon },
  Circuito: { color: colors.spotsAvailable, Icon: Squares2X2Icon },
  'Bacu Fit': { color: colors.bacuFit, Icon: CogIcon },
};
