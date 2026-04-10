// Firebase wrapper — falls back to localStorage if not configured
import { lsGet, lsSet, lsAdd, lsUpd, lsDel } from './useStorage';

let db = null;
let fbApp = null;

export async function initFirebase(cfg) {
  if (!cfg?.apiKey || !cfg?.projectId) return false;
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    if (!getApps().length) fbApp = initializeApp(cfg);
    db = getFirestore(fbApp);
    return true;
  } catch(e) {
    console.warn('Firebase init failed, using localStorage', e);
    return false;
  }
}

export async function dbGetAll(collection) {
  if (db) {
    try {
      const { getDocs, collection: col } = await import('firebase/firestore');
      const snap = await getDocs(col(db, collection));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.warn('FB read fail, falling back', e); }
  }
  return lsGet(collection);
}

export async function dbAdd(collection, item) {
  if (db) {
    try {
      const { addDoc, collection: col, serverTimestamp } = await import('firebase/firestore');
      const ref = await addDoc(col(db, collection), { ...item, createdAt: serverTimestamp() });
      const newItem = { ...item, id: ref.id };
      // also sync to ls for offline
      const list = lsGet(collection);
      list.push(newItem);
      lsSet(collection, list);
      return newItem;
    } catch(e) { console.warn('FB add fail, falling back', e); }
  }
  return lsAdd(collection, item);
}

export async function dbUpd(collection, id, data) {
  if (db) {
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      await updateDoc(doc(db, collection, id), { ...data, updatedAt: serverTimestamp() });
      lsUpd(collection, id, data);
      return { ...data, id };
    } catch(e) { console.warn('FB upd fail, falling back', e); }
  }
  return lsUpd(collection, id, data);
}

export async function dbDel(collection, id) {
  if (db) {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, collection, id));
      lsDel(collection, id);
      return true;
    } catch(e) { console.warn('FB del fail, falling back', e); }
  }
  lsDel(collection, id);
  return true;
}

export function isFirebaseReady() { return !!db; }
