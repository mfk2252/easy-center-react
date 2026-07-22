import { useState } from 'react';
import { useApp } from './context/AppContext';
import SetupWizard from './components/layout/SetupWizard';
import LoginScreen from './components/layout/LoginScreen';
import Navbar from './components/layout/Navbar';
import GlobalSearch from './components/layout/GlobalSearch';
import Toast from './components/layout/Toast';
import AppRouter from './router/AppRouter';
import InstallPWA from './components/ui/InstallPWA';
import SubscriptionScreen from './components/layout/SubscriptionScreen';
import TrialBanner from './components/layout/TrialBanner';

// قائمة الإيموجيات اللطيفة والمعبرة عن الأطفال والتربية الخاصة والتخاطب
const LOADING_EMOJIS = ['🧩', '🧸', '🎨', '📚', '🗣️', '👶', '🎈', '🎯', '✏️', '🧠', '🧑‍🏫', '👨‍🦽', '🍬'];

export default function App() {
  const { screen, center, subscriptionStatus } = useApp();

  // اختيار إيموجي عشوائي عند تحميل التطبيق ليثبت خلال هذه التحميلة فقط
  const [defaultEmoji] = useState(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_EMOJIS.length);
    return LOADING_EMOJIS[randomIndex];
  });

  if (screen === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh', 
        background: '#0f172a', 
        flexDirection: 'column', 
        gap: 16,
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        {center?.logo ? (
          <img 
            src={center.logo} 
            alt={center.name || "شعار المركز"} 
            style={{ 
              width: 'clamp(60px, 10vw, 90px)', // تم تقليل الحجم ليكون متناسقاً
              height: 'clamp(60px, 10vw, 90px)', 
              objectFit: 'contain', 
              marginBottom: '4px', 
              animation: 'pulse 2s infinite' 
            }}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
        ) : null}
        
        {/* إيموجي بحجم طبيعي ومريح للعين */}
        <div style={{ 
          fontSize: 'clamp(2.5rem, 8vw, 4rem)', // من 2.5rem إلى 4rem كحد أقصى بدلاً من 8rem
          display: center?.logo ? 'none' : 'block', 
          animation: 'bounce 1.5s infinite',
          lineHeight: 1,
          userSelect: 'none'
        }}>
          {defaultEmoji}
        </div>

        <div style={{ fontWeight: 600, fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', color: '#94a3b8', marginTop: 4 }}>
          جاري التحميل...
        </div>
        
        {/* شريط التحميل */}
        <div style={{ 
          width: 80, 
          height: 4, 
          background: 'var(--pr, #1a56db)', 
          borderRadius: 2, 
          position: 'relative',
          overflow: 'hidden',
          marginTop: 4
        }}>
          <div style={{
            position: 'absolute',
            height: '100%',
            width: '50%',
            background: '#ffffff',
            borderRadius: 2,
            animation: 'loading-bar 1.5s infinite ease-in-out'
          }} />
        </div>

        <style>{`
          @keyframes loading-bar {
            0% { left: -50%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: .6; transform: scale(0.95); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); } /* قفزة أخف تناسب الحجم المعتدل */
          }
        `}</style>
      </div>
    );
  }

  if (screen === 'login') return <LoginScreen/>;
  if (screen === 'setup') return <SetupWizard/>;

  // اشتراك منتهي
  if (screen === 'subscription' || (subscriptionStatus && !subscriptionStatus.allowed)) {
    return (
      <SubscriptionScreen
        reason={subscriptionStatus?.reason}
        daysLeft={subscriptionStatus?.daysLeft}
        message={subscriptionStatus?.message}
      />
    );
  }

  return (
    <>
      <TrialBanner/>

      <div className="print-brand" aria-hidden="true">
        {center.logo ? (
          <img src={center.logo} alt="" style={{ maxWidth: 40, maxHeight: 40 }} />
        ) : (
          <span style={{ fontSize: '1.25rem' }}>{defaultEmoji}</span>
        )}
        <span className="print-brand-name">{center.name || 'المركز'}</span>
      </div>
      <Navbar/>
      <div className="page">
        <AppRouter/>
      </div>
      <GlobalSearch/>
      <Toast/>
      <InstallPWA/>
    </>
  );
}
