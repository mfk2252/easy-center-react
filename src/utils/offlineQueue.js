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

import { auth } from '../firebase/config';
import { isTransientError, recordSyncFailure } from './syncFailures';

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

/** العمليات المعلّقة (لم تصل للسحابة) لمجموعة معيّنة في مركز معيّن */
export function getPendingOps(centerId, col) {
  return readQueue().filter(op => op.centerId === centerId && op.col === col);
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
  // لا نعالج الطابور قبل اكتمال تسجيل الدخول، وإلا نُرفض بصلاحيات خاطئة
  if (!auth.currentUser) return;

  const q = readQueue();
  if (q.length === 0) return;

  processing = true;
  try {
    const { fbSet, fbDelete } = await import('../firebase/db');
    const remaining = [];
    const currentCenter = localStorage.getItem('scs_current_uid');

    for (const op of q) {
      // عمليات مركز آخر (مستخدم سابق على نفس الجهاز) تبقى ولا تُنفَّذ بحساب مختلف
      if (op.centerId !== currentCenter) { remaining.push(op); continue; }
      try {
        if (op.type === 'set') {
          await fbSet(op.centerId, op.col, op.docId, op.data);
        } else if (op.type === 'delete') {
          await fbDelete(op.centerId, op.col, op.docId);
        }
      } catch (e) {
        if (isTransientError(e)) {
          op.attempts = (op.attempts || 0) + 1;
          if (op.attempts < 50) remaining.push(op);
          else recordSyncFailure(op, e);
        } else {
          // خطأ نهائي (صلاحيات/حجم): إعادة المحاولة لن تنفع، نُبلغ المستخدم
          recordSyncFailure(op, e);
        }
      }
    }

    // عمليات أُضيفت للطابور أثناء المعالجة يجب ألا تُمحى
    const handled = new Set(q.map(o => o.id));
    const added = readQueue().filter(o => !handled.has(o.id));
    writeQueue([...remaining, ...added]);
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
