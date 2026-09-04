const fs = require('fs');
const path = 'src/pages/ProgramsReports/InitialAssessment.jsx';
let code = fs.readFileSync(path, 'utf8');

const returnStart = code.indexOf('return (');
const returnEnd = code.lastIndexOf(');') + 2;

const newReturn = `
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

return (
    <div className="card full">
      <div className="fhd">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--p)', display: 'flex', gap: 8, alignItems: 'center' }}>
          🎯 مركز التقييم والتشخيص
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-p" onClick={openNew}>➕ تقييم مبدئي جديد</button>
          <button type="button" className="btn btn-g" onClick={onBack}>العودة للبرامج والتقارير</button>
        </div>
      </div>

      <div className="p15" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 700 }}>
          <thead>
            <tr>
              <th>تاريخ التقييم</th>
              <th>الطالب</th>
              <th>المجال</th>
              <th>الأخصائي</th>
              <th>الخيارات</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.length === 0 ? (
              <tr><td colSpan="5"><EmptyState title="لا توجد تقييمات مسجلة" subtitle="اضغط على اضافة تقييم مبدئي جديد للبدء" /></td></tr>
            ) : evaluations.map(ev => {
              const s = students.find(x => x.id === ev.stuId) || {};
              return (
                <tr key={ev.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{ev.date}</td>
                  <td style={{ fontWeight: 600 }}>{s.name || ev.studentName}</td>
                  <td><span className="bdg">{ev.domain}</span></td>
                  <td>{ev.specialistName || 'غير محدد'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-xs btn-s" onClick={() => openEdit(ev)}>تعديل / عرض</button>
                      <button type="button" className="btn btn-xs btn-bl" onClick={() => printItem('evaluations', ev, students)}>🖨️ طباعة</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="mbg">
          <div className="mb" style={{ 
            maxWidth: '1200px', width: '96%', height: '94vh', 
            display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' 
          }}>
            {/* Header */}
            <div className="fhd" style={{
              padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, var(--p) 0%, var(--pr) 100%)', color: '#fff', flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.8rem' }}>🎯</span>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>التقييم المبدئي الشامل</h2>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.8rem' }}>تحديد مستوى الأداء الحالي ونقاط القوة والاحتياج للطالب</p>
                </div>
              </div>
              <button type="button" className="btn btn-sm" onClick={() => setModalOpen(false)} style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', border: 'none', fontWeight: 'bold' }}>✖ إغلاق</button>
            </div>

            {/* Error & Helper Messages */}
            {formErrors.length > 0 && (
              <div style={{ padding: '10px 20px', background: '#fee2e2', color: '#991b1b', fontSize: '0.9rem', borderBottom: '1px solid #fca5a5' }}>
                <strong style={{ display: 'block', marginBottom: 4 }}>يرجى تصحيح الأخطاء التالية:</strong>
                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                  {formErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
            {helperNote && (
              <div style={{ padding: '10px 20px', background: 'var(--p-l)', color: 'var(--p)', fontSize: '0.9rem', borderBottom: '1px solid var(--p)', fontWeight: 'bold' }}>
                💡 {helperNote}
              </div>
            )}

            {/* Form Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg)' }}>
              
              <CollapsibleSection title="بيانات المفحوص والتقييم الأساسية" color="text-main" defaultOpen={true}>
                <div className="fg c2">
                  <StudentPicker form={evalForm} setForm={setEvalForm} students={students} emps={emps} showExtra />
                  <div className="fl full" style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                    <div
                      onClick={() => document.getElementById('ia-photo-inp')?.click()}
                      style={{
                        width: 100, height: 100, border: '2px dashed var(--border-color)', borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        background: evalForm.photo ? \`url(\${evalForm.photo}) center/cover\` : 'var(--g0)',
                      }}
                    >
                      {!evalForm.photo && <span style={{ fontSize: '.72rem', color: 'var(--g5)' }}>📷 صورة</span>}
                    </div>
                    <input id="ia-photo-inp" type="file" accept={FILE_ACCEPT_IMAGE} style={{ display: 'none' }} onChange={onEvalPhoto}/>
                  </div>
                  <div className="fl"><label>التاريخ</label><input type="date" value={evalForm.date} onChange={e => setEvalForm(f => ({ ...f, date: e.target.value }))}/></div>
                  <div className="fl"><label>المجال</label>
                    <select value={evalForm.domain} onChange={e => setEvalForm(f => ({ ...f, domain: e.target.value }))}>
                      <option value="">-- اختر المجال --</option>
                      {PROGRAM_DOMAINS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="1. التاريخ والتطور (الحالة والتاريخ العائلي/الطبي)" color="p" defaultOpen={false}>
                <div className="fg c1">
                  <div className="fl full"><label>تاريخ الحالة</label><textarea value={evalForm.caseHistory || evalForm.history} onChange={e => setEvalForm(f => ({ ...f, caseHistory: e.target.value, history: e.target.value }))} rows={3} placeholder="متى بدأت المشكلة؟ من قام بالتحويل؟"/></div>
                  <div className="fl full"><label>التطور الارتقائي والطبي</label><textarea value={evalForm.medicalHistory} onChange={e => setEvalForm(f => ({ ...f, medicalHistory: e.target.value }))} rows={3} placeholder="أمراض سابقة، تاريخ الحمل والولادة، التطور الحركي واللغوي"/></div>
                  <div className="fl full"><label>التاريخ العائلي</label><textarea value={evalForm.familyHistory} onChange={e => setEvalForm(f => ({ ...f, familyHistory: e.target.value }))} rows={2} placeholder="صلة القرابة، وجود حالات مشابهة، ترتيب الطفل"/></div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="2. التقييمات والأدوات المستخدمة" color="cy" defaultOpen={false}>
                <div className="fg c1">
                  <div className="fl full"><label>ما هي التقييمات والأدوات المستخدمة؟</label><textarea value={evalForm.appliedTools} onChange={e => setEvalForm(f => ({ ...f, appliedTools: e.target.value }))} rows={3} placeholder="مثال: مقياس بورتيج، كارز، بيب-3..."/></div>
                  <div className="fl full"><label>ملاحظات أو مناقشة للتقييمات المستخدمة</label><textarea value={evalForm.toolsNotes} onChange={e => setEvalForm(f => ({ ...f, toolsNotes: e.target.value }))} rows={3} placeholder="استجابة الطالب، العوائق أثناء التقييم"/></div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="3. المقابلة الأسرية" color="or" defaultOpen={false}>
                <div className="fg c1">
                  <div className="fl full"><label>ملاحظات الأهل أثناء المقابلة الأولى</label><textarea value={evalForm.parentsInterview} onChange={e => setEvalForm(f => ({ ...f, parentsInterview: e.target.value }))} rows={3} placeholder="ما هي شكوى الأهل الرئيسية؟ وما تطلعاتهم؟"/></div>
                  <div className="fl full"><label>الاحتياجات التدريبية للأهل</label><textarea value={evalForm.parentsNeeds} onChange={e => setEvalForm(f => ({ ...f, parentsNeeds: e.target.value }))} rows={3} placeholder="ما الذي تحتاجه الأسرة لدعم الطفل (نفسياً، مهارياً، تثقيفياً)؟"/></div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="4. الأداء الحالي والملاحظة" color="pr" defaultOpen={false}>
                <div className="fg c1">
                  <div className="fl full"><label>نقاط القوة لدى المستفيد</label><textarea value={evalForm.strengths} onChange={e => setEvalForm(f => ({ ...f, strengths: e.target.value }))} rows={3} placeholder="ما الذي يتقنه المستفيد؟ المهارات الإيجابية التي يمكن البناء عليها"/></div>
                  <div className="fl full"><label>نقاط الضعف أو الاحتياج لدى المستفيد</label><textarea value={evalForm.weaknesses} onChange={e => setEvalForm(f => ({ ...f, weaknesses: e.target.value }))} rows={3} placeholder="المجالات والمهارات التي تحتاج إلى تدخل مباشر"/></div>
                  <div className="fl full"><label>الملاحظات السلوكية أثناء الجلسات الاستكشافية</label><textarea value={evalForm.observationSessions} onChange={e => setEvalForm(f => ({ ...f, observationSessions: e.target.value }))} rows={2} placeholder="الانتباه، فرط الحركة، التواصل البصري، السلوك النمطي..."/></div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="5. الخلاصة والتوصيات (تغذي الخطة الفردية IEP)" color="text-main" defaultOpen={true}>
                <div className="fg c1">
                  <div className="fl full"><label>مناقشة عامة على التقييم / الخلاصة</label><textarea value={evalForm.summary} onChange={e => setEvalForm(f => ({ ...f, summary: e.target.value }))} rows={3} placeholder="تلخيص شامل لحالة الطالب واحتياجاته الفعلية بناءً على التقييمات السابقة"/></div>
                  <div className="fl full"><label>التوصيات (تُستخرج تلقائياً كأهداف في خطة IEP)</label><textarea value={evalForm.recommendations} onChange={e => setEvalForm(f => ({ ...f, recommendations: e.target.value }))} rows={5} placeholder="اكتب التوصيات على شكل نقاط (كل نقطة في سطر مستقل) لتسهيل استيرادها لاحقاً في خطة IEP"/></div>
                </div>
              </CollapsibleSection>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 20px', background: 'var(--g0)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: 12 }}>
               <div style={{ display: 'flex', gap: 8 }}>
                 <button type="button" className="btn btn-p" onClick={save} style={{ padding: '8px 24px', fontSize: '1rem', fontWeight: 800 }}>💾 حفظ التقييم</button>
                 <button type="button" className="btn btn-g" onClick={() => setModalOpen(false)}>إلغاء</button>
               </div>
               <div style={{ display: 'flex', gap: 8 }}>
                 <button type="button" className="btn btn-s" onClick={fillSuggestedDraft} style={{ fontWeight: 800, background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#fff', border: 'none' }}>✨ مسودة سريعة (توليد آلي)</button>
                 <button type="button" className="btn btn-bl" onClick={() => printEval()} style={{ fontWeight: 800 }}>🖨️ طباعة التقرير</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
`

code = code.substring(0, returnStart) + newReturn;

fs.writeFileSync(path, code);
console.log("Patched UI successfully.");
