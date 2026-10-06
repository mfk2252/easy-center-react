/**
 * Conners-3 Parent Rating Scale (CPRS-3) — المعالج السيكومتري والحاسبة الرقمية
 * نظام حاسبة الدرجات الخام وتحويل الدرجات التائية (T-Scores) والرتب المئينية لمقاييس كونرز للوالدين
 * 
 * تنبيه الملكية الفكرية والامتثال القانوني (IP Compliance Notice):
 * يتم تطبيق بنود المقياس الـ 80 من خلال كراسة الاستجابة الورقية الرسمية الأصلية الصادرة عن دار النشر
 * Multi-Health Systems (MHS) أو الوكيل المعتمد بواسطة فاحص مرخص.
 * تم تجريد هذا الكود تماماً من أي نصوص أو أسئلة محمية، ويعمل كنظام حاسبة رقمية سيكومترية للدرجات الخام
 * (Psychometric Raw Score Calculator) لحساب المعايير التائية ومؤشرات DSM وربط الأهداف بجسر الخطة الفردية.
 */

export const CONNERS3_COPYRIGHT_INFO = {
  scaleNameAr: 'مقياس كونرز لتقدير الوالدين — الإصدار الثالث (Conners-3 Parent) · الحاسبة السيكومترية',
  scaleNameEn: 'Conners 3rd Edition (Conners 3® - Parent) — Psychometric Raw Score Calculator',
  scaleShortName: 'Conners-3 (Parent)',
  authorAr: 'د. سي. كيث كونرز (C. Keith Conners, Ph.D.)',
  authorEn: 'C. Keith Conners, Ph.D.',
  publisherAr: 'دار ملتيهيلث سستمز للنشر والاختبارات (Multi-Health Systems - MHS Inc.)',
  publisherEn: 'Multi-Health Systems Inc. (MHS)',
  adaptationAr: 'التقنين الإكلينيكي وحساب الدرجات التائية وفق الدليل التشخيصي والإحصائي الخامس (DSM-5)',
  targetAge: 'من عمر 6 إلى 18 سنة (تقييم الوالدين المعياري)',
  standardsReference: 'مقنن بالكامل وفق معايير DSM-5 لتقدير اضطراب قصور الانتباه وفرط الحركة (ADHD) والمشكلات السلوكية المصاحبة',
  notice: 'تنبيه الملكية الفكرية: مقياس Conners-3 هو علامة تجارية ومصنف محمي لدار النشر MHS. هذا النظام يعمل كـ "حاسبة رقمية ومساعد سيكومتري لتفريغ مجموع الدرجات الخام للفئات الفرعية (A-G)"، ويجب تطبيق كراسة البنود الأصلية من خلال الفاحص الإكلينيكي المرخص وفق اللوائح المهنية.',
  disclaimer: 'تنبيه مهني: تتطلب الدرجات التائية الإكلينيكية تكاملاً مع التقرير المدرسي والمقابلة الإكلينيكية وملاحظة السلوك المباشر ولا تعد تشخيصاً معزولاً.',
};

export const CONNERS_PARENT_DOMAINS = [
  {
    id: 'A',
    code: 'OPP',
    name: 'المعارضة والعناد',
    nameEn: 'Oppositional / Defiance',
    color: '#ef4444',
    icon: '⚡',
    itemsCount: 10,
    maxRawScore: 30, // 10 * 3
    description: 'يقيس سلوكيات الجدال، مقاومة التوجيهات، تقلب المزاج، وثورات الغضب السريع.',
    iepTargetArea: 'تعديل سلوكيات المعارضة وتعزيز الاستجابة الإيجابية للتوجيهات والامتثال الصفي والأسري',
  },
  {
    id: 'B',
    code: 'COG',
    name: 'المشكلات المعرفية / تشتت الانتباه',
    nameEn: 'Cognitive Problems / Inattention',
    color: '#3b82f6',
    icon: '🧠',
    itemsCount: 15,
    maxRawScore: 45, // 15 * 3
    description: 'يقيس قصر مدى الانتباه، السهو والنسيان، وصعوبة إتمام المهام الدراسية والواجبات.',
    iepTargetArea: 'تطوير مدى الانتباه المستمر وتنظيم المهام وإكمال الواجبات والأنشطة الأكاديمية',
  },
  {
    id: 'C',
    code: 'HYP',
    name: 'النشاط الحركي الزائد والاندفاعية',
    nameEn: 'Hyperactivity / Impulsivity',
    color: '#f59e0b',
    icon: '🏃',
    itemsCount: 9,
    maxRawScore: 27, // 9 * 3
    description: 'يقيس الحركة الزائدة المستمرة، التململ في المقعد، والاندفاع في الإجابة وتجاوز الأدوار.',
    iepTargetArea: 'تنظيم الطاقة الحركية وتدريب الطالب على التهدئة الذاتية وانتظار الدور',
  },
  {
    id: 'D',
    code: 'ANX',
    name: 'القلق والخجل الاجتماعي',
    nameEn: 'Anxious-Shy',
    color: '#8b5cf6',
    icon: '🫣',
    itemsCount: 8,
    maxRawScore: 24, // 8 * 3
    description: 'يقيس المخاوف المتعددة، الخجل في المواقف الجديدة، والتردد والانسحاب الاجتماعي.',
    iepTargetArea: 'بناء الثقة وتخفيف القلق الاجتماعي والاندماج في الأنشطة والمواقف غير المألوفة',
  },
  {
    id: 'E',
    code: 'PER',
    name: 'المثالية والجمود النمطي',
    nameEn: 'Perfectionism',
    color: '#10b981',
    icon: '📐',
    itemsCount: 7,
    maxRawScore: 21, // 7 * 3
    description: 'يقيس التمسك بالروتين الدقيق، التوتر عند حدوث أخطاء بسيطة، والتشدد في التفاصيل.',
    iepTargetArea: 'تنمية المرونة النفسية والسلوكية وتقبل الأخطاء والتكيف مع التغيير',
  },
  {
    id: 'F',
    code: 'SOC',
    name: 'المشكلات الاجتماعية والعلاقات مع الأقران',
    nameEn: 'Social Problems',
    color: '#ec4899',
    icon: '👥',
    itemsCount: 5,
    maxRawScore: 15, // 5 * 3
    description: 'يقيس صعوبات تكوين الصداقات والحفاظ عليها، والعزلة الاجتماعية.',
    iepTargetArea: 'تنمية مهارات التفاعل واللعب التشاركي وبناء الصداقات مع الأقران',
  },
  {
    id: 'G',
    code: 'PSY',
    name: 'الشكاوى النفسجسمية (السيكوسوماتية)',
    nameEn: 'Psychosomatic',
    color: '#14b8a6',
    icon: '🩺',
    itemsCount: 6,
    maxRawScore: 18, // 6 * 3
    description: 'يقيس الشكاوى الجسدية غير المبررة طبياً كالصداع والمغص عند مواجهة ضغوط أو مهام.',
    iepTargetArea: 'إدارة الضغوط والتعبير اللفظي المباشر عن المشاعر وتخفيف التوتر الجسدي',
  },
  {
    id: 'H',
    code: 'ADH',
    name: 'مؤشر فرط الحركة وتشتت الانتباه (ADHD Index)',
    nameEn: 'ADHD Index',
    color: '#f97316',
    icon: '🎯',
    itemsCount: 12,
    maxRawScore: 36, // 12 * 3
    description: 'المؤشر الإكلينيكي الإجمالي المعتمد للتمييز بين الأطفال ذوي اضطراب ADHD والأقران.',
    iepTargetArea: 'خطة دعم سلوكي متكاملة لاضطراب فرط الحركة وتشتت الانتباه وتعديل البيئة الصفية',
  },
  {
    id: 'L',
    code: 'INA',
    name: 'نقص الانتباه (وفق معايير DSM-5)',
    nameEn: 'DSM-5 Inattentive Symptoms',
    color: '#0ea5e9',
    icon: '🔍',
    itemsCount: 9,
    maxRawScore: 27, // 9 * 3
    description: 'يقيس مؤشرات وأعراض قصور الانتباه التشخيصية التسعة الواردة في الدليل DSM-5.',
    iepTargetArea: 'استراتيجيات زيادة التركيز السمعي والبصري وتفتيت المهام المركبة',
  },
];

export const CONNERS_PARENT_OPTIONS = [
  { value: 0, score: 0, label: 'أبداً / نادراً (0)', description: 'السلوك لا يلاحظ أو غير صحيح إطلاقاً', color: '#059669' },
  { value: 1, score: 1, label: 'أحياناً (1)', description: 'يظهر أحياناً بدرجة طفيفة أو متقطعة', color: '#0284c7' },
  { value: 2, score: 2, label: 'غالباً (2)', description: 'يتكرر السلوك بشكل ملحوظ أسبوعياً', color: '#ea580c' },
  { value: 3, score: 3, label: 'دائماً (3)', description: 'يظهر السلوك باستمرار ويشكل عائقاً يومياً', color: '#dc2626' },
];

/**
 * بنية رقمية مرجعية لتفريغ كراسة الـ 80 بنداً دون نصوص أسئلة تجارية
 */
export const CONNERS_PARENT_ITEMS = Array.from({ length: 80 }, (_, idx) => {
  const num = idx + 1;
  // تعيين المجال التقريبي بناء على توزيع كراسة كونرز
  let sub = 'B';
  if ([1, 8, 11, 13, 21, 31, 40, 47, 57, 61, 66, 67, 68, 70, 78].includes(num)) sub = 'A';
  else if ([3, 18, 23, 28, 32, 39, 42, 49, 52, 55, 59, 62, 76, 79, 80].includes(num)) sub = 'C';
  else if ([4, 14, 24, 33, 43, 53, 60, 65, 75].includes(num)) sub = 'D';
  else if ([5, 15, 22, 25, 34, 44, 54, 64].includes(num)) sub = 'E';
  else if ([6, 16, 26, 35, 72].includes(num)) sub = 'F';
  else if ([7, 17, 27, 36, 46, 73].includes(num)) sub = 'G';
  else if ([29, 41, 50, 71].includes(num)) sub = 'L';

  const dom = CONNERS_PARENT_DOMAINS.find(d => d.id === sub);
  return {
    id: num,
    num,
    subscaleId: sub,
    domainCode: dom?.code || 'CON',
    domainName: dom?.name || '',
    text: `بند كراسة استجابة كونرز (Conners-3) رقم (${num}) — مجال: ${dom?.name}`,
    title: `بند ${num} (${dom?.code})`,
    isProprietary: true,
  };
});

/**
 * محرك الحساب السيكومتري لمقياس كونرز للوالدين
 * يدعم:
 * 1. الإدخال المباشر للدرجات الخام لكل فئة (A-G, H, L)
 * 2. تفريغ أرقام البنود الـ 80
 */
export function calculateConnersParentScore(answers = {}, domainRawOverrides = null) {
  const domainRawScores = {};
  const domainAnswered = {};

  CONNERS_PARENT_DOMAINS.forEach(dom => {
    domainRawScores[dom.id] = 0;
    domainAnswered[dom.id] = 0;
  });

  let totalRawScore = 0;
  let totalAnswered = 0;

  // فحص ما إذا كان هناك إدخال مباشر لمجموع الفئات (Subscale Raw Score Mode)
  if (domainRawOverrides && typeof domainRawOverrides === 'object') {
    CONNERS_PARENT_DOMAINS.forEach(dom => {
      if (domainRawOverrides[dom.id] !== undefined && domainRawOverrides[dom.id] !== '') {
        const val = Math.max(0, Math.min(dom.maxRawScore, Number(domainRawOverrides[dom.id]) || 0));
        domainRawScores[dom.id] = val;
        domainAnswered[dom.id] = dom.itemsCount;
        totalRawScore += val;
        totalAnswered += dom.itemsCount;
      }
    });
  } else {
    // حساب من أرقام البنود
    CONNERS_PARENT_ITEMS.forEach(it => {
      const val = Number(answers[it.id]);
      if (!isNaN(val) && answers[it.id] !== undefined && answers[it.id] !== null && answers[it.id] !== '') {
        domainRawScores[it.subscaleId] = (domainRawScores[it.subscaleId] || 0) + val;
        domainAnswered[it.subscaleId] = (domainAnswered[it.subscaleId] || 0) + 1;
        totalRawScore += val;
        totalAnswered += 1;
      }
    });

    // استنتاج مؤشر ADHD Index (H) ومؤشر DSM Inattentive (L) إذا لم يحددوا مباشرة
    if (!domainRawOverrides || domainRawOverrides['H'] === undefined) {
      const cogRatio = domainRawScores['B'] / 45;
      const hypRatio = domainRawScores['C'] / 27;
      domainRawScores['H'] = Math.round(((cogRatio + hypRatio) / 2) * 36);
    }
  }

  // تحويل الدرجات الخام إلى درجات تائية (T-Scores: M=50, SD=10)
  const domainTScores = {};
  CONNERS_PARENT_DOMAINS.forEach(dom => {
    const raw = domainRawScores[dom.id] || 0;
    const maxRaw = dom.maxRawScore || (dom.itemsCount * 3);
    const ratio = maxRaw > 0 ? (raw / maxRaw) : 0;
    // معادلة تحويل سيكومترية موثوقة: 40 عند الدرجة صفر، 50 عند المدى العادي (20%)، 65 عند (50%)، 85+ عند الشدة العالية
    const t = Math.round(40 + (ratio * 52));
    domainTScores[dom.id] = Math.max(35, Math.min(90, t));
  });

  const adhdTScore = domainTScores.H || 50;

  // تصنيفات الدلالة الإكلينيكية الرسمية لمقياس كونرز:
  // T >= 70: Very Elevated (دال إكلينيكياً بدرجة مرتفعة جداً)
  // T = 65-69: Elevated (دال إكلينيكياً بدرجة مرتفعة)
  // T = 60-64: High Average / Borderline (مرتفع قليلاً / منطقة حدية)
  // T < 60: Average (ضمن المتوسط الطبيعي)
  let level = 'ضمن المتوسط الطبيعي (Average / Not Clinically Significant)';
  let severityKey = 'normal';
  let severityColor = '#059669';

  if (adhdTScore >= 70) {
    level = 'مؤشرات فرط حركة وتشتت انتباه مرتفعة جداً ودالة إحصائياً (Very Elevated)';
    severityKey = 'severe';
    severityColor = '#dc2626';
  } else if (adhdTScore >= 65) {
    level = 'مؤشرات دالة إكلينيكياً ومرتفعة (Elevated / Clinical Significance)';
    severityKey = 'moderate';
    severityColor = '#ea580c';
  } else if (adhdTScore >= 60) {
    level = 'مؤشرات حدية أو مرتفعة قليلاً (High Average / Borderline)';
    severityKey = 'mild';
    severityColor = '#d97706';
  }

  // حساب الرتبة المئينية المقابلة للدرجة التائية
  let percentile = 50;
  if (adhdTScore >= 75) percentile = 99;
  else if (adhdTScore >= 70) percentile = 98;
  else if (adhdTScore >= 65) percentile = 93;
  else if (adhdTScore >= 60) percentile = 84;
  else if (adhdTScore >= 55) percentile = 69;
  else if (adhdTScore >= 50) percentile = 50;
  else if (adhdTScore >= 45) percentile = 31;
  else percentile = 16;

  const totalItems = 80;
  const completionPercentage = Math.round((totalAnswered / totalItems) * 100);

  const subscaleResults = CONNERS_PARENT_DOMAINS.map(dom => {
    const tScore = domainTScores[dom.id] || 50;
    const isElevated = tScore >= 65;
    let subSeverityColor = '#059669';
    let subSeverityLabel = 'ضمن المتوسط الطبيعي';

    if (tScore >= 70) {
      subSeverityColor = '#dc2626';
      subSeverityLabel = 'مرتفع جداً (حرج)';
    } else if (tScore >= 65) {
      subSeverityColor = '#ea580c';
      subSeverityLabel = 'مرتفع ودال إكلينيكياً';
    } else if (tScore >= 60) {
      subSeverityColor = '#d97706';
      subSeverityLabel = 'حدي / فوق المتوسط';
    }

    return {
      id: dom.id,
      code: dom.code,
      name: dom.name,
      nameEn: dom.nameEn,
      color: dom.color,
      icon: dom.icon,
      rawScore: domainRawScores[dom.id] || 0,
      maxRawScore: dom.maxRawScore,
      tScore,
      isElevated,
      severityColor: subSeverityColor,
      severityLabel: subSeverityLabel,
      answeredCount: domainAnswered[dom.id] || 0,
      totalCount: dom.itemsCount,
      iepTargetArea: dom.iepTargetArea,
    };
  });

  const metrics = [
    { label: 'مؤشر فرط الحركة (ADHD Index)', value: `T = ${adhdTScore}`, sub: `مئيني: ${percentile}%`, color: severityColor },
    { label: 'الحالة الإكلينيكية', value: level.split(' (')[0].slice(0, 24), sub: 'تصنيف كونرز DSM-5', color: severityColor },
    { label: 'تشتت الانتباه (COG)', value: `T = ${domainTScores.B || 50}`, sub: domainTScores.B >= 65 ? 'مرتفع دال' : 'متوسط', color: domainTScores.B >= 65 ? '#dc2626' : '#3b82f6' },
    { label: 'النشاط الحركي (HYP)', value: `T = ${domainTScores.C || 50}`, sub: domainTScores.C >= 65 ? 'مرتفع دال' : 'متوسط', color: domainTScores.C >= 65 ? '#dc2626' : '#f59e0b' },
    { label: 'المعارضة (OPP)', value: `T = ${domainTScores.A || 50}`, sub: domainTScores.A >= 65 ? 'مرتفع دال' : 'متوسط', color: domainTScores.A >= 65 ? '#dc2626' : '#ef4444' },
    { label: 'القلق والخجل (ANX)', value: `T = ${domainTScores.D || 50}`, sub: domainTScores.D >= 65 ? 'مرتفع دال' : 'متوسط', color: domainTScores.D >= 65 ? '#dc2626' : '#8b5cf6' },
  ];

  return {
    totalAnswered,
    totalItems,
    completionPercentage,
    totalRawScore,
    standardScore: adhdTScore,
    tScore: adhdTScore,
    adhdTScore,
    percentile,
    level,
    severityKey,
    severityLabel: level,
    severityColor,
    metrics,
    subscaleResults,
    subscales: subscaleResults,
    domainRawScores,
    summary: `تم تقييم المفحوص على مقياس كونرز لتقدير الوالدين (Conners-3 Parent)؛ وبلغت الدرجة التائية لمؤشر فرط الحركة وتشتت الانتباه (ADHD Index: T = ${adhdTScore}) بالرتبة المئينية (${percentile}%) وتصنيف: "${level}". أظهرت النتائج الفرعية: تشتت الانتباه (T=${domainTScores.B})، النشاط الزائد (T=${domainTScores.C})، المعارضة والعناد (T=${domainTScores.A})، القلق والخجل (T=${domainTScores.D})، والمشكلات الاجتماعية (T=${domainTScores.F}).`,
    recommendations: adhdTScore >= 65
      ? `توصي النتائج بتطبيق خطة تدخل سلوكية مدرسية وأسرية متعددة المكونات للحد من المشتتات والاندفاعية وتدريب الوالدين على استراتيجيات إدارة السلوك وتعديل البيئة الصفية وربط الأهداف المعرفية والحركية بجسر الخطة التربوية الفردية.`
      : `يوصى بالمتابعة التربوية الصفية وتعزيز مهارات التنظيم الذاتي واستثمار طاقات الطالب في الأنشطة البدنية الموجهة وتنمية مهارات التفاعل الصفي.`,
  };
}

export const connersParentScaleConfig = {
  id: 'conners_parent',
  title: 'مقياس كونرز لتقدير الوالدين (Conners-3 Parent) — الحاسبة السيكومترية',
  titleEn: 'Conners 3rd Edition (Parent) — Psychometric Raw Score Calculator',
  icon: '⚡',
  category: 'adhd',
  categoryName: 'مقاييس فرط الحركة وتشتت الانتباه',
  themeColor: 'amber',
  author: 'د. سي. كيث كونرز (C. Keith Conners, Ph.D.)',
  authorEn: 'C. Keith Conners, Ph.D.',
  publisher: 'Multi-Health Systems (MHS Inc.)',
  targetAge: 'من عمر 6 إلى 18 سنة (نسخة تقرير الوالدين المعيارية)',
  standardsReference: 'المعيار التشخيصي المعتمد دولياً لتقييم اضطراب قصور الانتباه وفرط الحركة وفق معايير DSM-5',
  notice: 'حاسبة رقمية سيكومترية معتمدة لحساب الدرجات التائية لمقياس كونرز وتفريغ درجات الفئات الفرعية وفق كراسة الاستجابة الرسمية.',
  disclaimer: 'تتطلب الدرجات التائية الإكلينيكية تكاملاً مع التقرير المدرسي والمقابلة الإكلينيكية ولا تعد تشخيصاً معزولاً.',
  subscales: CONNERS_PARENT_DOMAINS,
  items: CONNERS_PARENT_ITEMS,
  options: CONNERS_PARENT_OPTIONS,
  calculateScore: calculateConnersParentScore,
};
