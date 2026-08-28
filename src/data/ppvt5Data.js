/**
 * مقياس بيبودي للمفردات اللغوية المصورة - الإصدار الخامس (PPVT-5)
 * Peabody Picture Vocabulary Test - Fifth Edition (Arabic Research-Based Clinical Adaptation)
 * Standardized Psychometric & Clinical Vocabulary Assessment Structure
 */

export const PPVT5_COPYRIGHT_INFO = {
  measureNameAr: 'مقياس بيبودي للمفردات اللغوية المصورة - الإصدار الخامس (PPVT-5)',
  measureNameEn: 'Peabody Picture Vocabulary Test - Fifth Edition (PPVT™-5)',
  authorAr: 'د. دوغلاس إم. دان & د. لويد إم. دان',
  authorEn: 'Douglas M. Dunn, Ph.D. & Lloyd M. Dunn, Ph.D.',
  publisherAr: 'بيرسون للتقييم الإكلينيكي Pearson Clinical Assessment',
  adaptationAr: 'التقنين الإكلينيكي المعرب للمفردات الاستقبالية والفهم الدلالي',
  targetAge: 'من عمر سنتين و 6 أشهر (2:6) وحتى 90 سنة (الأعمار النمائية والتأهيلية)',
  standardsReference: 'معايير الدرجات المعيارية (SS = 100 ± 15) والرتب المئينية (PR) والأعمار اللغوية المكافئة (AE)',
  totalItems: 96,
  totalSets: 8,
  notice: 'مقياس مقنن لتشخيص الحصيلة اللفظية الاستقبالية والنمو المعجمي وتحديد الفجوة بين العمر الزمني واللغوي.',
  disclaimer: 'تخضع حقوق الاختبار للملكية الفكرية لـ Pearson Clinical — مخصص للاستخدام الإكلينيكي والتشخيصي المتخصص.',
};

export const PPVT5_RESPONSE_OPTIONS = [
  { value: 1, label: '1 - صحيح / متقن', description: 'أشار المفحوص إلى الصورة الصحيحة بشكل دقيق', score: 1 },
  { value: 0, label: '0 - غير صحيح / خطأ', description: 'أشار المفحوص إلى صورة خاطئة أو لم يستجب', score: 0 },
];

export const PPVT5_SET_METADATA = [
  { id: 1, name: 'المجموعة 1 (سن 2.5 - 3 سنوات)', code: 'SET-1', ageRange: '2.5 - 3 سنوات', startAgeMonths: 30, itemsCount: 12, color: '#0d9488', icon: '🐣' },
  { id: 2, name: 'المجموعة 2 (سن 4 - 5 سنوات)', code: 'SET-2', ageRange: '4 - 5 سنوات', startAgeMonths: 48, itemsCount: 12, color: '#0284c7', icon: '🧒' },
  { id: 3, name: 'المجموعة 3 (سن 6 - 7 سنوات)', code: 'SET-3', ageRange: '6 - 7 سنوات', startAgeMonths: 72, itemsCount: 12, color: '#7c3aed', icon: '🎒' },
  { id: 4, name: 'المجموعة 4 (سن 8 - 9 سنوات)', code: 'SET-4', ageRange: '8 - 9 سنوات', startAgeMonths: 96, itemsCount: 12, color: '#b45309', icon: '🔭' },
  { id: 5, name: 'المجموعة 5 (سن 10 - 11 سنة)', code: 'SET-5', ageRange: '10 - 11 سنة', startAgeMonths: 120, itemsCount: 12, color: '#c026d3', icon: '🧭' },
  { id: 6, name: 'المجموعة 6 (سن 12 - 13 سنة)', code: 'SET-6', ageRange: '12 - 13 سنة', startAgeMonths: 144, itemsCount: 12, color: '#059669', icon: '🔬' },
  { id: 7, name: 'المجموعة 7 (سن 14 - 15 سنة)', code: 'SET-7', ageRange: '14 - 15 سنة', startAgeMonths: 168, itemsCount: 12, color: '#ea580c', icon: '💡' },
  { id: 8, name: 'المجموعة 8 (سن 16 سنة فما فوق)', code: 'SET-8', ageRange: '16 سنة فما فوق', startAgeMonths: 192, itemsCount: 12, color: '#475569', icon: '🏛️' },
];

export const PPVT5_WORD_TYPES = [
  { id: 'all', name: 'جميع المفردات', icon: '🌐' },
  { id: 'أسماء', name: 'الأسماء (Nouns)', icon: '📦', color: '#0284c7' },
  { id: 'أفعال', name: 'الأفعال (Verbs)', icon: '🏃', color: '#16a34a' },
  { id: 'صفات', name: 'الصفات (Adjectives)', icon: '✨', color: '#d97706' },
  { id: 'مفاهيم', name: 'المفاهيم التجريدية (Concepts)', icon: '💡', color: '#7c3aed' },
];

export const PPVT5_SETS = [
  {
    setId: 1,
    name: 'المجموعة الأولى (سن 2.5 - 3 سنوات)',
    items: [
      { id: 1, word: 'قطة', targetPic: 1, pics: ['🐈', '🐕', '🐦', '🐟'], type: 'أسماء', example: 'حيوان أليف يمواء وله شوارب' },
      { id: 2, word: 'موزة', targetPic: 2, pics: ['🍎', '🍌', '🍇', '🍊'], type: 'أسماء', example: 'فاكهة صفراء يحبها القرد' },
      { id: 3, word: 'سرير', targetPic: 3, pics: ['🪑', '🚪', '🛏️', '🧸'], type: 'أسماء', example: 'أثاث ننام عليه في غرفة النوم' },
      { id: 4, word: 'سيارة', targetPic: 4, pics: ['🚲', '🚁', '🚢', '🚗'], type: 'أسماء', example: 'وسيلة مواصلات تسير على 4 عجلات في الشارع' },
      { id: 5, word: 'ملعقة', targetPic: 1, pics: ['🥄', '🍴', '🥛', '🍽️'], type: 'أسماء', example: 'أداة نأكل بها الشوربة والطعام' },
      { id: 6, word: 'كلب', targetPic: 2, pics: ['🐈', '🐕', '🐎', '🐫'], type: 'أسماء', example: 'حيوان ينبح ويحرس المنزل' },
      { id: 7, word: 'مفتاح', targetPic: 3, pics: ['🔒', '🚪', '🔑', '🪟'], type: 'أسماء', example: 'أداة معدنية نفتح بها الباب' },
      { id: 8, word: 'حذاء', targetPic: 4, pics: ['👕', '👖', '🧦', '👟'], type: 'أسماء', example: 'نرتديه في أقدامنا عند الخروج' },
      { id: 9, word: 'قبعة', targetPic: 1, pics: ['🧢', '🕶️', '🧣', '🧤'], type: 'أسماء', example: 'نضعها على الرأس للحماية من الشمس' },
      { id: 10, word: 'كوب', targetPic: 2, pics: ['🍽️', '🥛', '🥣', '🏺'], type: 'أسماء', example: 'وعاء نشرب به الماء والعصير' },
      { id: 11, word: 'ليمون', targetPic: 3, pics: ['🍏', '🍓', '🍋', '🍒'], type: 'أسماء', example: 'فاكهة حمضية صفراء ذات طعم حامض' },
      { id: 12, word: 'بالون', targetPic: 4, pics: ['⚽', '🪁', '🧸', '🎈'], type: 'أسماء', example: 'لعبة مطاطية ملونة منفوخة بالهواء' }
    ]
  },
  {
    setId: 2,
    name: 'المجموعة الثانية (سن 4 - 5 سنوات)',
    items: [
      { id: 13, word: 'كتاب', targetPic: 1, pics: ['📖', '✏️', '🎨', '🎒'], type: 'أسماء', example: 'يحتوي على صفحات نقرأها ونتعلم منها' },
      { id: 14, word: 'تفاحة', targetPic: 2, pics: ['🍌', '🍎', '🍐', '🍉'], type: 'أسماء', example: 'فاكهة حمراء أو خضراء لذيذة ومفيدة' },
      { id: 15, word: 'شجرة', targetPic: 3, pics: ['🌸', '🌱', '🌳', '🍂'], type: 'أسماء', example: 'نبات كبير له جذع وأوراق خضراء وظل' },
      { id: 16, word: 'طائرة', targetPic: 4, pics: ['🚗', '🚆', '🚢', '✈️'], type: 'أسماء', example: 'مركبة تطير في السماء وتنقل الركاب' },
      { id: 17, word: 'يركض', targetPic: 1, pics: ['🏃', '🚶', '🧘', '🛌'], type: 'أفعال', example: 'يجري بسرعة عالية باستخدام قدميه' },
      { id: 18, word: 'يبكي', targetPic: 2, pics: ['😀', '😢', '😡', '😱'], type: 'أفعال', example: 'تنزل دموع من عينيه عند الحزن أو الألم' },
      { id: 19, word: 'بارد', targetPic: 3, pics: ['☀️', '🔥', '❄️', '☁️'], type: 'صفات', example: 'عكس حار، مثل الثلج والآيس كريم' },
      { id: 20, word: 'نائم', targetPic: 4, pics: ['🤸', '🏋️', '🚴', '🛌'], type: 'أفعال', example: 'مستلقٍ ومغمض العينين في فترة الراحة' },
      { id: 21, word: 'فرشاة', targetPic: 1, pics: ['🪥', '🧼', '🧴', '🧻'], type: 'أسماء', example: 'نستخدمها لتنظيف الأسنان أو الشعر' },
      { id: 22, word: 'كرسي', targetPic: 2, pics: ['🛏️', '🪑', '🚪', '🪟'], type: 'أسماء', example: 'أثاث له أرجل وظهر نجلس عليه' },
      { id: 23, word: 'حمامة', targetPic: 3, pics: ['🦋', '🐝', '🕊️', '🦉'], type: 'أسماء', example: 'طائر أليف أبيض أو رمادي يرمز للسلام' },
      { id: 24, word: 'خروف', targetPic: 4, pics: ['🐄', '🐎', '🦁', '🐏'], type: 'أسماء', example: 'حيوان أليف يغطيه الصوف ويقول ماء' }
    ]
  },
  {
    setId: 3,
    name: 'المجموعة الثالثة (سن 6 - 7 سنوات)',
    items: [
      { id: 25, word: 'طبيب', targetPic: 1, pics: ['🧑‍⚕️', '🧑‍🏫', '🧑‍🍳', '🧑‍🚒'], type: 'أسماء', example: 'يعالج المرضى في المستشفى ويكتب الدواء' },
      { id: 26, word: 'يسبح', targetPic: 2, pics: ['🏃', '🏊', '🚴', '🤸'], type: 'أفعال', example: 'يتحرك في الماء باستخدام يديه وقدميه' },
      { id: 27, word: 'حزين', targetPic: 3, pics: ['😊', '🤩', '😔', '🤪'], type: 'صفات', example: 'شعور بالضيق والأسى عكس الفرح' },
      { id: 28, word: 'كبير', targetPic: 4, pics: ['🐜', '🐭', '🐱', '🐘'], type: 'صفات', example: 'ضخم الحجم مثل الفيل مقارنة بالنملة' },
      { id: 29, word: 'قطار', targetPic: 1, pics: ['🚆', '🚗', '🚲', '🛹'], type: 'أسماء', example: 'مركبة طويلة تسير على قضبان سكة حديدية' },
      { id: 30, word: 'مقص', targetPic: 2, pics: ['✏️', '✂️', '📏', '📎'], type: 'أسماء', example: 'أداة حادة لها شفرتان لقص الورق والقماش' },
      { id: 31, word: 'مظلة', targetPic: 3, pics: ['🎒', '👓', '☂️', '🧢'], type: 'أسماء', example: 'تحمينا من المطر وحرارة أشعة الشمس' },
      { id: 32, word: 'نافذة', targetPic: 4, pics: ['🧱', '🚪', '🪜', '🪟'], type: 'أسماء', example: 'فتحة في الجدار تسمح بمرور الضوء والهواء' },
      { id: 33, word: 'جبل', targetPic: 1, pics: ['🏔️', '🏖️', '🌳', '🏜️'], type: 'أسماء', example: 'كتلة صخرية مرتفعة جداً عن سطح الأرض' },
      { id: 34, word: 'يطبخ', targetPic: 2, pics: ['🧹', '🍳', '🧺', '🪡'], type: 'أفعال', example: 'يعد الطعام والوجبات على الموقد' },
      { id: 35, word: 'سكين', targetPic: 3, pics: ['🥄', '🍴', '🔪', '🥣'], type: 'أسماء', example: 'أداة حادة لتقطيع الخضار واللحم' },
      { id: 36, word: 'زرافة', targetPic: 4, pics: ['🐘', '🦁', '🐒', '🦒'], type: 'أسماء', example: 'حيوان طويل القامة برقبة ممتدة وبقع بنية' }
    ]
  },
  {
    setId: 4,
    name: 'المجموعة الرابعة (سن 8 - 9 سنوات)',
    items: [
      { id: 37, word: 'خياط', targetPic: 1, pics: ['🪡', '🪵', '🔨', '🍞'], type: 'أسماء', example: 'حرفي يصنع ويصلح الملابس بالأقمشة والإبرة' },
      { id: 38, word: 'يغوص', targetPic: 2, pics: ['🧗', '🤿', '🏄', '🚣'], type: 'أفعال', example: 'ينزل إلى أعماق البحر مرتدياً قناع التنفس' },
      { id: 39, word: 'سعيد', targetPic: 3, pics: ['😠', '😱', '😊', '😴'], type: 'صفات', example: 'يشعر بالبهجة والسرور والابتسامة' },
      { id: 40, word: 'قلعة', targetPic: 4, pics: ['⛺', '🏠', '🏢', '🏰'], type: 'أسماء', example: 'بناء قديم محصن بأبراج وجدران قوية' },
      { id: 41, word: 'صحراء', targetPic: 1, pics: ['🏜️', '🏞️', '🌊', '❄️'], type: 'أسماء', example: 'أرض رملية واسعة جافة قليلة الأمطار والنبات' },
      { id: 42, word: 'غزال', targetPic: 2, pics: ['🐫', '🦌', '🦁', '🐻'], type: 'أسماء', example: 'حيوان بري رشيق وسريع بقرون مميزة' },
      { id: 43, word: 'مجهر', targetPic: 3, pics: ['🔭', '📷', '🔬', '👓'], type: 'أسماء', example: 'جهاز بصري لتكبير الكائنات الدقيقة جداً' },
      { id: 44, word: 'شلال', targetPic: 4, pics: ['🏞️', '🏖️', '🏜️', '🌊'], type: 'أسماء', example: 'سقوط المياه المتدفقة من مكان مرتفع' },
      { id: 45, word: 'شراع', targetPic: 1, pics: ['⛵', '⚓', '🚢', '🚣'], type: 'أسماء', example: 'قطعة قماش كبيرة تدفع السفينة بفعل الرياح' },
      { id: 46, word: 'سحابة', targetPic: 2, pics: ['☀️', '☁️', '🌙', '🌟'], type: 'أسماء', example: 'تجمع بخار الماء في السماء ينتج المطر' },
      { id: 47, word: 'خيمة', targetPic: 3, pics: ['🏠', '🏢', '⛺', '🏰'], type: 'أسماء', example: 'مسكن مؤقت من القماش يستخدم في التخييم' },
      { id: 48, word: 'ميزان', targetPic: 4, pics: ['⏰', '📏', '🧭', '⚖️'], type: 'أسماء', example: 'أداة لقياس كتل وأوزان الأشياء' }
    ]
  },
  {
    setId: 5,
    name: 'المجموعة الخامسة (سن 10 - 11 سنة)',
    items: [
      { id: 49, word: 'هندسة', targetPic: 1, pics: ['📐', '🎨', '🎻', '🍳'], type: 'أسماء', example: 'علم تصميم وبناء الآلات والمباني بالأدوات الهندسية' },
      { id: 50, word: 'يتأمل', targetPic: 2, pics: ['🏃', '🧘', '🧗', '🏊'], type: 'أفعال', example: 'يفكر بعمق وهدوء واسترخاء ذهني' },
      { id: 51, word: 'دافئ', targetPic: 3, pics: ['❄️', '🔥', '☕', '🍉'], type: 'صفات', example: 'حرارة معتدلة مريحة كفنجان الشاي في الشتاء' },
      { id: 52, word: 'مصنع', targetPic: 4, pics: ['🏠', '🏫', '🏥', '🏭'], type: 'أسماء', example: 'منشأة صناعية لإنتاج السلع بالآلات والعمال' },
      { id: 53, word: 'غواصة', targetPic: 1, pics: ['🤿', '🚢', '✈️', '🚆'], type: 'أسماء', example: 'سفينة خاصة تبحر وتعمل تحت سطح الماء' },
      { id: 54, word: 'بوصلة', targetPic: 2, pics: ['⚖️', '🧭', '📏', '⏰'], type: 'أسماء', example: 'أداة ملاحة بإبرة مغناطيسية لتحديد الشمال والجهات' },
      { id: 55, word: 'تمثال', targetPic: 3, pics: ['🖼️', '📚', '🗿', '🏺'], type: 'أسماء', example: 'مجسم منحوت من الحجر أو البرونز يمثل شخصاً أو رمزاً' },
      { id: 56, word: 'بركان', targetPic: 4, pics: ['🌊', '🌪️', '❄️', '🌋'], type: 'أسماء', example: 'جبل يقذف الحمم البركانية والغازات الحارة' },
      { id: 57, word: 'قشرة', targetPic: 1, pics: ['🥚', '🍎', '🍞', '🥛'], type: 'أسماء', example: 'الطبقة الخارجية الصلبة المغلفة للبيضة أو الفاكهة' },
      { id: 58, word: 'منارة', targetPic: 2, pics: ['🏰', '🗼', '🏠', '🏢'], type: 'أسماء', example: 'برج بضوء قوي على الساحل لإرشاد السفن ليلاً' },
      { id: 59, word: 'عاصفة', targetPic: 3, pics: ['☀️', '☁️', '🌪️', '🌧️'], type: 'أسماء', example: 'رياح شديدة مصحوبة بغبار أو أمطار ورعود' },
      { id: 60, word: 'وقود', targetPic: 4, pics: ['💧', '🪵', '🔋', '⛽'], type: 'أسماء', example: 'مادة كالبنزين تزود المحركات بالطاقة والحركة' }
    ]
  },
  {
    setId: 6,
    name: 'المجموعة السادسة (سن 12 - 13 سنة)',
    items: [
      { id: 61, word: 'تخييم', targetPic: 1, pics: ['🏕️', '🏢', '🏛️', '⛪'], type: 'أفعال', example: 'الإقامة في الخيام في الطبيعة البرية للمغامرة' },
      { id: 62, word: 'فلكي', targetPic: 2, pics: ['🩺', '🔭', '🧪', '⚖️'], type: 'أسماء', example: 'عالم يدرس النجوم والكواكب والفضاء بالتلسكوب' },
      { id: 63, word: 'متوتر', targetPic: 3, pics: ['😊', '😴', '😰', '🤪'], type: 'صفات', example: 'يشعر بالقلق والضغط النفسي والاضطراب' },
      { id: 64, word: 'مختبر', targetPic: 4, pics: ['🏫', '🏥', '🏭', '🧪'], type: 'أسماء', example: 'مكان مجهز بالأدوات الكيميائية لإجراء التجارب العلمية' },
      { id: 65, word: 'ناطحة سحاب', targetPic: 1, pics: ['🏢', '🏠', '⛺', '🛖'], type: 'أسماء', example: 'مبنى شاهق الارتفاع يتكون من عشرات الطوابق' },
      { id: 66, word: 'جراحة', targetPic: 2, pics: ['🩺', '🔪', '💊', '🩹'], type: 'أسماء', example: 'عملية طبية دقيقة لعلاج الأمراض داخل الجسم' },
      { id: 67, word: 'كسوف', targetPic: 3, pics: ['☀️', '🌕', '🌘', '☄️'], type: 'أسماء', example: 'ظاهرة فلكية حين يحجب القمر ضوء الشمس نهاراً' },
      { id: 68, word: 'زلزال', targetPic: 4, pics: ['🌋', '🌪️', '🌊', '🏚️'], type: 'أسماء', example: 'اهتزاز مفاجئ وسريع لطبقات القشرة الأرضية' },
      { id: 69, word: 'مخطوطة', targetPic: 1, pics: ['📜', '📖', '💻', '📓'], type: 'أسماء', example: 'وثيقة تاريخية قديمة مكتوبة بخط اليد' },
      { id: 70, word: 'متحف', targetPic: 2, pics: ['🏢', '🏛️', '🏫', '🏥'], type: 'أسماء', example: 'مبنى لعرض وحفظ الآثار والتحف التاريخية والفنية' },
      { id: 71, word: 'ركود', targetPic: 3, pics: ['🏃', '🚴', '🛑', '🌪️'], type: 'صفات', example: 'حالة من الجمود وتوقف الحركة أو النشاط الاقتصادي' },
      { id: 72, word: 'طاقة', targetPic: 4, pics: ['💧', '🪵', '🍃', '⚡'], type: 'أسماء', example: 'القدرة على إنجاز الشغل مثل الكهرباء والحرارة' }
    ]
  },
  {
    setId: 7,
    name: 'المجموعة السابعة (سن 14 - 15 سنة)',
    items: [
      { id: 73, word: 'ابتكار', targetPic: 1, pics: ['💡', '📂', '🗄️', '🧱'], type: 'مفاهيم', example: 'إبداع فكرة أو اختراع جديد لم يكن موجوداً من قبل' },
      { id: 74, word: 'فلسفة', targetPic: 2, pics: ['🔬', '🧠', '🩺', '🎨'], type: 'مفاهيم', example: 'دراسة التفكير والوجود والمعرفة والحكمة العميقة' },
      { id: 75, word: 'غامض', targetPic: 3, pics: ['☀️', '📖', '❓', '📦'], type: 'صفات', example: 'شيء مبهم غير واضح ويصعب فهمه بسهولة' },
      { id: 76, word: 'معيار', targetPic: 4, pics: ['⏰', '🗺️', '⚖️', '📏'], type: 'مفاهيم', example: 'مقياس ونموذج معتمد للحكم على الجودة والدقة' },
      { id: 77, word: 'استقرار', targetPic: 1, pics: ['⚖️', '🌊', '🌪️', '📉'], type: 'صفات', example: 'ثبات وتوازن وهدوء بعيداً عن التقلبات' },
      { id: 78, word: 'حضارة', targetPic: 2, pics: ['🏕️', '🏛️', '🛖', '🛤️'], type: 'مفاهيم', example: 'نتاج التطور الثقافي والعمراني والفكري لأمة من الأمم' },
      { id: 79, word: 'ذرة', targetPic: 3, pics: ['🍎', '💧', '⚛️', '🏔️'], type: 'أسماء', example: 'أصغر وحدة بنائية للمادة تتكون من نواة وإلكترونات' },
      { id: 80, word: 'عدالة', targetPic: 4, pics: ['🔨', '👮', '📜', '⚖️'], type: 'مفاهيم', example: 'إعطاء كل ذي حق حقه ومبدأ الإنصاف والمساواة' },
      { id: 81, word: 'تطور', targetPic: 1, pics: ['📈', '📉', '🔄', '🛑'], type: 'مفاهيم', example: 'نمو وتغير تدريجي مستمر نحو الأفضل والأحدث' },
      { id: 82, word: 'جودة', targetPic: 2, pics: ['❌', '⭐', '🗑️', '📦'], type: 'صفات', example: 'درجة التميز والإتقان ومطابقة أعلى المواصفات' },
      { id: 83, word: 'تسامح', targetPic: 3, pics: ['😠', '⚔️', '🤝', '🚶'], type: 'مفاهيم', example: 'العفو وقبول الآخر والتعايش السلمي بود' },
      { id: 84, word: 'ريادة', targetPic: 4, pics: ['🚶', '👥', '🛡️', '🏆'], type: 'مفاهيم', example: 'السبق والقيادة في طرح المشروعات والأفكار الملهمة' }
    ]
  },
  {
    setId: 8,
    name: 'المجموعة الثامنة (سن 16 سنة فما فوق)',
    items: [
      { id: 85, word: 'اضطراب', targetPic: 1, pics: ['🌀', '⚖️', '🌱', '🛑'], type: 'مفاهيم', example: 'خلل واختلال في النظام الطبيعي أو النفسي' },
      { id: 86, word: 'تجريد', targetPic: 2, pics: ['📐', '🌌', '🧱', '🔨'], type: 'مفاهيم', example: 'فصل الفكرة النظرية عن الواقع المادي الملموس' },
      { id: 87, word: 'مرونة', targetPic: 3, pics: ['🪵', '💎', '〰️', '🧱'], type: 'صفات', example: 'القدرة على التكيف والتجاوب مع المتغيرات بسهولة' },
      { id: 88, word: 'توازن', targetPic: 4, pics: ['📉', '🌊', '🧗', '⚖️'], type: 'مفاهيم', example: 'حالة التعادل والتكافؤ بين القوى المتضادة' },
      { id: 89, word: 'تضخم', targetPic: 1, pics: ['🎈', '🐜', '📉', '💧'], type: 'مفاهيم', example: 'زيادة مستمرة وغير طبيعية في الحجم أو الأسعار' },
      { id: 90, word: 'نفوذ', targetPic: 2, pics: ['🚶', '👑', '🛡️', '🌾'], type: 'مفاهيم', example: 'القدرة على التأثير والسيطرة وفرض القرارات' },
      { id: 91, word: 'منطق', targetPic: 3, pics: ['🎨', '🎻', '🧩', '🧹'], type: 'مفاهيم', example: 'علم التفكير السليم القائم على الحجج والبراهين' },
      { id: 92, word: 'تحليل', targetPic: 4, pics: ['🧱', '📦', '🖼️', '📊'], type: 'أفعال', example: 'تفكيك الكل إلى أجزائه لدراسة العلاقات بينها' },
      { id: 93, word: 'كفاءة', targetPic: 1, pics: ['🎯', '🛑', '🗑️', '🌱'], type: 'مفاهيم', example: 'تحقيق أعلى النتائج بأقل مجهود وموارد ممكنة' },
      { id: 94, word: 'استدامة', targetPic: 2, pics: ['🍂', '♻️', '🔥', '💨'], type: 'مفاهيم', example: 'المحافظة على الموارد لضمان استمرارها للأجيال القادمة' },
      { id: 95, word: 'تكامل', targetPic: 3, pics: ['🧬', '⚔️', '🧩', '🏚️'], type: 'مفاهيم', example: 'اتحاد وتآزر الأجزاء لتكوين كل موحد متماسك' },
      { id: 96, word: 'وعي', targetPic: 4, pics: ['💤', '🛌', '🤪', '💡'], type: 'مفاهيم', example: 'الإدراك التام بالنفس والمحيط والمعارف' }
    ]
  }
];

// Flat list of all 96 items
export const PPVT5_ITEMS = PPVT5_SETS.flatMap(s =>
  s.items.map(it => ({
    ...it,
    setId: s.setId,
    setName: s.name,
  }))
);

/**
 * Identifies the recommended starting set according to chronological age.
 * @param {number} ageMonths - Chronological age in total months.
 */
export function getPPVT5StartSetByAge(ageMonths = 72) {
  if (ageMonths < 48) return 1;       // 2.5 to 3:11 -> Set 1
  if (ageMonths < 72) return 2;       // 4.0 to 5:11 -> Set 2
  if (ageMonths < 96) return 3;       // 6.0 to 7:11 -> Set 3
  if (ageMonths < 120) return 4;      // 8.0 to 9:11 -> Set 4
  if (ageMonths < 144) return 5;      // 10.0 to 11:11 -> Set 5
  if (ageMonths < 168) return 6;      // 12.0 to 13:11 -> Set 6
  if (ageMonths < 192) return 7;      // 14.0 to 15:11 -> Set 7
  return 8;                           // 16+ -> Set 8
}

/**
 * Comprehensive PPVT-5 Psychometric Analysis Engine
 * Calculates: Standard Score (SS), Percentile Rank (PR), Age Equivalent (AE), Basal/Ceiling sets,
 * Lexical Category breakdowns, and full clinical psychometric profiles.
 *
 * @param {Object|number} responsesOrRawScore - Results map or raw score integer.
 * @param {number} ageMonths - Chronological age in months.
 */
export function calculatePPVT5Psychometrics(responsesOrRawScore = {}, ageMonths = 72) {
  let responses = {};
  let directRaw = null;

  if (typeof responsesOrRawScore === 'number') {
    directRaw = responsesOrRawScore;
  } else if (responsesOrRawScore && typeof responsesOrRawScore === 'object') {
    responses = responsesOrRawScore;
  }

  const years = Math.max(2, Math.floor((ageMonths || 72) / 12));
  const remainingMonths = Math.max(0, (ageMonths || 72) % 12);
  const ageLabel = `${years} سنوات و ${remainingMonths} أشهر`;

  // Determine answered count and set statistics
  const answeredItemIds = Object.keys(responses).map(Number);
  const totalAnswered = directRaw !== null ? directRaw : answeredItemIds.length;

  // Track set results
  const setResults = PPVT5_SET_METADATA.map(setMeta => {
    const setItems = PPVT5_ITEMS.filter(it => it.setId === setMeta.id);
    let correctCount = 0;
    let errorCount = 0;
    let answeredInSet = 0;

    setItems.forEach(it => {
      const resp = responses[it.id];
      if (resp !== undefined) {
        answeredInSet++;
        if (resp === true || resp === 1 || resp === '1') {
          correctCount++;
        } else {
          errorCount++;
        }
      }
    });

    const isBasal = errorCount <= 1 && answeredInSet >= 8;
    const isCeiling = errorCount >= 6;

    return {
      ...setMeta,
      itemsTotal: setItems.length,
      answeredCount: answeredInSet,
      correctCount,
      errorCount,
      percentage: answeredInSet > 0 ? Math.round((correctCount / answeredInSet) * 100) : 0,
      isBasal,
      isCeiling,
    };
  });

  // Calculate Raw Score (Ceiling Item - Total Errors between Basal and Ceiling)
  let rawScore = 0;
  let basalSetId = 1;
  let ceilingSetId = 1;
  let totalErrors = 0;

  if (directRaw !== null) {
    rawScore = Math.max(0, Math.min(96, directRaw));
  } else if (answeredItemIds.length > 0) {
    // Find highest administered set
    const testedSets = setResults.filter(s => s.answeredCount > 0);
    if (testedSets.length > 0) {
      basalSetId = testedSets.find(s => s.isBasal)?.id || testedSets[0].id;
      ceilingSetId = [...testedSets].reverse().find(s => s.isCeiling)?.id || testedSets[testedSets.length - 1].id;
    }

    const ceilingItemNumber = ceilingSetId * 12;
    totalErrors = setResults.reduce((acc, s) => acc + s.errorCount, 0);
    rawScore = Math.max(0, Math.min(96, ceilingItemNumber - totalErrors));
  }

  // Standard Score Estimation
  let expectedRaw = 10;
  if (ageMonths < 48) expectedRaw = 10 + (ageMonths - 30) * 0.3; // ages 2.5-4
  else if (ageMonths < 72) expectedRaw = 15 + (ageMonths - 48) * 0.5; // ages 4-6
  else if (ageMonths < 96) expectedRaw = 27 + (ageMonths - 72) * 0.5; // ages 6-8
  else if (ageMonths < 120) expectedRaw = 39 + (ageMonths - 96) * 0.5; // ages 8-10
  else if (ageMonths < 144) expectedRaw = 51 + (ageMonths - 120) * 0.5; // ages 10-12
  else if (ageMonths < 168) expectedRaw = 63 + (ageMonths - 144) * 0.4; // ages 12-14
  else if (ageMonths < 192) expectedRaw = 72 + (ageMonths - 168) * 0.3; // ages 14-16
  else expectedRaw = 80 + Math.min(12, (ageMonths - 192) * 0.1); // ages 16+

  expectedRaw = Math.round(expectedRaw);
  const diff = rawScore - expectedRaw;
  const sd = 10;
  let standardScore = Math.round(100 + (diff / sd) * 15);
  standardScore = Math.max(40, Math.min(160, standardScore));

  // Percentile Rank
  let percentile = 50;
  if (standardScore >= 130) percentile = 98;
  else if (standardScore >= 120) percentile = 91;
  else if (standardScore >= 115) percentile = 84;
  else if (standardScore >= 110) percentile = 75;
  else if (standardScore >= 105) percentile = 63;
  else if (standardScore >= 100) percentile = 50;
  else if (standardScore >= 95) percentile = 37;
  else if (standardScore >= 90) percentile = 25;
  else if (standardScore >= 85) percentile = 16;
  else if (standardScore >= 80) percentile = 9;
  else if (standardScore >= 75) percentile = 5;
  else if (standardScore >= 70) percentile = 2;
  else percentile = 1;

  // Age Equivalent (AE)
  let estAgeMonths = 30;
  if (rawScore <= 10) estAgeMonths = 30;
  else if (rawScore <= 15) estAgeMonths = 30 + ((rawScore - 10) / 5) * 18;
  else if (rawScore <= 27) estAgeMonths = 48 + ((rawScore - 15) / 12) * 24;
  else if (rawScore <= 39) estAgeMonths = 72 + ((rawScore - 27) / 12) * 24;
  else if (rawScore <= 51) estAgeMonths = 96 + ((rawScore - 39) / 12) * 24;
  else if (rawScore <= 63) estAgeMonths = 120 + ((rawScore - 51) / 12) * 24;
  else if (rawScore <= 72) estAgeMonths = 144 + ((rawScore - 63) / 9) * 24;
  else if (rawScore <= 80) estAgeMonths = 168 + ((rawScore - 72) / 8) * 24;
  else estAgeMonths = 192 + (rawScore - 80) * 12;

  const estYears = Math.floor(estAgeMonths / 12);
  const estMonths = Math.round(estAgeMonths % 12);
  const ageEquivalentLabel = `${estYears} سنوات و ${estMonths} أشهر`;
  const ageDiffMonths = Math.round((years * 12 + remainingMonths) - estAgeMonths);

  // Diagnostic level and severity
  let level = 'متوسط طبيعي (Average Vocabulary)';
  let severityColor = '#059669';
  let severityKey = 'normal';
  let severityClass = 'b-gr';

  if (standardScore >= 115) {
    level = 'فوق المتوسط مرتفع (Above Average / High)';
    severityColor = '#0284c7';
    severityKey = 'high';
    severityClass = 'b-bl';
  } else if (standardScore >= 86) {
    level = 'متوسط طبيعي (Average Vocabulary)';
    severityColor = '#059669';
    severityKey = 'normal';
    severityClass = 'b-gr';
  } else if (standardScore >= 78) {
    level = 'تأخر لغوي بسيط (Mild Receptive Delay)';
    severityColor = '#0284c7';
    severityKey = 'mild';
    severityClass = 'b-bl';
  } else if (standardScore >= 70) {
    level = 'تأخر لغوي متوسط (Moderate Receptive Delay)';
    severityColor = '#d97706';
    severityKey = 'moderate';
    severityClass = 'b-or';
  } else {
    level = 'تأخر لغوي شديد (Severe Receptive Delay)';
    severityColor = '#dc2626';
    severityKey = 'severe';
    severityClass = 'b-rd';
  }

  // Lexical categories analysis (Nouns, Verbs, Adjectives, Concepts)
  const categoryKeys = ['أسماء', 'أفعال', 'صفات', 'مفاهيم'];
  const categoryResults = categoryKeys.map(catName => {
    const catItems = PPVT5_ITEMS.filter(it => it.type === catName);
    let catCorrect = 0;
    let catAnswered = 0;

    catItems.forEach(it => {
      const resp = responses[it.id];
      if (resp !== undefined) {
        catAnswered++;
        if (resp === true || resp === 1 || resp === '1') catCorrect++;
      }
    });

    const catPercent = catAnswered > 0 ? Math.round((catCorrect / catAnswered) * 100) : 0;
    let catStatus = 'طبيعي';
    let catColor = '#059669';
    if (catPercent < 50) {
      catStatus = 'قصور ملحوظ';
      catColor = '#dc2626';
    } else if (catPercent < 75) {
      catStatus = 'متوسط منخفض';
      catColor = '#d97706';
    } else if (catPercent >= 90) {
      catStatus = 'نقطة قوة متقدمة';
      catColor = '#0284c7';
    }

    return {
      name: catName,
      totalItems: catItems.length,
      answeredCount: catAnswered,
      correctCount: catCorrect,
      errorCount: catAnswered - catCorrect,
      percentage: catPercent,
      status: catStatus,
      color: catColor,
    };
  });

  const deficitCategories = categoryResults.filter(c => c.percentage < 65 && c.answeredCount > 0);
  const strengthCategories = categoryResults.filter(c => c.percentage >= 80 && c.answeredCount > 0);

  const completionPercentage = Math.round((totalAnswered / PPVT5_ITEMS.length) * 100);

  // Clinical Summary
  let clinicalImpression = '';
  if (severityKey === 'high' || severityKey === 'normal') {
    clinicalImpression = `أظهرت نتائج تطبيق مقياس بيبودي للمفردات المصورة (PPVT-5) أداءً متوافقاً مع الفئة العمرية الزمنية. \nبلغت الدرجة المعيارية [${standardScore}] برتبة مئينية [${percentile}%] ودرجة خام [${rawScore}/96]. \nيقدر العمر اللغوي الاستقبالي بـ [${ageEquivalentLabel}] مقارنة بالعمر الزمني الفعلي [${ageLabel}]. الحصيلة اللفظية الاستقبالية ضمن الحدود النمائية المستقرة.`;
  } else {
    clinicalImpression = `أظهرت نتائج تقييم مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5) وجود فجوة دلالية بين العمر الزمني واللغوي. \nحقّق المفحوص درجة معيارية قدرها [${standardScore}] مصنفة كـ [${level}]، ورتبة مئينية [${percentile}%] مع درجة خام [${rawScore}/96]. \nيقدر العمر اللغوي الاستقبالي بـ [${ageEquivalentLabel}] مما يمثل فارقاً وتأخراً قدره [${Math.max(0, ageDiffMonths)} شهراً] مقارنة بعمره الزمني [${ageLabel}].`;
  }

  // IEP Recommendations
  let recommendations = '';
  if (severityKey === 'normal' || severityKey === 'high') {
    recommendations = `1. الاستمرار في إثراء الحصيلة اللغوية عبر القراءة التفاعلية وتوسيع معجم المفردات التجريدية.\n2. تشجيع مهارات التعبير السردي واستخدام المفردات في سياقات لغوية متنوعة.\n3. تعزيز المفاهيم والروابط الدلالية في الأنشطة المدرسية واليومية.`;
  } else if (severityKey === 'mild') {
    recommendations = `1. تدريب المفحوص على المجموعات الضمنية وتسمية وتحديد المفردات المستهدفة عبر الصور المجسمة والبطاقات.\n2. التركيز على الأفعال والصفات الشائعة وربطها بالبيئة المباشرة.\n3. تطبيق استراتيجيات التوسيع اللغوي والنمذجة اللفظية المباشرة بمعدل 2-3 جلسات أسبوعياً.\n4. إشراك الأسرة في برامج التعزيز المنزلي لتثبيت المفردات الجديدة.`;
  } else if (severityKey === 'moderate') {
    recommendations = `1. إلحاق الطفل ببرنامج تخاطب وتأهيل لغوي فردي مكثف بمعدل (3-4 جلسات أسبوعياً).\n2. صياغة أهداف خطة تربوية فردية (IEP) تركز على تمييز وتحديد مفردات المجموعات الدلالية ذات الأولوية.\n3. استخدام الوسائل البصرية الملموسة والتلقين المتدرج (جسدي، إيمائي، لفظي).\n4. تدريب المفحوص على تصنيف الأشياء وفق الوظيفة والسمات.\n5. مواءمة التواصل الصفي والأسري باستخدام لغة مبسطة وجمل قصيرة مدعومة بالصور.`;
  } else {
    recommendations = `1. وضع برنامج تدخل لغوي مكثف متعدد التخصصات وتصميم خطة فردية شاملة (Intensive IEP).\n2. تدريب المفحوص على مطابقة وتحديد المفردات الأساسية (الأسماء والأفعال الحياتية) عبر المجسمات الحقيقية ثم الصور.\n3. استخدام استراتيجيات التواصل المعزز والبديل (AAC) ونظام بيكس (PECS) لدعم الفهم الدلالي.\n4. تجزئة المفردات المستهدفة إلى خطوات صغيرة متسلسلة مع تعزيز فوري ومستمر.\n5. إرشاد أسري منتظم لتطبيق روتين لغوي يومي محفز داخل المنزل.`;
  }

  return {
    rawScore,
    standardScore,
    percentile,
    ageEquivalentLabel,
    expectedRaw,
    level,
    severityColor,
    severityKey,
    severityClass,
    clinicalImpression,
    recommendations,
    ageLabel,
    years,
    remainingMonths,
    ageDiffMonths,
    totalAnswered,
    totalItems: PPVT5_ITEMS.length,
    completionPercentage,
    basalSetId,
    ceilingSetId,
    totalErrors,
    setResults,
    categoryResults,
    deficitCategories,
    strengthCategories,
  };
}
