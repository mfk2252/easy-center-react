// مقياس التخطيط والتنظيم والتحكم في كبح الاستجابة (Executive Planning & Inhibition Scale)

export const EXECUTIVE_PLANNING_ITEMS = [
  { id: 'ep1', text: 'يحلل المشكلة ويحدد الخطوات المطلوبة للحل قبل البدء.', domainId: 'planning' },
  { id: 'ep2', text: 'يرتب الأولويات والأنشطة بحسب أهميتها وإمكانية تنفيذها.', domainId: 'planning' },
  { id: 'ep3', text: 'يحدد الأدوات والوسائل اللازمة لإتمام عمله مسبقاً.', domainId: 'planning' },
  { id: 'ep4', text: 'يدير الوقت المخصص لكل جزء من أجزاء النشاط بكفاءة.', domainId: 'planning' },
  { id: 'ep5', text: 'ينفذ المهام المترابطة بسلاسة وفق تسلسل منطقي وواضح.', domainId: 'planning' },
  { id: 'ep6', text: 'يلاحظ الأخطاء التي يرتكبها في خطته وينقحها بنفسه.', domainId: 'monitoring' },
  { id: 'ep7', text: 'يراجع إجاباته ونتائج عمله قبل تسليمها للأخصائي.', domainId: 'monitoring' },
  { id: 'ep8', text: 'يقيّم مستوى إنجازه بوعي وموضوعية مقارنة بالهدف.', domainId: 'monitoring' },
  { id: 'ep9', text: 'يتحكم في اندفاعه في الإجابة وينتظر التفكير الهادئ.', domainId: 'inhibition' },
  { id: 'ep10', text: 'يتوقف عن القيام بسلوك خاطئ بمجرد الانتباه لنتائجه.', domainId: 'inhibition' },
  { id: 'ep11', text: 'يقاوم المثيرات المشتتة ويواصل التركيز في مهمته الأساسية.', domainId: 'inhibition' },
  { id: 'ep12', text: 'يتجنب أفعال المخاطرة والاندفاعات التي قد تؤذيه.', domainId: 'inhibition' },
  { id: 'ep13', text: 'ينتظر مكافأته أو معززه دون تذمر حتى الانتهاء من العمل.', domainId: 'inhibition' },
  { id: 'ep14', text: 'يتحكم في ردات فعله عند تغيير اتجاه النشاط بشكل فجائي.', domainId: 'inhibition' },
  { id: 'ep15', text: 'يظهر تنظيماً ذاتياً وانضباطاً جلياً في سلوكه الأكاديمي واليومي.', domainId: 'monitoring' },
];

export function calculateExecutivePlanningScore(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  EXECUTIVE_PLANNING_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = EXECUTIVE_PLANNING_ITEMS.length * 3; // 15 * 3 = 45
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'قدرات تخطيط وانضباط تنفيذي ممتازة';
  let severityColor = '#16a34a';

  if (percentage < 45) {
    level = 'ضعف وتشتت في التخطيط وكبح الاستجابة يقتضي التدريب السلوكي المعرفي';
    severityColor = '#dc2626';
  } else if (percentage < 65) {
    level = 'قدرات تنظيم وتخطيط متوسطة تحتاج دعماً ومتابعة';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة مقياس التخطيط والكبح التنفيذي: ${totalRawScore} من 45 (${percentage}%). المهارات التنفيذية: ${level}.`,
  };
}
