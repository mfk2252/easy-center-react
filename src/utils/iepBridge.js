/**
 * Easy Center — Assessment to IEP Bridge (منظومة الربط الأكاديمي والتربوي)
 * يقوم بتحليل بنود الضعف في المقاييس واستخراج أهداف سلوكية وتأهيلية مقننة للخطة الفردية
 */

import { uid } from './dateHelpers';
import { getStrategiesForDomain } from '../data/strategiesData';

export const SCALE_GOAL_TEMPLATES = {
  // Myklebust Pupil Rating Scale (PRS) - All 24 Items to IEP Goals
  myklebust: {
    myk_1: {
      domain: 'auditory_comprehension',
      code: 'MYK-AUD-1',
      title: 'فهم معاني الكلمات واستيعابها',
      goals: [
        { text: 'أن يستوعب التلميذ المفردات والكلمات الصفية الموجهة إليه ويستجيب لمعانيها بدقة في 80% من المواقف التعليمية.', mastery: 'إتقان 80% عبر جلستين متتاليتين' }
      ]
    },
    myk_2: {
      domain: 'auditory_comprehension',
      code: 'MYK-AUD-2',
      title: 'اتباع التعليمات والتوجيهات الصفية',
      goals: [
        { text: 'أن ينفذ التلميذ تعليمات لفظية مركبة من خطوتين إلى 3 خطوات في البيئة الصفية بشكل مستقل بنسبة دقة 80%.', mastery: 'في 4 من 5 مواقف صفية' }
      ]
    },
    myk_3: {
      domain: 'auditory_comprehension',
      code: 'MYK-AUD-3',
      title: 'المشاركة في المحادثة الصفية وفهم المناقشات',
      goals: [
        { text: 'أن يتابع التلميذ سياق المناقشة الصفية ويجيب عن أسئلة الفهم المتعلقة بموضوع الدرس بتركيز في 80% من الحصص.', mastery: 'مشاركة ملائمة بنسبة 80%' }
      ]
    },
    myk_4: {
      domain: 'auditory_comprehension',
      code: 'MYK-AUD-4',
      title: 'التذكر والاسترجاع السمعي للمعلومات',
      goals: [
        { text: 'أن يسترجع التلميذ سلسلة من 4 حقائق أو كلمات مسموعة في نهاية النشاط دون الحاجة لتكرار مستمر.', mastery: 'دقة 80% في 3 محاولات' }
      ]
    },
    myk_5: {
      domain: 'spoken_language',
      code: 'MYK-LANG-5',
      title: 'الثروة اللغوية واستخدام المفردات',
      goals: [
        { text: 'أن يوظف التلميذ مفردات دقيقة ومناسبة لعمره عند وصف الصور والمواقف التعليمية بنسبة تحسن 80%.', mastery: 'استخدام 10 مفردات جديدة بطلاقة' }
      ]
    },
    myk_6: {
      domain: 'spoken_language',
      code: 'MYK-LANG-6',
      title: 'استخدام القواعد النحوية وبناء الجمل',
      goals: [
        { text: 'أن يكوّن التلميذ جملاً تامة مكتملة الأركان خالية من الأخطاء التركيبية أثناء الحوار بنسبة دقة 85%.', mastery: 'في 8 من أصل 10 جمل شفهية' }
      ]
    },
    myk_7: {
      domain: 'spoken_language',
      code: 'MYK-LANG-7',
      title: 'تذكر واستدعاء المفردات المناسبة في السياق',
      goals: [
        { text: 'أن يستحضر التلميذ الكلمة المناسبة بسرعة ودون تردد أو توقف طويل عند التعبير عن أفكاره.', mastery: 'طلاقة تعبيرية بنسبة 80%' }
      ]
    },
    myk_8: {
      domain: 'spoken_language',
      code: 'MYK-LANG-8',
      title: 'سرد القصص والتعبير الشفهي المتسلسل',
      goals: [
        { text: 'أن يسرد التلميذ قصة قصيرة مرتبة الأحداث ذات بداية ووسط ونهاية مترابطة منطقياً في 4 من 5 محاولات.', mastery: 'سرد متسلسل مستقل 80%' }
      ]
    },
    myk_9: {
      domain: 'spoken_language',
      code: 'MYK-LANG-9',
      title: 'بناء الأفكار وتطوير المفاهيم المجردة',
      goals: [
        { text: 'أن يربط التلميذ بين السبب والنتيجة ويقدم تفسيراً منطقياً للمفاهيم التعليمية عند سؤاله.', mastery: 'إجابة منطقية بنسبة 80%' }
      ]
    },
    myk_10: {
      domain: 'orientation_spatial_temporal',
      code: 'MYK-ORI-10',
      title: 'إدراك الوقت والتنظيم الزمني',
      goals: [
        { text: 'أن يتعرف التلميذ على مفاهيم الوقت (اليوم، أمس، غداً، فترات الحصص) وينظم وقته لإنجاز المهام في الزمن المحدد.', mastery: 'دقة 85% في الجدول اليومي' }
      ]
    },
    myk_11: {
      domain: 'orientation_spatial_temporal',
      code: 'MYK-ORI-11',
      title: 'إدراك المكان والتنقل في البيئة المدرسية',
      goals: [
        { text: 'أن يتنقل التلميذ في أرجاء المدرسة وغرف الأنشطة باستقلالية دون أن يضل طريقه أو يتردد.', mastery: 'استقلالية 100%' }
      ]
    },
    myk_12: {
      domain: 'orientation_spatial_temporal',
      code: 'MYK-ORI-12',
      title: 'إدراك العلاقات والروابط المنطقية',
      goals: [
        { text: 'أن يستنتج التلميذ أوجه الشبه والاختلاف والعلاقات السببية بين الأشياء والأفكار المعروضة بدقة 80%.', mastery: '4 من أصل 5 محاولات' }
      ]
    },
    myk_13: {
      domain: 'orientation_spatial_temporal',
      code: 'MYK-ORI-13',
      title: 'معرفة وتطبيق الاتجاهات (يمين/يسار/شمال/جنوب)',
      goals: [
        { text: 'أن يميز التلميذ بين الاتجاهات (اليمين واليسار، فوق وتحت، أمام وخلف) على جسده وفي الفراغ بنسبة 90%.', mastery: 'دقة 90% في 5 أنشطة متتالية' }
      ]
    },
    myk_14: {
      domain: 'motor_coordination',
      code: 'MYK-MOT-14',
      title: 'التناسق الحركي العام والرشاقة',
      goals: [
        { text: 'أن يؤدي التلميذ الأنشطة الحركية والرياضية (الجري، القفز، تفادي العقبات) بتوافق وتوازن عضلي سليم.', mastery: 'أداء حركي متناسق بنسبة 85%' }
      ]
    },
    myk_15: {
      domain: 'motor_coordination',
      code: 'MYK-MOT-15',
      title: 'التوازن الثابت والمتحرك',
      goals: [
        { text: 'أن يحافظ التلميذ على توازن جسمه أثناء الوقوف على قدم واحدة أو المشي على خط مستقيم لمدة 10 ثوانٍ.', mastery: '3 محاولات متتالية ناجحة' }
      ]
    },
    myk_16: {
      domain: 'motor_coordination',
      code: 'MYK-MOT-16',
      title: 'الدقة والمهارة اليدوية واستخدام الأدوات',
      goals: [
        { text: 'أن يمسك التلميذ القلم والمقص والأدوات اليدوية بقبضة سليمة ويؤدي مهام الرسم والقص بدقة وتآزر بصري حركي.', mastery: 'دقة 80% في المهام اليدوية' }
      ]
    },
    myk_17: {
      domain: 'personal_social_behavior',
      code: 'MYK-SOC-17',
      title: 'التعاون والمشاركة مع الزملاء والمعلمين',
      goals: [
        { text: 'أن يشارك التلميذ في الأنشطة والمجموعات التعاونية ويتفاعل بإيجابية مع أقرانه في 80% من فرص العمل الجماعي.', mastery: 'مشاركة إيجابية في 4 من 5 أنشطة' }
      ]
    },
    myk_18: {
      domain: 'personal_social_behavior',
      code: 'MYK-SOC-18',
      title: 'الانتباه والتركيز واستدامة الانتباه للمهمة',
      goals: [
        { text: 'أن يحافظ التلميذ على تركيزه وانتباهه للمهمة التعليمية الفردية لمدة 15 دقيقة متواصلة دون تشتت ملحوظ.', mastery: 'في 4 من أصل 5 جلسات' }
      ]
    },
    myk_19: {
      domain: 'personal_social_behavior',
      code: 'MYK-SOC-19',
      title: 'التنظيم وترتيب الأدوات والواجبات',
      goals: [
        { text: 'أن يرتب التلميذ أدواته الدراسية وحقيبته المدرسية ويحافظ على نظافة طاولته بالحد الأدنى من التذكير.', mastery: 'استقلالية 85%' }
      ]
    },
    myk_20: {
      domain: 'personal_social_behavior',
      code: 'MYK-SOC-20',
      title: 'التصرف والتكيف في المواقف الجديدة',
      goals: [
        { text: 'أن يتعامل التلميذ بهدوء وثقة مع التغييرات الطارئة في الجدول المدرسي أو المعلمين دون قلق مفرط.', mastery: 'تكيف هادئ في 80% من المواقف' }
      ]
    },
    myk_21: {
      domain: 'personal_social_behavior',
      code: 'MYK-SOC-21',
      title: 'التقبل الاجتماعي وبناء الصداقات',
      goals: [
        { text: 'أن يبادر التلميذ بالتواصل المقبول ويكوّن علاقات إيجابية متبادلة مع زملائه في الصف وفترات الاستراحة.', mastery: 'تفاعل اجتماعي يومي إيجابي' }
      ]
    },
    myk_22: {
      domain: 'personal_social_behavior',
      code: 'MYK-SOC-22',
      title: 'المسؤولية الذاتية والاعتماد على النفس',
      goals: [
        { text: 'أن يتحمل التلميذ مسؤولية أدواته وواجباته المدرسية وينفذ المهام الموكلة إليه دون حاجة لمراقبة مستمرة.', mastery: 'إنجاز مستقل بنسبة 85%' }
      ]
    },
    myk_23: {
      domain: 'personal_social_behavior',
      code: 'MYK-SOC-23',
      title: 'إنجاز المهام والواجبات حتى النهاية',
      goals: [
        { text: 'أن يكمل التلميذ المهام والواجبات الصفية المكلف بها حتى نهايتها في الوقت المحدد قبل الانتقال لنشاط آخر.', mastery: 'في 80% من الحصص اليومية' }
      ]
    },
    myk_24: {
      domain: 'personal_social_behavior',
      code: 'MYK-SOC-24',
      title: 'احترام مشاعر الآخرين والذكاء الانفعالي',
      goals: [
        { text: 'أن يراعي التلميذ مشاعر زملائه ويتجنب السلوكيات المزعجة أو المقاطعة في المواقف الصفية والاجتماعية.', mastery: 'في 90% من المواقف الصفية' }
      ]
    }
  },
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

  // Family Disintegration Scale (مقياس التفكك الأسري)
  family_disintegration: {
    fam_1: {
      domain: 'family',
      code: 'FAM-ATT-1',
      title: 'الاستجابة لمطالب واحتياجات المفحوص',
      goals: [
        { text: 'أن تحدد الأسرة وقتاً يومياً ثابتاً للاستماع إلى مطالب المفحوص وتلبيتها بشكل متوازن بنسبة التزام 80%.', mastery: 'التزام أسري في 4 من 5 أيام أسبوعياً' }
      ]
    },
    fam_3: {
      domain: 'family',
      code: 'FAM-SUP-3',
      title: 'الدعم النفسي والتعامل مع المشكلات الفردية',
      goals: [
        { text: 'أن يشارك الوالدان في جلسات إرشادية أسبوعية لتعلم أساليب المساندة وحل المشكلات مع المفحوص بشكل إيجابي.', mastery: 'حضور 8 جلسات إرشادية متتالية' }
      ]
    },
    fam_4: {
      domain: 'family',
      code: 'FAM-EMO-4',
      title: 'الدفء الأسري والاحتواء العاطفي',
      goals: [
        { text: 'أن يقدم الوالدان عبارات تشجيع وتعزيز وجداني للمفحوص بمعدل 3 مرات يومياً لتعزيز شعوره بالأمان النفسي.', mastery: 'تحسن بنسبة 85% في مقياس الأمان العاطفي' }
      ]
    },
    fam_6: {
      domain: 'family',
      code: 'FAM-REL-6',
      title: 'بناء علاقة صداقة وثقة والدية',
      goals: [
        { text: 'أن يخصص الوالد نشاطاً ترفيهياً مشتركاً أسبوعياً مع المفحوص لتعزيز الثقة وكسر حواجز الخوف والتباعد.', mastery: 'تنفيذ نشاط أسبوعي لمدة شهرين' }
      ]
    },
    fam_10: {
      domain: 'family',
      code: 'FAM-BEH-10',
      title: 'إيقاف الشتائم والعنف اللفظي المنزلي',
      goals: [
        { text: 'أن تلتزم الأسرة بميثاق الحوار الإيجابي الخالي من الشتائم والإهانات اللفظية بنسبة انخفاض 90%.', mastery: 'بيئة حوارية خالية من الشتائم لأربعة أسابيع' }
      ]
    },
    fam_11: {
      domain: 'family',
      code: 'FAM-DOM-11',
      title: 'الحماية من العنف والنزاعات الزوجية',
      goals: [
        { text: 'أن يشارك الزوجان في برنامج استشارات زوجية وأسرية لحل الخلافات بالطرق السلمية وتجنيب الأبناء المشاهد العدوانية.', mastery: 'تحسن الاستقرار الزوجي بنسبة 80%' }
      ]
    },
    fam_12: {
      domain: 'family',
      code: 'FAM-RES-12',
      title: 'حل المشكلات الأسرية بطرق سلمية وديمقراطية',
      goals: [
        { text: 'أن تعتمد الأسرة أسلوب مجلس العائلة الدوري لحل المشكلات بالتفاهم ودون صراخ أو تهديد.', mastery: 'عقد اجتماعات أسرية أسبوعية منتظمة' }
      ]
    },
    fam_17: {
      domain: 'family',
      code: 'FAM-AFF-17',
      title: 'إشباع الحاجة للعطف والتشجيع الوالدي',
      goals: [
        { text: 'أن يظهر الوالد دعماً وتشجيعاً مباشراً لجهود وإنجازات المفحوص الصفية والتأهيلية في 90% من المناسبات.', mastery: 'متابعة دورية مع المرشد النفسي' }
      ]
    },
    fam_18: {
      domain: 'family',
      code: 'FAM-VER-18',
      title: 'تعديل أسلوب التخاطب الوالدي والحد من التجريح',
      goals: [
        { text: 'أن يستبدل الوالد لغة التأنيب والتجريح بالتوجيه الإيجابي والتعزيز السلوكي في جميع المواقف اليومية.', mastery: 'تطبيق التوجيه الإيجابي بنسبة 85%' }
      ]
    },
    fam_19: {
      domain: 'family',
      code: 'FAM-ABU-19',
      title: 'إيقاف العقاب البدني واستبداله بأساليب التعزيز',
      goals: [
        { text: 'أن يتوقف الوالد تماماً عن استخدام الضرب كوسيلة تأديب واعتماد أساليب تكلفة الاستجابة والتعزيز الإيجابي.', mastery: 'انعدام العقاب البدني 100%' }
      ]
    },
    fam_20: {
      domain: 'family',
      code: 'FAM-ACA-20',
      title: 'المتابعة التعليمية والمنزلية المنتظمة',
      goals: [
        { text: 'أن تتابع الأسرة الواجبات والتمارين التأهيلية المنزلية للمفحوص وتسجلها في دفتر المتابعة اليومي بدقة.', mastery: 'متابعة منزلية في 5 أيام أسبوعياً' }
      ]
    },
    fam_21: {
      domain: 'family',
      code: 'FAM-CON-21',
      title: 'خفض المشاحنات والشجار الأسري',
      goals: [
        { text: 'أن يتدرب أفراد الأسرة على مهارات إدارة الغضب والتواصل اللاعنفي للحد من الشجار والمشاحنات المنزلية.', mastery: 'انخفاض نوبات الشجار بنسبة 75%' }
      ]
    },
    fam_22: {
      domain: 'family',
      code: 'FAM-STR-22',
      title: 'المساندة النفسية أثناء الانفصال أو الهجر',
      goals: [
        { text: 'أن يتلقى المفحوص دعماً نفسياً وتأهيلياً لمساعدته على التكيف مع تغيرات البنية الأسرية دون تراجع أكاديمي.', mastery: 'استقرار انفعالي بنسبة 80%' }
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
 * تحليل درجات استجابة المقياس واستخراج الأهداف السلوكية والتأهيلية المقترحة
 * مرتبة حسب شدة القصور والأولوية الإكلينيكية، ومزودة بوصف مستوى الأداء الحالي (PLEP) وبنك الاستراتيجيات
 * @param {string} measureId - معرف المقياس
 * @param {object} responses - درجات البنود المسجلة
 * @param {Array} items - قائمة بنود المقياس
 * @returns {Array} قائمة الأهداف مرتبة بالأولوية ومكتملة البيانات
 */
export function extractRecommendedGoals(measureId, responses = {}, items = []) {
  const recommended = [];
  const rawId = (measureId || 'cars').toLowerCase().replace(/[-_]/g, '');
  
  let lookupKey = 'cars';
  if (rawId.includes('family') || rawId.includes('disintegration')) lookupKey = 'family_disintegration';
  else if (rawId.includes('myklebust') || rawId.includes('prs')) lookupKey = 'myklebust';
  else if (rawId.includes('sartawi') || rawId.includes('sarta')) lookupKey = 'sartawi';
  else if (rawId.includes('cars')) lookupKey = 'cars';
  else if (rawId.includes('ldes') || rawId.includes('learningdiff') || rawId.includes('learning')) lookupKey = 'learning_difficulties';
  else if (rawId.includes('pep3') || rawId.includes('pep')) lookupKey = 'pep3';
  else if (rawId.includes('gars')) lookupKey = 'gars_3';
  else if (rawId.includes('srs')) lookupKey = 'srs';
  else if (rawId.includes('vineland')) lookupKey = 'vineland_3';
  else if (rawId.includes('portage')) lookupKey = 'portage_early';
  else if (rawId === 'conners_parent' || rawId.includes('conners_parent')) lookupKey = 'conners_parent';
  else if (rawId.includes('conners')) lookupKey = 'conners_3';
  else if (rawId.includes('speech') || rawId.includes('artic')) lookupKey = 'speech_screening';
  else if (rawId.includes('ppvt') || rawId.includes('peabody')) lookupKey = 'ppvt5';
  else if (rawId.includes('pls5') || rawId.includes('pls')) lookupKey = 'pls5';
  else if (rawId.includes('beh')) lookupKey = 'behavior_adjustment';
  else if (SCALE_GOAL_TEMPLATES[measureId]) lookupKey = measureId;

  const templates = SCALE_GOAL_TEMPLATES[lookupKey] || {};

  // Helper to generate 3-part PLEP Statement
  const generatePlepBaseline = (itemTitle, score, maxScore, conditionDesc, supportDesc) => {
    return `مستوى الأداء الحالي (PLEP): يظهر التلميذ (${conditionDesc || `قصوراً ملحوظاً في ${itemTitle}`}) برتبة تقييم (${score}/${maxScore})، مما يمثل فجوة أداء حادة تستدعي (${supportDesc || 'تدخلاً فردياً وتدريباً منظماً عبر معينات بصرية وتلقين متدرج'}).`;
  };

  // Helper to build enriched goal item
  const buildGoalItem = ({
    code,
    domain,
    title,
    text,
    mastery,
    reason,
    priorityRank,
    priority,
    baseline,
    durationWeeks = 8,
  }) => {
    const strategyData = getStrategiesForDomain(domain);
    return {
      id: uid(),
      code: code || `IEP-${Math.floor(100 + Math.random() * 900)}`,
      domain: domain || 'general',
      title: title || 'هدف تأهيلي فردي',
      text,
      mastery: mastery || 'إتقان 80% في جلستين متتاليتين',
      baseline: baseline || `مستوى الأداء الحالي: فجوة أداء قائمة في مهارة (${title}) تستلزم تدخلاً إجرائياً.`,
      reason,
      priorityRank, // 1 = Critical, 2 = High, 3 = Medium, 4 = Low
      priority, // 'critical' | 'high' | 'medium' | 'low'
      durationWeeks,
      strategies: strategyData.strategies ? strategyData.strategies.slice(0, 3).map(s => s.title) : ['النمذجة والتحليل المهاري', 'التعزيز الفوري المستمر'],
      activities: strategyData.activities ? strategyData.activities.slice(0, 2).map(a => a.title) : ['أنشطة تدريبية وتطبيقية متدرجة'],
      materials: strategyData.materials ? strategyData.materials.slice(0, 3) : ['بطاقات بصرية', 'أدوات حسية'],
      status: 'قيد التدريب',
      sessions: [],
    };
  };

  if (lookupKey === 'myklebust') {
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      const targetItem = items.find(it => String(it.id) === String(itemId) || String(it.num) === String(itemId));
      const itemKey = itemId.startsWith('myk_') ? itemId : `myk_${itemId}`;
      const itemTemplate = templates[itemKey] || templates[itemId];

      // Myklebust: 1 = Critical Deficit, 2 = High Deficit, 3 = Borderline
      if (numScore === 1 || numScore === 2 || numScore === 3) {
        const priorityRank = numScore === 1 ? 1 : (numScore === 2 ? 2 : 3);
        const priority = numScore === 1 ? 'critical' : (numScore === 2 ? 'high' : 'medium');
        const itemTitle = targetItem?.title || targetItem?.text || itemTemplate?.title || `بند ${itemId}`;
        const itemOptDesc = targetItem?.options?.find(o => o.score === numScore)?.text || (numScore === 1 ? 'عجز وإخفاق تام في المهارة' : 'أداء ضعيف دون المستوى');
        
        const baseline = generatePlepBaseline(
          itemTitle,
          numScore,
          5,
          `عجزاً في (${itemTitle}) - السلوك الملاحظ: "${itemOptDesc}"`,
          numScore === 1 ? 'تدخلاً مكثفاً متعدد الحواس وخطط مساندة فردية' : 'إعادة تعليم وتدريبات نمائية موجهة'
        );

        if (itemTemplate && itemTemplate.goals) {
          itemTemplate.goals.forEach(g => {
            recommended.push(buildGoalItem({
              code: itemTemplate.code,
              domain: itemTemplate.domain,
              title: itemTemplate.title,
              text: g.text,
              mastery: g.mastery,
              reason: `مشتق من مقياس مايكل بيست (بند ${targetItem?.num || itemId}) بدرجة (${numScore}/5) - [${priority === 'critical' ? 'قصور حرج' : (priority === 'high' ? 'قصور مرتفع' : 'منطقة خطورة/حدية')}]`,
              priorityRank,
              priority,
              baseline,
              durationWeeks: numScore === 1 ? 12 : 8,
            }));
          });
        } else {
          recommended.push(buildGoalItem({
            code: `MYK-GOAL-${itemId}`,
            domain: targetItem?.dimensionId || 'general',
            title: itemTitle,
            text: `أن ينمي التلميذ مهارة (${itemTitle}) بنسبة إتقان لا تقل عن 80% في المواقف الصفية المعتادة.`,
            mastery: 'إتقان 80% عبر جلستين متتاليتين',
            reason: `مشتق من مقياس مايكل بيست بند [${itemId}] بدرجة تقييم (${numScore}/5)`,
            priorityRank,
            priority,
            baseline,
            durationWeeks: numScore === 1 ? 12 : 8,
          }));
        }
      }
    });
  } else if (lookupKey === 'learning_difficulties' || lookupKey === 'sartawi') {
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      const targetItem = items.find(it => String(it.id) === String(itemId));
      if (targetItem && (numScore === 1 || numScore === 2 || numScore === 3)) {
        const priorityRank = numScore === 1 ? 1 : (numScore === 2 ? 2 : 3);
        const priority = numScore === 1 ? 'critical' : (numScore === 2 ? 'high' : 'medium');
        const cleanText = targetItem.text.replace('صعوبة ', '').replace('ضعف ', '').replace('الخلط في ', '');
        
        let goalText = `أن يظهر التلميذ إتقاناً وتحسناً ملموساً في مهارة (${cleanText}) بنسبة دقة لا تقل عن 80% في الأنشطة الصفية وغرفة المصادر.`;
        if (numScore === 1 || numScore === 3) {
          goalText = `أن يتلقى التلميذ تدخلاً علاجياً مكثفاً باستخدام أسلوب الحواس المتعددة لمعالجة صعوبة (${cleanText}) وتحقيق نسبة إتقان 80% في 4 من أصل 5 محاولات.`;
        }

        const baseline = generatePlepBaseline(
          cleanText,
          numScore,
          5,
          `صعوبة واضحة في (${cleanText})`,
          'استراتيجيات التحليل المهاري والترميز البصري'
        );

        recommended.push(buildGoalItem({
          code: `LD-${targetItem.domainId ? targetItem.domainId.slice(0, 3).toUpperCase() : 'GEN'}-${itemId}`,
          domain: targetItem.domainId || 'academic_reading',
          title: `علاج صعوبة: ${targetItem.text.slice(0, 35)}...`,
          text: goalText,
          mastery: 'إتقان صفي بنسبة 80% عبر جلستين متتاليتين',
          reason: `مشتق من مقياس صعوبات التعلم بند [${itemId}] بمستوى شدة (${priority === 'critical' ? 'قصور حرج' : 'متوسط'})`,
          priorityRank,
          priority,
          baseline,
          durationWeeks: 10,
        }));
      }
    });
  } else if (lookupKey === 'cars') {
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      if (numScore >= 2.0) {
        const priorityRank = numScore >= 3.0 ? 1 : 2;
        const priority = numScore >= 3.0 ? 'critical' : 'high';
        const itemTemplate = templates[itemId] || templates[Number(itemId)];
        const targetItem = items.find(it => String(it.id) === String(itemId));
        const itemTitle = itemTemplate?.title || targetItem?.name || `بند CARS ${itemId}`;

        const baseline = generatePlepBaseline(
          itemTitle,
          numScore,
          4,
          `شذوذاً سلوكياً وصعوبة في (${itemTitle}) بدرجة انحراف (${numScore}/4)`,
          'جلسات تحليل السلوك التطبيقي (ABA) واستخدام الجداول البصرية'
        );

        if (itemTemplate) {
          itemTemplate.goals.forEach((g) => {
            recommended.push(buildGoalItem({
              code: itemTemplate.code,
              domain: itemTemplate.domain,
              title: itemTemplate.title,
              text: g.text,
              mastery: g.mastery,
              reason: `مشتق من مقياس كارس-2 بند [${itemId}] بدرجة تقييم (${numScore}) - احتياج ملح`,
              priorityRank,
              priority,
              baseline,
              durationWeeks: 12,
            }));
          });
        }
      }
    });
  } else if (lookupKey === 'sensory_integration_scale' || lookupKey === 'sensory_integration') {
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      const targetItem = items.find(it => String(it.id) === String(itemId));
      if (targetItem && numScore === 0) {
        const priorityRank = 1;
        const priority = 'critical';
        const itemTitle = targetItem.title || targetItem.text;

        const baseline = generatePlepBaseline(
          itemTitle,
          0,
          1,
          `قصوراً في الأداء الحسي/الحركي لمهمة (${itemTitle}) وفشل في استكمال المهمة وفق المعايير السيكومترية`,
          'جلسات العلاج الوظيفي (OT) وتمارين التكامل الحسي المتدرجة والحمية الحسية'
        );

        recommended.push(buildGoalItem({
          code: `SI-${(targetItem.domainId || 'GEN').slice(0, 4).toUpperCase()}-${targetItem.num || itemId}`,
          domain: 'sensory_integration',
          title: `تأهيل حسي: ${itemTitle}`,
          text: `أن يتدرب التلميذ على أداء مهمة (${itemTitle}) وتحقيق الاستجابة الحركية الحسية السليمة بنسبة نجاح 80% في 4 من أصل 5 محاولات أثناء جلسات العلاج الوظيفي.`,
          mastery: 'إتقان حركي بنسبة 80% في جلستي علاج وظيفي متتاليتين',
          reason: `مشتق من مقياس التكامل الحسي للأطفال (بند ${targetItem.num || itemId}) بدرجة (0/1 - غير مستوفٍ)`,
          priorityRank,
          priority,
          baseline,
          durationWeeks: 8,
        }));
      }
    });
  } else if (lookupKey === 'gars_3') {
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      if (numScore >= 2) {
        const priorityRank = numScore === 3 ? 1 : 2;
        const priority = numScore === 3 ? 'critical' : 'high';
        const itemTemplate = templates[itemId] || templates[Number(itemId)];
        const targetItem = items.find(it => String(it.id) === String(itemId));
        const itemTitle = targetItem?.text || itemTemplate?.title || `بند جيليام ${itemId}`;

        const baseline = generatePlepBaseline(
          itemTitle,
          numScore,
          3,
          `تكراراً مرتفعاً لسلوك (${itemTitle}) بمعدل حدوث (${numScore === 3 ? 'نعم كثيراً' : 'أحياناً'})`,
          'خطة دعم السلوك الإيجابي واستراتيجيات الإطفاء والتعزيز التفاضلي'
        );

        if (itemTemplate) {
          itemTemplate.goals.forEach((g) => {
            recommended.push(buildGoalItem({
              code: itemTemplate.code,
              domain: itemTemplate.domain,
              title: itemTemplate.title,
              text: g.text,
              mastery: g.mastery,
              reason: `مشتق من مقياس جيليام-3 بند [${itemId}] بدرجة تكرار (${numScore})`,
              priorityRank,
              priority,
              baseline,
              durationWeeks: 10,
            }));
          });
        } else if (targetItem) {
          recommended.push(buildGoalItem({
            code: `GARS-GOAL-${itemId}`,
            domain: targetItem.domainId || 'autism_communication',
            title: `تعديل سلوك: ${itemTitle.slice(0, 30)}...`,
            text: `أن يقلل التلميذ من تكرار سلوك (${targetItem.text}) بنسبة تحسن 75% مع تعزيز السلوك البديل الإيجابي.`,
            mastery: 'انخفاض التكرار بنسبة 75% في 4 أسابيع متتالية',
            reason: `مشتق من مقياس جيليام 3 - البند [${itemId}] بدرجة (${numScore})`,
            priorityRank,
            priority,
            baseline,
            durationWeeks: 8,
          }));
        }
      }
    });
  } else if (lookupKey === 'ppvt5') {
    Object.entries(responses).forEach(([itemId, score]) => {
      // For PPVT-5, false or 0 means incorrect response / deficit
      const isFailed = score === false || score === 0 || score === '0';
      const targetItem = items.find(it => String(it.id) === String(itemId));
      if (targetItem && isFailed) {
        const itemType = targetItem.type || 'مفردات';
        const priorityRank = (itemType === 'أسماء' || itemType === 'أفعال') ? 1 : 2;
        const priority = priorityRank === 1 ? 'critical' : 'high';
        const wordName = targetItem.word || `بند ${itemId}`;

        let goalText = `أن يحدد الطالب الصورة الدالة على كلمة (${wordName}) من بين 4 خيارات مصورة بنسبة دقة لا تقل عن 85%.`;
        if (itemType === 'أفعال') {
          goalText = `أن يشير الطالب إلى المثير البصري المعبر عن الفعل الحركي (${wordName}) بدقة 80% عبر 3 جلسات تخاطب متتالية.`;
        } else if (itemType === 'صفات' || itemType === 'مفاهيم') {
          goalText = `أن يطابق الطالب المفهوم اللفظي والتجريدي الدال على (${wordName}) بالرمز أو الصورة المعبرة عنه بنسبة نجاح 80%.`;
        }

        const baseline = generatePlepBaseline(
          `المفردة الاستقبالية (${wordName} - ${itemType})`,
          0,
          1,
          `عجزاً عن التعرف البصري والاستقبالي على كلمة (${wordName}) من تصنيف (${itemType})`,
          'تدريباً دلالياً مكثفاً، والربط بين المثير السمعي والصورة الواقعية والمجسمات'
        );

        recommended.push(buildGoalItem({
          code: `PPVT-${itemType === 'أسماء' ? 'NOUN' : itemType === 'أفعال' ? 'VERB' : 'CONC'}-${itemId}`,
          domain: 'speech_language',
          title: `تنمية مفردة: ${wordName} (${itemType})`,
          text: goalText,
          mastery: 'إتقان استيعابي بنسبة 85% في 4 من أصل 5 محاولات',
          reason: `مشتق من مقياس بيبودي للمفردات المصورة PPVT-5 (بند ${itemId} - ${itemType}) - استجابة غير صحيحة`,
          priorityRank,
          priority,
          baseline,
          durationWeeks: 6,
        }));
      }
    });
  } else if (lookupKey === 'pls5') {
    Object.entries(responses).forEach(([itemId, score]) => {
      // For PLS-5, 0 or false means failed/unmastered skill
      const isFailed = score === false || score === 0 || score === '0';
      const cleanId = String(itemId).replace(/^[re]_/, '');
      const isReceptive = String(itemId).startsWith('r_');
      const isExpressive = String(itemId).startsWith('e_');
      
      const targetItem = items.find(it => String(it.id) === String(itemId) || String(it.id) === String(cleanId));
      if (targetItem && isFailed) {
        const subtestName = isReceptive ? 'الفهم السمعي (الاستقبالي)' : isExpressive ? 'التواصل اللفظي (التعبيري)' : (targetItem.subtest || 'النمو اللغوي');
        const priorityRank = targetItem.id <= 15 ? 1 : (targetItem.id <= 30 ? 2 : 3);
        const priority = priorityRank === 1 ? 'critical' : (priorityRank === 2 ? 'high' : 'medium');
        const goalText = targetItem.goal || `أن يكتسب الطالب مهارة (${targetItem.text}) ويظهر إتقاناً بنسبة 80% في 4 من أصل 5 محاولات.`;

        const baseline = generatePlepBaseline(
          `مهارة (${targetItem.text})`,
          0,
          1,
          `قصوراً في مهارة (${targetItem.text}) ضمن المدى النمائي (${targetItem.ageGroup || 'النمو اللغوي'})`,
          'جلسات تدريب تخاطبية فردية واستخدام النمذجة والتعزيز الفوري والمثيرات البيئية'
        );

        recommended.push(buildGoalItem({
          code: `PLS5-${isReceptive ? 'AC' : 'EC'}-${cleanId}`,
          domain: 'speech_language',
          title: `${subtestName}: ${targetItem.domain || targetItem.text.slice(0, 35)}`,
          text: goalText,
          mastery: 'إتقان بنسبة 80% في 4 محاولات متتالية',
          reason: `مشتق من مقياس لغة الأطفال PLS-5 (${subtestName} - بند ${cleanId}) - استجابة غير متقنة (0)`,
          priorityRank,
          priority,
          baseline,
          durationWeeks: priorityRank === 1 ? 10 : 8,
        }));
      }
    });
  } else if (lookupKey === 'conners_parent') {
    Object.entries(responses).forEach(([itemId, score]) => {
      const numScore = Number(score);
      const targetItem = items.find(it => String(it.id) === String(itemId) || String(it.num) === String(itemId));
      if (targetItem && (numScore === 2 || numScore === 3)) {
        const priorityRank = numScore === 3 ? 1 : 2;
        const priority = numScore === 3 ? 'critical' : 'high';
        const itemTitle = targetItem.text || `بند ${itemId}`;
        const cleanTitle = itemTitle.replace(/^\d+\.\s*/, '');
        
        const baseline = generatePlepBaseline(
          cleanTitle,
          numScore,
          3,
          `أعراضاً سلوكية متكررة ملحوظة (${cleanTitle}) بدرجة (${numScore}/3 - ${numScore === 3 ? 'دائماً' : 'غالباً'})`,
          'برنامج تعديل سلوك، وفنيات ضبط المثيرات، وتعزيز فترات الانتباه والتركيز'
        );

        recommended.push(buildGoalItem({
          code: `CON-P-${itemId.toUpperCase()}`,
          domain: 'adhd_behavior',
          title: `تعديل وضبط: ${cleanTitle.slice(0, 35)}`,
          text: `أن يقلل التلميذ من ظهور سلوك (${cleanTitle}) بنسبة تحسن لا تقل عن 70% عبر استخدام المؤقتات البصرية وجداول التعزيز الإيجابي.`,
          mastery: 'انخفاض وتيرة السلوك بنسبة 70% خلال 6 أسابيع',
          reason: `مشتق من مقياس كونرز للوالدين (بند ${targetItem.num || itemId}) بدرجة (${numScore}/3 - ${numScore === 3 ? 'شديد/دائم' : 'مرتفع/غالب'})`,
          priorityRank,
          priority,
          baseline,
          durationWeeks: numScore === 3 ? 10 : 8,
        }));
      }
    });
  } else {
    // Other scales (PEP-3, Vineland, Portage, SRS, etc.)
    items.forEach((it) => {
      const respVal = Number(responses[it.id] ?? 0);
      const isDeficit = (it.minValue === 0 && respVal <= 1) || (it.minValue === 1 && respVal <= 2) || (respVal >= 2 && measureId.includes('behavior'));
      const priorityRank = (respVal === 0 || respVal === 1) ? 1 : 2;
      const priority = priorityRank === 1 ? 'critical' : 'high';

      const baseline = generatePlepBaseline(
        it.text || it.title,
        respVal,
        it.maxValue || 3,
        `عجزاً أو صعوبة في مهارة (${it.text || it.title})`,
        'تدريب فردي واستراتيجيات متخصصة'
      );

      const itemTemplate = templates[it.id];
      if (itemTemplate && (isDeficit || Object.keys(responses).length === 0)) {
        itemTemplate.goals.forEach((g) => {
          recommended.push(buildGoalItem({
            code: itemTemplate.code,
            domain: itemTemplate.domain || it.domain || 'general',
            title: itemTemplate.title || it.text,
            text: g.text,
            mastery: g.mastery,
            reason: `مشتق من قياس: ${it.text}`,
            priorityRank,
            priority,
            baseline,
            durationWeeks: 8,
          }));
        });
      } else if (isDeficit) {
        recommended.push(buildGoalItem({
          code: `GOAL-${it.id.toUpperCase()}`,
          domain: it.domain || 'general',
          title: it.text || it.title,
          text: `أن يظهر التلميذ تحسناً ملموساً في مهارة (${it.text}) بنسبة إتقان لا تقل عن 80% في المواقف الصفية واليومية.`,
          mastery: 'إتقان 80% في جلستين متتاليتين',
          reason: `مستخرج من بند المقياس: ${it.text}`,
          priorityRank,
          priority,
          baseline,
          durationWeeks: 8,
        }));
      }
    });
  }

  // Fallback / Enrichment if child had high scores
  if (recommended.length === 0 && items.length > 0) {
    items.slice(0, 3).forEach((it) => {
      recommended.push(buildGoalItem({
        code: `ENR-${it.id.toUpperCase()}`,
        domain: it.domain || 'general',
        title: it.text || it.title,
        text: `أن يحافظ التلميذ على إتقان وتعميم مهارة (${it.text}) مع أقران جدد وفي بيئات صفية ومجتمعية مختلفة.`,
        mastery: 'تعميم مستقل 90%',
        reason: `هدف تعزيز وتعميم للمهارة المتقنة`,
        priorityRank: 4,
        priority: 'low',
        baseline: `مستوى الأداء الحالي: التلميذ يتقن المهارة بنجاح، ويستهدف البرنامج تعميمها وتثبيتها.`,
        durationWeeks: 6,
      }));
    });
  }

  // SORT BY SEVERITY (Priority Rank 1 Critical -> 2 High -> 3 Medium -> 4 Low)
  return recommended.sort((a, b) => (a.priorityRank || 9) - (b.priorityRank || 9));
}

