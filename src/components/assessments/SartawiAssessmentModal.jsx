import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  SARTAWI_COPYRIGHT_INFO,
  SARTAWI_DIMENSIONS,
  SARTAWI_ITEMS,
  SARTAWI_RATING_OPTIONS,
  calculateSartawiPsychometrics,
} from '../../data/sartawiData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_SARTAWI_FORM = {
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
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function SartawiAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
}) {
  const { toast, currentUser } = useApp?.() || { toast: () => {}, currentUser: null };

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_SARTAWI_FORM,
        ...initialData,
        scores: initialData.scores || initialData.results || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_SARTAWI_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeTab, setActiveTab] = useState('all');
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
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

  const psychometrics = useMemo(() => {
    return calculateSartawiPsychometrics(form.scores || {});
  }, [form.scores]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return SARTAWI_ITEMS;
    return SARTAWI_ITEMS.filter(it => it.dimensionId === activeTab);
  }, [activeTab]);

  if (!isOpen) return null;

  function handleScoreChange(itemId, scoreValue) {
    setForm(f => ({
      ...f,
      scores: {
        ...f.scores,
        [itemId]: Number(scoreValue),
      },
    }));
  }

  function handleNoteChange(itemId, noteText) {
    setForm(f => ({
      ...f,
      itemNotes: {
        ...f.itemNotes,
        [itemId]: noteText,
      },
    }));
  }

  function handleAutoFill(fillLevel = 'normal') {
    const newScores = {};

    SARTAWI_ITEMS.forEach(item => {
      if (fillLevel === 'normal') {
        newScores[item.id] = (item.num % 4 === 0) ? 2 : 1;
      } else if (fillLevel === 'borderline') {
        newScores[item.id] = (item.num % 3 === 0) ? 4 : (item.num % 2 === 0 ? 3 : 2);
      } else if (fillLevel === 'ld') {
        newScores[item.id] = (item.num % 3 === 0) ? 4 : 5;
      }
    });

    setForm(f => ({ ...f, scores: newScores }));
    toast(`⚡ تم تعبئة استجابات نموذجية لمقياس السرطاوي (${fillLevel === 'normal' ? 'أداء طبيعي' : fillLevel === 'borderline' ? 'فئة حدية' : 'صعوبات تعلم مؤكدة'})`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 15) {
      toast('⚠️ يرجى تقييم 15 عبارة على الأقل لتوليد الخلاصة التشخيصية المعتمدة', 'er');
      return;
    }

    const dimensionDetails = psychometrics.dimensions.map(d => {
      return `• ${d.name}: الدرجة الخام (${d.rawScore}/${d.maxRaw}) ➔ الدرجة التائية (T = ${d.tScore}) برتبة مئينية (${d.percentile}%) - [${d.levelLabel}]`;
    }).join('\n');

    const deficitsText = psychometrics.deficitDimensions.length > 0
      ? `الأبعاد التي تظهر صعوبات واضحة تتطلب تدخلاً علاجياً:\n` + psychometrics.deficitDimensions.map(d => `- ${d.name} (T = ${d.tScore})`).join('\n')
      : 'لا توجد أبعاد تقع في النطاق الحرج لصعوبات التعلم.';

    const summary = `تقرير التقييم بمقياس صعوبات التعلم المقنن - إعداد وتقنين أ.د. زيدان أحمد السرطاوي (50 عبارة):\n\n` +
      `- الدرجة الخام الكلية للمقياس: (${psychometrics.totalRawScore} / 250).\n` +
      `- الدرجة التائية المعيارية الإجمالية: (T = ${psychometrics.totalTScore}) برتبة مئينية (${psychometrics.percentile}%).\n\n` +
      `القرار التشخيصي الإكلينيكي:\n` +
      `[${psychometrics.overallStatus}] - ${psychometrics.overallDescription}\n\n` +
      `الأداء التفصيلي على أبعاد المقياس الثلاثة:\n` +
      `${dimensionDetails}\n\n` +
      `${deficitsText}\n\n` +
      `الخلاصة:\n` +
      `استناداً إلى معايير مقياس السرطاوي المقنن للبيئة العربية، ${psychometrics.conclusionText}`;

    const recs = psychometrics.overallKey === 'severe' || psychometrics.overallKey === 'borderline'
      ? `1. تسجيل الطالب في برنامج صعوبات التعلم وغرف المصادر لتلقي التدريس الفردي المباشر.\n` +
        `2. تصميم خطة تربوية فردية (IEP) تركز على مجالات الاحتياج (${psychometrics.deficitDimensions.map(d => d.name).join('، ')}).\n` +
        `3. استخدام أسلوب التعلم النشط وتدريب الحواس المتعددة (VAKT) على مهارات القراءة والكتابة والعمليات الحسابية.\n` +
        `4. تعديل وتكييف أساليب التقييم الصفي والامتحانات المدرسية (زيادة الوقت، تقليل عدد الفقرات، قراءة الأسئلة).\n` +
        `5. تقديم برامج الدعم السلوكي والإرشادي لتعزيز الدافعية وثقة الطالب بنفسه.`
      : `1. استمرار الطالب في بيئة التعليم العام مع المتابعة الصفية الدورية.\n` +
        `2. تعزيز دافعية التعلم والمشاركة الفاعلة في الأنشطة المدرسية.\n` +
        `3. تقديم برامج إثرائية لتطوير القدرات الأكاديمية والمهارات الذاتية.`;

    setForm(f => ({
      ...f,
      clinicalSummary: summary,
      recommendations: recs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية والتوصيات التربوية بناءً على تقنين د. زيدان السرطاوي', 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً من القائمة', 'er');
      return;
    }
    if (!form.date) {
      toast('⚠️ يرجى تحديد تاريخ التقييم', 'er');
      return;
    }

    if (psychometrics.totalAnswered < SARTAWI_ITEMS.length) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.totalAnswered} من أصل ${SARTAWI_ITEMS.length} عبارة. هل تود حفظ التقييم كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'sartawi_scale',
      scaleId: 'sartawi_scale',
      scaleType: 'sartawi_ld',
      measureName: 'مقياس صعوبات التعلم (أ.د. زيدان السرطاوي)',
      scaleName: 'مقياس صعوبات التعلم (أ.د. زيدان السرطاوي)',
      category: 'learning_academic',
      categoryName: 'صعوبات التعلم الأكاديمية والسلوكية',
      author: SARTAWI_COPYRIGHT_INFO.authorAr,
      score: psychometrics.totalRawScore,
      maxScore: 250,
      tScore: psychometrics.totalTScore,
      percentage: `${psychometrics.completionPercentage}%`,
      level: psychometrics.overallStatus,
      severityKey: psychometrics.overallKey,
      severityColor: psychometrics.overallColor,
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      psychometrics,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تطبيق مقياس السرطاوي لصعوبات التعلم بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', {
        ...payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق مقياس السرطاوي لصعوبات التعلم بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  function handleSafeClose() {
    const answeredCount = Object.keys(form.scores || {}).length;
    if (answeredCount > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${answeredCount}) عبارة في مقياس السرطاوي. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
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
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>📘</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس تشخيص صعوبات التعلم المقنن (أ.د. زيدان أحمد السرطاوي)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  50 عبارة تقييمية · 3 أبعاد رئيسية
                </span>
                <span className="bdg" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.7rem', fontWeight: 800 }}>
                  معايير T-Score مقننة
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#172554', color: '#bfdbfe', fontSize: '0.68rem', fontWeight: 800 }}>
                  © أ.د. زيدان أحمد السرطاوي / جامعة الملك سعود
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  أداة الفرز والتشخيص المقننة لصعوبات التعلم الأكاديمية والسلوكية والإدراكية الحركية
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
              📜 {showCopyrightDetails ? 'إخفاء حقوق المقياس' : 'حقوق المقياس والتقنين'}
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
              background: '#eff6ff',
              padding: '14px 20px',
              borderBottom: '2px solid #93c5fd',
              fontSize: '0.82rem',
              color: '#1e3a8a',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس د. زيدان السرطاوي:
            </div>

            <div
              style={{
                background: '#dbeafe',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#1e40af',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار حقوق الملكية الفكرية والتقنين:</strong> {SARTAWI_COPYRIGHT_INFO.scaleNameAr} — إعداد وتقنين {SARTAWI_COPYRIGHT_INFO.authorAr} ({SARTAWI_COPYRIGHT_INFO.authorTitle}).
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#eff6ff', padding: '3px 8px', borderRadius: 6, border: '1px solid #93c5fd', fontWeight: 700 }}>
                مقياس رسمي مقنن لفرز وتشخيص صعوبات التعلم
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>المؤلف والمقنن:</strong> {SARTAWI_COPYRIGHT_INFO.authorAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>الجهة والاعتماد:</strong> {SARTAWI_COPYRIGHT_INFO.authorTitle}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>الفئة المستهدفة:</strong> {SARTAWI_COPYRIGHT_INFO.targetGroup}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>المعيار والتقنين:</strong> درجات تائية معيارية T-Score (الملحق رقم 2 ورقم 3)
              </div>
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
            {/* Total Raw Score */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #2563eb',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة الخام الكلية:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.overallColor }}>
                {psychometrics.totalRawScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / 250 (الفاصل 150)
              </span>
            </div>

            {/* T-Score */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.totalTScore >= 60 ? '#fca5a5' : '#cbd5e1'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة التائية المعيارية:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.totalTScore >= 60 ? '#dc2626' : '#1e40af' }}>
                T = {psychometrics.totalTScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4, fontWeight: 700 }}>
                ({psychometrics.percentile}%) {psychometrics.totalTScore >= 60 ? '(⚠️ دال)' : '(طبيعي)'}
              </span>
            </div>

            {/* Deficit Dimensions Count */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.deficitDimensions.length > 0 ? '#fca5a5' : '#cbd5e1'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الأبعاد المتأثرة (العجز):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.deficitDimensions.length > 0 ? '#dc2626' : '#059669' }}>
                {psychometrics.deficitDimensions.length}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / 3 أبعاد
              </span>
            </div>

            {/* Diagnostic Classification Badge */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.overallColor}`,
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>القرار التشخيصي الإكلينيكي:</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: psychometrics.overallColor }}>
                {psychometrics.overallStatus}
              </span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {psychometrics.totalAnswered} / {SARTAWI_ITEMS.length} عبارة تم تقييمها
              </div>
              <div style={{ background: 'var(--border-color)', height: 6, width: 120, borderRadius: 3, marginTop: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    background: psychometrics.completionPercentage === 100 ? '#059669' : '#2563eb',
                    height: '100%',
                    width: `${psychometrics.completionPercentage}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            <span className={`bdg ${psychometrics.completionPercentage === 100 ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.75rem' }}>
              {psychometrics.completionPercentage}%
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="modal-scrollable-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* 1. Clinical Meta Header: 2-Row Layout with Collapse & Edit Controls */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Meta Top Header with Collapsible & Manual Edit Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isHeaderCollapsed ? 'none' : '1px dashed var(--border-color)', paddingBottom: isHeaderCollapsed ? 0 : 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.9rem' }}>📋</span>
                <span style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-main)' }}>
                  بيانات المفحوص وبيئة التطبيق الإكلينيكي
                </span>
                {form.studentName && (
                  <span className="bdg b-bl" style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                    الطالب: {form.studentName}
                  </span>
                )}
                {form.age && (
                  <span className="bdg b-gr" style={{ fontSize: '0.72rem' }}>
                    العمر: {form.age}
                  </span>
                )}
                {form.diagnosis && (
                  <span className="bdg b-or" style={{ fontSize: '0.72rem' }}>
                    التشخيص: {form.diagnosis}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsManualEdit(prev => !prev)}
                  className={`btn btn-xs ${isManualEdit ? 'btn-or' : 'btn-g'}`}
                  style={{ fontSize: '0.72rem', padding: '3px 8px', height: 24, fontWeight: 700 }}
                  title="تفعيل/قفل التعديل اليدوي المباشر على الحقول المستوردة"
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
                      placeholder="مثال: صعوبات تعلم، تشتت انتباه..."
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
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الأخصائي الفاحص</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم الأخصائي الفاحص"
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    />
                  </div>

                  {/* 2. Respondent Name */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المستجيب (معلم / ولي أمر)</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم المستجيب على المقياس"
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
                      placeholder="مثال: الصف الرابع الابتدائي"
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
                      placeholder="مثال: معلم التربية الخاصة، معلم الفصل، ولي الأمر..."
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
                📑 أبعاد مقياس د. زيدان السرطاوي:
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                اختر 1 لمنخفضة جداً، 2 لمنخفضة، 3 لمتوسطة، 4 لعالية، 5 لعالية جداً (درجات أعلى = صعوبة أشد)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeTab === 'all' ? 'on' : ''}`}
                onClick={() => setActiveTab('all')}
                style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع العبارات ({SARTAWI_ITEMS.length})
              </button>
              {SARTAWI_DIMENSIONS.map(dom => {
                const domStat = psychometrics.dimensions.find(d => d.id === dom.id);
                const countAnswered = SARTAWI_ITEMS.filter(it => it.dimensionId === dom.id && form.scores[it.id] !== undefined).length;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    className={`tab ${activeTab === dom.id ? 'on' : ''}`}
                    onClick={() => setActiveTab(dom.id)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      whiteSpace: 'nowrap',
                      borderRight: `3px solid ${dom.color}`,
                    }}
                  >
                    {dom.icon} {dom.name.split(':')[1] || dom.name} ({countAnswered}/{dom.itemsCount})
                    {domStat?.isDeficit && <span style={{ color: '#dc2626', fontWeight: 900, marginRight: 4 }}>⚠️</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const domain = SARTAWI_DIMENSIONS.find(d => d.id === item.dimensionId);
              const currentScore = form.scores[item.id];
              const currentNote = form.itemNotes[item.id] || '';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore !== undefined ? `1.5px solid ${domain?.color || '#2563eb'}` : '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: '260px' }}>
                      <span
                        style={{
                          background: domain?.color || '#2563eb',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        #{item.num} · {domain?.name?.split(':')[1] || domain?.name}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                          {item.text}
                        </div>
                      </div>
                    </div>

                    {/* Rating Scale Buttons (1 to 5) */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {SARTAWI_RATING_OPTIONS.map(opt => {
                        const scoreVal = opt.score || opt.value;
                        const isSelected = currentScore === scoreVal;
                        return (
                          <button
                            key={scoreVal}
                            type="button"
                            onClick={() => handleScoreChange(item.id, scoreVal)}
                            className={`btn btn-xs ${isSelected ? 'btn-p' : 'btn-g'}`}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              fontWeight: isSelected ? 800 : 500,
                              background: isSelected
                                ? (scoreVal >= 4 ? '#dc2626' : scoreVal === 3 ? '#d97706' : '#2563eb')
                                : undefined,
                              color: isSelected ? '#fff' : undefined,
                              border: isSelected ? 'none' : undefined,
                            }}
                            title={opt.desc}
                          >
                            {scoreVal} - {opt.label.replace('ينطبق بدرجة ', '')} {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Option Description Banner */}
                  {currentScore !== undefined && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: currentScore >= 4 ? '#b91c1c' : '#1e40af',
                        background: currentScore >= 4 ? '#fee2e2' : '#eff6ff',
                        padding: '4px 10px',
                        borderRadius: 6,
                        marginBottom: 6,
                        border: `1px solid ${currentScore >= 4 ? '#fca5a5' : '#bfdbfe'}`,
                      }}
                    >
                      <strong>التقدير المختار ({currentScore} درجات): </strong>
                      {SARTAWI_RATING_OPTIONS.find(o => o.score === currentScore)?.label} — {SARTAWI_RATING_OPTIONS.find(o => o.score === currentScore)?.desc}
                    </div>
                  )}

                  {/* Optional Item Observation Note */}
                  <div style={{ marginTop: 6 }}>
                    <input
                      type="text"
                      placeholder="ملاحظات سلوكية أو تفاصيل إضافية لهذا البند (اختياري)..."
                      value={currentNote}
                      onChange={e => handleNoteChange(item.id, e.target.value)}
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
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> الخلاصة التشخيصية والتوصيات التربوية المعتمدة
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, background: '#1e40af', border: 'none' }}
              >
                ✨ إعادة توليد الخلاصة بناءً على الدرجات
              </button>
            </div>

            <div className="fg c1">
              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>التقرير السيكومتري وتفسير الدرجات التائية (T-Score)</label>
                <textarea
                  rows={6}
                  placeholder="الخلاصة التشخيصية والوصف النفسي التربوي وفق معايير مقياس السرطاوي..."
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>توصيات الخطة التربوية الفردية (IEP) وغرفة المصادر</label>
                <textarea
                  rows={5}
                  placeholder="التوصيات العلاجية، التعديلات الصفية، وأساليب التدخل الفردي..."
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
              تم الإجابة على <strong>{psychometrics.totalAnswered}</strong> من <strong>{SARTAWI_ITEMS.length}</strong> عبارة
            </span>
            <span className={`bdg ${psychometrics.completionPercentage === 100 ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.72rem' }}>
              {psychometrics.completionPercentage}% مكتمل
            </span>

            {/* Quick Actions moved to footer */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 6 }}>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('normal')}
                title="تعبئة نموذج افتراضي يظهر أداء طبيعي"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (أداء طبيعي)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('borderline')}
                title="تعبئة نموذج افتراضي يظهر فئة حدية"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (فئة حدية)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('ld')}
                title="تعبئة نموذج افتراضي يظهر صعوبات تعلم مؤكدة"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (صعوبات تعلم)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, fontSize: '0.74rem', background: '#1e40af', border: 'none' }}
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
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                padding: '8px 20px',
              }}
            >
              💾 حفظ وحساب تقييم مقياس السرطاوي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
