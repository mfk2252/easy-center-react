import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  PEP3_ITEMS,
  PEP3_DOMAINS,
  PEP3_RESPONSE_OPTIONS,
  PEP3_COPYRIGHT_INFO,
  calculatePEP3Score,
} from '../../data/pep3Data';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_PEP3_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'ولي الأمر / الأم',
  relationshipDuration: 'منذ الولادة',
  examinerName: '',
  examinerRole: 'أخصائي تشخيص ونمو وتأهيل سلوكي',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function PEP3AssessmentModal({
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
        ...EMPTY_PEP3_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_PEP3_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
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

  // Real-time calculation of PEP-3 psychometrics
  const psychometrics = useMemo(() => {
    return calculatePEP3Score(form.scores);
  }, [form.scores]);

  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return PEP3_ITEMS;
    return PEP3_ITEMS.filter(it => it.domainId === activeDomainFilter);
  }, [activeDomainFilter]);

  if (!isOpen) return null;

  function handleScoreSelect(itemId, value) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: Number(value),
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

  function autoFillSample(level = 'normal') {
    const scores = {};
    PEP3_ITEMS.forEach(it => {
      // 2: Pass, 1: Emerging, 0: Fail
      const numId = parseInt(it.id.replace('pep3_', ''), 10);
      if (level === 'normal') {
        scores[it.id] = (numId % 8 === 0) ? 1 : 2;
      } else if (level === 'mild') {
        scores[it.id] = (numId % 3 === 0) ? 1 : (numId % 2 === 0 ? 2 : 1);
      } else if (level === 'moderate') {
        scores[it.id] = (numId % 4 === 0) ? 2 : (numId % 2 === 0 ? 1 : 0);
      } else if (level === 'severe') {
        scores[it.id] = (numId % 6 === 0) ? 1 : 0;
      } else if (level === 'clear') {
        scores[it.id] = undefined;
      }
    });

    if (level === 'clear') {
      setForm(f => ({ ...f, scores: {} }));
      toast('تم تصفير جميع إجابات بنود مقياس PEP-3', 'info');
      return;
    }

    setForm(f => ({ ...f, scores }));
    const labelMap = {
      normal: 'نمو طبيعي / متكافئ',
      mild: 'تأخر نمائي بسيط (بزوغ عالي)',
      moderate: 'تأخر نمائي متوسط',
      severe: 'تأخر نمائي شديد',
    };
    toast(`⚡ تم تطبيق تعبئة نموذجية (${labelMap[level]}) لأغراض التجربة الإكلينيكية`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 10) {
      toast('⚠️ يرجى تقييم 10 بنود على الأقل لتوليد الخلاصة التشخيصية المعتمدة', 'er');
      return;
    }

    const subscaleDetails = psychometrics.subscales.map(s => {
      return `• ${s.name} (${s.code}): الخام (${s.raw}/${s.maxRaw}) ➔ معيارية (${s.tScore} T) - [مستوى الأداء: ${s.level}]`;
    }).join('\n');

    const suggestedSummary = `تقرير التقييم النفسي التربوي للتوحد والنمو (PEP-3) المقنن:
المفحوص: ${form.studentName || '—'} | العمر الزمني: ${form.age || '—'} | تاريخ التقييم: ${form.date || todayStr()}

📊 الخلاصة السيكومترية والسن النمائي:
- مجموع الدرجات الخام الكلية: (${psychometrics.totalRawScore} / 100)
- السن النمائي المقدر الشامل: (${psychometrics.estimatedDevelopmentalAge})
- الرتبة المئينية الكلية: (${psychometrics.percentile}%)
- التقدير العام للفجوة النمائية: [${psychometrics.overallLevel}]
- توزيع البنود: (${psychometrics.passCount} مهارة مكتسبة | ${psychometrics.emergingCount} مهارة في طور البزوغ | ${psychometrics.failCount} مهارة إخفاق بحاجة لتأسيس)

📈 تفصيل المقاييس الفرعية لـ PEP-3:
${subscaleDetails}

📝 التحليل الإكلينيكي والوصف النمائي:
${psychometrics.interpretation}`;

    const isSevere = psychometrics.totalRawScore < 40;
    const isModerate = psychometrics.totalRawScore >= 40 && psychometrics.totalRawScore < 60;
    const isMild = psychometrics.totalRawScore >= 60 && psychometrics.totalRawScore < 80;

    const suggestedRecs = !psychometrics.isComplete
      ? 'يرجى استكمال تقييم كافة البنود الـ 50 لتوليد توصيات الخطة الفردية بدقة متناهية.'
      : psychometrics.totalRawScore >= 80
      ? `1. استمرار دمج الطفل في بيئات التعليم الشامل والأنشطة الاجتماعية اليومية.
2. التركيز على تنمية المهارات التعبيرية المتقدمة والمحادثات التبادلية.
3. دعم المهارات الاستقلالية والأكاديمية المعرفية في مرحلة ما قبل المدرسة.`
      : isMild
      ? `1. استهداف بنود البزوغ (Emerging) البالغ عددها (${psychometrics.emergingCount}) مهارة كأولويات قصوى في الخطة التربوية الفردية (IEP).
2. تحفيز مهارات التواصل التعبيري وبناء الجمل الوظيفية البسيطة.
3. تنفيذ تدريبات حركية دقيقة يومية (لضم خرز، قص بالمقص، تشكيل بالصلصال) لتحسين التآزر البصري الحركي.
4. تعزيز مهارات اللعب التشاركي وتبادل الأدوار مع الأقران.`
      : isModerate
      ? `1. تصميم برنامج تدخل سلوكي وتواصلي مكثف يعتمد على الدعم البصري ومنهجية برنامج تيتش (TEACCH).
2. تنمية مهارات الإدراك المعرفي (المطابقة، التصنيف، إدراك دوام الأشياء، حل البازل البسيط).
3. استخدام جداول المهام البصرية وتجزئة الأوامر اللفظية المركبة إلى خطوات مفردة مدعومة بالإيماء.
4. تفعيل جلسات العلاج الوظيفي (OT) والتكامل الحسي للتحكم في التآزر الدقيق والتوازن.
5. تدريب الأسرة على تطبيق استراتيجيات التعزيز والنمذجة المنزلية.`
      : `1. حاجة ماسة لبرنامج تدخل مبكر مكثف وعالي التكرار (ABA / TEACCH) لردم الفجوة النمائية الواسعة.
2. اعتماد نظام التواصل البديل والمعزز (PECS / جداول تواصل بصرية) لتمكين الطفل من التعبير عن احتياجاته الأساسية.
3. برنامج علاجي مكثف للنطق والتخاطب واللغة الاستقبالية والتواصل غير اللفظي.
4. خطة رعاية ذاتية للمهارات الحياتية اليومية (تفريش الأسنان، استخدام الحمام، تناول الطعام باستقلالية).
5. تكثيف جلسات التكامل الحسي والعلاج الوظيفي لتقليل التوتر الحسي وتهيئة الطفل للمهام التعليمية.`;

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد وتحديث الخلاصة التشخيصية والتوصيات التربوية المعتمدة بنجاح', 'ok');
  }

  function handleSave(previewReport = false) {
    if (form.mode === 'registered' && !form.stuId && !form.studentName) {
      toast('يرجى تحديد الطالب أو اختيار الإدخال المباشر', 'er');
      return;
    }
    if (!form.studentName) {
      toast('يرجى كتابة اسم المفحوص', 'er');
      return;
    }

    const payload = {
      id: initialData?.id || uid(),
      type: 'pep3',
      scaleType: 'pep3',
      scaleName: 'ملف التقييم النفسي التربوي للتوحد (PEP-3)',
      studentId: form.stuId || form.studentId || null,
      studentName: form.studentName,
      dob: form.dob,
      age: form.age,
      diagnosis: form.diagnosis,
      grade: form.grade,
      school: form.school,
      raterName: form.raterName,
      raterRelation: form.raterRelation,
      relationshipDuration: form.relationshipDuration,
      examinerName: form.examinerName,
      examinerRole: form.examinerRole,
      date: form.date,
      notes: form.notes,
      itemNotes: form.itemNotes,
      scores: form.scores,
      results: form.scores,
      psychometrics,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('assessments', payload);
      toast('تم تحديث تقييم بيب-3 (PEP-3) بنجاح', 'ok');
    } else {
      payload.createdAt = new Date().toISOString();
      lsAdd('assessments', payload);
      toast('تم حفظ تقييم بيب-3 (PEP-3) بنجاح', 'ok');
    }

    if (onSaved) onSaved(payload, previewReport);
    if (!previewReport) onClose();
  }

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 12,
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-box"
        style={{
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-main, #1e293b)',
          width: '100%',
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border-color, #e2e8f0)',
        }}
      >
        {/* Header Standard */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
            color: '#ffffff',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.6rem' }}>📋</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                  ملف التقييم النفسي التربوي للتوحد (PEP-3) — الإصدار الثالث المطور
                </h3>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  50 بنداً · 8 مقاييس فرعية
                </span>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  TEACCH & DSM-5
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', opacity: 0.9 }}>
                Psychoeducational Profile (PEP-3) — أداة تقدير السن النمائي، نقاط القوة، وبزوغ المهارات
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowCopyrightDetails(prev => !prev)}
              className="btn btn-sm"
              style={{
                background: showCopyrightDetails ? '#fef3c7' : 'rgba(255,255,255,0.18)',
                color: showCopyrightDetails ? '#92400e' : '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '5px 10px',
                borderRadius: 8,
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء الملكية الفكرية' : 'حقوق الملكية الفكرية'}
            </button>

            <button
              type="button"
              onClick={() => setIsHeaderCollapsed(c => !c)}
              className="btn btn-sm"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: 'none',
                fontSize: '0.78rem',
                padding: '5px 10px',
                borderRadius: 8,
              }}
            >
              {isHeaderCollapsed ? '🔽 إظهار بيانات الطالب' : '🔼 طي البيانات'}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Collapsible Intellectual Property Box */}
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
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لملف PEP-3:
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
                  <strong>إشعار الأمانة العلمية والاعتماد المهني:</strong> ملف التقييم النفسي التربوي للتوحد (PEP-3) — إعداد: د. إيريك شوبلر وفريقه (Eric Schopler et al.) · دار برو-إد (PRO-ED, Inc.) وبرنامج تيتش (Division TEACCH).
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#bfdbfe', padding: '3px 8px', borderRadius: 6, border: '1px solid #93c5fd', fontWeight: 700 }}>
                مخصص للتشخيص والتقييم النمائي المرخص
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>المؤلفون الأصليون:</strong> {PEP3_COPYRIGHT_INFO.authorAr} ({PEP3_COPYRIGHT_INFO.authorEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>جهة النشر الأصلية:</strong> {PEP3_COPYRIGHT_INFO.publisherAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>الفئة المستهدفة:</strong> {PEP3_COPYRIGHT_INFO.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>المرجعية التشخيصية:</strong> {PEP3_COPYRIGHT_INFO.standardsReference}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#1e40af', background: '#dbeafe', padding: '8px 12px', borderRadius: 8 }}>
              {PEP3_COPYRIGHT_INFO.notice}
              <br />
              <strong>{PEP3_COPYRIGHT_INFO.disclaimer}</strong>
            </div>
          </div>
        )}

        {/* Real-time Psychometrics & Developmental Age Strip */}
        <div
          className="modal-subbar"
          style={{
            background: 'var(--g0, #f8fafc)',
            padding: '10px 18px',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Developmental Age Equivalent */}
            <div
              style={{
                background: 'var(--bg-card, #ffffff)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #2563eb',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub, #64748b)', display: 'block' }}>
                السن النمائي المقدر:
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.estimatedDevelopmentalAge}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub, #64748b)', marginRight: 4 }}>
                (مئيني: {psychometrics.percentile}%)
              </span>
            </div>

            {/* Total Raw Score */}
            <div style={{ background: 'var(--bg-card, #ffffff)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub, #64748b)', display: 'block' }}>مجموع الدرجة الخام:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e40af' }}>
                {psychometrics.totalRawScore} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub, #64748b)' }}>/ 100</small>
              </span>
            </div>

            {/* Counters: Pass / Emerging / Fail */}
            <div style={{ background: 'var(--bg-card, #ffffff)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub, #64748b)', display: 'block' }}>حالة المهارات:</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main, #1e293b)' }}>
                منجز: <b style={{ color: '#16a34a' }}>{psychometrics.passCount}</b> | بزوغ: <b style={{ color: '#ca8a04' }}>{psychometrics.emergingCount}</b> | إخفاق: <b style={{ color: '#dc2626' }}>{psychometrics.failCount}</b>
              </span>
            </div>

            {/* Overall Level Badge */}
            <div style={{ background: 'var(--bg-card, #ffffff)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub, #64748b)' }}>المستوى النمائي:</span>
              <span
                className={`bdg ${
                  psychometrics.severityKey === 'normal' || psychometrics.severityKey === 'mild_plus'
                    ? 'b-gr'
                    : psychometrics.severityKey === 'mild'
                    ? 'b-bl'
                    : psychometrics.severityKey === 'moderate'
                    ? 'b-or'
                    : 'b-rd'
                }`}
                style={{ fontWeight: 800, fontSize: '0.78rem' }}
              >
                {psychometrics.overallLevel}
              </span>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {psychometrics.totalAnswered} / {psychometrics.totalItems} بنداً
              </span>
              <div style={{ width: 60, height: 8, background: 'var(--border-color, #e2e8f0)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${psychometrics.completionPercentage}%`,
                    height: '100%',
                    background: psychometrics.completionPercentage === 100 ? 'var(--ok, #10b981)' : '#2563eb',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. Student & Assessment Info Card */}
          <div
            style={{
              background: 'var(--g0, #f8fafc)',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--border-color, #e2e8f0)',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isHeaderCollapsed ? 0 : 10,
                cursor: 'pointer',
              }}
              onClick={() => setIsHeaderCollapsed(c => !c)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1rem' }}>👤</span>
                <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>بيانات المفحوص وجلسة تقييم PEP-3</span>
                {form.studentName && (
                  <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>
                    ({form.studentName} {form.age ? `— ${form.age}` : ''})
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub, #64748b)' }}>
                  {isHeaderCollapsed ? 'اضغط لتعديل البيانات 🔽' : 'اضغط للطي 🔼'}
                </span>
              </div>
            </div>

            {!isHeaderCollapsed && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {/* Student Select / Mode */}
                <div>
                  <label className="lbl" style={{ fontSize: '0.75rem', marginBottom: 2 }}>
                    الطالب المفحوص <span style={{ color: 'red' }}>*</span>
                  </label>
                  {form.mode === 'registered' ? (
                    <select
                      className="inp"
                      value={form.stuId || ''}
                      onChange={handleSelectStudent}
                      style={{ fontSize: '0.82rem', padding: '5px 8px' }}
                    >
                      <option value="">-- اختر من قائمة الطلاب --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.age ? `(${s.age})` : ''}
                        </option>
                      ))}
                      <option value="__other__">+ إدخال اسم طالب آخر يدوياً</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input
                        type="text"
                        className="inp"
                        placeholder="اكتب اسم الطالب..."
                        value={form.studentName}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                        style={{ fontSize: '0.82rem', padding: '5px 8px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setForm(f => ({ ...f, mode: 'registered' }))}
                        style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                        title="العودة للاختيار من القائمة"
                      >
                        قائمة
                      </button>
                    </div>
                  )}
                </div>

                {/* Birthdate & Chronological Age */}
                <div>
                  <label className="lbl" style={{ fontSize: '0.75rem', marginBottom: 2 }}>
                    تاريخ الميلاد والعمر الزمني
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    <input
                      type="date"
                      className="inp"
                      value={form.dob || ''}
                      onChange={e => {
                        const newDob = e.target.value;
                        const ageCalc = newDob ? calcAge(newDob) : '';
                        setForm(f => ({ ...f, dob: newDob, age: ageCalc || f.age }));
                      }}
                      style={{ fontSize: '0.78rem', padding: '4px 6px' }}
                    />
                    <input
                      type="text"
                      className="inp"
                      placeholder="العمر (مثال: 4 سنوات)"
                      value={form.age || ''}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                      style={{ fontSize: '0.78rem', padding: '4px 6px' }}
                    />
                  </div>
                </div>

                {/* Diagnosis / Notes */}
                <div>
                  <label className="lbl" style={{ fontSize: '0.75rem', marginBottom: 2 }}>
                    التشخيص الطبي / الحالة
                  </label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="مثال: اضطراب طيف توحد نمائي"
                    value={form.diagnosis || ''}
                    onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                    style={{ fontSize: '0.82rem', padding: '5px 8px' }}
                  />
                </div>

                {/* Examiner / Specialist */}
                <div>
                  <label className="lbl" style={{ fontSize: '0.75rem', marginBottom: 2 }}>
                    الأخصائي الفاحص
                  </label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="اسم الأخصائي"
                    value={form.examinerName}
                    onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    style={{ fontSize: '0.82rem', padding: '5px 8px' }}
                  />
                </div>

                {/* Rater & Relation */}
                <div>
                  <label className="lbl" style={{ fontSize: '0.75rem', marginBottom: 2 }}>
                    مستجيب المقياس والصلة
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 4 }}>
                    <input
                      type="text"
                      className="inp"
                      placeholder="اسم ولي الأمر / المعلم"
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                      style={{ fontSize: '0.78rem', padding: '4px 6px' }}
                    />
                    <input
                      type="text"
                      className="inp"
                      placeholder="الصلة (الأم / المعلم)"
                      value={form.raterRelation || ''}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                      style={{ fontSize: '0.78rem', padding: '4px 6px' }}
                    />
                  </div>
                </div>

                {/* Assessment Date */}
                <div>
                  <label className="lbl" style={{ fontSize: '0.75rem', marginBottom: 2 }}>
                    تاريخ تطبيق التقييم
                  </label>
                  <input
                    type="date"
                    className="inp"
                    value={form.date || todayStr()}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ fontSize: '0.82rem', padding: '5px 8px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Subscale Navigation & Quick Actions Bar */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>🎯 تصفية المقاييس الفرعية لـ PEP-3:</span>
              </div>

              {/* Quick Sample Auto Fill buttons */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub, #64748b)', fontWeight: 700 }}>تعبئة تجريبية:</span>
                <button
                  type="button"
                  onClick={() => autoFillSample('normal')}
                  className="btn btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                >
                  🟢 متكافئ
                </button>
                <button
                  type="button"
                  onClick={() => autoFillSample('mild')}
                  className="btn btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                >
                  🔵 بسيط
                </button>
                <button
                  type="button"
                  onClick={() => autoFillSample('moderate')}
                  className="btn btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
                >
                  🟡 متوسط
                </button>
                <button
                  type="button"
                  onClick={() => autoFillSample('severe')}
                  className="btn btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                >
                  🔴 حاد
                </button>
                <button
                  type="button"
                  onClick={() => autoFillSample('clear')}
                  className="btn btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', background: 'var(--g0, #f8fafc)', color: 'var(--text-sub, #64748b)', border: '1px solid var(--border-color, #e2e8f0)' }}
                >
                  تصفير ↺
                </button>
              </div>
            </div>

            {/* Domain Tabs with Badges */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveDomainFilter('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: activeDomainFilter === 'all' ? '2px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
                  background: activeDomainFilter === 'all' ? '#eff6ff' : 'var(--bg-card, #ffffff)',
                  color: activeDomainFilter === 'all' ? '#1d4ed8' : 'var(--text-main, #1e293b)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>الكل (جميع البنود)</span>
                <span
                  style={{
                    background: activeDomainFilter === 'all' ? '#2563eb' : '#e2e8f0',
                    color: activeDomainFilter === 'all' ? '#fff' : '#475569',
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: 10,
                  }}
                >
                  50
                </span>
              </button>

              {PEP3_DOMAINS.map(d => {
                const subMeta = psychometrics.subscales.find(s => s.id === d.id);
                const isSelected = activeDomainFilter === d.id;
                const isComplete = subMeta?.isComplete;

                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setActiveDomainFilter(d.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? `2px solid ${d.color}` : '1px solid var(--border-color, #e2e8f0)',
                      background: isSelected ? d.bgLight : 'var(--bg-card, #ffffff)',
                      color: isSelected ? d.color : 'var(--text-main, #1e293b)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{d.name} ({d.code})</span>
                    <span
                      style={{
                        background: isComplete ? '#10b981' : isSelected ? d.color : '#e2e8f0',
                        color: isComplete || isSelected ? '#fff' : '#475569',
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        borderRadius: 10,
                      }}
                    >
                      {subMeta?.answeredCount || 0}/{d.itemsCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Items Evaluation Table */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: 10,
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--g0, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                  <th style={{ width: 45, padding: '10px 8px', textAlign: 'center', color: 'var(--text-sub, #64748b)' }}>#</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>المهارة والنشاط السلوكي النمائي</th>
                  <th style={{ width: 140, padding: '10px 8px', textAlign: 'center' }}>المجال النمائي</th>
                  <th style={{ width: 330, padding: '10px 8px', textAlign: 'center' }}>درجة التقييم (PEP-3 Scale)</th>
                  <th style={{ width: 180, padding: '10px 12px', textAlign: 'right' }}>ملاحظات نوعية</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((it, idx) => {
                  const domain = PEP3_DOMAINS.find(d => d.id === it.domainId);
                  const currentScore = form.scores[it.id];
                  const itemNote = form.itemNotes[it.id] || '';
                  const isEmerging = currentScore === 1;
                  const isFail = currentScore === 0;

                  return (
                    <tr
                      key={it.id}
                      style={{
                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                        background: isEmerging
                          ? 'rgba(254, 249, 195, 0.45)'
                          : isFail
                          ? 'rgba(254, 226, 226, 0.35)'
                          : currentScore === 2
                          ? 'rgba(220, 252, 231, 0.25)'
                          : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      {/* Item # */}
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800, color: 'var(--text-sub, #64748b)', fontSize: '0.78rem' }}>
                        {it.id.replace('pep3_', '')}
                      </td>

                      {/* Item Text */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main, #1e293b)', lineHeight: 1.5 }}>
                          {it.text}
                        </div>
                      </td>

                      {/* Domain Badge */}
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: domain?.bgLight || '#f1f5f9',
                            color: domain?.color || '#334155',
                            border: `1px solid ${domain?.borderColor || '#cbd5e1'}`,
                            display: 'inline-block',
                          }}
                        >
                          {domain?.code} · {domain?.name.split(' ')[0]}
                        </span>
                      </td>

                      {/* Response Radio Buttons */}
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                          {PEP3_RESPONSE_OPTIONS.map(opt => {
                            const isSelected = currentScore === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleScoreSelect(it.id, opt.value)}
                                title={opt.text}
                                style={{
                                  padding: '5px 4px',
                                  borderRadius: 6,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: isSelected ? `2px solid ${opt.color}` : '1px solid var(--border-color, #e2e8f0)',
                                  background: isSelected ? opt.bg : 'var(--bg-card, #ffffff)',
                                  color: isSelected ? opt.color : 'var(--text-sub, #64748b)',
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <span>{opt.label}</span>
                                <small style={{ fontSize: '0.62rem', opacity: 0.85 }}>({opt.value} ن)</small>
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Qualitative Notes */}
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="text"
                          className="inp"
                          placeholder="ملاحظات..."
                          value={itemNote}
                          onChange={e => handleItemNoteChange(it.id, e.target.value)}
                          style={{ fontSize: '0.75rem', padding: '4px 6px', width: '100%' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. Automated Clinical Summary & IEP Recommendations Section */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.1rem' }}>📝</span>
                <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                  التقرير والتحليل الإكلينيكي وتوصيات الخطة الفردية (IEP)
                </span>
              </div>
              <button
                type="button"
                onClick={applyAutoClinicalSummary}
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  borderRadius: 8,
                }}
              >
                ✨ توليد وتحديث الخلاصة التشخيصية والتوصيات آلياً
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="lbl" style={{ fontSize: '0.78rem', marginBottom: 4, display: 'block' }}>
                  الخلاصة الإكلينيكية وتفسير الفجوة النمائية:
                </label>
                <textarea
                  className="inp"
                  rows={6}
                  placeholder="انقر على زر التوليد الآلي أعلاه لاستخراج التحليل النمائي السيكومتري الشامل..."
                  value={form.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  style={{ fontSize: '0.8rem', lineHeight: 1.5, width: '100%', resize: 'vertical' }}
                />
              </div>

              <div>
                <label className="lbl" style={{ fontSize: '0.78rem', marginBottom: 4, display: 'block' }}>
                  التوصيات التربوية وأولويات الخطة الفردية (IEP):
                </label>
                <textarea
                  className="inp"
                  rows={6}
                  placeholder="التوصيات التربوية والتأهيلية لردم الفجوة النمائية واستهداف مهارات البزوغ (Emerging)..."
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  style={{ fontSize: '0.8rem', lineHeight: 1.5, width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Standard */}
        <div
          className="modal-footer"
          style={{
            background: 'var(--g0, #f8fafc)',
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="btn"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color, #cbd5e1)',
              color: 'var(--text-main, #334155)',
              fontWeight: 700,
              fontSize: '0.82rem',
              padding: '6px 14px',
              borderRadius: 8,
            }}
          >
            إغلاق
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub, #64748b)' }}>
              تم الإجابة على <b>{psychometrics.totalAnswered}</b> من <b>50</b> بنداً ({psychometrics.completionPercentage}%)
            </span>

            <button
              type="button"
              className="btn"
              onClick={() => handleSave(false)}
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1.5px solid #2563eb',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '6px 14px',
                borderRadius: 8,
              }}
            >
              💾 حفظ مؤقت
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSave(true)}
              style={{
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.84rem',
                padding: '6px 18px',
                borderRadius: 8,
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
              }}
            >
              📊 حفظ ومعاينة التقرير المقنن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
