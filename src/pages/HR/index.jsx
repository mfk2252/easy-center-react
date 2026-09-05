import { useApp } from '../../context/AppContext';
import { lsGet } from '../../hooks/useStorage';
import { Users, Calendar, Palmtree, DollarSign, AlertTriangle, Award, UserPlus, ArrowLeft } from 'lucide-react';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';
import Leaves from './Leaves';
import Salaries from './Salaries';
import HrAttendance from './HrAttendance';
import EmployeesList from './EmployeesList';
import Warnings from './Warnings';
import Bonuses from './Bonuses';

/**
 * لوحة "الموظفون" — نقطة الدخول الرئيسية.
 * تصميم راقٍ متناسق مع منظومة المركز (Easy Center Design System)
 * يتطابق مع فخامة وهيكلية قسم الطلاب وقسم البرامج والتقارير.
 */
const SYSTEMS = [
  {
    key: 'hr-list',
    title: 'قائمة الموظفين والكوادر',
    sub: 'إدارة ملفات الكادر، المؤهلات، والبيانات الوظيفية',
    icon: <Users style={{ width: 24, height: 24 }} />,
    color: '#1a56db',
    features: ['الملفات الشخصية', 'المسميات والتخصصات', 'العقود والمرفقات']
  },
  {
    key: 'hr-att',
    title: 'الحضور والانصراف',
    sub: 'متابعة سجلات الحضور اليومية والشهرية',
    icon: <Calendar style={{ width: 24, height: 24 }} />,
    color: '#059669',
    features: ['الجدول الشهري', 'التسجيل اليومي', 'نسب الالتزام']
  },
  {
    key: 'hr-leaves',
    title: 'إدارة الإجازات',
    sub: 'تقديم ومراجعة طلبات الإجازات ومتابعة الرصيد',
    icon: <Palmtree style={{ width: 24, height: 24 }} />,
    color: '#0891b2',
    features: ['طلبات الإجازة', 'الموافقة والرفض', 'رصيد الإجازات السنوي']
  },
  {
    key: 'hr-salary',
    title: 'مسيرات الرواتب',
    sub: 'احتساب الرواتب، البدلات، المكافآت، والخصومات',
    icon: <DollarSign style={{ width: 24, height: 24 }} />,
    color: '#d97706',
    features: ['مسير الرواتب الشهري', 'البدلات والخصميات', 'توثيق الصرف']
  },
  {
    key: 'hr-warnings',
    title: 'الجزاءات والتنبيهات',
    sub: 'توثيق الإنذارات الرسمية والقرارات التأديبية',
    icon: <AlertTriangle style={{ width: 24, height: 24 }} />,
    color: '#dc2626',
    features: ['إنذارات موثقة', 'مشاركة عبر واتساب', 'طباعة النماذج الرسمية']
  },
  {
    key: 'hr-bonuses',
    title: 'المكافآت والتحفيز',
    sub: 'شهادات التقدير والمكافآت المالية والمعنوية',
    icon: <Award style={{ width: 24, height: 24 }} />,
    color: '#7c3aed',
    features: ['مكافآت تقديرية ومالية', 'نماذج التكريم', 'إشعارات عبر واتساب']
  },
];

export default function HRPage() {
  const { activeView, go, currentUser } = useApp();

  if (activeView === 'hr-list') return <EmployeesList/>;
  if (activeView === 'hr-leaves') return <Leaves/>;
  if (activeView === 'hr-salary') return <Salaries/>;
  if (activeView === 'hr-att') return <HrAttendance/>;
  if (activeView === 'hr-warnings') return <Warnings/>;
  if (activeView === 'hr-bonuses') return <Bonuses/>;

  const employees = lsGet('employees') || [];
  const empCount = employees.length;
  const specialistsCount = employees.filter(e => ['specialist_speech', 'specialist_pt', 'specialist_ot', 'specialist_psych', 'specialist_special_ed'].includes(e.role)).length;
  const pendingLeaves = (lsGet('leaves') || []).filter(l => l.status === 'pending').length;
  const canEdit = ['manager', 'vice'].includes(currentUser?.role);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl' }}>
      
      {/* الترويسة الموحدة للقسم */}
      <UnifiedPageHeader
        icon={<Users style={{ width: 24, height: 24 }} />}
        title="إدارة الكوادر والموارد البشرية"
        subtitle="منظومة متكاملة وشاملة لإدارة ملفات الموظفين، الحضور، الإجازات، مسيرات الرواتب، والتقييمات"
        badge={`${empCount} موظف مسجل`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {canEdit && (
              <button
                onClick={() => go('hr-list')}
                className="btn btn-p"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: '0.88rem' }}
              >
                <UserPlus style={{ width: 16, height: 16 }} />
                <span>قائمة الموظفين</span>
              </button>
            )}
            <button
              onClick={() => go('hr-att')}
              className="btn btn-g"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: '0.85rem' }}
            >
              <Calendar style={{ width: 16, height: 16, color: 'var(--ok)' }} />
              <span>الحضور والانصراف</span>
            </button>
          </div>
        }
      />

      {/* شريط الإحصائيات السريعة */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 20
        }}
      >
        <div className="unified-stat-box">
          <div className="stat-label">👥 إجمالي الكوادر</div>
          <div className="stat-val">{empCount}</div>
          <div className="stat-sub">موظف وموظفة بالمركز</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">🎯 الأخصائيون والكوادر الفنية</div>
          <div className="stat-val" style={{ color: 'var(--pr)' }}>{specialistsCount}</div>
          <div className="stat-sub">تخاطب، علاج طبيعي، وظيفي وتربية خاصة</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">🌴 طلبات الإجازة المعلقة</div>
          <div className="stat-val" style={{ color: pendingLeaves > 0 ? 'var(--warn)' : 'var(--text-main)' }}>
            {pendingLeaves}
          </div>
          <div className="stat-sub">{pendingLeaves > 0 ? 'تتطلب مراجعة واعتماد الإدارة' : 'لا توجد طلبات معلقة'}</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">💰 الأنظمة المتوفرة</div>
          <div className="stat-val" style={{ color: 'var(--pur)' }}>6</div>
          <div className="stat-sub">أنظمة إدارية ومالية متخصصة</div>
        </div>
      </div>

      {/* بطاقات الأنظمة الفرعية بتصميم مطابق لبطاقات البرامج والتقارير وشعب الطلاب */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {SYSTEMS.map(s => {
          let statBadge = null;
          if (s.key === 'hr-list') statBadge = `${empCount} موظف`;
          else if (s.key === 'hr-leaves' && pendingLeaves > 0) statBadge = `${pendingLeaves} معلّق`;

          return (
            <div
              key={s.key}
              onClick={() => go(s.key)}
              className="unified-card"
              style={{
                border: '1.5px solid var(--border-color)',
                borderRight: `5px solid ${s.color}`,
                minHeight: 200,
              }}
              onMouseEnter={ev => {
                ev.currentTarget.style.borderColor = s.color;
                ev.currentTarget.style.transform = 'translateY(-3px)';
                ev.currentTarget.style.boxShadow = 'var(--sh2)';
              }}
              onMouseLeave={ev => {
                ev.currentTarget.style.borderColor = 'var(--border-color)';
                ev.currentTarget.style.borderRightColor = s.color;
                ev.currentTarget.style.transform = 'translateY(0)';
                ev.currentTarget.style.boxShadow = 'var(--sh)';
              }}
            >
              {/* Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: `${s.color}15`,
                      color: s.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {s.icon}
                  </div>

                  {statBadge && (
                    <span
                      className="bdg"
                      style={{
                        fontSize: '0.76rem',
                        padding: '4px 10px',
                        background: `${s.color}18`,
                        color: s.color,
                        fontWeight: 700,
                      }}
                    >
                      {statBadge}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.5 }}>
                  {s.sub}
                </p>

                {/* Features chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                  {s.features.map(f => (
                    <span
                      key={f}
                      style={{
                        fontSize: '0.72rem',
                        background: 'var(--g0)',
                        color: 'var(--text-sub)',
                        padding: '3px 8px',
                        borderRadius: 'var(--r3)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer action link */}
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  إدارة النظام
                </span>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: s.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>دخول النظام</span>
                  <ArrowLeft style={{ width: 14, height: 14 }} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
