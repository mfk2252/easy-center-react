import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLang, getWelcomeMessage } from '../../context/LanguageContext';
import {
  signInWithGoogle, signInWithEmailPassword, signInStaffOrParent,
  signUpManagerWithEmailPassword,
} from '../../firebase/auth';

const FEATURES = [
  { icon: '🔒', text: 'بيانات كل مركز معزولة بالكامل عن باقي المراكز' },
  { icon: '👨‍👩‍👧', text: 'حسابات مخصصة لكل موظف وولي أمر بصلاحيات منفصلة' },
  { icon: '⏱️', text: 'جرّب مجاناً 5 أيام كاملة، دون بطاقة ائتمان' },
];

export default function LoginScreen() {
  const { login, toast } = useApp();
  const { t } = useLang();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [identifier, setIdentifier] = useState(''); // بريد أو اسم مستخدم (دخول) / بريد فقط (تسجيل)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function switchMode(next) {
    setMode(next);
    setErr('');
    setPassword('');
    setConfirmPassword('');
  }

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
    if (!identifier.trim()) { setErr(t('loginErrUser')); return; }
    if (!password) { setErr(t('loginErrPass')); return; }
    setLoading(true);
    try {
      const isEmailFormat = identifier.includes('@');
      const user = isEmailFormat
        ? await signInWithEmailPassword(identifier, password)
        : await signInStaffOrParent(identifier, password);

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

  async function handleSignup() {
    setErr('');
    if (!identifier.trim() || !identifier.includes('@')) { setErr('أدخل بريداً إلكترونياً صحيحاً'); return; }
    if (!password || password.length < 6) { setErr('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    if (password !== confirmPassword) { setErr('كلمتا المرور غير متطابقتين'); return; }
    setLoading(true);
    try {
      const user = await signUpManagerWithEmailPassword(identifier, password);
      toast('✅ تم إنشاء حسابك! لنكمل إعداد مركزك', 'ok');
      login(user);
    } catch (e) {
      setErr(e.message || 'تعذّر إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (mode === 'login') handleLogin();
    else handleSignup();
  }

  return (
    <div className="login-overlay">
      <div className="login-shell">
        {/* اللوحة الجانبية — الهوية والقيمة */}
        <div className="login-hero">
          <div className="login-orbit" aria-hidden="true">
            <span/><span/><span/><span/>
          </div>

          <div className="login-hero-badge">🏥 منصة إدارة مراكز التأهيل</div>
          <h1>مركزك، طلابك، وفريقك — في مكان واحد وآمن</h1>
          <p>نظام متكامل لإدارة الطلاب والموظفين والجلسات والحضور، مبني خصيصاً لمراكز التربية الخاصة والتأهيل.</p>

          <div className="login-hero-features">
            {FEATURES.map(f => (
              <div key={f.text} className="login-hero-feature">
                <span className="lf-ico">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* لوحة النموذج */}
        <div className="login-panel">
          <div className="login-box">
            <div className="login-hd">
              <div style={{ fontSize: '2.2rem', marginBottom: 6 }}>🏥</div>
              <h2>{t('appName')}</h2>
              <p>{t('appSub')}</p>
            </div>

            <div style={{ padding: '22px 0 0' }}>
              <div style={{ padding: '0 24px', marginBottom: 16 }}>
                <button
                  type="button"
                  className="login-google-btn"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading ? t('googleLoading') : (
                    <>
                      <svg width="19" height="19" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      {t('googleLogin')}
                      <span style={{ fontSize: '.72rem', fontWeight: 500, opacity: .6 }}>· للمدراء</span>
                    </>
                  )}
                </button>
              </div>

              <div className="login-divider">
                <span className="ln"/><span>أو عبر البريد / اسم المستخدم</span><span className="ln"/>
              </div>

              <div className="login-tabs">
                <button type="button" className={`login-tab ${mode === 'login' ? 'on' : ''}`} onClick={() => switchMode('login')}>
                  تسجيل الدخول
                </button>
                <button type="button" className={`login-tab ${mode === 'signup' ? 'on' : ''}`} onClick={() => switchMode('signup')}>
                  إنشاء مركز جديد
                </button>
              </div>

              <div className="login-body" style={{ paddingTop: 0 }}>
                {err && <div className="login-err">⚠️ {err}</div>}

                {mode === 'login' ? (
                  <>
                    <div className="lf">
                      <label>البريد الإلكتروني (للمدراء) أو اسم المستخدم (للموظفين)</label>
                      <input
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="you@example.com أو ahmed_reception"
                        autoComplete="username"
                        dir="ltr"
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      />
                    </div>
                    <div className="lf" style={{ position: 'relative' }}>
                      <label>{t('password')}</label>
                      <input
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        dir="ltr"
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        style={{ paddingLeft: 40 }}
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        style={{ position: 'absolute', left: 10, bottom: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--g4)', fontSize: '1rem' }}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="lf">
                      <label>البريد الإلكتروني</label>
                      <input
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        dir="ltr"
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      />
                    </div>
                    <div className="lf">
                      <label>كلمة المرور</label>
                      <input
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type={showPass ? 'text' : 'password'}
                        placeholder="6 أحرف على الأقل"
                        autoComplete="new-password"
                        dir="ltr"
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      />
                    </div>
                    <div className="lf">
                      <label>تأكيد كلمة المرور</label>
                      <input
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        type={showPass ? 'text' : 'password'}
                        placeholder="أعد كتابة كلمة المرور"
                        autoComplete="new-password"
                        dir="ltr"
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: 'var(--g5)', marginBottom: 12, cursor: 'pointer' }}>
                      <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)}/>
                      إظهار كلمة المرور
                    </label>
                  </>
                )}

                <button className="login-btn" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? t('loginLoading')
                    : mode === 'login' ? `${t('login')} ←` : 'إنشاء الحساب والبدء ←'}
                </button>

                <div className="login-footer">
                  {mode === 'login'
                    ? <>مركز جديد؟ <a href="#" onClick={e => { e.preventDefault(); switchMode('signup'); }}>أنشئ حساباً الآن</a></>
                    : <>لديك حساب بالفعل؟ <a href="#" onClick={e => { e.preventDefault(); switchMode('login'); }}>سجّل الدخول</a></>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
