/**
 * بنك أهداف البرامج طويلة المدى — بنك أوّلي معياري ومرن.
 * يدعم البرامج Portage / Lovaas / ABLLS-R / PEP-3 / HELP / Custom.
 */

export const PROGRAMS = [
  { key: 'portage', label: 'بورتاج Portage', color: '#059669' },
  { key: 'lovaas', label: 'لوفاس Lovaas', color: '#1a56db' },
  { key: 'ablls', label: 'إيبلز ABLLS-R', color: '#7c3aed' },
  { key: 'pep3', label: 'بيب-3 PEP-3', color: '#db2777' },
  { key: 'help', label: 'هيلب HELP', color: '#0891b2' },
  { key: 'custom', label: 'مخصص المركز', color: '#d97706' },
];

export const DOMAINS = [
  { key: 'cognitive', label: 'المعرفي' },
  { key: 'language_receptive', label: 'اللغوي والاستقبالي' },
  { key: 'expressive_communication', label: 'التواصل التعبيري' },
  { key: 'social_interaction', label: 'التفاعل الاجتماعي' },
  { key: 'gross_motor', label: 'الحركي الكبير' },
  { key: 'fine_motor', label: 'الحركي الدقيق' },
  { key: 'self_care', label: 'العناية الذاتية' },
  { key: 'pre_academic', label: 'مهارات ما قبل الأكاديمي' },
  { key: 'academic', label: 'الأكاديمي' },
  { key: 'independence', label: 'المهارات الاستقلالية' },
];

export const PROGRAM_DOMAINS = {
  portage: ['cognitive', 'language_receptive', 'expressive_communication', 'social_interaction', 'gross_motor', 'fine_motor', 'self_care', 'pre_academic', 'academic', 'independence'],
  lovaas: ['cognitive', 'language_receptive', 'expressive_communication', 'social_interaction', 'gross_motor', 'fine_motor', 'self_care', 'pre_academic', 'academic', 'independence'],
  ablls: ['cognitive', 'language_receptive', 'expressive_communication', 'social_interaction', 'gross_motor', 'fine_motor', 'self_care', 'pre_academic', 'academic', 'independence'],
  pep3: ['cognitive', 'language_receptive', 'expressive_communication', 'social_interaction', 'gross_motor', 'fine_motor', 'self_care', 'pre_academic', 'academic', 'independence'],
  help: ['cognitive', 'language_receptive', 'expressive_communication', 'social_interaction', 'gross_motor', 'fine_motor', 'self_care', 'pre_academic', 'academic', 'independence'],
  custom: DOMAINS.map(d => d.key),
};

export function domainsForProgram(programKey) {
  const keys = PROGRAM_DOMAINS[programKey] || DOMAINS.map(d => d.key);
  return DOMAINS.filter(d => keys.includes(d.key));
}

export function programLabel(key) { return PROGRAMS.find(p => p.key === key)?.label || key; }
export function programColor(key) { return PROGRAMS.find(p => p.key === key)?.color || '#64748b'; }
export function domainLabel(key) { return DOMAINS.find(d => d.key === key)?.label || key; }

export const SEED_GOALS = [
  { program: 'portage', domain: 'social_interaction', text: 'يستجيب للعرض البصري عند نداء اسمه' },
  { program: 'portage', domain: 'expressive_communication', text: 'يستخدم إشارة واضحة أو كلمة بسيطة لطلب شيء مفضّل' },
  { program: 'portage', domain: 'fine_motor', text: 'يمسك أداة كتابة مناسبة ويؤدي حركة خربشة أساسية' },
  { program: 'lovaas', domain: 'language_receptive', text: 'يتبع تعليمة من خطوة واحدة (تعال / اجلس / أعط)' },
  { program: 'ablls', domain: 'pre_academic', text: 'يُطابق الرقمي والتسلسل البصري الأساسي' },
  { program: 'pep3', domain: 'academic', text: 'يحدد الشكل أو العدد أو المجموعة المناسبة وفق نمط مختار' },
  { program: 'help', domain: 'self_care', text: 'يُكمل خطوات العناية الشخصية ضمن تسلسل بصري' },
  { program: 'custom', domain: 'independence', text: 'يستخدم أداة مساعدة أو مخطط بصري لإكمال مهمة مستقلة' },
];
