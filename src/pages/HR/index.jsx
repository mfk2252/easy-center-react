import { useApp } from '../../context/AppContext';
import { lsGet } from '../../hooks/useStorage';
import Leaves from './Leaves';
import Salaries from './Salaries';
import HrAttendance from './HrAttendance';
import EmployeesList from './EmployeesList';
import Warnings from './Warnings';
import Bonuses from './Bonuses';

/**
 * لوحة "الموظفون" — نقطة الدخول الرئيسية. تعرض 6 أنظمة كبطاقات، مرتّبة حسب
 * تكرار الاستخدام الفعلي في مركز تربية خاصة/تأهيل (وليس نسخ تطبيق HR عام):
 * القائمة والحضور في الأعلى (استخدام يومي)، الإجازات والرواتب تحتها (شهري)،
 * الجزاءات والمكافآت أخيراً (نادر نسبياً).
 *
 * التنقل بين الأنظمة يستخدم activeView العام (go('hr-...')) بنفس الآلية
 * المعتمدة أصلاً في هذا الملف (hr-leaves, hr-salary, hr-att)، فلا حاجة لأي
 * تعديل في AppRouter.jsx.
 */
const SYSTEMS = [
  { key: 'hr-list', title: 'قائمة الموظفين', sub: 'الملفات والبيانات', icon: '👥', color: '#1a56db' },
  { key: 'hr-att', title: 'الحضور', sub: 'يومي وشهري', icon: '📅', color: '#059669' },
  { key: 'hr-leaves', title: 'الإجازات', sub: 'الطلبات والموافقات', icon: '🌴', color: '#0891b2' },
  { key: 'hr-salary', title: 'الرواتب', sub: 'الحساب الشهري', icon: '💰', color: '#d97706' },
  { key: 'hr-warnings', title: 'الجزاءات', sub: 'إنذارات وتوثيق', icon: '⚠️', color: '#dc2626' },
  { key: 'hr-bonuses', title: 'المكافآت', sub: 'تقدير وتحفيز', icon: '⭐', color: '#7c3aed' },
];

export default function HRPage() {
  const { activeView, go } = useApp();

  if (activeView === 'hr-list') return <EmployeesList/>;
  if (activeView === 'hr-leaves') return <Leaves/>;
  if (activeView === 'hr-salary') return <Salaries/>;
  if (activeView === 'hr-att') return <HrAttendance/>;
  if (activeView === 'hr-warnings') return <Warnings/>;
  if (activeView === 'hr-bonuses') return <Bonuses/>;

  const empCount = lsGet('employees').length;
  const pendingLeaves = lsGet('leaves').filter(l => l.status === 'pending').length;

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>👥 الموظفون</h2>
          <p>ستة أنظمة لإدارة الكوادر البشرية — مرتّبة حسب استخدامك اليومي الفعلي</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 14,
        }}
      >
        {SYSTEMS.map(s => (
          <button
            key={s.key}
            type="button"
            onClick={() => go(s.key)}
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
              position: 'relative',
            }}
            onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-3px)'; ev.currentTarget.style.boxShadow = 'var(--sh2)'; ev.currentTarget.style.borderColor = s.color; }}
            onMouseLeave={ev => { ev.currentTarget.style.transform = 'translateY(0)'; ev.currentTarget.style.boxShadow = 'var(--sh)'; ev.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            {s.key === 'hr-leaves' && pendingLeaves > 0 && (
              <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--err)', color: '#fff', fontSize: '.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>
                {pendingLeaves} معلّق
              </span>
            )}
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
              <span style={{ fontSize: '.76rem', color: 'var(--g5)' }}>
                {s.key === 'hr-list' ? `${empCount} موظف` : s.sub}
              </span>
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: s.color }}>فتح ←</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
