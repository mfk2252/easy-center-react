import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { domainLabel } from '../../utils/goalsBank';
import { getStrategiesForDomain } from '../../data/strategiesData';

export default function IepBridgeModal({
  isOpen,
  onClose,
  assessmentData,
  recommendedGoals = [],
  onApplied,
}) {
  const { toast } = useApp();

  // Internal state of goals with full clinical override capability
  const [goalsList, setGoalsList] = useState(() => {
    return recommendedGoals.map(g => {
      const domStrategies = getStrategiesForDomain(g.domain);
      return {
        ...g,
        id: g.id || uid(),
        baseline: g.baseline || `مستوى الأداء الحالي (PLEP): يظهر التلميذ فجوة أداء ملحوظة في (${g.title || g.text?.slice(0, 30)}) تستدعي تدخلاً فردياً.`,
        mastery: g.mastery || 'إتقان 80% في جلستين متتاليتين',
        priority: g.priority || 'medium',
        priorityRank: g.priorityRank || (g.priority === 'critical' ? 1 : (g.priority === 'high' ? 2 : 3)),
        durationWeeks: g.durationWeeks || 8,
        selectedStrategies: g.strategies || (domStrategies.strategies ? domStrategies.strategies.slice(0, 3).map(s => s.title) : ['التحليل المهاري والتدرج']),
        selectedActivities: g.activities || (domStrategies.activities ? domStrategies.activities.slice(0, 2).map(a => a.title) : ['أنشطة تدريبية وتطبيقية']),
        selectedMaterials: g.materials || (domStrategies.materials ? domStrategies.materials.slice(0, 3) : ['بطاقات بصرية', 'أدوات حسية']),
        isExpanded: false,
      };
    });
  });

  // Selected goal IDs for export
  const [selectedGoalIds, setSelectedGoalIds] = useState(
    () => new Set(recommendedGoals.map(g => g.id))
  );

  // Active filter for priority staging
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'critical' | 'high' | 'medium'

  // Export target options
  const [targetPlanMode, setTargetPlanMode] = useState('existing'); // 'existing' | 'new'
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [newPlanTitle, setNewPlanTitle] = useState(
    assessmentData?.studentName
      ? `خطة التدخل الفردية (IEP) - مستندة لمقياس ${assessmentData?.measureName || 'التقييم'}`
      : 'خطة تربوية فردية جديدة (IEP)'
  );

  if (!isOpen) return null;

  const existingPlans = (lsGet('progPrograms') || []).filter(
    p => p.stuId === assessmentData?.stuId || p.studentName === assessmentData?.studentName
  );

  // Toggle goal selection
  const toggleGoal = (id) => {
    setSelectedGoalIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Quick Select Helpers
  const selectAll = () => {
    setSelectedGoalIds(new Set(goalsList.map(g => g.id)));
  };

  const selectCriticalOnly = () => {
    const criticalIds = goalsList.filter(g => g.priority === 'critical' || g.priorityRank === 1).map(g => g.id);
    setSelectedGoalIds(new Set(criticalIds));
  };

  const selectUrgentAndHigh = () => {
    const targetIds = goalsList.filter(g => g.priority === 'critical' || g.priority === 'high' || (g.priorityRank && g.priorityRank <= 2)).map(g => g.id);
    setSelectedGoalIds(new Set(targetIds));
  };

  const clearAll = () => {
    setSelectedGoalIds(new Set());
  };

  // Toggle goal expansion for deep clinical editing
  const toggleExpand = (goalId) => {
    setGoalsList(prev => prev.map(g => g.id === goalId ? { ...g, isExpanded: !g.isExpanded } : g));
  };

  // Update specific goal field
  const updateGoalField = (goalId, field, value) => {
    setGoalsList(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, [field]: value };
      }
      return g;
    }));
  };

  // Toggle strategy item
  const toggleStrategyItem = (goalId, strategyTitle) => {
    setGoalsList(prev => prev.map(g => {
      if (g.id === goalId) {
        const current = g.selectedStrategies || [];
        const next = current.includes(strategyTitle)
          ? current.filter(s => s !== strategyTitle)
          : [...current, strategyTitle];
        return { ...g, selectedStrategies: next };
      }
      return g;
    }));
  };

  // Counts by priority
  const countCritical = goalsList.filter(g => g.priority === 'critical' || g.priorityRank === 1).length;
  const countHigh = goalsList.filter(g => g.priority === 'high' || g.priorityRank === 2).length;
  const countMedium = goalsList.filter(g => g.priority === 'medium' || g.priorityRank === 3).length;

  // Filtered goals for display
  const displayedGoals = goalsList.filter(g => {
    if (priorityFilter === 'critical') return g.priority === 'critical' || g.priorityRank === 1;
    if (priorityFilter === 'high') return g.priority === 'high' || g.priorityRank === 2;
    if (priorityFilter === 'medium') return g.priority === 'medium' || g.priorityRank === 3;
    return true;
  });

  // Apply goals to IEP Plan
  const handleApplyToGoals = () => {
    const goalsToApply = goalsList.filter(g => selectedGoalIds.has(g.id));
    if (goalsToApply.length === 0) {
      toast('⚠️ يرجى تحديد هدف واحد على الأقل للاعتماد والتصدير', 'er');
      return;
    }

    const formattedGoals = goalsToApply.map(g => ({
      id: uid(),
      code: g.code || `IEP-${Math.floor(100 + Math.random() * 900)}`,
      title: g.title || 'هدف فردي',
      text: g.text,
      domain: g.domain || 'general',
      mastery: g.mastery || 'إتقان 80% في جلستين متتاليتين',
      baseline: g.baseline || '',
      priority: g.priority || 'medium',
      priorityRank: g.priorityRank || 2,
      durationWeeks: g.durationWeeks || 8,
      strategies: g.selectedStrategies || [],
      activities: g.selectedActivities || [],
      materials: g.selectedMaterials || [],
      status: 'قيد التدريب',
      sourceAssessment: assessmentData?.measureName || 'تقييم تشخيصي مقنن',
      sourceMeasureId: assessmentData?.measureId || '',
      createdAt: todayStr(),
      sessions: [], // Ready for session tracking
    }));

    if (targetPlanMode === 'existing') {
      const targetPlan = selectedPlanId
        ? existingPlans.find(p => p.id === selectedPlanId)
        : existingPlans[0];

      if (targetPlan) {
        const updatedGoals = [...(targetPlan.goals || []), ...formattedGoals];
        lsUpd('progPrograms', targetPlan.id, {
          ...targetPlan,
          goals: updatedGoals,
          updatedAt: new Date().toISOString(),
        });
        toast(`✅ تمت إضافة ${formattedGoals.length} أهداف معتمدة إلى الخطة: "${targetPlan.title}"`, 'ok');
      } else {
        createNewPlanWithGoals(formattedGoals);
      }
    } else {
      createNewPlanWithGoals(formattedGoals);
    }

    if (onApplied) onApplied(formattedGoals);
    onClose();
  };

  const createNewPlanWithGoals = (goals) => {
    // Generate synthesized activities from selected strategies
    const allStrategies = Array.from(new Set(goals.flatMap(g => g.strategies || []))).slice(0, 5);
    const strategiesText = allStrategies.length > 0
      ? `استراتيجيات التدخل المعتمدة: ${allStrategies.join(' · ')}`
      : 'استراتيجيات التحليل المهاري والدعم البصري والتعزيز الإيجابي.';

    const newPlan = {
      id: uid(),
      stuId: assessmentData?.stuId || '',
      studentName: assessmentData?.studentName || '',
      className: assessmentData?.className || '',
      diagnosis: assessmentData?.diagnosis || '',
      parentName: assessmentData?.parentName || '',
      parentPhone: assessmentData?.parentPhone || '',
      title: newPlanTitle || 'خطة تربوية فردية IEP',
      duration: 'فصل دراسي (3 أشهر)',
      startDate: todayStr(),
      reviewDate: '',
      specialistName: assessmentData?.specialistName || '',
      goals,
      activities: strategiesText,
      notes: `خطة تربوية فردية مشتقة إكلينيكياً من تقييم (${assessmentData?.measureName || 'المقياس المقنن'}) عبر محرك الربط والاعتماد السيكومتري (Assessment ➔ IEP Bridge).`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    lsAdd('progPrograms', newPlan);
    toast(`✅ تم إنشاء خطة تربوية فردية جديدة بعنوان "${newPlan.title}" وتضمين ${goals.length} أهداف بدقة`, 'ok');
  };

  return (
    <div className="mbg" style={{ zIndex: 1100 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: 'min(94vh, calc(100dvh - 20px))', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="modal-header-custom fhd" style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.6rem' }}>🎯</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', fontWeight: 800 }}>
                  منظومة الربط والاعتماد الإكلينيكي (Assessment ➔ IEP Bridge)
                </h2>
                <span className="bdg b-gr" style={{ fontSize: '.7rem' }}>
                  Staging & Decision Support
                </span>
              </div>
              <div style={{ fontSize: '.78rem', opacity: 0.95, marginTop: 3 }}>
                اشتقاق ومواءمة الأهداف الفردية للطالب: <strong>{assessmentData?.studentName}</strong> المستندة لمقياس ({assessmentData?.measureName})
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-xs"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700 }}
            onClick={onClose}
          >
            ✕ إغلاق
          </button>
        </div>

        {/* Modal Body Scroll */}
        <div className="modal-body-scroll" style={{ padding: '18px 20px', flex: 1, overflowY: 'auto' }}>
          
          {/* Summary & Prioritization Bar */}
          <div style={{ background: 'var(--g0)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '.94rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🧬</span>
                  <span>التحليل السيكومتري ومصفوفة الأولويات (Severity Hierarchy):</span>
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginTop: 2 }}>
                  تم استخراج <strong>{goalsList.length}</strong> أهداف مرتبة آلياً بحسب شدة الفجوة الإكلينيكية، ومزودة بوصف مستوى الأداء الحالي (PLEP) وبنك الاستراتيجيات القائمة على الأدلة (EBP).
                </div>
              </div>

              {/* Priority Counters */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="bdg" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', fontWeight: 800, fontSize: '.76rem' }}>
                  🔴 {countCritical} قصور حرج (أولوية قصوى)
                </span>
                <span className="bdg" style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fb923c', fontWeight: 800, fontSize: '.76rem' }}>
                  🟠 {countHigh} قصور مرتفع
                </span>
                {countMedium > 0 && (
                  <span className="bdg" style={{ background: '#fef9c3', color: '#a16207', border: '1px solid #facc15', fontWeight: 800, fontSize: '.76rem' }}>
                    🟡 {countMedium} منطقة خطورة/متوسط
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions & Filters Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 10, borderTop: '1px dashed var(--border-color)' }}>
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>تصفية العرض:</span>
                <button
                  type="button"
                  className={`btn btn-xs ${priorityFilter === 'all' ? 'btn-p' : 'btn-g'}`}
                  onClick={() => setPriorityFilter('all')}
                  style={{ borderRadius: 6 }}
                >
                  الكل ({goalsList.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${priorityFilter === 'critical' ? 'btn-d' : 'btn-g'}`}
                  onClick={() => setPriorityFilter('critical')}
                  style={{ borderRadius: 6 }}
                >
                  🔴 الحرجة فقط ({countCritical})
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${priorityFilter === 'high' ? 'btn-s' : 'btn-g'}`}
                  onClick={() => setPriorityFilter('high')}
                  style={{ borderRadius: 6 }}
                >
                  🟠 المرتفعة ({countHigh})
                </button>
              </div>

              {/* Selection Preset Buttons */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-xs btn-p" onClick={selectAll} style={{ fontSize: '.76rem' }}>
                  تحديد الكل ✅
                </button>
                <button type="button" className="btn btn-xs btn-s" onClick={selectUrgentAndHigh} style={{ fontSize: '.76rem' }}>
                  تحديد الأولوية 1 و 2 فقط ⚡
                </button>
                <button type="button" className="btn btn-xs btn-g" onClick={clearAll} style={{ fontSize: '.76rem' }}>
                  إلغاء التحديد ✖
                </button>
              </div>
            </div>
          </div>

          {/* Staging Goals List */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: '.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📋 محطة مراجعة الأهداف والتحكم الإكلينيكي (Clinical Override):
              </h3>
              <span style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>
                تم تحديد <strong>{selectedGoalIds.size}</strong> من أصل {goalsList.length} أهداف للتصدير
              </span>
            </div>

            {displayedGoals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, background: 'var(--g0)', borderRadius: 12, color: 'var(--text-sub)' }}>
                لا توجد أهداف مطابقة لشرط التصفية المحدد.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {displayedGoals.map((g, idx) => {
                  const isSelected = selectedGoalIds.has(g.id);
                  const isCritical = g.priority === 'critical' || g.priorityRank === 1;
                  const isHigh = g.priority === 'high' || g.priorityRank === 2;
                  const domStrategies = getStrategiesForDomain(g.domain);

                  return (
                    <div
                      key={g.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: isSelected
                          ? (isCritical ? '2px solid #ef4444' : isHigh ? '2px solid #f97316' : '2px solid var(--pr)')
                          : '1px solid var(--border-color)',
                        borderRadius: 14,
                        padding: 14,
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 3px 10px rgba(0,0,0,0.05)' : 'none',
                      }}
                    >
                      {/* Top Goal Bar */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleGoal(g.id)}
                          style={{
                            marginTop: 4,
                            width: 20,
                            height: 20,
                            accentColor: isCritical ? '#ef4444' : 'var(--pr)',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span className="bdg b-bl" style={{ fontSize: '.7rem', fontWeight: 800 }}>{g.code}</span>
                              <span style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                                📁 {domainLabel(g.domain) || g.domain}
                              </span>

                              {isCritical && (
                                <span className="bdg" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', fontSize: '.68rem', fontWeight: 800 }}>
                                  🔴 أولوية قصوى (P1)
                                </span>
                              )}
                              {isHigh && (
                                <span className="bdg" style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fb923c', fontSize: '.68rem', fontWeight: 800 }}>
                                  🟠 أولوية مرتفعة (P2)
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '.74rem', color: 'var(--ok)', fontWeight: 800, background: 'var(--ok-l)', padding: '2px 8px', borderRadius: 6 }}>
                                🎯 {g.mastery}
                              </span>
                              <button
                                type="button"
                                className="btn btn-xs btn-g"
                                onClick={() => toggleExpand(g.id)}
                                style={{ fontSize: '.72rem', padding: '3px 8px', fontWeight: 700 }}
                              >
                                {g.isExpanded ? '▲ إخفاء التخصيص' : '✏️ تخصيص واستراتيجيات ▼'}
                              </button>
                            </div>
                          </div>

                          {/* Editable / Viewable Goal Text */}
                          <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5 }}>
                            {g.text}
                          </div>

                          {/* PLEP Baseline Statement Preview */}
                          {g.baseline && (
                            <div style={{ fontSize: '.78rem', background: 'var(--g0)', padding: '6px 10px', borderRadius: 8, marginTop: 6, border: '1px solid var(--border-color)', color: 'var(--text-sub)' }}>
                              <strong style={{ color: 'var(--pr)' }}>📌 الخط القاعدي (PLEP):</strong> {g.baseline}
                            </div>
                          )}

                          {/* Attached Strategies tags summary */}
                          {g.selectedStrategies && g.selectedStrategies.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                              <span style={{ fontSize: '.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>الاستراتيجيات المرفقة:</span>
                              {g.selectedStrategies.map((st, i) => (
                                <span key={i} className="bdg b-bl" style={{ fontSize: '.66rem' }}>
                                  💡 {st}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* EXPANDED CLINICAL OVERRIDE PANEL */}
                      {g.isExpanded && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--border-color)', background: 'var(--g0)', padding: 14, borderRadius: 10 }}>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '.86rem', fontWeight: 800, color: 'var(--pr)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>🛠️</span> <span>تعديل الصياغة الإجرائية والاستراتيجيات والوسائل (Clinical Override):</span>
                          </h4>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 12 }}>
                            {/* Edit Goal Text */}
                            <div>
                              <label style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                                نص الهدف السلوكي (SMART Format):
                              </label>
                              <textarea
                                value={g.text}
                                onChange={e => updateGoalField(g.id, 'text', e.target.value)}
                                rows={2}
                                style={{ width: '100%', padding: '6px 10px', fontSize: '.82rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                              />
                            </div>

                            {/* Edit PLEP Baseline */}
                            <div>
                              <label style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                                مستوى الأداء الحالي (PLEP Statement):
                              </label>
                              <textarea
                                value={g.baseline}
                                onChange={e => updateGoalField(g.id, 'baseline', e.target.value)}
                                rows={2}
                                style={{ width: '100%', padding: '6px 10px', fontSize: '.82rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 12 }}>
                            {/* Mastery Criteria */}
                            <div>
                              <label style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: 2 }}>معيار الإتقان المقنن:</label>
                              <select
                                value={g.mastery}
                                onChange={e => updateGoalField(g.id, 'mastery', e.target.value)}
                                style={{ width: '100%', padding: '6px 8px', fontSize: '.8rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                              >
                                <option value="إتقان 80% في جلستين متتاليتين">إتقان 80% في جلستين متتاليتين (معتمد)</option>
                                <option value="إتقان 85% في 4 من 5 محاولات">إتقان 85% في 4 من 5 محاولات</option>
                                <option value="إنجاز مستقل تماماً بنسبة 90%">إنجاز مستقل تماماً بنسبة 90%</option>
                                <option value="انخفاض بنسبة 75% في 4 أسابيع">انخفاض بنسبة 75% في 4 أسابيع</option>
                              </select>
                            </div>

                            {/* Priority Selector */}
                            <div>
                              <label style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: 2 }}>مستوى الأولوية:</label>
                              <select
                                value={g.priority}
                                onChange={e => {
                                  const prio = e.target.value;
                                  const rank = prio === 'critical' ? 1 : (prio === 'high' ? 2 : 3);
                                  updateGoalField(g.id, 'priority', prio);
                                  updateGoalField(g.id, 'priorityRank', rank);
                                }}
                                style={{ width: '100%', padding: '6px 8px', fontSize: '.8rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                              >
                                <option value="critical">🔴 أولوية قصوى (حرجة - P1)</option>
                                <option value="high">🟠 أولوية مرتفعة (P2)</option>
                                <option value="medium">🟡 أولوية متوسطة (P3)</option>
                                <option value="low">🟢 أولوية منخفضة / تعزيز (P4)</option>
                              </select>
                            </div>

                            {/* Duration Weeks */}
                            <div>
                              <label style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: 2 }}>المدة المقدرة للتدريب:</label>
                              <select
                                value={g.durationWeeks || 8}
                                onChange={e => updateGoalField(g.id, 'durationWeeks', Number(e.target.value))}
                                style={{ width: '100%', padding: '6px 8px', fontSize: '.8rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                              >
                                <option value={4}>4 أسابيع (تدخل مكثف سريع)</option>
                                <option value={6}>6 أسابيع</option>
                                <option value={8}>8 أسابيع (شهرين)</option>
                                <option value={12}>12 أسبوعاً (فصل دراسي كامل)</option>
                              </select>
                            </div>
                          </div>

                          {/* Evidence-Based Strategies Bank Selector */}
                          <div style={{ marginTop: 10, background: 'var(--bg-card)', padding: 10, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                            <label style={{ fontSize: '.78rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                              💡 اختيار الاستراتيجيات المبنية على البراهين (EBP Bank) لهذا الهدف:
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 6 }}>
                              {(domStrategies.strategies || []).map(st => {
                                const isChecked = (g.selectedStrategies || []).includes(st.title);
                                return (
                                  <label key={st.id || st.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '.74rem', cursor: 'pointer', margin: 0, padding: 4, borderRadius: 4, background: isChecked ? 'var(--pr-l)' : 'transparent' }}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleStrategyItem(g.id, st.title)}
                                      style={{ marginTop: 2, accentColor: 'var(--pr)' }}
                                    />
                                    <div>
                                      <strong style={{ color: 'var(--text-main)' }}>{st.title}</strong>
                                      <div style={{ fontSize: '.68rem', color: 'var(--text-sub)' }}>{st.desc}</div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export Destination Configuration */}
          <div style={{ background: 'var(--g0)', padding: 16, borderRadius: 14, border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '.94rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📥</span> <span>وجهة تصدير واعتماد الأهداف المحددة:</span>
            </h4>

            <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.86rem', fontWeight: 700 }}>
                <input
                  type="radio"
                  name="targetPlanMode"
                  checked={targetPlanMode === 'existing'}
                  onChange={() => setTargetPlanMode('existing')}
                  disabled={existingPlans.length === 0}
                />
                <span>إضافة إلى خطة فردية مسجلة مسبقاً ({existingPlans.length} خطط)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.86rem', fontWeight: 700 }}>
                <input
                  type="radio"
                  name="targetPlanMode"
                  checked={targetPlanMode === 'new'}
                  onChange={() => setTargetPlanMode('new')}
                />
                <span>إنشاء خطة تربوية فردية جديدة (IEP) فوراً ➕</span>
              </label>
            </div>

            {targetPlanMode === 'existing' && existingPlans.length > 0 ? (
              <div className="fl full" style={{ margin: 0 }}>
                <label style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>اختر الخطة الفردية المستهدفة:</label>
                <select
                  value={selectedPlanId || existingPlans[0]?.id}
                  onChange={e => setSelectedPlanId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  {existingPlans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} (تاريخ البدء: {p.startDate || '—'} · {p.goals?.length || 0} أهداف حالية)
                    </option>
                  ))}
                </select>
              </div>
            ) : targetPlanMode === 'new' || existingPlans.length === 0 ? (
              <div className="fl full" style={{ margin: 0 }}>
                <label style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>عنوان الخطة الفردية الجديدة:</label>
                <input
                  type="text"
                  value={newPlanTitle}
                  onChange={e => setNewPlanTitle(e.target.value)}
                  placeholder="أدخل مسمى الخطة..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>
            ) : null}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="fa" style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--g0)' }}>
          <button
            type="button"
            className="btn btn-p"
            onClick={handleApplyToGoals}
            style={{ fontWeight: 800, padding: '9px 24px', fontSize: '.92rem' }}
          >
            🚀 اعتماد وتضمين الأهداف ({selectedGoalIds.size}) في الخطة الفردية
          </button>
          <button type="button" className="btn btn-g" onClick={onClose}>
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
}
