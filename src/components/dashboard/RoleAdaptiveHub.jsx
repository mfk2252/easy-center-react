import { useState } from 'react';
import { lsGet } from '../../hooks/useStorage';

/**
 * محور التخصيص بحسب دور المستخدم (Role-Adaptive Dashboard)
 * متصل بنظام الإدارة الداخلية: الموظفين، الطلاب، المقاييس، وإدارة المركز
 * متوافق 100% مع الوضع الليلي، الوضع النهاري، والخطوط النظامية
 */
export default function RoleAdaptiveHub({ currentUser, data, today, go }) {
  const role = currentUser?.role || 'specialist';
  const emps = data.emps || [];
  const students = data.students || [];
  const sessions = data.sessions || [];
  const attEmp = data.attEmp || lsGet('attEmp') || [];
  const leaves = data.leaves || lsGet('leaves') || [];
  const appts = lsGet('appointments') || [];
  const studentAssessments = lsGet('studentAssessments') || [];
  const progEvaluations = lsGet('progEvaluations') || [];

  // وضع العرض: مخصص بحسب الدور أو عام
  const [viewMode, setViewMode] = useState('role'); // 'role' | 'all'

  // الأدوار
  const isManager = role === 'manager' || role === 'vice';
  const isSpecialist = role === 'specialist';
  const isReception = role === 'reception';
  const isParent = role === 'parent';

  // حسابات إدارية خاصة بالموظفين والإدارة
  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const staffPresentToday = attEmp.filter(a => a.date === today && a.status === 'present').length;
  const staffAttendanceRate = emps.length > 0 ? Math.round((staffPresentToday / emps.length) * 100) : 0;
  const specialistsCount = emps.filter(e => 
    ['specialist_speech', 'specialist_pt', 'specialist_ot', 'specialist_psych', 'specialist_special_ed', 'specialist'].includes(e.role)
  ).length;

  // حسابات خاصة بالأخصائي (حالاتي وجلساتي اليوم)
  const myEmp = emps.find(e => e.id === currentUser?.id || e.email === currentUser?.email || e.name === currentUser?.name);
  const myEmpId = myEmp?.id || currentUser?.id;
  const myTodaySessions = sessions.filter(s => {
    if (s.date !== today) return false;
    if (myEmpId && (s.empId === myEmpId || s.specialistId === myEmpId)) return true;
    if (currentUser?.name && (s.specialistName === currentUser.name || s.empName === currentUser.name)) return true;
    return false;
  });

  // حسابات خاصة بمكتب الاستقبال
  const todayAppointments = appts.filter(a => a.date === today);

  // دالة مساعدة لفتح ملف الطالب مباشرة في قسم الطلاب
  const openStudentDetail = (stuId) => {
    if (!stuId) return;
    sessionStorage.setItem('scs_selected_student', stuId);
    go('students');
  };

  // دالة مساعدة لفتح مركز المقاييس والتشخيص
  const openAssessmentCenter = (category = null) => {
    sessionStorage.setItem('scs_prog_active_view', 'assessment');
    if (category) {
      sessionStorage.setItem('scs_prog_active_category', category);
    }
    go('prog-reports');
  };

  // دالة مساعدة لفتح الخطط والبرامج الفردية IEP
  const openPlansCenter = () => {
    sessionStorage.setItem('scs_prog_active_view', 'plans');
    go('prog-reports');
  };

  // تسمية الدور بالعربية
  const roleNameArabic = {
    manager: 'المدير العام للمركز',
    vice: 'وكيل المركز / المشرف الإداري',
    specialist: 'أخصائي / كادر تأهيلي',
    reception: 'مسؤول الاستقبال والتسجيل',
    parent: 'ولي أمر طالب',
    technician: 'المشرف التقني',
  }[role] || 'المستخدم';

  return (
    <div id="role-adaptive-hub" style={{ marginBottom: 14 }}>
      {/* شريط التعريف بالدور ومفتاح التبديل المتوافق بالكامل مع الوضع الليلي */}
      <div className="wg" style={{ marginBottom: 14 }}>
        <div
          className="wg-h"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--pr-l)',
                color: 'var(--pr)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {isManager ? '👑' : isSpecialist ? '🩺' : isReception ? '🛎️' : isParent ? '👨‍👩‍👦' : '👤'}
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {currentUser?.name || 'مرحباً بك'} — <span style={{ color: 'var(--pr)' }}>{roleNameArabic}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                أدوات تشغيلية مربوطة بالموظفين، الطلاب، المقاييس، وإدارة المركز
              </div>
            </div>
          </div>

          {/* أزرار التبديل بنظام .tabs القياسي */}
          <div className="tabs" style={{ marginBottom: 0, padding: 3 }}>
            <button
              type="button"
              className={`tab ${viewMode === 'role' ? 'on' : ''}`}
              onClick={() => setViewMode('role')}
            >
              🎯 أدوات دوري
            </button>
            <button
              type="button"
              className={`tab ${viewMode === 'all' ? 'on' : ''}`}
              onClick={() => setViewMode('all')}
            >
              🌐 لوحة الإدارة الشاملة
            </button>
          </div>
        </div>
      </div>

      {/* 1. غرفة الإدارة التنفيذية والربط بالنظام الداخلي (للمدير والوكيل) */}
      {(isManager || viewMode === 'all') && (
        <div className="wg" style={{ marginBottom: 14 }}>
          <div className="wg-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>💼</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  غرفة الإدارة التنفيذية واعتمادات المركز
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                  ربط متكامل بشؤون الموظفين، شجرة الصلاحيات، والاعتمادات
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {pendingLeaves.length > 0 ? (
                <button
                  type="button"
                  onClick={() => go('hr-leaves')}
                  style={{
                    fontSize: '0.74rem',
                    background: 'var(--warn-l)',
                    color: 'var(--warn)',
                    border: '1px solid var(--warn)',
                    padding: '4px 10px',
                    borderRadius: 'var(--r3)',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ {pendingLeaves.length} إجازة بانتظار الاعتماد ←
                </button>
              ) : (
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                  جميع الاعتمادات محدثة
                </span>
              )}
            </div>
          </div>

          <div className="wg-b">
            {/* بطاقات المؤشرات الأساسية المرتبطة بالأنظمة */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
              {/* بطاقة حضور الكادر - ربط مباشر بالحضور والانصراف */}
              <div
                onClick={() => go('hr-att')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r2)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="اضغط لفتح سجل الحضور والانصراف اليومي للموظفين"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>👥 انضباط الموظفين اليوم</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--pr)', fontWeight: 700 }}>سجل الحضور ←</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                  {staffPresentToday} / {emps.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: staffAttendanceRate >= 80 ? 'var(--ok)' : 'var(--warn)', fontWeight: 700, marginTop: 4 }}>
                  {staffAttendanceRate}% التزام اليوم ({specialistsCount} أخصائي)
                </div>
              </div>

              {/* بطاقة الإجازات والاعتمادات - ربط مباشر بنظام الإجازات */}
              <div
                onClick={() => go('hr-leaves')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r2)',
                  background: pendingLeaves.length > 0 ? 'var(--warn-l)' : 'var(--bg-input)',
                  border: `1px solid ${pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="اضغط للانتقال لإدارة الإجازات واعتماد الطلبات"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--text-sub)', fontWeight: 600 }}>
                    🌴 طلبات الإجازات
                  </span>
                  <span style={{ fontSize: '0.68rem', color: pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--text-sub)', fontWeight: 700 }}>
                    مراجعة ←
                  </span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--text-main)', marginTop: 4 }}>
                  {pendingLeaves.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--text-sub)', fontWeight: 700, marginTop: 4 }}>
                  {pendingLeaves.length > 0 ? 'طلبات معلقة تحتاج اعتمادك' : 'لا توجد طلبات معلقة حالياً'}
                </div>
              </div>

              {/* بطاقة شؤون الطلاب والخطط - ربط مباشر بملفات الطلاب */}
              <div
                onClick={() => go('students')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r2)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="اضغط لفتح دليل الطلاب والصفوف والفئات"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>🎓 قاعدة بيانات الطلاب</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--pr)', fontWeight: 700 }}>الملفات ←</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                  {students.filter(s => s.status !== 'inactive').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--pr)', fontWeight: 700, marginTop: 4 }}>
                  صفوف، فئات، وملفات التأهيل
                </div>
              </div>

              {/* بطاقة المقاييس والتشخيص - ربط مباشر بمركز التقييم */}
              <div
                onClick={() => openAssessmentCenter()}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r2)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="اضغط لفتح مركز التقييم والتشخيص والمقاييس المقننة"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>🎯 المقاييس والتقييمات</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--pur, #7c3aed)', fontWeight: 700 }}>المركز ←</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                  {studentAssessments.length + progEvaluations.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--pur, #7c3aed)', fontWeight: 700, marginTop: 4 }}>
                  اختبارات مقننة وتقييمات مسجلة
                </div>
              </div>
            </div>

            {/* شريط الإدارة والربط الداخلي السريع (Internal Management Command Bar) */}
            <div
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                ⚡ وصول تنفيذي سريع للإدارات الداخلية:
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-g btn-xs"
                  onClick={() => go('hr-list')}
                  title="سجل الموظفين والكوادر"
                >
                  👥 كوادر الموظفين
                </button>
                <button
                  type="button"
                  className="btn btn-g btn-xs"
                  onClick={() => go('hr-salary')}
                  title="مسيرات الرواتب والبدلات"
                >
                  💰 مسيرات الرواتب
                </button>
                <button
                  type="button"
                  className="btn btn-g btn-xs"
                  onClick={() => go('hr-warnings')}
                  title="القرارات والتنبيهات الإدارية"
                >
                  ⚠️ الجزاءات
                </button>
                <button
                  type="button"
                  className="btn btn-g btn-xs"
                  onClick={() => openPlansCenter()}
                  title="الخطط التربوية والتأهيلية الفردية"
                >
                  📋 خطط IEP
                </button>
                <button
                  type="button"
                  className="btn btn-g btn-xs"
                  onClick={() => go('center')}
                  title="بيانات وترخيص المركز"
                >
                  🏢 بيانات المركز
                </button>
                <button
                  type="button"
                  className="btn btn-g btn-xs"
                  onClick={() => go('settings')}
                  title="الصلاحيات والمستخدمين"
                >
                  ⚙️ الصلاحيات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. كشف مهامي وجلساتي العلاجية للأخصائي - مربوط بالطلاب والخطط والمقاييس */}
      {(isSpecialist || (viewMode === 'role' && !isManager)) && (
        <div className="wg" style={{ marginBottom: 14 }}>
          <div className="wg-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🩺</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  كشف مهامي وجلساتي العلاجية لليوم
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                  ربط مباشر بملفات الطلاب، التوثيق، وربط أهداف الخطة الفردية
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="btn btn-g btn-xs"
                onClick={() => openPlansCenter()}
                title="الانتقال للخطط والبرامج الفردية"
              >
                📋 بنك أهداف IEP ←
              </button>
              <span style={{ fontSize: '0.76rem', background: 'var(--pr-l)', color: 'var(--pr)', border: '1px solid var(--pr)', padding: '3px 8px', borderRadius: 'var(--r3)', fontWeight: 800 }}>
                {myTodaySessions.length} جلسة مسندة
              </span>
            </div>
          </div>

          <div className="wg-b">
            {myTodaySessions.length === 0 ? (
              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--r2)', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                🎉 لا توجد جلسات فردية مسجلة باسمك اليوم، أو يمكنك استعراض الجلسات العامة للمركز.
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-p btn-xs" onClick={() => go('sessions')}>
                    الانتقال لسجل الجلسات وتوثيق جلسة ←
                  </button>
                  <button type="button" className="btn btn-g btn-xs" onClick={() => openAssessmentCenter()}>
                    🎯 إجراء تقييم أو مقياس لطالب ←
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myTodaySessions.map(s => {
                  const stu = students.find(x => x.id === s.stuId);
                  const isDone = s.status === 'done';
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: isDone ? 'var(--ok-l)' : 'var(--bg-input)',
                        border: `1px solid ${isDone ? 'var(--ok)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--r2)',
                        fontSize: '0.82rem',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* النقر على اسم الطالب يفتح ملفه الشامل مباشرة */}
                        <span
                          onClick={() => openStudentDetail(s.stuId)}
                          style={{
                            fontWeight: 800,
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                          title="اضغط لفتح الملف التأهيلي الشامل للطالب"
                        >
                          👤 {stu?.name || 'طالب'}
                        </span>
                        <span style={{ color: 'var(--text-sub)' }}>·</span>
                        <span style={{ color: 'var(--pr)', fontWeight: 700 }}>{s.type}</span>
                        {s.time && <span style={{ color: 'var(--text-sub)' }}>({s.time})</span>}
                        {s.room && <span style={{ color: 'var(--text-sub)', fontSize: '0.74rem' }}>[{s.room}]</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* أزرار سريعة للربط بالأنظمة الداخلية */}
                        <button
                          type="button"
                          className="btn btn-g btn-xs"
                          onClick={() => openStudentDetail(s.stuId)}
                          title="فتح ملف الطالب وخطته"
                        >
                          📁 ملف الطالب
                        </button>
                        <button
                          type="button"
                          className="btn btn-g btn-xs"
                          onClick={() => openAssessmentCenter()}
                          title="تطبيق مقياس أو تقييم لهذا الطالب"
                        >
                          🎯 تقييم
                        </button>
                        <button
                          type="button"
                          className={isDone ? 'btn btn-g btn-xs' : 'btn btn-p btn-xs'}
                          onClick={() => go('sessions')}
                        >
                          {isDone ? '✅ موثقة (تعديل)' : '📝 توثيق الجلسة ←'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. مكتب الاستقبال والبوابة اليومية - مربوط بالحضور والطلاب والزيارات */}
      {(isReception || viewMode === 'all') && (
        <div className="wg" style={{ marginBottom: 14 }}>
          <div className="wg-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🛎️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  مكتب الاستقبال، البوابة، والمواعيد اليومية
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                  ربط مباشر بحضور البوابة، ملفات الطلاب الجدد، وتقويم المواعيد
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-p btn-xs"
              onClick={() => {
                sessionStorage.setItem('scs_attendance_tab', 'morning');
                go('attendance');
              }}
            >
              تسجيل حضور البوابة السريع ←
            </button>
          </div>

          <div className="wg-b">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div
                onClick={() => go('calendar')}
                style={{
                  padding: '14px 16px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--r2)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="اضغط لفتح تقويم الزيارات والمواعيد"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>📅 مواعيد وتقييمات اليوم</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--pr)', fontWeight: 700 }}>التقويم ←</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                  {todayAppointments.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--pr)', fontWeight: 700, marginTop: 4 }}>
                  {todayAppointments.length > 0 ? 'مواعيد مسجلة للمتابعة اليوم' : 'لا توجد مواعيد جديدة مجدولة اليوم'}
                </div>
              </div>

              <div
                onClick={() => go('students')}
                style={{
                  padding: '14px 16px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--r2)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="اضغط لفتح شاشة تسجيل طالب جديد"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>➕ التسجيل وقبول الطلاب</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--ok)', fontWeight: 700 }}>إضافة طالب ←</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 6 }}>
                  تسجيل طالب جديد أو تحديث ملف
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  ربط ببيانات ولي الأمر ومسار التأهيل
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
