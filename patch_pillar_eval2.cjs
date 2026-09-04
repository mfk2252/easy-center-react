const fs = require('fs');
const path = 'src/pages/ProgramsReports/PillarAssessment.jsx';
let code = fs.readFileSync(path, 'utf8');

const collap = `
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

const target = "export default function PillarAssessment() {";
if (!code.includes("CollapsibleSection")) {
  code = code.replace(target, collap + "\\n" + target);
}

fs.writeFileSync(path, code);
console.log("Added CollapsibleSection");
