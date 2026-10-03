// قائمة مهارات التخطيط الانتقالي والجاهزية للعمل (Transition Planning & Employability Scale)

export const TRANSITION_PLANNING_DOMAINS = [
  { id: 'work_habits', title: 'عادات وسلوكيات العمل والالتزام' },
  { id: 'communication', title: 'التواصل المهني والتعامل مع المشرف' },
  { id: 'independence', title: 'استقلالية الأداء والسلامة المهنية' },
];

export const TRANSITION_PLANNING_ITEMS = [
  // عادات العمل (Work Habits)
  { id: 'tp1', text: 'يحضر في الوقت المحدد للورشة أو مكان التدريب المهني دون تأخير.', domainId: 'work_habits' },
  { id: 'tp2', text: 'يحافظ على هندامه ونظافته الشخصية والمظهر المناسب لبيئة العمل.', domainId: 'work_habits' },
  { id: 'tp3', text: 'يستمر في أداء المهمة الموكلة إليه للفترة الزمنية المطلوبة دون تشتت.', domainId: 'work_habits' },
  { id: 'tp4', text: 'يرتب الأدوات وطاولة العمل ويحافظ على نظافة موقع تدريبه.', domainId: 'work_habits' },
  { id: 'tp5', text: 'يظهر رغبة ودافعية جيدة للتعلم وتطوير مهاراته المهنية.', domainId: 'work_habits' },
  { id: 'tp6', text: 'يتقبل التوجيهات والملاحظات من مدرب المهنة بروح إيجابية.', domainId: 'work_habits' },
  { id: 'tp7', text: 'يتحمل الإجهاد البدني البسيط أثناء أداء العمل الموكل إليه.', domainId: 'work_habits' },

  // التواصل المهني (Professional Communication)
  { id: 'tp8', text: 'يتواصل بأسلوب ملائم ومحترم مع زملاء العمل والمدربين.', domainId: 'communication' },
  { id: 'tp9', text: 'يستفسر ويطلب المساعدة عند عدم فهم خطوات المهمة المطلوب تنفيذها.', domainId: 'communication' },
  { id: 'tp10', text: 'يستجيب لتعليمات السلامة المهنية الشفهية والمكتوبة/المصورة.', domainId: 'communication' },
  { id: 'tp11', text: 'يستأذن بأسلوب مناسب عند الحاجة لأخذ استراحة أو مغادرة الموقع.', domainId: 'communication' },
  { id: 'tp12', text: 'يتجنب الأحاديث الجانبية غير المتعلقة بالعمل أثناء ساعات التدريب.', domainId: 'communication' },
  { id: 'tp13', text: 'يعبر عن مشاكله واحتياجاته في العمل بأسلوب هادئ وغير عدواني.', domainId: 'communication' },

  // الاستقلالية والسلامة (Independence & Safety)
  { id: 'tp14', text: 'يستخدم أدوات العمل الأساسية بأمان دون تعريض نفسه أو الآخرين للخطر.', domainId: 'independence' },
  { id: 'tp15', text: 'يرتدي معدات الوقاية الشخصية (مثل: القفازات، النظارات، الخوذة) عند الحاجة.', domainId: 'independence' },
  { id: 'tp16', text: 'يتنقل بمفرده وبأمان بين أقسام المركز أو موقع التدريب.', domainId: 'independence' },
  { id: 'tp17', text: 'يتعرف على إشارات ومخارج الطوارئ ويتبع خطة الإخلاء عند الضرورة.', domainId: 'independence' },
  { id: 'tp18', text: 'يدير وقته ومواعيد استراحته بمسؤولية ذاتية.', domainId: 'independence' },
  { id: 'tp19', text: 'يتعامل بوعي مع ممتلكات وأجهزة العمل دون إتلافها.', domainId: 'independence' },
  { id: 'tp20', text: 'يظهر جاهزية للانتقال للتوظيف المدعوم أو التوظيف المستقل في سوق العمل.', domainId: 'independence' },
];

export function calculateTransitionPlanningScore(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  TRANSITION_PLANNING_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = TRANSITION_PLANNING_ITEMS.length * 3; // 20 * 3 = 60
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'جاهزية عالية للتوظيف والانتقال لسوق العمل';
  let severityColor = '#16a34a';

  if (percentage < 45) {
    level = 'جاهزية مهنية منخفضة (يحتاج برنامج تأهيل وانتقال مكثف)';
    severityColor = '#dc2626';
  } else if (percentage < 65) {
    level = 'جاهزية مهنية متوسطة (يحتاج تدريب موجه وتوظيف مدعوم)';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة التقييم الانتقالي والمهني: ${totalRawScore} من 60 (${percentage}%). مستوى الجاهزية المهنية: ${level}.`,
  };
}
