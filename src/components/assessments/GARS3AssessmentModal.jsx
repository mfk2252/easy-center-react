import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  GARS3_ITEMS,
  GARS3_DOMAINS,
  GARS3_RESPONSE_OPTIONS,
  calculateGARS3Psychometrics,
} from '../../data/gars3Data';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_GARS3_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'الأم',
  relationshipDuration: 'سنتان',
  examinerName: '',
  examinerRole: 'أخصائي نفسي / تشخيص',
  date: todayStr(),
  isVerbal: true, // true: 6 subscales (58 items), false: 4 subscales (44 items)
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function GARS3AssessmentModal({
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
        ...EMPTY_GARS3_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
        isVerbal: initialData.isVerbal !== undefined ? initialData.isVerbal : true,
      };
    }
    return {
      ...EMPTY_GARS3_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');

  // Real-time Psychometrics Calculation
  const psychometrics = useMemo(() => {
    return calculateGARS3Psychometrics(form.scores, form.isVerbal);
  }, [form.scores, form.isVerbal]);

  const displayedDomains = useMemo(() => {
    return form.isVerbal ? GARS3_DOMAINS : GARS3_DOMAINS.filter(d => d.isCore);
  }, [form.isVerbal]);

  const filteredItems = useMemo(() => {
    let items = GARS3_ITEMS;
    if (!form.isVerbal) {
      items = items.filter(it => it.domainId !== 'cs' && it.domainId !== 'ms');
    }
    if (activeDomainFilter !== 'all') {
      items = items.filter(it => it.domainId === activeDomainFilter);
    }
    return items;
  }, [activeDomainFilter, form.isVerbal]);

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
    const items = form.isVerbal ? GARS3_ITEMS : GARS3_ITEMS.filter(it => it.domainId !== 'cs' && it.domainId !== 'ms');
    
    items.forEach(it => {
      if (level === 'mild') {
        scores[it.id] = (it.id % 3 === 0) ? 2 : (it.id % 2 === 0 ? 1 : 0);
      } else if (level === 'moderate') {
        scores[it.id] = (it.id % 4 === 0) ? 3 : (it.id % 2 === 0 ? 2 : 1);
      } else if (level === 'severe') {
        scores[it.id] = (it.id % 3 === 0) ? 2 : 3;
      } else {
        scores[it.id] = (it.id % 5 === 0) ? 1 : 0;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم ملء إجابات افتراضية (${level}) لأغراض المعاينة والتجربة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.answeredCount < 10) {
      toast('⚠️ يرجى تقييم عدد كافٍ من العبارات لتوليد الخلاصة التشخيصية', 'er');
      return;
    }

    const domainDetails = psychometrics.domainResults.map(d => {
      let level = 'ضمن المتوسط الطبيعي';
      if (d.scaledScore >= 13) level = 'مرتفع جداً (شديد)';
      else if (d.scaledScore >= 11) level = 'فوق المتوسط (متوسط)';
      else if (d.scaledScore >= 8) level = 'متوسط';
      return `• ${d.name} (${d.code}): الدرجة الخام (${d.rawScore}/${d.maxRaw}) ➔ الدرجة المعيارية (${d.scaledScore}) بالرتبة المئينية (${d.percentile}%) - [${level}]`;
    }).join('\n');

    const verbalStatus = form.isVerbal ? 'الأطفال الناطقين (تطبيق 6 مقاييس فرعية)' : 'الأطفال غير الناطقين (تطبيق 4 مقاييس فرعية أساسية)';

    const suggestedSummary = `بناءً على تطبيق مقياس جيليام لتقدير اضطراب طيف التوحد - الإصدار الثالث (GARS-3) وفق معايير الدليل التشخيصي والإحصائي الخامس (DSM-5):\n\nصيغة التطبيق: ${verbalStatus}.\n- مجموع الدرجات المعيارية الموزونة: (${psychometrics.sumScaledScores}).\n- معامل اضطراب طيف التوحد (Autism Quotient - AQ): (${psychometrics.autismQuotient}) برتبة مئينية كلية (${psychometrics.overallPercentile}%).\n\nالنتيجة والتشخيص الإكلينيكي:\nاحتمالية التوحد: [${psychometrics.probability}]\nمستوى الشدة وفق DSM-5: [${psychometrics.dsm5Level}]\nمستوى الدعم المطلوب: [${psychometrics.supportLevel}]\n\nالأداء التفصيلي على المقاييس الفرعية:\n${domainDetails}\n\nالوصف النفسي:\n${psychometrics.clinicalDescription}`;

    const suggestedRecs = psychometrics.severityKey === 'unlikely'
      ? '1. لا تظهر نتائج المقياس مؤشرات دالة على اضطراب طيف التوحد في الوقت الراهن.\n2. تعزيز المهارات النمائية واللغوية في البيئة الطبيعية والصفية.\n3. إعادة الملاحظة بعد 6 أشهر في حال استجدت أي ملاحظات سلوكية.'
      : psychometrics.severityKey === 'mild'
      ? '1. تصميم خطة تربوية فردية (IEP) تركز على المبادأة الاجتماعية وتطوير مهارات اللعب المشترك.\n2. جلسات تخاطب لتنمية مهارات التفاعل الاجتماعي البراجماتي وفهم التعبيرات المجازية.\n3. جلسات علاج وظيفي لتنظيم الاستجابات للمثيرات الحسية وتقليل الحركات النمطية.\n4. إرشاد أسري مستمر لتعميم المهارات السلوكية في المنزل.'
      : psychometrics.severityKey === 'moderate'
      ? '1. إدراج الطفل في برنامج تدخل سلوكي مكثف (ABA) لتعديل السلوكيات النمطية والحد من نوبات الغضب.\n2. برنامج تدريب على التواصل الوظيفي واستخدام الوسائل البصرية (Visual Schedules).\n3. جلسات تكامل حسي لمعالجة فرط التحسس السمعي واللمسي.\n4. تدريب الأقران ومرافقة الطفل في الأنشطة الاجتماعية التفاعلية.'
      : '1. برنامج تدخل علاجي وسلوكي شامل وفائق الكثافة (Comprehensive Intensive ABA Program).\n2. تدريب مكثف على التواصل المعزز والبديل (AAC / PECS) لتأسيس وسيلة تواصل وظيفية.\n3. خطة دعم سلوكي إيجابي (PBSP) للحد من السلوكيات القهرية وإيذاء الذات.\n4. بيئة صفية مهيأة حسياً لتقليل المثيرات المسببة للانهيار الانفعالي.\n5. متابعة دورية من فريق التأهيل متعدد التخصصات (MDT) وطبيب الأطفال النفسي.';

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية والتوصيات آلياً بدقة', 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً', 'er');
      return;
    }

    if (!form.date) {
      toast('⚠️ يرجى إدخال تاريخ التقييم', 'er');
      return;
    }

    const totalRequired = form.isVerbal ? 58 : 44;
    if (psychometrics.answeredCount < totalRequired) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.answeredCount} من أصل ${totalRequired} عبارة. هل تود حفظ المقياس كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'gars3',
      measureName: 'جيليام 3 (GARS-3) لتشخيص اضطراب طيف التوحد',
      scaleType: 'gars3',
      isVerbal: form.isVerbal,
      subscalesCount: form.isVerbal ? 6 : 4,
      totalRawScore: psychometrics.totalRawScore,
      sumScaledScores: psychometrics.sumScaledScores,
      autismQuotient: psychometrics.autismQuotient,
      percentile: psychometrics.overallPercentile,
      sem: psychometrics.overallSEM,
      score: psychometrics.autismQuotient, // For generic table display
      maxScore: 140,
      minScore: 43,
      percentage: psychometrics.completionPercentage,
      level: psychometrics.dsm5Level,
      probability: psychometrics.probability,
      supportLevel: psychometrics.supportLevel,
      severityKey: psychometrics.severityKey,
      severityColor: psychometrics.severityColor,
      results: form.scores,
      itemNotes: form.itemNotes,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      domainResults: psychometrics.domainResults,
      isComplete: psychometrics.isComplete,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم مقياس جيليام 3 بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ تقييم مقياس جيليام 3 بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  const totalRequiredItems = form.isVerbal ? 58 : 44;

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div
        className="mb mb-xl"
        style={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: 16,
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          width: 'min(1040px, calc(100vw - 20px))',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header-custom fhd"
          style={{
            background: 'linear-gradient(135deg, #0d9488, #0f766e)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.3rem' }}>📊</span>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>
                مقياس جيليام لتقدير اضطراب طيف التوحد — الإصدار الثالث (GARS-3)
              </h2>
              <span
                style={{
                  fontSize: '.72rem',
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: 'rgba(255, 255, 255, 0.25)',
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {form.isVerbal ? '6 مقاييس (ناطق)' : '4 مقاييس (غير ناطق)'}
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '.78rem', opacity: 0.9 }}>
              Gilliam Autism Rating Scale, 3rd Edition · مقنن وفق معايير DSM-5 للأعمار من 3 إلى 22 عاماً
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>معامل التوحد (AQ):</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0d9488', lineHeight: 1.2 }}>
                {psychometrics.autismQuotient}{' '}
                <span style={{ fontSize: '.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                  (مجموع: {psychometrics.sumScaledScores})
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>الرتبة المئينية (%):</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {psychometrics.overallPercentile}%
              </div>
            </div>

            <div style={{ minWidth: 160 }}>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>التصنيف والشدة (DSM-5):</span>
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
                {psychometrics.dsm5Level}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 3 }}>
                <span>المقيمة:</span>
                <strong>{psychometrics.answeredCount} / {totalRequiredItems} عبارة</strong>
              </div>
              <div style={{ width: '100%', height: 7, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(psychometrics.answeredCount / totalRequiredItems) * 100}%`,
                    height: '100%',
                    background: psychometrics.isComplete ? 'var(--ok)' : '#0d9488',
                    transition: 'width 0.2s',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body-scroll" style={{ padding: '18px 22px' }}>
          {/* Student Picker & Examiner Setup */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 18,
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
                  value={form.examinerName}
                  onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                  placeholder="اسم الأخصائي النفسي أو الفاحص التشخيصي..."
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 800, fontSize: '.84rem' }}>اسم المقيم / ولي الأمر</label>
                <input
                  value={form.raterName}
                  onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                  placeholder="اسم القائم بالاستجابة (الأم، الأب، المعلم...)"
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 800, fontSize: '.84rem' }}>صلة القرابة / العلاقة</label>
                <input
                  value={form.raterRelation}
                  onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                  placeholder="الأم / الأب / المعلم..."
                />
              </div>
            </div>

            {/* Verbal vs Non-Verbal Switch */}
            <div
              style={{
                marginTop: 14,
                padding: '12px 14px',
                borderRadius: 10,
                background: 'var(--g0)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--text-main)' }}>
                  🗣️ المرونة السيكومترية (الحالة اللغوية للمفحوص):
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>
                  اختر النموذج المطابق للطفل لحساب معامل التوحد الدقيق وفق معايير GARS-3
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => setForm(f => ({ ...f, isVerbal: true }))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontWeight: 800,
                    background: form.isVerbal ? '#0d9488' : 'var(--bg-card)',
                    color: form.isVerbal ? '#fff' : 'var(--text-main)',
                    border: `1px solid ${form.isVerbal ? '#0d9488' : 'var(--border-color)'}`,
                  }}
                >
                  🗣️ ناطق (6 مقاييس فرعية - 58 بنداً)
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => setForm(f => ({ ...f, isVerbal: false }))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontWeight: 800,
                    background: !form.isVerbal ? '#e11d48' : 'var(--bg-card)',
                    color: !form.isVerbal ? '#fff' : 'var(--text-main)',
                    border: `1px solid ${!form.isVerbal ? '#e11d48' : 'var(--border-color)'}`,
                  }}
                >
                  🤫 غير ناطق (4 مقاييس فرعية أساسية - 44 بنداً)
                </button>
              </div>
            </div>
          </div>

          {/* Subscales Quick Overview Matrix */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '.85rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
              📈 مؤشرات الأداء الحالية على المقاييس الفرعية:
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 8,
              }}
            >
              {psychometrics.domainResults.map(dr => (
                <div
                  key={dr.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${dr.color}40`,
                    borderTop: `3px solid ${dr.color}`,
                    borderRadius: 8,
                    padding: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                    {dr.name}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: dr.color, margin: '2px 0' }}>
                    {dr.scaledScore}{' '}
                    <span style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>معيارية</span>
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>
                    خام: {dr.rawScore}/{dr.maxRaw} ({dr.percentile}%)
                  </div>
                </div>
              ))}
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
                background: activeDomainFilter === 'all' ? '#0d9488' : 'var(--bg-card)',
                color: activeDomainFilter === 'all' ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
              }}
            >
              🌐 جميع العبارات ({totalRequiredItems})
            </button>
            {displayedDomains.map(d => {
              const domainResult = psychometrics.domainResults.find(dr => dr.id === d.id);
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
                  {d.name} ({domainResult?.answeredCount || 0}/{d.itemCount})
                </button>
              );
            })}
          </div>

          {/* Diagnostic Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredItems.map(it => {
              const currentScore = form.scores[it.id] !== undefined ? Number(form.scores[it.id]) : null;
              const domain = GARS3_DOMAINS.find(d => d.id === it.domainId);

              return (
                <div
                  key={it.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${currentScore !== null ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.4)'}`,
                    borderRadius: 12,
                    padding: '14px 18px',
                    boxShadow: currentScore !== null ? '0 1px 3px rgba(0,0,0,0.03)' : '0 0 0 1px rgba(239,68,68,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: domain?.color || 'var(--pr)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '.85rem',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {it.id}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', marginBottom: 3 }}>
                          المقياس الفرعي: <strong style={{ color: domain?.color }}>{domain?.name}</strong>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                          {it.text || it.title}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>الدرجة:</span>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 6,
                          background: currentScore !== null ? `${domain?.color || 'var(--pr)'}20` : 'var(--g0)',
                          color: currentScore !== null ? domain?.color || 'var(--pr)' : 'var(--text-sub)',
                          border: '1px solid var(--border-color)',
                          minWidth: 36,
                          textAlign: 'center',
                        }}
                      >
                        {currentScore !== null ? currentScore : '—'}
                      </span>
                    </div>
                  </div>

                  {/* 4-point Frequency Selection Buttons */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    {GARS3_RESPONSE_OPTIONS.map(opt => {
                      const optScore = opt.value !== undefined ? opt.value : opt.score;
                      const isSelected = currentScore === optScore;
                      return (
                        <button
                          key={optScore}
                          type="button"
                          onClick={() => handleScoreSelect(it.id, optScore)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '10px 12px',
                            borderRadius: 8,
                            textAlign: 'right',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            border: isSelected ? `2px solid ${domain?.color || '#0d9488'}` : '1px solid var(--border-color)',
                            background: isSelected ? `${domain?.color || '#0d9488'}15` : 'var(--bg-card)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontWeight: 600, fontSize: '.88rem', color: isSelected ? domain?.color || '#0d9488' : 'var(--text-main)' }}>
                              {opt.label} ({optScore})
                            </span>
                            {isSelected && <span style={{ color: domain?.color || '#0d9488', fontSize: '.9rem', fontWeight: 700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginTop: 4, lineHeight: 1.4 }}>
                            {opt.description || opt.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Item Specific Note Input */}
                  <input
                    type="text"
                    value={form.itemNotes[it.id] || ''}
                    onChange={e => handleItemNoteChange(it.id, e.target.value)}
                    placeholder="ملاحظات وسياق الملاحظة السلوكية لهذا البند (اختياري)..."
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 6,
                      fontSize: '.78rem',
                      border: '1px solid var(--border-color)',
                      background: 'var(--g0)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Clinical Diagnostic Impression & Recommendations */}
          <div
            style={{
              marginTop: 22,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontWeight: 900, fontSize: '.95rem', color: 'var(--text-main)' }}>
                📝 الخلاصة التشخيصية والتوصيات الإكلينيكية (DSM-5)
              </div>
              <button
                type="button"
                className="btn btn-xs"
                onClick={applyAutoClinicalSummary}
                style={{
                  background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                  color: '#fff',
                  fontWeight: 800,
                  borderRadius: 8,
                  padding: '6px 12px',
                }}
              >
                ✨ توليد تلقائي ذكي بناءً على درجات GARS-3
              </button>
            </div>

            <div className="fl" style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 800, fontSize: '.84rem' }}>الخلاصة الإكلينيكية والانطباع التشخيصي:</label>
              <textarea
                rows={5}
                value={form.clinicalSummary}
                onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                placeholder="اكتب التقرير والملخص التشخيصي أو اضغط على التوليد التلقائي أعلاه..."
              />
            </div>

            <div className="fl">
              <label style={{ fontWeight: 800, fontSize: '.84rem' }}>التوصيات العلاجية والتربوية والتحويلات المقترحة:</label>
              <textarea
                rows={4}
                value={form.recommendations}
                onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                placeholder="التوصيات والبرامج المقترحة (ABA, تخاطب, تكامل حسي, IEP)..."
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          className="fa"
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--g0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="btn btn-xs btn-g"
              onClick={() => autoFillSample('mild')}
              title="تعبئة درجات تجريبية (توحد بسيط/متوسط)"
            >
              ⚡ تجربة نموذج بسيط
            </button>
            <button
              type="button"
              className="btn btn-xs btn-g"
              onClick={() => autoFillSample('severe')}
              title="تعبئة درجات تجريبية (توحد شديد)"
            >
              ⚡ تجربة نموذج شديد
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-g" onClick={onClose}>
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-p"
              onClick={handleSave}
              style={{ fontWeight: 800, padding: '8px 22px', background: '#0d9488', color: '#fff' }}
            >
              💾 حفظ واعتماد تقييم GARS-3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
