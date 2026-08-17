import { calcAge } from '../../utils/dateHelpers';

const EMPTY_STU_PICK = {
  mode: 'registered',
  stuId: '',
  studentName: '',
  parentName: '',
  parentPhone: '',
  parentPhone2: '',
  diagnosis: '',
  dob: '',
  age: '',
  fileNo: '',
  photo: '',
  specialistName: '',
  className: '',
};

/**
 * مكوّن مشترك لاختيار الطالب — يربط الاختيار مباشرة بقاعدة بيانات المركز
 * ويسحب بيانات الطالب، التشخيص، الأخصائي، وولي الأمر لإرسال التقارير له بسهولة.
 */
export function StudentPicker({ form, setForm, students = [], emps = [], showExtra = false }) {
  const isOther = form.mode === 'other';

  function onSelectStu(e) {
    const val = e.target.value;
    if (val === '__other__') {
      setForm(f => ({
        ...f,
        mode: 'other',
        stuId: '',
        studentName: '',
        dob: '',
        diagnosis: '',
        age: '',
        fileNo: '',
        specialistName: '',
        parentName: '',
        parentPhone: '',
        parentPhone2: '',
      }));
      return;
    }
    const stu = students.find(s => s.id === val);
    if (!stu) {
      setForm(f => ({ ...f, mode: 'registered', stuId: '', studentName: '' }));
      return;
    }
    const spec = emps.find(e => e.id === stu.specialistId || e.name === stu.specialistName);
    const ageText = stu.dob ? calcAge(stu.dob) : '';
    setForm(f => ({
      ...f,
      mode: 'registered',
      stuId: stu.id,
      studentName: stu.name || '',
      dob: stu.dob || f.dob || '',
      diagnosis: stu.diagnosis || f.diagnosis || '',
      age: ageText || f.age || '',
      fileNo: stu.fileNo || stu.file || f.fileNo || '',
      photo: stu.photo || f.photo || '',
      specialistName: spec?.name || stu.specialistName || f.specialistName || '',
      className: stu.className || f.className || '',
      birthDate: stu.dob || f.birthDate || '',
      parentName: stu.parentName || stu.guardianName || f.parentName || '',
      parentPhone: stu.parentPhone || stu.phone || f.parentPhone || '',
      parentPhone2: stu.parentPhone2 || f.parentPhone2 || '',
    }));
  }

  return (
    <>
      <div className="fl full">
        <label>الطالب المسجل <span className="req">*</span></label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            style={{ flex: 1, minWidth: 220 }}
            value={isOther ? '__other__' : (form.stuId || '')}
            onChange={onSelectStu}
          >
            <option value="">— اختر من الطلاب المسجلين بالمركز —</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}{s.className ? ` · [${s.className}]` : ''}{s.diagnosis ? ` · ${s.diagnosis}` : ''}
              </option>
            ))}
            <option value="__other__">➕ مستفيد خارجي (غير مسجل)</option>
          </select>
        </div>
      </div>

      {isOther && (
        <div className="fl full">
          <label>اسم المستفيد الخارجي <span className="req">*</span></label>
          <input
            value={form.studentName || ''}
            onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
            placeholder="اكتب اسم الطفل أو المستفيد..."
          />
        </div>
      )}

      {showExtra && (
        <>
          <div className="fl"><label>تاريخ الميلاد</label>
            <input type="date" value={form.dob || ''} onChange={e => setForm(f => ({ ...f, dob: e.target.value, age: e.target.value ? calcAge(e.target.value) : '' }))}/>
          </div>
          <div className="fl"><label>العمر الزمني</label><input value={form.age || (form.dob ? calcAge(form.dob) : '')} readOnly style={{ background: 'var(--g0)' }}/></div>
          <div className="fl"><label>التشخيص الطبي / التربوي</label><input value={form.diagnosis || ''} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="مثال: طيف توحد، تأخر لغوي..."/></div>
          <div className="fl"><label>الأخصائي المسؤول</label><input value={form.specialistName || ''} onChange={e => setForm(f => ({ ...f, specialistName: e.target.value }))} placeholder="اسم الأخصائي المعالج"/></div>
          <div className="fl"><label>اسم ولي الأمر</label><input value={form.parentName || ''} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} placeholder="اسم الأب أو الأم"/></div>
          <div className="fl"><label>هاتف ولي الأمر (واتساب)</label><input type="tel" dir="ltr" value={form.parentPhone || ''} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} placeholder="05XXXXXXXX"/></div>
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