/**
 * CENTRAL PORTAGE PROGRAM DATASET AGGREGATOR
 * Combines all 5 developmental domains of the Portage early childhood program:
 * 1. Motor Development (المجال الحركي): 140 goals
 * 2. Cognitive Development (المجال المعرفي): 106 goals
 * 3. Language & Communication (المجال اللغوي والتواصلي): 99 goals
 * 4. Social Development (المجال الاجتماعي / التنشئة الاجتماعية): 83 goals
 * 5. Self-Help / Self-Care (مجال رعاية الذات / مساعدة الذات): 105 goals
 * 
 * Total: 533 comprehensive, deduplicated, and verified Portage goals
 */

import { PORTAGE_MOTOR_GOALS } from "./portageGoalsMotor";
import { PORTAGE_COGNITIVE_GOALS } from "./portageGoalsCognitive";
import { PORTAGE_LANGUAGE_GOALS } from "./portageGoalsLanguage";
import { PORTAGE_SOCIAL_GOALS } from "./portageGoalsSocial";
import { PORTAGE_SELFHELP_GOALS } from "./portageGoalsSelfHelp";

export const ALL_PORTAGE_GOALS = [
  ...PORTAGE_MOTOR_GOALS,
  ...PORTAGE_COGNITIVE_GOALS,
  ...PORTAGE_LANGUAGE_GOALS,
  ...PORTAGE_SOCIAL_GOALS,
  ...PORTAGE_SELFHELP_GOALS,
];

export const PORTAGE_DOMAINS = [
  { id: "motor", nameAr: "المجال الحركي", nameEn: "Motor Development", count: PORTAGE_MOTOR_GOALS.length },
  { id: "cognitive", nameAr: "المجال المعرفي", nameEn: "Cognitive Development", count: PORTAGE_COGNITIVE_GOALS.length },
  { id: "language", nameAr: "المجال اللغوي والتواصلي", nameEn: "Language & Communication", count: PORTAGE_LANGUAGE_GOALS.length },
  { id: "social", nameAr: "المجال الاجتماعي", nameEn: "Social Development", count: PORTAGE_SOCIAL_GOALS.length },
  { id: "selfhelp", nameAr: "مجال رعاية الذات", nameEn: "Self-Help Development", count: PORTAGE_SELFHELP_GOALS.length },
];

export const PORTAGE_AGE_GROUPS = [
  { id: "0-1", labelAr: "من 0 إلى 1 سنة", labelEn: "0-1 Years" },
  { id: "1-2", labelAr: "من 1 إلى 2 سنة", labelEn: "1-2 Years" },
  { id: "2-3", labelAr: "من 2 إلى 3 سنوات", labelEn: "2-3 Years" },
  { id: "3-4", labelAr: "من 3 إلى 4 سنوات", labelEn: "3-4 Years" },
  { id: "4-5", labelAr: "من 4 إلى 5 سنوات", labelEn: "4-5 Years" },
  { id: "5-6", labelAr: "من 5 إلى 6 سنوات", labelEn: "5-6 Years" },
];

export {
  PORTAGE_MOTOR_GOALS,
  PORTAGE_COGNITIVE_GOALS,
  PORTAGE_LANGUAGE_GOALS,
  PORTAGE_SOCIAL_GOALS,
  PORTAGE_SELFHELP_GOALS,
};
