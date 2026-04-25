import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../hooks/useStorage';
import { uid, todayStr } from '../utils/dateHelpers';
import { ROLES } from '../utils/constants';
import { signInWithGoogle, signOutGoogle, saveBackupToDrive, loadBackupFromDrive, collectAllData, restoreAllData, getGoogleUser, isGoogleSignedIn } from '../utils/googleDrive';

const PRESET_COLORS=['#1a56db','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#0f172a'];
const ROLE_OPTIONS=[['manager','مدير'],['vice','نائب المدير'],['specialist_speech','أخصائي تخاطب'],['specialist_physio','أخصائي علاج فيزيائي'],['specialist_behavior','أخصائي تعديل سلوك'],['specialist_occupational','أخصائي علاج وظيفي'],['specialist','أخصائي عام'],['reception','استقبال'],['admin','إداري'],['technician','فني النظام'],['parent','ولي أمر']];

const PERMISSIONS = [
  {name:'الرئيسية',key:'dash',icon:'📊'},
  {name:'الطلاب',key:'students',icon:'👦'},
  {name:'الموظفون',key:'hr',icon:'👥'},
  {name:'المالية',key:'finance',icon:'💳'},
  {name:'التقارير',key:'reports',icon:'📊'},
  {name:'الإعدادات',key:'settings',icon:'⚙️'},
  {name:'الوثائق',key:'docs',icon:'📄'},
  {name:'أولياء الأمور',key:'parents',icon:'👨‍👩‍👧'},
  {name:'الشراكات',key:'partnerships',icon:'🤝'},
  {name:'الزيارات',key:'visits',icon:'🏛️'},
  {name:'التقويم',key:'calendar',icon:'📅'},
];

export default function Settings() {
  const { center, currentUser, persistConfig, fbCfg, resetCenter, updateCenterColor, toast } = useApp();
  const [tab, setTab] = useState('center');
  const [users, setUsers] = useState(()=>lsGet('users'));
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [userForm, setUserForm] = useState({ username:'', password:'', name:'', email:'', role:'specialist', title:'', empId:'', permissions:{} });
  const [centerForm, setCenterForm] = useState({ name:center.name||'', type:center.type||'', phone:center.phone||'', logo:center.logo||'' });
  const [selColor, setSelColor] = useState(center.color||'#1a56db');
  const [fbForm, setFbForm] = useState({ apiKey: fbCfg?.apiKey||'', authDomain: fbCfg?.authDomain||'', projectId: fbCfg?.projectId||'', storageBucket: fbCfg?.storageBucket||'', messagingSenderId: fbCfg?.messagingSenderId||'', appId: fbCfg?.appId||'' });
  const [showResetPwInfo, setShowResetPwInfo] = useState(false);
  
  // Google Drive states
  const [googleUser, setGoogleUser] = useState(()=>getGoogleUser());
  const [driveLoading, setDriveLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState(()=>localStorage.getItem('last_drive_backup') || null);

  const isManager = currentUser?.role === 'manager';

  useEffect(() => {
    if (tab === 'center') {
      setCenterForm({ name: center.name || '', type: center.type || '', phone: center.phone || '', logo: center.logo || '' });
    }
  }, [tab, center.name, center.type, center.phone, center.logo]);
  const isTech = currentUser?.role === 'technician';
  const fldU = k => e => setUserForm(f=>({...f,[k]:e.target.value}));

  function reloadUsers() { setUsers(lsGet('users')); }

  function saveCenter() {
    const updated = { ...center, ...centerForm };
    persistConfig(updated, fbCfg);
    toast('✅ تم حفظ بيانات المركز', 'ok');
  }

  function handleCenterLogo(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setCenterForm(fm => ({ ...fm, logo: ev.target.result }));
    r.readAsDataURL(f);
    e.target.value = '';
  }

  function saveColor() {
    updateCenterColor(selColor);
    toast('✅ تم حفظ اللون', 'ok');
  }

  function saveUser() {
    if (!userForm.username.trim() || !userForm.name.trim()) { toast('⚠️ أدخل اسم المستخدم والاسم الكامل','er'); return; }
    const existing = users.find(u=>u.username===userForm.username.trim() && u.id !== editUserId);
    if (existing) { toast('⚠️ اسم المستخدم موجود مسبقاً','er'); return; }
    if (!editUserId && !userForm.password) { toast('⚠️ أدخل كلمة المرور','er'); return; }
    const userData = {
      ...userForm,
      permissions: userForm.permissions || {dash:true, students:true}
    };
    if (editUserId) { 
      lsUpd('users',editUserId,userData); 
      toast('✅ تم التحديث','ok'); 
    } else { 
      lsAdd('users',{...userData,id:uid()}); 
      toast('✅ تم إضافة المستخدم','ok'); 
    }
    setShowUserForm(false); 
    reloadUsers();
  }

  function delUser(id) {
    if (id === currentUser?.id) { toast('⚠️ لا يمكنك حذف حسابك الحالي','er'); return; }
    if (!window.confirm('حذف هذا المستخدم؟')) return;
    lsDel('users',id); reloadUsers(); toast('🗑️ تم الحذف','ok');
  }

  // Google Drive functions
  async function handleGoogleConnect() {
    setDriveLoading(true);
    try {
      const gUser = await signInWithGoogle();
      setGoogleUser(gUser);
      toast('✅ تم ربط Google Drive بنجاح!', 'ok');
    } catch(e) {
      toast('❌ فشل الاتصال بـ Google', 'er');
    } finally {
      setDriveLoading(false);
    }
  }

  function handleGoogleDisconnect() {
    signOutGoogle();
    setGoogleUser(null);
    toast('تم فصل Google Drive', 'ok');
  }

  async function handleDriveBackup() {
    if (!googleUser) { toast('⚠️ سجّل دخول بـ Google أولاً', 'er'); return; }
    setDriveLoading(true);
    try {
      const allData = collectAllData();
      await saveBackupToDrive(allData);
      const now = new Date().toLocaleString('ar-SA');
      localStorage.setItem('last_drive_backup', now);
      setLastBackup(now);
      toast('✅ تم حفظ النسخة الاحتياطية على Google Drive!', 'ok');
    } catch(e) {
      toast('❌ فشل حفظ النسخة الاحتياطية', 'er');
    } finally {
      setDriveLoading(false);
    }
  }

  async function handleDriveRestore() {
    if (!googleUser) { toast('⚠️ سجّل دخول بـ Google أولاً', 'er'); return; }
    if (!window.confirm('⚠️ سيتم استبدال جميع البيانات الحالية بالنسخة الاحتياطية. هل أنت متأكد؟')) return;
    setDriveLoading(true);
    try {
      const result = await loadBackupFromDrive();
      if (!result) { toast('⚠️ لا توجد نسخة احتياطية على Drive', 'er'); return; }
      restoreAllData(result.data);
      const backupDate = result.data.backupDate ? new Date(result.data.backupDate).toLocaleString('ar-SA') : 'غير معروف';
      toast(`✅ تم استعادة البيانات! (نسخة: ${backupDate})`, 'ok');
      setTimeout(() => window.location.reload(), 1500);
    } catch(e) {
      toast('❌ فشل استعادة البيانات', 'er');
    } finally {
      setDriveLoading(false);
    }
  }

  function exportData() {
    const keys=['employees','students','sessions','leaves','salaries','attEmp','attStu','appointments','iepGoals','calEvents','income','expenses','notifs'];
    const data={};
    keys.forEach(k=>{ data[k]=lsGet(k); });
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`backup_${center.name}_${new Date().toISOString().slice(0,10)}.json`;a.click();
    URL.revokeObjectURL(url);
    toast('✅ تم تصدير البيانات','ok');
  }

  function importData(e) {
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try {
        const data=JSON.parse(ev.target.result);
        Object.entries(data).forEach(([k,v])=>{ if(Array.isArray(v)) localStorage.setItem((center.projectId||'local')+'_'+k,JSON.stringify(v)); });
        toast('✅ تم استيراد البيانات — أعد تحميل الصفحة','ok');
      } catch(err) { toast('❌ ملف غير صالح','er'); }
    };
    r.readAsText(f);
    e.target.value='';
  }

  function importExcel(e, dataKey) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const text = ev.target.result;
        const rows = text.split('\n').filter(l=>l.trim());
        const headers = rows[0].split(',').map(h=>h.trim().replace(/"/g,''));
        const data = rows.slice(1).map(row => {
          const vals = row.split(',').map(v=>v.trim().replace(/"/g,''));
          const obj = { id: uid() };
          headers.forEach((h,i) => { obj[h] = vals[i] || ''; });
          return obj;
        }).filter(o => Object.values(o).some(v => v && v !== o.id));
        const pfx = (center.projectId || 'local') + '_';
        const existing = lsGet(dataKey);
        localStorage.setItem(pfx + dataKey, JSON.stringify([...existing, ...data]));
        toast(`✅ تم استيراد ${data.length} سجل — أعد تحميل الصفحة لرؤية البيانات`, 'ok');
      } catch(err) { toast('❌ خطأ في قراءة الملف — تأكد أنه CSV', 'er'); }
    };
    r.readAsText(f, 'UTF-8');
    e.target.value = '';
  }

  function saveFbConfig() {
    if (!fbForm.apiKey.trim() || !fbForm.projectId.trim()) { toast('⚠️ أدخل apiKey و projectId على الأقل','er'); return; }
    persistConfig({ ...center }, fbForm);
    toast('✅ تم حفظ إعدادات Firebase — أعد تحميل الصفحة لتفعيلها','ok');
  }

  function saveFontSize(v) { document.documentElement.style.setProperty('--fs',v+'px'); localStorage.setItem('scs_fontsize',v); }
  function saveFontWeight(v) { document.documentElement.style.setProperty('--fw',v); localStorage.setItem('scs_fontweight',v); }

  return (
    <div>
      <div className="ph"><div className="ph-t"><h2>⚙️ الإعدادات</h2><p>إدارة النظام والمستخدمين</p></div></div>
      <div className="tabs">
        <button className={`tab ${tab==='center'?'on':''}`} onClick={()=>setTab('center')}>بيانات المركز</button>
        <button className={`tab ${tab==='appearance'?'on':''}`} onClick={()=>setTab('appearance')}>🎨 المظهر</button>
        {isManager&&<button className={`tab ${tab==='users'?'on':''}`} onClick={()=>setTab('users')}>المستخدمون</button>}
        <button className={`tab ${tab==='backup'?'on':''}`} onClick={()=>setTab('backup')}>النسخ الاحتياطي</button>
        <button className={`tab ${tab==='about'?'on':''}`} onClick={()=>setTab('about')}>عن النظام</button>
      </div>

      {tab==='center' && (
        <div className="wg"><div className="wg-h"><h3>🏢 بيانات المركز</h3></div><div className="wg-b">
          <div className="fg c2">
            <div className="fl full"><label>اسم المركز</label><input value={centerForm.name} onChange={e=>setCenterForm(f=>({...f,name:e.target.value}))}/></div>
            <div className="fl"><label>نوع المركز</label><select value={centerForm.type} onChange={e=>setCenterForm(f=>({...f,type:e.target.value}))}><option value="">--</option><option>مركز تربية خاصة</option><option>مركز تخاطب ونطق</option><option>مركز علاج طبيعي</option><option>مركز تأهيل شامل</option><option>روضة دمج</option></select></div>
            <div className="fl"><label>رقم التواصل</label><input type="tel" value={centerForm.phone} onChange={e=>setCenterForm(f=>({...f,phone:e.target.value}))}/></div>
            <div className="fl full">
              <label>شعار المؤسسة</label>
              <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                <div style={{ width:72, height:72, borderRadius:12, border:'1px solid var(--border-color)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--g0)' }}>
                  {centerForm.logo ? <img src={centerForm.logo} alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }} /> : <span style={{ fontSize:'1.5rem' }}>🏥</span>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <input type="file" accept="image/*" onChange={handleCenterLogo} />
                  {centerForm.logo && <button type="button" className="btn btn-xs btn-d" onClick={()=>setCenterForm(f=>({...f,logo:''}))}>إزالة الشعار</button>}
                </div>
              </div>
              <p style={{ fontSize:'.75rem', color:'var(--g4)', marginTop:8 }}>يُعرض الشعار عند تسجيل الدخول، في الشريط العلوي، وفي رأس الطباعة (تقارير، رواتب، إلخ).</p>
            </div>
          </div>
          <div style={{marginTop:16,display:'flex',gap:10}}>
            {isManager&&<button className="btn btn-p" onClick={saveCenter}>💾 حفظ</button>}
            {isManager&&<button className="btn btn-d btn-sm" onClick={resetCenter}>🔄 إعادة إعداد المركز</button>}
          </div>
        </div></div>
      )}

      {tab==='appearance' && (
        <>
          <div className="wg"><div className="wg-h"><h3>🎨 اللون الرئيسي</h3></div><div className="wg-b">
            <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {PRESET_COLORS.map(c=>(
                  <div key={c} onClick={()=>setSelColor(c)} style={{width:32,height:32,borderRadius:'50%',background:c,cursor:'pointer',border:`3px solid ${selColor===c?'#0f172a':'transparent'}`,transition:'all .15s'}}/>
                ))}
                <input type="color" value={selColor} onChange={e=>setSelColor(e.target.value)} style={{width:32,height:32,borderRadius:'50%',border:'2px solid var(--g3)',cursor:'pointer',padding:0}}/>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:48,height:48,borderRadius:10,background:selColor,boxShadow:'0 2px 8px rgba(0,0,0,.2)'}}/>
                <div><div style={{fontWeight:700,fontSize:'.85rem'}}>{selColor}</div><div style={{fontSize:'.72rem',color:'var(--g4)'}}>اللون المختار</div></div>
              </div>
            </div>
            <button className="btn btn-p btn-sm" style={{marginTop:14}} onClick={saveColor}>💾 حفظ اللون</button>
          </div></div>

          <div className="wg"><div className="wg-h"><h3>🔡 حجم الخط</h3></div><div className="wg-b">
            <div style={{marginBottom:16}}>
              <div style={{fontWeight:700,color:'var(--g6)',marginBottom:8}}>حجم الخط</div>
              <input type="range" min="13" max="22" defaultValue={parseInt(localStorage.getItem('scs_fontsize')||'15')} onChange={e=>saveFontSize(e.target.value)} style={{width:'100%',accentColor:'var(--pr)'}}/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'.72rem',color:'var(--g4)',marginTop:4}}><span>صغير (13)</span><span>افتراضي (15)</span><span>كبير (22)</span></div>
            </div>
            <div>
              <div style={{fontWeight:700,color:'var(--g6)',marginBottom:8}}>سماكة الخط</div>
              <input type="range" min="400" max="900" step="100" defaultValue={parseInt(localStorage.getItem('scs_fontweight')||'600')} onChange={e=>saveFontWeight(e.target.value)} style={{width:'100%',accentColor:'var(--pr)'}}/>
            </div>
          </div></div>
        </>
      )}

      {tab==='users' && isManager && (
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <button className="btn btn-p" onClick={()=>{setUserForm({username:'',password:'',name:'',role:'specialist',title:'',empId:''});setEditUserId(null);setShowUserForm(true);}}>➕ مستخدم جديد</button>
          </div>
          {users.map(u=>(
            <div key={u.id} className="card">
              <div className="av">{(u.name||'?').slice(0,2)}</div>
              <div className="ci">
                <div className="cn">{u.name} <span style={{fontSize:'.78rem',color:'var(--g4)'}}>(@{u.username})</span></div>
                <div className="cm">{ROLES[u.role]||u.role} {u.title&&'· '+u.title}</div>
              </div>
              <div className="c-acts">
                <button className="btn btn-xs btn-g" onClick={()=>{setUserForm({...u,password:''});setEditUserId(u.id);setShowUserForm(true);}}>✏️</button>
                <button className="btn btn-xs btn-d" onClick={()=>delUser(u.id)}>🗑️</button>
              </div>
            </div>
          ))}
          {showUserForm&&(
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowUserForm(false);}}>
              <div className="mb mb-xl" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{editUserId?'✏️ تعديل المستخدم':'➕ مستخدم جديد'}</h2></div>
                <div className="modal-body-scroll" style={{padding:'18px 20px'}}>
                  {/* Basic Info */}
                  <div className="fs">
                    <div className="fsh">👤 البيانات الأساسية</div>
                    <div className="fsb">
                      <div className="fg c2">
                        <div className="fl"><label>الاسم الكامل <span className="req">*</span></label><input value={userForm.name} onChange={fldU('name')}/></div>
                        <div className="fl"><label>المسمى الوظيفي</label><input value={userForm.title} onChange={fldU('title')}/></div>
                        <div className="fl"><label>اسم المستخدم <span className="req">*</span></label><input value={userForm.username} onChange={fldU('username')} autoComplete="off"/></div>
                        <div className="fl"><label>كلمة المرور {!editUserId&&<span className="req">*</span>}</label><input type="password" value={userForm.password} onChange={fldU('password')} placeholder={editUserId?'اتركها فارغة للإبقاء':'••••••••'}/></div>
                        <div className="fl full"><label>البريد الإلكتروني</label><input type="email" value={userForm.email||''} onChange={e=>setUserForm(f=>({...f,email:e.target.value}))}/></div>
                        <div className="fl full"><label>الدور الأساسي</label>
                          <select value={userForm.role} onChange={fldU('role')}>
                            {ROLE_OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="fs" style={{marginTop:20}}>
                    <div className="fsh">🔐 الصلاحيات التفصيلية</div>
                    <div className="fsb">
                      <div style={{padding:'12px',background:'var(--g0)',borderRadius:8,marginBottom:12}}>
                        <p style={{margin:0,fontSize:'.8rem',color:'var(--g5)'}}>✓ اختر الصلاحيات التي سيحصل عليها هذا المستخدم. الصلاحيات غير المختارة ستكون غير متاحة له.</p>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                        {PERMISSIONS.map(perm=>(
                          <label key={perm.key} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',border:'1px solid var(--border-color)',borderRadius:8,cursor:'pointer',background:(userForm.permissions||{})[perm.key]?'var(--ok-l)':'transparent',transition:'background 0.2s'}}>
                            <input type="checkbox" checked={(userForm.permissions||{})[perm.key]||false} onChange={e=>{
                              setUserForm(f=>({
                                ...f,
                                permissions:{...(f.permissions||{}), [perm.key]:e.target.checked}
                              }));
                            }} style={{cursor:'pointer'}}/>
                            <span style={{fontSize:'.84rem',fontWeight:700}}>{perm.icon} {perm.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="fa">
                  <button className="btn btn-p" onClick={saveUser}>💾 حفظ</button>
                  <button className="btn btn-g" onClick={()=>setShowUserForm(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {tab==='backup' && (
        <div>
          {/* Google Drive Backup */}
          <div className="wg" style={{marginBottom:14}}>
            <div className="wg-h"><h3>☁️ النسخ الاحتياطي على Google Drive</h3></div>
            <div className="wg-b">
              <p style={{fontSize:'.86rem',color:'var(--g5)',marginBottom:16}}>
                احفظ بياناتك على Google Drive الخاص بك. يمكنك استعادتها على أي جهاز أو متصفح عند تسجيل الدخول بنفس حساب Google.
              </p>
              
              {googleUser ? (
                <div>
                  {/* Connected Account */}
                  <div style={{padding:'12px 14px',background:'var(--ok-l)',border:'1px solid var(--ok)',borderRadius:10,marginBottom:14,display:'flex',alignItems:'center',gap:12}}>
                    {googleUser.picture && <img src={googleUser.picture} alt="" style={{width:40,height:40,borderRadius:'50%'}}/>}
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:'.9rem'}}>{googleUser.name}</div>
                      <div style={{fontSize:'.75rem',color:'var(--g5)'}}>{googleUser.email}</div>
                      {lastBackup && <div style={{fontSize:'.72rem',color:'var(--ok)',marginTop:2}}>✅ آخر نسخة: {lastBackup}</div>}
                    </div>
                    <button className="btn btn-g" onClick={handleGoogleDisconnect} style={{fontSize:'.78rem'}}>فصل</button>
                  </div>
                  
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    <button 
                      className="btn btn-p" 
                      onClick={handleDriveBackup}
                      disabled={driveLoading}
                      style={{display:'flex',alignItems:'center',gap:8}}
                    >
                      {driveLoading ? '⏳ جارٍ...' : '☁️ حفظ نسخة على Drive'}
                    </button>
                    <button 
                      className="btn btn-s" 
                      onClick={handleDriveRestore}
                      disabled={driveLoading}
                    >
                      📥 استعادة من Drive
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleGoogleConnect}
                    disabled={driveLoading}
                    style={{
                      padding:'11px 20px',
                      background:'white',
                      border:'1px solid #dadce0',
                      borderRadius:10,
                      cursor: driveLoading ? 'wait' : 'pointer',
                      display:'flex',
                      alignItems:'center',
                      gap:10,
                      fontSize:'.88rem',
                      fontFamily:'Tajawal,sans-serif',
                      fontWeight:600,
                      color:'#3c4043',
                      boxShadow:'0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    {driveLoading ? 'جارٍ الاتصال...' : 'ربط Google Drive'}
                  </button>
                  <p style={{fontSize:'.78rem',color:'var(--g4)',marginTop:10}}>
                    💡 ستحتاج لتسجيل الدخول بحساب Google وإعطاء إذن الوصول لـ Drive
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* JSON Backup */}
          <div className="wg" style={{marginBottom:14}}>
            <div className="wg-h"><h3>💾 النسخ الاحتياطي (JSON)</h3></div>
            <div className="wg-b">
              <p style={{fontSize:'.86rem',color:'var(--g5)',marginBottom:16}}>تصدير واستيراد جميع بيانات المركز. يُنصح بأخذ نسخة أسبوعياً.</p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <button className="btn btn-p" onClick={exportData}>📥 تصدير البيانات (JSON)</button>
                <label className="btn btn-s" style={{cursor:'pointer'}}>
                  📤 استيراد بيانات
                  <input type="file" accept=".json" style={{display:'none'}} onChange={importData}/>
                </label>
              </div>
              <div style={{marginTop:12,padding:'10px 14px',background:'var(--warn-l)',border:'1px solid #fde68a',borderRadius:'var(--r2)',fontSize:'.82rem',color:'var(--warn)'}}>
                ⚠️ الاستيراد سيستبدل البيانات الحالية — تأكد من أخذ نسخة احتياطية أولاً.
              </div>
            </div>
          </div>

          {/* Excel Import */}
          <div className="wg" style={{marginBottom:14}}>
            <div className="wg-h"><h3>📊 استيراد من Excel (CSV)</h3></div>
            <div className="wg-b">
              <p style={{fontSize:'.86rem',color:'var(--g5)',marginBottom:12}}>استيراد قوائم الطلاب أو الموظفين من ملف Excel محوّل إلى CSV.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div style={{border:'1px solid var(--border-color)',borderRadius:10,padding:14}}>
                  <div style={{fontWeight:800,fontSize:'.88rem',marginBottom:6}}>👦 استيراد طلاب</div>
                  <div style={{fontSize:'.78rem',color:'var(--g5)',marginBottom:10}}>أعمدة مطلوبة: name, dob, diagnosis, parentName, parentPhone</div>
                  <label className="btn btn-s btn-sm" style={{cursor:'pointer',display:'inline-block'}}>
                    📂 اختر ملف CSV
                    <input type="file" accept=".csv" style={{display:'none'}} onChange={e=>importExcel(e,'students')}/>
                  </label>
                </div>
                <div style={{border:'1px solid var(--border-color)',borderRadius:10,padding:14}}>
                  <div style={{fontWeight:800,fontSize:'.88rem',marginBottom:6}}>👥 استيراد موظفين</div>
                  <div style={{fontSize:'.78rem',color:'var(--g5)',marginBottom:10}}>أعمدة مطلوبة: name, role, phone, hireDate, salary</div>
                  <label className="btn btn-s btn-sm" style={{cursor:'pointer',display:'inline-block'}}>
                    📂 اختر ملف CSV
                    <input type="file" accept=".csv" style={{display:'none'}} onChange={e=>importExcel(e,'employees')}/>
                  </label>
                </div>
              </div>
              {/* Template explanation */}
              <div style={{background:'var(--g0)',borderRadius:10,padding:14,fontSize:'.82rem'}}>
                <div style={{fontWeight:800,marginBottom:8,color:'var(--pr)'}}>📋 طريقة إعداد ملف Excel للاستيراد</div>
                <ol style={{margin:0,padding:'0 18px',lineHeight:2,color:'var(--g6)'}}>
                  <li>افتح Excel وأنشئ جدولاً جديداً</li>
                  <li>السطر الأول: أسماء الأعمدة بالإنجليزية (مثال: <code style={{background:'var(--g1)',padding:'1px 5px',borderRadius:4}}>name,dob,diagnosis,parentName,parentPhone</code>)</li>
                  <li>من السطر الثاني: أدخل البيانات، كل سطر = طالب أو موظف</li>
                  <li>احفظ الملف بتنسيق <b>CSV UTF-8</b> (ملف → حفظ باسم → CSV UTF-8)</li>
                  <li>ارفع الملف هنا باستخدام زر "اختر ملف CSV" أعلاه</li>
                </ol>
                <div style={{marginTop:10,padding:'8px 12px',background:'var(--pr-l)',borderRadius:8,color:'var(--pr)',fontWeight:700,fontSize:'.8rem'}}>
                  💡 مثال على سطر بيانات طالب:<br/>
                  <code style={{fontWeight:400,fontSize:'.78rem'}}>أحمد محمد,2019-05-10,توحد,محمد علي,0501234567</code>
                </div>
              </div>
            </div>
          </div>

          {/* Firebase Config */}
          {(isManager || currentUser?.role==='technician') && (
            <div className="wg" style={{marginBottom:14}}>
              <div className="wg-h"><h3>🔥 إعدادات Firebase Cloud</h3></div>
              <div className="wg-b">
                <p style={{fontSize:'.86rem',color:'var(--g5)',marginBottom:14}}>
                  بيانات الاتصال بقاعدة البيانات السحابية. احصل عليها من <b>Firebase Console → Project Settings → Your apps</b>.
                </p>
                <div className="fg c2">
                  <div className="fl"><label>API Key</label><input value={fbForm.apiKey} onChange={e=>setFbForm(f=>({...f,apiKey:e.target.value}))} placeholder="AIzaSy..."/></div>
                  <div className="fl"><label>Auth Domain</label><input value={fbForm.authDomain} onChange={e=>setFbForm(f=>({...f,authDomain:e.target.value}))} placeholder="project.firebaseapp.com"/></div>
                  <div className="fl"><label>Project ID</label><input value={fbForm.projectId} onChange={e=>setFbForm(f=>({...f,projectId:e.target.value}))} placeholder="my-project-id"/></div>
                  <div className="fl"><label>Storage Bucket</label><input value={fbForm.storageBucket} onChange={e=>setFbForm(f=>({...f,storageBucket:e.target.value}))} placeholder="project.appspot.com"/></div>
                  <div className="fl"><label>Messaging Sender ID</label><input value={fbForm.messagingSenderId} onChange={e=>setFbForm(f=>({...f,messagingSenderId:e.target.value}))} placeholder="123456789"/></div>
                  <div className="fl"><label>App ID</label><input value={fbForm.appId} onChange={e=>setFbForm(f=>({...f,appId:e.target.value}))} placeholder="1:123:web:abc..."/></div>
                </div>
                <div style={{marginTop:14,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                  <button className="btn btn-p" onClick={saveFbConfig}>💾 حفظ إعدادات Firebase</button>
                  {fbCfg?.projectId && <span style={{fontSize:'.8rem',color:'var(--ok)',fontWeight:700}}>✅ متصل بـ {fbCfg.projectId}</span>}
                </div>
                <div style={{marginTop:12,padding:'10px 14px',background:'var(--pr-l)',border:'1px solid var(--pr)',borderRadius:'var(--r2)',fontSize:'.8rem',color:'var(--pr)'}}>
                  🔒 تُحفظ هذه البيانات محلياً على جهازك فقط ولا تُرسل لأي طرف ثالث.
                </div>
              </div>
            </div>
          )}

          {/* Password Reset Info */}
          <div className="wg">
            <div className="wg-h">
              <h3>🔑 نسيت كلمة المرور؟</h3>
              <button className="btn btn-g btn-sm" onClick={()=>setShowResetPwInfo(v=>!v)}>{showResetPwInfo?'إخفاء':'عرض الحلول'}</button>
            </div>
            {showResetPwInfo && (
              <div className="wg-b">
                <p style={{fontSize:'.86rem',color:'var(--g5)',marginBottom:14}}>
                  النظام يعتمد على localStorage ولا توجد بريد إلكتروني لإعادة التعيين. إليك الحلول المتاحة:
                </p>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{border:'1px solid var(--border-color)',borderRadius:10,padding:14}}>
                    <div style={{fontWeight:800,marginBottom:4}}>✅ الحل الأسهل — المدير يعيد تعيين كلمة المرور</div>
                    <div style={{fontSize:'.84rem',color:'var(--g5)'}}>المدير يذهب إلى <b>الإعدادات → المستخدمون</b> ويضغط ✏️ على المستخدم المطلوب ويكتب كلمة مرور جديدة.</div>
                  </div>
                  <div style={{border:'1px solid var(--border-color)',borderRadius:10,padding:14}}>
                    <div style={{fontWeight:800,marginBottom:4}}>🔧 إذا نسي المدير نفسه كلمة المرور</div>
                    <ol style={{fontSize:'.84rem',color:'var(--g5)',margin:0,padding:'0 18px',lineHeight:1.9}}>
                      <li>افتح المتصفح وادخل للموقع</li>
                      <li>افتح <b>أدوات المطور (F12)</b></li>
                      <li>اذهب لتبويب <b>Application → Local Storage</b></li>
                      <li>ابحث عن المفتاح الذي يحتوي <code style={{background:'var(--g1)',padding:'1px 5px',borderRadius:4}}>_users</code></li>
                      <li>انسخ القيمة، عدّل كلمة المرور، واحفظ</li>
                    </ol>
                  </div>
                  {isManager && (
                    <div style={{border:'1px solid #fde68a',borderRadius:10,padding:14,background:'var(--warn-l)'}}>
                      <div style={{fontWeight:800,marginBottom:6,color:'var(--warn)'}}>⚡ إعادة تعيين سريعة للمستخدمين</div>
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        {lsGet('users').map(u=>(
                          <div key={u.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:'.84rem'}}>
                            <span style={{flex:1}}>{u.name} (@{u.username})</span>
                            <button className="btn btn-xs btn-g" onClick={()=>{
                              const np = window.prompt(`كلمة المرور الجديدة لـ ${u.name}:`);
                              if (!np) return;
                              lsUpd('users', u.id, { ...u, password: np });
                              toast('✅ تم تغيير كلمة المرور', 'ok');
                            }}>🔑 تغيير</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab==='about' && (
        <div className="wg"><div className="wg-h"><h3>ℹ️ عن النظام</h3></div><div className="wg-b">
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:'3rem',marginBottom:12}}>🏥</div>
            <h2 style={{fontSize:'1.2rem',fontWeight:900,marginBottom:6}}>نظام إدارة المركز المتكامل</h2>
            <p style={{color:'var(--g5)',fontSize:'.86rem',marginBottom:4}}>الإصدار v1</p>
            <p style={{color:'var(--g4)',fontSize:'.8rem',marginBottom:2}}>صمم بواسطة محمد فكري</p>
            <p style={{color:'var(--g4)',fontSize:'.78rem'}}><a href="mailto:mfekry225@outlook.com">mfekry225@outlook.com</a></p>
          </div>
        </div></div>
      )}
    </div>
  );
}
