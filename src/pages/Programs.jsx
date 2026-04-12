import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../hooks/useStorage';
import { todayStr, uid } from '../utils/dateHelpers';
import EmptyState from '../components/ui/EmptyState';

const EMPTY_ACT = {
  name: '',
  date: '',
  year: '',
  section: '',
  image: '',
  participantIds: [],
  responsibleEmpIds: [],
  notes: '',
  fileData: '',
  fileName: '',
};

export default function Programs() {
  const { toast, currentUser } = useApp();
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [filterYear, setFilterYear] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_ACT);
  const canEdit = ['manager', 'vice', 'reception'].includes(currentUser?.role);

  useEffect(() => {
    setActivities(lsGet('centerActivities'));
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    const y = String(new Date().getFullYear());
    setFilterYear(y);
  }, []);

  function reload() {
    setActivities(lsGet('centerActivities'));
    setEmps(lsGet('employees'));
  }

  const years = [...new Set(activities.map(a => a.year || (a.date && a.date.slice(0, 4)) || '').filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const displayYear = filterYear || years[0] || String(new Date().getFullYear());
  const filtered = activities
    .filter(a => {
      const y = a.year || (a.date && a.date.slice(0, 4)) || '';
      return !displayYear || y === displayYear;
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const fld = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  function toggleParticipant(id) {
    setForm(f => {
      const p = f.participantIds || [];
      return { ...f, participantIds: p.includes(id) ? p.filter(x => x !== id) : [...p, id] };
    });
  }

  function toggleResponsibleEmp(id) {
    setForm(f => {
      const p = f.responsibleEmpIds || [];
      return { ...f, responsibleEmpIds: p.includes(id) ? p.filter(x => x !== id) : [...p, id] };
    });
  }

  function handleImage(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(fm => ({ ...fm, image: ev.target.result }));
    r.readAsDataURL(f);
  }

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(fm => ({ ...fm, fileData: ev.target.result, fileName: f.name }));
    r.readAsDataURL(f);
  }

  function save() {
    if (!form.name.trim() || !form.date) {
      toast('⚠️ أدخل اسم النشاط والتاريخ', 'er');
      return;
    }
    const y = form.year || form.date.slice(0, 4);
    const row = {
      ...form,
      year: y,
      participantIds: form.participantIds || [],
      responsibleEmpIds: form.responsibleEmpIds || [],
    };
    if (editId) lsUpd('centerActivities', editId, row);
    else lsAdd('centerActivities', { ...row, id: uid() });
    toast('✅ تم الحفظ', 'ok');
    setShowForm(false);
    reload();
  }

  function del(id) {
    if (!window.confirm('حذف هذا النشاط؟')) return;
    lsDel('centerActivities', id);
    reload();
    toast('🗑️ تم الحذف', 'ok');
  }

  function openNew() {
    const y = String(new Date().getFullYear());
    setForm({ ...EMPTY_ACT, date: todayStr(), year: y, participantIds: [], responsibleEmpIds: [] });
    setEditId(null);
    setShowForm(true);
  }

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>🎯 الأنشطة والفعاليات</h2>
          <p>تسجيل الفعاليات والأنشطة اللامنهجية مع التاريخ والعام والمشاركين</p>
        </div>
        <div className="ph-a">
          {canEdit && (
            <button type="button" className="btn btn-p" onClick={openNew}>
              ➕ فعالية جديدة
            </button>
          )}
        </div>
      </div>

      <div className="tb" style={{ marginBottom: 12 }}>
        <label style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--g5)', marginLeft: 8 }}>العام:</label>
        <select className="fsel" value={displayYear} onChange={e => setFilterYear(e.target.value)}>
          {years.length === 0 && <option value={String(new Date().getFullYear())}>{new Date().getFullYear()}</option>}
          {years.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && <EmptyState icon="🎯" title="لا توجد فعاليات لهذا العام" sub={canEdit ? 'أضف فعالية مع صورة ومرفق ومشاركين' : ''} />}

      {filtered.map(act => {
        const parts = (act.participantIds || []).map(id => students.find(s => s.id === id)?.name).filter(Boolean);
        const respNames = (act.responsibleEmpIds || []).map(id => emps.find(e => e.id === id)?.name).filter(Boolean);
        return (
          <div key={act.id} className="card" style={{ marginBottom: 10 }}>
            <div className="av" style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
              {act.image ? <img src={act.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎯'}
            </div>
            <div className="ci">
              <div className="cn">{act.name}</div>
              <div className="cm">
                📅 {act.date} · العام {act.year || act.date?.slice(0, 4)}
              </div>
              {act.section?.trim() && <div className="cm">📂 {act.section}</div>}
              {respNames.length > 0 && <div className="cm">👷 مسؤولون: {respNames.join('، ')}</div>}
              {parts.length > 0 && <div className="cm">👥 مشاركون: {parts.join('، ')}</div>}
              {act.notes && <div className="cm">{act.notes}</div>}
            </div>
            <div className="c-badges">
              {act.fileName && <span className="bdg b-gr">📎 مرفق</span>}
            </div>
            {canEdit && (
              <div className="c-acts">
                {act.fileData && (
                  <a href={act.fileData} download={act.fileName || 'file'} className="btn btn-xs btn-g">
                    📥
                  </a>
                )}
                <button type="button" className="btn btn-xs btn-g" onClick={() => { setForm({ ...EMPTY_ACT, ...act, participantIds: act.participantIds || [], responsibleEmpIds: act.responsibleEmpIds || [] }); setEditId(act.id); setShowForm(true); }}>
                  ✏️
                </button>
                <button type="button" className="btn btn-xs btn-d" onClick={() => del(act.id)}>
                  🗑️
                </button>
              </div>
            )}
          </div>
        );
      })}

      {showForm && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
              <h2>{editId ? '✏️ تعديل فعالية' : '🎯 فعالية جديدة'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label>
                    اسم النشاط <span className="req">*</span>
                  </label>
                  <input value={form.name} onChange={fld('name')} />
                </div>
                <div className="fl">
                  <label>
                    التاريخ <span className="req">*</span>
                  </label>
                  <input type="date" value={form.date} onChange={fld('date')} />
                </div>
                <div className="fl">
                  <label>العام الدراسي / التقويمي</label>
                  <input value={form.year} onChange={fld('year')} placeholder="مثال: 2026" />
                </div>
                <div className="fl full">
                  <label>القسم / التصنيف (مثال)</label>
                  <input value={form.section} onChange={fld('section')} placeholder="مثال: قسم التدخل المبكر" />
                </div>
                <div className="fl full">
                  <label>صورة النشاط</label>
                  <input type="file" accept="image/*" onChange={handleImage} />
                </div>
                {form.image && (
                  <div className="fl full">
                    <img src={form.image} alt="" style={{ maxHeight: 120, borderRadius: 8 }} />
                  </div>
                )}
                <div className="fl full">
                  <label>المسؤولون عن الفعالية (موظفون)</label>
                  <div style={{ maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8 }}>
                    {emps.filter(e => e.role !== 'parent').map(e => (
                      <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.84rem', marginBottom: 4 }}>
                        <input type="checkbox" checked={(form.responsibleEmpIds || []).includes(e.id)} onChange={() => toggleResponsibleEmp(e.id)} />
                        {e.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="fl full">
                  <label>المشاركون (طلاب)</label>
                  <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8 }}>
                    {students.filter(s => !['inactive', 'transferred', 'rejected'].includes(s.status)).map(s => (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.84rem', marginBottom: 4 }}>
                        <input type="checkbox" checked={(form.participantIds || []).includes(s.id)} onChange={() => toggleParticipant(s.id)} />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="fl full">
                  <label>مرفق (ملف)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFile} />
                  {form.fileName && <span style={{ fontSize: '.8rem', marginRight: 8 }}>{form.fileName}</span>}
                </div>
                <div className="fl full">
                  <label>ملاحظات</label>
                  <textarea value={form.notes} onChange={fld('notes')} rows={3} />
                </div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={save}>
                💾 حفظ
              </button>
              <button type="button" className="btn btn-g" onClick={() => setShowForm(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
