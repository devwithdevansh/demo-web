export const inr = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const utc = (day: string) => new Date(`${day}T00:00:00Z`);

export const prettyDay = (day?: string | null) =>
  day ? utc(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—';

export const shortDay = (day: string) =>
  utc(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export const stamp = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export function relDays(daysLeft: number) {
  if (daysLeft === 0) return 'today';
  const n = Math.abs(daysLeft);
  const word = `${n} day${n === 1 ? '' : 's'}`;
  return daysLeft > 0 ? `in ${word}` : `${word} ago`;
}

export const time12 = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
