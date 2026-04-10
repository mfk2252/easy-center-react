import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { ROLES, SPECIALIST_ROLES } from '../../utils/constants';
import { calcAge, todayStr, uid } from '../../utils/dateHelpers';
import EmptyState from '../../components/ui/EmptyState';
import Leaves from './Leaves';
import Salaries from './Salaries';
import HrAttendance from './HrAttendance';

function roleLabel(r) { return ROLES[r] || r || '—'; }
const isSpec = r => SPECIALIST_ROLES.includes(r);
const WORK_DAYS = [['sun','الأحد'],['mon','الإثنين'],['tue','الثلاثاء'],['wed','الأربعاء'],['thu','الخميس'],['fri','الجمعة'],['sat','السبت']];
const EMPTY_EMP = { name:'',role:'',phone:'',dob:'',gender:'',nationality:'',idNumber:'',email:'',address:'',hireDate:'',contractType:'',contractEnd:'',salary:'',allowanceHousing:'',allowanceTransport:'',annualLeave:21,workHours:40,iban:'',workStart:'08:00',workEnd:'16:00',workDays:[],education:'',major:'',experience:'',certs:'',notes:'',photo:'',status:'active',attachments:[] };

export default function HRPage() {
  const { go, toast, currentUser, activeView } = useApp();
  const [emps, setEmps] = useState([]);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_EMP);
  const [detailId, setDetailId] = useState(null);
  const canEdit = ['manager','vice'].includes(currentUser?.role);

  useEffect(() => { setEmps(lsGet('employees')); }, [activeView]);

  // Sub-route rendering (after all hooks)
  if (activeView === 'hr-leaves') return <Leaves/>;
  if (activeView === 'hr-salary') return <Salaries/>;
  if (activeView === 'hr-att') return <HrAttendance/>;

  function reload() { setEmps(lsGet('employees')); }

  const filtered = emps.filter(e => {
    if (tab==='specialist' && !isSpec(e.role)) return false;
    if (tab==='reception' && e.role!=='reception') return false;
    if (tab==='admin' && e.role!=='admin') return false;
    if (tab==='worker' && e.role!=='worker') return false;
    if (q && !(e.name||'').toLowerCase().includes(q.toLowerCase()) && !(e.phone||'').includes(q)) return false;
    return true;
  });

  function openForm(emp=null) {
    if(emp){setForm({...EMPTY_EMP,...emp,attachments:emp.attachments||[]});setEditId(emp.id);}
    else{setForm({...EMPTY_EMP,hireDate:todayStr(),attachments:[]});setEditId(null);}
    setShowForm(true);
  }
  const fld = k => e => setForm(f=>({...f,[k]:e.target.value}));
  function toggleWorkDay(day){setForm(f=>{const days=f.workDays||[];return{...f,workDays:days.includes(day)?days.filter(d=>d!==day):[...days,day]};});}

  function save(){
    if(!form.name.trim()){toast('⚠️ أدخل اسم الموظف','er');return;}
    if(!form.role){toast('⚠️ اختر المسمى الوظيفي','er');return;}
    if(editId){lsUpd('employees',editId,form);toast('✅ تم التحديث','ok');}
    else{lsAdd('employees',{...form,id:uid()});toast('✅ تم إضافة الموظف','ok');}
    setShowForm(false);reload();
  }
  function deleteEmp(id){
    if(!window.confirm('⚠️ تحذير نهائي: حذف الموظف نهائياً من النظام على هذا الجهاز.\nهل تريد المتابعة؟'))return;
    if(!window.confirm('تأكيد أخير: لا يمكن التراجع. حذف الموظف؟'))return;
    lsDel('employees',id);toast('🗑️ تم الحذف','ok');reload();setDetailId(null);setShowForm(false);
  }
  function handlePhoto(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setForm(fm=>({...fm,photo:ev.target.result}));r.readAsDataURL(f);}
  function addEmpAttachments(e){
    const files=e.target.files;if(!files?.length)return;
    Array.from(files).forEach(f=>{const r=new FileReader();r.onload=ev=>setForm(fm=>({...fm,attachments:[...(fm.attachments||[]),{id:uid(),name:f.name,data:ev.target.result,label:'مرفق'}]}));r.readAsDataURL(f);});
    e.target.value='';
  }
  function removeEmpAtt(aid){setForm(f=>({...f,attachments:(f.attachments||[]).filter(a=>a.id!==aid)}));}

  const detailEmp = detailId ? emps.find(e=>e.id===detailId) : null;

  if(detailEmp){
    const sessions=lsGet('sessions').filter(s=>s.empId===detailEmp.id||s.specialistId===detailEmp.id);
    const leaves=lsGet('leaves').filter(l=>l.empId===detailEmp.id);
    return (
      <div>
        <div className="det-hd">
          <div className="det-av" style={{background:isSpec(detailEmp.role)?'var(--pur-l)':'var(--pr-l)'}}>
            {detailEmp.photo?<img src={detailEmp.photo} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:16}}/>:(detailEmp.name||'?').slice(0,2)}
          </div>
          <div className="det-info">
            <h2>{detailEmp.name}</h2>
            <div className="det-sub">
              <span>{roleLabel(detailEmp.role)}</span>
              {detailEmp.phone&&<span>📞 {detailEmp.phone}</span>}
              {detailEmp.hireDate&&<span>📅 تعيين: {detailEmp.hireDate}</span>}
            </div>
          </div>
          <div className="det-acts">
            {canEdit&&<button className="btn btn-p" onClick={()=>openForm(detailEmp)}>✏️ تعديل</button>}
            {detailEmp.phone&&<a href={`https://wa.me/${detailEmp.phone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}`} target="_blank" rel="noreferrer" className="btn btn-bl btn-sm">💬</a>}
            <button className="btn btn-g" onClick={()=>setDetailId(null)}>← رجوع</button>
          </div>
        </div>
        <div className="stats" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
          <div className="sc"><div className="lb">الراتب الأساسي</div><div className="vl" style={{fontSize:'1.2rem'}}>{detailEmp.salary?Number(detailEmp.salary).toLocaleString()+' ر':'—'}</div></div>
          <div className="sc g"><div className="lb">الجلسات</div><div className="vl">{sessions.length}</div></div>
          <div className="sc v"><div className="lb">الإجازات</div><div className="vl">{leaves.length}</div></div>
        </div>
        <div className="wg">
          <div className="wg-h"><h3>👤 بيانات الموظف</h3></div>
          <div className="wg-b">
            <div className="info-grid">
              {[['الاسم',detailEmp.name],['المسمى',roleLabel(detailEmp.role)],['الجوال',detailEmp.phone],['الجنسية',detailEmp.nationality],['رقم الهوية',detailEmp.idNumber],['البريد',detailEmp.email],['نوع العقد',detailEmp.contractType],['تاريخ التعيين',detailEmp.hireDate],['الراتب',detailEmp.salary?Number(detailEmp.salary).toLocaleString()+' ر':'—'],['بدل السكن',detailEmp.allowanceHousing?Number(detailEmp.allowanceHousing).toLocaleString()+' ر':'—'],['بدل النقل',detailEmp.allowanceTransport?Number(detailEmp.allowanceTransport).toLocaleString()+' ر':'—'],['رصيد الإجازة',detailEmp.annualLeave?detailEmp.annualLeave+' يوم':'—'],['المؤهل',detailEmp.education],['التخصص',detailEmp.major],['الخبرة',detailEmp.experience?detailEmp.experience+' سنة':'—'],['IBAN',detailEmp.iban]].filter(([,v])=>v).map(([k,v])=>(
                <div className="ic" key={k}><div className="ik">{k}</div><div className="iv">{v}</div></div>
              ))}
            </div>
            {detailEmp.notes&&<div style={{marginTop:12,padding:'10px 14px',background:'var(--g0)',borderRadius:'var(--r2)',fontSize:'.84rem'}}><b>ملاحظات:</b> {detailEmp.notes}</div>}
          </div>
        </div>
        {showForm&&renderForm()}
      </div>
    );
  }

  function renderForm(){
    return (
      <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowForm(false);}}>
        <div className="mb mb-xl" style={{padding:0,overflow:'hidden',borderRadius:16}}>
          <div className="fhd" style={{padding:'16px 20px',borderRadius:0}}>
            <h2>{editId?'✏️ تعديل بيانات الموظف':'➕ موظف جديد'}</h2><p>بيانات شاملة للموظف</p>
          </div>
          <div className="modal-body-scroll" style={{padding:'18px 20px'}}>
            <div className="fs"><div className="fsh">👤 البيانات الأساسية</div><div className="fsb">
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <div style={{width:70,height:70,borderRadius:'50%',border:'3px dashed var(--g3)',background:'var(--g1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',cursor:'pointer',overflow:'hidden'}} onClick={()=>document.getElementById('emp-photo-inp2').click()}>
                  {form.photo?<img src={form.photo} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'📷'}
                </div>
                <button className="btn btn-g btn-sm" type="button" onClick={()=>document.getElementById('emp-photo-inp2').click()}>📷 صورة الموظف</button>
                <input id="emp-photo-inp2" type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto}/>
              </div>
              <div className="fg c3">
                <div className="fl"><label>الاسم الكامل <span className="req">*</span></label><input value={form.name} onChange={fld('name')} placeholder="الاسم الثلاثي"/></div>
                <div className="fl"><label>المسمى الوظيفي <span className="req">*</span></label>
                  <select value={form.role} onChange={fld('role')}>
                    <option value="">-- اختر --</option>
                    {Object.entries(ROLES).filter(([k])=>!['manager','vice','technician','parent'].includes(k)).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="fl"><label>رقم الجوال <span className="req">*</span></label><input value={form.phone} onChange={fld('phone')} type="tel" placeholder="05xxxxxxxx"/></div>
              </div>
              <div className="fg c3" style={{marginTop:10}}>
                <div className="fl"><label>تاريخ الميلاد</label><input value={form.dob} onChange={fld('dob')} type="date"/></div>
                <div className="fl"><label>الجنس</label><select value={form.gender} onChange={fld('gender')}><option value="">--</option><option>ذكر</option><option>أنثى</option></select></div>
                <div className="fl"><label>الجنسية</label><input value={form.nationality} onChange={fld('nationality')} placeholder="سعودي"/></div>
              </div>
              <div className="fg c3" style={{marginTop:10}}>
                <div className="fl"><label>رقم الهوية</label><input value={form.idNumber} onChange={fld('idNumber')} placeholder="1xxxxxxxxx"/></div>
                <div className="fl"><label>البريد الإلكتروني</label><input value={form.email} onChange={fld('email')} type="email"/></div>
                <div className="fl"><label>العنوان</label><input value={form.address} onChange={fld('address')} placeholder="المدينة / الحي"/></div>
              </div>
            </div></div>
            <div className="fs"><div className="fsh">💼 البيانات الوظيفية</div><div className="fsb">
              <div className="fg c3">
                <div className="fl"><label>تاريخ التعيين</label><input value={form.hireDate} onChange={fld('hireDate')} type="date"/></div>
                <div className="fl"><label>نوع العقد</label><select value={form.contractType} onChange={fld('contractType')}><option value="">--</option><option>دوام كامل</option><option>دوام جزئي</option><option>عقد محدد المدة</option><option>متعاقد</option></select></div>
                <div className="fl"><label>تاريخ انتهاء العقد</label><input value={form.contractEnd} onChange={fld('contractEnd')} type="date"/></div>
              </div>
              <div className="fg c3" style={{marginTop:10}}>
                <div className="fl"><label>الراتب الأساسي (ريال)</label><input value={form.salary} onChange={fld('salary')} type="number" min="0"/></div>
                <div className="fl"><label>بدل السكن</label><input value={form.allowanceHousing} onChange={fld('allowanceHousing')} type="number" min="0"/></div>
                <div className="fl"><label>بدل النقل</label><input value={form.allowanceTransport} onChange={fld('allowanceTransport')} type="number" min="0"/></div>
              </div>
              <div className="fg c3" style={{marginTop:10}}>
                <div className="fl"><label>رصيد الإجازة (أيام)</label><input value={form.annualLeave} onChange={fld('annualLeave')} type="number" min="0"/></div>
                <div className="fl"><label>ساعات العمل الأسبوعية</label><input value={form.workHours} onChange={fld('workHours')} type="number" min="0"/></div>
                <div className="fl"><label>رقم IBAN</label><input value={form.iban} onChange={fld('iban')} placeholder="SA..."/></div>
              </div>
              <div style={{marginTop:12,border:'1.5px solid var(--border-color)',borderRadius:10,padding:12}}>
                <div style={{fontSize:'.8rem',fontWeight:800,color:'var(--pr)',marginBottom:10}}>🕐 مواعيد الدوام</div>
                <div className="fg c2" style={{marginBottom:10}}>
                  <div className="fl"><label>وقت البداية</label><input value={form.workStart} onChange={fld('workStart')} type="time"/></div>
                  <div className="fl"><label>وقت النهاية</label><input value={form.workEnd} onChange={fld('workEnd')} type="time"/></div>
                </div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  {WORK_DAYS.map(([v,l])=>(
                    <label key={v} style={{display:'flex',alignItems:'center',gap:4,fontSize:'.82rem',cursor:'pointer'}}>
                      <input type="checkbox" checked={(form.workDays||[]).includes(v)} onChange={()=>toggleWorkDay(v)}/> {l}
                    </label>
                  ))}
                </div>
              </div>
            </div></div>
            <div className="fs"><div className="fsh">🎓 المؤهلات</div><div className="fsb">
              <div className="fg c3">
                <div className="fl"><label>المؤهل العلمي</label><select value={form.education} onChange={fld('education')}><option value="">--</option><option>دبلوم</option><option>بكالوريوس</option><option>ماجستير</option><option>دكتوراه</option><option>أخرى</option></select></div>
                <div className="fl"><label>التخصص</label><input value={form.major} onChange={fld('major')} placeholder="تربية خاصة..."/></div>
                <div className="fl"><label>سنوات الخبرة</label><input value={form.experience} onChange={fld('experience')} type="number" min="0"/></div>
              </div>
              <div className="fg c2" style={{marginTop:10}}>
                <div className="fl"><label>الشهادات</label><textarea value={form.certs} onChange={fld('certs')} rows={2} placeholder="شهادة BCaBA..."/></div>
                <div className="fl"><label>ملاحظات</label><textarea value={form.notes} onChange={fld('notes')} rows={2}/></div>
              </div>
            </div></div>
            <div className="fs"><div className="fsh">📎 المرفقات (عقد، هوية، شهادات)</div><div className="fsb">
              <div className="fl full"><label>إضافة ملفات</label><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*" onChange={addEmpAttachments}/></div>
              {(form.attachments||[]).length>0&&<ul style={{margin:'10px 0 0',padding:0,listStyle:'none',fontSize:'.84rem'}}>
                {(form.attachments||[]).map(a=><li key={a.id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <a href={a.data} download={a.name} className="btn btn-xs btn-g">📥 {a.name}</a>
                  <button type="button" className="btn btn-xs btn-d" onClick={()=>removeEmpAtt(a.id)}>إزالة</button>
                </li>)}
              </ul>}
            </div></div>
          </div>
          <div className="fa">
            <button className="btn btn-p" onClick={save}>💾 حفظ</button>
            <button className="btn btn-g" onClick={()=>setShowForm(false)}>إلغاء</button>
            {editId&&<button type="button" className="btn btn-d btn-sm" style={{marginRight:'auto'}} onClick={()=>deleteEmp(editId)}>⛔ حذف الموظف نهائياً</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>👥 الموظفون</h2><p>إدارة شاملة للكوادر البشرية في المركز</p></div>
        <div className="ph-a">
          <button className="btn btn-g btn-sm no-print" onClick={()=>go('attendance')}>📅 الحضور السريع</button>
          <button className="btn btn-g btn-sm no-print" onClick={()=>go('hr-leaves')}>🌴 الإجازات</button>
          {canEdit&&<button className="btn btn-p no-print" onClick={()=>openForm()}>➕ موظف جديد</button>}
        </div>
      </div>
      <div className="tabs">
        {[['all','الكل'],['specialist','أخصائيون'],['reception','استقبال'],['admin','إداري'],['worker','عمال']].map(([v,l])=>(
          <button key={v} className={`tab ${tab===v?'on':''}`} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>
      <div className="tb">
        <input className="srch" value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 ابحث بالاسم أو رقم الجوال..."/>
      </div>
      <div className="stats" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="sc"><div className="lb">إجمالي الموظفين</div><div className="vl">{emps.length}</div></div>
        <div className="sc g"><div className="lb">الأخصائيون</div><div className="vl">{emps.filter(e=>isSpec(e.role)).length}</div></div>
        <div className="sc v"><div className="lb">الإداريون والاستقبال</div><div className="vl">{emps.filter(e=>['reception','admin'].includes(e.role)).length}</div></div>
      </div>
      {filtered.length===0
        ?<EmptyState icon="👥" title="لا يوجد موظفون" sub={canEdit?"اضغط ➕ موظف جديد للبدء":""}/>
        :filtered.map(e=>(
          <div key={e.id} className="card clickable" onClick={()=>setDetailId(e.id)}>
            <div className={`av lg ${isSpec(e.role)?'pur':''}`}>
              {e.photo?<img src={e.photo} alt={e.name}/>:(e.name||'?').slice(0,2)}
            </div>
            <div className="ci">
              <div className="cn">{e.name}</div>
              <div className="cm">{roleLabel(e.role)}{e.phone?' · '+e.phone:''}{e.hireDate?' · منذ '+e.hireDate:''}</div>
            </div>
            <div className="c-badges">
              {e.salary&&<span className="bdg b-gr">💰 {Number(e.salary).toLocaleString()} ر</span>}
              {e.contractType&&<span className="bdg b-cy">{e.contractType}</span>}
            </div>
            <div className="c-acts" onClick={ev=>ev.stopPropagation()}>
              {e.phone&&<a href={`https://wa.me/${e.phone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-bl">💬</a>}
              {canEdit&&<button className="btn btn-xs btn-g" onClick={()=>openForm(e)}>✏️</button>}
            </div>
          </div>
        ))
      }
      {showForm&&renderForm()}
    </div>
  );
}
