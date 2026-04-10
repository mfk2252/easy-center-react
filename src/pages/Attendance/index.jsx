import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd } from '../../hooks/useStorage';
import { todayStr, nowTimeStr, uid } from '../../utils/dateHelpers';

const STATUS_MAP = { present:'✅ حاضر', absent:'❌ غائب', late:'⚠️ متأخر' };

export default function AttendancePage() {
  const { toast } = useApp();
  const [tab, setTab] = useState('emp');
  const [dateStr, setDateStr] = useState(todayStr());
  const [emps, setEmps] = useState([]);
  const [students, setStudents] = useState([]);
  const [attEmp, setAttEmp] = useState([]);
  const [attStu, setAttStu] = useState([]);
  const [timeModal, setTimeModal] = useState(null); // { type:'emp'|'stu', id, status, session }
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');

  useEffect(() => {
    setEmps(lsGet('employees'));
    setStudents(lsGet('students'));
    reload();
  }, []);

  function reload() { setAttEmp(lsGet('attEmp')); setAttStu(lsGet('attStu')); }

  function navDate(n) { const d=new Date(dateStr); d.setDate(d.getDate()+n); setDateStr(d.toISOString().split('T')[0]); }

  // Employees
  function getEmpAtt(empId) { return attEmp.find(a=>a.empId===empId&&a.date===dateStr); }
  function markEmp(empId, status) {
    const now = nowTimeStr();
    const rec = getEmpAtt(empId);
    if (status==='present'||status==='late') { setTimeModal({ type:'emp', id:empId, status }); setTimeIn(rec?.timeIn||now); setTimeOut(rec?.timeOut||''); }
    else { saveEmpStatus(empId, status, '', ''); }
  }
  function saveEmpStatus(empId, status, tin, tout) {
    const rec = getEmpAtt(empId);
    const data = { empId, date:dateStr, status, timeIn:tin, timeOut:tout };
    if (rec) lsUpd('attEmp', rec.id, data); else lsAdd('attEmp', { ...data, id:uid() });
    reload(); setTimeModal(null);
  }

  // Students
  function getStuAtt(stuId, session) { return attStu.find(a=>a.kidId===stuId&&a.date===dateStr&&a.session===session); }
  function markStu(stuId, session, status) {
    const now = nowTimeStr();
    const rec = getStuAtt(stuId, session);
    if (status==='present'||status==='late') { setTimeModal({ type:'stu', id:stuId, session, status }); setTimeIn(rec?.timeIn||now); setTimeOut(rec?.timeOut||''); }
    else { saveStuStatus(stuId, session, status, '', ''); }
  }
  function saveStuStatus(stuId, session, status, tin, tout) {
    const rec = getStuAtt(stuId, session);
    const data = { kidId:stuId, date:dateStr, session, status, timeIn:tin, timeOut:tout };
    if (rec) lsUpd('attStu', rec.id, data); else lsAdd('attStu', { ...data, id:uid() });
    reload(); setTimeModal(null);
  }

  const sessionStu = (session) => students.filter(s => {
    if (!['active'].includes(s.status)) return false;
    if (session==='morning') return s.progMorning?.enabled;
    if (session==='evening') return s.progEvening?.enabled;
    if (session==='sessions') return s.progSessions?.enabled;
    if (session==='online') return s.progOnline?.enabled;
    return false;
  });

  function attStats(list, getAtt, session) {
    return { present: list.filter(x=>getAtt(x.id, session)?.status==='present').length, absent: list.filter(x=>getAtt(x.id, session)?.status==='absent').length, late: list.filter(x=>getAtt(x.id, session)?.status==='late').length };
  }

  const empStats = { present:attEmp.filter(a=>a.date===dateStr&&a.status==='present').length, absent:attEmp.filter(a=>a.date===dateStr&&a.status==='absent').length, late:attEmp.filter(a=>a.date===dateStr&&a.status==='late').length };

  const SESSION_TABS = [['emp','👥 الموظفون'],['morning','☀️ صباحي'],['evening','🌙 مسائي'],['sessions','🩺 جلسات'],['online','🌐 أونلاين']];

  function renderEmpList() {
    return emps.map(e=>{
      const rec = getEmpAtt(e.id);
      const st = rec?.status;
      return (
        <div key={e.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderBottom:'1px solid var(--border-color)', flexWrap:'wrap' }}>
          <div className="av" style={{ width:36,height:36,fontSize:'.82rem' }}>{e.photo?<img src={e.photo} style={{width:36,height:36,objectFit:'cover'}} alt=""/>:(e.name||'?').slice(0,2)}</div>
          <div style={{ flex:1, minWidth:120 }}>
            <div style={{ fontWeight:700, fontSize:'.88rem' }}>{e.name}</div>
            <div style={{ fontSize:'.72rem', color:'var(--g5)' }}>{e.role}{rec?.timeIn&&' · دخل: '+rec.timeIn}{rec?.timeOut&&' · خرج: '+rec.timeOut}</div>
          </div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {[['present','✅'],['late','⚠️'],['absent','❌']].map(([s,l])=>(
              <button key={s} onClick={()=>markEmp(e.id,s)} className={`btn btn-xs ${st===s?'btn-p':'btn-g'}`} style={st===s?{opacity:1}:{opacity:.7}}>{l}</button>
            ))}
            {rec?.status==='present' && <button className="btn btn-xs btn-v" onClick={()=>{ const now=nowTimeStr(); const rec2=getEmpAtt(e.id); if(rec2) lsUpd('attEmp',rec2.id,{...rec2,timeOut:now}); reload(); toast('✅ تم تسجيل الخروج','ok'); }}>🚪 خروج</button>}
          </div>
        </div>
      );
    });
  }

  function renderStuList(session) {
    const list = sessionStu(session);
    if (list.length === 0) return <div style={{padding:20,textAlign:'center',color:'var(--g4)',fontSize:'.84rem'}}>لا يوجد طلاب في هذا القسم</div>;
    return list.map(s=>{
      const rec = getStuAtt(s.id, session);
      const st = rec?.status;
      return (
        <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderBottom:'1px solid var(--border-color)', flexWrap:'wrap' }}>
          <div className="av" style={{ width:36,height:36,fontSize:'.82rem' }}>{s.photo?<img src={s.photo} style={{width:36,height:36,objectFit:'cover'}} alt=""/>:(s.name||'?').slice(0,2)}</div>
          <div style={{ flex:1, minWidth:120 }}>
            <div style={{ fontWeight:700, fontSize:'.88rem' }}>{s.name}</div>
            <div style={{ fontSize:'.72rem', color:'var(--g5)' }}>{s.diagnosis}{rec?.timeIn&&' · دخل: '+rec.timeIn}{rec?.timeOut&&' · خرج: '+rec.timeOut}</div>
          </div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {[['present','✅'],['late','⚠️'],['absent','❌']].map(([st2,l])=>(
              <button key={st2} onClick={()=>markStu(s.id,session,st2)} className={`btn btn-xs ${st===st2?'btn-p':'btn-g'}`} style={st===st2?{opacity:1}:{opacity:.7}}>{l}</button>
            ))}
            {rec?.status==='present' && <button className="btn btn-xs btn-v" onClick={()=>{ const now=nowTimeStr(); const rec2=getStuAtt(s.id,session); if(rec2) lsUpd('attStu',rec2.id,{...rec2,timeOut:now}); reload(); toast('✅ خروج','ok'); }}>🚪 خروج</button>}
          </div>
          {s.parentPhone&&<a href={`https://wa.me/${s.parentPhone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}?text=${encodeURIComponent('نود إشعاركم بغياب '+s.name+' اليوم')}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-bl" style={st==='absent'?{}:{opacity:.3}}>💬</a>}
        </div>
      );
    });
  }

  const curSession = tab === 'emp' ? null : tab;
  const curList = curSession ? sessionStu(curSession) : emps;
  const stats = curSession ? { present:attStu.filter(a=>a.date===dateStr&&a.session===curSession&&a.status==='present').length, absent:attStu.filter(a=>a.date===dateStr&&a.session===curSession&&a.status==='absent').length, late:attStu.filter(a=>a.date===dateStr&&a.session===curSession&&a.status==='late').length } : empStats;

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>📅 الحضور السريع</h2><p>تسجيل حضور وانصراف الموظفين والطلاب</p></div>
        <div className="ph-a">
          <button className="btn btn-g btn-sm" onClick={()=>navDate(-1)}>→ السابق</button>
          <button className="btn btn-p btn-sm" onClick={()=>setDateStr(todayStr())}>اليوم</button>
          <button className="btn btn-g btn-sm" onClick={()=>navDate(1)}>التالي ←</button>
          <span style={{ fontWeight:700, color:'var(--pr)', padding:'0 8px' }}>{dateStr}</span>
        </div>
      </div>

      <div className="tabs">
        {SESSION_TABS.map(([v,l])=>(
          <button key={v} className={`tab ${tab===v?'on':''}`} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
        {[['✅ حاضر','present','var(--ok)'],['❌ غائب','absent','var(--err)'],['⚠️ متأخر','late','var(--warn)']].map(([l,k,c])=>(
          <div key={k} style={{ padding:'8px 16px', background:'var(--bg-card)', border:`1.5px solid ${c}33`, borderRadius:'var(--r2)', boxShadow:'var(--sh)', minWidth:100, textAlign:'center' }}>
            <div style={{ fontSize:'1.4rem', fontWeight:900, color:c }}>{stats[k]}</div>
            <div style={{ fontSize:'.72rem', color:'var(--g5)' }}>{l}</div>
          </div>
        ))}
        <div style={{ padding:'8px 16px', background:'var(--bg-card)', border:'1.5px solid var(--g2)', borderRadius:'var(--r2)', boxShadow:'var(--sh)', minWidth:100, textAlign:'center' }}>
          <div style={{ fontSize:'1.4rem', fontWeight:900, color:'var(--g6)' }}>{curList.length}</div>
          <div style={{ fontSize:'.72rem', color:'var(--g5)' }}>الإجمالي</div>
        </div>
      </div>

      <div className="wg">
        <div className="wg-b p0">
          {tab === 'emp' ? renderEmpList() : renderStuList(tab)}
        </div>
      </div>

      {/* Time Modal */}
      {timeModal && (
        <div className="mbg" onClick={e=>{ if(e.target===e.currentTarget) setTimeModal(null); }}>
          <div className="mb mb-sm" style={{ padding:0, overflow:'hidden', borderRadius:16 }}>
            <div className="fhd" style={{ padding:'14px 20px', borderRadius:0 }}>
              <h2>⏰ تسجيل الوقت</h2>
              <p>{STATUS_MAP[timeModal.status]}</p>
            </div>
            <div style={{ padding:'18px 20px' }}>
              <div className="fg c2">
                <div className="fl"><label>⏰ وقت الحضور</label><input type="time" value={timeIn} onChange={e=>setTimeIn(e.target.value)}/></div>
                <div className="fl"><label>🏁 وقت الانصراف (اختياري)</label><input type="time" value={timeOut} onChange={e=>setTimeOut(e.target.value)}/></div>
              </div>
            </div>
            <div className="fa">
              <button className="btn btn-p" onClick={()=>{ if(timeModal.type==='emp') saveEmpStatus(timeModal.id,timeModal.status,timeIn,timeOut); else saveStuStatus(timeModal.id,timeModal.session,timeModal.status,timeIn,timeOut); toast('✅ تم التسجيل','ok'); }}>💾 حفظ</button>
              <button className="btn btn-g btn-sm" onClick={()=>{ if(timeModal.type==='emp') saveEmpStatus(timeModal.id,timeModal.status,timeIn,''); else saveStuStatus(timeModal.id,timeModal.session,timeModal.status,timeIn,''); toast('✅ تم','ok'); }}>⚡ بدون وقت خروج</button>
              <button className="btn btn-g" onClick={()=>setTimeModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
