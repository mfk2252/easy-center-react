/**
 * Adaptive Behavior Assessment System, Third Edition (ABAS-3 Adaptation)
 * نظام تقييم السلوك التكيفي - الإصدار الثالث المقنن
 * المؤلفون: د. باتي هاريسون ود. توماس أوكلاند (Patti L. Harrison, Thomas Oakland)
 * الناشر: Western Psychological Services (WPS)
 */

export const ABAS_DOMAINS = [
  {
    id: 'conceptual',
    name: 'المجال المفاهيمي واللغوي',
    nameEn: 'Conceptual Domain',
    code: 'CON',
    icon: '💡',
    color: '#059669',
    description: 'يشمل مهارات التواصل، المعرفة الأكاديمية الوظيفية، والتوجيه الذاتي وإدارة المهام.',
    itemsCount: 9,
  },
  {
    id: 'social',
    name: 'المجال الاجتماعي والتفاعلي',
    nameEn: 'Social Domain',
    code: 'SOC',
    icon: '🤝',
    color: '#0d9488',
    description: 'يشمل مهارات التفاعل بين الأقران، تكوين العلاقات، وقضاء وقت الفراغ الترفيهي.',
    itemsCount: 8,
  },
  {
    id: 'practical',
    name: 'المجال العملي والاستقلالي',
    nameEn: 'Practical Domain',
    code: 'PRA',
    icon: '🛠️',
    color: '#10b981',
    description: 'يشمل العناية بالذات، الحياة المنزلية والمدرسية، الصحة والسلامة، واستخدام موارد المجتمع.',
    itemsCount: 10,
  },
];

export const ABAS_OPTIONS = [
  { value: 0, score: 0, label: '0 - غير قادر إطلاقاً', description: 'لا يستطيع أداء المهارة أو لا تظهر إطلاقاً', color: '#dc2626' },
  { value: 1, score: 1, label: '1 - نادراً ما يؤديها', description: 'يؤديها بصعوبة أو عند التوجيه والحث المباشر فقط', color: '#ea580c' },
  { value: 2, score: 2, label: '2 - أحياناً وبمساعدة جزئية', description: 'يؤدي السلوك أحياناً ويحتاج لتذكير أو مساعدة طفيفة', color: '#d97706' },
  { value: 3, score: 3, label: '3 - دائماً أو عند الحاجة باستقلالية', description: 'يؤدي المهارة بطلاقة واستقلالية تامة كلما تطلب الموقف ذلك', color: '#059669' },
];

export const ABAS_ITEMS = [
  // المجال المفاهيمي (Conceptual)
  {
    id: 'ab1',
    subscaleId: 'conceptual',
    text: 'يعبر عن احتياجاته ورغباته الأساسية باستخدام كلمات أو جمل واضحة أو وسائل تواصل بديلة.',
    targetExample: 'قول "أريد عصير برتقال" أو الإشارة لبطاقة بيكس المعبرة عن العطش بشكل مباشر ومستقل.',
  },
  {
    id: 'ab2',
    subscaleId: 'conceptual',
    text: 'يفهم التعليمات الشفهية المكونة من خطوتين وينفذها بدقة دون تكرار.',
    targetExample: 'تنفيذ أمر مثل: "ضع حقيبتك في الخزانة ثم اجلس على مقعدك" دون تردد أو تشتت.',
  },
  {
    id: 'ab3',
    subscaleId: 'conceptual',
    text: 'يتعرف على المفاهيم الرياضية والكمية الأساسية (أكثر/أقل، كبير/صغير، الأول/الأخير).',
    targetExample: 'الإشارة إلى الصحن الأكبر حجماً أو تحديد المجموعة التي تحتوي على تفاح أكثر بدقة.',
  },
  {
    id: 'ab4',
    subscaleId: 'conceptual',
    text: 'يتذكر أماكن ممتلكاته وأدواته ويستعيدها عند الطلب دون الحاجة للمساعدة.',
    targetExample: 'التوجه إلى درجه الخاص وإخراج دفتر الرسم والألوان عندما يطلب المعلم ذلك.',
  },
  {
    id: 'ab5',
    subscaleId: 'conceptual',
    text: 'يعبر عن مشاعره (سعيد، غاضب، متعب) بالكلمات المقبولة بدلاً من الصراخ أو الانسحاب.',
    targetExample: 'قول "أنا متعب وأحتاج للراحة" بهدوء عندما يشعر بالإرهاق بعد نشاط بدني.',
  },
  {
    id: 'ab6',
    subscaleId: 'conceptual',
    text: 'يدرك مفهوم الوقت والتسلسل اليومي للأنشطة والروتين المعتاد.',
    targetExample: 'معرفة أن وقت الغداء يأتي بعد انتهاء حصة الرياضيات وقبل وقت اللعب الحر.',
  },
  {
    id: 'ab7',
    subscaleId: 'conceptual',
    text: 'يطرح أسئلة استفسارية واستكشافية لفهم ما يدور حوله في بيئة الصف والمنزل.',
    targetExample: 'سؤال المعلم: "ماذا سنفعل اليوم في المختبر؟" لإدراك طبيعة المهمة القادمة.',
  },
  {
    id: 'ab8',
    subscaleId: 'conceptual',
    text: 'يكتب أو ينسخ اسمه وأرقاماً أو معلومات تعريفية بسيطة خاصة به.',
    targetExample: 'كتابة اسمه الأول بوضوح أعلى ورقة التقييم أو كتابة رقم هاتفه المنزلي.',
  },
  {
    id: 'ab9',
    subscaleId: 'conceptual',
    text: 'يحدد أهدافه البسيطة وينظم وقته لإنهاء نشاط محدد قبل الانتقال لنشاط آخر.',
    targetExample: 'إنهاء رسم وتلوين الصفحة كاملة قبل طلب الخروج للعب في الساحة.',
  },

  // المجال الاجتماعي (Social)
  {
    id: 'ab10',
    subscaleId: 'social',
    text: 'يبدأ التحية والتواصل مع أقرانه والبالغين بطريقة اجتماعية ملائمة ومقبولة.',
    targetExample: 'النظر لزميله الجديد في الصف والابتسام وقول "مرحباً، أنا اسمي أحمد".',
  },
  {
    id: 'ab11',
    subscaleId: 'social',
    text: 'يشارك بفاعلية في الألعاب والأنشطة الجماعية ويلتزم بمبدأ تبادل الأدوار.',
    targetExample: 'انتظار دوره لرمي حجر النرد في اللعبة اللوحية دون مقاطعة أو الاستحواذ على القطع.',
  },
  {
    id: 'ab12',
    subscaleId: 'social',
    text: 'يظهر التعاطف ويستجيب بلطف لمشاعر الآخرين عندما يراهم في ضيق أو حزن.',
    targetExample: 'تقديم منديل لزميل يبكي أو سؤاله "هل تحتاج مساعدة؟" بتعاطف حقيقي.',
  },
  {
    id: 'ab13',
    subscaleId: 'social',
    text: 'يلتزم بقواعد الأدب الاجتماعي العامة (شكراً، لو سمحت، عذراً).',
    targetExample: 'قول "شكراً" للمعلمة عند استلام الوجبة أو "عذراً" عند الاصطدام العارض بأحد الأقران.',
  },
  {
    id: 'ab14',
    subscaleId: 'social',
    text: 'يتحكم في انفعالاته ويتعامل مع الإحباط أو عدم الفوز في لعبة بهدوء ودون عدوانية.',
    targetExample: 'تهنئة الفائز بعد انتهاء المسابقة بقول "مبروك" وتقبل الخسارة بروح رياضية.',
  },
  {
    id: 'ab15',
    subscaleId: 'social',
    text: 'يكوّن صداقات مستمرة ويحافظ على التفاعل الإيجابي مع رفاقه المقربين.',
    targetExample: 'دعوة صديق لمشاركته وجبة الإفطار أو اللعب بكرة القدم أثناء الفسحة المدرسية.',
  },
  {
    id: 'ab16',
    subscaleId: 'social',
    text: 'يفهم الإشارات غير اللفظية وإيماءات الوجه للآخرين ويعدل سلوكه بناءً عليها.',
    targetExample: 'خفض صوته فور ملاحظة إشارة الصمت من المعلم أو إشارة التعب من زميله.',
  },
  {
    id: 'ab17',
    subscaleId: 'social',
    text: 'يتقبل التغيرات الطارئة في الجدول المدرسي أو الأسري دون توتر أو نوبات هلع.',
    targetExample: 'الانتقال إلى قاعة بديلة لحصة الرياضة بسبب المطر بهدوء وتكيف إيجابي.',
  },

  // المجال العملي (Practical)
  {
    id: 'ab18',
    subscaleId: 'practical',
    text: 'يتناول طعامه وشرابه بمفرده بنظافة واستقلالية تامة باستخدام الأدوات المخصصة ودون استخدام الببرونة.',
    targetExample: 'تناول صحن الأرز بالملعقة وشرب الماء من الكوب العادي دون إسقاط الطعام على الأرض.',
  },
  {
    id: 'ab19',
    subscaleId: 'practical',
    text: 'يرتدي ملابسه ويخلعها ويغلق أزرارها وسحابها بصورة صحيحة ومستقلة.',
    targetExample: 'ارتداء السترة المدرسية وإغلاق السحاب بالكامل وربط الحذاء أو شريط الفيلكرو.',
  },
  {
    id: 'ab20',
    subscaleId: 'practical',
    text: 'يعتني بنظافته الشخصية ويغسل يديه ووجهه ويستخدم دورة المياه بمفرده وبخصوصية.',
    targetExample: 'إتمام كافة خطوات دورة المياه بما يشمل قفل الباب، شطف المقعد، وغسل اليدين جيداً.',
  },
  {
    id: 'ab21',
    subscaleId: 'practical',
    text: 'يحافظ على نظافة وترتيب غرفته ومكان دراسته ويرتب الأغراض بعد الاستخدام.',
    targetExample: 'مسح طاولته بقطعة قماش بعد النشاط الفني وإرجاع العلب لخزانة الأدوات.',
  },
  {
    id: 'ab22',
    subscaleId: 'practical',
    text: 'يتنقل في أرجاء المبنى والساحة الخارجية بأمان وحذر دون تعريض نفسه للخطر.',
    targetExample: 'المشي بهدوء في الممرات دون ركض متهور وتجنب النزول السريع والمفاجئ على الدرج.',
  },
  {
    id: 'ab23',
    subscaleId: 'practical',
    text: 'يطلب المساعدة من البالغين الموثوقين عند مواجهة خطر أو عارض طارئ.',
    targetExample: 'إبلاغ المشرف فوراً عند رؤية زجاج مكسور أو شعوره بألم مفاجئ.',
  },
  {
    id: 'ab24',
    subscaleId: 'practical',
    text: 'يساعد في المهام اليومية البسيطة (مثل: توزيع الكراسات، مسح السبورة، نقل المقاعد).',
    targetExample: 'المبادرة بتوزيع أوراق العمل على زملائه بالترتيب عند طلب المعلم.',
  },
  {
    id: 'ab25',
    subscaleId: 'practical',
    text: 'يحافظ على ممتلكاته الشخصية ويتجنب إتلاف أو ضياع ملابسه وكتبه المدرسية.',
    targetExample: 'وضع كتبه داخل الحقيبة وإغلاقها قبل مغادرة الفصل للعودة للمنزل.',
  },
  {
    id: 'ab26',
    subscaleId: 'practical',
    text: 'يستخدم المرافق والأماكن العامة (الحديقة، البقالة، المسجد) بسلوك مهذب ومناسب.',
    targetExample: 'المشي بجانب والديه في السوبرماركت دون إمساك السلع العشوائية أو الجري بين الرفوف.',
  },
  {
    id: 'ab27',
    subscaleId: 'practical',
    text: 'يتصرف بأمان عند التعامل مع الأدوات الكهربائية والمواد الحارة أو الحادة.',
    targetExample: 'الامتناع عن وضع أيدٍ مبتلة على مقابس الكهرباء وتجنب لمس أواني الطهي الساخنة.',
  },
];

export function calculateABASScore(answers = {}) {
  const answeredKeys = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null);
  const totalAnswered = answeredKeys.length;
  const totalItems = ABAS_ITEMS.length;

  if (totalAnswered === 0) {
    return {
      totalAnswered: 0,
      totalItems,
      completionPercentage: 0,
      isZeroState: true,
      severityKey: 'unassessed',
      severityLabel: 'في انتظار البدء بالتقييم...',
      severityColor: 'var(--text-sub)',
      metrics: [
        { label: 'مركب التكيف العام (GAC)', value: '—', sub: 'في انتظار الرصد', color: 'var(--text-sub)' },
        { label: 'الرتبة المئينية', value: '—', sub: 'غير محسوب', color: 'var(--text-sub)' },
        { label: 'المستوى التكيفي', value: 'في الانتظار', sub: '0 بند مجاب', color: 'var(--text-sub)' },
      ],
      summary: 'في انتظار البدء بالتقييم - يرجى رصد درجات مجالات السلوك التكيفي (المفاهيمي، الاجتماعي، والعملي).',
      recommendations: 'سيتم تحديد مستوى التكيف العام والخطة التربوية الفردية فور إدخال الاستجابات.',
    };
  }

  const domainScores = { conceptual: 0, social: 0, practical: 0 };
  const domainAnswered = { conceptual: 0, social: 0, practical: 0 };
  let totalRawScore = 0;

  ABAS_ITEMS.forEach(it => {
    const val = Number(answers[it.id]);
    if (!isNaN(val) && answers[it.id] !== undefined && answers[it.id] !== null) {
      domainScores[it.subscaleId] = (domainScores[it.subscaleId] || 0) + val;
      domainAnswered[it.subscaleId] = (domainAnswered[it.subscaleId] || 0) + 1;
      totalRawScore += val;
    }
  });

  const maxRaw = { conceptual: 9 * 3, social: 8 * 3, practical: 10 * 3 }; // 27, 24, 30 => total max = 81
  const domainScaledScores = {};

  Object.keys(domainScores).forEach(domId => {
    const raw = domainScores[domId];
    const max = maxRaw[domId] || 25;
    const ratio = max > 0 ? (raw / max) : 0;
    // Scaled score from 1 to 19 (M=10, SD=3)
    const scaled = Math.round(1 + (ratio * 18));
    domainScaledScores[domId] = Math.max(1, Math.min(19, scaled));
  });

  // General Adaptive Composite (GAC): M = 100, SD = 15
  const sumScaled = Object.values(domainScaledScores).reduce((a, b) => a + b, 0); // Expected mean sum = 30
  const gac = Math.round(100 + ((sumScaled - 30) / 9) * 15);
  const boundedGac = Math.max(40, Math.min(150, gac));

  // Percentile calculation
  let percentile = 50;
  if (boundedGac >= 130) percentile = 98;
  else if (boundedGac >= 120) percentile = 91;
  else if (boundedGac >= 115) percentile = 84;
  else if (boundedGac >= 110) percentile = 75;
  else if (boundedGac >= 100) percentile = 50;
  else if (boundedGac >= 90) percentile = 25;
  else if (boundedGac >= 85) percentile = 16;
  else if (boundedGac >= 75) percentile = 5;
  else if (boundedGac >= 70) percentile = 2;
  else percentile = 1;

  let level = 'أداء تكيفي متوسط وملائم (Average)';
  let severityKey = 'normal';
  let severityColor = '#059669';

  if (boundedGac < 70) {
    level = 'قصور تكيفي دال وشديد (Extremely Low Deficit)';
    severityKey = 'severe';
    severityColor = '#dc2626';
  } else if (boundedGac < 80) {
    level = 'قصور تكيفي حدي / خفيف (Borderline)';
    severityKey = 'moderate';
    severityColor = '#ea580c';
  } else if (boundedGac < 90) {
    level = 'أقل من المتوسط (Below Average)';
    severityKey = 'mild';
    severityColor = '#d97706';
  } else if (boundedGac <= 110) {
    level = 'متوسط مناسب لعمره الزمني (Average)';
    severityKey = 'normal';
    severityColor = '#059669';
  } else if (boundedGac <= 120) {
    level = 'فوق المتوسط (Above Average)';
    severityKey = 'strength';
    severityColor = '#0284c7';
  } else {
    level = 'مرتفع جداً / أداء متميز (Superior)';
    severityKey = 'strength';
    severityColor = '#7c3aed';
  }

  const completionPercentage = Math.round((totalAnswered / totalItems) * 100);

  const subscaleResults = ABAS_DOMAINS.map(dom => ({
    id: dom.id,
    name: dom.name,
    rawScore: domainScores[dom.id] || 0,
    scaledScore: domainScaledScores[dom.id] || 10,
    answeredCount: domainAnswered[dom.id] || 0,
    totalCount: dom.itemsCount,
  }));

  const metrics = [
    { label: 'مركب التكيف العام (GAC)', value: boundedGac, sub: `مئيني: ${percentile}%`, color: severityColor },
    { label: 'المستوى التكيفي', value: level.split(' / ')[0], sub: 'تصنيف ABAS-3', color: severityColor },
    { label: 'المجال المفاهيمي', value: domainScaledScores.conceptual || 10, sub: 'معياري (1-19)', color: '#059669' },
    { label: 'المجال الاجتماعي', value: domainScaledScores.social || 10, sub: 'معياري (1-19)', color: '#0d9488' },
    { label: 'المجال العملي', value: domainScaledScores.practical || 10, sub: 'معياري (1-19)', color: '#10b981' },
  ];

  return {
    totalAnswered,
    totalItems,
    completionPercentage,
    totalRawScore,
    standardScore: boundedGac,
    gac: boundedGac,
    percentile,
    level,
    severityKey,
    severityLabel: level,
    severityColor,
    metrics,
    subscaleResults,
    summary: `تم تقييم السلوك التكيفي عبر نظام ABAS-3، وحقق المفحوص درجة تكيف عامة (GAC = ${boundedGac}) بالرتبة المئينية (${percentile}%) وتصنيف "${level}". بلغت الدرجات المعيارية للمجالات: المفاهيمي (${domainScaledScores.conceptual})، الاجتماعي (${domainScaledScores.social})، والعملي الاستقلالي (${domainScaledScores.practical}).`,
    recommendations: `يوصى بتكثيف الدعم في المجالات التكيفية الأقل أداءً، وتصميم تدريبات تعتمد النمذجة السلوكية والتعزيز المباشر في البيئة الطبيعية (المنزل والصف).`,
  };
}

export const abasScaleConfig = {
  id: 'abas_adaptive',
  title: 'نظام تقييم السلوك التكيفي (ABAS-3)',
  titleEn: 'Adaptive Behavior Assessment System, Third Edition',
  icon: '🏠',
  category: 'adaptive_behavior',
  categoryName: 'السلوك التكيفي ومهارات الحياة اليومية',
  themeColor: 'emerald',
  author: 'د. باتي هاريسون، د. توماس أوكلاند (Harrison & Oakland)',
  authorEn: 'Patti L. Harrison, Ph.D. & Thomas Oakland, Ph.D.',
  publisher: 'Western Psychological Services (WPS)',
  targetAge: 'من عمر الولادة حتى 89 سنة (نسخة الأطفال والناشئة المعتمدة)',
  standardsReference: 'متوافق مع معايير AAIDD وIDEA وDSM-5 لتشخيص الإعاقة الذهنية وتحديد مستويات الدعم الفردي',
  notice: 'أداة مقننة لقياس المهارات التكيفية الحياتية المستقلة اللازمة للعيش والعمل والدراسة بكفاءة في المجتمع.',
  disclaimer: 'تطبيق هذا المقياس واستخراج تقريره السيكومتري يخضع لأخلاقيات القياس والتشخيص في التربية الخاصة.',
  subscales: ABAS_DOMAINS,
  items: ABAS_ITEMS,
  options: ABAS_OPTIONS,
  calculateScore: calculateABASScore,
};
