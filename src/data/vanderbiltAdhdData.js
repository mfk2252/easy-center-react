// مقياس فاندربرلت لتشخيص فرط الحركة وتشتت الانتباه (Vanderbilt ADHD Diagnostic Parent Rating Scale - Open Access)

export const VANDERBILT_DOMAINS = [
  { id: 'inattention', title: 'قصور وتشتت الانتباه (Inattention)' },
  { id: 'hyperactivity', title: 'فرط الحركة والاندفاعية (Hyperactivity/Impulsivity)' },
  { id: 'odd_conduct', title: 'السلوك المعارض والعناد (ODD/Conduct)' },
];

export const VANDERBILT_ITEMS = [
  // قنور الانتباه (Inattention: Items 1-9)
  { id: 'v1', text: 'يفشل في إعلاء انتباه دقيق للتفاصيل أو يرتكب أخطاء عن عدم احتراس في الواجبات والأنشطة.', domainId: 'inattention' },
  { id: 'v2', text: 'يواجه صعوبة في الحفاظ على الانتباه في المهام أو أنشطة اللعب.', domainId: 'inattention' },
  { id: 'v3', text: 'يبدو كأنه لا يستمع عندما يتم التحدث إليه مباشرة.', domainId: 'inattention' },
  { id: 'v4', text: 'لا يتبع التعليمات بشكل كامل ويفشل في إتمام الواجبات أو الأعمال الموكلة إليه.', domainId: 'inattention' },
  { id: 'v5', text: 'يجد صعوبة في تنظيم المهام والأنشطة وتنسيق خطوات العمل.', domainId: 'inattention' },
  { id: 'v6', text: 'يتجنب أو يكره أو يتردد في الانخراط في المهام التي تطلب جهداً عقلياً مستمراً.', domainId: 'inattention' },
  { id: 'v7', text: 'يفقد الأشياء والضروريات اللازمة للمهام أو الأنشطة (مثل: الأدوات، الكتب، الألعاب).', domainId: 'inattention' },
  { id: 'v8', text: 'يتشتت انتباهه بسهولة بالمثيرات الخارجية العارضة.', domainId: 'inattention' },
  { id: 'v9', text: 'كثير النسيان في الأنشطة والمهام اليومية المعتادة.', domainId: 'inattention' },

  // فرط الحركة والاندفاعية (Hyperactivity/Impulsivity: Items 10-18)
  { id: 'v10', text: 'يتململ ويتفركك بيده أو قدميه أو يتحرك في مقعده.', domainId: 'hyperactivity' },
  { id: 'v11', text: 'يترك مقعده في المواقف التي يُتوقع فيها البقاء جالساً.', domainId: 'hyperactivity' },
  { id: 'v12', text: 'يجري أو يتسلق في مواقف غير مناسبة بشكل مفرط.', domainId: 'hyperactivity' },
  { id: 'v13', text: 'يجد صعوبة في اللعب أو المشاركة في أنشطة الترفيه بهدوء.', domainId: 'hyperactivity' },
  { id: 'v14', text: 'دائم الحركة ويتحرك وكأنه يدار بمحرك (On the go).', domainId: 'hyperactivity' },
  { id: 'v15', text: 'يتحدث بشكل مفرط ومستمر بدون توقف.', domainId: 'hyperactivity' },
  { id: 'v16', text: 'يتسرع بتقديم الإجابة قبل اكتمال طرح السؤال.', domainId: 'hyperactivity' },
  { id: 'v17', text: 'يواجه صعوبة بالغة في انتظار دوره في الصف أو اللعب.', domainId: 'hyperactivity' },
  { id: 'v18', text: 'يقاطع حديث الآخرين أو يتطفل على أنشطتهم وألعابهم.', domainId: 'hyperactivity' },

  // العناد والسلوك المعارض (ODD / Conduct: Items 19-27)
  { id: 'v19', text: 'يفقد أعصابه ويتملكه الغضب بسرعة وبصورة متكررة.', domainId: 'odd_conduct' },
  { id: 'v20', text: 'جادل البالغين والمسؤولين ويتحدى سلطتهم.', domainId: 'odd_conduct' },
  { id: 'v21', text: 'يرفض بغضب التجاوب مع طلبات القواعد أو تعليمات الكبار.', domainId: 'odd_conduct' },
  { id: 'v22', text: 'يتعمد إزعاج ومضايقة الآخرين بدون سبب مبرر.', domainId: 'odd_conduct' },
  { id: 'v23', text: 'يلوم الآخرين على أخطائه أو سوء تصرفاته.', domainId: 'odd_conduct' },
  { id: 'v24', text: 'سريع الحساسية وسهل الانزعاج من تصرفات الآخرين.', domainId: 'odd_conduct' },
  { id: 'v25', text: 'غاضب أو محبط أو مستاء في كثير من الأوقات.', domainId: 'odd_conduct' },
  { id: 'v26', text: 'يظهر سلوكيات حاقدة أو انتقامية تجاه أقرانه.', domainId: 'odd_conduct' },
  { id: 'v27', text: 'يتنمر أو يهدد الآخرين لفظياً أو جسدياً.', domainId: 'odd_conduct' },
];

export function calculateVanderbiltScore(answers = {}) {
  let inattentionScore = 0;
  let hyperactivityScore = 0;
  let oddConductScore = 0;
  let answeredCount = 0;

  VANDERBILT_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      if (item.domainId === 'inattention') inattentionScore += val;
      else if (item.domainId === 'hyperactivity') hyperactivityScore += val;
      else if (item.domainId === 'odd_conduct') oddConductScore += val;
      answeredCount++;
    }
  });

  const totalRawScore = inattentionScore + hyperactivityScore + oddConductScore;
  const maxPossible = VANDERBILT_ITEMS.length * 3; // 27 * 3 = 81

  let level = 'ضمن الحد الطبيعي';
  let severityColor = '#16a34a';

  if (inattentionScore >= 15 && hyperactivityScore >= 15) {
    level = 'مؤشرات إيجابية عالية لاضطراب فرط الحركة وتشتت الانتباه (النمط المركب Combined Type)';
    severityColor = '#dc2626';
  } else if (inattentionScore >= 15) {
    level = 'مؤشرات إيجابية بارزة لنقص وتشتت الانتباه (Inattentive Subtype)';
    severityColor = '#ea580c';
  } else if (hyperactivityScore >= 15) {
    level = 'مؤشرات إيجابية بارزة لفرط الحركة والاندفاعية (Hyperactive-Impulsive Subtype)';
    severityColor = '#ea580c';
  } else if (totalRawScore >= 35) {
    level = 'أعراض حدية تتطلب ملاحظة وتقييماً متعمقاً';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    inattentionScore,
    hyperactivityScore,
    oddConductScore,
    maxPossible,
    answeredCount,
    level,
    severityColor,
    interpretation: `نتيجة مقياس فاندربرلت: قصور الانتباه (${inattentionScore}/27)، فرط الحركة (${hyperactivityScore}/27)، العناد/المعارضة (${oddConductScore}/27). التقييم التشخيصي: ${level}.`,
  };
}
