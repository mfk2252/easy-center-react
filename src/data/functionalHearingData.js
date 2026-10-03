// مقياس التقييم الوظيفي للسمع وضعف السمع (Functional Hearing Assessment Scale - FHA)

export const FUNCTIONAL_HEARING_DOMAINS = [
  { id: 'awareness', title: 'الوعي السمعي والاستجابة للأصوات' },
  { id: 'localization', title: 'تحديد مصدر الصوت والتمييز السمعي' },
  { id: 'speech_perception', title: 'إدراك الكلام وفهم اللغة الشفهية' },
];

export const FUNCTIONAL_HEARING_ITEMS = [
  // الوعي السمعي (Auditory Awareness)
  { id: 'fh1', text: 'يرمش أو ينتبه عند حدوث صوت مفاجئ أو مرتفع في البيئة المحيطة.', domainId: 'awareness' },
  { id: 'fh2', text: 'يبدي استجابة أو يلتفت عندما ينادى باسمه بصوت عادي.', domainId: 'awareness' },
  { id: 'fh3', text: 'ينتبه للأصوات البيئية اليومية (مثل: جرس الباب، الهاتف، منبه السيارة).', domainId: 'awareness' },
  { id: 'fh4', text: 'يتوقف عن النشاط الذي يقوم به عند سماع صوت نداء من الكبار.', domainId: 'awareness' },
  { id: 'fh5', text: 'يستمتع بالاستماع للأصوات الموسيقية والأناشيد ويبدي تفاعلاً معها.', domainId: 'awareness' },
  { id: 'fh6', text: 'يميز بين وجود الصوت وانقطاعه (الفرق بين الصوت والسكوت).', domainId: 'awareness' },

  // تحديد المكان والتمييز السمعي (Localization & Discrimination)
  { id: 'fh7', text: 'يلتفت بدقة نحو مصدر الصوت القادم من اليمين أو اليسار.', domainId: 'localization' },
  { id: 'fh8', text: 'حدد موقع مصدر الصوت القادم من الخلف أو الأعلى.', domainId: 'localization' },
  { id: 'fh9', text: 'يميز بين أصوات الحيوانات المألوفة وأصوات وسائل المواصلات.', domainId: 'localization' },
  { id: 'fh10', text: 'يميز بين الأصوات العالية والأصوات المنخفضة (الجهارة).', domainId: 'localization' },
  { id: 'fh11', text: 'يميز بين أصوات الرجال والأطفال والنساء المألوفين لديه.', domainId: 'localization' },
  { id: 'fh12', text: 'يميز بين الكلمات ذات النغمات المتباينة دون الاعتماد على القراءة الشفهية.', domainId: 'localization' },

  // إدراك الكلام (Speech Perception)
  { id: 'fh13', text: 'ينفذ الأوامر والتعليمات الشفهية المباشرة دون الحاجة لإشارات إيضاحية.', domainId: 'speech_perception' },
  { id: 'fh14', text: 'يفهم المحادثة الشفهية في بيئة هادئة بدون ضوضاء خلفية.', domainId: 'speech_perception' },
  { id: 'fh15', text: 'يستجيب للتعليمات الشفهية حتى عندما لا يكون المتحدث أمامه مباشرة.', domainId: 'speech_perception' },
  { id: 'fh16', text: 'يفهم الكلام والقصص البسيطة المسموعة من أجهزة التسجيل أو التلفاز.', domainId: 'speech_perception' },
  { id: 'fh17', text: 'يستطيع متابعة المحادثة وسط الضوضاء والضجيج المعتاد في الفصل.', domainId: 'speech_perception' },
  { id: 'fh18', text: 'يطلب إعادة الكلام أو القراءة الشفهية عند تعذر الاستماع الواضح.', domainId: 'speech_perception' },
  { id: 'fh19', text: 'يستخدم سماعاته الطبية أو القوقعة الإلكترونية بانتظام دون تذمر.', domainId: 'speech_perception' },
  { id: 'fh20', text: 'يظهر كفاءة وتجاوباً سمعياً وظيفياً في أنشطته اليومية والتعليمية.', domainId: 'speech_perception' },
];

export function calculateFunctionalHearingScore(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  FUNCTIONAL_HEARING_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = FUNCTIONAL_HEARING_ITEMS.length * 3; // 20 * 3 = 60
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'استجابة سمعية وظيفية ممتازة';
  let severityColor = '#16a34a';

  if (percentage < 45) {
    level = 'ضعف سمعي وظيفي حاد يتطلب استشارة تخاطب ومعينات سمعية';
    severityColor = '#dc2626';
  } else if (percentage < 65) {
    level = 'قصور سمعي وظيفي متوسط يتطلب تأهيلاً سمعياً وتأهيل اللغة';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة التقييم الوظيفي للسمع: ${totalRawScore} من 60 (${percentage}%). المستوى الوظيفي السمعي: ${level}.`,
  };
}
