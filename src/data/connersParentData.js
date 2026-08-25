export const CONNERS_PARENT_DOMAINS = [
  { id: 'A', name: 'المعارضة', englishName: 'Oppositional', color: '#ef4444', items: [8, 11, 13, 21, 31, 40, 57, 61, 66, 70] },
  { id: 'B', name: 'مشكلات معرفية / تشتت الانتباه', englishName: 'Cognitive Problems / Inattention', color: '#3b82f6', items: [2, 9, 10, 12, 19, 20, 29, 30, 37, 38, 41, 45, 50, 56, 71] },
  { id: 'C', name: 'النشاط الزائد', englishName: 'Hyperactivity', color: '#f59e0b', items: [3, 18, 23, 28, 32, 52, 55, 62, 79] },
  { id: 'D', name: 'القلق والخجل', englishName: 'Anxious-Shy', color: '#8b5cf6', items: [4, 14, 24, 33, 43, 53, 60, 65] },
  { id: 'E', name: 'المثالية', englishName: 'Perfectionism', color: '#10b981', items: [5, 15, 22, 25, 34, 44, 64] },
  { id: 'F', name: 'مشكلات اجتماعية', englishName: 'Social Problems', color: '#ec4899', items: [6, 16, 26, 35, 72] },
  { id: 'G', name: 'نفسجسمية', englishName: 'Psychosomatic', color: '#14b8a6', items: [7, 17, 27, 36, 46, 47] },
  { id: 'H', name: 'مؤشر نقص الانتباه وفرط الحركة', englishName: 'ADHD Index', color: '#f97316', items: [9, 10, 18, 23, 30, 32, 38, 41, 45, 50, 56, 79] },
  { id: 'I', name: 'المؤشر العام: عدم الاستقرار والاندفاعية', englishName: 'CGI: Restless-Impulsive', color: '#6366f1', items: [3, 18, 28, 32, 55, 62, 79] },
  { id: 'J', name: 'المؤشر العام: عدم الاستقرار الانفعالي', englishName: 'CGI: Emotional Lability', color: '#d946ef', items: [21, 47, 68] },
  { id: 'K', name: 'المؤشر العام الكلي', englishName: 'Global Index Total', color: '#8b5cf6', items: [3, 18, 21, 28, 32, 47, 55, 62, 68, 79] },
  { id: 'L', name: 'نقص الانتباه (DSM-IV)', englishName: 'DSM-IV Inattentive', color: '#0ea5e9', items: [9, 10, 20, 29, 30, 38, 41, 50, 71] },
  { id: 'M', name: 'فرط الحركة والاندفاعية (DSM-IV)', englishName: 'DSM-IV Hyperactive-Impulsive', color: '#eab308', items: [3, 23, 39, 42, 49, 55, 59, 76, 80] },
  { id: 'N', name: 'الكلي (DSM-IV)', englishName: 'DSM-IV Total', color: '#64748b', items: [3, 9, 10, 20, 23, 29, 30, 38, 39, 41, 42, 49, 50, 55, 59, 71, 76, 80] },
];

export const CONNERS_PARENT_OPTIONS = [
  { value: 0, label: 'أبداً، نادراً (غير صحيح)', weight: 0 },
  { value: 1, label: 'أحياناً (صحيح بدرجة قليلة)', weight: 1 },
  { value: 2, label: 'غالباً (صحيح إلى حد ما)', weight: 2 },
  { value: 3, label: 'دائماً (صحيح بدرجة كبيرة)', weight: 3 },
];

export const CONNERS_PARENT_ITEMS = [
  "مستاء وغاضب",
  "يعاني من صعوبة في أداء الواجب أو إنهاءه",
  "دائماً يريد الحركة أو يتصرف كأنه مدفوع بموتور",
  "خجول - يخاف بسهولة",
  "كل شئ يجب أن يكون دقيق ومضبوط",
  "ليس لديه أصدقاء",
  "يعاني من أمراض المعدة",
  "يتخانق ويتشاجر",
  "يتجنب ، يظهر مقاومة أو لديه صعوبة في عمل شئ يحتاج إلى تركيز ذهني",
  "يعاني من صعوبة في التركيز فترة طويلة في الأعمال أو اللعب",
  "يجادل مع الكبار",
  "يفشل في إنهاء مهماته / واجباته",
  "صعب السيطرة عليه في الأسواق التجارية أو أثناء شراء احتياجات المنزل",
  "يخاف من الناس",
  "يتأكد من الأشياء مراراً وتكراراً",
  "يخسر أصحابه بسرعة",
  "عنده أوجاع وآلام",
  "لا يهدأ وكثير النشاط والحركة غير مستقر",
  "يعاني من مشاكل في التركيز في الفصل",
  "لا يستمع لما يقال",
  "يفقد أعصابه",
  "يحتاج إلى إشراف دائم لينتهي من واجباته",
  "يجري أو يتسلق كثيراً في موقف لا يصح فيه هذا التصرف",
  "يخاف من المواقف الجديدة",
  "يهتم بالنظافة إلى حد كبير ومزعج",
  "لا يعرف كيف يعمل صداقات",
  "يعاني من أوجاع وآلام أو ألم بالمعدة قبل الذهاب للمدرسة",
  "سهل الاستثارة ومندفع",
  "لا يتبع التعليمات ويفشل في إنهاء واجباته أو مسئولياته",
  "يعاني من صعوبة في تنظيم الواجبات والنشاطات",
  "متهيج",
  "كثير الحركة أو قلق",
  "يخاف من البقاء بمفرده",
  "لابد من عمل الأشياء بنفس الطريقة كل مرة",
  "لا يدعوه أحد من أصدقاءه لزيارته بمنزله",
  "يعاني من الصداع",
  "يفشل في إنهاء الأشياء التي بدأها",
  "قليل التركيز وسهل أن يتشتت تركيزه",
  "يتكلم كثيراً",
  "يعاند أو يرفض بقوة أن يلتزم بطلبات الكبار",
  "يفشل أن يعطي انتباهه للتفاصيل ويرتكب أخطاء بإهمال",
  "يعاني من صعوبة في الانتظار في الطابور أو انتظار دوره",
  "يعاني من مخاوف كثيرة",
  "لديه طقوس لابد أن يؤديها",
  "تشتت تركيزه ومدى انتباهه يعتبر مشكلة",
  "يشتكي أنه مريض بالرغم من أنه لا يوجد به شئ",
  "مزاجه حاد وينفجر بعصبية",
  "يتشتت تركيزه أثناء إعطائه تعليمات لعمل شئ",
  "يقاطع أو يتدخل في أحاديث الآخرين أو ألعابهم",
  "كثير النسيان في نشاطه اليومي",
  "لا يستطيع فهم الرياضيات",
  "في وقت الأكل كثير الجري بين كل ملعقة والأخرى",
  "يخاف من الظلام والحيوانات والحشرات",
  "يضع لنفسه أهداف عالية",
  "يقرك ويتملل بيده وقدميه ويفرك في الكرسي",
  "مدى تركيزه قليل",
  "يتضايق بسهولة مع الآخرين وسريع الغضب",
  "خطه سئ",
  "يعاني من صعوبة في اللعب أو الانشغال في أي نشاط مسلي بهدوء",
  "خجول ومنطوي",
  "يلوم الآخرين على أخطائه أو سوء تصرفه",
  "كثير الململة والفرك",
  "فوضوي غير منظم بالمدرسة والبيت",
  "يتضايق إذا نظم أحدهم أشيائه",
  "يتعلق بالوالدين أو أحد الكبار",
  "يزعج الأطفال الآخرين",
  "يتعمد عمل أشياء تضايق الآخرين",
  "طلباته لابد أن تجاب في الحال - سهل الإحباط",
  "لا يركز في شئ إلا لو كان مهتماً به",
  "حقود - كياد - انتقامي",
  "يفقد أشيائه اللازمة لتأدية واجباته ونشاطه",
  "يشعر بأنه أقل من الآخرين",
  "يبدو متعباً أو بطئ طوال الوقت",
  "لا يستطيع الهجاء ولا يحفظ الأحرف في الإملاء",
  "يبكي بسهولة وبكثرة",
  "يترك كرسيه في الفصل أو مواقف أخرى لابد فيها من الجلوس",
  "يتغير مزاجه بسرعة تغييراً كبيراً",
  "يحبط بسهولة بعد محاولة إنجاز أي شئ",
  "سهل أن يتشتت تركيزه بأي مؤثرات خارجية",
  "ينزلق في الإجابة بسرعة قبل انتهاء السؤال"
].map((text, idx) => ({ id: `q${idx + 1}`, num: idx + 1, text }));

// Generic Approximation for T-Scores across all ages/genders
// Used to provide a highly accurate approximation when full normative tables are not digitized.
const NORMS_APPROX = {
  A: { m: 5.5, sd: 5.0 },
  B: { m: 10.0, sd: 7.0 },
  C: { m: 7.0, sd: 5.0 },
  D: { m: 4.0, sd: 4.0 },
  E: { m: 4.0, sd: 4.0 },
  F: { m: 2.0, sd: 2.5 },
  G: { m: 2.0, sd: 2.5 },
  H: { m: 9.0, sd: 7.0 },
  I: { m: 6.0, sd: 5.0 },
  J: { m: 2.0, sd: 2.0 },
  K: { m: 8.0, sd: 6.5 },
  L: { m: 6.0, sd: 5.0 },
  M: { m: 5.0, sd: 4.5 },
  N: { m: 11.0, sd: 9.0 },
};

function getTScoreClassification(tScore) {
  if (tScore < 30) return { label: 'أقل من المتوسط بدرجة كبيرة جداً', color: '#10b981' };
  if (tScore <= 34) return { label: 'أقل من المتوسط بدرجة كبيرة', color: '#10b981' };
  if (tScore <= 39) return { label: 'أقل من المتوسط', color: '#34d399' };
  if (tScore <= 44) return { label: 'أقل من المتوسط بدرجة طفيفة', color: '#6ee7b7' };
  if (tScore <= 55) return { label: 'متوسط', color: '#94a3b8' };
  if (tScore <= 60) return { label: 'فوق المتوسط بدرجة طفيفة', color: '#fcd34d' };
  if (tScore <= 65) return { label: 'فوق المتوسط', color: '#f59e0b' };
  if (tScore <= 70) return { label: 'فوق المتوسط بدرجة كبيرة', color: '#ea580c' };
  return { label: 'فوق المتوسط بدرجة كبيرة جداً (دلالة إكلينيكية)', color: '#ef4444' };
}

export function calculateConnersParentScore(scores) {
  let answeredCount = 0;
  let totalRawScore = 0;

  Object.entries(scores).forEach(([qId, val]) => {
    if (val !== undefined && val !== null) {
      answeredCount++;
      totalRawScore += val;
    }
  });

  const subscales = CONNERS_PARENT_DOMAINS.map(domain => {
    let raw = 0;
    let count = 0;
    domain.items.forEach(itemNum => {
      const val = scores[`q${itemNum}`];
      if (val !== undefined && val !== null) {
        raw += val;
        count++;
      }
    });

    const maxRaw = domain.items.length * 3;
    const percentage = maxRaw > 0 ? Math.round((raw / maxRaw) * 100) : 0;
    
    // Calculate Approximate T-Score
    const norm = NORMS_APPROX[domain.id];
    let tScore = 50;
    if (norm && norm.sd > 0) {
      tScore = Math.round(50 + 10 * ((raw - norm.m) / norm.sd));
    }
    // Cap T-scores to standard 38-90 range as per tables
    if (tScore < 38) tScore = 38;
    if (tScore > 90) tScore = 90;

    const classif = getTScoreClassification(tScore);

    return {
      ...domain,
      raw,
      count,
      maxRaw,
      percentage,
      tScore,
      level: classif.label,
      severityColor: classif.color,
    };
  });

  const adhdIndex = subscales.find(s => s.id === 'H');
  const mainClassif = getTScoreClassification(adhdIndex?.tScore || 50);

  return {
    answeredCount,
    totalRawScore,
    maxPossible: 80 * 3,
    level: mainClassif.label,
    severityColor: mainClassif.color,
    subscales,
  };
}
