import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AQ_CHILD_ITEMS,
  AQ_ADOLESCENT_ITEMS,
  AQ_DOMAINS,
  AQ_RESPONSE_OPTIONS,
  AQ_COPYRIGHT_INFO,
  calculateAQPsychometrics,
} from '../../data/aqData';
import { todayStr, uid, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd, lsGet } from '../../hooks/useStorage';

const EMPTY_FORM = {
  id: '',
  scaleId: 'aq_autism_quotient',
  scaleType: 'aq',
  scaleName: 'مقياس طيف التوحد للأطفال واليافعين — AQ',
  studentName: '',
  stuId: '',
  age: '',
  dob: '',
  gender: 'ذكر',
  diagnosis: '',
  examinerName: '',
  examinerRole: 'أخصائي نفسي / تشخيصي',
  raterName: '',
  raterRelation: 'الأم / الأب',
  date: todayStr(),
  version: 'child', // 'child' (4-11) or 'adolescent' (12-16)
  scores: {},       // { [itemId]: 'def_agree' | 'slight_agree' | 'slight_disagree' | 'def_disagree' }
  itemNotes: {},    // { [itemId]: string }
  clinicalSummary: '',
  recommendations: '',
  mode: 'student',
};

export default function AQAssessmentModal({
  isOpen,
  onClose,
  initialData = null,
  onSaved,
  onOpenReport,
  students = [],
  emps = [],
}) {
  const { currentUser, center, toast } = useApp();

  const showToast = (msg, type = 'ok') => {
    if (typeof toast === 'function') {
      toast(msg, type === 'error' ? 'er' : type === 'success' ? 'ok' : type);
    }
  };

  // Safe students fallback list
  const allStudents = useMemo(() => {
    if (Array.isArray(students) && students.length > 0) return students;
    try {
      const fromLs = lsGet('students');
      return Array.isArray(fromLs) ? fromLs : [];
    } catch {
      return [];
    }
  }, [students]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [showCopyrightInfo, setShowCopyrightInfo] = useState(false);

  // Initialize or populate form on open
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        version: initialData.version || initialData.aqVersion || 'child',
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      });
      setIsManualEdit(Boolean(initialData.isManualEdit));
    } else {
      const defaultExaminer = currentUser?.name || 'الأخصائي الفاحص';
      setForm({
        ...EMPTY_FORM,
        id: uid(),
        date: todayStr(),
        examinerName: defaultExaminer,
      });
      setIsManualEdit(false);
    }
    setActiveDomainFilter('all');
    setShowCopyrightInfo(false);
  }, [isOpen, initialData, currentUser]);

  // Selected items list based on version
  const activeItems = useMemo(() => {
    return form.version === 'adolescent' ? AQ_ADOLESCENT_ITEMS : AQ_CHILD_ITEMS;
  }, [form.version]);

  // Filtered items based on active subscale tab
  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return activeItems;
    return activeItems.filter(item => item.domainId === activeDomainFilter);
  }, [activeItems, activeDomainFilter]);

  // Real-time Psychometrics calculation
  const psychometrics = useMemo(() => {
    return calculateAQPsychometrics(form.scores, form.version);
  }, [form.scores, form.version]);

  if (!isOpen) return null;

  // Handle student selection from dropdown
  function handleSelectStudent(e) {
    const val = e.target.value;
    if (val === '__other__') {
      setForm(f => ({
        ...f,
        stuId: '',
        studentName: '',
        dob: '',
        age: '',
        gender: 'ذكر',
        diagnosis: '',
        mode: 'other',
      }));
      setIsManualEdit(true);
      return;
    }

    const s = allStudents.find(x => x.id === val);
    if (!s) {
      setForm(f => ({
        ...f,
        stuId: '',
        studentName: '',
        dob: '',
        age: '',
        mode: 'student',
      }));
      return;
    }

    let calculatedAge = '';
    let autoVersion = form.version;

    if (s.dob) {
      calculatedAge = calcAge(s.dob);
      const ageNum = parseInt(calculatedAge, 10);
      if (!isNaN(ageNum)) {
        if (ageNum >= 12 && ageNum <= 16) {
          autoVersion = 'adolescent';
        } else if (ageNum >= 4 && ageNum <= 11) {
          autoVersion = 'child';
        }
      }
    }

    setForm(f => ({
      ...f,
      stuId: s.id,
      studentName: s.name,
      dob: s.dob || '',
      age: calculatedAge || s.age || '',
      gender: s.gender || 'ذكر',
      diagnosis: s.diagnosis || s.category || 'طيف التوحد',
      version: autoVersion,
      parentPhone: s.parentPhone || s.phone || '',
      mode: 'student',
    }));
    setIsManualEdit(false);
  }

  function handleAnswer(itemId, optionValue) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: optionValue,
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

  // Quick automated test-cases helper
  function autoFillSample(type = 'autistic') {
    const newScores = {};
    activeItems.forEach(item => {
      if (type === 'autistic') {
        // High autistic trait answers
        newScores[item.id] = item.keying === 'AGREE' ? 'def_agree' : 'def_disagree';
      } else if (type === 'typical') {
        // Typical / non-autistic answers
        newScores[item.id] = item.keying === 'AGREE' ? 'def_disagree' : 'def_agree';
      } else if (type === 'borderline') {
        // ~30 points (borderline cut-off)
        if (item.id <= 30) {
          newScores[item.id] = item.keying === 'AGREE' ? 'slight_agree' : 'slight_disagree';
        } else {
          newScores[item.id] = item.keying === 'AGREE' ? 'slight_disagree' : 'slight_agree';
        }
      }
    });

    setForm(f => ({
      ...f,
      scores: newScores,
    }));
    showToast('تم تعبئة نموذج الاستجابات التجريبي بنجاح!', 'ok');
  }

  function handleReset() {
    if (window.confirm('هل تريد مسح جميع إجابات بنود المقياس والبدء من جديد؟')) {
      setForm(f => ({
        ...f,
        scores: {},
        itemNotes: {},
        clinicalSummary: '',
        recommendations: '',
      }));
    }
  }

  function handleGenerateSummary() {
    const recs = psychometrics.isAboveCutoff
      ? `1. إحالة الطفل فوراً لتقييم تشخيصي رسمي متعدد التخصصات يشمل القياس الإكلينيكي المعياري (ADOS-2 / ADI-R).\n2. إعداد خطة تربوية فردية (IEP) تركز على المهارات الاجتماعية والتواصلية والمرونة السلوكية.\n3. تدريب الأسرة وفريق العمل المدرسي على استراتيجيات الدعم البصري والقصص الاجتماعية.\n4. إعادة تقييم التطور بعد 6 أشهر لمتابعة الأثر التدخلي.`
      : `1. استمرار الملاحظة الدورية للتطور النمائي والتواصل الاجتماعي.\n2. تعزيز أنشطة اللعب التشاركي والتفاعل الجماعي مع الأقران.\n3. تقديم الدعم في المهارات التي تظهر سمات خفيفة حسب الحاجة.`;

    setForm(f => ({
      ...f,
      clinicalSummary: psychometrics.clinicalSummary,
      recommendations: recs,
    }));
    showToast('تم توليد الخلاصة السريرية والتوصيات بنجاح!', 'ok');
  }

  function handleSave() {
    if (!form.studentName) {
      showToast('يرجى اختيار أو كتابة اسم المفحوص أولاً!', 'error');
      return;
    }

    if (psychometrics.answeredCount < 50) {
      const remaining = 50 - psychometrics.answeredCount;
      if (!window.confirm(`تنبيه: متبقي ${remaining} بنداً لم يتم الإجابة عليها. هل ترغب في حفظ التقييم كمسودة غير مكتملة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      id: form.id || uid(),
      scaleId: 'aq_autism_quotient',
      scaleType: 'aq',
      measureId: 'aq',
      scaleName: 'مقياس طيف التوحد للأطفال واليافعين — AQ',
      scaleCategory: 'autism',
      results: form.scores,
      psychometrics: {
        totalScore: psychometrics.totalScore,
        maxScore: psychometrics.maxScore,
        answeredCount: psychometrics.answeredCount,
        isAboveCutoff: psychometrics.isAboveCutoff,
        cutoffThreshold: 30,
        severityLabel: psychometrics.severityLabel,
        severityKey: psychometrics.severityKey,
        riskLevel: psychometrics.riskLevel,
        domainBreakdown: psychometrics.domainBreakdown,
        flaggedItemsCount: psychometrics.flaggedItems.length,
      },
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      lsUpd('assessments', initialData.id, payload);
      showToast('تم تحديث تقييم مقياس طيف التوحد (AQ) بنجاح!', 'ok');
    } else {
      payload.createdAt = new Date().toISOString();
      lsAdd('studentAssessments', payload);
      lsAdd('assessments', payload);
      showToast('تم حفظ تقييم مقياس طيف التوحد (AQ) بنجاح!', 'ok');
    }

    if (onSaved) onSaved(payload);
    if (onOpenReport) onOpenReport(payload);
    onClose();
  }

  function handleSafeClose() {
    if (Object.keys(form.scores).length > 0 && !initialData) {
      if (window.confirm('هل أنت متأكد من الخروج؟ سيتم فقدان البيانات غير المحفوظة.')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && handleSafeClose()} style={{ zIndex: 1100 }}>
      <div
        className="mb"
        style={{
          maxWidth: 'min(1250px, calc(100vw - 24px))',
          width: '100%',
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          className="mhd modal-header-custom"
          style={{
            background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #0d9488 100%)',
            color: '#ffffff',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🧠</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#ffffff' }}>
                  مقياس طيف التوحد للأطفال واليافعين (AQ)
                </h3>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  50 بنداً استقصائياً • 5 أبعاد معرفية وسلوكية ({form.version === 'adolescent' ? 'نسخة اليافعين 12–16 سنة' : 'نسخة الأطفال 4–11 سنة'})
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#d1fae5', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span>الأداة الإكلينيكية المعيارية المفتوحة لفرز وتقدير سمات طيف التوحد ومتلازمة أسبرجر — Autism Spectrum Quotient</span>
                <span style={{ opacity: 0.9, background: 'rgba(0,0,0,0.2)', padding: '1px 6px', borderRadius: 4 }}>
                  Cambridge Autism Research Centre (ARC) / Prof. Simon Baron-Cohen ©
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setShowCopyrightInfo(prev => !prev)}
              style={{
                background: showCopyrightInfo ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 700,
                fontSize: '0.74rem',
                padding: '4px 8px',
              }}
              title="عرض معلومات الترخيص المفتوح وحقوق الملكية"
            >
              📜 حقوق الملكية والاعتماد العلمي
            </button>
            <button
              type="button"
              className="btn btn-sm btn-g"
              onClick={handleSafeClose}
              style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none' }}
              title="إغلاق النافذة"
            >
              ✕ إغلاق
            </button>
          </div>
        </div>

        {/* OPEN ACCESS / COPYRIGHT ACCORDION */}
        {showCopyrightInfo && (
          <div
            style={{
              background: 'var(--g0)',
              borderBottom: '1px solid var(--border-color)',
              padding: '12px 20px',
              fontSize: '0.78rem',
              color: 'var(--text-main)',
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              <div>
                <strong style={{ color: '#059669', display: 'block', marginBottom: 2 }}>
                  🏛️ المطور وجهة النشر:
                </strong>
                {AQ_COPYRIGHT_INFO.publisherAr} بقيادة {AQ_COPYRIGHT_INFO.authorsAr}.
              </div>
              <div>
                <strong style={{ color: '#059669', display: 'block', marginBottom: 2 }}>
                  ⚖️ الوضع القانوني وحقوق الاستخدام:
                </strong>
                {AQ_COPYRIGHT_INFO.licensingStatus} — {AQ_COPYRIGHT_INFO.licensingNotice}
              </div>
              <div>
                <strong style={{ color: '#059669', display: 'block', marginBottom: 2 }}>
                  🎯 الغرض والهدف الإكلينيكي:
                </strong>
                {AQ_COPYRIGHT_INFO.purpose}
              </div>
            </div>
          </div>
        )}

        {/* REAL-TIME PSYCHOMETRICS & DIAGNOSTIC SUBBAR */}
        <div
          style={{
            background: 'var(--g0)',
            borderBottom: '1px solid var(--border-color)',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
            {/* Total AQ Score Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.isAboveCutoff ? '#dc2626' : '#059669'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>معامل طيف التوحد (AQ):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.totalScore} <small style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>/ 50</small>
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                (عتبة القطع: ≥ 30)
              </span>
            </div>

            {/* Cut-off Status */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>عتبة الفرز التشخيصي:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: psychometrics.isAboveCutoff ? '#dc2626' : '#059669' }}>
                {psychometrics.isAboveCutoff ? 'تجاوز عتبة القطع ⚠️' : 'أقل من عتبة القطع ✅'}
              </span>
            </div>

            {/* Version Toggle */}
            <div style={{ background: 'var(--bg-card)', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>النسخة:</span>
              <button
                type="button"
                className={`btn btn-xs ${form.version === 'child' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setForm(f => ({ ...f, version: 'child' }))}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: form.version === 'child' ? 800 : 500,
                  background: form.version === 'child' ? '#047857' : undefined,
                  color: form.version === 'child' ? '#ffffff' : 'var(--text-sub)',
                  border: form.version === 'child' ? 'none' : undefined,
                }}
              >
                🧒 الأطفال (4–11)
              </button>
              <button
                type="button"
                className={`btn btn-xs ${form.version === 'adolescent' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setForm(f => ({ ...f, version: 'adolescent' }))}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: form.version === 'adolescent' ? 800 : 500,
                  background: form.version === 'adolescent' ? '#065f46' : undefined,
                  color: form.version === 'adolescent' ? '#ffffff' : 'var(--text-sub)',
                  border: form.version === 'adolescent' ? 'none' : undefined,
                }}
              >
                🧑‍🎓 اليافعين (12–16)
              </button>
            </div>

            {/* Diagnosis Result Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>التصنيف والشدة:</span>
              <span className={`bdg ${psychometrics.severityKey === 'high' ? 'b-rd' : psychometrics.severityKey === 'borderline' ? 'b-or' : 'b-gr'}`} style={{ fontWeight: 800, fontSize: '0.78rem' }}>
                {psychometrics.severityLabel}
              </span>
            </div>

            {/* Quick Fill Actions */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => autoFillSample('autistic')}
                style={{ background: 'var(--err-l)', color: 'var(--err)', border: '1px solid var(--err)', fontWeight: 700, fontSize: '0.72rem', padding: '3px 7px' }}
                title="تعبئة سريعة لحالة تظهر سمات طيف توحد مرتفعة"
              >
                ⚡ سمات مرتفعة
              </button>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => autoFillSample('borderline')}
                style={{ background: 'var(--warn-l)', color: 'var(--warn)', border: '1px solid var(--warn)', fontWeight: 700, fontSize: '0.72rem', padding: '3px 7px' }}
                title="تعبئة سريعة لحالة حدية"
              >
                ⚡ حدية
              </button>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => autoFillSample('typical')}
                style={{ background: 'var(--ok-l)', color: 'var(--ok)', border: '1px solid var(--ok)', fontWeight: 700, fontSize: '0.72rem', padding: '3px 7px' }}
                title="تعبئة سريعة لأداء نمطي سليم"
              >
                ⚡ نمطي
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={handleReset}
                style={{ fontSize: '0.72rem', padding: '3px 7px' }}
                title="مسح كافة الإجابات"
              >
                🗑️ تفريغ
              </button>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {psychometrics.answeredCount} / 50 بنداً
              </span>
              <div style={{ width: 60, height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(psychometrics.answeredCount / 50) * 100}%`,
                    height: '100%',
                    background: psychometrics.answeredCount === 50 ? 'var(--ok)' : '#059669',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto', background: 'var(--bg-page)' }}>
          
          {/* 1. Student & Assessment Info Card */}
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
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ color: '#059669' }}>👦</span>
                <span>بيانات المفحوص والاستمارة السريرية</span>
                {form.studentName && (
                  <span
                    style={{
                      fontSize: '0.76rem',
                      background: 'var(--ok-l)',
                      color: 'var(--ok)',
                      border: '1px solid var(--ok)',
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
                        style={{ height: 32, fontSize: '0.82rem', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                        value={form.studentName || ''}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                        placeholder="اكتب اسم الطفل / المفحوص..."
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
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">— اختر من الطلاب المسجلين بالمركز —</option>
                      {allStudents.map(s => (
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
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit ? 'var(--bg-input)' : 'var(--g0)', color: 'var(--text-main)' }}
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
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)', color: 'var(--text-main)' }}
                      value={form.diagnosis || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                      placeholder="مثال: اشتباه طيف توحد، متلازمة أسبرجر..."
                    />
                  </div>

                  {/* 4. Assessment Date */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>تاريخ التقييم</label>
                    <input
                      type="date"
                      dir="ltr"
                      style={{ height: 32, fontSize: '0.82rem', textAlign: 'right', padding: '2px 8px', background: 'var(--bg-input)', color: 'var(--text-main)' }}
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
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الأخصائي الفاحص</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                      type="text"
                      placeholder="اسم الأخصائي النفسي / الفاحص"
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    />
                  </div>

                  {/* 2. Respondent Name */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المستجيب (ولي أمر / معلم)</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                      type="text"
                      placeholder="اسم المستجيب على المقياس"
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  {/* 3. Scale Version */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>نسخة المقياس المعتمدة</label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px', fontWeight: 700, color: 'var(--ok)', background: 'var(--bg-input)' }}
                      value={form.version}
                      onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                    >
                      <option value="child">🧒 نسخة الأطفال (4–11 سنة - AQ-Child)</option>
                      <option value="adolescent">🧑‍🎓 نسخة اليافعين (12–16 سنة - AQ-Adolescent)</option>
                    </select>
                  </div>

                  {/* 4. Relationship / Role */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صلة القرابة / معرفة السلوك</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                      type="text"
                      placeholder="مثال: الأم، الأب، معلم التربية الخاصة..."
                      value={form.raterRelation || ''}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Subscale Navigation Tabs & Filter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📑 أبعاد مقياس AQ الخمسة (Autism Spectrum Quotient Dimensions):
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                اختر: (أوافق بشدة)، (أوافق قليلاً)، (لا أوافق قليلاً)، (لا أوافق بشدة)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeDomainFilter === 'all' ? 'on' : ''}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع البنود (50)
              </button>
              {AQ_DOMAINS.map(dom => {
                const domStat = psychometrics.domainBreakdown.find(d => d.id === dom.id);
                return (
                  <button
                    key={dom.id}
                    type="button"
                    className={`tab ${activeDomainFilter === dom.id ? 'on' : ''}`}
                    onClick={() => setActiveDomainFilter(dom.id)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      whiteSpace: 'nowrap',
                      borderRight: `3px solid ${dom.color}`,
                    }}
                  >
                    {dom.name} ({domStat?.answeredCount || 0}/10)
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const currentVal = form.scores[item.id];
              const isAnswered = Boolean(currentVal);
              const domain = AQ_DOMAINS.find(d => d.id === item.domainId);
              const note = form.itemNotes[item.id] || '';

              // check if this answer awarded an autistic trait point
              const isAgree = currentVal === 'def_agree' || currentVal === 'slight_agree';
              const isDisagree = currentVal === 'def_disagree' || currentVal === 'slight_disagree';
              const isTrait = (item.keying === 'AGREE' && isAgree) || (item.keying === 'DISAGREE' && isDisagree);

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: isTrait
                      ? '1.5px solid var(--err)'
                      : isAnswered
                      ? '1px solid var(--border-color)'
                      : '1px dashed var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    boxShadow: isTrait ? '0 2px 8px rgba(239, 68, 68, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: 'var(--g1)',
                          color: 'var(--text-main)',
                          fontWeight: 900,
                          fontSize: '.82rem',
                          flexShrink: 0,
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {item.id}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {item.textAr}
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-sub)', direction: 'ltr', textAlign: 'right', marginTop: 2 }}>
                          {item.textEn}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '.7rem',
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: 'var(--g1)',
                          color: domain?.color || 'var(--text-main)',
                          fontWeight: 700,
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {domain?.name}
                      </span>
                      {isTrait && (
                        <span
                          style={{
                            fontSize: '.7rem',
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'var(--err-l)',
                            color: 'var(--err)',
                            fontWeight: 800,
                            border: '1px solid var(--err)',
                          }}
                        >
                          +1 سمة طيف
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4-POINT LIKERT OPTIONS */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {AQ_RESPONSE_OPTIONS.map(opt => {
                      const isSelected = currentVal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleAnswer(item.id, opt.value)}
                          className={`btn ${isSelected ? 'btn-p' : 'btn-g'}`}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            fontSize: '.82rem',
                            fontWeight: isSelected ? 800 : 500,
                            cursor: 'pointer',
                            background: isSelected
                              ? (isTrait ? '#dc2626' : '#059669')
                              : 'var(--bg-input)',
                            color: isSelected ? '#ffffff' : 'var(--text-main)',
                            border: isSelected
                              ? `2px solid ${isTrait ? '#b91c1c' : '#047857'}`
                              : '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{opt.label} {isSelected && '✓'}</span>
                          <span
                            style={{
                              fontSize: '.66rem',
                              color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--text-sub)',
                              direction: 'ltr',
                            }}
                          >
                            {opt.labelEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ITEM NOTE INPUT */}
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      value={note}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      placeholder="ملاحظات سريرية أو شواهد سلوكية على هذا البند (اختياري)..."
                      style={{
                        width: '100%',
                        fontSize: '.78rem',
                        padding: '6px 10px',
                        background: 'var(--bg-input)',
                        color: 'var(--text-main)',
                        border: '1px dashed var(--border-color)',
                        borderRadius: 6,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. DOMAIN PROFILE SCOREBOARD VISUALIZER */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 16,
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text-main)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📊</span>
              <span>الملف السيكومتري للأبعاد المعرفية والسلوكية الخمسة (AQ Profile):</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {psychometrics.domainBreakdown.map(d => (
                <div
                  key={d.id}
                  style={{
                    background: 'var(--g0)',
                    border: '1px solid var(--border-color)',
                    borderRight: `4px solid ${d.color}`,
                    borderRadius: 8,
                    padding: '8px 12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.76rem', fontWeight: 800 }}>
                    <span style={{ color: d.color }}>{d.name}</span>
                    <span style={{ color: 'var(--text-main)' }}>{d.rawScore} / 10 ({d.percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden', margin: '6px 0 4px 0' }}>
                    <div
                      style={{
                        width: `${d.percentage}%`,
                        height: '100%',
                        background: d.color,
                        borderRadius: 999,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '.7rem', color: d.levelColor || 'var(--text-sub)', fontWeight: 700 }}>
                    {d.level}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. CLINICAL SUMMARY & RECOMMENDATIONS TEXTAREAS */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '14px 18px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span>
                <span>التقرير الإكلينيكي والتوصيات التأهيلية المعتمدة:</span>
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={handleGenerateSummary}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                }}
              >
                ✨ توليد الخلاصة السريرية والتوصيات تلقائياً
              </button>
            </div>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fl">
                <label style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: 4 }}>الملخص التشخيصي السريري</label>
                <textarea
                  rows={4}
                  value={form.clinicalSummary || psychometrics.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="سيتم توليد الخلاصة السريرية تلقائياً بناءً على الدرجة الكلية وعتبة القطع..."
                  style={{ fontSize: '.82rem', padding: '8px', width: '100%', lineHeight: 1.5, background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="fl">
                <label style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: 4 }}>التوصيات والإحالات الموصى بها</label>
                <textarea
                  rows={4}
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="مثال: إحالة لتقييم تشخيصي شامل، جلسات تنمية مهارات اجتماعية، تدريب المرونة السلوكية..."
                  style={{ fontSize: '.82rem', padding: '8px', width: '100%', lineHeight: 1.5, background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="mft modal-footer-custom"
          style={{
            padding: '12px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: '.84rem', color: 'var(--text-sub)' }}>
            الدرجة الكلية: <strong style={{ color: psychometrics.severityColor, fontSize: '1.1rem' }}>{psychometrics.totalScore}/50</strong> • النتيجة: <strong style={{ color: psychometrics.isAboveCutoff ? '#dc2626' : '#059669' }}>{psychometrics.isAboveCutoff ? 'تجاوز عتبة القطع (مؤشر إيجابي لسمات التوحد)' : 'ضمن النطاق الطبيعي'}</strong>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={handleSafeClose}
              style={{ fontWeight: 700, padding: '8px 16px' }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-pr"
              onClick={handleSave}
              style={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                borderColor: '#047857',
                padding: '8px 24px',
                color: '#fff',
              }}
            >
              💾 حفظ التقييم الإكلينيكي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
