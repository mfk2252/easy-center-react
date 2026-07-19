import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import EmptyState from '../../components/ui/EmptyState';

const EMPTY_BONUS = { recipient: '', type: 'appreciation', amount: '', reason: '', date: '', notes: '' };
const TYPE_LABEL = { appreciation: '⭐ تقديرية', financial: '💰 مالية' };

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * نظام "المكافآت" — جديد كلياً، مبني بنفس بنية "الجزاءات" بالضبط لتناسق
 * الشكل والتجربة، مع فارق أن المكافأة قد تكون تقديرية (بدون مبلغ) أو مالية.
 */
export default function Bonuses() {
  const { go, toast, currentUser, center } = useApp();
  const [bonuses, setBonuses] = useState([]);
  const [emps, setEmps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_BONUS);
  const isManager = ['manager', 'vice'].includes(currentUser?.role);

  function reload() {
    setBonuses(lsGet('bonuses') || []);
    setEmps(lsGet('employees'));
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
    const msg = `⭐ مكافأة\n\nالاسم: ${b.recipient}\nالنوع: ${TYPE_LABEL[b.type] || b.type}${b.type === 'financial' && b.amount ? `\nالقيمة: ${Number(b.amount).toLocaleString()} ر` : ''}\nالسبب: ${b.reason}\n\nالتاريخ: ${b.date}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  }

  function printOne(b) {
    printItem(
      {
        html: `<h2 style="color:#059669;">⭐ مكافأة</h2>
        <table>
          <tr><td style="padding:8px;border:1px solid #ddd;"><b>الموظف</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(b.recipient)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><b>النوع</b></td><td style="padding:8px;border:1px solid #ddd;">${esc(TYPE_LABEL[b.type] || b.type)}</td></tr>
          ${b.type === 'financial' && b.amount ? `<tr><td style="padding:8px;border:1px solid #ddd;"><b>القيمة</b></td><td style="padding:8px;border:1px solid #ddd;">${Number(b.amount).toLocaleString()} ر</td></tr>` : ''}
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

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>⭐ المكافآت</h2><p>تقدير وتحفيز موثّق لكل موظف</p></div>
        <div className="ph-a">
          {isManager && <button type="button" className="btn btn-p" onClick={openNew}>⭐ مكافأة جديدة</button>}
          <button className="btn btn-g" onClick={() => go('hr')}>← رجوع للوحة الموظفين</button>
        </div>
      </div>

      {bonuses.length === 0 ? (
        <EmptyState icon="⭐" title="لا توجد مكافآت مسجلة" sub={isManager ? 'اضغط ⭐ مكافأة جديدة للبدء' : ''} />
      ) : (
        bonuses.map(b => (
          <div key={b.id} className="card" style={{ borderRight: '4px solid var(--ok)', borderRadius: 8 }}>
            <div className="av ok">⭐</div>
            <div className="ci">
              <div className="cn">{b.recipient}</div>
              <div className="cm">
                {TYPE_LABEL[b.type] || b.type}
                {b.type === 'financial' && b.amount ? ` · ${Number(b.amount).toLocaleString()} ر` : ''} · {b.date}
              </div>
              <div className="cm" style={{ color: 'var(--g5)' }}>{b.reason}</div>
            </div>
            <div className="c-acts" onClick={ev => ev.stopPropagation()}>
              {b.recipient && <button className="btn btn-xs btn-bl" onClick={() => sendWhatsapp(b)}>💬 واتس</button>}
              <button className="btn btn-xs btn-g" onClick={() => printOne(b)}>🖨️</button>
              {isManager && <button className="btn btn-xs btn-d" onClick={() => del(b.id)}>🗑️</button>}
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>⭐ مكافأة جديدة</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <div className="fl full"><label>الموظف <span className="req">*</span></label>
                  <select value={form.recipient} onChange={fldB('recipient')}>
                    <option value="">اختر</option>
                    {emps.map(e => <option key={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="fl"><label>نوع المكافأة</label>
                  <select value={form.type} onChange={fldB('type')}>
                    <option value="appreciation">⭐ تقديرية</option>
                    <option value="financial">💰 مالية</option>
                  </select>
                </div>
                {form.type === 'financial' && (
                  <div className="fl"><label>القيمة (ريال) <span className="req">*</span></label>
                    <input type="number" min="0" value={form.amount} onChange={fldB('amount')} />
                  </div>
                )}
                <div className="fl"><label>التاريخ</label><input type="date" value={form.date} onChange={fldB('date')} /></div>
                <div className="fl full"><label>السبب <span className="req">*</span></label>
                  <textarea value={form.reason} onChange={fldB('reason')} rows={3} placeholder="سبب منح المكافأة..." />
                </div>
                <div className="fl full"><label>ملاحظات إضافية</label><textarea value={form.notes} onChange={fldB('notes')} rows={2} /></div>
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
