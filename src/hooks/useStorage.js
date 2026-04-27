import { uid } from '../utils/dateHelpers';
import { fbGetAll, fbAdd, fbUpdate, fbDelete } from '../firebase/db';

// ===== الـ centerId يأتي من الجلسة المحفوظة =====
function getCenterId() {
  try {
    const session = JSON.parse(localStorage.getItem('scs_session') || 'null');
    if (session?.centerId) return session.centerId;
    // للمدير المسجل بـ Google
    const fbUser = localStorage.getItem('firebase:authUser:AIzaSyBOKnMTpaIlksl3WMqM_d9K_yvSWoWWWVU:[DEFAULT]');
    if (fbUser) {
      const parsed = JSON.parse(fbUser);
      return parsed.uid;
    }
  } catch(e) {}
  return 'local';
}

// ===== localStorage كـ cache =====
function cacheKey(key) {
  const centerId = getCenterId();
  return `${centerId}_${key}`;
}

export function lsGet(key) {
  try {
    const r = localStorage.getItem(cacheKey(key));
    return r ? JSON.parse(r) : [];
  } catch(e) { return []; }
}

export function lsSet(key, data) {
  try {
    localStorage.setItem(cacheKey(key), JSON.stringify(data));
  } catch(e) {}
}

export function lsAdd(key, item) {
  const list = lsGet(key);
  const newItem = { 
    ...item, 
    id: item.id || uid(), 
    createdAt: item.createdAt || new Date().toISOString() 
  };
  list.push(newItem);
  lsSet(key, list);
  
  // Sync to Firebase in background
  const centerId = getCenterId();
  if (centerId !== 'local') {
    const { id, ...rest } = newItem;
    fbAdd(centerId, key, rest).catch(e => console.warn('fbAdd sync:', e));
  }
  
  return newItem;
}

export function lsUpd(key, id, data) {
  const list = lsGet(key);
  const idx = list.findIndex(x => x.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data, id, updatedAt: new Date().toISOString() };
    lsSet(key, list);
    
    // Sync to Firebase in background
    const centerId = getCenterId();
    if (centerId !== 'local') {
      fbUpdate(centerId, key, id, data).catch(e => console.warn('fbUpdate sync:', e));
    }
    
    return list[idx];
  }
  return null;
}

export function lsDel(key, id) {
  const list = lsGet(key).filter(x => x.id !== id);
  lsSet(key, list);
  
  // Sync to Firebase in background
  const centerId = getCenterId();
  if (centerId !== 'local') {
    fbDelete(centerId, key, id).catch(e => console.warn('fbDelete sync:', e));
  }
}

// ===== تحميل البيانات من Firebase وتخزينها في localStorage =====
export async function syncFromFirebase(centerId, keys) {
  if (!centerId || centerId === 'local') return;
  
  for (const key of keys) {
    try {
      const data = await fbGetAll(centerId, key);
      if (data.length > 0) {
        localStorage.setItem(`${centerId}_${key}`, JSON.stringify(data));
      }
    } catch(e) {
      console.warn(`syncFromFirebase ${key}:`, e);
    }
  }
}
