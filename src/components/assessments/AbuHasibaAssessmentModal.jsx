import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import {
  ABUHASIBA_RECEPTIVE_ITEMS,
  ABUHASIBA_EXPRESSIVE_ITEMS,
  ABUHASIBA_AGE_STAGES,
  getAbuHasibaAgeStageByMonths,
  getAbuHasibaStartingPoints,
  calculateAbuHasibaPsychometrics
} from '../../data/abuhasibaData';

const EMPTY_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  specialistName: '',
  date: todayStr(),
  notes: '',
  resultsReceptive: {}, // r_1, r_2 ... -> 0 or 1
  resultsExpressive: {}, // e_1, e_2 ... -> 0 or 1
  clinicalSummary: '',
  recommendations: '',
  acknowledgedNotice: false,
};

export default function AbuHasibaAssessmentModal({
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
        ...EMPTY_FORM,
        ...initialData,
        resultsReceptive: initialData.resultsReceptive || {},
        resultsExpressive: initialData.resultsExpressive || {},
        acknowledgedNotice: true,
      };
    }
    return {
      ...EMPTY_FORM,
      specialistName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeTab, setActiveTab] = useState('receptive'); // 'receptive' | 'expressive' | 'summary'
  const [acknowledged, setAcknowledged] = useState(() => !!initialData);
  const [selectedAgeFilter, setSelectedAgeFilter] = useState('all');

  // Calculate student chronological age in months
  const studentAgeMonths = useMemo(() => {
    if (!form.dob) return 36; // Default 3 years
    const ageObj = calcAge(form.dob);
    return Math.max(2, ageObj.years * 12 + ageObj.months);
  }, [form.dob]);

  // Recommended starting points based on age
  const startingPoints = useMemo(() => {
    return getAbuHasibaStartingPoints(studentAgeMonths);
  }, [studentAgeMonths]);

  // Live psychometrics and scoring engine integration
  const scoring = useMemo(() => {
    const rawReceptive = {};
    const rawExpressive = {};
    
    // Extract receptive responses (removing r_ prefix)
    Object.entries(form.resultsReceptive || {}).forEach(([k, v]) => {
      const id = k.replace('r_', '');
      rawReceptive[id] = v;
    });

    // Extract expressive responses (removing e_ prefix)
    Object.entries(form.resultsExpressive || {}).forEach(([k, v]) => {
      const id = k.replace('e_', '');
      rawExpressive[id] = v;
    });

    return calculateAbuHasibaPsychometrics(rawReceptive, rawExpressive, studentAgeMonths);
  }, [form.resultsReceptive, form.resultsExpressive, studentAgeMonths]);

  // Handle setting a score of 1 or 0 for an item
  const handleItemScoreChange = (type, itemId, score) => {
    const key = type === 'receptive' ? `r_${itemId}` : `e_${itemId}`;
    const resultsKey = type === 'receptive' ? 'resultsReceptive' : 'resultsExpressive';

    setForm(prev => ({
      ...prev,
      [resultsKey]: {
        ...prev[resultsKey],
        [key]: score
      }
    }));
  };

  // Quick Action: Autofill all preceding items below Basal as 1
  const applyBasalAutofill = (type) => {
    const isReceptive = type === 'receptive';
    const items = isReceptive ? ABUHASIBA_RECEPTIVE_ITEMS : ABUHASIBA_EXPRESSIVE_ITEMS;
    const basalIndex = isReceptive ? scoring.receptiveBasalIndex : scoring.expressiveBasalIndex;
    const resultsKey = isReceptive ? 'resultsReceptive' : 'resultsExpressive';
    const prefix = isReceptive ? 'r_' : 'e_';

    if (basalIndex === -1) {
      toast('⚠️ لم يتم تحديد قاعدة تطبيق (Basal) صحيحة بعد (يجب وجود 3 بنود متتالية صحيحة)', 'warn');
      return;
    }

    const updatedResults = { ...form[resultsKey] };
    for (let i = 0; i < basalIndex; i++) {
      updatedResults[`${prefix}${items[i].id}`] = 1;
    }

    setForm(prev => ({
      ...prev,
      [resultsKey]: updatedResults
    }));
    toast('✅ تم تعبئة جميع البنود ما قبل قاعدة البداية بدرجة (1) بنجاح مجاناً', 'ok');
  };

  // Quick Action: Autofill all succeeding items above Ceiling as 0
  const applyCeilingAutofill = (type) => {
    const isReceptive = type === 'receptive';
    const items = isReceptive ? ABUHASIBA_RECEPTIVE_ITEMS : ABUHASIBA_EXPRESSIVE_ITEMS;
    const ceilingIndex = isReceptive ? scoring.receptiveCeilingIndex : scoring.expressiveCeilingIndex;
    const resultsKey = isReceptive ? 'resultsReceptive' : 'resultsExpressive';
    const prefix = isReceptive ? 'r_' : 'e_';

    if (ceilingIndex === -1) {
      toast('⚠️ لم يتم رصد سقف اختبار (Ceiling) بعد (يتطلب 5 بنود متتالية خاطئة)', 'warn');
      return;
    }

    const updatedResults = { ...form[resultsKey] };
    for (let i = ceilingIndex + 5; i < items.length; i++) {
      updatedResults[`${prefix}${items[i].id}`] = 0;
    }

    setForm(prev => ({
      ...prev,
      [resultsKey]: updatedResults
    }));
    toast('✅ تم تصفير جميع البنود التالية لسقف الاختبار (0) بنجاح', 'ok');
  };

  const handleSave = () => {
    if (!form.stuId) {
      toast('⚠️ الرجاء اختيار الطالب أولاً', 'warn');
      return;
    }

    const finalAssessment = {
      id: initialData?.id || uid(),
      measureId: 'abuhasiba_arabic_lang',
      measureName: 'مقياس د. أحمد أبو حسيبة للغة المعرب (PLS)',
      scaleType: 'abuhasiba_arabic_lang',
      stuId: form.stuId,
      studentName: form.studentName,
      dob: form.dob,
      age: form.age,
      diagnosis: form.diagnosis,
      specialistName: form.specialistName,
      date: form.date,
      notes: form.notes,
      
      // Raw, standard and developmental scores
      score: scoring.totalRawScore,
      receptiveRaw: scoring.receptiveRawScore,
      expressiveRaw: scoring.expressiveRawScore,
      standardScore: scoring.totalSS,
      receptiveSS: scoring.receptiveSS,
      expressiveSS: scoring.expressiveSS,
      percentile: scoring.totalPR,
      receptivePR: scoring.receptivePR,
      expressivePR: scoring.expressivePR,
      
      // Age Equivalents and Delays
      ageEquivalent: `${Math.floor(scoring.totalLAEMonths / 12)} سنوات و ${scoring.totalLAEMonths % 12} شهور`,
      receptiveLAEMonths: scoring.receptiveLAEMonths,
      expressiveLAEMonths: scoring.expressiveLAEMonths,
      totalLAEMonths: scoring.totalLAEMonths,
      delayGap: `${Math.floor(scoring.totalDelayGapMonths / 12)} سنوات و ${scoring.totalDelayGapMonths % 12} شهور`,
      totalDelayGapMonths: scoring.totalDelayGapMonths,
      receptiveDelayGapMonths: scoring.receptiveDelayGapMonths,
      expressiveDelayGapMonths: scoring.expressiveDelayGapMonths,
      
      clinicalClassification: scoring.clinicalClassification,
      cutoffText: scoring.cutoffText,
      level: scoring.totalSS < 77.5 ? 'تأخر لغوي' : 'طبيعي',
      
      // Items and goals
      resultsReceptive: form.resultsReceptive,
      resultsExpressive: form.resultsExpressive,
      receptiveWeaknesses: scoring.receptiveWeaknesses,
      expressiveWeaknesses: scoring.expressiveWeaknesses,
      clinicalSummary: form.clinicalSummary || `تم إجراء تقييم شامل للغة باستخدام مقياس الدكتور أحمد أبو حسيبة للغة المعرب. حقق الطفل درجة خام كلية بلغت [${scoring.totalRawScore}] مما يكافئ عمراً لغوياً كلياً قدره [${Math.floor(scoring.totalLAEMonths / 12)} سنوات و ${scoring.totalLAEMonths % 12} أشهر]، وهو ما يشير إلى ${scoring.clinicalClassification}. بلغت فجوة التأخر اللغوي [${Math.floor(scoring.totalDelayGapMonths / 12)} سنوات و ${scoring.totalDelayGapMonths % 12} أشهر].`,
      recommendations: form.recommendations || `1. تدريب الطفل على البنود غير المجتازة في الجانب الاستقبالي والتعبيري. \n2. إدراج الأهداف السلوكية المقترحة في الخطة التربوية الفردية (IEP) للطفل. \n3. تكثيف الأنشطة المنزلية الداعمة للنمو اللغوي.`
    };

    if (initialData) {
      lsUpd('studentAssessments', initialData.id, finalAssessment);
      toast('💾 تم تعديل وحفظ تقييم الدكتور أبو حسيبة للغة المعرب بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', finalAssessment);
      toast('💾 تم تسجيل تقييم الدكتور أبو حسيبة للغة المعرب بنجاح', 'ok');
    }

    if (onSaved) onSaved(finalAssessment);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div className="mb" style={{ maxWidth: '1000px', width: '100%', padding: 0, overflow: 'hidden', borderRadius: 16 }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g0)', padding: '14px 20px', borderBottom: '1px solid var(--border-color)', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0369a1', lineHeight: 1.3, wordBreak: 'break-word' }}>
              🧠 تقييم مقياس د. أحمد أبو حسيبة للغة المعرب (PLS)
            </h2>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)', display: 'block', marginTop: 2, whiteSpace: 'normal' }}>
              أداة القياس السيكومترية واللغوية التفاعلية للأطفال (شهرين وحتى 7 سنوات و5 أشهر)
            </span>
          </div>
          <button type="button" className="btn btn-xs btn-p" onClick={onClose} style={{ fontWeight: 800, flexShrink: 0 }}>✖ إغلاق</button>
        </div>

        {/* Clinical Notice Page before assessment */}
        {!acknowledged ? (
          <div style={{ padding: '30px 40px', background: '#fff', direction: 'rtl', textAlign: 'right' }}>
            <div style={{ background: '#f0f9ff', borderLeft: '5px solid #0384c7', borderRadius: 12, padding: 24, marginBottom: 28 }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '1.15rem', fontWeight: 900 }}>⚠️ تنبيه وإرشاد إكلينيكي مهم للأخصائي (Clinical Disclaimer)</h3>
              <p style={{ margin: 0, fontSize: '0.96rem', lineHeight: 1.7, color: '#1e293b', fontWeight: 700 }}>
                "عزيزي الأخصائي/المصفي: هذا النظام الرقمي مخصص لتسجيل النتائج ومعالجة الدرجات إلكترونياً فقط. يُشترط لتطبيق هذا الاختبار استخدام كتيب الصور والأدوات الحسية الأصلية الخاصة بمقياس الدكتور أحمد أبو حسيبة، والحصول عليها وشرائها من الجهة المعتمدة المالك لحقوق النشر، لضمان صحة وسلامة تطبيق المقياس وفق المعايير السيكومترية الرسمية."
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-lg"
                style={{ background: '#0369a1', color: '#fff', padding: '12px 40px', fontSize: '1rem', fontWeight: 800, borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(3 105 161 / 0.2)' }}
                onClick={() => {
                  setAcknowledged(true);
                  setForm(prev => ({ ...prev, acknowledgedNotice: true }));
                }}
              >
                لقد قرأت التنبيه وأقر بامتلاك أدوات المقياس الأصلية 🔗
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', background: 'var(--bg)', overflow: 'hidden' }}>
            
            {/* Top Student Selection Block */}
            <div style={{ padding: '14px 20px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, flexShrink: 0 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>اختر الطالب المستهدف:</label>
                <StudentPicker
                  form={form}
                  setForm={setForm}
                  students={students}
                  emps={emps}
                  showExtra={false}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-sub)' }}>تاريخ الميلاد:</span>
                  <input
                    type="date"
                    value={form.dob || ''}
                    onChange={(e) => {
                      const dobVal = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        dob: dobVal,
                        age: dobVal ? calcAge(dobVal) : '',
                      }));
                    }}
                    style={{ fontSize: '0.74rem', padding: '2px 4px', width: '100%', border: '1px solid var(--border-color)', borderRadius: 4, background: '#fff', textAlign: 'center', marginTop: 4 }}
                  />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-sub)' }}>العمر الزمني:</span>
                  <strong style={{ fontSize: '0.9rem', display: 'block', marginTop: 4 }}>{form.age || '—'}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-sub)' }}>نقطة الاستقبالية:</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0369a1', display: 'block', marginTop: 4 }}>بند {startingPoints.receptiveStart}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-sub)' }}>نقطة التعبيرية:</span>
                  <strong style={{ fontSize: '0.9rem', color: '#0f766e', display: 'block', marginTop: 4 }}>بند {startingPoints.expressiveStart}</strong>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '10px 20px', display: 'flex', flexWrap: 'wrap', gap: '10px 16px', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: '#166534' }}>الدرجة الكلية الخام: </span>
                  <strong style={{ fontSize: '0.92rem', color: '#14532d' }}>{scoring.totalRawScore} / 133</strong>
                </div>
                <div style={{ width: 1, height: 14, background: '#bbf7d0' }} />
                <div>
                  <span style={{ fontSize: '0.76rem', color: '#166534' }}>العمر اللغوي المكافئ: </span>
                  <strong style={{ fontSize: '0.92rem', color: '#14532d' }}>{Math.floor(scoring.totalLAEMonths / 12)}س و {scoring.totalLAEMonths % 12}ش</strong>
                </div>
                <div style={{ width: 1, height: 14, background: '#bbf7d0' }} />
                <div>
                  <span style={{ fontSize: '0.76rem', color: '#166534' }}>التأخر اللغوي: </span>
                  <strong style={{ fontSize: '0.92rem', color: '#b91c1c' }}>{Math.floor(scoring.totalDelayGapMonths / 12)}س و {scoring.totalDelayGapMonths % 12}ش</strong>
                </div>
                <div style={{ width: 1, height: 14, background: '#bbf7d0' }} />
                <div>
                  <span style={{ fontSize: '0.76rem', color: '#166534' }}>الدرجة المعيارية: </span>
                  <strong style={{ fontSize: '0.92rem', color: '#14532d' }}>{scoring.totalSS} (مئيني: {scoring.totalPR}%)</strong>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: 12, background: scoring.severityColor, color: '#fff', fontWeight: 800 }}>
                  {scoring.clinicalClassification.split('(')[0]}
                </span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <button
                type="button"
                style={{ flex: 1, padding: '12px 20px', border: 'none', background: activeTab === 'receptive' ? '#0369a1' : 'transparent', color: activeTab === 'receptive' ? '#fff' : 'var(--text)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setActiveTab('receptive')}
              >
                📥 اللغة الاستقبالية (62 بنداً)
              </button>
              <button
                type="button"
                style={{ flex: 1, padding: '12px 20px', border: 'none', background: activeTab === 'expressive' ? '#0f766e' : 'transparent', color: activeTab === 'expressive' ? '#fff' : 'var(--text)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setActiveTab('expressive')}
              >
                📤 اللغة التعبيرية (71 بنداً)
              </button>
              <button
                type="button"
                style={{ flex: 1, padding: '12px 20px', border: 'none', background: activeTab === 'summary' ? 'var(--g2)' : 'transparent', color: 'var(--text)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', borderLeft: '1px solid var(--border-color)' }}
                onClick={() => setActiveTab('summary')}
              >
                📊 التقرير والتشخيص والتوصيات
              </button>
            </div>

            {/* Content Pane */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#fff' }}>
              
              {/* Receptive and Expressive Tab Checklists */}
              {(activeTab === 'receptive' || activeTab === 'expressive') && (
                <div>
                  
                  {/* Basal & Ceiling Quick Actions Panel */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>حالة الخط القاعدي (Basal) الحالي:</span>
                        <strong style={{ fontSize: '0.86rem', color: (activeTab === 'receptive' ? scoring.receptiveBasalIndex : scoring.expressiveBasalIndex) !== -1 ? '#16a34a' : '#ea580c' }}>
                          {(activeTab === 'receptive' ? scoring.receptiveBasalIndex : scoring.expressiveBasalIndex) !== -1 
                            ? `✓ تم تحقيقه (من البند ${activeTab === 'receptive' ? scoring.receptiveBasalIndex + 1 : scoring.expressiveBasalIndex + 1})`
                            : '⚠️ لم يتحقق بعد (يتطلب 3 متتالية صحيحة)'}
                        </strong>
                      </div>
                      <div style={{ width: 1, height: 24, background: '#cbd5e1' }} />
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>حالة حد التوقف (Ceiling) الحالي:</span>
                        <strong style={{ fontSize: '0.86rem', color: (activeTab === 'receptive' ? scoring.receptiveCeilingIndex : scoring.expressiveCeilingIndex) !== -1 ? '#dc2626' : '#2563eb' }}>
                          {(activeTab === 'receptive' ? scoring.receptiveCeilingIndex : scoring.expressiveCeilingIndex) !== -1 
                            ? `✗ تم رصده (عند البند ${activeTab === 'receptive' ? scoring.receptiveCeilingIndex + 1 : scoring.expressiveCeilingIndex + 1})`
                            : '✓ لم يصله الطفل (أقل من 5 أخطاء متتالية)'}
                        </strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-xs"
                        onClick={() => applyBasalAutofill(activeTab)}
                        style={{ border: '1px solid #16a34a', color: '#16a34a', background: '#f0fdf4', fontWeight: 800 }}
                      >
                        🎁 منح ما قبل الخط القاعدي مجاناً
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs"
                        onClick={() => applyCeilingAutofill(activeTab)}
                        style={{ border: '1px solid #ef4444', color: '#ef4444', background: '#fef2f2', fontWeight: 800 }}
                      >
                        🛑 تصفير ما بعد حد التوقف
                      </button>
                    </div>
                  </div>

                  {/* Age Stage Filter Control Bar */}
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0369a1' }}>
                          🔍 تصفية البنود بحسب المستوى والسن بالشهور:
                        </span>
                        <select
                          value={selectedAgeFilter}
                          onChange={(e) => setSelectedAgeFilter(e.target.value)}
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: '1px solid #0284c7',
                            background: '#fff',
                            color: '#0369a1',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="all">عرض جميع الفئات العمرية (الكل)</option>
                          {ABUHASIBA_AGE_STAGES.map(stage => (
                            <option key={stage.value} value={stage.value}>
                              {stage.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quick jump button based on student's age */}
                      {studentAgeMonths > 0 && (
                        <button
                          type="button"
                          className="btn btn-xs"
                          onClick={() => {
                            const childStage = getAbuHasibaAgeStageByMonths(studentAgeMonths);
                            if (childStage) setSelectedAgeFilter(childStage.value);
                          }}
                          style={{
                            background: '#0284c7',
                            color: '#fff',
                            fontWeight: 800,
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer'
                          }}
                        >
                          🎯 تصفية حسب فئة عمر الطفل الحالي ({studentAgeMonths} شهراً)
                        </button>
                      )}
                    </div>

                    {/* Active Filter Indicator */}
                    {selectedAgeFilter !== 'all' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e0f2fe', padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem' }}>
                        <span style={{ color: '#0369a1', fontWeight: 700 }}>
                          الفئة العمرية المعروضة حالياً: <strong>{selectedAgeFilter}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedAgeFilter('all')}
                          style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          إلغاء التصفية (عرض الكل) ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Checklist Items Map with Age Filtering */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(activeTab === 'receptive' ? ABUHASIBA_RECEPTIVE_ITEMS : ABUHASIBA_EXPRESSIVE_ITEMS)
                      .map((item, idx) => ({ item, idx }))
                      .filter(({ item }) => selectedAgeFilter === 'all' || item.ageGroup === selectedAgeFilter)
                      .map(({ item, idx }) => {
                        const key = activeTab === 'receptive' ? `r_${item.id}` : `e_${item.id}`;
                        const currentScore = activeTab === 'receptive' 
                          ? form.resultsReceptive[key] 
                          : form.resultsExpressive[key];
                        
                        const isRecommendedStart = activeTab === 'receptive' 
                          ? item.id === startingPoints.receptiveStart
                          : item.id === startingPoints.expressiveStart;

                        // Check if item is affected by basal or ceiling live override
                        const basalIndex = activeTab === 'receptive' ? scoring.receptiveBasalIndex : scoring.expressiveBasalIndex;
                        const ceilingIndex = activeTab === 'receptive' ? scoring.receptiveCeilingIndex : scoring.expressiveCeilingIndex;

                        const isAssumedCorrect = basalIndex !== -1 && idx < basalIndex;
                        const isAssumedFailed = ceilingIndex !== -1 && idx >= ceilingIndex + 5;

                        return (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 16px',
                              borderRadius: 12,
                              border: isRecommendedStart ? '2px solid #0284c7' : '1px solid #e2e8f0',
                              background: isAssumedCorrect ? '#f0fdf4' : isAssumedFailed ? '#fef2f2' : isRecommendedStart ? '#f0f9ff' : '#fff',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
                              <span style={{ background: '#cbd5e1', color: '#334155', fontWeight: 800, borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', flexShrink: 0 }}>
                                {item.id}
                              </span>
                              <div style={{ textAlign: 'right' }}>
                                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1e293b' }}>{item.text}</strong>
                                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                  الفئة: <strong style={{ color: '#0369a1' }}>{item.ageGroup}</strong> · المجال الفرعي: {item.domain}
                                  {isRecommendedStart && <strong style={{ color: '#0284c7', marginRight: 10 }}>[نقطة البداية الموصى بها]</strong>}
                                  {isAssumedCorrect && <strong style={{ color: '#16a34a', marginRight: 10 }}>[ممنوح مجاناً - تحت الخط القاعدي (Basal)]</strong>}
                                  {isAssumedFailed && <strong style={{ color: '#ef4444', marginRight: 10 }}>[مُصفر تلقائياً - فوق حد التوقف (Ceiling)]</strong>}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button
                                type="button"
                                className={`btn btn-xs ${currentScore === 0 ? 'btn-danger' : ''}`}
                                onClick={() => handleItemScoreChange(activeTab, item.id, 0)}
                                style={{ width: 64, fontWeight: 800, background: currentScore === 0 ? '#ef4444' : '#f1f5f9', color: currentScore === 0 ? '#fff' : '#475569', border: '1px solid var(--border-color)' }}
                              >
                                خطأ (0)
                              </button>
                              <button
                                type="button"
                                className={`btn btn-xs ${currentScore === 1 ? 'btn-success' : ''}`}
                                onClick={() => handleItemScoreChange(activeTab, item.id, 1)}
                                style={{ width: 64, fontWeight: 800, background: currentScore === 1 ? '#10b981' : '#f1f5f9', color: currentScore === 1 ? '#fff' : '#475569', border: '1px solid var(--border-color)' }}
                              >
                                صح (1)
                              </button>
                            </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Summary and Recommendations Tab */}
              {activeTab === 'summary' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, direction: 'rtl', textAlign: 'right' }}>
                  
                  {/* Psychometrics & Detailed Results */}
                  <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0369a1', borderBottom: '1px solid #cbd5e1', paddingBottom: 8 }}>
                      📈 المؤشرات الإحصائية ومصفوفة السن اللغوي
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ fontSize: '0.86rem', color: '#64748b' }}>الدرجة الخام الاستقبالية:</span>
                        <strong style={{ fontSize: '0.94rem' }}>{scoring.receptiveRawScore} / 62</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ fontSize: '0.86rem', color: '#64748b' }}>الدرجة الخام التعبيرية:</span>
                        <strong style={{ fontSize: '0.94rem' }}>{scoring.expressiveRawScore} / 71</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ fontSize: '0.86rem', color: '#64748b' }}>الدرجة الخام الكلية:</span>
                        <strong style={{ fontSize: '0.94rem', color: '#0369a1' }}>{scoring.totalRawScore} / 133</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ fontSize: '0.86rem', color: '#64748b' }}>الدرجة المعيارية الكلية (SS):</span>
                        <strong style={{ fontSize: '0.94rem', color: '#16a34a' }}>{scoring.totalSS} (الرتبة المئينية: {scoring.totalPR}%)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ fontSize: '0.86rem', color: '#64748b' }}>العمر اللغوي الاستقبالي:</span>
                        <strong>{Math.floor(scoring.receptiveLAEMonths / 12)} سنوات و {scoring.receptiveLAEMonths % 12} أشهر</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ fontSize: '0.86rem', color: '#64748b' }}>العمر اللغوي التعبيري:</span>
                        <strong>{Math.floor(scoring.expressiveLAEMonths / 12)} سنوات و {scoring.expressiveLAEMonths % 12} أشهر</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ fontSize: '0.86rem', color: '#64748b' }}>العمر اللغوي الكلي المكافئ:</span>
                        <strong style={{ color: '#0284c7' }}>{Math.floor(scoring.totalLAEMonths / 12)} سنوات و {scoring.totalLAEMonths % 12} أشهر</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                        <span style={{ fontSize: '0.86rem', color: '#b91c1c' }}>مقدار التأخر اللغوي (Delay Gap):</span>
                        <strong style={{ color: '#b91c1c' }}>{Math.floor(scoring.totalDelayGapMonths / 12)} سنوات و {scoring.totalDelayGapMonths % 12} أشهر</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6 }}>
                        <span style={{ fontSize: '0.86rem', color: '#64748b' }}>نقطة الحد الفاصل لسنّه:</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>{scoring.cutoffText}</span>
                      </div>
                    </div>

                    {/* Detected Weaknesses Counts */}
                    <div style={{ marginTop: 20, padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fee2e2' }}>
                      <strong style={{ color: '#991b1b', fontSize: '0.86rem', display: 'block', marginBottom: 6 }}> نقاط الضعف المكتشفة التي ستتحول لأهداف الخطة:</strong>
                      <span style={{ fontSize: '0.8rem', color: '#7f1d1d', display: 'block' }}>
                        • لغة استقبالية: {scoring.receptiveWeaknesses.length} بنداً غير مجتاز.
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#7f1d1d', display: 'block', marginTop: 4 }}>
                        • لغة تعبيرية: {scoring.expressiveWeaknesses.length} بنداً غير مجتاز.
                      </span>
                    </div>
                  </div>

                  {/* Clinician Narrative Summary & Recommendations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, marginBottom: 6 }}>✍️ التقرير والتشخيص الإكلينيكي (صياغة آلية ذكية):</label>
                      <textarea
                        style={{ width: '100%', height: '140px', padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.86rem', lineHeight: 1.6 }}
                        value={form.clinicalSummary || `تم تطبيق مقياس الدكتور أحمد أبو حسيبة للغة المعرب (المستند لـ PLS) لتقييم الكفاءة التواصلية واللغوية للطفل. \nالدرجة الخام الاستقبالية: ${scoring.receptiveRawScore} (SS: ${scoring.receptiveSS}) \nالدرجة الخام التعبيرية: ${scoring.expressiveRawScore} (SS: ${scoring.expressiveSS}) \nالعمر اللغوي الكلي المكافئ: ${Math.floor(scoring.totalLAEMonths / 12)} سنوات و ${scoring.totalLAEMonths % 12} أشهر. \nالتشخيص: يقع الطفل ضمن نطاق [${scoring.clinicalClassification.split('(')[0]}] بفجوة تأخر لغوي تبلغ [${Math.floor(scoring.totalDelayGapMonths / 12)} سنوات و ${scoring.totalDelayGapMonths % 12} أشهر] عن عمره الزمني.`}
                        onChange={(e) => setForm(prev => ({ ...prev, clinicalSummary: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, marginBottom: 6 }}>💡 التوصيات العلاجية والتربوية الموصى بها:</label>
                      <textarea
                        style={{ width: '100%', height: '120px', padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.86rem', lineHeight: 1.6 }}
                        value={form.recommendations || `1. تحويل نقاط الضعف المستخلصة بالتقرير (عددها ${scoring.receptiveWeaknesses.length + scoring.expressiveWeaknesses.length} هدفاً) إلى أهداف سلوكية ضمن الخطة الفردية للبدء الفوري بالتدريب. \n2. تقديم أنشطة التفاعل اللفظي واللعب التخيلي والقصصي لتوسيع المهارات التعبيرية. \n3. تدريب الأبوين على إثراء البيئة المنزلية لغوياً بالطلب وتسمية الأشياء.`}
                        onChange={(e) => setForm(prev => ({ ...prev, recommendations: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, marginBottom: 6 }}>📝 ملاحظات عامة إضافية للأخصائي المطبق:</label>
                      <input
                        type="text"
                        style={{ width: '100%', padding: 10, border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.86rem' }}
                        value={form.notes}
                        onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="دون أي سلوكيات أو ملاحظات لفتت انتباهك أثناء التطبيق هنا..."
                      />
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--g0)', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <button
                  type="button"
                  className="btn"
                  onClick={onClose}
                  style={{ fontWeight: 800 }}
                >
                  إلغاء التغييرات ✖
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {activeTab !== 'summary' ? (
                  <button
                    type="button"
                    className="btn btn-p"
                    style={{ background: '#0369a1', borderColor: '#0369a1', color: '#fff', padding: '10px 24px', fontWeight: 800 }}
                    onClick={() => setActiveTab('summary')}
                  >
                    عرض صفحة التقرير والنتائج 📊
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-g"
                    style={{ background: '#10b981', color: '#fff', padding: '10px 30px', fontWeight: 800, border: 'none' }}
                    onClick={handleSave}
                  >
                    💾 حفظ تقرير المقياس النهائي
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
