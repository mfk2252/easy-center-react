import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLang, getWelcomeMessage } from '../../context/LanguageContext';
import { signInWithGoogle, signInWithCredentials, signInWithEmailPassword } from '../../firebase/auth';

export default function LoginScreen() {
  const { login, toast } = useApp();
  const { t } = useLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setErr('');
    try {
      const user = await signInWithGoogle();
      login(user);
    } catch (e) {
      console.error(e);
      setErr(t('googleErr'));
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleLogin() {
    setErr('');
    if (!username.trim()) { setErr(t('loginErrUser')); return; }
    if (!password) { setErr(t('loginErrPass')); return; }
    setLoading(true);
    try {
      // إن كان الإدخال يشبه بريداً إلكترونياً، نحاول الدخول عبر Firebase Email/Password
      // (مخصص لمالك المنصة). غير ذلك، نتبع مسار الموظفين المعتاد عبر Firestore.
      const isEmailFormat = username.includes('@');
      const user = isEmailFormat
        ? await signInWithEmailPassword(username, password)
        : await signInWithCredentials(username, password);

      localStorage.setItem('userPerms', JSON.stringify(user.permissions || {}));
      const lang = localStorage.getItem('scs_lang') || 'ar';
      if (!user._skipWelcome) {
        toast('✅ ' + getWelcomeMessage(user.name, user.centerId, lang), 'ok');
      }
      login(user);
    } catch (e) {
      setErr(e.message || (localStorage.getItem('scs_lang') === 'en' ? 'Invalid credentials' : 'بيانات الدخول غير صحيحة'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>🏥</div>
        </div>

        <h1 className="login-title">{t('appName')}</h1>
        <p className="login-sub">{t('appSub')}</p>

        <div style={{ marginBottom: 20 }}>
          <p style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--g4)', marginBottom: 10 }}>
            {t('googleManager')}
          </p>
          <button onClick={handleGoogleSignIn} disabled={googleLoading} style={{
            width: '100%', padding: '12px 16px', background: 'white',
            border: '1px solid #dadce0', borderRadius: 10,
            cursor: googleLoading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, fontSize: '.9rem', fontFamily: 'Tajawal,sans-serif',
            fontWeight: 700, color: '#3c4043',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            opacity: googleLoading ? 0.7 : 1,
          }}>
            {googleLoading ? t('googleLoading') : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                {t('googleLogin')}
              </>
            )}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--g2)' }}/>
          <span style={{ fontSize: '.75rem', color: 'var(--g4)' }}>{t('orStaff')}</span>
          <div style={{ flex: 1, height: 1, background: 'var(--g2)' }}/>
        </div>

        {err && <div className="login-err">⚠️ {err}</div>}

        <div className="fl" style={{ marginBottom: 12 }}>
          <label>{t('username')}</label>
          <input value={username} onChange={e => setUsername(e.target.value)}
            placeholder={t('enterUsername')} autoComplete="username"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
        </div>

        <div className="fl" style={{ position: 'relative', marginBottom: 16 }}>
          <label>{t('password')}</label>
          <input value={password} onChange={e => setPassword(e.target.value)}
            type={showPass ? 'text' : 'password'} placeholder="••••••••"
            autoComplete="current-password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ paddingLeft: 40 }}/>
          <button type="button" onClick={() => setShowPass(s => !s)}
            style={{ position: 'absolute', left: 10, bottom: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--g4)', fontSize: '1rem' }}>
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? t('loginLoading') : `${t('login')} ←`}
        </button>
      </div>
    </div>
  );
}
