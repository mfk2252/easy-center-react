import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import {
  PPVT5_SETS,
  PPVT5_ITEMS,
  PPVT5_SET_METADATA,
  PPVT5_WORD_TYPES,
  PPVT5_RESPONSE_OPTIONS,
  PPVT5_COPYRIGHT_INFO,
  getPPVT5StartSetByAge,
  calculatePPVT5Psychometrics,
} from '../../data/ppvt5Data';

const EMPTY_PPVT_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  examinerName: '',
  specialistName: '',
  raterName: '',
  informantName: '',
  raterRelation: '',
  grade: '',
  date: todayStr(),
  notes: '',
  scores: {}, // Map of item_id -> 1 | 0
  itemNotes: {},
  clinicalSummary: '',
  recommendations: '',
  customStartSet: null,
};

export default function Ppvt5AssessmentModal({
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
      const existingScores = initialData.scores || initialData.results || {};
      // Normalize true/false to 1/0
      const normalizedScores = {};
      Object.entries(existingScores).forEach(([k, v]) => {
        normalizedScores[k] = v === true || v === 1 || v === '1' ? 1 : 0;
      });

      return {
        ...EMPTY_PPVT_FORM,
        ...initialData,
        examinerName: initialData.examinerName || initialData.specialistName || currentUser?.name || '',
        raterName: initialData.raterName || initialData.informantName || '',
        scores: normalizedScores,
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_PPVT_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeSetFilter, setActiveSetFilter] = useState('all'); // 'all' | 1 | 2 | ... | 8
  const [activeTypeFilter, setActiveTypeFilter] = useState('all'); // 'all' | 'أسماء' | 'أفعال' | 'صفات' | 'مفاهيم'
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Auto calculate chronological age in months
  const studentAgeMonths = useMemo(() => {
    if (!form.dob) return 72; // default 6 years
    const ageObj = calcAge(form.dob);
    return Math.max(30, ageObj.years * 12 + ageObj.months);
  }, [form.dob]);

  // Set recommended starting set once student is selected
  useEffect(() => {
    if (form.stuId && !form.customStartSet && !initialData) {
      const recommendedSet = getPPVT5StartSetByAge(studentAgeMonths);
      setActiveSetFilter(recommendedSet);
    }
  }, [form.stuId, studentAgeMonths, form.customStartSet, initialData]);

  // Handle student selection from dropdown
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
      }));
      setIsManualEdit(true);
      return;
    }

    if (!val) {
      setForm(f => ({
        ...f,
        mode: 'select',
        stuId: '',
        studentName: '',
        dob: '',
        age: '',
        diagnosis: '',
        grade: '',
      }));
      return;
    }

    const st = students.find(s => s.id === val);
    if (st) {
      const ageStr = st.dob ? calcAge(st.dob).formatted : (st.age || '');
      setForm(f => ({
        ...f,
        mode: 'select',
        stuId: st.id,
        studentName: st.name,
        dob: st.dob || '',
        age: ageStr,
        diagnosis: st.diagnosis || '',
        grade: st.grade || '',
      }));
      setIsManualEdit(false);
    }
  }

  // Real-time Psychometrics calculation
  const psychometrics = useMemo(() => {
    return calculatePPVT5Psychometrics(form.scores, studentAgeMonths);
  }, [form.scores, studentAgeMonths]);

  // Filter items based on activeSetFilter and activeTypeFilter
  const filteredItems = useMemo(() => {
    return PPVT5_ITEMS.filter(it => {
      if (activeSetFilter !== 'all' && it.setId !== Number(activeSetFilter)) return false;
      if (activeTypeFilter !== 'all' && it.type !== activeTypeFilter) return false;
      return true;
    });
  }, [activeSetFilter, activeTypeFilter]);

  // Handle score change
  function handleScoreSelect(itemId, scoreValue) {
    setForm(f => {
      const nextScores = { ...f.scores };
      if (nextScores[itemId] === scoreValue) {
        delete nextScores[itemId];
      } else {
        nextScores[itemId] = scoreValue;
      }
      return { ...f, scores: nextScores };
    });
  }

  // Handle picture card selection
  function handlePictureSelect(item, picIndex1Based) {
    const isCorrect = picIndex1Based === item.targetPic;
    handleScoreSelect(item.id, isCorrect ? 1 : 0);
  }

  // Handle item note change
  function handleItemNoteChange(itemId, noteText) {
    setForm(f => ({
      ...f,
      itemNotes: {
        ...f.itemNotes,
        [itemId]: noteText,
      },
    }));
  }

  // Auto fill sample assessment
  function autoFillSample(levelType = 'normal') {
    const newScores = {};
    PPVT5_ITEMS.forEach(it => {
      if (levelType === 'normal') {
        // High success rate in sets 1-4, moderate in 5-6
        if (it.setId <= 3) newScores[it.id] = 1;
        else if (it.setId <= 5) newScores[it.id] = Math.random() > 0.15 ? 1 : 0;
        else newScores[it.id] = Math.random() > 0.4 ? 1 : 0;
      } else if (levelType === 'moderate') {
        // Moderate delay
        if (it.setId <= 2) newScores[it.id] = 1;
        else if (it.setId <= 4) newScores[it.id] = Math.random() > 0.45 ? 1 : 0;
        else newScores[it.id] = Math.random() > 0.75 ? 1 : 0;
      } else {
        // Severe delay
        if (it.setId === 1) newScores[it.id] = Math.random() > 0.3 ? 1 : 0;
        else newScores[it.id] = 0;
      }
    });

    setForm(f => ({ ...f, scores: newScores }));
    toast('⚡ تم توليد نموذج إجابات افتراضي متقن للاختبار والتجربة السريعة', 'ok');
  }

  // Auto generate clinical summary
  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 10) {
      toast('⚠️ يرجى تقييم عدد كافٍ من المفردات (10 بنود على الأقل) لتوليد الخلاصة التشخيصية', 'er');
      return;
    }

    const setDetails = psychometrics.setResults
      .filter(s => s.answeredCount > 0)
      .map(s => `• ${s.name}: إتقان (${s.correctCount}/${s.answeredCount}) بنسبة (${s.percentage}%) ${s.isBasal ? ' [قاعدي ✓]' : ''} ${s.isCeiling ? ' [سقف ⚠️]' : ''}`)
      .join('\n');

    const catDetails = psychometrics.categoryResults
      .map(c => `• ${c.name}: (${c.correctCount}/${c.answeredCount || c.totalItems}) إتقان ${c.percentage}% - [${c.status}]`)
      .join('\n');

    const suggestedSummary = `تقرير التقييم السيكومتري للحصيلة اللفظية المصورة بمقياس بيبودي (PPVT-5) - إعداد د. دوغلاس دان & د. لويد دان:\n\n` +
      `- الدرجة المعيارية (Standard Score): (${psychometrics.standardScore}) بالرتبة المئينية (${psychometrics.percentile}%).\n` +
      `- الدرجة الخام المحققة: (${psychometrics.rawScore}/96) بنداً مصوراً.\n` +
      `- العمر اللغوي المكافئ (Age Equivalent): (${psychometrics.ageEquivalentLabel}) مقارنة بالعمر الزمني الفعلي (${psychometrics.ageLabel}).\n` +
      `- الفارق النمائي المعجمي: (${psychometrics.ageDiffMonths > 0 ? `تأخر قدره ${psychometrics.ageDiffMonths} شهراً` : 'متطابق/متقدم عن السن الزمني'}).\n\n` +
      `التشخيص الإكلينيكي:\n` +
      `التصنيف التشخيصي: [${psychometrics.level}]\n\n` +
      `الأداء على المجموعات النمائية المتدرجة:\n${setDetails}\n\n` +
      `التحليل الدلالي لمجموعات المفردات:\n${catDetails}\n\n` +
      `الخلاصة:\n${psychometrics.clinicalImpression}`;

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: psychometrics.recommendations,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية والتوصيات التربوية بدقة فائقة', 'ok');
  }

  // Handle Save
  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً', 'er');
      return;
    }

    if (!form.date) {
      toast('⚠️ يرجى إدخال تاريخ التقييم', 'er');
      return;
    }

    if (psychometrics.totalAnswered < 12) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.totalAnswered} من أصل 96 مفردة. هل تود حفظ المقياس كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'ppvt_5',
      scaleId: 'ppvt_5',
      measureName: 'مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5)',
      scaleName: 'مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5)',
      category: 'speech_language',
      categoryName: 'النطق والتخاطب والنمو اللغوي',
      score: psychometrics.standardScore,
      standardScore: psychometrics.standardScore,
      rawScore: psychometrics.rawScore,
      percentile: psychometrics.percentile,
      ageEquivalent: psychometrics.ageEquivalentLabel,
      percentage: psychometrics.completionPercentage,
      level: psychometrics.level,
      severityLevel: psychometrics.level,
      severityKey: psychometrics.severityKey,
      color: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      psychometrics,
      author: PPVT5_COPYRIGHT_INFO.authorAr,
      publisher: PPVT5_COPYRIGHT_INFO.publisherAr,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم بيبودي (PPVT-5) بنجاح', 'ok');
    } else {
      const newId = uid();
      lsAdd('studentAssessments', {
        ...payload,
        id: newId,
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق مقياس بيبودي (PPVT-5) بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  // Safe close with confirmation
  function handleSafeClose() {
    const answeredCount = Object.keys(form.scores || {}).length;
    if (answeredCount > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${answeredCount}) مفردة في المقياس. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="mbg">
      <div
        className="mb"
        style={{
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          width: '100%',
        }}
      >
        {/* Modal Main Header */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>📚</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  96 مفردة مصورة · 8 مجموعات متدرجة
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#134e4a', color: '#ccfbf1', fontSize: '0.68rem', fontWeight: 800 }}>
                  © Pearson / د. دوغلاس دان & د. لويد دان
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Peabody Picture Vocabulary Test (5th Ed) — الأداة المعيارية المعتمدة لتقييم الحصيلة اللفظية والمفردات الاستقبالية
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
                color: showCopyrightDetails ? '#0f766e' : '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء حقوق الملكية' : 'حقوق الملكية الفكرية'}
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleSafeClose}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700 }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* EXPANDABLE DETAILED COPYRIGHT NOTICE */}
        {showCopyrightDetails && (
          <div
            style={{
              background: '#f0fdfa',
              padding: '14px 20px',
              borderBottom: '2px solid #99f6e4',
              fontSize: '0.82rem',
              color: '#134e4a',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس PPVT-5:
            </div>

            <div
              style={{
                background: '#ccfbf1',
                border: '1px solid #5eead4',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#115e59',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار حقوق الملكية الفكرية والاعتماد العلمي:</strong> مقياس بيبودي للمفردات اللغوية المصورة (الإصدار الخامس) — تأليف: د. دوغلاس إم. دان & د. لويد إم. دان (Douglas M. Dunn & Lloyd M. Dunn) · بيرسون للتقييم الإكلينيكي (Pearson Clinical).
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#f0fdfa', padding: '3px 8px', borderRadius: 6, border: '1px solid #99f6e4', fontWeight: 700 }}>
                مخصص للتشخيص الإكلينيكي والتخاطبي المرخص
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>المؤلف الأصلي:</strong> {PPVT5_COPYRIGHT_INFO.authorAr} ({PPVT5_COPYRIGHT_INFO.authorEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>جهة النشر الأصلية:</strong> {PPVT5_COPYRIGHT_INFO.publisherAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>الفئة المستهدفة:</strong> {PPVT5_COPYRIGHT_INFO.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>المرجعية السيكومترية:</strong> {PPVT5_COPYRIGHT_INFO.standardsReference}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#115e59', background: '#ccfbf1', padding: '8px 12px', borderRadius: 8 }}>
              {PPVT5_COPYRIGHT_INFO.notice}
              <br />
              <strong>{PPVT5_COPYRIGHT_INFO.disclaimer}</strong>
            </div>
          </div>
        )}

        {/* Real-time Psychometrics & Diagnostic Strip */}
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
            {/* Standard Score (SS) */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #0d9488',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة المعيارية (SS):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.standardScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                (مئيني: {psychometrics.percentile}%)
              </span>
            </div>

            {/* Raw Score */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة الخام (Raw):</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f766e' }}>
                {psychometrics.rawScore} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>/ 96</small>
              </span>
            </div>

            {/* Age Equivalent */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>العمر اللغوي المكافئ (AE):</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                <b style={{ color: '#0284c7' }}>{psychometrics.ageEquivalentLabel}</b>
              </span>
            </div>

            {/* Basal & Ceiling Sets */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>القاعدة / السقف:</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                قاعدة: <b style={{ color: '#059669' }}>مجموعة {psychometrics.basalSetId}</b> | سقف: <b style={{ color: '#d97706' }}>مجموعة {psychometrics.ceilingSetId}</b>
              </span>
            </div>

            {/* Diagnosis Result Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>التصنيف:</span>
              <span className={`bdg ${psychometrics.severityClass}`} style={{ fontWeight: 800, fontSize: '0.78rem' }}>
                {psychometrics.level.split(' (')[0]}
              </span>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {psychometrics.totalAnswered} / {psychometrics.totalItems} مفردة
              </span>
              <div style={{ width: 60, height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${psychometrics.completionPercentage}%`,
                    height: '100%',
                    background: psychometrics.completionPercentage === 100 ? 'var(--ok)' : '#0d9488',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. Student & Assessment Info Card - Compact Refactored Header */}
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
                  color: '#0f766e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>👦</span>
                <span>بيانات المفحوص والفحص اللغوي والإكلينيكي</span>
                {form.studentName && (
                  <span
                    style={{
                      fontSize: '0.76rem',
                      background: '#ccfbf1',
                      color: '#0f766e',
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
                        placeholder="اكتب اسم الطالب / المفحوص..."
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
                          {s.name}
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
                      value={form.age || (form.dob ? calcAge(form.dob).formatted : '')}
                      readOnly={!isManualEdit}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                      placeholder="تلقائي حسب تاريخ الميلاد"
                    />
                  </div>

                  {/* 3. Medical / Language Diagnosis */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>التشخيص الطبي / اللغوي</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.diagnosis || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                      placeholder="مثال: تأخر نمو لغوي، اضطراب طيف التوحد..."
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
                  {/* 1. Examiner / SLP Name */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>أخصائي التخاطب / الفاحص</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم أخصائي النطق والتخاطب"
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    />
                  </div>

                  {/* 2. Respondent Name */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المرافق / المستجيب</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم ولي الأمر / المعلم المصاحب"
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  {/* 3. Grade / Classroom */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الصف / المستوى التعليمي</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      type="text"
                      placeholder="مثال: الروضة، الصف الأول..."
                      value={form.grade || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                    />
                  </div>

                  {/* 4. Relationship / Role */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صلة القرابة / الصفة</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="مثال: الأم، الأب، معلم الدمج..."
                      value={form.raterRelation || ''}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Subscale / Set Navigation Tabs & Word Type Filter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📑 مجموعات المفردات النمائية المتدرجة (PPVT-5 Sets):
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                اختر 1 للإشارة الصحيحة للصورة المستهدفة، أو 0 للاستجابة الخاطئة
              </div>
            </div>

            {/* Set Tabs */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
              <button
                type="button"
                className={`tab ${activeSetFilter === 'all' ? 'on' : ''}`}
                onClick={() => setActiveSetFilter('all')}
                style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع المجموعات (96)
              </button>
              {PPVT5_SET_METADATA.map(setMeta => {
                const setStat = psychometrics.setResults.find(s => s.id === setMeta.id);
                return (
                  <button
                    key={setMeta.id}
                    type="button"
                    className={`tab ${activeSetFilter === setMeta.id ? 'on' : ''}`}
                    onClick={() => setActiveSetFilter(setMeta.id)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      whiteSpace: 'nowrap',
                      borderRight: `3px solid ${setMeta.color}`,
                    }}
                  >
                    {setMeta.icon} {setMeta.name.split(' ')[0]} {setMeta.id} ({setStat?.correctCount || 0}/{setMeta.itemsCount})
                    {setStat?.isBasal && <span style={{ marginRight: 4, color: '#059669', fontWeight: 900 }}>✓</span>}
                    {setStat?.isCeiling && <span style={{ marginRight: 4, color: '#dc2626', fontWeight: 900 }}>⚠️</span>}
                  </button>
                );
              })}
            </div>

            {/* Word Types Filter Pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {PPVT5_WORD_TYPES.map(wType => (
                <button
                  key={wType.id}
                  type="button"
                  onClick={() => setActiveTypeFilter(wType.id)}
                  className={`btn btn-xs ${activeTypeFilter === wType.id ? 'btn-p' : 'btn-g'}`}
                  style={{
                    fontSize: '0.74rem',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontWeight: activeTypeFilter === wType.id ? 800 : 500,
                  }}
                >
                  {wType.icon} {wType.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const currentScore = form.scores[item.id];
              const currentNote = form.itemNotes[item.id] || '';
              const setMeta = PPVT5_SET_METADATA.find(s => s.id === item.setId);

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore !== undefined
                      ? (currentScore === 1 ? '1.5px solid #0d9488' : '1.5px solid #ef4444')
                      : '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    
                    {/* Item Info & Target Word */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: '260px' }}>
                      <span
                        style={{
                          background: setMeta?.color || '#0d9488',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        #{item.id} · {setMeta?.code} · {item.type}
                      </span>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                            {item.word}
                          </span>
                          <span className="bdg b-gr" style={{ fontSize: '0.7rem' }}>
                            الصورة المستهدفة: رقم {item.targetPic} ({item.pics[item.targetPic - 1]})
                          </span>
                        </div>

                        {item.example && (
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-sub)',
                              marginTop: 4,
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 6,
                              lineHeight: 1.4,
                            }}
                          >
                            <span style={{ color: '#0d9488', fontWeight: 800, flexShrink: 0, fontSize: '0.74rem' }}>
                              💡 الوصف والمثير:
                            </span>
                            <span style={{ color: 'var(--text-sub)' }}>
                              {item.example}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick 1 / 0 Score Buttons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {PPVT5_RESPONSE_OPTIONS.map(opt => {
                        const isSelected = currentScore === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleScoreSelect(item.id, opt.value)}
                            className={`btn btn-xs ${isSelected ? 'btn-p' : 'btn-g'}`}
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              fontWeight: isSelected ? 800 : 500,
                              background: isSelected
                                ? (opt.value === 1 ? '#059669' : '#dc2626')
                                : undefined,
                              color: isSelected ? '#fff' : undefined,
                              border: isSelected ? 'none' : undefined,
                            }}
                            title={opt.description}
                          >
                            {opt.label.split(' - ')[0]} {isSelected && '✓'}
                          </button>
                        );
                      })}
                      {currentScore !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleScoreSelect(item.id, currentScore)}
                          className="btn btn-xs btn-g"
                          style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                          title="مسح الإجابة"
                        >
                          مسح
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4 Picture Choice Cards for Interactive Clinical Administration */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 8,
                      marginTop: 8,
                      marginBottom: 8,
                    }}
                  >
                    {item.pics.map((picEmoji, idx) => {
                      const picNum = idx + 1;
                      const isTarget = picNum === item.targetPic;
                      const isChosen = currentScore === 1 ? isTarget : false;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePictureSelect(item, picNum)}
                          style={{
                            background: isTarget && currentScore === 1
                              ? '#d1fae5'
                              : isTarget
                              ? 'var(--g0)'
                              : 'var(--bg-card)',
                            border: isTarget && currentScore === 1
                              ? '2px solid #059669'
                              : '1px solid var(--border-color)',
                            borderRadius: 8,
                            padding: '8px 4px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title={`الخيار ${picNum} (${picEmoji}) ${isTarget ? '— الصورة المستهدفة الصحيحة' : ''}`}
                        >
                          <span style={{ fontSize: '1.6rem', marginBottom: 2 }}>{picEmoji}</span>
                          <span style={{ fontSize: '0.72rem', color: isTarget ? '#059669' : 'var(--text-sub)', fontWeight: isTarget ? 800 : 500 }}>
                            صورة {picNum} {isTarget && '★'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional Item Observation Note */}
                  <div style={{ marginTop: 6 }}>
                    <input
                      type="text"
                      placeholder="ملاحظات نطقية، محاولات تخمين، أو استجابات نوعية لهذا البند (اختياري)..."
                      value={currentNote}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      style={{
                        fontSize: '0.76rem',
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px dashed var(--border-color)',
                        width: '100%',
                        background: 'var(--g0)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Diagnostic Interpretation & Recommendations Section */}
          <div style={{ background: 'var(--g0)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> الخلاصة التشخيصية والتقرير السيكومتري المعتمد
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700 }}
              >
                ✨ إعادة توليد الخلاصة بناءً على الدرجات
              </button>
            </div>

            <div className="fg c1">
              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>التقرير السيكومتري والتشخيص الإكلينيكي للحصيلة اللفظية</label>
                <textarea
                  rows={6}
                  placeholder="الخلاصة التشخيصية والوصف النفسي اللغوي وفق معايير PPVT-5..."
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>توصيات الخطة التربوية الفردية (IEP) وجلسات التخاطب</label>
                <textarea
                  rows={5}
                  placeholder="التوصيات العلاجية، استراتيجيات تنمية الحصيلة الاستقبالية، وتصميم أهداف الـ IEP..."
                  value={form.recommendations || ''}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
              تم الإجابة على <strong>{psychometrics.totalAnswered}</strong> من <strong>{PPVT5_ITEMS.length}</strong> مفردة
            </span>
            <span className={`bdg ${psychometrics.completionPercentage === 100 ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.72rem' }}>
              {psychometrics.completionPercentage}% مكتمل
            </span>

            {/* Quick Actions moved to footer */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 6 }}>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => autoFillSample('normal')}
                title="تعبئة نموذج افتراضي يظهر أداءً طبيعياً"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (طبيعي)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => autoFillSample('moderate')}
                title="تعبئة نموذج افتراضي يظهر تأخراً لغوياً متوسطاً"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (تأخر متوسط)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, fontSize: '0.74rem' }}
              >
                ✨ توليد التقرير والتوصيات آلياً
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
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
                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                padding: '8px 20px',
              }}
            >
              💾 حفظ تقييم بيبودي (PPVT-5)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
