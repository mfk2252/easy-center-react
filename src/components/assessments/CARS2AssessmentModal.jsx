import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  CARS2_ITEMS,
  CARS2_DOMAINS,
  calculateCARS2Psychometrics,
} from '../../data/cars2Data';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_CARS2_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  specialistName: '',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function CARS2AssessmentModal({
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
        ...EMPTY_CARS2_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_CARS2_FORM,
      specialistName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');

  // Real-time Psychometrics Engine
  const psychometrics = useMemo(() => {
    return calculateCARS2Psychometrics(form.scores);
  }, [form.scores]);

  if (!isOpen) return null;

  function handleScoreSelect(itemId, scoreValue) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: scoreValue,
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

  function autoFillSample(level = 'mild') {
    const scores = {};
    CARS2_ITEMS.forEach(it => {
      if (level === 'mild') {
        scores[it.id] = (it.id % 3 === 0) ? 2.5 : (it.id % 2 === 0) ? 2.0 : 1.5;
      } else if (level === 'severe') {
        scores[it.id] = (it.id % 3 === 0) ? 3.0 : 3.5;
      } else {
        scores[it.id] = 1.0;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم ملء إجابات افتراضية (${level}) لمقياس CARS-2 بنجاح`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.answeredCount < 5) {
      toast('⚠️ يرجى تقييم عدد كافٍ من البنود لتوليد الخلاصة التشخيصية', 'er');
      return;
    }

    const domainSummaries = psychometrics.domainScores.map(d => {
      let level = 'طبيعي';
      if (d.avg >= 3.0) level = 'شديد التأثر';
      else if (d.avg >= 2.0) level = 'متوسط التأثر';
      else if (d.avg >= 1.5) level = 'تأثر بسيط';
      return `• ${d.name}: (الدرجة ${d.score}/${d.maxScore} - المستوى: ${level})`;
    }).join('\n');

    const suggestedSummary = `بناءً على تطبيق مقياس كارز-2 (CARS-2) في بيئة الفحص الملاحظية:\nحصل الطالب/ـة (${form.studentName || 'الطالب'}) على درجة خام كلية (${psychometrics.rawScore} من 60)، وتناظر درجة تائية معيارية (T = ${psychometrics.tScore}) برتبة مئينية (${psychometrics.percentile}%)، مما يشير إكلينيكياً إلى: [${psychometrics.severityLabel}].\n\nتوزيع المجالات النمائية:\n${domainSummaries}\n\n${psychometrics.clinicalImpression}`;

    const suggestedRecs = psychometrics.severityKey === 'none'
      ? '1. متابعة النمو والتطور اللغوي والمعرفي العام.\n2. تحفيز المهارات التفاعلية والاجتماعية في البيئة الصفية والمنزلية.\n3. لا توجد حاجة في الوقت الراهن لبرنامج مكثف للتوحد، مع إعادة التقييم بعد 6 أشهر إذا دعت الحاجة.'
      : psychometrics.severityKey === 'mild_moderate'
      ? '1. إعداد خطة تربوية فردية (IEP) تركز على التواصل الوظيفي والتفاعل الاجتماعي.\n2. جلسات تخاطب ونطق مكثفة لتطوير المهارات اللفظية وغير اللفظية وتقليل المصاداة.\n3. جلسات علاج وظيفي وتكامل حسي للتعامل مع الحساسيات الحسية المصاحبة.\n4. تدريب الأسرة على الاستراتيجيات السلوكية والتواصلية الداعمة في المنزل.'
      : '1. إدراج الطفل في برنامج تدخل سلوكي شامل ومكثف (Applied Behavior Analysis - ABA).\n2. تدريب تواصل بديل ومعزز (AAC / PECS) لتأسيس قناة تواصل وظيفية.\n3. خطة تدخل سلوكي (BIP) للحد من الحركات النمطية وإيذاء الذات والسلوكيات المقاومة للتغيير.\n4. جلسات تكامل حسي مكثفة لعلاج فرط/نقص الاستجابة للمثيرات السمعية واللمسية والبصرية.\n5. متابعة طبية ونفسية دورية متكاملة.';

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد الخلاصة والتوصيات الإكلينيكية لمقياس CARS-2 تلقائياً', 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً', 'er');
      return;
    }

    if (psychometrics.answeredCount < 15) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.answeredCount} من أصل 15 بنداً فقط. هل تود حفظ تقييم CARS-2 كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'cars',
      measureName: 'كارز-2 (CARS-2) - مقياس تقدير التوحد في الطفولة',
      scaleType: 'cars2',
      score: psychometrics.rawScore,
      maxScore: 60,
      minScore: 15,
      percentage: psychometrics.percentage,
      tScore: psychometrics.tScore,
      percentile: psychometrics.percentile,
      level: psychometrics.severityLabel,
      severityKey: psychometrics.severityKey,
      severityColor: psychometrics.severityColor,
      results: form.scores,
      itemNotes: form.itemNotes,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      domainScores: psychometrics.domainScores,
      isComplete: psychometrics.isComplete,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم CARS-2 بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', {
        ...payload,
        id: uid(),
        createdAt: new Date().toISOString(),
      });
      toast(`✅ تم حفظ تقييم CARS-2 بنجاح (الدرجة: ${psychometrics.rawScore}/60)`, 'ok');
    }

    if (onSaved) onSaved();
    if (onClose) onClose();
  }

  const filteredItems = CARS2_ITEMS.filter(it => {
    if (activeDomainFilter === 'all') return true;
    return it.domainId === activeDomainFilter;
  });

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div
        className="mb mb-xl"
        style={{
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          width: 'min(980px, calc(100vw - 20px))',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header-custom fhd"
          style={{
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            color: '#ffffff',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            flexGrow: 0,
            width: '100%',
            borderTopLeftRadius: 'var(--r)',
            borderTopRightRadius: 'var(--r)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.3rem' }}>🧩</span>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>
                مقياس تقدير التوحد في الطفولة — الإصدار الثاني (CARS-2)
              </h2>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '.78rem', opacity: 0.9 }}>
              Childhood Autism Rating Scale, Second Edition (CARS2-ST) · 15 بنداً تشخيصياً معتمداً
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#fff',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '.85rem',
              flexShrink: 0,
            }}
          >
            ✖ إغلاق
          </button>
        </div>

        {/* Dynamic Psychometrics Status Banner */}
        <div
          className="modal-banner"
          style={{
            background: 'var(--g0)',
            borderBottom: '1px solid var(--border-color)',
            padding: '10px 20px',
            flexShrink: 0,
            flexGrow: 0,
            overflow: 'visible',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة الخام (Raw Score):</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--pr)', lineHeight: 1.2 }}>
                {psychometrics.rawScore} <span style={{ fontSize: '.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>/ 60.0</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة المعيارية (T-Score):</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {psychometrics.tScore}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>الرتبة المئينية (% Rank):</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {psychometrics.percentile}%
              </div>
            </div>

            <div style={{ minWidth: 160 }}>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>التشخيص الإكلينيكي:</span>
              <span
                style={{
                  fontSize: '.76rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: `${psychometrics.severityColor}20`,
                  color: psychometrics.severityColor,
                  border: `1px solid ${psychometrics.severityColor}50`,
                  display: 'inline-block',
                  marginTop: 2,
                }}
              >
                {psychometrics.severityLabel}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 3 }}>
                <span>الإنجاز:</span>
                <strong>{psychometrics.answeredCount} / 15 بنداً</strong>
              </div>
              <div style={{ width: '100%', height: 7, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(psychometrics.answeredCount / 15) * 100}%`,
                    height: '100%',
                    background: psychometrics.isComplete ? 'var(--ok)' : 'var(--pr)',
                    transition: 'width 0.2s',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body-scroll" style={{ padding: '18px 22px' }}>
          {/* Student Picker & Diagnostic Meta Info */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div className="fg c2">
              <StudentPicker form={form} setForm={setForm} students={students} emps={emps} showExtra />
              <div className="fl">
                <label style={{ fontWeight: 800, fontSize: '.84rem' }}>تاريخ جلسة الفحص <span className="req">*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="fl">
                <label style={{ fontWeight: 800, fontSize: '.84rem' }}>الأخصائي الفاحص المعتمد</label>
                <input
                  value={form.specialistName}
                  onChange={e => setForm(f => ({ ...f, specialistName: e.target.value }))}
                  placeholder="اسم الأخصائي النفسي أو أخصائي التخاطب..."
                />
              </div>
            </div>
          </div>

          {/* Domains Filter Bar */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setActiveDomainFilter('all')}
              style={{
                borderRadius: 8,
                padding: '6px 12px',
                background: activeDomainFilter === 'all' ? 'var(--pr)' : 'var(--bg-card)',
                color: activeDomainFilter === 'all' ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
              }}
            >
              🌐 جميع البنود (15)
            </button>
            {CARS2_DOMAINS.map(d => {
              const domainScoreObj = psychometrics.domainScores.find(ds => ds.id === d.id);
              const isActive = activeDomainFilter === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  className="btn btn-xs"
                  onClick={() => setActiveDomainFilter(d.id)}
                  style={{
                    borderRadius: 8,
                    padding: '6px 12px',
                    background: isActive ? d.color : 'var(--bg-card)',
                    color: isActive ? '#fff' : 'var(--text-main)',
                    border: `1px solid ${isActive ? d.color : 'var(--border-color)'}`,
                    fontWeight: 700,
                  }}
                >
                  {d.name} ({domainScoreObj?.answered || 0}/{d.items.length})
                </button>
              );
            })}
          </div>

          {/* 15 Diagnostic Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredItems.map(it => {
              const currentScore = form.scores[it.id] !== undefined ? Number(form.scores[it.id]) : null;
              const currentAnchor = it.anchors.find(a => a.score === currentScore);
              const domain = CARS2_DOMAINS.find(d => d.id === it.domainId);

              return (
                <div
                  key={it.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore ? '1.5px solid var(--pr)' : '1px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    boxShadow: 'var(--sh)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Item Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            background: domain?.color || 'var(--pr)',
                            color: '#fff',
                            fontSize: '.72rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {it.code}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {it.id}. {it.title}
                        </h3>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '.78rem', color: 'var(--text-sub)' }}>
                        {it.subtitle}
                      </p>
                    </div>

                    {currentScore !== null && (
                      <span
                        className="bdg b-bl"
                        style={{ fontSize: '.84rem', fontWeight: 700, padding: '4px 10px' }}
                      >
                        الدرجة المرصودة: {currentScore.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* 7 Score Value Selector Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))', gap: 6, marginTop: 10 }}>
                    {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0].map(val => {
                      const isSelected = currentScore === val;
                      const isInteger = Number.isInteger(val);

                      let colorClass = '#3b82f6';
                      if (val >= 3.0) colorClass = '#ef4444';
                      else if (val >= 2.0) colorClass = '#f59e0b';
                      else colorClass = '#10b981';

                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleScoreSelect(it.id, val)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: 8,
                            border: isSelected ? `2px solid ${colorClass}` : '1px solid var(--border-color)',
                            background: isSelected ? `${colorClass}18` : 'var(--bg-input, var(--bg-card))',
                            color: isSelected ? colorClass : 'var(--text-main)',
                            fontWeight: isSelected ? 700 : isInteger ? 600 : 500,
                            fontSize: '.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{val.toFixed(1)}</span>
                          <span style={{ fontSize: '.65rem', opacity: 0.85 }}>
                            {val === 1.0 ? 'طبيعي' : val === 2.0 ? 'بسيط' : val === 3.0 ? 'متوسط' : val === 4.0 ? 'شديد' : 'بينهما'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Anchor Behavioral Description */}
                  {currentAnchor ? (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '10px 14px',
                        background: 'var(--g0)',
                        borderRadius: 8,
                        borderLeft: `4px solid ${currentScore >= 3.0 ? '#ef4444' : currentScore >= 2.0 ? '#f59e0b' : '#10b981'}`,
                        fontSize: '.82rem',
                        lineHeight: 1.5,
                        color: 'var(--text-main)',
                      }}
                    >
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 2 }}>
                        {currentAnchor.label}:
                      </strong>
                      {currentAnchor.description}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontSize: '.76rem', color: 'var(--text-sub)', fontStyle: 'italic' }}>
                      ℹ️ اختر إحدى الدرجات أعلاه لتحديد السلوك ووصف الملاحظة المناسبة
                    </div>
                  )}

                  {/* Per-Item Qualitative Note */}
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="📝 ملاحظات سلوكية إضافية وشواهد لهذا البند..."
                      value={form.itemNotes[it.id] || ''}
                      onChange={e => handleItemNoteChange(it.id, e.target.value)}
                      style={{
                        fontSize: '.78rem',
                        padding: '6px 10px',
                        width: '100%',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        background: 'var(--bg-input, var(--bg-card))',
                        color: 'var(--text-main)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Domain Breakdown Bar Summary */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginTop: 18,
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '.92rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📊</span> <span>المظهر الإكلينيكي عبر المجالات الأربعة (CARS-2 Domain Profile)</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {psychometrics.domainScores.map(d => (
                <div
                  key={d.id}
                  style={{
                    background: 'var(--g0)',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ color: d.color }}>{d.name}</span>
                    <span>{d.score} / {d.maxScore}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${d.percentage}%`, height: '100%', background: d.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--text-sub)', marginTop: 4 }}>
                    <span>المتوسط: {d.avg}</span>
                    <span>{d.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Interpretation & Recommendations Section */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginTop: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '.92rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> <span>التقرير التشخيصي والتوصيات الإكلينيكية</span>
              </h3>

              <button
                type="button"
                className="btn btn-xs btn-s"
                onClick={applyAutoClinicalSummary}
                style={{ borderRadius: 6, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <span>✨</span>
                <span>توليد الصياغة التشخيصية لمقياس CARS-2</span>
              </button>
            </div>

            <div className="fl full" style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)' }}>
                الخلاصة الإكلينيكية والتشخيص النفسي
              </label>
              <textarea
                rows={4}
                value={form.clinicalSummary}
                onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                placeholder="خلاصة نتائج المقياس، الدلالات التشخيصية، ومستوى الأداء والملاحظة..."
                style={{ border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '.85rem' }}
              />
            </div>

            <div className="fl full">
              <label style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--text-main)' }}>
                التوصيات الإجرائية والبرنامج التأهيلي المقترح
              </label>
              <textarea
                rows={4}
                value={form.recommendations}
                onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                placeholder="توصيات التدخل السلوكي، التخاطب، التكامل الحسي، وتوجيهات الأسرة..."
                style={{ border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div
          className="fa"
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--g0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: '.82rem', color: 'var(--text-sub)' }}>
            المجموع: <strong style={{ color: 'var(--pr)', fontSize: '1rem' }}>{psychometrics.rawScore}</strong> / 60.0 (المستوى: {psychometrics.severityLabel})
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={onClose}
              style={{ fontWeight: 700, borderRadius: 8 }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-p"
              onClick={handleSave}
              style={{ fontWeight: 800, padding: '8px 18px', borderRadius: 8 }}
            >
              💾 حفظ واعتماد تقييم CARS-2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
