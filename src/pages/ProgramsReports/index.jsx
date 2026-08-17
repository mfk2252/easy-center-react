import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { lsGet } from '../../hooks/useStorage';
import PillarAssessment from './PillarAssessment';
import PillarPlans from './PillarPlans';
import PillarProgress from './PillarProgress';
import PillarFamily from './PillarFamily';

/**
 * قسم البرامج والتقارير في Easy Center
 * هيكلة منظمة وواضحة عبر 4 محاور أساسية تمثل رحلة الطالب الكاملة داخل المركز
 */
const PILLARS = [
  {
    id: 'assessment',
    title: 'مركز التقييم والتشخيص',
    subtitle: 'المقاييس المقننة، التقييم المبدئي الشامل، ومستوى الأداء الحالي',
    icon: '🎯',
    color: '#1a56db',
    accentClass: 'blue',
  },
  {
    id: 'plans',
    title: 'الخطط والبرامج الفردية (IEP)',
    subtitle: 'الخطط طويلة وقصيرة المدى، بنك الأهداف التخصصي، وتعديل السلوك',
    icon: '📋',
    color: '#7c3aed',
    accentClass: 'purple',
  },
  {
    id: 'progress',
    title: 'التقارير الدورية ومتابعة الإنجاز',
    subtitle: 'التقارير الأسبوعية والشهرية والفصليّة والسنوية، ونسب الإتقان',
    icon: '📊',
    color: '#059669',
    accentClass: 'green',
  },
  {
    id: 'family',
    title: 'الشراكة والتواصل الأسري',
    subtitle: 'محاضر لقاءات أولياء الأمور، التوجيه المنزلي، والإرسال عبر WhatsApp',
    icon: '👨‍👩‍👧',
    color: '#db2777',
    accentClass: 'pink',
  },
];

export default function ProgramsReportsHub() {
  const { t } = useLang();
  const { center } = useApp();
  const [activePillar, setActivePillar] = useState('assessment');
  const [stats, setStats] = useState({
    evalCount: 0,
    planCount: 0,
    reportCount: 0,
    meetingCount: 0,
  });

  useEffect(() => {
    const evals = lsGet('progEvaluations').length + (lsGet('studentAssessments') || []).length;
    const plans = (lsGet('progPrograms') || []).length + (lsGet('progBehaviorReports') || []).length;
    const reports = (lsGet('progWeeklyReports') || []).length +
      (lsGet('progMonthlyReports') || []).length +
      (lsGet('progSemiAnnualReports') || []).length +
      (lsGet('progAnnualReports') || []).length;
    const meetings = (lsGet('progParentMeetings') || []).length;

    setStats({
      evalCount: evals,
      planCount: plans,
      reportCount: reports,
      meetingCount: meetings,
    });
  }, [activePillar]);

  return (
    <div>
      {/* Page Header */}
      <div className="ph">
        <div className="ph-t">
          <h2>📚 {t('progReports.title') || 'البرامج والخطط التأهيلية والتقارير'}</h2>
          <p>
            منظومة متكاملة لتوثيق وتشخيص رحلة كل طالب، وبناء خططه الفردية (IEP)، وإصدار التقارير ومشاركتها مع أولياء الأمور
          </p>
        </div>
      </div>

      {/* 4 Pillars Navigation Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {PILLARS.map(p => {
          const isActive = activePillar === p.id;
          let count = 0;
          if (p.id === 'assessment') count = stats.evalCount;
          if (p.id === 'plans') count = stats.planCount;
          if (p.id === 'progress') count = stats.reportCount;
          if (p.id === 'family') count = stats.meetingCount;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePillar(p.id)}
              style={{
                textAlign: 'right',
                cursor: 'pointer',
                background: isActive ? 'var(--bg-card)' : 'var(--bg-card)',
                border: isActive ? `2px solid ${p.color}` : '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '14px 16px',
                boxShadow: isActive ? 'var(--sh2)' : 'var(--sh)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all .18s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    left: 0,
                    height: 3,
                    background: p.color,
                  }}
                />
              )}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: isActive ? p.color : p.color + '15',
                  color: isActive ? '#fff' : p.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                }}
              >
                {p.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '.92rem',
                    color: isActive ? p.color : 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.title}
                </div>
                <div style={{ fontSize: '.76rem', color: 'var(--g5)', marginTop: 2 }}>
                  {count} سجل مسجل
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Pillar Container */}
      <div className="tab-content" style={{ marginTop: 8 }}>
        {activePillar === 'assessment' && <PillarAssessment />}
        {activePillar === 'plans' && <PillarPlans />}
        {activePillar === 'progress' && <PillarProgress />}
        {activePillar === 'family' && <PillarFamily />}
      </div>
    </div>
  );
}