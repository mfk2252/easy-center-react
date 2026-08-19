import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBOKnMTpaIlksl3WMqM_d9K_yvSWoWWWVU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "specialed-pro.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "specialed-pro",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "specialed-pro.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "540094152944",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:540094152944:web:31eab78e77d950e6fe4235"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ===== Offline-first Firestore =====
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (e) {
  console.warn('Persistent Firestore cache unavailable, falling back to memory cache:', e);
  db = initializeFirestore(app, { localCache: memoryLocalCache() });
}
export { db };

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Exported because src/firebase/auth.js imports it directly.
export { firebaseConfig };

export default app;
