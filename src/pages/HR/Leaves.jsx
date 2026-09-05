import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { todayStr, calcDays, uid } from '../../utils/dateHelpers';
import { Palmtree, Plus, CheckCircle2, XCircle, Clock, Calendar, Search, Edit3, Trash2, User } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';

const LEAVE_TYPES = ['إجازة سنوية','إجازة مرضية','إجازة أمومة','إجازة طارئة','إجازة بدون راتب','أخرى'];
const EMPTY = { empId:'', type:'إجازة سنوية', from:'', to:'', reason:'', status:'pending', notes:'' };

export default function Leaves() {
  const { go, toast, currentUser } = useApp();
  const [leaves, setLeaves] = useState([]);
  const [emps, setEmps] = useState([]);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const canApprove = ['manager','vice'].includes(currentUser?.role);
  const canAdd = ['manager','vice','reception'].includes(currentUser?.role);

  useEffect(() => {
    setLeaves(lsGet('leaves') || []);
    setEmps(lsGet('employees') || []);
  }, []);

  function reload() { setLeaves(lsGet('leaves') || []); }
  const fld = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = leaves.filter(l => {
    if (tab === 'pending') return l.status === 'pending';
    if (tab === 'approved') return l.status === 'approved';
    if (tab === 'rejected') return l.status === 'rejected';
    return true;
  }).filter(l => {
    if (!q) return true;
    const emp = emps.find(e => e.id === l.empId);
    const search = q.toLowerCase();
    return (emp?.name || '').toLowerCase().includes(search) || (l.type || '').includes(search) || (l.reason || '').includes(search);
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

  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'rejected').length;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl' }}>
      
      {/* الترويسة الموحدة */}
      <UnifiedPageHeader
        icon={<Palmtree style={{ width: 24, height: 24 }} />}
        iconBg="rgba(8, 145, 178, 0.15)"
        iconColor="#0891b2"
        accentColor="#0891b2"
        title="إدارة الإجازات"
        subtitle="متابعة طلبات الإجازات، الرصيد السنوي، والموافقات والرفض الإداري"
        badge={pendingCount > 0 ? `${pendingCount} طلب معلق` : `${leaves.length} طلب`}
        actions={
          canAdd && (
            <button
              className="btn btn-p"
              onClick={() => openForm()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: '0.88rem' }}
            >
              <Plus style={{ width: 16, height: 16 }} />
              <span>طلب إجازة</span>
            </button>
          )
        }
        onBack={() => go('hr')}
        backLabel="العودة للوحة الموظفين"
      />

      {/* إحصائيات سريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 18 }}>
        <div className="unified-stat-box">
          <div className="stat-label">⏳ طلبات معلقة</div>
          <div className="stat-val" style={{ color: pendingCount > 0 ? 'var(--warn)' : 'var(--text-main)' }}>
            {pendingCount}
          </div>
          <div className="stat-sub">{pendingCount > 0 ? 'بانتظار قرار الإدارة' : 'لا توجد طلبات معلقة'}</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">✅ إجازات موافق عليها</div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>{approvedCount}</div>
          <div className="stat-sub">تم اعتمادها وتوثيقها</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">❌ طلبات مرفوضة</div>
          <div className="stat-val" style={{ color: 'var(--err)' }}>{rejectedCount}</div>
          <div className="stat-sub">مرفوضة من الإدارة</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">🌴 إجمالي السجلات</div>
          <div className="stat-val">{leaves.length}</div>
          <div className="stat-sub">لكافة الموظفين</div>
        </div>
      </div>

      {/* شريط البحث والتبويب الموحد */}
      <div className="unified-filter-toolbar" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
        <div className="tabs" style={{ margin: 0, padding: 2 }}>
          {[
            ['all', `الكل (${leaves.length})`],
            ['pending', `⏳ معلق (${pendingCount})`],
            ['approved', `✅ موافق (${approvedCount})`],
            ['rejected', `❌ مرفوض (${rejectedCount})`]
          ].map(([v, l]) => (
            <button key={v} className={`tab ${tab === v ? 'on' : ''}`} onClick={() => setTab(v)}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <Search style={{ width: 15, height: 15, position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
          <input
            type="text"
            placeholder="ابحث باسم الموظف، نوع الإجازة، أو السبب..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="srch"
            style={{ width: '100%', paddingRight: 36, height: 38, fontSize: '0.84rem' }}
          />
        </div>
      </div>

      {/* قائمة كروت الإجازات */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🌴"
          title="لا توجد إجازات مطابقة"
          sub={canAdd ? 'اضغط ➕ طلب إجازة لتسجيل طلب جديد' : ''}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {filtered.map(l => {
            const emp = emps.find(e => e.id === l.empId);
            const days = calcDays(l.from, l.to);
            const statusColor = l.status === 'approved' ? 'var(--ok)' : l.status === 'rejected' ? 'var(--err)' : 'var(--warn)';
            const statusLabel = l.status === 'approved' ? 'موافق عليها' : l.status === 'rejected' ? 'مرفوضة' : 'قيد الانتظار';

            return (
              <div
                key={l.id}
                className="unified-card"
                style={{
                  borderRight: `5px solid ${statusColor}`,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260, flex: 1 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${statusColor}18`,
                      color: statusColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {emp?.photo ? (
                      <img src={emp.photo} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                    ) : (
                      (emp?.name || '?').slice(0, 2)
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {emp?.name || 'موظف غير محدد'}
                      </h4>
                      <span className="bdg b-cy" style={{ fontSize: '0.74rem' }}>{l.type}</span>
                      <span
                        className="bdg"
                        style={{
                          fontSize: '0.74rem',
                          background: `${statusColor}15`,
                          color: statusColor,
                          fontWeight: 700,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, fontSize: '0.82rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar style={{ width: 13, height: 13 }} />
                        <span>من {l.from} إلى {l.to}</span>
                      </span>
                      <span>·</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{days} يوم</span>
                      {l.reason && (
                        <>
                          <span>·</span>
                          <span>السبب: {l.reason}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {canApprove && l.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-s btn-xs"
                        onClick={() => approve(l.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <CheckCircle2 style={{ width: 13, height: 13 }} />
                        <span>موافقة</span>
                      </button>
                      <button
                        className="btn btn-d btn-xs"
                        onClick={() => reject(l.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <XCircle style={{ width: 13, height: 13 }} />
                        <span>رفض</span>
                      </button>
                    </>
                  )}
                  <button className="btn btn-g btn-xs" onClick={() => openForm(l)} title="تعديل الطلب">
                    <Edit3 style={{ width: 13, height: 13 }} />
                  </button>
                  {canApprove && (
                    <button className="btn btn-g btn-xs" onClick={() => del(l.id)} title="حذف السجل" style={{ color: 'var(--err)' }}>
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة الإضافة / التعديل */}
      {showForm && (
        <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="mb" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0 }}>
              <h2>{editId ? '✏️ تعديل طلب الإجازة' : '🌴 طلب إجازة جديد'}</h2>
              <p>تسجيل طلب إجازة وتحديد المدة والنوع</p>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label>الموظف <span className="req">*</span></label>
                  <select value={form.empId} onChange={fld('empId')}>
                    <option value="">-- اختر الموظف --</option>
                    {emps.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label>نوع الإجازة</label>
                  <select value={form.type} onChange={fld('type')}>
                    {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label>الحالة</label>
                  <select value={form.status} onChange={fld('status')} disabled={!canApprove}>
                    <option value="pending">⏳ معلق</option>
                    <option value="approved">✅ موافق</option>
                    <option value="rejected">❌ مرفوض</option>
                  </select>
                </div>
                <div className="fl">
                  <label>من تاريخ <span className="req">*</span></label>
                  <input type="date" value={form.from} onChange={fld('from')} />
                </div>
                <div className="fl">
                  <label>إلى تاريخ <span className="req">*</span></label>
                  <input type="date" value={form.to} onChange={fld('to')} />
                </div>
                {form.from && form.to && (
                  <div style={{ gridColumn: '1/-1', padding: '10px 14px', background: 'rgba(8, 145, 178, 0.1)', borderRadius: 'var(--r2)', fontSize: '.86rem', color: '#0891b2', fontWeight: 700 }}>
                    📅 إجمالي أيام الإجازة المحتسبة: {calcDays(form.from, form.to)} يوم
                  </div>
                )}
                <div className="fl full">
                  <label>سبب الإجازة</label>
                  <input value={form.reason} onChange={fld('reason')} placeholder="اكتب سبب طلب الإجازة..." />
                </div>
                <div className="fl full">
                  <label>ملاحظات إضافية</label>
                  <textarea value={form.notes} onChange={fld('notes')} rows={2} placeholder="أي ملاحظات أو تعليمات خاصة..." />
                </div>
              </div>
            </div>
            <div className="fa">
              <button className="btn btn-g" onClick={() => setShowForm(false)}>إلغاء</button>
              <button className="btn btn-p" onClick={save}>💾 حفظ الطلب</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

