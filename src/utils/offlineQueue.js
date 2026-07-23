/**
 * Persisted backup queue for Firestore mutations that failed to reach the
 * server. Lives in localStorage so it survives page reloads AND full
 * device/browser restarts — not just in-memory state.
 *
 * Firestore's own persistent IndexedDB cache (see firebase/config.js)
 * already retries most writes automatically once you're back online. This
 * queue exists as a defense-in-depth safety net + gives the UI a way to
 * show "N changes pending sync".
 */

const QUEUE_KEY = 'scs_offline_queue';
let processing = false;
const listeners = new Set();

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
  catch (e) { return []; }
}

function writeQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) {}
  notify();
}

function notify() {
  const count = readQueue().length;
  listeners.forEach(fn => { try { fn(count); } catch (e) {} });
}

/** @param {{type:'set'|'delete', centerId:string, col:string, docId:string, data?:object}} op */
export function enqueue(op) {
  const q = readQueue();
  q.push({
    ...op,
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    attempts: 0,
    queuedAt: Date.now(),
  });
  writeQueue(q);
}

export function getPendingCount() {
  return readQueue().length;
}

/** Subscribe to pending-count changes. Returns an unsubscribe function. */
export function onQueueChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function processQueue() {
  if (processing) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  const q = readQueue();
  if (q.length === 0) return;

  processing = true;
  try {
    const { fbSet, fbDelete } = await import('../firebase/db');
    const remaining = [];

    for (const op of q) {
      try {
        if (op.type === 'set') {
          await fbSet(op.centerId, op.col, op.docId, op.data);
        } else if (op.type === 'delete') {
          await fbDelete(op.centerId, op.col, op.docId);
        }
      } catch (e) {
        op.attempts = (op.attempts || 0) + 1;
        // Keep retrying for a long time, but don't let a permanently-broken
        // op (e.g. bad permissions) grow the queue forever.
        if (op.attempts < 50) remaining.push(op);
        else console.warn('Dropping offline op after 50 failed attempts:', op);
      }
    }

    writeQueue(remaining);
  } finally {
    processing = false;
  }
}

let initialized = false;
export function initOfflineSync() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener('online', () => processQueue());
  window.addEventListener('focus', () => processQueue());
  // Periodic safety-net retry (covers browsers/OSes that don't fire
  // 'online' reliably, and cases where connectivity flaps silently).
  setInterval(() => processQueue(), 30000);
  // Also try once immediately on app start — covers "was offline, network
  // came back while the app/device was fully closed" scenarios.
  processQueue();
}
