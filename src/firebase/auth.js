import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';

// تسجيل الدخول بـ Google (للمدير)
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  const centerRef = doc(db, 'centers', user.uid);
  const centerDoc = await getDoc(centerRef);
  
  if (!centerDoc.exists()) {
    await setDoc(centerRef, {
      managerId: user.uid,
      managerEmail: user.email,
      managerName: user.displayName,
      managerPhoto: user.photoURL,
      name: '', type: '', phone: '', logo: '',
      color: '#1a56db',
      createdAt: serverTimestamp(),
      isSetup: false
    });
  }
  
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || 'المدير',
    photo: user.photoURL,
    role: 'manager',
    centerId: user.uid,
    isNewCenter: !centerDoc.exists()
  };
}

// تسجيل الدخول بـ username/password (للموظفين)
export async function signInWithCredentials(username, password) {
  const q = query(collection(db, 'users'), where('username', '==', username.trim()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) throw new Error('اسم المستخدم غير موجود');
  
  const userData = snapshot.docs[0].data();
  if (userData.password !== password) throw new Error('كلمة المرور غير صحيحة');
  if (userData.active === false) throw new Error('هذا الحساب معطّل. تواصل مع المدير.');
  
  return {
    uid: snapshot.docs[0].id,
    email: userData.email || '',
    name: userData.name,
    username: userData.username,
    role: userData.role,
    centerId: userData.centerId,
    permissions: userData.permissions || {},
    isNewCenter: false
  };
}

export async function signOutUser() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
