import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import Dashboard from '../pages/Dashboard';
import Calendar from '../pages/Calendar';
import AttendancePage from '../pages/Attendance/index';
import HRPage from '../pages/HR/index';
import StudentsPage from '../pages/Students/index';
import Programs from '../pages/Programs';
import Reports from '../pages/Reports';
import ProgramsReports from '../pages/ProgramsReports';
import CenterPage from '../pages/Center/index';
import Settings from '../pages/Settings';
import AdminSubscriptions from '../pages/AdminSubscriptions';
import { isPlatformAdminEmail } from '../firebase/auth';

export default function AppRouter() {
  const { activeView, currentUser } = useApp();
  const { t } = useLang();

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'vice';
  const isAdmin = isPlatformAdminEmail(currentUser?.email);

  const userPerms = (() => {
    try { return JSON.parse(localStorage.getItem('userPerms') || '{}'); }
    catch (e) { return {}; }
  })();

  const can = (key) => isManager || userPerms[key] === true;

  const BlockedPage = () => (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--err)' }}>
      <div style={{ fontSize: '4rem', marginBottom: 20 }}>🔒</div>
      <h2 style={{ margin: '0 0 10px 0' }}>{t('blocked')}</h2>
      <p style={{ color: 'var(--g5)', fontSize: '.9rem' }}>{t('blockedSub')}</p>
    </div>
  );

  if (activeView === 'admin' && isAdmin) return <AdminSubscriptions currentUserEmail={currentUser?.email}/>;
  if (activeView === 'dash') return <Dashboard/>;
  if (activeView === 'calendar') return can('calendar') ? <Calendar/> : <BlockedPage/>;
  if (activeView === 'attendance') return <AttendancePage/>;
  if (activeView === 'hr' || activeView.startsWith('hr-')) return can('hr') ? <HRPage/> : <BlockedPage/>;
  if (activeView === 'students' || activeView === 'sessions') return can('students') ? <StudentsPage/> : <BlockedPage/>;
  if (activeView === 'programs') return can('students') ? <Programs/> : <BlockedPage/>;
  if (activeView === 'prog-reports') return can('students') ? <ProgramsReports/> : <BlockedPage/>;
  if (activeView === 'statistics' || activeView === 'reports') return can('reports') ? <Reports/> : <BlockedPage/>;
  if (activeView === 'center') return <CenterPage/>;
  if (activeView === 'settings') return <Settings/>;
  return <Dashboard/>;
}
