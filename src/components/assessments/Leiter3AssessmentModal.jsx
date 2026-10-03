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
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);
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
    <div className="mbg" onClick={e => e.target === e.currentTarget && safeClose()}>
      <div
        className="mb"
        style={{
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          width: '100%',
        }}
      >
        {/* MODAL MAIN HEADER */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 50%, #1e1b4b 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🧩</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس ليتر العالمي للتقييم غير اللفظي (Leiter-3)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  الإصدار الثالث · NVIQ & AMI
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#0f172a', color: '#a5b4fc', fontSize: '0.68rem', fontWeight: 800 }}>
                  © Stoelting Company / Gale H. Roid
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  بطارية التقييم السيكومتري غير اللفظي التام لقياس القدرات العقلية والانتباه
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setShowCopyrightDetails(s => !s)}
              style={{
                background: showCopyrightDetails ? '#fff' : 'rgba(255,255,255,0.2)',
                color: showCopyrightDetails ? '#3730a3' : '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء حقوق الملكية' : 'حقوق الملكية الفكرية'}
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={safeClose}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700 }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* EXPANDABLE COPYRIGHT & IP ATTRIBUTION CARD */}
        {showCopyrightDetails && (
          <div
            style={{
              background: '#eef2ff',
              padding: '14px 20px',
              borderBottom: '2px solid #a5b4fc',
              fontSize: '0.82rem',
              color: '#312e81',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس ليتر-3 (Leiter-3):
            </div>

            <div
              style={{
                background: '#e0e7ff',
                border: '1px solid #c7d2fe',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#3730a3',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار حقوق الملكية والاعتماد:</strong> مقياس ليتر العالمي 3 — إعداد د. جيل رويد وآخرون · الناشر الدولي: Stoelting Company.
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#c7d2fe', color: '#312e81', padding: '3px 8px', borderRadius: 6, border: '1px solid #a5b4fc', fontWeight: 700 }}>
                بطارية تقييم سيكومتري غير لفظي مقننة
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#3730a3', background: '#e0e7ff', padding: '8px 12px', borderRadius: 8 }}>
              {LEITER3_COPYRIGHT_INFO.notice} {LEITER3_COPYRIGHT_INFO.disclaimer}
            </div>
          </div>
        )}

        {/* REAL-TIME DIAGNOSTIC PSYCHOMETRICS STRIP */}
        <div
          className="modal-subbar"
          style={{
            background: 'var(--g0)',
            padding: '10px 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* NVIQ Metric */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1.5px solid #0284c7', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>معامل الذكاء غير اللفظي (NVIQ):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>
                {psychometrics.nviq} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>({psychometrics.nviqPercentile}%)</small>
              </span>
            </div>

            {/* AMI Metric */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1.5px solid #d97706', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>مؤشر الانتباه والذاكرة (AMI):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#d97706' }}>
                {psychometrics.ami} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>({psychometrics.amiPercentile}%)</small>
              </span>
            </div>

            {/* Classification Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>التصنيف الإكلينيكي:</span>
              <span className="bdg b-bl" style={{ fontWeight: 800, fontSize: '0.78rem' }}>
                {psychometrics.classification}
              </span>
            </div>

            {/* Completion */}
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)' }}>
              البنود المقيّمة: {psychometrics.totalAnswered} / {psychometrics.totalItems} ({psychometrics.completionPercentage}%)
            </div>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>⚡ تجربة:</span>
            <button type="button" className="btn btn-xs" onClick={() => autoFillSample('gifted')} style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', fontSize: '.72rem' }}>موهبة (130+)</button>
            <button type="button" className="btn btn-xs" onClick={() => autoFillSample('average')} style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontSize: '.72rem' }}>متوسط (100)</button>
            <button type="button" className="btn btn-xs" onClick={() => autoFillSample('borderline')} style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74', fontSize: '.72rem' }}>حدّي (75)</button>
            <button type="button" className="btn btn-xs" onClick={() => autoFillSample('id')} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '.72rem' }}>قصور فكري (&lt;70)</button>
          </div>
        </div>

        {/* MODAL MAIN BODY SCROLLABLE */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          {/* STUDENT & ASSESSMENT INFO CARD */}
          <div
            style={{
              background: 'var(--g0)',
              padding: '10px 14px',
              borderRadius: 10,
              marginBottom: 14,
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isHeaderCollapsed ? 0 : 8,
              }}
            >
              <div
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#3730a3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>👤</span>
                <span>بيانات المفحوص وجلسة التقييم</span>
                {form.studentName && (
                  <span
                    style={{
                      fontSize: '0.76rem',
                      background: '#e0e7ff',
                      color: '#3730a3',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontWeight: 700,
                    }}
                  >
                    {form.studentName}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsManualEdit(prev => !prev)}
                  className="btn btn-xs btn-g"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', height: 24 }}
                  title="تفعيل التعديل اليدوي على البيانات المجلوبة تلقائياً"
                >
                  {isManualEdit ? '🔒 قفل التعديل' : '✏️ تعديل يدوي'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsHeaderCollapsed(prev => !prev)}
                  className="btn btn-xs btn-g"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', height: 24, fontWeight: 700 }}
                >
                  {isHeaderCollapsed ? '⬇️ إظهار التفاصيل' : '⬆️ إخفاء التفاصيل'}
                </button>
              </div>
            </div>

            {!isHeaderCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {form.mode === 'other' && (
                  <div style={{ marginBottom: 4 }}>
                    <div className="fl full">
                      <label style={{ fontSize: '0.76rem', marginBottom: 2 }}>اسم المستفيد الخارجي <span className="req">*</span></label>
                      <input
                        style={{ height: 32, fontSize: '0.82rem' }}
                        value={form.studentName || ''}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                        placeholder="اكتب اسم الطالب / المستفيد..."
                      />
                    </div>
                  </div>
                )}

                {/* ROW 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الطالب المسجل <span className="req">*</span></label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">— اختر من الطلاب المسجلين —</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.dob ? `${calcAge(s.dob)} سنة` : s.age || '—'})
                        </option>
                      ))}
                      <option value="__other__">➕ مستفيد خارجي (غير مسجل)</option>
                    </select>
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>العمر الزمني</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.age || (form.dob ? calcAge(form.dob) : '')}
                      readOnly={!isManualEdit}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                      placeholder="تلقائي حسب تاريخ الميلاد"
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>التشخيص / الحالة</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.diagnosis || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                      placeholder="مثال: طيف توحد، اضطراب لغوي..."
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>تاريخ التقييم</label>
                    <input
                      type="date"
                      dir="ltr"
                      style={{ height: 32, fontSize: '0.82rem', textAlign: 'right', padding: '2px 8px' }}
                      value={form.date || todayStr()}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                </div>

                {/* ROW 2 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الفاحص / الأخصائي</label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    >
                      <option value="">— اختر الفاحص —</option>
                      {emps.map(e => (
                        <option key={e.id} value={e.name}>
                          {e.name} ({e.jobTitle || 'أخصائي'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الصف الدراسي</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.grade || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                      placeholder="الصف..."
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المدرسة / المركز</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.school || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                      placeholder="اسم المدرسة أو المركز..."
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صفة الفاحص / المرافق</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      value={form.raterRelation || ''}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                      placeholder="الصفة..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* VIEW MODE & FILTER TOGGLES */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>طريقة التقييم:</span>
              <button
                type="button"
                className={`btn btn-xs ${viewMode === 'items' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setViewMode('items')}
                style={{ fontWeight: 700 }}
              >
                📋 بنود المقياس (28 بنداً)
              </button>
              <button
                type="button"
                className={`btn btn-xs ${viewMode === 'subtests_raw' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setViewMode('subtests_raw')}
                style={{ fontWeight: 700 }}
              >
                📊 إدخال الدرجات الخام المباشرة (7 اختبارات)
              </button>
            </div>

            {viewMode === 'items' && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="text"
                  className="in in-sm"
                  placeholder="🔍 بحث في البنود..."
                  style={{ width: 160, fontSize: '.78rem' }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* SUBTESTS DIRECT RAW MODE */}
          {viewMode === 'subtests_raw' ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 12, color: 'var(--text-main)' }}>
                إدخال الدرجات الخام المباشرة للاختبارات الفرعية (Leiter-3 Subtests Raw Scores):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                {/* Cognitive Battery */}
                <div style={{ background: '#f5f3ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#3730a3', marginBottom: 10 }}>
                    🧩 بطارية الذكاء المعرفي (Cognitive Battery) - NVIQ
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {LEITER3_SUBTESTS.filter(s => s.batteryId === 'cognitive').map(st => {
                      const currentRes = psychometrics.subtestResults.find(r => r.subtestId === st.id);
                      return (
                        <div key={st.id} style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #c7d2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{st.name}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>{st.nameEn}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <small style={{ fontSize: '0.7rem' }}>خام (0-{st.maxRawScore}):</small>
                            <input
                              type="number"
                              min="0"
                              max={st.maxRawScore}
                              value={form.rawOverrides[st.id] ?? currentRes?.rawScore ?? ''}
                              onChange={e => handleRawOverrideChange(st.id, e.target.value)}
                              className="in in-sm"
                              style={{ width: 60, textAlign: 'center', fontWeight: 800 }}
                              placeholder="0"
                            />
                            <span className="bdg b-bl" style={{ fontSize: '0.72rem' }}>
                              معيارية: {currentRes?.scaledScore || 10}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Attention & Memory Battery */}
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#92400e', marginBottom: 10 }}>
                    🎯 بطارية الانتباه والذاكرة (Attention & Memory) - AMI
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {LEITER3_SUBTESTS.filter(s => s.batteryId === 'attention_memory').map(st => {
                      const currentRes = psychometrics.subtestResults.find(r => r.subtestId === st.id);
                      return (
                        <div key={st.id} style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{st.name}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>{st.nameEn}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <small style={{ fontSize: '0.7rem' }}>خام (0-{st.maxRawScore}):</small>
                            <input
                              type="number"
                              min="0"
                              max={st.maxRawScore}
                              value={form.rawOverrides[st.id] ?? currentRes?.rawScore ?? ''}
                              onChange={e => handleRawOverrideChange(st.id, e.target.value)}
                              className="in in-sm"
                              style={{ width: 60, textAlign: 'center', fontWeight: 800 }}
                              placeholder="0"
                            />
                            <span className="bdg b-or" style={{ fontSize: '0.72rem' }}>
                              معيارية: {currentRes?.scaledScore || 10}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ITEMS EVALUATION MODE */
            <div style={{ marginBottom: 16 }}>
              {/* Battery Filter Tabs */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 10 }}>
                <button
                  type="button"
                  className={`tab ${activeBatteryFilter === 'all' ? 'on' : ''}`}
                  onClick={() => { setActiveBatteryFilter('all'); setActiveSubtestFilter('all'); }}
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  الكل (28 بنداً)
                </button>
                <button
                  type="button"
                  className={`tab ${activeBatteryFilter === 'cognitive' ? 'on' : ''}`}
                  onClick={() => { setActiveBatteryFilter('cognitive'); setActiveSubtestFilter('all'); }}
                  style={{ fontSize: '0.78rem', padding: '6px 12px', borderRight: '3px solid #0284c7' }}
                >
                  🧩 الذكاء المعرفي NVIQ (16)
                </button>
                <button
                  type="button"
                  className={`tab ${activeBatteryFilter === 'attention_memory' ? 'on' : ''}`}
                  onClick={() => { setActiveBatteryFilter('attention_memory'); setActiveSubtestFilter('all'); }}
                  style={{ fontSize: '0.78rem', padding: '6px 12px', borderRight: '3px solid #d97706' }}
                >
                  🎯 الانتباه والذاكرة AMI (12)
                </button>
              </div>

              {/* Items Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredItems.map(item => {
                  const currentScore = form.scores[item.id];
                  const hasAnswer = currentScore !== undefined && currentScore !== null && currentScore !== '';
                  const subtestMeta = LEITER3_SUBTESTS.find(s => s.id === item.subtestId);

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: hasAnswer ? '1.5px solid #0284c7' : '1px solid var(--border-color)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span className="bdg b-bl" style={{ fontWeight: 800, fontSize: '.72rem' }}>
                              بند #{item.id}
                            </span>
                            <span className="bdg" style={{ background: item.batteryId === 'cognitive' ? '#e0f2fe' : '#fef3c7', color: item.batteryId === 'cognitive' ? '#0369a1' : '#92400e', fontSize: '.72rem' }}>
                              {subtestMeta?.name || item.subtest}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: 2 }}>
                            {item.description}
                          </div>
                        </div>

                        {/* Response Rating Scale */}
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          {LEITER3_RESPONSE_OPTIONS.map(opt => {
                            const isSelected = Number(currentScore) === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleScoreSelect(item.id, opt.value)}
                                className={`btn btn-xs ${isSelected ? 'btn-p' : 'btn-g'}`}
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: isSelected ? 800 : 500,
                                  background: isSelected
                                    ? (opt.value === 3 ? '#059669' : opt.value === 2 ? '#0284c7' : opt.value === 1 ? '#d97706' : '#dc2626')
                                    : undefined,
                                  color: isSelected ? '#fff' : undefined,
                                }}
                                title={opt.description}
                              >
                                {opt.value} {isSelected && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Optional Note & IEP Goal */}
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          placeholder="ملاحظات خاصة بالبند..."
                          value={form.itemNotes[item.id] || ''}
                          onChange={e => handleItemNoteChange(item.id, e.target.value)}
                          style={{ flex: 1, fontSize: '0.76rem', padding: '4px 8px', borderRadius: 6, border: '1px dashed var(--border-color)', background: 'var(--g0)' }}
                        />
                        {item.iepGoal && (
                          <span style={{ fontSize: '0.72rem', color: '#047857', background: '#ecfdf5', padding: '3px 8px', borderRadius: 6, border: '1px solid #a7f3d0' }}>
                            🎯 الهدف: {item.iepGoal.slice(0, 40)}...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CLINICAL SUMMARY & RECOMMENDATIONS TEXTAREAS */}
          <div
            style={{
              background: 'var(--g0)',
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              marginTop: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📝 التقرير السريري والتوصيات (Clinical Impression & IEP Bridge):
              </h3>
              <button
                type="button"
                className="btn btn-sm btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 800, fontSize: '.78rem', background: '#3730a3', border: 'none' }}
              >
                ✨ توليد التقرير السريري تلقائياً
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  التقرير السريري وتفسير نسبة الذكاء غير اللفظي:
                </label>
                <textarea
                  className="in"
                  rows={5}
                  style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.5 }}
                  placeholder="سيظهر التقرير هنا تلقائياً..."
                  value={form.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  التوصيات التربوية للخطة الفردية (IEP):
                </label>
                <textarea
                  className="in"
                  rows={5}
                  style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.5 }}
                  placeholder="التوصيات والتدخلات التعليمية المقترحة..."
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: '10px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
              NVIQ: <strong style={{ color: '#0284c7' }}>{psychometrics.nviq}</strong> · AMI: <strong style={{ color: '#d97706' }}>{psychometrics.ami}</strong>
            </span>
            {onOpenIepBridge && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleSave(true)}
                style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #86efac',
                  fontWeight: 700,
                  fontSize: '.78rem',
                }}
              >
                🎯 حفظ ونقل إلى جسر الخطة (IEP)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-g" onClick={safeClose} style={{ fontWeight: 700 }}>
              إلغاء وخروج
            </button>
            <button
              type="button"
              className="btn btn-p"
              onClick={() => handleSave(false)}
              style={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
              }}
            >
              💾 حفظ النتيجة والتقييم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
