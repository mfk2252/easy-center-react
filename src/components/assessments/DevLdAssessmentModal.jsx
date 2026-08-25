import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  DEV_LD_COPYRIGHT_INFO,
  DEV_LD_DOMAINS,
  DEV_LD_ITEMS,
  DEV_LD_RESPONSE_OPTIONS,
  calculateDevLdPsychometrics,
} from '../../data/devLdData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_DEV_LD_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: 'تمهيدي / روضة ثانية (KG2)',
  school: 'روضة براعم الأمل',
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

export default function DevLdAssessmentModal({
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
        ...EMPTY_DEV_LD_FORM,
        ...initialData,
        scores: initialData.scores || initialData.results || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_DEV_LD_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainId, setActiveDomainId] = useState('all');
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
      grade: stu.grade || stu.className || 'تمهيدي / روضة ثانية (KG2)',
      school: stu.school || stu.schoolName || 'روضة براعم الأمل',
    }));
  }

  const psychometrics = useMemo(() => {
    return calculateDevLdPsychometrics(form.scores || {});
  }, [form.scores]);

  const filteredItems = useMemo(() => {
    if (activeDomainId === 'all') return DEV_LD_ITEMS;
    return DEV_LD_ITEMS.filter(it => it.domainId === activeDomainId);
  }, [activeDomainId]);

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

  function handleAutoFill(level = 'normal') {
    const newScores = {};

    DEV_LD_ITEMS.forEach(it => {
      if (level === 'normal') {
        newScores[it.id] = (it.id % 5 === 0) ? 1 : 0;
      } else if (level === 'mild') {
        newScores[it.id] = (it.id % 3 === 0) ? 1 : (it.id % 7 === 0 ? 2 : 0);
      } else if (level === 'at_risk') {
        newScores[it.id] = (it.id % 2 === 0) ? 1 : (it.id % 3 === 0 ? 2 : 1);
      } else if (level === 'severe') {
        newScores[it.id] = (it.id % 4 === 0) ? 1 : 2;
      }
    });

    setForm(f => ({ ...f, scores: newScores }));
    toast(`⚡ تم تعبئة استجابات نموذجية (${level === 'normal' ? 'أداء نمائي طبيعي' : level === 'mild' ? 'مؤشرات حدية خفيفة' : level === 'at_risk' ? 'معرض للخطر At-Risk' : 'صعوبات نمائية مؤكدة'})`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 20) {
      toast('⚠️ يرجى تقييم 20 عبارة على الأقل لتوليد الخلاصة التشخيصية المعتمدة', 'er');
      return;
    }

    const domainDetails = psychometrics.domainResults.map(d => {
      return `• ${d.name}: الدرجة الخام (${d.rawScore}/${d.maxScore}) - [${d.domainStatus}] (${d.percentage}%)`;
    }).join('\n');

    const pillarsReport = `المجالات النمائية الكبرى (Kirk & Chalfant):\n` +
      `- المجال المعرفي (انتباه، إدراك، ذاكرة): (${psychometrics.cognitiveRaw}/${psychometrics.cognitiveMax}) بنسبة ${psychometrics.cognitivePct}%\n` +
      `- المجال اللغوي والتفكير: (${psychometrics.langThinkingRaw}/${psychometrics.langThinkingMax}) بنسبة ${psychometrics.langThinkingPct}%\n` +
      `- المجال البصري الحركي: (${psychometrics.visualMotorRaw}/${psychometrics.visualMotorMax}) بنسبة ${psychometrics.visualMotorPct}%`;

    const summary = `تقرير تشخيصي بقائمة صعوبات التعلم النمائية لأطفال الروضة - أ.د. عادل عبدالله محمد (80 عبارة):\n\n` +
      `- إجمالي الدرجة الخام المحققة: (${psychometrics.totalRawScore} / ${psychometrics.totalMaxScore}) بنسبة شدة إجمالية (${psychometrics.overallPercentage}%).\n` +
      `- تم إكمال تقييم: (${psychometrics.totalAnswered} من ${psychometrics.totalItems} عبارة).\n\n` +
      `القرار التشخيصي وتصنيف الحالة:\n` +
      `[${psychometrics.probability}] - ${psychometrics.severityLevel}\n\n` +
      `${pillarsReport}\n\n` +
      `تفاصيل الأداء على أبعاد القائمة الستة:\n` +
      `${domainDetails}\n\n` +
      `التفسير والتوصية العامة:\n` +
      `${psychometrics.recommendationSummary}`;

    const recs = psychometrics.overallPercentage >= 50
      ? `1. تسجيل الطفل في برنامج التدخل المبكر لتنمية المهارات النمائية قبل الانتقال للمرحلة الابتدائية.\n` +
        `2. التركيز على أنشطة تنمية الانتباه المشترك، الذاكرة العاملة السمعية والبصرية، والتآزر البصري الحركي.\n` +
        `3. استخدام الألعاب التعليمية الحسية واستراتيجيات الحواس المتعددة (VAKT).\n` +
        `4. تقديم الدعم والإرشاد الأسري لتطبيق برامج التهيئة المنزلية المساندة.\n` +
        `5. إعادة التقييم بعد 6 أشهر لقياس مدى الاستجابة للتدخل (RTI).`
      : `1. استمرار الطفل في برنامج الروضة العادي مع تقديم أنشطة الإثراء النمائي.\n` +
        `2. تنمية مهارات التفكير والتعبير اللغوي والتفاعل الاجتماعي الإيجابي.\n` +
        `3. المتابعة الدورية لمعدلات النمو والتطور الحركي واللغوي.`;

    setForm(f => ({
      ...f,
      clinicalSummary: summary,
      recommendations: recs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية والتوصيات بناءً على قائمة صعوبات التعلم النمائية', 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطفل أولاً من القائمة', 'er');
      return;
    }
    if (!form.date) {
      toast('⚠️ يرجى تحديد تاريخ التقييم', 'er');
      return;
    }

    if (psychometrics.totalAnswered < DEV_LD_ITEMS.length) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.totalAnswered} من أصل ${DEV_LD_ITEMS.length} عبارة. هل تود حفظ التقييم كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'dev_ld_preschool',
      scaleId: 'dev_ld_preschool',
      scaleType: 'dev_ld',
      measureName: 'قائمة صعوبات التعلم النمائية لأطفال الروضة (أ.د. عادل عبدالله)',
      scaleName: 'قائمة صعوبات التعلم النمائية لأطفال الروضة (أ.د. عادل عبدالله)',
      category: 'learning_academic',
      categoryName: 'صعوبات التعلم النمائية والتشخيص المبكر',
      author: DEV_LD_COPYRIGHT_INFO.authorAr,
      score: psychometrics.totalRawScore,
      maxScore: 160,
      percentage: `${psychometrics.overallPercentage}%`,
      level: psychometrics.probability,
      severityKey: psychometrics.severityKey,
      severityColor: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      psychometrics,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث قائمة صعوبات التعلم النمائية للروضة بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', {
        ...payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق قائمة صعوبات التعلم النمائية للروضة بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  function handleSafeClose() {
    const answeredCount = Object.keys(form.scores || {}).length;
    if (answeredCount > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${answeredCount}) عبارة في قائمة صعوبات التعلم النمائية. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
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
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🧸</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  قائمة صعوبات التعلم النمائية لأطفال الروضة (أ.د. عادل عبدالله محمد)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  80 عبارة نمائية · 6 أبعاد رئيسية
                </span>
                <span className="bdg" style={{ background: '#ccfbf1', color: '#0f766e', fontSize: '0.7rem', fontWeight: 800 }}>
                  التشخيص والفرز المبكر
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#134e4a', color: '#99f6e4', fontSize: '0.68rem', fontWeight: 800 }}>
                  © أ.د. عادل عبدالله محمد / جامعة الزقازيق
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  أداة الكشف المبكر عن صعوبات الانتباه، الإدراك، الذاكرة، التفكير، اللغة، والتناسق البصري الحركي
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
              📜 {showCopyrightDetails ? 'إخفاء حقوق القائمة' : 'حقوق القائمة والتقنين'}
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
              borderBottom: '2px solid #5eead4',
              fontSize: '0.82rem',
              color: '#134e4a',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لقائمة صعوبات التعلم النمائية:
            </div>

            <div
              style={{
                background: '#ccfbf1',
                border: '1px solid #99f6e4',
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
                  <strong>إشعار حقوق الملكية الفكرية والتقنين:</strong> {DEV_LD_COPYRIGHT_INFO.scaleNameAr} — إعداد {DEV_LD_COPYRIGHT_INFO.authorAr} ({DEV_LD_COPYRIGHT_INFO.authorTitle}) · {DEV_LD_COPYRIGHT_INFO.publisherAr}.
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#f0fdfa', padding: '3px 8px', borderRadius: 6, border: '1px solid #5eead4', fontWeight: 700 }}>
                مخصص للتشخيص والتدخل المبكر المرخص
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>المؤلف والباحث:</strong> {DEV_LD_COPYRIGHT_INFO.authorAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>الإطار النظري:</strong> {DEV_LD_COPYRIGHT_INFO.theoreticalFramework}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>الفئة المستهدفة:</strong> {DEV_LD_COPYRIGHT_INFO.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>نظام التصحيح:</strong> (نعم = 2 | أحياناً = 1 | لا = 0) · الدرجة العظمى 160
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
            {/* Total Raw Score Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #0d9488',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المجموع الكلي الخام:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.totalRawScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / 160 ({psychometrics.overallPercentage}%)
              </span>
            </div>

            {/* Cognitive Pillar */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.cognitivePct >= 50 ? '#fca5a5' : '#cbd5e1'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المجال المعرفي (انتباه/إدراك/ذاكرة):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.cognitivePct >= 50 ? '#dc2626' : '#0f766e' }}>
                {psychometrics.cognitiveRaw}
              </span>
              <span style={{ fontSize: '0.7rem', color: psychometrics.cognitivePct >= 50 ? '#dc2626' : 'var(--text-sub)', marginRight: 4, fontWeight: 700 }}>
                / {psychometrics.cognitiveMax} ({psychometrics.cognitivePct}%)
              </span>
            </div>

            {/* Language & Thinking Pillar */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.langThinkingPct >= 50 ? '#fca5a5' : '#cbd5e1'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>مجال اللغة والتفكير:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.langThinkingPct >= 50 ? '#dc2626' : '#0f766e' }}>
                {psychometrics.langThinkingRaw}
              </span>
              <span style={{ fontSize: '0.7rem', color: psychometrics.langThinkingPct >= 50 ? '#dc2626' : 'var(--text-sub)', marginRight: 4, fontWeight: 700 }}>
                / {psychometrics.langThinkingMax} ({psychometrics.langThinkingPct}%)
              </span>
            </div>

            {/* Diagnostic Classification Badge */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.severityColor}`,
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>القرار والتصنيف التشخيصي:</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: psychometrics.severityColor }}>
                {psychometrics.probability}
              </span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {psychometrics.totalAnswered} / {DEV_LD_ITEMS.length} عبارة تم تقييمها
              </div>
              <div style={{ background: 'var(--border-color)', height: 6, width: 120, borderRadius: 3, marginTop: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    background: psychometrics.completionPercentage === 100 ? '#059669' : '#0d9488',
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
                  بيانات الطفل المفحوص وبيئة التقييم النمائي
                </span>
                {form.studentName && (
                  <span className="bdg b-bl" style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                    الطفل: {form.studentName}
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
                      <label style={{ fontSize: '0.76rem', marginBottom: 2 }}>اسم الطفل الخارجي <span className="req">*</span></label>
                      <input
                        style={{ height: 32, fontSize: '0.82rem' }}
                        value={form.studentName || ''}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                        placeholder="اكتب اسم الطفل..."
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
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الطفل المسجل بالمركز/الروضة <span className="req">*</span></label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">— اختر من الأطفال المسجلين بالمركز —</option>
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
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>التشخيص الطبي / النمائي</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      value={form.diagnosis || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                      placeholder="مثال: اشتباه صعوبات نمائية، تشتت انتباه..."
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
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المستجيب (معلمة الروضة / ولي الأمر)</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم المستجيب على القائمة"
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  {/* 3. Grade / Level */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المستوى / الصف في الروضة</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      type="text"
                      placeholder="مثال: تمهيدي / روضة ثانية (KG2)"
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
                      placeholder="مثال: معلمة الفصل، الأم، أخصائية التشخيص النمائي..."
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
                📑 أبعاد قائمة صعوبات التعلم النمائية (أ.د. عادل عبدالله):
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                اختر 2 لـ نعم (تنطبق تماماً)، 1 لـ أحياناً، 0 لـ لا (سلوك طبيعي) · (درجات أعلى = مؤشرات صعوبة أشد)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeDomainId === 'all' ? 'on' : ''}`}
                onClick={() => setActiveDomainId('all')}
                style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع العبارات ({DEV_LD_ITEMS.length})
              </button>
              {DEV_LD_DOMAINS.map(dom => {
                const domStat = psychometrics.domainResults.find(d => d.id === dom.id);
                const countAnswered = DEV_LD_ITEMS.filter(it => it.domainId === dom.id && form.scores[it.id] !== undefined).length;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    className={`tab ${activeDomainId === dom.id ? 'on' : ''}`}
                    onClick={() => setActiveDomainId(dom.id)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      whiteSpace: 'nowrap',
                      borderRight: `3px solid ${dom.color}`,
                    }}
                  >
                    {dom.icon} {dom.name} ({countAnswered}/{dom.itemsCount})
                    {domStat?.isDeficit && <span style={{ color: '#dc2626', fontWeight: 900, marginRight: 4 }}>⚠️</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const domain = DEV_LD_DOMAINS.find(d => d.id === item.domainId);
              const currentScore = form.scores[item.id];
              const currentNote = form.itemNotes[item.id] || '';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore !== undefined ? `1.5px solid ${domain?.color || '#0d9488'}` : '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: '260px' }}>
                      <span
                        style={{
                          background: domain?.color || '#0d9488',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        #{item.id} · {domain?.name}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                          {item.text}
                        </div>
                      </div>
                    </div>

                    {/* Rating Scale Buttons (2, 1, 0) */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {DEV_LD_RESPONSE_OPTIONS.map(opt => {
                        const scoreVal = opt.score;
                        const isSelected = currentScore === scoreVal;
                        return (
                          <button
                            key={scoreVal}
                            type="button"
                            onClick={() => handleScoreChange(item.id, scoreVal)}
                            className={`btn btn-xs ${isSelected ? 'btn-p' : 'btn-g'}`}
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.75rem',
                              fontWeight: isSelected ? 800 : 500,
                              background: isSelected
                                ? (scoreVal === 2 ? '#dc2626' : scoreVal === 1 ? '#ea580c' : '#0d9488')
                                : undefined,
                              color: isSelected ? '#fff' : undefined,
                              border: isSelected ? 'none' : undefined,
                            }}
                            title={opt.description}
                          >
                            {opt.label} {isSelected && '✓'}
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
                        color: currentScore === 2 ? '#b91c1c' : currentScore === 1 ? '#c2410c' : '#0f766e',
                        background: currentScore === 2 ? '#fee2e2' : currentScore === 1 ? '#ffedd5' : '#f0fdfa',
                        padding: '4px 10px',
                        borderRadius: 6,
                        marginBottom: 6,
                        border: `1px solid ${currentScore === 2 ? '#fca5a5' : currentScore === 1 ? '#fed7aa' : '#99f6e4'}`,
                      }}
                    >
                      <strong>التقدير المختار ({currentScore} درجات): </strong>
                      {DEV_LD_RESPONSE_OPTIONS.find(o => o.score === currentScore)?.label} — {DEV_LD_RESPONSE_OPTIONS.find(o => o.score === currentScore)?.description}
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
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0d9488', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> الخلاصة التشخيصية وتوصيات التدخل المبكر
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, background: '#0d9488', border: 'none' }}
              >
                ✨ إعادة توليد الخلاصة بناءً على الدرجات
              </button>
            </div>

            <div className="fg c1">
              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>التقرير الإكلينيكي وتفسير المؤشرات النمائية</label>
                <textarea
                  rows={6}
                  placeholder="الخلاصة التشخيصية وتفسير مظاهر القصور النمائي وفق معايير القائمة..."
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>توصيات برنامج التدخل المبكر والتهيئة النمائية</label>
                <textarea
                  rows={5}
                  placeholder="التوصيات العلاجية، الأنشطة الحسية والحركية واللغوية للروضة والمنزل..."
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
              تم الإجابة على <strong>{psychometrics.totalAnswered}</strong> من <strong>{DEV_LD_ITEMS.length}</strong> عبارة
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
                title="تعبئة نموذج افتراضي يظهر أداء نمائي طبيعي"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (طبيعي)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('at_risk')}
                title="تعبئة نموذج افتراضي يظهر طفل معرض للخطر"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (معرض للخطر)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('severe')}
                title="تعبئة نموذج افتراضي يظهر صعوبات نمائية مؤكدة"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (صعوبات نمائية)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, fontSize: '0.74rem', background: '#0d9488', border: 'none' }}
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
              💾 حفظ وحساب نتيجة قائمة صعوبات التعلم النمائية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
