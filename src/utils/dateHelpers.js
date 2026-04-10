export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(d, locale = 'ar-SA') {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString(locale); } catch(e) { return d; }
}

export function formatDateAr(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' }); } catch(e) { return d; }
}

export function calcAge(dob) {
  if (!dob) return '—';
  const b = new Date(dob), n = new Date();
  let y = n.getFullYear() - b.getFullYear();
  let m = n.getMonth() - b.getMonth();
  if (m < 0) { y--; m += 12; }
  if (y === 0) return m + ' شهر';
  if (m === 0) return y + ' سنة';
  return y + ' سنة و' + m + ' شهر';
}

export function calcDays(from, to) {
  if (!from || !to) return 0;
  const a = new Date(from), b = new Date(to);
  return Math.max(0, Math.round((b - a) / 864e5) + 1);
}

export function monthLabel(date) {
  return date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function nowTimeStr() {
  const n = new Date();
  return n.getHours().toString().padStart(2,'0') + ':' + n.getMinutes().toString().padStart(2,'0');
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
