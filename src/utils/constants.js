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
  { id: 'attendance', label: '📅 تسجيل الحضور', roles: null },
  { id: 'hr', label: '👥 الموظفون', roles: ['manager','vice','admin'] },
  { id: 'students', label: '👦 الطلاب', roles: null },
  { id: 'programs', label: '🎯 الأنشطة', roles: null },
  { id: 'reports', label: '📊 التقارير', roles: ['manager','vice','specialist','specialist_speech','specialist_physio','specialist_behavior','specialist_occupational'] },
  { id: 'center', label: '🏢 إدارة المركز', roles: ['manager','vice'] },
  { id: 'settings', label: '⚙️ الإعدادات', roles: ['manager','vice','technician'] },
];

export const ARAB_CURRENCIES = [
  { code: 'EGP', name: 'الجنيه', country: 'مصر', symbol: 'EGP', label: 'الجنيه - مصر (EGP)' },
  { code: 'SAR', name: 'الريال', country: 'السعودية', symbol: 'SAR', label: 'الريال - السعودية (SAR)' },
  { code: 'AED', name: 'الدرهم', country: 'الإمارات', symbol: 'AED', label: 'الدرهم - الإمارات (AED)' },
  { code: 'KWD', name: 'الدينار', country: 'الكويت', symbol: 'KWD', label: 'الدينار - الكويت (KWD)' },
  { code: 'BHD', name: 'الدينار', country: 'البحرين', symbol: 'BHD', label: 'الدينار - البحرين (BHD)' },
  { code: 'QAR', name: 'الريال', country: 'قطر', symbol: 'QAR', label: 'الريال - قطر (QAR)' },
  { code: 'OMR', name: 'الريال', country: 'عمان', symbol: 'OMR', label: 'الريال - عمان (OMR)' },
  { code: 'JOD', name: 'الدينار', country: 'الأردن', symbol: 'JOD', label: 'الدينار - الأردن (JOD)' },
  { code: 'IQD', name: 'الدينار', country: 'العراق', symbol: 'IQD', label: 'الدينار - العراق (IQD)' },
  { code: 'MAD', name: 'الدرهم', country: 'المغرب', symbol: 'MAD', label: 'الدرهم - المغرب (MAD)' },
  { code: 'DZD', name: 'الدينار', country: 'الجزائر', symbol: 'DZD', label: 'الدينار - الجزائر (DZD)' },
  { code: 'TND', name: 'الدينار', country: 'تونس', symbol: 'TND', label: 'الدينار - تونس (TND)' },
  { code: 'LYD', name: 'الدينار', country: 'ليبيا', symbol: 'LYD', label: 'الدينار - ليبيا (LYD)' },
  { code: 'SDG', name: 'الجنيه', country: 'السودان', symbol: 'SDG', label: 'الجنيه - السودان (SDG)' },
  { code: 'LBP', name: 'الليرة', country: 'لبنان', symbol: 'LBP', label: 'الليرة - لبنان (LBP)' },
  { code: 'SYP', name: 'الليرة', country: 'سوريا', symbol: 'SYP', label: 'الليرة - سوريا (SYP)' },
  { code: 'YER', name: 'الريال', country: 'اليمن', symbol: 'YER', label: 'الريال - اليمن (YER)' },
  { code: 'ILS', name: 'الشيكل / الدينار', country: 'فلسطين', symbol: 'ILS / JOD', label: 'الشيكل / الدينار - فلسطين (ILS / JOD)' },
  { code: 'MRU', name: 'الأوقية', country: 'موريتانيا', symbol: 'MRU', label: 'الأوقية - موريتانيا (MRU)' },
  { code: 'SOS', name: 'الشلن', country: 'الصومال', symbol: 'SOS', label: 'الشلن - الصومال (SOS)' },
  { code: 'DJF', name: 'الفرنك', country: 'جيبوتي', symbol: 'DJF', label: 'الفرنك - جيبوتي (DJF)' },
  { code: 'KMF', name: 'الفرنك', country: 'جزر القمر', symbol: 'KMF', label: 'الفرنك - جزر القمر (KMF)' },
  { code: 'USD', name: 'الدولار', country: 'الولايات المتحدة / دولي', symbol: 'USD', label: 'الدولار - دولي (USD)' },
  { code: 'EUR', name: 'اليورو', country: 'الاتحاد الأوروبي', symbol: 'EUR', label: 'اليورو - أوروبا (EUR)' },
  { code: 'GBP', name: 'الجنيه الإسترليني', country: 'بريطانيا', symbol: 'GBP', label: 'الجنيه الإسترليني - بريطانيا (GBP)' },
];

export function getCurrencyLabel(code) {
  if (!code) return 'SAR';
  const found = ARAB_CURRENCIES.find(c => c.code === code || c.symbol === code);
  return found ? found.label : code;
}

export function getCurrencySymbol(code) {
  if (!code) return 'SAR';
  const found = ARAB_CURRENCIES.find(c => c.code === code || c.symbol === code);
  return found ? found.symbol : code;
}

export const CFG_KEY = 'scs_v2_config';
export const PFX = () => {
  try {
    const saved = localStorage.getItem(CFG_KEY);
    if (saved) { const c = JSON.parse(saved); return (c.center?.projectId || 'local') + '_'; }
  } catch(e) {}
  return 'local_';
};
