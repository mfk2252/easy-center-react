import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  SB5_ITEMS,
  SB5_FACTORS,
  SB5_SUBTESTS,
  SB5_RESPONSE_OPTIONS,
  SB5_COPYRIGHT_INFO,
  calculateSB5Psychometrics,
} from '../../data/sb5Data';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import { sanitizeAssessmentForm } from '../../utils/sanitize';

const EMPTY_SB5_FORM = {
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

export default function StanfordBinet5AssessmentModal({
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
        ...EMPTY_SB5_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        rawOverrides: initialData.rawOverrides || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_SB5_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeFactorFilter, setActiveFactorFilter] = useState('all');
  const [activeDomainFilter, setActiveDomainFilter] = useState('all'); // 'all' | 'nonverbal' | 'verbal'
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
      diagnosis: stu.diagnosis || '',
      age: calculatedAge || stu.age || '',
      grade: stu.grade || stu.className || '',
      school: stu.school || stu.schoolName || '',
    }));
  }

  // Real-time Psychometrics
  const psychometrics = useMemo(() => {
    return calculateSB5Psychometrics(form.scores, form.rawOverrides);
  }, [form.scores, form.rawOverrides]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return SB5_ITEMS.filter(it => {
      const matchFactor = activeFactorFilter === 'all' || it.factorId === activeFactorFilter;
      const matchDomain = activeDomainFilter === 'all' || it.domainId === activeDomainFilter;
      const matchSearch =
        !searchQuery ||
        it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (it.iepGoal && it.iepGoal.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchFactor && matchDomain && matchSearch;
    });
  }, [activeFactorFilter, activeDomainFilter, searchQuery]);

  if (!isOpen) return null;

  // Unsaved Changes Guard
  function safeClose() {
    if (psychometrics.totalAnswered > 0 || Object.keys(form.rawOverrides).length > 0) {
      if (
        window.confirm(
          `⚠️ تنبيه: تم رصد إجابات ودرجات في مقياس ستانفورد - بينيه 5 (SB5). هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`
        )
      ) {
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
    SB5_ITEMS.forEach(it => {
      if (level === 'gifted') {
        scores[it.id] = it.id % 5 === 0 ? 2 : 3;
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
      }) لمقياس SB5`,
      'ok'
    );
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 8 && Object.keys(form.rawOverrides).length < 4) {
      toast?.('⚠️ يرجى تقييم 8 بنود على الأقل لتوليد التقرير السريري المتكامل', 'er');
      return;
    }

    const factorSummary = psychometrics.factorResults
      .map(f => {
        return `• ${f.name} (${f.code}): الدرجة المركبة (${f.compositeScore}) · مجموع المعياري (${f.sumScaled}/38) · رتبة مئينية (${f.percentile}%) — [${f.level}]`;
      })
      .join('\n');

    const subtestSummary = psychometrics.subtestResults
      .map(st => {
        return `- ${st.name} (${st.code}): درجة خام (${st.rawScore}/${st.maxRaw}) · معيارية (${st.scaledScore}/19) — [${st.subtestLevel}]`;
      })
      .join('\n');

    const deficits =
      psychometrics.deficitFactors.length > 0
        ? `العوامل المعرفية التي تظهر قصوراً أو احتياجاً لدعم مكثف:\n` +
          psychometrics.deficitFactors
            .map(f => `- ${f.name} (${f.code}): درجة مركبة ${f.compositeScore} (رتبة ${f.percentile}%)`)
            .join('\n')
        : 'جميع العوامل المعرفية الخمسة تقع ضمن النطاق المتوسط أو المرتفع.';

    const strengths =
      psychometrics.strengthFactors.length > 0
        ? `نقاط القوة المعرفية والتفوق البارز:\n` +
          psychometrics.strengthFactors
            .map(f => `- ${f.name} (${f.code}): درجة مركبة ${f.compositeScore} (رتبة ${f.percentile}%)`)
            .join('\n')
        : 'الأداء المعرفي متناسق حول المتوسط العام دون تباين حاد.';

    const summary =
      `تقرير التقييم النفسي والذكاء بمقياس ستانفورد - بينيه — الصورة الخامسة (SB5) المقننة:\n\n` +
      `- نسبة الذكاء الكلية (Full Scale IQ - FSIQ): (${psychometrics.fsiq}) برتبة مئينية (${psychometrics.fsiqPercentile}%).\n` +
      `- نسبة الذكاء غير اللفظية (Nonverbal IQ - NVIQ): (${psychometrics.nviq}) برتبة مئينية (${psychometrics.nviqPercentile}%).\n` +
      `- نسبة الذكاء اللفظية (Verbal IQ - VIQ): (${psychometrics.viq}) برتبة مئينية (${psychometrics.viqPercentile}%).\n` +
      `- مجموع الدرجات المعيارية للاختبارات الفرعية العشرة: (${psychometrics.sumScaledScores} من 190).\n` +
      `- التصنيف التشخيصي المعتمد: [${psychometrics.classification}].\n\n` +
      `الأداء على العوامل المعرفية الخمسة (Cognitive Factors):\n${factorSummary}\n\n` +
      `الأداء التفصيلي على الاختبارات الفرعية العشرة:\n${subtestSummary}\n\n` +
      `${deficits}\n\n` +
      `${strengths}\n\n` +
      `الخلاصة الإكلينيكية والتشخيص:\n${psychometrics.clinicalImpression}`;

    setForm(f => ({
      ...f,
      clinicalSummary: summary,
      recommendations: psychometrics.recommendations,
    }));

    toast?.('✨ تم توليد الخلاصة السريرية وتوصيات الخطة الفردية بنجاح', 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast?.('⚠️ يرجى اختيار أو كتابة اسم الطالب أولاً', 'er');
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
      measureId: 'stanford_binet_5',
      scaleId: 'stanford_binet_5',
      scaleType: 'sb5',
      measureName: SB5_COPYRIGHT_INFO.scaleNameAr,
      measureNameEn: SB5_COPYRIGHT_INFO.scaleNameEn,
      category: 'intelligence_cognitive',
      categoryName: 'مقاييس القدرات العقلية والذكاء',
      isSb5: true,
      score: psychometrics.fsiq,
      fsiq: psychometrics.fsiq,
      nviq: psychometrics.nviq,
      viq: psychometrics.viq,
      sumScaledScores: psychometrics.sumScaledScores,
      overallPercentile: psychometrics.fsiqPercentile,
      percentage: `${psychometrics.completionPercentage}%`,
      percentageNum: psychometrics.completionPercentage,
      level: psychometrics.classification,
      severityColor: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      rawOverrides: form.rawOverrides,
      itemNotes: form.itemNotes,
      psychometrics,
      clinicalSummary: form.clinicalSummary || psychometrics.clinicalImpression,
      recommendations: form.recommendations || psychometrics.recommendations,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast?.(`✅ تم تحديث نتيجة مقياس ستانفورد بينيه (SB5) بنجاح (FSIQ: ${psychometrics.fsiq})`, 'ok');
    } else {
      lsAdd('studentAssessments', payload);
      toast?.(`✅ تم حفظ تقييم مقياس ستانفورد بينيه (SB5) بنجاح (FSIQ: ${psychometrics.fsiq})`, 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

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
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🧠</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس ستانفورد - بينيه للذكاء (الصورة الخامسة SB5)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  النموذج ثنائي الأبعاد · 5 عوامل معرفية · 10 اختبارات فرعية
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#0f172a', color: '#93c5fd', fontSize: '0.68rem', fontWeight: 800 }}>
                  © Riverside Insights / Gale H. Roid
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Stanford-Binet Intelligence Scales (5th Edition) — التقييم السيكومتري الشامل
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
                color: showCopyrightDetails ? '#1e3a8a' : '#fff',
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
              background: '#f0fdf4',
              padding: '14px 20px',
              borderBottom: '2px solid #86efac',
              fontSize: '0.82rem',
              color: '#14532d',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: '0.92rem',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس ستانفورد - بينيه 5:
            </div>

            <div
              style={{
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#166534',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار حقوق الملكية والاعتماد:</strong> {SB5_COPYRIGHT_INFO.scaleNameAr} · المؤلف الأصلي: {SB5_COPYRIGHT_INFO.authorAr} ({SB5_COPYRIGHT_INFO.authorEn}) · جهة النشر والتطوير: {SB5_COPYRIGHT_INFO.publisherAr}.
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  background: '#bbf7d0',
                  color: '#14532d',
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid #86efac',
                  fontWeight: 700,
                }}
              >
                أداة تشخيص سيكومتري إكلينيكي معتمدة
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  background: '#fff',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #bbf7d0',
                }}
              >
                <strong>المؤلف والباحثون:</strong> {SB5_COPYRIGHT_INFO.authorAr}
              </div>
              <div
                style={{
                  background: '#fff',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #bbf7d0',
                }}
              >
                <strong>جهة النشر الدولية:</strong> {SB5_COPYRIGHT_INFO.publisherAr}
              </div>
              <div
                style={{
                  background: '#fff',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #bbf7d0',
                }}
              >
                <strong>الفئة العمرية المستهدفة:</strong> {SB5_COPYRIGHT_INFO.targetAge}
              </div>
              <div
                style={{
                  background: '#fff',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #bbf7d0',
                }}
              >
                <strong>المرجعية المعيارية:</strong> {SB5_COPYRIGHT_INFO.standardsReference}
              </div>
            </div>

            <div
              style={{
                fontSize: '0.78rem',
                color: '#166534',
                background: '#dcfce7',
                padding: '8px 12px',
                borderRadius: 8,
              }}
            >
              {SB5_COPYRIGHT_INFO.notice}
              <br />
              <strong>{SB5_COPYRIGHT_INFO.disclaimer}</strong>
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
            {/* Full Scale IQ (FSIQ) Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 14px',
                borderRadius: 10,
                border: `2px solid ${psychometrics.severityColor}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>
                  نسبة الذكاء الكلية (FSIQ)
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: psychometrics.severityColor }}>
                  {psychometrics.fsiq}
                </span>
              </div>
              <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: 8, marginRight: 2 }}>
                <span
                  className="bdg"
                  style={{
                    background: `${psychometrics.severityColor}15`,
                    color: psychometrics.severityColor,
                    border: `1px solid ${psychometrics.severityColor}40`,
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    display: 'block',
                  }}
                >
                  {psychometrics.classification}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
                  رتبة مئينية: <strong>{psychometrics.fsiqPercentile}%</strong>
                </span>
              </div>
            </div>

            {/* Nonverbal IQ (NVIQ) Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 10,
                border: '1.5px solid #0284c7',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', display: 'block' }}>
                  الذكاء غير اللفظي (NVIQ)
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0284c7' }}>
                  {psychometrics.nviq}
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
                رتبة: <strong>{psychometrics.nviqPercentile}%</strong>
              </span>
            </div>

            {/* Verbal IQ (VIQ) Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 10,
                border: '1.5px solid #7c3aed',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', display: 'block' }}>
                  الذكاء اللفظي (VIQ)
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#7c3aed' }}>
                  {psychometrics.viq}
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
                رتبة: <strong>{psychometrics.viqPercentile}%</strong>
              </span>
            </div>

            {/* Sum Scaled Scores */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', display: 'block' }}>
                مجموع الدرجات المعيارية (10 اختبارات)
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {psychometrics.sumScaledScores} <small style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>/ 190</small>
              </span>
            </div>
          </div>

          {/* QUICK PRESETS */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>⚡ تجربة سريعة:</span>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => autoFillSample('gifted')}
              style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', fontSize: '.72rem' }}
            >
              موهبة (130+)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => autoFillSample('average')}
              style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontSize: '.72rem' }}
            >
              طبيعي (90-109)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => autoFillSample('borderline')}
              style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74', fontSize: '.72rem' }}
            >
              بطء تعلم (70-79)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => autoFillSample('id')}
              style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '.72rem' }}
            >
              قصور فكري (&lt;70)
            </button>
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
                <span>👦</span>
                <span>بيانات المفحوص والفحص الإكلينيكي</span>
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
                {/* Mode toggle if other */}
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

                {/* ROW 1: Clinical Essentials (4 Columns) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 8,
                  }}
                >
                  {/* 1. Student Selection */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الطالب المسجل <span className="req">*</span></label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">— اختر من الطلاب المسجلين بالمركز —</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.age ? `${s.age} سنة` : 'غير محدد'})
                        </option>
                      ))}
                      <option value="__other__">➕ مستفيد خارجي (غير مسجل)</option>
                    </select>
                  </div>

                  {/* 2. Chronological Age */}
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

                  {/* 3. Medical / Educational Diagnosis */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>التشخيص الطبي / التربوي</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.diagnosis || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                      placeholder="مثال: بطء تعلم، إعاقة فكرية..."
                    />
                  </div>

                  {/* 4. Assessment Date */}
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

                {/* ROW 2: Respondent and Testing Details (4 Columns) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 8,
                  }}
                >
                  {/* 1. Examiner Name */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الأخصائي النفسي الفاحص</label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    >
                      <option value="">— اختر الأخصائي الفاحص —</option>
                      {emps.map(e => (
                        <option key={e.id} value={e.name}>
                          {e.name} ({e.jobTitle || 'أخصائي'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Respondent Name */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المستجيب / المرافق</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم المرافق أو معلم الطالب"
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  {/* 3. Grade / Academic Level */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الصف / المستوى الدراسي</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      type="text"
                      placeholder="مثال: الصف الثالث الابتدائي"
                      value={form.grade || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                    />
                  </div>

                  {/* 4. School / Center */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المدرسة / المركز</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      type="text"
                      placeholder="اسم المدرسة أو المركز"
                      value={form.school || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FACTOR AND DOMAIN FILTER BUTTONS */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              paddingBottom: 8,
              marginBottom: 12,
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            {/* DOMAIN TOGGLE */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeDomainFilter === 'all' ? 'btn-p' : ''}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontWeight: 800, fontSize: '.78rem' }}
              >
                🌐 كافة المجالات (NV & V)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeDomainFilter === 'nonverbal' ? 'btn-p' : ''}`}
                onClick={() => setActiveDomainFilter('nonverbal')}
                style={{
                  fontWeight: 800,
                  fontSize: '.78rem',
                  background: activeDomainFilter === 'nonverbal' ? '#0284c7' : undefined,
                  borderColor: activeDomainFilter === 'nonverbal' ? '#0284c7' : undefined,
                }}
              >
                🧩 المجال غير اللفظي (NV)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeDomainFilter === 'verbal' ? 'btn-p' : ''}`}
                onClick={() => setActiveDomainFilter('verbal')}
                style={{
                  fontWeight: 800,
                  fontSize: '.78rem',
                  background: activeDomainFilter === 'verbal' ? '#7c3aed' : undefined,
                  borderColor: activeDomainFilter === 'verbal' ? '#7c3aed' : undefined,
                }}
              >
                🗣️ المجال اللفظي (V)
              </button>
            </div>

            {/* FACTOR BUTTONS */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-xs ${activeFactorFilter === 'all' ? 'btn-p' : ''}`}
                onClick={() => setActiveFactorFilter('all')}
                style={{ fontWeight: 700 }}
              >
                كل العوامل (5)
              </button>
              {SB5_FACTORS.map(fac => (
                <button
                  key={fac.id}
                  type="button"
                  className={`btn btn-xs ${activeFactorFilter === fac.id ? 'btn-p' : ''}`}
                  onClick={() => setActiveFactorFilter(fac.id)}
                  style={{
                    fontWeight: 700,
                    background: activeFactorFilter === fac.id ? fac.color : undefined,
                    borderColor: activeFactorFilter === fac.id ? fac.color : undefined,
                  }}
                >
                  {fac.icon} {fac.code}
                </button>
              ))}
            </div>

            {/* VIEW MODE & SEARCH */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => setViewMode(v => (v === 'items' ? 'subtests_raw' : 'items'))}
                style={{
                  background: viewMode === 'subtests_raw' ? '#e0e7ff' : 'var(--g0)',
                  color: viewMode === 'subtests_raw' ? '#4338ca' : 'var(--text-main)',
                  fontWeight: 700,
                }}
              >
                {viewMode === 'items' ? '📊 إدخال الدرجات الخام للاختبارات الفرعية' : '📋 عرض البنود التفصيلية'}
              </button>
              <input
                type="text"
                className="in in-sm"
                placeholder="🔍 بحث في البنود..."
                style={{ width: 160, fontSize: '.78rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* VIEW MODE 1: SUBTESTS RAW SCORES MATRIX */}
          {viewMode === 'subtests_raw' && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 12, color: 'var(--text-main)' }}>
                📊 شبكة الاختبارات الفرعية العشرة لستانفورد بينيه (الصورة الخامسة SB5):
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl" style={{ width: '100%', fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'right' }}>العامل المعرفي</th>
                      <th style={{ textAlign: 'right' }}>الاختبار الفرعي</th>
                      <th style={{ textAlign: 'center' }}>المجال</th>
                      <th style={{ textAlign: 'center', width: 130 }}>الدرجة الخام (Raw)</th>
                      <th style={{ textAlign: 'center' }}>الدرجة المعيارية (1-19)</th>
                      <th style={{ textAlign: 'center' }}>التصنيف والوصف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psychometrics.subtestResults.map(st => (
                      <tr key={st.id}>
                        <td style={{ fontWeight: 700 }}>
                          {SB5_FACTORS.find(f => f.id === st.factorId)?.name || st.factorId}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          <span>{st.icon}</span> {st.name} ({st.code})
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className="bdg"
                            style={{
                              background: st.domainId === 'nonverbal' ? '#e0f2fe' : '#f5f3ff',
                              color: st.domainId === 'nonverbal' ? '#0369a1' : '#6d28d9',
                              fontSize: '.7rem',
                            }}
                          >
                            {st.domainId === 'nonverbal' ? 'غير لفظي' : 'لفظي'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            max={st.maxRaw}
                            className="in in-sm"
                            style={{ width: 80, textAlign: 'center', fontWeight: 800 }}
                            value={
                              form.rawOverrides[st.id] !== undefined
                                ? form.rawOverrides[st.id]
                                : st.rawScore > 0
                                ? st.rawScore
                                : ''
                            }
                            onChange={e => handleRawOverrideChange(st.id, e.target.value)}
                            placeholder={`0-${st.maxRaw}`}
                          />
                        </td>
                        <td
                          style={{
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: st.subtestColor,
                          }}
                        >
                          {st.scaledScore} <small style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>/ 19</small>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: `${st.subtestColor}15`,
                              color: st.subtestColor,
                              border: `1px solid ${st.subtestColor}40`,
                            }}
                          >
                            {st.subtestLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: DIAGNOSTIC ITEMS LIST */}
          {viewMode === 'items' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {filteredItems.map(item => {
                const currentScore = form.scores[item.id];
                const subtest = SB5_SUBTESTS.find(s => s.id === item.subtestId);
                const factor = SB5_FACTORS.find(f => f.id === item.factorId);
                const note = form.itemNotes[item.id] || '';

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: currentScore !== undefined ? '1.5px solid #2563eb' : '1px solid var(--border-color)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      transition: 'all 0.15s ease',
                      boxShadow: currentScore !== undefined ? '0 4px 12px rgba(37, 99, 235, 0.06)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 12,
                        marginBottom: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span
                            className="bdg"
                            style={{ background: '#e0e7ff', color: '#1e40af', fontWeight: 800, fontSize: '.72rem' }}
                          >
                            بند {item.id}
                          </span>
                          <span
                            className="bdg"
                            style={{
                              background: factor?.bgLight || '#f1f5f9',
                              color: factor?.color || '#475569',
                              border: `1px solid ${factor?.borderColor || '#cbd5e1'}`,
                              fontSize: '.72rem',
                              fontWeight: 700,
                            }}
                          >
                            {factor?.icon} {factor?.name} ({subtest?.code})
                          </span>
                          <span
                            className="bdg"
                            style={{
                              background: item.domainId === 'nonverbal' ? '#e0f2fe' : '#f5f3ff',
                              color: item.domainId === 'nonverbal' ? '#0369a1' : '#6d28d9',
                              fontSize: '.7rem',
                            }}
                          >
                            {item.domainId === 'nonverbal' ? 'غير لفظي' : 'لفظي'}
                          </span>
                        </div>

                        <h4
                          style={{
                            margin: '4px 0 2px 0',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                          {item.description}
                        </p>
                      </div>

                      {/* SCORE SELECTOR BUTTONS */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {SB5_RESPONSE_OPTIONS.map(opt => {
                          const isSelected = currentScore === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleScoreSelect(item.id, opt.value)}
                              className={`btn btn-xs ${isSelected ? 'btn-p' : ''}`}
                              style={{
                                padding: '6px 10px',
                                fontWeight: isSelected ? 800 : 600,
                                fontSize: '0.76rem',
                                background: isSelected
                                  ? opt.value === 3
                                    ? '#15803d'
                                    : opt.value === 2
                                    ? '#2563eb'
                                    : opt.value === 1
                                    ? '#ea580c'
                                    : '#dc2626'
                                  : undefined,
                                borderColor: isSelected
                                  ? opt.value === 3
                                    ? '#15803d'
                                    : opt.value === 2
                                    ? '#2563eb'
                                    : opt.value === 1
                                    ? '#ea580c'
                                    : '#dc2626'
                                  : undefined,
                                color: isSelected ? '#fff' : undefined,
                              }}
                              title={opt.description}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ITEM NOTE AND IEP GOAL STRIP */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        className="in in-sm"
                        placeholder="📝 ملاحظات الأخصائي الفاحص على استجابة البند..."
                        style={{ flex: 1, minWidth: 200, fontSize: '.76rem' }}
                        value={note}
                        onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      />
                      {item.iepGoal && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: '#047857',
                            background: '#ecfdf5',
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          🎯 هدف الخطة الفردية المقترح: {item.iepGoal.slice(0, 45)}...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📝 التقرير الإكلينيكي وتوصيات الخطة التربوية الفردية (IEP):
              </h3>
              <button
                type="button"
                className="btn btn-sm btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 800, fontSize: '.78rem', background: '#1e40af', border: 'none' }}
              >
                ✨ صياغة الخلاصة الإكلينيكية والتوصيات تلقائياً
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  الخلاصة الإكلينيكية وتفسير نسبة الذكاء (FSIQ / NVIQ / VIQ):
                </label>
                <textarea
                  className="in"
                  rows={5}
                  style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.5 }}
                  placeholder="سيتم كتابة التقرير السريري هنا أو الضغط على زر الصياغة التلقائية أعلاه..."
                  value={form.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  توصيات التدخل والبرنامج التربوي الفردي (IEP Goals):
                </label>
                <textarea
                  className="in"
                  rows={5}
                  style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.5 }}
                  placeholder="توصيات التدخل، استراتيجيات التعلم متعدد الحواس، وأهداف الخطة الفردية..."
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
              تم تقييم <strong>{psychometrics.totalAnswered}</strong> من أصل {SB5_ITEMS.length} بنداً (
              {psychometrics.completionPercentage}%)
            </span>
            {onOpenIepBridge && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => onOpenIepBridge({ ...form, measureId: 'stanford_binet_5' })}
                style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #86efac',
                  fontWeight: 700,
                  fontSize: '.78rem',
                }}
              >
                🚀 فتح جسر الخطة الفردية (IEP Bridge)
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
              onClick={handleSave}
              style={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
              }}
            >
              💾 حفظ نتيجة مقياس ستانفورد بينيه (SB5)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
