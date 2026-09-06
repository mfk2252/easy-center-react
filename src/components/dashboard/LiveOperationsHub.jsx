import React from 'react';

/**
 * محور العمليات اللحظية وغرفة التحكم اليومية (Live Operations Hub)
 * مربوط مباشرة بنظام الطلاب، العيادات، وسجلات الحضور والجلسات
 * متوافق بنسبة 100% مع الوضع الليلي والنهاري واستخدام متغيرات الثيم القياسية
 */
export default function LiveOperationsHub({ data, today, go, currentTime }) {
  const sessions = data.sessions || [];
  const students = data.students || [];
  const attStu = data.attStu || [];
  const emps = data.emps || [];

  // جلسات اليوم
  const todaySessions = sessions.filter(s => s.date === today);
  const doneSessions = todaySessions.filter(s => s.status === 'done');
  const pendingSessions = todaySessions.filter(s => s.status !== 'done' && s.status !== 'cancelled');

  const totalSessionsCount = todaySessions.length;
  const completionRate = totalSessionsCount > 0 
    ? Math.round((doneSessions.length / totalSessionsCount) * 100) 
    : 0;

  // الحضور اللحظي للطلاب
  const presentStudentsToday = attStu.filter(a => a.date === today && a.status === 'present');
  const presentStudentIds = new Set(presentStudentsToday.map(a => a.kidId));

  // رصد الطلاب الحاضرين اليوم ممن لديهم تنبيهات طبية أو احتياجات خاصة دقيقة
  const criticalWatchlist = students.filter(s => {
    if (!presentStudentIds.has(s.id)) return false;
    const hasAllergy = !!(s.allergies && s.allergies.trim() && s.allergies !== 'لا يوجد');
    const hasMedicalAlert = !!(s.medicalNotes && s.medicalNotes.trim());
    const hasSafetyNote = !!(s.safetyNotes || s.pickupNotes || s.dietNotes);
    return hasAllergy || hasMedicalAlert || hasSafetyNote;
  });

  // فتح ملف الطالب مباشرة في قسم الطلاب
  const openStudent = (stuId) => {
    if (!stuId) return;
    sessionStorage.setItem('scs_selected_student', stuId);
    go('students');
  };

  // العيادات والمرافق التخصصية ورصد نشاطها اليوم
  const CLINIC_DEFS = [
    { id: 'speech', name: 'عيادة النطق والتخاطب', icon: '🗣️', keywords: ['نطق', 'تخاطب', 'speech', 'لغة'] },
    { id: 'ot', name: 'عيادة العلاج الوظيفي', icon: '✋', keywords: ['وظيفي', 'مهارات', 'occupational', 'ot'] },
    { id: 'sensory', name: 'غرفة التكامل الحسي', icon: '🌀', keywords: ['حسي', 'تكامل', 'sensory'] },
    { id: 'pt', name: 'صالة العلاج الطبيعي', icon: '🏃‍♂️', keywords: ['طبيعي', 'حركي', 'physical', 'pt'] },
    { id: 'aba', name: 'فصول التدخل وسلوك ABA', icon: '🧩', keywords: ['سلوك', 'تدخل', 'توحد', 'تعديل'] },
  ];

  const currentHour = currentTime ? currentTime.getHours() : new Date().getHours();
  const currentMinute = currentTime ? currentTime.getMinutes() : new Date().getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  // فحص حالة كل عيادة من واقع جلسات اليوم
  const clinicStatusList = CLINIC_DEFS.map(clinic => {
    const clinicSessions = todaySessions.filter(s => {
      const typeStr = (s.type || '').toLowerCase();
      const roomStr = (s.room || '').toLowerCase();
      return clinic.keywords.some(k => typeStr.includes(k) || roomStr.includes(k));
    });

    let currentSession = null;
    let nextSession = null;

    clinicSessions.forEach(s => {
      if (s.time) {
        const [h, m] = s.time.split(':').map(Number);
        if (!isNaN(h)) {
          const sessMinutes = h * 60 + (m || 0);
          if (Math.abs(currentTotalMinutes - sessMinutes) <= 30 && s.status !== 'done') {
            currentSession = s;
          } else if (sessMinutes > currentTotalMinutes && !nextSession && s.status !== 'done') {
            nextSession = s;
          }
        }
      }
    });

    return {
      ...clinic,
      totalToday: clinicSessions.length,
      doneToday: clinicSessions.filter(s => s.status === 'done').length,
      currentSession,
      nextSession: nextSession || clinicSessions.find(s => s.status !== 'done'),
    };
  });

  return (
    <div id="live-operations-hub" style={{ marginBottom: 14 }}>
      {/* 1. حاوية غرفة العمليات ونبض اليوم اللحظي */}
      <div className="wg" style={{ marginBottom: 14 }}>
        <div className="wg-h" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.25rem' }}>⚡</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                غرفة العمليات ونبض اليوم اللحظي
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                متابعة حركة الجلسات التأهيلية وحضور الطلاب لحظة بلحظة
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-g btn-xs"
              onClick={() => {
                sessionStorage.setItem('scs_attendance_tab', 'morning');
                go('attendance');
              }}
            >
              سجل الحضور ←
            </button>
            <button
              type="button"
              className="btn btn-p btn-xs"
              onClick={() => go('sessions')}
            >
              جدول الجلسات ←
            </button>
          </div>
        </div>

        <div className="wg-b">
          {/* كروت المقاييس الأربعة */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 12,
              marginBottom: 14,
            }}
          >
            {/* 1. إجمالي جلسات اليوم */}
            <div
              onClick={() => go('sessions')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r2)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>إجمالي جلسات اليوم</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                {totalSessionsCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--pr)', fontWeight: 700, marginTop: 4 }}>
                {totalSessionsCount > 0 ? 'مجدولة في العيادات' : 'لا توجد جلسات اليوم'}
              </div>
            </div>

            {/* 2. جلسات تم إنجازها */}
            <div
              onClick={() => go('sessions')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r2)',
                background: 'var(--ok-l)',
                border: '1px solid var(--ok)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--ok)', fontWeight: 600 }}>جلسات أُنجزت</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ok)', marginTop: 4 }}>
                {doneSessions.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ok)', fontWeight: 700, marginTop: 4 }}>
                نسبة الإنجاز: {completionRate}%
              </div>
            </div>

            {/* 3. جلسات متبقية */}
            <div
              onClick={() => go('sessions')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r2)',
                background: 'var(--pr-l)',
                border: '1px solid var(--pr)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--pr)', fontWeight: 600 }}>جلسات متبقية</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--pr)', marginTop: 4 }}>
                {pendingSessions.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--pr)', fontWeight: 700, marginTop: 4 }}>
                قيد التنفيذ والانتظار
              </div>
            </div>

            {/* 4. الحضور الفعلي للطلاب */}
            <div
              onClick={() => {
                sessionStorage.setItem('scs_attendance_tab', 'morning');
                go('attendance');
              }}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r2)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>الطلاب الحاضرين اليوم</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                {presentStudentsToday.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 700, marginTop: 4 }}>
                في الفصول والعيادات
              </div>
            </div>
          </div>

          {/* شريط الإنجاز المتدرج */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>نسبة تنفيذ الخطط العلاجية لليوم</span>
              <span style={{ fontWeight: 800, color: 'var(--ok)' }}>{completionRate}% مكتمل</span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: 'var(--border-color)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${completionRate}%`,
                  background: 'var(--ok)',
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. حالة العيادات والغرف التأهيلية اليوم */}
      <div className="wg" style={{ marginBottom: 14 }}>
        <div className="wg-h">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>🏥</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                حالة العيادات والغرف التأهيلية اليوم
              </h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                إشغال الغرف التخصصية وربط مباشر بالطلاب المعالجين
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-g btn-xs"
            onClick={() => go('sessions')}
          >
            جدول الجلسات الكامل ←
          </button>
        </div>

        <div className="wg-b">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {clinicStatusList.map(c => {
              const currentStu = c.currentSession ? students.find(s => s.id === c.currentSession.stuId) : null;
              const nextStu = c.nextSession ? students.find(s => s.id === c.nextSession.stuId) : null;
              const emp = c.currentSession ? emps.find(e => e.id === (c.currentSession.empId || c.currentSession.specialistId)) : null;

              return (
                <div
                  key={c.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--r2)',
                    border: `1px solid ${c.currentSession ? 'var(--pr)' : 'var(--border-color)'}`,
                    background: c.currentSession ? 'var(--pr-l)' : 'var(--bg-input)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </span>
                    {c.currentSession ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: 'var(--pr)',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--pr)',
                          padding: '2px 8px',
                          borderRadius: 'var(--r3)',
                        }}
                      >
                        🟢 جارية الآن
                      </span>
                    ) : c.totalToday > 0 ? (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                        {c.doneToday}/{c.totalToday} مكتمل
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                        متاح
                      </span>
                    )}
                  </div>

                  {c.currentSession ? (
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      مع الطالب:{' '}
                      <span
                        onClick={() => openStudent(c.currentSession.stuId)}
                        style={{ color: 'var(--pr)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 800 }}
                        title="اضغط لفتح ملف الطالب"
                      >
                        {currentStu?.name || 'طالب'}
                      </span>
                      {emp && <span style={{ color: 'var(--text-sub)' }}> · {emp.name}</span>}
                    </div>
                  ) : c.nextSession ? (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                      الجلسة القادمة: {c.nextSession.time || 'لاحقاً'}{' '}
                      {nextStu && (
                        <span
                          onClick={() => openStudent(c.nextSession.stuId)}
                          style={{ color: 'var(--text-main)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}
                          title="اضغط لفتح ملف الطالب"
                        >
                          ({nextStu.name})
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', opacity: 0.8 }}>
                      لا توجد جلسات أخرى مجدولة اليوم
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. رادار السلامة وملاحظات اليوم الحرجة للطلاب المتواجدين - مربوط مباشرة بملفات الطلاب */}
      {criticalWatchlist.length > 0 && (
        <div className="wg" style={{ marginBottom: 14, borderColor: 'var(--warn)' }}>
          <div className="wg-h" style={{ background: 'var(--warn-l)', borderBottom: '1px solid var(--warn)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--warn)' }}>
                  ملاحظات السلامة والرعاية الحرجة لطلاب اليوم الحاضرين ({criticalWatchlist.length})
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                  تنبيهات صحية وغذائية هامة (اضغط على اسم الطالب لفتح ملفه الطبي والتأهيلي)
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-g btn-xs"
              onClick={() => go('students')}
            >
              دليل الطلاب الكامل ←
            </button>
          </div>

          <div className="wg-b">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {criticalWatchlist.map(s => (
                <div
                  key={s.id}
                  onClick={() => openStudent(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--r2)',
                    fontSize: '0.78rem',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                  title="اضغط لفتح الملف الشامل للطالب وملاحظاته الطبية"
                >
                  <span style={{ fontWeight: 800, color: 'var(--text-main)', textDecoration: 'underline' }}>
                    👤 {s.name}:
                  </span>
                  <span style={{ color: 'var(--warn)', fontWeight: 700 }}>
                    {s.allergies || s.medicalNotes || s.safetyNotes || 'متابعة خاصة'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--pr)' }}>←</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
