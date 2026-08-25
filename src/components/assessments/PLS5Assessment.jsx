import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd, lsGet } from '../../hooks/useStorage';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import {
  PLS5_COPYRIGHT_INFO,
  PLS5_RECEPTIVE_ITEMS,
  PLS5_EXPRESSIVE_ITEMS,
  getPLS5StartingPoints,
  calculatePLS5Psychometrics,
} from '../../data/pls5Data';

const EMPTY_PLS5_FORM = {
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
  resultsReceptive: {}, // key: "r_1", "r_2" ... -> 0 or 1
  resultsExpressive: {}, // key: "e_1", "e_2" ... -> 0 or 1
  clinicalSummary: '',
  recommendations: '',
};

export default function PLS5Assessment({
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
        ...EMPTY_PLS5_FORM,
        ...initialData,
        resultsReceptive: initialData.resultsReceptive || initialData.results?.receptive || {},
        resultsExpressive: initialData.resultsExpressive || initialData.results?.expressive || {},
        itemNotes: initialData.itemNotes || {},
      };
    }
    return {
      ...EMPTY_PLS5_FORM,
      specialistName: currentUser?.name || (emps[0]?.name || 'أخصائي التخاطب والنمو اللغوي'),
      examinerName: currentUser?.name || (emps[0]?.name || 'أخصائي التخاطب والنمو اللغوي'),
      date: todayStr(),
    };
  });

  const [activeTab, setActiveTab] = useState('receptive'); // 'receptive' | 'expressive' | 'report'
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);
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

  // Total evaluated items count
  const totalAnswered = useMemo(() => {
    const rCount = Object.values(form.resultsReceptive || {}).filter(v => v !== undefined && v !== null).length;
    const eCount = Object.values(form.resultsExpressive || {}).filter(v => v !== undefined && v !== null).length;
    return rCount + eCount;
  }, [form.resultsReceptive, form.resultsExpressive]);

  const completionPercentage = useMemo(() => {
    return Math.min(100, Math.round((totalAnswered / 80) * 100));
  }, [totalAnswered]);

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

  if (!isOpen) return null;

  // Handle single item score change (1 = correct, 0 = incorrect, undefined = clear)
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

  // Quick Action: Autofill all preceding items below Basal index with 1 (Credit)
  const applyBasalAutofill = (type) => {
    const isReceptive = type === 'receptive';
    const items = isReceptive ? PLS5_RECEPTIVE_ITEMS : PLS5_EXPRESSIVE_ITEMS;
    const basalIndex = isReceptive ? scoring.receptiveBasalIndex : scoring.expressiveBasalIndex;
    const resultsKey = isReceptive ? 'resultsReceptive' : 'resultsExpressive';
    const prefix = isReceptive ? 'r_' : 'e_';

    if (basalIndex === -1) {
      toast('⚠️ لم يتم رصد قاعدة تطبيق (Basal) صحيحة بعد. يجب إدخال 3 درجات (1) متتالية لتفعيل الاعتماد التلقائي', 'warn');
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
      toast('⚠️ لم يتم بلوغ حد التوقف (Ceiling) بعد. يجب رصد 6 إخفاقات (0) متتالية لتطبيق تصفير ما بعد حد التوقف', 'warn');
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
    toast('✅ تم اعتماد كافة البنود اللاحقة لحد التوقف (Ceiling) كغير متقنة (0) بنجاح', 'ok');
  };

  // Simulation handler for quick test filling
  const handleAutoFill = (level = 'normal') => {
    const newReceptive = {};
    const newExpressive = {};

    const receptiveStart = startingPoints.receptiveStart || 10;
    const expressiveStart = startingPoints.expressiveStart || 10;

    PLS5_RECEPTIVE_ITEMS.forEach((it) => {
      const key = `r_${it.id}`;
      if (level === 'normal') {
        newReceptive[key] = it.id <= receptiveStart + 5 ? 1 : (it.id <= receptiveStart + 8 ? 0 : 0);
      } else if (level === 'mild') {
        newReceptive[key] = it.id <= receptiveStart - 2 ? 1 : (it.id <= receptiveStart + 3 ? (it.id % 2 === 0 ? 1 : 0) : 0);
      } else if (level === 'moderate') {
        newReceptive[key] = it.id <= receptiveStart - 5 ? 1 : 0;
      } else if (level === 'severe') {
        newReceptive[key] = it.id <= 4 ? 1 : 0;
      }
    });

    PLS5_EXPRESSIVE_ITEMS.forEach((it) => {
      const key = `e_${it.id}`;
      if (level === 'normal') {
        newExpressive[key] = it.id <= expressiveStart + 4 ? 1 : (it.id <= expressiveStart + 7 ? 0 : 0);
      } else if (level === 'mild') {
        newExpressive[key] = it.id <= expressiveStart - 3 ? 1 : (it.id <= expressiveStart + 2 ? (it.id % 2 === 0 ? 1 : 0) : 0);
      } else if (level === 'moderate') {
        newExpressive[key] = it.id <= expressiveStart - 6 ? 1 : 0;
      } else if (level === 'severe') {
        newExpressive[key] = it.id <= 3 ? 1 : 0;
      }
    });

    setForm(prev => ({
      ...prev,
      resultsReceptive: newReceptive,
      resultsExpressive: newExpressive,
    }));

    toast(`⚡ تم تعبئة استجابات نموذجية لمقياس لغة الأطفال PLS-5 (${level === 'normal' ? 'أداء طبيعي' : level === 'mild' ? 'تأخر لغوي بسيط' : level === 'moderate' ? 'تأخر لغوي متوسط' : 'تأخر لغوي شديد'})`, 'ok');
  };

  // Generate Automated Clinical Summary & Recommendations
  const applyAutoClinicalSummary = () => {
    if (totalAnswered < 10) {
      toast('⚠️ يرجى تقييم عدد كافٍ من البنود لتوليد التقرير السيكومتري المعتمد', 'warn');
      return;
    }

    const summary = `تقرير التقييم الإكلينيكي بمقياس لغة الأطفال - الإصدار الخامس المعرب (PLS-5):\n\n` +
      `- اسم المفحوص: ${form.studentName || 'الطالب'}\n` +
      `- العمر الزمني: ${form.age || `${Math.floor(studentAgeMonths / 12)} سنوات`} (${studentAgeMonths} شهراً)\n` +
      `- إجمالي البنود المطبقة: (${totalAnswered} / 80) بنداً\n\n` +
      `📊 النتائج السيكومترية والمؤشرات اللغوية:\n` +
      `1. الفهم السمعي (اللغة الاستقبالية AC): الدرجة الخام (${scoring.receptiveRawScore}/40) · الدرجة المعيارية SS: (${scoring.receptiveSS}) · الرتبة المئينية PR: (%${scoring.receptivePR}) · العمر اللغوي المكافئ: (${Math.floor(scoring.receptiveLAEMonths / 12)}س و ${scoring.receptiveLAEMonths % 12}ش) بفجوة تأخر (${Math.floor(scoring.receptiveDelayGapMonths / 12)}س و ${scoring.receptiveDelayGapMonths % 12}ش).\n` +
      `2. التواصل اللفظي (اللغة التعبيرية EC): الدرجة الخام (${scoring.expressiveRawScore}/40) · الدرجة المعيارية SS: (${scoring.expressiveSS}) · الرتبة المئينية PR: (%${scoring.expressivePR}) · العمر اللغوي المكافئ: (${Math.floor(scoring.expressiveLAEMonths / 12)}س و ${scoring.expressiveLAEMonths % 12}ش) بفجوة تأخر (${Math.floor(scoring.expressiveDelayGapMonths / 12)}س و ${scoring.expressiveDelayGapMonths % 12}ش).\n` +
      `3. المؤشر الكلي للغة (Total Language): الدرجة الخام (${scoring.totalRawScore}/80) · الدرجة المعيارية الكلية SS: (${scoring.totalSS}) · الرتبة المئينية الكلية PR: (%${scoring.totalPR}) · العمر اللغوي الإجمالي: (${Math.floor(scoring.totalLAEMonths / 12)}س و ${scoring.totalLAEMonths % 12}ش) بفجوة تأخر إجمالية تبلغ (${Math.floor(scoring.totalDelayGapMonths / 12)}س و ${scoring.totalDelayGapMonths % 12}ش).\n\n` +
      `القرار والتشخيص الإكلينيكي المعتمد:\n` +
      `[${scoring.clinicalClassification}]\n` +
      `${scoring.cutoffText}`;

    const recs = (scoring.receptiveWeaknesses.length > 0 || scoring.expressiveWeaknesses.length > 0)
      ? `1. ترحيل نقاط الضعف المرصودة (${scoring.receptiveWeaknesses.length + scoring.expressiveWeaknesses.length} مهارة) إلى الخطة التربوية الفردية (IEP) والبدء الفوري بالتدريب.\n` +
        `2. البدء بتطوير المهارات الاستقبالية المفقودة (مثل: ${scoring.receptiveWeaknesses.slice(0, 3).map(w => w.domain).join('، ') || 'المفردات واتباع التعليمات'}) كأساس للإنتاج التعبيري.\n` +
        `3. تكثيف جلسات التخاطب والنمو اللغوي بمعدل 3 إلى 4 جلسات أسبوعية مع التركيز على التواصل الوظيفي.\n` +
        `4. إشراك الأسرة في البرنامج المنزلي وتطبيق استراتيجيات التوسيع اللفظي والنمذجة الصحيحة في المواقف اليومية.\n` +
        `5. إعادة التقييم بعد 6 أشهر لقياس المدى النمائي والتطور اللغوي.`
      : `1. استمرار تعزيز وتنمية الحصيلة اللغوية الاستقبالية والتعبيرية في البيئة الطبيعية.\n` +
        `2. تقديم أنشطة التفكير اللغوي والقصص المصورة لتوسيع القدرات الإدراكية والتعبيرية العليا.\n` +
        `3. المتابعة الدورية للنمو اللغوي العام.`;

    setForm(prev => ({
      ...prev,
      clinicalSummary: summary,
      recommendations: recs,
    }));

    toast('✨ تم توليد الخلاصة الإكلينيكية والتوصيات العلاجية وفق معايير مقياس PLS-5', 'ok');
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
        notes: 'مُرحل تلقائياً من تقرير مقياس اللغة PLS-5',
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
        notes: 'مُرحل تلقائياً من تقرير مقياس اللغة PLS-5',
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

  // Final submission and save of the PLS-5 assessment record
  const handleSave = () => {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار التلميذ أولاً من القائمة', 'er');
      return;
    }

    if (totalAnswered < 15) {
      if (!window.confirm(`⚠️ تم تقييم (${totalAnswered}) بنداً فقط من أصل 80 بنداً. هل تود حفظ التقييم كمسودة مؤقتة؟`)) {
        return;
      }
    }

    const finalAssessment = {
      ...form,
      id: initialData?.id || uid(),
      measureId: 'pls5_arabic',
      scaleId: 'pls5_arabic',
      scaleType: 'pls5_arabic',
      measureName: 'مقياس لغة الأطفال - الإصدار الخامس (PLS-5)',
      scaleName: 'مقياس لغة الأطفال - الإصدار الخامس (PLS-5)',
      category: 'speech_language',
      categoryName: 'التخاطب والنمو اللغوي',
      author: PLS5_COPYRIGHT_INFO.authorsAr,
      evaluator: form.specialistName || form.examinerName,
      examinerName: form.specialistName || form.examinerName,

      // Psychometrics and composite indices
      score: scoring.totalRawScore,
      maxScore: scoring.maxTotalScore || 80,
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
      clinicalSummary: form.clinicalSummary || `تم إجراء تقييم إكلينيكي للغة للطفل باستخدام مقياس لغة الأطفال (PLS-5). حقق الطالب درجة خام كلية بلغت ${scoring.totalRawScore} من أصل ${scoring.maxTotalScore}، مما يضعه عند درجة معيارية كلية SS: ${scoring.totalSS} وبدرجة رتبة مئينية %${scoring.totalPR}. يكافئ النمو اللغوي للطفل عمراً إنمائياً إجمالياً قدره ${Math.floor(scoring.totalLAEMonths / 12)} سنوات و ${scoring.totalLAEMonths % 12} أشهر بفجوة تأخر لغوية تبلغ ${Math.floor(scoring.totalDelayGapMonths / 12)} سنوات و ${scoring.totalDelayGapMonths % 12} أشهر، مما يشير إجمالاً إلى [${scoring.clinicalClassification.split('(')[0]}].`,
      recommendations: form.recommendations || `1. تحويل نقاط الضعف المستخلصة بالتقرير (عددها ${scoring.receptiveWeaknesses.length + scoring.expressiveWeaknesses.length} هدفاً) إلى أهداف سلوكية ضمن الخطة الفردية للبدء الفوري بالتدريب. \n2. تقديم أنشطة التفاعل اللفظي واللعب التخيلي والقصصي لتوسيع المهارات التعبيرية. \n3. تدريب الأبوين على إثراء البيئة المنزلية لغوياً بالطلب وتسمية الأشياء.`,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, finalAssessment);
      toast('✅ تم تحديث وحفظ تقييم لغة الأطفال (PLS-5) بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', finalAssessment);
      toast('✅ تم حفظ تطبيق مقياس لغة الأطفال (PLS-5) بنجاح', 'ok');
    }

    if (onSaved) onSaved(finalAssessment);
    onClose();
  };

  // Safe close confirmation
  const handleSafeClose = () => {
    if (totalAnswered > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${totalAnswered}) بنداً في مقياس لغة الأطفال (PLS-5). هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
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
    const text = `*تقرير مقياس لغة الأطفال - الإصدار الخامس (PLS-5)*\n\n` +
      `• *اسم الطالب:* ${form.studentName}\n` +
      `• *العمر الزمني:* ${form.age || `${Math.floor(studentAgeMonths / 12)} سنوات`}\n` +
      `• *الدرجة الخام الكلية:* ${scoring.totalRawScore} / ${scoring.maxTotalScore}\n` +
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
        {/* Modal Main Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🗣️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  مقياس لغة الأطفال - الإصدار الخامس (PLS-5)
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  Preschool Language Scale (5th Ed)
                </span>
                <span className="bdg" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', fontWeight: 800 }}>
                  د. زيمرمان، د. شتاينر، د. بوند
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#082f49', color: '#bae6fd', fontSize: '0.68rem', fontWeight: 800 }}>
                  © Pearson Clinical / PsychCorp
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  التقييم السيكومتري المقنن للغة الاستقبالية (Auditory Comprehension) واللغة التعبيرية (Expressive Communication)
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
                color: showCopyrightDetails ? '#0369a1' : '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontWeight: 700,
              }}
            >
              📜 {showCopyrightDetails ? 'إخفاء حقوق المقياس' : 'حقوق المقياس والتقنين'}
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
              <span>📜</span> إشعار حقوق الملكية الفكرية والتقنين الإكلينيكي لمقياس لغة الأطفال (PLS-5):
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
                  <strong>حقوق النشر والملكية الفكرية:</strong> {PLS5_COPYRIGHT_INFO.measureNameAr} ({PLS5_COPYRIGHT_INFO.measureNameEn}) — إعداد {PLS5_COPYRIGHT_INFO.authorsAr}.
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#fff', padding: '3px 8px', borderRadius: 6, border: '1px solid #7dd3fc', fontWeight: 700 }}>
                {PLS5_COPYRIGHT_INFO.publisher}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <strong>المؤلفون والباحثون:</strong> {PLS5_COPYRIGHT_INFO.authorsAr} ({PLS5_COPYRIGHT_INFO.authorsEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <strong>المدى العمري المستهدف:</strong> {PLS5_COPYRIGHT_INFO.ageRange}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <strong>المعايير السيكومترية:</strong> {PLS5_COPYRIGHT_INFO.normSamples}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                <strong>قواعد الخط القاعدي والسقف:</strong> {PLS5_COPYRIGHT_INFO.basalCeilingRules}
              </div>
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
                / {scoring.maxTotalScore || 80}
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
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>استقبالي (AC):</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0369a1' }}>
                {scoring.receptiveRawScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / 40 (SS: {scoring.receptiveSS})
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
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>تعبيري (EC):</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f766e' }}>
                {scoring.expressiveRawScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                / 40 (SS: {scoring.expressiveSS})
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
                {Math.floor(scoring.totalLAEMonths / 12)}س و {scoring.totalLAEMonths % 12}ش
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
                {Math.floor(scoring.totalDelayGapMonths / 12)}س و {scoring.totalDelayGapMonths % 12}ش
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
                {totalAnswered} / 80 بنداً تم تقييمها
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
                      placeholder="الأم، الأب، المعلمة، فحص مباشر..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subscales Navigation Tabs */}
          <div style={{ display: 'flex', gap: 6, borderBottom: '2px solid var(--border-color)', paddingBottom: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${activeTab === 'receptive' ? 'btn-p' : ''}`}
              style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                padding: '8px 16px',
                background: activeTab === 'receptive' ? '#0369a1' : 'var(--g0)',
                color: activeTab === 'receptive' ? '#fff' : 'var(--text-main)',
                border: '1px solid ' + (activeTab === 'receptive' ? '#0369a1' : 'var(--border-color)'),
              }}
              onClick={() => setActiveTab('receptive')}
            >
              📥 اللغة الاستقبالية (AC - 40 بنداً) ({scoring.receptiveRawScore}/40)
            </button>

            <button
              type="button"
              className={`btn ${activeTab === 'expressive' ? 'btn-p' : ''}`}
              style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                padding: '8px 16px',
                background: activeTab === 'expressive' ? '#0f766e' : 'var(--g0)',
                color: activeTab === 'expressive' ? '#fff' : 'var(--text-main)',
                border: '1px solid ' + (activeTab === 'expressive' ? '#0f766e' : 'var(--border-color)'),
              }}
              onClick={() => setActiveTab('expressive')}
            >
              📤 اللغة التعبيرية (EC - 40 بنداً) ({scoring.expressiveRawScore}/40)
            </button>

            <button
              type="button"
              className={`btn ${activeTab === 'report' ? 'btn-p' : ''}`}
              style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                padding: '8px 16px',
                background: activeTab === 'report' ? '#334155' : 'var(--g0)',
                color: activeTab === 'report' ? '#fff' : 'var(--text-main)',
                border: '1px solid ' + (activeTab === 'report' ? '#334155' : 'var(--border-color)'),
              }}
              onClick={() => {
                if (!validateStudentPick(form)) {
                  toast('⚠️ يرجى اختيار الطالب أولاً لعرض التقرير الإحصائي', 'warn');
                  return;
                }
                setActiveTab('report');
              }}
            >
              📊 التقرير السيكومتري والخطة الفردية (IEP)
            </button>
          </div>

          {/* Tab 1 & Tab 2: Receptive and Expressive Evaluation Workstation */}
          {(activeTab === 'receptive' || activeTab === 'expressive') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Basal & Ceiling Quick Action Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#166534', display: 'block', fontWeight: 700 }}>مستوى القاعدة (Basal Rule - 3 بنود متتالية صحيحة):</span>
                    <strong style={{ fontSize: '0.86rem', color: '#14532d' }}>
                      {activeTab === 'receptive'
                        ? (scoring.receptiveBasalIndex !== -1 ? `مؤسس عند البند #${scoring.receptiveBasalIndex + 1}` : 'غير مؤسس بعد ⚠️')
                        : (scoring.expressiveBasalIndex !== -1 ? `مؤسس عند البند #${scoring.expressiveBasalIndex + 1}` : 'غير مؤسس بعد ⚠️')
                      }
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyBasalAutofill(activeTab)}
                    className="btn btn-xs"
                    style={{ background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800, padding: '5px 12px' }}
                  >
                    اعتماد السوابق (1) ⚡
                  </button>
                </div>

                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#991b1b', display: 'block', fontWeight: 700 }}>سقف التوقف (Ceiling Rule - 6 إخفاقات متتالية):</span>
                    <strong style={{ fontSize: '0.86rem', color: '#7f1d1d' }}>
                      {activeTab === 'receptive'
                        ? (scoring.receptiveCeilingIndex !== -1 ? `متحقق عند البند #${scoring.receptiveCeilingIndex + 6}` : 'غير متحقق بعد')
                        : (scoring.expressiveCeilingIndex !== -1 ? `متحقق عند البند #${scoring.expressiveCeilingIndex + 6}` : 'غير متحقق بعد')
                      }
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyCeilingAutofill(activeTab)}
                    className="btn btn-xs"
                    style={{ background: '#dc2626', color: '#fff', border: 'none', fontWeight: 800, padding: '5px 12px' }}
                  >
                    تصفير اللواحق (0) ⚡
                  </button>
                </div>
              </div>

              {/* Items Evaluation List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                        background: isAssumedCorrect ? '#f0fdf4' : isAssumedFailed ? '#fef2f2' : isRecommendedStart ? '#f0f9ff' : '#fff',
                        border: isRecommendedStart ? '2px solid #0284c7' : '1px solid var(--border-color)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1, minWidth: 260 }}>
                          <span
                            style={{
                              background: activeTab === 'receptive' ? '#0369a1' : '#0f766e',
                              color: '#fff',
                              fontWeight: 900,
                              borderRadius: 8,
                              padding: '4px 10px',
                              fontSize: '0.84rem',
                              flexShrink: 0,
                            }}
                          >
                            #{item.id}
                          </span>
                          <div>
                            <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.5, display: 'block' }}>
                              {item.text}
                            </strong>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
                              <span className="bdg" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 700 }}>
                                الفئة: {item.ageGroup}
                              </span>
                              <span className="bdg" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 700 }}>
                                المجال: {item.domain}
                              </span>
                              {isRecommendedStart && <span className="bdg b-bl" style={{ fontSize: '0.72rem', fontWeight: 800 }}>⭐ البداية المقترحة لسنّه</span>}
                              {isAssumedCorrect && <span className="bdg b-gr" style={{ fontSize: '0.72rem', fontWeight: 800 }}>⚡ معتمد تلقائياً (قاعدة)</span>}
                              {isAssumedFailed && <span className="bdg b-re" style={{ fontSize: '0.72rem', fontWeight: 800 }}>⚡ ملغى تلقائياً (سقف)</span>}
                            </div>
                          </div>
                        </div>

                        {/* Rating Buttons */}
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => handleItemScoreChange(activeTab, item.id, 1)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 8,
                              border: '1.5px solid ' + (currentScore === 1 ? '#16a34a' : 'var(--border-color)'),
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              background: currentScore === 1 ? '#16a34a' : '#fff',
                              color: currentScore === 1 ? '#fff' : 'var(--text-main)',
                              boxShadow: currentScore === 1 ? '0 2px 4px rgba(22,163,74,0.2)' : 'none',
                              transition: 'all 0.1s',
                            }}
                          >
                            متقن (1)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemScoreChange(activeTab, item.id, 0)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 8,
                              border: '1.5px solid ' + (currentScore === 0 ? '#ef4444' : 'var(--border-color)'),
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              background: currentScore === 0 ? '#ef4444' : '#fff',
                              color: currentScore === 0 ? '#fff' : 'var(--text-main)',
                              boxShadow: currentScore === 0 ? '0 2px 4px rgba(239,68,68,0.2)' : 'none',
                              transition: 'all 0.1s',
                            }}
                          >
                            مخفق (0)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemScoreChange(activeTab, item.id, undefined)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              border: '1px solid var(--border-color)',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              background: currentScore === undefined ? '#e2e8f0' : '#fff',
                              color: '#64748b',
                            }}
                            title="مسح الإجابة"
                          >
                            —
                          </button>
                        </div>
                      </div>

                      {/* Item specific notes & behavioral notes */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>📝 ملاحظة سلوكية:</span>
                        <input
                          type="text"
                          className="inp"
                          style={{ flex: 1, fontSize: '0.76rem', padding: '3px 8px' }}
                          value={form.itemNotes?.[`${activeTab === 'receptive' ? 'r' : 'e'}_${item.id}`] || ''}
                          onChange={e => handleItemNoteChange(`${activeTab === 'receptive' ? 'r' : 'e'}_${item.id}`, e.target.value)}
                          placeholder="ملاحظات حول طريقة استجابة الطفل أو استخدام المساعدات الحسية..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Diagnostic Report, Scoring Summary & IEP Integration */}
          {activeTab === 'report' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="print-report-sheet" style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, background: '#fff' }}>
                {/* Official Report Header */}
                <div style={{ borderBottom: '2px solid #0369a1', paddingBottom: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0369a1' }}>
                      تقرير التقييم اللغوي السيكومتري (PLS-5)
                    </h1>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                      مقياس لغة الأطفال - الإصدار الخامس المعرب (Preschool Language Scale - 5th Edition)
                    </span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>مركز الرعاية المتخصصة للتأهيل والدمج</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>تاريخ التقييم: {form.date}</div>
                  </div>
                </div>

                {/* Patient/Student Demographics Table */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, padding: 12, background: 'var(--g0)', borderRadius: 8, marginBottom: 16, fontSize: '0.8rem' }}>
                  <div>🔹 <strong>اسم الطفل:</strong> {form.studentName || '—'}</div>
                  <div>🔹 <strong>تاريخ الميلاد:</strong> {form.dob || '—'}</div>
                  <div>🔹 <strong>العمر الزمني:</strong> {form.age || `${Math.floor(studentAgeMonths / 12)} سنوات`} ({studentAgeMonths} شهراً)</div>
                  <div>🔹 <strong>التشخيص:</strong> {form.diagnosis || '—'}</div>
                  <div>🔹 <strong>أخصائي التخاطب:</strong> {form.specialistName || form.examinerName || 'المشرف المعتمد'}</div>
                  <div>🔹 <strong>المستجيب/المرافق:</strong> {form.raterName || 'ولي الأمر'} ({form.raterRelation || 'الأم'})</div>
                </div>

                {/* Psychometric Statistical Table */}
                <h3 style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0369a1', margin: '0 0 8px 0', borderRight: '4px solid #0369a1', paddingRight: 8 }}>
                  📊 النتائج الإحصائية ومستويات النمو اللغوي:
                </h3>
                <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: 8, textAlign: 'right' }}>المقياس الفرعي اللغوي</th>
                        <th style={{ padding: 8 }}>الدرجة الخام</th>
                        <th style={{ padding: 8 }}>الدرجة المعيارية (SS)</th>
                        <th style={{ padding: 8 }}>الرتبة المئينية (PR)</th>
                        <th style={{ padding: 8 }}>العمر اللغوي المكافئ (LAE)</th>
                        <th style={{ padding: 8 }}>فجوة التأخر اللغوية</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: 8, fontWeight: 700, textAlign: 'right', color: '#0369a1' }}>اللغة الاستقبالية (Auditory Comprehension)</td>
                        <td style={{ padding: 8 }}>{scoring.receptiveRawScore} / 40</td>
                        <td style={{ padding: 8, fontWeight: 700 }}>{scoring.receptiveSS}</td>
                        <td style={{ padding: 8 }}>%{scoring.receptivePR}</td>
                        <td style={{ padding: 8, color: '#0284c7', fontWeight: 700 }}>{Math.floor(scoring.receptiveLAEMonths / 12)}س و {scoring.receptiveLAEMonths % 12}ش</td>
                        <td style={{ padding: 8, color: '#dc2626', fontWeight: 700 }}>{Math.floor(scoring.receptiveDelayGapMonths / 12)}س و {scoring.receptiveDelayGapMonths % 12}ش</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: 8, fontWeight: 700, textAlign: 'right', color: '#0f766e' }}>اللغة التعبيرية (Expressive Communication)</td>
                        <td style={{ padding: 8 }}>{scoring.expressiveRawScore} / 40</td>
                        <td style={{ padding: 8, fontWeight: 700 }}>{scoring.expressiveSS}</td>
                        <td style={{ padding: 8 }}>%{scoring.expressivePR}</td>
                        <td style={{ padding: 8, color: '#0f766e', fontWeight: 700 }}>{Math.floor(scoring.expressiveLAEMonths / 12)}س و {scoring.expressiveLAEMonths % 12}ش</td>
                        <td style={{ padding: 8, color: '#dc2626', fontWeight: 700 }}>{Math.floor(scoring.expressiveDelayGapMonths / 12)}س و {scoring.expressiveDelayGapMonths % 12}ش</td>
                      </tr>
                      <tr style={{ background: '#f8fafc', fontWeight: 800, borderBottom: '2px solid #cbd5e1' }}>
                        <td style={{ padding: 10, textAlign: 'right', color: '#0f172a' }}>المؤشر الكلي للغة (Total Language Score)</td>
                        <td style={{ padding: 10 }}>{scoring.totalRawScore} / 80</td>
                        <td style={{ padding: 10, color: scoring.severityColor, fontSize: '0.92rem' }}>{scoring.totalSS}</td>
                        <td style={{ padding: 10 }}>%{scoring.totalPR}</td>
                        <td style={{ padding: 10, color: '#0284c7' }}>{Math.floor(scoring.totalLAEMonths / 12)}س و {scoring.totalLAEMonths % 12}ش</td>
                        <td style={{ padding: 10, color: '#dc2626' }}>{Math.floor(scoring.totalDelayGapMonths / 12)}س و {scoring.totalDelayGapMonths % 12}ش</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Narrative Diagnostic Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-main)' }}>
                      ✍️ الخلاصة الإكلينيكية والتشخيصية (تعديل مباشر):
                    </label>
                    <textarea
                      className="inp"
                      style={{ width: '100%', height: '110px', padding: 8, fontSize: '0.78rem', lineHeight: 1.5 }}
                      value={form.clinicalSummary || `تم تطبيق مقياس لغة الأطفال الإصدار الخامس (PLS-5) لتقييم النمو اللغوي للطفل ${form.studentName || ''}. \nالنتائج سيكومترياً: حقق الطفل درجة معيارية كلية تبلغ [ ${scoring.totalSS} ] وتضعه في نطاق [ ${scoring.clinicalClassification.split('(')[0]} ]. \nالعمر اللغوي الإجمالي للطفل يعادل [ ${Math.floor(scoring.totalLAEMonths / 12)}س و ${scoring.totalLAEMonths % 12}ش ] مما يظهر فجوة تأخر واضحة قدرها [ ${Math.floor(scoring.totalDelayGapMonths / 12)}س و ${scoring.totalDelayGapMonths % 12}ش ] مقارنة بأقرانه.`}
                      onChange={e => setForm(prev => ({ ...prev, clinicalSummary: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-main)' }}>
                      💡 التوصيات العلاجية والتربوية:
                    </label>
                    <textarea
                      className="inp"
                      style={{ width: '100%', height: '110px', padding: 8, fontSize: '0.78rem', lineHeight: 1.5 }}
                      value={form.recommendations || `1. ترحيل نقاط الضعف اللغوية المكتشفة بالتقييم إلى برنامج الطالب التربوي الفردي (IEP). \n2. البدء بتدريب المهارات الاستقبالية المفقودة ثم دمج التعبير المقابل لها. \n3. تفعيل جلسات التخاطب والنمو اللغوي بمعدل 3 جلسات أسبوعية.`}
                      onChange={e => setForm(prev => ({ ...prev, recommendations: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Automated IEP Goal Generator */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }} className="no-print">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#0f766e' }}>
                        🎯 الربط السلوكي الذكي بالخطة التربوية الفردية (IEP):
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block', marginTop: 2 }}>
                        تم الكشف عن ({scoring.receptiveWeaknesses.length + scoring.expressiveWeaknesses.length}) بنداً غير مجتاز. حدد الأهداف لترحيلها فورياً لخطة الطالب:
                      </span>
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
                    <div style={{ padding: 10, textAlign: 'center', color: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}>
                      🎉 رائع! لم يتم رصد أي نقاط ضعف أو إخفاقات في النطاق العمري الحالي للطفل.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {/* Receptive weaknesses */}
                      {scoring.receptiveWeaknesses.map(w => (
                        <label
                          key={`r_${w.id}`}
                          style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#fff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.76rem', cursor: 'pointer' }}
                        >
                          <input
                            type="checkbox"
                            checked={!!selectedGoals[`r_${w.id}`]}
                            onChange={e => setSelectedGoals(prev => ({ ...prev, [`r_${w.id}`]: e.target.checked }))}
                            style={{ marginTop: 2 }}
                          />
                          <div>
                            <span style={{ color: '#0369a1', fontWeight: 800 }}>[استقبالي - بند #{w.id}]: </span>
                            <strong style={{ color: '#1e293b' }}>{w.text}</strong>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#0f766e', marginTop: 2 }}>🎯 الهدف المقترح: {w.goal}</span>
                          </div>
                        </label>
                      ))}

                      {/* Expressive weaknesses */}
                      {scoring.expressiveWeaknesses.map(w => (
                        <label
                          key={`e_${w.id}`}
                          style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#fff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.76rem', cursor: 'pointer' }}
                        >
                          <input
                            type="checkbox"
                            checked={!!selectedGoals[`e_${w.id}`]}
                            onChange={e => setSelectedGoals(prev => ({ ...prev, [`e_${w.id}`]: e.target.checked }))}
                            style={{ marginTop: 2 }}
                          />
                          <div>
                            <span style={{ color: '#0f766e', fontWeight: 800 }}>[تعبيري - بند #{w.id}]: </span>
                            <strong style={{ color: '#1e293b' }}>{w.text}</strong>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#0f766e', marginTop: 2 }}>🎯 الهدف المقترح: {w.goal}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Print Signatures */}
                <div className="only-print" style={{ display: 'none', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 30, borderTop: '1px dashed #cbd5e1', paddingTop: 16, fontSize: '0.8rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span>توقيع أخصائي التخاطب واللغة:</span>
                    <div style={{ height: 40 }} />
                    <span>_______________________</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span>اعتماد المشرف الفني والإكلينيكي:</span>
                    <div style={{ height: 40 }} />
                    <span>_______________________</span>
                  </div>
                </div>

                {/* Diagnostic Utility Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }} className="no-print">
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
            </div>
          )}
        </div>

        {/* Modal Main Footer Actions */}
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
          {/* Quick simulation / autofill tools */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 700 }}>
              أدوات سريعة:
            </span>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('normal')}
              style={{ fontSize: '0.7rem', padding: '3px 7px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontWeight: 700 }}
              title="تعبئة درجات تمثل نمواً لغوياً طبيعياً متزناً"
            >
              ⚡ تجربة (طبيعي)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('mild')}
              style={{ fontSize: '0.7rem', padding: '3px 7px', background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', fontWeight: 700 }}
              title="تعبئة درجات تمثل تأخراً لغوياً بسيطاً"
            >
              ⚡ تجربة (تأخر بسيط)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('moderate')}
              style={{ fontSize: '0.7rem', padding: '3px 7px', background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74', fontWeight: 700 }}
              title="تعبئة درجات تمثل تأخراً لغوياً متوسطاً"
            >
              ⚡ تجربة (تأخر متوسط)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => handleAutoFill('severe')}
              style={{ fontSize: '0.7rem', padding: '3px 7px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', fontWeight: 700 }}
              title="تعبئة درجات تمثل تأخراً لغوياً شديداً"
            >
              ⚡ تجربة (تأخر شديد)
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={applyAutoClinicalSummary}
              style={{ fontSize: '0.7rem', padding: '3px 8px', background: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', fontWeight: 800 }}
              title="توليد الخلاصة والتشخيص والتوصيات آلياً بناءً على النتائج"
            >
              ✨ توليد التقرير والتوصيات آلياً
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleSafeClose}
              style={{ fontWeight: 700 }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn-sm btn-p"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
                color: '#fff',
                fontWeight: 800,
                padding: '6px 18px',
                border: 'none',
              }}
            >
              💾 حفظ وحساب نتيجة مقياس لغة الأطفال (PLS-5)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
