import { useState } from 'react';
import { lsGet } from '../../hooks/useStorage';

/**
 * محور التخصيص بحسب دور المستخدم (Role-Adaptive Dashboard)
 * متوافق بنسبة 100% مع الوضع الليلي، الوضع النهاري، والخطوط النظامية
 */
export default function RoleAdaptiveHub({ currentUser, data, today, go }) {
  const role = currentUser?.role || 'specialist';
  const emps = data.emps || [];
  const students = data.students || [];
  const sessions = data.sessions || [];
  const attEmp = data.attEmp || lsGet('attEmp') || [];
  const leaves = data.leaves || lsGet('leaves') || [];
  const appts = lsGet('appointments') || [];

  // وضع العرض: مخصص بحسب الدور أو عام
  const [viewMode, setViewMode] = useState('role'); // 'role' | 'all'

  // دور المدير أو الوكيل
  const isManager = role === 'manager' || role === 'vice';
  // دور الأخصائي أو المعلم
  const isSpecialist = role === 'specialist';
  // دور الاستقبال
  const isReception = role === 'reception';
  // دور ولي الأمر
  const isParent = role === 'parent';

  // حسابات إدارية خاصة بالمدير
  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const staffPresentToday = attEmp.filter(a => a.date === today && a.status === 'present').length;
  const staffAttendanceRate = emps.length > 0 ? Math.round((staffPresentToday / emps.length) * 100) : 0;

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
                أدوات ومؤشرات تشغيلية مكيّفة بحسب طبيعة مهامك اليومية في المركز
              </div>
            </div>
          </div>

          {/* أزرار التبديل باستخدام كلاسات النظام .tabs و .tab لضمان التوافق التام مع الوضع الليلي */}
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
              🌐 نظرة عامة
            </button>
          </div>
        </div>
      </div>

      {/* 1. حاوية غرفة الإدارة التنفيذية واعتمادات المركز */}
      {(isManager || viewMode === 'all') && (
        <div className="wg" style={{ marginBottom: 14 }}>
          <div className="wg-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>💼</span>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                غرفة الإدارة التنفيذية واعتمادات المركز
              </h3>
            </div>
            {pendingLeaves.length > 0 ? (
              <span style={{ fontSize: '0.74rem', background: 'var(--warn-l)', color: 'var(--warn)', border: '1px solid var(--warn)', padding: '3px 8px', borderRadius: 'var(--r3)', fontWeight: 800 }}>
                {pendingLeaves.length} طلب إجازة معلق
              </span>
            ) : (
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                جميع الاعتمادات محدثة
              </span>
            )}
          </div>

          <div className="wg-b">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {/* بطاقة حضور الكادر */}
              <div
                onClick={() => go('hr')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r2)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>👥 انضباط الكادر اليوم</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                  {staffPresentToday} / {emps.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: staffAttendanceRate >= 80 ? 'var(--ok)' : 'var(--warn)', fontWeight: 700, marginTop: 4 }}>
                  {staffAttendanceRate}% نسبة حضور الموظفين
                </div>
              </div>

              {/* بطاقة الإجازات المعلقة */}
              <div
                onClick={() => go('hr-leaves')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r2)',
                  background: pendingLeaves.length > 0 ? 'var(--warn-l)' : 'var(--bg-input)',
                  border: `1px solid ${pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.74rem', color: pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--text-sub)', fontWeight: 600 }}>
                  🌴 طلبات الإجازات المعلقة
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--text-main)', marginTop: 4 }}>
                  {pendingLeaves.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--text-sub)', fontWeight: 700, marginTop: 4 }}>
                  {pendingLeaves.length > 0 ? 'اضغط للمراجعة والاعتماد ←' : 'لا توجد طلبات معلقة'}
                </div>
              </div>

              {/* بطاقة الطاقة الاستيعابية والطلاب */}
              <div
                onClick={() => go('students')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r2)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>🎓 الطلاب المسجلين</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                  {students.filter(s => s.status !== 'inactive').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--pr)', fontWeight: 700, marginTop: 4 }}>
                  عرض ملفات الطلاب والخطط ←
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. كشف مهامي وجلساتي العلاجية للأخصائي */}
      {(isSpecialist || (viewMode === 'role' && !isManager)) && (
        <div className="wg" style={{ marginBottom: 14 }}>
          <div className="wg-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🩺</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  كشف مهامي وجلساتي العلاجية لليوم
                </h3>
              </div>
            </div>
            <span style={{ fontSize: '0.76rem', background: 'var(--pr-l)', color: 'var(--pr)', border: '1px solid var(--pr)', padding: '3px 8px', borderRadius: 'var(--r3)', fontWeight: 800 }}>
              {myTodaySessions.length} جلسة مسندة اليوم
            </span>
          </div>

          <div className="wg-b">
            {myTodaySessions.length === 0 ? (
              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--r2)', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                🎉 لا توجد جلسات فردية مسجلة باسمك اليوم، أو يمكنك استعراض الجلسات العامة للمركز.
                <div style={{ marginTop: 10 }}>
                  <button type="button" className="btn btn-p btn-xs" onClick={() => go('sessions')}>
                    الانتقال لسجل الجلسات وتوثيق جلسة ←
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
                      <div>
                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{stu?.name || 'طالب'}</span>
                        <span style={{ margin: '0 6px', color: 'var(--text-sub)' }}>·</span>
                        <span style={{ color: 'var(--pr)', fontWeight: 700 }}>{s.type}</span>
                        {s.time && <span style={{ marginRight: 6, color: 'var(--text-sub)' }}>({s.time})</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: isDone ? 'var(--ok)' : 'var(--warn)' }}>
                          {isDone ? '✅ منجزة وموثقة' : '⏳ بانتظار التوثيق'}
                        </span>
                        <button
                          type="button"
                          className="btn btn-g btn-xs"
                          onClick={() => go('sessions')}
                        >
                          توثيق ←
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

      {/* 3. حاوية مكتب الاستقبال، البوابة، والمواعيد اليومية */}
      {(isReception || viewMode === 'all') && (
        <div className="wg" style={{ marginBottom: 14 }}>
          <div className="wg-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🛎️</span>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                مكتب الاستقبال، البوابة، والمواعيد اليومية
              </h3>
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
              <div style={{ padding: '14px 16px', background: 'var(--bg-input)', borderRadius: 'var(--r2)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>📅 مواعيد وتقييمات اليوم</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                  {todayAppointments.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--pr)', fontWeight: 700, marginTop: 4 }}>
                  {todayAppointments.length > 0 ? 'يوجد مواعيد مسجلة اليوم' : 'لا توجد مواعيد جديدة اليوم'}
                </div>
              </div>

              <div
                onClick={() => go('calendar')}
                style={{
                  padding: '14px 16px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--r2)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>🗓️ تقويم المركز والزيارات</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 6 }}>
                  فتح التقويم العام للمركز ←
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  حجز وإضافة موعد جديد
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
