/**
 * Stanford-Binet Intelligence Scales - Fifth Edition (SB5)
 * مقياس ستانفورد - بينيه للذكاء - الصورة الخامسة المقننة
 * 
 * المؤلف الأصلي: د. جيل هـ. رويد (Gale H. Roid, Ph.D.) بناءً على مقاييس ألفريد بينيه وروبرت ل. ثورندايك
 * جهة النشر والتطوير: Riverside Insights (Riverside Publishing / Houghton Mifflin Harcourt)
 * التقنين والتعريب: نخبة من كبار أساتذة القياس النفسي والتربية الخاصة في البيئات العربية
 * 
 * المقياس المعتمد والرائد إكلينيكياً وتربوياً لقياس القدرات المعرفية ونسبة الذكاء من عمر سنتين حتى 85+ سنة.
 * يقوم المقياس على نموذج كتل ومحاور ثنائي الأبعاد (5 عوامل معرفية × مجالين أساسيين):
 * 1. المجال غير اللفظي (Nonverbal Domain)
 * 2. المجال اللفظي (Verbal Domain)
 * 
 * العوامل الخمسة (Five Cognitive Factors):
 * 1. الاستدلال السيالي / السائل (Fluid Reasoning - FR)
 * 2. المعرفة (Knowledge - KN)
 * 3. الاستدلال الكمي (Quantitative Reasoning - QR)
 * 4. المعالجة البصرية-المكانية (Visual-Spatial Processing - VS)
 * 5. الذاكرة العاملة (Working Memory - WM)
 */

export const SB5_COPYRIGHT_INFO = {
  scaleNameAr: 'مقياس ستانفورد - بينيه للذكاء — الصورة الخامسة (SB5)',
  scaleNameEn: 'Stanford-Binet Intelligence Scales — Fifth Edition (SB5)',
  scaleShortName: 'SB5',
  authorAr: 'د. جيل هـ. رويد (Gale H. Roid, Ph.D.) ونخبة من باحثي القياس النفسي',
  authorEn: 'Gale H. Roid, Ph.D. / Robert L. Thorndike & Colleagues',
  publisherAr: 'ريفرسايد إنسايتس الأمريكية (Riverside Insights / Riverside Publishing)',
  publisherEn: 'Riverside Insights / Riverside Publishing',
  adaptationAr: 'النسخة المقننة والمعربة المعتمدة في البيئات العربية والمراكز التشخيصية والعيادات النفسية',
  targetAge: 'من سن سنتين (2:0) حتى 85+ سنة (الأطفال، اليافعين، والراشدين)',
  standardsReference: 'معايير الجمعية الأمريكية لعلم النفس (APA) ودليل DSM-5 وتصنيفات IDEA للإعاقة الفكرية وبطء التعلم والموهبة والتفوق',
  diagnosticNature: 'أداة تقييم وتشخيص سيكومتري إكلينيكي وتربوي شامل معتمد',
  notice: 'مقياس ستانفورد - بينيه للذكاء (SB5) هو علامة تجارية مسجلة لشركة Riverside Insights. أداة القياس مخصصة للاستخدام المهني والتشخيصي للأخصائيين النفسيين المعتمدين والمؤسسات التأهيلية والتربوية لرسم الملف المعرفي وبناء الخطة التربوية الفردية (IEP).',
  disclaimer: 'تنبيه مهني: تفسر نتائج المقياس بواسطة أخصائي نفسي/إكلينيكي مؤهل في ضوء الملاحظة الإكلينيكية، والتاريخ التطوري، والتقييمات التكيفية والتحصيلية المساندة.',
};

export const SB5_DOMAINS = [
  {
    id: 'nonverbal',
    code: 'NV',
    name: 'المجال غير اللفظي',
    nameEn: 'Nonverbal Domain',
    icon: '🧩',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#7dd3fc',
    description: 'يقيس الأداء المعرفي والاستدلال وحل المشكلات باستخدام المثيرات البصرية واليدوية والحركية دون الاعتماد على اللغة.',
  },
  {
    id: 'verbal',
    code: 'V',
    name: 'المجال اللفظي',
    nameEn: 'Verbal Domain',
    icon: '🗣️',
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#c4b5fd',
    description: 'يقيس الاستدلال اللفظي، الحصيلة اللغوية، الفهم القرائي والسمعي، والقدرة على التعبير والشرح المفاهيمي.',
  },
];

export const SB5_FACTORS = [
  {
    id: 'fr',
    code: 'FR',
    name: 'الاستدلال السيالي (السائل)',
    nameEn: 'Fluid Reasoning (FR)',
    icon: '💡',
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    description: 'القدرة على حل المشكلات الجديدة وغير المألوفة، وتطبيق التفكير الاستقرائي والاستنباطي، واستنتاج القواعد المنطقية.',
  },
  {
    id: 'kn',
    code: 'KN',
    name: 'المعرفة والمعلومات',
    nameEn: 'Knowledge (KN)',
    icon: '📚',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#7dd3fc',
    description: 'المخزون المعرفي المكتسب من البيئة والتعليم والثقافة العامة، والمفردات اللغوية، والمفاهيم الاجتماعية.',
  },
  {
    id: 'qr',
    code: 'QR',
    name: 'الاستدلال الكمي والحسابي',
    nameEn: 'Quantitative Reasoning (QR)',
    icon: '🔢',
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fcd34d',
    description: 'القدرة على التفكير بالرموز والأرقام، حل المسائل الرياضية، والمقارنة الكمية اللفظية وغير اللفظية.',
  },
  {
    id: 'vs',
    code: 'VS',
    name: 'المعالجة البصرية-المكانية',
    nameEn: 'Visual-Spatial Processing (VS)',
    icon: '📐',
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#c4b5fd',
    description: 'رؤية الأنماط المكانية، تحليل وتجميع الأشكال الهندسية، الإدراك الاتجاهي، والتخيل البصري المجرد.',
  },
  {
    id: 'wm',
    code: 'WM',
    name: 'الذاكرة العاملة',
    nameEn: 'Working Memory (WM)',
    icon: '💾',
    color: '#dc2626',
    bgLight: '#fef2f2',
    borderColor: '#fca5a5',
    description: 'الاحتفاظ بالمعلومات اللفظية والبصرية مؤقتاً في الذهن ومعالجتها وتدويرها واسترجاعها بدقة.',
  },
];

export const SB5_SUBTESTS = [
  // 1. Fluid Reasoning Subtests
  {
    id: 'nv_fr',
    factorId: 'fr',
    domainId: 'nonverbal',
    code: 'NV-FR',
    name: 'الاستدلال السيالي غير اللفظي (المصفوفات وسلاسل الأشكال)',
    nameEn: 'Nonverbal Fluid Reasoning (Matrices & Object Series)',
    maxRawScore: 36,
    icon: '🧩',
    description: 'إكمال سلاسل الأشكال الهندسية واستنتاج النمط الناقص في المصفوفات البصرية التجريدية.',
  },
  {
    id: 'v_fr',
    factorId: 'fr',
    domainId: 'verbal',
    code: 'V-FR',
    name: 'الاستدلال السيالي اللفظي (السخافات اللفظية والمتشابهات)',
    nameEn: 'Verbal Fluid Reasoning (Verbal Absurdities & Analogies)',
    maxRawScore: 36,
    icon: '🗣️',
    description: 'تحديد ما هو غير منطقي أو سخيف في الجمل والقصص المسموعة، واستنتاج التماثل اللفظي.',
  },

  // 2. Knowledge Subtests
  {
    id: 'nv_kn',
    factorId: 'kn',
    domainId: 'nonverbal',
    code: 'NV-KN',
    name: 'المعرفة غير اللفظية (السخافات المصورة والتعرف الإجرائي)',
    nameEn: 'Nonverbal Knowledge (Procedural Knowledge & Picture Absurdities)',
    maxRawScore: 36,
    icon: '🖼️',
    description: 'التعرف على الأخطاء والتناقضات في الصور، وتحديد الاستخدام الصحيح للأدوات والأشياء.',
  },
  {
    id: 'v_kn',
    factorId: 'kn',
    domainId: 'verbal',
    code: 'V-KN',
    name: 'المعرفة اللفظية (المفردات وتحديد معاني الكلمات)',
    nameEn: 'Verbal Knowledge (Vocabulary & Word Definitions)',
    maxRawScore: 44,
    icon: '📖',
    description: 'تعريف وشرح معاني الكلمات والمفاهيم اللغوية المجردة والمحسوسة بدقة وتعبير سليم.',
  },

  // 3. Quantitative Reasoning Subtests
  {
    id: 'nv_qr',
    factorId: 'qr',
    domainId: 'nonverbal',
    code: 'NV-QR',
    name: 'الاستدلال الكمي غير اللفظي (المفاهيم الرياضية المصورة)',
    nameEn: 'Nonverbal Quantitative Reasoning (Visual Math & Patterns)',
    maxRawScore: 36,
    icon: '🔢',
    description: 'حل المشكلات العددية والكمية بالصور والرموز والمقارنات العددية دون نص لفظي.',
  },
  {
    id: 'v_qr',
    factorId: 'qr',
    domainId: 'verbal',
    code: 'V-QR',
    name: 'الاستدلال الكمي اللفظي (المسائل الحسابية اللفظية)',
    nameEn: 'Verbal Quantitative Reasoning (Word Math Problems)',
    maxRawScore: 36,
    icon: '🧮',
    description: 'حل المسائل الحسابية والمنطقية المصاغة شفهياً والتي تتطلب عمليات جمع وطرح وتفكير نسبي.',
  },

  // 4. Visual-Spatial Processing Subtests
  {
    id: 'nv_vs',
    factorId: 'vs',
    domainId: 'nonverbal',
    code: 'NV-VS',
    name: 'المعالجة البصرية-المكانية غير اللفظية (لوحة الأشكال وتركيب النماذج)',
    nameEn: 'Nonverbal Visual-Spatial (Form Board & Pattern Analysis)',
    maxRawScore: 36,
    icon: '📐',
    description: 'تركيب وتطابق النماذج الهندسية وتجميع القطع لتشكيل نماذج مطابقة للهدف ضمن زمن قياسي.',
  },
  {
    id: 'v_vs',
    factorId: 'vs',
    domainId: 'verbal',
    code: 'V-VS',
    name: 'المعالجة البصرية-المكانية اللفظية (الاتجاهات والمواضع المكانية)',
    nameEn: 'Verbal Visual-Spatial (Position & Direction)',
    maxRawScore: 36,
    icon: '🧭',
    description: 'تفسير وتطبيق التعليمات اللفظية المكانية (فوق، تحت، يمين، يسار، خرائط ذهنية وتوجه فراغي).',
  },

  // 5. Working Memory Subtests
  {
    id: 'nv_wm',
    factorId: 'wm',
    domainId: 'nonverbal',
    code: 'NV-WM',
    name: 'الذاكرة العاملة غير اللفظية (الاستجابة المؤجلة وحفظ المواقع)',
    nameEn: 'Nonverbal Working Memory (Delayed Response & Block Span)',
    maxRawScore: 36,
    icon: '🎯',
    description: 'تذكر مسار وحركات النقر على المكعبات واسترجاع أماكن الأشياء المخفية بعد فترة انتظار.',
  },
  {
    id: 'v_wm',
    factorId: 'wm',
    domainId: 'verbal',
    code: 'V-WM',
    name: 'الذاكرة العاملة اللفظية (إعادة الأرقام والذاكرة للجمل)',
    nameEn: 'Verbal Working Memory (Digit Span & Memory for Sentences)',
    maxRawScore: 40,
    icon: '📞',
    description: 'إعادة سلاسل الأرقام بالترتيب المباشر والعكسي، وحفظ وتكرار الجمل المعقدة بدقة تامة.',
  },
];

export const SB5_RESPONSE_OPTIONS = [
  {
    value: 3,
    score: 3,
    label: '3 - إتقان كامل ومستوى تجريدي مرتفع',
    description: 'استجابة سريعة وصحيحة ونموذجية تعكس فهماً تجريدياً عالياً للمهمة المعرفية.',
    badgeClass: 'b-gr',
  },
  {
    value: 2,
    score: 2,
    label: '2 - أداء ناجح ومناسب للعمر (متوسط)',
    description: 'إنجاز المهمة بنجاح وبشكل صحيح وضمن الزمن المعتاد للمستوى النمائي.',
    badgeClass: 'b-bl',
  },
  {
    value: 1,
    score: 1,
    label: '1 - استجابة جزئية أو بمساعدة (منخفض)',
    description: 'أداء جزئي صحيح أو إنجاز بعد محاولات متكررة أو تجاوز زمن الاستجابة القياسي.',
    badgeClass: 'b-or',
  },
  {
    value: 0,
    score: 0,
    label: '0 - عدم القدرة على الحل / استجابة خاطئة',
    description: 'عجز عن إتمام المهمة المعرفية أو تقديم استجابة خاطئة وغير ملائمة.',
    badgeClass: 'b-rd',
  },
];

export const SB5_ITEMS = [
  // 1. Nonverbal Fluid Reasoning (NV-FR) - 3 items
  {
    id: 1,
    subtestId: 'nv_fr',
    factorId: 'fr',
    domainId: 'nonverbal',
    title: 'إكمال سلاسل الأنماط البصرية الهندسية المتسلسلة',
    description: 'يقيس استنتاج القواعد الهندسية وتوقع العنصر التالي في السلسلة البصرية.',
    iepGoal: 'تدريب الطالب على استنتاج العلاقات المتسلسلة وإكمال الأنماط الهندسية بدقة 80%.',
  },
  {
    id: 2,
    subtestId: 'nv_fr',
    factorId: 'fr',
    domainId: 'nonverbal',
    title: 'حل مصفوفات الأشكال التجريدية (2×2 و 3×3)',
    description: 'يقيس التفكير الاستقرائي والتحليلي لاختيار الشكل المكمل للمصفوفة المنطقية.',
    iepGoal: 'تنمية مهارات التفكير المنطقي التجريدي وحل المصفوفات البصرية متعددة المتغيرات.',
  },
  {
    id: 3,
    subtestId: 'nv_fr',
    factorId: 'fr',
    domainId: 'nonverbal',
    title: 'تصنيف الأشكال غير اللفظية واستبعاد الشاذ',
    description: 'يقيس فرز وتصنيف المجموعات الهندسية واستخراج العنصر المخالف للقاعدة.',
    iepGoal: 'تعزيز مهارات التصنيف واستخراج الخصائص المشتركة بين المثيرات البصرية.',
  },

  // 2. Verbal Fluid Reasoning (V-FR) - 3 items
  {
    id: 4,
    subtestId: 'v_fr',
    factorId: 'fr',
    domainId: 'verbal',
    title: 'اكتشاف السخافات والتناقضات في الجمل المسموعة',
    description: 'يقيس الاستماع الناقد وتحديد الخطأ المنطقي في العبارات والأوصاف.',
    iepGoal: 'تطوير مهارة التفكير الناقد واكتشاف التناقضات اللفظية والتعليل المنطقي.',
  },
  {
    id: 5,
    subtestId: 'v_fr',
    factorId: 'fr',
    domainId: 'verbal',
    title: 'إدراك المتشابهات والعلاقات التناظرية اللفظية (أ : ب كـ ج : د)',
    description: 'يقيس استنتاج العلاقة المفهومية وتطبيقها على أزواج كلمات جديدة.',
    iepGoal: 'تدريب الطالب على إكمال التناظرات اللفظية وتوضيح طبيعة العلاقة الرابطة.',
  },
  {
    id: 6,
    subtestId: 'v_fr',
    factorId: 'fr',
    domainId: 'verbal',
    title: 'حل المشكلات الاستدلالية اللفظية الافتراضية',
    description: 'يقيس توليد الحلول والاستدلال الاستنباطي في مواقف لغوية فرضية.',
    iepGoal: 'تنمية الاستدلال اللفظي ومهارات التفكير الإجرائي في حل المشكلات اليومية.',
  },

  // 3. Nonverbal Knowledge (NV-KN) - 3 items
  {
    id: 7,
    subtestId: 'nv_kn',
    factorId: 'kn',
    domainId: 'nonverbal',
    title: 'تحديد السخافات والأخطاء في المشاهد المصورة',
    description: 'يقيس الربط بين المعرفة الواقعية المكتسبة والتفاصيل البصرية في الصور.',
    iepGoal: 'تحسين الانتباه للأخطاء البيئية والمفاهيمية في الصور وتصحيحها منطقياً.',
  },
  {
    id: 8,
    subtestId: 'nv_kn',
    factorId: 'kn',
    domainId: 'nonverbal',
    title: 'التعرف على الوظائف والاستخدام الإجرائي للأدوات',
    description: 'يقيس معرفة وظائف الأدوات الحياتية والمادية وطريقة توظيفها الصحيحة.',
    iepGoal: 'تعزيز المعرفة الوظيفية بالأدوات واستخداماتها الحياتية اليومية.',
  },
  {
    id: 9,
    subtestId: 'nv_kn',
    factorId: 'kn',
    domainId: 'nonverbal',
    title: 'تسلسل الأحداث الزمنية المصورة (ترتيب القصة الصامتة)',
    description: 'يقيس المعرفة بالنظام السببي والزمني للأحداث الطبيعية والاجتماعية.',
    iepGoal: 'تدريب التلميذ على ترتيب أحداث القصص المصورة بالتسلسل الزمني والسببي السليم.',
  },

  // 4. Verbal Knowledge (V-KN) - 4 items
  {
    id: 10,
    subtestId: 'v_kn',
    factorId: 'kn',
    domainId: 'verbal',
    title: 'تسمية وتحديد المفردات والمصطلحات الشائعة',
    description: 'يقيس الحصيلة المعجمية الأساسية والمعرفة اللغوية البيئية.',
    iepGoal: 'إثراء الحصيلة المعجمية وتسمية الأشياء والمفردات بدقة واستقلالية.',
  },
  {
    id: 11,
    subtestId: 'v_kn',
    factorId: 'kn',
    domainId: 'verbal',
    title: 'تقديم تعريفات لغوية واضحة للأشياء الملموسة',
    description: 'يقيس صياغة المفاهيم والتعبير عن الخصائص الجوهرية للأشياء.',
    iepGoal: 'تدريب الطالب على تقديم تعريفات وصفية ووظيفية سليمة للأشياء المألوفة.',
  },
  {
    id: 12,
    subtestId: 'v_kn',
    factorId: 'kn',
    domainId: 'verbal',
    title: 'شرح معاني المصطلحات التجريدية والمفاهيم المعنوية',
    description: 'يقيس المستوى التجريدي للمفردات كالمفاهيم الأخلاقية والعلمية.',
    iepGoal: 'تطوير مهارة شرح المفاهيم المعنوية المجردة والتعبير عنها بألفاظ بديلة.',
  },
  {
    id: 13,
    subtestId: 'v_kn',
    factorId: 'kn',
    domainId: 'verbal',
    title: 'الإجابة عن أسئلة الفهم والمعلومات العامة المكتسبة',
    description: 'يقيس سعة الثقافة والتعلم غير الرسمي والفضول المعرفي لدى المفحوص.',
    iepGoal: 'توسيع مدارك الطالب في العلوم والبيئة والمعلومات العامة من خلال القراءة والأنشطة.',
  },

  // 5. Nonverbal Quantitative Reasoning (NV-QR) - 3 items
  {
    id: 14,
    subtestId: 'nv_qr',
    factorId: 'qr',
    domainId: 'nonverbal',
    title: 'العد وتطابق الكميات والمجموعات البصرية',
    description: 'يقيس مفهوم ثبات العدد والتناظر الأحادي للأشياء والأشكال.',
    iepGoal: 'إتقان مهارات العد والمطابقة العددية للكميات حتى 20 بشكل مستقل.',
  },
  {
    id: 15,
    subtestId: 'nv_qr',
    factorId: 'qr',
    domainId: 'nonverbal',
    title: 'المقارنة الكمية (أكبر من / أصغر من / أطول / أثقل) بالمثيرات البصرية',
    description: 'يقيس إدراك العلاقات القياسية والحجمية والوزنية دون صياغة لفظية.',
    iepGoal: 'تنمية مفاهيم القياس والمقارنة الحجمية والوزنية عبر المثيرات الحسية.',
  },
  {
    id: 16,
    subtestId: 'nv_qr',
    factorId: 'qr',
    domainId: 'nonverbal',
    title: 'حل العمليات الحسابية المصورة والمصفوفات العددية',
    description: 'يقيس إجراء عمليات الجمع والضرب البسيطة واستنتاج الأنماط العددية المصورة.',
    iepGoal: 'إجراء العمليات الحسابية الأساسية الممثلة بالصور بنسبة دقة لا تقل عن 80%.',
  },

  // 6. Verbal Quantitative Reasoning (V-QR) - 3 items
  {
    id: 17,
    subtestId: 'v_qr',
    factorId: 'qr',
    domainId: 'verbal',
    title: 'حل المسائل الحسابية اللفظية البسيطة (الجمع والطرح)',
    description: 'يقيس تحويل المسألة الكلامية إلى عملية حسابية ذهنية مباشرة.',
    iepGoal: 'تدريب الطالب على حل المسائل الرياضية اللفظية المكونة من خطوة واحدة بدقة.',
  },
  {
    id: 18,
    subtestId: 'v_qr',
    factorId: 'qr',
    domainId: 'verbal',
    title: 'حل المسائل الرياضية اللفظية متعددة الخطوات',
    description: 'يقيس التخطيط الحسابي والتفكير الرياضي متعدد المراحل والتناسب.',
    iepGoal: 'تطوير استراتيجيات حل المسائل اللفظية متعددة الخطوات وتحديد المعطيات والمطلوب.',
  },
  {
    id: 19,
    subtestId: 'v_qr',
    factorId: 'qr',
    domainId: 'verbal',
    title: 'الاستدلال النسبي وفهم مفاهيم الكسور والنسب المئوية شفهياً',
    description: 'يقيس الفهم المفاهيمي للكسور والاحتمالات والمنطق الرياضي الشفهي.',
    iepGoal: 'استيعاب وتطبيق مفاهيم الكسور والأجزاء والنسب في المسائل الحياتية.',
  },

  // 7. Nonverbal Visual-Spatial Processing (NV-VS) - 3 items
  {
    id: 20,
    subtestId: 'nv_vs',
    factorId: 'vs',
    domainId: 'nonverbal',
    title: 'لوحة الأشكال وتطابق النماذج الهندسية',
    description: 'يقيس الإدراك الشكلي والتآزر البصري الحركي والتطابق المكاني.',
    iepGoal: 'تحسين التآزر البصري الحركي وتركيب الأشكال الهندسية في مواضعها الصحيحة.',
  },
  {
    id: 21,
    subtestId: 'nv_vs',
    factorId: 'vs',
    domainId: 'nonverbal',
    title: 'تحليل وتجميع النماذج التركيبية المجردة',
    description: 'يقيس التمييز بين الشكل والأرضية والقدرة على تحليل الكل إلى أجزاء.',
    iepGoal: 'تنمية مهارات التخطيط المكاني وتركيب النماذج المجردة بدقة وضمن الوقت المعياري.',
  },
  {
    id: 22,
    subtestId: 'nv_vs',
    factorId: 'vs',
    domainId: 'nonverbal',
    title: 'التدوير الذهني للأشكال ثلاثية الأبعاد والمصفوفات المكانية',
    description: 'يقيس القدرة على تخيل دوران الأشكال والمجسمات في الفضاء ذهنياً.',
    iepGoal: 'تدريب الطالب على التدوير الذهني وتخيل الأبعاد الفضائية للأشكال.',
  },

  // 8. Verbal Visual-Spatial Processing (V-VS) - 3 items
  {
    id: 23,
    subtestId: 'v_vs',
    factorId: 'vs',
    domainId: 'verbal',
    title: 'فهم وتطبيق التعليمات المكانية الأساسية (فوق، تحت، خلف، بجانب)',
    description: 'يقيس الترجمة اللفظية للمواقع والعلاقات الطبوغرافية.',
    iepGoal: 'استيعاب وتطبيق مفاهيم التوجه المكاني والظروف المكانية في البيئة المدرسية.',
  },
  {
    id: 24,
    subtestId: 'v_vs',
    factorId: 'vs',
    domainId: 'verbal',
    title: 'وصف وتتبع المسارات والاتجاهات على المخططات والخرائط',
    description: 'يقيس الملاحة المكانية وقراءة المسارات والتوجه الاتجاهي اللفظي.',
    iepGoal: 'تطوير القدرة على اتباع مسار اتجاهي شفهي وقراءة الخرائط التخطيطية المبسطة.',
  },
  {
    id: 25,
    subtestId: 'v_vs',
    factorId: 'vs',
    domainId: 'verbal',
    title: 'التحليل المكاني اللفظي ووصف العلاقات المنظورية',
    description: 'يقيس تخيل كيف يرى شخص آخر مشهداً معيناً من زاوية مختلفة ووصفه لغوياً.',
    iepGoal: 'تعزيز الإدراك المنظوري المكاني ووصف المواقع من وجهات نظر متعددة.',
  },

  // 9. Nonverbal Working Memory (NV-WM) - 3 items
  {
    id: 26,
    subtestId: 'nv_wm',
    factorId: 'wm',
    domainId: 'nonverbal',
    title: 'الاستجابة المؤجلة وتذكر المواقع المخفية للأشياء',
    description: 'يقيس دوام الموضوع والاحتفاظ المؤقت بالمواقع البصرية تحت التشتت.',
    iepGoal: 'زيادة سعة الانتباه والاحتفاظ بالمواقع المكانية للأشياء في الذاكرة قصيرة المدى.',
  },
  {
    id: 27,
    subtestId: 'nv_wm',
    factorId: 'wm',
    domainId: 'nonverbal',
    title: 'إعادة مسارات النقر على المكعبات بالترتيب المباشر',
    description: 'يقيس مدى الذاكرة البصرية المكانية التسلسلية الفورية.',
    iepGoal: 'تنمية مدى الذاكرة البصرية التسلسلية لتكرار 4 إلى 5 حركات متتالية بدقة.',
  },
  {
    id: 28,
    subtestId: 'nv_wm',
    factorId: 'wm',
    domainId: 'nonverbal',
    title: 'إعادة مسارات النقر على المكعبات بالترتيب العكسي',
    description: 'يقيس معالجة وتدوير المعلومات البصرية في الذاكرة العاملة النشطة.',
    iepGoal: 'تدريب المفحوص على استرجاع السلاسل البصرية بالعكس لتعزيز كفاءة الذاكرة العاملة.',
  },

  // 10. Verbal Working Memory (V-WM) - 4 items
  {
    id: 29,
    subtestId: 'v_wm',
    factorId: 'wm',
    domainId: 'verbal',
    title: 'إعادة سلاسل الأرقام المسموعة بالترتيب المباشر (Digit Span Forward)',
    description: 'يقيس سعة التخزين السمعي قصير المدى للأرقام المتتالية.',
    iepGoal: 'زيادة سعة الذاكرة السمعية المباشرة لتكرار 5 أرقام متسلسلة بدقة.',
  },
  {
    id: 30,
    subtestId: 'v_wm',
    factorId: 'wm',
    domainId: 'verbal',
    title: 'إعادة سلاسل الأرقام المسموعة بالترتيب العكسي (Digit Span Backward)',
    description: 'يقيس المعالجة الذهنية النشطة وضبط الانتباه في الذاكرة السمعية.',
    iepGoal: 'تنمية قدرة الطالب على تدوير المعلومات السمعية واسترجاع الأرقام بالعكس.',
  },
  {
    id: 31,
    subtestId: 'v_wm',
    factorId: 'wm',
    domainId: 'verbal',
    title: 'الذاكرة للجمل والعبارات الطويلة وتكرارها دون حذف أو تحريف',
    description: 'يقيس الاحتفاظ بالبنية اللغوية والنحوية في الذاكرة العاملة اللفظية.',
    iepGoal: 'تحسين الاستماع المركز وتكرار جمل تامة من 8 إلى 12 كلمة بدقة تامة.',
  },
  {
    id: 32,
    subtestId: 'v_wm',
    factorId: 'wm',
    domainId: 'verbal',
    title: 'تذكر الكلمات الأخيرة من سلاسل الجمل المتتالية (Working Memory Span)',
    description: 'يقيس الاحتفاظ المزدوج بالمعلومات واستخراج العناصر المحددة أثناء المعالجة.',
    iepGoal: 'تعزيز الذاكرة العاملة المعقدة واسترجاع الكلمات المفتاحية من السياقات المسموعة.',
  },
];

/**
 * Calculates psychometric standard scores, factor index composites,
 * Nonverbal IQ (NVIQ), Verbal IQ (VIQ), and Full Scale IQ (FSIQ) for Stanford-Binet 5.
 * 
 * Standard Metric in SB5:
 * - Subtest Scaled Scores: Mean = 10, SD = 3 (Range: 1-19)
 * - Factor Index Scores & Composite IQs (NVIQ, VIQ, FSIQ): Mean = 100, SD = 15 (Range: 40-160)
 */
export function calculateSB5Psychometrics(scores = {}, rawOverrides = {}) {
  let totalAnswered = 0;
  let totalRawScore = 0;

  // Calculate results for each of the 10 subtests
  const subtestResults = SB5_SUBTESTS.map(st => {
    const stItems = SB5_ITEMS.filter(it => it.subtestId === st.id);
    let stAnswered = 0;
    let stItemsRaw = 0;

    stItems.forEach(it => {
      if (scores[it.id] !== undefined && scores[it.id] !== null && scores[it.id] !== '') {
        stAnswered++;
        stItemsRaw += Number(scores[it.id]);
      }
    });

    totalAnswered += stAnswered;

    // Check if user provided manual raw score override for this subtest, else derive from items
    const maxPossibleFromItems = stItems.length * 3;
    let rawScore = stItemsRaw;
    if (rawOverrides[st.id] !== undefined && rawOverrides[st.id] !== '' && !isNaN(Number(rawOverrides[st.id]))) {
      rawScore = Number(rawOverrides[st.id]);
    }

    totalRawScore += rawScore;

    // Scaled Score (1 to 19): Mean = 10, SD = 3
    // Derived from percentage of max possible score
    const maxRaw = st.maxRawScore || (maxPossibleFromItems > 0 ? maxPossibleFromItems : 36);
    const fraction = maxPossibleFromItems > 0 ? (stItemsRaw / maxPossibleFromItems) : (rawScore / maxRaw);
    let scaledScore = Math.round(1 + fraction * 18);
    if (scaledScore < 1) scaledScore = 1;
    if (scaledScore > 19) scaledScore = 19;

    let subtestLevel = 'متوسط طبيعي';
    let subtestColor = '#059669';
    if (scaledScore >= 16) {
      subtestLevel = 'مرتفع جداً / تفوق بارز (Very Superior)';
      subtestColor = '#1e3a8a';
    } else if (scaledScore >= 13) {
      subtestLevel = 'فوق المتوسط / متفوق (Superior)';
      subtestColor = '#2563eb';
    } else if (scaledScore >= 8) {
      subtestLevel = 'متوسط طبيعي (Average)';
      subtestColor = '#059669';
    } else if (scaledScore >= 6) {
      subtestLevel = 'متوسط منخفض (Low Average)';
      subtestColor = '#d97706';
    } else if (scaledScore >= 4) {
      subtestLevel = 'حدّي / بطء تعلم (Borderline)';
      subtestColor = '#ea580c';
    } else {
      subtestLevel = 'قصور إدراكي ملحوظ (Deficit)';
      subtestColor = '#dc2626';
    }

    return {
      id: st.id,
      code: st.code,
      name: st.name,
      nameEn: st.nameEn,
      factorId: st.factorId,
      domainId: st.domainId,
      icon: st.icon,
      itemsCount: stItems.length,
      answeredCount: stAnswered,
      rawScore,
      maxRaw,
      scaledScore,
      subtestLevel,
      subtestColor,
      isStrength: scaledScore >= 13,
      isDeficit: scaledScore <= 6,
    };
  });

  // Calculate Factor Index Scores (5 Factors: FR, KN, QR, VS, WM)
  // Each Factor = Sum of 2 subtests (1 NV + 1 V). Mean sum = 20, SD sum ≈ 4.24.
  // Formula: Composite = 100 + ((Sum - 20) / 4.24) * 15
  const factorResults = SB5_FACTORS.map(fac => {
    const facSubtests = subtestResults.filter(st => st.factorId === fac.id);
    const sumScaled = facSubtests.reduce((acc, s) => acc + s.scaledScore, 0);
    const rawSum = facSubtests.reduce((acc, s) => acc + s.rawScore, 0);

    let compositeScore = Math.round(100 + ((sumScaled - 20) / 4.24) * 15);
    if (compositeScore < 40) compositeScore = 40;
    if (compositeScore > 160) compositeScore = 160;

    // Percentile for factor
    let percentile = 50;
    if (compositeScore >= 130) percentile = 98;
    else if (compositeScore >= 120) percentile = 91;
    else if (compositeScore >= 110) percentile = 75;
    else if (compositeScore >= 90) percentile = 50;
    else if (compositeScore >= 80) percentile = 16;
    else if (compositeScore >= 70) percentile = 5;
    else percentile = 1;

    let level = 'متوسط طبيعي (Average)';
    let levelColor = '#059669';
    if (compositeScore >= 130) {
      level = 'مرتفع جداً / موهبة وتفوق (Very Superior)';
      levelColor = '#1e3a8a';
    } else if (compositeScore >= 120) {
      level = 'فوق المتوسط / متفوق (Superior)';
      levelColor = '#2563eb';
    } else if (compositeScore >= 110) {
      level = 'متوسط مرتفع (High Average)';
      levelColor = '#0284c7';
    } else if (compositeScore >= 90) {
      level = 'متوسط طبيعي (Average)';
      levelColor = '#059669';
    } else if (compositeScore >= 80) {
      level = 'متوسط منخفض (Low Average)';
      levelColor = '#d97706';
    } else if (compositeScore >= 70) {
      level = 'حدّي / بطء تعلم (Borderline)';
      levelColor = '#ea580c';
    } else if (compositeScore >= 55) {
      level = 'قصور فكري ومعرفي بسيط (Mild ID)';
      levelColor = '#dc2626';
    } else {
      level = 'قصور فكري متوسط إلى شديد (Moderate/Severe)';
      levelColor = '#991b1b';
    }

    return {
      id: fac.id,
      code: fac.code,
      name: fac.name,
      nameEn: fac.nameEn,
      icon: fac.icon,
      color: fac.color,
      bgLight: fac.bgLight,
      borderColor: fac.borderColor,
      description: fac.description,
      sumScaled,
      rawSum,
      compositeScore,
      percentile,
      level,
      levelColor,
      isStrength: compositeScore >= 115,
      isDeficit: compositeScore <= 85,
    };
  });

  // Calculate Nonverbal Domain IQ (NVIQ): 5 NV subtests. Mean sum = 50, SD ≈ 7.5.
  const nvSubtests = subtestResults.filter(st => st.domainId === 'nonverbal');
  const nvSumScaled = nvSubtests.reduce((acc, s) => acc + s.scaledScore, 0);
  let nviq = Math.round(100 + ((nvSumScaled - 50) / 7.5) * 15);
  if (nviq < 40) nviq = 40;
  if (nviq > 160) nviq = 160;

  // Calculate Verbal Domain IQ (VIQ): 5 V subtests. Mean sum = 50, SD ≈ 7.5.
  const vSubtests = subtestResults.filter(st => st.domainId === 'verbal');
  const vSumScaled = vSubtests.reduce((acc, s) => acc + s.scaledScore, 0);
  let viq = Math.round(100 + ((vSumScaled - 50) / 7.5) * 15);
  if (viq < 40) viq = 40;
  if (viq > 160) viq = 160;

  // Full Scale IQ (FSIQ): 10 subtests total. Mean sum = 100, SD ≈ 10.6.
  const sumScaledAll10 = subtestResults.reduce((acc, s) => acc + s.scaledScore, 0);
  let fsiq = Math.round(100 + ((sumScaledAll10 - 100) / 10.6) * 15);
  if (fsiq < 40) fsiq = 40;
  if (fsiq > 160) fsiq = 160;

  // Percentiles for FSIQ, NVIQ, VIQ
  const getPercentile = (iq) => {
    if (iq >= 135) return 99;
    if (iq >= 130) return 98;
    if (iq >= 125) return 95;
    if (iq >= 120) return 91;
    if (iq >= 115) return 84;
    if (iq >= 110) return 75;
    if (iq >= 105) return 63;
    if (iq >= 100) return 50;
    if (iq >= 95) return 37;
    if (iq >= 90) return 25;
    if (iq >= 85) return 16;
    if (iq >= 80) return 9;
    if (iq >= 75) return 5;
    if (iq >= 70) return 2;
    return 1;
  };

  const fsiqPercentile = getPercentile(fsiq);
  const nviqPercentile = getPercentile(nviq);
  const viqPercentile = getPercentile(viq);

  // Classification & Clinical Impression
  let classification = 'متوسط طبيعي (Average)';
  let classificationEn = 'Average Range';
  let severityKey = 'average';
  let severityColor = '#059669';
  let clinicalImpression = '';
  let recommendations = '';

  if (fsiq >= 130) {
    classification = 'موهبة وتفوق عقلي استثنائي (Extremely High / Gifted)';
    classificationEn = 'Very Superior / Gifted';
    severityKey = 'gifted';
    severityColor = '#1e3a8a';
    clinicalImpression = `أظهر المفحوص أداءً عقلياً فائقاً يقع ضمن فئة الموهبة والتفوق المعرفي (معامل ذكاء كلي SB5 FSIQ: ${fsiq} برتبة مئينية ${fsiqPercentile}%). يتميز بقدرة استثنائية على التفكير التجريدي والحل الابتكاري للمشكلات المعقدة.`;
    recommendations = '1. إلحاق الطالب ببرامج رعاية الموهوبين والأنشطة الإثرائية المتقدمة وتطوير مهارات التفكير العليا.\n2. تقديم مشاريع تعلم قائمة على الاستقصاء وحل المشكلات المفتوحة والبحث الذاتي.\n3. توفير الإرشاد النفسي الأكاديمي لتعزيز التوافق والدافعية وتجنب الملل الصفي.';
  } else if (fsiq >= 120) {
    classification = 'فوق المتوسط / متفوق (Superior)';
    classificationEn = 'Superior';
    severityKey = 'superior';
    severityColor = '#2563eb';
    clinicalImpression = `تقع القدرات العقلية العامة للمفحوص في نطاق المتفوقين فوق المتوسط (معامل ذكاء كلي SB5 FSIQ: ${fsiq} برتبة مئينية ${fsiqPercentile}%). يمتلك كفاءة معرفية متقدمة وسرعة عالية في التعلم والاستيعاب.`;
    recommendations = '1. تقديم مناهج ومواد إثرائية متقدمة في مجالات تميزه المعرفي (اللفظي وغير اللفظي).\n2. تشجيعه على المشاركة في الأنشطة القيادية والمسابقات العلمية والمناظرات الفكرية.';
  } else if (fsiq >= 110) {
    classification = 'متوسط مرتفع (High Average)';
    classificationEn = 'High Average';
    severityKey = 'high_average';
    severityColor = '#0284c7';
    clinicalImpression = `تقع القدرات المعرفية للمفحوص في نطاق المتوسط المرتفع (معامل ذكاء كلي SB5 FSIQ: ${fsiq} برتبة مئينية ${fsiqPercentile}%). يتمتع بأداء معرفي متسق يؤهله للتحصيل الأكاديمي المتميز.`;
    recommendations = '1. الاستمرار في تعزيز التفكير الناقد واستراتيجيات التعلم المنظم ذاتياً.\n2. تحفيز الإبداع وتنمية مجالات القوة المعرفية المحددة في التقييم.';
  } else if (fsiq >= 90) {
    classification = 'متوسط طبيعي (Average Ability)';
    classificationEn = 'Average Range';
    severityKey = 'average';
    severityColor = '#059669';
    clinicalImpression = `تقع القدرات العقلية العامة للمفحوص ضمن النطاق الطبيعي المعتاد لأقرانه في نفس العمر الزمني (معامل ذكاء كلي SB5 FSIQ: ${fsiq} برتبة مئينية ${fsiqPercentile}%). يتطابق أداؤه المعرفي مع متطلبات المرحلة النمائية.`;
    recommendations = '1. الاستمرار في برامج التعليم العام مع دعم أساليب التعلم الفردية المفضلة (بصرية أو لفظية).\n2. تدريب مهارات الذاكرة العاملة والاستدلال المنطقي لتعزيز الكفاءة الأكاديمية.';
  } else if (fsiq >= 80) {
    classification = 'متوسط منخفض (Low Average)';
    classificationEn = 'Low Average';
    severityKey = 'low_average';
    severityColor = '#d97706';
    clinicalImpression = `تقع القدرات المعرفية للمفحوص في نطاق المتوسط المنخفض (معامل ذكاء كلي SB5 FSIQ: ${fsiq} برتبة مئينية ${fsiqPercentile}%). قد يواجه بعض البطء أو التحديات في استيعاب المفاهيم المجردة المعقدة.`;
    recommendations = '1. تقديم شروحات مبسطة ومجزأة للمفاهيم الصعبة مع استخدام الوسائل المحسوسة والبصرية.\n2. إتاحة وقت إضافي لإنجاز المهام والواجبات المدرسية.\n3. المتابعة المستمرة وتطبيق استراتيجيات التدخل المبكر لتجنب التأخر الأكاديمي.';
  } else if (fsiq >= 70) {
    classification = 'حدّي / بطء تعلم (Borderline Impairment)';
    classificationEn = 'Borderline Range';
    severityKey = 'borderline';
    severityColor = '#ea580c';
    clinicalImpression = `أظهرت نتائج المقياس أداءً معرفياً يقع في النطاق الحدّي (بطء التعلم) (معامل ذكاء كلي SB5 FSIQ: ${fsiq} برتبة مئينية ${fsiqPercentile}%). يستدعي هذا المستوى دعماً تعليمياً مكيّفاً وخطط تدريس علاجية.`;
    recommendations = '1. إلحاق الطالب ببرامج بطء التعلم والتعليم المساند وتكييف المناهج الدراسية.\n2. بناء خطة تربوية فردية (IEP) تركز على المهارات الأكاديمية الأساسية والمفاهيم الوظيفية.\n3. استخدام استراتيجيات التعلم متعدد الحواس (VAKT) والتكرار المستمر لترسيخ المعلومات.\n4. مواءمة أساليب التقويم والامتحانات المدرسية (تقليل عدد الأسئلة وتمديد الوقت).';
  } else if (fsiq >= 55) {
    classification = 'قصور فكري ومعرفي بسيط (Mild Intellectual Disability)';
    classificationEn = 'Mild ID';
    severityKey = 'mild_id';
    severityColor = '#dc2626';
    clinicalImpression = `تشير نتائج مقياس ستانفورد - بينيه 5 إلى وجود قصور معرفي وإدراكي بسيط دال إحصائياً (معامل ذكاء كلي SB5 FSIQ: ${fsiq} برتبة مئينية ${fsiqPercentile}%). يستلزم تقديم خدمات التربية الخاصة المتكاملة.`;
    recommendations = '1. وضع خطة تربوية وتأهيلية فردية شاملة (Intensive IEP) بإشراف فريق التربية الخاصة متعدد التخصصات.\n2. التركيز على المهارات المعرفية الوظيفية الحياتية، والتواصل، والسلوك التكيفي والاستقلالية.\n3. التدريب المستمر على مهارات الحياة اليومية بالتعاون الوثيق مع الأسرة.\n4. تقييم السلوك التكيفي (مثل مقياس فينلاند-3) لتحديد مستوى الدعم البيئي المطلوب بدقة.';
  } else {
    classification = 'قصور فكري ومعرفي متوسط إلى شديد (Moderate/Severe ID)';
    classificationEn = 'Moderate to Severe ID';
    severityKey = 'severe_id';
    severityColor = '#991b1b';
    clinicalImpression = `تشير نتائج التقييم إلى قصور معرفي وإدراكي جوهري شديد (معامل ذكاء كلي SB5 FSIQ: ${fsiq}). يتطلب الطالب برنامجاً تأهيلياً وتربوياً مكثفاً يركز على الرعاية الذاتية والتواصل والسلوك التكيفي.`;
    recommendations = '1. تصميم خطة تأهيلية وسلوكية فردية مكثفة تركز على مهارات الاستقلالية والرعاية الذاتية.\n2. تدريب الطالب على مهارات التواصل الوظيفي والتفاعل الاجتماعي البسيط.\n3. تقديم الدعم والإرشاد الأسري المستمر وتكييف البيئة المنزلية لتوفير الأمان والتحفيز.';
  }

  const deficitFactors = factorResults.filter(f => f.isDeficit);
  const strengthFactors = factorResults.filter(f => f.isStrength);

  return {
    totalAnswered,
    answeredCount: totalAnswered,
    totalItems: SB5_ITEMS.length,
    completionPercentage: Math.round((totalAnswered / SB5_ITEMS.length) * 100),
    totalRawScore,
    sumScaledScores: sumScaledAll10,
    nvSumScaled,
    vSumScaled,
    fsiq,
    nviq,
    viq,
    fsiqPercentile,
    nviqPercentile,
    viqPercentile,
    overallPercentile: fsiqPercentile,
    classification,
    classificationEn,
    severityKey,
    severityColor,
    clinicalImpression,
    recommendations,
    subtestResults,
    factorResults,
    deficitFactors,
    strengthFactors,
  };
}
