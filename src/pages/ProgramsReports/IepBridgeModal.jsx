import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { domainLabel } from '../../utils/goalsBank';

export default function IepBridgeModal({
  isOpen,
  onClose,
  assessmentData,
  recommendedGoals = [],
  onApplied,
}) {
  const { toast } = useApp();
  const [selectedGoalIds, setSelectedGoalIds] = useState(
    () => new Set(recommendedGoals.map(g => g.id))
  );
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

  const toggleGoal = (id) => {
    setSelectedGoalIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedGoalIds(new Set(recommendedGoals.map(g => g.id)));
  };

  const clearAll = () => {
    setSelectedGoalIds(new Set());
  };

  const handleApplyToGoals = () => {
    const goalsToApply = recommendedGoals.filter(g => selectedGoalIds.has(g.id));
    if (goalsToApply.length === 0) {
      toast('⚠️ يرجى تحديد هدف واحد على الأقل لإضافته للخطة', 'er');
      return;
    }

    const formattedGoals = goalsToApply.map(g => ({
      id: uid(),
      code: g.code || `GOAL-${Math.floor(100 + Math.random() * 900)}`,
      text: g.text,
      domain: g.domain || 'general',
      mastery: g.mastery || 'إتقان 80%',
      status: 'قيد التدريب',
      sourceAssessment: assessmentData?.measureName || 'تقييم تشخيصي',
      createdAt: todayStr(),
    }));

    if (targetPlanMode === 'existing') {
      if (!selectedPlanId && existingPlans.length > 0) {
        // Default to first plan if not explicitly selected
        const targetPlan = existingPlans[0];
        const updatedGoals = [...(targetPlan.goals || []), ...formattedGoals];
        lsUpd('progPrograms', targetPlan.id, {
          ...targetPlan,
          goals: updatedGoals,
          updatedAt: new Date().toISOString(),
        });
        toast(`✅ تمت إضافة ${formattedGoals.length} أهداف إلى الخطة: "${targetPlan.title}"`, 'ok');
      } else if (selectedPlanId) {
        const targetPlan = existingPlans.find(p => p.id === selectedPlanId);
        if (targetPlan) {
          const updatedGoals = [...(targetPlan.goals || []), ...formattedGoals];
          lsUpd('progPrograms', targetPlan.id, {
            ...targetPlan,
            goals: updatedGoals,
            updatedAt: new Date().toISOString(),
          });
          toast(`✅ تمت إضافة ${formattedGoals.length} أهداف إلى الخطة: "${targetPlan.title}"`, 'ok');
        }
      } else {
        // No existing plan, create new
        createNewPlanWithGoals(formattedGoals);
      }
    } else {
      createNewPlanWithGoals(formattedGoals);
    }

    if (onApplied) onApplied(formattedGoals);
    onClose();
  };

  const createNewPlanWithGoals = (goals) => {
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
      activities: `أنشطة وتدريبات مستمدة من نتائج تقييم ${assessmentData?.measureName || 'المقياس التشخيصي'}.`,
      notes: `تم إنشاء الخطة واشتقاق أهدافها آلياً عبر منظومة الربط الأكاديمي والتربوي (Assessment ➔ IEP Bridge).`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    lsAdd('progPrograms', newPlan);
    toast(`✅ تم إنشاء خطة فردية جديدة بعنوان "${newPlan.title}" وتضمين ${goals.length} أهداف`, 'ok');
  };

  return (
    <div className="mbg" style={{ zIndex: 1100 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: 'min(94vh, calc(100dvh - 20px))', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="modal-header-custom fhd" style={{ padding: '12px 18px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.5rem' }}>🎓</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.12rem', fontWeight: 800 }}>
                منظومة الربط الأكاديمي والتربوي (Assessment ➔ IEP Bridge)
              </h2>
              <div style={{ fontSize: '.74rem', opacity: 0.9, marginTop: 2 }}>
                اشتقاق أهداف الخطة للطالب: <strong>{assessmentData?.studentName}</strong> من ({assessmentData?.measureName})
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

        {/* Body */}
        <div className="modal-body-scroll" style={{ padding: 20 }}>
          
          {/* Summary Banner */}
          <div style={{ background: 'var(--pr-l)', border: '1px solid var(--pr)', borderRadius: 12, padding: '12px 16px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--text-main)' }}>
                💡 تحليل نقاط الاحتياج والضعف المستخرجة:
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-sub)', marginTop: 2 }}>
                تم استخراج <strong>{recommendedGoals.length}</strong> أهداف سلوكية وتأهيلية مصاغة إجرائياً بمعايير إتقان مقننة.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-xs btn-p" onClick={selectAll}>تحديد الكل ✅</button>
              <button type="button" className="btn btn-xs btn-g" onClick={clearAll}>إلغاء التحديد ✖</button>
            </div>
          </div>

          {/* Goals Selection List */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 10 }}>
              🎯 الأهداف السلوكية والتأهيلية المقترحة للخطة:
            </h3>

            {recommendedGoals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, background: 'var(--g0)', borderRadius: 10, color: 'var(--text-sub)' }}>
                لم يتم رصد نقاط ضعف حرجة تستدعي أهدافاً إضافية في هذا المقياس.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recommendedGoals.map((g) => {
                  const isSelected = selectedGoalIds.has(g.id);
                  return (
                    <div
                      key={g.id}
                      onClick={() => toggleGoal(g.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid var(--pr)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--bg-card)' : 'var(--g0)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by container
                        style={{ marginTop: 3, width: 18, height: 18, accentColor: 'var(--pr)', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="bdg b-bl" style={{ fontSize: '.68rem' }}>{g.code || 'GOAL'}</span>
                            <span style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 600 }}>{domainLabel(g.domain) || g.domain}</span>
                            {g.priority === 'high' && <span className="bdg b-or" style={{ fontSize: '.64rem' }}>أولوية عاجلة ⚡</span>}
                          </div>
                          <span style={{ fontSize: '.72rem', color: 'var(--pr)', fontWeight: 700 }}>
                            🎯 معيار الإتقان: {g.mastery}
                          </span>
                        </div>

                        <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {g.text}
                        </div>

                        {g.reason && (
                          <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginTop: 4 }}>
                            🔍 السبب: {g.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Destination Plan Selector */}
          <div style={{ background: 'var(--g0)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
              📥 وجهة تصدير الأهداف المحددة:
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
                <span>إضافة إلى خطة فردية حالية ({existingPlans.length} خطط مسجلة)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.86rem', fontWeight: 700 }}>
                <input
                  type="radio"
                  name="targetPlanMode"
                  checked={targetPlanMode === 'new'}
                  onChange={() => setTargetPlanMode('new')}
                />
                <span>إنشاء خطة فردية جديدة (IEP) فوراً ➕</span>
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
                      {p.title} (بدأت: {p.startDate || '—'} · {p.goals?.length || 0} أهداف سابقة)
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
            style={{ fontWeight: 800, padding: '8px 20px' }}
          >
            🚀 اعتماد وتضمين الأهداف ({selectedGoalIds.size}) في الخطة الفردية
          </button>
          <button type="button" className="btn btn-g" onClick={onClose}>
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
