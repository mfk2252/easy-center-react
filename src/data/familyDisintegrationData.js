/**
 * مقياس التفكك الأسري (Family Disintegration Scale)
 * إعداد والتقنين: د. عادل العمرو (2007) - سلسلة المقاييس والاختبارات النفسية
 * 
 * المقياس مكون من 26 فقرة تقيس درجة التفكك والتصدع الأسري والضغوط البيئية والعلاقات الأسرية.
 * 
 * التدريج: خماسي (دائماً، غالباً، أحياناً، نادراً، أبداً)
 * 
 * - الفقرات الإيجابية (عكسية بالنسبة للتفكك):
 *   دائماً (1) - غالباً (2) - أحياناً (3) - نادراً (4) - أبداً (5)
 *   أرقام الفقرات: 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16, 20
 * 
 * - الفقرات السلبية (مباشرة بالنسبة للتفكك):
 *   دائماً (5) - غالباً (4) - أحياناً (3) - نادراً (2) - أبداً (1)
 *   أرقام الفقرات: 10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 24, 25, 26
 * 
 * المدى الكلي للدرجات: 26 - 130
 * المتوسط الفرضي: 78 درجة
 * كلما ارتفعت الدرجة دل ذلك على وجود تفكك أسري أكبر.
 */

export const FAMILY_DISINTEGRATION_RESPONSE_OPTIONS = [
  { value: 5, label: 'دائماً', descPos: '1 (تماسك عالي)', descNeg: '5 (تفكك شديد)' },
  { value: 4, label: 'غالباً', descPos: '2 (تماسك جيد)', descNeg: '4 (تفكك ملحوظ)' },
  { value: 3, label: 'أحياناً', descPos: '3 (متوسط)', descNeg: '3 (متوسط)' },
  { value: 2, label: 'نادراً', descPos: '4 (ضعف تماسك)', descNeg: '2 (محدود)' },
  { value: 1, label: 'أبداً', descPos: '5 (انعدام التماسك)', descNeg: '1 (سليم/منعدم)' },
];

export const FAMILY_DISINTEGRATION_DOMAINS = [
  {
    id: 'climate_warmth',
    code: 'CLIM',
    name: 'المناخ الأسري والتفاعل الإيجابي والاهتمام',
    englishName: 'Family Climate, Cohesion & Warmth',
    itemsCount: 12,
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#a7f3d0',
    description: 'يقيس مدى توافر الدفء، الاهتمام المتبادل، الرعاية، التواصل الحممي، والحل السلمي للمشكلات داخل الأسرة.',
  },
  {
    id: 'conflicts_abuse',
    code: 'CONF',
    name: 'النزاعات والعنف الأسري والمشكلات السلوكية',
    englishName: 'Domestic Conflict, Abuse & Behavioral Strain',
    itemsCount: 9,
    color: '#dc2626',
    bgLight: '#fef2f2',
    borderColor: '#fecaca',
    description: 'يقيس انتشار الشتائم، الشجار، الإيذاء الجسدي أو اللفظي، الحرمان الوجداني، والسلوكيات المنحرفة.',
  },
  {
    id: 'structural_absence',
    code: 'STRUCT',
    name: 'التفكك الهيكلي والغياب والانفصال الوالدي',
    englishName: 'Structural Disintegration & Parental Absence',
    itemsCount: 4,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#ddd6fe',
    description: 'يقيس حالات الهجر والانفصال المؤقت، الطلاق، سجن أحد الوالدين، أو غياب الوالد والعيش بعيداً.',
  },
  {
    id: 'economic_spending',
    code: 'ECON',
    name: 'الاستقرار الاقتصادي والإنفاق الأسري',
    englishName: 'Economic Stability & Family Spending',
    itemsCount: 1,
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    description: 'يقيس مدى الالتزام بالإنفاق على احتياجات الأسرة وتجنب إهدار الموارد على الملذات الخاصة.',
  },
];

export const FAMILY_DISINTEGRATION_ITEMS = [
  {
    id: 'fam_1',
    num: 1,
    text: 'يهتم أهلي بمطالبي',
    domainId: 'climate_warmth',
    isReverse: true, // إيجابي: دائماً=1, غالباً=2, أحياناً=3, نادراً=4, أبداً=5
    dimension: 'الاهتمام والرعاية',
  },
  {
    id: 'fam_2',
    num: 2,
    text: 'تهتم أسرتي بأصدقائي',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'الاهتمام بالعلاقات الاجتماعية',
  },
  {
    id: 'fam_3',
    num: 3,
    text: 'تهتم أسرتي بمشاكلي',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'الدعم النفسي وحل المشكلات',
  },
  {
    id: 'fam_4',
    num: 4,
    text: 'تهتم أسرتي بمشاعري',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'الدفء والتعاطف الوجداني',
  },
  {
    id: 'fam_5',
    num: 5,
    text: 'أسعى جاهدا لإرضاء والدي',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'الدافعية والارتباط الوالدي',
  },
  {
    id: 'fam_6',
    num: 6,
    text: 'يعاملني والدي كصديق',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'أسلوب المعاملة الوالدية الديمقراطي',
  },
  {
    id: 'fam_7',
    num: 7,
    text: 'العلاقة بين أفراد أسرتي حميمة',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'التماسك والترابط الأسري',
  },
  {
    id: 'fam_8',
    num: 8,
    text: 'تذهب أسرتي لزيارة الأقارب معاً',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'الأنشطة الأسرية المشتركة وصلة الرحم',
  },
  {
    id: 'fam_9',
    num: 9,
    text: 'يتبادل أفراد أسرتي الهدايا',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'التعبير عن المودة والتقدير',
  },
  {
    id: 'fam_10',
    num: 10,
    text: 'يتبادل أفراد أسرتي الشتائم',
    domainId: 'conflicts_abuse',
    isReverse: false, // سلبي: دائماً=5, غالباً=4, أحياناً=3, نادراً=2, أبداً=1
    dimension: 'العنف اللفظي والإهانة',
  },
  {
    id: 'fam_11',
    num: 11,
    text: 'يضرب والدي والدتي',
    domainId: 'conflicts_abuse',
    isReverse: false,
    dimension: 'العنف الأسري بين الزوجين',
  },
  {
    id: 'fam_12',
    num: 12,
    text: 'تحل المشاكل بطرق سلمية في الأسرة',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'إدارة النزاعات الإيجابية',
  },
  {
    id: 'fam_13',
    num: 13,
    text: 'ارتكب أحد أفراد الأسرة مخالفات قانونية',
    domainId: 'conflicts_abuse',
    isReverse: false,
    dimension: 'الجنوح والمخالفات القانونية',
  },
  {
    id: 'fam_14',
    num: 14,
    text: 'سبق وتركت المنزل وأقمت خارجه',
    domainId: 'conflicts_abuse',
    isReverse: false,
    dimension: 'الهروب والنفور من المنزل',
  },
  {
    id: 'fam_15',
    num: 15,
    text: 'أشعر أن أسرتي غير متماسكة',
    domainId: 'conflicts_abuse',
    isReverse: false,
    dimension: 'الإدراك الذاتي للتصدع الأسري',
  },
  {
    id: 'fam_16',
    num: 16,
    text: 'تثق أسرتي بي',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'الثقة المتبادلة والتمكين',
  },
  {
    id: 'fam_17',
    num: 17,
    text: 'أشعر بأنني بحاجة إلى عطف وتشجيع والدي',
    domainId: 'conflicts_abuse',
    isReverse: false,
    dimension: 'الحرمان العاطفي والاحتياج الوجداني',
  },
  {
    id: 'fam_18',
    num: 18,
    text: 'يشتمني والدي كثيراً',
    domainId: 'conflicts_abuse',
    isReverse: false,
    dimension: 'الإساءة اللفظية الوالدية',
  },
  {
    id: 'fam_19',
    num: 19,
    text: 'يعاقبني والدي بالضرب دون ذنب يذكر',
    domainId: 'conflicts_abuse',
    isReverse: false,
    dimension: 'العقاب البدني الجائر والإيذاء',
  },
  {
    id: 'fam_20',
    num: 20,
    text: 'تراجع أسرتي دروسي',
    domainId: 'climate_warmth',
    isReverse: true,
    dimension: 'المتابعة التعليمية والاهتمام الأكاديمي',
  },
  {
    id: 'fam_21',
    num: 21,
    text: 'يحدث شجار بين أفراد أسرتي',
    domainId: 'conflicts_abuse',
    isReverse: false,
    dimension: 'الشجار والنزاعات المتكررة',
  },
  {
    id: 'fam_22',
    num: 22,
    text: 'حدث انفصال مؤقت (هجر) بين والدي',
    domainId: 'structural_absence',
    isReverse: false,
    dimension: 'التفكك الجزئي والهجر الزوجي',
  },
  {
    id: 'fam_23',
    num: 23,
    text: 'والدتي مطلقة',
    domainId: 'structural_absence',
    isReverse: false,
    dimension: 'التفكك الكلي بالطلاق',
  },
  {
    id: 'fam_24',
    num: 24,
    text: 'والدي يعيش بعيداً عن الأسرة',
    domainId: 'structural_absence',
    isReverse: false,
    dimension: 'الغياب الفيزيائي للوالد',
  },
  {
    id: 'fam_25',
    num: 25,
    text: 'أحد والدي يقضي عقوبة في السجن',
    domainId: 'structural_absence',
    isReverse: false,
    dimension: 'غياب الوالدين القسري / السجن',
  },
  {
    id: 'fam_26',
    num: 26,
    text: 'ينفق والدي جزء كبير من دخل الأسرة على ملذاته الخاصة',
    domainId: 'economic_spending',
    isReverse: false,
    dimension: 'الإنفاق الأناني والإهمال الاقتصادي',
  },
];

/**
 * دالة حساب درجات مقياس التفكك الأسري
 * @param {Object} rawResponses خريطة الإجابات { fam_1: 1..5, fam_2: 1..5, ... }
 * @returns {Object} نتائج التحليل الإحصائي والتفسير الإكلينيكي
 */
export function calculateFamilyDisintegrationScore(rawResponses = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;
  
  const domainScores = {
    climate_warmth: { raw: 0, count: 0, max: 60 },
    conflicts_abuse: { raw: 0, count: 0, max: 45 },
    structural_absence: { raw: 0, count: 0, max: 20 },
    economic_spending: { raw: 0, count: 0, max: 5 },
  };

  const itemDetails = [];

  FAMILY_DISINTEGRATION_ITEMS.forEach(it => {
    const rawVal = rawResponses[it.id];
    let calculatedItemScore = null;

    if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
      const numVal = Number(rawVal);
      answeredCount++;

      // إذا كانت الفقرة إيجابية (عكسية بالنسبة للتفكك)
      if (it.isReverse) {
        // إذا اختار دائماً (1) تكون درجة التفكك 1
        // إذا اختار غالباً (2) تكون درجة التفكك 2
        // إذا اختار أحياناً (3) تكون درجة التفكك 3
        // إذا اختار نادراً (4) تكون درجة التفكك 4
        // إذا اختار أبداً (5) تكون درجة التفكك 5
        calculatedItemScore = numVal;
      } else {
        // إذا كانت الفقرة سلبية (مباشرة بالنسبة للتفكك)
        // دائماً (5) = 5
        // غالباً (4) = 4
        // أحياناً (3) = 3
        // نادراً (2) = 2
        // أبداً (1) = 1
        calculatedItemScore = numVal;
      }

      totalRawScore += calculatedItemScore;

      if (domainScores[it.domainId]) {
        domainScores[it.domainId].raw += calculatedItemScore;
        domainScores[it.domainId].count++;
      }
    }

    itemDetails.push({
      ...it,
      rawSelection: rawVal,
      calculatedScore: calculatedItemScore,
      isDeficient: calculatedItemScore !== null && calculatedItemScore >= 4, // درجة خطر تفكك
    });
  });

  const isComplete = answeredCount === FAMILY_DISINTEGRATION_ITEMS.length;
  const theoreticalMean = 78; // المتوسط الفرضي (26 * 3)
  const minPossible = 26;
  const maxPossible = 130;

  // نسبة التفكك المئوية
  const percentage = Math.round(((totalRawScore - minPossible) / (maxPossible - minPossible)) * 100);

  // التفسير السيكومتري والإكلينيكي لمستوى التفكك
  let level = '';
  let levelCode = '';
  let severityColor = '';
  let interpretation = '';
  let recommendations = [];

  if (totalRawScore <= 52) {
    level = 'تماسك أسري ممتاز / انعدام التفكك الأسري';
    levelCode = 'very_low_disintegration';
    severityColor = '#059669';
    interpretation = 'تشير نتائج المقياس إلى تمتع الأسرة بدرجة عالية جداً من التماسك والترابط والمساندة الوجدانية والمناخ الإيجابي الآمن، مع انعدام مؤشرات التفكك أو العنف أو الإهمال، مما يشكل بيئة مثالية لنمو وتأهيل الطفل.';
    recommendations = [
      'تعزيز واستدامة الممارسات الوالدية الإيجابية والشراكة في الخطة التأهيلية.',
      'إشراك الأسرة كنواة تدريبية مساندة ومشاركة خبراتهم مع الأسر الأخرى.',
      'الحفاظ على بيئة الحوار المنزلي والدعم النفسي المستمر للطفل.'
    ];
  } else if (totalRawScore <= 78) {
    level = 'تفكك أسري منخفض (ضمن الحدود الطبيعية المألوفة)';
    levelCode = 'low_disintegration';
    severityColor = '#0284c7';
    interpretation = 'تقع درجة التفكك الأسري ضمن النطاق الطبيعي المعتاد وأقل من المتوسط الفرضي، حيث تتوفر مقومات الرعاية والتماسك مع وجود بعض الضغوط اليومية الخفيفة التي لا تهدد البنية العامة للأسرة.';
    recommendations = [
      'تقديم نصائح إرشادية حول إدارة ضغوط الحياة اليومية والتواصل الفعال.',
      'تنظيم جلسات تثقيفية دورية لتعزيز الترابط الوالدي والتعامل مع احتياجات الطفل.',
      'متابعة مستوى المتابعة الأكاديمية والمنزلية وتطويرها.'
    ];
  } else if (totalRawScore <= 104) {
    level = 'تفكك أسري متوسط إلى مرتفع (مؤشرات خطر أسري)';
    levelCode = 'moderate_high_disintegration';
    severityColor = '#d97706';
    interpretation = 'تتجاوز الدرجة المتوسط الفرضي بشكل ملحوظ، مما يشير إلى وجود اضطراب وتصدع واضح في المناخ الأسري، أو خلافات متكررة، أو ضعف في الاهتمام والتواصل، أو غياب جزئي، مما يشكل ضغطاً نفسياً يؤثر سلباً على تقدم الطفل في برامجه التأهيلية.';
    recommendations = [
      'إدراج الأسرة في برنامج إرشاد أسري ونفسي مكثف لتعديل أساليب التفاعل وتخفيف التوتر.',
      'توفير خطة دعم منزلي محددة وإرشاد الوالدين لأساليب الحوار وحل المشكلات دون اللجوء للعنف أو الشتائم.',
      'التنسيق مع المرشد النفسي والاجتماعي لمتابعة أثر الأجواء المنزلية على سلوك وأداء الطفل بالمركز.'
    ];
  } else {
    level = 'تفكك أسري حاد وشديد جداً (تصدع نفسي وهيكلي حرج)';
    levelCode = 'severe_disintegration';
    severityColor = '#dc2626';
    interpretation = 'تشير الدرجة المرتفعة جداً إلى تفكك أسري حاد وشديد يتمثل في تصدع العلاقات الوالدية، وجود عنف أو إيذاء، طلاق، هجر، غياب قسري، أو إهمال شديد. هذه البيئة شديدة الخطورة وتعيق استجابة الطفل للتأهيل وتستدعي تدخلاً حاسماً ودعماً شاملاً.';
    recommendations = [
      'تدخل إرشادي واجتماعي طارئ ومكثف لتوفير بيئة حماية ورعاية بديلة أو مساندة للطفل.',
      'تقديم جلسات تفريغ انفعالي ودعم نفسي فردي مباشر للطفل للحد من آثار الصدمات الأسرية.',
      'التنسيق مع الجهات الاجتماعية والمؤسسات الداعمة لتأمين الاستقرار والرعاية الأساسية.',
      'تكييف الأهداف التربوية والتأهيلية لتراعي الضغوط النفسية الحادة التي يمر بها المفحوص.'
    ];
  }

  // مصفوفة الأبعاد الفرعية
  const subscales = FAMILY_DISINTEGRATION_DOMAINS.map(dom => {
    const dScore = domainScores[dom.id] || { raw: 0, count: 0, max: 10 };
    const minDom = dom.itemsCount; // أدنى درجة ممكنة (1 في كل بند)
    const maxDom = dom.itemsCount * 5; // أقصى درجة ممكنة (5 في كل بند)
    const domPct = Math.round(((dScore.raw - minDom) / (maxDom - minDom)) * 100) || 0;

    let domLevel = 'طبيعي';
    let domColor = '#059669';
    if (domPct > 70) {
      domLevel = 'تفكك حاد';
      domColor = '#dc2626';
    } else if (domPct > 45) {
      domLevel = 'تفكك ملحوظ';
      domColor = '#d97706';
    } else if (domPct > 25) {
      domLevel = 'تفكك طفيف';
      domColor = '#0284c7';
    }

    return {
      id: dom.id,
      code: dom.code,
      name: dom.name,
      englishName: dom.englishName,
      itemsCount: dom.itemsCount,
      raw: dScore.raw,
      minRaw: minDom,
      maxRaw: maxDom,
      percentage: Math.max(0, Math.min(100, domPct)),
      level: domLevel,
      color: domColor,
      description: dom.description,
    };
  });

  return {
    isComplete,
    answeredCount,
    totalItems: FAMILY_DISINTEGRATION_ITEMS.length,
    totalRawScore,
    minPossible,
    maxPossible,
    theoreticalMean,
    percentage,
    level,
    levelCode,
    severityColor,
    interpretation,
    recommendations,
    subscales,
    itemDetails,
  };
}
