import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { lsGet } from '../../hooks/useStorage';
import PillarAssessment from './PillarAssessment';
import PillarPlans from './PillarPlans';
import PillarProgress from './PillarProgress';
import PillarFamily from './PillarFamily';

/**
 * أقسام البرامج والتقارير في Easy Center
 * هيكلة منظمة وواضحة تمثل رحلة الطالب الكاملة داخل المركز
 */
const SECTIONS = [
  {
    id: 'assessment',
    title: 'مركز التقييم والتشخيص',
    subtitle: 'المقاييس المقننة، التقييم المبدئي الشامل، وتحديد مستوى الأداء الحالي ونقاط القوة والاحتياج لكل طالب',
    icon: '🎯',
    tag: 'تشخيص ومقاييس',
    color: '#1a56db',
    accentBg: '#eff6ff',
    badgeClass: 'b-bl',
    features: ['التقييم والتشخيص المبدئي', 'مكتبة المقاييس المقننة', 'سجل النتائج ونسب الإتقان', 'إرسال الملخص لواتساب'],
  },
  {
    id: 'plans',
    title: 'الخطط والبرامج الفردية (IEP)',
    subtitle: 'بناء البرامج التربوية والتأهيلية الفردية، بنك الأهداف التخصصي متعدد المجالات، وخطط تعديل السلوك',
    icon: '📋',
    tag: 'برامج وتدخل',
    color: '#7c3aed',
    accentBg: '#f5f3ff',
    badgeClass: 'b-pu',
    features: ['الخطط الفردية IEP', 'بنك الأهداف والاستيراد المجمع', 'خطط التدخل السلوكي BIP', 'طباعة وإرسال الخطط'],
  },
  {
    id: 'progress',
    title: 'التقارير الدورية ومتابعة الإنجاز',
    subtitle: 'إصدار وتوثيق التقارير الأسبوعية، الشهرية، النصف سنوية، والسنوية الشاملة لقياس التطور',
    icon: '📊',
    tag: 'متابعة دورية',
    color: '#059669',
    accentBg: '#ecfdf5',
    badgeClass: 'b-gr',
    features: ['تقارير الإنجاز الأسبوعية', 'التقارير الشهرية والفصلية', 'التقرير السنوي الشامل', 'مشاركة التقارير مع ولي الأمر'],
  },
  {
    id: 'family',
    title: 'الشراكة والتواصل الأسري',
    subtitle: 'توثيق محاضر لقاءات أولياء الأمور، المتابعة الإرشادية والمنزلية، ومركز الإرسال السريع',
    icon: '👨‍👩‍👧',
    tag: 'إرشاد وتواصل',
    color: '#db2777',
    accentBg: '#fdf2f8',
    badgeClass: 'b-or',
    features: ['محاضر اجتماعات ولي الأمر', 'التوجيهات والتوصيات المنزلية', 'الإرسال المباشر للواتساب', 'أرشيف تواصل الأهل'],
  },
];

export default function ProgramsReportsHub() {
  const { t } = useLang();
  const { center } = useApp();
  
  // activeViewMode: 'hub' (صفحة الأقسام الرئيسية) أو 'assessment' | 'plans' | 'progress' | 'family' (صفحة فرعية مستقلة)
  const [currentView, setCurrentView] = useState(() => {
    return sessionStorage.getItem('scs_prog_active_view') || 'hub';
  });

  const [stats, setStats] = useState({
    evalCount: 0,
    planCount: 0,
    reportCount: 0,
    meetingCount: 0,
  });

  function refreshCounts() {
    const evals = (lsGet('progEvaluations') || []).length + (lsGet('studentAssessments') || []).length;
    const plans = (lsGet('progPrograms') || []).length + (lsGet('progBehaviorReports') || []).length;
    const reports = (lsGet('progWeeklyReports') || []).length +
      (lsGet('progMonthlyReports') || []).length +
      (lsGet('progSemiAnnualReports') || []).length +
      (lsGet('progAnnualReports') || []).length +
      (lsGet('progReports') || []).length;
    const meetings = (lsGet('progParentMeetings') || []).length;

    setStats({
      evalCount: evals,
      planCount: plans,
      reportCount: reports,
      meetingCount: meetings,
    });
  }

  useEffect(() => {
    refreshCounts();
  }, [currentView]);

  function navigateTo(viewId) {
    setCurrentView(viewId);
    sessionStorage.setItem('scs_prog_active_view', viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backToHub() {
    setCurrentView('hub');
    sessionStorage.removeItem('scs_prog_active_view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeSectionObj = SECTIONS.find(s => s.id === currentView);

  // ==========================================
  // العرض في حالة فتح أحد الأقسام كصفحة كاملة مستقلة
  // ==========================================
  if (currentView !== 'hub' && activeSectionObj) {
    return (
      <div className="programs-section-page">
        {/* شريط المسار والتنقل العلوي (Breadcrumbs & Back Bar) */}
        <div className="ph" style={{ marginBottom: 16 }}>
          <div className="ph-t" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={backToHub}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 700,
                fontSize: '.9rem',
                padding: '8px 14px',
                borderRadius: 'var(--r3)'
              }}
            >
              <span>➡️</span>
              <span>العودة لأقسام البرامج والتقارير</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', color: 'var(--g5)' }}>
              <span>/</span>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>{activeSectionObj.icon}</span>
                <span>{activeSectionObj.title}</span>
              </span>
            </div>
          </div>

          <div className="ph-a" style={{ display: 'flex', gap: 8 }}>
            <span className={`bdg ${activeSectionObj.badgeClass}`} style={{ fontSize: '.84rem', padding: '5px 12px' }}>
              {activeSectionObj.tag}
            </span>
          </div>
        </div>

        {/* ترويسة الصفحة الحالية */}
        <div
          className="card"
          style={{
            marginBottom: 20,
            padding: '16px 20px',
            borderRight: `4px solid ${activeSectionObj.color}`,
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${activeSectionObj.color}18`,
                color: activeSectionObj.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                flexShrink: 0
              }}
            >
              {activeSectionObj.icon}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {activeSectionObj.title}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '.84rem', color: 'var(--text-sub)' }}>
                {activeSectionObj.subtitle}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {SECTIONS.filter(s => s.id !== currentView).map(s => (
              <button
                key={s.id}
                type="button"
                className="btn btn-xs btn-g"
                onClick={() => navigateTo(s.id)}
                title={s.title}
                style={{ fontSize: '.78rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* محتوى الصفحة المستقلة المختارة */}
        <div className="section-content-wrapper">
          {currentView === 'assessment' && <PillarAssessment onDataChange={refreshCounts} />}
          {currentView === 'plans' && <PillarPlans onDataChange={refreshCounts} />}
          {currentView === 'progress' && <PillarProgress onDataChange={refreshCounts} />}
          {currentView === 'family' && <PillarFamily onDataChange={refreshCounts} />}
        </div>
      </div>
    );
  }

  // ==========================================
  // العرض الرئيسي: بطاقات الأقسام (بدون ملفات فرعية تحتها)
  // ==========================================
  return (
    <div>
      {/* Page Header */}
      <div className="ph">
        <div className="ph-t">
          <h2>📚 {t('progReports.title') || 'البرامج والخطط التأهيلية والتقارير'}</h2>
          <p>
            منظومة متكاملة لإدارة رحلة الطالب التأهيلية: اختر القسم للدخول إلى صفحته المتخصصة وإدارته
          </p>
        </div>
      </div>

      {/* إحصائيات عامة سريعة في قمة الصفحة */}
      <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 20 }}>
        <div className="sc bl">
          <div className="lb">🎯 تقييمات وتشخيصات</div>
          <div className="vl">{stats.evalCount}</div>
        </div>
        <div className="sc pu">
          <div className="lb">📋 خطط فردية وبرامج</div>
          <div className="vl">{stats.planCount}</div>
        </div>
        <div className="sc gr">
          <div className="lb">📊 تقارير دورية وإنجاز</div>
          <div className="vl">{stats.reportCount}</div>
        </div>
        <div className="sc or">
          <div className="lb">👨‍👩‍👧 شراكة وتواصل أسري</div>
          <div className="vl">{stats.meetingCount}</div>
        </div>
      </div>

      {/* شبكة الأقسام الرئيسية — كل قسم كبطاقة مستقلة تفتح صفحتها فقط عند النقر */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
          marginTop: 10,
        }}
      >
        {SECTIONS.map(sec => {
          let count = 0;
          if (sec.id === 'assessment') count = stats.evalCount;
          if (sec.id === 'plans') count = stats.planCount;
          if (sec.id === 'progress') count = stats.reportCount;
          if (sec.id === 'family') count = stats.meetingCount;

          return (
            <div
              key={sec.id}
              className="card clickable"
              onClick={() => navigateTo(sec.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px 22px',
                borderRadius: 'var(--r)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                transition: 'all .2s ease',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 260,
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = sec.color;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--sh)';
              }}
            >
              {/* شريط لوني جانبي رفيع */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 5,
                  background: sec.color,
                }}
              />

              {/* رأس بطاقة القسم */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: `${sec.color}15`,
                      color: sec.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.7rem',
                    }}
                  >
                    {sec.icon}
                  </div>
                  <span className={`bdg ${sec.badgeClass}`} style={{ fontSize: '.8rem', fontWeight: 800 }}>
                    {count} سجل
                  </span>
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {sec.title}
                </h3>
                <p style={{ margin: 0, fontSize: '.86rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                  {sec.subtitle}
                </p>

                {/* مزايا القسم الأساسية */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                  {sec.features.map((feat, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '.75rem',
                        background: 'var(--g0)',
                        color: 'var(--text-sub)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* زر الدخول لفتح الصفحة */}
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '.84rem', fontWeight: 800, color: sec.color, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span>فتح الصفحة المتخصصة</span>
                  <span>←</span>
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-p"
                  style={{
                    background: sec.color,
                    borderColor: sec.color,
                    padding: '6px 14px',
                    fontSize: '.82rem',
                    fontWeight: 700,
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    navigateTo(sec.id);
                  }}
                >
                  دخول ↗
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
