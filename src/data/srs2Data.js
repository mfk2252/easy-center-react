/**
 * استمارة الملاحظة والفرز النمائي للاستجابة والتواصل الاجتماعي (وفق معايير DSM-5)
 * Social Communication & Responsiveness Observational Screening Checklist (SC-OSC)
 * 
 * استمارة فرز وملاحظة سريرية ونمائية داخلية استرشادية، مصممة لمساعدة الأخصائيين والفرق التأهيلية
 * في رصد وتوثيق مهارات التفاعل والتواصل الاجتماعي والسلوكيات المقيدة لدى الأطفال والمراهقين
 * وفق المعايير العامة للدليل التشخيصي والإحصائي الخامس (DSM-5).
 * 
 * الاستمارة غير تجارية ومخصصة للاستخدام المهني الداخلي والمتابعة التربوية وتصميم الخطط الفردية (IEP).
 */

export const SRS2_COPYRIGHT_INFO = {
  scaleFullNameAr: 'استمارة الملاحظة والفرز النمائي للاستجابة والتواصل الاجتماعي',
  scaleFullNameEn: 'Social Communication & Interaction Observational Screening Checklist (DSM-5)',
  abbreviation: 'SC-OSC',
  authorsAr: 'إعداد وتطوير: فريق التأهيل الإكلينيكي والتربية الخاصة (وفق معايير DSM-5 العامة)',
  authorsEn: 'Clinical & Developmental Observational Framework (DSM-5 Criteria)',
  publisherAr: 'أداة ملاحظة وتقييم نمائي استرشادي داخلي للمراكز التأهيلية',
  publisherEn: 'Internal Clinical Observational Assessment Tool',
  standardNormsAr: 'استمارة فرز نوعية وكمية استرشادية متوافقة مع محاور DSM-5 للتواصل التبادلي والاهتمامات المقيدة',
  ageRangeAr: 'من سن 4 إلى 18 سنة (للبيئة المدرسية والملاحظة الأسرية والتأهيلية)',
  purposeAr: 'الرصد الميداني المنظم لمهارات التفاعل والتواصل الاجتماعي، واستكشاف مؤشرات القصور النمائي والسلوكيات النمطية للمساعدة في توجيه التدخل السلوكي وبناء أهداف الخطة التربوية الفردية.',
  licensingNotice: 'استمارة فرز وملاحظة نمائية سريرية مفتوحة للاستخدام الإكلينيكي والتأهيلي الداخلي غير التجاري.'
};

export const SRS2_RESPONSE_OPTIONS = [
  { value: 1, label: 'غير صحيح على الإطلاق (لم يلاحظ السلوك)', shortLabel: '1 - غير صحيح', desc: 'لم يُلاحظ السلوك مطلقاً في المواقف المعتادة (درجة 1)' },
  { value: 2, label: 'صحيح أحياناً (يظهر بنمط متقطع)', shortLabel: '2 - أحياناً', desc: 'يظهر السلوك في بعض الأوقات والمواقف (درجة 2)' },
  { value: 3, label: 'صحيح غالباً (يظهر بتكرار ملحوظ)', shortLabel: '3 - غالباً', desc: 'يظهر السلوك في معظم الأوقات الملاحظة (درجة 3)' },
  { value: 4, label: 'صحيح دائماً تقريباً (سلوك مستمر)', shortLabel: '4 - دائماً تقريباً', desc: 'يظهر السلوك بصورة شبه دائمة ومستمرة (درجة 4)' }
];

export const SRS2_DOMAINS = [
  {
    id: 'awr',
    code: 'AWR',
    name: 'الوعي والانتباه الاجتماعي',
    englishName: 'Social Awareness & Attention',
    itemsCount: 8,
    color: '#2563eb',
    bgLight: '#eff6ff',
    borderColor: '#93c5fd',
    description: 'يقيس قدرة الطفل على التقاط الإشارات والمثيرات الاجتماعية وملاحظة التغيرات الانفعالية في المحيطين.'
  },
  {
    id: 'cog',
    code: 'COG',
    name: 'الإدراك والفهم الاجتماعي',
    englishName: 'Social Cognition & Understanding',
    itemsCount: 12,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#c084fc',
    description: 'يقيس مدى فهم الطفل للمواقف الاجتماعية وتفسير دوافع ونوايا الآخرين وتوقع ردود أفعالهم.'
  },
  {
    id: 'com',
    code: 'COM',
    name: 'التواصل الاجتماعي التبادلي',
    englishName: 'Reciprocal Social Communication',
    itemsCount: 22,
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    description: 'يقيس مهارات الحوار والمحادثة المتبادلة، واستخدام الإيماءات ولغة الجسد، ومرونة التعبير اللفظي.'
  },
  {
    id: 'mot',
    code: 'MOT',
    name: 'المبادرة والدافعية الاجتماعية',
    englishName: 'Social Motivation & Engagement',
    itemsCount: 11,
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fcd34d',
    description: 'يقيس مستوى رغبة الطفل واهتمامه بالمشاركة في الأنشطة الجماعية وتكوين علاقات إيجابية مع الأقران.'
  },
  {
    id: 'rrb',
    code: 'RRB',
    name: 'الاهتمامات المقيدة والأنماط التكرارية',
    englishName: 'Restricted Interests & Repetitive Patterns',
    itemsCount: 12,
    color: '#dc2626',
    bgLight: '#fef2f2',
    borderColor: '#fca5a5',
    description: 'يقيس وجود السلوكيات النمطية، ومقاومة التغيير، والارتباط بالروتين الجامد أو الحساسيات الحسية.'
  }
];

export const SRS2_ITEMS = [
  // 1. Social Awareness & Attention (AWR) - 8 items
  { id: 's1', text: 'يلاحظ مشاعر الآخرين (مثل الفرح أو الحزن) ويتعرف على تعابير وجوههم بسهولة.', domainId: 'awr', isReverse: true },
  { id: 's2', text: 'يدرك متى تتسبب تصرفاته في إزعاج أو مضايقة المحيطين به ويتوقف عن ذلك.', domainId: 'awr', isReverse: true },
  { id: 's3', text: 'ينتبه للمثيرات والتفاعلات الاجتماعية الدائرة في بيئته ويبدي تفاعلاً معها.', domainId: 'awr', isReverse: true },
  { id: 's4', text: 'يتجنب التواصل البصري المباشر أو يصرفه سريعاً عندما يتحدث معه شخص آخر.', domainId: 'awr', isReverse: false },
  { id: 's5', text: 'يستجيب للإشارات الجسدية والتلميحات العفوية الصادرة من الآخرين.', domainId: 'awr', isReverse: true },
  { id: 's6', text: 'يظهر عدم انتباه أو صعوبة في إدراك انطباعات الآخرين حول تصرفاته وسلوكه.', domainId: 'awr', isReverse: false },
  { id: 's7', text: 'يواجه صعوبة في احترام المسافة الشخصية المناسبة أثناء التفاعل مع الآخرين.', domainId: 'awr', isReverse: false },
  { id: 's8', text: 'يلاحظ الفروق في نبرات صوت المتحدثين وتغيرات مزاجهم ويعدل استجابته وفقها.', domainId: 'awr', isReverse: true },

  // 2. Social Cognition & Understanding (COG) - 12 items
  { id: 's9', text: 'يفهم العبارات والتوجيهات بحرفية مفرطة ويواجه صعوبة في استيعاب المزاح والتلميح.', domainId: 'cog', isReverse: false },
  { id: 's10', text: 'يفسر دوافع وتصرفات الآخرين بطريقة صحيحة ومناسبة لسياق الموقف.', domainId: 'cog', isReverse: true },
  { id: 's11', text: 'يجد صعوبة في فهم ومشاركة القصص والمشاعر التي يرويها له زملاؤه.', domainId: 'cog', isReverse: false },
  { id: 's12', text: 'قادر على فهم وجهة نظر الطرف الآخر وتخيل ما قد يشعر به في الموقف.', domainId: 'cog', isReverse: true },
  { id: 's13', text: 'يسيء فهم مقاصد الآخرين أو يفسر تصرفاتهم الودية على أنها سلبية أو عدائية.', domainId: 'cog', isReverse: false },
  { id: 's14', text: 'يتكيف بسلاسة مع القواعد والضوابط الاجتماعية المعمول بها في البيئة الصفية أو المنزلية.', domainId: 'cog', isReverse: true },
  { id: 's15', text: 'يبدو مرتبكاً أو غير منتبه لما يدور حوله أثناء الأنشطة الجماعية المنظمة.', domainId: 'cog', isReverse: false },
  { id: 's16', text: 'يظهر مرونة في التناغم مع رغبات المجموعة واختيارات الأقران أثناء اللعب.', domainId: 'cog', isReverse: true },
  { id: 's17', text: 'يميل إلى تصنيف الأشخاص والمواقف بصورة قطعية وجامدة دون مرونة.', domainId: 'cog', isReverse: false },
  { id: 's18', text: 'يبادل الآخرين مشاعر التعاطف والتشجيع والبهجة بطريقة دافئة وملائمة.', domainId: 'cog', isReverse: true },
  { id: 's19', text: 'يواجه تحدياً في توقع ردود الأفعال المعتادة من الآخرين تجاه سلوكياته اليومية.', domainId: 'cog', isReverse: false },
  { id: 's20', text: 'يميز بوضوح بين الضحك المشترك القائم على المودة والضحك الساخر غير اللائق.', domainId: 'cog', isReverse: true },

  // 3. Reciprocal Social Communication (COM) - 22 items
  { id: 's21', text: 'يواجه صعوبة في بدء محادثة قصيرة أو الاستمرار في الحوار التبادلي بانسيابية.', domainId: 'com', isReverse: false },
  { id: 's22', text: 'يعبر عن احتياجاته وأفكاره بوضوح باستخدام عبارات وكلمات مفهومة للمستمع.', domainId: 'com', isReverse: true },
  { id: 's23', text: 'يتحدث بنبرة صوت مسطحة أو وتيرة رتيبة تفتقر إلى النغمات الانفعالية التعبيرية.', domainId: 'com', isReverse: false },
  { id: 's24', text: 'يوظف إيماءات اليد وتعبيرات الوجه لتدعيم كلامه وتوضيح مراده أثناء التحدث.', domainId: 'com', isReverse: true },
  { id: 's25', text: 'يكرر مقاطع صوتية أو كلمات أو عبارات مكررة خارج السياق التواصلي الوظيفي.', domainId: 'com', isReverse: false },
  { id: 's26', text: 'يلتزم بتبادل الأدوار في الحديث ويمنح الطرف الآخر فرصة للتكلم والاستماع.', domainId: 'com', isReverse: true },
  { id: 's27', text: 'يصر على توجيه مسار الحديث نحو موضوعاته المفضلة فقط دون مراعاة اهتمام الطرف الآخر.', domainId: 'com', isReverse: false },
  { id: 's28', text: 'يستخدم أسلوباً لغوياً غير اعتيادي يبدو رسمياً جداً أو غير متطابق مع سنه الزمني.', domainId: 'com', isReverse: false },
  { id: 's29', text: 'يواجه صعوبة في ضبط مستوى علو صوته بما يتناسب مع هدوء المكان أو طبيعة الموقف.', domainId: 'com', isReverse: false },
  { id: 's30', text: 'يتقبل ملاحظات المستمعين بهدوء ويحاول إعادة صياغة كلامه عند طلب التوضيح.', domainId: 'com', isReverse: true },
  { id: 's31', text: 'يجد صعوبة في شرح فكرة بسيطة أو نقل معلومة واضحة ومباشرة للمحيطين.', domainId: 'com', isReverse: false },
  { id: 's32', text: 'ينخرط بتلقائية في الأنشطة التعاونية والألعاب التي تعتمد على التفاعل والتواصل.', domainId: 'com', isReverse: true },
  { id: 's33', text: 'يقاطع حديث الآخرين بشكل متكرر دون انتظار انتهاء المتكلم من كلامه.', domainId: 'com', isReverse: false },
  { id: 's34', text: 'يستخدم الإيماءات المتعارف عليها (مثل إيماءة الرأس للموافقة أو التلويح للترحيب).', domainId: 'com', isReverse: true },
  { id: 's35', text: 'يواجه صعوبة في التقاط المعنى المقصود من الرسائل غير المباشرة أو التلميحية.', domainId: 'com', isReverse: false },
  { id: 's36', text: 'يقدم الشكر والامتنان بأسلوب عفوي ومناسب للمواقف الاجتماعية المتنوعة.', domainId: 'com', isReverse: true },
  { id: 's37', text: 'يجد صعوبة في التعبير الشفهي عن مشاعر المواساة أو المساندة لشخص يمر بضيق.', domainId: 'com', isReverse: false },
  { id: 's38', text: 'يستمع باهتمام لحديث الطرف الآخر مع الحفاظ على لغة جسد متفاعلة ومنتبهة.', domainId: 'com', isReverse: true },
  { id: 's39', text: 'يجد صعوبة في الجمع المتزامن بين التحدث والنظر باسترخاء إلى وجه المتحدث.', domainId: 'com', isReverse: false },
  { id: 's40', text: 'ينظم أفكاره اللفظية بصورة متسلسلة عند نقل قصة أو حدث وقع معه.', domainId: 'com', isReverse: true },
  { id: 's41', text: 'يرد على تحيات الآخرين والترحيب بهم بصورة لطيفة ومباشرة.', domainId: 'com', isReverse: true },
  { id: 's42', text: 'يستمر في الاسترسال في الحديث دون الانتباه لإشارات الملل أو انصراف انتباه المستمع.', domainId: 'com', isReverse: false },

  // 4. Social Motivation & Engagement (MOT) - 11 items
  { id: 's43', text: 'يميل إلى تفضيل اللعب الفردي والانعزال عن مجموعات الأقران لفترات طويلة.', domainId: 'mot', isReverse: false },
  { id: 's44', text: 'يبادر بالاقتراب من زملائه وطلب المشاركة في ألعابهم وأنشطتهم بحماس.', domainId: 'mot', isReverse: true },
  { id: 's45', text: 'يظهر عليه تردد أو قلق ملحوظ يمنعه من الانضمام للأحاديث واللقاءات الجماعية.', domainId: 'mot', isReverse: false },
  { id: 's46', text: 'يسعد بالثناء والتشجيع الاجتماعي ويسعى لإظهار سلوكيات إيجابية تنال رضا المحيطين.', domainId: 'mot', isReverse: true },
  { id: 's47', text: 'يبدو قليل الاهتمام بتكوين صداقات جديدة أو قضاء وقت ترفيهي مشترك مع زملائه.', domainId: 'mot', isReverse: false },
  { id: 's48', text: 'يستقبل مبادرات الأقران للتقرب منه واللعب معه بابتسامة وترحاب.', domainId: 'mot', isReverse: true },
  { id: 's49', text: 'يميل إلى الابتعاد عن التجمعات والمناسبات ويفضل البقاء في ركن هادئ بمفرده.', domainId: 'mot', isReverse: false },
  { id: 's50', text: 'يشارك ألعابه وأدواته مع زملائه برضا ودون تردد ملحوظ.', domainId: 'mot', isReverse: true },
  { id: 's51', text: 'ينسحب سريعاً من المواقف التي تتطلب تفاعلاً اجتماعياً مكثفاً أو جهداً حوارياً.', domainId: 'mot', isReverse: false },
  { id: 's52', text: 'يحرص على إخبار أسرته أو معلمه بنجاحاته وإنجازاته اليومية بمشاعر فرح واضحة.', domainId: 'mot', isReverse: true },
  { id: 's53', text: 'يبدو قليل الاكتراث للعبارات التحفيزية أو التعزيز الاجتماعي المقدم له.', domainId: 'mot', isReverse: false },

  // 5. Restricted Interests & Repetitive Patterns (RRB) - 12 items
  { id: 's54', text: 'ينشغل باهتمامات خاصة محددة بشكل ضيق جداً ويقضي معظم وقته في جمع تفاصيل حولها.', domainId: 'rrb', isReverse: false },
  { id: 's55', text: 'يصر على الالتزام بروتين يومي محدد ويظهر انزعاجاً واضحاً عند حدوث تغيير غير متوقع.', domainId: 'rrb', isReverse: false },
  { id: 's56', text: 'يؤدي حركات جسمانية متكررة (مثل تحريك اليدين، الاهتزاز بالجذع، أو المشي على أطراف الأصابع).', domainId: 'rrb', isReverse: false },
  { id: 's57', text: 'يركز انتباهه على أجزاء ثانوية من الألعاب والأشياء (كالعجلات أو الأزرار) بدلاً من الاستخدام الوظيفي.', domainId: 'rrb', isReverse: false },
  { id: 's58', text: 'يظهر حساسية غير معتادة للمثيرات الحسية (كالأصوات العالية، ملامس الأقمشة، أو الإضاءة القوية).', domainId: 'rrb', isReverse: false },
  { id: 's59', text: 'يمارس طقوساً أو تسلسلات سلوكية معينة ولا يرتاح حتى يتم تنفيذها بنفس الترتيب بدقة.', domainId: 'rrb', isReverse: false },
  { id: 's60', text: 'يرتبط بأشياء أو خامات معينة ويحرص على الاحتفاظ بها ومرافقتها معه باستمرار.', domainId: 'rrb', isReverse: false },
  { id: 's61', text: 'يظهر مقاومة شديدة لتجربة أطعمة جديدة أو ارتداء ملابس خارج خياراته المحددة.', domainId: 'rrb', isReverse: false },
  { id: 's62', text: 'يحدق في مصادر الضوء أو الأشياء الدوارة لفترات طويلة بتركيز نمطي غير وظيفي.', domainId: 'rrb', isReverse: false },
  { id: 's63', text: 'ينزعج بشدة إذا تم تحريك أغراضه أو تغيير ترتيب البيئة المكانية التي اعتاد عليها.', domainId: 'rrb', isReverse: false },
  { id: 's64', text: 'يميل إلى تجميع ورص الأشياء والقطع في صفوف متوازية أو أنماط هندسية مكررة.', domainId: 'rrb', isReverse: false },
  { id: 's65', text: 'يكرر ترديد نفس الأسئلة أو العبارات بالرغم من معرفته بالإجابة المعتادة وسماعها مراراً.', domainId: 'rrb', isReverse: false }
];

// Alias for generic observational checklist terminology
export const SOCIAL_OBSERVATION_ITEMS = SRS2_ITEMS;
export const SOCIAL_OBSERVATION_DOMAINS = SRS2_DOMAINS;

/**
 * تحويل الدرجة التائية التقديرية (T-Score) إلى رتبة مئينية تقريبية
 */
export function tScoreToPercentile(tScore) {
  if (tScore <= 30) return 1;
  if (tScore <= 35) return 7;
  if (tScore <= 40) return 16;
  if (tScore <= 45) return 31;
  if (tScore <= 50) return 50;
  if (tScore <= 55) return 69;
  if (tScore <= 60) return 84;
  if (tScore <= 65) return 93;
  if (tScore <= 70) return 98;
  if (tScore <= 75) return 99.4;
  if (tScore <= 80) return 99.9;
  return 99.99;
}

export function getTScoreLevel(tScore) {
  if (tScore <= 59) return 'ضمن الحدود النمائية المعتادة';
  if (tScore <= 65) return 'مؤشرات ملاحظة نمائية بسيطة';
  if (tScore <= 75) return 'مؤشرات دالة إكلينيكياً (قصور متوسط)';
  return 'مؤشرات نمائية بارزة تستلزم دعماً مكثفاً (قصور شديد)';
}

export function getTScoreSeverityClass(tScore) {
  if (tScore <= 59) return 'b-gr';
  if (tScore <= 65) return 'b-yl';
  if (tScore <= 75) return 'b-or';
  return 'b-rd';
}

/**
 * حساب نتائج استمارة الملاحظة والفرز النمائي للاستجابة والتواصل الاجتماعي
 * @param {object} answers - إجابات البنود { s1: 1..4, s2: 1..4, ... }
 */
export const calculateSRS2Psychometrics = (answers = {}) => {
  const answeredKeys = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null && answers[k] !== '');
  const answeredCount = answeredKeys.length;
  const totalItemsCount = SRS2_ITEMS.length; // 65
  const progressPercent = Math.round((answeredCount / totalItemsCount) * 100);

  // 1. حساب درجات البنود والمجالات الخمسة
  let totalRawScore = 0;
  const domainRawScores = { awr: 0, cog: 0, com: 0, mot: 0, rrb: 0 };
  const domainAnsweredCounts = { awr: 0, cog: 0, com: 0, mot: 0, rrb: 0 };

  SRS2_ITEMS.forEach(it => {
    const rawVal = answers[it.id] !== undefined && answers[it.id] !== null && answers[it.id] !== '' ? Number(answers[it.id]) : null;
    if (rawVal !== null && !isNaN(rawVal)) {
      domainAnsweredCounts[it.domainId] = (domainAnsweredCounts[it.domainId] || 0) + 1;
      let score = rawVal;
      if (it.isReverse) {
        score = 5 - rawVal; // عكس الدرجة: 1->4, 2->3, 3->2, 4->1
      }
      totalRawScore += score;
      domainRawScores[it.domainId] += score;
    }
  });

  // إذا لم تتم الإجابة على أي بند بعد
  if (answeredCount === 0) {
    return {
      isComplete: false,
      answeredCount: 0,
      totalItemsCount: 65,
      progressPercent: 0,
      totalRawScore: 0,
      totalTScore: 35,
      overallPercentile: 7,
      sem: 2.8,
      category: 'لم يتم رصد الاستجابات بعد',
      dsm5Classification: 'بانتظار رصد بنود الملاحظة الميدانية',
      severityColor: '#64748b',
      interpretation: 'يرجى تسجيل درجات الملاحظة على بنود الاستمارة لإظهار نتائج الفرز والمؤشرات النمائية المعتمدة.',
      subscales: SRS2_DOMAINS.map(d => ({
        id: d.id,
        code: d.code,
        name: d.name,
        shortName: d.name.split(' ')[0],
        raw: 0,
        maxRaw: d.itemsCount * 4,
        tScore: 35,
        percentile: 7,
        level: 'غير مكتمل',
        color: d.color,
        answered: 0,
        total: d.itemsCount,
      })),
      dsmScales: {
        sci: {
          id: 'sci_dsm',
          code: 'SCI',
          name: 'التواصل والتفاعل الاجتماعي التبادلي (معايير DSM-5)',
          shortName: 'التواصل والتفاعل',
          raw: 0,
          maxRaw: 212,
          tScore: 35,
          percentile: 7,
          level: 'غير مكتمل',
          color: '#059669',
          itemsCount: 53,
        },
        rrb: {
          id: 'rrb_dsm',
          code: 'RRB',
          name: 'السلوكيات والاهتمامات المقيدة والنمطية (معايير DSM-5)',
          shortName: 'السلوكيات النمطية',
          raw: 0,
          maxRaw: 48,
          tScore: 35,
          percentile: 7,
          level: 'غير مكتمل',
          color: '#dc2626',
          itemsCount: 12,
        }
      }
    };
  }

  // 2. حساب الدرجة التائية المعيارية الكلية
  let totalTScore = Math.round(35 + (totalRawScore - 65) * 0.38);
  totalTScore = Math.max(35, Math.min(105, totalTScore));
  const overallPercentile = tScoreToPercentile(totalTScore);

  // 3. حساب درجات المجالات الفرعية
  let awrT = Math.round(35 + (domainRawScores.awr - 8) * 1.04);
  awrT = Math.max(35, Math.min(100, awrT));

  let cogT = Math.round(35 + (domainRawScores.cog - 12) * 0.69);
  cogT = Math.max(35, Math.min(100, cogT));

  let comT = Math.round(35 + (domainRawScores.com - 22) * 0.38);
  comT = Math.max(35, Math.min(100, comT));

  let motT = Math.round(35 + (domainRawScores.mot - 11) * 0.76);
  motT = Math.max(35, Math.min(100, motT));

  let rrbT = Math.round(35 + (domainRawScores.rrb - 12) * 0.69);
  rrbT = Math.max(35, Math.min(100, rrbT));

  // 4. مقاييس DSM-5 الاسترشادية المتوافقة
  const sciRaw = domainRawScores.awr + domainRawScores.cog + domainRawScores.com + domainRawScores.mot;
  let sciT = Math.round(35 + (sciRaw - 53) * 0.44);
  sciT = Math.max(35, Math.min(110, sciT));

  // 5. التصنيف الإكلينيكي والاسترشادي العام
  let category = '';
  let dsm5Classification = '';
  let severityColor = '#059669';
  let interpretation = '';

  if (totalTScore <= 59) {
    category = 'ضمن الحدود النمائية المعتادة (Within Normal Limits)';
    dsm5Classification = 'لا تظهر مؤشرات دالة على قصور في التفاعل الاجتماعي التبادلي (Negative Screening)';
    severityColor = '#059669';
    interpretation = 'لا تظهر نتائج الملاحظة صعوبات دالة إكلينيكياً في التفاعل الاجتماعي أو التواصل التبادلي. تقع استجابات الطفل الملاحظة ضمن النطاق المألوف لعامة الأقران في نفس الفئة العمرية.';
  } else if (totalTScore >= 60 && totalTScore <= 65) {
    category = 'مؤشرات ملاحظة نمائية بسيطة (Mild Observational Indicators)';
    dsm5Classification = 'مؤشرات لصعوبات تواصلية وبراجماتية اجتماعية طفيفة تستدعي دعماً استرشادياً';
    severityColor = '#d97706';
    interpretation = 'تشير نتائج الملاحظة إلى وجود صعوبات طفيفة في السلوك التفاعلي والتواصل الاجتماعي المتبادل. قد يواجه الطفل بعض التحديات في المواقف الاجتماعية المفتوحة أو قراءة الإشارات الدقيقة، مما يوصي ببرامج تدريب المهارات الاجتماعية الموجهة.';
  } else if (totalTScore >= 66 && totalTScore <= 75) {
    category = 'مؤشرات دالة إكلينيكياً - قصور متوسط (Moderate Clinical Indicators)';
    dsm5Classification = 'مؤشرات دالة إكلينيكياً على صعوبات التفاعل الاجتماعي والسلوك المقيد (المستوى 1-2 وفق DSM-5)';
    severityColor = '#ea580c';
    interpretation = 'تظهر الاستمارة قصوراً واضحاً وذا دلالة في التواصل والاستجابة الاجتماعية والسلوك التبادلي، مصحوباً بظهور بعض الأنماط السلوكية والاهتمامات المقيدة. يؤثر ذلك على التفاعل الصفي وتكوين الصداقات، ويستدعي خطة تربوية فردية (IEP) متخصصة.';
  } else {
    category = 'مؤشرات نمائية بارزة - قصور شديد (Marked / Severe Indicators)';
    dsm5Classification = 'مؤشرات بارزة ومستمرة على اضطراب التواصل التبادلي تستلزم دعماً مكثفاً (المستوى 2-3 وفق DSM-5)';
    severityColor = '#dc2626';
    interpretation = 'تشير الدرجة المرتفعة إلى وجود عجز بارز ومستمر في الاستجابة والتواصل الاجتماعي المتبادل مع ظهور أنماط سلوكية تكرارية تعيق الأداء اليومي بدرجة حادة، مما يوصي ببرامج تدخل سلوكي مكثف وبرامج تأهيلية وتواصلية متكاملة.';
  }

  const subscales = [
    {
      id: 'awr',
      code: 'AWR',
      name: 'الوعي والانتباه الاجتماعي (Social Awareness)',
      shortName: 'الوعي الاجتماعي',
      raw: domainRawScores.awr,
      maxRaw: 32,
      tScore: awrT,
      percentile: tScoreToPercentile(awrT),
      level: getTScoreLevel(awrT),
      color: '#2563eb',
      answered: domainAnsweredCounts.awr || 0,
      total: 8,
    },
    {
      id: 'cog',
      code: 'COG',
      name: 'الإدراك والفهم الاجتماعي (Social Cognition)',
      shortName: 'الإدراك الاجتماعي',
      raw: domainRawScores.cog,
      maxRaw: 48,
      tScore: cogT,
      percentile: tScoreToPercentile(cogT),
      level: getTScoreLevel(cogT),
      color: '#7c3aed',
      answered: domainAnsweredCounts.cog || 0,
      total: 12,
    },
    {
      id: 'com',
      code: 'COM',
      name: 'التواصل الاجتماعي التبادلي (Social Communication)',
      shortName: 'التواصل الاجتماعي',
      raw: domainRawScores.com,
      maxRaw: 88,
      tScore: comT,
      percentile: tScoreToPercentile(comT),
      level: getTScoreLevel(comT),
      color: '#059669',
      answered: domainAnsweredCounts.com || 0,
      total: 22,
    },
    {
      id: 'mot',
      code: 'MOT',
      name: 'المبادرة والدافعية الاجتماعية (Social Motivation)',
      shortName: 'الدافعية والمبادرة',
      raw: domainRawScores.mot,
      maxRaw: 44,
      tScore: motT,
      percentile: tScoreToPercentile(motT),
      level: getTScoreLevel(motT),
      color: '#d97706',
      answered: domainAnsweredCounts.mot || 0,
      total: 11,
    },
    {
      id: 'rrb',
      code: 'RRB',
      name: 'الاهتمامات المقيدة والأنماط التكرارية (RRB)',
      shortName: 'الأنماط والسلوكيات',
      raw: domainRawScores.rrb,
      maxRaw: 48,
      tScore: rrbT,
      percentile: tScoreToPercentile(rrbT),
      level: getTScoreLevel(rrbT),
      color: '#dc2626',
      answered: domainAnsweredCounts.rrb || 0,
      total: 12,
    },
  ];

  const dsmScales = {
    sci: {
      id: 'sci_dsm',
      code: 'SCI',
      name: 'محور التواصل والتفاعل الاجتماعي DSM-5 (SCI)',
      shortName: 'التواصل والتفاعل (SCI)',
      raw: sciRaw,
      maxRaw: 212,
      tScore: sciT,
      percentile: tScoreToPercentile(sciT),
      level: getTScoreLevel(sciT),
      color: '#059669',
      itemsCount: 53,
    },
    rrb: {
      id: 'rrb_dsm',
      code: 'RRB',
      name: 'محور السلوكيات والاهتمامات المقيدة (RRB)',
      shortName: 'السلوكيات المقيدة (RRB)',
      raw: domainRawScores.rrb,
      maxRaw: 48,
      tScore: rrbT,
      percentile: tScoreToPercentile(rrbT),
      level: getTScoreLevel(rrbT),
      color: '#dc2626',
      itemsCount: 12,
    }
  };

  return {
    isComplete: answeredCount === totalItemsCount,
    answeredCount,
    totalItemsCount,
    progressPercent,
    totalRawScore,
    totalTScore,
    overallPercentile,
    sem: 2.8,
    category,
    dsm5Classification,
    severityColor,
    interpretation,
    subscales,
    dsmScales,
  };
};

/**
 * دالة التوافق مع الكود القديم
 */
export const calculateSRS2Score = (answers = {}) => {
  return calculateSRS2Psychometrics(answers);
};
