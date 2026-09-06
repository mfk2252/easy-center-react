import {
  collection, doc, getDocs, getDoc,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, writeBatch, limit
} from 'firebase/firestore';
import { db } from './config';

// مسار البيانات: centers/{centerId}/{collection}/{docId}
export const centerCol = (cId, col) => collection(db, 'centers', cId, col);
export const centerDoc = (cId, col, dId) => doc(db, 'centers', cId, col, dId);

export async function fbGetAll(centerId, col, maxLimit = null) {
  try {
    let q = centerCol(centerId, col);
    if (maxLimit && typeof maxLimit === 'number' && maxLimit > 0) {
      q = query(q, limit(maxLimit));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { return []; }
}

export async function fbAdd(centerId, col, data) {
  try {
    const ref = await addDoc(centerCol(centerId, col), {
      ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    return ref.id;
  } catch(e) { console.warn('fbAdd:', e); throw e; }
}

// NOTE: fbSet/fbUpdate/fbDelete used to swallow errors (catch + warn, no
// rethrow). That meant a failed offline write was silently dropped forever.
// They now rethrow so useStorage.js can catch the failure and push the
// operation into the persisted offline queue for automatic retry later.
export async function fbSet(centerId, col, docId, data) {
  await setDoc(centerDoc(centerId, col, docId), {
    ...data, updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * عمليات الكتابة المجمعة الذرية (Batch Writes)
 * يقسم المستندات إلى حزم لا تتجاوز 450 مستند لكل طلب بدلاً من الإرسال الفردي
 */
export async function fbBatchSet(centerId, col, items) {
  if (!centerId || !col || !Array.isArray(items) || items.length === 0) return;

  const CHUNK_SIZE = 450;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const item of chunk) {
      if (!item || !item.id) continue;
      const ref = centerDoc(centerId, col, String(item.id));
      batch.set(ref, {
        ...item,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    await batch.commit();
  }
}

export async function fbUpdate(centerId, col, docId, data) {
  await updateDoc(centerDoc(centerId, col, docId), {
    ...data, updatedAt: serverTimestamp()
  });
}

export async function fbDelete(centerId, col, docId) {
  await deleteDoc(centerDoc(centerId, col, docId));
}

export async function getCenterSettings(centerId) {
  try {
    const snap = await getDoc(doc(db, 'centers', centerId));
    return snap.exists() ? snap.data() : null;
  } catch(e) { return null; }
}

export async function updateCenterSettings(centerId, data) {
  if (!centerId) return;
  await setDoc(doc(db, 'centers', centerId), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function createUser(centerId, userData) {
  const userId = `${centerId}_${userData.username}`;
  await setDoc(doc(db, 'users', userId), {
    ...userData, centerId, active: true, createdAt: serverTimestamp()
  }, { merge: true });
  return userId;
}

export async function updateUser(userId, data) {
  if (!userId) return;
  await setDoc(doc(db, 'users', userId), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteUser(userId) {
  await deleteDoc(doc(db, 'users', userId));
}

export async function getCenterUsers(centerId) {
  try {
    const q = query(collection(db, 'users'), where('centerId', '==', centerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { return []; }
}
