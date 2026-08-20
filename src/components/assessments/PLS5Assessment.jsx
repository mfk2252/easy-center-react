import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd, lsGet } from '../../hooks/useStorage';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import {
  PLS5_RECEPTIVE_ITEMS,
  PLS5_EXPRESSIVE_ITEMS,
  getPLS5StartingPoints,
  calculatePLS5Psychometrics
} from '../../data/pls5Data';

const EMPTY_PLS5_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  specialistName: '',
  date: todayStr(),
  notes: '',
  resultsReceptive: {}, // key: "r_1", "r_2" ... -> 0 or 1
  resultsExpressive: {}, // key: "e_1", "e_2" ... -> 0 or 1
  clinicalSummary: '',
  recommendations: '',
  acknowledgedNotice: false,
};

export default function PLS5Assessment({
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
        ...EMPTY_PLS5_FORM,
        ...initialData,
        resultsReceptive: initialData.resultsReceptive || {},
        resultsExpressive: initialData.resultsExpressive || {},
        acknowledgedNotice: true,
      };
    }
    return {
      ...EMPTY_PLS5_FORM,
      specialistName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeTab, setActiveTab] = useState('receptive'); // 'instructions' | 'receptive' | 'expressive' | 'report'
  const [acknowledged, setAcknowledged] = useState(() => !!initialData);
  const [selectedGoals, setSelectedGoals] = useState({}); // key: "r_3", "e_4" -> boolean

  // Calculate student chronological age in months
  const studentAgeMonths = useMemo(() => {
    if (!form.dob) return 36; // Default 3 years (36 months)
    const ageObj = calcAge(form.dob);
    return Math.max(2, ageObj.years * 12 + ageObj.months);
  }, [form.dob]);

  // Recommended starting points based on chronological age
  const startingPoints = useMemo(() => {
    return getPLS5StartingPoints(studentAgeMonths);
  }, [studentAgeMonths]);

  // Live psychometrics and clinical scoring engine
  const scoring = useMemo(() => {
    const rawReceptive = {};
    const rawExpressive = {};

    Object.entries(form.resultsReceptive || {}).forEach(([k, v]) => {
      const id = k.replace('r_', '');
      rawReceptive[id] = v;
    });

    Object.entries(form.resultsExpressive || {}).forEach(([k, v]) => {
      const id = k.replace('e_', '');
      rawExpressive[id] = v;
    });

    return calculatePLS5Psychometrics(rawReceptive, rawExpressive, studentAgeMonths);
  }, [form.resultsReceptive, form.resultsExpressive, studentAgeMonths]);

  // Set initial selected goals on report load
  useEffect(() => {
    if (activeTab === 'report') {
      const initialSelected = {};
      scoring.receptiveWeaknesses.forEach(w => {
        initialSelected[`r_${w.id}`] = true;
      });
      scoring.expressiveWeaknesses.forEach(w => {
        initialSelected[`e_${w.id}`] = true;
      });
      setSelectedGoals(initialSelected);
    }
  }, [activeTab, scoring.receptiveWeaknesses, scoring.expressiveWeaknesses]);

  // Handle single item score change (1 = correct, 0 = incorrect)
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

  // Quick Action: Autofill all preceding items below Basal index with 1 (Credit)
  const applyBasalAutofill = (type) => {
    const isReceptive = type === 'receptive';
    const items = isReceptive ? PLS5_RECEPTIVE_ITEMS : PLS5_EXPRESSIVE_ITEMS;
    const basalIndex = isReceptive ? scoring.receptiveBasalIndex : scoring.expressiveBasalIndex;
    const resultsKey = isReceptive ? 'resultsReceptive' : 'resultsExpressive';
    const prefix = isReceptive ? 'r_' : 'e_';

    if (basalIndex === -1) {
      toast('⚠️ لم يتم رصد قاعدة تطبيق (Basal) صحيحة بعد. يجب إدخال 3 درجات (1) متتالية لتفعيل الاختصار المباشر', 'warn');
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
    toast('✅ تم اعتماد كافة البنود السابقة لمستوى القاعدة كبنود صحيحة (1) تلقائياً', 'ok');
  };

  // Quick Action: Autofill all following items above Ceiling index with 0 (No Credit)
  const applyCeilingAutofill = (type) => {
    const isReceptive = type === 'receptive';
    const items = isReceptive ? PLS5_RECEPTIVE_ITEMS : PLS5_EXPRESSIVE_ITEMS;
    const ceilingIndex = isReceptive ? scoring.receptiveCeilingIndex : scoring.expressiveCeilingIndex;
    const resultsKey = isReceptive ? 'resultsReceptive' : 'resultsExpressive';
    const prefix = isReceptive ? 'r_' : 'e_';

    if (ceilingIndex === -1) {
      toast('⚠️ لم يتم بلوغ سقف التوقف (Ceiling) بعد. يجب رصد 6 إخفاقات (0) متتالية لتطبيق تصفير السقف', 'warn');
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
    toast('✅ تم اعتماد كافة البنود اللاحقة لمستوى السقف كغير متقنة (0) بنجاح', 'ok');
  };

  // Export selected weakness items to the student's active IEP program
  const handleExportToIEP = () => {
    if (!form.stuId) {
      toast('⚠️ الرجاء اختيار الطالب المستهدف أولاً', 'warn');
      return;
    }

    // Load active programs from localStorage
    const savedPrograms = lsGet('studentPrograms') || [];
    const activeProgramIndex = savedPrograms.findIndex(p => p.stuId === form.stuId && p.status === 'active');

    if (activeProgramIndex === -1) {
      toast('⚠️ لا يوجد برنامج تربوي فردي (IEP) نشط ومسجل حالياً لهذا الطالب لتنزيل الأهداف فيه. الرجاء إنشاء خطة جديدة أولاً من علامة تبويب البرامج.', 'warn');
      return;
    }

    const activeProgram = savedPrograms[activeProgramIndex];
    const existingGoals = activeProgram.goals || [];

    // Filter weakness items which are checked
    const receptiveWeaknessGoals = scoring.receptiveWeaknesses
      .filter(w => selectedGoals[`r_${w.id}`])
      .map(w => ({
        id: uid(),
        title: `أداء استقبالي: ${w.text}`,
        domain: 'language', // Maps to speech/language domain
        target: w.goal,
        criteria: 'إتقان بنسبة 80% في 3 جلسات متتالية',
        startDate: todayStr(),
        status: 'pending',
        notes: 'مُرحل تلقائياً من تقرير مقياس اللغة PLS-5'
      }));

    const expressiveWeaknessGoals = scoring.expressiveWeaknesses
      .filter(w => selectedGoals[`e_${w.id}`])
      .map(w => ({
        id: uid(),
        title: `أداء تعبيري: ${w.text}`,
        domain: 'language',
        target: w.goal,
        criteria: 'إتقان بنسبة 80% في 3 جلسات متتالية',
        startDate: todayStr(),
        status: 'pending',
        notes: 'مُرحل تلقائياً من تقرير مقياس اللغة PLS-5'
      }));

    const newlyAddedGoals = [...receptiveWeaknessGoals, ...expressiveWeaknessGoals];

    if (newlyAddedGoals.length === 0) {
      toast('⚠️ الرجاء تحديد هدف واحد على الأقل للترحيل', 'warn');
      return;
    }

    // Merge goals avoiding duplicates by name/text
    const updatedGoals = [...existingGoals];
    let addedCount = 0;

    newlyAddedGoals.forEach(newGoal => {
      const isDuplicate = existingGoals.some(g => g.target === newGoal.target);
      if (!isDuplicate) {
        updatedGoals.push(newGoal);
        addedCount++;
      }
    });

    if (addedCount === 0) {
      toast('ℹ️ كافة الأهداف المحددة مضافة مسبقاً في خطة الطالب الحالية', 'info');
      return;
    }

    activeProgram.goals = updatedGoals;
    savedPrograms[activeProgramIndex] = activeProgram;
    localStorage.setItem('studentPrograms', JSON.stringify(savedPrograms));

    toast(`✅ تم ترحيل ودمج (${addedCount}) أهداف سلوكية لغوية بنجاح داخل خطة الطالب التربوية الفردية النشطة`, 'ok');
  };

  // Final submission and save of the PLS-5 assessment record
  const handleSave = () => {
    if (!form.stuId) {
      toast('⚠️ الرجاء اختيار الطالب لتخزين السجل', 'warn');
      return;
    }

    const finalAssessment = {
      id: initialData?.id || uid(),
      measureId: 'pls5_arabic',
      measureName: 'مقياس لغة الأطفال - الإصدار الخامس (PLS-5)',
      scaleType: 'pls5_arabic',
      stuId: form.stuId,
      studentName: form.studentName,
      dob: form.dob,
      age: form.age,
      diagnosis: form.diagnosis,
      specialistName: form.specialistName,
      date: form.date,
      notes: form.notes,

      // Psychometrics and composite indices
      score: scoring.totalRawScore,
      receptiveRaw: scoring.receptiveRawScore,
      expressiveRaw: scoring.expressiveRawScore,
      standardScore: scoring.totalSS,
      receptiveSS: scoring.receptiveSS,
      expressiveSS: scoring.expressiveSS,
      percentile: scoring.totalPR,
      receptivePR: scoring.receptivePR,
      expressivePR: scoring.expressivePR,

      // Developmental age and lagging gaps
      ageEquivalent: `${Math.floor(scoring.totalLAEMonths / 12)}س و ${scoring.totalLAEMonths % 12}ش`,
      receptiveLAEMonths: scoring.receptiveLAEMonths,
      expressiveLAEMonths: scoring.expressiveLAEMonths,
      totalLAEMonths: scoring.totalLAEMonths,
      delayGap: `${Math.floor(scoring.totalDelayGapMonths / 12)}س و ${scoring.totalDelayGapMonths % 12}ش`,
      totalDelayGapMonths: scoring.totalDelayGapMonths,
      receptiveDelayGapMonths: scoring.receptiveDelayGapMonths,
      expressiveDelayGapMonths: scoring.expressiveDelayGapMonths,

      clinicalClassification: scoring.clinicalClassification,
      cutoffText: scoring.cutoffText,
      level: scoring.totalSS < 78 ? 'تأخر لغوي إكلينيكي' : 'طبيعي ومتزن لغوياً',

      // Results storage
      resultsReceptive: form.resultsReceptive,
      resultsExpressive: form.resultsExpressive,
      receptiveWeaknesses: scoring.receptiveWeaknesses,
      expressiveWeaknesses: scoring.expressiveWeaknesses,
      clinicalSummary: form.clinicalSummary || `تم إجراء تقييم إكلينيكي للغة للطفل باستخدام مقياس لغة الأطفال (PLS-5). حقق الطالب درجة خام كلية بلغت ${scoring.totalRawScore} من أصل ${scoring.maxTotalScore}، مما يضعه عند درجة معيارية كلية SS: ${scoring.totalSS} وبدرجة رتبة مئينية %${scoring.totalPR}. يكافئ النمو اللغوي للطفل عمراً إنمائياً إجمالياً قدره ${Math.floor(scoring.totalLAEMonths / 12)} سنوات و ${scoring.totalLAEMonths % 12} أشهر بفجوة تأخر لغوية تبلغ ${Math.floor(scoring.totalDelayGapMonths / 12)} سنوات و ${scoring.totalDelayGapMonths % 12} أشهر، مما يشير إجمالاً إلى [${scoring.clinicalClassification.split('(')[0]}].`,
      recommendations: form.recommendations || `1. تحويل نقاط الضعف المستخلصة بالتقرير (عددها ${scoring.receptiveWeaknesses.length + scoring.expressiveWeaknesses.length} هدفاً) إلى أهداف سلوكية ضمن الخطة الفردية للبدء الفوري بالتدريب. \n2. تقديم أنشطة التفاعل اللفظي واللعب التخيلي والقصصي لتوسيع المهارات التعبيرية. \n3. تدريب الأبوين على إثراء البيئة المنزلية لغوياً بالطلب وتسمية الأشياء.`
    };

    if (initialData) {
      lsUpd('studentAssessments', initialData.id, finalAssessment);
      toast('💾 تم تعديل وحفظ تقييم PLS-5 بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', finalAssessment);
      toast('💾 تم تسجيل تقييم لغوي PLS-5 جديد بنجاح', 'ok');
    }

    if (onSaved) onSaved(finalAssessment);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!form.studentName) return;
    const text = `*تقرير مقياس لغة الأطفال - الإصدار الخامس (PLS-5)*\n\n` +
      `• *اسم الطالب:* ${form.studentName}\n` +
      `• *العمر الزمني:* ${form.age}\n` +
      `• *الدرجة الخام الكلية:* ${scoring.totalRawScore} / ${scoring.maxTotalScore}\n` +
      `• *الدرجة المعيارية الكلية:* ${scoring.totalSS}\n` +
      `• *الرتبة المئينية الكلية:* ${scoring.totalPR}%\n` +
      `• *العمر اللغوي الكلي المكافئ:* ${Math.floor(scoring.totalLAEMonths / 12)}س و ${scoring.totalLAEMonths % 12}ش\n` +
      `• *فجوة التأخر اللغوي:* ${Math.floor(scoring.totalDelayGapMonths / 12)}س و ${scoring.totalDelayGapMonths % 12}ش\n` +
      `• *التشخيص الإكلينيكي:* ${scoring.clinicalClassification.split('(')[0]}\n\n` +
      `*تم إعداده بواسطة الأخصائي:* ${form.specialistName || 'المشرف الفني'}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div className="mb" style={{ maxWidth: '1080px', width: '100%', padding: 0, overflow: 'hidden', borderRadius: 16, height: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g0)', padding: '14px 20px', borderBottom: '1px solid var(--border-color)', shrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 8 }}>
              🗣️ مقياس لغة الأطفال - الإصدار الخامس (PLS-5)
            </h2>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
              منصة التطبيق والتحليل السيكومتري لمهارات اللغة الاستقبالية (Auditory Comprehension) والتعبيرية (Expressive Communication)
            </span>
          </div>
          <button type="button" className="btn btn-xs btn-p" onClick={onClose} style={{ fontWeight: 800 }}>✖ إغلاق</button>
        </div>

        {/* Clinical Notice Gate before starting */}
        {!acknowledged ? (
          <div style={{ padding: '30px 40px', background: '#fff', direction: 'rtl', textAlign: 'right', overflowY: 'auto', flex: 1 }}>
            <div style={{ background: '#f0f9ff', borderLeft: '5px solid #0369a1', borderRadius: 12, padding: 24, marginBottom: 28 }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '1.1rem', fontWeight: 900 }}>⚠️ إقرار مهني وتوجيه إكلينيكي إلزامي (Clinical Agreement)</h3>
              <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.7, color: '#1e293b', fontWeight: 700 }}>
                "يرجى العلم بأن هذه الواجهة الرقمية هي أداة مساعدة واسترشادية لتسجيل الإجابات وحساب الدرجات المعيارية والرتب المئينية بدقة تلقائية. يتطلب تطبيق مقياس PLS-5 المعرب استخدام الحقيبة السيكومترية والكتيب المصور والقطع الحسية المخصصة للاختبار والالتزام التام بتعليمات دليل المطبق لضمان صحة مخرجات التشخيص."
              </p>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#0f766e', fontSize: '0.96rem', fontWeight: 800, marginBottom: 12 }}>📋 أركان الفحص والتقييم الأساسية:</h4>
              <ul style={{ paddingRight: 20, margin: 0, fontSize: '0.88rem', color: 'var(--text-sub)', lineHeight: 1.8 }}>
                <li style={{ marginBottom: 6 }}><strong>قاعدة البسال (Basal Rule):</strong> تأسيس القاعدة عند نجاح الطفل في <strong>3 بنود متتالية صحيحة (1)</strong>. كل ما يسبق القاعدة يُمنح له الدرجة الكاملة مجاناً.</li>
                <li style={{ marginBottom: 6 }}><strong>سقف الاختبار (Ceiling Rule):</strong> التوقف عن الفحص فور إخفاق الطفل في <strong>6 بنود متتالية (0)</strong>، وتُعتبر جميع البنود اللاحقة خاطئة.</li>
                <li style={{ marginBottom: 6 }}><strong>الربط الإجرائي مع IEP:</strong> كافة البنود المخفقة في سن الطفل الحالي أو أقل تُدرج آلياً كأهداف سلوكية قابلة للمشاركة والترحيل الفوري في خطة الطفل التربوية.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
              <button
                type="button"
                className="btn btn-lg"
                style={{ background: '#0369a1', color: '#fff', padding: '12px 36px', fontSize: '0.94rem', fontWeight: 800, borderRadius: 8 }}
                onClick={() => {
                  setAcknowledged(true);
                  setForm(prev => ({ ...prev, acknowledgedNotice: true }));
                }}
              >
                الموافقة والدخول للوحة التطبيق الفني المباشر 🔗
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--bg)', overflow: 'hidden' }}>
            
            {/* Top Student Selection Block */}
            <div style={{ padding: '12px 20px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 16, shrink: 0 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>اختر الطالب المراد تقييمه:</label>
                <StudentPicker
                  students={students}
                  selectedId={form.stuId}
                  onSelect={(stu) => {
                    setForm(prev => ({
                      ...prev,
                      stuId: stu.id,
                      studentName: stu.name,
                      dob: stu.dob,
                      age: stu.age,
                      diagnosis: stu.diagnosis || 'غير محدد',
                    }));
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, alignItems: 'center' }}>
                <div style={{ background: 'var(--g1)', padding: '6px 10px', borderRadius: 8, textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-sub)' }}>العمر الزمني:</span>
                  <strong style={{ fontSize: '0.84rem' }}>{form.age || '—'}</strong>
                </div>
                <div style={{ background: 'var(--g1)', padding: '6px 10px', borderRadius: 8, textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-sub)' }}>نطاق السن:</span>
                  <strong style={{ fontSize: '0.84rem', color: '#0284c7' }}>{startingPoints.ageLabel}</strong>
                </div>
                <div style={{ background: '#f0f9ff', padding: '6px 10px', borderRadius: 8, textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#0369a1' }}>بداية الاستقبالي:</span>
                  <strong style={{ fontSize: '0.84rem', color: '#0369a1' }}>بند {startingPoints.receptiveStart}</strong>
                </div>
                <div style={{ background: '#f0fdfa', padding: '6px 10px', borderRadius: 8, textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#0f766e' }}>بداية التعبيري:</span>
                  <strong style={{ fontSize: '0.84rem', color: '#0f766e' }}>بند {startingPoints.expressiveStart}</strong>
                </div>
              </div>
            </div>

            {/* Live Metrics Bar */}
            {form.stuId && (
              <div style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', shrink: 0, gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>الخام الكلي: </span>
                    <strong style={{ fontSize: '0.88rem', color: '#0f766e' }}>{scoring.totalRawScore} / {scoring.maxTotalScore}</strong>
                  </div>
                  <div style={{ width: 1, background: '#cbd5e1', height: 16 }} />
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>العمر اللغوي: </span>
                    <strong style={{ fontSize: '0.88rem', color: '#0284c7' }}>{Math.floor(scoring.totalLAEMonths / 12)}س و {scoring.totalLAEMonths % 12}ش</strong>
                  </div>
                  <div style={{ width: 1, background: '#cbd5e1', height: 16 }} />
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>التأخر اللغوي: </span>
                    <strong style={{ fontSize: '0.88rem', color: '#b91c1c' }}>{Math.floor(scoring.totalDelayGapMonths / 12)}س و {scoring.totalDelayGapMonths % 12}ش</strong>
                  </div>
                  <div style={{ width: 1, background: '#cbd5e1', height: 16 }} />
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>الدرجة المعيارية: </span>
                    <strong style={{ fontSize: '0.88rem', color: '#16a34a' }}>{scoring.totalSS} (مئيني: {scoring.totalPR}%)</strong>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 12, background: scoring.severityColor, color: '#fff', fontWeight: 800 }}>
                    {scoring.clinicalClassification.split('(')[0]}
                  </span>
                </div>
              </div>
            )}

            {/* Tabs Bar */}
            <div style={{ display: 'flex', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', shrink: 0 }}>
              <button
                type="button"
                style={{ flex: 1, padding: '10px 16px', border: 'none', background: activeTab === 'receptive' ? '#0369a1' : 'transparent', color: activeTab === 'receptive' ? '#fff' : 'var(--text)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.84rem' }}
                onClick={() => setActiveTab('receptive')}
              >
                📥 اللغة الاستقبالية (AC - 40 بنداً)
              </button>
              <button
                type="button"
                style={{ flex: 1, padding: '10px 16px', border: 'none', background: activeTab === 'expressive' ? '#0f766e' : 'transparent', color: activeTab === 'expressive' ? '#fff' : 'var(--text)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.84rem' }}
                onClick={() => setActiveTab('expressive')}
              >
                📤 اللغة التعبيرية (EC - 40 بنداً)
              </button>
              <button
                type="button"
                style={{ flex: 1, padding: '10px 16px', border: 'none', background: activeTab === 'report' ? '#334155' : 'transparent', color: activeTab === 'report' ? '#fff' : 'var(--text)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', borderLeft: '1px solid var(--border-color)', fontSize: '0.84rem' }}
                onClick={() => {
                  if (!form.stuId) {
                    toast('⚠️ الرجاء اختيار الطالب لعرض التقرير أولاً', 'warn');
                    return;
                  }
                  setActiveTab('report');
                }}
              >
                📊 التقرير النهائي والخطة العلاجية (IEP)
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fff' }}>
              
              {!form.stuId ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-sub)' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>👤</span>
                  <h4 style={{ fontWeight: 800, margin: 0, color: 'var(--text)' }}>الرجاء اختيار الطالب من القائمة بالأعلى للبدء بالفحص اللغوي</h4>
                  <p style={{ fontSize: '0.82rem', marginTop: 6 }}>سيقوم النظام تلقائياً بحساب السن الزمني بالأشهر واقتراح نقطة البداية المناسبة للطفل.</p>
                </div>
              ) : activeTab === 'receptive' || activeTab === 'expressive' ? (
                <div>
                  
                  {/* Basal & Ceiling Quick Action Panel */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#166534', display: 'block' }}>مستوى القاعدة الحالي (Basal):</span>
                        <strong style={{ fontSize: '0.8rem', color: '#14532d' }}>
                          {activeTab === 'receptive'
                            ? (scoring.receptiveBasalIndex !== -1 ? `مؤسس عند البند ${scoring.receptiveBasalIndex + 1}` : 'غير مؤسس بعد ⚠️')
                            : (scoring.expressiveBasalIndex !== -1 ? `مؤسس عند البند ${scoring.expressiveBasalIndex + 1}` : 'غير مؤسس بعد ⚠️')
                          }
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyBasalAutofill(activeTab)}
                        className="btn btn-xs"
                        style={{ background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800, padding: '4px 10px' }}
                      >
                        اعتماد السوابق (1) ⚡
                      </button>
                    </div>

                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 12, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#991b1b', display: 'block' }}>سقف التوقف الحالي (Ceiling):</span>
                        <strong style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>
                          {activeTab === 'receptive'
                            ? (scoring.receptiveCeilingIndex !== -1 ? `متحقق عند البند ${scoring.receptiveCeilingIndex + 6}` : 'غير متحقق بعد')
                            : (scoring.expressiveCeilingIndex !== -1 ? `متحقق عند البند ${scoring.expressiveCeilingIndex + 6}` : 'غير متحقق بعد')
                          }
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyCeilingAutofill(activeTab)}
                        className="btn btn-xs"
                        style={{ background: '#dc2626', color: '#fff', border: 'none', fontWeight: 800, padding: '4px 10px' }}
                      >
                        تصفير اللواحق (0) ⚡
                      </button>
                    </div>
                  </div>

                  {/* Checklist Items list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(activeTab === 'receptive' ? PLS5_RECEPTIVE_ITEMS : PLS5_EXPRESSIVE_ITEMS).map((item, idx) => {
                      const key = activeTab === 'receptive' ? `r_${item.id}` : `e_${item.id}`;
                      const currentScore = activeTab === 'receptive'
                        ? form.resultsReceptive[key]
                        : form.resultsExpressive[key];

                      const isRecommendedStart = activeTab === 'receptive'
                        ? item.id === startingPoints.receptiveStart
                        : item.id === startingPoints.expressiveStart;

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
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: isRecommendedStart ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                            background: isAssumedCorrect ? '#f0fdf4' : isAssumedFailed ? '#fef2f2' : isRecommendedStart ? '#f0f9ff' : '#fff',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, textAlign: 'right' }}>
                            <span style={{ background: '#475569', color: '#fff', fontWeight: 800, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', shrink: 0 }}>
                              {item.id}
                            </span>
                            <div>
                              <strong style={{ display: 'block', fontSize: '0.86rem', color: '#1e293b' }}>{item.text}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                                السن: {item.ageGroup} · المجال: <strong style={{ color: '#475569' }}>{item.domain}</strong>
                                {isRecommendedStart && <strong style={{ color: '#0284c7', marginRight: 8 }}>[البداية المقترحة لسنّه]</strong>}
                                {isAssumedCorrect && <strong style={{ color: '#16a34a', marginRight: 8 }}>[تلقائي - تحت القاعدة]</strong>}
                                {isAssumedFailed && <strong style={{ color: '#ef4444', marginRight: 8 }}>[تلقائي - فوق السقف]</strong>}
                              </span>
                            </div>
                          </div>

                          {/* Score Controller Buttons */}
                          <div style={{ display: 'flex', gap: 4, shrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => handleItemScoreChange(activeTab, item.id, 1)}
                              style={{
                                width: 56,
                                padding: '6px 0',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                background: currentScore === 1 ? '#16a34a' : '#fff',
                                color: currentScore === 1 ? '#fff' : '#475569',
                                transition: 'all 0.1s'
                              }}
                            >
                              متقن (1)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleItemScoreChange(activeTab, item.id, 0)}
                              style={{
                                width: 56,
                                padding: '6px 0',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                background: currentScore === 0 ? '#ef4444' : '#fff',
                                color: currentScore === 0 ? '#fff' : '#475569',
                                transition: 'all 0.1s'
                              }}
                            >
                              مخفق (0)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleItemScoreChange(activeTab, item.id, undefined)}
                              style={{
                                width: 34,
                                padding: '6px 0',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                background: currentScore === undefined ? '#f1f5f9' : '#fff',
                                color: '#94a3b8',
                                transition: 'all 0.1s'
                              }}
                              title="مسح الإجابة"
                            >
                              —
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Diagnostic Report & IEP Alignment Panel */
                <div style={{ direction: 'rtl', textAlign: 'right' }}>
                  
                  {/* Print Version Wrapper */}
                  <div className="print-report-sheet" style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    
                    {/* Official Report Header */}
                    <div style={{ borderBottom: '2px solid #334155', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#334155' }}>تقرير التشخيص اللغوي السيكومتري (PLS-5)</h1>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>Preschool Language Scale, Fifth Edition - Adapted Arabic Profile</span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>مركز الرعاية المتخصصة للدمج والتأهيل</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>تاريخ الفحص: {form.date}</div>
                      </div>
                    </div>

                    {/* Patient/Student Demographics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 14, background: 'var(--g0)', borderRadius: 10, marginBottom: 20, fontSize: '0.82rem' }}>
                      <div>🔹 <strong>اسم الطالب:</strong> {form.studentName}</div>
                      <div>🔹 <strong>تاريخ الميلاد:</strong> {form.dob}</div>
                      <div>🔹 <strong>العمر الزمني:</strong> {form.age} ({studentAgeMonths} شراً)</div>
                      <div>🔹 <strong>التشخيص الطبي:</strong> {form.diagnosis}</div>
                      <div>🔹 <strong>الأخصائي المطبق:</strong> {form.specialistName || 'المشرف المعتمد'}</div>
                      <div>🔹 <strong>حالة المقياس:</strong> مكتمل ومصحح سيكومترياً</div>
                    </div>

                    {/* Core Psychometric Results Table */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0369a1', margin: '0 0 10px 0', borderRight: '4px solid #0369a1', paddingRight: 8 }}>📊 النتائج الإحصائية ومستويات النمو اللغوي:</h3>
                    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'center' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                            <th style={{ padding: 10, textAlign: 'right' }}>الاختبار الفرعي اللغوي</th>
                            <th style={{ padding: 10 }}>الدرجة الخام</th>
                            <th style={{ padding: 10 }}>الدرجة المعيارية (SS)</th>
                            <th style={{ padding: 10 }}>الرتبة المئينية (PR)</th>
                            <th style={{ padding: 10 }}>العمر اللغوي المكافئ (LAE)</th>
                            <th style={{ padding: 10 }}>فجوة التأخر اللغوية</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: 10, fontWeight: 700, textAlign: 'right', color: '#0369a1' }}>اللغة الاستقبالية (Auditory Comprehension)</td>
                            <td style={{ padding: 10 }}>{scoring.receptiveRawScore} / 40</td>
                            <td style={{ padding: 10, fontWeight: 700 }}>{scoring.receptiveSS}</td>
                            <td style={{ padding: 10 }}>%{scoring.receptivePR}</td>
                            <td style={{ padding: 10, color: '#0284c7', fontWeight: 700 }}>{Math.floor(scoring.receptiveLAEMonths / 12)}س و {scoring.receptiveLAEMonths % 12}ش</td>
                            <td style={{ padding: 10, color: '#dc2626', fontWeight: 700 }}>{Math.floor(scoring.receptiveDelayGapMonths / 12)}س و {scoring.receptiveDelayGapMonths % 12}ش</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: 10, fontWeight: 700, textAlign: 'right', color: '#0f766e' }}>اللغة التعبيرية (Expressive Communication)</td>
                            <td style={{ padding: 10 }}>{scoring.expressiveRawScore} / 40</td>
                            <td style={{ padding: 10, fontWeight: 700 }}>{scoring.expressiveSS}</td>
                            <td style={{ padding: 10 }}>%{scoring.expressivePR}</td>
                            <td style={{ padding: 10, color: '#0f766e', fontWeight: 700 }}>{Math.floor(scoring.expressiveLAEMonths / 12)}س و {scoring.expressiveLAEMonths % 12}ش</td>
                            <td style={{ padding: 10, color: '#dc2626', fontWeight: 700 }}>{Math.floor(scoring.expressiveDelayGapMonths / 12)}س و {scoring.expressiveDelayGapMonths % 12}ش</td>
                          </tr>
                          <tr style={{ background: '#f8fafc', fontWeight: 800, borderBottom: '2px solid #cbd5e1' }}>
                            <td style={{ padding: 12, textAlign: 'right', color: '#334155' }}>المؤشر الكلي للغة (Total Language Score)</td>
                            <td style={{ padding: 12 }}>{scoring.totalRawScore} / 80</td>
                            <td style={{ padding: 12, color: '#16a34a', fontSize: '0.94rem' }}>{scoring.totalSS}</td>
                            <td style={{ padding: 12 }}>%{scoring.totalPR}</td>
                            <td style={{ padding: 12, color: '#0284c7' }}>{Math.floor(scoring.totalLAEMonths / 12)}س و {scoring.totalLAEMonths % 12}ش</td>
                            <td style={{ padding: 12, color: '#dc2626' }}>{Math.floor(scoring.totalDelayGapMonths / 12)}س و {scoring.totalDelayGapMonths % 12}ش</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Narrative Diagnostic summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: 4, color: '#334155' }}>✍️ الخلاصة الإكلينيكية والتشخيصية (تعديل مباشر):</label>
                        <textarea
                          style={{ width: '100%', height: '110px', padding: 10, border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem', lineHeight: 1.6 }}
                          value={form.clinicalSummary || `تم تطبيق مقياس لغة الأطفال الإصدار الخامس (PLS-5) لتقييم النمو اللغوي للطفل ${form.studentName}. \nالنتائج سيكومترياً: حقق الطفل درجة معيارية كلية تبلغ [ ${scoring.totalSS} ] وتضعه في نطاق [ ${scoring.clinicalClassification.split('(')[0]} ]. \nالعمر اللغوي الإجمالي للطفل يعادل [ ${Math.floor(scoring.totalLAEMonths / 12)}س و ${scoring.totalLAEMonths % 12}ش ] مما يظهر فجوة تأخر واضحة قدرها [ ${Math.floor(scoring.totalDelayGapMonths / 12)}س و ${scoring.totalDelayGapMonths % 12}ش ] مقارنة بأقرانه.`}
                          onChange={(e) => setForm(prev => ({ ...prev, clinicalSummary: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: 4, color: '#334155' }}>💡 التوصيات السريرية والخطوات التالية:</label>
                        <textarea
                          style={{ width: '100%', height: '110px', padding: 10, border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem', lineHeight: 1.6 }}
                          value={form.recommendations || `1. ترحيل نقاط الضعف اللغوية المكتشفة بالتقييم إلى برنامج الطالب التربوي الفردي (IEP). \n2. البدء بتدريب المهارات الاستقبالية المفقودة ثم دمج التعبير المقابل لها. \n3. تفعيل جلسات التخاطب والنمو اللغوي بمعدل 3 جلسات أسبوعية.`}
                          onChange={(e) => setForm(prev => ({ ...prev, recommendations: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Automated IEP goal generator section */}
                    <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 24 }} className="no-print">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 900, color: '#0f766e' }}>🎯 الربط السلوكي الذكي بالخطة التربوية الفردية (IEP):</h4>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'block', marginTop: 2 }}>تم الكشف عن ({scoring.receptiveWeaknesses.length + scoring.expressiveWeaknesses.length}) بنداً غير مجتاز. حدد الأهداف التي ترغب في ترحيلها فورياً لخطة الطالب النشطة:</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs"
                          style={{ background: '#0f766e', color: '#fff', border: 'none', fontWeight: 800 }}
                          onClick={handleExportToIEP}
                        >
                          📥 ترحيل الأهداف المحددة إلى IEP
                        </button>
                      </div>

                      {scoring.receptiveWeaknesses.length === 0 && scoring.expressiveWeaknesses.length === 0 ? (
                        <div style={{ padding: 10, textAling: 'center', color: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}>
                          🎉 رائع! لم يتم رصد أي نقاط ضعف أو إخفاقات في النطاق العمري الحالي للطالب.
                        </div>
                      ) : (
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }}>
                          
                          {/* Receptive weaknesses */}
                          {scoring.receptiveWeaknesses.map(w => (
                            <label
                              key={`r_${w.id}`}
                              style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.78rem', cursor: 'pointer' }}
                            >
                              <input
                                type="checkbox"
                                checked={!!selectedGoals[`r_${w.id}`]}
                                onChange={(e) => setSelectedGoals(prev => ({ ...prev, [`r_${w.id}`]: e.target.checked }))}
                                style={{ marginTop: 2 }}
                              />
                              <div>
                                <span style={{ color: '#0369a1', fontWeight: 800 }}>[استقبالي - بند {w.id}]: </span>
                                <strong style={{ color: '#1e293b' }}>{w.text}</strong>
                                <span style={{ display: 'block', fontSize: '0.72rem', color: '#0f766e', marginTop: 2 }}>🎯 الهدف المقترح: {w.goal}</span>
                              </div>
                            </label>
                          ))}

                          {/* Expressive weaknesses */}
                          {scoring.expressiveWeaknesses.map(w => (
                            <label
                              key={`e_${w.id}`}
                              style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.78rem', cursor: 'pointer' }}
                            >
                              <input
                                type="checkbox"
                                checked={!!selectedGoals[`e_${w.id}`]}
                                onChange={(e) => setSelectedGoals(prev => ({ ...prev, [`e_${w.id}`]: e.target.checked }))}
                                style={{ marginTop: 2 }}
                              />
                              <div>
                                <span style={{ color: '#0f766e', fontWeight: 800 }}>[تعبيري - بند {w.id}]: </span>
                                <strong style={{ color: '#1e293b' }}>{w.text}</strong>
                                <span style={{ display: 'block', fontSize: '0.72rem', color: '#0f766e', marginTop: 2 }}>🎯 الهدف المقترح: {w.goal}</span>
                              </div>
                            </label>
                          ))}

                        </div>
                      )}
                    </div>

                    {/* Official Signatures (visible only in print) */}
                    <div className="only-print" style={{ display: 'none', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 40, borderTop: '1px dashed #cbd5e1', paddingTop: 20, fontSize: '0.8rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <span>توقيع الأخصائي الفاحص:</span>
                        <div style={{ height: 50 }} />
                        <span>_______________________</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span>اعتماد وإشراف فني:</span>
                        <div style={{ height: 50 }} />
                        <span>_______________________</span>
                      </div>
                    </div>

                  </div>

                  {/* Diagnostic Utility Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }} className="no-print">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="btn btn-xs"
                      style={{ background: '#475569', color: '#fff', fontWeight: 800 }}
                    >
                      🖨️ طباعة التقرير الطبي
                    </button>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="btn btn-xs"
                      style={{ background: '#16a34a', color: '#fff', fontWeight: 800 }}
                    >
                      🟢 مشاركة عبر واتساب للولي
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--g0)', borderTop: '1px solid var(--border-color)', shrink: 0 }}>
              <div>
                <button
                  type="button"
                  className="btn"
                  onClick={onClose}
                  style={{ fontWeight: 800 }}
                >
                  إلغاء وإغلاق ✖
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeTab !== 'report' ? (
                  <button
                    type="button"
                    className="btn btn-p"
                    style={{ background: '#334155', borderColor: '#334155', color: '#fff', padding: '8px 20px', fontWeight: 800 }}
                    onClick={() => {
                      if (!form.stuId) {
                        toast('⚠️ الرجاء اختيار الطالب أولاً', 'warn');
                        return;
                      }
                      setActiveTab('report');
                    }}
                  >
                    عرض صفحة التقرير الإحصائي والـ IEP 📊
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-g"
                    style={{ background: '#10b981', color: '#fff', padding: '8px 24px', fontWeight: 800, border: 'none' }}
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
