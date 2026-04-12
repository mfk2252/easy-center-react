import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet } from '../../hooks/useStorage';
import { CFG_KEY } from '../../utils/constants';

export default function LoginScreen() {
  const { center, login, toast } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [remember, setRemember] = useState('none');
  const [savedAccount, setSavedAccount] = useState(null);

  useEffect(() => {
    const sa = (() => { try { return JSON.parse(localStorage.getItem('scs_saved_login') || 'null'); } catch(e) { return null; } })();
    if (sa) { setSavedAccount(sa); if (sa.username) setUsername(sa.username); if (sa.password) setPassword(sa.password); }
  }, []);

  function getUsers() {
    // try localStorage users
    let users = lsGet('users');
    if (!users.length) {
      // fallback: try with projectId prefix directly
      try {
        const cfg = JSON.parse(localStorage.getItem(CFG_KEY) || '{}');
        const pid = cfg.center?.projectId || 'local';
        const raw = localStorage.getItem(pid + '_users');
        if (raw) users = JSON.parse(raw);
      } catch(e) {}
    }
    return users;
  }

  function doLogin() {
    setErr('');
    if (!username.trim()) { setErr('يرجى إدخال اسم المستخدم'); return; }
    if (!password) { setErr('يرجى إدخال كلمة المرور'); return; }
    const users = getUsers();
    const user = users.find(u => u.username === username.trim() && u.password === password);
    if (!user) { setErr('اسم المستخدم أو كلمة المرور غير صحيحة'); return; }
    // handle remember
    if (remember === 'both') localStorage.setItem('scs_saved_login', JSON.stringify({ username: user.username, password }));
    else if (remember === 'user') localStorage.setItem('scs_saved_login', JSON.stringify({ username: user.username }));
    else localStorage.removeItem('scs_saved_login');
    toast('✅ مرحباً ' + user.name, 'ok');
    login(user);
  }

  function clearSaved() { localStorage.removeItem('scs_saved_login'); setSavedAccount(null); setUsername(''); setPassword(''); }

  const bgImg = localStorage.getItem('scs_login_bg');

  return (
    <div
      className="login-overlay"
      style={
        bgImg
          ? {
              backgroundImage: `linear-gradient(120deg,rgba(12,25,41,.92),rgba(30,27,75,.88)),url(${bgImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      <div className="login-shell">
        <div className="login-hero">
          <span className="login-hero-badge">🎓 بيئة تعليمية وتربوية</span>
          <h1>نظام موحّد لإدارة المراكز التعليمية والتربية الخاصة</h1>
          <p>تسجيل دخول آمن إلى لوحة التحكم: الطلاب، الجلسات، الموارد البشرية، والتقارير في مكان واحد.</p>
          <div className="login-hero-dots" aria-hidden>
            <span className="login-hero-dot" /><span className="login-hero-dot" /><span className="login-hero-dot" />
          </div>
        </div>
        <div className="login-panel">
      <div className="login-box">
        <div className="login-hd">
          {center.logo
            ? <img src={center.logo} className="login-logo" alt="logo"/>
            : <div className="login-logo-ph">🏥</div>
          }
          <h2>{center.name || 'مركز التربية الخاصة'}</h2>
          <p>نظام إدارة المركز المتكامل</p>
        </div>
        <div className="login-body">
          {err && <div className="login-err">{err}</div>}

          {savedAccount && (
            <div style={{marginBottom:12,padding:'10px 13px',background:'var(--pr-l)',border:'1px solid var(--pr)',borderRadius:10}}>
              <div style={{fontSize:'.76rem',color:'var(--g5)',marginBottom:2}}>الحساب المحفوظ في هذا الجهاز 🔒</div>
              <div style={{fontSize:'.9rem',fontWeight:700,color:'var(--pr)'}}>{savedAccount.username}</div>
              <div style={{fontSize:'.72rem',color:'var(--g4)',marginTop:4,display:'flex',gap:8}}>
                <button onClick={doLogin} style={{background:'var(--pr)',color:'white',border:'none',padding:'5px 12px',borderRadius:6,cursor:'pointer',fontSize:'.78rem',fontFamily:'Tajawal,sans-serif'}}>⚡ دخول تلقائي</button>
                <button onClick={clearSaved} style={{background:'none',border:'1px solid var(--err)',color:'var(--err)',padding:'5px 10px',borderRadius:6,cursor:'pointer',fontSize:'.78rem',fontFamily:'Tajawal,sans-serif'}}>🗑️ نسيان الجهاز</button>
              </div>
            </div>
          )}

          <div className="lf">
            <label>اسم المستخدم</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="أدخل اسم المستخدم" autoComplete="username"/>
          </div>
          <div className="lf" style={{position:'relative'}}>
            <label>كلمة المرور</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type={showPass?'text':'password'} placeholder="••••••••" autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&doLogin()} style={{paddingLeft:40}}/>
            <button onClick={()=>setShowPass(p=>!p)} style={{position:'absolute',left:10,top:32,background:'none',border:'none',cursor:'pointer',fontSize:'1rem',color:'var(--g4)'}}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          <div style={{marginBottom:14,padding:12,background:'var(--g0)',borderRadius:10,border:'1px solid var(--g2)'}}>
            <div style={{fontSize:'.75rem',fontWeight:700,color:'var(--g6)',marginBottom:8}}>🔒 تذكّر بياناتي في هذا الجهاز</div>
            {[['none','لا تذكّر'],['user','تذكّر اسم المستخدم فقط'],['both','تذكّر اسم المستخدم وكلمة المرور']].map(([v,l])=>(
              <label key={v} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:'.82rem',marginBottom:4}}>
                <input type="radio" name="remember" value={v} checked={remember===v} onChange={()=>setRemember(v)} style={{accentColor:'var(--pr)'}}/> {l}
              </label>
            ))}
          </div>

          <button className="login-btn" onClick={doLogin}>دخول ←</button>
          <div className="login-footer" style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'center' }}>
            <span style={{color:'var(--g4)',fontSize:'.72rem'}}>نظام إدارة المركز المتكامل — v1</span>
            <span style={{color:'var(--g4)',fontSize:'.68rem'}}>صمم بواسطة محمد فكري</span>
            <a href="mailto:mfekry225@outlook.com" style={{color:'var(--pr)',fontSize:'.68rem'}}>mfekry225@outlook.com</a>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
