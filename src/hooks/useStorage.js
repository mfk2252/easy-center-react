/**
 * useStorage - يحفظ في localStorage (سريع، يعمل بدون إنترنت) + Firestore (سحابة)
 * المزامنة تلقائية عند تسجيل الدخول، وعند استعادة الاتصال، وحتى بعد إعادة تشغيل الجهاز.
 */
import { uid } from '../utils/dateHelpers';
import { fbGetAll, fbSet, fbUpdate, fbDelete } from '../firebase/db';
import { enqueue, processQueue, getPendingCount, onQueueChange, initOfflineSync } from '../utils/offlineQueue';

// الحصول على centerId
export function getCenterId() {
  try {
    const session = JSON.parse(localStorage.getItem('scs_session') || 'null');
    if (session?.centerId) return session.centerId;
    return localStorage.getItem('scs_current_uid') || null;
  } catch(e) { return null; }
}

// مفتاح التخزين المحلي
function cKey(key) {
  const cId = getCenterId();
  return cId ? `${cId}_${key}` : `local_${key}`;
}

// قراءة من localStorage
export function lsGet(key) {
  try {
    const r = localStorage.getItem(cKey(key));
    return r ? JSON.parse(r) : [];
  } catch(e) { return []; }
}

// كتابة في localStorage
function lsWrite(key, data) {
  try { localStorage.setItem(cKey(key), JSON.stringify(data)); } catch(e) {}
}

// إضافة عنصر — تُحفظ محلياً فوراً بغض النظر عن الاتصال، وتُرسل لـ Firestore
// في الخلفية. لو فشل الإرسال (بدون إنترنت) تُضاف العملية لقائمة الانتظار
// المحفوظة محلياً وتُعاد المحاولة تلقائياً عند عودة الاتصال.
export function lsAdd(key, item) {
  const cId = getCenterId();
  const newItem = { ...item, id: item.id || uid(), createdAt: item.createdAt || new Date().toISOString() };

  const list = lsGet(key);
  list.push(newItem);
  lsWrite(key, list);

  if (cId) {
    fbSet(cId, key, newItem.id, newItem).catch(e => {
      console.warn(`fbAdd ${key}:`, e);
      enqueue({ type: 'set', centerId: cId, col: key, docId: newItem.id, data: newItem });
    });
  }

  return newItem;
}

// تحديث عنصر
export function lsUpd(key, id, data) {
  const cId = getCenterId();
  const list = lsGet(key);
  const idx = list.findIndex(x => x.id === id);
  let fullItem = null;

  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data, id, updatedAt: new Date().toISOString() };
    fullItem = list[idx];
    lsWrite(key, list);
  }

  if (cId) {
    const payload = { ...data, updatedAt: new Date().toISOString() };
    fbUpdate(cId, key, id, payload).catch(e => {
      console.warn(`fbUpd ${key}:`, e);
      // استخدام "set" (merge) كخطة بديلة عند إعادة المحاولة، حتى لو كان
      // المستند غير موجود بعد على السيرفر (مثال: أُضيف وعُدّل وهو أوفلاين).
      enqueue({ type: 'set', centerId: cId, col: key, docId: id, data: fullItem || payload });
    });
  }
}

// حذف عنصر
export function lsDel(key, id) {
  const cId = getCenterId();
  const list = lsGet(key).filter(x => x.id !== id);
  lsWrite(key, list);

  if (cId) {
    fbDelete(cId, key, id).catch(e => {
      console.warn(`fbDel ${key}:`, e);
      enqueue({ type: 'delete', centerId: cId, col: key, docId: id });
    });
  }
}

export const SYSTEM_DATA_KEYS = [
  'students', 'employees', 'sessions', 'appointments', 'iepGoals',
  'attStu', 'attEmp', 'income', 'expenses', 'salaries', 'leaves',
  'calEvents', 'centerActivities', 'parentInteractions', 'consultations',
  'evaluations', 'warnings', 'stuReports', 'behaviorPlans',
  'studentFees', 'payments', 'notifs', 'manualAlerts', 'users',
  'progEvaluations', 'progPrograms', 'progReports',
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

// جلب من Firestore → localStorage
export async function syncFromFirebase(centerId, keys) {
  if (!centerId) return;
  // ادفع أي تغييرات محلية معلّقة أولاً حتى لا تُستبدل ببيانات قديمة من السيرفر
  await processQueue();
  await Promise.all(keys.map(async (key) => {
    try {
      const data = await fbGetAll(centerId, key);
      if (data.length > 0) {
        localStorage.setItem(`${centerId}_${key}`, JSON.stringify(data));
      }
    } catch(e) { console.warn(`sync ${key}:`, e); }
  }));
}

// رفع من localStorage → Firestore
export async function pushToFirebase(centerId) {
  if (!centerId) return;
  const keys = [
    'students','employees','sessions','appointments','iepGoals',
    'attStu','attEmp','income','expenses','salaries','leaves',
    'calEvents','centerActivities','parentInteractions','consultations',
    'evaluations','warnings','stuReports','behaviorPlans',
    'studentFees','payments','notifs','manualAlerts','users'
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

// ===== Offline sync engine =====
// تصدير أدوات حالة المزامنة للاستخدام في الواجهة (شارة "جارٍ المزامنة" مثلاً)
export { getPendingCount, onQueueChange, processQueue };

// تشغيل محرك المزامنة الأوفلاين فور تحميل هذا الملف (بداية تشغيل التطبيق).
// يستمع لحدث 'online'، ويعيد المحاولة دورياً، ويحاول فوراً عند بدء التشغيل —
// هذا يغطي حالة "عاد الاتصال بينما التطبيق/الجهاز كان مغلقاً تماماً".
initOfflineSync();
