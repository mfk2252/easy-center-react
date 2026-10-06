/**
 * سجل التغييرات التي رفضها الخادم نهائياً (صلاحيات، حجم مستند كبير، بيانات غير صالحة).
 * هذه الأخطاء لا تُحلّ بإعادة المحاولة، لذلك نعرضها للمستخدم بدل ابتلاعها بصمت.
 */
const KEY = 'scs_sync_failures';
const MAX = 50;
const listeners = new Set();

// أخطاء مؤقتة: تستحق إعادة المحاولة لاحقاً
const TRANSIENT = new Set([
  'unavailable', 'deadline-exceeded', 'aborted', 'cancelled',
  'resource-exhausted', 'internal', 'unknown', 'unauthenticated',
]);

export function isTransientError(e) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const code = String(e?.code || '').replace('firestore/', '');
  if (code) return TRANSIENT.has(code);
  return /network|offline|timeout/i.test(String(e?.message || ''));
}

const COL_LABELS = {
  students: 'الطلاب', employees: 'الموظفون', sessions: 'الجلسات', appointments: 'المواعيد',
  attStu: 'حضور الطلاب', attEmp: 'حضور الموظفين', iepGoals: 'أهداف IEP', stuReports: 'تقارير الطلاب',
  studentFees: 'الرسوم', payments: 'الدفعات', salaries: 'الرواتب', income: 'الإيرادات',
  expenses: 'المصروفات', leaves: 'الإجازات', warnings: 'الإنذارات', centerActivities: 'الأنشطة',
};

function reasonFor(code, message) {
  if (code === 'permission-denied') return 'لا تملك صلاحية حفظ هذا السجل في السحابة';
  if (code === 'invalid-argument') {
    return /bytes|size|large|exceed/i.test(message || '')
      ? 'حجم السجل أكبر من الحد المسموح (غالباً صورة أو مرفق كبير)'
      : 'بيانات غير صالحة للحفظ';
  }
  if (code === 'local-quota') return 'ذاكرة المتصفح ممتلئة — لم يُحفظ هذا التغيير على هذا الجهاز';
  if (code === 'not-found') return 'السجل غير موجود في السحابة';
  return `تعذّر الحفظ في السحابة (${code || 'غير معروف'})`;
}

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; }
}
function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX))); } catch (_) {}
  const snapshot = read();
  listeners.forEach(fn => { try { fn(snapshot); } catch (_) {} });
}

export function recordSyncFailure(op, e) {
  const code = String(e?.code || '').replace('firestore/', '');
  const entry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
    col: op.col,
    colLabel: COL_LABELS[op.col] || op.col,
    docId: op.docId,
    type: op.type,
    code,
    reason: reasonFor(code, e?.message),
  };
  // نستبدل تكرار نفس السجل والخطأ بدل تراكمه
  const list = read().filter(f => !(f.col === entry.col && f.docId === entry.docId && f.code === entry.code));
  list.push(entry);
  write(list);
}

export function getSyncFailures() { return read(); }
export function clearSyncFailures() { write([]); }
export function onSyncFailuresChange(fn) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
