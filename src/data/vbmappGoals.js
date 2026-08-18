/**
 * VB-MAPP (Verbal Behavior Milestones Assessment and Placement Program)
 * بنك أهداف برنامج تقييم وتحديد معالم السلوك اللفظي المتكامل (المستويات 1، 2، 3)
 * مراجع لغوياً ومصاغ بأعلى معايير الدقة الأكاديمية والقياس السلوكي
 */

import { VBMAPP_LEVEL_1_GOALS } from './vbmappGoalsLevel1';
import { VBMAPP_LEVEL_2_GOALS } from './vbmappGoalsLevel2';
import { VBMAPP_LEVEL_3_GOALS } from './vbmappGoalsLevel3';

export { VBMAPP_LEVEL_1_GOALS, VBMAPP_LEVEL_2_GOALS, VBMAPP_LEVEL_3_GOALS };

export const ALL_VBMAPP_GOALS = [
  ...VBMAPP_LEVEL_1_GOALS,
  ...VBMAPP_LEVEL_2_GOALS,
  ...VBMAPP_LEVEL_3_GOALS,
];
