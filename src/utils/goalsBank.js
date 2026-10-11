/**
 * Easy Center — Goals Bank v2
 * البنية الموسّعة: 6 برامج × 10 مجالات + كود مرجعي + معيار إتقان + أدوات + نطاق عمري
 */

export const PROGRAMS = [
  { key: 'teacch', label: 'تيتش (TEACCH / PEP)', color: '#0284c7', labelEn: 'TEACCH' },
  { key: 'custom', label: 'مخصص المركز', color: '#d97706', labelEn: 'Custom' },
];

export const DOMAINS = [
  { key: 'infant', label: 'نمو الرضيع' },
  { key: 'cognitive', label: 'المجال المعرفي' },
  { key: 'language', label: 'المجال اللغوي والتواصلي' },
  { key: 'receptive_language', label: 'لغة استقبالية' },
  { key: 'expressive_communication', label: 'تواصل تعبيري' },
  { key: 'social', label: 'المجال الاجتماعي والتنشئة' },
  { key: 'motor', label: 'المجال الحركي (عام)' },
  { key: 'gross_motor', label: 'حركي كبير' },
  { key: 'fine_motor', label: 'حركي دقيق' },
  { key: 'selfhelp', label: 'مجال رعاية الذات' },
  { key: 'pre_academic', label: 'ما قبل الأكاديمي' },
  { key: 'academic', label: 'أكاديمي' },
  { key: 'independence', label: 'استقلالية' },
  // TEACCH (Structured Teaching / PEP) 10 Domains
  { key: 'teacch_imitation', label: '1. التقليد والمحاكاة (Imitation)' },
  { key: 'teacch_perception', label: '2. الإدراك الحسي والبصري (Perception)' },
  { key: 'teacch_gross_motor', label: '3. الحركة العامة والتوازن (Gross Motor)' },
  { key: 'teacch_fine_motor', label: '4. الحركة الدقيقة والتناول (Fine Motor)' },
  { key: 'teacch_eye_hand', label: '5. التنسيق بين العين واليد (Eye-Hand)' },
  { key: 'teacch_cognitive', label: '6. الأداء والإدراك المعرفي (Cognitive)' },
  { key: 'teacch_language', label: '7. الكفاءة والمهارات اللغوية (Language)' },
  { key: 'teacch_selfhelp', label: '8. الاستقلالية والرعاية الذاتية (Self-Help)' },
  { key: 'teacch_social', label: '9. التآلف والتفاعل الاجتماعي (Social)' },
  { key: 'teacch_behavior', label: '10. إدارة وتعديل السلوك والتعليم المنظم (Behavior)' },
];

export const AGE_RANGES = [
  'الرضيع (0-4 أشهر)', '0-1 سنة', '1-2 سنة', '2-3 سنوات',
  '3-4 سنوات', '4-5 سنوات', '5-6 سنوات', '+6 سنوات',
];

export const PROGRAM_DOMAINS = {
  teacch: [
    'teacch_imitation',
    'teacch_perception',
    'teacch_gross_motor',
    'teacch_fine_motor',
    'teacch_eye_hand',
    'teacch_cognitive',
    'teacch_language',
    'teacch_selfhelp',
    'teacch_social',
    'teacch_behavior',
  ],
  custom: DOMAINS.map(d => d.key),
};

export function domainsForProgram(programKey) {
  const keys = PROGRAM_DOMAINS[programKey] || DOMAINS.map(d => d.key);
  return DOMAINS.filter(d => keys.includes(d.key));
}

export function programLabel(key) { return PROGRAMS.find(p => p.key === key)?.label || key; }
export function programColor(key) { return PROGRAMS.find(p => p.key === key)?.color || '#64748b'; }
export function domainLabel(key) { return DOMAINS.find(d => d.key === key)?.label || key; }

// بذور أولية من تأليفنا — يضيف المركز أهدافه الخاصة عبر «مخصص المركز»
export const SEED_GOALS = [





  // مخصص
  { program:'custom', domain:'social', code:'', text:'استخدام بطاقة "أريد استراحة" بدل الصراخ', mastery:'أسبوع متتالي', tools:'بطاقة مصورة', ageRange:'3-4 سنوات' },
];
