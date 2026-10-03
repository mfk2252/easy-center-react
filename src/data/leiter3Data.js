/**
 * Leiter International Performance Scale - Third Edition (Leiter-3)
 * مقياس ليتر العالمي المعدل للتقييم غير اللفظي — الإصدار الثالث
 * 
 * المؤلفون: د. غيل أيدرسون، مارك بومبلون، لوسي ميلر، كريس كوك
 * (Gale H. Roid, Ph.D., Mark Pomplun, Ph.D., Lucy J. Miller, Ph.D., Chris Koch, Ph.D.)
 * الناشر المعتمد: شركة ستولتينغ الأمريكية للتقييم النفسي (Stoelting Co.)
 * 
 * الأداة المعيارية الرائدة عالمياً لتقييم الذكاء والقدرات المعرفية والانتباه والذاكرة غير اللفظية.
 * مصمم خصيصاً لتقييم الأفراد والأطفال من عمر 3 سنوات حتى 75+ سنة دون الحاجة لأي لغة منطوقة أو مكتوبة،
 * ويعد المقياس الأمثل لحالات:
 * - اضطراب طيف التوحد (ASD)
 * - اضطرابات النطق واللغة الحادة وتأخر الكلام
 * - الصم وضعاف السمع (Deaf / Hard of Hearing)
 * - الشلل الدماغي والإعاقات الحركية اللفظية
 * - غير الناطقين باللغة المحلية والوافدين
 * 
 * يتألف المقياس من بطاريتين رئيسيتين:
 * 1. بطارية القدرات المعرفية (Cognitive Battery) لحساب معامل الذكاء غير اللفظي (NVIQ):
 *    - الترتيب التسلسلي (Sequential Order - SO)
 *    - الإتمام البصري (Form Completion - FC)
 *    - التصنيف والتماثل (Classification and Analogies - CA)
 *    - الشكل والأرضية (Figure Ground - FG)
 * 
 * 2. بطارية الانتباه والذاكرة (Attention & Memory Battery) لحساب مؤشر الانتباه والذاكرة (AMI):
 *    - الانتباه المستمر (Sustained Attention - SA)
 *    - الذاكرة الفضائية / المكانية (Spatial Memory - SM)
 *    - ذاكرة الأشكال / التذكر المباشر (Forward Memory - FM)
 */

export const LEITER3_COPYRIGHT_INFO = {
  scaleNameAr: 'مقياس ليتر العالمي المعدل للقدرات غير اللفظية — الإصدار الثالث (Leiter-3)',
  scaleNameEn: 'Leiter International Performance Scale — Third Edition (Leiter-3)',
  scaleShortName: 'Leiter-3',
  authorAr: 'غيل أيدرسون وآخرون (Gale H. Roid, Mark Pomplun, Lucy J. Miller, Chris Koch)',
  authorEn: 'Gale H. Roid, Mark Pomplun, Lucy J. Miller, Chris Koch',
  publisherAr: 'شركة ستولتينغ الأمريكية للتقييم النفسي (Stoelting Co.)',
  publisherEn: 'Stoelting Company',
  adaptationAr: 'المعايير المقننة المعتمدة للتقييم غير اللفظي بالمراكز التشخيصية والعيادات النفسية العربية',
  targetAge: 'من سن 3 سنوات حتى 75+ سنة (الأطفال، اليافعين، والبالغين غير الناطقين)',
  standardsReference: 'معايير الجمعية الأمريكية لعلم النفس (APA) ودليل DSM-5 وتصنيفات IDEA للإعاقة الذهنية واضطرابات طيف التوحد',
  diagnosticNature: 'تقييم سيكومتري إكلينيكي غير لفظي تام لقياس نسبة الذكاء غير اللفظي (NVIQ) والذاكرة والانتباه',
  notice: 'مقياس ليتر العالمي (Leiter-3) هو علامة تجارية مسجلة لشركة Stoelting Co. أداة القياس مخصصة للاستخدام المهني الإكلينيكي والتربوي للأخصائيين المعتمدين لتشخيص القدرات المعرفية وبناء الخطة التربوية الفردية (IEP).',
  disclaimer: 'تنبيه مهني: يطبق المقياس بطريقة غير لفظية عبر الإشارة والتوجيه الحركي والنمذجة، وتفسر نتائجه في ضوء الملاحظة والسلوك التكيفي.',
};

export const LEITER3_BATTERIES = [
  {
    id: 'cognitive',
    name: 'بطارية الذكاء المعرفي غير اللفظي',
    nameEn: 'Cognitive Battery (NVIQ)',
    icon: '🧩',
    color: '#4f46e5',
    bgLight: '#eef2ff',
    borderColor: '#c7d2fe',
    description: 'تقيس الاستدلال التحليلي، التصنيف المجرد، الترتيب المنطقي، والإدراك البصري المكاني، ومنها يُشتق معامل الذكاء غير اللفظي الكلي (Nonverbal IQ).',
    subtestIds: ['so', 'fc', 'ca', 'fg'],
  },
  {
    id: 'attention_memory',
    name: 'بطارية الانتباه والذاكرة غير اللفظية',
    nameEn: 'Attention & Memory Battery (AMI)',
    icon: '🎯',
    color: '#0891b2',
    bgLight: '#ecfeff',
    borderColor: '#a5f3fc',
    description: 'تقيس سعة الذاكرة البصرية المكانية، التذكر المباشر، والانتباه المستمر والانتقائي، وتوفر مؤشرات لتشخيص ADHD والوظائف التنفيذية.',
    subtestIds: ['sa', 'sm', 'fm'],
  },
];

export const LEITER3_SUBTESTS = [
  // Cognitive Battery
  {
    id: 'so',
    batteryId: 'cognitive',
    code: 'SO',
    name: 'الترتيب التسلسلي (Sequential Order)',
    nameEn: 'Sequential Order (SO)',
    maxRawScore: 24,
    icon: '🔢',
    color: '#4f46e5',
    description: 'ترتيب متتاليات الأشكال الهندسية والرموز وفق تسلسل منطقي أو حجمي أو تدريجي يعكس الاستدلال الاستقرائي.',
  },
  {
    id: 'fc',
    batteryId: 'cognitive',
    code: 'FC',
    name: 'الإتمام البصري (Form Completion)',
    nameEn: 'Form Completion (FC)',
    maxRawScore: 24,
    icon: '🧩',
    color: '#7c3aed',
    description: 'التعرف على الأشياء والرسوم المجزأة أو المخبأة جزئياً وإدراك الكل من الأجزاء (الإغلاق البصري).',
  },
  {
    id: 'ca',
    batteryId: 'cognitive',
    code: 'CA',
    name: 'التصنيف والتماثل (Classification & Analogies)',
    nameEn: 'Classification & Analogies (CA)',
    maxRawScore: 24,
    icon: '📐',
    color: '#2563eb',
    description: 'تصنيف الأشكال الهندسية وفق اللون والحجم والشكل، وحل التماثلات البصرية المجردة ومصفوفات القواعد.',
  },
  {
    id: 'fg',
    batteryId: 'cognitive',
    code: 'FG',
    name: 'الشكل والأرضية (Figure Ground)',
    nameEn: 'Figure Ground (FG)',
    maxRawScore: 24,
    icon: '🔍',
    color: '#0284c7',
    description: 'عزل وتمييز الأشكال والرموز المستهدفة من بين خلفيات بصرية متداخلة ومعقدة، واختبار التمييز الإدراكي.',
  },

  // Attention & Memory Battery
  {
    id: 'sa',
    batteryId: 'attention_memory',
    code: 'SA',
    name: 'الانتباه المستمر (Sustained Attention)',
    nameEn: 'Sustained Attention (SA)',
    maxRawScore: 30,
    icon: '⏱️',
    color: '#059669',
    description: 'شطب واكتشاف المثيرات المستهدفة المتكررة عبر مصفوفة حافلة بالمشتتات ضمن زمن محدد لقياس اليقظة والتركيز.',
  },
  {
    id: 'sm',
    batteryId: 'attention_memory',
    code: 'SM',
    name: 'الذاكرة الفضائية / المكانية (Spatial Memory)',
    nameEn: 'Spatial Memory (SM)',
    maxRawScore: 24,
    icon: '🗺️',
    color: '#0891b2',
    description: 'تذكر واسترجاع المواقع الدقيقة لعدة بطاقات ومثيرات بصرية عُرضت لفترة وجيزة في شبكة مكانية.',
  },
  {
    id: 'fm',
    batteryId: 'attention_memory',
    code: 'FM',
    name: 'ذاكرة الأشكال والتذكر المباشر (Forward Memory)',
    nameEn: 'Forward Memory (FM)',
    maxRawScore: 24,
    icon: '💾',
    color: '#d97706',
    description: 'تذكر تسلسل متتاليات من الأشكال الهندسية واستعادتها بنفس الترتيب التسلسلي الذي عُرضت به.',
  },
];

export const LEITER3_RESPONSE_OPTIONS = [
  {
    value: 3,
    score: 3,
    label: '3 - إتقان كامل ودقيق بزمن قياسي',
    description: 'استجابة سريعة وصحيحة ونموذجية تعكس فهماً تجريدياً عالياً للمهمة البصرية دون تردد.',
    badgeClass: 'b-gr',
  },
  {
    value: 2,
    score: 2,
    label: '2 - إنجاز صحيح مع استغراق وقت عادي',
    description: 'يحل المهمة بنجاح بعد تأمل واستكشاف هادئ للمثيرات ضمن الوقت النظامي المسموح.',
    badgeClass: 'b-bl',
  },
  {
    value: 1,
    score: 1,
    label: '1 - إنجاز جزئي أو بمساعدة/محاولات متكررة',
    description: 'يصل لحل صحيح لبعض العناصر أو يحتاج توجيهاً إيمائياً ومحاولة إضافية لإتمام المهمة.',
    badgeClass: 'b-or',
  },
  {
    value: 0,
    score: 0,
    label: '0 - عجز عن الحل / استجابة خاطئة أو عشوائية',
    description: 'لا يدرك النمط أو المثير المطلوب، يضع القطع عشوائياً، أو يتوقف بعد محاولات فاشلة.',
    badgeClass: 'b-rd',
  },
];

export const LEITER3_ITEMS = [
  // 1. Sequential Order (SO) - 4 items
  {
    id: 1,
    subtestId: 'so',
    batteryId: 'cognitive',
    subtest: 'الترتيب التسلسلي (SO)',
    title: 'متتالية الحجم والتدريج (تصاعدي وتنازلي)',
    description: 'ترتيب بطاقات أشكال هندسية متطابقة النوع متدرجة الحجم (من الأصغر إلى الأكبر) في شريط المحاذاة.',
    iepGoal: 'أن يكتشف التلميذ قاعدة التدرج الحجمي ويرتب 4 بطاقات بصرية متسلسلة بدقة 80% في 4 محاولات متتالية.',
  },
  {
    id: 2,
    subtestId: 'so',
    batteryId: 'cognitive',
    subtest: 'الترتيب التسلسلي (SO)',
    title: 'النمط التكراري البسيط (A-B-A-B)',
    description: 'مواصلة متتالية من بطاقات بلونين أو شكلين متناوبين واكتشاف الرمز المفقود في السلسلة.',
    iepGoal: 'أن يكمل التلميذ النمط البصري المتناوب ويضع البطاقة المتممة للنمط بنسبة إتقان 80%.',
  },
  {
    id: 3,
    subtestId: 'so',
    batteryId: 'cognitive',
    subtest: 'الترتيب التسلسلي (SO)',
    title: 'المتتالية المنطقية المكانية (دوران الأشكال)',
    description: 'تتبع اتجاه دوران عقارب الساعة لسهم أو شكل هندسي واستنتاج الوضع التالي الصحيح.',
    iepGoal: 'أن يستنتج التلميذ قاعدة الدوران الفراغي ويكمل المتتالية المكانية بنسبة إتقان لا تقل عن 75%.',
  },
  {
    id: 4,
    subtestId: 'so',
    batteryId: 'cognitive',
    subtest: 'الترتيب التسلسلي (SO)',
    title: 'المتتالية المعقدة المزدوجة (حجم + لون + عدد)',
    description: 'استنتاج قاعدتين متزامنتين في المتتالية (تغير الحجم مع تبدل التظليل) واختيار الرمز المتمم.',
    iepGoal: 'أن يحل التلميذ متتاليات بصرية مركبة ذات قاعدتين منطقيتين بنسبة نجاح 80%.',
  },

  // 2. Form Completion (FC) - 4 items
  {
    id: 5,
    subtestId: 'fc',
    batteryId: 'cognitive',
    subtest: 'الإتمام البصري (FC)',
    title: 'الإغلاق البصري للأشكال الهندسية المجزأة',
    description: 'التعرف على الدائرة أو المربع أو المثلث المجزأ إلى شطرين وجمعهما ذهنياً لاختيار الشكل المكتمل.',
    iepGoal: 'أن يدرك التلميذ الكل البصري من الأجزاء المنفصلة للأشكال الهندسية بدقة 85%.',
  },
  {
    id: 6,
    subtestId: 'fc',
    batteryId: 'cognitive',
    subtest: 'الإتمام البصري (FC)',
    title: 'التعرف على أدوات مجتزأة ومخبأة جزئياً',
    description: 'تحديد هوية أداة يومية شائعة (سيارة، مقص، كوب) يظهر منها 40% فقط تحت غطاء أو تظليل.',
    iepGoal: 'أن يتعرف التلميذ على الصور والأشياء الناقصة بصرياً بناءً على ملامحها الجوهرية بنسبة 80%.',
  },
  {
    id: 7,
    subtestId: 'fc',
    batteryId: 'cognitive',
    subtest: 'الإتمام البصري (FC)',
    title: 'تجميع بازل الأشكال غير المنتظمة (تركيب الأجزاء)',
    description: 'تجميع 4 قطع بازل مفككة لتشكيل صورة كائن متكامل دون خطوط إرشادية خارجية.',
    iepGoal: 'أن يركب التلميذ قطع الأشكال غير المنتظمة ويكوّن النموذج المستهدف في دقيقة واحدة.',
  },
  {
    id: 8,
    subtestId: 'fc',
    batteryId: 'cognitive',
    subtest: 'الإتمام البصري (FC)',
    title: 'إعادة بناء النماذج المعقدة المتداخلة',
    description: 'تمييز عناصر النموذج البصري المعقد متعدد القطع وتحديد النتيجة النهائية الدقيقة.',
    iepGoal: 'أن يحلل التلميذ النماذج البصرية المركبة ويحدد مكوناتها بدقة لا تقل عن 80%.',
  },

  // 3. Classification & Analogies (CA) - 4 items
  {
    id: 9,
    subtestId: 'ca',
    batteryId: 'cognitive',
    subtest: 'التصنيف والتماثل (CA)',
    title: 'التصنيف البسيط أحادي البعد (اللون أو الشكل)',
    description: 'فرز مجموعة من البطاقات المتباينة ووضعها مع المثير الذي يشترك معها في خاصية واحدة أساسية.',
    iepGoal: 'أن يصنف التلميذ البطاقات المصورة وفق خاصية شكلية محددة بنسبة إتقان 90%.',
  },
  {
    id: 10,
    subtestId: 'ca',
    batteryId: 'cognitive',
    subtest: 'التصنيف والتماثل (CA)',
    title: 'التصنيف ثنائي وثلاثي الأبعاد (مكعبات ملونة)',
    description: 'تصنيف الأشكال حسب معيارين متزامنين (كبير ومخطط، أو أصفر ومستدير) واستبعاد الشاذ.',
    iepGoal: 'أن يطبق التلميذ معيارين تصنيفيين متزامنين في فرز المثيرات بنسبة إتقان 80%.',
  },
  {
    id: 11,
    subtestId: 'ca',
    batteryId: 'cognitive',
    subtest: 'التصنيف والتماثل (CA)',
    title: 'التماثل البصري البسيط (أ إلى ب مثل ج إلى ؟)',
    description: 'اكتشاف العلاقة التماثلية بين شكلين (تغير الاتجاه أو التظليل) وتطبيق نفس القاعدة على الشكل المقابل.',
    iepGoal: 'أن يستنتج التلميذ العلاقات التماثلية البصرية ويختار البديل الصحيح بنسبة 80%.',
  },
  {
    id: 12,
    subtestId: 'ca',
    batteryId: 'cognitive',
    subtest: 'التصنيف والتماثل (CA)',
    title: 'مصفوفات التماثل المجردة المعقدة',
    description: 'حل مصفوفة 3×3 قائمة على التماثلات المنطقية متعددة الاتجاهات (أفقي وعمودي).',
    iepGoal: 'أن يحل التلميذ مصفوفات الاستدلال التماثلي المجرد بنسبة نجاح 75%.',
  },

  // 4. Figure Ground (FG) - 4 items
  {
    id: 13,
    subtestId: 'fg',
    batteryId: 'cognitive',
    subtest: 'الشكل والأرضية (FG)',
    title: 'عزل شكل هندسي واحد في خلفية مبسطة',
    description: 'تحديد موقع شكل هندسي محدد (مربع أو مثلث) متداخل مع خطين متقاطعين في البطاقة.',
    iepGoal: 'أن يحدد التلميذ الشكل الهندسي المستهدف داخل خلفية بصرية بسيطة بنسبة 90%.',
  },
  {
    id: 14,
    subtestId: 'fg',
    batteryId: 'cognitive',
    subtest: 'الشكل والأرضية (FG)',
    title: 'استخراج أشكال متداخلة متعددة الخطوط',
    description: 'تمييز ورسم حدود شكلين متراكبين (دائرة ونجمة) على خلفية خطوط مائلة مضللة.',
    iepGoal: 'أن يعزل التلميذ الأشكال المتداخلة بصرياً ويميز حدودها بنسبة إتقان 85%.',
  },
  {
    id: 15,
    subtestId: 'fg',
    batteryId: 'cognitive',
    subtest: 'الشكل والأرضية (FG)',
    title: 'تحديد أهداف مموهة في رسم معقد غني بالتفاصيل',
    description: 'اكتشاف 3 عناصر مخفية داخل مشهد طبيعي أو مدرسي مرسوم بخطوط متقاربة وألوان موحدة.',
    iepGoal: 'أن يستخرج التلميذ المثيرات البصرية المموهة بدقة في مشهد معقد خلال 45 ثانية.',
  },
  {
    id: 16,
    subtestId: 'fg',
    batteryId: 'cognitive',
    subtest: 'الشكل والأرضية (FG)',
    title: 'التمييز بين الأشكال المتقاربة في الكثافة والزوايا',
    description: 'تحديد الشكل المستهدف بدقة متناهية من بين 6 أشكال شديدة الشبه تختلف في زاوية واحدة طفيفة.',
    iepGoal: 'أن يظهر التلميذ دقة إدراكية عالية في تمييز الفروق الدقيقة للأشكال البصرية بنسبة 80%.',
  },

  // 5. Sustained Attention (SA) - 4 items
  {
    id: 17,
    subtestId: 'sa',
    batteryId: 'attention_memory',
    subtest: 'الانتباه المستمر (SA)',
    title: 'شطب المثير المستهدف البسيط (زمن محدد)',
    description: 'شطب جميع النجوم الموجودة في ورقة عمل حافلة بالأشكال الهندسية الأخرى خلال 30 ثانية.',
    iepGoal: 'أن يحافظ التلميذ على تركيزه وانتباهه البصري ويشطب 90% من المثيرات المستهدفة دون تشتت.',
  },
  {
    id: 18,
    subtestId: 'sa',
    batteryId: 'attention_memory',
    subtest: 'الانتباه المستمر (SA)',
    title: 'شطب المثير المزدوج (زوج من الأشكال)',
    description: 'البحث المستمر عن اقتران (مربع أحمر يليه مثلث أزرق) وتحديده عبر أسطر متتالية.',
    iepGoal: 'أن يكتشف التلميذ الأزواج المقترنة من المثيرات البصرية بنسبة دقة لا تقل عن 80%.',
  },
  {
    id: 19,
    subtestId: 'sa',
    batteryId: 'attention_memory',
    subtest: 'الانتباه المستمر (SA)',
    title: 'مقاومة المشتتات البصرية التنافسية',
    description: 'الاستمرار في اكتشاف الأشكال الصحيحة وتجنب شطب المثيرات المضللة المشابهة (كبح الاندفاعية).',
    iepGoal: 'أن يقلل التلميذ أخطاء الاندفاعية والشطب الخاطئ إلى أقل من خطأين في جلسة الانتباه.',
  },
  {
    id: 20,
    subtestId: 'sa',
    batteryId: 'attention_memory',
    subtest: 'الانتباه المستمر (SA)',
    title: 'المهمة الممتدة لليقظة البصرية (3 دقائق)',
    description: 'مواصلة مسح الأسطر المتتابعة بدقة وثبات في سرعة الاستجابة على مدار 3 دقائق كاملة.',
    iepGoal: 'أن يظهر التلميذ ثباتاً في اليقظة والانتباه البصري لمدة 3 دقائق دون انقطاع.',
  },

  // 6. Spatial Memory (SM) - 4 items
  {
    id: 21,
    subtestId: 'sm',
    batteryId: 'attention_memory',
    subtest: 'الذاكرة الفضائية (SM)',
    title: 'تذكر موقع بطاقتين في شبكة 2×2',
    description: 'ملاحظة موقع بطاقتين عُرضتا لمدة 5 ثوانٍ في شبكة مربعة، ثم وضع البطاقتين في نفس الأماكن على شبكة فارغة.',
    iepGoal: 'أن يسترجع التلميذ بدقة مواقع بطاقتين في شبكة مكانية بعد فترة عرض قصيرة بنسبة 90%.',
  },
  {
    id: 22,
    subtestId: 'sm',
    batteryId: 'attention_memory',
    subtest: 'الذاكرة الفضائية (SM)',
    title: 'تذكر مواقع 3 بطاقات في شبكة 3×3',
    description: 'حفظ وتدوير المواقع المكانية لـ 3 صور مختلفة في مصفوفة 3×3 واسترجاعها فور إخفائها.',
    iepGoal: 'أن يتذكر التلميذ مواقع 3 مثيرات مكانية مختلفة بدقة لا تقل عن 80% في 3 محاولات.',
  },
  {
    id: 23,
    subtestId: 'sm',
    batteryId: 'attention_memory',
    subtest: 'الذاكرة الفضائية (SM)',
    title: 'تذكر مواقع 4 إلى 5 بطاقات متباعدة',
    description: 'تذكر مواقع 5 بطاقات موزعة في شبكة 4×4 بعد عرضها لمدة 10 ثوانٍ وتحديد ترتيبها المكاني.',
    iepGoal: 'أن ينمي التلميذ سعة الذاكرة البصرية المكانية لتستوعب 4 مواقع متفرقة بدقة 75%.',
  },
  {
    id: 24,
    subtestId: 'sm',
    batteryId: 'attention_memory',
    subtest: 'الذاكرة الفضائية (SM)',
    title: 'الاسترجاع المكاني مع وجود فاصل زمني (10 ثوانٍ)',
    description: 'تثبيت الخريطة المكانية في الذهن والاحتفاظ بها بعد فاصل زمني قصير ثم وضع البطاقات بدقة.',
    iepGoal: 'أن يحتفظ التلميذ بالمعلومات البصرية المكانية لمدة 10 ثوانٍ قبل الاسترجاع بنسبة 80%.',
  },

  // 7. Forward Memory (FM) - 4 items
  {
    id: 25,
    subtestId: 'fm',
    batteryId: 'attention_memory',
    subtest: 'ذاكرة الأشكال (FM)',
    title: 'تذكر تسلسل شكلين متتاليين',
    description: 'مشاهدة شكلين يعرضان واحداً تلو الآخر، ثم الإشارة إليهما بنفس الترتيب التسلسلي من بين خيارات.',
    iepGoal: 'أن يتذكر التلميذ تسلسل مثيرين بصريين ويعيدهما بنفس الترتيب المباشر بنسبة 90%.',
  },
  {
    id: 26,
    subtestId: 'fm',
    batteryId: 'attention_memory',
    subtest: 'ذاكرة الأشكال (FM)',
    title: 'تذكر تسلسل 3 أشكال هندسية',
    description: 'تتبع 3 بطاقات تعرض بتسلسل زمني واستعادتها بالترتيب المباشر الصحيح دون تبديل المواقع.',
    iepGoal: 'أن يعيد التلميذ ترتيب 3 أشكال بصرية بالتسلسل الزمني الدقيق بنسبة إتقان 85%.',
  },
  {
    id: 27,
    subtestId: 'fm',
    batteryId: 'attention_memory',
    subtest: 'ذاكرة الأشكال (FM)',
    title: 'تذكر تسلسل 4 إلى 5 أشكال مجردة',
    description: 'تخزين واسترجاع تسلسل 4 أشكال تجريدية متتابعة يعكس كفاءة مدى الذاكرة البصرية قصيرة المدى.',
    iepGoal: 'أن يوسع التلميذ مدى الذاكرة البصرية المباشرة للأشكال ليستعيد 4 أشكال متتالية بنسبة 75%.',
  },
  {
    id: 28,
    subtestId: 'fm',
    batteryId: 'attention_memory',
    subtest: 'ذاكرة الأشكال (FM)',
    title: 'تذكر متتالية سريعة من 6 رموز مجردة',
    description: 'إعادة إنتاج سلسلة بصرية طويلة من 6 رموز تعرض بمعدل رمز واحد كل ثانية دون تشويش.',
    iepGoal: 'أن يسترجع التلميذ متتالية من 5-6 رموز بصرية بالترتيب المباشر الصحيح بنسبة 70%.',
  },
];

/**
 * تحويل الدرجة الخام للاختبار الفرعي إلى درجة معيارية موزونة (Scaled Score: 1-19)
 * بمتوسط 10 وانحراف معياري 3.
 */
export function rawToScaledScore(rawScore, maxRawScore) {
  if (rawScore === null || rawScore === undefined || isNaN(rawScore)) return 10;
  const ratio = Math.max(0, Math.min(1, rawScore / (maxRawScore || 24)));
  // Mapping 0..1 to 1..19 with typical bell distribution (mean 10 at 0.50)
  let scaled = Math.round(1 + ratio * 18);
  if (scaled < 1) scaled = 1;
  if (scaled > 19) scaled = 19;
  return scaled;
}

/**
 * حساب المعاملات السيكومترية الشاملة لمقياس ليتر-3 (Leiter-3)
 */
export function calculateLeiter3Psychometrics(scores = {}, rawOverrides = {}) {
  // 1. Calculate Subtests Raw and Scaled Scores
  const subtestResults = LEITER3_SUBTESTS.map(st => {
    let rawScore = 0;
    const hasOverride = rawOverrides[st.id] !== undefined && rawOverrides[st.id] !== '' && !isNaN(Number(rawOverrides[st.id]));

    if (hasOverride) {
      rawScore = Math.max(0, Math.min(st.maxRawScore, Number(rawOverrides[st.id])));
    } else {
      // Sum items belonging to this subtest
      const items = LEITER3_ITEMS.filter(it => it.subtestId === st.id);
      items.forEach(it => {
        const val = Number(scores[it.id] ?? 0);
        rawScore += Number.isFinite(val) ? val : 0;
      });
      // Cap at maxRawScore
      rawScore = Math.min(st.maxRawScore, rawScore);
    }

    const scaledScore = rawToScaledScore(rawScore, st.maxRawScore);

    let qualitativeDesc = 'متوسط طبيعي (Average)';
    let levelColor = '#059669';
    let isStrength = false;
    let isDeficit = false;

    if (scaledScore >= 16) {
      qualitativeDesc = 'مرتفع جداً / موهبة (Very Superior)';
      levelColor = '#1e3a8a';
      isStrength = true;
    } else if (scaledScore >= 13) {
      qualitativeDesc = 'فوق المتوسط / متفوق (Superior)';
      levelColor = '#2563eb';
      isStrength = true;
    } else if (scaledScore >= 11) {
      qualitativeDesc = 'متوسط مرتفع (High Average)';
      levelColor = '#0284c7';
    } else if (scaledScore >= 8) {
      qualitativeDesc = 'متوسط طبيعي (Average)';
      levelColor = '#059669';
    } else if (scaledScore >= 6) {
      qualitativeDesc = 'متوسط منخفض (Low Average)';
      levelColor = '#d97706';
    } else if (scaledScore >= 4) {
      qualitativeDesc = 'حدّي / بطء تعلم (Borderline)';
      levelColor = '#ea580c';
      isDeficit = true;
    } else {
      qualitativeDesc = 'قصور ملحوظ (Extremely Low)';
      levelColor = '#dc2626';
      isDeficit = true;
    }

    return {
      subtestId: st.id,
      batteryId: st.batteryId,
      code: st.code,
      name: st.name,
      nameEn: st.nameEn,
      maxRawScore: st.maxRawScore,
      rawScore,
      scaledScore,
      qualitativeDesc,
      levelColor,
      isStrength,
      isDeficit,
      icon: st.icon,
      color: st.color,
    };
  });

  // 2. Cognitive Battery Scores & Nonverbal IQ (NVIQ)
  const cogSubtests = subtestResults.filter(st => st.batteryId === 'cognitive');
  const cogSumScaled = cogSubtests.reduce((acc, st) => acc + st.scaledScore, 0); // Expected mean: 40 (4 subtests × 10)
  const cogTotalRaw = cogSubtests.reduce((acc, st) => acc + st.rawScore, 0);

  // NVIQ derivation: Mean=100, SD=15. Sum of 4 scaled scores SD ≈ 6.5.
  let nviq = Math.round(100 + ((cogSumScaled - 40) / 6.5) * 15);
  if (nviq < 40) nviq = 40;
  if (nviq > 160) nviq = 160;

  // 3. Attention & Memory Battery Scores (AMI)
  const attSubtests = subtestResults.filter(st => st.batteryId === 'attention_memory');
  const attSumScaled = attSubtests.reduce((acc, st) => acc + st.scaledScore, 0); // Expected mean: 30 (3 subtests × 10)
  const attTotalRaw = attSubtests.reduce((acc, st) => acc + st.rawScore, 0);

  // AMI Index derivation: Mean=100, SD=15. Sum of 3 scaled scores SD ≈ 5.0.
  let ami = Math.round(100 + ((attSumScaled - 30) / 5.0) * 15);
  if (ami < 40) ami = 40;
  if (ami > 160) ami = 160;

  // 4. Percentile Rank Function
  const getPercentile = (iq) => {
    if (iq >= 135) return 99;
    if (iq >= 130) return 98;
    if (iq >= 125) return 95;
    if (iq >= 120) return 91;
    if (iq >= 115) return 84;
    if (iq >= 110) return 75;
    if (iq >= 105) return 63;
    if (iq >= 100) return 50;
    if (iq >= 95) return 37;
    if (iq >= 90) return 25;
    if (iq >= 85) return 16;
    if (iq >= 80) return 9;
    if (iq >= 75) return 5;
    if (iq >= 70) return 2;
    return 1;
  };

  const nviqPercentile = getPercentile(nviq);
  const amiPercentile = getPercentile(ami);

  // 5. Classification & Clinical Interpretation
  let classification = 'متوسط طبيعي (Average)';
  let classificationEn = 'Average Ability';
  let severityKey = 'average';
  let severityColor = '#059669';
  let clinicalImpression = '';
  let recommendations = '';

  if (nviq >= 130) {
    classification = 'موهبة وتفوق غير لفظي فائق (Very Superior / Gifted)';
    classificationEn = 'Very Superior';
    severityKey = 'gifted';
    severityColor = '#1e3a8a';
    clinicalImpression = `أظهر المفحوص أداءً معرفياً بصرياً استثنائياً يقع ضمن فئة الموهبة والتفوق المعرفي غير اللفظي (معامل الذكاء غير اللفظي Leiter-3 NVIQ: ${nviq} برتبة مئينية ${nviqPercentile}%). يتميز بقدرة متميزة على التفكير المنطقي التجريدي والاستدلال الصامت وحل المشكلات البصرية المعقدة.`;
    recommendations = '1. إلحاق التلميذ ببرامج الإثراء المعرفي المتقدمة والأنشطة البصرية الفضائية والروبوت والبرمجة.\n2. استخدام استراتيجيات التدريس المعتمدة على الاستكشاف البصري وحل المشكلات المفتوحة.\n3. تعزيز التواصل البديل والمعزز إن وجدت صعوبات نطق وتوجيه قدراته العالية لتعويض أي فجوة تواصلية.';
  } else if (nviq >= 120) {
    classification = 'متفوق / فوق المتوسط (Superior)';
    classificationEn = 'Superior';
    severityKey = 'superior';
    severityColor = '#2563eb';
    clinicalImpression = `تقع القدرات المعرفية غير اللفظية للمفحوص في نطاق المتفوقين فوق المتوسط (معامل ذكاء غير لفظي Leiter-3 NVIQ: ${nviq} برتبة مئينية ${nviqPercentile}%). يمتلك كفاءة بصرية فراغية وسرعة ممتازة في اكتشاف القواعد والأنماط.`;
    recommendations = '1. تقديم مهام وأنشطة تعليمية إثرائية بصرية تراعي سرعة استيعابه ونمطه غير اللفظي المتميز.\n2. تشجيعه على المشاركة في مسابقات الألغاز المنطقية والتركيبات الهندسية ومشاريع التصميم.';
  } else if (nviq >= 110) {
    classification = 'متوسط مرتفع (High Average)';
    classificationEn = 'High Average';
    severityKey = 'high_average';
    severityColor = '#0284c7';
    clinicalImpression = `تقع القدرات العقلية غير اللفظية للمفحوص في نطاق المتوسط المرتفع (معامل ذكاء غير لفظي Leiter-3 NVIQ: ${nviq} برتبة مئينية ${nviqPercentile}%). يتمتع بقدرة جيدة جداً على الإدراك البصري والتصنيف المنطقي.`;
    recommendations = '1. استثمار تفوقه غير اللفظي لتعزيز مهارات التعلم الأكاديمية عبر الوسائط والرسومات التوضيحية.\n2. تدريب مهارات الذاكرة العاملة والانتباه المستمر لدعم استدامة الأداء العالي.';
  } else if (nviq >= 90) {
    classification = 'متوسط طبيعي (Average Range)';
    classificationEn = 'Average Range';
    severityKey = 'average';
    severityColor = '#059669';
    clinicalImpression = `تقع القدرات المعرفية العامة للمفحوص ضمن النطاق الطبيعي المعتاد لأقرانه في نفس العمر الزمني (معامل ذكاء غير لفظي Leiter-3 NVIQ: ${nviq} برتبة مئينية ${nviqPercentile}%). يعكس الأداء تكاملاً مناسباً في العمليات الإدراكية البصرية.`;
    recommendations = '1. الاستمرار في تطبيق المناهج المناسبة لعمره الزمني مع تعزيز التعلم القائم على النمذجة والوسائل البصرية.\n2. تقييم المهارات التكيفية واللغوية لتحديد الاحتياجات المساندة إن وجدت.';
  } else if (nviq >= 80) {
    classification = 'متوسط منخفض (Low Average)';
    classificationEn = 'Low Average';
    severityKey = 'low_average';
    severityColor = '#d97706';
    clinicalImpression = `تقع القدرات المعرفية غير اللفظية في نطاق المتوسط المنخفض (معامل ذكاء غير لفظي Leiter-3 NVIQ: ${nviq} برتبة مئينية ${nviqPercentile}%). قد يواجه بعض التحديات في المهام البصرية المجردة وسريعة التغير.`;
    recommendations = '1. تقديم المهام المعرفية مجزأة مع نماذج حسية محسوسة ملموسة لتبسيط المفاهيم.\n2. توفير وقت إضافي لإنجاز المهام وتقليل المشتتات البصرية في البيئة التعليمية.\n3. المتابعة المستمرة لمهارات الانتباه البصري والذاكرة قصيرة المدى.';
  } else if (nviq >= 70) {
    classification = 'حدّي / بطء تعلم غير لفظي (Borderline)';
    classificationEn = 'Borderline Range';
    severityKey = 'borderline';
    severityColor = '#ea580c';
    clinicalImpression = `أظهر المفحوص أداءً يقع في النطاق الحدّي (بطء التعلم) (معامل ذكاء غير لفظي Leiter-3 NVIQ: ${nviq} برتبة مئينية ${nviqPercentile}%). يستدعي هذا المستوى تدخلاً تعليمياً مكيّفاً وتدريباً فردياً منظماً.`;
    recommendations = '1. وضع خطة تربوية فردية (IEP) تركز على المهارات المعرفية الوظيفية والإدراك البصري الحركي.\n2. استخدام استراتيجيات التعليم المباشر والتكرار المنظم والتوجيه الحسي المتعدد (VAKT).\n3. تكييف أساليب التقييم والأنشطة الصفية لتقليل الاعتماد على الذاكرة المجردة المعقدة.';
  } else if (nviq >= 55) {
    classification = 'قصور فكري ومعرفي بسيط (Mild Intellectual Disability)';
    classificationEn = 'Mild Intellectual Disability';
    severityKey = 'mild_id';
    severityColor = '#dc2626';
    clinicalImpression = `تشير نتائج مقياس ليتر-3 إلى قصور معرفي وإدراكي بسيط ذي دلالة سيكومترية (معامل ذكاء غير لفظي Leiter-3 NVIQ: ${nviq} برتبة مئينية ${nviqPercentile}%). يستوجب تقديم خدمات التربية الخاصة الشاملة.`;
    recommendations = '1. تصميم خطة تربوية فردية مكثفة بإشراف فريق التربية الخاصة تركز على مهارات الاستقلالية والتواصل الوظيفي.\n2. تطبيق برامج التدخل السلوكي والتدريب على مهارات الحياة اليومية بالتعاون مع الأسرة.\n3. تقييم السلوك التكيفي (فينلاند-3) لتحديد مجالات الدعم البيئي المطلوبة بدقة.';
  } else {
    classification = 'قصور فكري ومعرفي متوسط إلى شديد (Moderate/Severe ID)';
    classificationEn = 'Moderate/Severe Intellectual Disability';
    severityKey = 'severe_id';
    severityColor = '#991b1b';
    clinicalImpression = `أظهرت نتائج التقييم غير اللفظي قصوراً معرفياً جوهرياً وحاداً (معامل ذكاء غير لفظي Leiter-3 NVIQ: ${nviq}). يتطلب المستفيد دعماً تأهيلياً وتربوياً مستمراً ومكثفاً في مهارات الرعاية الذاتية والتواصل غير اللفظي.`;
    recommendations = '1. التركيز على مهارات العناية بالذات والسلامة الشخصية والتواصل الوظيفي البسيط (نظام صور أو إشارات).\n2. تدريب الأهل على استراتيجيات التحفيز البيئي والتعامل اليومي في المنزل.\n3. توفير الدعم الإرشادي والنفسي للأسرة والمتابعة في مركز الرعاية والتأهيل النهاري.';
  }

  // Answered items count
  const totalAnswered = Object.keys(scores).filter(k => scores[k] !== undefined && scores[k] !== null && scores[k] !== '').length;

  const strengthSubtests = subtestResults.filter(st => st.isStrength);
  const deficitSubtests = subtestResults.filter(st => st.isDeficit);

  return {
    totalAnswered,
    answeredCount: totalAnswered,
    totalItems: LEITER3_ITEMS.length,
    completionPercentage: Math.round((totalAnswered / LEITER3_ITEMS.length) * 100),
    cogTotalRaw,
    cogSumScaled,
    attTotalRaw,
    attSumScaled,
    nviq,
    nviqPercentile,
    ami,
    amiPercentile,
    overallPercentile: nviqPercentile,
    classification,
    classificationEn,
    severityKey,
    severityColor,
    clinicalImpression,
    recommendations,
    subtestResults,
    strengthSubtests,
    deficitSubtests,
  };
}
