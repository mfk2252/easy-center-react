import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import { AlertTriangle, Plus, Printer, MessageCircle, Trash2, Calendar, Search } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';

const EMPTY_WARN = { recipient:'', type:'warning', reason:'', date:'', notes:'' };

export default function Warnings() {
  const { go, toast, currentUser, center } = useApp();
  const [warnings, setWarnings] = useState([]);
  const [emps, setEmps] = useState([]);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_WARN);
  const isManager = ['manager','vice'].includes(currentUser?.role);

  function reload() {
    setWarnings(lsGet('warnings') || []);
    setEmps(lsGet('employees') || []);
  }
  useEffect(() => { reload(); }, []);

  const fldW = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  function openNew() {
    setForm({ ...EMPTY_WARN, date: todayStr() });
    setShowForm(true);
  }

  function save() {
    if (!form.recipient || !form.reason) { toast('⚠️ أدخل البيانات المطلوبة', 'er'); return; }
    lsAdd('warnings', { ...form, id: uid() });
    setShowForm(false);
    setForm(EMPTY_WARN);
    toast('✅ تم حفظ الجزاء/الإنذار', 'ok');
    reload();
  }

  function del(id) {
    if (!window.confirm('حذف هذا الجزاء نهائياً؟')) return;
    lsDel('warnings', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  function sendWhatsapp(w) {
    const msg = `⚠️ إنذار رسمي\n\nالاسم: ${w.recipient}\nالنوع: ${w.type==='warning'?'إنذار':w.type==='suspension'?'إيقاف':'إنهاء'}\nالسبب: ${w.reason}\n\nالتاريخ: ${w.date}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  }

  const TYPE_LABEL = { warning: '⚠️ إنذار إداري', suspension: '🚫 إيقاف عن العمل', termination: '❌ إنهاء خدمات' };
  const TYPE_COLOR = { warning: 'var(--warn)', suspension: 'var(--err)', termination: '#991b1b' };

  const filteredWarnings = warnings.filter(w => {
    if (typeFilter !== 'all' && w.type !== typeFilter) return false;
    if (q) {
      const s = q.toLowerCase();
      return (w.recipient || '').toLowerCase().includes(s) || (w.reason || '').toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl' }}>
      
      {/* الترويسة الموحدة */}
      <UnifiedPageHeader
        icon={<AlertTriangle style={{ width: 24, height: 24 }} />}
        iconBg="rgba(239, 68, 68, 0.15)"
        iconColor="#ef4444"
        accentColor="#ef4444"
        title="سجل الجزاءات والإنذارات"
        subtitle="إنذارات وتنبيهات رسمية موثّقة لكل موظف مع إمكانية التصدير والمراسلة"
        badge={`${warnings.length} سجل`}
        actions={
          isManager && (
            <button
              type="button"
              className="btn btn-p"
              onClick={openNew}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: '0.86rem' }}
            >
              <Plus style={{ width: 16, height: 16 }} />
              <span>تسجيل جزاء جديد</span>
            </button>
          )
        }
        onBack={() => go('hr')}
        backLabel="العودة للوحة الموظفين"
      />

      {/* إحصائيات سريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 18 }}>
        <div className="unified-stat-box">
          <div className="stat-label">⚠️ إجمالي الجزاءات</div>
          <div className="stat-val">{warnings.length}</div>
          <div className="stat-sub">كافة السجلات المحفوظة</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">📝 إنذارات إدارية</div>
          <div className="stat-val" style={{ color: 'var(--warn)' }}>
            {warnings.filter(w => w.type === 'warning').length}
          </div>
          <div className="stat-sub">إنذار وتنبيه أولي</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">🚫 قرارات إيقاف</div>
          <div className="stat-val" style={{ color: 'var(--err)' }}>
            {warnings.filter(w => w.type === 'suspension').length}
          </div>
          <div className="stat-sub">إيقاف مؤقت عن العمل</div>
        </div>

        <div className="unified-stat-box">
          <div className="stat-label">❌ إنهاء خدمات</div>
          <div className="stat-val" style={{ color: '#991b1b' }}>
            {warnings.filter(w => w.type === 'termination').length}
          </div>
          <div className="stat-sub">قرارات إنهاء التعاقد</div>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="unified-filter-toolbar" style={{ gridTemplateColumns: '1fr auto' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ width: 15, height: 15, position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
          <input
            type="text"
            placeholder="ابحث باسم الموظف أو سبب الجزاء..."
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
          <option value="all">📌 جميع أنواع الجزاءات</option>
          <option value="warning">⚠️ إنذار إداري</option>
          <option value="suspension">🚫 إيقاف عن العمل</option>
          <option value="termination">❌ إنهاء خدمات</option>
        </select>
      </div>

      {/* قائمة الكروت الموحدة */}
      {filteredWarnings.length === 0 ? (
        <EmptyState
          icon="⚠️"
          title="لا توجد جزاءات مسجلة"
          sub={isManager ? 'اضغط "تسجيل جزاء جديد" لإصدار إنذار أو تنبيه رسمي' : ''}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {filteredWarnings.map(w => {
            const color = TYPE_COLOR[w.type] || 'var(--err)';
            return (
              <div
                key={w.id}
                className="unified-card"
                style={{
                  borderRight: `5px solid ${color}`,
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
                      background: `${color}18`,
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ⚠️
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {w.recipient}
                      </h4>
                      <span
                        className="bdg"
                        style={{
                          fontSize: '0.74rem',
                          background: `${color}15`,
                          color: color,
                          fontWeight: 700,
                        }}
                      >
                        {TYPE_LABEL[w.type] || w.type}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Calendar style={{ width: 12, height: 12 }} />
                        <span>{w.date}</span>
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: 6, lineHeight: 1.5 }}>
                      <b>السبب:</b> {w.reason}
                    </div>
                    {w.notes && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--g5)', marginTop: 4 }}>
                        <b>ملاحظات:</b> {w.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={ev => ev.stopPropagation()}>
                  {w.recipient && (
                    <button
                      className="btn btn-xs btn-s"
                      onClick={() => sendWhatsapp(w)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      title="إرسال عبر واتساب"
                    >
                      <MessageCircle style={{ width: 13, height: 13 }} />
                      <span>واتساب</span>
                    </button>
                  )}
                  <button
                    className="btn btn-xs btn-g"
                    onClick={() => printItem(w, 'warning', center?.logo, center?.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    title="طباعة قرار الجزاء"
                  >
                    <Printer style={{ width: 13, height: 13 }} />
                    <span>طباعة</span>
                  </button>
                  {isManager && (
                    <button
                      className="btn btn-xs btn-g"
                      onClick={() => del(w.id)}
                      title="حذف الجزاء"
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

      {/* نافذة الجزاء الجديد */}
      {showForm && (
        <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0 }}>
              <h2>⚠️ تسجيل جزاء أو إنذار رسمي</h2>
              <p>توثيق قرار الجزاء الإداري في ملف الموظف</p>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label>الموجه إليه (الموظف) <span className="req">*</span></label>
                  <select value={form.recipient} onChange={fldW('recipient')}>
                    <option value="">-- اختر الموظف --</option>
                    {emps.map(e => <option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label>نوع الجزاء</label>
                  <select value={form.type} onChange={fldW('type')}>
                    <option value="warning">⚠️ إنذار إداري</option>
                    <option value="suspension">🚫 إيقاف عن العمل</option>
                    <option value="termination">❌ إنهاء خدمات</option>
                  </select>
                </div>
                <div className="fl">
                  <label>تاريخ الواقعة / القرار</label>
                  <input type="date" value={form.date} onChange={fldW('date')} />
                </div>
                <div className="fl full">
                  <label>السبب والتفاصيل <span className="req">*</span></label>
                  <textarea value={form.reason} onChange={fldW('reason')} rows={3} placeholder="اشرح أسباب الجزاء بشكل تفصيلي وموثق..." />
                </div>
                <div className="fl full">
                  <label>ملاحظات إضافية</label>
                  <textarea value={form.notes} onChange={fldW('notes')} rows={2} placeholder="أي توجيهات إدارية أو شروط لرفع الجزاء..." />
                </div>
              </div>
            </div>
            <div className="fa">
              <button className="btn btn-g" onClick={() => setShowForm(false)}>إلغاء</button>
              <button className="btn btn-p" onClick={save}>💾 حفظ القرار</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

