import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import { GoalPickerModal, GoalsBankManagerModal, getAllGoals } from './GoalsBank';
import { DOMAINS, PROGRAMS, domainLabel, programLabel, programColor } from '../../utils/goalsBank';
import BulkImporter from './BulkImporter';

const EMPTY_PROG = {
  ...EMPTY_STU_PICK,
  title: '', duration: '', startDate: todayStr(), reviewDate: '', specialistName: '',
  goals: [], activities: '', notes: '', status: 'active',
};

// حساب العمر الزمني بالسنوات والأشهر
function calcChronologicalAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years < 0) return '';
  return years > 0 ? `${years} سنة ${months > 0 ? `و ${months} شهراً` : ''}` : `${months} شهراً`;
}

// طباعة احترافية A4
function buildPrintHTML(p, centerName, centerLogo) {
  const domainGroups = {};
  (p.goals || []).forEach(g => {
    const dk = g.domain || 'cognitive';
    if (!domainGroups[dk]) domainGroups[dk] = [];
    domainGroups[dk].push(g);
  });

  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const goalsRows = Object.entries(domainGroups).map(([dk, goals]) => {
    const rows = goals.map((g, i) => `
      <tr>
        <td style="text-align:center;color:#64748b;font-size:.8rem;">${i + 1}</td>
        <td style="font-size:.75rem;color:#64748b;">${esc(g.code || '—')}</td>
        <td>${esc(g.text)}</td>
        <td style="text-align:center;font-size:.8rem;">${esc(programLabel(g.program))}</td>
        <td style="font-size:.75rem;">${esc(g.mastery || '—')}</td>
        <td style="text-align:center;"> </td>
        <td style="text-align:center;"> </td>
      </tr>`).join('');
    return `
      <tr style="background:#f1f5f9;">
        <td colspan="7" style="font-weight:900;font-size:.9rem;color:#1e40af;padding:8px 12px;">
          ${esc(domainLabel(dk))}
        </td>
      </tr>
      ${rows}`;
  }).join('');

  const logoHtml = centerLogo
    ? `<img src="${centerLogo}" style="height:70px;object-fit:contain;border-radius:8px;" />`
    : `<div style="width:70px;height:70px;background:#e2e8f0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🏥</div>`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0; padding: 20px; color: #1e293b; font-size: 13px; direction: rtl; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #1e40af; padding-bottom: 14px; margin-bottom: 18px; }
  .center-name { font-size: 1.3rem; font-weight: 900; color: #1e40af; }
  .doc-title { font-size: 1rem; font-weight: 700; color: #64748b; margin-top: 3px; }
  .student-card { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .sc-field { display: flex; flex-direction: column; }
  .sc-label { font-size: .72rem; color: #94a3b8; margin-bottom: 2px; }
  .sc-value { font-weight: 700; font-size: .9rem; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: .82rem; }
  th { background: #1e40af; color: white; padding: 8px 10px; text-align: right; }
  td { border: 1px solid #e2e8f0; padding: 7px 10px; vertical-align: top; }
  tr:nth-child(even) td { background: #f8fafc; }
  .sig { display: flex; justify-content: space-around; margin-top: 40px; }
  .sig-box { text-align: center; }
  .sig-line { border-top: 1.5px solid #334155; margin-top: 40px; padding-top: 6px; font-size: .78rem; color: #64748b; width: 180px; }
  @media print { body { padding: 10px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="center-name">${esc(centerName || 'المركز')}</div>
      <div class="doc-title">خطة برنامج طويل المدى / IEP</div>
    </div>
    ${logoHtml}
  </div>

  <div class="student-card">
    <div class="sc-field"><span class="sc-label">اسم المستفيد</span><span class="sc-value">${esc(p.studentName)}</span></div>
    <div class="sc-field"><span class="sc-label">العمر الزمني</span><span class="sc-value">${esc(calcChronologicalAge(p.dob))}</span></div>
    <div class="sc-field"><span class="sc-label">التشخيص</span><span class="sc-value">${esc(p.diagnosis || '—')}</span></div>
    <div class="sc-field"><span class="sc-label">اسم البرنامج</span><span class="sc-value">${esc(p.title)}</span></div>
    <div class="sc-field"><span class="sc-label">تاريخ البدء</span><span class="sc-value">${esc(p.startDate || '—')}</span></div>
    <div class="sc-field"><span class="sc-label">تاريخ المراجعة</span><span class="sc-value">${esc(p.reviewDate || '—')}</span></div>
    <div class="sc-field"><span class="sc-label">الأخصائي المسؤول</span><span class="sc-value">${esc(p.specialistName || '—')}</span></div>
    <div class="sc-field"><span class="sc-label">المدة</span><span class="sc-value">${esc(p.duration || '—')}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th style="width:70px;">الكود</th>
        <th>الهدف</th>
        <th style="width:80px;">البرنامج</th>
        <th style="width:100px;">معيار الإتقان</th>
        <th style="width:60px;">قبلي</th>
        <th style="width:60px;">بعدي</th>
      </tr>
    </thead>
    <tbody>${goalsRows}</tbody>
  </table>

  ${p.activities ? `<div style="margin-bottom:18px;"><strong>الأنشطة والاستراتيجيات:</strong><div style="margin-top:8px;white-space:pre-wrap;">${esc(p.activities)}</div></div>` : ''}
  ${p.notes ? `<div style="margin-bottom:18px;"><strong>ملاحظات:</strong> ${esc(p.notes)}</div>` : ''}

  <div class="sig">
    <div class="sig-box"><div class="sig-line">الأخصائي المسؤول: ${esc(p.specialistName || '____________')}</div></div>
    <div class="sig-box"><div class="sig-line">مدير المركز</div></div>
    <div class="sig-box"><div class="sig-line">ولي الأمر / الوصي</div></div>
  </div>
</body>
</html>`;
}

function printProgram(p, center) {
  const html = buildPrintHTML(p, center?.name, center?.logo);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

export default function LongTermPrograms({ onBack }) {
  const { toast, center } = useApp();
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_PROG);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [pickerDomain, setPickerDomain] = useState('cognitive');
  const [showBankManager, setShowBankManager] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    setPrograms(lsGet('progPrograms').sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
  }
  useEffect(() => { reload(); }, []);

  const filteredPrograms = useMemo(() => programs.filter(p => {
    if (filterStatus !== 'all' && (p.status || 'active') !== filterStatus) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      if (!(p.studentName || '').toLowerCase().includes(q) &&
          !(p.title || '').toLowerCase().includes(q)) return false;
    }
    return true;
  }), [programs, searchQ, filterStatus]);

  // جلب بيانات الطالب المختار تلقائياً
  useEffect(() => {
    if (!form.stuId) return;
    const stu = students.find(s => s.id === form.stuId);
    if (!stu) return;
    const spec = emps.find(e => e.id === stu.specialistId);
    setForm(f => ({
      ...f,
      dob: stu.dob || f.dob,
      diagnosis: stu.diagnosis || f.diagnosis,
      specialistName: spec?.name || f.specialistName,
    }));
  }, [form.stuId]);

  function openNew() {
    setForm({ ...EMPTY_PROG, startDate: todayStr() });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(item) {
    setForm({ ...EMPTY_PROG, ...item, goals: item.goals || [] });
    setEditId(item.id);
    setModalOpen(true);
  }

  function removeGoal(text) {
    setForm(f => ({ ...f, goals: f.goals.filter(g => g.text !== text) }));
  }

  function save() {
    if (!validateStudentPick(form)) { toast('⚠️ اختر الطالب أو أدخل اسمه', 'er'); return; }
    if (!form.title.trim()) { toast('⚠️ أدخل عنوان البرنامج', 'er'); return; }
    if (!form.goals.length) { toast('⚠️ اختر هدفاً واحداً على الأقل', 'er'); return; }
    const payload = { ...form, isUnregistered: form.mode === 'other' };
    if (editId) { lsUpd('progPrograms', editId, payload); toast('✅ تم التحديث', 'ok'); }
    else { lsAdd('progPrograms', { ...payload, id: uid(), createdAt: todayStr() }); toast('✅ تم حفظ البرنامج', 'ok'); }
    setModalOpen(false);
    reload();
  }

  function del(id) {
    if (!window.confirm('حذف هذا البرنامج نهائياً؟')) return;
    lsDel('progPrograms', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  // تجميع الأهداف حسب المجال للعرض
  const goalsByDomain = useMemo(() => {
    const map = {};
    (form.goals || []).forEach(g => {
      const k = g.domain || 'cognitive';
      if (!map[k]) map[k] = [];
      map[k].push(g);
    });
    return map;
  }, [form.goals]);

  const chronoAge = calcChronologicalAge(form.dob);

  return (
    <div>
      {/* رأس الصفحة */}
      <div className="ph">
        <div className="ph-t">
          <h2>📘 نظام البرامج طويلة المدى</h2>
          <p>خطط تربوية فردية (IEP) مبنية على بنوك أهداف قياسية: لوفاس، بورتاج، إيبلز، بيب-3، هيلب</p>
        </div>
        <div className="ph-a" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-p" onClick={openNew}>➕ برنامج جديد</button>
          <button type="button" className="btn btn-s btn-sm" onClick={() => setShowBankManager(true)}>🗂️ بنك الأهداف</button>
          <button type="button" className="btn btn-s btn-sm" onClick={() => setShowBulk(true)}>📥 استيراد ضخم</button>
          <button type="button" className="btn btn-g" onClick={onBack}>← رجوع</button>
        </div>
      </div>

      {/* فلاتر وبحث */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="srch" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍 ابحث باسم الطالب أو البرنامج..." style={{ flex: 1, minWidth: 200 }} />
        <div className="tabs" style={{ margin: 0 }}>
          {[['all', 'الكل'], ['active', 'نشط'], ['completed', 'مكتمل'], ['paused', 'موقوف']].map(([v, l]) => (
            <button key={v} type="button" className={`tab ${filterStatus === v ? 'on' : ''}`} onClick={() => setFilterStatus(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
        <div className="sc"><div className="lb">إجمالي البرامج</div><div className="vl">{programs.length}</div></div>
        <div className="sc g"><div className="lb">نشط</div><div className="vl">{programs.filter(p => (p.status || 'active') === 'active').length}</div></div>
        <div className="sc v"><div className="lb">أهداف في البنك</div><div className="vl">{getAllGoals().length}</div></div>
        <div className="sc o"><div className="lb">طلاب لديهم برامج</div><div className="vl">{new Set(programs.map(p => p.stuId)).size}</div></div>
      </div>

      {/* قائمة البرامج */}
      {filteredPrograms.length === 0 ? (
        <EmptyState icon="📘" title="لا توجد برامج بعد" sub="اضغط ➕ برنامج جديد للبدء" />
      ) : (
        filteredPrograms.map(p => (
          <div key={p.id} className="card">
            <div className="av" style={{ background: '#7c3aed18', color: '#7c3aed', fontSize: '1.2rem' }}>📘</div>
            <div className="ci" style={{ flex: 1 }}>
              <div className="cn">
                {p.title}
                {p.isUnregistered && <span className="bdg b-or" style={{ marginRight: 6 }}>غير مسجل</span>}
                <span className={`bdg ${p.status === 'completed' ? 'b-gr' : p.status === 'paused' ? 'b-gy' : 'b-bl'}`} style={{ marginRight: 6 }}>
                  {p.status === 'completed' ? 'مكتمل' : p.status === 'paused' ? 'موقوف' : 'نشط'}
                </span>
              </div>
              <div className="cm">{p.studentName} · {(p.goals || []).length} هدف · {p.startDate || '—'}{p.duration ? ' · ' + p.duration : ''}</div>
              {p.specialistName && <div className="cm">👤 {p.specialistName}</div>}
            </div>
            <div className="c-acts">
              <button type="button" className="btn btn-xs btn-bl" onClick={() => printProgram(p, center)}>🖨️</button>
              <button type="button" className="btn btn-xs btn-g" onClick={() => openEdit(p)}>✏️</button>
              <button type="button" className="btn btn-xs btn-d" onClick={() => del(p.id)}>🗑️</button>
            </div>
          </div>
        ))
      )}

      {/* Modal إضافة/تعديل برنامج */}
      {modalOpen && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>📘 {editId ? 'تعديل برنامج' : 'برنامج/خطة تربوية جديدة'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>

              {/* اختيار الطالب */}
              <div className="fs"><div className="fsh">👦 بيانات المستفيد</div><div className="fsb">
                <div className="fg c2">
                  <StudentPicker form={form} setForm={setForm} students={students} emps={emps} showExtra />

                  {/* بطاقة الطالب تظهر تلقائياً بعد الاختيار */}
                  {(form.stuId || form.studentName) && (
                    <div className="fl full">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, padding: 12, background: 'var(--pr-l)', borderRadius: 10, border: '1px solid var(--pr)', fontSize: '.82rem' }}>
                        {chronoAge && <div><div style={{ color: 'var(--g5)', fontSize: '.7rem' }}>العمر الزمني</div><div style={{ fontWeight: 800 }}>{chronoAge}</div></div>}
                        {form.diagnosis && <div><div style={{ color: 'var(--g5)', fontSize: '.7rem' }}>التشخيص</div><div style={{ fontWeight: 800 }}>{form.diagnosis}</div></div>}
                        {form.specialistName && <div><div style={{ color: 'var(--g5)', fontSize: '.7rem' }}>الأخصائي</div><div style={{ fontWeight: 800 }}>{form.specialistName}</div></div>}
                      </div>
                    </div>
                  )}
                </div>
              </div></div>

              {/* بيانات البرنامج */}
              <div className="fs"><div className="fsh">📋 بيانات البرنامج</div><div className="fsb">
                <div className="fg c2">
                  <div className="fl full"><label>عنوان البرنامج <span className="req">*</span></label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="مثال: برنامج اللغة التعبيرية — المرحلة الأولى" /></div>
                  <div className="fl"><label>تاريخ البدء</label><input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                  <div className="fl"><label>تاريخ المراجعة</label><input type="date" value={form.reviewDate} onChange={e => setForm(f => ({ ...f, reviewDate: e.target.value }))} /></div>
                  <div className="fl"><label>المدة المقدّرة</label><input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="8 أسابيع" /></div>
                  <div className="fl"><label>الأخصائي المسؤول</label><input value={form.specialistName} onChange={e => setForm(f => ({ ...f, specialistName: e.target.value }))} /></div>
                  <div className="fl"><label>الحالة</label>
                    <select value={form.status || 'active'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      <option value="active">نشط</option>
                      <option value="completed">مكتمل</option>
                      <option value="paused">موقوف مؤقتاً</option>
                    </select>
                  </div>
                </div>
              </div></div>

              {/* بنك الأهداف */}
              <div className="fs"><div className="fsh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>🎯 الأهداف ({form.goals.length})</span>
                <button type="button" className="btn btn-s btn-sm" onClick={() => { setPickerDomain('all'); setShowGoalPicker(true); }}>➕ اختيار من البنك (كل المجالات)</button>
              </div>
              <div className="fsb">
                {form.goals.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--g4)', border: '1.5px dashed var(--border-color)', borderRadius: 10, fontSize: '.84rem' }}>
                    اضغط "اختيار من البنك" لإضافة أهداف من لوفاس/بورتاج/إيبلز/بيب-3/هيلب
                  </div>
                ) : (
                  Object.entries(goalsByDomain).map(([dk, goals]) => (
                    <div key={dk} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '.78rem', fontWeight: 900, color: 'var(--pr)', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{domainLabel(dk)} ({goals.length})</span>
                        <button type="button" className="btn btn-xs btn-s" onClick={() => { setPickerDomain(dk); setShowGoalPicker(true); }}>➕</button>
                      </div>
                      {goals.map(g => (
                        <div key={g.text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '.84rem', marginBottom: 4 }}>
                          <span style={{ fontSize: '.68rem', fontWeight: 800, color: programColor(g.program), background: programColor(g.program) + '18', padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap' }}>{programLabel(g.program)}</span>
                          {g.code && <span style={{ fontSize: '.68rem', color: 'var(--g5)', background: 'var(--g0)', padding: '2px 6px', borderRadius: 6 }}>{g.code}</span>}
                          <span style={{ flex: 1 }}>{g.text}</span>
                          {g.mastery && <span style={{ fontSize: '.68rem', color: 'var(--g5)' }}>📊 {g.mastery}</span>}
                          <button type="button" className="btn btn-xs btn-d" onClick={() => removeGoal(g.text)}>✕</button>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div></div>

              {/* أنشطة وملاحظات */}
              <div className="fs"><div className="fsh">📝 الأنشطة والملاحظات</div><div className="fsb">
                <div className="fg c2">
                  <div className="fl full"><label>الأنشطة والاستراتيجيات</label><textarea value={form.activities} onChange={e => setForm(f => ({ ...f, activities: e.target.value }))} rows={4} placeholder="جلسات فردية 2× أسبوعياً، أنشطة منزلية موجَّهة..." /></div>
                  <div className="fl full"><label>ملاحظات إضافية</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
                </div>
              </div></div>

            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={save}>💾 حفظ البرنامج</button>
              <button type="button" className="btn btn-bl btn-sm" onClick={() => form.goals.length && printProgram({ ...form }, center)}>🖨️ طباعة</button>
              <button type="button" className="btn btn-g" onClick={() => setModalOpen(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showGoalPicker && (
        <GoalPickerModal
          domain={pickerDomain}
          alreadySelected={form.goals}
          onClose={() => setShowGoalPicker(false)}
          onConfirm={goals => { setForm(f => ({ ...f, goals })); setShowGoalPicker(false); }}
        />
      )}

      {showBankManager && <GoalsBankManagerModal onClose={() => setShowBankManager(false)} />}
      {showBulk && <BulkImporter onClose={() => setShowBulk(false)} onDone={() => { setShowBulk(false); toast('✅ تم الاستيراد — يمكنك الآن اختيار الأهداف الجديدة', 'ok'); }} />}
    </div>
  );
}
