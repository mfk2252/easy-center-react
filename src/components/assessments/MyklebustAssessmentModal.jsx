import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  MYKLEBUST_COPYRIGHT_INFO,
  MYKLEBUST_DIMENSIONS,
  MYKLEBUST_ITEMS,
  MYKLEBUST_RATING_OPTIONS,
  calculateMyklebustPsychometrics,
} from '../../data/myklebustData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_MYKLEBUST_FORM = {
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

export default function MyklebustAssessmentModal({
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
        ...EMPTY_MYKLEBUST_FORM,
        ...initialData,
        scores: initialData.scores || initialData.results || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_MYKLEBUST_FORM,
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
    return calculateMyklebustPsychometrics(form.scores || {});
  }, [form.scores]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return MYKLEBUST_ITEMS;
    return MYKLEBUST_ITEMS.filter(it => it.dimensionId === activeTab);
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

  function handleAutoFill(type = 'normal') {
    const newScores = {};
    MYKLEBUST_ITEMS.forEach(it => {
      const n = it.num || 1;
      if (type === 'normal') {
        newScores[it.id] = (n % 3 === 0) ? 5 : ((n % 2 === 0) ? 4 : 3);
      } else if (type === 'borderline') {
        newScores[it.id] = (n % 2 === 0) ? 3 : 2;
      } else if (type === 'verbal_ld') {
        if (it.dimensionId === 'auditory_comprehension' || it.dimensionId === 'spoken_language') {
          newScores[it.id] = (n % 2 === 0) ? 1 : 2;
        } else {
          newScores[it.id] = (n % 2 === 0) ? 4 : 3;
        }
      } else if (type === 'nonverbal_ld') {
        if (it.dimensionId === 'orientation' || it.dimensionId === 'motor_coordination' || it.dimensionId === 'personal_social') {
          newScores[it.id] = (n % 2 === 0) ? 1 : 2;
        } else {
          newScores[it.id] = 4;
        }
      } else if (type === 'severe_ld') {
        newScores[it.id] = (n % 3 === 0) ? 1 : 2;
      }
    });

    setForm(f => ({ ...f, scores: newScores }));
    toast(`⚡ تم تعبئة استجابات نموذجية (${type === 'normal' ? 'أداء طبيعي' : type === 'borderline' ? 'فئة حدية' : type === 'verbal_ld' ? 'صعوبات تعلم لفظية' : type === 'nonverbal_ld' ? 'صعوبات تعلم غير لفظية' : 'صعوبات تعلم عامة'}) للتجربة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 10) {
      toast('⚠️ يرجى تقييم 10 بنود على الأقل لتوليد الخلاصة التشخيصية المعتمدة', 'er');
      return;
    }

    const domainDetails = psychometrics.dimensionScores.map(d => {
      return `• ${d.name}: الدرجة (${d.score}/${d.maxScore}) - [${d.levelLabel}]`;
    }).join('\n');

    const verbalStatus = psychometrics.isVerbalDeficit
      ? `المجال اللفظي: يظهر قصوراً واضحاً (الدرجة: ${psychometrics.verbalScore} / 45 - أقل من الحد الفاصل 27).`
      : `المجال اللفظي: يقع ضمن الحدود الطبيعية المقبولة (${psychometrics.verbalScore} / 45).`;

    const nonVerbalStatus = psychometrics.isNonVerbalDeficit
      ? `المجال غير اللفظي: يظهر قصوراً دالاً (الدرجة: ${psychometrics.nonVerbalScore} / 75 - أقل من الحد الفاصل 45).`
      : `المجال غير اللفظي: يقع ضمن المستوى الطبيعي المناسب للعمر (${psychometrics.nonVerbalScore} / 75).`;

    const summary = `تقرير تشخيصي مقنن بمقياس مايكل بيست لتقدير السمات السلوكية (Myklebust PRS):\n\n` +
      `- الدرجة الخام الكلية: (${psychometrics.totalRawScore} / 120) بنسبة تحقق (${psychometrics.overallPercentage}%).\n` +
      `- ${verbalStatus}\n` +
      `- ${nonVerbalStatus}\n\n` +
      `القرار التشخيصي الإكلينيكي:\n` +
      `[${psychometrics.diagnosisType}] - ${psychometrics.diagnosisDescription}\n\n` +
      `تفاصيل الأداء على أبعاد المقياس الخمسة:\n` +
      `${domainDetails}\n\n` +
      `الخلاصة:\n` +
      `استناداً إلى معايير مايكل بيست ومقارنة أداء التلميذ بمتوسط الأقران، ${psychometrics.recommendation}`;

    const recs = psychometrics.isLD
      ? `1. تسجيل الطالب في برنامج غرف المصادر لصعوبات التعلم وبدء الخطة الفردية (IEP).\n` +
        `2. التركيز على استراتيجيات التدريس العلاجي في مجالات العجز المحددة (${psychometrics.deficitDimensions.map(d => d.name).join('، ')}).\n` +
        `3. استخدام أسلوب الحواس المتعددة (VAKT) وتجزئة التعليمات والمهام.\n` +
        `4. تقديم مواءمات تعليمية واختبارية (وقت إضافي، توضيح شفهي، تقليل المشتتات).\n` +
        `5. تعزيز المهارات ونقاط القوة والمساندة المستمرة من الأسرة والمعلم.`
      : `1. استمرار الطالب في الصف العادي مع المتابعة الدورية للتحصيل الأكاديمي.\n` +
        `2. تدعيم جوانب التميز وتشجيع التفاعل الصفي الإيجابي.\n` +
        `3. تقديم أنشطة إثرائية لتطوير المهارات اللغوية والإدراكية.`;

    setForm(f => ({
      ...f,
      clinicalSummary: summary,
      recommendations: recs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية والتوصيات التربوية بناءً على محكات مايكل بيست', 'ok');
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

    if (psychometrics.totalAnswered < MYKLEBUST_ITEMS.length) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.totalAnswered} من أصل ${MYKLEBUST_ITEMS.length} بنداً. هل تود حفظ التقييم كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'myklebust_scale',
      scaleId: 'myklebust_scale',
      scaleType: 'myklebust',
      measureName: 'مقياس مايكل بيست للتعرف على صعوبات التعلم (PRS)',
      scaleName: 'مقياس مايكل بيست للتعرف على صعوبات التعلم (PRS)',
      category: 'learning_academic',
      categoryName: 'صعوبات التعلم النمائية والأكاديمية',
      author: MYKLEBUST_COPYRIGHT_INFO.authorAr,
      score: psychometrics.totalRawScore,
      maxScore: 120,
      percentage: `${psychometrics.overallPercentage}%`,
      level: psychometrics.diagnosisType,
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
      toast('✅ تم تحديث تقييم مايكل بيست (PRS) بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', {
        ...payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق مقياس مايكل بيست (PRS) بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  function handleSafeClose() {
    const answeredCount = Object.keys(form.scores || {}).length;
    if (answeredCount > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${answeredCount}) بنداً في مقياس مايكل بست. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
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
            background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #0284c7 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>📊</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس مايكل بيست للتعرف على صعوبات التعلم (Myklebust PRS)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  24 بنداً تقييمياً · 5 أبعاد رئيسية
                </span>
                <span className="bdg" style={{ background: '#ecfeff', color: '#0891b2', fontSize: '0.7rem', fontWeight: 800 }}>
                  المجال اللفظي وغير اللفظي
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#164e63', color: '#cffafe', fontSize: '0.68rem', fontWeight: 800 }}>
                  © هلمر مايكل بيست / تقنين د. مصطفى كامل ود. تيسير كوافحة
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Pupil Rating Scale (PRS) — أداة الملاحظة والتقدير السلوكي للكشف عن صعوبات التعلم
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
                color: showCopyrightDetails ? '#0891b2' : '#fff',
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
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس مايكل بيست (PRS):
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
                  <strong>إشعار حقوق الملكية الفكرية والتقنين:</strong> {MYKLEBUST_COPYRIGHT_INFO.scaleNameAr} — إعداد د. هلمر ر. مايكل بيست ({MYKLEBUST_COPYRIGHT_INFO.authorOriginal}) · التقنين والتعريب: {MYKLEBUST_COPYRIGHT_INFO.authorAr}.
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#f0fdfa', padding: '3px 8px', borderRadius: 6, border: '1px solid #5eead4', fontWeight: 700 }}>
                مخصص للتشخيص والتقييم التربوي المرخص
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>المؤلف الأصلي:</strong> {MYKLEBUST_COPYRIGHT_INFO.authorOriginal}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>التقنين العربي:</strong> {MYKLEBUST_COPYRIGHT_INFO.authorAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>الفئة المستهدفة:</strong> {MYKLEBUST_COPYRIGHT_INFO.targetGroup}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>طريقة التطبيق:</strong> {MYKLEBUST_COPYRIGHT_INFO.measurementMethod}
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
                border: '1.5px solid #0891b2',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المجموع الكلي للمقياس:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.overallColor }}>
                {psychometrics.totalRawScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / 120 (المتوسط 72)
              </span>
            </div>

            {/* Verbal Scale Score */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.isVerbalDeficit ? '#fca5a5' : '#cbd5e1'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المجال اللفظي (9 بنود):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.isVerbalDeficit ? '#dc2626' : '#2563eb' }}>
                {psychometrics.verbalScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: psychometrics.isVerbalDeficit ? '#dc2626' : 'var(--text-sub)', marginRight: 4, fontWeight: 700 }}>
                / 45 {psychometrics.isVerbalDeficit ? '(⚠️ قصور)' : '(✓ طبيعي)'}
              </span>
            </div>

            {/* Non-Verbal Scale Score */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.isNonVerbalDeficit ? '#fca5a5' : '#cbd5e1'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المجال غير اللفظي (15 بنداً):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.isNonVerbalDeficit ? '#dc2626' : '#0891b2' }}>
                {psychometrics.nonVerbalScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: psychometrics.isNonVerbalDeficit ? '#dc2626' : 'var(--text-sub)', marginRight: 4, fontWeight: 700 }}>
                / 75 {psychometrics.isNonVerbalDeficit ? '(⚠️ قصور)' : '(✓ طبيعي)'}
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
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>التصنيف التشخيصي المعتمد:</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: psychometrics.overallColor }}>
                {psychometrics.diagnosisType}
              </span>
            </div>
          </div>

          {/* Progress & Quick Auto Fill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {psychometrics.totalAnswered} / {MYKLEBUST_ITEMS.length} بنداً تم تقييمه
              </div>
              <div style={{ background: 'var(--border-color)', height: 6, width: 120, borderRadius: 3, marginTop: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    background: psychometrics.completionPercentage === 100 ? '#059669' : '#0891b2',
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
                      placeholder="مثال: الصف الثالث الابتدائي"
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
                      placeholder="مثال: معلم الفصل، معلم صعوبات التعلم، الأب..."
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
                📑 أبعاد مقياس مايكل بيست (Myklebust Dimensions):
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                اختر 1 لمنخفض جداً، 2 لمنخفض، 3 لمتوسط (عادي)، 4 لفوق المتوسط، 5 لممتاز/متفوق
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeTab === 'all' ? 'on' : ''}`}
                onClick={() => setActiveTab('all')}
                style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع البنود ({MYKLEBUST_ITEMS.length})
              </button>
              {MYKLEBUST_DIMENSIONS.map(dom => {
                const domStat = psychometrics.dimensionScores.find(d => d.id === dom.id);
                const countAnswered = MYKLEBUST_ITEMS.filter(it => it.dimensionId === dom.id && form.scores[it.id] !== undefined).length;
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const domain = MYKLEBUST_DIMENSIONS.find(d => d.id === item.dimensionId);
              const currentScore = form.scores[item.id];
              const currentNote = form.itemNotes[item.id] || '';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore !== undefined ? `1.5px solid ${domain?.color || '#0891b2'}` : '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: '260px' }}>
                      <span
                        style={{
                          background: domain?.color || '#0891b2',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        #{item.num || item.id.replace('myk_', '')} · {domain?.name?.split(':')[1] || domain?.name}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                          {item.title}
                        </div>
                        {item.text && (
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
                            <span style={{ color: '#0891b2', fontWeight: 800, flexShrink: 0, fontSize: '0.74rem' }}>
                              💡 الوصف السلوكي:
                            </span>
                            <span style={{ color: 'var(--text-sub)' }}>
                              {item.text}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating Scale Buttons (1 to 5) */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {(item.options || MYKLEBUST_RATING_OPTIONS).map(opt => {
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
                                ? (scoreVal === 1 ? '#dc2626' : scoreVal === 2 ? '#ea580c' : scoreVal === 3 ? '#0284c7' : scoreVal === 4 ? '#059669' : '#16a34a')
                                : undefined,
                              color: isSelected ? '#fff' : undefined,
                              border: isSelected ? 'none' : undefined,
                            }}
                            title={opt.description || opt.desc}
                          >
                            {scoreVal} - {opt.label.split(' ')[0]} {isSelected && '✓'}
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
                        color: currentScore <= 2 ? '#b91c1c' : '#0369a1',
                        background: currentScore <= 2 ? '#fee2e2' : '#f0f9ff',
                        padding: '4px 10px',
                        borderRadius: 6,
                        marginBottom: 6,
                        border: `1px solid ${currentScore <= 2 ? '#fca5a5' : '#bae6fd'}`,
                      }}
                    >
                      <strong>المستوى المختار ({currentScore}): </strong>
                      {item.options?.find(o => o.score === currentScore)?.description ||
                        MYKLEBUST_RATING_OPTIONS.find(o => o.score === currentScore)?.desc}
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
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0891b2', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> الخلاصة التشخيصية والتوصيات التربوية المعتمدة
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, background: '#0891b2', border: 'none' }}
              >
                ✨ إعادة توليد الخلاصة بناءً على الدرجات
              </button>
            </div>

            <div className="fg c1">
              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>التقرير السيكومتري والتشخيص الإكلينيكي</label>
                <textarea
                  rows={6}
                  placeholder="الخلاصة التشخيصية والوصف النفسي التربوي وفق محكات مايكل بيست..."
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>توصيات الخطة التربوية الفردية (IEP) وغرفة المصادر</label>
                <textarea
                  rows={5}
                  placeholder="التوصيات العلاجية، المواءمات الأكاديمية والبيئية، وتعديلات التدخل الفردي..."
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
              تم الإجابة على <strong>{psychometrics.totalAnswered}</strong> من <strong>{MYKLEBUST_ITEMS.length}</strong> بنداً
            </span>
            <span className={`bdg ${psychometrics.completionPercentage === 100 ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.72rem' }}>
              {psychometrics.completionPercentage}% مكتمل
            </span>

            {/* Quick Actions moved to footer */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 6 }}>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('borderline')}
                title="تعبئة نموذج افتراضي يظهر أداء حدي"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (فئة حدية)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('verbal_ld')}
                title="تعبئة نموذج افتراضي يظهر صعوبات تعلم لفظية"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (صعوبات لفظية)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, fontSize: '0.74rem', background: '#0891b2', border: 'none' }}
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
                background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                padding: '8px 20px',
              }}
            >
              💾 حفظ وحساب تقييم مايكل بيست (PRS)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
