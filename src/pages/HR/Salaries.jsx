import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';

function monthKey(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); }
function monthLabel(d) { return d.toLocaleDateString('ar-SA', { month:'long', year:'numeric' }); }

export default function Salaries() {
  const { go, toast, currentUser } = useApp();
  const [month, setMonth] = useState(new Date());
  const [emps, setEmps] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const canEdit = currentUser?.role === 'manager';

  useEffect(() => {
    setEmps(lsGet('employees'));
    setSalaries(lsGet('salaries'));
  }, []);

  function reload() { setSalaries(lsGet('salaries')); }
  const mk = monthKey(month);

  function getEmpSalary(empId) {
    return salaries.find(s => s.empId === empId && s.month === mk);
  }

  function genAll() {
    if (!window.confirm(`توليد رواتب ${monthLabel(month)} لجميع الموظفين؟`)) return;
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

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>💰 الرواتب</h2><p>{monthLabel(month)}</p></div>
        <div className="ph-a">
          <button className="btn btn-g btn-sm" onClick={() => setMonth(d => { const n=new Date(d); n.setMonth(n.getMonth()-1); return n; })}>→ السابق</button>
          <button className="btn btn-p btn-sm" onClick={() => setMonth(new Date())}>الشهر الحالي</button>
          <button className="btn btn-g btn-sm" onClick={() => setMonth(d => { const n=new Date(d); n.setMonth(n.getMonth()+1); return n; })}>التالي ←</button>
          {canEdit && <button className="btn btn-g" onClick={genAll}>⚡ توليد رواتب الشهر</button>}
          <button type="button" className="btn btn-g" onClick={() => go('center')}>← رجوع لإدارة المركز</button>
        </div>
      </div>

      <div className="stats" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
        <div className="sc"><div className="lb">إجمالي الرواتب</div><div className="vl" style={{fontSize:'1.2rem'}}>{totalSalaries.toLocaleString()}</div><div className="sb">ريال هذا الشهر</div></div>
        <div className="sc g"><div className="lb">تم الصرف</div><div className="vl">{paidCount}</div><div className="sb">موظف</div></div>
        <div className="sc o"><div className="lb">لم يُصرف بعد</div><div className="vl">{unpaidCount}</div><div className="sb">موظف</div></div>
      </div>

      <div style={{ overflowX:'auto' }}>
        <table>
          <thead>
            <tr>
              <th>الموظف</th><th>الوظيفة</th><th>الراتب الأساسي</th><th>البدلات</th><th>المكافآت</th><th>الخصومات</th><th>الصافي</th><th>الحالة</th><th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {emps.map(e => {
              const sal = getEmpSalary(e.id);
              const base = sal ? sal.base : Number(e.salary)||0;
              const allowances = sal ? (Number(sal.housing)||0)+(Number(sal.transport)||0) : (Number(e.allowanceHousing)||0)+(Number(e.allowanceTransport)||0);
              const bonus = sal ? Number(sal.bonus)||0 : 0;
              const deductions = sal ? Number(sal.deductions)||0 : 0;
              const total = sal ? Number(sal.total)||0 : base+allowances;
              const isPaid = sal?.status === 'paid';
              return (
                <tr key={e.id}>
                  <td><b>{e.name}</b></td>
                  <td style={{fontSize:'.8rem',color:'var(--g5)'}}>{e.role}</td>
                  <td>{base.toLocaleString()} ر</td>
                  <td>{allowances.toLocaleString()} ر</td>
                  <td>{bonus ? bonus.toLocaleString()+' ر' : '—'}</td>
                  <td>{deductions ? <span style={{color:'var(--err)'}}>{deductions.toLocaleString()} ر</span> : '—'}</td>
                  <td><b style={{color:'var(--ok)'}}>{total.toLocaleString()} ر</b></td>
                  <td>{isPaid ? <span className="bdg b-gr">✅ مُصرَّف</span> : <span className="bdg b-or">⏳ لم يُصرَّف</span>}</td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      {canEdit && <button className="btn btn-g btn-xs" onClick={() => openDetail(e)}>✏️</button>}
                      {canEdit && !isPaid && sal && <button className="btn btn-s btn-xs" onClick={() => markPaid(sal.id)}>✅ صرف</button>}
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
            <div className="fhd" style={{ padding:'14px 20px', borderRadius:0 }}>
              <h2>💰 راتب {detailData.emp.name} — {monthLabel(month)}</h2>
            </div>
            <div style={{ padding:'18px 20px' }}>
              <div className="fg c2">
                <div className="fl"><label>الراتب الأساسي (ريال)</label><input type="number" value={detailData.sal.base} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,base:e.target.value}}))} min="0"/></div>
                <div className="fl"><label>بدل السكن</label><input type="number" value={detailData.sal.housing} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,housing:e.target.value}}))} min="0"/></div>
                <div className="fl"><label>بدل النقل</label><input type="number" value={detailData.sal.transport} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,transport:e.target.value}}))} min="0"/></div>
                <div className="fl"><label>مكافآت / حوافز</label><input type="number" value={detailData.sal.bonus} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,bonus:e.target.value}}))} min="0"/></div>
                <div className="fl"><label>خصومات</label><input type="number" value={detailData.sal.deductions} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,deductions:e.target.value}}))} min="0"/></div>
                <div className="fl"><label>ملاحظات</label><input value={detailData.sal.notes||''} onChange={e=>setDetailData(d=>({...d,sal:{...d.sal,notes:e.target.value}}))} placeholder="أي ملاحظات..."/></div>
              </div>
              <div style={{ marginTop:14, padding:'12px 16px', background:'var(--ok-l)', borderRadius:'var(--r2)', fontSize:'1rem', fontWeight:900, color:'var(--ok-d)' }}>
                💰 الصافي: {(
                  (Number(detailData.sal.base)||0)+(Number(detailData.sal.housing)||0)+(Number(detailData.sal.transport)||0)+(Number(detailData.sal.bonus)||0)-(Number(detailData.sal.deductions)||0)
                ).toLocaleString()} ريال
              </div>
            </div>
            <div className="fa">
              <button className="btn btn-p" onClick={saveDetail}>💾 حفظ</button>
              <button className="btn btn-g no-print" onClick={() => window.print()}>🖨️ طباعة</button>
              <button className="btn btn-g" onClick={() => setDetailId(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
