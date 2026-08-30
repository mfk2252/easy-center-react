import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  MCHAT_ITEMS,
  MCHAT_DOMAINS,
  MCHAT_COPYRIGHT_INFO,
  calculateMChatPsychometrics,
} from '../../data/mchatData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_MCHAT_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: '',
  examinerName: '',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function MChatAssessmentModal({
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
        ...EMPTY_MCHAT_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_MCHAT_FORM,
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
    return calculateMChatPsychometrics(form.scores);
  }, [form.scores]);

  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return MCHAT_ITEMS;
    return MCHAT_ITEMS.filter(it => it.domainId === activeDomainFilter);
  }, [activeDomainFilter]);

  if (!isOpen) return null;

  function handleScoreSelect(itemId, value) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: value,
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

  function autoFillSample(level = 'low') {
    const scores = {};
    MCHAT_ITEMS.forEach(it => {
      if (level === 'low') {
        // Low Risk (Pass all except maybe 1)
        scores[it.id] = (it.id === 2 || it.id === 5 || it.id === 12) ? 'NO' : 'YES';
      } else if (level === 'medium') {
        // Medium Risk (4 failures: items 6, 7, 10, 14 fail)
        if ([6, 7, 10, 14].includes(it.id)) {
          scores[it.id] = it.failResponse; // force failure
        } else {
          scores[it.id] = (it.id === 2 || it.id === 5 || it.id === 12) ? 'NO' : 'YES';
        }
      } else if (level === 'high') {
        // High Risk (11 failures)
        if ([1, 3, 5, 6, 7, 9, 10, 12, 14, 16, 19].includes(it.id)) {
          scores[it.id] = it.failResponse;
        } else {
          scores[it.id] = (it.id === 2 || it.id === 5 || it.id === 12) ? 'NO' : 'YES';
        }
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم تعبئة استجابات نموذجية (${level === 'low' ? 'خطر منخفض' : level === 'medium' ? 'خطر متوسط (4 نقاط)' : 'خطر مرتفع (11 نقطة)'}) للتجربة السريعة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 10) {
      toast('⚠️ يرجى تقييم عدد كافٍ من البنود (10 بنود على الأقل) لتوليد الخلاصة التشخيصية', 'er');
      return;
    }

    const domainDetails = psychometrics.domainStats.map(d => {
      return `• ${d.name} (${d.code}): عدد إخفاقات البنود (${d.failCount}/${d.totalItems})`;
    }).join('\n');

    const suggestedSummary = `تقرير المسح والتقييم المبكر بمقياس M-CHAT-R/F (النسخة الحديثة المعتمدة):\n\n` +
      `- إجمالي نقاط الخطر (عدد إخفاقات البنود): (${psychometrics.totalFailures}) من أصل 20 بنداً.\n` +
      `- الفئة والتصنيف الإكلينيكي: [${psychometrics.riskTitle}]\n\n` +
      `توزيع الإخفاقات حسب المجالات النمائية:\n${domainDetails}\n\n` +
      `الخلاصة والإجراء الإكلينيكي الموصى به:\n` +
      `${psychometrics.recommendationSummary}`;

    const suggestedRecs = psychometrics.riskKey === 'low'
      ? '1. الاستمرار في المتابعة النمائية الدورية المعتادة لدى طبيب الأطفال والمركز.\n2. إعادة تطبيق المسح بمقياس M-CHAT-R/F عند بلوغ الطفل عمر 24 شهراً إذا كان المسح الحالي قبل هذا العمر.\n3. تعزيز ألعاب التواصل الاجتماعي التفاعلية واللعب التشاركي في المنزل.'
      : psychometrics.riskKey === 'medium'
      ? '1. تطبيق المقابلة التتبعية M-CHAT-R/F Follow-Up Interview فوراً للبنود الـ (' + psychometrics.totalFailures + ') التي ظهرت فيها نقاط خطر.\n2. إذا أسفرت المقابلة التتبعية عن استمرار 2 أو أكثر من نقاط الخطر، يتم تحويل الطفل مباشرة إلى فريق التقييم التشخيصي التخصصي.\n3. تزويد الأسرة بتوجيهات سريعة لتطبيق استراتيجيات تحفيز الاهتمام المشترك (Joint Attention) والتواصل البصري.\n4. فتح ملف متابعة نمائية بالمركز وتحديد موعد إعادة تقييم بعد 4 أسابيع.'
      : '1. الإحالة الفورية والعاجلة إلى فريق التقييم التشخيصي الشامل (Diagnostic Evaluation) لإجراء التشخيص بواسطة أدوات معتمدة (مثل ADOS-2 أو CARS-2).\n2. إلحاق الطفل مباشرة ببرامج خدمات التدخل المبكر (Early Intervention Services) وتكثيف جلسات التخاطب والتكامل الحسي والتأهيل السلوكي (ABA).\n3. تصميم خطة فردية مبكرة تتضمن أهدافاً مركزة على التواصل البصري، الإشارة باليد، الاستجابة للاسم، واللعب التفاعلي.\n4. تقديم جلسات إرشاد ودعم أسري لتمكين الوالدين من تطبيق الاستراتيجيات التأهيلية المنزلية.';

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية الشاملة والتوصيات بدقة فائقة', 'ok');
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

    if (psychometrics.totalAnswered < MCHAT_ITEMS.length) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.totalAnswered} من أصل ${MCHAT_ITEMS.length} بنداً. هل تود حفظ المقياس كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'mchat_r_f',
      scaleId: 'mchat_r_f',
      measureName: 'قائمة تفقد التوحد المعدلة للأطفال الصغار (M-CHAT-R/F)',
      scaleName: 'قائمة تفقد التوحد المعدلة للأطفال الصغار (M-CHAT-R/F)',
      category: 'autism',
      categoryName: 'مقاييس اضطرابات طيف التوحد',
      score: psychometrics.totalFailures,
      totalFailures: psychometrics.totalFailures,
      percentage: psychometrics.completionPercentage,
      level: psychometrics.riskTitle,
      severityLevel: psychometrics.riskTitle,
      severityKey: psychometrics.riskKey,
      color: psychometrics.riskColor,
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      psychometrics,
      author: MCHAT_COPYRIGHT_INFO.authorsAr,
      publisher: MCHAT_COPYRIGHT_INFO.publisherAr,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم (M-CHAT-R/F) بنجاح', 'ok');
    } else {
      const newId = uid();
      lsAdd('studentAssessments', {
        ...payload,
        id: newId,
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق مقياس (M-CHAT-R/F) بنجاح', 'ok');
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

  return (
    <div className="mbg">
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
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🧩</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  قائمة تفقد التوحد المعدلة للأطفال الصغار (M-CHAT-R/F)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  20 بنداً تشخيصياً · النسخة الحديثة المعتمدة
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#1e3a8a', color: '#dbeafe', fontSize: '0.68rem', fontWeight: 800 }}>
                  © Diana Robins et al. / الأكاديمية الأمريكية لطب الأطفال
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Modified Checklist for Autism in Toddlers, Revised with Follow-Up — الأداة المعيارية للكشف المبكر من 16-30 شهراً
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
                color: showCopyrightDetails ? '#1e40af' : '#fff',
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
              background: '#eff6ff',
              padding: '14px 20px',
              borderBottom: '2px solid #60a5fa',
              fontSize: '0.82rem',
              color: '#1e3a8a',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس M-CHAT-R/F:
            </div>

            <div
              style={{
                background: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#1e40af',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار حقوق الملكية الفكرية والاعتماد العلمي:</strong> {MCHAT_COPYRIGHT_INFO.scaleTitleAr} — إعداد: {MCHAT_COPYRIGHT_INFO.authorsAr} ({MCHAT_COPYRIGHT_INFO.authorsEn}).
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#eff6ff', padding: '3px 8px', borderRadius: 6, border: '1px solid #bfdbfe', fontWeight: 700 }}>
                مخصص للتشخيص والمسح المبكر المرخص
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>المؤلفون الأصليون:</strong> {MCHAT_COPYRIGHT_INFO.authorsAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>جهة النشر:</strong> {MCHAT_COPYRIGHT_INFO.publisherAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>الفئة المستهدفة:</strong> {MCHAT_COPYRIGHT_INFO.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>المرجعية التشخيصية:</strong> {MCHAT_COPYRIGHT_INFO.standardsReference}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#1e40af', background: '#dbeafe', padding: '8px 12px', borderRadius: 8 }}>
              {MCHAT_COPYRIGHT_INFO.notice}
              <br />
              <strong>{MCHAT_COPYRIGHT_INFO.disclaimer}</strong>
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
            {/* Total Risk Failures Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 14px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.riskColor}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>درجة الخطر (عدد الإخفاقات):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.riskColor }}>
                {psychometrics.totalFailures} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>/ 20</small>
              </span>
            </div>

            {/* Risk Classification Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>تصنيف الخطر:</span>
              <span className={`bdg ${psychometrics.riskBadgeClass}`} style={{ fontWeight: 800, fontSize: '0.82rem' }}>
                {psychometrics.riskTitle}
              </span>
            </div>

            {/* Sub-domain breakdown chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {psychometrics.domainStats.map(dom => (
                <span
                  key={dom.id}
                  style={{
                    background: dom.failCount > 0 ? '#fef2f2' : '#f0fdf4',
                    color: dom.failCount > 0 ? '#991b1b' : '#166534',
                    border: `1px solid ${dom.failCount > 0 ? '#fca5a5' : '#86efac'}`,
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {dom.code}: {dom.failCount} نقاط خطر
                </span>
              ))}
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 'auto' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {psychometrics.totalAnswered} / {psychometrics.totalItems} بنداً
              </span>
              <div style={{ width: 60, height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${psychometrics.completionPercentage}%`,
                    height: '100%',
                    background: psychometrics.completionPercentage === 100 ? 'var(--ok)' : '#2563eb',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
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
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>👦</span>
                <span>بيانات المفحوص والفحص الإكلينيكي</span>
                {form.studentName && (
                  <span
                    style={{
                      fontSize: '0.76rem',
                      background: '#dbeafe',
                      color: '#1e40af',
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
                  title="تفعيل التعديل اليدوي على البيانات"
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
                      <label style={{ fontSize: '0.76rem', marginBottom: 2 }}>اسم المفحوص الخارجي <span className="req">*</span></label>
                      <input
                        style={{ height: 32, fontSize: '0.82rem' }}
                        value={form.studentName || ''}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                        placeholder="اكتب اسم الطفل المستفيد..."
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
                          {s.name} {s.age ? `(${s.age})` : ''}
                        </option>
                      ))}
                      <option value="__other__">➕ مستفيد خارجي غير مسجل...</option>
                    </select>
                  </div>

                  {/* 2. Date of Birth & Age */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>تاريخ الميلاد / العمر (16-30 شهراً)</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input
                        type="date"
                        style={{ height: 32, fontSize: '0.8rem', padding: '2px 6px', flex: 1 }}
                        value={form.dob || ''}
                        readOnly={!isManualEdit && form.mode !== 'other'}
                        onChange={e => {
                          const dobVal = e.target.value;
                          setForm(f => ({ ...f, dob: dobVal, age: dobVal ? calcAge(dobVal) : f.age }));
                        }}
                      />
                      <input
                        style={{ height: 32, fontSize: '0.8rem', width: 80, textAlign: 'center' }}
                        value={form.age || ''}
                        placeholder="العمر"
                        readOnly={!isManualEdit && form.mode !== 'other'}
                        onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* 3. Assessment Date */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>تاريخ التقييم <span className="req">*</span></label>
                    <input
                      type="date"
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.date || todayStr()}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>

                  {/* 4. Examiner Name */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الأخصائي الفاحص</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                      placeholder="اسم الأخصائي..."
                    />
                  </div>
                </div>

                {/* ROW 2: Informant / Rater Info */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>اسم المستجيب (الولي/الأم)</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                      placeholder="اسم ولي الأمر المستجيب..."
                    />
                  </div>
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صلة القرابة بالطفل</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      value={form.raterRelation || ''}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                      placeholder="الأم / الأب / المربي..."
                    />
                  </div>
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الدار/الروضة</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      value={form.school || ''}
                      onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                      placeholder="اسم الحضانة أو الروضة..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sample Fill Toolbar */}
          <div
            style={{
              background: 'var(--bg-card)',
              padding: '8px 12px',
              borderRadius: 8,
              marginBottom: 14,
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700 }}>
              <span>⚡ تجربة سريعة (عينة نموذجية):</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => autoFillSample('low')}
                style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', fontWeight: 700 }}
              >
                🟢 خطر منخفض
              </button>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => autoFillSample('medium')}
                style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d', fontWeight: 700 }}
              >
                🟠 خطر متوسط (4 نقاط)
              </button>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => autoFillSample('high')}
                style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', fontWeight: 700 }}
              >
                🔴 خطر مرتفع (11 نقطة)
              </button>
            </div>
          </div>

          {/* Domain Filter Pills */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              📑 بنود المقياس الـ 20 (M-CHAT-R/F Items):
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-xs ${activeDomainFilter === 'all' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setActiveDomainFilter('all')}
              >
                🌐 جميع البنود ({MCHAT_ITEMS.length})
              </button>
              {MCHAT_DOMAINS.map(dom => {
                const count = MCHAT_ITEMS.filter(it => it.domainId === dom.id).length;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    className={`btn btn-xs ${activeDomainFilter === dom.id ? 'btn-p' : 'btn-g'}`}
                    onClick={() => setActiveDomainFilter(dom.id)}
                  >
                    {dom.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const currentScore = form.scores[item.id] || form.scores[String(item.id)];
              const domain = MCHAT_DOMAINS.find(d => d.id === item.domainId);
              const isFail = currentScore && currentScore.toUpperCase() === item.failResponse;

              return (
                <div
                  key={item.id}
                  id={`mchat_item_${item.id}`}
                  style={{
                    background: 'var(--bg-card)',
                    border: isFail
                      ? '1.5px solid #ef4444'
                      : currentScore
                      ? '1.5px solid #22c55e'
                      : '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: '#2563eb',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        سؤال #{item.id} ({item.code})
                      </span>
                      {domain && (
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#1e40af',
                            border: '1px solid #bfdbfe',
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: 6,
                            fontWeight: 700,
                          }}
                        >
                          {domain.name}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    {currentScore && (
                      <span
                        className={`bdg ${isFail ? 'b-rd' : 'b-gr'}`}
                        style={{ fontSize: '0.72rem', fontWeight: 800 }}
                      >
                        {isFail ? '⚠️ إخفاق (نقطة خطر)' : '✓ نجاح (طبيعي)'}
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6, lineHeight: 1.5 }}>
                    {item.text}
                  </div>

                  {/* Example Callout */}
                  {item.example && (
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRight: '3px solid #3b82f6',
                        padding: '6px 10px',
                        borderRadius: '0 6px 6px 0',
                        fontSize: '0.78rem',
                        color: '#334155',
                        marginBottom: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      💡 {item.example}
                    </div>
                  )}

                  {/* Response Toggle Options */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className={`btn ${currentScore === 'YES' ? (item.failResponse === 'YES' ? 'btn-r' : 'btn-p') : 'btn-g'}`}
                        style={{
                          minWidth: 90,
                          padding: '6px 16px',
                          fontWeight: 800,
                          fontSize: '0.86rem',
                        }}
                        onClick={() => handleScoreSelect(item.id, 'YES')}
                      >
                        {currentScore === 'YES' ? '✓ نعم' : 'نعم'}
                      </button>

                      <button
                        type="button"
                        className={`btn ${currentScore === 'NO' ? (item.failResponse === 'NO' ? 'btn-r' : 'btn-p') : 'btn-g'}`}
                        style={{
                          minWidth: 90,
                          padding: '6px 16px',
                          fontWeight: 800,
                          fontSize: '0.86rem',
                        }}
                        onClick={() => handleScoreSelect(item.id, 'NO')}
                      >
                        {currentScore === 'NO' ? '✓ لا' : 'لا'}
                      </button>
                    </div>

                    {/* Quick indicator note */}
                    <input
                      type="text"
                      placeholder="ملاحظة إكلينيكية حول البند..."
                      value={form.itemNotes[item.id] || ''}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: 200,
                        height: 34,
                        fontSize: '0.78rem',
                        background: 'var(--bg-main)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinical Summary & Recommendations Generator Card */}
          <div
            style={{
              background: '#f0f9ff',
              border: '1.5px solid #7dd3fc',
              borderRadius: 10,
              padding: '14px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> الخلاصة التشخيصية والتوصيات التربوية الإكلينيكية
              </div>
              <button
                type="button"
                className="btn btn-sm btn-p"
                onClick={applyAutoClinicalSummary}
                style={{ background: '#0284c7', borderColor: '#0369a1', fontWeight: 800 }}
              >
                ✨ توليد الخلاصة التشخيصية والتوصيات تلقائياً
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
              <div className="fl" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>الخلاصة والتشخيص الإكلينيكي</label>
                <textarea
                  rows={5}
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="الخلاصة التشخيصية والوصف النفسي التربوي وفق معايير M-CHAT-R/F..."
                  style={{ fontSize: '0.82rem', lineHeight: 1.6 }}
                />
              </div>

              <div className="fl" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>التوصيات والإجراءات التأهيلية الموصى بها</label>
                <textarea
                  rows={5}
                  value={form.recommendations || ''}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="التوصيات التربوية والإجراءات الإكلينيكية المقترحة..."
                  style={{ fontSize: '0.82rem', lineHeight: 1.6 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* STICKY FOOTER */}
        <div
          className="modal-footer-custom"
          style={{
            padding: '12px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
            تم الإجابة على <strong>{psychometrics.totalAnswered}</strong> من <strong>{MCHAT_ITEMS.length}</strong> بنداً
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={handleSafeClose}
              style={{ fontWeight: 700 }}
            >
              ✖ إلغاء
            </button>
            <button
              type="button"
              className="btn btn-p"
              onClick={handleSave}
              style={{ fontWeight: 800, minWidth: 160, background: '#2563eb' }}
            >
              💾 حفظ تقييم (M-CHAT-R/F)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
