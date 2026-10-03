import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  RAVEN_COPYRIGHT_INFO,
  RAVEN_VERSIONS,
  RAVEN_SETS_META,
  RAVEN_CPM_ITEMS,
  RAVEN_SPM_ITEMS,
  RAVEN_CLASSIFICATION_GRADES,
  calculateRavenPsychometrics,
} from '../../data/ravenData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import { sanitizeAssessmentForm } from '../../utils/sanitize';

const EMPTY_RAVEN_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'الأخصائي النفسي / فاحص مقنن',
  examinerName: '',
  date: todayStr(),
  version: 'cpm', // 'cpm' | 'spm'
  notes: '',
  itemNotes: {},
  scores: {},
  rawOverrides: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function RavenAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
  onOpenIepBridge,
}) {
  const { toast, currentUser } = useApp();

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_RAVEN_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        rawOverrides: initialData.rawOverrides || {},
        itemNotes: initialData.itemNotes || {},
        version: initialData.version || initialData.ravenVersion || 'cpm',
      };
    }
    return {
      ...EMPTY_RAVEN_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeSetFilter, setActiveSetFilter] = useState('all');
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMode, setInputMode] = useState('items'); // 'items' | 'sets_direct'

  // Extract numeric age in years from form.age or dob
  const numericAge = useMemo(() => {
    if (form.dob) {
      const calculated = calcAge(form.dob);
      if (calculated && !isNaN(calculated)) return parseFloat(calculated);
    }
    if (form.age) {
      const parsed = parseFloat(String(form.age).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 8.0; // Default reference age
  }, [form.dob, form.age]);

  function handleSelectStudent(e) {
    const val = e.target.value;
    if (val === '__other__') {
      setForm(f => ({
        ...f,
        mode: 'other',
        stuId: '',
        studentName: '',
        dob: '',
        age: '',
        diagnosis: '',
        grade: '',
        school: '',
      }));
      return;
    }
    const stu = students.find(s => s.id === val);
    if (!stu) {
      setForm(f => ({ ...f, mode: 'registered', stuId: '', studentName: '' }));
      return;
    }

    const calculatedAge = stu.dob ? calcAge(stu.dob) : '';
    setForm(f => ({
      ...f,
      mode: 'registered',
      stuId: stu.id,
      studentName: stu.name || '',
      dob: stu.dob || '',
      age: calculatedAge ? `${calculatedAge} سنة` : '',
      diagnosis: stu.diagnosis || '',
      grade: stu.grade || stu.className || '',
      school: stu.school || stu.schoolName || '',
    }));
  }

  // Active items based on chosen version (CPM: 36, SPM: 60)
  const currentItems = useMemo(() => {
    return form.version === 'spm' ? RAVEN_SPM_ITEMS : RAVEN_CPM_ITEMS;
  }, [form.version]);

  const currentVersionMeta = useMemo(() => {
    return RAVEN_VERSIONS.find(v => v.id === form.version) || RAVEN_VERSIONS[0];
  }, [form.version]);

  // Real-time Psychometrics calculation
  const psychometrics = useMemo(() => {
    return calculateRavenPsychometrics(form.scores, form.rawOverrides, form.version, numericAge);
  }, [form.scores, form.rawOverrides, form.version, numericAge]);

  // Is Form Dirty (Unsaved Changes Guard check)
  const isDirty = useMemo(() => {
    return (
      Object.keys(form.scores).length > 0 ||
      Object.keys(form.rawOverrides).length > 0 ||
      Boolean(form.studentName) ||
      Boolean(form.clinicalSummary)
    );
  }, [form.scores, form.rawOverrides, form.studentName, form.clinicalSummary]);

  function safeClose() {
    if (isDirty) {
      if (
        window.confirm(
          '⚠️ تنبيه: لديك استجابات أو بيانات غير محفوظة في مقياس مصفوفات رافن (RPM). هل أنت متأكد من الخروج وإلغاء التعديلات؟'
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  function handleScoreSelect(itemId, isCorrect) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: isCorrect ? 1 : 0,
      },
    }));
  }

  function handleSetRawOverride(setId, rawVal) {
    setForm(prev => ({
      ...prev,
      rawOverrides: {
        ...prev.rawOverrides,
        [setId]: rawVal === '' ? '' : Math.min(12, Math.max(0, parseInt(rawVal, 10) || 0)),
      },
    }));
  }

  function handleTotalRawOverride(val) {
    const maxVal = currentVersionMeta.totalItems;
    setForm(prev => ({
      ...prev,
      rawOverrides: {
        ...prev.rawOverrides,
        total: val === '' ? '' : Math.min(maxVal, Math.max(0, parseInt(val, 10) || 0)),
      },
    }));
  }

  function handleVersionChange(newVersion) {
    if (Object.keys(form.scores).length > 0) {
      if (!window.confirm('تغيير النموذج (CPM / SPM) قد يتطلب إعادة مواءمة الاستجابات. هل ترغب في المتابعة؟')) {
        return;
      }
    }
    setForm(f => ({
      ...f,
      version: newVersion,
      scores: {},
      rawOverrides: {},
    }));
    setActiveSetFilter('all');
  }

  function autoFillSample(level = 'average') {
    const scores = {};
    const items = currentItems;
    items.forEach((it, idx) => {
      // Simulate typical progressive difficulty: earlier items are easier
      const itemPosInSet = (idx % 12) + 1;
      const setIdx = Math.floor(idx / 12); // 0, 1, 2...

      if (level === 'gifted') {
        // High accuracy across all sets
        scores[it.id] = (itemPosInSet <= 11 || Math.random() > 0.1) ? 1 : 0;
      } else if (level === 'average') {
        // Good on early sets, moderate on later items
        if (setIdx === 0) scores[it.id] = itemPosInSet <= 10 ? 1 : 0;
        else if (setIdx === 1) scores[it.id] = itemPosInSet <= 8 ? 1 : 0;
        else scores[it.id] = itemPosInSet <= 5 ? 1 : 0;
      } else if (level === 'borderline') {
        // Below average
        if (setIdx === 0) scores[it.id] = itemPosInSet <= 6 ? 1 : 0;
        else scores[it.id] = itemPosInSet <= 3 ? 1 : 0;
      } else {
        // Intellectual Disability
        scores[it.id] = (setIdx === 0 && itemPosInSet <= 3) ? 1 : 0;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast?.(
      `⚡ تم تعبئة استجابات نموذجية (${
        level === 'gifted'
          ? 'ذكاء متفوق وموهبة'
          : level === 'average'
          ? 'متوسط طبيعي'
          : level === 'borderline'
          ? 'أقل من المتوسط / بطء تعلم'
          : 'قصور معرفي واستدلالي'
      }) لمقياس رافن`,
      'ok'
    );
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.answeredCount < 6 && Object.keys(form.rawOverrides).length === 0) {
      toast?.('⚠️ يرجى تقييم 6 مصفوفات على الأقل أو إدخال الدرجات لتوليد التقرير السريري', 'er');
      return;
    }

    const setDetails = psychometrics.setResults
      .map(s => `• ${s.name}: درجة خام (${s.rawScore}/${s.maxRaw}) — [${s.cognitiveSkill}]`)
      .join('\n');

    const strengths =
      psychometrics.strengthSets.length > 0
        ? `نقاط القوة الاستدلالية البارزة:\n` +
          psychometrics.strengthSets.map(s => `- ${s.name} (${s.rawScore}/12)`).join('\n')
        : 'الأداء الاستدلالي متناسق حول المتوسط دون تباين مرتفع.';

    const deficits =
      psychometrics.deficitSets.length > 0
        ? `مجالات الاحتياج التي تتطلب تدريباً وتنمية:\n` +
          psychometrics.deficitSets.map(s => `- ${s.name} (${s.rawScore}/12)`).join('\n')
        : 'كافة مجموعات المقياس تقع في النطاق المقبول أو المرتفع.';

    const summary =
      `تقرير التقييم بمقياس مصفوفات رافن المتتابعة (${currentVersionMeta.name}):\n\n` +
      `- الدرجة الخام الإجمالية: (${psychometrics.totalRaw} من ${psychometrics.maxRawScore}).\n` +
      `- الرتبة المئينية المعيارية (Percentile Rank): (${psychometrics.percentile}%).\n` +
      `- مكافئ معامل الذكاء التقريبي (Equivalent IQ): (${psychometrics.equivalentIQ}).\n` +
      `- التصنيف الاستدلالي المعتمد: [${psychometrics.grade} - ${psychometrics.classification}].\n\n` +
      `الأداء على مجموعات المقياس:\n${setDetails}\n\n` +
      `${strengths}\n\n` +
      `${deficits}\n\n` +
      `الخلاصة الإكلينيكية والتشخيص:\n${psychometrics.clinicalImpression}`;

    setForm(f => ({
      ...f,
      clinicalSummary: summary,
      recommendations: psychometrics.recommendations,
    }));

    toast?.('✨ تم توليد الخلاصة السريرية والتوصيات بنجاح', 'ok');
  }

  function handleSave(andOpenBridge = false) {
    if (!validateStudentPick(form)) {
      toast?.('⚠️ يرجى اختيار أو كتابة اسم الطالب أولاً', 'er');
      return;
    }

    if (!form.date) {
      toast?.('يرجى تحديد تاريخ تطبيق المقياس', 'er');
      return;
    }

    const cleanedForm = sanitizeAssessmentForm(form);
    const payloadId = initialData?.id || form.id || uid();
    const studentIdVal = cleanedForm.stuId || cleanedForm.studentId || '';

    const payload = {
      ...cleanedForm,
      id: payloadId,
      assessmentId: payloadId,
      studentId: studentIdVal,
      stuId: studentIdVal,
      measureId: 'raven_rpm',
      scaleId: 'raven_rpm',
      scaleType: 'raven_rpm',
      measureName: `مقياس مصفوفات رافن (${currentVersionMeta.code}) للذكاء غير اللفظي`,
      measureNameEn: `Raven's Progressive Matrices (${currentVersionMeta.code})`,
      category: 'intelligence_cognitive',
      categoryName: 'مقاييس القدرات العقلية والذكاء',
      isRaven: true,
      ravenVersion: form.version,
      version: form.version,
      score: psychometrics.totalRaw,
      total: psychometrics.totalRaw,
      rawScore: psychometrics.totalRaw,
      maxScore: psychometrics.maxRawScore,
      percentile: psychometrics.percentile,
      overallPercentile: psychometrics.percentile,
      equivalentIQ: psychometrics.equivalentIQ,
      grade: psychometrics.grade,
      level: psychometrics.classification,
      shortClassification: psychometrics.shortClassification,
      color: psychometrics.severityColor,
      severityColor: psychometrics.severityColor,
      percentage: `${psychometrics.percentage}%`,
      percentageNum: psychometrics.percentage,
      results: form.scores,
      scores: form.scores,
      rawOverrides: form.rawOverrides,
      itemNotes: form.itemNotes,
      psychometrics,
      summary: form.clinicalSummary || psychometrics.clinicalImpression,
      clinicalSummary: form.clinicalSummary || psychometrics.clinicalImpression,
      recommendations: form.recommendations || psychometrics.recommendations,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast?.(`✅ تم تحديث نتيجة مقياس رافن بنجاح (المئين: ${psychometrics.percentile}%)`, 'ok');
    } else {
      lsAdd('studentAssessments', payload);
      toast?.(`🎉 تم حفظ تقييم مقياس مصفوفات رافن بنجاح (المئين: ${psychometrics.percentile}%)`, 'ok');
    }

    onSaved?.(payload);
    onClose?.();

    if (andOpenBridge && onOpenIepBridge) {
      onOpenIepBridge(payload);
    }
  }

  // Filter items by set & search
  const filteredItems = useMemo(() => {
    return currentItems.filter(it => {
      const matchSet = activeSetFilter === 'all' || it.set === activeSetFilter;
      const matchSearch =
        !searchQuery ||
        it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (it.iepGoal && it.iepGoal.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSet && matchSearch;
    });
  }, [currentItems, activeSetFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      dir="rtl"
      style={{ fontFamily: 'Tajawal, sans-serif' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl border border-white/20 shadow-inner">
              ▦
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                مقياس مصفوفات رافن المتتابعة للذكاء غير اللفظي (RPM)
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900 border border-emerald-300">
                  {currentVersionMeta.name}
                </span>
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                أداة قياس القدرة الاستدلالية العامة والتفكير المنطقي المجرد (جون رافن / Pearson)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={safeClose}
              type="button"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition mr-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          {/* IP Attribution Card */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 p-4 text-xs text-slate-700 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-blue-900">
                    📜 بطاقة توثيق المقياس والمرجعية العلمية (IP Attribution Card)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-semibold border border-blue-200">
                    Pearson Assessment
                  </span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  <strong>المؤلف والناشر الأصلي:</strong> د. جون رافن (John C. Raven) / Pearson Assessment. أداة مسحية معيارية خالية من التحيز الثقافي واللغوي لقياس القدرة العقلية العامة (g factor) والاستدلال التجريدي البصري (Educative Ability).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCopyrightDetails(v => !v)}
                className="shrink-0 px-2.5 py-1 rounded-md bg-white border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-50 transition"
              >
                {showCopyrightDetails ? 'إخفاء التفاصيل' : 'تفاصيل التوثيق ▾'}
              </button>
            </div>

            {showCopyrightDetails && (
              <div className="mt-3 pt-3 border-t border-blue-200/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] leading-relaxed animate-in fade-in">
                <div>
                  <span className="font-bold text-blue-950">الفئات المستهدفة: </span>
                  {RAVEN_COPYRIGHT_INFO.targetAge}
                </div>
                <div>
                  <span className="font-bold text-blue-950">طبيعة التقييم: </span>
                  {RAVEN_COPYRIGHT_INFO.diagnosticNature}
                </div>
                <div className="md:col-span-2 text-slate-500 italic">
                  {RAVEN_COPYRIGHT_INFO.notice}
                </div>
              </div>
            )}
          </div>

          {/* Model Switcher & Student Pick */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <span>👤</span> بيانات المستفيد ونموذج المصفوفات
              </span>

              {/* Version Toggle (CPM vs SPM) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {RAVEN_VERSIONS.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVersionChange(v.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      form.version === v.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">اختيار الطالب / المستفيد</label>
                <select
                  value={form.mode === 'other' ? '__other__' : form.stuId}
                  onChange={handleSelectStudent}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-hidden bg-slate-50/50"
                >
                  <option value="">— اختر من قائمة الطلاب —</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.dob ? `${calcAge(s.dob)} سنة` : s.age || '—'})
                    </option>
                  ))}
                  <option value="__other__">➕ إدخال يدوي لطالب آخر</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">اسم الطالب</label>
                <input
                  type="text"
                  value={form.studentName}
                  onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                  placeholder="اسم المفحوص كاملاً"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">العمر الزمني (سنوات)</label>
                <input
                  type="text"
                  value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  placeholder="مثال: 8.5"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">تاريخ التقييم</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">اسم الفاحص / الأخصائي</label>
                <input
                  type="text"
                  value={form.examinerName}
                  onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                  placeholder="الأخصائي النفسي"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">التشخيص / الملاحظات الأولية</label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                  placeholder="مثال: صعوبات تعلم / اضطراب لغوي"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">الصف والمدرسة / المركز</label>
                <input
                  type="text"
                  value={form.school}
                  onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                  placeholder="اسم المدرسة أو المركز التأهيلي"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Real-time Psychometrics Dashboard Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <span>📊</span> لوحة المؤشرات السيكومترية الفورية لمصفوفات رافن
              </span>
              <span className="text-xs text-slate-500">
                العمر المعتمد للمعايرة: <strong className="text-slate-800">{numericAge} سنة</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">الدرجة الخام الكلية</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {psychometrics.totalRaw}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {psychometrics.maxRawScore}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">نسبة الإنجاز: {psychometrics.percentage}%</div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="text-xs text-blue-700 font-semibold">الرتبة المئينية (Percentile)</div>
                <div className="text-2xl font-black text-blue-900 mt-1">
                  {psychometrics.percentile}%
                </div>
                <div className="text-[11px] text-blue-600 mt-0.5">المئين المعياري للعمر</div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
                <div className="text-xs text-indigo-700 font-semibold">مكافئ معامل الذكاء (IQ)</div>
                <div className="text-2xl font-black text-indigo-900 mt-1">
                  {psychometrics.equivalentIQ}
                </div>
                <div className="text-[11px] text-indigo-600 mt-0.5">مكافئ الذكاء التقريبي</div>
              </div>

              <div
                className="p-3 rounded-xl border flex flex-col justify-center"
                style={{
                  background: psychometrics.severityBg,
                  borderColor: psychometrics.severityBorder,
                }}
              >
                <div className="text-xs font-bold" style={{ color: psychometrics.severityColor }}>
                  {psychometrics.grade}
                </div>
                <div className="text-sm font-black mt-1 leading-tight" style={{ color: psychometrics.severityColor }}>
                  {psychometrics.shortClassification}
                </div>
                <div className="text-[10px] mt-0.5 text-slate-600 truncate" title={psychometrics.classification}>
                  {psychometrics.classification}
                </div>
              </div>
            </div>

            {/* Set by Set Breakdown Bar */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-700 mb-2">توزيع الأداء على مجموعات المصفوفات:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {psychometrics.setResults.map(s => (
                  <div
                    key={s.setId}
                    className="p-2.5 rounded-lg border bg-slate-50/80 flex flex-col justify-between text-xs"
                    style={{ borderRight: `4px solid ${s.color}` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{s.setId}</span>
                      <span className="font-black text-slate-900">
                        {s.rawScore} <span className="text-[10px] text-slate-400">/ 12</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-1" title={s.cognitiveSkill}>
                      {s.cognitiveSkill}
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${s.percentage}%`, background: s.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assessment Mode Switch & Sample Auto-Fill Buttons */}
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">نمط الإدخال:</span>
              <button
                type="button"
                onClick={() => setInputMode('items')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  inputMode === 'items'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📝 استجابة كل مصفوفة بنداً بنداً ({currentItems.length} بنداً)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('sets_direct')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  inputMode === 'sets_direct'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ⚡ إدخال مباشر لدرجات المجموعات / الخام الإجمالي
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500 font-semibold">تعبئة نموذجية سريعة:</span>
              <button
                type="button"
                onClick={() => autoFillSample('gifted')}
                className="px-2 py-1 text-[11px] font-bold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-200"
              >
                فائق / موهبة
              </button>
              <button
                type="button"
                onClick={() => autoFillSample('average')}
                className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
              >
                متوسط
              </button>
              <button
                type="button"
                onClick={() => autoFillSample('borderline')}
                className="px-2 py-1 text-[11px] font-bold rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200"
              >
                أقل من المتوسط
              </button>
              <button
                type="button"
                onClick={() => autoFillSample('impaired')}
                className="px-2 py-1 text-[11px] font-bold rounded bg-red-50 text-red-700 hover:bg-red-100 transition border border-red-200"
              >
                قصور
              </button>
            </div>
          </div>

          {/* Direct Score Override Mode */}
          {inputMode === 'sets_direct' && (
            <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-sm text-slate-800">
                  إدخال الدرجات الخام مباشرة لكل مجموعة أو الإجمالي
                </span>
                <span className="text-xs text-slate-500">الدرجة القصوى لكل مجموعة: 12</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {currentVersionMeta.sets.map(setId => {
                  const meta = RAVEN_SETS_META[setId];
                  return (
                    <div key={setId} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="font-bold text-xs text-slate-700">المجموعة {setId}</div>
                      <div className="text-[10px] text-slate-500 truncate" title={meta.name}>
                        {meta.name}
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={form.rawOverrides[setId] ?? ''}
                        onChange={e => handleSetRawOverride(setId, e.target.value)}
                        placeholder="0 - 12"
                        className="mt-2 w-full text-center font-bold text-base rounded-lg border border-slate-300 p-1.5 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  );
                })}

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <div className="font-bold text-xs text-blue-900">الخام الإجمالي</div>
                  <div className="text-[10px] text-blue-600">من {currentVersionMeta.totalItems}</div>
                  <input
                    type="number"
                    min="0"
                    max={currentVersionMeta.totalItems}
                    value={form.rawOverrides.total ?? ''}
                    onChange={e => handleTotalRawOverride(e.target.value)}
                    placeholder={`0 - ${currentVersionMeta.totalItems}`}
                    className="mt-2 w-full text-center font-black text-base rounded-lg border border-blue-300 p-1.5 focus:border-blue-600 focus:outline-hidden text-blue-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Item-by-Item Mode */}
          {inputMode === 'items' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
              {/* Filter by Set & Search */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700">المجموعة:</span>
                  <button
                    type="button"
                    onClick={() => setActiveSetFilter('all')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      activeSetFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    الكل ({currentItems.length})
                  </button>
                  {currentVersionMeta.sets.map(setId => (
                    <button
                      key={setId}
                      type="button"
                      onClick={() => setActiveSetFilter(setId)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                        activeSetFilter === setId
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      المجموعة {setId}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="بحث في المصفوفات أو الأهداف..."
                    className="w-full rounded-lg border border-slate-200 p-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredItems.map(item => {
                  const currentScore = form.scores[item.id];
                  const isAnswered = currentScore !== undefined && currentScore !== '';
                  const isCorrect = currentScore === 1 || currentScore === '1';
                  const setMeta = RAVEN_SETS_META[item.set];

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isAnswered
                          ? isCorrect
                            ? 'bg-emerald-50/40 border-emerald-300'
                            : 'bg-rose-50/40 border-rose-300'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold text-white shadow-xs"
                              style={{ background: setMeta.color }}
                            >
                              {item.title}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {item.prompt}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            <strong>هدف الخطة الفردية (IEP):</strong> {item.iepGoal}
                          </div>
                        </div>

                        {/* Quick Scoring Buttons: Correct (1) or Incorrect (0) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleScoreSelect(item.id, true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              isAnswered && isCorrect
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <span>✓</span> صواب (1)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScoreSelect(item.id, false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              isAnswered && !isCorrect
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            <span>✗</span> خطأ (0)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clinical Narrative Summary & IEP Recommendations */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <span>📝</span> التقرير التشخيصي وتوصيات الخطة التربوية الفردية (IEP)
              </span>
              <button
                type="button"
                onClick={applyAutoClinicalSummary}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>✨</span> توليد الخلاصة السريرية والتوصيات آلياً
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  الخلاصة الإكلينيكية وتفسير الأداء الاستدلالي
                </label>
                <textarea
                  rows={5}
                  value={form.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="انقر فوق زر 'توليد الخلاصة آلياً' أو اكتب الملاحظات السريرية للفاحص..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-hidden leading-relaxed font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  توصيات التدخل وأهداف الخطة الفردية (IEP Bridge)
                </label>
                <textarea
                  rows={5}
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="التوصيات التربوية والتدخلية المساندة للمفحوص..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-hidden leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>الدرجة الإجمالية:</span>
            <strong className="text-slate-900 text-sm">
              {psychometrics.totalRaw} / {psychometrics.maxRawScore}
            </strong>
            <span>·</span>
            <span>المئين:</span>
            <strong className="text-blue-700 text-sm">{psychometrics.percentile}%</strong>
            <span>·</span>
            <span
              className="px-2 py-0.5 rounded text-[11px] font-bold"
              style={{ background: psychometrics.severityBg, color: psychometrics.severityColor }}
            >
              {psychometrics.shortClassification}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenIepBridge && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                title="حفظ نتيجة المقياس ونقل الأهداف إلى جسر الخطة التربوية الفردية"
              >
                <span>🎯</span> حفظ ونقل إلى جسر الخطة (IEP)
              </button>
            )}

            <button
              type="button"
              onClick={safeClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <span>💾</span> حفظ نتيجة التقييم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
