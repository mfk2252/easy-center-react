// مقياس دنفر المطور للفرز النمائي (Denver II Developmental Screening Scale)

export const DENVER2_ITEMS = [
  // المهارات الشخصية والاجتماعية (Personal-Social)
  { id: 'den1', text: 'ينظر إلى وجه الفاحص/الوالد ويتفاعل بالابتسامة التناظرية.', domainId: 'personal_social' },
  { id: 'den2', text: 'يبتسم استجابة لابتسامة وكلام الآخرين (الابتسامة الاجتماعية).', domainId: 'personal_social' },
  { id: 'den3', text: 'يصل بيديه للحصول على لعبة أو شيء مرغوب.', domainId: 'personal_social' },
  { id: 'den4', text: 'يتناول طعاماً بسيطاً (بسكويت) بمفرده.', domainId: 'personal_social' },
  { id: 'den5', text: 'يلعب لعبة "الكوكو" أو الاختباء والتخفي (Peek-a-boo).', domainId: 'personal_social' },
  { id: 'den6', text: 'يلوح بيده مودعاً (مع السلامة / باي باي).', domainId: 'personal_social' },
  { id: 'den7', text: 'يشير بوضوح لما يريده أو يطلبه بالإشارة أو الصوت.', domainId: 'personal_social' },

  // التآزر والحركة الدقيقة (Fine Motor-Adaptive)
  { id: 'den8', text: 'يطارد الأجسام المتحركة بنظره عبر خط الوسط.', domainId: 'fine_motor' },
  { id: 'den9', text: 'ينقل اللعبة من يد إلى اليد الأخرى بسلاسة.', domainId: 'fine_motor' },
  { id: 'den10', text: 'يلتقط الأشياء الصغيرة بدقة باستخدام الإبهام والسبابة (Pincer grasp).', domainId: 'fine_motor' },
  { id: 'den11', text: 'يسقط اللعبة داخل الكوب أو العلبة بوعي.', domainId: 'fine_motor' },
  { id: 'den12', text: 'يبني برجاً من 4 مكعبات على الأقل دون أن يقع.', domainId: 'fine_motor' },
  { id: 'den13', text: 'ينسخ خطاً عمودياً عند تقديم نموذج أمامه.', domainId: 'fine_motor' },

  // التطور اللغوي (Language)
  { id: 'den14', text: 'يصدر أصوات المناغاة والهديل (Cooing/Babbling).', domainId: 'language' },
  { id: 'den15', text: 'ينطق مقاطع لفظية مكررة (ماما، بابا، دادا).', domainId: 'language' },
  { id: 'den16', text: 'ينطق كلمتين إلى 3 كلمات ذات معنى محدد.', domainId: 'language' },
  { id: 'den17', text: 'يشير إلى صورتين مسماتين له في كتاب المصورات.', domainId: 'language' },
  { id: 'den18', text: 'ينفذ أمراً شفهياً بسيطاً (ضع الكورة على الطاولة).', domainId: 'language' },
  { id: 'den19', text: 'ينطق جملة مكونة من كلمتين أو 3 كلمات.', domainId: 'language' },

  // الحركة الكبرى (Gross Motor)
  { id: 'den20', text: 'يرفع رأسه وصدره أثناء الاستلقاء على البطن.', domainId: 'gross_motor' },
  { id: 'den21', text: 'ينقلب من البطن إلى الظهر والعكس.', domainId: 'gross_motor' },
  { id: 'den22', text: 'يجلس بمفرده ودون الحاجة لدعم أو استناد.', domainId: 'gross_motor' },
  { id: 'den23', text: 'يقف بمفرده بثبات دون امساك بالأثاث.', domainId: 'gross_motor' },
  { id: 'den24', text: 'يمشي بمفرده خطوات متزنة وثابتة.', domainId: 'gross_motor' },
  { id: 'den25', text: 'يركض بثبات ويقفز بقدميه الاثنتين.', domainId: 'gross_motor' },
];

export function calculateDenver2Score(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  DENVER2_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = DENVER2_ITEMS.length * 2; // 25 * 2 = 50
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'تطور نمائي عادي ومناسب للعمر (Normal)';
  let severityColor = '#16a34a';

  if (percentage < 50) {
    level = 'تأخر نمائي دال يستدعي تقييماً تشخيصياً شاملاً (Developmental Delay)';
    severityColor = '#dc2626';
  } else if (percentage < 70) {
    level = 'مؤشرات نمائية مشتبهة تتطلب إعادة الفحص والمتابعة (Caution / Suspect)';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة فرز دنفر II النمائي: ${totalRawScore} من 50 (${percentage}%). الحالة النمائية: ${level}.`,
  };
}
