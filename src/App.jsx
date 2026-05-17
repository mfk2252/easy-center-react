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

export default function App() {
  const { screen, center, subscriptionStatus } = useApp();

  if (screen === 'loading') {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--g9)' }}>
        <div style={{ textAlign:'center', color:'white' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>🏥</div>
          <div style={{ fontWeight:700, fontSize:'1rem' }}>جاري التحميل...</div>
        </div>
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
      {/* شريط التجربة */}
      <TrialBanner/>

      <div className="print-brand" aria-hidden="true">
        {center.logo ? <img src={center.logo} alt="" /> : <span style={{ fontSize: '1.75rem' }}>🏥</span>}
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
