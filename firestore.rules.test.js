import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';

const PROJECT_ID = 'specialed-pro-test';
let testEnv;

describe('اختبارات قواعد أمان Firebase (Firestore Security Rules Unit Tests)', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();

    // تهيئة البيانات الأساسية في قاعدة البيانات بدون تطبيق قواعد الأمان
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      // إنشاء مركز تجريبي
      await setDoc(doc(db, 'centers', 'center123'), {
        name: 'مركز الأمل للتربية الخاصة',
        subscription: { status: 'active' },
      });

      // بيانات موظف الاستقبال في مجموعة users
      await setDoc(doc(db, 'users', 'receptionist_uid'), {
        centerId: 'center123',
        role: 'reception',
        active: true,
      });

      // بيانات ولي الأمر في مجموعة users والمرتبط بالطفل student1
      await setDoc(doc(db, 'users', 'parent_uid'), {
        centerId: 'center123',
        role: 'parent',
        studentId: 'student1',
        active: true,
      });

      // إنشاء طالب أول (خاص بولي الأمر) وطالب ثاني (طالب آخر)
      await setDoc(doc(db, 'centers/center123/students', 'student1'), {
        name: 'أحمد علي',
        age: 8,
      });
      await setDoc(doc(db, 'centers/center123/students', 'student2'), {
        name: 'سارة محمد',
        age: 10,
      });

      // إنشاء سجل رواتب
      await setDoc(doc(db, 'centers/center123/salaries', 'sal1'), {
        employeeName: 'محمد أحمد',
        amount: 5000,
      });
    });
  });

  // -------------------------------------------------------------
  // السيناريو الأول: حساب مدير المركز (Center Director)
  // -------------------------------------------------------------
  it('1. حساب مدير المركز: إمكانية قراءة بيانات المركز بالكامل بنجاح', async () => {
    const directorDb = testEnv.authenticatedContext('center123').firestore();

    // قراءة وثيقة المركز
    const centerDocRef = doc(directorDb, 'centers', 'center123');
    await assertSucceeds(getDoc(centerDocRef));

    // قراءة بيانات الطلاب داخل المركز
    const studentDocRef = doc(directorDb, 'centers/center123/students', 'student1');
    await assertSucceeds(getDoc(studentDocRef));
  });

  // -------------------------------------------------------------
  // السيناريو الثاني: حساب موظف الاستقبال (Receptionist)
  // -------------------------------------------------------------
  it('2. حساب موظف الاستقبال: إضافة طالب جديد بنجاح، ومنع الوصول لبيانات الرواتب', async () => {
    const receptionistDb = testEnv.authenticatedContext('receptionist_uid').firestore();

    // 2.1 إضافة طالب جديد بنجاح
    const newStudentRef = doc(receptionistDb, 'centers/center123/students', 'student_new');
    await assertSucceeds(
      setDoc(newStudentRef, {
        name: 'خالد عبد الله',
        age: 7,
      })
    );

    // 2.2 منع القراءة أو الكتابة في مسار الرواتب (Salaries)
    const salaryDocRef = doc(receptionistDb, 'centers/center123/salaries', 'sal1');
    await assertFails(getDoc(salaryDocRef));
    await assertFails(
      setDoc(salaryDocRef, {
        employeeName: 'اختبار محاولة تعديل',
        amount: 9000,
      })
    );
  });

  // -------------------------------------------------------------
  // السيناريو الثالث: حساب ولي الأمر (Parent / Guardian)
  // -------------------------------------------------------------
  it('3. حساب ولي الأمر: رؤية بيانات طفله فقط ومنع الوصول لبيانات باقي الطلاب', async () => {
    const parentDb = testEnv.authenticatedContext('parent_uid').firestore();

    // 3.1 السماح بقراءة بيانات طفله المرتبط بحسابه (student1)
    const ownKidRef = doc(parentDb, 'centers/center123/students', 'student1');
    await assertSucceeds(getDoc(ownKidRef));

    // 3.2 منع الوصول لقراءة بيانات طالب آخر (student2)
    const otherKidRef = doc(parentDb, 'centers/center123/students', 'student2');
    await assertFails(getDoc(otherKidRef));
  });

  // -------------------------------------------------------------
  // السيناريو الرابع: حساب مالك المنصة (Platform Owner / Super Admin)
  // -------------------------------------------------------------
  it('4. حساب مالك المنصة: التحقق من الوصول الشامل وقراءة قائمة المراكز', async () => {
    // تسجيل الدخول بحساب مالك المنصة المعرف في قواعد الأمان بواسطة UID الخاص به
    const adminDb = testEnv.authenticatedContext('jebFuJKEFBOYjd864sgtXPIEoY43').firestore();

    // قراءة قائمة المراكز
    const centersRef = collection(adminDb, 'centers');
    await assertSucceeds(getDocs(centersRef));

    // قراءة وثيقة مركز معين
    const centerDocRef = doc(adminDb, 'centers', 'center123');
    await assertSucceeds(getDoc(centerDocRef));
  });
});
