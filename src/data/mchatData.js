/**
 * M-CHAT-R/F (Modified Checklist for Autism in Toddlers, Revised with Follow-Up)
 * قائمة تفقد التوحد المعدلة للأطفال الصغار (النسخة الحديثة المعتمدة مع المقابلة التتبعية)
 * 
 * المراجع العلمية والاعتماد الأصلي:
 * - Diana L. Robins, Ph.D., Deborah Fein, Ph.D., & Marianne Barton, Ph.D. (2009 / 2014)
 * - الفئة المستهدفة: الأطفال الصغار من عمر 16 إلى 30 شهراً (1.5 إلى 2.5 سنة).
 * - الهدف الإكلينيكي: المسح المبكر المقنن لتحديد مستوى الخطر لإصابة الطفل باضطراب طيف التوحد (ASD).
 */

export const MCHAT_COPYRIGHT_INFO = {
  scaleTitleAr: 'قائمة تفقد التوحد المعدلة للأطفال الصغار — النسخة الحديثة المعتمدة (M-CHAT-R/F)',
  scaleTitleEn: 'Modified Checklist for Autism in Toddlers, Revised with Follow-Up (M-CHAT-R/F)',
  authorsAr: 'د. ديانا روبينز، د. ديبورا فاين، د. ماريان بارتون',
  authorsEn: 'Diana L. Robins, Ph.D., Deborah Fein, Ph.D., & Marianne Barton, Ph.D.',
  publisherAr: 'الأكاديمية الأمريكية لطب الأطفال (AAP) / مركز أبحاث التوحد بجامعة دريكسل',
  targetAge: 'الأطفال من 16 إلى 30 شهراً (1.5 - 2.5 سنة)',
  adaptationAr: 'النسخة العربية المقننة والمعتمدة رسمياً للتقييم والتشخيص الإكلينيكي',
  standardsReference: 'متوافق مع معايير الجمعية الأمريكية لطب الأطفال (AAP) للتشخيص والمسح المبكر للتوحد',
  notice: 'M-CHAT-R/F هي أداة مسح واكتشاف مبكر مقننة عالمياً. النتائج تعكس درجة الخطر (منخفض، متوسط، مرتفع) ولا تعتبر تشخيصاً نهائياً مطلقاً دون إجراء التقييم التشخيصي الشامل (Diagnostic Evaluation).',
  disclaimer: 'تستوجب الحالات ذات الخطر المتوسط إجراء المقابلة التتبعية (M-CHAT-R/F Follow-Up Interview)، بينما تحال الحالات ذات الخطر المرتفع مباشرة للتقييم الإكلينيكي والتدخل المبكر.',
};

export const MCHAT_DOMAINS = [
  {
    id: 'social_joint_attention',
    code: 'MCHAT-JA',
    name: 'التواصل الاجتماعي والاهتمام المشترك',
    nameEn: 'Social Communication & Joint Attention',
    description: 'تقييم مهارات الإشارة باليد، تتبع النظرات، الاستجابة للاسم، ومشاركة الاهتمام مع الآخرين.',
    color: '#2563eb',
    itemCount: 10,
  },
  {
    id: 'social_play_interaction',
    code: 'MCHAT-SPI',
    name: 'التفاعل الاجتماعي واللعب الإيهامي',
    nameEn: 'Social Interaction & Pretend Play',
    description: 'تقييم الاهتمام بالأقران، التفاعل المتبادل، التقليد، ولعب التظاهر والإيهام.',
    color: '#7c3aed',
    itemCount: 4,
  },
  {
    id: 'motor_sensory_behavioral',
    code: 'MCHAT-MSB',
    name: 'النمو الحركي والحسي والسلوكي',
    nameEn: 'Motor, Sensory & Behavioral Symptoms',
    description: 'تقييم الاستجابة السمعية للضوضاء، الاستجابات البصرية والأصابع، الحركة، والأنشطة.',
    color: '#059669',
    itemCount: 6,
  },
];

export const MCHAT_ITEMS = [
  {
    id: 1,
    code: 'Q1',
    text: 'إذا أشرت إلى شيء ما في الغرفة، هل ينظر طفلك إليه؟',
    example: 'مثال: إذا أشرت إلى لعبة أو حيوان أو طائرة، هل ينظر الطفل إلى الشيء الذي تشير إليه وليس إلى يدك؟',
    domainId: 'social_joint_attention',
    failResponse: 'NO', // 'NO' indicates risk
  },
  {
    id: 2,
    code: 'Q2',
    text: 'هل تساءلت يوماً عما إذا كان طفلك أصم (يعاني من مشكلة في السمع)؟',
    example: 'مثال: هل يتجاهل الأصوات أو تناديه بانتظام دون أي استجابة كأنه لا يسمع؟',
    domainId: 'motor_sensory_behavioral',
    failResponse: 'YES', // 'YES' indicates risk
  },
  {
    id: 3,
    code: 'Q3',
    text: 'هل يلعب طفلك ألعاب التظاهر أو الإيهام؟',
    example: 'مثال: التظاهر بالشرب من كوب فارغ، التظاهر بالتحدث في الهاتف، أو إطعام دمية أو سيارة؟',
    domainId: 'social_play_interaction',
    failResponse: 'NO',
  },
  {
    id: 4,
    code: 'Q4',
    text: 'هل يحب طفلك التسلق على الأشياء؟',
    example: 'مثال: التسلق على قطع الأثاث، أو السلالم، أو ألعاب الحديقة والمجموعات الحركية؟',
    domainId: 'motor_sensory_behavioral',
    failResponse: 'NO',
  },
  {
    id: 5,
    code: 'Q5',
    text: 'هل يقوم طفلك بحركات غير عادية بأصابعه بالقرب من عينيه؟',
    example: 'مثال: هل يلوح بأصابعه أو يهزها بالقرب من عينيه بطريقة غريبة أو رفرفة غير مألوفة؟',
    domainId: 'motor_sensory_behavioral',
    failResponse: 'YES', // 'YES' indicates risk
  },
  {
    id: 6,
    code: 'Q6',
    text: 'هل يشير طفلك بإصبعه ليشير إلى رغبته في الحصول على شيء أو لطلب المساعدة؟',
    example: 'مثال: الإشارة بإصبع السبابة إلى لعبة أو حلوى بعيدة عن متناوله كي تعطيه إياها؟',
    domainId: 'social_joint_attention',
    failResponse: 'NO',
  },
  {
    id: 7,
    code: 'Q7',
    text: 'هل يشير طفلك بإصبعه ليلفت انتباهك إلى شيء يثير اهتمامه؟',
    example: 'مثال: الإشارة إلى طائرة تنطير في السماء، أو سيارة كبيرة تمر بالشارع لمشاركتك الإعجاب (ليس فقط لطلبه)؟',
    domainId: 'social_joint_attention',
    failResponse: 'NO',
  },
  {
    id: 8,
    code: 'Q8',
    text: 'هل يبدي طفلك اهتماماً بالأطفال الآخرين؟',
    example: 'مثال: التحديق بالأطفال الآخرين، الابتسام لهم، الاقتراب منهم، أو محاولة اللعب معهم؟',
    domainId: 'social_play_interaction',
    failResponse: 'NO',
  },
  {
    id: 9,
    code: 'Q9',
    text: 'هل يعرض طفلك عليك الأشياء عن طريق إحضارها لك أو رفعها لكي تراها؟',
    example: 'مثال: إحضار لعبة أو صورة لكي تراها لمشاركتك الاهتمام وليس لطلب إصلاحها أو المساعدة؟',
    domainId: 'social_joint_attention',
    failResponse: 'NO',
  },
  {
    id: 10,
    code: 'Q10',
    text: 'هل يستجيب طفلك عندما تناديه باسمه؟',
    example: 'مثال: هل ينظر إليك، أو يتكلم، أو يتوقف عما يفعله عندما تناديه باسمه بدلاً من التجاهل التام؟',
    domainId: 'social_joint_attention',
    failResponse: 'NO',
  },
  {
    id: 11,
    code: 'Q11',
    text: 'عندما تبتسم لطفلك، هل يبتسم لك في المقابل؟',
    example: 'مثال: تبادل الابتسامات والتعابير الوجهية الإيجابية عند التفاعل المباشر معه؟',
    domainId: 'social_joint_attention',
    failResponse: 'NO',
  },
  {
    id: 12,
    code: 'Q12',
    text: 'هل ينزعج طفلك من الضوضاء اليومية المعتادة؟',
    example: 'مثال: الصراخ أو البكاء أو تغطية الأذنين بشدة عند سماع المكنسة الكهربائية، الخلاط، أو الموسيقى؟',
    domainId: 'motor_sensory_behavioral',
    failResponse: 'YES', // 'YES' indicates risk
  },
  {
    id: 13,
    code: 'Q13',
    text: 'هل يمشي طفلك بمفرده؟',
    example: 'مثال: المشي المستقل دون الحاجة لمسكه أو الاستناد على الجدران والأثاث؟',
    domainId: 'motor_sensory_behavioral',
    failResponse: 'NO',
  },
  {
    id: 14,
    code: 'Q14',
    text: 'هل ينظر طفلك في عينيك عندما تتحدث معه، أو تلعب معه، أو تلبسه؟',
    example: 'مثال: التواصل البصري المباشر والمركّز أثناء التفاعل اليومي ورعاية الطفل؟',
    domainId: 'social_joint_attention',
    failResponse: 'NO',
  },
  {
    id: 15,
    code: 'Q15',
    text: 'هل يحاول طفلك تقليد ما تفعله؟',
    example: 'مثال: التلويح بيده بـ "باي باي"، التصفيك، مسح الوجه، أو تقليد الأصوات والتعابير؟',
    domainId: 'social_play_interaction',
    failResponse: 'NO',
  },
  {
    id: 16,
    code: 'Q16',
    text: 'إذا أدرت رأسك لتنظر إلى شيء ما، هل يدير طفلك رأسه ليرى ما تنظر إليه؟',
    example: 'مثال: تتبع اتجاه نظرات الوالدين لاستكشاف ما يلفت انتباههما في المكان؟',
    domainId: 'social_joint_attention',
    failResponse: 'NO',
  },
  {
    id: 17,
    code: 'Q17',
    text: 'هل يحاول طفلك إجبارك على النظر إليه؟',
    example: 'مثال: النظر إليك وانتظار المدح، أو سحب يدك، أو إظهار شيء لك ليحصل على اهتمامك؟',
    domainId: 'social_joint_attention',
    failResponse: 'NO',
  },
  {
    id: 18,
    code: 'Q18',
    text: 'هل يفهم طفلك عندما تطلب منه القيام بشيء شفهي بسيط؟',
    example: 'مثال: فهم تعليمات مثل "ضع الكوب على الطاولة" أو "أحضر حذاءك" بدون استخدام الإشارات؟',
    domainId: 'motor_sensory_behavioral',
    failResponse: 'NO',
  },
  {
    id: 19,
    code: 'Q19',
    text: 'إذا حدث شيء غريب أو غير متوقع، هل ينظر طفلك في وجهك ليرى رد فعلك؟',
    example: 'مثال: إذا سمع ضوضاء المفاجئة أو رأى لعبة جديدة، هل ينظر لوجهك ليتفقد انطباعك (المرجعية الاجتماعية)؟',
    domainId: 'social_joint_attention',
    failResponse: 'NO',
  },
  {
    id: 20,
    code: 'Q20',
    text: 'هل يحب طفلك الأنشطة الحركية والتفاعلية التشاركية؟',
    example: 'مثال: هزّه أو أرجحته أو دغدغته أو رفعه لأعلى أو القفز على ركبتيك مع الضحك والمطالبة بالمزيد؟',
    domainId: 'social_play_interaction',
    failResponse: 'NO',
  },
];

/**
 * Real-time Psychometrics & Risk Level Calculation for M-CHAT-R/F
 * 
 * Cutoffs & Decision Logic:
 * - Total Failures (Risk Points) range: 0 to 20
 * - 0 to 2: Low Risk (خطر منخفض)
 * - 3 to 7: Medium Risk (خطر متوسط) -> Follow-Up Interview Required
 * - 8 to 20: High Risk (خطر مرتفع) -> Direct Diagnostic Evaluation
 */
export function calculateMChatPsychometrics(scores = {}) {
  let totalAnswered = 0;
  let totalFailures = 0; // Total risk points

  const itemResults = {};
  const domainStats = MCHAT_DOMAINS.map(d => ({
    id: d.id,
    code: d.code,
    name: d.name,
    color: d.color,
    totalItems: 0,
    answeredCount: 0,
    failCount: 0,
    passCount: 0,
  }));

  const domainMap = Object.fromEntries(domainStats.map(d => [d.id, d]));

  MCHAT_ITEMS.forEach(item => {
    const rawVal = scores[item.id] || scores[String(item.id)];
    const dom = domainMap[item.domainId];
    if (dom) dom.totalItems++;

    if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
      totalAnswered++;
      if (dom) dom.answeredCount++;

      const valUpper = String(rawVal).trim().toUpperCase();
      const isFail = valUpper === item.failResponse;

      if (isFail) {
        totalFailures++;
        if (dom) dom.failCount++;
      } else {
        if (dom) dom.passCount++;
      }

      itemResults[item.id] = {
        value: valUpper,
        isFail,
        failResponse: item.failResponse,
      };
    }
  });

  const completionPercentage = Math.round((totalAnswered / MCHAT_ITEMS.length) * 100);

  // Risk Classification
  let riskKey = 'low';
  let riskTitle = 'خطر منخفض جداً (Low Risk)';
  let riskColor = '#059669'; // Green
  let riskBadgeClass = 'b-gr';
  let recommendationSummary = '';
  let clinicalAction = '';

  if (totalFailures <= 2) {
    riskKey = 'low';
    riskTitle = 'خطر منخفض (Low Risk)';
    riskColor = '#059669';
    riskBadgeClass = 'b-gr';
    recommendationSummary = 'النتيجة تقع ضمن النطاق الطبيعي وخطر التوحد منخفض. إذا كان الطفل أقل من 24 شهراً، ينصح بإعادة المسح عند بلوغ 24 شهراً. لا تلزم إجراءات إضافية ما لم يلاحظ الوالدان أو الطبيب أي مؤشرات مقلقة.';
    clinicalAction = 'إعادة المسح عند عمر 24 شهراً إذا كان أقل من ذلك. المتابعة النمائية الاعتيادية.';
  } else if (totalFailures <= 7) {
    riskKey = 'medium';
    riskTitle = 'خطر متوسط (Medium Risk)';
    riskColor = '#d97706';
    riskBadgeClass = 'b-or';
    recommendationSummary = `حصل الطفل على (${totalFailures}) نقاط خطر (إخفاقات)، مما يضعه في فئة الخطر المتوسط. يتوجب إجراء المقابلة التتبعية M-CHAT-R/F Follow-Up للبنود التي أخفق فيها الطفل. إذا ظلت نتيجة المقابلة التتبعية 2 أو أكثر، يُحَال الطفل فوراً للتقييم التشخيصي الشامل والتدخل المبكر.`;
    clinicalAction = 'تطبيق المقابلة التتبعية M-CHAT-R/F Follow-Up Interview وإجراء الإحالة عند تأكد النتيجة.';
  } else {
    riskKey = 'high';
    riskTitle = 'خطر مرتفع جداً (High Risk)';
    riskColor = '#dc2626';
    riskBadgeClass = 'b-rd';
    recommendationSummary = `حصل الطفل على (${totalFailures}) نقاط خطر (إخفاقات) من أصل 20 بنداً، مما يضعه في فئة الخطر المرتفع جداً. يجب تجاوز المقابلة التتبعية والإحالة الفورية والتقييم التشخيصي الشامل (Diagnostic Evaluation) والبدء في خدمات التدخل المبكر (Early Intervention).`;
    clinicalAction = 'إحالة فورية وعاجلة للتقييم التشخيصي الشامل (Diagnostic Evaluation) وتصميم خطة تدخل مبكر فردية.';
  }

  return {
    totalItems: MCHAT_ITEMS.length,
    totalAnswered,
    completionPercentage,
    totalFailures,
    riskKey,
    riskTitle,
    riskColor,
    riskBadgeClass,
    recommendationSummary,
    clinicalAction,
    domainStats,
    itemResults,
  };
}
