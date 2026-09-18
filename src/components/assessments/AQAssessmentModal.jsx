import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  AQ_ITEMS,
  AQ_DOMAINS,
  AQ_RESPONSE_OPTIONS,
  AQ_COPYRIGHT_INFO,
  calculateAQPsychometrics,
} from '../../data/aqData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_AQ_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  gender: 'ذكر',
  grade: '',
  school: '',
  version: 'child', // 'child' (4-11y) or 'adolescent' (12-16y)
  raterName: '',
  raterRelation: 'الأم',
  relationshipDuration: 'سنتان',
  examinerName: '',
  examinerRole: 'أخصائي نفسي / تشخيص وتعديل سلوك',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function AQAssessmentModal({
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
        ...EMPTY_AQ_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
        version: initialData.version || initialData.aqVersion || 'child',
      };
    }
    return {
      ...EMPTY_AQ_FORM,
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
    const stu = students.find(s => String(s.id) === String(val));
    if (!stu) {
      setForm(f => ({ ...f, mode: 'registered', stuId: '', studentName: '' }));
      return;
    }

    const valErr = validateStudentPick(stu);
    if (valErr) {
      toast?.(valErr, 'er');
      return;
    }

    const calculatedAge = stu.dob ? calcAge(stu.dob) : '';
    const ageNum = parseInt(calculatedAge || stu.age || '0', 10);
    const suggestedVersion = !isNaN(ageNum) && ageNum >= 12 ? 'adolescent' : 'child';

    setForm(f => ({
      ...f,
      mode: 'registered',
      stuId: stu.id,
      studentName: stu.name || '',
      dob: stu.dob || '',
      diagnosis: stu.diagnosis || stu.disabilityType || 'اشتباه طيف توحد',
      age: calculatedAge || stu.age || '',
      gender: stu.gender || 'ذكر',
      grade: stu.grade || stu.className || '',
      school: stu.school || stu.schoolName || '',
      version: suggestedVersion,
    }));
  }

  // Real-time Psychometrics Calculation
  const psychometrics = useMemo(() => {
    return calculateAQPsychometrics(form.scores, form.version);
  }, [form.scores, form.version]);

  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return AQ_ITEMS;
    return AQ_ITEMS.filter(it => it.domainId === activeDomainFilter);
  }, [activeDomainFilter]);

  if (!isOpen) return null;

  function handleAnswer(itemId, answerValue) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: answerValue,
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

  function autoFillSample(type = 'autistic') {
    const scores = {};
    AQ_ITEMS.forEach(it => {
      if (type === 'autistic') {
        // High traits: score on almost all items
        scores[it.id] = it.keying === 'AGREE' ? 'def_agree' : 'def_disagree';
      } else if (type === 'typical') {
        // Typical: no trait points
        scores[it.id] = it.keying === 'AGREE' ? 'def_disagree' : 'def_agree';
      } else {
        // Borderline / Moderate
        if (it.id % 2 === 0) {
          scores[it.id] = it.keying === 'AGREE' ? 'slight_agree' : 'slight_disagree';
        } else {
          scores[it.id] = it.keying === 'AGREE' ? 'slight_disagree' : 'slight_agree';
        }
      }
    });

    setForm(prev => ({ ...prev, scores }));
    toast?.(
      `✨ تمت التعبئة السريعة للنموذج (${type === 'autistic' ? 'سمات توحد مرتفعة' : type === 'typical' ? 'أداء نمطي سليم' : 'حالة حدية'})`,
      'ok'
    );
  }

  function handleReset() {
    if (window.confirm('هل تريد حقاً مسح كافة إجابات الاستبيان والبدء من جديد؟')) {
      setForm(f => ({ ...f, scores: {}, itemNotes: {} }));
      toast?.('تمت إعادة ضبط النموذج', 'ok');
    }
  }

  function handleGenerateSummary() {
    const domainDetails = psychometrics.domainBreakdown
      .map(d => `• ${d.name}: ${d.rawScore} / 10 (${d.level})`)
      .join('\n');

    const suggestedSummary =
      `تقرير الفرز والتقييم الإكلينيكي لمقياس طيف التوحد للأطفال واليافعين (AQ):\n` +
      `------------------------------------------------------------------------\n` +
      `المفحوص: ${form.studentName || '—'} | العمر الزمني: ${form.age || '—'} | النسخة: ${form.version === 'adolescent' ? 'نسخة اليافعين (12–16 سنة)' : 'نسخة الأطفال (4–11 سنة)'}\n` +
      `الدرجة الكلية لمعامل التوحد (AQ Score): [${psychometrics.totalScore} من 50] | عتبة القطع الإكلينيكية المعتمدة: [≥ 30]\n` +
      `حالة عتبة القطع: [${psychometrics.isAboveCutoff ? 'تجاوز عتبة القطع الإكلينيكية (مؤشر إيجابي دال)' : 'أقل من عتبة القطع (ضمن النطاق الطبيعي)'}]\n` +
      `مستوى الشدة والخطورة: [${psychometrics.severityLabel} — مستوى خطورة: ${psychometrics.riskLevel}]\n` +
      `عدد البنود الدالة على سمات الطيف: [${psychometrics.flaggedItems.length} بنداً من أصل 50]\n\n` +
      `الأداء التفصيلي على الأبعاد المعرفية والسلوكية الخمسة:\n${domainDetails}\n\n` +
      `البيان الإكلينيكي:\n${psychometrics.clinicalSummary}`;

    const suggestedRecs = psychometrics.severityKey === 'high'
      ? '1. إحالة المفحوص لإجراء تقييم تشخيصي شامل ومعمق متعدد التخصصات (نفسي، تخاطبي، وظيفي) لتأكيد التشخيص السريري.\n' +
        '2. إعداد خطة تربوية وتأهيلية فردية (IEP) تركز على تنمية المهارات الاجتماعية والتواصل التبادلي والمرونة السلوكية.\n' +
        '3. إلحاق المفحوص ببرنامج تدريب على المهارات الاجتماعية (Social Skills Group) لتعزيز قراءة الإيماءات ونبرات الصوت والتفاعل مع الأقران.\n' +
        '4. استخدام الجداول البصرية واستراتيجيات التهيئة المسبقة لتسهيل الانتقال بين الأنشطة وتقليل القلق المرتبط بتغير الروتين.\n' +
        '5. برنامج دعم وإرشاد أسري وتنسيق مستمر مع البيئة المدرسية لتعميم الاستراتيجيات السلوكية والتكيفية.'
      : psychometrics.severityKey === 'borderline'
      ? '1. متابعة الملاحظة السريرية وتقديم الدعم الموجه في الأبعاد التي أظهرت درجات مرتفعة (خاصة المرونة والتواصل).\n' +
        '2. تصميم أنشطة صفية ومنزلية تعزز التفاعل الاجتماعي غير الرسمي وتدعم مهارات حل المشكلات الاجتماعية.\n' +
        '3. إعادة تطبيق المقياس بعد 6 أشهر لرصد أي تغيرات في الأداء السلوكي والتكيفي.'
      : '1. نتائج المقياس تقع ضمن النطاق النمائي الطبيعي ولا تظهر مؤشرات دالة على اضطراب طيف التوحد في الوقت الراهن.\n' +
        '2. الاستمرار في تعزيز وتنمية المهارات النمائية واللغوية والاجتماعية في البيئة الطبيعية والصفية.\n' +
        '3. المتابعة الدورية في حال ظهور أي ملاحظات سلوكية أو تواصلية مستقبلاً.';

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast?.('✨ تم توليد الخلاصة التشخيصية الشاملة والتوصيات المعتمدة بنجاح', 'ok');
  }

  function handleSave() {
    if (!form.studentName || !form.studentName.trim()) {
      toast?.('⚠️ يرجى اختيار الطالب أو كتابة اسم المفحوص أولاً', 'er');
      return;
    }

    if (!form.date) {
      toast?.('⚠️ يرجى إدخال تاريخ التقييم', 'er');
      return;
    }

    if (psychometrics.answeredCount < 50) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.answeredCount} من أصل 50 بنداً. هل تود حفظ المقياس كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      id: initialData?.id || uid('aq'),
      measureId: 'aq',
      measureName: `مقياس طيف التوحد للأطفال واليافعين (AQ) — ${form.version === 'adolescent' ? 'نسخة اليافعين' : 'نسخة الأطفال'}`,
      scaleId: 'aq',
      scaleType: 'aq',
      category: 'autism_spectrum',
      categoryName: 'اضطراب طيف التوحد والنمو الشامل',
      version: form.version,
      versionLabel: form.version === 'adolescent' ? 'نسخة اليافعين (12–16 سنة)' : 'نسخة الأطفال (4–11 سنة)',
      score: psychometrics.totalScore,
      rawScore: psychometrics.totalScore,
      totalScore: psychometrics.totalScore,
      maxScore: 50,
      cutoff: psychometrics.cutoffScore,
      isAboveCutoff: psychometrics.isAboveCutoff,
      percentage: Math.round((psychometrics.answeredCount / 50) * 100),
      level: psychometrics.severityLabel,
      severityLevel: psychometrics.severityLabel,
      severityKey: psychometrics.severityKey,
      severityColor: psychometrics.severityColor,
      riskLevel: psychometrics.riskLevel,
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      domainScores: psychometrics.domainScores,
      domainBreakdown: psychometrics.domainBreakdown,
      psychometrics,
      clinicalSummary: form.clinicalSummary || psychometrics.clinicalSummary,
      recommendations: form.recommendations,
      author: AQ_COPYRIGHT_INFO.authorsAr,
      publisher: AQ_COPYRIGHT_INFO.publisherAr,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      lsUpd('assessments', initialData.id, payload);
      toast?.('✅ تم تحديث تقييم مقياس طيف التوحد (AQ) بنجاح', 'ok');
    } else {
      payload.createdAt = new Date().toISOString();
      lsAdd('studentAssessments', payload);
      lsAdd('assessments', payload);
      toast?.('✅ تم حفظ تطبيق مقياس طيف التوحد (AQ) بنجاح في السجل الإكلينيكي', 'ok');
    }

    if (onSaved) onSaved(payload);
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
            background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #0d9488 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🧠</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس طيف التوحد للأطفال واليافعين (AQ)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  50 بنداً استقصائياً · 5 أبعاد معرفية وسلوكية ({form.version === 'adolescent' ? 'نسخة اليافعين 12–16 سنة' : 'نسخة الأطفال 4–11 سنة'})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#022c22', color: '#a7f3d0', fontSize: '0.68rem', fontWeight: 800 }}>
                  © Cambridge Autism Research Centre (ARC) / Prof. Simon Baron-Cohen
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Autism Spectrum Quotient — الأداة الإكلينيكية المعيارية المفتوحة لفرز وتقدير سمات طيف التوحد ومتلازمة أسبرجر
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
                color: showCopyrightDetails ? '#065f46' : '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء حقوق الاعتماد' : 'حقوق الملكية والاعتماد العلمي'}
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
              background: '#ecfdf5',
              padding: '14px 20px',
              borderBottom: '2px solid #6ee7b7',
              fontSize: '0.82rem',
              color: '#064e3b',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد السيكومتري لمقياس AQ:
            </div>

            <div
              style={{
                background: '#d1fae5',
                border: '1px solid #a7f3d0',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#065f46',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار الترخيص المفتوح (Creative Commons / Open Access):</strong> مقياس AQ متاح للفرز السريري والبحث العلمي بدون رسوم تجارية من مركز أبحاث التوحد بجامعة كامبريدج بقيادة البروفيسور سيمون بارون-كوهين.
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#a7f3d0', color: '#064e3b', padding: '3px 8px', borderRadius: 6, border: '1px solid #6ee7b7', fontWeight: 700 }}>
                مفتوح الاستخدام الإكلينيكي المعتمد
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>المؤلفون:</strong> {AQ_COPYRIGHT_INFO.authorsAr} ({AQ_COPYRIGHT_INFO.authorsEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>الجهة المعتمدة:</strong> {AQ_COPYRIGHT_INFO.publisherAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>الفئات المستهدفة:</strong> {AQ_COPYRIGHT_INFO.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>عتبة القطع السريرية:</strong> الدرجة الكلية ≥ 30 تدل على وجود سمات توحد دالة سريرياً
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#065f46', background: '#d1fae5', padding: '8px 12px', borderRadius: 8 }}>
              {AQ_COPYRIGHT_INFO.licensingNotice}
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
            {/* Total AQ Score Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.isAboveCutoff ? '#dc2626' : '#059669'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>معامل طيف التوحد (AQ):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.totalScore} <small style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>/ 50</small>
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                (عتبة القطع: ≥ 30)
              </span>
            </div>

            {/* Cut-off Status */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>عتبة الفرز التشخيصي:</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: psychometrics.isAboveCutoff ? '#dc2626' : '#059669' }}>
                {psychometrics.isAboveCutoff ? 'تجاوز عتبة القطع ⚠️' : 'أقل من عتبة القطع ✅'}
              </span>
            </div>

            {/* Version Toggle */}
            <div style={{ background: 'var(--bg-card)', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>النسخة:</span>
              <button
                type="button"
                className={`btn btn-xs ${form.version === 'child' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setForm(f => ({ ...f, version: 'child' }))}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: form.version === 'child' ? 800 : 500,
                  background: form.version === 'child' ? '#047857' : undefined,
                  color: form.version === 'child' ? '#fff' : undefined,
                  border: form.version === 'child' ? 'none' : undefined,
                }}
              >
                🧒 الأطفال (4–11)
              </button>
              <button
                type="button"
                className={`btn btn-xs ${form.version === 'adolescent' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setForm(f => ({ ...f, version: 'adolescent' }))}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: form.version === 'adolescent' ? 800 : 500,
                  background: form.version === 'adolescent' ? '#065f46' : undefined,
                  color: form.version === 'adolescent' ? '#fff' : undefined,
                  border: form.version === 'adolescent' ? 'none' : undefined,
                }}
              >
                🧑‍🎓 اليافعين (12–16)
              </button>
            </div>

            {/* Diagnosis Result Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>التصنيف والشدة:</span>
              <span className={`bdg ${psychometrics.severityKey === 'high' ? 'b-rd' : psychometrics.severityKey === 'borderline' ? 'b-or' : 'b-gr'}`} style={{ fontWeight: 800, fontSize: '0.78rem' }}>
                {psychometrics.severityLabel}
              </span>
            </div>

            {/* Quick Fill Actions */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => autoFillSample('autistic')}
                style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: 700, fontSize: '0.72rem', padding: '3px 7px' }}
                title="تعبئة سريعة لحالة تظهر سمات طيف توحد مرتفعة"
              >
                ⚡ سمات مرتفعة
              </button>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => autoFillSample('borderline')}
                style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontWeight: 700, fontSize: '0.72rem', padding: '3px 7px' }}
                title="تعبئة سريعة لحالة حدية"
              >
                ⚡ حدية
              </button>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => autoFillSample('typical')}
                style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', fontWeight: 700, fontSize: '0.72rem', padding: '3px 7px' }}
                title="تعبئة سريعة لأداء نمطي سليم"
              >
                ⚡ نمطي
              </button>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={handleReset}
                style={{ fontSize: '0.72rem', padding: '3px 7px' }}
                title="مسح كافة الإجابات"
              >
                🗑️ تفريغ
              </button>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {psychometrics.answeredCount} / 50 بنداً
              </span>
              <div style={{ width: 60, height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(psychometrics.answeredCount / 50) * 100}%`,
                    height: '100%',
                    background: psychometrics.answeredCount === 50 ? 'var(--ok)' : '#059669',
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
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>👦</span>
                <span>بيانات المفحوص والاستمارة السريرية</span>
                {form.studentName && (
                  <span
                    style={{
                      fontSize: '0.76rem',
                      background: '#d1fae5',
                      color: '#065f46',
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
                      placeholder="مثال: اشتباه طيف توحد، متلازمة أسبرجر..."
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

                  {/* 3. Scale Version */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>نسخة المقياس المعتمدة</label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px', fontWeight: 700, color: '#065f46' }}
                      value={form.version}
                      onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                    >
                      <option value="child">🧒 نسخة الأطفال (4–11 سنة - AQ-Child)</option>
                      <option value="adolescent">🧑‍🎓 نسخة اليافعين (12–16 سنة - AQ-Adolescent)</option>
                    </select>
                  </div>

                  {/* 4. Relationship / Role */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صلة القرابة / معرفة السلوك</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="مثال: الأم، الأب، معلم التربية الخاصة..."
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
                📑 أبعاد مقياس AQ الخمسة (Autism Spectrum Quotient Dimensions):
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                اختر: (أوافق بشدة)، (أوافق قليلاً)، (لا أوافق قليلاً)، (لا أوافق بشدة)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeDomainFilter === 'all' ? 'on' : ''}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع البنود (50)
              </button>
              {AQ_DOMAINS.map(dom => {
                const domStat = psychometrics.domainBreakdown.find(d => d.id === dom.id);
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
                    {dom.name} ({domStat?.answeredCount || 0}/10)
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const currentVal = form.scores[item.id];
              const isAnswered = Boolean(currentVal);
              const domain = AQ_DOMAINS.find(d => d.id === item.domainId);
              const note = form.itemNotes[item.id] || '';

              // check if this answer awarded an autistic trait point
              const isAgree = currentVal === 'def_agree' || currentVal === 'slight_agree';
              const isDisagree = currentVal === 'def_disagree' || currentVal === 'slight_disagree';
              const isTrait = (item.keying === 'AGREE' && isAgree) || (item.keying === 'DISAGREE' && isDisagree);

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: isTrait
                      ? '1.5px solid #f87171'
                      : isAnswered
                      ? '1px solid var(--border-color, #cbd5e1)'
                      : '1px dashed var(--border-color, #cbd5e1)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    boxShadow: isTrait ? '0 2px 8px rgba(239, 68, 68, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: domain?.bgLight || '#f1f5f9',
                          color: domain?.color || '#334155',
                          fontWeight: 900,
                          fontSize: '.82rem',
                          flexShrink: 0,
                          border: `1px solid ${domain?.borderColor || '#cbd5e1'}`,
                        }}
                      >
                        {item.id}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', lineHeight: 1.5 }}>
                          {item.textAr}
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-sub, #94a3b8)', direction: 'ltr', textAlign: 'right', marginTop: 2 }}>
                          {item.textEn}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '.68rem',
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: domain?.bgLight,
                          color: domain?.color,
                          fontWeight: 700,
                          border: `1px solid ${domain?.borderColor || '#cbd5e1'}`,
                        }}
                      >
                        {domain?.name}
                      </span>
                      {isTrait && (
                        <span
                          style={{
                            fontSize: '.68rem',
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: '#fee2e2',
                            color: '#991b1b',
                            fontWeight: 800,
                            border: '1px solid #fecaca',
                          }}
                        >
                          +1 سمة طيف
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4-POINT LIKERT OPTIONS */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {AQ_RESPONSE_OPTIONS.map(opt => {
                      const isSelected = currentVal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleAnswer(item.id, opt.value)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            fontSize: '.8rem',
                            fontWeight: isSelected ? 800 : 600,
                            cursor: 'pointer',
                            border: isSelected
                              ? '2px solid #047857'
                              : '1px solid var(--border-color, #e2e8f0)',
                            background: isSelected ? '#ecfdf5' : 'var(--bg-main, #f8fafc)',
                            color: isSelected ? '#065f46' : 'var(--text-main, #475569)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{opt.label}</span>
                          <span style={{ fontSize: '.65rem', opacity: 0.7, direction: 'ltr' }}>{opt.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ITEM NOTE INPUT */}
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      value={note}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      placeholder="ملاحظات سريرية أو شواهد سلوكية على هذا البند (اختياري)..."
                      style={{
                        width: '100%',
                        fontSize: '.75rem',
                        padding: '4px 8px',
                        background: 'var(--bg-main, #f8fafc)',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        borderRadius: 6,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. DOMAIN PROFILE SCOREBOARD VISUALIZER */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 16,
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text-main, #1e293b)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📊</span>
              <span>الملف السيكومتري للأبعاد المعرفية والسلوكية الخمسة (AQ Profile):</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {psychometrics.domainBreakdown.map(d => (
                <div
                  key={d.id}
                  style={{
                    background: d.bgLight,
                    border: `1px solid ${d.borderColor}`,
                    borderRadius: 8,
                    padding: '8px 12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.76rem', fontWeight: 800 }}>
                    <span style={{ color: d.color }}>{d.name}</span>
                    <span style={{ color: '#0f172a' }}>{d.rawScore} / 10 ({d.percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 999, overflow: 'hidden', margin: '6px 0 4px 0' }}>
                    <div
                      style={{
                        width: `${d.percentage}%`,
                        height: '100%',
                        background: d.color,
                        borderRadius: 999,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '.68rem', color: d.levelColor, fontWeight: 700 }}>
                    {d.level}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. CLINICAL SUMMARY & RECOMMENDATIONS TEXTAREAS */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: 12,
              padding: '14px 18px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text-main, #1e293b)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span>
                <span>التقرير الإكلينيكي والتوصيات التأهيلية المعتمدة:</span>
              </div>
              <button
                type="button"
                className="btn btn-xs"
                onClick={handleGenerateSummary}
                style={{
                  background: '#047857',
                  color: '#fff',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                }}
              >
                ✨ توليد الخلاصة السريرية والتوصيات تلقائياً
              </button>
            </div>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fl">
                <label style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: 4 }}>الملخص التشخيصي السريري</label>
                <textarea
                  rows={4}
                  value={form.clinicalSummary || psychometrics.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="سيتم توليد الخلاصة السريرية تلقائياً بناءً على الدرجة الكلية وعتبة القطع..."
                  style={{ fontSize: '.82rem', padding: '8px', width: '100%', lineHeight: 1.5 }}
                />
              </div>

              <div className="fl">
                <label style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: 4 }}>التوصيات والإحالات الموصى بها</label>
                <textarea
                  rows={4}
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="مثال: إحالة لتقييم تشخيصي شامل، جلسات تنمية مهارات اجتماعية، تدريب المرونة السلوكية..."
                  style={{ fontSize: '.82rem', padding: '8px', width: '100%', lineHeight: 1.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="mft modal-footer-custom"
          style={{
            padding: '12px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: '.84rem', color: 'var(--text-sub)' }}>
            الدرجة الكلية: <strong style={{ color: psychometrics.severityColor, fontSize: '1.1rem' }}>{psychometrics.totalScore}/50</strong> • النتيجة: <strong style={{ color: psychometrics.isAboveCutoff ? '#dc2626' : '#059669' }}>{psychometrics.isAboveCutoff ? 'تجاوز عتبة القطع (مؤشر إيجابي لسمات التوحد)' : 'ضمن النطاق الطبيعي'}</strong>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={handleSafeClose}
              style={{ fontWeight: 700, padding: '8px 16px' }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-pr"
              onClick={handleSave}
              style={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                borderColor: '#047857',
                padding: '8px 24px',
                color: '#fff',
              }}
            >
              💾 حفظ التقييم الإكلينيكي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
