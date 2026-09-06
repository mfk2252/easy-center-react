import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd } from '../../hooks/useStorage';
import { todayStr, nowTimeStr, uid } from '../../utils/dateHelpers';
import { CalendarCheck, ChevronRight, ChevronLeft, Calendar, Palmtree, AlertTriangle, Clock, CheckCircle2, XCircle, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';

const STATUS_MAP = { present: '✅ حاضر', absent: '❌ غائب', late: '⚠️ متأخر', leave: '🌴 إجازة معتمدة' };

export default function AttendancePage() {
  const { toast, go } = useApp();
  const [tab, setTab] = useState(() => sessionStorage.getItem('scs_attendance_tab') || 'emp');
  const [dateStr, setDateStr] = useState(todayStr());
  const [emps, setEmps] = useState([]);
  const [students, setStudents] = useState([]);
  const [attEmp, setAttEmp] = useState([]);
  const [attStu, setAttStu] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [timeModal, setTimeModal] = useState(null); // { type:'emp'|'stu', id, status, session, note }
  const [leaveConflict, setLeaveConflict] = useState(null); // { emp, status, leave, dateStr }
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');

  useEffect(() => {
    setEmps(lsGet('employees') || []);
    setStudents(lsGet('students') || []);
    reload();
  }, []);

  function reload() {
    setAttEmp(lsGet('attEmp') || []);
    setAttStu(lsGet('attStu') || []);
    setLeaves(lsGet('leaves') || []);
  }

  function navDate(n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    setDateStr(d.toISOString().split('T')[0]);
  }

  // Leaves integration helpers
  function getEmpLeave(empId, dStr) {
    return (leaves || []).find(l =>
      l.empId === empId &&
      l.status === 'approved' &&
      l.from <= dStr &&
      dStr <= l.to
    );
  }

  function getEmpPendingLeave(empId, dStr) {
    return (leaves || []).find(l =>
      l.empId === empId &&
      l.status === 'pending' &&
      l.from <= dStr &&
      dStr <= l.to
    );
  }

  // Employees
  function getEmpAtt(empId) {
    return attEmp.find(a => a.empId === empId && a.date === dateStr);
  }

  function markEmp(empId, status) {
    const e = emps.find(x => x.id === empId);
    const approvedLeave = getEmpLeave(empId, dateStr);

    // If employee is on approved leave and we try to mark him present or late:
    if (approvedLeave && (status === 'present' || status === 'late')) {
      setLeaveConflict({
        emp: e,
        status,
        leave: approvedLeave,
        dateStr,
      });
      return;
    }

    // If employee is on approved leave and we try to mark absent:
    if (approvedLeave && status === 'absent') {
      const confirmAbsent = window.confirm(
        `⚠️ تنبيه: الموظف (${e?.name}) في إجازة معتمدة رسمياً اليوم (${approvedLeave.type}).\nهل أنت متأكد من تسجيله كـ "غائب"؟ (يُفضل تركه في حالة "إجازة معتمدة" لتفادي الخصم من الراتب).`
      );
      if (!confirmAbsent) {
        saveEmpStatus(empId, 'leave', '', '', `إجازة معتمدة: ${approvedLeave.type}`);
        toast('🌴 تم تثبيت الموظف في إجازته الرسمية', 'ok');
        return;
      }
    }

    // If mark as leave
    if (status === 'leave') {
      saveEmpStatus(empId, 'leave', '', '', approvedLeave ? `إجازة معتمدة: ${approvedLeave.type}` : 'إجازة');
      toast('🌴 تم تسجيل حالة الإجازة', 'ok');
      return;
    }

    const now = nowTimeStr();
    const rec = getEmpAtt(empId);
    if (status === 'present' || status === 'late') {
      setTimeModal({ type: 'emp', id: empId, status });
      setTimeIn(rec?.timeIn || now);
      setTimeOut(rec?.timeOut || '');
    } else {
      saveEmpStatus(empId, status, '', '');
    }
  }

  function saveEmpStatus(empId, status, tin, tout, note = '') {
    const rec = getEmpAtt(empId);
    const data = { empId, date: dateStr, status, timeIn: tin, timeOut: tout, note: note || rec?.note || '' };
    if (rec) lsUpd('attEmp', rec.id, data);
    else lsAdd('attEmp', { ...data, id: uid() });
    reload();
    setTimeModal(null);
  }

  // Handle Leave Conflict Resolution: Choice 1 (Cancel/Adjust leave & Attend)
  function handleCancelLeaveAndAttend() {
    if (!leaveConflict) return;
    const { emp, status, leave } = leaveConflict;

    // Smart leave adjustment
    if (leave.from === dateStr && leave.to === dateStr) {
      lsUpd('leaves', leave.id, {
        ...leave,
        status: 'cancelled',
        notes: (leave.notes ? leave.notes + ' | ' : '') + `أُلغيت الإجازة لحضور الموظف في ${dateStr}`
      });
    } else if (leave.from === dateStr) {
      const nextDay = new Date(dateStr);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      lsUpd('leaves', leave.id, {
        ...leave,
        from: nextDayStr,
        notes: (leave.notes ? leave.notes + ' | ' : '') + `تم تعديل البداية لـ ${nextDayStr} لحضور الموظف في ${dateStr}`
      });
    } else if (leave.to === dateStr) {
      const prevDay = new Date(dateStr);
      prevDay.setDate(prevDay.getDate() - 1);
      const prevDayStr = prevDay.toISOString().split('T')[0];
      lsUpd('leaves', leave.id, {
        ...leave,
        to: prevDayStr,
        notes: (leave.notes ? leave.notes + ' | ' : '') + `تم تعديل النهاية لـ ${prevDayStr} لحضور الموظف في ${dateStr}`
      });
    } else {
      lsUpd('leaves', leave.id, {
        ...leave,
        notes: (leave.notes ? leave.notes + ' | ' : '') + `الموظف قطع إجازته وحضر في تاريخ ${dateStr}`
      });
    }

    const now = nowTimeStr();
    const rec = getEmpAtt(emp.id);
    setTimeModal({
      type: 'emp',
      id: emp.id,
      status,
      note: 'حضر بعد إلغاء/تعديل الإجازة'
    });
    setTimeIn(rec?.timeIn || now);
    setTimeOut(rec?.timeOut || '');
    setLeaveConflict(null);
    reload();
    toast('✅ تم تحديث سجل الإجازة والبدء بتسجيل الحضور', 'ok');
  }

  // Handle Leave Conflict Resolution: Choice 2 (Exceptional attendance while keeping leave)
  function handleExceptionalAttendance() {
    if (!leaveConflict) return;
    const { emp, status, leave } = leaveConflict;
    const now = nowTimeStr();
    const rec = getEmpAtt(emp.id);
    setTimeModal({
      type: 'emp',
      id: emp.id,
      status,
      note: `حضور استثنائي أثناء إجازة (${leave.type})`
    });
    setTimeIn(rec?.timeIn || now);
    setTimeOut(rec?.timeOut || '');
    setLeaveConflict(null);
    reload();
    toast('✅ تم اعتماد الحضور الاستثنائي مع بقاء قرار الإجازة', 'ok');
  }

  // Handle Leave Conflict Resolution: Choice 3 (Keep on leave)
  function handleKeepLeave() {
    if (!leaveConflict) return;
    const { emp, leave } = leaveConflict;
    saveEmpStatus(emp.id, 'leave', '', '', `إجازة معتمدة: ${leave.type}`);
    setLeaveConflict(null);
    toast('🌴 تم تأكيد بقاء الموظف في إجازته الرسمية', 'ok');
  }

  // Students
  function getStuAtt(stuId, session) {
    return attStu.find(a => a.kidId === stuId && a.date === dateStr && a.session === session);
  }

  function markStu(stuId, session, status) {
    const now = nowTimeStr();
    const rec = getStuAtt(stuId, session);
    if (status === 'present' || status === 'late') {
      setTimeModal({ type: 'stu', id: stuId, session, status });
      setTimeIn(rec?.timeIn || now);
      setTimeOut(rec?.timeOut || '');
    } else {
      saveStuStatus(stuId, session, status, '', '');
    }
  }

  function saveStuStatus(stuId, session, status, tin, tout) {
    const rec = getStuAtt(stuId, session);
    const data = { kidId: stuId, date: dateStr, session, status, timeIn: tin, timeOut: tout };
    if (rec) lsUpd('attStu', rec.id, data);
    else lsAdd('attStu', { ...data, id: uid() });
    reload();
    setTimeModal(null);
  }

  const sessionStu = (session) => students.filter(s => {
    if (!['active'].includes(s.status)) return false;
    if (session === 'morning') return s.progMorning?.enabled;
    if (session === 'evening') return s.progEvening?.enabled;
    if (session === 'sessions') return s.progSessions?.enabled;
    if (session === 'online') return s.progOnline?.enabled;
    return false;
  });

  const empStats = {
    present: attEmp.filter(a => a.date === dateStr && a.status === 'present').length,
    late: attEmp.filter(a => a.date === dateStr && a.status === 'late').length,
    leave: emps.filter(e => {
      const rec = getEmpAtt(e.id);
      if (rec?.status === 'leave') return true;
      if (!rec && getEmpLeave(e.id, dateStr)) return true;
      return false;
    }).length,
    absent: attEmp.filter(a => a.date === dateStr && a.status === 'absent').length,
  };

  const SESSION_TABS = [
    ['emp', '👥 الكوادر والموظفون'],
    ['morning', '☀️ الطلاب (صباحي)'],
    ['evening', '🌙 الطلاب (مسائي)'],
    ['sessions', '🩺 الجلسات الفردية'],
    ['online', '🌐 عن بُعد'],
  ];

  function renderEmpList() {
    return emps.map(e => {
      const rec = getEmpAtt(e.id);
      const approvedLeave = getEmpLeave(e.id, dateStr);
      const pendingLeave = getEmpPendingLeave(e.id, dateStr);
      const st = rec?.status || (approvedLeave ? 'leave' : null);

      return (
        <div
          key={e.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            background: approvedLeave ? 'rgba(8, 145, 178, 0.03)' : 'transparent',
            borderRight: approvedLeave ? '4px solid #0891b2' : '4px solid transparent',
          }}
        >
          <div className="av" style={{ width: 40, height: 40, fontSize: '.88rem', fontWeight: 700 }}>
            {e.photo ? <img src={e.photo} style={{ width: 40, height: 40, objectFit: 'cover' }} alt="" /> : (e.name || '?').slice(0, 2)}
          </div>

          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--text-main)' }}>{e.name}</div>
              {approvedLeave && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(8, 145, 178, 0.15)',
                    color: '#0891b2',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                  }}
                >
                  <Palmtree style={{ width: 12, height: 12 }} />
                  <span>في إجازة معتمدة ({approvedLeave.type})</span>
                </span>
              )}
              {pendingLeave && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#d97706',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                  }}
                >
                  <Clock style={{ width: 12, height: 12 }} />
                  <span>طلب إجازة معلق ({pendingLeave.type})</span>
                </span>
              )}
            </div>

            <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
              {e.role}
              {rec?.timeIn && ' · دخل: ' + rec.timeIn}
              {rec?.timeOut && ' · خرج: ' + rec.timeOut}
              {rec?.note && <span style={{ color: 'var(--pr)', fontWeight: 600 }}> · {rec.note}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              ['present', '✅ حاضر'],
              ['late', '⚠️ متأخر'],
              ['leave', '🌴 إجازة'],
              ['absent', '❌ غائب'],
            ].map(([s, l]) => {
              const isActive = st === s;
              let btnClass = 'btn-g';
              if (isActive) {
                if (s === 'present') btnClass = 'btn-p';
                else if (s === 'late') btnClass = 'btn-s';
                else if (s === 'leave') btnClass = 'btn-v';
                else if (s === 'absent') btnClass = 'btn-d';
              }
              return (
                <button
                  key={s}
                  onClick={() => markEmp(e.id, s)}
                  className={`btn btn-xs ${btnClass}`}
                  style={{
                    fontWeight: isActive ? 800 : 500,
                    opacity: isActive ? 1 : 0.75,
                    padding: '5px 10px',
                  }}
                >
                  {l}
                </button>
              );
            })}

            {rec?.status === 'present' && (
              <button
                className="btn btn-xs btn-v"
                onClick={() => {
                  const now = nowTimeStr();
                  const rec2 = getEmpAtt(e.id);
                  if (rec2) lsUpd('attEmp', rec2.id, { ...rec2, timeOut: now });
                  reload();
                  toast('✅ تم تسجيل الانصراف والخروج', 'ok');
                }}
                style={{ padding: '5px 10px' }}
              >
                🚪 انصراف
              </button>
            )}
          </div>
        </div>
      );
    });
  }

  function renderStuList(session) {
    const list = sessionStu(session);
    if (list.length === 0) {
      return (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-sub)', fontSize: '.88rem' }}>
          لا يوجد طلاب مسجلون في هذا القسم
        </div>
      );
    }
    return list.map(s => {
      const rec = getStuAtt(s.id, session);
      const st = rec?.status;
      return (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <div className="av" style={{ width: 40, height: 40, fontSize: '.88rem', fontWeight: 700 }}>
            {s.photo ? <img src={s.photo} style={{ width: 40, height: 40, objectFit: 'cover' }} alt="" /> : (s.name || '?').slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--text-main)' }}>{s.name}</div>
            <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
              {s.diagnosis}{rec?.timeIn && ' · دخل: ' + rec.timeIn}{rec?.timeOut && ' · خرج: ' + rec.timeOut}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {[['present', '✅'], ['late', '⚠️'], ['absent', '❌']].map(([st2, l]) => (
              <button
                key={st2}
                onClick={() => markStu(s.id, session, st2)}
                className={`btn btn-xs ${st === st2 ? 'btn-p' : 'btn-g'}`}
                style={st === st2 ? { opacity: 1, fontWeight: 700 } : { opacity: .7 }}
              >
                {l}
              </button>
            ))}
            {rec?.status === 'present' && (
              <button
                className="btn btn-xs btn-v"
                onClick={() => {
                  const now = nowTimeStr();
                  const rec2 = getStuAtt(s.id, session);
                  if (rec2) lsUpd('attStu', rec2.id, { ...rec2, timeOut: now });
                  reload();
                  toast('✅ تم تسجيل الخروج', 'ok');
                }}
              >
                🚪 خروج
              </button>
            )}
          </div>
          {s.parentPhone && (
            <a
              href={`https://wa.me/${s.parentPhone.replace(/[^0-9+]/g, '').replace(/^0/, '966')}?text=${encodeURIComponent('نود إشعاركم بغياب ' + s.name + ' اليوم')}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-xs btn-bl"
              style={st === 'absent' ? {} : { opacity: .3 }}
              title="إشعار ولي الأمر"
            >
              💬 واتساب
            </a>
          )}
        </div>
      );
    });
  }

  const curSession = tab === 'emp' ? null : tab;
  const curList = curSession ? sessionStu(curSession) : emps;
  const stuStats = curSession ? {
    present: attStu.filter(a => a.date === dateStr && a.session === curSession && a.status === 'present').length,
    absent: attStu.filter(a => a.date === dateStr && a.session === curSession && a.status === 'absent').length,
    late: attStu.filter(a => a.date === dateStr && a.session === curSession && a.status === 'late').length,
  } : null;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl' }}>
      
      {/* الترويسة الموحدة */}
      <UnifiedPageHeader
        icon={<CalendarCheck style={{ width: 24, height: 24 }} />}
        iconBg="rgba(26, 86, 219, 0.15)"
        iconColor="var(--pr)"
        accentColor="var(--pr)"
        title="تسجيل الحضور اليومي"
        subtitle="تسجيل وتوثيق حضور وانصراف الكوادر والطلاب مع الربط الذكي بالإجازات"
        badge={dateStr}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="btn btn-g btn-sm" onClick={() => navDate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronRight style={{ width: 14, height: 14 }} />
              <span>السابق</span>
            </button>
            <button className="btn btn-p btn-sm" onClick={() => setDateStr(todayStr())}>
              اليوم
            </button>
            <button className="btn btn-g btn-sm" onClick={() => navDate(1)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>التالي</span>
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
          </div>
        }
      />

      {/* تبويبات الأقسام */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {SESSION_TABS.map(([v, l]) => (
          <button key={v} className={`tab ${tab === v ? 'on' : ''}`} onClick={() => setTab(v)}>
            {l}
          </button>
        ))}
      </div>

      {/* شريط الإحصائيات السريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
        {tab === 'emp' ? (
          <>
            <div className="unified-stat-box" style={{ padding: '10px 14px' }}>
              <div className="stat-label">✅ حاضر</div>
              <div className="stat-val" style={{ color: 'var(--ok)', fontSize: '1.3rem' }}>{empStats.present}</div>
            </div>
            <div className="unified-stat-box" style={{ padding: '10px 14px' }}>
              <div className="stat-label">⚠️ متأخر</div>
              <div className="stat-val" style={{ color: 'var(--warn)', fontSize: '1.3rem' }}>{empStats.late}</div>
            </div>
            <div className="unified-stat-box" style={{ padding: '10px 14px' }}>
              <div className="stat-label">🌴 في إجازة</div>
              <div className="stat-val" style={{ color: '#0891b2', fontSize: '1.3rem' }}>{empStats.leave}</div>
            </div>
            <div className="unified-stat-box" style={{ padding: '10px 14px' }}>
              <div className="stat-label">❌ غائب</div>
              <div className="stat-val" style={{ color: 'var(--err)', fontSize: '1.3rem' }}>{empStats.absent}</div>
            </div>
            <div className="unified-stat-box" style={{ padding: '10px 14px' }}>
              <div className="stat-label">👥 الإجمالي</div>
              <div className="stat-val" style={{ fontSize: '1.3rem' }}>{emps.length}</div>
            </div>
          </>
        ) : (
          <>
            <div className="unified-stat-box" style={{ padding: '10px 14px' }}>
              <div className="stat-label">✅ حاضر</div>
              <div className="stat-val" style={{ color: 'var(--ok)', fontSize: '1.3rem' }}>{stuStats?.present || 0}</div>
            </div>
            <div className="unified-stat-box" style={{ padding: '10px 14px' }}>
              <div className="stat-label">⚠️ متأخر</div>
              <div className="stat-val" style={{ color: 'var(--warn)', fontSize: '1.3rem' }}>{stuStats?.late || 0}</div>
            </div>
            <div className="unified-stat-box" style={{ padding: '10px 14px' }}>
              <div className="stat-label">❌ غائب</div>
              <div className="stat-val" style={{ color: 'var(--err)', fontSize: '1.3rem' }}>{stuStats?.absent || 0}</div>
            </div>
            <div className="unified-stat-box" style={{ padding: '10px 14px' }}>
              <div className="stat-label">🎒 إجمالي الطلاب</div>
              <div className="stat-val" style={{ fontSize: '1.3rem' }}>{curList.length}</div>
            </div>
          </>
        )}
      </div>

      {/* قائمة الحضور الموحدة */}
      <div className="unified-card" style={{ padding: 0, overflow: 'hidden' }}>
        {tab === 'emp' ? renderEmpList() : renderStuList(tab)}
      </div>

      {/* نافذة تسجيل الوقت */}
      {timeModal && (
        <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setTimeModal(null); }}>
          <div className="mb mb-sm" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0 }}>
              <h2>⏰ توثيق وقت الحضور والانصراف</h2>
              <p>{STATUS_MAP[timeModal.status]}</p>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl">
                  <label>⏰ وقت الدخول / الحضور</label>
                  <input type="time" value={timeIn} onChange={e => setTimeIn(e.target.value)} />
                </div>
                <div className="fl">
                  <label>🏁 وقت الخروج / الانصراف (اختياري)</label>
                  <input type="time" value={timeOut} onChange={e => setTimeOut(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="fa">
              <button className="btn btn-g" onClick={() => setTimeModal(null)}>إلغاء</button>
              <button
                className="btn btn-p"
                onClick={() => {
                  if (timeModal.type === 'emp') {
                    saveEmpStatus(timeModal.id, timeModal.status, timeIn, timeOut, timeModal.note);
                  } else {
                    saveStuStatus(timeModal.id, timeModal.session, timeModal.status, timeIn, timeOut);
                  }
                  toast('✅ تم توثيق الحضور بنجاح', 'ok');
                }}
              >
                💾 حفظ الوقت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة المعالجة الذكية لتعارض الإجازة مع الحضور */}
      {leaveConflict && (
        <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setLeaveConflict(null); }}>
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxWidth: 600 }}>
            <div style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: '#fff', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  🌴
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    تنبيه تعارض: الموظف في إجازة معتمدة!
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', opacity: 0.9 }}>
                    يوجد سجل إجازة رسمية معتمدة للموظف تغطي تاريخ اليوم ({dateStr})
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(8, 145, 178, 0.08)', border: '1px solid rgba(8, 145, 178, 0.25)', borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {leaveConflict.emp?.name}
                  </span>
                  <span className="bdg b-cy" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                    {leaveConflict.leave.type}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>📅 <b>فترة الإجازة:</b> من {leaveConflict.leave.from} إلى {leaveConflict.leave.to}</span>
                  {leaveConflict.leave.reason && <span>📝 <b>السبب:</b> {leaveConflict.leave.reason}</span>}
                </div>
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                أنت تحاول الآن تسجيل الموظف كـ <b style={{ color: leaveConflict.status === 'present' ? 'var(--ok)' : 'var(--warn)' }}>«{leaveConflict.status === 'present' ? 'حاضر ✅' : 'متأخر ⚠️'}»</b> في تاريخ اليوم بينما هو في إجازة معتمدة. كيف ترغب في تسوية هذا التعارض؟
              </div>

              {/* خيارات المعالجة الذكية */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                
                {/* الخيار الأول: قطع الإجازة وحضور الموظف */}
                <button
                  type="button"
                  onClick={handleCancelLeaveAndAttend}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1.5px solid var(--pr)',
                    background: 'rgba(26, 86, 219, 0.04)',
                    textAlign: 'right',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '1.3rem', marginTop: 2 }}>🔄</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--pr)' }}>
                      الموظف ألغى إجازته وحضر (تعديل/إلغاء الإجازة واعتماد الحضور)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: 3, lineHeight: 1.4 }}>
                      سيتم تحديث سجل الإجازة لهذا التاريخ تلقائياً لمنع أي ازدواجية، وتوثيق حضور الموظف رسمياً.
                    </div>
                  </div>
                </button>

                {/* الخيار الثاني: حضور استثنائي أثناء الإجازة */}
                <button
                  type="button"
                  onClick={handleExceptionalAttendance}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1.5px solid var(--ok)',
                    background: 'rgba(16, 185, 129, 0.04)',
                    textAlign: 'right',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '1.3rem', marginTop: 2 }}>⭐</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ok)' }}>
                      حضور استثنائي (تسجيل الحضور الفعلي مع الاحتفاظ بسجل الإجازة كما هي)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: 3, lineHeight: 1.4 }}>
                      يوثق حضور الموظف اليوم مع إضافة ملاحظة «حضور استثنائي أثناء إجازة» وتبقى الإجازة معتمدة.
                    </div>
                  </div>
                </button>

                {/* الخيار الثالث: إبقاء الموظف في إجازته الرسمية والتراجع */}
                <button
                  type="button"
                  onClick={handleKeepLeave}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    textAlign: 'right',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '1.3rem', marginTop: 2 }}>🌴</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      إبقاء الموظف في إجازته الرسمية (تراجع عن تسجيل الحضور)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: 3, lineHeight: 1.4 }}>
                      تأكيد أن الموظف يتمتع بإجازته الرسمية ولن يتم تسجيله كحاضر.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div style={{ padding: '12px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-g" onClick={() => setLeaveConflict(null)}>
                إلغاء وإغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

