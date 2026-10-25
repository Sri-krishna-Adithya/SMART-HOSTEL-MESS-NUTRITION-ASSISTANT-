// Returns every date of a month as YYYY-MM-DD strings, given a 'YYYY-MM' value.
export function daysInMonth(monthStr) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthStr || '');
  const year = match ? Number(match[1]) : 0;
  const month = match ? Number(match[2]) : 0;
  if (!year || month < 1 || month > 12) throw new Error('Invalid month');
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, i) => `${monthStr}-${String(i + 1).padStart(2, '0')}`);
}
