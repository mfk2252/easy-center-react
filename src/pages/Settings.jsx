import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../hooks/useStorage';
import { uid } from '../utils/dateHelpers';
import { ROLES } from '../utils/constants';

const PRESET_COLORS=['#1a56db','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#0f172a'];
const ROLE_OPTIONS=[['manager','مدير'],['vice','نائب المدير'],['specialist_speech','أخصائي تخاطب'],['specialist_physio','أخصائي علاج فيزيائي'],['specialist_behavior','أخصائي تعديل سلوك'],['specialist_occupational','أخصائي علاج وظيفي'],['specialist','أخصائي عام'],['reception','استقبال'],['admin','إداري'],['technician','فني النظام'],['parent','ولي أمر']];

export default function Settings() {
  const { center, currentUser, persistConfig, fbCfg, resetCenter, updateCenterColor, toast } = useApp();
  const [tab, setTab] = useState('center');
  const [users, setUsers] = useState(()=>lsGet('users'));
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [userForm, setUserForm] = useState({ username:'', password:'', name:'', role:'specialist', title:'', empId:'' });
  const [centerForm, setCenterForm] = useState({ name:center.name||'', type:center.type||'', phone:center.phone||'', logo:center.logo||'' });
  const [selColor, setSelColor] = useState(center.color||'#1a56db');

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
    if (editUserId) { lsUpd('users',editUserId,{...userForm}); toast('✅ تم التحديث','ok'); }
    else { lsAdd('users',{...userForm,id:uid()}); toast('✅ تم إضافة المستخدم','ok'); }
    setShowUserForm(false); reloadUsers();
  }

  function delUser(id) {
    if (id === currentUser?.id) { toast('⚠️ لا يمكنك حذف حسابك الحالي','er'); return; }
    if (!window.confirm('حذف هذا المستخدم؟')) return;
    lsDel('users',id); reloadUsers(); toast('🗑️ تم الحذف','ok');
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
              <div className="mb" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{editUserId?'✏️ تعديل المستخدم':'➕ مستخدم جديد'}</h2></div>
                <div style={{padding:'18px 20px'}}>
                  <div className="fg c2">
                    <div className="fl"><label>الاسم الكامل <span className="req">*</span></label><input value={userForm.name} onChange={fldU('name')}/></div>
                    <div className="fl"><label>المسمى الوظيفي</label><input value={userForm.title} onChange={fldU('title')}/></div>
                    <div className="fl"><label>اسم المستخدم <span className="req">*</span></label><input value={userForm.username} onChange={fldU('username')} autoComplete="off"/></div>
                    <div className="fl"><label>كلمة المرور {!editUserId&&<span className="req">*</span>}</label><input type="password" value={userForm.password} onChange={fldU('password')} placeholder={editUserId?'اتركها فارغة للإبقاء':'••••••••'}/></div>
                    <div className="fl full"><label>الدور / الصلاحية</label>
                      <select value={userForm.role} onChange={fldU('role')}>
                        {ROLE_OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                      </select>
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
        <div className="wg"><div className="wg-h"><h3>💾 النسخ الاحتياطي</h3></div><div className="wg-b">
          <p style={{fontSize:'.86rem',color:'var(--g5)',marginBottom:16}}>تصدير واستيراد بيانات المركز. يُنصح بأخذ نسخة احتياطية أسبوعياً.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <button className="btn btn-p" onClick={exportData}>📥 تصدير البيانات (JSON)</button>
            <label className="btn btn-s" style={{cursor:'pointer'}}>
              📤 استيراد بيانات
              <input type="file" accept=".json" style={{display:'none'}} onChange={importData}/>
            </label>
          </div>
          <div style={{marginTop:16,padding:'12px 16px',background:'var(--warn-l)',border:'1px solid #fde68a',borderRadius:'var(--r2)',fontSize:'.82rem',color:'var(--warn)'}}>
            ⚠️ الاستيراد سيستبدل البيانات الحالية — تأكد من أخذ نسخة احتياطية أولاً.
          </div>
        </div></div>
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
