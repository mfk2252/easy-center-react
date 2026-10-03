import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  WISC5_ITEMS,
  WISC5_DOMAINS,
  WISC5_RESPONSE_OPTIONS,
  WISC5_COPYRIGHT_INFO,
  calculateWISC5Psychometrics,
} from '../../data/wisc5Data';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import { sanitizeAssessmentForm } from '../../utils/sanitize';

const EMPTY_WISC5_FORM = {
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
  clinicalSummary: '',
  recommendations: '',
};

export default function WISC5AssessmentModal({
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
        ...EMPTY_WISC5_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_WISC5_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    return calculateWISC5Psychometrics(form.scores);
  }, [form.scores]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return WISC5_ITEMS.filter(it => {
      const matchDomain = activeDomainFilter === 'all' || it.domainId === activeDomainFilter;
      const matchSearch =
        !searchQuery ||
        it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.subtest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (it.iepGoal && it.iepGoal.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchDomain && matchSearch;
    });
  }, [activeDomainFilter, searchQuery]);

  if (!isOpen) return null;

  function safeClose() {
    if (psychometrics.totalAnswered > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${psychometrics.totalAnswered}) بنود في مقياس WISC-V. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
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

  function autoFillSample(level = 'average') {
    const scores = {};
    WISC5_ITEMS.forEach(it => {
      if (level === 'gifted') {
        scores[it.id] = (it.id % 4 === 0) ? 2 : 3;
      } else if (level === 'average') {
        scores[it.id] = (it.id % 3 === 0) ? 3 : (it.id % 2 === 0 ? 2 : 1);
      } else if (level === 'borderline') {
        scores[it.id] = (it.id % 2 === 0) ? 1 : (it.id % 3 === 0 ? 2 : 0);
      } else {
        // Intellectual Disability
        scores[it.id] = (it.id % 4 === 0) ? 1 : 0;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast?.(`⚡ تم تعبئة استجابات نموذجية (${level === 'gifted' ? 'موهبة وتفوق' : level === 'average' ? 'متوسط طبيعي' : level === 'borderline' ? 'حدّي / بطء تعلم' : 'قصور فكري'}) للتجربة السريعة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 10) {
      toast?.('⚠️ يرجى تقييم 10 بنود على الأقل لتوليد التقرير السريري المتكامل', 'er');
      return;
    }

    const indexSummary = psychometrics.domainResults.map(d => {
      return `• ${d.name} (${d.code}): الدرجة الموزونة (${d.compositeScore}) · الدرجة المعيارية (${d.scaledScore}/19) · رتبة مئينية (${d.percentile}%) — [${d.level}]`;
    }).join('\n');

    const deficits = psychometrics.deficitDomains.length > 0
      ? `المؤشرات والقدرات التي تظهر قصوراً أو احتياجاً لدعم مكثف:\n` + psychometrics.deficitDomains.map(d => `- ${d.name} (${d.code}): درجة معيارية ${d.scaledScore}/19`).join('\n')
      : 'جميع المؤشرات المعرفية تقع ضمن النطاق المتوسط أو المرتفع.';

    const strengths = psychometrics.strengthDomains.length > 0
      ? `نقاط القوة المعرفية والتفوق البارز:\n` + psychometrics.strengthDomains.map(d => `- ${d.name} (${d.code}): درجة معيارية ${d.scaledScore}/19`).join('\n')
      : 'الأداء المعرفي متناسق حول المتوسط العام.';

    const summary = `تقرير التقييم النفسي والتشخيصي بمقياس وكسلر لذكاء الأطفال (WISC-V) - الطبعة الخامسة المقننة (Pearson):\n\n` +
      `- معامل الذكاء الكلي (FSIQ): (${psychometrics.fsiq}) برتبة مئينية كلية (${psychometrics.overallPercentile}%).\n` +
      `- مجموع الدرجات المعيارية للمؤشرات الخمسة: (${psychometrics.sumScaledScores} من 95).\n` +
      `- التصنيف التشخيصي المعتمد: [${psychometrics.classification}].\n\n` +
      `الأداء على المؤشرات المعرفية الخمسة الرئيسية:\n${indexSummary}\n\n` +
      `${deficits}\n\n` +
      `${strengths}\n\n` +
      `الخلاصة الإكلينيكية:\n${psychometrics.clinicalImpression}`;

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
      measureId: 'wisc_5',
      scaleId: 'wisc_5',
      scaleType: 'wisc5',
      measureName: WISC5_COPYRIGHT_INFO.scaleNameAr,
      measureNameEn: WISC5_COPYRIGHT_INFO.scaleNameEn,
      category: 'intelligence_cognitive',
      categoryName: 'مقاييس القدرات العقلية والذكاء',
      isWisc5: true,
      score: psychometrics.fsiq,
      fsiq: psychometrics.fsiq,
      sumScaledScores: psychometrics.sumScaledScores,
      overallPercentile: psychometrics.overallPercentile,
      percentage: `${psychometrics.completionPercentage}%`,
      percentageNum: psychometrics.completionPercentage,
      level: psychometrics.classification,
      severityColor: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      psychometrics,
      clinicalSummary: form.clinicalSummary || psychometrics.clinicalImpression,
      recommendations: form.recommendations || psychometrics.recommendations,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast?.(`✅ تم تحديث نتيجة مقياس وكسلر (WISC-V) بنجاح (IQ: ${psychometrics.fsiq})`, 'ok');
    } else {
      lsAdd('studentAssessments', payload);
      toast?.(`✅ تم حفظ تقييم مقياس وكسلر (WISC-V) بنجاح (IQ: ${psychometrics.fsiq})`, 'ok');
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
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 16,
          overflow: 'hidden',
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          className="modal-header-custom"
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              🧠
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#fff' }}>
                  مقياس وكسلر لذكاء الأطفال (WISC-V)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '.72rem', fontWeight: 700 }}>
                  الطبعة الخامسة المقننة · 5 مؤشرات معرفية
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#311068', color: '#e9d5ff', fontSize: '0.68rem', fontWeight: 800 }}>
                  © Pearson Clinical / د. ديفيد وكسلر
                </span>
                <span style={{ fontSize: '0.76rem', color: '#f3e8ff', opacity: 0.95 }}>
                  Wechsler Intelligence Scale for Children — المعيار الذهبي لقياس القدرات العقلية ونسبة الذكاء
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
                color: showCopyrightDetails ? '#5b21b6' : '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
                fontSize: '.78rem',
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء حقوق المقياس' : 'إظهار حقوق المقياس'}
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={safeClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* EXPANDABLE COPYRIGHT & SCIENTIFIC ATTRIBUTION */}
        {showCopyrightDetails && (
          <div
            style={{
              background: '#faf5ff',
              padding: '14px 20px',
              borderBottom: '2px solid #c084fc',
              fontSize: '0.82rem',
              color: '#581c87',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس WISC-V:
            </div>

            <div
              style={{
                background: '#f3e8ff',
                border: '1px solid #d8b4fe',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#6b21a8',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار حقوق الملكية والاعتماد:</strong> مقياس وكسلر لذكاء الأطفال — الطبعة الخامسة (WISC-V) · المطور: د. ديفيد وكسلر · الناشر والمطور العالمي: مؤسسة بيرسون للتقييم الإكلينيكي (Pearson Clinical Assessment).
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#e9d5ff', color: '#581c87', padding: '3px 8px', borderRadius: 6, border: '1px solid #c084fc', fontWeight: 700 }}>
                مخصص للتشخيص والتقييم النفسي الإكلينيكي والتربوي
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #e9d5ff' }}>
                <strong>المؤلف الأصلي:</strong> {WISC5_COPYRIGHT_INFO.authorAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #e9d5ff' }}>
                <strong>جهة النشر والتطوير:</strong> {WISC5_COPYRIGHT_INFO.publisherAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #e9d5ff' }}>
                <strong>الفئة العمرية المستهدفة:</strong> {WISC5_COPYRIGHT_INFO.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #e9d5ff' }}>
                <strong>المرجعية المعيارية:</strong> {WISC5_COPYRIGHT_INFO.standardsReference}
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#6b21a8', background: '#f3e8ff', padding: '8px 12px', borderRadius: 8 }}>
              {WISC5_COPYRIGHT_INFO.notice}
              <br />
              <strong>{WISC5_COPYRIGHT_INFO.disclaimer}</strong>
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
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>
                معامل الذكاء الكلي (FSIQ):
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: psychometrics.severityColor }}>
                  {psychometrics.fsiq}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                  (رتبة مئينية: {psychometrics.overallPercentile}%)
                </span>
              </div>
            </div>

            {/* Sum of Scaled Scores */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', display: 'block' }}>مجموع الدرجات المعيارية:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6d28d9' }}>
                {psychometrics.sumScaledScores} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>/ 95</small>
              </span>
            </div>

            {/* 5 Cognitive Index Gauges */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {psychometrics.domainResults.map(d => (
                <div
                  key={d.id}
                  style={{
                    background: 'var(--bg-card)',
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: `1px solid ${d.color}`,
                    fontSize: '.72rem',
                    textAlign: 'center',
                  }}
                  title={`${d.name} (${d.code})`}
                >
                  <span style={{ display: 'block', fontWeight: 700, color: d.color }}>{d.code}</span>
                  <span style={{ fontWeight: 800 }}>{d.compositeScore}</span>
                  <small style={{ color: 'var(--text-sub)', fontSize: '.65rem' }}> ({d.scaledScore})</small>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="bdg"
              style={{
                background: `${psychometrics.severityColor}18`,
                color: psychometrics.severityColor,
                border: `1px solid ${psychometrics.severityColor}`,
                fontSize: '.78rem',
                fontWeight: 800,
                padding: '4px 10px',
              }}
            >
              {psychometrics.classification.split('(')[0].trim()}
            </span>
            <span style={{ fontSize: '.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>
              ({psychometrics.totalAnswered} من {psychometrics.totalItems} بنداً)
            </span>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          {/* STUDENT DEMOGRAPHICS & PROFILE CARD */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>👤</span>
                <strong>بيانات المفحوص والأخصائي النفسي</strong>
                {form.studentName && (
                  <span className="bdg b-bl" style={{ fontSize: '.72rem' }}>{form.studentName} {form.age ? `(${form.age})` : ''}</span>
                )}
              </div>
              <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>
                {isHeaderCollapsed ? '🔽 فتح البيانات' : '🔼 طي البيانات'}
              </span>
            </div>

            {!isHeaderCollapsed && (
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                <div>
                  <label className="lbl">اختيار الطالب / المفحوص *</label>
                  <select
                    className="inp"
                    value={form.mode === 'other' ? '__other__' : form.stuId}
                    onChange={handleSelectStudent}
                  >
                    <option value="">-- اختر طالباً مسجلاً --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.age || s.dob || 'غير محدد'})</option>
                    ))}
                    <option value="__other__">✏️ إدخال يدوي لطالب خارجي</option>
                  </select>
                </div>

                <div>
                  <label className="lbl">اسم المفحوص</label>
                  <input
                    type="text"
                    className="inp"
                    value={form.studentName}
                    onChange={e => setForm({ ...form, studentName: e.target.value })}
                    placeholder="اسم الطالب كاملاً"
                  />
                </div>

                <div>
                  <label className="lbl">العمر الزمني</label>
                  <input
                    type="text"
                    className="inp"
                    value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })}
                    placeholder="مثال: 8 سنوات و 4 أشهر"
                  />
                </div>

                <div>
                  <label className="lbl">تاريخ التقييم</label>
                  <input
                    type="date"
                    className="inp"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="lbl">الصف الدراسي / المدرسة</label>
                  <input
                    type="text"
                    className="inp"
                    value={form.grade}
                    onChange={e => setForm({ ...form, grade: e.target.value })}
                    placeholder="الصف الثالث الابتدائي"
                  />
                </div>

                <div>
                  <label className="lbl">الأخصائي النفسي الفاحص</label>
                  <input
                    type="text"
                    className="inp"
                    value={form.examinerName}
                    onChange={e => setForm({ ...form, examinerName: e.target.value })}
                    placeholder="اسم الأخصائي النفسي المعتمد"
                  />
                </div>
              </div>
            )}
          </div>

          {/* QUICK ACTION BAR */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 14,
              background: 'var(--g0)',
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)' }}>تعبئة سريعة للمعاينة:</span>
              <button type="button" className="btn btn-xs btn-g" onClick={() => autoFillSample('gifted')}>🌟 موهبة وتفوق (130+)</button>
              <button type="button" className="btn btn-xs btn-g" onClick={() => autoFillSample('average')}>📊 متوسط طبيعي (100)</button>
              <button type="button" className="btn btn-xs btn-g" onClick={() => autoFillSample('borderline')}>⚠️ حدّي / بطء (75)</button>
              <button type="button" className="btn btn-xs btn-g" onClick={() => autoFillSample('id')}>🛑 قصور فكري (60)</button>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="text"
                className="inp"
                style={{ width: 180, fontSize: '.78rem', padding: '4px 8px' }}
                placeholder="🔍 بحث في البنود..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-xs"
                onClick={applyAutoClinicalSummary}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontWeight: 800 }}
              >
                ✨ توليد الخلاصة والأهداف
              </button>
            </div>
          </div>

          {/* DOMAIN FILTER TABS */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 8,
              marginBottom: 14,
              scrollbarWidth: 'thin',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveDomainFilter('all')}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: 8,
                border: activeDomainFilter === 'all' ? '2px solid #7c3aed' : '1px solid var(--border-color)',
                background: activeDomainFilter === 'all' ? '#f5f3ff' : 'var(--g0)',
                color: activeDomainFilter === 'all' ? '#6d28d9' : 'var(--text-main)',
                fontWeight: activeDomainFilter === 'all' ? 800 : 600,
                fontSize: '.78rem',
                cursor: 'pointer',
              }}
            >
              🌐 كل المؤشرات ({WISC5_ITEMS.length})
            </button>

            {WISC5_DOMAINS.map(dom => {
              const count = WISC5_ITEMS.filter(it => it.domainId === dom.id).length;
              const answered = WISC5_ITEMS.filter(it => it.domainId === dom.id && form.scores[it.id] !== undefined).length;
              const isCurrent = activeDomainFilter === dom.id;
              return (
                <button
                  key={dom.id}
                  type="button"
                  onClick={() => setActiveDomainFilter(dom.id)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: isCurrent ? `2px solid ${dom.color}` : '1px solid var(--border-color)',
                    background: isCurrent ? dom.bgLight : 'var(--g0)',
                    color: isCurrent ? dom.color : 'var(--text-main)',
                    fontWeight: isCurrent ? 800 : 600,
                    fontSize: '.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{dom.icon}</span>
                  <span>{dom.name}</span>
                  <span
                    className="bdg"
                    style={{
                      background: answered === count ? '#dcfce7' : '#f1f5f9',
                      color: answered === count ? '#166534' : '#475569',
                      fontSize: '.65rem',
                      padding: '1px 5px',
                    }}
                  >
                    {answered}/{count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ITEMS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {filteredItems.map(item => {
              const currentScore = form.scores[item.id];
              const isAnswered = currentScore !== undefined && currentScore !== null;
              const dom = WISC5_DOMAINS.find(d => d.id === item.domainId);

              return (
                <div
                  key={item.id}
                  style={{
                    background: isAnswered ? 'var(--bg-card)' : 'var(--g0)',
                    border: isAnswered ? `1.5px solid ${dom?.borderColor || 'var(--border-color)'}` : '1px dashed var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span className="bdg" style={{ background: dom?.bgLight, color: dom?.color, border: `1px solid ${dom?.borderColor}`, fontSize: '.7rem', fontWeight: 800 }}>
                          {dom?.icon} {dom?.name} ({item.subtest})
                        </span>
                        <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                          بند #{item.id}
                        </span>
                      </div>
                      <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', marginTop: 2 }}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {/* RESPONSE BUTTONS (0 to 3) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6, marginTop: 8 }}>
                    {WISC5_RESPONSE_OPTIONS.map(opt => {
                      const isSelected = currentScore === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleScoreSelect(item.id, opt.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            border: isSelected ? '2px solid #7c3aed' : '1px solid var(--border-color)',
                            background: isSelected ? '#f5f3ff' : 'var(--bg-card)',
                            color: isSelected ? '#5b21b6' : 'var(--text-main)',
                            fontWeight: isSelected ? 800 : 500,
                            fontSize: '.75rem',
                            textAlign: 'right',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                          }}
                        >
                          <span style={{ fontWeight: isSelected ? 800 : 700 }}>{opt.label}</span>
                          <span style={{ fontSize: '.68rem', color: isSelected ? '#6d28d9' : 'var(--text-sub)', lineHeight: 1.3 }}>
                            {opt.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* LINKED IEP GOAL & ITEM NOTE */}
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: '.74rem', color: 'var(--text-sub)', borderTop: '1px dashed var(--border-color)', paddingTop: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>🎯 هدف IEP المرتبط:</span>
                      <span>{item.iepGoal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CLINICAL SUMMARY & RECOMMENDATIONS */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📝</span> الخلاصة النفسية والتوصيات الإكلينيكية للخطة الفردية (IEP)
            </div>

            <div>
              <label className="lbl">الخلاصة والتشخيص السريري</label>
              <textarea
                className="inp"
                rows={4}
                value={form.clinicalSummary}
                onChange={e => setForm({ ...form, clinicalSummary: e.target.value })}
                placeholder="الخلاصة والتشخيص النفسي المعرفي (اضغط 'توليد الخلاصة' للتوليد التلقائي المتقن)..."
              />
            </div>

            <div>
              <label className="lbl">التوصيات التربوية والتدخلات المعرفية</label>
              <textarea
                className="inp"
                rows={3}
                value={form.recommendations}
                onChange={e => setForm({ ...form, recommendations: e.target.value })}
                placeholder="توصيات الخطة الفردية وتكييف التعليم..."
              />
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          className="modal-footer-custom"
          style={{
            padding: '12px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onOpenIepBridge && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  handleSave();
                  onOpenIepBridge({
                    ...form,
                    measureId: 'wisc_5',
                    measureName: WISC5_COPYRIGHT_INFO.scaleNameAr,
                    scores: form.scores,
                    results: form.scores,
                  });
                }}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '.8rem',
                }}
              >
                🎯 تحويل نقاط الاحتياج إلى الخطة الفردية (IEP Bridge)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '.82rem',
                padding: '7px 18px',
              }}
            >
              💾 حفظ نتيجة التقييم
            </button>
            <button
              type="button"
              className="btn btn-sm btn-g"
              onClick={safeClose}
              style={{ fontWeight: 700 }}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
