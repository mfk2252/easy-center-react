/**
 * بيب-3 (PEP-3) - ملف التقييم النفسي التربوي - الإصدار الثالث المطور
 * Psychoeducational Profile, Third Edition (PEP-3)
 * أداة التشخيص والتقييم السيكومتري لمهارات النمو والسلوك التكيفي للأطفال ذوي اضطراب طيف التوحد
 */

export const PEP3_COPYRIGHT_INFO = {
  scaleNameAr: 'ملف التقييم النفسي التربوي للتوحد — الإصدار الثالث المقنن',
  scaleNameEn: 'Psychoeducational Profile, Third Edition (PEP-3)',
  scaleShortName: 'PEP-3',
  authorAr: 'د. إيريك شوبلر، مارغريت د. لانسينغ، روبرت جيه رايشلر، وليندساي م. ماركوس (Eric Schopler, Ph.D. et al.)',
  authorEn: 'Eric Schopler, Margaret D. Lansing, Robert J. Reichler, & Lee M. Marcus',
  publisherAr: 'دار برو-إد للنشر والاختبارات النفسية (PRO-ED, Inc.) / برنامج تيتش (TEACCH Autism Program)',
  publisherEn: 'PRO-ED, Inc. / Division TEACCH, University of North Carolina at Chapel Hill',
  adaptationAr: 'التقنين والتعريب المعتمد لبيئة التربية الخاصة والمراكز التأهيلية المعتمدة',
  targetAge: 'من عمر 24 شهراً حتى 90 شهراً (سنتان إلى 7 سنوات ونصف) والأعمار الأكبر ذوي المستوى النمائي المقارب',
  standardsReference: 'منهجية برنامج تيتش (TEACCH) والدليل التشخيصي والإحصائي للاضطرابات النفسية (DSM-5)',
  notice: 'هذا المقياس وأدواته السيكومترية مخصصة للاستخدام الإكلينيكي والتشخيصي والتربوي المرخص للمراكز والمؤسسات التأهيلية وفرق التربية الخاصة والتشخيص النفسي. جميع حقوق الملكية الفكرية محفوظة لدار النشر PRO-ED والمؤلفين الأصليين وبرنامج TEACCH، ويخضع تطبيق المقياس واستخراج تقاريره للأمانة العلمية وأخلاقيات التقييم النفسي والتربوي.',
  disclaimer: 'تنبيه مهني: يعد مقياس PEP-3 أداة نمائية وتشخيصية مرجعية لتحديد السن النمائي ونقاط القوة والبزوغ (Emerging)، ويجب أن تتكامل نتائجه مع التقييم الطبي العصبي الشامل، وملاحظة السلوك المباشر، وتاريخ الحالة النمائي لتصميم الخطة التربوية التأهيلية الفردية (IEP).',
};

export const PEP3_DOMAINS = [
  {
    id: 'cvp',
    code: 'CVP',
    name: 'الإدراك اللفظي وغير اللفظي',
    englishName: 'Cognitive Verbal / Preverbal',
    color: '#2563eb',
    bgLight: '#eff6ff',
    borderColor: '#93c5fd',
    itemsCount: 10,
    maxRaw: 20,
    description: 'يقيس مهارات حل المشكلات، المطابقة، الفرز، إدراك دوام الأشياء، والوظائف المعرفية الاستكشافية.',
  },
  {
    id: 'el',
    code: 'EL',
    name: 'التعبير اللغوي والتواصل',
    englishName: 'Expressive Language',
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#a7f3d0',
    itemsCount: 8,
    maxRaw: 16,
    description: 'يقيس النطق، تسمية الأشياء، بناء الجمل والعبارات، واستخدام الكلمات الوظيفية للتعبير عن الرغبات.',
  },
  {
    id: 'rl',
    code: 'RL',
    name: 'اللغة الاستقبالية وفهم التوجيهات',
    englishName: 'Receptive Language',
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#ddd6fe',
    itemsCount: 7,
    maxRaw: 14,
    description: 'يقيس فهم الأوامر البسيطة والمركبة، تمييز أجزاء الجسم والمجسمات، والاستجابة للنداء والنهي.',
  },
  {
    id: 'fm',
    code: 'FM',
    name: 'المهارات الحركية الدقيقة',
    englishName: 'Fine Motor',
    color: '#db2777',
    bgLight: '#fdf2f8',
    borderColor: '#fbcfe8',
    itemsCount: 6,
    maxRaw: 12,
    description: 'يقيس التآزر الحركي البصري، القبض على الأدوات، لضم الخرز، القص بالمقص، وتقليب الصفحات.',
  },
  {
    id: 'gm',
    code: 'GM',
    name: 'المهارات الحركية الكبيرة',
    englishName: 'Gross Motor',
    color: '#ea580c',
    bgLight: '#fff7ed',
    borderColor: '#fed7aa',
    itemsCount: 6,
    maxRaw: 12,
    description: 'يقيس التوازن الحركي، المشي على خط مستقيم، القفز، صعود السلالم، ورمي وركل الكرة.',
  },
  {
    id: 'vmi',
    code: 'VMI',
    name: 'التقليد البصري الحركي',
    englishName: 'Visual-Motor Imitation',
    color: '#0891b2',
    bgLight: '#ecfeff',
    borderColor: '#a5f3fc',
    itemsCount: 5,
    maxRaw: 10,
    description: 'يقيس القدرة على محاكاة وتقليد رسم الخطوط، الأشكال، حركات الأصابع والوجه، وبناء النماذج.',
  },
  {
    id: 'ae',
    code: 'AE',
    name: 'التعبير الانفعالي والتكيفي',
    englishName: 'Affective Expression',
    color: '#4f46e5',
    bgLight: '#eef2ff',
    borderColor: '#c7d2fe',
    itemsCount: 4,
    maxRaw: 8,
    description: 'يقيس التعبير العاطفي المتوازن، التحكم الذاتي عند الإحباط، والمشاركة الوجدانية الإيجابية.',
  },
  {
    id: 'sr',
    code: 'SR',
    name: 'التبادل والتفاعل الاجتماعي',
    englishName: 'Social Reciprocity',
    color: '#16a34a',
    bgLight: '#f0fdf4',
    borderColor: '#bbf7d0',
    itemsCount: 4,
    maxRaw: 8,
    description: 'يقيس التواصل البصري التلقائي، اللعب التشاركي وتبادل الأدوار، والاستجابة للمبادرات الاجتماعية.',
  },
];

export const PEP3_RESPONSE_OPTIONS = [
  { value: 2, score: 2, label: 'منجز (P)', code: 'Pass', text: 'يؤدي الاستجابة بنجاح تام واستقلالية كاملة', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  { value: 1, score: 1, label: 'بزوغ (E)', code: 'Emerging', text: 'يبدي محاولة أو فهماً جزئياً؛ وهي الفئة الأهم لأهداف الخطة الفردية', bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  { value: 0, score: 0, label: 'إخفاق (F)', code: 'Fail', text: 'لا يبدي محاولة صحيحة أو يرفض تماماً أداء النشاط', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
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
  let passCount = 0;
  let emergingCount = 0;
  let failCount = 0;

  const subscales = PEP3_DOMAINS.map(dom => {
    const domItems = PEP3_ITEMS.filter(it => it.domainId === dom.id);
    let raw = 0;
    let answeredCount = 0;
    let domPass = 0;
    let domEmerging = 0;
    let domFail = 0;

    domItems.forEach(it => {
      const val = scores[it.id];
      if (val !== undefined && val !== null && val !== '') {
        const num = Number(val);
        raw += num;
        answeredCount++;
        if (num === 2) {
          passCount++;
          domPass++;
        } else if (num === 1) {
          emergingCount++;
          domEmerging++;
        } else if (num === 0) {
          failCount++;
          domFail++;
        }
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
    let severityKey = 'severe';
    let severityColor = '#ef4444';
    if (tScore >= 60) {
      level = 'طبيعي ومناسب';
      severityKey = 'normal';
      severityColor = '#10b981';
    } else if (tScore >= 50) {
      level = 'تأخر بسيط';
      severityKey = 'mild';
      severityColor = '#3b82f6';
    } else if (tScore >= 40) {
      level = 'تأخر متوسط';
      severityKey = 'moderate';
      severityColor = '#f59e0b';
    }

    return {
      ...dom,
      raw,
      maxRaw: dom.maxRaw,
      tScore,
      level,
      severityKey,
      severityColor,
      isComplete,
      percentage,
      answeredCount,
      domPass,
      domEmerging,
      domFail,
    };
  });

  const totalAnswered = Object.keys(scores).filter(id => scores[id] !== undefined && scores[id] !== null && scores[id] !== '').length;
  const isComplete = totalAnswered === 50;
  const completionPercentage = Math.round((totalAnswered / 50) * 100);

  subscales.forEach(s => {
    totalRawScore += s.raw;
  });

  // Domain groupings
  const cognitiveSub = subscales.find(s => s.id === 'cvp')?.raw || 0;
  const languageSub = (subscales.find(s => s.id === 'el')?.raw || 0) + (subscales.find(s => s.id === 'rl')?.raw || 0);
  const motorSub = (subscales.find(s => s.id === 'fm')?.raw || 0) + (subscales.find(s => s.id === 'gm')?.raw || 0) + (subscales.find(s => s.id === 'vmi')?.raw || 0);
  const socialAdaptiveSub = (subscales.find(s => s.id === 'ae')?.raw || 0) + (subscales.find(s => s.id === 'sr')?.raw || 0);

  // Calculate overall Developmental Age Equivalent (السن النمائي المقدر) based on raw score
  // Range: Raw Score 0 to 100
  let estimatedDevelopmentalAge = 'غير محدد';
  let overallLevel = 'تأخر نمائي حاد شديد';
  let severityKey = 'severe';
  let severityColor = '#ef4444';
  let percentile = 1;

  if (totalRawScore >= 95) {
    estimatedDevelopmentalAge = '60-72 شهراً (5-6 سنوات)';
    overallLevel = 'نمو طبيعي متكافئ ومناسب للعمر';
    severityKey = 'normal';
    severityColor = '#10b981';
    percentile = 84;
  } else if (totalRawScore >= 80) {
    estimatedDevelopmentalAge = '48-60 شهراً (4-5 سنوات)';
    overallLevel = 'تأخر نمائي بسيط جداً (قريب من الطبيعي)';
    severityKey = 'mild_plus';
    severityColor = '#10b981';
    percentile = 65;
  } else if (totalRawScore >= 60) {
    estimatedDevelopmentalAge = '36-48 شهراً (3-4 سنوات)';
    overallLevel = 'تأخر نمائي بسيط (بين بزوغ ونمو)';
    severityKey = 'mild';
    severityColor = '#3b82f6';
    percentile = 45;
  } else if (totalRawScore >= 40) {
    estimatedDevelopmentalAge = '24-36 شهراً (2-3 سنوات)';
    overallLevel = 'تأخر نمائي متوسط (بحاجة لتدخل مستمر)';
    severityKey = 'moderate';
    severityColor = '#f59e0b';
    percentile = 16;
  } else if (totalRawScore >= 20) {
    estimatedDevelopmentalAge = '12-24 شهراً (1-2 سنة)';
    overallLevel = 'تأخر نمائي شديد (فجوة نمائية واسعة)';
    severityKey = 'severe';
    severityColor = '#ef4444';
    percentile = 5;
  } else {
    estimatedDevelopmentalAge = '0-12 شهراً (أقل من سنة)';
    overallLevel = 'تأخر نمائي شديد جداً (تدخل مبكر مكثف)';
    severityKey = 'critical';
    severityColor = '#dc2626';
    percentile = 1;
  }

  // Academic score description
  const interpretation = `أظهر التقييم الشامل لملف التقييم النفسي التربوي (PEP-3) المطور للمفحوص درجة نمائية خام إجمالية تبلغ (${totalRawScore} من أصل 100)، وهو ما يعادل تقريبياً سناً نمائياً يقدر بـ (${estimatedDevelopmentalAge}) برتبة مئينية (${percentile}%). يُظهر الأداء العام نمطاً من [${overallLevel}]. ويتبين من تحليل أبعاد التقييم وجود (${passCount}) مهارة مكتسبة بنجاح تام، مقابل (${emergingCount}) مهارة في طور البزوغ، و (${failCount}) مهارة بحاجة لتدريب تأسيسي. تشكل مهارات البزوغ (${emergingCount} مهارة) نقطة الانطلاق الأساسية لبناء أهداف الخطة التربوية الفردية (IEP) لردم الفجوة النمائية.`;

  return {
    totalRawScore,
    maxRawScore: 100,
    subscales,
    isComplete,
    totalAnswered,
    totalItems: 50,
    completionPercentage,
    passCount,
    emergingCount,
    failCount,
    cognitiveSub,
    languageSub,
    motorSub,
    socialAdaptiveSub,
    estimatedDevelopmentalAge,
    overallLevel,
    severityKey,
    severityColor,
    percentile,
    interpretation,
  };
}
