const fs = require('fs');
const path = 'src/pages/ProgramsReports/InitialAssessment.jsx';
let code = fs.readFileSync(path, 'utf8');

const target = `<div className="fl full"><label>التاريخ التطوري</label><textarea value={evalForm.history} onChange={e => setEvalForm(f => ({ ...f, history: e.target.value }))} rows={4}/></div>
                <div className="fl full"><label>مقابلة الأهل</label><textarea value={evalForm.parentsInterview} onChange={e => setEvalForm(f => ({ ...f, parentsInterview: e.target.value }))} rows={4}/></div>
                <div className="fl full"><label>أدوات التقييم</label><textarea value={evalForm.appliedTools} onChange={e => setEvalForm(f => ({ ...f, appliedTools: e.target.value }))} rows={3}/></div>
                <div className="fl full"><label>الملاحظة</label><textarea value={evalForm.observationSessions} onChange={e => setEvalForm(f => ({ ...f, observationSessions: e.target.value }))} rows={4}/></div>
                <div className="fl full"><label>التوصيات</label><textarea value={evalForm.recommendations} onChange={e => setEvalForm(f => ({ ...f, recommendations: e.target.value }))} rows={4}/></div>`;

const replacement = `
                {/* 1. التاريخ والتطور */}
                <div className="fl full" style={{ marginTop: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--p-l)' }}>
                  <h3 style={{ margin: 0, color: 'var(--p)' }}>1. التاريخ والتطور</h3>
                </div>
                <div className="fl"><label>تاريخ الحالة</label><textarea value={evalForm.caseHistory || evalForm.history} onChange={e => setEvalForm(f => ({ ...f, caseHistory: e.target.value, history: e.target.value }))} rows={3} placeholder="متى بدأت المشكلة؟ من قام بالتحويل؟"/></div>
                <div className="fl"><label>التطور الارتقائي والطبي</label><textarea value={evalForm.medicalHistory} onChange={e => setEvalForm(f => ({ ...f, medicalHistory: e.target.value }))} rows={3} placeholder="أمراض سابقة، تاريخ الحمل والولادة، التطور الحركي واللغوي"/></div>
                <div className="fl full"><label>التاريخ العائلي</label><textarea value={evalForm.familyHistory} onChange={e => setEvalForm(f => ({ ...f, familyHistory: e.target.value }))} rows={2} placeholder="صلة القرابة، وجود حالات مشابهة، ترتيب الطفل"/></div>

                {/* 2. التقييمات والأدوات */}
                <div className="fl full" style={{ marginTop: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--cy-l)' }}>
                  <h3 style={{ margin: 0, color: 'var(--cy)' }}>2. التقييمات والأدوات</h3>
                </div>
                <div className="fl"><label>ما هي التقييمات والأدوات المستخدمة؟</label><textarea value={evalForm.appliedTools} onChange={e => setEvalForm(f => ({ ...f, appliedTools: e.target.value }))} rows={3} placeholder="مثال: مقياس بورتيج، كارز، بيب-3..."/></div>
                <div className="fl"><label>ملاحظات أو مناقشة للتقييمات المستخدمة</label><textarea value={evalForm.toolsNotes} onChange={e => setEvalForm(f => ({ ...f, toolsNotes: e.target.value }))} rows={3} placeholder="استجابة الطالب، العوائق أثناء التقييم"/></div>

                {/* 3. المقابلة الأسرية */}
                <div className="fl full" style={{ marginTop: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--or-l)' }}>
                  <h3 style={{ margin: 0, color: 'var(--or)' }}>3. المقابلة الأسرية</h3>
                </div>
                <div className="fl"><label>ملاحظات الأهل أثناء المقابلة الأولى</label><textarea value={evalForm.parentsInterview} onChange={e => setEvalForm(f => ({ ...f, parentsInterview: e.target.value }))} rows={3} placeholder="ما هي شكوى الأهل الرئيسية؟ وما تطلعاتهم؟"/></div>
                <div className="fl"><label>الاحتياجات التدريبية للأهل</label><textarea value={evalForm.parentsNeeds} onChange={e => setEvalForm(f => ({ ...f, parentsNeeds: e.target.value }))} rows={3} placeholder="ما الذي تحتاجه الأسرة لدعم الطفل (نفسياً، مهارياً، تثقيفياً)؟"/></div>

                {/* 4. الأداء الحالي والملاحظة */}
                <div className="fl full" style={{ marginTop: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--pr-l)' }}>
                  <h3 style={{ margin: 0, color: 'var(--pr)' }}>4. الأداء الحالي والملاحظة</h3>
                </div>
                <div className="fl"><label>نقاط القوة لدى المستفيد</label><textarea value={evalForm.strengths} onChange={e => setEvalForm(f => ({ ...f, strengths: e.target.value }))} rows={3} placeholder="ما الذي يتقنه المستفيد؟ المهارات الإيجابية التي يمكن البناء عليها"/></div>
                <div className="fl"><label>نقاط الضعف أو الاحتياج لدى المستفيد</label><textarea value={evalForm.weaknesses} onChange={e => setEvalForm(f => ({ ...f, weaknesses: e.target.value }))} rows={3} placeholder="المجالات والمهارات التي تحتاج إلى تدخل مباشر"/></div>
                <div className="fl full"><label>الملاحظات السلوكية أثناء الجلسات الاستكشافية</label><textarea value={evalForm.observationSessions} onChange={e => setEvalForm(f => ({ ...f, observationSessions: e.target.value }))} rows={2} placeholder="الانتباه، فرط الحركة، التواصل البصري، السلوك النمطي..."/></div>

                {/* 5. الخلاصة والتوصيات */}
                <div className="fl full" style={{ marginTop: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--bdr)' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-main)' }}>5. الخلاصة والتوصيات (تغذي الخطة الفردية IEP)</h3>
                </div>
                <div className="fl full"><label>مناقشة عامة على التقييم / الخلاصة</label><textarea value={evalForm.summary} onChange={e => setEvalForm(f => ({ ...f, summary: e.target.value }))} rows={3} placeholder="تلخيص شامل لحالة الطالب واحتياجاته الفعلية بناءً على التقييمات السابقة"/></div>
                <div className="fl full"><label>التوصيات (تُستخرج تلقائياً كأهداف في خطة IEP)</label><textarea value={evalForm.recommendations} onChange={e => setEvalForm(f => ({ ...f, recommendations: e.target.value }))} rows={4} placeholder="اكتب التوصيات على شكل نقاط (كل نقطة في سطر مستقل) لتسهيل استيرادها لاحقاً في خطة IEP"/></div>`;

code = code.replace(target, replacement);
fs.writeFileSync(path, code);
console.log("Patched successfully.");
