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
  domainRawScores: {},
  inputMode: 'subscales', // 'subscales' (حاسبة الدرجات الخام المباشرة) أو 'items' (تفريغ أرقام بنود الكراسة)
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
      // استنتاج الدرجات الخام لكل مجال إذا كانت مخزنة مسبقاً
      const rawScores = initialData.domainRawScores || {};
      const scores = initialData.results || initialData.scores || {};
      return {
        ...EMPTY_GARS3_FORM,
        ...initialData,
        scores,
        domainRawScores: rawScores,
        itemNotes: initialData.itemNotes || {},
        isVerbal: initialData.isVerbal !== undefined ? initialData.isVerbal : true,
        inputMode: initialData.inputMode || 'subscales',
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
  const [openAccordions, setOpenAccordions] = useState({});

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
    if (form.inputMode === 'subscales') {
      return calculateGARS3Psychometrics({}, form.isVerbal, form.domainRawScores);
    }
    return calculateGARS3Psychometrics(form.scores, form.isVerbal, null);
  }, [form.scores, form.isVerbal, form.inputMode, form.domainRawScores]);

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
    setForm(prev => {
      const newScores = {
        ...prev.scores,
        [itemId]: scoreValue,
      };
      return {
        ...prev,
        scores: newScores,
      };
    });
  }

  function handleDomainRawChange(domainId, rawVal) {
    const domain = GARS3_DOMAINS.find(d => d.id === domainId);
    const max = domain?.maxRawScore || 42;
    let numeric = rawVal === '' ? '' : Math.max(0, Math.min(max, Number(rawVal) || 0));
    setForm(prev => ({
      ...prev,
      domainRawScores: {
        ...prev.domainRawScores,
        [domainId]: numeric,
      },
    }));
  }

  function toggleAccordion(domainId) {
    setOpenAccordions(prev => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  }

  function stepDomainRaw(domainId, delta) {
    const domain = GARS3_DOMAINS.find(d => d.id === domainId);
    const max = domain?.maxRawScore || 42;
    const current = Number(form.domainRawScores[domainId]) || 0;
    const nextVal = Math.max(0, Math.min(max, current + delta));
    handleDomainRawChange(domainId, nextVal);
  }

  function resetScores() {
    if (form.inputMode === 'subscales') {
      setForm(f => ({ ...f, domainRawScores: {} }));
    } else {
      setForm(f => ({ ...f, scores: {} }));
    }
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
    if (form.inputMode === 'subscales') {
      // إدخال درجات خام معيارية افتراضية للمجالات
      const domainRaw = {};
      displayedDomains.forEach(dom => {
        if (level === 'mild') {
          domainRaw[dom.id] = Math.round(dom.maxRawScore * 0.35);
        } else if (level === 'moderate') {
          domainRaw[dom.id] = Math.round(dom.maxRawScore * 0.55);
        } else if (level === 'severe') {
          domainRaw[dom.id] = Math.round(dom.maxRawScore * 0.85);
        } else {
          domainRaw[dom.id] = Math.round(dom.maxRawScore * 0.15);
        }
      });
      setForm(f => ({ ...f, domainRawScores: domainRaw }));
    } else {
      const scores = {};
      const items = form.isVerbal ? GARS3_ITEMS : GARS3_ITEMS.filter(it => it.domainId !== 'cs' && it.domainId !== 'ms');

      items.forEach(it => {
        if (level === 'mild') {
          scores[it.id] = (it.id % 4 === 0) ? 2 : (it.id % 2 === 0 ? 1 : 0);
        } else if (level === 'moderate') {
          if (it.domainId === 'rb' || it.domainId === 'si' || it.domainId === 'sc') {
            scores[it.id] = (it.id % 3 === 0) ? 3 : 2;
          } else {
            scores[it.id] = (it.id % 2 === 0) ? 2 : 1;
          }
        } else if (level === 'severe') {
          scores[it.id] = (it.id % 3 === 0) ? 2 : 3;
        } else {
          scores[it.id] = (it.id % 5 === 0) ? 1 : 0;
        }
      });
      setForm(f => ({ ...f, scores }));
    }
    toast(`⚡ تم ضبط استجابات نموذجية (${level === 'unlikely' ? 'أداء طبيعي' : level === 'mild' ? 'طيف توحد خفيف (المستوى 1)' : level === 'moderate' ? 'طيف توحد متوسط (المستوى 2)' : 'طيف توحد شديد (المستوى 3)'}) للتجربة السريعة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    const totalRequired = form.isVerbal ? 58 : 44;
    const answeredOrValid = form.inputMode === 'subscales'
      ? displayedDomains.every(d => form.domainRawScores[d.id] !== undefined && form.domainRawScores[d.id] !== '')
      : psychometrics.answeredCount >= 12;

    if (!answeredOrValid && psychometrics.answeredCount < 12) {
      toast('⚠️ يرجى تفريغ الدرجات الخام للمقاييس الفرعية أولاً لتوليد التقرير', 'er');
      return;
    }

    const domainDetails = psychometrics.domainResults.map(d => {
      let severityDesc = 'أعراض ضمن المدى العادي';
      if (d.scaledScore >= 13) severityDesc = 'أعراض شديدة جداً (حرجة)';
      else if (d.scaledScore >= 11) severityDesc = 'أعراض ملحوظة فوق المتوسط';
      else if (d.scaledScore >= 8) severityDesc = 'أعراض متوسطة';
      return `• ${d.name} (${d.code}): الدرجة الخام (${d.rawScore}/${d.maxRaw}) ➔ الدرجة المعيارية (${d.scaledScore}) بالرتبة المئينية (${d.percentile}%) - [${severityDesc}]`;
    }).join('\n');

    const verbalStatus = form.isVerbal ? 'نموذج الأطفال الناطقين (6 مقاييس فرعية)' : 'نموذج الأطفال غير الناطقين (4 مقاييس فرعية أساسية)';

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
      domainRawScores: form.domainRawScores,
      inputMode: form.inputMode,
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
    const hasRaw = Object.values(form.domainRawScores || {}).some(v => v !== '' && v !== undefined);
    if (answeredCount > 0 || hasRaw) {
      if (window.confirm('⚠️ تنبيه: هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟')) {
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
                  مقياس جيليام لتقدير اضطراب طيف التوحد (GARS-3) — الحاسبة السيكومترية الرقمية
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  {form.isVerbal ? '6 مقاييس فرعية (ناطق)' : '4 مقاييس فرعية أساسية (غير ناطق)'}
                </span>
                <span className="bdg" style={{ background: '#134e4a', color: '#ccfbf1', fontSize: '0.7rem', fontWeight: 800 }}>
                  تفريغ معتمد وحساب الدرجات المعيارية DSM-5
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Gilliam Autism Rating Scale — تحويل الدرجات الخام لحساب معامل التوحد (AQ) والرتب المئينية
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
              📜 {showCopyrightDetails ? 'إخفاء تنبيه الملكية' : 'تنبيه الملكية الفكرية'}
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
            className="p-4 md:p-5 border-b text-xs leading-relaxed bg-teal-50 border-teal-300 text-teal-900 dark:bg-slate-900 dark:border-teal-800 dark:text-teal-200"
          >
            <div className="font-extrabold text-sm mb-2 flex items-center gap-1.5 text-teal-950 dark:text-teal-100">
              <span>⚖️</span> تنبيه الامتثال وحقوق الملكية الفكرية (GARS-3 IP Notice):
            </div>

            <div
              className="rounded-lg p-2.5 mb-2.5 border bg-teal-100/70 border-teal-300 text-teal-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <div>
                <strong>طريقة الاستخدام الرسمية:</strong> يتم تطبيق بنود المقياس الـ 58 من خلال كراسة الاستجابة الورقية الرسمية الأصلية المعتمدة الصادرة عن دار النشر PRO-ED أو الوكيل المعتمد. يقوم الفاحص الإكلينيكي المرخص برصد الدرجات وتفريغها في هذه المنصة لحساب المعايير السيكومترية واستخراج التقرير وتصميم الخطة الفردية (IEP).
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div className="p-2.5 rounded-lg border bg-white border-teal-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200">
                <strong>المؤلف الأصلي:</strong> {GARS3_COPYRIGHT_INFO.authorAr} ({GARS3_COPYRIGHT_INFO.authorEn})
              </div>
              <div className="p-2.5 rounded-lg border bg-white border-teal-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200">
                <strong>الناشر التجاري الأصلي:</strong> {GARS3_COPYRIGHT_INFO.publisherAr}
              </div>
              <div className="p-2.5 rounded-lg border bg-white border-teal-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200">
                <strong>المرجعية التشخيصية:</strong> {GARS3_COPYRIGHT_INFO.standardsReference}
              </div>
              <div className="p-2.5 rounded-lg border bg-white border-teal-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200">
                <strong>الفئة المستهدفة:</strong> {GARS3_COPYRIGHT_INFO.targetAge}
              </div>
            </div>
            <div className="text-xs p-2.5 rounded-lg bg-teal-100/60 dark:bg-slate-800/70 text-teal-900 dark:text-slate-300 border border-teal-200 dark:border-slate-700">
              {GARS3_COPYRIGHT_INFO.notice}
              <br />
              <strong>{GARS3_COPYRIGHT_INFO.disclaimer}</strong>
            </div>
          </div>
        )}

        {/* Real-time Psychometrics & Diagnostic Strip */}
        <div
          className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-between gap-3 flex-wrap shrink-0"
        >
          {/* Key Clinical Metrics */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Autism Quotient (AQ) Hero Pill */}
            <div className="bg-white dark:bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-teal-500/30 dark:border-teal-500/40 shadow-xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                AQ
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium leading-none mb-0.5">
                  معامل التوحد (AQ):
                </span>
                <div className="flex items-baseline gap-1.5 leading-none">
                  <span className="text-lg font-black" style={{ color: psychometrics.severityColor }}>
                    {psychometrics.autismQuotient}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    (مئيني: {psychometrics.overallPercentile}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Sum of Scaled Scores */}
            <div className="bg-white dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-2">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium leading-none mb-0.5">
                  مجموع المعيارية:
                </span>
                <span className="text-sm font-extrabold text-teal-700 dark:text-teal-300">
                  {psychometrics.sumScaledScores} <span className="text-[10px] font-normal text-slate-400">/ {form.isVerbal ? '120' : '80'}</span>
                </span>
              </div>
            </div>

            {/* Diagnosis Result Badge */}
            <div
              className="px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-xs"
              style={{
                backgroundColor: `${psychometrics.severityColor}10`,
                borderColor: `${psychometrics.severityColor}35`,
              }}
            >
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">التشخيص:</span>
              <span className="text-xs font-black" style={{ color: psychometrics.severityColor }}>
                {psychometrics.probability} · {psychometrics.dsm5Level}
              </span>
            </div>
          </div>

          {/* Segmented Mode Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Input Mode Switcher */}
            <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs flex items-center gap-1">
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  form.inputMode === 'subscales'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:dark:text-white'
                }`}
                onClick={() => setForm(f => ({ ...f, inputMode: 'subscales' }))}
              >
                🧮 حاسبة الدرجات الخام
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  form.inputMode === 'items'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:dark:text-white'
                }`}
                onClick={() => setForm(f => ({ ...f, inputMode: 'items' }))}
              >
                📋 تفريغ بنود الكراسة
              </button>
            </div>

            {/* Verbal Format Switcher */}
            <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs flex items-center gap-1">
              <button
                type="button"
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  form.isVerbal
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:dark:text-white'
                }`}
                onClick={() => setForm(f => ({ ...f, isVerbal: true }))}
                title="تطبيق الـ 6 مقاييس الفرعية"
              >
                🗣️ ناطق (6)
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  !form.isVerbal
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:dark:text-white'
                }`}
                onClick={() => setForm(f => ({ ...f, isVerbal: false }))}
                title="تطبيق الـ 4 مقاييس الفرعية الأساسية"
              >
                🤫 غير ناطق (4)
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. Student & Assessment Info Card */}
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

                {/* ROW 1: Clinical Essentials */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 8,
                  }}
                >
                  {/* 1. Student Picker */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الطالب / المفحوص <span className="req">*</span></label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">-- اختر طالباً مسجلاً في المركز --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code || s.id})</option>
                      ))}
                      <option value="__other__">➕ مفحوص خارجي / غير مسجل في المركز</option>
                    </select>
                  </div>

                  {/* 2. Assessment Date */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>تاريخ التقييم السريري <span className="req">*</span></label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="date"
                      value={form.date || ''}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>

                  {/* 3. Age */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>العمر الزمني</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      readOnly={!isManualEdit && form.mode === 'registered'}
                      placeholder="العمر الزمني للطفل"
                      value={form.age || ''}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    />
                  </div>

                  {/* 4. Examiner */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الأخصائي الفاحص</label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    >
                      <option value="">-- اختر الفاحص --</option>
                      {emps.map(emp => (
                        <option key={emp.id} value={emp.name}>{emp.name} ({emp.role || 'أخصائي'})</option>
                      ))}
                      {currentUser?.name && !emps.some(e => e.name === currentUser.name) && (
                        <option value={currentUser.name}>{currentUser.name}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* ROW 2: Respondents and Format */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 8,
                  }}
                >
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المستجيب (ولي الأمر / المعلم)</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم المستجيب على المقياس"
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صلة القرابة / دور المستجيب</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="الأم، الأب، معلم التربية الخاصة..."
                      value={form.raterRelation || ''}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>مدة معرفة المستجيب بسلوك الطفل</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="مثال: سنتان، منذ الولادة، عام دراسي..."
                      value={form.relationshipDuration || ''}
                      onChange={e => setForm(f => ({ ...f, relationshipDuration: e.target.value }))}
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صيغة التطبيق</label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.isVerbal ? 'verbal' : 'nonverbal'}
                      onChange={e => setForm(f => ({ ...f, isVerbal: e.target.value === 'verbal' }))}
                    >
                      <option value="verbal">🗣️ أطفال ناطقين (6 مقاييس فرعية)</option>
                      <option value="nonverbal">🤫 أطفال غير ناطقين (4 مقاييس فرعية)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. MODE A: DIRECT RAW SUBSCALE SCORE CALCULATOR */}
          {form.inputMode === 'subscales' ? (
            <div className="mb-6">
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm">
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl shrink-0">
                      🧮
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 m-0">
                        حاسبة الدرجات الخام للمقاييس الفرعية (GARS-3 Subscale Psychometrics)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 leading-relaxed">
                        أدخل مجموع الدرجات الخام المستخرجة من كراسة الاستجابة الورقية الرسمية لحساب الدرجات المعيارية ومعامل التوحد (AQ) آلياً
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-xs btn-g"
                      onClick={() => autoFillSample('mild')}
                    >
                      ⚡ تجربة (طيف خفيف)
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-g"
                      onClick={() => autoFillSample('moderate')}
                    >
                      ⚡ تجربة (طيف متوسط)
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-g"
                      onClick={() => autoFillSample('severe')}
                    >
                      ⚡ تجربة (طيف شديد)
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-g text-slate-500 dark:text-slate-400"
                      onClick={resetScores}
                      title="تصفير الدرجات"
                    >
                      ↺ تصفير
                    </button>
                  </div>
                </div>

                {/* Real-time Subscales Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 mt-5">
                  {displayedDomains.map(dom => {
                    const currentRaw = form.domainRawScores[dom.id] !== undefined ? form.domainRawScores[dom.id] : '';
                    const numRaw = Number(currentRaw) || 0;
                    const result = psychometrics.domainResults.find(d => d.id === dom.id);
                    const scaledScore = result?.scaledScore ?? '—';
                    const percentile = result?.percentile ?? '—';
                    const isOpenAcc = !!openAccordions[dom.id];
                    const percentFill = Math.min(100, Math.round((numRaw / dom.maxRawScore) * 100));

                    return (
                      <div
                        key={dom.id}
                        className="bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white hover:dark:bg-slate-800/90 rounded-xl p-4 sm:p-4.5 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden group"
                      >
                        {/* Top accent line */}
                        <div
                          className="absolute top-0 right-0 left-0 h-1 transition-all group-hover:h-1.5"
                          style={{ backgroundColor: dom.color }}
                        />

                        {/* Card Top: Code badge, Domain Name, Scaled Score Pill */}
                        <div className="flex items-start justify-between gap-3 pt-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded-md text-[11px] font-black"
                                style={{
                                  backgroundColor: `${dom.color}15`,
                                  color: dom.color,
                                }}
                              >
                                {dom.code}
                              </span>
                              <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate block">
                                {dom.name}
                              </strong>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-0">
                              {dom.itemsCount} فقرة بالكراسة · الدرجة القصوى ({dom.maxRawScore})
                            </p>
                          </div>

                          {/* Standard Scaled Score Metric Chip */}
                          <div className="bg-white dark:bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-center shrink-0 shadow-2xs min-w-[70px]">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                              معيارية (1-20)
                            </span>
                            <span
                              className="text-base font-black leading-tight block"
                              style={{ color: dom.color }}
                            >
                              {scaledScore}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              مئيني {percentile}%
                            </span>
                          </div>
                        </div>

                        {/* Score Stepper & Progress Engine */}
                        <div className="bg-white dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/70">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            <span>الدرجة الخام المستخرجة:</span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                              {numRaw} / {dom.maxRawScore}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => stepDomainRaw(dom.id, -1)}
                              disabled={numRaw <= 0}
                              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:dark:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-base transition-colors"
                              title="إنقاص درجة"
                            >
                              −
                            </button>

                            <input
                              type="number"
                              min="0"
                              max={dom.maxRawScore}
                              className="flex-1 h-9 bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg text-center font-mono text-base font-black focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                              placeholder="0"
                              value={currentRaw}
                              onChange={e => handleDomainRawChange(dom.id, e.target.value)}
                            />

                            <button
                              type="button"
                              onClick={() => stepDomainRaw(dom.id, 1)}
                              disabled={numRaw >= dom.maxRawScore}
                              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:dark:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-base transition-colors"
                              title="زيادة درجة"
                            >
                              +
                            </button>
                          </div>

                          {/* Subtle Range Progress Bar */}
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2.5">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${percentFill}%`,
                                backgroundColor: dom.color,
                              }}
                            />
                          </div>
                        </div>

                        {/* Accordion Toggle for IEP Target & Clinical Description */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => toggleAccordion(dom.id)}
                            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 py-1 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span>🎯</span>
                              <span className="truncate">هدف الخطة (IEP) والوصف الإكلينيكي</span>
                            </span>
                            <span className="shrink-0 text-slate-400">
                              {isOpenAcc ? '▲' : '▼'}
                            </span>
                          </button>

                          {isOpenAcc && (
                            <div className="mt-2 p-2.5 bg-white dark:bg-slate-900/80 rounded-lg border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                              <div>
                                <strong className="text-slate-700 dark:text-slate-200">الوصف:</strong> {dom.description}
                              </div>
                              <div className="text-teal-700 dark:text-teal-400">
                                <strong>هدف الخطة الفردية (IEP):</strong> {dom.iepTargetArea}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* MODE B: RESPONSE CODES / RECORDING SHEET ENTRY (BY ITEM ID NUMBER ONLY) */
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  📑 كشف تفريغ أرقام بنود الاستجابة (وفق كراسة الفاحص):
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  تفريغ الاستجابات: 0 (أبداً)، 1 (نادراً)، 2 (أحياناً)، 3 (كثيراً جداً)
                </div>
              </div>

              {/* Subscale Navigation Tabs */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
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
                      {dom.name} ({domStat?.answeredCount || 0}/{dom.itemsCount})
                    </button>
                  );
                })}
              </div>

              {/* Items Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                        borderRadius: 8,
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
                        <span
                          style={{
                            background: domain?.color || 'var(--pr)',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.74rem',
                            padding: '3px 8px',
                            borderRadius: 6,
                          }}
                        >
                          بند #{item.id} · {domain?.code}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            استجابة كراسة GARS-3 لبند رقم ({item.id}) — {domain?.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                            راجع كراسة التقدير المعتمدة لرصد السلوك المقابل
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {GARS3_RESPONSE_OPTIONS.map(opt => {
                          const isSelected = currentScore === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleScoreSelect(item.id, opt.value)}
                              className={`btn btn-xs ${isSelected ? 'btn-p' : 'btn-g'}`}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.74rem',
                                fontWeight: isSelected ? 800 : 500,
                                background: isSelected
                                  ? (opt.value === 3 ? '#dc2626' : opt.value === 2 ? '#ea580c' : opt.value === 1 ? '#0284c7' : '#059669')
                                  : undefined,
                                color: isSelected ? '#fff' : undefined,
                                border: isSelected ? 'none' : undefined,
                              }}
                            >
                              {opt.label} {isSelected && '✓'}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ width: '100%', marginTop: 4 }}>
                        <input
                          type="text"
                          placeholder="ملاحظة الأخصائي على هذا البند (اختياري)..."
                          value={currentNote}
                          onChange={e => handleItemNoteChange(item.id, e.target.value)}
                          style={{
                            fontSize: '0.74rem',
                            padding: '3px 8px',
                            borderRadius: 4,
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
            </div>
          )}

          {/* 3. Diagnostic Summary & IEP Recommendations */}
          <div style={{ background: 'var(--g0)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', marginTop: 10 }}>
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
                ✨ توليد الخلاصة بناءً على الدرجات السيكومترية
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
            <div style={{ fontSize: '0.82rem', color: '#0f766e', fontWeight: 800 }}>
              معامل التوحد (AQ): <strong>{psychometrics.autismQuotient}</strong> | الرتبة المئينية: <strong>{psychometrics.overallPercentile}%</strong>
            </div>
            <span className={`bdg ${psychometrics.severityKey === 'severe' ? 'b-rd' : psychometrics.severityKey === 'moderate' ? 'b-or' : psychometrics.severityKey === 'mild' ? 'b-bl' : 'b-gr'}`} style={{ fontSize: '0.72rem' }}>
              {psychometrics.probability}
            </span>
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
