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
