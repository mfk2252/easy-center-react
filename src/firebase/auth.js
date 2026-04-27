import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider } from './config';

// ===== Google Sign In (للمدير فقط) =====
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  // تحقق إذا كان المركز موجود
  const centerRef = doc(db, 'centers', user.uid);
  const centerDoc = await getDoc(centerRef);
  
  if (!centerDoc.exists()) {
    // مركز جديد - أنشئ سجل أساسي
    await setDoc(centerRef, {
      managerId: user.uid,
      managerEmail: user.email,
      managerName: user.displayName,
      managerPhoto: user.photoURL,
      name: '',
      type: '',
      phone: '',
      logo: '',
      color: '#1a56db',
      createdAt: serverTimestamp(),
      isSetup: false // يحتاج إعداد أولي
    });
  }
  
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    photo: user.photoURL,
    role: 'manager',
    centerId: user.uid,
    isNewCenter: !centerDoc.exists()
  };
}

// ===== Email/Password Sign In (للموظفين وأولياء الأمور) =====
export async function signInWithCredentials(username, password) {
  // البحث عن المستخدم في جميع المراكز بواسطة username
  const usersQuery = query(
    collection(db, 'users'),
    where('username', '==', username.trim())
  );
  
  const snapshot = await getDocs(usersQuery);
  
  if (snapshot.empty) {
    throw new Error('اسم المستخدم غير موجود');
  }
  
  const userData = snapshot.docs[0].data();
  
  // التحقق من كلمة المرور
  if (userData.password !== password) {
    throw new Error('كلمة المرور غير صحيحة');
  }
  
  if (!userData.active) {
    throw new Error('هذا الحساب معطّل. تواصل مع المدير.');
  }
  
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

// ===== Sign Out =====
export async function signOutUser() {
  await signOut(auth);
  localStorage.removeItem('scs_session');
  localStorage.removeItem('userPerms');
}

// ===== مراقبة حالة تسجيل الدخول =====
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
