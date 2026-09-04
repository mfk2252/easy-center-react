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
        {/* شريط المسار والتنقل العلوي (Breadcrumbs) */}
        {activeCatMeta ? (
          /* المسار العميق عند الدخول لفئة تشخيصية فرعية */
          <div className="ph" style={{ marginBottom: 14 }}>
            <div className="ph-t" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: '0.88rem' }}>
              <button
                type="button"
                className="btn btn-g btn-xs"
                onClick={backToHub}
                style={{ fontWeight: 600, borderRadius: 'var(--r2)', padding: '4px 10px' }}
              >
                <span>🏠</span>
                <span>الرئيسية</span>
              </button>
              <span style={{ color: 'var(--g5)', fontSize: '0.8rem' }}>&gt;</span>
              <button
                type="button"
                className="btn btn-g btn-xs"
                onClick={backToHub}
                style={{ fontWeight: 600, borderRadius: 'var(--r2)', padding: '4px 10px' }}
              >
                <span>البرامج والتقارير</span>
              </button>
              <span style={{ color: 'var(--g5)', fontSize: '0.8rem' }}>&gt;</span>
              <button
                type="button"
                className="btn btn-g btn-xs"
                onClick={() => setAssessmentCategory(null)}
                style={{ fontWeight: 600, borderRadius: 'var(--r2)', padding: '4px 10px', color: 'var(--pr)' }}
              >
                <span>🎯</span>
                <span>مركز التقييم والتشخيص</span>
              </button>
              <span style={{ color: 'var(--g5)', fontSize: '0.8rem' }}>&gt;</span>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                <span>{activeCatMeta.icon}</span>
                <span>{activeCatMeta.name}</span>
              </span>
            </div>

            <div className="ph-a" style={{ display: 'flex', gap: 6 }}>
              <span className="bdg b-bl" style={{ fontSize: '0.78rem' }}>
                {activeCatMeta.name}
              </span>
            </div>
          </div>
        ) : (
          /* المسار الافتراضي عند التواجد في الصفحة الرئيسية للقسم */
          <div className="ph" style={{ marginBottom: 14 }}>
            <div className="ph-t" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <UnifiedBackButton
                onClick={backToHub}
                label="العودة للأقسام الرئيسية"
                size="sm"
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--g5)' }}>
                <span>/</span>
                <span style={{ fontWeight: 800, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span>{activeSectionObj.icon}</span>
                  <span>{activeSectionObj.title}</span>
                </span>
              </div>
            </div>

            <div className="ph-a" style={{ display: 'flex', gap: 6 }}>
              <span className={`bdg ${activeSectionObj.badgeClass}`}>
                {activeSectionObj.tag}
              </span>
            </div>
          </div>
        )}

        {/* ترويسة الصفحة الحالية (Banner) */}
        {activeCatMeta ? (
          /* ترويسة مدمجة داخل صفحة الفئة الفرعية مع زر العودة للفئات على اليسار وإخفاء الأزرار الخارجية */
          <div
            className="prog-page-banner"
            style={{
              borderRight: `4px solid ${activeCatMeta.color || activeSectionObj.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <div
                className="prog-page-icon"
                style={{
                  background: `${activeCatMeta.color || 'var(--pr)'}15`,
                  color: activeCatMeta.color || 'var(--pr)',
                }}
              >
                {activeCatMeta.icon || '🎯'}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 className="prog-page-title" style={{ margin: 0, fontWeight: 700 }}>
                  {activeCatMeta.name}
                </h3>
                <p className="prog-page-subtitle" style={{ margin: '4px 0 0 0', fontWeight: 400 }}>
                  {activeCatMeta.description || activeSectionObj.subtitle}
                </p>
              </div>
            </div>

            {/* زر العودة للفئات المدمج في ترويسة القسم ومحاذى لليسار */}
            <UnifiedBackButton
              onClick={() => setAssessmentCategory(null)}
              label="العودة للفئات"
            />
          </div>
        ) : (
          /* الترويسة الرئيسية للقسم مع أزرار التنقل السريع بين الأقسام */
          <div
            className="prog-page-banner"
            style={{
              borderRight: `4px solid ${activeSectionObj.color}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <div
                className="prog-page-icon"
                style={{
                  background: activeSectionObj.accentBg,
                  color: activeSectionObj.color,
                }}
              >
                {activeSectionObj.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 className="prog-page-title">
                  {activeSectionObj.title}
                </h3>
                <p className="prog-page-subtitle">
                  {activeSectionObj.subtitle}
                </p>
              </div>
            </div>

            {/* أزرار الانتقال السريع بين الأقسام */}
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
          </div>
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
      {/* ترويسة الصفحة القياسية */}
      <div className="ph">
        <div className="ph-t">
          <h2>📚 {t('progReports.title') || 'البرامج والخطط التأهيلية والتقارير'}</h2>
          <p>
            منظومة متكاملة لإدارة رحلة الطالب التأهيلية: اختر القسم للدخول إلى صفحته المتخصصة وإدارته
          </p>
        </div>
      </div>

      {/* كروت الإحصائيات الأربعة المتوافقة مع النظام القياسي (.stats و .sc) */}
      <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 16 }}>
        <div className="sc" style={{ borderRightColor: 'var(--pr)', cursor: 'pointer' }} onClick={() => navigateTo('assessment')}>
          <div className="lb">🎯 تقييمات وتشخيصات</div>
          <div className="vl">{stats.evalCount}</div>
          <div className="sb">سجل تشخيص واختبار</div>
        </div>
        <div className="sc v" style={{ borderRightColor: 'var(--pur, #7c3aed)', cursor: 'pointer' }} onClick={() => navigateTo('plans')}>
          <div className="lb">📋 خطط فردية وبرامج</div>
          <div className="vl">{stats.planCount}</div>
          <div className="sb">خطة IEP وسلوك BIP</div>
        </div>
        <div className="sc g" style={{ borderRightColor: 'var(--ok, #059669)', cursor: 'pointer' }} onClick={() => navigateTo('progress')}>
          <div className="lb">📊 تقارير دورية وإنجاز</div>
          <div className="vl">{stats.reportCount}</div>
          <div className="sb">تقارير أسبوعية وشهرية وسنوية</div>
        </div>
        <div className="sc o" style={{ borderRightColor: 'var(--warn, #d97706)', cursor: 'pointer' }} onClick={() => navigateTo('family')}>
          <div className="lb">👨‍👩‍👧 شراكة وتواصل أسري</div>
          <div className="vl">{stats.meetingCount}</div>
          <div className="sb">محاضر وتواصل ومتابعة</div>
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
