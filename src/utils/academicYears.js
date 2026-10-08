import { lsGet, lsSet } from '../hooks/useStorage';
import { uid } from './dateHelpers';

export const DEFAULT_ACADEMIC_YEARS = [
  {
    id: 'ay_2024_2025',
    name: '2024 / 2025',
    code: '2024-2025',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    isCurrent: false,
    status: 'completed',
    terms: ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث']
  },
  {
    id: 'ay_2025_2026',
    name: '2025 / 2026',
    code: '2025-2026',
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    isCurrent: true,
    status: 'active',
    terms: ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث']
  },
  {
    id: 'ay_2026_2027',
    name: '2026 / 2027',
    code: '2026-2027',
    startDate: '2026-09-01',
    endDate: '2027-06-30',
    isCurrent: false,
    status: 'upcoming',
    terms: ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث']
  }
];

export function getCalendarConfig() {
  const cfg = lsGet('centerCalendarConfig');
  if (cfg && cfg.mode) return cfg;
  return {
    mode: 'flexible', // 'continuous' | 'academic' | 'flexible'
    activeYearId: 'ay_2025_2026',
    allowMultiYearPlans: true
  };
}

export function saveCalendarConfig(cfg) {
  lsSet('centerCalendarConfig', cfg);
}

export function getAcademicYears() {
  const list = lsGet('academicYears');
  if (Array.isArray(list) && list.length > 0) return list;
  // Initialize default
  lsSet('academicYears', DEFAULT_ACADEMIC_YEARS);
  return DEFAULT_ACADEMIC_YEARS;
}

export function saveAcademicYears(years) {
  lsSet('academicYears', years);
}

export function getCurrentAcademicYear() {
  const years = getAcademicYears();
  const cfg = getCalendarConfig();
  const found = years.find(y => y.id === cfg.activeYearId) || years.find(y => y.isCurrent) || years[0];
  return found;
}

export function setCurrentAcademicYear(yearId) {
  const years = getAcademicYears().map(y => ({
    ...y,
    isCurrent: y.id === yearId,
    status: y.id === yearId ? 'active' : y.status
  }));
  saveAcademicYears(years);
  const cfg = getCalendarConfig();
  saveCalendarConfig({ ...cfg, activeYearId: yearId });
}

/**
 * حساب العام الأكاديمي تلقائياً من التاريخ
 * الشهور (9 إلى 12) تمثل بداية العام الدراسي (مثلاً 2026-10 -> '2026 / 2027')
 * الشهور (1 إلى 8) تمثل استكمال العام الدراسي (مثلاً 2026-03 -> '2025 / 2026')
 */
export function getAcademicYearFromDate(dateStr) {
  if (!dateStr) return '';
  const dateOnly = String(dateStr).slice(0, 10);
  const years = getAcademicYears();
  // تطابق مع تاريخ معتمد بالمركز إن وجد
  const matched = years.find(y => y.startDate && y.endDate && dateOnly >= y.startDate && dateOnly <= y.endDate);
  if (matched) return matched.name;

  const d = new Date(dateOnly + 'T12:00:00');
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = d.getMonth() + 1; // 1-12
  const startY = m >= 9 ? y : y - 1;
  const endY = startY + 1;
  return `${startY} / ${endY}`;
}

/**
 * فحص ذكي للفعالية: هل تنتمي للسنة الحالية؟
 * يدعم كلاً من نظام السنة التقويمية (2026) ونظام العام الأكاديمي (2025 / 2026 أو 2026 / 2027 أو العام النشط)
 */
export function isEventInCurrentPeriod(evt, academicYearsList = []) {
  if (!evt) return false;
  const now = new Date();
  const curCalYear = now.getFullYear();
  const curCalYearStr = String(curCalYear);
  const curAcadYearStr = getAcademicYearFromDate(now.toISOString().split('T')[0]);

  const activeYearObj = (academicYearsList.length > 0 ? academicYearsList : getAcademicYears()).find(y => y.isCurrent);
  const activeYearName = activeYearObj?.name || '';
  const activeYearId = activeYearObj?.id || '';

  // 1) فحص تاريخ الفعالية
  if (evt.date) {
    const evtDateStr = String(evt.date).slice(0, 10);
    // تقع في نفس السنة التقويمية الحالية
    if (evtDateStr.startsWith(curCalYearStr)) return true;
    // تقع ضمن العام الأكاديمي النشط المعتمد بالمركز
    if (activeYearObj?.startDate && activeYearObj?.endDate) {
      if (evtDateStr >= activeYearObj.startDate && evtDateStr <= activeYearObj.endDate) {
        return true;
      }
    }
  }

  // 2) فحص العام الأكاديمي المسجل
  const evtYr = String(evt.academicYear || '').trim();
  if (evtYr) {
    if (evtYr === curCalYearStr) return true;
    if (evtYr === curAcadYearStr) return true;
    if (activeYearName && evtYr === activeYearName) return true;
    if (activeYearId && evt.academicYearId === activeYearId) return true;
    if (evtYr.includes(curCalYearStr)) return true;
  }

  // إذا لم يُحدد تاريخ ولا عام، نعتبرها تابعة للسنة الحالية تجنباً لإخفائها
  if (!evt.date && !evtYr) return true;

  return false;
}

/**
 * فحص الفعالية: هل تنتمي للسنة الماضية؟
 */
export function isEventInPastPeriod(evt, academicYearsList = []) {
  if (!evt) return false;
  // إذا كانت تنتمي للسنة الحالية، نستبعدها من الماضية
  if (isEventInCurrentPeriod(evt, academicYearsList)) return false;

  const now = new Date();
  const curCalYear = now.getFullYear();
  const pastCalYear = curCalYear - 1;
  const pastCalYearStr = String(pastCalYear);

  if (evt.date) {
    const evtDateStr = String(evt.date).slice(0, 10);
    if (evtDateStr.startsWith(pastCalYearStr)) return true;
  }

  const evtYr = String(evt.academicYear || '').trim();
  if (evtYr) {
    if (evtYr === pastCalYearStr) return true;
    if (evtYr.includes(pastCalYearStr)) return true;
  }

  return false;
}
