import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  GARS3_ITEMS,
  GARS3_DOMAINS,
  GARS3_RESPONSE_OPTIONS,
  GARS3_COPYRIGHT_INFO,
  calculateGARS3Psychometrics,
} from '../../data/gars3Data';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_GARS3_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'الأم',
  relationshipDuration: 'سنتان',
  examinerName: '',
  examinerRole: 'أخصائي نفسي / تشخيص وتعديل سلوك',
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
        // Mild / Probable Autism
        scores[it.id] = (it.id % 4 === 0) ? 2 : (it.id % 2 === 0 ? 1 : 0);
      } else if (level === 'moderate') {
        // Moderate / Very Likely
        if (it.domainId === 'rb' || it.domainId === 'si' || it.domainId === 'sc') {
          scores[it.id] = (it.id % 3 === 0) ? 3 : 2;
        } else {
          scores[it.id] = (it.id % 2 === 0) ? 2 : 1;
        }
      } else if (level === 'severe') {
        // Severe / Level 3
        scores[it.id] = (it.id % 3 === 0) ? 2 : 3;
      } else {
        // Unlikely / Normal
        scores[it.id] = (it.id % 5 === 0) ? 1 : 0;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم تعبئة استجابات نموذجية (${level === 'unlikely' ? 'أداء طبيعي' : level === 'mild' ? 'طيف توحد خفيف (المستوى 1)' : level === 'moderate' ? 'طيف توحد متوسط (المستوى 2)' : 'طيف توحد شديد (المستوى 3)'}) للتجربة والمعاينة السريعة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    const totalRequired = form.isVerbal ? 58 : 44;
    if (psychometrics.answeredCount < 12) {
      toast('⚠️ يرجى تقييم عدد كافٍ من العبارات (12 بنداً على الأقل) لتوليد الخلاصة التشخيصية', 'er');
      return;
    }

    const domainDetails = psychometrics.domainResults.map(d => {
      let severityDesc = 'أعراض ضمن المدى العادي';
      if (d.scaledScore >= 13) severityDesc = 'أعراض شديدة جداً (حرجة)';
      else if (d.scaledScore >= 11) severityDesc = 'أعراض ملحوظة فوق المتوسط';
      else if (d.scaledScore >= 8) severityDesc = 'أعراض متوسطة';
      return `• ${d.name} (${d.code}): الدرجة الخام (${d.rawScore}/${d.maxRaw}) ➔ الدرجة المعيارية (${d.scaledScore}) بالرتبة المئينية (${d.percentile}%) - [${severityDesc}]`;
    }).join('\n');

    const verbalStatus = form.isVerbal ? 'نموذج الأطفال الناطقين (تطبيق 6 مقاييس فرعية - 58 بنداً)' : 'نموذج الأطفال غير الناطقين (تطبيق 4 مقاييس فرعية أساسية - 44 بنداً)';

    const suggestedSummary = `تقرير التقييم والتشخيص بمقياس جيليام لتقدير اضطراب طيف التوحد — الإصدار الثالث (GARS-3) وفق معايير DSM-5:\n\n` +
      `صيغة التطبيق السيكومتري: ${verbalStatus}.\n` +
      `- مجموع الدرجات المعيارية الموزونة للمقاييس الفرعية: (${psychometrics.sumScaledScores}).\n` +
      `- معامل اضطراب طيف التوحد (Autism Quotient - AQ): (${psychometrics.autismQuotient}) برتبة مئينية كلية (${psychometrics.overallPercentile}%).\n` +
      `- الخطأ المعياري للقياس (SEM): (±${psychometrics.overallSEM}).\n\n` +
      `النتيجة والتشخيص الإكلينيكي:\n` +
      `احتمالية التوحد: [${psychometrics.probability}]\n` +
      `مستوى الشدة وفق DSM-5: [${psychometrics.dsm5Level}]\n` +
      `مستوى الدعم المطلوب: [${psychometrics.supportLevel}]\n\n` +
      `الأداء التفصيلي على المقاييس الفرعية:\n${domainDetails}\n\n` +
      `الوصف السريري المعتمد:\n${psychometrics.clinicalDescription}`;

    const suggestedRecs = psychometrics.severityKey === 'unlikely'
      ? '1. نتائج المقياس لا تظهر مؤشرات دالة على اضطراب طيف التوحد في الوقت الراهن.\n2. تعزيز المهارات النمائية واللغوية والاجتماعية في البيئة الطبيعية والصفية.\n3. إعادة التقييم بعد 6 أشهر في حال استجدت أي ملاحظات سلوكية أو تواصلية.'
      : psychometrics.severityKey === 'mild'
      ? '1. تصميم خطة تربوية فردية (IEP) تركز على المبادأة الاجتماعية وتطوير مهارات اللعب التشاركي والتواصل البراجماتي.\n2. جلسات تخاطب لتنمية مهارات التفاعل الاجتماعي وفهم التعبيرات المجازية والسياقية.\n3. جلسات علاج وظيفي وتكامل حسي لتنظيم الاستجابات للمثيرات الحسية وتخفيف الحركات النمطية.\n4. تطبيق استراتيجيات الدعم السلوكي الإيجابي والإرشاد الأسري لتعميم المهارات في البيئة المنزلية.'
      : psychometrics.severityKey === 'moderate'
      ? '1. إدراج المفحوص في برنامج تدخل سلوكي مكثف (تحليل السلوك التطبيقي - ABA) لتعديل السلوكيات النمطية وتنمية مهارات التواصل الوظيفي.\n2. استخدام الجداول البصرية (Visual Schedules) ونظام التواصل بالصور (PECS) لدعم الاستقلالية.\n3. برنامج تدريب على التكامل الحسي لمعالجة فرط أو نقص التحسس للمثيرات البيئية.\n4. تدريب الأقران ودمج الطفل في الأنشطة الاجتماعية الجماعية تحت إشراف أخصائي التربية الخاصة.\n5. جلسات إرشاد وتوجيه أسري منتظمة لتوحيد أساليب التعامل وتعديل السلوك.'
      : '1. وضع خطة تأهيلية وسلوكية شاملة وفائقة الكثافة (Comprehensive Intensive ABA Program) بإشراف فريق متعدد التخصصات.\n2. تطبيق برامج التواصل المعزز والبديل (AAC / PECS) لتأسيس نظام تواصل وظيفي فعال.\n3. خطة دعم سلوكي إيجابي لحماية المفحوص والحد من السلوكيات النمطية القهرية وسلوكيات إيذاء الذات.\n4. تهيئة بيئة حسية ملائمة لتخفيف العبء الحسي والوقاية من نوبات الانهيار العصبي والانفعالي.\n5. متابعة طبية ونفسية دورية مع تقييم مستمر للأهداف النمائية والتربوية.';

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية الشاملة والتوصيات التربوية بدقة فائقة', 'ok');
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
      measureId: 'autism_spectrum',
      scaleId: 'gars3',
      scaleType: 'gars3',
      measureName: 'مقياس جيليام لتقدير التوحد — الإصدار الثالث (GARS-3)',
      scaleName: 'مقياس جيليام لتقدير اضطراب طيف التوحد (GARS-3)',
      category: 'autism_spectrum',
      categoryName: 'اضطراب طيف التوحد والنمو الشامل',
      score: psychometrics.autismQuotient,
      autismQuotient: psychometrics.autismQuotient,
      sumScaledScores: psychometrics.sumScaledScores,
      overallPercentile: psychometrics.overallPercentile,
      percentile: psychometrics.overallPercentile,
      sem: psychometrics.overallSEM,
      isVerbal: form.isVerbal,
      subscalesCount: form.isVerbal ? 6 : 4,
      percentage: psychometrics.completionPercentage,
      level: psychometrics.dsm5Level,
      probability: psychometrics.probability,
      supportLevel: psychometrics.supportLevel,
      severityLevel: psychometrics.dsm5Level,
      severityKey: psychometrics.severityKey,
      color: psychometrics.severityColor,
      severityColor: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      psychometrics,
      author: GARS3_COPYRIGHT_INFO.authorAr,
      publisher: GARS3_COPYRIGHT_INFO.publisherAr,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم مقياس جيليام 3 بنجاح', 'ok');
    } else {
      const newId = uid();
      lsAdd('studentAssessments', {
        ...payload,
        id: newId,
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق مقياس جيليام 3 بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  function handleSafeClose() {
    const answeredCount = Object.keys(form.scores || {}).length;
    if (answeredCount > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${answeredCount}) بنداً في المقياس. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  const totalRequiredItems = form.isVerbal ? 58 : 44;

  return (
    <div className="mbg" style={{ zIndex: 1100 }} onClick={e => e.target === e.currentTarget && handleSafeClose()}>
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
            <span style={{ fontSize: '1.8rem' }}>📊</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس جيليام لتقدير اضطراب طيف التوحد (GARS-3)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  {form.isVerbal ? '58 بنداً تشخيصياً · 6 مقاييس فرعية (ناطق)' : '44 بنداً تشخيصياً · 4 مقاييس فرعية أساسية (غير ناطق)'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#134e4a', color: '#ccfbf1', fontSize: '0.68rem', fontWeight: 800 }}>
                  © PRO-ED / د. جيمس إي. جيليام
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Gilliam Autism Rating Scale — الأداة المعيارية المعتمدة لتقدير وتشخيص طيف التوحد وفق معايير DSM-5
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
              📜 {showCopyrightDetails ? 'إخفاء حقوق الملكية' : 'حقوق الملكية الفكرية'}
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
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس GARS-3:
            </div>

            {/* Copyright Banner within details */}
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
                  <strong>إشعار حقوق الملكية الفكرية والاعتماد السيكومتري:</strong> مقياس جيليام لتقدير اضطراب طيف التوحد (GARS-3) — إعداد د. جيمس إي. جيليام (James E. Gilliam, Ph.D.) · دار نشر برو-إد الأمريكية (PRO-ED, Inc.).
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#99f6e4', color: '#134e4a', padding: '3px 8px', borderRadius: 6, border: '1px solid #5eead4', fontWeight: 700 }}>
                مخصص للتشخيص والتقييم السريري المرخص
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>المؤلف الأصلي:</strong> {GARS3_COPYRIGHT_INFO.authorAr} ({GARS3_COPYRIGHT_INFO.authorEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>جهة النشر الأصلية:</strong> {GARS3_COPYRIGHT_INFO.publisherAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>الفئة المستهدفة:</strong> {GARS3_COPYRIGHT_INFO.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #99f6e4' }}>
                <strong>المرجعية التشخيصية:</strong> {GARS3_COPYRIGHT_INFO.standardsReference}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#115e59', background: '#ccfbf1', padding: '8px 12px', borderRadius: 8 }}>
              {GARS3_COPYRIGHT_INFO.notice}
              <br />
              <strong>{GARS3_COPYRIGHT_INFO.disclaimer}</strong>
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
            {/* Autism Quotient (AQ) Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #0d9488',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>معامل التوحد (AQ):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.autismQuotient}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                (مئيني: {psychometrics.overallPercentile}%)
              </span>
            </div>

            {/* Sum of Scaled Scores */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>مجموع الدرجات المعيارية:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f766e' }}>
                {psychometrics.sumScaledScores} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>/ {form.isVerbal ? '120' : '80'}</small>
              </span>
            </div>

            {/* Verbal Format Toggle */}
            <div style={{ background: 'var(--bg-card)', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>صيغة التطبيق:</span>
              <button
                type="button"
                className={`btn btn-xs ${form.isVerbal ? 'btn-p' : 'btn-g'}`}
                onClick={() => setForm(f => ({ ...f, isVerbal: true }))}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: form.isVerbal ? 800 : 500,
                  background: form.isVerbal ? '#0d9488' : undefined,
                  color: form.isVerbal ? '#fff' : undefined,
                  border: form.isVerbal ? 'none' : undefined,
                }}
              >
                🗣️ ناطق (6 مقاييس)
              </button>
              <button
                type="button"
                className={`btn btn-xs ${!form.isVerbal ? 'btn-p' : 'btn-g'}`}
                onClick={() => setForm(f => ({ ...f, isVerbal: false }))}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: !form.isVerbal ? 800 : 500,
                  background: !form.isVerbal ? '#0f766e' : undefined,
                  color: !form.isVerbal ? '#fff' : undefined,
                  border: !form.isVerbal ? 'none' : undefined,
                }}
              >
                🤫 غير ناطق (4 مقاييس)
              </button>
            </div>

            {/* Diagnosis Result Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>التصنيف والشدة:</span>
              <span className={`bdg ${psychometrics.severityKey === 'severe' ? 'b-rd' : psychometrics.severityKey === 'moderate' ? 'b-or' : psychometrics.severityKey === 'mild' ? 'b-bl' : 'b-gr'}`} style={{ fontWeight: 800, fontSize: '0.78rem' }}>
                {psychometrics.probability} · {psychometrics.dsm5Level}
              </span>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {psychometrics.answeredCount} / {totalRequiredItems} بنداً
              </span>
              <div style={{ width: 60, height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${psychometrics.completionPercentage}%`,
                    height: '100%',
                    background: psychometrics.completionPercentage === 100 ? 'var(--ok)' : '#0d9488',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. Student & Assessment Info Card - Compact Refactored Header */}
          <div
            style={{
              background: 'var(--g0)',
              padding: '10px 14px',
              borderRadius: 10,
              marginBottom: 14,
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isHeaderCollapsed ? 0 : 8,
              }}
            >
              <div
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#0f766e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>👦</span>
                <span>بيانات المفحوص والفحص السريري</span>
                {form.studentName && (
                  <span
                    style={{
                      fontSize: '0.76rem',
                      background: '#ccfbf1',
                      color: '#0f766e',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontWeight: 700,
                    }}
                  >
                    {form.studentName}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsManualEdit(prev => !prev)}
                  className="btn btn-xs btn-g"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', height: 24 }}
                  title="تفعيل التعديل اليدوي على البيانات المجلوبة تلقائياً"
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
                        placeholder="اكتب اسم الطفل / المفحوص..."
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
                      placeholder="مثال: اشتباه طيف توحد، اضطراب تواصل..."
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
                      placeholder="اسم الأخصائي النفسي / الفاحص"
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    />
                  </div>

                  {/* 2. Respondent Name */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المستجيب (ولي أمر / معلم)</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم المستجيب على المقياس"
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  {/* 3. Verbal Format / Category */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>نموذج التطبيق السيكومتري</label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.isVerbal ? 'verbal' : 'nonverbal'}
                      onChange={e => setForm(f => ({ ...f, isVerbal: e.target.value === 'verbal' }))}
                    >
                      <option value="verbal">🗣️ أطفال ناطقين (6 مقاييس فرعية - 58 بنداً)</option>
                      <option value="nonverbal">🤫 أطفال غير ناطقين (4 مقاييس فرعية - 44 بنداً)</option>
                    </select>
                  </div>

                  {/* 4. Relationship / Role */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صلة القرابة / معرفة السلوك</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="مثال: الأم، الأب، معلم التربية الخاصة، الأخصائي الملاحظ..."
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
                📑 بنود المقاييس الفرعية (GARS-3 Subscales):
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                اختر 0 (أبداً)، 1 (نادراً)، 2 (أحياناً)، 3 (كثيراً جداً / نعم)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeDomainFilter === 'all' ? 'on' : ''}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع البنود ({totalRequiredItems})
              </button>
              {displayedDomains.map(dom => {
                const domStat = psychometrics.domainResults.find(d => d.id === dom.id);
                return (
                  <button
                    key={dom.id}
                    type="button"
                    className={`tab ${activeDomainFilter === dom.id ? 'on' : ''}`}
                    onClick={() => setActiveDomainFilter(dom.id)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      whiteSpace: 'nowrap',
                      borderRight: `3px solid ${dom.color}`,
                    }}
                  >
                    {dom.name.split(' ')[0]} ({domStat?.answeredCount || 0}/{dom.itemsCount})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const domain = GARS3_DOMAINS.find(d => d.id === item.domainId);
              const currentScore = form.scores[item.id];
              const currentNote = form.itemNotes[item.id] || '';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore !== undefined ? `1.5px solid ${domain?.color || 'var(--pr)'}` : '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: '260px' }}>
                      <span
                        style={{
                          background: domain?.color || 'var(--pr)',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        #{item.id} · {domain?.code || item.domainCode}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {item.text}
                        </div>
                        {item.example && (
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
                            <span style={{ color: '#0d9488', fontWeight: 800, flexShrink: 0, fontSize: '0.74rem' }}>
                              💡 توضيح سريري:
                            </span>
                            <span style={{ color: 'var(--text-sub)' }}>
                              {item.example}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating Scale Buttons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {GARS3_RESPONSE_OPTIONS.map(opt => {
                        const isSelected = currentScore === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleScoreSelect(item.id, opt.value)}
                            className={`btn btn-xs ${isSelected ? 'btn-p' : 'btn-g'}`}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              fontWeight: isSelected ? 800 : 500,
                              background: isSelected
                                ? (opt.value === 3 ? '#dc2626' : opt.value === 2 ? '#ea580c' : opt.value === 1 ? '#0284c7' : '#059669')
                                : undefined,
                              color: isSelected ? '#fff' : undefined,
                              border: isSelected ? 'none' : undefined,
                            }}
                            title={opt.hint || opt.description}
                          >
                            {opt.label} ({opt.score}) {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Item Observation Note */}
                  <div style={{ marginTop: 6 }}>
                    <input
                      type="text"
                      placeholder="ملاحظات سلوكية أو تفاصيل إضافية لهذا البند (اختياري)..."
                      value={currentNote}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
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
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> الخلاصة التشخيصية والتوصيات السلوكية والتأهيلية المعتمدة
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700 }}
              >
                ✨ إعادة توليد الخلاصة بناءً على الدرجات
              </button>
            </div>

            <div className="fg c1">
              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>التقرير السيكومتري والتشخيص الإكلينيكي (وفق DSM-5)</label>
                <textarea
                  rows={6}
                  placeholder="الخلاصة التشخيصية والوصف النفسي والسلوكي وفق معايير مقياس جيليام 3 و DSM-5..."
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>توصيات الخطة التربوية الفردية (IEP) والتدخل السلوكي التأهيلي</label>
                <textarea
                  rows={5}
                  placeholder="التوصيات العلاجية، استراتيجيات تعديل السلوك، برامج التواصل والدمج، والأنشطة التأهيلية..."
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
              تم الإجابة على <strong>{psychometrics.answeredCount}</strong> من <strong>{totalRequiredItems}</strong> بنداً
            </span>
            <span className={`bdg ${psychometrics.completionPercentage === 100 ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.72rem' }}>
              {psychometrics.completionPercentage}% مكتمل
            </span>

            {/* Quick Actions in footer */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 6 }}>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => autoFillSample('mild')}
                title="تعبئة نموذج افتراضي يظهر طيف توحد بسيط (مستوى 1)"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (توحد بسيط)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => autoFillSample('moderate')}
                title="تعبئة نموذج افتراضي يظهر طيف توحد متوسط (مستوى 2)"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة (توحد متوسط)
              </button>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, fontSize: '0.74rem' }}
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
              💾 حفظ تقييم مقياس جيليام (GARS-3)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
