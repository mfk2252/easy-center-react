/**
 * Easy Center — Evidence-Based Strategies, Activities & Materials Bank
 * بنك الاستراتيجيات والأنشطة والوسائل التعليمية القائمة على الأدلة (EBP)
 * يدعم العمل بدون اتصال (Offline-First) والمزامنة الهجينة مع Firestore
 */

export const STRATEGY_DOMAINS = {
  auditory_comprehension: {
    id: 'auditory_comprehension',
    name: 'الاستيعاب والذاكرة السمعية',
    icon: '👂',
    strategies: [
      { id: 'chunking', title: 'التجزئة السمعية (Chunking)', desc: 'تقسيم التعليمات الطويلة إلى أجزاء ثنائية وثلاثية يسهل استيعابها وتخزينها.' },
      { id: 'verbal_rehearsal', title: 'التكرار والتسميع الذاتي (Verbal Rehearsal)', desc: 'تدريب الطفل على ترديد الكلمات والأرقام بصوت منخفض لتثبيتها في الذاكرة العاملة.' },
      { id: 'visual_cueing', title: 'التعزيز البصري للتعليمات (Visual Cueing)', desc: 'استخدام بطاقات مصورة متسلسلة تدعم التعليمات الشفهية.' },
      { id: 'multisensory_listening', title: 'الاستماع متعدد الحواس (Multisensory)', desc: 'دمج المؤثرات الصوتية بالحركة واللمس لتعميق الفهم والإصغاء.' },
    ],
    activities: [
      { id: 'simon_says', title: 'لعبة الأوامر المتسلسلة (Simon Says)', desc: 'تنفيذ أوامر سمعية متدرجة من خطوة إلى 3 خطوات.' },
      { id: 'story_recall', title: 'إعادة سرد أحداث قصة مسموعة قصيرة', desc: 'الاستماع لقصة من سطرين والإجابة عن (من، أين، ماذا حدث).' },
      { id: 'sound_matching', title: 'مطابقة الأصوات البيئية ومصادرها', desc: 'التعرف على أصوات الحيوانات والمركبات دون رؤيتها.' },
    ],
    materials: ['بطاقات بصرية متسلسلة', 'تسجيلات صوتية وقصص مسموعة', 'ألعاب الأوامر التفاعلية', 'سماعات عازلة للضوضاء']
  },

  spoken_language: {
    id: 'spoken_language',
    name: 'اللغة المنطوقة والتعبير الشفهي والتخاطب',
    icon: '🗣️',
    strategies: [
      { id: 'modeling_expansion', title: 'النمذجة والتوسيع اللغوي (Expansion)', desc: 'إعادة صياغة جملة الطفل مع إضافة مفردات وصفية وقواعد سليمة.' },
      { id: 'open_ended_prompting', title: 'التشجيع بالأسئلة المفتوحة', desc: 'طرح أسئلة تتطلب إجابات حوارية بدلاً من الاقتصار على نعم/لا.' },
      { id: 'mand_tact_training', title: 'تدريب الطلب والتسمية (Mand/Tact ABA)', desc: 'تحفيز مهارة التعبير من خلال استغلال الرغبة والدافعية المباشرة.' },
      { id: 'script_fading', title: 'التلقين بالنصوص المكتوبة أو المصورة وسحبها', desc: 'تقديم حوارات نمطية مصورة ثم إخفاؤها تدريجياً لتعزيز التلقائية.' },
    ],
    activities: [
      { id: 'picture_description', title: 'وصف لوحة أحداث متكاملة', desc: 'تسمية العناصر، الأفعال، وحروف الجر في لوحة تفاعلية.' },
      { id: 'story_sequencing', title: 'ترتيب بطاقات القصة وسردها شفهياً', desc: 'ترتيب 3 إلى 5 بطاقات متسلسلة زمنياً وروايتها بأسلوبه الخاص.' },
      { id: 'role_playing', title: 'لعب الأدوار والمحادثة الصفية (Role Playing)', desc: 'تمثيل مواقف يومية (في البقالة، عند الطبيب، في المدرسة).' },
    ],
    materials: ['بطاقات التسلسل القصصي', 'مجسمات ودمى محاكاة', 'لوحات الأحداث المركبة', 'مرايا التدريب النطقي']
  },

  academic_reading: {
    id: 'academic_reading',
    name: 'صعوبات القراءة (الديسلكسيا)',
    icon: '📖',
    strategies: [
      { id: 'orton_gillingham', title: 'منهج أورتن-جلنجهام متعدد الحواس (VAKT)', desc: 'دمج الرؤية والسمع واللمس والحركة العضلية في تمييز الحروف والأصوات.' },
      { id: 'phonological_awareness', title: 'التدريب على الوعي الفونولوجي', desc: 'التحليل والتركيب الصوتي للمقاطع والدمج الصوتي للكلمات.' },
      { id: 'repeated_reading', title: 'القراءة الجهرية المتكررة الموجهة (Repeated Reading)', desc: 'قراءة فقرة قصيرة 3 مرات لتنمية الطلاقة وسرعة المعالجة البصرية.' },
      { id: 'color_coding', title: 'الترميز اللوني للمقاطع والمدود والتشكيل', desc: 'تلوين الحركات الطويلة والقصيرة وحروف المد لتسهيل التمييز.' },
    ],
    activities: [
      { id: 'sand_tray_letters', title: 'كتابة الحروف على صينية الرمل والصلصال', desc: 'رسم الحرف ونطق صوته ودمجه في مقطع حركي.' },
      { id: 'syllable_clapping', title: 'التصفيق لتقطيع الكلمات إلى مقاطع صوتية', desc: 'تحديد عدد مقاطع الكلمة نطقاً وحركة.' },
      { id: 'word_families', title: 'عائلات الكلمات المتشابهة في الوزن والقافية', desc: 'توليد كلمات تشترك في نفس الجذر أو المقطع الأخير.' },
    ],
    materials: ['بطاقات الحروف الرملية', 'صواني الرمل والصلصال', 'كتب القراءة المتدرجة الملونة', 'نوافذ القراءة البصرية (Reading Trackers)']
  },

  academic_writing: {
    id: 'academic_writing',
    name: 'صعوبات الكتابة والإملاء (الديسجرافيا)',
    icon: '✍️',
    strategies: [
      { id: 'fine_motor_warmup', title: 'تمارين التهيئة والتسخين الحركي للأصابع', desc: 'تمارين تقوية قبضة اليد والعضلات الدقيقة قبل بدء الكتابة.' },
      { id: 'pencil_grip_adaptation', title: 'استخدام مثبتات ومقابض الأقلام المريحة (Pencil Grips)', desc: 'تصحيح قبضة القلم الثلاثية لتقليل الإجهاد العضلي.' },
      { id: 'visual_grid_lines', title: 'الورق المسطر ذو الموجهات الملونة والشبكات', desc: 'تحديد أسطر البداية والنهاية ومسافات الكلمات بألوان واضحة.' },
      { id: 'spelling_mnemonics', title: 'استراتيجيات التذكر البصري للهجاء (Visual Mnemonics)', desc: 'ربط شكل الحرف برسم رمزي لتثبيت القاعدة الإملائية.' },
    ],
    activities: [
      { id: 'tracing_dotted_lines', title: 'تتبع المسارات والخطوط المنحنية والمستقيمة', desc: 'التحكم في اتجاه القلم من اليمين لليسار.' },
      { id: 'clay_modeling_letters', title: 'تشكيل الحروف بالصلصال والملاقط', desc: 'تقوية عضلات الأصابع وبناء الإدراك المكاني للرسم.' },
      { id: 'word_building_blocks', title: 'بناء الكلمات بالمكعبات الحرفية قبل كتابتها', desc: 'التهجئة اليدوية ثم نقلها دفترياً.' },
    ],
    materials: ['أقلام ومقابض سيليكون مثلثة', 'أوراق مسطرة بألوان إرشادية', 'صلصال علاجي وملاقط دقيقة', 'سبورات بيضاء مسطرة']
  },

  academic_math: {
    id: 'academic_math',
    name: 'صعوبات الحساب والرياضيات (الديسكالكوليا)',
    icon: '🔢',
    strategies: [
      { id: 'cpa_approach', title: 'استراتيجية الانتقال من المحسوس لشبه المحسوس ثم المجرد (CPA)', desc: 'استخدام المجسمات ثم الصور قبل كتابة الرموز الرياضية.' },
      { id: 'number_line_spatial', title: 'التدريب المكاني على خط الأعداد الملموس', desc: 'المشي أو تحريك مجسم على خط الأعداد لتمثيل الجمع والطرح.' },
      { id: 'visual_problem_solving', title: 'تفكيك المسائل اللفظية بالرسم والتخطيط (Singapore Math)', desc: 'تحويل المسألة الكلامية إلى شرائط ومربعات مرئية.' },
    ],
    activities: [
      { id: 'manipulatives_counting', title: 'العد والجمع بقطع دينز الملموسة والمعداد', desc: 'تمثيل الآحاد والعشرات والمئات بالمجسمات.' },
      { id: 'dot_math_game', title: 'ألعاب نقاط النرد والدوامينو', desc: 'التعرف السريع على الكميات دون عد مفرد (Subitizing).' },
      { id: 'market_simulation', title: 'لعبة الشراء والبيع والنقود (متجر الصف)', desc: 'حساب القيم المالية، الباقي، والتعاملات الحسابية الواقعية.' },
    ],
    materials: ['مجموعات قطع دينز الحسابية', 'معداد حسابي خرزي', 'خط أعداد أرضي ملموس', 'نقود ونماذج تسوق تعليمية']
  },

  orientation_spatial_temporal: {
    id: 'orientation_spatial_temporal',
    name: 'المعرفة العامة والتوجه المكاني والزماني',
    icon: '🧭',
    strategies: [
      { id: 'visual_daily_schedule', title: 'الجداول والروزنامات البصرية اليومية والأسبوعية', desc: 'ربط فترات اليوم بالصور والأنشطة لترسيخ مفهوم الزمن والترتيب.' },
      { id: 'directional_body_markers', title: 'علامات الجسم الملونة لليمين واليسار (Body Markers)', desc: 'وضع شريط ملون في المعصم الأيمن لترسيخ الاتجاه المكاني.' },
      { id: 'spatial_prepositions_training', title: 'التدريب الحركي على مفاهيم الفراغ والعلاقات', desc: 'التطبيق العملي لمفاهيم (فوق، تحت، أمام، خلف، يمين، يسار).' },
    ],
    activities: [
      { id: 'treasure_map_hunt', title: 'خريطة الكنز والتنقل المكاني في المركز', desc: 'اتباع خريطة مصورة بالأسهم للوصول إلى هدف محدد.' },
      { id: 'clock_hands_matching', title: 'ساعة تدريبية يدوية بمؤشرات ملونة', desc: 'مطابقة عقارب الساعة بالمواقف والأوقات المحددة.' },
      { id: 'spatial_obstacle_course', title: 'مسار الحواجز والاتجاهات الحركي', desc: 'المرور بين أقماع وأطواق مع تسمية الاتجاه المطلوب.' },
    ],
    materials: ['جدول زمني بصري تفاعلي', 'ساعة تعليمية كبيرة بعقارب يدوية', 'خرائط ومخططات مبسطة', 'أطواق وأقماع تدريبية']
  },

  motor_coordination: {
    id: 'motor_coordination',
    name: 'التناسق الحركي والتوازن والمهارات اليدوية',
    icon: '🤸',
    strategies: [
      { id: 'sensory_motor_integration', title: 'التكامل الحسي الحركي (Sensory Integration)', desc: 'تدريبات التحفيز الدهليزي وتناسق حركات الجذع والأطراف.' },
      { id: 'bilateral_coordination', title: 'التآزر الحركي الثنائي بين اليدين', desc: 'استخدام كلتا اليدين بتوافق في المهام الحركية.' },
      { id: 'graduated_physical_guidance', title: 'التوجيه البدني المتدرج وسحبه (Hand-over-hand)', desc: 'المساعدة اليدوية الكاملة ثم الجزئية ثم الإشارة.' },
    ],
    activities: [
      { id: 'balance_beam_walk', title: 'المشي على لوح التوازن وعصا التوازن', desc: 'الحفاظ على ثبات الجسم والمشي للأمام وللخلف.' },
      { id: 'scissor_cutting_shapes', title: 'قص الأشكال والخطوط بالمقص الآمن', desc: 'التآزر البصري الحركي والدقة في مسك المقص والورقة.' },
      { id: 'pegboard_patterns', title: 'لوحة الأوتاد وخرز الخيوط الدقيقة', desc: 'التقاط الخرز والأوتاد الصغيرة بالإبهام والسبابة.' },
    ],
    materials: ['لوح توازن خشبي', 'مقصات أطفال آمنة بنابض مساند', 'لوحات أوتاد وأطقم خرز', 'كرات توازن علاجية سويسرية']
  },

  personal_social_behavior: {
    id: 'personal_social_behavior',
    name: 'السلوك الشخصي والاجتماعي والضبط الذاتي',
    icon: '🤝',
    strategies: [
      { id: 'social_stories', title: 'القصص الاجتماعية المصورة (Social Stories)', desc: 'نصوص قصيرة مصورة تشرح السلوك المتوقع في المواقف الاجتماعية.' },
      { id: 'token_economy_positive', title: 'نظام التعزيز واللوحات الرمزية (Token Board)', desc: 'تجميع نجوم أو نقاط لاستبدالها بمكافأة بعد إنجاز المهمة.' },
      { id: 'first_then_visual', title: 'استراتيجية أولاً ثم (First / Then)', desc: 'ربط المهمة التعليمية بنشاط مرغوب فور انتهائها.' },
      { id: 'calm_down_zone', title: 'ركن التهدئة والتدريب على التنفس العميق', desc: 'استخدام استراتيجيات الضبط الذاتي عند الشعور بالتوتر أو التشتت.' },
    ],
    activities: [
      { id: 'turn_taking_games', title: 'ألعاب تبادل الأدوار وانتظار الدور', desc: 'ألعاب لوحية بسيطة تشترط انتظار الزميل قبل اللعب.' },
      { id: 'emotion_recognition_cards', title: 'بطاقات تمييز المشاعر والتعبير المناسب', desc: 'التعرف على وجوه الفرح والغضب والحزن والاستجابة لها.' },
      { id: 'task_completion_checklist', title: 'قوائم المراجعة البصرية للمهام المنجزة (Checklist)', desc: 'وضع علامة صح بعد إكمال كل واجب لتعزيز الاستقلالية.' },
    ],
    materials: ['لوحات التعزيز الرمزي (Token Boards)', 'بطاقات أولاً ثم (First-Then)', 'قصص اجتماعية مخصصة', 'أدوات حسية مهدئة (Fidgets)']
  },

  autism_communication: {
    id: 'autism_communication',
    name: 'التواصل والتفاعل لذوي اضطراب طيف التوحد',
    icon: '🧩',
    strategies: [
      { id: 'pecs_system', title: 'نظام التواصل بتبادل الصور (PECS)', desc: 'تدريب الطفل على تبادل البطاقة المصورة للحصول على المعزز.' },
      { id: 'teacch_structured', title: 'برنامج تيتش للتعليم المنظم (TEACCH)', desc: 'تنظيم البيئة المادية وصناديق المهام بوضوح بصري يقلل القلق.' },
      { id: 'dtt_aba', title: 'تدريب المحاولات المنفصلة (DTT - ABA)', desc: 'تجزئة المهارة إلى محاولات محددة وتقديم تعزيز فوري بعد كل استجابة.' },
      { id: 'video_modeling', title: 'النمذجة بالفيديو (Video Modeling)', desc: 'مشاهدة مقاطع فيديو قصيرة توضح السلوك المطلوب بدقة.' },
    ],
    activities: [
      { id: 'pecs_phase_exchange', title: 'جلسات تبادل الصور لطلب الأطعمة والألعاب', desc: 'تفعيل مراحل بيكس من الأولى حتى تكوين الجمل.' },
      { id: 'independent_work_boxes', title: 'صناديق المهام المستقلة ثلاثية الصناديق', desc: 'إنجاز مهمة وضع الأشكال من الصندوق الأيمن للأيسر.' },
      { id: 'joint_attention_bubbles', title: 'أنشطة الانتباه المشترك (الفقاعات والألعاب التفاعلية)', desc: 'جذب نظرات الطفل والتواصل البصري مع المدرب أثناء اللعب.' },
    ],
    materials: ['كتاب وملصقات بيكس PECS', 'صناديق مهام تيتش المنظمة', 'جداول بصرية ثلاثية الأبعاد', 'معززات حسية ومضيئة']
  }
};

/**
 * دالة مساعدة لجلب الاستراتيجيات والأنشطة والوسائل المقترحة حسب مجال الهدف
 */
export function getStrategiesForDomain(domainKey) {
  if (!domainKey) return STRATEGY_DOMAINS.personal_social_behavior;
  
  const key = String(domainKey).toLowerCase();

  if (key.includes('auditory') || key.includes('comp') || key.includes('listen') || key.includes('سمع')) {
    return STRATEGY_DOMAINS.auditory_comprehension;
  }
  if (key.includes('language') || key.includes('spoken') || key.includes('speech') || key.includes('verbal') || key.includes('نطق') || key.includes('لغة')) {
    return STRATEGY_DOMAINS.spoken_language;
  }
  if (key.includes('read') || key.includes('dyslexia') || key.includes('قراء')) {
    return STRATEGY_DOMAINS.academic_reading;
  }
  if (key.includes('writ') || key.includes('spell') || key.includes('dict') || key.includes('كتاب') || key.includes('إملاء')) {
    return STRATEGY_DOMAINS.academic_writing;
  }
  if (key.includes('math') || key.includes('calc') || key.includes('arith') || key.includes('حساب') || key.includes('رياضيات')) {
    return STRATEGY_DOMAINS.academic_math;
  }
  if (key.includes('orientation') || key.includes('spatial') || key.includes('time') || key.includes('مكان') || key.includes('زمان') || key.includes('اتجاه')) {
    return STRATEGY_DOMAINS.orientation_spatial_temporal;
  }
  if (key.includes('motor') || key.includes('balance') || key.includes('fine') || key.includes('حرك') || key.includes('توازن')) {
    return STRATEGY_DOMAINS.motor_coordination;
  }
  if (key.includes('autism') || key.includes('cars') || key.includes('gars') || key.includes('pecs') || key.includes('توحد')) {
    return STRATEGY_DOMAINS.autism_communication;
  }

  return STRATEGY_DOMAINS.personal_social_behavior;
}
