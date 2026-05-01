import { uid } from '../utils/dateHelpers';
import { fbGetAll, fbAdd, fbUpdate, fbDelete } from '../firebase/db';

export function getCenterId() {
  try {
    const session = JSON.parse(localStorage.getItem('scs_session') || 'null');
    if (session?.centerId) return session.centerId;
    const cuid = localStorage.getItem('scs_current_uid');
    if (cuid) return cuid;
  } catch(e) {}
  return null;
}

function cKey(key) {
  const centerId = getCenterId();
  return centerId ? `${centerId}_${key}` : key;
}

export function lsGet(key) {
  try {
    const r = localStorage.getItem(cKey(key));
    return r ? JSON.parse(r) : [];
  } catch(e) { return []; }
}

function lsCache(key, data) {
  try {
    localStorage.setItem(cKey(key), JSON.stringify(data));
  } catch(e) {}
}

export function lsAdd(key, item) {
  const centerId = getCenterId();
  const newItem = { 
    ...item, 
    id: item.id || uid(),
    createdAt: item.createdAt || new Date().toISOString()
  };
  
  const list = lsGet(key);
  list.push(newItem);
  lsCache(key, list);
  
  if (centerId) {
    const { id, ...rest } = newItem;
    fbAdd(centerId, key, { ...rest, _localId: id }).catch(e => 
      console.warn(`FB add ${key}:`, e)
    );
  }
  
  return newItem;
}

export function lsUpd(key, id, data) {
  const centerId = getCenterId();
  
  const list = lsGet(key);
  const idx = list.findIndex(x => x.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data, id, updatedAt: new Date().toISOString() };
    lsCache(key, list);
  }
  
  if (centerId) {
    fbUpdate(centerId, key, id, { ...data, updatedAt: new Date().toISOString() }).catch(e =>
      console.warn(`FB update ${key}:`, e)
    );
  }
}

export function lsDel(key, id) {
  const centerId = getCenterId();
  
  const list = lsGet(key).filter(x => x.id !== id);
  lsCache(key, list);
  
  if (centerId) {
    fbDelete(centerId, key, id).catch(e =>
      console.warn(`FB delete ${key}:`, e)
    );
  }
}

export async function syncFromFirebase(centerId, keys) {
  if (!centerId) return;
  console.log('🔄 مزامنة البيانات من Firebase...');
  
  await Promise.all(keys.map(async (key) => {
    try {
      const data = await fbGetAll(centerId, key);
      if (data.length > 0) {
        const normalized = data.map(item => ({
          ...item,
          id: item._localId || item.id
        }));
        localStorage.setItem(`${centerId}_${key}`, JSON.stringify(normalized));
      }
    } catch(e) {
      console.warn(`Sync ${key}:`, e);
    }
  }));
  
  console.log('✅ تمت المزامنة!');
}
