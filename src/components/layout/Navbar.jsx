import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LanguageContext';
import { canSeeTab } from '../../utils/permissions';
import { syncFromFirebase, getCenterId } from '../../hooks/useStorage';
import { isPlatformAdminEmail } from '../../firebase/auth';
import NotificationsDropdown from './NotificationsDropdown';

const NAV_ITEMS = [
  { id: 'dash', key: 'nav.dash', icon: '📊' },
  { id: 'calendar', key: 'nav.calendar', icon: '🗓️' },
  { id: 'attendance', key: 'nav.attendance', icon: '📅' },
  { id: 'hr', key: 'nav.hr', icon: '👥' },
  { id: 'students', key: 'nav.students', icon: '👦' },
  { id: 'prog-reports', key: 'nav.progReports', icon: '📚' },
  { id: 'statistics', key: 'nav.statistics', icon: '📈' },
  { id: 'center', key: 'nav.center', icon: '🏢' },
  { id: 'settings', key: 'nav.settings', icon: '⚙️' },
];

const ALL_KEYS = [
  'students', 'employees', 'sessions', 'appointments', 'iepGoals',
  'attStu', 'attEmp', 'income', 'expenses', 'salaries', 'leaves',
  'calEvents', 'centerActivities', 'parentInteractions', 'consultations',
  'evaluations', 'warnings', 'stuReports', 'behaviorPlans',
  'studentFees', 'payments', 'notifs', 'manualAlerts', 'users',
];

export default function Navbar() {
  const { center, currentUser, activeView, go, logout, toggleDark, darkMode, setSearchOpen } = useApp();
  const { t, toggleLang, lang } = useLang();
  const role = currentUser?.role || '';
  const isAdmin = isPlatformAdminEmail(currentUser?.email);

  async function handleSync() {
    const centerId = currentUser?.centerId || getCenterId();
    if (!centerId) return;
    
    try {
      await syncFromFirebase(centerId, ALL_KEYS);
      window.location.reload();
    } catch (e) {
      console.error("خطأ أثناء المزامنة:", e);
      alert(t('syncError') || 'حدث خطأ أثناء مزامنة البيانات، يرجى التحقق من الاتصال.');
    }
  }

  // دالة للتحقق من كون الزر هو النشط حالياً
  const isActive = (itemId) => {
    if (activeView === itemId) return true;
    if (itemId !== 'dash' && activeView.startsWith(`${itemId}-`)) return true;
    return false;
  };

  return (
    <nav className="nav no-print">
      <div className="nav-brand" title={center.name || ''}>
        {center.logo
          ? <img src={center.logo} alt={center.name || ''} style={{ height: 36, borderRadius: 8, objectFit: 'cover' }}/>
          : <div className="nav-brand-ph">🏥</div>}
      </div>

      {NAV_ITEMS.filter(item => canSeeTab(role, item.id)).map(item => (
        <button
          key={item.id}
          type="button"
          className={`nb ${isActive(item.id) ? 'on' : ''}`}
          onClick={() => go(item.id)}
        >
          {item.icon} {t(item.key)}
        </button>
      ))}

      {isAdmin && (
        <button
          type="button"
          className={`nb ${activeView === 'admin' ? 'on' : ''}`}
          onClick={() => go('admin')}
          style={{ color: '#f59e0b' }}
          title={t('nav.admin') || 'لوحة الإدارة'}
        >
          👑 {t('nav.admin') || 'الإدارة العامة'}
        </button>
      )}

      <div className="spacer"/>

      <NotificationsDropdown />

      <button
        type="button"
        className="nav-lang-btn no-print"
        onClick={toggleLang}
        title={t('langSwitch')}
      >
        {lang === 'ar' ? 'EN' : 'ع'}
      </button>

      <button
        type="button"
        className="nav-sync no-print"
        title={t('sync')}
        onClick={handleSync}
        style={{ cursor: 'pointer', background: 'none', border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: '.8rem', color: 'var(--g5)' }}
      >
        ☁️ {t('sync')}
      </button>

      <button type="button" className="nav-icon-btn no-print" onClick={() => setSearchOpen(true)} title={t('search')}>🔍</button>
      <button type="button" className="dark-toggle no-print" onClick={toggleDark}>{darkMode ? '☀️' : '🌙'}</button>
      <button type="button" className="nav-logout no-print" onClick={logout}>{t('logout')}</button>
    </nav>
  );
}
