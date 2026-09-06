import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // تحقق إذا كان التطبيق مثبتاً
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // استقبال حدث التثبيت
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      // أظهر البانر بعد 3 ثوانٍ
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // iOS - لا يدعم beforeinstallprompt
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setInstallPrompt(null);
    }
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isInstalled || !showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 40px)',
      maxWidth: 400,
      background: 'var(--card)',
      border: '1px solid var(--border-color)',
      borderRadius: 16,
      padding: '16px 20px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }}>
      <div style={{fontSize: '2rem'}}>📱</div>
      <div style={{flex: 1}}>
        <div style={{fontWeight: 700, fontSize: '.9rem', marginBottom: 4}}>
          تثبيت التطبيق على جهازك أو هاتفك!
        </div>
        {isIOS ? (
          <div style={{fontSize: '.75rem', color: 'var(--g5)', lineHeight: 1.6}}>
            اضغط على <strong>□ مشاركة</strong> ثم <strong>"إضافة إلى الشاشة الرئيسية"</strong>
          </div>
        ) : (
          <div style={{fontSize: '.75rem', color: 'var(--g5)'}}>
            تجربة تطبيق سريع ومستقل على الكمبيوتر والجوال
          </div>
        )}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {!isIOS && (
          <button
            onClick={handleInstall}
            style={{
              background: 'var(--pr)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              cursor: 'pointer',
              fontSize: '.8rem',
              fontFamily: 'Tajawal, sans-serif',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            📲 تثبيت
          </button>
        )}
        <button
          onClick={() => setShowBanner(false)}
          style={{
            background: 'none',
            border: '1px solid var(--g3)',
            borderRadius: 8,
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '.75rem',
            color: 'var(--g5)',
            fontFamily: 'Tajawal, sans-serif'
          }}
        >
          لاحقاً
        </button>
      </div>
    </div>
  );
}
