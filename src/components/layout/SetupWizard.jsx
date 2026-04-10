import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';

const PRESET_COLORS = ['#1a56db','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#0f172a'];

export default function SetupWizard() {
  const { persistConfig, setScreen } = useApp();
  const [step, setStep] = useState(1);
  const [color, setColor] = useState('#1a56db');
  const [logo, setLogo] = useState('');
  const [err, setErr] = useState('');
  const logoRef = useRef();

  // Step 1 fields
  const [cname, setCname] = useState('');
  const [ctype, setCtype] = useState('');
  const [cphone, setCphone] = useState('');
  // Step 2 fields
  const [mname, setMname] = useState('');
  const [mtitle, setMtitle] = useState('مدير المركز');
  const [muser, setMuser] = useState('');
  const [mpass, setMpass] = useState('');
  const [mpass2, setMpass2] = useState('');
  // Step 3 Firebase
  const [fbApi, setFbApi] = useState('');
  const [fbAuth, setFbAuth] = useState('');
  const [fbPid, setFbPid] = useState('');
  const [fbBkt, setFbBkt] = useState('');
  const [fbMsid, setFbMsid] = useState('');
  const [fbAppid, setFbAppid] = useState('');

  function handleLogo(e) {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setLogo(ev.target.result);
    reader.readAsDataURL(f);
  }

  function next() {
    setErr('');
    if (step === 1) {
      if (!cname.trim()) { setErr('⚠️ يرجى إدخال اسم المركز'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!mname.trim()) { setErr('⚠️ يرجى إدخال اسم المدير'); return; }
      if (!muser.trim()) { setErr('⚠️ يرجى إدخال اسم المستخدم'); return; }
      if (mpass.length < 6) { setErr('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
      if (mpass !== mpass2) { setErr('⚠️ كلمة المرور وتأكيدها غير متطابقتين'); return; }
      setStep(3);
    }
  }

  function finish(local = false) {
    setErr('');
    const centerData = { name: cname.trim(), type: ctype, phone: cphone, color, logo, configured: true, projectId: fbPid || 'local' };
    const fbData = local ? {} : { apiKey: fbApi, authDomain: fbAuth, projectId: fbPid, storageBucket: fbBkt, messagingSenderId: fbMsid, appId: fbAppid };
    // Save manager account
    const users = [{ id: 'mgr-1', username: muser.trim(), password: mpass, name: mname.trim(), title: mtitle || 'مدير المركز', role: 'manager', empId: null }];
    try { localStorage.setItem((fbPid||'local')+'_users', JSON.stringify(users)); } catch(e) {}
    persistConfig(centerData, fbData);
    setScreen('login');
  }

  return (
    <div className="sw-overlay">
      <div className="sw-box">
        <div className="sw-hd">
          <div className="icon">🏥</div>
          <h1>إعداد مركزك الجديد</h1>
          <p>دقيقتان فقط لتهيئة نظام إدارة مركزك بالكامل</p>
        </div>
        <div className="sw-body">
          <div className="sw-steps">
            {[1,2,3].map(s => <div key={s} className={`sw-dot ${step===s?'on':''}`}/>)}
          </div>

          {step === 1 && (
            <>
              <div className="sw-sec">
                <div className="sw-sec-t">🏢 بيانات المركز</div>
                <div className="sw-g">
                  <div className="sw-f full" style={{flexDirection:'row',alignItems:'center',gap:14}}>
                    <div className="sw-logo-box" onClick={()=>logoRef.current.click()}>
                      {logo ? <img src={logo} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} alt="logo"/> : '📷'}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'.78rem',fontWeight:700,color:'var(--g6)',marginBottom:4}}>شعار المركز (اختياري)</div>
                      <button className="sw-btn sw-btn-s" type="button" onClick={()=>logoRef.current.click()}>📎 اختيار صورة</button>
                      {logo && <button className="sw-btn sw-btn-s" type="button" onClick={()=>setLogo('')} style={{marginRight:6}}>🗑️</button>}
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleLogo}/>
                  </div>
                  <div className="sw-f">
                    <label>اسم المركز <span style={{color:'var(--err)'}}>*</span></label>
                    <input value={cname} onChange={e=>setCname(e.target.value)} placeholder="مركز التربية الخاصة..." autoFocus/>
                  </div>
                  <div className="sw-f">
                    <label>نوع المركز</label>
                    <select value={ctype} onChange={e=>setCtype(e.target.value)}>
                      <option value="">-- اختر --</option>
                      <option>مركز تربية خاصة</option>
                      <option>مركز تخاطب ونطق</option>
                      <option>مركز علاج طبيعي</option>
                      <option>مركز تأهيل شامل</option>
                      <option>روضة دمج</option>
                      <option>أخرى</option>
                    </select>
                  </div>
                  <div className="sw-f">
                    <label>رقم التواصل</label>
                    <input value={cphone} onChange={e=>setCphone(e.target.value)} type="tel" placeholder="05xxxxxxxx"/>
                  </div>
                </div>
                <div className="sw-f" style={{marginTop:10}}>
                  <label>اللون الرئيسي للمركز</label>
                  <div className="sw-colors">
                    {PRESET_COLORS.map(c => (
                      <div key={c} className={`sw-chip ${color===c?'sel':''}`} style={{background:c}} onClick={()=>setColor(c)}/>
                    ))}
                    <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{width:30,height:30,borderRadius:'50%',border:'3px solid var(--g2)',cursor:'pointer',padding:0}}/>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="sw-sec">
              <div className="sw-sec-t">👑 حساب مدير المركز</div>
              <div className="sw-g">
                <div className="sw-f"><label>اسم المدير الكامل <span style={{color:'var(--err)'}}>*</span></label><input value={mname} onChange={e=>setMname(e.target.value)} placeholder="الاسم الكامل" autoFocus/></div>
                <div className="sw-f"><label>المسمى الوظيفي</label><input value={mtitle} onChange={e=>setMtitle(e.target.value)} placeholder="مدير المركز"/></div>
                <div className="sw-f"><label>اسم المستخدم <span style={{color:'var(--err)'}}>*</span></label><input value={muser} onChange={e=>setMuser(e.target.value)} placeholder="admin" autoComplete="off"/></div>
                <div className="sw-f"><label>كلمة المرور <span style={{color:'var(--err)'}}>*</span></label><input value={mpass} onChange={e=>setMpass(e.target.value)} type="password" placeholder="••••••••"/></div>
                <div className="sw-f"><label>تأكيد كلمة المرور <span style={{color:'var(--err)'}}>*</span></label><input value={mpass2} onChange={e=>setMpass2(e.target.value)} type="password" placeholder="••••••••"/></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <div className="sw-note">📋 <b>Firebase اختياري تماماً</b> — يمكنك التشغيل المحلي بدونه. إن أردت المزامنة السحابية، أدخل بيانات مشروعك.</div>
              <div className="sw-sec">
                <div className="sw-sec-t">🔥 إعدادات Firebase (اختياري)</div>
                <div className="sw-g">
                  <div className="sw-f full"><label>API Key</label><input value={fbApi} onChange={e=>setFbApi(e.target.value)} placeholder="AIzaSy..."/></div>
                  <div className="sw-f"><label>Auth Domain</label><input value={fbAuth} onChange={e=>setFbAuth(e.target.value)} placeholder="center.firebaseapp.com"/></div>
                  <div className="sw-f"><label>Project ID</label><input value={fbPid} onChange={e=>setFbPid(e.target.value)} placeholder="my-center-id"/></div>
                  <div className="sw-f"><label>Storage Bucket</label><input value={fbBkt} onChange={e=>setFbBkt(e.target.value)} placeholder="center.appspot.com"/></div>
                  <div className="sw-f"><label>Messaging Sender ID</label><input value={fbMsid} onChange={e=>setFbMsid(e.target.value)} placeholder="123456789"/></div>
                  <div className="sw-f full"><label>App ID</label><input value={fbAppid} onChange={e=>setFbAppid(e.target.value)} placeholder="1:123:web:abc..."/></div>
                </div>
              </div>
            </>
          )}

          {err && <div className="sw-err">{err}</div>}
        </div>

        <div className="sw-footer">
          {step > 1 && <button className="sw-btn sw-btn-s" onClick={()=>{ setErr(''); setStep(s=>s-1); }}>← رجوع</button>}
          {step === 3 && <button className="sw-btn sw-btn-g" onClick={()=>finish(true)}>💾 تشغيل محلياً بدون Firebase</button>}
          {step < 3
            ? <button className="sw-btn sw-btn-p" onClick={next}>التالي →</button>
            : <button className="sw-btn sw-btn-p" onClick={()=>finish(false)}>🚀 ابدأ الآن</button>
          }
        </div>
      </div>
    </div>
  );
}
