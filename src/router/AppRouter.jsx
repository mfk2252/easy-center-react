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
import { isPlatformAdminEmail, isCurrentPlatformOwner } from '../firebase/auth';
import { canDo } from '../utils/permissions';

function BlockedPage({ t, customTitle, customSub }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--err)', maxWidth: '600px', margin: '40px auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: 20 }}>🔒</div>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: 800 }}>{customTitle || t('blocked')}</h2>
      <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: 1.6 }}>{customSub || t('blockedSub')}</p>
    </div>
  );
}

export default function AppRouter() {
  const { activeView, currentUser } = useApp();
  const { t } = useLang();

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'vice';
  const isAdmin = isCurrentPlatformOwner(currentUser);

  const userPerms = (() => {
    try { return JSON.parse(localStorage.getItem('userPerms') || '{}'); }
    catch (e) { return {}; }
  })();

  const can = (key) => isManager || canDo(currentUser?.role, key) || userPerms[key] === true;

  if (activeView === 'finance' && !isManager) {
    return (
      <BlockedPage
        t={t}
        customTitle="غير مصرح لك بالدخول إلى هذا النظام"
        customSub="قسم المالية والحسابات مخصص حصرياً للمدير العام والإدارة المالية."
      />
    );
  }

  if (activeView === 'admin') {
    return isAdmin ? (
      <AdminSubscriptions currentUserEmail={currentUser?.email}/>
    ) : (
      <BlockedPage
        t={t}
        customTitle="صلاحية محصورة بمالك المنصة"
        customSub="لوحة الإدارة العامة والعروض التجريبية مخصصة حصرياً لمالك ومطور المنصة."
      />
    );
  }
  if (activeView === 'dash') return <Dashboard/>;
  if (activeView === 'calendar') return can('calendar') ? <Calendar/> : <BlockedPage t={t}/>;
  if (activeView === 'attendance') return <AttendancePage/>;
  if (activeView === 'hr' || activeView.startsWith('hr-')) return can('hr') ? <HRPage/> : <BlockedPage t={t}/>;
  if (activeView === 'students' || activeView === 'sessions') return can('students') ? <StudentsPage/> : <BlockedPage t={t}/>;
  if (activeView === 'programs') return can('students') ? <Programs/> : <BlockedPage t={t}/>;
  if (activeView === 'prog-reports') return can('students') ? <ProgramsReports/> : <BlockedPage t={t}/>;
  if (activeView === 'statistics' || activeView === 'reports') return can('reports') ? <Reports/> : <BlockedPage t={t}/>;
  if (activeView === 'center') return <CenterPage/>;
  if (activeView === 'settings') return <Settings/>;
  return <Dashboard/>;
}
