import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet } from '../hooks/useStorage';
import { todayStr } from '../utils/dateHelpers';
import { ROLES } from '../utils/constants';

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
  const { currentUser } = useApp();
  const [tab, setTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attStu, setAttStu] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [incomeRows, setIncomeRows] = useState([]);
  const [expenseRows, setExpenseRows] = useState([]);

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
  const diagCount = active.reduce((acc, s) => { acc[s.diagnosis] = (acc[s.diagnosis] || 0) + 1; return acc; }, {});
  const progCount = {
    morning: students.filter(s => s.progMorning?.enabled).length,
    evening: students.filter(s => s.progEvening?.enabled).length,
    sessions: students.filter(s => s.progSessions?.enabled).length,
    online: students.filter(s => s.progOnline?.enabled).length,
  };

  const studentsJoinedF = students.filter(s => inDateFilter(s.joinDate, filterMode, filterYear, filterMonth, weekAnchor));

  const income = incomeF.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const expenses = expensesF.reduce((s, x) => s + (Number(x.amount) || 0), 0);

  const TABS = [['overview', 'نظرة عامة'], ['students', 'الطلاب'], ['sessions', 'الجلسات'], ['hr', 'الموارد البشرية'], canSeeFinance && ['finance', 'المالية']].filter(Boolean);

  const filterLabel =
    filterMode === 'year'
      ? `عام ${filterYear}`
      : filterMode === 'month'
        ? `${filterYear} / الشهر ${filterMonth}`
        : `أسبوع يتضمن ${weekAnchor}`;

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>📊 التقارير والإحصائيات</h2>
          <p>تحليلات مع فلترة زمنية</p>
        </div>
        <div className="ph-a">
          <button type="button" className="btn btn-g no-print" onClick={() => window.print()}>
            🖨️ طباعة
          </button>
        </div>
      </div>

      <div className="wg" style={{ marginBottom: 14 }}>
        <div className="wg-h">
          <h3>📅 فلترة التقرير</h3>
        </div>
        <div className="wg-b" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div className="fl" style={{ minWidth: 120 }}>
            <label>النوع</label>
            <select value={filterMode} onChange={e => setFilterMode(e.target.value)}>
              <option value="year">سنة</option>
              <option value="month">شهر</option>
              <option value="week">أسبوع</option>
            </select>
          </div>
          <div className="fl" style={{ minWidth: 100 }}>
            <label>السنة</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              {yearOptions.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {filterMode === 'month' && (
            <div className="fl" style={{ minWidth: 100 }}>
              <label>الشهر</label>
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={String(m)}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
          {filterMode === 'week' && (
            <div className="fl" style={{ minWidth: 160 }}>
              <label>مرجع الأسبوع</label>
              <input type="date" value={weekAnchor} onChange={e => setWeekAnchor(e.target.value)} />
            </div>
          )}
          <span className="bdg b-cy" style={{ marginBottom: 4 }}>
            {filterLabel}
          </span>
        </div>
      </div>

      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        {TABS.map(([v, l]) => (
          <button key={v} type="button" className={`tab ${tab === v ? 'on' : ''}`} onClick={() => setTab(v)}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="sc g">
              <div className="lb">الطلاب النشطون</div>
              <div className="vl">{active.length}</div>
              <div className="sb">من {students.length} إجمالي</div>
            </div>
            <div className="sc">
              <div className="lb">الموظفون</div>
              <div className="vl">{emps.length}</div>
            </div>
            <div className="sc v">
              <div className="lb">الجلسات (ضمن الفلتر)</div>
              <div className="vl">{sessionsF.length}</div>
            </div>
            <div className="sc o">
              <div className="lb">سجلات حضور (ضمن الفلتر)</div>
              <div className="vl">{attF.filter(a => a.status === 'present').length}</div>
            </div>
          </div>
          <div className="g2">
            <div className="wg">
              <div className="wg-h">
                <h3>👦 توزيع الطلاب بالتشخيص</h3>
              </div>
              <div className="wg-b">
                {Object.entries(diagCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([diag, count]) => (
                    <div key={diag} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ flex: 1, fontSize: '.86rem', fontWeight: 700 }}>{diag || 'غير محدد'}</div>
                      <div
                        style={{
                          width: `${Math.round((count / Math.max(active.length, 1)) * 100)}%`,
                          minWidth: 20,
                          height: 18,
                          background: 'var(--pr-l)',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingLeft: 6,
                        }}
                      >
                        <span style={{ fontSize: '.72rem', fontWeight: 900, color: 'var(--pr)' }}>{count}</span>
                      </div>
                      <div style={{ fontSize: '.78rem', color: 'var(--g4)', minWidth: 32, textAlign: 'left' }}>{Math.round((count / Math.max(active.length, 1)) * 100)}%</div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="wg">
              <div className="wg-h">
                <h3>🗂️ الأقسام</h3>
              </div>
              <div className="wg-b">
                {[
                  ['☀️ الصباحي', progCount.morning],
                  ['🌙 المسائي', progCount.evening],
                  ['🩺 الجلسات', progCount.sessions],
                  ['🌐 الأونلاين', progCount.online],
                ].map(([l, c]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '.88rem' }}>
                    <span>{l}</span>
                    <span style={{ fontWeight: 900, color: 'var(--pr)' }}>{c} طالب</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'students' && (
        <div>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="sc g">
              <div className="lb">النشطون</div>
              <div className="vl">{active.length}</div>
            </div>
            <div className="sc o">
              <div className="lb">قائمة الانتظار</div>
              <div className="vl">{students.filter(s => s.status === 'waitlist').length}</div>
            </div>
            <div className="sc v">
              <div className="lb">تسجيلات ضمن الفلتر</div>
              <div className="vl">{studentsJoinedF.length}</div>
            </div>
          </div>
          <div className="wg">
            <div className="wg-h">
              <h3>📋 قائمة الطلاب</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>التشخيص</th>
                    <th>العمر</th>
                    <th>الحالة</th>
                    <th>الأقسام</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const progs = [s.progMorning?.enabled && '☀️', s.progEvening?.enabled && '🌙', s.progSessions?.enabled && '🩺', s.progOnline?.enabled && '🌐'].filter(Boolean);
                    return (
                      <tr key={s.id}>
                        <td>
                          <b>{s.name}</b>
                        </td>
                        <td>{s.diagnosis || '—'}</td>
                        <td>{s.dob ? new Date().getFullYear() - new Date(s.dob).getFullYear() + ' سنة' : '—'}</td>
                        <td>
                          <span className={`bdg ${s.status === 'active' ? 'b-gr' : s.status === 'waitlist' ? 'b-or' : 'b-gy'}`}>{s.status}</span>
                        </td>
                        <td>{progs.join(' ')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'sessions' && (
        <div>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="sc">
              <div className="lb">إجمالي الجلسات (الفلتر)</div>
              <div className="vl">{sessionsF.length}</div>
            </div>
            <div className="sc g">
              <div className="lb">منجزة</div>
              <div className="vl">{sessionsF.filter(s => s.status === 'done').length}</div>
            </div>
            <div className="sc o">
              <div className="lb">مجدولة</div>
              <div className="vl">{sessionsF.filter(s => s.status !== 'done').length}</div>
            </div>
          </div>
          <div className="wg">
            <div className="wg-h">
              <h3>🩺 الجلسات بالنوع (ضمن الفلتر)</h3>
            </div>
            <div className="wg-b">
              {Object.entries(
                sessionsF.reduce((acc, s) => {
                  acc[s.type] = (acc[s.type] || 0) + 1;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 700 }}>{type || '—'}</span>
                    <span className="bdg b-pu">{count} جلسة</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'hr' && (
        <div>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="sc">
              <div className="lb">إجمالي الموظفين</div>
              <div className="vl">{emps.length}</div>
            </div>
            <div className="sc o">
              <div className="lb">إجازات (ضمن الفلتر)</div>
              <div className="vl">{leavesF.length}</div>
            </div>
            <div className="sc g">
              <div className="lb">إجازات معلقة (كل الفترات)</div>
              <div className="vl">{leaves.filter(l => l.status === 'pending').length}</div>
            </div>
          </div>
          <div className="wg">
            <div className="wg-h">
              <h3>👥 الموظفون بالوظيفة</h3>
            </div>
            <div className="wg-b">
              {Object.entries(
                emps.reduce((acc, e) => {
                  const r = roleLabel(e.role);
                  acc[r] = (acc[r] || 0) + 1;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([role, count]) => (
                  <div key={role} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 700 }}>{role}</span>
                    <span className="bdg b-bl">{count} موظف</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'finance' && canSeeFinance && (
        <div>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="sc g">
              <div className="lb">الإيرادات (الفلتر)</div>
              <div className="vl" style={{ fontSize: '1.2rem' }}>
                {income.toLocaleString()} ر
              </div>
            </div>
            <div className="sc r">
              <div className="lb">المصروفات (الفلتر)</div>
              <div className="vl" style={{ fontSize: '1.2rem' }}>
                {expenses.toLocaleString()} ر
              </div>
            </div>
            <div className={`sc ${income - expenses >= 0 ? 'g' : 'r'}`}>
              <div className="lb">الصافي</div>
              <div className="vl" style={{ fontSize: '1.2rem' }}>
                {(income - expenses).toLocaleString()} ر
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
