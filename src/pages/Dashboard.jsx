import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet } from '../hooks/useStorage';
import { todayStr, formatDate, calcAge } from '../utils/dateHelpers';

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const h = time.getHours();
  const greeting = h < 12 ? '🌅 صباح الخير' : h < 17 ? '☀️ مساء النور' : '🌙 مساء الخير';
  return { time, greeting };
}

export default function Dashboard() {
  const { currentUser, center, go } = useApp();
  const [data, setData] = useState({ emps:[], students:[], sessions:[], attStu:[], leaves:[], notifs:[] });
  const [clockData, setClockData] = useState({ time: new Date(), greeting: '🌅 صباح الخير' });

  useEffect(() => {
    const tick = () => {
      const t = new Date();
      const h = t.getHours();
      setClockData({ time: t, greeting: h < 12 ? '🌅 صباح الخير' : h < 17 ? '☀️ مساء النور' : '🌙 مساء الخير' });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setData({
      emps: lsGet('employees'),
      students: lsGet('students'),
      sessions: lsGet('sessions'),
      attStu: lsGet('attStu'),
      leaves: lsGet('leaves'),
      notifs: lsGet('notifs'),
    });
  }, []);

  const today = todayStr();
  const activeStudents = data.students.filter(s => !['inactive','transferred','waitlist','rejected'].includes(s.status));
  const sessStudents = activeStudents.filter(s => s.progSessions?.enabled);
  const classStudents = activeStudents.filter(s => s.progMorning?.enabled || s.progEvening?.enabled);
  const sessPresent = data.attStu.filter(a => a.date===today && a.status==='present' && a.session==='sessions' && sessStudents.find(x=>x.id===a.kidId)).length;
  const classPresent = data.attStu.filter(a => a.date===today && a.status==='present' && (a.session==='morning'||a.session==='evening') && classStudents.find(x=>x.id===a.kidId)).length;
  const pendingLeaves = data.leaves.filter(l => l.status === 'pending');
  const waitlistCount = data.students.filter(s => s.status === 'waitlist').length;

  const recentSessions = [...data.sessions].sort((a,b) => (b.date||'').localeCompare(a.date||'')).slice(0, 5);
  const todayAtt = data.attStu.filter(a => a.date === today).slice(0, 8);

  // Upcoming appointments
  const appts = lsGet('appointments').filter(a => a.date >= today).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 3);

  const timeStr = clockData.time.toLocaleTimeString('ar-SA', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const dateStr = clockData.time.toLocaleDateString('ar-SA', {weekday:'long',year:'numeric',month:'long',day:'numeric'});

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>📊 لوحة التحكم</h2></div>
      </div>

      {/* Clock widget */}
      <div style={{display:'flex',alignItems:'center',gap:16,padding:'14px 20px',background:'var(--bg-card)',borderRadius:'var(--r)',border:'1px solid var(--border-color)',marginBottom:14,boxShadow:'var(--sh)',flexWrap:'wrap'}}>
        <div style={{fontSize:'1.7rem',fontVariantNumeric:'tabular-nums',letterSpacing:1,fontWeight:900}}>{timeStr}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:'.82rem',color:'var(--g5)',fontWeight:500}}>{clockData.greeting}</div>
          <div style={{fontSize:'.95rem',fontWeight:700,color:'var(--text-main)'}}>{dateStr}</div>
        </div>
        <div style={{borderRight:'2px solid var(--border-color)',paddingRight:16,textAlign:'right'}}>
          <div style={{fontSize:'.85rem',fontWeight:900,color:'var(--pr)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:200}}>{center.name}</div>
          <div style={{fontSize:'.75rem',color:'var(--g5)',marginTop:2}}>{currentUser?.name} — {currentUser?.title || ''}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="sc"><div className="lb">الموظفون</div><div className="vl">{data.emps.length}</div><div className="sb">موظف نشط</div></div>
        <div className="sc g"><div className="lb">الطلاب النشطون</div><div className="vl">{activeStudents.length}</div><div className="sb">طالب نشط</div></div>
        <div className="sc o"><div className="lb">حضور الجلسات اليوم</div><div className="vl">{sessPresent}/{sessStudents.length}</div><div className="sb">جلسات حضورية</div></div>
        <div className="sc v"><div className="lb">حضور الصفوف اليوم</div><div className="vl">{classPresent}/{classStudents.length}</div><div className="sb">صباحي + مسائي</div></div>
      </div>

      {/* Alerts row */}
      {(pendingLeaves.length > 0 || waitlistCount > 0) && (
        <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
          {pendingLeaves.length > 0 && (
            <div style={{flex:1,padding:'10px 16px',background:'var(--warn-l)',border:'1px solid #fde68a',borderRadius:'var(--r2)',cursor:'pointer',minWidth:200}} onClick={()=>go('hr-leaves')}>
              <span style={{fontWeight:700,color:'var(--warn)'}}>⏳ {pendingLeaves.length} إجازة تنتظر الموافقة</span>
            </div>
          )}
          {waitlistCount > 0 && (
            <div style={{flex:1,padding:'10px 16px',background:'var(--cyan-l)',border:'1px solid #a5f3fc',borderRadius:'var(--r2)',cursor:'pointer',minWidth:200}} onClick={()=>go('students')}>
              <span style={{fontWeight:700,color:'var(--cyan)'}}>⏳ {waitlistCount} طالب في قائمة الانتظار</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Access */}
      <div className="wg" style={{marginBottom:14}}>
        <div className="wg-h"><h3>⚡ وصول سريع</h3></div>
        <div className="wg-b" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {[['📅 الحضور السريع','attendance'],['🩺 الجلسات','sessions'],['🌴 الإجازات','hr-leaves'],['💰 الرواتب','hr-salary'],['💳 إدارة المركز','center'],['📊 التقارير','reports']].map(([label,view])=>(
            <button key={view} className="btn btn-s btn-sm" onClick={()=>go(view)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="g2">
        <div>
          {/* Today's attendance */}
          <div className="wg">
            <div className="wg-h">
              <h3>📅 حضور الطلاب — اليوم</h3>
              <button className="btn btn-g btn-sm" onClick={()=>go('attendance')}>عرض الكل</button>
            </div>
            <div className="wg-b p0">
              {todayAtt.length === 0
                ? <div style={{padding:'20px',textAlign:'center',color:'var(--g4)',fontSize:'.84rem'}}>لم يُسجَّل حضور اليوم بعد</div>
                : todayAtt.map(a => {
                  const s = data.students.find(x=>x.id===a.kidId);
                  const statusColors = {present:'var(--ok)',absent:'var(--err)',late:'var(--warn)'};
                  const statusLabel = {present:'✅ حاضر',absent:'❌ غائب',late:'⚠️ متأخر'};
                  return (
                    <div key={a.id||a.kidId+a.session} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',borderBottom:'1px solid var(--border-color)'}}>
                      <div className="av" style={{width:32,height:32,fontSize:'.75rem'}}>{(s?.name||'?').slice(0,2)}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'.84rem',fontWeight:700}}>{s?.name||'—'}</div>
                        <div style={{fontSize:'.7rem',color:'var(--g4)'}}>{a.session==='morning'?'☀️ صباحي':a.session==='evening'?'🌙 مسائي':'🩺 جلسات'}</div>
                      </div>
                      <span style={{fontSize:'.75rem',fontWeight:700,color:statusColors[a.status]||'var(--g5)'}}>{statusLabel[a.status]||a.status}</span>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* Upcoming appointments */}
          {appts.length > 0 && (
            <div className="wg">
              <div className="wg-h"><h3>📅 المواعيد القادمة</h3></div>
              <div className="wg-b p0">
                {appts.map(a => {
                  const s = data.students.find(x=>x.id===a.stuId);
                  const isToday = a.date === today;
                  return (
                    <div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',borderBottom:'1px solid var(--border-color)'}}>
                      <div className="av cyan" style={{width:32,height:32,fontSize:'.8rem'}}>📅</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'.84rem',fontWeight:700}}>{s?.name||'—'} — {a.type}</div>
                        <div style={{fontSize:'.7rem',color:'var(--g4)'}}>{a.date} {a.time && '· ' + a.time}</div>
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
          {/* Pending leaves */}
          <div className="wg">
            <div className="wg-h">
              <h3>⚠️ إجازات الموظفين المعلقة</h3>
              <button className="btn btn-g btn-sm" onClick={()=>go('hr-leaves')}>عرض الكل</button>
            </div>
            <div className="wg-b">
              {pendingLeaves.length === 0
                ? <div style={{color:'var(--g4)',fontSize:'.84rem',textAlign:'center',padding:'12px 0'}}>✅ لا توجد طلبات إجازة معلقة</div>
                : pendingLeaves.slice(0,5).map(l => {
                  const emp = data.emps.find(e=>e.id===l.empId);
                  return (
                    <div key={l.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,padding:'8px 12px',background:'var(--warn-l)',borderRadius:'var(--r2)',border:'1px solid #fde68a'}}>
                      <span>🌴</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'.84rem',fontWeight:700}}>{emp?.name||'—'}</div>
                        <div style={{fontSize:'.72rem',color:'var(--warn)'}}>{l.type} · {l.from} → {l.to}</div>
                      </div>
                      <span className="bdg b-or">⏳ معلق</span>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* Recent sessions */}
          <div className="wg">
            <div className="wg-h">
              <h3>📋 آخر الجلسات العلاجية</h3>
              <button className="btn btn-g btn-sm" onClick={()=>go('sessions')}>عرض الكل</button>
            </div>
            <div className="wg-b">
              {recentSessions.length === 0
                ? <div style={{color:'var(--g4)',fontSize:'.84rem',textAlign:'center',padding:'12px 0'}}>لا توجد جلسات مسجلة</div>
                : recentSessions.map(s => {
                  const stu = data.students.find(x=>x.id===s.stuId);
                  return (
                    <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,padding:'8px 12px',background:'var(--pur-l)',borderRadius:'var(--r2)',border:'1px solid #ddd6fe'}}>
                      <span>🩺</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'.84rem',fontWeight:700}}>{stu?.name||'—'}</div>
                        <div style={{fontSize:'.72rem',color:'var(--pur)'}}>{s.type} · {s.date}</div>
                      </div>
                      <span className={`bdg ${s.status==='done'?'b-gr':'b-or'}`}>{s.status==='done'?'✅ منجزة':'⏳ مجدولة'}</span>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
