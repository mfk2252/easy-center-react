const fs = require('fs');
const path = 'src/components/layout/Navbar.jsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `      <div className="nav-brand" title={center.name || ''}>
        {center.logo
          ? <img src={center.logo} alt={center.name || ''} style={{ height: 36, borderRadius: 8, objectFit: 'cover' }}/>
          : <div className="nav-brand-ph">🏥</div>}
      </div>
      {NAV_ITEMS.filter(item => canSeeTab(role, item.id)).map(item => (
        <button
          key={item.id}
          type="button"
          className={\`nb \${isActive(item.id) ? 'on' : ''}\`}
          onClick={() => go(item.id)}
        >
          {item.icon} {t(item.key)}
        </button>
      ))}
      {isAdmin && (
        <button
          type="button"
          className={\`nb \${activeView === 'admin' ? 'on' : ''}\`}
          onClick={() => go('admin')}
          style={{ color: '#f59e0b' }}
          title={t('nav.admin') || 'لوحة الإدارة'}
        >
          👑 {t('nav.admin') || 'الإدارة العامة'}
        </button>
      )}
      <div className="spacer"/>`;

const replacer = `      <div className="nav-brand" title={center.name || ''}>
        {center.logo
          ? <img src={center.logo} alt={center.name || ''} style={{ height: 36, borderRadius: 8, objectFit: 'cover' }}/>
          : <div className="nav-brand-ph">🏥</div>}
      </div>
      
      <div className="nav-scroll-area" style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto', flex: 1, padding: '0 4px' }}>
        {NAV_ITEMS.filter(item => canSeeTab(role, item.id)).map(item => (
          <button
            key={item.id}
            type="button"
            className={\`nb \${isActive(item.id) ? 'on' : ''}\`}
            onClick={() => go(item.id)}
          >
            {item.icon} {t(item.key)}
          </button>
        ))}
        {isAdmin && (
          <button
            type="button"
            className={\`nb \${activeView === 'admin' ? 'on' : ''}\`}
            onClick={() => go('admin')}
            style={{ color: '#f59e0b' }}
            title={t('nav.admin') || 'لوحة الإدارة'}
          >
            👑 {t('nav.admin') || 'الإدارة العامة'}
          </button>
        )}
      </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacer);
  fs.writeFileSync(path, code);
  console.log("Navbar layout patched!");
} else {
  console.log("target string not found in Navbar!");
}
