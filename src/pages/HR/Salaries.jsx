import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';
import { Banknote, ChevronRight, ChevronLeft, Zap, Search, Printer, CheckCircle2, Clock, Edit3 } from 'lucide-react';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';

function monthKey(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); }
function monthLabel(d) { return d.toLocaleDateString('ar-SA', { month:'long', year:'numeric' }); }

export default function Salaries() {
  const { go, toast, currentUser } = useApp();
  const [month, setMonth] = useState(new Date());
  const [emps, setEmps] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [q, setQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailId, setDetailId] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const canEdit = currentUser?.role === 'manager';

  useEffect(() => {
    setEmps(lsGet('employees') || []);
    setSalaries(lsGet('salaries') || []);
  }, []);

  function reload() { setSalaries(lsGet('salaries') || []); }
  const mk = monthKey(month);

  function getEmpSalary(empId) {
    return salaries.find(s => s.empId === empId && s.month === mk);
  }

  function genAll() {
    if (!window.confirm(`توليد مسير رواتب ${monthLabel(month)} لجميع الموظفين؟`)) return;
    let count = 0;
    emps.forEach(e => {
      if (!getEmpSalary(e.id)) {
        const base = Number(e.salary) || 0;
        const housing = Number(e.allowanceHousing) || 0;
        const transport = Number(e.allowanceTransport) || 0;
        lsAdd('salaries', { id: uid(), empId: e.id, month: mk, base, housing, transport, bonus: 0, deductions: 0, total: base+housing+transport, status: 'unpaid' });
        count++;
      }
    });
    reload();
    toast(`✅ تم توليد رواتب ${count} موظف`, 'ok');
  }

  function openDetail(emp) {
    let sal = getEmpSalary(emp.id);
    if (!sal) {
      const base = Number(emp.salary)||0, housing = Number(emp.allowanceHousing)||0, transport = Number(emp.allowanceTransport)||0;
      sal = { empId: emp.id, month: mk, base, housing, transport, bonus: 0, deductions: 0, total: base+housing+transport, status:'unpaid', notes:'' };
    }
    setDetailData({ emp, sal: { ...sal } });
    setDetailId(emp.id);
  }

  function saveDetail() {
    const { emp, sal } = detailData;
    const total = (Number(sal.base)||0) + (Number(sal.housing)||0) + (Number(sal.transport)||0) + (Number(sal.bonus)||0) - (Number(sal.deductions)||0);
    const updated = { ...sal, total };
    if (sal.id) { lsUpd('salaries', sal.id, updated); }
    else { lsAdd('salaries', { ...updated, id: uid() }); }
    reload(); setDetailId(null); toast('✅ تم حفظ الراتب', 'ok');
  }

  function markPaid(id) {
    lsUpd('salaries', id, { status:'paid', paidAt: new Date().toISOString(), paidBy: currentUser?.name });
    reload(); toast('✅ تم تأكيد الصرف', 'ok');
  }

  const totalSalaries = emps.reduce((s, e) => {
    const sal = getEmpSalary(e.id);
    return s + (sal ? Number(sal.total)||0 : (Number(e.salary)||0)+(Number(e.allowanceHousing)||0)+(Number(e.allowanceTransport)||0));
  }, 0);
  const paidCount = emps.filter(e => getEmpSalary(e.id)?.status === 'paid').length;
  const unpaidCount = emps.length - paidCount;

  const filteredEmps = emps.filter(e => {
    if (q) {
      const s = q.toLowerCase();
      if (!(e.name || '').toLowerCase().includes(s) && !(e.role || '').toLowerCase().includes(s)) return false;
    }
    if (filterStatus === 'paid') return getEmpSalary(e.id)?.status === 'paid';
    if (filterStatus === 'unpaid') return getEmpSalary(e.id)?.status !== 'paid';
    return true;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl' }}>
      
      {/* الترويسة الموحدة */}
      <UnifiedPageHeader
        icon={<Banknote style={{ width: 24, height: 24 }} />}
        iconBg="rgba(16, 185, 129, 0.15)"
        iconColor="#10b981"
        accentColor="#10b981"
        title="مسير الرواتب والمستحقات"
        subtitle={`إدارة الرواتب الشهرية والبدلات والخصومات — ${monthLabel(month)}`}
        badge={`${emps.length} موظف`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {canEdit && (
              <button
                className="btn btn-p"
                onClick={genAll}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: '0.84rem' }}
              >
                <Zap style={{ width: 15, height: 15 }} />
                <span>توليد مسير الشهر</span>
              </button>
            )}
            <button
              className="btn btn-g"
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: '0.84rem' }}
            >
              <Printer style={{ width: 15, height: 15 }} />
              <span>طباعة المسير</span>
            </button>
          </div>
        }
        onBack={() => go('hr')}
        backLabel="العودة للوحة الموظفين"
      />

      {/* شريط اختيار الشهر والتنقل */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r)', padding: '10px 16px', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>فترة المسير:</span>
          <span className="bdg b-gr" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>{monthLabel(month)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className="btn btn-g btn-sm"
            onClick={() => setMonth(d => { const n=new Date(d); n.setMonth(n.getMonth()-1); return n; })}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ChevronRight style={{ width: 14, height: 14 }} />
            <span>الشهر السابق</span>
          </button>
          <button
            className="btn btn-p btn-sm"
            onClick={() => setMonth(new Date())}
            style={{ padding: '6px 14px' }}
          >
            الشهر الحالي
          </button>
          <button
            className="btn btn-g btn-sm"
            onClick={() => setMonth(d => { const n=new Date(d); n.setMonth(n.getMonth()+1); return n; })}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span>الشهر التالي</span>
            <ChevronLeft style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 18 }}>
        <div className="unified-stat-box">
          <div className="stat-label">💰 إجمالي الرواتب والبدلات</div>
          <div className="stat-val" style={{ color: '#10b981' }}>{totalSalaries.toLocaleString()} ر.س</div>
          <div className="stat-sub">المسير الإجمالي لهذا الشهر</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">✅ تم الصرف واعتماد التحويل</div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>{paidCount} موظف</div>
          <div className="stat-sub">تم تأكيد تحويل مستحقاتهم</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">⏳ لم يُصرف بعد</div>
          <div className="stat-val" style={{ color: unpaidCount > 0 ? 'var(--warn)' : 'var(--text-sub)' }}>
            {unpaidCount} موظف
          </div>
          <div className="stat-sub">بانتظار إجراءات الاعتماد</div>
        </div>
      </div>

      {/* شريط الفلترة والبحث الموحد */}
      <div className="unified-filter-toolbar" style={{ gridTemplateColumns: '1fr auto' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ width: 15, height: 15, position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
          <input
            type="text"
            placeholder="ابحث باسم الموظف أو الوظيفة..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="srch"
            style={{ width: '100%', paddingRight: 36, height: 38, fontSize: '0.84rem' }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="srch"
          style={{ height: 38, fontSize: '0.84rem', fontWeight: 600 }}
        >
          <option value="all">📌 جميع حالات الصرف</option>
          <option value="paid">✅ تم الصرف فقط</option>
          <option value="unpaid">⏳ لم يُصرف بعد</option>
        </select>
      </div>

      {/* جدول الرواتب الموحد */}
      <div className="table-responsive" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r)', overflow: 'hidden', boxShadow: 'var(--sh)', marginBottom: 20 }}>
        <table>
          <thead>
            <tr>
              <th>الموظف</th>
              <th>الوظيفة</th>
              <th>الأساسي</th>
              <th>البدلات</th>
              <th>المكافآت</th>
              <th>الخصومات</th>
              <th>صافي الراتب</th>
              <th>حالة الصرف</th>
              <th style={{ textAlign: 'center' }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmps.map(e => {
              const sal = getEmpSalary(e.id);
              const base = sal ? sal.base : Number(e.salary)||0;
              const allowances = sal ? (Number(sal.housing)||0)+(Number(sal.transport)||0) : (Number(e.allowanceHousing)||0)+(Number(e.allowanceTransport)||0);
              const bonus = sal ? Number(sal.bonus)||0 : 0;
              const deductions = sal ? Number(sal.deductions)||0 : 0;
              const total = sal ? Number(sal.total)||0 : base+allowances;
              const isPaid = sal?.status === 'paid';
              return (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{e.name}</div>
                  </td>
                  <td><span className="bdg b-cy" style={{ fontSize: '0.74rem' }}>{e.role}</span></td>
                  <td>{base.toLocaleString()} ر</td>
                  <td>{allowances.toLocaleString()} ر</td>
                  <td>{bonus ? <span style={{ color: 'var(--ok)', fontWeight: 700 }}>+{bonus.toLocaleString()} ر</span> : '—'}</td>
                  <td>{deductions ? <span style={{ color: 'var(--err)', fontWeight: 700 }}>-{deductions.toLocaleString()} ر</span> : '—'}</td>
                  <td><b style={{ color: '#10b981', fontSize: '0.95rem' }}>{total.toLocaleString()} ر</b></td>
                  <td>
                    {isPaid ? (
                      <span className="bdg b-gr" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 style={{ width: 12, height: 12 }} />
                        <span>مُصرَّف</span>
                      </span>
                    ) : (
                      <span className="bdg b-or" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock style={{ width: 12, height: 12 }} />
                        <span>لم يُصرَّف</span>
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      {canEdit && (
                        <button className="btn btn-g btn-xs" onClick={() => openDetail(e)} title="تعديل وتفصيل المسير">
                          <Edit3 style={{ width: 13, height: 13 }} />
                          <span style={{ marginRight: 2 }}>تفصيل</span>
                        </button>
                      )}
                      {canEdit && !isPaid && sal && (
                        <button className="btn btn-s btn-xs" onClick={() => markPaid(sal.id)} title="تأكيد صرف الراتب">
                          <CheckCircle2 style={{ width: 13, height: 13 }} />
                          <span style={{ marginRight: 2 }}>اعتماد الصرف</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {detailId && detailData && (
        <div className="mbg" onClick={e => { if(e.target===e.currentTarget) setDetailId(null); }}>
          <div className="mb mb-large" style={{ padding:0, overflow:'hidden', borderRadius:16 }}>
            <div className="fhd" style={{ padding:'16px 20px', borderRadius:0 }}>
              <h2>💰 بيان راتب {detailData.emp.name} — {monthLabel(month)}</h2>
              <p>تعديل بنود الراتب والبدلات والخصومات للشهر المحدد</p>
            </div>
            <div style={{ padding:'20px' }}>
              <div className="fg c2">
                <div className="fl">
                  <label>الراتب الأساسي (ريال)</label>
                  <input type="number" value={detailData.sal.base} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,base:e.target.value}}))} min="0"/>
                </div>
                <div className="fl">
                  <label>بدل السكن</label>
                  <input type="number" value={detailData.sal.housing} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,housing:e.target.value}}))} min="0"/>
                </div>
                <div className="fl">
                  <label>بدل النقل</label>
                  <input type="number" value={detailData.sal.transport} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,transport:e.target.value}}))} min="0"/>
                </div>
                <div className="fl">
                  <label>مكافآت / حوافز إضافية</label>
                  <input type="number" value={detailData.sal.bonus} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,bonus:e.target.value}}))} min="0"/>
                </div>
                <div className="fl">
                  <label>خصومات / جزاءات</label>
                  <input type="number" value={detailData.sal.deductions} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,deductions:e.target.value}}))} min="0"/>
                </div>
                <div className="fl">
                  <label>ملاحظات الراتب</label>
                  <input value={detailData.sal.notes||''} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,notes:e.target.value}}))} placeholder="أي ملاحظات..."/>
                </div>
              </div>
              <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--r2)', fontSize: '1.05rem', fontWeight: 900, color: '#065f46', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>صافي المستحق للموظف:</span>
                <span style={{ fontSize: '1.25rem' }}>
                  {(
                    (Number(detailData.sal.base)||0)+(Number(detailData.sal.housing)||0)+(Number(detailData.sal.transport)||0)+(Number(detailData.sal.bonus)||0)-(Number(detailData.sal.deductions)||0)
                  ).toLocaleString()} ريال
                </span>
              </div>
            </div>
            <div className="fa">
              <button className="btn btn-g" onClick={() => setDetailId(null)}>إلغاء</button>
              <button className="btn btn-g no-print" onClick={() => window.print()}>🖨️ طباعة المسير</button>
              <button className="btn btn-p" onClick={saveDetail}>💾 حفظ الراتب</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

