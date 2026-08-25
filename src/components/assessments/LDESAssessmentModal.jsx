import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  LDES_ITEMS,
  LDES_DOMAINS,
  LDES_RESPONSE_OPTIONS,
  LDES_COPYRIGHT_INFO,
  calculateLDESPsychometrics,
} from '../../data/ldesData';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_LDES_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: '',
  school: '',
  raterName: '',
  raterRelation: 'معلم التربية الخاصة / صعوبات التعلم',
  examinerName: '',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function LDESAssessmentModal({
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
        ...EMPTY_LDES_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_LDES_FORM,
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
    return calculateLDESPsychometrics(form.scores);
  }, [form.scores]);

  const filteredItems = useMemo(() => {
    if (activeDomainFilter === 'all') return LDES_ITEMS;
    return LDES_ITEMS.filter(it => it.domainId === activeDomainFilter);
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
    LDES_ITEMS.forEach(it => {
      if (level === 'mild') {
        // Mild / Borderline
        scores[it.id] = (it.id % 4 === 0) ? 2 : (it.id % 2 === 0 ? 1 : 0);
      } else if (level === 'moderate') {
        // Moderate LD (Dyslexia / Dyscalculia focus)
        if (it.domainId === 'reading' || it.domainId === 'writing' || it.domainId === 'math') {
          scores[it.id] = (it.id % 3 === 0) ? 3 : 2;
        } else {
          scores[it.id] = (it.id % 2 === 0) ? 1 : 0;
        }
      } else if (level === 'severe') {
        // Severe LD
        scores[it.id] = (it.id % 3 === 0) ? 2 : 3;
      } else {
        // Normal
        scores[it.id] = (it.id % 5 === 0) ? 1 : 0;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم تعبئة استجابات نموذجية (${level === 'normal' ? 'أداء طبيعي' : level === 'mild' ? 'صعوبات خفيفة' : level === 'moderate' ? 'صعوبات متوسطة' : 'صعوبات شديدة'}) للتجربة والمعاينة السريعة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.totalAnswered < 15) {
      toast('⚠️ يرجى تقييم عدد كافٍ من العبارات (15 بنداً على الأقل) لتوليد الخلاصة التشخيصية', 'er');
      return;
    }

    const domainDetails = psychometrics.domainResults.map(d => {
      return `• ${d.name} (${d.code}): الدرجة الخام (${d.rawScore}/${d.maxRaw}) ➔ الدرجة المعيارية (${d.scaledScore}/20) برتبة مئينية (${d.percentile}%) - [${d.severityLevel}]`;
    }).join('\n');

    const deficitsText = psychometrics.deficitDomains.length > 0
      ? `المقاييس التي تظهر صعوبات جوهرية تتطلب خطة تربوية فردية:\n` + psychometrics.deficitDomains.map(d => `- ${d.name} (درجة معيارية: ${d.scaledScore})`).join('\n')
      : 'لا توجد مقاييس تقع في النطاق الحرج الشديد.';

    const strengthsText = psychometrics.strengthDomains.length > 0
      ? `نقاط القوة النمائية والأكاديمية التي يمكن البناء عليها:\n` + psychometrics.strengthDomains.map(d => `- ${d.name} (درجة معيارية: ${d.scaledScore})`).join('\n')
      : 'المستويات تقع ضمن الحدود المتوسطة العامة.';

    const suggestedSummary = `تقرير التقييم والتشخيص بمقياس التقدير التشخيصي لصعوبات التعلم (LDES) - إعداد د. ستيفن ماكارني:\n\n` +
      `- مجموع الدرجات المعيارية الموزونة للمقاييس السبعة: (${psychometrics.sumScaledScores}).\n` +
      `- حاصل صعوبات التعلم الكلي (LDEQ Quotient): (${psychometrics.ldeq}) برتبة مئينية كلية (${psychometrics.overallPercentile}%).\n` +
      `- متوسط المؤشر النمائي: (${psychometrics.devAvgScaled}/20) | متوسط المؤشر الأكاديمي: (${psychometrics.acadAvgScaled}/20).\n\n` +
      `النتيجة والتشخيص الإكلينيكي:\n` +
      `التصنيف التشخيصي: [${psychometrics.probability}]\n` +
      `مستوى الشدة: [${psychometrics.severityLevel}]\n\n` +
      `الأداء التفصيلي على المقاييس الفرعية:\n${domainDetails}\n\n` +
      `${deficitsText}\n\n` +
      `${strengthsText}\n\n` +
      `الخلاصة:\n` +
      `أظهرت نتائج التقييم المقنن أن المفحوص يعاني من ${psychometrics.severityLevel}. يستدعي هذا الملف النفسي التربوي التدخل المتخصص عبر برنامج غرف المصادر وصياغة أهداف خطة تربوية فردية (IEP) متمركزة حول مجالات العجز المحددة.`;

    const suggestedRecs = psychometrics.severityKey === 'normal'
      ? '1. الاستمرار في بيئة التعليم العام مع تدعيم جوانب التميز الأكاديمي والنمائي.\n2. المتابعة الصفية الدورية للتأكد من ثبات مستوى التحصيل وسرعة الإنجاز.\n3. تعزيز دافعية التعلم والمشاركة الإيجابية في الأنشطة المدرسية.'
      : psychometrics.severityKey === 'mild'
      ? '1. تطبيق استراتيجيات التدخل الأولي (RTI) والمجموعات الصغيرة داخل الفصل العام.\n2. تقديم مواءمات تعليمية واختبارية (منح وقت إضافي، تقليل عدد المسائل في الصفحة، توضيح التعليمات شفهياً وبصرياً).\n3. تدريب الطالب على استراتيجيات الذاكرة والتنظيم واستخدام جداول المتابعة اليومية.\n4. التنسيق المستمر مع الأسرة لمتابعة الواجبات المنزلية بأسلوب التعليم المعزز.'
      : psychometrics.severityKey === 'moderate'
      ? '1. إلحاق الطالب ببرنامج غرف المصادر لصعوبات التعلم لتلقي التدريس الفردي المباشر بمعدل (3-4 جلسات أسبوعياً).\n2. تصميم خطة تربوية فردية (IEP) تشمل أهدافاً علاجية مقننة في (القراءة والكتابة والرياضيات والمعالجة السمعية).\n3. استخدام استراتيجيات التدريس متعدّد الحواس (VAKT: بصري، سمعي، حركي، لمسي) مثل طريقة أورتن-جلنجهام.\n4. تجزئة المهام التعليمية الكبيرة إلى خطوات صغيرة متسلسلة مع تقديم التغذية الراجعة الفورية.\n5. مواءمة أساليب الاختبار: الاختبارات الشفهية، استخدام الآلة الحاسبة، تكبير الخطوط وتخفيف المشتتات البصرية.'
      : '1. وضع خطة تربوية وتأهيلية فردية مكثفة وشاملة (Intensive IEP) في غرفة المصادر بإشراف فريق التربية الخاصة متعدد التخصصات.\n2. تطبيق برامج التدخل النمائي لمعالجة القصور في المعالجة السمعية، الذاكرة العاملة، والتناسق الحركي البصري.\n3. استخدام التقنيات التعليمية المساندة (برامج تحويل النص إلى كلام، الآلات الحاسبة الناطقة، أجهزة التسجيل الصوتي).\n4. توفير مواءمات كاملة في الامتحانات المدرسية (قارئ للنصوص، كاتب للإجابات، تمديد زمن الاختبار بنسبة 50%).\n5. تقديم الدعم النفسي والإرشادي لخفض القلق الأكاديمي وتعزيز مفهوم الذات الإيجابي لدى الطالب.\n6. جلسات إرشاد أسري منتظمة لتوحيد استراتيجيات التدريب والممارسة المنزلية.';

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

    if (psychometrics.totalAnswered < LDES_ITEMS.length) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.totalAnswered} من أصل ${LDES_ITEMS.length} عبارة. هل تود حفظ المقياس كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'learning_difficulties',
      scaleId: 'learning_difficulties',
      measureName: 'مقياس التقدير التشخيصي لصعوبات التعلم (LDES)',
      scaleName: 'مقياس التقدير التشخيصي لصعوبات التعلم (LDES)',
      category: 'learning_academic',
      categoryName: 'صعوبات التعلم والتحصيل الأكاديمي',
      score: psychometrics.ldeq,
      ldeq: psychometrics.ldeq,
      sumScaledScores: psychometrics.sumScaledScores,
      overallPercentile: psychometrics.overallPercentile,
      percentage: psychometrics.completionPercentage,
      level: psychometrics.probability,
      severityLevel: psychometrics.severityLevel,
      severityKey: psychometrics.severityKey,
      color: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      itemNotes: form.itemNotes,
      psychometrics,
      author: LDES_COPYRIGHT_INFO.authorAr,
      publisher: LDES_COPYRIGHT_INFO.publisherAr,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم صعوبات التعلم (LDES) بنجاح', 'ok');
    } else {
      const newId = uid();
      lsAdd('studentAssessments', {
        ...payload,
        id: newId,
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق مقياس صعوبات التعلم (LDES) بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-xl"
        
      >
        {/* Modal Main Header */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>📘</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس التقدير التشخيصي لصعوبات التعلم (LDES)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  88 بنداً تشخيصياً · 7 مقاييس فرعية
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#78350f', color: '#fef3c7', fontSize: '0.68rem', fontWeight: 800 }}>
                  © Hawthorne / د. ستيفن ماكارني
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Learning Disabilities Evaluation Scale — الأداة المعيارية المعتمدة لتشخيص صعوبات التعلم النمائية والأكاديمية
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
                color: showCopyrightDetails ? '#b45309' : '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء حقوق الملكية' : 'حقوق الملكية الفكرية'}
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

        {/* EXPANDABLE DETAILED COPYRIGHT NOTICE */}
        {showCopyrightDetails && (
          <div
            style={{
              background: '#fffdf5',
              padding: '14px 20px',
              borderBottom: '2px solid #fcd34d',
              fontSize: '0.82rem',
              color: '#78350f',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد العلمي لمقياس LDES:
            </div>

            {/* Copyright Banner within details */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#92400e',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>إشعار حقوق الملكية الفكرية والاعتماد العلمي:</strong> مقياس التقدير التشخيصي لصعوبات التعلم (LDES) — إعداد د. ستيفن ب. ماكارني (Stephen B. McCarney, Ed.D.) · دار هوثورن التعليمية الأمريكية (Hawthorne Educational Services, Inc.).
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#fef3c7', padding: '3px 8px', borderRadius: 6, border: '1px solid #fcd34d', fontWeight: 700 }}>
                مخصص للتشخيص والتقييم التربوي المرخص
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a' }}>
                <strong>المؤلف الأصلي:</strong> {LDES_COPYRIGHT_INFO.authorAr} ({LDES_COPYRIGHT_INFO.authorEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a' }}>
                <strong>جهة النشر الأصلية:</strong> {LDES_COPYRIGHT_INFO.publisherAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a' }}>
                <strong>الفئة المستهدفة:</strong> {LDES_COPYRIGHT_INFO.targetAge}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a' }}>
                <strong>المرجعية التشخيصية:</strong> {LDES_COPYRIGHT_INFO.standardsReference}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#92400e', background: '#fef3c7', padding: '8px 12px', borderRadius: 8 }}>
              {LDES_COPYRIGHT_INFO.notice}
              <br />
              <strong>{LDES_COPYRIGHT_INFO.disclaimer}</strong>
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
            {/* LDEQ Quotient Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #f59e0b',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>حاصل صعوبات التعلم (LDEQ):</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.ldeq}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                (مئيني: {psychometrics.overallPercentile}%)
              </span>
            </div>

            {/* Sum of Scaled Scores */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>مجموع الدرجات المعيارية:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309' }}>
                {psychometrics.sumScaledScores} <small style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>/ 140</small>
              </span>
            </div>

            {/* Developmental vs Academic Indices */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المؤشر النمائي / الأكاديمي:</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                نمائي: <b style={{ color: '#0284c7' }}>{psychometrics.devAvgScaled}</b> | أكاديمي: <b style={{ color: '#d97706' }}>{psychometrics.acadAvgScaled}</b>
              </span>
            </div>

            {/* Diagnosis Result Badge */}
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>التصنيف:</span>
              <span className={`bdg ${psychometrics.severityKey === 'severe' ? 'b-rd' : psychometrics.severityKey === 'moderate' ? 'b-or' : psychometrics.severityKey === 'mild' ? 'b-bl' : 'b-gr'}`} style={{ fontWeight: 800, fontSize: '0.78rem' }}>
                {psychometrics.probability}
              </span>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {psychometrics.totalAnswered} / {psychometrics.totalItems} بنداً
              </span>
              <div style={{ width: 60, height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${psychometrics.completionPercentage}%`,
                    height: '100%',
                    background: psychometrics.completionPercentage === 100 ? 'var(--ok)' : '#d97706',
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
                  color: '#b45309',
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
                      background: '#ffedd5',
                      color: '#c2410c',
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
                        placeholder="اكتب اسم الطالب / المستفيد..."
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
                          {s.name}{s.className ? ` · [${s.className}]` : ''}
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
                      placeholder="مثال: صعوبات تعلم، تشتت انتباه..."
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
                      placeholder="اسم الأخصائي الفاحص"
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                    />
                  </div>

                  {/* 2. Respondent Name */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>المستجيب (معلم / ولي أمر)</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      type="text"
                      placeholder="اسم المستجيب على المقياس"
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                    />
                  </div>

                  {/* 3. Grade / Academic Level */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>الصف / المستوى الدراسي</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem', background: isManualEdit || form.mode === 'other' ? 'var(--bg-input)' : 'var(--g0)' }}
                      type="text"
                      placeholder="مثال: الصف الثالث الابتدائي"
                      value={form.grade || ''}
                      readOnly={!isManualEdit && form.mode !== 'other'}
                      onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                    />
                  </div>

                  {/* 4. Relationship / Role */}
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صلة القرابة / الصفة</label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.raterRelation || ''}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    >
                      <option value="معلم التربية الخاصة / صعوبات التعلم">معلم التربية الخاصة / صعوبات التعلم</option>
                      <option value="معلم التعليم العام (معلم الصف)">معلم التعليم العام (معلم الصف)</option>
                      <option value="الأم">الأم</option>
                      <option value="الأب">الأب</option>
                      <option value="أخصائي نفسي / تشخيص">أخصائي نفسي / تشخيص</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Subscale Navigation Tabs & Filter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📑 بنود المقاييس الفرعية السبعة (LDES Subscales):
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                اختر 0 للأداء الطبيعي، 1 لصعوبة نادرة، 2 لصعوبة متكررة، 3 لصعوبة شديدة دائمة
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                className={`tab ${activeDomainFilter === 'all' ? 'on' : ''}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                🌐 جميع البنود ({LDES_ITEMS.length})
              </button>
              {LDES_DOMAINS.map(dom => {
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
                    {dom.icon} {dom.name.split(' ')[0]} ({domStat?.answeredCount || 0}/{dom.itemsCount})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Items Evaluation Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredItems.map(item => {
              const domain = LDES_DOMAINS.find(d => d.id === item.domainId);
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
                          المجال: {domain.name} ({domain.categoryName})
                        </div>
                      </div>
                    </div>

                    {/* Rating Scale Buttons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {LDES_RESPONSE_OPTIONS.map(opt => {
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
                            title={opt.description}
                          >
                            {opt.label.split(' - ')[0]} {isSelected && '✓'}
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
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📝</span> الخلاصة التشخيصية والتوصيات التربوية المعتمدة
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
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>التقرير السيكومتري والتشخيص الإكلينيكي</label>
                <textarea
                  rows={6}
                  placeholder="الخلاصة التشخيصية والوصف النفسي التربوي وفق معايير LDES..."
                  value={form.clinicalSummary || ''}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  style={{ fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>توصيات الخطة التربوية الفردية (IEP) وغرفة المصادر</label>
                <textarea
                  rows={5}
                  placeholder="التوصيات العلاجية، المواءمات الأكاديمية والبيئية، واستراتيجيات التدريس متعدّد الحواس..."
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
              تم الإجابة على <strong>{psychometrics.totalAnswered}</strong> من <strong>{LDES_ITEMS.length}</strong> بنداً
            </span>
            <span className={`bdg ${psychometrics.completionPercentage === 100 ? 'b-gr' : 'b-or'}`} style={{ fontSize: '0.72rem' }}>
              {psychometrics.completionPercentage}% مكتمل
            </span>

            {/* Quick Actions moved to footer */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 6 }}>
              <button
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => autoFillSample('moderate')}
                title="تعبئة نموذج افتراضي يظهر صعوبات قراءة وحساب متوسطة"
                style={{ fontSize: '0.74rem' }}
              >
                ⚡ تجربة سريعة (صعوبات متوسطة)
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
              onClick={onClose}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-p"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                padding: '8px 20px',
              }}
            >
              💾 حفظ تقييم صعوبات التعلم (LDES)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
