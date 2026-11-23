export { inr } from '@/config/forge';

const utc = (day: string) => new Date(`${day}T00:00:00Z`);

/** "12 Oct 2026" from a YYYY-MM-DD day string. */
export const prettyDay = (day?: string | null) =>
  day ? utc(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—';

/** "12 Oct" */
export const shortDay = (day: string) => utc(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** "Oct" from "2026-10" */
export const monthLabel = (month: string) => utc(`${month}-01`).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });

export const stamp = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** "in 3 days", "today", "2 days ago" */
export function relDays(daysLeft: number) {
  if (daysLeft === 0) return 'today';
  return daysLeft > 0 ? `in ${plural(daysLeft, 'day')}` : `${plural(-daysLeft, 'day')} ago`;
}

export const dayDiff = (from: string, to: string) => Math.round((utc(to).getTime() - utc(from).getTime()) / 864e5);

export const time12 = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
