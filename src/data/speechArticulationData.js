/**
 * سجل فحص وتقييم النطق واللغة والتواصل وعضلات الفم الشامل
 * Clinical Speech, Language, Oral-Motor & Communication Diagnostic Datasets and Calculation Engine.
 */

// 1. بروتوكول فحص آلية الفم والنطق (Oral Mechanism Examination - OME)
export const SPEECH_ORAL_MOTOR_ITEMS = [
  {
    id: 'lips',
    name: 'الشفتان (Lips)',
    category: 'ome',
    description: 'القدرة على ضم الشفاه، التبسم، الزم، حركة النفخ، وسلامة الإطباق والتركيب التشريحي.',
    options: [
      { value: 3, label: 'سليم/طبيعي كلياً' },
      { value: 2, label: 'قصور بسيط (ضعف طفيف في الحركة أو النفخ)' },
      { value: 1, label: 'قصور متوسط (ضعف إطباق الشفتين وتسرب هواء طفيف)' },
      { value: 0, label: 'قصور شديد (عدم القدرة على الإطباق أو الزم أو شق شفة)' }
    ]
  },
  {
    id: 'tongue',
    name: 'اللسان (Tongue)',
    category: 'ome',
    description: 'القدرة على الإخراج للأمام، تحريك للأعلى والأسفل والجانبين، وسلامة رابط اللسان (Frenulum).',
    options: [
      { value: 3, label: 'حركة سليمة وحرة ولا يوجد رابط لسان' },
      { value: 2, label: 'قصور حركي بسيط أو وجود رابط لسان طفيف لا يعيق النطق' },
      { value: 1, label: 'قصور حركي متوسط (صعوبة رفع اللسان أو رابط لسان واضح)' },
      { value: 0, label: 'رابط لسان تام (لسان مربوط كلياً) أو عجز حركي تام' }
    ]
  },
  {
    id: 'jaw_masseter',
    name: 'عضلات الفك السفلي (Jaw & Masseter Muscles)',
    category: 'ome',
    description: 'مدى فتح وإغلاق الفك، الحركة الجانبية، قوة العض، وثبات الفك أثناء نطق الكلمات.',
    options: [
      { value: 3, label: 'حركة فك حرة وسليمة وقوة عض طبيعية' },
      { value: 2, label: 'ضعف طفيف في ثبات الفك السفلي أثناء النطق السريع' },
      { value: 1, label: 'ضعف متوسط في العض مع انحراف جانبي طفيف عند الفتح' },
      { value: 0, label: 'ارتخاء تام في الفك، صعوبة بالغة في الإغلاق أو شلل حركي' }
    ]
  },
  {
    id: 'palate_velum',
    name: 'سقف الحلق واللهاة (Hard & Soft Palate / Uvula)',
    category: 'ome',
    description: 'سلامة الحنك الصلب، الحنك اللين، حركة شراع الحنك واللهاة عند نطق الأصوات وتجنب تسرب الهواء للأنف.',
    options: [
      { value: 3, label: 'حنك سليم وشراع مرن ومتحرك كلياً عند نطق (/آ/)' },
      { value: 2, label: 'حنك سليم مع خمول نسبي طفيف في حركة الشراع' },
      { value: 1, label: 'شق حنك تم إصلاحه جراحياً مع ضعف نسبي في الصمام الأنفي البلعومي' },
      { value: 0, label: 'وجود شق حنك نشط (Cleft Palate) أو شلل تام في شراع الحنك واللهاة' }
    ]
  },
  {
    id: 'teeth_jaw',
    name: 'الأسنان والإطباق (Dental Occlusion)',
    category: 'ome',
    description: 'إطباق الفكين السليم ونمط الإطباق (Normal, Overbite, Underbite, Open Bite) وجود أسنان مفقودة تعيق نطق الأصوات الاحتكاكية والأسنانية.',
    options: [
      { value: 3, label: 'إطباق سليم وأسنان طبيعية متراصة' },
      { value: 2, label: 'سوء إطباق طفيف (تباعد أسنان بسيط) لا يعيق الأصوات' },
      { value: 1, label: 'سوء إطباق متوسط (عضة مفتوحة Open Bite أو بروز Overbite)' },
      { value: 0, label: 'تشوه هيكلي حاد بالفكين أو فقدان واسع للأسنان الأمامية' }
    ]
  },
  {
    id: 'drooling',
    name: 'التحكم في اللعاب (Drooling Score)',
    category: 'ome',
    description: 'قياس درجة سيلان اللعاب إكلينيكياً ومدى الوعي الحسي للبلع التلقائي للعاب.',
    options: [
      { value: 3, label: 'تحكم طبيعي كلياً وخلو تام من سيلان اللعاب' },
      { value: 2, label: 'سيلان طفيف متباعد (خاصة عند التعب أو التركيز الشديد)' },
      { value: 1, label: 'سيلان لعاب مستمر وبسيط يبلل الشفتين والذقن أحياناً' },
      { value: 0, label: 'سيلان لعاب حاد ومستمر يبلل الملابس بشكل متكرر' }
    ]
  }
];

// 2. بروتوكول تقييم مهارات البلع والمضغ (Pediatric Feeding & Swallowing Protocol)
export const FEEDING_SWALLOWING_ITEMS = [
  {
    id: 'solid_food',
    name: 'مضغ وتناول الأطعمة الصلبة (Solid Foods)',
    description: 'القدرة على قضم ومضغ الطعام الصلب (كالبسكويت أو التفاح) بحركة طحن دائرية للفك.',
    options: [
      { value: 3, label: 'مضغ طبيعي وبحركة دائرية سليمة للفكين' },
      { value: 2, label: 'يمضغ الأطعمة الصلبة ببطء أو حركة فك رأسية فقط' },
      { value: 1, label: 'صعوبة في قضم وطحن الأطعمة الصلبة، يفضل اللينة' },
      { value: 0, label: 'يرفض تماماً أو لا يستطيع مضغ الأطعمة الصلبة (خطر الاختناق)' }
    ]
  },
  {
    id: 'semi_solid',
    name: 'بلع الأطعمة شبه الصلبة (Semi-Solid Foods)',
    description: 'تقييم بلع الأطعمة المهروسة (كالزبادي أو السيريلاك) وقدرة اللسان على دفع اللقمة للخلف.',
    options: [
      { value: 3, label: 'بلع سليم وفعال دون بقايا طعام' },
      { value: 2, label: 'صعوبة طفيفة في تجميع الطعام وبلعه ببطء' },
      { value: 1, label: 'بقاء بعض الأطعمة شبه الصلبة في الشدق أو سقف الحلق' },
      { value: 0, label: 'ارتجاع الطعام المهروس، غثيان أو عدم القدرة على البلع' }
    ]
  },
  {
    id: 'liquids',
    name: 'رشف وبلع السوائل (Liquids Swallowing)',
    description: 'رشف السوائل من الكوب أو الماصة مع الحفاظ على الإطباق الشفتي وتجنب انسكاب السائل.',
    options: [
      { value: 3, label: 'رشف وبلع سليم للسوائل دون أي انسكاب أو كحة' },
      { value: 2, label: 'انسكاب طفيف للسائل من جانبي الفم أثناء الشرب' },
      { value: 1, label: 'كحة أو شرقة متباعدة أثناء بلع السوائل المتدفقة' },
      { value: 0, label: 'شرقة حادة مستمرة عند الشرب أو عدم القدرة على رشف السوائل' }
    ]
  },
  {
    id: 'respiration_coordination',
    name: 'تنسيق التنفس مع البلع (Swallow-Respiration Coordination)',
    description: 'مدى التنسيق العصبي العضلي لتنظيم دورة التنفس مع البلع لمنع دخول الطعام للمجرى الهوائي.',
    options: [
      { value: 3, label: 'تنسيق ممتاز وطبيعي دون انقطاع نفس أو جهد' },
      { value: 2, label: 'يتنفس بتسارع طفيف بعد بلع السوائل' },
      { value: 1, label: 'انقطاع تتابع البلع لأخذ نفس عميق، ظهور تعب طفيف' },
      { value: 0, label: 'فقدان تام للتنسيق مما يسبب شرقة حادة وانقطاع نفس مستمر' }
    ]
  },
  {
    id: 'oral_residue',
    name: 'بقايا الطعام والشدق (Food Pocketing & Residue)',
    description: 'ملاحظة تخزين الطعام في جيوب الخد (الشدق) أو بقائه على اللسان بعد البلع.',
    options: [
      { value: 3, label: 'تنظيف ذاتي سليم للفم وخالٍ من بقايا الطعام' },
      { value: 2, label: 'بقايا طعام بسيطة جداً تزول بشرب الماء' },
      { value: 1, label: 'تخزين الطعام بشكل متكرر في الشدق (Pocketing) ويحتاج تنبيه لفظي' },
      { value: 0, label: 'تراكم دائم وجاف لبقايا الطعام دون وعي حسي بوجودها' }
    ]
  },
  {
    id: 'cough_reflex',
    name: 'الشرقة والكحة الإنعكاسية (Coughing & Choking Reflex)',
    description: 'استجابة الكحة الوقائية لطرد أي بقايا تقترب من الحنجرة ومجرى الهواء.',
    options: [
      { value: 3, label: 'منعكس كحة واقٍ وسليم عند الضرورة، ونادراً ما يشرق' },
      { value: 2, label: 'كحة عابرة متباعدة دون زرقان أو انقطاع نفس' },
      { value: 1, label: 'شرقة متكررة مع زرقان بسيط في الوجه أثناء الوجبات' },
      { value: 0, label: 'غياب منعكس الكحة الواقي (Silent Aspiration) أو غصة دائمة خانقة' }
    ]
  }
];

// 3. جدول فحص مخارج الحروف الـ 28 العربية (Phonetic & Articulation Matrix)
export const SPEECH_PHONETIC_ITEMS = [
  { id: 'let_hamza', letter: 'أ', name: 'الهمزة', type: 'حنجري', words: { first: 'أرنب', middle: 'كأس', last: 'قرأ' } },
  { id: 'let_baa', letter: 'ب', name: 'الباء', type: 'شفهي', words: { first: 'بيت', middle: 'جبل', last: 'كلب' } },
  { id: 'let_taa', letter: 'ت', name: 'التاء', type: 'لثوي أسناني', words: { first: 'تفاح', middle: 'كتاب', last: 'بيت' } },
  { id: 'let_thaa', letter: 'ث', name: 'الثاء', type: 'أسناني', words: { first: 'ثعلب', middle: 'مثلث', last: 'حرث' } },
  { id: 'let_jeem', letter: 'ج', name: 'الجيم', type: 'حنكي', words: { first: 'جمل', middle: 'شجرة', last: 'ثلج' } },
  { id: 'let_haa', letter: 'ح', name: 'الحاء', type: 'حلقي', words: { first: 'حليب', middle: 'لحم', last: 'ملح' } },
  { id: 'let_khaa', letter: 'خ', name: 'الخاء', type: 'طبقي', words: { first: 'خروف', middle: 'نخلة', last: 'بطيخ' } },
  { id: 'let_daal', letter: 'د', name: 'الدال', type: 'لثوي أسناني', words: { first: 'ديك', middle: 'مدرسة', last: 'أسد' } },
  { id: 'let_thaal', letter: 'ذ', name: 'الذال', type: 'أسناني', words: { first: 'ذئب', middle: 'حذاء', last: 'معاذ' } },
  { id: 'let_raa', letter: 'ر', name: 'الراء', type: 'لثوي تكراري', words: { first: 'رمان', middle: 'كرة', last: 'تمر' } },
  { id: 'let_zaay', letter: 'ز', name: 'الزاي', type: 'لثوي', words: { first: 'زرافة', middle: 'غزال', last: 'موز' } },
  { id: 'let_seen', letter: 'س', name: 'السين', type: 'لثوي', words: { first: 'سيارة', middle: 'مسبح', last: 'شمس' } },
  { id: 'let_sheen', letter: 'ش', name: 'الشين', type: 'حنكي', words: { first: 'شمس', middle: 'منشار', last: 'عش' } },
  { id: 'let_saad', letter: 'ص', name: 'الصاد', type: 'لثوي مفخم', words: { first: 'صقر', middle: 'عصفور', last: 'قفص' } },
  { id: 'let_daad', letter: 'ض', name: 'الضاد', type: 'لثوي أسناني مفخم', words: { first: 'ضفدع', middle: 'بيضة', last: 'مريض' } },
  { id: 'let_taa_m', letter: 'ط', name: 'الطاء', type: 'لثوي أسناني مفخم', words: { first: 'طائرة', middle: 'قطة', last: 'مشط' } },
  { id: 'let_zaa_m', letter: 'ظ', name: 'الظاء', type: 'أسناني مفخم', words: { first: 'ظرف', middle: 'مظلة', last: 'مستيقظ' } },
  { id: 'let_ayn', letter: 'ع', name: 'العين', type: 'حلقي', words: { first: 'عين', middle: 'ملعقة', last: 'إصبع' } },
  { id: 'let_ghayn', letter: 'غ', name: 'الغين', type: 'طبقي', words: { first: 'غزال', middle: 'ببغاء', last: 'صمغ' } },
  { id: 'let_faa', letter: 'ف', name: 'الفاء', type: 'أسناني شفهي', words: { first: 'فيل', middle: 'مفتاح', last: 'خروف' } },
  { id: 'let_qaaf', letter: 'ق', name: 'القاف', type: 'لهوي', words: { first: 'قلم', middle: 'ملعقة', last: 'أزرق' } },
  { id: 'let_kaaf', letter: 'ك', name: 'الكاف', type: 'طبقي', words: { first: 'كتاب', middle: 'مكتب', last: 'سمك' } },
  { id: 'let_laam', letter: 'ل', name: 'اللام', type: 'لثوي جانبية', words: { first: 'ليمون', middle: 'ملعقة', last: 'جبل' } },
  { id: 'let_meem', letter: 'م', name: 'الميم', type: 'شفهي أنفي', words: { first: 'موز', middle: 'قميص', last: 'قلم' } },
  { id: 'let_noon', letter: 'ن', name: 'النون', type: 'لثوي أنفي', words: { first: 'نمر', middle: 'عنب', last: 'تين' } },
  { id: 'let_haa_h', letter: 'هـ', name: 'الهاء', type: 'حنجري', words: { first: 'هلال', middle: 'فهد', last: 'وجه' } },
  { id: 'let_waw', letter: 'و', name: 'الواو', type: 'شفهي ممدود', words: { first: 'ولد', middle: 'دواء', last: 'دلو' } },
  { id: 'let_yaa_y', letter: 'ي', name: 'الياء', type: 'حنكي', words: { first: 'يد', middle: 'ليمون', last: 'كرسي' } }
];

// 4. استمارة رصد العمليات الفونولوجية (Phonological Processes Analysis)
export const PHONOLOGICAL_PROCESSES_ITEMS = [
  {
    id: 'fronting',
    name: 'تقديم الأصوات الخلفية (Fronting)',
    description: 'إبدال الأصوات الحلقية أو الطبقية بأصوات لثوية أمامية (مثل نطق ق ك -> ت د، مثل: قلم -> تلم، كتاب -> دتاب).',
    options: [
      { value: 0, label: 'لا يظهر العملية نهائياً (طبيعي)' },
      { value: 1, label: 'تظهر العملية نادراً كزلة لسان بسيطة' },
      { value: 2, label: 'تظهر العملية بشكل متكرر واضح (سلوك متوسط)' },
      { value: 3, label: 'تظهر العملية باستمرار في معظم الكلمات (سلوك شديد)' }
    ]
  },
  {
    id: 'backing',
    name: 'تأخير الأصوات الأمامية (Backing)',
    description: 'إبدال الأصوات الأمامية اللثوية أو الأسناني بأصوات خلفية حلقية/لهوية (مثل نطق ت د -> ك ق، مثل: تفاح -> كفاح).',
    options: [
      { value: 0, label: 'لا يظهر العملية نهائياً (طبيعي)' },
      { value: 1, label: 'تظهر العملية نادراً' },
      { value: 2, label: 'تظهر العملية بشكل متكرر واضح' },
      { value: 3, label: 'تظهر العملية باستمرار وبشدة' }
    ]
  },
  {
    id: 'stopping',
    name: 'تحويل الاحتكاكية لانفجارية (Stopping)',
    description: 'إبدال الحروف الاحتكاكية المستمرة بأصوات انفجارية حبسية (مثل نطق س ش ف -> ت د ب، مثل: سيارة -> تيارة، فيل -> بيل).',
    options: [
      { value: 0, label: 'لا يظهر العملية نهائياً (طبيعي)' },
      { value: 1, label: 'تظهر العملية نادراً' },
      { value: 2, label: 'تظهر العملية بشكل متكرر واضح' },
      { value: 3, label: 'تظهر العملية باستمرار وبشدة' }
    ]
  },
  {
    id: 'deaffrication',
    name: 'تبسيط الأصوات المزجية (Deaffrication)',
    description: 'تجريد الصوت المزجي كالجيم من صفته الإنفجارية لتنطق احتكاكية فقط كالشين أو الياء (مثل: جمل -> شمل أو يمل).',
    options: [
      { value: 0, label: 'لا يظهر العملية نهائياً (طبيعي)' },
      { value: 1, label: 'تظهر العملية نادراً' },
      { value: 2, label: 'تظهر العملية بشكل متكرر واضح' },
      { value: 3, label: 'تظهر العملية باستمرار وبشدة' }
    ]
  },
  {
    id: 'syllable_simplification',
    name: 'تبسيط البنية المقطعية (Syllable Simplification)',
    description: 'حذف مقطع صوتي غير منبور، أو حذف الساكن الأول في المقاطع المتتالية (مثل: طائرة -> طارة، منشار -> مشار).',
    options: [
      { value: 0, label: 'لا يظهر العملية نهائياً (طبيعي)' },
      { value: 1, label: 'تظهر العملية نادراً' },
      { value: 2, label: 'تظهر العملية بشكل متكرر واضح' },
      { value: 3, label: 'تظهر العملية باستمرار وبشدة' }
    ]
  }
];

// 5. بروتوكول فحص التلعثم والطلاقة السلوكية والثانوية (Stuttering & Fluency Checklist)
export const STUTTERING_FLUENCY_ITEMS = [
  {
    id: 'core_repetition',
    name: 'تكرار الأصوات والمقاطع (Syllable/Word Repetition)',
    type: 'core',
    description: 'تكرار مقاطع الكلمات أو أصوات الحروف (مثل: ب-ب-ب-باب، أنا أنا أريد).',
    options: [
      { value: 3, label: 'خالٍ تماماً من التكرارات المرضية' },
      { value: 2, label: 'تكرار طفيف متباعد طبيعي (أقل من 3% من الكلام التلقائي)' },
      { value: 1, label: 'تكرار متوسط ملحوظ ومشتت (بين 5% إلى 10% من الكلام)' },
      { value: 0, label: 'تكرار حاد ومستمر يعيق تدفق الجمل والحديث كلياً' }
    ]
  },
  {
    id: 'core_prolongation',
    name: 'إطالة الأصوات اللفظية (Sound Prolongations)',
    type: 'core',
    description: 'تمديد وإطالة صوت الحرف الساكن أو المتحرك قسراً (مثل: سسسسسسيارة).',
    options: [
      { value: 3, label: 'خالٍ تماماً من الإطالات التشنجية' },
      { value: 2, label: 'إطالة نادرة جداً عابرة لا يشعر بها المستمع' },
      { value: 1, label: 'إطالة واضحة تستمر لثانية أو ثانيتين وتتكرر بشكل مجهد' },
      { value: 0, label: 'إطالة شديدة تدوم لعدة ثوانٍ وتترافق بجهد واضح ومجهد' }
    ]
  },
  {
    id: 'core_block',
    name: 'الكف الصامت أو احتباس الهواء (Silent Blocks)',
    type: 'core',
    description: 'حبس هواء التنفس كلياً في الحنجرة أو الفم مع عجز تام عن نطق الحرف لعدة ثوانٍ مع بذل مجهود عضلي.',
    options: [
      { value: 3, label: 'خالٍ من الاحتباسات الصامتة' },
      { value: 2, label: 'احتباس عابر طفيف غير ملحوظ' },
      { value: 1, label: 'احتباس متكرر لثانية مع ضغط طفيف بالوجه' },
      { value: 0, label: 'احتباسات هوائية طويلة وحادة مع فتح الفم قسراً دون صوت' }
    ]
  },
  {
    id: 'sec_eye_movement',
    name: 'حركات العين والجفن المصاحبة (Eye Blink & Movements)',
    type: 'secondary',
    description: 'سلوك تخلص ثانوي: رمش سريع متكرر، إغلاق العين قسراً، أو الالتفات جانباً للهرب من اللعثم.',
    options: [
      { value: 3, label: 'لا توجد أي حركات ثانوية بالعينين' },
      { value: 2, label: 'رمش خفيف طفيف أثناء لحظة اللعثم الصعبة' },
      { value: 1, label: 'إغلاق شديد متكرر للعينين أو رفع الحاجبين تزامناً مع الحبسة' },
      { value: 0, label: 'تشنج بصري حاد ولف الرأس كلياً لتفادي التلعثم' }
    ]
  },
  {
    id: 'sec_muscle_tension',
    name: 'شد عضلات الوجه والرقبة (Facial & Neck Tension)',
    type: 'secondary',
    description: 'شد تشنجي حاد في عضلات الفكين، الرقبة، أو الشفتين أثناء محاولة دفع الكلام.',
    options: [
      { value: 3, label: 'خالٍ من أي شد عضلي مصاحب للحديث' },
      { value: 2, label: 'شد خفيف جداً يختفي بسرعة' },
      { value: 1, label: 'ارتجاف الشفتين أو بروز عروق الرقبة مع ضغط متوسط للفك' },
      { value: 0, label: 'شد تشنجي حاد ومؤلم بالوجه والرقبة مع احمرار وحركات تخلص' }
    ]
  },
  {
    id: 'sec_physical_movements',
    name: 'ضرب القدم أو حركات الأطراف (Body & Foot Tapping)',
    type: 'secondary',
    description: 'ضرب الأرض بالقدم، هز الذراع، قبض اليدين، أو حركات جسدية ميكانيكية مصاحبة للحظات اللعثم.',
    options: [
      { value: 3, label: 'لا توجد حركات جسدية ثانوية مطلقاً' },
      { value: 2, label: 'حركة لا إرادية طفيفة باليد تظهر نادراً' },
      { value: 1, label: 'ضرب القدم بالأرض أو هز الجسد للأمام لتوليد الطلاقة قسراً' },
      { value: 0, label: 'حركات عصبية تشنجية حادة بكافة الأطراف أثناء احتباس الهواء' }
    ]
  },
  {
    id: 'sec_avoidance_anxiety',
    name: 'تجنب الكلام والقلق الاجتماعي (Speech Avoidance & Anxiety)',
    type: 'secondary',
    description: 'تجنب كلمات معينة، الصمت، الامتناع عن الإجابة، أو الخوف والتوتر من مواقف التحدث العامة.',
    options: [
      { value: 3, label: 'تفاعل واثق، تواصل طبيعي وجريء ودون قلق تواصل' },
      { value: 2, label: 'خجل طفيف متباعد عند مواجهة الغرباء' },
      { value: 1, label: 'تجنب بعض الكلمات واستبدالها، تردد متوسط في المشاركة اللفظية' },
      { value: 0, label: 'انسحاب اجتماعي تام، بكاء أو صمت اختياري لتفادي مواجهة اللعثم' }
    ]
  }
];

// 6. بروتوكول فحص الخنف والرنين الصوتي (Resonance & Nasality Screening)
export const RESONANCE_NASALITY_ITEMS = [
  {
    id: 'hypernasality',
    name: 'الخنف المفتوح (Hypernasality)',
    description: 'تسرب مستمر وغير مرغوب للهواء الأنفي أثناء نطق الأصوات الفمية غير الأنفية (اختبار نطق المقاطع مثل بابا، تاتا مع سد الأنف وفتحه).',
    options: [
      { value: 3, label: 'رنين فمي طبيعي وخالٍ من الخنف المفتوح' },
      { value: 2, label: 'خنف مفتوح طفيف جداً لا يعيق المفهومية' },
      { value: 1, label: 'خنف مفتوح متوسط واضح ومستمر ويغير نبرة الحروف الفمية' },
      { value: 0, label: 'خنف مفتوح حاد وشديد يفرغ هواء الكلمات بالأنف بالكامل' }
    ]
  },
  {
    id: 'hyponasality',
    name: 'الخنف المغلق (Hyponasality)',
    description: 'انسداد المجرى الأنفي مما يمنع الرنين الطبيعي لأصوات الميم والنون لتنطق كأصوات فمية (مثل نطق ن -> د، م -> ب، مثل: ماما -> بابا).',
    options: [
      { value: 3, label: 'رنين أنفي سليم لأصوات الغنة (م، ن)' },
      { value: 2, label: 'انسداد أنفي طفيف عابر (بسبب زكام مؤقت)' },
      { value: 1, label: 'خنف مغلق متوسط دائم يحول أصوات الغنة بشكل جزئي' },
      { value: 0, label: 'انسداد أنفي كامل ومزمن يحول ميم ونون إلى باء ودال كلياً' }
    ]
  },
  {
    id: 'oral_air_pressure',
    name: 'اختبار ضغط الهواء الفمي ونفخ الخدود (Oral Air Pressure)',
    description: 'القدرة على حصر وضغط الهواء داخل التجويف الفمي دون تسربه من الأنف (نفخ الخدود، تصفير، إطفاء شمعة).',
    options: [
      { value: 3, label: 'ضغط هواء ممتاز وثبات تام للخدين المنفوخين' },
      { value: 2, label: 'تسرب هواء طفيف جداً بعد عدة ثوانٍ' },
      { value: 1, label: 'تسرب هواء أنفي واضح وضعف في نفخ الخدين معاً' },
      { value: 0, label: 'عجز كامل عن نفخ الخدين لخلل الصمام الأنفي البلعومي' }
    ]
  }
];

// 7. بروتوكول التقييم الإدراكي لنبرة وجودة الصوت (CAPE-V Adapted Checklist)
export const CAPEV_VOICE_ITEMS = [
  {
    id: 'hoarseness',
    name: 'الدرجة العامة لبحة الصوت (Overall Severity / Hoarseness)',
    description: 'التقييم الإدراكي الشامل لوجود بحة، خشونة، أو تشوه في جودة الصوت الصادر.',
    options: [
      { value: 3, label: 'صوت طبيعي ونقي كلياً' },
      { value: 2, label: 'بحة صوتية طفيفة عابرة تزول مع الراحة' },
      { value: 1, label: 'بحة صوتية متوسطة دائمة ومؤثرة على وضوح التحدث' },
      { value: 0, label: 'بحة حادة تشنجية تمنع سماع الصوت بوضوح أو فقدان تام للصوت' }
    ]
  },
  {
    id: 'roughness',
    name: 'الخشونة الصوتية (Roughness)',
    description: 'انخفاض وضوح الصوت مع وجود اهتزازات عشوائية غير منتظمة في نبرة الأحبال الصوتية.',
    options: [
      { value: 3, label: 'صوت ناعم ومستقر' },
      { value: 2, label: 'خشونة خفيفة تظهر عند الصياح أو الكلام الطويل' },
      { value: 1, label: 'خشونة متوسطة تعطي صوتاً غليظاً ومجهداً' },
      { value: 0, label: 'خشونة بالغة مع اهتزازات تمنع نطق الأصوات بنعومة' }
    ]
  },
  {
    id: 'breathiness',
    name: 'تسرب الهواء بالصوت (Breathiness)',
    description: 'تسرب وتدفق مفرط للهواء غير المهتز عبر الأحبال الصوتية (صوت همسي فاقد للرنين والشدة).',
    options: [
      { value: 3, label: 'خالٍ تماماً من الهمس، وصوت مدعوم بالكامل بالهواء' },
      { value: 2, label: 'صوت همسي طفيف متباعد لا يؤثر على الكفاءة' },
      { value: 1, label: 'صوت همسي متوسط مستمر يحتاج لإعادة أخذ نفس بشكل متكرر' },
      { value: 0, label: 'همس دائم حاد يكاد يخفي نبرة الصوت الفردية' }
    ]
  },
  {
    id: 'strain',
    name: 'الجهد والتشنج الصوتي (Strain & Spasmodic Breaks)',
    description: 'بذل جهد مفرط للحديث مع وجود ضغط حنجري شديد أو انقطاع مفاجئ في الصوت.',
    options: [
      { value: 3, label: 'صوت مسترسل وسهل كلياً دون مجهود حنجري' },
      { value: 2, label: 'مجهود حنجري طفيف جداً عند الإجهاد البدني' },
      { value: 1, label: 'تشنج وضغط حنجري دائم يعطي انطباعاً بأن الطفل يدفع الكلمات دفعاً' },
      { value: 0, label: 'انقطاع تشنجي حاد ومستمر بالصوت مع مجهود عضلي مؤلم' }
    ]
  },
  {
    id: 'pitch',
    name: 'طبقة ونبرة الصوت (Pitch Appropriateness)',
    description: 'مدى ملاءمة طبقة الصوت (مرتفع جداً حاد، أو منخفض جداً غليظ) لعمر الطفل وجنسه.',
    options: [
      { value: 3, label: 'طبقة صوت طبيعية ومناسبة كلياً للعمر والجنس' },
      { value: 2, label: 'انحراف طفيف في الطبقة (حدية أو غلظة خفيفة)' },
      { value: 1, label: 'طبقة صوت شاذة بوضوح (مثل صوت أنثوي حاد لذكر مراهق، أو العكس)' },
      { value: 0, label: 'طبقة صوت بالغة الغلظة أو الحديّة تمنع فهم النغمة التعبيرية' }
    ]
  },
  {
    id: 'loudness',
    name: 'شدة وعلو الصوت (Loudness Control)',
    description: 'القدرة على التحكم في علو الصوت (همس دائم أو صياح غير مبرر) ومناسبته للموقف الاجتماعي.',
    options: [
      { value: 3, label: 'تحكم ممتاز في علو الصوت وملاءمته لبيئة الغرفة' },
      { value: 2, label: 'يميل للتحدث بصوت منخفض قليلاً أو مرتفع قليلاً' },
      { value: 1, label: 'صوت ضعيف جداً شبه مسموع أو مرتفع صاخب بشكل مزعج' },
      { value: 0, label: 'همس تام لا يسمع مطلقاً أو صياح هستيري دائم دون تحكم' }
    ]
  }
];

// 8. استمارة تقييم الجانب البراجماتي والاستخدام الاجتماعي للغة (Pragmatic Checklist)
export const PRAGMATIC_ITEMS = [
  {
    id: 'eye_contact',
    name: 'التواصل البصري المستمر (Eye Contact Maintenance)',
    description: 'الحفاظ على التواصل البصري المناسب مع المتحدث أثناء التفاعل والحديث الاجتماعي.',
    options: [
      { value: 3, label: 'تواصل بصري طبيعي وتلقائي ومستمر' },
      { value: 2, label: 'تواصل بصري متقطع ولكنه يتناسب مع الحديث' },
      { value: 1, label: 'يتجنب التواصل البصري ويحتاج لتذكير لفظي أو إشارة' },
      { value: 0, label: 'غياب تام للتواصل البصري أثناء التحدث أو الاستماع كلياً' }
    ]
  },
  {
    id: 'turn_taking',
    name: 'تبادل الأدوار التواصلية (Conversation Turn-taking)',
    description: 'احترام أدوار الحديث، الاستماع للمتحدث، والانتظار دون المقاطعة المتكررة.',
    options: [
      { value: 3, label: 'يتبادل الأدوار بسلاسة تامة ويحترم المستمع' },
      { value: 2, label: 'يقاطع نادراً أو يواجه صعوبة بسيطة في انتظار دوره' },
      { value: 1, label: 'مقاطعة مستمرة وصعوبة بالغة في انتظار الدور بدون توجيه دائم' },
      { value: 0, label: 'يتحدث بمفرده كلياً (مونولوج) دون إدراك لوجود مستمع' }
    ]
  },
  {
    id: 'topic_maintenance',
    name: 'المحافظة على موضوع الحديث (Topic Maintenance)',
    description: 'الاستمرار في نفس سياق الحديث وموضوعه دون الانتقال العشوائي لمواضيع غير ذات صلة.',
    options: [
      { value: 3, label: 'يحافظ على موضوع الحديث ويطوره بشكل طبيعي' },
      { value: 2, label: 'ينتقل لموضوع آخر ذي صلة طفيفة بشكل عابر' },
      { value: 1, label: 'تشتت مستمر في سياق الحديث وينتقل فجأة لمواضيع شخصية عشوائية' },
      { value: 0, label: 'عجز كامل عن البقاء في موضوع الحديث لأكثر من عبارة واحدة' }
    ]
  },
  {
    id: 'init_terminate',
    name: 'بدء وإنهاء الحوار بأسلوب لائق (Initiation & Termination)',
    description: 'القدرة على البدء بالتحية وفتح مواضيع حوارية، وإغلاق الحوار بشكل لائق اجتماعياً.',
    options: [
      { value: 3, label: 'يبدأ وينهي الحوار بمهارة واجتماعية ممتازة' },
      { value: 2, label: 'يبدأ الحوار ولكن ينهيه فجأة بشكل غير مألوف' },
      { value: 1, label: 'صعوبة بالغة في إيجاد الكلمات لفتح حوار، يحتاج لمبادرة الطرف الآخر' },
      { value: 0, label: 'لا يبادر بالحديث مطلقاً ولا يستجيب لمحاولات بدء الحوار' }
    ]
  },
  {
    id: 'nonverbal_cues',
    name: 'فهم التلميحات الجسدية غير اللفظية (Body Language & Cues)',
    description: 'فهم تعبيرات الوجه، لغة الجسد، نبرة صوت المتحدث، وتعبيرات السخرية أو الغضب.',
    options: [
      { value: 3, label: 'فهم وتفاعل ممتاز مع التعبيرات والإيماءات' },
      { value: 2, label: 'يفوت بعض التلميحات الجسدية غير اللفظية الدقيقة' },
      { value: 1, label: 'يفسر لغة الجسد بشكل حرفي وجاف دون فهم المشاعر الكامنة' },
      { value: 0, label: 'عجز كامل عن فهم تعبيرات الوجه والابتسام أو لغة الجسد للآخرين' }
    ]
  }
];

// 9. استمارة جاهزية وسائل التواصل المعزز والبديل للأطفال غير الناطقين (AAC Readiness Assessment)
export const AAC_READINESS_ITEMS = [
  {
    id: 'current_mode',
    name: 'أسلوب التواصل الحالي والمحاولات الإيمائية (Current Communication)',
    description: 'رصد طريقة تعبير الطفل الحالية عن رغباته (إيماءات، سحب يد البالغ، الصراخ، صور بسيطة، PECS).',
    options: [
      { value: 3, label: 'يستخدم الإيماءات والصور والرموز بشكل وظيفي واضح لطلب حاجاته' },
      { value: 2, label: 'يسحب يد البالغ ويشير بيده لما يريد بوعي نسبي' },
      { value: 1, label: 'يعتمد على الصراخ أو البكاء كأداة وحيدة للتعبير' },
      { value: 0, label: 'سلوك تواصل غائب تماماً أو جمود تفاعلي تام' }
    ]
  },
  {
    id: 'motor_control',
    name: 'التحكم الحركي للإشارة والتأشير (Motor Control & Pointing)',
    description: 'تقييم القدرة الحركية الدقيقة للتأشير بإصبع السبابة بدقة نحو الصور، الأيقونات، أو شاشة جهاز لوحي.',
    options: [
      { value: 3, label: 'تأشير دقيق وحر بإصبع السبابة وتحديد مستقل للأهداف' },
      { value: 2, label: 'إشارة بكامل اليد أو ضعف عضلي بسيط يحتاج أزراراً أكبر' },
      { value: 1, label: 'رعشة أو ضعف حركي متوسط يتطلب دعامة يد أو تأشير مساعد' },
      { value: 0, label: 'عجز حركي تام بالأطراف العلوية يمنع التأشير المباشر ويستدعي حلول حركة بديلة' }
    ]
  },
  {
    id: 'visual_discrimination',
    name: 'التتبع والتمييز البصري للرموز (Visual Discrimination)',
    description: 'القدرة على تتبع ومطابقة وتثبيت النظر بصرياً على الرموز والصور التعبيرية المتجاورة واختيار الصورة الملائمة.',
    options: [
      { value: 3, label: 'تمييز بصري ممتاز للرموز ومطابقة الصور بذكاء' },
      { value: 2, label: 'يميز بين صورتين أو ثلاث صور كبيرة ببطء نسبي' },
      { value: 1, label: 'تشتت بصري واضح وصعوبة في نقل النظر بين الخيارات التواصلية' },
      { value: 0, label: 'عجز بصري أو عجز كلي عن فهم مغزى الصورة والرمز التعبيري' }
    ]
  },
  {
    id: 'cognitive_intent',
    name: 'النية والقصد التواصلي التفاعلي (Communicative Intent)',
    description: 'إدراك الطفل لجدوى التواصل ومفهوم السبب والنتيجة (مثال: الإشارة للصورة تجلب له التفاحة التي يحبها).',
    options: [
      { value: 3, label: 'إدراك ممتاز وفهم فوري لجدوى اختيار الصور للحصول على مكافأته' },
      { value: 2, label: 'إدراك ناشئ يحتاج لنمذجة حية مستمرة لربط الرمز بالمكافأة' },
      { value: 1, label: 'تواصل عشوائي دون قصد واضح، يضغط على كافة الأزرار والصور' },
      { value: 0, label: 'غياب تام لإدراك مفهوم التواصل أو العلية والسببية التفاعلية' }
    ]
  }
];

// للاحتفاظ بالتوافقية الكاملة مع النسخة السابقة من النظام
export const SPEECH_CHARACTERISTICS_ITEMS = [
  {
    id: 'fluency',
    name: 'الطلاقة ومعدل الكلام (Fluency & Rate)',
    description: 'تقييم تدفق الكلام وخلوه من اللعثم (التأتأة)، التكرار، حبسة الأصوات، أو السرعة المفرطة.',
    options: [
      { value: 4, label: 'طلاقة طبيعية ومعدل كلام متناسق' },
      { value: 3, label: 'تكرار طفيف ومتباعد للكلمات أو المقاطع تحت التوتر' },
      { value: 2, label: 'تلعثم بسيط (تكرار وإطالة الأصوات بشكل متكرر دون حركات ثانوية)' },
      { value: 1, label: 'تلعثم متوسط إلى شديد (حبسات كلامية، شد عضلي، وحركات ثانوية بالوجه)' },
      { value: 0, label: 'احتباس كلامي حاد يمنع التواصل اللفظي الفعال' }
    ]
  },
  {
    id: 'voice_resonance',
    name: 'جودة الصوت والرنين (Voice Quality & Resonance)',
    description: 'تقييم وجود خنف أنفي مفتوح أو مغلق، بحة صوتية مستمرة، غلظة أو حدة الصوت غير طبيعية.',
    options: [
      { value: 4, label: 'صوت واضح تماماً ورنين متوازن طبيعياً' },
      { value: 3, label: 'بحة صوتية طفيفة عابرة أو رنين أنفي خفيف جداً' },
      { value: 2, label: 'خنف مفتوح أو مغلق واضح يؤثر طفيفاً على مفهومية الكلام' },
      { value: 1, label: 'بحة صوتية شديدة مستمرة مع بحة تشنجية أو خنف شديد' },
      { value: 0, label: 'فقدان كامل للصوت (Aphonia) أو خنف حاد يعيق فهم الحروف تماماً' }
    ]
  },
  {
    id: 'intelligibility',
    name: 'مفهومية ووضوح الكلام العام (Overall Speech Intelligibility)',
    description: 'مدى فهم المستمع العادي أو الغريب لكلام الطفل بشكل عام في المواقف التواصلية المختلفة.',
    options: [
      { value: 4, label: 'مفهوم تماماً للجميع (نسبة وضوح 90-100%)' },
      { value: 3, label: 'مفهوم لمعظم الناس مع تكرار طفيف عند السرعة (وضوح 75-89%)' },
      { value: 2, label: 'مفهوم للوالدين والمقربين فقط، ويواجه الغرباء صعوبة (وضوح 50-74%)' },
      { value: 1, label: 'غير مفهوم للغرباء ومفهوم بصعوبة شديدة للأهل (وضوح 25-49%)' },
      { value: 0, label: 'كلام غير مفهوم تماماً ومبهم كلياً (وضوح أقل من 25%)' }
    ]
  }
];

/**
 * المحرك الإكلينيكي المطور لحساب درجات وتحليل الفحوصات التسعة وتوليد الأهداف السلوكية
 */
export function calculateSpeechScreeningPsychometrics(results = {}) {
  // 1. حساب آلية الفم والنطق (OME)
  let omeSum = 0;
  let omeTested = 0;
  const omeMax = SPEECH_ORAL_MOTOR_ITEMS.length * 3; // 6 items * 3 = 18

  SPEECH_ORAL_MOTOR_ITEMS.forEach(it => {
    const val = results[`oral_${it.id}`];
    if (val !== undefined && val !== null) {
      omeSum += Number(val);
      omeTested++;
    }
  });

  const omeScore = omeSum;
  const omePercentage = omeTested > 0 ? Math.round((omeSum / (omeTested * 3)) * 100) : 100;
  
  let omeLevel = 'طبيعي/سليم';
  let omeColor = '#0d9488'; // Teal
  if (omePercentage < 40) {
    omeLevel = 'قصور هيكلي وحركي شديد';
    omeColor = '#ef4444';
  } else if (omePercentage < 70) {
    omeLevel = 'قصور حركي متوسط';
    omeColor = '#f59e0b';
  } else if (omePercentage < 90) {
    omeLevel = 'قصور حركي طفيف';
    omeColor = '#3b82f6';
  }

  // 2. حساب مهارات البلع والمضغ (Feeding & Swallowing)
  let feedingSum = 0;
  let feedingTested = 0;
  const feedingMax = FEEDING_SWALLOWING_ITEMS.length * 3; // 6 items * 3 = 18

  FEEDING_SWALLOWING_ITEMS.forEach(it => {
    const val = results[`feeding_${it.id}`];
    if (val !== undefined && val !== null) {
      feedingSum += Number(val);
      feedingTested++;
    }
  });

  const feedingScore = feedingSum;
  const feedingPercentage = feedingTested > 0 ? Math.round((feedingSum / (feedingTested * 3)) * 100) : 100;

  let feedingLevel = 'بلع ومضغ سليم وطبيعي';
  let feedingColor = '#059669'; // Green
  if (feedingPercentage < 40) {
    feedingLevel = 'اضطراب بلع ومضغ شديد (خطر اختناق)';
    feedingColor = '#ef4444';
  } else if (feedingPercentage < 70) {
    feedingLevel = 'اضطراب بلع ومضغ متوسط';
    feedingColor = '#f59e0b';
  } else if (feedingPercentage < 90) {
    feedingLevel = 'صعوبة بلع بسيطة';
    feedingColor = '#3b82f6';
  }

  // 3. حساب مخارج الحروف العربية الـ 28 (Phonetic & Articulation)
  let phoneticTested = 0;
  let phoneticCorrect = 0;
  let omissionCount = 0;
  let substitutionCount = 0;
  let distortionCount = 0;
  let additionCount = 0;
  const errorDetails = [];

  SPEECH_PHONETIC_ITEMS.forEach(it => {
    ['first', 'middle', 'last'].forEach(pos => {
      const responseKey = `phone_${it.id}_${pos}`;
      const status = results[responseKey];

      if (status && status !== 'na') {
        phoneticTested++;
        if (status === 'correct') {
          phoneticCorrect++;
        } else {
          const posLabel = pos === 'first' ? 'أول الكلمة' : pos === 'middle' ? 'وسط الكلمة' : 'آخر الكلمة';
          const wordUsed = it.words[pos] || '';
          let errorTypeLabel = 'اضطراب';

          if (status === 'omission') {
            omissionCount++;
            errorTypeLabel = 'حذف';
          } else if (status === 'substitution') {
            substitutionCount++;
            const subLet = results[`phone_${it.id}_${pos}_sub`] || '؟';
            errorTypeLabel = `إبدال بـ (${subLet})`;
          } else if (status === 'distortion') {
            distortionCount++;
            errorTypeLabel = 'تشويه/تحريف';
          } else if (status === 'addition') {
            additionCount++;
            errorTypeLabel = 'إضافة صوت';
          }

          errorDetails.push({
            id: it.id,
            letter: it.letter,
            name: it.name,
            position: pos,
            positionLabel: posLabel,
            word: wordUsed,
            errorType: errorTypeLabel,
            key: responseKey
          });
        }
      }
    });
  });

  const accuracyRate = phoneticTested > 0 ? Number(((phoneticCorrect / phoneticTested) * 100).toFixed(1)) : 100;
  
  let severityLabel = 'سلامة نطقية طبيعية';
  let severityColor = '#10b981';
  let severityKey = 'normal';

  if (accuracyRate < 50) {
    severityLabel = 'اضطراب نطق ومخارج حروف شديد';
    severityColor = '#ef4444';
    severityKey = 'severe';
  } else if (accuracyRate < 75) {
    severityLabel = 'اضطراب نطق ومخارج حروف متوسط';
    severityColor = '#f59e0b';
    severityKey = 'moderate';
  } else if (accuracyRate < 90) {
    severityLabel = 'اضطراب نطق ومخارج حروف بسيط';
    severityColor = '#3b82f6';
    severityKey = 'mild';
  }

  // 4. استمارة رصد العمليات الفونولوجية (Phonological Processes)
  let phoneProcSum = 0;
  let phoneProcTested = 0;
  const phoneProcMax = PHONOLOGICAL_PROCESSES_ITEMS.length * 3; // 5 items * 3 = 15

  PHONOLOGICAL_PROCESSES_ITEMS.forEach(it => {
    const val = results[`phone_proc_${it.id}`];
    if (val !== undefined && val !== null) {
      phoneProcSum += Number(val);
      phoneProcTested++;
    }
  });

  // هنا النسبة العكسية لأن الدرجة الأقل تعني عدم وجود عمليات تبسيط (وهو الأفضل)
  const phoneProcScore = phoneProcSum;
  const phoneProcPercentage = phoneProcTested > 0 ? Math.round(((phoneProcTested * 3 - phoneProcSum) / (phoneProcTested * 3)) * 100) : 100;
  
  let phoneProcLevel = 'سلامة من عمليات التبسيط الفونولوجي';
  let phoneProcColor = '#10b981';
  if (phoneProcPercentage < 40) {
    phoneProcLevel = 'تبسيط فونولوجي شديد ومتكرر';
    phoneProcColor = '#ef4444';
  } else if (phoneProcPercentage < 70) {
    phoneProcLevel = 'تبسيط فونولوجي متوسط دائم';
    phoneProcColor = '#f59e0b';
  } else if (phoneProcPercentage < 90) {
    phoneProcLevel = 'تبسيط فونولوجي بسيط عابر';
    phoneProcColor = '#3b82f6';
  }

  // 5. حساب التلعثم والطلاقة (Stuttering & Fluency)
  let fluencySum = 0;
  let fluencyTested = 0;
  const fluencyMax = STUTTERING_FLUENCY_ITEMS.length * 3; // 7 items * 3 = 21

  STUTTERING_FLUENCY_ITEMS.forEach(it => {
    const val = results[`fluency_${it.id}`];
    if (val !== undefined && val !== null) {
      fluencySum += Number(val);
      fluencyTested++;
    }
  });

  const fluencyScore = fluencySum;
  const fluencyPercentage = fluencyTested > 0 ? Math.round((fluencySum / (fluencyTested * 3)) * 100) : 100;

  let fluencyLevel = 'طلاقة كلامية طبيعية ومتسقة';
  let fluencyColor = '#06b6d4'; // Cyan
  if (fluencyPercentage < 40) {
    fluencyLevel = 'تلعثم شديد جداً مع سلوكيات ثانوية حادة';
    fluencyColor = '#ef4444';
  } else if (fluencyPercentage < 70) {
    fluencyLevel = 'تلعثم متوسط ملحوظ بجهد متوسط';
    fluencyColor = '#f59e0b';
  } else if (fluencyPercentage < 90) {
    fluencyLevel = 'عدم طلاقة بسيط وطبيعي في الحدود الفسيولوجية';
    fluencyColor = '#3b82f6';
  }

  // 6. حساب الخنف والرنين (Resonance & Nasality)
  let resonanceSum = 0;
  let resonanceTested = 0;
  const resonanceMax = RESONANCE_NASALITY_ITEMS.length * 3; // 3 items * 3 = 9

  RESONANCE_NASALITY_ITEMS.forEach(it => {
    const val = results[`resonance_${it.id}`];
    if (val !== undefined && val !== null) {
      resonanceSum += Number(val);
      resonanceTested++;
    }
  });

  const resonanceScore = resonanceSum;
  const resonancePercentage = resonanceTested > 0 ? Math.round((resonanceSum / (resonanceTested * 3)) * 100) : 100;

  let resonanceLevel = 'رنين طبيعي وصمام سليم';
  let resonanceColor = '#0284c7'; // Blue
  if (resonancePercentage < 40) {
    resonanceLevel = 'اضطراب رنين شديد (خنف حاد)';
    resonanceColor = '#ef4444';
  } else if (resonancePercentage < 70) {
    resonanceLevel = 'خنف متوسط دائم يؤثر على الفهم';
    resonanceColor = '#f59e0b';
  } else if (resonancePercentage < 90) {
    resonanceLevel = 'رنين غير متزن طفيف عابر';
    resonanceColor = '#3b82f6';
  }

  // 7. حساب جودة الصوت (CAPE-V adapted Voice)
  let voiceSum = 0;
  let voiceTested = 0;
  const voiceMax = CAPEV_VOICE_ITEMS.length * 3; // 6 items * 3 = 18

  CAPEV_VOICE_ITEMS.forEach(it => {
    const val = results[`voice_${it.id}`];
    if (val !== undefined && val !== null) {
      voiceSum += Number(val);
      voiceTested++;
    }
  });

  const voiceScore = voiceSum;
  const voicePercentage = voiceTested > 0 ? Math.round((voiceSum / (voiceTested * 3)) * 100) : 100;

  let voiceLevel = 'جودة صوت ممتازة ونبرة طبيعية';
  let voiceColor = '#8b5cf6'; // Purple
  if (voicePercentage < 40) {
    voiceLevel = 'اضطراب بحة وجهد صوّتي شديد';
    voiceColor = '#ef4444';
  } else if (voicePercentage < 70) {
    voiceLevel = 'اضطراب صوت ورونق متوسط';
    voiceColor = '#f59e0b';
  } else if (voicePercentage < 90) {
    voiceLevel = 'بحة أو خشونة طفيفة عابرة';
    voiceColor = '#3b82f6';
  }

  // 8. حساب التواصل الاجتماعي (Pragmatic Social language)
  let pragmaticSum = 0;
  let pragmaticTested = 0;
  const pragmaticMax = PRAGMATIC_ITEMS.length * 3; // 5 items * 3 = 15

  PRAGMATIC_ITEMS.forEach(it => {
    const val = results[`pragmatic_${it.id}`];
    if (val !== undefined && val !== null) {
      pragmaticSum += Number(val);
      pragmaticTested++;
    }
  });

  const pragmaticScore = pragmaticSum;
  const pragmaticPercentage = pragmaticTested > 0 ? Math.round((pragmaticSum / (pragmaticTested * 3)) * 100) : 100;

  let pragmaticLevel = 'مهارات تواصل اجتماعي وبراجماتي ناضجة';
  let pragmaticColor = '#ec4899'; // Pink
  if (pragmaticPercentage < 40) {
    pragmaticLevel = 'قصور براجماتي واجتماعي شديد جداً';
    pragmaticColor = '#ef4444';
  } else if (pragmaticPercentage < 70) {
    pragmaticLevel = 'قصور اجتماعي براجماتي متوسط';
    pragmaticColor = '#f59e0b';
  } else if (pragmaticPercentage < 90) {
    pragmaticLevel = 'صعوبات براجماتية بسيطة (مهارات ناشئة)';
    pragmaticColor = '#3b82f6';
  }

  // 9. حساب جاهزية وسائل التواصل المعزز والبديل (AAC Readiness)
  let aacSum = 0;
  let aacTested = 0;
  const aacMax = AAC_READINESS_ITEMS.length * 3; // 4 items * 3 = 12

  AAC_READINESS_ITEMS.forEach(it => {
    const val = results[`aac_${it.id}`];
    if (val !== undefined && val !== null) {
      aacSum += Number(val);
      aacTested++;
    }
  });

  const aacScore = aacSum;
  const aacPercentage = aacTested > 0 ? Math.round((aacSum / (aacTested * 3)) * 100) : 100;

  let aacLevel = 'جاهزية عالية للبدائل الإلكترونية والتواصل المعزز';
  let aacColor = '#f97316'; // Orange
  if (aacPercentage < 40) {
    aacLevel = 'جاهزية ضعيفة جداً وتحتاج تكييف وتهيئة أساسية';
    aacColor = '#ef4444';
  } else if (aacPercentage < 70) {
    aacLevel = 'جاهزية متوسطة وتستفيد من لوحات التواصل PECS';
    aacColor = '#f59e0b';
  } else if (aacPercentage < 90) {
    aacLevel = 'مهارات تواصل بديل جيدة جداً وناشئة';
    aacColor = '#3b82f6';
  }

  // 10. الحساب الإجمالي الشامل للمهارات (Overall Clinical Impression)
  const allPercentages = [
    omePercentage,
    feedingPercentage,
    accuracyRate,
    phoneProcPercentage,
    fluencyPercentage,
    resonancePercentage,
    voicePercentage,
    pragmaticPercentage,
    aacPercentage
  ];
  const overallAvgPercentage = Math.round(allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length);

  let overallLevel = 'سلامة وقدرات تواصلية ممتازة';
  let overallColor = '#10b981';
  if (overallAvgPercentage < 50) {
    overallLevel = 'صعوبات نطق وتواصل وحركة فموية شديدة';
    overallColor = '#ef4444';
  } else if (overallAvgPercentage < 75) {
    overallLevel = 'صعوبات نطق وتواصل متوسطة الشدة';
    overallColor = '#f59e0b';
  } else if (overallAvgPercentage < 90) {
    overallLevel = 'صعوبات تواصل ونطق خفيفة وبسيطة';
    overallColor = '#3b82f6';
  }

  // 11. استخراج نقاط الضعف تلقائياً وتوليد أهداف الخطة التربوية الفردية الذكية (IEP Goals Generator)
  const weaknesses = [];
  const generatedIepGoals = [];

  // فحص عضلات النطق (OME)
  SPEECH_ORAL_MOTOR_ITEMS.forEach(it => {
    const val = results[`oral_${it.id}`];
    if (val !== undefined && val !== null && Number(val) < 3) {
      weaknesses.push({ domain: 'حركة وعضلات أعضاء النطق', item: it.name, val, max: 3 });
      
      let goalText = '';
      if (it.id === 'lips') {
        goalText = 'أن يتمكن الطالب من ضم الشفتين وإبقائهما مطبقتين تماماً أثناء البلع أو نطق الأصوات الشفهية بنسبة نجاح 80% في 4 جلسات متتالية.';
      } else if (it.id === 'tongue') {
        goalText = 'أن يقوم الطالب برفع رأس اللسان للمس الحنك الصلب للأعلى والثبات لمدة 5 ثوانٍ بشرط 4 محاولات صحيحة من أصل 5.';
      } else if (it.id === 'jaw_masseter') {
        goalText = 'أن يظهر الطالب ثباتاً واستقراراً في حركة الفك السفلي دون انحراف جانبي أثناء التحدث بجمل قصيرة بمعدل نجاح 80%.';
      } else if (it.id === 'palate_velum') {
        goalText = 'أن يتدرب الطالب على زيادة مرونة شراع الحنك واللهاة لتخفيض تسرب الهواء الأنفي في الأصوات الفموية بمعدل 4 محاولات ناجحة.';
      } else if (it.id === 'teeth_jaw') {
        goalText = 'أن يتدرب الطالب على التعويض الحركي في إطباق الأسنان لنطق الأصوات الاحتكاكية والأسنانية (س، ص) بنسبة دقة 85%.';
      } else if (it.id === 'drooling') {
        goalText = 'أن يتمكن الطالب من التحكم في سيلان اللعاب والبلع التلقائي للعاب أثناء الجلوس والمشاركة في الفصل بنسبة 90% من الوقت.';
      }
      if (goalText) generatedIepGoals.push({ id: `goal_oral_${it.id}`, domain: 'عضلات الفم والنطق', weakness: it.name, goal: goalText });
    }
  });

  // فحص البلع والمضغ (Feeding)
  FEEDING_SWALLOWING_ITEMS.forEach(it => {
    const val = results[`feeding_${it.id}`];
    if (val !== undefined && val !== null && Number(val) < 3) {
      weaknesses.push({ domain: 'تقييم مهارات البلع والمضغ', item: it.name, val, max: 3 });
      
      let goalText = '';
      if (it.id === 'solid_food') {
        goalText = 'أن يقوم الطالب بقضم ومضغ الأغذية الصلبة بحركة طحن فك دائرية كاملة بنجاح دون الحاجة لتقطيع مسبق في 3 وجبات متتالية.';
      } else if (it.id === 'semi_solid') {
        goalText = 'أن يتمكن الطالب من تجميع الطعام المهروس شبه الصلب بمنتصف اللسان ودفعه للخلف للبلع النظيف دون ترك ركام جانبي.';
      } else if (it.id === 'liquids') {
        goalText = 'أن يرشف الطالب السائل من الكوب أو الماصة مع الحفاظ على الإطباق الشفتي دون انسكاب خارجي في 4 محاولات من 5.';
      } else if (it.id === 'respiration_coordination') {
        goalText = 'أن ينسق الطالب دورة التنفس مع البلع لمنع تداخل الكلام أو حدوث كحة أثناء بلع السوائل المتدفقة بنجاح تام.';
      } else if (it.id === 'oral_residue') {
        goalText = 'أن يظهر الطالب وعياً حسياً بوجود بقايا الطعام في الشدق ويقوم بتنظيف فمه ذاتياً باللسان دون تنبيه لفظي.';
      } else if (it.id === 'cough_reflex') {
        goalText = 'أن يظهر الطالب منعكس السعال الوقائي السليم عند اقتراب السائل من الحنجرة كآلية دفاعية طبيعية بنسبة 100%.';
      }
      if (goalText) generatedIepGoals.push({ id: `goal_feeding_${it.id}`, domain: 'البلع والمضغ', weakness: it.name, goal: goalText });
    }
  });

  // فحص الحروف ومخارج الحروف (Phonetics)
  errorDetails.forEach(err => {
    weaknesses.push({ domain: 'مخارج الحروف ونطق الأصوات', item: `حرف ${err.letter} (${err.name}) في ${err.positionLabel}`, val: err.errorType });
    
    const goalText = `أن ينطق الطالب صوت حرف (${err.letter}) بشكل سليم ومستقر في موضع (${err.positionLabel}) داخل الكلمات والحديث التلقائي بنسبة دقة لا تقل عن 85% في 3 جلسات متتالية.`;
    // تجنب تكرار أهداف نفس الحرف بشكل زائد، فقط هدف واحد لكل حرف مميز
    if (!generatedIepGoals.some(g => g.id === `goal_phonetic_${err.id}`)) {
      generatedIepGoals.push({ id: `goal_phonetic_${err.id}`, domain: 'مخارج الحروف والأصوات', weakness: `نطق حرف ${err.letter} (${err.name})`, goal: goalText });
    }
  });

  // فحص العمليات الفونولوجية (Phonological Processes)
  PHONOLOGICAL_PROCESSES_ITEMS.forEach(it => {
    const val = results[`phone_proc_${it.id}`];
    if (val !== undefined && val !== null && Number(val) > 0) {
      weaknesses.push({ domain: 'العمليات الفونولوجية وتبسيط النطق', item: it.name, val, max: 3 });
      
      let goalText = '';
      if (it.id === 'fronting') {
        goalText = 'أن يميز الطالب نطق الأصوات الخلفية كـ (ق، ك) ويمتنع عن تقديمها للأمام إلى (ت، د) في الكلمات المختبرة بنسبة دقة 85%.';
      } else if (it.id === 'backing') {
        goalText = 'أن يمتنع الطالب عن تأخير الأصوات الأمامية اللثوية (ت، د) إلى الطبقية (ك، ق) أثناء الكلام المسترسل بدقة 80%.';
      } else if (it.id === 'stopping') {
        goalText = 'أن يستمر الطالب في إصدار الأصوات الاحتكاكية الرخوة (س، ش، ف) دون حبسها أو تحويلها لأصوات انفجارية في 4 محاولات من 5.';
      } else if (it.id === 'deaffrication') {
        goalText = 'أن ينطق الطالب صوت حرف الجيم مع حصر صفة الانفجار والاحتكاك معاً بشكل سليم بنسبة نجاح تفوق 80% في التدريبات اللفظية.';
      } else if (it.id === 'syllable_simplification') {
        goalText = 'أن يلفظ الطالب كامل مقاطع الكلمات الطويلة ومتتالية الحروف الساكنة دون حذف أو تبسيط للبنية المقطعية بنسبة 85%.';
      }
      if (goalText) generatedIepGoals.push({ id: `goal_proc_${it.id}`, domain: 'العمليات الفونولوجية', weakness: it.name, goal: goalText });
    }
  });

  // فحص التلعثم والطلاقة (Fluency)
  STUTTERING_FLUENCY_ITEMS.forEach(it => {
    const val = results[`fluency_${it.id}`];
    if (val !== undefined && val !== null && Number(val) < 3) {
      weaknesses.push({ domain: 'طلاقة الكلام والتلعثم', item: it.name, val, max: 3 });
      
      let goalText = '';
      if (it.id === 'core_repetition') {
        goalText = 'أن يطبق الطالب فنية "إطالة الصوت البدئية" للتحكم في تكرار المقاطع والكلمات بنسبة انخفاض تبلغ 70% من معدل التلعثم الحالي.';
      } else if (it.id === 'core_prolongation') {
        goalText = 'أن يستخدم الطالب استراتيجية "البداية السهلة Easy Onset" لتفادي حدوث إطالات تشنجية متوترة للحروف اللفظية في الكلام.';
      } else if (it.id === 'core_block') {
        goalText = 'أن يتعلم الطالب فنية "إرخاء مخرج الحرف" والزفير الهادئ للتخلص من لحظات الاحتباس الصامت للهواء في الحنجرة.';
      } else if (it.id === 'sec_eye_movement' || it.id === 'sec_muscle_tension' || it.id === 'sec_physical_movements') {
        goalText = 'أن يبدي الطالب استرخاءً كاملاً في عضلات الوجه والعينين والجسد، ويمتنع عن أي سلوكيات تخلص جسدية ميكانيكية أثناء اللعثم.';
      } else if (it.id === 'sec_avoidance_anxiety') {
        goalText = 'أن يشارك الطالب بنشاط وثقة في الأنشطة الصفية اللفظية دون تجنب للكلام أو تردد اجتماعي في 4 محاولات تواصلية رصدت.';
      }
      if (goalText && !generatedIepGoals.some(g => g.id === 'goal_fluency_master')) {
        generatedIepGoals.push({ id: 'goal_fluency_master', domain: 'الطلاقة والطلاقة اللفظية', weakness: 'مظاهر التلعثم وعدم الطلاقة', goal: goalText });
      }
    }
  });

  // فحص الرنين والخنف (Resonance)
  RESONANCE_NASALITY_ITEMS.forEach(it => {
    const val = results[`resonance_${it.id}`];
    if (val !== undefined && val !== null && Number(val) < 3) {
      weaknesses.push({ domain: 'الرنين الأنفي والبلعومي', item: it.name, val, max: 3 });
      
      let goalText = '';
      if (it.id === 'hypernasality') {
        goalText = 'أن يتحكم الطالب في قفل الصمام الأنفي البلعومي لتوجيه الهواء كلياً عبر التجويف الفمي عند نطق الأصوات غير الأنفية بدقة 85%.';
      } else if (it.id === 'hyponasality') {
        goalText = 'أن يصدر الطالب رنيناً أنفياً (غنة) ملائماً وسليماً عند نطق أصوات الميم والنون دون إبدالهما بحروف انفجارية فموية.';
      } else if (it.id === 'oral_air_pressure') {
        goalText = 'أن يتمكن الطالب من نفخ الخدين معاً بقوة وثبات وحصر الهواء داخل التجويف الفمي لمدة 8 ثوانٍ متتالية دون تسرب أنفي.';
      }
      if (goalText) generatedIepGoals.push({ id: `goal_res_${it.id}`, domain: 'الرنين والخنف', weakness: it.name, goal: goalText });
    }
  });

  // فحص جودة الصوت (CAPE-V Adapted Voice)
  CAPEV_VOICE_ITEMS.forEach(it => {
    const val = results[`voice_${it.id}`];
    if (val !== undefined && val !== null && Number(val) < 3) {
      weaknesses.push({ domain: 'تقييم جودة جرس وصوت الطفل', item: it.name, val, max: 3 });
      
      let goalText = '';
      if (it.id === 'hoarseness' || it.id === 'roughness' || it.id === 'breathiness') {
        goalText = 'أن يتدرب الطالب على تقنيات التنفس البطني العميق والنظافة الصوتية للحفاظ على جودة صوت نقي وخالٍ من البحة والخشونة.';
      } else if (it.id === 'strain') {
        goalText = 'أن يتحدث الطالب بنبرة مسترسلة وسهلة وخالية من التشنج والجهد الحنجري المفرط في حوار تفاعلي يستمر لـ 3 دقائق.';
      } else if (it.id === 'pitch' || it.id === 'loudness') {
        goalText = 'أن يتحكم الطالب في طبقة وعلو صوته بما يتناسب مع مواقف الصف والتفاعل الاجتماعي الهادئ بدقة 90%.';
      }
      if (goalText && !generatedIepGoals.some(g => g.id === 'goal_voice_master')) {
        generatedIepGoals.push({ id: 'goal_voice_master', domain: 'جودة الصوت ونبرته', weakness: 'خصائص جرس وجرس الصوت', goal: goalText });
      }
    }
  });

  // فحص الجانب البراجماتي والتواصل الاجتماعي (Pragmatics)
  PRAGMATIC_ITEMS.forEach(it => {
    const val = results[`pragmatic_${it.id}`];
    if (val !== undefined && val !== null && Number(val) < 3) {
      weaknesses.push({ domain: 'مهارات التواصل البراجماتي والاجتماعي', item: it.name, val, max: 3 });
      
      let goalText = '';
      if (it.id === 'eye_contact') {
        goalText = 'أن يحافظ الطالب على تواصل بصري مريح ومستمر مع المتحدث لمدة لا تقل عن 5 ثوانٍ متتالية أثناء الحوارات الاجتماعية.';
      } else if (it.id === 'turn_taking') {
        goalText = 'أن يتبادل الطالب الأدوار التواصلية اللفظية أو البصرية مع أقرانه لـ 4 أدوار متتالية دون مقاطعة أو انسحاب.';
      } else if (it.id === 'topic_maintenance') {
        goalText = 'أن يظهر الطالب التزاماً بموضوع الحوار الدائر ويشارك بجملتين ذات صلة مباشرة بالموضوع دون الانتقال لحديث عشوائي.';
      } else if (it.id === 'init_terminate') {
        goalText = 'أن يبادر الطالب ببدء الحوار بالتحية والترحيب بزميل له، وينهي الحوار بكلمة وداع لائقة اجتماعياً في مواقف اجتماعية طبيعية.';
      } else if (it.id === 'nonverbal_cues') {
        goalText = 'أن يتعرف الطالب على المشاعر وتعبيرات الوجه ولغة الجسد للمتحدث (حزن، غضب، سعادة) ويتفاعل معها بأسلوب سيكومتري ملاءم.';
      }
      if (goalText) generatedIepGoals.push({ id: `goal_prag_${it.id}`, domain: 'التواصل الاجتماعي والبراجماتي', weakness: it.name, goal: goalText });
    }
  });

  // فحص جاهزية وسائل التواصل المعزز والبديل (AAC)
  AAC_READINESS_ITEMS.forEach(it => {
    const val = results[`aac_${it.id}`];
    if (val !== undefined && val !== null && Number(val) < 3) {
      weaknesses.push({ domain: 'جاهزية وسائل التواصل المعزز والبديل', item: it.name, val, max: 3 });
      
      let goalText = '';
      if (it.id === 'current_mode') {
        goalText = 'أن يستخدم الطالب نظام التواصل بتبادل الصور (PECS) أو الإيماءات الوظيفية للتعبير المباشر عن 3 رغبات أساسية يومياً.';
      } else if (it.id === 'motor_control') {
        goalText = 'أن يقوم الطالب بالتأشير بدقة بإصبع السبابة على بطاقة تواصلية أو أيقونة برمجية بمقاس 5 سم دون مساعدة جسدية.';
      } else if (it.id === 'visual_discrimination') {
        goalText = 'أن يميز الطالب بصرياً بين صورتين تعبيريتين متجاورتين ويختار الصورة المطابقة للاحتياج الفعلي في 4 محاولات من 5.';
      } else if (it.id === 'cognitive_intent') {
        goalText = 'أن يدرك الطالب مبدأ "السبب والنتيجة التواصلي" بحيث يربط تقديم الرمز بحصوله الفوري على المكافأة بنسبة نجاح 90%.';
      }
      if (goalText) generatedIepGoals.push({ id: `goal_aac_${it.id}`, domain: 'البدائل وجاهزية AAC', weakness: it.name, goal: goalText });
    }
  });

  // توليد تقرير طبي سردي تلقائي فائق الفخامة والتحليل السريري
  let clinicalImpression = '';
  if (overallAvgPercentage >= 90) {
    clinicalImpression = `لوحظ كفاءة نطقية ولغوية وعضلية متكاملة بمتوسط عام يبلغ ${overallAvgPercentage}% للطفل ${results.studentName || ''}. تظهر الفحوصات التسعة تشريحاً ووظيفة ممتازة لأعضاء النطق والبلع والمضغ، مع طلاقة وضوح كلام بنسبة 100% ورنين وتواصل اجتماعي براجماتي ملائم جداً لفئته العمرية. لا يتطلب الطفل أي تدخل تأهيلي إكلينيكي حالياً.`;
  } else {
    clinicalImpression = `أظهر التقييم الإكلينيكي الشامل للنطق واللغة والتواصل وعضلات الفم وجود صعوبات تواصلية ونطقية متباينة بمعدل مهارات كلي قدره ${overallAvgPercentage}%. \nتم تشخيص الجوانب التالية بوضوح:\n`;
    if (omePercentage < 80) clinicalImpression += `• الجهاز النطقي وعضلات الفم (OME): كفاءة بمعدل [${omePercentage}% - مستوى: ${omeLevel}]، مع وجود ضعف أو قصور في مهارات (${weaknesses.filter(w => w.domain.includes('أعضاء')).map(w => w.item).join('، ') || '—'}).\n`;
    if (feedingPercentage < 80) clinicalImpression += `• مهارات البلع والمضغ: أداء قدره [${feedingPercentage}% - مستوى: ${feedingLevel}]، يبرز ضعف في (${weaknesses.filter(w => w.domain.includes('البلع')).map(w => w.item).join('، ') || '—'}).\n`;
    if (accuracyRate < 90) clinicalImpression += `• مخارج الحروف العربية: دقة نطق الأصوات بلغت [${accuracyRate}% - مستوى: ${severityLabel}]، حيث رصد إجمالي (${errorDetails.length}) مواضع نطقية خاطئة (تفاصيل: حذف: ${omissionCount} | إبدال: ${substitutionCount} | تشويه: ${distortionCount} | إضافة: ${additionCount}).\n`;
    if (phoneProcPercentage < 100) clinicalImpression += `• العمليات الفونولوجية: يظهر الطفل تبسيطاً لغوياً بمعدل [${phoneProcPercentage}% - مستوى: ${phoneProcLevel}]، وبخاصة ممارسات (${weaknesses.filter(w => w.domain.includes('الفونولوجية')).map(w => w.item).join('، ') || '—'}).\n`;
    if (fluencyPercentage < 80) clinicalImpression += `• طلاقة الكلام: تدفق نطق غير متسق بمعدل [${fluencyPercentage}% - مستوى: ${fluencyLevel}]، تتخلله (${weaknesses.filter(w => w.domain.includes('طلاقة')).map(w => w.item).join('، ') || '—'}).\n`;
    if (resonancePercentage < 80) clinicalImpression += `• الرنين والخنف الصوتي: كفاءة رنين قدرها [${resonancePercentage}% - مستوى: ${resonanceLevel}]، تبرز صعوبات في (${weaknesses.filter(w => w.domain.includes('الرنين')).map(w => w.item).join('، ') || '—'}).\n`;
    if (voicePercentage < 80) clinicalImpression += `• جودة ونبرة الصوت (CAPE-V): أداء بمعدل [${voicePercentage}% - مستوى: ${voiceLevel}]، رصد قصور في (${weaknesses.filter(w => w.domain.includes('جرس')).map(w => w.item).join('، ') || '—'}).\n`;
    if (pragmaticPercentage < 80) clinicalImpression += `• التواصل الاجتماعي والبراجماتي: مستوى جودة قدره [${pragmaticPercentage}% - مستوى: ${pragmaticLevel}]، مع قصور في (${weaknesses.filter(w => w.domain.includes('البراجماتي')).map(w => w.item).join('، ') || '—'}).\n`;
    if (aacPercentage < 80) clinicalImpression += `• جاهزية التواصل البديل للغير ناطقين: جاهزية قدرها [${aacPercentage}% - مستوى: ${aacLevel}]، يظهر قصوراً في مهارات (${weaknesses.filter(w => w.domain.includes('جاهزية')).map(w => w.item).join('، ') || '—'}).\n`;
    
    clinicalImpression += `\n🎯 الخطة التأهيلية المقترحة: بناءً على مخرجات هذا التقييم، تم اشتقاق عدد (${generatedIepGoals.length}) هدفاً سلوكياً قابلاً للقياس والدمج الفوري في برنامج الـ IEP لضمان رفع كفاءة التواصل والتكيف الاجتماعي والحركي الفمي للطالب.`;
  }

  return {
    accuracyRate,
    phoneticTested,
    phoneticCorrect,
    errorsCount: phoneticTested - phoneticCorrect,
    omissions: omissionCount,
    substitutions: substitutionCount,
    distortions: distortionCount,
    additions: additionCount,
    errorDetails,

    omeScore,
    omeMax,
    omeTested,
    omePercentage,
    omeLevel,
    omeColor,

    feedingScore,
    feedingMax,
    feedingTested,
    feedingPercentage,
    feedingLevel,
    feedingColor,

    phoneProcScore,
    phoneProcMax,
    phoneProcTested,
    phoneProcPercentage,
    phoneProcLevel,
    phoneProcColor,

    fluencyScore,
    fluencyMax,
    fluencyTested,
    fluencyPercentage,
    fluencyLevel,
    fluencyColor,

    resonanceScore,
    resonanceMax,
    resonanceTested,
    resonancePercentage,
    resonanceLevel,
    resonanceColor,

    voiceScore,
    voiceMax,
    voiceTested,
    voicePercentage,
    voiceLevel,
    voiceColor,

    pragmaticScore,
    pragmaticMax,
    pragmaticTested,
    pragmaticPercentage,
    pragmaticLevel,
    pragmaticColor,

    aacScore,
    aacMax,
    aacTested,
    aacPercentage,
    aacLevel,
    aacColor,

    overallAvgPercentage,
    overallLevel,
    overallColor,

    weaknesses,
    generatedIepGoals,
    clinicalImpression
  };
}
