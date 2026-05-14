import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel, syncFromFirebase, pushToFirebase, getCenterId } from '../hooks/useStorage';
import { uid, todayStr } from '../utils/dateHelpers';
import { ROLES } from '../utils/constants';
import { updateCenterSettings, createUser, updateUser, deleteUser, getCenterUsers } from '../firebase/db';

const PRESET_COLORS=['#1a56db','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#0f172a'];
const ROLE_OPTIONS=[['manager','مدير'],['vice','نائب المدير'],['specialist_speech','أخصائي تخاطب'],['specialist_physio','أخصائي علاج فيزيائي'],['specialist_behavior','أخصائي تعديل سلوك'],['specialist_occupational','أخصائي علاج وظيفي'],['specialist','أخصائي عام'],['reception','استقبال'],['admin','إداري'],['technician','فني النظام'],['parent','ولي أمر']];

const PERMISSIONS = [
  {key:'dash',name:'الرئيسية',icon:'📊'},
  {key:'students',name:'الطلاب',icon:'👦'},
  {key:'hr',name:'الموظفون',icon:'👥'},
  {key:'finance',name:'المالية',icon:'💳'},
  {key:'reports',name:'التقارير',icon:'📊'},
  {key:'settings',name:'الإعدادات',icon:'⚙️'},
  {key:'docs',name:'الوثائق',icon:'📄'},
  {key:'parents',name:'أولياء الأمور',icon:'👨‍👩‍👧'},
  {key:'partnerships',name:'الشراكات',icon:'🤝'},
  {key:'visits',name:'الزيارات',icon:'🏛️'},
  {key:'calendar',name:'التقويم',icon:'📅'},
];

export default function Settings() {
  const { center, currentUser, persistConfig, updateCenterColor, toast } = useApp();
  const [tab, setTab] = useState('center');
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [userForm, setUserForm] = useState({ username:'', password:'', name:'', email:'', role:'specialist', title:'', permissions:{} });
  const [centerForm, setCenterForm] = useState({ name:center.name||'', type:center.type||'', phone:center.phone||'', logo:center.logo||'' });
  const [selColor, setSelColor] = useState(center.color||'#1a56db');
  const [syncLoading, setSyncLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const isManager = currentUser?.role === 'manager';
  const centerId = currentUser?.centerId || currentUser?.uid || getCenterId();

  useEffect(() => {
    reloadUsers();
  }, []);

  async function reloadUsers() {
    if (!centerId) return;
    try {
      const fbUsers = await getCenterUsers(centerId);
      if (fbUsers.length > 0) {
        setUsers(fbUsers);
      } else {
        setUsers(lsGet('users'));
      }
    } catch(e) {
      setUsers(lsGet('users'));
    }
  }

  const fldU = k => e => setUserForm(f=>({...f,[k]:e.target.value}));

  async function saveUser() {
    if (!userForm.username.trim()||!userForm.name.trim()) { toast('⚠️ أدخل اسم المستخدم والاسم الكامل','er'); return; }
    if (!editUserId&&!userForm.password) { toast('⚠️ أدخل كلمة المرور','er'); return; }

    const userData = { ...userForm, centerId, permissions: userForm.permissions||{}, active:true };

    try {
      if (editUserId) {
        await updateUser(editUserId, userData);
        lsUpd('users', editUserId, userData);
        toast('✅ تم التحديث','ok');
      } else {
        const newId = await createUser(centerId, userData);
        lsAdd('users', {...userData, id:newId});
        toast('✅ تم إضافة المستخدم','ok');
      }
      setShowUserForm(false);
      setEditUserId(null);
      setUserForm({ username:'', password:'', name:'', email:'', role:'specialist', title:'', permissions:{} });
      reloadUsers();
    } catch(e) {
      toast('❌ حدث خطأ: '+e.message,'er');
    }
  }

  async function delUser(id) {
    if (!window.confirm('حذف هذا المستخدم؟')) return;
    try {
      await deleteUser(id);
      lsDel('users', id);
      reloadUsers();
      toast('🗑️ تم الحذف','ok');
    } catch(e) {
      toast('❌ خطأ في الحذف','er');
    }
  }

  async function saveCenter() {
    const updated = { ...center, ...centerForm, color: selColor, configured:true };
    try {
      if (centerId) {
        await updateCenterSettings(centerId, {
          name: centerForm.name,
          type: centerForm.type,
          phone: centerForm.phone,
          logo: centerForm.logo,
          color: selColor,
          isSetup: true
        });
        if (centerForm.logo) localStorage.setItem('scs_center_logo', centerForm.logo);
      }
      persistConfig(updated);
      toast('✅ تم حفظ بيانات المركز','ok');
    } catch(e) {
      toast('❌ خطأ في الحفظ','er');
    }
  }

  function handleCenterLogo(e) {
    const f = e.target.files?.[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => setCenterForm(prev=>({...prev, logo:ev.target.result}));
    r.readAsDataURL(f);
  }

  function exportData() {
    const keys=['employees','students','sessions','leaves','salaries','attEmp','attStu','appointments','iepGoals','calEvents','income','expenses','notifs','studentFees','payments','warnings'];
    const data={};
    keys.forEach(k=>{ data[k]=lsGet(k); });
    data.centerName = center.name;
    data.exportDate = new Date().toISOString();
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=`backup_${center.name}_${todayStr()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast('✅ تم تصدير البيانات','ok');
  }

  function importData(e) {
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=ev=>{
      try {
        const data=JSON.parse(ev.target.result);
        const keys=['employees','students','sessions','leaves','salaries','attEmp','attStu','appointments','iepGoals','calEvents','income','expenses','notifs','studentFees','payments','warnings'];
        keys.forEach(k=>{ if(data[k]) lsAdd && localStorage.setItem(`${centerId}_${k}`, JSON.stringify(data[k])); });
        toast('✅ تم استيراد البيانات - أعد تحميل الصفحة','ok');
      } catch(err) { toast('❌ خطأ في الملف','er'); }
    };
    r.readAsText(f);
  }

  const TABS = [
    ['center','🏥 بيانات المركز'],
    ['appearance','🎨 المظهر'],
    ['users','👥 المستخدمون'],
    ['backup','💾 النسخ الاحتياطي'],
    ['about','ℹ️ عن النظام'],
  ];

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>⚙️ الإعدادات</h2>
          <p>إدارة النظام والمستخدمين</p>
        </div>
      </div>

      <div className="tabs" style={{flexWrap:'wrap',marginBottom:20}}>
        {TABS.map(([v,l])=>(
          <button key={v} type="button" className={`tab ${tab===v?'on':''}`} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {/* بيانات المركز */}
      {tab==='center' && (
        <div className="wg">
          <div className="wg-h"><h3>🏥 بيانات المركز</h3></div>
          <div className="wg-b">
            <div className="fg c2">
              <div className="fl full"><label>اسم المركز</label><input value={centerForm.name} onChange={e=>setCenterForm(f=>({...f,name:e.target.value}))}/></div>
              <div className="fl"><label>نوع المركز</label>
                <select value={centerForm.type} onChange={e=>setCenterForm(f=>({...f,type:e.target.value}))}>
                  <option value="">اختر</option>
                  {['تربية خاصة','تأهيل','تخاطب','توحد','صعوبات تعلم','متعدد التخصصات'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="fl"><label>الهاتف</label><input value={centerForm.phone} onChange={e=>setCenterForm(f=>({...f,phone:e.target.value}))}/></div>
              <div className="fl full">
                <label>الشعار</label>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  {centerForm.logo ? <img src={centerForm.logo} alt="logo" style={{width:56,height:56,borderRadius:10,objectFit:'cover'}}/> : <div style={{width:56,height:56,borderRadius:10,background:'var(--g1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>🏥</div>}
                  <label className="btn btn-g" style={{cursor:'pointer'}}>📷 رفع شعار<input type="file" accept="image/*" style={{display:'none'}} onChange={handleCenterLogo}/></label>
                  {centerForm.logo && <button className="btn btn-d" onClick={()=>setCenterForm(f=>({...f,logo:''}))}>🗑️</button>}
                </div>
              </div>
            </div>
            <button className="btn btn-p" style={{marginTop:16}} onClick={saveCenter}>💾 حفظ</button>
          </div>
        </div>
      )}

      {/* المظهر */}
      {tab==='appearance' && (
        <div className="wg">
          <div className="wg-h"><h3>🎨 اللون الرئيسي</h3></div>
          <div className="wg-b">
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
              {PRESET_COLORS.map(c=>(
                <button key={c} onClick={()=>{setSelColor(c);updateCenterColor(c);}} style={{
                  width:38,height:38,borderRadius:'50%',background:c,border:'none',cursor:'pointer',
                  outline:selColor===c?`3px solid ${c}`:'none',outlineOffset:2,
                  transform:selColor===c?'scale(1.2)':'scale(1)',transition:'transform 0.2s'
                }}/>
              ))}
            </div>
            <button className="btn btn-p" onClick={saveCenter}>💾 حفظ</button>
          </div>
        </div>
      )}

      {/* المستخدمون */}
      {tab==='users' && (
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            {isManager && <button className="btn btn-p" onClick={()=>{setUserForm({username:'',password:'',name:'',email:'',role:'specialist',title:'',permissions:{}});setEditUserId(null);setShowUserForm(true);}}>➕ مستخدم جديد</button>}
          </div>

          {users.length===0 ? (
            <div className="empty"><div className="ei">👥</div><div className="et">لا يوجد مستخدمون</div></div>
          ) : (
            <div className="g2">
              {users.map(u=>(
                <div key={u.id} className="card">
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:44,height:44,borderRadius:'50%',background:'var(--pr-l)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem'}}>
                      {u.role==='manager'?'👑':u.role==='parent'?'👨‍👩‍👧':'👤'}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700}}>{u.name}</div>
                      <div style={{fontSize:'.78rem',color:'var(--g5)'}}>@{u.username} · {ROLES[u.role]||u.role}</div>
                    </div>
                    {isManager && (
                      <div className="c-acts">
                        <button className="btn btn-xs btn-g" onClick={()=>{setUserForm({...u,password:''});setEditUserId(u.id);setShowUserForm(true);}}>✏️</button>
                        <button className="btn btn-xs btn-d" onClick={()=>delUser(u.id)}>🗑️</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* نافذة المستخدم */}
          {showUserForm && (
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget){setShowUserForm(false);setEditUserId(null);}}}>
              <div className="mb mb-xl" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}>
                  <h2>{editUserId?'✏️ تعديل':'➕ مستخدم جديد'}</h2>
                </div>
                <div className="modal-body-scroll" style={{padding:'18px 20px'}}>
                  <div className="fg c2">
                    <div className="fl full"><label>الاسم الكامل <span className="req">*</span></label><input value={userForm.name} onChange={fldU('name')}/></div>
                    <div className="fl"><label>اسم المستخدم <span className="req">*</span></label><input value={userForm.username} onChange={fldU('username')} autoComplete="off"/></div>
                    <div className="fl"><label>كلمة المرور {!editUserId&&<span className="req">*</span>}</label><input type="password" value={userForm.password} onChange={fldU('password')} placeholder={editUserId?'اتركها للإبقاء':'••••••••'}/></div>
                    <div className="fl full"><label>البريد الإلكتروني</label><input type="email" value={userForm.email||''} onChange={fldU('email')}/></div>
                    <div className="fl full"><label>الدور</label>
                      <select value={userForm.role} onChange={fldU('role')}>
                        {ROLE_OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{marginTop:20}}>
                    <div className="fsh">🔐 الصلاحيات</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
                      {PERMISSIONS.map(p=>(
                        <label key={p.key} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',border:'1px solid var(--border-color)',borderRadius:8,cursor:'pointer',background:(userForm.permissions||{})[p.key]?'var(--ok-l)':'transparent'}}>
                          <input type="checkbox" checked={(userForm.permissions||{})[p.key]||false} onChange={e=>setUserForm(f=>({...f,permissions:{...(f.permissions||{}),[p.key]:e.target.checked}}))}/>
                          <span style={{fontSize:'.84rem',fontWeight:700}}>{p.icon} {p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="fa">
                  <button className="btn btn-p" onClick={saveUser}>💾 حفظ</button>
                  <button className="btn btn-g" onClick={()=>{setShowUserForm(false);setEditUserId(null);}}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* النسخ الاحتياطي */}
      {tab==='backup' && (
        <div>
          {/* Firebase Sync */}
          <div className="wg" style={{marginBottom:14}}>
            <div className="wg-h"><h3>🔥 مزامنة Firebase</h3></div>
            <div className="wg-b">
              <p style={{fontSize:'.86rem',color:'var(--g5)',marginBottom:16}}>
                البيانات تُحفظ تلقائياً في Firebase عند كل إضافة أو تعديل. استخدم هذه الأزرار للمزامنة اليدوية إذا لاحظت نقصاً في البيانات.
              </p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:12}}>
                <button className="btn btn-p" disabled={pushLoading} onClick={async()=>{
                  if (!centerId) { toast('⚠️ سجّل دخولك أولاً','er'); return; }
                  setPushLoading(true);
                  toast('⬆️ جارٍ رفع البيانات...','ok');
                  try {
                    await pushToFirebase(centerId);
                    toast('✅ تم رفع كل البيانات لـ Firebase!','ok');
                  } catch(e) {
                    toast('❌ خطأ في الرفع','er');
                  } finally {
                    setPushLoading(false);
                  }
                }}>
                  {pushLoading ? '⏳ جارٍ...' : '⬆️ رفع بياناتي لـ Firebase'}
                </button>
                <button className="btn btn-s" disabled={syncLoading} onClick={async()=>{
                  if (!centerId) { toast('⚠️ سجّل دخولك أولاً','er'); return; }
                  setSyncLoading(true);
                  toast('⬇️ جارٍ جلب البيانات...','ok');
                  try {
                    const keys=['students','employees','sessions','appointments','iepGoals','attStu','attEmp','income','expenses','salaries','leaves','calEvents','centerActivities','parentInteractions','consultations','evaluations','warnings','stuReports','behaviorPlans','studentFees','payments','notifs','manualAlerts'];
                    await syncFromFirebase(centerId, keys);
                    toast('✅ تم الجلب! جارٍ إعادة التحميل...','ok');
                    setTimeout(()=>window.location.reload(), 1500);
                  } catch(e) {
                    toast('❌ خطأ في الجلب','er');
                  } finally {
                    setSyncLoading(false);
                  }
                }}>
                  {syncLoading ? '⏳ جارٍ...' : '⬇️ جلب بياناتي من Firebase'}
                </button>
              </div>
              <div style={{padding:'10px 14px',background:'var(--ok-l)',borderRadius:8,fontSize:'.78rem',color:'var(--ok)'}}>
                💡 <strong>رفع:</strong> يرفع بيانات هذا الجهاز للسحابة &nbsp;|&nbsp;
                <strong>جلب:</strong> يجلب بيانات السحابة لهذا الجهاز
              </div>
            </div>
          </div>

          {/* JSON Backup */}
          <div className="wg" style={{marginBottom:14}}>
            <div className="wg-h"><h3>💾 نسخة احتياطية JSON</h3></div>
            <div className="wg-b">
              <p style={{fontSize:'.86rem',color:'var(--g5)',marginBottom:16}}>تصدير واستيراد جميع بيانات المركز كملف JSON.</p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <button className="btn btn-p" onClick={exportData}>📥 تصدير البيانات</button>
                <label className="btn btn-s" style={{cursor:'pointer'}}>
                  📤 استيراد بيانات
                  <input type="file" accept=".json" style={{display:'none'}} onChange={importData}/>
                </label>
              </div>
              <div style={{marginTop:12,padding:'10px',background:'var(--warn-l)',borderRadius:8,fontSize:'.78rem',color:'var(--warn)'}}>
                ⚠️ الاستيراد سيستبدل البيانات الحالية — تأكد من أخذ نسخة احتياطية أولاً.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* عن النظام */}
      {tab==='about' && (
        <div className="wg">
          <div className="wg-h"><h3>ℹ️ عن النظام</h3></div>
          <div className="wg-b" style={{textAlign:'center',padding:30}}>
            <div style={{fontSize:'3rem',marginBottom:12}}>🏥</div>
            <h2 style={{margin:'0 0 8px'}}>نظام إدارة المركز المتكامل</h2>
            <p style={{color:'var(--g5)',marginBottom:4}}>الإصدار 2.0 — مع Firebase</p>
            <p style={{color:'var(--g5)',fontSize:'.85rem'}}>منصة إدارية شاملة للمراكز التعليمية والتأهيلية</p>
            <div style={{marginTop:20,padding:'12px 16px',background:'var(--g0)',borderRadius:10,fontSize:'.82rem',color:'var(--g5)'}}>
              <div>المركز: <strong>{center.name||'—'}</strong></div>
              <div>المستخدم: <strong>{currentUser?.name||'—'}</strong></div>
              <div>الدور: <strong>{ROLES[currentUser?.role]||currentUser?.role||'—'}</strong></div>
              <div>Firebase: <strong style={{color:'var(--ok)'}}>✅ متصل</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
