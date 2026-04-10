import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../hooks/useStorage';
import { todayStr, uid } from '../utils/dateHelpers';

const DAYS_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const EV_COLORS = [['bl','أزرق'],['gr','أخضر'],['or','برتقالي'],['rd','أحمر']];
const EMPTY_EV = { title:'', date:'', time:'', color:'bl', type:'event', notes:'' };

export default function Calendar() {
  const { toast } = useApp();
  const [cur, setCur] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [appts, setAppts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_EV);
  const [selDay, setSelDay] = useState(null);

  useEffect(() => {
    setEvents(lsGet('calEvents'));
    setAppts(lsGet('appointments'));
  }, []);

  function reload() { setEvents(lsGet('calEvents')); setAppts(lsGet('appointments')); }

  const year = cur.getFullYear(), month = cur.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [];
  for (let i=0; i<firstDay; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function dateStr(d) { return `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
  function eventsOnDay(d) {
    const ds = dateStr(d);
    const evs = events.filter(e=>e.date===ds);
    const apps = appts.filter(a=>a.date===ds);
    return { evs, apps };
  }

  function openForm(d = null) {
    setForm({ ...EMPTY_EV, date: d ? dateStr(d) : todayStr() });
    setEditId(null); setShowForm(true);
  }
  function save() {
    if (!form.title.trim() || !form.date) { toast('⚠️ أدخل العنوان والتاريخ','er'); return; }
    if (editId) { lsUpd('calEvents', editId, form); toast('✅ تم التحديث','ok'); }
    else { lsAdd('calEvents', { ...form, id:uid() }); toast('✅ تم إضافة الحدث','ok'); }
    setShowForm(false); reload();
  }
  function del(id) { lsDel('calEvents',id); reload(); toast('🗑️ تم الحذف','ok'); }
  const fld = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const today = todayStr();

  const selDateStr = selDay ? dateStr(selDay) : null;
  const selEvs = selDay ? eventsOnDay(selDay) : null;

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>🗓️ التقويم</h2><p>{MONTHS_AR[month]} {year}</p></div>
        <div className="ph-a">
          <button className="btn btn-g btn-sm" onClick={()=>setCur(d=>{const n=new Date(d);n.setMonth(n.getMonth()-1);return n;})}>→ السابق</button>
          <button className="btn btn-p btn-sm" onClick={()=>setCur(new Date())}>اليوم</button>
          <button className="btn btn-g btn-sm" onClick={()=>setCur(d=>{const n=new Date(d);n.setMonth(n.getMonth()+1);return n;})}>التالي ←</button>
          <button className="btn btn-p" onClick={()=>openForm()}>➕ حدث</button>
        </div>
      </div>

      <div className="wg">
        <div className="wg-b" style={{ padding:'8px' }}>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
            {DAYS_AR.map(d=><div key={d} style={{ textAlign:'center', fontSize:'.75rem', fontWeight:900, color:'var(--text-sub)', padding:'4px 0' }}>{d}</div>)}
          </div>
          {/* Calendar grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {cells.map((d,i)=>{
              if (!d) return <div key={i} style={{ minHeight:70, background:'var(--g0)', borderRadius:'var(--r3)', opacity:.4 }}/>;
              const ds = dateStr(d);
              const { evs, apps } = eventsOnDay(d);
              const isToday = ds === today;
              const isSel = d === selDay;
              return (
                <div key={i} onClick={()=>setSelDay(d===selDay?null:d)} style={{ minHeight:70, border:`${isToday?'2px':'1px'} solid ${isToday?'var(--pr)':isSel?'var(--pr)':'var(--border-color)'}`, borderRadius:'var(--r3)', padding:5, background:isSel?'var(--pr-l)':'var(--bg-card)', cursor:'pointer', transition:'all .15s' }}>
                  <div style={{ fontSize:'.8rem', fontWeight:isToday?900:700, color:isToday?'var(--pr)':'var(--text-sub)', marginBottom:3 }}>{d}</div>
                  {evs.slice(0,2).map(e=><div key={e.id} className={`cal-ev ${e.color||'bl'}`}>{e.title}</div>)}
                  {apps.slice(0,2).map(a=><div key={a.id} className="cal-ev gr">📅 {a.type}</div>)}
                  {(evs.length+apps.length)>2 && <div style={{fontSize:'.65rem',color:'var(--g4)'}}>+{evs.length+apps.length-2}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected day panel */}
      {selDay && selEvs && (
        <div className="wg">
          <div className="wg-h">
            <h3>📅 {selDay} {MONTHS_AR[month]} {year}</h3>
            <button className="btn btn-p btn-sm" onClick={()=>openForm(selDay)}>➕ إضافة</button>
          </div>
          <div className="wg-b">
            {selEvs.evs.length === 0 && selEvs.apps.length === 0
              ? <div style={{color:'var(--g4)',textAlign:'center',padding:'12px 0',fontSize:'.84rem'}}>لا توجد أحداث في هذا اليوم</div>
              : <>
                {selEvs.evs.map(e=>(
                  <div key={e.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,padding:'8px 12px',background:'var(--pr-l)',borderRadius:'var(--r2)'}}>
                    <span style={{fontWeight:700,flex:1}}>{e.title}</span>
                    {e.time&&<span style={{fontSize:'.78rem',color:'var(--g5)'}}>{e.time}</span>}
                    <button className="btn btn-xs btn-g" onClick={()=>{setForm({...e});setEditId(e.id);setShowForm(true);}}>✏️</button>
                    <button className="btn btn-xs btn-d" onClick={()=>del(e.id)}>🗑️</button>
                  </div>
                ))}
                {selEvs.apps.map(a=>{
                  const students = lsGet('students');
                  const stu = students.find(s=>s.id===a.stuId);
                  return (
                    <div key={a.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,padding:'8px 12px',background:'var(--ok-l)',borderRadius:'var(--r2)'}}>
                      <span style={{fontWeight:700,flex:1}}>📅 {stu?.name||'—'} — {a.type}</span>
                      {a.time&&<span style={{fontSize:'.78rem',color:'var(--g5)'}}>{a.time}</span>}
                    </div>
                  );
                })}
              </>
            }
          </div>
        </div>
      )}

      {showForm && (
        <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowForm(false);}}>
          <div className="mb mb-sm" style={{ padding:0, overflow:'hidden', borderRadius:16 }}>
            <div className="fhd" style={{ padding:'14px 20px', borderRadius:0 }}><h2>{editId?'✏️ تعديل الحدث':'➕ حدث جديد'}</h2></div>
            <div style={{ padding:'18px 20px' }}>
              <div className="fg c2">
                <div className="fl full"><label>عنوان الحدث <span className="req">*</span></label><input value={form.title} onChange={fld('title')} placeholder="اسم الحدث..." autoFocus/></div>
                <div className="fl"><label>التاريخ <span className="req">*</span></label><input type="date" value={form.date} onChange={fld('date')}/></div>
                <div className="fl"><label>الوقت</label><input type="time" value={form.time} onChange={fld('time')}/></div>
                <div className="fl full"><label>اللون</label>
                  <div style={{ display:'flex', gap:8, marginTop:4 }}>
                    {EV_COLORS.map(([c,l])=>(
                      <div key={c} onClick={()=>setForm(f=>({...f,color:c}))} className={`cal-ev ${c}`} style={{ padding:'4px 10px', cursor:'pointer', border: form.color===c?'2px solid var(--g8)':'2px solid transparent', borderRadius:6 }}>{l}</div>
                    ))}
                  </div>
                </div>
                <div className="fl full"><label>ملاحظات</label><textarea value={form.notes} onChange={fld('notes')} rows={2}/></div>
              </div>
            </div>
            <div className="fa">
              <button className="btn btn-p" onClick={save}>💾 حفظ</button>
              <button className="btn btn-g" onClick={()=>setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
