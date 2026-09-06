/**
 * useStorage - يحفظ في localStorage (سريع) + Firestore (سحابة)
 * المزامنة تلقائية عند تسجيل الدخول
 */
import { uid } from '../utils/dateHelpers';
import { fbGetAll, fbSet, fbUpdate, fbDelete, fbBatchSet } from '../firebase/db';

export function getCenterId() {
  try {
    const session = JSON.parse(localStorage.getItem('scs_session') || 'null');
    if (session?.centerId) return session.centerId;
    if (session?.uid) return session.uid;
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
    if (r !== null) {
      const parsed = JSON.parse(r);
      if (parsed !== null && parsed !== undefined) return parsed;
    }
    const cId = getCenterId();
    const fallback = (cId ? localStorage.getItem(`local_${key}`) : null)
      || localStorage.getItem(`scs_${key}`)
      || localStorage.getItem(key);
    if (fallback !== null) {
      try {
        const parsed = JSON.parse(fallback);
        if (parsed !== null && parsed !== undefined) {
          if (cId) localStorage.setItem(`${cId}_${key}`, fallback);
          return parsed;
        }
      } catch(_) {}
    }
    return [];
  } catch(e) { return []; }
}

export function lsWrite(key, data) {
  try {
    localStorage.setItem(cKey(key), JSON.stringify(data));
    localStorage.setItem(`scs_${key}`, JSON.stringify(data));
    const cId = getCenterId();
    if (cId) {
      localStorage.setItem(`local_${key}`, JSON.stringify(data));
    }
  } catch(e) {}
}

export function lsSet(key, data) {
  const cId = getCenterId();
  lsWrite(key, data);
  if (cId && Array.isArray(data)) {
    fbBatchSet(cId, key, data).catch(e => console.warn(`fbBatchSet ${key}:`, e));
  }
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
  } else {
    const nameIdx = data.name ? list.findIndex(x => x.name === data.name) : -1;
    if (nameIdx !== -1) {
      list[nameIdx] = { ...list[nameIdx], ...data, id, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...data, id, updatedAt: new Date().toISOString() });
    }
  }
  lsWrite(key, list);
  if (cId) {
    fbSet(cId, key, id, { ...data, updatedAt: new Date().toISOString() }).catch(e => console.warn(`fbUpd ${key}:`, e));
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
  'calEvents', 'centerEvents', 'centerActivities', 'centerPartners', 'parentInteractions', 'consultations',
  'academicYears', 'centerCalendarConfig',
  'evaluations', 'warnings', 'stuReports', 'behaviorPlans',
  'studentFees', 'payments', 'notifs', 'manualAlerts', 'users',
  'progEvaluations', 'progPrograms', 'progReports',
  'progWeeklyReports', 'progMonthlyReports', 'progParentMeetings',
  'progSemiAnnualReports', 'progAnnualReports', 'progBehaviorReports',
  'progLearningDifficultyReports',
  'measurements', 'measureItems', 'studentAssessments',
  'bonuses',
  'progGoalsBank',
  'partners', 'custody', 'centerVisits', 'buses', 'centerDocs',
  'invoices', 'financialAccounts',
  'sections', 'categories',
];

// فترة صلاحية الكاش المحلي قبل السماح بمزامنة شاملة جديدة (10 دقائق)
const SYNC_COOLDOWN_MS = 10 * 60 * 1000;

/** تحديث شامل: جلب كل البيانات من Firestore + إعدادات المركز (مع إجبار تخطي الكاش) */
export async function refreshAllSystemData(centerId) {
  if (!centerId) throw new Error('لم يتم تحديد المركز');
  const { getCenterSettings } = await import('../firebase/db');
  await syncFromFirebase(centerId, SYSTEM_DATA_KEYS, true);
  const centerData = await getCenterSettings(centerId);
  return centerData;
}

export async function syncFromFirebase(centerId, keys, force = false) {
  if (!centerId) return;

  const lastSyncKey = `scs_last_sync_${centerId}`;
  const lastSyncTime = Number(localStorage.getItem(lastSyncKey) || '0');
  const now = Date.now();

  // منع الاستعلامات المكررة إذا تمت المزامنة قبل أقل من 10 دقائق ولم يتم طلب إجبار المزامنة
  if (!force && (now - lastSyncTime < SYNC_COOLDOWN_MS)) {
    return;
  }

  // معالجة المجموعات في دفعات (Chunks) تجنباً لإرسال 43 استعلاماً متزامناً في نفس اللحظة
  const CHUNK_SIZE = 8;
  for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
    const chunk = keys.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(async (key) => {
      try {
        const data = await fbGetAll(centerId, key);
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(`${centerId}_${key}`, JSON.stringify(data));
        } else {
          const localRaw = localStorage.getItem(`${centerId}_${key}`) || localStorage.getItem(`local_${key}`) || localStorage.getItem(key);
          if (localRaw) {
            try {
              const parsed = JSON.parse(localRaw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                localStorage.setItem(`${centerId}_${key}`, JSON.stringify(parsed));
                // استخدام الكتابة المجمعة بدلاً من الحلقات الفردية
                await fbBatchSet(centerId, key, parsed).catch(() => {});
              }
            } catch (_) {}
          }
        }
      } catch(e) { console.warn(`sync ${key}:`, e); }
    }));
  }

  localStorage.setItem(lastSyncKey, String(now));
}

export async function pushToFirebase(centerId) {
  if (!centerId) return;
  const keys = SYSTEM_DATA_KEYS;

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(`${centerId}_${key}`)
               || localStorage.getItem(`local_${key}`)
               || localStorage.getItem(`scs_${key}`)
               || localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (!Array.isArray(data) || data.length === 0) continue;

      // كتابة مجمعة سريعة وذرية عبر Batch
      await fbBatchSet(centerId, key, data);
    } catch(e) { console.warn(`push ${key}:`, e); }
  }
}
