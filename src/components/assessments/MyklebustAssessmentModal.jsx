import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  MYKLEBUST_COPYRIGHT_INFO,
  MYKLEBUST_DIMENSIONS,
  MYKLEBUST_ITEMS,
  MYKLEBUST_RATING_OPTIONS,
  calculateMyklebustPsychometrics,
} from '../../data/myklebustData';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_MYKLEBUST_FORM = {
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
  const { toast } = useApp?.() || { toast: () => {} };

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_MYKLEBUST_FORM,
        ...initialData,
        scores: initialData.scores || initialData.results || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return { ...EMPTY_MYKLEBUST_FORM };
  });

  const [activeTab, setActiveTab] = useState('all');
  const [expandedNotes, setExpandedNotes] = useState({});

  const psychometrics = useMemo(() => {
    return calculateMyklebustPsychometrics(form.scores || {});
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

  function handleAutoFill(type = 'normal') {
    const newScores = {};
    MYKLEBUST_ITEMS.forEach(it => {
      const n = it.num || 1;
      if (type === 'normal') {
        // Average to above average (3, 4, 5)
        newScores[it.id] = (n % 3 === 0) ? 5 : ((n % 2 === 0) ? 4 : 3);
      } else if (type === 'borderline') {
        // Borderline / at risk (3 or 2)
        newScores[it.id] = (n % 2 === 0) ? 3 : 2;
      } else if (type === 'verbal_ld') {
        // Verbal deficit (dimensions 1 & 2 low, others normal)
        if (it.dimensionId === 'auditory_comprehension' || it.dimensionId === 'spoken_language') {
          newScores[it.id] = (n % 2 === 0) ? 1 : 2;
        } else {
          newScores[it.id] = (n % 2 === 0) ? 4 : 3;
        }
      } else if (type === 'nonverbal_ld') {
        // Non-verbal deficit (dimensions 3, 4, 5 low, verbal normal)
        if (it.dimensionId === 'orientation' || it.dimensionId === 'motor_coordination' || it.dimensionId === 'personal_social') {
          newScores[it.id] = (n % 2 === 0) ? 1 : 2;
        } else {
          newScores[it.id] = 4;
        }
      } else if (type === 'severe_ld') {
        // Comprehensive LD (scores 1 and 2)
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

  const filteredItems = activeTab === 'all'
    ? MYKLEBUST_ITEMS
    : MYKLEBUST_ITEMS.filter(it => it.dimensionId === activeTab);

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1100 }}>
      <div className="mb mb-xl"
        
      >
        {/* Modal Main Header */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #0284c7 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.6rem' }}>📊</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                  مقياس مايكل بيست للتعرف على صعوبات التعلم (Myklebust PRS)
                </h3>
                <span className="bdg" style={{ background: '#ecfeff', color: '#0891b2', fontWeight: 800, fontSize: '.72rem' }}>
                  24 بنداً تقييمياً مقنناً
                </span>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '.7rem' }}>
                  المجال اللفظي وغير اللفظي
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '.76rem', opacity: 0.92, fontWeight: 400, lineHeight: 1.35 }}>
                إعداد: هلمر مايكل بيست · تقنين د. مصطفى كامل ود. تيسير كوافحة · تقدير السمات السلوكية
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
              alignSelf: 'flex-start',
            }}
          >
            ✕ إغلاق
          </button>
        </div>

        {/* Live Psychometrics Status Banner */}
        <div
          className="assessment-stats-grid"
          style={{
            background: '#f8fafc',
            borderBottom: '1.5px solid #e2e8f0',
            padding: '10px 16px',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {/* Total Raw Score */}
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>المجموع الكلي للمقياس:</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.overallColor }}>
                {psychometrics.totalRawScore}
              </span>
              <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>/ 120 (المتوسط 72)</span>
            </div>
            <div style={{ background: '#e2e8f0', height: 5, borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width: `${psychometrics.overallPercentage}%`, height: '100%', background: psychometrics.overallColor }} />
            </div>
          </div>

          {/* Verbal Scale Score */}
          <div style={{ background: '#fff', border: `1px solid ${psychometrics.isVerbalDeficit ? '#fca5a5' : '#cbd5e1'}`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>المجال اللفظي (9 بنود):</span>
              <span style={{ color: psychometrics.isVerbalDeficit ? '#dc2626' : '#16a34a', fontWeight: 800 }}>
                {psychometrics.isVerbalDeficit ? '⚠️ قصور دال' : '✓ طبيعي'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.isVerbalDeficit ? '#dc2626' : '#2563eb' }}>
                {psychometrics.verbalScore}
              </span>
              <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>/ 45 (الفاصل: 27)</span>
            </div>
          </div>

          {/* Non-Verbal Scale Score */}
          <div style={{ background: '#fff', border: `1px solid ${psychometrics.isNonVerbalDeficit ? '#fca5a5' : '#cbd5e1'}`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span>المجال غير اللفظي (15 بنداً):</span>
              <span style={{ color: psychometrics.isNonVerbalDeficit ? '#dc2626' : '#16a34a', fontWeight: 800 }}>
                {psychometrics.isNonVerbalDeficit ? '⚠️ قصور دال' : '✓ طبيعي'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.isNonVerbalDeficit ? '#dc2626' : '#0891b2' }}>
                {psychometrics.nonVerbalScore}
              </span>
              <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>/ 75 (الفاصل: 45)</span>
            </div>
          </div>

          {/* Clinical Diagnostic Decision */}
          <div style={{ background: '#fff', border: `1.5px solid ${psychometrics.overallColor}`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>التصنيف التشخيصي المعتمد:</div>
            <div style={{ fontSize: '.92rem', fontWeight: 900, color: psychometrics.overallColor, marginTop: 2 }}>
              {psychometrics.diagnosisType}
            </div>
            <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: 2 }}>
              تم تقييم: {psychometrics.totalAnswered} من {MYKLEBUST_ITEMS.length} بنداً
            </div>
          </div>
        </div>

        {/* Quick Action & Testing Bar */}
        <div
          style={{
            background: '#ecfeff',
            borderBottom: '1px solid #cffafe',
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
            <span style={{ fontSize: '.75rem', fontWeight: 800, color: '#0e7490' }}>تعبئة سريعة للتجربة:</span>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('normal')}
              style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}
            >
              ⚡ أداء طبيعي
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('borderline')}
              style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}
            >
              ⚡ فئة حدية
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('verbal_ld')}
              style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 700 }}
            >
              ⚡ صعوبات لفظية
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('nonverbal_ld')}
              style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}
            >
              ⚡ صعوبات غير لفظية
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('severe_ld')}
              style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}
            >
              ⚡ صعوبات شاملة
            </button>
          </div>

          <button
            type="button"
            className="btn btn-xs"
            onClick={applyAutoClinicalSummary}
            style={{
              background: 'linear-gradient(135deg, #0e7490, #0891b2)',
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

        {/* Dimension Filter Tabs */}
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
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`btn btn-xs ${activeTab === 'all' ? 'btn-p' : 'btn-g'}`}
            style={{
              borderRadius: 8,
              fontWeight: activeTab === 'all' ? 800 : 600,
              padding: '6px 12px',
              whiteSpace: 'nowrap',
              background: activeTab === 'all' ? '#0891b2' : undefined,
              color: activeTab === 'all' ? '#fff' : undefined,
            }}
          >
            الكل (جميع البنود الـ 24)
          </button>

          {MYKLEBUST_DIMENSIONS.map(dim => {
            const dimScore = psychometrics.dimensionScores.find(d => d.id === dim.id);
            const isDeficit = dimScore?.isDeficit;
            const countAnswered = MYKLEBUST_ITEMS.filter(it => it.dimensionId === dim.id && form.scores[it.id] !== undefined).length;
            const isComplete = countAnswered === dim.itemsCount;

            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => setActiveTab(dim.id)}
                className={`btn btn-xs ${activeTab === dim.id ? 'btn-p' : 'btn-g'}`}
                style={{
                  borderRadius: 8,
                  fontWeight: activeTab === dim.id ? 800 : 600,
                  padding: '6px 12px',
                  whiteSpace: 'nowrap',
                  background: activeTab === dim.id ? '#0891b2' : undefined,
                  color: activeTab === dim.id ? '#fff' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{dim.icon}</span>
                <span>{dim.name.split(':')[1] || dim.name}</span>
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
                  {dimScore ? `${dimScore.score}/${dim.maxScore}` : `${countAnswered}/${dim.itemsCount}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Assessment Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#f8fafc' }}>
          {/* Student Picker & Diagnostic Meta Card */}
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

          {/* Assessment Items Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredItems.map(it => {
              const currentScore = form.scores[it.id];
              const isAnswered = currentScore !== undefined && currentScore !== null;
              const hasNote = Boolean(form.itemNotes[it.id]);
              const isNoteOpen = expandedNotes[it.id] || hasNote;
              const dim = MYKLEBUST_DIMENSIONS.find(d => d.id === it.dimensionId);

              return (
                <div
                  key={it.id}
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${isAnswered ? (currentScore <= 2 ? '#fca5a5' : '#7dd3fc') : '#e2e8f0'}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Item Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: '#0891b2',
                          color: '#fff',
                          fontWeight: 900,
                          fontSize: '.76rem',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        بند {it.num || it.id.replace('myk_', '')}
                      </span>
                      <span className="bdg" style={{ background: '#ecfeff', color: '#0e7490', fontSize: '.72rem', fontWeight: 700 }}>
                        {dim?.name?.split(':')[1] || dim?.name}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {it.title}
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

                  {/* 5 Rating Options with Detailed Behavioral Anchors */}
                  <div
                    className="assessment-options-grid"
                    style={{
                      marginTop: 10,
                    }}
                  >
                    {(it.options || MYKLEBUST_RATING_OPTIONS).map(opt => {
                      const isSelected = currentScore === opt.score;
                      const optMeta = MYKLEBUST_RATING_OPTIONS.find(r => r.score === opt.score) || {};

                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleScoreChange(it.id, opt.score)}
                          style={{
                            background: isSelected ? (opt.score <= 2 ? '#fee2e2' : '#e0f2fe') : '#fafafa',
                            border: `2px solid ${isSelected ? (opt.score <= 2 ? '#dc2626' : '#0284c7') : '#e2e8f0'}`,
                            borderRadius: 8,
                            padding: '10px 12px',
                            textAlign: 'right',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 6,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: '.84rem', color: isSelected ? (opt.score <= 2 ? '#b91c1c' : '#0369a1') : '#334155' }}>
                              ({opt.score}) {opt.label}
                            </span>
                            {isSelected && (
                              <span style={{ fontSize: '1rem', color: opt.score <= 2 ? '#dc2626' : '#0284c7' }}>
                                ✓
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '.75rem', color: '#64748b', lineHeight: 1.4 }}>
                            {opt.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Expandable Note Input */}
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

          {/* Diagnostic Impression & Recommendations Section */}
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
                style={{ background: '#ecfeff', color: '#0891b2', fontWeight: 700 }}
              >
                ✨ إعادة توليد النص
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              <div>
                <label className="lbl" style={{ fontSize: '.8rem' }}>التقرير الإكلينيكي وتفسير الدرجات:</label>
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

        {/* Modal Footer Action Buttons */}
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
            تم تقييم <strong style={{ color: '#0891b2' }}>{psychometrics.totalAnswered}</strong> من أصل {MYKLEBUST_ITEMS.length} بنداً · المجموع: <strong style={{ color: psychometrics.overallColor }}>{psychometrics.totalRawScore}/120</strong>
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
                background: 'linear-gradient(135deg, #0e7490, #0891b2)',
                color: '#fff',
                padding: '8px 24px',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)',
              }}
            >
              💾 حفظ وحساب نتيجة مقياس مايكل بيست
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
