// مقياس التوافق الانفعالي والقلق للأطفال (Emotional Adjustment & Anxiety Scale)

export const EMOTIONAL_ADJUSTMENT_ITEMS = [
  { id: 'ea1', text: 'يبدو قلقاً ومتوتراً عند مواجهة مواقف أو أشخاص جدد.', domainId: 'anxiety' },
  { id: 'ea2', text: 'يشكو من مخاوف متكررة (مثل: الخوف من الظلام، الأصوات المرتفعة، الوحدة).', domainId: 'anxiety' },
  { id: 'ea3', text: 'يصعب طمأنته وتهدئته عند شعوره بالخوف أو القلق.', domainId: 'anxiety' },
  { id: 'ea4', text: 'يظهر سرعة ذعر واستجابة جفول زائدة للمثيرات العادية.', domainId: 'anxiety' },
  { id: 'ea5', text: 'يتعرق أو يتنفس بسرعة أو يرتجف عند التوتر الانفعالي.', domainId: 'anxiety' },
  { id: 'ea6', text: 'يبدي التصاقاً شديداً بالوالدين/الأخصائي ويرفض الابتعاد عنهم.', domainId: 'anxiety' },
  { id: 'ea7', text: 'يبدو حزيناً ومكتئباً ويستسلم للبكاء بسهولة.', domainId: 'mood' },
  { id: 'ea8', text: 'يفقد الاهتمام والرغبة في ممارسة الألعاب والأنشطة المحببة لديه.', domainId: 'mood' },
  { id: 'ea9', text: 'يتغير مزاجه بسرعة وبشكل مفاجئ دون سبب ظاهر.', domainId: 'mood' },
  { id: 'ea10', text: 'يعبر عن مشاعر انخفاض القيمة الذاتية (مثل: "أنا لا أستطيع"، "أنا سيء").', domainId: 'mood' },
  { id: 'ea11', text: 'ينسحب اجتماعياً ويفضل القعود بمفرده على التفاعل مع زملائه.', domainId: 'withdrawal' },
  { id: 'ea12', text: 'يتجنب النظر في أعين الآخرين أثناء التحدث معهم عند التوتر.', domainId: 'withdrawal' },
  { id: 'ea13', text: 'يجد صعوبة في التعبير عن مشاعره بأسلوب لفظي متزن.', domainId: 'expression' },
  { id: 'ea14', text: 'يتعامل بجمود انفعالي ولا يبدي تعبيرات وجه حية في المواقف السارة.', domainId: 'expression' },
  { id: 'ea15', text: 'يظهر حساسية مفرطة تجاه النقد أو التصحيح من قبل الكبار.', domainId: 'regulation' },
  { id: 'ea16', text: 'ينتابه نوبات من الصمت الانغلاقي وترفض الحديث عند الانزعاج.', domainId: 'regulation' },
  { id: 'ea17', text: 'يستعيد هدوءه وتوازنه النفسي بسرعة بعد الانتهاء من الموقف المزعج.', domainId: 'regulation', isReverse: true },
  { id: 'ea18', text: 'يظهر قدرة على ضبط وتوجيه مشاعره بطريقة إيجابية مناسبة للموقف.', domainId: 'regulation', isReverse: true },
  { id: 'ea19', text: 'يستجيب للتشجيع والدعم العاطفي ويشعر بالأمان سريعا.', domainId: 'regulation', isReverse: true },
  { id: 'ea20', text: 'يتمتع بتوافق انفعالي عام واستقرار نفسي جيد في حياته اليومية.', domainId: 'regulation', isReverse: true },
];

export function calculateEmotionalAdjustmentScore(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  EMOTIONAL_ADJUSTMENT_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      const score = item.isReverse ? (3 - val) : val;
      totalRawScore += score;
      answeredCount++;
    }
  });

  const maxPossible = EMOTIONAL_ADJUSTMENT_ITEMS.length * 3; // 20 * 3 = 60
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'توافق انفعالي ممتاز واستقرار نفسي جيد';
  let severityColor = '#16a34a';

  if (totalRawScore >= 35) {
    level = 'اضطراب انفعالي وقلق حاد يستدعي الدعم النفسي والإرشاد';
    severityColor = '#dc2626';
  } else if (totalRawScore >= 24) {
    level = 'قلق وتوافق انفعالي متوسط يتطلب توجيهاً ودعماً عاطفياً';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة مقياس التوافق الانفعالي والقلق: ${totalRawScore} من 60. حالة الاستقرار الانفعالي: ${level}.`,
  };
}
