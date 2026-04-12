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

/** ISO date yyyy-mm-dd + n days */
export function addDays(isoDate, n) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export function daysFromToday(isoDate) {
  if (!isoDate) return null;
  const a = new Date(todayStr() + 'T12:00:00');
  const b = new Date(isoDate + 'T12:00:00');
  return Math.round((b - a) / 864e5);
}

/** Next calendar occurrence of month-day from dob (for birthday this/next year) */
export function nextAnnualOccurrenceDate(dobIso) {
  if (!dobIso || dobIso.length < 10) return null;
  const [, mm, dd] = dobIso.split('-').map(Number);
  if (!mm || !dd) return null;
  const now = new Date();
  const y = now.getFullYear();
  let t = new Date(y, mm - 1, dd);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (t < startOfToday) t = new Date(y + 1, mm - 1, dd);
  return t;
}

export function daysUntilDate(d) {
  if (!d) return null;
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  const b = new Date(d);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 864e5);
}

/** التاريخ الهجري (تقريبي عبر التقويم الإسلامي في المتصفح) */
export function formatHijriDate(d = new Date()) {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    try {
      return new Intl.DateTimeFormat('ar-SA', { calendar: 'islamic', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    } catch {
      return '';
    }
  }
}
