export const MEASUREMENT_CATEGORIES = [
  { id: 'autism', name: 'مقاييس التوحد', icon: '🧩' },
  { id: 'speech', name: 'مقاييس النطق', icon: '🗣️' },
  { id: 'learning', name: 'مقاييس صعوبات التعلم', icon: '📘' },
  { id: 'development', name: 'مقاييس القدرات النمائية', icon: '🌱' },
  { id: 'sensory', name: 'مقاييس التكامل الحسي', icon: '🎯' },
  { id: 'psychology', name: 'مقاييس نفسية', icon: '🧠' },
  { id: 'other', name: 'أخرى', icon: '📌' },
];

const CARS_ITEMS = [
  {
    id: 'c1',
    text: 'الاتصال بالآخرين: مستوى مهارة الطفل في التفاعل الاجتماعي المباشر مع الآخرين.',
    domain: 'social',
  },
  {
    id: 'c2',
    text: 'التقليد: قدرة الطفل على محاكاة الأصوات والكلمات والحركات المناسبة لعمره.',
    domain: 'social',
  },
  {
    id: 'c3',
    text: 'الاستجابة الانفعالية: مدى ملاءمة ردود فعل الطفل العاطفية للحدث أو الموقف.',
    domain: 'emotion',
  },
  {
    id: 'c4',
    text: 'استخدام الجسم: تنسيق الحركات، التوازن، التكرار الحركي، وملاءمة الحركة لعمر الطفل.',
    domain: 'motor',
  },
  {
    id: 'c5',
    text: 'استخدام الأشياء: طبيعة التفاعل مع الألعاب والأشياء والاهتمام بها.',
    domain: 'play',
  },
  {
    id: 'c6',
    text: 'التكيّف مع التغيير: قدرة الطفل على قبول التغير في الروتين أو النشاط.',
    domain: 'behavior',
  },
  {
    id: 'c7',
    text: 'الاستجابة البصرية: مدى انتباه الطفل البصري وكيفية استخدامه للرؤية في التعرف على المثيرات.',
    domain: 'sensory',
  },
  {
    id: 'c8',
    text: 'الاستجابة السمعية: مدى استجابة الطفل للأصوات، وتشتت انتباهه أو فرط حساسيته لها.',
    domain: 'sensory',
  },
  {
    id: 'c9',
    text: 'اللمس، الشم، والتذوق: مدى تفاعل الطفل مع المثيرات الحسية واللمسية والمذاقية.',
    domain: 'sensory',
  },
  {
    id: 'c10',
    text: 'الخوف أو العصبية: مدى ملاءمة رد فعل الطفل تجاه المواقف المخيفة أو المجهدة.',
    domain: 'emotion',
  },
  {
    id: 'c11',
    text: 'التواصل اللفظي: قدرة الطفل على استخدام الكلام وبنيته ومعناه.',
    domain: 'communication',
  },
  {
    id: 'c12',
    text: 'التواصل غير اللفظي: قدرة الطفل على الإشارة، التعبير، وفهم الإشارات غير اللفظية.',
    domain: 'communication',
  },
  {
    id: 'c13',
    text: 'مستوى النشاط: مدى ملاءمة مستوى الحركة والنشاط للطفل في الموقف.',
    domain: 'behavior',
  },
  {
    id: 'c14',
    text: 'اتساق واستقرار الاستجابة العقلية: مستوى التناسق العام في الأداء المعرفي والاستجابة.',
    domain: 'cognitive',
  },
  {
    id: 'c15',
    text: 'انطباع الفاحص العام: مدى ظهور السمات السلوكية المميزة للتوحد في الطفل.',
    domain: 'general',
  },
];

function generateItems(prefix, count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}${index + 1}`,
    text: `بند ${index + 1}`,
    domain: 'general',
  }));
}

const GARS_ITEMS = generateItems('g', 58);
const SRS_ITEMS = generateItems('s', 65);

const DEFAULT_SCALE_LIBRARY = [
  {
    id: 'cars',
    name: 'كارز (CARS-2)',
    nameEn: 'CARS-2',
    category: 'autism',
    description: 'مقياس تقدير الذاتوية في الطفولة — 15 بنداً، درجات من 1.0 إلى 4.0 بنصف درجة',
    icon: '🧩',
    color: '#1a56db',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 4,
    step: 0.5,
    maxScore: 60,
    items: CARS_ITEMS,
    thresholdText: 'أقل من 30 = غير توحدي، من 30 إلى 36.5 = بسيط إلى متوسط التوحد، من 37 إلى 60 = شديد / حاد التوحد',
    isDefault: true,
  },
  {
    id: 'gars',
    name: 'جيليام (GARS-3)',
    nameEn: 'GARS-3',
    category: 'autism',
    description: 'مقياس جيليام لتقدير التوحد — 58 بنداً / 6 مقاييس فرعية',
    icon: '📊',
    color: '#7c3aed',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 174,
    items: GARS_ITEMS,
    thresholdText: 'يتم حساب النتيجة الفرعية والنسبة الإجمالية ثم مقارنة بالمعايير المناسبة',
    isDefault: true,
  },
  {
    id: 'srs',
    name: 'مقياس الاستجابة الاجتماعية (SRS)',
    nameEn: 'SRS',
    category: 'autism',
    description: 'مقياس الاستجابة الاجتماعية — 65 بنداً',
    icon: '👥',
    color: '#059669',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 195,
    items: SRS_ITEMS,
    thresholdText: 'يعتمد على المجموع الكلي ومقارنته بالمعايير المعيارية',
    isDefault: true,
  },
  {
    id: 'speech_screening',
    name: 'سجل ملاحظات النطق',
    category: 'speech',
    description: 'مقياس ملاحظات أولية للنطق والتواصل اللفظي',
    icon: '🗣️',
    color: '#0ea5e9',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 5,
    maxScore: 50,
    items: [
      { id: 'sp1', text: 'التعبير اللفظي', domain: 'speech' },
      { id: 'sp2', text: 'الفهم اللغوي', domain: 'speech' },
      { id: 'sp3', text: 'تكوين الجمل', domain: 'speech' },
      { id: 'sp4', text: 'المفردات', domain: 'speech' },
      { id: 'sp5', text: 'نطق الحروف', domain: 'speech' },
      { id: 'sp6', text: 'التواصل الاجتماعي', domain: 'speech' },
      { id: 'sp7', text: 'الاستجابة للأوامر', domain: 'speech' },
      { id: 'sp8', text: 'الاستمرار في المحادثة', domain: 'speech' },
      { id: 'sp9', text: 'المهارات التكرارية', domain: 'speech' },
      { id: 'sp10', text: 'الانتباه إلى الكلام', domain: 'speech' },
    ],
    thresholdText: 'كلما ارتفع المجموع، كلما كانت المهارات اللغوية أقوى',
    isDefault: true,
  },
  {
    id: 'learning_difficulties',
    name: 'مقياس صعوبات التعلم',
    category: 'learning',
    description: 'تقييم أولي لصعوبات القراءة والكتابة والفهم',
    icon: '📘',
    color: '#f59e0b',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 4,
    maxScore: 40,
    items: [
      { id: 'ld1', text: 'القراءة', domain: 'learning' },
      { id: 'ld2', text: 'الكتابة', domain: 'learning' },
      { id: 'ld3', text: 'الاستيعاب', domain: 'learning' },
      { id: 'ld4', text: 'التركيز', domain: 'learning' },
      { id: 'ld5', text: 'الذاكرة', domain: 'learning' },
      { id: 'ld6', text: 'التنظيم', domain: 'learning' },
      { id: 'ld7', text: 'التمييز البصري', domain: 'learning' },
      { id: 'ld8', text: 'التمييز السمعي', domain: 'learning' },
      { id: 'ld9', text: 'الاستجابة للمهام', domain: 'learning' },
      { id: 'ld10', text: 'الاستمرار', domain: 'learning' },
    ],
    thresholdText: 'ارتفاع الدرجات يشير إلى صعوبات أكبر في التعلم',
    isDefault: true,
  },
];

export function getScaleById(scaleId) {
  return DEFAULT_SCALE_LIBRARY.find(scale => scale.id === scaleId) || null;
}

export function getScaleOptions(scale) {
  if (!scale) return [];

  if (scale.responseType === 'yesno') return ['لا', 'نعم'];
  if (scale.responseType === 'number') return Array.from({ length: 11 }, (_, i) => i);

  const minValue = Number(scale.minValue ?? 1);
  const maxValue = Number(scale.maxValue ?? 4);
  const step = Number(scale.step ?? 0.5);
  const options = [];

  for (let value = minValue; value <= maxValue + 0.0001; value = Number((value + step).toFixed(2))) {
    options.push(Number(value.toFixed(2)));
  }

  return options;
}

export function groupScalesByCategory(scales = []) {
  return MEASUREMENT_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = scales.filter(scale => scale.category === category.id);
    return acc;
  }, {});
}

function getScaleMax(scale) {
  return scale?.maxScore || 100;
}

export function buildAssessmentResult(scale, answers = {}) {
  const items = scale?.items || [];
  const total = items.reduce((sum, item) => {
    const value = Number(answers[item.id] ?? 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const maxScore = getScaleMax(scale);
  const percentage = maxScore > 0 ? Number(((total / maxScore) * 100).toFixed(1)) : 0;

  let level = 'غير محدد';
  let color = '#64748b';

  if (scale?.id === 'cars') {
    if (total < 30) {
      level = 'غير توحدي';
      color = '#10b981';
    } else if (total <= 36.5) {
      level = 'بسيط إلى متوسط التوحد';
      color = '#f59e0b';
    } else {
      level = 'شديد / حاد التوحد';
      color = '#ef4444';
    }
  } else if (percentage >= 70) {
    level = 'مرتفع';
    color = '#ef4444';
  } else if (percentage >= 40) {
    level = 'متوسط';
    color = '#f59e0b';
  } else {
    level = 'منخفض';
    color = '#10b981';
  }

  return {
    total,
    percentage,
    level,
    color,
    note: scale?.thresholdText || 'تم حساب النتيجة بناءً على المقياس المختار',
  };
}

export { DEFAULT_SCALE_LIBRARY };
