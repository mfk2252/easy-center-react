# التعديلات الجديدة (28 ملفاً) — فوق نسخة "بعد_عدة_تعديلات_مستقرة"

انسخ كل ملف إلى نفس مساره في المستودع (تحل محل الموجود). ملف واحد جديد: `src/utils/syncReconcile.js`.
`firestore.rules` لم يتغير في هذه الحزمة (نُشر سابقاً).

## البند 5 — الصور والمرفقات
- src/utils/fileUpload.js (ضغط الصور تلقائياً + حد 500KB للمستندات + رسالة موحّدة)
- src/i18n/translations.js, src/components/ui/AttachmentField.jsx
- src/pages/Calendar.jsx, Programs.jsx, Students/index.jsx, HR/EmployeesList.jsx
- src/pages/Center/index.jsx, Students/StudentDetail.jsx, components/assessments/InitialAssessmentModal.jsx
- src/utils/syncFailures.js + src/hooks/useStorage.js (تنبيه امتلاء ذاكرة المتصفح)

## البند 7 — المزامنة لا تُعيد المحذوف
- src/utils/syncReconcile.js (جديد), src/firebase/db.js (fbGetAllStrict),
  src/utils/offlineQueue.js (getPendingOps), src/hooks/useStorage.js

## البند 6 — حذف الموظف وإعادة استخدام اسم المستخدم
- src/firebase/auth.js (بريد Auth داخلي فريد لكل حساب)

## تاريخ اليوم (UTC → محلي)
- src/utils/dateHelpers.js (localDateStr / parseLocalDate / todayStr)
- src/pages/Attendance/index.jsx, HR/Leaves.jsx, Center/AcademicYearsManager.jsx
- src/components/dashboard/VisualAnalyticsHub.jsx
- 6 ملفات في src/components/assessments/ (Leiter3, Raven, SensoryChecklist, SensoryIntegration x2, StanfordBinet5)

## تنظيف
- src/context/AppContext.jsx (حذف استيراد غير مستخدم)

## بعد الرفع
npm run build  ثم اختبر: مدير / استقبال / ولي أمر / مالك المنصة.
