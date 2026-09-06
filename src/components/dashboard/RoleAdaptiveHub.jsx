import { useState } from 'react';
import { lsGet } from '../../hooks/useStorage';

/**
 * محور التخصيص بحسب دور المستخدم (Role-Adaptive Dashboard)
 * يكيف لوحة التحكم لتُبرز ما يحتاجه المدير، الأخصائي، موظف الاستقبال، أو ولي الأمر
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
  const myDoneSessions = myTodaySessions.filter(s => s.status === 'done');

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
    <div id="role-adaptive-hub" style={{ marginBottom: 16 }}>
      {/* شريط التعريف بالدور ومفتاح التبديل */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--r)',
          padding: '12px 18px',
          boxShadow: 'var(--sh)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--pr-l)',
              color: 'var(--pr)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 800,
            }}
          >
            {isManager ? '👑' : isSpecialist ? '🩺' : isReception ? '🛎️' : isParent ? '👨‍👩‍👦' : '👤'}
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {currentUser?.name || 'مرحباً بك'} — <span style={{ color: 'var(--pr)' }}>{roleNameArabic}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
              تم تكييف الأدوات والمؤشرات المعروضة أدناه تلقائياً لتناسب طبيعة مهامك اليومية
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-main, #f1f5f9)', padding: 3, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setViewMode('role')}
            style={{
              border: 'none',
              padding: '5px 12px',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: viewMode === 'role' ? 'var(--bg-card)' : 'transparent',
              color: viewMode === 'role' ? 'var(--pr)' : 'var(--text-sub)',
              boxShadow: viewMode === 'role' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🎯 أدوات دوري
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all')}
            style={{
              border: 'none',
              padding: '5px 12px',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: viewMode === 'all' ? 'var(--bg-card)' : 'transparent',
              color: viewMode === 'all' ? 'var(--pr)' : 'var(--text-sub)',
              boxShadow: viewMode === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🌐 نظرة عامة
          </button>
        </div>
      </div>

      {/* محتوى مخصص للمدير والوكيل */}
      {(isManager || viewMode === 'all') && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--r)',
            padding: 'clamp(14px, 2.5vw, 18px)',
            boxShadow: 'var(--sh)',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>💼</span>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                غرفة الإدارة التنفيذية واعتمادات المركز
              </h4>
            </div>
            {pendingLeaves.length > 0 && (
              <span style={{ fontSize: '0.74rem', background: 'var(--err-l)', color: 'var(--err)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                {pendingLeaves.length} طلب إجازة معلق
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {/* بطاقة حضور الكادر */}
            <div
              onClick={() => go('hr')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r2)',
                background: 'var(--bg-main, #f8fafc)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>👥 انضباط الكادر اليوم</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                {staffPresentToday} / {emps.length}
              </div>
              <div style={{ fontSize: '0.68rem', color: staffAttendanceRate >= 80 ? 'var(--ok)' : 'var(--warn)', fontWeight: 700 }}>
                {staffAttendanceRate}% نسبة الحضور الإجمالية
              </div>
            </div>

            {/* بطاقة الإجازات المعلقة */}
            <div
              onClick={() => go('hr-leaves')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r2)',
                background: pendingLeaves.length > 0 ? 'var(--warn-l)' : 'var(--bg-main, #f8fafc)',
                border: `1px solid ${pendingLeaves.length > 0 ? 'rgba(245,158,11,0.3)' : 'var(--border-color)'}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--text-sub)' }}>
                🌴 طلبات الإجازات المعلقة
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--text-main)', marginTop: 2 }}>
                {pendingLeaves.length}
              </div>
              <div style={{ fontSize: '0.68rem', color: pendingLeaves.length > 0 ? 'var(--warn)' : 'var(--text-sub)', fontWeight: 700 }}>
                {pendingLeaves.length > 0 ? 'اضغط للمراجعة والاعتماد ←' : 'لا توجد طلبات معلقة'}
              </div>
            </div>

            {/* بطاقة الطاقة الاستيعابية والطلاب */}
            <div
              onClick={() => go('students')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r2)',
                background: 'var(--bg-main, #f8fafc)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>🎓 الطلاب المسجلين</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                {students.filter(s => s.status !== 'inactive').length}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--pr)', fontWeight: 700 }}>
                عرض ملفات الطلاب والخطط ←
              </div>
            </div>
          </div>
        </div>
      )}

      {/* محتوى مخصص للأخصائي */}
      {(isSpecialist || (viewMode === 'role' && !isManager)) && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--r)',
            padding: 'clamp(14px, 2.5vw, 18px)',
            boxShadow: 'var(--sh)',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🩺</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  كشف مهامي وجلساتي العلاجية لليوم
                </h4>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                  متابعة الطلاب المسندين إليك وإنجاز التقارير التأهيلية
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', background: 'var(--pr-l)', color: 'var(--pr)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
              {myTodaySessions.length} جلسة مسندة اليوم
            </span>
          </div>

          {myTodaySessions.length === 0 ? (
            <div style={{ padding: '14px', background: 'var(--bg-main, #f8fafc)', borderRadius: 'var(--r2)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
              🎉 لا توجد جلسات فردية محددة باسمك اليوم، أو يمكنك استعراض الجلسات العامة من تبويب الجلسات.
              <div style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-p btn-xs" onClick={() => go('sessions')}>
                  الانتقال لسجل الجلسات وتوثيق جلسة ←
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myTodaySessions.map(s => {
                const stu = students.find(x => x.id === s.stuId);
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: s.status === 'done' ? 'var(--ok-l, #e6f9f0)' : 'var(--bg-main, #f8fafc)',
                      border: `1px solid ${s.status === 'done' ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--r2)',
                      fontSize: '0.8rem',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{stu?.name || 'طالب'}</span>
                      <span style={{ margin: '0 6px', opacity: 0.5 }}>·</span>
                      <span style={{ color: 'var(--pr)', fontWeight: 600 }}>{s.type}</span>
                      {s.time && <span style={{ marginRight: 6, color: 'var(--text-sub)' }}>({s.time})</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.status === 'done' ? 'var(--ok)' : 'var(--warn)' }}>
                        {s.status === 'done' ? '✅ منجزة' : '⏳ بانتظار التوثيق'}
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
      )}

      {/* محتوى موظف الاستقبال */}
      {(isReception || viewMode === 'all') && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--r)',
            padding: 'clamp(14px, 2.5vw, 18px)',
            boxShadow: 'var(--sh)',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🛎️</span>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                مكتب الاستقبال، البوابة، والمواعيد اليومية
              </h4>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg-main, #f8fafc)', borderRadius: 'var(--r2)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>📅 مواعيد وتقييمات اليوم</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                {todayAppointments.length}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--pr)', fontWeight: 600 }}>
                {todayAppointments.length > 0 ? 'يوجد مواعيد مسجلة اليوم' : 'لا توجد مواعيد جديدة اليوم'}
              </div>
            </div>

            <div
              onClick={() => go('calendar')}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-main, #f8fafc)',
                borderRadius: 'var(--r2)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>🗓️ تقويم المركز والزيارات</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                فتح التقويم العام للمركز ←
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: 2 }}>
                إضافة وحجز موعد جديد
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
