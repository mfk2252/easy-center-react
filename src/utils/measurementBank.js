import { GARS3_ITEMS } from '../data/gars3Data';
import { SRS2_ITEMS, calculateSRS2Score } from '../data/srs2Data';
import { DEV_LD_ITEMS } from '../data/devLdData';
import { LDDRS_ITEMS } from '../data/lddrsData';
import { SARTAWI_ITEMS } from '../data/sartawiData';
import { MYKLEBUST_ITEMS } from '../data/myklebustData';
import { FAMILY_DISINTEGRATION_ITEMS, calculateFamilyDisintegrationScore } from '../data/familyDisintegrationData';
import { SENSORY_INTEGRATION_ITEMS, calculateSensoryIntegrationScore } from '../data/sensoryIntegrationData';
import { SENSORY_CHECKLIST_ITEMS, calculateSensoryChecklistScore } from '../data/sensoryChecklistData';

import { ABAS_ITEMS, calculateABASScore } from '../data/abasData';
import { LIFE_SKILLS_ITEMS, calculateLifeSkillsScore } from '../data/lifeSkillsData';
import { ASQ3_ITEMS, calculateASQ3Score } from '../data/asq3Data';
import { DENVER2_ITEMS, calculateDenver2Score } from '../data/denver2Data';
import { SDQ_ITEMS, calculateSDQScore } from '../data/sdqData';
import { EMOTIONAL_ADJUSTMENT_ITEMS, calculateEmotionalAdjustmentScore } from '../data/emotionalAdjustmentData';
import { VANDERBILT_ITEMS, calculateVanderbiltScore } from '../data/vanderbiltAdhdData';
import { EXECUTIVE_CONTROL_ITEMS, calculateExecutiveControlScore } from '../data/executiveControlData';
import { EXECUTIVE_PLANNING_ITEMS, calculateExecutivePlanningScore } from '../data/executivePlanningData';
import { FUNCTIONAL_HEARING_ITEMS, calculateFunctionalHearingScore } from '../data/functionalHearingData';
import { ORIENTATION_MOBILITY_ITEMS, calculateOrientationMobilityScore } from '../data/orientationMobilityData';
import { TRANSITION_PLANNING_ITEMS, calculateTransitionPlanningScore } from '../data/transitionPlanningData';
import { INDEPENDENT_LIVING_ITEMS, calculateIndependentLivingScore } from '../data/independentLivingData';
import { SYMBOLIC_PLAY_ITEMS, calculateSymbolicPlayScore } from '../data/symbolicPlayData';

import { CONNERS_PARENT_ITEMS, calculateConnersParentScore } from "../data/connersParentData";
import { MCHAT_ITEMS } from '../data/mchatData';
import { ATEC_ITEMS } from '../data/atecData';
import { SCQ_ITEMS, calculateSCQScore } from '../data/scqData';
import { AQ_ITEMS, calculateAQPsychometrics } from '../data/aqData';
import {
  DOWN_SYNDROME_SCALES,
  DS_SCALE_3_OPTIONS,
  DS_YESNO_MEDICAL_OPTIONS,
  calculateDownSyndromeScore,
} from '../data/downSyndromeData';
import {
  WISC5_ITEMS,
  WISC5_COPYRIGHT_INFO,
  calculateWISC5Psychometrics,
} from '../data/wisc5Data';
import {
  SB5_ITEMS,
  SB5_COPYRIGHT_INFO,
  calculateSB5Psychometrics,
} from '../data/sb5Data';
import {
  LEITER3_ITEMS,
  LEITER3_COPYRIGHT_INFO,
  calculateLeiter3Psychometrics,
} from '../data/leiter3Data';
import {
  RAVEN_CPM_ITEMS,
  RAVEN_COPYRIGHT_INFO,
  calculateRavenPsychometrics,
} from '../data/ravenData';

export const MEASUREMENT_CATEGORIES = [
  {
    id: 'down_syndrome',
    name: 'مقاييس وتأهيل متلازمة داون',
    nameEn: 'Down Syndrome Diagnostic & Developmental Scales',
    icon: '🧬',
    color: '#0891b2',
    description: 'بطاريات تقييم النمو الحركي، التطور اللغوي، المؤشرات الصحية، الاستقلالية الذاتية، والجاهزية للدمج لمتلازمة داون (14 مقياساً مقنناً)',
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

export const CARS_QUESTIONS = [
  {
    id: 1,
    title: "المقياس الأول: الاتصال بالآخرين",
    options: [
      { score: 1.0, description: "ليس هناك ما يدل على وجود صعوبة أو شذوذ في الاتصال بالآخرين. سلوك الطفل مناسب لسنه وقد يلاحظ ظهور بعض الخجل أو سرعة الأهتياج عندما يخبره أحد بما يجب عليه فعله ولكن ليس إلى درجة غير سوية." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "علاقة الطفل بالآخرين هي علاقات غير سوية بدرجة طفيفة. قد يتجنب الطفل النظر إلى الراشدين في أعينهم أو يتجنب الراشدين أو يتهيج إذا أجبر على التفاعل معهم، الخجل المفرط، لا يصبح مستجيباً للراشدين كما هو معتاد، أو يلتصق بالوالدين إلى حد ما أكثر مما يفعل الأطفال في مثل سنه." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "علاقات غير سوية بشكل مفرط. يظهر الطفل تباعد (يبدو غير واع بالراشدين) في بعض الأحيان ويحتاج إلى بذل الآخرين لمحاولات مستمرة إجبارية لجذب انتباهه أحياناً، مبادأته والاتصال بالأخرين ضئيلة." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "علاقات غير سوية بشكل حاد. الطفل دائم التباعد أو غير واع بما يقوم به الراشدون ولا يستجيب أبداً للراشدين أو يبادئ بالاتصال معهم، ولا تجدي سوى المحاولات شديدة الإصرار في جعل الطفل ينتبه للآخرين." }
    ]
  },
  {
    id: 2,
    title: "المقياس الثاني: التقليد",
    options: [
      { score: 1.0, description: "التقليد المناسب. في وسع الطفل تقليد الأصوات والكلمات والحركات المناسبة لمستوى مهارته وعمره الزمني." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "التقليد غير السوي. يقلد الطفل السلوك البسيط مثل التصفيق أو الأصوات اللفظية المفردة معظم الوقت وأحياناً يقلد فقط بعد حثه على ذلك أو متأخراً." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "التقليد غير السوي بشكل متوسط. يقلد الطفل في بعض الأحيان فقط ويحتاج إلى قدر كبير من الإصرار والمساعدة من قبل الراشدين وكثيراً ما يقلد بصورة متأخرة فقط." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "التقليد غير السوي بشكل حاد. الطفل نادراً حتى عندما يحثه الراشدون على ذلك ما يقلد الأصوات أو الكلمات أو الحركات أو قد لا يفعل إطلاقاً ويساعدونه." }
    ]
  },
  {
    id: 3,
    title: "المقياس الثالث: الاستجابة الانفعالية",
    options: [
      { score: 1.0, description: "الاستجابات الانفعالية مناسبة لعمر الطفل وللمواقف. يظهر الطفل النمط والدرجة المناسبين من الاستجابة الانفعالية كما يتضح من تغير تعبيرات الوجه والإيماءات." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "الاستجابات الانفعالية غير السوية بشكل طفيف. يبدي الطفل أحياناً نمطاً غير مناسب أو درجة غير ملائمة من ردود الفعل الانفعالية وتكون ردود الأفعال أحياناً غير متصلة بالأشياء أو الأحداث المحيطة." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "الاستجابات الانفعالية غير السوية بشكل متوسط. يبدي الطفل علامات مؤكدة بوجود نمط أو درجة غير مناسبة من الاستجابة الانفعالية وقد يكون هناك كف تام أو مفرط أو غير متصل بالموقف بردود الفعل وقد يتجهم أو يضحك أو يصبح جامد بالرغم من عدم وجود أشياء أو أحداث واضحة تسبب الانفعال." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "الاستجابات الانفعالية غير سوية بشكل حاد. نادراً ما تكون الاستجابات ملائمة للموقف ومتى دخل الطفل في مزاج معين فمن الصعب جداً تغييره وبالعكس فقد يبدي الطفل انفعالات شديدة التباين عندما لا يكون هناك شئ قد تغير." }
    ]
  },
  {
    id: 4,
    title: "المقياس الرابع: استخدام الجسم",
    options: [
      { score: 1.0, description: "استخدام الجسم بشكل مناسب للعمر. يتحرك الطفل بنفس القدر من السهولة والخفة والتآزر التي يتمتع بها الطفل السوي في مثل عمره." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "استخدام الجسم غير السوي بشكل طفيف. قد تكون هناك بعض أوجه الشذوذ الثانوية مثل الافتقار إلى الخفة والرشاقة، الحركات التكرارية، سوء التآزر أو ظهور حركات غير سوية أكثر بشكل نادر." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "استخدام الجسم غير السوي بشكل متوسط. قد تشمل أنواع السلوك التي تعد غريبة أو غير مألوفة بشكل واضح بالنسبة لطفل في مثل عمره مثل حركات الأصابع الغريبة وأوضاع الجسم أو الحملقة في الجسم أو النقر عليه والعدوان الموجه إلى الذات، الأهتزاز، الدوران السريع، نقر الأصابع، المشي على أصابع القدم." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "إستخدام الجسم غير السوي بشكل حاد. تعد الحركات الحادة أو المتكررة من النوع المذكور سابقاً علامات على استخدام الجسم غير السوي بشكل حاد وقد يستمر هذا السلوك بالرغم من محاولات إثناء الطفل عن القيام بها أو إشراكه في أنشطة أخرى." }
    ]
  },
  {
    id: 5,
    title: "المقياس الخامس: استخدام الأشياء",
    options: [
      { score: 1.0, description: "الاستخدام والاهتمام المناسبين باللعب والأشياء الأخرى. يبدي الطفل اهتماماً سوياً باللعب والأشياء الأخرى المناسبة لمستوى مهاراته واستخدام هذه اللعب بطريقة مناسبة." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "الاهتمام غير المناسب بدرجة طفيفة باللعب والأشياء الأخرى أو استخدامها بطريقة غير ملائمة. قد يبدي الطفل اهتماماً غير سوي بلعبة أو يلعب بها بطريقة طفوليه غير مناسبة مثل ضرب اللعبة بعنف أو مصها." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "الاهتمام أو الاستخدام غير المناسب بشكل متوسط باللعب والأشياء الأخرى. قد يبدي الطفل اهتماماً قليلاً باللعب أو الأشياء الأخرى أو قد يكون منشغلاً باستخدام شئ أو لعبة بطريقة غريبة وقد يركز على جزء غير هام من اللعبة ويصبح منبهراً بالضوء المنعكس على الأشياء ويحرك جزء ما من الشئ بصورة متكررة أو يلعب بشئ واحد دون غيره." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "الاهتمام أو الاستخدام غير المناسب بشكل حاد باللعب أو الأشياء الأخرى. قد يقوم الطفل بنفس التصرفات السابقة بتكرار أكبر ونجد من الصعب صرف انتباه الطفل متى بدأ في هذه الأنشطة غير المناسبة." }
    ]
  },
  {
    id: 6,
    title: "المقياس السادس: التكيف مع التغيير",
    options: [
      { score: 1.0, description: "استجابة الطفل بشكل يتناسب مع سنه. بينما قد يلاحظ الطفل التغيرات في الروتين أو يعلق عليها فإنه يتقبل هذه التغيرات بدون إحساس غير ملائم بالضيق." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "التكيف غير الملائم بدرجة طفيفة للتغيير. عندما يحاول شخص راشد أن يغير المهام قد يستمر الطفل في نفس النشاط أو يستخدم نفس المواد." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "التكيف غير الملائم بشكل متوسط للتغير. يقاوم الطفل بشدة التغيرات في الروتين ويحاول الاستمرار في النشاط القديم ويصعب صرف انتباهه عنه وقد يصبح غاضباً وغير سعيد عندما يتغير روتين قد اعتاده." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "التكيف غير الملائم بشكل حاد للتغيير. يبدي الطفل ردود أفعال حادة للتغيير وإذا أرغم على تغيير معين فقد يصبح غاضباً أو غير متعاون بشكل مفرط ويستجيب بنوبات غضب." }
    ]
  },
  {
    id: 7,
    title: "المقياس السابع: الاستجابة البصرية",
    options: [
      { score: 1.0, description: "الاستجابة البصرية المناسبة للعمر. سلوك الطفل البصري سوي ومناسب لسنه وتستخدم الرؤية مع الحواس الأخرى كوسيلة لاستكشاف الأشياء الجديدة." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "الاستجابة البصرية غير السوية بشكل طفيف. يتحتم تركيز الطفل من حين لأخر كي ينظر إلى الأشياء وقد يكون الطفل أكثر اهتماماً من أقرانه بالنظر إلى المرآة أو الضوء وقد يحملق من حين لأخر في الفضاء أو قد يتجنب النظر إلى الناس في أعينهم." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "الاستجابة البصرية غير السوية بشكل متوسط. يتحتم تذكير الطفل كثيراً كي ينظر إلى ما يقوم به وقد يحملق في الفضاء ويتجنب النظر إلى الناس في أعينهم وينظر إلى الأشياء من زاوية غير مألوفة أو يقرب الأشياء جداً من عينيه." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "الاستجابة البصرية غير السوية بشكل حاد. يتجنب الطفل باستمرار النظر إلى الناس أو أشياء معينة وقد يبدي أشكالاً متطرفة من التصرفات البصرية الغريبة المذكورة سابقاً." }
    ]
  },
  {
    id: 8,
    title: "المقياس الثامن: الاستجابة السمعية",
    options: [
      { score: 1.0, description: "الاستجابة السمعية المناسبة للعمر. سلوك الاستماع لدي الطفل سوي ومناسب لسنه ويستخدم الاستماع بشكل متكامل مع الحواس الأخرى." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "الاستجابة السمعية غير المناسبة بشكل طفيف. قد يكون هناك نقص ما في الاستجابة أو رد فعل مفرط نوعاً ما لأصوات معينة وقد تتأخر الاستجابات للأصوات وقد تكون هناك حاجة لتكرار الأصوات لجذب انتباه الطفل وقد يتشتت انتباه الطفل بفعل الأصوات العرضية." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "الاستجابة السمعية غير المناسبة بشكل متوسط. تتباين استجابات الطفل للأصوات وكثيراً ما يتجنب صوت عند صدوره في المرات الأولى وقد يضع يديه على أذنيه عندما يسمع بعض الأصوات المألوفة." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "الاستجابة السمعية غير السوية بشكل حاد. رد فعل الطفل للأصوات زائد عن الحد أو منخفض عنه بدرجة ملحوظة بغض النظر عن نوع الصوت." }
    ]
  },
  {
    id: 9,
    title: "المقياس التاسع: اللمس - الشم - التذوق واستخدامها",
    options: [
      { score: 1.0, description: "الاستخدام السوي للتذوق، الشم، اللمس والاستجابة المناسبة لها. يستكشف الطفل الأشياء الجديدة بطريقة مناسبة لسنه بوجه عام عن طريق التحسس والنظر وقد يستخدم التذوق والشم عندما يكون ذلك ملائماً، رد فعله للألم العادي أو العقاب أو المكدرات يكون من خلال إظهار عدم الارتياح ولكنه لا يكون مبالغاً فيه." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "الاستخدام والاستجابة غير السوية بشكل طفيف للتذوق، الشم، اللمس. قد يستمر الطفل في وضع الأشياء في فمه وقد يشم أو يتذوق الأشياء غير الصالحة للأكل، قد يتجاهل أو يبالغ في رد فعله للألم الطفيف الذي يعبر الطفل السوي عن عدم الارتياح تجاهه." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "الاستخدام والاستجابة غير السوية بشكل متوسط للتذوق، الشم، اللمس. قد ينشغل الطفل بشكل متوسط بلمس أو شم أو تذوق الأشياء أو الأشخاص وقد يستجيب الطفل بشكل إما حاد أو منخفض للألم العادي." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "الاستخدام والاستجابة غير السوية بشكل حاد للتذوق، الشم، اللمس. ينشغل الطفل بشم أو تحسس الأشياء بغرض الإحساس وليس للاستكشاف السوي أو استخدام الأشياء وقد يتجاهل الطفل تماماً الألم أو يستجيب بشدة للمضايقة الطفيفة." }
    ]
  },
  {
    id: 10,
    title: "المقياس العاشر: الخوف أو العصبية",
    options: [
      { score: 1.0, description: "الخوف أو العصبية السوية. سلوك الطفل ملائم لكل من الموقف وعمره الزمني في المخاوف أو العصبية." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "الخوف والعصبية غير السويين بشكل طفيف. يظهر الطفل من حين إلى آخر خوفاً كبيراً للغاية مقارنة بـ رد فعل الطفل السوي في مثل عمره في المواقف المماثلة." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "الخوف أو العصبية غير السويين بشكل متوسط. يبدي الطفل إما خوفاً أكبر أو أقل مما يميز حتى الطفل الأصغر سناً منه في موقف مشابه من مواقف الخوف." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "الخوف أو العصبية غير السويين بشكل حاد. تستمر مخاوف الطفل حتى بعد التعرض المتكرر للأحداث أو الأشياء غير الضارة ونجد أنه من الصعوبة بمكان تهدئة الطفل أو طمأنته وبالعكس فقد يخفق الطفل في إظهار الاهتمام المناسب بالمخاطر التي يتجنبها الأطفال الآخرين في مثل عمره." }
    ]
  },
  {
    id: 11,
    title: "المقياس الحادي عشر: الاتصال اللفظي",
    options: [
      { score: 1.0, description: "الاتصال اللفظي السوي. الاتصال اللفظي للطفل مناسب للموقف والعمر الزمني." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "الاتصال اللفظي غير السوي بشكل طفيف. هناك تأخر كلي في الكلام فمعظم الكلام ذو معنى ومع ذلك فقد يحدث بعض المصاداة (Echolalia) أو عكس المقاطع وقد تستخدم بعض الكلمات الغريبة أو غير المفهومة من حين لآخر." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "الاتصال اللفظي غير السوي بشكل متوسط. قد لا يكون هناك كلام تماماً وعندما يكون هناك كلام فقد يكون الاتصال اللفظي خليطاً من بعض الكلام ذي المعنى والكلام الغريب مثل: الرطانة (كلام عديم المعنى وغير مفهوم)، المصاداة، أو عكس المقاطع؛ وتشمل الأشياء الغريبة في الكلام ذي المعنى طرح الأسئلة بشكل مفرط أو الانشغال الزائد بموضوعات معينة." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "الاتصال اللفظي غير السوي بشكل حاد. لا يستخدم كلاماً ذا معنى وقد يطلق الطفل صرخات طفولية حادة وطويلة وأصواتاً تشبه أصوات الحيوانات وأصواتاً معقدة تشبه الكلام أو قد يظهر استخداماً دائماً غريباً لبعض الكلمات أو الجمل المألوفة." }
    ]
  },
  {
    id: 12,
    title: "المقياس الثاني عشر: الاتصال غير اللفظي",
    options: [
      { score: 1.0, description: "الاستخدام السوي للاتصال غير اللفظي. الاتصال غير اللفظي مناسب للعمر الزمني وللمواقف المختلفة." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "الاستخدام غير السوي بشكل طفيف للاتصال غير اللفظي. الاستخدام غير الناضج للاتصال غير اللفظي، فالطفل قد يشير فقط بشكل غامض أو يمد يده لما يريده في المواقف التي قد يشير فيها الطفل في مثل عمره أو يومئ بشكل محدد للشئ الذي يريده." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "الاستخدام غير السوي بشكل متوسط للاتصال غير اللفظي. يعجز الطفل بشكل عام عن التعبير عن احتياجاته ورغباته بشكل غير لفظي ولا يستطيع فهم الاتصال غير اللفظي من قبل الآخرين." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "الاستخدام غير السوي بشكل حاد للاتصال غير اللفظي. يستخدم الطفل فقط الإيماءات الغريبة وغير المألوفة التي ليس لها معنى واضح ولا يبدي وعياً بالمعاني المرتبطة بالإيماءات أو تعبيرات الوجه الصادرة من الآخرين." }
    ]
  },
  {
    id: 13,
    title: "المقياس الثالث عشر: مستوى النشاط",
    options: [
      { score: 1.0, description: "مستوى النشاط مناسب للعمر والظروف المحيطة. الطفل ليس أكثر ولا أقل نشاطاً من الطفل السوي في نفس عمره في المواقف المشابهة." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "مستوى النشاط غير السوي بشكل طفيف. قد يكون الطفل إما متململاً بشكل طفيف أو خامل وبطئ الحركة نوعاً ما في بعض الأحيان." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "مستوى النشاط غير السوي بشكل متوسط. قد يكون الطفل نشطاً تماماً ومن الصعب كبح جماح حركته." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "مستوى النشاط غير السوي بشكل حاد. يبدي الطفل قدراً مفرطاً من النشاط أو الخمول وقد يتنقل بين النقيضين." }
    ]
  },
  {
    id: 14,
    title: "المقياس الرابع عشر: مستوى اتساق وثبات الاستجابة العقلية",
    options: [
      { score: 1.0, description: "الذكاء عادي وثابت بدرجة مناسبة عبر المجالات المختلفة. الطفل في مثل ذكاء الأطفال العاديين في مثل عمره وليس لديه أي مهارات أو مشكلات عقلية غير مألوفة." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "الأداء العقلي غير السوي بشكل طفيف. الطفل ليس في مثل ذكاء الأطفال العاديين في مثل سنه ويبدي تأخراً متساوياً في كل المجالات." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "الأداء العقلي غير السوي بشكل متوسط. بوجه عام الطفل ليس في مثل ذكاء الأطفال العاديين في مثل سنه ومع ذلك فإن أداء الطفل قد يكون سوياً تقريباً في مجال عقلي أو آخر." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "الأداء العقلي غير السوي بشكل حاد. بينما الطفل بوجه عام ليس في مثل ذكاء الطفل العادي في مثل سنه فإن أداءه قد يكون حتى أفضل من الطفل السوي في مثل عمره في مجال أو أكثر." }
    ]
  },
  {
    id: 15,
    title: "المقياس الخامس عشر: انطباعات الفاحص",
    options: [
      { score: 1.0, description: "لا توجد ذاتوية. الطفل لا يبدي أياً من الأعراض المميزة للذاتوية." },
      { score: 1.5, description: "درجة متوسطة بين 1 و 2" },
      { score: 2.0, description: "ذاتوية طفيفة. الطفل يبدي فقط أعراضاً قليلة أو فقط درجة طفيفة من الذاتوية." },
      { score: 2.5, description: "درجة متوسطة بين 2 و 3" },
      { score: 3.0, description: "الذاتوية المتوسطة. الطفل يبدي عدداً من أعراض الذاتوية أو درجة متوسطة منها." },
      { score: 3.5, description: "درجة متوسطة بين 3 و 4" },
      { score: 4.0, description: "ذاتوية حادة. يبدي الطفل أعراضاً كثيرة أو درجة شديدة من الذاتوية." }
    ]
  }
];

// دالة دقيقة لحساب التشخيص بناءً على مجموع الدرجات
export const calculateCARSScore = (scoresObject) => {
  const scores = Object.values(scoresObject);
  
  // التأكد من الإجابة على جميع المقاييس الـ 15
  if (scores.length < 15) {
    return {
      isComplete: false,
      totalScore: 0,
      category: "يرجى الإجابة على جميع الأسئلة للتشخيص",
      severityColor: "gray"
    };
  }

  const totalScore = scores.reduce((acc, curr) => acc + Number(curr), 0);

  let category = "";
  let severityColor = "";

  if (totalScore < 30) {
    category = "غير توحدي (لا يقع ضمن طيف التوحد)";
    severityColor = "green";
  } else if (totalScore >= 30 && totalScore <= 36.5) {
    category = "بسيط إلى متوسط التوحد (Mild-to-Moderate Autism)";
    severityColor = "orange";
  } else {
    category = "شديد / حاد التوحد (Severe Autism)";
    severityColor = "red";
  }

  return {
    isComplete: true,
    totalScore,
    category,
    severityColor
  };
};

const CARS_ITEMS = [
  {
    id: 'c1',
    text: 'الاتصال بالآخرين: مستوى مهارة الطفل في التفاعل الاجتماعي المباشر مع الآخرين.',
    domain: 'social',
  },
  {
    id: 'c2',
    text: 'التقليد: قدرة الطفل على محاكاة الأصوات والكلمات والحركات المناسبة لعمره.',
    domain: 'social',
  },
  {
    id: 'c3',
    text: 'الاستجابة الانفعالية: مدى ملاءمة ردود فعل الطفل العاطفية للحدث أو الموقف.',
    domain: 'emotion',
  },
  {
    id: 'c4',
    text: 'استخدام الجسم: تنسيق الحركات، التوازن، التكرار الحركي، وملاءمة الحركة لعمر الطفل.',
    domain: 'motor',
  },
  {
    id: 'c5',
    text: 'استخدام الأشياء: طبيعة التفاعل مع الألعاب والأشياء والاهتمام بها.',
    domain: 'play',
  },
  {
    id: 'c6',
    text: 'التكيّف مع التغيير: قدرة الطفل على قبول التغير في الروتين أو النشاط.',
    domain: 'behavior',
  },
  {
    id: 'c7',
    text: 'الاستجابة البصرية: مدى انتباه الطفل البصري وكيفية استخدامه للرؤية في التعرف على المثيرات.',
    domain: 'sensory',
  },
  {
    id: 'c8',
    text: 'الاستجابة السمعية: مدى استجابة الطفل للأصوات، وتشتت انتباهه أو فرط حساسيته لها.',
    domain: 'sensory',
  },
  {
    id: 'c9',
    text: 'اللمس، الشم، والتذوق: مدى تفاعل الطفل مع المثيرات الحسية واللمسية والمذاقية.',
    domain: 'sensory',
  },
  {
    id: 'c10',
    text: 'الخوف أو العصبية: مدى ملاءمة رد فعل الطفل تجاه المواقف المخيفة أو المجهدة.',
    domain: 'emotion',
  },
  {
    id: 'c11',
    text: 'التواصل اللفظي: قدرة الطفل على استخدام الكلام وبنيته ومعناه.',
    domain: 'communication',
  },
  {
    id: 'c12',
    text: 'التواصل غير اللفظي: قدرة الطفل على الإشارة، التعبير، وفهم الإشارات غير اللفظية.',
    domain: 'communication',
  },
  {
    id: 'c13',
    text: 'مستوى النشاط: مدى ملاءمة مستوى الحركة والنشاط للطفل في الموقف.',
    domain: 'behavior',
  },
  {
    id: 'c14',
    text: 'اتساق واستقرار الاستجابة العقلية: مستوى التناسق العام في الأداء المعرفي والاستجابة.',
    domain: 'cognitive',
  },
  {
    id: 'c15',
    text: 'انطباع الفاحص العام: مدى ظهور السمات السلوكية المميزة للتوحد في الطفل.',
    domain: 'general',
  },
];

function generateItems(prefix, count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}${index + 1}`,
    text: `بند ${index + 1}`,
    domain: 'general',
  }));
}

const GARS_ITEMS = generateItems('g', 58);
const SRS_ITEMS = generateItems('s', 65);

const DEFAULT_SCALE_LIBRARY = [
  // 1. Autism Spectrum Scales (اضطرابات طيف التوحد)
  {
    id: 'mchat_r_f',
    name: 'قائمة تفقد التوحد المعدلة (M-CHAT-R/F)',
    nameEn: 'M-CHAT-R/F (Modified Checklist for Autism in Toddlers, Revised with Follow-Up)',
    category: 'autism',
    description: 'الأداة العالمية المقننة للمسح والكشف المبكر عن طيف التوحد للأطفال من عمر 16 إلى 30 شهراً — 20 بنداً تشخيصياً مع تحديد مستويات الخطر الإكلينيكي والمقابلة التتبعية',
    icon: '🧩',
    color: '#2563eb',
    scoreMode: 'sum',
    responseType: 'yesno',
    minValue: 0,
    maxValue: 1,
    maxScore: 20,
    items: MCHAT_ITEMS,
    thresholdText: '0-2: خطر منخفض (Low Risk) | 3-7: خطر متوسط (Medium Risk) | 8-20: خطر مرتفع (High Risk)',
    isDefault: true,
  },
  {
    id: 'cars',
    name: 'كارز (CARS-2)',
    nameEn: 'CARS-2 (Childhood Autism Rating Scale, 2nd Ed.)',
    category: 'autism',
    description: 'المعيار الذهبي لتقدير وتشخيص طيف التوحد — 15 بنداً تشخيصياً مع الدرجات المعيارية T والرتب المئينية',
    icon: '🧩',
    color: '#1a56db',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 4,
    step: 0.5,
    maxScore: 60,
    items: CARS_ITEMS,
    thresholdText: 'أقل من 30: غير توحدي / الحد الأدنى من الأعراض | 30 إلى 36.5: توحد خفيف إلى متوسط | 37 إلى 60: توحد شديد',
    isDefault: true,
  },
  {
    id: 'gars',
    name: 'جيليام (GARS-3)',
    nameEn: 'GARS-3 (Gilliam Autism Rating Scale, 3rd Ed.)',
    category: 'autism',
    description: 'مقياس جيليام لتقدير اضطراب طيف التوحد وفق DSM-5 — 58 بنداً مقننة على 6 مقاييس فرعية مع معامل التوحد AQ والرتب المئينية',
    icon: '📊',
    color: '#0d9488',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 140,
    items: GARS3_ITEMS.map(it => ({
      id: it.id,
      text: it.text,
      domain: it.domainId,
      domainCode: it.domainCode,
    })),
    thresholdText: 'معامل التوحد (AQ): 54 فأقل: غير محتمل | 55 إلى 70: محتمل (بسيط) | 71 إلى 100: ملائم/مؤكد (متوسط) | 101+: ملائم جداً (شديد)',
    isDefault: true,
  },
  {
    id: 'atec',
    name: 'استمارة تقييم علاج وبرامج التوحد (ATEC)',
    nameEn: 'Autism Treatment Evaluation Checklist (ATEC)',
    category: 'autism',
    description: 'أداة القياس العالمية المفتوحة بدون حقوق ملكية من معهد أبحاث التوحد (ARI) — 77 بنداً على 4 مجالات نمائية لقياس فاعلية التدخل وتتبع التطور',
    icon: '🧩',
    color: '#1e3a8a',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 180,
    items: ATEC_ITEMS.map(it => ({
      id: String(it.id),
      text: `${it.title}: ${it.subtitle}`,
      domain: it.domainId,
    })),
    thresholdText: '0-30: طيف خفيف جداً / استجابة نمائية عالية | 31-50: طيف خفيف إلى متوسط | 51-104: طيف متوسط إلى شديد | 105-180: طيف شديد جداً',
    isDefault: true,
  },
  {
    id: 'scq',
    name: 'استبيان التواصل الاجتماعي المفتوح (SCQ)',
    nameEn: 'Social Communication Questionnaire (SCQ) — Open DSM-5',
    category: 'autism',
    description: 'أداة الفرز والمسح العالمية المفتوحة المعتمدة على خوارزمية DSM-5 / ADI-R — 40 بنداً للفرز السريع والكشف عن مؤشرات اضطراب طيف التوحد (عتبة القطع = 15)',
    icon: '📋',
    color: '#059669',
    scoreMode: 'subscale',
    responseType: 'boolean',
    minValue: 0,
    maxValue: 1,
    maxScore: 39,
    items: SCQ_ITEMS.map(it => ({
      id: String(it.id),
      text: it.textAr,
      domain: it.domainId,
    })),
    thresholdText: 'درجة القطع للفرز: 15 فأكثر = اشتباه إيجابي باضطراب طيف التوحد | 22 فأكثر = مؤشرات توحد كلاسيكي شديد | أقل من 15 = ضمن الحدود الطبيعية',
    isDefault: true,
  },
  {
    id: 'aq',
    name: 'مقياس طيف التوحد للأطفال واليافعين (AQ)',
    nameEn: 'Autism Spectrum Quotient (AQ - Child / Adolescent) — Cambridge ARC',
    category: 'autism',
    description: 'أداة الفرز والمسح السريرية العالمية من مركز أبحاث التوحد بجامعة كامبريدج (Simon Baron-Cohen) — 50 عبارة مقسمة على 5 أبعاد معرفية وسلوكية مع عتبة القطع الإكلينيكية (Cut-off ≥ 30)',
    icon: '🧠',
    color: '#059669',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 1,
    maxScore: 50,
    items: AQ_ITEMS.map(it => ({
      id: String(it.id),
      text: it.textAr,
      domain: it.domainId,
    })),
    thresholdText: 'عتبة القطع الإكلينيكية: 30 فأكثر = مؤشر مرتفع لسمات طيف التوحد (يتطلب تقييماً تشخيصياً شاملاً) | 26-29 = سمات متوسطة/حدية | 0-25 = ضمن النطاق النمائي الطبيعي',
    isDefault: true,
  },
  {
    id: 'srs',
    archived: true,
    isArchived: true,
    name: 'استمارة الملاحظة والفرز النمائي للاستجابة والتواصل الاجتماعي',
    nameEn: 'Social Communication & Responsiveness Observational Screening (DSM-5)',
    category: 'autism',
    description: 'استمارة ملاحظة سريرية نمائية داخلية لتقييم الوعي الاجتماعي، التواصل المتبادل، والأنماط السلوكية وفق معايير DSM-5 (65 بنداً ملاحظياً)',
    icon: '👥',
    color: '#059669',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 1,
    maxValue: 4,
    maxScore: 260,
    items: SRS2_ITEMS,
    thresholdText: 'الدرجة التائية: 59 فأقل طبيعي | 60-65 مؤشرات بسيطة | 66-75 مؤشرات متوسطة | 76 فأكثر مؤشرات بارزة',
    isDefault: true,
  },
  {
    id: 'pep3',
    name: 'الملف النفسي التربوي للتوحد (PEP-3)',
    nameEn: 'PEP-3 (Psychoeducational Profile)',
    category: 'autism',
    description: 'تقييم مستويات النمو والسلوكيات غير السوية لتصميم البرامج التربوية الفردية للأطفال ذوي التوحد',
    icon: '📋',
    color: '#2563eb',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 2,
    maxScore: 60,
    items: [
      { id: 'pep_1', text: 'الإدراك والتفكير اللفظي وغير اللفظي', domain: 'cognitive' },
      { id: 'pep_2', text: 'اللغة التعبيرية ونطق الكلمات واستخدام الجمل', domain: 'expressive' },
      { id: 'pep_3', text: 'اللغة الاستقبالية وفهم الإشارات والأوامر', domain: 'receptive' },
      { id: 'pep_4', text: 'المهارات الحركية الدقيقة واستخدام اليدين والأصابع', domain: 'fine_motor' },
      { id: 'pep_5', text: 'المهارات الحركية الكبيرة والتوازن والقفز', domain: 'gross_motor' },
      { id: 'pep_6', text: 'التقليد البصري والحركي للأفعال', domain: 'motor_imitation' },
      { id: 'pep_7', text: 'الاستجابة الانفعالية ومشاركة المشاعر', domain: 'emotional' },
      { id: 'pep_8', text: 'التفاعل والتبادل الاجتماعي مع الأقران والفاحص', domain: 'social' },
      { id: 'pep_9', text: 'السلوكيات الحركية والنمطية والتكرارية', domain: 'stereotyped' },
      { id: 'pep_10', text: 'السلوكيات اللفظية غير المناسبة والتكرار اللفظي', domain: 'verbal_behaviors' },
    ],
    thresholdText: 'درجات النجاح والانتقال تترجم إلى عمر نمائي ونقاط قوة واحتياج للخطة الفردية',
    isDefault: true,
  },

  // 2. Speech, Language & Communication Scales (النطق واللغة والتواصل)
  {
    id: 'pls5',
    name: 'مقياس لغة الأطفال — الإصدار الخامس (PLS-5)',
    nameEn: 'Preschool Language Scales Fifth Edition',
    category: 'speech_language',
    description: 'تقييم شامل للغة الاستقبالية والتعبيرية للأطفال مع حساب العمر الزمني والدرجة المعيارية والرتب المئينية واشتقاق خطة IEP.',
    icon: '🗣️',
    color: '#0e7490',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 1,
    maxScore: 80,
    items: [
      { id: 'pls5_rec', text: 'اللغة الاستقبالية (Auditory Comprehension)', domain: 'receptive' },
      { id: 'pls5_exp', text: 'اللغة التعبيرية (Expressive Communication)', domain: 'expressive' }
    ],
    thresholdText: 'تقييم كفاءة النمو اللغوي الشامل واشتقاق الأهداف الفردية',
    isDefault: true,
  },
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
    id: 'peabody_ppvt',
    name: 'مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5)',
    nameEn: 'Peabody Picture Vocabulary Test',
    category: 'speech_language',
    description: 'تقييم الحصيلة اللغوية الاستقبالية وفهم المفردات الشفهية المصورة',
    icon: '📖',
    color: '#0ea5e9',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 36,
    items: [
      { id: 'ppvt_1', text: 'تحديد الأسماء والأشياء المألوفة في البيئة', domain: 'nouns' },
      { id: 'ppvt_2', text: 'تحديد الأفعال والأنشطة اليومية المصورة', domain: 'verbs' },
      { id: 'ppvt_3', text: 'تحديد الصفات والألوان والأحجام (كبير/صغير)', domain: 'adjectives' },
      { id: 'ppvt_4', text: 'تحديد العلاقات المكانية والظروف (فوق/تحت/داخل)', domain: 'spatial' },
      { id: 'ppvt_5', text: 'فهم التصنيفات والفئات الدلالية (حيوانات/فواكه)', domain: 'categories' },
      { id: 'ppvt_6', text: 'فهم المفردات المعقدة والمجردة والمشاعر', domain: 'abstract' },
    ],
    thresholdText: 'تحديد العمر اللغوي الاستقبالي ونسبة المئينات للحصيلة اللفظية',
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
    description: 'المقياس المقنن للفرز والتشخيص المبكر لصعوبات التعلم النمائية في الروضة وفق نموذج كيرك وكالفنت (80 عبارة مقسمة على 6 أبعاد: الانتباه، الإدراك، الذاكرة، التفكير، لغوية، بصرية حركية).',
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
    description: 'مقياس تشخيصي مقنن يتكون من 24 بنداً موزعة على 5 أبعاد (الاستيعاب السمعي، اللغة المنطوقة، التوجه المكاني/الزماني، التناسق الحركي، السلوك الشخصي). يغطي الجوانب اللفظية وغير اللفظية لتحديد صعوبات التعلم بدقة.',
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
  {
    id: 'wisc_5',
    name: 'مقياس وكسلر لذكاء الأطفال — الطبعة الخامسة (WISC-V)',
    nameEn: 'Wechsler Intelligence Scale for Children — 5th Edition (WISC-V)',
    author: 'د. ديفيد وكسلر (David Wechsler, Ph.D.)',
    publisher: 'بيرسون للتقييم الإكلينيكي (Pearson Clinical Assessment)',
    category: 'intelligence_cognitive',
    description: 'المقياس الأوسع انتشاراً عالمياً لقياس القدرات المعرفية والأكاديمية للأطفال (من 6 إلى 16 سنة). يمنح معامل ذكاء كلي (FSIQ) ومؤشرات فرعية: الفهم اللفظي، البصري الفضائي، الاستدلال التحليلي، الذاكرة العاملة، وسرعة المعالجة، مع ربط مباشر بالخطط التربوية الفردية (IEP).',
    icon: '🧠',
    color: '#7c3aed',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 96,
    items: WISC5_ITEMS.map(it => ({
      id: it.id,
      text: `${it.subtest}: ${it.title}`,
      domain: it.domainId,
    })),
    thresholdText: 'معامل الذكاء الكلي (FSIQ): 130+ موهبة وتفوق استثنائي | 120-129 متفوق | 110-119 متوسط مرتفع | 90-109 متوسط طبيعي | 80-89 متوسط منخفض | 70-79 حدّي / بطء تعلم | أقل من 70 قصور فكري',
    isDefault: true,
  },
  {
    id: 'stanford_binet_5',
    name: 'مقياس ستانفورد - بينيه للذكاء — الصورة الخامسة (SB5)',
    nameEn: 'Stanford-Binet Intelligence Scales — Fifth Edition (SB5)',
    author: 'د. جيل هـ. رويد (Gale H. Roid) ونخبة من باحثي القياس',
    publisher: 'ريفرسايد إنسايتس (Riverside Insights)',
    category: 'intelligence_cognitive',
    description: 'البطارية القياسية الرائدة عالمياً لقياس نسبة الذكاء الكلي (FSIQ) ونسبة الذكاء غير اللفظي واللفظي عبر العوامل الخمسة (الاستدلال السيالي، المعرفة، الكمي، البصري المكاني، الذاكرة العاملة) مع اشتقاق خطط IEP.',
    icon: '🧠',
    color: '#4f46e5',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 120,
    items: SB5_ITEMS.map(it => ({
      id: it.id,
      text: `${it.subtest}: ${it.title}`,
      domain: it.factorId,
    })),
    thresholdText: 'معامل الذكاء الكلي (FSIQ): 130+ موهبة وتفوق استثنائي | 120-129 متفوق | 110-119 متوسط مرتفع | 90-109 متوسط طبيعي | 80-89 متوسط منخفض | 70-79 حدّي / بطء تعلم | أقل من 70 قصور فكري',
    isDefault: true,
  },
  {
    id: 'leiter_3',
    name: 'مقياس ليتر العالمي المعدل للتقييم غير اللفظي — الإصدار الثالث (Leiter-3)',
    nameEn: 'Leiter International Performance Scale — Third Edition (Leiter-3)',
    author: 'د. غيل أيدرسون وزملاؤه (Gale H. Roid, Mark Pomplun, et al.)',
    publisher: 'ستولتينغ الأمريكية (Stoelting Company)',
    category: 'intelligence_cognitive',
    description: 'الأداة المعيارية الرائدة عالمياً للتقييم غير اللفظي التام للذكاء (NVIQ) والذاكرة والانتباه للأطفال والأفراد ذوي التوحد والتأخر اللغوي وضعف السمع.',
    icon: '🧩',
    color: '#0891b2',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 84,
    items: LEITER3_ITEMS.map(it => ({
      id: it.id,
      text: `${it.subtest}: ${it.title}`,
      domain: it.subtestId,
    })),
    thresholdText: 'معامل الذكاء غير اللفظي (NVIQ): 130+ موهبة وتفوق | 120-129 متفوق | 110-119 متوسط مرتفع | 90-109 متوسط طبيعي | 80-89 متوسط منخفض | 70-79 حدّي / بطء تعلم | أقل من 70 قصور فكري',
    isDefault: true,
  },
  {
    id: 'raven_rpm',
    name: 'مقياس مصفوفات رافن المتتابعة للذكاء غير اللفظي (RPM - CPM/SPM)',
    nameEn: "Raven's Progressive Matrices (RPM)",
    author: 'د. جون رافن (John C. Raven)',
    publisher: 'بيرسون للتقييم النفسي والتربوي (Pearson Assessment)',
    category: 'intelligence_cognitive',
    description: 'الأداة المعيارية العالمية الرائدة لقياس الاستدلال المعرفي والقدرة العقلية العامة (g factor) والتفكير التجريدي غير اللفظي دون تحيز لغوي.',
    icon: '▦',
    color: '#2563eb',
    scoreMode: 'sum',
    responseType: 'choice',
    minValue: 0,
    maxValue: 1,
    maxScore: 36,
    items: RAVEN_CPM_ITEMS.map(it => ({
      id: it.id,
      text: `${it.title}: ${it.prompt}`,
      domain: it.set,
    })),
    thresholdText: 'المستوى الأول: ذكاء متميز (مئين 95%+) | المستوى الثاني: فوق المتوسط (مئين 75-94%) | المستوى الثالث: متوسط طبيعي (مئين 25-74%) | المستوى الرابع: أقل من المتوسط (مئين 5-24%) | المستوى الخامس: قصور معرفي (مئين < 5%)',
    isDefault: true,
  },

  // 5. Adaptive Behavior & Self-Help Scales (السلوك التكيفي ومهارات الحياة اليومية)
  {
    id: 'vineland_3',
    name: 'مقياس فينلاند للسلوك التكيفي (Vineland-3)',
    nameEn: 'Vineland Adaptive Behavior Scales (3rd Ed.)',
    category: 'adaptive_behavior',
    description: 'تقييم مهارات التواصل، الحياة اليومية، التنشئة الاجتماعية، والمهارات الحركية التكيفية',
    icon: '🏠',
    color: '#059669',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 2,
    maxScore: 40,
    items: [
      { id: 'vin_1', text: 'استقلالية تناول الطعام والشراب باستخدام الأدوات', domain: 'daily_living' },
      { id: 'vin_2', text: 'استقلالية النظافة الشخصية واستخدام دورة المياه', domain: 'daily_living' },
      { id: 'vin_3', text: 'ارتداء الملابس وخلعها وربط الأحذية والأزرار', domain: 'daily_living' },
      { id: 'vin_4', text: 'التعبير عن الاحتياجات الأساسية باللغة أو الإشارة', domain: 'communication' },
      { id: 'vin_5', text: 'فهم وتطبيق التعليمات المنزلية والصفية', domain: 'communication' },
      { id: 'vin_6', text: 'المشاركة في الأنشطة الاجتماعية واللعب التعاوني', domain: 'socialization' },
      { id: 'vin_7', text: 'التحكم بالانفعالات وتجنب إيذاء الذات أو الآخرين', domain: 'socialization' },
      { id: 'vin_8', text: 'اتباع قواعد السلامة وتجنب المخاطر والأشياء الحارة', domain: 'community' },
      { id: 'vin_9', text: 'التنقل المستقل داخل المنزل والمركز والشارع', domain: 'community' },
      { id: 'vin_10', text: 'التعامل مع النقود والأجهزة البسيطة واستخدام الوقت', domain: 'daily_living' },
    ],
    thresholdText: 'درجة معيارية تكيفية أقل من 70 تدل على احتياج دعم تكيفي وتأهيلي مكثف',
    isDefault: true,
  },
  {
    id: 'abas_3_adaptation',
    name: 'مقياس السلوك التكيفي للطفولة (ABAS-3 Adaptation)',
    nameEn: 'Adaptive Behavior Assessment System — Open Access Field Version',
    category: 'adaptive_behavior',
    description: 'تقييم شامل ومقنن للسلوك التكيفي عبر المجالات الثلاثة الرئيسية: المفاهيمية اللغوية، الاجتماعية، والعملية الاستقلالية (25 بنداً ملاحظياً)',
    icon: '🏠',
    color: '#059669',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 75,
    items: ABAS_ITEMS,
    thresholdText: 'الدرجة الخام المرتفعة تشير لدرجة تكيف واستقلالية عالية | الدرجة < 40 تدل على قصور حاد في السلوك التكيفي',
    isDefault: true,
  },
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
  {
    id: 'portage_early',
    name: 'مقياس دليل بورتيدج للتدخل المبكر (Portage)',
    nameEn: 'Portage Guide to Early Intervention',
    category: 'developmental_early',
    description: 'تقييم شامل للنمو من الولادة حتى 6 سنوات في 5 مجالات نمائية رئيسية بالإضافة للرعاية الوالدية',
    icon: '🌱',
    color: '#16a34a',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 2,
    maxScore: 30,
    items: [
      { id: 'port_1', text: 'المجال المعرفي والإدراكي (حل المشكلات والتصنيف)', domain: 'cognitive' },
      { id: 'port_2', text: 'المجال الحركي الكلي (الجلوس، الوقوف، المشي، الجري)', domain: 'gross_motor' },
      { id: 'port_3', text: 'المجال الحركي الدقيق (مسك الأشياء، التآزر البصري)', domain: 'fine_motor' },
      { id: 'port_4', text: 'مجال اللغة والتخاطب (المناغاة، الكلمات، الجمل)', domain: 'language' },
      { id: 'port_5', text: 'مجال الرعاية الذاتية واستقلالية المأكل والملبس', domain: 'self_help' },
      { id: 'port_6', text: 'المجال الاجتماعي والانفعالي والتفاعل مع الأسرة', domain: 'social' },
    ],
    thresholdText: 'حساب العمر النمائي ومقارنته بالعمر الزمني لتحديد نسبة التأخر النمائي',
    isDefault: true,
  },
  {
    id: 'asq3_developmental',
    name: 'استبيان الأعمار والمراحل النمائية للطفولة المبكرة (ASQ-3)',
    nameEn: 'Ages & Stages Questionnaires — Open Developmental Screening (ASQ-3)',
    category: 'developmental_early',
    description: 'أداة المسح والفرز النمائي الشاملة للأطفال في الطفولة المبكرة عبر 5 أبعاد: التواصل، الحركة الكبرى، الحركة الدقيقة، حل المشكلات، والشخصي الاجتماعي (25 بنداً)',
    icon: '🌱',
    color: '#16a34a',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 2,
    maxScore: 50,
    items: ASQ3_ITEMS,
    thresholdText: 'الدرجة < 25 (أقل من 50%): تأخر نمائي يستدعي التقويم المباشر | 25-34: منطقة المتابعة الحذرة | >= 35: نمو طبيعي',
    isDefault: true,
  },
  {
    id: 'denver2_screening',
    name: 'مقياس دنفر المطور للفرز النمائي (Denver II)',
    nameEn: 'Denver II Developmental Screening Scale — Open Field Version',
    category: 'developmental_early',
    description: 'مقياس مسح وتقييم المعالم النمائية الرئيسية من الرضاعة حتى ما قبل المدرسة عبر الأبعاد الأربعة المعيارية (25 بنداً ملاحظياً)',
    icon: '🌱',
    color: '#16a34a',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 2,
    maxScore: 50,
    items: DENVER2_ITEMS,
    thresholdText: 'الدرجة < 25: تأخر نمائي يستدعي التدخل | 25-34: منطقة متابعة حذرة | >= 35: تطور طبيعي مناسب لعمره',
    isDefault: true,
  },

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
    id: 'sdq_strengths_difficulties',
    name: 'استبيان القوة والصعوبات السلوكية للأطفال (SDQ)',
    nameEn: 'Strengths and Difficulties Questionnaire (SDQ — Open Access)',
    category: 'behavioral_emotional',
    description: 'الأداة العالمية المفتوحة لتقييم الصعوبات الانفعالية والسلوكية والعلاقات مع الأقران والسلوك الاجتماعي الإيجابي (25 فقرة مقننة)',
    icon: '❤️',
    color: '#dc2626',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 2,
    maxScore: 40,
    items: SDQ_ITEMS,
    thresholdText: 'مجموع الصعوبات >= 17: صعوبات سلوكية وانفعالية بارزة دالة إكلينيكياً | 14-16: منطقة حدية | < 14: ضمن الحدود الطبيعية',
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
  {
    id: 'conners_parent',
    name: 'مقياس كونرز لفرط الحركة وتشتت الانتباه — نسخة الوالدين المطولة (CPRS-R L)',
    nameEn: 'Conners Parent Rating Scale - Revised Long (CPRS-R L)',
    category: 'adhd',
    description: 'المعيار السيكومتري الشامل لتقييم أعراض فرط الحركة، تشتت الانتباه، المشكلات المعرفية والسلوكية وفق DSM-IV — 80 فقرة مقننة مع الدرجات المعيارية T ومؤشر ADHD',
    icon: '⚡',
    color: '#ea580c',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 240,
    items: CONNERS_PARENT_ITEMS.map((item, idx) => ({
      id: `q${idx + 1}`,
      text: `${idx + 1}. ${item.text || item}`,
      number: idx + 1,
      domain: 'adhd_parent',
    })),
    thresholdText: 'درجة معيارية تائية (T-Score) أعلى من 65 تشير إلى دلالة إكلينيكية مرتفعة تستدعي خطة تدخل',
    isDefault: true,
  },
  {
    id: 'vanderbilt_adhd_scale',
    name: 'مقياس فاندربرلت لتشخيص فرط الحركة وتشتت الانتباه (Vanderbilt ADHD)',
    nameEn: 'Vanderbilt ADHD Diagnostic Parent Rating Scale (Open Access)',
    category: 'adhd',
    description: 'الأداة المعتمدة المفتوحة المصدر لتقييم أعراض قصور الانتباه، فرط الحركة والاندفاعية، والسلوك المعارض وفق معايير DSM (27 بنداً تشخيصياً)',
    icon: '⚡',
    color: '#ea580c',
    scoreMode: 'subscale',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 81,
    items: VANDERBILT_ITEMS,
    thresholdText: 'انتباه >= 15 فرط حركة >= 15: نمط مركب | انتباه >= 15: نمط تشتت الانتباه | فرط حركة >= 15: نمط اندفاعي حركي',
    isDefault: true,
  },
  {
    id: 'conners_3',
    alias: 'adhd_screening_9',
    name: 'قائمة الفرز السريع لفرط الحركة وتشتت الانتباه (Screening Checklist)',
    nameEn: 'ADHD Quick Screening Checklist (9 Items)',
    category: 'adhd',
    description: 'استمارة مسح وفرز سريعة لأعراض نقص الانتباه وفرط الحركة والاندفاعية (9 بنود استرشادية مبدئية)',
    icon: '📋',
    color: '#f97316',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 0,
    maxValue: 3,
    maxScore: 36,
    items: [
      { id: 'adhd_1', text: 'صعوبة الحفاظ على الانتباه في المهام أو أنشطة اللعب', domain: 'inattention' },
      { id: 'adhd_2', text: 'تشتت الانتباه بسهولة بالمثيرات الخارجية العارضة', domain: 'inattention' },
      { id: 'adhd_3', text: 'صعوبة تنظيم المهام والأنشطة ونسيان الأدوات', domain: 'inattention' },
      { id: 'adhd_4', text: 'كثرة التململ والاهتزاز في المقعد وتحريك اليدين والقدمين', domain: 'hyperactivity' },
      { id: 'adhd_5', text: 'مغادرة المقعد في مواقف يتوقع فيها الجلوس والاستقرار', domain: 'hyperactivity' },
      { id: 'adhd_6', text: 'الجري والتسلق المفرط في مواقف غير مناسبة', domain: 'hyperactivity' },
      { id: 'adhd_7', text: 'التحدث المفرط والمستمر بدون توقف', domain: 'hyperactivity' },
      { id: 'adhd_8', text: 'الإجابة المندفعة والتسرع قبل اكتمال طرح الأسئلة', domain: 'impulsivity' },
      { id: 'adhd_9', text: 'صعوبة بالغة في انتظار الدور ومقاطعة حديث الآخرين', domain: 'impulsivity' },
    ],
    thresholdText: 'درجة خام مرتفعة (> 65 تائية) تؤكد اشتباه اضطراب ADHD بنمطيه الحركي والذهني',
    isDefault: true,
  },

  // 9. Executive Functioning Scales (الوظائف التنفيذية والعمليات المعرفية)
  {
    id: 'brief_2',
    name: 'مقياس تقييم السلوك التنفيذي (BRIEF-2)',
    nameEn: 'Behavior Rating Inventory of Executive Function',
    category: 'executive_functioning',
    description: 'تقييم كبح الاستجابة، المرونة المعرفية، الذاكرة العاملة، المراقبة الذاتية، والتخطيط',
    icon: '⚙️',
    color: '#4f46e5',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 3,
    maxScore: 24,
    items: [
      { id: 'ef_1', text: 'كبح الاندفاع والتوقف قبل التصرف غير المناسب', domain: 'inhibit' },
      { id: 'ef_2', text: 'المرونة في الانتقال بين المهام والتكيف مع التغيير', domain: 'shift' },
      { id: 'ef_3', text: 'الضبط الانفعالي والتحكم في ردود الأفعال العاطفية', domain: 'emotional_control' },
      { id: 'ef_4', text: 'بدء المهام والواجبات بشكل مستقل دون حث متكرر', domain: 'initiate' },
      { id: 'ef_5', text: 'الاحتفاظ بالمعلومات في الذاكرة العاملة أثناء التنفيذ', domain: 'working_memory' },
      { id: 'ef_6', text: 'التخطيط المسبق وترتيب خطوات العمل', domain: 'plan_organize' },
      { id: 'ef_7', text: 'المراقبة الذاتية وملاحظة الأخطاء وتصحيحها', domain: 'self_monitor' },
    ],
    thresholdText: 'مؤشر التنظيم السلوكي والمعرفي يعكس كفاءة الفص الجبهي للتعلم المستقل',
    isDefault: true,
  },
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
    description: 'المقياس المقنن الأكاديمي لتقييم كفاءة التكامل الحسي للأطفال (90 مهمة أدائية مقسمة على 9 محاور: التآزر البصري الحركي، الشكل والأرضية، الموضع في الفراغ، نسخ الأشكال، المثير اللمسي، تمييز الأصابع، الكتابة على الكف، التوازن الدهليزي، محاكاة وضع الجسم) مع حساب محك القطع (45 درجة) والتفسير الإكلينيكي.',
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
  {
    id: 'sensory_profile_2',
    name: 'الملف الحسي الثاني (Sensory Profile-2)',
    nameEn: 'Sensory Profile 2 (Winnie Dunn)',
    category: 'sensory_motor',
    description: 'تقييم أنماط المعالجة الحسية (البصرية، السمعية، اللمسية، الدهليزية، والحس العميق)',
    icon: '🎯',
    color: '#0891b2',
    scoreMode: 'sum',
    responseType: 'scale',
    minValue: 1,
    maxValue: 5,
    maxScore: 40,
    items: [
      { id: 'sp_prof_1', text: 'الحساسية اللمسية والانزعاج من ملامس الملابس أو الأيدي', domain: 'tactile' },
      { id: 'sp_prof_2', text: 'الحساسية البصرية والانبهار بالأضواء أو تغطية العينين', domain: 'visual' },
      { id: 'sp_prof_3', text: 'الحساسية السمعية وتغطية الأذنين من الأصوات اليومية', domain: 'auditory' },
      { id: 'sp_prof_4', text: 'المعالجة الدهليزية وتجنب المراجيح والحركات المرتفعة', domain: 'vestibular' },
      { id: 'sp_prof_5', text: 'البحث الحسي والتأرجح المستمر والقفز والاصطدام', domain: 'proprioception' },
      { id: 'sp_prof_6', text: 'التآزر الحركي البصري والمهارات الحركية الدقيقة (المقص، القلم)', domain: 'fine_motor' },
      { id: 'sp_prof_7', text: 'التوازن الحركي العام والمشي وتفادي العوائق', domain: 'gross_motor' },
      { id: 'sp_prof_8', text: 'تخطيط الحركة (Dyspraxia) وتقليد السلاسل الحركية', domain: 'praxis' },
    ],
    thresholdText: 'تحديد ما إذا كانت الاستجابة الحسية تمثل تفاعلاً زائداً، منخفضاً، أو بحثاً حسياً',
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
    description: '26 فقرة مقننة لقياس التفكك والتصدع الأسري والنزاعات والعنف والانفصال والإنفاق المنزلي',
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
  {
    id: "sensory_checklist",
    name: "القائمة الحسية (Sue Larkey)",
    nameEn: "The Sensory Checklist",
    category: "sensory_motor",
    description: "قائمة لتقييم اضطرابات المعالجة الحسية (117 فقرة)",
    icon: "🧠",
    color: "#1e40af",
    scoreMode: "sum",
    responseType: "scale",
    minValue: 1,
    maxValue: 3,
    maxScore: 351,
    items: SENSORY_CHECKLIST_ITEMS.map(it => ({
      id: it.id,
      text: it.text,
      domain: it.domainId,
    })),
    thresholdText: "المتوسط الفرضي لتقييم الاضطراب الحسي.",
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

  if (scale?.id === "sensory_checklist") {
    const scResult = calculateSensoryChecklistScore(answers);
    return {
      total: scResult.totalRawScore,
      score: scResult.totalRawScore,
      maxScore: scResult.maxPossible,
      percentage: `%`,
      percentageNum: scResult.percentage,
      level: scResult.level,
      color: scResult.severityColor,
      severityColor: scResult.severityColor,
      note: scResult.interpretation,
      subscales: scResult.subscales,
      isSensoryChecklist: true,
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

  if (scale?.id === 'abas_3_adaptation') {
    const res = calculateABASScore(answers);
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

  if (scale?.id === 'asq3_developmental') {
    const res = calculateASQ3Score(answers);
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

  if (scale?.id === 'denver2_screening') {
    const res = calculateDenver2Score(answers);
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

  if (scale?.id === 'sdq_strengths_difficulties') {
    const res = calculateSDQScore(answers);
    return {
      total: res.totalDifficultiesScore,
      score: res.totalDifficultiesScore,
      maxScore: res.maxDifficulties,
      percentage: `${Math.round((res.totalDifficultiesScore / res.maxDifficulties) * 100)}%`,
      percentageNum: Math.round((res.totalDifficultiesScore / res.maxDifficulties) * 100),
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      prosocialScore: res.prosocialScore,
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

  if (scale?.id === 'vanderbilt_adhd_scale') {
    const res = calculateVanderbiltScore(answers);
    return {
      total: res.totalRawScore,
      score: res.totalRawScore,
      maxScore: res.maxPossible,
      percentage: `${Math.round((res.totalRawScore / res.maxPossible) * 100)}%`,
      percentageNum: Math.round((res.totalRawScore / res.maxPossible) * 100),
      level: res.level,
      color: res.severityColor,
      severityColor: res.severityColor,
      inattentionScore: res.inattentionScore,
      hyperactivityScore: res.hyperactivityScore,
      oddConductScore: res.oddConductScore,
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

  if (scale?.id === 'conners_parent') {
    const cpResult = calculateConnersParentScore(answers);
    return {
      total: cpResult.totalRawScore,
      score: cpResult.totalRawScore,
      maxScore: cpResult.maxPossible,
      percentage: `${Math.round((cpResult.totalRawScore / cpResult.maxPossible) * 100)}%`,
      percentageNum: Math.round((cpResult.totalRawScore / cpResult.maxPossible) * 100),
      level: cpResult.level,
      color: cpResult.severityColor,
      severityColor: cpResult.severityColor,
      note: 'مقياس كونرز لفرط الحركة وتشتت الانتباه (نسخة الوالدين المطولة 80 فقرة)',
      subscales: cpResult.subscales,
      isConnersParent: true,
    };
  }

  if (scale?.id === 'srs') {
    const srsResult = calculateSRS2Score(answers);
    if (srsResult.isComplete) {
      return {
        total: srsResult.totalRawScore,
        score: srsResult.totalRawScore,
        maxScore: 260,
        percentage: `${srsResult.totalTScore} T`,
        percentageNum: srsResult.totalTScore,
        level: srsResult.category,
        color: srsResult.severityColor === 'red' ? '#ef4444' : srsResult.severityColor === 'orange' ? '#f59e0b' : srsResult.severityColor === 'yellow' ? '#eab308' : '#10b981',
        severityColor: srsResult.severityColor,
        note: srsResult.interpretation,
        subscales: srsResult.subscales,
        isSRS2: true,
        tScore: srsResult.totalTScore,
        rawScore: srsResult.totalRawScore,
      };
    } else {
      const items = scale?.items || [];
      const total = items.reduce((sum, item) => {
        const rawVal = Number(answers[item.id] ?? 0);
        let score = rawVal;
        if (rawVal > 0) {
          const srsItem = SRS2_ITEMS.find(s => s.id === item.id);
          if (srsItem?.isReverse) {
            score = 5 - rawVal;
          }
        }
        return sum + score;
      }, 0);
      return {
        total,
        score: total,
        maxScore: 260,
        percentage: 'غير مكتمل',
        percentageNum: 0,
        level: 'الرجاء الإجابة على جميع البنود',
        color: '#64748b',
        severityColor: 'gray',
        note: `المقياس غير مكتمل (${srsResult.answeredCount} من 65 بنداً تم الإجابة عليها). يتطلب الإجابة على جميع البنود لحساب الدرجة المعيارية ت والتشخيص الإكلينيكي.`,
      };
    }
  }

  if (scale?.id === 'aq') {
    const psych = calculateAQPsychometrics(answers, scale?.version || 'child');
    return {
      total: psych.totalScore,
      score: psych.totalScore,
      maxScore: 50,
      percentage: `${Math.round((psych.totalScore / 50) * 100)}%`,
      percentageNum: Math.round((psych.totalScore / 50) * 100),
      level: psych.severityLabel,
      color: psych.severityColor,
      severityColor: psych.severityColor,
      cutoff: psych.cutoffScore,
      isAboveCutoff: psych.isAboveCutoff,
      domainScores: psych.domainScores,
      psychometrics: psych,
      note: psych.clinicalSummary,
    };
  }

  if (scale?.id === 'wisc_5' || scale?.id === 'wisc5') {
    const psych = calculateWISC5Psychometrics(answers);
    return {
      total: psych.fsiq,
      score: psych.fsiq,
      fsiq: psych.fsiq,
      maxScore: 160,
      sumScaledScores: psych.sumScaledScores,
      percentage: `${psych.completionPercentage}%`,
      percentageNum: psych.completionPercentage,
      level: psych.classification,
      color: psych.severityColor,
      severityColor: psych.severityColor,
      overallPercentile: psych.overallPercentile,
      domainScores: psych.domainResults,
      psychometrics: psych,
      note: psych.clinicalImpression,
    };
  }

  if (scale?.id === 'stanford_binet_5' || scale?.id === 'sb5') {
    const psych = calculateSB5Psychometrics(answers);
    return {
      total: psych.fsiq,
      score: psych.fsiq,
      fsiq: psych.fsiq,
      nviq: psych.nviq,
      viq: psych.viq,
      maxScore: 160,
      sumScaledScores: psych.sumScaledScores,
      percentage: `${psych.completionPercentage}%`,
      percentageNum: psych.completionPercentage,
      level: psych.classification,
      color: psych.severityColor,
      severityColor: psych.severityColor,
      overallPercentile: psych.fsiqPercentile,
      factorScores: psych.factorResults,
      subtestScores: psych.subtestResults,
      psychometrics: psych,
      note: psych.clinicalImpression,
    };
  }

  if (scale?.id === 'leiter_3' || scale?.id === 'leiter3' || scale?.id === 'leiter') {
    const psych = calculateLeiter3Psychometrics(answers);
    return {
      total: psych.nviq,
      score: psych.nviq,
      nviq: psych.nviq,
      ami: psych.ami,
      maxScore: 160,
      percentage: `${psych.completionPercentage}%`,
      percentageNum: psych.completionPercentage,
      level: psych.classification,
      color: psych.severityColor,
      severityColor: psych.severityColor,
      overallPercentile: psych.nviqPercentile,
      subtestScores: psych.subtestResults,
      psychometrics: psych,
      note: psych.clinicalImpression,
    };
  }

  if (scale?.id === 'raven_rpm' || scale?.id === 'raven' || scale?.id === 'rpm' || scale?.id === 'cpm' || scale?.id === 'spm') {
    const psych = calculateRavenPsychometrics(answers, {}, 'cpm', 8.0);
    return {
      total: psych.totalRaw,
      score: psych.totalRaw,
      rawScore: psych.totalRaw,
      percentile: psych.percentile,
      overallPercentile: psych.percentile,
      equivalentIQ: psych.equivalentIQ,
      maxScore: psych.maxRawScore,
      percentage: `${psych.percentage}%`,
      percentageNum: psych.percentage,
      level: psych.classification,
      grade: psych.grade,
      color: psych.severityColor,
      severityColor: psych.severityColor,
      setScores: psych.setResults,
      psychometrics: psych,
      note: psych.clinicalImpression,
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

  if (scale?.id === 'cars') {
    if (total < 30) {
      level = 'غير توحدي';
      color = '#10b981';
    } else if (total <= 36.5) {
      level = 'بسيط إلى متوسط التوحد';
      color = '#f59e0b';
    } else {
      level = 'شديد / حاد التوحد';
      color = '#ef4444';
    }
  } else if (percentageNum >= 70) {
    level = 'مرتفع';
    color = '#ef4444';
  } else if (percentageNum >= 40) {
    level = 'متوسط';
    color = '#f59e0b';
  } else {
    level = 'منخفض';
    color = '#10b981';
  }

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
