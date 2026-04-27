import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Dashboard from '../pages/Dashboard';
import Calendar from '../pages/Calendar';
import AttendancePage from '../pages/Attendance/index';
import HRPage from '../pages/HR/index';
import StudentsPage from '../pages/Students/index';
import Programs from '../pages/Programs';
import Reports from '../pages/Reports';
import CenterPage from '../pages/Center/index';
import Settings from '../pages/Settings';

export default function AppRouter() {
  const { activeView, currentUser } = useApp();
  
  // مزامنة البيانات من Firebase عند الدخول
  useEffect(() => {
    if (!currentUser?.centerId) return;
    const centerId = currentUser.centerId;
    const keys = [
      'students','employees','sessions','appointments','iepGoals',
      'attStu','attEmp','income','expenses','salaries','leaves',
      'calEvents','centerActivities','parentInteractions','consultations',
      'evaluations','warnings','stuReports','behaviorPlans',
      'studentFees','payments','notifs','manualAlerts','users'
    ];
    import('../hooks/useStorage').then(({ syncFromFirebase }) => {
      syncFromFirebase(centerId, keys).catch(console.warn);
    });
  }, [currentUser?.centerId]);
  
  // Get user permissions
  const userPerms = JSON.parse(localStorage.getItem('userPerms')||'{}');
  
  // Permission guards
  const checkPerm = (key) => userPerms[key] !== false && (currentUser?.role === 'manager' || currentUser?.role === 'vice' || userPerms[key]);
  
  // Render blocked page
  const BlockedPage = ({page}) => (
    <div style={{padding:'60px 20px', textAlign:'center', color:'var(--err)'}}>
      <div style={{fontSize:'4rem',marginBottom:20}}>🔒</div>
      <h2 style={{margin:'0 0 10px 0'}}>لا تملك صلاحية للوصول لهذا القسم</h2>
      <p style={{color:'var(--g5)',fontSize:'.9rem'}}>تواصل مع المدير لطلب الصلاحيات المطلوبة</p>
    </div>
  );
  
  if (activeView === 'dash') return <Dashboard/>;
  if (activeView === 'calendar') return checkPerm('calendar') ? <Calendar/> : <BlockedPage page="التقويم"/>;
  if (activeView === 'attendance') return <AttendancePage/>;
  if (activeView === 'hr' || activeView.startsWith('hr-')) return checkPerm('hr') ? <HRPage/> : <BlockedPage page="الموظفون"/>;
  if (activeView === 'students' || activeView === 'sessions') return checkPerm('students') ? <StudentsPage/> : <BlockedPage page="الطلاب"/>;
  if (activeView === 'programs') return checkPerm('students') ? <Programs/> : <BlockedPage page="الأنشطة"/>;
  if (activeView === 'reports') return checkPerm('reports') ? <Reports/> : <BlockedPage page="التقارير"/>;
  if (activeView === 'center') return <CenterPage/>; // Has internal permission checks
  if (activeView === 'settings') return <Settings/>; // Manager only
  return <Dashboard/>;
}
