import { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd } from '../hooks/useStorage';
import { uid, todayStr, calcAge } from '../utils/dateHelpers';
import { printItem } from '../utils/printUtils';
import { handleFileInputChange, FILE_ACCEPT_IMAGE } from '../utils/fileUpload';

const PROGRAM_DOMAINS = [
  'التربية الخاصة', 'التدخل المبكر', 'مرحلة الروضة', 'صعوبات التعلم',
  'فرط الحركة ونقص الانتباه', 'تعديل السلوك', 'التكامل الحسي',
  'التفاعل الاجتماعي', 'الرعاية الذاتية', 'التخاطب والنطق',
];

const EMPTY_STU_PICK = { mode: 'registered', stuId: '', studentName: '' };

const EMPTY_EVAL = {
  ...EMPTY_STU_PICK,
  dob: '', age: '', diagnosis: '', specialistName: '', photo: '',
  history: '', parentsInterview: '', appliedTools: '', observationSessions: '',
  recommendations: '', summary: '', domain: 'التربية الخاصة', date: '',
};

const EMPTY_PROG = {
  ...EMPTY_STU_PICK, title: '', domain: 'التربية الخاصة', duration: '',
  objectives: '', activities: '',
};

const EMPTY_REP = {
  ...EMPTY_STU_PICK, title: '', domain: 'التربية الخاصة', period: '', content: '',
};

function StudentPicker({ form, setForm, students, emps, showExtra = false }) {
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
          للتقارير الخاصة بطلاب غير مسجلين (مثل طلبات الالتحاق بمدرسة أو روضة).
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

export default function ProgramsReports() {
  const { t } = useLang();
  const { toast, center } = useApp();
  const [modal, setModal] = useState(null);
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [evalForm, setEvalForm] = useState({ ...EMPTY_EVAL, date: todayStr() });
  const [progForm, setProgForm] = useState(EMPTY_PROG);
  const [repForm, setRepForm] = useState(EMPTY_REP);
  const [helperNote, setHelperNote] = useState('');

  useEffect(() => {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
  }, []);

  const evaluations = lsGet('progEvaluations');
  const programs = lsGet('progPrograms');
  const reports = lsGet('progReports');

  function openModal(type) {
    setHelperNote('');
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    if (type === 'eval') setEvalForm({ ...EMPTY_EVAL, date: todayStr() });
    if (type === 'prog') setProgForm(EMPTY_PROG);
    if (type === 'rep') setRepForm(EMPTY_REP);
    setModal(type);
  }

  function validateStudent(form) {
    if (form.mode === 'other') return form.studentName?.trim();
    return form.stuId || form.studentName?.trim();
  }

  function fillSuggestedDraft(type, form, setForm) {
    const domain = form.domain || 'التربية الخاصة';
    const name = form.studentName || 'المستفيد';
    if (type === 'eval') {
      setForm(f => ({
        ...f,
        history: f.history || 'يُذكر أن الطفل/ة...',
        parentsInterview: f.parentsInterview || 'أفاد ولي الأمر بأن...',
        appliedTools: f.appliedTools || '• مقابلة أولية\n• ملاحظة مباشرة\n• استبانة أولياء الأمور',
        observationSessions: f.observationSessions || 'لوحظ خلال الجلسة/الملاحظة...',
        recommendations: f.recommendations || `• برنامج تدخل في مجال ${domain}\n• متابعة دورية\n• تواصل مع الأسرة`,
      }));
    } else if (type === 'prog') {
      setForm(f => ({
        ...f,
        objectives: `برنامج تدخل — ${domain}\nالطالب/ة: ${name}\n\nالأهداف:\n1. \n2. `,
        activities: '• جلسات فردية 2× أسبوعياً\n• أنشطة منزلية موجهة\n• قياس تقدم كل 4 أسابيع',
      }));
    } else {
      setForm(f => ({
        ...f,
        content: `تقرير تقدم — ${domain}\nالطالب/ة: ${name}\nالفترة: ${f.period || 'شهري'}\n\nملخص الأداء:\n• \n\nتوصيات الفريق:\n• `,
      }));
    }
    setHelperNote('تم تجهيز مسودة مقترحة — راجعها وعدّلها قبل الحفظ.');
  }

  async function onEvalPhoto(e) {
    try {
      const res = await handleFileInputChange(e, { imagesOnly: true });
      if (res) setEvalForm(f => ({ ...f, photo: res.data }));
    } catch (ex) {
      toast('⚠️ ' + (ex.i18nKey === 'file.tooLarge' ? 'حجم الصورة يتجاوز 2 ميجا' : 'نوع الملف غير مدعوم'), 'er');
    }
  }

  function saveEval() {
    if (!validateStudent(evalForm)) { toast('⚠️ اختر الطالب أو أدخل اسمه', 'er'); return; }
    const payload = {
      ...evalForm,
      age: evalForm.age || (evalForm.dob ? calcAge(evalForm.dob) : ''),
      isUnregistered: evalForm.mode === 'other',
    };
    lsAdd('progEvaluations', { ...payload, id: uid(), createdAt: todayStr() });
    toast('✅ تم حفظ التقييم', 'ok');
    setModal(null);
  }

  function saveProg() {
    if (!validateStudent(progForm)) { toast('⚠️ اختر الطالب أو أدخل اسمه', 'er'); return; }
    if (!progForm.title.trim()) { toast('⚠️ أدخل عنوان البرنامج', 'er'); return; }
    lsAdd('progPrograms', { ...progForm, isUnregistered: progForm.mode === 'other', id: uid(), createdAt: todayStr() });
    toast('✅ تم حفظ البرنامج', 'ok');
    setModal(null);
  }

  function saveRep() {
    if (!validateStudent(repForm)) { toast('⚠️ اختر الطالب أو أدخل اسمه', 'er'); return; }
    if (!repForm.title.trim()) { toast('⚠️ أدخل عنوان التقرير', 'er'); return; }
    lsAdd('progReports', { ...repForm, isUnregistered: repForm.mode === 'other', id: uid(), createdAt: todayStr() });
    toast('✅ تم حفظ التقرير', 'ok');
    setModal(null);
  }

  function printEval() {
    if (!validateStudent(evalForm)) { toast('⚠️ اختر الطالب أولاً', 'er'); return; }
    printItem(
      { ...evalForm, age: evalForm.age || (evalForm.dob ? calcAge(evalForm.dob) : '') },
      'initial_eval',
      center?.logo,
      center?.name,
    );
  }

  const fldP = k => e => setProgForm(f => ({ ...f, [k]: e.target.value }));
  const fldR = k => e => setRepForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>📚 {t('progReports.title')}</h2>
          <p>{t('progReports.sub')}</p>
        </div>
        <div className="ph-a" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-p" onClick={() => openModal('eval')}>➕ تقييم جديد</button>
          <button type="button" className="btn btn-s" onClick={() => openModal('prog')}>➕ إضافة برنامج</button>
          <button type="button" className="btn btn-g" onClick={() => openModal('rep')}>➕ إضافة تقرير</button>
        </div>
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="sc g"><div className="lb">التقييمات</div><div className="vl">{evaluations.length}</div></div>
        <div className="sc"><div className="lb">البرامج</div><div className="vl">{programs.length}</div></div>
        <div className="sc v"><div className="lb">التقارير</div><div className="vl">{reports.length}</div></div>
      </div>

      {(evaluations.length > 0 || programs.length > 0 || reports.length > 0) && (
        <div className="g2" style={{ marginTop: 16 }}>
          {evaluations.slice(0, 8).map(e => (
            <div key={e.id} className="card">
              <div className="ci">
                <div className="cn">📋 {e.studentName}{e.isUnregistered ? ' (غير مسجل)' : ''}</div>
                <div className="cm">{e.domain} · {e.date}</div>
              </div>
              <div className="c-acts">
                <button type="button" className="btn btn-xs btn-bl" onClick={() => printItem(e, 'initial_eval', center?.logo, center?.name)}>🖨️</button>
              </div>
            </div>
          ))}
          {programs.slice(0, 5).map(p => (
            <div key={p.id} className="card">
              <div className="ci">
                <div className="cn">📘 {p.title}</div>
                <div className="cm">{p.studentName} · {p.domain}</div>
              </div>
            </div>
          ))}
          {reports.slice(0, 5).map(r => (
            <div key={r.id} className="card">
              <div className="ci">
                <div className="cn">📑 {r.title}</div>
                <div className="cm">{r.studentName} · {r.domain} · {r.period}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>{modal === 'eval' ? '📋 تقييم مبدئي جديد' : modal === 'prog' ? '📘 برنامج جديد' : '📑 تقرير جديد'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              {helperNote && <div style={{ marginBottom: 12, padding: 10, background: 'var(--ok-l)', borderRadius: 8, fontSize: '.82rem' }}>{helperNote}</div>}

              {modal === 'eval' && (
                <div className="fg c2">
                  <StudentPicker form={evalForm} setForm={setEvalForm} students={students} emps={emps} showExtra />

                  <div className="fl full" style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                    <div
                      onClick={() => document.getElementById('eval-photo-inp')?.click()}
                      style={{
                        width: 100, height: 100, border: '2px dashed var(--border-color)', borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        background: evalForm.photo ? `url(${evalForm.photo}) center/cover` : 'var(--g0)',
                      }}
                    >
                      {!evalForm.photo && <span style={{ fontSize: '.72rem', color: 'var(--g5)' }}>📷 صورة</span>}
                    </div>
                    <input id="eval-photo-inp" type="file" accept={FILE_ACCEPT_IMAGE} style={{ display: 'none' }} onChange={onEvalPhoto}/>
                  </div>

                  <div className="fl"><label>التاريخ</label><input type="date" value={evalForm.date} onChange={e => setEvalForm(f => ({ ...f, date: e.target.value }))}/></div>
                  <div className="fl full"><label>المجال</label>
                    <select value={evalForm.domain} onChange={e => setEvalForm(f => ({ ...f, domain: e.target.value }))}>{PROGRAM_DOMAINS.map(d => <option key={d}>{d}</option>)}</select>
                  </div>

                  <div className="fl full"><label>التاريخ التطوري</label><textarea value={evalForm.history} onChange={e => setEvalForm(f => ({ ...f, history: e.target.value }))} rows={3}/></div>
                  <div className="fl full"><label>مقابلة الأهل</label><textarea value={evalForm.parentsInterview} onChange={e => setEvalForm(f => ({ ...f, parentsInterview: e.target.value }))} rows={3}/></div>
                  <div className="fl full"><label>أدوات التقييم</label><textarea value={evalForm.appliedTools} onChange={e => setEvalForm(f => ({ ...f, appliedTools: e.target.value }))} rows={3}/></div>
                  <div className="fl full"><label>الملاحظة</label><textarea value={evalForm.observationSessions} onChange={e => setEvalForm(f => ({ ...f, observationSessions: e.target.value }))} rows={4}/></div>
                  <div className="fl full"><label>التوصيات</label><textarea value={evalForm.recommendations} onChange={e => setEvalForm(f => ({ ...f, recommendations: e.target.value }))} rows={4}/></div>

                  <div className="fl full" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-s btn-sm" onClick={() => fillSuggestedDraft('eval', evalForm, setEvalForm)}>📝 تعبئة مقترحة</button>
                    <button type="button" className="btn btn-bl btn-sm" onClick={printEval}>🖨️ طباعة التقرير</button>
                  </div>
                </div>
              )}

              {modal === 'prog' && (
                <div className="fg c2">
                  <StudentPicker form={progForm} setForm={setProgForm} students={students} emps={emps}/>
                  <div className="fl full"><label>عنوان البرنامج</label><input value={progForm.title} onChange={fldP('title')}/></div>
                  <div className="fl"><label>المجال</label><select value={progForm.domain} onChange={fldP('domain')}>{PROGRAM_DOMAINS.map(d => <option key={d}>{d}</option>)}</select></div>
                  <div className="fl"><label>المدة</label><input value={progForm.duration} onChange={fldP('duration')} placeholder="8 أسابيع"/></div>
                  <div className="fl full"><label>الأهداف</label><textarea value={progForm.objectives} onChange={fldP('objectives')} rows={5}/></div>
                  <div className="fl full"><label>الأنشطة</label><textarea value={progForm.activities} onChange={fldP('activities')} rows={4}/></div>
                  <div className="fl full">
                    <button type="button" className="btn btn-s btn-sm" onClick={() => fillSuggestedDraft('prog', progForm, setProgForm)}>📝 تعبئة مقترحة</button>
                  </div>
                </div>
              )}

              {modal === 'rep' && (
                <div className="fg c2">
                  <StudentPicker form={repForm} setForm={setRepForm} students={students} emps={emps}/>
                  <div className="fl full"><label>عنوان التقرير</label><input value={repForm.title} onChange={fldR('title')}/></div>
                  <div className="fl"><label>المجال</label><select value={repForm.domain} onChange={fldR('domain')}>{PROGRAM_DOMAINS.map(d => <option key={d}>{d}</option>)}</select></div>
                  <div className="fl"><label>الفترة</label><input value={repForm.period} onChange={fldR('period')} placeholder="شهري / فصلي"/></div>
                  <div className="fl full"><label>محتوى التقرير</label><textarea value={repForm.content} onChange={fldR('content')} rows={10}/></div>
                  <div className="fl full">
                    <button type="button" className="btn btn-s btn-sm" onClick={() => fillSuggestedDraft('rep', repForm, setRepForm)}>📝 تعبئة مقترحة</button>
                  </div>
                </div>
              )}
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={modal === 'eval' ? saveEval : modal === 'prog' ? saveProg : saveRep}>💾 حفظ</button>
              {modal === 'eval' && <button type="button" className="btn btn-bl" onClick={printEval}>🖨️ طباعة</button>}
              <button type="button" className="btn btn-g" onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
