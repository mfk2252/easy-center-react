/**
 * Ages & Stages Questionnaires, Third Edition (ASQ-3)
 * مقياس الأعمار والمراحل النمائية - الإصدار الثالث المعياري
 * إعداد: د. جين سكويرز، د. ديان بريكر (Jane Squires, Ph.D. & Diane Bricker, Ph.D.)
 * الناشر: Paul H. Brookes Publishing Co.
 */

export const ASQ3_DOMAINS = [
  {
    id: 'comm',
    name: 'مجال التواصل',
    nameEn: 'Communication Domain',
    code: 'COM',
    icon: '🗣️',
    color: '#0d9488',
    description: 'يقيس مهارات الاستماع، فهم الكلمات، إصدار الأصوات، واستخدام الجمل اللغوية في التعبير.',
    itemsCount: 6,
  },
  {
    id: 'gross_motor',
    name: 'مجال الحركة الكبرى',
    nameEn: 'Gross Motor Domain',
    code: 'GRO',
    icon: '🏃',
    color: '#0f766e',
    description: 'يقيس حركة الذراعين والساقين، التوازن، الجري، القفز، وصعود الدرج.',
    itemsCount: 6,
  },
  {
    id: 'fine_motor',
    name: 'مجال الحركة الدقيقة',
    nameEn: 'Fine Motor Domain',
    code: 'FIN',
    icon: '✍️',
    color: '#14b8a6',
    description: 'يقيس مهارات التآزر البصري الحركي، استخدام الأصابع، الإمساك بالأدوات، والرسم والتلوين.',
    itemsCount: 6,
  },
  {
    id: 'problem_solving',
    name: 'مجال حل المشكلات',
    nameEn: 'Problem Solving Domain',
    code: 'PRB',
    icon: '🧩',
    color: '#0284c7',
    description: 'يقيس مهارات الاستكشاف المعرفي، حل المشكلات، ترتيب وتصنيف الأشياء، واللعب بالألعاب التعليمية.',
    itemsCount: 6,
  },
  {
    id: 'personal_social',
    name: 'المجال الشخصي والاجتماعي',
    nameEn: 'Personal-Social Domain',
    code: 'PER',
    icon: '🤝',
    color: '#059669',
    description: 'يقيس مهارات الرعاية الذاتية المستقلة، اللعب الفردي والجماعي، والتفاعل الاجتماعي مع الآخرين.',
    itemsCount: 6,
  },
];

export const ASQ3_OPTIONS = [
  { value: 0, score: 0, label: '0 - لم يبدأ بعد / نادراً', description: 'الطفل لا يُظهر المهارة إطلاقاً في الوقت الحالي', color: '#dc2626' },
  { value: 5, score: 5, label: '5 - أحياناً / مهارة نامية', description: 'يؤدي المهارة في بعض الأحيان ولكن ليس باستمرار', color: '#d97706' },
  { value: 10, score: 10, label: '10 - نعم / دائماً', description: 'يتقن المهارة بانتظام وثقة وتظهر تلقائياً في سلوكه', color: '#059669' },
];

export const ASQ3_ITEMS = [
  // 1. Communication (comm)
  {
    id: 'asq1',
    subscaleId: 'comm',
    text: 'يشير إلى 4 أجزاء على الأقل من جسمه بدقة عندما تسأله (مثل: أين رأسك؟ أين عينك؟ أين يدك؟).',
    targetExample: 'لمس أنفه وعينيه وبطنه وقدمه مباشرة عند التسمية دون توجيه يده أو مساعدته بصرياً.',
  },
  {
    id: 'asq2',
    subscaleId: 'comm',
    text: 'يستخدم جملاً من 3 إلى 4 كلمات للتعبير عن رغباته (مثل: "أنا أريد تفاحة حمراء").',
    targetExample: 'تركيب جملة تحتوي على فعل وفاعل ومفعول به بوضوح لغوي كافٍ ومفهوم لمن حوله.',
  },
  {
    id: 'asq3',
    subscaleId: 'comm',
    text: 'يفهم حروف الجر البسيطة وينفذها (مثل: "ضع الكرة فوق الطاولة" أو "ضع المكعب تحت الصندوق").',
    targetExample: 'وضع اللعبة في الموضع الصحيح (فوق/تحت/داخل) من المحاولة الأولى دون تردد.',
  },
  {
    id: 'asq4',
    subscaleId: 'comm',
    text: 'يجيب على أسئلة توظيفية واستدلالية بسيطة مثل: "ماذا تفعل عندما تكون جائعاً؟ أو بردان؟".',
    targetExample: 'الإجابة بكلمات مناسبة مثل: "آكل"، "أشرب"، "ألبس الجاكيت" دون تلقين.',
  },
  {
    id: 'asq5',
    subscaleId: 'comm',
    text: 'يستخدم ضمائر الملكية والمتكلم بطريقة صحيحة (مثل: "هذا حقي / لي"، "أنا رسمت هذه").',
    targetExample: 'التمييز بين ملكيته وملكية غيره واستخدام لفظ "أنا" أو "لي" في سياقها الصحيح.',
  },
  {
    id: 'asq6',
    subscaleId: 'comm',
    text: 'يسرد تفاصيل حدث قصير أو قصة مصورة بعد مشاهدتها بترتيب منطقي مفهوم.',
    targetExample: 'الإشارة للصورة وذكر ما جرى فيها مثل: "الولد سقط عن الدراجة وبكى ثم ساعدته أمه".',
  },

  // 2. Gross Motor (gross_motor)
  {
    id: 'asq7',
    subscaleId: 'gross_motor',
    text: 'يقفز للأمام بكلتا القدمين معاً ويتخطى مسافة لا تقل عن 15 سم متجاوزاً خطاً على الأرض.',
    targetExample: 'الاندفاع للأمام والهبوط على كلتا القدمين معاً بثبات دون الوقوع أو الارتكاز باليدين.',
  },
  {
    id: 'asq8',
    subscaleId: 'gross_motor',
    text: 'يقف على قدم واحدة لمدة 5 ثوانٍ كاملة دون الاستناد على حائط أو شخص.',
    targetExample: 'رفع قدم واحدة عن الأرض وثني الركبة والمحافظة على التوازن لمدة 5 ثوان مستمرة.',
  },
  {
    id: 'asq9',
    subscaleId: 'gross_motor',
    text: 'يصعد ويهبط درجات السلم بتبادل القدمين (قدماً على كل درجة) وبأمان تام.',
    targetExample: 'صعود 5 درجات متتالية بتبادل سلس ومستقل دون الحاجة لوضع كلتا القدمين على درجة واحدة.',
  },
  {
    id: 'asq10',
    subscaleId: 'gross_motor',
    text: 'يركل كرة كبيرة نحو الأمام مسافة لا تقل عن مترين دون أن يفقد توازنه.',
    targetExample: 'أرجحة الساق بقوة ودقة وتوجيه الكرة نحو مرمى أو نقطة محددة بثبات حركي.',
  },
  {
    id: 'asq11',
    subscaleId: 'gross_motor',
    text: 'يلتقط كرة متوسطة الحجم ملقاة نحوه من مسافة مترين مستخدماً ذراعيه أو يديه.',
    targetExample: 'احتضان الكرة بين الصدر والذراعين أو تلقفها باليدين بنجاح في محاولتين من أصل ثلاث.',
  },
  {
    id: 'asq12',
    subscaleId: 'gross_motor',
    text: 'يجري بسرعة ويستطيع التوقف المفاجئ أو الانعطاف حول عائق دون التعثر.',
    targetExample: 'الركض والالتفاف حول قمع رياضي والتوقف الفوري عند سماع كلمة "قف".',
  },

  // 3. Fine Motor (fine_motor)
  {
    id: 'asq13',
    subscaleId: 'fine_motor',
    text: 'يمسك قلم التلوين بالقبضة الثلاثية المتقنة (بين الإبهام والسبابة مع الارتكاز على الوسطى).',
    targetExample: 'التحكم في حركة القلم بأطراف الأصابع وليس بقبضة راحة اليد الكاملة (Palmar Grasp).',
  },
  {
    id: 'asq14',
    subscaleId: 'fine_motor',
    text: 'ينسخ رسماً لخط مستقيم أفقي ورأسي ودائرة مغلقة بعد رؤية نموذج مرسوم.',
    targetExample: 'إغلاق الدائرة بنجاح عند نقطة البداية دون أن تترك مفتوحة أو تصبح حلزونية.',
  },
  {
    id: 'asq15',
    subscaleId: 'fine_motor',
    text: 'يبني برجاً متزناً من 8 مكعبات خشبية صغيرة على الأقل دون أن ينهار.',
    targetExample: 'وضع كل مكعب بحذر فوق الآخر في خط رأسي متزن حتى بلوغ 8 مكعبات متتالية.',
  },
  {
    id: 'asq16',
    subscaleId: 'fine_motor',
    text: 'يقص ورقة بالمقص المخصص للأطفال باتباع خط مستقيم مقسماً الورقة لنصفين.',
    targetExample: 'فتح وقفل المقص بسلاسة بيد واحدة وتثبيت الورقة باليد الأخرى والقص على طول الخط.',
  },
  {
    id: 'asq17',
    subscaleId: 'fine_motor',
    text: 'يلضم 4 حبات خرز أو مكرونة في خيط سميك بحركة يدين ثنائية متناسقة.',
    targetExample: 'إمساك طرف الخيط بيد والخرزة باليد الأخرى وتمرير الخيط وسحبه من الطرف المقابل.',
  },
  {
    id: 'asq18',
    subscaleId: 'fine_motor',
    text: 'يرسم شخصاً بسيطاً يحتوي على رأس وجزءين على الأقل من الجسم (مثل: عينين أو ساقين).',
    targetExample: 'رسم دائرة تمثل الرأس مع إضافة خطين للساقين ونقطتين للعينين بصورة واضحة.',
  },

  // 4. Problem Solving (problem_solving)
  {
    id: 'asq19',
    subscaleId: 'problem_solving',
    text: 'يركب أحجية أو بازل مكون من 5 إلى 6 قطع خشبية متداخلة بصورة صحيحة ومستقلة.',
    targetExample: 'تدوير القطعة وتجربة موضعها الملائم حتى تطابق مكانها الصحيح في لوحة البازل.',
  },
  {
    id: 'asq20',
    subscaleId: 'problem_solving',
    text: 'يصنف مجموعة من الأشياء المألوفة حسب اللون أو الحجم (مثل: فرز الكرات الحمراء عن الزرقاء).',
    targetExample: 'وضع كل لون في الصندوق المخصص له بدقة تامة دون خلط عشوائي.',
  },
  {
    id: 'asq21',
    subscaleId: 'problem_solving',
    text: 'يعد ترتيبياً 5 عناصر ملموسة ويشير إلى كل عنصر عند عده (1، 2، 3، 4، 5).',
    targetExample: 'لمس كل مكعب ونطق الرقم المطابق له ثم الإجابة "عندي 5 مكعبات" عند سؤاله كم عددهم.',
  },
  {
    id: 'asq22',
    subscaleId: 'problem_solving',
    text: 'يميز بين المفهومين المتضادين: (طويل/قصير، كبير/صغير، ثقيل/خفيف).',
    targetExample: 'اختيار العصا الأطول أو الصندوق الأثقل عند المقارنة المباشرة بين عنصرين.',
  },
  {
    id: 'asq23',
    subscaleId: 'problem_solving',
    text: 'يستعين بأداة بديلة لحل مشكلة (مثل: استخدام عصا لجلب لعبة استقرت تحت الأريكة).',
    targetExample: 'البحث عن وسيلة مبتكرة للوصول إلى الغرض بدلاً من التوقف أو البكاء المباشر.',
  },
  {
    id: 'asq24',
    subscaleId: 'problem_solving',
    text: 'يكمل نمطاً بصرياً تسلسلياً بسيطاً (مثل: خرزة حمراء، خرزة زرقاء، خرزة حمراء، ...).',
    targetExample: 'تحديد اللون التالي في السلسلة واختياره بشكل صحيح ومستقل.',
  },

  // 5. Personal-Social (personal_social)
  {
    id: 'asq25',
    subscaleId: 'personal_social',
    text: 'يرتدي بنطاله وحذاءه (المزود بأشرطة لاصقة) بمفرده دون مساعدة من شخص بالغ.',
    targetExample: 'إدخال الساقين في البنطال وسحبه للخصر وتثبيت شريط الحذاء بإحكام.',
  },
  {
    id: 'asq26',
    subscaleId: 'personal_social',
    text: 'يغسل يديه ويجففهما بالمنشفة بمفرده بعد استخدام دورة المياه أو قبل الطعام.',
    targetExample: 'إتمام دورة الغسيل بالماء والصابون والتجفيف التام دون الحاجة لتوجيه خطوة بخطوة.',
  },
  {
    id: 'asq27',
    subscaleId: 'personal_social',
    text: 'يشارك في اللعب التخيلي والتمثيلي مع أقرانه (مثل: إعداد وجبة خيالية أو رعاية دمية).',
    targetExample: 'التفاعل التبادلي في اللعبة وتقاسم الأدوار مع رفيقه لمدة 5 دقائق متواصلة.',
  },
  {
    id: 'asq28',
    subscaleId: 'personal_social',
    text: 'يعتذر أو يواسي طفلاً آخر تعرض للأذى أو عندما يرتكب خطأ غير مقصود.',
    targetExample: 'قول "أنا آسف" أو التربيت على كتف الزميل عند إسقاط مكعباته بالخطأ.',
  },
  {
    id: 'asq29',
    subscaleId: 'personal_social',
    text: 'ينتظر دوره في الأنشطة الصفية والترفيهية (مثل: الطابور أو اللعب بالأرجوحة).',
    targetExample: 'الوقوف الهادئ والانتظار دون دفع الأطفال الآخرين أو الصراخ.',
  },
  {
    id: 'asq30',
    subscaleId: 'personal_social',
    text: 'يعبر عن احتياجاته الشخصية وألمه بالكلمات دون الاعتماد على نوبات الغضب.',
    targetExample: 'إخبار المشرف: "بطني يؤلمني" أو "أحتاج إلى شرب ماء" بأسلوب واضح ومتزن.',
  },
];

export function calculateASQ3Score(answers = {}) {
  const answeredKeys = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null);
  const totalAnswered = answeredKeys.length;
  const totalItems = ASQ3_ITEMS.length;

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
        { label: 'حالة الفرز النمائي', value: '—', sub: 'في انتظار الرصد', color: 'var(--text-sub)' },
        { label: 'إجمالي الدرجة النمائية', value: '—', sub: 'من 300 نقطة', color: 'var(--text-sub)' },
        { label: 'المجالات النمائية', value: '5 مجالات', sub: '30 بنداً تشخيصياً', color: 'var(--text-sub)' },
      ],
      summary: 'في انتظار البدء بالتقييم - يرجى رصد درجات مجالات التواصل والحركة الكبرى والدقيقة وحل المشكلات والشخصي الاجتماعي.',
      recommendations: 'سيتم تحديد خطوط الأساس النمائية ونقاط القوة والمخاطر فور إدخال الاستجابات.',
    };
  }

  const domainScores = { comm: 0, gross_motor: 0, fine_motor: 0, problem_solving: 0, personal_social: 0 };
  const domainAnswered = { comm: 0, gross_motor: 0, fine_motor: 0, problem_solving: 0, personal_social: 0 };
  let totalRawScore = 0;

  ASQ3_ITEMS.forEach(it => {
    const val = Number(answers[it.id]);
    if (!isNaN(val) && answers[it.id] !== undefined && answers[it.id] !== null) {
      domainScores[it.subscaleId] = (domainScores[it.subscaleId] || 0) + val;
      domainAnswered[it.subscaleId] = (domainAnswered[it.subscaleId] || 0) + 1;
      totalRawScore += val;
    }
  });

  const maxPossible = totalItems * 10; // 30 * 10 = 300 points (60 per domain)
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  // Domain Cutoffs (Standard ASQ-3 threshold per 60-point domain):
  // Below Cutoff (< 30): Need further evaluation (تأخر نمائي)
  // Monitoring Zone (30-45): Monitor / At-risk (مراقبة حذرة)
  // Above Cutoff (> 45): On schedule (نمو ملائم)
  let deficitDomainsCount = 0;
  let monitorDomainsCount = 0;

  Object.values(domainScores).forEach(score => {
    if (score < 30) deficitDomainsCount++;
    else if (score < 45) monitorDomainsCount++;
  });

  let level = 'تطور نمائي طبيعي ملائم لمرحلته العمرية (On Schedule)';
  let severityKey = 'normal';
  let severityColor = '#059669';

  if (deficitDomainsCount >= 2 || totalRawScore < 150) {
    level = 'تأخر نمائي بارز يستوجب الإحالة للتقييم الشامل والتدخل المبكر';
    severityKey = 'severe';
    severityColor = '#dc2626';
  } else if (deficitDomainsCount === 1 || monitorDomainsCount >= 2 || totalRawScore < 210) {
    level = 'منطقة المتابعة الحذرة ومخاطر تأخر نمائي نوعي (Monitor / At Risk)';
    severityKey = 'moderate';
    severityColor = '#ea580c';
  } else if (totalRawScore < 240) {
    level = 'تطور نمائي شبه مستقر مع حاجة لتعزيز بعض المجالات';
    severityKey = 'mild';
    severityColor = '#d97706';
  }

  const completionPercentage = Math.round((totalAnswered / totalItems) * 100);

  const subscaleResults = ASQ3_DOMAINS.map(dom => {
    const raw = domainScores[dom.id] || 0;
    const domStatus = raw < 30 ? 'تأخر نمائي' : raw < 45 ? 'متابعة حذرة' : 'طبيعي مناسب';
    const domColor = raw < 30 ? '#dc2626' : raw < 45 ? '#ea580c' : '#059669';
    return {
      id: dom.id,
      name: dom.name,
      rawScore: raw,
      maxScore: 60,
      status: domStatus,
      color: domColor,
      answeredCount: domainAnswered[dom.id] || 0,
      totalCount: dom.itemsCount,
    };
  });

  const metrics = [
    { label: 'الدرجة النمائية الإجمالية', value: `${totalRawScore} / 300`, sub: `نسبة التطور: ${percentage}%`, color: severityColor },
    { label: 'الحالة النمائية العامة', value: level.split(' (')[0].slice(0, 24), sub: 'معيار ASQ-3', color: severityColor },
    { label: 'التواصل (COM)', value: `${domainScores.comm} / 60`, sub: domainScores.comm < 30 ? 'تأخر' : 'ملائم', color: domainScores.comm < 30 ? '#dc2626' : '#0d9488' },
    { label: 'الحركة الكبرى (GRO)', value: `${domainScores.gross_motor} / 60`, sub: domainScores.gross_motor < 30 ? 'تأخر' : 'ملائم', color: domainScores.gross_motor < 30 ? '#dc2626' : '#0f766e' },
    { label: 'الحركة الدقيقة (FIN)', value: `${domainScores.fine_motor} / 60`, sub: domainScores.fine_motor < 30 ? 'تأخر' : 'ملائم', color: domainScores.fine_motor < 30 ? '#dc2626' : '#14b8a6' },
    { label: 'حل المشكلات (PRB)', value: `${domainScores.problem_solving} / 60`, sub: domainScores.problem_solving < 30 ? 'تأخر' : 'ملائم', color: domainScores.problem_solving < 30 ? '#dc2626' : '#0284c7' },
  ];

  return {
    totalAnswered,
    totalItems,
    completionPercentage,
    totalRawScore,
    standardScore: totalRawScore,
    percentage,
    level,
    severityKey,
    severityLabel: level,
    severityColor,
    metrics,
    subscaleResults,
    summary: `تم إجراء مسح ASQ-3 النمائي؛ وحقق الطفل مجموع نقاط (${totalRawScore} من أصل 300) بنسبة نمائية (${percentage}%) ومستوى: "${level}". جاءت نتائج المجالات النمائية: التواصل (${domainScores.comm}/60)، الحركة الكبرى (${domainScores.gross_motor}/60)، الحركة الدقيقة (${domainScores.fine_motor}/60)، حل المشكلات (${domainScores.problem_solving}/60)، والشخصي الاجتماعي (${domainScores.personal_social}/60).`,
    recommendations: deficitDomainsCount > 0
      ? `يوصى بإحالة الطفل لإجراء تقييم تشخيصي تخصصي شامل في المجالات التي وقعت تحت عتبة القطع (< 30 نقطة)، والبدء الفوري بأنشطة التدخل المبكر المحفزة.`
      : `يوصى بمواصلة تقديم الأنشطة الإثرائية اليومية والمتابعة الدورية عبر الفرز النمائي بعد 6 أشهر لمراقبة استمرار التطور الطبيعي.`,
  };
}

export const asq3ScaleConfig = {
  id: 'asq3_screening',
  title: 'استبيان الأعمار والمراحل النمائية (ASQ-3)',
  titleEn: 'Ages & Stages Questionnaires, Third Edition',
  icon: '🌱',
  category: 'developmental_early',
  categoryName: 'مقاييس النمو الشامل والتدخل المبكر',
  themeColor: 'teal',
  author: 'د. جين سكويرز، د. ديان بريكر (Jane Squires & Diane Bricker)',
  authorEn: 'Jane Squires, Ph.D. & Diane Bricker, Ph.D.',
  publisher: 'Paul H. Brookes Publishing Co.',
  targetAge: 'من عمر شهر واحد حتى 5 سنوات ونصف (66 شهراً)',
  standardsReference: 'المعيار العالمي المعتمد من الأكاديمية الأمريكية لطب الأطفال (AAP) للفرز والمسح النمائي المبكر',
  notice: 'استبيان معتمد لمسح واكتشاف مؤشرات التأخر النمائي في المراحل المبكرة وتوجيه خطط التدخل والتأهيل.',
  disclaimer: 'تعد نتائج ASQ-3 أداة فرز وتحري وليست تشخيصاً نهائياً بوجود إعاقة، وتستوجب تأكيداً عند الحاجة.',
  subscales: ASQ3_DOMAINS,
  items: ASQ3_ITEMS,
  options: ASQ3_OPTIONS,
  calculateScore: calculateASQ3Score,
};
