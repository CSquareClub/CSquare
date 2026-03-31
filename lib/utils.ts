// Timezone utilities
export const DEFAULT_TIMEZONE = typeof window !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

export function formatEventDate(value: Date | string | null | undefined, tz?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', {
    timeZone: tz || DEFAULT_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatEventTime(
  startValue: Date | string | null | undefined,
  endValue: Date | string | null | undefined,
  tz?: string
): string | null {
  if (!startValue) return null;
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return null;
  const startLabel = start.toLocaleTimeString('en-US', {
    timeZone: tz || DEFAULT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  if (!endValue) return startLabel;
  const end = new Date(endValue);
  if (Number.isNaN(end.getTime())) return startLabel;
  if (
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    const endLabel = end.toLocaleTimeString('en-US', {
      timeZone: tz || DEFAULT_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${startLabel} - ${endLabel}`;
  }
  const startDate = start.toLocaleDateString('en-GB', { timeZone: tz || DEFAULT_TIMEZONE, day: '2-digit', month: '2-digit', year: 'numeric' });
  const endDate = end.toLocaleDateString('en-GB', { timeZone: tz || DEFAULT_TIMEZONE, day: '2-digit', month: '2-digit', year: 'numeric' });
  const endLabel = end.toLocaleTimeString('en-US', {
    timeZone: tz || DEFAULT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${startLabel}, ${startDate} - ${endLabel}, ${endDate}`;
}

export function formatEventDateTime(value: string | null | undefined, tz?: string): string {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  const dateStr = date.toLocaleDateString('en-GB', {
    timeZone: tz || DEFAULT_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    timeZone: tz || DEFAULT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr}, ${timeStr}`;
}
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
