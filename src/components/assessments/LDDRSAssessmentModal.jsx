import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  LDDRS_COPYRIGHT_INFO,
  LDDRS_SCALES,
  LDDRS_ITEMS,
  LDDRS_RATING_OPTIONS,
  calculateLDDRSPsychometrics,
} from '../../data/lddrsData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_LDDRS_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: '',
  school: 'المدرسة الابتدائية',
  semester: 'الفصل الدراسي الأول',
  academicYear: '1446 / 1447 هـ',
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

export default function LDDRSAssessmentModal({
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
        ...EMPTY_LDDRS_FORM,
        ...initialData,
        scores: initialData.scores || initialData.results || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_LDDRS_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeScaleId, setActiveScaleId] = useState(LDDRS_SCALES[0]?.id || 'attention');
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
      school: stu.school || stu.schoolName || 'المدرسة الابتدائية',
    }));
  }

  const psychometrics = useMemo(() => {
    return calculateLDDRSPsychometrics(form.scores || {});
  }, [form.scores]);

  const currentScale = useMemo(() => {
    return LDDRS_SCALES.find(s => s.id === activeScaleId) || LDDRS_SCALES[0];
  }, [activeScaleId]);

  const currentScaleItems = useMemo(() => {
    return LDDRS_ITEMS.filter(it => it.scaleId === activeScaleId);
  }, [activeScaleId]);

  const currentScalePsych = useMemo(() => {
    return psychometrics.scaleResults.find(s => s.id === activeScaleId);
  }, [psychometrics.scaleResults, activeScaleId]);

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

    LDDRS_ITEMS.forEach(it => {
      if (level === 'normal') {
        newScores[it.id] = (it.id.charCodeAt(it.id.length - 1) % 4 === 0) ? 1 : 0;
      } else if (level === 'mild') {
        newScores[it.id] = (it.id.charCodeAt(it.id.length - 1) % 3 === 0) ? 2 : 1;
      } else if (level === 'moderate') {
        newScores[it.id] = (it.id.charCodeAt(it.id.length - 1) % 2 === 0) ? 3 : 2;
      } else if (level === 'severe') {
        newScores[it.id] = (it.id.charCodeAt(it.id.length - 1) % 2 === 0) ? 4 : 3;
      }
    });

    setForm(f => ({ ...f, scores: newScores }));
    toast(`⚡ تم تعبئة استجابات نموذجية لبطارية الزيات (${level === 'normal' ? 'أداء طبيعي' : level === 'mild' ? 'صعوبات خفيفة' : level === 'moderate' ? 'صعوبات متوسطة' : 'صعوبات شديدة'})`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 15) {
      toast('⚠️ يرجى تقييم مقياس واحد على الأقل (15-20 بنداً) لتوليد الخلاصة التشخيصية المعتمدة', 'er');
      return;
    }

    const scalesReport = psychometrics.evaluatedScales.map(s => {
      return `• ${s.name}: الدرجة الخام (${s.rawScore}/${s.maxScore}) - [${s.severity}] (الرتبة المئينية: ${s.percentile}%)`;
    }).join('\n');

    const deficitReport = psychometrics.deficitScales.length > 0
      ? `المقاييس التي أظهرت قصوراً دالاً يستدعي التدخل:\n` + psychometrics.deficitScales.map(s => `- ${s.name}: ${s.severity}`).join('\n')
      : 'جميع المقاييس التي تم تطبيقها تقع ضمن الحدود الطبيعية المقبولة.';

    const summary = `تقرير التقييم ببطارية مقاييس التقدير التشخيصية لصعوبات التعلم (LDDRS) - أ.د. فتحي مصطفى الزيات:\n\n` +
      `- إجمالي البنود المقيمة: (${psychometrics.totalAnswered}) بنداً موزعة عبر (${psychometrics.evaluatedScales.length}) مقاييس فرعية.\n` +
      `- مجموع الدرجات الخام الكلية للمقاييس المطبقة: (${psychometrics.totalRawScore} / ${psychometrics.totalMaxScore}).\n\n` +
      `القرار والتشخيص الإكلينيكي العام:\n` +
      `[${psychometrics.overallStatus}]\n\n` +
      `تحليل درجات المقاييس المطبقة:\n` +
      `${scalesReport}\n\n` +
      `${deficitReport}\n\n` +
      `الخلاصة الإكلينيكية:\n` +
      `${psychometrics.conclusionText}`;

    const recs = psychometrics.deficitScales.length > 0
      ? `1. إلحاق الطالب ببرنامج غرف المصادر لصعوبات التعلم وبدء تنفيذ الخطة التربوية الفردية (IEP).\n` +
        `2. التركيز على التدخل العلاجي المعرفي والنمائي للمجالات المتأثرة (${psychometrics.deficitScales.map(s => s.name).join(' ، ')}).\n` +
        `3. استخدام استراتيجيات تدريس صريحة ومتعددة الحواس وتقسيم المهام الأكاديمية إلى خطوات متدرجة.\n` +
        `4. تعديل وتكييف بيئة الصف (تقليل المشتتات، الجلوس في مقدمة الفصل، تزويده بملخصات بصرية).\n` +
        `5. تقديم تغذية راجعة فورية وإيجابية لتعزيز المفهوم الذاتي الأكاديمي لدى التلميذ.`
      : `1. استمرار التلميذ في الصف الدراسي العادي مع المتابعة المستمرة.\n` +
        `2. تعزيز المهارات ونقاط القوة المعرفية والأكاديمية.\n` +
        `3. تقديم أنشطة إثرائية محفزة لنمو التفكير والذاكرة.`;

    setForm(f => ({
      ...f,
      clinicalSummary: summary,
      recommendations: recs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية والتوصيات التربوية بناءً على محكات د. فتحي الزيات', 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار التلميذ أولاً من القائمة', 'er');
      return;
    }
    if (!form.date) {
      toast('⚠️ يرجى تحديد تاريخ التقييم', 'er');
      return;
    }

    if (psychometrics.totalAnswered < 20) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.totalAnswered} بنداً فقط. هل تود حفظ التقييم كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'lddrs_battery',
      scaleId: 'lddrs_battery',
      scaleType: 'lddrs',
      measureName: 'بطارية مقاييس التقدير التشخيصية لصعوبات التعلم (أ.د. فتحي الزيات)',
      scaleName: 'بطارية مقاييس التقدير التشخيصية لصعوبات التعلم (أ.د. فتحي الزيات)',
      category: 'learning_academic',
      categoryName: 'صعوبات التعلم النمائية والأكاديمية',
      author: LDDRS_COPYRIGHT_INFO.authorAr,
      score: psychometrics.totalRawScore,
      maxScore: psychometrics.totalMaxScore || 160,
      percentage: `${Math.round((psychometrics.totalAnswered / LDDRS_ITEMS.length) * 100)}%`,
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
      toast('✅ تم تحديث بطارية الزيات لصعوبات التعلم (LDDRS) بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', {
        ...payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق بطارية الزيات لصعوبات التعلم (LDDRS) بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  function handleSafeClose() {
    const answeredCount = Object.keys(form.scores || {}).length;
    if (answeredCount > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${answeredCount}) بنداً في بطارية الزيات (LDDRS). هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
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
            background: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #dc2626 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🎯</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  بطارية مقاييس التقدير التشخيصية لصعوبات التعلم (LDDRS)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  8 مقاييس تشخيصية مقننة
                </span>
                <span className="bdg" style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', fontWeight: 800 }}>
                  أ.د. فتحي مصطفى الزيات
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#450a0a', color: '#fecaca', fontSize: '0.68rem', fontWeight: 800 }}>
                  © جامعة الخليج العربي / دار النشر للجامعات
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  البطارية التشخيصية الرائدة لفرز وتقييم صعوبات الانتباه، الإدراك السمعي والبصري والحركي، الذاكرة، القراءة، الكتابة، والحساب
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
                color: showCopyrightDetails ? '#991b1b' : '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء حقوق البطارية' : 'حقوق البطارية والتقنين'}
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
              background: '#fef2f2',
              padding: '14px 20px',
              borderBottom: '2px solid #fca5a5',
              fontSize: '0.82rem',
              color: '#7f1d1d',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لبطارية الزيات (LDDRS):
            </div>

            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#991b1b',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار حقوق الملكية الفكرية والتقنين:</strong> {LDDRS_COPYRIGHT_INFO.batteryNameAr} — إعداد {LDDRS_COPYRIGHT_INFO.authorAr} ({LDDRS_COPYRIGHT_INFO.authorTitle}).
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#fff', padding: '3px 8px', borderRadius: 6, border: '1px solid #fca5a5', fontWeight: 700 }}>
                {LDDRS_COPYRIGHT_INFO.publisherAr}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca' }}>
                <strong>المؤلف والباحث:</strong> {LDDRS_COPYRIGHT_INFO.authorAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca' }}>
                <strong>عينات التقنين والمعايير:</strong> {LDDRS_COPYRIGHT_INFO.normSamples}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca' }}>
                <strong>نظام التصحيح:</strong> سلم خماسي (دائماً 4 | غالباً 3 | أحياناً 2 | نادراً 1 | لا تنطبق 0)
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca' }}>
                <strong>محكات التشخيص:</strong> 0-20 عادي · 21-40 صعوبات خفيفة · 41-60 صعوبات متوسطة · 61-80 صعوبات شديدة
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
            {/* Total Battery Score */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #dc2626',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المجموع الكلي الخام:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.overallColor }}>
                {psychometrics.totalRawScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / {psychometrics.totalMaxScore || 640}
              </span>
            </div>

            {/* Current Active Scale Score */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${currentScalePsych?.severityColor || '#cbd5e1'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>
                {currentScale.name.replace('مقياس صعوبات ', '')}:
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: currentScalePsych?.severityColor || '#334155' }}>
                {currentScalePsych?.rawScore || 0}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / 80 ({currentScalePsych?.severity || 'غير مقيم'})
              </span>
            </div>

            {/* Deficit Scales Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.deficitScales.length > 0 ? '#fca5a5' : '#cbd5e1'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المقاييس المتأثرة بالصعوبة:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.deficitScales.length > 0 ? '#dc2626' : '#059669' }}>
                {psychometrics.deficitScales.length}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / {psychometrics.evaluatedScales.length || 8} مقاييس
              </span>
            </div>

            {/* Overall Clinical Decision Badge */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.overallColor}`,
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>القرار التشخيصي العام:</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: psychometrics.overallColor }}>
                {psychometrics.overallStatus}
              </span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {psychometrics.totalAnswered} / {LDDRS_ITEMS.length} بنداً تم تقييمها
              </div>
              <div style={{ background: 'var(--border-color)', height: 6, width: 120, borderRadius: 3, marginTop: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    background: psychometrics.completionPercentage === 100 ? '#059669' : '#dc2626',
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
                  بيانات التلميذ المفحوص وبيئة التطبيق الإكلينيكي
                </span>
                {form.studentName && (
                  <span className="bdg b-bl" style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                    التلميذ: {form.studentName}
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
                      <label style={{ fontSize: '0.76rem', marginBottom: 2 }}>اسم التلميذ الخارجي <span className="req">*</span></label>
                      <input
                        style={{ height: 32, fontSize: '0.82rem' }}
                        value={form.studentName || ''}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                        placeholder="اكتب اسم التلميذ..."
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
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>التلميذ المسجل بالمركز/المدرسة <span className="req">*</span></label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">— اختر من التلاميذ المسجلين —</option>
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
                      placeholder="مثال: صعوبات تعلم أكاديمية ونمائية..."
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
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>أخصائي صعوبات التعلم / الفاحص</label>
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
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المستجيب (معلم الفصل / ولي الأمر)</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم المستجيب على البطارية"
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  {/* 3. Grade / School */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الصف والمدرسة</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      type="text"
                      placeholder="مثال: الصف الخامس الابتدائي"
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
                      placeholder="مثال: معلم التربية الخاصة، معلم الرياضيات، ولي الأمر..."
                      value={form.raterRelation || ''}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Subscale Navigation Tabs */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📑 مقاييس بطارية الزيات التشخيصية (LDDRS):
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                سلم التقدير: دائماً (4) · غالباً (3) · أحياناً (2) · نادراً (1) · لا تنطبق (0) — (درجات أعلى = صعوبة أشد)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              {LDDRS_SCALES.map(sc => {
                const scPsych = psychometrics.scaleResults.find(s => s.id === sc.id);
                const isDeficit = scPsych?.isDeficit;
                const isCurrent = activeScaleId === sc.id;
                const answeredInScale = LDDRS_ITEMS.filter(it => it.scaleId === sc.id && form.scores[it.id] !== undefined).length;

                return (
                  <button
                    key={sc.id}
                    type="button"
                    className={`tab ${isCurrent ? 'on' : ''}`}
                    onClick={() => setActiveScaleId(sc.id)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      whiteSpace: 'nowrap',
                      borderRight: `3px solid ${sc.color}`,
                    }}
                  >
                    <span>{sc.icon}</span>
                    <span>{sc.name.replace('مقياس صعوبات ', '')}</span>
                    <span>({answeredInScale}/{sc.itemsCount})</span>
                    {isDeficit && <span style={{ color: '#dc2626', fontWeight: 900, marginRight: 4 }}>⚠️</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Current Scale Banner Header */}
          <div
            style={{
              background: currentScale.bgLight || '#fef2f2',
              border: `1.5px solid ${currentScale.color || '#dc2626'}`,
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{currentScale.icon}</span>
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: currentScale.color }}>
                  {currentScale.name} ({currentScale.typeName})
                </h4>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#475569' }}>
                {currentScale.description}
              </p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>الدرجة الحالية للمقياس:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: currentScalePsych?.severityColor || '#334155' }}>
                {currentScalePsych?.rawScore || 0} / 80
              </div>
              <span className="bdg" style={{ background: currentScalePsych?.severityColor ? `${currentScalePsych.severityColor}20` : '#e2e8f0', color: currentScalePsych?.severityColor || '#64748b', fontSize: '0.7rem', fontWeight: 800 }}>
                {currentScalePsych?.severity || 'غير مقيم'}
              </span>
            </div>
          </div>

          {/* 4. Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {currentScaleItems.map((item, idx) => {
              const currentScore = form.scores[item.id];
              const currentNote = form.itemNotes[item.id] || '';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore !== undefined ? `1.5px solid ${currentScale.color || '#dc2626'}` : '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: '260px' }}>
                      <span
                        style={{
                          background: currentScale.color || '#dc2626',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        بند #{idx + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                          {item.text}
                        </div>
                      </div>
                    </div>

                    {/* Rating Scale Buttons (4, 3, 2, 1, 0) */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {LDDRS_RATING_OPTIONS.map(opt => {
                        const scoreVal = opt.score;
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
                                ? (scoreVal >= 3 ? '#dc2626' : scoreVal === 2 ? '#ea580c' : scoreVal === 1 ? '#0284c7' : '#059669')
                                : undefined,
                              color: isSelected ? '#fff' : undefined,
                              border: isSelected ? 'none' : undefined,
                            }}
                            title={opt.desc}
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
                        color: currentScore >= 3 ? '#b91c1c' : currentScore === 2 ? '#c2410c' : '#047857',
                        background: currentScore >= 3 ? '#fee2e2' : currentScore === 2 ? '#ffedd5' : '#ecfdf5',
                        padding: '4px 10px',
                        borderRadius: 6,
                        marginBottom: 6,
                        border: `1px solid ${currentScore >= 3 ? '#fca5a5' : currentScore === 2 ? '#fed7aa' : '#a7f3d0'}`,
                      }}
                    >
                      <strong>التقدير المختار ({currentScore} درجات): </strong>
                      {LDDRS_RATING_OPTIONS.find(o => o.score === currentScore)?.label} — {LDDRS_RATING_OPTIONS.find(o => o.score === currentScore)?.desc}
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

          {/* 5. Diagnostic Interpretation & Recommendations Section */}
          <div style={{ background: 'var(--g0)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> الخلاصة التشخيصية والتوصيات التربوية المعتمدة
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, background: '#991b1b', border: 'none' }}
              >
                ✨ إعادة توليد الخلاصة بناءً على الدرجات
              </button>
            </div>

            <div className="fg c1">
              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>التقرير الإكلينيكي وتفسير درجات مقاييس الزيات (LDDRS)</label>
                <textarea
                  rows={6}
                  placeholder="الخلاصة التشخيصية وتفسير الأداء المعرفي والأكاديمي وفق محكات مقاييس الزيات..."
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>توصيات الخطة التربوية الفردية (IEP) والتدخل العلاجي في غرف المصادر</label>
                <textarea
                  rows={5}
                  placeholder="التوصيات العلاجية، استراتيجيات التدريس متعدّدة الحواس، والتعديلات الصفية..."
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
              تم الإجابة على <strong>{psychometrics.totalAnswered}</strong> من <strong>{LDDRS_ITEMS.length}</strong> بنداً
            </span>
            <span className={`bdg ${psychometrics.completionPercentage === 100 ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.72rem' }}>
              {psychometrics.completionPercentage}% مكتمل
            </span>

            {/* Quick Actions in footer */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 6 }}>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('normal')}
                title="تعبئة نموذج افتراضي يظهر أداء طبيعي"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (طبيعي)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('mild')}
                title="تعبئة نموذج افتراضي يظهر صعوبات خفيفة"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (خفيفة)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('moderate')}
                title="تعبئة نموذج افتراضي يظهر صعوبات متوسطة"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (متوسطة)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => handleAutoFill('severe')}
                title="تعبئة نموذج افتراضي يظهر صعوبات شديدة"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (شديدة)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, fontSize: '0.74rem', background: '#991b1b', border: 'none' }}
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
                background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                padding: '8px 20px',
              }}
            >
              💾 حفظ وحساب نتيجة بطارية الزيات (LDDRS)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
