const fs = require('fs');
const path = 'src/pages/Settings.jsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `              {/* تحكم الحجم والوزن */}`;
const replacer = `              {/* أزرار استعادة الافتراضي */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                <button
                  type="button"
                  className="btn btn-g"
                  onClick={() => {
                    setFontFamily('tajawal');
                    setFontSize(16);
                    setFontWeight('400');
                    applyActiveFontSettings(16, '400', 'tajawal');
                  }}
                  style={{ padding: '8px 16px', fontSize: '.85rem' }}
                >
                  🔄 استعادة إعدادات الخط الافتراضية
                </button>
              </div>

              {/* تحكم الحجم والوزن */}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacer);
  fs.writeFileSync(path, code);
  console.log('Settings patched!');
} else {
  console.log('Target string not found!');
}
