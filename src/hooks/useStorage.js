import { uid } from '../utils/dateHelpers';
import { CFG_KEY } from '../utils/constants';

function pfx() {
  try {
    const r = localStorage.getItem(CFG_KEY);
    if (r) { const c = JSON.parse(r); return (c.center?.projectId || 'local') + '_'; }
  } catch(e) {}
  return 'local_';
}

export function lsGet(key) {
  try { const r = localStorage.getItem(pfx() + key); return r ? JSON.parse(r) : []; }
  catch(e) { return []; }
}

export function lsSet(key, data) {
  try { localStorage.setItem(pfx() + key, JSON.stringify(data)); } catch(e) {}
}

export function lsAdd(key, item) {
  const list = lsGet(key);
  const newItem = { ...item, id: item.id || uid(), createdAt: item.createdAt || new Date().toISOString() };
  list.push(newItem);
  lsSet(key, list);
  return newItem;
}

export function lsUpd(key, id, data) {
  const list = lsGet(key);
  const idx = list.findIndex(x => x.id === id);
  if (idx !== -1) { list[idx] = { ...list[idx], ...data, id, updatedAt: new Date().toISOString() }; lsSet(key, list); return list[idx]; }
  return null;
}

export function lsDel(key, id) {
  const list = lsGet(key).filter(x => x.id !== id);
  lsSet(key, list);
}
