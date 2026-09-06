import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Users, Calendar, Stethoscope, DollarSign, 
  Filter, Printer, Briefcase, CheckCircle2, 
  Activity, School, Layers, Sparkles, TrendingUp, Clock, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { lsGet } from '../hooks/useStorage';
import { todayStr } from '../utils/dateHelpers';
import { ROLES, getCurrencySymbol } from '../utils/constants';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';

function roleLabel(r) { return ROLES[r] || r || '—'; }

function pad2(n) { return String(n).padStart(2, '0'); }

function isoFromDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function weekRangeFrom(iso) {
  const d = new Date(iso + 'T12:00:00');
  const dow = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - dow);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: isoFromDate(start), end: isoFromDate(end) };
}

function inDateFilter(dateStr, mode, year, month, weekAnchor) {
  if (!dateStr) return false;
  if (mode === 'year') return dateStr.startsWith(String(year));
  if (mode === 'month') return dateStr.startsWith(`${year}-${pad2(Number(month))}`);
  if (mode === 'week') {
    const { start, end } = weekRangeFrom(weekAnchor);
    return dateStr >= start && dateStr <= end;
  }
  return true;
}

export default function Reports() {
  const { currentUser, center } = useApp();
  const [tab, setTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attStu, setAttStu] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [incomeRows, setIncomeRows] = useState([]);
  const [expenseRows, setExpenseRows] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchStudent, setSearchStudent] = useState('');

  const today = todayStr();
  const cy = new Date().getFullYear();
  const [filterMode, setFilterMode] = useState('month');
  const [filterYear, setFilterYear] = useState(String(cy));
  const [filterMonth, setFilterMonth] = useState(String(new Date().getMonth() + 1));
  const [weekAnchor, setWeekAnchor] = useState(today);

  const canSeeFinance = currentUser?.role === 'manager';

  useEffect(() => {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    setSessions(lsGet('sessions'));
    setAttStu(lsGet('attStu'));
    setLeaves(lsGet('leaves'));
    setIncomeRows(lsGet('income'));
    setExpenseRows(lsGet('expenses'));
    setSections(lsGet('sections'));
  }, []);

  const yearOptions = useMemo(() => {
    const ys = [];
    for (let y = cy; y >= cy - 8; y--) ys.push(String(y));
    return ys;
  }, [cy]);

  const sessionsF = useMemo(
    () => sessions.filter(s => inDateFilter(s.date, filterMode, filterYear, filterMonth, weekAnchor)),
    [sessions, filterMode, filterYear, filterMonth, weekAnchor]
  );
  const attF = useMemo(
    () => attStu.filter(a => inDateFilter(a.date, filterMode, filterYear, filterMonth, weekAnchor)),
    [attStu, filterMode, filterYear, filterMonth, weekAnchor]
  );
  const incomeF = incomeRows.filter(x => inDateFilter(x.date, filterMode, filterYear, filterMonth, weekAnchor));
  const expensesF = expenseRows.filter(x => inDateFilter(x.date, filterMode, filterYear, filterMonth, weekAnchor));
  const leavesF = leaves.filter(l => inDateFilter(l.from || l.date, filterMode, filterYear, filterMonth, weekAnchor) || inDateFilter(l.to, filterMode, filterYear, filterMonth, weekAnchor));

  const active = students.filter(s => s.status === 'active');
  const waitlist = students.filter(s => s.status === 'waitlist');
  const diagCount = active.reduce((acc, s) => { 
    const d = s.diagnosis || 'غير محدد';
    acc[d] = (acc[d] || 0) + 1; 
    return acc; 
  }, {});

  const progCount = {
    morning: students.filter(s => s.progMorning?.enabled).length,
    evening: students.filter(s => s.progEvening?.enabled).length,
    sessions: students.filter(s => s.progSessions?.enabled).length,
    online: students.filter(s => s.progOnline?.enabled).length,
  };

  const studentsJoinedF = students.filter(s => inDateFilter(s.joinDate, filterMode, filterYear, filterMonth, weekAnchor));

  const income = incomeF.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const expenses = expensesF.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const netProfit = income - expenses;

  // Session completion stats
  const sessionsDone = sessionsF.filter(s => s.status === 'done').length;
  const sessionCompletionRate = sessionsF.length > 0 ? Math.round((sessionsDone / sessionsF.length) * 100) : 0;

  // Attendance rate
  const presentCount = attF.filter(a => a.status === 'present').length;
  const attendanceRate = attF.length > 0 ? Math.round((presentCount / attF.length) * 100) : 100;

  const TABS = [
    { id: 'overview', label: 'نظرة عامة', icon: <BarChart3 style={{ width: 16, height: 16 }} /> },
    { id: 'students', label: 'تحليلات الطلاب', icon: <Users style={{ width: 16, height: 16 }} /> },
    { id: 'sessions', label: 'الجلسات والتأهيل', icon: <Stethoscope style={{ width: 16, height: 16 }} /> },
    { id: 'hr', label: 'الكادر البشري', icon: <Briefcase style={{ width: 16, height: 16 }} /> },
    canSeeFinance && { id: 'finance', label: 'البيانات المالية', icon: <DollarSign style={{ width: 16, height: 16 }} /> },
  ].filter(Boolean);

  const filterLabel =
    filterMode === 'year'
      ? `عام ${filterYear}`
      : filterMode === 'month'
        ? `${filterYear} / شهر ${filterMonth}`
        : `أسبوع ${weekAnchor}`;

  function applyPreset(type) {
    const d = new Date();
    if (type === 'today') {
      setFilterMode('week');
      setWeekAnchor(todayStr());
    } else if (type === 'this_month') {
      setFilterMode('month');
      setFilterYear(String(d.getFullYear()));
      setFilterMonth(String(d.getMonth() + 1));
    } else if (type === 'this_year') {
      setFilterMode('year');
      setFilterYear(String(d.getFullYear()));
    }
  }

  const filteredStudentList = useMemo(() => {
    if (!searchStudent.trim()) return students;
    const q = searchStudent.toLowerCase();
    return students.filter(s => (s.name || '').toLowerCase().includes(q) || (s.diagnosis || '').toLowerCase().includes(q));
  }, [students, searchStudent]);

  return (
    <div>
      <UnifiedPageHeader
        icon="📊"
        title="التقارير والإحصائيات الشاملة"
        subtitle="مؤشرات الأداء التشغيلي والتأهيلي، نسب الحضور، وتحليلات الجلسات والمالية بفلترة زمنية مرنة"
        badge={filterLabel}
        actions={
          <button 
            type="button" 
            className="btn btn-g no-print" 
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <Printer style={{ width: 16, height: 16 }} />
            <span>طباعة التقرير</span>
          </button>
        }
      />

      {/* شريط الفلترة الزمني الأنيق */}
      <div className="wg" style={{ marginBottom: 18, border: '1px solid var(--border-color)', borderRadius: 'var(--r)' }}>
        <div className="wg-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter style={{ width: 16, height: 16, color: 'var(--pr)' }} />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>نطاق التقرير والفلترة الزمنية</h3>
          </div>
          
          {/* Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 600 }}>اختصارات سريعة:</span>
            <button 
              type="button" 
              className={`btn btn-xs ${filterMode === 'month' && filterMonth === String(new Date().getMonth() + 1) ? 'btn-p' : 'btn-g'}`}
              onClick={() => applyPreset('this_month')}
            >
              هذا الشهر
            </button>
            <button 
              type="button" 
              className={`btn btn-xs ${filterMode === 'year' && filterYear === String(cy) ? 'btn-p' : 'btn-g'}`}
              onClick={() => applyPreset('this_year')}
            >
              هذا العام
            </button>
            <button 
              type="button" 
              className={`btn btn-xs ${filterMode === 'week' ? 'btn-p' : 'btn-g'}`}
              onClick={() => applyPreset('today')}
            >
              هذا الأسبوع
            </button>
          </div>
        </div>

        <div className="wg-b" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end', padding: '14px 18px' }}>
          <div className="fl" style={{ minWidth: 130 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>نوع الفترة</label>
            <select value={filterMode} onChange={e => setFilterMode(e.target.value)} style={{ height: 38, borderRadius: 8 }}>
              <option value="month">شهر محدد 📅</option>
              <option value="year">سنة كاملة 📆</option>
              <option value="week">أسبوع محدد ⏱️</option>
            </select>
          </div>

          <div className="fl" style={{ minWidth: 110 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>السنة</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ height: 38, borderRadius: 8 }}>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {filterMode === 'month' && (
            <div className="fl" style={{ minWidth: 120 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>الشهر</label>
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ height: 38, borderRadius: 8 }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={String(m)}>شهر {m}</option>
                ))}
              </select>
            </div>
          )}

          {filterMode === 'week' && (
            <div className="fl" style={{ minWidth: 160 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>تاريخ ضمن الأسبوع</label>
              <input 
                type="date" 
                value={weekAnchor} 
                onChange={e => setWeekAnchor(e.target.value)} 
                style={{ height: 38, borderRadius: 8 }}
              />
            </div>
          )}

          <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="bdg b-bl" style={{ fontSize: '0.82rem', padding: '6px 12px', fontWeight: 700 }}>
              الفترة النشطة: {filterLabel}
            </span>
          </div>
        </div>
      </div>

      {/* بطاقات المؤشرات الرئيسية القياسية */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="unified-stat-box" style={{ borderRight: '4px solid var(--ok)' }}>
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users style={{ width: 15, height: 15, color: 'var(--ok)' }} />
            <span>الطلاب النشطون</span>
          </div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>{active.length}</div>
          <div className="stat-sub">من إجمالي {students.length} طالب مسجل بالمركز</div>
        </div>

        <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pr)' }}>
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Stethoscope style={{ width: 15, height: 15, color: 'var(--pr)' }} />
            <span>جلسات الفترة</span>
          </div>
          <div className="stat-val" style={{ color: 'var(--pr)' }}>{sessionsF.length}</div>
          <div className="stat-sub">{sessionsDone} منجزة ({sessionCompletionRate}% نسبة الإنجاز)</div>
        </div>

        <div className="unified-stat-box" style={{ borderRight: '4px solid var(--warn)' }}>
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 style={{ width: 15, height: 15, color: 'var(--warn)' }} />
            <span>حضور الطلاب</span>
          </div>
          <div className="stat-val" style={{ color: 'var(--warn)' }}>{presentCount}</div>
          <div className="stat-sub">{attendanceRate}% نسبة الانتظام والحضور بالفترة</div>
        </div>

        <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pur, #7c3aed)' }}>
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Briefcase style={{ width: 15, height: 15, color: 'var(--pur, #7c3aed)' }} />
            <span>الكادر الوظيفي</span>
          </div>
          <div className="stat-val" style={{ color: 'var(--pur, #7c3aed)' }}>{emps.length}</div>
          <div className="stat-sub">أخصائيين ومعلمين وإداريين على رأس العمل</div>
        </div>

        {canSeeFinance && (
          <div className="unified-stat-box" style={{ borderRight: `4px solid ${netProfit >= 0 ? 'var(--ok)' : 'var(--err)'}` }}>
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <DollarSign style={{ width: 15, height: 15, color: netProfit >= 0 ? 'var(--ok)' : 'var(--err)' }} />
              <span>الصافي المالي بالفترة</span>
            </div>
            <div className="stat-val" style={{ color: netProfit >= 0 ? 'var(--ok)' : 'var(--err)' }}>
              {netProfit.toLocaleString()} {getCurrencySymbol(center?.currency)}
            </div>
            <div className="stat-sub">إيرادات: {income.toLocaleString()} | مصروفات: {expenses.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* التبويبات الحديثة المتوافقة مع التصميم الموحد */}
      <div className="tabs" style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-color)', marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'on' : ''}`}
            onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: tab === t.id ? 800 : 600 }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 1. تبويب النظرة العامة */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="g2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
            {/* توزيع الطلاب حسب التشخيص */}
            <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)' }}>
              <div className="wg-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>🧩</span>
                  <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800 }}>توزيع الطلاب حسب التشخيص والفئة</h3>
                </div>
                <span className="bdg b-bl">{Object.keys(diagCount).length} تشخيصات</span>
              </div>
              <div className="wg-b" style={{ padding: '16px 20px' }}>
                {Object.entries(diagCount).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-sub)' }}>لا توجد بيانات طلاب مسجلة بعد</div>
                ) : (
                  Object.entries(diagCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([diag, count]) => {
                      const pct = Math.round((count / Math.max(active.length, 1)) * 100);
                      return (
                        <div key={diag} style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: '0.86rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{diag}</span>
                            <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>{count} طالب ({pct}%)</span>
                          </div>
                          <div style={{ width: '100%', height: 8, background: 'var(--g1)', borderRadius: 10, overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${pct}%`, 
                                height: '100%', 
                                background: 'var(--pr)', 
                                borderRadius: 10,
                                transition: 'width 0.4s ease'
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* الأقسام والفترات والصفوف */}
            <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)' }}>
              <div className="wg-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>🏫</span>
                  <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800 }}>الأقسام والصفوف التأهيلية</h3>
                </div>
                <span className="bdg b-gr">{sections.length} صفوف مخصصة</span>
              </div>
              <div className="wg-b" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: '☀️ البرنامج الصباحي', count: progCount.morning, color: '#f59e0b' },
                    { label: '🌙 البرنامج المسائي', count: progCount.evening, color: '#6366f1' },
                    { label: '🩺 جلسات تخصصية', count: progCount.sessions, color: '#10b981' },
                    { label: '🌐 الجلسات الأونلاين', count: progCount.online, color: '#06b6d4' },
                  ].map((p) => (
                    <div key={p.label} style={{ background: 'var(--g0)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: 4 }}>{p.label}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: p.color }}>{p.count} طالب</div>
                    </div>
                  ))}
                </div>

                {/* استيعاب الصفوف */}
                {sections.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>نسبة إشغال الصفوف الدراسية:</div>
                    {sections.slice(0, 4).map(sec => {
                      const secStus = students.filter(s => s.sectionId === sec.id || s.className === sec.name);
                      const cap = Number(sec.capacity) || 10;
                      const pct = Math.min(100, Math.round((secStus.length / cap) * 100));
                      const secColor = sec.color || 'var(--pr)';
                      return (
                        <div key={sec.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: '0.82rem' }}>
                          <span style={{ minWidth: 100, fontWeight: 700 }}>{sec.name}</span>
                          <div style={{ flex: 1, height: 6, background: 'var(--g1)', borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: secColor, borderRadius: 6 }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', minWidth: 65, textAlign: 'left' }}>
                            {secStus.length}/{cap} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* حالة الجلسات وإنجاز الخطة التأهيلية */}
          <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)' }}>
            <div className="wg-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp style={{ width: 17, height: 17, color: 'var(--pr)' }} />
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800 }}>مؤشرات الإنجاز التأهيلي وسير العمل</h3>
              </div>
              <span className="bdg b-cy">الفترة المحددة: {filterLabel}</span>
            </div>
            <div className="wg-b" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div style={{ padding: '14px', background: 'var(--g0)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>إتمام الجلسات الفردية</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--ok)' }}>{sessionCompletionRate}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--g1)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${sessionCompletionRate}%`, height: '100%', background: 'var(--ok)' }} />
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 6 }}>
                    تم إنجاز {sessionsDone} من أصل {sessionsF.length} جلسة
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'var(--g0)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>انتظام حضور الطلاب</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--warn)' }}>{attendanceRate}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--g1)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${attendanceRate}%`, height: '100%', background: 'var(--warn)' }} />
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 6 }}>
                    {presentCount} حضور مسجل مقابل {attF.length - presentCount} غياب
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'var(--g0)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>الطلاب في الانتظار</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--pr)' }}>{waitlist.length}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--g1)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (waitlist.length / Math.max(students.length, 1)) * 100)}%`, height: '100%', background: 'var(--pr)' }} />
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 6 }}>
                    طلاب مسجلون بانتظار توفر مقاعد تأهيلية
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. تبويب تحليلات الطلاب */}
      {tab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div className="unified-stat-box">
              <div className="stat-label">🎓 الطلاب المسجلون النشطون</div>
              <div className="stat-val" style={{ color: 'var(--ok)' }}>{active.length}</div>
              <div className="stat-sub">يتلقون خدمات التأهيل حالياً</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">⏳ قائمة الانتظار</div>
              <div className="stat-val" style={{ color: 'var(--warn)' }}>{waitlist.length}</div>
              <div className="stat-sub">بانتظار استكمال الإجراءات والقبول</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">✨ انضمام جديد (ضمن الفلتر)</div>
              <div className="stat-val" style={{ color: 'var(--pr)' }}>{studentsJoinedF.length}</div>
              <div className="stat-sub">سجلوا خلال الفترة المحددة</div>
            </div>
          </div>

          <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)' }}>
            <div className="wg-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users style={{ width: 17, height: 17, color: 'var(--pr)' }} />
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800 }}>سجل الطلاب والتشخيص والبرامج</h3>
              </div>
              <input 
                type="text" 
                placeholder="🔍 بحث سريع باسم الطالب أو التشخيص..." 
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                style={{ width: 240, height: 34, fontSize: '0.82rem', borderRadius: 8 }}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: 'var(--g0)', borderBottom: '1.5px solid var(--border-color)', textAlign: 'right' }}>
                    <th style={{ padding: '12px 16px' }}>اسم الطالب</th>
                    <th style={{ padding: '12px 16px' }}>التشخيص الأساسي</th>
                    <th style={{ padding: '12px 16px' }}>الصف / القسم</th>
                    <th style={{ padding: '12px 16px' }}>العمر</th>
                    <th style={{ padding: '12px 16px' }}>الحالة</th>
                    <th style={{ padding: '12px 16px' }}>البرامج المعتمدة</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-sub)' }}>
                        لا توجد نتائج مطابقة
                      </td>
                    </tr>
                  ) : (
                    filteredStudentList.map(s => {
                      const progs = [
                        s.progMorning?.enabled && '☀️ صباحي',
                        s.progEvening?.enabled && '🌙 مسائي',
                        s.progSessions?.enabled && '🩺 جلسات',
                        s.progOnline?.enabled && '🌐 أونلاين'
                      ].filter(Boolean);
                      
                      const age = s.dob ? Math.max(0, new Date().getFullYear() - new Date(s.dob).getFullYear()) + ' سنة' : '—';
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-main)' }}>{s.name}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-sub)' }}>{s.diagnosis || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="bdg b-bl" style={{ fontSize: '0.74rem' }}>{s.className || 'غير مسكن'}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{age}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={`bdg ${s.status === 'active' ? 'b-gr' : s.status === 'waitlist' ? 'b-or' : 'b-gy'}`}>
                              {s.status === 'active' ? 'نشط ✅' : s.status === 'waitlist' ? 'انتظار ⏳' : 'منقطع'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {progs.map((p, i) => (
                                <span key={i} className="bdg b-gy" style={{ fontSize: '0.7rem' }}>{p}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. تبويب الجلسات والتأهيل */}
      {tab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div className="unified-stat-box">
              <div className="stat-label">🩺 إجمالي جلسات الفترة</div>
              <div className="stat-val" style={{ color: 'var(--pr)' }}>{sessionsF.length}</div>
              <div className="stat-sub">خلال: {filterLabel}</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">✅ جلسات مكتملة</div>
              <div className="stat-val" style={{ color: 'var(--ok)' }}>{sessionsDone}</div>
              <div className="stat-sub">تم تنفيذها وتوثيق الملاحظات</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">⏳ مجدولة / قادمة</div>
              <div className="stat-val" style={{ color: 'var(--warn)' }}>{sessionsF.length - sessionsDone}</div>
              <div className="stat-sub">بانتظار التنفيذ والتقييم</div>
            </div>
          </div>

          <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)' }}>
            <div className="wg-h" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Stethoscope style={{ width: 17, height: 17, color: 'var(--pr)' }} />
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800 }}>توزيع الجلسات حسب التخصص العلاجي</h3>
            </div>
            <div className="wg-b" style={{ padding: '18px 20px' }}>
              {sessionsF.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-sub)' }}>
                  لا توجد جلسات مسجلة ضمن هذه الفترة الزمنية
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  {Object.entries(
                    sessionsF.reduce((acc, s) => {
                      const t = s.type || 'جلسات عامة';
                      acc[t] = (acc[t] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => {
                      const pct = Math.round((count / sessionsF.length) * 100);
                      return (
                        <div key={type} style={{ padding: '14px 16px', background: 'var(--g0)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{type}</span>
                            <span className="bdg b-pu" style={{ fontWeight: 800 }}>{count} جلسة</span>
                          </div>
                          <div style={{ height: 6, background: 'var(--g1)', borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--pur, #7c3aed)' }} />
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: 4 }}>
                            {pct}% من إجمالي جلسات المركز بالفترة
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. تبويب الكادر والموارد البشرية */}
      {tab === 'hr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div className="unified-stat-box">
              <div className="stat-label">👥 إجمالي فريق العمل</div>
              <div className="stat-val" style={{ color: 'var(--pr)' }}>{emps.length}</div>
              <div className="stat-sub">أخصائيين وكادر مسجل</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">🌴 الإجازات بالفترة</div>
              <div className="stat-val" style={{ color: 'var(--warn)' }}>{leavesF.length}</div>
              <div className="stat-sub">طلبات إجازات مسجلة ضمن الفلتر</div>
            </div>
            <div className="unified-stat-box">
              <div className="stat-label">⏳ طلبات بانتظار الاعتماد</div>
              <div className="stat-val" style={{ color: 'var(--ok)' }}>{leaves.filter(l => l.status === 'pending').length}</div>
              <div className="stat-sub">إجازات تتطلب موافقة الإدارة</div>
            </div>
          </div>

          <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)' }}>
            <div className="wg-h" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase style={{ width: 17, height: 17, color: 'var(--pr)' }} />
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800 }}>توزيع الكادر الوظيفي حسب التخصص والمسمى</h3>
            </div>
            <div className="wg-b" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                {Object.entries(
                  emps.reduce((acc, e) => {
                    const r = roleLabel(e.role);
                    acc[r] = (acc[r] || 0) + 1;
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([role, count]) => (
                    <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--g0)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{role}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>كادر معتمد بالمركز</div>
                      </div>
                      <span className="bdg b-bl" style={{ fontSize: '0.85rem', fontWeight: 800, padding: '4px 10px' }}>
                        {count} موظف
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. تبويب البيانات المالية (المدير فقط) */}
      {tab === 'finance' && canSeeFinance && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--ok)' }}>
              <div className="stat-label">💰 الإيرادات المحصلة بالفترة</div>
              <div className="stat-val" style={{ color: 'var(--ok)' }}>
                {income.toLocaleString()} {getCurrencySymbol(center?.currency)}
              </div>
              <div className="stat-sub">{incomeF.length} سندات قبض وتوريد</div>
            </div>

            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--err)' }}>
              <div className="stat-label">🧾 المصروفات والتشغيل بالفترة</div>
              <div className="stat-val" style={{ color: 'var(--err)' }}>
                {expenses.toLocaleString()} {getCurrencySymbol(center?.currency)}
              </div>
              <div className="stat-sub">{expensesF.length} سندات صرف وفواتير</div>
            </div>

            <div className="unified-stat-box" style={{ borderRight: `4px solid ${netProfit >= 0 ? 'var(--ok)' : 'var(--err)'}` }}>
              <div className="stat-label">📊 الرصيد المالي الصافي</div>
              <div className="stat-val" style={{ color: netProfit >= 0 ? 'var(--ok)' : 'var(--err)' }}>
                {netProfit.toLocaleString()} {getCurrencySymbol(center?.currency)}
              </div>
              <div className="stat-sub">{netProfit >= 0 ? 'فائض تشغيلي متاح ✅' : 'عجز بالفترة ⚠️'}</div>
            </div>
          </div>

          <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)' }}>
            <div className="wg-h" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarSign style={{ width: 17, height: 17, color: 'var(--pr)' }} />
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800 }}>المؤشر المالي المقارن (الإيرادات مقابل المصروفات)</h3>
            </div>
            <div className="wg-b" style={{ padding: '18px 20px' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}>
                  <span style={{ color: 'var(--ok)' }}>الإيرادات: {income.toLocaleString()} {getCurrencySymbol(center?.currency)}</span>
                  <span style={{ color: 'var(--err)' }}>المصروفات: {expenses.toLocaleString()} {getCurrencySymbol(center?.currency)}</span>
                </div>
                <div style={{ height: 14, background: 'var(--g1)', borderRadius: 10, overflow: 'hidden', display: 'flex' }}>
                  <div 
                    style={{ 
                      width: `${(income + expenses) > 0 ? (income / (income + expenses)) * 100 : 50}%`, 
                      background: 'var(--ok)',
                      height: '100%' 
                    }} 
                    title="الإيرادات"
                  />
                  <div 
                    style={{ 
                      width: `${(income + expenses) > 0 ? (expenses / (income + expenses)) * 100 : 50}%`, 
                      background: 'var(--err)',
                      height: '100%' 
                    }} 
                    title="المصروفات"
                  />
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', textAlign: 'center', marginTop: 10 }}>
                💡 يتم احتساب الأرقام بناءً على النطاق الزمني المحدد ({filterLabel}) وربطها بالسندات المحاسبية المحفوظة.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
