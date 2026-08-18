/**
 * برنامج تيتش (TEACCH) والملف التربوي النفسي (PEP) - التجميع والمصفوفة
 * Treatment and Education of Autistic and Related Communication-Handicapped Children
 * تأليف: د. إريك شوبلر، مارغريت لانسينغ، ليزلي ووترز
 */

import { TEACCH_GOALS_PART1 } from './teacchGoalsPart1';
import { TEACCH_GOALS_PART2 } from './teacchGoalsPart2';

export const ALL_TEACCH_GOALS = [
  ...TEACCH_GOALS_PART1,
  ...TEACCH_GOALS_PART2,
];

export const TEACCH_DOMAINS = [
  { key: 'teacch_imitation', label: '1. التقليد والمحاكاة (Imitation)', count: 16, color: '#0284c7' },
  { key: 'teacch_perception', label: '2. الإدراك الحسي والبصري (Perception)', count: 10, color: '#0d9488' },
  { key: 'teacch_gross_motor', label: '3. الحركة العامة والتوازن (Gross Motor)', count: 10, color: '#16a34a' },
  { key: 'teacch_fine_motor', label: '4. الحركة الدقيقة والتناول (Fine Motor)', count: 10, color: '#ca8a04' },
  { key: 'teacch_eye_hand', label: '5. التنسيق بين العين واليد (Eye-Hand)', count: 10, color: '#9333ea' },
  { key: 'teacch_cognitive', label: '6. الأداء والإدراك المعرفي (Cognitive)', count: 10, color: '#4f46e5' },
  { key: 'teacch_language', label: '7. الكفاءة والمهارات اللغوية (Language)', count: 10, color: '#2563eb' },
  { key: 'teacch_selfhelp', label: '8. الاستقلالية والرعاية الذاتية (Self-Help)', count: 10, color: '#e11d48' },
  { key: 'teacch_social', label: '9. التآلف والتفاعل الاجتماعي (Social)', count: 10, color: '#ea580c' },
  { key: 'teacch_behavior', label: '10. إدارة وتعديل السلوك والتعليم المنظم (Behavior)', count: 8, color: '#475569' },
];

export const TEACCH_AGE_MATRIX = [
  { key: '0-1y', label: 'المستوى الأول (0 - 1 سنة)', range: '0-1', desc: 'الانتباه المشترك، الاستكشاف الحسي، بداية التقليد والمسك' },
  { key: '1-2y', label: 'المستوى الثاني (1 - 2 سنة)', range: '1-2', desc: 'التقليد الحركي البسيط، الاستجابة للأوامر، المشي والحواجز' },
  { key: '2-3y', label: 'المستوى الثالث (2 - 3 سنوات)', range: '2-3', desc: 'اللعب الرمزي، التراكيب الثنائية، الأكل بالملعقة والشوكة' },
  { key: '3-4y', label: 'المستوى الرابع (3 - 4 سنوات)', range: '3-4', desc: 'مطابقة وفرز الألوان والأشكال، التلوين داخل إطار، ضبط السلوك' },
  { key: '4-5y', label: 'المستوى الخامس (4 - 5 سنوات)', range: '4-5', desc: 'استخدام المقص، تسلسل الأحداث، الجداول البصرية الفردية' },
  { key: '5-6y', label: 'المستوى السادس (5 - 6 سنوات)', range: '5-6', desc: 'القراءة البصرية، نسخ الحروف، الاستقلالية التامة بنظام العمل' },
];

export const TEACCH_SCORING_KEYS = [
  { symbol: 'P', label: 'P: منجز بنجاح واستقلالية (Pass / Réussi)', color: '#16a34a' },
  { symbol: 'E', label: 'E: بزوغ / محاولة ناشئة بمساعدة (Emerging / Émergent)', color: '#ca8a04' },
  { symbol: 'F', label: 'F: إخفاق / غير منجز حالياً (Fail / Échec)', color: '#dc2626' },
  { symbol: 'ع', label: 'ع: استجابة عفوية تامة دون أي تلميح', color: '#2563eb' },
  { symbol: 'ف', label: 'ف: توجيه شفهي أو إشارة بصرية', color: '#d97706' },
  { symbol: 'م', label: 'م: مساعدة وتوجيه بدني يدوي', color: '#64748b' },
];

export const TEACCH_STRUCTURE_PILLARS = [
  {
    title: '1. التنظيم الفيزيائي للبيئة (Physical Structure)',
    desc: 'تحديد حدود بصرية ومكانية واضحة لكل ركن (ركن العمل الفردي، ركن اللعب، ركن المعززات، ركن الغداء) لتقليل التشتت البصري والسمعي.',
    icon: '🏢'
  },
  {
    title: '2. الجداول البصرية الفردية (Visual Schedules)',
    desc: 'إعلام الطفل بما سيحدث ومتى وبأي ترتيب (من الأعلى للأسفل أو من اليمين لليسار) لتحقيق التنبؤ بالأحداث وخفض القلق السلوكي.',
    icon: '🗓️'
  },
  {
    title: '3. نظام العمل المستقل (Work Systems)',
    desc: 'الإجابة بوضوح عن 4 أسئلة أساسية: ما العمل المطلوب؟ كم مقداره؟ متى أنتهي؟ وماذا أفعل بعد ذلك؟ من اليسار إلى اليمين.',
    icon: '📦'
  },
  {
    title: '4. الهيكلة والوضوح البصري للمهمة (Visual Structure)',
    desc: 'تصميم الأدوات والمهمات لتشرح نفسها بصرياً (صواني مقسمة، قوالب بصرية، بطاقات ألوان) لتقليل الاعتماد على الأوامر اللفظية.',
    icon: '🧩'
  }
];
