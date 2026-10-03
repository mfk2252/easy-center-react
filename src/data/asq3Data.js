// استبيان الأعمار والمراحل النمائية للطفولة المبكرة (ASQ-3 Open Developmental Screening)

export const ASQ3_DOMAINS = [
  { id: 'communication', title: 'مجال التواصل والتعبير اللغوي' },
  { id: 'gross_motor', title: 'مجال الحركة الكبرى والتوازن' },
  { id: 'fine_motor', title: 'مجال الحركة الدقيقة والتآزر' },
  { id: 'problem_solving', title: 'مجال حل المشكلات والاستدلال' },
  { id: 'personal_social', title: 'المجال الشخصي والاجتماعي' },
];

export const ASQ3_ITEMS = [
  // التواصل (Communication)
  { id: 'asq1', text: 'يشير إلى الصور أو الأشياء المسماة له عندما يُطلب منه ذلك.', domainId: 'communication' },
  { id: 'asq2', text: 'ينطق جمل مكونة من 3 إلى 4 كلمات واضحة ومفهومة.', domainId: 'communication' },
  { id: 'asq3', text: 'يفهم حروف الجر وظروف المكان البسيطة (مثل: فوق، تحت، داخل).', domainId: 'communication' },
  { id: 'asq4', text: 'يجيب على الأسئلة البسيطة مثل "ماذا تفعل؟" أو "أين ألعابك؟".', domainId: 'communication' },
  { id: 'asq5', text: 'يستخدم ضمائر المتكلم والمخاطب بالشكل الصحيح أثناء الحديث.', domainId: 'communication' },

  // الحركة الكبرى (Gross Motor)
  { id: 'asq6', text: 'يجري بثبات ودون السقوط أو التعثر المتكرر.', domainId: 'gross_motor' },
  { id: 'asq7', text: 'يقفز بقدميه معاً في المكان وعلى درجة واحدة.', domainId: 'gross_motor' },
  { id: 'asq8', text: 'يصعد الدرج ويهبط منه بالتناوب بين القدمين.', domainId: 'gross_motor' },
  { id: 'asq9', text: 'يرمي الكرة للجمهور باليد إلى الأمام لمسافة مترين.', domainId: 'gross_motor' },
  { id: 'asq10', text: 'يتوازن على قدم واحدة لمدة 3 ثوانٍ على الأقل.', domainId: 'gross_motor' },

  // الحركة الدقيقة (Fine Motor)
  { id: 'asq11', text: 'يمسك القلم بأصابعه بمسكة ثلاثية صحيحة بدلاً من قبضة اليد الكاملة.', domainId: 'fine_motor' },
  { id: 'asq12', text: 'ينسخ خطاً مستقيماً ودائرة بسيطة عند رؤية النموذج.', domainId: 'fine_motor' },
  { id: 'asq13', text: 'يبني برجاً من 6 إلى 8 مكعبات دون أن يسقط.', domainId: 'fine_motor' },
  { id: 'asq14', text: 'يلضم الخرز أو الأزرار في الخيط بمهارة يدين متناسقة.', domainId: 'fine_motor' },
  { id: 'asq15', text: 'يستخدم الورق والمقص للقص البسيط تحت الإشراف.', domainId: 'fine_motor' },

  // حل المشكلات (Problem Solving)
  { id: 'asq16', text: 'يركب لوحة الأشكال الخشبية أو الأحجيات (Puzzle) البسيطة.', domainId: 'problem_solving' },
  { id: 'asq17', text: 'يميز بين الألوان الأساسية الأربعة (أحمر، أزرق، أخضر، أصفر).', domainId: 'problem_solving' },
  { id: 'asq18', text: 'يصنف الأشياء حسب الحجم أو الشكل أو اللون.', domainId: 'problem_solving' },
  { id: 'asq19', text: 'يفهم مفهوم "المزيد" و"الأقل" والعد الترتيبي حتى 5.', domainId: 'problem_solving' },
  { id: 'asq20', text: 'يستعين بأداة للوصول إلى شيء بعيد بدلاً من البكاء أو الاستسلام.', domainId: 'problem_solving' },

  // الشخصي والاجتماعي (Personal-Social)
  { id: 'asq21', text: 'يتناول وجبته بمفرده دون الحاجة لمساعدة مباشرة.', domainId: 'personal_social' },
  { id: 'asq22', text: 'يميز اسم الأولاد والبنات والأشخاص المألوفين في عائلته.', domainId: 'personal_social' },
  { id: 'asq23', text: 'يقلد الأنشطة والأعمال المنزلية التي يقوم بها البالغون.', domainId: 'personal_social' },
  { id: 'asq24', text: 'يعبر عن احتياجات دورة المياه قبل فوات الأوان.', domainId: 'personal_social' },
  { id: 'asq25', text: 'يلعب بالتشارك والتناوب مع أقرانه لفترات قصيرة.', domainId: 'personal_social' },
];

export function calculateASQ3Score(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  ASQ3_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = ASQ3_ITEMS.length * 2; // 25 items * 2 = 50
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'تطور نمائي طبيعي ومناسب للعمر';
  let severityColor = '#16a34a';

  if (percentage < 50) {
    level = 'تأخر نمائي يستدعي التقويم والتدخل المبكر';
    severityColor = '#dc2626';
  } else if (percentage < 70) {
    level = 'منطقة المتابعة الحذرة (At-Risk / Monitor)';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة مسح ASQ-3 النمائي: ${totalRawScore} من 50 (${percentage}%). الحالة النمائية: ${level}.`,
  };
}
