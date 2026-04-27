import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { signInWithGoogle, signInWithCredentials } from '../../firebase/auth';

export default function LoginScreen() {
  const { login, toast } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // تسجيل الدخول بـ Google (للمدير)
  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setErr('');
    try {
      const user = await signInWithGoogle();
      toast('✅ مرحباً ' + user.name, 'ok');
      login(user);
    } catch(e) {
      console.error(e);
      setErr('فشل تسجيل الدخول بـ Google. حاول مرة أخرى.');
    } finally {
      setGoogleLoading(false);
    }
  }

  // تسجيل الدخول بـ username/password (للموظفين)
  async function handleLogin() {
    setErr('');
    if (!username.trim()) { setErr('يرجى إدخال اسم المستخدم'); return; }
    if (!password) { setErr('يرجى إدخال كلمة المرور'); return; }
    setLoading(true);
    try {
      const user = await signInWithCredentials(username, password);
      const userPerms = user.permissions || {};
      localStorage.setItem('userPerms', JSON.stringify(userPerms));
      toast('✅ مرحباً ' + user.name, 'ok');
      login(user);
    } catch(e) {
      setErr(e.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  }

  const bgImg = localStorage.getItem('scs_login_bg');

  return (
    <div className="login-wrap" style={bgImg ? { backgroundImage:`url(${bgImg})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          {(() => { const logo = localStorage.getItem('scs_center_logo'); return logo ? <img src={logo} alt="logo" style={{height:64, borderRadius:12, marginBottom:4}} /> : <div style={{fontSize:'2.5rem', marginBottom:4}}>🏥</div>; })()}
        </div>

        <h1 className="login-title">نظام إدارة المركز</h1>
        <p className="login-sub">منصة إدارية متكاملة للمراكز التعليمية والتأهيلية</p>

        {/* Google Sign In - للمدير */}
        <div style={{marginBottom:20}}>
          <p style={{textAlign:'center', fontSize:'.8rem', color:'var(--g4)', marginBottom:10}}>
            🔑 للمديرين: سجّل دخولك بـ Google
          </p>
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            style={{
              width:'100%', padding:'12px 16px',
              background:'white', border:'1px solid #dadce0',
              borderRadius:10, cursor: googleLoading ? 'wait' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              gap:10, fontSize:'.9rem', fontFamily:'Tajawal,sans-serif',
              fontWeight:700, color:'#3c4043',
              boxShadow:'0 1px 4px rgba(0,0,0,0.12)',
              transition:'box-shadow 0.2s',
              opacity: googleLoading ? 0.7 : 1
            }}
          >
            {googleLoading ? (
              <span>⏳ جارٍ التحميل...</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                تسجيل الدخول بـ Google
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:20}}>
          <div style={{flex:1, height:1, background:'var(--g2)'}}/>
          <span style={{fontSize:'.75rem', color:'var(--g4)'}}>أو للموظفين وأولياء الأمور</span>
          <div style={{flex:1, height:1, background:'var(--g2)'}}/>
        </div>

        {/* Username/Password - للموظفين */}
        {err && <div className="login-err">⚠️ {err}</div>}

        <div className="fl" style={{marginBottom:12}}>
          <label>اسم المستخدم</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
            autoComplete="username"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div className="fl" style={{position:'relative', marginBottom:16}}>
          <label>كلمة المرور</label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{paddingLeft:40}}
          />
          <button
            type="button"
            onClick={() => setShowPass(s => !s)}
            style={{position:'absolute', left:10, bottom:8, background:'none', border:'none', cursor:'pointer', color:'var(--g4)', fontSize:'1rem'}}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '⏳ جارٍ الدخول...' : 'دخول ←'}
        </button>

        {/* Info */}
        <div style={{marginTop:20, padding:'12px', background:'var(--g0)', borderRadius:8, fontSize:'.75rem', color:'var(--g5)', textAlign:'center', lineHeight:1.8}}>
          <strong>للمدير:</strong> استخدم تسجيل الدخول بـ Google<br/>
          <strong>للموظفين:</strong> استخدم اسم المستخدم وكلمة المرور
        </div>
      </div>
    </div>
  );
}
