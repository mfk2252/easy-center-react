/**
 * دليل بورتيدج للتدخل المبكر (Portage Guide to Early Education - Modern Edition)
 * بطارية التقييم النمائي الشامل للأطفال من الولادة حتى عمر 6 سنوات
 * إعداد وتطوير: S. Bluma, M. Shearer, A. Frohman, J. Hilliard — CESA 5 Portage Project
 * النسخة الكلينيكية المحوسبة والمطورة للتدخل المبكر
 */

export const PORTAGE_COPYRIGHT_INFO = {
  title: 'دليل بورتيدج للتدخل المبكر (Portage Guide to Early Education - Modern Edition)',
  titleEn: 'Portage Guide to Early Education (Modern Clinical Standard)',
  originalAuthors: 'S. Bluma, M. Shearer, A. Frohman, & J. Hilliard',
  institution: 'Cooperative Educational Service Agency (CESA 5) — Portage Project System',
  adaptationAndNorms: 'المعايير العربية المقننة لبرامج التدخل المبكر وتأهيل الطفولة',
  diagnosticNature: 'أداة تقييم ومسح نمائي شامل وتصميم الخطط التربوية الفردية (IEP) للتدخل المبكر',
  hostPlatform: 'منصة إيزي سنتر لتشغيل وتطبيق المقاييس الرقمية (Host Platform)',
  copyrightNotice: 'مستند إلى نظام بورتيدج للتعليم المبكر (CESA 5). مصمم للاستخدام المهني من قبل أخصائيي التربية الخاصة، أخصائيي التدخل المبكر، وموجهي برامج الطفولة المبكرة لتشخيص الفجوات النمائية وبناء البرامج الفردية.',
};

export const PORTAGE_DOMAINS = [
  {
    id: 'infant',
    name: 'قسم نمو الرضيع',
    nameEn: 'Infant Stimulation Checklist',
    icon: '👶',
    color: '#0284c7',
    ageRange: '0 - 1 سنة (0-12 شهر)',
    description: 'تقييم الاستجابات الحسية الأولية، الانعكاسات، التتبع البصري، الاستجابة للأصوات، والتفاعل المبدئي مع البيئة.',
  },
  {
    id: 'socialization',
    name: 'مجال التنشئة الاجتماعية',
    nameEn: 'Socialization Domain',
    icon: '🤝',
    color: '#2563eb',
    ageRange: '0 - 6 سنوات',
    description: 'تقييم التفاعل مع الوالدين والأقران، الابتسامة الاجتماعية، اللعب التشاركي، التعبير عن المشاعر، والمشاركة الصفية.',
  },
  {
    id: 'language',
    name: 'مجال النمو اللغوي والتواصل',
    nameEn: 'Language & Communication Domain',
    icon: '🗣️',
    color: '#0d9488',
    ageRange: '0 - 6 سنوات',
    description: 'تقييم المناغاة، الفهم والاستقبال اللغوي، التعبير اللفظي، تركيب الجمل، استخدام القواعد، والرواية وسرد القصص.',
  },
  {
    id: 'self_help',
    name: 'مجال الرعاية الذاتية والاستقلالية',
    nameEn: 'Self-Help & Independence Domain',
    icon: '🏠',
    color: '#ea580c',
    ageRange: '0 - 6 سنوات',
    description: 'تقييم مهارات تناول الطعام والشراب، ارتداء الملابس وخلعها، النظافة الشخصية، استخدام الحمام، والسلامة اليومية.',
  },
  {
    id: 'cognition',
    name: 'مجال النمو المعرفي والإدراكي',
    nameEn: 'Cognitive & Problem Solving Domain',
    icon: '🧠',
    color: '#7c3aed',
    ageRange: '0 - 6 سنوات',
    description: 'تقييم الانتباه البصري، بقاء الأشياء، المطابقة والتصنيف، المفاهيم الكمية والمكانية، وحل المشكلات والتسلسل.',
  },
  {
    id: 'motor',
    name: 'مجال النمو الحركي والتناسق',
    nameEn: 'Motor & Physical Development Domain',
    icon: '🏃‍♂️',
    color: '#059669',
    ageRange: '0 - 6 سنوات',
    description: 'تقييم الحركات الكبرى (التحكم بالرأس، الجلوس، المشي، التوازن، القفز) والحركات الدقيقة (القبض، القص، مسك القلم).',
  },
];

export const PORTAGE_AGE_BANDS = [
  { id: 'all', label: 'جميع الفئات العمرية (0 - 6 سنوات)' },
  { id: '0-1', label: 'من الولادة حتى 1 سنة (0 - 12 شهر)' },
  { id: '1-2', label: 'من 1 إلى 2 سنة (13 - 24 شهر)' },
  { id: '2-3', label: 'من 2 إلى 3 سنوات (25 - 36 شهر)' },
  { id: '3-4', label: 'من 3 إلى 4 سنوات (37 - 48 شهر)' },
  { id: '4-5', label: 'من 4 إلى 5 سنوات (49 - 60 شهر)' },
  { id: '5-6', label: 'من 5 إلى 6 سنوات (61 - 72 شهر)' },
];

export const PORTAGE_RATING_OPTIONS = [
  { value: 1.0, label: 'متحقق ومكتسب تماماً (Acquired / Yes)', score: 1.0, color: '#059669', badge: 'مكتسب (1.0)' },
  { value: 0.5, label: 'يطبق بمساعدة / في طور الاكتساب (Emerging / Assisted)', score: 0.5, color: '#d97706', badge: 'بمساعدة (0.5)' },
  { value: 0.0, label: 'غير متحقق حالياً (Not Acquired / No)', score: 0.0, color: '#dc2626', badge: 'غير مكتسب (0.0)' },
  { value: -1, label: 'غير مطبق / غير ملائم للمرحلة (N/A)', score: 0.0, color: '#64748b', badge: 'مستثنى (N/A)' },
];

/**
 * بنود مقياس دليل بورتيدج للتدخل المبكر (Portage Items Bank)
 */
export const PORTAGE_ITEMS = [
  // ----------------------------------------------------
  // 1. قسم نمو الرضيع (Infant Stimulation Checklist - 0 to 1)
  // ----------------------------------------------------
  {
    id: 'inf_1',
    num: 1,
    domainId: 'infant',
    ageBand: '0-1',
    text: 'يثبت نظره على وجه الفاحص أو الأم عند التحدث إليه على مسافة 20-30 سم.',
    helperText: 'ضع وجهك على مسافة 20 سم من وجه الرضيع وتحدث بنبرة ودية؛ لاحظ تثبيت العينين لمدة 3 ثوانٍ على الأقل.',
    iepGoal: 'أن يظهر الطفل تثبيتاً بصرياً وتواصلاً بالعين مع مقدم الرعاية عند مناداته لمدة 5 ثوانٍ.',
    domain: 'visual_attention',
  },
  {
    id: 'inf_2',
    num: 2,
    domainId: 'infant',
    ageBand: '0-1',
    text: 'يتبع لعبة ملونة أو ضوءاً يتحرك أفقياً وعمودياً بمدى 180 درجة.',
    helperText: 'حرك شخشيخة أو كرة ملونة أمام الطفل ببطء يميناً ويساراً ثم للأعلى والأسفل ولاحظ حركة العينين والرأس.',
    iepGoal: 'تنمية مهارة التتبع البصري للأشياء المتحركة عبر المدى البصري الكامل بنسبة إتقان 80%.',
    domain: 'visual_tracking',
  },
  {
    id: 'inf_3',
    num: 3,
    domainId: 'infant',
    ageBand: '0-1',
    text: 'يلتفت برأسه وعينيه نحو مصدر الصوت اللطيف (شخشيخة، صوت الأم) على أحد الجانبين.',
    helperText: 'أحدث صوتاً ناعماً بجوار أذن الطفل اليمنى ثم اليسرى خارج مجاله البصري المباشر ولاحظ استجابته بالالتفات.',
    iepGoal: 'أن يحدد الطفل اتجاه ومصدر الأصوات المألوفة بالالتفات برأسه وعينيه بنجاح.',
    domain: 'auditory_localization',
  },
  {
    id: 'inf_4',
    num: 4,
    domainId: 'infant',
    ageBand: '0-1',
    text: 'يبتسم استجابةً لملاعبة ومداعبة الراشد والحديث الودود معه (الابتسامة الاجتماعية الأولى).',
    helperText: 'ابتسم في وجه الرضيع ودغدغه برفق وتحدث معه دون استخدام ألعاب؛ لاحظ ظهور ابتسامة تفاعلية واضحة.',
    iepGoal: 'أن يصدر الطفل ابتسامة اجتماعية تفاعلية عند مداعبة المعلم أو الوالدين في 4 من 5 محاولات.',
    domain: 'social_smile',
  },
  {
    id: 'inf_5',
    num: 5,
    domainId: 'infant',
    ageBand: '0-1',
    text: 'يصدر أصوات مناغاة واستحسان (أووو، آآآ، غغغ) استجابة للحديث الموجه إليه.',
    helperText: 'تكلم مع الطفل بهدوء وتوقف بانتظار استجابته الصوتية؛ لاحظ إصدار مقاطع صوتية نغمية.',
    iepGoal: 'أن يتبادل الطفل الأصوات والمناغاة مع الفاحص أو الأم في جلسات التواصل التفاعلي.',
    domain: 'vocal_play',
  },
  {
    id: 'inf_6',
    num: 6,
    domainId: 'infant',
    ageBand: '0-1',
    text: 'يرفع رأسه وصدره مستنداً على ساعديه عند وضعه على بطنه (وضعية الانبطاح Prone).',
    helperText: 'ضع الرضيع على بطنه على بساط آمن واجذب انتباهه بلعبة أمامه؛ لاحظ قدرته على رفع الرأس والصدر لمدة 10 ثوانٍ.',
    iepGoal: 'تقوية عضلات الرقبة والجذع العلوي بالاستناد على الساعدين ورفع الرأس في وضعية الانبطاح.',
    domain: 'head_control',
  },
  {
    id: 'inf_7',
    num: 7,
    domainId: 'infant',
    ageBand: '0-1',
    text: 'يمسك لعبة صغيرة موضوعة في راحة يده ويحتفظ بها لمدة 10 ثوانٍ على الأقل.',
    helperText: 'المس راحة يد الطفل بشخشيخة أو حلقة خفيفة؛ لاحظ قبض الأصابع وإحكام المسكة دون إفلاتها الفوري.',
    iepGoal: 'تنمية مهارة القبض الإرادي والاحتفاظ بالألعاب والأدوات الصغيرة في اليد لمدة 15 ثانية.',
    domain: 'palmar_grasp',
  },
  {
    id: 'inf_8',
    num: 8,
    domainId: 'infant',
    ageBand: '0-1',
    text: 'يمد كلتا يديه أو إحداهما باتجاه لعبة معلقة أمامه محاولاً لمسها والتقاطها.',
    helperText: 'علّق لعبة زاهية أمام صدر الطفل على مسافة ذراع؛ لاحظ مبادرة مد الذراعين وتنسيق الحركة نحو الهدف.',
    iepGoal: 'أن يمد الطفل يديه بدقة لملامسة والتقاط الأشياء المعروضة أمامه في المدى القريب.',
    domain: 'reaching_grasping',
  },
  {
    id: 'inf_9',
    num: 9,
    domainId: 'infant',
    ageBand: '0-1',
    text: 'يتقلب من وضعية الاستلقاء على الظهر إلى البطن أو العكس باستقلالية.',
    helperText: 'ضع الرضيع على ظهره وشجعه بلعبة على جانبه؛ لاحظ حركة الجذع والالتفاف الكامل إلى البطن.',
    iepGoal: 'أن يتقلب الطفل من الظهر إلى البطن ومن البطن إلى الظهر بحرية واستقلالية كاملة.',
    domain: 'rolling_gross_motor',
  },
  {
    id: 'inf_10',
    num: 10,
    domainId: 'infant',
    ageBand: '0-1',
    text: 'يبحث عن شيء سقط منه أو اختفى جزئياً تحت غطاء (بداية مفهوم بقاء الشيء Object Permanence).',
    helperText: 'اجذب انتباه الطفل بلعبة ثم غطِّ نصفها بمنديل أمامه؛ لاحظ محاولته إزاحة المنديل أو النظر لموضع الاختفاء.',
    iepGoal: 'تطوير مفهوم بقاء الأشياء بالبحث عن الألعاب المخفية جزئياً واستردادها بنجاح.',
    domain: 'object_permanence',
  },

  // ----------------------------------------------------
  // 2. مجال التنشئة الاجتماعية (Socialization Domain)
  // ----------------------------------------------------
  {
    id: 'soc_1',
    num: 11,
    domainId: 'socialization',
    ageBand: '0-1',
    text: 'يتعرف على الأم ومقدم الرعاية الأساسي ويهدأ عند حمله أو سماع صوته.',
    helperText: 'لاحظ استجابة الطفل عند اقتراب الأم مقارنة بشخص غريب وهدوء نبرات بكائه.',
    iepGoal: 'أن يظهر الطفل استجابة تعلق آمنة وهدوءاً إيجابياً في حضور مقدم الرعاية.',
    domain: 'attachment_social',
  },
  {
    id: 'soc_2',
    num: 12,
    domainId: 'socialization',
    ageBand: '0-1',
    text: 'يستمتع بالألعاب الاجتماعية البسيطة المتبادلة مثل لعبة (الغميضة / بيكابو Peek-a-boo).',
    helperText: 'غطِّ وجهك بكفيك ثم اكشفه قائلاً "بيكابو" بابتسامة؛ لاحظ ضحك الطفل أو ترقبه لتكرار اللعبة.',
    iepGoal: 'أن يشارك الطفل في ألعاب التفاعل التبادلي البسيطة مع المعلم مبدياً سعادة واندماجاً.',
    domain: 'interactive_play',
  },
  {
    id: 'soc_3',
    num: 13,
    domainId: 'socialization',
    ageBand: '1-2',
    text: 'يلوح بيده مودعاً (باي باي) أو يصفق عند تشجيعه شفهياً ونمذجتها أمامه.',
    helperText: 'قل "باي باي" ملوحاً بيدك عند المغادرة ولاحظ تقليده للحركة دون مساعدة جسدية.',
    iepGoal: 'أن يستخدم الطفل الإيماءات الاجتماعية الوظيفية (التلويح، التصفيق) في المواقف المناسبة.',
    domain: 'social_gestures',
  },
  {
    id: 'soc_4',
    num: 14,
    domainId: 'socialization',
    ageBand: '1-2',
    text: 'يجلب لعبة أو شيئاً ليريه للراشد أو يشاركه الاهتمام به (الاهتمام المشترك Joint Attention).',
    helperText: 'لاحظ ما إذا كان الطفل يمد يده بلعبة ليشير إليها أو يعطيها للفاحص لمشاركته متعة رؤيتها.',
    iepGoal: 'تنمية مبادرة الانتباه المشترك ومشاركة الأدوات والألعاب مع المعلمين والوالدين.',
    domain: 'joint_attention',
  },
  {
    id: 'soc_5',
    num: 15,
    domainId: 'socialization',
    ageBand: '2-3',
    text: 'يلعب بجانب أقرانه في نفس المكان ونفس الألعاب دون صدام (اللعب الموازي Parallel Play).',
    helperText: 'وفر ألعاباً متماثلة لطفلين في نفس المساحة؛ لاحظ انشغال الطفل بلعبه بالقرب من زميله دون اعتراض.',
    iepGoal: 'أن يندمج الطفل في اللعب الموازي بجانب أقرانه لمدة 10 دقائق متواصلة بانسجام.',
    domain: 'parallel_play',
  },
  {
    id: 'soc_6',
    num: 16,
    domainId: 'socialization',
    ageBand: '2-3',
    text: 'يعبر عن مشاعر التعاطف البسيط (كالتربيت أو القلق) عند رؤية طفل آخر يبكي أو متألم.',
    helperText: 'لاحظ سلوك الطفل وتعبيرات وجهه عندما يتألم طفل آخر أمامه ومبادرته للنظر أو الاقتراب بود.',
    iepGoal: 'أن يظهر الطفل استجابات تعاطف وتفاعل وجداني إيجابي تجاه مشاعر أقرانه.',
    domain: 'empathy_social',
  },
  {
    id: 'soc_7',
    num: 17,
    domainId: 'socialization',
    ageBand: '3-4',
    text: 'ينتظر دوره في الأنشطة والألعاب الجماعية البسيطة (مثل تمرير الكرة، ركوب الأرجوحة).',
    helperText: 'نظم لعبة تمرير الكرة في حلقة واطلب من الطفل انتظار دوره؛ لاحظ مدى قدرته على كبح الاندفاع.',
    iepGoal: 'أن يلتزم الطفل بقواعد تبادل الأدوار في الأنشطة الصفية واللعب الجماعي.',
    domain: 'turn_taking',
  },
  {
    id: 'soc_8',
    num: 18,
    domainId: 'socialization',
    ageBand: '3-4',
    text: 'يشارك في اللعب التخيلي والتمثيلي التشاركي مع طفل آخر (لعب دور الطبيب، الطبخ، قيادة السيارة).',
    helperText: 'وفر أدوات تمثيلية وشاهد تفاعل الطفل وتقاسمه الأدوار الخيالية مع صديقه.',
    iepGoal: 'أن يشارك الطفل في ألعاب تقمص الأدوار التخيلية التشاركية مع الأقران لمدة 15 دقيقة.',
    domain: 'cooperative_pretend_play',
  },
  {
    id: 'soc_9',
    num: 19,
    domainId: 'socialization',
    ageBand: '4-5',
    text: 'يطلب الإذن لاستخدام أدوات وألعاب الآخرين ويتقبل الرفض البديل دون نوبات غضب.',
    helperText: 'لاحظ كيف يتصرف الطفل عندما يرغب في لعبة مع طفل آخر، هل يقول "ممكن ألعب معك؟".',
    iepGoal: 'أن يستخدم الطفل أسلوب الاستئذان اللفظي المناسب للمشاركة في ألعاب زملائه.',
    domain: 'polite_communication',
  },
  {
    id: 'soc_10',
    num: 20,
    domainId: 'socialization',
    ageBand: '4-5',
    text: 'يتبع القواعد والتعليمات الصفية المحددة للأنشطة الجماعية ويحافظ على الهدوء في الطابور.',
    helperText: 'لاحظ التزام الطفل بتعليمات الصف الجماعية والانتقال بين الأركان بسلاسة.',
    iepGoal: 'أن يتبع الطفل الروتين الصفي والقواعد السلوكية الجماعية بنسبة التزام 85%.',
    domain: 'classroom_rules',
  },
  {
    id: 'soc_11',
    num: 21,
    domainId: 'socialization',
    ageBand: '5-6',
    text: 'يميز مشاعر الآخرين المعقدة (فخور، محبط، خجول) ويشرح سبب شعور صديقه بذلك.',
    helperText: 'اعرض بطاقات تعبيرية لمشاعر مختلفة واسأله "لماذا يبدو هذا الولد محبطاً؟".',
    iepGoal: 'تنمية الاستبصار الاجتماعي والذكاء العاطفي في إدراك وتفسير مشاعر الآخرين.',
    domain: 'emotional_insight',
  },
  {
    id: 'soc_12',
    num: 22,
    domainId: 'socialization',
    ageBand: '5-6',
    text: 'يحل الخلافات البسيطة مع أقرانه بالتفاوض اللفظي أو اللجوء للمعلم دون عنف جسدي.',
    helperText: 'لاحظ رد فعله عند حدوث نزاع على دور أو لعبة ومدى استخدامه للحوار وحل المشكلات.',
    iepGoal: 'أن يطبق الطفل فنيات حل النزاعات والتفاوض اللفظي الإيجابي في بيئة اللعب والتعلم.',
    domain: 'conflict_resolution',
  },

  // ----------------------------------------------------
  // 3. مجال النمو اللغوي والتواصل (Language Domain)
  // ----------------------------------------------------
  {
    id: 'lan_1',
    num: 23,
    domainId: 'language',
    ageBand: '0-1',
    text: 'يستجيب لاسمه بالالتفات والتوقف عما في يده عند مناداته بصوت طبيعي.',
    helperText: 'نادِ اسم الطفل من خلفه أو على مسافة مترين بنبرة عادية ولاحظ استجابته الفورية.',
    iepGoal: 'أن يستجيب الطفل لمناداة اسمه بالالتفات والتواصل البصري في 9 من 10 محاولات.',
    domain: 'name_response',
  },
  {
    id: 'lan_2',
    num: 24,
    domainId: 'language',
    ageBand: '0-1',
    text: 'يصدر سلاسل مناغاة متكررة تحتوي على مقاطع صوتية ساكنة ومتحركة (با-با، دا-دا، ما-ما).',
    helperText: 'استمع لأصوات الطفل أثناء لعبه الذاتي ولاحظ تنوع المقاطع السمعية ومحاكاة نغمات الكلام.',
    iepGoal: 'زيادة إنتاج المقاطع الصوتية الثنائية وتكرار السلاسل الصوتية (Babbling).',
    domain: 'babbling_phonology',
  },
  {
    id: 'lan_3',
    num: 25,
    domainId: 'language',
    ageBand: '1-2',
    text: 'ينطق كلمتين إلى 5 كلمات مفردة واضحة الدلالة (ماما، بابا، نونو، بيب، ماء).',
    helperText: 'اطلب من الوالدين أو لاحظ استخدام الطفل لكلمات حقيقية لطلب أشياء أو تسميتها.',
    iepGoal: 'أن يستخدم الطفل 10 كلمات مفردة وظيفية للتعبير عن احتياجاته وتسمية الأشياء.',
    domain: 'expressive_words',
  },
  {
    id: 'lan_4',
    num: 26,
    domainId: 'language',
    ageBand: '1-2',
    text: 'يشير إلى 3 أجزاء من جسمه (عين، أنف، فم، يد) أو أشياء مألوفة عند طلبها.',
    helperText: 'قل للطفل "أين عينك؟" أو "أين أنفك؟" دون مساعدة إشارية ولاحظ صحة الإشارة.',
    iepGoal: 'أن يتعرف الطفل ويشير بدقة إلى 5 أجزاء من جسمه والأشياء المألوفة في بيئته.',
    domain: 'receptive_body_parts',
  },
  {
    id: 'lan_5',
    num: 27,
    domainId: 'language',
    ageBand: '2-3',
    text: 'يركب جملاً من كلمتين للتعبير عن الطلب أو الوصف (أريد عصير، سيارة راحت، بابا جا).',
    helperText: 'لاحظ استخدام الطفل لتراكيب ثنائية الكلمات في مواقف التفاعل اليومي والتواصل التلقائي.',
    iepGoal: 'أن يوظف الطفل جملاً ثنائية الكلمات (فعل + مفعول / اسم + صفة) في طلباته اليومية.',
    domain: 'two_word_phrases',
  },
  {
    id: 'lan_6',
    num: 28,
    domainId: 'language',
    ageBand: '2-3',
    text: 'ينفذ تعليمات وأوامر بسيطة من خطوتين مرتبطتين (خذ الكرة وضعها في الصندوق).',
    helperText: 'أعطِ الطفل تعليمات مركبة من خطوتين دون إشارة يدوية؛ لاحظ تسلسل تنفيذه للمهمة.',
    iepGoal: 'أن ينفذ الطفل تعليمات شفهية متسلسلة من خطوتين بنسبة دقة 80%.',
    domain: 'two_step_commands',
  },
  {
    id: 'lan_7',
    num: 29,
    domainId: 'language',
    ageBand: '3-4',
    text: 'يستخدم الضمائر البسيطة (أنا، أنت، هو) وحروف الجر الأساسية (في، على، تحت) بشكل سليم.',
    helperText: 'ضع لعبة تحت الطاولة واسأله "أين اللعبة؟" واسأله "من هذا؟" عند الإشارة لنفسه.',
    iepGoal: 'أن يوظف الطفل الضمائر وحروف الجر المكانية في التعبير اللغوي بطلاقة.',
    domain: 'grammar_prepositions',
  },
  {
    id: 'lan_8',
    num: 30,
    domainId: 'language',
    ageBand: '3-4',
    text: 'يطرح أسئلة استفهامية متنوعة مثل (من؟ أين؟ لماذا؟ شو هذا؟) لاستكشاف بيئته.',
    helperText: 'لاحظ تكرار طرح الأسئلة الاستفسارية لجمع المعلومات عن الأحداث والأشياء المحيطة.',
    iepGoal: 'تنمية طرح الأسئلة الاستفهامية المتنوعة لتطوير الحصيلة اللغوية والمعرفية.',
    domain: 'question_asking',
  },
  {
    id: 'lan_9',
    num: 31,
    domainId: 'language',
    ageBand: '4-5',
    text: 'يروي قصة قصيرة متسلسلة أو يصف حدثاً يومياً جرى معه باستخدام جمل كاملة ومترابطة.',
    helperText: 'اعرض 3 بطاقات تسلسلية لأحداث يومية واطلب منه أن يحكي ماذا حدث من البداية للنهاية.',
    iepGoal: 'أن يسرد الطفل قصة قصيرة من 3 أحداث متسلسلة باستخدام أدوات الربط والكلمات الوصفية.',
    domain: 'narrative_skills',
  },
  {
    id: 'lan_10',
    num: 32,
    domainId: 'language',
    ageBand: '4-5',
    text: 'يستخدم صيغ الجمع والتأنيث والتذكير وأزمنة الأفعال (الماضي والمضارع) بشكل صحيح في كلامه.',
    helperText: 'اسأله "أمس ماذا فعلت في الحديقة؟" ولاحظ استخدامه للأفعال الماضية وقواعد التأنيث.',
    iepGoal: 'أن يطبق الطفل القواعد الصرفية والنحوية للجمع والتأنيث وتصريف الأفعال بدقة.',
    domain: 'syntax_morphology',
  },
  {
    id: 'lan_11',
    num: 33,
    domainId: 'language',
    ageBand: '5-6',
    text: 'يعرف معاني المفردات المتقابلة والمتضادة (سريع/بطيء، ثقيل/خفيف، مفتوح/مغلق).',
    helperText: 'اسأله "السلحفاة بطيئة والقطار...؟" "الحجر ثقيل والريشة...؟" ولاحظ سرعة ودقة إجابته.',
    iepGoal: 'أن يحدد الطفل المتضادات والمفردات المتقابلة للمفاهيم المجردة بدقة تامة.',
    domain: 'antonyms_vocabulary',
  },
  {
    id: 'lan_12',
    num: 34,
    domainId: 'language',
    ageBand: '5-6',
    text: 'ينطق جميع الأصوات ومخارج الحروف بوضوح وطلاقة مفهومة لأي مستمع غريب بنسبة 95%.',
    helperText: 'قيم وضوح مخارج أصوات الطفل ومدى خلو كلامه من الإبدال أو الحذف في المحادثة الحرة.',
    iepGoal: 'تحسين مخارج الأصوات الكلامية لتصل إلى وضوح كلام بنسبة 95% في السياقات المختلفة.',
    domain: 'articulation_clarity',
  },

  // ----------------------------------------------------
  // 4. مجال الرعاية الذاتية والاستقلالية (Self-Help Domain)
  // ----------------------------------------------------
  {
    id: 'sh_1',
    num: 35,
    domainId: 'self_help',
    ageBand: '0-1',
    text: 'يمسك بقنينة الرضاعة أو البسكويت ويتناولها بيده مستقلاً نحو فمه.',
    helperText: 'قدم للطفل قطعة بسكويت أطفال أو قنينة خفيفة؛ لاحظ توجيه اليد للفم دون إسقاطها.',
    iepGoal: 'أن يتناول الطفل الأطعمة الخفيفة بيده ويوجهها لفمه باستقلالية.',
    domain: 'finger_feeding',
  },
  {
    id: 'sh_2',
    num: 36,
    domainId: 'self_help',
    ageBand: '0-1',
    text: 'يمد يديه ورجليه للمساعدة أثناء تلبيسه الملابس من قبل الوالدين.',
    helperText: 'عند تلبيس الطفل قميصاً أو بنطالاً، لاحظ مد ذراعيه في الأكمام وساقيه في البنطال بتعاون.',
    iepGoal: 'أن يظهر الطفل تعاوناً إيجابياً بمد أطرافه أثناء ارتداء الملابس اليومية.',
    domain: 'dressing_cooperation',
  },
  {
    id: 'sh_3',
    num: 37,
    domainId: 'self_help',
    ageBand: '1-2',
    text: 'يشرب من كوب عادي ممسكاً به بكلتا يديه دون سكب كميات كبيرة.',
    helperText: 'قدم كوباً صغيراً به قليل من الماء للطفل؛ لاحظ مسك الكوب ورفعه لفمه وابتلاعه بهدوء.',
    iepGoal: 'أن يشرب الطفل من الكوب المفتوح باستقلالية تامة دون سكب المحتوى.',
    domain: 'cup_drinking',
  },
  {
    id: 'sh_4',
    num: 38,
    domainId: 'self_help',
    ageBand: '1-2',
    text: 'يستخدم الملعقة لنقل الطعام إلى فمه مع انسكاب قليل.',
    helperText: 'قدم طبقاً به زبادي أو طعام متماسك وملعقة أطفال؛ لاحظ مسك الملعقة وتوجيهها للفم.',
    iepGoal: 'أن يستخدم الطفل الملعقة لتناول وجبته الرئيسية باستقلالية مقبولة.',
    domain: 'spoon_feeding',
  },
  {
    id: 'sh_5',
    num: 39,
    domainId: 'self_help',
    ageBand: '2-3',
    text: 'يخلع ملابسه البسيطة غير المقفلة (الجوارب، القبعة، الحذاء المفتوح، المعطف).',
    helperText: 'اطلب من الطفل خلع حذائه وجواربه عند الدخول للمركز؛ لاحظ كفاءة الشد والإزالة.',
    iepGoal: 'أن يخلع الطفل قطعه الملبوسة البسيطة (الجوارب، الأحذية، السترة) باستقلالية.',
    domain: 'undressing_skills',
  },
  {
    id: 'sh_6',
    num: 40,
    domainId: 'self_help',
    ageBand: '2-3',
    text: 'يعبر شفهياً أو إشارياً عن حاجته للذهاب إلى دورة المياه (الحمام) قبل التبول.',
    helperText: 'لاحظ ما إذا كان الطفل يبادر بإعلام الراشد عند امتلائه أو يمسك ملابسه متوجهاً للحمام.',
    iepGoal: 'أن يعبر الطفل عن حاجته للإخراج قبل فوات الأوان بنسبة نجاح 80%.',
    domain: 'toilet_awareness',
  },
  {
    id: 'sh_7',
    num: 41,
    domainId: 'self_help',
    ageBand: '3-4',
    text: 'يغسل يديه بالماء والصابون ويجففهما بالمنشفة باستقلالية مقبولة.',
    helperText: 'وجه الطفل لحوض المغسلة وقل "اغسل يديك"؛ لاحظ فتح الصنبور، فرك الصابون، والتجفيف.',
    iepGoal: 'أن يطبق الطفل خطوات غسل اليدين وتجفيفهما باستقلالية بعد الحمام وقبل الأكل.',
    domain: 'handwashing_hygiene',
  },
  {
    id: 'sh_8',
    num: 42,
    domainId: 'self_help',
    ageBand: '3-4',
    text: 'يرتدي ملابسه البسيطة (البنطال ذو الخصر المطاطي، التيشيرت) مع توجيه بسيط للأمام والخلف.',
    helperText: 'أعطِ الطفل بنطالاً مطاطياً وشاهده وهو يدخل رجليه ويرفعه حتى الخصر بنجاح.',
    iepGoal: 'أن يرتدي الطفل الملابس ذات الخصر المطاطي باستقلالية تامة في روتين الصباح.',
    domain: 'independent_dressing',
  },
  {
    id: 'sh_9',
    num: 43,
    domainId: 'self_help',
    ageBand: '4-5',
    text: 'يستخدم الحمام باستقلالية تامة نهاراً (خلع الملابس، الجلوس، التنظيف، ارتداء الملابس، وشد السيفون).',
    helperText: 'قيم استقلالية الطفل الشاملة في دورة المياه دون الحاجة لمرافقة أخصائي أو والد.',
    iepGoal: 'أن يستخدم الطفل دورة المياه باستقلالية كاملة في جميع خطواتها المعتمدة.',
    domain: 'independent_toileting',
  },
  {
    id: 'sh_10',
    num: 44,
    domainId: 'self_help',
    ageBand: '4-5',
    text: 'يفرش أسنانه باستخدام الفرشاة والمعجون بحركات منظمة مع مساعدة خفيفة في النهاية.',
    helperText: 'وفر فرشاة ومعجون للطفل وشاهده وهو يفرك الأسطح الأمامية والخلفية لأسنانه.',
    iepGoal: 'أن يتدرب الطفل على تنظيف أسنانه بالفرشاة والمعجون كروتين صباحي ومسائي.',
    domain: 'teeth_brushing',
  },
  {
    id: 'sh_11',
    num: 45,
    domainId: 'self_help',
    ageBand: '5-6',
    text: 'يقوم بربط الأزرار، السحابات، وأربطة الأحذية البسيطة أو الفيلكرو بإحكام وإتقان.',
    helperText: 'اختبر مهارة الطفل في إغلاق سحاب السترة وتثبيت الأزرار وفكها بدقة في ثيابه.',
    iepGoal: 'أن يتقن الطفل مهارات قفل وفك الأزرار والسحابات وأربطة الأحذية باستقلالية.',
    domain: 'fasteners_shoe_tying',
  },
  {
    id: 'sh_12',
    num: 46,
    domainId: 'self_help',
    ageBand: '5-6',
    text: 'يعد وجبة خفيفة بسيطة لنفسه (سكب الحليب في الكوب، دهن شطيرة بالجبن) مع مراعاة السلامة.',
    helperText: 'وفر خبزاً، ملعقة بلاستيكية عريضة، وجبناً سائلاً؛ اطلب منه إعداد شطيرته بنفسه.',
    iepGoal: 'أن يجهز الطفل وجبة خفيفة آمنة لنفسه ويرتب المكان بعد الانتهاء باستقلالية.',
    domain: 'meal_preparation',
  },

  // ----------------------------------------------------
  // 5. مجال النمو المعرفي والإدراكي (Cognition Domain)
  // ----------------------------------------------------
  {
    id: 'cog_1',
    num: 47,
    domainId: 'cognition',
    ageBand: '0-1',
    text: 'يكتشف الأشياء بحواسه المختلفة (النقل من يد إلى يد، الطرق، الهز، الفحص البصري).',
    helperText: 'أعطِ الطفل ألعاباً بملامس مختلفة ولاحظ استكشافه لها بتحويلها بين اليدين وهزها.',
    iepGoal: 'تنمية الاستكشاف الحسي الحركي والتآزر الثنائي في فحص ومعالجة الأدوات.',
    domain: 'sensory_exploration',
  },
  {
    id: 'cog_2',
    num: 48,
    domainId: 'cognition',
    ageBand: '0-1',
    text: 'يضع مكعباً أو لعبة صغيرة داخل علبة أو كوب ويخرجها استجابة للطلب أو التقليد.',
    helperText: 'ضع مكعباً في علبة ثم قل له "ضع المكعب في العلبة" ثم "أخرجه"؛ لاحظ فهم العلاقة المكانية.',
    iepGoal: 'أن يضع الطفل الأشياء داخل الحاويات ويخرجها لتنمية مفهوم الاحتواء المكاني.',
    domain: 'container_containment',
  },
  {
    id: 'cog_3',
    num: 49,
    domainId: 'cognition',
    ageBand: '1-2',
    text: 'يطابق الأشكال الهندسية الأساسية (دائرة، مربع، مثلث) في لوحة الأشكال الخشبية (Form Board).',
    helperText: 'قدم لوحة أشكال خشبية ثلاثية ثلاثية الأبعاد ولاحظ مطابقة القطع في تجاويفها الصحيحة.',
    iepGoal: 'أن يطابق الطفل الأشكال الهندسية الأساسية الثلاثة في لوحة الأشكال بنجاح.',
    domain: 'shape_matching',
  },
  {
    id: 'cog_4',
    num: 50,
    domainId: 'cognition',
    ageBand: '1-2',
    text: 'يبني برجاً من 3 إلى 4 مكعبات متوازنة دون أن تسقط عند تركه لها.',
    helperText: 'أعطِ الطفل 6 مكعبات خشبية وشجعه على بناء برج؛ لاحظ التوازن والتآزر الحركي الدقيق.',
    iepGoal: 'أن يبني الطفل برجاً من 5 مكعبات متوازنة باستقلالية في 4 من 5 محاولات.',
    domain: 'block_stacking',
  },
  {
    id: 'cog_5',
    num: 51,
    domainId: 'cognition',
    ageBand: '2-3',
    text: 'يطابق الألوان الأساسية الأربعة (أحمر، أزرق، أصفر، أخضر) بدقة تامة.',
    helperText: 'ضع بطاقات ملونة واطلب منه "ضع الأحمر مع الأحمر والأزرق مع الأزرق"؛ اختبر المطابقة.',
    iepGoal: 'أن يطابق الطفل ويصنف الأدوات والبطاقات حسب الألوان الأساسية الأربعة بدقة.',
    domain: 'color_matching',
  },
  {
    id: 'cog_6',
    num: 52,
    domainId: 'cognition',
    ageBand: '2-3',
    text: 'يميز مفهوم الحجم (كبير / صغير) عند عرض نموذجين متطابقين مختلفي الحجم.',
    helperText: 'اعرض سيارة كبيرة وأخرى صغيرة وقل "أين السيارة الكبيرة؟" ثم "أين الصغيرة؟".',
    iepGoal: 'أن يميز الطفل مفهومي (كبير / صغير) ويشير للأشياء وفق الحجم المطلوب.',
    domain: 'size_concepts',
  },
  {
    id: 'cog_7',
    num: 53,
    domainId: 'cognition',
    ageBand: '3-4',
    text: 'يعد بالترتيب من 1 إلى 5 ويستوعب مدلول العدد مع الأجسام الحقيقية (العد الآلي والكمي).',
    helperText: 'ضع 3 تفاحات أو أزرار واطلب منه عدها بلمس كل قطعة وإعطائك العدد الكلي.',
    iepGoal: 'أن يتقن الطفل العد الترتيبي والكمي للأشياء حتى العدد 5 بنسبة إتقان 90%.',
    domain: 'counting_quantities',
  },
  {
    id: 'cog_8',
    num: 54,
    domainId: 'cognition',
    ageBand: '3-4',
    text: 'يكمل بازل من 4 إلى 6 قطع غير متداخلة بالاستدلال البصري المكاني.',
    helperText: 'قدم بازل صورة مألوفة مكون من 6 قطع مفككة وشاهده وهو يركب الأجزاء في مواضعها.',
    iepGoal: 'أن يركب الطفل بازل الصور المقطعة المكون من 6 قطع بالاعتماد على التناسق البصري.',
    domain: 'puzzle_assembly',
  },
  {
    id: 'cog_9',
    num: 55,
    domainId: 'cognition',
    ageBand: '4-5',
    text: 'يصنف مجموعة من الصور أو الأدوات بناءً على فئات دلالية (حيوانات، فواكه، ملابس، وسائل نقل).',
    helperText: 'انثر بطاقات مختلطة وقل له "ضع جميع الحيوانات معاً وجميع الفواكه في هذه السلة".',
    iepGoal: 'أن يصنف الطفل 20 عنصراً وفق 4 فئات دلالية ومفاهيمية رئيسية بدقة.',
    domain: 'semantic_categorization',
  },
  {
    id: 'cog_10',
    num: 56,
    domainId: 'cognition',
    ageBand: '4-5',
    text: 'يميز مفاهيم الكميات والمقارنة (أكثر / أقل / متساوي) و(طويل / قصير).',
    helperText: 'ضع مجموعتين من الخرز (8 خرزات و3 خرزات) واسأله "أي صحن فيه أكثر؟".',
    iepGoal: 'أن يقارن الطفل بين المجموعات الكمية باستخدام مفاهيم (أكثر، أقل، متساوي).',
    domain: 'quantity_comparison',
  },
  {
    id: 'cog_11',
    num: 57,
    domainId: 'cognition',
    ageBand: '5-6',
    text: 'يتعرف على الأرقام المكتوبة من 1 إلى 10 ويطابق كل رقم بمجموعته الكمية بدقة.',
    helperText: 'اعرض بطاقات الأرقام (1-10) واطلب منه وضع عدد المكعبات المقابل لكل رقم.',
    iepGoal: 'أن يتعرف الطفل على الأرقام المكتوبة من 1 إلى 10 ويربطها بمدلولاتها الكمية.',
    domain: 'numeral_quantity_association',
  },
  {
    id: 'cog_12',
    num: 58,
    domainId: 'cognition',
    ageBand: '5-6',
    text: 'يفهم علاقات السبب والنتيجة المنطقية البسيطة (إذا انسكب العصير سنحتاج للمنشفة، إذا مطرت نفتح المظلة).',
    helperText: 'اطرح عليه أسئلة سببية ومواقف مشكلات يومية ولاحظ استدلاله المنطقي للحلول.',
    iepGoal: 'تنمية التفكير الاستدلالي وعلاقات السبب والنتيجة وحل المشكلات اليومية البسيطة.',
    domain: 'cause_and_effect',
  },

  // ----------------------------------------------------
  // 6. مجال النمو الحركي والتناسق (Motor Domain)
  // ----------------------------------------------------
  {
    id: 'mot_1',
    num: 59,
    domainId: 'motor',
    ageBand: '0-1',
    text: 'يجلس مستقلاً على الأرض متوازناً دون استناد بيديه لمدة دقيقة كاملة مع حرية تحريك الذراعين.',
    helperText: 'ضع الطفل في وضعية الجلوس على بساط ودعه يلعب بلعبة أمامه؛ لاحظ اتزانه دون سقوط.',
    iepGoal: 'أن يجلس الطفل باستقلالية وتوازن كامل أثناء ممارسة أنشطة اللعب بالألعاب.',
    domain: 'independent_sitting',
  },
  {
    id: 'mot_2',
    num: 60,
    domainId: 'motor',
    ageBand: '0-1',
    text: 'يحبو أو يزحف إلى الأمام على بطنه وأطرافه للوصول إلى هدف أو لعبة على مسافة مترين.',
    helperText: 'ضع لعبة جذابة على بعد مترين من الرضيع وشجعه؛ لاحظ تناسق حركة الذراعين والساقين.',
    iepGoal: 'أن يحبو الطفل بتناسق متبادل عبر مسافة 3 أمتار للوصول إلى الأدوات والأنشطة.',
    domain: 'crawling_coordination',
  },
  {
    id: 'mot_3',
    num: 61,
    domainId: 'motor',
    ageBand: '1-2',
    text: 'يمشي مستقلاً بخطوات متزنة دون مساعدة أو مسك أيدي عبر مسافة الغرفة.',
    helperText: 'شجع الطفل على المشي نحوك في غرفة مفتوحة؛ لاحظ ثبات القدمين وغياب التعثر المتكرر.',
    iepGoal: 'أن يمشي الطفل بخطوات متزنة ومستقيمة عبر مساحات المركز والمنزل بثقة.',
    domain: 'independent_walking',
  },
  {
    id: 'mot_4',
    num: 62,
    domainId: 'motor',
    ageBand: '1-2',
    text: 'يلتقط الأشياء الصغيرة (حبة زبيب أو خرزة) باستخدام القبضة الكماشية (الإبهام والسبابة Pincer Grasp).',
    helperText: 'ضع قطعة صغيرة آمنة على الطاولة ولاحظ استخدام طرف الإبهام والسبابة لالتقاطها برقة.',
    iepGoal: 'تطوير القبضة الكماشية الدقيقة (Pincer Grasp) في التقاط ومعالجة الأدوات الصغيرة.',
    domain: 'pincer_grasp_dexterity',
  },
  {
    id: 'mot_5',
    num: 63,
    domainId: 'motor',
    ageBand: '2-3',
    text: 'يجري بخطوات سريعة ويتوقف أو يغير اتجاهه دون سقوط أو فقدان للتوازن.',
    helperText: 'اطلب من الطفل الجري في الملعب أو الصالة وقل "قف" فجأة؛ لاحظ قدرته على الفرملة والتحكم.',
    iepGoal: 'أن يجري الطفل ويغير اتجاهاته ويتوقف استجابة للإشارات الحركية بتوازن وأمان.',
    domain: 'running_and_stopping',
  },
  {
    id: 'mot_6',
    num: 64,
    domainId: 'motor',
    ageBand: '2-3',
    text: 'يركل كرة كبيرة نحو الأمام بقدم واحدة دون أن يستند على حائط أو يسقط.',
    helperText: 'دحرج كرة قدم خفيفة أمام قدم الطفل واطلب منه "اشوط الكرة"؛ لاحظ توازنه على القدم الأخرى.',
    iepGoal: 'أن يركل الطفل الكرة للأمام بقدم واحدة مع الحفاظ على التوازن الديناميكي.',
    domain: 'ball_kicking',
  },
  {
    id: 'mot_7',
    num: 65,
    domainId: 'motor',
    ageBand: '3-4',
    text: 'يقفز بكلتا قدميه معاً من على الأرض متجاوزاً خطاً أو عائقاً منخفضاً بارتفاع 5 سم.',
    helperText: 'ارسم خطاً على الأرض أو ضع حبلاً واطلب منه القفز بكلتا القدمين معاً والهبوط بتوازن.',
    iepGoal: 'أن يقفز الطفل بكلتا القدمين معاً متجاوزاً العقبات البسيطة في الأنشطة الحركية.',
    domain: 'two_foot_jumping',
  },
  {
    id: 'mot_8',
    num: 66,
    domainId: 'motor',
    ageBand: '3-4',
    text: 'يمسك قلم التلوين بالقبضة ثلاثية الأصابع (Tripod Grasp) ويقلد رسم خط عمودي وأفقي ودائرة.',
    helperText: 'قدم ورقة وقلم تلوين عريض وارسم خطاً عمودياً ودائرة واطلب منه تقليد الرسم.',
    iepGoal: 'تطوير مسكة القلم الثلاثية ومهارات النسخ والتخطيط الحركي البصري للأشكال البسيطة.',
    domain: 'tripod_grasp_prewriting',
  },
  {
    id: 'mot_9',
    num: 67,
    domainId: 'motor',
    ageBand: '4-5',
    text: 'يقف على قدم واحدة متزناً لمدة 5 ثوانٍ متواصلة دون الاستناد على شيء.',
    helperText: 'اطلب من الطفل أن يرفع قدماً واحدة كطائر الفلامنجو واعد بصوت مسموع حتى 5 ثوانٍ.',
    iepGoal: 'تعزيز التوازن الاستاتيكي بالوقوف على قدم واحدة لمدة 8 ثوانٍ في تمارين اللياقة.',
    domain: 'single_leg_balance',
  },
  {
    id: 'mot_10',
    num: 68,
    domainId: 'motor',
    ageBand: '4-5',
    text: 'يستخدم مقص الأطفال الآمن لقص ورقة على طول خط مستقيم بطول 15 سم دون الانحراف.',
    helperText: 'ارسم خطاً عريضاً على ورقة وأعطه مقص أطفال ولاحظ التآزر الثنائي وفتح وغلق المقص.',
    iepGoal: 'أن يقص الطفل بمقص الأمان على طول الخطوط المستقيمة والمنحنية بدقة متزايدة.',
    domain: 'scissor_cutting_skills',
  },
  {
    id: 'mot_11',
    num: 69,
    domainId: 'motor',
    ageBand: '5-6',
    text: 'يمسك كرة متوسطة ملقاة نحوه من مسافة مترين بيديه الاثنتين دون أن تسقط على الأرض.',
    helperText: 'قف على بعد مترين وارمِ كرة بحجم كرة اليد بلطف نحو صدره؛ لاحظ استعداد وتلقي الكفين للكرة.',
    iepGoal: 'أن يستقبل الطفل ويلتقط الكرات الملقاة نحوه من مسافات مختلفة بتناسق بصري حركي ممتاز.',
    domain: 'ball_catching',
  },
  {
    id: 'mot_12',
    num: 70,
    domainId: 'motor',
    ageBand: '5-6',
    text: 'ينسخ مثلثاً وحروفاً وأرقاماً بسيطة ويكتب اسمه أو رمزه الشخصي بوضوح ملحوظ.',
    helperText: 'اطلب منه رسم مثلث وكتابة اسمه في أسفل الصفحة ولاحظ ضبط حجم الحروف واستقامة الخطوط.',
    iepGoal: 'أن يتقن الطفل مهارات ما قبل الكتابة ونسخ الأشكال الهندسية والحروف بمهارة حركية دقيقة.',
    domain: 'letter_shape_writing',
  },
];

/**
 * دالة مساعدة لحساب النتائج السيكومترية والعمر النمائي لدليل بورتيدج
 */
export function calculatePortagePsychometrics(responses = {}, chronologicalAgeMonths = 48) {
  const domainStats = {};
  let totalAcquiredSkills = 0;
  let totalAssessedSkills = 0;
  let totalPossibleScore = 0;
  let totalEarnedScore = 0;

  // Initialize domain buckets
  PORTAGE_DOMAINS.forEach(dom => {
    domainStats[dom.id] = {
      domainId: dom.id,
      domainName: dom.name,
      icon: dom.icon,
      color: dom.color,
      totalItems: 0,
      assessedItems: 0,
      acquiredCount: 0, // score 1.0
      emergingCount: 0, // score 0.5
      notAcquiredCount: 0, // score 0.0
      excludedCount: 0, // -1 or not answered
      earnedScore: 0,
      maxPossibleScore: 0,
      percentage: 0,
      developmentalAgeMonths: 0,
      developmentalAgeText: '',
      statusLevel: 'طبيعي ومتقدم',
      severityColor: '#059669',
    };
  });

  // Calculate items
  PORTAGE_ITEMS.forEach(it => {
    const stat = domainStats[it.domainId];
    if (!stat) return;

    stat.totalItems += 1;
    const resp = responses[it.id];

    if (resp !== undefined && resp !== null && resp !== '' && Number(resp) !== -1) {
      const numVal = Number(resp);
      stat.assessedItems += 1;
      stat.maxPossibleScore += 1.0;
      stat.earnedScore += numVal;

      if (numVal === 1.0) stat.acquiredCount += 1;
      else if (numVal === 0.5) stat.emergingCount += 1;
      else if (numVal === 0.0) stat.notAcquiredCount += 1;
    } else if (Number(resp) === -1) {
      stat.excludedCount += 1;
    }
  });

  // Calculate domain stats & approximate developmental age per domain (0 to 72 months max based on Portage 0-6 years)
  let sumDevAgeMonths = 0;
  let activeDomainsCount = 0;

  PORTAGE_DOMAINS.forEach(dom => {
    const stat = domainStats[dom.id];
    if (stat.assessedItems > 0 && stat.maxPossibleScore > 0) {
      stat.percentage = Math.round((stat.earnedScore / stat.maxPossibleScore) * 100);
      
      // Calculate developmental age in months based on domain max (infant is 12 mo, others 72 mo)
      const domainMaxMonths = dom.id === 'infant' ? 12 : 72;
      const devMonths = Math.round((stat.earnedScore / stat.maxPossibleScore) * domainMaxMonths);
      stat.developmentalAgeMonths = devMonths;

      const years = Math.floor(devMonths / 12);
      const months = devMonths % 12;
      stat.developmentalAgeText = years > 0 
        ? `${years} سنة ${months > 0 ? `و ${months} أشهر` : ''}` 
        : `${months} أشهر`;

      // Status Level per domain
      if (stat.percentage >= 80) {
        stat.statusLevel = 'اكتساب نمائي متقدم ومستقر';
        stat.severityColor = '#059669';
      } else if (stat.percentage >= 50) {
        stat.statusLevel = 'في طور الاكتساب (تأخر بسيط إلى متوسط)';
        stat.severityColor = '#d97706';
      } else {
        stat.statusLevel = 'تأخر نمائي حاد يستدعي تدخلاً فردياً';
        stat.severityColor = '#dc2626';
      }

      totalAcquiredSkills += stat.acquiredCount;
      totalAssessedSkills += stat.assessedItems;
      totalEarnedScore += stat.earnedScore;
      totalPossibleScore += stat.maxPossibleScore;

      sumDevAgeMonths += devMonths;
      activeDomainsCount += 1;
    } else {
      stat.developmentalAgeText = 'لم يتم التقييم';
    }
  });

  const overallPercentage = totalPossibleScore > 0 
    ? Math.round((totalEarnedScore / totalPossibleScore) * 100) 
    : 0;

  const compositeDevAgeMonths = activeDomainsCount > 0 
    ? Math.round(sumDevAgeMonths / activeDomainsCount) 
    : 0;

  const compYears = Math.floor(compositeDevAgeMonths / 12);
  const compMonths = compositeDevAgeMonths % 12;
  const compositeDevAgeText = compYears > 0 
    ? `${compYears} سنة ${compMonths > 0 ? `و ${compMonths} أشهر` : ''}` 
    : `${compMonths} أشهر`;

  // Developmental Quotient (DQ = Dev Age / Chronological Age * 100)
  const safeChronoAge = chronologicalAgeMonths > 0 ? chronologicalAgeMonths : 48;
  const dqScore = Math.round((compositeDevAgeMonths / safeChronoAge) * 100);

  let overallLevel = 'نمو نمطي سليم ومتقدم';
  let overallColor = '#059669';

  if (dqScore < 55 || overallPercentage < 45) {
    overallLevel = 'تأخر نمائي شامل يستوجب خطة تدخل مبكر مكثفة';
    overallColor = '#dc2626';
  } else if (dqScore < 75 || overallPercentage < 70) {
    overallLevel = 'تأخر نمائي بسيط إلى متوسط (بحاجة لبرنامج تأهيل مساند)';
    overallColor = '#d97706';
  } else if (dqScore < 90) {
    overallLevel = 'مستوى نمائي حدي / في طور الاكتساب والمتابعة';
    overallColor = '#0284c7';
  }

  return {
    totalItems: PORTAGE_ITEMS.length,
    totalAssessedSkills,
    totalAcquiredSkills,
    totalEarnedScore,
    totalPossibleScore,
    overallPercentage,
    compositeDevAgeMonths,
    compositeDevAgeText,
    chronologicalAgeMonths: safeChronoAge,
    dqScore,
    overallLevel,
    overallColor,
    domainStats,
  };
}
