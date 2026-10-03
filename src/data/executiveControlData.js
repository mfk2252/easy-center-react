// مقياس الذاكرة العاملة والضبط المعرفي للوظائف التنفيذية (Working Memory & Cognitive Control Scale)

export const EXECUTIVE_CONTROL_DOMAINS = [
  { id: 'working_memory', title: 'الذاكرة العاملة والاحتفاظ بالمعلومات' },
  { id: 'cognitive_flexibility', title: 'المرونة المعرفية والانتقال بين المهام' },
  { id: 'inhibition_control', title: 'كبح الاستجابة والضبط الذاتي' },
];

export const EXECUTIVE_CONTROL_ITEMS = [
  // الذاكرة العاملة (Working Memory)
  { id: 'ec1', text: 'يتذكر التسلسل المكون من 3 تعليمات متتالية وينفذها بالترتيب الصحيح.', domainId: 'working_memory' },
  { id: 'ec2', text: 'يحتفظ بالمعلومات والاتجاهات في ذهنه أثناء أداء المهمة الموكلة إليه.', domainId: 'working_memory' },
  { id: 'ec3', text: 'يتذكر أين وضع الأدوات الخاصة به بعد فترات قصيرة.', domainId: 'working_memory' },
  { id: 'ec4', text: 'يسترجع قواعد النشاط واللعبة أثناء ممارستها دون الحاجة للتذكير المستمر.', domainId: 'working_memory' },
  { id: 'ec5', text: 'يستطيع استدعاء تفاصيل قصة قصيرة قُرئت عليه للتو.', domainId: 'working_memory' },
  { id: 'ec6', text: 'يقوم بالحسابات والعمليات الذهنية البسيطة دون الاستعانة بكتيبات.', domainId: 'working_memory' },

  // المرونة المعرفية (Cognitive Flexibility)
  { id: 'ec7', text: 'ينتقل بمرونة وسلسة بين مهمة وأخرى عندما ينتهي الوقت المخصص.', domainId: 'cognitive_flexibility' },
  { id: 'ec8', text: 'يتقبل تغير القواعد أو تعديل آلية النشاط دون توتر أو جمود فكري.', domainId: 'cognitive_flexibility' },
  { id: 'ec9', text: 'يجد حلاً بديلاً أو طريقة أخرى عند انسداد طريقة الحل الأولى.', domainId: 'cognitive_flexibility' },
  { id: 'ec10', text: 'يتكيف بسرعة عند تغيّر الجدول اليومي أو الأخصائي المتابع.', domainId: 'cognitive_flexibility' },
  { id: 'ec11', text: 'يتعلم من أخطائه السابقة ويغير استراتيجيته عند التكرار.', domainId: 'cognitive_flexibility' },

  // كبح الاستجابة (Inhibition Control)
  { id: 'ec12', text: 'يفكر في نتائج تصرفه قبل أن يتحدث أو يتصرف بنزق.', domainId: 'inhibition_control' },
  { id: 'ec13', text: 'يكبح رغبته في مقاطعة الآخرين وينتظر أن يفرغوا من الحديث.', domainId: 'inhibition_control' },
  { id: 'ec14', text: 'يتحكم في ردود أفعاله العاطفية والانفعالية عند الاحباط.', domainId: 'inhibition_control' },
  { id: 'ec15', text: 'يمتنع عن لمس الأشياء الممنوعة أو الخطرة عند إخباره بقوانين السلامة.', domainId: 'inhibition_control' },
  { id: 'ec16', text: 'يحافظ على هدوئه واستقراره في المواقف التي تتطلب الهدوء والتركيز.', domainId: 'inhibition_control' },
  { id: 'ec17', text: 'يتجنب التسرع والاندفاع عند البدء في حل المسائل أو الاختبارات.', domainId: 'inhibition_control' },
  { id: 'ec18', text: 'يحافظ على مساحته الشخصية ولا يدخل مجال الآخرين بأسلوب اندفاعي.', domainId: 'inhibition_control' },
  { id: 'ec19', text: 'يستجيب لإشارات التوقف (Stop / Wait) فور صدورها من الأخصائي.', domainId: 'inhibition_control' },
  { id: 'ec20', text: 'يتمتع بالقدرة على التمهل واختيار الاستجابة الملائمة للموقف.', domainId: 'inhibition_control' },
];

export function calculateExecutiveControlScore(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  EXECUTIVE_CONTROL_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = EXECUTIVE_CONTROL_ITEMS.length * 3; // 20 * 3 = 60
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'كفاءة ممتازة في الضبط والوظائف التنفيذية';
  let severityColor = '#16a34a';

  if (percentage < 45) {
    level = 'قصور ملحوظ في الوظائف التنفيذية والضبط الذاتي (احتياج تدريب مكثف)';
    severityColor = '#dc2626';
  } else if (percentage < 65) {
    level = 'ضعف متوسط في الضبط المعرفي والذاكرة العاملة';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة مقياس الوظائف التنفيذية: ${totalRawScore} من 60 (${percentage}%). مستوى الكفاءة التنفيذية: ${level}.`,
  };
}
