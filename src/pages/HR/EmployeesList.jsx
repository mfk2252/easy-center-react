import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { ROLES, SPECIALIST_ROLES } from '../../utils/constants';
import { todayStr, uid } from '../../utils/dateHelpers';
import {
  Users, UserPlus, Search, Phone, MessageCircle, Edit3, Trash2,
  Calendar, DollarSign, ArrowRight, Grid, List, Briefcase, Eye,
  Shield, CheckCircle2, Award, Clock
} from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';
import UnifiedBackButton from '../../components/ui/UnifiedBackButton';

function roleLabel(r) { return ROLES[r] || r || '—'; }
const isSpec = r => SPECIALIST_ROLES.includes(r);
const WORK_DAYS = [['sun','الأحد'],['mon','الإثنين'],['tue','الثلاثاء'],['wed','الأربعاء'],['thu','الخميس'],['fri','الجمعة'],['sat','السبت']];
const EMPTY_EMP = { name:'',role:'',phone:'',dob:'',gender:'',nationality:'',idNumber:'',email:'',address:'',hireDate:'',contractType:'',contractEnd:'',salary:'',allowanceHousing:'',allowanceTransport:'',annualLeave:21,workHours:40,iban:'',workStart:'08:00',workEnd:'16:00',workDays:[],education:'',major:'',experience:'',certs:'',notes:'',photo:'',status:'active',attachments:[] };

/**
 * قائمة الموظفين والكوادر — تصميم موحد متناسق مع معايير قسم الطلاب والبرامج
 */
export default function EmployeesList() {
  const { go, toast, currentUser } = useApp();
  const [emps, setEmps] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('alpha');
  const [viewMode, setViewMode] = useState('grid');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_EMP);
  const [detailId, setDetailId] = useState(null);
  const canEdit = ['manager','vice'].includes(currentUser?.role);

  useEffect(() => { setEmps(lsGet('employees') || []); }, []);

  function reload() { setEmps(lsGet('employees') || []); }

  const filtered = emps.filter(e => {
    if (roleFilter === 'specialist' && !isSpec(e.role)) return false;
    if (roleFilter === 'admin_staff' && !['reception', 'admin', 'hr', 'accountant'].includes(e.role)) return false;
    if (roleFilter === 'worker' && e.role !== 'worker') return false;
    if (roleFilter !== 'all' && roleFilter !== 'specialist' && roleFilter !== 'admin_staff' && roleFilter !== 'worker' && e.role !== roleFilter) return false;
    
    if (contractFilter !== 'all' && e.contractType !== contractFilter) return false;
    if (statusFilter !== 'all' && (e.status || 'active') !== statusFilter) return false;
    
    if (q) {
      const search = q.toLowerCase();
      const matchName = (e.name || '').toLowerCase().includes(search);
      const matchPhone = (e.phone || '').includes(search);
      const matchId = (e.idNumber || '').includes(search);
      const matchRole = roleLabel(e.role).toLowerCase().includes(search);
      if (!matchName && !matchPhone && !matchId && !matchRole) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'alpha') return (a.name || '').localeCompare(b.name || '', 'ar');
    if (sortOrder === 'newest') return (b.hireDate || '').localeCompare(a.hireDate || '');
    if (sortOrder === 'oldest') return (a.hireDate || '').localeCompare(b.hireDate || '');
    if (sortOrder === 'salary') return (Number(b.salary) || 0) - (Number(a.salary) || 0);
    return 0;
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
  function deleteEmp(id, empName=''){
    if(!window.confirm(`⚠️ تحذير: هل أنت متأكد من حذف الموظف ${empName ? `"${empName}"` : ''} نهائياً؟\nلا يمكن التراجع عن هذا الإجراء.`))return;
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
    const roleColor = isSpec(detailEmp.role) ? 'var(--pur)' : '#1a56db';

    return (
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl' }}>
        
        {/* الترويسة الموحدة لتفاصيل الموظف */}
        <UnifiedPageHeader
          icon={
            detailEmp.photo ? (
              <img src={detailEmp.photo} alt={detailEmp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
            ) : (
              <span>{(detailEmp.name || '?').slice(0, 2)}</span>
            )
          }
          iconBg={`${roleColor}18`}
          iconColor={roleColor}
          title={detailEmp.name}
          subtitle={`${roleLabel(detailEmp.role)} · هاتف: ${detailEmp.phone || 'غير مسجل'} · تعيين: ${detailEmp.hireDate || '—'}`}
          badge={detailEmp.status === 'active' || !detailEmp.status ? 'نشط على رأس العمل' : detailEmp.status}
          accentColor={roleColor}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {canEdit && (
                <button className="btn btn-p" onClick={() => openForm(detailEmp)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Edit3 style={{ width: 15, height: 15 }} />
                  <span>تعديل البيانات</span>
                </button>
              )}
              {detailEmp.phone && (
                <a
                  href={`https://wa.me/${detailEmp.phone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-s"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <MessageCircle style={{ width: 15, height: 15 }} />
                  <span>تواصل واتساب</span>
                </a>
              )}
            </div>
          }
          onBack={() => setDetailId(null)}
          backLabel="العودة لقائمة الموظفين"
        />

        {/* إحصائيات سريعة لملف الموظف */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          <div className="unified-stat-box">
            <div className="stat-label">💰 الراتب الأساسي</div>
            <div className="stat-val" style={{ color: 'var(--ok)' }}>
              {detailEmp.salary ? Number(detailEmp.salary).toLocaleString() + ' ر' : '—'}
            </div>
            <div className="stat-sub">شهرياً بدون البدلات</div>
          </div>

          <div className="unified-stat-box">
            <div className="stat-label">🎯 الجلسات والاستشارات</div>
            <div className="stat-val" style={{ color: 'var(--pr)' }}>{sessions.length}</div>
            <div className="stat-sub">جلسة مرتبطة بالموظف</div>
          </div>

          <div className="unified-stat-box">
            <div className="stat-label">🌴 طلبات الإجازة المسجلة</div>
            <div className="stat-val" style={{ color: 'var(--pur)' }}>{leaves.length}</div>
            <div className="stat-sub">الرصيد المتاح: {detailEmp.annualLeave || 21} يوم</div>
          </div>

          <div className="unified-stat-box">
            <div className="stat-label">📄 نوع العقد</div>
            <div className="stat-val" style={{ fontSize: '1.1rem' }}>{detailEmp.contractType || 'دوام كامل'}</div>
            <div className="stat-sub">{detailEmp.nationality || 'سعودي'}</div>
          </div>
        </div>

        {/* كارت البيانات التفصيلية */}
        <div className="wg" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--r)', boxShadow: 'var(--sh)', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase style={{ width: 18, height: 18, color: 'var(--pr)' }} />
              <span>البيانات الشخصية والتعاقدية</span>
            </h3>
            {canEdit && (
              <button onClick={() => deleteEmp(detailEmp.id, detailEmp.name)} className="btn btn-g btn-xs" style={{ color: 'var(--err)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trash2 style={{ width: 13, height: 13 }} />
                <span>حذف السجل</span>
              </button>
            )}
          </div>

          <div className="info-grid">
            {[
              ['الاسم الكامل', detailEmp.name],
              ['المسمى الوظيفي', roleLabel(detailEmp.role)],
              ['رقم الجوال', detailEmp.phone],
              ['الجنسية', detailEmp.nationality],
              ['رقم الهوية / الإقامة', detailEmp.idNumber],
              ['البريد الإلكتروني', detailEmp.email],
              ['نوع العقد', detailEmp.contractType],
              ['تاريخ التعيين', detailEmp.hireDate],
              ['الراتب الأساسي', detailEmp.salary ? Number(detailEmp.salary).toLocaleString() + ' ر' : '—'],
              ['بدل السكن', detailEmp.allowanceHousing ? Number(detailEmp.allowanceHousing).toLocaleString() + ' ر' : '—'],
              ['بدل النقل', detailEmp.allowanceTransport ? Number(detailEmp.allowanceTransport).toLocaleString() + ' ر' : '—'],
              ['رصيد الإجازات', detailEmp.annualLeave ? detailEmp.annualLeave + ' يوم' : '—'],
              ['المؤهل العلمي', detailEmp.education],
              ['التخصص الأكاديمي', detailEmp.major],
              ['سنوات الخبرة', detailEmp.experience ? detailEmp.experience + ' سنة' : '—'],
              ['رقم الحساب البنكي (IBAN)', detailEmp.iban]
            ].filter(([, v]) => v).map(([k, v]) => (
              <div className="ic" key={k}>
                <div className="ik">{k}</div>
                <div className="iv">{v}</div>
              </div>
            ))}
          </div>

          {detailEmp.notes && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--g0)', borderRadius: 'var(--r2)', fontSize: '.86rem', border: '1px solid var(--border-color)' }}>
              <b>ملاحظات إدارية:</b> {detailEmp.notes}
            </div>
          )}

          {/* المرفقات والوثائق إن وجدت */}
          {detailEmp.attachments?.length > 0 && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 10 }}>📁 الوثائق والمرفقات ({detailEmp.attachments.length})</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {detailEmp.attachments.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', fontSize: '0.84rem' }}>
                    <span>📄</span>
                    <span>{a.name}</span>
                    <a href={a.data} download={a.name} className="btn btn-g btn-xs">تحميل</a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showForm && renderForm()}
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

  const specialistsCount = emps.filter(e => isSpec(e.role)).length;
  const adminCount = emps.filter(e => ['reception', 'admin', 'hr', 'accountant'].includes(e.role)).length;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl' }}>
      
      {/* 1️⃣ الترويسة الموحدة لقائمة الموظفين */}
      <UnifiedPageHeader
        icon={<Users style={{ width: 24, height: 24 }} />}
        title="قائمة الكوادر والموظفين"
        subtitle="نظام شامل لإدارة بيانات الكوادر، المؤهلات العلمية، العقود، والتواصل السريع"
        badge={`${emps.length} موظف`}
        actions={
          canEdit && (
            <button
              onClick={() => openForm()}
              className="btn btn-p"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: '0.88rem' }}
            >
              <UserPlus style={{ width: 16, height: 16 }} />
              <span>موظف جديد</span>
            </button>
          )
        }
        onBack={() => go('hr')}
        backLabel="العودة للوحة الموظفين"
      />

      {/* 2️⃣ بطاقات الإحصائيات السريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 18 }}>
        <div className="unified-stat-box">
          <div className="stat-label">👥 إجمالي الموظفين</div>
          <div className="stat-val">{emps.length}</div>
          <div className="stat-sub">كافة الكوادر المسجلة</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">🎯 الكادر الفني والأخصائيون</div>
          <div className="stat-val" style={{ color: 'var(--pr)' }}>{specialistsCount}</div>
          <div className="stat-sub">تأهيل وتخاطب وتربية خاصة</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">🏢 الكادر الإداري والاستقبال</div>
          <div className="stat-val" style={{ color: 'var(--pur)' }}>{adminCount}</div>
          <div className="stat-sub">إدارة وتشغيل واستقبال</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">⚡ النتائج المطابقة للبحث</div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>{filtered.length}</div>
          <div className="stat-sub">من أصل {emps.length} موظف</div>
        </div>
      </div>

      {/* 3️⃣ شريط البحث والتصفية المتقدم (مطابق لشريط الطلاب والبرامج) */}
      <div className="unified-filter-toolbar">
        {/* Search Input */}
        <div style={{ position: 'relative', gridColumn: 'span 2' }}>
          <Search style={{ width: 16, height: 16, position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
          <input
            type="text"
            placeholder="ابحث باسم الموظف، الجوال، الهوية، أو التخصص..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="srch"
            style={{ width: '100%', paddingRight: 36, height: 40, fontSize: '0.85rem' }}
          />
        </div>

        {/* Filter by Category / Role */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="srch"
          style={{ height: 40, fontSize: '0.82rem', fontWeight: '600' }}
        >
          <option value="all">👥 جميع الوظائف والتخصصات</option>
          <option value="specialist">🎯 كافة الأخصائيين والكوادر الفنية</option>
          <option value="admin_staff">🏢 الكادر الإداري والاستقبال</option>
          <option value="worker">🧹 الخدمات والعمالة</option>
          <optgroup label="تخصيص دقيق">
            {Object.entries(ROLES).filter(([k]) => !['manager', 'vice', 'technician', 'parent'].includes(k)).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </optgroup>
        </select>

        {/* Filter by Contract Type */}
        <select
          value={contractFilter}
          onChange={(e) => setContractFilter(e.target.value)}
          className="srch"
          style={{ height: 40, fontSize: '0.82rem', fontWeight: '600' }}
        >
          <option value="all">📄 جميع أنواع العقود</option>
          <option value="دوام كامل">دوام كامل</option>
          <option value="دوام جزئي">دوام جزئي</option>
          <option value="عقد محدد المدة">عقد محدد المدة</option>
          <option value="متعاقد بالساعة">متعاقد بالساعة</option>
        </select>

        {/* Filter by Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="srch"
          style={{ height: 40, fontSize: '0.82rem', fontWeight: '600' }}
        >
          <option value="all">📌 جميع الحالات</option>
          <option value="active">🟢 نشط على رأس العمل</option>
          <option value="on_leave">🌴 في إجازة رسمية</option>
          <option value="inactive">⚪ غير نشط</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="srch"
          style={{ height: 40, fontSize: '0.82rem', fontWeight: '600' }}
        >
          <option value="alpha">🔤 الترتيب: أبجدياً (أ-ي)</option>
          <option value="newest">🆕 الترتيب: الأحدث تعييناً</option>
          <option value="oldest">📜 الترتيب: الأقدم تعييناً</option>
          <option value="salary">💰 الترتيب: الأعلى راتباً</option>
        </select>
      </div>

      {/* 4️⃣ شريط النتائج وتبديل العرض (شبكة / جدول) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>قائمة الموظفين ({filtered.length})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="tabs" style={{ margin: 0, padding: 2 }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`tab ${viewMode === 'grid' ? 'on' : ''}`}
              style={{ padding: '5px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Grid style={{ width: 14, height: 14 }} />
              <span>شبكة</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`tab ${viewMode === 'table' ? 'on' : ''}`}
              style={{ padding: '5px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <List style={{ width: 14, height: 14 }} />
              <span>جدول</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5️⃣ العرض: بطاقات الشبكة أو الجدول */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="لا يوجد موظفون مطابقون لشروط البحث"
          sub={canEdit ? 'يمكنك إضافة موظف جديد أو تعديل خيارات الفلترة أعلاه' : 'جرب تغيير خيارات البحث'}
        />
      ) : viewMode === 'grid' ? (
        <div className="unified-card-grid">
          {filtered.map(e => {
            const roleColor = isSpec(e.role) ? 'var(--pur)' : '#1a56db';
            return (
              <div
                key={e.id}
                className="unified-card"
                onClick={() => setDetailId(e.id)}
                style={{
                  borderRight: `5px solid ${roleColor}`,
                  minHeight: 220,
                }}
                onMouseEnter={ev => {
                  ev.currentTarget.style.borderColor = roleColor;
                  ev.currentTarget.style.transform = 'translateY(-3px)';
                  ev.currentTarget.style.boxShadow = 'var(--sh2)';
                }}
                onMouseLeave={ev => {
                  ev.currentTarget.style.borderColor = 'var(--border-color)';
                  ev.currentTarget.style.borderRightColor = roleColor;
                  ev.currentTarget.style.transform = 'translateY(0)';
                  ev.currentTarget.style.boxShadow = 'var(--sh)';
                }}
              >
                <div>
                  {/* Top card bar: Avatar + Name + Status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: `${roleColor}18`,
                          color: roleColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {e.photo ? (
                          <img src={e.photo} alt={e.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (e.name || '?').slice(0, 2)
                        )}
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                          {e.name}
                        </h3>
                        <span
                          className="bdg"
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            background: `${roleColor}15`,
                            color: roleColor,
                            fontWeight: 600,
                          }}
                        >
                          {roleLabel(e.role)}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.74rem',
                        color: 'var(--ok)',
                        fontWeight: 600,
                        background: 'rgba(5, 150, 105, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '20px',
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }}></span>
                      <span>نشط</span>
                    </span>
                  </div>

                  {/* Middle specs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    {e.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone style={{ width: 14, height: 14, color: 'var(--g5)' }} />
                        <span style={{ direction: 'ltr' }}>{e.phone}</span>
                      </div>
                    )}
                    {e.hireDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar style={{ width: 14, height: 14, color: 'var(--g5)' }} />
                        <span>تعيين: {e.hireDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges strip */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                    {e.salary && (
                      <span className="bdg b-gr" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                        💰 {Number(e.salary).toLocaleString()} ر/شهر
                      </span>
                    )}
                    {e.contractType && (
                      <span className="bdg b-cy" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                        {e.contractType}
                      </span>
                    )}
                    {e.major && (
                      <span className="bdg b-gy" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                        🎓 {e.major}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card footer actions */}
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={ev => ev.stopPropagation()}
                >
                  <button
                    onClick={() => setDetailId(e.id)}
                    className="btn btn-g btn-xs"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: roleColor }}
                  >
                    <Eye style={{ width: 13, height: 13 }} />
                    <span>عرض الملف</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {e.phone && (
                      <a
                        href={`https://wa.me/${e.phone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-xs btn-s"
                        title="محادثة واتساب"
                      >
                        <MessageCircle style={{ width: 13, height: 13 }} />
                      </a>
                    )}
                    {canEdit && (
                      <button
                        className="btn btn-xs btn-g"
                        onClick={() => openForm(e)}
                        title="تعديل بيانات الموظف"
                      >
                        <Edit3 style={{ width: 13, height: 13 }} />
                      </button>
                    )}
                    {canEdit && (
                      <button
                        className="btn btn-xs btn-g"
                        onClick={() => deleteEmp(e.id, e.name)}
                        title="حذف الموظف"
                        style={{ color: 'var(--err)' }}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="table-responsive" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r)', overflow: 'hidden', boxShadow: 'var(--sh)', marginBottom: 20 }}>
          <table>
            <thead>
              <tr>
                <th>الموظف</th>
                <th>المسمى الوظيفي</th>
                <th>الجوال</th>
                <th>العقد</th>
                <th>الراتب الأساسي</th>
                <th>تاريخ التعيين</th>
                <th>الحالة</th>
                <th style={{ textAlign: 'center' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const roleColor = isSpec(e.role) ? 'var(--pur)' : '#1a56db';
                return (
                  <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => setDetailId(e.id)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '8px',
                            background: `${roleColor}18`,
                            color: roleColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            overflow: 'hidden',
                          }}
                        >
                          {e.photo ? <img src={e.photo} alt={e.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (e.name || '?').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{e.name}</div>
                          {e.idNumber && <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{e.idNumber}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="bdg" style={{ background: `${roleColor}15`, color: roleColor, fontSize: '0.75rem' }}>
                        {roleLabel(e.role)}
                      </span>
                    </td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{e.phone || '—'}</td>
                    <td>{e.contractType || 'دوام كامل'}</td>
                    <td><b>{e.salary ? Number(e.salary).toLocaleString() + ' ر' : '—'}</b></td>
                    <td>{e.hireDate || '—'}</td>
                    <td>
                      <span className="bdg b-gr" style={{ fontSize: '0.72rem' }}>نشط</span>
                    </td>
                    <td onClick={ev => ev.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button className="btn btn-xs btn-p" onClick={() => setDetailId(e.id)} title="عرض الملف">
                          <Eye style={{ width: 13, height: 13 }} />
                        </button>
                        {e.phone && (
                          <a href={`https://wa.me/${e.phone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-s" title="واتساب">
                            <MessageCircle style={{ width: 13, height: 13 }} />
                          </a>
                        )}
                        {canEdit && (
                          <button className="btn btn-xs btn-g" onClick={() => openForm(e)} title="تعديل">
                            <Edit3 style={{ width: 13, height: 13 }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && renderForm()}
    </div>
  );
}
