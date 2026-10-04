// استبيان القوة والصعوبات السلوكية للأطفال (SDQ - Strengths and Difficulties Questionnaire Open Access)

export const SDQ_DOMAINS = [
  { id: 'emotional', title: 'الأعراض الانفعالية والقلق' },
  { id: 'conduct', title: 'مشكلات السلوك والعناد' },
  { id: 'hyperactivity', title: 'فرط الحركة وتشتت الانتباه' },
  { id: 'peer', title: 'مشكلات العلاقات مع الأقران' },
  { id: 'prosocial', title: 'السلوك الاجتماعي الإيجابي' },
];

export const SDQ_ITEMS = [
  // الأعراض الانفعالية (Emotional Symptoms)
  { id: 'sd1', text: 'يشكو كثيراً من آلام الرأس، البطن أو آلام جسدية متكررة.', domainId: 'emotional' },
  { id: 'sd2', text: 'لديه مخاوف كثيرة ويظهر توتراً وسرعة ذعر في المواقف الجديدة.', domainId: 'emotional' },
  { id: 'sd3', text: 'يبدو حزيناً، كئيباً أو باكياً بدون أسباب واضحة.', domainId: 'emotional' },
  { id: 'sd4', text: 'يشعر بالقلق والتوتر شديد عند الابتعاد عن الوالدين أو الأخصائي.', domainId: 'emotional' },
  { id: 'sd5', text: 'يفقد الثقة بنفسه بسهولة ويتراجع عند التعرض للنقد.', domainId: 'emotional' },

  // مشكلات السلوك (Conduct Problems)
  { id: 'sd6', text: 'ينتابه نوبات غضب شديدة وثورات انفعالية حادة.', domainId: 'conduct' },
  { id: 'sd7', text: 'يعاند البالغين ويرفض التجاوب مع التعليمات والقواعد.', domainId: 'conduct' },
  { id: 'sd8', text: 'يتشاجر كثيراً مع الأطفال الآخرين أو يتنمر عليهم.', domainId: 'conduct' },
  { id: 'sd9', text: 'يأخذ أشياء ليست ملكه من المركز أو المدرسة أو المنزل.', domainId: 'conduct' },
  { id: 'sd10', text: 'يتصرف باتجاه تخريب الأشياء والممتلكات الشخصية والعامة.', domainId: 'conduct' },

  // فرط الحركة وتشتت الانتباه (Hyperactivity/Inattention)
  { id: 'sd11', text: 'كثير الحركة، لا يستقر في مكانه، ويتحرك باستمرار.', domainId: 'hyperactivity' },
  { id: 'sd12', text: 'يتفركك ويتململ كثيراً في مقعده بيده أو قدميه.', domainId: 'hyperactivity' },
  { id: 'sd13', text: 'يتشتت انتباهه بسهولة ولا يستطيع إكمال الأنشطة والواجبات.', domainId: 'hyperactivity' },
  { id: 'sd14', text: 'يتصرف باندفاعية قبل التفكير في نتائج أفعاله.', domainId: 'hyperactivity' },
  { id: 'sd15', text: 'يجد صعوبة في التركيز والانتباه للتعليمات الموجهة إليه.', domainId: 'hyperactivity' },

  // مشكلات الأقران (Peer Problems)
  { id: 'sd16', text: 'يميل إلى الوحدة ويفضل اللعب بمفرده على التفاعل مع الأطفال.', domainId: 'peer' },
  { id: 'sd17', text: 'ليس لديه صديق مقرب واحد على الأقل في عمره.', domainId: 'peer' },
  { id: 'sd18', text: 'لا يستمتع بالأنشطة الجماعية ويشعر بالاستبعاد بين أقرانه.', domainId: 'peer' },
  { id: 'sd19', text: 'تعرض لمضايقات أو تنمر من قبل الأطفال الآخرين.', domainId: 'peer' },
  { id: 'sd20', text: 'يتفاهم مع الكبار والبالغين أفضل من تفاهمه مع أقرانه.', domainId: 'peer' },

  // السلوك الاجتماعي الإيجابي (Prosocial Behavior)
  { id: 'sd21', text: 'يهتم بمشاعر الآخرين ويبدي تعاطفاً عند رؤية شخص متألم.', domainId: 'prosocial', isProsocial: true },
  { id: 'sd22', text: 'يتشارك الأشياء والألعاب والأدوات مع الأطفال الآخرين بمرونة.', domainId: 'prosocial', isProsocial: true },
  { id: 'sd23', text: 'يقدم المساعدة للآخرين إذا كانوا بحاجة لذلك دون طلب.', domainId: 'prosocial', isProsocial: true },
  { id: 'sd24', text: 'يتصرف بلطف ومراعاة للصغار والأطفال المحتاجين.', domainId: 'prosocial', isProsocial: true },
  { id: 'sd25', text: 'يتطوع للمساعدة في ترتيب الفصل وإنجاز المهام الجماعية.', domainId: 'prosocial', isProsocial: true },
];

export function calculateSDQScore(answers = {}) {
  let difficultiesScore = 0;
  let prosocialScore = 0;
  let answeredCount = 0;

  SDQ_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      if (item.isProsocial) {
        prosocialScore += val;
      } else {
        difficultiesScore += val;
      }
      answeredCount++;
    }
  });

  const maxDifficulties = 20 * 2; // 4 domains * 5 items * 2 = 40
  let level = 'ضمن النطاق الطبيعي (Normal)';
  let severityColor = '#16a34a';

  if (difficultiesScore >= 17) {
    level = 'صعوبات سلوكية وانفعالية بارزة دالة إكلينيكياً (Abnormal)';
    severityColor = '#dc2626';
  } else if (difficultiesScore >= 14) {
    level = 'منطقة حدية (Borderline)';
    severityColor = '#d97706';
  }

  return {
    totalDifficultiesScore: difficultiesScore,
    prosocialScore,
    maxDifficulties,
    answeredCount,
    level,
    severityColor,
    interpretation: `مجموع درجات الصعوبات السلوكية (SDQ): ${difficultiesScore} من 40. الدرجة الاجتماعية الإيجابية: ${prosocialScore} من 10. التصنيف: ${level}.`,
  };
}
