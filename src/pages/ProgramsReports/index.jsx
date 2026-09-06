import { useState, useEffect } from 'react';
import { useLang } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { lsGet } from '../../hooks/useStorage';
import { MEASUREMENT_CATEGORIES } from '../../utils/measurementBank';
import PillarAssessment from './PillarAssessment';
import PillarPlans from './PillarPlans';
import PillarProgress from './PillarProgress';
import PillarFamily from './PillarFamily';
import UnifiedBackButton from '../../components/ui/UnifiedBackButton';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';

/**
 * أقسام البرامج والتقارير في Easy Center
 * هيكلة متوافقة 100% مع نظام التصميم، حجم الخط الديناميكي، والألوان
 */
const SECTIONS = [
  {
    id: 'assessment',
    title: 'مركز التقييم والتشخيص',
    subtitle: 'المقاييس المقننة، التقييم المبدئي الشامل، وتحديد مستوى الأداء الحالي ونقاط القوة والاحتياج لكل طالب',
    icon: '🎯',
    tag: 'تشخيص ومقاييس',
    color: 'var(--pr)',
    accentBg: 'var(--pr-l)',
    badgeClass: 'b-bl',
    features: ['التقييم والتشخيص المبدئي', 'مكتبة المقاييس المقننة', 'سجل النتائج ونسب الإتقان', 'إرسال الملخص لواتساب'],
  },
  {
    id: 'plans',
    title: 'الخطط والبرامج الفردية (IEP)',
    subtitle: 'بناء البرامج التربوية والتأهيلية الفردية، بنك الأهداف التخصصي متعدد المجالات، وخطط تعديل السلوك',
    icon: '📋',
    tag: 'برامج وتدخل',
    color: 'var(--pur, #7c3aed)',
    accentBg: 'var(--pur-l, #f5f3ff)',
    badgeClass: 'b-pu',
    features: ['الخطط الفردية IEP', 'بنك الأهداف والاستيراد المجمع', 'خطط التدخل السلوكي BIP', 'طباعة وإرسال الخطط'],
  },
  {
    id: 'progress',
    title: 'التقارير الدورية ومتابعة الإنجاز',
    subtitle: 'إصدار وتوثيق التقارير الأسبوعية، الشهرية، النصف سنوية، والسنوية الشاملة لقياس التطور',
    icon: '📊',
    tag: 'متابعة دورية',
    color: 'var(--ok, #059669)',
    accentBg: 'var(--ok-l, #ecfdf5)',
    badgeClass: 'b-gr',
    features: ['تقارير الإنجاز الأسبوعية', 'التقارير الشهرية والفصلية', 'التقرير السنوي الشامل', 'مشاركة التقارير مع ولي الأمر'],
  },
  {
    id: 'family',
    title: 'الشراكة والتواصل الأسري',
    subtitle: 'توثيق محاضر لقاءات أولياء الأمور، المتابعة الإرشادية والمنزلية، ومركز الإرسال السريع',
    icon: '👨‍👩‍👧',
    tag: 'إرشاد وتواصل',
    color: 'var(--warn, #d97706)',
    accentBg: 'var(--warn-l, #fffbeb)',
    badgeClass: 'b-or',
    features: ['محاضر اجتماعات ولي الأمر', 'التوجيهات والتوصيات المنزلية', 'الإرسال المباشر للواتساب', 'أرشيف تواصل الأهل'],
  },
];

export default function ProgramsReportsHub() {
  const { t } = useLang();
  const { center } = useApp();
  
  const [currentView, setCurrentView] = useState(() => {
    return sessionStorage.getItem('scs_prog_active_view') || 'hub';
  });

  const [assessmentCategory, setAssessmentCategory] = useState(null);

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
    const directView = sessionStorage.getItem('scs_prog_active_view');
    if (directView && directView !== currentView) {
      setCurrentView(directView);
      const directCat = sessionStorage.getItem('scs_prog_active_category');
      if (directCat) {
        setAssessmentCategory(directCat);
        sessionStorage.removeItem('scs_prog_active_category');
      }
    }
  }, [currentView]);

  function navigateTo(viewId) {
    setAssessmentCategory(null);
    setCurrentView(viewId);
    sessionStorage.setItem('scs_prog_active_view', viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backToHub() {
    setAssessmentCategory(null);
    setCurrentView('hub');
    sessionStorage.removeItem('scs_prog_active_view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeSectionObj = SECTIONS.find(s => s.id === currentView);

  const activeCatMeta = (currentView === 'assessment' && assessmentCategory)
    ? (assessmentCategory === 'all'
        ? { id: 'all', name: 'جميع المقاييس السيكومترية', nameEn: 'All Diagnostic Scales', icon: '🌟', color: 'var(--pr)', description: 'استعراض وتصفح كافة المقاييس والأدوات التشخيصية المعتمدة بالمنظومة دفعة واحدة مع التصفية والبحث المتقدم.' }
        : MEASUREMENT_CATEGORIES.find(c => c.id === assessmentCategory) || { name: 'الفئة التشخيصية', icon: '📁', color: 'var(--pr)', description: '' })
    : null;

  // ==========================================
  // العرض في حالة فتح أحد الأقسام كصفحة كاملة مستقلة
  // ==========================================
  if (currentView !== 'hub' && activeSectionObj) {
    return (
      <div className="programs-section-page">
        {/* ترويسة الصفحة الموحدة للأقسام أو الفئات التشخيصية */}
        {activeCatMeta ? (
          /* المسار والترويسة عند الدخول لفئة تشخيصية فرعية */
          <UnifiedPageHeader
            icon={<span style={{ fontSize: '1.45rem' }}>{activeCatMeta.icon || '🎯'}</span>}
            iconBg={`${activeCatMeta.color || 'var(--pr)'}20`}
            iconColor={activeCatMeta.color || 'var(--pr)'}
            accentColor={activeCatMeta.color || activeSectionObj.color}
            title={activeCatMeta.name}
            subtitle={activeCatMeta.description || activeSectionObj.subtitle}
            badge={<span className="bdg b-bl">{activeCatMeta.name}</span>}
            onBack={() => setAssessmentCategory(null)}
            backLabel="العودة للفئات التشخيصية"
          />
        ) : (
          /* الترويسة الرئيسية الموحدة للقسم مع أزرار التنقل السريع بين الأقسام */
          <UnifiedPageHeader
            icon={<span style={{ fontSize: '1.45rem' }}>{activeSectionObj.icon}</span>}
            iconBg={activeSectionObj.accentBg}
            iconColor={activeSectionObj.color}
            accentColor={activeSectionObj.color}
            title={activeSectionObj.title}
            subtitle={activeSectionObj.subtitle}
            badge={<span className={`bdg ${activeSectionObj.badgeClass}`}>{activeSectionObj.tag}</span>}
            actions={
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SECTIONS.filter(s => s.id !== currentView).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className="btn btn-xs btn-g"
                    onClick={() => navigateTo(s.id)}
                    title={s.title}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>{s.icon}</span>
                    <span>{s.title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            }
            onBack={backToHub}
            backLabel="العودة للأقسام الرئيسية"
          />
        )}

        {/* محتوى الصفحة المستقلة المختارة */}
        <div className="section-content-wrapper">
          {currentView === 'assessment' && (
            <PillarAssessment
              onDataChange={refreshCounts}
              activeCategoryView={assessmentCategory}
              onCategoryChange={setAssessmentCategory}
            />
          )}
          {currentView === 'plans' && <PillarPlans onDataChange={refreshCounts} />}
          {currentView === 'progress' && <PillarProgress onDataChange={refreshCounts} />}
          {currentView === 'family' && <PillarFamily onDataChange={refreshCounts} />}
        </div>
      </div>
    );
  }

  // ==========================================
  // العرض الرئيسي: بطاقات الأقسام الأربعة المنسجمة كلياً مع هوية Easy Center
  // ==========================================
  return (
    <div>
      {/* ترويسة الصفحة الموحدة */}
      <UnifiedPageHeader
        icon="📚"
        title={t('progReports.title') || 'البرامج والخطط التأهيلية والتقارير'}
        subtitle="منظومة متكاملة لإدارة رحلة الطالب التأهيلية: المقاييس والتشخيص، الخطط الفردية (IEP)، التقارير الدورية، والتواصل الأسري"
        badge={`${stats.evalCount + stats.planCount + stats.reportCount + stats.meetingCount} سجل تأهيلي`}
      />

      {/* كروت الإحصائيات الأربعة المتوافقة مع النظام القياسي (.unified-stat-box) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="unified-stat-box" style={{ cursor: 'pointer' }} onClick={() => navigateTo('assessment')}>
          <div className="stat-label">🎯 تقييمات وتشخيصات</div>
          <div className="stat-val" style={{ color: 'var(--pr)' }}>{stats.evalCount}</div>
          <div className="stat-sub">سجل تشخيص واختبار مقنن</div>
        </div>
        <div className="unified-stat-box" style={{ cursor: 'pointer' }} onClick={() => navigateTo('plans')}>
          <div className="stat-label">📋 خطط فردية وبرامج</div>
          <div className="stat-val" style={{ color: 'var(--pur)' }}>{stats.planCount}</div>
          <div className="stat-sub">خطة IEP وسلوك BIP</div>
        </div>
        <div className="unified-stat-box" style={{ cursor: 'pointer' }} onClick={() => navigateTo('progress')}>
          <div className="stat-label">📊 تقارير دورية وإنجاز</div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>{stats.reportCount}</div>
          <div className="stat-sub">تقارير أسبوعية وشهرية وسنوية</div>
        </div>
        <div className="unified-stat-box" style={{ cursor: 'pointer' }} onClick={() => navigateTo('family')}>
          <div className="stat-label">👨‍👩‍👧 شراكة وتواصل أسري</div>
          <div className="stat-val" style={{ color: 'var(--warn)' }}>{stats.meetingCount}</div>
          <div className="stat-sub">محاضر وتواصل ومتابعة منزلية</div>
        </div>
      </div>

      {/* شبكة البطاقات الأربعة التفاعلية المتوافقة مع حجم الخط ولون النظام */}
      <div className="prog-hub-grid">
        {SECTIONS.map(sec => {
          let count = 0;
          if (sec.id === 'assessment') count = stats.evalCount;
          if (sec.id === 'plans') count = stats.planCount;
          if (sec.id === 'progress') count = stats.reportCount;
          if (sec.id === 'family') count = stats.meetingCount;

          return (
            <div
              key={sec.id}
              className="prog-card"
              onClick={() => navigateTo(sec.id)}
            >
              {/* شريط تمييز لوني جانبي */}
              <div
                className="prog-card-accent"
                style={{ background: sec.color }}
              />

              {/* رأس البطاقة */}
              <div>
                <div className="prog-card-header">
                  <div
                    className="prog-card-icon"
                    style={{
                      background: sec.accentBg,
                      color: sec.color,
                    }}
                  >
                    {sec.icon}
                  </div>
                  <span className={`bdg ${sec.badgeClass}`}>
                    {count} سجل
                  </span>
                </div>

                <h3 className="prog-card-title">
                  {sec.title}
                </h3>
                <p className="prog-card-subtitle">
                  {sec.subtitle}
                </p>

                {/* مزايا القسم الأساسية كشرائح خفيفة */}
                <div className="prog-card-features">
                  {sec.features.map((feat, idx) => (
                    <span key={idx} className="prog-feature-chip">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* تذييل البطاقة وزر الفتح */}
              <div className="prog-card-footer">
                <span
                  className="prog-card-action-text"
                  style={{ color: sec.color }}
                >
                  <span>فتح القسم</span>
                  <span>←</span>
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-p"
                  style={{
                    background: sec.color,
                    borderColor: sec.color,
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
