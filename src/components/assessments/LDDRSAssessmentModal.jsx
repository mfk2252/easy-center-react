import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  LDDRS_COPYRIGHT_INFO,
  LDDRS_SCALES,
  LDDRS_ITEMS,
  LDDRS_RATING_OPTIONS,
  calculateLDDRSPsychometrics,
} from '../../data/lddrsData';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_LDDRS_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  parentName: '',
  parentPhone: '',
  parentPhone2: '',
  fileNo: '',
  specialistName: '',
  schoolName: 'المدرسة الابتدائية',
  semester: 'الفصل الدراسي الأول',
  academicYear: '1445 / 1446 هـ',
  evaluatorRole: 'أخصائي صعوبات التعلم / المرشد الطلابي',
  relationship: 'معلم الفصل / معلم صعوبات التعلم',
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
  const { toast } = useApp?.() || { toast: () => {} };

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_LDDRS_FORM,
        ...initialData,
        scores: initialData.scores || initialData.results || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return { ...EMPTY_LDDRS_FORM };
  });

  const [activeScaleId, setActiveScaleId] = useState(LDDRS_SCALES[0]?.id || 'attention');
  const [expandedNotes, setExpandedNotes] = useState({});

  const psychometrics = useMemo(() => {
    return calculateLDDRSPsychometrics(form.scores || {});
  }, [form.scores]);

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

  function toggleItemNote(itemId) {
    setExpandedNotes(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }

  function handleAutoFill(level = 'normal') {
    const newScores = {};

    LDDRS_ITEMS.forEach(it => {
      if (level === 'normal') {
        // Scores 0 or 1 -> Normal
        newScores[it.id] = (it.id.charCodeAt(it.id.length - 1) % 4 === 0) ? 1 : 0;
      } else if (level === 'mild') {
        // Scores 1 or 2 -> Mild LD
        newScores[it.id] = (it.id.charCodeAt(it.id.length - 1) % 3 === 0) ? 2 : 1;
      } else if (level === 'moderate') {
        // Scores 2 or 3 -> Moderate LD
        newScores[it.id] = (it.id.charCodeAt(it.id.length - 1) % 2 === 0) ? 3 : 2;
      } else if (level === 'severe') {
        // Scores 3 or 4 -> Severe LD
        newScores[it.id] = (it.id.charCodeAt(it.id.length - 1) % 2 === 0) ? 4 : 3;
      }
    });

    setForm(f => ({ ...f, scores: newScores }));
    toast(`⚡ تم تعبئة استجابات نموذجية لمقاييس الزيات (${level === 'normal' ? 'أداء طبيعي' : level === 'mild' ? 'صعوبات خفيفة' : level === 'moderate' ? 'صعوبات متوسطة' : 'صعوبات شديدة'})`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 20) {
      toast('⚠️ يرجى تقييم مقياس واحد على الأقل (20 بنداً) لتوليد الخلاصة التشخيصية المعتمدة', 'er');
      return;
    }

    const scalesReport = psychometrics.evaluatedScales.map(s => {
      return `• ${s.name}: الدرجة الخام (${s.rawScore}/${s.maxScore}) - [${s.severity}] (الرتبة المئينية: ${s.percentile}%)`;
    }).join('\n');

    const deficitReport = psychometrics.deficitScales.length > 0
      ? `المقاييس التي أظهرت قصوراً دالاً يستدعي التدخل:\n` + psychometrics.deficitScales.map(s => `- ${s.name}: ${s.severity}`).join('\n')
      : 'جميع المقاييس التي تم تطبيقها تقع ضمن الحدود الطبيعية المقبولة.';

    const summary = `تقرير التقييم ببطارية مقاييس التقدير التشخيصية لصعوبات التعلم (LDDRS) - أ.د. فتحي الزيات:\n\n` +
      `- إجمالي البنود المقيمة: (${psychometrics.totalAnswered}) بنداً موزعة عبر (${psychometrics.evaluatedScales.length}) مقاييس فرعية.\n` +
      `- مجموع الدرجات الخام الكلية: (${psychometrics.totalRawScore} / ${psychometrics.totalMaxScore}).\n\n` +
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

  const currentScale = LDDRS_SCALES.find(s => s.id === activeScaleId) || LDDRS_SCALES[0];
  const currentScaleItems = LDDRS_ITEMS.filter(it => it.scaleId === activeScaleId);
  const currentScalePsych = psychometrics.scaleResults.find(s => s.id === activeScaleId);

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1100 }}>
      <div
        className="mb mb-xl"
        style={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: 16,
          maxHeight: 'min(95vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        {/* Header */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ea580c 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🎯</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#fff' }}>
                  بطارية مقاييس التقدير التشخيصية لصعوبات التعلم (LDDRS)
                </h3>
                <span className="bdg" style={{ background: '#fee2e2', color: '#991b1b', fontWeight: 800, fontSize: '.74rem' }}>
                  أ.د. فتحي مصطفى الزيات
                </span>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '.72rem' }}>
                  8 مقاييس نمائية وأكاديمية مقننة
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '.78rem', opacity: 0.92, fontWeight: 400 }}>
                جامعة الخليج العربي · مقاييس الانتباه، الإدراك السمعي والبصري والحركي، الذاكرة، القراءة، الكتابة، الرياضيات
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✕ إغلاق
          </button>
        </div>

        {/* Live Psychometrics Status Banner */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1.5px solid #e2e8f0',
            padding: '12px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {/* Total Answered & Raw Score */}
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>المجموع الكلي للبطارية:</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.overallColor }}>
                {psychometrics.totalRawScore}
              </span>
              <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>/ {psychometrics.totalMaxScore || 640}</span>
            </div>
            <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: 2 }}>
              تم تقييم: {psychometrics.totalAnswered} من {LDDRS_ITEMS.length} بنداً
            </div>
          </div>

          {/* Current Active Scale KPI */}
          <div style={{ background: '#fff', border: `1.5px solid ${currentScalePsych?.severityColor || '#cbd5e1'}`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>{currentScale.name}:</span>
              <span style={{ color: currentScalePsych?.severityColor, fontWeight: 800 }}>
                {currentScalePsych?.severity || 'غير مقيم'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: currentScalePsych?.severityColor || '#334155' }}>
                {currentScalePsych?.rawScore || 0}
              </span>
              <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>/ 80 (الرتبة: {currentScalePsych?.percentile || 0}%)</span>
            </div>
          </div>

          {/* Deficit Scales Count */}
          <div style={{ background: '#fff', border: `1px solid ${psychometrics.deficitScales.length > 0 ? '#fca5a5' : '#cbd5e1'}`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>المقاييس المتأثرة بالصعوبة:</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.deficitScales.length > 0 ? '#dc2626' : '#16a34a' }}>
                {psychometrics.deficitScales.length} من {psychometrics.evaluatedScales.length || 8}
              </span>
              <span style={{ fontSize: '.75rem', color: '#64748b' }}>مقاييس</span>
            </div>
            <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: 2 }}>
              {psychometrics.deficitScales.length > 0 ? 'توجد صعوبات دالة تستدعي الدعم' : 'لا توجد صعوبات دالة'}
            </div>
          </div>

          {/* Overall Clinical Decision */}
          <div style={{ background: '#fff', border: `1.5px solid ${psychometrics.overallColor}`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>القرار التشخيصي العام:</div>
            <div style={{ fontSize: '.88rem', fontWeight: 900, color: psychometrics.overallColor, marginTop: 2 }}>
              {psychometrics.overallStatus}
            </div>
          </div>
        </div>

        {/* Quick Action & Testing Bar */}
        <div
          style={{
            background: '#fff1f2',
            borderBottom: '1px solid #ffe4e6',
            padding: '8px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.75rem', fontWeight: 800, color: '#991b1b' }}>تعبئة سريعة للتجربة:</span>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('normal')}
              style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}
            >
              ⚡ أداء عادي (لا توجد صعوبة)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('mild')}
              style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}
            >
              ⚡ صعوبات خفيفة
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('moderate')}
              style={{ background: '#ffedd5', color: '#c2410c', fontWeight: 700 }}
            >
              ⚡ صعوبات متوسطة
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('severe')}
              style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}
            >
              ⚡ صعوبات شديدة
            </button>
          </div>

          <button
            type="button"
            className="btn btn-xs"
            onClick={applyAutoClinicalSummary}
            style={{
              background: 'linear-gradient(135deg, #991b1b, #dc2626)',
              color: '#fff',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>✨</span>
            <span>توليد التقرير والخلاصة تلقائياً</span>
          </button>
        </div>

        {/* Subscales Selection Tabs */}
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            padding: '8px 20px',
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          {LDDRS_SCALES.map(sc => {
            const scPsych = psychometrics.scaleResults.find(s => s.id === sc.id);
            const isDeficit = scPsych?.isDeficit;
            const isComplete = scPsych?.completionRate === 100;
            const isCurrent = activeScaleId === sc.id;

            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveScaleId(sc.id)}
                className={`btn btn-xs ${isCurrent ? 'btn-p' : 'btn-g'}`}
                style={{
                  borderRadius: 8,
                  fontWeight: isCurrent ? 800 : 600,
                  padding: '6px 12px',
                  whiteSpace: 'nowrap',
                  background: isCurrent ? '#dc2626' : undefined,
                  color: isCurrent ? '#fff' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{sc.icon}</span>
                <span>{sc.name.replace('مقياس صعوبات ', '')}</span>
                <span
                  style={{
                    background: isDeficit ? '#fee2e2' : isComplete ? '#dcfce7' : '#f1f5f9',
                    color: isDeficit ? '#b91c1c' : isComplete ? '#15803d' : '#64748b',
                    fontSize: '.68rem',
                    padding: '1px 5px',
                    borderRadius: 4,
                    fontWeight: 700,
                  }}
                >
                  {scPsych?.answeredCount ? `${scPsych.rawScore}/80` : '0/20'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Assessment Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#f8fafc' }}>
          {/* Student Picker Card */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '16px',
              marginBottom: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <StudentPicker
              form={form}
              setForm={setForm}
              students={students}
              emps={emps}
              showExtra={true}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px dashed #e2e8f0' }}>
              <div>
                <label className="lbl" style={{ fontSize: '.78rem' }}>المدرسة / المؤسسة التعليمية:</label>
                <input
                  type="text"
                  className="inp"
                  value={form.schoolName || ''}
                  onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
                  placeholder="المدرسة الابتدائية"
                />
              </div>

              <div>
                <label className="lbl" style={{ fontSize: '.78rem' }}>الفصل الدراسي:</label>
                <select
                  className="inp"
                  value={form.semester || 'الفصل الدراسي الأول'}
                  onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                >
                  <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                  <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                  <option value="الفصل الدراسي الثالث">الفصل الدراسي الثالث</option>
                </select>
              </div>

              <div>
                <label className="lbl" style={{ fontSize: '.78rem' }}>العام الدراسي:</label>
                <input
                  type="text"
                  className="inp"
                  value={form.academicYear || ''}
                  onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}
                  placeholder="1445 / 1446 هـ"
                />
              </div>
            </div>
          </div>

          {/* Current Scale Banner Header */}
          <div
            style={{
              background: currentScale.bgLight || '#fef2f2',
              border: `1.5px solid ${currentScale.color || '#dc2626'}`,
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 14,
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
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: currentScale.color }}>
                  {currentScale.name} ({currentScale.typeName})
                </h4>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: '#475569' }}>
                {currentScale.description}
              </p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '.72rem', color: '#64748b' }}>الدرجة الحالية:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: currentScalePsych?.severityColor || '#334155' }}>
                {currentScalePsych?.rawScore || 0} / 80
              </div>
              <span className="bdg" style={{ background: currentScalePsych?.severityColor ? `${currentScalePsych.severityColor}20` : '#e2e8f0', color: currentScalePsych?.severityColor || '#64748b', fontSize: '.7rem', fontWeight: 800 }}>
                {currentScalePsych?.severity || 'غير مكتمل'}
              </span>
            </div>
          </div>

          {/* Assessment Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentScaleItems.map((it, idx) => {
              const currentScore = form.scores[it.id];
              const isAnswered = currentScore !== undefined && currentScore !== null;
              const hasNote = Boolean(form.itemNotes[it.id]);
              const isNoteOpen = expandedNotes[it.id] || hasNote;

              return (
                <div
                  key={it.id}
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${isAnswered ? (currentScore >= 3 ? '#fca5a5' : '#fed7aa') : '#e2e8f0'}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Item Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: currentScale.color || '#dc2626',
                          color: '#fff',
                          fontWeight: 900,
                          fontSize: '.76rem',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        بند {idx + 1}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {it.text}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleItemNote(it.id)}
                      className="btn btn-xs"
                      style={{
                        background: hasNote ? '#fef3c7' : '#f1f5f9',
                        color: hasNote ? '#b45309' : '#64748b',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 6,
                      }}
                    >
                      💬 {hasNote ? 'تعديل الملاحظة' : '+ ملاحظة سلوكية'}
                    </button>
                  </div>

                  {/* 5 Rating Options */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    {LDDRS_RATING_OPTIONS.map(opt => {
                      const isSelected = currentScore === opt.score;
                      const isDeficit = opt.score >= 3;

                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleScoreChange(it.id, opt.score)}
                          style={{
                            background: isSelected ? (isDeficit ? '#fee2e2' : '#ffedd5') : '#fafafa',
                            border: `2px solid ${isSelected ? (isDeficit ? '#dc2626' : '#ea580c') : '#e2e8f0'}`,
                            borderRadius: 8,
                            padding: '8px 10px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontWeight: 800, fontSize: '.84rem', color: isSelected ? (isDeficit ? '#b91c1c' : '#c2410c') : '#334155' }}>
                            {opt.label}
                          </span>
                          <span style={{ fontSize: '.68rem', color: '#64748b' }}>
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Expandable Note */}
                  {isNoteOpen && (
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                      <input
                        type="text"
                        className="inp"
                        value={form.itemNotes[it.id] || ''}
                        onChange={e => handleNoteChange(it.id, e.target.value)}
                        placeholder={`أدخل ملاحظاتك الإكلينيكية حول استجابة الطالب للبند [${it.id}]...`}
                        style={{ fontSize: '.8rem', padding: '6px 10px' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Clinical Impression & Recommendations */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '16px',
              marginTop: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📝 الخلاصة التشخيصية والتوصيات التربوية
              </h3>
              <button
                type="button"
                className="btn btn-xs"
                onClick={applyAutoClinicalSummary}
                style={{ background: '#fee2e2', color: '#991b1b', fontWeight: 700 }}
              >
                ✨ إعادة توليد النص
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              <div>
                <label className="lbl" style={{ fontSize: '.8rem' }}>التقرير الإكلينيكي وتفسير درجات مقاييس الزيات:</label>
                <textarea
                  className="inp"
                  rows={6}
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="اضغط على زر (توليد التقرير والخلاصة تلقائياً) أو اكتب التقرير التشخيصي هنا..."
                  style={{ fontSize: '.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div>
                <label className="lbl" style={{ fontSize: '.8rem' }}>توصيات الخطة الفردية (IEP) والتدخل العلاجي:</label>
                <textarea
                  className="inp"
                  rows={6}
                  value={form.recommendations || ''}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="أدخل التوصيات الأكاديمية والتربوية والتعديلات الصفية المقترحة..."
                  style={{ fontSize: '.82rem', lineHeight: 1.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: '#fff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '.82rem', color: '#64748b' }}>
            تم تقييم <strong style={{ color: '#dc2626' }}>{psychometrics.totalAnswered}</strong> بنداً · المجموع الخام: <strong style={{ color: psychometrics.overallColor }}>{psychometrics.totalRawScore}</strong> ({psychometrics.overallStatus})
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={onClose}
              style={{ padding: '8px 16px', fontWeight: 700 }}
            >
              إلغاء
            </button>

            <button
              type="button"
              className="btn btn-p"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #991b1b, #dc2626)',
                color: '#fff',
                padding: '8px 24px',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
              }}
            >
              💾 حفظ وحساب نتيجة بطارية الزيات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
