/**
 * Master Index for LOVAAS (Applied Behavior Analysis) Goals
 * Contains all 10 official clinical domains with rigorous linguistic correction
 */
import { LOVAAS_SECTION_ATTENTION, LOVAAS_SECTION_IMITATION, LOVAAS_SECTION_RECEPTIVE } from './lovaasGoalsEarly';
import {
  LOVAAS_SECTION_EXPRESSIVE,
  LOVAAS_SECTION_ABSTRACT,
  LOVAAS_SECTION_SOCIAL,
  LOVAAS_SECTION_PREACADEMIC,
  LOVAAS_SECTION_ACADEMIC,
  LOVAAS_SECTION_SCHOOL_READINESS,
  LOVAAS_SECTION_SELF_CARE
} from './lovaasGoalsAdvanced';

export {
  LOVAAS_SECTION_ATTENTION,
  LOVAAS_SECTION_IMITATION,
  LOVAAS_SECTION_RECEPTIVE,
  LOVAAS_SECTION_EXPRESSIVE,
  LOVAAS_SECTION_ABSTRACT,
  LOVAAS_SECTION_SOCIAL,
  LOVAAS_SECTION_PREACADEMIC,
  LOVAAS_SECTION_ACADEMIC,
  LOVAAS_SECTION_SCHOOL_READINESS,
  LOVAAS_SECTION_SELF_CARE
};

export const ALL_LOVAAS_GOALS = [
  ...LOVAAS_SECTION_ATTENTION,
  ...LOVAAS_SECTION_IMITATION,
  ...LOVAAS_SECTION_RECEPTIVE,
  ...LOVAAS_SECTION_EXPRESSIVE,
  ...LOVAAS_SECTION_ABSTRACT,
  ...LOVAAS_SECTION_SOCIAL,
  ...LOVAAS_SECTION_PREACADEMIC,
  ...LOVAAS_SECTION_ACADEMIC,
  ...LOVAAS_SECTION_SCHOOL_READINESS,
  ...LOVAAS_SECTION_SELF_CARE
];

export const LOVAAS_DOMAINS_LIST = [
  { key: 'lovaas_attention', label: '1. مهارات الحضور والانتباه' },
  { key: 'lovaas_imitation', label: '2. مهارات التقليد' },
  { key: 'lovaas_receptive', label: '3. مهارات فهم اللغة (اللغة الاستقبالية)' },
  { key: 'lovaas_expressive', label: '4. مهارات اللغة التعبيرية' },
  { key: 'lovaas_abstract', label: '5. مهارات اللغة المجردة' },
  { key: 'lovaas_social', label: '6. المهارات الاجتماعية' },
  { key: 'lovaas_preacademic', label: '7. مهارات ما قبل الأكاديمي' },
  { key: 'lovaas_academic', label: '8. المهارات الأكاديمية' },
  { key: 'lovaas_school_readiness', label: '9. مهارات الإعداد للمدرسة' },
  { key: 'lovaas_self_care', label: '10. مهارات رعاية الذات' }
];
