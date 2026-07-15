import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import { lsGet } from '../../hooks/useStorage';
import InitialAssessment from './InitialAssessment';
import LongTermPrograms from './LongTermPrograms';
import GenericSystem from './GenericSystem';

/**
 * لوحة الأنظمة العشرة — نقطة الدخول الوحيدة لقسم "البرامج والتقارير".
 * كل نظام معزول بمجموعة بيانات (collectionKey) خاصة به، ومحمي تلقائياً
 * حسب المركز الحالي عبر lsGet/lsAdd (نفس آلية باقي التطبيق).
 *
 * الأنظمة 1 و2 لها ملفات مخصصة (منطق موجود مسبقاً). باقي الأنظمة تستخدم
 * GenericSystem كقالب فعلي وعامل الآن، وتُستبدل لاحقاً بملفات مخصصة فور
 * استلام التصميم النهائي لكل نظام — دون أي تعديل على هذا الملف.
 */
const SYSTEMS = [
  { key: 'initial', title: 'التقرير المبدئي', icon: '📋', collectionKey: 'progEvaluations', color: '#1a56db', custom: true },
  { key: 'longterm', title: 'البرامج طويلة المدى', icon: '📘', collectionKey: 'progPrograms', color: '#7c3aed', custom: true },
  { key: 'weekly', title: 'التقارير الأسبوعية', icon: '📅', collectionKey: 'progWeeklyReports', color: '#059669' },
  { key: 'monthly', title: 'التقارير الشهرية', icon: '🗓️', collectionKey: 'progMonthlyReports', color: '#0891b2' },
  { key: 'parentMeeting', title: 'تقارير لقاء ولي الأمر', icon: '👨‍👩‍👧', collectionKey: 'progParentMeetings', color: '#db2777' },
  { key: 'semiAnnual', title: 'التقرير النصف سنوي', icon: '📊', collectionKey: 'progSemiAnnualReports', color: '#d97706' },
  { key: 'annual', title: 'التقرير السنوي', icon: '📈', collectionKey: 'progAnnualReports', color: '#dc2626' },
  { key: 'behaviorMod', title: 'تقارير خطة تعديل السلوك', icon: '📐', collectionKey: 'progBehaviorReports', color: '#7c3aed' },
  { key: 'learningDiff', title: 'تقارير صعوبات التعلم', icon: '🧩', collectionKey: 'progLearningDifficultyReports', color: '#0f172a' },
  { key: 'generic', title: 'التقارير (عام)', icon: '📑', collectionKey: 'progReports', color: '#64748b' },
];

export default function ProgramsReportsHub() {
  const { t } = useLang();
  const [activeSystem, setActiveSystem] = useState(null);

  const system = SYSTEMS.find(s => s.key === activeSystem);

  function goBack() { setActiveSystem(null); }

  if (system) {
    if (system.key === 'initial') return <InitialAssessment onBack={goBack} />;
    if (system.key === 'longterm') return <LongTermPrograms onBack={goBack} />;
    return (
      <GenericSystem
        title={system.title}
        icon={system.icon}
        collectionKey={system.collectionKey}
        onBack={goBack}
      />
    );
  }

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>📚 {t('progReports.title')}</h2>
          <p>عشرة أنظمة متخصصة لتوثيق رحلة كل طالب — كل بياناتك معزولة بالكامل عن أي مركز آخر</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: 14,
        }}
      >
        {SYSTEMS.map(s => {
          const count = lsGet(s.collectionKey).length;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveSystem(s.key)}
              style={{
                textAlign: 'right',
                cursor: 'pointer',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: '20px 18px',
                boxShadow: 'var(--sh)',
                transition: 'transform .18s, box-shadow .18s, border-color .18s',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontFamily: 'inherit',
              }}
              onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-3px)'; ev.currentTarget.style.boxShadow = 'var(--sh2)'; ev.currentTarget.style.borderColor = s.color; }}
              onMouseLeave={ev => { ev.currentTarget.style.transform = 'translateY(0)'; ev.currentTarget.style.boxShadow = 'var(--sh)'; ev.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div
                style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: s.color + '18', color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.35rem',
                }}
              >
                {s.icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: '.94rem', color: 'var(--text-main)' }}>{s.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ fontSize: '.76rem', color: 'var(--g5)' }}>{count} سجل</span>
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: s.color }}>فتح ←</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
