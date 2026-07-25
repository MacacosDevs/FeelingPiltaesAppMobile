import { colors } from '../theme';

export function capacityColor(ocupados: number, capacidad: number): string {
  const ratio = ocupados / capacidad;
  if (ratio >= 1) return colors.error;
  if (ratio >= 0.75) return colors.gold;
  return colors.spotsAvailable;
}
