/**
 * Event timing utilities ensuring consistent formatting across all pages
 * All times use Asia/Kolkata timezone
 */

const EVENT_TIMEZONE = 'Asia/Kolkata';

/**
 * Convert a date value to epoch timestamp (milliseconds)
 */
export function toEpoch(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

/**
 * Format a date in IST as dd/mm/yyyy
 */
export function formatEventDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', {
    timeZone: EVENT_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Get date components in IST timezone
 */
function getDateComponentsInTimezone(date: Date): { date: number; month: number; year: number } {
  const istDateStr = date.toLocaleDateString('en-GB', {
    timeZone: EVENT_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const [day, month, year] = istDateStr.split('/').map(Number);
  return { date: day, month, year };
}

/**
 * Format event time range, handling both same-day and multi-day events
 * Returns time range in IST
 */
export function formatEventTime(
  startValue: Date | string | null | undefined,
  endValue: Date | string | null | undefined
): string | null {
  if (!startValue) return null;
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return null;

  const startLabel = start.toLocaleTimeString('en-US', {
    timeZone: EVENT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (!endValue) return startLabel;

  const end = new Date(endValue);
  if (Number.isNaN(end.getTime())) return startLabel;

  // Compare dates in IST timezone
  const startComponents = getDateComponentsInTimezone(start);
  const endComponents = getDateComponentsInTimezone(end);

  // If same day in IST, show only time range
  if (
    startComponents.date === endComponents.date &&
    startComponents.month === endComponents.month &&
    startComponents.year === endComponents.year
  ) {
    const endLabel = end.toLocaleTimeString('en-US', {
      timeZone: EVENT_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${startLabel} - ${endLabel}`;
  }

  // If different days, show both dates and times
  const startDateStr = start.toLocaleDateString('en-GB', {
    timeZone: EVENT_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const endDateStr = end.toLocaleDateString('en-GB', {
    timeZone: EVENT_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const endLabel = end.toLocaleTimeString('en-US', {
    timeZone: EVENT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${startLabel}, ${startDateStr} - ${endLabel}, ${endDateStr}`;
}

/**
 * Format event date and time for admin display
 */
export function formatEventDateTime(value: string | null | undefined): string {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleString('en-IN', {
    timeZone: EVENT_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format time range from Date objects in IST
 * Used by event-store when formatting event times
 */
export function formatTimeRangeFromDates(startDate: Date, endDate: Date): string {
  return formatEventTime(startDate.toISOString(), endDate.toISOString()) || '';
}
