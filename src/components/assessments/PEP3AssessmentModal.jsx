import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  PEP3_ITEMS,
  PEP3_DOMAINS,
  PEP3_RESPONSE_OPTIONS,
  calculatePEP3Score,
} from '../../data/pep3Data';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_PEP3_FORM = {
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
  examinerRole: 'أخصائي نمائي وتأهيل سلوكي',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function PEP3AssessmentModal({
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
        ...EMPTY_PEP3_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_PEP3_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');

  // Real-time calculation of PEP-3 scores
  const results = useMemo(() => {
    return calculatePEP3Score(form.scores);
  }, [form.scores]);

  const answeredCount = useMemo(() => {
    return Object.keys(form.scores).filter(id => form.scores[id] !== undefined).length;
  }, [form.scores]);

  const progressPercent = Math.round((answeredCount / 50) * 100);

  if (!isOpen) return null;

  function handleScoreSelect(itemId, value) {
    setForm(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [itemId]: Number(value),
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

  function autoFillSample(level = 'normal') {
    const scores = {};
    PEP3_ITEMS.forEach(it => {
      // 2: Pass, 1: Emerging, 0: Fail
      if (level === 'normal') {
        scores[it.id] = (parseInt(it.id.replace('pep3_', '')) % 8 === 0) ? 1 : 2;
      } else if (level === 'mild') {
        scores[it.id] = (parseInt(it.id.replace('pep3_', '')) % 2 === 0) ? 1 : 2;
      } else if (level === 'moderate') {
        scores[it.id] = (parseInt(it.id.replace('pep3_', '')) % 3 === 0) ? 2 : ((parseInt(it.id.replace('pep3_', '')) % 2 === 0) ? 1 : 0);
      } else if (level === 'severe') {
        scores[it.id] = (parseInt(it.id.replace('pep3_', '')) % 10 === 0) ? 1 : 0;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم ملء إجابات افتراضية (${level === 'normal' ? 'طبيعي' : level === 'mild' ? 'تأخر بسيط' : level === 'moderate' ? 'تأخر متوسط' : 'تأخر حاد'}) لأغراض التجربة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (answeredCount < 10) {
      toast('⚠️ يرجى تقييم عدد كافٍ من البنود لتوليد الخلاصة التشخيصية المعتمدة', 'er');
      return;
    }

    const subscaleDetails = results.subscales.map(s => {
      return `• ${s.name}: الدرجة الخام (${s.raw}/${s.maxRaw}) ➔ الدرجة المعيارية الموازية (${s.tScore} T) - [مستوى الأداء: ${s.level}]`;
    }).join('\n');

    const suggestedSummary = `بناءً على تطبيق ملف التقييم النفسي التربوي للتوحد - الإصدار الثالث (PEP-3) المقنن والمطور لقياس مهارات النمو والسلوك التكيفي:\n\nالنتائج السيكومترية العامة:\n- مجموع الدرجات الخام الكلية: (${results.totalRawScore} من أصل 100).\n- السن النمائي التقديري الشامل: (${results.estimatedDevelopmentalAge}).\n- التقدير العام للقصور والفجوة النمائية: [${results.overallLevel}].\n\nأداء المفحوص التفصيلي على المقاييس الفرعية لـ PEP-3:\n${subscaleDetails}\n\nالتحليل والوصف النمائي:\n${results.interpretation}`;

    const isSevere = results.totalRawScore < 40;
    const isModerate = results.totalRawScore >= 40 && results.totalRawScore < 60;
    const isMild = results.totalRawScore >= 60 && results.totalRawScore < 80;

    const suggestedRecs = !results.isComplete
      ? 'يرجى إكمال تقييم جميع العبارات لتوليد التوصيات بدقة.'
      : results.totalRawScore >= 80
      ? '1. لا توجد فجوة نمائية كبرى دالة؛ مهارات الطفل تقع في النطاق الطبيعي المقارب لسنّه الحقيقي.\n2. التركيز على دمج الطفل بالأنشطة الأكاديمية والاجتماعية العامة بالروضة والمنزل.\n3. تعزيز دافعية التواصل والتعبير الحر.'
      : isMild
      ? '1. استهداف بنود البزوغ (Emerging) التي حصل فيها الطفل على درجة (1) لبناء أهداف خطة الدعم الفردية (IEP) فوراً.\n2. تحفيز مهارات التواصل التعبيري من خلال التدريب على بناء جمل بسيطة ثنائية وثلاثية.\n3. تدريب حركي دقيق يومي (لضم خرز، قص مستقيم، تلوين) لرفع مستوى التآزر البصري الحركي.\n4. تعزيز الدمج الاجتماعي مع الأقران والطلب التلقائي للمساعدة.'
      : isModerate
      ? '1. تصميم برنامج تدخل سلوكي مكثف يركز على تيسير لغة التواصل الوظيفي للحد من الإحباط السلوكي.\n2. تنمية مهارات الإدراك قبل اللفظي (المطابقة، التصنيف، حل البازل البسيط) لرفع الكفاءة المعرفية.\n3. التركيز على مهارات اللغة الاستقبالية من خلال التوجيه بالصور وتجزئة الأوامر المركبة.\n4. تفعيل برنامج علاج وظيفي وتكامل حسي لمعالجة تآزر الأصابع والعضلات الدقيقة.\n5. تدريب الوالدين على استخدام جدول بصري للمهام المنزلية ونمذجة التبادل الاجتماعي.'
      : '1. حاجة ماسة لبرنامج تدخل مبكر علاجي وسلوكي شامل عالي الكثافة (أكثر من 20 ساعة أسبوعياً ABA) لردم الفجوة النمائية العميقة.\n2. استخدام برامج تواصل بديلة ومعززة (AAC / PECS) لتخفيف حظر التواصل التعبيري الحاد.\n3. برنامج تأهيلي مكثف لعلاج عيوب النطق ومخارج الحروف مع تدريبات عضلات النطق.\n4. خطة رعاية ذاتية وتأهيل للمهارات الحياتية اليومية (تفريش الأسنان، دخول الحمام، تناول الطعام).\n5. إدراج الطفل في أنشطة علاج حسي وظيفي متكامل لتقليل السلوكيات النمطية ومقاومة التغيير.';

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد الخلاصة السيكومترية والتوصيات آلياً بدقة لـ PEP-3 المطور', 'ok');
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

    if (answeredCount < 50) {
      if (!window.confirm(`⚠️ تم تقييم ${answeredCount} من أصل 50 بنداً. هل تود حفظ المقياس كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      id: form.id || uid(),
      measureId: 'pep3',
      measureName: 'الملف النفسي التربوي للتوحد (PEP-3)',
      category: 'autism',
      scaleType: 'pep3',
      score: results.totalRawScore || 0,
      maxScore: 100,
      percentage: results.isComplete ? results.estimatedDevelopmentalAge : 'غير مكتمل',
      level: results.isComplete ? results.overallLevel : 'غير مكتمل',
      severityColor: results.isComplete ? results.overallColor : 'gray',
      results: form.scores,
      itemNotes: form.itemNotes,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      estimatedAge: results.estimatedDevelopmentalAge || '',
      percentile: results.percentile || 0,
      rawScore: results.totalRawScore || 0,
      subscales: results.subscales || [],
      updatedAt: new Date().toISOString(),
    };

    if (form.id) {
      lsUpd('studentAssessments', form.id, payload);
      toast('✅ تم تحديث نتيجة تقييم PEP-3 بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', { ...payload, createdAt: new Date().toISOString() });
      toast('✅ تم حفظ نتيجة تقييم PEP-3 بنجاح وتحويلها لسن نمائي معتمد', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  const filteredItems = PEP3_ITEMS.filter(it => {
    if (activeDomainFilter === 'all') return true;
    return it.domainId === activeDomainFilter;
  });

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div className="mb mb-xl"
        
      >
        {/* Modal Header */}
        <div
          className="modal-header-custom fhd"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
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
              <span style={{ fontSize: '1.3rem' }}>📋</span>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>
                ملف التقييم النفسي التربوي للتوحد — الإصدار الثالث (PEP-3) المطور
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
                50 بنداً نمائياً معتمداً
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '.78rem', opacity: 0.9 }}>
              Psychoeducational Profile - Third Edition · حساب السن النمائي، ونقاط القوة والاحتياج وتوليد أهداف الخطة الفردية
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
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة الخام الإجمالية:</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#2563eb', lineHeight: 1.2 }}>
                {results.totalRawScore}{' '}
                <span style={{ fontSize: '.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                  (من 100)
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>السن النمائي المقدر:</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1d4ed8', lineHeight: 1.2 }}>
                {results.isComplete ? results.estimatedDevelopmentalAge : 'غير مكتمل'}
              </div>
            </div>

            <div style={{ minWidth: 200 }}>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>المستوى التشخيصي العام:</span>
              <span
                style={{
                  fontSize: '.74rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: results.isComplete ? `${results.overallColor === 'green' ? '#10b981' : results.overallColor === 'yellow' ? '#f59e0b' : results.overallColor === 'orange' ? '#ea580c' : '#ef4444'}20` : 'var(--border-color)',
                  color: results.isComplete ? (results.overallColor === 'green' ? '#10b981' : results.overallColor === 'yellow' ? '#f59e0b' : results.overallColor === 'orange' ? '#ea580c' : '#ef4444') : 'var(--text-sub)',
                  border: `1px solid ${results.isComplete ? (results.overallColor === 'green' ? '#10b981' : results.overallColor === 'yellow' ? '#f59e0b' : results.overallColor === 'orange' ? '#ea580c' : '#ef4444') : 'var(--border-color)'}50`,
                  display: 'inline-block',
                  marginTop: 2,
                }}
              >
                {results.isComplete ? results.overallLevel : 'غير مكتمل'}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 3 }}>
                <span>البنود المقيمة:</span>
                <strong>{answeredCount} / 50 بنداً</strong>
              </div>
              <div style={{ width: '100%', height: 7, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: answeredCount === 50 ? 'var(--ok)' : '#2563eb',
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
                  placeholder="اسم الأخصائي النفسي أو أخصائي التربية الخاصة..."
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
                <select
                  value={form.raterRelation}
                  onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                >
                  <option value="الأم">الأم</option>
                  <option value="الأب">الأب</option>
                  <option value="المعلم">المعلم</option>
                  <option value="الأخصائي">الأخصائي</option>
                  <option value="ولي الأمر">مستجيب آخر</option>
                </select>
              </div>

              <div className="fl">
                <label style={{ fontWeight: 800, fontSize: '.84rem' }}>مدة معرفة الطفل</label>
                <input
                  value={form.relationshipDuration}
                  onChange={e => setForm(f => ({ ...f, relationshipDuration: e.target.value }))}
                  placeholder="مثال: سنتان"
                />
              </div>
            </div>
          </div>

          {/* Subscales Quick Overview Matrix */}
          {results.isComplete && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
                📈 مؤشرات الأداء والدرجات المعيارية لأبعاد PEP-3:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 8,
                }}
              >
                {results.subscales.map(dr => (
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
                      {dr.name.split(' (')[0]}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: dr.color, margin: '2px 0' }}>
                      {dr.raw} / {dr.maxRaw}
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>
                      الدرجة T: {dr.tScore} ({dr.level})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Domains Filter Bar */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setActiveDomainFilter('all')}
              style={{
                borderRadius: 8,
                padding: '6px 12px',
                background: activeDomainFilter === 'all' ? '#2563eb' : 'var(--bg-card)',
                color: activeDomainFilter === 'all' ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
              }}
            >
              🌐 جميع بنود PEP-3 (50 بنداً)
            </button>
            {PEP3_DOMAINS.map(d => {
              const answered = PEP3_ITEMS.filter(it => it.domainId === d.id && form.scores[it.id] !== undefined).length;
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
                  {d.name.split(' (')[0]} ({answered}/{d.itemsCount})
                </button>
              );
            })}
          </div>

          {/* Diagnostic Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredItems.map(it => {
              const currentScore = form.scores[it.id] !== undefined ? Number(form.scores[it.id]) : null;
              const domain = PEP3_DOMAINS.find(d => d.id === it.domainId);
              const globalIndex = PEP3_ITEMS.findIndex(x => x.id === it.id) + 1;

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
                        {globalIndex}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', marginBottom: 3 }}>
                          البعد الفرعي: <strong style={{ color: domain?.color }}>{domain?.name}</strong>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                          {it.text}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>النتيجة:</span>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 6,
                          background: currentScore !== null ? `${domain?.color || 'var(--pr)'}20` : 'var(--g0)',
                          color: currentScore !== null ? domain?.color || 'var(--pr)' : 'var(--text-sub)',
                          border: '1px solid var(--border-color)',
                          minWidth: 50,
                          textAlign: 'center',
                        }}
                      >
                        {currentScore === 2 ? 'منجز (P)' : currentScore === 1 ? 'بزوغ (E)' : currentScore === 0 ? 'إخفاق (F)' : '—'}
                      </span>
                    </div>
                  </div>

                  {/* 3-point Selection Buttons */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    {PEP3_RESPONSE_OPTIONS.map(opt => {
                      const isSelected = currentScore === opt.value;
                      let btnColor = opt.value === 2 ? '#16a34a' : opt.value === 1 ? '#ca8a04' : '#dc2626';
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleScoreSelect(it.id, opt.value)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '10px 12px',
                            borderRadius: 8,
                            textAlign: 'right',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            border: isSelected ? `2px solid ${btnColor}` : '1px solid var(--border-color)',
                            background: isSelected ? `${btnColor}12` : 'var(--bg-card)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontWeight: 800, fontSize: '.88rem', color: isSelected ? btnColor : 'var(--text-main)' }}>
                              {opt.label} — {opt.value === 2 ? 'منجز' : opt.value === 1 ? 'بزوغ (أهداف الخطة الفردية)' : 'إخفاق'}
                            </span>
                            {isSelected && <span style={{ color: btnColor, fontSize: '.9rem', fontWeight: 700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginTop: 4, lineHeight: 1.4 }}>
                            {opt.text}
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
                    placeholder="ملاحظات الأخصائي حول استجابة الطفل (اختياري)..."
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
                📝 الخلاصة السيكومترية والتقرير الأكاديمي المطور (PEP-3)
              </div>
              <button
                type="button"
                className="btn btn-xs"
                onClick={applyAutoClinicalSummary}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#fff',
                  fontWeight: 800,
                  borderRadius: 8,
                  padding: '6px 12px',
                }}
              >
                ✨ توليد تلقائي ذكي بناءً على درجات بيب-3
              </button>
            </div>

            <div className="fl" style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 800, fontSize: '.84rem' }}>التقرير الإكلينيكي والوصف النمائي:</label>
              <textarea
                rows={6}
                value={form.clinicalSummary}
                onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                placeholder="اكتب التقرير والملخص التشخيصي أو اضغط على التوليد التلقائي أعلاه..."
              />
            </div>

            <div className="fl">
              <label style={{ fontWeight: 800, fontSize: '.84rem' }}>أبرز التوصيات العلاجية والتربوية وخطط الدمج:</label>
              <textarea
                rows={5}
                value={form.recommendations}
                onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                placeholder="التوصيات والبرامج المقترحة للتدخل بناءً على التقييم..."
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
              onClick={() => autoFillSample('normal')}
              title="تعبئة درجات تجريبية (عمر نمائي طبيعي مناسب)"
            >
              ⚡ نموذج طبيعي
            </button>
            <button
              type="button"
              className="btn btn-xs btn-g"
              onClick={() => autoFillSample('mild')}
              title="تعبئة درجات تجريبية (تأخر بسيط)"
            >
              ⚡ تأخر بسيط
            </button>
            <button
              type="button"
              className="btn btn-xs btn-g"
              onClick={() => autoFillSample('severe')}
              title="تعبئة درجات تجريبية (تأخر حاد)"
            >
              ⚡ تأخر حاد
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
              style={{ fontWeight: 800, padding: '8px 22px', background: '#2563eb', color: '#fff' }}
            >
              💾 حفظ واعتماد تقييم PEP-3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
