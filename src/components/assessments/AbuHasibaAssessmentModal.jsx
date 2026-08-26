import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd, lsGet } from '../../hooks/useStorage';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import {
  ABUHASIBA_COPYRIGHT_INFO,
  ABUHASIBA_RECEPTIVE_ITEMS,
  ABUHASIBA_EXPRESSIVE_ITEMS,
  ABUHASIBA_AGE_STAGES,
  getAbuHasibaAgeStageByMonths,
  getAbuHasibaStartingPoints,
  calculateAbuHasibaPsychometrics,
} from '../../data/abuhasibaData';

const EMPTY_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  grade: '',
  school: 'مركز الرعاية والتأهيل',
  raterName: '',
  raterRelation: 'ولي الأمر (الأم/الأب)',
  specialistName: '',
  examinerName: '',
  date: todayStr(),
  notes: '',
  itemNotes: {},
  resultsReceptive: {}, // r_1, r_2 ... -> 0 or 1
  resultsExpressive: {}, // e_1, e_2 ... -> 0 or 1
  clinicalSummary: '',
  recommendations: '',
};

export default function AbuHasibaAssessmentModal({
  isOpen,
  onClose,
  onSaved,
  students = [],
  emps = [],
  initialData = null,
}) {
  const { toast, currentUser } = useApp?.() || { toast: () => {}, currentUser: null };

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_FORM,
        ...initialData,
        resultsReceptive: initialData.resultsReceptive || initialData.results?.receptive || {},
        resultsExpressive: initialData.resultsExpressive || initialData.results?.expressive || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_FORM,
      specialistName: currentUser?.name || (emps[0]?.name || 'أخصائي التخاطب والنمو اللغوي'),
      examinerName: currentUser?.name || (emps[0]?.name || 'أخصائي التخاطب والنمو اللغوي'),
      date: todayStr(),
    };
  });

  const [activeTab, setActiveTab] = useState('receptive'); // 'receptive' | 'expressive' | 'report'
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [selectedAgeFilter, setSelectedAgeFilter] = useState('all');
  const [selectedGoals, setSelectedGoals] = useState({}); // key: "r_3", "e_4" -> boolean

  // Student selection handler
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
      school: stu.school || stu.schoolName || 'مركز الرعاية والتأهيل',
    }));
  }

  // Calculate student chronological age in months
  const studentAgeMonths = useMemo(() => {
    if (!form.dob) return 36; // Default 3 years (36 months)
    const ageObj = calcAge(form.dob);
    if (typeof ageObj === 'object' && ageObj !== null) {
      return Math.max(2, (ageObj.years || 0) * 12 + (ageObj.months || 0));
    }
    return 36;
  }, [form.dob]);

  // Recommended starting points based on age
  const startingPoints = useMemo(() => {
    return getAbuHasibaStartingPoints(studentAgeMonths);
  }, [studentAgeMonths]);

  // Live psychometrics and scoring engine integration
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

    return calculateAbuHasibaPsychometrics(rawReceptive, rawExpressive, studentAgeMonths);
  }, [form.resultsReceptive, form.resultsExpressive, studentAgeMonths]);

  // Total answered items count
  const totalAnswered = useMemo(() => {
    const rCount = Object.values(form.resultsReceptive || {}).filter(v => v !== undefined && v !== null).length;
    const eCount = Object.values(form.resultsExpressive || {}).filter(v => v !== undefined && v !== null).length;
    return rCount + eCount;
  }, [form.resultsReceptive, form.resultsExpressive]);

  const completionPercentage = useMemo(() => {
    return Math.min(100, Math.round((totalAnswered / 133) * 100));
  }, [totalAnswered]);

  // Set initial selected goals on report tab activation
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

  if (!isOpen) return null;

  // Handle setting a score of 1 or 0 for an item
  const handleItemScoreChange = (type, itemId, score) => {
    const key = type === 'receptive' ? `r_${itemId}` : `e_${itemId}`;
    const resultsKey = type === 'receptive' ? 'resultsReceptive' : 'resultsExpressive';

    setForm(prev => ({
      ...prev,
      [resultsKey]: {
        ...prev[resultsKey],
        [key]: score,
      },
    }));
  };

  const handleItemNoteChange = (itemId, noteText) => {
    setForm(prev => ({
      ...prev,
      itemNotes: {
        ...prev.itemNotes,
        [itemId]: noteText,
      },
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
      toast('⚠️ لم يتم تحديد قاعدة تطبيق (Basal) صحيحة بعد (يجب وجود 3 بنود متتالية صحيحة بدرجة 1)', 'warn');
      return;
    }

    const updatedResults = { ...form[resultsKey] };
    for (let i = 0; i < basalIndex; i++) {
      updatedResults[`${prefix}${items[i].id}`] = 1;
    }

    setForm(prev => ({
      ...prev,
      [resultsKey]: updatedResults,
    }));
    toast('✅ تم اعتماد كافة البنود السابقة لقاعدة البداية بدرجة (1) بنجاح', 'ok');
  };

  // Quick Action: Autofill all succeeding items above Ceiling as 0
  const applyCeilingAutofill = (type) => {
    const isReceptive = type === 'receptive';
    const items = isReceptive ? ABUHASIBA_RECEPTIVE_ITEMS : ABUHASIBA_EXPRESSIVE_ITEMS;
    const ceilingIndex = isReceptive ? scoring.receptiveCeilingIndex : scoring.expressiveCeilingIndex;
    const resultsKey = isReceptive ? 'resultsReceptive' : 'resultsExpressive';
    const prefix = isReceptive ? 'r_' : 'e_';

    if (ceilingIndex === -1) {
      toast('⚠️ لم يتم رصد سقف اختبار (Ceiling) بعد (يتطلب 5 بنود متتالية خاطئة بدرجة 0)', 'warn');
      return;
    }

    const updatedResults = { ...form[resultsKey] };
    for (let i = ceilingIndex + 5; i < items.length; i++) {
      updatedResults[`${prefix}${items[i].id}`] = 0;
    }

    setForm(prev => ({
      ...prev,
      [resultsKey]: updatedResults,
    }));
    toast('✅ تم تصفير كافة البنود اللاحقة لسقف الاختبار بدرجة (0) بنجاح', 'ok');
  };

  // Simulation handler for quick test filling
  const handleAutoFill = (level = 'normal') => {
    const newReceptive = {};
    const newExpressive = {};

    const receptiveStart = startingPoints.receptiveStart || 15;
    const expressiveStart = startingPoints.expressiveStart || 15;

    ABUHASIBA_RECEPTIVE_ITEMS.forEach((it) => {
      const key = `r_${it.id}`;
      if (level === 'normal') {
        newReceptive[key] = it.id <= receptiveStart + 6 ? 1 : (it.id <= receptiveStart + 11 ? 0 : 0);
      } else if (level === 'mild') {
        newReceptive[key] = it.id <= receptiveStart - 3 ? 1 : (it.id <= receptiveStart + 4 ? (it.id % 2 === 0 ? 1 : 0) : 0);
      } else if (level === 'moderate') {
        newReceptive[key] = it.id <= receptiveStart - 8 ? 1 : 0;
      } else if (level === 'severe') {
        newReceptive[key] = it.id <= 6 ? 1 : 0;
      }
    });

    ABUHASIBA_EXPRESSIVE_ITEMS.forEach((it) => {
      const key = `e_${it.id}`;
      if (level === 'normal') {
        newExpressive[key] = it.id <= expressiveStart + 6 ? 1 : (it.id <= expressiveStart + 11 ? 0 : 0);
      } else if (level === 'mild') {
        newExpressive[key] = it.id <= expressiveStart - 4 ? 1 : (it.id <= expressiveStart + 3 ? (it.id % 2 === 0 ? 1 : 0) : 0);
      } else if (level === 'moderate') {
        newExpressive[key] = it.id <= expressiveStart - 9 ? 1 : 0;
      } else if (level === 'severe') {
        newExpressive[key] = it.id <= 5 ? 1 : 0;
      }
    });

    setForm(prev => ({
      ...prev,
      resultsReceptive: newReceptive,
      resultsExpressive: newExpressive,
    }));

    toast(`⚡ تم تعبئة استجابات نموذجية لمقياس د. أحمد أبو حسيبة (${level === 'normal' ? 'أداء طبيعي' : level === 'mild' ? 'تأخر لغوي بسيط' : level === 'moderate' ? 'تأخر لغوي متوسط' : 'تأخر لغوي شديد'})`, 'ok');
  };

  // Generate Automated Clinical Summary & Recommendations
  const applyAutoClinicalSummary = () => {
    if (totalAnswered < 15) {
      toast('⚠️ يرجى تقييم عدد كافٍ من البنود لتوليد التقرير السيكومتري المعتمد', 'warn');
      return;
    }

    const summary = `تقرير التقييم الإكلينيكي بمقياس د. أحمد أبو حسيبة للغة المعرب (PLS Adaptation):\n\n` +
      `- اسم المفحوص: ${form.studentName || 'الطفل'}\n` +
      `- العمر الزمني: ${form.age || `${Math.floor(studentAgeMonths / 12)} سنوات`} (${studentAgeMonths} شهراً)\n` +
      `- إجمالي البنود المطبقة: (${totalAnswered} / 133) بنداً\n\n` +
      `📊 النتائج السيكومترية والمؤشرات اللغوية:\n` +
      `1. الفهم السمعي (اللغة الاستقبالية): الدرجة الخام (${scoring.receptiveRawScore}/62) · الدرجة المعيارية SS: (${scoring.receptiveSS}) · الرتبة المئينية PR: (%${scoring.receptivePR}) · العمر اللغوي المكافئ: (${Math.floor(scoring.receptiveLAEMonths / 12)}س و ${scoring.receptiveLAEMonths % 12}ش) بفجوة تأخر (${Math.floor(scoring.receptiveDelayGapMonths / 12)}س و ${scoring.receptiveDelayGapMonths % 12}ش).\n` +
      `2. التواصل اللفظي (اللغة التعبيرية): الدرجة الخام (${scoring.expressiveRawScore}/71) · الدرجة المعيارية SS: (${scoring.expressiveSS}) · الرتبة المئينية PR: (%${scoring.expressivePR}) · العمر اللغوي المكافئ: (${Math.floor(scoring.expressiveLAEMonths / 12)}س و ${scoring.expressiveLAEMonths % 12}ش) بفجوة تأخر (${Math.floor(scoring.expressiveDelayGapMonths / 12)}س و ${scoring.expressiveDelayGapMonths % 12}ش).\n` +
      `3. المؤشر الكلي للغة: الدرجة الخام (${scoring.totalRawScore}/133) · الدرجة المعيارية الكلية SS: (${scoring.totalSS}) · الرتبة المئينية الكلية PR: (%${scoring.totalPR}) · العمر اللغوي الإجمالي: (${Math.floor(scoring.totalLAEMonths / 12)}س و ${scoring.totalLAEMonths % 12}ش) بفجوة تأخر إجمالية تبلغ (${Math.floor(scoring.totalDelayGapMonths / 12)}س و ${scoring.totalDelayGapMonths % 12}ش).\n\n` +
      `القرار والتشخيص الإكلينيكي المعتمد:\n` +
      `[${scoring.clinicalClassification}]\n` +
      `${scoring.cutoffText}`;

    const recs = (scoring.receptiveWeaknesses.length > 0 || scoring.expressiveWeaknesses.length > 0)
      ? `1. ترحيل نقاط الضعف المرصودة (${scoring.receptiveWeaknesses.length + scoring.expressiveWeaknesses.length} مهارة) إلى الخطة التربوية الفردية (IEP) والبدء الفوري بالتدريب التخاطبي.\n` +
        `2. التركيز على تطوير المفاهيم والمهارات الاستقبالية المفقودة (مثل: ${scoring.receptiveWeaknesses.slice(0, 3).map(w => w.domain).join('، ') || 'المفردات واتباع الأوامر'}) كأساس نمائي للتعبير اللفظي.\n` +
        `3. تكثيف جلسات التخاطب والنمو اللغوي بمعدل 3 إلى 4 جلسات أسبوعية مع التركيز على التواصل الوظيفي.\n` +
        `4. إشراك الأسرة في البرنامج المنزلي وتطبيق استراتيجيات التوسيع اللفظي والنمذجة والتسمية في المواقف اليومية.\n` +
        `5. إعادة التقييم بعد 6 أشهر لقياس التطور والمدى النمائي المحقق.`
      : `1. استمرار تعزيز وتنمية الحصيلة اللغوية الاستقبالية والتعبيرية في البيئة الطبيعية واليومية.\n` +
        `2. تقديم أنشطة التفكير اللغوي والقصص التفاعلية لتوسيع القدرات الإدراكية والتعبيرية العليا.\n` +
        `3. المتابعة الدورية للنمو اللغوي العام.`;

    setForm(prev => ({
      ...prev,
      clinicalSummary: summary,
      recommendations: recs,
    }));

    toast('✨ تم توليد الخلاصة الإكلينيكية والتوصيات العلاجية وفق معايير مقياس د. أبو حسيبة', 'ok');
  };

  // Export selected weakness items to the student's active IEP program
  const handleExportToIEP = () => {
    if (!form.stuId) {
      toast('⚠️ الرجاء اختيار الطالب المستهدف أولاً', 'warn');
      return;
    }

    const savedPrograms = lsGet('studentPrograms') || [];
    const activeProgramIndex = savedPrograms.findIndex(p => p.stuId === form.stuId && p.status === 'active');

    if (activeProgramIndex === -1) {
      toast('⚠️ لا يوجد برنامج تربوي فردي (IEP) نشط ومسجل حالياً لهذا الطالب لتنزيل الأهداف فيه. الرجاء إنشاء خطة جديدة أولاً من علامة تبويب البرامج.', 'warn');
      return;
    }

    const activeProgram = savedPrograms[activeProgramIndex];
    const existingGoals = activeProgram.goals || [];

    const receptiveWeaknessGoals = scoring.receptiveWeaknesses
      .filter(w => selectedGoals[`r_${w.id}`])
      .map(w => ({
        id: uid(),
        title: `أداء استقبالي: ${w.text}`,
        domain: 'language',
        target: w.goal,
        criteria: 'إتقان بنسبة 80% في 3 جلسات متتالية',
        startDate: todayStr(),
        status: 'pending',
        notes: 'مُرحل تلقائياً من تقرير مقياس د. أبو حسيبة للغة',
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
        notes: 'مُرحل تلقائياً من تقرير مقياس د. أبو حسيبة للغة',
      }));

    const newlyAddedGoals = [...receptiveWeaknessGoals, ...expressiveWeaknessGoals];

    if (newlyAddedGoals.length === 0) {
      toast('⚠️ الرجاء تحديد هدف واحد على الأقل للترحيل', 'warn');
      return;
    }

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

  // Final submission and save of assessment record
  const handleSave = () => {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار التلميذ أولاً من القائمة', 'er');
      return;
    }

    if (totalAnswered < 20) {
      if (!window.confirm(`⚠️ تم تقييم (${totalAnswered}) بنداً فقط من أصل 133 بنداً. هل تود حفظ التقييم كمسودة مؤقتة؟`)) {
        return;
      }
    }

    const finalAssessment = {
      ...form,
      id: initialData?.id || uid(),
      measureId: 'abuhasiba_arabic_lang',
      scaleId: 'abuhasiba_arabic_lang',
      scaleType: 'abuhasiba_arabic_lang',
      measureName: 'مقياس د. أحمد أبو حسيبة للغة المعرب (PLS)',
      scaleName: 'مقياس د. أحمد أبو حسيبة للغة المعرب (PLS)',
      category: 'speech_language',
      categoryName: 'التخاطب والنمو اللغوي',
      author: ABUHASIBA_COPYRIGHT_INFO.authorAr,
      evaluator: form.specialistName || form.examinerName,
      examinerName: form.specialistName || form.examinerName,

      // Psychometrics and composite indices
      score: scoring.totalRawScore,
      maxScore: 133,
      percentage: `${completionPercentage}%`,
      percentageNum: completionPercentage,
      receptiveRaw: scoring.receptiveRawScore,
      expressiveRaw: scoring.expressiveRawScore,
      standardScore: scoring.totalSS,
      receptiveSS: scoring.receptiveSS,
      expressiveSS: scoring.expressiveSS,
      percentile: scoring.totalPR,
      receptivePR: scoring.receptivePR,
      expressivePR: scoring.expressivePR,

      // Developmental age and delay gaps
      ageEquivalent: `${Math.floor(scoring.totalLAEMonths / 12)}س و ${scoring.totalLAEMonths % 12}ش`,
      receptiveLAEMonths: scoring.receptiveLAEMonths,
      expressiveLAEMonths: scoring.expressiveLAEMonths,
      totalLAEMonths: scoring.totalLAEMonths,
      delayGap: `${Math.floor(scoring.totalDelayGapMonths / 12)}س و ${scoring.totalDelayGapMonths % 12}ش`,
      totalDelayGapMonths: scoring.totalDelayGapMonths,
      receptiveDelayGapMonths: scoring.receptiveDelayGapMonths,
      expressiveDelayGapMonths: scoring.expressiveDelayGapMonths,

      level: scoring.clinicalClassification,
      severityColor: scoring.severityColor,
      clinicalClassification: scoring.clinicalClassification,
      cutoffText: scoring.cutoffText,

      // Results storage
      results: {
        receptive: form.resultsReceptive,
        expressive: form.resultsExpressive,
      },
      resultsReceptive: form.resultsReceptive,
      resultsExpressive: form.resultsExpressive,
      receptiveWeaknesses: scoring.receptiveWeaknesses,
      expressiveWeaknesses: scoring.expressiveWeaknesses,
      scoring,
      clinicalSummary: form.clinicalSummary || `تم إجراء تقييم إكلينيكي للغة باستخدام مقياس د. أحمد أبو حسيبة للغة المعرب (PLS). حقق الطالب درجة خام كلية بلغت ${scoring.totalRawScore} من أصل 133، مما يضعه عند درجة معيارية كلية SS: ${scoring.totalSS} وبدرجة رتبة مئينية %${scoring.totalPR}. يكافئ النمو اللغوي للطفل عمراً إنمائياً إجمالياً قدره ${Math.floor(scoring.totalLAEMonths / 12)} سنوات و ${scoring.totalLAEMonths % 12} أشهر بفجوة تأخر لغوية تبلغ ${Math.floor(scoring.totalDelayGapMonths / 12)} سنوات و ${scoring.totalDelayGapMonths % 12} أشهر، مما يشير إجمالاً إلى [${scoring.clinicalClassification.split('(')[0]}].`,
      recommendations: form.recommendations || `1. تحويل نقاط الضعف المستخلصة بالتقرير (عددها ${scoring.receptiveWeaknesses.length + scoring.expressiveWeaknesses.length} هدفاً) إلى أهداف سلوكية ضمن الخطة الفردية للبدء الفوري بالتدريب. \n2. تقديم أنشطة التفاعل اللفظي واللعب التخيلي والقصصي لتوسيع المهارات التعبيرية. \n3. تدريب الأبوين على إثراء البيئة المنزلية لغوياً بالطلب وتسمية الأشياء.`,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, finalAssessment);
      toast('✅ تم تحديث وحفظ تقييم د. أحمد أبو حسيبة للغة المعرب بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', finalAssessment);
      toast('✅ تم حفظ تطبيق مقياس د. أحمد أبو حسيبة للغة المعرب بنجاح', 'ok');
    }

    if (onSaved) onSaved(finalAssessment);
    onClose();
  };

  // Safe close confirmation
  const handleSafeClose = () => {
    if (totalAnswered > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${totalAnswered}) بنداً في مقياس د. أبو حسيبة للغة. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!form.studentName) return;
    const text = `*تقرير مقياس د. أحمد أبو حسيبة للغة المعرب (PLS)*\n\n` +
      `• *اسم الطالب:* ${form.studentName}\n` +
      `• *العمر الزمني:* ${form.age || `${Math.floor(studentAgeMonths / 12)} سنوات`}\n` +
      `• *الدرجة الخام الكلية:* ${scoring.totalRawScore} / 133\n` +
      `• *الدرجة المعيارية الكلية (SS):* ${scoring.totalSS}\n` +
      `• *الرتبة المئينية الكلية (PR):* ${scoring.totalPR}%\n` +
      `• *العمر اللغوي الكلي المكافئ (LAE):* ${Math.floor(scoring.totalLAEMonths / 12)}س و ${scoring.totalLAEMonths % 12}ش\n` +
      `• *فجوة التأخر اللغوي:* ${Math.floor(scoring.totalDelayGapMonths / 12)}س و ${scoring.totalDelayGapMonths % 12}ش\n` +
      `• *التشخيص الإكلينيكي:* ${scoring.clinicalClassification.split('(')[0]}\n\n` +
      `*أخصائي التخاطب واللغة:* ${form.specialistName || form.examinerName || 'المشرف المعتمد'}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div
        className="mb"
        style={{
          maxWidth: 'min(1360px, calc(100vw - 24px))',
          width: '100%',
        }}
      >
        {/* Modal Main Header - Exact Match with Image & Standard Header */}
        <div
          className="fhd modal-header-custom"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          {/* Right Section: Icon & Title & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🧠</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس د. أحمد أبو حسيبة للغة المعرب (PLS)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  133 بنداً تشخيصياً • 17 فئة عمرية
                </span>
                <span className="bdg" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', fontWeight: 800 }}>
                  د. أحمد أبو حسيبة
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#082f49', color: '#bae6fd', fontSize: '0.68rem', fontWeight: 800 }}>
                  © دار النشر والتوزيع / حقوق الطبع محفوظة للمؤلف
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  التقييم السيكومتري المقنن للغة الاستقبالية (62 بنداً) واللغة التعبيرية (71 بنداً) وفجوات التأخر النمائي
                </span>
              </div>
            </div>
          </div>

          {/* Left Section: Controls Button matching the uploaded screenshot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setShowCopyrightDetails(s => !s)}
              style={{
                background: showCopyrightDetails ? '#fff' : 'rgba(255,255,255,0.2)',
                color: showCopyrightDetails ? '#0369a1' : '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
                borderRadius: 8,
                padding: '5px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>📜</span>
              <span>حقوق الملكية الفكرية</span>
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={handleSafeClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 8,
                padding: '5px 12px',
              }}
            >
              ✖ إغلاق
            </button>
          </div>
        </div>

        {/* EXPANDABLE DETAILED COPYRIGHT NOTICE */}
        {showCopyrightDetails && (
          <div
            style={{
              background: '#f0f9ff',
              padding: '14px 20px',
              borderBottom: '2px solid #bae6fd',
              fontSize: '0.82rem',
              color: '#075985',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق الملكية الفكرية والتقنين الإكلينيكي لمقياس د. أحمد أبو حسيبة للغة المعرب:
            </div>

            <div
              style={{
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#0369a1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>حقوق النشر والملكية الفكرية:</strong> {ABUHASIBA_COPYRIGHT_INFO.measureNameAr} ({ABUHASIBA_COPYRIGHT_INFO.measureNameEn}) — إعداد {ABUHASIBA_COPYRIGHT_INFO.authorAr}.
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#fff', padding: '3px 8px', borderRadius: 6, border: '1px solid #7dd3fc', fontWeight: 700 }}>
                {ABUHASIBA_COPYRIGHT_INFO.publisher}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <strong>المؤلف والباحث:</strong> {ABUHASIBA_COPYRIGHT_INFO.authorAr} ({ABUHASIBA_COPYRIGHT_INFO.authorEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <strong>المدى العمري المستهدف:</strong> {ABUHASIBA_COPYRIGHT_INFO.ageRange}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <strong>المعايير السيكومترية:</strong> {ABUHASIBA_COPYRIGHT_INFO.normSamples}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <strong>قواعد الخط القاعدي والسقف:</strong> {ABUHASIBA_COPYRIGHT_INFO.basalCeilingRules}
              </div>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem', color: '#92400e' }}>
              <strong>⚠️ تنبيه إكلينيكي وتوجيه مهني:</strong> هذا النظام الرقمي مخصص لرصد الاستجابات والمعالجة السيكومترية الآلية. يُشترط لتطبيق هذا الاختبار استخدام الأدوات الحسية وكتيب الصور الأصلي الخاص بمقياس الدكتور أحمد أبو حسيبة لضمان دقة وسلامة التطبيق.
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
            {/* Total Language Score */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #0284c7',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المؤشر الكلي الخام:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: scoring.severityColor }}>
                {scoring.totalRawScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / 133
              </span>
            </div>

            {/* Receptive Subtest */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #0369a1',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>استقبالي (62 بنداً):</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0369a1' }}>
                {scoring.receptiveRawScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / 62 (SS: {scoring.receptiveSS})
              </span>
            </div>

            {/* Expressive Subtest */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #0f766e',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>تعبيري (71 بنداً):</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f766e' }}>
                {scoring.expressiveRawScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / 71 (SS: {scoring.expressiveSS})
              </span>
            </div>

            {/* Language Age Equivalent (LAE) */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #38bdf8',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>العمر اللغوي المكافئ (LAE):</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0284c7' }}>
                {Math.floor(scoring.totalLAEMonths / 12)}س و ${scoring.totalLAEMonths % 12}ش
              </span>
            </div>

            {/* Delay Gap */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${scoring.totalDelayGapMonths > 6 ? '#fca5a5' : '#cbd5e1'}`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>فجوة التأخر اللغوي:</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: scoring.totalDelayGapMonths > 6 ? '#dc2626' : '#16a34a' }}>
                {Math.floor(scoring.totalDelayGapMonths / 12)}س و ${scoring.totalDelayGapMonths % 12}ش
              </span>
            </div>

            {/* Overall Clinical Decision Badge */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${scoring.severityColor}`,
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>التشخيص الإكلينيكي المعتمد:</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: scoring.severityColor }}>
                {scoring.clinicalClassification.split('(')[0]} (SS: {scoring.totalSS} · %{scoring.totalPR})
              </span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {totalAnswered} / 133 بنداً تم تقييمها
              </div>
              <div style={{ background: 'var(--border-color)', height: 6, width: 120, borderRadius: 3, marginTop: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    background: completionPercentage === 100 ? '#059669' : '#0284c7',
                    height: '100%',
                    width: `${completionPercentage}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            <span className={`bdg ${completionPercentage === 100 ? 'b-gr' : 'b-bl'}`} style={{ fontSize: '0.75rem' }}>
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="modal-scrollable-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* 1. Clinical Meta Header: 2-Row Layout with Collapse & Edit Controls */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Meta Top Header with Collapsible & Manual Edit Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isHeaderCollapsed ? 'none' : '1px dashed var(--border-color)', paddingBottom: isHeaderCollapsed ? 0 : 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.9rem' }}>📋</span>
                <span style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-main)' }}>
                  بيانات الطفل المفحوص وتفاصيل جلسة التخاطب واللغة
                </span>
                {form.studentName && (
                  <span className="bdg b-bl" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                    {form.studentName} ({form.age || `${Math.floor(studentAgeMonths / 12)} سنوات`})
                  </span>
                )}
                {form.diagnosis && (
                  <span className="bdg b-gr" style={{ fontSize: '0.7rem' }}>
                    {form.diagnosis}
                  </span>
                )}
                <span className="bdg" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', fontWeight: 800 }}>
                  نقطة البداية لسنّه: استقبالي #{startingPoints.receptiveStart} · تعبيري #{startingPoints.expressiveStart}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => setIsManualEdit(e => !e)}
                  style={{
                    fontSize: '0.74rem',
                    padding: '3px 8px',
                    background: isManualEdit ? '#fef3c7' : 'var(--g0)',
                    color: isManualEdit ? '#92400e' : 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 700,
                  }}
                >
                  {isManualEdit ? '🔒 قفل التعديل' : '✏️ تعديل يدوي'}
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => setIsHeaderCollapsed(c => !c)}
                  style={{
                    fontSize: '0.74rem',
                    padding: '3px 8px',
                    background: 'var(--g0)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 700,
                  }}
                >
                  {isHeaderCollapsed ? '⬇️ إظهار التفاصيل' : '⬆️ إخفاء التفاصيل'}
                </button>
              </div>
            </div>

            {/* 2-Row Form Content (Shown only if not collapsed) */}
            {!isHeaderCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
                {/* ROW 1: Student Picker, Age, Diagnosis, Assessment Date */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {/* Student Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      الطفل المفحوص <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.mode === 'other' ? '__other__' : (form.stuId || '')}
                      onChange={handleSelectStudent}
                    >
                      <option value="">-- اختر طفلاً مسجلاً في المركز --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name || s.fullName} {s.diagnosis ? `(${s.diagnosis})` : ''}
                        </option>
                      ))}
                      <option value="__other__">➕ طفل / مستفيد خارجي (إدخال يدوي)</option>
                    </select>
                  </div>

                  {/* Manual Name (if mode === 'other' or isManualEdit) */}
                  {(form.mode === 'other' || isManualEdit) && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                        اسم الطفل (يدوي)
                      </label>
                      <input
                        type="text"
                        className="inp"
                        style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                        value={form.studentName}
                        onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                        placeholder="الاسم الثلاثي أو الرباعي..."
                      />
                    </div>
                  )}

                  {/* Chronological Age & DOB */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      تاريخ الميلاد والسن الزمني
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="date"
                        className="inp"
                        style={{ width: '60%', fontSize: '0.78rem', padding: '6px 6px' }}
                        value={form.dob || ''}
                        onChange={e => {
                          const dobVal = e.target.value;
                          setForm(f => ({
                            ...f,
                            dob: dobVal,
                            age: dobVal ? calcAge(dobVal) : '',
                          }));
                        }}
                      />
                      <input
                        type="text"
                        className="inp"
                        style={{ width: '40%', fontSize: '0.78rem', padding: '6px 6px' }}
                        value={form.age || `${Math.floor(studentAgeMonths / 12)}س ${studentAgeMonths % 12}ش`}
                        onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                        placeholder="العمر..."
                        disabled={!isManualEdit && !!form.dob}
                      />
                    </div>
                  </div>

                  {/* Medical Diagnosis */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      التشخيص الطبي / النمائي
                    </label>
                    <input
                      type="text"
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.diagnosis || ''}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                      placeholder="تأخر لغوي نمائي، طيف التوحد، داون..."
                    />
                  </div>

                  {/* Assessment Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      تاريخ التقييم والجلسة <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                </div>

                {/* ROW 2: Specialist Name, Respondent Name, Grade/Nursery, Relationship */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {/* Examiner / Specialist */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      أخصائي التخاطب واللغة / الفاحص
                    </label>
                    <input
                      type="text"
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.specialistName || form.examinerName}
                      onChange={e => setForm(f => ({ ...f, specialistName: e.target.value, examinerName: e.target.value }))}
                      placeholder="اسم الأخصائي المطبق..."
                    />
                  </div>

                  {/* Respondent Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      المستجيب / المرافق أثناء الفحص
                    </label>
                    <input
                      type="text"
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.raterName}
                      onChange={e => setForm(f => ({ ...f, raterName: e.target.value }))}
                      placeholder="اسم الأم / الأب / المعلمة..."
                    />
                  </div>

                  {/* Grade / Nursery / School */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      الصف / الروضة / المركز
                    </label>
                    <input
                      type="text"
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.grade || form.school}
                      onChange={e => setForm(f => ({ ...f, grade: e.target.value, school: e.target.value }))}
                      placeholder="الروضة، التمهيدي، الصف الأول..."
                    />
                  </div>

                  {/* Relationship / Role */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      صلة القرابة / صفة المرافق
                    </label>
                    <input
                      type="text"
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.raterRelation}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                      placeholder="ولي الأمر، الأم، الأب..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 6, borderBottom: '2px solid var(--border-color)', paddingBottom: 6, flexShrink: 0 }}>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'receptive' ? 'btn-p' : ''}`}
              onClick={() => setActiveTab('receptive')}
              style={{
                fontWeight: 800,
                fontSize: '0.85rem',
                borderRadius: '8px 8px 0 0',
                background: activeTab === 'receptive' ? '#0369a1' : 'var(--g0)',
                color: activeTab === 'receptive' ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderBottom: activeTab === 'receptive' ? '2px solid #0369a1' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>📥</span>
              <span>1. اللغة الاستقبالية (62 بنداً)</span>
              <span className="bdg" style={{ background: activeTab === 'receptive' ? 'rgba(255,255,255,0.3)' : 'var(--g2)', color: activeTab === 'receptive' ? '#fff' : 'var(--text-main)', fontSize: '0.7rem' }}>
                {scoring.receptiveRawScore}/62
              </span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'expressive' ? 'btn-p' : ''}`}
              onClick={() => setActiveTab('expressive')}
              style={{
                fontWeight: 800,
                fontSize: '0.85rem',
                borderRadius: '8px 8px 0 0',
                background: activeTab === 'expressive' ? '#0f766e' : 'var(--g0)',
                color: activeTab === 'expressive' ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderBottom: activeTab === 'expressive' ? '2px solid #0f766e' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>📤</span>
              <span>2. اللغة التعبيرية (71 بنداً)</span>
              <span className="bdg" style={{ background: activeTab === 'expressive' ? 'rgba(255,255,255,0.3)' : 'var(--g2)', color: activeTab === 'expressive' ? '#fff' : 'var(--text-main)', fontSize: '0.7rem' }}>
                {scoring.expressiveRawScore}/71
              </span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'report' ? 'btn-p' : ''}`}
              onClick={() => setActiveTab('report')}
              style={{
                fontWeight: 800,
                fontSize: '0.85rem',
                borderRadius: '8px 8px 0 0',
                background: activeTab === 'report' ? '#4338ca' : 'var(--g0)',
                color: activeTab === 'report' ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderBottom: activeTab === 'report' ? '2px solid #4338ca' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>📊</span>
              <span>3. التقرير الإكلينيكي والتشخيص والربط بـ (IEP)</span>
            </button>
          </div>

          {/* TAB 1 & TAB 2: RECEPTIVE & EXPRESSIVE CHECKLISTS */}
          {(activeTab === 'receptive' || activeTab === 'expressive') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Basal & Ceiling Quick Status & Automation Bar */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Basal Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>الخط القاعدي (Basal):</span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: (activeTab === 'receptive' ? scoring.receptiveBasalIndex : scoring.expressiveBasalIndex) !== -1 ? '#16a34a' : '#ea580c',
                      }}
                    >
                      {(activeTab === 'receptive' ? scoring.receptiveBasalIndex : scoring.expressiveBasalIndex) !== -1
                        ? `✓ محقق (بدءاً من البند ${(activeTab === 'receptive' ? scoring.receptiveBasalIndex : scoring.expressiveBasalIndex) + 1})`
                        : '⚠️ غير مكتمل (يتطلب 3 متتالية صحيحة)'}
                    </span>
                  </div>

                  <div style={{ width: 1, height: 18, background: 'var(--border-color)' }} />

                  {/* Ceiling Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>حد التوقف (Ceiling):</span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: (activeTab === 'receptive' ? scoring.receptiveCeilingIndex : scoring.expressiveCeilingIndex) !== -1 ? '#dc2626' : '#2563eb',
                      }}
                    >
                      {(activeTab === 'receptive' ? scoring.receptiveCeilingIndex : scoring.expressiveCeilingIndex) !== -1
                        ? `✗ تم رصده (عند البند ${(activeTab === 'receptive' ? scoring.receptiveCeilingIndex : scoring.expressiveCeilingIndex) + 1})`
                        : '✓ لم يتم بلوغه (أقل من 5 أخطاء متتالية)'}
                    </span>
                  </div>
                </div>

                {/* Automation Buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-xs"
                    onClick={() => applyBasalAutofill(activeTab)}
                    style={{
                      border: '1px solid #16a34a',
                      color: '#16a34a',
                      background: 'rgba(22, 163, 74, 0.08)',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                    }}
                  >
                    ⚡ اعتماد السوابق (1)
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs"
                    onClick={() => applyCeilingAutofill(activeTab)}
                    style={{
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.08)',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                    }}
                  >
                    🛑 تصفير اللواحق (0)
                  </button>
                </div>
              </div>

              {/* Age Stage Filter Control Bar */}
              <div
                style={{
                  background: 'var(--g0)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                    🔍 تصفية البنود بحسب المرحلة العمرية:
                  </span>
                  <select
                    value={selectedAgeFilter}
                    onChange={(e) => setSelectedAgeFilter(e.target.value)}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid #0284c7',
                      background: 'var(--card-bg, #ffffff)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="all">عرض جميع الفئات العمرية (133 بنداً)</option>
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
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.76rem',
                    }}
                  >
                    🎯 تصفية لعمر الطفل الحالي ({studentAgeMonths} شهراً)
                  </button>
                )}
              </div>

              {/* Items Evaluation List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

                    const basalIndex = activeTab === 'receptive' ? scoring.receptiveBasalIndex : scoring.expressiveBasalIndex;
                    const ceilingIndex = activeTab === 'receptive' ? scoring.receptiveCeilingIndex : scoring.expressiveCeilingIndex;

                    const isAssumedCorrect = basalIndex !== -1 && idx < basalIndex;
                    const isAssumedFailed = ceilingIndex !== -1 && idx >= ceilingIndex + 5;

                    return (
                      <div
                        key={item.id}
                        style={{
                          background: isAssumedCorrect
                            ? 'rgba(22, 163, 74, 0.12)'
                            : isAssumedFailed
                            ? 'rgba(239, 68, 68, 0.12)'
                            : isRecommendedStart
                            ? 'rgba(2, 132, 199, 0.12)'
                            : 'var(--bg-card, #ffffff)',
                          border: isRecommendedStart ? '2px solid #0284c7' : '1px solid var(--border-color)',
                          borderRadius: 8,
                          padding: '10px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 260 }}>
                            <span
                              style={{
                                background: activeTab === 'receptive' ? '#0369a1' : '#0f766e',
                                color: '#fff',
                                fontWeight: 800,
                                borderRadius: '50%',
                                width: 26,
                                height: 26,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.76rem',
                                flexShrink: 0,
                              }}
                            >
                              {item.id}
                            </span>
                            <div>
                              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                                {item.text}
                              </strong>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                                الفئة: <strong style={{ color: '#0369a1' }}>{item.ageGroup}</strong> · المجال: {item.domain}
                                {isRecommendedStart && <strong style={{ color: '#0284c7', marginRight: 8 }}>[نقطة البداية لسن الطفل]</strong>}
                                {isAssumedCorrect && <strong style={{ color: '#16a34a', marginRight: 8 }}>[ممنوح مجاناً - تحت القاعدة]</strong>}
                                {isAssumedFailed && <strong style={{ color: '#ef4444', marginRight: 8 }}>[مُصفر تلقائياً - بعد السقف]</strong>}
                              </span>
                            </div>
                          </div>

                          {/* Score Selector (0 or 1) */}
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button
                              type="button"
                              className="btn btn-xs"
                              onClick={() => handleItemScoreChange(activeTab, item.id, currentScore === 0 ? undefined : 0)}
                              style={{
                                width: 68,
                                fontWeight: 800,
                                background: currentScore === 0 ? '#ef4444' : 'var(--g0)',
                                color: currentScore === 0 ? '#fff' : 'var(--text-main)',
                                border: '1px solid var(--border-color)',
                                padding: '4px 0',
                                fontSize: '0.78rem',
                              }}
                            >
                              خطأ (0)
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs"
                              onClick={() => handleItemScoreChange(activeTab, item.id, currentScore === 1 ? undefined : 1)}
                              style={{
                                width: 68,
                                fontWeight: 800,
                                background: currentScore === 1 ? '#10b981' : 'var(--g0)',
                                color: currentScore === 1 ? '#fff' : 'var(--text-main)',
                                border: '1px solid var(--border-color)',
                                padding: '4px 0',
                                fontSize: '0.78rem',
                              }}
                            >
                              صح (1)
                            </button>
                          </div>
                        </div>

                        {/* Optional Behavioral Note Input */}
                        <div style={{ marginTop: 2 }}>
                          <input
                            type="text"
                            placeholder="تدوين ملاحظة سلوكية سريعة أثناء التطبيق..."
                            value={form.itemNotes?.[item.id] || ''}
                            onChange={(e) => handleItemNoteChange(item.id, e.target.value)}
                            style={{
                              width: '100%',
                              fontSize: '0.74rem',
                              padding: '3px 8px',
                              borderRadius: 4,
                              border: '1px solid var(--border-color)',
                              background: 'transparent',
                              color: 'var(--text-main)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: REPORT, IEP GOALS & CLINICAL SUMMARY */}
          {activeTab === 'report' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Quick Fill Simulation Strip */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.9rem' }}>⚡</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    التعبئة السريعة للاختبار السريري النموذجي:
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-xs"
                    onClick={() => handleAutoFill('normal')}
                    style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontWeight: 700 }}
                  >
                    طبيعي (Normal)
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs"
                    onClick={() => handleAutoFill('mild')}
                    style={{ background: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', fontWeight: 700 }}
                  >
                    تأخر لغوي بسيط
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs"
                    onClick={() => handleAutoFill('moderate')}
                    style={{ background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa', fontWeight: 700 }}
                  >
                    تأخر لغوي متوسط
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs"
                    onClick={() => handleAutoFill('severe')}
                    style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: 700 }}
                  >
                    تأخر لغوي شديد
                  </button>
                </div>
              </div>

              {/* Statistical & Psychometrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                {/* 1. Psychometric Scores Summary Table */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14 }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📈</span> المؤشرات السيكومترية والنمائية المعتمدة (PLS)
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 4px', color: 'var(--text-sub)' }}>اللغة الاستقبالية (62 بنداً):</td>
                        <td style={{ padding: '6px 4px', fontWeight: 800, textAlign: 'left' }}>
                          {scoring.receptiveRawScore}/62 (SS: {scoring.receptiveSS} · %{scoring.receptivePR})
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 4px', color: 'var(--text-sub)' }}>اللغة التعبيرية (71 بنداً):</td>
                        <td style={{ padding: '6px 4px', fontWeight: 800, textAlign: 'left' }}>
                          {scoring.expressiveRawScore}/71 (SS: {scoring.expressiveSS} · %{scoring.expressivePR})
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 4px', color: 'var(--text-sub)' }}>الدرجة الكلية المركبة:</td>
                        <td style={{ padding: '6px 4px', fontWeight: 900, color: '#0369a1', textAlign: 'left' }}>
                          {scoring.totalRawScore}/133 (SS: {scoring.totalSS} · %{scoring.totalPR})
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 4px', color: 'var(--text-sub)' }}>العمر اللغوي الاستقبالي:</td>
                        <td style={{ padding: '6px 4px', fontWeight: 700, textAlign: 'left' }}>
                          {Math.floor(scoring.receptiveLAEMonths / 12)}س و {scoring.receptiveLAEMonths % 12}ش
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 4px', color: 'var(--text-sub)' }}>العمر اللغوي التعبيري:</td>
                        <td style={{ padding: '6px 4px', fontWeight: 700, textAlign: 'left' }}>
                          {Math.floor(scoring.expressiveLAEMonths / 12)}س و {scoring.expressiveLAEMonths % 12}ش
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 4px', color: 'var(--text-sub)' }}>العمر اللغوي الإجمالي (LAE):</td>
                        <td style={{ padding: '6px 4px', fontWeight: 800, color: '#0284c7', textAlign: 'left' }}>
                          {Math.floor(scoring.totalLAEMonths / 12)}س و {scoring.totalLAEMonths % 12}ش
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 4px', color: 'var(--text-sub)' }}>فجوة التأخر اللغوي (Delay Gap):</td>
                        <td style={{ padding: '6px 4px', fontWeight: 900, color: scoring.totalDelayGapMonths > 6 ? '#dc2626' : '#16a34a', textAlign: 'left' }}>
                          {Math.floor(scoring.totalDelayGapMonths / 12)}س و {scoring.totalDelayGapMonths % 12}ش
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 4px', color: 'var(--text-sub)' }}>محك القطع العمري (Cut-off):</td>
                        <td style={{ padding: '6px 4px', fontWeight: 700, color: '#475569', textAlign: 'left' }}>
                          {scoring.cutoffText}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. IEP Goal Generator and Weakness Tracker */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🎯</span> نقاط الضعف والأهداف المقترحة للخطة (IEP)
                    </h4>
                    <button
                      type="button"
                      className="btn btn-xs"
                      onClick={handleExportToIEP}
                      style={{ background: '#10b981', color: '#fff', fontWeight: 800, border: 'none', padding: '4px 10px', borderRadius: 6 }}
                    >
                      ترحيل للخطة (IEP) 📥
                    </button>
                  </div>

                  <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4 }}>
                    {[
                      ...scoring.receptiveWeaknesses.map(w => ({ ...w, type: 'receptive', prefix: 'r_' })),
                      ...scoring.expressiveWeaknesses.map(w => ({ ...w, type: 'expressive', prefix: 'e_' })),
                    ].length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-sub)', fontSize: '0.82rem' }}>
                        🎉 لا توجد نقاط ضعف مرصودة، أداء الطفل يغطي كافة المهارات المطلوبة!
                      </div>
                    ) : (
                      [
                        ...scoring.receptiveWeaknesses.map(w => ({ ...w, type: 'receptive', prefix: 'r_' })),
                        ...scoring.expressiveWeaknesses.map(w => ({ ...w, type: 'expressive', prefix: 'e_' })),
                      ].map((weakness) => {
                        const itemKey = `${weakness.prefix}${weakness.id}`;
                        const isChecked = !!selectedGoals[itemKey];

                        return (
                          <label
                            key={itemKey}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8,
                              padding: '6px 8px',
                              borderRadius: 6,
                              background: isChecked ? '#f0fdf4' : 'var(--g0)',
                              border: `1px solid ${isChecked ? '#bbf7d0' : 'var(--border-color)'}`,
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedGoals(prev => ({ ...prev, [itemKey]: checked }));
                              }}
                              style={{ marginTop: 2 }}
                            />
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 700, color: weakness.type === 'receptive' ? '#0369a1' : '#0f766e', display: 'block' }}>
                                [{weakness.type === 'receptive' ? 'استقبالي' : 'تعبيري'} #{weakness.id}] {weakness.text}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                                الهدف: {weakness.goal}
                              </span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Clinical Narrative & Recommendations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                {/* Clinical Summary */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      📝 الخلاصة والتشخيص الإكلينيكي المعتمد:
                    </label>
                    <button
                      type="button"
                      className="btn btn-xs"
                      onClick={applyAutoClinicalSummary}
                      style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: 700 }}
                    >
                      توليد آلي ✨
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    className="inp"
                    style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.6 }}
                    value={form.clinicalSummary}
                    onChange={(e) => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                    placeholder="اضغط على زر (توليد آلي) لكتابة التقرير السيكومتري والتشخيصي الشامل تلقائياً..."
                  />
                </div>

                {/* Therapeutic Recommendations */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      💡 التوصيات العلاجية والبرنامج التدريبي المقترح:
                    </label>
                  </div>
                  <textarea
                    rows={6}
                    className="inp"
                    style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.6 }}
                    value={form.recommendations}
                    onChange={(e) => setForm(f => ({ ...f, recommendations: e.target.value }))}
                    placeholder="التوصيات والتدخلات التخاطبية والتأهيلية الموصى بها للطفل..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--g0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handlePrint}
              style={{ fontWeight: 700 }}
            >
              🖨️ طباعة التقرير
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleShareWhatsApp}
              style={{ fontWeight: 700, background: '#25d366', color: '#fff', border: 'none' }}
            >
              📲 واتساب
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleSafeClose}
              style={{ fontWeight: 700 }}
            >
              إلغاء التغييرات ✖
            </button>
            <button
              type="button"
              className="btn btn-sm btn-p"
              onClick={handleSave}
              style={{
                fontWeight: 800,
                padding: '6px 24px',
                background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
                borderColor: '#0369a1',
              }}
            >
              💾 حفظ التقييم المعتمد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
