import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { getAcademicYears, getCurrentAcademicYear } from '../../utils/academicYears';
import { Rocket, CheckCircle2, ArrowRight, Sparkles, Calendar, BookOpen, Clock, AlertCircle } from 'lucide-react';

export default function IepPromotionModal({ program, student, onClose, onPromoted }) {
  const { toast, center } = useApp();
  const academicYears = useMemo(() => getAcademicYears(), []);
  const currentYear = useMemo(() => getCurrentAcademicYear(), []);
  const sections = useMemo(() => lsGet('sections') || [], []);

  // Determine next year suggestion
  const nextYearCandidate = useMemo(() => {
    const currentIdx = academicYears.findIndex(y => y.id === program?.academicYearId || y.name === program?.academicYear);
    if (currentIdx >= 0 && currentIdx + 1 < academicYears.length) {
      return academicYears[currentIdx + 1];
    }
    return academicYears.find(y => y.id !== (program?.academicYearId || currentYear?.id)) || currentYear;
  }, [academicYears, program, currentYear]);

  const [targetYearId, setTargetYearId] = useState(nextYearCandidate?.id || '');
  const [targetTitle, setTargetTitle] = useState(
    `${student?.name || 'الطالب'} - الخطة الفردية (${nextYearCandidate?.name || 'السنة التالية'})`
  );
  const [targetSectionId, setTargetSectionId] = useState(student?.sectionId || '');
  const [startDate, setStartDate] = useState(nextYearCandidate?.startDate || todayStr());
  const [endDate, setEndDate] = useState(nextYearCandidate?.endDate || '');

  // Goals rollover management
  const originalGoals = useMemo(() => program?.goals || [], [program]);

  // Track which goals to carry over into the new plan
  const [selectedGoalIds, setSelectedGoalIds] = useState(() => {
    // Default: carry over uncompleted/in-progress goals, leave mastered ones for historical credit
    return originalGoals
      .filter(g => g.status !== 'mastered' && g.status !== 'completed' && (g.progress || 0) < 100)
      .map(g => g.id);
  });

  const [includeMasteredAsReference, setIncludeMasteredAsReference] = useState(false);
  const [resetCarriedProgress, setResetCarriedProgress] = useState(true);

  const toggleGoal = (id) => {
    setSelectedGoalIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleYearChange = (yearId) => {
    setTargetYearId(yearId);
    const yr = academicYears.find(y => y.id === yearId);
    if (yr) {
      setTargetTitle(`${student?.name || 'الطالب'} - الخطة الفردية (${yr.name})`);
      if (yr.startDate) setStartDate(yr.startDate);
      if (yr.endDate) setEndDate(yr.endDate);
    }
  };

  const executePromotion = () => {
    if (!targetTitle.trim()) {
      toast('⚠️ يرجى كتابة عنوان الخطة الجديدة', 'er');
      return;
    }

    const selectedYearObj = academicYears.find(y => y.id === targetYearId);

    // Prepare carried goals
    const carriedGoals = originalGoals
      .filter(g => selectedGoalIds.includes(g.id))
      .map(g => ({
        ...g,
        id: uid(),
        originalGoalId: g.id,
        carriedOverFromPlanId: program.id,
        progress: resetCarriedProgress ? 0 : (g.progress || 0),
        status: resetCarriedProgress ? 'in_progress' : g.status,
        notes: `[مُرحّل من السنة السابقة: ${program.academicYear || 'الدورة السابقة'}] ${g.notes || ''}`
      }));

    const newPlanId = uid();
    const cycleNum = (Number(program.cycleNumber) || 1) + 1;

    const newPlan = {
      ...program,
      id: newPlanId,
      title: targetTitle.trim(),
      studentId: program.studentId,
      studentName: program.studentName || student?.name,
      academicYearId: targetYearId,
      academicYear: selectedYearObj?.name || 'السنة التالية',
      cycleNumber: cycleNum,
      previousPlanId: program.id,
      previousPlanTitle: program.title,
      sectionId: targetSectionId,
      startDate,
      endDate,
      status: 'active',
      goals: carriedGoals,
      createdAt: todayStr(),
      promotionDate: todayStr(),
      historyNotes: `تمت الترقية من خطة السنة السابقة (${program.title || program.academicYear}) بنجاح.`
    };

    // 1. Mark previous plan as completed/promoted
    lsUpd('progPrograms', program.id, {
      ...program,
      status: 'completed',
      promotedToPlanId: newPlanId,
      promotedToYear: selectedYearObj?.name,
      promotedDate: todayStr()
    });

    // 2. Add new plan
    lsAdd('progPrograms', newPlan);

    // 3. Update student's section if changed
    if (student && targetSectionId && targetSectionId !== student.sectionId) {
      lsUpd('students', student.id, { sectionId: targetSectionId });
    }

    toast(`✅ تمت ترقية الخطة بنجاح للسنة ${selectedYearObj?.name || 'التالية'}!`, 'ok');
    if (onPromoted) onPromoted(newPlan);
    onClose();
  };

  const masteredCount = originalGoals.filter(g => g.status === 'mastered' || (g.progress || 0) >= 100).length;
  const inProgressCount = originalGoals.length - masteredCount;

  return (
    <div className="mbg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxWidth: 740 }}>
        {/* Header */}
        <div className="fhd" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #1e3a8a, #0284c7)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              🚀
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>ترقية الخطة التربوية الفردية (IEP) للسنة التالية</h2>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                الطالب: <strong>{student?.name || program.studentName}</strong> · الدورة الحالية: {program.academicYear || 'الدورة 1'}
              </div>
            </div>
          </div>
          <button type="button" className="btn btn-g btn-sm" onClick={onClose} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>✕</button>
        </div>

        <div className="modal-body-scroll" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '78vh' }}>
          
          {/* Summary Box */}
          <div style={{ background: 'var(--g0)', padding: 14, borderRadius: 12, border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>الخطة الحالية المراد إنهاؤها</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{program.title || 'خطة فردية'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>الأهداف المحققة (متقنة)</div>
              <div style={{ fontWeight: 800, color: 'var(--ok)', fontSize: '0.95rem' }}>🎯 {masteredCount} هدف مكتسب</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>أهداف قيد المتابعة / متبقية</div>
              <div style={{ fontWeight: 800, color: 'var(--warn, #f59e0b)', fontSize: '0.95rem' }}>⏳ {inProgressCount} أهداف</div>
            </div>
          </div>

          {/* Target Setup */}
          <div className="fg c2" style={{ margin: 0 }}>
            <div className="fl">
              <label style={{ fontWeight: 700 }}>العام الدراسي / الدورة التأهيلية الجديدة <span className="req">*</span></label>
              <select value={targetYearId} onChange={(e) => handleYearChange(e.target.value)}>
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.isCurrent ? '⭐ (العام النشط بالمركز)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="fl">
              <label style={{ fontWeight: 700 }}>الصف / القسم المستهدف (الترقية الصفية)</label>
              <select value={targetSectionId} onChange={(e) => setTargetSectionId(e.target.value)}>
                <option value="">بدون تغيير في الصف</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code || 'صف'})</option>
                ))}
              </select>
            </div>

            <div className="fl full">
              <label style={{ fontWeight: 700 }}>عنوان الخطة التربوية الجديدة <span className="req">*</span></label>
              <input
                type="text"
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder="عنوان الخطة للسنة الجديدة..."
              />
            </div>

            <div className="fl">
              <label style={{ fontWeight: 700 }}>تاريخ بداية الخطة الجديدة</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="fl">
              <label style={{ fontWeight: 700 }}>تاريخ نهاية الخطة الجديدة</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* Rollover Goals Selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🎯 الأهداف المراد ترحيلها إلى الخطة الجديدة:</span>
                <span className="bdg b-bl">{selectedGoalIds.length} محددة</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-xs btn-g"
                  onClick={() => setSelectedGoalIds(originalGoals.map(g => g.id))}
                >
                  تحديد الكل
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-g"
                  onClick={() => setSelectedGoalIds([])}
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, maxHeight: 220, overflowY: 'auto', padding: 8, background: 'var(--g0)' }}>
              {originalGoals.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-sub)' }}>لا توجد أهداف مسجلة في الخطة السابقة</div>
              ) : (
                originalGoals.map((g) => {
                  const isMastered = g.status === 'mastered' || (g.progress || 0) >= 100;
                  const isSelected = selectedGoalIds.includes(g.id);
                  return (
                    <div
                      key={g.id}
                      onClick={() => toggleGoal(g.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 8,
                        marginBottom: 4,
                        background: isSelected ? 'var(--pr-l)' : 'transparent',
                        border: isSelected ? '1px solid var(--pr)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: '0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {g.text || g.title || g.desc}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'flex', gap: 8 }}>
                          <span>المجال: {g.domain || 'عام'}</span>
                          <span>نسبة الإنجاز السابقة: {g.progress || 0}%</span>
                        </div>
                      </div>
                      {isMastered ? (
                        <span className="bdg b-gr" style={{ fontSize: '0.7rem' }}>متقن سابقاً ✅</span>
                      ) : (
                        <span className="bdg b-yl" style={{ fontSize: '0.7rem' }}>مستمر / قيد التدريب</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-sub)' }}>
              <input
                type="checkbox"
                id="resetProgCheck"
                checked={resetCarriedProgress}
                onChange={(e) => setResetCarriedProgress(e.target.checked)}
              />
              <label htmlFor="resetProgCheck" style={{ cursor: 'pointer' }}>
                إعادة ضبط نسبة إنجاز الأهداف المُرحّلة إلى (0%) لاختبارها وتدريبها من جديد في السنة القادمة
              </label>
            </div>
          </div>

          <div style={{ background: 'var(--g0)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 12, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
            ℹ️ <strong>ملاحظة للمنظومة:</strong> عند النقر على ترقية، ستظل الخطة السابقة محفوظة بالكامل بكل أهدافها وسجلاتها في الأرشيف التراكمي للطالب، وسيمكنك استخدام ميزة <strong>«مقارنة التطور بين السنتين»</strong> في أي وقت لمقارنة النتائج والتقييمات.
          </div>
        </div>

        {/* Footer */}
        <div className="fa" style={{ padding: '14px 22px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-g" onClick={onClose}>إلغاء</button>
          <button
            type="button"
            className="btn btn-p"
            onClick={executePromotion}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, padding: '10px 24px' }}
          >
            <Rocket style={{ width: 18, height: 18 }} />
            <span>تأكيد الترقية للسنة التالية</span>
          </button>
        </div>
      </div>
    </div>
  );
}
