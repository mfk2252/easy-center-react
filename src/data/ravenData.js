/**
 * Raven's Progressive Matrices (RPM) - CPM & SPM
 * مقياس مصفوفات رافن المتتابعة لقياس الذكاء غير اللفظي والاستدلال المعرفي
 * 
 * المؤلف الأصلي: د. جون رافن (John C. Raven)
 * الناشر المعتمد: بيرسون للتقييم النفسي (Pearson Assessment)
 * 
 * أداة القياس السيكومترية المعيارية الرائدة عالمياً لتقييم القدرة العقلية العامة (g factor)
 * والتفكير التجريدي والاستدلال الصامت غير اللفظي (Educative Ability)، خالية من التحيز الثقافي واللغوي.
 */

export const RAVEN_COPYRIGHT_INFO = {
  scaleNameAr: 'مقياس مصفوفات رافن المتتابعة للذكاء غير اللفظي (RPM)',
  scaleNameEn: "Raven's Progressive Matrices (RPM)",
  scaleShortName: 'Raven-RPM',
  authorAr: 'د. جون رافن (John C. Raven)',
  authorEn: 'John C. Raven, Ph.D.',
  publisherAr: 'بيرسون للتقييم النفسي والتربوي (Pearson Assessment)',
  publisherEn: 'Pearson Assessment',
  adaptationAr: 'المعايير السيكومترية المقننة للبيئات الإكلينيكية والتربوية ومراكز التأهيل العربية',
  targetAge: 'من سن 5 سنوات حتى سن الرشد (نموذج CPM للأطفال من 5-11 سنة والتربية الخاصة، ونموذج SPM للأعمار الأكبر)',
  diagnosticNature: 'تقييم سيكومتري غير لفظي تام لقياس القدرة الاستدلالية العامة وحل المشكلات البصرية المجردة',
  notice: 'مقياس مصفوفات رافن (Raven Progressive Matrices) هو علامة مسجلة لمؤسسة Pearson Assessment. الاستخدام مخصص للأخصائيين النفسيين المعتمدين والمشخصين الإكلينيكيين.',
  disclaimer: 'تنبيه مهني: يطبق المقياس بشكل فردي أو جمعي دون تدخل لغوي، وتفسر الرتب المئينية في ضوء العمر الزمني وملاحظات الأخصائي الفاحص.',
};

export const RAVEN_VERSIONS = [
  {
    id: 'cpm',
    code: 'CPM',
    name: 'مصفوفات رافن الملونة (CPM)',
    nameEn: 'Coloured Progressive Matrices (CPM)',
    description: 'مخصص للأطفال (5–11 سنة) والمستفيدين ذوي الإعاقة الفكرية وصعوبات التعلم وبطء النمو المعرفي (36 مصفوفة).',
    totalItems: 36,
    sets: ['A', 'Ab', 'B'],
    maxRawScore: 36,
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
  },
  {
    id: 'spm',
    code: 'SPM',
    name: 'مصفوفات رافن القياسية (SPM)',
    nameEn: 'Standard Progressive Matrices (SPM)',
    description: 'النموذج القياسي المعتمد للأطفال واليافعين والبالغين من سن 6 سنوات فما فوق (60 مصفوفة بصرية في 5 مجموعات).',
    totalItems: 60,
    sets: ['A', 'B', 'C', 'D', 'E'],
    maxRawScore: 60,
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
  },
];

export const RAVEN_SETS_META = {
  // CPM & SPM Sets
  A: {
    id: 'A',
    name: 'المجموعة (أ) — إكمال الأنماط المستمرة',
    nameEn: 'Set A — Continuous Patterns',
    description: 'تقيس إدراك الكل من الأجزاء وإكمال النسيج البصري والترابط الشكلي البسيط.',
    cognitiveSkill: 'الإدراك البصري وإغلاق الشكل (Visual Closure & Pattern Completion)',
    color: '#0284c7',
  },
  Ab: {
    id: 'Ab',
    name: 'المجموعة (أ ب) — استدلال العلاقات المكانية وتغير الأحجام',
    nameEn: 'Set Ab — Discrete Figures & Spatial Relations',
    description: 'تقيس القدرة على الربط بين أشكال مستقلة منفصلة وإدراك علاقات التموضع الفراغي والحجم (مخصصة لنموذج CPM).',
    cognitiveSkill: 'الاستدلال المكاني والتمايز الشكلي (Spatial Reasoning & Discrete Relations)',
    color: '#059669',
  },
  B: {
    id: 'B',
    name: 'المجموعة (ب) — التماثل واستدلال العلاقات الثنائية',
    nameEn: 'Set B — Analogical Reasoning',
    description: 'تقيس استنتاج القواعد المنطقية بين زوجين من الأشكال والتحولات الهندسية البسيطة.',
    cognitiveSkill: 'الاستدلال التماثلي والتفكير المقارن (Analogical Reasoning)',
    color: '#7c3aed',
  },
  C: {
    id: 'C',
    name: 'المجموعة (ج) — التغير المتدرج والديناميكي في الأنماط',
    nameEn: 'Set C — Progressive Alterations',
    description: 'تقيس التغيرات المتتابعة في الأنماط وفق اتجاهات أفقية ورأسية متزايدة التعقيد.',
    cognitiveSkill: 'التحليل المتسلسل وتتبع القواعد الديناميكية (Sequential Systematic Reasoning)',
    color: '#ea580c',
  },
  D: {
    id: 'D',
    name: 'المجموعة (د) — التبديل المنطقي والتحولات التركيبية',
    nameEn: 'Set D — Permutations & Recombinations',
    description: 'تقيس إعادة تركيب العناصر والتباديل والتوافيق المنطقية والتحولات الفراغية.',
    cognitiveSkill: 'التركيب الذهني المعقد والتبديل المنطقي (Logical Permutation)',
    color: '#dc2626',
  },
  E: {
    id: 'E',
    name: 'المجموعة (هـ) — التجريد المركب والعمليات الرياضية المنطقية',
    nameEn: 'Set E — Abstract Synthesis & Integration',
    description: 'تقيس الجمع والطرح والدمج المنطقي للأشكال الهندسية المجردة في مصفوفات 3×3.',
    cognitiveSkill: 'التفكير التجريدي فائق التعقيد والدمج الهندسي (Abstract Logical Integration)',
    color: '#4f46e5',
  },
};

// Item definitions for CPM (36 items)
export const RAVEN_CPM_ITEMS = [
  // Set A (12 items)
  { id: 'cpm_a_1', set: 'A', number: 1, title: 'مصفوفة A1', prompt: 'إكمال النمط البصري البسيط والشريط الهندسي المستمر', optionsCount: 6, maxScore: 1, iepGoal: 'تنمية قدرة الطالب على إدراك الأنماط المتصلة وإكمال الخطوط والزوايا الهندسية المفقودة.' },
  { id: 'cpm_a_2', set: 'A', number: 2, title: 'مصفوفة A2', prompt: 'إكمال نسيج الخطوط الأفقية المتقاطعة', optionsCount: 6, maxScore: 1, iepGoal: 'إدراك تشابه النسيج البصري والمطابقة الموضعية للخطوط المتوازية.' },
  { id: 'cpm_a_3', set: 'A', number: 3, title: 'مصفوفة A3', prompt: 'تحديد النمط القطري المائل المكمل للشكل', optionsCount: 6, maxScore: 1, iepGoal: 'تمييز الاتجاهات المائلة والإغلاق البصري للزوايا.' },
  { id: 'cpm_a_4', set: 'A', number: 4, title: 'مصفوفة A4', prompt: 'إكمال النمط المتكرر من الدوائر والنقاط', optionsCount: 6, maxScore: 1, iepGoal: 'ملاحظة الأنماط الدائرية والمطابقة وفق الكثافة والعدد.' },
  { id: 'cpm_a_5', set: 'A', number: 5, title: 'مصفوفة A5', prompt: 'إكمال النمط الشبكي المتداخل للمربعات', optionsCount: 6, maxScore: 1, iepGoal: 'التركيز على تفاصيل الشبكات المتقاطعة واستبعاد المشتتات.' },
  { id: 'cpm_a_6', set: 'A', number: 6, title: 'مصفوفة A6', prompt: 'إكمال الموجات المنحنية المنتظمة', optionsCount: 6, maxScore: 1, iepGoal: 'تتبع الانحناءات والموجات البصرية المتكررة بدقة.' },
  { id: 'cpm_a_7', set: 'A', number: 7, title: 'مصفوفة A7', prompt: 'مطابقة التغير التدرجي في كثافة التظليل', optionsCount: 6, maxScore: 1, iepGoal: 'إدراك تدرج التظليل والإضاءة في المساحات المغلقة.' },
  { id: 'cpm_a_8', set: 'A', number: 8, title: 'مصفوفة A8', prompt: 'إكمال الانعكاس المتناظر للشكل الهندسي', optionsCount: 6, maxScore: 1, iepGoal: 'تطبيق مفهوم التناظر المحوري البسيط حول خط مستقيم.' },
  { id: 'cpm_a_9', set: 'A', number: 9, title: 'مصفوفة A9', prompt: 'إكمال الشكل النجمي المتعدد الرؤوس', optionsCount: 6, maxScore: 1, iepGoal: 'تمييز العلاقات الهندسية المعقدة في الأشكال غير المنتظمة.' },
  { id: 'cpm_a_10', set: 'A', number: 10, title: 'مصفوفة A10', prompt: 'مطابقة التقاطع الثنائي بين شكلين ملونين', optionsCount: 6, maxScore: 1, iepGoal: 'عزل الشكل والأرضية وإدراك التقاطعات المتراكبة.' },
  { id: 'cpm_a_11', set: 'A', number: 11, title: 'مصفوفة A11', prompt: 'إكمال المنظومة الدائرية متحدة المركز', optionsCount: 6, maxScore: 1, iepGoal: 'إدراك العلاقات المركزية والشعاعية في التكوينات الدائرية.' },
  { id: 'cpm_a_12', set: 'A', number: 12, title: 'مصفوفة A12', prompt: 'إكمال النمط المركب المكون من 4 عناصر بصرية متماثلة', optionsCount: 6, maxScore: 1, iepGoal: 'تكامل العمليات البصرية وتجميع الأجزاء في كل وظيفي موحد.' },

  // Set Ab (12 items)
  { id: 'cpm_ab_1', set: 'Ab', number: 1, title: 'مصفوفة Ab1', prompt: 'استدلال الشكل المفقود في صف ثنائي الأبعاد', optionsCount: 6, maxScore: 1, iepGoal: 'تتبع الترتيب الأفقي واكتشاف العنصر المتكرر في صفوف منفصلة.' },
  { id: 'cpm_ab_2', set: 'Ab', number: 2, title: 'مصفوفة Ab2', prompt: 'استدلال النمط العمودي والتناوب بين شكلين', optionsCount: 6, maxScore: 1, iepGoal: 'تطبيق قاعدة التناوب الرأسي بين الرموز والألوان المختلفة.' },
  { id: 'cpm_ab_3', set: 'Ab', number: 3, title: 'مصفوفة Ab3', prompt: 'إدراك علاقة الاحتواء والتداخل بين دائرة ومربع', optionsCount: 6, maxScore: 1, iepGoal: 'فهم علاقة الاحتواء والتموضع الداخلي والخارجي للأشكال.' },
  { id: 'cpm_ab_4', set: 'Ab', number: 4, title: 'مصفوفة Ab4', prompt: 'تغير الحجم المنطقي (كبير، متوسط، صغير)', optionsCount: 6, maxScore: 1, iepGoal: 'ترتيب العناصر وفق التدرج الحجمي والتصاعدي المتسلسل.' },
  { id: 'cpm_ab_5', set: 'Ab', number: 5, title: 'مصفوفة Ab5', prompt: 'استدلال الاتجاه الدوراني للأسهم والمثلثات', optionsCount: 6, maxScore: 1, iepGoal: 'إدراك الدوران الفراغي بزاوية 90 درجة مع عقارب الساعة.' },
  { id: 'cpm_ab_6', set: 'Ab', number: 6, title: 'مصفوفة Ab6', prompt: 'الربط بين عدد الخطوط والعدد الداخلي', optionsCount: 6, maxScore: 1, iepGoal: 'الربط بين الخصائص الكمية للخطوط والأشكال الهندسية.' },
  { id: 'cpm_ab_7', set: 'Ab', number: 7, title: 'مصفوفة Ab7', prompt: 'استنتاج العلاقة التبادلية بين الزوايا والألوان', optionsCount: 6, maxScore: 1, iepGoal: 'الجمع بين سمتين بصريتين (اللون والزاوية) لاختيار المكمل المناسب.' },
  { id: 'cpm_ab_8', set: 'Ab', number: 8, title: 'مصفوفة Ab8', prompt: 'إكمال التكوين الرباعي المتناظر قطرياً', optionsCount: 6, maxScore: 1, iepGoal: 'تطبيق التناظر المائل والقطري في مصفوفة 2×2.' },
  { id: 'cpm_ab_9', set: 'Ab', number: 9, title: 'مصفوفة Ab9', prompt: 'إدراك قاعدة الانعكاس والقلب العمودي', optionsCount: 6, maxScore: 1, iepGoal: 'معالجة التدوير الرأسي للشكل دون فقدان الهوية البصرية.' },
  { id: 'cpm_ab_10', set: 'Ab', number: 10, title: 'مصفوفة Ab10', prompt: 'التحول من الشكل المفتوح إلى الشكل المغلق', optionsCount: 6, maxScore: 1, iepGoal: 'إدراك قواعد التحول البنائي من الأضلاع المفككة إلى الأشكال المغلقة.' },
  { id: 'cpm_ab_11', set: 'Ab', number: 11, title: 'مصفوفة Ab11', prompt: 'استدلال النمط المركب من شكلين متفاعلين', optionsCount: 6, maxScore: 1, iepGoal: 'تجريد القواعد المتعددة واستنتاج الشكل المشترك بدقة.' },
  { id: 'cpm_ab_12', set: 'Ab', number: 12, title: 'مصفوفة Ab12', prompt: 'حل مصفوفة التناغم اللوني والشكلي المعقدة', optionsCount: 6, maxScore: 1, iepGoal: 'دمج العلاقات المنطقية المتزامنة وحل مسألة الاستدلال غير اللفظي المركبة.' },

  // Set B (12 items)
  { id: 'cpm_b_1', set: 'B', number: 1, title: 'مصفوفة B1', prompt: 'التماثل الشكلي المباشر (أ : ب كـ ج : د)', optionsCount: 6, maxScore: 1, iepGoal: 'تطبيق قاعدة التماثل القياسي الثنائي البسيط بين أزواج الأشكال.' },
  { id: 'cpm_b_2', set: 'B', number: 2, title: 'مصفوفة B2', prompt: 'تماثل التحول من التظليل الكامل إلى الخطوط', optionsCount: 6, maxScore: 1, iepGoal: 'إدراك تحول خصائص السطح والملء الشكلي بين الصور المتقابلة.' },
  { id: 'cpm_b_3', set: 'B', number: 3, title: 'مصفوفة B3', prompt: 'تماثل الاتجاه والحركة الأفقية', optionsCount: 6, maxScore: 1, iepGoal: 'تحديد الاتجاه الحركي للشكل المرجعي وعكسه وفق النمط.' },
  { id: 'cpm_b_4', set: 'B', number: 4, title: 'مصفوفة B4', prompt: 'تماثل الإضافة والحذف لعنصر داخلي', optionsCount: 6, maxScore: 1, iepGoal: 'تطبيق العمليات المنطقية البصرية المتمثلة في إضافة عنصر هندسي.' },
  { id: 'cpm_b_5', set: 'B', number: 5, title: 'مصفوفة B5', prompt: 'التغير المتزامن في اللون والشكل والموضع', optionsCount: 6, maxScore: 1, iepGoal: 'متابعة تغير متغيرين اثنين في آن واحد لاستخلاص النتيجة الصحيحة.' },
  { id: 'cpm_b_6', set: 'B', number: 6, title: 'مصفوفة B6', prompt: 'استدلال التناقص التدريجي لأضلاع المضلعات', optionsCount: 6, maxScore: 1, iepGoal: 'حساب عدد الأضلاع واكتشاف قاعدة النقصان التدريجي.' },
  { id: 'cpm_b_7', set: 'B', number: 7, title: 'مصفوفة B7', prompt: 'الانقسام والتفكك المتماثل للأشكال المعقدة', optionsCount: 6, maxScore: 1, iepGoal: 'الاستدلال التجريدي على تفكيك الشكل إلى أجزائه الأولية المتطابقة.' },
  { id: 'cpm_b_8', set: 'B', number: 8, title: 'مصفوفة B8', prompt: 'الدمج البصري والتركيب للشكلين العلوي والسفلي', optionsCount: 6, maxScore: 1, iepGoal: 'تركيب عناصر الصف والعمود للحصول على الشكل التقاطعي الصحيح.' },
  { id: 'cpm_b_9', set: 'B', number: 9, title: 'مصفوفة B9', prompt: 'الدوران الزاوي المتدرج بمقدار 45 درجة', optionsCount: 6, maxScore: 1, iepGoal: 'التحليل المكاني للتدوير التدريجي للأشكال الهندسية.' },
  { id: 'cpm_b_10', set: 'B', number: 10, title: 'مصفوفة B10', prompt: 'استدلال قاعدة التقاطع المعقد في مصفوفة 2×2', optionsCount: 6, maxScore: 1, iepGoal: 'تحديد مصفوفات القواعد واستنتاج التناظر الثنائي المركب.' },
  { id: 'cpm_b_11', set: 'B', number: 11, title: 'مصفوفة B11', prompt: 'علاقة الاحتواء المتدرجة للأشكال المركزية', optionsCount: 6, maxScore: 1, iepGoal: 'المحاكمة المنطقية المجردة للعلاقات المكانية متداخلة المستويات.' },
  { id: 'cpm_b_12', set: 'B', number: 12, title: 'مصفوفة B12', prompt: 'المصفوفة التجريدية النهائية للنموذج الملون CPM', optionsCount: 6, maxScore: 1, iepGoal: 'تطبيق أقصى درجات الاستدلال السيالي والتفكير المنطقي غير اللفظي.' },
];

// Item definitions for SPM (Standard Progressive Matrices - 60 items)
export const RAVEN_SPM_ITEMS = [
  ...RAVEN_CPM_ITEMS.filter(it => it.set === 'A').map(it => ({ ...it, id: `spm_${it.set.toLowerCase()}_${it.number}` })),
  ...RAVEN_CPM_ITEMS.filter(it => it.set === 'B').map(it => ({ ...it, id: `spm_${it.set.toLowerCase()}_${it.number}` })),
  // Set C (12 items)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `spm_c_${i + 1}`,
    set: 'C',
    number: i + 1,
    title: `مصفوفة C${i + 1}`,
    prompt: `استدلال التغير المتدرج الأفقي والرأسي للمصفوفة C${i + 1}`,
    optionsCount: 8,
    maxScore: 1,
    iepGoal: `تطوير استراتيجيات التفكير المنظومي وتتبع التغير التدريجي في مصفوفات 3×3.`,
  })),
  // Set D (12 items)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `spm_d_${i + 1}`,
    set: 'D',
    number: i + 1,
    title: `مصفوفة D${i + 1}`,
    prompt: `استدلال التحولات التركيبية والتبديل المنطقي D${i + 1}`,
    optionsCount: 8,
    maxScore: 1,
    iepGoal: `حل مشكلات التبديل المنطقي والتحولات التركيبية للأشكال الهندسية المجردة.`,
  })),
  // Set E (12 items)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `spm_e_${i + 1}`,
    set: 'E',
    number: i + 1,
    title: `مصفوفة E${i + 1}`,
    prompt: `التجريد المركب والعمليات المنطقية الرياضية على المصفوفة E${i + 1}`,
    optionsCount: 8,
    maxScore: 1,
    iepGoal: `استنتاج القواعد المنطقية الرياضية التجريدية والدمج الهندسي فائق التعقيد.`,
  })),
];

/**
 * Standard Raven 5-Grade Cognitive Classification System
 * نظام رافن المعياري الخماسي لتصنيف القدرة العقلية والاستدلال المعرفي
 */
export const RAVEN_CLASSIFICATION_GRADES = [
  {
    grade: 'Grade I',
    nameAr: 'المستوى الأول: ذكاء متميز وفائق (Intellectually Superior)',
    shortNameAr: 'متفوق فائق (موهبة)',
    nameEn: 'Intellectually Superior / Gifted',
    minPercentile: 95,
    maxPercentile: 99,
    color: '#1e3a8a',
    bg: '#eff6ff',
    borderColor: '#93c5fd',
    description: 'يقع أداء المفحوص في أعلى 5% من أقرانه في نفس الفئة العمرية. قدرة استدلالية وتجريدية غير لفظية استثنائية.',
  },
  {
    grade: 'Grade II',
    nameAr: 'المستوى الثاني: فوق المتوسط جلياً (Definitely Above Average)',
    shortNameAr: 'فوق المتوسط',
    nameEn: 'Definitely Above Average Ability',
    minPercentile: 75,
    maxPercentile: 94,
    color: '#2563eb',
    bg: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'يقع أداء المفحوص في نطاق الربع الأعلى من التوزيع الطبيعي للذكاء (فوق المتوسط بشكل ملحوظ).',
  },
  {
    grade: 'Grade III+',
    nameAr: 'المستوى الثالث (+): متوسط مرتفع (High Average)',
    shortNameAr: 'متوسط مرتفع',
    nameEn: 'Intellectually Average (High End)',
    minPercentile: 50,
    maxPercentile: 74,
    color: '#0284c7',
    bg: '#f0f9ff',
    borderColor: '#bae6fd',
    description: 'يقع الأداء في النصف الأعلى من النطاق المتوسط المعتاد لأقرانه.',
  },
  {
    grade: 'Grade III-',
    nameAr: 'المستوى الثالث (-): متوسط منخفض (Low Average)',
    shortNameAr: 'متوسط منخفض',
    nameEn: 'Intellectually Average (Low End)',
    minPercentile: 25,
    maxPercentile: 49,
    color: '#059669',
    bg: '#ecfdf5',
    borderColor: '#a7f3d0',
    description: 'يقع الأداء في النصف الأدنى من النطاق المتوسط المعتاد لأقرانه.',
  },
  {
    grade: 'Grade IV',
    nameAr: 'المستوى الرابع: أقل من المتوسط / بطء استدلال (Definitely Below Average)',
    shortNameAr: 'أقل من المتوسط / بطء تعلم',
    nameEn: 'Definitely Below Average Ability',
    minPercentile: 5,
    maxPercentile: 24,
    color: '#ea580c',
    bg: '#fff7ed',
    borderColor: '#fed7aa',
    description: 'يقع الأداء في الربع الأدنى من التوزيع، مما يشير إلى صعوبة وتحديات واضحة في التفكير التجريدي والاستدلال الصامت.',
  },
  {
    grade: 'Grade V',
    nameAr: 'المستوى الخامس: قصور عقلي واستدلالي (Intellectually Defective)',
    shortNameAr: 'قصور معرفي واستدلالي',
    nameEn: 'Intellectually Defective / Impaired',
    minPercentile: 1,
    maxPercentile: 4,
    color: '#dc2626',
    bg: '#fef2f2',
    borderColor: '#fecaca',
    description: 'يقع الأداء في أدنى 5% من أقرانه، وهو مؤشر سيكومتري دال على قصور فكري يستلزم برامج التدخل والتربية الخاصة.',
  },
];

/**
 * Standard Age-Norms Table for CPM (Coloured Progressive Matrices - 36 items)
 * Normative lookup by chronological age (Years)
 */
const CPM_NORMS_TABLE = [
  // ageGroup: { minAge, maxAge, percentiles: [p95, p90, p75, p50, p25, p10, p5] }
  { minAge: 5.0, maxAge: 5.9, p95: 22, p90: 20, p75: 17, p50: 14, p25: 11, p10: 9, p5: 7 },
  { minAge: 6.0, maxAge: 6.9, p95: 25, p90: 23, p75: 20, p50: 17, p25: 14, p10: 11, p5: 9 },
  { minAge: 7.0, maxAge: 7.9, p95: 29, p90: 27, p75: 24, p50: 20, p25: 17, p10: 14, p5: 12 },
  { minAge: 8.0, maxAge: 8.9, p95: 32, p90: 30, p75: 27, p50: 24, p25: 20, p10: 17, p5: 14 },
  { minAge: 9.0, maxAge: 9.9, p95: 34, p90: 32, p75: 30, p50: 27, p25: 23, p10: 20, p5: 17 },
  { minAge: 10.0, maxAge: 11.9, p95: 35, p90: 34, p75: 32, p50: 29, p25: 26, p10: 22, p5: 19 },
  { minAge: 12.0, maxAge: 99.0, p95: 36, p90: 35, p75: 33, p50: 31, p25: 28, p10: 24, p5: 21 },
];

/**
 * Standard Age-Norms Table for SPM (Standard Progressive Matrices - 60 items)
 */
const SPM_NORMS_TABLE = [
  { minAge: 6.0, maxAge: 7.9, p95: 30, p90: 27, p75: 23, p50: 18, p25: 14, p10: 11, p5: 9 },
  { minAge: 8.0, maxAge: 9.9, p95: 38, p90: 35, p75: 31, p50: 26, p25: 21, p10: 16, p5: 13 },
  { minAge: 10.0, maxAge: 11.9, p95: 45, p90: 42, p75: 38, p50: 33, p25: 28, p10: 23, p5: 19 },
  { minAge: 12.0, maxAge: 13.9, p95: 50, p90: 47, p75: 43, p50: 39, p25: 34, p10: 29, p5: 24 },
  { minAge: 14.0, maxAge: 15.9, p95: 54, p90: 51, p75: 47, p50: 43, p25: 38, p10: 33, p5: 28 },
  { minAge: 16.0, maxAge: 99.0, p95: 56, p90: 53, p75: 49, p50: 45, p25: 41, p10: 36, p5: 31 },
];

/**
 * Calculate Raven Percentile Rank from Raw Score & Chronological Age
 */
export function calculateRavenPercentile(rawScore, ageYears = 8.0, version = 'cpm') {
  const table = version === 'spm' ? SPM_NORMS_TABLE : CPM_NORMS_TABLE;
  const numAge = parseFloat(ageYears) || 8.0;

  // Find age bracket
  let bracket = table.find(b => numAge >= b.minAge && numAge <= b.maxAge);
  if (!bracket) {
    bracket = numAge < table[0].minAge ? table[0] : table[table.length - 1];
  }

  const { p95, p90, p75, p50, p25, p10, p5 } = bracket;

  if (rawScore >= p95) return 97;
  if (rawScore >= p90) return 92;
  if (rawScore >= p75) return Math.round(75 + ((rawScore - p75) / (p90 - p75 || 1)) * 15);
  if (rawScore >= p50) return Math.round(50 + ((rawScore - p50) / (p75 - p50 || 1)) * 25);
  if (rawScore >= p25) return Math.round(25 + ((rawScore - p25) / (p50 - p25 || 1)) * 25);
  if (rawScore >= p10) return Math.round(10 + ((rawScore - p10) / (p25 - p10 || 1)) * 15);
  if (rawScore >= p5) return Math.round(5 + ((rawScore - p5) / (p10 - p5 || 1)) * 5);
  return Math.max(1, Math.round((rawScore / (p5 || 1)) * 4));
}

/**
 * Convert Percentile Rank to Equivalent IQ (Mean 100, SD 15)
 */
export function percentileToEquivalentIQ(percentile) {
  if (percentile >= 99) return 135;
  if (percentile >= 95) return 125;
  if (percentile >= 90) return 120;
  if (percentile >= 75) return 110;
  if (percentile >= 60) return 104;
  if (percentile >= 50) return 100;
  if (percentile >= 40) return 96;
  if (percentile >= 25) return 90;
  if (percentile >= 10) return 80;
  if (percentile >= 5) return 75;
  if (percentile >= 2) return 69;
  return 60;
}

/**
 * Main Psychometrics Calculator for Raven's Progressive Matrices (RPM)
 */
export function calculateRavenPsychometrics(scores = {}, rawOverrides = {}, version = 'cpm', age = 8.0) {
  const items = version === 'spm' ? RAVEN_SPM_ITEMS : RAVEN_CPM_ITEMS;
  const versionMeta = RAVEN_VERSIONS.find(v => v.id === version) || RAVEN_VERSIONS[0];
  const totalItemsCount = items.length;

  // 1. Calculate Raw Score per set
  const setResults = versionMeta.sets.map(setId => {
    const meta = RAVEN_SETS_META[setId] || { name: `المجموعة ${setId}`, color: '#2563eb' };
    const setItems = items.filter(it => it.set === setId);
    const setItemIds = setItems.map(it => it.id);

    let rawScore = 0;
    if (rawOverrides && rawOverrides[setId] !== undefined && rawOverrides[setId] !== '') {
      rawScore = Math.min(12, Math.max(0, parseInt(rawOverrides[setId], 10) || 0));
    } else {
      setItemIds.forEach(id => {
        const val = scores[id];
        if (val === 1 || val === '1' || val === true || val === 'correct') {
          rawScore += 1;
        }
      });
    }

    const answeredCount = setItemIds.filter(id => scores[id] !== undefined && scores[id] !== '').length;
    const maxRaw = 12;
    const percentage = Math.round((rawScore / maxRaw) * 100);

    return {
      setId,
      name: meta.name,
      nameEn: meta.nameEn,
      description: meta.description,
      cognitiveSkill: meta.cognitiveSkill,
      color: meta.color,
      rawScore,
      maxRaw,
      answeredCount,
      percentage,
      isStrength: rawScore >= 10,
      isDeficit: rawScore <= 4,
    };
  });

  // Total Raw Score
  let totalRaw = 0;
  if (rawOverrides && rawOverrides.total !== undefined && rawOverrides.total !== '') {
    totalRaw = Math.min(totalItemsCount, Math.max(0, parseInt(rawOverrides.total, 10) || 0));
  } else {
    totalRaw = setResults.reduce((acc, s) => acc + s.rawScore, 0);
  }

  // Answered items count
  const answeredTotal = Object.keys(scores).filter(k => scores[k] !== undefined && scores[k] !== '').length;
  const completionPercentage = Math.round((answeredTotal / totalItemsCount) * 100);

  // Percentile & Equivalent IQ
  const numAge = parseFloat(age) || 8.0;
  const percentile = calculateRavenPercentile(totalRaw, numAge, version);
  const equivalentIQ = percentileToEquivalentIQ(percentile);

  // Determine Classification Grade
  let classificationObj = RAVEN_CLASSIFICATION_GRADES[2]; // Default Grade III
  for (const grade of RAVEN_CLASSIFICATION_GRADES) {
    if (percentile >= grade.minPercentile) {
      classificationObj = grade;
      break;
    }
  }

  // Clinical Summary & Impression
  let clinicalImpression = '';
  let recommendations = '';

  if (percentile >= 95) {
    clinicalImpression = `أظهر المفحوص قدرة عقلية عامة فائقة وتفوقاً استدلالياً تجريدياً غير لفظي (المستوى الأول: Grade I - رتبة مئينية ${percentile}% ومكافئ ذكاء تقريبي ${equivalentIQ}). يمتلك كفاءة بصرية فراغية وسرعة ملحوظة في اكتشاف القواعد الرياضية والمنطقية.`;
    recommendations = `1. توفير برامج إثرائية متقدمة تركز على الاستدلال المنطقي المفتوح والروبوتات والبرمجة وحل الألغاز المعقدة.\n2. تعزيز دافعية التعلم بمهام استكشافية تراعي قدراته التحليلية المتفوقة.`;
  } else if (percentile >= 75) {
    clinicalImpression = `تقع القدرة الاستدلالية غير اللفظية للمفحوص فوق المتوسط بشكل جلي (المستوى الثاني: Grade II - رتبة مئينية ${percentile}% ومكافئ ذكاء ${equivalentIQ}). يستجيب بكفاءة عالية للمشكلات التجريدية.`;
    recommendations = `1. دعم التفكير الإبداعي والأنشطة الأكاديمية والتربوية المتقدمة.\n2. استخدام استراتيجيات التعلم القائم على المشروعات والنمذجة البصرية.`;
  } else if (percentile >= 50) {
    clinicalImpression = `تقع القدرة العقلية العامة للمفحوص في النطاق المتوسط المرتفع (المستوى الثالث +: Grade III+ - رتبة مئينية ${percentile}% ومكافئ ذكاء ${equivalentIQ}). يمتلك مهارات استدلالية سليمة ومناسبة لعمره الزمني.`;
    recommendations = `1. الاستمرار في الأنشطة الصفية المعتادة مع تعزيز الثقة في حل المهام البصرية المركبة.\n2. تشجيع التعلم الذاتي وحل المشكلات التتابعية.`;
  } else if (percentile >= 25) {
    clinicalImpression = `تقع قدرات الاستدلال المعرفي للمفحوص في النطاق المتوسط المنخفض (المستوى الثالث -: Grade III- - رتبة مئينية ${percentile}% ومكافئ ذكاء ${equivalentIQ}). قادر على مواكبة المناهج مع بعض التأني.`;
    recommendations = `1. تقديم الوسائل التعليمية البصرية المحسوسة قبل الانتقال إلى التجريد التام.\n2. إتاحة وقت كافٍ للمفحوص عند التعامل مع الأنماط المعقدة وتقسيم المهام.`;
  } else if (percentile >= 5) {
    clinicalImpression = `أظهرت نتائج المقياس أن القدرة الاستدلالية تقع في نطاق أقل من المتوسط / بطء التعلم (المستوى الرابع: Grade IV - رتبة مئينية ${percentile}% ومكافئ ذكاء ${equivalentIQ}). يواجه تحديات واضحة في التفكير التجريدي وإدراك التحولات المكانية.`;
    recommendations = `1. إعداد خطة تربوية فردية (IEP) تركز على المهارات المعرفية الإدراكية والتدرج من المحسوس إلى شبه المحسوس.\n2. استخدام استراتيجيات التدريب المباشر والنمذجة البصرية المستمرة والتكرار الإيجابي.\n3. تكييف أساليب التقييم لتقليل الاعتماد على التجريد المنطقي المعقد.`;
  } else {
    clinicalImpression = `تشير نتائج مصفوفات رافن إلى قصور ملحوظ في القدرة الاستدلالية غير اللفظية العامة (المستوى الخامس: Grade V - رتبة مئينية ${percentile}% ومكافئ ذكاء ${equivalentIQ}). يتطلب تدخلاً تربوياً وتأهيلياً مكثفاً.`;
    recommendations = `1. إلحاق التلميذ ببرامج التربية الخاصة الشاملة مع خطة فردية تركز على الاستقلالية والتواصل والمهارات الوظيفية الحياتية.\n2. تقديم دعم حسي متعدد الوسائط والتركيز على المهارات العملية البسيطة.\n3. إجراء تقييمات نمائية وتكيفية مساندة (مثل مقياس فينلاند للسلوك التكيفي) لتحديد أبعاد الدعم المطلوب.`;
  }

  const strengthSets = setResults.filter(s => s.isStrength);
  const deficitSets = setResults.filter(s => s.isDeficit);

  return {
    version,
    versionName: versionMeta.name,
    totalRaw,
    maxRawScore: totalItemsCount,
    percentage: Math.round((totalRaw / totalItemsCount) * 100),
    answeredCount: answeredTotal,
    completionPercentage,
    totalItems: totalItemsCount,
    ageYears: numAge,
    percentile,
    equivalentIQ,
    grade: classificationObj.grade,
    classification: classificationObj.nameAr,
    classificationEn: classificationObj.nameEn,
    shortClassification: classificationObj.shortNameAr,
    severityColor: classificationObj.color,
    severityBg: classificationObj.bg,
    severityBorder: classificationObj.borderColor,
    gradeDescription: classificationObj.description,
    setResults,
    strengthSets,
    deficitSets,
    clinicalImpression,
    recommendations,
  };
}
