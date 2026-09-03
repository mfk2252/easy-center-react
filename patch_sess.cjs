const fs = require('fs');
const path = 'src/pages/Students/StudentDetail.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update EMPTY_SESSION
code = code.replace(
  /const EMPTY_SESSION = { type:'تخاطب ونطق', date:'', time:'', duration:45, empId:'', status:'done', notes:'', goals:'', attachmentData:'', attachmentName:'' };/,
  "const EMPTY_SESSION = { type:'تخاطب ونطق', date:'', time:'', duration:45, empId:'', status:'done', notes:'', goals:'', attachmentData:'', attachmentName:'', iepGoalId:'', iepProgress:0 };"
);

// 2. Update saveSess
const newSaveSess = `  function saveSess() {
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
code = code.replace(/function saveSess\(\) \{[\s\S]*?load\(\);\s*\}/, newSaveSess);

// 3. Update the form UI to add dropdown for IEP goals and slider for progress
const sessionFormFields = `
                    <div className="fl full"><label>ربط بهدف IEP (اختياري)</label>
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
                    )}
`;
code = code.replace(/<div className="fl full"><label>الأهداف \/ محتوى الجلسة<\/label>/, sessionFormFields + '\n                    <div className="fl full"><label>الأهداف / محتوى الجلسة</label>');

fs.writeFileSync(path, code);
console.log("Patched session form in StudentDetail.jsx");
