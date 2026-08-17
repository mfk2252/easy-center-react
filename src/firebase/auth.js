import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, query, where, getDocs,
} from 'firebase/firestore';
import { auth, db } from './config';

// ── Super-admin / platform admins ──
export const PLATFORM_ADMIN_EMAILS = [
  'mfk2252@gmail.com',
  'admin@specialcenter.com',
];

export function isPlatformAdminEmail(email) {
  if (!email) return false;
  return PLATFORM_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export const TRIAL_DAYS = 5;

export function isTrialActive(centerData) {
  const status = checkSubscriptionStatus(centerData);
  return status.allowed;
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
function mapAuthError(code, defaultMsg) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'اسم المستخدم أو كلمة المرور غير صحيحة';
    case 'auth/email-already-in-use':
      return 'اسم المستخدم أو البريد مستخدم مسبقاً، اختر اسماً آخر';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً — يجب أن تكون 6 أحرف على الأقل';
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صحيحة';
    case 'auth/too-many-requests':
      return 'تم حظر الدخول مؤقتاً لكثرة المحاولات الخاطئة. انتظر دقيقة وحاول مجدداً';
    case 'auth/network-request-failed':
      return 'تعذّر الاتصال بالإنترنت. تحقق من اتصالك وحاول مجدداً';
    default:
      return defaultMsg || 'حدث خطأ في المصادقة، يرجى المحاولة لاحقاً';
  }
}

function makeStaffVirtualEmail(username) {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  return `user_${clean}@staff.specialcenter.local`;
}

export async function loginWithUsernameOrEmail(identifier, password) {
  const id = identifier.trim();

  // 1) إذا كان المدخل بريداً إلكترونياً
  if (id.includes('@')) {
    try {
      const cred = await signInWithEmailAndPassword(auth, id, password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!userDoc.exists()) {
        const centerDocSnap = await getDoc(doc(db, 'centers', cred.user.uid));
        if (centerDocSnap.exists()) {
          const cData = centerDocSnap.data();
          const subStatus = checkSubscriptionStatus(cData);
          return {
            user: {
              uid: cred.user.uid,
              id: cred.user.uid,
              email: cred.user.email,
              name: cData.centerName || cData.name || 'مدير المركز',
              role: 'manager',
              centerId: cred.user.uid,
              isCenterOwner: true,
            },
            center: cData,
            subscriptionStatus: subStatus,
          };
        }
      } else {
        const uData = userDoc.data();
        if (uData.active === false) throw new Error('حسابك معطّل من قِبل إدارة المركز.');
        const centerDocSnap = await getDoc(doc(db, 'centers', uData.centerId));
        const cData = centerDocSnap.exists() ? centerDocSnap.data() : null;
        const subStatus = checkSubscriptionStatus(cData);
        return {
          user: { uid: cred.user.uid, id: userDoc.id, ...uData },
          center: cData,
          subscriptionStatus: subStatus,
        };
      }
      return { user: { uid: cred.user.uid, email: cred.user.email, role: 'manager' } };
    } catch (err) {
      if (err.code) throw new Error(mapAuthError(err.code, err.message));
      throw err;
    }
  }

  // 2) إذا كان المدخل اسم مستخدم
  const usernameClean = id.toLowerCase();
  let staffRecord = null;
  try {
    const idxSnap = await getDoc(doc(db, 'staffLoginIndex', usernameClean));
    if (idxSnap.exists()) {
      staffRecord = idxSnap.data();
    }
  } catch (_) {}

  if (!staffRecord) {
    try {
      const q = query(collection(db, 'users'), where('username', '==', usernameClean));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        staffRecord = { ...qSnap.docs[0].data(), docId: qSnap.docs[0].id };
      }
    } catch (_) {}
  }

  const virtualEmail = staffRecord?.authEmail || makeStaffVirtualEmail(usernameClean);

  try {
    const cred = await signInWithEmailAndPassword(auth, virtualEmail, password);
    let uData = null;
    let actualDocId = cred.user.uid;

    if (staffRecord?.docId) {
      const uSnap = await getDoc(doc(db, 'users', staffRecord.docId));
      if (uSnap.exists()) {
        uData = uSnap.data();
        actualDocId = uSnap.id;
      }
    }
    if (!uData) {
      const uSnap = await getDoc(doc(db, 'users', cred.user.uid));
      if (uSnap.exists()) {
        uData = uSnap.data();
        actualDocId = uSnap.id;
      }
    }
    if (!uData && staffRecord?.centerId) {
      const q = query(
        collection(db, 'users'),
        where('centerId', '==', staffRecord.centerId),
        where('username', '==', usernameClean)
      );
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        uData = qSnap.docs[0].data();
        actualDocId = qSnap.docs[0].id;
      }
    }

    if (uData && uData.active === false) {
      await fbSignOut(auth);
      throw new Error('حسابك معطّل من قِبل إدارة المركز.');
    }

    const cId = uData?.centerId || staffRecord?.centerId;
    let cData = null;
    let subStatus = { allowed: true, reason: 'trial' };
    if (cId) {
      try {
        const cSnap = await getDoc(doc(db, 'centers', cId));
        if (cSnap.exists()) {
          cData = cSnap.data();
          subStatus = checkSubscriptionStatus(cData);
        }
      } catch (_) {}
    }

    return {
      user: {
        uid: cred.user.uid,
        id: actualDocId,
        username: usernameClean,
        name: uData?.name || staffRecord?.name || usernameClean,
        role: uData?.role || staffRecord?.role || 'specialist',
        centerId: cId,
        permissions: uData?.permissions || {},
        ...(uData || {}),
      },
      center: cData,
      subscriptionStatus: subStatus,
    };
  } catch (err) {
    if (err.code) throw new Error(mapAuthError(err.code, err.message));
    throw err;
  }
}

export async function registerCenterWithEmail(centerName, email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const uid = cred.user.uid;

    const trialExp = new Date();
    trialExp.setDate(trialExp.getDate() + TRIAL_DAYS);

    const centerData = {
      centerId: uid,
      centerName: centerName.trim(),
      name: centerName.trim(),
      email: email.trim(),
      ownerUid: uid,
      createdAt: serverTimestamp(),
      isSetup: false,
      setupCompleted: false,
      subscription: {
        status: 'trial',
        trialExpiry: trialExp.toISOString(),
        createdAt: serverTimestamp(),
      },
    };

    await setDoc(doc(db, 'centers', uid), centerData);

    const userProfile = {
      uid,
      id: uid,
      email: email.trim(),
      name: centerName.trim(),
      role: 'manager',
      centerId: uid,
      isCenterOwner: true,
      active: true,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', uid), userProfile);

    return {
      user: userProfile,
      center: centerData,
      subscriptionStatus: { allowed: true, reason: 'trial', daysLeft: TRIAL_DAYS, trialExpiry: trialExp.toISOString() },
    };
  } catch (err) {
    if (err.code) throw new Error(mapAuthError(err.code, err.message));
    throw err;
  }
}

export async function createStaffAccount(centerId, staffData) {
  const { username, password, name, role, permissions, title, studentId, phone, contactEmail } = staffData;
  const cleanUsername = username.trim().toLowerCase();
  const virtualEmail = makeStaffVirtualEmail(cleanUsername);

  const idxSnap = await getDoc(doc(db, 'staffLoginIndex', cleanUsername));
  if (idxSnap.exists()) {
    throw new Error(`اسم المستخدم "${cleanUsername}" مستخدم بالفعل، اختر اسماً آخر.`);
  }

  let secondaryApp = null;
  let newUid = null;
  try {
    const { initializeApp, getApps, deleteApp } = await import('firebase/app');
    const { getAuth: getAuthSecondary, createUserWithEmailAndPassword: createUserSecondary } = await import('firebase/auth');
    const { firebaseConfig } = await import('./config');

    const appName = `SecondaryStaffCreator_${Date.now()}`;
    secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuthSecondary(secondaryApp);

    const cred = await createUserSecondary(secondaryAuth, virtualEmail, password);
    newUid = cred.user.uid;
    await deleteApp(secondaryApp);
    secondaryApp = null;
  } catch (err) {
    if (secondaryApp) {
      try {
        const { deleteApp } = await import('firebase/app');
        await deleteApp(secondaryApp);
      } catch (_) {}
    }
    if (err.code) throw new Error(mapAuthError(err.code, err.message));
    throw err;
  }

  const userDocData = {
    uid: newUid,
    username: cleanUsername,
    name: name.trim(),
    role: role || 'specialist',
    permissions: permissions || {},
    title: title || '',
    studentId: studentId || '',
    phone: phone || '',
    contactEmail: contactEmail || '',
    centerId,
    authEmail: virtualEmail,
    active: true,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', newUid), userDocData);

  await setDoc(doc(db, 'staffLoginIndex', cleanUsername), {
    uid: newUid,
    docId: newUid,
    username: cleanUsername,
    name: name.trim(),
    role: role || 'specialist',
    centerId,
    authEmail: virtualEmail,
    createdAt: serverTimestamp(),
  });

  return { id: newUid, ...userDocData };
}

export async function logoutUser() {
  await fbSignOut(auth);
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}
