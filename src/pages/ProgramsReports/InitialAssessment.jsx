import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import { handleFileInputChange, FILE_ACCEPT_IMAGE } from '../../utils/fileUpload';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';

const PROGRAM_DOMAINS = [
  'التربية الخاصة', 'التدخل المبكر', 'مرحلة الروضة', 'صعوبات التعلم',
  'فرط الحركة ونقص الانتباه', 'تعديل السلوك', 'التكامل الحسي',
  'التفاعل الاجتماعي', 'الرعاية الذاتية', 'التخاطب والنطق',
];

const EMPTY_EVAL = {
  ...EMPTY_STU_PICK,
  dob: '', age: '', diagnosis: '', specialistName: '', photo: '',
  history: '', parentsInterview: '', appliedTools: '', observationSessions: '',
  recommendations: '', summary: '', domain: 'التربية الخاصة', date: '',
};

// دالة التحقق من صحة البيانات
function validateEvaluationForm(form) {
  const errors = [];
  
  // 1. التحقق من اختيار الطالب
  if (!validateStudentPick(form)) {
    errors.push('اختر الطالب من القائمة أو أدخل اسمه');
  }
  
  // 2. التحقق من التاريخ
  if (!form.date || form.date.trim() === '') {
    errors.push('أدخل تاريخ التقييم');
  }
  
  // 3. التحقق من المجال
  if (!form.domain || form.domain.trim() === '') {
    errors.push('اختر المجال التعليمي/العلاجي');
  }
  
  // 4. التحقق من وجود محتوى واحد على الأقل
  const hasContent = 
    (form.history?.trim() || '') !== '' ||
    (form.parentsInterview?.trim() || '') !== '' ||
    (form.appliedTools?.trim() || '') !== '' ||
    (form.observationSessions?.trim() || '') !== '';
  
  if (!hasContent) {
    errors.push('أدخل محتوى التقرير (التاريخ التطوري أو مقابلة الأهل أو أدوات أو الملاحظات)');
  }
  
  return errors;
}

export default function InitialAssessment({ onBack }) {
  const { toast, center } = useApp();
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [evalForm, setEvalForm] = useState({ ...EMPTY_EVAL, date: todayStr() });
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [helperNote, setHelperNote] = useState('');
  const [formErrors, setFormErrors] = useState([]);

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
  }
  useEffect(() => { reload(); }, []);

  const evaluations = lsGet('progEvaluations').sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  function openNew() {
    setFormErrors([]);
    setHelperNote('');
    setEvalForm({ ...EMPTY_EVAL, date: todayStr() });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(item) {
    setFormErrors([]);
    setHelperNote('');
    setEvalForm({ ...EMPTY_EVAL, ...item });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function onEvalPhoto(e) {
    try {
      const res = await handleFileInputChange(e, { imagesOnly: true });
      if (res) setEvalForm(f => ({ ...f, photo: res.data }));
    } catch (ex) {
      toast('⚠️ ' + (ex.i18nKey === 'file.tooLarge' ? 'حجم الصورة يتجاوز 2 ميجا' : 'نوع الملف غير مدعوم'), 'er');
    }
  }

  function fillSuggestedDraft() {
    const domain = evalForm.domain || 'التربية الخاصة';
    setEvalForm(f => ({
      ...f,
      history: f.history || 'يُذكر أن الطفل/ة...',
      parentsInterview: f.parentsInterview || 'أفاد ولي الأمر بأن...',
      appliedTools: f.appliedTools || '• مقابلة أولية\n• ملاحظة مباشرة\n• استبانة أولياء الأمور',
      observationSessions: f.observationSessions || 'لوحظ خلال الجلسة/الملاحظة...',
      recommendations: f.recommendations || `• برنامج تدخل في مجال ${domain}\n• متابعة دورية\n• تواصل مع الأسرة`,
    }));
    setHelperNote('تم تجهيز مسودة مقترحة — راجعها وعدّلها قبل الحفظ.');
  }

  function save() {
    // التحقق من صحة البيانات
    const validationErrors = validateEvaluationForm(evalForm);
    
    // إذا كانت هناك أخطاء - عرضها وإيقاف العملية
    if (validationErrors.length > 0) {
      setFormErrors(validationErrors);
      toast('⚠️ تحقق من الأخطاء أعلاه', 'er');
      return;
    }
    
    // مسح الأخطاء السابقة
    setFormErrors([]);
    
    // البيانات صحيحة - حفظ
    const payload = {
      ...evalForm,
      age: evalForm.age || (evalForm.dob ? calcAge(evalForm.dob) : ''),
      isUnregistered: evalForm.mode === 'other',
    };
    
    if (editId) { 
      lsUpd('progEvaluations', editId, payload); 
      toast('✅ تم تحديث التقييم بنجاح', 'ok'); 
    } else { 
      lsAdd('progEvaluations', { ...payload, id: uid(), createdAt: todayStr() }); 
      toast('✅ تم حفظ التقييم بنجاح', 'ok'); 
    }
    
    setModalOpen(false);
  }

  function del(id) {
    if (!window.confirm('حذف هذا التقييم نهائياً؟')) return;
    lsDel('progEvaluations', id);
    toast('🗑️ تم الحذف', 'ok');
  }

  function printEval(item) {
    const data = item || evalForm;
    if (!validateStudentPick(data)) { toast('⚠️ اختر الطالب أولاً', 'er'); return; }
    printItem({ ...data, age: data.age || (data.dob ? calcAge(data.dob) : '') }, 'initial_eval', center?.logo, center?.name);
  }

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>📋 نظام التقرير المبدئي</h2><p>تقييم أولي شامل عند التحاق الطالب أو أثناء الاستشارة</p></div>
        <div className="ph-a" style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-p" onClick={openNew}>➕ تقييم جديد</button>
          <button type="button" className="btn btn-g" onClick={onBack}>← رجوع للوحة الأنظمة</button>
        </div>
      </div>

      {evaluations.length === 0 ? (
        <EmptyState icon="📋" title="لا توجد تقييمات مبدئية بعد" sub="اضغط ➕ تقييم جديد للبدء" />
      ) : (
        evaluations.map(e => (
          <div key={e.id} className="card">
            <div className="av cyan">📋</div>
            <div className="ci">
              <div className="cn">{e.studentName}{e.isUnregistered ? ' (غير مسجل)' : ''}</div>
              <div className="cm">{e.domain} · {e.date}</div>
            </div>
            <div className="c-acts">
              <button type="button" className="btn btn-xs btn-bl" onClick={() => printEval(e)}>🖨️</button>
              <button type="button" className="btn btn-xs btn-g" onClick={() => openEdit(e)}>✏️</button>
              <button type="button" className="btn btn-xs btn-d" onClick={() => del(e.id)}>🗑️</button>
            </div>
          </div>
        ))
      )}

      {modalOpen && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>📋 {editId ? 'تعديل تقييم مبدئي' : 'تقييم مبدئي جديد'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              {helperNote && <div style={{ marginBottom: 12, padding: 10, background: 'var(--ok-l)', borderRadius: 8, fontSize: '.82rem' }}>{helperNote}</div>}
              
              {formErrors.length > 0 && (
                <div style={{ 
                  marginBottom: 12, 
                  padding: 10, 
                  background: 'var(--err-l)', 
                  borderRadius: 8, 
                  fontSize: '.82rem',
                  border: '1px solid var(--err)',
                  color: 'var(--err)'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>❌ أخطاء في البيانات:</div>
                  {formErrors.map((err, i) => (
                    <div key={i} style={{ marginBottom: 4, paddingLeft: 16 }}>
                      • {err}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="fg c2">
                <StudentPicker form={evalForm} setForm={setEvalForm} students={students} emps={emps} showExtra />

                <div className="fl full" style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                  <div
                    onClick={() => document.getElementById('ia-photo-inp')?.click()}
                    style={{
                      width: 100, height: 100, border: '2px dashed var(--border-color)', borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      background: evalForm.photo ? `url(${evalForm.photo}) center/cover` : 'var(--g0)',
                    }}
                  >
                    {!evalForm.photo && <span style={{ fontSize: '.72rem', color: 'var(--g5)' }}>📷 صورة</span>}
                  </div>
                  <input id="ia-photo-inp" type="file" accept={FILE_ACCEPT_IMAGE} style={{ display: 'none' }} onChange={onEvalPhoto}/>
                </div>

                <div className="fl"><label>التاريخ</label><input type="date" value={evalForm.date} onChange={e => setEvalForm(f => ({ ...f, date: e.target.value }))}/></div>
                <div className="fl full"><label>المجال</label>
                  <select value={evalForm.domain} onChange={e => setEvalForm(f => ({ ...f, domain: e.target.value }))}>{PROGRAM_DOMAINS.map(d => <option key={d}>{d}</option>)}</select>
                </div>

                <div className="fl full"><label>التاريخ التطوري</label><textarea value={evalForm.history} onChange={e => setEvalForm(f => ({ ...f, history: e.target.value }))} rows={4}/></div>
                <div className="fl full"><label>مقابلة الأهل</label><textarea value={evalForm.parentsInterview} onChange={e => setEvalForm(f => ({ ...f, parentsInterview: e.target.value }))} rows={4}/></div>
                <div className="fl full"><label>أدوات التقييم</label><textarea value={evalForm.appliedTools} onChange={e => setEvalForm(f => ({ ...f, appliedTools: e.target.value }))} rows={3}/></div>
                <div className="fl full"><label>الملاحظة</label><textarea value={evalForm.observationSessions} onChange={e => setEvalForm(f => ({ ...f, observationSessions: e.target.value }))} rows={4}/></div>
                <div className="fl full"><label>التوصيات</label><textarea value={evalForm.recommendations} onChange={e => setEvalForm(f => ({ ...f, recommendations: e.target.value }))} rows={4}/></div>

                <div className="fl full" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-s btn-sm" onClick={fillSuggestedDraft}>📝 تعبئة مقترحة</button>
                  <button type="button" className="btn btn-bl btn-sm" onClick={() => printEval()}>🖨️ طباعة التقرير</button>
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
