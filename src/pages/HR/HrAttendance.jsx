import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd } from '../../hooks/useStorage';
import { uid, daysInMonth } from '../../utils/dateHelpers';

function monthKey(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); }
function monthLabel(d) { return d.toLocaleDateString('ar-SA', { month:'long', year:'numeric' }); }

const STATUS_LABEL = { present:'✅ حاضر', absent:'❌ غائب', late:'⚠️ متأخر', leave:'🌴 إجازة', holiday:'🔴 عطلة' };
const STATUS_COLOR = { present:'var(--ok)', absent:'var(--err)', late:'var(--warn)', leave:'var(--cyan)', holiday:'var(--g4)' };

/**
 * نظام "الحضور" في لوحة الموظفين — تبويبان:
 * - شهري: الشبكة الشهرية الكاملة (المنطق الأصلي كما هو دون أي تغيير).
 * - يومي: لا يُعاد بناء منطق التسجيل هنا (هذا يعيش أصلاً في شاشة "تسجيل
 *   الحضور" العامة المشتركة مع حضور الطلاب)، بل رابط ذكي مباشر لنفس التبويب
 *   الصحيح هناك — لتفادي ازدواجية المنطق بين شاشتين لنفس البيانات.
 */
export default function HrAttendance() {
  const { go, toast } = useApp();
  const [view, setView] = useState('monthly');
  const [month, setMonth] = useState(new Date());
  const [emps, setEmps] = useState([]);
  const [attEmp, setAttEmp] = useState([]);
  const [selEmp, setSelEmp] = useState('all');

  useEffect(() => { setEmps(lsGet('employees')); setAttEmp(lsGet('attEmp')); }, []);
  function reload() { setAttEmp(lsGet('attEmp')); }

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
    <div>
      <div className="ph">
        <div className="ph-t"><h2>📅 حضور الموظفين</h2><p>يومي وشهري في مكان واحد</p></div>
        <div className="ph-a">
          <button className="btn btn-g" onClick={() => go('hr')}>← رجوع للوحة الموظفين</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${view==='monthly'?'on':''}`} onClick={()=>setView('monthly')}>🗓️ شهري</button>
        <button className={`tab ${view==='daily'?'on':''}`} onClick={()=>setView('daily')}>📅 يومي</button>
      </div>

      {view === 'daily' && (
        <div className="wg">
          <div className="wg-b" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📅</div>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 8 }}>تسجيل الحضور اليومي</div>
            <p style={{ fontSize: '.85rem', color: 'var(--g5)', marginBottom: 18, maxWidth: 420, marginInline: 'auto' }}>
              التسجيل اليومي للموظفين يتم من شاشة "تسجيل الحضور" العامة نفسها التي يُسجَّل منها حضور الطلاب أيضاً — لضمان تسجيل الجميع من مكان واحد في نفس اللحظة.
            </p>
            <button type="button" className="btn btn-p" onClick={goToDailyAttendance}>📅 فتح تسجيل الحضور اليومي ←</button>
          </div>
        </div>
      )}

      {view === 'monthly' && (
        <>
          <div className="ph-a" style={{ marginBottom: 12 }}>
            <button className="btn btn-g btn-sm" onClick={() => setMonth(d => { const n=new Date(d); n.setMonth(n.getMonth()-1); return n; })}>→ السابق</button>
            <button className="btn btn-p btn-sm" onClick={() => setMonth(new Date())}>الشهر الحالي</button>
            <button className="btn btn-g btn-sm" onClick={() => setMonth(d => { const n=new Date(d); n.setMonth(n.getMonth()+1); return n; })}>التالي ←</button>
            <span style={{ fontWeight: 800, color: 'var(--pr)', padding: '0 8px' }}>{monthLabel(month)}</span>
          </div>

          <div className="tb">
            <select className="fsel" value={selEmp} onChange={e => setSelEmp(e.target.value)}>
              <option value="all">كل الموظفين</option>
              {emps.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          {displayEmps.map(emp => {
            const counts = countForEmp(emp.id);
            return (
              <div key={emp.id} className="wg" style={{ marginBottom:16 }}>
                <div className="wg-h">
                  <h3>{emp.name} <span style={{fontSize:'.78rem',color:'var(--g5)',fontWeight:500}}>{emp.role}</span></h3>
                  <div style={{ display:'flex', gap:10, fontSize:'.78rem', flexWrap:'wrap' }}>
                    <span style={{color:'var(--ok)'}}>✅ {counts.present}</span>
                    <span style={{color:'var(--err)'}}>❌ {counts.absent}</span>
                    <span style={{color:'var(--warn)'}}>⚠️ {counts.late}</span>
                    <span style={{color:'var(--cyan)'}}>🌴 {counts.leave}</span>
                  </div>
                </div>
                <div className="wg-b" style={{ overflowX:'auto' }}>
                  <div style={{ display:'flex', gap:3, minWidth: days * 42 }}>
                    {daysArr.map(({ day, dateStr, dow }) => {
                      const rec = getStatus(emp.id, dateStr);
                      const isWeekend = dow === 5 || dow === 6;
                      const st = rec?.status || (isWeekend ? 'holiday' : null);
                      return (
                        <div key={dateStr} style={{ textAlign:'center', minWidth:38 }}>
                          <div style={{ fontSize:'.68rem', color:'var(--g5)', marginBottom:3 }}>{day}</div>
                          <select
                            value={st || ''}
                            onChange={e => setStatus(emp.id, dateStr, e.target.value)}
                            style={{ width:38, fontSize:'.65rem', padding:'2px', borderRadius:4, border:'1px solid var(--border-color)', background: st ? STATUS_COLOR[st]+'22' : 'var(--bg-input)', color: st ? STATUS_COLOR[st] : 'var(--g4)', cursor:'pointer' }}
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
                  <div style={{ display:'flex', gap:10, marginTop:8, fontSize:'.72rem', color:'var(--g5)', flexWrap:'wrap' }}>
                    {Object.entries(STATUS_LABEL).map(([k,v]) => <span key={k}>{v}</span>)}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
