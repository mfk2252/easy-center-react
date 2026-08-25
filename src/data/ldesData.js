/**
 * LDES (Learning Disabilities Evaluation Scale)
 * مقياس التقدير التشخيصي لصعوبات التعلم
 * إعداد: د. ستيفن ب. ماكارني (Stephen B. McCarney, Ed.D.)
 * منشورات: Hawthorne Educational Services, Inc.
 * تعريب وتقنين: نخبة من أساتذة التربية الخاصة والقياس النفسي التربوي في البيئة العربية
 * 
 * المقياس المعتمد لتشخيص وتحديد صعوبات التعلم النمائية والأكاديمية لدى الطلاب من سن 4.5 إلى 18 سنة.
 * يتضمن 88 بنداً تشخيصياً موزعة على 7 مقاييس فرعية معيارية:
 * 1. الاستماع والإصغاء والمعالجة السمعية (Listening) - 13 بنداً
 * 2. التفكير والاستدلال المعرفي والذاكرة (Thinking) - 11 بنداً
 * 3. التحدث والتعبير الشفهي (Speaking) - 12 بنداً
 * 4. القراءة والتعرف القرائي والفهم (Reading) - 16 بنداً
 * 5. الكتابة والتعبير الكتابي والخط (Writing) - 14 بنداً
 * 6. الرياضيات والعمليات الحسابية والاستدلال الكمي (Mathematics) - 12 بنداً
 * 7. المهارات الحركية والتنظيم والسلوك الأكاديمي (Motor & Organization) - 10 بنود
 * 
 * حقوق الملكية الفكرية:
 * جميع حقوق الطبع والنشر والملكية الفكرية الأصلية محفوظة للمؤلف Dr. Stephen B. McCarney ودار Hawthorne Educational Services.
 * استخدام هذا المقياس مخصص للأغراض التشخيصية والتربوية والتأهيلية الرسمية في مراكز ومدارس التربية الخاصة.
 */

export const LDES_COPYRIGHT_INFO = {
  scaleNameAr: 'مقياس التقدير التشخيصي لصعوبات التعلم',
  scaleNameEn: 'Learning Disabilities Evaluation Scale (LDES)',
  scaleShortName: 'LDES',
  authorAr: 'د. ستيفن ب. ماكارني (Stephen B. McCarney, Ed.D.)',
  authorEn: 'Stephen B. McCarney, Ed.D.',
  publisherAr: 'دار منشورات هوثورن التعليمية الأمريكية (Hawthorne Educational Services, Inc.)',
  publisherEn: 'Hawthorne Educational Services, Inc.',
  adaptationAr: 'التقنين والتعريب المعتمد للبيئة العربية في برامج وصعوبات التعلم وغرف المصادر',
  targetAge: 'من عمر 4 سنوات و6 أشهر إلى 18 سنة (رياض الأطفال والمرحلة الابتدائية والمتوسطة والثانوية)',
  standardsReference: 'متوافق مع معايير IDEA (Individuals with Disabilities Education Act) وتصنيفات DSM-5 لصعوبات التعلم المحددة (SLD)',
  notice: 'هذا المقياس وأدواته السيكومترية مخصصة للاستخدام الإكلينيكي والتشخيصي والتربوي المرخص للمراكز والمؤسسات التأهيلية والتربوية وفرق التربية الخاصة وصعوبات التعلم. جميع حقوق الملكية الفكرية محفوظة لدار النشر والمؤلف الأصلي والمقننين المعتمدين، ويخضع تطبيق المقياس واستخراج تقاريره للأمانة العلمية وأخلاقيات التقييم النفسي والتربوي.',
  disclaimer: 'تنبيه مهني: نتائج هذا المقياس تعد تقديراً تشخيصياً سلوكياً مقنناً من واقع ملاحظة المعلمين والأخصائيين وأولياء الأمور، ويجب أن تتكامل مع الاختبارات التحصيلية الرسمية واختبارات القدرات العقلية والذكاء لبناء الخطة التربوية الفردية (IEP) بدقة.',
};

export const LDES_RESPONSE_OPTIONS = [
  {
    value: 0,
    score: 0,
    label: '0 - أداء طبيعي / لا يُظهر صعوبة',
    description: 'يؤدي المهارة بشكل طبيعي ومناسب لعمره الزمني ومستواه الدراسي دون صعوبة.',
    badgeClass: 'b-gr',
  },
  {
    value: 1,
    score: 1,
    label: '1 - نادراً ما تظهر المشكلة (صعوبة بسيطة)',
    description: 'يُظهر الصعوبة نادراً أو في مواقف غير معتادة فقط وتزول بتوجيه بسيط.',
    badgeClass: 'b-bl',
  },
  {
    value: 2,
    score: 2,
    label: '2 - تظهر المشكلة أحياناً (صعوبة متوسطة ملحوظة)',
    description: 'تتكرر الصعوبة بشكل أسبوعي أو يومي وتؤثر بصورة واضحة على سرعة ودقة التحصيل.',
    badgeClass: 'b-or',
  },
  {
    value: 3,
    score: 3,
    label: '3 - تظهر المشكلة باستمرار (صعوبة شديدة واضحة)',
    description: 'تظهر الصعوبة بشكل دائم ومستمر، وتشكل عائقاً جوهرياً أمام تعلم المهارة والتقدم الأكاديمي.',
    badgeClass: 'b-rd',
  },
];

export const LDES_DOMAINS = [
  {
    id: 'listening',
    code: 'LIS',
    name: 'الاستماع والإصغاء والمعالجة السمعية',
    nameEn: 'Listening & Auditory Processing',
    category: 'developmental',
    categoryName: 'صعوبات نمائية',
    itemsCount: 13,
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#7dd3fc',
    icon: '👂',
    description: 'يقيس الانتباه السمعي، تتبع التعليمات الشفهية، التمييز السمعي للأصوات، وفهم الكلام في بيئة الفصل الصاخبة.',
  },
  {
    id: 'thinking',
    code: 'THK',
    name: 'التفكير والاستدلال والذاكرة',
    nameEn: 'Thinking, Reasoning & Memory',
    category: 'developmental',
    categoryName: 'صعوبات نمائية',
    itemsCount: 11,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#c4b5fd',
    icon: '🧠',
    description: 'يقيس الذاكرة العاملة والقصيرة المدى، ترتيب التسلسل المنطقي، حل المشكلات، وإدراك العلاقات بين المفاهيم.',
  },
  {
    id: 'speaking',
    code: 'SPK',
    name: 'التحدث والتعبير الشفهي واللغوي',
    nameEn: 'Speaking & Oral Expression',
    category: 'developmental',
    categoryName: 'صعوبات نمائية',
    itemsCount: 12,
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    icon: '🗣️',
    description: 'يقيس الطلاقة التعبيرية، تسمية الأشياء واستدعاء المفردات، التراكيب النحوية، وسرد القصص والأفكار بوضوح.',
  },
  {
    id: 'reading',
    code: 'RDG',
    name: 'القراءة والتعرف القرائي والفهم (Dyslexia)',
    nameEn: 'Reading, Decoding & Comprehension',
    category: 'academic',
    categoryName: 'صعوبات أكاديمية',
    itemsCount: 16,
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fcd34d',
    icon: '📖',
    description: 'يقيس الوعي الفونيمي، دمج الحروف وتهجئة الكلمات، طلاقة وسرعة القراءة الجهرية، وفهم النصوص والأفكار الضمنية.',
  },
  {
    id: 'writing',
    code: 'WRT',
    name: 'الكتابة والتعبير الكتابي والخط (Dysgraphia)',
    nameEn: 'Writing, Mechanics & Written Expression',
    category: 'academic',
    categoryName: 'صعوبات أكاديمية',
    itemsCount: 14,
    color: '#e11d48',
    bgLight: '#fff1f2',
    borderColor: '#fda4af',
    icon: '✍️',
    description: 'يقيس التناسق البصري الحركي أثناء الكتابة، عكس الحروف والأرقام، الإملاء والقواعد، وصياغة جمل وفقرات مترابطة.',
  },
  {
    id: 'math',
    code: 'MTH',
    name: 'الرياضيات والعمليات الحسابية (Dyscalculia)',
    nameEn: 'Mathematics & Numerical Reasoning',
    category: 'academic',
    categoryName: 'صعوبات أكاديمية',
    itemsCount: 12,
    color: '#4f46e5',
    bgLight: '#eef2ff',
    borderColor: '#a5b4fc',
    icon: '🔢',
    description: 'يقيس إدراك القيمة المنزلية، حفظ حقائق الجمع والضرب، التمييز بين الرموز الرياضية، وحل المسائل اللفظية.',
  },
  {
    id: 'motor',
    code: 'MTR',
    name: 'التنظيم الحركي والسلوك الأكاديمي',
    nameEn: 'Motor Skills & Academic Organization',
    category: 'developmental',
    categoryName: 'صعوبات نمائية وتكيفية',
    itemsCount: 10,
    color: '#0d9488',
    bgLight: '#f0fdfa',
    borderColor: '#99f6e4',
    icon: '📐',
    description: 'يقيس تنظيم الأدوات والمكتب، إدارة وقت الحصة والواجبات، الإدراك المكاني والاتجاهات، والتناسق الحركي الدقيق والعام.',
  },
];

export const LDES_ITEMS = [
  // 1. Listening (الاستماع والإصغاء) - 13 Items
  { id: 1, domainId: 'listening', text: 'صعوبة تذكر وحفظ التعليمات الشفهية الموجهة إليه في الفصل أو المنزل', example: 'ينسى الخطوة الثانية عند إعطائه أمرين معاً (مثل: "افتح الصفحة 20 واكتب العنوان").', weight: 1 },
  { id: 2, domainId: 'listening', text: 'صعوبة تتبع التعليمات المتسلسلة المكونة من أكثر من خطوتين أو ثلاثة في وقت واحد', example: 'يرتبك عند تلقي 3 توجيهات متتالية (مثل: أخرج الدفتر، اكتب التاريخ، ثم أجب عن السؤال الأول).', weight: 1 },
  { id: 3, domainId: 'listening', text: 'صعوبة الاستماع والتركيز عندما تكون هناك أصوات أو مشتتات بيئية في محيطه', example: 'يتشتت انتباهه تماماً عند وجود همس زملاء أو أصوات حركة خارجية في ممر المدرسة أثناء شرح المعلم.', weight: 1 },
  { id: 4, domainId: 'listening', text: 'صعوبة التمييز السمعي بين الأصوات اللغوية المتقاربة في المخارج (مثل: س/ص، د/ض، ت/ط)', example: 'يخلط في السماع أو الإملاء بين الكلمات المتقاربة صوتياً مثل: سيف/صيف، تين/طين، دين/طين.', weight: 1 },
  { id: 5, domainId: 'listening', text: 'يحتاج إلى إعادة تكرار التعليمات الشفهية عدة مرات وبطرق مختلفة حتى يستوعبها', example: 'يطلب من المعلم أو ولي الأمر تكرار السؤال أو التوجيه مرتين أو ثلاث لكي يستوعب المطلوب.', weight: 1 },
  { id: 6, domainId: 'listening', text: 'صعوبة استخلاص الفكرة الأساسية أو النقاط الهامة من نص تم الاستماع إليه شفهياً', example: 'بعد الاستماع لقصة قصيرة يعجز عن ذكر الفكرة العامة ويكتفي بذكر تفصيل هامشي غير مؤثر.', weight: 1 },
  { id: 7, domainId: 'listening', text: 'صعوبة تحديد مصدر الصوت أو تمييز نغمات الكلام وتغيرات النبرة الدالة على المعنى', example: 'لا يدرك ما إذا كان المتحدث يسأل أم يتعجب أم يوجه تحذيراً إلا بالتوضيح المباشر.', weight: 1 },
  { id: 8, domainId: 'listening', text: 'يبدو كأنه لا يستمع أو شارد الذهن عند التحدث إليه مباشرة دون وجود مشكلة في السمع العضوي', example: 'ينظر للمتحدث ولكن بعد الانتهاء لا يعرف ما قيل له رغم سلامة الفحص السمعي العضوي.', weight: 1 },
  { id: 9, domainId: 'listening', text: 'صعوبة تذكر أسماء الأشخاص أو الأرقام أو الكلمات التي تم نطقها أمامه قبل قليل (الذاكرة السمعية الفورية)', example: 'ينسى تسلسل أرقام أو مجموعة كلمات فور الانتهاء من نطقها أمامه مباشرة.', weight: 1 },
  { id: 10, domainId: 'listening', text: 'يستجيب ببطء شديد أو بعد فترات تأخير ملحوظة بعد سماع السؤال أو التوجيه اللفظي', example: 'يأخذ وقتاً طويلاً ومتردداً قبل البدء في تنفيذ التوجيه اللفظي أو الإجابة عن سؤال مباشر.', weight: 1 },
  { id: 11, domainId: 'listening', text: 'صعوبة ربط ما يسمعه شفهياً بالرموز والصور البصرية التوضيحية المرافقة', example: 'يصعب عليه مطابقة الكلمة المنطوقة مع الصورة الدالة عليها في بطاقات التعلم أو الكتاب.', weight: 1 },
  { id: 12, domainId: 'listening', text: 'يخلط بين الكلمات المتشابهة في الوزن الصوتي والإيقاع السمعي', example: 'يخلط بين الكلمات ذات السجع والجرس المتقارب مثل: جمال/كمال، بحر/نحر.', weight: 1 },
  { id: 13, domainId: 'listening', text: 'صعوبة إدراك وتوقع نهاية الجمل الشفهية أو الأناشيد الموزونة', example: 'يعجز عن إكمال الكلمة الأخيرة المقفاة في أنشودة أو عبارة موزونة تكررت أمامه.', weight: 1 },

  // 2. Thinking & Reasoning (التفكير والاستدلال والذاكرة) - 11 Items
  { id: 14, domainId: 'thinking', text: 'صعوبة فهم العلاقات المنطقية والسبب والنتيجة في المواقف التعليمية واليومية', example: 'لا يربط بين نزول المطر وابتلال الأرض، أو بين الإهمال في المذاكرة وتدني النتيجة.', weight: 1 },
  { id: 15, domainId: 'thinking', text: 'صعوبة التمييز بين المعلومات المهمة والمعلومات الثانوية غير الضرورية في المسائل والنصوص', example: 'في المسألة الحسابية يركز على لون القميص المذكور بدلاً من الأعداد المطلوب جمعها.', weight: 1 },
  { id: 16, domainId: 'thinking', text: 'صعوبة تصنيف الأشياء وفق معيارين معاً (مثل: اللون والشكل، أو الحجم والوظيفة)', example: 'يصعب عليه فرز الأشكال وفق اللون والحجم معاً (مثل استخراج المربعات الحمراء الكبيرة فقط).', weight: 1 },
  { id: 17, domainId: 'thinking', text: 'صعوبة إدراك مفهوم الزمن وتسلسل الأحداث (الأمس، اليوم، الغد، قبل، بعد، الفصول)', example: 'يخلط بين ما حدث بالأمس وما سيحدث غداً، أو ترتيب فصول السنة وتتابع أيام الأسبوع.', weight: 1 },
  { id: 18, domainId: 'thinking', text: 'صعوبة نقل وتعميم ما تعلمه من مهارة في موقف معين إلى مواقف ومسائل جديدة', example: 'يتعلم طريقة الجمع في مسألة تفاح، لكنه يعجز عن تطبيق نفس المبدأ على قطع النقود.', weight: 1 },
  { id: 19, domainId: 'thinking', text: 'بطء ملحوظ في سرعة معالجة المعلومات والتفكير قبل الوصول إلى الإجابة', example: 'يحتاج وقتاً أطول بكثير من أقرانه لمعالجة سؤال استنتاجي بسيط والوصول للحل.', weight: 1 },
  { id: 20, domainId: 'thinking', text: 'صعوبة فهم التعبيرات المجازية أو النكت أو الأمثال الشعبية البسيطة وميل للفهم الحرفي الجامد', example: 'يفسر عبارة "الوقت كالسيف" حرفياً ويبحث عن سيف حقيقي بدلاً من إدراك سرعة مرور الوقت.', weight: 1 },
  { id: 21, domainId: 'thinking', text: 'صعوبة التخطيط المسبق لحل مشكلة ما وابتكار بدائل عند فشل الخطة الأولى', example: 'إذا انكسر قلمه يتوقف تماماً عن العمل ولا يفكر في استعارة قلم أو استخدام المبراة.', weight: 1 },
  { id: 22, domainId: 'thinking', text: 'ضعف الذاكرة طويلة المدى للحقائق والمعلومات المكتسبة سابقاً وتكرار نسيانها', example: 'ينسى معلومات تم إتقانها الأسبوع الماضي كعنوان المنزل أو أسماء شهور السنة.', weight: 1 },
  { id: 23, domainId: 'thinking', text: 'صعوبة ترتيب خطوات حل مسألة أو عمل مشروع بنظام تسلسلي محكم', example: 'يبدأ بالتلوين قبل الرسم أو يكتب الناتج قبل تدوين خطوات المسألة الرياضية.', weight: 1 },
  { id: 24, domainId: 'thinking', text: 'صعوبة إدراك العلاقات المكانية والاتجاهات (فوق/تحت، يمين/يسار، داخل/خارج)', example: 'يخلط باستمرار بين اليد اليمنى واليسرى، أو بين الكتابة فوق السطر وأسفل السطر.', weight: 1 },

  // 3. Speaking (التحدث والتعبير الشفهي) - 12 Items
  { id: 25, domainId: 'speaking', text: 'صعوبة استدعاء الكلمة المناسبة أثناء الحديث واللجوء للوصف البديل أو الإشارة (صعوبة التسمية)', example: 'يريد قول "مسطرة" فيقول "الشيء الطويل الذي نخط به" أو يكتفي بالإشارة إليها.', weight: 1 },
  { id: 26, domainId: 'speaking', text: 'استخدام جمل قصيرة جداً أو تراكيب نحوية غير مكتملة مقارنة بأقرانه في نفس العمر', example: 'يتحدث بكلمات مقتضبة مثل "أنا تفاح" بدلاً من صياغة جملة تامة مثل "أنا أريد تفاحة".', weight: 1 },
  { id: 27, domainId: 'speaking', text: 'صعوبة إعادة سرد قصة أو موقف مر به بتسلسل زمني ومنطقي واضح ومفهوم', example: 'يروي أحداث رحلة صفية بشكل مشتت فيبدأ بالعودة إلى المنزل قبل ذكر ما جرى في الحديقة.', weight: 1 },
  { id: 28, domainId: 'speaking', text: 'استخدام مفردات لغوية محدودة ومكررة وتجنب المفردات الجديدة أو الأكثر دقة', example: 'يستخدم نفس الصفات العامة دائماً (حلو / كبير) ويتجنب الكلمات الوصفية المحددة.', weight: 1 },
  { id: 29, domainId: 'speaking', text: 'التردد والتوقف الطويل أو تكرار المقاطع والكلمات أثناء صياغة الإجابة الشفهية', example: 'يكرر بداية الكلمة (أ.. أ.. أنا) أو يتوقف لثوانٍ طويلة محاولاً تنظيم كلماته قبل النطق.', weight: 1 },
  { id: 30, domainId: 'speaking', text: 'صعوبة الإجابة المباشرة والمحددة عن الأسئلة المفتوحة التي تبدأ بـ (لماذا / كيف / ماذا لو)', example: 'عند سؤاله: "لماذا نرتدي المعطف في الشتاء؟" يعطي إجابة غير مرتبطة بالبرد والدفء.', weight: 1 },
  { id: 31, domainId: 'speaking', text: 'الخلط في استخدام الضمائر (أنا/هو/هي) وأدوات الإشارة والظروف الزمانية والمكانية', example: 'يقول "هو ذهبت" بدلاً من "هي ذهبت"، أو يخلط بين استخدام "هذا" و"هذه".', weight: 1 },
  { id: 32, domainId: 'speaking', text: 'صعوبة التعبير عن أفكاره ومشاعره بكلمات واضحة عند التعرض لمواقف خلافية أو محبطة', example: 'يلجأ للغضب أو البكاء بدلاً من التعبير اللفظي المباشر: "أنا متضايق لأن زميلي أخذ كتابي".', weight: 1 },
  { id: 33, domainId: 'speaking', text: 'صعوبة تعديل طريقة حديثه بحسب المستمع (التحدث مع المعلم مقارنة بالتحدث مع الزميل)', example: 'يخاطب المعلم أو الإدارة بنفس الطريقة العفوية التي يخاطب بها رفاق اللعب.', weight: 1 },
  { id: 34, domainId: 'speaking', text: 'الحاجة إلى وقت طويل لصياغة الجملة شفهياً حتى بعد معرفة الإجابة الصحيحة', example: 'يعرف الإجابة في ذهنه لكنه يستغرق وقتاً طويلاً لتجميع ألفاظها وإخراجها للمستمع.', weight: 1 },
  { id: 35, domainId: 'speaking', text: 'إسقاط حروف الربط أو حروف الجر عند التحدث بجمل مركبة', example: 'يقول "ذهبت المدرسة السيارة" بحذف حروف الجر والربط (إلى / بـ).', weight: 1 },
  { id: 36, domainId: 'speaking', text: 'صعوبة المشاركة الفعالة في المناقشات الصفية الجماعية والتعبير عن رأيه بحرية', example: 'يتجنب رفع يده أو المشاركة في الحوارات الصفية مفضلاً الصمت والعزلة اللفظية.', weight: 1 },

  // 4. Reading (القراءة والتعرف القرائي والفهم) - 16 Items
  { id: 37, domainId: 'reading', text: 'صعوبة التعرف على أشكال الحروف الهجائية وتسمية أسمائها وأصواتها بالحركات (الفتح، الضم، الكسر)', example: 'يخلط بين اسم الحرف "ميم" وصوته "مَ"، أو يعجز عن قراءة الحرف مع الحركات القصيرة.', weight: 1 },
  { id: 38, domainId: 'reading', text: 'صعوبة دمج الأصوات المنفصلة لتكوين كلمة مقروءة (التحليل والتركيب الصوتي/الفونيمي)', example: 'ينطق أصوات الحروف (كـ - تـ - بـ) منفردة لكنه يعجز عن دمجها لقراءة كلمة "كَتَبَ".', weight: 1 },
  { id: 39, domainId: 'reading', text: 'الخلط والتبديل بين الحروف المتشابهة رسماً (مثل: ب/ت/ث، ج/ح/خ، ر/ز، س/ش)', example: 'يقرأ "بيت" على أنها "تيت" أو "شجر" على أنها "سجر" بسبب تشابه الهيكل البصري للحرف.', weight: 1 },
  { id: 40, domainId: 'reading', text: 'الخلط والتبديل بين الحروف المتشابهة صوتاً أثناء القراءة الجهرية (مثل: د/ض، ك/ق، ت/ط)', example: 'يقرأ "قلب" كـ "كلب" أو "طالب" كـ "تالب" لتقارب المخارج الصوتية أثناء القراءة الجهرية.', weight: 1 },
  { id: 41, domainId: 'reading', text: 'عكس اتجاه قراءة الكلمات أو المقاطع (مثل قراءة "رد" بدلاً من "در" أو قراءة المقاطع مقلوبة)', example: 'يقرأ كلمة "برد" على أنها "درب" أو "سار" على أنها "راس" بعكس ترتيب الحروف.', weight: 1 },
  { id: 42, domainId: 'reading', text: 'حذف بعض الحروف أو الكلمات أو إضافتها أثناء القراءة الجهرية دون أن يدرك ذلك', example: 'يقرأ الجملة "ذهب الولد إلى المدرسة" فيسقط كلمة "إلى" أو يضيف كلمة من عنده دون انتباه.', weight: 1 },
  { id: 43, domainId: 'reading', text: 'استبدال الكلمات بكلمات أخرى ذات معنى مقارب دون الالتزام بالنص المكتوب (مثل قراءة "منزل" بدلاً من "بيت")', example: 'يرى في النص كلمة "سيارة" فيقرأها "مركبة" أو "عربية" اعتماداً على التخمين لا القراءة.', weight: 1 },
  { id: 44, domainId: 'reading', text: 'بطء شديد وتعتعة وتردد مبالغ فيه أثناء القراءة الجهرية مقارنة بمتوسط سرعة أقرانه', example: 'يقرأ كلمة كلمة بتهجئة بطيئة ومجهدة متأخراً بفارق ملحوظ عن متوسط سرعة الصف.', weight: 1 },
  { id: 45, domainId: 'reading', text: 'فقدان السطر وتخطي سطور كاملة أو العودة لنفس السطر أثناء القراءة والحاجة لوضع الإصبع/المسطرة', example: 'ينتقل بالخطأ من السطر الأول إلى السطر الثالث أو يعيد نفس السطر لولا تتبعه بإصبعه.', weight: 1 },
  { id: 46, domainId: 'reading', text: 'صعوبة قراءة الكلمات غير المألوفة أو الكلمات ثلاثية ورباعية الحركات الجديدة', example: 'يتعثر تماماً عند مصادفة كلمة جديدة لم يألف رؤيتها من قبل مثل "استبسل" أو "مترامي".', weight: 1 },
  { id: 47, domainId: 'reading', text: 'صعوبة قراءة الكلمات البصرية الشائعة ذات التردد العالي بسرعة وبشكل آلي فوري', example: 'يستغرق وقتاً طويلاً لتهجئة كلمات تتكرر يومياً مثل (هذا، هذه، الذي، على، في).', weight: 1 },
  { id: 48, domainId: 'reading', text: 'صعوبة فهم معنى ما قرأه بعد الانتهاء من القراءة الجهرية رغم تمكنه من نطق الكلمات (ضعف الاستيعاب القرائي)', example: 'يقرأ فقرة كاملة بصوت سليم، ولكن عند سؤاله عن محتواها يعجز عن تلخيص ما قرأه.', weight: 1 },
  { id: 49, domainId: 'reading', text: 'صعوبة الإجابة عن الأسئلة المباشرة المتعلقة بتفاصيل النص المقروء (الشخصيات، المكان، الأحداث)', example: 'يعجز عن الإجابة عن سؤال مباشر مثل "من زار الحديقة؟" رغم وجود الاسم الصريح في النص.', weight: 1 },
  { id: 50, domainId: 'reading', text: 'صعوبة استنتاج المعنى الضمني أو التنبؤ بالأحداث التالية من النص المقروء', example: 'يعجز عن تخمين ما سيحدث للبطل بعد سقوطه في مأزق بناءً على سياق القصة.', weight: 1 },
  { id: 51, domainId: 'reading', text: 'تجنب أنشطة القراءة وإظهار القلق والتوتر الشديد عند طلب القراءة أمامه في الصف', example: 'يتظاهر بالمرض أو يتجنب النظر إلى المعلم خوفاً من اختياره للقراءة الجهرية.', weight: 1 },
  { id: 52, domainId: 'reading', text: 'صعوبة التمييز بين اللام الشمسية واللام القمرية والتنوين والمدود أثناء القراءة', example: 'يقرأ التنوين كنون أصلية، أو يلفظ اللام الشمسية في كلمة "الشَّمس" بدلاً من إدغامها.', weight: 1 },

  // 5. Writing (الكتابة والتعبير الكتابي والإملاء) - 14 Items
  { id: 53, domainId: 'writing', text: 'صعوبة مسك القلم بالطريقة الصحيحة والضغط الزائد أو الضعيف جداً على الورقة', example: 'يمسك القلم بقبضة اليد كاملة أو يضغط بشدة تؤدي لتمزيق الصفحة وإجهاد أصابعه سريعاً.', weight: 1 },
  { id: 54, domainId: 'writing', text: 'رداءة الخط وعدم وضوح الحروف وصعوبة تمييز الكلمات المكتوبة حتى بالنسبة له شخصياً', example: 'تتداخل الحروف وتفتقر للأسنان والنقاط مما يجعل قراءة ما كتبه أمراً بالغ الصعوبة.', weight: 1 },
  { id: 55, domainId: 'writing', text: 'عكس كتابة الحروف والأرقام (مثل كتابة 2 بدلاً من 6، أو 3 مقلوبة، أو ج/ح/خ معكوسة)', example: 'يكتب الرقم 2 مكان 6، أو يكتب حرف الحاء أو الجيم في اتجاه معاكس (مرآتي).', weight: 1 },
  { id: 56, domainId: 'writing', text: 'عدم الالتزام بالسطر والكتابة بميلان شديد إلى الأعلى أو الأسفل على الصفحة', example: 'يبدأ الكتابة في يمين السطر ثم يصعد أو يهبط بخطه بزاوية مائلة بعيداً عن السطر.', weight: 1 },
  { id: 57, domainId: 'writing', text: 'عدم تناسق أحجام الحروف والمسافات بين الكلمات (تداخل الكلمات أو ترك فراغات هائلة)', example: 'يكتب حرفاً كبيراً جداً ويليه حرف دقيق جداً، أو تلتصق الكلمات دون ترك مسافات فاصلة.', weight: 1 },
  { id: 58, domainId: 'writing', text: 'كثرة الأخطاء الإملائية الشائعة في كتابة التاء المربوطة والمفتوحة والهمزات والتنوين', example: 'يكتب "مدرسه" بالهاء بدل المربوطة، أو "كتابن" بدلاً من "كتاباً"، أو يخطئ في الهمزة.', weight: 1 },
  { id: 59, domainId: 'writing', text: 'حذف حروف المد أو إضافة حروف زائدة عند كتابة الإملاء المنظور أو الاختباري', example: 'يكتب "سمع" بدلاً من "سامع"، أو يكتب "قالم" بدلاً من "قلم" لخلطه بين الحركات والمدود.', weight: 1 },
  { id: 60, domainId: 'writing', text: 'صعوبة النقل والنسخ الدقيق من السبورة أو من الكتاب المدرسي إلى الدفتر', example: 'يستغرق وقتاً طويلاً لنقل جملة من السبورة مع ارتكاب أخطاء حذف وتبديل في المنقول.', weight: 1 },
  { id: 61, domainId: 'writing', text: 'بطء شديد في الكتابة وعدم القدرة على إكمال الواجبات والامتحانات الكتابية في الوقت المحدد', example: 'ينتهي وقت الامتحان وهو لم يكتب إلا إجابة سؤالين فقط لبطء حركة يده في التدوين.', weight: 1 },
  { id: 62, domainId: 'writing', text: 'صعوبة صياغة جملة مفيدة صحيحة نحوياً وإملائياً للتعبير عن فكرة بسيطة', example: 'يعجز عن كتابة جملة تامة مثل "ذهب أخي إلى الحديقة" ويكتفي بكلمات غير مترابطة.', weight: 1 },
  { id: 63, domainId: 'writing', text: 'صعوبة كتابة فقرة تعبيرية مترابطة واستخدام علامات الترقيم (النقطة، الفاصلة، علامة الاستفهام)', example: 'يكتب نصوصاً ككتلة واحدة ممتدة دون فواصل أو نقط في نهايات الجمل.', weight: 1 },
  { id: 64, domainId: 'writing', text: 'صعوبة تنظيم وترتيب الأفكار في موضوع تعبير أو مقال دون مساعدة مباشرة', example: 'يكتب جملاً عشوائية متباينة في موضوع التعبير عن الأسرة أو الوطن دون تسلسل منطقي.', weight: 1 },
  { id: 65, domainId: 'writing', text: 'كثرة الشطب والمسح وتمزيق الورق أثناء محاولة الكتابة لشعوره بالإحباط من مظهر خطه', example: 'يمحو الكلمة عدة مرات حتى تتلف الصفحة بسبب عدم رضاه أو كثرة ارتباكه الكتابي.', weight: 1 },
  { id: 66, domainId: 'writing', text: 'صعوبة التمييز بين كتابة الحروف المتصلة والحروف المنفصلة ومواضع الحرف في الكلمة', example: 'يكتب حرف العين في وسط الكلمة بشكله المنفصل (ـعـ بدل ع) أو يخطئ في تشبيك الحروف.', weight: 1 },

  // 6. Mathematics (الرياضيات والحساب) - 12 Items
  { id: 67, domainId: 'math', text: 'صعوبة حفظ حقائق الجمع والطرح والضرب الأساسية (جداول الضرب) وتكرار نسيانها سريعاً', example: 'يعجز عن تذكر ناتج 6 × 7 أو 8 + 5 رغم التدريب والمراجعة اليومية المتكررة.', weight: 1 },
  { id: 68, domainId: 'math', text: 'الاعتماد المستمر على العد بالأصابع في العمليات الحسابية البسيطة المناسبة لسنه', example: 'يلجأ للعد على أصابعه لحساب مسائل مثل 5 + 4 رغم تقدمه في الصفوف الدراسية.', weight: 1 },
  { id: 69, domainId: 'math', text: 'صعوبة فهم مفهوم القيمة المنزلية للأعداد (الآحاد، العشرات، المئات، الألوف) والخلط بينها', example: 'يقرأ العدد 52 على أنه 25، أو لا يدرك أن الرقم 7 في العدد 730 يمثل سبعمائة.', weight: 1 },
  { id: 70, domainId: 'math', text: 'الخلط والتبديل بين الرموز والعمليات الرياضية (مثل الخلط بين + و ×، أو - و ÷)', example: 'يقوم بعملية الجمع عند وجود إشارة الضرب، أو يطرح عند رؤية إشارة القسمة.', weight: 1 },
  { id: 71, domainId: 'math', text: 'صعوبة محاذاة وترتيب الأرقام رأسياً في الخانات الصحيحة عند إجراء عمليات الجمع والطرح المطول', example: 'يضع خانة الآحاد تحت خانة العشرات في الجمع الرأسي مما يؤدي لنتائج حسابية خاطئة.', weight: 1 },
  { id: 72, domainId: 'math', text: 'صعوبة إجراء عمليات الاستلاف وإعادة التسمية في الطرح أو الحمل باليد في الجمع', example: 'في مسألة (43 - 18) يطرح 3 من 8 ويكتب 5 بدلاً من الاستلاف الصحيح من العشرات.', weight: 1 },
  { id: 73, domainId: 'math', text: 'صعوبة قراءة وفهم المسائل الرياضية اللفظية وتحويلها إلى معادلات حسابية صحيحة', example: 'عند قراءة مسألة: "اشترى محمد 4 كتب بسعر 5 ريالات للكتاب" يعجز عن تحديد العملية المناسبة.', weight: 1 },
  { id: 74, domainId: 'math', text: 'صعوبة تقدير الكميات والمسافات والمقاسات بالنظر (التقدير التقريبي للأعداد والأحجام)', example: 'يقدر طول الغرفة بـ 50 متراً أو وزن الحقيبة بـ 100 جرام لغياب الحس التقديري للأرقام.', weight: 1 },
  { id: 75, domainId: 'math', text: 'صعوبة قراءة الساعة الرقمية وذات العقارب وحساب الوقت المنقضي', example: 'يخلط بين عقرب الساعات وعقرب الدقائق أو يعجز عن حساب كم دقيقة متبقية لانتهاء الحصة.', weight: 1 },
  { id: 76, domainId: 'math', text: 'صعوبة التعامل مع النقود والفئات المالية وحساب الباقي أثناء الشراء', example: 'يعطي ورقة نقدية للبائع دون معرفة ما إذا كان المبلغ كافياً أو كم المبلغ المتبقي له.', weight: 1 },
  { id: 77, domainId: 'math', text: 'صعوبة قراءة الرسوم البيانية والجداول الإحصائية البسيطة واستخراج البيانات منها', example: 'يعجز عن استخراج اليوم الأكثر إنتاجاً أو المادة الأعلى درجات من جدول بياني مبسط.', weight: 1 },
  { id: 78, domainId: 'math', text: 'صعوبة فهم الكسور والأعداد العشرية والنسب المئوية والعمليات الحسابية المرتبطة بها', example: 'يعتقد أن 1/4 أكبر من 1/2 بحجة أن الرقم 4 أكبر من الرقم 2.', weight: 1 },

  // 7. Motor & Organization (التنظيم الحركي والسلوك الأكاديمي) - 10 Items
  { id: 79, domainId: 'motor', text: 'صعوبة تنظيم الحقيبة المدرسية والدفاتر والأدوات وفقدانها أو نسيانها المتكرر', example: 'ينسى كتبه وأقلامه باستمرار في الفصل أو تكون حقيبته ممتلئة بأوراق ممزقة غير مرتبة.', weight: 1 },
  { id: 80, domainId: 'motor', text: 'صعوبة إدارة وتوزيع وقت أداء الواجبات المدرسية أو المذاكرة للامتحانات دون إشراف مستمر', example: 'يؤجل البدء في واجباته حتى وقت متأخر من الليل أو يستغرق ساعات طويلة في تمرين يسير.', weight: 1 },
  { id: 81, domainId: 'motor', text: 'صعوبة في المهارات الحركية الدقيقة مثل استخدام المقص، تلوين الأشكال داخل الإطار، أو ربط الحذاء', example: 'يخرج عن حدود التلوين بوضوح، أو يجد صعوبة بالغة في قص الأشكال واستخدام الممحاة وربط الحذاء.', weight: 1 },
  { id: 82, domainId: 'motor', text: 'التعثر المتكرر أو الاصطدام بالأثاث والأشخاص ومظاهر الخرق الحركي والترنح في المشي والجري', example: 'يصطدم بالمقاعد والأبواب أثناء الحركة في الفصل وتسقط أدواته وأكوابه بشكل متكرر.', weight: 1 },
  { id: 83, domainId: 'motor', text: 'صعوبة رسم الأشكال الهندسية الأساسية (المربع، المثلث، الدائرة، المعين) ونقلها بدقة', example: 'يرسم المربع بأضلاع غير متساوية أو يرسم الدائرة كشكل بيضاوي متعرج غير مغلق.', weight: 1 },
  { id: 84, domainId: 'motor', text: 'صعوبة متابعة الجدول المدرسي الأسبوعي وتجهيز الكتب المطلوبة لكل حصة مسبقاً', example: 'يُحضر كتب يوم الأحد في يوم الاثنين لعدم مراجعته للجدول المدرسي المنظم.', weight: 1 },
  { id: 85, domainId: 'motor', text: 'الاندفاعية وبدء المهام الأكاديمية قبل الاستماع لكامل التعليمات والإرشادات', example: 'يبدأ في حل ورقة النشاط قبل أن ينتهي المعلم من شرح طريقة الحل والمطلوب.', weight: 1 },
  { id: 86, domainId: 'motor', text: 'صعوبة الجلوس بهدوء والميل للحركة المستمرة والتململ على المقعد أثناء الأنشطة الصفية', example: 'يتأرجح على مقعده باستمرار أو ينهض دون إذن للبحث عن أشياء غير ضرورية.', weight: 1 },
  { id: 87, domainId: 'motor', text: 'صعوبة التكيف مع التغييرات المفاجئة في روتين اليوم المدرسي أو تبديل الحصص', example: 'يصاب بالقلق أو العناد الشديد إذا تم استبدال حصة النشاط بحصة دراسية أخرى فجأة.', weight: 1 },
  { id: 88, domainId: 'motor', text: 'إظهار مستويات عالية من الإحباط السريع والانسحاب عند مواجهة مهمة أكاديمية تتطلب جهداً ذهنياً', example: 'يغلق الكتاب ويضع رأسه على الطاولة قائلاً "لا أستطيع" بمجرد مصادفة مسألة غير مألوفة.', weight: 1 },
];

/**
 * Psychometric Calculation for LDES
 * معايير التحويل الإحصائي الموزون (Standard Score: M=10, SD=3)
 * وحاصل صعوبات التعلم الكلي (LDEQ: M=100, SD=15)
 */
export function calculateLDESPsychometrics(scores = {}) {
  let totalAnswered = 0;
  let totalRawScore = 0;
  let developmentalRaw = 0;
  let academicRaw = 0;

  const domainResults = LDES_DOMAINS.map(domain => {
    const domainItems = LDES_ITEMS.filter(it => it.domainId === domain.id);
    const maxRaw = domainItems.length * 3; // Maximum score if every item is 3
    let rawScore = 0;
    let answeredCount = 0;

    domainItems.forEach(item => {
      const val = scores[item.id];
      if (val !== undefined && val !== null && val !== '') {
        const numVal = Number(val);
        rawScore += numVal;
        answeredCount++;
      }
    });

    totalAnswered += answeredCount;
    totalRawScore += rawScore;

    if (domain.category === 'developmental') {
      developmentalRaw += rawScore;
    } else {
      academicRaw += rawScore;
    }

    // Standard Score conversion (1 - 20, where higher raw error score means LOWER standard ability score)
    // Baseline: Normal ability is 10. If error is 0%, standard score is ~15-18. If error is 100%, standard score is 1-3.
    const errorRatio = maxRaw > 0 ? (rawScore / maxRaw) : 0;
    let scaledScore = Math.round(16 - (errorRatio * 14));
    if (scaledScore < 1) scaledScore = 1;
    if (scaledScore > 20) scaledScore = 20;

    // Percentile rank calculation
    let percentile = 50;
    if (scaledScore >= 16) percentile = 98;
    else if (scaledScore === 15) percentile = 95;
    else if (scaledScore === 14) percentile = 91;
    else if (scaledScore === 13) percentile = 84;
    else if (scaledScore === 12) percentile = 75;
    else if (scaledScore === 11) percentile = 63;
    else if (scaledScore === 10) percentile = 50;
    else if (scaledScore === 9) percentile = 37;
    else if (scaledScore === 8) percentile = 25;
    else if (scaledScore === 7) percentile = 16;
    else if (scaledScore === 6) percentile = 9;
    else if (scaledScore === 5) percentile = 5;
    else if (scaledScore === 4) percentile = 2;
    else percentile = 1;

    // Clinical severity classification for domain
    let severityLevel = 'طبيعي / مناسب للعمر';
    let severityClass = 'b-gr';
    let severityKey = 'normal';

    if (scaledScore <= 4) {
      severityLevel = 'صعوبة شديدة جداً (Severe Deficit)';
      severityClass = 'b-rd';
      severityKey = 'severe';
    } else if (scaledScore <= 6) {
      severityLevel = 'صعوبة ملحوظة (Significant Deficit)';
      severityClass = 'b-or';
      severityKey = 'moderate';
    } else if (scaledScore <= 7) {
      severityLevel = 'صعوبة حدية / خفيفة (Mild Deficit)';
      severityClass = 'b-or';
      severityKey = 'mild';
    } else if (scaledScore <= 12) {
      severityLevel = 'متوسط طبيعي (Average)';
      severityClass = 'b-gr';
      severityKey = 'normal';
    } else {
      severityLevel = 'فوق المتوسط / نقطة قوة (Strength)';
      severityClass = 'b-bl';
      severityKey = 'strength';
    }

    return {
      ...domain,
      rawScore,
      maxRaw,
      answeredCount,
      totalItems: domainItems.length,
      completionRate: Math.round((answeredCount / domainItems.length) * 100),
      scaledScore,
      percentile,
      severityLevel,
      severityClass,
      severityKey,
      errorRatio: Math.round(errorRatio * 100),
    };
  });

  // Calculate sum of standard scores
  const sumScaledScores = domainResults.reduce((acc, d) => acc + d.scaledScore, 0);

  // Calculate Learning Disabilities Evaluation Quotient (LDEQ): M = 100, SD = 15
  // Mean sum of 7 subscales = 70. SD of sum ≈ 7.9.
  // Formula: LDEQ = 100 + ((Sum - 70) / 7.9) * 15
  let ldeq = Math.round(100 + ((sumScaledScores - 70) / 7.9) * 15);
  if (ldeq < 45) ldeq = 45;
  if (ldeq > 150) ldeq = 150;

  // Overall percentile rank based on LDEQ
  let overallPercentile = 50;
  if (ldeq >= 130) overallPercentile = 99;
  else if (ldeq >= 120) overallPercentile = 91;
  else if (ldeq >= 110) overallPercentile = 75;
  else if (ldeq >= 100) overallPercentile = 50;
  else if (ldeq >= 90) overallPercentile = 25;
  else if (ldeq >= 85) overallPercentile = 16;
  else if (ldeq >= 80) overallPercentile = 9;
  else if (ldeq >= 75) overallPercentile = 5;
  else if (ldeq >= 70) overallPercentile = 2;
  else overallPercentile = 1;

  // Overall Diagnosis and Severity Level
  let probability = 'مستبعدة / أداء طبيعي';
  let severityLevel = 'أداء نمائي وأكاديمي طبيعي ضمن المتوسط العام';
  let severityKey = 'normal';
  let severityColor = '#059669';
  let recommendationSummary = 'مواصلة المتابعة التربوية الصفية المعتادة ودعم نقاط القوة النمائية والأكاديمية.';

  if (ldeq < 70) {
    probability = 'مؤكدة وشديدة (Highly Probable / Severe LD)';
    severityLevel = 'صعوبات تعلم نمائية وأكاديمية شديدة دالة إحصائياً (تستوجب خطة تربوية فردية مكثفة IEP)';
    severityKey = 'severe';
    severityColor = '#dc2626';
    recommendationSummary = 'إدراج الطالب بصفة عاجلة في برنامج غرف المصادر وتصميم خطة تربوية فردية مكثفة مع تقديم الدعم السلوكي والمعالجة النمائية وتكييف أساليب التقييم.';
  } else if (ldeq < 80) {
    probability = 'واضحة ومتوسطة (Probable / Moderate LD)';
    severityLevel = 'صعوبات تعلم نوعية ملحوظة (تتطلب خدمات التربية الخاصة وغرفة المصادر)';
    severityKey = 'moderate';
    severityColor = '#ea580c';
    recommendationSummary = 'تقديم خدمات التربية الخاصة وغرفة المصادر لمعالجة جوانب الضعف الأكاديمية والنمائية المحددة مع تكييف بيئة التعلم.';
  } else if (ldeq < 90) {
    probability = 'محتملة / خفيفة إلى حدية (Borderline / Mild LD)';
    severityLevel = 'صعوبات تعلم خفيفة إلى حدية أو بطء تعلم في بعض المهارات المحددة';
    severityKey = 'mild';
    severityColor = '#d97706';
    recommendationSummary = 'تطبيق استراتيجيات التدخل الأولي (RTI) والمتابعة المعززة في الصف العام مع جلسات دعم مسائية واستراتيجيات تدريس علاجية.';
  }

  // Identify Deficit Domains and Strength Domains
  const deficitDomains = domainResults.filter(d => d.scaledScore <= 7);
  const strengthDomains = domainResults.filter(d => d.scaledScore >= 11);

  // Group into Developmental vs Academic indices
  const devDomains = domainResults.filter(d => d.category === 'developmental');
  const acadDomains = domainResults.filter(d => d.category === 'academic');

  const devSum = devDomains.reduce((acc, d) => acc + d.scaledScore, 0);
  const acadSum = acadDomains.reduce((acc, d) => acc + d.scaledScore, 0);

  const devAvgScaled = devDomains.length > 0 ? (devSum / devDomains.length).toFixed(1) : '10.0';
  const acadAvgScaled = acadDomains.length > 0 ? (acadSum / acadDomains.length).toFixed(1) : '10.0';

  return {
    totalAnswered,
    answeredCount: totalAnswered,
    totalItems: LDES_ITEMS.length,
    completionPercentage: Math.round((totalAnswered / LDES_ITEMS.length) * 100),
    totalRawScore,
    sumScaledScores,
    ldeq,
    overallPercentile,
    probability,
    overallStatus: probability,
    severityLevel,
    severityKey,
    severityColor,
    recommendationSummary,
    conclusionText: recommendationSummary,
    diagnosisDescription: recommendationSummary,
    domainResults,
    dimensionsResults: domainResults,
    dimensions: domainResults,
    deficitDomains,
    deficitDimensions: deficitDomains,
    strengthDomains,
    devAvgScaled,
    acadAvgScaled,
    developmentalRaw,
    academicRaw,
  };
}
