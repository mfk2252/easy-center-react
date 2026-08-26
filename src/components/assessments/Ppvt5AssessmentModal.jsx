import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import {
  PPVT5_SETS,
  PPVT5_COPYRIGHT_INFO,
  getPPVT5StartSetByAge,
  calculatePPVT5Psychometrics
} from '../../data/ppvt5Data';

const EMPTY_PPVT_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  specialistName: '',
  informantName: '',
  date: todayStr(),
  notes: '',
  results: {}, // Map of item_id -> boolean (true for correct, false for incorrect)
  clinicalSummary: '',
  recommendations: '',
  customStartSet: null,
};

export default function Ppvt5AssessmentModal({
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
        ...EMPTY_PPVT_FORM,
        ...initialData,
        results: initialData.results || {},
      };
    }
    return {
      ...EMPTY_PPVT_FORM,
      specialistName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeTab, setActiveTab] = useState('administration'); // 'administration' | 'interactive' | 'matrix' | 'results'
  const [activeSetId, setActiveSetId] = useState(1);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [showDemographics, setShowDemographics] = useState(true);
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [itemFilter, setItemFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unanswered'

  // Auto calculate student's chronological age in months
  const studentAgeMonths = useMemo(() => {
    if (!form.dob) return 72; // default 6 years
    const ageObj = calcAge(form.dob);
    return Math.max(30, ageObj.years * 12 + ageObj.months);
  }, [form.dob]);

  // Dynamically set active set based on age once student is selected
  useEffect(() => {
    if (form.stuId && !form.customStartSet && !initialData) {
      const recommendedSet = getPPVT5StartSetByAge(studentAgeMonths);
      setActiveSetId(recommendedSet);
      setActiveItemIndex(0);
    }
  }, [form.stuId, studentAgeMonths, form.customStartSet, initialData]);

  // Current active set items
  const currentSet = useMemo(() => {
    return PPVT5_SETS.find(s => s.setId === activeSetId) || PPVT5_SETS[0];
  }, [activeSetId]);

  const currentItem = useMemo(() => {
    return currentSet.items[activeItemIndex] || currentSet.items[0];
  }, [currentSet, activeItemIndex]);

  // Total answered count
  const totalAnswered = useMemo(() => {
    return Object.keys(form.results).length;
  }, [form.results]);

  // Calculate live psychometrics based on current results
  const scoring = useMemo(() => {
    const answeredItems = Object.keys(form.results).map(Number);
    if (answeredItems.length === 0) {
      return {
        rawScore: 0,
        standardScore: 100,
        percentile: 50,
        ageEquivalentLabel: '—',
        level: 'لم يتم البدء بالتقييم',
        severityColor: '#9ca3af',
        severityKey: 'none',
        clinicalImpression: '',
        errorsCount: 0,
        ceilingItem: 0,
        basalSetId: 1,
        ceilingSetId: 1,
        testedSetIds: [],
        errorCategories: { 'أسماء': 0, 'أفعال': 0, 'صفات': 0, 'مفاهيم': 0 },
        correctCategories: { 'أسماء': 0, 'أفعال': 0, 'صفات': 0, 'مفاهيم': 0 },
        ageLabel: 'غير محدد',
      };
    }

    const testedSets = PPVT5_SETS.filter(set => {
      return set.items.some(item => form.results[item.id] !== undefined);
    });

    const testedSetIds = testedSets.map(s => s.setId);
    const minTestedSetId = Math.min(...testedSetIds, 1);
    const maxTestedSetId = Math.max(...testedSetIds, 1);

    let basalSetId = minTestedSetId;
    for (let sId = minTestedSetId; sId <= maxTestedSetId; sId++) {
      const set = PPVT5_SETS.find(s => s.setId === sId);
      const errorsInSet = set.items.filter(item => form.results[item.id] === false).length;
      if (errorsInSet <= 1) {
        basalSetId = sId;
        break;
      }
    }

    let ceilingSetId = maxTestedSetId;
    for (let sId = maxTestedSetId; sId >= minTestedSetId; sId--) {
      const set = PPVT5_SETS.find(s => s.setId === sId);
      const errorsInSet = set.items.filter(item => form.results[item.id] === false).length;
      if (errorsInSet >= 6) {
        ceilingSetId = sId;
        break;
      }
    }

    const ceilingItemNumber = ceilingSetId * 12;

    let totalErrorsCount = 0;
    for (let sId = basalSetId; sId <= ceilingSetId; sId++) {
      const set = PPVT5_SETS.find(s => s.setId === sId);
      if (set) {
        set.items.forEach(item => {
          if (form.results[item.id] === false) {
            totalErrorsCount++;
          }
        });
      }
    }

    const rawScore = Math.max(0, ceilingItemNumber - totalErrorsCount);
    const psych = calculatePPVT5Psychometrics(rawScore, studentAgeMonths);

    const errorCategories = { 'أسماء': 0, 'أفعال': 0, 'صفات': 0, 'مفاهيم': 0 };
    const correctCategories = { 'أسماء': 0, 'أفعال': 0, 'صفات': 0, 'مفاهيم': 0 };
    
    PPVT5_SETS.forEach(set => {
      set.items.forEach(item => {
        if (form.results[item.id] === false) {
          errorCategories[item.type] = (errorCategories[item.type] || 0) + 1;
        } else if (form.results[item.id] === true) {
          correctCategories[item.type] = (correctCategories[item.type] || 0) + 1;
        }
      });
    });

    return {
      rawScore,
      ...psych,
      errorsCount: totalErrorsCount,
      ceilingItem: ceilingItemNumber,
      basalSetId,
      ceilingSetId,
      testedSetIds,
      errorCategories,
      correctCategories,
    };
  }, [form, studentAgeMonths]);

  if (!isOpen) return null;

  function handleResultChange(itemId, isCorrect) {
    setForm(prev => ({
      ...prev,
      results: {
        ...prev.results,
        [itemId]: isCorrect
      }
    }));
  }

  function handleNextItem() {
    if (activeItemIndex < currentSet.items.length - 1) {
      setActiveItemIndex(prev => prev + 1);
    } else if (activeSetId < PPVT5_SETS.length) {
      setActiveSetId(prev => prev + 1);
      setActiveItemIndex(0);
      toast(`📂 الانتقال إلى: ${PPVT5_SETS.find(s => s.setId === activeSetId + 1)?.name}`, 'ok');
    } else {
      toast('🏁 تم التوصل لبداية/نهاية بنود مقياس بيبودي', 'info');
    }
  }

  function handlePrevItem() {
    if (activeItemIndex > 0) {
      setActiveItemIndex(prev => prev - 1);
    } else if (activeSetId > 1) {
      setActiveSetId(prev => prev - 1);
      setActiveItemIndex(11);
    }
  }

  // Auto Generate Clinical Report & IEP goals
  function generateNarrative() {
    if (Object.keys(form.results).length === 0) {
      toast('⚠️ يرجى تقييم بعض البنود لتوليد التقرير السيكومتري', 'er');
      return;
    }

    const failedNouns = PPVT5_SETS.flatMap(s => s.items)
      .filter(it => form.results[it.id] === false && it.type === 'أسماء')
      .map(it => it.word);
    
    const failedVerbs = PPVT5_SETS.flatMap(s => s.items)
      .filter(it => form.results[it.id] === false && it.type === 'أفعال')
      .map(it => it.word);

    const failedConcepts = PPVT5_SETS.flatMap(s => s.items)
      .filter(it => form.results[it.id] === false && (it.type === 'صفات' || it.type === 'مفاهيم'))
      .map(it => it.word);

    const nounRecommendations = failedNouns.length > 0 
      ? `• تدريب الطالب على أسماء ومسميات الأشياء التي عجز عن تحديدها مثل: [ ${failedNouns.slice(0, 5).join('، ')} ].`
      : '';
    const verbRecommendations = failedVerbs.length > 0
      ? `• تدريب الطالب على تسمية وفهم الأفعال الحركية والوظيفية التي أخطأ فيها مثل: [ ${failedVerbs.slice(0, 5).join('، ')} ].`
      : '';
    const conceptRecommendations = failedConcepts.length > 0
      ? `• تطوير إدراك المفاهيم المجردة والصفات والمقارنات اللفظية في اللغة العربية مثل: [ ${failedConcepts.slice(0, 5).join('، ')} ].`
      : '';

    const summaryReport = `📝 التقرير السيكومتري والأكاديمي الرسمي لمقياس بيبودي للمفردات اللغوية المصورة (PPVT-5)
----------------------------------------------------------------------
• الطالب المفحوص: ${form.studentName || '—'}
• تاريخ التقييم: ${form.date}
• الأخصائي الفاحص: ${form.specialistName || '—'}
• ولي الأمر / مجيب التقييم: ${form.informantName || 'أحد الوالدين'}
• السن الزمني الفعلي: ${scoring.ageLabel}

📊 أولاً: النتائج الرقمية والدلالات الإحصائية:
---------------------------------------------
1. المجموعة القاعدة (Basal Set): المجموعة ${scoring.basalSetId}
2. البند والمجموعة السقف (Ceiling): البند ${scoring.ceilingItem} (المجموعة ${scoring.ceilingSetId})
3. إجمالي الأخطاء المرصودة (Errors): ${scoring.errorsCount} خطأ
4. الدرجة الخام (Raw Score): ${scoring.rawScore} من أصل 96
5. الدرجة المعيارية (Standard Score): [ ${scoring.standardScore} ] (المتوسط = 100، الانحراف المعياري = 15)
6. الرتبة المئينية (Percentile Rank): [ ${scoring.percentile}% ]
7. العمر اللغوي المكافئ (Age Equivalent): [ ${scoring.ageEquivalentLabel} ]
8. مستوى الأداء اللفظي الاستقبالي: [ ${scoring.level} ]

🔍 ثانياً: التقييم الإكلينيكي والملاحظات:
---------------------------------------------
${scoring.clinicalImpression}

🛠️ ثالثاً: التوصيات العلاجية والخطط التأهيلية المقترحة:
---------------------------------------------
1. إلحاق الطالب ببرنامج فردي لتعزيز الحصيلة الدلالية الاستقبالية (Receptive Vocabulary Intervention) بمعدل جلستين أسبوعياً.
${nounRecommendations}
${verbRecommendations}
${conceptRecommendations}
2. دمج الألعاب البصرية وأنشطة الفرز والتصنيف (المجموعات الضمنية: فواكه، حيوانات، أدوات منزلية، أفعال يومية) لترسيخ المدلولات.
3. التوجيه الأسري بضرورة تفعيل "الحديث الذاتي ووصف الأحداث اليومية" للطفل لزيادة المثيرات اللفظية بالمنزل والمدرسة.`;

    const iepGoalsText = `🎯 الأهداف السلوكية التربوية المقترحة لبرنامج (IEP):
---------------------------------------------------
1. أن يشير الطالب إلى المثير البصري الصحيح الدال على الاسم (من المجموعات الضمنية) عند سماع الكلمة الممثلة من بين 4 خيارات بنسبة نجاح لا تقل عن 85%.
2. أن يحدد الطالب الصورة المعبرة عن الفعل الحركي الوظيفي المطلوب (مثل: يركض، يغوص، يسبح) بدقة 80% خلال 3 جلسات متتالية.
3. أن يطابق الطالب المفردات المعبرة عن الصفات والمفاهيم اللغوية (مثل: بارد، دافئ، توازن، وعي) بالرسم أو الرمز الدال عليها بنسبة نجاح 80% في التقييم الختامي.`;

    setForm(prev => ({
      ...prev,
      clinicalSummary: summaryReport,
      recommendations: iepGoalsText
    }));

    toast('✨ تم توليد التقرير السيكومتري والتوصيات التربوية الفردية بدقة أكاديمية', 'ok');
  }

  // Export Goals to IEP Storage (progPrograms)
  function exportGoalsToIEP() {
    if (!form.stuId) {
      toast('⚠️ يرجى اختيار طالب أولاً لتصدير الأهداف', 'er');
      return;
    }

    const failedItems = PPVT5_SETS.flatMap(s => s.items).filter(it => form.results[it.id] === false);

    const goalsToExport = [];
    
    const failedNouns = failedItems.filter(it => it.type === 'أسماء').map(it => it.word);
    if (failedNouns.length > 0) {
      goalsToExport.push({
        id: uid(),
        domain: 'التخاطب واللغة والاستقبال',
        text: `أن يحدد الطالب الكلمة والاسم المطلوب بصرياً من بين 4 خيارات (مثل: ${failedNouns.slice(0, 4).join('، ')}) بنسبة نجاح 85%.`,
        status: 'unmastered',
        targetDate: '',
        evaluationMethod: 'الملاحظة والبطاقات المصورة',
      });
    }

    const failedVerbs = failedItems.filter(it => it.type === 'أفعال').map(it => it.word);
    if (failedVerbs.length > 0) {
      goalsToExport.push({
        id: uid(),
        domain: 'التخاطب واللغة والاستقبال',
        text: `أن يشير الطالب إلى الصورة الدالة على الفعل الحركي المطلوب (مثل: ${failedVerbs.slice(0, 4).join('، ')}) بنسبة نجاح 80%.`,
        status: 'unmastered',
        targetDate: '',
        evaluationMethod: 'الاختيار من متعدد للمثيرات البصرية',
      });
    }

    const failedConcepts = failedItems.filter(it => it.type === 'صفات' || it.type === 'مفاهيم').map(it => it.word);
    if (failedConcepts.length > 0) {
      goalsToExport.push({
        id: uid(),
        domain: 'التخاطب واللغة والاستقبال',
        text: `أن يطابق الطالب المفاهيم والصفات اللغوية التجريدية (مثل: ${failedConcepts.slice(0, 4).join('، ')}) بالرموز البصرية المعبرة عنها بنسبة 80%.`,
        status: 'unmastered',
        targetDate: '',
        evaluationMethod: 'بطاقات التقييم السيكومتري',
      });
    }

    if (goalsToExport.length === 0) {
      goalsToExport.push({
        id: uid(),
        domain: 'التخاطب واللغة والاستقبال',
        text: 'أن يحافظ الطالب على حصيلته اللفظية الاستقبالية المتقدمة ويرتقي بالمفردات اللغوية في البيئة الصفية والمنزلية بنسبة 90%.',
        status: 'in_progress',
        targetDate: '',
        evaluationMethod: 'مقياس بيبودي PPVT-5',
      });
    }

    const savedProgPrograms = JSON.parse(localStorage.getItem('progPrograms') || '[]');
    const activeStudentProgIndex = savedProgPrograms.findIndex(p => p.stuId === form.stuId && p.status !== 'archived');

    if (activeStudentProgIndex >= 0) {
      const existingProg = savedProgPrograms[activeStudentProgIndex];
      existingProg.goals = [...(existingProg.goals || []), ...goalsToExport];
      existingProg.updatedAt = new Date().toISOString();
      savedProgPrograms[activeStudentProgIndex] = existingProg;
      localStorage.setItem('progPrograms', JSON.stringify(savedProgPrograms));
    } else {
      const newProgram = {
        id: uid(),
        stuId: form.stuId,
        studentName: form.studentName,
        dob: form.dob,
        age: form.age,
        diagnosis: form.diagnosis,
        title: 'برنامج تنمية الحصيلة اللفظية والمفردات الاستقبالية (PPVT-5)',
        duration: 'فصل دراسي (3 أشهر)',
        startDate: form.date || todayStr(),
        reviewDate: '',
        specialistName: form.specialistName || '',
        status: 'active',
        goals: goalsToExport,
        notes: 'تم تصدير أهداف هذا البرنامج أوتوماتيكياً من مقياس بيبودي للمفردات المصورة PPVT-5.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      savedProgPrograms.push(newProgram);
      localStorage.setItem('progPrograms', JSON.stringify(savedProgPrograms));
    }

    toast(`📥 تم تصدير (${goalsToExport.length}) أهداف سلوكية مباشرة إلى برنامج الخطة التربوية الفردية (IEP) للطالب`, 'ok');
  }

  // Auto populate presets
  function autoFillPPVT(preset = 'normal') {
    const results = {};
    if (preset === 'normal') {
      PPVT5_SETS.forEach(set => {
        set.items.forEach(it => {
          if (set.setId <= 3) {
            results[it.id] = Math.random() > 0.08;
          } else if (set.setId === 4) {
            results[it.id] = Math.random() > 0.35;
          } else if (set.setId === 5) {
            results[it.id] = Math.random() > 0.65;
          } else {
            results[it.id] = false;
          }
        });
      });
    } else if (preset === 'delay') {
      PPVT5_SETS.forEach(set => {
        set.items.forEach(it => {
          if (set.setId === 1) {
            results[it.id] = Math.random() > 0.15;
          } else if (set.setId === 2) {
            results[it.id] = Math.random() > 0.5;
          } else {
            results[it.id] = false;
          }
        });
      });
    } else if (preset === 'severe') {
      PPVT5_SETS.forEach(set => {
        set.items.forEach(it => {
          if (set.setId === 1) {
            results[it.id] = Math.random() > 0.55;
          } else {
            results[it.id] = false;
          }
        });
      });
    } else {
      // Clear
    }

    setForm(prev => ({ ...prev, results }));
    toast(`⚡ تم تعبئة درجات بيبودي بنمط: ${preset === 'normal' ? 'مستوى طبيعي' : preset === 'delay' ? 'تأخر بسيط' : preset === 'severe' ? 'تأخر شديد' : 'تفريغ 🧹'}`, 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً', 'er');
      return;
    }

    if (totalAnswered === 0) {
      toast('⚠️ يجب تقييم مفردا واحدة على الأقل لحفظ المقياس', 'er');
      return;
    }

    const payload = {
      ...form,
      measureId: 'ppvt5',
      measureName: 'مقياس بيبودي للمفردات اللغوية المصورة - الإصدار الخامس (PPVT-5)',
      scaleType: 'ppvt5',
      author: PPVT5_COPYRIGHT_INFO.authorAr,
      score: scoring.rawScore,
      maxScore: 96,
      percentage: `${Math.round((scoring.rawScore / 96) * 100)}%`,
      level: scoring.level,
      severityColor: scoring.severityColor,
      results: form.results,
      standardScore: scoring.standardScore,
      percentile: scoring.percentile,
      ageEquivalent: scoring.ageEquivalentLabel,
      psychometrics: scoring,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم بيبودي PPVT-5 بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', { ...payload, id: uid() });
      toast('✅ تم حفظ تقييم بيبودي PPVT-5 بنجاح', 'ok');
    }

    onSaved();
    onClose();
  }

  return (
    <div className="mbg" style={{ zIndex: 1100 }}>
      <div className="mb mb-xl" style={{ background: 'var(--card-bg, #fff)', color: 'var(--text-main, #111827)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: 16, overflow: 'hidden' }}>
        
        {/* Modal Header */}
        <div className="fhd" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', color: '#fff' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                📚 مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5)
              </h2>
              <button
                type="button"
                onClick={() => setShowCopyrightModal(true)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '0.74rem', padding: '3px 9px', borderRadius: 20, cursor: 'pointer', fontWeight: 700 }}
              >
                📜 حقوق الملكية الفكرية
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: '2px 0 0 0', fontWeight: 400 }}>
              أداة سيكومترية مقننة لتقييم الحصيلة اللفظية الاستقبالية للأطفال والناطقين بالعربية (Peabody Picture Vocabulary Test - 5th Ed)
            </p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>إغلاق ✖</button>
        </div>

        {/* Live Psychometrics Stat Ribbon Bar */}
        <div style={{ background: 'var(--g0, #f9fafb)', borderBottom: '1px solid var(--border-color, #e5e7eb)', padding: '10px 16px', display: 'flex', gap: 12, overflowX: 'auto', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--card-bg, #fff)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-sub)' }}>الخام:</span>
              <strong style={{ color: '#0f766e', fontSize: '0.95rem' }}>{scoring.rawScore} / 96</strong>
            </div>
            <div style={{ background: 'var(--card-bg, #fff)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-sub)' }}>المعيارية (SS):</span>
              <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>{scoring.standardScore}</strong>
            </div>
            <div style={{ background: 'var(--card-bg, #fff)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-sub)' }}>المئينية (PR):</span>
              <strong style={{ color: '#059669', fontSize: '0.95rem' }}>{scoring.percentile}%</strong>
            </div>
            <div style={{ background: 'var(--card-bg, #fff)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-sub)' }}>العمر المكافئ:</span>
              <strong style={{ color: '#d97706', fontSize: '0.88rem' }}>{scoring.ageEquivalentLabel}</strong>
            </div>
            <span className="bdg" style={{ background: `${scoring.severityColor}20`, color: scoring.severityColor, fontWeight: 800, fontSize: '0.74rem', border: `1px solid ${scoring.severityColor}40` }}>
              {scoring.level}
            </span>
          </div>

          {/* Quick Simulation Presets */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button type="button" className="btn btn-xs" onClick={() => autoFillPPVT('normal')} style={{ background: '#0f766e', color: '#fff', fontSize: '0.72rem', padding: '4px 8px' }}>سليم كلياً ✓</button>
            <button type="button" className="btn btn-xs" onClick={() => autoFillPPVT('delay')} style={{ background: '#d97706', color: '#fff', fontSize: '0.72rem', padding: '4px 8px' }}>تأخر بسيط 🟡</button>
            <button type="button" className="btn btn-xs" onClick={() => autoFillPPVT('severe')} style={{ background: '#dc2626', color: '#fff', fontSize: '0.72rem', padding: '4px 8px' }}>تأخر شديد 🔴</button>
            <button type="button" className="btn btn-xs" onClick={() => autoFillPPVT('clear')} style={{ background: 'var(--g1)', color: 'var(--text-main)', fontSize: '0.72rem', padding: '4px 8px', border: '1px solid var(--border-color)' }}>تفريغ 🧹</button>
          </div>
        </div>

        {/* Modal Subtabs Navbar */}
        <div style={{ display: 'flex', background: 'var(--card-bg, #fff)', borderBottom: '1px solid var(--border-color)', padding: '0 10px', overflowX: 'auto' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'administration' ? 'active' : ''}`}
            onClick={() => setActiveTab('administration')}
            style={{ padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.86rem', borderBottom: activeTab === 'administration' ? '3px solid #0f766e' : 'none', color: activeTab === 'administration' ? '#0f766e' : 'var(--text-sub)', whiteSpace: 'nowrap' }}
          >
            📋 بيانات التأسيس والتعليمات
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'interactive' ? 'active' : ''}`}
            onClick={() => {
              if (!validateStudentPick(form)) {
                toast('⚠️ يرجى اختيار الطالب أولاً لبدء الفحص', 'er');
                return;
              }
              setActiveTab('interactive');
            }}
            style={{ padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.86rem', borderBottom: activeTab === 'interactive' ? '3px solid #0f766e' : 'none', color: activeTab === 'interactive' ? '#0f766e' : 'var(--text-sub)', whiteSpace: 'nowrap' }}
          >
            🧩 محاكاة التطبيق التفاعلي ({totalAnswered}/96)
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => {
              if (!validateStudentPick(form)) {
                toast('⚠️ يرجى اختيار الطالب أولاً', 'er');
                return;
              }
              setActiveTab('matrix');
            }}
            style={{ padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.86rem', borderBottom: activeTab === 'matrix' ? '3px solid #0f766e' : 'none', color: activeTab === 'matrix' ? '#0f766e' : 'var(--text-sub)', whiteSpace: 'nowrap' }}
          >
            📊 تحليل المجموعات الضمنية والبنود
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => {
              if (!validateStudentPick(form)) {
                toast('⚠️ يرجى اختيار الطالب أولاً', 'er');
                return;
              }
              setActiveTab('results');
            }}
            style={{ padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.86rem', borderBottom: activeTab === 'results' ? '3px solid #0f766e' : 'none', color: activeTab === 'results' ? '#0f766e' : 'var(--text-sub)', whiteSpace: 'nowrap' }}
          >
            📄 التقرير الأكاديمي والأهداف (IEP)
          </button>
        </div>

        {/* Modal Body Container */}
        <div style={{ height: 'calc(80vh - 160px)', overflowY: 'auto', padding: 20 }}>
          
          {/* TAB 1: ADMINISTRATION */}
          {activeTab === 'administration' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Demographics Collapsible Card */}
              <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>👤</span> اختيار الطالب والبيانات الديموغرافية
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowDemographics(!showDemographics)}
                    style={{ background: 'var(--g0)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.78rem', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
                  >
                    {showDemographics ? '🔼 طي البيانات' : '🔽 عرض البيانات'}
                  </button>
                </div>

                {showDemographics && (
                  <>
                    <StudentPicker
                      form={form}
                      setForm={setForm}
                      students={students}
                      emps={emps}
                      showExtra={false}
                    />

                    {form.stuId && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16, background: 'var(--g0)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>تاريخ الميلاد:</span>
                          <input
                            type="date"
                            value={form.dob || ''}
                            disabled={!!initialData}
                            onChange={(e) => {
                              const dobVal = e.target.value;
                              setForm(prev => ({
                                ...prev,
                                dob: dobVal,
                                age: dobVal ? calcAge(dobVal) : '',
                              }));
                            }}
                            style={{ fontSize: '0.8rem', padding: '4px 6px', width: '100%', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--card-bg)', color: 'var(--text-main)', marginTop: 4 }}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>السن الزمني الفعلي:</span>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', marginTop: 6, color: 'var(--text-main)' }}>{scoring.ageLabel} ({studentAgeMonths} شهراً)</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>المجموعة الإرشادية للبدء:</span>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f766e', marginTop: 6 }}>المجموعة {getPPVT5StartSetByAge(studentAgeMonths)}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>التشخيص الطبي الأولي:</span>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: 6, color: 'var(--text-main)' }}>{form.diagnosis || 'غير محدد'}</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Psychometric Rules Guidelines Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                
                {/* Rules Checklist */}
                <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--card-bg)' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>⚖️ ضوابط وقواعد الفحص السيكومتري (PPVT-5)</h4>
                  <ul style={{ fontSize: '0.8rem', paddingRight: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-sub)' }}>
                    <li>
                      <strong style={{ color: 'var(--text-main)' }}>قاعدة البدء (Start Point):</strong> يبدأ الفاحص بالمجموعة المناسبة للسن الزمني للطفل من 1 إلى 8.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-main)' }}>قاعدة القاعدة (Basal Rule):</strong> تتحقق عندما يرتكب الطفل <strong style={{ color: '#059669' }}>0 أو 1 خطأ</strong> فقط في مجموعة كاملة (12 بند).
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-main)' }}>قاعدة السقف (Ceiling Rule):</strong> يتم التوقف الفوري عن التقييم إذا ارتكب الطفل <strong style={{ color: '#dc2626' }}>6 أخطاء أو أكثر</strong> في مجموعة واحدة مكونة من 12 بنداً.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-main)' }}>حساب الدرجة الخام:</strong> البند السقف (أعلى بند بالمجموعة الأخيرة المطبقة) مطروحاً منه إجمالي الأخطاء المرصودة.
                    </li>
                  </ul>
                </div>

                {/* Metadata & Informant */}
                <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--card-bg)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f766e' }}>🖋️ ترويسة الجلسة والبيانات الإدارية</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-sub)' }}>تاريخ الفحص:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        style={{ fontSize: '0.82rem', background: 'var(--g0)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-sub)' }}>الأخصائي الفاحص:</label>
                      <select
                        className="form-control"
                        value={form.specialistName}
                        onChange={e => setForm(f => ({ ...f, specialistName: e.target.value }))}
                        style={{ fontSize: '0.82rem', background: 'var(--g0)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                      >
                        <option value="">-- اختر الأخصائي --</option>
                        {emps.map(em => (
                          <option key={em.id} value={em.name}>{em.name} ({em.role || 'أخصائي'})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-sub)' }}>ولي الأمر / مجيب التقييم:</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="مثال: الأب / الأم / المعلم المساند"
                        value={form.informantName || ''}
                        onChange={e => setForm(f => ({ ...f, informantName: e.target.value }))}
                        style={{ fontSize: '0.82rem', background: 'var(--g0)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INTERACTIVE EXAM */}
          {activeTab === 'interactive' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Top Navigation Ribbon for Sets */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
                {PPVT5_SETS.map(set => {
                  const itemsInSet = set.items;
                  const totalAns = itemsInSet.filter(it => form.results[it.id] !== undefined).length;
                  const errorsInSet = itemsInSet.filter(it => form.results[it.id] === false).length;
                  
                  let setBadgeColor = 'var(--text-sub)';
                  let setBg = 'var(--g0)';
                  if (set.setId === activeSetId) {
                    setBg = '#0f766e20';
                    setBadgeColor = '#0f766e';
                  } else if (errorsInSet >= 6) {
                    setBg = '#dc262620';
                    setBadgeColor = '#dc2626'; // Ceiling
                  } else if (totalAns === 12 && errorsInSet <= 1) {
                    setBg = '#05966920';
                    setBadgeColor = '#059669'; // Basal Reached
                  }

                  return (
                    <button
                      key={set.setId}
                      type="button"
                      onClick={() => {
                        setActiveSetId(set.setId);
                        setActiveItemIndex(0);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: set.setId === activeSetId ? '2px solid #0f766e' : '1px solid var(--border-color)',
                        background: setBg,
                        color: setBadgeColor,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span>المجموعة {set.setId}</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.9 }}>({totalAns}/12) {errorsInSet > 0 ? `· ❌ ${errorsInSet}` : ''}</span>
                    </button>
                  );
                })}
              </div>

              {/* Set Info Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g0)', padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.9rem' }}>📁 {currentSet.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  البند الحالي: <strong style={{ color: 'var(--text-main)' }}>{currentItem.id}</strong> من أصل 96 بنداً
                </span>
              </div>

              {/* Interactive Presentation Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
                
                {/* Left: Huge Picture Card View */}
                <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', border: '1px solid var(--border-color)', borderRadius: 16, position: 'relative', background: 'var(--card-bg)' }}>
                  
                  {/* Top indicators */}
                  <div style={{ position: 'absolute', top: 12, right: 16, display: 'flex', gap: 8 }}>
                    <span className="bdg b-bl" style={{ fontSize: '0.74rem' }}>{currentItem.type}</span>
                    <span className="bdg" style={{ background: '#fef3c7', color: '#d97706', fontSize: '0.74rem' }}>صورة الهدف رقم: {currentItem.targetPic}</span>
                  </div>

                  {/* Stimulus Word Header */}
                  <div style={{ textAlign: 'center', marginBottom: 24, marginTop: 12 }}>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-sub)', display: 'block', marginBottom: 4 }}>الكلمة المثيرة (استجابة الطفل):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f766e' }}>{currentItem.word}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const synth = window.speechSynthesis;
                          if (synth) {
                            const utterance = new SpeechSynthesisUtterance(`أشِر إلى صورة ${currentItem.word}`);
                            utterance.lang = 'ar';
                            synth.speak(utterance);
                          }
                        }}
                        style={{ background: '#0f766e15', border: '1px solid #0f766e40', color: '#0f766e', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="نطق الكلمة إرشادياً"
                      >
                        🔊
                      </button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', margin: '6px 0 0 0' }}>تعليمات الفاحص: "أشِر إلى صورة [ {currentItem.word} ]"</p>
                  </div>

                  {/* Visual Choices (Four Pictures) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, width: '100%', maxWidth: '600px', marginBottom: 24 }}>
                    {currentItem.pics.map((pic, idx) => {
                      const picNum = idx + 1;
                      const isTarget = picNum === currentItem.targetPic;
                      return (
                        <div
                          key={idx}
                          style={{
                            border: isTarget ? '3px dashed #0f766e' : '1px solid var(--border-color)',
                            background: isTarget ? '#0f766e10' : 'var(--g0)',
                            borderRadius: 12,
                            padding: 16,
                            textAlign: 'center',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '110px'
                          }}
                        >
                          <span style={{ position: 'absolute', top: 6, left: 8, fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-sub)' }}>{picNum}</span>
                          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 6 }}>{pic}</span>
                          {isTarget && <span style={{ fontSize: '0.64rem', color: '#0f766e', fontWeight: 800 }}>الصورة الهدف</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Score Selector */}
                  <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: '400px', background: 'var(--g0)', padding: 12, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleResultChange(currentItem.id, true);
                        handleNextItem();
                      }}
                      className="btn"
                      style={{
                        flex: 1,
                        background: form.results[currentItem.id] === true ? '#059669' : 'var(--card-bg)',
                        color: form.results[currentItem.id] === true ? '#fff' : 'var(--text-main)',
                        borderColor: '#059669',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <span>🟢</span>
                      <span>سليم (1)</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        handleResultChange(currentItem.id, false);
                        handleNextItem();
                      }}
                      className="btn"
                      style={{
                        flex: 1,
                        background: form.results[currentItem.id] === false ? '#dc2626' : 'var(--card-bg)',
                        color: form.results[currentItem.id] === false ? '#fff' : 'var(--text-main)',
                        borderColor: '#dc2626',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <span>🔴</span>
                      <span>خطأ (0)</span>
                    </button>
                  </div>

                  {/* Prev/Next buttons */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 18, width: '100%', maxWidth: '400px', justifyContent: 'space-between' }}>
                    <button
                      type="button"
                      onClick={handlePrevItem}
                      className="btn btn-g btn-sm"
                      disabled={activeSetId === 1 && activeItemIndex === 0}
                      style={{ fontWeight: 800 }}
                    >
                      ⬅️ البند السابق
                    </button>
                    <button
                      type="button"
                      onClick={handleNextItem}
                      className="btn btn-g btn-sm"
                      disabled={activeSetId === PPVT5_SETS.length && activeItemIndex === 11}
                      style={{ fontWeight: 800 }}
                    >
                      البند اللاحق ➡️
                    </button>
                  </div>

                </div>

                {/* Right: Quick List of current set items */}
                <div className="card" style={{ padding: 14, overflowY: 'auto', maxHeight: '420px', border: '1px solid var(--border-color)', borderRadius: 16, background: 'var(--card-bg)' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: '#0f766e', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>📋 بنود المجموعة الحالية</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {currentSet.items.map((item, idx) => {
                      const res = form.results[item.id];
                      let itemBg = 'var(--g0)';
                      let borderC = 'transparent';
                      let statusText = '⏳ غير مطبق';
                      let statusCol = 'var(--text-sub)';

                      if (idx === activeItemIndex) {
                        itemBg = '#0f766e15';
                        borderC = '#0f766e';
                      }

                      if (res === true) {
                        statusText = '🟢 صحيح (1)';
                        statusCol = '#059669';
                      } else if (res === false) {
                        statusText = '🔴 خطأ (0)';
                        statusCol = '#dc2626';
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => setActiveItemIndex(idx)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: itemBg,
                            border: `1px solid ${borderC}`,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.78rem'
                          }}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            <span style={{ color: 'var(--text-sub)', marginLeft: 4 }}>{item.id}.</span>
                            <span>{item.word}</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: statusCol, fontWeight: 800 }}>{statusText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: MATRIX & CATEGORIES ANALYSIS */}
          {activeTab === 'matrix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Category Breakdown Progress */}
              <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--card-bg)' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.94rem', fontWeight: 800, color: '#0f766e' }}>📊 تحليل دقة الأداء بحسب الفئة اللغوية للمفردات</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  {Object.entries(scoring.errorCategories || {}).map(([cat, errors]) => {
                    const corrects = scoring.correctCategories[cat] || 0;
                    const total = corrects + errors;
                    const pct = total > 0 ? Math.round((corrects / total) * 100) : 100;
                    return (
                      <div key={cat} style={{ background: 'var(--g0)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                          <strong style={{ color: '#0f766e' }}>{cat}</strong>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>{corrects} صحيح | {errors} خطأ ({pct}%)</span>
                        </div>
                        <div style={{ background: 'var(--g1)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, background: '#0f766e', height: '100%', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Filtering Matrix */}
              <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)' }}>📋 مصفوفة جميع بنود المقياس الـ 96</h4>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className={`btn btn-xs ${itemFilter === 'all' ? 'btn-p' : ''}`} onClick={() => setItemFilter('all')} style={{ background: itemFilter === 'all' ? '#0f766e' : 'var(--g0)', color: itemFilter === 'all' ? '#fff' : 'var(--text-main)' }}>الكل (96)</button>
                    <button type="button" className={`btn btn-xs ${itemFilter === 'correct' ? 'btn-p' : ''}`} onClick={() => setItemFilter('correct')} style={{ background: itemFilter === 'correct' ? '#059669' : 'var(--g0)', color: itemFilter === 'correct' ? '#fff' : 'var(--text-main)' }}>سليم 🟢</button>
                    <button type="button" className={`btn btn-xs ${itemFilter === 'incorrect' ? 'btn-p' : ''}`} onClick={() => setItemFilter('incorrect')} style={{ background: itemFilter === 'incorrect' ? '#dc2626' : 'var(--g0)', color: itemFilter === 'incorrect' ? '#fff' : 'var(--text-main)' }}>أخطاء 🔴</button>
                    <button type="button" className={`btn btn-xs ${itemFilter === 'unanswered' ? 'btn-p' : ''}`} onClick={() => setItemFilter('unanswered')} style={{ background: itemFilter === 'unanswered' ? '#d97706' : 'var(--g0)', color: itemFilter === 'unanswered' ? '#fff' : 'var(--text-main)' }}>غير مطبق ⏳</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, maxHeight: '360px', overflowY: 'auto' }}>
                  {PPVT5_SETS.flatMap(s => s.items).filter(item => {
                    const status = form.results[item.id];
                    if (itemFilter === 'correct') return status === true;
                    if (itemFilter === 'incorrect') return status === false;
                    if (itemFilter === 'unanswered') return status === undefined;
                    return true;
                  }).map(item => {
                    const status = form.results[item.id];
                    let borderC = 'var(--border-color)';
                    let bg = 'var(--g0)';
                    let badge = '⏳';
                    if (status === true) {
                      borderC = '#059669';
                      bg = '#05966915';
                      badge = '🟢';
                    } else if (status === false) {
                      borderC = '#dc2626';
                      bg = '#dc262615';
                      badge = '🔴';
                    }

                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          border: `1px solid ${borderC}`,
                          background: bg,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-sub)' }}>#{item.id}</span>
                          <span>{badge}</span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>{item.word}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>{item.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CLINICAL REPORT & IEP GOALS */}
          {activeTab === 'results' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Quick Psychometric Matrix Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, textAlign: 'center', background: 'var(--card-bg)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>الدرجة المعيارية (SS)</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f766e', margin: '4px 0' }}>{scoring.standardScore}</div>
                  <span className="bdg b-gr" style={{ fontSize: '0.7rem' }}>المتوسط = 100</span>
                </div>
                <div className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, textAlign: 'center', background: 'var(--card-bg)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>الرتبة المئينية (PR)</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2563eb', margin: '4px 0' }}>{scoring.percentile}%</div>
                  <span className="bdg b-bl" style={{ fontSize: '0.7rem' }}>يتفوق على {scoring.percentile}% من أقرانه</span>
                </div>
                <div className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, textAlign: 'center', background: 'var(--card-bg)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>العمر اللغوي الاستقبالي</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#059669', margin: '14px 0 10px 0' }}>{scoring.ageEquivalentLabel}</div>
                  <span className="bdg" style={{ fontSize: '0.7rem', background: '#05966920', color: '#059669' }}>السن الزمني: {scoring.ageLabel}</span>
                </div>
                <div className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, textAlign: 'center', background: 'var(--card-bg)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>مستوى الأداء والاستجابة</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: scoring.severityColor, margin: '16px 0 12px 0' }}>{scoring.level}</div>
                  <span className="bdg" style={{ fontSize: '0.7rem', background: `${scoring.severityColor}20`, color: scoring.severityColor }}>تصنيف سيكومتري</span>
                </div>
              </div>

              {/* Narrative Report & IEP Goals Generator */}
              <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f766e' }}>📄 التقرير السيكومتري وتوليد أهداف الخطة الفردية (IEP)</h4>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-sm btn-p" onClick={generateNarrative} style={{ background: '#0f766e', borderColor: '#0f766e', color: '#fff', fontWeight: 700 }}>
                      🔄 توليد التقرير آلياً
                    </button>
                    <button type="button" className="btn btn-sm btn-g" onClick={exportGoalsToIEP} style={{ background: '#2563eb', borderColor: '#2563eb', color: '#fff', fontWeight: 700 }}>
                      📥 تصدير للـ IEP
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-main)' }}>مسودة التقرير الرسمي الشامل ومؤشرات الأداء السيكومتري:</label>
                    <textarea
                      rows={6}
                      className="form-control"
                      style={{ fontSize: '0.82rem', fontFamily: 'monospace', background: 'var(--g0)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                      value={form.clinicalSummary}
                      onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                      placeholder="اضغط على زر التوليد الآلي بالأعلى لتصميم التقرير الإكلينيكي طبقاً للدرجات المرصودة..."
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--text-main)' }}>الأهداف السلوكية التربوية (تصدير مباشر لبرنامج الطالب):</label>
                    <textarea
                      rows={4}
                      className="form-control"
                      style={{ fontSize: '0.82rem', fontFamily: 'monospace', background: 'var(--g0)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                      value={form.recommendations}
                      onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                      placeholder="الأهداف السلوكية التي يمكن ترحيلها مباشرة لخطة الطالب الفردية..."
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div style={{ flexShrink: 0, padding: '12px 20px', background: 'var(--g0, #f9fafb)', borderTop: '1px solid var(--border-color, #e5e7eb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>
            {validateStudentPick(form) ? `الطالب المحدد: ${form.studentName}` : '⚠️ يرجى اختيار طالب أولاً'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-g" onClick={onClose} style={{ fontWeight: 800 }}>إلغاء</button>
            <button type="button" className="btn" onClick={handleSave} style={{ background: '#0f766e', borderColor: '#0f766e', color: '#fff', fontWeight: 800 }}>💾 حفظ وتثبيت النتيجة</button>
          </div>
        </div>

      </div>

      {/* Copyright Info Modal */}
      {showCopyrightModal && (
        <div className="mbg" style={{ zIndex: 1300 }}>
          <div className="mb" style={{ maxWidth: '640px', background: 'var(--card-bg, #fff)', color: 'var(--text-main, #111827)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: 16, padding: 24, direction: 'rtl' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📜</span> دليل وحقوق الملكية الفكرية (PPVT™-5)
              </h3>
              <button type="button" className="btn-close-modal" onClick={() => setShowCopyrightModal(false)} style={{ background: 'var(--g0)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}>✖</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.86rem', lineHeight: 1.6 }}>
              <div style={{ background: 'var(--g0)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#0f766e', display: 'block', marginBottom: 2 }}>اسم المقياس الرسمي:</strong>
                <span>{PPVT5_COPYRIGHT_INFO.measureNameAr} ({PPVT5_COPYRIGHT_INFO.measureNameEn})</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>المؤلفون والجهة الناشرة:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-sub)' }}>{PPVT5_COPYRIGHT_INFO.authorAr} · {PPVT5_COPYRIGHT_INFO.publisher}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>الفئة العمرية والتطبيق:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-sub)' }}>{PPVT5_COPYRIGHT_INFO.ageRange}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>المعايير السيكومترية:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-sub)' }}>{PPVT5_COPYRIGHT_INFO.normSamples}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>بنية المقياس وقواعد التطبيق:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-sub)' }}>{PPVT5_COPYRIGHT_INFO.structure}</p>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-sub)' }}>{PPVT5_COPYRIGHT_INFO.scoringSystem}</p>
              </div>
            </div>
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              <button type="button" className="btn btn-p" onClick={() => setShowCopyrightModal(false)} style={{ background: '#0f766e', borderColor: '#0f766e', color: '#fff' }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
