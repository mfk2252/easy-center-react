import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';

/**
 * قالب عام قابل لإعادة الاستخدام لأي نظام تقارير من الأنظمة العشرة لا يملك
 * بعد تصميماً مخصصاً. يوفّر: عرض قائمة، إضافة/تعديل، طباعة، حذف — كل ذلك
 * معزول تلقائياً حسب المركز الحالي (نفس آلية lsGet/lsAdd في كل الملفات).
 *
 * عند استلام تصميم مخصص لنظام معيّن لاحقاً، يُستبدل هذا المكوّن بملف خاص
 * بنفس الاسم (مثل WeeklyReports.jsx) دون أي تعديل على index.jsx أو التوجيه.
 */
export default function GenericSystem({ title, icon, collectionKey, onBack }) {
  const { toast, center } = useApp();
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const EMPTY_FORM = { ...EMPTY_STU_PICK, date: todayStr(), title: '', content: '', notes: '' };
  const [form, setForm] = useState(EMPTY_FORM);

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    setItems(lsGet(collectionKey).sort((a, b) => (b.date || '').localeCompare(a.date || '')));
  }
  useEffect(() => { reload(); }, [collectionKey]);

  function openNew() {
    setForm({ ...EMPTY_FORM, date: todayStr() });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(item) {
    setForm({ ...EMPTY_FORM, ...item });
    setEditId(item.id);
    setModalOpen(true);
  }

  function save() {
    if (!validateStudentPick(form)) { toast('⚠️ اختر الطالب أو أدخل اسمه', 'er'); return; }
    if (!form.title.trim()) { toast('⚠️ أدخل عنوان التقرير', 'er'); return; }
    const payload = { ...form, isUnregistered: form.mode === 'other' };
    if (editId) { lsUpd(collectionKey, editId, payload); toast('✅ تم التحديث', 'ok'); }
    else { lsAdd(collectionKey, { ...payload, id: uid() }); toast('✅ تم الحفظ', 'ok'); }
    setModalOpen(false);
    reload();
  }

  function del(id) {
    if (!window.confirm('حذف هذا العنصر نهائياً؟')) return;
    lsDel(collectionKey, id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  function printOne(item) {
    printItem(
      { html: `<h2>${icon} ${esc(item.title)}</h2><p><b>الطالب:</b> ${esc(item.studentName)}${item.isUnregistered ? ' (غير مسجل)' : ''}</p><p><b>التاريخ:</b> ${esc(item.date)}</p><div style="white-space:pre-wrap;margin-top:12px;">${esc(item.content)}</div>${item.notes ? `<p style="margin-top:10px;"><b>ملاحظات:</b> ${esc(item.notes)}</p>` : ''}` },
      'generic',
      center?.logo,
      center?.name,
    );
  }

  function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>{icon} {title}</h2>
          <p>عرض وإضافة سجلات هذا النظام — معزولة بالكامل لمركزك</p>
        </div>
        <div className="ph-a" style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-p" onClick={openNew}>➕ إضافة جديد</button>
          <button type="button" className="btn btn-g" onClick={onBack}>← رجوع للوحة الأنظمة</button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={icon} title={`لا توجد سجلات في ${title} بعد`} sub="اضغط ➕ إضافة جديد للبدء" />
      ) : (
        items.map(item => (
          <div key={item.id} className="card">
            <div className="av cyan">{icon}</div>
            <div className="ci">
              <div className="cn">{item.title}{item.isUnregistered && <span className="bdg b-or" style={{ marginRight: 6 }}>غير مسجل</span>}</div>
              <div className="cm">{item.studentName} · {item.date}</div>
            </div>
            <div className="c-acts">
              <button type="button" className="btn btn-xs btn-bl" onClick={() => printOne(item)}>🖨️</button>
              <button type="button" className="btn btn-xs btn-g" onClick={() => openEdit(item)}>✏️</button>
              <button type="button" className="btn btn-xs btn-d" onClick={() => del(item.id)}>🗑️</button>
            </div>
          </div>
        ))
      )}

      {modalOpen && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>{icon} {editId ? `تعديل — ${title}` : `إضافة جديد — ${title}`}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <StudentPicker form={form} setForm={setForm} students={students} emps={emps} showExtra />
                <div className="fl"><label>التاريخ <span className="req">*</span></label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}/></div>
                <div className="fl full"><label>عنوان السجل <span className="req">*</span></label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={`عنوان ${title}...`}/></div>
                <div className="fl full"><label>المحتوى / التفاصيل</label><textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8}/></div>
                <div className="fl full"><label>ملاحظات إضافية</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}/></div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={save}>💾 حفظ</button>
              <button type="button" className="btn btn-g" onClick={() => setModalOpen(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
