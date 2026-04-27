import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
