/**
 * Easy Center — Assessment to IEP Bridge (منظومة الربط الأكاديمي والتربوي)
 * يقوم بتحليل بنود الضعف في المقاييس واستخراج أهداف سلوكية وتأهيلية مقننة للخطة الفردية
 */

import { uid } from './dateHelpers';

export const SCALE_GOAL_TEMPLATES = {
  // CARS-2 Items to IEP Goals
  cars: {
    1: {
      domain: 'social',
      code: 'SOC-CARS-1',
      title: 'التواصل والتفاعل مع الآخرين',
      goals: [
        { text: 'أن يستجيب الطفل للنداء باسمه من خلال الالتفات والتواصل البصري لمدة 3 ثوانٍ في 4 من 5 محاولات.', mastery: '80% استجابة صحيحة' },
        { text: 'أن يبادر الطفل بالتفاعل الاجتماعي الإيجابي مع الأخصائي أو الأقران بطلب المساعدة أو المشاركة في 3 مواقف يومياً.', mastery: '3 مرات يومياً بشكل مستقل' }
      ]
    },
    2: {
      domain: 'imitation',
      code: 'IMIT-CARS-2',
      title: 'التقليد والمحاكاة الحركية واللفظية',
      goals: [
        { text: 'أن يقلد الطفل 5 حركات كبرى (تصفيق، رفع اليدين، القفز) فور تقديم النموذج من الأخصائي.', mastery: 'إتقان بنسبة 90%' },
        { text: 'أن يقلد الطفل مقاطع صوتية وحركات فمية بسيطة (آه، أو، إي، فتح الفم) بنسبة دقة 80%.', mastery: '4 من أصل 5 محاولات' }
      ]
    },
    3: {
      domain: 'emotional',
      code: 'EMOT-CARS-3',
      title: 'الاستجابة الانفعالية والضبط الذاتي',
      goals: [
        { text: 'أن يعبر الطفل عن مشاعره (الفرح، الغضب، التعب) باستخدام بطاقات المشاعر أو الإشارة بدلاً من نوبات الصراخ.', mastery: '80% من المواقف' },
        { text: 'أن يستخدم الطفل استراتيجية التهدئة الذاتية (أخذ نفس عميق / الجلوس في الركن الهادئ) عند الإحباط.', mastery: 'بمساعدة لفظية بسيطة' }
      ]
    },
    4: {
      domain: 'motor',
      code: 'MOT-CARS-4',
      title: 'استخدام الجسم والتناسق الحركي',
      goals: [
        { text: 'أن يقلل الطفل من الحركات النمطية للجسم (الرفرفة / الاهتزاز) من خلال الانشغال بأدوات حسية بديلة أثناء الجلسة.', mastery: 'انخفاض بمعدل 70%' },
        { text: 'أن يؤدي الطفل تدريبات التوازن والمشي على خط مستقيم بثبات دون ترنح لمسافة 3 أمتار.', mastery: '3 محاولات متتالية صحيحة' }
      ]
    },
    5: {
      domain: 'play',
      code: 'PLAY-CARS-5',
      title: 'استخدام الأشياء واللعب الوظيفي',
      goals: [
        { text: 'أن يستخدم الطفل 4 ألعاب بطريقتها الوظيفية الصحيحة (تحريك السيارة، رص المكعبات، إطعام الدمية) لمدة 5 دقائق متواصلة.', mastery: 'لعب وظيفي مستقل لمدة 5 دقائق' },
        { text: 'أن يمتنع الطفل عن تحسس أو تدوير أجزاء اللعبة بشكل نمطي عند تقديم لعبة جديدة.', mastery: 'في 80% من فترات اللعب' }
      ]
    },
    6: {
      domain: 'routine',
      code: 'ROUT-CARS-6',
      title: 'التكيف مع التغيير والانتقال',
      goals: [
        { text: 'أن ينتقل الطفل بين الأنشطة اليومية بسلاسة باستخدام الجدول البصري اليومي دون إظهار مقاومة أو صراخ.', mastery: 'في 4 من 5 فترات انتقال' },
        { text: 'أن يتقبل الطفل تغييراً بسيطاً في ترتيب الجلسة أو مكان الأدوات بهدوء واستجابة للإشارة البصرية.', mastery: '80% من المرات' }
      ]
    },
    7: {
      domain: 'visual',
      code: 'VIS-CARS-7',
      title: 'الاستجابة البصرية والتواصل بالعين',
      goals: [
        { text: 'أن يحافظ الطفل على التواصل البصري المباشر مع المتحدث لمدة 3 إلى 5 ثوانٍ عند إلقاء التحية أو طلب شيء.', mastery: 'في 80% من فرص التواصل' },
        { text: 'أن يتبع الطفل بأعينه مسار ضوء أو جسم متحرك من اليمين إلى اليسار بسلاسة.', mastery: '3 من 3 محاولات' }
      ]
    },
    8: {
      domain: 'auditory',
      code: 'AUD-CARS-8',
      title: 'الاستجابة السمعية والانتباه للأصوات',
      goals: [
        { text: 'أن يستجيب الطفل للتعليمات اللفظية البسيطة المكونة من خطوة واحدة (تعال، اجلس، أعطني) دون الحاجة لمثير صوتي مرتفع.', mastery: '80% استجابة صحيحة' },
        { text: 'أن يقلل الطفل من التحسس أو تغطية الأذنين عند سماع الأصوات البيئية المعتادة من خلال التعرض التدريجي والتنظيم الحسي.', mastery: 'في البيئة الصفية المعتادة' }
      ]
    },
    9: {
      domain: 'sensory',
      code: 'SENS-CARS-9',
      title: 'الاستجابة للمس والشم والتذوق',
      goals: [
        { text: 'أن يتقبل الطفل ملامسة 3 ملامس حسية مختلفة (الصلصال، الرمل، الماء، الإسفنج) لمدة دقيقتين دون نفور.', mastery: 'تقبل بنجاح 80%' },
        { text: 'أن يمتنع الطفل عن وضع الأدوات غير المأكولة في فمه أثناء أداء الأنشطة الصفية.', mastery: 'غياب السلوك بنسبة 90%' }
      ]
    },
    10: {
      domain: 'fear',
      code: 'FEAR-CARS-10',
      title: 'الخوف والقلق العصبي',
      goals: [
        { text: 'أن يظهر الطفل استجابة أمان وتجنب حقيقي للمخاطر المحيطة (الدرج المرتفع، الأدوات الحادة أو الساخنة).', mastery: '100% في مواقف السلامة' },
        { text: 'أن يتفاعل الطفل بهدوء دون هلع عند مواجهة مواقف أو أشخاص غير مألوفين بمساندة الأخصائي.', mastery: 'في 80% من المواقف' }
      ]
    },
    11: {
      domain: 'verbal',
      code: 'COMM-CARS-11',
      title: 'التواصل اللفظي واللغة التعبيرية',
      goals: [
        { text: 'أن ينطق الطفل 10 كلمات وظيفية لطلب احتياجاته الأساسية (ماء، أكل، حمام، لعبة) بشكل تلقائي أو مقلد.', mastery: '80% من مرات الطلب' },
        { text: 'أن يقلل الطفل من ترديد الكلام الصدوي (الإيكولاليا) ويستبدلها باستجابة وظيفية مناسبة للسؤال.', mastery: 'تقليل الإيكولاليا بنسبة 70%' }
      ]
    },
    12: {
      domain: 'nonverbal',
      code: 'COMM-CARS-12',
      title: 'التواصل غير اللفظي والإيماءات',
      goals: [
        { text: 'أن يستخدم الطفل إشارة السبابة (Pointing) للإشارة إلى الشيء المرغوب من مسافة مترين.', mastery: 'في 8 من 10 فرص' },
        { text: 'أن يستخدم الطفل إيماءات الرأس أو اليد (نعم/لا/مع السلامة) للتعبير عن رغبته أو تحية الآخرين.', mastery: 'بشكل مستقل بنسبة 80%' }
      ]
    },
    13: {
      domain: 'activity',
      code: 'ACT-CARS-13',
      title: 'مستوى النشاط الحركي والجلوس',
      goals: [
        { text: 'أن يجلس الطفل على المقعد لأداء مهمة فردية موجهة لمدة 10 دقائق متواصلة دون مغادرة المكان.', mastery: 'في 4 من 5 جلسات' },
        { text: 'أن يوجه الطفل طاقته الحركية في نشاط حركي هادف بدلاً من الجري والتسلق العشوائي داخل القاعة.', mastery: '80% من فترات النشاط' }
      ]
    },
    14: {
      domain: 'cognitive',
      code: 'COG-CARS-14',
      title: 'المستوى العقلي والقدرات المعرفية',
      goals: [
        { text: 'أن يطابق الطفل 6 مجسمات بالصور المطابقة لها (حيوانات / فواكه / أدوات منزلية).', mastery: 'دقة 90% في 3 محاولات' },
        { text: 'أن يكمل الطفل لوحة بازل مكونة من 4 إلى 6 قطع خشبية مستقلة دون مساعدة.', mastery: 'إنجاز مستقل في دقيقتين' }
      ]
    },
    15: {
      domain: 'general',
      code: 'GEN-CARS-15',
      title: 'الانطباع العام والتكيف الشامل',
      goals: [
        { text: 'أن يتبع الطفل الروتين العام لليوم التأهيلي (الاصطفاف، الجلسة، الوجبة، المغادرة) بالحد الأدنى من المساعدة.', mastery: 'استقلالية 85%' },
        { text: 'أن يظهر الطفل تحسناً عاماً في الاستجابة للمدربين والبيئة الصفية خلال الفصل الدراسي.', mastery: 'تقييم دوري متقدم' }
      ]
    }
  },

  // Vineland-3 Adaptive Behavior Items to IEP Goals
  vineland_3: {
    vin_1: {
      domain: 'selfhelp',
      code: 'V3-EAT-1',
      title: 'تناول الطعام باستقلالية',
      goals: [
        { text: 'أن يتناول الطفل وجبته الغذائية باستخدام الملعقة والشوكة دون سكب الطعام على ملابسه بنسبة 80%.', mastery: 'خلال 3 وجبات متتالية' },
        { text: 'أن يشرب الطفل من الكوب العادي بيد واحدة أو بكلتا اليدين دون إسقاط الماء.', mastery: 'استقلالية تامة' }
      ]
    },
    vin_2: {
      domain: 'selfhelp',
      code: 'V3-TOIL-2',
      title: 'النظافة واستخدام دورة المياه',
      goals: [
        { text: 'أن يطلب الطفل الذهاب إلى دورة المياه قبل الحاجة الملحة لفظياً أو باستخدام البطاقة الرمزية.', mastery: 'في 90% من الأوقات' },
        { text: 'أن يقوم الطفل بغسل وتجفيف يديه بالصابون والمنشفة بعد استخدام الحمام باتباع الخطوات المتسلسلة.', mastery: 'إتقان 100%' }
      ]
    },
    vin_3: {
      domain: 'selfhelp',
      code: 'V3-DRESS-3',
      title: 'ارتداء وخلع الملابس',
      goals: [
        { text: 'أن يرتدي الطفل ويخلع حذاءه (بشريط لاصق فيلكرو) والسترة الخفيفة بمفرده دون مساعدة.', mastery: 'في 4 من 5 أيام' },
        { text: 'أن يتعرف الطفل على الجهة الأمامية والخلفية للملابس قبل ارتدائها.', mastery: 'دقة 80%' }
      ]
    },
    vin_4: {
      domain: 'language',
      code: 'V3-COMM-4',
      title: 'التعبير عن الاحتياجات الأساسية',
      goals: [
        { text: 'أن يعبر الطفل عن 5 احتياجات ورغبات يومية باستخدام جملة مكونة من كلمتين على الأقل (أريد ماء / افتح الباب).', mastery: 'في 80% من المواقف اليومية' }
      ]
    },
    vin_5: {
      domain: 'language',
      code: 'V3-RECP-5',
      title: 'اتباع التعليمات اللفظية',
      goals: [
        { text: 'أن ينفذ الطفل تعليمة مركبة من خطوتين متتاليتين (ضع الكتاب في الحقيبة ثم أغلقها).', mastery: 'في 4 من 5 محاولات' }
      ]
    },
    vin_6: {
      domain: 'social',
      code: 'V3-SOC-6',
      title: 'المشاركة واللعب الاجتماعي',
      goals: [
        { text: 'أن يشارك الطفل في لعبة تفاعلية بسيطة مع أحد الأقران لمدة 10 دقائق مع تبادل الدور.', mastery: 'في 3 جلسات متتالية' }
      ]
    },
    vin_7: {
      domain: 'emotional',
      code: 'V3-EMOT-7',
      title: 'التحكم بالانفعالات والسلامة',
      goals: [
        { text: 'أن يمتنع الطفل عن سلوكيات العض أو الضرب عند منعه من رغبة معينة والتعبير بالكلمات أو الإشارة البديلة.', mastery: 'انعدام السلوك لمدة أسبوعين متتاليين' }
      ]
    },
    vin_8: {
      domain: 'independence',
      code: 'V3-SAFE-8',
      title: 'السلامة والوقاية من المخاطر',
      goals: [
        { text: 'أن يتوقف الطفل فوراً عند سماع كلمة "قف / انتبه" عند الاقتراب من خطر أو الشارع.', mastery: '100% استجابة فورية' }
      ]
    },
    vin_9: {
      domain: 'independence',
      code: 'V3-COMMU-9',
      title: 'التنقل واستقلالية البيئة',
      goals: [
        { text: 'أن ينتقل الطفل من قاعة النشاط إلى الفصل أو دورة المياه بالمركز بمفرده وبشكل آمن.', mastery: 'استقلالية تامة' }
      ]
    },
    vin_10: {
      domain: 'cognitive',
      code: 'V3-TIME-10',
      title: 'المهارات المعرفية والمالية البسيطة',
      goals: [
        { text: 'أن يتعرف الطفل على الفئات النقدية الأساسية (ريال، 5 ريالات، 10 ريالات) ويستخدمها في نشاط الشراء التخيلي.', mastery: 'دقة 80%' }
      ]
    }
  },

  // Portage Early Intervention Items to IEP Goals
  portage_early: {
    port_1: {
      domain: 'cognitive',
      code: 'PORT-COG-1',
      title: 'المجال المعرفي والإدراكي',
      goals: [
        { text: 'أن يصنف الطفل 12 عنصراً حسب اللون (أحمر، أزرق، أصفر، أخضر) في 4 أوعية منفصلة.', mastery: 'دقة 90%' },
        { text: 'أن يتعرف الطفل على مفهوم (واحد / كثير) و(كبير / صغير) بالإشارة إلى المجموعات المناسبة.', mastery: '8 من 10 محاولات' }
      ]
    },
    port_2: {
      domain: 'gross_motor',
      code: 'PORT-GM-2',
      title: 'المجال الحركي الكلي والتوازن',
      goals: [
        { text: 'أن يقفز الطفل بكلتا القدمين معاً للأمام متجاوزاً خطاً على الأرض 5 مرات متتالية.', mastery: 'أداء صحيح بنسبة 80%' },
        { text: 'أن يركل الطفل كرة ثابتة بقدم واحدة لمسافة مترين دون أن يفقد توازنه.', mastery: '4 من 5 محاولات' }
      ]
    },
    port_3: {
      domain: 'fine_motor',
      code: 'PORT-FM-3',
      title: 'المجال الحركي الدقيق ومسك الأدوات',
      goals: [
        { text: 'أن يمسك الطفل قلم التلوين بقبضة ثلاثية صحيحة ويقوم بالتلوين داخل حدود شكل هندسي بسيط.', mastery: '80% داخل الحدود' },
        { text: 'أن يركب الطفل 6 خرزات كبيرة في خيط سميك بالتتابع.', mastery: 'إنجاز مستقل في 3 دقائق' }
      ]
    },
    port_4: {
      domain: 'language',
      code: 'PORT-LANG-4',
      title: 'مجال اللغة والتواصل النمائي',
      goals: [
        { text: 'أن يسمي الطفل 10 صور لأشياء مألوفة في بيئته المنزلية والصفية عند الإشارة إليها وسؤاله "ما هذا؟".', mastery: 'دقة 90%' },
        { text: 'أن يستخدم الطفل حروف الجر (في / على / تحت) في التعبير عن أماكن الأشياء بجمل صحيحة.', mastery: '8 من 10 محاولات' }
      ]
    },
    port_5: {
      domain: 'selfhelp',
      code: 'PORT-SELF-5',
      title: 'مجال الرعاية الذاتية والاستقلالية',
      goals: [
        { text: 'أن يخلع الطفل حذاءه وجواربه ويضعهما في المكان المخصص عند الوصول إلى الفصل.', mastery: 'بشكل يومي ومستقل' },
        { text: 'أن يستخدم المنديل لتنظيف أنفه وفمه عند توجيهه لفظياً دون مساعدة جسدية.', mastery: '80% من المرات' }
      ]
    },
    port_6: {
      domain: 'social',
      code: 'PORT-SOC-6',
      title: 'المجال الاجتماعي والانفعالي',
      goals: [
        { text: 'أن يحيي الطفل زملاءه ومعلميه بقول "السلام عليكم / مرحباً" مع التلويح باليد عند الدخول والخروج.', mastery: 'بشكل يومي بنسبة 80%' },
        { text: 'أن ينتظر الطفل دوره في نشاط جماعي لمدة دقيقة واحدة بالجلوس الهادئ.', mastery: 'في 4 من 5 فرص' }
      ]
    }
  },

  // Conners-3 ADHD Items to IEP Goals
  conners_3: {
    adhd_1: {
      domain: 'academic',
      code: 'CON-ATT-1',
      title: 'الحفاظ على الانتباه وتركيز المهمة',
      goals: [
        { text: 'أن يركز الطالب على أداء ورقة العمل أو المهمة التعليمية لمدة 10 دقائق متواصلة دون توقف بمساعدة مؤقت بصري.', mastery: 'في 4 من 5 حصص' }
      ]
    },
    adhd_4: {
      domain: 'motor',
      code: 'CON-HYP-4',
      title: 'تنظيم النشاط الحركي والجلوس',
      goals: [
        { text: 'أن يبقى الطالب في مقعده الدراسي طوال فترة الشرح (15 دقيقة) مع توفير وسادة حسية أو أداة تفريغ طاقة.', mastery: '80% من الحصص الصفية' }
      ]
    },
    adhd_8: {
      domain: 'social',
      code: 'CON-IMP-8',
      title: 'ضبط الاندفاعية وتبادل الأدوار',
      goals: [
        { text: 'أن يرفع الطالب يده وينتظر الإذن من المعلم قبل الإجابة على الأسئلة الصفية في 8 من كل 10 أسئلة.', mastery: '80% التزام' }
      ]
    }
  },

  // GARS-3 (Gilliam-3) Items to IEP Goals
  gars_3: {
    1: {
      domain: 'behavior',
      code: 'GARS-RB-1',
      title: 'تقليل السلوكيات النمطية واستثمار وقت الفراغ',
      goals: [
        { text: 'أن ينخرط الطفل في نشاط لعب منظم أو تركيب بازل لمدة 7 دقائق متواصلة عند تركه بمفرده دون اللجوء لسلوكيات نمطية.', mastery: 'في 4 من 5 فترات فراغ' }
      ]
    },
    6: {
      domain: 'motor',
      code: 'GARS-RB-6',
      title: 'تقليل رفرفة اليدين والبدائل الحسية',
      goals: [
        { text: 'أن يستبدل الطفل رفرفة اليدين بالضغط على كرة حسية أو وضع اليدين في الجيب فور التوجيه البصري.', mastery: 'انخفاض بمعدل 80%' }
      ]
    },
    8: {
      domain: 'play',
      code: 'GARS-RB-8',
      title: 'اللعب الوظيفي بالألعاب والسيارات',
      goals: [
        { text: 'أن يدفع الطفل السيارة على المسار المخصص أو مسار الطرق بدلاً من قلبها وتدوير عجلاتها.', mastery: 'لعب وظيفي بنسبة 85%' }
      ]
    },
    14: {
      domain: 'social',
      code: 'GARS-SI-14',
      title: 'المبادأة بالمحادثة والتواصل مع الأقران',
      goals: [
        { text: 'أن يبادر الطفل بإلقاء التحية أو طلب مشاركة اللعبة مع زميل في الفصل مرتين على الأقل يومياً.', mastery: 'مبادأة مستقلة بنسبة 80%' }
      ]
    },
    17: {
      domain: 'social',
      code: 'GARS-SI-17',
      title: 'الانتباه المشترك وتتبع إشارات الآخرين',
      goals: [
        { text: 'أن ينظر الطفل باتجاه الشيء الذي يشير إليه المعلم أو الفاحص خلال ثانيتين من تقديم الإشارة.', mastery: 'في 8 من 10 محاولات' }
      ]
    },
    24: {
      domain: 'social',
      code: 'GARS-SI-24',
      title: 'التفاعل الاجتماعي المتبادل (الوداع والتحية)',
      goals: [
        { text: 'أن يلوح الطفل بيده استجابة لوداع الآخرين (باي باي) مع التواصل البصري.', mastery: 'في 90% من مواقف الوداع' }
      ]
    },
    28: {
      domain: 'communication',
      code: 'GARS-SC-28',
      title: 'فهم وتفسير المشاعر والدعابة الاجتماعية',
      goals: [
        { text: 'أن يميز الطفل تعبيرات الوجه (مسرور، غاضب، حزين) ويربطها بالسياق الاجتماعي المناسب بنسبة 80%.', mastery: '4 من 5 بطاقات' }
      ]
    },
    37: {
      domain: 'emotional',
      code: 'GARS-ER-37',
      title: 'التكيف الانفعالي مع التغييرات والمواقف الطارئة',
      goals: [
        { text: 'أن يتقبل الطفل تغييراً في خطة النشاط باستخدام جدول التواصل البصري دون الدخول في نوبات غضب.', mastery: 'في 80% من مواقف التغيير' }
      ]
    },
    42: {
      domain: 'sensory',
      code: 'GARS-ER-42',
      title: 'التنظيم الحسي للأصوات المرتفعة والضوضاء',
      goals: [
        { text: 'أن يستخدم الطفل سماعات إلغاء الضوضاء أو استراتيجية الاسترخاء بدلاً من الصراخ عند سماع صوت مفاجئ.', mastery: 'في 4 من 5 مواقف' }
      ]
    },
    52: {
      domain: 'language',
      code: 'GARS-MS-52',
      title: 'تقليل المصاداة (الإيكولاليا) وبناء الاستجابة الوظيفية',
      goals: [
        { text: 'أن يجيب الطفل على الأسئلة المباشرة (ما اسمك؟ / ماذا تريد؟) بإجابة وظيفية صحيحة دون تكرار السؤال.', mastery: 'دقة 80% في 5 جلسات متتالية' }
      ]
    },
    56: {
      domain: 'language',
      code: 'GARS-MS-56',
      title: 'الاستخدام الصحيح لضمائر المتكلم والمخاطب',
      goals: [
        { text: 'أن يستخدم الطفل الضمير "أنا" للتعبير عن رغباته وملكيته بدلاً من استخدام اسمه أو الضمير "هو".', mastery: 'في 8 من 10 جمل' }
      ]
    }
  }
};

/**
 * تحليل درجات استجابة المقياس واستخراج الأهداف السلوكية المقترحة لنقاط الاحتياج
 * @param {string} measureId - معرف المقياس (cars, gars3, vineland_3, portage_early, ...)
 * @param {object} responses - درجات البنود المسجلة
 * @param {Array} items - قائمة بنود المقياس
 * @returns {Array} قائمة الأهداف المقترحة مع الأكواد ومستويات الإتقان
 */
export function extractRecommendedGoals(measureId, responses = {}, items = []) {
  const recommended = [];
  const rawId = (measureId || 'cars').toLowerCase().replace(/[-_]/g, '');
  
  let lookupKey = 'cars';
  if (rawId.includes('cars')) lookupKey = 'cars';
  if (rawId.includes('ldes') || rawId.includes('learningdiff') || rawId.includes('learning')) lookupKey = 'learning_difficulties';
  else if (rawId.includes('pep3') || rawId.includes('pep')) lookupKey = 'pep3';
  else if (rawId.includes('gars')) lookupKey = 'gars_3';
  else if (rawId.includes('srs')) lookupKey = 'srs';
  else if (rawId.includes('vineland')) lookupKey = 'vineland_3';
  else if (rawId.includes('portage')) lookupKey = 'portage_early';
  else if (rawId.includes('conners')) lookupKey = 'conners_3';
  else if (rawId.includes('speech') || rawId.includes('artic')) lookupKey = 'speech_screening';
  else if (rawId.includes('beh')) lookupKey = 'behavior_adjustment';
  else if (SCALE_GOAL_TEMPLATES[measureId]) lookupKey = measureId;

  const templates = SCALE_GOAL_TEMPLATES[lookupKey] || {};

  if (lookupKey === 'learning_difficulties') {
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      const targetItem = items.find(it => String(it.id) === String(itemId));
      if (targetItem && (numScore === 2 || numScore === 3)) {
        const cleanText = targetItem.text.replace('صعوبة ', '').replace('ضعف ', '').replace('الخلط في ', '');
        let goalText = `أن يظهر الطالب إتقاناً وتحسناً ملموساً في مهارة (${cleanText}) بنسبة دقة لا تقل عن 80% في الأنشطة الصفية وغرفة المصادر.`;
        if (numScore === 3) {
          goalText = `أن يتلقى الطالب تدخلاً علاجياً مكثفاً باستخدام أسلوب الحواس المتعددة لمعالجة (${cleanText}) وتحقيق نسبة إتقان 80% في 4 من أصل 5 محاولات.`;
        }
        recommended.push({
          id: uid(),
          code: `LDES-${targetItem.domainId ? targetItem.domainId.slice(0, 3).toUpperCase() : 'LD'}-${itemId}`,
          domain: targetItem.domainId || 'academic',
          title: `علاج صعوبة: ${targetItem.text.slice(0, 35)}...`,
          text: goalText,
          mastery: numScore === 3 ? 'تدخل علاجي مكثف 80%' : 'إتقان صفي بنسبة 80%',
          reason: `مشتق من مقياس LDES بند [${itemId}] بمستوى صعوبة (${numScore === 3 ? 'شديدة دائمة' : 'متوسطة ملحوظة'})`,
          priority: numScore === 3 ? 'high' : 'medium',
          status: 'قيد التدريب',
        });
      }
    });
  } else if (lookupKey === 'pep3') {
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      const targetItem = items.find(it => String(it.id) === String(itemId));
      if (targetItem && (numScore === 0 || numScore === 1)) {
        const cleanText = targetItem.text.replace('يستطيع ', '').replace('القدرة على ', '').replace('تمكن من ', '');
        let goalText = `أن يظهر الطفل مهارة (${cleanText}) بنسبة إتقان لا تقل عن 80% في جلسات التربية الخاصة والتدريب النمائي.`;
        if (numScore === 1) {
          goalText = `أن يتم تعزيز مهارة بزوغ (Emerging) لدى الطفل لكي ينجزها بنجاح تام: (${cleanText}) بشكل مستقل في 4 من أصل 5 محاولات متتالية.`;
        } else {
          goalText = `أن يتعلم ويؤدي الطفل بنجاح مهارة: (${cleanText}) بالاعتماد على التلقين الجسدي واللفظي المتناقص بنسبة إتقان 80%.`;
        }
        recommended.push({
          id: uid(),
          code: `PEP3-${itemId.toUpperCase()}`,
          domain: targetItem.domainId || 'cognitive',
          title: `تطوير مهارة PEP-3: ${targetItem.text.slice(0, 30)}...`,
          text: goalText,
          mastery: numScore === 1 ? 'إنجاز مستقل تماماً' : 'تلقين جسدي متناقص بنسبة 80%',
          reason: `مشتق من بند PEP-3 رقم [${itemId}] بمستوى استجابة (${numScore === 1 ? 'بزوغ (Emerging)' : 'إخفاق (Fail)'})`,
          priority: numScore === 0 ? 'high' : 'medium',
          status: 'قيد التدريب',
        });
      }
    });
  } else if (lookupKey === 'srs') {
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      const targetItem = items.find(it => String(it.id) === String(itemId));
      if (targetItem) {
        const isDeficit = targetItem.isReverse ? (numScore <= 2) : (numScore >= 3);
        if (isDeficit) {
          const itemText = targetItem.text;
          const cleanText = itemText.replace('قادر على ', '').replace('يستطيع ', '').replace('يعرف كيف ', '');
          let goalText = `أن يظهر الطفل تحسناً في (${cleanText}) بنسبة لا تقل عن 80% بالاستعانة بالنمذجة السلوكية والتدريب الاجتماعي.`;
          if (targetItem.isReverse) {
            goalText = `أن يُظهِر الطفل قدرة مناسبة على (${cleanText}) في فترات التفاعل مع المعلمين والأقران بنسبة إتقان 80%.`;
          } else {
            goalText = `أن يتم تقليل سلوك القصور الاجتماعي المتمثل في (${cleanText}) واستبداله بسلوك تفاعلي تواصل لائق في 4 من أصل 5 مناسبات.`;
          }
          recommended.push({
            id: uid(),
            code: `SRS-${itemId.toUpperCase()}`,
            domain: targetItem.domainId || 'social',
            title: `تطوير مهارة: ${targetItem.text.slice(0, 35)}...`,
            text: goalText,
            mastery: '80% نجاح في مواقف التقييم اليومية',
            reason: `مشتق من بند SRS-2 رقم [${itemId}] بدرجة قصور (${numScore === 4 ? 'شدة عالية' : 'شدة متوسطة'})`,
            priority: numScore === 4 ? 'high' : 'medium',
            status: 'قيد التدريب',
          });
        }
      }
    });
  } else if (lookupKey === 'cars') {
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      if (numScore >= 2.0) {
        const itemTemplate = templates[itemId] || templates[Number(itemId)];
        if (itemTemplate) {
          itemTemplate.goals.forEach((g) => {
            recommended.push({
              id: uid(),
              code: itemTemplate.code,
              domain: itemTemplate.domain,
              title: itemTemplate.title,
              text: g.text,
              mastery: g.mastery,
              reason: `مشتق من بند CARS [${itemId}] بدرجة تقييم (${numScore}) - احتياج نمائي ملح`,
              priority: numScore >= 3.0 ? 'high' : 'medium',
              status: 'قيد التدريب',
            });
          });
        }
      }
    });
  } else if (lookupKey === 'gars_3') {
    // For GARS-3: items with score >= 2 (أحياناً / نعم كثيراً) are deficits
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      if (numScore >= 2) {
        const itemTemplate = templates[itemId] || templates[Number(itemId)];
        if (itemTemplate) {
          itemTemplate.goals.forEach((g) => {
            recommended.push({
              id: uid(),
              code: itemTemplate.code,
              domain: itemTemplate.domain,
              title: itemTemplate.title,
              text: g.text,
              mastery: g.mastery,
              reason: `مشتق من بند جيليام-3 رقم [${itemId}] بدرجة تكرار (${numScore})`,
              priority: numScore === 3 ? 'high' : 'medium',
              status: 'قيد التدريب',
            });
          });
        } else {
          // Dynamic goal for this GARS-3 item
          const targetItem = items.find(it => String(it.id) === String(itemId));
          if (targetItem) {
            recommended.push({
              id: uid(),
              code: `GARS-GOAL-${itemId}`,
              domain: targetItem.domainId || 'behavior',
              title: `علاج وتعديل سلوك بند [${itemId}]`,
              text: `أن يقلل الطفل من تكرار سلوك (${targetItem.text}) بنسبة تحسن 75% مع تعزيز السلوك البديل الإيجابي.`,
              mastery: 'انخفاض التكرار بنسبة 75%',
              reason: `مشتق من مقياس جيليام 3 - البند [${itemId}] بدرجة (${numScore})`,
              priority: numScore === 3 ? 'high' : 'medium',
              status: 'قيد التدريب',
            });
          }
        }
      }
    });
  } else {
    // For other scales: check items with scores indicating deficit
    // Usually lowest score or highest problem score
    items.forEach((it) => {
      const respVal = Number(responses[it.id] ?? 0);
      const isDeficit = (it.minValue === 0 && respVal <= 1) || (it.minValue === 1 && respVal <= 2) || (respVal >= 2 && measureId.includes('behavior'));
      
      const itemTemplate = templates[it.id];
      if (itemTemplate && (isDeficit || Object.keys(responses).length === 0)) {
        itemTemplate.goals.forEach((g) => {
          recommended.push({
            id: uid(),
            code: itemTemplate.code,
            domain: itemTemplate.domain || it.domain || 'general',
            title: itemTemplate.title || it.text,
            text: g.text,
            mastery: g.mastery,
            reason: `مشتق من قياس: ${it.text}`,
            priority: 'medium',
            status: 'قيد التدريب',
          });
        });
      } else if (isDeficit) {
        // Fallback dynamic goal generator
        recommended.push({
          id: uid(),
          code: `GOAL-${it.id.toUpperCase()}`,
          domain: it.domain || 'general',
          title: it.text,
          text: `أن يظهر الطفل تحسناً ملموساً في مهارة (${it.text}) بنسبة إتقان لا تقل عن 80% في المواقف الصفية واليومية.`,
          mastery: 'إتقان 80% في 4 من 5 جلسات',
          reason: `مستخرج من بند المقياس: ${it.text}`,
          priority: 'medium',
          status: 'قيد التدريب',
        });
      }
    });
  }

  // If none found because child scored high, provide enrichment goals from top domains
  if (recommended.length === 0 && items.length > 0) {
    items.slice(0, 3).forEach((it) => {
      recommended.push({
        id: uid(),
        code: `ENR-${it.id.toUpperCase()}`,
        domain: it.domain || 'general',
        title: it.text,
        text: `أن يحافظ الطفل على إتقان وتعميم مهارة (${it.text}) مع أقران جدد وفي بيئات مختلفة.`,
        mastery: 'تعميم مستقل 90%',
        reason: `هدف تعزيز وتعميم للمهارة المتقنة`,
        priority: 'low',
        status: 'قيد التدريب',
      });
    });
  }

  return recommended;
}
