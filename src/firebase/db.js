import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

// ===== Helper: مسار البيانات =====
// كل البيانات تحت: centers/{centerId}/{collection}
function centerCol(centerId, col) {
  return collection(db, 'centers', centerId, col);
}

function centerDoc(centerId, col, docId) {
  return doc(db, 'centers', centerId, col, docId);
}

// ===== CRUD عام =====

// قراءة كل المستندات
export async function fbGetAll(centerId, col) {
  try {
    const snap = await getDocs(centerCol(centerId, col));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    console.error(`fbGetAll ${col}:`, e);
    return [];
  }
}

// إضافة مستند جديد
export async function fbAdd(centerId, col, data) {
  try {
    const ref = await addDoc(centerCol(centerId, col), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return ref.id;
  } catch(e) {
    console.error(`fbAdd ${col}:`, e);
    throw e;
  }
}

// تحديث مستند
export async function fbUpdate(centerId, col, docId, data) {
  try {
    await updateDoc(centerDoc(centerId, col, docId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch(e) {
    console.error(`fbUpdate ${col}:`, e);
    throw e;
  }
}

// حذف مستند
export async function fbDelete(centerId, col, docId) {
  try {
    await deleteDoc(centerDoc(centerId, col, docId));
  } catch(e) {
    console.error(`fbDelete ${col}:`, e);
    throw e;
  }
}

// قراءة مستند واحد
export async function fbGetOne(centerId, col, docId) {
  try {
    const snap = await getDoc(centerDoc(centerId, col, docId));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  } catch(e) {
    console.error(`fbGetOne ${col}:`, e);
    return null;
  }
}

// ===== إعدادات المركز =====
export async function getCenterSettings(centerId) {
  try {
    const snap = await getDoc(doc(db, 'centers', centerId));
    if (snap.exists()) return snap.data();
    return null;
  } catch(e) {
    return null;
  }
}

export async function updateCenterSettings(centerId, data) {
  try {
    await updateDoc(doc(db, 'centers', centerId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch(e) {
    throw e;
  }
}

// ===== المستخدمون =====
export async function createUser(centerId, userData) {
  const userId = `${centerId}_${userData.username}`;
  await setDoc(doc(db, 'users', userId), {
    ...userData,
    centerId,
    active: true,
    createdAt: serverTimestamp()
  });
  return userId;
}

export async function getCenterUsers(centerId) {
  try {
    const q = query(collection(db, 'users'), where('centerId', '==', centerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    return [];
  }
}

export async function updateUser(userId, data) {
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteUser(userId) {
  await deleteDoc(doc(db, 'users', userId));
}

// ===== مزامنة من localStorage إلى Firestore =====
export async function migrateLocalToFirestore(centerId) {
  const collections = [
    'students', 'employees', 'sessions', 'appointments', 'iepGoals',
    'attStu', 'attEmp', 'income', 'expenses', 'salaries', 'leaves',
    'calEvents', 'centerActivities', 'parentInteractions', 'consultations',
    'evaluations', 'warnings', 'stuReports', 'behaviorPlans', 
    'studentFees', 'payments', 'notifs', 'manualAlerts'
  ];
  
  for (const col of collections) {
    try {
      const localData = JSON.parse(
        localStorage.getItem(col) || 
        localStorage.getItem('local_' + col) || 
        '[]'
      );
      
      if (localData.length > 0) {
        for (const item of localData) {
          const { id, ...rest } = item;
          if (id) {
            await setDoc(centerDoc(centerId, col, id), {
              ...rest,
              migratedAt: serverTimestamp()
            });
          }
        }
        console.log(`✅ Migrated ${localData.length} items from ${col}`);
      }
    } catch(e) {
      console.error(`Migration error for ${col}:`, e);
    }
  }
}
