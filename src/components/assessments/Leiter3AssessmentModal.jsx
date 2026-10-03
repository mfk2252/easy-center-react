import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  LEITER3_ITEMS,
  LEITER3_BATTERIES,
  LEITER3_SUBTESTS,
  LEITER3_RESPONSE_OPTIONS,
  LEITER3_COPYRIGHT_INFO,
  calculateLeiter3Psychometrics,
} from '../../data/leiter3Data';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import { sanitizeAssessmentForm } from '../../utils/sanitize';

const EMPTY_LEITER3_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'الأخصائي النفسي / الإكلينيكي',
  examinerName: '',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  rawOverrides: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function Leiter3AssessmentModal({
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
        ...EMPTY_LEITER3_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        rawOverrides: initialData.rawOverrides || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_LEITER3_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeBatteryFilter, setActiveBatteryFilter] = useState('all'); // 'all' | 'cognitive' | 'attention_memory'
  const [activeSubtestFilter, setActiveSubtestFilter] = useState('all');
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('items'); // 'items' | 'subtests_raw'

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
      diagnosis: stu.diagnosis || stu.disabilityType || '',
      school: stu.school || '',
      grade: stu.grade || '',
      raterName: stu.fatherName || stu.guardianName || '',
    }));
  }

  // Is Form Dirty (Guard check)
  const isDirty = useMemo(() => {
    return (
      Object.keys(form.scores).length > 0 ||
      Object.keys(form.rawOverrides).length > 0 ||
      Boolean(form.studentName) ||
      Boolean(form.clinicalSummary)
    );
  }, [form]);

  function safeClose() {
    if (isDirty) {
      if (window.confirm('⚠️ لديك استجابات أو بيانات غير محفوظة في مقياس ليتر-3. هل أنت متأكد من الخروج وإلغاء التعديلات؟')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

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

  function handleRawOverrideChange(subtestId, rawVal) {
    setForm(prev => ({
      ...prev,
      rawOverrides: {
        ...prev.rawOverrides,
        [subtestId]: rawVal,
      },
    }));
  }

  function autoFillSample(level = 'average') {
    const scores = {};
    LEITER3_ITEMS.forEach(it => {
      if (level === 'gifted') {
        scores[it.id] = it.id % 4 === 0 ? 2 : 3;
      } else if (level === 'average') {
        scores[it.id] = it.id % 3 === 0 ? 3 : it.id % 2 === 0 ? 2 : 1;
      } else if (level === 'borderline') {
        scores[it.id] = it.id % 2 === 0 ? 1 : it.id % 3 === 0 ? 2 : 0;
      } else {
        // Intellectual Disability
        scores[it.id] = it.id % 4 === 0 ? 1 : 0;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast?.(
      `⚡ تم تعبئة استجابات نموذجية (${
        level === 'gifted'
          ? 'موهبة وتفوق'
          : level === 'average'
          ? 'متوسط طبيعي'
          : level === 'borderline'
          ? 'حدّي / بطء تعلم'
          : 'قصور فكري'
      }) لمقياس Leiter-3`,
      'ok'
    );
  }

  // Real-time Psychometrics calculation
  const psychometrics = useMemo(() => {
    return calculateLeiter3Psychometrics(form.scores, form.rawOverrides);
  }, [form.scores, form.rawOverrides]);

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 6 && Object.keys(form.rawOverrides).length < 2) {
      toast?.('⚠️ يرجى تقييم 6 بنود على الأقل أو إدخال درجات الاختبارات لتوليد التقرير السريري', 'er');
      return;
    }

    const subtestSummary = psychometrics.subtestResults
      .map(st => {
        return `• ${st.name} (${st.code}): درجة خام (${st.rawScore}/${st.maxRawScore}) · درجة معيارية (${st.scaledScore}/19) — [${st.qualitativeDesc}]`;
      })
      .join('\n');

    const strengths =
      psychometrics.strengthSubtests.length > 0
        ? `نقاط القوة البصرية غير اللفظية البارزة:\n` +
          psychometrics.strengthSubtests.map(s => `- ${s.name} (معيارية ${s.scaledScore})`).join('\n')
        : 'الأداء المعرفي متناسق حول المتوسط دون تباين حاد.';

    const deficits =
      psychometrics.deficitSubtests.length > 0
        ? `مجالات الاحتياج التي تتطلب دعماً وتكييفاً فردياً:\n` +
          psychometrics.deficitSubtests.map(s => `- ${s.name} (معيارية ${s.scaledScore})`).join('\n')
        : 'جميع المقاييس الفرعية تقع ضمن النطاق المقبول أو المتوسط.';

    const summary =
      `تقرير التقييم النفسي والذكاء غير اللفظي بمقياس ليتر-3 (Leiter-3) المقنن:\n\n` +
      `- معامل الذكاء غير اللفظي الكلي (Nonverbal IQ - NVIQ): (${psychometrics.nviq}) برتبة مئينية (${psychometrics.nviqPercentile}%).\n` +
      `- مؤشر الانتباه والذاكرة (Attention & Memory Index - AMI): (${psychometrics.ami}) برتبة مئينية (${psychometrics.amiPercentile}%).\n` +
      `- التصنيف الإكلينيكي المعتمد: [${psychometrics.classification}].\n\n` +
      `الأداء على الاختبارات الفرعية للبطاريتين:\n${subtestSummary}\n\n` +
      `${strengths}\n\n` +
      `${deficits}\n\n` +
      `الانطباع الإكلينيكي والتفسير السيكومتري:\n${psychometrics.clinicalImpression}`;

    setForm(f => ({
      ...f,
      clinicalSummary: summary,
      recommendations: psychometrics.recommendations,
    }));

    toast?.('✨ تم توليد التقرير السريري والتوصيات بنجاح', 'ok');
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

    const payloadId = initialData?.id || form.id || uid();
    const studentIdVal = form.stuId || form.studentId || '';

    const payload = sanitizeAssessmentForm({
      ...form,
      id: payloadId,
      assessmentId: payloadId,
      studentId: studentIdVal,
      stuId: studentIdVal,
      scaleType: 'leiter3',
      measureId: 'leiter_3',
      measureName: 'مقياس ليتر العالمي للتقييم غير اللفظي — الإصدار الثالث (Leiter-3)',
      category: 'intelligence_cognitive',
      categoryName: 'مقاييس القدرات العقلية والذكاء',
      isLeiter3: true,
      nviq: psychometrics.nviq,
      nviqPercentile: psychometrics.nviqPercentile,
      ami: psychometrics.ami,
      amiPercentile: psychometrics.amiPercentile,
      score: psychometrics.nviq,
      total: psychometrics.nviq,
      maxScore: 160,
      percentage: `${psychometrics.completionPercentage}%`,
      percentageNum: psychometrics.completionPercentage,
      level: psychometrics.classification,
      color: psychometrics.severityColor,
      severityColor: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      rawOverrides: form.rawOverrides,
      psychometrics,
      summary: form.clinicalSummary || psychometrics.clinicalImpression,
      recommendations: form.recommendations || psychometrics.recommendations,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast?.('✅ تم تحديث تقييم مقياس ليتر-3 بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', payload);
      toast?.('🎉 تم حفظ تقييم مقياس ليتر-3 بنجاح', 'ok');
    }

    onSaved?.(payload);
    onClose();

    if (andOpenBridge && onOpenIepBridge) {
      onOpenIepBridge(payload);
    }
  }

  const filteredItems = useMemo(() => {
    return LEITER3_ITEMS.filter(it => {
      const matchBattery = activeBatteryFilter === 'all' || it.batteryId === activeBatteryFilter;
      const matchSubtest = activeSubtestFilter === 'all' || it.subtestId === activeSubtestFilter;
      const matchQuery =
        !searchQuery ||
        it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.subtest.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBattery && matchSubtest && matchQuery;
    });
  }, [activeBatteryFilter, activeSubtestFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      dir="rtl"
      style={{ fontFamily: 'Tajawal, sans-serif' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-2xl border border-white/20 shadow-inner">
              🧩
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">
                  مقياس ليتر العالمي للتقييم غير اللفظي — الإصدار الثالث
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-900 border border-cyan-300 shadow-2xs">
                  Leiter-3
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/15 text-white">
                  Stoelting Co.
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5 font-medium">
                بطارية التقييم السيكومتري غير اللفظي التام (الذكاء NVIQ + الانتباه والذاكرة AMI)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCopyrightDetails(!showCopyrightDetails)}
              type="button"
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition flex items-center gap-1 font-semibold border border-white/20"
              title="توثيق الملكية الفكرية والاعتماد"
            >
              <span>🛡️</span> الملكية الفكرية
            </button>
            <button
              onClick={safeClose}
              type="button"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition mr-1"
              title="إغلاق"
            >
              ✕
            </button>
          </div>
        </div>

        {/* IP Attribution Card Collapsible */}
        {showCopyrightDetails && (
          <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-3 text-xs text-indigo-950 shrink-0">
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-1.5 text-indigo-900">
                <span>🛡️</span> بطاقة توثيق الملكية الفكرية والاعتماد الإكلينيكي:
              </span>
              <span className="text-[11px] font-mono text-indigo-700">Stoelting Company / Gale H. Roid, Ph.D.</span>
            </div>
            <p className="leading-relaxed text-indigo-800 text-[11px]">
              {LEITER3_COPYRIGHT_INFO.notice} {LEITER3_COPYRIGHT_INFO.disclaimer}
            </p>
          </div>
        )}

        {/* Live Gauges Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            {/* NVIQ Metric */}
            <div className="flex items-baseline gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/15">
              <span className="text-slate-300 font-medium">معامل الذكاء غير اللفظي (NVIQ):</span>
              <span className="text-base font-black text-cyan-300">{psychometrics.nviq}</span>
              <span className="text-[10px] text-slate-400">({psychometrics.nviqPercentile}%)</span>
            </div>

            {/* AMI Metric */}
            <div className="flex items-baseline gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/15">
              <span className="text-slate-300 font-medium">مؤشر الانتباه والذاكرة (AMI):</span>
              <span className="text-base font-black text-amber-300">{psychometrics.ami}</span>
              <span className="text-[10px] text-slate-400">({psychometrics.amiPercentile}%)</span>
            </div>

            {/* Classification */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">التصنيف الإكلينيكي:</span>
              <span
                className="font-extrabold px-2.5 py-0.5 rounded text-[11px]"
                style={{ backgroundColor: `${psychometrics.severityColor}33`, color: '#38bdf8' }}
              >
                {psychometrics.classification}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">
              البنود المقيّمة: {psychometrics.totalAnswered} / {psychometrics.totalItems} ({psychometrics.completionPercentage}%)
            </span>
            <div className="w-24 bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-300"
                style={{ width: `${psychometrics.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Workstation Layout */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/60">
          {/* Student Picker & Demographics */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <span>👤</span> بيانات المفحوص وجلسة التقييم:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">المفحوص / الطالب:</label>
                <select
                  value={form.mode === 'other' ? '__other__' : form.stuId}
                  onChange={handleSelectStudent}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">— اختر طالباً مسجلاً —</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.diagnosis ? `(${s.diagnosis})` : ''}
                    </option>
                  ))}
                  <option value="__other__">➕ طالب / مفحوص آخر (يدوي)</option>
                </select>
              </div>

              {form.mode === 'other' ? (
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">اسم المفحوص:</label>
                  <input
                    type="text"
                    value={form.studentName}
                    onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="الاسم الكامل"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">العمر الزمني:</label>
                  <input
                    type="text"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium bg-slate-50"
                    placeholder="مثال: 8 سنوات"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">التشخيص / الحالة:</label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="مثال: طيف توحد / اضطراب لغوي"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">الفاحص / الأخصائي:</label>
                <input
                  type="text"
                  value={form.examinerName}
                  onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="اسم الأخصائي"
                />
              </div>
            </div>
          </div>

          {/* Quick Profile Samples & Mode Toggle Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <span>⚡</span> تعبئة سريعة نموذجية:
              </span>
              <button
                type="button"
                onClick={() => autoFillSample('gifted')}
                className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200"
              >
                موهبة (130+)
              </button>
              <button
                type="button"
                onClick={() => autoFillSample('average')}
                className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition border border-emerald-200"
              >
                متوسط (100)
              </button>
              <button
                type="button"
                onClick={() => autoFillSample('borderline')}
                className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition border border-amber-200"
              >
                حدّي (75)
              </button>
              <button
                type="button"
                onClick={() => autoFillSample('id')}
                className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200"
              >
                قصور فكري (&lt;70)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">طريقة التقييم:</span>
              <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('items')}
                  className={`px-3 py-1 rounded-md transition ${
                    viewMode === 'items' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  بنود المقياس (28 بنداً)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('subtests_raw')}
                  className={`px-3 py-1 rounded-md transition ${
                    viewMode === 'subtests_raw' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  إدخال الدرجات الخام المباشرة (7 اختبارات)
                </button>
              </div>
            </div>
          </div>

          {/* Subtest Raw Entry Mode */}
          {viewMode === 'subtests_raw' ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    إدخال الدرجات الخام المباشرة للاختبارات الفرعية (Leiter-3 Subtests Raw Scores)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    أدخل الدرجة الخام المحققة في كل اختبار فرعي ليتم تحويلها تلقائياً إلى معيارية (1-19) وحساب NVIQ و AMI
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cognitive Battery Subtests */}
                <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/30 space-y-3">
                  <h4 className="text-xs font-black text-indigo-900 flex items-center justify-between">
                    <span>🧩 بطارية الذكاء المعرفي (Cognitive Battery):</span>
                    <span className="text-[11px] text-indigo-600">تحدد نسبة الذكاء غير اللفظي NVIQ</span>
                  </h4>
                  {LEITER3_SUBTESTS.filter(s => s.batteryId === 'cognitive').map(st => {
                    const currentRes = psychometrics.subtestResults.find(r => r.subtestId === st.id);
                    return (
                      <div key={st.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-xs text-slate-800">{st.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{st.nameEn}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500">الدرجة الخام (0-{st.maxRawScore}):</label>
                          <input
                            type="number"
                            min="0"
                            max={st.maxRawScore}
                            value={form.rawOverrides[st.id] ?? currentRes?.rawScore ?? ''}
                            onChange={e => handleRawOverrideChange(st.id, e.target.value)}
                            className="w-16 border border-slate-300 rounded-md p-1.5 text-center font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            placeholder="0"
                          />
                          <span className="text-xs font-extrabold px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                            معيارية: {currentRes?.scaledScore || 10}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Attention & Memory Battery Subtests */}
                <div className="border border-cyan-200 rounded-xl p-4 bg-cyan-50/30 space-y-3">
                  <h4 className="text-xs font-black text-cyan-900 flex items-center justify-between">
                    <span>🎯 بطارية الانتباه والذاكرة (Attention & Memory Battery):</span>
                    <span className="text-[11px] text-cyan-600">تحدد مؤشر الذاكرة والانتباه AMI</span>
                  </h4>
                  {LEITER3_SUBTESTS.filter(s => s.batteryId === 'attention_memory').map(st => {
                    const currentRes = psychometrics.subtestResults.find(r => r.subtestId === st.id);
                    return (
                      <div key={st.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-xs text-slate-800">{st.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{st.nameEn}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500">الدرجة الخام (0-{st.maxRawScore}):</label>
                          <input
                            type="number"
                            min="0"
                            max={st.maxRawScore}
                            value={form.rawOverrides[st.id] ?? currentRes?.rawScore ?? ''}
                            onChange={e => handleRawOverrideChange(st.id, e.target.value)}
                            className="w-16 border border-slate-300 rounded-md p-1.5 text-center font-bold text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                            placeholder="0"
                          />
                          <span className="text-xs font-extrabold px-2 py-1 rounded bg-cyan-100 text-cyan-800">
                            معيارية: {currentRes?.scaledScore || 10}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Items-by-Item Evaluation Mode */
            <div className="space-y-4">
              {/* Battery Filter Tabs & Search */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => { setActiveBatteryFilter('all'); setActiveSubtestFilter('all'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeBatteryFilter === 'all'
                        ? 'bg-indigo-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    الكل (28 بنداً)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveBatteryFilter('cognitive'); setActiveSubtestFilter('all'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      activeBatteryFilter === 'cognitive'
                        ? 'bg-indigo-700 text-white shadow-2xs'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    <span>🧩</span> بطارية الذكاء NVIQ (16 بنداً)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveBatteryFilter('attention_memory'); setActiveSubtestFilter('all'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      activeBatteryFilter === 'attention_memory'
                        ? 'bg-cyan-700 text-white shadow-2xs'
                        : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                    }`}
                  >
                    <span>🎯</span> الانتباه والذاكرة AMI (12 بنداً)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="🔍 تصفية البنود والمهمات..."
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs w-48 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {filteredItems.map(item => {
                  const currentScore = form.scores[item.id];
                  const hasAnswer = currentScore !== undefined && currentScore !== null && currentScore !== '';
                  const subtestMeta = LEITER3_SUBTESTS.find(s => s.id === item.subtestId);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all duration-150 ${
                        hasAnswer
                          ? 'bg-white border-slate-200 shadow-2xs'
                          : 'bg-slate-50/90 border-dashed border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-start gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center shrink-0">
                            {item.id}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-extrabold text-slate-900">{item.title}</h4>
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: item.batteryId === 'cognitive' ? '#eef2ff' : '#ecfeff',
                                  color: item.batteryId === 'cognitive' ? '#4338ca' : '#0e7490',
                                }}
                              >
                                {subtestMeta?.name || item.subtest}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                          </div>
                        </div>

                        {/* Response Options */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {LEITER3_RESPONSE_OPTIONS.map(opt => {
                            const isSelected = Number(currentScore) === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleScoreSelect(item.id, opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                  isSelected
                                    ? opt.value === 3
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : opt.value === 2
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : opt.value === 1
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title={opt.description}
                              >
                                <span>{opt.value}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Item IEP Goal Note */}
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/60 mt-2 flex items-center justify-between">
                        <span>🎯 الهدف المرتبط بالخطة: {item.iepGoal}</span>
                        <input
                          type="text"
                          value={form.itemNotes[item.id] || ''}
                          onChange={e => handleItemNoteChange(item.id, e.target.value)}
                          placeholder="ملاحظة خاصة بالبند..."
                          className="text-[11px] border border-slate-300 rounded px-2 py-0.5 bg-white w-44 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clinical Summary & Recommendations Generator */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>📝</span> التقرير السريري والتوصيات (Clinical Impression & IEP Bridge):
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  توليد تقرير تشخيصي شامل في ضوء نتائج البطاريتين مع اشتقاق مباشر للأهداف
                </p>
              </div>

              <button
                type="button"
                onClick={applyAutoClinicalSummary}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
              >
                <span>✨</span> توليد التقرير السريري تلقائياً
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  التقرير السريري وتفسير نسبة الذكاء غير اللفظي:
                </label>
                <textarea
                  rows={6}
                  value={form.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="سيظهر التقرير هنا تلقائياً أو يمكنك كتابة ملاحظاتك الإكلينيكية..."
                  className="w-full border border-slate-300 rounded-lg p-3 text-xs leading-relaxed font-sans focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  التوصيات التربوية للخطة الفردية (IEP):
                </label>
                <textarea
                  rows={6}
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="التوصيات والتدخلات التعليمية المقترحة للطالب..."
                  className="w-full border border-slate-300 rounded-lg p-3 text-xs leading-relaxed font-sans focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span>الذكاء غير اللفظي (NVIQ):</span>
            <strong className="text-indigo-800 text-sm font-black">{psychometrics.nviq}</strong>
            <span className="text-slate-400">|</span>
            <span>مؤشر الانتباه (AMI):</span>
            <strong className="text-cyan-800 text-sm font-black">{psychometrics.ami}</strong>
          </div>

          <div className="flex items-center gap-2">
            {onOpenIepBridge && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <span>🎯</span> حفظ ونقل إلى جسر الخطة (IEP)
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition shadow-xs"
            >
              💾 حفظ النتيجة والتقييم
            </button>

            <button
              type="button"
              onClick={safeClose}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
            >
              إلغاء وخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
