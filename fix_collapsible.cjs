const fs = require('fs');
const path = 'src/pages/ProgramsReports/InitialAssessment.jsx';
let code = fs.readFileSync(path, 'utf8');

const collapsibleCode = `
const CollapsibleSection = ({ title, color, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 16, border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          padding: '12px 16px', background: color ? \`var(--\${color}-l)\` : 'var(--g0)', 
          color: color ? \`var(--\${color})\` : 'var(--text-main)', fontWeight: 800, cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none'
        }}>
        <span>{title}</span>
        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{isOpen ? '▲ إخفاء التفاصيل' : '▼ عرض التفاصيل'}</span>
      </div>
      {isOpen && (
        <div style={{ padding: '16px', background: 'var(--bg-card)' }}>
          {children}
        </div>
      )}
    </div>
  );
};
`;

// Remove the nested one
code = code.replace(collapsibleCode, '');

// Insert it before export default function InitialAssessment
const insertPos = code.indexOf('export default function InitialAssessment');
code = code.substring(0, insertPos) + collapsibleCode + '\n' + code.substring(insertPos);

fs.writeFileSync(path, code);
console.log("Fixed CollapsibleSection position.");
