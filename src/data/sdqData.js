/**
 * Strengths and Difficulties Questionnaire (SDQ)
 * استبيان القوة والصعوبات السلوكية للأطفال والمراهقين
 * إعداد: د. روبرت جودمان (Robert Goodman, Ph.D.) - معهد الطب النفسي، لندن
 * الأداة الدولية المعتمدة لفرز الاضطرابات السلوكية والانفعالية وفرط الحركة (4 - 17 سنة)
 */

export const SDQ_SUBSCALES = [
  {
    id: 'emotional',
    name: 'الأعراض الانفعالية والقلق',
    nameEn: 'Emotional Symptoms Subscale',
    code: 'EMO',
    icon: '💔',
    color: '#7c3aed',
    description: 'يقيس الشكاوى الجسدية غير العضوية، المخاوف، الحزن والكآبة، والقلق والتعلق الزائد.',
    itemsCount: 5,
  },
  {
    id: 'conduct',
    name: 'مشكلات السلوك والتصرف',
    nameEn: 'Conduct Problems Subscale',
    code: 'CON',
    icon: '⚡',
    color: '#dc2626',
    description: 'يقيس نوبات الغضب الشديدة، العناد، الشجار مع الأقران، وعدم الانصياع لقواعد البالغين.',
    itemsCount: 5,
  },
  {
    id: 'hyperactivity',
    name: 'فرط الحركة وتشتت الانتباه',
    nameEn: 'Hyperactivity-Inattention Subscale',
    code: 'HYP',
    icon: '🏃',
    color: '#ea580c',
    description: 'يقيس النشاط الحركي المفرط، التململ، قصر مدى الانتباه، والاندفاعية في التصرف.',
    itemsCount: 5,
  },
  {
    id: 'peer',
    name: 'مشكلات العلاقات مع الأقران',
    nameEn: 'Peer Problems Subscale',
    code: 'PEE',
    icon: '👥',
    color: '#d97706',
    description: 'يقيس الميل للعزلة والوحدة، غياب الصداقات الوثيقة، وصعوبات الانسجام والتعرض للتنمر.',
    itemsCount: 5,
  },
  {
    id: 'prosocial',
    name: 'السلوك الاجتماعي الإيجابي (نقاط القوة)',
    nameEn: 'Prosocial Behavior Subscale',
    code: 'PRO',
    icon: '🌟',
    color: '#059669',
    description: 'يقيس التعاطف، مراعاة مشاعر الآخرين، المشاركة، وتقديم المساعدة التلقائية للأقران.',
    itemsCount: 5,
    isStrength: true,
  },
];

export const SDQ_OPTIONS = [
  { value: 0, score: 0, label: '0 - غير صحيح أبداً', description: 'لا ينطبق السلوك على الطفل إطلاقاً', color: '#059669' },
  { value: 1, score: 1, label: '1 - صحيح إلى حد ما', description: 'ينطبق السلوك بصورة جزئية أو متقطعة', color: '#d97706' },
  { value: 2, score: 2, label: '2 - صحيح تماماً / دائماً', description: 'ينطبق السلوك بصورة مؤكدة ومتكررة', color: '#dc2626' },
];

export const SDQ_ITEMS = [
  // 1. Emotional Symptoms (emotional)
  {
    id: 'sd1',
    subscaleId: 'emotional',
    text: 'يشكو كثيراً من آلام جسدية غير مبررة طبياً (مثل: ألم البطن، الصداع، الغثيان).',
    targetExample: 'الشكوى من ألم البطن في الصباح قبل الذهاب للمدرسة أو قبل دخول حصة يخشى منها دون مرض عضوي.',
  },
  {
    id: 'sd2',
    subscaleId: 'emotional',
    text: 'لديه مخاوف مفرطة ويظهر خوفاً وقلقاً سريعاً في المواقف الجديدة أو غير المألوفة.',
    targetExample: 'التردد الشديد والبكاء أو التراجع والتشبث بوالدته عند مقابلة أشخاص جدد أو دخول مكان غير معتاد.',
  },
  {
    id: 'sd3',
    subscaleId: 'emotional',
    text: 'يبدو في كثير من الأحيان حزيناً أو كئيباً أو يميل للبكاء بسهولة.',
    targetExample: 'الجلوس بمفرده بملامح حزينة والتأثر بالبكاء عند توجيه ملاحظة بسيطة من المعلم.',
  },
  {
    id: 'sd4',
    subscaleId: 'emotional',
    text: 'يشعر بالتوتر والاضطراب الشديد ويفقد الثقة في المواقف التي تتطلب استقلالية.',
    targetExample: 'القلق الشديد من ارتكاب الأخطاء وسؤال المشرف باستمرار للتأكد "هل أنا شاطر؟ هل سأفشل؟".',
  },
  {
    id: 'sd5',
    subscaleId: 'emotional',
    text: 'يقلق بشأن أمور كثيرة ويسهل إخافته أو ترويعه من أحداث متخيلة.',
    targetExample: 'السؤال المتكرر بقلق عن الموت، الحوادث، أو الظلام، والانشغال الذهني بتوقعات سلبية.',
  },

  // 2. Conduct Problems (conduct)
  {
    id: 'sd6',
    subscaleId: 'conduct',
    text: 'تنتابه نوبات غضب شديدة وثورات انفعالية وصراخ عند مواجهة الرفض أو الإحباط.',
    targetExample: 'الارتماء على الأرض والصراخ وضرب الأبواب عند منعه من استخدام الهاتف أو أخذ لعبة.',
  },
  {
    id: 'sd7',
    subscaleId: 'conduct',
    text: 'يعاند البالغين في الغالب ويرفض الاستجابة لأوامر الوالدين والمعلمين وتوجيهاتهم.',
    targetExample: 'الرفض الصريح لأداء المهمة بقول "لن أفعل" والاستمرار في السلوك غير المرغوب متعمداً.',
  },
  {
    id: 'sd8',
    subscaleId: 'conduct',
    text: 'يتشاجر ويتعارك كثيراً مع أقرانه أو يستأسد عليهم ويهددهم.',
    targetExample: 'دفع الأطفال باليد أو انتزاع ألعابهم بالقوة والتهديد بإيذائهم عند عدم الانصياع لرغباته.',
  },
  {
    id: 'sd9',
    subscaleId: 'conduct',
    text: 'يكذب في كثير من الأحيان أو يغش لتجنب المسؤولية أو للحصول على مكاسب.',
    targetExample: 'إنكار كسر أداة رآه المعلم يكسرها وإلقاء اللوم على زميل آخر لتفادي العقاب.',
  },
  {
    id: 'sd10',
    subscaleId: 'conduct',
    text: 'يأخذ ممتلكات الآخرين من المنزل أو المدرسة دون إذن (سلوكيات سرقة أو انتزاع).',
    targetExample: 'إخفاء أدوات زملائه أو ألعاب الصف في حقيبته وأخذها للمنزل دون إذن مسبق.',
  },

  // 3. Hyperactivity-Inattention (hyperactivity)
  {
    id: 'sd11',
    subscaleId: 'hyperactivity',
    text: 'كثير الحركة لا يستقر، كأنه مدفوع بمحرك، ويصعب عليه الجلوس هادئاً.',
    targetExample: 'النهوض المتكرر من المقعد والركض والتسلق على الطاولات أثناء الشرح داخل الصف.',
  },
  {
    id: 'sd12',
    subscaleId: 'hyperactivity',
    text: 'يتململ ويتفركك باستمرار بيديه أو قدميه أو يتلوى في مقعده.',
    targetExample: 'هز القدمين المستمر والنقر بالأصابع على الطاولة والتحرك في الكرسي دون توقف.',
  },
  {
    id: 'sd13',
    subscaleId: 'hyperactivity',
    text: 'يتشتت انتباهه بسرعة بأي مثير بصري أو سمعي خارجي عارض.',
    targetExample: 'التوقف عن حل ورقة العمل لمجرد مرور شخص خارج النافذة أو سماع صوت خافت في الممر.',
  },
  {
    id: 'sd14',
    subscaleId: 'hyperactivity',
    text: 'يتصرف بتسرع واندفاعية قبل التفكير في العواقب أو النتائج المترتبة على فعله.',
    targetExample: 'القفز من مكان مرتفع، أو الاندفاع لعبور الطريق دون النظر، أو مقاطعة حديث المعلم.',
  },
  {
    id: 'sd15',
    subscaleId: 'hyperactivity',
    text: 'يجد صعوبة بالغة في إكمال الواجبات والمهام المدرسية التي تتطلب تركيزاً متواصلاً.',
    targetExample: 'ترك ورقة الرسم أو الحساب غير مكتملة بعد دقائق والانتقال للعب بشيء آخر دون إنهائها.',
  },

  // 4. Peer Problems (peer)
  {
    id: 'sd16',
    subscaleId: 'peer',
    text: 'يميل إلى العزلة والانفراد ويفضل اللعب بمفرده على التفاعل مع الأطفال الآخرين.',
    targetExample: 'الوقوف وحيداً بجانب سور الملعب أثناء الفسحة وتجنب الانضمام لألعاب الأقران الجماعية.',
  },
  {
    id: 'sd17',
    subscaleId: 'peer',
    text: 'ليس لديه صديق مقرب واحد على الأقل في مثل سنه يستمتع بالحديث واللعب معه.',
    targetExample: 'غياب أي رفيق يطلب الاتصال به أو اللعب معه في عطلة نهاية الأسبوع أو الجلوس بجانبه.',
  },
  {
    id: 'sd18',
    subscaleId: 'peer',
    text: 'لا يحظى بالقبول والشعبية بين أقرانه، ويميل الأطفال لتجنب اللعب معه.',
    targetExample: 'رفض زملاء الصف مشاركته في فرق الألعاب لخشيتهم من انفعالاته أو انسحابه.',
  },
  {
    id: 'sd19',
    subscaleId: 'peer',
    text: 'يتعرض للاستهزاء أو المضايقة أو التنمر اللفظي والجسدي من أطفال آخرين.',
    targetExample: 'شكوى الطفل من تعرضه للسخرية أو أخذ طعامه أو نعته بأوصاف غير لائقة من زملائه.',
  },
  {
    id: 'sd20',
    subscaleId: 'peer',
    text: 'ينسجم ويتعامل مع البالغين والكبار أفضل بكثير من انسجامه وتفاعله مع أقرانه.',
    targetExample: 'تفضيل البقاء بجانب المعلمة أو الإداريين والحديث معهم بدلاً من الانخراط في لعب الأطفال.',
  },

  // 5. Prosocial Behavior (prosocial - Strength Domain)
  {
    id: 'sd21',
    subscaleId: 'prosocial',
    text: 'يراعي مشاعر الآخرين ويهتم بما يشعر به رفاقه وأفراد عائلته.',
    targetExample: 'خفض صوته عندما يعلم أن أخته نائمة، وسؤال والده باهتمام: "هل أنت بخير؟".',
  },
  {
    id: 'sd22',
    subscaleId: 'prosocial',
    text: 'يشارك ألعابه وأدواته وحلوياه مع الأطفال الآخرين بكل مرونة وسخاء.',
    targetExample: 'تقديم نصف وجبته لزميل نسى إفطاره، أو إعطاء ألوانه لصديقه لاستكمال رسمه.',
  },
  {
    id: 'sd23',
    subscaleId: 'prosocial',
    text: 'يقدم المساعدة لغيره إذا رآهم يتعثرون أو يواجهون صعوبة دون أن يُطلب منه ذلك.',
    targetExample: 'المبادرة بالتقاط الأقلام التي سقطت من يد زميله وإعادتها له بلطف.',
  },
  {
    id: 'sd24',
    subscaleId: 'prosocial',
    text: 'يتصرف بلطف ولين وعناية خاصة مع الأطفال الأصغر سناً وذوي الاحتياجات.',
    targetExample: 'إمساك يد طفل صغير لمساعدته في صعود الدرج والتعامل معه بصبر وحنان.',
  },
  {
    id: 'sd25',
    subscaleId: 'prosocial',
    text: 'يتطوع للمساعدة في الترتيب وإنجاز المهام الجماعية الصفية أو الأسرية.',
    targetExample: 'جمع الأوراق وتنظيم الطاولات بعد الحصة الفنية بدافع ذاتي وحرص على النظافة.',
  },
];

export function calculateSDQScore(answers = {}) {
  const answeredKeys = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null);
  const totalAnswered = answeredKeys.length;
  const totalItems = SDQ_ITEMS.length;

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
        { label: 'مجموع الصعوبات (TDS)', value: '—', sub: 'في انتظار الرصد', color: 'var(--text-sub)' },
        { label: 'السلوك الإيجابي (PRO)', value: '—', sub: 'نقاط القوة', color: 'var(--text-sub)' },
        { label: 'المؤشر الإكلينيكي', value: 'في الانتظار', sub: '0 بند مجاب', color: 'var(--text-sub)' },
      ],
      summary: 'في انتظار البدء بالتقييم - يرجى رصد بنود استبيان القوة والصعوبات (SDQ) لحساب مؤشرات القلق والسلوك والنشاط.',
      recommendations: 'سيتم حساب التصنيفات المعيارية ونقاط القوة والاحتياج فور إدخال الإجابات.',
    };
  }

  const subscaleScores = { emotional: 0, conduct: 0, hyperactivity: 0, peer: 0, prosocial: 0 };
  const subscaleAnswered = { emotional: 0, conduct: 0, hyperactivity: 0, peer: 0, prosocial: 0 };

  SDQ_ITEMS.forEach(it => {
    const val = Number(answers[it.id]);
    if (!isNaN(val) && answers[it.id] !== undefined && answers[it.id] !== null) {
      subscaleScores[it.subscaleId] = (subscaleScores[it.subscaleId] || 0) + val;
      subscaleAnswered[it.subscaleId] = (subscaleAnswered[it.subscaleId] || 0) + 1;
    }
  });

  // Total Difficulties Score (TDS): Sum of 4 problem scales (Emotional + Conduct + Hyperactivity + Peer). Range 0 - 40.
  const totalDifficultiesScore = subscaleScores.emotional + subscaleScores.conduct + subscaleScores.hyperactivity + subscaleScores.peer;
  const prosocialScore = subscaleScores.prosocial; // Range 0 - 10

  // Bandings based on Goodman's international SDQ norms for Total Difficulties Score (0-40):
  // Close to Average: 0 - 13
  // Slightly Raised (Borderline): 14 - 16
  // High: 17 - 19
  // Very High: 20 - 40
  let level = 'ضمن النطاق الطبيعي المقبول (Close to Average)';
  let severityKey = 'normal';
  let severityColor = '#059669';

  if (totalDifficultiesScore >= 20) {
    level = 'صعوبات سلوكية وانفعالية مرتفعة جداً دالة إكلينيكياً (Very High)';
    severityKey = 'severe';
    severityColor = '#dc2626';
  } else if (totalDifficultiesScore >= 17) {
    level = 'صعوبات سلوكية وانفعالية مرتفعة (High Risk)';
    severityKey = 'moderate';
    severityColor = '#ea580c';
  } else if (totalDifficultiesScore >= 14) {
    level = 'منطقة حدية تستدعي المتابعة (Slightly Raised / Borderline)';
    severityKey = 'mild';
    severityColor = '#d97706';
  }

  // Prosocial Strength classification (0-10):
  // 9-10: Excellent, 7-8: Average, 5-6: Slightly Low, 0-4: Low (concern)
  const prosocialLevel = prosocialScore >= 8 ? 'كفاية اجتماعية ممتازة' : (prosocialScore >= 6 ? 'متوسط مقنع' : 'قصور اجتماعي');

  const completionPercentage = Math.round((totalAnswered / totalItems) * 100);

  const subscaleResults = SDQ_SUBSCALES.map(sub => ({
    id: sub.id,
    name: sub.name,
    rawScore: subscaleScores[sub.id] || 0,
    maxScore: 10,
    answeredCount: subscaleAnswered[sub.id] || 0,
    totalCount: sub.itemsCount,
  }));

  const metrics = [
    { label: 'مجموع الصعوبات (TDS)', value: `${totalDifficultiesScore} / 40`, sub: level.split(' (')[0].slice(0, 18), color: severityColor },
    { label: 'السلوك الإيجابي (PRO)', value: `${prosocialScore} / 10`, sub: prosocialLevel, color: prosocialScore >= 7 ? '#059669' : '#dc2626' },
    { label: 'الانفعالية والقلق', value: `${subscaleScores.emotional} / 10`, sub: subscaleScores.emotional >= 5 ? 'مرتفع' : 'طبيعي', color: subscaleScores.emotional >= 5 ? '#dc2626' : '#7c3aed' },
    { label: 'مشكلات السلوك', value: `${subscaleScores.conduct} / 10`, sub: subscaleScores.conduct >= 4 ? 'مرتفع' : 'طبيعي', color: subscaleScores.conduct >= 4 ? '#dc2626' : '#ea580c' },
    { label: 'فرط الحركة', value: `${subscaleScores.hyperactivity} / 10`, sub: subscaleScores.hyperactivity >= 6 ? 'مرتفع' : 'طبيعي', color: subscaleScores.hyperactivity >= 6 ? '#dc2626' : '#d97706' },
    { label: 'مشكلات الأقران', value: `${subscaleScores.peer} / 10`, sub: subscaleScores.peer >= 4 ? 'مرتفع' : 'طبيعي', color: subscaleScores.peer >= 4 ? '#dc2626' : '#0284c7' },
  ];

  return {
    totalAnswered,
    totalItems,
    completionPercentage,
    totalRawScore: totalDifficultiesScore,
    standardScore: totalDifficultiesScore,
    totalDifficultiesScore,
    prosocialScore,
    level,
    severityKey,
    severityLabel: level,
    severityColor,
    metrics,
    subscaleResults,
    summary: `تم تقييم الطالب عبر استبيان القوة والصعوبات (SDQ)؛ وبلغت درجة مجموع الصعوبات الكلية (${totalDifficultiesScore} من أصل 40) وتصنيف: "${level}". بينما بلغت درجة السلوك الاجتماعي الإيجابي (${prosocialScore} من 10). التفصيل: الانفعالية (${subscaleScores.emotional}/10)، السلوك (${subscaleScores.conduct}/10)، فرط الحركة (${subscaleScores.hyperactivity}/10)، ومشاكل الأقران (${subscaleScores.peer}/10).`,
    recommendations: totalDifficultiesScore >= 14
      ? `يوصى بإدراج الطالب ضمن خطة تدخل سلوكي وانفعالي موجهة (BIP)، والتركيز على إدارة الغضب وتنمية مهارات التكيف مع الأقران والحد من المشتتات الصفية.`
      : `يوصى بتعزيز السلوكيات الاجتماعية الإيجابية ومكافأة التعاون والانضباط لترسيخ التوافق النفسي المدرسي.`,
  };
}

export const sdqScaleConfig = {
  id: 'sdq_screening',
  title: 'استبيان القوة والصعوبات السلوكية (SDQ)',
  titleEn: 'Strengths and Difficulties Questionnaire',
  icon: '❤️',
  category: 'behavioral_emotional',
  categoryName: 'الاضطرابات السلوكية والانفعالية',
  themeColor: 'violet',
  author: 'د. روبرت جودمان (Robert Goodman, Ph.D.)',
  authorEn: 'Robert Goodman, Ph.D., London Institute of Psychiatry',
  publisher: 'Youthinmind International Assessment Center',
  targetAge: 'من عمر 4 إلى 17 سنة (نسخ الوالدين والمعلمين والتقرير الذاتي)',
  standardsReference: 'الأداة العالمية الأكثر انتشاراً لفرز ومتابعة الاضطرابات السلوكية والانفعالية وفرط الحركة المتوافقة مع ICD-11 وDSM-5',
  notice: 'استبيان سيكومتري مقنن لتحديد صعوبات الصحة النفسية للطفل وتحديد نقاط القوة الاجتماعية الإيجابية الداعمة.',
  disclaimer: 'تعتبر نتائج SDQ أداة فحص ومؤشراً إكلينيكياً أولياً يستوجب المتابعة التخصصية والتشخيص المتكامل.',
  subscales: SDQ_SUBSCALES,
  items: SDQ_ITEMS,
  options: SDQ_OPTIONS,
  calculateScore: calculateSDQScore,
};
