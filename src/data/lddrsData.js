/**
 * بطارية مقاييس التقدير التشخيصية لصعوبات التعلم النمائية والأكاديمية (LDDRS)
 * إعداد: الأستاذ الدكتور فتحي مصطفى الزيات
 * أستاذ علم النفس المعرفي وصعوبات التعلم - مدير برنامج صعوبات التعلم - جامعة الخليج العربي
 * 
 * البطارية التشخيصية الرائدة والمعتمدة في العالم العربي لتشخيص وتقييم صعوبات التعلم
 * 
 * تشتمل البطارية على المقاييس التشخيصية التالية:
 * 1. مقياس التقدير التشخيصي لصعوبات الانتباه (20 بنداً)
 * 2. مقياس التقدير التشخيصي لصعوبات الإدراك الاستماعي / السمعي (20 بنداً)
 * 3. مقياس التقدير التشخيصي لصعوبات الإدراك البصري (20 بنداً)
 * 4. مقياس التقدير التشخيصي لصعوبات الإدراك الحركي (20 بنداً)
 * 5. مقياس التقدير التشخيصي لصعوبات الذاكرة (20 بنداً)
 * 6. مقياس التقدير التشخيصي لصعوبات القراءة (20 بنداً)
 * 7. مقياس التقدير التشخيصي لصعوبات الكتابة (20 بنداً)
 * 8. مقياس التقدير التشخيصي لصعوبات تعلم الرياضيات (20 بنداً)
 * 9. مقياس التقدير التشخيصي لصعوبات السلوك الاجتماعي والانفعالي (80 بنداً عبر 8 أبعاد)
 * 
 * نظام التصحيح الخماسي:
 * دائماً (4) | غالباً (3) | أحياناً (2) | نادراً (1) | لا تنطبق (0)
 * 
 * محكات ومعايير الشدة لكل مقياس (20 بنداً - الدرجة العظمى 80):
 * - صفر إلى 20: عادي / لا توجد صعوبة (Normal)
 * - 21 إلى 40: صعوبات خفيفة (Mild LD)
 * - 41 إلى 60: صعوبات متوسطة (Moderate LD)
 * - 61 فأكثر (61 إلى 80): صعوبات شديدة (Severe LD)
 */

export const LDDRS_COPYRIGHT_INFO = {
  batteryNameAr: 'بطارية مقاييس التقدير التشخيصية لصعوبات التعلم النمائية والأكاديمية (LDDRS)',
  batteryNameEn: 'Learning Disabilities Diagnostic Rating Scales Battery (LDDRS)',
  batteryShortName: 'بطارية الزيات لصعوبات التعلم (LDDRS)',
  authorAr: 'أ.د. فتحي مصطفى الزيات',
  authorTitle: 'أستاذ علم النفس المعرفي وصعوبات التعلم - مدير برنامج صعوبات التعلم - جامعة الخليج العربي',
  normSamples: 'مقننة على عينات واسعة في البيئات المصرية، السعودية، البحرينية، والكويتية',
  publisherAr: 'دار النشر للجامعات / مكتبة الأنجلو المصرية',
  notice: 'جميع حقوق الطبع والملكية الفكرية محفوظة للمؤلف الأستاذ الدكتور فتحي مصطفى الزيات. الاستخدام في المنظومة مخصص لأغراض القياس الإكلينيكي والتشخيص النفسي التربوي في المدارس وغرف المصادر ومراكز التربية الخاصة والتدخل العلاجي.',
  disclaimer: 'تنبيه مهني: تتطلب هذه البطارية ملاحظة سلوكية دقيقة ومستمرة للتلميذ من قبل المعلمين أو الأخصائيين النفسيين وتعد نتائجها أساساً لتحديد الأهلية لخدمات صعوبات التعلم وبناء الخطة التربوية الفردية (IEP).',
};

export const LDDRS_RATING_OPTIONS = [
  { value: 4, label: 'دائماً (4)', score: 4, color: '#dc2626', badgeClass: 'b-rd', desc: 'يظهر السلوك دائماً وبدرجة عالية جداً ومستمرة' },
  { value: 3, label: 'غالباً (3)', score: 3, color: '#ea580c', badgeClass: 'b-or', desc: 'يظهر السلوك بتواتر متكرر في معظم الأوقات' },
  { value: 2, label: 'أحياناً (2)', score: 2, color: '#d97706', badgeClass: 'b-yl', desc: 'يظهر السلوك في بعض المواقف دون الأخرى' },
  { value: 1, label: 'نادراً (1)', score: 1, color: '#0284c7', badgeClass: 'b-bl', desc: 'يظهر السلوك بشكل نادر أو متباعد' },
  { value: 0, label: 'لا تنطبق (0)', score: 0, color: '#059669', badgeClass: 'b-gr', desc: 'لا تنطبق الخاصية على التلميذ وسلوكه طبيعي' },
];

export const LDDRS_SCALES = [
  {
    id: 'attention',
    num: 1,
    code: 'ATT',
    name: 'مقياس صعوبات الانتباه',
    nameEn: 'Attention Difficulties Scale',
    type: 'developmental',
    typeName: 'صعوبة نمائية',
    itemsCount: 20,
    maxScore: 80,
    color: '#dc2626',
    bgLight: '#fef2f2',
    icon: '🎯',
    description: 'ضعف أو قصور القدرة على تركيز الانتباه، والاحتفاظ به، والوعي الشعوري بموضوع الانتباه، وتشتت الانتباه وفرط الحركة والاندفاعية.',
    normRange: { normal: [0, 20], mild: [21, 40], moderate: [41, 60], severe: [61, 80] },
    percentileTable: { 20: 28, 40: 74, 60: 98, 80: 99 },
  },
  {
    id: 'auditory_perception',
    num: 2,
    code: 'AUD',
    name: 'مقياس صعوبات الإدراك الاستماعي / السمعي',
    nameEn: 'Auditory Perception Difficulties Scale',
    type: 'developmental',
    typeName: 'صعوبة نمائية',
    itemsCount: 20,
    maxScore: 80,
    color: '#0891b2',
    bgLight: '#ecfeff',
    icon: '👂',
    description: 'ضعف القدرة على إدراك وتفسير المعلومات الشفهية المسموعة وفهمها، والتمييز السمعي للأصوات والمقاطع وتتبع التعليمات الشفهية.',
    normRange: { normal: [0, 23], mild: [24, 43], moderate: [44, 60], severe: [61, 80] },
    percentileTable: { 20: 25, 40: 61, 60: 97, 80: 99 },
  },
  {
    id: 'visual_perception',
    num: 3,
    code: 'VIS',
    name: 'مقياس صعوبات الإدراك البصري',
    nameEn: 'Visual Perception Difficulties Scale',
    type: 'developmental',
    typeName: 'صعوبة نمائية',
    itemsCount: 20,
    maxScore: 80,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    icon: '👁️',
    description: 'قصور القدرة على إدراك وتفسير معاني المعلومات البصرية وفهمها، والتمييز البصري للحروف والأشكال والشكل والأرضية والعلاقات المكانية.',
    normRange: { normal: [0, 20], mild: [21, 40], moderate: [41, 60], severe: [61, 80] },
    percentileTable: { 20: 10, 40: 29, 60: 68, 80: 99 },
  },
  {
    id: 'motor_perception',
    num: 4,
    code: 'MOT',
    name: 'مقياس صعوبات الإدراك الحركي',
    nameEn: 'Motor Perception Difficulties Scale',
    type: 'developmental',
    typeName: 'صعوبة نمائية',
    itemsCount: 20,
    maxScore: 80,
    color: '#0d9488',
    bgLight: '#f0fdfa',
    icon: '🏃',
    description: 'ضعف أو قصور القدرة على الاستجابة الحركية للتعليمات المسموعة والمرئية بسرعة ودقة، والتآزر البصري الحركي والحركات الدقيقة والكبيرة.',
    normRange: { normal: [0, 20], mild: [21, 40], moderate: [41, 60], severe: [61, 80] },
    percentileTable: { 20: 16, 40: 39, 60: 76, 80: 99 },
  },
  {
    id: 'memory',
    num: 5,
    code: 'MEM',
    name: 'مقياس صعوبات الذاكرة',
    nameEn: 'Memory Difficulties Scale',
    type: 'developmental',
    typeName: 'صعوبة نمائية',
    itemsCount: 20,
    maxScore: 80,
    color: '#2563eb',
    bgLight: '#eff6ff',
    icon: '🧠',
    description: 'ضعف أو قصور القدرة على حفظ المعلومات والمعارف والتواريخ والأحداث والاحتفاظ بها وتذكرها أو استرجاعها ومعالجتها ذهنياً.',
    normRange: { normal: [0, 21], mild: [22, 40], moderate: [41, 60], severe: [61, 80] },
    percentileTable: { 20: 23, 40: 57, 60: 96, 80: 99 },
  },
  {
    id: 'reading',
    num: 6,
    code: 'REA',
    name: 'مقياس صعوبات القراءة (Dyslexia)',
    nameEn: 'Reading Difficulties Scale',
    type: 'academic',
    typeName: 'صعوبة أكاديمية',
    itemsCount: 20,
    maxScore: 80,
    color: '#b45309',
    bgLight: '#fffbeb',
    icon: '📖',
    description: 'ضعف أو قصور القدرة على التعرف على الحروف والكلمات والجمل والفهم القرائي لمعاني ومضامين النصوص القرائية ودقة وطلاقة القراءة.',
    normRange: { normal: [0, 21], mild: [22, 40], moderate: [41, 60], severe: [61, 80] },
    percentileTable: { 20: 11, 40: 32, 60: 72, 80: 99 },
  },
  {
    id: 'writing',
    num: 7,
    code: 'WRI',
    name: 'مقياس صعوبات الكتابة (Dysgraphia)',
    nameEn: 'Writing Difficulties Scale',
    type: 'academic',
    typeName: 'صعوبة أكاديمية',
    itemsCount: 20,
    maxScore: 80,
    color: '#4f46e5',
    bgLight: '#eef2ff',
    icon: '✍️',
    description: 'ضعف أو قصور القدرة على الكتابة اليدوية والتهجي والتعبير الكتابي وتنسيق الكلمات على السطر وتنظيم المسافات والحجم.',
    normRange: { normal: [0, 20], mild: [21, 40], moderate: [41, 60], severe: [61, 80] },
    percentileTable: { 20: 11, 40: 24, 60: 60, 80: 99 },
  },
  {
    id: 'math',
    num: 8,
    code: 'MAT',
    name: 'مقياس صعوبات تعلم الرياضيات (Dyscalculia)',
    nameEn: 'Mathematics Difficulties Scale',
    type: 'academic',
    typeName: 'صعوبة أكاديمية',
    itemsCount: 20,
    maxScore: 80,
    color: '#059669',
    bgLight: '#ecfdf5',
    icon: '🔢',
    description: 'ضعف أو قصور القدرة على إجراء العمليات الحسابية الأساسية وفهم لغة الرياضيات ورموزها وقواعدها وحل المسائل الرياضية.',
    normRange: { normal: [0, 22], mild: [23, 40], moderate: [41, 60], severe: [61, 80] },
    percentileTable: { 20: 10, 40: 24, 60: 58, 80: 99 },
  },
  {
    id: 'social_emotional',
    num: 9,
    code: 'SOC',
    name: 'مقياس صعوبات السلوك الاجتماعي والانفعالي',
    nameEn: 'Social & Emotional Behavior Difficulties Scale',
    type: 'behavioral',
    typeName: 'سلوكي وانفعالي',
    itemsCount: 80,
    maxScore: 320,
    subDimensionsCount: 8,
    color: '#e11d48',
    bgLight: '#fff1f2',
    icon: '🤝',
    description: 'قصور سلوك التلميذ وانحرافه عن السلوك السوي عبر 8 أبعاد: إفراط النشاط، اللاانتباهية، ضعف مفهوم الذات، قصور المهارات الاجتماعية، الاندفاعية، العدوانية، الانسحابية، الاعتمادية.',
    normRange: { normal: [0, 22], mild: [23, 28], moderate: [29, 33], severe: [34, 40] }, // Average per dimension out of 40
  },
];

export const LDDRS_ITEMS = [
  // 1. مقياس صعوبات الانتباه (1 - 20)
  { id: 'att_1', scaleId: 'attention', num: 1, text: 'يصعب عليه الاستمرار في أي عمل حتى يتمه.' },
  { id: 'att_2', scaleId: 'attention', num: 2, text: 'يبدو شارداً أو مشتتاً أو غير منتبه لما يسمع أو يقرأ أو يرى.' },
  { id: 'att_3', scaleId: 'attention', num: 3, text: 'يسهل تشتيته، "يتشتت انتباهه بسهولة لأي مثيرات".' },
  { id: 'att_4', scaleId: 'attention', num: 4, text: 'يجد صعوبة في أن يظل محتفظاً بانتباهه في المهام التي تتطلب تركيز الانتباه.' },
  { id: 'att_5', scaleId: 'attention', num: 5, text: 'يجد صعوبة في التوقف عن أنشطة اللعب.' },
  { id: 'att_6', scaleId: 'attention', num: 6, text: 'يجد صعوبة في أن يظل هادئاً خلال الحصة أو الدرس أو الجلوس بصفة عامة.' },
  { id: 'att_7', scaleId: 'attention', num: 7, text: 'يبدو متململاً أو عصبياً خلال الأداء على المهام أو الأنشطة الأكاديمية.' },
  { id: 'att_8', scaleId: 'attention', num: 8, text: 'يجد صعوبة في الاستغراق أو الانشغال بالعمل أو اللعب في هدوء.' },
  { id: 'att_9', scaleId: 'attention', num: 9, text: 'يتحدث كثيراً، وبصورة مفرطة، وبلا ضوابط أو هدف.' },
  { id: 'att_10', scaleId: 'attention', num: 10, text: 'يتحول من نشاط إلى آخر قبل اكتمال النشاط الذي يبدأه.' },
  { id: 'att_11', scaleId: 'attention', num: 11, text: 'يجد صعوبة في متابعة الدروس أو التوجيهات التي تصدر عن المعلمين.' },
  { id: 'att_12', scaleId: 'attention', num: 12, text: 'يتشتت انتباهه لأي مثيرات خارج مواقف التعلم.' },
  { id: 'att_13', scaleId: 'attention', num: 13, text: 'يبدو مشوشاً تتداخل لديه المثيرات وتختلط عليه المعلومات.' },
  { id: 'att_14', scaleId: 'attention', num: 14, text: 'يقاطع أو يتطفل أو يقتحم الآخرين دون مبرر أو استئذان.' },
  { id: 'att_15', scaleId: 'attention', num: 15, text: 'يجيب على الأسئلة باندفاع، وبلا تفكير، وقبل اكتمال سماعها.' },
  { id: 'att_16', scaleId: 'attention', num: 16, text: 'يجد صعوبة في انتظار دوره في الألعاب أو المواقف.' },
  { id: 'att_17', scaleId: 'attention', num: 17, text: 'يقحم نفسه بدنياً في أنشطة خطرة دون اعتبار لنتائجها.' },
  { id: 'att_18', scaleId: 'attention', num: 18, text: 'مندفعاً دون التأكد من معرفته الصحيحة للإجابات.' },
  { id: 'att_19', scaleId: 'attention', num: 19, text: 'يفقد أو ينسى أدواته اللازمة لأداء الأنشطة المدرسية أو المنزلية أو الرياضية.' },
  { id: 'att_20', scaleId: 'attention', num: 20, text: 'يبدو مهملاً أو غير مهتم أو مكترث بما يكلف أو تكلف به من أنشطة أو مهام.' },

  // 2. مقياس صعوبات الإدراك الاستماعي / السمعي (1 - 20)
  { id: 'aud_1', scaleId: 'auditory_perception', num: 1, text: 'يجد صعوبات في الفهم الاستماعي للمعلومات التي تقدم شفهياً.' },
  { id: 'aud_2', scaleId: 'auditory_perception', num: 2, text: 'يجد صعوبة في فهم المناقشات أو الأسئلة التي توجه إليه.' },
  { id: 'aud_3', scaleId: 'auditory_perception', num: 3, text: 'يجد صعوبة في فهم الكلمات المتماثلة نطقاً والمختلفة معنى.' },
  { id: 'aud_4', scaleId: 'auditory_perception', num: 4, text: 'يجد صعوبة في متابعة التعليمات أو الشرح الشفوي للمعلم.' },
  { id: 'aud_5', scaleId: 'auditory_perception', num: 5, text: 'يجد صعوبة في تمييز أصوات الحروف أو المقاطع المنطوقة.' },
  { id: 'aud_6', scaleId: 'auditory_perception', num: 6, text: 'يجد صعوبة في تهجي أصوات الحروف والمقاطع.' },
  { id: 'aud_7', scaleId: 'auditory_perception', num: 7, text: 'يجد صعوبة في فهم وإتباع التعليمات الشفهية واسترجاعها.' },
  { id: 'aud_8', scaleId: 'auditory_perception', num: 8, text: 'يجد صعوبة في إدراك الزمن: لحظة، بعد قليل، بعد ساعة.' },
  { id: 'aud_9', scaleId: 'auditory_perception', num: 9, text: 'يحتاج إلى تكرار الشرح الشفهي للمعلومات عدة مرات.' },
  { id: 'aud_10', scaleId: 'auditory_perception', num: 10, text: 'يجد صعوبة في استيعاب معنى المعلومات شفهياً دون تكرار.' },
  { id: 'aud_11', scaleId: 'auditory_perception', num: 11, text: 'يفقد انتباهه للمدرس أو الدرس لأي مشتتات خارج الفصل.' },
  { id: 'aud_12', scaleId: 'auditory_perception', num: 12, text: 'يجد صعوبة في تتبع المثيرات والمعلومات السمعية.' },
  { id: 'aud_13', scaleId: 'auditory_perception', num: 13, text: 'يجد صعوبة في فهم معنى ومتابعة دلالات الأصوات والإشارات.' },
  { id: 'aud_14', scaleId: 'auditory_perception', num: 14, text: 'يجد صعوبة في متابعة شرح المعلم عند المعدل العادي للشرح.' },
  { id: 'aud_15', scaleId: 'auditory_perception', num: 15, text: 'يجد صعوبة في فهم الشرح باستخدام التعبيرات العادية.' },
  { id: 'aud_16', scaleId: 'auditory_perception', num: 16, text: 'يجد صعوبة في إكمال مقاطع الكلمات الناقصة المسموعة.' },
  { id: 'aud_17', scaleId: 'auditory_perception', num: 17, text: 'يجد صعوبة في إدراك تركيب الكلمات أو الحروف المسموعة.' },
  { id: 'aud_18', scaleId: 'auditory_perception', num: 18, text: 'يصعب عليه إدراك معنى الكلمات المسموعة ناقصة حرف أو أكثر.' },
  { id: 'aud_19', scaleId: 'auditory_perception', num: 19, text: 'يجد صعوبة في فهم معاني المقاطع المسموعة أو المنطوقة.' },
  { id: 'aud_20', scaleId: 'auditory_perception', num: 20, text: 'يجد صعوبة في الفهم الاستماعي للمفاهيم المجردة.' },

  // 3. مقياس صعوبات الإدراك البصري (1 - 20)
  { id: 'vis_1', scaleId: 'visual_perception', num: 1, text: 'يجد صعوبة في تمييز الرسوم والخرائط، أو الأشكال الهندسية.' },
  { id: 'vis_2', scaleId: 'visual_perception', num: 2, text: 'يجد صعوبة في التمييز بين الحروف، والكلمات، والأعداد.' },
  { id: 'vis_3', scaleId: 'visual_perception', num: 3, text: 'يجد صعوبة في التمييز بين الأشياء من حيث اللون والحجم.' },
  { id: 'vis_4', scaleId: 'visual_perception', num: 4, text: 'يجد صعوبة في التمييز بين مكونات وتفاصيل الأشكال المرئية.' },
  { id: 'vis_5', scaleId: 'visual_perception', num: 5, text: 'يجد صعوبة في تمييز "الشكل" عن الخلفية المحيطة به "الأرضية".' },
  { id: 'vis_6', scaleId: 'visual_perception', num: 6, text: 'يجد صعوبة في إدراك الأشكال والرسوم البيانية بصرياً.' },
  { id: 'vis_7', scaleId: 'visual_perception', num: 7, text: 'يصعب عليه تجميع أجزاء الأشكال لتكوين الشكل أو الصورة.' },
  { id: 'vis_8', scaleId: 'visual_perception', num: 8, text: 'يجد صعوبة في معرفة الشكل عندما ينقص منه جزء أو أكثر.' },
  { id: 'vis_9', scaleId: 'visual_perception', num: 9, text: 'يجد صعوبة في إكمال الفراغات بالكلمات أو الحروف أو الأعداد.' },
  { id: 'vis_10', scaleId: 'visual_perception', num: 10, text: 'يتوه أو يضيع أو يأخذ وقتاً في معرفة الأماكن المألوفة.' },
  { id: 'vis_11', scaleId: 'visual_perception', num: 11, text: 'يجد صعوبة في التعرف على أشكال الحروف الهجائية أو الأعداد.' },
  { id: 'vis_12', scaleId: 'visual_perception', num: 12, text: 'يجد صعوبة في تمييز الأشكال الهندسية مثل المربع والمستطيل.' },
  { id: 'vis_13', scaleId: 'visual_perception', num: 13, text: 'يخطئ في كتابة بعض الرموز أو الكلمات المتشابهة بصرياً مثل (علم - عمل).' },
  { id: 'vis_14', scaleId: 'visual_perception', num: 14, text: 'يجد صعوبة في القراءة والكتابة والعمليات الحسابية والجداول.' },
  { id: 'vis_15', scaleId: 'visual_perception', num: 15, text: 'يجد صعوبة في إدراك الجزء بدون الكل أو الكل من أجزائه.' },
  { id: 'vis_16', scaleId: 'visual_perception', num: 16, text: 'يجد صعوبة في قراءة الأجهزة والأدوات كالساعة، والترمومتر، والمسطرة.' },
  { id: 'vis_17', scaleId: 'visual_perception', num: 17, text: 'يجد صعوبة في تذكر المعلومات المتتابعة مثل ترتيب الحروف الأبجدية، شهور السنة، أيام الأسبوع.' },
  { id: 'vis_18', scaleId: 'visual_perception', num: 18, text: 'يجد صعوبة في استخدام النقط والفواصل في النصوص.' },
  { id: 'vis_19', scaleId: 'visual_perception', num: 19, text: 'يقرأ ببطء شديد أو يقرأ كلمة-كلمة، وبشكل متقطع.' },
  { id: 'vis_20', scaleId: 'visual_perception', num: 20, text: 'يجد صعوبة في إدراك مدلول الحروف والكلمات عند القراءة الجهرية.' },

  // 4. مقياس صعوبات الإدراك الحركي (1 - 20)
  { id: 'mot_1', scaleId: 'motor_perception', num: 1, text: 'يجد صعوبة في القيام بالأنشطة التي تتطلب التآزر بين أعضاء الجسم.' },
  { id: 'mot_2', scaleId: 'motor_perception', num: 2, text: 'يجد صعوبة في التمييز بين اليمين واليسار، والشرق والغرب.' },
  { id: 'mot_3', scaleId: 'motor_perception', num: 3, text: 'يجد صعوبة في مسك الأدوات، والكتابة على السطر.' },
  { id: 'mot_4', scaleId: 'motor_perception', num: 4, text: 'تصدر عنه حركات عصبية تشنجية عند الكتابة.' },
  { id: 'mot_5', scaleId: 'motor_perception', num: 5, text: 'يجد صعوبة في إحداث تآزر بصري حركي إدراكي.' },
  { id: 'mot_6', scaleId: 'motor_perception', num: 6, text: 'يجد صعوبة في التحدث والتعبير الحركي الشفهي.' },
  { id: 'mot_7', scaleId: 'motor_perception', num: 7, text: 'يفقد أماكن الكتابة والقراءة والعمليات الحسابية ورسم الأشكال.' },
  { id: 'mot_8', scaleId: 'motor_perception', num: 8, text: 'يجد صعوبة في ممارسة أنشطة الركل والمسك والرسم.' },
  { id: 'mot_9', scaleId: 'motor_perception', num: 9, text: 'يجد صعوبة في إدراك النشاط الحركي: اليمين واليسار، الدوران للخلف، ثني الجذع.. الخ.' },
  { id: 'mot_10', scaleId: 'motor_perception', num: 10, text: 'يجد صعوبة في ممارسة أنشطة الجري، والوثب، والركل، واستقبال الكرة.' },
  { id: 'mot_11', scaleId: 'motor_perception', num: 11, text: 'يجد صعوبة في استخدام الأصابع في التآزر الحركي والأعمال الدقيقة.' },
  { id: 'mot_12', scaleId: 'motor_perception', num: 12, text: 'يجد صعوبة في ممارسة الحركات الدقيقة مثل استخدام المقص.' },
  { id: 'mot_13', scaleId: 'motor_perception', num: 13, text: 'يصعب عليه ممارسة أي عمل يدوي أو بدني بدقة وسرعة.' },
  { id: 'mot_14', scaleId: 'motor_perception', num: 14, text: 'يجد صعوبة في أداء مهارات مثل ارتداء الملابس، أو ركوب الدراجة.' },
  { id: 'mot_15', scaleId: 'motor_perception', num: 15, text: 'يجد صعوبة في مهارات الرسم والتلوين والأنشطة الرياضية.' },
  { id: 'mot_16', scaleId: 'motor_perception', num: 16, text: 'يجد صعوبة في أداء المهارات الدقيقة مثل استخدام الأدوات الهندسية.' },
  { id: 'mot_17', scaleId: 'motor_perception', num: 17, text: 'يجد صعوبة في نطق الأعداد المركبة والأرقام، وتسمية الأشكال.' },
  { id: 'mot_18', scaleId: 'motor_perception', num: 18, text: 'يمارس الأنشطة غير الهادفة، ويجد صعوبة في التوقف عنها.' },
  { id: 'mot_19', scaleId: 'motor_perception', num: 19, text: 'يجد صعوبة في حمل الأشياء أو ركوب الدراجات أو اللعب الحركي.' },
  { id: 'mot_20', scaleId: 'motor_perception', num: 20, text: 'يجد صعوبة في التحكم الحركي مثل ربط الحذاء واستخدام الأدوات.' },

  // 5. مقياس صعوبات الذاكرة (1 - 20)
  { id: 'mem_1', scaleId: 'memory', num: 1, text: 'يجد صعوبة ملموسة في حفظ وتذكر أشكال الحروف والكلمات.' },
  { id: 'mem_2', scaleId: 'memory', num: 2, text: 'يعاني من تشتت واضطراب في تذكر المعلومات اللفظية.' },
  { id: 'mem_3', scaleId: 'memory', num: 3, text: 'سعة الاستيعاب أو الاحتفاظ لديه ضئيلة.' },
  { id: 'mem_4', scaleId: 'memory', num: 4, text: 'يجد صعوبة في تذكر ما يسمع أو يقرأ.' },
  { id: 'mem_5', scaleId: 'memory', num: 5, text: 'يجد صعوبة في تذكر ما يشاهده أو يسمعه خلال فترات وجيزة.' },
  { id: 'mem_6', scaleId: 'memory', num: 6, text: 'يجد صعوبة في حفظ المعلومات والأشكال واسترجاعها.' },
  { id: 'mem_7', scaleId: 'memory', num: 7, text: 'يجد صعوبات في التحصيل الأكاديمي لمعظم المجالات الدراسية.' },
  { id: 'mem_8', scaleId: 'memory', num: 8, text: 'يجد صعوبة في تذكر أو استرجاع ما يسمع أو يقرأ.' },
  { id: 'mem_9', scaleId: 'memory', num: 9, text: 'يجد صعوبة في الاحتفاظ بالمعلومات ومعالجتها ذهنياً.' },
  { id: 'mem_10', scaleId: 'memory', num: 10, text: 'يجد صعوبة في استرجاع أو تذكر الرسوم والجداول والأماكن.' },
  { id: 'mem_11', scaleId: 'memory', num: 11, text: 'يجد صعوبة في استرجاع الأرقام والأعداد والمعلومات والقواعد.' },
  { id: 'mem_12', scaleId: 'memory', num: 12, text: 'يصعب عليه حفظ التعليمات التي يشاهدها أو يسمعها لمدة وجيزة.' },
  { id: 'mem_13', scaleId: 'memory', num: 13, text: 'يجد صعوبة في تذكر ما يطلب منه من واجبات مدرسية.' },
  { id: 'mem_14', scaleId: 'memory', num: 14, text: 'يجد صعوبات في تذكر الأحداث أو المواقف الحياتية واليومية.' },
  { id: 'mem_15', scaleId: 'memory', num: 15, text: 'يجد صعوبة في حفظ تتابع أو ترتيب المعلومات أو المهارات.' },
  { id: 'mem_16', scaleId: 'memory', num: 16, text: 'يفشل في تذكر الآليات والاستراتيجيات المناسبة للموقف المشكل.' },
  { id: 'mem_17', scaleId: 'memory', num: 17, text: 'يجد صعوبات في تذكر النصوص أو القصائد الأكاديمية أو الدراسية.' },
  { id: 'mem_18', scaleId: 'memory', num: 18, text: 'يجد صعوبة في تذكر ترتيب الشهور أو تذكر جدول الضرب.' },
  { id: 'mem_19', scaleId: 'memory', num: 19, text: 'يفشل في حفظ حقائق أو قوانين أو قواعد الرياضيات وعلاقاتها.' },
  { id: 'mem_20', scaleId: 'memory', num: 20, text: 'يفشل في الاحتفاظ بما سبق تعلمه وإعادة استخدامه أو توظيفه.' },

  // 6. مقياس صعوبات القراءة (1 - 20)
  { id: 'rea_1', scaleId: 'reading', num: 1, text: 'يبدو عصبياً – متململاً – عبوساً عندما يقرأ.' },
  { id: 'rea_2', scaleId: 'reading', num: 2, text: 'يقرأ بصوت مرتفع وحاد – يضغط على مخارج الحروف.' },
  { id: 'rea_3', scaleId: 'reading', num: 3, text: 'يقاوم القراءة، يبكي، يفتت المقاطع والكلمات.' },
  { id: 'rea_4', scaleId: 'reading', num: 4, text: 'يفقد مكان القراءة، ويعيد ما يقرأ بصورة متكررة.' },
  { id: 'rea_5', scaleId: 'reading', num: 5, text: 'ينطق بطريقة متقطعة متشنجة خلال القراءة.' },
  { id: 'rea_6', scaleId: 'reading', num: 6, text: 'يبدو قلقاً مرتبكاً، يقرب مواد القراءة من عينيه.' },
  { id: 'rea_7', scaleId: 'reading', num: 7, text: 'يحذف بعض الكلمات، يقفز من موقع إلى آخر أثناء القراءة.' },
  { id: 'rea_8', scaleId: 'reading', num: 8, text: 'يستبدل بعض الكلمات بكلمات أخرى غير موجودة بالنص.' },
  { id: 'rea_9', scaleId: 'reading', num: 9, text: 'يعكس أو يستبدل بعض الحروف والكلمات.' },
  { id: 'rea_10', scaleId: 'reading', num: 10, text: 'يخطئ في نطق الكلمات أو يعاني من سوء نطق الحروف.' },
  { id: 'rea_11', scaleId: 'reading', num: 11, text: 'يقرأ دون أن يبدي نوعاً من الفهم لما يقرأ.' },
  { id: 'rea_12', scaleId: 'reading', num: 12, text: 'يقرأ الكلمات بترتيب خاطئ.' },
  { id: 'rea_13', scaleId: 'reading', num: 13, text: 'يبدي تردداً عند الكلمات التي لا يستطيع نطقها.' },
  { id: 'rea_14', scaleId: 'reading', num: 14, text: 'يجد صعوبة في التعرف على الحروف والمقاطع والكلمات.' },
  { id: 'rea_15', scaleId: 'reading', num: 15, text: 'يجد صعوبة في استنتاج الحقائق والمعاني الواردة في النص.' },
  { id: 'rea_16', scaleId: 'reading', num: 16, text: 'يفشل في إعادة مضمون قصة قصيرة بعد قراءتها.' },
  { id: 'rea_17', scaleId: 'reading', num: 17, text: 'يعجز عن استنتاج الفكرة الرئيسية لما يقرأ.' },
  { id: 'rea_18', scaleId: 'reading', num: 18, text: 'يقرأ بطريقة متقطعة: حرف حرف، مقطع مقطع، كلمة كلمة.' },
  { id: 'rea_19', scaleId: 'reading', num: 19, text: 'يقرأ بصوت مرتفع وحاد، ومتشنج.' },
  { id: 'rea_20', scaleId: 'reading', num: 20, text: 'يجد صعوبة في استخدام النقط والفواصل والوقف عند القراءة.' },

  // 7. مقياس صعوبات الكتابة (1 - 20)
  { id: 'wri_1', scaleId: 'writing', num: 1, text: 'يجد صعوبة في نسخ الفقرات والواجبات والأعمال الكتابية.' },
  { id: 'wri_2', scaleId: 'writing', num: 2, text: 'يجد صعوبة في التعبير الكتابي عما يريد.' },
  { id: 'wri_3', scaleId: 'writing', num: 3, text: 'يجد صعوبة في أن يميز اللام الشمسية واللام القمرية، وبين الحروف الكبيرة والصغيرة في الإنجليزية.' },
  { id: 'wri_4', scaleId: 'writing', num: 4, text: 'يجد صعوبة في الكتابة على سطور الكراسات العادية للكتابة.' },
  { id: 'wri_5', scaleId: 'writing', num: 5, text: 'يجد صعوبة في نسخ بعض الحروف والأشكال على نحو صحيح.' },
  { id: 'wri_6', scaleId: 'writing', num: 6, text: 'يجد صعوبة في كتابة أدوات الوصل الملائمة للحروف والكلمات.' },
  { id: 'wri_7', scaleId: 'writing', num: 7, text: 'يجد صعوبة في كتابة الحروف الهجائية من الذاكرة مكوناً كلمات.' },
  { id: 'wri_8', scaleId: 'writing', num: 8, text: 'يجد صعوبة في كتابة الحروف المتصلة مكوناً كلمات وجمل منضبطة.' },
  { id: 'wri_9', scaleId: 'writing', num: 9, text: 'يجد صعوبة في تنسيق واجباته اليومية المكتوبة.' },
  { id: 'wri_10', scaleId: 'writing', num: 10, text: 'يجد صعوبة في الكتابة بالقلم الحبر والقلم الجاف.' },
  { id: 'wri_11', scaleId: 'writing', num: 11, text: 'يجد صعوبة في أن يكتب بطلاقة ومرونة ونعومة.' },
  { id: 'wri_12', scaleId: 'writing', num: 12, text: 'يجد صعوبة في أن يحتفظ بأدوات الكتابة والرسم والألوان.' },
  { id: 'wri_13', scaleId: 'writing', num: 13, text: 'يجد صعوبة في عمل الرسوم، والخرائط، والعناوين المكتوبة.' },
  { id: 'wri_14', scaleId: 'writing', num: 14, text: 'يجد صعوبة في كتابة الحروف والأرقام بشكل مقبول ومنظم.' },
  { id: 'wri_15', scaleId: 'writing', num: 15, text: 'يجد صعوبة في الالتزام بالحيز المخصص للكتابة.' },
  { id: 'wri_16', scaleId: 'writing', num: 16, text: 'يجد صعوبة في الكتابة بشكل سلس وناعم.' },
  { id: 'wri_17', scaleId: 'writing', num: 17, text: 'يجد صعوبة في الكتابة وفقاً لقواعد الخط والكتابة اليدوية.' },
  { id: 'wri_18', scaleId: 'writing', num: 18, text: 'يجد صعوبة في المحافظة على حجم الكتابة وتنسيقها.' },
  { id: 'wri_19', scaleId: 'writing', num: 19, text: 'يجد صعوبة في تنظيم مسافات الحروف والكلمات والجمل.' },
  { id: 'wri_20', scaleId: 'writing', num: 20, text: 'كتاباته مفككة ركيكة، مع ضعف القدرة على التعبير.' },

  // 8. مقياس صعوبات تعلم الرياضيات (1 - 20)
  { id: 'mat_1', scaleId: 'math', num: 1, text: 'يجد صعوبة في التمييز بين الأرقام المتشابهة مثل: (2 ، 6) و (7 ، 8).' },
  { id: 'mat_2', scaleId: 'math', num: 2, text: 'يجد صعوبة في إجراء عمليات الضرب والقسمة المطولة.' },
  { id: 'mat_3', scaleId: 'math', num: 3, text: 'يجد صعوبة في حل مسائل الجمع مع الحمل والطرح مع الاستلاف.' },
  { id: 'mat_4', scaleId: 'math', num: 4, text: 'يضع أرقام أو فاصلة الكسور العشرية في غير مكانها.' },
  { id: 'mat_5', scaleId: 'math', num: 5, text: 'يجد صعوبة في الاستخدام الصحيح لعلامات أكبر من وأصغر من (> ، <).' },
  { id: 'mat_6', scaleId: 'math', num: 6, text: 'يجد صعوبة في حل المسائل اللفظية الشفهية المتعددة الخطوات.' },
  { id: 'mat_7', scaleId: 'math', num: 7, text: 'يجد صعوبة في فهم القيم المكانية للأرقام (آحاد، عشرات، مئات) وكتابتها وفقاً لها.' },
  { id: 'mat_8', scaleId: 'math', num: 8, text: 'يجد صعوبة في حفظ الحقائق الرياضية، والاحتفاظ بها.' },
  { id: 'mat_9', scaleId: 'math', num: 9, text: 'يجد صعوبة في فهم معنى الرموز الرياضية.' },
  { id: 'mat_10', scaleId: 'math', num: 10, text: 'ينسى القواعد الرياضية المتعلقة بالدروس السابقة.' },
  { id: 'mat_11', scaleId: 'math', num: 11, text: 'يجد صعوبة في حل المسائل متعددة الخطوات وتمييز ناتج الحل.' },
  { id: 'mat_12', scaleId: 'math', num: 12, text: 'يجد صعوبة في تحويل الصياغات اللفظية للمسائل إلى رموز رياضية.' },
  { id: 'mat_13', scaleId: 'math', num: 13, text: 'يجد صعوبة في حل المسائل الرياضية أو الحسابية عقلياً (الحساب الذهني).' },
  { id: 'mat_14', scaleId: 'math', num: 14, text: 'يجد صعوبة في التحويل بين الوحدات الأكبر والأصغر (مم، سم، متر، كم).' },
  { id: 'mat_15', scaleId: 'math', num: 15, text: 'يجد صعوبة في تمييز الحجم، والكمية، والمسافة، والزمن.' },
  { id: 'mat_16', scaleId: 'math', num: 16, text: 'يجد صعوبة في فهم واستخدام الرموز والعلاقات الرياضية.' },
  { id: 'mat_17', scaleId: 'math', num: 17, text: 'يجد صعوبة في حل المسائل التي تتطلب تنوع العمليات الحسابية.' },
  { id: 'mat_18', scaleId: 'math', num: 18, text: 'يحتاج إلى تصحيح كل خطوة في المسائل متعددة الخطوات.' },
  { id: 'mat_19', scaleId: 'math', num: 19, text: 'يجد صعوبة في ترتيب الأعداد تصاعدياً أو تنازلياً.' },
  { id: 'mat_20', scaleId: 'math', num: 20, text: 'يجد صعوبة في جمع وطرح وضرب الإشارات عند حل المسائل.' },
];

/**
 * Psychometric Calculation for LDDRS Battery (Fathi El-Zayat)
 */
export function calculateLDDRSPsychometrics(scores = {}, activeScaleId = null) {
  const scaleResults = LDDRS_SCALES.map(scale => {
    const scaleItems = LDDRS_ITEMS.filter(it => it.scaleId === scale.id);
    let rawScore = 0;
    let answeredCount = 0;

    scaleItems.forEach(item => {
      const val = scores[item.id];
      if (val !== undefined && val !== null && val !== '') {
        rawScore += Number(val);
        answeredCount++;
      }
    });

    const isScaleEvaluated = answeredCount > 0;
    const maxScore = scale.maxScore || (scaleItems.length * 4);
    const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

    // Severity & Clinical Cut-off according to El-Zayat manual (p. 4, 8, 41):
    // 0 - 20: عادي / لا توجد صعوبة
    // 21 - 40: صعوبات خفيفة
    // 41 - 60: صعوبات متوسطة
    // 61 - 80: صعوبات شديدة
    let severity = 'عادي / لا توجد صعوبة';
    let severityKey = 'normal';
    let severityColor = '#059669';
    let severityClass = 'b-gr';
    let isDeficit = false;

    if (rawScore >= 61) {
      severity = 'صعوبة شديدة (≥ 61)';
      severityKey = 'severe';
      severityColor = '#dc2626';
      severityClass = 'b-rd';
      isDeficit = true;
    } else if (rawScore >= 41) {
      severity = 'صعوبة متوسطة (41 - 60)';
      severityKey = 'moderate';
      severityColor = '#ea580c';
      severityClass = 'b-or';
      isDeficit = true;
    } else if (rawScore >= 21) {
      severity = 'صعوبة خفيفة (21 - 40)';
      severityKey = 'mild';
      severityColor = '#d97706';
      severityClass = 'b-yl';
      isDeficit = true;
    }

    // Lookup Approximate Percentile according to Table 39 / Norms
    let percentile = 1;
    if (rawScore <= 20) {
      percentile = Math.max(1, Math.round((rawScore / 20) * 20));
    } else if (rawScore <= 40) {
      percentile = 21 + Math.round(((rawScore - 20) / 20) * 35); // 21 - 56
    } else if (rawScore <= 60) {
      percentile = 57 + Math.round(((rawScore - 40) / 20) * 35); // 57 - 92
    } else {
      percentile = 93 + Math.min(6, Math.round(((rawScore - 60) / 20) * 6)); // 93 - 99
    }

    return {
      ...scale,
      rawScore,
      maxScore,
      answeredCount,
      totalItems: scaleItems.length,
      completionRate: Math.round((answeredCount / scaleItems.length) * 100),
      percentage,
      severity,
      severityKey,
      severityColor,
      severityClass,
      isDeficit,
      percentile,
      isScaleEvaluated,
    };
  });

  const evaluatedScales = scaleResults.filter(s => s.isScaleEvaluated);
  const totalAnswered = evaluatedScales.reduce((acc, s) => acc + s.answeredCount, 0);
  const totalRawScore = evaluatedScales.reduce((acc, s) => acc + s.rawScore, 0);
  const totalMaxScore = evaluatedScales.reduce((acc, s) => acc + s.maxScore, 0);

  const deficitScales = scaleResults.filter(s => s.isDeficit);
  const severeScales = scaleResults.filter(s => s.severityKey === 'severe');
  const moderateScales = scaleResults.filter(s => s.severityKey === 'moderate');
  const mildScales = scaleResults.filter(s => s.severityKey === 'mild');

  // Overall Diagnosis (El-Zayat Criteria p. 4 / 8 / 12):
  // 1. إذا كانت جميع الدرجات < 20 -> احتمال ألا تكون لدى التلميذ صعوبة تعلم
  // 2. إذا كانت هناك درجات بين 21 - 40 -> صعوبات خفيفة
  // 3. إذا كانت إحدى الدرجات 41 فأكثر -> احتمال مؤكد لوجود صعوبة تعلم
  let overallStatus = 'أداء عادي / مستبعد وجود صعوبة تعلم';
  let overallKey = 'normal';
  let overallColor = '#059669';
  let conclusionText = 'جميع درجات التلميذ على مقاييس التقدير التشخيصية تقل عن الدرجة (20)، مما يشير إلى أداء نمائي وأكاديمي طبيعي.';

  if (severeScales.length > 0) {
    overallStatus = 'صعوبات تعلم نوعية شديدة ومؤكدة إكلينيكياً';
    overallKey = 'severe';
    overallColor = '#dc2626';
    conclusionText = `يظهر التلميذ صعوبة شديدة (أعلى من 61 درجة) في المجالات التالية: (${severeScales.map(s => s.name).join(' ، ')}) مما يتطلب إدراجه فوراً في برامج صعوبات التعلم والخطة الفردية IEP.`;
  } else if (moderateScales.length > 0) {
    overallStatus = 'صعوبات تعلم متوسطة دالة تشخيصياً';
    overallKey = 'moderate';
    overallColor = '#ea580c';
    conclusionText = `تتجاوز درجات التلميذ محك الـ (41 درجة) في المجالات التالية: (${moderateScales.map(s => s.name).join(' ، ')}) مما يؤكد حاجته لتدخل تخصصي في غرف المصادر.`;
  } else if (mildScales.length > 0) {
    overallStatus = 'مؤشرات صعوبات تعلم خفيفة';
    overallKey = 'mild';
    overallColor = '#d97706';
    conclusionText = `تتراوح درجات التلميذ بين (21 - 40 درجة) في (${mildScales.map(s => s.name).join(' ، ')}) مما يستدعي خطة دعم صفي ومتابعة مستمرة.`;
  }

  return {
    scaleResults,
    evaluatedScales,
    totalAnswered,
    totalRawScore,
    totalMaxScore,
    deficitScales,
    severeScales,
    moderateScales,
    mildScales,
    overallStatus,
    overallKey,
    overallColor,
    conclusionText,
  };
}
