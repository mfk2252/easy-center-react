import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  SARTAWI_COPYRIGHT_INFO,
  SARTAWI_DIMENSIONS,
  SARTAWI_ITEMS,
  SARTAWI_RATING_OPTIONS,
  calculateSartawiPsychometrics,
} from '../../data/sartawiData';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_SARTAWI_FORM = {
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
  schoolName: 'المدرسة الابتدائية النموذجية',
  semester: 'الفصل الدراسي الأول',
  academicYear: '1445 / 1446 هـ',
  evaluatorRole: 'معلم صعوبات التعلم / المرشد الطلابي',
  relationship: 'معلم الفصل / معلم صعوبات التعلم',
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
  const { toast } = useApp?.() || { toast: () => {} };

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_SARTAWI_FORM,
        ...initialData,
        scores: initialData.scores || initialData.results || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return { ...EMPTY_SARTAWI_FORM };
  });

  const [activeTab, setActiveTab] = useState('all');
  const [expandedNotes, setExpandedNotes] = useState({});

  const psychometrics = useMemo(() => {
    return calculateSartawiPsychometrics(form.scores || {});
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

  function handleAutoFill(fillLevel = 'normal') {
    const newScores = {};

    SARTAWI_ITEMS.forEach(item => {
      if (fillLevel === 'normal') {
        // Low scores (1 or 2) -> No LD
        newScores[item.id] = (item.id % 4 === 0) ? 2 : 1;
      } else if (fillLevel === 'borderline') {
        // Moderate scores (2, 3, 4)
        newScores[item.id] = (item.id % 3 === 0) ? 4 : (item.id % 2 === 0 ? 3 : 2);
      } else if (fillLevel === 'ld') {
        // High scores (4 or 5) -> LD confirmed
        newScores[item.id] = (item.id % 3 === 0) ? 4 : 5;
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
      `استناداً إلى معايير مقياس السرطاوي المقنن للبيئة العربية، ${psychometrics.recommendation}`;

    const recs = psychometrics.overallKey === 'ld' || psychometrics.overallKey === 'borderline'
      ? `1. تسجيل الطالب في برنامج صعوبات التعلم وغرف المصادر لتلقي التدريس الفردي المباشر.\n` +
        `2. تصميم خطة تربوية فردية (IEP) تركز على مجالات الاحتياج (${psychometrics.deficitDimensions.map(d => d.name).join('، ')}).\n` +
        `3. استخدام أسلوب التعلم النشط وتدريب الحواس المتعددة على مهارات القراءة والكتابة والعمليات الحسابية.\n` +
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
      toast('⚠️ يرجى اختيار التلميذ أولاً من القائمة', 'er');
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

  const filteredItems = activeTab === 'all'
    ? SARTAWI_ITEMS
    : SARTAWI_ITEMS.filter(it => it.dimensionId === activeTab);

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1100 }}>
      <div className="mb mb-xl"
        
      >
        {/* Header */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.6rem' }}>📑</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                  مقياس صعوبات التعلم المقنن (أ.د. زيدان أحمد السرطاوي)
                </h3>
                <span className="bdg" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 800, fontSize: '.72rem' }}>
                  50 عبارة تقييمية
                </span>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '.7rem' }}>
                  الأبعاد الأكاديمية والسلوكية والإدراكية
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '.76rem', opacity: 0.92, fontWeight: 400, lineHeight: 1.35 }}>
                ملحق رقم (3) · جامعة الملك سعود · تشخيص صعوبات القراءة والكتابة والرياضيات والسلوك والإدراك الحركي
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
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>الدرجة الخام الكلية:</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.overallColor }}>
                {psychometrics.totalRawScore}
              </span>
              <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>/ 250 (الحد الأدنى 50)</span>
            </div>
            <div style={{ background: '#e2e8f0', height: 5, borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width: `${psychometrics.completionPercentage}%`, height: '100%', background: psychometrics.overallColor }} />
            </div>
          </div>

          {/* T-Score */}
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>الدرجة التائية المعيارية:</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e40af' }}>
                T = {psychometrics.totalTScore}
              </span>
              <span style={{ fontSize: '.75rem', color: '#64748b' }}>({psychometrics.percentile}%)</span>
            </div>
            <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: 2 }}>
              الفاصل: T &ge; 60 يشير لصعوبة تعلم
            </div>
          </div>

          {/* Deficit Dimensions */}
          <div style={{ background: '#fff', border: `1px solid ${psychometrics.deficitDimensions.length > 0 ? '#fca5a5' : '#cbd5e1'}`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>الأبعاد المتأثرة (العجز):</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.deficitDimensions.length > 0 ? '#dc2626' : '#16a34a' }}>
                {psychometrics.deficitDimensions.length} من 3
              </span>
              <span style={{ fontSize: '.75rem', color: '#64748b' }}>أبعاد</span>
            </div>
            <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: 2 }}>
              {psychometrics.deficitDimensions.length > 0 ? 'يوجد تأثر دال في أبعاد التقييم' : 'جميع الأبعاد في النطاق الطبيعي'}
            </div>
          </div>

          {/* Clinical Classification */}
          <div style={{ background: '#fff', border: `1.5px solid ${psychometrics.overallColor}`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>التصنيف التشخيصي المعتمد:</div>
            <div style={{ fontSize: '.92rem', fontWeight: 900, color: psychometrics.overallColor, marginTop: 2 }}>
              {psychometrics.overallStatus}
            </div>
            <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: 2 }}>
              تم تقييم: {psychometrics.totalAnswered} من {SARTAWI_ITEMS.length} عبارة
            </div>
          </div>
        </div>

        {/* Quick Action & Testing Bar */}
        <div
          style={{
            background: '#eff6ff',
            borderBottom: '1px solid #dbeafe',
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
            <span style={{ fontSize: '.75rem', fontWeight: 800, color: '#1e40af' }}>تعبئة سريعة للتجربة:</span>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('normal')}
              style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}
            >
              ⚡ أداء طبيعي (درجات منخفضة)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('borderline')}
              style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}
            >
              ⚡ فئة حدية (درجات متوسطة)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('ld')}
              style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}
            >
              ⚡ صعوبات تعلم مؤكدة (درجات مرتفعة)
            </button>
          </div>

          <button
            type="button"
            className="btn btn-xs"
            onClick={applyAutoClinicalSummary}
            style={{
              background: 'linear-gradient(135deg, #1e40af, #2563eb)',
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
              background: activeTab === 'all' ? '#1e40af' : undefined,
              color: activeTab === 'all' ? '#fff' : undefined,
            }}
          >
            الكل (جميع العبارات الـ 50)
          </button>

          {SARTAWI_DIMENSIONS.map(dim => {
            const dimScore = psychometrics.dimensions.find(d => d.id === dim.id);
            const isDeficit = dimScore?.isDeficit;
            const countAnswered = SARTAWI_ITEMS.filter(it => it.dimensionId === dim.id && form.scores[it.id] !== undefined).length;
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
                  background: activeTab === dim.id ? '#1e40af' : undefined,
                  color: activeTab === dim.id ? '#fff' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{dim.icon}</span>
                <span>{dim.name}</span>
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
                  {dimScore ? `خام: ${dimScore.rawScore} (T=${dimScore.tScore})` : `${countAnswered}/${dim.itemsCount}`}
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
                  placeholder="المدرسة الابتدائية النموذجية"
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

          {/* Assessment Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredItems.map(it => {
              const currentScore = form.scores[it.id];
              const isAnswered = currentScore !== undefined && currentScore !== null;
              const hasNote = Boolean(form.itemNotes[it.id]);
              const isNoteOpen = expandedNotes[it.id] || hasNote;
              const dim = SARTAWI_DIMENSIONS.find(d => d.id === it.dimensionId);

              return (
                <div
                  key={it.id}
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${isAnswered ? (currentScore >= 4 ? '#fca5a5' : '#93c5fd') : '#e2e8f0'}`,
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
                          background: '#1e40af',
                          color: '#fff',
                          fontWeight: 900,
                          fontSize: '.76rem',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        عبارة {it.id}
                      </span>
                      <span className="bdg" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '.72rem', fontWeight: 700 }}>
                        {dim?.name}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
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
                    {SARTAWI_RATING_OPTIONS.map(opt => {
                      const isSelected = currentScore === opt.score;
                      const isHighRisk = opt.score >= 4;

                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleScoreChange(it.id, opt.score)}
                          style={{
                            background: isSelected ? (isHighRisk ? '#fee2e2' : '#dbeafe') : '#fafafa',
                            border: `2px solid ${isSelected ? (isHighRisk ? '#dc2626' : '#1e40af') : '#e2e8f0'}`,
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
                          <span style={{ fontWeight: 800, fontSize: '.84rem', color: isSelected ? (isHighRisk ? '#b91c1c' : '#1e40af') : '#334155' }}>
                            ({opt.score}) {opt.label}
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
                        placeholder={`أدخل ملاحظاتك الإكلينيكية حول استجابة الطالب للعبارة [${it.id}]...`}
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
                style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 700 }}
              >
                ✨ إعادة توليد النص
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              <div>
                <label className="lbl" style={{ fontSize: '.8rem' }}>التقرير الإكلينيكي وتفسير الدرجات التائية:</label>
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
            تم تقييم <strong style={{ color: '#1e40af' }}>{psychometrics.totalAnswered}</strong> من أصل {SARTAWI_ITEMS.length} عبارة · المجموع الخام: <strong style={{ color: psychometrics.overallColor }}>{psychometrics.totalRawScore}/250</strong> (T = {psychometrics.totalTScore})
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
                background: 'linear-gradient(135deg, #1e3a8a, #1e40af)',
                color: '#fff',
                padding: '8px 24px',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)',
              }}
            >
              💾 حفظ وحساب نتيجة مقياس السرطاوي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
