/**
 * مقياس صعوبات التعلم (إعداد وتقنين الدكتور زيدان السرطاوي)
 * Learning Disabilities Scale - Dr. Zaydan Al-Sartawi
 * 
 * المقياس المعتمد لدى وزارة التعليم لتشخيص وفرز صعوبات التعلم (50 عبارة عبر 3 أبعاد رئيسية):
 * 1. البعد الأول: الصعوبات الأكاديمية (25 عبارة) - الدرجة القصوى 125
 * 2. البعد الثاني: الخصائص السلوكية (12 عبارة) - الدرجة القصوى 60
 * 3. البعد الثالث: الصعوبات الإدراكية الحركية (13 عبارة) - الدرجة القصوى 65
 * 
 * المجموع الكلي للبنود: 50 عبارة | الدرجة الكلية العظمى: 250
 * 
 * سلم التقدير الخماسي:
 * - ينطبق بدرجة عالية جداً (5 درجات)
 * - ينطبق بدرجة عالية (4 درجات)
 * - ينطبق بدرجة متوسطة (3 درجات)
 * - ينطبق بدرجة منخفضة (درجتان)
 * - ينطبق بدرجة منخفضة جداً (درجة واحدة)
 * 
 * جدول الدرجات التائية المعيارية T-Score والتصنيف التشخيصي (ملحق رقم 2 ورقم 3):
 * - T-Score >= 60 (أو الدرجة الكلية >= 150): صعوبة تعلم محتملة / مؤكدة إكلينيكياً
 * - T-Score 50 - 59: فئة حدية (Borderline / At-Risk)
 * - T-Score < 50 (أو الدرجة الكلية < 122): عدم وجود صعوبة تعلم (عادي)
 */

export const SARTAWI_COPYRIGHT_INFO = {
  scaleNameAr: 'مقياس صعوبات التعلم (السرطاوي)',
  scaleNameEn: 'Learning Disabilities Scale (Dr. Zaydan Al-Sartawi)',
  scaleShortName: 'مقياس السرطاوي لصعوبات التعلم',
  authorAr: 'أ.د. زيدان أحمد السرطاوي',
  authorTitle: 'أستاذ التربية الخاصة وصعوبات التعلم - جامعة الملك سعود',
  ministry: 'وزارة التعليم - الإدارة العامة للتربية الخاصة',
  dimensionsCount: 3,
  itemsCount: 50,
  maxRawScore: 250,
  targetGroup: 'طلاب وطالبات المرحلة الابتدائية والتعليم العام المشتبه بإصابتهم بصعوبات التعلم',
  notice: 'مقياس رسمي مقنن لفرز وتشخيص صعوبات التعلم الأكاديمية والسلوكية والإدراكية الحركية في المدارس وغرف المصادر ومراكز التربية الخاصة.',
};

export const SARTAWI_RATING_OPTIONS = [
  { value: 5, label: 'ينطبق بدرجة عالية جداً', score: 5, color: '#dc2626', badgeClass: 'b-rd', desc: 'يظهر السلوك أو الصعوبة بصفة شبه دائمة وبشدة مرتفعة جداً' },
  { value: 4, label: 'ينطبق بدرجة عالية', score: 4, color: '#ea580c', badgeClass: 'b-or', desc: 'يظهر السلوك أو الصعوبة بتكرار كبير وفي أغلب الأوقات' },
  { value: 3, label: 'ينطبق بدرجة متوسطة', score: 3, color: '#d97706', badgeClass: 'b-yl', desc: 'يظهر السلوك أحياناً وبدرجة معتدلة' },
  { value: 2, label: 'ينطبق بدرجة منخفضة', score: 2, color: '#0284c7', badgeClass: 'b-bl', desc: 'يظهر السلوك نادراً وبشدة طفيفة' },
  { value: 1, label: 'ينطبق بدرجة منخفضة جداً', score: 1, color: '#059669', badgeClass: 'b-gr', desc: 'لا يظهر السلوك إلا نادراً جداً أو يكاد ينعدم' },
];

export const SARTAWI_DIMENSIONS = [
  {
    id: 'academic',
    num: 1,
    name: 'البعد الأول: الصعوبات الأكاديمية',
    nameEn: 'Academic Difficulties',
    itemsCount: 25,
    minRawScore: 25,
    maxRawScore: 125,
    color: '#dc2626',
    bgLight: '#fef2f2',
    icon: '📚',
    description: 'يقيس صعوبات القراءة، الكتابة، العمليات الحسابية، تتبع التعليمات، المفردات اللغوية، الفهم، والتعبير اللفظي والتنظيم الدراسي.',
    cutoffNormal: 50,
    cutoffBorderline: 68,
    cutoffLD: 86,
  },
  {
    id: 'behavioral',
    num: 2,
    name: 'البعد الثاني: الخصائص السلوكية',
    nameEn: 'Behavioral Characteristics',
    itemsCount: 12,
    minRawScore: 12,
    maxRawScore: 60,
    color: '#d97706',
    bgLight: '#fffbeb',
    icon: '⚡',
    description: 'يقيس تشتت الانتباه، الاندفاعية، فرط الحركة، العناد، تقلب المزاج، سرعة الغضب والاستثارة السلوكية في الفصل والبيئة المدرسية.',
    cutoffNormal: 22,
    cutoffBorderline: 28,
    cutoffLD: 36,
  },
  {
    id: 'perceptual_motor',
    num: 3,
    name: 'البعد الثالث: الصعوبات الإدراكية الحركية',
    nameEn: 'Perceptual-Motor Difficulties',
    itemsCount: 13,
    minRawScore: 13,
    maxRawScore: 65,
    color: '#2563eb',
    bgLight: '#eff6ff',
    icon: '🧠',
    description: 'يقيس الذاكرة السمعية والبصرية، التناسق والتوازن الحركي، استخدام اليدين، تمييز الاتجاهات والأحجام والأشكال الهندسية.',
    cutoffNormal: 21,
    cutoffBorderline: 27,
    cutoffLD: 36,
  },
];

export const SARTAWI_ITEMS = [
  // البعد الأول: الصعوبات الأكاديمية (العبارات 1 - 25)
  { id: 'sar_1', dimensionId: 'academic', num: 1, text: 'تنقصه القدرة على الاستمرار في العمل.' },
  { id: 'sar_2', dimensionId: 'academic', num: 2, text: 'يحتاج إلى المراقبة بشكل مستمر من قبل الآخرين.' },
  { id: 'sar_3', dimensionId: 'academic', num: 3, text: 'غير قادر على التركيز.' },
  { id: 'sar_4', dimensionId: 'academic', num: 4, text: 'يجد صعوبة في تنفيذ التعليمات.' },
  { id: 'sar_5', dimensionId: 'academic', num: 5, text: 'يجد صعوبة في القراءة بشكل عام.' },
  { id: 'sar_6', dimensionId: 'academic', num: 6, text: 'يجد صعوبة في إجراء العمليات الحسابية.' },
  { id: 'sar_7', dimensionId: 'academic', num: 7, text: 'يجد صعوبة في كتابة الكلمات بشكل صحيح.' },
  { id: 'sar_8', dimensionId: 'academic', num: 8, text: 'خطه غير مقروء.' },
  { id: 'sar_9', dimensionId: 'academic', num: 9, text: 'التذبذب في أدائه من يوم لآخر أو ساعة لأخرى.' },
  { id: 'sar_10', dimensionId: 'academic', num: 10, text: 'بطيء في إنجاز العمل.' },
  { id: 'sar_11', dimensionId: 'academic', num: 11, text: 'غير قادر على اتباع التعليمات المعطاة له.' },
  { id: 'sar_12', dimensionId: 'academic', num: 12, text: 'مفرداته اللغوية محدودة جداً.' },
  { id: 'sar_13', dimensionId: 'academic', num: 13, text: 'قدرته على الفهم متدنية جداً.' },
  { id: 'sar_14', dimensionId: 'academic', num: 14, text: 'غير قادر على سرد قصة بشكل مفهوم، لديه صعوبة في ترتيب أفكاره بتسلسل منطقي.' },
  { id: 'sar_15', dimensionId: 'academic', num: 15, text: 'يجد صعوبة في التعبير المناسب عن نفسه بطريقة لفظية.' },
  { id: 'sar_16', dimensionId: 'academic', num: 16, text: 'قدرته على تنظيم العمل منخفضة.' },
  { id: 'sar_17', dimensionId: 'academic', num: 17, text: 'غير قادر على متابعة النقاش الصفي.' },
  { id: 'sar_18', dimensionId: 'academic', num: 18, text: 'لا ينقل ما يراه بصورة صحيحة سواء من الكتاب أو السبورة.' },
  { id: 'sar_19', dimensionId: 'academic', num: 19, text: 'تقتصر إجابته على السؤال بكلمة واحدة ولا يقدر على الإجابة بجملة كاملة.' },
  { id: 'sar_20', dimensionId: 'academic', num: 20, text: 'يجد صعوبة في تطبيق ما تعلمه.' },
  { id: 'sar_21', dimensionId: 'academic', num: 21, text: 'يحتاج إلى وقت طويل لتنظيم أفكاره قبل أن يستجيب.' },
  { id: 'sar_22', dimensionId: 'academic', num: 22, text: 'يعكس الحروف والأرقام عند القراءة وعند الكتابة.' },
  { id: 'sar_23', dimensionId: 'academic', num: 23, text: 'يستخدم جملاً ناقصة ومليئة بالأخطاء القواعدية.' },
  { id: 'sar_24', dimensionId: 'academic', num: 24, text: 'يتأخر باستمرار في تسليم واجباته المدرسية.' },
  { id: 'sar_25', dimensionId: 'academic', num: 25, text: 'يحتاج لوقت أطول لتعلم المهمات الجديدة مقارنة بزملائه.' },

  // البعد الثاني: الخصائص السلوكية (العبارات 26 - 37)
  { id: 'sar_26', dimensionId: 'behavioral', num: 26, text: 'يتشتت انتباهه بسهولة.' },
  { id: 'sar_27', dimensionId: 'behavioral', num: 27, text: 'اندفاعي.' },
  { id: 'sar_28', dimensionId: 'behavioral', num: 28, text: 'متهور إلى درجة الحماقة.' },
  { id: 'sar_29', dimensionId: 'behavioral', num: 29, text: 'يصعب التنبؤ بسلوكه.' },
  { id: 'sar_30', dimensionId: 'behavioral', num: 30, text: 'لا يستطيع التحكم في نفسه (يتكلم دون إذن، يقفز من مقعده.. إلخ).' },
  { id: 'sar_31', dimensionId: 'behavioral', num: 31, text: 'عنيد.' },
  { id: 'sar_32', dimensionId: 'behavioral', num: 32, text: 'غير مهذب مع الآخرين دوماً.' },
  { id: 'sar_33', dimensionId: 'behavioral', num: 33, text: 'كثير الحركة بحيث لا يقدر على الاستقرار.' },
  { id: 'sar_34', dimensionId: 'behavioral', num: 34, text: 'يستثار بسهولة كبيرة من قبل الأطفال الآخرين.' },
  { id: 'sar_35', dimensionId: 'behavioral', num: 35, text: 'سلوكه في كثير من الأحيان لا يتناسب مع الموقف.' },
  { id: 'sar_36', dimensionId: 'behavioral', num: 36, text: 'سريع الغضب والانفعال.' },
  { id: 'sar_37', dimensionId: 'behavioral', num: 37, text: 'متقلب المزاج.' },

  // البعد الثالث: الصعوبات الإدراكية الحركية (العبارات 38 - 50)
  { id: 'sar_38', dimensionId: 'perceptual_motor', num: 38, text: 'غير قادر على تذكر الكلمة المطبوعة.' },
  { id: 'sar_39', dimensionId: 'perceptual_motor', num: 39, text: 'يصعب عليه التعرف على الحروف والأعداد.' },
  { id: 'sar_40', dimensionId: 'perceptual_motor', num: 40, text: 'تنقصه القدرة على تمييز الأحجام.' },
  { id: 'sar_41', dimensionId: 'perceptual_motor', num: 41, text: 'تنقصه القدرة على تمييز الاتجاهات (يمين، يسار، فوق، تحت).' },
  { id: 'sar_42', dimensionId: 'perceptual_motor', num: 42, text: 'قدرته على التوازن ضعيفة جداً.' },
  { id: 'sar_43', dimensionId: 'perceptual_motor', num: 43, text: 'لديه ضعف في الذاكرة السمعية.' },
  { id: 'sar_44', dimensionId: 'perceptual_motor', num: 44, text: 'يجد صعوبة في تمييز المثيرات السمعية.' },
  { id: 'sar_45', dimensionId: 'perceptual_motor', num: 45, text: 'تناسقه الحركي بشكل عام ضعيف جداً.' },
  { id: 'sar_46', dimensionId: 'perceptual_motor', num: 46, text: 'لديه ضعف في الذاكرة البصرية.' },
  { id: 'sar_47', dimensionId: 'perceptual_motor', num: 47, text: 'قدرته على استخدام يديه ضعيفة جداً.' },
  { id: 'sar_48', dimensionId: 'perceptual_motor', num: 48, text: 'تعوزه البراعة في أداء المهارات الحركية بشكل عام.' },
  { id: 'sar_49', dimensionId: 'perceptual_motor', num: 49, text: 'قادر على الاستماع ولكنه لا يفهم ما يسمعه.' },
  { id: 'sar_50', dimensionId: 'perceptual_motor', num: 50, text: 'لديه قصور في استرجاع الأشكال الهندسية البسيطة.' },
];

/**
 * جدول تحويل الدرجات الخام إلى درجات تائية معيارية (T-Score)
 * مستخرج من ملحق رقم (2) في دليل المقياس
 */
export const SARTAWI_T_SCORE_TABLE = [
  { t: 35, d1_min: 25, d1_max: 26, d2: 12, d3_min: 13, d3_max: 13, total_min: 50, total_max: 52 },
  { t: 36, d1_min: 27, d1_max: 28, d2: 13, d3_min: 13, d3_max: 13, total_min: 53, total_max: 57 },
  { t: 37, d1_min: 29, d1_max: 31, d2: 14, d3_min: 13, d3_max: 13, total_min: 58, total_max: 62 },
  { t: 38, d1_min: 32, d1_max: 34, d2: 15, d3_min: 13, d3_max: 13, total_min: 63, total_max: 67 },
  { t: 39, d1_min: 35, d1_max: 37, d2: 16, d3_min: 14, d3_max: 14, total_min: 68, total_max: 72 },
  { t: 40, d1_min: 38, d1_max: 40, d2: 17, d3_min: 15, d3_max: 15, total_min: 73, total_max: 77 },
  { t: 41, d1_min: 41, d1_max: 43, d2: 18, d3_min: 16, d3_max: 16, total_min: 78, total_max: 82 },
  { t: 42, d1_min: 44, d1_max: 46, d2: 19, d3_min: 17, d3_max: 17, total_min: 83, total_max: 87 },
  { t: 43, d1_min: 47, d1_max: 49, d2: 20, d3_min: 18, d3_max: 18, total_min: 88, total_max: 91 },
  { t: 44, d1_min: 50, d1_max: 52, d2: 21, d3_min: 19, d3_max: 20, total_min: 92, total_max: 96 },
  { t: 45, d1_min: 53, d1_max: 55, d2: 22, d3_min: 21, d3_max: 21, total_min: 97, total_max: 101 },
  { t: 46, d1_min: 56, d1_max: 58, d2: 23, d3_min: 22, d3_max: 22, total_min: 102, total_max: 106 },
  { t: 47, d1_min: 59, d1_max: 61, d2: 24, d3_min: 23, d3_max: 23, total_min: 107, total_max: 111 },
  { t: 48, d1_min: 62, d1_max: 64, d2: 26, d3_min: 24, d3_max: 24, total_min: 112, total_max: 116 },
  { t: 49, d1_min: 65, d1_max: 67, d2: 27, d3_min: 25, d3_max: 26, total_min: 117, total_max: 121 },
  { t: 50, d1_min: 68, d1_max: 70, d2: 28, d3_min: 27, d3_max: 27, total_min: 122, total_max: 125 },
  { t: 51, d1_min: 71, d1_max: 73, d2: 29, d3_min: 28, d3_max: 28, total_min: 126, total_max: 130 },
  { t: 52, d1_min: 74, d1_max: 76, d2: 30, d3_min: 29, d3_max: 29, total_min: 131, total_max: 135 },
  { t: 53, d1_min: 77, d1_max: 79, d2: 31, d3_min: 30, d3_max: 30, total_min: 136, total_max: 140 },
  { t: 54, d1_min: 80, d1_max: 83, d2: 32, d3_min: 31, d3_max: 32, total_min: 141, total_max: 145 },
  { t: 55, d1_min: 84, d1_max: 86, d2: 33, d3_min: 33, d3_max: 33, total_min: 146, total_max: 150 },
  { t: 56, d1_min: 87, d1_max: 89, d2: 34, d3_min: 34, d3_max: 34, total_min: 151, total_max: 155 },
  { t: 57, d1_min: 90, d1_max: 93, d2: 35, d3_min: 35, d3_max: 35, total_min: 156, total_max: 160 },
  { t: 58, d1_min: 93, d1_max: 95, d2: 36, d3_min: 36, d3_max: 36, total_min: 161, total_max: 165 },
  { t: 59, d1_min: 96, d1_max: 98, d2: 37, d3_min: 37, d3_max: 37, total_min: 166, total_max: 169 },
  { t: 60, d1_min: 99, d1_max: 101, d2: 38, d3_min: 38, d3_max: 39, total_min: 170, total_max: 174 },
  { t: 61, d1_min: 102, d1_max: 104, d2: 39, d3_min: 40, d3_max: 40, total_min: 175, total_max: 179 },
  { t: 62, d1_min: 105, d1_max: 107, d2: 41, d3_min: 41, d3_max: 41, total_min: 180, total_max: 184 },
  { t: 63, d1_min: 108, d1_max: 110, d2: 42, d3_min: 42, d3_max: 43, total_min: 185, total_max: 189 },
  { t: 64, d1_min: 111, d1_max: 113, d2: 43, d3_min: 44, d3_max: 44, total_min: 190, total_max: 194 },
  { t: 65, d1_min: 114, d1_max: 116, d2: 44, d3_min: 45, d3_max: 45, total_min: 195, total_max: 199 },
  { t: 66, d1_min: 117, d1_max: 119, d2: 45, d3_min: 46, d3_max: 46, total_min: 200, total_max: 203 },
  { t: 67, d1_min: 120, d1_max: 122, d2: 46, d3_min: 47, d3_max: 47, total_min: 204, total_max: 209 },
  { t: 68, d1_min: 123, d1_max: 125, d2: 47, d3_min: 48, d3_max: 48, total_min: 210, total_max: 213 },
  { t: 69, d1_min: 125, d1_max: 125, d2: 48, d3_min: 49, d3_max: 49, total_min: 214, total_max: 219 },
  { t: 70, d1_min: 125, d1_max: 125, d2: 49, d3_min: 50, d3_max: 51, total_min: 220, total_max: 224 },
  { t: 71, d1_min: 125, d1_max: 125, d2: 50, d3_min: 52, d3_max: 52, total_min: 225, total_max: 229 },
  { t: 72, d1_min: 125, d1_max: 125, d2: 51, d3_min: 53, d3_max: 53, total_min: 230, total_max: 234 },
  { t: 73, d1_min: 125, d1_max: 125, d2: 52, d3_min: 54, d3_max: 54, total_min: 235, total_max: 239 },
  { t: 74, d1_min: 125, d1_max: 125, d2: 53, d3_min: 55, d3_max: 55, total_min: 240, total_max: 244 },
  { t: 75, d1_min: 125, d1_max: 125, d2: 54, d3_min: 56, d3_max: 56, total_min: 245, total_max: 250 },
];

/**
 * حساب الدرجة التائية المعيارية للدرجة الكلية أو الأبعاد
 */
export function lookupSartawiTScore(totalRaw) {
  if (totalRaw <= 52) return 35;
  if (totalRaw >= 245) return 75;

  const match = SARTAWI_T_SCORE_TABLE.find(
    row => totalRaw >= row.total_min && totalRaw <= row.total_max
  );

  if (match) return match.t;

  // Fallback linear interpolation
  const tScore = Math.round(35 + ((totalRaw - 50) / 200) * 40);
  return Math.min(80, Math.max(35, tScore));
}

/**
 * حساب المعاملات السيكومترية والتشخيص لمقياس السرطاوي
 */
export function calculateSartawiPsychometrics(scores = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  const dimensionsResults = SARTAWI_DIMENSIONS.map(dim => {
    const dimItems = SARTAWI_ITEMS.filter(it => it.dimensionId === dim.id);
    let rawScore = 0;
    let dimAnswered = 0;

    dimItems.forEach(item => {
      const val = scores[item.id];
      if (val !== undefined && val !== null && val !== '') {
        const numVal = Number(val);
        rawScore += numVal;
        dimAnswered++;
      } else {
        // إذا لم يجب نضع الحد الأدنى 1
        rawScore += 1;
      }
    });

    totalRawScore += rawScore;
    answeredCount += dimAnswered;

    const percentage = Math.round((rawScore / dim.maxRawScore) * 100);

    // تصنيف بعد السرطاوي
    let severity = 'عدم وجود صعوبة (طبيعي)';
    let severityKey = 'normal';
    let severityColor = '#059669';
    let isDeficit = false;

    if (rawScore >= dim.cutoffLD) {
      severity = 'صعوبة محتملة / مؤكدة';
      severityKey = 'severe';
      severityColor = '#dc2626';
      isDeficit = true;
    } else if (rawScore >= dim.cutoffBorderline) {
      severity = 'فئة حدية (عرضة للصعوبة)';
      severityKey = 'borderline';
      severityColor = '#d97706';
      isDeficit = true;
    }

    const tScore = lookupSartawiTScore(Math.round((rawScore / dim.maxRawScore) * 250));
    const percentile = Math.min(99, Math.max(1, Math.round(50 + (tScore - 50) * 1.6)));

    return {
      ...dim,
      rawScore,
      maxRaw: dim.maxRawScore,
      tScore,
      percentile,
      answeredCount: dimAnswered,
      totalItems: dimItems.length,
      percentage,
      severity,
      severityKey,
      severityColor,
      isDeficit,
      levelLabel: severity,
    };
  });

  const totalTScore = lookupSartawiTScore(totalRawScore);
  const totalPercentage = Math.round((totalRawScore / 250) * 100);
  const percentile = Math.min(99, Math.max(1, Math.round(50 + (totalTScore - 50) * 1.6)));
  const completionPercentage = Math.round((answeredCount / 50) * 100);

  // التصنيف التشخيصي العام وفق معايير السرطاوي الرسمية (ملحق 3):
  // الدرجة التائية >= 60 أو الدرجة الكلية >= 150 -> صعوبة تعلم محتملة
  // الدرجة التائية 50-59 أو الدرجة الكلية 122-149 -> فئة حدية
  // الدرجة التائية < 50 أو الدرجة الكلية < 122 -> عدم وجود صعوبة
  let overallStatus = 'عدم وجود صعوبة تعلم (أداء عادي)';
  let overallKey = 'normal';
  let overallColor = '#059669';
  let conclusionText = 'تقع درجات الطالب الكلية والتائية ضمن النطاق الطبيعي (أقل من 50 درجة تائية و أقل من 122 درجة خام)، مما يشير إلى عدم وجود مؤشرات لصعوبات التعلم.';

  if (totalTScore >= 60 || totalRawScore >= 150) {
    overallStatus = 'صعوبة تعلم محتملة / مؤكدة إكلينيكياً';
    overallKey = 'severe';
    overallColor = '#dc2626';
    conclusionText = `تقع الدرجة التائية للطالب (${totalTScore}) ضمن النطاق الدال على وجود صعوبات تعلم محتملة (T >= 60 والدرجة الخام ${totalRawScore} >= 150). يوصى بإدراجه في برنامج صعوبات التعلم وإعداد خطة تربوية فردية (IEP).`;
  } else if (totalTScore >= 50 || totalRawScore >= 122) {
    overallStatus = 'فئة حدية (معرض لخطر صعوبات التعلم)';
    overallKey = 'borderline';
    overallColor = '#d97706';
    conclusionText = `تقع درجات الطالب في المنطقة الحدية (الدرجة التائية ${totalTScore} والدرجة الخام ${totalRawScore})، مما يتطلب متابعة دقيقة وتدخلاً وقائياً داخل الصف العادي.`;
  }

  const deficitDimensions = dimensionsResults.filter(d => d.isDeficit);

  return {
    totalRawScore,
    totalTScore,
    percentile,
    totalPercentage,
    completionPercentage,
    maxRawScore: 250,
    answeredCount,
    totalAnswered: answeredCount,
    totalItems: 50,
    dimensionsResults,
    dimensions: dimensionsResults,
    deficitDimensions,
    overallStatus,
    overallKey,
    overallColor,
    conclusionText,
    overallDescription: conclusionText,
    diagnosisDescription: conclusionText,
    recommendationSummary: conclusionText,
  };
}
