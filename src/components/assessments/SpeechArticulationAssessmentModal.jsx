import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { lsAdd, lsUpd, lsGet } from '../../hooks/useStorage';
import { validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';
import {
  SPEECH_ARTICULATION_COPYRIGHT_INFO,
  SPEECH_ORAL_MOTOR_ITEMS,
  FEEDING_SWALLOWING_ITEMS,
  SPEECH_PHONETIC_ITEMS,
  PHONOLOGICAL_PROCESSES_ITEMS,
  STUTTERING_FLUENCY_ITEMS,
  RESONANCE_NASALITY_ITEMS,
  CAPEV_VOICE_ITEMS,
  PRAGMATIC_ITEMS,
  AAC_READINESS_ITEMS,
  calculateSpeechScreeningPsychometrics,
} from '../../data/speechArticulationData';

const EMPTY_SPEECH_FORM = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  school: 'مركز الرعاية والتأهيل',
  raterName: '',
  raterRelation: 'ولي الأمر (الأم/الأب)',
  specialistName: '',
  examinerName: '',
  date: todayStr(),
  notes: '',
  results: {}, // Stores responses for all 9 protocols
  clinicalSummary: '',
  recommendations: '',
  exportedGoals: [], // List of exported goals
};

export default function SpeechArticulationAssessmentModal({
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
        ...EMPTY_SPEECH_FORM,
        ...initialData,
        results: initialData.results || initialData.scores || {},
        exportedGoals: initialData.exportedGoals || [],
      };
    }
    return {
      ...EMPTY_SPEECH_FORM,
      specialistName: currentUser?.name || (emps[0]?.name || 'أخصائي التخاطب وعضلات الفم'),
      examinerName: currentUser?.name || (emps[0]?.name || 'أخصائي التخاطب وعضلات الفم'),
      date: todayStr(),
    };
  });

  const [activeTab, setActiveTab] = useState('oral_motor_feeding');
  // 'oral_motor_feeding' | 'phonetic_phonology' | 'fluency_voice' | 'pragmatics_aac' | 'summary_iep'

  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [letterFilter, setLetterFilter] = useState('all'); // 'all' | 'errors_only' | 'correct_only'

  // State for dynamic IEP goal selection and text edits
  const [selectedGoals, setSelectedGoals] = useState({}); // { [goalId]: boolean }
  const [editedGoalTexts, setEditedGoalTexts] = useState({}); // { [goalId]: text }

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
      studentName: stu.name || stu.fullName || '',
      dob: stu.dob || '',
      diagnosis: stu.diagnosis || '',
      age: calculatedAge || stu.age || '',
      school: stu.school || stu.schoolName || 'مركز الرعاية والتأهيل',
    }));
  }

  // Clinical calculation engine
  const psychometrics = useMemo(() => {
    return calculateSpeechScreeningPsychometrics(form.results || {});
  }, [form.results]);

  // Sync selected goals when psychometrics are updated
  useEffect(() => {
    if (psychometrics?.generatedIepGoals) {
      setSelectedGoals(prevSelected => {
        const initialSelection = {};
        psychometrics.generatedIepGoals.forEach(g => {
          initialSelection[g.id] = prevSelected[g.id] !== undefined ? prevSelected[g.id] : true;
        });
        return initialSelection;
      });

      setEditedGoalTexts(prevTexts => {
        const initialTexts = {};
        psychometrics.generatedIepGoals.forEach(g => {
          initialTexts[g.id] = prevTexts[g.id] || g.goal;
        });
        return initialTexts;
      });
    }
  }, [psychometrics?.generatedIepGoals]);

  // Total items answered count calculation across all 9 protocols
  const totalAnswered = useMemo(() => {
    const results = form.results || {};
    let count = 0;

    // Check OME items
    SPEECH_ORAL_MOTOR_ITEMS.forEach(it => {
      if (results[`oral_${it.id}`] !== undefined && results[`oral_${it.id}`] !== null) count++;
    });

    // Check Feeding items
    FEEDING_SWALLOWING_ITEMS.forEach(it => {
      if (results[`feeding_${it.id}`] !== undefined && results[`feeding_${it.id}`] !== null) count++;
    });

    // Check Phonetic 28 items * 3 positions = 84
    SPEECH_PHONETIC_ITEMS.forEach(it => {
      ['first', 'middle', 'last'].forEach(pos => {
        const val = results[`phone_${it.id}_${pos}`];
        if (val && val !== 'na') count++;
      });
    });

    // Check Phonological Processes
    PHONOLOGICAL_PROCESSES_ITEMS.forEach(it => {
      if (results[`phone_proc_${it.id}`] !== undefined && results[`phone_proc_${it.id}`] !== null) count++;
    });

    // Check Fluency / Stuttering
    STUTTERING_FLUENCY_ITEMS.forEach(it => {
      if (results[`fluency_${it.id}`] !== undefined && results[`fluency_${it.id}`] !== null) count++;
    });

    // Check Resonance
    RESONANCE_NASALITY_ITEMS.forEach(it => {
      if (results[`resonance_${it.id}`] !== undefined && results[`resonance_${it.id}`] !== null) count++;
    });

    // Check Voice
    CAPEV_VOICE_ITEMS.forEach(it => {
      if (results[`voice_${it.id}`] !== undefined && results[`voice_${it.id}`] !== null) count++;
    });

    // Check Pragmatics
    PRAGMATIC_ITEMS.forEach(it => {
      if (results[`pragmatic_${it.id}`] !== undefined && results[`pragmatic_${it.id}`] !== null) count++;
    });

    // Check AAC Readiness
    AAC_READINESS_ITEMS.forEach(it => {
      if (results[`aac_${it.id}`] !== undefined && results[`aac_${it.id}`] !== null) count++;
    });

    return count;
  }, [form.results]);

  const completionPercentage = useMemo(() => {
    // Total possible evaluation points across all protocols = 129
    return Math.min(100, Math.round((totalAnswered / 129) * 100));
  }, [totalAnswered]);

  function updateResultValue(key, value) {
    setForm(prev => ({
      ...prev,
      results: {
        ...prev.results,
        [key]: value,
      },
    }));
  }

  // Pre-fill answers for quick clinical simulation and demonstrations
  function autoFillAnswers(preset = 'correct') {
    if (preset === 'clear') {
      setForm(prev => ({ ...prev, results: {} }));
      toast('🧹 تم تفريغ إجابات المقياس بالكامل', 'info');
      return;
    }

    const results = {};

    // 1. OME Fill
    SPEECH_ORAL_MOTOR_ITEMS.forEach(it => {
      results[`oral_${it.id}`] = preset === 'correct' ? 3 : preset === 'mild' ? 2 : 1;
    });

    // 2. Feeding Fill
    FEEDING_SWALLOWING_ITEMS.forEach(it => {
      results[`feeding_${it.id}`] = preset === 'correct' ? 3 : preset === 'mild' ? 2 : 1;
    });

    // 3. Phonetic Arabic 28 Letters
    SPEECH_PHONETIC_ITEMS.forEach(it => {
      ['first', 'middle', 'last'].forEach(pos => {
        const key = `phone_${it.id}_${pos}`;
        if (preset === 'correct') {
          results[key] = 'correct';
        } else if (preset === 'mild') {
          if (it.id === 'let_raa') {
            results[key] = 'substitution';
            results[`${key}_sub`] = 'ي';
          } else if (it.id === 'let_seen') {
            results[key] = 'substitution';
            results[`${key}_sub`] = 'ث';
          } else {
            results[key] = 'correct';
          }
        } else {
          // Severe omissions, distortions, substitutions
          if (['let_raa', 'let_laam', 'let_kaaf', 'let_qaaf'].includes(it.id)) {
            results[key] = 'substitution';
            results[`${key}_sub`] = 'ي';
          } else if (['let_seen', 'let_saad', 'let_sheen'].includes(it.id)) {
            results[key] = 'distortion';
          } else if (['let_thaa', 'let_thaal', 'let_zaa_m'].includes(it.id)) {
            results[key] = 'omission';
          } else {
            results[key] = 'correct';
          }
        }
      });
    });

    // 4. Phonological Processes
    PHONOLOGICAL_PROCESSES_ITEMS.forEach(it => {
      results[`phone_proc_${it.id}`] = preset === 'correct' ? 0 : preset === 'mild' ? 1 : 3;
    });

    // 5. Fluency / Stuttering
    STUTTERING_FLUENCY_ITEMS.forEach(it => {
      results[`fluency_${it.id}`] = preset === 'correct' ? 3 : preset === 'mild' ? 2 : 1;
    });

    // 6. Resonance & Nasality
    RESONANCE_NASALITY_ITEMS.forEach(it => {
      results[`resonance_${it.id}`] = preset === 'correct' ? 3 : preset === 'mild' ? 2 : 1;
    });

    // 7. CAPE-V Voice
    CAPEV_VOICE_ITEMS.forEach(it => {
      results[`voice_${it.id}`] = preset === 'correct' ? 3 : preset === 'mild' ? 2 : 1;
    });

    // 8. Pragmatics
    PRAGMATIC_ITEMS.forEach(it => {
      results[`pragmatic_${it.id}`] = preset === 'correct' ? 3 : preset === 'mild' ? 2 : 1;
    });

    // 9. AAC Readiness
    AAC_READINESS_ITEMS.forEach(it => {
      results[`aac_${it.id}`] = preset === 'correct' ? 3 : preset === 'mild' ? 2 : 1;
    });

    setForm(prev => ({ ...prev, results }));
    toast(
      `⚡ تم تعبئة كافة البروتوكولات بنمط: ${
        preset === 'correct' ? 'طبيعي/سليم' : preset === 'mild' ? 'صعوبات بسيطة' : 'صعوبات شديدة'
      }`,
      'ok'
    );
  }

  // Quick Action: Mark all 28 Arabic letters in all 3 positions as correct
  const markAllLettersAsCorrect = () => {
    const updatedResults = { ...form.results };
    SPEECH_PHONETIC_ITEMS.forEach(it => {
      ['first', 'middle', 'last'].forEach(pos => {
        updatedResults[`phone_${it.id}_${pos}`] = 'correct';
      });
    });
    setForm(prev => ({ ...prev, results: updatedResults }));
    toast('✅ تم اعتماد كافة مخارج الأصوات الـ 28 بسليمة بنجاح', 'ok');
  };

  // Quick Action: Clear letter matrix
  const clearPhoneticMatrix = () => {
    const updatedResults = { ...form.results };
    SPEECH_PHONETIC_ITEMS.forEach(it => {
      ['first', 'middle', 'last'].forEach(pos => {
        delete updatedResults[`phone_${it.id}_${pos}`];
        delete updatedResults[`phone_${it.id}_${pos}_sub`];
      });
    });
    setForm(prev => ({ ...prev, results: updatedResults }));
    toast('🧹 تم تفريغ جدول مخارج الحروف بنجاح', 'info');
  };

  // Generates complete clinical narrative report and recommendations
  function generateClinicalReport() {
    if (!form.studentName) {
      toast('⚠️ يرجى اختيار الطفل أولاً لتوليد التقرير المخصص باسمه', 'er');
      return;
    }

    const reportNarrative = `🎯 تقرير التقييم الإكلينيكي الشامل للنطق واللغة والتواصل وعضلات الفم
----------------------------------------------------------------------
• اسم الطالب: ${form.studentName || '—'}
• السن الزمني: ${form.age || '—'}
• تاريخ الفحص والتقييم: ${form.date}
• الأخصائي القائم بالتشخيص: ${form.specialistName || form.examinerName || '—'}

📊 مؤشرات التقييم السريعة:
- المعدل الإجمالي للمهارات: (%${psychometrics.overallAvgPercentage})
- معدل دقة مخارج الحروف: (%${psychometrics.accuracyRate}) [${psychometrics.phoneticCorrect} من أصل ${psychometrics.phoneticTested || 84} موضعاً مبعوثاً]
- كفاءة أعضاء النطق (OME): (%${psychometrics.omePercentage})
- تناسق البلع والمضغ: (%${psychometrics.feedingPercentage})
- الطلاقة الكلامية: (%${psychometrics.fluencyPercentage})
- استخدام اللغة الاجتماعي: (%${psychometrics.pragmaticPercentage})

الخلاصة الإكلينيكية والتشخيصية التفصيلية:
[${psychometrics.overallLevel}]
${psychometrics.clinicalImpression}

----------------------------------------------------------------------
توصيات إكلينيكية وعلاجية مخصصة للطفل:
1. إدراج الطفل في برنامج علاجي فردي مخصص لأمراض النطق والتخاطب بمعدل (2-3) جلسات أسبوعياً.
2. التركيز الفوري على الأهداف السلوكية المحددة في محطة الـ IEP لتطوير كفاءة حركة الفم وتناسق البلع ومخارج النطق الفونيمية.
3. التنسيق مع طبيب الأسنان/البلع عند وجود مبرر عضوي (مثل رابط لسان معيق أو عضة مفتوحة شديدة).
4. تعميم الأصوات والمهارات المكتسبة ببيئة الصف والمنزل لتعزيز التفاعل الاجتماعي والبراجماتي الطبيعي.`;

    const distinctWeaknesses = psychometrics.weaknesses
      .map((w, idx) => `${idx + 1}. [${w.domain}] ${w.item} (الحالة: ${w.val === 0 ? 'خلل حاد' : w.val === 1 ? 'خلل متوسط' : w.val === 2 ? 'قصور بسيط' : w.val})`)
      .join('\n');

    setForm(f => ({
      ...f,
      clinicalSummary: reportNarrative,
      recommendations: distinctWeaknesses || '• لا توجد نقاط ضعف أو احتياجات علاجية مرصودة حالياً.',
    }));

    toast('✨ تم توليد التقرير السردي والتوصيات العلاجية تلقائياً', 'ok');
  }

  // Exports selected behavioral goals to student's active IEP plan
  function handleExportGoalsToIep() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً لتصدير الأهداف لملفه', 'er');
      return;
    }

    const goalsToExport = psychometrics.generatedIepGoals
      .filter(g => selectedGoals[g.id])
      .map(g => ({
        id: uid(),
        text: editedGoalTexts[g.id] || g.goal,
        title: `نطق وتواصل: ${g.weakness || g.domain}`,
        target: editedGoalTexts[g.id] || g.goal,
        domain: 'speech',
        domainLabel: 'النطق واللغة والتواصل',
        source: 'سجل فحص وتقييم النطق ومخارج الحروف',
        status: 'active',
        startDate: form.date || todayStr(),
        createdAt: new Date().toISOString(),
      }));

    if (goalsToExport.length === 0) {
      toast('⚠️ يرجى تفعيل أو تحديد هدف واحد على الأقل للتصدير', 'er');
      return;
    }

    // Try exporting to studentPrograms first, then progPrograms
    let exportedCount = 0;

    const savedStudentPrograms = lsGet('studentPrograms') || [];
    const activeStudentProgIndex = savedStudentPrograms.findIndex(p => p.stuId === form.stuId && p.status === 'active');

    if (activeStudentProgIndex !== -1) {
      const activeProgram = savedStudentPrograms[activeStudentProgIndex];
      const existingGoals = activeProgram.goals || [];
      const updatedGoals = [...existingGoals];

      goalsToExport.forEach(newGoal => {
        if (!existingGoals.some(g => g.target === newGoal.target || g.text === newGoal.text)) {
          updatedGoals.push(newGoal);
          exportedCount++;
        }
      });

      activeProgram.goals = updatedGoals;
      savedStudentPrograms[activeStudentProgIndex] = activeProgram;
      localStorage.setItem('studentPrograms', JSON.stringify(savedStudentPrograms));
    }

    // Also check progPrograms table for full sync
    const savedProgPrograms = lsGet('progPrograms') || [];
    let progProgram = savedProgPrograms.find(p => p.stuId === form.stuId && p.status === 'active');

    if (progProgram) {
      const existingGoals = progProgram.goals || [];
      const updatedGoals = [...existingGoals];

      goalsToExport.forEach(newGoal => {
        if (!existingGoals.some(g => g.target === newGoal.target || g.text === newGoal.text)) {
          updatedGoals.push(newGoal);
          if (activeStudentProgIndex === -1) exportedCount++;
        }
      });

      progProgram.goals = updatedGoals;
      lsUpd('progPrograms', progProgram.id, progProgram);
    } else if (activeStudentProgIndex === -1) {
      // Create brand new program
      const newProgram = {
        id: uid(),
        stuId: form.stuId,
        studentName: form.studentName,
        dob: form.dob,
        age: form.age,
        diagnosis: form.diagnosis,
        title: 'برنامج تأهيل النطق واللغة والتواصل وعضلات الفم الفردي',
        duration: 'فصل دراسي (3 أشهر)',
        startDate: form.date || todayStr(),
        reviewDate: '',
        specialistName: form.specialistName || '',
        status: 'active',
        goals: goalsToExport,
        notes: 'تم تصدير أهداف هذا البرنامج تلقائياً من وحدة تقييمات وفحوصات النطق واللغة وعضلات الفم الشاملة.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      savedProgPrograms.push(newProgram);
      localStorage.setItem('progPrograms', JSON.stringify(savedProgPrograms));
      exportedCount = goalsToExport.length;
    }

    setForm(f => ({
      ...f,
      exportedGoals: [...(f.exportedGoals || []), ...goalsToExport.map(g => g.text)],
    }));

    toast(`📥 تم تصدير عدد (${goalsToExport.length}) هدفاً سلوكياً قابلاً للقياس بنجاح إلى برنامج الـ IEP للطالب!`, 'ok');
  }

  // Unified save handler
  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطفل أولاً لحفظ المقياس', 'er');
      return;
    }

    if (totalAnswered < 10) {
      if (!window.confirm(`⚠️ تم تقييم (${totalAnswered}) بنداً فقط. هل تود حفظ التقييم كمسودة مؤقتة؟`)) {
        return;
      }
    }

    const payload = {
      ...form,
      id: initialData?.id || uid(),
      measureId: 'speech_screening',
      scaleId: 'speech_screening',
      scaleType: 'speech_screening',
      measureName: 'سجل فحص وتقييم النطق ومخارج الحروف وعضلات الفم الشامل',
      scaleName: 'سجل فحص وتقييم النطق ومخارج الحروف وعضلات الفم الشامل',
      category: 'speech_language',
      categoryName: 'التخاطب ومخارج الحروف',
      author: SPEECH_ARTICULATION_COPYRIGHT_INFO.authorAr,
      evaluator: form.specialistName || form.examinerName,
      examinerName: form.specialistName || form.examinerName,

      score: psychometrics.phoneticCorrect,
      maxScore: psychometrics.phoneticTested || 84,
      percentage: `${psychometrics.overallAvgPercentage}%`,
      percentageNum: psychometrics.overallAvgPercentage,
      level: psychometrics.overallLevel,
      severityColor: psychometrics.overallColor,

      accuracyRate: psychometrics.accuracyRate,
      omePercentage: psychometrics.omePercentage,
      feedingPercentage: psychometrics.feedingPercentage,
      fluencyPercentage: psychometrics.fluencyPercentage,
      pragmaticPercentage: psychometrics.pragmaticPercentage,

      results: form.results,
      psychometrics,
      clinicalSummary: form.clinicalSummary || `تم إجراء تقييم إكلينيكي شامل للنطق والتواصل بمعدل إجمالي للمهارات بلغت %${psychometrics.overallAvgPercentage} ودقة مخارج الأصوات %${psychometrics.accuracyRate}. [${psychometrics.overallLevel}].`,
      recommendations: form.recommendations || `1. تحويل نقاط الضعف المحددة بالتقرير إلى أهداف سلوكية ضمن الخطة الفردية للبدء الفوري بالتدريب. \n2. تنفيذ تدريبات عضلات الفم وتعديل مخارج الأصوات باللعب والنمذجة.`,
      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث نتيجة تقييم النطق وعضلات الفم الشاملة بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', payload);
      toast('✅ تم حفظ وتقييد التقييم الشامل للطفل بنجاح', 'ok');
    }

    if (onSaved) onSaved(payload);
    onClose();
  }

  // Safe close confirmation
  const handleSafeClose = () => {
    if (totalAnswered > 0) {
      if (window.confirm(`⚠️ تنبيه: تم رصد إجابات لـ (${totalAnswered}) بنداً في سجل النطق ومخارج الحروف. هل أنت متأكد من رغبتك في الإغلاق دون حفظ التغييرات؟`)) {
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
    const text = `*تقرير سجل فحص وتقييم النطق ومخارج الحروف وعضلات الفم*\n\n` +
      `• *اسم الطالب:* ${form.studentName}\n` +
      `• *السن الزمني:* ${form.age || '—'}\n` +
      `• *المعدل الكلي للمهارات:* %${psychometrics.overallAvgPercentage}\n` +
      `• *دقة مخارج الأصوات الـ 28:* %${psychometrics.accuracyRate} (${psychometrics.phoneticCorrect} حرفاً سليماً)\n` +
      `• *كفاءة حركة الفم (OME):* %${psychometrics.omePercentage}\n` +
      `• *تناسق البلع والمضغ:* %${psychometrics.feedingPercentage}\n` +
      `• *الطلاقة والتلعثم:* %${psychometrics.fluencyPercentage}\n` +
      `• *التشخيص الإكلينيكي:* ${psychometrics.overallLevel}\n\n` +
      `*أخصائي التخاطب وعضلات الفم:* ${form.specialistName || form.examinerName || 'المشرف المعتمد'}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtered Arabic letters for phonetics tab
  const filteredLetters = useMemo(() => {
    if (letterFilter === 'all') return SPEECH_PHONETIC_ITEMS;
    return SPEECH_PHONETIC_ITEMS.filter(it => {
      const hasError = ['first', 'middle', 'last'].some(pos => {
        const val = form.results[`phone_${it.id}_${pos}`];
        return val && val !== 'correct' && val !== 'na';
      });
      if (letterFilter === 'errors_only') return hasError;
      if (letterFilter === 'correct_only') return !hasError;
      return true;
    });
  }, [letterFilter, form.results]);

  if (!isOpen) return null;

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
            background: 'linear-gradient(135deg, #0e7490 0%, #155e75 50%, #0891b2 100%)',
            color: '#fff',
            flexShrink: 0,
            gap: 12,
          }}
        >
          {/* Right Section: Icon & Title & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.8rem' }}>🗣️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                  سجل فحص وتقييم النطق ومخارج الحروف وعضلات الفم
                </h2>
                <span className="bdg" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  9 بروتوكولات تشخيصية • 28 حرفاً عربياً
                </span>
                <span className="bdg" style={{ background: '#ecfeff', color: '#0891b2', fontSize: '0.7rem', fontWeight: 800 }}>
                  تقييم نطق وتخاطب شامل
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="bdg" style={{ background: '#164e63', color: '#a5f3fc', fontSize: '0.68rem', fontWeight: 800 }}>
                  © {SPEECH_ARTICULATION_COPYRIGHT_INFO.publisher}
                </span>
                <span style={{ fontSize: '0.76rem', opacity: 0.95 }}>
                  فحص آلية الفم، البلع، مخارج الأصوات العربية الـ 28، والعمليات الفونولوجية والطلاقة
                </span>
              </div>
            </div>
          </div>

          {/* Left Section: Controls Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => setShowCopyrightDetails(s => !s)}
              style={{
                background: showCopyrightDetails ? '#fff' : 'rgba(255,255,255,0.2)',
                color: showCopyrightDetails ? '#0e7490' : '#fff',
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
              background: '#ecfeff',
              padding: '14px 20px',
              borderBottom: '2px solid #a5f3fc',
              fontSize: '0.82rem',
              color: '#155e75',
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> إشعار حقوق النشر والتوثيق الإكلينيكي لسجل فحص وتقييم النطق ومخارج الحروف:
            </div>

            <div
              style={{
                background: '#c5f6fa',
                border: '1px solid #a5f3fc',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#0e7490',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <div>
                  <strong>حقوق التقييم والمحتوى الإكلينيكي:</strong> {SPEECH_ARTICULATION_COPYRIGHT_INFO.measureNameAr} ({SPEECH_ARTICULATION_COPYRIGHT_INFO.measureNameEn}) — {SPEECH_ARTICULATION_COPYRIGHT_INFO.authorAr}.
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#fff', padding: '3px 8px', borderRadius: 6, border: '1px solid #67e8f9', fontWeight: 700 }}>
                {SPEECH_ARTICULATION_COPYRIGHT_INFO.publisher}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 8 }}>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a5f3fc' }}>
                <strong>اللجنة الإكلينيكية والمعدون:</strong> {SPEECH_ARTICULATION_COPYRIGHT_INFO.authorAr} ({SPEECH_ARTICULATION_COPYRIGHT_INFO.authorEn})
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a5f3fc' }}>
                <strong>الفئة العمرية المستهدفة:</strong> {SPEECH_ARTICULATION_COPYRIGHT_INFO.ageRange}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a5f3fc' }}>
                <strong>المنهجية والمعايير:</strong> {SPEECH_ARTICULATION_COPYRIGHT_INFO.normSamples}
              </div>
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #a5f3fc' }}>
                <strong>نظام الدرجات والترميز:</strong> {SPEECH_ARTICULATION_COPYRIGHT_INFO.scoringSystem}
              </div>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem', color: '#92400e' }}>
              <strong>⚠️ تنبيه إكلينيكي وتوجيه مهني:</strong> هذا السجل الرقمي مخصص لرصد الاستجابات وتحليل مخارج الأصوات وتحركات الفم والبلع. يُنصح بإجراء التقييم المباشر مع الطفل باستخدام مجسمات وكروت الصور التشخيصية المعيارية المعتمدة مع إتاحة الإضاءة الكافية لملاحظة عضلات الوجه والفم.
            </div>
          </div>
        )}

        {/* Real-time Multi-Domain Stat Strip */}
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
            {/* Overall Percentage */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #0e7490',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>المعدل الكلي للمهارات:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: psychometrics.overallColor }}>
                %{psychometrics.overallAvgPercentage}
              </span>
            </div>

            {/* Phonetic Accuracy Rate */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #0369a1',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>دقة مخارج الأصوات الـ 28:</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0369a1' }}>
                %{psychometrics.accuracyRate}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginRight: 4 }}>
                ({psychometrics.phoneticCorrect} حرفاً سليماً)
              </span>
            </div>

            {/* Oral Motor (OME) */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #15803d',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>حركة الفم OME:</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803d' }}>
                %{psychometrics.omePercentage}
              </span>
            </div>

            {/* Feeding & Swallowing */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #047857',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>البلع والمضغ:</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857' }}>
                %{psychometrics.feedingPercentage}
              </span>
            </div>

            {/* Fluency */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1.5px solid #0891b2',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>الطلاقة والتلعثم:</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0891b2' }}>
                %{psychometrics.fluencyPercentage}
              </span>
            </div>

            {/* Overall Clinical Classification */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1.5px solid ${psychometrics.overallColor}`,
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'block' }}>التشخيص الإكلينيكي العام:</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: psychometrics.overallColor }}>
                {psychometrics.overallLevel}
              </span>
            </div>
          </div>

          {/* Controls & Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 700 }}>محاكاة:</span>
              <button
                type="button"
                className="btn btn-xs btn-g"
                style={{ padding: '3px 8px', fontSize: '0.72rem', border: '1px solid #86efac' }}
                onClick={() => autoFillAnswers('correct')}
              >
                سليم كلياً ✓
              </button>
              <button
                type="button"
                className="btn btn-xs btn-s"
                style={{ padding: '3px 8px', fontSize: '0.72rem', background: '#ecfeff', color: '#0891b2', border: '1px solid #a5f3fc' }}
                onClick={() => autoFillAnswers('mild')}
              >
                صعوبات بسيطة 🟡
              </button>
              <button
                type="button"
                className="btn btn-xs btn-d"
                style={{ padding: '3px 8px', fontSize: '0.72rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
                onClick={() => autoFillAnswers('severe')}
              >
                صعوبات شديدة 🔴
              </button>
              <button
                type="button"
                className="btn btn-xs"
                style={{ padding: '3px 8px', fontSize: '0.72rem', background: 'var(--g0)', border: '1px solid var(--border-color)' }}
                onClick={() => autoFillAnswers('clear')}
              >
                تفريغ 🧹
              </button>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {totalAnswered} / 129 بنداً تم رصدها
              </div>
              <div style={{ background: 'var(--border-color)', height: 6, width: 110, borderRadius: 3, marginTop: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    background: completionPercentage === 100 ? '#059669' : '#0e7490',
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
          {/* 1. Demographics & Session Header (Collapsible + Manual Edit) */}
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
            {/* Header Top Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isHeaderCollapsed ? 'none' : '1px dashed var(--border-color)', paddingBottom: isHeaderCollapsed ? 0 : 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.9rem' }}>📋</span>
                <span style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-main)' }}>
                  بيانات الطفل المفحوص وتفاصيل جلسة التقييم والتشخيص
                </span>
                {form.studentName && (
                  <span className="bdg b-bl" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                    {form.studentName} ({form.age || 'غير محدد'})
                  </span>
                )}
                {form.diagnosis && (
                  <span className="bdg b-gr" style={{ fontSize: '0.7rem' }}>
                    {form.diagnosis}
                  </span>
                )}
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

            {/* 2-Row Form Content */}
            {!isHeaderCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
                {/* ROW 1: Student Selection, Manual Name, DOB/Age, Diagnosis, Assessment Date */}
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

                  {/* Manual Name */}
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
                        value={form.age || ''}
                        onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                        placeholder="العمر..."
                        disabled={!isManualEdit && !!form.dob}
                      />
                    </div>
                  </div>

                  {/* Medical / Developmental Diagnosis */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      التشخيص الطبي / التخاطبي
                    </label>
                    <input
                      type="text"
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.diagnosis || ''}
                      onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                      placeholder="لثغة، تأخر لغوي، حبسة، الشفة الأرنبية..."
                    />
                  </div>

                  {/* Assessment Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      تاريخ التقييم والفحص <span style={{ color: 'var(--danger)' }}>*</span>
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

                {/* ROW 2: Specialist Name, Respondent Name, Relationship, School/Center */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {/* Specialist / Examiner */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      أخصائي التخاطب وعضلات الفم / الفاحص
                    </label>
                    <input
                      type="text"
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.specialistName || form.examinerName}
                      onChange={e => setForm(f => ({ ...f, specialistName: e.target.value, examinerName: e.target.value }))}
                      placeholder="اسم الأخصائي القائم بالفحص..."
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

                  {/* Relationship */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      صلة القرابة / الصفة
                    </label>
                    <select
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.raterRelation}
                      onChange={e => setForm(f => ({ ...f, raterRelation: e.target.value }))}
                    >
                      <option value="ولي الأمر (الأم/الأب)">ولي الأمر (الأم/الأب)</option>
                      <option value="الأم">الأم</option>
                      <option value="الأب">الأب</option>
                      <option value="معلم التخاطب / الصف">معلم التخاطب / الصف</option>
                      <option value="الأخصائي المباشر">الأخصائي المباشر</option>
                      <option value="ملاحظة مباشرة">ملاحظة سريرية مباشرة</option>
                    </select>
                  </div>

                  {/* Center / School */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                      اسم المركز / الروضة / المدرسة
                    </label>
                    <input
                      type="text"
                      className="inp"
                      style={{ width: '100%', fontSize: '0.82rem', padding: '6px 8px' }}
                      value={form.school}
                      onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                      placeholder="مركز الرعاية والتأهيل..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TAB NAVIGATION WORKSPACE */}
          <div style={{ display: 'flex', gap: 6, borderBottom: '2px solid var(--border-color)', paddingBottom: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`tab ${activeTab === 'oral_motor_feeding' ? 'on' : ''}`}
              onClick={() => setActiveTab('oral_motor_feeding')}
              style={{ padding: '10px 16px', fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>🦷</span> 1. أعضاء النطق والبلع (OME)
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'phonetic_phonology' ? 'on' : ''}`}
              onClick={() => setActiveTab('phonetic_phonology')}
              style={{ padding: '10px 16px', fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>🗣️</span> 2. مخارج الحروف والعمليات الفونولوجية
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'fluency_voice' ? 'on' : ''}`}
              onClick={() => setActiveTab('fluency_voice')}
              style={{ padding: '10px 16px', fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>🎵</span> 3. الطلاقة والصوت والرنين
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'pragmatics_aac' ? 'on' : ''}`}
              onClick={() => setActiveTab('pragmatics_aac')}
              style={{ padding: '10px 16px', fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>💬</span> 4. التواصل الاجتماعي وبدائل (AAC)
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'summary_iep' ? 'on' : ''}`}
              onClick={() => setActiveTab('summary_iep')}
              style={{
                padding: '10px 16px',
                fontSize: '0.86rem',
                fontWeight: 700,
                background: 'rgba(14, 116, 144, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>✨</span> 5. التقرير ومستخلص أهداف الـ IEP
            </button>
          </div>

          {/* TAB 1: Oral Motor (OME) & Pediatric Swallowing */}
          {activeTab === 'oral_motor_feeding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* OME Checklist Section */}
              <div>
                <div style={{ borderRight: '4px solid #0e7490', background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
                  <strong style={{ fontSize: '0.92rem', color: '#155e75', display: 'block' }}>
                    🦷 بروتوكول فحص آلية الفم وأعضاء الكلام (Oral Mechanism Examination Checklist - OME)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    التقييم التشريحي والوظيفي لسلامة الشفاه، اللسان، الفك، سقف الحلق، شراع الحنك واللعاب.
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                  {SPEECH_ORAL_MOTOR_ITEMS.map(it => {
                    const val = form.results[`oral_${it.id}`];
                    return (
                      <div
                        key={it.id}
                        style={{
                          background: 'var(--bg-card)',
                          padding: '14px',
                          borderRadius: 12,
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'space-between',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                            {it.name}
                          </span>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                            {it.description}
                          </p>
                        </div>
                        <select
                          value={val !== undefined && val !== null ? val : ''}
                          onChange={e => updateResultValue(`oral_${it.id}`, e.target.value === '' ? null : Number(e.target.value))}
                          style={{
                            padding: '8px 12px',
                            fontSize: '0.82rem',
                            borderRadius: 8,
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            width: '100%',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          <option value="">— اختر التقييم السريري —</option>
                          {it.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label} ({opt.value} درجات)
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feeding & Swallowing Checklist Section */}
              <div>
                <div style={{ borderRight: '4px solid #059669', background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
                  <strong style={{ fontSize: '0.92rem', color: '#047857', display: 'block' }}>
                    🍲 بروتوكول فحص بلع ومضغ الأغذية (Pediatric Feeding & Swallowing Protocol)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    ملاحظة سريرية وتنسيق البلع مع التنفس للأغذية الصلبة والمهروسة ورشف السوائل مع رصد منعكس الكحة الواقي.
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                  {FEEDING_SWALLOWING_ITEMS.map(it => {
                    const val = form.results[`feeding_${it.id}`];
                    return (
                      <div
                        key={it.id}
                        style={{
                          background: 'var(--bg-card)',
                          padding: '14px',
                          borderRadius: 12,
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'space-between',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                            {it.name}
                          </span>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                            {it.description}
                          </p>
                        </div>
                        <select
                          value={val !== undefined && val !== null ? val : ''}
                          onChange={e => updateResultValue(`feeding_${it.id}`, e.target.value === '' ? null : Number(e.target.value))}
                          style={{
                            padding: '8px 12px',
                            fontSize: '0.82rem',
                            borderRadius: 8,
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            width: '100%',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          <option value="">— اختر التقييم السريري —</option>
                          {it.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label} ({opt.value} درجات)
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Articulation Grid (28 Arabic Letters) & Phonological Processes */}
          {activeTab === 'phonetic_phonology' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Articulation Matrix Banner & Controls */}
              <div>
                <div
                  style={{
                    background: 'var(--g0)',
                    padding: '12px 18px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    color: 'var(--text-sub)',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                    borderRight: '4px solid #0e7490',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#155e75', display: 'block' }}>
                      🗣️ جدول تحليل مخارج الحروف الـ 28 العربية المعتمد:
                    </strong>
                    <span>اختبر الحرف في المواضع الثلاثة (أول، وسط، آخر الكلمة)، وسجل نوع الخطأ (سليم، حذف، إبدال، تشويه).</span>
                  </div>

                  {/* Filter & Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Letter Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-card)', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>عرض:</span>
                      <button
                        type="button"
                        className="btn btn-xs"
                        style={{ padding: '2px 6px', fontSize: '0.72rem', background: letterFilter === 'all' ? '#0e7490' : 'transparent', color: letterFilter === 'all' ? '#fff' : 'var(--text-main)', border: 'none' }}
                        onClick={() => setLetterFilter('all')}
                      >
                        الكل ({SPEECH_PHONETIC_ITEMS.length})
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs"
                        style={{ padding: '2px 6px', fontSize: '0.72rem', background: letterFilter === 'errors_only' ? '#ef4444' : 'transparent', color: letterFilter === 'errors_only' ? '#fff' : 'var(--text-main)', border: 'none' }}
                        onClick={() => setLetterFilter('errors_only')}
                      >
                        الأخطاء فقط
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs"
                        style={{ padding: '2px 6px', fontSize: '0.72rem', background: letterFilter === 'correct_only' ? '#10b981' : 'transparent', color: letterFilter === 'correct_only' ? '#fff' : 'var(--text-main)', border: 'none' }}
                        onClick={() => setLetterFilter('correct_only')}
                      >
                        السليمة فقط
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-xs btn-g"
                      onClick={markAllLettersAsCorrect}
                      style={{ padding: '4px 8px', fontSize: '0.74rem', border: '1px solid #86efac' }}
                    >
                      تسجيل الكل سليم ✓
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs"
                      onClick={clearPhoneticMatrix}
                      style={{ padding: '4px 8px', fontSize: '0.74rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                    >
                      تفريغ الجدول 🧹
                    </button>
                  </div>
                </div>

                {/* Color Legend */}
                <div style={{ display: 'flex', gap: 12, fontSize: '0.74rem', fontWeight: 700, marginTop: 8, padding: '0 4px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></span>سليم (0 خطأ)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span>حذف (Omission)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span>إبدال (Substitution)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308' }}></span>تشويه (Distortion)
                  </span>
                </div>

                {/* Vertical list of 28 Arabic Letters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {filteredLetters.map(it => (
                    <div
                      key={it.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '90px 120px repeat(3, 1fr)',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 16px',
                        borderRadius: 10,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {/* Character Bubble */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            width: 36,
                            height: 36,
                            background: '#ecfeff',
                            color: '#0891b2',
                            borderRadius: '50%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '1.25rem',
                            border: '1px solid #a5f3fc',
                          }}
                        >
                          {it.letter}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700 }}>{it.name}</span>
                      </div>

                      {/* Phonetical Type Tag */}
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: '#0e7490',
                          background: '#ecfeff',
                          border: '1px solid #a5f3fc',
                          padding: '3px 8px',
                          borderRadius: 8,
                          textAlign: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {it.type}
                      </div>

                      {/* 3 positions */}
                      {['first', 'middle', 'last'].map(pos => {
                        const key = `phone_${it.id}_${pos}`;
                        const currentStatus = form.results[key] || 'na';
                        const subVal = form.results[`${key}_sub`] || '';

                        const wordLabel = pos === 'first' ? 'أول' : pos === 'middle' ? 'وسط' : 'آخر';
                        const sampleWord = it.words?.[pos] || '';

                        return (
                          <div key={pos} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                              <span style={{ color: 'var(--text-sub)' }}>
                                {wordLabel}: <b style={{ color: 'var(--text-main)' }}>{sampleWord}</b>
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: 2 }}>
                              <button
                                type="button"
                                style={{
                                  flex: 1,
                                  fontSize: '0.72rem',
                                  padding: '4px 2px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  cursor: 'pointer',
                                  background: currentStatus === 'correct' ? '#10b981' : 'var(--bg-card)',
                                  color: currentStatus === 'correct' ? '#fff' : 'var(--text-sub)',
                                  fontWeight: currentStatus === 'correct' ? 700 : 400,
                                }}
                                onClick={() => updateResultValue(key, 'correct')}
                              >
                                سليم
                              </button>

                              <button
                                type="button"
                                style={{
                                  flex: 1,
                                  fontSize: '0.72rem',
                                  padding: '4px 2px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  cursor: 'pointer',
                                  background: currentStatus === 'omission' ? '#ef4444' : 'var(--bg-card)',
                                  color: currentStatus === 'omission' ? '#fff' : 'var(--text-sub)',
                                  fontWeight: currentStatus === 'omission' ? 700 : 400,
                                }}
                                onClick={() => updateResultValue(key, 'omission')}
                              >
                                حذف
                              </button>

                              <button
                                type="button"
                                style={{
                                  flex: 1,
                                  fontSize: '0.72rem',
                                  padding: '4px 2px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  cursor: 'pointer',
                                  background: currentStatus === 'substitution' ? '#f59e0b' : 'var(--bg-card)',
                                  color: currentStatus === 'substitution' ? '#fff' : 'var(--text-sub)',
                                  fontWeight: currentStatus === 'substitution' ? 700 : 400,
                                }}
                                onClick={() => updateResultValue(key, 'substitution')}
                              >
                                إبدال
                              </button>

                              <button
                                type="button"
                                style={{
                                  flex: 1,
                                  fontSize: '0.72rem',
                                  padding: '4px 2px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  cursor: 'pointer',
                                  background: currentStatus === 'distortion' ? '#eab308' : 'var(--bg-card)',
                                  color: currentStatus === 'distortion' ? '#fff' : 'var(--text-sub)',
                                  fontWeight: currentStatus === 'distortion' ? 700 : 400,
                                }}
                                onClick={() => updateResultValue(key, 'distortion')}
                              >
                                تشويه
                              </button>

                              <button
                                type="button"
                                style={{
                                  padding: '4px 6px',
                                  fontSize: '0.72rem',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                  cursor: 'pointer',
                                  background: currentStatus === 'na' ? 'var(--g0)' : 'var(--bg-card)',
                                  color: 'var(--text-sub)',
                                }}
                                onClick={() => updateResultValue(key, 'na')}
                              >
                                -
                              </button>
                            </div>

                            {/* Inner input for substitution character */}
                            {currentStatus === 'substitution' && (
                              <input
                                type="text"
                                placeholder="الحرف البديل..."
                                style={{
                                  padding: '3px 6px',
                                  fontSize: '0.7rem',
                                  height: '24px',
                                  border: '1px solid #f59e0b',
                                  borderRadius: '4px',
                                  background: 'var(--bg-card)',
                                  textAlign: 'center',
                                }}
                                value={subVal}
                                onChange={e => updateResultValue(`${key}_sub`, e.target.value)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Phonological Processes Section */}
              <div>
                <div style={{ borderRight: '4px solid #8b5cf6', background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
                  <strong style={{ fontSize: '0.92rem', color: '#6d28d9', display: 'block' }}>
                    📈 استمارة رصد وتبسيط العمليات الفونولوجية (Phonological Processes Analysis)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    قياس تكرار عمليات التبسيط الصوتي النمائية وغير النمائية (مثل تقديم الأصوات الخلفية، تحويل الاحتكاكية لانفجارية).
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PHONOLOGICAL_PROCESSES_ITEMS.map(it => {
                    const val = form.results[`phone_proc_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                          {it.name}
                        </span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {it.options.map(opt => (
                            <label
                              key={opt.value}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                padding: '8px 10px',
                                border: '1px solid var(--border-color)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: val === opt.value ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                                fontSize: '0.78rem',
                                fontWeight: val === opt.value ? 700 : 400,
                              }}
                            >
                              <input
                                type="radio"
                                name={`phone_proc_${it.id}`}
                                checked={val === opt.value}
                                onChange={() => updateResultValue(`phone_proc_${it.id}`, opt.value)}
                                style={{ marginTop: 2 }}
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Fluency, Voice & Resonance Screening */}
          {activeTab === 'fluency_voice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Detailed Fluency / Stuttering Section */}
              <div>
                <div style={{ borderRight: '4px solid #06b6d4', background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
                  <strong style={{ fontSize: '0.92rem', color: '#0891b2', display: 'block' }}>
                    📈 بروتوكول فحص التلعثم والطلاقة الكلامية وسلوكات التخلص الثانوية
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    تسجيل مظاهر التلعثم الأساسية (تكرار، إطالة، حبس الهواء) ومظاهر التخلص الحركية والنفسية الثانوية.
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {STUTTERING_FLUENCY_ITEMS.map(it => {
                    const val = form.results[`fluency_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{it.name}</span>
                          <span
                            className="bdg"
                            style={{
                              background: it.type === 'core' ? '#ecfeff' : '#fef2f2',
                              color: it.type === 'core' ? '#0891b2' : '#991b1b',
                              fontSize: '0.7rem',
                            }}
                          >
                            {it.type === 'core' ? 'سلوك أساسي' : 'سلوك تخلص ثانوي'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {it.options.map(opt => (
                            <label
                              key={opt.value}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                padding: '8px 10px',
                                border: '1px solid var(--border-color)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: val === opt.value ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                                fontSize: '0.78rem',
                                fontWeight: val === opt.value ? 700 : 400,
                              }}
                            >
                              <input
                                type="radio"
                                name={`fluency_${it.id}`}
                                checked={val === opt.value}
                                onChange={() => updateResultValue(`fluency_${it.id}`, opt.value)}
                                style={{ marginTop: 2 }}
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resonance & Nasality Screening */}
              <div>
                <div style={{ borderRight: '4px solid #0284c7', background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
                  <strong style={{ fontSize: '0.92rem', color: '#0369a1', display: 'block' }}>
                    🌬️ بروتوكول فحص الخنف والرنين الصوتي وضغط الهواء (Resonance)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    فحص الخنف المفتوح والمغلق عبر رنين أصوات الغنة (م، ن) مع اختبارات سد وفتح الأنف وضغط الهواء الفمي.
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                  {RESONANCE_NASALITY_ITEMS.map(it => {
                    const val = form.results[`resonance_${it.id}`];
                    return (
                      <div
                        key={it.id}
                        style={{
                          background: 'var(--bg-card)',
                          padding: '14px',
                          borderRadius: 12,
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'space-between',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                            {it.name}
                          </span>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        </div>
                        <select
                          value={val !== undefined && val !== null ? val : ''}
                          onChange={e => updateResultValue(`resonance_${it.id}`, e.target.value === '' ? null : Number(e.target.value))}
                          style={{
                            padding: '8px 12px',
                            fontSize: '0.82rem',
                            borderRadius: 8,
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            width: '100%',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          <option value="">— اختر التقييم السريري —</option>
                          {it.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label} ({opt.value} درجات)
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CAPE-V Adapted Voice Screening */}
              <div>
                <div style={{ borderRight: '4px solid #8b5cf6', background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
                  <strong style={{ fontSize: '0.92rem', color: '#6d28d9', display: 'block' }}>
                    🎙️ بروتوكول التقييم الإدراكي لنبرة وجودة الصوت (CAPE-V Adapted)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    تقدير بحة الصوت، والخشونة، وتسرب الهواء والجهد الحنجري المفرط مع تلاؤم طبقة وعلو الصوت اجتماعياً.
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CAPEV_VOICE_ITEMS.map(it => {
                    const val = form.results[`voice_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                          {it.name}
                        </span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {it.options.map(opt => (
                            <label
                              key={opt.value}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                padding: '8px 10px',
                                border: '1px solid var(--border-color)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: val === opt.value ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                                fontSize: '0.78rem',
                                fontWeight: val === opt.value ? 700 : 400,
                              }}
                            >
                              <input
                                type="radio"
                                name={`voice_${it.id}`}
                                checked={val === opt.value}
                                onChange={() => updateResultValue(`voice_${it.id}`, opt.value)}
                                style={{ marginTop: 2 }}
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Pragmatics (Social Language) & AAC Readiness */}
          {activeTab === 'pragmatics_aac' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Pragmatic social language screening */}
              <div>
                <div style={{ borderRight: '4px solid #ec4899', background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
                  <strong style={{ fontSize: '0.92rem', color: '#be185d', display: 'block' }}>
                    💬 استمارة فحص الجانب البراجماتي والاستخدام الاجتماعي للغة (Pragmatic Checklist)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    فحص التواصل البصري، تبادل أدوار التحدث، البقاء في موضوع الحديث، وبدء وإنهاء الحوار اجتماعيّاً.
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PRAGMATIC_ITEMS.map(it => {
                    const val = form.results[`pragmatic_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                          {it.name}
                        </span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {it.options.map(opt => (
                            <label
                              key={opt.value}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                padding: '8px 10px',
                                border: '1px solid var(--border-color)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: val === opt.value ? 'rgba(236, 72, 153, 0.08)' : 'transparent',
                                fontSize: '0.78rem',
                                fontWeight: val === opt.value ? 700 : 400,
                              }}
                            >
                              <input
                                type="radio"
                                name={`pragmatic_${it.id}`}
                                checked={val === opt.value}
                                onChange={() => updateResultValue(`pragmatic_${it.id}`, opt.value)}
                                style={{ marginTop: 2 }}
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AAC Readiness for non-verbal children */}
              <div>
                <div style={{ borderRight: '4px solid #f97316', background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
                  <strong style={{ fontSize: '0.92rem', color: '#c2410c', display: 'block' }}>
                    📱 استمارة تقييم جاهزية وسائل التواصل المعزز والبديل للأطفال غير الناطقين (AAC Readiness)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    تحديد مؤهلات الطفل الحركية والبصرية والإدراكية لاستخدام لوحات التواصل أو أجهزة توليد الكلام (PECS).
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {AAC_READINESS_ITEMS.map(it => {
                    const val = form.results[`aac_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                          {it.name}
                        </span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {it.options.map(opt => (
                            <label
                              key={opt.value}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                padding: '8px 10px',
                                border: '1px solid var(--border-color)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: val === opt.value ? 'rgba(249, 115, 22, 0.08)' : 'transparent',
                                fontSize: '0.78rem',
                                fontWeight: val === opt.value ? 700 : 400,
                              }}
                            >
                              <input
                                type="radio"
                                name={`aac_${it.id}`}
                                checked={val === opt.value}
                                onChange={() => updateResultValue(`aac_${it.id}`, opt.value)}
                                style={{ marginTop: 2 }}
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Clinical Report & IEP Goal Workspace */}
          {activeTab === 'summary_iep' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Trigger Narrative Action Block */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.05) 0%, rgba(14, 116, 144, 0.15) 100%)',
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '1px solid rgba(14, 116, 144, 0.2)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 14,
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.96rem', color: '#0e7490', display: 'block', marginBottom: 2 }}>
                    🤖 توليد التقرير الأكاديمي والتحليل السريري للـ IEP
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    سيقوم النظام بتحليل كافة الاستجابات وملاحظات مخارج الحروف وعضلات الفم وصياغة التقرير الإكلينيكي فوراً.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)',
                    color: '#fff',
                    fontWeight: 800,
                    padding: '10px 18px',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(14,116,144,0.2)',
                  }}
                  onClick={generateClinicalReport}
                >
                  ✨ توليد التقرير والتوصيات تلقائياً
                </button>
              </div>

              {/* Textareas for Report Editing */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', gap: 6 }}>
                    <span>📄 التقرير السريري والتوصيف التشخيصي التفصيلي</span>
                  </label>
                  <textarea
                    value={form.clinicalSummary}
                    onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                    rows={8}
                    style={{
                      fontSize: '0.84rem',
                      fontFamily: 'monospace',
                      direction: 'rtl',
                      lineHeight: 1.6,
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 10,
                      background: 'var(--bg-input)',
                    }}
                    placeholder="اضغط على زر التوليد التلقائي بالأعلى، أو اكتب تقرير التشخيص يدوياً هنا..."
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    🎯 نقاط الضعف المرصودة والاحتياجات الأساسية للـ IEP
                  </label>
                  <textarea
                    value={form.recommendations}
                    onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                    rows={8}
                    style={{
                      fontSize: '0.84rem',
                      lineHeight: 1.6,
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 10,
                      background: 'var(--bg-input)',
                    }}
                    placeholder="سيتم تفريغ نقاط الضعف المكتشفة من البنود هنا تلقائياً..."
                  />
                </div>
              </div>

              {/* DYNAMIC IEP GOALS WORKSPACE */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '18px 20px', marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0e7490', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🚀 محطة صياغة وتصدير أهداف الخطة الفردية (IEP Goals Generator)</span>
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '2px 0 0 0' }}>
                      الأهداف السلوكية التالية مشتقة إكلينيكياً من عضلات النطق، البلع، مخارج الحروف، الطلاقة والبراجماتية التي سجلت بها عجزاً.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn"
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      padding: '6px 14px',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    onClick={handleExportGoalsToIep}
                  >
                    📥 تصدير الأهداف المحددة للـ IEP
                  </button>
                </div>

                {psychometrics.generatedIepGoals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                    💡 لا توجد أهداف توليدية متاحة. (تظهر الأهداف فقط عند تسجيل خلل أو صعوبة في أي بند من البنود الفوقية بالخطوات 1 إلى 4).
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {psychometrics.generatedIepGoals.map(g => {
                      const isChecked = selectedGoals[g.id] !== false;
                      const editedText = editedGoalTexts[g.id] || g.goal;

                      return (
                        <div
                          key={g.id}
                          style={{
                            display: 'flex',
                            gap: 12,
                            padding: '12px 14px',
                            borderRadius: 10,
                            background: isChecked ? 'rgba(5, 150, 105, 0.02)' : 'var(--g0)',
                            border: isChecked ? '1px solid rgba(5, 150, 105, 0.15)' : '1px solid var(--border-color)',
                            transition: 'all 0.2s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => setSelectedGoals(prev => ({ ...prev, [g.id]: e.target.checked }))}
                            style={{ width: 18, height: 18, marginTop: 4, cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.82rem', color: '#0e7490' }}>📌 [ {g.domain} ]</strong>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                                القصور المرصود: <span style={{ color: '#b91c1c', fontWeight: 700 }}>{g.weakness}</span>
                              </span>
                            </div>

                            {isChecked ? (
                              <textarea
                                value={editedText}
                                onChange={e => setEditedGoalTexts(prev => ({ ...prev, [g.id]: e.target.value }))}
                                rows={2}
                                style={{
                                  fontSize: '0.82rem',
                                  width: '100%',
                                  padding: '6px 8px',
                                  borderRadius: 6,
                                  border: '1px solid #059669',
                                  background: 'var(--bg-card)',
                                  lineHeight: 1.5,
                                  fontFamily: 'sans-serif',
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)', textDecoration: 'line-through' }}>{editedText}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* General Specialist Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 800 }}>✍️ ملاحظات الفاحص الإضافية</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  style={{
                    fontSize: '0.84rem',
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    background: 'var(--bg-input)',
                  }}
                  placeholder="ملاحظات حول دافعية الطفل، تجاوبه، أثر الإجهاد، أو ظروف الجلسة..."
                />
              </div>

              {/* Share & Print Toolbar */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={handleShareWhatsApp}
                  style={{
                    background: '#25D366',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    padding: '8px 14px',
                    borderRadius: 8,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>💬</span> مشاركة عبر الواتساب
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handlePrint}
                  style={{
                    background: 'var(--g0)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    padding: '8px 14px',
                    borderRadius: 8,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>🖨️</span> طباعة التقرير
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons Footer */}
        <div
          className="fa"
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            gap: 10,
            background: 'var(--g0)',
          }}
        >
          <button type="button" className="btn btn-g" onClick={handleSafeClose} style={{ fontWeight: 800, padding: '8px 16px' }}>
            إلغاء
          </button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {activeTab !== 'summary_iep' ? (
              <button
                type="button"
                className="btn btn-p"
                style={{ fontWeight: 800, padding: '8px 18px', background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)' }}
                onClick={() => {
                  if (activeTab === 'oral_motor_feeding') setActiveTab('phonetic_phonology');
                  else if (activeTab === 'phonetic_phonology') setActiveTab('fluency_voice');
                  else if (activeTab === 'fluency_voice') setActiveTab('pragmatics_aac');
                  else if (activeTab === 'pragmatics_aac') setActiveTab('summary_iep');
                }}
              >
                البروتوكول التالي ⬅
              </button>
            ) : null}

            <button
              type="button"
              className="btn btn-p"
              onClick={handleSave}
              style={{ fontWeight: 800, padding: '8px 20px', background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)' }}
            >
              💾 حفظ وتقييد التقييم بالكامل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
