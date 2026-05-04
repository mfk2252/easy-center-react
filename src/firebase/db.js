import {
  collection, doc, getDocs, getDoc,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// مسار البيانات: centers/{centerId}/{collection}/{docId}
const centerCol = (cId, col) => collection(db, 'centers', cId, col);
const centerDoc = (cId, col, dId) => doc(db, 'centers', cId, col, dId);

export async function fbGetAll(centerId, col) {
  try {
    const snap = await getDocs(centerCol(centerId, col));
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

export async function fbSet(centerId, col, docId, data) {
  try {
    await setDoc(centerDoc(centerId, col, docId), {
      ...data, updatedAt: serverTimestamp()
    }, { merge: true });
  } catch(e) { console.warn('fbSet:', e); }
}

export async function fbUpdate(centerId, col, docId, data) {
  try {
    await updateDoc(centerDoc(centerId, col, docId), {
      ...data, updatedAt: serverTimestamp()
    });
  } catch(e) { console.warn('fbUpdate:', e); }
}

export async function fbDelete(centerId, col, docId) {
  try {
    await deleteDoc(centerDoc(centerId, col, docId));
  } catch(e) { console.warn('fbDelete:', e); }
}

export async function getCenterSettings(centerId) {
  try {
    const snap = await getDoc(doc(db, 'centers', centerId));
    return snap.exists() ? snap.data() : null;
  } catch(e) { return null; }
}

export async function updateCenterSettings(centerId, data) {
  await updateDoc(doc(db, 'centers', centerId), { ...data, updatedAt: serverTimestamp() });
}

export async function createUser(centerId, userData) {
  const userId = `${centerId}_${userData.username}`;
  await setDoc(doc(db, 'users', userId), {
    ...userData, centerId, active: true, createdAt: serverTimestamp()
  });
  return userId;
}

export async function updateUser(userId, data) {
  await updateDoc(doc(db, 'users', userId), { ...data, updatedAt: serverTimestamp() });
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
