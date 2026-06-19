import { ROLES } from './constants';
import { canSeeTab } from './permissions';

const PERM_LABELS = {
  dash: 'الرئيسية',
  students: 'الطلاب',
  hr: 'الموظفون',
  finance: 'المالية',
  reports: 'التقارير',
  settings: 'الإعدادات',
  docs: 'الوثائق',
  parents: 'أولياء الأمور',
  partnerships: 'الشراكات',
  visits: 'الزيارات',
  calendar: 'التقويم',
  programs: 'البرامج',
  sessions: 'الجلسات',
  attendance: 'الحضور',
  center: 'المركز',
  'prog-reports': 'البرامج والتقارير',
  statistics: 'الإحصائيات',
  backup: 'النسخ الاحتياطي',
};

const TAB_ORDER = [
  'dash', 'calendar', 'attendance', 'students', 'hr', 'programs', 'prog-reports',
  'statistics', 'center', 'settings',
];

export function getRoleLabel(role) {
  return ROLES[role] || role || '—';
}

export function getUserPermissionLabels(user) {
  if (!user) return [];
  if (user.role === 'manager') return ['صلاحيات كاملة'];

  const custom = Object.entries(user.permissions || {})
    .filter(([, v]) => v)
    .map(([k]) => PERM_LABELS[k] || k);
  if (custom.length) return custom;

  return TAB_ORDER
    .filter(tab => canSeeTab(user.role, tab))
    .map(tab => PERM_LABELS[tab] || tab);
}

export function getCurrentUsername(user) {
  if (!user) return '—';
  return user.username || user.email || user.uid || '—';
}
