import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { createUser } from '../../firebase/db';

const PRESET_COLORS = ['#1a56db','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#0f172a'];

export default function SetupWizard() {
  const { currentUser, updateCenterData, setScreen, login, toast } = useApp();
  const [step, setStep] = useState(1);
  const [color, setColor] = useState('#1a56db');
  const [logo, setLogo] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const logoRef = useRef();

  // بيانات المركز
  const [cname, setCname] = useState('');
  const [ctype, setCtype] = useState('');
  const [cphone, setCphone] = useState('');

  // بيانات المدير (اختياري - لإنشاء حساب username/password للمدير أيضاً)
  const [mname, setMname] = useState(currentUser?.name || '');

  function handleLogo(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setLogo(ev.target.result);
    r.readAsDataURL(f);
  }

  async function finish() {
    if (!cname.trim()) { setErr('يرجى إدخال اسم المركز'); return; }
    setSaving(true);
    setErr('');
    
    try {
      const centerId = currentUser.uid;
      
      // حفظ إعدادات المركز في Firestore
      await updateDoc(doc(db, 'centers', centerId), {
        name: cname.trim(),
        type: ctype.trim(),
        phone: cphone.trim(),
        logo: logo,
        color: color,
        isSetup: true,
        managerName: mname || currentUser.name,
        updatedAt: serverTimestamp()
      });

      // حفظ الشعار في localStorage للاستخدام المحلي
      if (logo) localStorage.setItem('scs_center_logo', logo);

      const newCenter = {
        name: cname.trim(),
        type: ctype.trim(),
        phone: cphone.trim(),
        logo: logo,
        color: color,
        configured: true
      };

      updateCenterData(newCenter);
      toast('✅ تم إعداد المركز بنجاح!', 'ok');
      setScreen('app');
    } catch(e) {
      console.error(e);
      setErr('حدث خطأ في الحفظ. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{width:'100%', maxWidth:480, background:'var(--card)', borderRadius:20, padding:'32px 28px', boxShadow:'0 8px 40px rgba(0,0,0,0.12)'}}>
        
        {/* Header */}
        <div style={{textAlign:'center', marginBottom:28}}>
          <div style={{fontSize:'3rem', marginBottom:8}}>🏥</div>
          <h1 style={{margin:0, fontSize:'1.4rem', fontWeight:900}}>إعداد المركز</h1>
          {currentUser && (
            <p style={{margin:'8px 0 0', fontSize:'.85rem', color:'var(--g5)'}}>
              مرحباً {currentUser.name} — أكمل إعداد مركزك
            </p>
          )}
        </div>

        {err && (
          <div style={{padding:'10px 14px', background:'var(--err-l)', border:'1px solid var(--err)', borderRadius:8, color:'var(--err)', fontSize:'.85rem', marginBottom:16}}>
            ⚠️ {err}
          </div>
        )}

        {/* بيانات المركز */}
        <div className="fs" style={{marginBottom:20}}>
          <div className="fsh">🏥 بيانات المركز</div>
          <div className="fsb">
            <div className="fg">
              <div className="fl full">
                <label>اسم المركز <span className="req">*</span></label>
                <input value={cname} onChange={e=>setCname(e.target.value)} placeholder="مثال: مركز الأمل للتربية الخاصة"/>
              </div>
              <div className="fl full">
                <label>نوع المركز</label>
                <select value={ctype} onChange={e=>setCtype(e.target.value)}>
                  <option value="">اختر النوع</option>
                  <option value="تربية خاصة">تربية خاصة</option>
                  <option value="تأهيل">تأهيل</option>
                  <option value="تخاطب">تخاطب</option>
                  <option value="توحد">توحد</option>
                  <option value="تعلم">صعوبات تعلم</option>
                  <option value="متعدد">متعدد التخصصات</option>
                </select>
              </div>
              <div className="fl full">
                <label>رقم الهاتف</label>
                <input value={cphone} onChange={e=>setCphone(e.target.value)} placeholder="+966 5X XXX XXXX" type="tel"/>
              </div>
            </div>
          </div>
        </div>

        {/* الشعار */}
        <div className="fs" style={{marginBottom:20}}>
          <div className="fsh">🖼️ شعار المركز</div>
          <div className="fsb">
            <div style={{display:'flex', alignItems:'center', gap:16}}>
              {logo ? (
                <img src={logo} alt="logo" style={{width:64, height:64, borderRadius:12, objectFit:'cover', border:'2px solid var(--border-color)'}}/>
              ) : (
                <div style={{width:64, height:64, borderRadius:12, background:'var(--g1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem'}}>🏥</div>
              )}
              <div>
                <button className="btn btn-g" onClick={()=>logoRef.current?.click()}>📷 رفع شعار</button>
                {logo && <button className="btn btn-d" style={{marginRight:8}} onClick={()=>setLogo('')}>🗑️</button>}
                <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleLogo}/>
                <p style={{fontSize:'.72rem', color:'var(--g4)', margin:'6px 0 0'}}>PNG أو JPG — يظهر في التقارير والطباعة</p>
              </div>
            </div>
          </div>
        </div>

        {/* اللون */}
        <div className="fs" style={{marginBottom:28}}>
          <div className="fsh">🎨 لون المركز</div>
          <div className="fsb">
            <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={()=>setColor(c)} style={{
                  width:36, height:36, borderRadius:'50%', background:c, border:'none',
                  cursor:'pointer', outline: color===c ? `3px solid ${c}` : 'none',
                  outlineOffset: 2, transform: color===c ? 'scale(1.15)' : 'scale(1)',
                  transition:'transform 0.2s'
                }}/>
              ))}
            </div>
          </div>
        </div>

        {/* زر الحفظ */}
        <button
          className="login-btn"
          onClick={finish}
          disabled={saving}
          style={{background: color}}
        >
          {saving ? '⏳ جارٍ الحفظ...' : '✅ إنهاء الإعداد والبدء →'}
        </button>
      </div>
    </div>
  );
}
