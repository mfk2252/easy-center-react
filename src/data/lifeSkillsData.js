// قائمة مهارات الاستقلالية والرعاية الذاتية للطفولة (Self-Independence & Life Skills Scale)

export const LIFE_SKILLS_ITEMS = [
  { id: 'ls1', text: 'ينظف أسنانه ويغسل يديه ووجهه بالماء والصابون بمفرده.', domainId: 'hygiene' },
  { id: 'ls2', text: 'يستخدم دورة المياه بمفرده ويعتني بنظافته الشخصية.', domainId: 'hygiene' },
  { id: 'ls3', text: 'يجفف يديه ووجهه بالمغسلة والمنديل بصورة مستقلة.', domainId: 'hygiene' },
  { id: 'ls4', text: 'يمشط شعره ويهتم بمظهره النظيف دون تذكير مستمر.', domainId: 'hygiene' },
  { id: 'ls5', text: 'يتناول طعامه بالملعقة والشوكة دون إحداث فوضى كبيرة.', domainId: 'feeding' },
  { id: 'ls6', text: 'يسكب الماء من الإبريق في الكوب دون إراقته.', domainId: 'feeding' },
  { id: 'ls7', text: 'يمسح الطاولة وينظف بقايا الطعام بعد الانتهاء من الوجبة.', domainId: 'feeding' },
  { id: 'ls8', text: 'يرتدي قميصه وبنطاله بصورة صحيحة بدون مساعدة.', domainId: 'dressing' },
  { id: 'ls9', text: 'يغلق الأزرار والسحاب ويربط حذاءه بمفرده.', domainId: 'dressing' },
  { id: 'ls10', text: 'يميز بين ملابس الخروج وملابس النوم والملابس المتسخة.', domainId: 'dressing' },
  { id: 'ls11', text: 'يضع ملابسه المتسخة في سلة الغسيل المخصصة.', domainId: 'dressing' },
  { id: 'ls12', text: 'يرتب سريره وغرفته وألعابه بعد الاستيقاظ أو اللعب.', domainId: 'independence' },
  { id: 'ls13', text: 'يحمل حقيبته وأغراضه المدرسية والمركز بنفسه.', domainId: 'independence' },
  { id: 'ls14', text: 'يتجنب الأجسام الحادة والأدوية والمواد الكيميائية المنزلية.', domainId: 'safety' },
  { id: 'ls15', text: 'ينظر يميناً ويساراً قبل عبور الشارع برفقة البالغين.', domainId: 'safety' },
  { id: 'ls16', text: 'يعرف اسم والده ورقم الهاتف والعنوان عند الحاجة للطوارئ.', domainId: 'safety' },
  { id: 'ls17', text: 'يطلب المساعدة من رجال الأمن أو الأخصائي عند الضياع.', domainId: 'safety' },
  { id: 'ls18', text: 'يتعامل مع النقود البسيطة ويشتري من المقصف بمفرده.', domainId: 'community' },
  { id: 'ls19', text: 'يلتزم بقواعد السلامة والانتظار في الأماكن العامة.', domainId: 'community' },
  { id: 'ls20', text: 'يظهر استقلالية واعتماداً ذاتياً في تلبية احتياجاته اليومية.', domainId: 'independence' },
];

export function calculateLifeSkillsScore(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  LIFE_SKILLS_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = LIFE_SKILLS_ITEMS.length * 3; // 20 * 3 = 60
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'استقلالية عالية ورعاية ذاتية ممتازة';
  let severityColor = '#16a34a';

  if (percentage < 45) {
    level = 'احتياج لدعم وتدريب مكثف على مهارات الاستقلالية';
    severityColor = '#dc2626';
  } else if (percentage < 65) {
    level = 'مستوى استقلالية متوسط يحتاج توجيهاً ومتابعة';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة قائمة المهارات الاستقلالية: ${totalRawScore} من 60 (${percentage}%). مستوى الاستقلالية: ${level}.`,
  };
}
