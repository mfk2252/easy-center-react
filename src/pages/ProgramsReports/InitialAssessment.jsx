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
  history: '', caseHistory: '', medicalHistory: '', familyHistory: '',
  appliedTools: '', toolsNotes: '',
  parentsInterview: '', parentsNeeds: '',
  observationSessions: '',
  strengths: '', weaknesses: '',
  recommendations: '', summary: '',
  domain: 'التربية الخاصة', date: '',
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
      caseHistory: f.caseHistory || f.history || 'تم تحويل الحالة من قبل جهة طبية للاستشارة وتقييم القدرات النمائية.',
      medicalHistory: f.medicalHistory || 'لا توجد مشكلات طبية مصاحبة تذكر، نمو ارتقائي طبيعي في أغلب الجوانب الحركية الكبرى وتأخر في الجوانب الدقيقة.',
      familyHistory: f.familyHistory || 'يعيش مع الوالدين، ترتيبه الثاني، لا توجد أمراض وراثية مشابهة في العائلة.',
      parentsInterview: f.parentsInterview || 'أفاد ولي الأمر بوجود تحديات في نطق بعض الحروف وتشتت سريع أثناء أداء المهام.',
      parentsNeeds: f.parentsNeeds || 'الأسرة بحاجة إلى توجيه حول كيفية التعامل مع السلوكيات النمطية وتعميم المهارات في المنزل من خلال جدول منظم.',
      appliedTools: f.appliedTools || '• مقابلة أولية مع ولي الأمر\n• ملاحظة مباشرة في البيئة الطبيعية\n• استبانة تقييم المهارات',
      toolsNotes: f.toolsNotes || 'أظهر استجابة جيدة لبعض فقرات التقييم وتفاعل إيجابي مع المعززات المادية، وتشتت في فقرات أخرى تتطلب تركيزاً بصرياً.',
      strengths: f.strengths || '• تواصل بصري جيد في أغلب الأحيان\n• مهارات حركية كبرى ممتازة\n• استجابة سريعة للمعززات الاجتماعية',
      weaknesses: f.weaknesses || '• ضعف في التركيز والانتباه للمهام التي تتطلب أكثر من 5 دقائق\n• قصور في التواصل اللفظي للتعبير عن الاحتياجات',
      observationSessions: f.observationSessions || 'لوحظ خلال الملاحظة الاستكشافية تفاعل محدود مع الأقران وميل للعب الفردي.',
      summary: f.summary || 'خلاصة التقييم المبدئي تشير إلى احتياج الحالة للتدخل الشامل في مجالات التواصل وتعديل السلوك وتنمية الانتباه الإدراكي.',
      recommendations: f.recommendations || `• إدراج الحالة في برنامج تدخل مبكر في مجال ${domain}\n• وضع أهداف لتنمية مهارات الانتباه المشترك كأولوية قصوى\n• دمج جلسات النطق والتخاطب مع تعديل السلوك\n• جدولة اجتماع دوري (شهري) مع الأسرة للمتابعة وتدريبهم على تعميم المهارات`
    }));
    setHelperNote('تم تجهيز مسودة مقترحة شاملة متكاملة — راجعها وعدّلها قبل الحفظ.');
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
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: 'min(94vh, calc(100dvh - 20px))', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd modal-header-custom" style={{ padding: '12px 18px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-main)' }}>📋 {editId ? 'تعديل تقييم مبدئي' : 'تقييم مبدئي جديد'}</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>تسجيل بيانات المقابلة، التاريخ التطوري، وملاحظات الجلسات الاستكشافية</span>
              </div>
              <button type="button" className="btn btn-xs btn-p" onClick={() => setModalOpen(false)} style={{ fontWeight: 700 }}>✖ إغلاق</button>
            </div>
            <div className="modal-body-scroll" style={{ padding: '16px 18px', flex: 1, overflowY: 'auto' }}>
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

                
                {/* 1. التاريخ والتطور */}
                <div className="fl full" style={{ marginTop: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--p-l)' }}>
                  <h3 style={{ margin: 0, color: 'var(--p)' }}>1. التاريخ والتطور</h3>
                </div>
                <div className="fl"><label>تاريخ الحالة</label><textarea value={evalForm.caseHistory || evalForm.history} onChange={e => setEvalForm(f => ({ ...f, caseHistory: e.target.value, history: e.target.value }))} rows={3} placeholder="متى بدأت المشكلة؟ من قام بالتحويل؟"/></div>
                <div className="fl"><label>التطور الارتقائي والطبي</label><textarea value={evalForm.medicalHistory} onChange={e => setEvalForm(f => ({ ...f, medicalHistory: e.target.value }))} rows={3} placeholder="أمراض سابقة، تاريخ الحمل والولادة، التطور الحركي واللغوي"/></div>
                <div className="fl full"><label>التاريخ العائلي</label><textarea value={evalForm.familyHistory} onChange={e => setEvalForm(f => ({ ...f, familyHistory: e.target.value }))} rows={2} placeholder="صلة القرابة، وجود حالات مشابهة، ترتيب الطفل"/></div>

                {/* 2. التقييمات والأدوات */}
                <div className="fl full" style={{ marginTop: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--cy-l)' }}>
                  <h3 style={{ margin: 0, color: 'var(--cy)' }}>2. التقييمات والأدوات</h3>
                </div>
                <div className="fl"><label>ما هي التقييمات والأدوات المستخدمة؟</label><textarea value={evalForm.appliedTools} onChange={e => setEvalForm(f => ({ ...f, appliedTools: e.target.value }))} rows={3} placeholder="مثال: مقياس بورتيج، كارز، بيب-3..."/></div>
                <div className="fl"><label>ملاحظات أو مناقشة للتقييمات المستخدمة</label><textarea value={evalForm.toolsNotes} onChange={e => setEvalForm(f => ({ ...f, toolsNotes: e.target.value }))} rows={3} placeholder="استجابة الطالب، العوائق أثناء التقييم"/></div>

                {/* 3. المقابلة الأسرية */}
                <div className="fl full" style={{ marginTop: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--or-l)' }}>
                  <h3 style={{ margin: 0, color: 'var(--or)' }}>3. المقابلة الأسرية</h3>
                </div>
                <div className="fl"><label>ملاحظات الأهل أثناء المقابلة الأولى</label><textarea value={evalForm.parentsInterview} onChange={e => setEvalForm(f => ({ ...f, parentsInterview: e.target.value }))} rows={3} placeholder="ما هي شكوى الأهل الرئيسية؟ وما تطلعاتهم؟"/></div>
                <div className="fl"><label>الاحتياجات التدريبية للأهل</label><textarea value={evalForm.parentsNeeds} onChange={e => setEvalForm(f => ({ ...f, parentsNeeds: e.target.value }))} rows={3} placeholder="ما الذي تحتاجه الأسرة لدعم الطفل (نفسياً، مهارياً، تثقيفياً)؟"/></div>

                {/* 4. الأداء الحالي والملاحظة */}
                <div className="fl full" style={{ marginTop: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--pr-l)' }}>
                  <h3 style={{ margin: 0, color: 'var(--pr)' }}>4. الأداء الحالي والملاحظة</h3>
                </div>
                <div className="fl"><label>نقاط القوة لدى المستفيد</label><textarea value={evalForm.strengths} onChange={e => setEvalForm(f => ({ ...f, strengths: e.target.value }))} rows={3} placeholder="ما الذي يتقنه المستفيد؟ المهارات الإيجابية التي يمكن البناء عليها"/></div>
                <div className="fl"><label>نقاط الضعف أو الاحتياج لدى المستفيد</label><textarea value={evalForm.weaknesses} onChange={e => setEvalForm(f => ({ ...f, weaknesses: e.target.value }))} rows={3} placeholder="المجالات والمهارات التي تحتاج إلى تدخل مباشر"/></div>
                <div className="fl full"><label>الملاحظات السلوكية أثناء الجلسات الاستكشافية</label><textarea value={evalForm.observationSessions} onChange={e => setEvalForm(f => ({ ...f, observationSessions: e.target.value }))} rows={2} placeholder="الانتباه، فرط الحركة، التواصل البصري، السلوك النمطي..."/></div>

                {/* 5. الخلاصة والتوصيات */}
                <div className="fl full" style={{ marginTop: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--bdr)' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-main)' }}>5. الخلاصة والتوصيات (تغذي الخطة الفردية IEP)</h3>
                </div>
                <div className="fl full"><label>مناقشة عامة على التقييم / الخلاصة</label><textarea value={evalForm.summary} onChange={e => setEvalForm(f => ({ ...f, summary: e.target.value }))} rows={3} placeholder="تلخيص شامل لحالة الطالب واحتياجاته الفعلية بناءً على التقييمات السابقة"/></div>
                <div className="fl full"><label>التوصيات (تُستخرج تلقائياً كأهداف في خطة IEP)</label><textarea value={evalForm.recommendations} onChange={e => setEvalForm(f => ({ ...f, recommendations: e.target.value }))} rows={4} placeholder="اكتب التوصيات على شكل نقاط (كل نقطة في سطر مستقل) لتسهيل استيرادها لاحقاً في خطة IEP"/></div>

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
