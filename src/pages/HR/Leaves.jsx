import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { todayStr, calcDays, uid } from '../../utils/dateHelpers';
import EmptyState from '../../components/ui/EmptyState';

const LEAVE_TYPES = ['إجازة سنوية','إجازة مرضية','إجازة أمومة','إجازة طارئة','إجازة بدون راتب','أخرى'];
const EMPTY = { empId:'', type:'إجازة سنوية', from:'', to:'', reason:'', status:'pending', notes:'' };

export default function Leaves() {
  const { go, toast, currentUser } = useApp();
  const [leaves, setLeaves] = useState([]);
  const [emps, setEmps] = useState([]);
  const [tab, setTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const canApprove = ['manager','vice'].includes(currentUser?.role);
  const canAdd = ['manager','vice','reception'].includes(currentUser?.role);

  useEffect(() => {
    setLeaves(lsGet('leaves'));
    setEmps(lsGet('employees'));
  }, []);

  function reload() { setLeaves(lsGet('leaves')); }
  const fld = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = leaves.filter(l => {
    if (tab === 'pending') return l.status === 'pending';
    if (tab === 'approved') return l.status === 'approved';
    if (tab === 'rejected') return l.status === 'rejected';
    return true;
  }).sort((a,b) => (b.from||'').localeCompare(a.from||''));

  function openForm(leave = null) {
    if (leave) { setForm({ ...EMPTY, ...leave }); setEditId(leave.id); }
    else { setForm({ ...EMPTY, from: todayStr(), to: todayStr() }); setEditId(null); }
    setShowForm(true);
  }

  function save() {
    if (!form.empId) { toast('⚠️ اختر الموظف', 'er'); return; }
    if (!form.from || !form.to) { toast('⚠️ حدد تاريخ الإجازة', 'er'); return; }
    if (form.from > form.to) { toast('⚠️ تاريخ البداية بعد النهاية!', 'er'); return; }
    if (editId) { lsUpd('leaves', editId, form); toast('✅ تم التحديث', 'ok'); }
    else { lsAdd('leaves', { ...form, id: uid() }); toast('✅ تم تسجيل طلب الإجازة', 'ok'); }
    setShowForm(false); reload();
  }

  function approve(id) {
    lsUpd('leaves', id, { status: 'approved', approvedBy: currentUser?.name, approvedAt: new Date().toISOString() });
    toast('✅ تمت الموافقة على الإجازة', 'ok'); reload();
  }

  function reject(id) {
    lsUpd('leaves', id, { status: 'rejected', rejectedBy: currentUser?.name });
    toast('❌ تم رفض الإجازة', 'warn'); reload();
  }

  function del(id) {
    if (!window.confirm('هل تريد حذف طلب الإجازة؟')) return;
    lsDel('leaves', id); toast('🗑️ تم الحذف', 'ok'); reload();
  }

  const statusBadge = { pending: <span className="bdg b-or">⏳ معلق</span>, approved: <span className="bdg b-gr">✅ موافق</span>, rejected: <span className="bdg b-rd">❌ مرفوض</span> };
  const pending = leaves.filter(l => l.status === 'pending').length;

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>🌴 الإجازات {pending > 0 && <span className="bdg b-or">{pending} معلق</span>}</h2>
          <p>إدارة طلبات إجازات الموظفين</p>
        </div>
        <div className="ph-a">
          {canAdd && <button className="btn btn-p" onClick={() => openForm()}>➕ طلب إجازة</button>}
          <button className="btn btn-g" onClick={() => go('hr')}>← رجوع</button>
        </div>
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="sc o"><div className="lb">طلبات معلقة</div><div className="vl">{leaves.filter(l=>l.status==='pending').length}</div><div className="sb">تنتظر الموافقة</div></div>
        <div className="sc g"><div className="lb">موافق عليها</div><div className="vl">{leaves.filter(l=>l.status==='approved').length}</div><div className="sb">إجازة</div></div>
        <div className="sc r"><div className="lb">مرفوضة</div><div className="vl">{leaves.filter(l=>l.status==='rejected').length}</div><div className="sb">إجازة</div></div>
      </div>

      <div className="tabs">
        {[['all','الكل'],['pending','⏳ معلق'],['approved','✅ موافق'],['rejected','❌ مرفوض']].map(([v,l]) => (
          <button key={v} className={`tab ${tab===v?'on':''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="🌴" title="لا توجد إجازات" sub={canAdd ? 'اضغط ➕ طلب إجازة' : ''}/>
        : filtered.map(l => {
          const emp = emps.find(e => e.id === l.empId);
          const days = calcDays(l.from, l.to);
          return (
            <div key={l.id} className="card">
              <div className="av warn">🌴</div>
              <div className="ci">
                <div className="cn">{emp?.name || '—'} — {l.type}</div>
                <div className="cm">{l.from} → {l.to} · {days} يوم{l.reason && ' · ' + l.reason}</div>
              </div>
              <div className="c-badges">{statusBadge[l.status]}</div>
              <div className="c-acts">
                {canApprove && l.status === 'pending' && <>
                  <button className="btn btn-s btn-xs" onClick={() => approve(l.id)}>✅ موافقة</button>
                  <button className="btn btn-d btn-xs" onClick={() => reject(l.id)}>❌ رفض</button>
                </>}
                <button className="btn btn-g btn-xs" onClick={() => openForm(l)}>✏️</button>
                {canApprove && <button className="btn btn-d btn-xs" onClick={() => del(l.id)}>🗑️</button>}
              </div>
            </div>
          );
        })
      }

      {showForm && (
        <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="mb" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
              <h2>{editId ? '✏️ تعديل طلب الإجازة' : '🌴 طلب إجازة جديد'}</h2>
            </div>
            <div style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <div className="fl full"><label>الموظف <span className="req">*</span></label>
                  <select value={form.empId} onChange={fld('empId')}>
                    <option value="">-- اختر الموظف --</option>
                    {emps.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="fl"><label>نوع الإجازة</label>
                  <select value={form.type} onChange={fld('type')}>
                    {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="fl"><label>الحالة</label>
                  <select value={form.status} onChange={fld('status')} disabled={!canApprove}>
                    <option value="pending">⏳ معلق</option>
                    <option value="approved">✅ موافق</option>
                    <option value="rejected">❌ مرفوض</option>
                  </select>
                </div>
                <div className="fl"><label>من تاريخ <span className="req">*</span></label><input type="date" value={form.from} onChange={fld('from')}/></div>
                <div className="fl"><label>إلى تاريخ <span className="req">*</span></label><input type="date" value={form.to} onChange={fld('to')}/></div>
                {form.from && form.to && <div style={{ gridColumn:'1/-1', padding:'8px 12px', background:'var(--pr-l)', borderRadius:'var(--r2)', fontSize:'.84rem', color:'var(--pr)', fontWeight:700 }}>
                  📅 المدة: {calcDays(form.from, form.to)} يوم
                </div>}
                <div className="fl full"><label>سبب الإجازة</label><input value={form.reason} onChange={fld('reason')} placeholder="السبب..."/></div>
                <div className="fl full"><label>ملاحظات</label><textarea value={form.notes} onChange={fld('notes')} rows={2} placeholder="ملاحظات إضافية..."/></div>
              </div>
            </div>
            <div className="fa">
              <button className="btn btn-p" onClick={save}>💾 حفظ</button>
              <button className="btn btn-g" onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
