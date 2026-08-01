import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import { GoalPickerModal, GoalsBankManagerModal } from './GoalsBank';
import { DOMAINS, domainLabel, programLabel, programColor } from '../../utils/goalsBank';

const EMPTY_PROG = {
  ...EMPTY_STU_PICK, title: '', domain: DOMAINS[0].key, duration: '',
  goals: [], activities: '',
};

export default function LongTermPrograms({ onBack }) {
  const { toast, center } = useApp();
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [progForm, setProgForm] = useState(EMPTY_PROG);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showBankManager, setShowBankManager] = useState(false);

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
  }
  useEffect(() => { reload(); }, []);

  const programs = lsGet('progPrograms').sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  function openNew() {
    setProgForm(EMPTY_PROG);
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(item) {
    setProgForm({ ...EMPTY_PROG, ...item, goals: item.goals || [] });
    setEditId(item.id);
    setModalOpen(true);
  }

  function removeGoal(text) {
    setProgForm(f => ({ ...f, goals: f.goals.filter(g => g.text !== text) }));
  }

  function save() {
    if (!validateStudentPick(progForm)) { toast('⚠️ اختر الطالب أو أدخل اسمه', 'er'); return; }
    if (!progForm.title.trim()) { toast('⚠️ أدخل عنوان البرنامج', 'er'); return; }
    if (!progForm.goals.length) { toast('⚠️ اختر هدفاً واحداً على الأقل من بنك الأهداف', 'er'); return; }
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

  function printProgram(p) {
    const goalsHtml = (p.goals || []).map(g =>
      `<li><b>[${programLabel(g.program)}]</b> ${g.text}</li>`
    ).join('');
    printItem({
      html: `<h2 style="color:#7c3aed;">📘 ${p.title}</h2>
      <p><b>الطالب:</b> ${p.studentName}${p.isUnregistered ? ' (غير مسجل)' : ''}</p>
      <p><b>المجال:</b> ${domainLabel(p.domain)}${p.duration ? ' · المدة: ' + p.duration : ''}</p>
      <h3 style="margin-top:14px;color:#334155;">🎯 الأهداف المختارة</h3>
      <ul style="line-height:1.9;">${goalsHtml || '<li>لا توجد أهداف</li>'}</ul>
      ${p.activities ? `<h3 style="margin-top:14px;color:#334155;">الأنشطة والاستراتيجيات</h3><div style="white-space:pre-wrap;">${p.activities}</div>` : ''}`,
    }, 'generic', center?.logo, center?.name);
  }

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>📘 نظام البرامج طويلة المدى</h2><p>خطط تدخل مبنية على أهداف من بنوك متعددة (لوفاس، بورتاج، إيبلز، ومخصص مركزك)</p></div>
        <div className="ph-a" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-p" onClick={openNew}>➕ برنامج جديد</button>
          <button type="button" className="btn btn-g btn-sm" onClick={() => setShowBankManager(true)}>🗂️ إدارة بنك الأهداف</button>
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
              <div className="cm">{p.studentName} · {domainLabel(p.domain)}{p.duration ? ' · ' + p.duration : ''} · {(p.goals || []).length} هدف</div>
            </div>
            <div className="c-acts">
              <button type="button" className="btn btn-xs btn-bl" onClick={() => printProgram(p)}>🖨️</button>
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
              <div className="fg c2">
                <StudentPicker form={progForm} setForm={setProgForm} students={students} emps={emps}/>
                <div className="fl full"><label>عنوان البرنامج <span className="req">*</span></label><input value={progForm.title} onChange={e => setProgForm(f => ({ ...f, title: e.target.value }))}/></div>
                <div className="fl"><label>المجال</label>
                  <select value={progForm.domain} onChange={e => setProgForm(f => ({ ...f, domain: e.target.value }))}>
                    {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                  </select>
                </div>
                <div className="fl"><label>المدة</label><input value={progForm.duration} onChange={e => setProgForm(f => ({ ...f, duration: e.target.value }))} placeholder="8 أسابيع"/></div>

                <div className="fl full">
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>🎯 الأهداف المختارة ({progForm.goals.length})</span>
                    <button type="button" className="btn btn-s btn-sm" onClick={() => setShowGoalPicker(true)}>➕ اختيار من البنك</button>
                  </label>
                  {progForm.goals.length === 0 ? (
                    <div style={{ padding: 14, textAlign: 'center', color: 'var(--g4)', border: '1.5px dashed var(--border-color)', borderRadius: 10, fontSize: '.84rem' }}>
                      لم تُختَر أهداف بعد — اضغط "اختيار من البنك" لتصفح لوفاس/بورتاج/إيبلز معاً حسب المجال المحدَّد أعلاه
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {progForm.goals.map(g => (
                        <div key={g.text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '.84rem' }}>
                          <span style={{ fontSize: '.68rem', fontWeight: 800, color: programColor(g.program), background: programColor(g.program) + '18', padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                            {programLabel(g.program)}
                          </span>
                          <span style={{ flex: 1 }}>{g.text}</span>
                          <button type="button" className="btn btn-xs btn-d" onClick={() => removeGoal(g.text)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="fl full"><label>الأنشطة والاستراتيجيات</label><textarea value={progForm.activities} onChange={e => setProgForm(f => ({ ...f, activities: e.target.value }))} rows={4} placeholder="جلسات فردية 2× أسبوعياً، أنشطة منزلية موجَّهة..."/></div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={save}>💾 حفظ</button>
              <button type="button" className="btn btn-g" onClick={() => setModalOpen(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showGoalPicker && (
        <GoalPickerModal
          domain={progForm.domain}
          alreadySelected={progForm.goals}
          onClose={() => setShowGoalPicker(false)}
          onConfirm={(goals) => { setProgForm(f => ({ ...f, goals })); setShowGoalPicker(false); }}
        />
      )}

      {showBankManager && <GoalsBankManagerModal onClose={() => setShowBankManager(false)} />}
    </div>
  );
}
