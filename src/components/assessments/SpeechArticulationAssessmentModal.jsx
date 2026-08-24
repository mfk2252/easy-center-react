import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { uid, todayStr } from '../../utils/dateHelpers';
import { lsAdd, lsUpd, lsGet } from '../../hooks/useStorage';
import {
  SPEECH_ORAL_MOTOR_ITEMS,
  FEEDING_SWALLOWING_ITEMS,
  SPEECH_PHONETIC_ITEMS,
  PHONOLOGICAL_PROCESSES_ITEMS,
  STUTTERING_FLUENCY_ITEMS,
  RESONANCE_NASALITY_ITEMS,
  CAPEV_VOICE_ITEMS,
  PRAGMATIC_ITEMS,
  AAC_READINESS_ITEMS,
  calculateSpeechScreeningPsychometrics
} from '../../data/speechArticulationData';
import { StudentPicker, validateStudentPick } from '../../pages/ProgramsReports/StudentPicker';

const EMPTY_SPEECH_FORM = {
  mode: 'select',
  stuId: '',
  studentName: '',
  dob: '',
  age: '',
  diagnosis: '',
  specialistName: '',
  date: todayStr(),
  notes: '',
  results: {}, // Stores responses for all 9 protocols
  clinicalSummary: '',
  recommendations: '',
  exportedGoals: [] // List of exported goals to IEP
};

export default function SpeechArticulationAssessmentModal({
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
        ...EMPTY_SPEECH_FORM,
        ...initialData,
        results: initialData.results || initialData.scores || {},
        exportedGoals: initialData.exportedGoals || []
      };
    }
    return {
      ...EMPTY_SPEECH_FORM,
      specialistName: currentUser?.name || '',
      date: todayStr(),
    };
  });

  const [activeTab, setActiveTab] = useState('oral_motor_feeding'); 
  // 'oral_motor_feeding' | 'phonetic_phonology' | 'fluency_voice' | 'pragmatics_aac' | 'summary_iep'

  // Dynamic state to hold user edits on generated IEP goals before exporting
  const [selectedGoals, setSelectedGoals] = useState({}); // { [goalId]: boolean }
  const [editedGoalTexts, setEditedGoalTexts] = useState({}); // { [goalId]: text }

  // Clinical calculation engine
  const psychometrics = useMemo(() => {
    return calculateSpeechScreeningPsychometrics(form.results);
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

  if (!isOpen) return null;

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
    const results = {
      studentName: form.studentName,
    };

    // 1. OME Fill
    SPEECH_ORAL_MOTOR_ITEMS.forEach(it => {
      results[`oral_${it.id}`] = preset === 'correct' ? 3 : preset === 'mild' ? 2 : 1;
    });
    if (preset === 'severe') {
      results['oral_drooling'] = 0; // Severe drooling
      results['oral_tongue'] = 1; // Significant tongue movement limitation
    }

    // 2. Feeding Fill
    FEEDING_SWALLOWING_ITEMS.forEach(it => {
      results[`feeding_${it.id}`] = preset === 'correct' ? 3 : preset === 'mild' ? 2 : 1;
    });
    if (preset === 'severe') {
      results['feeding_cough_reflex'] = 0; // Dangerous choking reflex
    }

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
          if (it.id === 'let_raa' || it.id === 'let_laam' || it.id === 'let_kaaf') {
            results[key] = 'substitution';
            results[`${key}_sub`] = 'ي';
          } else if (it.id === 'let_seen' || it.id === 'let_saad' || it.id === 'let_sheen') {
            results[key] = 'distortion';
          } else if (it.id === 'let_thaa' || it.id === 'let_thaal' || it.id === 'let_zaa_m') {
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
    toast(`⚡ تم تعبئة كافة البروتوكولات التسعة بنمط: ${preset === 'correct' ? 'طبيعي/سليم' : preset === 'mild' ? 'صعوبات بسيطة' : 'صعوبات شديدة'}`, 'ok');
  }

  // Generates complete clinical reports and recomendations
  function generateClinicalReport() {
    if (!form.studentName) {
      toast('⚠️ يرجى اختيار الطالب أولاً لتوليد التقرير المخصص باسمه', 'er');
      return;
    }

    const reportNarrative = `🎯 تقرير التقييم الإكلينيكي الشامل للنطق واللغة والتواصل وعضلات الفم
----------------------------------------------------------------------
اسم الطالب: ${form.studentName || '—'}
العمر الزمني: ${form.age || '—'}
تاريخ الفحص والتقييم: ${form.date}
الأخصائي القائم بالتشخيص: ${form.specialistName || '—'}

الخلاصة الإكلينيكية والتشخيصية التفصيلية:
${psychometrics.clinicalImpression}

----------------------------------------------------------------------
توصيات إكلينيكية وعلاجية مخصصة للطفل:
1. إدراج الطفل في برنامج علاجي فردي مخصص لأمراض النطق والتخاطب بمعدل (2-3) جلسات أسبوعياً.
2. التركيز الفوري على الأهداف السلوكية المختارة في محطة الـ IEP لتطوير كفاءة حركة الفم وتناسق البلع ومخارج النطق الفونيمية.
3. التنسيق الدائم مع طبيب الأسنان/البلع عند وجود مبرر عضوي (مثل رابط لسان معيق أو عضة مفتوحة شديدة).
4. تعميم الأصوات والمهارات المكتسبة ببيئة الصف والمنزل لتعزيز التفاعل الاجتماعي والبراجماتي الطبيعي.`;

    const distinctWeaknesses = psychometrics.weaknesses.map((w, idx) => `${idx + 1}. [${w.domain}] ${w.item} (الحالة: ${w.val === 0 ? 'خلل حاد' : w.val === 1 ? 'خلل متوسط' : w.val === 2 ? 'قصور بسيط' : w.val})`).join('\n');

    setForm(f => ({
      ...f,
      clinicalSummary: reportNarrative,
      recommendations: distinctWeaknesses || '• لا توجد نقاط ضعف أو احتياجات علاجية مرصودة حالياً.'
    }));

    toast('✨ تم توليد التقرير السردي الفاخر وتوصيات الـ IEP تلقائياً', 'ok');
  }

  // Exports selected behavioral goals to student's IEP active plans (progPrograms)
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
        domain: 'speech',
        domainLabel: 'النطق واللغة والتواصل',
        source: 'Speech & Oral-Motor Screening Suite',
        status: 'active',
        createdAt: new Date().toISOString()
      }));

    if (goalsToExport.length === 0) {
      toast('⚠️ يرجى تفعيل أو تحديد هدف واحد على الأقل للتصدير', 'er');
      return;
    }

    // Read the current programs database table (progPrograms)
    const existingPrograms = lsGet('progPrograms') || [];
    
    // Check if the student already has an active program (IEP)
    let studentProgram = existingPrograms.find(p => p.stuId === form.stuId && p.status === 'active');

    if (studentProgram) {
      // Append goals to existing active program
      studentProgram.goals = [...(studentProgram.goals || []), ...goalsToExport];
      lsUpd('progPrograms', studentProgram.id, studentProgram);
    } else {
      // Create a brand new active program for this student
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
        notes: 'تم توليد وتصدير أهداف هذا البرنامج تلقائياً من وحدة تقييمات وفحوصات النطق واللغة وعضلات الفم الشاملة.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      existingPrograms.push(newProgram);
      localStorage.setItem('progPrograms', JSON.stringify(existingPrograms));
    }

    // Save exported goals state on the form to preserve history
    setForm(f => ({
      ...f,
      exportedGoals: [...(f.exportedGoals || []), ...goalsToExport.map(g => g.text)]
    }));

    toast(`📥 تم تصدير عدد (${goalsToExport.length}) هدفاً سلوكياً قابلاً للقياس بنجاح إلى برنامج الـ IEP للطالب!`, 'ok');
  }

  // Unified save handler
  function handleSave() {
    if (!validateStudentPick(form)) {
      toast('⚠️ يرجى اختيار الطالب أولاً لحفظ المقياس', 'er');
      return;
    }

    const payload = {
      ...form,
      measureId: 'speech_screening',
      measureName: 'تقييم النطق واللغة والتواصل وعضلات الفم الشامل',
      scaleType: 'speech_screening',
      score: psychometrics.phoneticCorrect,
      maxScore: psychometrics.phoneticTested || 1, 
      percentage: `${psychometrics.overallAvgPercentage}%`,
      level: psychometrics.overallLevel,
      severityColor: psychometrics.overallColor,
      results: form.results,
      updatedAt: new Date().toISOString(),
    };

    if (initialData?.id) {
      lsUpd('studentAssessments', initialData.id, payload);
      toast('✅ تم تحديث نتيجة تقييم النطق وعضلات الفم الشاملة بنجاح', 'ok');
    } else {
      lsAdd('studentAssessments', { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ وتقييد التقييم الشامل للطفل بنجاح', 'ok');
    }

    onSaved();
    onClose();
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-xl">
        
        {/* Modal Main Banner Header */}
        <div className="fhd modal-header-custom" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)', color: '#fff', flexShrink: 0, gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '1.12rem', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              🗣️ وحدة فحص وتقييم النطق واللغة والبلع وعضلات الفم الشاملة
            </h2>
            <span style={{ fontSize: '0.74rem', opacity: 0.9, display: 'block', marginTop: 2 }}>
              حركة الفم، البلع، مخارج الحروف، الطلاقة، الصوت، والرنين والتواصل الاجتماعي للـ IEP
            </span>
          </div>
          <button type="button" className="btn btn-xs" onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700 }}>✖ إغلاق</button>
        </div>

        {/* Real-time Multi-Domain Stat Strip */}
        <div className="modal-subbar" style={{ background: 'var(--g0)', padding: '10px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'block' }}>المعدل الكلي للمهارات:</span>
              <strong style={{ fontSize: '1.1rem', color: '#0e7490' }}>{psychometrics.overallAvgPercentage}%</strong>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'block' }}>التقييم الإجمالي العام:</span>
              <strong style={{ fontSize: '0.85rem', color: psychometrics.overallColor }}>{psychometrics.overallLevel}</strong>
            </div>

            {/* Micro badges for quick clinical diagnostics */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="bdg" style={{ background: '#f0fdf4', color: '#15803d', fontSize: '0.72rem', border: '1px solid #bbf7d0' }}>
                🧠 حركة الفم: {psychometrics.omePercentage}%
              </span>
              <span className="bdg" style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.72rem', border: '1px solid #a7f3d0' }}>
                🍲 البلع والمضغ: {psychometrics.feedingPercentage}%
              </span>
              <span className="bdg" style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '0.72rem', border: '1px solid #bae6fd' }}>
                🗣️ الحروف: {psychometrics.accuracyRate}%
              </span>
              <span className="bdg" style={{ background: '#ecfeff', color: '#0891b2', fontSize: '0.72rem', border: '1px solid #c5f6fa' }}>
                📈 الطلاقة: {psychometrics.fluencyPercentage}%
              </span>
              <span className="bdg" style={{ background: '#fdf2f8', color: '#be185d', fontSize: '0.72rem', border: '1px solid #fbcfe8' }}>
                💬 الاجتماعي: {psychometrics.pragmaticPercentage}%
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700 }}>محاكاة الحالة:</span>
            <button type="button" className="btn btn-xs btn-g" style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid #86efac' }} onClick={() => autoFillAnswers('correct')}>سليم كلياً ✓</button>
            <button type="button" className="btn btn-xs btn-s" style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }} onClick={() => autoFillAnswers('mild')}>صعوبات بسيطة 🟡</button>
            <button type="button" className="btn btn-xs btn-d" style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }} onClick={() => autoFillAnswers('severe')}>صعوبات شديدة 🔴</button>
          </div>
        </div>

        {/* Workspace Container */}
        <div className="modal-body-scroll" style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
          
          {/* Demographics Block */}
          <div style={{ background: 'var(--bg-card)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border-color)', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 12px 0', color: '#0e7490', borderBottom: '1px dashed var(--border-color)', paddingBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
              <span>👤 البيانات الديموغرافية والسريرية للطالب</span>
            </h3>
            <div className="fg c2">
              <StudentPicker form={form} setForm={setForm} students={students} emps={emps} showExtra />
              <div className="fl">
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>تاريخ التقييم والفحص <span className="req">*</span></label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ fontSize: '0.88rem', padding: '6px 12px' }} />
              </div>
            </div>
          </div>

          {/* Tab Navigation Workspace */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid var(--border-color)', paddingBottom: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`tab ${activeTab === 'oral_motor_feeding' ? 'on' : ''}`}
              onClick={() => setActiveTab('oral_motor_feeding')}
              style={{ padding: '10px 16px', fontSize: '0.86rem', fontWeight: 700 }}
            >
              🦷 1. أعضاء النطق والبلع (OME)
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'phonetic_phonology' ? 'on' : ''}`}
              onClick={() => setActiveTab('phonetic_phonology')}
              style={{ padding: '10px 16px', fontSize: '0.86rem', fontWeight: 700 }}
            >
              🗣️ 2. مخارج الحروف والعمليات الفونولوجية
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'fluency_voice' ? 'on' : ''}`}
              onClick={() => setActiveTab('fluency_voice')}
              style={{ padding: '10px 16px', fontSize: '0.86rem', fontWeight: 700 }}
            >
              🎵 3. الطلاقة والصوت والرنين
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'pragmatics_aac' ? 'on' : ''}`}
              onClick={() => setActiveTab('pragmatics_aac')}
              style={{ padding: '10px 16px', fontSize: '0.86rem', fontWeight: 700 }}
            >
              💬 4. التواصل الاجتماعي وبدائل (AAC)
            </button>
            <button
              type="button"
              className={`tab ${activeTab === 'summary_iep' ? 'on' : ''}`}
              onClick={() => setActiveTab('summary_iep')}
              style={{ padding: '10px 16px', fontSize: '0.86rem', fontWeight: 700, background: 'rgba(14, 116, 144, 0.08)' }}
            >
              ✨ 5. التقرير ومستخلص أهداف الـ IEP
            </button>
          </div>

          {/* TAB 1: Oral Motor (OME) & Pediatric Swallowing */}
          {activeTab === 'oral_motor_feeding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* OME Checklist Section */}
              <div>
                <div style={{ borderRight: '4px solid #0e7490', background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
                  <strong style={{ fontSize: '0.92rem', color: '#155e75', display: 'block' }}>🦷 بروتوكول فحص آلية الفم وأعضاء الكلام (Oral Mechanism Examination Checklist)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>التقييم التشريحي والوظيفي لسلامة الشفاه واللسان والفك واللهاة لإنتاج الكلام الفعال.</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                  {SPEECH_ORAL_MOTOR_ITEMS.map(it => {
                    const val = form.results[`oral_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>{it.name}</span>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        </div>
                        <select
                          value={val !== undefined ? val : ''}
                          onChange={e => updateResultValue(`oral_${it.id}`, e.target.value === '' ? null : Number(e.target.value))}
                          style={{ padding: '8px 12px', fontSize: '0.82rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', width: '100%', cursor: 'pointer', fontWeight: 700 }}
                        >
                          <option value="">— اختر التقييم السريري —</option>
                          {it.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label} ({opt.value} درجات)</option>
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
                  <strong style={{ fontSize: '0.92rem', color: '#047857', display: 'block' }}>🍲 بروتوكول فحص بلع ومضغ الأغذية (Pediatric Feeding & Swallowing Protocol)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>ملاحظة سريرية وتنسيق البلع مع التنفس للأغذية الصلبة والمهروسة ورشف السوائل مع رصد منعكس الكحة الواقي.</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                  {FEEDING_SWALLOWING_ITEMS.map(it => {
                    const val = form.results[`feeding_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>{it.name}</span>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        </div>
                        <select
                          value={val !== undefined ? val : ''}
                          onChange={e => updateResultValue(`feeding_${it.id}`, e.target.value === '' ? null : Number(e.target.value))}
                          style={{ padding: '8px 12px', fontSize: '0.82rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', width: '100%', cursor: 'pointer', fontWeight: 700 }}
                        >
                          <option value="">— اختر التقييم السريري —</option>
                          {it.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label} ({opt.value} درجات)</option>
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
              
              {/* Articulation Matrix Info Banner */}
              <div>
                <div style={{ background: 'var(--g0)', padding: '12px 18px', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-sub)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderRight: '4px solid #0e7490' }}>
                  <span>
                    🗣️ **جدول تحليل مخارج الحروف الـ 28 العربية:** اختبر الحرف في كل موقع (أول، وسط، آخر الكلمة)، انقر لتسجيل نوع الخطأ (حذف، إبدال، تشويه).
                  </span>
                  <div style={{ display: 'flex', gap: 8, fontSize: '0.74rem', fontWeight: 700 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></span>سليم</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span>حذف</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span>إبدال</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308' }}></span>تشويه</span>
                  </div>
                </div>

                {/* Vertical list of 28 Letters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                  {SPEECH_PHONETIC_ITEMS.map(it => (
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
                        <span style={{ display: 'inline-flex', width: 34, height: 34, background: '#e0f2fe', color: '#0369a1', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', border: '1px solid #bae6fd' }}>
                          {it.letter}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700 }}>{it.name}</span>
                      </div>

                      {/* Phonetical Type Tag */}
                      <div style={{ fontSize: '0.76rem', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: 8, textAlign: 'center', fontWeight: 700 }}>
                        {it.type}
                      </div>

                      {/* 3 positions */}
                      {['first', 'middle', 'last'].map(pos => {
                        const key = `phone_${it.id}_${pos}`;
                        const currentStatus = form.results[key] || 'na';
                        const subVal = form.results[`${key}_sub`] || '';
                        
                        const wordLabel = pos === 'first' ? 'أول' : pos === 'middle' ? 'وسط' : 'آخر';
                        const sampleWord = it.words[pos] || '';

                        return (
                          <div key={pos} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                              <span style={{ color: 'var(--text-sub)' }}>{wordLabel}: <b style={{ color: 'var(--text-main)' }}>{sampleWord}</b></span>
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
                                  fontWeight: currentStatus === 'correct' ? 700 : 400
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
                                  fontWeight: currentStatus === 'omission' ? 700 : 400
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
                                  fontWeight: currentStatus === 'substitution' ? 700 : 400
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
                                  fontWeight: currentStatus === 'distortion' ? 700 : 400
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
                                  color: 'var(--text-sub)'
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
                                style={{ padding: '3px 6px', fontSize: '0.7rem', height: '24px', border: '1px solid #f59e0b', borderRadius: '4px', background: 'var(--bg-card)', textAlign: 'center' }}
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
                  <strong style={{ fontSize: '0.92rem', color: '#6d28d9', display: 'block' }}>📈 استمارة رصد وتبسيط العمليات الفونولوجية (Phonological Processes Analysis)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>قياس تكرار عمليات التبسيط الصوتي النمائية والغير نمائية (مثل تقديم الأصوات الخلفية، تحويل الاحتكاكية لانفجارية).</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PHONOLOGICAL_PROCESSES_ITEMS.map(it => {
                    const val = form.results[`phone_proc_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>{it.name}</span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {it.options.map(opt => (
                            <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', background: val === opt.value ? 'rgba(139, 92, 246, 0.08)' : 'transparent', fontSize: '0.78rem', fontWeight: val === opt.value ? 700 : 400 }}>
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
                  <strong style={{ fontSize: '0.92rem', color: '#0891b2', display: 'block' }}>📈 بروتوكول فحص التلعثم والطلاقة الكلامية وسلوكات التخلص الثانوية</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>تسجيل مظاهر التلعثم الأساسية (تكرار، إطالة، حبس الهواء) ومظاهر التخلص الحركية والنفسية الثانوية.</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {STUTTERING_FLUENCY_ITEMS.map(it => {
                    const val = form.results[`fluency_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{it.name}</span>
                          <span className="bdg" style={{ background: it.type === 'core' ? '#ecfeff' : '#fef2f2', color: it.type === 'core' ? '#0891b2' : '#991b1b', fontSize: '0.7rem' }}>
                            {it.type === 'core' ? 'سلوك أساسي' : 'سلوك تخلص ثانوي'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {it.options.map(opt => (
                            <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', background: val === opt.value ? 'rgba(6, 182, 212, 0.08)' : 'transparent', fontSize: '0.78rem', fontWeight: val === opt.value ? 700 : 400 }}>
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
                  <strong style={{ fontSize: '0.92rem', color: '#0369a1', display: 'block' }}>🌬️ بروتوكول فحص الخنف والرنين الصوتي وضغط الهواء (Resonance)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>فحص الخنف المفتوح والمغلق عبر رنين أصوات الغنة (م، ن) مع اختبارات سد وفتح الأنف وضغط الهواء الفمي.</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                  {RESONANCE_NASALITY_ITEMS.map(it => {
                    const val = form.results[`resonance_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>{it.name}</span>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        </div>
                        <select
                          value={val !== undefined ? val : ''}
                          onChange={e => updateResultValue(`resonance_${it.id}`, e.target.value === '' ? null : Number(e.target.value))}
                          style={{ padding: '8px 12px', fontSize: '0.82rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', width: '100%', cursor: 'pointer', fontWeight: 700 }}
                        >
                          <option value="">— اختر التقييم السريري —</option>
                          {it.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label} ({opt.value} درجات)</option>
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
                  <strong style={{ fontSize: '0.92rem', color: '#6d28d9', display: 'block' }}>🎙️ بروتوكول التقييم الإدراكي لنبرة وجودة الصوت (CAPE-V Adapted)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>تقدير بحة الصوت، والخشونة، وتسرب الهواء والجهد الحنجري المفرط مع تلاؤم طبقة وعلو الصوت اجتماعياً.</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CAPEV_VOICE_ITEMS.map(it => {
                    const val = form.results[`voice_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>{it.name}</span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {it.options.map(opt => (
                            <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', background: val === opt.value ? 'rgba(139, 92, 246, 0.08)' : 'transparent', fontSize: '0.78rem', fontWeight: val === opt.value ? 700 : 400 }}>
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
                  <strong style={{ fontSize: '0.92rem', color: '#be185d', display: 'block' }}>💬 استمارة فحص الجانب البراجماتي والاستخدام الاجتماعي للغة (Pragmatic Checklist)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>فحص التواصل البصري، تبادل أدوار التحدث، البقاء في موضوع الحديث، وبدء وإنهاء الحوار اجتماعيّاً.</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PRAGMATIC_ITEMS.map(it => {
                    const val = form.results[`pragmatic_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>{it.name}</span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {it.options.map(opt => (
                            <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', background: val === opt.value ? 'rgba(236, 72, 153, 0.08)' : 'transparent', fontSize: '0.78rem', fontWeight: val === opt.value ? 700 : 400 }}>
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
                  <strong style={{ fontSize: '0.92rem', color: '#c2410c', display: 'block' }}>📱 استمارة تقييم جاهزية وسائل التواصل المعزز والبديل للأطفال غير الناطقين (AAC Readiness)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>تحديد مؤهلات الطفل الحركية والبصرية والإدراكية لاستخدام لوحات التواصل أو أجهزة توليد الكلام (PECS).</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {AAC_READINESS_ITEMS.map(it => {
                    const val = form.results[`aac_${it.id}`];
                    return (
                      <div key={it.id} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>{it.name}</span>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{it.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {it.options.map(opt => (
                            <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', background: val === opt.value ? 'rgba(249, 115, 22, 0.08)' : 'transparent', fontSize: '0.78rem', fontWeight: val === opt.value ? 700 : 400 }}>
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
              <div style={{ background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.05) 0%, rgba(14, 116, 144, 0.15) 100%)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(14, 116, 144, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <strong style={{ fontSize: '0.96rem', color: '#0e7490', display: 'block', marginBottom: 2 }}>🤖 توليد التقرير الأكاديمي والتحليل السريري للـ IEP</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>سيقوم النظام بتحليل نقاط الضعف المسجلة وصياغة تقرير طبي متكامل وتوصيات تربوية فردية فورية.</span>
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)', color: '#fff', fontWeight: 800, padding: '10px 18px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(14,116,144,0.2)' }}
                  onClick={generateClinicalReport}
                >
                  ✨ توليد التقرير والتوصيات تلقائياً
                </button>
              </div>

              {/* Textareas for Report Editing */}
              <div className="fg c2" style={{ marginTop: 6 }}>
                <div className="fl full">
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', gap: 6 }}>
                    <span>📄 التقرير السريري والتوصيف التشخيصي التفصيلي</span>
                  </label>
                  <textarea
                    value={form.clinicalSummary}
                    onChange={e => setForm(f => ({ ...f, clinicalSummary: e.target.value }))}
                    rows={8}
                    style={{ fontSize: '0.84rem', fontFamily: 'monospace', direction: 'rtl', lineHeight: 1.6, padding: '12px', border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-input)' }}
                    placeholder="اضغط على زر التوليد التلقائي بالأعلى، أو اكتب تقرير التشخيص يدوياً هنا..."
                  />
                </div>

                <div className="fl full">
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>🎯 نقاط الضعف المرصودة والاحتياجات الأساسية للـ IEP</label>
                  <textarea
                    value={form.recommendations}
                    onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                    rows={4}
                    style={{ fontSize: '0.84rem', lineHeight: 1.6, padding: '12px', border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-input)' }}
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
                    style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', fontSize: '0.8rem', fontWeight: 800, padding: '6px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
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
                        <div key={g.id} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, background: isChecked ? 'rgba(5, 150, 105, 0.02)' : 'var(--g0)', border: isChecked ? '1px solid rgba(5, 150, 105, 0.15)' : '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => setSelectedGoals(prev => ({ ...prev, [g.id]: e.target.checked }))}
                            style={{ width: 18, height: 18, marginTop: 4, cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.82rem', color: '#0e7490' }}>📌 [ {g.domain} ]</strong>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>القصور المرصود: <span style={{ color: '#b91c1c', fontWeight: 700 }}>{g.weakness}</span></span>
                            </div>
                            
                            {isChecked ? (
                              <textarea
                                value={editedText}
                                onChange={e => setEditedGoalTexts(prev => ({ ...prev, [g.id]: e.target.value }))}
                                rows={2}
                                style={{ fontSize: '0.82rem', width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #059669', background: 'var(--bg-card)', lineHeight: 1.5, fontFamily: 'sans-serif' }}
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
              <div className="fl full">
                <label style={{ fontSize: '0.88rem', fontWeight: 800 }}>✍️ ملاحظات الفاحص الإضافية</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  style={{ fontSize: '0.84rem', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-input)' }}
                  placeholder="ملاحظات حول دافعية الطفل، تجاوبه، أو ظروف الجلسة..."
                />
              </div>

            </div>
          )}

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="fa" style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--g0)' }}>
          <button type="button" className="btn btn-g" onClick={onClose} style={{ fontWeight: 800, padding: '8px 16px' }}>إلغاء</button>
          
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
          ) : (
            <button type="button" className="btn btn-p" onClick={handleSave} style={{ fontWeight: 800, padding: '8px 20px', background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)' }}>
              💾 حفظ وتقييد التقييم بالكامل
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
