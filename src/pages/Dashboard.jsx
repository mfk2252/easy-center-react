import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../hooks/useStorage';
import { todayStr, uid, formatHijriDate } from '../utils/dateHelpers';
import { collectSystemAlerts } from '../utils/alertEngine';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';
import LiveOperationsHub from '../components/dashboard/LiveOperationsHub';
import RoleAdaptiveHub from '../components/dashboard/RoleAdaptiveHub';
import VisualAnalyticsHub from '../components/dashboard/VisualAnalyticsHub';

const EMPTY_MANUAL = { title: '', details: '', date: '', time: '', severity: 'info' };
const SEV_LABEL = { urgent: 'عاجل', warn: 'تحذير', info: 'معلومة' };
const SEV_STYLE = {
  urgent: { border: '1px solid #fecaca', background: 'var(--err-l)', color: 'var(--err)' },
  warn: { border: '1px solid #fde68a', background: 'var(--warn-l)', color: 'var(--warn)' },
  info: { border: '1px solid #bfdbfe', background: 'var(--pr-l)', color: 'var(--pr)' },
};

export default function Dashboard() {
  const { currentUser, center, go } = useApp();
  const [data, setData] = useState({ emps: [], students: [], sessions: [], attStu: [], leaves: [], notifs: [] });
  const [clockData, setClockData] = useState({ time: new Date(), greeting: '🌅 صباح الخير' });
  const [alerts, setAlerts] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState(EMPTY_MANUAL);
  const [showStatusBanner, setShowStatusBanner] = useState(true);
  const canManual = ['manager', 'vice', 'reception'].includes(currentUser?.role);

  useEffect(() => {
    const tick = () => {
      const t = new Date();
      const h = t.getHours();
      setClockData({
        time: t,
        greeting: h < 12 ? '🌅 صباح الخير' : h < 17 ? '☀️ مساء النور' : '🌙 مساء الخير',
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  function refreshAlerts() {
    setData({
      emps: lsGet('employees'),
      students: lsGet('students'),
      sessions: lsGet('sessions'),
      attStu: lsGet('attStu'),
      attEmp: lsGet('attEmp') || [],
      leaves: lsGet('leaves'),
      notifs: lsGet('notifs'),
    });
    setAlerts(collectSystemAlerts());
  }

  useEffect(() => {
    refreshAlerts();
  }, []);

  const today = todayStr();
  const activeStudents = data.students.filter(s => !['inactive', 'transferred', 'waitlist', 'rejected'].includes(s.status));
  const sessStudents = activeStudents.filter(s => s.progSessions?.enabled);
  const classStudents = activeStudents.filter(s => s.progMorning?.enabled || s.progEvening?.enabled);
  
  const sessPresent = data.attStu.filter(
    a => a.date === today && a.status === 'present' && a.session === 'sessions' && sessStudents.find(x => x.id === a.kidId)
  ).length;
  
  const classPresent = data.attStu.filter(
    a =>
      a.date === today &&
      a.status === 'present' &&
      (a.session === 'morning' || a.session === 'evening') &&
      classStudents.find(x => x.id === a.kidId)
  ).length;

  const recentSessions = [...data.sessions].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);
  const todayAtt = data.attStu.filter(a => a.date === today).slice(0, 8);

  const appts = lsGet('appointments')
    .filter(a => a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // استخراج الوقت الحالي بشكل منفصل وبصيغة أرقام واضحة
  const timeStr = clockData.time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // استخراج اسم اليوم فقط (دون تكراره في التواريخ اللاحقة)
  const dayNameStr = clockData.time.toLocaleDateString('ar-SA', { weekday: 'long' });
  
  // استخراج التاريخ الميلادي الرقمي مع اسم الشهر (دون اسم اليوم)
  const numericDateStr = clockData.time.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // استخراج التاريخ الهجري (مع تنظيف أي تكرار لاسم اليوم إن وجد داخل الدالة المساعدة)
  let hijriStr = formatHijriDate(clockData.time);
  if (hijriStr && hijriStr.includes('،')) {
    hijriStr = hijriStr.split('،')[1]?.trim() || hijriStr;
  }

  function saveManual() {
    if (!manualForm.title.trim() || !manualForm.date) {
      window.alert('أدخل عنوان التنبيه والتاريخ');
      return;
    }
    lsAdd('manualAlerts', { ...manualForm, id: uid() });
    setShowManualForm(false);
    setManualForm(EMPTY_MANUAL);
    refreshAlerts();
  }
  function delManual(id) {
    if (!window.confirm('حذف هذا التنبيه اليدوي؟')) return;
    lsDel('manualAlerts', id);
    refreshAlerts();
  }

  const fldM = k => e => setManualForm(f => ({ ...f, [k]: e.target.value }));

  const grouped = alerts.reduce((acc, a) => {
    acc[a.category] = acc[a.category] || [];
    acc[a.category].push(a);
    return acc;
  }, {});

  const getTodayStatusMessage = () => {
    const now = clockData.time;
    const currentHour = now.getHours();
    const isMorning = currentHour < 12;
    const isAfternoon = currentHour >= 12 && currentHour < 17;
    const isNight = currentHour >= 17;

    const timeGreeting = isMorning ? 'صباح الخير' : isAfternoon ? 'مساء النور' : 'مساء الخير';

    // 1. فحص عطلة نهاية الأسبوع الرسمية وأيام الإجازات المحددة من مدير النظام
    const dow = now.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[dow];
    const configuredWeekends = center?.weekendDays || center?.shifts?.weekendDays || ['Friday', 'Saturday', 5, 6];
    
    const isWeekend = configuredWeekends.includes(dow) || 
                      configuredWeekends.includes(currentDayName) || 
                      configuredWeekends.includes(currentDayName?.toLowerCase?.()) || 
                      (dow === 5); // الجمعة عطلة رسمية مباركة كحد أدنى افتراضي

    if (isWeekend) {
      if (dow === 5) {
        return {
          text: `${timeGreeting}! جمعة مباركة، اليوم عطلة نهاية الأسبوع الرسمية للمركز. نتمنى لكم وللكادر يوماً طيباً ومباركاً.`,
          icon: "🕌",
          type: "info"
        };
      }
      return {
        text: `${timeGreeting}! اليوم عطلة نهاية الأسبوع الرسمية للمركز (${dayNameStr}). نتمنى لكم وللكادر إجازة ممتعة وهانئة.`,
        icon: "🌴",
        type: "info"
      };
    }

    // 2. إحصائيات حضور الطلاب والكادر الوظيفي لليوم
    const totalExpectedAttendance = sessStudents.length + classStudents.length;
    const totalActualPresent = sessPresent + classPresent;
    const todayEmpsPresent = (data.attEmp || []).filter(
      a => a.date === today && (a.status === 'present' || a.status === 'late')
    ).length;
    const totalActiveEmps = (data.emps || []).filter(e => e.status !== 'inactive').length;

    // 3. فترة المساء بعد انتهاء ساعات الدوام الرسمي
    if (isNight) {
      if (totalActualPresent > 0 || todayEmpsPresent > 0) {
        return {
          text: `${timeGreeting}! انتهت فترات الدوام الرسمي لليوم، مع تسجيل حضور (${totalActualPresent} طالب و ${todayEmpsPresent} من الكادر). نتمنى للجميع أمسية سعيدة وراحة مستحقة.`,
          icon: "🌙",
          type: "info"
        };
      }
      return {
        text: `${timeGreeting}! انتهت فترات الدوام الرسمي لليوم. نتمنى لكافة منسوبي المركز والطلاب أمسية هانئة ومريحة.`,
        icon: "🌙",
        type: "info"
      };
    }

    // 4. فترة الظهيرة والمساء أثناء الدوام
    if (isAfternoon) {
      const absentRate = totalExpectedAttendance > 0 ? ((totalExpectedAttendance - totalActualPresent) / totalExpectedAttendance) : 0;
      if (absentRate >= 0.25 && totalActualPresent > 0) {
        return {
          text: `${timeGreeting}: تنبيه تشغيلي - نسبة غياب الطلاب اليوم مرتفعة وتصل إلى ${Math.round(absentRate * 100)}% (${totalActualPresent} حاضر من ${totalExpectedAttendance}). يرجى مراجعة التواصل مع أولياء الأمور.`,
          icon: "⚠️",
          type: "warning"
        };
      }
      if (totalActualPresent > 0 || todayEmpsPresent > 0) {
        return {
          text: `${timeGreeting}! سير العمليات والجلسات منتظم اليوم (تم تسجيل حضور ${totalActualPresent} طالب و ${todayEmpsPresent} من الكادر الوظيفي). متابعة الجلسات مستمرة بنجاح.`,
          icon: "✨",
          type: "success"
        };
      }
      return {
        text: `${timeGreeting}: لم يتم رصد تسجيل حضور للطلاب أو الكادر خلال فترات اليوم حتى الآن. يرجى مراجعة سجلات التحضير.`,
        icon: "ℹ️",
        type: "info"
      };
    }

    // 5. الفترة الصباحية (بداية اليوم)
    if (totalActualPresent === 0 && todayEmpsPresent === 0) {
      return {
        text: `${timeGreeting} ونشاط متجدد! بداية يوم عمل جديد، في انتظار بدء تسجيل حضور الكادر والطلاب للفترة الصباحية.`,
        icon: "🌅",
        type: "info"
      };
    }

    if (totalActualPresent === 0 && todayEmpsPresent > 0) {
      return {
        text: `${timeGreeting}! بدأ الكادر الوظيفي بالتحضير وتسجيل الحضور (${todayEmpsPresent} موظف حاضر)، وفي انتظار استكمال تحضير الطلاب.`,
        icon: "👥",
        type: "info"
      };
    }

    const absentRate = totalExpectedAttendance > 0 ? ((totalExpectedAttendance - totalActualPresent) / totalExpectedAttendance) : 0;
    if (absentRate >= 0.25) {
      return {
        text: `${timeGreeting}: تنبيه تشغيلي - نسبة غياب الطلاب اليوم مرتفعة وتصل إلى ${Math.round(absentRate * 100)}%. يرجى مراجعة التواصل مع أولياء الأمور.`,
        icon: "⚠️",
        type: "warning"
      };
    }

    return {
      text: `${timeGreeting}! العمليات تسير بنشاط وتميز اليوم، حيث تم حضور ${totalActualPresent} طالب و ${todayEmpsPresent} من الكادر الوظيفي دون عوائق.`,
      icon: "✨",
      type: "success"
    };
  };

  const statusMessage = getTodayStatusMessage();

  return (
    <div>
      <UnifiedPageHeader
        icon="📊"
        title="لوحة التحكم والمتابعة اللحظية"
        subtitle="نظرة مركزية على العمليات التشغيلية، حضور الطلاب، الكادر الوظيفي، وتنبيهات النظام"
        badge={center?.name || 'مركز الأمل'}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-g btn-sm" onClick={() => refreshAlerts()}>
              🔄 تحديث
            </button>
            {canManual && (
              <button
                type="button"
                className="btn btn-p btn-sm"
                onClick={() => {
                  setManualForm({ ...EMPTY_MANUAL, date: todayStr() });
                  setShowManualForm(true);
                }}
              >
                ➕ إضافة تنبيه
              </button>
            )}
          </div>
        }
      />

      {/* شريط حالة المركز اليوم الذكي والديناميكي المتجاوب */}
      {showStatusBanner && (
        <div
          className="dashboard-status-banner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 16px',
            background: statusMessage.type === 'warning' ? 'var(--warn-l)' : statusMessage.type === 'success' ? 'var(--ok-l, #e6f9f0)' : 'var(--pr-l)',
            color: statusMessage.type === 'warning' ? 'var(--warn)' : statusMessage.type === 'success' ? 'var(--ok, #10b981)' : 'var(--pr)',
            border: `1px solid ${statusMessage.type === 'warning' ? 'var(--warn)' : statusMessage.type === 'success' ? 'var(--ok, #10b981)' : 'var(--border-color)'}`,
            borderRadius: 'var(--r)',
            marginBottom: 14,
            fontSize: 'clamp(0.78rem, 2.4vw, 0.88rem)',
            fontWeight: 700,
            animation: 'fadeIn 0.3s ease-in-out',
            boxShadow: 'var(--sh)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{statusMessage.icon}</span>
            <span style={{ lineHeight: 1.5, minWidth: 0 }}>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowStatusBanner(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '4px 6px',
              fontWeight: 'bold',
              opacity: 0.7,
              flexShrink: 0,
            }}
            title="إغلاق الشريط"
          >
            ✕
          </button>
        </div>
      )}

      {/* شريط التوقيت والترحيب المطور المتجاوب تماماً مع شاشات الجوال والحاسوب */}
      <div className="dashboard-clock-bar">
        {/* الساعة الكبيرة المريحة للعين */}
        <div className="dashboard-clock-time-sec">
          <span>{timeStr}</span>
          <span className="mobile-only-greeting" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--pr)', display: 'none' }}>
            {dayNameStr} — {clockData.greeting}
          </span>
        </div>

        {/* قسم البيانات الحية المرتب - منع التكرار */}
        <div className="dashboard-clock-info-sec">
          <div className="desktop-only-greeting" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 'clamp(0.85rem, 2.6vw, 1.05rem)', fontWeight: 900, color: 'var(--pr)' }}>{dayNameStr}</span>
            <span style={{ fontSize: 'clamp(0.72rem, 2.2vw, 0.84rem)', color: 'var(--g5)', fontWeight: 600 }}>— {clockData.greeting}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4, gap: 2 }}>
            <div style={{ fontSize: 'clamp(0.75rem, 2.3vw, 0.88rem)', fontWeight: 600, color: 'var(--g6)' }}>
              📅 ميلادي: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{numericDateStr}</span>
            </div>
            {hijriStr && (
              <div style={{ fontSize: 'clamp(0.75rem, 2.3vw, 0.88rem)', fontWeight: 700, color: 'var(--text-main)' }}>
                🌙 هجري: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{hijriStr}</span>
              </div>
            )}
          </div>
        </div>

        {/* معلومات المستخدم والمركز الحالية لتوثيق الواجهة */}
        <div className="dashboard-clock-user-sec">
          <div style={{ fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)', fontWeight: 900, color: 'var(--pr)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {center.name || 'المركز'}
          </div>
          <div style={{ fontSize: 'clamp(0.68rem, 2vw, 0.78rem)', color: 'var(--g5)', marginTop: 2 }}>
            {currentUser?.name} — {currentUser?.title || 'إدارة النظام'}
          </div>
        </div>
      </div>

      {/* كروت الإحصائيات الموحدة والتفاعلية */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="unified-stat-box clickable" onClick={() => go('hr')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">👥 الكادر الوظيفي</div>
          <div className="stat-val">{data.emps.length}</div>
          <div className="stat-sub">موظف وأخصائي نشط ←</div>
        </div>
        
        <div className="unified-stat-box clickable" onClick={() => go('students')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">🎓 الطلاب النشطون</div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>{activeStudents.length}</div>
          <div className="stat-sub">طالب منتظم ومسجل ←</div>
        </div>

        <div
          className="unified-stat-box clickable"
          onClick={() => { sessionStorage.setItem('scs_attendance_tab', 'sessions'); go('attendance'); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-label">🩺 حضور الجلسات اليوم</div>
          <div className="stat-val" style={{ color: 'var(--warn)' }}>
            {sessPresent} / {sessStudents.length}
          </div>
          <div className="stat-sub">جلسات حضورية مسجلة ←</div>
        </div>

        <div
          className="unified-stat-box clickable"
          onClick={() => { sessionStorage.setItem('scs_attendance_tab', 'morning'); go('attendance'); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-label">🏫 حضور الفصول اليوم</div>
          <div className="stat-val" style={{ color: 'var(--pr)' }}>
            {classPresent} / {classStudents.length}
          </div>
          <div className="stat-sub">صباحي + مسائي ←</div>
        </div>
      </div>

      {/* 1. محور التخصيص بحسب دور المستخدم */}
      <RoleAdaptiveHub
        currentUser={currentUser}
        data={data}
        today={today}
        go={go}
      />

      {/* 2. محور العمليات اللحظية وغرفة التحكم اليومية */}
      <LiveOperationsHub
        data={data}
        today={today}
        go={go}
        currentTime={clockData.time}
      />

      {/* 3. محور ذكاء الأعمال والرسوم البيانية المصغرة */}
      <VisualAnalyticsHub
        data={data}
        go={go}
      />

      {/* التنبيهات */}
      <div className="wg" style={{ marginBottom: 14 }}>
        <div className="wg-h" style={{ flexWrap: 'wrap', gap: 8 }}>
          <h3>🔔 التنبيهات</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginRight: 'auto' }}>
            <button type="button" className="btn btn-g btn-sm" onClick={() => refreshAlerts()}>
              🔄 تحديث
            </button>
            {canManual && (
              <button
                type="button"
                className="btn btn-p btn-sm"
                onClick={() => {
                  setManualForm({ ...EMPTY_MANUAL, date: todayStr() });
                  setShowManualForm(true);
                }}
              >
                ➕ إضافة تنبيه
              </button>
            )}
          </div>
        </div>
        <div className="wg-b">
          {alerts.length === 0 ? (
            <div style={{ color: 'var(--g4)', fontSize: '.9rem', textAlign: 'center', padding: '16px 0' }}>✅ لا توجد تنبيهات حالياً</div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '.78rem', fontWeight: 900, color: 'var(--pr)', marginBottom: 8 }}>{cat}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(a => (
                    <div
                      key={a.id}
                      onClick={() => a.action && go(a.action)}
                      style={{
                        ...SEV_STYLE[a.severity] || SEV_STYLE.info,
                        padding: '10px 14px',
                        borderRadius: 'var(--r2)',
                        cursor: a.action ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontWeight: 800, flex: 1, minWidth: 200 }}>{a.title}</span>
                      {a.detail && <span style={{ fontSize: '.8rem', opacity: 0.95, flex: '1 1 100%' }}>{a.detail}</span>}
                      <span style={{ fontSize: '.68rem', fontWeight: 700 }}>{SEV_LABEL[a.severity] || ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          {canManual && lsGet('manualAlerts').length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '.78rem', fontWeight: 900, marginBottom: 8 }}>إدارة التنبيهات اليدوية</div>
              {lsGet('manualAlerts')
                .sort((x, y) => (y.date || '').localeCompare(x.date || ''))
                .map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '.84rem' }}>
                    <span style={{ flex: 1 }}>
                      <b>{m.title}</b> · {m.date} {m.time || ''}
                    </span>
                    <button type="button" className="btn btn-xs btn-d" onClick={() => delManual(m.id)}>
                      حذف
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {showManualForm && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setShowManualForm(false)}>
          <div className="mb mb-sm" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
              <h2>➕ تنبيه يدوي</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label>
                    العنوان <span className="req">*</span>
                  </label>
                  <input value={manualForm.title} onChange={fldM('title')} placeholder="اسم الحدث أو التنبيه" />
                </div>
                <div className="fl full">
                  <label>التفاصيل</label>
                  <textarea value={manualForm.details} onChange={fldM('details')} rows={3} placeholder="وصف إضافي" />
                </div>
                <div className="fl">
                  <label>
                    التاريخ <span className="req">*</span>
                  </label>
                  <input type="date" value={manualForm.date} onChange={fldM('date')} />
                </div>
                <div className="fl">
                  <label>الوقت</label>
                  <input type="time" value={manualForm.time} onChange={fldM('time')} />
                </div>
                <div className="fl full">
                  <label>درجة الأهمية</label>
                  <select value={manualForm.severity} onChange={fldM('severity')}>
                    <option value="urgent">عاجل</option>
                    <option value="warn">تحذير</option>
                    <option value="info">معلومة</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={saveManual}>
                💾 حفظ
              </button>
              <button type="button" className="btn btn-g" onClick={() => setShowManualForm(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="wg" style={{ marginBottom: 14 }}>
        <div className="wg-h">
          <h3>⚡ وصول سريع</h3>
        </div>
        <div className="wg-b" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['📅 تسجيل الحضور', 'attendance'],
            ['🩺 الجلسات', 'sessions'],
            ['🌴 الإجازات', 'hr-leaves'],
            ['💳 إدارة المركز', 'center'],
            ['📈 الإحصائيات', 'statistics'],
            ['🗓️ التقويم', 'calendar'],
          ].map(([label, view]) => (
            <button key={view} type="button" className="btn btn-s btn-sm" onClick={() => go(view)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="g2">
        <div>
          <div className="wg">
            <div className="wg-h">
              <h3>📅 حضور الطلاب — اليوم</h3>
              <button type="button" className="btn btn-g btn-sm" onClick={() => go('attendance')}>
                عرض الكل
              </button>
            </div>
            <div className="wg-b p0">
              {todayAtt.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--g4)', fontSize: '.84rem' }}>لم يُسجَّل حضور اليوم بعد</div>
              ) : (
                todayAtt.map(a => {
                  const s = data.students.find(x => x.id === a.kidId);
                  const statusColors = { present: 'var(--ok)', absent: 'var(--err)', late: 'var(--warn)' };
                  const statusLabel = { present: '✅ حاضر', absent: '❌ غائب', late: '⚠️ متأخر' };
                  return (
                    <div
                      key={a.id || a.kidId + a.session}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid var(--border-color)' }}
                    >
                      <div className="av" style={{ width: 32, height: 32, fontSize: '.75rem' }}>
                        {(s?.name || '?').slice(0, 2)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.84rem', fontWeight: 700 }}>{s?.name || '—'}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--g4)' }}>
                          {a.session === 'morning' ? '☀️ صباحي' : a.session === 'evening' ? '🌙 مسائي' : '🩺 جلسات'}
                        </div>
                      </div>
                      <span style={{ fontSize: '.75rem', fontWeight: 700, color: statusColors[a.status] || 'var(--g5)' }}>{statusLabel[a.status] || a.status}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {appts.length > 0 && (
            <div className="wg">
              <div className="wg-h">
                <h3>📅 المواعيد القادمة</h3>
              </div>
              <div className="wg-b p0">
                {appts.map(a => {
                  const s = data.students.find(x => x.id === a.stuId);
                  const isToday = a.date === today;
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid var(--border-color)' }}>
                      <div className="av cyan" style={{ width: 32, height: 32, fontSize: '.8rem' }}>
                        📅
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.84rem', fontWeight: 700 }}>
                          {s?.name || '—'} — {a.type}
                        </div>
                        <div style={{ fontSize: '.7rem', color: 'var(--g4)' }}>
                          {a.date} {a.time && '· ' + a.time}
                        </div>
                      </div>
                      {isToday && <span className="bdg b-rd">اليوم</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="wg">
            <div className="wg-h">
              <h3>📋 آخر الجلسات العلاجية</h3>
              <button type="button" className="btn btn-g btn-sm" onClick={() => go('sessions')}>
                عرض الكل
              </button>
            </div>
            <div className="wg-b">
              {recentSessions.length === 0 ? (
                <div style={{ color: 'var(--g4)', fontSize: '.84rem', textAlign: 'center', padding: '12px 0' }}>لا توجد جلسات مسجلة</div>
              ) : (
                recentSessions.map(s => {
                  const stu = data.students.find(x => x.id === s.stuId);
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 8,
                        padding: '8px 12px',
                        background: 'var(--pur-l)',
                        borderRadius: 'var(--r2)',
                        border: '1px solid #ddd6fe',
                      }}
                    >
                      <span>🩺</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.84rem', fontWeight: 700 }}>{stu?.name || '—'}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--pur)', display:'flex', gap:4, flexWrap:'wrap' }}>
                          <span>{s.type}</span>
                          <span>·</span>
                          <span>{s.date}</span>
                          {s.time && (() => {
                            const [h, m] = (s.time || '').split(':').map(Number);
                            if (isNaN(h)) return null;
                            const ampm = h >= 12 ? 'م' : 'ص';
                            const h12 = h % 12 || 12;
                            return <span>· {h12}:{String(m).padStart(2,'0')} {ampm}</span>;
                          })()}
                        </div>
                      </div>
                      <span className={`bdg ${s.status === 'done' ? 'b-gr' : 'b-or'}`}>{s.status === 'done' ? '✅ منجزة' : '⏳ مجدولة'}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
