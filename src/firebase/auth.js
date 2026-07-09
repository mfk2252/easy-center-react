import { signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';

const TRIAL_DAYS = 200;
export const ADMIN_EMAIL = 'mfekry225@gmail.com'; // تأكد أنه نفس الإيميل الذي تستخدمه للدخول

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
    let expiryDate = null;
    const expiry = centerData?.subscription?.trialExpiry;
    if (expiry) {
      expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry);
    } else if (centerData?.createdAt) {
      const created = centerData.createdAt.toDate ? centerData.createdAt.toDate() : new Date(centerData.createdAt);
      expiryDate = new Date(created);
      expiryDate.setDate(expiryDate.getDate() + TRIAL_DAYS);
    }

    if (expiryDate) {
      const now = new Date();
      if (expiryDate <= now) {
        return { allowed: false, reason: 'trial_expired', message: 'انتهت فترة التجربة المجانية.' };
      }
      const daysLeft = Math.max(1, Math.ceil((expiryDate - now) / 86400000));
      return { allowed: true, reason: 'trial', daysLeft, trialExpiry: expiryDate.toISOString() };
    }
    return { allowed: true, reason: 'trial', daysLeft: TRIAL_DAYS };
  }

  return { allowed: true, reason: 'trial', daysLeft: TRIAL_DAYS };
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // فحص الحصانة (Super Admin)
  if (user.email === ADMIN_EMAIL) {
    return {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'المدير',
      photo: user.photoURL,
      role: 'manager',
      centerId: user.uid,
      isNewCenter: false,
      needsSetup: false,
      subscription: { allowed: true, reason: 'super_admin' },
    };
  }

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

/** رسائل خطأ عربية مفهومة بدلاً من رموز Firebase التقنية */
function mapAuthError(code) {
  const map = {
    'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'auth/user-not-found': 'لا يوجد حساب بهذا البريد الإلكتروني',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة',
    'auth/too-many-requests': 'محاولات فاشلة كثيرة، حاول مرة أخرى لاحقاً',
    'auth/network-request-failed': 'تحقق من اتصال الإنترنت وحاول مجدداً',
    'auth/user-disabled': 'هذا الحساب معطّل',
  };
  return map[code] || 'تعذّر تسجيل الدخول، حاول مرة أخرى';
}

/**
 * دخول مالك المنصة (Super Admin) عبر البريد وكلمة المرور — Firebase Email/Password.
 * هذا المسار مخصص حصراً لصاحب المنصة (ADMIN_EMAIL) وليس بديلاً عن دخول مديري المراكز.
 * يتطلب: تفعيل Email/Password من Firebase Console وإنشاء المستخدم يدوياً هناك أولاً.
 */
export async function signInWithEmailPassword(email, password) {
  let result;
  try {
    result = await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (e) {
    throw new Error(mapAuthError(e?.code));
  }

  const user = result.user;

  if (user.email !== ADMIN_EMAIL) {
    // هذا المسار مخصص لمالك المنصة فقط في هذه المرحلة
    await signOut(auth);
    throw new Error('هذا الحساب غير مصرّح له بالدخول من هنا');
  }

  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || 'مالك المنصة',
    role: 'manager',
    centerId: user.uid,
    isPlatformAdmin: true,
    subscription: { allowed: true, reason: 'platform_admin' },
    _skipWelcome: true,
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
