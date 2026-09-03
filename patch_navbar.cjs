const fs = require('fs');
const path = 'src/components/layout/Navbar.jsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `const NAV_ITEMS = [
  { id: 'dash', key: 'nav.dash', icon: '📊' },
  { id: 'calendar', key: 'nav.calendar', icon: '🗓️' },
  { id: 'attendance', key: 'nav.attendance', icon: '📅' },
  { id: 'hr', key: 'nav.hr', icon: '👥' },
  { id: 'students', key: 'nav.students', icon: '👦' },
  { id: 'prog-reports', key: 'nav.progReports', icon: '📚' },
  { id: 'statistics', key: 'nav.statistics', icon: '📈' },
  { id: 'center', key: 'nav.center', icon: '🏢' },
  { id: 'settings', key: 'nav.settings', icon: '⚙️' },
];`;

const replacer = `const NAV_ITEMS = [
  { id: 'dash', key: 'nav.dash', icon: '📊' },
  { id: 'calendar', key: 'nav.calendar', icon: '🗓️' },
  { id: 'attendance', key: 'nav.attendance', icon: '📅' },
  { id: 'hr', key: 'nav.hr', icon: '👥' },
  { id: 'students', key: 'nav.students', icon: '👦' },
  { id: 'prog-reports', key: 'nav.progReports', icon: '📚' },
  { id: 'statistics', key: 'nav.statistics', icon: '📈' },
  { id: 'center', key: 'nav.center', icon: '🏢' },
];`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacer);
} else {
  console.log("NAV_ITEMS block not found as expected. Trying regex...");
  code = code.replace(/\s*\{\s*id:\s*'settings',\s*key:\s*'nav.settings',\s*icon:\s*'⚙️'\s*\},?/g, '');
}

const targetJsx = `<button type="button" className="nav-icon-btn no-print" onClick={() => setSearchOpen(true)} title={t('search')}>🔍</button>
      <button type="button" className="dark-toggle no-print" onClick={toggleDark}>{darkMode ? '☀️' : '🌙'}</button>`;

const replaceJsx = `<button type="button" className="nav-icon-btn no-print" onClick={() => setSearchOpen(true)} title={t('search')}>🔍</button>
      {canSeeTab(role, 'settings') && (
        <button 
          type="button" 
          className={\`nav-icon-btn no-print \${isActive('settings') ? 'on' : ''}\`}
          onClick={() => go('settings')} 
          title={t('nav.settings')}
        >
          ⚙️
        </button>
      )}
      <button type="button" className="dark-toggle no-print" onClick={toggleDark}>{darkMode ? '☀️' : '🌙'}</button>`;

if (code.includes(targetJsx)) {
  code = code.replace(targetJsx, replaceJsx);
  fs.writeFileSync(path, code);
  console.log("Navbar patched!");
} else {
  console.log("target JSX not found");
}
