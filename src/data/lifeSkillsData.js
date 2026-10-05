/**
 * Self-Independence & Life Skills Assessment Scale
 * قائمة مهارات الاستقلالية والرعاية الذاتية للطفولة والناشئة
 * إعداد: خبراء التأهيل والتربية الخاصة - الجمعية العربية للمهارات التكيفية
 */

export const LIFE_SKILLS_SUBSCALES = [
  {
    id: 'feeding',
    name: 'تناول الطعام والشراب',
    nameEn: 'Feeding & Drinking Skills',
    code: 'FEE',
    icon: '🍽️',
    color: '#059669',
    description: 'استخدام أدوات المائدة، شرب السوائل بالكوب، النظافة أثناء الوجبة، وتجهيز وجبات خفيفة.',
    itemsCount: 5,
  },
  {
    id: 'dressing',
    name: 'ارتداء وخلع الملابس',
    nameEn: 'Dressing & Grooming',
    code: 'DRE',
    icon: '👕',
    color: '#0d9488',
    description: 'ارتداء وخلع القميص والبنطال، التعامل مع الأزرار والسحاب، وربط وخلع الأحذية.',
    itemsCount: 5,
  },
  {
    id: 'hygiene',
    name: 'النظافة والعناية الشخصية',
    nameEn: 'Personal Hygiene & Toilet',
    code: 'HYG',
    icon: '🚿',
    color: '#10b981',
    description: 'استخدام دورة المياه، غسل اليدين والوجه، تفريش الأسنان، وتمشيط الشعر بخصوصية.',
    itemsCount: 5,
  },
  {
    id: 'safety',
    name: 'السلامة والوقاية من المخاطر',
    nameEn: 'Safety & Risk Prevention',
    code: 'SAF',
    icon: '🛡️',
    color: '#14b8a6',
    description: 'تجنب مصادر الخطر المباشرة، طلب المساعدة في الطوارئ، وحفظ البيانات الشخصية الأساسية.',
    itemsCount: 5,
  },
  {
    id: 'community',
    name: 'الاستقلالية والمشاركة المجتمعية',
    nameEn: 'Community & Independence',
    code: 'COM',
    icon: '🛒',
    color: '#047857',
    description: 'التعامل مع النقود، التنقل داخل البيئة المحلية، والترتيب والمسؤولية عن الممتلكات.',
    itemsCount: 5,
  },
];

export const LIFE_SKILLS_OPTIONS = [
  { value: 0, score: 0, label: '0 - مساعدة كلية / لا يؤديها', description: 'يعتمد اعتماداً كاملاً على الآخرين لإنجاز المهارة', color: '#dc2626' },
  { value: 1, score: 1, label: '1 - مساعدة جسدية أو إيمائية', description: 'يؤدي جزءاً بسيطاً ويحتاج لمساعدة يدوية مباشرة', color: '#ea580c' },
  { value: 2, score: 2, label: '2 - توجيه لفظي أو إشراف', description: 'يؤدي المهارة بنجاح مع حاجته للتذكير أو المراقبة عن بعد', color: '#d97706' },
  { value: 3, score: 3, label: '3 - استقلالية تامة', description: 'ينجز المهارة بمفرده وبكفاءة ودون أي مساعدة خارجية', color: '#059669' },
];

export const LIFE_SKILLS_ITEMS = [
  // 1. Feeding & Drinking (feeding)
  {
    id: 'ls1',
    subscaleId: 'feeding',
    text: 'يشرب الماء والعصير من الكوب العادي المفتوح دون انسكاب ودون الاعتماد على الببرونة.',
    targetExample: 'رفع الكوب الممتلئ إلى الفم بارتياح والشرب بهدوء ثم إعادته على الطاولة بحركة متزنة.',
  },
  {
    id: 'ls2',
    subscaleId: 'feeding',
    text: 'يتناول وجبته كاملة باستخدام الملعقة والشوكة دون إحداث فوضى أو تلويث ملابسه.',
    targetExample: 'إدخال الملعقة في الصحن ونقل الطعام للفم بمعدل مناسب دون نثر حبات الأرز على الطاولة.',
  },
  {
    id: 'ls3',
    subscaleId: 'feeding',
    text: 'يسكب الماء أو العصير من الإبريق الصغير في الكوب بمستوى ملائم دون أن يفيض.',
    targetExample: 'الإمساك بمقبض الإبريق بيد وتثبيت الكوب باليد الأخرى وملء نصف الكوب بدقة.',
  },
  {
    id: 'ls4',
    subscaleId: 'feeding',
    text: 'يمسح فمه بالمنديل وينظف طاولته ويرفع صحنه الفارغ بعد انتهاء الأكل.',
    targetExample: 'مسح الفم واليدين عند الانتهاء وحمل الصحن والكوب لحوض المطبخ دون تذكير.',
  },
  {
    id: 'ls5',
    subscaleId: 'feeding',
    text: 'يجهز لنفسه وجبة خفيفة آمنة (مثل: دهن شريحة توست بالجبن، تقشير موزة).',
    targetExample: 'فتح علبة الجبن وفردها على الخبز بسكين زبدة غير حاد وتناولها باستقلالية تامة.',
  },

  // 2. Dressing & Grooming (dressing)
  {
    id: 'ls6',
    subscaleId: 'dressing',
    text: 'يرتدي قميصه وفنيلته وبنطاله بصورة صحيحة وفي الاتجاه الأمامي المناسب.',
    targetExample: 'إدخال الرأس والذراعين في فتحات القميص ومطابقة الوجه الأمامي مع الصدر.',
  },
  {
    id: 'ls7',
    subscaleId: 'dressing',
    text: 'يخلع ملابسه الخارجية عند العودة إلى المنزل ويضعها في مكانها أو في سلة الغسيل.',
    targetExample: 'نزع المعطف والبنطال ووضع المتسخ منها في السلة وتعليق الملابس النظيفة.',
  },
  {
    id: 'ls8',
    subscaleId: 'dressing',
    text: 'يقفل ويفتح الأزرار المتوسطة وسحابات السترات والبنطال باستقلالية.',
    targetExample: 'تشبيك طرفي سحاب المعطف من الأسفل وسحبه بسلاسة حتى الأعلى دون توقف.',
  },
  {
    id: 'ls9',
    subscaleId: 'dressing',
    text: 'يرتدي الجوارب والحذاء بالقدم الصحيحة (اليمنى في اليمنى واليسرى في اليسرى).',
    targetExample: 'سحب الجورب فوق الكعب وتثبيت شريط الفيلكرو بالحذاء بإحكام دون انزلاق.',
  },
  {
    id: 'ls10',
    subscaleId: 'dressing',
    text: 'يميز بين أنواع الملابس الملائمة لمختلف المناسبات وحالات الطقس (صيف/شتاء، نوم/خروج).',
    targetExample: 'اختيار سترة دافئة عند الخروج في يوم بارد دون الحاجة لفرض الملابس من الوالدين.',
  },

  // 3. Personal Hygiene (hygiene)
  {
    id: 'ls11',
    subscaleId: 'hygiene',
    text: 'يستخدم دورة المياه لقضاء الحاجة بمفرده مع مراعاة الخصوصية والنظافة التامة.',
    targetExample: 'إغلاق باب الحمام وقضاء حاجته واستخدام الماء للتطهير وارتداء ملابسه بنظافة.',
  },
  {
    id: 'ls12',
    subscaleId: 'hygiene',
    text: 'يغسل يديه ووجهه بالماء والصابون بطريقة فرك صحيحة ويجففهما بالمنشفة.',
    targetExample: 'فرك الكفين وظهر اليدين بالرغوة ثم شطفهما بالماء النظيف والتجفيف بالمنشفة المخصصة.',
  },
  {
    id: 'ls13',
    subscaleId: 'hygiene',
    text: 'ينظف أسنانه بالفرشاة والمعجون بأسلوب صحيح ويتمضمض ويبصق الماء.',
    targetExample: 'تفريش الأسنان لمدة دقيقة كاملة مع تنظيف القواطع والأضراس ثم شطف الفم.',
  },
  {
    id: 'ls14',
    subscaleId: 'hygiene',
    text: 'يمشط شعره أمام المرآة ويهتم بمظهره الشخصي المرتب قبل الخروج.',
    targetExample: 'استخدام المشط لتسريح شعره بشكل لائق وإزالة أي أوساخ عالقة على وجهه.',
  },
  {
    id: 'ls15',
    subscaleId: 'hygiene',
    text: 'يستخدم المناديل الورقية لتنظيف أنفه عند العطس أو الرشح ويتخلص منها في سلة المهملات.',
    targetExample: 'سحب منديل وتغطية الأنف والفم أثناء العطس ثم إلقاء المنديل المستخدم في السلة وغسل يديه.',
  },

  // 4. Safety & Risk Prevention (safety)
  {
    id: 'ls16',
    subscaleId: 'safety',
    text: 'يتجنب العبث بالأجهزة الكهربائية والمقابس والأسلاك المكشوفة وأدوات التدفئة.',
    targetExample: 'الامتناع التام عن إدخال أي جسم في مقبس الكهرباء والابتعاد عن المدفأة المشتعلة.',
  },
  {
    id: 'ls17',
    subscaleId: 'safety',
    text: 'يمتنع عن تناول أي أدوية أو مواد كيميائية أو منظفات منزلية دون إشراف الوالدين.',
    targetExample: 'عدم شرب السوائل المجهولة وسؤال البالغين قبل تناول أي قرص دوائي.',
  },
  {
    id: 'ls18',
    subscaleId: 'safety',
    text: 'ينتبه للمشاة وحركة السيارات وينظر يميناً ويساراً قبل عبور الشارع برفقة ذويه.',
    targetExample: 'الوقوف على خط المشاة والتأكد من توقف المركبات تماماً قبل وضع القدم على الطريق.',
  },
  {
    id: 'ls19',
    subscaleId: 'safety',
    text: 'يحفظ اسمه الكامل واسم والده ورقم هاتف الطوارئ للتواصل عند الحاجة.',
    targetExample: 'ترديد اسمه الرباعي ورقم جوال والدته بدقة واطمئنان عند سؤاله من قبل المشرف.',
  },
  {
    id: 'ls20',
    subscaleId: 'safety',
    text: 'يطلب المساعدة من رجال الأمن أو موظفي الاستقبال إذا ضل طريقه في مجمع تجاري.',
    targetExample: 'التوجه إلى نقطة أمنية مألوفة والإبلاغ بهدوء: "أنا أضعت أمي ورقم هاتفها كذا".',
  },

  // 5. Community & Independence (community)
  {
    id: 'ls21',
    subscaleId: 'community',
    text: 'يرتب سريره وينظم ألعابه وكتبه المدرسية في أماكنها المخصصة داخل غرفته.',
    targetExample: 'فرد الملاءة والوسادة بعد الاستيقاظ وإعادة الكتب على الرف بعد إتمام الواجبات.',
  },
  {
    id: 'ls22',
    subscaleId: 'community',
    text: 'يحمل حقيبته وأمتعته الخاصة بنفسه أثناء الذهاب والعودة من المركز أو المدرسة.',
    targetExample: 'حمل حقيبة الظهر على الكتفين والمشي بثبات دون رميها أو التذمر المستمر.',
  },
  {
    id: 'ls23',
    subscaleId: 'community',
    text: 'يتعامل مع النقود الورقية والمعدنية ويشتري طلباً بسيطاً من المقصف أو البقالة.',
    targetExample: 'تسليم البائع 5 ريالات لشراء بسكويت ومقارنة المبلغ المسترد واستلام الباقي.',
  },
  {
    id: 'ls24',
    subscaleId: 'community',
    text: 'يلتزم بقواعد الانتظار في الطابور والهدوء في الأماكن العامة كالمصعد والمستشفى.',
    targetExample: 'الوقوف في صف المقصف دون تجاوز زملائه وخفض الصوت أثناء التواجد في العيادة.',
  },
  {
    id: 'ls25',
    subscaleId: 'community',
    text: 'يساعد في المهام المنزلية البسيطة (مثل: مسح الطاولة، التخلص من كيس القمامة، سقي النبات).',
    targetExample: 'حمل كيس المهملات الصغير وإلقائه في الحاوية الخارجية ثم غسل اليدين فوراً.',
  },
];

export function calculateLifeSkillsScore(answers = {}) {
  const answeredKeys = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null);
  const totalAnswered = answeredKeys.length;
  const totalItems = LIFE_SKILLS_ITEMS.length;

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
        { label: 'مؤشر الاستقلالية الكلي', value: '—', sub: 'في انتظار الرصد', color: 'var(--text-sub)' },
        { label: 'نسبة الإتقان المستقل', value: '—', sub: 'غير محسوب', color: 'var(--text-sub)' },
        { label: 'مستوى الرعاية الذاتية', value: 'في الانتظار', sub: '0 بند مجاب', color: 'var(--text-sub)' },
      ],
      summary: 'في انتظار البدء بالتقييم - يرجى تقييم مهارات تناول الطعام والملابس والنظافة الشخصية والسلامة والمجتمع.',
      recommendations: 'سيتم تحديد خطة التدريب على المهارات الحياتية والاستقلالية فور إدخال الاستجابات.',
    };
  }

  const domainScores = { feeding: 0, dressing: 0, hygiene: 0, safety: 0, community: 0 };
  const domainAnswered = { feeding: 0, dressing: 0, hygiene: 0, safety: 0, community: 0 };
  let totalRawScore = 0;

  LIFE_SKILLS_ITEMS.forEach(it => {
    const val = Number(answers[it.id]);
    if (!isNaN(val) && answers[it.id] !== undefined && answers[it.id] !== null) {
      domainScores[it.subscaleId] = (domainScores[it.subscaleId] || 0) + val;
      domainAnswered[it.subscaleId] = (domainAnswered[it.subscaleId] || 0) + 1;
      totalRawScore += val;
    }
  });

  const maxPossible = totalItems * 3; // 25 * 3 = 75
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  // Convert to Standard Scaled Score (M=100, SD=15)
  const standardScore = Math.round(50 + (percentage * 0.8));

  let level = 'استقلالية عالية وكفاية ذاتية ممتازة';
  let severityKey = 'normal';
  let severityColor = '#059669';

  if (percentage < 40) {
    level = 'قصور استقلالي حاد (اعتماد شبه كامل على الآخرين)';
    severityKey = 'severe';
    severityColor = '#dc2626';
  } else if (percentage < 60) {
    level = 'استقلالية جزئية محدودة (يحتاج لتدريب مكثف على العناية بالذات)';
    severityKey = 'moderate';
    severityColor = '#ea580c';
  } else if (percentage < 80) {
    level = 'استقلالية متوسطة نامية (يحتاج إشرافاً وتذكيراً بسيطاً)';
    severityKey = 'mild';
    severityColor = '#d97706';
  } else {
    level = 'استقلالية عالية ممتازة ومناسبة للمرحلة العمرية';
    severityKey = 'strength';
    severityColor = '#059669';
  }

  const completionPercentage = Math.round((totalAnswered / totalItems) * 100);

  const subscaleResults = LIFE_SKILLS_SUBSCALES.map(sub => ({
    id: sub.id,
    name: sub.name,
    rawScore: domainScores[sub.id] || 0,
    maxScore: sub.itemsCount * 3,
    percentage: sub.itemsCount > 0 ? Math.round(((domainScores[sub.id] || 0) / (sub.itemsCount * 3)) * 100) : 0,
    answeredCount: domainAnswered[sub.id] || 0,
    totalCount: sub.itemsCount,
  }));

  const metrics = [
    { label: 'الدرجة الخام الإجمالية', value: `${totalRawScore} / ${maxPossible}`, sub: `نسبة الإتقان: ${percentage}%`, color: severityColor },
    { label: 'مستوى الاستقلالية', value: level.split(' (')[0], sub: 'تصنيف الرعاية الذاتية', color: severityColor },
    { label: 'تناول الطعام', value: `${domainScores.feeding} / 15`, sub: `${Math.round((domainScores.feeding / 15) * 100)}%`, color: '#059669' },
    { label: 'الملابس والمظهر', value: `${domainScores.dressing} / 15`, sub: `${Math.round((domainScores.dressing / 15) * 100)}%`, color: '#0d9488' },
    { label: 'النظافة الشخصية', value: `${domainScores.hygiene} / 15`, sub: `${Math.round((domainScores.hygiene / 15) * 100)}%`, color: '#10b981' },
    { label: 'السلامة والوقاية', value: `${domainScores.safety} / 15`, sub: `${Math.round((domainScores.safety / 15) * 100)}%`, color: '#14b8a6' },
  ];

  return {
    totalAnswered,
    totalItems,
    completionPercentage,
    totalRawScore,
    standardScore,
    percentage,
    level,
    severityKey,
    severityLabel: level,
    severityColor,
    metrics,
    subscaleResults,
    summary: `تم تقييم مهارات الاستقلالية والرعاية الذاتية؛ وحقق المفحوص مجموع درجات خام (${totalRawScore} من أصل ${maxPossible}) بنسبة إتقان (${percentage}%) ومستوى: "${level}".`,
    recommendations: `يوصى بتصميم أهداف خطة الرعاية الذاتية اليومية بناءً على المهارات التي حصل فيها على درجات أقل من (2)، مع تطبيق أسلوب تحليل المهارة وتلاشي المساعدات تدريجياً.`,
  };
}

export const lifeSkillsScaleConfig = {
  id: 'life_skills_scale',
  title: 'قائمة مهارات الاستقلالية والرعاية الذاتية',
  titleEn: 'Self-Independence & Life Skills Assessment Scale',
  icon: '🧰',
  category: 'adaptive_behavior',
  categoryName: 'السلوك التكيفي ومهارات الحياة اليومية',
  themeColor: 'emerald',
  author: 'نخبة من استشاريي التأهيل والعلاج الوظيفي والتربية الخاصة',
  publisher: 'الجمعية العربية للتأهيل المهني والتربوي',
  targetAge: 'من عمر 3 سنوات وحتى مرحلة البلوغ والشباب',
  standardsReference: 'قائمة مقننة مستندة إلى نماذج تحليل السلوك التطبيقي (ABA) ومناهج تنمية مهارات الاعتماد على الذات',
  notice: 'مقياس إكلينيكي عملي لتقييم المهارات الحركية والوظيفية اللازمة للاستقلالية اليومية في المنزل والمدرسة والمجتمع.',
  disclaimer: 'تطبيق هذا المقياس يعتمد على الملاحظة المباشرة لسلوك الطفل وتقارير ولي الأمر والأخصائي المشرف.',
  subscales: LIFE_SKILLS_SUBSCALES,
  items: LIFE_SKILLS_ITEMS,
  options: LIFE_SKILLS_OPTIONS,
  calculateScore: calculateLifeSkillsScore,
};
