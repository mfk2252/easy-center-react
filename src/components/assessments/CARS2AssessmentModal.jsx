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

    const assessmentRecord = {
      id: form.id || uid(),
      type: 'cars',
      scaleKey: 'cars2',
      scaleName: 'مقياس تقدير التوحد في الطفولة (CARS-2)',
      scaleFullName: CARS2_COPYRIGHT_INFO.scaleFullNameAr,
      scaleVersion: 'CARS2-ST (Standard Version)',
      studentId: form.stuId || form.studentId || null,
      studentName: form.studentName,
      age: form.age,
      dob: form.dob,
      grade: form.grade,
      school: form.school,
      diagnosis: form.diagnosis,
      examinerName: form.examinerName,
      raterName: form.raterName,
      raterRelation: form.raterRelation,
      date: form.date,
      scores: form.scores,
      results: form.scores,
      itemNotes: form.itemNotes,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      notes: form.notes,
      totalScore: psychometrics.rawScore,
      rawScore: psychometrics.rawScore,
      tScore: psychometrics.tScore,
      percentile: psychometrics.percentile,
      severityKey: psychometrics.severityKey,
      severityLabel: psychometrics.severityLabel,
      severityColor: psychometrics.severityColor,
      isAutismCutoff: psychometrics.isAutismCutoff,
      answeredCount: psychometrics.answeredCount,
      totalItems: CARS2_ITEMS.length,
      psychometrics,
      createdAt: form.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (form.id) {
      lsUpd('assessments', form.id, assessmentRecord);
      toast('✅ تم تحديث تقييم CARS-2 بنجاح', 'ok');
    } else {
      lsAdd('assessments', assessmentRecord);
      toast('✅ تم حفظ تقييم CARS-2 الجديد بنجاح', 'ok');
    }

    if (onSaved) onSaved(assessmentRecord);
    onClose();
  }

  function handleSafeClose() {
    if (Object.keys(form.scores).length > 0 && !form.id) {
      if (window.confirm('⚠️ هناك تعديلات غير محفوظة، هل أنت متأكد من الإغلاق؟')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && handleSafeClose()}>
      <div
        className="mb"
        style={{
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          width: '100%',
          maxHeight: 'min(94vh, calc(100dvh - 20px))',
          display: 'flex',
          flexDirection: 'column',
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
              background: 'var(--g0)',
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--pr)' }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد الإكلينيكي لمقياس CARS-2:
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--r2)',
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار حقوق الملكية الفكرية والأمانة العلمية:</strong> مقياس تقدير التوحد في الطفولة — الإصدار الثاني (CARS-2) · تأليف: د. إريك شوبلر، د. روبرت رايشلر، د. باربرا روتشن رينر · الناشر الرسمي: Western Psychological Services (WPS).
                </div>
              </div>
              <span className="bdg b-bl" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                المعيار الذهبي المعتمد للتشخيص
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--r2)', border: '1px solid var(--border-color)' }}>
                <strong>المؤلفون الأصليون:</strong> {CARS2_COPYRIGHT_INFO.authorsAr} ({CARS2_COPYRIGHT_INFO.authorsEn})
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--r2)', border: '1px solid var(--border-color)' }}>
                <strong>الناشر المعتمد:</strong> {CARS2_COPYRIGHT_INFO.publisherAr} ({CARS2_COPYRIGHT_INFO.publisherEn})
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--r2)', border: '1px solid var(--border-color)' }}>
                <strong>الفئة العمرية المستهدفة:</strong> {CARS2_COPYRIGHT_INFO.targetAge}
              </div>
            </div>

            <div style={{ fontSize: '0.78rem' }}>
              <strong style={{ color: 'var(--text-sub)' }}>دليل التصحيح الإكلينيكي ونقاط القطع:</strong>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                <span className="bdg b-gr">أقل من 30.0: ضمن الحدود الطبيعية (لا توجد أعراض توحد)</span>
                <span className="bdg b-or">30.0 - 36.5: أعراض طيف توحد بسيطة إلى متوسطة (Mild-to-Moderate)</span>
                <span className="bdg b-rd">37.0 - 60.0: أعراض طيف توحد شديدة / حادة (Severe Autism)</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Scrollable Content Area */}
        <div className="modal-body-scroll" style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>

          {/* Collapsible Student & Examiner Profile Section */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--r)',
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
                <div className="fg c4">
                  <div className="fl">
                    <label>نوع تسجيل المفحوص <span className="req">*</span></label>
                    <select
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
                    <div className="fl">
                      <label>اسم المفحوص كاملاً <span className="req">*</span></label>
                      <input
                        type="text"
                        placeholder="أدخل اسم الحالة الخارجية..."
                        value={form.studentName}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                      />
                    </div>
                  ) : (
                    <div className="fl">
                      <label>التشخيص الحالي المسجل</label>
                      <input
                        type="text"
                        disabled
                        value={form.diagnosis || 'غير محدد'}
                        style={{ opacity: 0.85 }}
                      />
                    </div>
                  )}

                  <div className="fl">
                    <label>العمر الزمني</label>
                    <input
                      type="text"
                      placeholder="مثال: 4 سنوات و 6 أشهر"
                      value={form.age}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    />
                  </div>

                  <div className="fl">
                    <label>تاريخ تطبيق المقياس <span className="req">*</span></label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="fg c4">
                  <div className="fl">
                    <label>الأخصائي النفسي / الفاحص الملاحظ <span className="req">*</span></label>
                    <input
                      type="text"
                      placeholder="اسم الأخصائي الفاحص..."
                      value={form.examinerName}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                      list="cars2-examiners-list"
                    />
                    <datalist id="cars2-examiners-list">
                      {emps.map(em => (
                        <option key={em.id} value={em.name} />
                      ))}
                    </datalist>
                  </div>

                  <div className="fl">
                    <label>مصدر المعلومات / القائم بالرعاية</label>
                    <input
                      type="text"
                      placeholder="اسم ولي الأمر / المعلم..."
                      value={form.raterName}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  <div className="fl">
                    <label>صلة القرابة / الدور</label>
                    <select
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

                  <div className="fl">
                    <label>الصف / البيئة المدرسية</label>
                    <input
                      type="text"
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
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--r)',
              padding: '14px 18px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--pr)' }}>
                  المؤشرات السيكومترية الفورية ومستوى شدة الأعراض:
                </strong>
              </div>

              {/* Sample auto-fill & Quick helpers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>تعبئة سريعة للمعاينة:</span>
                <button
                  type="button"
                  className="btn btn-xs btn-s"
                  onClick={() => autoFillSample('none')}
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  title="ملء جميع البنود بدرجات طبيعية (<30)"
                >
                  طبيعي (&lt;30)
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-w"
                  onClick={() => autoFillSample('mild')}
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  title="ملء درجات بسيطة إلى متوسطة (30 - 36.5)"
                >
                  بسيط-متوسط (30-36.5)
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-d"
                  onClick={() => autoFillSample('severe')}
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
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
                  className="btn btn-xs btn-p"
                  onClick={applyAutoClinicalSummary}
                  style={{
                    fontSize: '0.74rem',
                    padding: '4px 10px',
                    fontWeight: 700,
                  }}
                >
                  ✨ توليد الخلاصة والتوصيات
                </button>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>الدرجة الخام الكلية:</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--pr)', lineHeight: 1.2, marginTop: 2 }}>
                  {psychometrics.rawScore} <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 600 }}>/ 60.0</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: 3 }}>
                  الحد الأدنى 15.0 · النقطة الفاصلة 30.0
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>الدرجة التائية المعيارية:</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2, marginTop: 2 }}>
                  T = {psychometrics.tScore}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: 3 }}>
                  (المتوسط 50 ± 10 انحراف)
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>الرتبة المئينية (% Rank):</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2, marginTop: 2 }}>
                  {psychometrics.percentile}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: 3 }}>
                  مقارنة بعينة التقنين المعيارية
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${psychometrics.severityColor}`, borderRadius: 'var(--r2)', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>التصنيف التشخيصي المعتمد:</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: psychometrics.severityColor, marginTop: 4 }}>
                  {psychometrics.severityLabel}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r2)', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', fontWeight: 600 }}>اكتمال التقييم:</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: psychometrics.isComplete ? 'var(--ok)' : 'var(--warn)' }}>
                    {psychometrics.answeredCount} / 15
                  </span>
                  <span className={`bdg ${psychometrics.isComplete ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    {psychometrics.percentage}
                  </span>
                </div>
                <div style={{ width: '100%', height: 5, background: 'var(--g2)', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${(psychometrics.answeredCount / 15) * 100}%`, height: '100%', background: 'var(--pr)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Domain Filter Tabs */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📑 بنود مقياس تقدير التوحد (CARS-2 Items):
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                اختر الدرجة المناسبة على السلم المتدرج من (1.0 إلى 4.0)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeDomainFilter === 'all' ? 'on' : ''}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontSize: '0.78rem', padding: '6px 14px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع البنود ({CARS2_ITEMS.length})
              </button>

              {CARS2_DOMAINS.map(dom => {
                const domRes = psychometrics.domainScores.find(d => d.id === dom.id);
                const isActive = activeDomainFilter === dom.id;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    className={`tab ${isActive ? 'on' : ''}`}
                    onClick={() => setActiveDomainFilter(dom.id)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 14px',
                      whiteSpace: 'nowrap',
                      borderRight: `3px solid ${dom.color}`,
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: dom.color, display: 'inline-block', marginLeft: 6 }} />
                    {dom.name.split(' ')[0]} {dom.name.split(' ')[1] || ''} ({domRes ? `${domRes.answered}/${domRes.totalItems}` : dom.items.length})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 15 Diagnostic Behavioral Item Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const currentScore = form.scores[item.id] !== undefined ? Number(form.scores[item.id]) : null;
              const isAnswered = currentScore !== null;
              const dom = CARS2_DOMAINS.find(d => d.id === item.domainId);

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: isAnswered
                      ? currentScore >= 3.0
                        ? '1.5px solid var(--err)'
                        : currentScore >= 2.0
                        ? '1.5px solid var(--warn)'
                        : '1.5px solid var(--ok)'
                      : '1px solid var(--border-color)',
                    borderRadius: 'var(--r)',
                    padding: '14px 18px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Item Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: '260px' }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 'var(--r2)',
                          background: dom?.color || 'var(--pr)',
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
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {item.title}
                          </h4>
                          <span
                            className="bdg"
                            style={{
                              background: 'var(--g0)',
                              color: dom?.color || 'var(--pr)',
                              border: `1px solid ${dom?.color || 'var(--pr)'}40`,
                              fontSize: '0.72rem',
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
                          padding: '4px 12px',
                          borderRadius: 'var(--r2)',
                          background: currentScore >= 3.0 ? 'var(--err-l)' : currentScore >= 2.0 ? 'var(--warn-l)' : 'var(--ok-l)',
                          color: currentScore >= 3.0 ? 'var(--err)' : currentScore >= 2.0 ? 'var(--warn)' : 'var(--ok-d)',
                          border: `1px solid ${currentScore >= 3.0 ? 'var(--err)' : currentScore >= 2.0 ? 'var(--warn)' : 'var(--ok)'}`,
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
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {item.anchors.map(anchor => {
                      const isSelected = currentScore === anchor.score;

                      let badgeClass = 'b-bl';
                      let activeBorder = 'var(--pr)';
                      let activeBg = 'var(--pr-l)';

                      if (anchor.score <= 1.5) {
                        badgeClass = 'b-gr';
                        activeBorder = 'var(--ok)';
                        activeBg = 'var(--ok-l)';
                      } else if (anchor.score <= 2.5) {
                        badgeClass = 'b-or';
                        activeBorder = 'var(--warn)';
                        activeBg = 'var(--warn-l)';
                      } else {
                        badgeClass = 'b-rd';
                        activeBorder = 'var(--err)';
                        activeBg = 'var(--err-l)';
                      }

                      return (
                        <button
                          key={anchor.score}
                          type="button"
                          onClick={() => handleScoreSelect(item.id, anchor.score)}
                          style={{
                            textAlign: 'right',
                            background: isSelected ? activeBg : 'var(--g0)',
                            border: isSelected ? `2px solid ${activeBorder}` : '1px solid var(--border-color)',
                            borderRadius: 'var(--r2)',
                            padding: '9px 12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className={`bdg ${badgeClass}`} style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                                {anchor.score.toFixed(1)}
                              </span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isSelected ? activeBorder : 'var(--text-main)' }}>
                                {anchor.label}
                              </span>
                            </div>
                            {isSelected && (
                              <span style={{ fontSize: '0.85rem', color: activeBorder, fontWeight: 900 }}>
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
                      placeholder={`✍️ ملاحظات إكلينيكية ورصد شواهد السلوك للبند ${item.id} (${item.title})...`}
                      value={form.itemNotes[item.id] || ''}
                      onChange={e => handleItemNoteChange(item.id, e.target.value)}
                      style={{
                        fontSize: '0.78rem',
                        padding: '6px 10px',
                        background: 'var(--g0)',
                        border: '1px dashed var(--border-color)',
                        borderRadius: 'var(--r2)',
                        width: '100%',
                        color: 'var(--text-main)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diagnostic Summary & Evidence-Based Recommendations Section */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--r)',
              padding: '16px 20px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📝</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--pr)' }}>
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
                  className="btn btn-xs btn-p"
                  onClick={applyAutoClinicalSummary}
                  style={{ fontWeight: 700 }}
                >
                  ⚡ توليد تلقائي للتقرير
                </button>
              </div>
            </div>

            <div className="fg c2">
              <div className="fl">
                <label style={{ fontWeight: 700 }}>
                  الخلاصة التشخيصية والملاحظة الإكلينيكية:
                </label>
                <textarea
                  rows={6}
                  value={form.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="سيتم توليد ملخص إكلينيكي مفصل يوضح الدرجة الكلية والتصنيف وشدة الأعراض وتوزيع المجالات..."
                  style={{ lineHeight: 1.6, fontSize: '0.82rem' }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700 }}>
                  التوصيات التربوية والخطة التأهيلية (IEP & Intervention):
                </label>
                <textarea
                  rows={6}
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="التوصيات المبنية على الأدلة: التدخل السلوكي ABA، التخاطب والتواصل البديل AAC، التكامل الحسي، وتدريب الأسرة..."
                  style={{ lineHeight: 1.6, fontSize: '0.82rem' }}
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
            <span>البنود المكتملة: <strong style={{ color: psychometrics.isComplete ? 'var(--ok)' : 'var(--warn)' }}>{psychometrics.answeredCount} من 15</strong></span>
            <span>الدرجة الخام: <strong style={{ color: 'var(--pr)' }}>{psychometrics.rawScore} / 60.0</strong></span>
            <span>الدرجة التائية: <strong>T={psychometrics.tScore}</strong></span>
            <span>الرتبة المئينية: <strong>{psychometrics.percentile}%</strong></span>
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
              className="btn btn-p"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                color: '#fff',
                fontWeight: 800,
                padding: '8px 20px',
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
