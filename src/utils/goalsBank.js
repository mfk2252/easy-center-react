/**
 * Easy Center — Goals Bank v2
 * البنية الموسّعة: 6 برامج × 10 مجالات + كود مرجعي + معيار إتقان + أدوات + نطاق عمري
 */

export const PROGRAMS = [
  { key: 'lovaas', label: 'لوفاس (ABA)', color: '#1a56db', labelEn: 'Lovaas' },
  { key: 'portage', label: 'بورتاج', color: '#059669', labelEn: 'Portage' },
  { key: 'ablls', label: 'إيبلز (ABLLS-R)', color: '#7c3aed', labelEn: 'ABLLS-R' },
  { key: 'pep3', label: 'بيب 3 (PEP-3)', color: '#0891b2', labelEn: 'PEP-3' },
  { key: 'help', label: 'هيلب (HELP)', color: '#db2777', labelEn: 'HELP' },
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
  // ABLLS-R 25 Domains
  { key: 'ablls_a', label: '[A] التعاون وفاعلية المعزز' },
  { key: 'ablls_b', label: '[B] الأداء البصري' },
  { key: 'ablls_c', label: '[C] اللغة الاستقبالية' },
  { key: 'ablls_d', label: '[D] التقليد الحركي' },
  { key: 'ablls_e', label: '[E] التقليد اللفظي' },
  { key: 'ablls_f', label: '[F] الطلب (Mands)' },
  { key: 'ablls_g', label: '[G] التسمية (Tacts)' },
  { key: 'ablls_h', label: '[H] استخدام الألفاظ (Intraverbals)' },
  { key: 'ablls_i', label: '[I] النطق التلقائي' },
  { key: 'ablls_j', label: '[J] التراكيب اللغوية والنحوية' },
  { key: 'ablls_k', label: '[K] مهارات اللعب ووقت الفراغ' },
  { key: 'ablls_l', label: '[L] التفاعل والتواصل الاجتماعي' },
  { key: 'ablls_m', label: '[M] إتباع التعليمات والتفاعل ضمن مجموعة' },
  { key: 'ablls_n', label: '[N] الروتين والنظام داخل الفصل' },
  { key: 'ablls_p', label: '[P] تعميم الاستجابات' },
  { key: 'ablls_q', label: '[Q] مهارات القراءة' },
  { key: 'ablls_r', label: '[R] مهارات الحساب والرياضيات' },
  { key: 'ablls_s', label: '[S] مهارات الكتابة والنسخ' },
  { key: 'ablls_t', label: '[T] مهارات الهجاء' },
  { key: 'ablls_u', label: '[U] مهارات ارتداء وخلع الملابس' },
  { key: 'ablls_v', label: '[V] مهارات تناول الطعام' },
  { key: 'ablls_w', label: '[W] الهندام ورعاية الذات' },
  { key: 'ablls_x', label: '[X] دخول الحمام والتواليت' },
  { key: 'ablls_y', label: '[Y] مهارات الحركية الكبرى' },
  { key: 'ablls_z', label: '[Z] مهارات الحركية الصغرى' },
];

export const AGE_RANGES = [
  'الرضيع (0-4 أشهر)', '0-1 سنة', '1-2 سنة', '2-3 سنوات',
  '3-4 سنوات', '4-5 سنوات', '5-6 سنوات', '+6 سنوات',
];

export const PROGRAM_DOMAINS = {
  portage: ['infant', 'motor', 'cognitive', 'language', 'social', 'selfhelp'],
  lovaas: ['cognitive', 'receptive_language', 'expressive_communication', 'social', 'gross_motor', 'fine_motor', 'selfhelp', 'independence'],
  ablls: [
    'ablls_a', 'ablls_b', 'ablls_c', 'ablls_d', 'ablls_e',
    'ablls_f', 'ablls_g', 'ablls_h', 'ablls_i', 'ablls_j',
    'ablls_k', 'ablls_l', 'ablls_m', 'ablls_n', 'ablls_p',
    'ablls_q', 'ablls_r', 'ablls_s', 'ablls_t', 'ablls_u',
    'ablls_v', 'ablls_w', 'ablls_x', 'ablls_y', 'ablls_z',
  ],
  pep3: ['cognitive', 'expressive_communication', 'receptive_language', 'fine_motor', 'gross_motor', 'social', 'selfhelp', 'pre_academic'],
  help: ['infant', 'cognitive', 'receptive_language', 'expressive_communication', 'gross_motor', 'fine_motor', 'social', 'selfhelp', 'independence'],
  custom: DOMAINS.map(d => d.key),
};

export function domainsForProgram(programKey) {
  const keys = PROGRAM_DOMAINS[programKey] || DOMAINS.map(d => d.key);
  return DOMAINS.filter(d => keys.includes(d.key));
}

export function programLabel(key) { return PROGRAMS.find(p => p.key === key)?.label || key; }
export function programColor(key) { return PROGRAMS.find(p => p.key === key)?.color || '#64748b'; }
export function domainLabel(key) { return DOMAINS.find(d => d.key === key)?.label || key; }

// بذور أولية موسّعة — عدّلها/أثرِها من دليلكم الرسمي المرخّص
export const SEED_GOALS = [
  // لوفاس
  { program:'lovaas', domain:'social', code:'L-S01', text:'التواصل البصري عند مناداته باسمه', mastery:'4/5 عشوائي', tools:'لا يحتاج', ageRange:'1-2 سنة' },
  { program:'lovaas', domain:'receptive_language', code:'L-RL01', text:'يتبع تعليمة أحادية الخطوة بدون تلقين', mastery:'4/5 عشوائي', tools:'أشياء يومية', ageRange:'1-2 سنة' },
  { program:'lovaas', domain:'cognitive', code:'L-C01', text:'تصنيف الأشياء حسب اللون', mastery:'4/5 عشوائي', tools:'مكعبات ملونة', ageRange:'2-3 سنوات' },
  { program:'lovaas', domain:'gross_motor', code:'L-GM01', text:'تقليد حركة جسدية بسيطة عند الطلب', mastery:'3/3 متتالية', tools:'لا يحتاج', ageRange:'1-2 سنة' },
  { program:'lovaas', domain:'selfhelp', code:'L-SH01', text:'الجلوس على الطاولة أثناء الوجبة 5 دقائق', mastery:'3 أيام متتالية', tools:'طاولة وكرسي', ageRange:'2-3 سنوات' },

  // بورتاج
  { program:'portage', domain:'social', code:'P-S01', text:'اللعب بجانب طفل آخر دون تدخل', mastery:'دقيقتان متتاليتان', tools:'ألعاب مشتركة', ageRange:'2-3 سنوات' },
  { program:'portage', domain:'receptive_language', code:'P-RL01', text:'اتباع تعليمة من خطوة واحدة (تعال، اجلس)', mastery:'4/5 عشوائي', tools:'بيئة طبيعية', ageRange:'1-2 سنة' },
  { program:'portage', domain:'fine_motor', code:'P-FM01', text:'الإمساك بقلم سميك والخربشة على ورقة', mastery:'3 جلسات متتالية', tools:'قلم سميك، ورق', ageRange:'1-2 سنة' },
  { program:'portage', domain:'gross_motor', code:'P-GM01', text:'صعود الدرج بمساعدة يدوية', mastery:'3 محاولات ناجحة', tools:'درج آمن', ageRange:'1-2 سنة' },
  { program:'portage', domain:'pre_academic', code:'P-PA01', text:'مطابقة صورة مع صورة مماثلة', mastery:'4/5 عشوائي', tools:'بطاقات مطابقة', ageRange:'2-3 سنوات' },

  // إيبلز
  { program:'ablls', domain:'receptive_language', code:'ABLLS:C14', text:'يتبع تعليمة ثنائية الخطوات بدون تلقين بصري', mastery:'4/5 عشوائي', tools:'أشياء يومية', ageRange:'2-3 سنوات' },
  { program:'ablls', domain:'expressive_communication', code:'ABLLS:D08', text:'طلب شيء مفضّل بكلمة واحدة أو صورة', mastery:'4/5 عشوائي', tools:'بطاقات PECS', ageRange:'1-2 سنة' },
  { program:'ablls', domain:'cognitive', code:'ABLLS:G04', text:'مطابقة الأشكال الهندسية الأربعة الأساسية', mastery:'5/5 عشوائي', tools:'أشكال خشبية', ageRange:'2-3 سنوات' },
  { program:'ablls', domain:'social', code:'ABLLS:R04', text:'المبادرة بالتحية عند دخول شخص مألوف', mastery:'3 أيام متتالية', tools:'بيئة طبيعية', ageRange:'2-3 سنوات' },

  // بيب-3
  { program:'pep3', domain:'cognitive', code:'PEP3:B12', text:'تكديس 6 مكعبات دون إسقاطها', mastery:'3/3 محاولات', tools:'مكعبات خشبية', ageRange:'2-3 سنوات' },
  { program:'pep3', domain:'fine_motor', code:'PEP3:A05', text:'تحريك خرز على سلك منحني', mastery:'مكتمل في جلستين', tools:'لعبة خرز على سلك', ageRange:'2-3 سنوات' },

  // هيلب
  { program:'help', domain:'selfhelp', code:'HELP:SH03', text:'خلع الحذاء ووضعه في مكانه بمفرده', mastery:'3 أيام متتالية', tools:'حذاء بدون رباط', ageRange:'2-3 سنوات' },
  { program:'help', domain:'independence', code:'HELP:IN02', text:'غسل اليدين باتباع خطوات مصوّرة', mastery:'5 أيام متتالية', tools:'بطاقات تسلسل', ageRange:'3-4 سنوات' },

  // مخصص
  { program:'custom', domain:'social', code:'', text:'استخدام بطاقة "أريد استراحة" بدل الصراخ', mastery:'أسبوع متتالي', tools:'بطاقة مصورة', ageRange:'3-4 سنوات' },
];
