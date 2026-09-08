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
// نفس منطق إنشاء المركز في signInWithGoogle بالضبط، مع فترة 5 أيام تجريبية كاملة.
// ============================================================
export async function signUpManagerWithEmailPassword(emailOrOptions, passwordArg, managerNameArg, centerNameArg) {
  let email, password, managerName, centerName;
  if (typeof emailOrOptions === 'object' && emailOrOptions !== null) {
    email = emailOrOptions.email;
    password = emailOrOptions.password;
    managerName = emailOrOptions.managerName;
    centerName = emailOrOptions.centerName;
  } else {
    email = emailOrOptions;
    password = passwordArg;
    managerName = managerNameArg;
    centerName = centerNameArg;
  }

  const trimmedEmail = (email || '').trim();
  if (!trimmedEmail) throw new Error('يرجى إدخال بريد إلكتروني صحيح');
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
  const cName = (centerName || '').trim();
  const mName = (managerName || '').trim();

  await setDoc(doc(db, 'centers', user.uid), {
    centerId: user.uid,
    managerId: user.uid,
    managerEmail: user.email,
    ownerEmail: user.email,
    managerName: mName,
    name: cName,
    centerName: cName,
    type: 'مركز تأهيل وتربية خاصة',
    phone: '',
    logo: '',
    logoUrl: '',
    color: '#1a56db',
    currency: 'SAR',
    createdAt: serverTimestamp(),
    isSetup: Boolean(cName),
    setupCompleted: Boolean(cName),
    status: 'active',
    subscription: {
      status: 'trial',
      trialExpiry: getTrialExpiry(),
      createdAt: serverTimestamp(),
    },
  });

  // حفظ العميل المحتمل في سجلات المنصة للمتابعة والتواصل
  try {
    saveTrialLead({
      name: mName || 'مدير جديد',
      email: user.email,
      org: cName || 'مركز جديد',
      type: 'registered_trial',
      note: 'تسجيل حساب مركز جديد تجريبي (5 أيام)',
    }).catch(() => {});
  } catch (_) {}

  return {
    uid: user.uid,
    email: user.email,
    name: mName || 'المدير',
    role: 'manager',
    centerId: user.uid,
    isNewCenter: !cName,
    needsSetup: !cName,
    subscription: { allowed: true, reason: 'trial', status: 'trial', daysLeft: TRIAL_DAYS },
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

// ============================================================
// إدارة طلبات تجربة الديمو والعملاء المحتملين (Trial Leads)
// ============================================================

/**
 * حفظ بيانات العميل المحتمل عند طلب تجربة ديمو أو تسجيل تجريبي
 */
export async function saveTrialLead({ name, email, phone, org, note = '', type = 'demo_request' }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();
  const cleanPhone = (phone || '').trim();
  const cleanOrg = (org || '').trim();

  const leadData = {
    id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    org: cleanOrg,
    note,
    type,
    status: 'new', // new | contacted | converted | closed
    createdAt: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  // 1) حفظ محلي كنسخة احتياطية سريعة وموثوقة دائماً
  try {
    const localLeads = JSON.parse(localStorage.getItem('scs_trial_leads_backup') || '[]');
    localLeads.unshift(leadData);
    localStorage.setItem('scs_trial_leads_backup', JSON.stringify(localLeads.slice(0, 200)));
  } catch (_) {}

  // 2) حفظ في سحابة Firestore في كولكشن trialLeads
  try {
    await setDoc(doc(db, 'trialLeads', leadData.id), {
      ...leadData,
      serverTime: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Could not write lead to Firestore, saved to local backup:', err);
  }

  return leadData;
}

/**
 * جلب قائمة العملاء المحتملين لمالك المنصة من السحابة والنسخ الاحتياطية
 */
export async function getTrialLeads() {
  const leadsMap = new Map();

  // جلب النسخة المحلية أولاً
  try {
    const localLeads = JSON.parse(localStorage.getItem('scs_trial_leads_backup') || '[]');
    for (const item of localLeads) {
      if (item.id) leadsMap.set(item.id, item);
    }
  } catch (_) {}

  // جلب من Firestore
  try {
    const snap = await getDocs(collection(db, 'trialLeads'));
    snap.forEach(d => {
      const data = d.data();
      leadsMap.set(d.id, { id: d.id, ...data });
    });
  } catch (err) {
    console.warn('getTrialLeads Firestore read note:', err);
  }

  const allLeads = Array.from(leadsMap.values());
  allLeads.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : (a.serverTime?.seconds ? a.serverTime.seconds * 1000 : 0);
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : (b.serverTime?.seconds ? b.serverTime.seconds * 1000 : 0);
    return dateB - dateA;
  });

  return allLeads;
}

/**
 * تحديث حالة متابعة العميل المحتمل (مثلاً: تم التواصل أو تم التحويل)
 */
export async function updateTrialLeadStatus(leadId, status, notes = '') {
  try {
    const localLeads = JSON.parse(localStorage.getItem('scs_trial_leads_backup') || '[]');
    const updated = localLeads.map(l => l.id === leadId ? { ...l, status, adminNotes: notes, updatedAt: new Date().toISOString() } : l);
    localStorage.setItem('scs_trial_leads_backup', JSON.stringify(updated));
  } catch (_) {}

  try {
    await setDoc(doc(db, 'trialLeads', leadId), {
      status,
      adminNotes: notes,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('updateTrialLeadStatus firestore note:', e);
  }
}

/**
 * حذف عميل محتمل من القائمة
 */
export async function deleteTrialLead(leadId) {
  try {
    const localLeads = JSON.parse(localStorage.getItem('scs_trial_leads_backup') || '[]');
    const filtered = localLeads.filter(l => l.id !== leadId);
    localStorage.setItem('scs_trial_leads_backup', JSON.stringify(filtered));
  } catch (_) {}

  try {
    await deleteDoc(doc(db, 'trialLeads', leadId));
  } catch (e) {
    console.warn('deleteTrialLead firestore note:', e);
  }
}

/**
 * بدء جلسة ديمو تفاعلية فورية للعميل المحتمل مع تهيئة البيانات النموذجية
 */
export async function startDemoSession({ name, email, phone, org }) {
  // 1) حفظ العميل فوراً لمتابعة المبيعات
  await saveTrialLead({
    name: name || 'زائر تجريبي',
    email,
    phone,
    org,
    type: 'interactive_demo',
    note: 'بدء تجربة تفاعلية سريعة للديمو',
  });

  // 2) تهيئة البيانات التجريبية الغنية
  const { initDemoData } = await import('../utils/demoData');
  initDemoData('demo_center', name || org, org || 'مركز الأمل للتأهيل', 5);

  // 3) كائن المستخدم التجريبي
  const demoUser = {
    uid: 'demo_user_' + Date.now(),
    email: email || 'demo@easycenter.local',
    name: name || 'زائر تجريبي',
    role: 'manager',
    centerId: 'demo_center',
    isDemo: true,
    demoVisitor: { name, email, phone, org },
    needsSetup: false,
    isNewCenter: false,
    subscription: {
      allowed: true,
      reason: 'demo',
      status: 'trial',
      daysLeft: 5,
      isDemo: true,
    },
  };

  return demoUser;
}

// ============================================================
// إدارة الحسابات التجريبية المؤقتة (Admin Created Demo Accounts)
// يُنشئها مالك المنصة للمؤسسات أو العملاء مع تحديد اسم المستخدم،
// كلمة المرور، ومدة الصلاحية بالأيام (3، 4، 5 أيام ...إلخ) يدوياً.
// ============================================================

export async function createAdminDemoAccount({
  centerName,
  managerName,
  username,
  password,
  durationDays = 3,
  phone = '',
  notes = '',
  seedData = true,
}) {
  const cleanUsername = (username || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  if (!cleanUsername) throw new Error('يرجى إدخال اسم مستخدم صحيح باللغة الإنجليزية أو بريد إلكتروني');
  if (!password || password.length < 3) throw new Error('يرجى إدخال كلمة مرور (3 أحرف على الأقل)');
  const days = Math.max(1, parseInt(durationDays, 10) || 3);

  const now = new Date();
  const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const demoCenterId = `demo_ctr_${cleanUsername}`;
  const demoId = `demo_${cleanUsername}`;

  const demoDoc = {
    id: demoId,
    demoId,
    centerId: demoCenterId,
    username: cleanUsername,
    password: password.trim(),
    centerName: (centerName || 'مركز تجريبي').trim(),
    managerName: (managerName || 'مدير تجريبي').trim(),
    phone: (phone || '').trim(),
    notes: (notes || '').trim(),
    durationDays: days,
    createdAt: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    status: 'active', // 'active' | 'suspended' | 'expired'
  };

  // 1) حفظ محلياً في localStorage كنسخة فورية
  try {
    const existing = JSON.parse(localStorage.getItem('scs_demo_accounts') || '[]');
    const filtered = existing.filter(d => d.username !== cleanUsername);
    localStorage.setItem('scs_demo_accounts', JSON.stringify([demoDoc, ...filtered]));
  } catch (_) {}

  // 2) حفظ في Firestore في كولكشن demoAccounts
  try {
    await setDoc(doc(db, 'demoAccounts', cleanUsername), {
      ...demoDoc,
      createdAtServer: serverTimestamp(),
    });
  } catch (e) {
    console.warn('createAdminDemoAccount firestore note:', e);
  }

  // 3) تجهيز البيانات النموذجية للمركز إذا طُلب ذلك
  if (seedData) {
    const { initDemoData } = await import('../utils/demoData');
    initDemoData(demoCenterId, managerName, centerName, days);
  }

  return demoDoc;
}

export async function getAdminDemoAccounts() {
  const accountsMap = new Map();

  // 1. جلب من localStorage
  try {
    const local = JSON.parse(localStorage.getItem('scs_demo_accounts') || '[]');
    local.forEach(item => {
      if (item && item.username) accountsMap.set(item.username, item);
    });
  } catch (_) {}

  // 2. جلب من Firestore
  try {
    const snap = await getDocs(collection(db, 'demoAccounts'));
    snap.docs.forEach(d => {
      const data = d.data();
      if (data && data.username) accountsMap.set(data.username, { id: d.id, ...data });
    });
  } catch (e) {
    console.warn('getAdminDemoAccounts firestore error:', e);
  }

  const list = Array.from(accountsMap.values());
  // فرز حسب تاريخ الإنشاء (الأحدث أولاً)
  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return list;
}

export async function extendAdminDemoAccount(usernameOrId, additionalDays) {
  const daysToAdd = parseInt(additionalDays, 10) || 3;
  const accounts = await getAdminDemoAccounts();
  const acc = accounts.find(a => a.username === usernameOrId || a.id === usernameOrId);
  if (!acc) throw new Error('الحساب التجريبي غير موجود');

  // حساب تاريخ الانتهاء الجديد
  const currentExpiry = new Date(acc.expiryDate);
  const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
  const newExpiry = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  const updated = {
    ...acc,
    expiryDate: newExpiry.toISOString(),
    status: 'active',
    durationDays: (acc.durationDays || 0) + daysToAdd,
    updatedAt: new Date().toISOString(),
  };

  // تحديث محلي
  try {
    const local = JSON.parse(localStorage.getItem('scs_demo_accounts') || '[]');
    const newLocal = local.map(a => a.username === acc.username ? updated : a);
    localStorage.setItem('scs_demo_accounts', JSON.stringify(newLocal));
  } catch (_) {}

  // تحديث Firestore
  try {
    await setDoc(doc(db, 'demoAccounts', acc.username), {
      ...updated,
      updatedAtServer: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('extendAdminDemoAccount firestore note:', e);
  }

  return updated;
}

export async function updateAdminDemoAccountStatus(usernameOrId, status) {
  const accounts = await getAdminDemoAccounts();
  const acc = accounts.find(a => a.username === usernameOrId || a.id === usernameOrId);
  if (!acc) throw new Error('الحساب غير موجود');

  const updated = { ...acc, status, updatedAt: new Date().toISOString() };

  try {
    const local = JSON.parse(localStorage.getItem('scs_demo_accounts') || '[]');
    const newLocal = local.map(a => a.username === acc.username ? updated : a);
    localStorage.setItem('scs_demo_accounts', JSON.stringify(newLocal));
  } catch (_) {}

  try {
    await setDoc(doc(db, 'demoAccounts', acc.username), {
      status,
      updatedAtServer: serverTimestamp(),
    }, { merge: true });
  } catch (_) {}

  return updated;
}

export async function deleteAdminDemoAccount(usernameOrId) {
  try {
    const local = JSON.parse(localStorage.getItem('scs_demo_accounts') || '[]');
    const filtered = local.filter(a => a.username !== usernameOrId && a.id !== usernameOrId);
    localStorage.setItem('scs_demo_accounts', JSON.stringify(filtered));
  } catch (_) {}

  try {
    await deleteDoc(doc(db, 'demoAccounts', usernameOrId));
  } catch (_) {}
}

export async function authenticateDemoAccount(usernameOrEmail, password) {
  const clean = (usernameOrEmail || '').trim().toLowerCase();
  const pass = (password || '').trim();
  if (!clean || !pass) return null;

  // جلب الحساب من الكولكشن أو الكاش المحلي
  let demoDoc = null;
  try {
    const snap = await getDoc(doc(db, 'demoAccounts', clean));
    if (snap.exists()) {
      demoDoc = snap.data();
    }
  } catch (_) {}

  if (!demoDoc) {
    const local = JSON.parse(localStorage.getItem('scs_demo_accounts') || '[]');
    demoDoc = local.find(a => (a.username || '').toLowerCase() === clean);
  }

  if (!demoDoc) return null; // ليس حساب ديمو

  // فحص كلمة المرور
  if (demoDoc.password !== pass) {
    throw new Error('كلمة المرور غير صحيحة لهذا الحساب التجريبي');
  }

  // فحص حالة الحساب والصلاحية الزمنية (3 أيام، 5 أيام...)
  const expiry = new Date(demoDoc.expiryDate);
  const now = new Date();
  const isExpired = expiry <= now || demoDoc.status === 'expired';

  if (demoDoc.status === 'suspended') {
    throw new Error('تم إيقاف هذا الحساب التجريبي المؤقت من قبل إدارة المنصة.');
  }

  if (isExpired) {
    throw new Error(`انتهت فترة صلاحية هذا الحساب التجريبي المؤقت (المحددة بـ ${demoDoc.durationDays || 3} أيام من إدارة المنصة). يرجى التواصل مع الإدارة للاشتراك وتجديد الحساب.`);
  }

  const daysLeft = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));

  // تهيئة وتأكيد وجود بيانات الديمو
  const { initDemoData } = await import('../utils/demoData');
  initDemoData(demoDoc.centerId, demoDoc.managerName, demoDoc.centerName, daysLeft);

  return {
    uid: demoDoc.centerId,
    email: demoDoc.username.includes('@') ? demoDoc.username : `${demoDoc.username}@easycenter.demo`,
    name: demoDoc.managerName || 'مدير تجريبي',
    role: 'manager',
    centerId: demoDoc.centerId,
    isDemo: true,
    demoAccount: {
      ...demoDoc,
      daysLeft,
    },
    subscription: {
      allowed: true,
      status: 'trial',
      reason: 'admin_demo',
      daysLeft,
      isDemo: true,
      expiryDate: demoDoc.expiryDate,
    },
  };
}


