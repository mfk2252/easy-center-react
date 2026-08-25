export const SENSORY_CHECKLIST_DOMAINS = [
  { id: 'd1', num: 1, name: 'بعد الحركة', englishName: 'After Movement', color: '#3b82f6', bgLight: '#eff6ff' },
  { id: 'd2', num: 2, name: 'بعد الإبصار', englishName: 'After Vision', color: '#8b5cf6', bgLight: '#f5f3ff' },
  { id: 'd3', num: 3, name: 'بعد التواصل البصري', englishName: 'After Eye Contact', color: '#ec4899', bgLight: '#fdf2f8' },
  { id: 'd4', num: 4, name: 'اللمس', englishName: 'Touch', color: '#10b981', bgLight: '#ecfdf5' },
  { id: 'd5', num: 5, name: 'التغذية', englishName: 'Feeding', color: '#f59e0b', bgLight: '#fffbeb' },
  { id: 'd6', num: 6, name: 'الاستماع', englishName: 'Listening', color: '#ef4444', bgLight: '#fef2f2' },
  { id: 'd7', num: 7, name: 'الشم', englishName: 'Smell', color: '#14b8a6', bgLight: '#f0fdfa' },
  { id: 'd8', num: 8, name: 'النوم', englishName: 'Sleep', color: '#6366f1', bgLight: '#e0e7ff' },
];

export const SENSORY_CHECKLIST_OPTIONS = [
  { value: 1, label: 'نادراً', weight: 1, color: '#10b981', desc: 'يحدث بشكل نادر جداً' },
  { value: 2, label: 'أحياناً', weight: 2, color: '#f59e0b', desc: 'يحدث في بعض الأحيان' },
  { value: 3, label: 'كثيراً', weight: 3, color: '#ef4444', desc: 'يحدث بشكل متكرر ومستمر' },
];

export const SENSORY_CHECKLIST_ITEMS = [
  // البعد الأول: بعد الحركة
  { id: 'q1', domainId: 'd1', num: 1, text: 'يكره تغيير وضعه، فمثلاً يحب الاستلقاء على الظهر باستمرار.' },
  { id: 'q2', domainId: 'd1', num: 2, text: 'يخاف إذا رفعت قدميه عن الأرض.' },
  { id: 'q3', domainId: 'd1', num: 3, text: 'يجد صعوبة في الاستمرار في الجلوس فترة طويلة.' },
  { id: 'q4', domainId: 'd1', num: 4, text: 'يبدو قلقاً إذا تحرك فجأة أو غير اتجاه حركته.' },
  { id: 'q5', domainId: 'd1', num: 5, text: 'يتجنب الميل نحو الأمام.' },
  { id: 'q6', domainId: 'd1', num: 6, text: 'لا يمكنه الاتزان، فمثلاً عندما يخلع ملابسه يجلس على الأرض.' },
  { id: 'q7', domainId: 'd1', num: 7, text: 'يكره اللعب العنيف وألعاب القفز.' },
  { id: 'q8', domainId: 'd1', num: 8, text: 'يتجنب استخدام أدوات الملعب، مثل الأرجوحة، والمزلجة.' },
  { id: 'q9', domainId: 'd1', num: 9, text: 'يتجنب ألعاب النشاط الحركي.' },
  { id: 'q10', domainId: 'd1', num: 10, text: 'يصاب بالغثيان عند ركوب السيارات والمصاعد والخيل.' },
  { id: 'q11', domainId: 'd1', num: 11, text: 'يتجنب أنشطة التوازن.' },
  { id: 'q12', domainId: 'd1', num: 12, text: 'يبدو قلقاً في البيئة المليئة بالحركة، فينتقل إلى جانب الغرفة.' },
  { id: 'q13', domainId: 'd1', num: 13, text: 'يحب الحركة الكثيرة، فمثلاً يقف ويجلس ويتحرك باستمرار.' },
  { id: 'q14', domainId: 'd1', num: 14, text: 'يميل إلى ممارسة أنشطة الحركة السريعة، مثل التأرجح.' },
  { id: 'q15', domainId: 'd1', num: 15, text: 'يبدو متحمساً في الغرفة المليئة بالحركة.' },
  { id: 'q16', domainId: 'd1', num: 16, text: 'يدور حول نفسه ولا يشعر أبداً بالدوار.' },
  { id: 'q17', domainId: 'd1', num: 17, text: 'يدير الأشياء بيديه باستمرار.' },
  { id: 'q18', domainId: 'd1', num: 18, text: 'يتأرجح دائماً (بجسمه كله، أو بجزء منه).' },
  { id: 'q19', domainId: 'd1', num: 19, text: 'نشط ويتحرك باستمرار.' },
  { id: 'q20', domainId: 'd1', num: 20, text: 'يبدو خائفاً من المرتفعات والآلات المتحركة.' },
  { id: 'q21', domainId: 'd1', num: 21, text: 'يمشي على أطراف أصابعه.' },
  { id: 'q22', domainId: 'd1', num: 22, text: 'يتعب بسهولة لأقل نشاط.' },

  // البعد الثاني: بعد الإبصار
  { id: 'q23', domainId: 'd2', num: 1, text: 'يبدو غير مرتاحاً عند وجوده في أشعة الشمس القوية (يشعر بالحول، أو يغلق عينيه، أو يفضل الظلام).' },
  { id: 'q24', domainId: 'd2', num: 2, text: 'يبدو حساساً للتغيرات في الإضاءة (كالخروج من موقف سيارات مظلم إلى إضاءة ساطعة في محل تجاري).' },
  { id: 'q25', domainId: 'd2', num: 3, text: 'لا يحب النظر إلى التليفزيون أو الكمبيوتر.' },
  { id: 'q26', domainId: 'd2', num: 4, text: 'لا يحب ألوان معينة، أو يفضل لون محدد.' },
  { id: 'q27', domainId: 'd2', num: 5, text: 'يحب تتبع الظل أو مشاهدة الأشياء تدور أو الأضواء المنعكسة.' },
  { id: 'q28', domainId: 'd2', num: 6, text: 'يحب مشاهدة الماء (يتقاطر، أو يجري).' },
  { id: 'q29', domainId: 'd2', num: 7, text: 'يلعب بالبصاق أو يضرب فقاعات البصاق.' },
  { id: 'q30', domainId: 'd2', num: 8, text: 'يحب إضاءة النور وإطفاءه.' },
  { id: 'q31', domainId: 'd2', num: 9, text: 'يصف الأشياء في صفوف.' },
  { id: 'q32', domainId: 'd2', num: 10, text: 'يحب إسقاط أو رمي الأشياء مراراً وتكراراً.' },
  { id: 'q33', domainId: 'd2', num: 11, text: 'يحب اللعب بالرمل ومشاهدته يسقط من يديه.' },
  { id: 'q34', domainId: 'd2', num: 12, text: 'يجد صعوبة في نقل تركيزه من شيء لآخر.' },
  { id: 'q35', domainId: 'd2', num: 13, text: 'يبدو وكأنه لا يرى الأشياء عندما تكون على خلفية مشغولة.' },
  { id: 'q36', domainId: 'd2', num: 14, text: 'يلتفت للتفاصيل الصغيرة ولا يرى الشيء بأكمله.' },
  { id: 'q37', domainId: 'd2', num: 15, text: 'لديه صعوبة في توصيل وتصنيف الأشياء.' },

  // البعد الثالث: بعد التواصل البصري مع الأشخاص والأشياء
  { id: 'q38', domainId: 'd3', num: 1, text: 'يغطي وجهه، أو عينيه بالأشياء.' },
  { id: 'q39', domainId: 'd3', num: 2, text: 'ينظر بتدقيق للناس، أو يحدق في الأشياء.' },
  { id: 'q40', domainId: 'd3', num: 3, text: 'يحدق في الفضاء أو الفراغ.' },
  { id: 'q41', domainId: 'd3', num: 4, text: 'تحوّل عينيه عند النظر إلى الأشخاص أو الأشياء.' },
  { id: 'q42', domainId: 'd3', num: 5, text: 'ينظر إلى الناس أو الأشياء بطرف عينيه.' },
  { id: 'q43', domainId: 'd3', num: 6, text: 'لا يهتم بالألعاب.' },
  { id: 'q44', domainId: 'd3', num: 7, text: 'يجد صعوبة في التتبع البصري.' },
  { id: 'q45', domainId: 'd3', num: 8, text: 'يستخدم سلوكيات التنبيه الذاتي بشكل رئيسي مثل رفرفة اليدين.' },
  { id: 'q46', domainId: 'd3', num: 9, text: 'يقرب رأسه جداً من الأشياء لرؤيتها.' },
  { id: 'q47', domainId: 'd3', num: 10, text: 'تحول عينيه عند النظر للأشياء.' },

  // البعد الرابع: اللمس
  { id: 'q48', domainId: 'd4', num: 1, text: 'يضغط أكثر أو أقل من اللازم عندما يمسك بالأشياء.' },
  { id: 'q49', domainId: 'd4', num: 2, text: 'يسقط دائماً على الأرض.' },
  { id: 'q50', domainId: 'd4', num: 3, text: 'يستمتع بالسقوط من على الكراسي أو المرتفعات.' },
  { id: 'q51', domainId: 'd4', num: 4, text: 'يصطدم بالأشياء ويبدو غير قادر على ملاحظتها.' },
  { id: 'q52', domainId: 'd4', num: 5, text: 'يستمتع بالاصطدام بالأشخاص أو الأشياء.' },
  { id: 'q53', domainId: 'd4', num: 6, text: 'يميل إلى لعب الألعاب العنيفة أو ألعاب التشقلب.' },
  { id: 'q54', domainId: 'd4', num: 7, text: 'يحب أن يكون ملفوفاً بقوة في بطانيته أثناء النوم.' },
  { id: 'q55', domainId: 'd4', num: 8, text: 'يحب العناق القوي أو الضغط بشدة.' },
  { id: 'q56', domainId: 'd4', num: 9, text: 'يحب التدليك القوي.' },
  { id: 'q57', domainId: 'd4', num: 10, text: 'يحب أن يلمس الأشياء وأن يتحسسها.' },
  { id: 'q58', domainId: 'd4', num: 11, text: 'يضرب رأسه بعنف.' },
  { id: 'q59', domainId: 'd4', num: 12, text: 'يعض يديه.' },
  { id: 'q60', domainId: 'd4', num: 13, text: 'يتأثر إذا مسه أحد، ولا يحب الاصطفاف مع الآخرين.' },
  { id: 'q61', domainId: 'd4', num: 14, text: 'لا يحب قبضات اليد أو إمساك شخص بالغ له من يده.' },
  { id: 'q62', domainId: 'd4', num: 15, text: 'يميل إلى استخدام الفم بدلاً من اليد لاستكشاف الأشياء.' },
  { id: 'q63', domainId: 'd4', num: 16, text: 'يستخدم المعصمين لالتقاط الأشياء بدلاً من الأصابع.' },
  { id: 'q64', domainId: 'd4', num: 17, text: 'يميل إلى اللمس المفرط للأشخاص أو الأشياء.' },
  { id: 'q65', domainId: 'd4', num: 18, text: 'لديه ملابسه المفضلة (ويصرخ إذا ارتدى ملابس جديدة).' },
  { id: 'q66', domainId: 'd4', num: 19, text: 'يرتدي فقط ملابس من أقمشة معينة كالقطن أو الصوف.' },
  { id: 'q67', domainId: 'd4', num: 20, text: 'يرى أن خلع الملابس عملية مرهقة جداً.' },
  { id: 'q68', domainId: 'd4', num: 21, text: 'يحب الملصقات المقتطعة من ملابسه.' },
  { id: 'q69', domainId: 'd4', num: 22, text: 'يتجنب أن تكون قدميه حافيتين.' },
  { id: 'q70', domainId: 'd4', num: 23, text: 'يرفض ارتداء الأحذية والجوارب.' },
  { id: 'q71', domainId: 'd4', num: 24, text: 'يحب أن يكون عارياً.' },
  { id: 'q72', domainId: 'd4', num: 25, text: 'يصبح مستاءً عندما يغسل شعره أو يمشطه.' },
  { id: 'q73', domainId: 'd4', num: 26, text: 'يشعر بالضيق عند غسل أسنانه.' },
  { id: 'q74', domainId: 'd4', num: 27, text: 'يشعر بالضيق من حلاقة شعره.' },
  { id: 'q75', domainId: 'd4', num: 28, text: 'يتجنب أو يشعر بالاستياء عند اللعب بالمواد الرطبة كالعجين.' },
  { id: 'q76', domainId: 'd4', num: 29, text: 'يكره الفوضى أو التشويش.' },
  { id: 'q77', domainId: 'd4', num: 30, text: 'يُبدي الحمى (دائماً ساخناً، ويرتدي ملابس محدودة).' },
  { id: 'q78', domainId: 'd4', num: 31, text: 'يجد صعوبة في تحمل التغيرات في درجات الحرارة.' },
  { id: 'q79', domainId: 'd4', num: 32, text: 'يظهر دلائل على انخفاض الوعي بالألم.' },

  // البعد الخامس: التغذية
  { id: 'q80', domainId: 'd5', num: 1, text: 'يأكل فقط مجموعة صغيرة محددة من الأطعمة.' },
  { id: 'q81', domainId: 'd5', num: 2, text: 'يتقيأ عند تناول الطعام.' },
  { id: 'q82', domainId: 'd5', num: 3, text: 'يفضل الأطعمة المقطعة لأجزاء صغيرة (لا يمضغ الطعام).' },
  { id: 'q83', domainId: 'd5', num: 4, text: 'يفضل الأطعمة ذات درجات الحرارة الثابتة كالباردة فقط.' },
  { id: 'q84', domainId: 'd5', num: 5, text: 'يتردد كثيراً عند تجريب أطعمة جديدة.' },
  { id: 'q85', domainId: 'd5', num: 6, text: 'يلعق الأشياء أو الأشخاص.' },
  { id: 'q86', domainId: 'd5', num: 7, text: 'يحب وضع الأشياء في الفم لفترة طويلة.' },
  { id: 'q87', domainId: 'd5', num: 8, text: 'يعض نفسه.' },
  { id: 'q88', domainId: 'd5', num: 9, text: 'يعض الآخرين.' },
  { id: 'q89', domainId: 'd5', num: 10, text: 'يتقيأ الطعام.' },
  { id: 'q90', domainId: 'd5', num: 11, text: 'يأكل مواد غير مناسبة.' },
  { id: 'q91', domainId: 'd5', num: 12, text: 'يشرب مجموعة محدودة من المشروبات كالحليب فقط.' },
  { id: 'q92', domainId: 'd5', num: 13, text: 'يشرب فقط من خلال الشاليمون.' },
  { id: 'q93', domainId: 'd5', num: 14, text: 'يشرب فقط من كوب خاص أو زجاجة خاصة.' },

  // البعد السادس: الاستماع
  { id: 'q94', domainId: 'd6', num: 1, text: 'لا يظهر أي استجابة للضوضاء أو الكلام.' },
  { id: 'q95', domainId: 'd6', num: 2, text: 'يستمتع بالأصوات مراراً وتكراراً، مثل تدفق مياه الحمام.' },
  { id: 'q96', domainId: 'd6', num: 3, text: 'يضع أذنيه بالقرب من الضوضاء للاستماع إليه.' },
  { id: 'q97', domainId: 'd6', num: 4, text: 'لديه حاسة سمع قوية، فيمكنه سماع أصوات لا يمكننا سماعها.' },
  { id: 'q98', domainId: 'd6', num: 5, text: 'ينصرف انتباهه بسهولة بفعل الضوضاء.' },
  { id: 'q99', domainId: 'd6', num: 6, text: 'يخاف من الأجهزة الكهربائية مثل المكنسة الكهربائية أو الخلاط.' },
  { id: 'q100', domainId: 'd6', num: 7, text: 'يبدو منزعجاً من سماع الأصوات الصاخبة أو المفاجئة.' },
  { id: 'q101', domainId: 'd6', num: 8, text: 'يهمهم أو يدندن لحجب الضوضاء.' },
  { id: 'q102', domainId: 'd6', num: 9, text: 'يضع أصابعه في أذنيه أو يغطي الأذنين.' },
  { id: 'q103', domainId: 'd6', num: 10, text: 'يصرخ عند سماع أصوات عالية.' },
  { id: 'q104', domainId: 'd6', num: 11, text: 'يكره الأماكن الصاخبة، مثل الملاعب والاجتماعات.' },

  // البعد السابع: الشم
  { id: 'q105', domainId: 'd7', num: 1, text: 'يحب استنشاق الأشياء أو الأشخاص أو الأطعمة.' },
  { id: 'q106', domainId: 'd7', num: 2, text: 'يقترب دائماً من الأشخاص أو الأشياء ليشمها.' },
  { id: 'q107', domainId: 'd7', num: 3, text: 'يحب رائحة منتجات التنظيف.' },
  { id: 'q108', domainId: 'd7', num: 4, text: 'ينزعج حينما يتم طهي الطعام.' },
  { id: 'q109', domainId: 'd7', num: 5, text: 'يكره الروائح القوية، مثل العطور، ومعطر الحمام.' },
  { id: 'q110', domainId: 'd7', num: 6, text: 'يكره معجون الأسنان.' },
  { id: 'q111', domainId: 'd7', num: 7, text: 'يمسك أنفه ويكتم أنفاسه عندما يشم رائحة.' },
  { id: 'q112', domainId: 'd7', num: 8, text: 'يبدو غير قادراً على شم الروائح القوية.' },

  // البعد الثامن: النوم
  { id: 'q113', domainId: 'd8', num: 1, text: 'لديه صعوبة في النوم.' },
  { id: 'q114', domainId: 'd8', num: 2, text: 'يفضل أن ينام مع والديه.' },
  { id: 'q115', domainId: 'd8', num: 3, text: 'ينام في أماكن غير معتادة (على الأرض، أمام الحائط).' },
  { id: 'q116', domainId: 'd8', num: 4, text: 'ينام مرتدياً ملابس محددة.' },
  { id: 'q117', domainId: 'd8', num: 5, text: 'ينام بدون ملابس.' },
];

export function calculateSensoryChecklistScore(scores) {
  let totalRawScore = 0;
  let answeredCount = 0;
  
  const domainScores = {};
  SENSORY_CHECKLIST_DOMAINS.forEach(d => {
    domainScores[d.id] = { ...d, raw: 0, count: 0 };
  });

  Object.entries(scores).forEach(([qId, val]) => {
    if (val !== undefined && val !== null && val > 0) {
      const q = SENSORY_CHECKLIST_ITEMS.find(x => x.id === qId);
      if (q) {
        totalRawScore += val;
        answeredCount++;
        domainScores[q.domainId].raw += val;
        domainScores[q.domainId].count++;
      }
    }
  });

  // Calculate Interpretation
  // 117 to 195: اضطراب المعالجة الحسية بدرجة (بسيطة)
  // 196 to 273: اضطراب المعالجة الحسية بدرجة (متوسطة)
  // 274 to 351: اضطراب المعالجة الحسية بدرجة (شديدة)
  
  let level = 'طبيعي / غير محدد';
  let severityColor = '#94a3b8';
  
  if (totalRawScore >= 117 && totalRawScore <= 195) {
    level = 'اضطراب المعالجة الحسية بدرجة (بسيطة)';
    severityColor = '#3b82f6';
  } else if (totalRawScore >= 196 && totalRawScore <= 273) {
    level = 'اضطراب المعالجة الحسية بدرجة (متوسطة)';
    severityColor = '#f59e0b';
  } else if (totalRawScore >= 274) {
    level = 'اضطراب المعالجة الحسية بدرجة (شديدة)';
    severityColor = '#ef4444';
  }

  const maxPossible = SENSORY_CHECKLIST_ITEMS.length * 3;
  const minPossible = SENSORY_CHECKLIST_ITEMS.length * 1;
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  const subscales = Object.values(domainScores).map(d => {
    const dItems = SENSORY_CHECKLIST_ITEMS.filter(x => x.domainId === d.id);
    const dMax = dItems.length * 3;
    const dMin = dItems.length * 1;
    const dPerc = dMax > 0 ? Math.round((d.raw / dMax) * 100) : 0;
    
    // Calculate descriptive level for domain if needed, typically based on percentages or thresholds
    // Assuming simple linear mapping for domains if no specific subscale cutoffs are provided
    let dLvl = 'طبيعي';
    let dCol = '#10b981';
    
    // Rough estimate logic for domain severity based on total score thresholds proportionally
    const relativeRaw = d.raw / dMax;
    if (relativeRaw > 0.78) { // 274/351 = ~0.78
        dLvl = 'شديد';
        dCol = '#ef4444';
    } else if (relativeRaw > 0.55) { // 196/351 = ~0.55
        dLvl = 'متوسط';
        dCol = '#f59e0b';
    } else if (relativeRaw >= 0.33) {
        dLvl = 'بسيط';
        dCol = '#3b82f6';
    }

    return {
      ...d,
      maxRaw: dMax,
      minRaw: dMin,
      percentage: dPerc,
      level: dLvl,
      color: dCol
    };
  });

  return {
    totalRawScore,
    answeredCount,
    maxPossible,
    minPossible,
    percentage,
    level,
    severityColor,
    subscales
  };
}
