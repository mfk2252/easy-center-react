/**
 * Vanderbilt ADHD Diagnostic Parent Rating Scale (NICHQ / AAP)
 * مقياس فاندربرلت لتشخيص وتحديد نمط فرط الحركة وتشتت الانتباه
 * إعداد: الأكاديمية الأمريكية لطب الأطفال (AAP) والمعهد الوطني لجودة صحة الطفل (NICHQ)
 * الأداة الإكلينيكية المعيارية لتشخيص الأنماط الثلاثة لـ ADHD وتقييم المعارضة وفق DSM-5
 */

export const VANDERBILT_DOMAINS = [
  {
    id: 'inattention',
    name: 'قصور وتشتت الانتباه',
    nameEn: 'Predominantly Inattentive',
    code: 'INA',
    icon: '🔍',
    color: '#3b82f6',
    description: 'يقيس إهمال التفاصيل، صعوبة الحفاظ على التركيز، النسيان، فقدان الأدوات، وضعف التنظيم.',
    itemsCount: 9,
  },
  {
    id: 'hyperactivity',
    name: 'فرط الحركة والاندفاعية',
    nameEn: 'Hyperactivity & Impulsivity',
    code: 'HYP',
    icon: '⚡',
    color: '#ea580c',
    description: 'يقيس التململ، مغادرة المقعد، كثرة الكلام، التسرع في الإجابات، وصعوبة انتظار الدور.',
    itemsCount: 9,
  },
  {
    id: 'odd_conduct',
    name: 'اضطراب التحدي المعارض والعناد',
    nameEn: 'Oppositional Defiant & Conduct',
    code: 'ODD',
    icon: '💥',
    color: '#dc2626',
    description: 'يقيس نوبات الغضب، مجادلة البالغين، رفض الأوامر عمداً، ومضايقة الآخرين.',
    itemsCount: 9,
  },
];

export const VANDERBILT_OPTIONS = [
  { value: 0, score: 0, label: '0 - أبداً (Never)', description: 'لا يظهر السلوك إطلاقاً', color: '#059669' },
  { value: 1, score: 1, label: '1 - أحياناً (Occasionally)', description: 'يظهر بين الحين والآخر بدرجة خفيفة', color: '#0284c7' },
  { value: 2, score: 2, label: '2 - غالباً (Often)', description: 'يظهر بوضوح وبصورة متكررة (يعد عرضاً تشخيصياً)', color: '#ea580c' },
  { value: 3, score: 3, label: '3 - دائماً جداً (Very Often)', description: 'يظهر باستمرار وبشدة مفرطة (عرض تشخيصي مؤكد)', color: '#dc2626' },
];

export const VANDERBILT_ITEMS = [
  // 1. Inattention (Items 1-9)
  {
    id: 'vb1',
    subscaleId: 'inattention',
    text: 'يفشل في إعارة انتباه دقيق للتفاصيل أو يرتكب أخطاء إهمال متكررة في الواجبات والأنشطة.',
    targetExample: 'تجاوز أسئلة كاملة في ورقة الاختبار أو إغفال النقاط وعلامات الترقيم أثناء الكتابة.',
  },
  {
    id: 'vb2',
    subscaleId: 'inattention',
    text: 'يواجه صعوبة بالغة في الحفاظ على الانتباه المستمر أثناء أداء المهام المدرسية أو أنشطة اللعب.',
    targetExample: 'الانفصال الذهني بعد دقيقتين من بدء الشرح أو ترك لعبة التركيب قبل إتمامها.',
  },
  {
    id: 'vb3',
    subscaleId: 'inattention',
    text: 'يبدو كأنه لا يستمع عندما يتحدث إليه أحد البالغين وجهاً لوجه وبصورة مباشرة.',
    targetExample: 'التحديق في الفراغ وعدم الاستجابة لمناداته باسمه إلا بعد تكرار النداء 3 مرات أو لمس كتفه.',
  },
  {
    id: 'vb4',
    subscaleId: 'inattention',
    text: 'لا يتبع التعليمات بشكل كامل ويفشل في إنهاء الواجبات المدرسية أو الأعمال المنزلية الموكلة إليه.',
    targetExample: 'البدء بتنفيذ الخطوة الأولى ونسيان الخطوتين المتبقيتين والانشغال باللعب بأقلامه.',
  },
  {
    id: 'vb5',
    subscaleId: 'inattention',
    text: 'يجد صعوبة في تنظيم المهام والأنشطة وتسلسل خطوات العمل وإدارة وقته.',
    targetExample: 'فوضى تامة في ترتيب طاولته وحقيبته المدرسية والعجز عن تحديد ما يجب البدء به أولاً.',
  },
  {
    id: 'vb6',
    subscaleId: 'inattention',
    text: 'يتجنب أو يكره أو يتردد بشدة في الانخراط بالمهام التي تتطلب جهداً ذهنياً وتركيزاً مستمراً.',
    targetExample: 'البكاء أو التمارض أو خلق الأعذار فور بدء وقت حل الواجبات المنزلية أو القراءة.',
  },
  {
    id: 'vb7',
    subscaleId: 'inattention',
    text: 'يفقد الأشياء والأدوات الضرورية لإنجاز المهام (مثل: الأقلام، الكتب، النظارة، الألعاب).',
    targetExample: 'البحث اليومي المتكرر عن مقلمته أو فقدان كراسة الواجبات والعودة بدونها من المدرسة.',
  },
  {
    id: 'vb8',
    subscaleId: 'inattention',
    text: 'يتشتت انتباهه وتركيزه بسهولة شديدة بالمثيرات البصرية والسمعية الخارجية العارضة.',
    targetExample: 'الالتفات ومتابعة حركة طائر خارج النافذة أو صوت فتح الباب وترك حل المسألة.',
  },
  {
    id: 'vb9',
    subscaleId: 'inattention',
    text: 'كثير النسيان في الأنشطة والالتزامات والمواعيد اليومية المعتادة.',
    targetExample: 'نسيان تسليم الواجب للمعلم رغم حله، أو نسيان إحضار زجاجة الماء أو ارتداء القبعة.',
  },

  // 2. Hyperactivity / Impulsivity (Items 10-18)
  {
    id: 'vb10',
    subscaleId: 'hyperactivity',
    text: 'يتململ ويتفركك بيديه أو قدميه أو يتقلب ويتلوى باستمرار في مقعده.',
    targetExample: 'النقر بالأصابع على الطاولة وهز الساقين دون توقف وتحريك الكرسي على قائمتين.',
  },
  {
    id: 'vb11',
    subscaleId: 'hyperactivity',
    text: 'يترك مقعده في الفصل أو غرفة الطعام في المواقف التي يُتوقع منه فيها البقاء جالساً.',
    targetExample: 'الوقوف والتجول بين مقاعد زملائه أثناء شرح الدرس رغم التنبيه المتكرر.',
  },
  {
    id: 'vb12',
    subscaleId: 'hyperactivity',
    text: 'يجري أو يتسلق بكثرة وفي مواقف وسياقات غير ملائمة وغير آمنة.',
    targetExample: 'التسلق على المكاتب أو القفز بين الأرائك في الأماكن الرسمية وعيادات الأطباء.',
  },
  {
    id: 'vb13',
    subscaleId: 'hyperactivity',
    text: 'يجد صعوبة في اللعب أو الانخراط في أنشطة الترفيه والمطالعة بهدوء وسكينة.',
    targetExample: 'إصدار أصوات عالية وصخب مستمر واصطدام بالأدوات حتى أثناء ممارسة ألعاب هادئة.',
  },
  {
    id: 'vb14',
    subscaleId: 'hyperactivity',
    text: 'دائم الحركة والنشاط ويتصرف كأنه مدفوع بمحرك ميكانيكي لا يتوقف (On the go).',
    targetExample: 'المحافظة على وتيرة حركة مفرطة وسريعة من الصباح حتى المساء دون إبداء علامات تعب.',
  },
  {
    id: 'vb15',
    subscaleId: 'hyperactivity',
    text: 'يتحدث بشكل مفرط ومستمر دون مراعاة السياق الاجتماعي أو إعطاء فرصة للآخرين.',
    targetExample: 'الاستمرار في الحديث بصوت عالٍ ومقاطعة شرح المعلم أو أحاديث الأسرة دون توقف.',
  },
  {
    id: 'vb16',
    subscaleId: 'hyperactivity',
    text: 'يتسرع ويجيب باندفاعية قبل أن يكتمل طرح السؤال عليه.',
    targetExample: 'الصراخ بإجابة عشوائية قبل أن يكمل المعلم قراءة المسألة.',
  },
  {
    id: 'vb17',
    subscaleId: 'hyperactivity',
    text: 'يواجه صعوبة بالغة وقلقاً شديداً عند انتظار دوره في الألعاب أو الطابور.',
    targetExample: 'دفع الأطفال وتجاوز الصف في طابور المقصف أو الحافلة لعجزه عن الانتظار لدقيقة واحدة.',
  },
  {
    id: 'vb18',
    subscaleId: 'hyperactivity',
    text: 'يقاطع أحاديث الآخرين أو يتطفل على ألعابهم وأنشطتهم دون استئذان.',
    targetExample: 'اقتحام محادثة الكبار وفرض حديثه بالقوة أو انتزاع ألعاب الأطفال والتدخل في مسار لعبهم.',
  },

  // 3. Oppositional Defiant & Conduct (Items 19-27)
  {
    id: 'vb19',
    subscaleId: 'odd_conduct',
    text: 'يفقد أعصابه وتثور ثائرته الانفعالية بسرعة وبصورة متكررة.',
    targetExample: 'إلقاء الأغراض والصراخ الشديد عند منعه من مشاهدة الشاشة أو طلب أداء الواجب.',
  },
  {
    id: 'vb20',
    subscaleId: 'odd_conduct',
    text: 'يجادل البالغين والمعلمين بحدة ويتحدى توجيهاتهم وسلطتهم.',
    targetExample: 'مناكفة المعلم والرد عليه بنبرة استهزاء عند تنبيهه على سلوك خاطئ.',
  },
  {
    id: 'vb21',
    subscaleId: 'odd_conduct',
    text: 'يرفض بنشاط وعناد التجاوب مع القواعد المدرسية أو طلبات الكبار.',
    targetExample: 'رفض فتح الكتاب أو الخروج للساحة مع زملائه والإصرار على مخالفة التعليمات عمداً.',
  },
  {
    id: 'vb22',
    subscaleId: 'odd_conduct',
    text: 'يتعمد القيام بتصرفات لإزعاج ومضايقة واستفزاز الآخرين.',
    targetExample: 'إصدار أصوات تشتت زميله أثناء كتابته أو إخفاء أدواته بهدف رؤيته متضايقاً.',
  },
  {
    id: 'vb23',
    subscaleId: 'odd_conduct',
    text: 'يلوم الآخرين دائماً على أخطائه أو سوء تصرفاته ولا يعترف بالخطأ.',
    targetExample: 'القول الفوري: "هو الذي جعلني أكسرها" لتبرئة نفسه من المسؤولية.',
  },
  {
    id: 'vb24',
    subscaleId: 'odd_conduct',
    text: 'سريع الحساسية والانزعاج وسهل الاستفزاز من أقل حركة أو كلمة تصدر من زملائه.',
    targetExample: 'البدء بالشجار لمجرد لمس أحد الطلاب لحقيبته عن طريق الخطأ في الممر.',
  },
  {
    id: 'vb25',
    subscaleId: 'odd_conduct',
    text: 'يبدو غاضباً أو مستاءً ومحتقناً في كثير من أوقات اليوم.',
    targetExample: 'الملامح العابسة المستمرة والتذمر الدائم من كل نشاط يقدم له في الصف أو البيت.',
  },
  {
    id: 'vb26',
    subscaleId: 'odd_conduct',
    text: 'يظهر تصرفات حاقدة أو كيدية أو رغبة في الانتقام من زملائه.',
    targetExample: 'تمزيق دفتر زميل تخاصم معه سراً بعد مغادرة الصف للانتقام منه.',
  },
  {
    id: 'vb27',
    subscaleId: 'odd_conduct',
    text: 'يتنمر أو يهدد الآخرين بالإيذاء الجسدي أو اللفظي.',
    targetExample: 'استخدام عبارات التهديد والترهيب للأطفال الأصغر سناً لإجبارهم على إعطائه ممتلكاتهم.',
  },
];

export function calculateVanderbiltScore(answers = {}) {
  const answeredKeys = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null);
  const totalAnswered = answeredKeys.length;
  const totalItems = VANDERBILT_ITEMS.length;

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
        { label: 'النمط التشخيصي', value: '—', sub: 'في انتظار الرصد', color: 'var(--text-sub)' },
        { label: 'أعراض قصور الانتباه', value: '0 / 9', sub: 'عتبة DSM-5 (6+)', color: 'var(--text-sub)' },
        { label: 'أعراض فرط الحركة', value: '0 / 9', sub: 'عتبة DSM-5 (6+)', color: 'var(--text-sub)' },
      ],
      summary: 'في انتظار البدء بالتقييم - يرجى رصد بنود مقياس فاندربرلت لتحديد أعراض قصور الانتباه وفرط الحركة والعناد.',
      recommendations: 'سيتم تحديد النمط التشخيصي وفق معايير DSM-5 فور إدخال الاستجابات.',
    };
  }

  // Count qualifying symptoms (rated 2 = Often or 3 = Very Often)
  let inattentiveCount = 0;
  let hyperactiveCount = 0;
  let oddCount = 0;

  let inattentionRaw = 0;
  let hyperactivityRaw = 0;
  let oddRaw = 0;

  VANDERBILT_ITEMS.forEach(it => {
    const val = Number(answers[it.id]);
    if (!isNaN(val) && answers[it.id] !== undefined && answers[it.id] !== null) {
      if (it.subscaleId === 'inattention') {
        inattentionRaw += val;
        if (val >= 2) inattentiveCount++;
      } else if (it.subscaleId === 'hyperactivity') {
        hyperactivityRaw += val;
        if (val >= 2) hyperactiveCount++;
      } else if (it.subscaleId === 'odd_conduct') {
        oddRaw += val;
        if (val >= 2) oddCount++;
      }
    }
  });

  const totalRawScore = inattentionRaw + hyperactivityRaw + oddRaw;
  const maxPossible = totalItems * 3; // 27 * 3 = 81

  // DSM-5 Clinical Diagnostic Criteria:
  // Requires >= 6 qualifying symptoms (rated 2 or 3) out of 9 items:
  const hasInattentiveType = inattentiveCount >= 6;
  const hasHyperactiveType = hyperactiveCount >= 6;
  const hasOddCriteria = oddCount >= 4; // ODD criteria: >= 4 symptoms

  let level = 'لا يستوفي معايير اضطراب فرط الحركة (Negative Screen)';
  let severityKey = 'normal';
  let severityColor = '#059669';

  if (hasInattentiveType && hasHyperactiveType) {
    level = 'مؤشرات إيجابية مؤكدة: النمط المركب لفرط الحركة وتشتت الانتباه (Combined Presentation)';
    severityKey = 'severe';
    severityColor = '#dc2626';
  } else if (hasInattentiveType) {
    level = 'مؤشرات إيجابية: نمط تشتت وقصور الانتباه السائد (Predominantly Inattentive)';
    severityKey = 'moderate';
    severityColor = '#3b82f6';
  } else if (hasHyperactiveType) {
    level = 'مؤشرات إيجابية: نمط النشاط الحركي والاندفاعية السائد (Predominantly Hyperactive-Impulsive)';
    severityKey = 'moderate';
    severityColor = '#ea580c';
  } else if (inattentiveCount >= 4 || hyperactiveCount >= 4) {
    level = 'أعراض حدية فرعية تستدعي الملاحظة والتقييم السلوكي (Subthreshold / Monitor)';
    severityKey = 'mild';
    severityColor = '#d97706';
  }

  const completionPercentage = Math.round((totalAnswered / totalItems) * 100);

  const subscaleResults = VANDERBILT_DOMAINS.map(dom => {
    const raw = dom.id === 'inattention' ? inattentionRaw : (dom.id === 'hyperactivity' ? hyperactivityRaw : oddRaw);
    const symCount = dom.id === 'inattention' ? inattentiveCount : (dom.id === 'hyperactivity' ? hyperactiveCount : oddCount);
    const isQualifying = dom.id === 'odd_conduct' ? symCount >= 4 : symCount >= 6;
    return {
      id: dom.id,
      name: dom.name,
      rawScore: raw,
      maxScore: 27,
      symptomCount: symCount,
      isQualifying,
      answeredCount: VANDERBILT_ITEMS.filter(it => it.subscaleId === dom.id && answers[it.id] !== undefined).length,
      totalCount: dom.itemsCount,
    };
  });

  const metrics = [
    { label: 'النمط التشخيصي', value: level.split(' (')[0].slice(0, 24), sub: 'معيار DSM-5', color: severityColor },
    { label: 'أعراض تشتت الانتباه', value: `${inattentiveCount} / 9 أعراض`, sub: hasInattentiveType ? 'مستوفٍ للمعيار (6+)' : 'دون العتبة', color: hasInattentiveType ? '#dc2626' : '#3b82f6' },
    { label: 'أعراض فرط الحركة', value: `${hyperactiveCount} / 9 أعراض`, sub: hasHyperactiveType ? 'مستوفٍ للمعيار (6+)' : 'دون العتبة', color: hasHyperactiveType ? '#dc2626' : '#ea580c' },
    { label: 'أعراض العناد والمعارضة', value: `${oddCount} / 9 أعراض`, sub: hasOddCriteria ? 'مؤشرات ODD متحققة' : 'طبيعي', color: hasOddCriteria ? '#dc2626' : '#059669' },
    { label: 'الدرجة الخام الكلية', value: `${totalRawScore} / ${maxPossible}`, sub: `نسبة الشدة: ${Math.round((totalRawScore / maxPossible) * 100)}%`, color: severityColor },
  ];

  return {
    totalAnswered,
    totalItems,
    completionPercentage,
    totalRawScore,
    standardScore: totalRawScore,
    inattentiveCount,
    hyperactiveCount,
    oddCount,
    hasInattentiveType,
    hasHyperactiveType,
    hasOddCriteria,
    level,
    severityKey,
    severityLabel: level,
    severityColor,
    metrics,
    subscaleResults,
    summary: `تم تقييم الطفل بمقياس فاندربرلت الإكلينيكي (Vanderbilt ADHD Scale)؛ وجاءت النتيجة: "${level}". بلغ عدد أعراض قصور الانتباه (${inattentiveCount} من 9 - بدرجة خام ${inattentionRaw})، وعدد أعراض فرط الحركة والاندفاعية (${hyperactiveCount} من 9 - بدرجة خام ${hyperactivityRaw})، وسلوكيات العناد والمعارضة (${oddCount} من 9 - بدرجة خام ${oddRaw}).`,
    recommendations: (hasInattentiveType || hasHyperactiveType)
      ? `توصي النتائج بإحالة الحالة للعيادة النفسية والطبية لاستكمال الفحص متعدد التخصصات، ووضع برنامج دعم سلوكي وتربوي يشمل تقليل فترات الجلسات وتجزئة المهام واستخدام الجداول البصرية.`
      : `يوصى بمواصلة تدريب الطفل على إدارة الوقت والتركيز الذاتي وتعزيز فترات الانتباه في الصف والمتابعة الأسرية.`,
  };
}

export const vanderbiltScaleConfig = {
  id: 'vanderbilt_adhd',
  title: 'مقياس فاندربرلت لتشخيص فرط الحركة وتشتت الانتباه',
  titleEn: 'Vanderbilt ADHD Diagnostic Parent Rating Scale',
  icon: '⚡',
  category: 'adhd',
  categoryName: 'مقاييس فرط الحركة وتشتت الانتباه',
  themeColor: 'violet',
  author: 'الأكاديمية الأمريكية لطب الأطفال (AAP) ومعهد NICHQ',
  publisher: 'National Institute for Children\'s Health Quality',
  targetAge: 'من عمر 6 إلى 12 سنة (المرحلة الابتدائية والمتوسطة)',
  standardsReference: 'الأداة المرجعية المعتمدة من الأكاديمية الأمريكية لطب الأطفال المطابقة لمعايير DSM-5 التشخيصية',
  notice: 'مقياس فرز وتشخيص دقيق لفرط الحركة والاندفاعية وقصور الانتباه وتحديد وجود اضطراب التحدي المعارض المصاحب.',
  disclaimer: 'تتطلب دلالة التشخيص النهائي وجود الأعراض في بيئتين مختلفتين على الأقل (المنزل والمدرسة) وتأثيرها على الأداء الأكاديمي.',
  subscales: VANDERBILT_DOMAINS,
  items: VANDERBILT_ITEMS,
  options: VANDERBILT_OPTIONS,
  calculateScore: calculateVanderbiltScore,
};
