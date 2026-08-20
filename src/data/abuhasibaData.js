/**
 * مقياس الدكتور أحمد أبو حسيبة للغة المعرب (المستند إلى مقياس Preschool Language Scale - PLS)
 * لتقييم وفحص اللغة الاستقبالية والتعبيرية للأطفال من عمر شهرين وحتى 7 سنوات و5 أشهر.
 * تصميم سيكومتري وأكاديمي متكامل يدعم قواعد البسال (Basal) والسقف (Ceiling) وحساب الفجوات اللغوية ومؤشرات التأخر.
 */

// 62 بنداً لاختبار اللغة الاستقبالية
export const ABUHASIBA_RECEPTIVE_ITEMS = [
  // الولادة - شهرين
  { id: 1, text: "يشير (يلوح) بيديه ناحية المتحدث", ageGroup: "الولادة - شهرين", domain: "الانتباه والتواصل المبكر" },
  { id: 2, text: "الطفل يستمع بانتباه للأبوين عند التحدث إليه", ageGroup: "الولادة - شهرين", domain: "التمييز السمعي" },
  { id: 3, text: "ينتبه لأصوات البيئة (هل يلتفت لأي صوت تفاعلي)", ageGroup: "الولادة - شهرين", domain: "الاستجابة السمعية" },
  { id: 4, text: "ينظر الطفل مباشرة إلى المتحدث بوجهه", ageGroup: "الولادة - شهرين", domain: "التواصل البصري" },

  // 3 - 5 شهور
  { id: 5, text: "يدير رأسه لتحديد مصدر الصوت من حوله", ageGroup: "3 - 5 شهور", domain: "تحديد مصدر الصوت" },
  { id: 6, text: "يبحث بعينيه عن الشخص الذي يتحدث", ageGroup: "3 - 5 شهور", domain: "الانتباه الاجتماعي" },
  { id: 7, text: "يستطيع التمييز بين صوتين مألوفين مختلفين", ageGroup: "3 - 5 شهور", domain: "التمييز السمعي" },
  { id: 8, text: "يضع الأشياء في فمه كطريقة للتعرف عليها واستكشافها", ageGroup: "3 - 5 شهور", domain: "الاستكشاف الحسي" },

  // 6 - 8 شهور
  { id: 9, text: "يهز الأشياء أو يطرق بها لاستكشاف الأصوات الصادرة عنها", ageGroup: "6 - 8 شهور", domain: "اللعب والاستكشاف" },
  { id: 10, text: "يوقف اللعب أو الحركة مؤقتاً عندما تنادي عليه باسمه", ageGroup: "6 - 8 شهور", domain: "الاستجابة للاسم" },
  { id: 11, text: "يتوقع ما سيحدث في الخطوة القادمة أثناء اللعب التفاعلي معه", ageGroup: "6 - 8 شهور", domain: "الإدراك والتوقع" },
  { id: 12, text: "يبحث عن مصدر صوت مألوف لا يقع في مجال رؤيته المباشر", ageGroup: "6 - 8 شهور", domain: "بقاء الصوت والأشياء" },

  // 9 - 11 شهر
  { id: 13, text: "ينظر إلى الشخص أو اللعبة التي تنطق الأم اسمها وتشير إليها", ageGroup: "9 - 11 شهر", domain: "الإنتباه المشترك" },
  { id: 14, text: "يفهم قصدك عندما تمد يدك وتقول له 'تعالى معي'", ageGroup: "9 - 11 شهر", domain: "فهم الإشارات اللفظية" },
  { id: 15, text: "يستجيب لأمر النهي والمنع اللفظي مثل 'لأ' أو 'لا'", ageGroup: "9 - 11 شهر", domain: "الاستجابة للأوامر النهي" },
  { id: 16, text: "يفهم دلالة كلمة مألوفة جداً لشيء أو فرد من الأسرة أو كلمة مثل 'باي باي'", ageGroup: "9 - 11 شهر", domain: "الفهم المفرداتي" },

  // سنة - سنة و5 شهور
  { id: 17, text: "يلعب بأكثر من لعبة أو أداة في نفس التوقيت بشكل وظيفي", ageGroup: "سنة - سنة و5 شهور", domain: "النمو المعرفي واللعب" },
  { id: 18, text: "يستجيب للأوامر اللفظية المألوفة المصحوبة بالإشارة", ageGroup: "سنة - سنة و5 شهور", domain: "اتباع الأوامر الإشارية" },
  { id: 19, text: "يفهم الاستخدام الصحيح والوظيفي للأشياء أثناء اللعب التلقائي", ageGroup: "سنة - سنة و5 شهور", domain: "اللعب الوظيفي" },
  { id: 20, text: "يتعرف على الأشياء المألوفة ويختارها من وسط مجموعة متنوعة من الأشياء", ageGroup: "سنة - سنة و5 شهور", domain: "التمييز البصري والفرز" },

  // سنة و6 شهور - سنة و11 شهر
  { id: 21, text: "يتعرف على 3 أجزاء على الأقل من جسمه (على نفسه أو دبدوب) عند السؤال عنها", ageGroup: "سنة و6 شهور - سنة و11 شهر", domain: "المخطط الجسدي" },
  { id: 22, text: "يفهم كلمات المنع اللفظية المختلفة مثل (بس، كفاية، توقف)", ageGroup: "سنة و6 شهور - سنة و11 شهر", domain: "الانضباط والفهم" },
  { id: 23, text: "يتعرف ويشير إلى صور الأشياء المألوفة في كتاب أو لوحة مصورة", ageGroup: "سنة و6 شهور - سنة و11 شهر", domain: "التعرف على الصور" },
  { id: 24, text: "يستطيع فهم الأفعال الشائعة والأساسية الموجودة في جملة حوارية مألوفة", ageGroup: "سنة و6 شهور - سنة و11 شهر", domain: "فهم الأفعال" },

  // سنتين - سنتين و5 شهور
  { id: 25, text: "يتعرف ويشير إلى قطع الملابس المألوفة الخاصة به عند الطلب", ageGroup: "سنتين - سنتين و5 شهور", domain: "المفردات الاستقبالية" },
  { id: 26, text: "يفهم كلمات وحروف الجر الدالة على المكان البسيط (داخل/جوه - خارج/بره - فوق)", ageGroup: "سنتين - سنتين و5 شهور", domain: "مفاهيم المكان" },
  { id: 27, text: "يستطيع فهم والتعرف على أحداث بسيطة ممثلة في صور شائعة", ageGroup: "سنتين - سنتين و5 شهور", domain: "إدراك الأحداث" },
  { id: 28, text: "يفهم ضمائر متنوعة سواء متصلة أو منفصلة (أنا، أنت، هو، ك)", ageGroup: "سنتين - سنتين و5 شهور", domain: "القواعد والضمائر" },

  // سنتين و6 شهور - سنتين و11 شهر
  { id: 29, text: "يفهم وظائف واستخدام الأشياء الشائعة (بإيش نأكل؟ بإيش نكتب؟)", ageGroup: "سنتين و6 شهور - سنتين و11 شهر", domain: "الاستخدام والوظيفة" },
  { id: 30, text: "يستطيع فهم وإدراك علاقة الجزء بالكل (عجلة السيارة، ذيل القطة)", ageGroup: "سنتين و6 شهور - سنتين و11 شهر", domain: "علاقات منطقية" },
  { id: 31, text: "يفهم الكلمات الواصفة البسيطة المتضادة مثل (كبير / صغير)", ageGroup: "سنتين و6 شهور - سنتين و11 شهر", domain: "الصفات والمتضادات" },
  { id: 32, text: "ينفذ أمراً مركباً من خطوتين متتاليتين دون الحاجة لاستخدام الإشارات التوضيحية", ageGroup: "سنتين و6 شهور - سنتين و11 شهر", domain: "اتباع أوامر مركبة" },

  // 3 سنوات - 3 سنوات و5 شهور
  { id: 33, text: "يفهم الكلمات الدالة على الكم والمقادير (واحد، كل، شوية، باقي)", ageGroup: "3 سنوات - 3 سنوات و5 شهور", domain: "مفاهيم الكم" },
  { id: 34, text: "يفهم فروق الضمائر المختلفة للملكية (هو، هي، بتاعه، بتاعها)", ageGroup: "3 سنوات - 3 سنوات و5 شهور", domain: "ضمائر الملكية" },
  { id: 35, text: "يفهم صيغة النفي في الجملة الشفهية (الولد لا يركض، ليس في البيت)", ageGroup: "3 سنوات - 3 سنوات و5 شهور", domain: "صيغ النفي" },

  // 3 سنوات و6 شهور - 3 سنوات و11 شهر
  { id: 36, text: "يتعرف ويشير إلى 3 ألوان أساسية على الأقل عند تسميتها له", ageGroup: "3 سنوات و6 شهور - 3 سنوات و11 شهر", domain: "الألوان والأشكال" },
  { id: 37, text: "يبدي القدرة على الاستنتاج البسيط من سياق حواري أو صورة (الجو مطر إيش نأخذ؟)", ageGroup: "3 سنوات و6 شهور - 3 سنوات و11 شهر", domain: "الاستدلال والاستنتاج" },
  { id: 38, text: "يفهم التبويب والتصنيف البسيط (فرز الحيوانات مقابل الألعاب)", ageGroup: "3 سنوات و6 شهور - 3 سنوات و11 شهر", domain: "التصنيف والتبويب" },
  { id: 39, text: "يفهم الصورة المتناظرة والمتطابقة في المعنى أو الوظيفة", ageGroup: "3 سنوات و6 شهور - 3 سنوات و11 شهر", domain: "الإدراك البصري" },
  { id: 40, text: "يفهم الكلمات الدالة على المقارنة والتفضيل مثل (أكثر من، أطول من)", ageGroup: "3 سنوات و6 شهور - 3 سنوات و11 شهر", domain: "صيغ التفضيل" },

  // 4 سنوات - 4 سنوات و5 شهور
  { id: 41, text: "يستطيع فهم ومتابعة تراكيب الجمل الطويلة والمعقدة ذات الروابط", ageGroup: "4 سنوات - 4 سنوات و5 شهور", domain: "فهم الجمل الطويلة" },
  { id: 42, text: "يفهم ويشير بدقة للكلمات الدالة على الصفات المتناقضة (طويل / قصير)", ageGroup: "4 سنوات - 4 سنوات و5 شهور", domain: "الصفات والمتضادات" },
  { id: 43, text: "يفهم ويحدد الأشكال الهندسية الأساسية الثلاثة (دائرة، مربع، مثلث)", ageGroup: "4 سنوات - 4 سنوات و5 شهور", domain: "الأشكال الهندسية" },
  { id: 44, text: "يفهم حروف الجر وظروف المكان الأكثر دقة (تحت، وراء، جنب، قدام)", ageGroup: "4 سنوات - 4 سنوات و5 شهور", domain: "مفاهيم المكان" },

  // 4 سنوات و6 شهور - 4 سنوات و11 شهر
  { id: 45, text: "يتعرف ويفهم طبيعة المهن والأشخاص القائمين عليها (طبيب، نجار، معلم)", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "المفاهيم الاجتماعية" },
  { id: 46, text: "يدرك الفروق الزمنية والأنشطة المرتبطة بمفهوم الوقت (ليل / نهار)", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "الإدراك الزمني" },
  { id: 47, text: "يستطيع فهم واستخلاص المعنى من جملة طويلة مسموعة تحكي قصة قصيرة", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "الفهم السمعي" },
  { id: 48, text: "يفهم جملة لغوية مركبة تحتوي على موصوف وموصوف به (اسم + صفتين، مثل: تفاحة حمراء كبيرة)", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "الفهم التركيبي" },
  { id: 49, text: "يفهم ويتعرف على الأشياء والحيوانات من خلال سماع وصفها (إيش هو الحيوان اللي عنده خرطوم طويل؟)", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "الاستدلال السمعي" },

  // 5 سنوات - 5 سنوات و5 شهور
  { id: 50, text: "يستطيع تحديد واستبعاد الشيء الذي لا ينتمي للمجموعة الضمنية (الكلب، القطة، العصفور، الكرسي)", ageGroup: "5 سنوات - 5 سنوات و5 شهور", domain: "التصنيف العقلي" },
  { id: 51, text: "يفهم الكلمات الدالة على الأعداد والمقادير العددية المحددة مثل (ثلاثة، خمسة)", ageGroup: "5 سنوات - 5 سنوات و5 شهور", domain: "المفاهيم العددية" },
  { id: 52, text: "يتعرف ويشير بدقة إلى أجزاء دقيقة من جسمه مثل (الخنصر، الإبهام، الكاحل)", ageGroup: "5 سنوات - 5 سنوات و5 شهور", domain: "أجزاء الجسم الدقيقة" },
  { id: 53, text: "يفهم الجمل اللغوية المبنية للمجهول (أُكلت التفاحة، كُسر الكوب)", ageGroup: "5 سنوات - 5 سنوات و5 شهور", domain: "الفهم النحوي" },

  // 5 سنوات و6 شهور - 5 سنوات و11 شهر
  { id: 54, text: "يتتبع ويرتب مجموعة من الصور المتسلسلة من الأكبر حجماً إلى الأصغر", ageGroup: "5 سنوات و6 شهور - 5 سنوات و11 شهر", domain: "المفاهيم البصرية والمصفوفات" },
  { id: 55, text: "يفهم دلالات الكميات الرياضية البسيطة والنسبية (النصف، الكل) والألوان المركبة", ageGroup: "5 سنوات و6 شهور - 5 سنوات و11 شهر", domain: "المفاهيم الرياضية" },
  { id: 56, text: "يفهم الكلمات والروابط الدالة على الترتيب الزمني للأحداث (أولاً، في الوسط، أخيراً)", ageGroup: "5 سنوات و6 شهور - 5 سنوات و11 شهر", domain: "التسلسل الزمني" },

  // 6 سنوات - 6 سنوات و5 شهور
  { id: 57, text: "يتعرف ويميز الصوت اللغوي الأول في الكلمة المنطوقة (إيش أول صوت في كلمة 'باب'؟)", ageGroup: "6 سنوات - 6 سنوات و5 شهور", domain: "الوعي الفونولوجي" },
  { id: 58, text: "يفهم الكلمة والروابط الدالة على التحديد اللفظي والحصر (كلهم ما عدا...)", ageGroup: "6 سنوات - 6 سنوات و5 شهور", domain: "الاستدلال اللغوي" },
  { id: 59, text: "يدرك الأصوات والكلمات التي لها نفس الوزن أو القافية (باب - ناب - شاب)", ageGroup: "6 سنوات - 6 سنوات و5 شهور", domain: "الوعي الفونولوجي" },

  // 6 سنوات و6 شهور - 6 سنوات و11 شهر
  { id: 60, text: "يستطيع شفهياً جمع وطرح أعداد صغيرة في حدود العدد خمسة", ageGroup: "6 سنوات و6 شهور - 6 سنوات و11 شهر", domain: "المهارات الحسابية" },
  { id: 61, text: "يفهم ويشير إلى الكلمات المصورة الدالة على فصول السنة الأربعة وتتابعها", ageGroup: "6 سنوات و6 شهور - 6 سنوات و11 شهر", domain: "المفاهيم البيئية" },
  { id: 62, text: "يستطيع تمييز الجملة التي تحتوي على خطأ نحوي أو تركيبي عند سماعها", ageGroup: "6 سنوات و6 شهور - 6 سنوات و11 شهر", domain: "الحس النحوي واللغوي" }
];

// 71 بنداً لاختبار اللغة التعبيرية
export const ABUHASIBA_EXPRESSIVE_ITEMS = [
  // الولادة - شهرين
  { id: 1, text: "الطفل يستطيع الرضاعة بشكل طبيعي دون حدوث شرقة أو اختناق", ageGroup: "الولادة - شهرين", domain: "وظائف العضلات الفمية" },
  { id: 2, text: "يصدر أصواتاً هادئة وناعمة ويناغي بانتظام (المناغاة)", ageGroup: "الولادة - شهرين", domain: "الإنتاج الصوتي المبكر" },
  { id: 3, text: "يستجيب للمتحدث والملعب له بالابتسام والسرور والضحك", ageGroup: "الولادة - شهرين", domain: "التفاعل الاجتماعي الانفعالي" },

  // 3 - 5 شهور
  { id: 4, text: "يستطيع تنويع نغمة وطبقة البكاء (أحياناً طويل، قصير، حاد، منخفض للتعبير عن احتياجات مختلفة)", ageGroup: "3 - 5 شهور", domain: "التواصل بالصوت" },
  { id: 5, text: "يصدر أصواتاً ولغواً مسموعاً يدل على السعادة والارتياح أو الضيق والحزن", ageGroup: "3 - 5 شهور", domain: "التعبير الانفعالي" },
  { id: 6, text: "يصدر أصواتاً ومقاطع صوتية عند التحدث إليه مع تحريك أطرافه بتفاعل ونشاط", ageGroup: "3 - 5 شهور", domain: "التواصل الحركي الصوتي" },

  // 6 - 8 شهور
  { id: 7, text: "يعبر عن الرفض أو الاعتراض باستخدام أصوات حادة أو إشارات وحركات جسدية", ageGroup: "6 - 8 شهور", domain: "التعبير عن الرفض" },
  { id: 8, text: "ينطق ويبتكر صوتين متحركين متتاليين مثل (/O/ - /a/)", ageGroup: "6 - 8 شهور", domain: "التطور الفونولوجي" },
  { id: 9, text: "ينطق صوتين ساكنين مختلفين وواضحين مثل (/d/ - /b/)", ageGroup: "6 - 8 شهور", domain: "مخارج الحروف" },
  { id: 10, text: "يمزج الأصوات الساكنة والمتحركة معاً لتكوين مقطع صوتي بسيط (با، دا)", ageGroup: "6 - 8 شهور", domain: "المناغاة المقطعية" },

  // 9 - 11 شهر
  { id: 11, text: "يحاول جذب انتباه المحيطين به بالصوت أو الإشارة أو الشد", ageGroup: "9 - 11 شهر", domain: "المبادأة الاجتماعية" },
  { id: 12, text: "يستطيع ممارسة لعبة بسيطة تبادلية مع الأم (مثل لعبة طاق طاقية أو الاختباء والظهور)", ageGroup: "9 - 11 شهر", domain: "اللعب التفاعلي" },
  { id: 13, text: "يتواصل مع الآخرين من حوله للتعبير عن رغباته باستخدام الحركات والإيماءات والإشارات", ageGroup: "9 - 11 شهر", domain: "التواصل غير اللفظي" },

  // سنة - سنة و5 شهور
  { id: 14, text: "قادر على إصدار مناغاة نغمتها واضحة مصحوبة بحركات نشطة في اليدين والرجلين لتوجيه الانتباه", ageGroup: "سنة - سنة و5 شهور", domain: "التواصل الشامل" },
  { id: 15, text: "يشارك في لعبة مألوفة مع شخص راشد بتركيز متبادل مستمر لمدة دقيقة إلى دقيقتين", ageGroup: "سنة - سنة و5 شهور", domain: "الانتباه الاجتماعي المشترك" },
  { id: 16, text: "يصدر مقطعين متصلين مكررين يشبهان الكلمات (بابا، ماما، تاتا)", ageGroup: "سنة - سنة و5 شهور", domain: "الإنتاج اللفظي" },
  { id: 17, text: "لديه في حصيلته اللغوية على الأقل كلمة واحدة ذات دلالة مستقرة وحقيقية", ageGroup: "سنة - سنة و5 شهور", domain: "الكلمة الأولى" },
  { id: 18, text: "يحاول ويبادر ببدء اللعب والتفاعل بنفسه مع الأخصائي أو الأبوين دون انتظار المبادرة منهم", ageGroup: "سنة - سنة و5 شهور", domain: "مبادرة التفاعل" },
  { id: 19, text: "يوجه نظر الأبوين لوجود لعبة أو شيء غريب ومثير في الغرفة عن طريق الإشارة المباشرة إليه بالسبابة", ageGroup: "سنة - سنة و5 شهور", domain: "الإشارة لغرض الانتباه" },
  { id: 20, text: "يصدر وينطق أصواتاً ساكنة متنوعة أثناء اللعب التلقائي (ب، م، د، ت، ن)", ageGroup: "سنة - سنة و5 شهور", domain: "التنوع الصوتي" },

  // سنة و6 شهور - سنة و11 شهر
  { id: 21, text: "يستطيع نطق مقاطع عديدة متتالية مكونة من ساكن ومتحرك أو ساكن ومتحرك وساكن بشكل استرسالي ومفهوم النغمة", ageGroup: "سنة و6 شهور - سنة و11 شهر", domain: "الاسترسال اللفظي" },
  { id: 22, text: "ينطق ويقلد مقاطع قصيرة وأصوات نغمتها مشابهة ومطابقة لكلام الأم أو الأخصائي", ageGroup: "سنة و6 شهور - سنة و11 شهر", domain: "التقليد الصوتي" },
  { id: 23, text: "يستطيع تقليد وترديد الكلمات الشائعة التي يسمعها فوراً وبمحاولة صحيحة ومقربة", ageGroup: "سنة و6 شهور - سنة و11 شهر", domain: "تقليد الكلمات" },
  { id: 24, text: "يستخدم ألفاظاً مبررة أو إشارات واضحة ومقننة لطلب الطعام أو الشراب أو الألعاب المفضلة", ageGroup: "سنة و6 شهور - سنة و11 شهر", domain: "التعبير عن الطلب" },
  { id: 25, text: "يستخدم الطفل حوالي 5 إلى 10 كلمات حقيقية ذات دلالة ثابتة في سياقات ومواقف حياتية مختلفة", ageGroup: "سنة و6 شهور - سنة و11 شهر", domain: "المخزون اللغوي" },

  // سنتين - سنتين و5 شهور
  { id: 26, text: "يسمي الأشياء والرموز المألوفة الموجودة في الصور المفردة عند سؤاله 'ما هذا؟'", ageGroup: "سنتين - سنتين و5 شهور", domain: "تسمية الصور" },
  { id: 27, text: "يعتمد شفهياً على الكلمات وعبارات التخاطب البسيطة للتعبير عن رغباته بشكل أكبر من الاعتماد على الإشارة الجسدية", ageGroup: "سنتين - سنتين و5 شهور", domain: "التواصل اللفظي الوظيفي" },
  { id: 28, text: "يستخدم نبرة وأسلوب الاستفهام لطرح تساؤلات بسيطة (فين بابا؟ إيش هذا؟)", ageGroup: "سنتين - سنتين و5 شهور", domain: "أساليب الاستفهام" },
  { id: 29, text: "يستخدم أساليب وتغييرات صوتية تدل على تطور البلاغة والمقدرة على التعبير اللفظي الموجه في لغته التلقائية", ageGroup: "سنتين - سنتين و5 شهور", domain: "بلاغة التعبير اللفظي" },
  { id: 30, text: "يعبر بجمل متنوعة وتراكيب مقبولة مكونة من كلمتين على الأقل أثناء اللعب والحديث التلقائي الحر", ageGroup: "سنتين - سنتين و5 شهور", domain: "تركيب الجمل" },

  // سنتين و6 شهور - سنتين و11 شهر
  { id: 31, text: "يستخدم جملاً منتظمة ومنسقة الكلمات من حيث الترتيب الأساسي (فاعل + فعل / اسم + صفة)", ageGroup: "سنتين و6 شهور - سنتين و11 شهر", domain: "بناء الجملة" },
  { id: 32, text: "يستطيع النطق والتعبير شفهياً بجمل متكاملة من 3 إلى 4 كلمات أثناء الحديث العفوي والتلقائي", ageGroup: "سنتين و6 شهور - سنتين و11 شهر", domain: "طول الجملة" },
  { id: 33, text: "يجيب بدقة ووضوح على أسئلة الاستفهام الشائعة الموجهة إليه مثل 'ماذا تفعل؟ (إيش تسوي؟)' أو 'أين اللعبة؟ (فين اللعبة؟)'", ageGroup: "سنتين و6 شهور - سنتين و11 شهر", domain: "الرد على الأسئلة" },
  { id: 34, text: "يستطيع استخدام وتصريف الفعل الدال على المضارع والحدث الحالي بطريقة صحيحة (يأكل، يشرب، يلعب)", ageGroup: "سنتين و6 شهور - سنتين و11 شهر", domain: "تصريف الأفعال" },
  { id: 35, text: "يستخدم فئات كلامية متنوعة (أسماء، أفعال، ضمائر، صفات أساسية) وبشكل مرن ومنسق في كلامه التلقائي", ageGroup: "سنتين و6 شهور - سنتين و11 شهر", domain: "التنوع القواعدي" },

  // 3 سنوات - 3 سنوات و5 شهور
  { id: 36, text: "يستطيع النطق بجملة صحيحة قواعدياً ومفهومة المعنى مكونة من 4 إلى 5 كلمات للتعبير عن حدث", ageGroup: "3 سنوات - 3 سنوات و5 شهور", domain: "طول الجملة وبناؤها" },
  { id: 37, text: "يسمي ويعدد بدقة أشخاصاً وأشياء وحيوانات متعددة تظهر معاً في صورة حيوية مركبة", ageGroup: "3 سنوات - 3 سنوات و5 شهور", domain: "التسمية المركبة" },
  { id: 38, text: "يستطيع التعبير اللفظي السليم عند سؤاله عن كيفية استخدام وفائدة الأدوات الشائعة (بإيش نأكل؟ نأكل بالملعقة)", ageGroup: "3 سنوات - 3 سنوات و5 شهور", domain: "التعبير الوظيفي" },
  { id: 39, text: "يعبر شفهياً عن مفاهيم المقادير والكم بكلمات مثل (كثير، قليل، حبة واحدة، أو يذكر رقماً في العد)", ageGroup: "3 سنوات - 3 سنوات و5 شهور", domain: "مفاهيم الكم اللفظي" },
  { id: 40, text: "يستخدم قواعد الملكية بوضوح تام بنسب الشيء لصاحبه (سيارة بابا، قلم الولد، فستان البنت)", ageGroup: "3 سنوات - 3 سنوات و5 شهور", domain: "صيغ الملكية" },
  { id: 41, text: "يعبر ويتحدث بدقة مستخدماً صيغة الفعل الماضي للدلالة على أحداث انتهت (أكلت، نمت، راح بابا)", ageGroup: "3 سنوات - 3 سنوات و5 شهور", domain: "زمن الماضي" },

  // 3 سنوات و6 شهور - 3 سنوات و11 شهر
  { id: 42, text: "يستخدم الكلمات الدالة على الحال والوصف والسرعة في كلامه (بسرعة، ببطء، بقوة، بهدوء)", ageGroup: "3 سنوات و6 شهور - 3 سنوات و11 شهر", domain: "ظروف الحال" },
  { id: 43, text: "يجيب على أسئلة الحوار بطريقة منطقية وسليمة مع استخدام صيغ وأدوات النفي المناسبة (لا، مو، ليس)", ageGroup: "3 سنوات و6 شهور - 3 سنوات و11 شهر", domain: "الرد المنطقي والنفي" },
  { id: 44, text: "يستطيع التعبير اللفظي بدقة عن عكس الصفات والكلمات الشائعة (كبير عكسه صغير، حار عكسه بارد)", ageGroup: "3 سنوات و6 شهور - 3 سنوات و11 شهر", domain: "المعكوسات والصفات" },
  { id: 45, text: "يجيب بذكاء ومنطقية على أسئلة حول أحداث افتراضية ومواقف حل المشكلات (إيش تسوي لو ضاع قلمك؟)", ageGroup: "3 سنوات و6 شهور - 3 سنوات و11 شهر", domain: "حل المشكلات اللفظية" },

  // 4 سنوات - 4 سنوات و5 شهور
  { id: 46, text: "يستجيب بدقة لفظية كاملة ومبررة عند السؤال عن المكان بأداة الاستفهام 'أين (فين)' ليوضح التموقع والموقع", ageGroup: "4 سنوات - 4 سنوات و5 شهور", domain: "تحديد الموقع" },
  { id: 47, text: "يستطيع إكمال المتناظرات اللفظية الشائعة اعتماداً على تداعيه السمعي (الشمس تطلع بالنهار، والقمر يطلع بـ... 'الليل')", ageGroup: "4 سنوات - 4 سنوات و5 شهور", domain: "التداعي السمعي" },
  { id: 48, text: "يستطيع تسمية الشيء ووصفه بدقة بعد سماع تعريف وظيفته واستخدامه الشائع", ageGroup: "4 سنوات - 4 سنوات و5 شهور", domain: "التسمية بالوصف" },
  { id: 49, text: "يستطيع صياغة واستخدام جمل تعبر عن الفعل المبني للمجهول في سياق الحديث (الكوب انكسر، الباب انفتح)", ageGroup: "4 سنوات - 4 سنوات و5 شهور", domain: "البناء للمجهول اللفظي" },

  // 4 سنوات و6 شهور - 4 سنوات و11 شهر
  { id: 50, text: "يستجيب للاستفهام بأداة 'لماذا (ليه؟)' ويعطي تفسيراً وتعليلاً منطقياً ومقبولاً للسبب", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "التفسير والتعليل" },
  { id: 51, text: "يستطيع لفظياً تصنيف وتسمية المجموعات الضمنية للأشياء (التفاح والموز والبرتقال كلهم... 'فواكه')", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "تسمية الفئات" },
  { id: 52, text: "يعبر شفهياً وبدقة عن صفات المقارنة والأبعاد المتنوعة للأشياء (أطول، أقصر، أثقل، أخف)", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "التعبير عن الصفات" },
  { id: 53, text: "يستطيع تكرار وترديد جمل طويلة وصعبة القواعد والمخارج اللفظية بدقة كاملة ودون تبسيط مخل", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "تكرار الجمل المعقدة" },
  { id: 54, text: "يستطيع التعبير اللفظي بدقة عن صيغ المثنى للأسماء والأفعال (ولدان، يلعبان، سيارتان)", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "صيغ المثنى" },
  { id: 55, text: "يستطيع استخدام اسم الفاعل والمهنة في تبرير الأفعال (إيش يسوي النجار؟... 'يصلح الخشب')", ageGroup: "4 سنوات و6 شهور - 4 سنوات و11 شهر", domain: "المفردات التعبيرية" },

  // 5 سنوات - 5 سنوات و5 شهور
  { id: 56, text: "يستطيع صياغة وطرح سؤال كامل الأركان وقويم النحو والتركيب استجابة لتنبيه أو توجيه مصور", ageGroup: "5 سنوات - 5 سنوات و5 شهور", domain: "صياغة الأسئلة" },
  { id: 57, text: "الطفل يستطيع وصف أوجه التشابه والاختلاف بين شيئين مألوفين (بإيش يتشابه التفاح والبرتقال؟)", ageGroup: "5 سنوات - 5 سنوات و5 شهور", domain: "المقارنات اللفظية" },
  { id: 58, text: "يستطيع تسمية وتعداد 3 عناصر على الأقل تنتمي لعنوان مجموعة ضمنية معينة عند الطلب منه", ageGroup: "5 سنوات - 5 سنوات و5 شهور", domain: "تسمية المجموعات" },

  // 5 سنوات و6 شهور - 5 سنوات و11 شهر
  { id: 59, text: "يستطيع نطق وتسمية الاسم مباشرة وتلقائياً بعد سماع صفة مميزة تسبقه (إيش هو الشيء اللذيذ الحلو الأحمر اللي نأكله؟)", ageGroup: "5 سنوات و6 شهور - 5 سنوات و11 شهر", domain: "الربط اللفظي المفهومي" },
  { id: 60, text: "يعد ويحصي مجموعة أشياء أمامه بصوت مرتفع ويعطي الرقم الإجمالي بدقة مع تسمية أشكالها وألوانها بالتفصيل", ageGroup: "5 سنوات و6 شهور - 5 سنوات و11 شهر", domain: "العد والوصف الكمي" },
  { id: 61, text: "يستطيع إصلاح وتصويب الجمل ذات المعاني أو المفاهيم الخاطئة منطقياً (الشمس تطلع بالليل... 'لا الشمس تطلع بالنهار')", ageGroup: "5 سنوات و6 شهور - 5 سنوات و11 شهر", domain: "إصلاح المفاهيم اللفظية" },

  // 6 سنوات - 6 سنوات و5 شهور
  { id: 62, text: "يستطيع تعريف الكلمات والأسماء المجردة مع ذكر صفتين مميزتين للشيء أو استخدامين وظيفيين له", ageGroup: "6 سنوات - 6 سنوات و5 شهور", domain: "التعريف المفاهيمي" },
  { id: 63, text: "يستطيع رصد وتصحيح الخطأ النحوي أو التركيبي في جملة يسمعها شفهياً وإعادة صياغتها بشكل صحيح", ageGroup: "6 سنوات - 6 سنوات و5 شهور", domain: "التصحيح النحوي" },
  { id: 64, text: "يستطيع التعبير اللفظي بمرونة مستخدماً الكلمات الواصفة للكم والنسبة (علبة فاضية، كاس مليانة، صحن أكثر من الثاني)", ageGroup: "6 سنوات - 6 سنوات و5 شهور", domain: "وصف الكم النسبي" },
  { id: 65, text: "يستطيع صياغة والتعبير عن صيغ التفضيل المطلق والنسبي للأشياء بدقة (هذه أكبر واحدة، هذا ولد أطولهم)", ageGroup: "6 سنوات - 6 سنوات و5 شهور", domain: "صيغ التفضيل العليا" },

  // 6 سنوات و6 شهور - 6 سنوات و11 شهر
  { id: 66, text: "يستطيع التعبير الشفهي بدقة عن ظرفي الزمان وعلاقة التتابع الحركي (قبل، بعد، في نفس الوقت)", ageGroup: "6 سنوات و6 شهور - 6 سنوات و11 شهر", domain: "مفاهيم الزمان والترتيب" },
  { id: 67, text: "يستطيع سرد قصة قصيرة متماسكة ومنسقة تشتمل على مقدمة وتسلسل أحداث منطقي وخاتمة بسيطة بناءً على صور متتالية", ageGroup: "6 سنوات و6 شهور - 6 سنوات و11 شهر", domain: "سرد القصص والتعابير" },
  { id: 68, text: "يستخدم وينطق صيغ الجمع غير المنتظم (جمع التكسير) بشكل صحيح تماماً في كلامه (أقلام، كراسي، أبواب، نوافذ)", ageGroup: "6 سنوات و6 شهور - 6 سنوات و11 شهر", domain: "جموع التكسير اللغوية" },

  // 7 سنوات - 7 سنوات و5 شهور
  { id: 69, text: "يستطيع إنتاج وتسمية كلمات تتبع نفس الوزن الصوتي ونفس نغمة الكلمة المعطاة (قلم - علم - حلم)", ageGroup: "7 سنوات - 7 سنوات و5 شهور", domain: "الإنتاج الفونولوجي والموازين" },
  { id: 70, text: "يستطيع التعبير واستخدام ظروف المكان الأكثر تركيباً مثل (في الوسط، من حولين، بالتناوب)", ageGroup: "7 سنوات - 7 سنوات و5 شهور", domain: "مفاهيم المكان المركبة" },
  { id: 71, text: "يستخدم ويعبر شفهياً بدقة مستعيناً بالأسماء الموصولة وأسماء الإشارة في جمل مركبة (الولد الذي...، هؤلاء هم...)", ageGroup: "7 سنوات - 7 سنوات و5 شهور", domain: "الروابط اللغوية المعقدة" }
];

/**
 * دالة لتحديد نقاط البداية المعتمدة لكل من قسمي اللغة الاستقبالية والتعبيرية بناءً على السن بالشهور
 * @param {number} ageMonths 
 */
export function getAbuHasibaStartingPoints(ageMonths) {
  if (ageMonths <= 2) return { receptiveStart: 1, expressiveStart: 1 };
  if (ageMonths <= 5) return { receptiveStart: 5, expressiveStart: 4 };
  if (ageMonths <= 8) return { receptiveStart: 9, expressiveStart: 7 };
  if (ageMonths <= 11) return { receptiveStart: 13, expressiveStart: 11 };
  if (ageMonths <= 17) return { receptiveStart: 17, expressiveStart: 14 };
  if (ageMonths <= 23) return { receptiveStart: 21, expressiveStart: 21 };
  if (ageMonths <= 29) return { receptiveStart: 25, expressiveStart: 26 };
  if (ageMonths <= 35) return { receptiveStart: 29, expressiveStart: 31 };
  if (ageMonths <= 41) return { receptiveStart: 33, expressiveStart: 36 };
  if (ageMonths <= 47) return { receptiveStart: 36, expressiveStart: 42 };
  if (ageMonths <= 53) return { receptiveStart: 41, expressiveStart: 46 };
  if (ageMonths <= 59) return { receptiveStart: 45, expressiveStart: 50 };
  if (ageMonths <= 65) return { receptiveStart: 50, expressiveStart: 56 };
  if (ageMonths <= 71) return { receptiveStart: 54, expressiveStart: 59 };
  if (ageMonths <= 77) return { receptiveStart: 57, expressiveStart: 62 };
  if (ageMonths <= 83) return { receptiveStart: 60, expressiveStart: 66 };
  return { receptiveStart: 62, expressiveStart: 69 };
}

/**
 * دالة تحديد العمر اللغوي المكافئ (LAE) بالشهور بناءً على الدرجة الخام
 */
export function lookupLanguageAgeEquivalent(rawScore, type = "total") {
  if (type === "receptive") {
    if (rawScore <= 4) return 2;
    if (rawScore <= 8) return 5;
    if (rawScore <= 12) return 8;
    if (rawScore <= 16) return 11;
    if (rawScore <= 20) return 17;
    if (rawScore <= 24) return 23;
    if (rawScore <= 28) return 29;
    if (rawScore <= 32) return 35;
    if (rawScore <= 35) return 41;
    if (rawScore <= 40) return 47;
    if (rawScore <= 44) return 53;
    if (rawScore <= 49) return 59;
    if (rawScore <= 53) return 65;
    if (rawScore <= 56) return 71;
    if (rawScore <= 59) return 77;
    return 89; // 7y 5m
  } else if (type === "expressive") {
    if (rawScore <= 3) return 2;
    if (rawScore <= 6) return 5;
    if (rawScore <= 10) return 8;
    if (rawScore <= 13) return 11;
    if (rawScore <= 20) return 17;
    if (rawScore <= 25) return 23;
    if (rawScore <= 30) return 29;
    if (rawScore <= 35) return 35;
    if (rawScore <= 41) return 41;
    if (rawScore <= 45) return 47;
    if (rawScore <= 49) return 53;
    if (rawScore <= 55) return 59;
    if (rawScore <= 58) return 65;
    if (rawScore <= 61) return 71;
    if (rawScore <= 65) return 77;
    if (rawScore <= 68) return 83;
    return 89; // 7y 5m
  } else {
    // Total Raw score (max 133)
    if (rawScore <= 5) return 2;
    if (rawScore <= 10) return 5;
    if (rawScore <= 18) return 8;
    if (rawScore <= 25) return 11;
    if (rawScore <= 36) return 17;
    if (rawScore <= 45) return 23;
    if (rawScore <= 58) return 29;
    if (rawScore <= 67) return 35;
    if (rawScore <= 76) return 41;
    if (rawScore <= 85) return 47;
    if (rawScore <= 93) return 53;
    if (rawScore <= 104) return 59;
    if (rawScore <= 111) return 65;
    if (rawScore <= 117) return 71;
    if (rawScore <= 124) return 77;
    return 89; // 7y 5m
  }
}

/**
 * دالة لحساب وتصيغ الأهداف السلوكية التربوية الفردية الذكية (IEP Goals) بناءً على بنود نقاط الضعف
 */
export function formulateAbuHasibaGoal(itemText, isReceptive = true) {
  if (isReceptive) {
    return `أن يستجيب الطالب للمثير اللفظي بنجاح ويميز شفهياً [${itemText.replace("الطفل ", "")}] بنسبة نجاح 80% على الأقل خلال فترة التدريب المقررة بالخطة.`;
  } else {
    return `أن يعبر الطالب شفهياً بوضوح وينطق لغوياً [${itemText.replace("الطفل ", "")}] بنسبة إتقان لا تقل عن 80% في 4 جلسات تدريبية متتالية.`;
  }
}

/**
 * المحرك الرئيسي والذكي لمعالجة الدرجات السيكومترية وتحليلات مقياس أبو حسيبة للغة المعرب
 */
export function calculateAbuHasibaPsychometrics(receptiveAnswers = {}, expressiveAnswers = {}, ageMonths = 36) {
  // 1. تحديد نقاط البداية القياسية
  const { receptiveStart, expressiveStart } = getAbuHasibaStartingPoints(ageMonths);

  // 2. تحليل وتحديد درجات جميع البنود بعد إعمال البسال والسقف
  
  // أ. اللغة الاستقبالية (62 بنداً)
  const finalReceptiveScores = {};
  const receptiveItems = ABUHASIBA_RECEPTIVE_ITEMS;
  
  // إيجاد البسال (قاعدة البداية): 3 إجابات صحيحة (1) متتالية
  let receptiveBasalIndex = -1; // أول بند من الـ 3 بنود الصحيحة المتتالية
  for (let i = receptiveItems.length - 1; i >= 0; i--) {
    const item = receptiveItems[i];
    const score1 = receptiveAnswers[item.id] !== undefined ? Number(receptiveAnswers[item.id]) : 0;
    const score2 = i + 1 < receptiveItems.length && receptiveAnswers[receptiveItems[i + 1].id] !== undefined ? Number(receptiveAnswers[receptiveItems[i + 1].id]) : 0;
    const score3 = i + 2 < receptiveItems.length && receptiveAnswers[receptiveItems[i + 2].id] !== undefined ? Number(receptiveAnswers[receptiveItems[i + 2].id]) : 0;
    if (score1 === 1 && score2 === 1 && score3 === 1) {
      receptiveBasalIndex = i;
      break;
    }
  }

  // إيجاد السقف (سقف الاختبار): 5 إجابات خاطئة (0) متتالية
  let receptiveCeilingIndex = -1; // أول بند من الـ 5 بنود الخاطئة المتتالية
  for (let i = 0; i < receptiveItems.length; i++) {
    const item = receptiveItems[i];
    const score1 = receptiveAnswers[item.id] !== undefined ? Number(receptiveAnswers[item.id]) : 1; // افتراض الصحة قبل البسال
    const score2 = i + 1 < receptiveItems.length && receptiveAnswers[receptiveItems[i + 1].id] !== undefined ? Number(receptiveAnswers[receptiveItems[i + 1].id]) : 1;
    const score3 = i + 2 < receptiveItems.length && receptiveAnswers[receptiveItems[i + 2].id] !== undefined ? Number(receptiveAnswers[receptiveItems[i + 2].id]) : 1;
    const score4 = i + 3 < receptiveItems.length && receptiveAnswers[receptiveItems[i + 3].id] !== undefined ? Number(receptiveAnswers[receptiveItems[i + 3].id]) : 1;
    const score5 = i + 4 < receptiveItems.length && receptiveAnswers[receptiveItems[i + 4].id] !== undefined ? Number(receptiveAnswers[receptiveItems[i + 4].id]) : 1;
    
    if (score1 === 0 && score2 === 0 && score3 === 0 && score4 === 0 && score5 === 0) {
      receptiveCeilingIndex = i;
      break;
    }
  }

  // تطبيق القواعد على جميع البنود الاستقبالية
  let receptiveRawScore = 0;
  const receptiveWeaknesses = [];
  receptiveItems.forEach((item, index) => {
    let finalScore = 0;
    if (receptiveBasalIndex !== -1 && index < receptiveBasalIndex) {
      // احتساب مجاني لبنود ما قبل القاعدة
      finalScore = 1;
    } else if (receptiveCeilingIndex !== -1 && index >= receptiveCeilingIndex + 5) {
      // تصفير ما بعد السقف
      finalScore = 0;
    } else {
      // البنود المطبقة فعلياً
      finalScore = receptiveAnswers[item.id] !== undefined ? Number(receptiveAnswers[item.id]) : 0;
    }

    finalReceptiveScores[item.id] = finalScore;
    if (finalScore === 1) {
      receptiveRawScore++;
    } else {
      // إذا كان البند يقع بين البسال والسقف، فهو يمثل نقطة ضعف للطفل
      const isBeforeBasal = receptiveBasalIndex !== -1 && index < receptiveBasalIndex;
      const isAfterCeiling = receptiveCeilingIndex !== -1 && index >= receptiveCeilingIndex + 5;
      if (!isBeforeBasal && !isAfterCeiling) {
        receptiveWeaknesses.push({
          id: item.id,
          text: item.text,
          ageGroup: item.ageGroup,
          domain: item.domain,
          goal: formulateAbuHasibaGoal(item.text, true)
        });
      }
    }
  });


  // ب. اللغة التعبيرية (71 بنداً)
  const finalExpressiveScores = {};
  const expressiveItems = ABUHASIBA_EXPRESSIVE_ITEMS;
  
  // إيجاد البسال التعبيري (3 إجابات صحيحة متتالية)
  let expressiveBasalIndex = -1;
  for (let i = expressiveItems.length - 1; i >= 0; i--) {
    const item = expressiveItems[i];
    const score1 = expressiveAnswers[item.id] !== undefined ? Number(expressiveAnswers[item.id]) : 0;
    const score2 = i + 1 < expressiveItems.length && expressiveAnswers[expressiveItems[i + 1].id] !== undefined ? Number(expressiveAnswers[expressiveItems[i + 1].id]) : 0;
    const score3 = i + 2 < expressiveItems.length && expressiveAnswers[expressiveItems[i + 2].id] !== undefined ? Number(expressiveAnswers[expressiveItems[i + 2].id]) : 0;
    if (score1 === 1 && score2 === 1 && score3 === 1) {
      expressiveBasalIndex = i;
      break;
    }
  }

  // إيجاد السقف التعبيري (5 إجابات خاطئة متتالية)
  let expressiveCeilingIndex = -1;
  for (let i = 0; i < expressiveItems.length; i++) {
    const item = expressiveItems[i];
    const score1 = expressiveAnswers[item.id] !== undefined ? Number(expressiveAnswers[item.id]) : 1;
    const score2 = i + 1 < expressiveItems.length && expressiveAnswers[expressiveItems[i + 1].id] !== undefined ? Number(expressiveAnswers[expressiveItems[i + 1].id]) : 1;
    const score3 = i + 2 < expressiveItems.length && expressiveAnswers[expressiveItems[i + 2].id] !== undefined ? Number(expressiveAnswers[expressiveItems[i + 2].id]) : 1;
    const score4 = i + 3 < expressiveItems.length && expressiveAnswers[expressiveItems[i + 3].id] !== undefined ? Number(expressiveAnswers[expressiveItems[i + 3].id]) : 1;
    const score5 = i + 4 < expressiveItems.length && expressiveAnswers[expressiveItems[i + 4].id] !== undefined ? Number(expressiveAnswers[expressiveItems[i + 4].id]) : 1;
    
    if (score1 === 0 && score2 === 0 && score3 === 0 && score4 === 0 && score5 === 0) {
      expressiveCeilingIndex = i;
      break;
    }
  }

  let expressiveRawScore = 0;
  const expressiveWeaknesses = [];
  expressiveItems.forEach((item, index) => {
    let finalScore = 0;
    if (expressiveBasalIndex !== -1 && index < expressiveBasalIndex) {
      finalScore = 1;
    } else if (expressiveCeilingIndex !== -1 && index >= expressiveCeilingIndex + 5) {
      finalScore = 0;
    } else {
      finalScore = expressiveAnswers[item.id] !== undefined ? Number(expressiveAnswers[item.id]) : 0;
    }

    finalExpressiveScores[item.id] = finalScore;
    if (finalScore === 1) {
      expressiveRawScore++;
    } else {
      const isBeforeBasal = expressiveBasalIndex !== -1 && index < expressiveBasalIndex;
      const isAfterCeiling = expressiveCeilingIndex !== -1 && index >= expressiveCeilingIndex + 5;
      if (!isBeforeBasal && !isAfterCeiling) {
        expressiveWeaknesses.push({
          id: item.id,
          text: item.text,
          ageGroup: item.ageGroup,
          domain: item.domain,
          goal: formulateAbuHasibaGoal(item.text, false)
        });
      }
    }
  });

  // 3. حساب الدرجة الخام الكلية
  const totalRawScore = receptiveRawScore + expressiveRawScore;

  // 4. مطابقة الأعمار اللغوية المكافئة (Language Age Equivalent - LAE)
  const receptiveLAEMonths = lookupLanguageAgeEquivalent(receptiveRawScore, "receptive");
  const expressiveLAEMonths = lookupLanguageAgeEquivalent(expressiveRawScore, "expressive");
  const totalLAEMonths = lookupLanguageAgeEquivalent(totalRawScore, "total");

  // 5. حساب الفجوة اللغوية وتأخر السن (Delay Gaps)
  const totalDelayGapMonths = Math.max(0, ageMonths - totalLAEMonths);
  const receptiveDelayGapMonths = Math.max(0, ageMonths - receptiveLAEMonths);
  const expressiveDelayGapMonths = Math.max(0, ageMonths - expressiveLAEMonths);

  // 6. استخراج الدرجات المعيارية (Standard Scores - SS) والرتب المئينية
  // نموذج حسابي سيكومتري مقنن: متوسط 100 وانحراف معياري 15
  // الدرجات المتوقعة في السن الحالي:
  const expectedReceptiveRaw = receptiveStart + 2;
  const expectedExpressiveRaw = expressiveStart + 2;
  const expectedTotalRaw = expectedReceptiveRaw + expectedExpressiveRaw;

  const receptiveDiff = receptiveRawScore - expectedReceptiveRaw;
  const expressiveDiff = expressiveRawScore - expectedExpressiveRaw;
  const totalDiff = totalRawScore - expectedTotalRaw;

  let receptiveSS = Math.round(100 + (receptiveDiff / 5) * 15);
  let expressiveSS = Math.round(100 + (expressiveDiff / 6) * 15);
  let totalSS = Math.round(100 + (totalDiff / 10) * 15);

  // وضع قيود سيكومترية للدرجات المعيارية (من 45 إلى 155)
  receptiveSS = Math.max(45, Math.min(155, receptiveSS));
  expressiveSS = Math.max(45, Math.min(155, expressiveSS));
  totalSS = Math.max(45, Math.min(155, totalSS));

  // حساب المئينات بناءً على الدرجة المعيارية
  function ssToPercentile(ss) {
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
  }

  const receptivePR = ssToPercentile(receptiveSS);
  const expressivePR = ssToPercentile(expressiveSS);
  const totalPR = ssToPercentile(totalSS);

  // 7. حد القطع والتشخيص الإكلينيكي للنمو اللغوي
  let clinicalClassification = "";
  let severityColor = "";
  if (totalSS < 77.5) {
    clinicalClassification = "تأخر لغوي / مهارات لغوية أقل من الطبيعي (Delayed Development)";
    severityColor = "#ef4444"; // أحمر للتنبيه والتأخر
  } else {
    clinicalClassification = "طبيعي / ضمن المدى المعتاد (Typical Development)";
    severityColor = "#10b981"; // أخضر طبيعي
  }

  // 8. نقطة الحد الفاصل (Cut-off Points) بحسب الفئة العمرية للطفل
  const getCutoffText = (months) => {
    if (months <= 11) return "الدرجة الخام الكلية المقبولة: 15 فما فوق";
    if (months <= 23) return "الدرجة الخام الكلية المقبولة: 35 فما فوق";
    if (months <= 35) return "الدرجة الخام الكلية المقبولة: 55 فما فوق";
    if (months <= 47) return "الدرجة الخام الكلية المقبولة: 75 فما فوق";
    if (months <= 59) return "الدرجة الخام الكلية المقبولة: 95 فما فوق";
    if (months <= 71) return "الدرجة الخام الكلية المقبولة: 110 فما فوق";
    return "الدرجة الخام الكلية المقبولة: 120 فما فوق";
  };
  const cutoffText = getCutoffText(ageMonths);

  return {
    receptiveRawScore,
    expressiveRawScore,
    totalRawScore,
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
    receptiveWeaknesses,
    expressiveWeaknesses,
    receptiveBasalIndex,
    receptiveCeilingIndex,
    expressiveBasalIndex,
    expressiveCeilingIndex,
    finalReceptiveScores,
    finalExpressiveScores
  };
}
