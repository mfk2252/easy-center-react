import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBOKnMTpaIlksl3WMqM_d9K_yvSWoWWWVU",
  authDomain: "specialed-pro.firebaseapp.com",
  projectId: "specialed-pro",
  storageBucket: "specialed-pro.firebasestorage.app",
  messagingSenderId: "540094152944",
  appId: "1:540094152944:web:31eab78e77d950e6fe4235"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ===== Offline-first Firestore =====
// Persistent IndexedDB cache with multi-tab support: reads/writes work
// while offline and survive full app/device restarts. Firestore itself
// queues offline writes and replays them automatically once the network
// is back — this is the main engine behind "offline-first" here.
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (e) {
  // Some environments (very old browsers, certain private-browsing modes)
  // don't support IndexedDB persistence — fall back to memory cache so the
  // app still works (just without cross-restart offline durability).
  console.warn('Persistent Firestore cache unavailable, falling back to memory cache:', e);
  db = initializeFirestore(app, { localCache: memoryLocalCache() });
}
export { db };

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export default app;
