/**
 * GARS-3 (Gilliam Autism Rating Scale, Third Edition) — المعالج السيكومتري والحاسبة الرقمية
 * نظام حاسبة الدرجات الخام والتحويل السيكومتري لمعامل التوحد (AQ) والرتب المئينية ومستويات الدعم DSM-5
 * 
 * ملاحظة الملكية الفكرية والامتثال القانوني (IP Compliance Notice):
 * تطبيق بنود المقياس يتم عبر كراسة الاستجابة الورقية الرسمية الأصلية المعتمدة الصادرة عن دار النشر PRO-ED
 * أو عبر الأخصائي المرخص. يوفر هذا النظام محركاً سيكومترياً وحاسبة درجات خام ومعايير رقمية (Raw Score Entry & Scoring Engine).
 * لا يحتوي هذا الكود على نصوص بنود اختبارية محمية بحقوق نشر تجارية.
 */

export const GARS3_COPYRIGHT_INFO = {
  scaleNameAr: 'مقياس جيليام لتقدير اضطراب طيف التوحد — الإصدار الثالث (حاسبة الدرجات السيكومترية)',
  scaleNameEn: 'Gilliam Autism Rating Scale, Third Edition (GARS-3) — Psychometric Scoring Assistant',
  scaleShortName: 'GARS-3',
  authorAr: 'د. جيمس إي. جيليام (James E. Gilliam, Ph.D.)',
  authorEn: 'James E. Gilliam, Ph.D.',
  publisherAr: 'دار برو-إد للنشر والاختبارات النفسية (PRO-ED, Inc. Austin, Texas)',
  publisherEn: 'PRO-ED, Inc.',
  adaptationAr: 'التقنين الإكلينيكي العربي: أخصائي نفسي سامح محمد عرفة (2019) / أ.د. عادل عبدالله محمد وأ. عبير أبو المجد محمد (2020)',
  targetAge: 'من عمر 3 سنوات حتى 22 سنة (الأطفال واليافعين والشباب)',
  standardsReference: 'مقنن بالكامل وفق معايير الدليل التشخيصي والإحصائي الخامس للاضطرابات النفسية (DSM-5)',
  notice: 'تنبيه الملكية الفكرية: مقياس GARS-3 هو علامة تجارية ومصنف محمي لدار النشر PRO-ED. هذا النموذج البرمجي يعمل كـ "حاسبة رقمية ومساعد سيكومتري لتفريغ الدرجات الخام وحساب المعايير"؛ ويجب أن يتم تطبيق كراسة البنود الأصلية من خلال الفاحص الإكلينيكي المرخص وفق اللوائح المهنية.',
  disclaimer: 'تنبيه مهني: يعد مقياس GARS-3 أداة تقدير وسلوكية مقننة تسهم في تقدير احتمالية وشدة التوحد، ويجب أن تتكامل مع التقييم الطبي العصبي الشامل، وملاحظة السلوك المباشر، وتاريخ الحالة النمائي لتأكيد التشخيص وتصميم الخطة التربوية التأهيلية الفردية (IEP).',
};

export const GARS3_RESPONSE_OPTIONS = [
  { value: 0, score: 0, label: 'أبداً (0)', description: 'لم يلاحظ السلوك إطلاقاً على الطفل', hint: 'لم يلاحظ السلوك إطلاقاً على الطفل' },
  { value: 1, score: 1, label: 'نادراً (1)', description: 'يأتي السلوك مرة أو اثنتين في فترات متباعدة', hint: 'يأتي السلوك مرة أو اثنتين في فترات متباعدة' },
  { value: 2, score: 2, label: 'أحياناً (2)', description: 'يأتي بالسلوك ما بين 3 إلى 4 مرات كل 6 ساعات', hint: 'يأتي بالسلوك ما بين 3 إلى 4 مرات كل 6 ساعات' },
  { value: 3, score: 3, label: 'كثيراً جداً (3)', description: 'يأتي بالسلوك من 5 إلى 6 مرات أو أكثر كل 6 ساعات', hint: 'يأتي بالسلوك من 5 إلى 6 مرات أو أكثر كل 6 ساعات' },
];

export const GARS3_DOMAINS = [
  {
    id: 'rb',
    code: 'RB',
    name: 'السلوكيات المقيدة / التكرارية',
    englishName: 'Restricted / Repetitive Behaviors',
    itemsCount: 13,
    maxRawScore: 39, // 13 * 3
    itemRange: [1, 13],
    isCore: true, // Always applied (4 & 6 subscales)
    color: '#ef4444',
    bgLight: '#fef2f2',
    borderColor: '#fca5a5',
    description: 'يقيس السلوكيات النمطية، الاهتمامات المحدودة، والطقوس الحركية المتكررة والحساسيات الحسية.',
    iepTargetArea: 'خفض السلوكيات النمطية وتطوير البدائل الوظيفية والتكامل الحسي',
  },
  {
    id: 'si',
    code: 'SI',
    name: 'التفاعل الاجتماعي',
    englishName: 'Social Interaction',
    itemsCount: 14,
    maxRawScore: 42, // 14 * 3
    itemRange: [14, 27],
    isCore: true, // Always applied (4 & 6 subscales)
    color: '#3b82f6',
    bgLight: '#eff6ff',
    borderColor: '#93c5fd',
    description: 'يقيس التفاعل الاجتماعي، المبادأة باللعب والمحادثات، تكوين الصداقات والتواصل غير اللفظي.',
    iepTargetArea: 'تنمية مهارات التفاعل الاجتماعي واللعب التشاركي والمبادأة مع الأقران',
  },
  {
    id: 'sc',
    code: 'SC',
    name: 'التواصل الاجتماعي',
    englishName: 'Social Communication',
    itemsCount: 9,
    maxRawScore: 27, // 9 * 3
    itemRange: [28, 36],
    isCore: true, // Always applied (4 & 6 subscales)
    color: '#8b5cf6',
    bgLight: '#f5f3ff',
    borderColor: '#c4b5fd',
    description: 'يقيس فهم النوايا والمشاعر الاجتماعية وروح الدعابة والتعبيرات المجازية ونظرية العقل.',
    iepTargetArea: 'تطوير الفهم التداولي للغة وفهم المشاعر والنوايا الاجتماعية',
  },
  {
    id: 'er',
    code: 'ER',
    name: 'الاستجابات العاطفية / الوجدانية',
    englishName: 'Emotional Responses',
    itemsCount: 8,
    maxRawScore: 24, // 8 * 3
    itemRange: [37, 44],
    isCore: true, // Always applied (4 & 6 subscales)
    color: '#f59e0b',
    bgLight: '#fffbeb',
    borderColor: '#fcd34d',
    description: 'يقيس نوبات الغضب، الإحباط السريع، الحساسية للأصوات المرتفعة، ومقاومة التغيير في الروتين.',
    iepTargetArea: 'تنظيم الاستجابات الانفعالية والتدريب على المرونة السلوكية واستراتيجيات التهدئة',
  },
  {
    id: 'cs',
    code: 'CS',
    name: 'الأسلوب / النمط المعرفي',
    englishName: 'Cognitive Style',
    itemsCount: 7,
    maxRawScore: 21, // 7 * 3
    itemRange: [45, 51],
    isCore: false, // For verbal children only (6 subscales)
    color: '#10b981',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    description: 'يقيس الاهتمامات الفكرية المحصورة، الدقة اللفظية الزائدة، والتمسك بالمعاني المادية للكلمات.',
    iepTargetArea: 'توسيع المرونة المعرفية وتنويع الاهتمامات وتعميم المفاهيم التجريدية',
  },
  {
    id: 'ms',
    code: 'MS',
    name: 'الكلام غير الملائم / اللغة اللاتكيفية',
    englishName: 'Maladaptive Speech',
    itemsCount: 7,
    maxRawScore: 21, // 7 * 3
    itemRange: [52, 58],
    isCore: false, // For verbal children only (6 subscales)
    color: '#ec4899',
    bgLight: '#fdf2f8',
    borderColor: '#f472b6',
    description: 'يقيس المصاداة اللفظية (الإيكولاليا)، استخدام الضمائر المعكوسة، ونبرات الصوت غير النمطية.',
    iepTargetArea: 'تعديل المصاداة اللفظية واستخدام الضمائر الصحيحة والنطق الوظيفي الملائم',
  },
];

/**
 * بنية رقمية مرجعية لحفظ التوافق مع محركات IEP دون نصوص أسئلة تجارية محمية
 * كل بند يمثل مؤشراً سلوكياً عاماً مرقماً مطابقاً لتفريغ الكراسة الرسمية
 */
export const GARS3_ITEMS = Array.from({ length: 58 }, (_, idx) => {
  const id = idx + 1;
  const domain = GARS3_DOMAINS.find(d => id >= d.itemRange[0] && id <= d.itemRange[1]);
  return {
    id,
    domainId: domain?.id || 'rb',
    domainCode: domain?.code || 'RB',
    domainName: domain?.name || '',
    text: `بند استجابة كراسة GARS-3 رقم (${id}) — مجال: ${domain?.name}`,
    title: `بند ${id} (${domain?.code})`,
    isProprietary: true,
  };
});

/**
 * جدول (أ) تحويل الدرجات الخام للمقاييس الفرعية إلى درجات معيارية (Scaled Scores 1 - 20) ورتب مئينية
 * مطابق لمعايير الدليل السيكومتري الرسمي
 */
export const RAW_TO_SCALED_TABLE = [
  { scaledScore: 1,  percentile: '<1', rb: null, si: null, sc: null, er: null, cs: null, ms: null },
  { scaledScore: 2,  percentile: '<1', rb: null, si: null, sc: [0, 1], er: null, cs: null, ms: null },
  { scaledScore: 3,  percentile: '1',  rb: null, si: [0, 0], sc: [2, 4], er: [0, 1], cs: null, ms: null },
  { scaledScore: 4,  percentile: '2',  rb: [0, 3], si: [1, 4], sc: [5, 8], er: [2, 4], cs: null, ms: null },
  { scaledScore: 5,  percentile: '3',  rb: [4, 6], si: [5, 8], sc: [9, 11], er: [5, 6], cs: [0, 0], ms: [0, 0] },
  { scaledScore: 6,  percentile: '9',  rb: [7, 9], si: [9, 12], sc: [12, 13], er: [7, 8], cs: [1, 1], ms: [1, 2] },
  { scaledScore: 7,  percentile: '16', rb: [10, 13], si: [13, 15], sc: [14, 16], er: [9, 10], cs: [2, 3], ms: [3, 4] },
  { scaledScore: 8,  percentile: '25', rb: [14, 16], si: [16, 19], sc: [17, 18], er: [11, 12], cs: [4, 6], ms: [5, 5] },
  { scaledScore: 9,  percentile: '37', rb: [17, 19], si: [20, 23], sc: [19, 21], er: [13, 14], cs: [7, 8], ms: [6, 7] },
  { scaledScore: 10, percentile: '50', rb: [20, 22], si: [24, 27], sc: [22, 23], er: [15, 16], cs: [9, 10], ms: [8, 9] },
  { scaledScore: 11, percentile: '63', rb: [23, 26], si: [28, 30], sc: [24, 25], er: [17, 18], cs: [11, 13], ms: [10, 11] },
  { scaledScore: 12, percentile: '75', rb: [27, 29], si: [31, 34], sc: [26, 27], er: [19, 20], cs: [14, 15], ms: [12, 13] },
  { scaledScore: 13, percentile: '84', rb: [30, 32], si: [35, 38], sc: null, er: [21, 22], cs: [16, 17], ms: [14, 15] },
  { scaledScore: 14, percentile: '91', rb: [33, 36], si: [39, 42], sc: null, er: [23, 24], cs: [18, 19], ms: [16, 16] },
  { scaledScore: 15, percentile: '95', rb: [37, 39], si: null, sc: null, er: null, cs: [20, 21], ms: [17, 18] },
  { scaledScore: 16, percentile: '98', rb: null, si: null, sc: null, er: null, cs: null, ms: [19, 20] },
  { scaledScore: 17, percentile: '99', rb: null, si: null, sc: null, er: null, cs: null, ms: [21, 21] },
  { scaledScore: 18, percentile: '>99', rb: null, si: null, sc: null, er: null, cs: null, ms: null },
  { scaledScore: 19, percentile: '>99', rb: null, si: null, sc: null, er: null, cs: null, ms: null },
  { scaledScore: 20, percentile: '>99', rb: null, si: null, sc: null, er: null, cs: null, ms: null },
];

/**
 * جدول (ب) تحويل مجموع الدرجات المعيارية إلى معامل التوحد والرتب المئينية الكلية
 */
export const SUM_SCALED_TO_AQ_TABLE = [
  { aq: 140, sum6: 87, sum4: null, percentile: '>99' },
  { aq: 139, sum6: 86, sum4: null, percentile: '>99' },
  { aq: 137, sum6: 85, sum4: null, percentile: '>99' },
  { aq: 136, sum6: 84, sum4: null, percentile: '>99' },
  { aq: 134, sum6: 83, sum4: null, percentile: '99' },
  { aq: 133, sum6: 82, sum4: null, percentile: '99' },
  { aq: 131, sum6: 81, sum4: null, percentile: '99' },
  { aq: 130, sum6: 80, sum4: null, percentile: '98' },
  { aq: 128, sum6: 79, sum4: null, percentile: '98' },
  { aq: 127, sum6: 78, sum4: null, percentile: '97' },
  { aq: 126, sum6: null, sum4: 55, percentile: '96' },
  { aq: 125, sum6: 77, sum4: 54, percentile: '95' },
  { aq: 124, sum6: 76, sum4: null, percentile: '95' },
  { aq: 123, sum6: null, sum4: 53, percentile: '94' },
  { aq: 122, sum6: 75, sum4: null, percentile: '93' },
  { aq: 121, sum6: 74, sum4: 52, percentile: '92' },
  { aq: 120, sum6: 73, sum4: null, percentile: '91' },
  { aq: 119, sum6: null, sum4: 51, percentile: '90' },
  { aq: 118, sum6: 72, sum4: 50, percentile: '89' },
  { aq: 117, sum6: 71, sum4: null, percentile: '87' },
  { aq: 116, sum6: null, sum4: 49, percentile: '86' },
  { aq: 115, sum6: 70, sum4: null, percentile: '84' },
  { aq: 114, sum6: 69, sum4: 48, percentile: '82' },
  { aq: 112, sum6: 68, sum4: 47, percentile: '79' },
  { aq: 111, sum6: 67, sum4: 46, percentile: '77' },
  { aq: 109, sum6: 66, sum4: 45, percentile: '73' },
  { aq: 108, sum6: 65, sum4: null, percentile: '70' },
  { aq: 107, sum6: null, sum4: 44, percentile: '68' },
  { aq: 106, sum6: 64, sum4: 43, percentile: '65' },
  { aq: 105, sum6: 63, sum4: null, percentile: '63' },
  { aq: 104, sum6: null, sum4: 42, percentile: '61' },
  { aq: 103, sum6: 62, sum4: null, percentile: '58' },
  { aq: 102, sum6: 61, sum4: 41, percentile: '55' },
  { aq: 100, sum6: 60, sum4: 40, percentile: '50' },
  { aq: 99,  sum6: 59, sum4: 39, percentile: '47' },
  { aq: 97,  sum6: 58, sum4: 38, percentile: '42' },
  { aq: 96,  sum6: 57, sum4: null, percentile: '39' },
  { aq: 95,  sum6: null, sum4: 37, percentile: '37' },
  { aq: 94,  sum6: 56, sum4: null, percentile: '35' },
  { aq: 93,  sum6: 55, sum4: 36, percentile: '32' },
  { aq: 92,  sum6: 54, sum4: 35, percentile: '30' },
  { aq: 90,  sum6: 53, sum4: 34, percentile: '25' },
  { aq: 89,  sum6: 52, sum4: 33, percentile: '23' },
  { aq: 88,  sum6: 51, sum4: null, percentile: '21' },
  { aq: 87,  sum6: 50, sum4: 32, percentile: '19' },
  { aq: 86,  sum6: null, sum4: 31, percentile: '18' },
  { aq: 85,  sum6: 49, sum4: null, percentile: '16' },
  { aq: 84,  sum6: 48, sum4: 30, percentile: '14' },
  { aq: 83,  sum6: 47, sum4: 29, percentile: '13' },
  { aq: 81,  sum6: 46, sum4: null, percentile: '10' },
  { aq: 80,  sum6: null, sum4: 28, percentile: '9' },
  { aq: 79,  sum6: 45, sum4: 27, percentile: '8' },
  { aq: 78,  sum6: 44, sum4: null, percentile: '7' },
  { aq: 77,  sum6: null, sum4: 26, percentile: '6' },
  { aq: 76,  sum6: 43, sum4: null, percentile: '5' },
  { aq: 75,  sum6: 42, sum4: 25, percentile: '5' },
  { aq: 74,  sum6: null, sum4: 24, percentile: '4' },
  { aq: 73,  sum6: 41, sum4: null, percentile: '3' },
  { aq: 72,  sum6: 40, sum4: 23, percentile: '3' },
  { aq: 71,  sum6: 39, sum4: 22, percentile: '3' },
  { aq: 69,  sum6: 38, sum4: null, percentile: '2' },
  { aq: 68,  sum6: null, sum4: 21, percentile: '1' },
  { aq: 67,  sum6: 37, sum4: 20, percentile: '1' },
  { aq: 66,  sum6: 36, sum4: null, percentile: '1' },
  { aq: 65,  sum6: null, sum4: 19, percentile: '1' },
  { aq: 64,  sum6: 35, sum4: null, percentile: '<1' },
  { aq: 63,  sum6: 34, sum4: 18, percentile: '<1' },
  { aq: 62,  sum6: 33, sum4: null, percentile: '<1' },
  { aq: 61,  sum6: null, sum4: 17, percentile: '<1' },
  { aq: 60,  sum6: 32, sum4: 16, percentile: '<1' },
  { aq: 59,  sum6: 31, sum4: null, percentile: '<1' },
  { aq: 58,  sum6: null, sum4: 15, percentile: '<1' },
  { aq: 57,  sum6: 30, sum4: null, percentile: '<1' },
  { aq: 56,  sum6: 29, sum4: 14, percentile: '<1' },
  { aq: 55,  sum6: 28, sum4: 13, percentile: '<1' },
  { aq: 53,  sum6: 27, sum4: 12, percentile: '<1' },
  { aq: 52,  sum6: 26, sum4: '<12', percentile: '<1' },
  { aq: 50,  sum6: 25, sum4: null, percentile: '<1' },
  { aq: 49,  sum6: 24, sum4: null, percentile: '<1' },
  { aq: 47,  sum6: 23, sum4: null, percentile: '<1' },
  { aq: 46,  sum6: 22, sum4: null, percentile: '<1' },
  { aq: 44,  sum6: 21, sum4: null, percentile: '<1' },
  { aq: 43,  sum6: '<21', sum4: null, percentile: '<1' },
];

/**
 * دالة مساعدة لتحويل الدرجة الخام لمجال فرعي إلى درجة معيارية ورتبة مئينية
 */
export function getSubscaleScaledScore(domainCode, rawScore) {
  const code = domainCode.toLowerCase();
  
  for (const row of RAW_TO_SCALED_TABLE) {
    const range = row[code];
    if (range && Array.isArray(range)) {
      if (rawScore >= range[0] && rawScore <= range[1]) {
        return {
          scaledScore: row.scaledScore,
          percentile: row.percentile,
          sem: 1,
        };
      }
    }
  }

  // Fallback boundaries
  if (rawScore <= 0) {
    return { scaledScore: 3, percentile: '1', sem: 1 };
  }
  return { scaledScore: 15, percentile: '95', sem: 1 };
}

/**
 * دالة تحويل مجموع الدرجات المعيارية إلى معامل التوحد والرتبة المئينية الكلية
 */
export function getAutismQuotient(sumScaled, isVerbal = true) {
  const is4Comp = !isVerbal;

  if (is4Comp) {
    for (const row of SUM_SCALED_TO_AQ_TABLE) {
      if (row.sum4 !== null && row.sum4 !== '<12') {
        if (sumScaled >= row.sum4) {
          return { aq: row.aq, percentile: row.percentile, sem: 4 };
        }
      }
    }
    return { aq: 52, percentile: '<1', sem: 4 };
  } else {
    for (const row of SUM_SCALED_TO_AQ_TABLE) {
      if (row.sum6 !== null && row.sum6 !== '<21') {
        if (sumScaled >= row.sum6) {
          return { aq: row.aq, percentile: row.percentile, sem: 4 };
        }
      }
    }
    return { aq: 43, percentile: '<1', sem: 4 };
  }
}

/**
 * الدليل التفسيري للدرجات ومعامل التوحد وفق معايير DSM-5
 */
export function getGARS3Interpretation(aqScore) {
  if (aqScore <= 54) {
    return {
      severityKey: 'unlikely',
      probability: 'غير محتمل (Unlikely)',
      dsm5Level: 'غير توحد (Non-Autistic)',
      supportLevel: 'لا يوجد اضطراب توحد / لا يتطلب دعماً نوعياً',
      color: '#10b981',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
      description: 'تشير الدرجات إلى عدم وجود أعراض كافية لتشخيص اضطراب طيف التوحد، وسلوكيات الطفل تقع ضمن المدى النمائي الطبيعي مقارنة بالأقران.',
    };
  }

  if (aqScore >= 55 && aqScore <= 70) {
    return {
      severityKey: 'mild',
      probability: 'محتمل (Probable)',
      dsm5Level: 'المستوى الأول: بسيط (Level 1: Mild)',
      supportLevel: 'يتطلب حداً أدنى من الدعم (Requires Support)',
      color: '#3b82f6',
      bg: '#eff6ff',
      border: '#bfdbfe',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      description: 'تشير الدرجات إلى احتمال وجود اضطراب طيف التوحد بدرجة بسيطة. يعاني المفحوص من صعوبات ملحوظة في المبادأة الاجتماعية والمرونة السلوكية ولكنه يستجيب للتدخل والدعم البسيط.',
    };
  }

  if (aqScore >= 71 && aqScore <= 100) {
    return {
      severityKey: 'moderate',
      probability: 'ملائم / مؤكد (Very Likely)',
      dsm5Level: 'المستوى الثاني: متوسط (Level 2: Moderate)',
      supportLevel: 'يتطلب دعماً كبيراً (Requires Substantial Support)',
      color: '#f59e0b',
      bg: '#fffbeb',
      border: '#fde68a',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      description: 'تشير الدرجات إلى تأكيد وجود اضطراب طيف التوحد بدرجة متوسطة. يظهر المفحوص عجزاً واضحاً في مهارات التواصل اللفظي وغير اللفظي وسلوكيات نمطية متكررة تتطلب دعماً تأهيلياً كبيراً ومستمراً.',
    };
  }

  return {
    severityKey: 'severe',
    probability: 'ملائم جداً / حاد (High / Very Likely)',
    dsm5Level: 'المستوى الثالث: شديد (Level 3: Severe)',
    supportLevel: 'يتطلب دعماً كبيراً جداً (Requires Very Substantial Support)',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    description: 'تشير الدرجات إلى وجود اضطراب طيف توحد شديد وحاد. يعاني المفحوص من انعدام أو قصور حاد في مهارات التواصل، وانفصال شديد وسلوكيات نمطية وقهرية ملزمة تتطلب رعاية شاملة وتدخلاً سلوكياً مكثفاً للغاية.',
  };
}

/**
 * المحرك السيكومتري الشامل لحساب نتائج مقياس جيليام 3
 * يدعم كلاً من:
 * 1. الإدخال المباشر للدرجات الخام لكل مجال: domainRawScores: { rb: 15, si: 22, ... }
 * 2. الإدخال عبر تفريغ استجابات البنود الفردية: scores: { 1: 2, 2: 3, ... }
 */
export function calculateGARS3Psychometrics(scores = {}, isVerbal = true, domainRawOverrides = null) {
  const applicableDomains = isVerbal
    ? GARS3_DOMAINS
    : GARS3_DOMAINS.filter(d => d.isCore);

  const totalItemsCount = isVerbal ? 58 : 44;
  let totalRawScore = 0;
  let answeredCount = 0;
  let sumScaledScores = 0;

  const domainResults = applicableDomains.map(domain => {
    let domainRaw = 0;
    let domainAnswered = 0;
    const [startId, endId] = domain.itemRange;
    const domainTotalItems = endId - startId + 1;
    const maxRaw = domain.maxRawScore || (domainTotalItems * 3);

    // إذا تم تمرير درجات خام مباشرة لكل مجال (Raw Score Entry Mode)
    if (domainRawOverrides && domainRawOverrides[domain.id] !== undefined && domainRawOverrides[domain.id] !== '') {
      domainRaw = Math.min(maxRaw, Math.max(0, Number(domainRawOverrides[domain.id]) || 0));
      domainAnswered = domainTotalItems;
    } else if (scores && scores[domain.id] !== undefined && typeof scores[domain.id] === 'number') {
      // إدخال مباشر كدرجة مجال
      domainRaw = Math.min(maxRaw, Math.max(0, scores[domain.id]));
      domainAnswered = domainTotalItems;
    } else {
      // حساب من مصفوفة تفريغ أرقام البنود
      for (let i = startId; i <= endId; i++) {
        if (scores && scores[i] !== undefined && scores[i] !== null && scores[i] !== '') {
          const val = Number(scores[i]);
          domainRaw += val;
          domainAnswered++;
        }
      }
    }

    totalRawScore += domainRaw;
    answeredCount += domainAnswered;

    // Subscale Scaled Score & Percentile Lookup
    const scaledInfo = getSubscaleScaledScore(domain.code, domainRaw);
    sumScaledScores += scaledInfo.scaledScore;

    return {
      id: domain.id,
      code: domain.code,
      name: domain.name,
      englishName: domain.englishName,
      color: domain.color,
      rawScore: domainRaw,
      maxRaw,
      answeredCount: domainAnswered,
      totalItems: domainTotalItems,
      isComplete: domainAnswered === domainTotalItems,
      scaledScore: scaledInfo.scaledScore,
      percentile: scaledInfo.percentile,
      sem: scaledInfo.sem,
      iepTargetArea: domain.iepTargetArea,
    };
  });

  // Autism Quotient & Overall Percentile
  const aqInfo = getAutismQuotient(sumScaledScores, isVerbal);
  const interpretation = getGARS3Interpretation(aqInfo.aq);

  const isComplete = answeredCount === totalItemsCount;
  const completionPercentage = Math.round((answeredCount / totalItemsCount) * 100);

  return {
    isVerbal,
    totalItemsCount,
    answeredCount,
    isComplete,
    completionPercentage,
    totalRawScore,
    sumScaledScores,
    autismQuotient: aqInfo.aq,
    overallPercentile: aqInfo.percentile,
    overallSEM: aqInfo.sem,
    severityKey: interpretation.severityKey,
    probability: interpretation.probability,
    dsm5Level: interpretation.dsm5Level,
    supportLevel: interpretation.supportLevel,
    severityColor: interpretation.color,
    severityBadgeClass: interpretation.badgeClass,
    clinicalDescription: interpretation.description,
    domainResults,
  };
}
