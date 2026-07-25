import type { ComponentType } from 'react';
import { BoltIcon, HeartIcon, SparklesIcon } from 'react-native-heroicons/outline';
import { colors } from '../theme';

type ActivityMeta = {
  color: string;
  Icon: ComponentType<{ color?: string; size?: number }>;
};

export const ACTIVITY_META: Record<string, ActivityMeta> = {
  Reformer: { color: colors.accent, Icon: BoltIcon },
  'Barre Sculpt': { color: colors.gold, Icon: SparklesIcon },
  'Mat Pilates': { color: colors.spotsAvailable, Icon: HeartIcon },
};
