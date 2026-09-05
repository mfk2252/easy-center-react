import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd } from '../../hooks/useStorage';
import { uid, daysInMonth } from '../../utils/dateHelpers';
import { CalendarCheck, ChevronRight, ChevronLeft, Calendar, ArrowRight, UserCheck, Clock } from 'lucide-react';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';

function monthKey(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); }
function monthLabel(d) { return d.toLocaleDateString('ar-SA', { month:'long', year:'numeric' }); }

const STATUS_LABEL = { present:'✅ حاضر', absent:'❌ غائب', late:'⚠️ متأخر', leave:'🌴 إجازة', holiday:'🔴 عطلة' };
const STATUS_COLOR = { present:'var(--ok)', absent:'var(--err)', late:'var(--warn)', leave:'var(--cyan)', holiday:'var(--g4)' };

export default function HrAttendance() {
  const { go } = useApp();
  const [view, setView] = useState('monthly');
  const [month, setMonth] = useState(new Date());
  const [emps, setEmps] = useState([]);
  const [attEmp, setAttEmp] = useState([]);
  const [selEmp, setSelEmp] = useState('all');

  useEffect(() => {
    setEmps(lsGet('employees') || []);
    setAttEmp(lsGet('attEmp') || []);
  }, []);

  function reload() { setAttEmp(lsGet('attEmp') || []); }

  const mk = monthKey(month);
  const year = month.getFullYear();
  const mon = month.getMonth();
  const days = daysInMonth(year, mon);
  const daysArr = Array.from({ length: days }, (_, i) => {
    const d = new Date(year, mon, i+1);
    return { day: i+1, dateStr: `${year}-${String(mon+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`, dow: d.getDay() };
  });

  function getStatus(empId, dateStr) {
    return attEmp.find(a => a.empId === empId && a.date === dateStr);
  }

  async function setStatus(empId, dateStr, status) {
    const existing = getStatus(empId, dateStr);
    if (existing) { lsUpd('attEmp', existing.id, { status }); }
    else { lsAdd('attEmp', { id: uid(), empId, date: dateStr, status, timeIn:'', timeOut:'' }); }
    reload();
  }

  const displayEmps = selEmp === 'all' ? emps : emps.filter(e => e.id === selEmp);

  function countForEmp(empId) {
    const empAtt = attEmp.filter(a => a.empId === empId && a.date.startsWith(mk));
    return {
      present: empAtt.filter(a => a.status === 'present').length,
      absent: empAtt.filter(a => a.status === 'absent').length,
      late: empAtt.filter(a => a.status === 'late').length,
      leave: empAtt.filter(a => a.status === 'leave').length,
    };
  }

  function goToDailyAttendance() {
    sessionStorage.setItem('scs_attendance_tab', 'emp');
    go('attendance');
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl' }}>
      
      {/* الترويسة الموحدة */}
      <UnifiedPageHeader
        icon={<CalendarCheck style={{ width: 24, height: 24 }} />}
        iconBg="rgba(245, 158, 11, 0.15)"
        iconColor="#d97706"
        accentColor="#d97706"
        title="سجل حضور وانصراف الكوادر"
        subtitle="متابعة الحضور اليومي والشبكة الشهرية لكافة الموظفين"
        badge={`${emps.length} موظف`}
        actions={
          <button
            className="btn btn-p"
            onClick={goToDailyAttendance}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: '0.86rem' }}
          >
            <UserCheck style={{ width: 16, height: 16 }} />
            <span>تسجيل الحضور اليومي السريع</span>
          </button>
        }
        onBack={() => go('hr')}
        backLabel="العودة للوحة الموظفين"
      />

      {/* تبويب العرض (شهري / يومي) */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${view === 'monthly' ? 'on' : ''}`} onClick={() => setView('monthly')}>
          🗓️ سجل الحضور الشهري التفاعلي
        </button>
        <button className={`tab ${view === 'daily' ? 'on' : ''}`} onClick={() => setView('daily')}>
          📅 التسجيل اليومي المباشر
        </button>
      </div>

      {view === 'daily' && (
        <div className="unified-card" style={{ textAlign: 'center', padding: '50px 24px', margin: '20px auto', maxWidth: 640 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <CalendarCheck style={{ width: 32, height: 32 }} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
            تسجيل الحضور اليومي للكوادر
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 24, maxWidth: 480, marginInline: 'auto' }}>
            يتم تسجيل حضور وانصراف الموظفين اليومي من الشاشة الموحدة للحضور (المشتركة بين الطلاب والكوادر) لضمان توثيق المواعيد والأوقات بدقة وفي لحظتها.
          </p>
          <button
            type="button"
            className="btn btn-p"
            onClick={goToDailyAttendance}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', fontSize: '0.95rem' }}
          >
            <span>فتح شاشة تسجيل الحضور اليومي</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}

      {view === 'monthly' && (
        <>
          {/* شريط اختيار الشهر والفلترة الموحد */}
          <div className="unified-filter-toolbar" style={{ gridTemplateColumns: 'auto 1fr', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <button
                className="btn btn-g btn-sm"
                onClick={() => setMonth(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <ChevronRight style={{ width: 14, height: 14 }} />
                <span>الشهر السابق</span>
              </button>
              <button
                className="btn btn-p btn-sm"
                onClick={() => setMonth(new Date())}
                style={{ padding: '6px 14px' }}
              >
                الشهر الحالي
              </button>
              <button
                className="btn btn-g btn-sm"
                onClick={() => setMonth(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <span>الشهر التالي</span>
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>
              <span className="bdg b-gr" style={{ fontSize: '0.85rem', padding: '4px 10px', fontWeight: 800 }}>
                {monthLabel(month)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <select
                className="srch"
                value={selEmp}
                onChange={e => setSelEmp(e.target.value)}
                style={{ height: 38, fontSize: '0.85rem', fontWeight: 600, minWidth: 200 }}
              >
                <option value="all">👥 جميع الموظفين ({emps.length})</option>
                {emps.map(e => <option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
              </select>
            </div>
          </div>

          {/* مفتاح الحالات التوضيحي */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)' }}>دليل الرموز:</span>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <span key={k} style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {v}
              </span>
            ))}
          </div>

          {/* شبكة الحضور الشهرية لكل موظف */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {displayEmps.map(emp => {
              const counts = countForEmp(emp.id);
              return (
                <div
                  key={emp.id}
                  className="unified-card"
                  style={{
                    padding: '16px 20px',
                    borderRight: '5px solid var(--pr)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: 'rgba(26, 86, 219, 0.1)',
                          color: 'var(--pr)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {(emp.name || '?').slice(0, 2)}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {emp.name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{emp.role}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, fontSize: '0.76rem', flexWrap: 'wrap' }}>
                      <span className="bdg b-gr">✅ حضور: {counts.present}</span>
                      <span className="bdg b-rd">❌ غياب: {counts.absent}</span>
                      <span className="bdg b-or">⚠️ تأخير: {counts.late}</span>
                      <span className="bdg b-cy">🌴 إجازة: {counts.leave}</span>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 4, minWidth: days * 42 }}>
                      {daysArr.map(({ day, dateStr, dow }) => {
                        const rec = getStatus(emp.id, dateStr);
                        const isWeekend = dow === 5 || dow === 6;
                        const st = rec?.status || (isWeekend ? 'holiday' : null);
                        return (
                          <div key={dateStr} style={{ textAlign: 'center', minWidth: 38 }}>
                            <div style={{ fontSize: '0.68rem', color: isWeekend ? 'var(--err)' : 'var(--text-sub)', fontWeight: 700, marginBottom: 4 }}>
                              {day}
                            </div>
                            <select
                              value={st || ''}
                              onChange={e => setStatus(emp.id, dateStr, e.target.value)}
                              style={{
                                width: 38,
                                height: 30,
                                fontSize: '0.7rem',
                                padding: '2px',
                                borderRadius: 6,
                                border: '1px solid var(--border-color)',
                                background: st ? STATUS_COLOR[st] + '22' : 'var(--bg-card)',
                                color: st ? STATUS_COLOR[st] : 'var(--text-sub)',
                                cursor: 'pointer',
                                fontWeight: 700,
                                textAlign: 'center',
                              }}
                            >
                              <option value="">—</option>
                              <option value="present">✅</option>
                              <option value="absent">❌</option>
                              <option value="late">⚠️</option>
                              <option value="leave">🌴</option>
                              <option value="holiday">🔴</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

