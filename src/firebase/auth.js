import { initializeApp, deleteApp } from 'firebase/app';
import {
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  getAuth, signOut, onAuthStateChanged
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs,
  serverTimestamp, Timestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, firebaseConfig } from './config';

const TRIAL_DAYS = 5;
export const ADMIN_EMAIL = 'mfk2252@gmail.com'; // إيميل Google الخاص بمالك المنصة

// بريد مخصص فقط لتسجيل دخول مالك المنصة عبر Email/Password (لأن ADMIN_EMAIL أعلاه
// مرتبط فعلياً بحساب Google، وFirebase لا يسمح بربط طريقة دخول ثانية بنفس البريد
// افتراضياً). غيّر هذه القيمة إن أردت، بشرط إنشاء نفس القيمة حرفياً في Firebase Console.
export const PLATFORM_ADMIN_LOGIN_EMAIL = 'admin.owner@easycenter.local';

/** يتحقق أن هذا البريد يخص مالك المنصة، سواء عبر Google أو Email/Password. */
export function isPlatformAdminEmail(email) {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return e === 'mfk2252@gmail.com' || e === 'mfekry225@gmail.com' || e === PLATFORM_ADMIN_LOGIN_EMAIL;
}

function getTrialExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + TRIAL_DAYS);
  return Timestamp.fromDate(date);
}

export function checkSubscriptionStatus(centerData) {
  if (!centerData) {
    const fallbackDate = new Date();
    const trialExp = new Date();
    trialExp.setDate(trialExp.getDate() + TRIAL_DAYS);
    return {
      allowed: true,
      reason: 'trial',
      status: 'trial',
      daysLeft: TRIAL_DAYS,
      trialExpiry: trialExp.toISOString(),
      expiryDate: trialExp.toISOString(),
      activatedAt: fallbackDate.toISOString(),
    };
  }

  const sub = centerData?.subscription || {};
  const status = sub?.status;

  if (status === 'active') {
    const expiry = sub?.expiryDate;
    let daysLeft = null;
    let expiryDate = null;
    if (expiry) {
      expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry?.seconds ? expiry.seconds * 1000 : expiry);
      if (expiryDate < new Date()) {
        return {
          allowed: false,
          reason: 'expired',
          status: 'expired',
          message: 'انتهت صلاحية اشتراكك. تواصل معنا لتجديده.',
          activatedAt: sub?.activatedAt || centerData?.createdAt,
          expiryDate: expiryDate,
          months: sub?.months,
          isPermanent: !!sub?.isPermanent,
          daysLeft: 0,
        };
      }
      daysLeft = Math.max(0, Math.ceil((expiryDate - new Date()) / 86400000));
    }
    return {
      allowed: true,
      reason: 'active',
      status: 'active',
      activatedAt: sub?.activatedAt || centerData?.createdAt,
      expiryDate: expiryDate,
      months: sub?.months,
      isPermanent: !!sub?.isPermanent,
      daysLeft: sub?.isPermanent ? 9999 : daysLeft,
    };
  }

  if (status === 'suspended') {
    return {
      allowed: false,
      reason: 'suspended',
      status: 'suspended',
      message: 'تم إيقاف حسابك. تواصل مع الدعم.',
      activatedAt: sub?.activatedAt || centerData?.createdAt,
      expiryDate: sub?.expiryDate,
      months: sub?.months,
      daysLeft: 0,
    };
  }

  if (status === 'trial' || !status) {
    let expiryDate = null;
    const expiry = sub?.trialExpiry;
    if (expiry) {
      expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry?.seconds ? expiry.seconds * 1000 : expiry);
    } else if (centerData?.createdAt) {
      const created = centerData.createdAt.toDate ? centerData.createdAt.toDate() : new Date(centerData.createdAt?.seconds ? centerData.createdAt.seconds * 1000 : centerData.createdAt);
      expiryDate = new Date(created);
      expiryDate.setDate(expiryDate.getDate() + TRIAL_DAYS);
    }

    const activatedAt = sub?.createdAt || centerData?.createdAt || new Date();

    if (expiryDate) {
      const now = new Date();
      if (expiryDate <= now) {
        return {
          allowed: false,
          reason: 'trial_expired',
          status: 'expired',
          message: 'انتهت فترة التجربة المجانية.',
          activatedAt,
          trialExpiry: expiryDate,
          expiryDate: expiryDate,
          daysLeft: 0,
        };
      }
      const daysLeft = Math.max(1, Math.ceil((expiryDate - now) / 86400000));
      return {
        allowed: true,
        reason: 'trial',
        status: 'trial',
        daysLeft,
        trialExpiry: expiryDate,
        expiryDate: expiryDate,
        activatedAt,
      };
    }
    return {
      allowed: true,
      reason: 'trial',
      status: 'trial',
      daysLeft: TRIAL_DAYS,
      activatedAt,
    };
  }

  return { allowed: true, reason: 'trial', status: 'trial', daysLeft: TRIAL_DAYS };
}

/** رسائل خطأ عربية مفهومة بدلاً من رموز Firebase التقنية */
function mapAuthError(code) {
  const map = {
    'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'auth/user-not-found': 'لا يوجد حساب بهذه البيانات',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة',
    'auth/too-many-requests': 'محاولات فاشلة كثيرة، حاول مرة أخرى لاحقاً',
    'auth/network-request-failed': 'تحقق من اتصال الإنترنت وحاول مجدداً',
    'auth/user-disabled': 'هذا الحساب معطّل',
    'auth/email-already-in-use': 'اسم المستخدم هذا مستخدم بالفعل، اختر اسماً آخر',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً، استخدم 6 أحرف على الأقل',
  };
  return map[code] || 'تعذّر تسجيل الدخول، حاول مرة أخرى';
}

// ============================================================
// دخول مدير المركز عبر Google
// ============================================================
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // فحص الحصانة (Super Admin)
  if (isPlatformAdminEmail(user.email)) {
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

// ============================================================
// دخول مالك المنصة أو مدير مركز (عائد بالفعل) عبر Email/Password
// ⚠️ هذا المسار للدخول فقط، وليس لإنشاء مركز جديد. إنشاء مركز جديد عبر
// Email/Password غير مبني بعد — راجع الملاحظة في نهاية الملف.
// ============================================================
export async function signInWithEmailPassword(email, password) {
  let result;
  try {
    result = await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (e) {
    throw new Error(mapAuthError(e?.code));
  }

  const user = result.user;

  if (isPlatformAdminEmail(user.email)) {
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

  // مدير مركز عادي يدخل ببريد/كلمة مرور (بدل Google)
  const centerDoc = await getDoc(doc(db, 'centers', user.uid));
  if (!centerDoc.exists()) {
    await signOut(auth);
    throw new Error('لا يوجد مركز مرتبط بهذا الحساب. تواصل مع الدعم.');
  }

  const data = centerDoc.data();
  const subStatus = checkSubscriptionStatus(data);
  const needsSetup = data?.status === 'pending_setup' || !data?.setupCompleted || !data?.isSetup;

  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || data.name || data.centerName || 'المدير',
    role: 'manager',
    centerId: user.uid,
    isNewCenter: false,
    needsSetup,
    subscription: subStatus,
  };
}

// ============================================================
// تسجيل ذاتي لمدير مركز جديد عبر Email/Password (بديل لتسجيل Google الأول).
// نفس منطق إنشاء المركز في signInWithGoogle بالضبط، لكن بدون Google.
// ============================================================
export async function signUpManagerWithEmailPassword(email, password) {
  const trimmedEmail = email.trim();
  if (isPlatformAdminEmail(trimmedEmail)) {
    throw new Error('هذا البريد محجوز، لا يمكن استخدامه لإنشاء حساب مركز');
  }

  let result;
  try {
    result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
  } catch (e) {
    throw new Error(mapAuthError(e?.code));
  }

  const user = result.user;

  await setDoc(doc(db, 'centers', user.uid), {
    centerId: user.uid,
    managerId: user.uid,
    managerEmail: user.email,
    ownerEmail: user.email,
    managerName: '',
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
      createdAt: serverTimestamp(),
    },
  });

  return {
    uid: user.uid,
    email: user.email,
    name: 'المدير',
    role: 'manager',
    centerId: user.uid,
    isNewCenter: true,
    needsSetup: true,
    subscription: { allowed: true, reason: 'trial', daysLeft: TRIAL_DAYS },
  };
}

// ============================================================
// بناء البريد الداخلي الحقيقي لحساب موظف/ولي أمر (غير مرئي له إطلاقاً)
// ============================================================
function buildStaffAuthEmail(centerId, username) {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  return `${clean}@${centerId}.staff.easycenter.local`;
}

// ============================================================
// إنشاء حساب موظف/ولي أمر تابع لمركز المدير الحالي.
// يُستدعى من واجهة المدير وهو لا يزال مسجّلاً دخوله (جلسته لا تتأثر إطلاقاً)
// لأن إنشاء حساب Firebase Auth الجديد يتم عبر نسخة Firebase ثانوية مؤقتة.
// ============================================================
export async function createStaffAccount(managerCenterId, {
  username, password, name, role, permissions, title, studentId, phone, contactEmail,
}) {
  const cleanUsername = (username || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  if (!cleanUsername) throw new Error('أدخل اسم مستخدم صالح (أحرف/أرقام إنجليزية فقط)');
  if (!password || password.length < 6) throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');

  const authEmail = buildStaffAuthEmail(managerCenterId, cleanUsername);
  const indexRef = doc(db, 'staffLoginIndex', cleanUsername);

  // 1) حجز اسم المستخدم أولاً (يفشل تلقائياً لو كان مُستخدَماً من مركز آخر —
  //    بفضل قاعدة create/update في firestore.rules)
  try {
    await setDoc(indexRef, {
      centerId: managerCenterId,
      authEmail,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    throw new Error('اسم المستخدم هذا مستخدم بالفعل على المنصة، اختر اسماً آخر');
  }

  // 2) إنشاء حساب Firebase Auth عبر نسخة ثانوية مؤقتة (لا تؤثر على جلسة المدير)
  const secondaryApp = initializeApp(firebaseConfig, `staff-create-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  let newUid;
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, authEmail, password);
    newUid = cred.user.uid;
    await signOut(secondaryAuth);
  } catch (e) {
    // تراجع: احذف الحجز حتى لا يبقى اسم المستخدم محجوزاً بلا حساب فعلي
    try { await deleteDoc(indexRef); } catch (_) {}
    await deleteApp(secondaryApp);
    throw new Error(mapAuthError(e?.code));
  }
  await deleteApp(secondaryApp);

  // 3) كتابة ملف التعريف — عبر db الأساسي (جلسة المدير الحالية النشطة)
  try {
    await setDoc(doc(db, 'users', newUid), {
      centerId: managerCenterId,
      username: cleanUsername,
      authEmail,
      name: name || '',
      role: role || 'specialist',
      permissions: permissions || {},
      title: title || '',
      studentId: studentId || '',
      phone: phone || '',
      contactEmail: contactEmail || '',
      active: true,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    // تراجع كامل: احذف الحجز (حساب Auth اليتيم يبقى معطّلاً فعلياً لأن لا ملف
    // تعريف له، ولن يستطيع الدخول لأي بيانات بسبب قواعد Firestore)
    try { await deleteDoc(indexRef); } catch (_) {}
    throw new Error('تعذّر حفظ بيانات الحساب: ' + (e.message || ''));
  }

  return newUid;
}

// ============================================================
// دخول موظف/ولي أمر عبر اسم المستخدم البسيط (بدون @) — لا يعرف مركزه إطلاقاً،
// النظام يكتشفه تلقائياً عبر فهرس staffLoginIndex العام (قراءة فقط، لا كلمات مرور فيه).
// ============================================================
export async function signInStaffOrParent(username, password) {
  const cleanUsername = (username || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  if (!cleanUsername) throw new Error('يرجى إدخال اسم المستخدم');

  const idxSnap = await getDoc(doc(db, 'staffLoginIndex', cleanUsername));
  if (!idxSnap.exists()) throw new Error('اسم المستخدم غير موجود');
  const { authEmail } = idxSnap.data();

  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, authEmail, password);
  } catch (e) {
    throw new Error(mapAuthError(e?.code));
  }

  const profileSnap = await getDoc(doc(db, 'users', cred.user.uid));
  if (!profileSnap.exists()) {
    await signOut(auth);
    throw new Error('لم يتم العثور على بيانات هذا الحساب');
  }
  const profile = profileSnap.data();
  if (profile.active === false) {
    await signOut(auth);
    throw new Error('هذا الحساب معطّل. تواصل مع المدير.');
  }

  // نتحقق أيضاً من حالة اشتراك المركز نفسه (نفس المنطق المستخدم مع المدير)
  const centerDoc = await getDoc(doc(db, 'centers', profile.centerId));
  const subStatus = checkSubscriptionStatus(centerDoc.data());
  if (!subStatus.allowed) {
    await signOut(auth);
    throw new Error(subStatus.message || 'انتهى اشتراك المركز. تواصل مع المدير.');
  }

  return {
    uid: cred.user.uid,
    name: profile.name,
    username: profile.username,
    role: profile.role,
    centerId: profile.centerId,
    permissions: profile.permissions || {},
    studentId: profile.studentId || '',
    subscription: subStatus,
    isNewCenter: false,
  };
}

export async function signOutUser() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
