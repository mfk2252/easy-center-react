/**
 * بنك أهداف البرامج طويلة المدى — قابل للتوسعة بالكامل من داخل الواجهة.
 * البنود أدناه أمثلة بذرية عامة الصياغة (ليست منسوخة حرفياً من أي دليل مرخّص)
 * لتبدأ بها فوراً؛ يُنصح باستبدالها/إثرائها ببنود دليلكم الرسمي المرخّص.
 */

export const PROGRAMS = [
  { key: 'lovaas', label: 'لوفاس (ABA)', color: '#1a56db' },
  { key: 'portage', label: 'بورتاج', color: '#059669' },
  { key: 'ablls', label: 'إيبلز (ABLLS-R)', color: '#7c3aed' },
  { key: 'custom', label: 'مخصص المركز', color: '#d97706' },
];

export const DOMAINS = [
  { key: 'social', label: 'التواصل الاجتماعي والتفاعل' },
  { key: 'language', label: 'اللغة والتواصل' },
  { key: 'motor', label: 'المهارات الحركية' },
  { key: 'selfhelp', label: 'الاستقلالية والعناية الذاتية' },
  { key: 'cognitive', label: 'المهارات المعرفية والأكاديمية' },
  { key: 'play', label: 'مهارات اللعب' },
  { key: 'behavior', label: 'تعديل السلوك' },
];

/**
 * مجالات كل برنامج بحسب بنيته الخاصة فعلياً — تُستخدَم في نافذة
 * "إدارة بنك الأهداف" تحديداً، بحيث لا تظهر مجالات لا تخص البرنامج المختار.
 * "مخصص المركز" وحده يرى كل المجالات لأنه غير مقيَّد بمنهج واحد.
 */
export const PROGRAM_DOMAINS = {
  lovaas: ['social', 'language', 'motor', 'selfhelp', 'cognitive', 'behavior'],
  portage: ['social', 'language', 'motor', 'selfhelp', 'cognitive', 'play'],
  ablls: ['language', 'social', 'cognitive', 'selfhelp', 'motor'],
  custom: DOMAINS.map(d => d.key),
};

export function domainsForProgram(programKey) {
  const keys = PROGRAM_DOMAINS[programKey] || DOMAINS.map(d => d.key);
  return DOMAINS.filter(d => keys.includes(d.key));
}

export function programLabel(key) { return PROGRAMS.find(p => p.key === key)?.label || key; }
export function programColor(key) { return PROGRAMS.find(p => p.key === key)?.color || '#64748b'; }
export function domainLabel(key) { return DOMAINS.find(d => d.key === key)?.label || key; }

// بذور أولية — أمثلة عامة الصياغة فقط، عدّلها/أضف عليها من دليلكم الرسمي
export const SEED_GOALS = [
  { program: 'lovaas', domain: 'social', text: 'التواصل البصري عند مناداته باسمه' },
  { program: 'lovaas', domain: 'social', text: 'الجلوس المهدّأ لمدة دقيقة أثناء نشاط موجَّه' },
  { program: 'portage', domain: 'social', text: 'اللعب بجانب طفل آخر لمدة دقيقتين دون تدخل الكبير' },
  { program: 'portage', domain: 'social', text: 'تقليد تعبير وجه بسيط (ابتسامة/دهشة)' },
  { program: 'ablls', domain: 'social', text: 'المبادرة بالتحية عند دخول شخص مألوف' },

  { program: 'lovaas', domain: 'language', text: 'تقليد صوت/كلمة بسيطة عند النمذجة' },
  { program: 'ablls', domain: 'language', text: 'طلب شيء مفضّل بكلمة واحدة أو صورة' },
  { program: 'ablls', domain: 'language', text: 'تسمية 5 صور مألوفة عند عرضها' },
  { program: 'portage', domain: 'language', text: 'اتباع تعليمة من خطوة واحدة (تعال، اجلس)' },

  { program: 'portage', domain: 'motor', text: 'الإمساك بقلم سميك وخربشة على ورقة' },
  { program: 'portage', domain: 'motor', text: 'صعود الدرج بمساعدة يدوية' },
  { program: 'lovaas', domain: 'motor', text: 'تقليد حركة جسدية بسيطة عند الطلب (رفع اليد)' },

  { program: 'portage', domain: 'selfhelp', text: 'خلع الحذاء بمفرده' },
  { program: 'ablls', domain: 'selfhelp', text: 'غسل اليدين باتباع خطوات مصوّرة' },
  { program: 'lovaas', domain: 'selfhelp', text: 'الجلوس على الطاولة أثناء الوجبة لمدة 5 دقائق' },

  { program: 'ablls', domain: 'cognitive', text: 'مطابقة الأشكال المتماثلة' },
  { program: 'ablls', domain: 'cognitive', text: 'العدّ من 1 إلى 5 بالإشارة للأصابع' },
  { program: 'lovaas', domain: 'cognitive', text: 'تصنيف الأشياء حسب اللون (تمييز بسيط)' },

  { program: 'portage', domain: 'play', text: 'اللعب الوظيفي بلعبة واحدة (تحريك سيارة)' },
  { program: 'portage', domain: 'play', text: 'انتظار الدور في لعبة بسيطة مع مساعدة' },

  { program: 'lovaas', domain: 'behavior', text: 'الانتقال بين نشاطين دون احتجاج شديد' },
  { program: 'custom', domain: 'behavior', text: 'استخدام بطاقة "أريد استراحة" بدل الصراخ' },
];
