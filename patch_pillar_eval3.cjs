const fs = require('fs');
const path = 'src/pages/ProgramsReports/PillarAssessment.jsx';
let code = fs.readFileSync(path, 'utf8');

const fillFunc = `
  function fillSuggestedDraftEval() {
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
    toast('✅ تم تجهيز مسودة مقترحة شاملة متكاملة — راجعها وعدّلها قبل الحفظ.', 'ok');
  }
`;

if (!code.includes("fillSuggestedDraftEval")) {
    code = code.replace('  function saveEval() {', fillFunc + '\\n  function saveEval() {');
}

fs.writeFileSync(path, code);
console.log("Added fillSuggestedDraftEval");
