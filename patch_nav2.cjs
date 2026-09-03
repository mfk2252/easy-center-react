const fs = require('fs');
const path = 'src/components/layout/Navbar.jsx';
let code = fs.readFileSync(path, 'utf8');

const startIdx = code.indexOf('{NAV_ITEMS');
const endIdx = code.indexOf('<div className="spacer"/>') + '<div className="spacer"/>'.length;

const newSection = `
      <div className="nav-scroll-area" style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto', flex: 1, padding: '0 4px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <style>{\`.nav-scroll-area::-webkit-scrollbar { display: none; }\`}</style>
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

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newSection + code.substring(endIdx);
  fs.writeFileSync(path, code);
  console.log("Navbar layout patched with indexing");
} else {
  console.log("Could not find start or end index.");
}
