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
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);
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
      const itemPosInSet = (idx % 12) + 1;
      const setIdx = Math.floor(idx / 12);

      if (level === 'gifted') {
        scores[it.id] = (itemPosInSet <= 11 || Math.random() > 0.1) ? 1 : 0;
      } else if (level === 'average') {
        if (setIdx === 0) scores[it.id] = itemPosInSet <= 10 ? 1 : 0;
        else if (setIdx === 1) scores[it.id] = itemPosInSet <= 8 ? 1 : 0;
        else scores[it.id] = itemPosInSet <= 5 ? 1 : 0;
      } else if (level === 'borderline') {
        if (setIdx === 0) scores[it.id] = itemPosInSet <= 6 ? 1 : 0;
        else scores[it.id] = itemPosInSet <= 3 ? 1 : 0;
      } else {
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
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #0284c7 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>▦</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس مصفوفات رافن المتتابعة للذكاء غير اللفظي (RPM)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  {currentVersionMeta.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#0f172a', color: '#93c5fd', fontSize: '0.68rem', fontWeight: 800 }}>
                  © John C. Raven / Pearson Assessment
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  أداة قياس القدرة الاستدلالية العامة والتفكير المنطقي المجرد الخالية من التحيز اللغوي
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
                color: showCopyrightDetails ? '#1e40af' : '#fff',
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
              background: '#f0f9ff',
              padding: '14px 20px',
              borderBottom: '2px solid #7dd3fc',
              fontSize: '0.82rem',
              color: '#0369a1',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس مصفوفات رافن (RPM):
            </div>

            <div
              style={{
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#075985',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار حقوق الملكية والاعتماد:</strong> مقياس مصفوفات رافن — إعداد د. جون رافن (John C. Raven) · الناشر الدولي: Pearson Assessment.
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#bae6fd', color: '#0369a1', padding: '3px 8px', borderRadius: 6, border: '1px solid #7dd3fc', fontWeight: 700 }}>
                أداة تقييم غير لفظي معتمدة عالمياً
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <strong>الفئات المستهدفة:</strong> {RAVEN_COPYRIGHT_INFO.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <strong>طبيعة التقييم:</strong> {RAVEN_COPYRIGHT_INFO.diagnosticNature}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#075985', background: '#e0f2fe', padding: '8px 12px', borderRadius: 8 }}>
              {RAVEN_COPYRIGHT_INFO.notice}
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
            {/* Raw Score */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة الخام الإجمالية:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {psychometrics.totalRaw} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>/ {psychometrics.maxRawScore}</small>
              </span>
            </div>

            {/* Percentile Rank */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1.5px solid #0284c7', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الرتبة المئينية (Percentile):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>
                {psychometrics.percentile}%
              </span>
            </div>

            {/* Equivalent IQ */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1.5px solid #7c3aed', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>مكافئ IQ التقريبي:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#7c3aed' }}>
                {psychometrics.equivalentIQ}
              </span>
            </div>

            {/* Classification Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>التصنيف:</span>
              <span className="bdg" style={{ background: psychometrics.severityBg, color: psychometrics.severityColor, border: `1px solid ${psychometrics.severityBorder}`, fontWeight: 800, fontSize: '0.78rem' }}>
                {psychometrics.grade} · {psychometrics.shortClassification}
              </span>
            </div>
          </div>

          {/* Version Switcher & Quick Samples */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-input)', padding: 3, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              {RAVEN_VERSIONS.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleVersionChange(v.id)}
                  className={`btn btn-xs ${form.version === v.id ? 'btn-p' : ''}`}
                  style={{ fontSize: '0.72rem', fontWeight: 700 }}
                >
                  {v.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>⚡ تجربة:</span>
              <button type="button" className="btn btn-xs" onClick={() => autoFillSample('gifted')} style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', fontSize: '.72rem' }}>موهبة</button>
              <button type="button" className="btn btn-xs" onClick={() => autoFillSample('average')} style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontSize: '.72rem' }}>طبيعي</button>
              <button type="button" className="btn btn-xs" onClick={() => autoFillSample('borderline')} style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74', fontSize: '.72rem' }}>أقل من المتوسط</button>
            </div>
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
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>👤</span>
                <span>بيانات المفحوص ونموذج التقييم</span>
                {form.studentName && (
                  <span
                    style={{
                      fontSize: '0.76rem',
                      background: '#dbeafe',
                      color: '#1e40af',
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
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>العمر الزمني (سنوات)</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.age || (form.dob ? calcAge(form.dob) : '')}
                      readOnly={!isManualEdit}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                      placeholder="مثال: 8.5"
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>التشخيص / الملاحظات الأولية</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.diagnosis || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                      placeholder="مثال: صعوبات تعلم، اضطراب لغوي..."
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

          {/* SETS BREAKDOWN CARDS */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              📊 توزيع الأداء على مجموعات مصفوفات رافن:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {psychometrics.setResults.map(s => (
                <div
                  key={s.setId}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRight: `4px solid ${s.color}`,
                    borderRadius: 8,
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>مجموعة {s.setId}</span>
                    <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>
                      {s.rawScore} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>/ 12</small>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: 2 }} className="truncate" title={s.cognitiveSkill}>
                    {s.cognitiveSkill}
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'var(--border-color)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${s.percentage}%`, height: '100%', background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INPUT MODE BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>نمط الإدخال:</span>
              <button
                type="button"
                className={`btn btn-xs ${inputMode === 'items' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setInputMode('items')}
                style={{ fontWeight: 700 }}
              >
                📝 استجابة مصفوفة بنداً بنداً ({currentItems.length})
              </button>
              <button
                type="button"
                className={`btn btn-xs ${inputMode === 'sets_direct' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setInputMode('sets_direct')}
                style={{ fontWeight: 700 }}
              >
                ⚡ إدخال درجات المجموعات المباشرة
              </button>
            </div>

            {inputMode === 'items' && (
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

          {/* DIRECT OVERRIDE MODE */}
          {inputMode === 'sets_direct' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: 10 }}>
                إدخال الدرجات الخام المباشرة لكل مجموعة أو الإجمالي:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                {currentVersionMeta.sets.map(setId => {
                  const meta = RAVEN_SETS_META[setId];
                  return (
                    <div key={setId} style={{ background: 'var(--g0)', padding: 10, borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.78rem' }}>مجموعة {setId}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }} className="truncate">{meta.name}</div>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={form.rawOverrides[setId] ?? ''}
                        onChange={e => handleSetRawOverride(setId, e.target.value)}
                        placeholder="0 - 12"
                        className="in in-sm"
                        style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', marginTop: 6 }}
                      />
                    </div>
                  );
                })}

                <div style={{ background: '#e0f2fe', padding: 10, borderRadius: 8, border: '1.5px solid #0284c7', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#0369a1' }}>الخام الإجمالي</div>
                  <div style={{ fontSize: '0.68rem', color: '#0369a1' }}>من {currentVersionMeta.totalItems}</div>
                  <input
                    type="number"
                    min="0"
                    max={currentVersionMeta.totalItems}
                    value={form.rawOverrides.total ?? ''}
                    onChange={e => handleTotalRawOverride(e.target.value)}
                    placeholder={`0 - ${currentVersionMeta.totalItems}`}
                    className="in in-sm"
                    style={{ textAlign: 'center', fontWeight: 900, fontSize: '0.95rem', marginTop: 6, color: '#0369a1' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ITEMS MODE */}
          {inputMode === 'items' && (
            <div style={{ marginBottom: 16 }}>
              {/* Filter by Set */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 10 }}>
                <button
                  type="button"
                  className={`tab ${activeSetFilter === 'all' ? 'on' : ''}`}
                  onClick={() => setActiveSetFilter('all')}
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  الكل ({currentItems.length})
                </button>
                {currentVersionMeta.sets.map(setId => (
                  <button
                    key={setId}
                    type="button"
                    className={`tab ${activeSetFilter === setId ? 'on' : ''}`}
                    onClick={() => setActiveSetFilter(setId)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      borderRight: `3px solid ${RAVEN_SETS_META[setId]?.color || '#0284c7'}`,
                    }}
                  >
                    مجموعة {setId}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredItems.map(item => {
                  const currentScore = form.scores[item.id];
                  const isAnswered = currentScore !== undefined && currentScore !== '';
                  const isCorrect = currentScore === 1 || currentScore === '1';
                  const setMeta = RAVEN_SETS_META[item.set];

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: isAnswered
                          ? isCorrect
                            ? '1.5px solid #16a34a'
                            : '1.5px solid #dc2626'
                          : '1px solid var(--border-color)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span
                              className="bdg"
                              style={{ background: setMeta?.color || '#0284c7', color: '#fff', fontWeight: 800, fontSize: '.72rem' }}
                            >
                              {item.title}
                            </span>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {item.prompt}
                            </span>
                          </div>
                          {item.iepGoal && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 4 }}>
                              🎯 <strong>هدف الخطة الفردية:</strong> {item.iepGoal}
                            </div>
                          )}
                        </div>

                        {/* Correct / Incorrect Buttons */}
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleScoreSelect(item.id, true)}
                            className={`btn btn-xs ${isAnswered && isCorrect ? 'btn-p' : 'btn-g'}`}
                            style={{
                              padding: '5px 12px',
                              fontWeight: isAnswered && isCorrect ? 800 : 500,
                              background: isAnswered && isCorrect ? '#16a34a' : undefined,
                              color: isAnswered && isCorrect ? '#fff' : undefined,
                            }}
                          >
                            ✓ صواب (1)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScoreSelect(item.id, false)}
                            className={`btn btn-xs ${isAnswered && !isCorrect ? 'btn-p' : 'btn-g'}`}
                            style={{
                              padding: '5px 12px',
                              fontWeight: isAnswered && !isCorrect ? 800 : 500,
                              background: isAnswered && !isCorrect ? '#dc2626' : undefined,
                              color: isAnswered && !isCorrect ? '#fff' : undefined,
                            }}
                          >
                            ✖ خطأ (0)
                          </button>
                        </div>
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
                📝 التقرير التشخيصي وتوصيات الخطة التربوية الفردية (IEP):
              </h3>
              <button
                type="button"
                className="btn btn-sm btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 800, fontSize: '.78rem', background: '#1e40af', border: 'none' }}
              >
                ✨ صياغة الخلاصة السريرية والتوصيات تلقائياً
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  الخلاصة الإكلينيكية وتفسير الأداء الاستدلالي:
                </label>
                <textarea
                  className="in"
                  rows={5}
                  style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.5 }}
                  placeholder="سيظهر التقرير السريري هنا تلقائياً..."
                  value={form.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  توصيات التدخل وأهداف الخطة الفردية (IEP):
                </label>
                <textarea
                  className="in"
                  rows={5}
                  style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.5 }}
                  placeholder="التوصيات التربوية والتدخلية للمفحوص..."
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
              الخام: <strong>{psychometrics.totalRaw} / {psychometrics.maxRawScore}</strong> · المئين: <strong style={{ color: '#0284c7' }}>{psychometrics.percentile}%</strong>
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
              إلغاء ✖
            </button>
            <button
              type="button"
              className="btn btn-p"
              onClick={() => handleSave(false)}
              style={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
              }}
            >
              💾 حفظ نتيجة تقييم رافن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
