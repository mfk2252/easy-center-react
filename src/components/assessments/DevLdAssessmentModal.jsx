import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  DEV_LD_ITEMS,
  DEV_LD_DOMAINS,
  DEV_LD_RESPONSE_OPTIONS,
  DEV_LD_COPYRIGHT_INFO,
  calculateDevLdPsychometrics,
} from '../../data/devLdData';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_DEV_LD_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  grade: 'المستوى الثاني روضة (KG2)',
  school: '',
  raterName: '',
  raterRelation: 'معلمة الروضة',
  relationshipDuration: 'عام دراسي كامل بالروضة',
  examinerName: '',
  examinerRole: 'أخصائي نفسي وتربية خاصة وتدخل مبكر',
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
  const { toast, currentUser } = useApp();

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_DEV_LD_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_DEV_LD_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);

  // Psychometrics Calculation
  const psychometrics = useMemo(() => {
    return calculateDevLdPsychometrics(form.scores);
  }, [form.scores]);

  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return DEV_LD_ITEMS;
    return DEV_LD_ITEMS.filter(it => it.domainId === activeDomainFilter);
  }, [activeDomainFilter]);

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

  function autoFillSample(level = 'at_risk') {
    const scores = {};
    DEV_LD_ITEMS.forEach(it => {
      if (level === 'normal') {
        // Mostly 0, few 1s
        scores[it.id] = (it.id % 6 === 0) ? 1 : 0;
      } else if (level === 'at_risk') {
        // ~ 55% score (mostly 1s, some 2s in attention/perception)
        if (it.domainId === 'attention' || it.domainId === 'perception') {
          scores[it.id] = (it.id % 2 === 0) ? 2 : 1;
        } else {
          scores[it.id] = (it.id % 3 === 0) ? 2 : 1;
        }
      } else if (level === 'severe') {
        // ~ 75-80% score (mostly 2s, few 1s)
        scores[it.id] = (it.id % 4 === 0) ? 1 : 2;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم تعبئة استجابات نموذجية (${level === 'normal' ? 'أداء طبيعي' : level === 'at_risk' ? 'معرض لخطر الصعوبات (55%)' : 'صعوبات نمائية مؤكدة (75%)'}) للمعاينة السريعة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 15) {
      toast('⚠️ يرجى تقييم عدد كافٍ من العبارات (15 عبارة على الأقل) لتوليد التقرير التشخيصي', 'er');
      return;
    }

    const domainDetails = psychometrics.domainResults.map(d => {
      return `• ${d.name}: الدرجة الخام (${d.rawScore}/${d.maxScore}) بنسبة (${d.percentage}%) - [${d.domainStatus}]`;
    }).join('\n');

    const pillarsDetails = `1. صعوبات التعلم المعرفية (الانتباه، الإدراك، الذاكرة): ${psychometrics.cognitiveRaw}/${psychometrics.cognitiveMax} (${psychometrics.cognitivePct}%)\n` +
      `2. صعوبات التعلم اللغوية والتفكير: ${psychometrics.langThinkingRaw}/${psychometrics.langThinkingMax} (${psychometrics.langThinkingPct}%)\n` +
      `3. صعوبات التعلم البصرية - الحركية: ${psychometrics.visualMotorRaw}/${psychometrics.visualMotorMax} (${psychometrics.visualMotorPct}%)`;

    const deficitsText = psychometrics.deficitDomains.length > 0
      ? `الأبعاد النمائية التي تظهر قصوراً جوهرياً يستدعي التدخل الفردي المبكر:\n` + psychometrics.deficitDomains.map(d => `- ${d.name} (${d.percentage}%)`).join('\n')
      : 'لا توجد أبعاد تقع في النطاق الحرج الشديد.';

    const suggestedSummary = `تقرير التقييم والتشخيص النمائي - قائمة صعوبات التعلم النمائية لأطفال الروضة:\n` +
      `إعداد: أ.د. عادل عبدالله محمد (جامعة الزقازيق - دار الرشاد) وفق تصنيف كيرك وكالفنت (Kirk & Chalfant):\n\n` +
      `- الدرجة الخام الكلية: (${psychometrics.totalRawScore} من أصل ${psychometrics.totalMaxScore}) بنسبة كلية (${psychometrics.overallPercentage}%).\n` +
      `- النتيجة والتشخيص: [${psychometrics.probability}]\n` +
      `- التفسير الإكلينيكي: ${psychometrics.severityLevel}.\n\n` +
      `توزيع الدرجات على الأبعاد النمائية الثلاثة الكبرى:\n${pillarsDetails}\n\n` +
      `النتائج التفصيلية على المقاييس الفرعية الستة:\n${domainDetails}\n\n` +
      `${deficitsText}\n\n` +
      `الخلاصة:\n` +
      `استناداً إلى معايير القائمة ومحك الـ 50% للفرز الأولي ومحك الـ 70% للتشخيص المؤكد، فإن الطفل يندرج ضمن [${psychometrics.probability}]، مما يبرز أهمية تطبيق برامج التدخل المبكر لتنمية المهارات قبل الأكاديمية وتهيئة الطفل للالتحاق بالمدرسة الابتدائية.`;

    const suggestedRecs = psychometrics.severityKey === 'normal'
      ? '1. استمرار الطفل في الأنشطة النمائية الاعتيادية بالروضة.\n2. إثراء الحصيلة اللغوية والمهارات الحركية الدقيقة من خلال اللعب الهادف.\n3. المتابعة الدورية لملاحظة تطور المهارات قبل الأكاديمية.'
      : psychometrics.severityKey === 'at_risk'
      ? '1. إدراج الطفل في برنامج الفرز والتدخل المبكر والوقائي بالروضة (Tier 2).\n2. تصميم خطة نمائية مساندة تركز على تدريب الانتباه المشترك، التمييز البصري والسمعي، والذاكرة العاملة.\n3. تدريب الطفل على تتبع التسلسل الزمني والمنطقي وحل المتاهات والألغاز البسيطة.\n4. تدريبات التناسق الحركي البصري (مسك القلم، قص الأشكال، التلوين داخل الحدود، التوازن).\n5. إرشاد الأسرة بتطبيق أنشطة التفاعل اللغوي والحسي في المنزل.'
      : '1. وضع خطة تربوية فردية مكثفة للتدخل النمائي المبكر (Intensive Early Intervention IEP) تحت إشراف فريق التربية الخاصة والتشخيص.\n2. تطبيق استراتيجيات التدريس الحواسي المتعدد (VAKT) لتعزيز الذاكرة والإدراك السمعي والبصري.\n3. تخصيص جلسات فردية لتنمية الانتباه والحد من الاندفاعية وفرط الحركة، وجلسات تخاطب لتعزيز النمو اللغوي.\n4. تدريبات علاج وظيفي وحركي لتحسين التآزر الحركي العام والدقيق وتعديل قبضة القلم.\n5. مواءمة البيئة الصفية بالروضة لتخفيف المشتتات وتقديم التعليمات خطوة بخطوة مصحوبة بنماذج بصرية.\n6. المتابعة الأسرية الوثيقة وتقديم الدعم الإرشادي المستمر.';

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية الشاملة وتوصيات التدخل المبكر بنجاح', 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطفل أولاً', 'er');
      return;
    }

    if (!form.date) {
      toast('⚠️ يرجى إدخال تاريخ التقييم', 'er');
      return;
    }

    if (psychometrics.totalAnswered < DEV_LD_ITEMS.length) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.totalAnswered} من أصل ${DEV_LD_ITEMS.length} عبارة. هل تود حفظ القائمة كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'dev_learning_difficulties',
      scaleId: 'dev_learning_difficulties',
      measureName: 'قائمة صعوبات التعلم النمائية لأطفال الروضة',
      scaleName: 'قائمة صعوبات التعلم النمائية لأطفال الروضة - د. عادل عبدالله',
      category: 'learning_academic',
      categoryName: 'صعوبات التعلم النمائية والتدخل المبكر',
      score: psychometrics.totalRawScore,
      maxScore: psychometrics.totalMaxScore,
      percentage: psychometrics.overallPercentage,
      level: psychometrics.probability,
      severityLevel: psychometrics.severityLevel,
      severityKey: psychometrics.severityKey,
      color: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      psychometrics,
      author: DEV_LD_COPYRIGHT_INFO.authorAr,
      publisher: DEV_LD_COPYRIGHT_INFO.publisherAr,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث قائمة صعوبات التعلم النمائية للروضة بنجاح', 'ok');
    } else {
      const newId = uid();
      lsAdd('studentAssessments', {
        ...payload,
        id: newId,
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق قائمة صعوبات التعلم النمائية لأطفال الروضة بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
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
            <span style={{ fontSize: '1.8rem' }}>🌱</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  قائمة صعوبات التعلم النمائية لأطفال الروضة
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  80 عبارة · 6 مقاييس فرعية
                </span>
                <span className="bdg" style={{ background: '#134e4a', color: '#ccfbf1', fontSize: '0.68rem', fontWeight: 800 }}>
                  أ.د. عادل عبدالله محمد · دار الرشاد
                </span>
              </div>
              <span style={{ fontSize: '0.76rem', opacity: 0.95, display: 'block', marginTop: 2 }}>
                كراسة التعليمات والاستجابات المقننة للفرز والتشخيص المبكر لأطفال ما قبل المدرسة (4-6 سنوات)
              </span>
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
              📜 {showCopyrightDetails ? 'إخفاء الأمانة العلمية' : 'بيان الأمانة وحقوق الملكية'}
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700 }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* COPYRIGHT AND INTELLECTUAL PROPERTY BANNER */}
        <div
          style={{
            background: '#f0fdfa',
            borderBottom: '1px solid #ccfbf1',
            padding: '10px 18px',
            fontSize: '0.8rem',
            color: '#115e59',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>⚖️</span>
            <div>
              <strong>إشعار الملكية الفكرية والأمانة العلمية:</strong> قائمة صعوبات التعلم النمائية لأطفال الروضة — إعداد: <b>أ.د. عادل عبدالله محمد</b> (أستاذ ورئيس قسم الصحة النفسية - كلية التربية - جامعة الزقازيق) · الناشر: <b>دار الرشاد / عربية للطباعة والنشر</b>.
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', background: '#ccfbf1', color: '#0f766e', padding: '3px 8px', borderRadius: 6, border: '1px solid #99f6e4', fontWeight: 700 }}>
            مبني على نموذج كيرك وكالفنت (Kirk & Chalfant)
          </span>
        </div>

        {/* EXPANDABLE DETAILED COPYRIGHT NOTICE */}
        {showCopyrightDetails && (
          <div
            style={{
              background: '#f0fdf4',
              padding: '14px 20px',
              borderBottom: '2px solid #5eead4',
              fontSize: '0.82rem',
              color: '#065f46',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> بطاقة التوثيق العلمي والتقنين السيكومتري:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>المؤلف والباحث:</strong> {DEV_LD_COPYRIGHT_INFO.authorAr} ({DEV_LD_COPYRIGHT_INFO.authorTitle})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>جهة النشر:</strong> {DEV_LD_COPYRIGHT_INFO.publisherAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>الفئة المستهدفة:</strong> {DEV_LD_COPYRIGHT_INFO.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>المرجعية النظرية:</strong> {DEV_LD_COPYRIGHT_INFO.theoreticalFramework}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#047857', background: '#d1fae5', padding: '8px 12px', borderRadius: 8 }}>
              {DEV_LD_COPYRIGHT_INFO.notice}
              <br />
              <strong>{DEV_LD_COPYRIGHT_INFO.disclaimer}</strong>
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
            {/* Total Raw Score & Percentage */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.severityColor}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة الكلية والنسبة:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.totalRawScore} <small style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>/ {psychometrics.totalMaxScore}</small>
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: psychometrics.severityColor, marginRight: 4 }}>
                ({psychometrics.overallPercentage}%)
              </span>
            </div>

            {/* Three Pillars Summary */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الأبعاد النمائية الثلاثة:</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                معرفية: <b style={{ color: '#7c3aed' }}>{psychometrics.cognitivePct}%</b> | لغوية/تفكير: <b style={{ color: '#d97706' }}>{psychometrics.langThinkingPct}%</b> | بصرية حركية: <b style={{ color: '#0d9488' }}>{psychometrics.visualMotorPct}%</b>
              </span>
            </div>

            {/* Diagnosis Result Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>التصنيف:</span>
              <span className={`bdg ${psychometrics.severityKey === 'severe' ? 'b-rd' : psychometrics.severityKey === 'at_risk' ? 'b-or' : psychometrics.severityKey === 'mild' ? 'b-bl' : 'b-gr'}`} style={{ fontWeight: 800, fontSize: '0.78rem' }}>
                {psychometrics.probability}
              </span>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {psychometrics.totalAnswered} / {psychometrics.totalItems} عبارة
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

          {/* Quick Actions Strip */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-xs btn-g"
              onClick={() => autoFillSample('at_risk')}
              title="تعبئة نموذج افتراضي لطفل معرض لخطر صعوبات التعلم النمائية (55%)"
            >
              ⚡ تجربة (معرض للخطر 55%)
            </button>
            <button
              type="button"
              className="btn btn-xs btn-p"
              onClick={applyAutoClinicalSummary}
              style={{ fontWeight: 700, background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', color: '#fff', border: 'none' }}
            >
              ✨ توليد التقرير والتوصيات آلياً
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. Student & Assessment Info Card */}
          <div style={{ background: 'var(--g0)', padding: 14, borderRadius: 12, marginBottom: 16, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, marginBottom: 10, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>👦</span> بيانات الطفل ومرحلة الروضة والمستجيب
            </div>
            <div className="fg c3">
              <StudentPicker form={form} setForm={setForm} students={students} emps={emps} showExtra />
              <div className="fl">
                <label>المستوى الدراسي بالروضة</label>
                <input
                  type="text"
                  placeholder="مثال: روضة أولى (KG1) / روضة ثانية (KG2)"
                  value={form.grade || ''}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                />
              </div>
              <div className="fl">
                <label>اسم الروضة / المدرسة</label>
                <input
                  type="text"
                  placeholder="اسم روضة الأطفال الحالية"
                  value={form.school || ''}
                  onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                />
              </div>
              <div className="fl">
                <label>اسم الفاحص / الأخصائي</label>
                <input
                  type="text"
                  value={form.examinerName || ''}
                  onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                />
              </div>
              <div className="fl">
                <label>المستجيب (معلمة الروضة / ولي الأمر)</label>
                <input
                  type="text"
                  placeholder="اسم المعلمة أو القائم بالملاحظة"
                  value={form.raterName || ''}
                  onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                />
              </div>
              <div className="fl">
                <label>الصفة / صلة القرابة</label>
                <select
                  value={form.raterRelation || ''}
                  onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                >
                  <option value="معلمة الروضة (معلمة الفصل)">معلمة الروضة (معلمة الفصل)</option>
                  <option value="أخصائي نفسي وتربية خاصة">أخصائي نفسي وتربية خاصة</option>
                  <option value="أخصائي تدخل مبكر وتخاطب">أخصائي تدخل مبكر وتخاطب</option>
                  <option value="الأم">الأم</option>
                  <option value="الأب">الأب</option>
                </select>
              </div>
              <div className="fl">
                <label>تاريخ تطبيق القائمة</label>
                <input
                  type="date"
                  value={form.date || todayStr()}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* 2. Subscale Navigation Tabs & Filter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📑 بنود المقاييس الفرعية الستة (الأبعاد النمائية):
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                خيارات التقدير: <strong>نعم (2 درجات)</strong> - تنطبق تماماً | <strong>أحياناً (درجة واحدة)</strong> - جزئياً | <strong>لا (0 / صفر)</strong> - لا تنطبق
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeDomainFilter === 'all' ? 'on' : ''}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع العبارات ({DEV_LD_ITEMS.length})
              </button>
              {DEV_LD_DOMAINS.map(dom => {
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
                    {dom.icon} {dom.name} ({domStat?.answeredCount || 0}/{dom.itemsCount})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const domain = DEV_LD_DOMAINS.find(d => d.id === item.domainId);
              const currentScore = form.scores[item.id];
              const currentNote = form.itemNotes[item.id] || '';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: currentScore !== undefined ? `1.5px solid ${domain.color}` : '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: '260px' }}>
                      <span
                        style={{
                          background: domain.color,
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        #{item.id} · {domain.code}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                          {item.text}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: 2 }}>
                          المجال: {domain.name} ({domain.pillarName})
                        </div>
                      </div>
                    </div>

                    {/* Rating Scale Buttons (نعم 2, أحيانا 1, لا 0) */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {DEV_LD_RESPONSE_OPTIONS.map(opt => {
                        const isSelected = currentScore === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleScoreSelect(item.id, opt.value)}
                            className={`btn btn-xs ${isSelected ? 'btn-p' : 'btn-g'}`}
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              fontWeight: isSelected ? 800 : 500,
                              background: isSelected ? opt.color : undefined,
                              color: isSelected ? '#fff' : undefined,
                              border: isSelected ? 'none' : undefined,
                            }}
                            title={opt.description}
                          >
                            {opt.label} {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Item Observation Note */}
                  <div style={{ marginTop: 6 }}>
                    <input
                      type="text"
                      placeholder="ملاحظات سلوكية أو شواهد بيئية في الروضة لهذا البند (اختياري)..."
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
                <span>📝</span> الخلاصة التشخيصية وتوصيات التدخل المبكر بالروضة
              </div>
              <button
                type="button"
                className="btn btn-xs btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ fontWeight: 700, background: '#0d9488', color: '#fff', border: 'none' }}
              >
                ✨ إعادة توليد الخلاصة بناءً على الدرجات
              </button>
            </div>

            <div className="fg c1">
              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>التقرير الإكلينيكي والفرز النمائي</label>
                <textarea
                  rows={6}
                  placeholder="الخلاصة التشخيصية والوصف النفسي النمائي وفق معايير قائمة أ.د. عادل عبدالله..."
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>توصيات الخطة الفردية للتدخل المبكر (Early Intervention IEP)</label>
                <textarea
                  rows={5}
                  placeholder="الاستراتيجيات النمائية المقترحة، أنشطة غرف المصادر والروضة، وبرامج تنمية المهارات قبل الأكاديمية..."
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
            padding: '12px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
              تم الإجابة على <strong>{psychometrics.totalAnswered}</strong> من <strong>{DEV_LD_ITEMS.length}</strong> عبارة
            </span>
            <span className={`bdg ${psychometrics.completionPercentage === 100 ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.72rem' }}>
              {psychometrics.completionPercentage}% مكتمل
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={onClose}
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
              💾 حفظ قائمة صعوبات التعلم النمائية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
