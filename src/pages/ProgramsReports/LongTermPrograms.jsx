import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import { GoalPickerModal, GoalsBankManagerModal } from './GoalsBank';
import { DOMAINS, domainLabel, programLabel, programColor } from '../../utils/goalsBank';

const EMPTY_PROG = {
  ...EMPTY_STU_PICK,
  title: '',
  domain: DOMAINS[0].key,
  duration: '',
  goals: [],
  activities: '',
  studentSummary: '',
  assessmentDate: todayStr(),
  programFrequency: '',
  level: '',
  programSource: 'custom'
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
    setStudents(lsGet('students') || []);
    setEmps(lsGet('employees') || []);
  }

  useEffect(() => { reload(); }, []);

  const programs = (lsGet('progPrograms') || []).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  function openNew() {
    setProgForm({ ...EMPTY_PROG, assessmentDate: todayStr() });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setProgForm({ ...EMPTY_PROG, ...item, goals: item.goals || [], assessmentDate: item.assessmentDate || todayStr() });
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

    const payload = {
      ...progForm,
      title: progForm.title.trim(),
      isUnregistered: progForm.mode === 'other',
      updatedAt: todayStr()
    };

    if (editId) {
      lsUpd('progPrograms', editId, payload);
      toast('✅ تم التحديث', 'ok');
    } else {
      lsAdd('progPrograms', { ...payload, id: uid(), createdAt: todayStr() });
      toast('✅ تم حفظ البرنامج', 'ok');
    }

    setModalOpen(false);
  }

  function del(id) {
    if (!window.confirm('حذف هذا البرنامج نهائياً؟')) return;
    lsDel('progPrograms', id);
    toast('🗑️ تم الحذف', 'ok');
  }

  function printProgram(p) {
    const title = p.title || 'خطة تربوية فردية';
    const studentBlock = p.mode === 'other' || !p.stuId ? p.studentName : `${p.studentName || ''}`;
    const studentAge = p.age || (p.dob ? calcAge(p.dob) : 'غير محدد');
    const goalsRows = (p.goals || []).map(g => {
      const program = programLabel(g.program);
      const domain = domainLabel(g.domain);
      const mastery = g.masteryCriteria || '—';
      const notes = g.notes || '—';

      return `<tr>
        <td>${domain}</td>
        <td>${program}</td>
        <td>${g.goalCode || '—'}</td>
        <td>${g.text}</td>
        <td>${mastery}</td>
        <td>${notes}</td>
      </tr>`;
    }).join('');

    printItem({
      html: `<div style="font-family:Arial; padding:20px; direction:rtl; color:#172033;">
        <table style="width:100%; margin-bottom:18px; border-collapse:collapse;">
          <tr>
            <td style="width:25%; vertical-align:top;">
              <div style="font-size:16px; font-weight:900; color:#1e40af;">${center?.name || 'المركز'}</div>
              <div style="font-size:11px; color:#64748b;">${center?.address || 'خطة تربوية فردية'}</div>
            </td>
            <td style="text-align:center; vertical-align:top;">
              <div style="font-size:26px; font-weight:900; color:#7c3aed;">خطة تربوية فردية</div>
              <div style="font-size:12px; color:#64748b;">Long Term Program / Individual Education Plan</div>
            </td>
            <td style="width:25%; text-align:left; vertical-align:top;">
              <img src="${center?.logo || ''}" alt="logo" style="max-width:80px; max-height:70px; display:${center?.logo ? 'block' : 'none'}" />
            </td>
          </tr>
        </table>

        <h2 style="margin:0 0 10px; color:#7c3aed;">${title}</h2>

        <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
          <tr>
            <td style="border:1px solid #ccd6e2; padding:8px; background:#eef2ff;"><b>اسم الطالب:</b></td>
            <td style="border:1px solid #ccd6e2; padding:8px;">${studentBlock}</td>
            <td style="border:1px solid #ccd6e2; padding:8px; background:#eef2ff;"><b>رقم الملف:</b></td>
            <td style="border:1px solid #ccd6e2; padding:8px;">${p.fileNo || '—'}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccd6e2; padding:8px; background:#eef2ff;"><b>العمر الزمني:</b></td>
            <td style="border:1px solid #ccd6e2; padding:8px;">${studentAge}</td>
            <td style="border:1px solid #ccd6e2; padding:8px; background:#eef2ff;"><b>تاريخ التقييم:</b></td>
            <td style="border:1px solid #ccd6e2; padding:8px;">${p.assessmentDate || todayStr()}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccd6e2; padding:8px; background:#eef2ff;"><b>التشخيص/الحالة:</b></td>
            <td style="border:1px solid #ccd6e2; padding:8px;">${p.diagnosis || '—'}</td>
            <td style="border:1px solid #ccd6e2; padding:8px; background:#eef2ff;"><b>الأخصائي المسؤول:</b></td>
            <td style="border:1px solid #ccd6e2; padding:8px;">${p.specialistName || '—'}</td>
          </tr>
        </table>

        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
          <thead>
            <tr style="background:#e5e7eb;">
              <th style="border:1px solid #ccd6e2; padding:7px;">المجال</th>
              <th style="border:1px solid #ccd6e2; padding:7px;">البرنامج</th>
              <th style="border:1px solid #ccd6e2; padding:7px;">الرمز</th>
              <th style="border:1px solid #ccd6e2; padding:7px;">الهدف</th>
              <th style="border:1px solid #ccd6e2; padding:7px;">معايير الإتقان</th>
              <th style="border:1px solid #ccd6e2; padding:7px;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${goalsRows || `<tr><td colspan="6">لا توجد أهداف</td></tr>`}
          </tbody>
        </table>

        <div style="margin-top:18px;">
          <div style="font-weight:800; margin-bottom:6px;">الأنشطة والاستراتيجيات:</div>
          <div style="white-space:pre-wrap; border:1px solid #ccd6e2; padding:10px; min-height:100px;">${p.activities || '—'}</div>
        </div>

        <table style="width:100%; margin-top:24px;">
          <tr>
            <td style="width:50%; text-align:center;">
              <div style="height:70px; border-bottom:1px solid #64748b; margin:0 auto 8px; width:180px;"></div>
              <div>التوقيع: الأخصائي</div>
            </td>
            <td style="width:50%; text-align:center;">
              <div style="height:70px; border-bottom:1px solid #64748b; margin:0 auto 8px; width:180px;"></div>
              <div>التوقيع: مدير المركز</div>
            </td>
          </tr>
        </table>
      </div>`
    }, 'generic', center?.logo, center?.name);
  }

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>📘 نظام البرامج طويلة المدى</h2><p>خطط تدخل مبنية على أهداف من بنوك متعددة (Portage · Lovaas · ABLLS-R · PEP-3 · HELP · Custom)</p></div>
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
                <StudentPicker form={progForm} setForm={setProgForm} students={students} emps={emps} showExtra={true} />

                {progForm.mode === 'registered' && (progForm.studentName || progForm.stuId) && (
                  <div className="fl full">
                    <label>ملخص بيانات الطالب</label>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: 12, background: 'var(--g0)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                      <div><small style={{ color: 'var(--g5)' }}>الاسم</small><div><b>{progForm.studentName || '—'}</b></div></div>
                      <div><small style={{ color: 'var(--g5)' }}>رقم الملف</small><div><b>{progForm.fileNo || '—'}</b></div></div>
                      <div><small style={{ color: 'var(--g5)' }}>تاريخ الميلاد</small><div><b>{progForm.dob || '—'}</b></div></div>
                      <div><small style={{ color: 'var(--g5)' }}>العمر الزمني</small><div><b>{progForm.age || '—'}</b></div></div>
                      <div><small style={{ color: 'var(--g5)' }}>التشخيص/الحالة</small><div><b>{progForm.diagnosis || '—'}</b></div></div>
                      <div><small style={{ color: 'var(--g5)' }}>الأخصائي المسؤول</small><div><b>{progForm.specialistName || '—'}</b></div></div>
                    </div>
                  </div>
                )}

                <div className="fl full"><label>عنوان البرنامج <span className="req">*</span></label><input value={progForm.title} onChange={e => setProgForm(f => ({ ...f, title: e.target.value }))}/></div>

                <div className="fl"><label>المجال</label>
                  <select value={progForm.domain} onChange={e => setProgForm(f => ({ ...f, domain: e.target.value }))}>
                    {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                  </select>
                </div>

                <div className="fl"><label>المدة</label><input value={progForm.duration} onChange={e => setProgForm(f => ({ ...f, duration: e.target.value }))} placeholder="8 أسابيع"/></div>

                <div className="fl"><label>التاريخ</label><input type="date" value={progForm.assessmentDate || todayStr()} onChange={e => setProgForm(f => ({ ...f, assessmentDate: e.target.value }))}/></div>

                <div className="fl full">
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>🎯 الأهداف المختارة ({progForm.goals.length})</span>
                    <button type="button" className="btn btn-s btn-sm" onClick={() => setShowGoalPicker(true)}>➕ اختيار من البنك</button>
                  </label>
                  {progForm.goals.length === 0 ? (
                    <div style={{ padding: 14, textAlign: 'center', color: 'var(--g4)', border: '1.5px dashed var(--border-color)', borderRadius: 10, fontSize: '.84rem' }}>
                      لم تُختَر أهداف بعد — اضغط "اختيار من البنك" لتصفح Portage / Lovaas / ABLLS-R / PEP-3 / HELP/Custom حسب المجال المحدَد أعلاه
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {progForm.goals.map((g, index) => (
                        <div key={`${g.text}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '.84rem' }}>
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
