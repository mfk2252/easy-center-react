import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const PRESET_COLORS = ['#1a56db','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#0f172a'];

export default function SetupWizard() {
  const { currentUser, updateCenterData, setScreen, toast } = useApp();
  const [cname, setCname] = useState('');
  const [ctype, setCtype] = useState('');
  const [cphone, setCphone] = useState('');
  const [logo, setLogo] = useState('');
  const [color, setColor] = useState('#1a56db');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const logoRef = useRef();

  function handleLogo(e) {
    const f = e.target.files?.[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => setLogo(ev.target.result);
    r.readAsDataURL(f);
  }

  async function finish() {
    if (!cname.trim()) { setErr('يرجى إدخال اسم المركز'); return; }
    setSaving(true); setErr('');
    try {
      const centerId = currentUser?.uid;
      if (!centerId) throw new Error('لم يتم التعرف على المستخدم');

      await updateDoc(doc(db, 'centers', centerId), {
        name: cname.trim(),
        type: ctype,
        phone: cphone,
        logo: logo,
        color: color,
        isSetup: true,
        updatedAt: serverTimestamp()
      });

      if (logo) localStorage.setItem('scs_center_logo', logo);

      updateCenterData({
        name: cname.trim(),
        type: ctype,
        phone: cphone,
        logo: logo,
        color: color,
        configured: true
      });

      toast('✅ تم إعداد المركز بنجاح!', 'ok');
      setScreen('app');
    } catch(e) {
      console.error(e);
      setErr('حدث خطأ في الحفظ: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:480,background:'var(--card)',borderRadius:20,padding:'32px 28px',boxShadow:'0 8px 40px rgba(0,0,0,0.12)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontSize:'3rem',marginBottom:8}}>🏥</div>
          <h1 style={{margin:0,fontSize:'1.4rem',fontWeight:900}}>إعداد المركز</h1>
          {currentUser && (
            <p style={{margin:'8px 0 0',fontSize:'.85rem',color:'var(--g5)'}}>
              مرحباً {currentUser.name} — أكمل إعداد مركزك
            </p>
          )}
        </div>

        {err && (
          <div style={{padding:'10px 14px',background:'var(--err-l)',border:'1px solid var(--err)',borderRadius:8,color:'var(--err)',fontSize:'.85rem',marginBottom:16}}>
            ⚠️ {err}
          </div>
        )}

        <div className="fg" style={{gap:14}}>
          <div className="fl full">
            <label>اسم المركز <span className="req">*</span></label>
            <input value={cname} onChange={e=>setCname(e.target.value)} placeholder="مثال: مركز الأمل للتربية الخاصة"/>
          </div>
          <div className="fl full">
            <label>نوع المركز</label>
            <select value={ctype} onChange={e=>setCtype(e.target.value)}>
              <option value="">اختر النوع</option>
              <option>تربية خاصة</option><option>تأهيل</option>
              <option>تخاطب</option><option>توحد</option>
              <option>صعوبات تعلم</option><option>متعدد التخصصات</option>
            </select>
          </div>
          <div className="fl full">
            <label>رقم الهاتف</label>
            <input value={cphone} onChange={e=>setCphone(e.target.value)} placeholder="+966 5X XXX XXXX" type="tel"/>
          </div>
        </div>

        {/* الشعار */}
        <div style={{marginTop:16,marginBottom:16}}>
          <label style={{fontWeight:700,display:'block',marginBottom:8}}>شعار المركز</label>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {logo
              ? <img src={logo} alt="logo" style={{width:56,height:56,borderRadius:10,objectFit:'cover'}}/>
              : <div style={{width:56,height:56,borderRadius:10,background:'var(--g1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem'}}>🏥</div>
            }
            <button className="btn btn-g" onClick={()=>logoRef.current?.click()}>📷 رفع شعار</button>
            {logo && <button className="btn btn-d" onClick={()=>setLogo('')}>🗑️</button>}
            <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleLogo}/>
          </div>
        </div>

        {/* اللون */}
        <div style={{marginBottom:24}}>
          <label style={{fontWeight:700,display:'block',marginBottom:8}}>لون المركز</label>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {PRESET_COLORS.map(c=>(
              <button key={c} onClick={()=>setColor(c)} style={{
                width:34,height:34,borderRadius:'50%',background:c,border:'none',cursor:'pointer',
                outline:color===c?`3px solid ${c}`:'none',outlineOffset:2,
                transform:color===c?'scale(1.15)':'scale(1)',transition:'transform 0.2s'
              }}/>
            ))}
          </div>
        </div>

        <button className="login-btn" onClick={finish} disabled={saving} style={{background:color}}>
          {saving ? '⏳ جارٍ الحفظ...' : '✅ إنهاء الإعداد والبدء →'}
        </button>
      </div>
    </div>
  );
}
