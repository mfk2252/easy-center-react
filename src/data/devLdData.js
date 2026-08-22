/**
 * قائمة صعوبات التعلم النمائية لأطفال الروضة
 * إعداد: أ.د. عادل عبدالله محمد (أستاذ ورئيس قسم الصحة النفسية - كلية التربية - جامعة الزقازيق)
 * دار النشر: دار الرشاد / عربية للطباعة والنشر
 * 
 * المقياس التشخيصي المقنن للكشف المبكر عن صعوبات التعلم النمائية في مرحلة الروضة وما قبل المدرسة
 * مبني على الإطار النظري وتصنيف كيرك وكالفنت (Kirk & Chalfant 1988) للأبعاد الثلاثية لصعوبات التعلم النمائية:
 * 
 * 1. صعوبات التعلم المعرفية (Cognitive):
 *    - صعوبات الانتباه (11 عبارة: 1 - 11)
 *    - صعوبات الإدراك (15 عبارة: 12 - 26)
 *    - صعوبات الذاكرة (13 عبارة: 27 - 39)
 * 2. صعوبات التعلم اللغوية والتفكير (Language & Thinking):
 *    - صعوبات التفكير (13 عبارة: 40 - 52)
 *    - صعوبات لغوية (14 عبارة: 53 - 66)
 * 3. صعوبات التعلم البصرية - الحركية (Visual-Motor):
 *    - صعوبات بصرية - حركية (14 عبارة: 67 - 80)
 * 
 * إجمالي العبارات: 80 عبارة تشخيصية.
 * نظام التصحيح: (نعم = 2 | أحياناً = 1 | لا = 0).
 * الدرجة الكلية العظمى = 160 درجة.
 * محك التشخيص:
 * - تجاوز 50% (80 درجة فأكثر): طفل معرض لخطر صعوبات التعلم النمائية (At Risk).
 * - تجاوز 70% (112 درجة فأكثر): يعاني فعلاً من صعوبات تعلم نمائية دالة إكلينيكياً (Confirmed Developmental LD).
 */

export const DEV_LD_COPYRIGHT_INFO = {
  scaleNameAr: 'قائمة صعوبات التعلم النمائية لأطفال الروضة',
  scaleNameEn: 'Developmental Learning Disabilities Checklist for Preschoolers',
  scaleShortName: 'قائمة صعوبات التعلم النمائية للروضة',
  authorAr: 'أ.د. عادل عبدالله محمد',
  authorTitle: 'أستاذ ورئيس قسم الصحة النفسية - كلية التربية - جامعة الزقازيق',
  publisherAr: 'دار الرشاد / عربية للطباعة والنشر والتوزيع - القاهرة',
  theoreticalFramework: 'مبني وفق التصنيف الثلاثي للأبعاد النمائية لـ (Kirk & Chalfant) ومحكات الفرز والتشخيص المبكر',
  targetAge: 'أطفال مرحلة الروضة والطفولة المبكرة وما قبل المدرسة (من سن 4 إلى 6 سنوات)',
  itemsCount: 80,
  subscalesCount: 6,
  maxScore: 160,
  notice: 'جميع حقوق الطبع والنشر والملكية الفكرية محفوظة للمؤلف أ.د. عادل عبدالله محمد ودار النشر (دار الرشاد). استخدام هذا المقياس في المنظومة مخصص لأغراض الفحص والتشخيص الإكلينيكي والتربوي المرخص للمراكز المتخصصة ورياض الأطفال وغرف المصادر والتشخيص المبكر.',
  disclaimer: 'تنبيه سريري: هذه القائمة أداة فرز وتشخيص مبكر مقننة تُطبّق بواسطة معلمات الروضة أو الأخصائيين النفسيين والتربويين بعد ملاحظة مستمرة للطفل، وتعد نتائجها أساساً لاشتقاق أهداف التدخل المبكر والخطة الفردية للروضة.',
};

export const DEV_LD_RESPONSE_OPTIONS = [
  {
    value: 2,
    score: 2,
    label: 'نعم (2)',
    description: 'تنطبق عليه العبارة تماماً وتتكرر بشكل مستمر في مختلف الأنشطة اليومية.',
    badgeClass: 'b-rd',
    color: '#dc2626',
  },
  {
    value: 1,
    score: 1,
    label: 'أحياناً (1)',
    description: 'تتفق مع سلوكه جزئياً أو تظهر في بعض المواقف دون الأخرى.',
    badgeClass: 'b-or',
    color: '#ea580c',
  },
  {
    value: 0,
    score: 0,
    label: 'لا (0)',
    description: 'لا تنطبق عليه العبارة وسلوكه طبيعي ومناسب لعمره الزمني.',
    badgeClass: 'b-gr',
    color: '#059669',
  },
];

export const DEV_LD_DOMAINS = [
  {
    id: 'attention',
    code: 'ATT',
    name: 'صعوبات الانتباه',
    nameEn: 'Attention Deficits',
    pillar: 'cognitive',
    pillarName: 'صعوبات التعلم المعرفية',
    itemsCount: 11,
    itemsRange: '1 - 11',
    maxScore: 22,
    color: '#dc2626',
    bgLight: '#fef2f2',
    icon: '🎯',
    description: 'يقيس تشتت الانتباه، شرود الذهن، قصر مدى الانتباه، والنشاط المفرط والاندفاعية وصعوبة الاستمرار في المهام.',
  },
  {
    id: 'perception',
    code: 'PRC',
    name: 'صعوبات الإدراك',
    nameEn: 'Perceptual Deficits',
    pillar: 'cognitive',
    pillarName: 'صعوبات التعلم المعرفية',
    itemsCount: 15,
    itemsRange: '12 - 26',
    maxScore: 30,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    icon: '👁️',
    description: 'يقيس صعوبات التمييز والتنظيم البصري والسمعي، عكس الحروف والأرقام، وإدراك العلاقات المكانية والتسلسل.',
  },
  {
    id: 'memory',
    code: 'MEM',
    name: 'صعوبات الذاكرة',
    nameEn: 'Memory Deficits',
    pillar: 'cognitive',
    pillarName: 'صعوبات التعلم المعرفية',
    itemsCount: 13,
    itemsRange: '27 - 39',
    maxScore: 26,
    color: '#0284c7',
    bgLight: '#f0f9ff',
    icon: '🧠',
    description: 'يقيس الذاكرة السمعية والبصرية والحركية واللمسية، استرجاع المعلومات، وتذكر أسماء الصور والحروف والتعليمات.',
  },
  {
    id: 'thinking',
    code: 'THK',
    name: 'صعوبات التفكير',
    nameEn: 'Thinking & Problem Solving',
    pillar: 'language_thinking',
    pillarName: 'صعوبات التعلم اللغوية والتفكير',
    itemsCount: 13,
    itemsRange: '40 - 52',
    maxScore: 26,
    color: '#d97706',
    bgLight: '#fffbeb',
    icon: '💡',
    description: 'يقيس حل المشكلات البسيطة، التصرف في المواقف الطارئة، حل المتاهات والألغاز وتركيب المكعبات وتنويع الأداء.',
  },
  {
    id: 'language',
    code: 'LNG',
    name: 'صعوبات لغوية',
    nameEn: 'Language & Speech Deficits',
    pillar: 'language_thinking',
    pillarName: 'صعوبات التعلم اللغوية والتفكير',
    itemsCount: 14,
    itemsRange: '53 - 66',
    maxScore: 28,
    color: '#059669',
    bgLight: '#ecfdf5',
    icon: '🗣️',
    description: 'يقيس تأخر النمو اللغوي، الاستقبال السمعي، وضوح النطق، التعبير الشفهي، وتكوين القصص والمفردات.',
  },
  {
    id: 'visual_motor',
    code: 'VMT',
    name: 'صعوبات بصرية - حركية',
    nameEn: 'Visual-Motor Integration Deficits',
    pillar: 'visual_motor',
    pillarName: 'صعوبات التعلم البصرية - الحركية',
    itemsCount: 14,
    itemsRange: '67 - 80',
    maxScore: 28,
    color: '#0d9488',
    bgLight: '#f0fdfa',
    icon: '✋',
    description: 'يقيس التناسق العضلي العام (الحركات الكبيرة)، المهارات الدقيقة كمسك القلم والمقص، التوازن، وتآزر أعضاء الجسم.',
  },
];

export const DEV_LD_ITEMS = [
  // (1) صعوبات الانتباه (1 - 11)
  { id: 1, domainId: 'attention', text: 'عادة ما نجده شارد الذهن.' },
  { id: 2, domainId: 'attention', text: 'يتشتت انتباهه بسرعة أثناء الاستماع أو المشاهدة، أو غيرها.' },
  { id: 3, domainId: 'attention', text: 'غير قادر على التركيز فيما يقال أو يحدث أمامه.' },
  { id: 4, domainId: 'attention', text: 'ليس بمقدوره أن يستجيب بشكل مناسب للمثيرات البيئية المختلفة.' },
  { id: 5, domainId: 'attention', text: 'غالباً ما يتسم بالخمول والكسل.' },
  { id: 6, domainId: 'attention', text: 'يتميز بالنشاط المفرط والاندفاعية.' },
  { id: 7, domainId: 'attention', text: 'غير قادر على الاستمرار في أداء المهام المختلفة أو استكمالها.' },
  { id: 8, domainId: 'attention', text: 'ينسحب من المواقف والتفاعلات الاجتماعية.' },
  { id: 9, domainId: 'attention', text: 'يصعب عليه الاستمرار في أنشطة اللعب.' },
  { id: 10, domainId: 'attention', text: 'مدى انتباهه قصير.' },
  { id: 11, domainId: 'attention', text: 'غير قادر على الانتباه لتسلسل المثير أو المثيرات التي يتم عرضها أمامه.' },

  // (2) صعوبات الإدراك (12 - 26)
  { id: 12, domainId: 'perception', text: 'يعاني من صعوبة في تنظيم المثيرات البصرية.' },
  { id: 13, domainId: 'perception', text: 'يجد صعوبة في تفسير المثيرات البصرية.' },
  { id: 14, domainId: 'perception', text: 'يجد صعوبة في التمييز البصري.' },
  { id: 15, domainId: 'perception', text: 'عادة ما يعكس الحروف عند كتابتها.' },
  { id: 16, domainId: 'perception', text: 'يخطئ في كتابة الأرقام حيث يكتبها معكوسة.' },
  { id: 17, domainId: 'perception', text: 'يصعب عليه إدراك أوجه الشبه والاختلاف بين المثيرات المختلفة.' },
  { id: 18, domainId: 'perception', text: 'غالباً ما يخلط بين الحروف المتشابهة.' },
  { id: 19, domainId: 'perception', text: 'يجد صعوبة في التذكر البصري.' },
  { id: 20, domainId: 'perception', text: 'يصعب عليه إدراك العلاقات المكانية للأشياء في الفراغ.' },
  { id: 21, domainId: 'perception', text: 'لا يتمكن من التمييز بين الأشكال الهندسية المختلفة.' },
  { id: 22, domainId: 'perception', text: 'يواجه مشكلات عديدة في تنظيم المثيرات السمعية.' },
  { id: 23, domainId: 'perception', text: 'ليس باستطاعته أن يقوم بتفسير المثيرات السمعية.' },
  { id: 24, domainId: 'perception', text: 'غير قادر على التمييز السمعي.' },
  { id: 25, domainId: 'perception', text: 'يجد صعوبة في إدراك التتابع أو التسلسل السمعي.' },
  { id: 26, domainId: 'perception', text: 'يواجه مشكلة في اتباع سلسلة من التعليمات.' },

  // (3) صعوبات الذاكرة (27 - 39)
  { id: 27, domainId: 'memory', text: 'يعاني من مشكلات في الذاكرة السمعية.' },
  { id: 28, domainId: 'memory', text: 'تواجهه مشكلات عديدة في الذاكرة البصرية.' },
  { id: 29, domainId: 'memory', text: 'يعاني من مشكلات في الذاكرة اللمسية.' },
  { id: 30, domainId: 'memory', text: 'يواجه مشكلات في الذاكرة الحركية.' },
  { id: 31, domainId: 'memory', text: 'يجد صعوبة في استقبال المعلومات، أو تفسيرها، أو تشفيرها.' },
  { id: 32, domainId: 'memory', text: 'يواجه مشكلة في تخزين المعلومات التي يخبرها.' },
  { id: 33, domainId: 'memory', text: 'يجد صعوبة في استرجاع المعلومات المختلفة.' },
  { id: 34, domainId: 'memory', text: 'غير قادر على تذكر ما يقال أمامه، أو يوجه إليه.' },
  { id: 35, domainId: 'memory', text: 'تواجهه مشكلة في تذكر أسماء الصور والأشكال المختلفة.' },
  { id: 36, domainId: 'memory', text: 'غير قادر على تذكر الحروف الهجائية.' },
  { id: 37, domainId: 'memory', text: 'لا يتمكن من تذكر بعض الأحداث القريبة التي وقعت أمامه.' },
  { id: 38, domainId: 'memory', text: 'يجد صعوبة في تذكر الألعاب المختلفة.' },
  { id: 39, domainId: 'memory', text: 'غير قادر على تذكر التعليمات أو التوجيهات الخاصة بلعبة معينة.' },

  // (4) صعوبات التفكير (40 - 52)
  { id: 40, domainId: 'thinking', text: 'يجد صعوبة في التوصل إلى حل مناسب لمشكلة بسيطة.' },
  { id: 41, domainId: 'thinking', text: 'لا يمكنه تحديد الهدف المراد الوصول إليه أمامه.' },
  { id: 42, domainId: 'thinking', text: 'يرتبك ولا يستطيع أن يتصرف إذا لم يلحق بسيارة المدرسة.' },
  { id: 43, domainId: 'thinking', text: 'إذا لم يجد أحداً ينتظره خارج المدرسة فإنه عادة ما يجد مشكلة في التفكير السليم في مثل هذا الموقف.' },
  { id: 44, domainId: 'thinking', text: 'غير قادر على ترتيب أفكاره للوصول إلى حل مناسب للغز المعروض عليه.' },
  { id: 45, domainId: 'thinking', text: 'يجد مشكلة كبيرة وهو يلعب في متاهة.' },
  { id: 46, domainId: 'thinking', text: 'لا يتمكن من تركيب المكعبات معاً بالقدر المعقول من المهارة لعمل الشكل المطلوب.' },
  { id: 47, domainId: 'thinking', text: 'تركيب أجزاء اللغز معاً بشكل مناسب يمثل مشكلة كبيرة له.' },
  { id: 48, domainId: 'thinking', text: 'عادة ما يكون لديه أسلوب واحد لأداء الأشياء.' },
  { id: 49, domainId: 'thinking', text: 'يجد صعوبة في القيام بتنويع الأداء.' },
  { id: 50, domainId: 'thinking', text: 'ليس بمقدوره أن يفكر في طريقة معينة تعينه على مواجهة العائق الذي يحول دون وصوله لهدف معين في مشكلة معينة أو موضوع محدد.' },
  { id: 51, domainId: 'thinking', text: 'لا يتمكن من وضع وتصور خطوات معينة لحل مشكلة تواجهه.' },
  { id: 52, domainId: 'thinking', text: 'غير قادر على أن يتأكد من سلامة حله للمشكلة.' },

  // (5) صعوبات لغوية (53 - 66)
  { id: 53, domainId: 'language', text: 'يعاني من تأخر واضح في النمو اللغوي.' },
  { id: 54, domainId: 'language', text: 'يجد صعوبة في الاستقبال السمعي للمثيرات.' },
  { id: 55, domainId: 'language', text: 'لا يفهم اللغة المنطوقة أمامه بشكل جيد.' },
  { id: 56, domainId: 'language', text: 'يعاني من صعوبة في الإدراك السمعي فلا يميز بين الأصوات المتشابهة.' },
  { id: 57, domainId: 'language', text: 'يجد صعوبة في الربط بين الصور والأسماء أو المزاوجة بينها.' },
  { id: 58, domainId: 'language', text: 'تصادفه العديد من المشكلات في نطق الكلمات المختلفة.' },
  { id: 59, domainId: 'language', text: 'عادة ما تكون لغته غير مفهومة.' },
  { id: 60, domainId: 'language', text: 'يتحدث بطريقة سريعة جداً أو بطيئة جداً.' },
  { id: 61, domainId: 'language', text: 'يجد صعوبة في التلفظ بالتعليمات التي تعتمد على سماعه لها.' },
  { id: 62, domainId: 'language', text: 'يصعب عليه تذكر ما سمعه أو النطق به.' },
  { id: 63, domainId: 'language', text: 'غير قادر على أن يعبر شفوياً عن الأحداث المختلفة.' },
  { id: 64, domainId: 'language', text: 'عادة ما تتأخر بداية الكلام عنده وذلك إلى ما بعد الثالثة.' },
  { id: 65, domainId: 'language', text: 'غالباً ما تكون مفرداته اللغوية محدودة.' },
  { id: 66, domainId: 'language', text: 'لا يتمكن من تكوين قصة معينة حول ما يمكن أن نعرضه عليه من صور.' },

  // (6) صعوبات بصرية - حركية (67 - 80)
  { id: 67, domainId: 'visual_motor', text: 'يواجه صعوبات متعددة في المهارات البصرية الحركية.' },
  { id: 68, domainId: 'visual_motor', text: 'يجد صعوبة في أداء الحركات الكبيرة أو العامة والتي عادة ما نعبر عنها بالتناسق العضلي كارتداء وخلع الملابس أو الحذاء، وغيرها.' },
  { id: 69, domainId: 'visual_motor', text: 'يجد صعوبة في ترتيب أدواته أو استخدامها في اللعب.' },
  { id: 70, domainId: 'visual_motor', text: 'يواجه مشكلات عديدة في أداء التمرينات الرياضية التي تعتمد على التناسق العضلي.' },
  { id: 71, domainId: 'visual_motor', text: 'يعاني من مشكلة في أداء الحركات الدقيقة كمسك القلم.' },
  { id: 72, domainId: 'visual_motor', text: 'لا يتمكن من تقليب صفحات الكتاب بسهولة.' },
  { id: 73, domainId: 'visual_motor', text: 'غير قادر على استخدام أدوات الرسم بالمهارة المطلوبة.' },
  { id: 74, domainId: 'visual_motor', text: 'يجد صعوبة في استخدام أدوات الطعام.' },
  { id: 75, domainId: 'visual_motor', text: 'تواجهه مشكلة في استخدام أدوات اللعب.' },
  { id: 76, domainId: 'visual_motor', text: 'لا يتمكن من القيام باستخدام المقص لقص الصور بمهارة.' },
  { id: 77, domainId: 'visual_motor', text: 'غير قادر على لصق الصور في الأماكن المحددة لها.' },
  { id: 78, domainId: 'visual_motor', text: 'يجد صعوبة في الحجل والوثب والقفز.' },
  { id: 79, domainId: 'visual_motor', text: 'ليس بإمكانه أن يحافظ على توازنه أثناء اللعب.' },
  { id: 80, domainId: 'visual_motor', text: 'يعاني من مشكلات تتعلق بتآزر أعضاء الجسم أثناء الحركة.' },
];

/**
 * Psychometric Calculation for Preschool Developmental LD Checklist
 * د. عادل عبدالله محمد
 */
export function calculateDevLdPsychometrics(scores = {}) {
  let totalAnswered = 0;
  let totalRawScore = 0;

  // Pillars Accumulators
  let cognitiveRaw = 0;
  let cognitiveMax = 78; // 22 + 30 + 26
  let langThinkingRaw = 0;
  let langThinkingMax = 54; // 26 + 28
  let visualMotorRaw = 0;
  let visualMotorMax = 28;

  const domainResults = DEV_LD_DOMAINS.map(domain => {
    const domainItems = DEV_LD_ITEMS.filter(it => it.domainId === domain.id);
    let rawScore = 0;
    let answeredCount = 0;

    domainItems.forEach(item => {
      const val = scores[item.id];
      if (val !== undefined && val !== null && val !== '') {
        rawScore += Number(val);
        answeredCount++;
      }
    });

    totalAnswered += answeredCount;
    totalRawScore += rawScore;

    if (domain.pillar === 'cognitive') {
      cognitiveRaw += rawScore;
    } else if (domain.pillar === 'language_thinking') {
      langThinkingRaw += rawScore;
    } else if (domain.pillar === 'visual_motor') {
      visualMotorRaw += rawScore;
    }

    const percentage = domain.maxScore > 0 ? Math.round((rawScore / domain.maxScore) * 100) : 0;

    // Subscale Cut-off (60% rule as established in author's manual p.22-23)
    let domainStatus = 'أداء نمائي طبيعي (طبيعي)';
    let domainClass = 'b-gr';
    let isDeficit = false;

    if (percentage >= 70) {
      domainStatus = 'صعوبة نمائية شديدة ومؤكدة (≥ 70%)';
      domainClass = 'b-rd';
      isDeficit = true;
    } else if (percentage >= 60) {
      domainStatus = 'معرض لخطر الصعوبة النمائية (60% - 69%)';
      domainClass = 'b-or';
      isDeficit = true;
    } else if (percentage >= 40) {
      domainStatus = 'مؤشرات خفيفة تحتاج متابعة (40% - 59%)';
      domainClass = 'b-bl';
    }

    return {
      ...domain,
      rawScore,
      answeredCount,
      totalItems: domainItems.length,
      completionRate: Math.round((answeredCount / domainItems.length) * 100),
      percentage,
      domainStatus,
      domainClass,
      isDeficit,
    };
  });

  const totalMaxScore = 160;
  const overallPercentage = Math.round((totalRawScore / totalMaxScore) * 100);

  // Overall Diagnostic Interpretation based on manual thresholds:
  // < 50% (< 80 points): أداء طبيعي
  // 50% - 69% (80 - 111 points): معرض لخطر صعوبات التعلم النمائية (At Risk)
  // >= 70% (112 - 160 points): يعاني فعلياً من صعوبات تعلم نمائية (Confirmed Developmental LD)
  let probability = 'أداء طبيعي / مستبعدة';
  let severityLevel = 'أداء نمائي طبيعي مناسب للسن وغير معرض لخطر صعوبات التعلم';
  let severityKey = 'normal';
  let severityColor = '#059669';
  let recommendationSummary = 'مواصلة الأنشطة الإثرائية النمائية في الروضة وتعزيز الجوانب المعرفية واللغوية والحركية.';

  if (overallPercentage >= 70 || totalRawScore >= 112) {
    probability = 'صعوبات تعلم نمائية مؤكدة (دالة إكلينيكياً)';
    severityLevel = 'يعاني الطفل فعلياً من صعوبات تعلم نمائية دالة إحصائياً (تجاوزت نسبته 70% من درجات القائمة)';
    severityKey = 'severe';
    severityColor = '#dc2626';
    recommendationSummary = 'إعداد خطة تدخل نمائي فردية مبكرة فوراً، وتكثيف جلسات تنمية مهارات الانتباه، الإدراك السمعي والبصري، الذاكرة، والتناسق الحركي قبل الالتحاق بالمرحلة الابتدائية.';
  } else if (overallPercentage >= 50 || totalRawScore >= 80) {
    probability = 'معرض لخطر صعوبات التعلم النمائية (At-Risk)';
    severityLevel = 'يقع الطفل في فئة الأطفال المعرضين لخطر صعوبات التعلم النمائية والأكاديمية اللاحقة (تجاوزت درجته 50% من القائمة)';
    severityKey = 'at_risk';
    severityColor = '#ea580c';
    recommendationSummary = 'تطبيق برامج الفرز والتدخل الوقائي المبكر في الروضة، مع التركيز على تدريب المعالجة البصرية والحركية واللغوية لمعالجة مظاهر القصور ومنع تحولها لصعوبات أكاديمية.';
  } else if (overallPercentage >= 35) {
    probability = 'مؤشرات نمائية حدية خفيفة';
    severityLevel = 'توجد بعض المؤشرات النمائية الخفيفة في مجالات محددة تتطلب الملاحظة المعززة والدعم الصفي';
    severityKey = 'mild';
    severityColor = '#d97706';
    recommendationSummary = 'تقديم أنشطة تقوية صفية موجهة في الروضة مع متابعة دورية ومواءمة البيئة الصفية لزيادة الانتباه والتركيز.';
  }

  const deficitDomains = domainResults.filter(d => d.isDeficit);
  const strengthDomains = domainResults.filter(d => d.percentage < 40);

  const cognitivePct = Math.round((cognitiveRaw / cognitiveMax) * 100);
  const langThinkingPct = Math.round((langThinkingRaw / langThinkingMax) * 100);
  const visualMotorPct = Math.round((visualMotorRaw / visualMotorMax) * 100);

  return {
    totalAnswered,
    totalItems: DEV_LD_ITEMS.length,
    completionPercentage: Math.round((totalAnswered / DEV_LD_ITEMS.length) * 100),
    totalRawScore,
    totalMaxScore,
    overallPercentage,
    probability,
    severityLevel,
    severityKey,
    severityColor,
    recommendationSummary,
    domainResults,
    deficitDomains,
    strengthDomains,
    cognitiveRaw,
    cognitiveMax,
    cognitivePct,
    langThinkingRaw,
    langThinkingMax,
    langThinkingPct,
    visualMotorRaw,
    visualMotorMax,
    visualMotorPct,
  };
}
