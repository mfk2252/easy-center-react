import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  GARS3_ITEMS,
  GARS3_DOMAINS,
  GARS3_RESPONSE_OPTIONS,
  calculateGARS3Psychometrics,
} from '../../data/gars3Data';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_GARS3_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'الأم',
  relationshipDuration: 'سنتان',
  examinerName: '',
  examinerRole: 'أخصائي نفسي / تشخيص',
  date: todayStr(),
  isVerbal: true, // true: 6 subscales, false: 4 subscales (non-verbal)
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function GARS3AssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
}) {
  const { toast, currentUser } = useApp();

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_GARS3_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
        isVerbal: initialData.isVerbal !== undefined ? initialData.isVerbal : true,
      };
    }
    return {
      ...EMPTY_GARS3_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');

  // Real-time Psychometrics Calculation
  const psychometrics = useMemo(() => {
    return calculateGARS3Psychometrics(form.scores, form.isVerbal);
  }, [form.scores, form.isVerbal]);

  const displayedDomains = useMemo(() => {
    return form.isVerbal ? GARS3_DOMAINS : GARS3_DOMAINS.filter(d => d.isCore);
  }, [form.isVerbal]);

  const filteredItems = useMemo(() => {
    let items = GARS3_ITEMS;
    if (!form.isVerbal) {
      items = items.filter(it => it.domainId !== 'cs' && it.domainId !== 'ms');
    }
    if (activeDomainFilter !== 'all') {
      items = items.filter(it => it.domainId === activeDomainFilter);
    }
    return items;
  }, [activeDomainFilter, form.isVerbal]);

  if (!isOpen) return null;

  function handleScoreSelect(itemId, scoreValue) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: scoreValue,
      },
    }));
  }

  function handleItemNoteChange(itemId, noteText) {
    setForm(prev => ({
      ...prev,
      itemNotes: {
        ...prev.itemNotes,
        [itemId]: noteText,
      },
    }));
  }

  function autoFillSample(level = 'mild') {
    const scores = {};
    const items = form.isVerbal ? GARS3_ITEMS : GARS3_ITEMS.filter(it => it.domainId !== 'cs' && it.domainId !== 'ms');
    
    items.forEach(it => {
      if (level === 'mild') {
        scores[it.id] = (it.id % 3 === 0) ? 2 : (it.id % 2 === 0 ? 1 : 0);
      } else if (level === 'moderate') {
        scores[it.id] = (it.id % 4 === 0) ? 3 : (it.id % 2 === 0 ? 2 : 1);
      } else if (level === 'severe') {
        scores[it.id] = (it.id % 3 === 0) ? 2 : 3;
      } else {
        scores[it.id] = (it.id % 5 === 0) ? 1 : 0;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم ملء إجابات افتراضية (${level}) لأغراض المعاينة والتجربة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.answeredCount < 10) {
      toast('⚠️ يرجى تقييم عدد كافٍ من العبارات لتوليد الخلاصة التشخيصية', 'er');
      return;
    }

    const domainDetails = psychometrics.domainResults.map(d => {
      let level = 'ضمن المتوسط الطبيعي';
      if (d.scaledScore >= 13) level = 'مرتفع جداً (شديد)';
      else if (d.scaledScore >= 11) level = 'فوق المتوسط (متوسط)';
      else if (d.scaledScore >= 8) level = 'متوسط';
      return `• ${d.name} (${d.code}): الدرجة الخام (${d.rawScore}/${d.maxRaw}) ➔ الدرجة المعيارية (${d.scaledScore}) بالرتبة المئينية (${d.percentile}%) - [${level}]`;
    }).join('\n');

    const verbalStatus = form.isVerbal ? 'الأطفال الناطقين (تطبيق 6 مقاييس فرعية)' : 'الأطفال غير الناطقين (تطبيق 4 مقاييس فرعية أساسية)';

    const suggestedSummary = `بناءً على تطبيق مقياس جيليام لتقدير اضطراب طيف التوحد - الإصدار الثالث (GARS-3) وفق معايير الدليل التشخيصي والإحصائي الخامس (DSM-5):\n\nصيغة التطبيق: ${verbalStatus}.\n- مجموع الدرجات المعيارية الموزونة: (${psychometrics.sumScaledScores}).\n- معامل اضطراب طيف التوحد (Autism Quotient - AQ): (${psychometrics.autismQuotient}) برتبة مئينية كلية (${psychometrics.overallPercentile}%).\n\nالنتيجة والتشخيص الإكلينيكي:\nاحتمالية التوحد: [${psychometrics.probability}]\nمستوى الشدة وفق DSM-5: [${psychometrics.dsm5Level}]\nمستوى الدعم المطلوب: [${psychometrics.supportLevel}]\n\nالأداء التفصيلي على المقاييس الفرعية:\n${domainDetails}\n\nالوصف النفسي:\n${psychometrics.clinicalDescription}`;

    const suggestedRecs = psychometrics.severityKey === 'unlikely'
      ? '1. لا تظهر نتائج المقياس مؤشرات دالة على اضطراب طيف التوحد في الوقت الراهن.\n2. تعزيز المهارات النمائية واللغوية في البيئة الطبيعية والصفية.\n3. إعادة الملاحظة بعد 6 أشهر في حال استجدت أي ملاحظات سلوكية.'
      : psychometrics.severityKey === 'mild'
      ? '1. تصميم خطة تربوية فردية (IEP) تركز على المبادأة الاجتماعية وتطوير مهارات اللعب المشترك.\n2. جلسات تخاطب لتنمية مهارات التفاعل الاجتماعي البراجماتي وفهم التعبيرات المجازية.\n3. جلسات علاج وظيفي لتنظيم الاستجابات للمثيرات الحسية وتقليل الحركات النمطية.\n4. إرشاد أسري مستمر لتعميم المهارات السلوكية في المنزل.'
      : psychometrics.severityKey === 'moderate'
      ? '1. إدراج الطفل في برنامج تدخل سلوكي مكثف (ABA) لتعديل السلوكيات النمطية والحد من نوبات الغضب.\n2. برنامج تدريب على التواصل الوظيفي واستخدام الوسائل البصرية (Visual Schedules).\n3. جلسات تكامل حسي لمعالجة فرط التحسس السمعي واللمسي.\n4. تدريب الأقران ومرافقة الطفل في الأنشطة الاجتماعية التفاعلية.'
      : '1. برنامج تدخل علاجي وسلوكي شامل وفائق الكثافة (Comprehensive Intensive ABA Program).\n2. تدريب مكثف على التواصل المعزز والبديل (AAC / PECS) لتأسيس وسيلة تواصل وظيفية.\n3. خطة دعم سلوكي إيجابي (PBSP) للحد من السلوكيات القهرية وإيذاء الذات.\n4. بيئة صفية مهيأة حسياً لتقليل المثيرات المسببة للانهيار الانفعالي.\n5. متابعة دورية من فريق التأهيل متعدد التخصصات (MDT) وطبيب الأطفال النفسي.';

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية والتوصيات آلياً بدقة', 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً', 'er');
      return;
    }

    if (!form.date) {
      toast('⚠️ يرجى إدخال تاريخ التقييم', 'er');
      return;
    }

    const totalRequired = form.isVerbal ? 58 : 44;
    if (psychometrics.answeredCount < totalRequired) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.answeredCount} من أصل ${totalRequired} عبارة. هل تود حفظ المقياس كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'gars3',
      measureName: 'جيليام 3 (GARS-3) لتشخيص اضطراب طيف التوحد',
      scaleType: 'gars3',
      isVerbal: form.isVerbal,
      subscalesCount: form.isVerbal ? 6 : 4,
      totalRawScore: psychometrics.totalRawScore,
      sumScaledScores: psychometrics.sumScaledScores,
      autismQuotient: psychometrics.autismQuotient,
      percentile: psychometrics.overallPercentile,
      sem: psychometrics.overallSEM,
      score: psychometrics.autismQuotient, // For generic table display
      maxScore: 140,
      minScore: 43,
      percentage: psychometrics.completionPercentage,
      level: psychometrics.dsm5Level,
      probability: psychometrics.probability,
      supportLevel: psychometrics.supportLevel,
      severityKey: psychometrics.severityKey,
      severityColor: psychometrics.severityColor,
      results: form.scores,
      itemNotes: form.itemNotes,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      domainResults: psychometrics.domainResults,
      isComplete: psychometrics.isComplete,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم مقياس جيليام 3 بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ تقييم مقياس جيليام 3 بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl font-bold border border-white/20">
              📊
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>مقياس جيليام لتقدير اضطراب طيف التوحد - الإصدار الثالث (GARS-3)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-medium">
                  {form.isVerbal ? '6 مقاييس (ناطق)' : '4 مقاييس (غير ناطق)'}
                </span>
              </h2>
              <p className="text-xs text-teal-100 mt-0.5">
                مقنن وفق الدليل التشخيصي والإحصائي الخامس DSM-5 • للأعمار من 3 إلى 22 عاماً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              title="إغلاق"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* 1. Student Picker & Biodata */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/70">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span>👤</span> بيانات الحالة والفحص
            </h3>
            
            <StudentPicker
              form={form}
              setForm={setForm}
              students={students}
              showDob={true}
              showDiagnosis={true}
            />

            {/* Additional GARS-3 Case Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  الصف / المستوى الدراسي
                </label>
                <input
                  type="text"
                  value={form.grade || ''}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  placeholder="مثال: الروضة / الصف الأول"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  المدرسة / الروضة
                </label>
                <input
                  type="text"
                  value={form.school || ''}
                  onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                  placeholder="اسم المدرسة أو الروضة"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  اسم المقدر (ولي الأمر / المعلم)
                </label>
                <input
                  type="text"
                  value={form.raterName || ''}
                  onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                  placeholder="اسم القائم بالاستجابة"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  صلته بالطفل
                </label>
                <input
                  type="text"
                  value={form.raterRelation || ''}
                  onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                  placeholder="الأم / الأب / المعلمة"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  على علاقة بالطفل منذ
                </label>
                <input
                  type="text"
                  value={form.relationshipDuration || ''}
                  onChange={e => setForm(f => ({ ...f, relationshipDuration: e.target.value }))}
                  placeholder="مثال: منذ الولادة / سنة وشهرين"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  اسم الفاحص / الأخصائي
                </label>
                <input
                  type="text"
                  value={form.examinerName || ''}
                  onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                  placeholder="اسم الأخصائي النفسي"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  تاريخ التقييم
                </label>
                <input
                  type="date"
                  value={form.date || todayStr()}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 2. Scale Mode Switcher (Verbal vs Non-Verbal) */}
          <div className="bg-gradient-to-r from-slate-100 to-teal-50 dark:from-slate-800 dark:to-slate-800/90 p-4 rounded-xl border border-teal-200 dark:border-teal-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block mb-0.5">
                المرونة السيكومترية للمقياس (Psychometric Flexibility)
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                اختر نموذج التطبيق المناسب للحالة اللغوية للطفل:
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isVerbal: true }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  form.isVerbal
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>🗣️</span>
                <span>الأطفال الناطقون (6 مقاييس)</span>
              </button>

              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isVerbal: false }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  !form.isVerbal
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>🤫</span>
                <span>غير الناطقين (4 مقاييس أساسية)</span>
              </button>
            </div>
          </div>

          {/* 3. Live Psychometric Results Dashboard Card */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-teal-500/30 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">مؤشرات القياس اللحظية</span>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  لوحة الدرجات المعيارية ومعامل التوحد (AQ Dashboard)
                </h4>
              </div>

              {/* Severity Badge */}
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1.5 rounded-xl font-bold border ${psychometrics.severityBadgeClass}`}>
                  {psychometrics.dsm5Level}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                  {psychometrics.answeredCount} / {psychometrics.totalItemsCount} عبارة ({psychometrics.completionPercentage}%)
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">الدرجة الخام الكلية</span>
                <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                  {psychometrics.totalRawScore}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">مجموع المعيارية (Sum)</span>
                <span className="text-xl font-black text-teal-600 dark:text-teal-400">
                  {psychometrics.sumScaledScores}
                </span>
              </div>

              <div className="bg-teal-50 dark:bg-teal-950/40 p-2.5 rounded-xl border border-teal-200 dark:border-teal-800">
                <span className="text-xs text-teal-700 dark:text-teal-300 block mb-1 font-semibold">معامل التوحد (AQ)</span>
                <span className="text-2xl font-black text-teal-700 dark:text-teal-300">
                  {psychometrics.autismQuotient}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">الرتبة المئينية (Rank)</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {psychometrics.overallPercentile}%
                </span>
              </div>
            </div>

            {/* Subscales Quick Bar Indicators */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              {psychometrics.domainResults.map(d => (
                <div
                  key={d.id}
                  className="bg-white dark:bg-slate-900 p-2 rounded-lg border text-center shadow-2xs"
                  style={{ borderColor: d.color + '40' }}
                >
                  <span className="text-[11px] font-bold block truncate" style={{ color: d.color }}>
                    {d.code} - {d.name}
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-1 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">خام: {d.rawScore}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">معيارية: {d.scaledScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Domain Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveDomainFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeDomainFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              جميع البنود ({displayedDomains.reduce((acc, d) => acc + d.itemsCount, 0)})
            </button>

            {displayedDomains.map(d => {
              const res = psychometrics.domainResults.find(r => r.id === d.id);
              const isDomainComplete = res?.isComplete;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDomainFilter(d.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeDomainFilter === d.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <span>{d.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isDomainComplete ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {res?.answeredCount || 0}/{d.itemsCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Fill Helpers (for testing convenience) */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
            <span>تعبئة سريعة للتجربة:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => autoFillSample('none')}
                className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border hover:bg-slate-100 text-slate-700 dark:text-slate-300"
              >
                طبيعي
              </button>
              <button
                type="button"
                onClick={() => autoFillSample('mild')}
                className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 text-blue-700 dark:text-blue-300"
              >
                بسيط
              </button>
              <button
                type="button"
                onClick={() => autoFillSample('moderate')}
                className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-amber-700 dark:text-amber-300"
              >
                متوسط
              </button>
              <button
                type="button"
                onClick={() => autoFillSample('severe')}
                className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300"
              >
                شديد
              </button>
            </div>
          </div>

          {/* 5. GARS-3 Items Assessment Form */}
          <div className="space-y-4">
            {filteredItems.map(item => {
              const currentScore = form.scores[item.id];
              const isSelected = currentScore !== undefined && currentScore !== null;
              const domain = GARS3_DOMAINS.find(d => d.id === item.domainId);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-teal-300 dark:border-teal-700/70 shadow-sm'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 text-white"
                        style={{ backgroundColor: domain?.color || '#0d9488' }}
                      >
                        {item.id}
                      </span>
                      <div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 inline-block mb-1">
                          {item.domainCode} • {domain?.name}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                          {item.text}
                        </h4>
                      </div>
                    </div>

                    {/* Current Score Tag */}
                    {isSelected && (
                      <span className="self-end sm:self-auto text-xs px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-bold shrink-0">
                        الدرجة: {currentScore}
                      </span>
                    )}
                  </div>

                  {/* 4-point Options Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    {GARS3_RESPONSE_OPTIONS.map(opt => {
                      const active = currentScore === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleScoreSelect(item.id, opt.value)}
                          className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                            active
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-300 dark:ring-teal-900'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-50/50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-xs font-bold block mb-1">
                            {opt.label}
                          </span>
                          <span className={`text-[10px] line-clamp-2 leading-tight ${
                            active ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {opt.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Item Specific Clinical Notes */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="text-xs text-slate-400">📝 ملاحظة الفاحص:</span>
                    <input
                      type="text"
                      value={form.itemNotes[item.id] || ''}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      placeholder="سجل أمثلة سلوكية محددة أو ظروف الملاحظة لهذا البند..."
                      className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 6. Clinical Impression & Recommendations */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>📑</span> الخلاصة التشخيصية والتوصيات الإكلينيكية
              </h3>
              <button
                type="button"
                onClick={applyAutoClinicalSummary}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <span>✨</span>
                <span>توليد الخلاصة والتوصيات آلياً</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                التقرير والملخص النفسي والإكلينيكي
              </label>
              <textarea
                rows={5}
                value={form.clinicalSummary || ''}
                onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                placeholder="اكتب التقرير الإكلينيكي أو اضغط على زر التوليد الآلي..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                التوصيات التربوية والتأهيلية (Rehabilitation Recommendations)
              </label>
              <textarea
                rows={4}
                value={form.recommendations || ''}
                onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                placeholder="التوصيات والبرامج العلاجية المقترحة..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 leading-relaxed font-sans"
              />
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              معامل التوحد: <b className="text-teal-600 dark:text-teal-400 text-sm">{psychometrics.autismQuotient}</b>
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {psychometrics.dsm5Level}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 transition"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition flex items-center gap-1.5"
            >
              <span>💾</span>
              <span>حفظ نتيجة مقياس جيليام 3</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
