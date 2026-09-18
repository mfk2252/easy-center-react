/**
 * مقياس طيف التوحد للأطفال واليافعين — (AQ - Autism Spectrum Quotient)
 * Autism Research Centre (ARC) — University of Cambridge
 * بقيادة البروفيسور سيمون بارون-كوهين (Prof. Simon Baron-Cohen)
 * 
 * أداة قياس وفرز إكلينيكية معتمدة مفتوحة المصدر (Open Access / Creative Commons)
 * منشورة للبحث والاستخدام الإكلينيكي من الموقع الرسمي لمركز أبحاث التوحد بجامعة كامبريدج.
 * 
 * الفئات:
 * 1. نسخة الأطفال (AQ-Child): من عمر 4 إلى 11 سنة (50 عبارة).
 * 2. نسخة اليافعين (AQ-Adolescent): من عمر 12 إلى 16 سنة (50 عبارة).
 * 
 * المجالات الخمسة (10 بنود لكل مجال = 50 بنداً):
 * 1. المهارات الاجتماعية (Social Skills)
 * 2. تحويل الانتباه والمرونة الذهنية (Attention Switching)
 * 3. الانتباه للتفاصيل الدقيقة (Attention to Detail)
 * 4. التواصل (Communication)
 * 5. الخيال والتفكير المجرد واللعب الرمزي (Imagination)
 */

export const AQ_COPYRIGHT_INFO = {
  scaleFullNameAr: 'مقياس طيف التوحد للأطفال واليافعين — AQ',
  scaleFullNameEn: 'Autism Spectrum Quotient (AQ-Child / AQ-Adolescent)',
  acronym: 'AQ',
  authorsAr: 'البروفيسور سيمون بارون-كوهين، سالي ويلرايت، وفريق مركز أبحاث التوحد',
  authorsEn: 'Prof. Simon Baron-Cohen, Sally Wheelwright, et al.',
  publisherAr: 'مركز أبحاث التوحد بجامعة كامبريدج (Autism Research Centre - ARC, University of Cambridge)',
  publisherEn: 'Autism Research Centre (ARC), University of Cambridge',
  targetAge: 'نسخة الأطفال: 4–11 سنة | نسخة اليافعين: 12–16 سنة',
  diagnosticCategory: 'الكشف والفرز الإكلينيكي لسمات طيف التوحد (Screening for Autism Spectrum Conditions)',
  licensingStatus: 'أداة مفتوحة ومنشورة تحت المشاع الإبداعي للبحث والاستخدام الإكلينيكي (Open Access by ARC Cambridge)',
  licensingNotice: 'أداة قياس سريرية مجانية مصرح باستخدامها الطبي والتأهيلي من جامعة كامبريدج، معتمدة عالمياً كأحد أدق استبيانات الفرز لسمات طيف التوحد ومتلازمة أسبرجر.',
  purpose: 'الكشف السريع وقياس مستوى السمات والسلوكيات المرتبطة بطيف التوحد عبر خمسة أبعاد معرفية وسلوكية واجتماعية، واشتقاق الأولويات التدخلية للخطة الفردية (IEP).',
};

export const AQ_DOMAINS = [
  {
    id: 'social',
    code: 'SS',
    name: 'المهارات الاجتماعية',
    nameEn: 'Social Skills',
    itemsCount: 10,
    maxScore: 10,
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    description: 'يقيس مدى سهولة وسلاسة التفاعل مع الأقران، الرغبة في الصداقة، الاندماج في المجموعات، واللباقة الاجتماعية.',
    itemIndices: [1, 11, 13, 15, 22, 36, 44, 45, 47, 48],
  },
  {
    id: 'attention_switching',
    code: 'AS',
    name: 'تحويل الانتباه والمرونة المعرفية',
    nameEn: 'Attention Switching',
    itemsCount: 10,
    maxScore: 10,
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fcd34d',
    description: 'يقيس القدرة على الانتقال بين المهام، تقبل التغيير في الروتين، استئناف النشاط بعد المقاطعة، وتعدد المهام.',
    itemIndices: [2, 4, 10, 16, 25, 32, 34, 37, 43, 46],
  },
  {
    id: 'attention_detail',
    code: 'AD',
    name: 'الانتباه للتفاصيل الدقيقة',
    nameEn: 'Attention to Detail',
    itemsCount: 10,
    maxScore: 10,
    color: '#2563eb',
    bgLight: '#eff6ff',
    borderColor: '#93c5fd',
    description: 'يقيس دقة ملاحظة الأنماط والأصوات والتفاصيل الصغيرة، والأرقام والبيانات التي قد يغفل عنها الآخرون.',
    itemIndices: [5, 6, 9, 12, 19, 23, 28, 29, 30, 49],
  },
  {
    id: 'communication',
    code: 'COM',
    name: 'التواصل والحديث التبادلي',
    nameEn: 'Communication',
    itemsCount: 10,
    maxScore: 10,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#c4b5fd',
    description: 'يقيس مهارات تبادل أطراف الحديث، فهم ما بين السطور، إدراك المقاصد غير المباشرة، وقراءة نوايا المتحدث.',
    itemIndices: [7, 17, 18, 26, 27, 31, 33, 35, 38, 39],
  },
  {
    id: 'imagination',
    code: 'IMG',
    name: 'الخيال والتفكير المجرد واللعب الرمزي',
    nameEn: 'Imagination',
    itemsCount: 10,
    maxScore: 10,
    color: '#dc2626',
    bgLight: '#fef2f2',
    borderColor: '#fca5a5',
    description: 'يقيس القدرة على اللعب التخيلي/التمثيلي، فهم القصص الخيالية، التنبؤ بمشاعر وشخصيات الآخرين، والمرونة التصورية.',
    itemIndices: [3, 8, 14, 20, 21, 24, 40, 41, 42, 50],
  },
];

export const AQ_RESPONSE_OPTIONS = [
  { value: 'def_agree', label: 'أوافق بشدة', labelEn: 'Definitely Agree' },
  { value: 'slight_agree', label: 'أوافق نوعاً ما', labelEn: 'Slightly Agree' },
  { value: 'slight_disagree', label: 'لا أوافق نوعاً ما', labelEn: 'Slightly Disagree' },
  { value: 'def_disagree', label: 'لا أوافق بشدة', labelEn: 'Definitely Disagree' },
];

/**
 * بنود مقياس AQ الكاملة (50 بنداً) مع التوجيه المعياري (Keying) وتصنيف المجال
 * keying: 'AGREE' تعني أن إجابة (أوافق بشدة أو نوعاً ما) تسجل نقطة طيف توحد (1)
 * keying: 'DISAGREE' تعني أن إجابة (لا أوافق بشدة أو نوعاً ما) تسجل نقطة طيف توحد (1)
 */
export const AQ_ITEMS = [
  {
    id: 1,
    domainId: 'social',
    textAr: 'يفضل القيام بالأنشطة مع الآخرين بدلاً من القيام بها بمفرده.',
    textEn: 'S/he prefers to do things with others rather than on her/his own.',
    keying: 'DISAGREE',
    iepGoal: 'تنمية الرغبة والمبادرة في مشاركة الأقران في الأنشطة واللعب الجماعي.',
  },
  {
    id: 2,
    domainId: 'attention_switching',
    textAr: 'يفضل القيام بالأمور بنفس الطريقة مراراً وتكراراً (روتين متكرر وثابت).',
    textEn: 'S/he prefers to do things the same way over and over again.',
    keying: 'AGREE',
    iepGoal: 'زيادة المرونة السلوكية وتقبل التنويع في طرق أداء المهام والأنشطة.',
  },
  {
    id: 3,
    domainId: 'imagination',
    textAr: 'إذا حاول تخيل شيء ما، يجد سهولة بالغة في تكوين صورة ذهنية واضحة له.',
    textEn: 'If s/he tries to imagine something, s/he finds it very easy to create a picture in her/his mind.',
    keying: 'DISAGREE',
    iepGoal: 'تعزيز مهارات التصور الذهني وتمثيل المفاهيم المجردة من خلال الوسائل البصرية.',
  },
  {
    id: 4,
    domainId: 'attention_switching',
    textAr: 'ينغمس بشدة في نشاط واحد لدرجة أنه يفقد الإحساس بما يدور حوله تماماً.',
    textEn: 'S/he frequently gets so strongly absorbed in one thing that s/he loses sight of other things.',
    keying: 'AGREE',
    iepGoal: 'تدريب الطفل على الاستجابة للمنبهات الخارجية أثناء الاندماج وتوزيع الانتباه.',
  },
  {
    id: 5,
    domainId: 'attention_detail',
    textAr: 'غالباً ما يلاحظ الأصوات الخافتة أو الدقيقة التي لا يلاحظها الآخرون.',
    textEn: 'S/he often notices small sounds when others do not.',
    keying: 'AGREE',
    iepGoal: 'إدارة وتكييف الاستجابات الحسية السمعية وتصفية المشتتات المحيطة.',
  },
  {
    id: 6,
    domainId: 'attention_detail',
    textAr: 'عادة ما يلاحظ أرقام المنازل أو لوحات السيارات أو الأنماط والمعلومات المماثلة بدقة.',
    textEn: 'S/he usually notices house numbers or similar strings of information.',
    keying: 'AGREE',
    iepGoal: 'توظيف مهارة ملاحظة الأنماط في الأنشطة الأكاديمية والمهام الحياتية المفيدة.',
  },
  {
    id: 7,
    domainId: 'communication',
    textAr: 'يستطيع الآخرون إخباره بأن ما قاله كان غير لائق أو وقحاً، دون أن يدرك هو ذلك بنفسه.',
    textEn: 'Other people frequently tell her/him that what s/he has said was impolite, even though s/he thinks it is polite.',
    keying: 'AGREE',
    iepGoal: 'تعليم المهارات البراغماتية واللباقة الاجتماعية في الحوار والتواصل.',
  },
  {
    id: 8,
    domainId: 'imagination',
    textAr: 'عند قراءة قصة أو الاستماع إليها، يستطيع بسهولة تخيل مظهر وشخصيات القصة.',
    textEn: 'When reading/listening to a story, s/he can easily imagine what the characters might look like.',
    keying: 'DISAGREE',
    iepGoal: 'تطوير فهم مشاعر وأبعاد شخصيات القصص المصورة والمواقف التخيلية.',
  },
  {
    id: 9,
    domainId: 'attention_detail',
    textAr: 'ينجذب بشدة للتفاصيل والتواريخ والأرقام الخاصة بموضوعات معينة.',
    textEn: 'S/he is fascinated by dates or specific information/details.',
    keying: 'AGREE',
    iepGoal: 'توسيع مجالات الاهتمام وربط المعلومات المتخصصة بالسياق الاجتماعي اليومي.',
  },
  {
    id: 10,
    domainId: 'attention_switching',
    textAr: 'في المجموعات، يستطيع بسهولة متابعة أحاديث أكثر من شخص في نفس الوقت.',
    textEn: 'In a social group, s/he can easily keep track of several different people’s conversations.',
    keying: 'DISAGREE',
    iepGoal: 'تحسين الانتباه السمعي الانتقائي وتتبع الحوارات المتعددة في البيئات الجماعية.',
  },
  {
    id: 11,
    domainId: 'social',
    textAr: 'يجد المواقف الاجتماعية سهلة ومريحة بالنسبة له.',
    textEn: 'S/he finds social situations easy.',
    keying: 'DISAGREE',
    iepGoal: 'بناء الثقة والمهارات التكيفية للتعامل مع التجمعات والمناسبات الاجتماعية.',
  },
  {
    id: 12,
    domainId: 'attention_detail',
    textAr: 'يميل إلى ملاحظة التفاصيل التي يغفل عنها الآخرون تماماً.',
    textEn: 'S/he tends to notice details that others do not.',
    keying: 'AGREE',
    iepGoal: 'الموازنة بين التركيز على التفاصيل وفهم الصورة الكلية للمهام.',
  },
  {
    id: 13,
    domainId: 'social',
    textAr: 'يفضل الذهاب إلى المكتبة أو البقاء بالمنزل بدلاً من الذهاب إلى حفلة أو تجمع للأطفال.',
    textEn: 'S/he would rather go to a library than to a party.',
    keying: 'AGREE',
    iepGoal: 'تشجيع المشاركة التدريجية في المناسبات الترفيهية والتفاعلية للأطفال.',
  },
  {
    id: 14,
    domainId: 'imagination',
    textAr: 'يجد من السهل جداً تأليف القصص الخيالية وخلق ألعاب تمثيلية مبتكرة.',
    textEn: 'S/he finds making up stories easy.',
    keying: 'DISAGREE',
    iepGoal: 'تدريب الطفل على مهارات اللعب التمثيلي والرمزي المبتكر مع الأقران.',
  },
  {
    id: 15,
    domainId: 'social',
    textAr: 'ينجذب للأشخاص والناس أكثر من انجذابه للأشياء والجمادات.',
    textEn: 'S/he is drawn more strongly to people than to things.',
    keying: 'DISAGREE',
    iepGoal: 'تعزيز الدافعية الاجتماعية وتوجيه الاهتمام نحو التفاعل الإنساني المتبادل.',
  },
  {
    id: 16,
    domainId: 'attention_switching',
    textAr: 'يميل إلى الاهتمام بموضوعات محددة بشدة، وينزعج بشدة إذا لم يستطع متابعتها.',
    textEn: 'S/he tends to have very strong interests, which s/he gets upset about if s/he cannot pursue.',
    keying: 'AGREE',
    iepGoal: 'تطوير مهارات إدارة الغضب والتكيف الإيجابي عند مقاطعة الاهتمامات الخاصة.',
  },
  {
    id: 17,
    domainId: 'communication',
    textAr: 'يستمتع بالدردشة والتجاذب الاجتماعي البسيط غير الرسمي (Small Talk).',
    textEn: 'S/he enjoys social chit-chat.',
    keying: 'DISAGREE',
    iepGoal: 'التدريب على بدء وإنهاء الأحاديث الودية والدردشة الاجتماعية اليومية.',
  },
  {
    id: 18,
    domainId: 'communication',
    textAr: 'عندما يتحدث، ليس من السهل دائماً على الآخرين مقاطعته أو الدخول في الحديث معه.',
    textEn: 'When s/he talks, it isn’t always easy for others to get a word in edgeways.',
    keying: 'AGREE',
    iepGoal: 'التدريب على تبادل الأدوار في الحديث والتوقف لإعطاء الطرف الآخر فرصة للكلام.',
  },
  {
    id: 19,
    domainId: 'attention_detail',
    textAr: 'ينبهر جداً بالأرقام والتواريخ وقوائم البيانات وتصنيف الأشياء.',
    textEn: 'S/he is fascinated by numbers and lists.',
    keying: 'AGREE',
    iepGoal: 'توظيف حب الأرقام والتصنيف في تطوير مهارات التخطيط والتنظيم اليومي.',
  },
  {
    id: 20,
    domainId: 'imagination',
    textAr: 'عند قراءة قصة، يجد صعوبة في فهم واستنتاج نوايا ومشاعر الشخصيات.',
    textEn: 'When s/he is reading/listening to a story, s/he finds it difficult to work out the characters’ intentions.',
    keying: 'AGREE',
    iepGoal: 'تنمية نظرية العقل (Theory of Mind) واستنتاج مشاعر ودوافع الآخرين.',
  },
  {
    id: 21,
    domainId: 'imagination',
    textAr: 'لا يستمتع بقراءة القصص الخيالية أو مشاهدتها (يفضل الكتب الواقعية والمعلوماتية).',
    textEn: 'S/he doesn’t particularly enjoy reading/listening to fiction (prefers facts).',
    keying: 'AGREE',
    iepGoal: 'تنويع اهتمامات القراءة وإثراء تجربة التفاعل مع الروايات والمواقف الخيالية.',
  },
  {
    id: 22,
    domainId: 'social',
    textAr: 'يجد صعوبة في تكوين صداقات جديدة والحفاظ عليها.',
    textEn: 'S/he finds it hard to make new friends.',
    keying: 'AGREE',
    iepGoal: 'إكساب الطفل استراتيجيات بناء الصداقات، والمبادرة بالتعارف، والمحافظة على الأصدقاء.',
  },
  {
    id: 23,
    domainId: 'attention_detail',
    textAr: 'يلاحظ الأنماط والتكرارات والترتيب في الأشياء طوال الوقت وبشكل مستمر.',
    textEn: 'S/he notices patterns in things all the time.',
    keying: 'AGREE',
    iepGoal: 'مساعدة الطفل على تقبل التغييرات العشوائية غير النمطية في البيئة المحيطة.',
  },
  {
    id: 24,
    domainId: 'imagination',
    textAr: 'يفضل الذهاب إلى المسرح أو العروض الترفيهية على الذهاب للمتاحف والمعارض العلمية.',
    textEn: 'S/he would rather go to the theatre than to a museum.',
    keying: 'DISAGREE',
    iepGoal: 'تشجيع الاندماج في الأنشطة الفنية والمسرحية التعبيرية لتطوير المهارات الوجدانية.',
  },
  {
    id: 25,
    domainId: 'attention_switching',
    textAr: 'لا ينزعج إذا تغير روتينه اليومي المعتاد فجأة.',
    textEn: 'It does not upset her/him if her/his daily routine is disturbed.',
    keying: 'DISAGREE',
    iepGoal: 'استخدام الجداول البصرية لتهيئة الطفل للتحولات غير المتوقعة في الجدول اليومي.',
  },
  {
    id: 26,
    domainId: 'communication',
    textAr: 'كثيراً ما يجد نفسه لا يعرف كيف يستمر في محادثة مع الآخرين.',
    textEn: 'S/he frequently finds that s/he doesn’t know how to keep a conversation going.',
    keying: 'AGREE',
    iepGoal: 'تعليم استراتيجيات طرح الأسئلة المفتوحة والتعليق الإيجابي لمواصلة الحوار.',
  },
  {
    id: 27,
    domainId: 'communication',
    textAr: 'يجد من السهل "قراءة ما بين السطور" عندما يتحدث معه شخص ما.',
    textEn: 'S/he finds it easy to "read between the lines" when someone is talking to her/him.',
    keying: 'DISAGREE',
    iepGoal: 'تدريب الطفل على فهم التعبيرات المجازية والتلميحات غير المباشرة والسخرية اللطيفة.',
  },
  {
    id: 28,
    domainId: 'attention_detail',
    textAr: 'عادة ما يركز على الصورة العامة والشاملة أكثر من التفاصيل الدقيقة.',
    textEn: 'S/he usually concentrates more on the whole picture, rather than the small details.',
    keying: 'DISAGREE',
    iepGoal: 'تعزيز مهارات التركيز الكلي وتلخيص الأفكار الرئيسية في المواقف والواجبات.',
  },
  {
    id: 29,
    domainId: 'attention_detail',
    textAr: 'ليس بارعاً في تذكر أرقام الهواتف أو التواريخ بدقة استثنائية.',
    textEn: 'S/he is not very good at remembering phone numbers.',
    keying: 'DISAGREE',
    iepGoal: 'تدريب الذاكرة العاملة والمهارات الإجرائية في تذكر المعلومات الحيوية.',
  },
  {
    id: 30,
    domainId: 'attention_detail',
    textAr: 'عادة لا يلاحظ التغييرات الصغيرة في مظهر الأشخاص أو في ترتيب الغرفة.',
    textEn: 'S/he doesn’t usually notice small changes in a situation or a person’s appearance.',
    keying: 'DISAGREE',
    iepGoal: 'تنمية الانتباه البصري للتغيرات الإيجابية في البيئة ومظهر الزملاء.',
  },
  {
    id: 31,
    domainId: 'communication',
    textAr: 'يستطيع أن يدرك بسهولة ما إذا كان المستمع يشعر بالملل من حديثه.',
    textEn: 'S/he knows how to tell if someone listening to her/him is getting bored.',
    keying: 'DISAGREE',
    iepGoal: 'قراءة لغة الجسد وإشارات الملل والانتباه لدى المستمعين أثناء الحوار.',
  },
  {
    id: 32,
    domainId: 'attention_switching',
    textAr: 'يجد من السهل الانتقال والتبديل بين أكثر من عمل أو مهمة مختلفة في وقت واحد.',
    textEn: 'S/he finds it easy to do more than one thing at once.',
    keying: 'DISAGREE',
    iepGoal: 'تدريب مهارات المرونة المعرفية والانتقال المنظم بين نشاط وآخر.',
  },
  {
    id: 33,
    domainId: 'communication',
    textAr: 'عندما يتحدث عبر الهاتف، لا يكون متأكداً متى يحين دوره في الكلام.',
    textEn: 'When s/he talks on the phone, s/he is not sure when it is her/his turn to speak.',
    keying: 'AGREE',
    iepGoal: 'تدريب آداب الاتصال الهاتفي والتواصل الصوتي مع مراعاة فترات الصمت وتبادل الحديث.',
  },
  {
    id: 34,
    domainId: 'attention_switching',
    textAr: 'يستمتع بفعل الأشياء بشكل عفوي وتلقائي وتجربة أنشطة غير مخططة.',
    textEn: 'S/he enjoys doing things spontaneously.',
    keying: 'DISAGREE',
    iepGoal: 'زيادة التقبل والمشاركة الإيجابية في الفعاليات والأنشطة التلقائية.',
  },
  {
    id: 35,
    domainId: 'communication',
    textAr: 'غالباً ما يكون آخر شخص يفهم النكتة أو المغزى المضحك في الحديث.',
    textEn: 'S/he is often the last to understand the point of a joke.',
    keying: 'AGREE',
    iepGoal: 'شرح وتدريب الفكاهة والنكات والمواقف الكوميدية الاجتماعية بشكل مبسط.',
  },
  {
    id: 36,
    domainId: 'social',
    textAr: 'يجد من السهل جداً تخمين ما يفكر فيه أو يشعر به شخص ما بمجرد النظر إلى وجهه.',
    textEn: 'S/he finds it easy to work out what someone is thinking or feeling just by looking at their face.',
    keying: 'DISAGREE',
    iepGoal: 'تدريب التعرف على تعبيرات الوجه وقراءة المشاعر والانفعالات الأساسية.',
  },
  {
    id: 37,
    domainId: 'attention_switching',
    textAr: 'إذا تمت مقاطعته أثناء أداء عمل ما، يستطيع العودة إليه واستئنافه بسرعة وسلاسة.',
    textEn: 'If there is an interruption, s/he can switch back to what s/he was doing very quickly.',
    keying: 'DISAGREE',
    iepGoal: 'تدريب الطفل على مهارة استئناف المهمة بهدوء بعد انقطاع مفاجئ.',
  },
  {
    id: 38,
    domainId: 'communication',
    textAr: 'بارع في الدردشة والتواصل الاجتماعي مع الأقران والبالغين.',
    textEn: 'S/he is good at social chit-chat.',
    keying: 'DISAGREE',
    iepGoal: 'تعزيز الحصيلة اللغوية التداولية والممارسات الاجتماعية في المحادثة اليومية.',
  },
  {
    id: 39,
    domainId: 'communication',
    textAr: 'غالباً ما يخبره الناس بأنه يكرر نفس الحديث أو يطيل في موضوع واحد دون توقف.',
    textEn: 'People often tell her/him that s/he keeps on and on about the same thing.',
    keying: 'AGREE',
    iepGoal: 'توجيه الطفل للتنويع في موضوعات الحديث ومراعاة اهتمامات الطرف الآخر.',
  },
  {
    id: 40,
    domainId: 'imagination',
    textAr: 'عندما كان أصغر سناً (أو حالياً)، استمتع باللعب التخيلي والتمثيلي مع الأطفال الآخرين.',
    textEn: 'When younger, s/he used to enjoy playing games involving pretending with other children.',
    keying: 'DISAGREE',
    iepGoal: 'المشاركة في ألعاب تقمص الأدوار والدراما الإبداعية المشتركة مع الأقران.',
  },
  {
    id: 41,
    domainId: 'imagination',
    textAr: 'يستمتع بجمع معلومات مفصلة ومكثفة عن فئات معينة من الأشياء (مثل السيارات، الطيور، القطارات).',
    textEn: 'S/he likes to collect information about categories of things (e.g. cars, trains, plants).',
    keying: 'AGREE',
    iepGoal: 'استثمار الاهتمامات الخاصة والموسوعية في التعلم الأكاديمي ومهام البحث.',
  },
  {
    id: 42,
    domainId: 'imagination',
    textAr: 'يجد صعوبة في تخيل شعور أن يكون في مكان شخص آخر (التعاطف الوجداني).',
    textEn: 'S/he finds it difficult to imagine what it would be like to be someone else.',
    keying: 'AGREE',
    iepGoal: 'تنمية التعاطف الوجداني ومهارات تبني وجهة نظر الآخر (Perspective Taking).',
  },
  {
    id: 43,
    domainId: 'attention_switching',
    textAr: 'يحب التخطيط بعناية لأي نشاط يشارك فيه مسبقاً وبشكل دقيق.',
    textEn: 'S/he likes to plan any activities s/he participates in carefully.',
    keying: 'AGREE',
    iepGoal: 'تطوير المرونة والتسامح مع التعديلات الطفيفة في الخطط دون قلق.',
  },
  {
    id: 44,
    domainId: 'social',
    textAr: 'يستمتع بالمناسبات والتجمعات الاجتماعية ويتحمس للمشاركة فيها.',
    textEn: 'S/he enjoys social occasions.',
    keying: 'DISAGREE',
    iepGoal: 'توفير الدعم الاجتماعي والبيئي المناسب لمساعدة الطفل على الاستمتاع بالفعاليات الجماعية.',
  },
  {
    id: 45,
    domainId: 'social',
    textAr: 'يجد صعوبة في فهم مقاصد ونوايا الآخرين وتوقع ردود أفعالهم.',
    textEn: 'S/he finds it difficult to work out other people’s intentions.',
    keying: 'AGREE',
    iepGoal: 'استخدام القصص الاجتماعية (Social Stories) لتعليم تفسير نوايا ومقاصد الآخرين.',
  },
  {
    id: 46,
    domainId: 'attention_switching',
    textAr: 'المواقف الجديدة وغير المألوفة تجعله يشعر بالقلق والتوتر.',
    textEn: 'New situations make her/him anxious.',
    keying: 'AGREE',
    iepGoal: 'تدريب استراتيجيات الاسترخاء والتكيف مع البيئات والمواقف الجديدة.',
  },
  {
    id: 47,
    domainId: 'social',
    textAr: 'يستمتع بالتعرف على أشخاص وأصدقاء جدد ومقابلتهم.',
    textEn: 'S/he enjoys meeting new people.',
    keying: 'DISAGREE',
    iepGoal: 'تنمية مهارات المبادرة بالتحية والتعريف بالنفس للأصدقاء الجدد.',
  },
  {
    id: 48,
    domainId: 'social',
    textAr: 'بارع في الدبلوماسية واللباقة وعدم جرح مشاعر الآخرين.',
    textEn: 'S/he is a good diplomat.',
    keying: 'DISAGREE',
    iepGoal: 'تعليم مهارات مراعاة مشاعر الآخرين والتعبير عن الرأي بأسلوب مهذب.',
  },
  {
    id: 49,
    domainId: 'attention_detail',
    textAr: 'ليس بارعاً بشكل خاص في تذكر تواريخ ميلاد الأشخاص وأرقامهم بدقة.',
    textEn: 'S/he is not very good at remembering people’s date of birth.',
    keying: 'DISAGREE',
    iepGoal: 'توظيف الوسائل المساندة لتذكر المناسبات الاجتماعية والتواريخ المهمة.',
  },
  {
    id: 50,
    domainId: 'imagination',
    textAr: 'يجد من السهل جداً اللعب بألعاب التظاهر والتمثيل (Pretend Play) مع أقرانه.',
    textEn: 'S/he finds it very easy to play games with children that involve pretending.',
    keying: 'DISAGREE',
    iepGoal: 'توسيع مهارات اللعب المشترك والرمزي في سياقات تفاعلية طبيعية مع الأطفال.',
  },
];

export const AQ_CHILD_ITEMS = AQ_ITEMS;
export const AQ_ADOLESCENT_ITEMS = AQ_ITEMS;

/**
 * حساب درجات مقياس AQ والمؤشرات السيكومترية والفرز الإكلينيكي
 * @param {Object} responses - كائن يحتوي على الإجابات { [itemId]: 'def_agree' | 'slight_agree' | 'slight_disagree' | 'def_disagree' }
 * @param {string} version - 'child' (4-11y) أو 'adolescent' (12-16y)
 */
export function calculateAQPsychometrics(responses = {}, version = 'child') {
  let totalScore = 0;
  const answeredCount = Object.keys(responses).filter(k => responses[k]).length;
  
  const domainScores = {
    social: 0,
    attention_switching: 0,
    attention_detail: 0,
    communication: 0,
    imagination: 0,
  };

  const domainAnsweredCounts = {
    social: 0,
    attention_switching: 0,
    attention_detail: 0,
    communication: 0,
    imagination: 0,
  };

  const itemDetails = AQ_ITEMS.map(item => {
    const resp = responses[item.id];
    let score = 0;
    let isAutisticTrait = false;

    if (resp) {
      domainAnsweredCounts[item.domainId] = (domainAnsweredCounts[item.domainId] || 0) + 1;
      
      const isAgree = resp === 'def_agree' || resp === 'slight_agree';
      const isDisagree = resp === 'def_disagree' || resp === 'slight_disagree';

      if (item.keying === 'AGREE' && isAgree) {
        score = 1;
        isAutisticTrait = true;
      } else if (item.keying === 'DISAGREE' && isDisagree) {
        score = 1;
        isAutisticTrait = true;
      }
    }

    if (isAutisticTrait) {
      totalScore += 1;
      domainScores[item.domainId] = (domainScores[item.domainId] || 0) + 1;
    }

    return {
      ...item,
      response: resp || null,
      score,
      isAutisticTrait,
    };
  });

  // Cut-off scores and Clinical interpretation (Baron-Cohen et al.)
  // Cutoff = 30 points (indicates significant autistic traits)
  // Borderline / Moderate = 26-29 points
  // Low / Typical = 0-25 points
  const cutoffScore = 30;
  const borderlineScore = 26;

  let severityKey = 'typical';
  let severityLabel = 'ضمن النطاق النمائي الطبيعي (سمات توحد منخفضة)';
  let severityLabelEn = 'Typical / Low Autistic Traits';
  let severityColor = '#059669';
  let clinicalSummary = '';
  let riskLevel = 'منخفض';
  let isAboveCutoff = totalScore >= cutoffScore;

  if (totalScore >= cutoffScore) {
    severityKey = 'high';
    severityLabel = 'مؤشر مرتفع لسمات طيف التوحد (تجاوز عتبة القطع الإكلينيكية)';
    severityLabelEn = 'High Autistic Traits (Above Clinical Cut-off)';
    severityColor = '#dc2626';
    riskLevel = 'مرتفع جداً';
    clinicalSummary = `حصل المفحوص على درجة كلية (${totalScore} من 50) وهي أعلى من عتبة القطع الإكلينيكية المعتمدة (Cut-off ≥ 30) لمقياس AQ في دراسات جامعة كامبريدج. تشير هذه النتيجة إلى وجود سمات وسلوكيات واضحة وملموسة تقع ضمن طيف التوحد، وتستدعي إحالة المفحوص لإجراء تقييم تشخيصي شامل متعدد التخصصات وبناء خطة تدخل فردية متخصصة.`;
  } else if (totalScore >= borderlineScore) {
    severityKey = 'borderline';
    severityLabel = 'منطقة حدية / سمات طيف توحد متوسطة';
    severityLabelEn = 'Borderline / Moderate Autistic Traits';
    severityColor = '#d97706';
    riskLevel = 'متوسط';
    clinicalSummary = `حصل المفحوص على درجة كلية (${totalScore} من 50) وتقع في النطاق الحدي (26 إلى 29). تظهر النتيجة وجود بعض السمات والسلوكيات النمطية أو الاجتماعية الملحوظة التي قد تؤثر على التكيف اليومي، ويوصى بمتابعة الملاحظة السريرية وتوفير الدعم الموجه في مجالات القصور المحددة.`;
  } else {
    severityKey = 'typical';
    severityLabel = 'ضمن النطاق النمائي الطبيعي (أقل من عتبة القطع)';
    severityLabelEn = 'Below Cut-off (Typical / Low Traits)';
    severityColor = '#059669';
    riskLevel = 'منخفض / طبيعي';
    clinicalSummary = `حصل المفحوص على درجة كلية (${totalScore} من 50) وهي تقع دون عتبة القطع الإكلينيكية (أقل من 26). تشير هذه النتيجة إلى أن السمات والسلوكيات المفحوصة تقع ضمن المتوسط النمائي المعتاد ولا تدل على وجود مؤشرات دالة لاضطراب طيف التوحد في الوقت الراهن.`;
  }

  // Domain Breakdowns with descriptions
  const domainBreakdown = AQ_DOMAINS.map(d => {
    const raw = domainScores[d.id] || 0;
    const answered = domainAnsweredCounts[d.id] || 0;
    const pct = Math.round((raw / d.maxScore) * 100);
    
    let level = 'طبيعي';
    let levelColor = '#059669';
    if (raw >= 7) {
      level = 'سمات مرتفعة جداً (قصور ملحوظ)';
      levelColor = '#dc2626';
    } else if (raw >= 5) {
      level = 'سمات متوسطة / منطقة احتياج';
      levelColor = '#d97706';
    } else {
      level = 'أداء نمائي سليم';
      levelColor = '#059669';
    }

    return {
      ...d,
      rawScore: raw,
      maxScore: d.maxScore,
      answeredCount: answered,
      percentage: pct,
      level,
      levelColor,
    };
  });

  // Extract impaired items for IEP Bridge
  const flaggedItems = itemDetails.filter(it => it.isAutisticTrait);

  return {
    totalScore,
    maxScore: 50,
    answeredCount,
    totalItems: 50,
    isComplete: answeredCount === 50,
    cutoffScore,
    borderlineScore,
    isAboveCutoff,
    severityKey,
    severityLabel,
    severityLabelEn,
    severityColor,
    riskLevel,
    clinicalSummary,
    version,
    versionLabelAr: version === 'adolescent' ? 'نسخة اليافعين (12–16 سنة)' : 'نسخة الأطفال (4–11 سنة)',
    domainScores,
    domainBreakdown,
    flaggedItems,
    itemDetails,
  };
}
