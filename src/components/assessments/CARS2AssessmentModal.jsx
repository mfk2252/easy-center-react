import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  CARS2_ITEMS,
  CARS2_DOMAINS,
  CARS2_COPYRIGHT_INFO,
  calculateCARS2Psychometrics,
} from '../../data/cars2Data';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_CARS2_FORM = {
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
    return calculateCARS2Psychometrics(form.scores);
  }, [form.scores]);

  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return CARS2_ITEMS;
    return CARS2_ITEMS.filter(it => it.domainId === activeDomainFilter);
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

  function autoFillSample(level = 'mild') {
    const scores = {};
    CARS2_ITEMS.forEach(it => {
      if (level === 'none') {
        scores[it.id] = (it.id % 4 === 0) ? 1.5 : 1.0;
      } else if (level === 'mild') {
        scores[it.id] = (it.id % 3 === 0) ? 2.5 : (it.id % 2 === 0) ? 2.0 : 1.5;
      } else if (level === 'severe') {
        scores[it.id] = (it.id % 3 === 0) ? 3.0 : (it.id % 2 === 0) ? 3.5 : 4.0;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم تعبئة استجابات نموذجية (${level === 'none' ? 'ضمن الحدود الطبيعية' : level === 'mild' ? 'أعراض بسيطة-متوسطة' : 'أعراض شديدة'}) لمقياس CARS-2`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.answeredCount < 5) {
      toast('⚠️ يرجى تقييم عدد كافٍ من البنود لتوليد الخلاصة التشخيصية', 'er');
      return;
    }

    const domainSummaries = psychometrics.domainScores.map(d => {
      let level = 'طبيعي';
      if (d.avg >= 3.0) level = 'شديد التأثر (أعراض حادة)';
      else if (d.avg >= 2.0) level = 'متوسط التأثر (أعراض صريحة)';
      else if (d.avg >= 1.5) level = 'تأثر بسيط إلى طفيف';
      return `• ${d.name}: (الدرجة ${d.score}/${d.maxScore} - متوسط البند: ${d.avg}/4.0 - التقدير: ${level})`;
    }).join('\n');

    const suggestedSummary = `تقرير التقييم والتشخيص النفسي الإكلينيكي بمقياس تقدير التوحد في الطفولة (CARS-2 - ST):\n\n` +
      `- اسم المفحوص: ${form.studentName || 'الطالب'} | العمر الزمني: ${form.age || '—'} | تاريخ الفحص: ${form.date || todayStr()}\n` +
      `- الدرجة الخام الكلية (Total Raw Score): (${psychometrics.rawScore} من 60.0).\n` +
      `- الدرجة التائية المعيارية الموازية: (T = ${psychometrics.tScore}) برتبة مئينية (${psychometrics.percentile}%).\n` +
      `- التصنيف التشخيصي المعتمد: [${psychometrics.severityLabel}].\n\n` +
      `تفاصيل الأداء السلوكي والملاحظي عبر المجالات الأربعة:\n${domainSummaries}\n\n` +
      `الخلاصة الإكلينيكية المعتمدة:\n${psychometrics.clinicalImpression}`;

    const suggestedRecs = psychometrics.severityKey === 'none'
      ? '1. متابعة النمو والتطور اللغوي والمعرفي والاجتماعي بشكل دوري.\n2. إثراء المهارات التفاعلية واللعب التشاركي في البيئة الصفية والمنزلية.\n3. لا توجد حاجة حالياً لخطة تدخل علاجي مكثف للتوحد، مع إعادة التقييم بعد 6 أشهر في حال ظهور أي مؤشرات نمائية جديدة.'
      : psychometrics.severityKey === 'mild_moderate'
      ? '1. إعداد خطة تربوية فردية (IEP) شاملة تركز على المهارات الاجتماعية والتواصل الوظيفي والمرونة السلوكية.\n2. إلحاق الطفل بجلسات تخاطب ونطق مكثفة لتطوير اللغة الاستقبالية والتعبيرية والحد من المصاداة اللفظية (Echolalia).\n3. جلسات علاج وظيفي وتكامل حسي لمعالجة الحساسيات الحسية المصاحبة وتطوير التآزر الحركي.\n4. تدريب الأسرة على الاستراتيجيات السلوكية والتواصلية الداعمة (القصص الاجتماعية، الجداول البصرية).\n5. تطبيق استراتيجيات التحليل السلوكي التطبيقي (ABA) لتعزيز التفاعل والمبادأة الاجتماعية.'
      : '1. إدراج الطفل في برنامج تدخل سلوكي مكثف وشامل قائم على تحليل السلوك التطبيقي (ABA) بمعدل 20-30 ساعة أسبوعياً.\n2. تأسيس نظام تواصل وظيفي بديل ومعزز (PECS أو أجهزة AAC) كأولوية قصوى لتمكين الطفل من التعبير عن احتياجاته.\n3. خطة دعم وتدخل سلوكي إيجابي (BIP) للحد من نوبات الغضب، السلوكيات النمطية التكرارية، أو إيذاء الذات.\n4. جلسات علاج وظيفي وتكامل حسي متخصصة ومكثفة لتنظيم المعالجة الحسية (اللمسية، السمعية، الدهليزية).\n5. تدريب الوالدين على أساليب إدارة السلوك وتعميم المهارات المكتسبة في البيئة المنزلية والمجتمعية.\n6. المتابعة الطبية والنفسية الدورية بالتنسيق مع طبيب الأعصاب والطب النفسي للأطفال.';

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية الشاملة والتوصيات المعتمدة لمقياس CARS-2 بنجاح', 'ok');
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

    if (psychometrics.answeredCount < CARS2_ITEMS.length) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.answeredCount} من أصل ${CARS2_ITEMS.length} بنداً. هل تود حفظ مقياس CARS-2 كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'cars',
      scaleId: 'cars',
      measureName: 'مقياس تقدير التوحد في الطفولة — الإصدار الثاني (CARS-2)',
      scaleName: 'مقياس تقدير التوحد في الطفولة (CARS-2)',
      category: 'autism_spectrum',
      categoryName: 'مقاييس اضطرابات طيف التوحد',
      scaleType: 'cars2',
      score: psychometrics.rawScore,
      rawScore: psychometrics.rawScore,
      maxScore: 60,
      minScore: 15,
      percentage: psychometrics.percentage,
      tScore: psychometrics.tScore,
      percentile: psychometrics.percentile,
      level: psychometrics.severityLabel,
      severityLevel: psychometrics.severityLabel,
      severityKey: psychometrics.severityKey,
      severityColor: psychometrics.severityColor,
      color: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      domainScores: psychometrics.domainScores,
      psychometrics,
      author: CARS2_COPYRIGHT_INFO.authorsAr,
      publisher: CARS2_COPYRIGHT_INFO.publisherAr,
      isComplete: psychometrics.isComplete,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم التوحد (CARS-2) بنجاح', 'ok');
    } else {
      const newId = uid();
      lsAdd('studentAssessments', {
        ...payload,
        id: newId,
        createdAt: new Date().toISOString(),
      });
      toast(`✅ تم حفظ تقييم CARS-2 بنجاح (الدرجة الخام: ${psychometrics.rawScore}/60)`, 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  function handleSafeClose() {
    const answeredCount = Object.keys(form.scores || {}).length;
    if (answeredCount > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد تقييم لـ (${answeredCount}) بنداً في مقياس CARS-2. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
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
                  مقياس تقدير التوحد في الطفولة — الإصدار الثاني (CARS-2)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  15 بنداً تشخيصياً معتمداً · سلم متدرج (1.0 - 4.0)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#1e3a8a', color: '#dbeafe', fontSize: '0.68rem', fontWeight: 800 }}>
                  © WPS / د. إريك شوبلر
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Childhood Autism Rating Scale, 2nd Edition (CARS2-ST) — المعيار الذهبي الإكلينيكي لتشخيص وتحديد شدة طيف التوحد
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
              borderBottom: '2px solid #93c5fd',
              fontSize: '0.82rem',
              color: '#1e3a8a',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد الإكلينيكي لمقياس CARS-2:
            </div>

            <div
              style={{
                background: '#dbeafe',
                border: '1px solid #bfdbfe',
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
                  <strong>إشعار حقوق الملكية الفكرية والأمانة العلمية:</strong> مقياس تقدير التوحد في الطفولة — الإصدار الثاني (CARS-2) · تأليف: د. إريك شوبلر، د. روبرت رايشلر، د. باربرا روتشن رينر · الناشر الرسمي: Western Psychological Services (WPS).
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#bfdbfe', color: '#1e3a8a', padding: '3px 8px', borderRadius: 6, border: '1px solid #93c5fd', fontWeight: 700 }}>
                المعيار الذهبي المعتمد للتشخيص
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>المؤلفون الأصليون:</strong> {CARS2_COPYRIGHT_INFO.authorsAr} ({CARS2_COPYRIGHT_INFO.authorsEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>الناشر المعتمد:</strong> {CARS2_COPYRIGHT_INFO.publisherAr} ({CARS2_COPYRIGHT_INFO.publisherEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <strong>الفئة العمرية المستهدفة:</strong> {CARS2_COPYRIGHT_INFO.targetAge}
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#3b82f6' }}>
              <strong>دليل التصحيح الإكلينيكي ونقاط القطع:</strong>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                <span className="bdg b-gr">أقل من 30.0: ضمن الحدود الطبيعية (لا توجد أعراض توحد)</span>
                <span className="bdg b-or">30.0 - 36.5: أعراض طيف توحد بسيطة إلى متوسطة (Mild-to-Moderate)</span>
                <span className="bdg b-re">37.0 - 60.0: أعراض طيف توحد شديدة / حادة (Severe Autism)</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Scrollable Content Area */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, maxHeight: 'calc(88vh - 140px)' }}>

          {/* Collapsible Student & Examiner Profile Section */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: isHeaderCollapsed ? '10px 16px' : '14px 18px',
              marginBottom: 16,
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isHeaderCollapsed ? 0 : 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>👤</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  بيانات المفحوص وبيئة الفحص الإكلينيكي الملاحظي:
                </strong>
                {form.studentName && (
                  <span className="bdg b-bl" style={{ fontSize: '0.75rem' }}>
                    {form.studentName} {form.age ? `(${form.age})` : ''}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => setIsHeaderCollapsed(c => !c)}
                style={{ fontSize: '0.75rem', fontWeight: 600 }}
              >
                {isHeaderCollapsed ? '▼ توسيع بيانات المفحوص' : '▲ طي البيانات'}
              </button>
            </div>

            {!isHeaderCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="lbl">نوع تسجيل المفحوص <span style={{ color: 'var(--err)' }}>*</span></label>
                    <select
                      className="inp"
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">-- اختر طالباً مسجلاً بالمركز --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code || s.diagnosis || 'طالب'})
                        </option>
                      ))}
                      <option value="__other__">➕ مفحوص خارجي / حالة جديدة</option>
                    </select>
                  </div>

                  {form.mode === 'other' ? (
                    <div>
                      <label className="lbl">اسم المفحوص كاملاً <span style={{ color: 'var(--err)' }}>*</span></label>
                      <input
                        type="text"
                        className="inp"
                        placeholder="أدخل اسم الحالة الخارجية..."
                        value={form.studentName}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="lbl">التشخيص الحالي المسجل</label>
                      <input
                        type="text"
                        className="inp"
                        disabled
                        value={form.diagnosis || 'غير محدد'}
                        style={{ background: 'var(--g1)', opacity: 0.85 }}
                      />
                    </div>
                  )}

                  <div>
                    <label className="lbl">العمر الزمني</label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="مثال: 4 سنوات و 6 أشهر"
                      value={form.age}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="lbl">تاريخ تطبيق المقياس <span style={{ color: 'var(--err)' }}>*</span></label>
                    <input
                      type="date"
                      className="inp"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="lbl">الأخصائي النفسي / الفاحص الملاحظ <span style={{ color: 'var(--err)' }}>*</span></label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="اسم الأخصائي الفاحص..."
                      value={form.examinerName}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                      list="examiners-list"
                    />
                    <datalist id="examiners-list">
                      {emps.map(em => (
                        <option key={em.id} value={em.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="lbl">مصدر المعلومات / القائم بالرعاية (الملاحظ)</label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="اسم ولي الأمر / المعلم..."
                      value={form.raterName}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="lbl">صلة القرابة / الدور</label>
                    <select
                      className="inp"
                      value={form.raterRelation}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    >
                      <option value="">-- صلة الملاحظ --</option>
                      <option value="الوالدة">الأم</option>
                      <option value="الوالد">الأب</option>
                      <option value="معلم التربية الخاصة">معلم التربية الخاصة</option>
                      <option value="أخصائي التخاطب">أخصائي التخاطب</option>
                      <option value="ملاحظة إكلينيكية مباشرة">ملاحظة إكلينيكية مباشرة للفاحص</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="lbl">الصف / البيئة المدرسية</label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="الروضة / المدرسة..."
                      value={form.grade || form.school || ''}
                      onChange={e => setForm(f => ({ ...f, grade: e.target.value, school: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Dynamic Psychometrics & Quick Controls Bar */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
              border: '1.5px solid #bfdbfe',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <strong style={{ fontSize: '0.95rem', color: '#1e40af' }}>
                  المؤشرات السيكومترية الفورية ومستوى شدة الأعراض:
                </strong>
              </div>

              {/* Sample auto-fill & Quick helpers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>تعبئة سريعة للمعاينة:</span>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => autoFillSample('none')}
                  style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                  title="ملء جميع البنود بدرجات طبيعية (<30)"
                >
                  طبيعي (&lt;30)
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => autoFillSample('mild')}
                  style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}
                  title="ملء درجات بسيطة إلى متوسطة (30 - 36.5)"
                >
                  بسيط-متوسط (30-36.5)
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => autoFillSample('severe')}
                  style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                  title="ملء درجات شديدة (37+)"
                >
                  شديد (37+)
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-g"
                  onClick={() => setForm(f => ({ ...f, scores: {}, itemNotes: {} }))}
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  title="تفريغ جميع الإجابات"
                >
                  تفريغ
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={applyAutoClinicalSummary}
                  style={{
                    fontSize: '0.74rem',
                    padding: '4px 10px',
                    background: '#1e40af',
                    color: '#fff',
                    fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(30,64,175,0.2)',
                  }}
                >
                  ✨ توليد الخلاصة والتوصيات
                </button>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة الخام الكلية:</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e40af', lineHeight: 1.2 }}>
                  {psychometrics.rawScore} <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>/ 60.0</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  الحد الأدنى 15.0 · النقطة الفاصلة 30.0
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة التائية المعيارية (T):</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  T = {psychometrics.tScore}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  (المتوسط 50 ± 10 انحراف)
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الرتبة المئينية (% Rank):</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  {psychometrics.percentile}%
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  مقارنة بعينة التقنين المعيارية
                </div>
              </div>

              <div style={{ background: '#fff', border: `1.5px solid ${psychometrics.severityColor}`, borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>التصنيف التشخيصي المعتمد:</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: psychometrics.severityColor, marginTop: 4 }}>
                  {psychometrics.severityLabel}
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>اكتمال التقييم:</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: psychometrics.isComplete ? '#16a34a' : '#d97706' }}>
                    {psychometrics.answeredCount} / 15
                  </span>
                  <span className={`bdg ${psychometrics.isComplete ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    {psychometrics.percentage}
                  </span>
                </div>
                <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${(psychometrics.answeredCount / 15) * 100}%`, height: '100%', background: '#2563eb' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Domain Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginLeft: 4 }}>المجالات السلوكية:</span>
            <button
              type="button"
              className={`btn btn-xs ${activeDomainFilter === 'all' ? 'btn-pr' : 'btn-g'}`}
              onClick={() => setActiveDomainFilter('all')}
              style={{ fontWeight: 700, borderRadius: 20, padding: '4px 12px' }}
            >
              الكل ({CARS2_ITEMS.length})
            </button>

            {CARS2_DOMAINS.map(dom => {
              const domRes = psychometrics.domainScores.find(d => d.id === dom.id);
              const isActive = activeDomainFilter === dom.id;
              return (
                <button
                  key={dom.id}
                  type="button"
                  className={`btn btn-xs ${isActive ? 'btn-pr' : 'btn-g'}`}
                  onClick={() => setActiveDomainFilter(dom.id)}
                  style={{
                    fontWeight: 700,
                    borderRadius: 20,
                    padding: '4px 12px',
                    borderColor: isActive ? undefined : dom.color,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: dom.color, display: 'inline-block', marginLeft: 6 }} />
                  {dom.name} ({domRes ? `${domRes.answered}/${domRes.totalItems}` : dom.items.length})
                  {domRes && domRes.answered > 0 && (
                    <span style={{ marginRight: 6, fontSize: '0.7rem', opacity: 0.85 }}>
                      [{domRes.score}/{domRes.maxScore}]
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 15 Diagnostic Behavioral Item Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const currentScore = form.scores[item.id] !== undefined ? Number(form.scores[item.id]) : null;
              const isAnswered = currentScore !== null;
              const dom = CARS2_DOMAINS.find(d => d.id === item.domainId);

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    border: isAnswered
                      ? currentScore >= 3.0
                        ? '1.5px solid #dc2626'
                        : currentScore >= 2.0
                        ? '1.5px solid #d97706'
                        : '1.5px solid #16a34a'
                      : '1px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '14px 18px',
                    boxShadow: isAnswered ? '0 3px 10px rgba(0,0,0,0.04)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Item Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: dom?.color || '#2563eb',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          flexShrink: 0,
                        }}
                      >
                        {item.id}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {item.title}
                          </h4>
                          <span
                            className="bdg"
                            style={{
                              background: `${dom?.color || '#3b82f6'}15`,
                              color: dom?.color || '#3b82f6',
                              border: `1px solid ${dom?.color || '#3b82f6'}40`,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            {dom?.name}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.45 }}>
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {isAnswered && (
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: currentScore >= 3.0 ? '#fee2e2' : currentScore >= 2.0 ? '#fef3c7' : '#dcfce7',
                          color: currentScore >= 3.0 ? '#b91c1c' : currentScore >= 2.0 ? '#b45309' : '#15803d',
                          border: `1px solid ${currentScore >= 3.0 ? '#fca5a5' : currentScore >= 2.0 ? '#fde68a' : '#86efac'}`,
                          flexShrink: 0,
                        }}
                      >
                        الدرجة المرصودة: {currentScore.toFixed(1)} / 4.0
                      </div>
                    )}
                  </div>

                  {/* 7 Interactive Anchor Rating Cards (1.0 to 4.0) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {item.anchors.map(anchor => {
                      const isSelected = currentScore === anchor.score;
                      let badgeBg = '#f1f5f9';
                      let badgeColor = '#475569';
                      let activeCardBg = '#f8fafc';
                      let activeBorderColor = '#cbd5e1';

                      if (anchor.score <= 1.5) {
                        badgeBg = '#dcfce7';
                        badgeColor = '#15803d';
                        activeCardBg = '#f0fdf4';
                        activeBorderColor = '#16a34a';
                      } else if (anchor.score <= 2.5) {
                        badgeBg = '#fef3c7';
                        badgeColor = '#b45309';
                        activeCardBg = '#fffbeb';
                        activeBorderColor = '#d97706';
                      } else {
                        badgeBg = '#fee2e2';
                        badgeColor = '#b91c1c';
                        activeCardBg = '#fef2f2';
                        activeBorderColor = '#dc2626';
                      }

                      return (
                        <button
                          key={anchor.score}
                          type="button"
                          onClick={() => handleScoreSelect(item.id, anchor.score)}
                          style={{
                            textAlign: 'right',
                            background: isSelected ? activeCardBg : '#ffffff',
                            border: isSelected ? `2px solid ${activeBorderColor}` : '1px solid var(--border-color)',
                            borderRadius: 8,
                            padding: '9px 12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            boxShadow: isSelected ? `0 2px 8px ${activeBorderColor}30` : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  background: badgeBg,
                                  color: badgeColor,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                }}
                              >
                                {anchor.score.toFixed(1)}
                              </span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isSelected ? activeBorderColor : 'var(--text-main)' }}>
                                {anchor.label}
                              </span>
                            </div>
                            {isSelected && (
                              <span style={{ fontSize: '0.85rem', color: activeBorderColor, fontWeight: 900 }}>
                                ✔
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-sub)', lineHeight: 1.45 }}>
                            {anchor.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Item Specific Clinician Observation Note */}
                  <div style={{ marginTop: 10 }}>
                    <input
                      type="text"
                      className="inp"
                      placeholder={`✍️ ملاحظات إكلينيكية ورصد شواهد السلوك للبند ${item.id} (${item.title})...`}
                      value={form.itemNotes[item.id] || ''}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      style={{ fontSize: '0.78rem', padding: '6px 10px', background: 'var(--g0)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diagnostic Summary & Evidence-Based Recommendations Section */}
          <div
            style={{
              background: '#fff',
              border: '1.5px solid #bfdbfe',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(37,99,235,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📝</span>
                <strong style={{ fontSize: '0.98rem', color: '#1e40af' }}>
                  الخلاصة الإكلينيكية التشخيصية والتوصيات العلاجية (CARS-2 Summary & Recommendations):
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isManualEdit}
                    onChange={e => setIsManualEdit(e.target.checked)}
                  />
                  <span>تعديل يدوي حر</span>
                </label>

                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={applyAutoClinicalSummary}
                  style={{ background: '#1e40af', color: '#fff', fontWeight: 700 }}
                >
                  ⚡ توليد تلقائي للتقرير
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              <div>
                <label className="lbl" style={{ fontWeight: 700, color: '#1e40af' }}>
                  الخلاصة التشخيصية والملاحظة الإكلينيكية:
                </label>
                <textarea
                  className="inp"
                  rows={6}
                  value={form.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="سيتم توليد ملخص إكلينيكي مفصل يوضح الدرجة الكلية والتصنيف وشدة الأعراض وتوزيع المجالات..."
                  style={{ lineHeight: 1.6, fontSize: '0.82rem', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label className="lbl" style={{ fontWeight: 700, color: '#1e40af' }}>
                  التوصيات التربوية والخطة التأهيلية (IEP & Intervention):
                </label>
                <textarea
                  className="inp"
                  rows={6}
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="التوصيات المبنية على الأدلة: التدخل السلوكي ABA، التخاطب والتواصل البديل AAC، التكامل الحسي، وتدريب الأسرة..."
                  style={{ lineHeight: 1.6, fontSize: '0.82rem', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div
          className="modal-footer-custom"
          style={{
            padding: '12px 20px',
            background: 'var(--g0)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            flexShrink: 0,
          }}
        >
          {/* Quick status preview in footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span>البنود المكتملة: <strong style={{ color: psychometrics.isComplete ? '#16a34a' : '#d97706' }}>{psychometrics.answeredCount} من 15</strong></span>
            <span>الدرجة الخام: <strong style={{ color: '#1e40af' }}>{psychometrics.rawScore} / 60.0</strong></span>
            <span>الدرجة التائية: <strong style={{ color: '#0f172a' }}>T={psychometrics.tScore}</strong></span>
            <span>الرتبة المئينية: <strong style={{ color: '#0f172a' }}>{psychometrics.percentile}%</strong></span>
            <span>التصنيف: <strong style={{ color: psychometrics.severityColor }}>{psychometrics.severityLabel}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={handleSafeClose}
            >
              إلغاء
            </button>

            <button
              type="button"
              className="btn"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                color: '#fff',
                fontWeight: 800,
                padding: '8px 20px',
                borderRadius: 8,
                boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
              }}
            >
              💾 حفظ تقييم CARS-2 واعتماد النتيجة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
