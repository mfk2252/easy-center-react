import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  SRS2_ITEMS,
  SRS2_DOMAINS,
  SRS2_RESPONSE_OPTIONS,
  SRS2_COPYRIGHT_INFO,
  calculateSRS2Psychometrics,
} from '../../data/srs2Data';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_SRS2_FORM = {
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
  relationshipDuration: 'سنتان فأكثر',
  examinerName: '',
  examinerRole: 'أخصائي تشخيص وتأهيل توحد',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

function extractScores(data) {
  if (!data) return {};
  if (data.scores && typeof data.scores === 'object') return data.scores;
  if (data.results && typeof data.results === 'object') return data.results;
  if (data.answers && typeof data.answers === 'object') return data.answers;
  if (data.items && typeof data.items === 'object') return data.items;
  return {};
}

function extractItemNotes(data) {
  if (!data) return {};
  if (data.itemNotes && typeof data.itemNotes === 'object') return data.itemNotes;
  return {};
}

function normalizeFormState(data, defaultUser) {
  if (!data) {
    return {
      ...EMPTY_SRS2_FORM,
      examinerName: defaultUser?.name || '',
      date: todayStr(),
    };
  }
  return {
    ...EMPTY_SRS2_FORM,
    ...data,
    scores: extractScores(data),
    itemNotes: extractItemNotes(data),
    studentName: data.studentName || data.stuName || '',
    examinerName: data.examinerName || defaultUser?.name || '',
    date: data.date || data.assessmentDate || todayStr(),
  };
}

export default function SRS2AssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
}) {
  const { toast, currentUser } = useApp();

  const [form, setForm] = useState(() => normalizeFormState(initialData, currentUser));

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(normalizeFormState(initialData, currentUser));
    }
  }, [isOpen, initialData, currentUser]);

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
    return calculateSRS2Psychometrics(form.scores || {});
  }, [form.scores]);

  const filteredItems = useMemo(() => {
    const items = SRS2_ITEMS || [];
    if (activeDomainFilter === 'all') return items;
    return items.filter(it => it.domainId === activeDomainFilter);
  }, [activeDomainFilter]);

  if (!isOpen) return null;

  function handleScoreSelect(itemId, scoreValue) {
    setForm(prev => {
      const currentScores = prev.scores || {};
      return {
        ...prev,
        scores: {
          ...currentScores,
          [itemId]: Number(scoreValue),
        },
      };
    });
  }

  function handleItemNoteChange(itemId, noteText) {
    setForm(prev => {
      const currentNotes = prev.itemNotes || {};
      return {
        ...prev,
        itemNotes: {
          ...currentNotes,
          [itemId]: noteText,
        },
      };
    });
  }

  function autoFillSample(level = 'mild') {
    const scores = {};
    SRS2_ITEMS.forEach(it => {
      // 1: Not true, 2: Sometimes, 3: Often, 4: Almost always
      if (level === 'normal') {
        // Normal profile: negative items = 1, reverse positive items = 4
        scores[it.id] = it.isReverse ? 4 : 1;
      } else if (level === 'mild') {
        // Mild Impairment: mix of 2 and some 3s
        if (it.isReverse) {
          scores[it.id] = (it.id.charCodeAt(1) % 2 === 0) ? 3 : 2;
        } else {
          scores[it.id] = (it.id.charCodeAt(1) % 3 === 0) ? 3 : 2;
        }
      } else if (level === 'moderate') {
        // Moderate Impairment: Mostly 3s and some 4s
        if (it.isReverse) {
          scores[it.id] = (it.id.charCodeAt(1) % 2 === 0) ? 2 : 1;
        } else {
          scores[it.id] = (it.id.charCodeAt(1) % 2 === 0) ? 3 : 4;
        }
      } else {
        // Severe Impairment: Almost all 4s (and 1 for reverse items)
        scores[it.id] = it.isReverse ? 1 : 4;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم تعبئة استجابات نموذجية (${level === 'normal' ? 'أداء طبيعي' : level === 'mild' ? 'قصور بسيط' : level === 'moderate' ? 'قصور متوسط دال إكلينيكياً' : 'قصور شديد حرج'}) للمعاينة السريعة`, 'ok');
  }

  function handleClearAll() {
    if (window.confirm('هل أنت متأكد من تصفير جميع استجابات بنود المقياس؟')) {
      setForm(f => ({ ...f, scores: {}, itemNotes: {} }));
      toast('تم تصفير استجابات المقياس', 'ok');
    }
  }

  function applyAutoClinicalSummary() {
    if (psychometrics.answeredCount < 15) {
      toast('⚠️ يرجى تقييم عدد كافٍ من البنود (15 بنداً على الأقل) لتوليد الخلاصة التشخيصية', 'er');
      return;
    }

    const domainDetails = psychometrics.subscales.map(d => {
      return `• ${d.name} [${d.code}]: الدرجة الخام (${d.raw}/${d.maxRaw}) ➔ الدرجة التائية (${d.tScore}T) برتبة مئينية (${d.percentile}%) - [${d.level}]`;
    }).join('\n');

    const dsmSummary = `• مؤشر التواصل والتفاعل الاجتماعي DSM-5 (SCI): الدرجة التائية (${psychometrics.dsmScales.sci.tScore}T) - رتبة مئينية (${psychometrics.dsmScales.sci.percentile}%).\n` +
      `• مؤشر السلوكيات المقيدة والاهتمامات النمطية DSM-5 (RRB): الدرجة التائية (${psychometrics.dsmScales.rrb.tScore}T) - رتبة مئينية (${psychometrics.dsmScales.rrb.percentile}%).`;

    const suggestedSummary = `تقرير التقييم والتشخيص الإكلينيكي بمقياس الاستجابة الاجتماعية - الإصدار الثاني (SRS-2):\n` +
      `إعداد: د. جون إن. كونستانتينو & د. كريستيان بي. غروبر (Western Psychological Services - WPS)\n\n` +
      `المؤشرات السيكومترية العامة:\n` +
      `- مجموع الدرجة الخام الكلية: (${psychometrics.totalRawScore} من أصل 260).\n` +
      `- الدرجة التائية الكلية المعيارية (Total T-Score): (${psychometrics.totalTScore}T) برتبة مئينية كلية (${psychometrics.overallPercentile}%).\n` +
      `- الخطأ المعياري للقياس (SEM): (±${psychometrics.sem} نقطة تائية).\n\n` +
      `التصنيف التشخيصي والإكلينيكي:\n` +
      `- النتيجة العامة: [${psychometrics.category}]\n` +
      `- تصنيف DSM-5: [${psychometrics.dsm5Classification}]\n\n` +
      `مؤشرات DSM-5 المعتمدة:\n${dsmSummary}\n\n` +
      `الأداء التفصيلي على المقاييس الفرعية العلاجية:\n${domainDetails}\n\n` +
      `التفسير الإكلينيكي:\n${psychometrics.interpretation}`;

    let suggestedRecs = '';
    if (psychometrics.totalTScore <= 59) {
      suggestedRecs = '1. لا يتطلب ملف المفحوص تدخلاً علاجياً مكثفاً لاضطراب طيف التوحد حيث تقع الاستجابة ضمن الحدود الطبيعية.\n' +
        '2. الاستمرار في تعزيز مهارات التفاعل الاجتماعي والاندماج الصفي والمدرسي الطبيعي.\n' +
        '3. المتابعة الدورية عند الانتقال لمراحل نمائية جديدة.';
    } else if (psychometrics.totalTScore <= 65) {
      suggestedRecs = '1. إلحاق الطفل ببرامج تدريب المهارات الاجتماعية (Social Skills Training) في مجموعات صغيرة.\n' +
        '2. تدريب الطفل على فهم لغة الجسد، تعبيرات الوجه، والتواصل البصري الوظيفي أثناء المحادثة.\n' +
        '3. تطبيق استراتيجيات القصص الاجتماعية (Social Stories) لتهيئة الطفل للمواقف الاجتماعية التفاعلية.\n' +
        '4. التنسيق مع الأسرة لتوفير بيئات لعب تفاعلية منظمة مع الأقران.';
    } else if (psychometrics.totalTScore <= 75) {
      suggestedRecs = '1. إعداد خطة تربوية فردية (IEP) شاملة تركز على مجالات العجز المحددة في التواصل التبادلي والسلوك الاجتماعي.\n' +
        '2. جلسات علاج وتأهيل تخاطبي ونمائي لتنمية التواصل اللفظي والبراجماتي (Pragmatic Language).\n' +
        '3. تطبيق فنيات تحليل السلوك التطبيقي (ABA) للحد من السلوكيات التكرارية والاهتمامات المقيدة واستبدالها بسلوكيات تكيفية.\n' +
        '4. تدريب الأقران كنموذج (Peer-Mediated Intervention) لتسهيل الاندماج الصفي المنظم.\n' +
        '5. استخدام المعينات والجداول البصرية (Visual Schedules) لدعم المرونة وتقليل التوتر المصاحب لتغيير الروتين.\n' +
        '6. برنامج تدريب وإرشاد أسري منتظم لتعميم المهارات المكتسبة داخل المنزل والمجتمع.';
    } else {
      suggestedRecs = '1. إدراج الطفل في برنامج تدخل علاجي سلوكي مكثف ومتعدد التخصصات (Intensive Comprehensive Intervention).\n' +
        '2. خطة دعم سلوكي إيجابي (PBS) مكثفة للتعامل مع السلوكيات المقيدة والطقوس القهرية ونوبات الغضب.\n' +
        '3. جلسات علاج وظيفي وتكامل حسي لمعالجة فرط أو ضعف الاستجابة للمثيرات البيئية والحسية.\n' +
        '4. استخدام أنظمة التواصل البديل والمعزز (AAC / PECS) إذا كان التواصل اللفظي غير كافٍ.\n' +
        '5. توفير مواءمات كاملة وبيئة صفية مهيكلة لتقليل المشتتات والضغط النفسي.\n' +
        '6. استشارات طبية ونفسية دورية ومساندة أسرية مكثفة لتنسيق الرعاية التأهيلية المتكاملة.';
    }

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد التقرير السيكومتري والتوصيات الإكلينيكية آلياً بناءً على معايير WPS و DSM-5', 'ok');
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

    if (psychometrics.answeredCount < SRS2_ITEMS.length) {
      if (!window.confirm(`⚠️ تم تقييم ${psychometrics.answeredCount} من أصل ${SRS2_ITEMS.length} بنداً. هل تود حفظ المقياس كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      measureId: 'srs',
      scaleId: 'srs',
      measureName: 'مقياس الاستجابة الاجتماعية — الإصدار الثاني (SRS-2)',
      scaleName: 'مقياس الاستجابة الاجتماعية — الإصدار الثاني (SRS-2)',
      category: 'autism_behavior',
      categoryName: 'طيف التوحد والاستجابة الاجتماعية',
      score: psychometrics.totalTScore,
      totalTScore: psychometrics.totalTScore,
      tScore: psychometrics.totalTScore,
      totalRawScore: psychometrics.totalRawScore,
      rawScore: psychometrics.totalRawScore,
      maxScore: 260,
      overallPercentile: psychometrics.overallPercentile,
      percentile: psychometrics.overallPercentile,
      percentage: psychometrics.progressPercent,
      level: psychometrics.category,
      severityLevel: psychometrics.category,
      dsm5Classification: psychometrics.dsm5Classification,
      color: psychometrics.severityColor,
      results: form.scores,
      scores: form.scores,
      answers: form.scores,
      itemNotes: form.itemNotes,
      psychometrics,
      author: SRS2_COPYRIGHT_INFO.authorsAr,
      publisher: SRS2_COPYRIGHT_INFO.publisherAr,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم الاستجابة الاجتماعية (SRS-2) بنجاح', 'ok');
    } else {
      const newId = uid();
      lsAdd('studentAssessments', {
        ...payload,
        id: newId,
        createdAt: new Date().toISOString(),
      });
      toast('✅ تم حفظ تطبيق مقياس الاستجابة الاجتماعية (SRS-2) بنجاح', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  function handleSafeClose() {
    const count = Object.keys(form.scores || {}).length;
    if (count > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${count}) بنداً في المقياس. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
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
            background: 'linear-gradient(135deg, #065f46 0%, #0d9488 50%, #0284c7 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>👥</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس الاستجابة الاجتماعية — الإصدار الثاني (SRS-2)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  65 بنداً تشخيصياً · 5 مقاييس فرعية · متوافق مع DSM-5
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#042f2e', color: '#ccfbf1', fontSize: '0.68rem', fontWeight: 800 }}>
                  © WPS / د. كونستانتينو & د. غروبر
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  Social Responsiveness Scale, Second Edition — التقييم الكمي المعياري للاستجابة الاجتماعية وأعراض طيف التوحد
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
              background: '#f0fdf4',
              padding: '14px 20px',
              borderBottom: '2px solid #86efac',
              fontSize: '0.82rem',
              color: '#064e3b',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والاعتماد السيكومتري لمقياس SRS-2:
            </div>

            <div
              style={{
                background: '#ecfdf5',
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
                  <strong>إشعار الأمانة العلمية والاعتماد المهني:</strong> مقياس الاستجابة الاجتماعية — الإصدار الثاني (SRS-2) · إعداد: د. جون إن. كونستانتينو & د. كريستيان بي. غروبر · المؤسسة الغربية للخدمات النفسية (WPS - Western Psychological Services).
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#d1fae5', padding: '3px 8px', borderRadius: 6, border: '1px solid #6ee7b7', fontWeight: 700 }}>
                مقنن إكلينيكياً ومتوافق مع معايير DSM-5
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>المؤلفون:</strong> {SRS2_COPYRIGHT_INFO.authorsAr} ({SRS2_COPYRIGHT_INFO.authorsEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>جهة النشر الأصلية:</strong> {SRS2_COPYRIGHT_INFO.publisherAr} ({SRS2_COPYRIGHT_INFO.publisherEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>الفئة المستهدفة:</strong> {SRS2_COPYRIGHT_INFO.ageRangeAr}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                <strong>المرجعية التشخيصية:</strong> {SRS2_COPYRIGHT_INFO.standardNormsAr}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#047857', background: '#d1fae5', padding: '8px 12px', borderRadius: 8 }}>
              {SRS2_COPYRIGHT_INFO.purposeAr}
              <br />
              <strong>{SRS2_COPYRIGHT_INFO.licensingNotice}</strong>
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
            {/* Total T-Score Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 14px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.severityColor}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة التائية الكلية (Total T-Score):</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: psychometrics.severityColor }}>
                {psychometrics.totalTScore}T
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 6 }}>
                (مئيني: {psychometrics.overallPercentile}%)
              </span>
            </div>

            {/* Total Raw Score */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المجموع الخام:</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d9488' }}>
                {psychometrics.totalRawScore} <small style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>/ 260</small>
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                ({psychometrics.progressPercent}%)
              </span>
            </div>

            {/* DSM-5 SCI Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>التواصل والتفاعل (DSM SCI):</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7' }}>
                {psychometrics.dsmScales.sci.tScore}T
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                ({psychometrics.dsmScales.sci.percentile}%)
              </span>
            </div>

            {/* DSM-5 RRB Metric */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>السلوك المقيد (DSM RRB):</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ef4444' }}>
                {psychometrics.dsmScales.rrb.tScore}T
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                ({psychometrics.dsmScales.rrb.percentile}%)
              </span>
            </div>

            {/* Diagnostic Severity Badge */}
            <div
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: psychometrics.totalTScore <= 59 ? '#ecfdf5' : psychometrics.totalTScore <= 65 ? '#fffbeb' : psychometrics.totalTScore <= 75 ? '#fff7ed' : '#fef2f2',
                border: `1.5px solid ${psychometrics.severityColor}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>التصنيف والشدة الإكلينيكية:</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: psychometrics.severityColor }}>
                {psychometrics.category}
              </span>
            </div>
          </div>

          {/* Quick Subscale Bars Preview */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {psychometrics.subscales.map(sub => (
              <div
                key={sub.id}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'var(--bg-card)',
                  border: `1px solid ${sub.color}55`,
                  fontSize: '0.72rem',
                  textAlign: 'center',
                  minWidth: 70,
                }}
                title={`${sub.name}: الخام ${sub.raw}/${sub.maxRaw} ➔ التائية ${sub.tScore}T`}
              >
                <div style={{ color: sub.color, fontWeight: 800 }}>{sub.code}</div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{sub.tScore}T</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-sub)' }}>{sub.answered}/{sub.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Student Info & Assessment Metadata - Compact Refactored Header */}
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
                  color: '#0d9488',
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

                {/* ROW 2: Respondent and Examiner Details (4 Columns) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 8,
                  }}
                >
                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>اسم الأخصائي الفاحص</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      value={form.examinerName || ''}
                      onChange={e => setForm(f => ({ ...f, examinerName: e.target.value }))}
                      placeholder="اسم الأخصائي المشرف..."
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>اسم الفاحص / ولي الأمر</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      value={form.raterName || ''}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                      placeholder="اسم مقدم البيانات..."
                    />
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>صلة القرابة / الصفة</label>
                    <select
                      style={{ height: 32, fontSize: '0.82rem', padding: '2px 8px' }}
                      value={form.raterRelation || 'الأم'}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    >
                      <option value="الأم">الأم</option>
                      <option value="الأب">الأب</option>
                      <option value="معلم الصف">معلم الصف</option>
                      <option value="معلم التربية الخاصة">معلم التربية الخاصة</option>
                      <option value="أخصائي رعاية">أخصائي رعاية</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>

                  <div className="fl" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', marginBottom: 2 }}>مدة معرفة الطفل</label>
                    <input
                      style={{ height: 32, fontSize: '0.82rem' }}
                      value={form.relationshipDuration || ''}
                      onChange={e => setForm(f => ({ ...f, relationshipDuration: e.target.value }))}
                      placeholder="مثال: سنتان فأكثر، منذ الولادة..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Domain Filter Tabs & Quick Sample Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              background: 'var(--bg-card)',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
            }}
          >
            {/* Domain Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)' }}>
                تصفية المقاييس:
              </span>
              <button
                type="button"
                className={`btn btn-xs ${activeDomainFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveDomainFilter('all')}
                style={{ borderRadius: 20, fontSize: '0.76rem', fontWeight: 700 }}
              >
                جميع البنود (65)
              </button>
              {SRS2_DOMAINS.map(d => {
                const sub = psychometrics.subscales.find(s => s.id === d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={`btn btn-xs ${activeDomainFilter === d.id ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveDomainFilter(d.id)}
                    style={{
                      borderRadius: 20,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      border: activeDomainFilter === d.id ? 'none' : `1px solid ${d.color}44`,
                      color: activeDomainFilter === d.id ? '#fff' : d.color,
                      background: activeDomainFilter === d.id ? d.color : 'transparent',
                    }}
                  >
                    {d.name} ({d.itemsCount}) {sub?.answered ? `✓ ${sub.answered}` : ''}
                  </button>
                );
              })}
            </div>

            {/* Quick Fill Samples */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>⚡ تعبئة سريعة للتجربة:</span>
              <button
                type="button"
                className="btn btn-xs btn-ghost"
                onClick={() => autoFillSample('normal')}
                style={{ fontSize: '0.7rem', color: '#059669', borderColor: '#a7f3d0' }}
              >
                طبيعي
              </button>
              <button
                type="button"
                className="btn btn-xs btn-ghost"
                onClick={() => autoFillSample('mild')}
                style={{ fontSize: '0.7rem', color: '#d97706', borderColor: '#fde68a' }}
              >
                بسيط
              </button>
              <button
                type="button"
                className="btn btn-xs btn-ghost"
                onClick={() => autoFillSample('moderate')}
                style={{ fontSize: '0.7rem', color: '#ea580c', borderColor: '#fdba74' }}
              >
                متوسط
              </button>
              <button
                type="button"
                className="btn btn-xs btn-ghost"
                onClick={() => autoFillSample('severe')}
                style={{ fontSize: '0.7rem', color: '#dc2626', borderColor: '#fca5a5' }}
              >
                شديد
              </button>
              <button
                type="button"
                className="btn btn-xs btn-ghost"
                onClick={handleClearAll}
                style={{ fontSize: '0.7rem', color: '#64748b' }}
              >
                🔄 تصفير
              </button>
            </div>
          </div>

          {/* Active Domain Info Box (if filtered) */}
          {activeDomainFilter !== 'all' && (
            (() => {
              const dom = SRS2_DOMAINS.find(d => d.id === activeDomainFilter);
              const sub = psychometrics.subscales.find(s => s.id === activeDomainFilter);
              if (!dom) return null;
              return (
                <div
                  style={{
                    background: dom.bgLight,
                    border: `1px solid ${dom.borderColor}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: dom.color }}>
                      {dom.name} ({dom.englishName}) — كود المقياس: [{dom.code}]
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: 2 }}>
                      {dom.description}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="bdg" style={{ background: '#fff', border: `1px solid ${dom.color}`, color: dom.color, fontWeight: 700 }}>
                      الخام: {sub?.raw || 0} / {sub?.maxRaw || dom.itemsCount * 4}
                    </span>
                    <span className="bdg" style={{ background: dom.color, color: '#fff', fontWeight: 800 }}>
                      الدرجة التائية: {sub?.tScore || 35}T ({sub?.level || 'طبيعي'})
                    </span>
                  </div>
                </div>
              );
            })()
          )}

          {/* Items Evaluation Table */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 8px', width: '50px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>نص السلوك / البند التقييمي</th>
                    <th style={{ padding: '10px 8px', width: '120px', textAlign: 'center' }}>المجال</th>
                    <th style={{ padding: '10px 12px', width: '380px', textAlign: 'center' }}>
                      مستوى الاستجابة والتكرار الملاحظ
                    </th>
                    <th style={{ padding: '10px 10px', width: '170px', textAlign: 'right' }}>ملاحظات إكلينيكية</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const safeScores = form.scores || {};
                    const safeNotes = form.itemNotes || {};

                    if (filteredItems.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.86rem' }}>
                            ⚠️ لا توجد بنود مطابقة لهذه التصفية. يرجى اختيار مجال آخر أو اختيار "جميع البنود (65)".
                          </td>
                        </tr>
                      );
                    }

                    return filteredItems.map(it => {
                      const domain = SRS2_DOMAINS.find(d => d.id === it.domainId);
                      const currentScore = safeScores[it.id];
                      const note = safeNotes[it.id] || '';

                      let isSevereDeficit = false;
                      if (currentScore !== undefined && currentScore !== null) {
                        const scoredVal = it.isReverse ? 5 - Number(currentScore) : Number(currentScore);
                        isSevereDeficit = scoredVal >= 3;
                      }

                      return (
                        <tr
                          key={it.id}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: isSevereDeficit
                              ? (it.isReverse ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.07)')
                              : (currentScore !== undefined && currentScore !== null ? 'rgba(13, 148, 136, 0.03)' : 'transparent'),
                          }}
                        >
                          {/* Item ID */}
                          <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 800, color: 'var(--text-sub)' }}>
                            {it.id.replace('s', '')}
                          </td>

                          {/* Item Text */}
                          <td style={{ padding: '8px 12px', lineHeight: 1.5 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              {it.text}
                            </div>
                            {it.isReverse && (
                              <div style={{ marginTop: 2 }}>
                                <span
                                  className="bdg"
                                  style={{
                                    background: '#ecfdf5',
                                    color: '#047857',
                                    border: '1px solid #a7f3d0',
                                    fontSize: '0.66rem',
                                    fontWeight: 700,
                                  }}
                                  title="عبارة إيجابية تعكس درجاتها سيكومترياً لاحتساب القصور"
                                >
                                  🔄 بند إيجابي (درجة مقلوبة في المقياس)
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Domain Badge */}
                          <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                            <span
                              className="bdg"
                              style={{
                                background: domain?.bgLight || '#f1f5f9',
                                color: domain?.color || '#334155',
                                border: `1px solid ${domain?.borderColor || '#cbd5e1'}`,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                              }}
                            >
                              {domain?.code} · {domain?.name.split(' ')[0]}
                            </span>
                          </td>

                          {/* Response Options */}
                          <td style={{ padding: '8px 10px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                              {SRS2_RESPONSE_OPTIONS.map(opt => {
                                const isSelected = currentScore === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleScoreSelect(it.id, opt.value)}
                                    style={{
                                      padding: '6px 4px',
                                      borderRadius: 6,
                                      border: isSelected
                                        ? '2px solid #0d9488'
                                        : '1px solid var(--border-color)',
                                      background: isSelected
                                        ? '#0d9488'
                                        : 'var(--bg-card)',
                                      color: isSelected ? '#fff' : 'var(--text-main)',
                                      fontSize: '0.72rem',
                                      fontWeight: isSelected ? 800 : 500,
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      lineHeight: 1.2,
                                      transition: 'all 0.15s ease',
                                    }}
                                    title={opt.desc}
                                  >
                                    <div>{opt.value}</div>
                                    <div style={{ fontSize: '0.64rem', opacity: isSelected ? 1 : 0.8 }}>
                                      {opt.value === 1 ? 'غير صحيح' : opt.value === 2 ? 'أحياناً' : opt.value === 3 ? 'غالباً' : 'دائماً'}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* Item Qualitative Note */}
                          <td style={{ padding: '8px 8px' }}>
                            <input
                              type="text"
                              className="inp"
                              style={{
                                width: '100%',
                                fontSize: '0.74rem',
                                padding: '4px 6px',
                                borderRadius: 4,
                              }}
                              placeholder="ملاحظة نوعية..."
                              value={note}
                              onChange={e => handleItemNoteChange(it.id, e.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Summary & Evidence-Based Recommendations Section */}
          <div
            style={{
              background: 'var(--g0)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>📝</span>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  الخلاصة التشخيصية والتوصيات الإكلينيكية والتربوية (Clinical Narrative & IEP):
                </span>
              </div>
              <button
                type="button"
                className="btn btn-xs btn-primary"
                onClick={applyAutoClinicalSummary}
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  padding: '6px 14px',
                }}
              >
                ✨ توليد الخلاصة والتوصيات آلياً (Auto-Generate Narrative)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
              {/* Clinical Summary */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block', marginBottom: 4 }}>
                  التقرير والتشخيص الإكلينيكي (Clinical Summary):
                </label>
                <textarea
                  className="inp"
                  style={{
                    width: '100%',
                    minHeight: '140px',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    padding: '8px 12px',
                    borderRadius: 6,
                  }}
                  value={form.clinicalSummary}
                  onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                  placeholder="انقر على زر التوليد الآلي أعلاه، أو اكتب الخلاصة التشخيصية والملف النفسي العصبي للمفحوص..."
                />
              </div>

              {/* Recommendations */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block', marginBottom: 4 }}>
                  التوصيات التأهيلية وأهداف الخطة الفردية (IEP Recommendations):
                </label>
                <textarea
                  className="inp"
                  style={{
                    width: '100%',
                    minHeight: '140px',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    padding: '8px 12px',
                    borderRadius: 6,
                  }}
                  value={form.recommendations}
                  onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                  placeholder="التوصيات العلاجية، أساليب التدخل السلوكي (ABA)، برامج تدريب المهارات الاجتماعية، والمواءمات الصفية والمنزلية..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          className="modal-footer"
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)' }}>
              اكتمال الاستجابة: <strong style={{ color: '#0d9488' }}>{psychometrics.answeredCount}</strong> / {SRS2_ITEMS.length} بنداً
            </div>
            <div
              style={{
                width: 120,
                height: 8,
                background: '#e2e8f0',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${psychometrics.progressPercent}%`,
                  height: '100%',
                  background: psychometrics.progressPercent === 100 ? '#059669' : '#0d9488',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
            <span
              className="bdg"
              style={{
                background: psychometrics.progressPercent === 100 ? '#ecfdf5' : '#f1f5f9',
                color: psychometrics.progressPercent === 100 ? '#059669' : '#475569',
                border: `1px solid ${psychometrics.progressPercent === 100 ? '#a7f3d0' : '#cbd5e1'}`,
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {psychometrics.progressPercent}%
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleSafeClose}
              style={{ fontSize: '0.82rem', padding: '7px 16px', fontWeight: 700 }}
            >
              إلغاء وإغلاق
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                border: 'none',
                fontSize: '0.85rem',
                padding: '7px 24px',
                fontWeight: 800,
                color: '#fff',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)',
              }}
            >
              💾 حفظ المقياس واعتماد النتائج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
