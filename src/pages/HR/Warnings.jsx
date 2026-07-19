import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import EmptyState from '../../components/ui/EmptyState';

const EMPTY_WARN = { recipient:'', type:'warning', reason:'', date:'', notes:'' };

/**
 * نظام "الجزاءات" — منقول من "إدارة المركز ← الوثائق" (كان اسمه "الإنذارات"
 * هناك) إلى مكانه المنطقي الصحيح: لوحة الموظفين. يستخدم نفس مجموعة البيانات
 * القديمة "warnings" بالضبط، فكل السجلات السابقة تظهر هنا مباشرة دون أي
 * ترحيل بيانات.
 */
export default function Warnings() {
  const { go, toast, currentUser, center } = useApp();
  const [warnings, setWarnings] = useState([]);
  const [emps, setEmps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_WARN);
  const isManager = ['manager','vice'].includes(currentUser?.role);

  function reload() {
    setWarnings(lsGet('warnings') || []);
    setEmps(lsGet('employees'));
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

  const TYPE_LABEL = { warning: '⚠️ إنذار', suspension: '🚫 إيقاف', termination: '❌ إنهاء' };

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>⚠️ الجزاءات</h2><p>إنذارات وتنبيهات رسمية موثّقة لكل موظف</p></div>
        <div className="ph-a">
          {isManager && <button type="button" className="btn btn-p" onClick={openNew}>⚠️ جزاء جديد</button>}
          <button className="btn btn-g" onClick={() => go('hr')}>← رجوع للوحة الموظفين</button>
        </div>
      </div>

      {warnings.length === 0 ? (
        <EmptyState icon="⚠️" title="لا توجد جزاءات مسجلة" sub={isManager ? 'اضغط ⚠️ جزاء جديد للبدء' : ''} />
      ) : (
        warnings.map(w => (
          <div key={w.id} className="card" style={{ borderRight: '4px solid var(--err)', borderRadius: 8 }}>
            <div className="av" style={{ background: 'var(--err-l)', color: 'var(--err)' }}>⚠️</div>
            <div className="ci">
              <div className="cn">{w.recipient}</div>
              <div className="cm">{TYPE_LABEL[w.type] || w.type} · {w.date}</div>
              <div className="cm" style={{ color: 'var(--g5)' }}>{w.reason}</div>
            </div>
            <div className="c-acts" onClick={ev => ev.stopPropagation()}>
              {w.recipient && <button className="btn btn-xs btn-bl" onClick={() => sendWhatsapp(w)}>💬 واتس</button>}
              <button className="btn btn-xs btn-g" onClick={() => printItem(w, 'warning', center?.logo, center?.name)}>🖨️</button>
              {isManager && <button className="btn btn-xs btn-d" onClick={() => del(w.id)}>🗑️</button>}
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>⚠️ جزاء/إنذار جديد</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <div className="fl full"><label>الموجه إليه (الموظف) <span className="req">*</span></label>
                  <select value={form.recipient} onChange={fldW('recipient')}>
                    <option value="">اختر</option>
                    {emps.map(e => <option key={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="fl"><label>نوع الجزاء</label>
                  <select value={form.type} onChange={fldW('type')}>
                    <option value="warning">⚠️ إنذار</option>
                    <option value="suspension">🚫 إيقاف</option>
                    <option value="termination">❌ إنهاء</option>
                  </select>
                </div>
                <div className="fl"><label>التاريخ</label><input type="date" value={form.date} onChange={fldW('date')} /></div>
                <div className="fl full"><label>السبب <span className="req">*</span></label>
                  <textarea value={form.reason} onChange={fldW('reason')} rows={3} placeholder="اشرح أسباب الجزاء بشكل تفصيلي..." />
                </div>
                <div className="fl full"><label>ملاحظات إضافية</label><textarea value={form.notes} onChange={fldW('notes')} rows={2} /></div>
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
