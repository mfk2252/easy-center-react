import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd } from '../../hooks/useStorage';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import {
  PPVT5_SETS,
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
  date: todayStr(),
  notes: '',
  results: {}, // Map of item_id -> boolean (true for correct, false for incorrect/not reached)
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

  const [activeTab, setActiveTab] = useState('administration'); // 'administration' | 'interactive' | 'results'
  const [activeSetId, setActiveSetId] = useState(1);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

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
    return currentSet.items[activeItemIndex];
  }, [currentSet, activeItemIndex]);

  // Calculate live psychometrics based on the current results
  const scoring = useMemo(() => {
    // Determine which items were actually answered
    const answeredItems = Object.keys(form.results).map(Number);
    if (answeredItems.length === 0) {
      return {
        rawScore: 0,
        standardScore: 100,
        percentile: 50,
        ageEquivalentLabel: '—',
        level: 'لم يتم البدء',
        clinicalImpression: '',
        errorsCount: 0,
        ceilingItem: 0,
        testedSets: [],
      };
    }

    // Identify which sets were administered
    const testedSets = PPVT5_SETS.filter(set => {
      return set.items.some(item => form.results[item.id] !== undefined);
    });

    const testedSetIds = testedSets.map(s => s.setId);
    const minTestedSetId = Math.min(...testedSetIds, 1);
    const maxTestedSetId = Math.max(...testedSetIds, 1);

    // According to PPVT-5 standardization:
    // All items below basal level are assumed to be CORRECT.
    // The basal set is the lowest set administered with 0 or 1 error.
    let basalSetId = minTestedSetId;
    for (let sId = minTestedSetId; sId <= maxTestedSetId; sId++) {
      const set = PPVT5_SETS.find(s => s.setId === sId);
      const errorsInSet = set.items.filter(item => form.results[item.id] === false).length;
      if (errorsInSet <= 1) {
        basalSetId = sId;
        break;
      }
    }

    // All items below basal set are considered correct
    const basalStartId = (basalSetId - 1) * 12 + 1; // First item of basal set

    // The ceiling set is the highest set administered containing 6 or more errors.
    let ceilingSetId = maxTestedSetId;
    for (let sId = maxTestedSetId; sId >= minTestedSetId; sId--) {
      const set = PPVT5_SETS.find(s => s.setId === sId);
      const errorsInSet = set.items.filter(item => form.results[item.id] === false).length;
      if (errorsInSet >= 6) {
        ceilingSetId = sId;
        break;
      }
    }

    const ceilingItemNumber = ceilingSetId * 12; // Last item of the ceiling set

    // Total errors = Errors in administered sets from basal set to ceiling set
    let totalErrorsCount = 0;
    for (let sId = basalSetId; sId <= ceilingSetId; sId++) {
      const set = PPVT5_SETS.find(s => s.setId === sId);
      set.items.forEach(item => {
        if (form.results[item.id] === false) {
          totalErrorsCount++;
        }
      });
    }

    // Raw score = (Ceiling item number) - (errors from basal to ceiling)
    const rawScore = Math.max(0, ceilingItemNumber - totalErrorsCount);

    const psych = calculatePPVT5Psychometrics(rawScore, studentAgeMonths);

    // Compute error categories for diagnostic analysis
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

  function selectStudent(st) {
    setForm(prev => ({
      ...prev,
      stuId: st.id,
      studentName: st.name,
      dob: st.dob || '',
      age: st.age || '',
      diagnosis: st.diagnosis || 'اضطراب طيف التوحد',
    }));
  }

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
      // Move to next set
      setActiveSetId(prev => prev + 1);
      setActiveItemIndex(0);
      toast(`📂 تم الانتقال إلى: ${PPVT5_SETS.find(s => s.setId === activeSetId + 1).name}`, 'ok');
    } else {
      toast('🏁 لقد وصلت إلى نهاية بنود مقياس بيبودي', 'info');
    }
  }

  function handlePrevItem() {
    if (activeItemIndex > 0) {
      setActiveItemIndex(prev => prev - 1);
    } else if (activeSetId > 1) {
      setActiveSetId(prev => prev - 1);
      setActiveItemIndex(11); // Last item of previous set
    }
  }

  // Auto Generate Clinical Report
  function generateNarrative() {
    if (Object.keys(form.results).length === 0) {
      toast('⚠️ يرجى تقييم بعض البنود لتوليد التقرير', 'er');
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
• السن الزمني الفعلي: ${scoring.ageLabel}

📊 أولاً: النتائج الرقمية والدلالات الإحصائية:
---------------------------------------------
1. البند السقف (Ceiling Item): ${scoring.ceilingItem}
2. إجمالي الأخطاء المرصودة (Errors): ${scoring.errorsCount} خطأ
3. الدرجة الخام (Raw Score): ${scoring.rawScore} من أصل 96
4. الدرجة المعيارية (Standard Score): [ ${scoring.standardScore} ] (المتوسط = 100، الانحراف المعياري = 15)
5. الرتبة المئينية (Percentile Rank): [ ${scoring.percentile}% ]
6. العمر اللغوي المكافئ (Age Equivalent): [ ${scoring.ageEquivalentLabel} ]
7. مستوى الأداء اللفظي الاستقبالي: [ ${scoring.level} ]

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
1. أن يشير الطالب إلى المثير البصري الصحيح الدال على الاسم (من المجموعات الضمنية) عند سماع الكلمة الممثلة من بين 4 خيارات بنسبة نجاح لا تقل عن 80%.
2. أن يحدد الطالب الصورة المعبرة عن الفعل الحركي الوظيفي المطلوب (مثل: يركض، يغوص، يسبح) بدقة 85% خلال 3 جلسات متتالية.
3. أن يطابق الطالب المفردات المعبرة عن الصفات والمفاهيم اللغوية (مثل: بارد، دافئ، توازن، وعي) بالرسم أو الرمز الدال عليها بنسبة نجاح 80% في التقييم الختامي.`;

    setForm(prev => ({
      ...prev,
      clinicalSummary: summaryReport,
      recommendations: iepGoalsText
    }));

    toast('✨ تم توليد التقرير السيكومتري والتوصيات التربوية الفردية بدقة أكاديمية', 'ok');
  }

  // Auto populate mock performance for testing
  function autoFillPPVT(preset = 'normal') {
    const results = {};
    if (preset === 'normal') {
      // mostly correct in lower sets, few mistakes in set 3-4, not reached in high sets
      PPVT5_SETS.forEach(set => {
        set.items.forEach(it => {
          if (set.setId <= 3) {
            results[it.id] = Math.random() > 0.1; // 90% correct
          } else if (set.setId === 4) {
            results[it.id] = Math.random() > 0.4; // 60% correct
          } else if (set.setId === 5) {
            results[it.id] = Math.random() > 0.7; // 30% correct
          } else {
            results[it.id] = false; // ceiling reached
          }
        });
      });
    } else if (preset === 'delay') {
      // mild delay
      PPVT5_SETS.forEach(set => {
        set.items.forEach(it => {
          if (set.setId === 1) {
            results[it.id] = Math.random() > 0.15;
          } else if (set.setId === 2) {
            results[it.id] = Math.random() > 0.5; // 50% errors -> close to ceiling
          } else {
            results[it.id] = false;
          }
        });
      });
    } else {
      // severe delay
      PPVT5_SETS.forEach(set => {
        set.items.forEach(it => {
          if (set.setId === 1) {
            results[it.id] = Math.random() > 0.5; // many errors even in set 1
          } else {
            results[it.id] = false;
          }
        });
      });
    }

    setForm(prev => ({ ...prev, results }));
    toast(`⚡ تم تعبئة درجات بيبودي تلقائياً بنمط: ${preset === 'normal' ? 'مستوى طبيعي' : preset === 'delay' ? 'تأخر بسيط' : 'تأخر شديد'}`, 'ok');
  }

  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً', 'er');
      return;
    }

    if (Object.keys(form.results).length === 0) {
      toast('⚠️ يجب تقييم مفردا واحدة على الأقل لحفظ المقياس', 'er');
      return;
    }

    const payload = {
      ...form,
      measureId: 'ppvt5',
      measureName: 'مقياس بيبودي للمفردات اللغوية المصورة (PPVT-5)',
      scaleType: 'ppvt5',
      score: scoring.rawScore,
      maxScore: 96,
      percentage: `${Math.round((scoring.rawScore / 96) * 100)}%`,
      level: scoring.level,
      severityColor: scoring.severityColor,
      results: form.results, // results dictionary
      standardScore: scoring.standardScore,
      percentile: scoring.percentile,
      ageEquivalent: scoring.ageEquivalentLabel,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث تقييم بيبودي PPVT-5 بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ تقييم بيبودي PPVT-5 بنجاح', 'ok');
    }

    onSaved();
    onClose();
  }

  return (
    <div className="mbg">
      <div className="mb mb-xl">
        
        {/* Modal Header */}
        <div className="fhd" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', color: '#fff' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>
              📚 مقياس بيبودي للمفردات اللغوية المصورة - الإصدار الخامس (PPVT-5)
            </h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: '2px 0 0 0', fontWeight: 400 }}>
              أداة سيكومترية مقننة لتقييم النمو المعرفي والحصيلة اللفظية الاستقبالية للأطفال من سن عامين ونصف فما فوق
            </p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}>إغلاق ✖</button>
        </div>

        {/* Modal Subtabs Navbar */}
        <div style={{ display: 'flex', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', padding: '0 10px' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'administration' ? 'active' : ''}`}
            onClick={() => setActiveTab('administration')}
            style={{ padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.88rem', borderBottom: activeTab === 'administration' ? '3px solid #0f766e' : 'none', color: activeTab === 'administration' ? '#0f766e' : 'var(--text-sub)' }}
          >
            📋 بيانات الطالب والتأسيس
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'interactive' ? 'active' : ''}`}
            onClick={() => {
              if (!validateStudentPick(form)) {
                toast('⚠️ يرجى اختيار الطالب أولاً لبدء بنود الفحص', 'er');
                return;
              }
              setActiveTab('interactive');
            }}
            style={{ padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.88rem', borderBottom: activeTab === 'interactive' ? '3px solid #0f766e' : 'none', color: activeTab === 'interactive' ? '#0f766e' : 'var(--text-sub)' }}
          >
            🧩 محاكاة التطبيق التفاعلي (Interactive Exam)
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
            style={{ padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.88rem', borderBottom: activeTab === 'results' ? '3px solid #0f766e' : 'none', color: activeTab === 'results' ? '#0f766e' : 'var(--text-sub)' }}
          >
            📊 النتائج السيكومترية والتقرير
          </button>
        </div>

        {/* Modal Body Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          
          {/* TAB 1: ADMINISTRATION */}
          {activeTab === 'administration' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Student Picker Panel */}
              <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12 }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>👤</span> اختيار الطالب المستهدف وتحديد السن الزمني
                </h3>
                <StudentPicker
                  form={form}
                  setForm={setForm}
                  students={students}
                  emps={emps}
                  showExtra={false}
                />

                {form.stuId && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16, background: 'var(--g0)', padding: 12, borderRadius: 10 }}>
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
                        style={{ fontSize: '0.8rem', padding: '4px 6px', width: '100%', border: '1px solid var(--border-color)', borderRadius: 6, background: '#fff', marginTop: 4 }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>السن الزمني الفعلي:</span>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', marginTop: 6 }}>{scoring.ageLabel} ({studentAgeMonths} شهراً)</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>المجموعة الإرشادية للبدء:</span>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f766e', marginTop: 6 }}>المجموعة {getPPVT5StartSetByAge(studentAgeMonths)}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>التشخيص الطبي الأولي:</span>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: 6 }}>{form.diagnosis || 'غير محدد'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Psychometric Rules Guidelines Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                
                {/* Rules Checklist */}
                <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12 }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>⚖️ ضوابط وقواعد الفحص السيكومتري (PPVT-5)</h4>
                  <ul style={{ fontSize: '0.8rem', paddingRight: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-sub)' }}>
                    <li>
                      <strong>قاعدة البدء (Start Point):</strong> يبدأ الفاحص بالمجموعة المناسبة للسن الزمني للطالب طبقاً للجدول الإرشادي.
                    </li>
                    <li>
                      <strong>قاعدة القاعدة (Basal Rule):</strong> تعتبر القاعدة محققة عندما يرتكب الطفل <strong style={{ color: '#059669' }}>0 أو 1 خطأ</strong> فقط في مجموعة كاملة (12 بند). وإذا ارتكب أكثر، نرجع للمجموعة السابقة.
                    </li>
                    <li>
                      <strong>قاعدة السقف (Ceiling Rule):</strong> يتم التوقف الفوري عن التقييم إذا ارتكب الطفل <strong style={{ color: '#ef4444' }}>6 أخطأ أو أكثر</strong> في نفس المجموعة المكونة من 12 بنداً.
                    </li>
                    <li>
                      <strong>حساب الدرجة الخام:</strong> (البند السقف وهو البند الأخير بالمسلسل المطبق) مطروحاً منه إجمالي الأخطاء المرصودة من بداية "القاعدة" حتى "السقف".
                    </li>
                  </ul>
                </div>

                {/* Quick Presets for Demo */}
                <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12, background: '#f0fdfa' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f766e' }}>⚡ لوحة المحاكاة والتعبئة الفورية (أغراض الفحص والسرعة)</h4>
                  <p style={{ fontSize: '0.78rem', color: '#115e59', margin: '0 0 12px 0' }}>يسهل على الفاحص تعبئة درجات البنود فورياً ومحاكاة نتائج التقييم السيكومتري لخدمة الأغراض التجريبية والتقارير الأكاديمية السريعة:</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-sm btn-p" onClick={() => autoFillPPVT('normal')} style={{ background: '#0f766e', borderColor: '#0f766e', color: '#fff' }}>✔️ نمط: مستوى طبيعي</button>
                    <button type="button" className="btn btn-sm btn-g" onClick={() => autoFillPPVT('delay')} style={{ background: '#3b82f6', color: '#fff' }}>⚠️ نمط: تأخر بسيط</button>
                    <button type="button" className="btn btn-sm" onClick={() => autoFillPPVT('severe')} style={{ background: '#ef4444', color: '#fff' }}>🚨 نمط: تأخر شديد</button>
                  </div>
                </div>

              </div>

              {/* Administrative metadata inputs */}
              <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12 }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.94rem', fontWeight: 800 }}>🖋️ ترويسة التقييم والبيانات الإدارية</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>تاريخ جلسة الفحص:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>الأخصائي الفاحص:</label>
                    <select
                      className="form-control"
                      value={form.specialistName}
                      onChange={e => setForm(f => ({ ...f, specialistName: e.target.value }))}
                    >
                      <option value="">-- اختر الأخصائي --</option>
                      {emps.map(em => (
                        <option key={em.id} value={em.name}>{em.name} ({em.role || 'أخصائي'})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>تحديد مجموعة البداية يدوياً (اختياري):</label>
                    <select
                      className="form-control"
                      value={form.customStartSet || ''}
                      onChange={e => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setForm(f => ({ ...f, customStartSet: val }));
                        if (val) {
                          setActiveSetId(val);
                          setActiveItemIndex(0);
                        }
                      }}
                    >
                      <option value="">تحديد تلقائي بحسب السن الزمني</option>
                      {PPVT5_SETS.map(s => (
                        <option key={s.setId} value={s.setId}>{s.name}</option>
                      ))}
                    </select>
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
                  const totalAnswered = itemsInSet.filter(it => form.results[it.id] !== undefined).length;
                  const errorsInSet = itemsInSet.filter(it => form.results[it.id] === false).length;
                  
                  let setBadgeColor = 'var(--text-sub)';
                  let setBg = 'var(--g0)';
                  if (set.setId === activeSetId) {
                    setBg = '#e6f4ea';
                    setBadgeColor = '#0f766e';
                  } else if (errorsInSet >= 6) {
                    setBg = '#fef2f2';
                    setBadgeColor = '#ef4444'; // Ceiling
                  } else if (totalAnswered === 12 && errorsInSet <= 1) {
                    setBg = '#f0fdf4';
                    setBadgeColor = '#10b981'; // Basal Reached
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
                      <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>({totalAnswered}/12) {errorsInSet > 0 ? `· ❌ ${errorsInSet}` : ''}</span>
                    </button>
                  );
                })}
              </div>

              {/* Set Info Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--g0)', padding: '10px 16px', borderRadius: 10 }}>
                <span style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.9rem' }}>📁 {currentSet.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  البند الحالي: <strong>{currentItem.id}</strong> من أصل 96 بنداً
                </span>
              </div>

              {/* Interactive Presentation Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
                
                {/* Left: Huge Picture Card View */}
                <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', border: '1px solid var(--border-color)', borderRadius: 16, position: 'relative' }}>
                  
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
                        style={{ background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0f766e', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                            background: isTarget ? '#f0fdfa' : 'var(--g0)',
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

                  {/* Score Selector (Examiner Grader) */}
                  <div style={{ display: 'flex', gap: 12, width: '100%', justifyContents: 'center', maxWidth: '400px', background: 'var(--g0)', padding: 12, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleResultChange(currentItem.id, true);
                        handleNextItem();
                      }}
                      className="btn"
                      style={{
                        flex: 1,
                        background: form.results[currentItem.id] === true ? '#10b981' : '#fff',
                        color: form.results[currentItem.id] === true ? '#fff' : 'var(--text-main)',
                        borderColor: '#10b981',
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
                        background: form.results[currentItem.id] === false ? '#ef4444' : '#fff',
                        color: form.results[currentItem.id] === false ? '#fff' : 'var(--text-main)',
                        borderColor: '#ef4444',
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
                <div className="card" style={{ padding: 14, overflowY: 'auto', maxHeight: '420px', border: '1px solid var(--border-color)', borderRadius: 16 }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: '#0f766e', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>📋 بنود المجموعة الحالية</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {currentSet.items.map((item, idx) => {
                      const res = form.results[item.id];
                      let itemBg = 'var(--g0)';
                      let borderC = 'transparent';
                      let statusText = '⏳ غير مطبق';
                      let statusCol = 'var(--text-sub)';

                      if (idx === activeItemIndex) {
                        itemBg = '#f0fdfa';
                        borderC = '#0f766e';
                      }

                      if (res === true) {
                        statusText = '🟢 صحيح (1)';
                        statusCol = '#10b981';
                      } else if (res === false) {
                        statusText = '🔴 خطأ (0)';
                        statusCol = '#ef4444';
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
                          <div style={{ fontWeight: 700 }}>
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

          {/* TAB 3: CLINICAL REPORT & PSYCHOMETRICS */}
          {activeTab === 'results' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Quick Summary Cards (Psychometric Matrix) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                
                {/* Standard Score */}
                <div className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, textAlign: 'center', background: 'var(--g0)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>الدرجة المعيارية (SS)</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f766e', margin: '4px 0' }}>{scoring.standardScore}</div>
                  <span className="bdg b-gr" style={{ fontSize: '0.7rem' }}>المتوسط الطبيعي = 100</span>
                </div>

                {/* Percentile Rank */}
                <div className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, textAlign: 'center', background: 'var(--g0)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>الرتبة المئينية</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#3b82f6', margin: '4px 0' }}>{scoring.percentile}%</div>
                  <span className="bdg b-bl" style={{ fontSize: '0.7rem' }}>يتفوق على {scoring.percentile}% من أقرانه</span>
                </div>

                {/* Age Equivalent */}
                <div className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, textAlign: 'center', background: 'var(--g0)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>العمر اللغوي الاستقبالي المكافئ</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', margin: '14px 0 10px 0' }}>{scoring.ageEquivalentLabel}</div>
                  <span className="bdg" style={{ fontSize: '0.7rem', background: '#d1fae5', color: '#065f46' }}>العمر الزمني: {scoring.ageLabel}</span>
                </div>

                {/* Level / Delay */}
                <div className="card" style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, textAlign: 'center', background: 'var(--g0)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>مستوى الأداء اللفظي الاستقبالي</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: scoring.severityColor, margin: '16px 0 12px 0' }}>{scoring.level}</div>
                  <span className="bdg" style={{ fontSize: '0.7rem', background: `${scoring.severityColor}15`, color: scoring.severityColor, fontWeight: 800 }}>تصنيف إكلينيكي رسمي</span>
                </div>

              </div>

              {/* Technical Statistics Table */}
              <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12 }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.94rem', fontWeight: 800 }}>📉 ملخص الحسابات الإحصائية وبنود التأسيس والسقف</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <div style={{ padding: 10, background: 'var(--g0)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>البند السقف (Ceiling Item):</span>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{scoring.ceilingItem}</div>
                  </div>
                  <div style={{ padding: 10, background: 'var(--g0)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>إجمالي الأخطاء من القاعدة للسقف:</span>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ef4444' }}>{scoring.errorsCount} خطأ</div>
                  </div>
                  <div style={{ padding: 10, background: 'var(--g0)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>الدرجة الخام النهائية:</span>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f766e' }}>{scoring.rawScore} من 96</div>
                  </div>
                  <div style={{ padding: 10, background: 'var(--g0)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>رصد مجموعة السقف:</span>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>المجموعة {scoring.ceilingSetId || '—'}</div>
                  </div>
                </div>

                {/* Categories Error analysis bars */}
                <h5 style={{ margin: '18px 0 10px 0', fontSize: '0.86rem', fontWeight: 800 }}>📊 تحليل الأخطاء بحسب فئة الكلمة (أسماء / أفعال / صفات ومفاهيم):</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {Object.entries(scoring.errorCategories || {}).map(([cat, errors]) => {
                    const corrects = scoring.correctCategories[cat] || 0;
                    const total = corrects + errors;
                    const pct = total > 0 ? Math.round((corrects / total) * 100) : 100;
                    return (
                      <div key={cat} style={{ background: 'var(--g0)', padding: 10, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                          <strong style={{ color: '#0f766e' }}>{cat}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{corrects} سليم | {errors} أخطاء</span>
                        </div>
                        <div style={{ background: 'var(--g1)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, background: '#0f766e', height: '100%' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Narrative Report Editor */}
              <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f766e' }}>📄 التقرير السيكومتري والتوصيات الطبية</h4>
                  <button type="button" className="btn btn-sm btn-p" onClick={generateNarrative} style={{ background: '#0f766e', borderColor: '#0f766e', color: '#fff' }}>
                    🔄 توليد التقرير الأكاديمي آلياً
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>مسودة التقرير الرسمي الشامل ومؤشرات الأداء:</label>
                    <textarea
                      rows={6}
                      className="form-control"
                      style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
                      value={form.clinicalSummary}
                      onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                      placeholder="اضغط على زر التوليد الآلي بالأعلى لتصميم التقرير الإكلينيكي طبقاً للدرجات المرصودة..."
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>الأهداف السلوكية المقترحة للتحول للتدخل (IEP):</label>
                    <textarea
                      rows={4}
                      className="form-control"
                      style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
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
        <div style={{ padding: '12px 20px', background: 'var(--g0)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>
            {validateStudentPick(form) ? `الطالب المحدد: ${form.studentName}` : '⚠️ يرجى اختيار طالب أولاً'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-g" onClick={onClose} style={{ fontWeight: 800 }}>إلغاء</button>
            <button type="button" className="btn" onClick={handleSave} style={{ background: '#0f766e', borderColor: '#0f766e', color: '#fff', fontWeight: 800 }}>💾 حفظ وتثبيت النتيجة</button>
          </div>
        </div>

      </div>
    </div>
  );
}
