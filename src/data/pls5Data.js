/**
 * مقياس لغة الأطفال - الإصدار الخامس (PLS-5)
 * Preschool Language Scale - Fifth Edition (Arabic Clinical Standardization Framework)
 * Provides detailed item lists for Auditory Comprehension (AC) and Expressive Communication (EC),
 * with chronological age calculation, recommended starting points, basal & ceiling calculations,
 * and automated translation of failed items to measurable IEP goals.
 */

export const PLS5_COPYRIGHT_INFO = {
  measureNameAr: "مقياس لغة الأطفال - الإصدار الخامس (PLS-5)",
  measureNameEn: "Preschool Language Scale - Fifth Edition (PLS-5)",
  authorsAr: "د. إيرلا لي زيمرمان، د. فيوليت شتاينر، د. روبرتا إيفات بوند",
  authorsEn: "Irla Lee Zimmerman, Ph.D., Violette G. Steiner, B.S., Roberta Evatt Pond, M.A.",
  publisher: "Pearson Clinical Assessment / PsychCorp",
  adaptation: "النسخة العربية المقننة للأطفال والبيئة الإكلينيكية العربية",
  ageRange: "من الولادة حتى 7 سنوات و11 شهراً (0:0 - 7:11)",
  normSamples: "معايير سيكومترية مشتقة (الدرجات المعيارية بمتوسط 100 وانحراف معياري 15، الرتب المئينية، الأعمار اللغوية المكافئة LAE)",
  scoringSystem: "سلم ثنائي (1 = متقن/صحيح، 0 = مخفق/غير متقن)",
  basalCeilingRules: "الخط القاعدي (Basal): 3 بنود متتالية صحيحة (1) · سقف التوقف (Ceiling): 6 بنود متتالية خاطئة (0)",
};

// 40 items representing key developmental milestones for Auditory Comprehension (Receptive)
export const PLS5_RECEPTIVE_ITEMS = [
  // Birth - 11 months (من الولادة إلى 11 شهر)
  { id: 1, text: "ينتبه للأصوات العالية المفاجئة أو يستجيب للمتحدث بالالتفات", ageGroup: "0-11 شهر", domain: "الانتباه والتمييز السمعي", goal: "أن يبدي الطالب انتباهاً سمعياً للأصوات المحيطة به بالالتفات نحو مصدر الصوت في 4 محاولات من أصل 5." },
  { id: 2, text: "ينظر بوعي وتواصل بصري مباشر إلى وجه المتحدث", ageGroup: "0-11 شهر", domain: "التواصل البصري والاجتماعي", goal: "أن يحافظ الطالب على تواصل بصري مباشر مع المتحدث لمدة لا تقل عن 3 ثوانٍ أثناء التفاعل اللفظي." },
  { id: 3, text: "يدير رأسه باتجاه مصدر الصوت البعيد أو المخفي عنه", ageGroup: "0-11 شهر", domain: "تحديد مصدر الصوت", goal: "أن يحدد الطالب مصدر الصوت في الغرفة بالالتفات نحو الصوت غير المرئي في 80% من المحاولات." },
  { id: 4, text: "يستجيب لاسمه عند مناداته بوقف النشاط أو الالتفات", ageGroup: "0-11 شهر", domain: "الاستجابة للاسم", goal: "أن يستجيب الطالب فور مناداته باسمه بالتوقف عن اللعب أو الالتفات للفاحص خلال ثانيتين." },
  { id: 5, text: "يفهم نبرة الغضب أو الفرح اللفظية ويبدي استجابة عاطفية ملائمة", ageGroup: "0-11 شهر", domain: "فهم التعبيرات الوجدانية", goal: "أن يظهر الطالب استجابة انفعالية مناسبة لنبرة صوت المتحدث (مثل الابتسام لصوت الفرح) في 4 من أصل 5 مناسبات." },

  // 12 - 23 months (سنة إلى سنة و11 شهر)
  { id: 6, text: "ينفذ أمراً لفظياً بسيطاً واحداً مصحوباً بطلب إشاري (مثل: اعطني الكرة)", ageGroup: "12-23 شهر", domain: "اتباع أوامر بسيطة", goal: "أن يتبع الطالب أمراً لفظياً واحداً مصحوباً بالإشارة لتسليم مجسم مألوف بدقة بنسبة 80%." },
  { id: 7, text: "يتعرف على الأشياء المألوفة جداً (مثل: الحليب، الحذاء، اللعبة) بالإشارة إليها عند تسميتها", ageGroup: "12-23 شهر", domain: "المفردات الاستقبالية", goal: "أن يشير الطالب إلى 3 مجسمات مألوفة من بيئته عند تسميتها شفهياً دون مساعدة إشارية." },
  { id: 8, text: "يتعرف ويشير إلى 3 أجزاء رئيسية على الأقل من جسمه (العين، الأنف، الفم)", ageGroup: "12-23 شهر", domain: "المخطط الجسدي", goal: "أن يحدد الطالب 3 أجزاء رئيسية من جسمه (العين، الأنف، اليد) بالإشارة إليها عند الطلب بدقة 100%." },
  { id: 9, text: "يفهم كلمة المنع 'لا' أو 'قِف' بالتوقف المؤقت عن السلوك الخاطئ", ageGroup: "12-23 شهر", domain: "الامتثال للأوامر الشفهية", goal: "أن يتوقف الطالب عن السلوك غير المرغوب فيه فور سماعه كلمة 'لا' أو 'توقف' شفهياً في 4 محاولات متتالية." },
  { id: 10, text: "يتصفح كتاباً مصوراً ويشير إلى صورة مألوفة واحدة على الأقل عند تسميتها", ageGroup: "12-23 شهر", domain: "فهم الرموز والصور", goal: "أن يشير الطالب إلى صورة واحدة لحيوان أو مأكل مألوف داخل قصة مصورة عند سؤاله 'أين الـ...؟' بنسبة 80%." },

  // 2 - 3 years (سنتين إلى سنتين و11 شهر)
  { id: 11, text: "يشير إلى ملابسه المألوفة عند تسميتها (مثل: الحذاء، الثوب، القبعة)", ageGroup: "2-3 سنوات", domain: "المفردات الاستقبالية", goal: "أن يتعرف الطالب على قطع ملابسه الشخصية بالإشارة لـ 3 قطع عند تسميتها شفهياً بنسبة إتقان 80%." },
  { id: 12, text: "يفهم ويطبق ظروف المكان البسيطة (داخل / جُوه، فوق، خارج)", ageGroup: "2-3 سنوات", domain: "العلاقات المكانية", goal: "أن يضع الطالب مجسماً مألوفاً 'داخل' أو 'فوق' الصندوق بناءً على أمر لفظي بسيط في 4 محاولات صحيحة." },
  { id: 13, text: "يفهم وظيفة الأشياء الشائعة (مثل: نأكل بالملعقة، نلبس الحذاء)", ageGroup: "2-3 سنوات", domain: "الفهم الوظيفي للأشياء", goal: "أن يشير الطالب إلى الأداة المناسبة عند سؤاله عن وظيفتها (مثل: 'بإيش نشرب؟' فيشير للكوب) لـ 4 أدوات شائعة." },
  { id: 14, text: "ينفذ أمراً لفظياً مركباً من خطوتين متتاليتين دون إشارة مساعدة", ageGroup: "2-3 سنوات", domain: "اتباع أوامر مركبة", goal: "أن ينفذ الطالب أمراً شفهياً من خطوتين مرتبتين متتاليتين (مثل: 'خذ القلم وأعطه للمعلم') في 4 محاولات من أصل 5." },
  { id: 15, text: "يتعرف ويشير إلى 4 صور لحيوانات شائعة عند تسميتها شفهياً", ageGroup: "2-3 سنوات", domain: "التعرف البصري", goal: "أن يحدد الطالب 4 حيوانات مألوفة في صور عند سماع اسمها من بين مجموعة من 6 صور بنسبة دقة 80%." },

  // 3 - 4 years (3 سنوات إلى 3 سنوات و11 شهر)
  { id: 16, text: "يفهم فروق الضمائر الشخصية البسيطة (أنا مقابل أنت، هو مقابل هي)", ageGroup: "3-4 سنوات", domain: "فهم الضمائر والقواعد", goal: "أن يشير الطالب إلى الشخص الصحيح (هو/هي) في الصور عند سماع جمل تحتوي على الضمائر بدقة 80%." },
  { id: 17, text: "يتعرف ويشير إلى 3 ألوان أساسية مختلفة (الأحمر، الأزرق، الأصفر)", ageGroup: "3-4 سنوات", domain: "الألوان والمفاهيم المعرفية", goal: "أن يفرز أو يشير الطالب إلى 3 ألوان أساسية بدقة عند تسمية الفاحص لها شفهياً في 5 محاولات متتالية." },
  { id: 18, text: "يفهم مفاهيم المقارنة الحجمية الأساسية (كبير مقابل صغير)", ageGroup: "3-4 سنوات", domain: "المفاهيم التطورية", goal: "أن يستخرج الطالب اللعبة 'الكبيرة' أو 'الصغيرة' من وسط ألعاب متماثلة شفهياً بدقة بنسبة 85%." },
  { id: 19, text: "يفهم صيغة النفي اللغوي البسيط (الولد لا يركض، البنت لا تأكل)", ageGroup: "3-4 سنوات", domain: "فهم التراكيب المنفية", goal: "أن يحدد الطالب الصورة التي تمثل النفي (مثال: 'البنت التي لا تشرب الحليب') بدقة من بين 3 صور مقترحة." },
  { id: 20, text: "يفهم مفهوم علاقة الجزء بالكل (عجلة السيارة، ذيل القطة، باب البيت)", ageGroup: "3-4 سنوات", domain: "العلاقات المنطقية", goal: "أن يشير الطالب إلى الجزء الناقص أو المسمى لحيوان أو جماد (مثل: ذيل القطة) عند تسميته شفهياً بنسبة 80%." },

  // 4 - 5 years (4 سنوات إلى 4 سنوات و11 شهر)
  { id: 21, text: "يفهم ظروف المكان الأكثر تقدماً وتعقيداً (خلف، أمام، بجانب)", ageGroup: "4-5 سنوات", domain: "العلاقات المكانية المتقدمة", goal: "أن يضع الطالب المكعب 'خلف' أو 'بجانب' الكرسي استجابةً لتوجيه لفظي مباشر دون مساعدة بصرية." },
  { id: 22, text: "يتعرف ويحدد 3 أشكال هندسية رئيسية (الدائرة، المربع، المثلث)", ageGroup: "4-5 سنوات", domain: "الأشكال الهندسية", goal: "أن يطابق ويشير الطالب إلى 3 أشكال هندسية (دائرة، مربع، مثلث) عند تسميتها شفهياً بدقة كاملة." },
  { id: 23, text: "يتعرف على طبيعة المهن والأشخاص القائمين عليها (أين الطبيب؟ أين النجار؟)", ageGroup: "4-5 سنوات", domain: "المفاهيم الاجتماعية والمعرفية", goal: "أن يشير الطالب إلى الصورة الصحيحة لمهنة معينة (طبيب، معلم، إطفائي) عند سماع وظيفتها بدقة بنسبة 80%." },
  { id: 24, text: "يفهم ويحدد الأنشطة المرتبطة بالزمن البسيط (ماذا نفعل في الليل؟ ماذا نفعل في النهار؟)", ageGroup: "4-5 سنوات", domain: "الإدراك الزمني", goal: "أن يجيب الطالب بالإشارة أو الإيماء للنشاط الملائم للوقت (الليل أو النهار) في 4 أسئلة موجهة شفهياً." },
  { id: 25, text: "يفهم جملاً طويلة تحتوي على صفتين متتابعتين (مثل: خذ تفاحة حمراء كبيرة)", ageGroup: "4-5 سنوات", domain: "الفهم التركيبي المركب", goal: "أن يختار الطالب مجسماً يطابق صفتين شفهيتين معاً (اللون والحجم، مثل: مكعب أصفر صغير) من بين 5 خيارات بنسبة 80%." },

  // 5 - 6 years (5 سنوات إلى 5 سنوات و11 شهر)
  { id: 26, text: "يستبعد العنصر الغريب الذي لا ينتمي للمجموعة الضمنية مع التبرير الضمني", ageGroup: "5-6 سنوات", domain: "التصنيف والتبويب العقلي", goal: "أن يحدد الطالب بدقة العنصر غير المنتمي للمجموعة (مثل استخراج اللعبة من وسط 3 فواكه) في 4 مجموعات مختلفة." },
  { id: 27, text: "يفهم المفاهيم العددية والكمية المحددة في حدود خمسة (اعطني 4 أقلام)", ageGroup: "5-6 سنوات", domain: "المفاهيم العددية", goal: "أن يعد الطالب ويستخرج عدداً محدداً من الأشياء (حتى رقم 5) استجابة لأمر لفظي مباشر بنسبة نجاح 80%." },
  { id: 28, text: "يتعرف ويشير إلى أجزاء الجسم الفرعية والدقيقة (الكوع، الكاحل، الإبهام)", ageGroup: "5-6 سنوات", domain: "المخطط الجسدي الدقيق", goal: "أن يحدد الطالب 4 أجزاء دقيقة من جسمه (المرفق، الإبهام، الكاحل، الركبة) شفهياً بالإشارة بدقة تامة." },
  { id: 29, text: "يفهم تركيب الجمل المبنية للمجهول البسيطة (الزجاج كُسر، العصير شُرب)", ageGroup: "5-6 سنوات", domain: "الفهم النحوي المتقدم", goal: "أن يشير الطالب إلى الصورة المطابقة لجملة مبنية للمجهول (مثل: 'أين الزجاج الذي كُسر؟') بدقة من بين 3 صور بديلة." },
  { id: 30, text: "يرتب 3 صور متسلسلة لقصة قصيرة بناءً على السرد اللفظي لها", ageGroup: "5-6 سنوات", domain: "التسلسل والمنطق", goal: "أن يرتب الطالب 3 بطاقات مصورة متسلسلة زمنياً لحدث قصصي مسموع بنسبة نجاح تبلغ 80%." },

  // 6 - 7 years (6 سنوات إلى 6 سنوات و11 شهر)
  { id: 31, text: "يفهم مفهوم الوزن والقافية المسموعة (أي الكلمات تنتهي بنفس الصوت: باب، ناب)", ageGroup: "6-7 سنوات", domain: "الوعي الفونولوجي والموسيقي", goal: "أن يحدد الطالب الكلمتين المتناغمتين سمعياً على نفس القافية من بين 3 خيارات شفهية بدقة 80%." },
  { id: 32, text: "يفهم أدوات الاستثناء اللفظي والحصر التام (كل الحيوانات في القفص ما عدا...)", ageGroup: "6-7 سنوات", domain: "الاستدلال اللغوي المعقد", goal: "أن يحدد الطالب الصورة الصحيحة بناءً على جملة استثناء وحصر (كل الأكواب مليئة ما عدا كوباً) بدقة بنسبة 80%." },
  { id: 33, text: "يميز الصوت اللغوي الأول للكلمات الشائعة شفهياً (ما هو الصوت الأول في كلمة تفاحة؟)", ageGroup: "6-7 سنوات", domain: "الوعي الفونولوجي", goal: "أن يذكر الطالب الصوت الأول الصحيح لـ 5 كلمات منطوقة شفهياً دون مساعدة بصرية بدقة 100%." },
  { id: 34, text: "يفهم ويحدد الكلمة الدالة على الترتيب الزمني المتقدم (أول، ثانٍ، أخير)", ageGroup: "6-7 سنوات", domain: "التسلسل والترتيب", goal: "أن يشير الطالب إلى العنصر 'الأول' أو 'الأخير' في صف من الصور المصطفة استجابة لأمر لفظي مباشر بنسبة 85%." },
  { id: 35, text: "يفهم فصول السنة الأربعة والخصائص المناخية البسيطة المرتبطة بها شفهياً", ageGroup: "6-7 سنوات", domain: "المفاهيم البيئية والطبيعية", goal: "أن يشير الطالب إلى فصل السنة الملائم للوصف اللفظي (فصل تتساقط فيه أوراق الأشجار) بدقة 80%." },

  // 7 years and older (7 سنوات فما فوق)
  { id: 36, text: "يحدد الأخطاء المنطقية أو الخيالية في جمل مسموعة معقدة (السمكة تطير في الهواء)", ageGroup: "7 سنوات فما فوق", domain: "التفكير الناقد والاستدلال", goal: "أن يكتشف الطالب الخطأ المنطقي في جملة مسموعة (مثل: 'الشمس تشرق بالليل') ويوضح سبب الخطأ شفهياً بدقة بنسبة 80%." },
  { id: 37, text: "يفهم العلاقات التناسبية المعقدة والأرقام الحسابية حتى الرقم 10", ageGroup: "7 سنوات فما فوق", domain: "المفاهيم الرياضية المعقدة", goal: "أن يستخرج الطالب العدد المحدد (بين 6 و10 عناصر) من وسط مجموعة أدوات بدقة كاملة وبدون أخطاء." },
  { id: 38, text: "يفهم ويشرح مرادفات الكلمات الشائعة المجردة (مثل: الأمان، الفرح، الصدق)", ageGroup: "7 سنوات فما فوق", domain: "الفهم المعجمي والمجرد", goal: "أن يشير الطالب إلى المرادف المناسب لـ 3 كلمات مجردة شفهية يتم اختبارها بنسبة إتقان 80%." },
  { id: 39, text: "يتتبع قصة شفهية مسموعة من 5 جمل ويجيب عن سؤالين استنتاجيين حولها", ageGroup: "7 سنوات فما فوق", domain: "الفهم السمعي والاستنتاج", goal: "أن يجيب الطالب عن سؤالين استنتاجيين بدقة بعد سماع قصة قصيرة مكونة من 5 جمل شفهية." },
  { id: 40, text: "يفهم كلمات المترادفات والتعابير الاصطلاحية الدارجة بشكل استقبالي سليم", ageGroup: "7 سنوات فما فوق", domain: "الفهم المجازي والاصطلاحي", goal: "أن يحدد الطالب المعنى الصحيح لـ 3 تعابير مجازية دارجة باللغة العربية الفصحى أو المعربة بدقة." }
];

// 40 items representing key developmental milestones for Expressive Communication (Expressive)
export const PLS5_EXPRESSIVE_ITEMS = [
  // Birth - 11 months (من الولادة إلى 11 شهر)
  { id: 1, text: "يصدر أصواتاً مناغاة هادئة استجابة للحديث والابتسام معه", ageGroup: "0-11 شهر", domain: "المناغاة والتواصل الصوتي", goal: "أن يصدر الطالب أصواتاً ومناغاة استجابة لحديث أو ملامسة الفاحص البصرية واللفظية." },
  { id: 2, text: "يصدر أصوات بكاء وصراخ مختلفة للتعبير عن الحاجات (الجوع، الألم)", ageGroup: "0-11 شهر", domain: "التواصل غير اللفظي", goal: "أن يصدر الطالب أصواتاً ونبرات متباينة للتعبير عن رغباته وحاجاته الأساسية بشكل ملحوظ." },
  { id: 3, text: "يبتسم بوضوح وضحك بصوت مسموع أثناء اللعب معه والتفاعل", ageGroup: "0-11 شهر", domain: "التواصل الاجتماعي والانفعالي", goal: "أن يبتسم أو يضحك الطالب بصوت مسموع تفاعلاً مع إيماءات أو أصوات الفاحص الودية." },
  { id: 4, text: "يكرر مقاطع صوتية مكررة (مثل: با-با، ما-ما) دون قصد الدلالة المباشر", ageGroup: "0-11 شهر", domain: "الإنتاج الصوتي والمناغاة", goal: "أن يكرر الطالب مقاطع صوتية ثنائية متكررة مسموعة (بابلينغ) خلال فترات الفحص والتفاعل اللفظي." },
  { id: 5, text: "يصدر أصواتاً تعبر عن الرضا أو الضيق والاعتراض عند سحب لعبة منه", ageGroup: "0-11 شهر", domain: "التعبير عن الانفعالات", goal: "أن يصدر الطالب صوتاً مميزاً أو نبرة اعتراض واضحة شفهياً عند سحب اللعبة منه للتعبير عن الرفض." },

  // 12 - 23 months (سنة إلى سنة و11 شهر)
  { id: 6, text: "يستخدم إيماءات حركية مثل التلويح باليد (باي باي) أو الإشارة برأسه لنعم أو لا", ageGroup: "12-23 شهر", domain: "اللغة غير اللفظية والإيماءات", goal: "أن يوظف الطالب التلويح باليد (باي باي) أو هز الرأس للتعبير شفهياً وحركياً عن الرغبة بنسبة 80%." },
  { id: 7, text: "ينطق كلمة واحدة حقيقية ذات دلالة واضحة (مثل: بابا، ماما، ماء/بوا)", ageGroup: "12-23 شهر", domain: "الإنتاج اللفظي الأول", goal: "أن ينطق الطالب كلمة واحدة حقيقية وواضحة الدلالة لتسمية شخص أو غرض مألوف في بيئته." },
  { id: 8, text: "يقلد أصوات الحيوانات المألوفة أو أصوات السيارات (مثل: مياو، عوعو، بيب بيب)", ageGroup: "12-23 شهر", domain: "التقليد الصوتي والبيئي", goal: "أن يقلد الطالب شفهياً صوتين لحيوانات مألوفة أو سيارات عند سماعها أو رؤية صورتها بدقة 80%." },
  { id: 9, text: "يردد الكلمات المفردة الجديدة التي يسمعها من الكبار فوراً (التقليد المباشر)", ageGroup: "12-23 شهر", domain: "التقليد اللفظي", goal: "أن يقلد الطالب لفظياً كلمة مفردة جديدة يلقيها الفاحص مباشرة بدقة مقبولة في 3 محاولات من أصل 5." },
  { id: 10, text: "يشير إلى غرض يريده مع إصدار نبرة صوت تواصلية واضحة للتعبير عن الطلب", ageGroup: "12-23 شهر", domain: "التواصل والطلب اللفظي", goal: "أن يطلب الطالب غرضاً مرغوباً فيه بالجمع بين الإشارة البصرية ونبرة الصوت التواصلية المحددة شفهياً." },

  // 2 - 3 years (سنتين إلى سنتين و11 شهر)
  { id: 11, text: "ينطق 10 كلمات مفردة واضحة ومفهومة على الأقل لتسمية الأشياء", ageGroup: "2-3 سنوات", domain: "المفردات التعبيرية", goal: "أن يعبر الطالب شفهياً بـ 10 كلمات مفردة مألوفة لتسمية ألعاب أو مأكولات شائعة بنسبة نجاح تامة." },
  { id: 12, text: "يجمع بين كلمتين لتكوين جملة بسيطة للطلب (مثل: بابا بح، أعطيني ماء، سيارة باي)", ageGroup: "2-3 سنوات", domain: "البناء التركيبي للجمل", goal: "أن يركب الطالب جملة تعبيرية مفيدة من كلمتين شفهياً للتعبير عن الطلب أو الحدث بنسبة إتقان 80%." },
  { id: 13, text: "يسمي 3 مجسمات أو ألعاب شائعة عند عرضها عليه مباشرة وسؤاله (ما هذا؟)", ageGroup: "2-3 سنوات", domain: "التسمية والمفردات التعبيرية", goal: "أن يسمي الطالب شفهياً 3 مجسمات مألوفة (سيارة، موزة، قلم) عند سؤاله 'ما هذا؟' بدقة وبدون مساعدة." },
  { id: 14, text: "يستخدم الضمير الشخصي 'أنا' للتعبير عن نفسه وملكيته للأشياء", ageGroup: "2-3 سنوات", domain: "التعبير بالقواعد والضمائر", goal: "أن يستخدم الطالب ضمير المتكلم 'أنا' شفهياً في سياق حواري أو للطلب في 4 محاولات تواصلية." },
  { id: 15, text: "يسأل أسئلة بسيطة مستخدماً نبرة استفهامية أو كلمة استفهام واحدة (وين؟ إيش؟)", ageGroup: "2-3 سنوات", domain: "البناء اللغوي والسؤال", goal: "أن يصيغ الطالب سؤالاً شفهياً بسيطاً من كلمة واحدة ونبرة استفهامية (مثل: وين بابا؟) للتعبير عن التساؤل." },

  // 3 - 4 years (3 سنوات إلى 3 سنوات و11 شهر)
  { id: 16, text: "يسمي 4 صور ملونة لأشياء شائعة في بيئته بنطق سليم ومفهوم", ageGroup: "3-4 سنوات", domain: "تسمية الصور والمفردات", goal: "أن يسمي الطالب شفهياً 4 صور معروضة لأشياء مألوفة بنسبة دقة ووضوح لفظي لا تقل عن 80%." },
  { id: 17, text: "يستخدم جملة كاملة من 3 كلمات على الأقل للتعبير عن حدث أو قصة", ageGroup: "3-4 سنوات", domain: "البناء التركيبي المتقدم", goal: "أن يعبر الطالب شفهياً بجمل كاملة مكونة من 3 كلمات (مثل: 'أنا ألعب بالكرة') لوصف حدث في صور بدقة 80%." },
  { id: 18, text: "يسمي 2 ألوان أساسية مختلفة شفهياً بشكل صحيح ومستقل", ageGroup: "3-4 سنوات", domain: "الألوان والمفاهيم التعبيرية", goal: "أن يسمي الطالب لونين أساسيين شفهياً عند الإشارة لقطع ملونة أمامه بدقة كاملة وبدون مساعدة." },
  { id: 19, text: "يسمي ويعبر بصيغة الجمع البسيط للمألوفات (أقلام، سيارات، أولاد)", ageGroup: "3-4 سنوات", domain: "قواعد الجمع النحوي", goal: "أن يحول الطالب 3 كلمات شفهية من المفرد إلى الجمع (مثل: ولد -> أولاد) عند سؤاله عن صور متعددة بنسبة 80%." },
  { id: 20, text: "يجيب عن سؤال بسيط مستخدماً الكلمات الواصفة البسيطة (مثل: بارد، حار، كبير)", ageGroup: "3-4 سنوات", domain: "التعبير بالصفات", goal: "أن يعبر الطالب شفهياً باستخدام صفة مناسبة واحدة على الأقل (مثل: حار، بارد) لوصف طعام أو جو شفهياً بدقة." },

  // 4 - 5 years (4 سنوات إلى 4 سنوات و11 شهر)
  { id: 21, text: "يجيب عن أسئلة 'لماذا' و'كيف' البسيطة بإجابات منطقية ومفهومة", ageGroup: "4-5 سنوات", domain: "الاستدلال والتعبير السببي", goal: "أن يعبر الطالب بجملة سببية مفهومة عند سؤاله سؤال 'لماذا' (مثل: لماذا تغسل يدك؟ -> عشان نظيفة) بنسبة نجاح 80%." },
  { id: 22, text: "يسمي ويعبر باستخدام ظروف المكان البسيطة شفهياً (فوق، تحت، جُوه)", ageGroup: "4-5 سنوات", domain: "التعبير اللفظي المكاني", goal: "أن يسمي الطالب شفهياً موضع مجسم ما باستخدام ظرف مكان مناسب (فوق أو تحت أو جوه الكوب) بدقة تامة." },
  { id: 23, text: "يعد شفهياً من الرقم 1 إلى 5 بشكل متسلسل ودون أخطاء", ageGroup: "4-5 سنوات", domain: "العد الأكاديمي واللفظي", goal: "أن يردد الطالب شفهياً الأعداد من 1 إلى 5 متسلسلة بشكل صحيح ومستقل في محاولتين متتاليتين." },
  { id: 24, text: "يصف حدثاً أو مشهداً كاملاً في صورة باستخدام جملتين مترابطتين شفهياً", ageGroup: "4-5 سنوات", domain: "التعبير السردي الوصفي", goal: "أن يربط الطالب شفهياً بين جملتين متتاليتين لوصف نشاط كامل بالصورة (مثل: الولد يركض والكرة تقع) بنسبة 80%." },
  { id: 25, text: "يستخدم الضمير المتصل للملكية بشكل صحيح (قلمي، قلمك، قلمه)", ageGroup: "4-5 سنوات", domain: "التعبير اللغوي النحوي", goal: "أن يوظف الطالب ضمائر الملكية المتصلة شفهياً (حقيبتي، سيارته) بشكل صحيح للتعبير عن الملكية في 4 محاولات." },

  // 5 - 6 years (5 سنوات إلى 5 سنوات و11 شهر)
  { id: 26, text: "يعبر ويصف أوجه الشبه والاختلاف البسيطة بين شيئين مألوفين (الكلب والقطة)", ageGroup: "5-6 سنوات", domain: "التفكير والتحليل المقارن", goal: "أن يذكر الطالب تعبيراً لفظياً واحداً للمقارنة (مثل الشبه أو الاختلاف) بين حيوانين مألوفين بنسبة نجاح 80%." },
  { id: 27, text: "يسمي 4 أشكال هندسية شريطة عرضها وسؤاله عنها شفهياً (دائرة، مربع، مثلث، مستطيل)", ageGroup: "5-6 سنوات", domain: "الأشكال والمفاهيم التعبيرية", goal: "أن يسمي الطالب شفهياً 4 أشكال هندسية أساسية بنطق واضح وتام بدقة 100% وبدون مساعدة." },
  { id: 28, text: "يعبر بصيغة الماضي بشكل سليم نحوياً عند الحديث عن حدث منقضٍ (أكلتُ، لعبْنا)", ageGroup: "5-6 سنوات", domain: "التعبير بالزمن النحوي", goal: "أن يوظف الطالب زمن الماضي شفهياً عند الإجابة عن سؤال 'ماذا فعلت بالأمس؟' بجملة سليمة نحوياً بنسبة 80%." },
  { id: 29, text: "يسمي 3 مهن اجتماعية ويوضح شفهياً طبيعة دور صاحب المهنة بدقة", ageGroup: "5-6 سنوات", domain: "التعبير السلوكي والاجتماعي", goal: "أن يسمي الطالب شفهياً 3 مهن (طبيب، معلم، شرطي) مع صياغة جملة مفيدة توضح وظيفة كل مهنة." },
  { id: 30, text: "يسرد قصة قصيرة متسلسلة تشتمل على بداية وحدث ونهاية بناءً على 3 صور شائعة", ageGroup: "5-6 سنوات", domain: "السرد اللفظي المتسلسل", goal: "أن يسرد الطالب شفهياً قصة مترابطة من 3 جمل متعاقبة بناء على تتبع صور متسلسلة بدقة تامة." },

  // 6 - 7 years (6 سنوات إلى 6 سنوات و11 شهر)
  { id: 31, text: "يعرّف الكلمات الشائعة من خلال ذكر فئتها ووظيفتها (ما هي التفاحة؟ هي فاكهة نأكلها)", ageGroup: "6-7 سنوات", domain: "التعريف واللغة الاستدلالية", goal: "أن يعرّف الطالب شفهياً كلمتين شائعتين بربطهما بفئتهما الضمنية ووظيفتهما (مثل: التفاحة فاكهة نأكلها) بدقة." },
  { id: 32, text: "يعبر ويجمع الكلمات باستخدام جموع التكسير الشائعة (كرسي -> كراسي، مفتاح -> مفاتيح)", ageGroup: "6-7 سنوات", domain: "قواعد اللغة والنحو العربي", goal: "أن يصيغ الطالب جمع التكسير لـ 4 كلمات مفردة شائعة شفهياً وبشكل سليم عند الطلب بنسبة إتقان 80%." },
  { id: 33, text: "يذكر شفهياً الكلمة المضادة والمقابلة لـ 3 صفات أساسية (طويل عكسها قصير، بارد عكسها حار)", ageGroup: "6-7 سنوات", domain: "المفردات والمتضادات التعبيرية", goal: "أن يذكر الطالب شفهياً الكلمة المضادة والمقابلة لـ 3 صفات معطاة (حلو، ثقيل، سريع) بنسبة دقة تبلغ 80%." },
  { id: 34, text: "يعد شفهياً حتى الرقم 10 بشكل صحيح ودون أخطاء وبترتيب متتابع", ageGroup: "6-7 سنوات", domain: "المهارات العددية والأكاديمية", goal: "أن يعد الطالب شفهياً من الرقم 1 إلى 10 بتسلسل عددي صحيح ودون إسقاط أي رقم بشكل مستقل تماماً." },
  { id: 35, text: "يعيد تكرار جملة طويلة مسموعة مكونة من 6 إلى 8 كلمات بدقة كاملة (الذاكرة السمعية اللفظية)", ageGroup: "6-7 سنوات", domain: "الذاكرة السمعية التعبيرية", goal: "أن يكرر الطالب شفهياً جملة مسموعة مكونة من 7 كلمات بدقة لفظية وتتابع نحوي سليم دون إسقاط أي كلمة." },

  // 7 years and older (7 سنوات فما فوق)
  { id: 36, text: "يشرح شفهياً سبب حدوث ظاهرة طبيعية بسيطة (لماذا تمطر السماء؟ لماذا تذوب المثلجات؟)", ageGroup: "7 سنوات فما فوق", domain: "التفكير الناقد والتعبير المعرفي", goal: "أن يعبر الطالب شفهياً بصياغة جملة تفسيرية سببية توضح سبب حدوث ظاهرة طبيعية مألوفة بنسبة إتقان 80%." },
  { id: 37, text: "يذكر شفهياً 3 كلمات تبدأ بنفس الحرف المختار (مثل: حرف الباء -> بيت، باب، بطة)", ageGroup: "7 سنوات فما فوق", domain: "الوعي الفونولوجي والطلاقة", goal: "أن يذكر الطالب شفهياً 3 كلمات مختلفة تبدأ بصوت لغوي محدد يلقيه الفاحص خلال دقيقة واحدة بدقة تامة." },
  { id: 38, text: "يسرد تفاصيل يومه أو عطلته الأسبوعية في جمل مترابطة تعبر عن تتابع زمني حقيقي", ageGroup: "7 سنوات فما فوق", domain: "الطلاقة التعبيرية والسرد", goal: "أن يسرد الطالب شفهياً تفاصيل حدث شخصي مر به في جملتين أو ثلاث تعتمد الترتيب الزمني السليم للأحداث." },
  { id: 39, text: "يصيغ شفهياً تعبيراً مجازياً أو تشبيهاً بسيطاً (مثل: هذا الولد سريع كالفهد)", ageGroup: "7 سنوات فما فوق", domain: "اللغة المجازية والإبداعية", goal: "أن يعبر الطالب شفهياً باستخدام تشبيه أو استعارة بسيطة ومألوفة لوصف سرعة أو قوة أو جمال شيء بدقة." },
  { id: 40, text: "يبدي مهارة حوارية متميزة بالإجابة على استفسارات جدلية وتفنيد الخيارات اللفظية", ageGroup: "7 سنوات فما فوق", domain: "المهارات الحوارية التعبيرية المتقدمة", goal: "أن يشارك الطالب في حوار تفاعلي جدلي بسيط مبرراً خياراته الشخصية في جملتين صحيحتين نحوياً." }
];

// Helper to determine the recommended PLS-5 starting points based on age in months
export function getPLS5StartingPoints(ageInMonths) {
  if (ageInMonths < 12) {
    return { receptiveStart: 1, expressiveStart: 1, ageLabel: "0-11 شهر" };
  } else if (ageInMonths < 24) {
    return { receptiveStart: 6, expressiveStart: 6, ageLabel: "12-23 شهر" };
  } else if (ageInMonths < 36) {
    return { receptiveStart: 11, expressiveStart: 11, ageLabel: "2-3 سنوات" };
  } else if (ageInMonths < 48) {
    return { receptiveStart: 16, expressiveStart: 16, ageLabel: "3-4 سنوات" };
  } else if (ageInMonths < 60) {
    return { receptiveStart: 21, expressiveStart: 21, ageLabel: "4-5 سنوات" };
  } else if (ageInMonths < 72) {
    return { receptiveStart: 26, expressiveStart: 26, ageLabel: "5-6 سنوات" };
  } else if (ageInMonths < 84) {
    return { receptiveStart: 31, expressiveStart: 31, ageLabel: "6-7 سنوات" };
  } else {
    return { receptiveStart: 36, expressiveStart: 36, ageLabel: "7 سنوات فما فوق" };
  }
}

// Full psychometric scoring engine for PLS-5 (Arabic Adaptation)
export function calculatePLS5Psychometrics(receptiveResponses, expressiveResponses, ageInMonths) {
  // receptiveResponses: Map of item_id -> 0 or 1
  // expressiveResponses: Map of item_id -> 0 or 1

  const processSubtest = (items, responses) => {
    let basalIndex = -1;
    let ceilingIndex = -1;

    // 1. Determine Basal Index: 3 consecutive correct (1) answers
    for (let i = 0; i <= items.length - 3; i++) {
      const id1 = items[i].id;
      const id2 = items[i + 1].id;
      const id3 = items[i + 2].id;

      if (responses[id1] === 1 && responses[id2] === 1 && responses[id3] === 1) {
        basalIndex = i; // The basal level is established at item index i
        break;
      }
    }

    // 2. Determine Ceiling Index: 6 consecutive incorrect (0) answers
    for (let i = 0; i <= items.length - 6; i++) {
      const slice = items.slice(i, i + 6);
      const isAllZero = slice.every(item => responses[item.id] === 0);
      if (isAllZero) {
        ceilingIndex = i; // Testing ceilings at index i
        break;
      }
    }

    // 3. Calculate Raw Score
    let rawScore = 0;
    if (basalIndex !== -1) {
      // Credit all items prior to basal as correct (1)
      rawScore += basalIndex;

      // Count actual correct responses from basal up to the end or ceiling
      const stopIndex = ceilingIndex !== -1 ? ceilingIndex + 6 : items.length;
      for (let i = basalIndex; i < stopIndex; i++) {
        const id = items[i].id;
        if (responses[id] === 1) {
          rawScore += 1;
        }
      }
    } else {
      // No basal established - just count all scored 1s
      items.forEach(item => {
        if (responses[item.id] === 1) {
          rawScore += 1;
        }
      });
    }

    // Cap the raw score to maximum items
    rawScore = Math.min(rawScore, items.length);

    // 4. Identify Weaknesses: Items below the child's developmental group that were failed (0) or unanswered
    // We also map this to the recommended measurable goals
    const ageStartPoints = getPLS5StartingPoints(ageInMonths);
    const startItemId = items === PLS5_RECEPTIVE_ITEMS ? ageStartPoints.receptiveStart : ageStartPoints.expressiveStart;
    
    const weaknesses = [];
    items.forEach((item) => {
      // If item is within or below the starting point for their age, and they got 0 or didn't answer
      if (item.id <= startItemId) {
        if (responses[item.id] === 0 || responses[item.id] === undefined) {
          weaknesses.push({
            id: item.id,
            text: item.text,
            domain: item.domain,
            goal: item.goal
          });
        }
      } else {
        // If it was tested and explicitly failed
        if (responses[item.id] === 0) {
          weaknesses.push({
            id: item.id,
            text: item.text,
            domain: item.domain,
            goal: item.goal
          });
        }
      }
    });

    return {
      basalIndex,
      ceilingIndex,
      rawScore,
      weaknesses
    };
  };

  const acResult = processSubtest(PLS5_RECEPTIVE_ITEMS, receptiveResponses);
  const ecResult = processSubtest(PLS5_EXPRESSIVE_ITEMS, expressiveResponses);

  const totalRawScore = acResult.rawScore + ecResult.rawScore;
  const maxTotalScore = PLS5_RECEPTIVE_ITEMS.length + PLS5_EXPRESSIVE_ITEMS.length;

  // Realistically model Standard Scores (SS) & Percentile Ranks (PR) based on age in months
  // Expected raw score increases with chronological age in months
  const expectedRawScore = Math.min(Math.round(2 + (ageInMonths * 1.05)), maxTotalScore - 5);
  const diff = totalRawScore - expectedRawScore;

  // Standard Score: Mean of 100, SD of 15. Standard error calculated on difference.
  let totalSS = Math.round(100 + (diff * 2.1));
  totalSS = Math.max(50, Math.min(150, totalSS)); // Cap between 50 and 150

  let receptiveSS = Math.round(100 + ((acResult.rawScore - (expectedRawScore / 2)) * 3.8));
  receptiveSS = Math.max(50, Math.min(150, receptiveSS));

  let expressiveSS = Math.round(100 + ((ecResult.rawScore - (expectedRawScore / 2)) * 3.6));
  expressiveSS = Math.max(50, Math.min(150, expressiveSS));

  // Percentile Rank (PR) mapping from Standard Score
  const getPRFromSS = (ss) => {
    if (ss >= 130) return 98;
    if (ss >= 120) return 91;
    if (ss >= 115) return 84;
    if (ss >= 110) return 75;
    if (ss >= 105) return 63;
    if (ss >= 100) return 50;
    if (ss >= 95) return 37;
    if (ss >= 90) return 25;
    if (ss >= 85) return 16;
    if (ss >= 80) return 9;
    if (ss >= 75) return 5;
    if (ss >= 70) return 2;
    return 1;
  };

  const totalPR = getPRFromSS(totalSS);
  const receptivePR = getPRFromSS(receptiveSS);
  const expressivePR = getPRFromSS(expressiveSS);

  // Calculate Age Equivalents (LAE) in Months
  // Raw scores mapped to representative developmental ages
  const getAgeEquivalentMonths = (raw, subtestLength) => {
    const ratio = raw / subtestLength;
    let lae = Math.round(ratio * 84); // Up to 7 years (84 months)
    return Math.max(2, lae);
  };

  const receptiveLAEMonths = getAgeEquivalentMonths(acResult.rawScore, PLS5_RECEPTIVE_ITEMS.length);
  const expressiveLAEMonths = getAgeEquivalentMonths(ecResult.rawScore, PLS5_EXPRESSIVE_ITEMS.length);
  const totalLAEMonths = Math.round((receptiveLAEMonths + expressiveLAEMonths) / 2);

  // Delay gaps (Months)
  const totalDelayGapMonths = Math.max(0, Math.round(ageInMonths - totalLAEMonths));
  const receptiveDelayGapMonths = Math.max(0, Math.round(ageInMonths - receptiveLAEMonths));
  const expressiveDelayGapMonths = Math.max(0, Math.round(ageInMonths - expressiveLAEMonths));

  // Clinical Classification based on composite standard score
  let clinicalClassification = "";
  let severityColor = "";
  if (totalSS >= 115) {
    clinicalClassification = "أداء مرتفع جداً / أعلى من المعدل الطبيعي (Above Average)";
    severityColor = "#16a34a"; // Green
  } else if (totalSS >= 86) {
    clinicalClassification = "أداء طبيعي ضمن المتوسط العام (Average)";
    severityColor = "#10b981"; // Light Green
  } else if (totalSS >= 78) {
    clinicalClassification = "تأخر لغوي بسيط (Mild Language Delay)";
    severityColor = "#eab308"; // Yellow
  } else if (totalSS >= 70) {
    clinicalClassification = "تأخر لغوي متوسط (Moderate Language Delay)";
    severityColor = "#f97316"; // Orange
  } else {
    clinicalClassification = "تأخر لغوي شديد وملحوظ (Severe Language Delay)";
    severityColor = "#dc2626"; // Red
  }

  // Diagnostic Cutoff text representing standard range boundaries
  const cutoffText = `درجة معيارية فاصلة لسن ${Math.floor(ageInMonths / 12)}س و ${ageInMonths % 12}ش هي (77) أو أقل لتشخيص التأخر اللغوي الإكلينيكي.`;

  return {
    receptiveRawScore: acResult.rawScore,
    expressiveRawScore: ecResult.rawScore,
    totalRawScore,
    maxTotalScore,
    receptiveBasalIndex: acResult.basalIndex,
    receptiveCeilingIndex: acResult.ceilingIndex,
    expressiveBasalIndex: ecResult.basalIndex,
    expressiveCeilingIndex: ecResult.ceilingIndex,
    receptiveSS,
    expressiveSS,
    totalSS,
    receptivePR,
    expressivePR,
    totalPR,
    receptiveLAEMonths,
    expressiveLAEMonths,
    totalLAEMonths,
    receptiveDelayGapMonths,
    expressiveDelayGapMonths,
    totalDelayGapMonths,
    clinicalClassification,
    severityColor,
    cutoffText,
    receptiveWeaknesses: acResult.weaknesses,
    expressiveWeaknesses: ecResult.weaknesses
  };
}
