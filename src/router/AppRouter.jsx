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
  const { activeView } = useApp();
  if (activeView === 'dash') return <Dashboard/>;
  if (activeView === 'calendar') return <Calendar/>;
  if (activeView === 'attendance') return <AttendancePage/>;
  if (activeView === 'hr' || activeView.startsWith('hr-')) return <HRPage/>;
  if (activeView === 'students' || activeView === 'sessions') return <StudentsPage/>;
  if (activeView === 'programs') return <Programs/>;
  if (activeView === 'reports') return <Reports/>;
  if (activeView === 'center') return <CenterPage/>;
  if (activeView === 'settings') return <Settings/>;
  return <Dashboard/>;
}
