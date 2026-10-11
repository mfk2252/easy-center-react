/**
 * Easy Center — Assessment to IEP Bridge (منظومة الربط الأكاديمي والتربوي)
 * يقوم بتحليل بنود الضعف في المقاييس واستخراج أهداف سلوكية وتأهيلية قابلة للقياس للخطة الفردية
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

};

/**
 * تحليل درجات استجابة المقياس واستخراج الأهداف السلوكية والتأهيلية المقترحة
 * مرتبة حسب شدة القصور والأولوية الإكلينيكية، ومزودة بوصف مستوى الأداء الحالي (PLEP) وبنك الاستراتيجيات
 * @param {string} measureId - معرف المقياس
 * @param {object} responses - درجات البنود المسجلة
 * @param {Array} items - قائمة بنود المقياس
 * @returns {Array} قائمة الأهداف مرتبة بالأولوية ومكتملة البيانات
 */
export function extractRecommendedGoals(measureId, responses = {}, items = [], extraData = null) {
  const recommended = [];
  const rawId = (measureId || '').toLowerCase().replace(/[-_]/g, '');
  
  let lookupKey = '';
  if (rawId.includes('family') || rawId.includes('disintegration')) lookupKey = 'family_disintegration';
  else if (rawId.includes('myklebust') || rawId.includes('prs')) lookupKey = 'myklebust';
  else if (rawId.includes('sartawi') || rawId.includes('sarta')) lookupKey = 'sartawi';
  else if (rawId.includes('ldes') || rawId.includes('learningdiff') || rawId.includes('learning')) lookupKey = 'learning_difficulties';
  else if (rawId.includes('speech') || rawId.includes('artic')) lookupKey = 'speech_screening';
  else if (rawId.includes('down') || rawId.includes('syndrome') || rawId.startsWith('ds')) lookupKey = 'down_syndrome';
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
  } else if (lookupKey === 'down_syndrome' || rawId.startsWith('ds') || rawId.includes('ds_') || rawId.includes('down')) {
    items.forEach((it) => {
      const respVal = responses[it.id] !== undefined && responses[it.id] !== null ? Number(responses[it.id]) : null;
      if (respVal !== null && respVal <= 0.5) {
        const isCritical = respVal === 0.0;
        const priorityRank = isCritical ? 1 : 2;
        const priority = isCritical ? 'critical' : 'high';
        const itemTitle = it.text || `بند ${it.id}`;

        const baseline = generatePlepBaseline(
          itemTitle,
          respVal,
          1.0,
          isCritical
            ? `عدم اكتساب المهارة النمائية (${itemTitle}) - تقييم (0.0/1.0)`
            : `مهارة في طور الاكتساب المبدئي (${itemTitle}) - تقييم (0.5/1.0)`,
          isCritical
            ? 'تدريب فردي مكثف واستخدام التلقين المتدرج والدعم الحسي'
            : 'تعزيز المهارة الناشئة وتطبيق أنشطة التكرار والتدريب الموجه'
        );

        const goalText = it.iepGoal || `أن يكتسب التلميذ مهارة (${itemTitle}) ويظهر إتقاناً بنسبة 80% في المواقف الصفية واليومية.`;

        recommended.push(buildGoalItem({
          code: `DS-${it.domain ? String(it.domain).slice(0, 4).toUpperCase() : 'DEV'}-${it.id}`,
          domain: it.domain || 'down_syndrome',
          title: itemTitle.length > 35 ? `${itemTitle.slice(0, 35)}...` : itemTitle,
          text: goalText,
          mastery: 'إتقان بنسبة 80% عبر 3 جلسات متتالية',
          reason: `مشتق من مقياس متلازمة داون (بند ${it.id}) بدرجة (${respVal === 0.0 ? 'غير مكتسب 0.0' : 'في طور الاكتساب 0.5'})`,
          priorityRank,
          priority,
          baseline,
          durationWeeks: isCritical ? 10 : 8,
        }));
      }
    });
  } else {
    // بقية المقاييس
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
      } else if (it.iepGoal && (isDeficit || Object.keys(responses).length === 0)) {
        recommended.push(buildGoalItem({
          code: `DS-${it.id}`,
          domain: it.domain || 'down_syndrome',
          title: it.text || it.title,
          text: it.iepGoal,
          mastery: 'إتقان 80% عبر 3 جلسات متتالية',
          reason: `مشتق من مقياس متلازمة داون: ${it.text}`,
          priorityRank,
          priority,
          baseline,
          durationWeeks: 8,
        }));
      } else if (isDeficit) {
        recommended.push(buildGoalItem({
          code: `GOAL-${String(it.id).toUpperCase()}`,
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

