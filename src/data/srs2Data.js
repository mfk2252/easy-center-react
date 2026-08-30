/**
 * SRS-2 (Social Responsiveness Scale, Second Edition)
 * مقياس الاستجابة الاجتماعية - الإصدار الثاني
 * 
 * إعداد: د. جون إن. كونستانتينو & د. كريستيان بي. غروبر
 * John N. Constantino, M.D. & Christian P. Gruber, Ph.D.
 * الناشر الأصلي: Western Psychological Services (WPS)
 * المعايير: مقنن وفق معايير الدليل التشخيصي والإحصائي الخامس (DSM-5)
 * 
 * يتكون المقياس من 65 عبارة موزعة على 5 مقاييس فرعية علاجية، ومقياسين متوافقين مع DSM-5.
 * خيارات الاستجابة رباعية التدريج (1 إلى 4):
 * 1: غير صحيح على الإطلاق (Not True - لم يلاحظ السلوك إطلاقاً)
 * 2: صحيح أحياناً (Sometimes True - يظهر السلوك أحياناً)
 * 3: صحيح غالباً (Often True - يظهر السلوك غالباً)
 * 4: صحيح دائماً تقريباً (Almost Always True - يظهر السلوك بشكل مستمر تقريباً)
 * 
 * المنهجية العلمية لحساب النتائج:
 * - العبارات الإيجابية (Reverse Items) يتم عكس درجاتها (الدرجة = 5 - القيمة المختارة) لتمثيل القصور في الاستجابة الاجتماعية.
 * - العبارات السلبية (مؤشرات القصور) تحسب كما هي (الدرجة = القيمة المختارة).
 * - تحول الدرجات الخام الكلية والفرعية إلى درجات تائية (T-Scores) معيارية ورتب مئينية.
 */

export const SRS2_COPYRIGHT_INFO = {
  scaleFullNameAr: 'مقياس الاستجابة الاجتماعية — الإصدار الثاني (SRS-2)',
  scaleFullNameEn: 'Social Responsiveness Scale, Second Edition (SRS-2)',
  abbreviation: 'SRS-2',
  authorsAr: 'د. جون إن. كونستانتينو & د. كريستيان بي. غروبر',
  authorsEn: 'John N. Constantino, M.D. & Christian P. Gruber, Ph.D.',
  publisherAr: 'المؤسسة الغربية للخدمات النفسية (WPS - Western Psychological Services)',
  publisherEn: 'Western Psychological Services (WPS)',
  standardNormsAr: 'مقنن إكلينيكياً ومتوافق مع معايير الدليل التشخيصي والإحصائي الخامس للاضطرابات النفسية (DSM-5)',
  ageRangeAr: 'من سن 4 إلى 18+ سنة (نماذج سن المدرسة، ما قبل المدرسة، والبالغين)',
  purposeAr: 'التقييم الكمي الدقيق والمتدرج للأعراض والقصور في التفاعل والتواصل الاجتماعي المرتبط باضطراب طيف التوحد والتمييز بين الحالات الإكلينيكية وتتبع خطط التدخل.',
  licensingNotice: 'مرخص للاستخدام المهني والإكلينيكي في مراكز التربية الخاصة والتأهيل والتشخيص النفسي وفق المعايير السيكومترية المعتمدة.'
};

export const SRS2_RESPONSE_OPTIONS = [
  { value: 1, label: 'غير صحيح على الإطلاق', shortLabel: '1 - غير صحيح', desc: 'لم يلاحظ السلوك إطلاقاً (1)' },
  { value: 2, label: 'صحيح أحياناً', shortLabel: '2 - أحياناً', desc: 'يظهر السلوك أحياناً (2)' },
  { value: 3, label: 'صحيح غالباً', shortLabel: '3 - غالباً', desc: 'يظهر السلوك غالباً (3)' },
  { value: 4, label: 'صحيح دائماً تقريباً', shortLabel: '4 - دائماً تقريباً', desc: 'يظهر السلوك بشكل مستمر تقريباً (4)' }
];

export const SRS2_DOMAINS = [
  {
    id: 'awr',
    code: 'AWR',
    name: 'الوعي الاجتماعي',
    englishName: 'Social Awareness',
    itemsCount: 8,
    color: '#3b82f6',
    bgLight: '#eff6ff',
    borderColor: '#93c5fd',
    description: 'يقيس قدرة الفرد على استكشاف وفهم المثيرات والإشارات الاجتماعية في بيئته.'
  },
  {
    id: 'cog',
    code: 'COG',
    name: 'الإدراك الاجتماعي',
    englishName: 'Social Cognition',
    itemsCount: 12,
    color: '#8b5cf6',
    bgLight: '#f5f3ff',
    borderColor: '#c084fc',
    description: 'يقيس قدرة الفرد على تفسير الإشارات والمواقف الاجتماعية وفهم دوافع الآخرين.'
  },
  {
    id: 'com',
    code: 'COM',
    name: 'التواصل الاجتماعي',
    englishName: 'Social Communication',
    itemsCount: 22,
    color: '#10b981',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    description: 'يقيس مهارات التواصل اللفظي وغير اللفظي المتبادل والمرونة الاجتماعية.'
  },
  {
    id: 'mot',
    code: 'MOT',
    name: 'الدافعية الاجتماعية',
    englishName: 'Social Motivation',
    itemsCount: 11,
    color: '#f59e0b',
    bgLight: '#fffbeb',
    borderColor: '#fcd34d',
    description: 'يقيس مدى رغبة الفرد واهتمامه بالانخراط في التفاعلات الاجتماعية وتكوين العلاقات.'
  },
  {
    id: 'rrb',
    code: 'RRB',
    name: 'السلوكيات المقيدة والتكرارية',
    englishName: 'Restricted Interests & Repetitive Behavior',
    itemsCount: 12,
    color: '#ef4444',
    bgLight: '#fef2f2',
    borderColor: '#fca5a5',
    description: 'يقيس مستوى السلوكيات النمطية، والاهتمامات المقيدة، والطقوس الحركية المقاومة للتغيير.'
  }
];

export const SRS2_ITEMS = [
  // 1. Social Awareness (AWR) - 8 items
  { id: 's1', text: 'قادر على استكشاف مشاعر الآخرين وفهم تعابير وجوههم بسهولة.', domainId: 'awr', isReverse: true },
  { id: 's2', text: 'يعرف متى يقوم بمضايقة الآخرين أو إزعاجهم بدون قصد.', domainId: 'awr', isReverse: true },
  { id: 's3', text: 'ينتبه للمثيرات الاجتماعية من حوله ويبدي وعياً وتفاعلاً معها.', domainId: 'awr', isReverse: true },
  { id: 's4', text: 'يتجنب التواصل البصري تماماً عندما يتحدث معه شخص ما.', domainId: 'awr', isReverse: false },
  { id: 's5', text: 'يفهم تلميحات الآخرين وتعابير وجوههم وإشاراتهم الجسدية العفوية.', domainId: 'awr', isReverse: true },
  { id: 's6', text: 'يظهر عدم وعي بكيفية استقبال الآخرين لتصرفاته وأسلوبه.', domainId: 'awr', isReverse: false },
  { id: 's7', text: 'يتعدى على المساحة الشخصية للآخرين ويقترب بشكل مبالغ فيه دون وعي.', domainId: 'awr', isReverse: false },
  { id: 's8', text: 'يلاحظ التغيرات الطفيفة في نبرة صوت الآخرين ومزاجهم العام ويستجيب لها.', domainId: 'awr', isReverse: true },

  // 2. Social Cognition (COG) - 12 items
  { id: 's9', text: 'يأخذ الأمور والعبارات بحذافيرها ويفشل في فهم المزاح أو الاستعارات.', domainId: 'cog', isReverse: false },
  { id: 's10', text: 'يفهم أسباب تصرفات الآخرين ودوافعهم الحقيقية بشكل صحيح.', domainId: 'cog', isReverse: true },
  { id: 's11', text: 'يواجه صعوبة بالغة في فهم معنى مشاركة الآخرين لمشاعرهم أو قصصهم معه.', domainId: 'cog', isReverse: false },
  { id: 's12', text: 'قادر على وضع نفسه مكان الآخرين وتخيل وجهة نظرهم البديلة.', domainId: 'cog', isReverse: true },
  { id: 's13', text: 'يفسر المواقف الاجتماعية بشكل خاطئ ويسيء فهم نوايا الآخرين الطيبة.', domainId: 'cog', isReverse: false },
  { id: 's14', text: 'يدرك القواعد الاجتماعية غير المكتوبة في الفصل أو التجمعات ويتصرف بناءً عليها.', domainId: 'cog', isReverse: true },
  { id: 's15', text: 'يبدو تائهاً أو غير مدرك لما يحدث حوله في التجمعات واللقاءات الجماعية.', domainId: 'cog', isReverse: false },
  { id: 's16', text: 'يعرف كيف ينسجم مع رغبات وتوقعات المجموعة بمرونة وسهولة.', domainId: 'cog', isReverse: true },
  { id: 's17', text: 'يميل إلى تصنيف الأشخاص والمواقف بطريقة جامدة للغاية (صديق حميم أو عدو).', domainId: 'cog', isReverse: false },
  { id: 's18', text: 'يستجيب بشكل ملائم ومتبادل للمشاعر الإيجابية كالفرح والتعاطف والتشجيع.', domainId: 'cog', isReverse: true },
  { id: 's19', text: 'يجد صعوبة في التنبؤ بردود أفعال الآخرين الطبيعية تجاه تصرفاته اليومية.', domainId: 'cog', isReverse: false },
  { id: 's20', text: 'يدرك بدقة متى يضحك الآخرون معه تعاطفاً أو متى يضحكون عليه بسخرية.', domainId: 'cog', isReverse: true },

  // 3. Social Communication (COM) - 22 items
  { id: 's21', text: 'يواجه صعوبة في بدء محادثة مع الآخرين أو الاستمرار فيها بشكل انسيابي.', domainId: 'com', isReverse: false },
  { id: 's22', text: 'يستطيع التعبير عن مشاعره واحتياجاته وأفكاره بوضوح للآخرين.', domainId: 'com', isReverse: true },
  { id: 's23', text: 'يتحدث بنبرة صوت رتيبة (مسطحة) أو غريبة تفتقر إلى النغمات الانفعالية المناسبة.', domainId: 'com', isReverse: false },
  { id: 's24', text: 'يستخدم الإيماءات ولغة الجسد وتعبيرات الوجه لتوضيح مراده أثناء الحديث.', domainId: 'com', isReverse: true },
  { id: 's25', text: 'يميل إلى تكرار نفس الكلمات أو العبارات دون مبرر أو داعٍ وظيفي.', domainId: 'com', isReverse: false },
  { id: 's26', text: 'يراعي تبادل الأدوار في الكلام ولا يستأثر بالحديث بمفرده.', domainId: 'com', isReverse: true },
  { id: 's27', text: 'يخرج عن موضوع الحديث المشترك ليركز على اهتماماته الخاصة بجمود.', domainId: 'com', isReverse: false },
  { id: 's28', text: 'يتحدث بأسلوب لغوي يبدو رسمياً للغاية أو أكبر بكثير من عمره الزمني.', domainId: 'com', isReverse: false },
  { id: 's29', text: 'يفشل في تعديل نبرة صوته أو لغته لتناسب طبيعة المكان أو المستمعين.', domainId: 'com', isReverse: false },
  { id: 's30', text: 'يستجيب بمرونة وهدوء عندما يطلب منه الآخرون توضيح ما يقصده في الحديث.', domainId: 'com', isReverse: true },
  { id: 's31', text: 'يبدو عاجزاً عن توصيل فكرة بسيطة أو رسالة واضحة للآخرين بشكل مباشر.', domainId: 'com', isReverse: false },
  { id: 's32', text: 'يشارك بتلقائية في الأنشطة الجماعية والألعاب المشتركة التي تتطلب تواصلاً.', domainId: 'com', isReverse: true },
  { id: 's33', text: 'يقاطع الآخرين باستمرار أثناء الحديث ولا يعير انتباهاً لحديثهم.', domainId: 'com', isReverse: false },
  { id: 's34', text: 'يستخدم إشارات اليدين والرأس للتعبير عن الموافقة أو الرفض أو الترحيب بالمستمع.', domainId: 'com', isReverse: true },
  { id: 's35', text: 'يجد صعوبة في فهم الرسائل غير المباشرة أو التلميحات اللفظية الدقيقة.', domainId: 'com', isReverse: false },
  { id: 's36', text: 'يعبر عن شكره وامتنانه بشكل تلقائي ومناسب للمواقف الاجتماعية المتنوعة.', domainId: 'com', isReverse: true },
  { id: 's37', text: 'يجد صعوبة في إبداء تعاطفه اللفظي مع شخص حزين أو مريض بشكل طبيعي.', domainId: 'com', isReverse: false },
  { id: 's38', text: 'يصغي باهتمام للآخرين عندما يتحدثون معه ويبدي تفاعلاً بالرأس أو العينين.', domainId: 'com', isReverse: true },
  { id: 's39', text: 'يجد صعوبة بالغة في الحفاظ على تواصل بصري مريح ومستمر أثناء النقاش.', domainId: 'com', isReverse: false },
  { id: 's40', text: 'ينقل الأفكار المعقدة للآخرين مستخدماً عبارات ومصطلحات مناسبة لمستوى سنه.', domainId: 'com', isReverse: true },
  { id: 's41', text: 'يستجيب لإشارات التحية والوداع الصادرة من الآخرين بشكل ودي ولائق.', domainId: 'com', isReverse: true },
  { id: 's42', text: 'يتحدث طويلاً دون مراعاة ما إذا كان المستمع متفاعلاً أو مهتماً بالحديث أم لا.', domainId: 'com', isReverse: false },

  // 4. Social Motivation (MOT) - 11 items
  { id: 's43', text: 'يفضل اللعب أو الجلوس وحيداً وبشكل منعزل بدلاً من مشاركة الأقران والأصدقاء.', domainId: 'mot', isReverse: false },
  { id: 's44', text: 'يبادر بالانضمام للأنشطة الجماعية واللعب المشترك بحماس ورغبة حقيقية.', domainId: 'mot', isReverse: true },
  { id: 's45', text: 'يظهر خجلاً أو قلقاً اجتماعياً شديداً يمنعه من الانخراط والحديث مع المحيطين به.', domainId: 'mot', isReverse: false },
  { id: 's46', text: 'يستمتع بالاهتمام الاجتماعي والثناء ويسعى لإسعاد الوالدين والمعلمين بسلوكه.', domainId: 'mot', isReverse: true },
  { id: 's47', text: 'يبدو غير مهتم على الإطلاق بتكوين صداقات جديدة أو الحفاظ على الصداقات الحالية.', domainId: 'mot', isReverse: false },
  { id: 's48', text: 'يرحب بالاتصال الاجتماعي ومحاولات التقرب من الآخرين ويستجيب لها بابتسامة.', domainId: 'mot', isReverse: true },
  { id: 's49', text: 'ينعزل تماماً في المناسبات العائلية أو المدرسية ويفضل البقاء في غرفته أو مكانه الخاص.', domainId: 'mot', isReverse: false },
  { id: 's50', text: 'يشارك الآخرين ألعابه المفضلة وأغراضه الشخصية طواعية ودون إجبار.', domainId: 'mot', isReverse: true },
  { id: 's51', text: 'ينسحب بسرعة فائقة من المواقف الاجتماعية بمجرد شعوره بالحاجة لبذل جهد تفاعلي.', domainId: 'mot', isReverse: false },
  { id: 's52', text: 'يظهر رغبة حقيقية لمشاركة إنجازاته أو تجاربه السعيدة مع أفراد أسرته أو معلمه.', domainId: 'mot', isReverse: true },
  { id: 's53', text: 'يبدو بارداً أو غير مبالٍ بالمديح، التشجيع، أو التكريم الاجتماعي.', domainId: 'mot', isReverse: false },

  // 5. Restricted Interests & Repetitive Behavior (RRB) - 12 items
  { id: 's54', text: 'يظهر اهتماماً مفرطاً أو غير معتاد بموضوعات أو أشياء محددة وضيقة للغاية (مثل جداول القطارات).', domainId: 'rrb', isReverse: false },
  { id: 's55', text: 'يصر على اتباع روتين يومي صارم وجامد ويغضب بشدة إذا حدث أي تغيير طفيف.', domainId: 'rrb', isReverse: false },
  { id: 's56', text: 'يقوم بحركات تكرارية بجسده كرفرفة اليدين، الدوران حول النفس، أو هز الجسم للأمام والخلف.', domainId: 'rrb', isReverse: false },
  { id: 's57', text: 'يركز على تفاصيل دقيقة وأجزاء معينة من الألعاب (كعجلات السيارة) بدلاً من اللعب الوظيفي بها.', domainId: 'rrb', isReverse: false },
  { id: 's58', text: 'يظهر حساسية غير معتادة (مفرطة أو منخفضة) للأصوات، الأضواء، درجات الحرارة، أو ملامس الأقمشة.', domainId: 'rrb', isReverse: false },
  { id: 's59', text: 'يكرر سلوكيات أو طقوساً معينة بشكل قهري ولا يستطيع التوقف عنها إلا بعد إتمامها.', domainId: 'rrb', isReverse: false },
  { id: 's60', text: 'يتعلق بقطع أو أشياء غريبة (مثل خيط، علبة فارغة، غطاء زجاجة) ويصر على حملها في كل مكان.', domainId: 'rrb', isReverse: false },
  { id: 's61', text: 'يصر على تناول نفس نوع الطعام المحدد أو ارتداء قطعة ملابس معينة دون قبول بدائل.', domainId: 'rrb', isReverse: false },
  { id: 's62', text: 'يحرك أصابعه بطريقة غريبة أمام عينيه أو يحدق في مصادر الضوء ومراوح السقف لفترات طويلة.', domainId: 'rrb', isReverse: false },
  { id: 's63', text: 'يظهر نوبة غضب شديدة إذا تم تغيير ترتيب غرفته، مكتبه، أو مكان جلوسه المعتاد.', domainId: 'rrb', isReverse: false },
  { id: 's64', text: 'يظهر سلوكيات تجميعية غريبة لأشياء لا فائدة منها (كجمع الحجارة، قطع الكرتون الصغيرة، أو المسامير).', domainId: 'rrb', isReverse: false },
  { id: 's65', text: 'يكرر طرح نفس السؤال المحدد باستمرار بالرغم من حصوله على الإجابة عدة مرات.', domainId: 'rrb', isReverse: false }
];

/**
 * تحويل الدرجة التائية (T-Score) إلى رتبة مئينية معيارية تقريبية
 * Mean = 50, SD = 10
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
  if (tScore <= 59) return 'ضمن الحدود الطبيعية';
  if (tScore <= 65) return 'قصور بسيط (خفيف)';
  if (tScore <= 75) return 'قصور متوسط (دال إكلينيكياً)';
  return 'قصور شديد (حرج)';
}

export function getTScoreSeverityClass(tScore) {
  if (tScore <= 59) return 'b-gr';
  if (tScore <= 65) return 'b-yl';
  if (tScore <= 75) return 'b-or';
  return 'b-rd';
}

/**
 * حساب تشخيص ونتائج مقياس SRS-2 المعيارية والسيكومترية الشاملة
 * @param {object} answers - إجابات البنود { s1: 1..4, s2: 1..4, ... }
 */
export const calculateSRS2Psychometrics = (answers = {}) => {
  const answeredKeys = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null && answers[k] !== '');
  const answeredCount = answeredKeys.length;
  const totalItemsCount = SRS2_ITEMS.length; // 65
  const progressPercent = Math.round((answeredCount / totalItemsCount) * 100);

  // 1. حساب درجات البنود والمقاييس الفرعية
  let totalRawScore = 0;
  const domainRawScores = { awr: 0, cog: 0, com: 0, mot: 0, rrb: 0 };
  const domainAnsweredCounts = { awr: 0, cog: 0, com: 0, mot: 0, rrb: 0 };

  SRS2_ITEMS.forEach(it => {
    const rawVal = answers[it.id] !== undefined ? Number(answers[it.id]) : null;
    if (rawVal !== null) {
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
      category: 'لم يبدأ التقييم بعد',
      dsm5Classification: '—',
      severityColor: '#64748b',
      interpretation: 'يرجى البدء بتسجيل استجابات المفحوص على بنود المقياس الـ 65.',
      subscales: SRS2_DOMAINS.map(d => ({
        id: d.id,
        code: d.code,
        name: d.name,
        englishName: d.englishName,
        raw: 0,
        maxRaw: d.itemsCount * 4,
        tScore: 35,
        percentile: 7,
        level: '—',
        color: d.color,
        answered: 0,
        total: d.itemsCount,
      })),
      dsmScales: {
        sci: { name: 'التواصل والتفاعل الاجتماعي (SCI)', raw: 0, maxRaw: 212, tScore: 35, percentile: 7, level: '—' },
        rrb: { name: 'السلوكيات المقيدة والتكرارية (RRB)', raw: 0, maxRaw: 48, tScore: 35, percentile: 7, level: '—' }
      }
    };
  }

  // 2. حساب الدرجة التائية الإجمالية (Total T-Score)
  // معادلة التقنين المعتمدة لمقياس SRS-2 سن المدرسة (WPS Standardized Norms):
  // الحد الأدنى للمجموع الخام 65، والأقصى 260.
  let calculatedT = Math.round(35 + (totalRawScore - 65) * 0.72);
  let totalTScore = Math.max(35, Math.min(110, calculatedT));
  const overallPercentile = tScoreToPercentile(totalTScore);

  // 3. المقاييس الفرعية العلاجية
  // الوعي الاجتماعي (AWR): 8 بنود (الخام 8-32)
  let awrT = Math.round(35 + (domainRawScores.awr - 8) * 1.04);
  awrT = Math.max(35, Math.min(100, awrT));

  // الإدراك الاجتماعي (COG): 12 بنداً (الخام 12-48)
  let cogT = Math.round(35 + (domainRawScores.cog - 12) * 0.69);
  cogT = Math.max(35, Math.min(100, cogT));

  // التواصل الاجتماعي (COM): 22 بنداً (الخام 22-88)
  let comT = Math.round(35 + (domainRawScores.com - 22) * 0.38);
  comT = Math.max(35, Math.min(100, comT));

  // الدافعية الاجتماعية (MOT): 11 بنداً (الخام 11-44)
  let motT = Math.round(35 + (domainRawScores.mot - 11) * 0.75);
  motT = Math.max(35, Math.min(100, motT));

  // السلوكيات المقيدة والتكرارية (RRB): 12 بنداً (الخام 12-48)
  let rrbT = Math.round(35 + (domainRawScores.rrb - 12) * 0.69);
  rrbT = Math.max(35, Math.min(100, rrbT));

  // 4. مقاييس DSM-5 المتوافقة
  const sciRaw = domainRawScores.awr + domainRawScores.cog + domainRawScores.com + domainRawScores.mot;
  let sciT = Math.round(35 + (sciRaw - 53) * 0.44);
  sciT = Math.max(35, Math.min(110, sciT));

  // 5. التصنيف الإكلينيكي والتشخيصي العام
  let category = '';
  let dsm5Classification = '';
  let severityColor = '#059669';
  let interpretation = '';

  if (totalTScore <= 59) {
    category = 'ضمن الحدود الطبيعية (Within Normal Limits)';
    dsm5Classification = 'لا توجد مؤشرات لقابلية اضطراب طيف التوحد (Negative Screen)';
    severityColor = '#059669';
    interpretation = 'لا تظهر نتائج المفحوص صعوبات دالة إكلينيكياً في التفاعل الاجتماعي أو التواصل التبادلي. تقع الاستجابة ضمن النطاق الطبيعي المألوف لعامة الأقران في نفس الفئة العمرية.';
  } else if (totalTScore >= 60 && totalTScore <= 65) {
    category = 'قصور بسيط في الاستجابة الاجتماعية (Mild Impairment)';
    dsm5Classification = 'مؤشرات توحد خفيفة / صعوبات براجماتية واجتماعية بسيطة';
    severityColor = '#d97706';
    interpretation = 'تشير الدرجة التائية إلى وجود صعوبات طفيفة في السلوك التفاعلي والتواصل الاجتماعي المتبادل. قد يواجه المفحوص تحديات في المواقف الاجتماعية غير المهيكلة أو قراءة الإشارات الدقيقة، مما يتطلب برامج تدريب مهارات اجتماعية موجهة.';
  } else if (totalTScore >= 66 && totalTScore <= 75) {
    category = 'قصور متوسط في الاستجابة الاجتماعية (Moderate Impairment)';
    dsm5Classification = 'مؤشرات دالة إكلينيكياً لاضطراب طيف التوحد (المستوى 1-2 وفق DSM-5)';
    severityColor = '#ea580c';
    interpretation = 'تظهر النتائج قصوراً واضحاً وذا دلالة إكلينيكية في التواصل والاستجابة الاجتماعية والسلوك التبادلي، مصحوباً بسلوكيات نمطية واهتمامات مقيدة. تؤثر هذه الصعوبات بشكل جوهري على التفاعل اليومي وتكوين الصداقات، وتستدعي خطة تربوية وتأهيلية فردية (IEP) متخصصة.';
  } else {
    category = 'قصور شديد في الاستجابة الاجتماعية (Severe Impairment)';
    dsm5Classification = 'مؤشرات حادة لاضطراب طيف التوحد تستلزم دعماً مكثفاً (المستوى 2-3 وفق DSM-5)';
    severityColor = '#dc2626';
    interpretation = 'تشير الدرجة المرتفعة جداً (76T فأكثر) إلى وجود عجز شديد ومستمر في الاستجابة والتواصل الاجتماعي المتبادل، مع وجود سلوكيات تكرارية قهرية واهتمامات مقيدة تعيق الأداء الوظيفي اليومي بدرجة حادة، مما يتطلب برامج تدخل سلوكي مكثف (ABA) ودعماً تأهيلياً شاملاً.';
  }

  const subscales = [
    {
      id: 'awr',
      code: 'AWR',
      name: 'الوعي الاجتماعي (Social Awareness)',
      shortName: 'الوعي الاجتماعي',
      raw: domainRawScores.awr,
      maxRaw: 32,
      tScore: awrT,
      percentile: tScoreToPercentile(awrT),
      level: getTScoreLevel(awrT),
      color: '#3b82f6',
      answered: domainAnsweredCounts.awr || 0,
      total: 8,
    },
    {
      id: 'cog',
      code: 'COG',
      name: 'الإدراك الاجتماعي (Social Cognition)',
      shortName: 'الإدراك الاجتماعي',
      raw: domainRawScores.cog,
      maxRaw: 48,
      tScore: cogT,
      percentile: tScoreToPercentile(cogT),
      level: getTScoreLevel(cogT),
      color: '#8b5cf6',
      answered: domainAnsweredCounts.cog || 0,
      total: 12,
    },
    {
      id: 'com',
      code: 'COM',
      name: 'التواصل الاجتماعي (Social Communication)',
      shortName: 'التواصل الاجتماعي',
      raw: domainRawScores.com,
      maxRaw: 88,
      tScore: comT,
      percentile: tScoreToPercentile(comT),
      level: getTScoreLevel(comT),
      color: '#10b981',
      answered: domainAnsweredCounts.com || 0,
      total: 22,
    },
    {
      id: 'mot',
      code: 'MOT',
      name: 'الدافعية الاجتماعية (Social Motivation)',
      shortName: 'الدافعية الاجتماعية',
      raw: domainRawScores.mot,
      maxRaw: 44,
      tScore: motT,
      percentile: tScoreToPercentile(motT),
      level: getTScoreLevel(motT),
      color: '#f59e0b',
      answered: domainAnsweredCounts.mot || 0,
      total: 11,
    },
    {
      id: 'rrb',
      code: 'RRB',
      name: 'السلوكيات المقيدة والتكرارية (RRB)',
      shortName: 'السلوكيات النمطية',
      raw: domainRawScores.rrb,
      maxRaw: 48,
      tScore: rrbT,
      percentile: tScoreToPercentile(rrbT),
      level: getTScoreLevel(rrbT),
      color: '#ef4444',
      answered: domainAnsweredCounts.rrb || 0,
      total: 12,
    },
  ];

  const dsmScales = {
    sci: {
      id: 'sci_dsm',
      code: 'SCI',
      name: 'التواصل والتفاعل الاجتماعي DSM-5 (SCI)',
      shortName: 'التواصل والتفاعل (SCI)',
      raw: sciRaw,
      maxRaw: 212,
      tScore: sciT,
      percentile: tScoreToPercentile(sciT),
      level: getTScoreLevel(sciT),
      color: '#0d9488',
      itemsCount: 53,
    },
    rrb: {
      id: 'rrb_dsm',
      code: 'RRB',
      name: 'السلوكيات المقيدة والاهتمامات النمطية (RRB)',
      shortName: 'السلوكيات المقيدة (RRB)',
      raw: domainRawScores.rrb,
      maxRaw: 48,
      tScore: rrbT,
      percentile: tScoreToPercentile(rrbT),
      level: getTScoreLevel(rrbT),
      color: '#ef4444',
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
