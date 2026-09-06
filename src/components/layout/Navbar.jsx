import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LanguageContext';
import { canSeeTab } from '../../utils/permissions';
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
];

export default function Navbar() {
  const { center, currentUser, activeView, go, logout, toggleDark, darkMode, setSearchOpen } = useApp();
  const { t, toggleLang, lang } = useLang();
  const role = currentUser?.role || '';
  const isAdmin = isPlatformAdminEmail(currentUser?.email);
  const activeBtnRef = useRef(null);

  // دالة للتحقق من كون الزر هو النشط حالياً
  const isActive = (itemId) => {
    if (activeView === itemId) return true;
    if (itemId !== 'dash' && activeView.startsWith(`${itemId}-`)) return true;
    return false;
  };

  // التمرير السلس نحو التبويب النشط عند التبديل
  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeView]);

  return (
    <nav className="nav no-print">
      <div className="nav-inner">
        <div className="nav-brand" title={center.name || ''}>
          {center.logo
            ? <img src={center.logo} alt={center.name || ''} style={{ height: 36, borderRadius: 8, objectFit: 'cover' }}/>
            : <div className="nav-brand-ph">🏥</div>}
        </div>

        {NAV_ITEMS.filter(item => canSeeTab(role, item.id)).map(item => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              ref={active ? activeBtnRef : null}
              type="button"
              className={`nb ${active ? 'on' : ''}`}
              onClick={() => go(item.id)}
            >
              {item.icon} {t(item.key)}
            </button>
          );
        })}

        {isAdmin && (
          <button
            ref={activeView === 'admin' ? activeBtnRef : null}
            type="button"
            className={`nb ${activeView === 'admin' ? 'on' : ''}`}
            onClick={() => go('admin')}
            style={{ color: '#f59e0b' }}
            title={t('nav.admin') || 'لوحة الإدارة'}
          >
            👑 {t('nav.admin') || 'الإدارة العامة'}
          </button>
        )}

        <div className="spacer" />

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
          className="nav-icon-btn no-print"
          onClick={() => setSearchOpen(true)}
          title={t('search')}
        >
          🔍
        </button>

        {canSeeTab(role, 'settings') && (
          <button 
            ref={isActive('settings') ? activeBtnRef : null}
            type="button" 
            className={`nav-icon-btn no-print ${isActive('settings') ? 'on' : ''}`}
            onClick={() => go('settings')} 
            title={t('nav.settings')}
          >
            ⚙️
          </button>
        )}

        <button
          type="button"
          className="dark-toggle no-print"
          onClick={toggleDark}
          title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <button
          type="button"
          className="nav-logout no-print"
          onClick={logout}
          title={t('logout')}
        >
          {t('logout')}
        </button>
      </div>
    </nav>
  );
}
