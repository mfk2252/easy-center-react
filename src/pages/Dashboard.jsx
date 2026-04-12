import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../hooks/useStorage';
import { todayStr, uid, formatHijriDate } from '../utils/dateHelpers';
import { collectSystemAlerts } from '../utils/alertEngine';

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

  const timeStr = clockData.time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = clockData.time.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hijriStr = formatHijriDate(clockData.time);

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

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>📊 لوحة التحكم</h2>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: 'clamp(10px, 2vw, 16px) clamp(12px, 3vw, 22px)',
          background: 'var(--bg-card)',
          borderRadius: 'var(--r)',
          border: '1px solid var(--border-color)',
          marginBottom: 14,
          boxShadow: 'var(--sh)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 'clamp(1.15rem, 4vw, 1.75rem)', fontVariantNumeric: 'tabular-nums', letterSpacing: 1, fontWeight: 900 }}>{timeStr}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'clamp(0.72rem, 2.2vw, 0.84rem)', color: 'var(--g5)', fontWeight: 500 }}>{clockData.greeting}</div>
          {hijriStr && (
            <div style={{ fontSize: 'clamp(0.78rem, 2.4vw, 0.92rem)', fontWeight: 800, color: 'var(--text-main)', marginTop: 2, lineHeight: 1.35 }}>{hijriStr}</div>
          )}
          <div style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.98rem)', fontWeight: 600, color: 'var(--g6)', marginTop: 2, lineHeight: 1.35 }}>{dateStr}</div>
        </div>
        <div style={{ borderRight: '2px solid var(--border-color)', paddingRight: 16, textAlign: 'right', minWidth: 0 }}>
          <div style={{ fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)', fontWeight: 900, color: 'var(--pr)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'min(220px, 40vw)' }}>{center.name}</div>
          <div style={{ fontSize: 'clamp(0.68rem, 2vw, 0.78rem)', color: 'var(--g5)', marginTop: 2 }}>
            {currentUser?.name} — {currentUser?.title || ''}
          </div>
        </div>
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="sc">
          <div className="lb">الموظفون</div>
          <div className="vl">{data.emps.length}</div>
          <div className="sb">موظف نشط</div>
        </div>
        <div className="sc g">
          <div className="lb">الطلاب النشطون</div>
          <div className="vl">{activeStudents.length}</div>
          <div className="sb">طالب نشط</div>
        </div>
        <div className="sc o">
          <div className="lb">حضور الجلسات اليوم</div>
          <div className="vl">
            {sessPresent}/{sessStudents.length}
          </div>
          <div className="sb">جلسات حضورية</div>
        </div>
        <div className="sc v">
          <div className="lb">حضور الصفوف اليوم</div>
          <div className="vl">
            {classPresent}/{classStudents.length}
          </div>
          <div className="sb">صباحي + مسائي</div>
        </div>
      </div>

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
            ['📅 الحضور السريع', 'attendance'],
            ['🩺 الجلسات', 'sessions'],
            ['🌴 الإجازات', 'hr-leaves'],
            ['💳 إدارة المركز', 'center'],
            ['📊 التقارير', 'reports'],
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
                        <div style={{ fontSize: '.72rem', color: 'var(--pur)' }}>
                          {s.type} · {s.date}
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
