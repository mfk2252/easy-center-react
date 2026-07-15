import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';

const PROGRAM_DOMAINS = [
  'التربية الخاصة', 'التدخل المبكر', 'مرحلة الروضة', 'صعوبات التعلم',
  'فرط الحركة ونقص الانتباه', 'تعديل السلوك', 'التكامل الحسي',
  'التفاعل الاجتماعي', 'الرعاية الذاتية', 'التخاطب والنطق',
];

const EMPTY_PROG = {
  ...EMPTY_STU_PICK, title: '', domain: 'التربية الخاصة', duration: '',
  objectives: '', activities: '',
};

export default function LongTermPrograms({ onBack }) {
  const { toast } = useApp();
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [progForm, setProgForm] = useState(EMPTY_PROG);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [helperNote, setHelperNote] = useState('');

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
  }
  useEffect(() => { reload(); }, []);

  const programs = lsGet('progPrograms').sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  function openNew() {
    setHelperNote('');
    setProgForm(EMPTY_PROG);
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(item) {
    setHelperNote('');
    setProgForm({ ...EMPTY_PROG, ...item });
    setEditId(item.id);
    setModalOpen(true);
  }

  function fillSuggestedDraft() {
    const domain = progForm.domain || 'التربية الخاصة';
    const name = progForm.studentName || 'المستفيد';
    setProgForm(f => ({
      ...f,
      objectives: f.objectives || `برنامج تدخل — ${domain}\nالطالب/ة: ${name}\n\nالأهداف:\n1. \n2. `,
      activities: f.activities || '• جلسات فردية 2× أسبوعياً\n• أنشطة منزلية موجهة\n• قياس تقدم كل 4 أسابيع',
    }));
    setHelperNote('تم تجهيز مسودة مقترحة — راجعها وعدّلها قبل الحفظ.');
  }

  function save() {
    if (!validateStudentPick(progForm)) { toast('⚠️ اختر الطالب أو أدخل اسمه', 'er'); return; }
    if (!progForm.title.trim()) { toast('⚠️ أدخل عنوان البرنامج', 'er'); return; }
    const payload = { ...progForm, isUnregistered: progForm.mode === 'other' };
    if (editId) { lsUpd('progPrograms', editId, payload); toast('✅ تم التحديث', 'ok'); }
    else { lsAdd('progPrograms', { ...payload, id: uid(), createdAt: todayStr() }); toast('✅ تم حفظ البرنامج', 'ok'); }
    setModalOpen(false);
  }

  function del(id) {
    if (!window.confirm('حذف هذا البرنامج نهائياً؟')) return;
    lsDel('progPrograms', id);
    toast('🗑️ تم الحذف', 'ok');
  }

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>📘 نظام البرامج طويلة المدى</h2><p>خطط تدخل ممتدة بأهداف وأنشطة محددة</p></div>
        <div className="ph-a" style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-p" onClick={openNew}>➕ برنامج جديد</button>
          <button type="button" className="btn btn-g" onClick={onBack}>← رجوع للوحة الأنظمة</button>
        </div>
      </div>

      {programs.length === 0 ? (
        <EmptyState icon="📘" title="لا توجد برامج طويلة المدى بعد" sub="اضغط ➕ برنامج جديد للبدء" />
      ) : (
        programs.map(p => (
          <div key={p.id} className="card">
            <div className="av cyan">📘</div>
            <div className="ci">
              <div className="cn">{p.title}{p.isUnregistered ? ' (غير مسجل)' : ''}</div>
              <div className="cm">{p.studentName} · {p.domain}{p.duration ? ' · ' + p.duration : ''}</div>
            </div>
            <div className="c-acts">
              <button type="button" className="btn btn-xs btn-g" onClick={() => openEdit(p)}>✏️</button>
              <button type="button" className="btn btn-xs btn-d" onClick={() => del(p.id)}>🗑️</button>
            </div>
          </div>
        ))
      )}

      {modalOpen && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>📘 {editId ? 'تعديل برنامج' : 'برنامج جديد'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              {helperNote && <div style={{ marginBottom: 12, padding: 10, background: 'var(--ok-l)', borderRadius: 8, fontSize: '.82rem' }}>{helperNote}</div>}
              <div className="fg c2">
                <StudentPicker form={progForm} setForm={setProgForm} students={students} emps={emps}/>
                <div className="fl full"><label>عنوان البرنامج <span className="req">*</span></label><input value={progForm.title} onChange={e => setProgForm(f => ({ ...f, title: e.target.value }))}/></div>
                <div className="fl"><label>المجال</label><select value={progForm.domain} onChange={e => setProgForm(f => ({ ...f, domain: e.target.value }))}>{PROGRAM_DOMAINS.map(d => <option key={d}>{d}</option>)}</select></div>
                <div className="fl"><label>المدة</label><input value={progForm.duration} onChange={e => setProgForm(f => ({ ...f, duration: e.target.value }))} placeholder="8 أسابيع"/></div>
                <div className="fl full"><label>الأهداف</label><textarea value={progForm.objectives} onChange={e => setProgForm(f => ({ ...f, objectives: e.target.value }))} rows={5}/></div>
                <div className="fl full"><label>الأنشطة</label><textarea value={progForm.activities} onChange={e => setProgForm(f => ({ ...f, activities: e.target.value }))} rows={4}/></div>
                <div className="fl full">
                  <button type="button" className="btn btn-s btn-sm" onClick={fillSuggestedDraft}>📝 تعبئة مقترحة</button>
                </div>
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
