// مقياس مهارات اللعب الرمزي والتفاعل التشاركي (Symbolic Play & Social Interaction Scale)

export const SYMBOLIC_PLAY_DOMAINS = [
  { id: 'functional_play', title: 'اللعب الوظيفي والاستكشافي' },
  { id: 'symbolic_pretend', title: 'اللعب الرمزي والتخيلي' },
  { id: 'social_interaction', title: 'التفاعل واللعب التشاركي مع الأقران' },
];

export const SYMBOLIC_PLAY_ITEMS = [
  // اللعب الوظيفي (Functional Play)
  { id: 'sp1', text: 'يستخدم اللعبة وفق الغرض المصنوعة له (مثل: دحرجة السيارة، تقليب صفحة الكتاب).', domainId: 'functional_play' },
  { id: 'sp2', text: 'ينوع في الطرق التي يلعب بها باللعبة الواحدة بدلاً من النمطية.', domainId: 'functional_play' },
  { id: 'sp3', text: 'يبني مجسمات أو أشكال معقدة باستخدام المكعبات وقطع التركيب.', domainId: 'functional_play' },
  { id: 'sp4', text: 'يشغل الألعاب ذات الأزرار والمحركات بمهارة ويفهم علاقة السبب والنتيجة.', domainId: 'functional_play' },
  { id: 'sp5', text: 'يستكشف الألعاب الجديدة بحماس ودون خوف مفرط.', domainId: 'functional_play' },
  { id: 'sp6', text: 'يحافظ على اللعبة ويتجنب رميها أو رميها بعنف دون سبب.', domainId: 'functional_play' },

  // اللعب الرمزي والتخيلي (Symbolic & Pretend Play)
  { id: 'sp7', text: 'يتظاهر بالقيام بأنشطة يومية على نفسه (مثل: التظاهر بالشرب من كوب فارغ أو النوم).', domainId: 'symbolic_pretend' },
  { id: 'sp8', text: 'يتظاهر بإطعام الدمية أو إلباسها الملابس أو علاجها كأنها شخص حقيقي.', domainId: 'symbolic_pretend' },
  { id: 'sp9', text: 'يستخدم أداة كبديل لشيء آخر في اللعب التخيلي (مثل: استخدام مكعب كأنه هاتف).', domainId: 'symbolic_pretend' },
  { id: 'sp10', text: 'يمثل أدواراً تخيلية أثناء اللعب (مثل: دور الطبيب، السائق، المعلم، أو الأب).', domainId: 'symbolic_pretend' },
  { id: 'sp11', text: 'يبتكر قصة أو سيناريو بسيط للألعاب أثناء ممارسة اللعب التخيلي.', domainId: 'symbolic_pretend' },
  { id: 'sp12', text: 'يصدر أصواتاً وإيماءات تناسب سيناريو اللعب (مثل: صوت محرك السيارة أو صوت القطار).', domainId: 'symbolic_pretend' },
  { id: 'sp13', text: 'يتفاعل مع الألعاب التخيلية للآخرين وينضم لقصتهم التخيلية.', domainId: 'symbolic_pretend' },

  // التفاعل واللعب التشاركي (Social Interaction in Play)
  { id: 'sp14', text: 'يلعب بجانب أقرانه دون إزعاجهم (اللعب الموازي Parallel Play).', domainId: 'social_interaction' },
  { id: 'sp15', text: 'يشارك ألعابه وأدواته مع الأطفال الآخرين عند طلبها.', domainId: 'social_interaction' },
  { id: 'sp16', text: 'ينتظر دوره بصباح أثناء الألعاب التنافسية والجماعية.', domainId: 'social_interaction' },
  { id: 'sp17', text: 'يبدأ بالتفاعل ودعوة أقرانه للانضمام إلى لعبته.', domainId: 'social_interaction' },
  { id: 'sp18', text: 'يلتزم بقواعد وأحكام الألعاب الجماعية البسيطة (مثل: لعبة الأغميضة، الكراسي).', domainId: 'social_interaction' },
  { id: 'sp19', text: 'يظهر الفرح والمشاركة الانفعالية أثناء اللعب الجماعي مع الأطفال.', domainId: 'social_interaction' },
  { id: 'sp20', text: 'يحل الخلافات البسيطة حول الألعاب بالتفاوض أو الاستعانة بالأخصائي.', domainId: 'social_interaction' },
];

export function calculateSymbolicPlayScore(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  SYMBOLIC_PLAY_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = SYMBOLIC_PLAY_ITEMS.length * 3; // 20 * 3 = 60
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'تطور ممتازة في مهارات اللعب الرمزي والتفاعل الجماعي';
  let severityColor = '#16a34a';

  if (percentage < 45) {
    level = 'تأخر ملحوظ في مهارات اللعب الرمزي والتفاعل (يحتاج تدخل نمائي باللعب)';
    severityColor = '#dc2626';
  } else if (percentage < 65) {
    level = 'مهارات لعب نمائية متوسطة (يحتاج تحفيز اللعب التخيلي والتشاركي)';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة مقياس مهارات اللعب: ${totalRawScore} من 60 (${percentage}%). مستوى تطور اللعب: ${level}.`,
  };
}
