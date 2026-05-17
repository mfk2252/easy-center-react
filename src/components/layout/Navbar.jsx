import { useApp } from '../../context/AppContext';
import { canSeeTab } from '../../utils/permissions';
import { syncFromFirebase, getCenterId } from '../../hooks/useStorage';

const ADMIN_EMAIL = 'mfekry225@gmail.com';

const NAV_ITEMS = [
  { id:'dash',       label:'📊 الرئيسية' },
  { id:'calendar',   label:'🗓️ التقويم' },
  { id:'attendance', label:'📅 الحضور السريع' },
  { id:'hr',         label:'👥 الموظفون' },
  { id:'students',   label:'👦 الطلاب' },
  { id:'programs',   label:'🎯 الأنشطة' },
  { id:'reports',    label:'📊 التقارير' },
  { id:'center',     label:'🏢 إدارة المركز' },
  { id:'settings',   label:'⚙️ الإعدادات' },
];

const ALL_KEYS = [
  'students','employees','sessions','appointments','iepGoals',
  'attStu','attEmp','income','expenses','salaries','leaves',
  'calEvents','centerActivities','parentInteractions','consultations',
  'evaluations','warnings','stuReports','behaviorPlans',
  'studentFees','payments','notifs','manualAlerts','users'
];

export default function Navbar() {
  const { center, currentUser, activeView, go, logout, toggleDark, darkMode, setSearchOpen } = useApp();
  const role = currentUser?.role || '';
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  async function handleSync() {
    const centerId = currentUser?.centerId || getCenterId();
    if (!centerId) return;
    try {
      await syncFromFirebase(centerId, ALL_KEYS);
      window.location.reload();
    } catch(e) {}
  }

  return (
    <nav className="nav no-print">
      {/* Brand */}
      <div className="nav-brand" title={center.name || 'المركز'}>
        {center.logo
          ? <img src={center.logo} alt="" style={{height:36,borderRadius:8,objectFit:'cover'}}/>
          : <div className="nav-brand-ph">🏥</div>
        }
      </div>

      {/* Nav Items */}
      {NAV_ITEMS.filter(item => canSeeTab(role, item.id)).map(item => (
        <button
          key={item.id}
          className={`nb ${activeView===item.id || (item.id!=='dash' && activeView.startsWith(item.id)) ? 'on' : ''}`}
          onClick={() => go(item.id)}
        >
          {item.label}
        </button>
      ))}

      {/* Admin button - للمطور فقط */}
      {isAdmin && (
        <button
          className={`nb ${activeView==='admin'?'on':''}`}
          onClick={() => go('admin')}
          style={{color:'#f59e0b'}}
          title="لوحة إدارة الاشتراكات"
        >
          👑 المشتركون
        </button>
      )}

      <div className="spacer"/>

      {/* Sync */}
      <button
        className="nav-sync no-print"
        title="مزامنة البيانات"
        onClick={handleSync}
        style={{cursor:'pointer',background:'none',border:'none',padding:'4px 8px',borderRadius:6,fontSize:'.8rem',color:'var(--g5)'}}
      >
        ☁️ متزامن
      </button>

      {/* Search */}
      <button className="nav-icon-btn no-print" onClick={() => setSearchOpen(true)} title="بحث (Ctrl+K)">🔍</button>

      {/* Dark mode */}
      <button className="dark-toggle no-print" onClick={toggleDark}>
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Logout */}
      <button className="nav-logout no-print" onClick={logout}>خروج</button>
    </nav>
  );
}
