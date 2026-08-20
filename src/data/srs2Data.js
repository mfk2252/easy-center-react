/**
 * SRS-2 (Social Responsiveness Scale, Second Edition)
 * مقياس الاستجابة الاجتماعية - الإصدار الثاني
 * 
 * يتكون المقياس من 65 عبارة موزعة على 5 مقاييس فرعية علاجية، ومقياسين متوافقين مع DSM-5.
 * خيارات الاستجابة رباعية التدريج (1 إلى 4):
 * 1: غير صحيح على الإطلاق (Not True)
 * 2: صحيح أحياناً (Sometimes True)
 * 3: صحيح غالباً (Often True)
 * 4: صحيح دائماً تقريباً (Almost Always True)
 * 
 * المنهجية العلمية لحساب النتائج:
 * - العبارات الإيجابية يتم عكس درجاتها (الدرجة = 5 - القيمة المختارة) لتمثيل القصور في الاستجابة الاجتماعية.
 * - العبارات السلبية (مؤشرات القصور) تحسب كما هي (الدرجة = القيمة المختارة).
 * - تحول الدرجات الخام الكلية والفرعية إلى درجات تائية (T-Scores) معيارية ورتب مئينية.
 */

export const SRS2_RESPONSE_OPTIONS = [
  { value: 1, label: 'غير صحيح على الإطلاق', text: 'لم يلاحظ السلوك إطلاقاً (1)' },
  { value: 2, label: 'صحيح أحياناً', text: 'يظهر السلوك أحياناً (2)' },
  { value: 3, label: 'صحيح غالباً', text: 'يظهر السلوك غالباً (3)' },
  { value: 4, label: 'صحيح دائماً تقريباً', text: 'يظهر السلوك بشكل مستمر تقريباً (4)' }
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
 * حساب تشخيص ونتائج مقياس SRS-2 بناءً على إجابات المستخدم
 * 
 * المنهجية:
 * 1. حساب الدرجة الخام لكل بند (مع عكس درجات البنود الإيجابية: الدرجة = 5 - الإجابة).
 * 2. جمع الدرجات الخام الكلية والفرعية للمجالات الـ 5.
 * 3. تحويل الدرجات الخام إلى درجات تائية (T-Scores) معيارية:
 *    - الدرجة التائية الإجمالية (Total T-Score)
 *    - الدرجات التائية للمقاييس الفرعية العلاجية (AWR, COG, COM, MOT, RRB)
 *    - درجات مقاييس DSM-5 المتوافقة: SCI (التواصل والتفاعل الاجتماعي) و RRB (السلوكيات المتكررة).
 * 4. تحديد التقييم الإكلينيكي بناءً على الأدلة العلمية لمقياس SRS-2:
 *    - 59 فأقل: ضمن الحدود الطبيعية (Within Normal Limits)
 *    - 60 إلى 65: قصور بسيط (Mild Social Impairment)
 *    - 66 إلى 75: قصور متوسط (Moderate Social Impairment)
 *    - 76 فأكثر: قصور شديد (Severe Social Impairment)
 */
export const calculateSRS2Score = (answers = {}) => {
  const answeredCount = Object.keys(answers).length;
  
  if (answeredCount < 65) {
    return {
      isComplete: false,
      answeredCount,
      totalRawScore: 0,
      totalTScore: 0,
      category: 'يرجى الإجابة على جميع البنود الـ 65 لإتمام التشخيص بدقة',
      severityColor: 'gray',
      subscales: []
    };
  }

  // 1. حساب درجات البنود (مع العكس للعبارات الإيجابية)
  let totalRawScore = 0;
  const domainRawScores = { awr: 0, cog: 0, com: 0, mot: 0, rrb: 0 };

  SRS2_ITEMS.forEach(it => {
    const rawVal = Number(answers[it.id] ?? 1); // الافتراضي 1 (غير صحيح)
    let score = rawVal;
    if (it.isReverse) {
      score = 5 - rawVal; // عكس الدرجة: 1->4, 2->3, 3->2, 4->1
    }
    totalRawScore += score;
    domainRawScores[it.domainId] += score;
  });

  // 2. حساب الدرجة التائية الإجمالية (Total T-Score)
  // معادلة التقنين التقديرية بناءً على العينة المعيارية لسن المدرسة:
  // T = 35 + (Raw - 65) * 0.72  (مع وضع حد أدنى 35 وأقصى 110)
  let totalTScore = Math.round(35 + (totalRawScore - 65) * 0.72);
  if (totalTScore < 35) totalTScore = 35;
  if (totalTScore > 110) totalTScore = 110;

  // 3. حساب المقاييس الفرعية (Subscales)
  // الوعي الاجتماعي (AWR): 8 بنود، نطاق الدرجات: 8 - 32. معادلة التائية: T = 35 + (Raw - 8) * 1.04
  let awrT = Math.round(35 + (domainRawScores.awr - 8) * 1.04);
  awrT = Math.max(35, Math.min(100, awrT));

  // الإدراك الاجتماعي (COG): 12 بنداً، نطاق الدرجات: 12 - 48. معادلة التائية: T = 35 + (Raw - 12) * 0.69
  let cogT = Math.round(35 + (domainRawScores.cog - 12) * 0.69);
  cogT = Math.max(35, Math.min(100, cogT));

  // التواصل الاجتماعي (COM): 22 بنداً، نطاق الدرجات: 22 - 88. معادلة التائية: T = 35 + (Raw - 22) * 0.38
  let comT = Math.round(35 + (domainRawScores.com - 22) * 0.38);
  comT = Math.max(35, Math.min(100, comT));

  // الدافعية الاجتماعية (MOT): 11 بنداً، نطاق الدرجات: 11 - 44. معادلة التائية: T = 35 + (Raw - 11) * 0.75
  let motT = Math.round(35 + (domainRawScores.mot - 11) * 0.75);
  motT = Math.max(35, Math.min(100, motT));

  // السلوكيات المقيدة والتكرارية (RRB): 12 بنداً، نطاق الدرجات: 12 - 48. معادلة التائية: T = 35 + (Raw - 12) * 0.69
  let rrbT = Math.round(35 + (domainRawScores.rrb - 12) * 0.69);
  rrbT = Math.max(35, Math.min(100, rrbT));

  // 4. حساب مقاييس DSM-5 المتوافقة
  // التواصل والتفاعل الاجتماعي (SCI): يجمع AWR + COG + COM + MOT. البنود: 53 بنداً، المجموع: 53 - 212.
  const sciRaw = domainRawScores.awr + domainRawScores.cog + domainRawScores.com + domainRawScores.mot;
  let sciT = Math.round(35 + (sciRaw - 53) * 0.44);
  sciT = Math.max(35, Math.min(110, sciT));

  // 5. تصنيف شدة الاستجابة الإكلينيكية الإجمالية
  let category = '';
  let severityColor = '';
  let interpretation = '';

  if (totalTScore <= 59) {
    category = 'ضمن الحدود الطبيعية (لا توجد مؤشرات لقابلية التوحد)';
    severityColor = 'green';
    interpretation = 'لا تظهر نتائج الطفل صعوبات دالة إكلينيكياً في التفاعل أو التواصل الاجتماعي المتبادل. السلوك الاجتماعي العام مناسب وضمن الحدود المألوفة.';
  } else if (totalTScore >= 60 && totalTScore <= 65) {
    category = 'قصور بسيط في الاستجابة الاجتماعية';
    severityColor = 'yellow';
    interpretation = 'تشير الدرجة إلى وجود صعوبات طفيفة في السلوك التفاعلي المتبادل. يقع هذا القصور ضمن النطاق الإكلينيكي البسيط، وقد يؤدي إلى بعض التحديات في الاندماج الاجتماعي المريح ولكنه قد لا يعيق التعلم الأساسي.';
  } else if (totalTScore >= 66 && totalTScore <= 75) {
    category = 'قصور متوسط في الاستجابة الاجتماعية (دال إكلينيكياً)';
    severityColor = 'orange';
    interpretation = 'يظهر التقييم صعوبات ملحوظة وذات دلالة إكلينيكية في التواصل والاستجابة الاجتماعية المتبادلة. تؤثر هذه الصعوبات بشكل واضح على تكوين الصداقات والاندماج في الأنشطة اليومية، وتتطلب دعماً تأهيلياً موجهاً.';
  } else {
    category = 'قصور شديد في الاستجابة الاجتماعية (دال إكلينيكياً مرتفع)';
    severityColor = 'red';
    interpretation = 'تشير الدرجة المرتفعة جداً إلى وجود عجز شديد ومستمر في الاستجابة الاجتماعية والسلوك التفاعلي والتواصل المتبادل، مع وجود سلوكيات تكرارية واهتمامات مقيدة تعيق الأداء الوظيفي واليومي للطفل بشكل دائم. يتطلب هذا النطاق تدخلات إكلينيكية وعلاجية وسلوكية مكثفة.';
  }

  const subscales = [
    { id: 'awr', name: 'الوعي الاجتماعي (Social Awareness)', raw: domainRawScores.awr, maxRaw: 32, tScore: awrT, level: getTScoreLevel(awrT), color: '#3b82f6' },
    { id: 'cog', name: 'الإدراك الاجتماعي (Social Cognition)', raw: domainRawScores.cog, maxRaw: 48, tScore: cogT, level: getTScoreLevel(cogT), color: '#8b5cf6' },
    { id: 'com', name: 'التواصل الاجتماعي (Social Communication)', raw: domainRawScores.com, maxRaw: 88, tScore: comT, level: getTScoreLevel(comT), color: '#10b981' },
    { id: 'mot', name: 'الدافعية الاجتماعية (Social Motivation)', raw: domainRawScores.mot, maxRaw: 44, tScore: motT, level: getTScoreLevel(motT), color: '#f59e0b' },
    { id: 'rrb', name: 'السلوكيات المقيدة والتكرارية (RRB)', raw: domainRawScores.rrb, maxRaw: 48, tScore: rrbT, level: getTScoreLevel(rrbT), color: '#ef4444' },
    { id: 'sci_dsm', name: 'التواصل والتفاعل الاجتماعي DSM-5 (SCI)', raw: sciRaw, maxRaw: 212, tScore: sciT, level: getTScoreLevel(sciT), color: '#0d9488' }
  ];

  return {
    isComplete: true,
    answeredCount,
    totalRawScore,
    totalTScore,
    category,
    severityColor,
    interpretation,
    subscales
  };
};

function getTScoreLevel(tScore) {
  if (tScore <= 59) return 'طبيعي';
  if (tScore <= 65) return 'بسيط';
  if (tScore <= 75) return 'متوسط';
  return 'شديد';
}
