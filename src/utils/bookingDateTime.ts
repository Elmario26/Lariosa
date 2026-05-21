/** Start of today (local) for date picker minimum */
export function getTodayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Merge calendar date with clock time */
export function combineDateAndTime(datePart: Date, timePart: Date): Date {
  const combined = new Date(datePart);
  combined.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return combined;
}

export function formatDateLabel(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeLabel(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function formatDateForApi(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTimeForApi(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

/** Default: 1 hour from now, rounded to next 15 min */
export function getDefaultBookingDateTime(): { date: Date; time: Date } {
  const now = new Date();
  const next = new Date(now.getTime() + 60 * 60 * 1000);
  const minutes = next.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  next.setMinutes(rounded, 0, 0);
  if (rounded >= 60) {
    next.setHours(next.getHours() + 1);
    next.setMinutes(0, 0, 0);
  }
  const date = new Date(next);
  date.setHours(0, 0, 0, 0);
  const time = new Date(next);
  return { date, time };
}

export function parseRequestedDateTime(value: string): { date: Date; time: Date } {
  const [datePart, timePart] = value.split(' ');
  const [y, m, d] = (datePart || '').split('-').map(Number);
  const [hh, mm] = (timePart || '12:00:00').split(':').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  const time = new Date();
  time.setHours(hh || 12, mm || 0, 0, 0);
  return { date, time };
}

export function validateFutureBooking(datePart: Date, timePart: Date): string | null {
  const combined = combineDateAndTime(datePart, timePart);
  if (combined.getTime() <= Date.now()) {
    return 'Please choose a date and time in the future.';
  }
  return null;
}

/** Clamp time to now when selected day is today */
export function clampTimeIfToday(datePart: Date, timePart: Date): Date {
  const now = new Date();
  if (!isSameCalendarDay(datePart, now)) {
    return timePart;
  }
  const combined = combineDateAndTime(datePart, timePart);
  if (combined.getTime() <= now.getTime()) {
    const bumped = new Date(now);
    bumped.setMinutes(bumped.getMinutes() + 15, 0, 0);
    return bumped;
  }
  return timePart;
}
