import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  DEV_LD_COPYRIGHT_INFO,
  DEV_LD_DOMAINS,
  DEV_LD_ITEMS,
  DEV_LD_RESPONSE_OPTIONS,
  calculateDevLdPsychometrics,
} from '../../data/devLdData';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_DEV_LD_FORM = {
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
  schoolName: 'روضة براعم الأمل',
  grade: 'تمهيدي / روضة ثانية (KG2)',
  semester: 'الفصل الدراسي الأول',
  academicYear: '1445 / 1446 هـ',
  evaluatorRole: 'معلمة الروضة / أخصائية التشخيص النمائي',
  relationship: 'معلمة الفصل / أخصائية التربية الخاصة',
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
  const { toast } = useApp?.() || { toast: () => {} };

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_DEV_LD_FORM,
        ...initialData,
        scores: initialData.scores || initialData.results || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return { ...EMPTY_DEV_LD_FORM };
  });

  const [activeDomainId, setActiveDomainId] = useState('all');
  const [expandedNotes, setExpandedNotes] = useState({});

  const psychometrics = useMemo(() => {
    return calculateDevLdPsychometrics(form.scores || {});
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

    DEV_LD_ITEMS.forEach(it => {
      if (level === 'normal') {
        // Mostly 0, few 1s
        newScores[it.id] = (it.id % 5 === 0) ? 1 : 0;
      } else if (level === 'mild') {
        // Some 1s, occasional 2
        newScores[it.id] = (it.id % 3 === 0) ? 1 : (it.id % 7 === 0 ? 2 : 0);
      } else if (level === 'at_risk') {
        // Mix of 1s and 2s -> 50% - 69%
        newScores[it.id] = (it.id % 2 === 0) ? 1 : (it.id % 3 === 0 ? 2 : 1);
      } else if (level === 'severe') {
        // High scores (2 and 1) -> >= 70%
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
        `3. استخدام الألعاب التعليمية الحسية واستراتيجيات الحواس المتعددة.\n` +
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

  const filteredItems = activeDomainId === 'all'
    ? DEV_LD_ITEMS
    : DEV_LD_ITEMS.filter(it => it.domainId === activeDomainId);

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
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🧸</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#fff' }}>
                  قائمة صعوبات التعلم النمائية لأطفال الروضة (التشخيص المبكر)
                </h3>
                <span className="bdg" style={{ background: '#ccfbf1', color: '#0f766e', fontWeight: 800, fontSize: '.74rem' }}>
                  80 عبارة نمائية
                </span>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '.72rem' }}>
                  أ.د. عادل عبدالله محمد
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '.78rem', opacity: 0.92, fontWeight: 400 }}>
                جامعة الزقازيق · الكشف المبكر عن صعوبات الانتباه، الإدراك، الذاكرة، التفكير، اللغة، والتناسق البصري الحركي
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
          {/* Total Raw Score & Percentage */}
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>المجموع الكلي الخام:</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.totalRawScore}
              </span>
              <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>/ 160 ({psychometrics.overallPercentage}%)</span>
            </div>
            <div style={{ background: '#e2e8f0', height: 5, borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width: `${psychometrics.overallPercentage}%`, height: '100%', background: psychometrics.severityColor }} />
            </div>
          </div>

          {/* Cognitive Pillar */}
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>المجال المعرفي (انتباه/إدراك/ذاكرة):</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.cognitivePct >= 50 ? '#dc2626' : '#0f766e' }}>
                {psychometrics.cognitiveRaw}
              </span>
              <span style={{ fontSize: '.75rem', color: '#64748b' }}>/ {psychometrics.cognitiveMax} ({psychometrics.cognitivePct}%)</span>
            </div>
          </div>

          {/* Language & Thinking Pillar */}
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>مجال اللغة والتفكير:</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.langThinkingPct >= 50 ? '#dc2626' : '#0f766e' }}>
                {psychometrics.langThinkingRaw}
              </span>
              <span style={{ fontSize: '.75rem', color: '#64748b' }}>/ {psychometrics.langThinkingMax} ({psychometrics.langThinkingPct}%)</span>
            </div>
          </div>

          {/* Clinical Diagnostic Decision */}
          <div style={{ background: '#fff', border: `1.5px solid ${psychometrics.severityColor}`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 700 }}>التصنيف والقرار التشخيصي:</div>
            <div style={{ fontSize: '.9rem', fontWeight: 900, color: psychometrics.severityColor, marginTop: 2 }}>
              {psychometrics.probability}
            </div>
            <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: 2 }}>
              تم تقييم: {psychometrics.totalAnswered} من {DEV_LD_ITEMS.length} عبارة
            </div>
          </div>
        </div>

        {/* Quick Action & Testing Bar */}
        <div
          style={{
            background: '#f0fdfa',
            borderBottom: '1px solid #ccfbf1',
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
            <span style={{ fontSize: '.75rem', fontWeight: 800, color: '#0f766e' }}>تعبئة سريعة للتجربة:</span>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('normal')}
              style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}
            >
              ⚡ أداء نمائي طبيعي
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('mild')}
              style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}
            >
              ⚡ مؤشرات حدية
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('at_risk')}
              style={{ background: '#ffedd5', color: '#c2410c', fontWeight: 700 }}
            >
              ⚡ معرض للخطر (At-Risk)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('severe')}
              style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}
            >
              ⚡ صعوبات نمائية مؤكدة
            </button>
          </div>

          <button
            type="button"
            className="btn btn-xs"
            onClick={applyAutoClinicalSummary}
            style={{
              background: 'linear-gradient(135deg, #0f766e, #0d9488)',
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

        {/* Domain Filter Tabs */}
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
            onClick={() => setActiveDomainId('all')}
            className={`btn btn-xs ${activeDomainId === 'all' ? 'btn-p' : 'btn-g'}`}
            style={{
              borderRadius: 8,
              fontWeight: activeDomainId === 'all' ? 800 : 600,
              padding: '6px 12px',
              whiteSpace: 'nowrap',
              background: activeDomainId === 'all' ? '#0d9488' : undefined,
              color: activeDomainId === 'all' ? '#fff' : undefined,
            }}
          >
            الكل (جميع العبارات الـ 80)
          </button>

          {DEV_LD_DOMAINS.map(dim => {
            const dimPsych = psychometrics.domainResults.find(d => d.id === dim.id);
            const isDeficit = dimPsych?.isDeficit;
            const countAnswered = DEV_LD_ITEMS.filter(it => it.domainId === dim.id && form.scores[it.id] !== undefined).length;
            const isComplete = countAnswered === dim.itemsCount;
            const isCurrent = activeDomainId === dim.id;

            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => setActiveDomainId(dim.id)}
                className={`btn btn-xs ${isCurrent ? 'btn-p' : 'btn-g'}`}
                style={{
                  borderRadius: 8,
                  fontWeight: isCurrent ? 800 : 600,
                  padding: '6px 12px',
                  whiteSpace: 'nowrap',
                  background: isCurrent ? '#0d9488' : undefined,
                  color: isCurrent ? '#fff' : undefined,
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
                  {dimPsych ? `${dimPsych.rawScore}/${dim.maxScore}` : `${countAnswered}/${dim.itemsCount}`}
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
                <label className="lbl" style={{ fontSize: '.78rem' }}>اسم الروضة / المركز:</label>
                <input
                  type="text"
                  className="inp"
                  value={form.schoolName || ''}
                  onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
                  placeholder="روضة براعم الأمل"
                />
              </div>

              <div>
                <label className="lbl" style={{ fontSize: '.78rem' }}>مستوى الروضة / الصف:</label>
                <select
                  className="inp"
                  value={form.grade || 'تمهيدي / روضة ثانية (KG2)'}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                >
                  <option value="روضة أولى (KG1)">روضة أولى (KG1)</option>
                  <option value="تمهيدي / روضة ثانية (KG2)">تمهيدي / روضة ثانية (KG2)</option>
                  <option value="تمهيدي متقدم (KG3)">تمهيدي متقدم (KG3)</option>
                  <option value="الصف الأول الابتدائي">الصف الأول الابتدائي (تهيئة)</option>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredItems.map(it => {
              const currentScore = form.scores[it.id];
              const isAnswered = currentScore !== undefined && currentScore !== null;
              const hasNote = Boolean(form.itemNotes[it.id]);
              const isNoteOpen = expandedNotes[it.id] || hasNote;
              const dim = DEV_LD_DOMAINS.find(d => d.id === it.domainId);

              return (
                <div
                  key={it.id}
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${isAnswered ? (currentScore === 2 ? '#fca5a5' : currentScore === 1 ? '#fed7aa' : '#99f6e4') : '#e2e8f0'}`,
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
                          background: '#0d9488',
                          color: '#fff',
                          fontWeight: 900,
                          fontSize: '.76rem',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        عبارة {it.id}
                      </span>
                      <span className="bdg" style={{ background: '#ccfbf1', color: '#0f766e', fontSize: '.72rem', fontWeight: 700 }}>
                        {dim?.name}
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

                  {/* 3 Rating Options */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    {DEV_LD_RESPONSE_OPTIONS.map(opt => {
                      const isSelected = currentScore === opt.score;
                      const isDeficit = opt.score === 2;

                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleScoreChange(it.id, opt.score)}
                          style={{
                            background: isSelected ? (isDeficit ? '#fee2e2' : opt.score === 1 ? '#ffedd5' : '#ccfbf1') : '#fafafa',
                            border: `2px solid ${isSelected ? (isDeficit ? '#dc2626' : opt.score === 1 ? '#ea580c' : '#0d9488') : '#e2e8f0'}`,
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
                          <span style={{ fontWeight: 800, fontSize: '.84rem', color: isSelected ? (isDeficit ? '#b91c1c' : opt.score === 1 ? '#c2410c' : '#0f766e') : '#334155' }}>
                            {opt.label}
                          </span>
                          <span style={{ fontSize: '.68rem', color: '#64748b' }}>
                            {opt.description}
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
                        placeholder={`أدخل ملاحظاتك حول سلوك الطفل في العبارة [${it.id}]...`}
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
                style={{ background: '#ccfbf1', color: '#0f766e', fontWeight: 700 }}
              >
                ✨ إعادة توليد النص
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              <div>
                <label className="lbl" style={{ fontSize: '.8rem' }}>التقرير الإكلينيكي وتفسير المؤشرات النمائية:</label>
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
                <label className="lbl" style={{ fontSize: '.8rem' }}>توصيات برنامج التدخل المبكر والخطة الفردية:</label>
                <textarea
                  className="inp"
                  rows={6}
                  value={form.recommendations || ''}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="أدخل التوصيات النمائية والأنشطة الإثرائية للروضة والمنزل..."
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
            تم تقييم <strong style={{ color: '#0d9488' }}>{psychometrics.totalAnswered}</strong> من {DEV_LD_ITEMS.length} عبارة · المجموع الخام: <strong style={{ color: psychometrics.severityColor }}>{psychometrics.totalRawScore}/160</strong> ({psychometrics.overallPercentage}%)
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
                background: 'linear-gradient(135deg, #0f766e, #0d9488)',
                color: '#fff',
                padding: '8px 24px',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
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
