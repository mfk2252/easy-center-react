const fs = require('fs');
const path = 'src/pages/Students/StudentDetail.jsx';
let code = fs.readFileSync(path, 'utf8');

// Add import
if (!code.includes('GoalPickerModal')) {
  code = code.replace("import { centerWhatsAppUrl", "import { GoalPickerModal } from '../ProgramsReports/GoalsBank';\nimport { centerWhatsAppUrl");
}

// Add state for GoalPicker
if (!code.includes('showGoalPicker')) {
  code = code.replace("const [iepEditId, setIepEditId] = useState(null);", "const [iepEditId, setIepEditId] = useState(null);\n  const [showGoalPicker, setShowGoalPicker] = useState(false);");
}

// Add handler for importing goals
const importHandler = `
  function handleImportGoals(selectedGoals) {
    selectedGoals.forEach(g => {
      lsAdd('iepGoals', {
        id: uid(),
        stuId,
        domain: g.domain || 'أخرى',
        goal: g.text,
        priority: 'medium',
        progress: 0,
        start: todayStr(),
        notes: \`مستورد من برنامج: \${g.program}\`
      });
    });
    setShowGoalPicker(false);
    load();
    toast('✅ تم استيراد الأهداف بنجاح', 'ok');
  }
`;
if (!code.includes('handleImportGoals')) {
  code = code.replace("function saveIep() {", importHandler + "\n  function saveIep() {");
}

// Update the IEP tab buttons
const iepButtons = `
            {canEdit && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-p" onClick={()=>{ setIepForm({...EMPTY_IEP, start:todayStr()}); setIepEditId(null); setShowIepForm(true); }}>➕ هدف جديد</button>
                <button className="btn btn-s" onClick={() => setShowGoalPicker(true)}>🗂️ استيراد من بنك الأهداف</button>
              </div>
            )}
`;
code = code.replace(/\{canEdit && <button className="btn btn-p" onClick=\{\(\)=>{ setIepForm\(\{\.\.\.EMPTY_IEP, start:today\}\); setIepEditId\(null\); setShowIepForm\(true\); }}\>➕ هدف جديد<\/button>\}/, iepButtons);

// Render GoalPickerModal
const modalRender = `
      {showGoalPicker && (
        <GoalPickerModal
          onClose={() => setShowGoalPicker(false)}
          onConfirm={handleImportGoals}
        />
      )}
`;
code = code.replace("{/* INFO TAB */}", modalRender + "\n      {/* INFO TAB */}");

fs.writeFileSync(path, code);
console.log("Patched IEP Goal Bank Import in StudentDetail.jsx");
