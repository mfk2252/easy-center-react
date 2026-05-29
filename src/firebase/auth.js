import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';

const TRIAL_DAYS = 5;

function getTrialExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + TRIAL_DAYS);
  return Timestamp.fromDate(date);
}

export function checkSubscriptionStatus(centerData) {
  if (!centerData) return { allowed: true, reason: 'trial', daysLeft: TRIAL_DAYS };
  
  const status = centerData?.subscription?.status;

  if (status === 'active') {
    const expiry = centerData?.subscription?.expiryDate;
    if (expiry) {
      const expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry);
      if (expiryDate < new Date()) {
        return { allowed: false, reason: 'expired', message: 'انتهت صلاحية اشتراكك. تواصل معنا لتجديده.' };
      }
    }
    return { allowed: true, reason: 'active' };
  }

  if (status === 'suspended') {
    return { allowed: false, reason: 'suspended', message: 'تم إيقاف حسابك. تواصل مع الدعم.' };
  }

  if (status === 'trial' || !status) {
    const expiry = centerData?.subscription?.trialExpiry;
    if (expiry) {
      const expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry);
      const now = new Date();
      if (expiryDate < now) {
        return { allowed: false, reason: 'trial_expired', message: 'انتهت فترة التجربة المجانية.' };
      }
      const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      return { allowed: true, reason: 'trial', daysLeft };
    }
    return { allowed: true, reason: 'trial', daysLeft: TRIAL_DAYS };
  }

  return { allowed: true, reason: 'trial', daysLeft: TRIAL_DAYS };
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const centerRef = doc(db, 'centers', user.uid);
  const centerDoc = await getDoc(centerRef);
  const isNew = !centerDoc.exists();

  if (isNew) {
    await setDoc(centerRef, {
      centerId: user.uid,
      managerId: user.uid,
      managerEmail: user.email,
      ownerEmail: user.email,
      managerName: user.displayName,
      managerPhoto: user.photoURL,
      name: '', centerName: '', type: '', phone: '', logo: '', logoUrl: '',
      color: '#1a56db',
      currency: 'SAR',
      createdAt: serverTimestamp(),
      isSetup: false,
      setupCompleted: false,
      status: 'pending_setup',
      subscription: {
        status: 'trial',
        trialExpiry: getTrialExpiry(),
        createdAt: serverTimestamp()
      }
    });
  }

  const data = isNew ? null : centerDoc.data();
  const subStatus = checkSubscriptionStatus(data);
  const needsSetup = isNew || data?.status === 'pending_setup' || !data?.setupCompleted || !data?.isSetup;

  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || 'المدير',
    photo: user.photoURL,
    role: 'manager',
    centerId: user.uid,
    isNewCenter: isNew,
    needsSetup,
    subscription: subStatus,
  };
}

export async function signInWithCredentials(username, password) {
  const q = query(collection(db, 'users'), where('username', '==', username.trim()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) throw new Error('اسم المستخدم غير موجود');

  const userData = snapshot.docs[0].data();
  if (userData.password !== password) throw new Error('كلمة المرور غير صحيحة');
  if (userData.active === false) throw new Error('هذا الحساب معطّل. تواصل مع المدير.');

  const centerDoc = await getDoc(doc(db, 'centers', userData.centerId));
  const subStatus = checkSubscriptionStatus(centerDoc.data());

  if (!subStatus.allowed) {
    throw new Error(subStatus.message || 'انتهى اشتراك المركز. تواصل مع المدير.');
  }

  return {
    uid: snapshot.docs[0].id,
    email: userData.email || '',
    name: userData.name,
    username: userData.username,
    role: userData.role,
    centerId: userData.centerId,
    permissions: userData.permissions || {},
    subscription: subStatus,
    isNewCenter: false
  };
}

export async function signOutUser() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
