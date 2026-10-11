import { DEV_LD_ITEMS } from '../data/devLdData';
import { LDDRS_ITEMS } from '../data/lddrsData';
import { SARTAWI_ITEMS } from '../data/sartawiData';
import { MYKLEBUST_ITEMS } from '../data/myklebustData';
import { FAMILY_DISINTEGRATION_ITEMS, calculateFamilyDisintegrationScore } from '../data/familyDisintegrationData';
import { SENSORY_INTEGRATION_ITEMS, calculateSensoryIntegrationScore } from '../data/sensoryIntegrationData';

import { LIFE_SKILLS_ITEMS, calculateLifeSkillsScore } from '../data/lifeSkillsData';
import { EMOTIONAL_ADJUSTMENT_ITEMS, calculateEmotionalAdjustmentScore } from '../data/emotionalAdjustmentData';
import { EXECUTIVE_CONTROL_ITEMS, calculateExecutiveControlScore } from '../data/executiveControlData';
import { EXECUTIVE_PLANNING_ITEMS, calculateExecutivePlanningScore } from '../data/executivePlanningData';
import { FUNCTIONAL_HEARING_ITEMS, calculateFunctionalHearingScore } from '../data/functionalHearingData';
import { ORIENTATION_MOBILITY_ITEMS, calculateOrientationMobilityScore } from '../data/orientationMobilityData';
import { TRANSITION_PLANNING_ITEMS, calculateTransitionPlanningScore } from '../data/transitionPlanningData';
import { INDEPENDENT_LIVING_ITEMS, calculateIndependentLivingScore } from '../data/independentLivingData';
import { SYMBOLIC_PLAY_ITEMS, calculateSymbolicPlayScore } from '../data/symbolicPlayData';

import {
  DOWN_SYNDROME_SCALES,
  DS_SCALE_3_OPTIONS,
  DS_YESNO_MEDICAL_OPTIONS,
  calculateDownSyndromeScore,
} from '../data/downSyndromeData';

export const MEASUREMENT_CATEGORIES = [
  {
    id: 'down_syndrome',
    name: 'مقاييس وتأهيل متلازمة داون',
    nameEn: 'Down Syndrome Diagnostic & Developmental Scales',
    icon: '🧬',
    color: '#0891b2',
    description: 'بطاريات تقييم النمو الحركي، التطور النمائي، المؤشرات الصحية والجسدية، والفحص الطبي الشامل لمتلازمة داون (4 مقاييس متخصصة)',
  },
  {
    id: 'autism',
    name: 'مقاييس اضطرابات طيف التوحد',
    nameEn: 'Autism Spectrum Scales',
    icon: '🧩',
    color: '#2563eb',
    description: 'مقاييس تقدير وتشخيص أعراض وطيف التوحد والسلوك النمطي والتواصل الاجتماعي',
  },
  {
    id: 'speech_language',
    name: 'مقاييس النطق واللغة والتواصل',
    nameEn: 'Speech, Language & Communication Scales',
    icon: '🗣️',
    color: '#0284c7',
    description: 'تقييم اللغة التعبيرية والاستقبالية ومخارج الحروف والتواصل الوظيفي واللفظي',
  },
  {
    id: 'learning_academic',
    name: 'مقاييس صعوبات التعلم والتحصيل الأكاديمي',
    nameEn: 'Learning Disabilities & Academic Scales',
    icon: '📘',
    color: '#d97706',
    description: 'تشخيص صعوبات القراءة (الدسلكسيا) والكتابة والرياضيات والعمليات النمائية الأكاديمية',
  },
  {
    id: 'intelligence_cognitive',
    name: 'مقاييس القدرات العقلية والذكاء',
    nameEn: 'Intelligence & Cognitive Ability Scales',
    icon: '🧠',
    color: '#7c3aed',
    description: 'بطاريات قياس نسبة الذكاء (IQ) والاستدلال المعرفي والقدرات العقلية العامة والخاصة',
  },
  {
    id: 'adaptive_behavior',
    name: 'مقاييس السلوك التكيفي ومهارات الحياة اليومية',
    nameEn: 'Adaptive Behavior & Self-Help Scales',
    icon: '🏠',
    color: '#059669',
    description: 'قياس استقلالية العناية بالذات، المهارات الحياتية، والمشاركة المجتمعية والتكيفية',
  },
  {
    id: 'developmental_early',
    name: 'مقاييس النمو الشامل والتدخل المبكر',
    nameEn: 'Developmental & Early Intervention Scales',
    icon: '🌱',
    color: '#16a34a',
    description: 'تقييم مراحل التطور النمائي المبكر من عمر الرضاعة وحتى الطفولة المبكرة',
  },
  {
    id: 'behavioral_emotional',
    name: 'مقاييس الاضطرابات السلوكية والانفعالية',
    nameEn: 'Behavioral & Emotional Scales',
    icon: '❤️',
    color: '#dc2626',
    description: 'تقييم المشكلات السلوكية، نوبات الغضب، القلق، الانسحاب، والتوافق الانفعالي',
  },
  {
    id: 'adhd',
    name: 'مقاييس فرط الحركة وتشتت الانتباه',
    nameEn: 'ADHD Scales',
    icon: '⚡',
    color: '#ea580c',
    description: 'تقييم أعراض قصور الانتباه والنشاط الحركي الزائد والاندفاعية في البيئات المختلفة',
  },
  {
    id: 'executive_functioning',
    name: 'مقاييس الوظائف التنفيذية والعمليات المعرفية',
    nameEn: 'Executive Functioning Scales',
    icon: '⚙️',
    color: '#4f46e5',
    description: 'تقييم الذاكرة العاملة، التخطيط والتنظيم، المرونة المعرفية، وكبح الاستجابة (Inhibition)',
  },
  {
    id: 'sensory_motor',
    name: 'مقاييس المعالجة الحسية والتآزر الحركي',
    nameEn: 'Sensory Processing & Motor Scales',
    icon: '🎯',
    color: '#0891b2',
    description: 'تقييم التكامل الحسي، الحساسية المفرطة أو المنخفضة، والمهارات الحركية الكبرى والدقيقة',
  },
  {
    id: 'sensory_impairments',
    name: 'مقاييس الإعاقات الحسية (البصرية والسمعية والمزدوجة)',
    nameEn: 'Sensory Impairments Scales',
    icon: '👁️',
    color: '#9333ea',
    description: 'تقييم الوظائف البصرية والسمعية والتواصل البديل وتأهيل الإعاقات الحسية المزدوجة',
  },
  {
    id: 'vocational_transition',
    name: 'مقاييس التأهيل المهني والتخطيط الانتقالي',
    nameEn: 'Vocational & Transition Scales',
    icon: '💼',
    color: '#475569',
    description: 'تقييم الجاهزية المهنية، الميول والاستعداد للعمل، والتخطيط للدمج واستقلالية البلوغ',
  },
  {
    id: 'play_environmental',
    name: 'مقاييس اللعب والتقييم البيئي والأسري',
    nameEn: 'Play & Environmental Scales',
    icon: '🎲',
    color: '#db2777',
    description: 'تقييم مهارات اللعب التواصلي، جودة البيئة المنزلية، والتفاعل الأسري والتمكين',
  },
];

const DEFAULT_SCALE_LIBRARY = [
  // 1. Autism Spectrum Scales (اضطرابات طيف التوحد)
  // 2. Speech, Language & Communication Scales (النطق واللغة والتواصل)
  {
    id: 'speech_screening',
    name: 'سجل فحص وتقييم النطق ومخارج الحروف',
    nameEn: 'Articulation & Speech Screening Scale',
    category: 'speech_language',
    description: 'مقياس إكلينيكي لتقييم سلامة مخارج الأصوات، الحذف، الإبدال، التشويه، والطلاقة اللفظية',
    icon: '🗣️',
    color: '#0284c7',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 5,
    maxScore: 50,
    items: [
      { id: 'sp1', text: 'سلامة ونطق الأصوات اللسانية والشفهية (المخارج)', domain: 'articulation' },
      { id: 'sp2', text: 'ظاهرة الحذف أو الإبدال أو التشويه في الكلمات', domain: 'phonology' },
      { id: 'sp3', text: 'الطلاقة الكلامية وسرعة الكلام وغياب التلعثم (التأتأة)', domain: 'fluency' },
      { id: 'sp4', text: 'جودة الصوت ورنين الصوت (الخنف أو البحة الصوتية)', domain: 'voice' },
      { id: 'sp5', text: 'وضوح الكلام ومفهوميته للمستمع الغريب', domain: 'intelligibility' },
      { id: 'sp6', text: 'التعبير اللفظي وتركيب الجمل المناسبة للعمر', domain: 'expressive' },
      { id: 'sp7', text: 'الفهم اللغوي والاستجابة للتعليمات المركبة', domain: 'receptive' },
      { id: 'sp8', text: 'استخدام التراكيب النحوية وقواعد الجمع والتأنيث', domain: 'syntax' },
      { id: 'sp9', text: 'القدرة على بدء المحادثة والاستمرار في تبادل الأدوار', domain: 'pragmatic' },
      { id: 'sp10', text: 'التواصل الوظيفي عند الرغبة والطلب أو الرفض', domain: 'functional' },
    ],
    thresholdText: 'الدرجة الكلية تعكس مستوى الكفاءة النطقية والتواصلية واحتياج التدخل التخاطبي',
    isDefault: true,
  },
  {
    id: 'abuhasiba_arabic_lang',
    name: 'اختبار الدكتور أحمد أبو حسيبة للغة المعرب (PLS)',
    nameEn: 'Dr. Ahmad Abu Hasiba Arabic Language Scale (PLS)',
    category: 'speech_language',
    description: 'تقييم شامل للغة الاستقبالية والتعبيرية للأطفال من عمر شهرين إلى 7 سنوات و5 أشهر، بحساب دقيق للبسال والسقف والدرجات المعيارية والنمائية.',
    icon: '🧠',
    color: '#0369a1',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 1,
    maxScore: 133,
    items: [
      { id: 'abuhasiba_receptive', text: 'اللغة الاستقبالية (62 بنداً تشخيصياً للتحليل السلوكي)', domain: 'receptive' },
      { id: 'abuhasiba_expressive', text: 'اللغة التعبيرية (71 بنداً تشخيصياً للتحليل اللفظي)', domain: 'expressive' }
    ],
    thresholdText: 'حساب العمر اللغوي والدرجة المعيارية وتحديد نسب التأخر مع ترحيل الأهداف للخطة التربوية الفردية',
    isDefault: true,
  },

  // 3. Learning Disabilities & Academic Scales (صعوبات التعلم والتحصيل الأكاديمي)
  {
    id: 'learning_difficulties',
    name: 'مقياس التقدير التشخيصي لصعوبات التعلم (LDES)',
    nameEn: 'Learning Disabilities Evaluation Scale (LDES)',
    author: 'د. ستيفن ب. ماكارني (Stephen B. McCarney, Ed.D.)',
    publisher: 'Hawthorne Educational Services, Inc.',
    category: 'learning_academic',
    description: 'الأداة المعيارية المعتمدة لتقييم وتشخيص صعوبات التعلم النمائية والأكاديمية (88 بنداً موزعة على 7 مقاييس: الاستماع، التفكير، التحدث، القراءة، الكتابة، الرياضيات، التنظيم الحركي) مع حساب حاصل LDEQ.',
    icon: '📘',
    color: '#d97706',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 264,
    items: [
      { id: 'ldes_listening', text: 'الاستماع والإصغاء والمعالجة السمعية (13 بنداً)', domain: 'listening' },
      { id: 'ldes_thinking', text: 'التفكير والاستدلال المعرفي والذاكرة (11 بنداً)', domain: 'thinking' },
      { id: 'ldes_speaking', text: 'التحدث والتعبير الشفهي واللغوي (12 بنداً)', domain: 'speaking' },
      { id: 'ldes_reading', text: 'القراءة والتعرف القرائي والفهم - Dyslexia (16 بنداً)', domain: 'reading' },
      { id: 'ldes_writing', text: 'الكتابة والتعبير الكتابي والخط - Dysgraphia (14 بنداً)', domain: 'writing' },
      { id: 'ldes_math', text: 'الرياضيات والعمليات الحسابية - Dyscalculia (12 بنداً)', domain: 'math' },
      { id: 'ldes_motor', text: 'التنظيم الحركي والسلوك الأكاديمي (10 بنود)', domain: 'motor' },
    ],
    thresholdText: 'حساب حاصل صعوبات التعلم الكلي (LDEQ)، الدرجات المعيارية للمقاييس السبعة (1-20)، الرتب المئينية، وتوليد أهداف الخطة الفردية IEP',
    isDefault: true,
  },
  {
    id: 'dev_learning_difficulties',
    name: 'قائمة صعوبات التعلم النمائية لأطفال الروضة',
    nameEn: 'Developmental Learning Disabilities Checklist for Preschoolers',
    author: 'أ.د. عادل عبدالله محمد (جامعة الزقازيق)',
    publisher: 'دار الرشاد / عربية للطباعة والنشر',
    category: 'learning_academic',
    description: 'المقياس للفرز والتشخيص المبكر لصعوبات التعلم النمائية في الروضة وفق نموذج كيرك وكالفنت (80 عبارة مقسمة على 6 أبعاد: الانتباه، الإدراك، الذاكرة، التفكير، لغوية، بصرية حركية).',
    icon: '🌱',
    color: '#0d9488',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 2,
    maxScore: 160,
    items: DEV_LD_ITEMS.map(it => ({
      id: it.id,
      text: it.text,
      domain: it.domainId,
    })),
    thresholdText: 'الفرز والتشخيص: أقل من 50% طبيعي | 50% - 69% معرض لخطر الصعوبات (At-Risk) | 70% فأكثر صعوبات نمائية مؤكدة دالة إكلينيكياً',
    isDefault: true,
  },
  {
    id: 'lddrs_battery',
    name: 'بطارية مقاييس التقدير التشخيصية لصعوبات التعلم النمائية والأكاديمية (LDDRS)',
    nameEn: 'Learning Disabilities Diagnostic Rating Scales (LDDRS)',
    author: 'أ.د. فتحي مصطفى الزيات (جامعة الخليج العربي)',
    publisher: 'دار النشر للجامعات / مكتبة الأنجلو المصرية',
    category: 'learning_academic',
    description: 'البطارية التشخيصية الرائدة والمعتمدة في العالم العربي لتشخيص صعوبات التعلم النمائية (الانتباه، الإدراك السمعي، الإدراك البصري، الإدراك الحركي، الذاكرة) والأكاديمية (القراءة، الكتابة، الرياضيات) والسلوك الاجتماعي والانفعالي (20 بنداً لكل مقياس، التدريج الخماسي 0-4، المعايير المئينية ومحكات الشدة).',
    icon: '📊',
    color: '#dc2626',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 4,
    maxScore: 640,
    items: LDDRS_ITEMS.map(it => ({
      id: it.id,
      text: it.text,
      domain: it.scaleId,
    })),
    thresholdText: 'معايير الزيات التشخيصية: 0-20 عادي/لا توجد صعوبة | 21-40 صعوبات خفيفة | 41-60 صعوبات متوسطة | 61-80 صعوبات شديدة',
    isDefault: true,
  },
  {
    id: 'sartawi_scale',
    name: 'مقياس صعوبات التعلم (إعداد وتقنين أ.د. زيدان السرطاوي)',
    nameEn: 'Learning Disabilities Scale (Dr. Zaydan Al-Sartawi)',
    author: 'أ.د. زيدان أحمد السرطاوي (جامعة الملك سعود / وزارة التعليم)',
    publisher: 'وزارة التعليم - الإدارة العامة للتربية الخاصة',
    category: 'learning_academic',
    description: 'المقياس المعتمد رسمياً لدى وزارة التعليم بالمملكة العربية السعودية لفرز وتشخيص صعوبات التعلم (50 عبارة عبر 3 أبعاد: الصعوبات الأكاديمية 25 عبارة، الخصائص السلوكية 12 عبارة، والصعوبات الإدراكية الحركية 13 عبارة، مع التدريج الخماسي 1-5 وحساب الدرجات التائية المعيارية T-Score والتصنيف التشخيصي الدقيق).',
    icon: '📘',
    color: '#1e40af',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 1,
    maxValue: 5,
    maxScore: 250,
    items: SARTAWI_ITEMS.map(it => ({
      id: it.id,
      text: it.text,
      domain: it.dimensionId,
    })),
    thresholdText: 'الدرجة التائية المعيارية: T < 50 عدم وجود صعوبة (عادي) | T 50-59 فئة حدية (عرضة للصعوبة) | T >= 60 (أو الدرجة الكلية >= 150) صعوبة تعلم محتملة ومؤكدة إكلينيكياً',
    isDefault: true,
  },
  {
    id: 'myklebust_scale',
    name: 'مقياس مايكل بيست للتعرف على صعوبات التعلم (PRS)',
    nameEn: 'Myklebust Pupil Rating Scale (PRS)',
    author: 'هلمر مايكل بيست (تقنين د. مصطفى كامل / د. تيسير كوافحة)',
    publisher: 'مقياس معتمد للفرز والتشخيص',
    category: 'learning_academic',
    description: 'مقياس تشخيصي يتكون من 24 بنداً موزعة على 5 أبعاد (الاستيعاب السمعي، اللغة المنطوقة، التوجه المكاني/الزماني، التناسق الحركي، السلوك الشخصي). يغطي الجوانب اللفظية وغير اللفظية لتحديد صعوبات التعلم بدقة.',
    icon: '📊',
    color: '#0891b2',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 1,
    maxValue: 5,
    maxScore: 120,
    items: MYKLEBUST_ITEMS.map(it => ({
      id: it.id,
      text: it.text,
      domain: it.dimensionId,
    })),
    thresholdText: 'الدرجة الكلية: < 72 صعوبة تعلم مؤكدة | 72 - 84 فئة حدية | >= 85 طبيعي (لا توجد صعوبة)',
    isDefault: true,
  },

  // 4. Intelligence & Cognitive Ability Scales (القدرات العقلية والذكاء)
  // 5. Adaptive Behavior & Self-Help Scales (السلوك التكيفي ومهارات الحياة اليومية)
  {
    id: 'life_skills_scale',
    name: 'قائمة مهارات الاستقلالية والرعاية الذاتية للطفولة',
    nameEn: 'Self-Independence & Life Skills Assessment Scale',
    category: 'adaptive_behavior',
    description: 'تقييم مهارات النظافة الشخصية، ارتداء الملابس، تناول الطعام، والسلامة العامة والاستقلالية المنزلية (20 بنداً)',
    icon: '🏠',
    color: '#059669',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 60,
    items: LIFE_SKILLS_ITEMS,
    thresholdText: 'الدرجة المرتفعة تعكس درجة استقلالية ورعاية ذاتية ممتازة | < 27 تدل على احتياج تدريب واستقلالية',
    isDefault: true,
  },

  // 6. Developmental & Early Intervention Scales (النمو الشامل والتدخل المبكر)
  // 7. Behavioral & Emotional Scales (الاضطرابات السلوكية والانفعالية)
  {
    id: 'behavior_adjustment',
    name: 'مقياس المشكلات السلوكية والانفعالية',
    nameEn: 'Behavioral & Emotional Rating Scale',
    category: 'behavioral_emotional',
    description: 'تشخيص وتحديد شدة المشكلات السلوكية (العدوانية، العناد، الانسحاب، ونوبات الغضب)',
    icon: '❤️',
    color: '#dc2626',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 30,
    items: [
      { id: 'beh_1', text: 'ظهور نوبات غضب وصراخ شديدة عند الرفض أو الإحباط', domain: 'tantrums' },
      { id: 'beh_2', text: 'سلوكيات عدوانية لفظية أو بدنية تجاه الآخرين', domain: 'aggression' },
      { id: 'beh_3', text: 'سلوكيات إيذاء الذات (ضرب الرأس، العض، الخدش)', domain: 'self_injury' },
      { id: 'beh_4', text: 'تدمير الممتلكات وتكسير الألعاب والأدوات', domain: 'destruction' },
      { id: 'beh_5', text: 'العناد ورفض اتباع الأوامر وقواعد الفصل والمنزل', domain: 'defiance' },
      { id: 'beh_6', text: 'الانسحاب الاجتماعي الشديد وتجنب التفاعل مع الأقران', domain: 'withdrawal' },
      { id: 'beh_7', text: 'القلق المفرط والمخاوف غير المبررة والتوتر الدائم', domain: 'anxiety' },
      { id: 'beh_8', text: 'تقلب المزاج المفاجئ بدون أسباب بيئية واضحة', domain: 'mood' },
    ],
    thresholdText: 'ارتفاع الدرجات يتطلب إعداد خطة تدخل سلوكي إيجابي (BIP) فورية',
    isDefault: true,
  },
  {
    id: 'emotional_adjustment_scale',
    name: 'مقياس التوافق الانفعالي والقلق للأطفال',
    nameEn: 'Child Emotional Adjustment & Anxiety Scale',
    category: 'behavioral_emotional',
    description: 'تقييم القلق والتوتر والمخاوف والانغلاق الانفعالي والاستقرار النفسي العام لدى الأطفال (20 بنداً)',
    icon: '❤️',
    color: '#dc2626',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 60,
    items: EMOTIONAL_ADJUSTMENT_ITEMS,
    thresholdText: 'الدرجة المرتفعة >= 35 تشير إلى اضطراب انفعالي وقلق حاد يستدعي الدعم النفسي وإرشاد الأخصائي',
    isDefault: true,
  },

  // 8. ADHD Scales (فرط الحركة وتشتت الانتباه)
  // 9. Executive Functioning Scales (الوظائف التنفيذية والعمليات المعرفية)
  {
    id: 'executive_control_scale',
    name: 'مقياس الذاكرة العاملة والضبط المعرفي للوظائف التنفيذية',
    nameEn: 'Working Memory & Cognitive Control Executive Functioning Scale',
    category: 'executive_functioning',
    description: 'مقياس ميداني لتقييم الذاكرة العاملة، المرونة المعرفية، والتخطيط وكبح الاستجابة السلوكية (20 بنداً ملاحظياً)',
    icon: '⚙️',
    color: '#4f46e5',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 60,
    items: EXECUTIVE_CONTROL_ITEMS,
    thresholdText: 'الدرجة المرتفعة تعكس كفاءة ممتازة في الضبط التنفيذي | الدرجة < 27 تشير إلى قصور ملحوظ يستدعي التدخل',
    isDefault: true,
  },
  {
    id: 'executive_planning_scale',
    name: 'مقياس التخطيط والتنظيم وكبح الاستجابة السلوكية',
    nameEn: 'Executive Planning, Organization & Response Inhibition Scale',
    category: 'executive_functioning',
    description: 'تقييم كفاءة التخطيط المسبق، إدارة الوقت، المراقبة الذاتية للأخطاء، وكبح الاندفاعية (15 بنداً ملاحظياً)',
    icon: '⚙️',
    color: '#4f46e5',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 45,
    items: EXECUTIVE_PLANNING_ITEMS,
    thresholdText: 'الدرجة المرتفعة تعكس انضباطاً وتخطيطاً ممتازين | < 20 تشير لضعف التخطيط وكبح الاستجابة',
    isDefault: true,
  },

  // 10. Sensory Processing & Motor Scales (المعالجة الحسية والتآزر الحركي)
  {
    id: 'sensory_integration_scale',
    name: 'مقياس التكامل الحسي للأطفال (Sensory Integration Scale)',
    nameEn: 'Sensory Integration Scale for Children',
    author: 'أ. داليا طعيمة · د. محمود الطنطاوي · أ.د. عبد العزيز الشخص (جامعة عين شمس 2017)',
    publisher: 'مجلة الإرشاد النفسي - مركز الإرشاد النفسي - جامعة عين شمس',
    category: 'sensory_motor',
    description: 'المقياس الأكاديمي لتقييم كفاءة التكامل الحسي للأطفال (90 مهمة أدائية مقسمة على 9 محاور: التآزر البصري الحركي، الشكل والأرضية، الموضع في الفراغ، نسخ الأشكال، المثير اللمسي، تمييز الأصابع، الكتابة على الكف، التوازن الدهليزي، محاكاة وضع الجسم) مع حساب محك القطع (45 درجة) والتفسير الإكلينيكي.',
    icon: '🎯',
    color: '#0891b2',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 1,
    maxScore: 90,
    items: SENSORY_INTEGRATION_ITEMS.map(it => ({
      id: it.id,
      num: it.num,
      text: `${it.title}: ${it.instruction}`,
      domain: it.domainId,
      target: it.target,
      scoringGuide: it.scoringGuide,
    })),
    thresholdText: 'المدى (0-90 درجة) · محك القطع: 45 درجة (نصف المجموع) · الدرجات 45 فأقل تشير إلى اضطراب التكامل الحسي والحاجة لتأهيل وعلاج وظيفي',
    isDefault: true,
  },
  // 11. Sensory Impairments Scales (الإعاقات الحسية البصرية والسمعية والمزدوجة)
  {
    id: 'functional_vision_eval',
    name: 'مقياس التقييم الوظيفي للبصر وضعف الرؤية (FVA)',
    nameEn: 'Functional Vision Assessment Scale',
    category: 'sensory_impairments',
    description: 'تقييم كفاءة استخدام الرؤية المتبقية، التتبع البصري، إدراك الألوان، والتوجه والحركة',
    icon: '👁️',
    color: '#9333ea',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 4,
    maxScore: 24,
    items: [
      { id: 'fva_1', text: 'التثبيت البصري والتواصل البصري مع الوجوه والأشياء', domain: 'fixation' },
      { id: 'fva_2', text: 'التتبع البصري للأجسام المتحركة أفقياً وعمودياً', domain: 'tracking' },
      { id: 'fva_3', text: 'التمييز بين الألوان والتباين اللوني للأدوات', domain: 'contrast_color' },
      { id: 'fva_4', text: 'التوجه والحركة الآمنة وتجنب العوائق البصرية', domain: 'mobility' },
      { id: 'fva_5', text: 'استخدام الرؤية القريبة في القراءة والأنشطة الدقيقة أو برايل', domain: 'near_vision' },
      { id: 'fva_6', text: 'الاستجابة للضوء والتكيف مع تغير الإضاءة المحيطة', domain: 'light_adaptation' },
    ],
    thresholdText: 'تحديد الوسائل المعينة البصرية وبرنامج التوجه والحركة المناسب',
    isDefault: true,
  },
  {
    id: 'functional_hearing_eval',
    name: 'مقياس التقييم الوظيفي للسمع وضعف السمع (FHA)',
    nameEn: 'Functional Hearing Assessment Scale (FHA)',
    category: 'sensory_impairments',
    description: 'تقييم الاستجابة السمعية، تحديد مصدر الصوت، والتمييز السمعي وفهم الكلام شفهياً في البيئات المختلفة (20 بنداً)',
    icon: '👂',
    color: '#9333ea',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 60,
    items: FUNCTIONAL_HEARING_ITEMS,
    thresholdText: 'الدرجة الخام المرتفعة تشير لكفاءة سمعية وظيفية ممتازة | < 27 تدل على قصور سمعي وظيفي يتطلب تأهيلاً',
    isDefault: true,
  },
  {
    id: 'orientation_mobility_scale',
    name: 'مقياس التوجه والحركة واستقلال الحركة المكاني (O&M)',
    nameEn: 'Orientation & Mobility Functional Assessment Scale',
    category: 'sensory_impairments',
    description: 'تقييم الاستدلال المكاني، استخدام الحواس المتبقية، تقنيات الحماية الذاتية والعصا البيضاء لذوي الإعاقات الحسية (15 بنداً)',
    icon: '👁️',
    color: '#9333ea',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 45,
    items: ORIENTATION_MOBILITY_ITEMS,
    thresholdText: 'الدرجة المرتفعة تعكس استقلالاً حركياً ومكانياً ممتازاً | < 20 تدل على احتياج تدريب مكثف على الحركة',
    isDefault: true,
  },

  // 12. Vocational & Transition Scales (التأهيل المهني والتخطيط الانتقالي)
  {
    id: 'transition_vocational',
    name: 'مقياس الجاهزية المهنية والتخطيط الانتقالي',
    nameEn: 'Vocational Readiness & Transition Scale',
    category: 'vocational_transition',
    description: 'تقييم الاستعداد لبيئة العمل، المهارات المهنية، الالتزام بالتعليمات، واستقلالية المجتمع',
    icon: '💼',
    color: '#475569',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 4,
    maxScore: 24,
    items: [
      { id: 'voc_1', text: 'الالتزام بمواعيد الحضور وساعات التدريب والعمل', domain: 'punctuality' },
      { id: 'voc_2', text: 'اتباع توجيهات المشرف والتعليمات المهنية بدقة', domain: 'compliance' },
      { id: 'voc_3', text: 'الاستمرار في أداء المهمة المهنية دون تشتت أو انقطاع', domain: 'task_persistence' },
      { id: 'voc_4', text: 'التعامل الإيجابي مع زملاء العمل والعملاء', domain: 'workplace_social' },
      { id: 'voc_5', text: 'استخدام أدوات السلامة المهنية وتجنب مخاطر العمل', domain: 'safety' },
      { id: 'voc_6', text: 'إتقان المهارات اليدوية والإنتاجية المطلوبة للمهنة', domain: 'productivity' },
    ],
    thresholdText: 'تحديد مؤشر الجاهزية للتوظيف المدعوم أو التوظيف المستقل في سوق العمل',
    isDefault: true,
  },
  {
    id: 'transition_planning_inventory',
    name: 'قائمة مهارات التخطيط الانتقالي والجاهزية للعمل',
    nameEn: 'Transition Planning & Employability Skills Inventory',
    category: 'vocational_transition',
    description: 'تقييم شامل لعادات العمل، التواصل المهني مع المشرف، والسلامة المهنية وتحديد الاستعداد للتوظيف (20 بنداً)',
    icon: '💼',
    color: '#475569',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 60,
    items: TRANSITION_PLANNING_ITEMS,
    thresholdText: 'الدرجة المرتفعة تشير لجاهزية توظيف عالية | < 27 تدل على حاجته لبرنامج تأهيل مهني وانتقالي مكثف',
    isDefault: true,
  },
  {
    id: 'independent_living_scale',
    name: 'مقياس الميول المهنية والاستقلال في المعيشة المستقلة',
    nameEn: 'Vocational Interests & Independent Living Assessment Scale',
    category: 'vocational_transition',
    description: 'تقييم إدارة النقود، التنقل المستقل، العناية بالمنزل، الميول المهنية، والدفاع عن الذات (20 بنداً)',
    icon: '💼',
    color: '#475569',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 60,
    items: INDEPENDENT_LIVING_ITEMS,
    thresholdText: 'الدرجة المرتفعة تعكس استقلالاً معيشياً ومهنياً ممتازاً | < 27 تدل على الحاجة لبرنامج استقلالية',
    isDefault: true,
  },

  // 13. Play & Environmental Scales (اللعب والتقييم البيئي والأسري)
  {
    id: 'play_environmental',
    name: 'مقياس تقييم مهارات اللعب والبيئة الأسرية',
    nameEn: 'Play Skills & Home Environment Assessment',
    category: 'play_environmental',
    description: 'تقييم مراحل اللعب (الحسي، الوظيفي، الرمزي، التخيلي، التبادلي) وجودة البيئة المنزلية',
    icon: '🎲',
    color: '#db2777',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 4,
    maxScore: 24,
    items: [
      { id: 'play_1', text: 'اللعب الاستكشافي والحسي للأشياء وملمسها', domain: 'exploratory' },
      { id: 'play_2', text: 'اللعب الوظيفي بالألعابตาม غرضها المصنوعة له (السيارة تسير، الهاتف للمكالمة)', domain: 'functional' },
      { id: 'play_3', text: 'اللعب الرمزي والتخيلي (إطعام الدمية، تمثيل الأدوار)', domain: 'symbolic' },
      { id: 'play_4', text: 'اللعب التبادلي ومشاركة الألعاب مع الأقران والانتظار', domain: 'social_play' },
      { id: 'play_5', text: 'توفر بيئة منزلية محفزة للتعلم والألعاب المناسبة للعمر', domain: 'home_stimulation' },
      { id: 'play_6', text: 'مستوى التفاعل الإيجابي اليومي والدعم بين الأسرة والطفل', domain: 'family_interaction' },
    ],
    thresholdText: 'تحديد مرحلة اللعب الحالية وتوجيه أولياء الأمور لتطوير استراتيجيات اللعب النمائي',
    isDefault: true,
  },
  {
    id: 'symbolic_play_scale',
    name: 'مقياس مهارات اللعب الرمزي والتفاعل التشاركي',
    nameEn: 'Symbolic Play & Social Interaction Assessment Scale',
    category: 'play_environmental',
    description: 'تقييم مراحل اللعب الوظيفي، الرمزي، والتخيل التشاركي مع الأقران واشتقاق الخطة الفردية (20 بنداً)',
    icon: '🎲',
    color: '#db2777',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 60,
    items: SYMBOLIC_PLAY_ITEMS,
    thresholdText: 'الدرجة المرتفعة تدل على تطور ممتاز في اللعب الرمزي والاجتماعي | < 27 تدل على احتياج تدريب نمائي باللعب',
    isDefault: true,
  },
  {
    id: 'family_disintegration',
    name: 'مقياس التفكك الأسري',
    nameEn: 'Family Disintegration Scale',
    category: 'play_environmental',
    description: '26 فقرة لقياس التفكك والتصدع الأسري والنزاعات والعنف والانفصال والإنفاق المنزلي',
    icon: '👨‍👩‍👧‍👦',
    color: '#7c3aed',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 5,
    maxScore: 130,
    items: FAMILY_DISINTEGRATION_ITEMS.map(it => ({
      id: it.id,
      text: it.text,
      domain: it.domainId,
      isReverse: it.isReverse,
    })),
    thresholdText: 'المتوسط الفرضي 78 درجة. الدرجات الأعلى تشير إلى تفكك وتصدع أسري أكبر يتطلب تدخلاً إرشادياً ونفسياً.',
    isDefault: true,
  },
  ...DOWN_SYNDROME_SCALES,
];

export function getScaleById(scaleId) {
  return DEFAULT_SCALE_LIBRARY.find(scale => scale.id === scaleId) || null;
}

export function getScaleOptions(scale) {
  if (!scale) return [];

  if (scale.responseType === 'yesno') return ['لا', 'نعم'];
  if (scale.responseType === 'number') return Array.from({ length: 11 }, (_, i) => i);
  if (scale.responseType === 'scale_3') return DS_SCALE_3_OPTIONS;
  if (scale.responseType === 'yesno_medical') return DS_YESNO_MEDICAL_OPTIONS;

  const minValue = Number(scale.minValue ?? 1);
  const maxValue = Number(scale.maxValue ?? 4);
  const step = Number(scale.step ?? 0.5);
  const options = [];

  for (let value = minValue; value <= maxValue + 0.0001; value = Number((value + step).toFixed(2))) {
    options.push(Number(value.toFixed(2)));
  }

  return options;
}

// Category ID Normalization & Aliasing for Backward Compatibility
export function normalizeCategoryId(catId) {
  if (!catId) return 'down_syndrome';
  const legacyMap = {
    speech: 'speech_language',
    learning: 'learning_academic',
    sensory: 'sensory_motor',
    psychology: 'behavioral_emotional',
    development: 'developmental_early',
    down: 'down_syndrome',
    ds: 'down_syndrome',
    other: 'autism',
  };
  return legacyMap[catId] || catId;
}

export function groupScalesByCategory(scales = []) {
  return MEASUREMENT_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = scales.filter(scale => {
      const normalizedCat = normalizeCategoryId(scale.category);
      return normalizedCat === category.id;
    });
    return acc;
  }, {});
}

function getScaleMax(scale) {
  return scale?.maxScore || 100;
}

export function buildAssessmentResult(scale, answers = {}) {

  if (scale?.category === 'down_syndrome' || scale?.id?.startsWith('ds_')) {
    const dsResult = calculateDownSyndromeScore(scale.id, answers);
    return {
      total: dsResult.score,
      score: dsResult.score,
      maxScore: dsResult.maxScore,
      percentage: `${dsResult.percentage}%`,
      percentageNum: dsResult.percentage,
      level: dsResult.level,
      color: dsResult.severityColor,
      severityColor: dsResult.severityColor,
      note: scale?.thresholdText || 'تم تقييم التطور النمائي لمتلازمة داون بنجاح',
      isDownSyndrome: true,
    };
  }

  if (scale?.id === 'sensory_integration_scale' || scale?.id === 'sensory_integration') {
    const siResult = calculateSensoryIntegrationScore(answers);
    return {
      total: siResult.totalRawScore,
      score: siResult.totalRawScore,
      maxScore: siResult.maxPossible,
      percentage: `${siResult.percentage}%`,
      percentageNum: siResult.percentage,
      level: siResult.level,
      color: siResult.severityColor,
      severityColor: siResult.severityColor,
      note: siResult.interpretation,
      subscales: siResult.subscales,
      isSensoryIntegration: true,
      cutoffScore: siResult.cutoffScore,
    };
  }

  if (scale?.id === 'family_disintegration') {
    const famResult = calculateFamilyDisintegrationScore(answers);
    return {
      total: famResult.totalRawScore,
      score: famResult.totalRawScore,
      maxScore: famResult.maxPossible,
      percentage: `${famResult.percentage}%`,
      percentageNum: famResult.percentage,
      level: famResult.level,
      color: famResult.severityColor,
      severityColor: famResult.severityColor,
      note: famResult.interpretation,
      subscales: famResult.subscales,
      isFamilyDisintegration: true,
      theoreticalMean: famResult.theoreticalMean,
    };
  }


  if (scale?.id === 'life_skills_scale') {
    const res = calculateLifeSkillsScore(answers);
    return {
      total: res.totalRawScore,
      score: res.totalRawScore,
      maxScore: res.maxPossible,
      percentage: `${res.percentage}%`,
      percentageNum: res.percentage,
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      note: res.interpretation,
    };
  }

  if (scale?.id === 'emotional_adjustment_scale') {
    const res = calculateEmotionalAdjustmentScore(answers);
    return {
      total: res.totalRawScore,
      score: res.totalRawScore,
      maxScore: res.maxPossible,
      percentage: `${res.percentage}%`,
      percentageNum: res.percentage,
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      note: res.interpretation,
    };
  }


  if (scale?.id === 'executive_control_scale') {
    const res = calculateExecutiveControlScore(answers);
    return {
      total: res.totalRawScore,
      score: res.totalRawScore,
      maxScore: res.maxPossible,
      percentage: `${res.percentage}%`,
      percentageNum: res.percentage,
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      note: res.interpretation,
    };
  }

  if (scale?.id === 'executive_planning_scale') {
    const res = calculateExecutivePlanningScore(answers);
    return {
      total: res.totalRawScore,
      score: res.totalRawScore,
      maxScore: res.maxPossible,
      percentage: `${res.percentage}%`,
      percentageNum: res.percentage,
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      note: res.interpretation,
    };
  }

  if (scale?.id === 'functional_hearing_eval') {
    const res = calculateFunctionalHearingScore(answers);
    return {
      total: res.totalRawScore,
      score: res.totalRawScore,
      maxScore: res.maxPossible,
      percentage: `${res.percentage}%`,
      percentageNum: res.percentage,
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      note: res.interpretation,
    };
  }

  if (scale?.id === 'orientation_mobility_scale') {
    const res = calculateOrientationMobilityScore(answers);
    return {
      total: res.totalRawScore,
      score: res.totalRawScore,
      maxScore: res.maxPossible,
      percentage: `${res.percentage}%`,
      percentageNum: res.percentage,
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      note: res.interpretation,
    };
  }

  if (scale?.id === 'transition_planning_inventory') {
    const res = calculateTransitionPlanningScore(answers);
    return {
      total: res.totalRawScore,
      score: res.totalRawScore,
      maxScore: res.maxPossible,
      percentage: `${res.percentage}%`,
      percentageNum: res.percentage,
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      note: res.interpretation,
    };
  }

  if (scale?.id === 'independent_living_scale') {
    const res = calculateIndependentLivingScore(answers);
    return {
      total: res.totalRawScore,
      score: res.totalRawScore,
      maxScore: res.maxPossible,
      percentage: `${res.percentage}%`,
      percentageNum: res.percentage,
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      note: res.interpretation,
    };
  }

  if (scale?.id === 'symbolic_play_scale') {
    const res = calculateSymbolicPlayScore(answers);
    return {
      total: res.totalRawScore,
      score: res.totalRawScore,
      maxScore: res.maxPossible,
      percentage: `${res.percentage}%`,
      percentageNum: res.percentage,
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      note: res.interpretation,
    };
  }








  const items = scale?.items || [];
  const total = items.reduce((sum, item) => {
    const value = Number(answers[item.id] ?? 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const maxScore = getScaleMax(scale);
  const percentageNum = maxScore > 0 ? Number(((total / maxScore) * 100).toFixed(1)) : 0;

  let level = 'غير محدد';
  let color = '#64748b';


  return {
    total,
    score: total,
    maxScore,
    percentage: `${percentageNum}%`,
    percentageNum,
    level,
    color,
    severityColor: color,
    note: scale?.thresholdText || 'تم حساب النتيجة بناءً على المقياس المختار',
  };
}

export { DEFAULT_SCALE_LIBRARY };
