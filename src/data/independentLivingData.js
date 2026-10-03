// مقياس الميول المهنية والاستقلال في المعيشة المستقلة (Vocational Interests & Independent Living Scale)

export const INDEPENDENT_LIVING_ITEMS = [
  { id: 'il1', text: 'يميز فئات النقود والعملات الورقية والمعدنية المستعملة محلياً.', domainId: 'finance' },
  { id: 'il2', text: 'يحسب الباقي والمبلغ المسترد عند الشراء من المحلات.', domainId: 'finance' },
  { id: 'il3', text: 'يدير مصرووفه الشخصي ويوزعه بحكمة بين الأولويات.', domainId: 'finance' },
  { id: 'il4', text: 'يستخدم أجهزة الصراف الآلي أو الدفع الإلكتروني المباشر بوعي.', domainId: 'finance' },
  { id: 'il5', text: 'يستخدم وسائل المواصلات العامة أو حافلة المركز بأمان وبشكل مستقل.', domainId: 'travel' },
  { id: 'il6', text: 'يعرف الأسماء والاتجاهات الرئيسية في منطقته السكنية.', domainId: 'travel' },
  { id: 'il7', text: 'يعبر الشارع ويلتزم بإشارات المرور وممرات المشاة.', domainId: 'travel' },
  { id: 'il8', text: 'يستخدم الهاتف للاتصال بالأقارب وطوارئ الخدمة عند الحاجة.', domainId: 'communication' },
  { id: 'il9', text: 'يعد وجبة خفيفة ومشروباً لنفسه دون تعريض نفسه للحرق.', domainId: 'domestic' },
  { id: 'il10', text: 'يستخدم أدوات المطبخ البسيطة والأجهزة الكهربائية بأمان.', domainId: 'domestic' },
  { id: 'il11', text: 'ينظف ويغسل الأطباق والأكواب بعد الانتهاء من الوجبة.', domainId: 'domestic' },
  { id: 'il12', text: 'يغسل ملابسه الشخصية ويجففها ويرتبها في الخزانة.', domainId: 'domestic' },
  { id: 'il13', text: 'يشتري الاحتياجات والمواد الغذائية من السوبرماركت بناءً على قائمة.', domainId: 'community' },
  { id: 'il14', text: 'يعرف أوقات أخذ الدواء بانتظام ويتبع الإرشادات الصحية.', domainId: 'health' },
  { id: 'il15', text: 'يتعامل بحكمة مع الجروح والخدوش البسيطة واستخدام الضمادة.', domainId: 'health' },
  { id: 'il16', text: 'يختار الملابس المناسبة لحالة الطقس (حار/بارد/ممطر).', domainId: 'domestic' },
  { id: 'il17', text: 'يعبر عن الميول المهنية والأعمال التي يرغب بممارستها مستقبلاً.', domainId: 'vocational' },
  { id: 'il18', text: 'يواظب على أداء الأنشطة والتدريبات الموكلة إليه دون تكاسل.', domainId: 'vocational' },
  { id: 'il19', text: 'يدافع عن حقوقه واحتياجاته بأسلوب محترم وواضح (Self-Advocacy).', domainId: 'advocacy' },
  { id: 'il20', text: 'يظهر استقلالية كاملة في إدارة حياته اليومية داخل المجتمع.', domainId: 'independence' },
];

export function calculateIndependentLivingScore(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  INDEPENDENT_LIVING_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = INDEPENDENT_LIVING_ITEMS.length * 3; // 20 * 3 = 60
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'استقلالية معيشية ومهنية ممتازة';
  let severityColor = '#16a34a';

  if (percentage < 45) {
    level = 'احتياج لدعم مكثف وتدريب على مهارات المعيشة المستقلة';
    severityColor = '#dc2626';
  } else if (percentage < 65) {
    level = 'مستوى معيشي واستقلال مهني متوسط يتطلب تدريباً وتأهيلاً';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة مقياس المعيشة المستقلة والميول المهنية: ${totalRawScore} من 60 (${percentage}%). مستوى الاستقلال المعيشي: ${level}.`,
  };
}
