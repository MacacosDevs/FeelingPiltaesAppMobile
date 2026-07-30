export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
export const WEEKDAY_FULL = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
] as const;
export const WEEKDAY_LABELS_SUNDAY_FIRST = ['D', 'L', 'M', 'X', 'J', 'V', 'S'] as const;
export const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Índice de día de semana con lunes como primer día (0 = lunes ... 6 = domingo).
export function weekdayIndexMondayFirst(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function mondayOf(date: Date): Date {
  return addDays(startOfDay(date), -weekdayIndexMondayFirst(date));
}

export function startOfWeekSunday(date: Date): Date {
  const start = startOfDay(date);
  return addDays(start, -start.getDay());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatFullDate(date: Date): string {
  const weekday = capitalize(WEEKDAY_FULL[weekdayIndexMondayFirst(date)]);
  const month = MONTH_LABELS[date.getMonth()].toLowerCase();
  return `${weekday} ${date.getDate()} de ${month}`;
}

export function formatMonthYear(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatMonthYearLong(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()]} de ${date.getFullYear()}`;
}

export function formatShortDate(date: Date): string {
  const month = MONTH_LABELS[date.getMonth()].slice(0, 3).toLowerCase();
  return `${date.getDate()} ${month}`;
}

export function formatDayMonth(date: Date): string {
  return `${date.getDate()} de ${MONTH_LABELS[date.getMonth()].toLowerCase()}`;
}

// Convierte una hora tipo "8:00 am" / "11:30 pm" a { hours, minutes } en
// formato 24 horas.
export function parseHora(hora: string): { hours: number; minutes: number } {
  const match = hora.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return { hours: 0, minutes: 0 };
  let hours = parseInt(match[1], 10) % 12;
  if (match[3].toLowerCase() === 'pm') hours += 12;
  return { hours, minutes: parseInt(match[2], 10) };
}

// Combina una fecha (solo día) con una hora tipo "8:00 am" en un único Date.
export function combineDateAndHora(fecha: Date, hora: string): Date {
  const { hours, minutes } = parseHora(hora);
  const result = new Date(fecha);
  result.setHours(hours, minutes, 0, 0);
  return result;
}
