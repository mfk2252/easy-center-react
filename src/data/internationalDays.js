/**
 * دليل وقاعدة بيانات الأيام والمناسبات العالمية والتربوية
 * الخاصة بالتربية الخاصة، اضطرابات النمو، الإعاقات، والتأهيل
 */

export const INTERNATIONAL_DAYS = [
  // --- شهر يناير (1) ---
  {
    id: 'int_braille_day',
    name: 'اليوم العالمي لطريقة برايل',
    month: 1,
    day: 4,
    icon: '⠃⠗⠇',
    category: 'sensory',
    categoryLabel: '🤲 الإعاقات البصرية والحسية',
    objectives: 'إبراز أهمية لغة برايل كوسيلة اتصال أساسية للمكفوفين وضعاف البصر وتعزيز استقلاليتهم المعرفية وتدريب الكادر والطلاب عليها.',
    targetAudience: 'all',
    suggestedLocation: 'معمل الوسائل التعليمية والمكتبة بالمركز',
    badgeColor: 'b-bl',
  },
  {
    id: 'int_education_day',
    name: 'اليوم العالمي للتعليم',
    month: 1,
    day: 24,
    icon: '📚',
    category: 'education',
    categoryLabel: '🎓 التربية والتعليم والتمكين',
    objectives: 'التأكيد على الحق الشامل في التعليم المتكافئ والمناسب لجميع فئات التربية الخاصة واستعراض البرامج التربوية الفردية المتقدمة.',
    targetAudience: 'all',
    suggestedLocation: 'القاعة التعليمية الرئيسية بالمركز',
    badgeColor: 'b-gr',
  },

  // --- شهر فبراير (2) ---
  {
    id: 'int_epilepsy_day',
    name: 'اليوم العالمي للصرع',
    month: 2,
    day: 10,
    icon: '💜',
    category: 'health',
    categoryLabel: '🩺 الرعاية الصحية والإرشاد الطبي',
    objectives: 'نشر الوعي المجتمعي والطبي بنوبات الصرع وطرق الإسعافات الأولية السليمة وتصحيح المفاهيم الخاطئة لدى الأسر والكادر.',
    targetAudience: 'all',
    suggestedLocation: 'مسرح المركز / العيادة الطبية التأهيلية',
    badgeColor: 'b-pr',
  },
  {
    id: 'int_angelman_day',
    name: 'اليوم العالمي لمتلازمة أنجلمان',
    month: 2,
    day: 15,
    icon: '👼',
    category: 'developmental',
    categoryLabel: '🧩 الاضطرابات النمائية والجينية',
    objectives: 'التعريف بمتلازمة أنجلمان، واستراتيجيات التخاطب البديل والمعزز والتأهيل الحركي الوظيفي للمصابين بها.',
    targetAudience: 'special',
    suggestedLocation: 'قاعة العلاج الطبيعي والتخاطب',
    badgeColor: 'b-bl',
  },

  // --- شهر مارس (3) ---
  {
    id: 'int_hearing_day',
    name: 'اليوم العالمي للسمع ورعاية الأذن',
    month: 3,
    day: 3,
    icon: '👂',
    category: 'sensory',
    categoryLabel: '🤲 الإعاقات السمعية والحسية',
    objectives: 'أهمية الكشف والتشخيص المبكر للمشكلات السمعية، العناية بالمعينات السمعية وقواقع الأذن، وبرامج التأهيل السمعي اللفظي.',
    targetAudience: 'all',
    suggestedLocation: 'عيادة القياس السمعي والتخاطب',
    badgeColor: 'b-yl',
  },
  {
    id: 'int_talent_day',
    name: 'اليوم الخليجي والعربي للموهبة والإبداع',
    month: 3,
    day: 3,
    icon: '🌟',
    category: 'education',
    categoryLabel: '🎓 الموهبة والتربية الخاصة',
    objectives: 'اكتشاف وتنمية المواهب الكامنة لدى طلاب التربية الخاصة ومزدوجي غير العادية وإبراز ابتكاراتهم الفنية والتقنية.',
    targetAudience: 'all',
    suggestedLocation: 'معرض الإبداع والصالة الفنية بالمركز',
    badgeColor: 'b-gr',
  },
  {
    id: 'int_down_syndrome_day',
    name: 'اليوم العالمي لمتلازمة داون',
    month: 3,
    day: 21,
    icon: '💛',
    category: 'developmental',
    categoryLabel: '🧩 متلازمة داون والنمو',
    objectives: 'الاحتفاء بقدرات أبطال متلازمة داون (كروموسوم 21)، تعزيز دمجهم الكامل في المجتمع وسوق العمل، وتكريم إنجازاتهم وبطولاتهم.',
    targetAudience: 'all',
    suggestedLocation: 'المسرح الكبير والساحة الخارجية المفتوحة',
    badgeColor: 'b-yl',
  },
  {
    id: 'int_purple_day',
    name: 'اليوم البنفسجي العالمي للتوعية بنوبات الصرع',
    month: 3,
    day: 26,
    icon: '🟪',
    category: 'health',
    categoryLabel: '🩺 الرعاية الصحية والتوعية',
    objectives: 'ارتداء اللون البنفسجي تعبيراً عن التضامن مع المصابين بنوبات التشنج والصرع، وتثقيف المجتمع المحيط بكيفية مساندتهم واحتوائهم.',
    targetAudience: 'all',
    suggestedLocation: 'صالة الفعاليات التفاعلية',
    badgeColor: 'b-pr',
  },

  // --- شهر أبريل (4) ---
  {
    id: 'int_autism_day',
    name: 'اليوم العالمي للتوعية باضطراب طيف التوحد',
    month: 4,
    day: 2,
    icon: '🧩',
    category: 'developmental',
    categoryLabel: '🧩 اضطراب طيف التوحد',
    objectives: 'إضاءة المركز باللون الأزرق، استعراض الممارسات المثبتة علمياً (ABA، تيتش، بيكس)، وتعزيز تقبل المجتمع والتنوع العصبي لفرسان التوحد.',
    targetAudience: 'all',
    suggestedLocation: 'مقر المركز بالكامل ومسرح الاحتفالات',
    badgeColor: 'b-bl',
  },
  {
    id: 'int_arab_deaf_week',
    name: 'أسبوع الأصم العربي (20 - 27 أبريل)',
    month: 4,
    day: 20,
    icon: '🤟',
    category: 'sensory',
    categoryLabel: '🤲 ثقافة ولغة الإشارة وضعاف السمع',
    objectives: 'تمكين الأشخاص الصم وضعاف السمع من حقوقهم الكاملة وتأهيلهم مهنياً ونشر ثقافة لغة الإشارة العربية الموحدة.',
    targetAudience: 'all',
    suggestedLocation: 'معرض الأنشطة وقاعة التدريب',
    badgeColor: 'b-or',
  },

  // --- شهر مايو (5) ---
  {
    id: 'int_play_day',
    name: 'اليوم العالمي للعب والدمج النمائي',
    month: 5,
    day: 28,
    icon: '🎈',
    category: 'rehab',
    categoryLabel: '🎯 العلاج باللعب والمهارات النمائية',
    objectives: 'توظيف اللعب الهادف والعلاج الترفيهي لتحفيز النمو الحسي، الحركي، والمعرفي للطلاب في بيئة مرحة وآمنة.',
    targetAudience: 'all',
    suggestedLocation: 'الحديقة التفاعلية وصالة الألعاب العلاجية',
    badgeColor: 'b-gr',
  },

  // --- شهر سبتمبر (9) ---
  {
    id: 'int_physiotherapy_day',
    name: 'اليوم العالمي للعلاج الطبيعي',
    month: 9,
    day: 8,
    icon: '🏃',
    category: 'rehab',
    categoryLabel: '🩺 التأهيل والعلاج الطبيعي والوظيفي',
    objectives: 'إبراز دور أخصائيي العلاج الطبيعي في استعادة القدرات الحركية والتوازن والاستقلالية الجسدية للمستفيدين.',
    targetAudience: 'all',
    suggestedLocation: 'قسم التأهيل الحركي والعلاج الطبيعي',
    badgeColor: 'b-bl',
  },
  {
    id: 'int_saudi_national_day',
    name: '🇸🇦 اليوم الوطني السعودي 95',
    month: 9,
    day: 23,
    icon: '🇸🇦',
    category: 'national',
    categoryLabel: '🇸🇦 المناسبات الوطنية والرسمية',
    objectives: 'غرس قيم الانتماء والولاء للوطن، ودمج الطلاب في الفعاليات الوطنية والعروض الفلكلورية والمسرحية التفاعلية.',
    targetAudience: 'all',
    suggestedLocation: 'مسرح الاحتفالات والساحة الرئيسية بالمركز',
    badgeColor: 'b-gr',
  },
  {
    id: 'int_sign_language_day',
    name: 'اليوم الدولي للغات الإشارة',
    month: 9,
    day: 23,
    icon: '🤲',
    category: 'sensory',
    categoryLabel: '🤲 لغات الإشارة والتواصل الكلي',
    objectives: 'الاعتراف بلغة الإشارة وحمايتها كلغة رسمية متكاملة وإتاحة خدمات الترجمة والتواصل الميسر للجميع.',
    targetAudience: 'all',
    suggestedLocation: 'قاعة الورش والاتصال',
    badgeColor: 'b-bl',
  },

  // --- شهر أكتوبر (10) - شهر التوعية والتربية الخاص ---
  {
    id: 'int_adhd_month',
    name: 'شهر التوعية باضطراب فرط الحركة وتشتت الانتباه (ADHD)',
    month: 10,
    day: 1,
    icon: '⚡',
    category: 'developmental',
    categoryLabel: '🧩 فرط الحركة وتشتت الانتباه (ADHD)',
    objectives: 'تقديم ورش واستراتيجيات تعديل السلوك والإدارة الصفية والدعم الأسري لأطفال فرط الحركة وتشتت الانتباه.',
    targetAudience: 'all',
    suggestedLocation: 'قاعة الإرشاد الأسري والتدريب',
    badgeColor: 'b-or',
  },
  {
    id: 'int_teachers_day',
    name: 'اليوم العالمي للمعلم ومربي التربية الخاصة',
    month: 10,
    day: 5,
    icon: '👩‍🏫',
    category: 'education',
    categoryLabel: '🎓 التربية والتعليم والكوادر',
    objectives: 'تكريم وتقدير معلمي وأخصائيي التربية الخاصة على جهودهم وعطائهم المخلص في تطوير قدرات الطلاب.',
    targetAudience: 'all',
    suggestedLocation: 'المسرح الرئيسي بالمركز',
    badgeColor: 'b-yl',
  },
  {
    id: 'int_cerebral_palsy_day',
    name: 'اليوم العالمي للشلل الدماغي (Cerebral Palsy)',
    month: 10,
    day: 6,
    icon: '💚',
    category: 'rehab',
    categoryLabel: '🩺 الشلل الدماغي والتأهيل الحركي',
    objectives: 'نشر الوعي بالشلل الدماغي والتقنيات المساعدة الحديثة، ودعم حق المصابين في الوصول الشامل وتطوير قدراتهم.',
    targetAudience: 'all',
    suggestedLocation: 'قسم العلاج الطبيعي والوظيفي',
    badgeColor: 'b-gr',
  },
  {
    id: 'int_dyslexia_week',
    name: 'الأسبوع واليوم العالمي للتوعية بصعوبات التعلم (Dyslexia)',
    month: 10,
    day: 8,
    icon: '📖',
    category: 'education',
    categoryLabel: '🎓 صعوبات التعلم والنمو الأكاديمي',
    objectives: 'التعريف بصعوبات القراءة (الديسلكسيا) والرياضيات والوسائل الإدراكية الحديثة لتمكين الطلاب دراسياً.',
    targetAudience: 'all',
    suggestedLocation: 'غرفة المصادر وصعوبات التعلم',
    badgeColor: 'b-bl',
  },
  {
    id: 'int_mental_health_day',
    name: 'اليوم العالمي للصحة النفسية والإرشاد السلوكي',
    month: 10,
    day: 10,
    icon: '🧠',
    category: 'health',
    categoryLabel: '🩺 الصحة النفسية وتعديل السلوك',
    objectives: 'تعزيز الصحة النفسية وجودة الحياة للأطفال وأولياء أمورهم وتوفير جلسات الإرشاد والتفريغ الانفعالي.',
    targetAudience: 'all',
    suggestedLocation: 'قاعة الإرشاد النفسي والأسري',
    badgeColor: 'b-pr',
  },
  {
    id: 'int_sight_day',
    name: 'اليوم العالمي للبصر وصحة العيون',
    month: 10,
    day: 12,
    icon: '👁️',
    category: 'sensory',
    categoryLabel: '🤲 الإعاقات البصرية وضعف البصر',
    objectives: 'التوعية بأهمية الفحص الدوري للبصر وتوفير البيئة البصرية المجهزة والمكبرات البصرية لضعاف البصر.',
    targetAudience: 'all',
    suggestedLocation: 'العيادة البصرية بالمركز',
    badgeColor: 'b-yl',
  },
  {
    id: 'int_white_cane_day',
    name: 'اليوم العالمي للعصا البيضاء للمكفوفين',
    month: 10,
    day: 15,
    icon: '🦯',
    category: 'sensory',
    categoryLabel: '🤲 الإعاقات البصرية والتنقل المستقل',
    objectives: 'التأكيد على رمزية العصا البيضاء كأداة أمان واستقلالية وتهيئة الممرات والبيئة المكانية الخالية من العوائق.',
    targetAudience: 'all',
    suggestedLocation: 'المضمار الحركي والساحة الخارجية',
    badgeColor: 'b-or',
  },
  {
    id: 'int_stuttering_day',
    name: 'اليوم العالمي للتوعية بالتأتأة واضطرابات النطق',
    month: 10,
    day: 22,
    icon: '🗣️',
    category: 'rehab',
    categoryLabel: '🩺 اضطرابات التخاطب والنطق والكلام',
    objectives: 'تشجيع فاقدي الطلاقة الكلامية على التعبير بثقة، وتوعية الأسر والبيئة المحيطة بأساليب الاستماع الداعمة وتجنب الضغط النفسي.',
    targetAudience: 'all',
    suggestedLocation: 'عيادة التخاطب وعيوب النطق',
    badgeColor: 'b-bl',
  },
  {
    id: 'int_occupational_therapy_day',
    name: 'اليوم العالمي للعلاج الوظيفي (Occupational Therapy)',
    month: 10,
    day: 27,
    icon: '🖐️',
    category: 'rehab',
    categoryLabel: '🩺 العلاج الوظيفي والتكامل الحسي',
    objectives: 'إبراز دور العلاج الوظيفي في بناء الاستقلالية اليومية (اللبس، الأكل، الكتابة) وتطوير المهارات الحركية الدقيقة والتكامل الحسي.',
    targetAudience: 'all',
    suggestedLocation: 'صالة العلاج الوظيفي ومطبخ التأهيل',
    badgeColor: 'b-gr',
  },

  // --- شهر نوفمبر (11) ---
  {
    id: 'int_children_day',
    name: 'اليوم العالمي للطفل وحقوق أطفال ذوي الإعاقة',
    month: 11,
    day: 20,
    icon: '🧸',
    category: 'education',
    categoryLabel: '🎓 حقوق ورعاية الطفل',
    objectives: 'الاحتفاء بالأطفال وتأكيد حقوقهم في الرعاية والتأهيل المتكامل واللعب والكرامة الإنسانية.',
    targetAudience: 'all',
    suggestedLocation: 'ساحة الألعاب ومسرح الطفل بالمركز',
    badgeColor: 'b-yl',
  },

  // --- شهر ديسمبر (12) ---
  {
    id: 'int_disability_day',
    name: 'اليوم العالمي للأشخاص ذوي الإعاقة (3 ديسمبر)',
    month: 12,
    day: 3,
    icon: '♿',
    category: 'developmental',
    categoryLabel: '♿ اليوم العالمي لذوي الإعاقة (الأكبر سنوياً)',
    objectives: 'الحدث السنوي الأكبر للمركز؛ لتعزيز الدمج الشامل، استعراض إنجازات وقصص نجاح الطلاب، تكريم الشركاء والداعمين، وتأكيد الريادة والاعتماد المؤسسي.',
    targetAudience: 'all',
    suggestedLocation: 'قاعة المؤتمرات والمسرح الكبير والمعرض العام',
    badgeColor: 'b-bl',
  },
  {
    id: 'int_arabic_language_day',
    name: 'اليوم العالمي للغة العربية',
    month: 12,
    day: 18,
    icon: '🖋️',
    category: 'education',
    categoryLabel: '🎓 اللغة العربية والهوية الثقافية',
    objectives: 'الاعتزاز بلغة الضاد، وتفعيل برامج الخط العربي، القراءة التفاعلية الميسرة، والقصص المصورة لأطفال التربية الخاصة.',
    targetAudience: 'all',
    suggestedLocation: 'المكتبة التفاعلية وقاعة الفنون',
    badgeColor: 'b-gr',
  }
];

/**
 * الحصول على تاريخ اليوم العالمي لسنة محددة (YYYY-MM-DD)
 */
export function getInternationalDayDate(item, year) {
  const y = year || new Date().getFullYear();
  const m = String(item.month).padStart(2, '0');
  const d = String(item.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * البحث عن يوم عالمي يوافق تاريخاً معيناً (YYYY-MM-DD أو MM-DD)
 */
export function getInternationalDaysForDate(dateStr) {
  if (!dateStr) return [];
  const parts = dateStr.split('-');
  let m = 0;
  let d = 0;
  if (parts.length === 3) {
    m = parseInt(parts[1], 10);
    d = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    m = parseInt(parts[0], 10);
    d = parseInt(parts[1], 10);
  }
  return INTERNATIONAL_DAYS.filter(item => item.month === m && item.day === d);
}

/**
 * جلب جميع الأيام العالمية منسقة مع تواريخ السنة المحددة
 */
export function getAllInternationalDaysForYear(year) {
  const targetYear = year || new Date().getFullYear();
  return INTERNATIONAL_DAYS.map(item => ({
    ...item,
    formattedDate: getInternationalDayDate(item, targetYear),
    displayDate: `${item.day} ${getMonthNameAr(item.month)}`
  }));
}

export function getMonthNameAr(monthIndex1Based) {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[monthIndex1Based - 1] || '';
}
