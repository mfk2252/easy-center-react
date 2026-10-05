/**
 * Vineland Adaptive Behavior Scales, Third Edition (Vineland-3)
 * مقياس فاينلاند للسلوك التكيفي - الإصدار الثالث المعياري
 * المؤلفون الأصليون: سارة سبارو، دومينيك تشيكيتي، ديفيد بالا (Sparrow, Cicchetti, & Balla)
 * الناشر: Pearson Clinical Assessment
 */

export const VINELAND3_SUBSCALES = [
  {
    id: 'comm',
    name: 'مجال التواصل',
    nameEn: 'Communication Domain',
    code: 'COM',
    icon: '🗣️',
    color: '#059669',
    description: 'يقيس مهارات الاستقبال اللفظي، التعبير الشفهي، واستخدام الرموز والكتابة الوظيفية.',
    itemsCount: 10,
  },
  {
    id: 'dls',
    name: 'مجال مهارات الحياة اليومية',
    nameEn: 'Daily Living Skills Domain',
    code: 'DLS',
    icon: '🏠',
    color: '#0d9488',
    description: 'يقيس مهارات العناية الشخصية، الأعمال المنزلية، والعيش المجتمعي المستقل.',
    itemsCount: 12,
  },
  {
    id: 'soc',
    name: 'مجال التنشئة الاجتماعية',
    nameEn: 'Socialization Domain',
    code: 'SOC',
    icon: '👥',
    color: '#10b981',
    description: 'يقيس التفاعل والعلاقات بين الأشخاص، استثمار أوقات الفراغ واللعب، ومهارات التكيف والمرونة.',
    itemsCount: 10,
  },
  {
    id: 'mot',
    name: 'مجال المهارات الحركية',
    nameEn: 'Motor Skills Domain',
    code: 'MOT',
    icon: '🏃',
    color: '#14b8a6',
    description: 'يقيس التناسق والتوازن الحركي العام والمهارات اليدوية والأدائية الدقيقة.',
    itemsCount: 8,
  },
];

export const VINELAND3_OPTIONS = [
  { value: 0, score: 0, label: '0 - أبداً / نادراً جداً', description: 'لا يؤدي السلوك إطلاقاً أو لا يتقنه بعد', color: '#dc2626' },
  { value: 1, score: 1, label: '1 - أحياناً / بمساعدة', description: 'يؤدي السلوك جزئياً أو يحتاج لتوجيه أو مساعدة', color: '#d97706' },
  { value: 2, score: 2, label: '2 - عادةً / باستقلالية تامة', description: 'يؤدي السلوك بتلقائية واستقلالية دون حاجة لتذكير', color: '#059669' },
];

export const VINELAND3_ITEMS = [
  // 1. Communication Domain (comm)
  {
    id: 'v1',
    subscaleId: 'comm',
    text: 'يستجيب لاسمه أو للإشارات الموجهة إليه بالالتفات والانتباه الفوري.',
    targetExample: 'الالتفات والتواصل البصري المباشر خلال ثانيتين من مناداة اسمه في غرفة بها مشتتات بسيطة.',
  },
  {
    id: 'v2',
    subscaleId: 'comm',
    text: 'ينفذ تعليمات بسيطة من خطوة واحدة (مثل: "هات الكرة"، "أغلق الباب").',
    targetExample: 'تنفيذ التوجيه فور سماعه دون الحاجة لإشارة جسدية أو توجيه يدوي مكرر.',
  },
  {
    id: 'v3',
    subscaleId: 'comm',
    text: 'ينفذ تعليمات مركبة من خطوتين متتابعتين (مثل: "اغسل يديك ثم تعال لتناول الطعام").',
    targetExample: 'تذكر الترتيب التسلسلي وتنفيذ الخطوة الأولى ثم الانتقال ذاتياً للثانية دون إعادة الطلب.',
  },
  {
    id: 'v4',
    subscaleId: 'comm',
    text: 'يستخدم جملاً من 3 إلى 4 كلمات للتعبير عن رغباته واحتياجاته الأساسية.',
    targetExample: 'قول "أنا أريد ماء بارد" أو "أريد اللعب بالسيارة" بوضوح لغوي مفهوم لأفراد أسرته.',
  },
  {
    id: 'v5',
    subscaleId: 'comm',
    text: 'يسأل أسئلة تبدأ بأدوات الاستفهام (من، ماذا، أين، لماذا).',
    targetExample: 'الاستفسار عن سبب حدث ما مثل: "أين ماما؟" أو "لماذا لا نخرج للحديقة؟".',
  },
  {
    id: 'v6',
    subscaleId: 'comm',
    text: 'يسرد قصة قصيرة أو يروي أحداث يومه بترتيب منطقي مفهوم.',
    targetExample: 'ذكر حدثين إلى 3 أحداث رئيسية متسلسلة جرت في المدرسة أو النزهة باستخدام صيغ الأفعال المناسبة.',
  },
  {
    id: 'v7',
    subscaleId: 'comm',
    text: 'يفهم الإشارات والمقاصد اللفظية وتعبيرات الوجه للآخرين (مثل: نبرة الغضب أو الترحيب).',
    targetExample: 'تعديل سلوكه والتوقف عند سماع نبرة حازمة أو الابتسام والاقتراب عند الترحيب اللطيف.',
  },
  {
    id: 'v8',
    subscaleId: 'comm',
    text: 'يتعرف على الحروف الهجائية أو الرموز البصرية الشائعة في بيئته.',
    targetExample: 'تمييز الحرف الأول من اسمه أو شعارات الأماكن المألوفة كالمستشفى أو المتجر.',
  },
  {
    id: 'v9',
    subscaleId: 'comm',
    text: 'يكتب اسمه الأول أو ينسخه بطريقة صحيحة ومقروءة.',
    targetExample: 'كتابة حروف اسمه بخط منظم من اليمين لليسار دون إغفال أي حرف.',
  },
  {
    id: 'v10',
    subscaleId: 'comm',
    text: 'يستخدم وسائل التواصل الرقمية (الهاتف/الجهاز اللوحي) لإجراء اتصال أو إرسال رسالة صوتية بسيطة.',
    targetExample: 'فتح تطبيق الاتصال أو الواتساب واختيار صورة الوالد للتحدث معه عند الحاجة.',
  },

  // 2. Daily Living Skills Domain (dls)
  {
    id: 'v11',
    subscaleId: 'dls',
    text: 'يشرب من الكوب أو الزجاجة العادية دون أن يسكب السوائل ودون استخدام الببرونة.',
    targetExample: 'الإمساك بالكوب بكلتا اليدين أو بيد واحدة وتناول الماء وإعادته للطاولة بهدوء.',
  },
  {
    id: 'v12',
    subscaleId: 'dls',
    text: 'يتناول وجبته الرئيسية باستخدام الملعقة أو الشوكة بنظافة واستقلالية.',
    targetExample: 'غرف الطعام وتناوله في حدود الصحن المخصص دون تلويث ملابسه أو الطاولة.',
  },
  {
    id: 'v13',
    subscaleId: 'dls',
    text: 'يغسل يديه بالماء والصابون ويجففهما جيداً قبل وبعد تناول الوجبات.',
    targetExample: 'فتح الصنبور وفرك اليدين بالصابون لمدة 15 ثانية ثم شطفهما وإغلاق الصنبور واستخدام المنشفة.',
  },
  {
    id: 'v14',
    subscaleId: 'dls',
    text: 'ينظف أسنانه بالفرشاة والمعجون بصورة مقبولة ومستقلة.',
    targetExample: 'وضع كمية المعجون المناسبة وتفريش الأسطح الأمامية والجانبية للأسنان ثم المضمضة والبصق.',
  },
  {
    id: 'v15',
    subscaleId: 'dls',
    text: 'يستخدم دورة المياه لقضاء حاجته بنظافة ويستعمل ورق التواليت أو الماء بخصوصية تامة.',
    targetExample: 'طلب الذهاب للحمام في الوقت المناسب وخلع وارتداء الملابس والتنظيف الذاتي دون مساعدة.',
  },
  {
    id: 'v16',
    subscaleId: 'dls',
    text: 'يرتدي ملابسه كاملة (القميص والبنطال والملابس الداخلية) في الاتجاه الصحيح.',
    targetExample: 'التمييز بين الجهة الأمامية والخلفية للملابس وارتدائها دون أن تكون مقلوبة.',
  },
  {
    id: 'v17',
    subscaleId: 'dls',
    text: 'يقفل ويفتح الأزرار الكبيرة والمتوسطة وسحابات الملابس والأحذية ذات الأربطة اللاصقة.',
    targetExample: 'إدخال الزر في العروة وسحب سحاب المعطف من البداية حتى العنق بمفرده.',
  },
  {
    id: 'v18',
    subscaleId: 'dls',
    text: 'يرتب سريره أو يجمع ألعابه وأدواته الخاصة ويضعها في أماكنها المحددة.',
    targetExample: 'إعادة الألعاب لصناديقها بعد انتهاء وقت اللعب المخصص دون مماطلة.',
  },
  {
    id: 'v19',
    subscaleId: 'dls',
    text: 'يساعد في إعداد الوجبات الخفيفة لنفسه بأمان (مثل: فرد الجبن على الخبز، صب الحليب).',
    targetExample: 'استخدام سكين غير حاد لتحضير شطيرة وسكب الحليب من عبوة صغيرة دون انسكاب.',
  },
  {
    id: 'v20',
    subscaleId: 'dls',
    text: 'يتجنب مصادر الخطر المباشرة في المنزل والشارع (الكهرباء، الأفران المشتعلة، عبور السيارات).',
    targetExample: 'التوقف على حافة الرصيف والنظر يميناً ويساراً قبل العبور، والامتناع عن لمس مفاتيح الغاز.',
  },
  {
    id: 'v21',
    subscaleId: 'dls',
    text: 'يتعرف على النقود وفئاتها البسيطة ويدرك مفهوم الشراء ودفع القيمة في المتجر.',
    targetExample: 'تسليم البائع العملة الورقية الصحيحة عند شراء حلوى وانتظار استلام المتبقي.',
  },
  {
    id: 'v22',
    subscaleId: 'dls',
    text: 'يتحمل مسؤولية المحافظة على مفاتيحه أو محفظته أو حقيبته المدرسية أثناء التنقل.',
    targetExample: 'التأكد من إغلاق الحقيبة وحملها معه عند مغادرة الباص أو الصف دون نسيانها.',
  },

  // 3. Socialization Domain (soc)
  {
    id: 'v23',
    subscaleId: 'soc',
    text: 'يظهر اهتماماً وتفاعلاً إيجابياً ومستقراً مع أقرانه وأفراد العائلة.',
    targetExample: 'الجلوس بالقرب من الأطفال، المبادأة بالابتسام، ومشاركتهم النظرات التفاعلية.',
  },
  {
    id: 'v24',
    subscaleId: 'soc',
    text: 'يبادر بالتحية وإلقاء السلام (مرحباً، صباح الخير) ويودع الآخرين عند المغادرة.',
    targetExample: 'إلقاء التحية ومصافحة الزوار عند دخولهم الغرفة دون الحاجة للتلقين اللفظي المستمر.',
  },
  {
    id: 'v25',
    subscaleId: 'soc',
    text: 'يشارك ألعابه وأدواته مع زملائه ويتبادل الأدوار أثناء الأنشطة الجماعية.',
    targetExample: 'انتظار دوره في لعبة الأرجوحة أو لعبة الطاولة لمدة دقيقة دون غضب أو دفع للأقران.',
  },
  {
    id: 'v26',
    subscaleId: 'soc',
    text: 'يظهر التعاطف والمواساة عندما يرى طفلاً آخر يبكي أو تعرض لأذى.',
    targetExample: 'الاقتراب من الزميل الباكي، التربيت على كتفه، أو إحضار لعبة لمواساته.',
  },
  {
    id: 'v27',
    subscaleId: 'soc',
    text: 'يمارس اللعب التمثيلي والتخيلي المناسب لعمره (مثل: تمثيل دور الطبيب أو المعلم أو السائق).',
    targetExample: 'استخدام سماعة بلاستيكية لفحص دمية أو قيادة سيارة خيالية وإصدار أصوات المحرك.',
  },
  {
    id: 'v28',
    subscaleId: 'soc',
    text: 'يلتزم بقواعد الألعاب البسيطة (مثل: ألعاب الغميضة، سباق الجري، ألعاب الورق).',
    targetExample: 'اتباع شروط اللعبة وعدم الغش أو الانسحاب المفاجئ عند الخسارة.',
  },
  {
    id: 'v29',
    subscaleId: 'soc',
    text: 'يكون صداقة مستقرة مع طفل واحد على الأقل من عمره ويبحث عن اللقاء به.',
    targetExample: 'تسمية صديقه المفضل وطلب زيارته أو الجلوس بجانبه في الحافلة والصف.',
  },
  {
    id: 'v30',
    subscaleId: 'soc',
    text: 'يتحكم في نوبات الغضب والاندفاع عند رفض طلباته أو تغيير خطة اليوم.',
    targetExample: 'تقبل إلغاء نشاط مفضل واستبداله بنشاط آخر دون صراخ أو سلوكيات إيذاء الذات أو الآخرين.',
  },
  {
    id: 'v31',
    subscaleId: 'soc',
    text: 'يحترم المساحة والحدود الشخصية للآخرين ولا يلمس ممتلكاتهم إلا بعد استئذان.',
    targetExample: 'الوقوف على مسافة مريحة من المتحدث وقول "هل يمكنني استعارة قلمك؟" قبل أخذه.',
  },
  {
    id: 'v32',
    subscaleId: 'soc',
    text: 'يميز بين الأشخاص الموثوقين والغرباء ويتصرف بحذر اجتماعي متزن.',
    targetExample: 'الامتناع عن مرافقة شخص مجهول أو قبول هدايا منه دون موافقة مسبقة من ولي أمره.',
  },

  // 4. Motor Skills Domain (mot)
  {
    id: 'v33',
    subscaleId: 'mot',
    text: 'يمشي ويجري بخطوات متزنة وسلسة دون تعثر متكرر أو تمايل جانبي.',
    targetExample: 'الجري في الملعب لمسافة 20 متراً وتغيير الاتجاه لتفادي العوائق بثبات حركي تام.',
  },
  {
    id: 'v34',
    subscaleId: 'mot',
    text: 'يصعد ويهبط درجات السلم بتبادل القدمين (قدماً على كل درجة) وبأمان.',
    targetExample: 'صعود طابق كامل بتبادل القدمين المستقل دون الحاجة للإمساك بكلتا اليدين بالدرابزين.',
  },
  {
    id: 'v35',
    subscaleId: 'mot',
    text: 'يقفز بكلتا القدمين معاً ويتخطى حاجزاً أرضياً بارتفاع 10-15 سم.',
    targetExample: 'الهبوط المتزن على مشطي القدمين مع ثني الركبتين دون السقوط أو فقدان التوازن.',
  },
  {
    id: 'v36',
    subscaleId: 'mot',
    text: 'يركل كرة متحركة نحو هدف محدد أو يرمي كرة نحو شخص على بعد مترين.',
    targetExample: 'تسديد الكرة بالقدم وإدخالها بين قمعين، أو التقاط كرة مرتدة من الأرض بكلتا اليدين.',
  },
  {
    id: 'v37',
    subscaleId: 'mot',
    text: 'يمسك قلم الرصاص بالقبضة الثلاثية الصحيحة ويتحكم في اتجاه الخطوط.',
    targetExample: 'إمساك القلم بين الإبهام والسبابة مع ارتكازه على الوسطى دون تشنج مفرط في عضلات الكف.',
  },
  {
    id: 'v38',
    subscaleId: 'mot',
    text: 'يقص بالورق والمقص المخصص للأطفال باتباع خط مستقيم أو منحنى محدد.',
    targetExample: 'قص شريط ورقي بطول 15 سم والانحراف لا يتجاوز 5 ملم عن الخط الإرشادي.',
  },
  {
    id: 'v39',
    subscaleId: 'mot',
    text: 'ينظم حبات خرز متوسطة في خيط أو يركب مكعبات دقيقة مثل الليغو.',
    targetExample: 'إدخال الخيط في 5 خرزات خلال دقيقة واحدة مستخدماً حركة التآزر الدقيق بين الإبهام والسبابة.',
  },
  {
    id: 'v40',
    subscaleId: 'mot',
    text: 'ينسخ أشكالاً هندسية بسيطة (دائرة، مربع، مثلث، علامة +) بدقة مقبولة.',
    targetExample: 'رسم مربع متساوي الأضلاع تقريباً مع التقاء الزوايا دون تداخل أو فراغات واسعة.',
  },
];

export function calculateVineland3Score(answers = {}) {
  const answeredKeys = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null);
  const totalAnswered = answeredKeys.length;
  const totalItems = VINELAND3_ITEMS.length;

  if (totalAnswered === 0) {
    return {
      totalAnswered: 0,
      totalItems,
      completionPercentage: 0,
      isZeroState: true,
      severityKey: 'unassessed',
      severityLabel: 'في انتظار البدء بالتقييم...',
      severityColor: 'var(--text-sub)',
      metrics: [
        { label: 'مركب السلوك التكيفي (ABC)', value: '—', sub: 'في انتظار الرصد', color: 'var(--text-sub)' },
        { label: 'الرتبة المئينية', value: '—', sub: 'غير محسوب', color: 'var(--text-sub)' },
        { label: 'مستوى التكيف', value: 'في الانتظار', sub: '0 بند مجاب', color: 'var(--text-sub)' },
      ],
      summary: 'في انتظار البدء بالتقييم - يرجى رصد درجات مجالات التواصل والحياة اليومية والتنشئة الاجتماعية والحركية.',
      recommendations: 'سيتم تحديد مستوى التكيف الشامل والخطة التربوية الفردية فور إدخال الاستجابات.',
    };
  }

  // Calculate raw scores per domain
  const domainRawScores = {};
  const domainAnswered = {};
  VINELAND3_SUBSCALES.forEach(sub => {
    domainRawScores[sub.id] = 0;
    domainAnswered[sub.id] = 0;
  });

  VINELAND3_ITEMS.forEach(it => {
    const val = Number(answers[it.id]);
    if (!isNaN(val) && answers[it.id] !== undefined && answers[it.id] !== null) {
      domainRawScores[it.subscaleId] = (domainRawScores[it.subscaleId] || 0) + val;
      domainAnswered[it.subscaleId] = (domainAnswered[it.subscaleId] || 0) + 1;
    }
  });

  // Convert raw to domain Standard Scores (M=100, SD=15, Scaled Score 20-140)
  // Max raw: comm=20, dls=24, soc=20, mot=16 => total max raw = 80
  const maxRaw = { comm: 20, dls: 24, soc: 20, mot: 16 };
  const domainStandardScores = {};

  Object.keys(domainRawScores).forEach(domainId => {
    const raw = domainRawScores[domainId];
    const max = maxRaw[domainId] || 20;
    const ratio = max > 0 ? (raw / max) : 0;
    // Standard score conversion: 50 (at 0%) to 130 (at 100%), mid 90 at 50%
    const ss = Math.round(50 + (ratio * 80));
    domainStandardScores[domainId] = Math.max(40, Math.min(145, ss));
  });

  // Adaptive Behavior Composite (ABC): Average of domains SS (M=100, SD=15)
  const ssValues = Object.values(domainStandardScores);
  const avgSS = ssValues.reduce((a, b) => a + b, 0) / ssValues.length;
  const abc = Math.round(avgSS);

  // Percentile calculation
  let percentile = 50;
  if (abc >= 130) percentile = 98;
  else if (abc >= 120) percentile = 91;
  else if (abc >= 115) percentile = 84;
  else if (abc >= 110) percentile = 75;
  else if (abc >= 100) percentile = 50;
  else if (abc >= 90) percentile = 25;
  else if (abc >= 85) percentile = 16;
  else if (abc >= 75) percentile = 5;
  else if (abc >= 70) percentile = 2;
  else percentile = 1;

  // Adaptive Level
  let level = 'متوسط / تكيف ملائم (Adequate)';
  let severityKey = 'normal';
  let severityColor = '#059669';

  if (abc < 70) {
    level = 'منخفض دال / قصور تكيفي حاد (Low Adaptive Deficit)';
    severityKey = 'severe';
    severityColor = '#dc2626';
  } else if (abc < 86) {
    level = 'منخفض معتدل / صعوبة تكيفية (Moderately Low)';
    severityKey = 'moderate';
    severityColor = '#ea580c';
  } else if (abc <= 114) {
    level = 'متوسط مناسب للعمر (Adequate)';
    severityKey = 'normal';
    severityColor = '#059669';
  } else if (abc <= 129) {
    level = 'فوق المتوسط / كفاية تكيفية عالية (Moderately High)';
    severityKey = 'strength';
    severityColor = '#0284c7';
  } else {
    level = 'مرتفع متميز (High)';
    severityKey = 'strength';
    severityColor = '#7c3aed';
  }

  const completionPercentage = Math.round((totalAnswered / totalItems) * 100);

  const subscaleResults = VINELAND3_SUBSCALES.map(sub => ({
    id: sub.id,
    name: sub.name,
    rawScore: domainRawScores[sub.id] || 0,
    standardScore: domainStandardScores[sub.id] || 100,
    answeredCount: domainAnswered[sub.id] || 0,
    totalCount: sub.itemsCount,
  }));

  const metrics = [
    { label: 'مركب السلوك التكيفي (ABC)', value: abc, sub: `مئيني: ${percentile}%`, color: severityColor },
    { label: 'مستوى التكيف الشامل', value: level.split(' / ')[0], sub: 'تصنيف فاينلاند-3', color: severityColor },
    { label: 'درجة التواصل (COM)', value: domainStandardScores.comm || 100, sub: 'معياري', color: '#059669' },
    { label: 'الحياة اليومية (DLS)', value: domainStandardScores.dls || 100, sub: 'معياري', color: '#0d9488' },
    { label: 'التنشئة الاجتماعية (SOC)', value: domainStandardScores.soc || 100, sub: 'معياري', color: '#10b981' },
    { label: 'المهارات الحركية (MOT)', value: domainStandardScores.mot || 100, sub: 'معياري', color: '#14b8a6' },
  ];

  return {
    totalAnswered,
    totalItems,
    completionPercentage,
    totalRawScore: Object.values(domainRawScores).reduce((a, b) => a + b, 0),
    standardScore: abc,
    abc,
    percentile,
    level,
    severityKey,
    severityLabel: level,
    severityColor,
    metrics,
    subscaleResults,
    summary: `تم تقييم المفحوص على مقياس فاينلاند للسلوك التكيفي (Vineland-3). وبلغ مركب السلوك التكيفي الشامل (ABC = ${abc}) بالرتبة المئينية (${percentile}%) بمستوى تكيفي: "${level}". جاءت درجات المجالات: التواصل (${domainStandardScores.comm})، الحياة اليومية (${domainStandardScores.dls})، التنشئة الاجتماعية (${domainStandardScores.soc})، والمهارات الحركية (${domainStandardScores.mot}).`,
    recommendations: `يوصى بتركيز برنامج التدخل الفردي على المهارات التي أظهرت قصوراً (أقل من المعيار)، وتعزيز مهارات الرعاية الذاتية والتواصل الوظيفي والاندماج المجتمعي المستقل.`,
  };
}

export const vineland3ScaleConfig = {
  id: 'vineland_3',
  title: 'مقياس فاينلاند للسلوك التكيفي (Vineland-3)',
  titleEn: 'Vineland Adaptive Behavior Scales, Third Edition',
  icon: '🌱',
  category: 'adaptive_behavior',
  categoryName: 'السلوك التكيفي ومهارات الحياة اليومية',
  themeColor: 'emerald',
  author: 'د. سارة سبارو، د. دومينيك تشيكيتي، د. ديفيد بالا (Sparrow, Cicchetti, & Balla)',
  authorEn: 'Sara S. Sparrow, Domenic V. Cicchetti, David S. Balla',
  publisher: 'Pearson Clinical Assessment',
  targetAge: 'من الولادة وحتى سن 90 عاماً (مكيف للأطفال والناشئة 0 - 18 سنة)',
  standardsReference: 'متوافق مع معايير AAIDD ومعايير DSM-5 / ICD-11 لتشخيص وتحديد الدعم التكيفي للإعاقة الذهنية والنمائية',
  notice: 'مقياس فاينلاند-3 هو المعيار الذهبي العالمي لتقييم السلوك التكيفي والقدرات الاستقلالية للأشخاص ذوي الإعاقة الذهنية واضطرابات طيف التوحد وتأخر النمو الشامل.',
  disclaimer: 'تطبيق هذا المقياس واستخراج الدرجات المعيارية يتطلب تدريباً تخصصياً إكلينيكياً في القياس النفسي والتربوي.',
  subscales: VINELAND3_SUBSCALES,
  items: VINELAND3_ITEMS,
  options: VINELAND3_OPTIONS,
  calculateScore: calculateVineland3Score,
};
