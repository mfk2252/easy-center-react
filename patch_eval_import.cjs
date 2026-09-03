const fs = require('fs');
const path = 'src/pages/Students/StudentDetail.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add State for Evaluation Import Modal
if (!code.includes('showEvalImport')) {
  code = code.replace("const [showGoalPicker, setShowGoalPicker] = useState(false);", 
  "const [showGoalPicker, setShowGoalPicker] = useState(false);\n  const [showEvalImport, setShowEvalImport] = useState(false);\n  const [evalSuggestions, setEvalSuggestions] = useState([]);");
}

// 2. Add Handler to fetch and open Modal
const evalHandler = `
  function handleOpenEvalImport() {
    const evals = (lsGet('progEvaluations') || []).filter(e => e.stuId === stuId);
    if (evals.length === 0) {
      toast('⚠️ لا يوجد تقييم مبدئي مسجل لهذا الطالب', 'er');
      return;
    }
    // Get latest evaluation
    evals.sort((a,b) => (b.date || '').localeCompare(a.date || ''));
    const latest = evals[0];
    
    // Extract suggestions from recommendations and summary
    const text = (latest.recommendations || '') + '\\n' + (latest.summary || '');
    const lines = text.split('\\n').map(l => l.trim().replace(/^-+/, '').trim()).filter(l => l.length > 5);
    
    if (lines.length === 0) {
      toast('⚠️ التقييم المبدئي لا يحتوي على توصيات صالحة للاستيراد', 'er');
      return;
    }
    
    setEvalSuggestions(lines.map((l, i) => ({ id: i, text: l, selected: true, domain: latest.domain || 'أخرى' })));
    setShowEvalImport(true);
  }

  function handleSaveEvalGoals() {
    const selected = evalSuggestions.filter(s => s.selected);
    selected.forEach(g => {
      lsAdd('iepGoals', {
        id: uid(),
        stuId,
        domain: g.domain,
        goal: g.text,
        priority: 'high',
        progress: 0,
        start: todayStr(),
        notes: 'مستخرج تلقائياً من التقييم المبدئي'
      });
    });
    setShowEvalImport(false);
    load();
    toast(\`✅ تم استيراد \${selected.length} هدف من التقييم\`, 'ok');
  }
`;
if (!code.includes('handleOpenEvalImport')) {
  code = code.replace("function handleImportGoals", evalHandler + "\n  function handleImportGoals");
}

// 3. Add Button to IEP Tab
const newButtons = `
            {canEdit && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-p" onClick={()=>{ setIepForm({...EMPTY_IEP, start:todayStr()}); setIepEditId(null); setShowIepForm(true); }}>➕ هدف جديد</button>
                <button className="btn btn-s" onClick={() => setShowGoalPicker(true)}>🗂️ استيراد من بنك الأهداف</button>
                <button className="btn btn-g" onClick={handleOpenEvalImport}>🪄 استخراج من التقييم المبدئي</button>
              </div>
            )}
`;
code = code.replace(/\{canEdit && \(\s*<div style=\{\{ display: 'flex', gap: '10px' \}\}\>\s*<button className="btn btn-p"[\s\S]*?<\/button>\s*<button className="btn btn-s"[\s\S]*?<\/button>\s*<\/div>\s*\)\}/, newButtons);

// 4. Render Eval Import Modal
const evalModalRender = `
      {showEvalImport && (
        <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowEvalImport(false);}}>
          <div className="mb">
            <div className="mb-h"><h2>🪄 أهداف مقترحة من التقييم المبدئي</h2></div>
            <div className="mb-b" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <p style={{ color: 'var(--text-sub)', marginBottom: 15 }}>تم استخراج هذه النقاط من (التوصيات والملخص) في أحدث تقييم مبدئي للطالب. حدد ما تود تحويله إلى هدف IEP:</p>
              {evalSuggestions.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, padding: 10, background: 'var(--bg2)', borderRadius: 8 }}>
                  <input type="checkbox" checked={s.selected} onChange={e => setEvalSuggestions(prev => prev.map(x => x.id === s.id ? {...x, selected: e.target.checked} : x))} style={{ marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--pr)' }}>{s.domain}</div>
                    <div style={{ fontSize: '0.95rem' }}>{s.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-f">
              <button className="btn btn-p" onClick={handleSaveEvalGoals}>حفظ الأهداف المحددة</button>
              <button className="btn btn-x" onClick={() => setShowEvalImport(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
`;
code = code.replace("{/* INFO TAB */}", evalModalRender + "\n      {/* INFO TAB */}");

fs.writeFileSync(path, code);
console.log("Patched Eval Import in StudentDetail.jsx");
