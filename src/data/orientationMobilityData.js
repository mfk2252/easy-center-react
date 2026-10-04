// مقياس التوجه والحركة والاستقلال المكاني لذوي الإعاقات الحسية (Orientation & Mobility Functional Assessment Scale - O&M)

export const ORIENTATION_MOBILITY_ITEMS = [
  { id: 'om1', text: 'يتعرف على أجزاء جسمه وعلاقاتها بالمكان (اليمين، اليسار، الأمام، الخلف).', domainId: 'body_spatial' },
  { id: 'om2', text: 'يميز المفاهيم الفضائية والبنيوية في البيئة (مثل: صاعد، هابط، زاوية، جدار).', domainId: 'body_spatial' },
  { id: 'om3', text: 'يستخدم حواسه المتبقية (السمع، اللمس، الشم) للتعرف على معالم الطريق.', domainId: 'sensory_cues' },
  { id: 'om4', text: 'يميز بين الملامس المختلفة للأرضيات (سجاد، بلاط، عشب، حاد).', domainId: 'sensory_cues' },
  { id: 'om5', text: 'يتنقل في خط مستقيم داخل الغرفة أو الممر المألوف بأمان.', domainId: 'indoor_navigation' },
  { id: 'om6', text: 'يتجنب الاصطدام بالعوائق والأثاث البارز أثناء المشي.', domainId: 'indoor_navigation' },
  { id: 'om7', text: 'يستكشف الأماكن والغرف الجديدة بأسلوب آمن ومنهجي.', domainId: 'indoor_navigation' },
  { id: 'om8', text: 'يصعد ويهبط السلالم والأدراج باستقلالية واستخدام الدرابزين.', domainId: 'indoor_navigation' },
  { id: 'om9', text: 'يستخدم تقنيات الحماية الذاتية للجسم العلوي والسفلي باليدين.', domainId: 'protective_tech' },
  { id: 'om10', text: 'يستخدم العصا البيضاء أو الوسائل المعينة الحركة بالطريقة الصحيحة.', domainId: 'cane_techniques' },
  { id: 'om11', text: 'يمشي برفقة المرشد المبصر ويتتبع حركته بأسلوب المقبض المعتمد.', domainId: 'guided_travel' },
  { id: 'om12', text: 'يتتبع الجدران أو الأسطح المستقيمة للوصول للهدف (Trailing).', domainId: 'indoor_navigation' },
  { id: 'om13', text: 'يتنقل بين الفصول والمرافق المختلفة داخل المركز بمسؤولية.', domainId: 'indoor_navigation' },
  { id: 'om14', text: 'يستجيب لإشارات وتنبيهات المرور والتعليمات الصوتية في الشارع.', domainId: 'outdoor_safety' },
  { id: 'om15', text: 'يظهر استقلالية وثقة بالنفس أثناء التوجه والتنقل المكاني.', domainId: 'independence' },
];

export function calculateOrientationMobilityScore(answers = {}) {
  let totalRawScore = 0;
  let answeredCount = 0;

  ORIENTATION_MOBILITY_ITEMS.forEach(item => {
    const val = Number(answers[item.id]);
    if (!isNaN(val) && answers[item.id] !== undefined && answers[item.id] !== null) {
      totalRawScore += val;
      answeredCount++;
    }
  });

  const maxPossible = ORIENTATION_MOBILITY_ITEMS.length * 3; // 15 * 3 = 45
  const percentage = maxPossible > 0 ? Math.round((totalRawScore / maxPossible) * 100) : 0;

  let level = 'استقلالية جيدة جداً في التوجه والحركة المكانية';
  let severityColor = '#16a34a';

  if (percentage < 45) {
    level = 'احتياج شديد لتدريب مكثف على مهارات التوجه والحركة والحماية';
    severityColor = '#dc2626';
  } else if (percentage < 65) {
    level = 'قدرات توجه وحركة متوسطة تحتاج مساعدة وتأهيلاً مكانياً';
    severityColor = '#d97706';
  }

  return {
    totalRawScore,
    maxPossible,
    answeredCount,
    percentage,
    level,
    severityColor,
    interpretation: `نتيجة مقياس التوجه والحركة: ${totalRawScore} من 45 (${percentage}%). مستوى الاستقلال المكاني: ${level}.`,
  };
}
