/**
 * استبيان التواصل الاجتماعي — الإصدار المفتوح (SCQ)
 * Social Communication Questionnaire (SCQ)
 * Open DSM-5 Algorithmic Screener & Clinical Cutoff Scale
 * 
 * أداة مسح وفرز سريعة ومعتمدة دولياً مبنية على خوارزميات المقابلة التشخيصية للتوحد (ADI-R)
 * ومطابقة لمعايير الدليل التشخيصي والإحصائي الخامس (DSM-5).
 * تم تطوير المقياس الأصلي بواسطة: د. مايكل راتر، د. أنتوني بيلي، د. كاثرين لورد
 * (Sir Michael Rutter, Anthony Bailey, & Catherine Lord).
 * 
 * الوظيفة السريرية:
 * 1. الكشف والفرز المبكر عن احتمالية الإصابة باضطراب طيف التوحد (ASD Screening).
 * 2. تحديد الحاجة إلى التقييم التشخيصي المعمق (Cutoff Threshold >= 15).
 * 3. تتبع السلوك عبر نموذجين: استمارة مدى الحياة (Lifetime) واستمارة الوضع الحالي (Current).
 * 4. استخلاص مؤشرات ونقاط الاحتياج لبناء الخطة التربوية الفردية (IEP).
 */

export const SCQ_COPYRIGHT_INFO = {
  scaleFullNameAr: 'استبيان التواصل الاجتماعي المفتوح — SCQ (خوارزمية DSM-5 المفتوحة)',
  scaleFullNameEn: 'Social Communication Questionnaire (SCQ) — Open DSM-5 Screener',
  acronym: 'SCQ',
  authorsAr: 'د. مايكل راتر، د. أنتوني بيلي، د. كاثرين لورد',
  authorsEn: 'Michael Rutter, M.D., Anthony Bailey, M.D., & Catherine Lord, Ph.D.',
  targetAge: 'من عمر 4 سنوات فما فوق (أو عمر عقلي يتجاوز سنتين)',
  diagnosticCategory: 'المسح والفرز لاضطراب طيف التوحد (ASD Screening & Triad/Dyad Algorithm)',
  licensingStatus: 'أداة فرز مقننة مفتوحة للاستخدام الإكلينيكي والميداني والبحثي',
  licensingNotice: 'استمارة فرز مقننة تعتمد خوارزميات ADI-R و DSM-5 للكشف الإكلينيكي وتحديد مستويات الخطورة وعتبة الإحالة التشخيصية.',
  purpose: 'الفرز والمسح المبدئي السريع لاضطراب طيف التوحد وتحديد المفحوصين الذين يحتاجون إلى فحص تشخيصي شامل، ومقارنة الأداء النمائي بين التاريخ التطوري (مدى الحياة) والوضع السلوكي الراهن.',
  cutoffExplanation: 'درجة القطع المعتمدة دولياً هي 15 نقطة فأكثر؛ حصول المفحوص على 15 فأكثر يُشير إلى نتيجة إيجابية لفرز التوحد تتطلب إحالة فورية للتشخيص المعمق، بينما الدرجة 22 فأكثر ترجح وجود أعراض توحد شديدة/كلاسيكية.',
};

export const SCQ_DOMAINS = [
  {
    id: 'social',
    code: 'I',
    name: 'التفاعل الاجتماعي التبادلي',
    nameEn: 'Reciprocal Social Interaction',
    itemsCount: 15,
    maxScore: 15,
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    description: 'يقيس مهارات الاستجابة الاجتماعية، الابتسامة التبادلية، التواصل البصري، مشاركة المشاعر، اللعب مع الأقران والتعاطف.',
  },
  {
    id: 'communication',
    code: 'II',
    name: 'التواصل واللغة',
    nameEn: 'Communication & Language',
    itemsCount: 13,
    maxScore: 13,
    color: '#2563eb',
    bgLight: '#eff6ff',
    borderColor: '#93c5fd',
    description: 'يقيس القدرة على إجراء محادثة تبادلية، استخدام الإيماءات، تقليد الحركات، واللعب التخيلي، بجانب خلو الكلام من النمطية.',
  },
  {
    id: 'repetitive',
    code: 'III',
    name: 'السلوكيات النمطية والاهتمامات المقيدة',
    nameEn: 'Restricted, Repetitive & Stereotyped Behaviors',
    itemsCount: 11,
    maxScore: 11,
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    description: 'يقيس حركات اليد والجسد التكرارية، الاهتمامات الحسية الغريبة، التمسك القهري بالروتين، وإيذاء الذات.',
  },
];

/**
 * بنود استبيان SCQ الأربعين كاملة
 * ملاحظة التصحيح:
 * - البند 1 استطلاعي (قدرة الطفل على الكلام) ولا يدخل في الدرجة الكلية.
 * - إذا كان الطفل غير لفظي (إجابة البند 1: لا)، لا يتم احتساب درجات البنود 2-7.
 * - بعض الأسئلة: الإجابة "نعم" تدل على العرض غير الطبيعي (yesScore = 1, noScore = 0).
 * - بعض الأسئلة: الإجابة "لا" تدل على غياب مهارة نمائية طبيعية (yesScore = 0, noScore = 1).
 */
export const SCQ_ITEMS = [
  {
    id: 1,
    number: 1,
    code: 'SCQ-01',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل يستطيع الطفل الآن التحدث باستخدام عبارات أو جمل قصيرة تتكون من كلمتين أو أكثر؟',
    textEn: 'Is she/he now able to talk using short phrases or sentences?',
    notesAr: 'بند استطلاعي لتحديد الحالة اللغوية: إذا كانت الإجابة "لا"، سيتم تجاوز احتساب البنود من 2 إلى 7 تلقائياً.',
    isGatewayItem: true, // Item 1 determines verbal capability
    abnormalAnswer: 'no', // Not scored in total, but flags non-verbal
    yesScore: 0,
    noScore: 0,
    isScored: false,
    options: [
      { value: 'yes', label: 'نعم (يستطيع التحدث بجمل)', score: 0, desc: 'يتحدث بعبارات وجمل مفهومة مكونة من كلمتين فأكثر.' },
      { value: 'no', label: 'لا (غير لفظي أو كلمات مفردة فقط)', score: 0, desc: 'لا يتحدث، أو ينطق أصواتاً ومقاطع أو كلمات منفردة نادرة فقط.' },
    ],
  },
  {
    id: 2,
    number: 2,
    code: 'SCQ-02',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل تستطيع إجراء محادثة متبادلة طبيعية معه تشتمل على الأخذ والرد والتعبير عن الأفكار؟',
    textEn: 'Can you have a to-and-fro conversation with her/him that involves taking turns or building on what you have said?',
    notesAr: 'يتطلب كلاماً تبادلياً وليس مجرد إجابة بكلمة واحدة لطلب شيء.',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
    requiresVerbal: true,
  },
  {
    id: 3,
    number: 3,
    code: 'SCQ-03',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل سبق له استخدام عبارات غريبة أو تكرار نفس الكلمات أو المقاطع بطريقة شاذة وغير ملائمة للسياق؟',
    textEn: 'Has she/he ever used odd phrases or said the same thing over and over in almost exactly the same way?',
    notesAr: 'مثل ترديد إعلانات أو جمل سمعها سابقاً في مواقف غير مناسبة (Echolalia/Delayed repetition).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
    requiresVerbal: true,
  },
  {
    id: 4,
    number: 4,
    code: 'SCQ-04',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل يخلط أو يعكس الضمائر بصورة متكررة (مثل أن يقول "أنت تريد ماء" عندما يقصد "أنا أريد ماء")؟',
    textEn: 'Has she/he ever used socially inappropriate questions or statements, or mixed up pronouns (e.g. saying "you" for "I")?',
    notesAr: 'عكس الضمائر مؤشر شائع في طيف التوحد (Pronominal Reversal).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
    requiresVerbal: true,
  },
  {
    id: 5,
    number: 5,
    code: 'SCQ-05',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل سبق له استخدام كلمات ابتكرها بنفسه (كلمات جديدة خاصة به) أو عبارات مجازية غريبة لا يفهمها سواه؟',
    textEn: 'Has she/he ever used words that seemed to be invented or made up, or said things in an odd indirect way?',
    notesAr: 'ابتكار ألفاظ ومصطلحات خاصة (Neologisms / idiosyncratic language).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
    requiresVerbal: true,
  },
  {
    id: 6,
    number: 6,
    code: 'SCQ-06',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل يصر على تكرار نفس العبارات أو الكلمات مراراً وتكراراً بنمطية وبنفس النبرة المحددة؟',
    textEn: 'Has she/he ever said the same thing over and over in almost exactly the same way or insisted that you say the same thing?',
    notesAr: 'طقوس كلامية متكررة أو إجبار الوالدين على الرد بعبارة محددة.',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
    requiresVerbal: true,
  },
  {
    id: 7,
    number: 7,
    code: 'SCQ-07',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل يستخدم نبرة صوت غير عادية أو رتيبة (كأن يتحدث مثل الروبوت، أو بنغمة غنائية، أو نبرة مرتفعة حادة)؟',
    textEn: 'Has she/he ever had an odd or peculiar tone of voice (e.g. sounding robot-like, sing-song, or high-pitched)?',
    notesAr: 'اضطراب التنغيم الصوتي (Atypical Prosody / Monotone speech).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
    requiresVerbal: true,
  },
  {
    id: 8,
    number: 8,
    code: 'SCQ-08',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل يقوم بحركات غريبة وغير مألوفة بيديه أو أصابعه (كالرفرفة، الثني، التلويح أمام العينين)؟',
    textEn: 'Has she/he ever had odd ways of moving her/his hands or fingers, such as flapping or moving them near the eyes?',
    notesAr: 'لزمات اليدين والأصابع النمطية (Hand flapping / finger flicking).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
  {
    id: 9,
    number: 9,
    code: 'SCQ-09',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل يقوم بحركات معقدة بجسده بالكامل (مثل الدوران حول نفسه، التأرجح المتواصل، أو القفز المتكرر)؟',
    textEn: 'Has she/he ever had complicated movements of her/his whole body, such as spinning, rocking, or jumping up and down?',
    notesAr: 'لزمات وحركات نمطية حركية كبرى (Body rocking / spinning).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
  {
    id: 10,
    number: 10,
    code: 'SCQ-10',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل يؤذي نفسه عمداً (مثل عض يديه، صفع وجهه، أو ضرب رأسه بالحائط أو الأرض)؟',
    textEn: 'Has she/he ever deliberately injured her/himself, such as biting arm or banging head?',
    notesAr: 'سلوكيات إيذاء الذات (Self-injurious behavior).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
  {
    id: 11,
    number: 11,
    code: 'SCQ-11',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل يتعلق بأشياء غير معتادة أو يهتم بأجزاء معينة من الألعاب (كتدوير عجلات السيارات أو فتح وإغلاق الأبواب مراراً)؟',
    textEn: 'Has she/he ever had things she/he seemed to have to carry around, or unusual interest in parts of toys (e.g. spinning wheels)?',
    notesAr: 'الانشغال بأجزاء الأشياء واستخدام الألعاب بنمطية غير وظيفية.',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
  {
    id: 12,
    number: 12,
    code: 'SCQ-12',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل لديه اهتمامات خاصة مكثفة جداً وغير مألوفة للأطفال في عمره (مثل حفظ جداول مواعيد أو أرقام أو ماركات سيارات)؟',
    textEn: 'Has she/he ever had any special interests that seem unusual in their intensity or focus (e.g. timetables, traffic lights)?',
    notesAr: 'اهتمامات مقيدة ومحدودة في مجالات دقيقة (Circumscribed intense interests).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
  {
    id: 13,
    number: 13,
    code: 'SCQ-13',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل يهتم بشدة بالجوانب الحسية للأشياء (مثل شم الأشياء باستمرار، تلمس الأسطح، أو الاستماع للأصوات عن قرب)؟',
    textEn: 'Has she/he ever seemed unusually interested in the sight, feel, sound, taste, or smell of things or people?',
    notesAr: 'اهتمامات حسية غير عادية (Atypical sensory exploration).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
  {
    id: 14,
    number: 14,
    code: 'SCQ-14',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل يصر على أداء أنشطة يومية محددة أو طقوس معينة بنفس الترتيب التام ويغضب إذا قوطع؟',
    textEn: 'Has she/he ever had any rituals or routines that she/he insists on carrying out in a very particular way?',
    notesAr: 'طقوس وسلوكيات قهرية صارمة (Rigid behavioral rituals).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
  {
    id: 15,
    number: 15,
    code: 'SCQ-15',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل ينزعج بشدة من أدنى تغيير في الروتين المألوف أو في ترتيب أثاث المنزل ومواعيد الأنشطة؟',
    textEn: 'Does she/he get very upset if there is a minor change to a familiar routine or to the layout of the home?',
    notesAr: 'مقاومة التغيير والإصرار على التطابق (Resistance to change).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
  {
    id: 16,
    number: 16,
    code: 'SCQ-16',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'عندما تنظر إلى شيء وتشير إليه عبر الغرفة، هل ينظر الطفل في نفس الاتجاه ليرى ما تنظر إليه؟',
    textEn: 'When you look at and point to something across the room, does she/he look at it?',
    notesAr: 'الانتباه المشترك البصري (Following gaze & joint attention).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 17,
    number: 17,
    code: 'SCQ-17',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يبتسم لك استجابة لابتسامتك عندما تبتسم له وتتواصل معه بود؟',
    textEn: 'Does she/he smile back when you smile at her/him?',
    notesAr: 'الابتسامة الاجتماعية التبادلية (Social smile).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 18,
    number: 18,
    code: 'SCQ-18',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يريك أو يحضر لك أشياء تثير اهتمامه لمجرد مشاركتها معك وليس لطلب المساعدة؟',
    textEn: 'Does she/he ever show you things or bring them to you just to share her/his interest (not to get help)?',
    notesAr: 'مشاركة الاهتمام التلقائية (Showing & sharing interest).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 19,
    number: 19,
    code: 'SCQ-19',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يستخدم إصبعه السبابة للإشارة إلى أشياء بعيدة تثير اهتمامه ليجذب انتباهك إليها؟',
    textEn: 'Does she/he point with index finger at things just to show you something interesting (proto-declarative pointing)?',
    notesAr: 'الإشارة التقريرية للانتباه المشترك (Declarative pointing).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 20,
    number: 20,
    code: 'SCQ-20',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل يومئ برأسه بالموافقة للتعبير عن "نعم"، أو يهز رأسه للتعبير عن "لا"؟',
    textEn: 'Does she/he nod her/his head for "yes" or shake her/his head for "no"?',
    notesAr: 'استخدام إيماءات الرأس التعبيرية (Nodding / shaking head).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 21,
    number: 21,
    code: 'SCQ-21',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل يلوح بيده لتوديع الآخرين ("مع السلامة" أو "باي باي") بشكل تلقائي ومناسب؟',
    textEn: 'Does she/he wave goodbye on her/his own when someone is leaving, or when expected?',
    notesAr: 'الإيماءات الاجتماعية التقليدية (Waving goodbye).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 22,
    number: 22,
    code: 'SCQ-22',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل ينظر مباشرة في عينيك أثناء الحديث أو اللعب أو عند طلب شيء بطريقة طبيعية؟',
    textEn: 'Does she/he look right at your face or eyes when interacting with you?',
    notesAr: 'التواصل البصري التبادلي المناسب (Direct eye contact).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 23,
    number: 23,
    code: 'SCQ-23',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يلتفت ويستجيب فوراً عند مناداته باسمه دون الحاجة للمس أو رفع الصوت؟',
    textEn: 'Does she/he respond by turning around or looking when you call her/his name?',
    notesAr: 'الاستجابة لنداء الاسم (Response to name).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 24,
    number: 24,
    code: 'SCQ-24',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل يستخدم تعبيرات وجه واضحة للتعبير عن مشاعره (كالابتسام عند الفرح أو التكشير عند الغضب)؟',
    textEn: 'Does she/he have a range of facial expressions that communicate feelings to you appropriately?',
    notesAr: 'تعبيرات الوجه التواصلية (Communicative facial expressions).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 25,
    number: 25,
    code: 'SCQ-25',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل يقلد حركاتك أو أفعالك تلقائياً (مثل مسح الطاولة، التصفيق، أو تظاهر التحدث بالهاتف)؟',
    textEn: 'Does she/he copy actions that you do spontaneously, such as clapping hands or pretending to cook?',
    notesAr: 'التقليد الحركي التلقائي (Spontaneous imitation).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 26,
    number: 26,
    code: 'SCQ-26',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يشاركك ألعابه أو طعامه برحابة، أو يقدم لك شيئاً بيده لمشاركتك متعة الشيء؟',
    textEn: 'Does she/he offer to share things with you, such as food or toys, just for the pleasure of sharing?',
    notesAr: 'المشاركة الاجتماعية التلقائية (Offering and sharing).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 27,
    number: 27,
    code: 'SCQ-27',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'إذا رأى شخصاً يبكي أو يتألم أو منزعجاً، هل يظهر عليه التعاطف أو يحاول مواساته؟',
    textEn: 'If someone is upset or hurt, does she/he seem to notice and try to comfort them or show concern?',
    notesAr: 'التعاطف الوجداني والاستجابة لمشاعر الآخرين (Empathy & comforting).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 28,
    number: 28,
    code: 'SCQ-28',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يستجيب باهتمام وسعادة عندما يقترب منه أطفال آخرون لمحاولة التفاعل معه؟',
    textEn: 'Does she/he respond positively and appropriately when other children approach her/him to play?',
    notesAr: 'الاستجابة للاقتراب الاجتماعي من الأقران (Response to peers).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 29,
    number: 29,
    code: 'SCQ-29',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يبادر هو نفسه بالاقتراب من الأطفال الآخرين ومحاولة بدء اللعب أو التحدث معهم؟',
    textEn: 'Does she/he initiate interactions or try to join in play with other children of her/his age?',
    notesAr: 'المبادرة بالتفاعل مع الأقران (Initiating peer interactions).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 30,
    number: 30,
    code: 'SCQ-30',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يشارك بحماس في ألعاب جماعية تشتمل على تبادل أدوار وقواعد بسيطة (مثل الاستغماية، الجري والتتابع)؟',
    textEn: 'Does she/he enjoy and participate in simple social games with rules, like hide-and-seek or tag?',
    notesAr: 'اللعب الجماعي المنظم وتبادل الأدوار (Group games with rules).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 31,
    number: 31,
    code: 'SCQ-31',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل يشارك في اللعب التخيلي والتمثيلي (مثل إطعام دمية، تمثيل دور طبيب، أو جعل مكعب يبدو كسيارة)؟',
    textEn: 'Does she/he engage in imaginative or make-believe play (e.g. pretending to feed a doll, driving a toy)?',
    notesAr: 'اللعب التخيلي الرمزي (Imaginative & symbolic play).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 32,
    number: 32,
    code: 'SCQ-32',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يلعب مع أطفال آخرين بشكل تعاوني ومترابط وليس مجرد لعب موازٍ بجوارهم بمفرده؟',
    textEn: 'Does she/he play cooperatively with other children, rather than just playing alongside them?',
    notesAr: 'اللعب التعاوني التفاعلي (Cooperative vs parallel play).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 33,
    number: 33,
    code: 'SCQ-33',
    domainId: 'communication',
    domainName: 'التواصل واللغة',
    textAr: 'هل يستخدم يدك أو يد شخص آخر كأداة للوصول لشيء (يمسك يدك ليضعها على مقبض الباب دون أن ينظر إليك)؟',
    textEn: 'Does she/he ever use another person\'s hand or body as a tool, like placing your hand on a doorknob without eye contact?',
    notesAr: 'استخدام جسد الآخرين كأداة (Using another\'s body as a mechanical tool).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
  {
    id: 34,
    number: 34,
    code: 'SCQ-34',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يبدو مدركاً ومنتبهاً لما يفعله ويقوله الأشخاص الآخرون في نفس الغرفة؟',
    textEn: 'Does she/he seem generally aware of and interested in what other people around her/him are doing or feeling?',
    notesAr: 'الوعي الاجتماعي بالمحيطين (Social awareness).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 35,
    number: 35,
    code: 'SCQ-35',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يقترب من الآخرين بطريقة اجتماعية ملائمة وودودة وليس بأسلوب اندفاعي أو غريب؟',
    textEn: 'Does she/he approach other people in a socially appropriate and friendly way?',
    notesAr: 'الاقتراب الاجتماعي المتوافق (Appropriate social approach).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 36,
    number: 36,
    code: 'SCQ-36',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يتفاعل معك بطريقة تعبر عن المودة والمحبة المتبادلة وليس فقط عند حاجته لطلب شيء؟',
    textEn: 'Does she/he show warm, mutual affection towards you, not just when she/he wants something?',
    notesAr: 'المودة الاجتماعية التبادلية الدافئة (Warm mutual affection).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 37,
    number: 37,
    code: 'SCQ-37',
    domainId: 'social',
    domainName: 'التفاعل الاجتماعي التبادلي',
    textAr: 'هل يتقبل العناق والملامسة الجسدية الودية برحابة وارتياح من المقربين؟',
    textEn: 'Does she/he comfortably accept and enjoy physical affection, like hugs from parents or close relatives?',
    notesAr: 'تقبل الملامسة والاحتضان الودود (Comfort with physical affection).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 38,
    number: 38,
    code: 'SCQ-38',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل يبدي فضولاً طبيعياً واستكشافاً مرناً لألعابه وأدواته الجديدة دون جمود أو نفور؟',
    textEn: 'Does she/he show healthy, exploratory curiosity toward new toys, places, or everyday objects?',
    notesAr: 'الاستكشاف النمائي المرن (Normal exploratory interest).',
    abnormalAnswer: 'no',
    yesScore: 0,
    noScore: 1,
    isScored: true,
  },
  {
    id: 39,
    number: 39,
    code: 'SCQ-39',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل ينزعج أو يغطي أذنيه أو يصرخ بشكل غير عادي عند سماع أصوات يومية معتادة (كالخلاط، المكنسة الكهربائية)؟',
    textEn: 'Is she/he unusually sensitive or distressed by everyday sounds (e.g. vacuum cleaner, blender, hair dryer)?',
    notesAr: 'فرط التحسس السمعي (Auditory hypersensitivity).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
  {
    id: 40,
    number: 40,
    code: 'SCQ-40',
    domainId: 'repetitive',
    domainName: 'السلوكيات النمطية والاهتمامات المقيدة',
    textAr: 'هل يبدو أحياناً كأنه "أصم" أو لا يسمعك تماماً رغم أن فحوصات السمع أثبتت سلامة سمعه التامة؟',
    textEn: 'Does she/he sometimes act as if she/he were deaf, not responding to sounds or voices, despite normal hearing?',
    notesAr: 'مفارقة الاستجابة السمعية (Selective responsiveness / auditory paradox).',
    abnormalAnswer: 'yes',
    yesScore: 1,
    noScore: 0,
    isScored: true,
  },
];

/**
 * دالة حساب الدرجات السيكومترية وخوارزمية الفرز (SCQ Psychometrics & Cutoff Algorithm)
 */
export function calculateSCQPsychometrics(answers = {}) {
  // Check gateway item 1 (talking ability)
  const item1Answer = answers[1] || answers['1'] || null;
  const isNonVerbal = item1Answer === 'no';

  let totalScore = 0;
  let answeredCount = 0;
  let maxPossibleScore = isNonVerbal ? 33 : 39;

  const domainScores = {
    social: { name: 'التفاعل الاجتماعي التبادلي', score: 0, max: 15, itemsCount: 15, answered: 0 },
    communication: { name: 'التواصل واللغة', score: 0, max: isNonVerbal ? 7 : 13, itemsCount: isNonVerbal ? 7 : 13, answered: 0 },
    repetitive: { name: 'السلوكيات النمطية والاهتمامات المقيدة', score: 0, max: 11, itemsCount: 11, answered: 0 },
  };

  SCQ_ITEMS.forEach(it => {
    if (it.id === 1) {
      if (item1Answer) answeredCount += 1;
      return;
    }

    // If child is non-verbal, skip verbal items 2-7
    if (isNonVerbal && it.requiresVerbal) {
      return;
    }

    const val = answers[it.id] !== undefined ? answers[it.id] : answers[String(it.id)];
    if (val !== undefined && val !== null && val !== '') {
      answeredCount += 1;
      if (domainScores[it.domainId]) {
        domainScores[it.domainId].answered += 1;
      }

      let itemScore = 0;
      if (val === 'yes') {
        itemScore = it.yesScore;
      } else if (val === 'no') {
        itemScore = it.noScore;
      }

      totalScore += itemScore;
      if (domainScores[it.domainId]) {
        domainScores[it.domainId].score += itemScore;
      }
    }
  });

  const totalEvaluatedItems = isNonVerbal ? 34 : 40; // 1 (gateway) + scored items
  const isComplete = answeredCount >= totalEvaluatedItems;
  const progressPercent = Math.min(100, Math.round((answeredCount / totalEvaluatedItems) * 100));

  // Determine screening threshold and clinical impression based on Cutoff = 15
  let cutoffResult = 'negative'; // negative (low risk) vs positive (positive screen)
  let severityKey = 'low_risk';
  let severityLabel = 'فرز سلبي / خطر منخفض (Within Typical Limits)';
  let severityBadgeClass = 'b-gr';
  let severityColor = '#059669';
  let clinicalRecommendation = '';
  let interpretationAr = '';

  if (totalScore >= 22) {
    cutoffResult = 'positive_high';
    severityKey = 'high_risk';
    severityLabel = 'اشتباه مرتفع جداً / أعراض توحد شديدة (High Risk ASD Screen)';
    severityBadgeClass = 'b-rd';
    severityColor = '#dc2626';
    interpretationAr = `أحرز المفحوص درجة (${totalScore} من ${maxPossibleScore})، وهي تتجاوز عتبة الفرز الأساسية (15) وعتبة الخطورة المرتفعة (22). تدل هذه النتيجة بقوة على وجود مؤشرات سيكومترية بارزة تتماشى مع اضطراب طيف التوحد (Classic Autism Spectrum Profile) في مجالات التفاعل الاجتماعي والتواصل والأنماط التكرارية.`;
    clinicalRecommendation = '1. إحالة عاجلة ذات أولوية قصوى لتقييم تشخيصي رسمي متعدد التخصصات (مثل مقياس CARS-2 أو ADOS-2).\n2. البدء المباشر في برنامج تدخل مبكر مكثف مبني على تحليل السلوك التطبيقي (ABA).\n3. تقييم احتياجات النطق والتخاطب وتطبيق وسائل التواصل المعزز والبديل (AAC) إذا تطلب الأمر.\n4. استشارة علاج وظيفي وتكامل حسي للتعامل مع الحساسيات واللزمات الحركية.';
  } else if (totalScore >= 15) {
    cutoffResult = 'positive';
    severityKey = 'positive_screen';
    severityLabel = 'فرز إيجابي / اشتباه باضطراب طيف التوحد (Positive ASD Screen >= 15)';
    severityBadgeClass = 'b-or';
    severityColor = '#d97706';
    interpretationAr = `أحرز المفحوص درجة (${totalScore} من ${maxPossibleScore})، وهي تساوي أو تتجاوز نقطة القطع السريرية المعتمدة دولياً (Cutoff Score = 15). تُشير هذه النتيجة الإيجابية إلى احتمالية مرتفعة لوجود اضطراب طيف التوحد، مما يستدعي إجراء تقييم سريري شامل للتأكد من التشخيص.`;
    clinicalRecommendation = '1. إحالة فورية للعيادة النفسية أو مركز التشخيص لإجراء فحص تشخيصي كامل (CARS-2 / GARS-3 / ADI-R).\n2. وضع خطة تدخل وتأهيل تركز على أوجه القصور المرصودة في بنود التفاعل الاجتماعي واللغة.\n3. تدريب الأسرة على تعزيز الانتباه المشترك والتواصل البصري والمبادرة التفاعلية في البيئة المنزلية.\n4. متابعة تقدم الطفل بعد 3 أشهر باستخدام استمارة SCQ الحالية (Current Form).';
  } else {
    cutoffResult = 'negative';
    severityKey = 'low_risk';
    severityLabel = 'فرز سلبي / خطر منخفض (Low Risk ASD Screen < 15)';
    severityBadgeClass = 'b-gr';
    severityColor = '#059669';
    interpretationAr = `أحرز المفحوص درجة (${totalScore} من ${maxPossibleScore})، وهي تقع دون عتبة القطع السريرية (15). تُشير النتيجة إلى أن سلوكيات الطفل النمائية والتواصلية تقع ضمن الحدود المقبولة، ولا توجد مؤشرات كافية للاشتباه في اضطراب طيف التوحد حالياً.`;
    clinicalRecommendation = '1. لا يتطلب التقييم الحالي إحالة تشخيصية متخصصة لطيف التوحد، إلا إذا كانت هناك ملاحظات إكلينيكية مباشرة أخرى.\n2. إذا كان هناك تأخر نمائي في الكلام فقط، يوصى بفحص السمع وتقييم لغوي تخاطبي مستقل.\n3. متابعة رصد التطور النمائي خلال الزيارات الدورية الروتينية.';
  }

  return {
    isComplete,
    answeredCount,
    totalItems: totalEvaluatedItems,
    progressPercent,
    rawScore: totalScore,
    maxScore: maxPossibleScore,
    isNonVerbal,
    cutoffScore: 15,
    cutoffResult,
    severityKey,
    severityLabel,
    severityBadgeClass,
    severityColor,
    interpretationAr,
    clinicalRecommendation,
    domainScores,
  };
}

/**
 * دالة استدعاء متوافقة مع بنك المقاييس
 */
export function calculateSCQScore(answers = {}) {
  return calculateSCQPsychometrics(answers);
}
