export const ROLES = {
  specialist: 'أخصائي (عام)',
  specialist_speech: 'أخصائي تخاطب ونطق',
  specialist_physio: 'أخصائي علاج فيزيائي',
  specialist_behavior: 'أخصائي تعديل سلوك',
  specialist_occupational: 'أخصائي علاج وظيفي',
  reception: 'استقبال',
  admin: 'إداري',
  worker: 'عمال',
  other: 'أخرى',
  manager: 'مدير',
  vice: 'نائب المدير',
  technician: 'فني النظام',
  parent: 'ولي أمر',
  speech: 'أخصائي تخاطب',
  physio: 'معالج فيزيائي',
  occ: 'معالج وظيفي',
  behavior: 'أخصائي سلوك',
  psych: 'أخصائي نفسي',
  driver: 'سائق',
};

export const SPECIALIST_ROLES = [
  'specialist','specialist_speech','specialist_physio',
  'specialist_behavior','specialist_occupational','speech','physio','occ','behavior','psych'
];

export const DIAGNOSES = [
  'توحد','متلازمة داون','تأخر نمائي','اضطراب نطق',
  'إعاقة ذهنية','فرط حركة وتشتت انتباه','إعاقة حركية','أخرى'
];

export const SESSION_TYPES = [
  'تخاطب ونطق','تعديل سلوك','علاج فيزيائي','علاج وظيفي',
  'تكامل حسي','تعليمي وتربوي','مهارات اجتماعية'
];

export const COLORS = [
  { value: '#1a56db', label: 'أزرق' },
  { value: '#7c3aed', label: 'بنفسجي' },
  { value: '#059669', label: 'أخضر' },
  { value: '#dc2626', label: 'أحمر' },
  { value: '#d97706', label: 'ذهبي' },
  { value: '#0891b2', label: 'سماوي' },
  { value: '#db2777', label: 'وردي' },
  { value: '#0f172a', label: 'داكن' },
];

export const NAV_ITEMS = [
  { id: 'dash', label: '📊 الرئيسية', roles: null },
  { id: 'calendar', label: '🗓️ التقويم', roles: null },
  { id: 'attendance', label: '📅 الحضور السريع', roles: null },
  { id: 'hr', label: '👥 الموظفون', roles: ['manager','vice','admin'] },
  { id: 'students', label: '👦 الطلاب', roles: null },
  { id: 'programs', label: '🎯 الأنشطة', roles: null },
  { id: 'reports', label: '📊 التقارير', roles: ['manager','vice','specialist','specialist_speech','specialist_physio','specialist_behavior','specialist_occupational'] },
  { id: 'center', label: '🏢 إدارة المركز', roles: ['manager','vice'] },
  { id: 'settings', label: '⚙️ الإعدادات', roles: ['manager','vice','technician'] },
];

export const CFG_KEY = 'scs_v2_config';
export const PFX = () => {
  try {
    const saved = localStorage.getItem(CFG_KEY);
    if (saved) { const c = JSON.parse(saved); return (c.center?.projectId || 'local') + '_'; }
  } catch(e) {}
  return 'local_';
};
