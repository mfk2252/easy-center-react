import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import { Award, Plus, Printer, MessageCircle, Trash2, Calendar, Search, DollarSign } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';

const EMPTY_BONUS = { recipient: '', type: 'appreciation', amount: '', reason: '', date: '', notes: '' };
const TYPE_LABEL = { appreciation: '⭐ تقديرية / معنوية', financial: '💰 مكافأة مالية' };

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function Bonuses() {
  const { go, toast, currentUser, center } = useApp();
  const [bonuses, setBonuses] = useState([]);
  const [emps, setEmps] = useState([]);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_BONUS);
  const isManager = ['manager', 'vice'].includes(currentUser?.role);

  function reload() {
    setBonuses(lsGet('bonuses') || []);
    setEmps(lsGet('employees') || []);
  }
  useEffect(() => { reload(); }, []);

  const fldB = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  function openNew() {
    setForm({ ...EMPTY_BONUS, date: todayStr() });
    setShowForm(true);
  }

  function save() {
    if (!form.recipient || !form.reason.trim()) { toast('⚠️ أدخل البيانات المطلوبة', 'er'); return; }
    if (form.type === 'financial' && !form.amount) { toast('⚠️ أدخل قيمة المكافأة المالية', 'er'); return; }
    lsAdd('bonuses', { ...form, id: uid() });
    setShowForm(false);
    setForm(EMPTY_BONUS);
    toast('✅ تم حفظ المكافأة', 'ok');
    reload();
  }

  function del(id) {
    if (!window.confirm('حذف هذه المكافأة نهائياً؟')) return;
    lsDel('bonuses', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  function sendWhatsapp(b) {
    const msg = `⭐ مكافأة تقديرية\n\nالاسم: ${b.recipient}\nالنوع: ${TYPE_LABEL[b.type] || b.type}${b.type === 'financial' && b.amount ? `\nالقيمة: ${Number(b.amount).toLocaleString()} ر.س` : ''}\nالسبب: ${b.reason}\n\nالتاريخ: ${b.date}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  }

  function printOne(b) {
    printItem(
      {
        html: `<h2 style="color:#059669;">⭐ مكافأة تقديرية</h2>
        <table>
          <tr><td style="padding:8px;border:1px solid #ddd;"><b>الموظف</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(b.recipient)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><b>النوع</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(TYPE_LABEL[b.type] || b.type)}</td></tr>
          ${b.type === 'financial' && b.amount ? `<tr><td style="padding:8px;border:1px solid #ddd;"><b>القيمة</b></td><td style="padding:8px;border:1px solid #ddd;">${Number(b.amount).toLocaleString()} ر.س</td></tr>` : ''}
          <tr><td style="padding:8px;border:1px solid #ddd;"><b>التاريخ</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(b.date)}</td></tr>
        </table>
        <p style="margin-top:12px;"><b>السبب:</b> ${esc(b.reason)}</p>
        ${b.notes ? `<p><b>ملاحظات:</b> ${esc(b.notes)}</p>` : ''}`,
      },
      'generic',
      center?.logo,
      center?.name,
    );
  }

  const totalFinancialAmount = bonuses
    .filter(b => b.type === 'financial' && Number(b.amount))
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const filteredBonuses = bonuses.filter(b => {
    if (typeFilter !== 'all' && b.type !== typeFilter) return false;
    if (q) {
      const s = q.toLowerCase();
      return (b.recipient || '').toLowerCase().includes(s) || (b.reason || '').toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl' }}>
      
      {/* الترويسة الموحدة */}
      <UnifiedPageHeader
        icon={<Award style={{ width: 24, height: 24 }} />}
        iconBg="rgba(16, 185, 129, 0.15)"
        iconColor="#10b981"
        accentColor="#10b981"
        title="سجل المكافآت والحوافز التقديرية"
        subtitle="توثيق التميز الوظيفي والمكافآت المالية والمعنوية للكوادر"
        badge={`${bonuses.length} مكافأة`}
        actions={
          isManager && (
            <button
              type="button"
              className="btn btn-p"
              onClick={openNew}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: '0.86rem' }}
            >
              <Plus style={{ width: 16, height: 16 }} />
              <span>تسجيل مكافأة جديدة</span>
            </button>
          )
        }
        onBack={() => go('hr')}
        backLabel="العودة للوحة الموظفين"
      />

      {/* إحصائيات سريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 18 }}>
        <div className="unified-stat-box">
          <div className="stat-label">⭐ إجمالي المكافآت</div>
          <div className="stat-val">{bonuses.length}</div>
          <div className="stat-sub">كافة المكافآت الممنوحة</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">🌟 مكافآت تقديرية</div>
          <div className="stat-val" style={{ color: 'var(--pr)' }}>
            {bonuses.filter(b => b.type === 'appreciation').length}
          </div>
          <div className="stat-sub">شهادات وشكر وتقدير</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">💰 مكافآت مالية</div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>
            {bonuses.filter(b => b.type === 'financial').length}
          </div>
          <div className="stat-sub">حوافز نقدية معتمدة</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">💵 إجمالي المبالغ المنصرفة</div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>
            {totalFinancialAmount.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>ر.س</span>
          </div>
          <div className="stat-sub">إجمالي الحوافز المالية</div>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="unified-filter-toolbar" style={{ gridTemplateColumns: '1fr auto' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ width: 15, height: 15, position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
          <input
            type="text"
            placeholder="ابحث باسم الموظف أو سبب المكافأة..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="srch"
            style={{ width: '100%', paddingRight: 36, height: 38, fontSize: '0.84rem' }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="srch"
          style={{ height: 38, fontSize: '0.84rem', fontWeight: 600 }}
        >
          <option value="all">📌 جميع أنواع المكافآت</option>
          <option value="appreciation">⭐ تقديرية / معنوية</option>
          <option value="financial">💰 مكافأة مالية</option>
        </select>
      </div>

      {/* قائمة الكروت الموحدة */}
      {filteredBonuses.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="لا توجد مكافآت مسجلة"
          sub={isManager ? 'اضغط "تسجيل مكافأة جديدة" لتحفيز أحد الموظفين المتميزين' : ''}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {filteredBonuses.map(b => {
            const isFin = b.type === 'financial';
            return (
              <div
                key={b.id}
                className="unified-card"
                style={{
                  borderRight: isFin ? '5px solid var(--ok)' : '5px solid #d97706',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: isFin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: isFin ? 'var(--ok)' : '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {isFin ? '💰' : '⭐'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {b.recipient}
                      </h4>
                      <span
                        className="bdg"
                        style={{
                          fontSize: '0.74rem',
                          background: isFin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isFin ? 'var(--ok)' : '#d97706',
                          fontWeight: 700,
                        }}
                      >
                        {TYPE_LABEL[b.type] || b.type}
                      </span>
                      {isFin && b.amount && (
                        <span className="bdg b-gr" style={{ fontWeight: 800, fontSize: '0.8rem' }}>
                          +{Number(b.amount).toLocaleString()} ر.س
                        </span>
                      )}
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Calendar style={{ width: 12, height: 12 }} />
                        <span>{b.date}</span>
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: 6, lineHeight: 1.5 }}>
                      <b>السبب والدافع:</b> {b.reason}
                    </div>
                    {b.notes && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--g5)', marginTop: 4 }}>
                        <b>ملاحظات:</b> {b.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={ev => ev.stopPropagation()}>
                  {b.recipient && (
                    <button
                      className="btn btn-xs btn-s"
                      onClick={() => sendWhatsapp(b)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      title="إرسال تهنئة عبر واتساب"
                    >
                      <MessageCircle style={{ width: 13, height: 13 }} />
                      <span>واتساب</span>
                    </button>
                  )}
                  <button
                    className="btn btn-xs btn-g"
                    onClick={() => printOne(b)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    title="طباعة وثيقة المكافأة"
                  >
                    <Printer style={{ width: 13, height: 13 }} />
                    <span>طباعة</span>
                  </button>
                  {isManager && (
                    <button
                      className="btn btn-xs btn-g"
                      onClick={() => del(b.id)}
                      title="حذف المكافأة"
                      style={{ color: 'var(--err)' }}
                    >
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة المكافأة الجديدة */}
      {showForm && (
        <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0 }}>
              <h2>⭐ منح مكافأة أو حافز</h2>
              <p>توثيق التميز ومنح الحوافز التقديرية أو المالية للكوادر</p>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label>الموظف المستحق <span className="req">*</span></label>
                  <select value={form.recipient} onChange={fldB('recipient')}>
                    <option value="">-- اختر الموظف --</option>
                    {emps.map(e => <option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label>نوع المكافأة</label>
                  <select value={form.type} onChange={fldB('type')}>
                    <option value="appreciation">⭐ تقديرية / معنوية</option>
                    <option value="financial">💰 مالية</option>
                  </select>
                </div>
                {form.type === 'financial' && (
                  <div className="fl">
                    <label>القيمة (ريال سعودي) <span className="req">*</span></label>
                    <input type="number" min="0" placeholder="مثال: 500" value={form.amount} onChange={fldB('amount')} />
                  </div>
                )}
                <div className="fl">
                  <label>تاريخ المنح</label>
                  <input type="date" value={form.date} onChange={fldB('date')} />
                </div>
                <div className="fl full">
                  <label>السبب ومبررات التميز <span className="req">*</span></label>
                  <textarea value={form.reason} onChange={fldB('reason')} rows={3} placeholder="اشرح سبب استحقاق المكافأة والجهد المبذول..." />
                </div>
                <div className="fl full">
                  <label>ملاحظات إضافية</label>
                  <textarea value={form.notes} onChange={fldB('notes')} rows={2} placeholder="أي توجيهات أو إرشادات مصاحبة للمكافأة..." />
                </div>
              </div>
            </div>
            <div className="fa">
              <button className="btn btn-g" onClick={() => setShowForm(false)}>إلغاء</button>
              <button className="btn btn-p" onClick={save}>💾 حفظ المكافأة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

