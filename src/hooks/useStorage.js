/**
 * useStorage - يحفظ في localStorage (سريع) + Firestore (سحابة)
 * المزامنة تلقائية عند تسجيل الدخول
 */
import { uid } from '../utils/dateHelpers';
import { fbGetAll, fbSet, fbUpdate, fbDelete } from '../firebase/db';

export function getCenterId() {
  try {
    const session = JSON.parse(localStorage.getItem('scs_session') || 'null');
    if (session?.centerId) return session.centerId;
    return localStorage.getItem('scs_current_uid') || null;
  } catch(e) { return null; }
}

function cKey(key) {
  const cId = getCenterId();
  return cId ? `${cId}_${key}` : `local_${key}`;
}

export function lsGet(key) {
  try {
    const r = localStorage.getItem(cKey(key));
    return r ? JSON.parse(r) : [];
  } catch(e) { return []; }
}

function lsWrite(key, data) {
  try { localStorage.setItem(cKey(key), JSON.stringify(data)); } catch(e) {}
}

export function lsAdd(key, item) {
  const cId = getCenterId();
  const newItem = { ...item, id: item.id || uid(), createdAt: item.createdAt || new Date().toISOString() };

  const list = lsGet(key);
  list.push(newItem);
  lsWrite(key, list);

  if (cId) {
    fbSet(cId, key, newItem.id, newItem).catch(e => console.warn(`fbAdd ${key}:`, e));
  }

  return newItem;
}

export function lsUpd(key, id, data) {
  const cId = getCenterId();
  const list = lsGet(key);
  const idx = list.findIndex(x => x.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data, id, updatedAt: new Date().toISOString() };
    lsWrite(key, list);
  }
  if (cId) {
    fbUpdate(cId, key, id, { ...data, updatedAt: new Date().toISOString() }).catch(e => console.warn(`fbUpd ${key}:`, e));
  }
}

export function lsDel(key, id) {
  const cId = getCenterId();
  const list = lsGet(key).filter(x => x.id !== id);
  lsWrite(key, list);
  if (cId) {
    fbDelete(cId, key, id).catch(e => console.warn(`fbDel ${key}:`, e));
  }
}

export const SYSTEM_DATA_KEYS = [
  'students', 'employees', 'sessions', 'appointments', 'iepGoals',
  'attStu', 'attEmp', 'income', 'expenses', 'salaries', 'leaves',
  'calEvents', 'centerActivities', 'parentInteractions', 'consultations',
  'evaluations', 'warnings', 'stuReports', 'behaviorPlans',
  'studentFees', 'payments', 'notifs', 'manualAlerts', 'users',
  'progEvaluations', 'progPrograms', 'progReports',
  'progWeeklyReports', 'progMonthlyReports', 'progParentMeetings',
  'progSemiAnnualReports', 'progAnnualReports', 'progBehaviorReports',
  'progLearningDifficultyReports',
  'bonuses',
  'progGoalsBank',
  'partners', 'custody', 'centerVisits', 'buses', 'centerDocs',
];

/** تحديث شامل: جلب كل البيانات من Firestore + إعدادات المركز */
export async function refreshAllSystemData(centerId) {
  if (!centerId) throw new Error('لم يتم تحديد المركز');
  const { getCenterSettings } = await import('../firebase/db');
  await syncFromFirebase(centerId, SYSTEM_DATA_KEYS);
  const centerData = await getCenterSettings(centerId);
  return centerData;
}

export async function syncFromFirebase(centerId, keys) {
  if (!centerId) return;
  await Promise.all(keys.map(async (key) => {
    try {
      const data = await fbGetAll(centerId, key);
      if (data.length > 0) {
        localStorage.setItem(`${centerId}_${key}`, JSON.stringify(data));
      }
    } catch(e) { console.warn(`sync ${key}:`, e); }
  }));
}

export async function pushToFirebase(centerId) {
  if (!centerId) return;
  const keys = [
    'students','employees','sessions','appointments','iepGoals',
    'attStu','attEmp','income','expenses','salaries','leaves',
    'calEvents','centerActivities','parentInteractions','consultations',
    'evaluations','warnings','stuReports','behaviorPlans',
    'studentFees','payments','notifs','manualAlerts','users',
    'progEvaluations','progPrograms','progReports',
    'progWeeklyReports','progMonthlyReports','progParentMeetings',
    'progSemiAnnualReports','progAnnualReports','progBehaviorReports',
    'progLearningDifficultyReports',
    'bonuses',
    'progGoalsBank',
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(`${centerId}_${key}`)
               || localStorage.getItem(`local_${key}`)
               || localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (!Array.isArray(data) || data.length === 0) continue;

      for (const item of data) {
        if (item.id) {
          await fbSet(centerId, key, item.id, item);
        }
      }
    } catch(e) { console.warn(`push ${key}:`, e); }
  }
}
