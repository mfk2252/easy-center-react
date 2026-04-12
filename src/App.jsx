import { useApp } from './context/AppContext';
import SetupWizard from './components/layout/SetupWizard';
import LoginScreen from './components/layout/LoginScreen';
import Navbar from './components/layout/Navbar';
import GlobalSearch from './components/layout/GlobalSearch';
import Toast from './components/layout/Toast';
import AppRouter from './router/AppRouter';

export default function App() {
  const { screen, center } = useApp();

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

  if (screen === 'setup') return <SetupWizard/>;
  if (screen === 'login') return <LoginScreen/>;

  return (
    <>
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
    </>
  );
}
