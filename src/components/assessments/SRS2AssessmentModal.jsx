import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import {
  SRS2_ITEMS,
  SRS2_DOMAINS,
  SRS2_RESPONSE_OPTIONS,
  calculateSRS2Score,
} from '../../data/srs2Data';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_SRS2_FORM = {
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
  examinerRole: 'أخصائي نمائي / تشخيص',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  scores: {},
  clinicalSummary: '',
  recommendations: '',
};

export default function SRS2AssessmentModal({
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
        ...EMPTY_SRS2_FORM,
        ...initialData,
        scores: initialData.results || initialData.scores || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_SRS2_FORM,
      examinerName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState('all');

  // Real-time calculation of SRS-2 scores
  const results = useMemo(() => {
    return calculateSRS2Score(form.scores);
  }, [form.scores]);

  const answeredCount = useMemo(() => {
    return Object.keys(form.scores).filter(id => form.scores[id] !== undefined).length;
  }, [form.scores]);

  const progressPercent = Math.round((answeredCount / 65) * 100);

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

  function autoFillSample(level = 'mild') {
    const scores = {};
    SRS2_ITEMS.forEach(it => {
      // For SRS-2, raw answer is 1 to 4.
      // If isReverse is true: 1 gives 4 (severe deficit), 4 gives 1 (normal).
      // If isReverse is false: 1 gives 1 (normal), 4 gives 4 (severe deficit).
      if (level === 'normal') {
        scores[it.id] = it.isReverse ? 4 : 1;
      } else if (level === 'mild') {
        // Create mixed mild-normal responses
        scores[it.id] = (parseInt(it.id.replace('s', '')) % 3 === 0) ? (it.isReverse ? 3 : 2) : (it.isReverse ? 4 : 1);
      } else if (level === 'moderate') {
        scores[it.id] = (parseInt(it.id.replace('s', '')) % 2 === 0) ? (it.isReverse ? 2 : 3) : (it.isReverse ? 3 : 2);
      } else if (level === 'severe') {
        scores[it.id] = it.isReverse ? 1 : 4;
      }
    });

    setForm(f => ({ ...f, scores }));
    toast(`⚡ تم ملء إجابات افتراضية (${level === 'normal' ? 'طبيعي' : level === 'mild' ? 'بسيط' : level === 'moderate' ? 'متوسط' : 'شديد'}) لأغراض المعاينة والتجربة`, 'ok');
  }

  function applyAutoClinicalSummary() {
    if (answeredCount < 10) {
      toast('⚠️ يرجى تقييم عدد كافٍ من العبارات لتوليد الخلاصة التشخيصية', 'er');
      return;
    }

    const subscaleDetails = results.subscales.map(s => {
      return `• ${s.name}: الدرجة الخام (${s.raw}/${s.maxRaw}) ➔ الدرجة المعيارية (${s.tScore} T) - [مستوى القصور: ${s.level}]`;
    }).join('\n');

    const suggestedSummary = `بناءً على تطبيق مقياس الاستجابة الاجتماعية - الإصدار الثاني (SRS-2) المقنن لتشخيص صعوبات التفاعل الاجتماعي والتواصل الاجتماعي المتبادل:\n\nالنتائج السيكومترية الإجمالية:\n- مجموع الدرجات الخام الكلية: (${results.totalRawScore} من أصل 260).\n- الدرجة التائية المعيارية الإجمالية (Total T-Score): (${results.totalTScore} T).\n- التفسير الإكلينيكي للنتيجة: [${results.category}].\n\nأداء المفحوص على المقاييس الفرعية لـ SRS-2:\n${subscaleDetails}\n\nالوصف النفسي والانطباع التشخيصي:\n${results.interpretation}`;

    const isSevere = results.totalTScore >= 76;
    const isModerate = results.totalTScore >= 66 && results.totalTScore <= 75;
    const isMild = results.totalTScore >= 60 && results.totalTScore <= 65;

    const suggestedRecs = !results.isComplete
      ? 'يرجى إكمال تقييم جميع العبارات لتوليد التوصيات بدقة.'
      : results.totalTScore <= 59
      ? '1. لا تظهر نتائج المقياس مؤشرات دالة على وجود قصور اجتماعي أو تواصل متبادل ذي دلالة إكلينيكية.\n2. الاستمرار في تقديم فرص التفاعل الطبيعية مع الأقران لتعزيز المهارات الحالية.\n3. إعادة التقييم مستقبلاً عند الحاجة أو ظهور ملاحظات سلوكية جديدة.'
      : isMild
      ? '1. إدراج الطفل في مجموعات تدريب مصغرة على المهارات الاجتماعية (Social Skills Groups) للتركيز على قراءة تعابير الوجه والتواصل البصري.\n2. استخدام استراتيجية "القصص الاجتماعية" لمساعدته على فهم السياق الاجتماعي والمبادأة الإيجابية مع الأقران.\n3. تعزيز مبادرات التواصل اللفظي وغير اللفظي داخل الفصل والمنزل.\n4. تدريب الأسرة على توفير فرص حوار تفاعلية يومية وتجنب فترات الانعزال.'
      : isModerate
      ? '1. تصميم وتنفيذ خطة تربوية فردية (IEP) تركز على مهارات التفاعل المتبادل والدافعية الاجتماعية.\n2. توفير جلسات تخاطب وتربية خاصة لتنمية مهارات اللغة البراجماتية (الاجتماعية) وفهم المعاني الضمنية والمشتركة.\n3. إدراج الطفل في برنامج تدخل سلوكي يعتمد على تحليل السلوك التطبيقي (ABA) لتحسين مرونة السلوك والحد من الاهتمامات المقيدة.\n4. تدريب مكثف على المهارات الاجتماعية اليومية من خلال لعب الأدوار ونمذجة السلوك بالفيديو.\n5. تفعيل جدول بصري منظم لتقليل التوتر ومقاومة التغيير في الروتين.'
      : '1. برنامج تدخل علاجي وسلوكي شامل ومكثف (ABA) للحد من القصور الحاد في التواصل وإعاقة السلوك اليومي.\n2. جلسات تأهيل مكثفة للتواصل الوظيفي (Functional Communication Training) والتدريب على استخدام وسائل تواصل بديلة ومعززة (AAC) إذا تطلب الأمر.\n3. خطة تدخل سلوكي مرخصة ومراقبة لتقليل السلوكيات النمطية، والاهتمامات المقيدة الحادة، والسلوكيات القهرية بشكل آمن.\n4. تكامل حسي وعلاج وظيفي مستمر لمعالجة فرط أو ضعف التحسس للمثيرات البيئية.\n5. تنسيق كامل بين فريق متعدد التخصصات (طبيب نمائي، أخصائي تخاطب، محلل سلوك، معلم التربية الخاصة، والأسرة) لتوحيد أساليب الدعم.';

    setForm(f => ({
      ...f,
      clinicalSummary: suggestedSummary,
      recommendations: suggestedRecs,
    }));

    toast('✨ تم توليد الخلاصة التشخيصية والتوصيات آلياً بدقة للـ SRS-2', 'ok');
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

    if (answeredCount < 65) {
      if (!window.confirm(`⚠️ تم تقييم ${answeredCount} من أصل 65 بنداً. هل تود حفظ المقياس كمسودة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      id: form.id || uid(),
      measureId: 'srs',
      measureName: 'مقياس الاستجابة الاجتماعية (SRS-2)',
      category: 'autism',
      scaleType: 'srs2',
      score: results.totalRawScore || 0,
      maxScore: 260,
      percentage: results.isComplete ? `${results.totalTScore} T` : 'غير مكتمل',
      level: results.isComplete ? results.category : 'غير مكتمل',
      severityColor: results.isComplete ? results.severityColor : 'gray',
      results: form.scores,
      itemNotes: form.itemNotes,
      clinicalSummary: form.clinicalSummary,
      recommendations: form.recommendations,
      tScore: results.totalTScore || 0,
      rawScore: results.totalRawScore || 0,
      subscales: results.subscales || [],
      updatedAt: new Date().toISOString(),
    };

    if (form.id) {
      lsUpd('studentAssessments', form.id, payload);
      toast('✅ تم تحديث نتيجة مقياس SRS-2 بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', { ...payload, createdAt: new Date().toISOString() });
      toast('✅ تم حفظ نتيجة مقياس SRS-2 بنجاح وتحويلها لدرجات تائية معيارية', 'ok');
    }

    if (onSaved) onSaved();
    onClose();
  }

  const filteredItems = SRS2_ITEMS.filter(it => {
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
            background: 'linear-gradient(135deg, #059669, #047857)',
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
              <span style={{ fontSize: '1.3rem' }}>👥</span>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>
                مقياس الاستجابة الاجتماعية — الإصدار الثاني (SRS-2)
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
                65 عبارة مقننة
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '.78rem', opacity: 0.9 }}>
              Social Responsiveness Scale, 2nd Edition · تقنين إكلينيكي متوافق مع معايير DSM-5 وإعداد خطط IEP
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
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669', lineHeight: 1.2 }}>
                {results.totalRawScore}{' '}
                <span style={{ fontSize: '.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                  (من 260)
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>الدرجة التائية المعيارية T:</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#047857', lineHeight: 1.2 }}>
                {results.totalTScore} T
              </div>
            </div>

            <div style={{ minWidth: 200 }}>
              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', display: 'block' }}>المستوى والتصنيف الإكلينيكي:</span>
              <span
                style={{
                  fontSize: '.74rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: results.isComplete ? `${results.severityColor === 'green' ? '#10b981' : results.severityColor === 'yellow' ? '#f59e0b' : results.severityColor === 'orange' ? '#ea580c' : '#ef4444'}20` : 'var(--border-color)',
                  color: results.isComplete ? (results.severityColor === 'green' ? '#10b981' : results.severityColor === 'yellow' ? '#f59e0b' : results.severityColor === 'orange' ? '#ea580c' : '#ef4444') : 'var(--text-sub)',
                  border: `1px solid ${results.isComplete ? (results.severityColor === 'green' ? '#10b981' : results.severityColor === 'yellow' ? '#f59e0b' : results.severityColor === 'orange' ? '#ea580c' : '#ef4444') : 'var(--border-color)'}50`,
                  display: 'inline-block',
                  marginTop: 2,
                }}
              >
                {results.isComplete ? results.category : 'غير مكتمل'}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 3 }}>
                <span>البنود المقيمة:</span>
                <strong>{answeredCount} / 65 عبارة</strong>
              </div>
              <div style={{ width: '100%', height: 7, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: answeredCount === 65 ? 'var(--ok)' : '#059669',
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
                  placeholder="اسم الأخصائي النفسي أو الفاحص التشخيصي..."
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
                📈 مؤشرات الأداء والدرجات التائية الفرعية للـ SRS-2:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
                      {dr.tScore} T
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>
                      الخام: {dr.raw}/{dr.maxRaw} ({dr.level})
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
                background: activeDomainFilter === 'all' ? '#059669' : 'var(--bg-card)',
                color: activeDomainFilter === 'all' ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
              }}
            >
              🌐 جميع العبارات (65 بنداً)
            </button>
            {SRS2_DOMAINS.map(d => {
              const answered = SRS2_ITEMS.filter(it => it.domainId === d.id && form.scores[it.id] !== undefined).length;
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
                  {d.name} ({answered}/{d.itemsCount})
                </button>
              );
            })}
          </div>

          {/* Diagnostic Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredItems.map(it => {
              const currentScore = form.scores[it.id] !== undefined ? Number(form.scores[it.id]) : null;
              const domain = SRS2_DOMAINS.find(d => d.id === it.domainId);
              const globalIndex = SRS2_ITEMS.findIndex(x => x.id === it.id) + 1;

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
                          المجال الفرعي: <strong style={{ color: domain?.color }}>{domain?.name}</strong> {it.isReverse && <span style={{ color: 'var(--text-sub)', fontSize: '.7rem', fontWeight: 500 }}>(بند إيجابي - مقلوب الدرجة)</span>}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                          {it.text}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>الإجابة:</span>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 6,
                          background: currentScore !== null ? `${domain?.color || 'var(--pr)'}20` : 'var(--g0)',
                          color: currentScore !== null ? domain?.color || 'var(--pr)' : 'var(--text-sub)',
                          border: '1px solid var(--border-color)',
                          minWidth: 36,
                          textAlign: 'center',
                        }}
                      >
                        {currentScore !== null ? currentScore : '—'}
                      </span>
                    </div>
                  </div>

                  {/* 4-point Frequency Selection Buttons */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    {SRS2_RESPONSE_OPTIONS.map(opt => {
                      const isSelected = currentScore === opt.value;
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
                            border: isSelected ? `2px solid ${domain?.color || '#059669'}` : '1px solid var(--border-color)',
                            background: isSelected ? `${domain?.color || '#059669'}15` : 'var(--bg-card)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontWeight: 600, fontSize: '.88rem', color: isSelected ? domain?.color || '#059669' : 'var(--text-main)' }}>
                              {opt.label} ({opt.value})
                            </span>
                            {isSelected && <span style={{ color: domain?.color || '#059669', fontSize: '.9rem', fontWeight: 700 }}>✓</span>}
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
                    placeholder="ملاحظات وسياق الملاحظة السلوكية لهذا البند (اختياري)..."
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
                📝 الخلاصة التشخيصية والتوصيات الإكلينيكية (DSM-5)
              </div>
              <button
                type="button"
                className="btn btn-xs"
                onClick={applyAutoClinicalSummary}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#fff',
                  fontWeight: 800,
                  borderRadius: 8,
                  padding: '6px 12px',
                }}
              >
                ✨ توليد تلقائي ذكي بناءً على درجات SRS-2
              </button>
            </div>

            <div className="fl" style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 800, fontSize: '.84rem' }}>الخلاصة الإكلينيكية والانطباع التشخيصي:</label>
              <textarea
                rows={5}
                value={form.clinicalSummary}
                onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                placeholder="اكتب التقرير والملخص التشخيصي أو اضغط على التوليد التلقائي أعلاه..."
              />
            </div>

            <div className="fl">
              <label style={{ fontWeight: 800, fontSize: '.84rem' }}>التوصيات العلاجية والتربوية والتحويلات المقترحة:</label>
              <textarea
                rows={4}
                value={form.recommendations}
                onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                placeholder="التوصيات والبرامج المقترحة للتدخل (علاج تواصل, ABA, IEP)..."
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
              title="تعبئة درجات تجريبية (ضمن الحدود الطبيعية)"
            >
              ⚡ تجربة نموذج طبيعي
            </button>
            <button
              type="button"
              className="btn btn-xs btn-g"
              onClick={() => autoFillSample('mild')}
              title="تعبئة درجات تجريبية (قصور بسيط)"
            >
              ⚡ تجربة نموذج بسيط
            </button>
            <button
              type="button"
              className="btn btn-xs btn-g"
              onClick={() => autoFillSample('severe')}
              title="تعبئة درجات تجريبية (قصور شديد)"
            >
              ⚡ تجربة نموذج شديد
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
              style={{ fontWeight: 800, padding: '8px 22px', background: '#059669', color: '#fff' }}
            >
              💾 حفظ واعتماد تقييم SRS-2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
