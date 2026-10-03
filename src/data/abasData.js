// مقياس السلوك التكيفي للطفولة (ABAS-3 Adaptation - Open Access Field Version)

export const ABAS_DOMAINS = [
  { id: 'conceptual', title: 'المجال المفاهيمي واللغوي', weight: 1 },
  { id: 'social', title: 'المجال الاجتماعي والتفاعلي', weight: 1 },
  { id: 'practical', title: 'المجال العملي والاستقلالي', weight: 1 },
];

export const ABAS_ITEMS = [
  // المجال المفاهيمي (Conceptual Domain)
  { id: 'ab1', text: 'يعبر عن احتياجاته الأساسية باستخدام جمل واضحة أو وسائل تواصل مفهومة.', domainId: 'conceptual' },
  { id: 'ab2', text: 'يفهم وينفذ التعليمات الشفهية المكونة من خطوتين أو أكثر.', domainId: 'conceptual' },
  { id: 'ab3', text: 'يتعرف على الأرقام والمفاهيم الحسابية البسيطة (مثل: أكثر/أقل، كبير/صغير).', domainId: 'conceptual' },
  { id: 'ab4', text: 'يتذكر مكان الأشياء الخاصة به ويستعيدها عند الحاجة بدون مساعدة.', domainId: 'conceptual' },
  { id: 'ab5', text: 'يستخدم الكلمات للتعبير عن مشاعره (مثل: سعيد، حزين، خائف) بدلاً من الانفعال.', domainId: 'conceptual' },
  { id: 'ab6', text: 'يستوعب مفهوم الوقت والجدول اليومي للأنشطة (مثل: الآن، بعد قليل، غداً).', domainId: 'conceptual' },
  { id: 'ab7', text: 'يطرح أسئلة استكشافية لفهم ما يدور حوله في البيئة المحيطة.', domainId: 'conceptual' },
  { id: 'ab8', text: 'يتجنب المخاطر الواضحة عند إرشاده إليها (مثل: الأجسام الحادة أو الساخنة).', domainId: 'conceptual' },

  // المجال الاجتماعي (Social Domain)
  { id: 'ab9', text: 'يبدأ التفاعل الاجتماعي والتواصل مع الأقران والبالغين بطريقة مناسبة.', domainId: 'social' },
  { id: 'ab10', text: 'يشارك في اللعب الجماعي والأنشطة التشاركية ويتبادل الأدوار.', domainId: 'social' },
  { id: 'ab11', text: 'يظهر التعاطف والاستجابة لمشاعر الآخرين عندما يكونون غاضبين أو حزانى.', domainId: 'social' },
  { id: 'ab12', text: 'يلتزم بقواعد الآداب الاجتماعية العامة (مثل: إلقاء التحية، القول شكراً/من فضلك).', domainId: 'social' },
  { id: 'ab13', text: 'يتحكم في انفعالاته ونوبات غضبه عند مواجهة التحديات أو الرفض.', domainId: 'social' },
  { id: 'ab14', text: 'يكون صداقات ويحافظ على العلاقات مع زملائه في المركز/المدرسة.', domainId: 'social' },
  { id: 'ab15', text: 'يفهم الإشارات غير اللفظية ولغة الجسد للآخرين ويتفاعل معها.', domainId: 'social' },
  { id: 'ab16', text: 'يتقبل التغيرات الطارئة في الأنشطة الاجتماعية دون توتر مفرط.', domainId: 'social' },

  // المجال العملي والاستقلالي (Practical Domain)
  { id: 'ab17', text: 'يتناول طعامه وشرابه بمفرده باستخدام الأدوات المخصصة بنظافة.', domainId: 'practical' },
  { id: 'ab18', text: 'يرتدي ملابسه ويخلعها ويغلق الأزرار/السحاب بمهارة مناسبة لعمره.', domainId: 'practical' },
  { id: 'ab19', text: 'يعتني بنظافته الشخصية ويغسل يديه ووجهه ويستخدم دورة المياه بمفرده.', domainId: 'practical' },
  { id: 'ab20', text: 'يرتب ألعابه وأدواته الخاصة في أماكنها بعد الانتهاء منها.', domainId: 'practical' },
  { id: 'ab21', text: 'يتنقل في أرجاء المنزل أو المركز بأمان ودون الحاجة لمراقبة مستمرة.', domainId: 'practical' },
  { id: 'ab22', text: 'يطلب المساعدة من البالغين الموثوقين عند مواجهة مشكلة أو خطر.', domainId: 'practical' },
  { id: 'ab23', text: 'يساعد في المهام المنزلية والصفية البسيطة (مثل: نقل الأشياء، مسح الطاولة).', domainId: 'practical' },
  { id: 'ab24', text: 'يحافظ على سلامة ممتلكاته الشخصية وممتلكات الآخرين.', domainId: 'practical' },
  { id: 'ab25', text: 'يظهر استقلالية واعتماداً على الذات في أداء المهام اليومية المعتادة.', domainId: 'practical' },
];

export function calculateABASScore(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  ABAS_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = ABAS_ITEMS.length * 3; // 25 items * max 3 = 75
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'سلوك تكيفي ممتاز';
  let severityColor = '#16a34a';

  if (percentage < 40) {
    level = 'قصور حاد في السلوك التكيفي (احتياج لدعم مكثف)';
    severityColor = '#dc2626';
  } else if (percentage < 60) {
    level = 'قصور متوسط في السلوك التكيفي (احتياج لدعم موجه)';
    severityColor = '#ea580c';
  } else if (percentage < 75) {
    level = 'سلوك تكيفي خفيف / حدي (دعم بسيط)';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `الدرجة الكلية للسلوك التكيفي: ${totalRawScore} من أصل ${maxPossible} (${percentage}%). التصنيف الإكلينيكي: ${level}.`,
  };
}
