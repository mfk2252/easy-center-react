import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../hooks/useStorage';
import { todayStr, uid } from '../utils/dateHelpers';
import EmptyState from '../components/ui/EmptyState';

const EMPTY_PROG = { name:'', type:'', description:'', schedule:'', instructor:'', capacity:10, enrolledCount:0, status:'active', notes:'' };

export default function Programs() {
  const { toast, currentUser } = useApp();
  const [programs, setPrograms] = useState([]);
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_PROG);
  const canEdit = ['manager','vice'].includes(currentUser?.role);

  useEffect(() => { setPrograms(lsGet('programs')); setStudents(lsGet('students')); setEmps(lsGet('employees')); }, []);
  function reload() { setPrograms(lsGet('programs')); }
  const fld = k => e => setForm(f=>({...f,[k]:e.target.value}));

  function save() {
    if (!form.name.trim()) { toast('⚠️ أدخل اسم النشاط','er'); return; }
    if (editId) lsUpd('programs',editId,form); else lsAdd('programs',{...form,id:uid()});
    toast('✅ تم الحفظ','ok'); setShowForm(false); reload();
  }
  function del(id) { if(!window.confirm('حذف هذا النشاط؟'))return; lsDel('programs',id); reload(); toast('🗑️','ok'); }

  // built-in program stats from student data
  const builtIn = [
    { id:'morning', icon:'☀️', label:'القسم الصباحي', count: students.filter(s=>s.progMorning?.enabled&&s.status==='active').length, color:'var(--warn)' },
    { id:'evening', icon:'🌙', label:'القسم المسائي', count: students.filter(s=>s.progEvening?.enabled&&s.status==='active').length, color:'var(--pur)' },
    { id:'sessions', icon:'🩺', label:'الجلسات العلاجية', count: students.filter(s=>s.progSessions?.enabled&&s.status==='active').length, color:'var(--ok)' },
    { id:'online', icon:'🌐', label:'الجلسات أونلاين', count: students.filter(s=>s.progOnline?.enabled&&s.status==='active').length, color:'var(--cyan)' },
  ];

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>🎯 الأنشطة والبرامج</h2><p>الأقسام الرئيسية وأنشطة المركز</p></div>
        <div className="ph-a">
          {canEdit&&<button className="btn btn-p" onClick={()=>{setForm({...EMPTY_PROG});setEditId(null);setShowForm(true);}}>➕ نشاط جديد</button>}
        </div>
      </div>

      <div className="stats" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {builtIn.map(p=>(
          <div key={p.id} className="sc" style={{borderRightColor:p.color}}>
            <div className="lb">{p.icon} {p.label}</div>
            <div className="vl">{p.count}</div>
            <div className="sb">طالب نشط</div>
          </div>
        ))}
      </div>

      <div className="wg" style={{marginBottom:14}}>
        <div className="wg-h"><h3>🗂️ الأقسام الرئيسية</h3></div>
        <div className="wg-b">
          {builtIn.map(p=>(
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border-color)'}}>
              <div style={{fontSize:'1.4rem'}}>{p.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700}}>{p.label}</div>
                <div style={{fontSize:'.78rem',color:'var(--g5)'}}>عدد الطلاب النشطين: {p.count}</div>
              </div>
              <span style={{fontWeight:900,color:p.color,fontSize:'1.2rem'}}>{p.count}</span>
            </div>
          ))}
        </div>
      </div>

      {programs.length > 0 && (
        <div className="wg">
          <div className="wg-h"><h3>📋 الأنشطة الإضافية</h3></div>
          <div className="wg-b p0">
            {programs.map(p=>(
              <div key={p.id} className="card" style={{marginBottom:0,borderRadius:0,border:'none',borderBottom:'1px solid var(--border-color)'}}>
                <div className="av">🎯</div>
                <div className="ci">
                  <div className="cn">{p.name}</div>
                  <div className="cm">{p.type&&p.type+' · '}{p.schedule&&p.schedule}{p.description&&' — '+p.description}</div>
                </div>
                <div className="c-badges">
                  <span className={`bdg ${p.status==='active'?'b-gr':'b-gy'}`}>{p.status==='active'?'نشط':'متوقف'}</span>
                </div>
                {canEdit&&<div className="c-acts">
                  <button className="btn btn-xs btn-g" onClick={()=>{setForm({...p});setEditId(p.id);setShowForm(true);}}>✏️</button>
                  <button className="btn btn-xs btn-d" onClick={()=>del(p.id)}>🗑️</button>
                </div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {programs.length===0&&!showForm&&<EmptyState icon="🎯" title="لا توجد أنشطة إضافية" sub={canEdit?"يمكنك إضافة أنشطة وبرامج خاصة بالمركز":""}/>}

      {showForm&&(
        <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowForm(false);}}>
          <div className="mb" style={{padding:0,overflow:'hidden',borderRadius:16}}>
            <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{editId?'✏️ تعديل النشاط':'🎯 نشاط جديد'}</h2></div>
            <div style={{padding:'18px 20px'}}>
              <div className="fg c2">
                <div className="fl full"><label>اسم النشاط <span className="req">*</span></label><input value={form.name} onChange={fld('name')} autoFocus/></div>
                <div className="fl"><label>النوع</label><input value={form.type} onChange={fld('type')} placeholder="تعليمي، ترفيهي، تأهيلي..."/></div>
                <div className="fl"><label>الجدول الزمني</label><input value={form.schedule} onChange={fld('schedule')} placeholder="السبت 10-12..."/></div>
                <div className="fl"><label>الطاقة الاستيعابية</label><input type="number" value={form.capacity} onChange={fld('capacity')} min="1"/></div>
                <div className="fl"><label>الحالة</label><select value={form.status} onChange={fld('status')}><option value="active">نشط</option><option value="paused">متوقف</option></select></div>
                <div className="fl full"><label>الوصف</label><textarea value={form.description} onChange={fld('description')} rows={2}/></div>
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
