const fs = require('fs');
const path = 'src/pages/ProgramsReports/InitialAssessment.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. UPDATE EMPTY_EVAL
const oldEmptyEval = /const EMPTY_EVAL = \{[\s\S]*?domain: 'التربية الخاصة', date: '',\s*\};/;
const newEmptyEval = `const EMPTY_EVAL = {
  ...EMPTY_STU_PICK,
  dob: '', age: '', diagnosis: '', specialistName: '', photo: '',
  history: '', caseHistory: '', medicalHistory: '', familyHistory: '',
  appliedTools: '', toolsNotes: '',
  parentsInterview: '', parentsNeeds: '',
  observationSessions: '',
  strengths: '', weaknesses: '',
  recommendations: '', summary: '',
  domain: 'التربية الخاصة', date: '',
};`;
if(code.match(oldEmptyEval)) {
    code = code.replace(oldEmptyEval, newEmptyEval);
}

// 2. UPDATE fillSuggestedDraft
const oldFill = /function fillSuggestedDraft\(\) \{[\s\S]*?setHelperNote\('تم تجهيز مسودة مقترحة — راجعها وعدّلها قبل الحفظ\.'\);\s*\}/;
const newFill = `function fillSuggestedDraft() {
    const domain = evalForm.domain || 'التربية الخاصة';
    setEvalForm(f => ({
      ...f,
      caseHistory: f.caseHistory || f.history || 'تم تحويل الحالة من قبل جهة طبية للاستشارة وتقييم القدرات النمائية.',
      medicalHistory: f.medicalHistory || 'لا توجد مشكلات طبية مصاحبة تذكر، نمو ارتقائي طبيعي في أغلب الجوانب الحركية الكبرى وتأخر في الجوانب الدقيقة.',
      familyHistory: f.familyHistory || 'يعيش مع الوالدين، ترتيبه الثاني، لا توجد أمراض وراثية مشابهة في العائلة.',
      parentsInterview: f.parentsInterview || 'أفاد ولي الأمر بوجود تحديات في نطق بعض الحروف وتشتت سريع أثناء أداء المهام.',
      parentsNeeds: f.parentsNeeds || 'الأسرة بحاجة إلى توجيه حول كيفية التعامل مع السلوكيات النمطية وتعميم المهارات في المنزل من خلال جدول منظم.',
      appliedTools: f.appliedTools || '• مقابلة أولية مع ولي الأمر\\n• ملاحظة مباشرة في البيئة الطبيعية\\n• استبانة تقييم المهارات',
      toolsNotes: f.toolsNotes || 'أظهر استجابة جيدة لبعض فقرات التقييم وتفاعل إيجابي مع المعززات المادية، وتشتت في فقرات أخرى تتطلب تركيزاً بصرياً.',
      strengths: f.strengths || '• تواصل بصري جيد في أغلب الأحيان\\n• مهارات حركية كبرى ممتازة\\n• استجابة سريعة للمعززات الاجتماعية',
      weaknesses: f.weaknesses || '• ضعف في التركيز والانتباه للمهام التي تتطلب أكثر من 5 دقائق\\n• قصور في التواصل اللفظي للتعبير عن الاحتياجات',
      observationSessions: f.observationSessions || 'لوحظ خلال الملاحظة الاستكشافية تفاعل محدود مع الأقران وميل للعب الفردي.',
      summary: f.summary || 'خلاصة التقييم المبدئي تشير إلى احتياج الحالة للتدخل الشامل في مجالات التواصل وتعديل السلوك وتنمية الانتباه الإدراكي.',
      recommendations: f.recommendations || \`• إدراج الحالة في برنامج تدخل مبكر في مجال \${domain}\\n• وضع أهداف لتنمية مهارات الانتباه المشترك كأولوية قصوى\\n• دمج جلسات النطق والتخاطب مع تعديل السلوك\\n• جدولة اجتماع دوري (شهري) مع الأسرة للمتابعة وتدريبهم على تعميم المهارات\`
    }));
    setHelperNote('تم تجهيز مسودة مقترحة شاملة متكاملة — راجعها وعدّلها قبل الحفظ.');
  }`;
if(code.match(oldFill)) {
    code = code.replace(oldFill, newFill);
}

// 3. UPDATE THE FORM UI
const formStartRegex = /<div className="fl full"><label>التاريخ التطوري<\/label>[\s\S]*?<div className="fl full"><label>التوصيات<\/label><textarea [^>]+><\/div>/;
const newFormUI = `
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
                <div className="fl full"><label>التوصيات (تُستخرج تلقائياً كأهداف في خطة IEP)</label><textarea value={evalForm.recommendations} onChange={e => setEvalForm(f => ({ ...f, recommendations: e.target.value }))} rows={4} placeholder="اكتب التوصيات على شكل نقاط (كل نقطة في سطر مستقل) لتسهيل استيرادها لاحقاً في خطة IEP"/></div>
`;
if(code.match(formStartRegex)) {
    code = code.replace(formStartRegex, newFormUI);
} else {
    // Attempt fallback if placeholder was changed in previous step
    const fbRegex = /<div className="fl full"><label>التاريخ التطوري<\/label>[\s\S]*?<textarea value=\{evalForm\.recommendations\}[^>]+><\/div>/;
    if(code.match(fbRegex)){
        code = code.replace(fbRegex, newFormUI);
    }
}

fs.writeFileSync(path, code);
console.log("Patched Initial Assessment FULL Form");
