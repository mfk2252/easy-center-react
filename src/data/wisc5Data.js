/**
 * WISC-V (Wechsler Intelligence Scale for Children - Fifth Edition)
 * مقياس وكسلر لذكاء الأطفال - الطبعة الخامسة المقننة
 * 
 * المطور الأصلي: د. ديفيد وكسلر (David Wechsler)
 * جهة النشر والتطوير: مؤسسة بيرسون للتقييم الإكلينيكي (Pearson Clinical Assessment)
 * 
 * المقياس الأوسع انتشاراً واعتماداً عالمياً لقياس القدرات العقلية والمعرفية للأطفال واليافعين من عمر 6:0 إلى 16:11 سنة.
 * يمنح نسبة الذكاء الكلية (FSIQ - Full Scale IQ) وخمسة مؤشرات معرفية أولية:
 * 1. مؤشر الفهم اللفظي (Verbal Comprehension Index - VCI)
 * 2. مؤشر البصري المكاني / الفضائي (Visual Spatial Index - VSI)
 * 3. مؤشر الاستدلال السائل / التحليلي (Fluid Reasoning Index - FRI)
 * 4. مؤشر الذاكرة العاملة (Working Memory Index - WMI)
 * 5. مؤشر سرعة المعالجة (Processing Speed Index - PSI)
 */

export const WISC5_COPYRIGHT_INFO = {
  scaleNameAr: 'مقياس وكسلر لذكاء الأطفال — الطبعة الخامسة (WISC-V)',
  scaleNameEn: 'Wechsler Intelligence Scale for Children — Fifth Edition (WISC-V)',
  scaleShortName: 'WISC-V',
  authorAr: 'د. ديفيد وكسلر (David Wechsler, Ph.D.)',
  authorEn: 'David Wechsler, Ph.D.',
  publisherAr: 'بيرسون للتقييم الإكلينيكي (Pearson Clinical Assessment / NCS Pearson, Inc.)',
  publisherEn: 'Pearson Clinical Assessment / NCS Pearson, Inc.',
  adaptationAr: 'النسخة المقننة والمعربة المعتمدة في البيئة العربية والمراكز التشخيصية المتخصصة',
  targetAge: 'من عمر 6 سنوات و0 أشهر حتى 16 سنة و11 شهراً (6:0 – 16:11)',
  standardsReference: 'معايير الجمعية الأمريكية لعلم النفس (APA) ودليل DSM-5 وتصنيفات IDEA للإعاقة الفكرية والموهبة والتفوق',
  diagnosticNature: 'مخصص للتشخيص النفسي الإكلينيكي والتقييم التربوي الشامل المعتمد',
  hostPlatform: 'منصة إيزي سنتر لتشغيل وتطبيق المقاييس الرقمية (Host Platform)',
  notice: 'مقياس وكسلر لذكاء الأطفال (WISC-V) هو علامة تجارية مسجلة لشركة NCS Pearson, Inc. أداة القياس السيكومترية مخصصة للاستخدام المهني والتشخيصي للأخصائيين النفسيين والتربويين ومراكز التربية الخاصة والتأهيل المعتمدة لبناء الخطة التربوية الفردية (IEP) ومتابعة التطور المعرفي.',
  disclaimer: 'تنبيه مهني: يجب أن تطبق نتائج هذا المقياس بواسطة أخصائي نفسي/تربوي مؤهل، وتفسر الدرجات في ضوء السلوك الملاحظ والبيئة المدرسية والأسرية والتقييمات التحصيلية والتكيفية المساندة.',
};

export const WISC5_RESPONSE_OPTIONS = [
  {
    value: 3,
    score: 3,
    label: '3 - إتقان كامل واستجابة نموذجية مجردة',
    description: 'يقدم استجابة مفاهيمية نموذجية ودقيقة تعكس فهماً تجريدياً وعالياً للمفهوم أو المهمة المعرفية.',
    badgeClass: 'b-gr',
  },
  {
    value: 2,
    score: 2,
    label: '2 - أداء ملائم ومقبول (مستوى متوسط)',
    description: 'يحل المهمة بنجاح مع صياغة وصفية وظيفية صحيحة أو استغراق زمن قياسي ملائم لعمره الزمني.',
    badgeClass: 'b-bl',
  },
  {
    value: 1,
    score: 1,
    label: '1 - استجابة جزئية أو بمساعدة/زمن ممتد (مستوى منخفض)',
    description: 'استجابة صحيحة جزئياً أو سطحية/ملموسة، أو إنجاز المهمة بعد تجاوز الوقت القياسي المفضل.',
    badgeClass: 'b-or',
  },
  {
    value: 0,
    score: 0,
    label: '0 - عدم القدرة على الحل / استجابة خاطئة',
    description: 'عجز عن إتمام المهمة، عدم فهم المطلب، أو تقديم استجابة غير ملائمة للمثير المعرفي.',
    badgeClass: 'b-rd',
  },
];

export const WISC5_DOMAINS = [
  {
    id: 'vci',
    code: 'VCI',
    name: 'مؤشر الفهم اللفظي',
    nameEn: 'Verbal Comprehension Index (VCI)',
    icon: '🗣️',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#7dd3fc',
    description: 'يقيس تكوين المفاهيم اللفظية، الاستدلال اللفظي، الحصيلة اللغوية المعرفية، والمعلومات المكتسبة من البيئة والثقافة.',
    itemsCount: 8,
  },
  {
    id: 'vsi',
    code: 'VSI',
    name: 'مؤشر البصري الفضائي / المكاني',
    nameEn: 'Visual Spatial Index (VSI)',
    icon: '📐',
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#c4b5fd',
    description: 'يقيس المعالجة البصرية المكانية، التآزر البصري الحركي، تحليل العلاقات المكانية وتركيب النماذج المجردة.',
    itemsCount: 6,
  },
  {
    id: 'fri',
    code: 'FRI',
    name: 'مؤشر الاستدلال السائل / التحليلي',
    nameEn: 'Fluid Reasoning Index (FRI)',
    icon: '🧩',
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    description: 'يقيس القدرة على حل المشكلات الجديدة وغير المألوفة، التفكير الاستقرائي والكمي، واستنتاج القواعد المنطقية.',
    itemsCount: 6,
  },
  {
    id: 'wmi',
    code: 'WMI',
    name: 'مؤشر الذاكرة العاملة',
    nameEn: 'Working Memory Index (WMI)',
    icon: '💾',
    color: '#ea580c',
    bgLight: '#fff7ed',
    borderColor: '#fdba74',
    description: 'يقيس الانتباه المركز، الاحتفاظ بالمعلومات اللفظية والبصرية في الذاكرة قصيرة المدى ومعالجتها ذهنياً في نفس الوقت.',
    itemsCount: 6,
  },
  {
    id: 'psi',
    code: 'PSI',
    name: 'مؤشر سرعة المعالجة',
    nameEn: 'Processing Speed Index (PSI)',
    icon: '⚡',
    color: '#dc2626',
    bgLight: '#fef2f2',
    borderColor: '#fca5a5',
    description: 'يقيس سرعة المسح البصري، دقة التمييز، التنسيق بين العين واليد، والسرعة الإدراكية الحركية تحت ضغط الوقت.',
    itemsCount: 6,
  },
];

export const WISC5_ITEMS = [
  // 1. Verbal Comprehension Index (VCI) - 8 items
  {
    id: 1,
    domainId: 'vci',
    subtest: 'المتشابهات (Similarities)',
    title: 'إدراك التشابه اللفظي بين مفهومين شائعين (مثل: تفاح وموز / قطار وطائرة)',
    description: 'يقيس قدرة الطفل على التجريد واستخراج الفئة التصنيفية المشتركة بين كلمتين.',
    iepGoal: 'تنمية مهارات التفكير التجريدي والربط المنطقي وتصنيف المفاهيم في فئات دلالية عليا.',
  },
  {
    id: 2,
    domainId: 'vci',
    subtest: 'المتشابهات المتقدمة (Abstract Similarities)',
    title: 'تحديد العلاقة التجريدية بين مفاهيم معنوية (مثل: الغضب والفرح / الفضاء والزمن)',
    description: 'يقيس مستوى التفكير المفاهيمي الفلسفي والمقارنة بين أفكار غير مادية.',
    iepGoal: 'تدريب الطالب على استنتاج أوجه الشبه بين المفاهيم المجردة والظواهر المعنوية بدقة.',
  },
  {
    id: 3,
    domainId: 'vci',
    subtest: 'المفردات اللغوية (Vocabulary)',
    title: 'تحديد وتعريف معاني الكلمات المحسوسة والمصطلحات الشائعة بدقة ولغة سليمة',
    description: 'يقيس الثروة اللفظية التعبيرية والمعرفة المعجمية للطفل وتطوره اللغوي.',
    iepGoal: 'إثراء الحصيلة المعجمية واللغوية وتدريب الطالب على تقديم تعريفات دقيقة للأشياء.',
  },
  {
    id: 4,
    domainId: 'vci',
    subtest: 'المفردات المجردة (Advanced Vocabulary)',
    title: 'شرح وتفسير معاني الكلمات التجريدية والمصطلحات العلمية والاجتماعية',
    description: 'يقيس عمق الفهم اللغوي وقدرة الطالب على صياغة مفاهيم مجردة بلغة ذاتية متكاملة.',
    iepGoal: 'تطوير مهارة الشرح والتفسير اللفظي للمصطلحات المعرفية والتعبير بألفاظ بديلة.',
  },
  {
    id: 5,
    domainId: 'vci',
    subtest: 'المعلومات العامة (Information)',
    title: 'الإجابة عن أسئلة المعرفة العامة والبيئية والجغرافية والتاريخية المناسبة للعمر',
    description: 'يقيس سعة المعلومات المكتسبة من الثقافة والتعليم والفضول المعرفي لدى الطفل.',
    iepGoal: 'توسيع مدارك الطالب المعرفية في العلوم والبيئة والثقافة العامة من خلال القراءة والأنشطة.',
  },
  {
    id: 6,
    domainId: 'vci',
    subtest: 'الفهم والاستيعاب العام (Comprehension)',
    title: 'فهم السلوكيات المقبولة اجتماعياً وحل المشكلات اليومية وتفسير القواعد والأنظمة',
    description: 'يقيس الحصافة الاجتماعية والتكيف العملي وتطبيق المبادئ الأخلاقية والأعراف.',
    iepGoal: 'تنمية الحكم الاجتماعي والاستدلال العملي في حل المشكلات الأسرية والمدرسية واليومية.',
  },
  {
    id: 7,
    domainId: 'vci',
    subtest: 'الفهم العام والتعليل (Social Reasoning)',
    title: 'تعليل أسباب وضع القوانين (مثل: لماذا يجب وجود إشارات المرور أو دفع الرسوم؟)',
    description: 'يقيس قدرة الطفل على تعليل النظم الاجتماعية وإدراك الصالح العام والقواعد.',
    iepGoal: 'تعزيز الفهم المنطقي للأنظمة والقوانين وتطوير التفكير التبريري الإيجابي.',
  },
  {
    id: 8,
    domainId: 'vci',
    subtest: 'الاستدلال اللغوي والسياقي (Verbal Reasoning)',
    title: 'استنتاج المغزى أو الحل من خلال جمل وأوصاف لفظية متتالية وألغاز لغوية',
    description: 'يقيس الاستماع الناقد والاستنتاج من السياق اللفظي المباشر وغير المباشر.',
    iepGoal: 'تطوير الاستماع التحليلي واستنتاج الأفكار الضمنية والمغزى من النصوص المسموعة.',
  },

  // 2. Visual Spatial Index (VSI) - 6 items
  {
    id: 9,
    domainId: 'vsi',
    subtest: 'تصميم المكعبات الأساسي (Block Design - Basic)',
    title: 'إعادة بناء نماذج هندسية ثنائية الألوان باستخدام المكعبات وفق نموذج بصري محدد',
    description: 'يقيس التآزر الحركي البصري والقدرة على تحليل الكل إلى أجزائه الهندسية.',
    iepGoal: 'تحسين التآزر البصري الحركي ومهارات التركيب والتطابق المكاني للأشكال ثنائية وثلاثية الأبعاد.',
  },
  {
    id: 10,
    domainId: 'vsi',
    subtest: 'تصميم المكعبات المعقد (Block Design - Complex)',
    title: 'تركيب أنماط بصرية مركبة بالمكعبات (4 إلى 9 مكعبات) بدقة وضمن الوقت المعياري',
    description: 'يقيس سرعة ودقة التحليل الفضائي والتركيب البصري تحت ضغط الوقت.',
    iepGoal: 'تنمية مهارات التخطيط المكاني وحل المشكلات البصرية المعقدة بسرعة ودقة.',
  },
  {
    id: 11,
    domainId: 'vsi',
    subtest: 'الألغاز البصرية البسيطة (Visual Puzzles - Basic)',
    title: 'اختيار 3 قطع هندسية من بين عدة خيارات لإكمال صورة كلية متكاملة ذهنياً',
    description: 'يقيس الإدراك البصري التركيبي والقدرة على دمج الأشكال ذهنياً دون لمسها.',
    iepGoal: 'تطوير التخيل البصري التركيبي وإدراك العلاقات بين الأجزاء والكل الهندسي.',
  },
  {
    id: 12,
    domainId: 'vsi',
    subtest: 'الألغاز البصرية المتقدمة (Visual Puzzles - Advanced)',
    title: 'تدوير ودمج الأشكال الهندسية المعقدة ذهنياً لاختيار مكونات الشكل النهائي',
    description: 'يقيس التدوير الذهني (Mental Rotation) والتحليل الفضائي عالي المستوى.',
    iepGoal: 'تدريب الطالب على التدوير الذهني للأشكال واستنتاج الأنماط الهندسية المجردة.',
  },
  {
    id: 13,
    domainId: 'vsi',
    subtest: 'التماثل والإغلاق البصري (Visual Closure)',
    title: 'التعرف على الأشكال الناقصة وتحديد التفاصيل الأساسية المفقودة من الصور',
    description: 'يقيس الانتباه البصري للتفاصيل والإغلاق البصري التلقائي والملاحظة الدقيقة.',
    iepGoal: 'تنمية مهارة الإغلاق البصري والانتباه للتفاصيل الدقيقة في الرسوم والمخططات.',
  },
  {
    id: 14,
    domainId: 'vsi',
    subtest: 'التحليل الاتجاهي والمكاني (Spatial Orientation)',
    title: 'إدراك العلاقات المكانية والاتجاهات (فوق، تحت، يمين، يسار، عمق، زوايا) للأشكال',
    description: 'يقيس التوجه المكاني ودقة قراءة المخططات والخرائط والتناسق الهندسي.',
    iepGoal: 'تعزيز التوجه المكاني وإدراك الاتجاهات والزوايا والأبعاد في الأنشطة الأكاديمية.',
  },

  // 3. Fluid Reasoning Index (FRI) - 6 items
  {
    id: 15,
    domainId: 'fri',
    subtest: 'مصفوفات الأشكال (Matrix Reasoning)',
    title: 'استنتاج النمط المتسلسل في مصفوفة بصرية هندسية واختيار الشكل المكمل المناسب',
    description: 'يقيس التفكير المنطقي الاستقرائي وحل المشكلات البصرية المتسلسلة بدون لغة.',
    iepGoal: 'تنمية التفكير الاستقرائي واكتشاف القواعد الرياضية والمنطقية في الأنماط المتسلسلة.',
  },
  {
    id: 16,
    domainId: 'fri',
    subtest: 'المصفوفات المتقدمة (Complex Matrices)',
    title: 'حل مصفوفات أشكال ثنائية وثلاثية المتغيرات (تغير في اللون والشكل والموقع معاً)',
    description: 'يقيس القدرة على التعامل مع متغيرات متعددة واستنباط القواعد المجردة.',
    iepGoal: 'تدريب الطالب على التعامل مع مشكلات متعددة المتغيرات وتحليل الأنماط المركبة.',
  },
  {
    id: 17,
    domainId: 'fri',
    subtest: 'أوزان الأشكال والموازين (Figure Weights)',
    title: 'تحديد الشكل أو الوزن الذي يحقق التوازن في ميزان ذي كفتين باستخدام الاستدلال الكمي',
    description: 'يقيس التفكير الجبري والكمي الأولي والاستدلال المنطقي لمعادلات التوازن.',
    iepGoal: 'تطوير مفاهيم التساوي والتكافؤ الرياضي والاستدلال الجبري لحل المعادلات.',
  },
  {
    id: 18,
    domainId: 'fri',
    subtest: 'الموازين المتقدمة (Complex Balance)',
    title: 'حل مسائل توازن متعددة الخطوات ومقارنة علاقات التكافؤ بين عدة مجموعات من الأشكال',
    description: 'يقيس التفكير التماثلي والاستدلال الرياضي المجرد وحل المشكلات متعددة المراحل.',
    iepGoal: 'تعزيز مهارات التفكير القياسي وحل المسائل الحسابية التجريدية متعددة الخطوات.',
  },
  {
    id: 19,
    domainId: 'fri',
    subtest: 'الاستدلال الحسابي الشفهي (Arithmetic Reasoning)',
    title: 'حل مسائل رياضية لفظية وكمية ذهنياً دون استخدام الورقة والقلم وفي وقت محدد',
    description: 'يقيس العمليات الحسابية الذهنية، التركيز، وتطبيق المفاهيم الرياضية السريعة.',
    iepGoal: 'تحسين مهارات الحساب الذهني وحل المسائل اللفظية الرياضية باستقلالية وثقة.',
  },
  {
    id: 20,
    domainId: 'fri',
    subtest: 'استنتاج المفاهيم والتصنيف (Concept Formation)',
    title: 'تحديد القاعدة التي تجمع مجموعة من الرسوم أو الأعداد واستبعاد العنصر الشاذ',
    description: 'يقيس التفكير التصنيفي والاستنتاج المنطقي وتكوين الفرضيات واختبارها.',
    iepGoal: 'تدريب الطالب على صياغة الفرضيات المنطقية وتصنيف المعطيات واستبعاد العناصر الشاذة.',
  },

  // 4. Working Memory Index (WMI) - 6 items
  {
    id: 21,
    domainId: 'wmi',
    subtest: 'إعادة الأرقام للأمام (Digit Span Forward)',
    title: 'تكرار سلاسل رقمية منطوقة (من 3 إلى 8 أرقام) بنفس الترتيب الذي ذكره الفاحص',
    description: 'يقيس سعة الذاكرة السمعية المباشرة وقوة الانتباه اللفظي قصير المدى.',
    iepGoal: 'زيادة سعة الذاكرة السمعية المباشرة وتدريب الطالب على حفظ التعليمات المتسلسلة.',
  },
  {
    id: 22,
    domainId: 'wmi',
    subtest: 'إعادة الأرقام بالعكس (Digit Span Backward)',
    title: 'تكرار سلاسل رقمية منطوقة بالترتيب العكسي (من الأخير إلى الأول) ذهنياً',
    description: 'يقيس الذاكرة العاملة السمعية والقدرة على المعالجة والتحويل الذهني للمعلومات.',
    iepGoal: 'تطوير الذاكرة العاملة اللفظية وإجراء المعالجات الذهنية للمعلومات قبل الاستجابة.',
  },
  {
    id: 23,
    domainId: 'wmi',
    subtest: 'ترتيب الأرقام تصاعدياً (Digit Span Sequencing)',
    title: 'إعادة ترتيب سلسلة أرقام عشوائية مسموعة تصاعدياً من الأصغر إلى الأكبر ذهنياً',
    description: 'يقيس الذاكرة العاملة الديناميكية وإعادة تنظيم المعلومات المخزنة آنياً.',
    iepGoal: 'تحسين قدرة الطالب على إعادة ترتيب وتنظيم المعطيات المسموعة تصاعدياً ومنطقياً.',
  },
  {
    id: 24,
    domainId: 'wmi',
    subtest: 'مدى الصور والذاكرة البصرية (Picture Span)',
    title: 'التعرف على تسلسل صور لأشياء مختلفة عُرضت عليه لثوانٍ معدودة وإعادة ترتيبها',
    description: 'يقيس سعة الذاكرة البصرية العاملة والاحتفاظ بالتسلسل الصوري المكاني.',
    iepGoal: 'تنمية الذاكرة البصرية قصيرة المدى وتذكر التفاصيل المصورة والتسلسل البصري.',
  },
  {
    id: 25,
    domainId: 'wmi',
    subtest: 'ترتيب الحروف والأرقام (Letter-Number Sequencing)',
    title: 'سماع خليط من الحروف والأرقام ثم إعادة ترتيب الأرقام أولاً تصاعدياً ثم الحروف أبجدياً',
    description: 'يقيس المرونة المعرفية المتقدمة وتقسيم الانتباه وإعادة الهيكلة الذهنية المزدوجة.',
    iepGoal: 'تعزيز المرونة المعرفية والقدرة على فرز وتصنيف المعطيات السمعية المتداخلة.',
  },
  {
    id: 26,
    domainId: 'wmi',
    subtest: 'تتبع التعليمات المعقدة (Multi-step Memory)',
    title: 'الاحتفاظ بتعليمات مركبة من 3 خطوات وتنفيذها بدقة دون نسيان أو تشتت',
    description: 'يقيس كفاءة الذاكرة العاملة الوظيفية في مواقف التعلم الصفي والتطبيق العملي.',
    iepGoal: 'تدريب الطالب على استراتيجيات التسميع الذاتي وتجزئة التعليمات لتنفيذ المهام متعددة الخطوات.',
  },

  // 5. Processing Speed Index (PSI) - 6 items
  {
    id: 27,
    domainId: 'psi',
    subtest: 'الترميز ورموز الأشكال (Coding - Part A/B)',
    title: 'نسخ وربط رموز بصرية محددة بأشكال هندسية أو أرقام بأقصى سرعة ودقة خلال دقيقتين',
    description: 'يقيس السرعة الإدراكية الحركية، الذاكرة البصرية قصيرة المدى، والتعلم الترابطي.',
    iepGoal: 'زيادة السرعة الكتابية والإدراكية الحركية وتحسين التآزر البصري الحركي تحت ضغط الوقت.',
  },
  {
    id: 28,
    domainId: 'psi',
    subtest: 'البحث في الرموز (Symbol Search)',
    title: 'المسح البصري السريع لمجموعة رموز وتحديد وجود الرمز المستهدف من عدمه بدقة',
    description: 'يقيس سرعة المسح البصري والتمييز والسرعة في اتخاذ القرار الإدراكي.',
    iepGoal: 'تطوير مهارة المسح البصري المنظم وسرعة استخراج المعلومات المستهدفة من الصفحة.',
  },
  {
    id: 29,
    domainId: 'psi',
    subtest: 'الشطب والإلغاء البصري (Cancellation)',
    title: 'البحث السريع وشطب أشكال مستهدفة محددة بين أشكال مشتتة (منظمة وعشوائية)',
    description: 'يقيس الانتباه الانتقائي البصري، سرعة المعالجة، ومقاومة التشتت والمشتتات.',
    iepGoal: 'تحسين الانتباه البصري الانتقائي وتقليل التشتت أثناء أداء المهام الورقية السريعة.',
  },
  {
    id: 30,
    domainId: 'psi',
    subtest: 'السرعة الحركية اليدوية (Motor Speed & Fluency)',
    title: 'الطلاقة الحركية في إنجاز المهام الكتابية والتلوين والتوصيل السريع دون تردد',
    description: 'يقيس كفاءة الجهاز الحركي الدقيق والسرعة الإنجازية للمهام اليدوية الروتينية.',
    iepGoal: 'تنمية سرعة الكتابة والطلاقة اليدوية وتخفيف التوتر والتردد الحركي أثناء الكتابة.',
  },
  {
    id: 31,
    domainId: 'psi',
    subtest: 'زمن الرجع والاستجابة السريعة (Reaction Time)',
    title: 'الاستجابة الفورية السريعة للمثيرات والتعليمات الصفية دون تأخير أو بطء استجابة ملحوظ',
    description: 'يقيس سرعة الاستثارة العصبية وزمن المعالجة المركزية للمعلومات المسموعة والمرئية.',
    iepGoal: 'تقليص زمن الاستجابة للمثيرات الصفية وتعزيز اليقظة والانتباه التفاعلي السريع.',
  },
  {
    id: 32,
    domainId: 'psi',
    subtest: 'الدقة تحت ضغط الوقت (Accuracy vs Speed Balance)',
    title: 'الحفاظ على دقة الأداء وتجنب الأخطاء الاندفاعية عند العمل بالسرعة القصوى',
    description: 'يقيس التوازن بين السرعة والدقة والتحكم التنفيذي في الاستجابات السريعة.',
    iepGoal: 'مساعدة الطالب على تحقيق التوازن الأمثل بين سرعة الإنجاز وجودة ودقة المخرجات.',
  },
];

/**
 * دالة الحساب السيكومتري لمعامل الذكاء الكلي والمؤشرات الخمسة لمقياس WISC-V
 */
export function calculateWISC5Psychometrics(responses = {}) {
  let totalAnswered = 0;
  let totalRawScore = 0;

  const domainResults = WISC5_DOMAINS.map(dom => {
    const domItems = WISC5_ITEMS.filter(it => it.domainId === dom.id);
    const maxRaw = domItems.length * 3; // 0 to 3 scale
    let rawScore = 0;
    let answered = 0;

    domItems.forEach(it => {
      const val = responses[it.id];
      if (val !== undefined && val !== null && !isNaN(val)) {
        rawScore += Number(val);
        answered++;
      }
    });

    totalAnswered += answered;
    totalRawScore += rawScore;

    const percentage = maxRaw > 0 ? (rawScore / maxRaw) * 100 : 0;

    // Convert raw percentage to Scaled Score (Mean=10, SD=3, Range: 1 to 19)
    let scaledScore = Math.round(1 + (percentage / 100) * 18);
    if (scaledScore < 1) scaledScore = 1;
    if (scaledScore > 19) scaledScore = 19;

    // Convert Scaled Score to Index Composite Score (Mean=100, SD=15, Range: 45 to 155)
    let compositeScore = Math.round(100 + ((scaledScore - 10) / 3) * 15);
    if (compositeScore < 45) compositeScore = 45;
    if (compositeScore > 155) compositeScore = 155;

    // Percentile rank based on Composite Score
    let percentile = 50;
    if (compositeScore >= 130) percentile = 98;
    else if (compositeScore >= 120) percentile = 91;
    else if (compositeScore >= 110) percentile = 75;
    else if (compositeScore >= 100) percentile = 50;
    else if (compositeScore >= 90) percentile = 25;
    else if (compositeScore >= 85) percentile = 16;
    else if (compositeScore >= 80) percentile = 9;
    else if (compositeScore >= 70) percentile = 2;
    else percentile = 1;

    let level = 'متوسط (طبيعي)';
    let levelColor = '#059669';
    let isStrength = scaledScore >= 13;
    let isDeficit = scaledScore <= 7;

    if (compositeScore >= 130) {
      level = 'مرتفع جداً / موهبة وتفوق عقلي (Very Superior)';
      levelColor = '#1e3a8a';
    } else if (compositeScore >= 120) {
      level = 'فوق المتوسط / متفوق (Superior)';
      levelColor = '#2563eb';
    } else if (compositeScore >= 110) {
      level = 'متوسط مرتفع (High Average)';
      levelColor = '#0284c7';
    } else if (compositeScore >= 90) {
      level = 'متوسط طبيعي (Average)';
      levelColor = '#059669';
    } else if (compositeScore >= 80) {
      level = 'متوسط منخفض (Low Average)';
      levelColor = '#d97706';
    } else if (compositeScore >= 70) {
      level = 'حدّي / بطء تعلم (Borderline)';
      levelColor = '#ea580c';
    } else if (compositeScore >= 55) {
      level = 'قصور إدراكي خفيف (Mild Intellectual Disability)';
      levelColor = '#dc2626';
    } else {
      level = 'قصور إدراكي متوسط إلى شديد (Moderate/Severe)';
      levelColor = '#991b1b';
    }

    return {
      id: dom.id,
      code: dom.code,
      name: dom.name,
      nameEn: dom.nameEn,
      icon: dom.icon,
      color: dom.color,
      bgLight: dom.bgLight,
      borderColor: dom.borderColor,
      description: dom.description,
      itemsCount: domItems.length,
      answeredCount: answered,
      rawScore,
      maxRaw,
      percentage: Math.round(percentage),
      scaledScore,
      compositeScore,
      percentile,
      level,
      levelColor,
      isStrength,
      isDeficit,
    };
  });

  const sumScaledScores = domainResults.reduce((acc, d) => acc + d.scaledScore, 0);

  // Full Scale Intelligence Quotient (FSIQ): Mean sum of 5 indices = 50. SD of sum ≈ 6.5.
  // Formula: FSIQ = 100 + ((Sum - 50) / 6.5) * 15
  let fsiq = Math.round(100 + ((sumScaledScores - 50) / 6.5) * 15);
  if (fsiq < 40) fsiq = 40;
  if (fsiq > 160) fsiq = 160;

  // Overall Percentile
  let overallPercentile = 50;
  if (fsiq >= 130) overallPercentile = 99;
  else if (fsiq >= 125) overallPercentile = 95;
  else if (fsiq >= 120) overallPercentile = 91;
  else if (fsiq >= 110) overallPercentile = 75;
  else if (fsiq >= 100) overallPercentile = 50;
  else if (fsiq >= 90) overallPercentile = 25;
  else if (fsiq >= 85) overallPercentile = 16;
  else if (fsiq >= 80) overallPercentile = 9;
  else if (fsiq >= 75) overallPercentile = 5;
  else if (fsiq >= 70) overallPercentile = 2;
  else overallPercentile = 1;

  // Classification & Clinical Impression
  let classification = 'متوسط طبيعي (Average Ability)';
  let classificationEn = 'Average';
  let severityKey = 'average';
  let severityColor = '#059669';
  let clinicalImpression = '';
  let recommendations = '';

  if (fsiq >= 130) {
    classification = 'موهوب جداً / تفوق عقلي استثنائي (Extremely High / Gifted)';
    classificationEn = 'Very Superior / Gifted';
    severityKey = 'gifted';
    severityColor = '#1e3a8a';
    clinicalImpression = `أظهر المفحوص قدرات عقلية معرفية استثنائية تقع ضمن فئة الموهبة والتفوق العقلي (معامل ذكاء كلي: ${fsiq} برتبة مئينية ${overallPercentile}%). يتميز بقدرة عالية جداً على الاستدلال التجريدي والحل الابتكاري للمشكلات.`;
    recommendations = '1. إلحاق الطالب ببرامج رعاية الموهوبين والأنشطة الإثرائية المتقدمة.\n2. تقديم مشاريع تعلم قائمة على الاستقصاء والتفكير الإبداعي وحل المشكلات المفتوحة.\n3. توفير الإرشاد النفسي الأكاديمي لتعزيز التوافق والدافعية وتجنب الملل الصفي.';
  } else if (fsiq >= 120) {
    classification = 'فوق المتوسط / متفوق (Superior / Very High)';
    classificationEn = 'Superior';
    severityKey = 'superior';
    severityColor = '#2563eb';
    clinicalImpression = `أظهر المفحوص قدرات عقلية عامة متميزة تقع في فئة المتفوقين فوق المتوسط (معامل ذكاء كلي: ${fsiq} برتبة مئينية ${overallPercentile}%). يمتلك كفاءة معرفية متقدمة وقدرة سريعة على التعلم والاستيعاب.`;
    recommendations = '1. إدراج أنشطة إثرائية إضافية ومناهج متقدمة في مجالات تميزه.\n2. تشجيعه على المشاركة في المسابقات العلمية والمعرفية والمناظرات.\n3. تدريبه على مهارات القيادة والتعلم الذاتي والتفكير الناقد.';
  } else if (fsiq >= 110) {
    classification = 'متوسط مرتفع (High Average)';
    classificationEn = 'High Average';
    severityKey = 'high_average';
    severityColor = '#0284c7';
    clinicalImpression = `تقع القدرات العقلية العامة للمفحوص في نطاق المتوسط المرتفع (معامل ذكاء كلي: ${fsiq} برتبة مئينية ${overallPercentile}%). أداؤه المعرفي متناسق ويؤهله للنجاح الأكاديمي المتميز.`;
    recommendations = '1. الاستمرار في التعزيز الأكاديمي الإيجابي وتطوير استراتيجيات التعلم المنظم.\n2. دعم مهارات التفكير العليا والتحليل المنطقي في مختلف المواد الدراسية.';
  } else if (fsiq >= 90) {
    classification = 'متوسط طبيعي (Average Range)';
    classificationEn = 'Average';
    severityKey = 'average';
    severityColor = '#059669';
    clinicalImpression = `تقع القدرات المعرفية العامة للمفحوص ضمن النطاق الطبيعي المعتاد لأقرانه في نفس العمر الزمني (معامل ذكاء كلي: ${fsiq} برتبة مئينية ${overallPercentile}%). لا توجد مؤشرات على قصور عقلي عام.`;
    recommendations = '1. الاستمرار في بيئة التعليم العام مع تدعيم جوانب التميز المعرفي.\n2. استخدام استراتيجيات تدريس متنوعة تلبي نمط التعلم البصري أو اللفظي المفضل لدى الطالب.\n3. تعزيز الذاكرة العاملة وسرعة المعالجة من خلال الأنشطة التطبيقية المستمرة.';
  } else if (fsiq >= 80) {
    classification = 'متوسط منخفض (Low Average)';
    classificationEn = 'Low Average';
    severityKey = 'low_average';
    severityColor = '#d97706';
    clinicalImpression = `تقع القدرات المعرفية العامة للمفحوص في نطاق المتوسط المنخفض (معامل ذكاء كلي: ${fsiq} برتبة مئينية ${overallPercentile}%). قد يواجه بعض التحديات في سرعة استيعاب المفاهيم المعقدة أو الذاكرة العاملة.`;
    recommendations = '1. تقديم شروحات مبسطة ومجزأة للمفاهيم الصعبة مع استخدام الوسائل المحسوسة.\n2. إتاحة وقت إضافي لإنجاز المهام الاختبارية والواجبات المدرسية.\n3. متابعة أداء الطالب وتطبيق استراتيجيات التدخل المبكر لتجنب التأخر الأكاديمي.';
  } else if (fsiq >= 70) {
    classification = 'حدّي / بطء تعلم (Borderline Intellectual Functioning)';
    classificationEn = 'Borderline';
    severityKey = 'borderline';
    severityColor = '#ea580c';
    clinicalImpression = `أظهرت نتائج التقييم أداءً معرفياً يقع في النطاق الحدّي (بطء التعلم) (معامل ذكاء كلي: ${fsiq} برتبة مئينية ${overallPercentile}%). يتطلب الطالب دعماً تعليمياً مكيّفاً واستراتيجيات تدريس علاجية مستمرة.`;
    recommendations = '1. إلحاق الطالب ببرامج بطء التعلم والتعليم المساند وتكييف المناهج الدراسية.\n2. تصميم خطة تربوية فردية (IEP) تركز على المهارات الأكاديمية الأساسية والمفاهيم الوظيفية.\n3. استخدام استراتيجيات التعلم متعدد الحواس (VAKT) والتكرار المستمر لترسيخ المعلومات.\n4. مواءمة أساليب التقويم والامتحانات (وقت إضافي، تقليل عدد الأسئلة، إيضاح التعليمات).';
  } else if (fsiq >= 55) {
    classification = 'قصور فكري ومعرفي بسيط (Mild Intellectual Disability)';
    classificationEn = 'Mild ID';
    severityKey = 'mild_id';
    severityColor = '#dc2626';
    clinicalImpression = `تشير نتائج المقياس المقنن إلى وجود قصور معرفي وإدراكي بسيط دال إحصائياً (معامل ذكاء كلي: ${fsiq} برتبة مئينية ${overallPercentile}%). يستدعي هذا الملف النفسي التربوي تقديم خدمات التربية الخاصة المتكاملة.`;
    recommendations = '1. وضع خطة تربوية وتأهيلية فردية شاملة (Intensive IEP) بإشراف فريق التربية الخاصة متعدد التخصصات.\n2. التركيز على المهارات المعرفية الوظيفية الحياتية، والتواصل، والسلوك التكيفي والاستقلالية.\n3. التدريب المستمر على مهارات الحياة اليومية بالتعاون الوثيق مع الأسرة.\n4. تقييم السلوك التكيفي (مثل مقياس فينلاند) لتحديد احتياجات الدعم البيئي بدقة.';
  } else {
    classification = 'قصور فكري ومعرفي متوسط إلى شديد (Moderate to Severe Intellectual Disability)';
    classificationEn = 'Moderate/Severe ID';
    severityKey = 'severe_id';
    severityColor = '#991b1b';
    clinicalImpression = `تشير نتائج التقييم إلى قصور معرفي وإدراكي جوهري شديد (معامل ذكاء كلي: ${fsiq}). يتطلب الطالب برنامجاً تأهيلياً وتربوياً مكثفاً يركز على الرعاية الذاتية والتواصل والسلوك التكيفي.`;
    recommendations = '1. تصميم خطة تأهيلية وسلوكية فردية مكثفة تركز على مهارات الاستقلالية والرعاية الذاتية.\n2. تدريب الطالب على مهارات التواصل الوظيفي والتفاعل الاجتماعي البسيط.\n3. تقديم الدعم والإرشاد الأسري المستمر وتكييف البيئة المنزلية لتوفير الأمان والتحفيز.';
  }

  const deficitDomains = domainResults.filter(d => d.isDeficit);
  const strengthDomains = domainResults.filter(d => d.isStrength);

  return {
    totalAnswered,
    answeredCount: totalAnswered,
    totalItems: WISC5_ITEMS.length,
    completionPercentage: Math.round((totalAnswered / WISC5_ITEMS.length) * 100),
    totalRawScore,
    sumScaledScores,
    fsiq,
    overallPercentile,
    classification,
    classificationEn,
    severityKey,
    severityColor,
    clinicalImpression,
    recommendations,
    domainResults,
    dimensionsResults: domainResults,
    dimensions: domainResults,
    deficitDomains,
    strengthDomains,
  };
}
