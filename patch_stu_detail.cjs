const fs = require('fs');
const path = 'src/pages/Students/StudentDetail.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Better Extraction Logic
const oldExtract = "const text = (latest.recommendations || '') + '\\n' + (latest.summary || '');\n    const lines = text.split('\\n').map(l => l.trim().replace(/^-+/, '').trim()).filter(l => l.length > 5);";
const newExtract = "const text = (latest.recommendations || '') + '\\n' + (latest.summary || '');\n    const lines = text.split(/[\\n.،]+/).map(l => l.trim().replace(/^-+|-+$/g, '').trim()).filter(l => l.length > 5);";
code = code.replace(oldExtract, newExtract);

// 2. Update EMPTY_SESSION
code = code.replace(
  "iepGoalId:'', iepProgress:0",
  "linkedGoals: []"
);

// 3. Update saveSess
const oldSaveSess = `  function saveSess() {
    if (!sessForm.date) { toast('⚠️ أدخل تاريخ الجلسة','er'); return; }
    if (sessForm.iepGoalId && sessForm.status === 'done' && sessForm.iepProgress != null) {
       const goal = iepGoals.find(g => g.id === sessForm.iepGoalId);
       if (goal) {
          lsUpd('iepGoals', goal.id, { ...goal, progress: Number(sessForm.iepProgress) });
       }
    }
    if (sessEditId) { lsUpd('sessions', sessEditId, { ...sessForm, stuId }); toast('✅ تم التحديث','ok'); }
    else { lsAdd('sessions', { ...sessForm, stuId, id: uid() }); toast('✅ تم تسجيل الجلسة','ok'); }
    setShowSessForm(false); load();
  }`;
const newSaveSess = `  function saveSess() {
    if (!sessForm.date) { toast('⚠️ أدخل تاريخ الجلسة','er'); return; }
    if (sessForm.linkedGoals && sessForm.linkedGoals.length > 0 && sessForm.status === 'done') {
       sessForm.linkedGoals.forEach(link => {
          const goal = iepGoals.find(g => g.id === link.goalId);
          if (goal) {
             lsUpd('iepGoals', goal.id, { ...goal, progress: Number(link.progress) });
          }
       });
    }
    if (sessEditId) { lsUpd('sessions', sessEditId, { ...sessForm, stuId }); toast('✅ تم التحديث','ok'); }
    else { lsAdd('sessions', { ...sessForm, stuId, id: uid() }); toast('✅ تم تسجيل الجلسة','ok'); }
    setShowSessForm(false); load();
  }`;
if (code.includes(oldSaveSess)) {
    code = code.replace(oldSaveSess, newSaveSess);
} else {
    // Fallback replacement if exact match fails
    code = code.replace(/function saveSess\(\) \{[\s\S]*?load\(\);\s*\}/, newSaveSess);
}

// 4. Update the session form UI
const oldSessionUI = `<div className="fl full"><label>ربط بهدف IEP (اختياري)</label>
                      <select value={sessForm.iepGoalId || ''} onChange={e => {
                        const g = iepGoals.find(x => x.id === e.target.value);
                        setSessForm(f => ({...f, iepGoalId: e.target.value, iepProgress: g ? g.progress : 0, goals: g ? g.goal : f.goals}));
                      }}>
                        <option value="">-- بدون ربط --</option>
                        {iepGoals.map(g => <option key={g.id} value={g.id}>{g.domain} - {g.goal}</option>)}
                      </select>
                    </div>
                    {sessForm.iepGoalId && (
                      <div className="fl full">
                        <label>نسبة إنجاز الهدف (تحديث مباشر لخطة IEP) <strong>{sessForm.iepProgress || 0}%</strong></label>
                        <input type="range" min="0" max="100" value={sessForm.iepProgress || 0} onChange={e => setSessForm(f => ({...f, iepProgress: Number(e.target.value)}))} style={{width:'100%', accentColor:'var(--p)'}} />
                      </div>
                    )}`;

const newSessionUI = `<div className="fl full"><label>الأهداف التي تم العمل عليها في هذه الجلسة (يمكنك اختيار عدة أهداف)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg2)', padding: '10px', borderRadius: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                         {iepGoals.map(g => {
                            const isLinked = (sessForm.linkedGoals || []).find(x => x.goalId === g.id);
                            return (
                              <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--bdr)' }}>
                                <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.5' }}>
                                  <input type="checkbox" checked={!!isLinked} onChange={(e) => {
                                     if (e.target.checked) {
                                        setSessForm(f => ({ ...f, linkedGoals: [...(f.linkedGoals||[]), { goalId: g.id, progress: g.progress || 0 }] }));
                                     } else {
                                        setSessForm(f => ({ ...f, linkedGoals: (f.linkedGoals||[]).filter(x => x.goalId !== g.id) }));
                                     }
                                  }} style={{ marginTop: '4px', transform: 'scale(1.2)' }} />
                                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}><strong>{g.domain}:</strong> {g.goal}</span>
                                </label>
                                {isLinked && (
                                  <div style={{ paddingRight: '25px', marginTop: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--p)', fontWeight: 'bold' }}>
                                       <span>نسبة الإنجاز الحالية:</span>
                                       <span>{isLinked.progress}%</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={isLinked.progress} onChange={(e) => {
                                       const val = Number(e.target.value);
                                       setSessForm(f => ({ ...f, linkedGoals: f.linkedGoals.map(x => x.goalId === g.id ? { ...x, progress: val } : x) }));
                                    }} style={{ width: '100%', accentColor: 'var(--p)' }} />
                                  </div>
                                )}
                              </div>
                            );
                         })}
                         {iepGoals.length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', textAlign: 'center', padding: '10px' }}>لا توجد أهداف نشطة في خطة الطالب الحالية.</div>}
                      </div>
                    </div>`;

// Use simple split/join in case of exact formatting issues in the old code
if (code.includes('<div className="fl full"><label>ربط بهدف IEP (اختياري)</label>')) {
    const parts = code.split('<div className="fl full"><label>ربط بهدف IEP (اختياري)</label>');
    const before = parts[0];
    let after = parts[1];
    
    // find the end of the old block which is just before <div className="fl full"><label>الأهداف / محتوى الجلسة</label>
    const endParts = after.split('<div className="fl full"><label>الأهداف / محتوى الجلسة</label>');
    code = before + newSessionUI + '\n                    <div className="fl full"><label>الأهداف / محتوى الجلسة</label>' + endParts[1];
}

fs.writeFileSync(path, code);
console.log("Patched Student Detail Logic & UI");
