import { useApp } from './context/AppContext';
import SetupWizard from './components/layout/SetupWizard';
import LoginScreen from './components/layout/LoginScreen';
import Navbar from './components/layout/Navbar';
import GlobalSearch from './components/layout/GlobalSearch';
import Toast from './components/layout/Toast';
import AppRouter from './router/AppRouter';

export default function App() {
  const { screen } = useApp();

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
      <Navbar/>
      <div className="page">
        <AppRouter/>
      </div>
      <GlobalSearch/>
      <Toast/>
    </>
  );
}
