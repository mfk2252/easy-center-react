import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  ATEC_ITEMS,
  ATEC_DOMAINS,
  ATEC_COPYRIGHT_INFO,
  calculateATECPsychometrics,
} from '../../data/atecData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_ATEC_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: '',
  examinerName: '',
  date: todayStr(),
  evaluationPhase: 'baseline', // baseline (قبلي) | progress (متابعة) | post (بعدي)
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function ATECAssessmentModal({
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
        ...EMPTY_ATEC_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_ATEC_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
  const [showLicenseDetails, setShowLicenseDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);

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

  // Real-time Psychometrics Calculation
  const psychometrics = useMemo(() => {
    return calculateATECPsychometrics(form.scores);
  }, [form.scores]);

  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return ATEC_ITEMS;
    return ATEC_ITEMS.filter(it => it.domainId === activeDomainFilter);
  }, [activeDomainFilter]);

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

  function applyAutoClinicalSummary() {
    setForm(f => ({
      ...f,
      clinicalSummary: psychometrics.clinicalImpression,
      recommendations: psychometrics.recommendations,
    }));
    toast?.success?.('تم توليد التقرير الإكلينيكي والتوصيات التأهيلية تلقائياً بناءً على معايير معهد أبحاث التوحد (ARI).');
  }

  function handleSave() {
    const pickCheck = validateStudentPick({
      studentMode: form.mode,
      studentId: form.stuId,
      studentName: form.studentName,
    });
    if (!pickCheck.valid) {
      toast?.error?.(pickCheck.error || 'يرجى تحديد أو إدخال بيانات المفحوص بشكل صحيح.');
      return;
    }

    if (psychometrics.answeredCount === 0) {
      toast?.error?.('يرجى رصد درجات بنود المقياس قبل الحفظ.');
      return;
    }

    // Auto generate impression if blank
    const finalClinicalSummary = form.clinicalSummary.trim() || psychometrics.clinicalImpression;
    const finalRecommendations = form.recommendations.trim() || psychometrics.recommendations;

    const payload = {
      ...form,
      id: form.id || uid(),
      measureId: 'atec',
      scaleType: 'atec',
      measureName: ATEC_COPYRIGHT_INFO.scaleFullNameAr,
      scaleName: 'استمارة تقييم علاج وبرامج التوحد (ATEC)',
      category: 'autism',
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      psychometrics,
      totalScore: psychometrics.rawScore,
      rawScore: psychometrics.rawScore,
      maxScore: psychometrics.maxScore,
      percentage: psychometrics.percentage,
      severity: psychometrics.severityKey,
      severityLabel: psychometrics.severityLabel,
      evaluationPhase: form.evaluationPhase || 'baseline',
      clinicalSummary: finalClinicalSummary,
      recommendations: finalRecommendations,
      updatedAt: new Date().toISOString(),
    };

    if (form.id) {
      lsUpd('studentAssessments', payload);
      toast?.success?.('تم تحديث تقييم ATEC بنجاح.');
    } else {
      payload.createdAt = new Date().toISOString();
      lsAdd('studentAssessments', payload);
      toast?.success?.('تم حفظ واعتماد تقييم ATEC الجديد بنجاح في سجل المفحوص.');
    }

    if (onSaved) onSaved(payload);
    onClose();
  }

  function handleSafeClose() {
    if (psychometrics.answeredCount > 0 && !form.id) {
      if (window.confirm('لديك درجات مرصودة لم يتم حفظها بعد، هل تريد الإغلاق وإلغاء التقييم؟')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 1200, padding: '12px' }}>
      <div
        className="modal-box modal-lg"
        style={{
          maxWidth: 1120,
          width: '98%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--r)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header-custom"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#fff',
            padding: '16px 22px',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.4rem' }}>🧩</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
                  {ATEC_COPYRIGHT_INFO.scaleFullNameAr}
                </h3>
                <span
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 'var(--r3)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  أداة عالمية بدون قيود حقوق (Open Access)
                </span>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 8px',
                    borderRadius: 'var(--r3)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {ATEC_COPYRIGHT_INFO.acronym} · معهد أبحاث التوحد (ARI)
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#e0e7ff', lineHeight: 1.4 }}>
                {ATEC_COPYRIGHT_INFO.purpose}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.75rem',
                }}
              >
                {isHeaderCollapsed ? 'إظهار بيانات المفحوص ▼' : 'طي البيانات ▲'}
              </button>
              <button
                type="button"
                className="btn btn-xs"
                onClick={handleSafeClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '1rem',
                  lineHeight: 1,
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 22px' }}>
          {/* Collapsible Student & Assessment Information Panel */}
          {!isHeaderCollapsed && (
            <div
              style={{
                background: 'var(--g0)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--r)',
                padding: '14px 18px',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--pr)' }}>
                  👤 بيانات المفحوص وسياق التقييم النمائي:
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                  الفئة المستهدفة: {ATEC_COPYRIGHT_INFO.targetAge}
                </span>
              </div>

              <div className="fg c3">
                <div className="fl">
                  <label>اختيار المفحوص من السجل:</label>
                  <select
                    value={form.mode === 'other' ? '__other__' : form.stuId}
                    onChange={handleSelectStudent}
                  >
                    <option value="">-- اختر مفحوصاً مسجلاً بالمركز --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.diagnosis ? `(${s.diagnosis})` : ''}
                      </option>
                    ))}
                    <option value="__other__">➕ إدخال يدوي / مفحوص غير مسجل</option>
                  </select>
                </div>

                <div className="fl">
                  <label>اسم المفحوص كاملاً:</label>
                  <input
                    type="text"
                    value={form.studentName}
                    onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                    placeholder="اسم التلميذ / المفحوص..."
                  />
                </div>

                <div className="fl">
                  <label>تاريخ ميلاد المفحوص:</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={e => {
                      const dobVal = e.target.value;
                      const ageVal = dobVal ? calcAge(dobVal) : form.age;
                      setForm(f => ({ ...f, dob: dobVal, age: ageVal }));
                    }}
                  />
                </div>

                <div className="fl">
                  <label>العمر الزمني المحسوب:</label>
                  <input
                    type="text"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="مثال: 5 سنوات و 3 أشهر"
                  />
                </div>

                <div className="fl">
                  <label>التشخيص الأساسي المسجل:</label>
                  <input
                    type="text"
                    value={form.diagnosis}
                    onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                    placeholder="مثال: اضطراب طيف التوحد (ASD)"
                  />
                </div>

                <div className="fl">
                  <label>تاريخ تطبيق التقييم:</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>

                <div className="fl">
                  <label>الأخصائي المطبق / الفاحص:</label>
                  <select
                    value={form.examinerName}
                    onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                  >
                    <option value="">-- اختر الأخصائي الفاحص --</option>
                    {emps.map(emp => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} {emp.role ? `(${emp.role})` : ''}
                      </option>
                    ))}
                    {currentUser?.name && (
                      <option value={currentUser.name}>{currentUser.name} (أنت)</option>
                    )}
                  </select>
                </div>

                <div className="fl">
                  <label>اسم المستجيب / الملاحظ (ولي الأمر أو المعلم):</label>
                  <input
                    type="text"
                    value={form.raterName}
                    onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    placeholder="مثال: الأم، الأب، المعلم..."
                  />
                </div>

                <div className="fl">
                  <label>مرحلة التقييم (لقياس التطور والتحسن):</label>
                  <select
                    value={form.evaluationPhase}
                    onChange={e => setForm(f => ({ ...f, evaluationPhase: e.target.value }))}
                    style={{ fontWeight: 700 }}
                  >
                    <option value="baseline">🏁 تقييم قبلي مبدئي (Baseline / خط الأساس)</option>
                    <option value="progress">📈 تقييم متابعة دوري (Progress Monitoring)</option>
                    <option value="post">🏆 تقييم بعدي ختامي (Post-treatment / نهاية الخطة)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Copyright & Open-Access Transparency Box */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--r)',
              padding: '10px 16px',
              marginBottom: 16,
              fontSize: '0.8rem',
              color: '#1e40af',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>🏛️</span>
              <span>
                <strong>المرجعية العلمية:</strong> {ATEC_COPYRIGHT_INFO.scaleFullNameEn} · تطوير: {ATEC_COPYRIGHT_INFO.authorsAr} · ناشر: {ATEC_COPYRIGHT_INFO.publisherAr}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLicenseDetails(!showLicenseDetails)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.78rem',
                textDecoration: 'underline',
              }}
            >
              {showLicenseDetails ? 'إخفاء التفاصيل' : 'تفاصيل الرخصة والاستخدام'}
            </button>
            {showLicenseDetails && (
              <div
                style={{
                  width: '100%',
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop: '1px dashed #93c5fd',
                  color: '#1e3a8a',
                  lineHeight: 1.5,
                  fontSize: '0.76rem',
                }}
              >
                {ATEC_COPYRIGHT_INFO.licensingNotice} — يركز المقياس على حساب درجات القصور والاحتياج في 4 مجالات نمائية، حيث تمثل الدرجة الأقل تحسناً وتطوراً أعلى.
              </div>
            )}
          </div>

          {/* Real-time Metric Dashboard */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--r)',
              padding: '14px 18px',
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  المؤشرات الإكلينيكية الحية لتقييم ATEC (الدرجات الكلية والمجالات الفرعية):
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-xs btn-p"
                  onClick={applyAutoClinicalSummary}
                  style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  ⚡ توليد الخلاصة والتوصيات
                </button>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {/* Total Raw Score */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>الدرجة الكلية (ATEC Total):</span>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--pr)', lineHeight: 1.2, marginTop: 2 }}>
                  {psychometrics.rawScore} <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 600 }}>/ 180</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: 3 }}>
                  (كلما انخفضت الدرجة دلت على التحسن)
                </div>
              </div>

              {/* Clinical Severity */}
              <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${psychometrics.severityColor}`, borderRadius: 'var(--r2)', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>التصنيف ومستوى الدعم:</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: psychometrics.severityColor, marginTop: 4 }}>
                  {psychometrics.severityLabel}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: 3 }}>
                  {psychometrics.percentileRange}
                </div>
              </div>

              {/* Progress Completion */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>اكتمال البنود المنجزة:</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: psychometrics.isComplete ? 'var(--ok)' : 'var(--warn)' }}>
                    {psychometrics.answeredCount} / 77
                  </span>
                  <span className={`bdg ${psychometrics.isComplete ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    {psychometrics.progressPercent}%
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--g2)', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${psychometrics.progressPercent}%`, height: '100%', background: 'var(--pr)', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              {/* Phase */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>مرحلة القياس الحالية:</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e3a8a', marginTop: 4 }}>
                  {form.evaluationPhase === 'baseline' && '🏁 خط الأساس (قبلي)'}
                  {form.evaluationPhase === 'progress' && '📈 متابعة دورية'}
                  {form.evaluationPhase === 'post' && '🏆 ختامي (بعدي)'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: 3 }}>
                  تاريخ: {form.date}
                </div>
              </div>
            </div>

            {/* Subscale Progress Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8, marginTop: 12 }}>
              {psychometrics.domainScores.map(dom => (
                <div
                  key={dom.id}
                  style={{
                    background: dom.bgLight,
                    border: `1px solid ${dom.borderColor}`,
                    borderRadius: 'var(--r2)',
                    padding: '8px 12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', fontWeight: 700, color: dom.color }}>
                    <span>{dom.name}</span>
                    <span>{dom.score} / {dom.maxScore}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: '0.7rem', color: 'var(--text-sub)' }}>
                    <span>المنجز: {dom.answered} من {dom.totalItems}</span>
                    <span style={{ color: dom.severityColor, fontWeight: 700 }}>{dom.severityLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Domain Filter Tabs */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📑 بنود الاستمارة التفصيلية (ATEC Subscales):
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                اختر الدرجة المناسبة لكل بند وفق الملاحظة الإكلينيكية واستجابة ولي الأمر
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeDomainFilter === 'all' ? 'on' : ''}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontSize: '0.78rem', padding: '6px 14px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع الأقسام (77 بنداً)
              </button>

              {ATEC_DOMAINS.map(dom => {
                const domRes = psychometrics.domainScores.find(d => d.id === dom.id);
                const isActive = activeDomainFilter === dom.id;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    className={`tab ${isActive ? 'on' : ''}`}
                    onClick={() => setActiveDomainFilter(dom.id)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 14px',
                      whiteSpace: 'nowrap',
                      borderRight: `3px solid ${dom.color}`,
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: dom.color, display: 'inline-block', marginLeft: 6 }} />
                    {dom.name.split('/')[0]} ({domRes ? `${domRes.answered}/${domRes.totalItems}` : dom.itemsCount})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 77 Clinical Behavioral Item Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const currentScore = form.scores[item.id] !== undefined ? Number(form.scores[item.id]) : null;
              const isAnswered = currentScore !== null;
              const dom = ATEC_DOMAINS.find(d => d.id === item.domainId);

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: isAnswered
                      ? currentScore >= 2
                        ? '1.5px solid var(--err)'
                        : currentScore === 1
                        ? '1.5px solid var(--warn)'
                        : '1.5px solid var(--ok)'
                      : '1px solid var(--border-color)',
                    borderRadius: 'var(--r)',
                    padding: '14px 18px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Item Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: '260px' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--r2)',
                          background: dom?.color || 'var(--pr)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                          flexShrink: 0,
                        }}
                      >
                        {item.id}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {item.title}
                          </h4>
                          <span
                            className="bdg"
                            style={{
                              background: dom?.bgLight || 'var(--g0)',
                              color: dom?.color || 'var(--pr)',
                              border: `1px solid ${dom?.borderColor || 'var(--pr)'}`,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            {dom?.name}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.45 }}>
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {isAnswered && (
                      <div
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          padding: '4px 12px',
                          borderRadius: 'var(--r2)',
                          background: currentScore >= 2 ? 'var(--err-l)' : currentScore === 1 ? 'var(--warn-l)' : 'var(--ok-l)',
                          color: currentScore >= 2 ? 'var(--err)' : currentScore === 1 ? 'var(--warn)' : 'var(--ok-d)',
                          border: `1px solid ${currentScore >= 2 ? 'var(--err)' : currentScore === 1 ? 'var(--warn)' : 'var(--ok)'}`,
                          flexShrink: 0,
                        }}
                      >
                        الدرجة المرصودة: {currentScore} نقاط
                      </div>
                    )}
                  </div>

                  {/* Interactive Anchor Rating Buttons (الخيارات والشرح الداخلي لكل عنصر) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(auto-fit, minmax(${item.anchors.length === 4 ? '200px' : '230px'}, 1fr))`,
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {item.anchors.map(anchor => {
                      const isSelected = currentScore === anchor.score;

                      let activeBorder = dom?.color || 'var(--pr)';
                      let activeBg = dom?.bgLight || 'var(--pr-l)';

                      return (
                        <button
                          key={anchor.score}
                          type="button"
                          onClick={() => handleScoreSelect(item.id, anchor.score)}
                          style={{
                            background: isSelected ? activeBg : 'var(--bg-card)',
                            border: isSelected ? `2px solid ${activeBorder}` : '1px solid var(--border-color)',
                            borderRadius: 'var(--r2)',
                            padding: '10px 12px',
                            textAlign: 'right',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            transition: 'all 0.15s ease',
                            outline: 'none',
                            position: 'relative',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                color: isSelected ? activeBorder : 'var(--text-main)',
                              }}
                            >
                              {anchor.label}
                            </span>
                            <span
                              className={`bdg ${isSelected ? 'b-bl' : 'b-gr'}`}
                              style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                            >
                              {anchor.score} نقطة
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              color: isSelected ? 'var(--text-main)' : 'var(--text-sub)',
                              lineHeight: 1.4,
                            }}
                          >
                            {anchor.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional Item Observation / Clinical Evidence */}
                  <div style={{ marginTop: 10 }}>
                    <input
                      type="text"
                      value={form.itemNotes[item.id] || ''}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      placeholder="✍️ شواهد أو ملاحظات سلوكية وتكرارات لهذا البند (اختياري)..."
                      style={{
                        width: '100%',
                        fontSize: '0.78rem',
                        padding: '6px 12px',
                        borderRadius: 'var(--r3)',
                        border: '1px dashed var(--border-color)',
                        background: 'var(--g0)',
                        color: 'var(--text-main)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diagnostic Summary & Evidence-Based Recommendations Section */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--r)',
              padding: '16px 20px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📝</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--pr)' }}>
                  الخلاصة الإكلينيكية التشخيصية والتوصيات العلاجية (ATEC Summary & Recommendations):
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isManualEdit}
                    onChange={e => setIsManualEdit(e.target.checked)}
                  />
                  <span>تعديل يدوي حر</span>
                </label>

                <button
                  type="button"
                  className="btn btn-xs btn-p"
                  onClick={applyAutoClinicalSummary}
                  style={{ fontWeight: 700 }}
                >
                  ⚡ توليد تلقائي للتقرير
                </button>
              </div>
            </div>

            <div className="fg c2">
              <div className="fl">
                <label style={{ fontWeight: 700 }}>
                  الخلاصة الإكلينيكية ومستوى التطور:
                </label>
                <textarea
                  rows={6}
                  value={form.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="سيتم توليد ملخص إكلينيكي مفصل يوضح الدرجة الكلية وتوزيع المجالات ومستوى الدعم المطلوب..."
                  style={{ lineHeight: 1.6, fontSize: '0.82rem' }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700 }}>
                  التوصيات التأهيلية وأولويات خطة التدخل (IEP Priorities):
                </label>
                <textarea
                  rows={6}
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="التوصيات المبنية على الأدلة: التدخل السلوكي ABA، التخاطب والتواصل، التكامل الحسي، وتدريب الأسرة..."
                  style={{ lineHeight: 1.6, fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer (وفق تصميم CARS-2 المعتمد) */}
        <div
          className="modal-footer-custom"
          style={{
            padding: '12px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            flexShrink: 0,
          }}
        >
          {/* Quick status preview in footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span>البنود المكتملة: <strong style={{ color: psychometrics.isComplete ? 'var(--ok)' : 'var(--warn)' }}>{psychometrics.answeredCount} من 77</strong></span>
            <span>الدرجة الكلية: <strong style={{ color: 'var(--pr)' }}>{psychometrics.rawScore} / 180</strong></span>
            <span>النسبة: <strong>{psychometrics.percentage}</strong></span>
            <span>التصنيف: <strong style={{ color: psychometrics.severityColor }}>{psychometrics.severityLabel}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={handleSafeClose}
            >
              إلغاء
            </button>

            <button
              type="button"
              className="btn btn-p"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#fff',
                fontWeight: 800,
                padding: '8px 20px',
              }}
            >
              💾 حفظ تقييم ATEC واعتماد النتيجة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
