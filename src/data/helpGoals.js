/**
 * Hawaii Early Learning Profile (HELP) Master Repository
 * مقياس هاواي للتعليم المبكر — بنك الأهداف الشامل (0 - 6 سنوات)
 * مصفوفة معيارية للمجالات والأعمار ومفاتيح التقييم الخماسية
 */

import { HELP_GOALS_EARLY } from './helpGoalsEarly';
import { HELP_GOALS_PRESCHOOL } from './helpGoalsPreschool';

export const ALL_HELP_GOALS = [
  ...HELP_GOALS_EARLY,
  ...HELP_GOALS_PRESCHOOL,
];

// Domains definition specifically categorized for HELP
export const HELP_DOMAINS = [
  { key: 'help_sensory', label: '1. التنظيم الحسي والتناسقي (Sensory)', icon: '✨' },
  { key: 'help_cognitive', label: '2. المجال العقلي والمعرفي (Cognitive / Academic)', icon: '🧠' },
  { key: 'help_language', label: '3. اللغة والتواصل الاستقبالي والتعبيري (Language)', icon: '🗣️' },
  { key: 'help_gross_motor', label: '4. الحركي الكبير والتوازن (Gross Motor)', icon: '🏃' },
  { key: 'help_fine_motor', label: '5. الحركي الدقيق ومبادئ الكتابة (Fine Motor)', icon: '✍️' },
  { key: 'help_social', label: '6. المجال الاجتماعي والوجداني (Social-Emotional)', icon: '🤝' },
  { key: 'help_selfhelp', label: '7. مساعدة الذات والرعاية اليومية (Self-Help)', icon: '👕' },
  { key: 'help_communication', label: '8. التواصل الشامل وآداب الحوار (Communication)', icon: '💬' },
];

// Age Matrix Definition for HELP
export const HELP_AGE_MATRIX = [
  { key: '0-6m', label: '0 - 6 أشهر (الرضيع المبكر)', minMonths: 0, maxMonths: 6 },
  { key: '6-12m', label: '6 - 12 شهراً (الرضيع المتدرج)', minMonths: 6, maxMonths: 12 },
  { key: '1-2y', label: '1 - 2 سنة (الدارج)', minMonths: 12, maxMonths: 24 },
  { key: '2-3y', label: '2 - 3 سنوات (ما قبل الروضة)', minMonths: 24, maxMonths: 36 },
  { key: '3-4y', label: '3 - 4 سنوات (الروضة الأولى)', minMonths: 36, maxMonths: 48 },
  { key: '4-5y', label: '4 - 5 سنوات (الروضة الثانية)', minMonths: 48, maxMonths: 60 },
  { key: '5-6y', label: '5 - 6 سنوات (التمهيدي والإعداد للمدرسة)', minMonths: 60, maxMonths: 72 },
];

export const HELP_SCORING_KEYS = [
  { symbol: '0', label: 'غير مناسب للطفل (Not Appropriate)', color: '#94a3b8' },
  { symbol: '×', label: 'غير موجود حالياً (Not Present)', color: '#ef4444' },
  { symbol: '(1)', label: 'موجود كمحاولات مبدئية (Emerging)', color: '#f59e0b' },
  { symbol: '(2)', label: 'موجود بمستوى جزئي / بمساعدة (Partial Mastery)', color: '#3b82f6' },
  { symbol: '(3)', label: 'موجود بنجاح واستقلالية تامة (Mastered)', color: '#10b981' },
];
