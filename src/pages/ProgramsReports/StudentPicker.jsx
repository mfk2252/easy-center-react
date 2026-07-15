import { calcAge } from '../../utils/dateHelpers';

const EMPTY_STU_PICK = { mode: 'registered', stuId: '', studentName: '' };

/**
 * مكوّن مشترك لاختيار الطالب — يُستخدم في كل الأنظمة العشرة.
 * يربط الاختيار مباشرة بقاعدة بيانات المركز الحالي (طلاب وموظفون مُمرَّرون
 * من الأعلى، وهم أصلاً معزولون تلقائياً حسب centerId عبر lsGet).
 * يوفّر أيضاً خيار "طالب غير مسجل" لتقارير/استشارات لمرة واحدة.
 */
export function StudentPicker({ form, setForm, students, emps, showExtra = false }) {
  const isOther = form.mode === 'other';

  function onSelectStu(e) {
    const val = e.target.value;
    if (val === '__other__') {
      setForm(f => ({
        ...f, mode: 'other', stuId: '', studentName: '',
        dob: '', diagnosis: '', age: '',
      }));
      return;
    }
    const stu = students.find(s => s.id === val);
    if (!stu) {
      setForm(f => ({ ...f, mode: 'registered', stuId: '', studentName: '' }));
      return;
    }
    const spec = emps.find(e => e.id === stu.specialistId);
    setForm(f => ({
      ...f,
      mode: 'registered',
      stuId: stu.id,
      studentName: stu.name || '',
      dob: stu.dob || f.dob,
      diagnosis: stu.diagnosis || f.diagnosis,
      age: stu.dob ? calcAge(stu.dob) : f.age,
      photo: stu.photo || f.photo,
      specialistName: spec?.name || f.specialistName,
    }));
  }

  return (
    <>
      <div className="fl full">
        <label>الطالب <span className="req">*</span></label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            style={{ flex: 1, minWidth: 200 }}
            value={isOther ? '__other__' : (form.stuId || '')}
            onChange={onSelectStu}
          >
            <option value="">— اختر من الطلاب المسجلين —</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}{s.className ? ` · ${s.className}` : ''}{s.diagnosis ? ` · ${s.diagnosis}` : ''}
              </option>
            ))}
            <option value="__other__">➕ طالب آخر (غير مسجل)</option>
          </select>
        </div>
        <p style={{ fontSize: '.75rem', color: 'var(--g5)', marginTop: 6 }}>
          للتقارير/الاستشارات الخاصة بمستفيدين غير مسجلين في قاعدة بيانات المركز.
        </p>
      </div>
      {isOther && (
        <div className="fl full">
          <label>اسم الطالب (غير مسجل) <span className="req">*</span></label>
          <input
            value={form.studentName}
            onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
            placeholder="اكتب اسم الطفل..."
          />
        </div>
      )}
      {showExtra && (
        <>
          <div className="fl"><label>تاريخ الميلاد</label>
            <input type="date" value={form.dob || ''} onChange={e => setForm(f => ({ ...f, dob: e.target.value, age: e.target.value ? calcAge(e.target.value) : '' }))}/>
          </div>
          <div className="fl"><label>العمر</label><input value={form.age || (form.dob ? calcAge(form.dob) : '')} readOnly style={{ background: 'var(--g0)' }}/></div>
          <div className="fl"><label>التشخيص</label><input value={form.diagnosis || ''} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}/></div>
          <div className="fl"><label>الأخصائي</label><input value={form.specialistName || ''} onChange={e => setForm(f => ({ ...f, specialistName: e.target.value }))}/></div>
        </>
      )}
    </>
  );
}

export function validateStudentPick(form) {
  if (form.mode === 'other') return !!form.studentName?.trim();
  return !!(form.stuId || form.studentName?.trim());
}

export { EMPTY_STU_PICK };
