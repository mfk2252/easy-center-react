import { useApp } from '../../context/AppContext';
import { canSeeTab } from '../../utils/permissions';

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

export default function Navbar() {
  const { center, currentUser, activeView, go, logout, toggleDark, darkMode, setSearchOpen, fbReady } = useApp();
  const role = currentUser?.role || '';

  return (
    <nav className="nav no-print">
      {/* Brand */}
      <div className="nav-brand" title={center.name || 'المركز'}>
        {center.logo
          ? <img src={center.logo} alt="" style={{height:36,borderRadius:8,objectFit:'cover'}}/>
          : <div className="nav-brand-ph">🏥</div>
        }
      </div>

      {/* Nav buttons */}
      {NAV_ITEMS.filter(item => canSeeTab(role, item.id)).map(item => (
        <button
          key={item.id}
          className={`nb ${activeView === item.id || (item.id !== 'dash' && activeView.startsWith(item.id)) ? 'on' : ''}`}
          onClick={() => go(item.id)}
        >
          {item.label}
        </button>
      ))}

      <div className="spacer"/>

      {/* Firebase sync status */}
      <span className="nav-sync" title={fbReady ? 'متصل بـ Firebase' : 'وضع محلي'}>
        {fbReady ? '☁️ متزامن' : '💾 محلي'}
      </span>

      {/* Search */}
      <button className="nav-icon-btn no-print" onClick={() => setSearchOpen(true)} title="بحث شامل (Ctrl+K)">🔍</button>

      {/* Dark mode */}
      <button className="dark-toggle no-print" onClick={toggleDark} title="الوضع الليلي">
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Logout */}
      <button className="nav-logout no-print" onClick={logout}>خروج</button>
    </nav>
  );
}
