const fs = require('fs');
const path = 'src/pages/ProgramsReports/PillarAssessment.jsx';
let code = fs.readFileSync(path, 'utf8');

const modalStart = code.indexOf('{/* MODAL: INITIAL ASSESSMENT FORM */}');
const modalEnd = code.indexOf('{/* MODAL: SCALE APPLICATION FORM */}');

const newModal = `{/* MODAL: INITIAL ASSESSMENT FORM */}
      {evalModal && (
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
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>{evalEditId ? 'تعديل التقييم المبدئي الشامل' : 'إضافة تقييم مبدئي شامل جديد'}</h2>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.8rem' }}>توثيق التاريخ النمائي، الملاحظة المباشرة، والتوصيات التأهيلية</p>
                </div>
              </div>
              <button type="button" className="btn btn-sm" onClick={() => setEvalModal(false)} style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', border: 'none', fontWeight: 'bold' }}>✖ إغلاق</button>
            </div>

            {/* Form Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg)' }}>
              
              <CollapsibleSection title="بيانات المفحوص والتقييم الأساسية" color="text-main" defaultOpen={true}>
                <div className="fg c2">
                  <StudentPicker form={evalForm} setForm={setEvalForm} students={students} emps={emps} showExtra />
                  <div className="fl">
                    <label>تاريخ التقييم <span className="req">*</span></label>
                    <input type="date" value={evalForm.date} onChange={e => setEvalForm(f => ({ ...f, date: e.target.value }))}/>
                  </div>
                  <div className="fl">
                    <label>المجال المستهدف <span className="req">*</span></label>
                    <select value={evalForm.domain} onChange={e => setEvalForm(f => ({ ...f, domain: e.target.value }))}>
                      {PROGRAM_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
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
                 <button type="button" className="btn btn-p" onClick={saveEval} style={{ padding: '8px 24px', fontSize: '1rem', fontWeight: 800 }}>💾 حفظ التقييم</button>
                 <button type="button" className="btn btn-g" onClick={() => setEvalModal(false)}>إلغاء</button>
               </div>
               <div style={{ display: 'flex', gap: 8 }}>
                 <button type="button" className="btn btn-s" onClick={fillSuggestedDraftEval} style={{ fontWeight: 800, background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#fff', border: 'none' }}>✨ مسودة سريعة (توليد آلي)</button>
                 <button type="button" className="btn btn-bl" onClick={() => printItem('evaluations', evalForm, students)} style={{ fontWeight: 800 }}>🖨️ طباعة التقرير</button>
               </div>
            </div>
          </div>
        </div>
      )}

      `;

code = code.substring(0, modalStart) + newModal + code.substring(modalEnd);
fs.writeFileSync(path, code);
console.log("Patched Modal UI in PillarAssessment");
