/**
 * بيب-3 (PEP-3) - ملف التقييم النفسي التربوي - الإصدار الثالث المطور
 * أداة التشخيص والتقييم السيكومتري لمهارات النمو والسلوك
 */

export const PEP3_DOMAINS = [
  { id: 'cvp', name: '🧠 الإدراك اللفظي وغير اللفظي (CVP)', color: '#2563eb', itemsCount: 10, maxRaw: 20 },
  { id: 'el', name: '🗣️ التعبير اللغوي والتواصل (EL)', color: '#059669', itemsCount: 8, maxRaw: 16 },
  { id: 'rl', name: '👂 اللغة الاستقبالية وفهم التوجيهات (RL)', color: '#7c3aed', itemsCount: 7, maxRaw: 14 },
  { id: 'fm', name: '✍️ المهارات الحركية الدقيقة (FM)', color: '#db2777', itemsCount: 6, maxRaw: 12 },
  { id: 'gm', name: '🏃‍♂️ المهارات الحركية الكبيرة (GM)', color: '#ea580c', itemsCount: 6, maxRaw: 12 },
  { id: 'vmi', name: '🪞 التقليد البصري الحركي (VMI)', color: '#0891b2', itemsCount: 5, maxRaw: 10 },
  { id: 'ae', name: '🎭 التعبير الانفعالي والتكيفي (AE)', color: '#4f46e5', itemsCount: 4, maxRaw: 8 },
  { id: 'sr', name: '🤝 التبادل والتفاعل الاجتماعي (SR)', color: '#16a34a', itemsCount: 4, maxRaw: 8 },
];

export const PEP3_RESPONSE_OPTIONS = [
  { value: 2, label: 'منجز (P)', text: 'يؤدي الاستجابة بنجاح تام واستقلالية كاملة' },
  { value: 1, label: 'بزوغ (E)', text: 'يبدي محاولة أو فهماً جزئياً؛ وهي الفئة الأهم لأهداف الخطة الفردية' },
  { value: 0, label: 'إخفاق (F)', text: 'لا يبدي محاولة صحيحة أو يرفض تماماً أداء النشاط' },
];

export const PEP3_ITEMS = [
  // --- Cognitive (CVP) ---
  { id: 'pep3_01', domainId: 'cvp', text: 'تركيب بازل خشبي ذو مقابض من 4 قطع منفصلة دون مساعدة.' },
  { id: 'pep3_02', domainId: 'cvp', text: 'مطابقة الألوان الأساسية الثلاثة (أحمر، أزرق، أصفر) باستخدام مجسمات متطابقة.' },
  { id: 'pep3_03', domainId: 'cvp', text: 'إيجاد مجسم صغير مخفي تحت كوب من بين ثلاثة أكواب بعد تحريكها يسيراً.' },
  { id: 'pep3_04', domainId: 'cvp', text: 'فرز وتصنيف مجسمات لحيوانات ومركبات في مجموعتين منفصلتين.' },
  { id: 'pep3_05', domainId: 'cvp', text: 'بناء برج من 8 مكعبات خشبية دون إسقاطها.' },
  { id: 'pep3_06', domainId: 'cvp', text: 'تصنيف الأشكال الهندسية الأساسية الأربعة (دائرة، مربع، مثلث، مستطيل).' },
  { id: 'pep3_07', domainId: 'cvp', text: 'الإشارة إلى الحجم "الكبير" و"الصغير" عند مقارنة مجسمين متشابهين.' },
  { id: 'pep3_08', domainId: 'cvp', text: 'إدراك دوام الأشياء والبحث عن لعبة سقطت على الأرض تلقائياً.' },
  { id: 'pep3_09', domainId: 'cvp', text: 'التعرف على الاستخدام الوظيفي للأشياء المألوفة (مثال: ملعقة للأكل، مشط للشعر).' },
  { id: 'pep3_10', domainId: 'cvp', text: 'مطابقة الكلمات المكتوبة البسيطة بالصور المطابقة لها (عمر متقدم).' },

  // --- Expressive Language (EL) ---
  { id: 'pep3_11', domainId: 'el', text: 'نطق ثلاث كلمات مفردة واضحة ومفهومة على الأقل لتسمية الأشياء.' },
  { id: 'pep3_12', domainId: 'el', text: 'استخدام جمل من كلمتين للتعبير عن الرغبة (مثال: "بدي موية" أو "بابا راح").' },
  { id: 'pep3_13', domainId: 'el', text: 'تسمية 5 صور لحيوانات أو أشياء مألوفة عند الإشارة إليها.' },
  { id: 'pep3_14', domainId: 'el', text: 'الإجابة بـ "نعم" أو "لا" شفهياً أو بالإشارة المناسبة للتعبير عن القبول والرفض.' },
  { id: 'pep3_15', domainId: 'el', text: 'استخدام الضمائر البسيطة (أنا، هو، أنت) بشكل صحيح نسبياً في الحوار.' },
  { id: 'pep3_16', domainId: 'el', text: 'طلب المساعدة شفهياً عند مواجهة صعوبة في لعبة أو مهمة.' },
  { id: 'pep3_17', domainId: 'el', text: 'الربط شفهياً بين الصوت ومصدره (مثال: يصدر صوت القطة "مياو" عند رؤيتها).' },
  { id: 'pep3_18', domainId: 'el', text: 'وصف صورة مألوفة باستخدام 3 كلمات على الأقل (مثال: "ولد يلعب كورة").' },

  // --- Receptive Language (RL) ---
  { id: 'pep3_19', domainId: 'rl', text: 'تنفيذ أمر بسيط من خطوة واحدة (مثال: "هات الكرة" أو "افتح الباب").' },
  { id: 'pep3_20', domainId: 'rl', text: 'الإشارة إلى 3 أجزاء من جسمه عند طلبها (مثال: "وين عينك؟").' },
  { id: 'pep3_21', domainId: 'rl', text: 'التعرف وتحديد 5 مجسمات مألوفة في الغرفة عند طلبها بالاسم.' },
  { id: 'pep3_22', domainId: 'rl', text: 'تنفيذ أمر مركب من خطوتين متتاليتين (مثال: "شيل الكتاب وحطه على الطاولة").' },
  { id: 'pep3_23', domainId: 'rl', text: 'الاستجابة لاسمه عند مناداته من مسافة متوسطة بالالتفات والتواصل البصري.' },
  { id: 'pep3_24', domainId: 'rl', text: 'فهم كلمات النفي والامتناع (مثال: التوقف فوراً عند سماع كلمة "لا" أو "عيب").' },
  { id: 'pep3_25', domainId: 'rl', text: 'فهم حروف الجر البسيطة (داخل، فوق، تحت) بوضع المكعب في المكان المطلوب.' },

  // --- Fine Motor (FM) ---
  { id: 'pep3_26', domainId: 'fm', text: 'لضم 3 خرزات كبيرة الحجم في سلك أو خيط سميك.' },
  { id: 'pep3_27', domainId: 'fm', text: 'مسك قلم الألوان بقبضة ثلاثية صحيحة والتلوين داخل مساحة محددة.' },
  { id: 'pep3_28', domainId: 'fm', text: 'استخدام المقص لقص خط مستقيم مرسوم على الورقة بطول 10 سم.' },
  { id: 'pep3_29', domainId: 'fm', text: 'تقليب صفحات كتاب مصور صفحة صفحة باستخدام السبابة والإبهام.' },
  { id: 'pep3_30', domainId: 'fm', text: 'فتح غطاء علبة دائرية وتسكيرها باللف.' },
  { id: 'pep3_31', domainId: 'fm', text: 'نقل حبات صغيرة (مثل الفاصوليا) من وعاء لآخر بالتقاطها بالسبابة والإبهام (الملقط).' },

  // --- Gross Motor (GM) ---
  { id: 'pep3_32', domainId: 'gm', text: 'المشي على خط مستقيم مرسوم على الأرض لمسافة مترين متزناً.' },
  { id: 'pep3_33', domainId: 'gm', text: 'القفز بالقدمين معاً للأمام ولأعلى مسافة 10 سم على الأقل.' },
  { id: 'pep3_34', domainId: 'gm', text: 'الوقوف والتوازن على قدم واحدة لمدة 3 ثوان متتالية.' },
  { id: 'pep3_35', domainId: 'gm', text: 'صعود السلم درجة درجة متبادلاً القدمين دون الاستناد على الدرابزين.' },
  { id: 'pep3_36', domainId: 'gm', text: 'رمي كرة متوسطة الحجم للأخصائي باليدين معاً من مسافة متر ونصف.' },
  { id: 'pep3_37', domainId: 'gm', text: 'ركل كرة متحركة بالقدم بقوة ودون فقدان التوازن.' },

  // --- Visual-Motor Imitation (VMI) ---
  { id: 'pep3_38', domainId: 'vmi', text: 'تقليد رسم خط مستقيم طولي وعرضي بعد مشاهدة الأخصائي يرسمه.' },
  { id: 'pep3_39', domainId: 'vmi', text: 'تقليد حركات حركية دقيقة للأصابع (مثال: فتح وقفل قبضة اليد أو ملامسة الأصابع).' },
  { id: 'pep3_40', domainId: 'vmi', text: 'تقليد حركات الوجه والشفاه (مثال: إخراج اللسان أو الابتسام العريض).' },
  { id: 'pep3_41', domainId: 'vmi', text: 'نسخ رسم دائرة بسيطة دون تتبع النقاط.' },
  { id: 'pep3_42', domainId: 'vmi', text: 'تقليد بناء نموذج بسيط من 4 قطع ليغو مباشرة خطوة بخطوة.' },

  // --- Affective Expression (AE) ---
  { id: 'pep3_43', domainId: 'ae', text: 'إبداء رد فعل انفعالي متوازن وطبيعي عند حجب لعبة أو مواجهة إحباط بسيط.' },
  { id: 'pep3_44', domainId: 'ae', text: 'مشاركة المشاعر الإيجابية (الابتسام المتبادل والتواصل الضحكي عند مداعبته).' },
  { id: 'pep3_45', domainId: 'ae', text: 'التعبير عن الألم أو الانزعاج بطريقة وظيفية بدلاً من البكاء القهري أو إيذاء الذات.' },
  { id: 'pep3_46', domainId: 'ae', text: 'إظهار الهدوء والتحكم الذاتي في البيئات المزدحمة أو عند سماع أصوات مفاجئة.' },

  // --- Social Reciprocity (SR) ---
  { id: 'pep3_47', domainId: 'sr', text: 'طلب التواصل البصري التلقائي والمستمر أثناء الحوار أو اللعب (التبادلية).' },
  { id: 'pep3_48', domainId: 'sr', text: 'الاستجابة لطلب اللعب التشاركي وتبادل الأدوار مع الأخصائي أو الأقران.' },
  { id: 'pep3_49', domainId: 'sr', text: 'الاستجابة للمبادرات الاجتماعية والترحيب بالآخرين (التحية باليد أو الابتسام).' },
  { id: 'pep3_50', domainId: 'sr', text: 'إبداء اهتمام مشترك بتوجيه انتباه الأخصائي لشيء ملفت بالإشارة والنظر المشترك.' },
];

export function calculatePEP3Score(scores) {
  let totalRawScore = 0;
  const subscales = PEP3_DOMAINS.map(dom => {
    const domItems = PEP3_ITEMS.filter(it => it.domainId === dom.id);
    let raw = 0;
    let answeredCount = 0;
    domItems.forEach(it => {
      const val = scores[it.id];
      if (val !== undefined) {
        raw += Number(val);
        answeredCount++;
      }
    });

    const isComplete = answeredCount === dom.itemsCount;
    const percentage = Math.round((raw / dom.maxRaw) * 100) || 0;

    // Academic T-Score Mapping approximation based on percentage
    let tScore = 30 + Math.round((raw / dom.maxRaw) * 40);
    if (tScore > 80) tScore = 80;
    if (tScore < 20) tScore = 20;

    // Academic Developmental Level Mapping
    let level = 'تأخر حاد';
    let severityColor = 'red';
    if (tScore >= 60) {
      level = 'طبيعي ومناسب';
      severityColor = 'green';
    } else if (tScore >= 50) {
      level = 'تأخر بسيط';
      severityColor = 'yellow';
    } else if (tScore >= 40) {
      level = 'تأخر متوسط';
      severityColor = 'orange';
    }

    return {
      ...dom,
      raw,
      tScore,
      level,
      severityColor,
      isComplete,
      percentage,
    };
  });

  const totalAnswered = Object.keys(scores).filter(id => scores[id] !== undefined).length;
  const isComplete = totalAnswered === 50;

  subscales.forEach(s => {
    totalRawScore += s.raw;
  });

  // Calculate overall Developmental Age Equivalent (السن النمائي المقدر) based on raw score
  // Range: Raw Score 0 to 100
  let estimatedDevelopmentalAge = 'غير محدد';
  let overallLevel = 'تأخر نمائي حاد شديد';
  let overallColor = 'red';
  let percentile = 1;

  if (totalRawScore >= 95) {
    estimatedDevelopmentalAge = '60-72 شهراً (5-6 سنوات)';
    overallLevel = 'نمو طبيعي متكافئ ومناسب للعمر';
    overallColor = 'green';
    percentile = 84;
  } else if (totalRawScore >= 80) {
    estimatedDevelopmentalAge = '48-60 شهراً (4-5 سنوات)';
    overallLevel = 'تأخر نمائي بسيط جداً (قريب من الطبيعي)';
    overallColor = 'green';
    percentile = 65;
  } else if (totalRawScore >= 60) {
    estimatedDevelopmentalAge = '36-48 شهراً (3-4 سنوات)';
    overallLevel = 'تأخر نمائي بسيط (بين بزوغ ونمو)';
    overallColor = 'yellow';
    percentile = 45;
  } else if (totalRawScore >= 40) {
    estimatedDevelopmentalAge = '24-36 شهراً (2-3 سنوات)';
    overallLevel = 'تأخر نمائي متوسط (بحاجة لتدخل مستمر)';
    overallColor = 'orange';
    percentile = 16;
  } else if (totalRawScore >= 20) {
    estimatedDevelopmentalAge = '12-24 شهراً (1-2 سنة)';
    overallLevel = 'تأخر نمائي شديد (فجوة نمائية واسعة)';
    overallColor = 'red';
    percentile = 5;
  } else {
    estimatedDevelopmentalAge = '0-12 شهراً (أقل من سنة)';
    overallLevel = 'تأخر نمائي شديد جداً (حاجة ماسة لتدخل مبكر مكثف)';
    overallColor = 'red';
    percentile = 1;
  }

  // Academic score description
  const interpretation = `أظهر التقييم الشامل لملف التقييم النفسي التربوي (PEP-3) المطور للمفحوص درجة نمائية خام تبلغ (${totalRawScore} من أصل 100)، وهو ما يعادل تقريبياً سناً نمائياً يقدر بـ (${estimatedDevelopmentalAge}). يُظهر الأداء العام نمطاً من [${overallLevel}]. ويتبين من تحليل أبعاد التقييم وجود تفاوت بين المهارات الأدائية والمهارات التكيفية واللغوية، مما يستدعي بناء خطة تربوية علاجية متخصصة ترتكز على نقاط البزوغ (Emerging) لردم الفجوة النمائية وسد الاحتياج بالكامل.`;

  return {
    totalRawScore,
    maxRawScore: 100,
    subscales,
    isComplete,
    estimatedDevelopmentalAge,
    overallLevel,
    overallColor,
    percentile,
    interpretation,
  };
}
