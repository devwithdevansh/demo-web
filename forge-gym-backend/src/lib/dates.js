// Membership dates are stored as plain YYYY-MM-DD day strings in the gym's
// local calendar, which keeps expiry maths free of timezone drift.
const TZ = 'Asia/Kolkata';
const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('en-IN', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const utc = (day) => new Date(`${day}T00:00:00Z`);

export const dayKey = (date = new Date()) => dayFmt.format(date);
export const timeLabel = (date) => timeFmt.format(date);
/** "12 Oct 2026" */
export const prettyDay = (day) => utc(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const weekdayOf =(day) => WEEKDAYS[utc(day).getUTCDay()];
export const dayDiff = (from, to) => Math.round((utc(to) - utc(from)) / 864e5);

export function shiftDay(day, n) {
  const d = utc(day);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function shiftMonths(day, n) {
  const [y, m, d] = day.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + n, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}

/** A point in time on the given local day, e.g. at('2026-10-04', '06:30'). */
export const at = (day, hhmm) => new Date(`${day}T${hhmm}:00+05:30`);

export function membershipStatus(expiryDate, today = dayKey()) {
  const daysLeft = dayDiff(today, expiryDate);
  return { daysLeft, status: daysLeft < 0 ? 'expired' : daysLeft <= 7 ? 'expiring' : 'active' };
}
