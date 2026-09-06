import React from 'react';
import { lsGet } from '../../hooks/useStorage';

/**
 * محور ذكاء الأعمال والرسوم البيانية المصغرة (Visual Analytics Hub)
 * مربوط بنظام الإدارة الداخلية: الموظفين، الطلاب، المقاييس والتشخيص، وخطط الـ IEP
 * متوافق بنسبة 100% مع الوضع الليلي والنهاري واستخدام كلاسات النظام .wg و .wg-h و .wg-b
 */
export default function VisualAnalyticsHub({ data, go }) {
  const students = data.students || [];
  const attStu = data.attStu || lsGet('attStu') || [];
  const iepGoals = lsGet('iepGoals') || [];
  const studentAssessments = lsGet('studentAssessments') || [];
  const progEvaluations = lsGet('progEvaluations') || [];

  const activeStudents = students.filter(
    s => !['inactive', 'transferred', 'waitlist', 'rejected'].includes(s.status)
  );

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

  // 1. نبض حضور الأيام الخمسة الأخيرة
  const getPastDays = (numDays = 5) => {
    const days = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('ar-SA', { weekday: 'short' });
      days.push({ iso, dayName });
    }
    return days;
  };

  const weekDays = getPastDays(5);
  const attendanceTrend = weekDays.map(({ iso, dayName }) => {
    const dayRecords = attStu.filter(a => a.date === iso && a.status === 'present');
    const presentCount = dayRecords.length;
    const totalBase = activeStudents.length || 1;
    const rate = Math.min(100, Math.round((presentCount / totalBase) * 100));
    return { iso, dayName, presentCount, rate };
  });

  // 2. توزيع برامج المركز التأهيلية
  const sessStudentsCount = activeStudents.filter(s => s.progSessions?.enabled).length;
  const morningCount = activeStudents.filter(s => s.progMorning?.enabled).length;
  const eveningCount = activeStudents.filter(s => s.progEvening?.enabled).length;
  const totalEnrollments = (sessStudentsCount + morningCount + eveningCount) || 1;

  const sessPct = Math.round((sessStudentsCount / totalEnrollments) * 100);
  const morningPct = Math.round((morningCount / totalEnrollments) * 100);
  const eveningPct = Math.max(0, 100 - (sessPct + morningPct));

  // 3. مؤشر إنجاز خطط الـ IEP الفردية
  const totalGoals = iepGoals.length;
  const masteredGoals = iepGoals.filter(g => (Number(g.progress) || 0) >= 80).length;
  const inProgressGoals = iepGoals.filter(g => {
    const p = Number(g.progress) || 0;
    return p > 0 && p < 80;
  }).length;
  const newGoals = totalGoals - (masteredGoals + inProgressGoals);
  const masteryRate = totalGoals > 0 ? Math.round((masteredGoals / totalGoals) * 100) : 0;

  // 4. إحصائيات المقاييس والتشخيص
  const totalAllAssessments = studentAssessments.length + progEvaluations.length;
  
  // أحدث 3 تقييمات أو مقاييس تم إجراؤها
  const recentAssessmentsList = [
    ...studentAssessments.map(a => ({
      id: a.id,
      stuId: a.stuId || a.studentId,
      studentName: a.studentName || a.stuName || students.find(s => s.id === (a.stuId || a.studentId))?.name || 'طالب',
      scaleName: a.scaleName || a.scaleId || 'مقياس مقنن',
      date: a.date || a.createdAt?.split('T')[0] || '',
      score: a.totalScore !== undefined ? `${a.totalScore} درجة` : (a.level || 'مكتمل'),
      type: 'scale'
    })),
    ...progEvaluations.map(e => ({
      id: e.id,
      stuId: e.stuId,
      studentName: e.stuName || students.find(s => s.id === e.stuId)?.name || 'طالب',
      scaleName: 'تقييم مبدئي شامل',
      date: e.date || '',
      score: e.status || 'معتمد',
      type: 'initial'
    }))
  ]
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  .slice(0, 3);

  return (
    <div id="visual-analytics-hub" style={{ marginBottom: 14 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 14,
        }}
      >
        {/* أ. نبض حضور الأسبوع (رسم بياني أعمدة) */}
        <div className="wg" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="wg-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>📈</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  نبض الحضور عبر الأيام الأخيرة
                </h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                  تتبع وتيرة انتظام الطلاب وحركتهم اليومية
                </div>
              </div>
            </div>
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
          </div>

          <div className="wg-b" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ height: 130, display: 'flex', alignItems: 'flex-end', gap: 12, padding: '10px 4px 0', borderBottom: '1px solid var(--border-color)' }}>
              {attendanceTrend.map((d, i) => {
                const barHeight = Math.max(12, Math.min(100, d.rate || (d.presentCount > 0 ? 35 : 8)));
                const isToday = i === attendanceTrend.length - 1;

                return (
                  <div
                    key={d.iso}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                    title={`${d.dayName} (${d.iso}): ${d.presentCount} طالب حاضر (${d.rate}%)`}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isToday ? 'var(--pr)' : 'var(--text-main)' }}>
                      {d.presentCount}
                    </span>
                    <div
                      style={{
                        width: '80%',
                        maxWidth: 32,
                        height: `${barHeight}%`,
                        background: isToday
                          ? 'linear-gradient(180deg, var(--pr) 0%, rgba(26,86,219,0.7) 100%)'
                          : 'linear-gradient(180deg, rgba(26,86,219,0.6) 0%, rgba(26,86,219,0.2) 100%)',
                        borderRadius: '5px 5px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: isToday ? 'var(--pr)' : 'var(--text-sub)', fontWeight: isToday ? 800 : 500, marginTop: 4 }}>
                      {d.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.72rem', color: 'var(--text-sub)' }}>
              <span>📊 مقياس الحضور الفعلي المسجل</span>
              <span>الأحدث ←</span>
            </div>
          </div>
        </div>

        {/* ب. توزيع برامج وخدمات المركز */}
        <div className="wg" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="wg-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🧩</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  توزيع الطلاب على البرامج والمسارات
                </h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                  نسبة الإشغال حسب طبيعة الرعاية والتأهيل
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--pr)' }}>
              {activeStudents.length} طالب
            </span>
          </div>

          <div className="wg-b" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* شريط الألوان المتعدد */}
              <div
                style={{
                  height: 12,
                  borderRadius: 6,
                  overflow: 'hidden',
                  display: 'flex',
                  background: 'var(--border-color)',
                  marginBottom: 14,
                }}
              >
                <div style={{ width: `${sessPct}%`, background: 'var(--pur, #7c3aed)', transition: 'width 0.3s' }} title={`جلسات فردية: ${sessStudentsCount} (${sessPct}%)`} />
                <div style={{ width: `${morningPct}%`, background: 'var(--pr)', transition: 'width 0.3s' }} title={`صباحي: ${morningCount} (${morningPct}%)`} />
                <div style={{ width: `${eveningPct}%`, background: 'var(--ok)', transition: 'width 0.3s' }} title={`مسائي: ${eveningCount} (${eveningPct}%)`} />
              </div>

              {/* قائمة التفاصيل */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--pur, #7c3aed)', display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>مسار الجلسات التأهيلية الفردية</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--pur, #7c3aed)' }}>{sessStudentsCount} ({sessPct}%)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--pr)', display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>برنامج الرعاية النهارية الصباحي</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--pr)' }}>{morningCount} ({morningPct}%)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--ok)', display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>البرنامج المسائي / التدخل المكثف</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--ok)' }}>{eveningCount} ({eveningPct}%)</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-g btn-xs" onClick={() => go('students')}>
                تفاصيل ملفات الطلاب ←
              </button>
            </div>
          </div>
        </div>

        {/* ج. مؤشر إتقان أهداف الخطط الفردية (IEP Goals) */}
        <div className="wg" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="wg-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🎯</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  مؤشر إتقان أهداف الخطط (IEP)
                </h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                  نسبة التقدم التأهيلي والتربوي الفردي
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-g btn-xs"
              onClick={() => {
                sessionStorage.setItem('scs_prog_active_view', 'plans');
                go('prog-reports');
              }}
            >
              الخطط والبرامج ←
            </button>
          </div>

          <div className="wg-b" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              {/* حلقة الإنجاز المرئية SVG */}
              <div style={{ width: 80, height: 80, position: 'relative', flexShrink: 0 }}>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="var(--border-color)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="var(--ok)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={201.06}
                    strokeDashoffset={201.06 - (201.06 * (masteryRate || 5)) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {masteryRate}%
                  </span>
                </div>
              </div>

              {/* تفاصيل إحصائية */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--ok)', fontWeight: 700 }}>✅ أهداف أُتقنت بنجاح:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{masteredGoals}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--pr)', fontWeight: 700 }}>⏳ قيد التدريب:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{inProgressGoals}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-sub)' }}>🆕 أهداف خطط جديدة:</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{newGoals}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-sub)' }}>
              إجمالي الأهداف المرصودة في خطط الطلاب: <b style={{ color: 'var(--text-main)' }}>{totalGoals} هدف تدريبي</b>
            </div>
          </div>
        </div>

        {/* د. رادار المقاييس والتشخيص (Diagnostic & Measurement Center Hub) */}
        <div className="wg" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="wg-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🩺</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  رادار المقاييس والتشخيص السيكومتري
                </h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                  المقاييس المقننة، التقييم المبدئي، واختبارات الأداء
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-p btn-xs"
              onClick={() => openAssessmentCenter()}
            >
              مركز المقاييس ({totalAllAssessments}) ←
            </button>
          </div>

          <div className="wg-b" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* أزرار سريعة للمقاييس التخصصية الأكثر استخداماً */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginBottom: 6, fontWeight: 700 }}>
                فئات المقاييس التشخيصية السريعة:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-g btn-xs"
                  onClick={() => openAssessmentCenter('autism')}
                  title="مقاييس التوحد: CARS-2، GARS-3، SRS-2، PEP-3"
                  style={{ fontSize: '0.72rem' }}
                >
                  🧩 التوحد
                </button>
                <button
                  type="button"
                  className="btn btn-g btn-xs"
                  onClick={() => openAssessmentCenter('speech')}
                  title="مقاييس التخاطب واللغة: أبو حسيبة، اختبار النطق، PLS-5"
                  style={{ fontSize: '0.72rem' }}
                >
                  🗣️ التخاطب
                </button>
                <button
                  type="button"
                  className="btn btn-g btn-xs"
                  onClick={() => openAssessmentCenter('ld')}
                  title="صعوبات التعلم: LDES، السرطاوي، بطارية الزيات"
                  style={{ fontSize: '0.72rem' }}
                >
                  📚 صعوبات التعلم
                </button>
                <button
                  type="button"
                  className="btn btn-g btn-xs"
                  onClick={() => openAssessmentCenter('sensory')}
                  title="التكامل الحسي والنمو الحركي"
                  style={{ fontSize: '0.72rem' }}
                >
                  🌀 التكامل الحسي
                </button>
              </div>
            </div>

            {/* أحدث التقييمات المسجلة للطلاب */}
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginBottom: 6, fontWeight: 700 }}>
                أحدث التقييمات والمقاييس المنجزة:
              </div>
              {recentAssessmentsList.length === 0 ? (
                <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--r2)', border: '1px solid var(--border-color)', fontSize: '0.74rem', color: 'var(--text-sub)', textAlign: 'center' }}>
                  لا توجد اختبارات مقننة مسجلة بعد.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {recentAssessmentsList.map(rec => (
                    <div
                      key={rec.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--r2)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.76rem',
                      }}
                    >
                      <span
                        onClick={() => openStudentDetail(rec.stuId)}
                        style={{
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                        title="اضغط لفتح ملف الطالب"
                      >
                        👤 {rec.studentName}
                      </span>
                      <span style={{ color: 'var(--pr)', fontWeight: 600 }}>
                        {rec.scaleName}
                      </span>
                      <span style={{ color: 'var(--ok)', fontWeight: 700, fontSize: '0.72rem' }}>
                        {rec.score}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-sub)' }}>
              <span>إجمالي المقاييس المعتمدة بالمنظومة: <b>{totalAllAssessments} تقييم</b></span>
              <button
                type="button"
                className="btn btn-g btn-xs"
                onClick={() => openAssessmentCenter()}
              >
                تطبيق مقياس جديد ←
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
