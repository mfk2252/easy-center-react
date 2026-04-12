import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { DIAGNOSES, SPECIALIST_ROLES } from '../../utils/constants';
import { calcAge, todayStr, uid, nowTimeStr } from '../../utils/dateHelpers';
import EmptyState from '../../components/ui/EmptyState';
import StudentDetail from './StudentDetail';

const SESSION_TYPES = ['تخاطب ونطق','تعديل سلوك','علاج فيزيائي','علاج وظيفي','تكامل حسي','تعليمي وتربوي','مهارات اجتماعية'];
const STATUSES = { active:'✅ نشط', inactive:'⏸️ منقطع', graduated:'🎓 متخرج', transferred:'🔄 محوّل', waitlist:'⏳ انتظار', rejected:'❌ غير مناسب' };
const STATUS_BADGE = { active:'b-gr', inactive:'b-gy', graduated:'b-cy', transferred:'b-bl', waitlist:'b-or', rejected:'b-rd' };

const EMPTY_STU = { name:'', dob:'', gender:'', nationality:'سعودي', joinDate:'', status:'active', specialistId:'', sessionTypes:[], diagnosis:'', diagnosis2:'', hospital:'', doctor:'', medications:'', medNotes:'', parentName:'', parentPhone:'', parentPhone2:'', parentRelation:'', parentJob:'', parentEmail:'', address:'', progMorning:{enabled:false}, progEvening:{enabled:false}, progSessions:{enabled:false,emp:'',type:'',freq:'أسبوعي'}, progOnline:{enabled:false,emp:'',type:'',dur:'45 دقيقة',link:''}, notes:'', photo:'', attachments:[] };
const EMPTY_QS = { stuId:'', type:'تخاطب ونطق', date:'', time:'', duration:45, empId:'', notes:'', attachData:'', attachName:'' };

export default function StudentsPage() {
  const { go, toast, currentUser, activeView } = useApp();
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [tab, setTab] = useState('active');
  const [q, setQ] = useState('');
  const [filterDiag, setFilterDiag] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_STU);
  const [detailId, setDetailId] = useState(null);
  const [showQuickSession, setShowQuickSession] = useState(false);
  const [qsForm, setQsForm] = useState(EMPTY_QS);

  const canAdd = ['manager','vice','reception'].includes(currentUser?.role);
  const canEdit = ['manager','vice','reception'].includes(currentUser?.role);
  const specialists = emps.filter(e => SPECIALIST_ROLES.includes(e.role));

  useEffect(() => { setStudents(lsGet('students')); setEmps(lsGet('employees')); }, [activeView]);
  function reload() { setStudents(lsGet('students')); }
  const fld = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  function fldProg(prog, key) { return e => setForm(f => ({ ...f, [prog]: { ...f[prog], [key]: e.target.value } })); }
  function toggleProg(prog) { setForm(f => ({ ...f, [prog]: { ...f[prog], enabled: !f[prog].enabled } })); }

  const filtered = students.filter(s => {
    if (tab==='active' && !['active'].includes(s.status)) return false;
    if (tab==='morning' && !s.progMorning?.enabled) return false;
    if (tab==='evening' && !s.progEvening?.enabled) return false;
    if (tab==='sessions' && !s.progSessions?.enabled) return false;
    if (tab==='online' && !s.progOnline?.enabled) return false;
    if (tab==='waitlist' && s.status!=='waitlist') return false;
    if (tab==='inactive' && s.status!=='inactive') return false;
    if (tab==='graduated' && s.status!=='graduated') return false;
    if (filterDiag && s.diagnosis !== filterDiag) return false;
    if (filterSpec && s.specialistId !== filterSpec) return false;
    if (q) {
      const ql = q.toLowerCase();
      if (!(s.name||'').toLowerCase().includes(ql) && !(s.diagnosis||'').includes(q) && !(s.parentName||'').toLowerCase().includes(ql) && !(s.parentPhone||'').includes(q)) return false;
    }
    return true;
  });

  function openForm(stu = null) {
    if (stu) { setForm({ ...EMPTY_STU, ...stu, attachments: stu.attachments || [] }); setEditId(stu.id); }
    else { setForm({ ...EMPTY_STU, joinDate: todayStr(), attachments: [] }); setEditId(null); }
    setShowForm(true);
  }

  function save() {
    if (!form.name.trim()) { toast('⚠️ أدخل اسم الطالب', 'er'); return; }
    if (!form.dob) { toast('⚠️ أدخل تاريخ الميلاد', 'er'); return; }
    if (!form.parentName?.trim()) { toast('⚠️ أدخل اسم ولي الأمر', 'er'); return; }
    if (!form.parentRelation?.trim()) { toast('⚠️ أدخل صلة القرابة', 'er'); return; }
    if (!form.parentPhone?.trim()) { toast('⚠️ أدخل جوال ولي الأمر', 'er'); return; }
    if (editId) { lsUpd('students', editId, form); toast('✅ تم تحديث بيانات الطالب', 'ok'); }
    else { lsAdd('students', { ...form, id: uid() }); toast('✅ تم إضافة الطالب', 'ok'); }
    setShowForm(false); reload();
  }

  function deleteStu(id) {
    if (!window.confirm('⚠️ تحذير نهائي: سيتم حذف الطالب وجميع الارتباطات المحلية ببياناته من هذا الجهاز.\nهل تريد المتابعة؟')) return;
    if (!window.confirm('تأكيد أخير: حذف نهائي لا يمكن التراجع عنه. المتابعة؟')) return;
    lsDel('students', id); toast('🗑️ تم الحذف', 'ok'); reload(); setDetailId(null);
  }

  function handlePhoto(e) { const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>setForm(fm=>({...fm,photo:ev.target.result})); r.readAsDataURL(f); }

  function addAttachments(e) {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach(f => {
      const r = new FileReader();
      r.onload = ev => setForm(fm => ({
        ...fm,
        attachments: [...(fm.attachments || []), { id: uid(), name: f.name, data: ev.target.result, label: 'مرفق' }],
      }));
      r.readAsDataURL(f);
    });
    e.target.value = '';
  }
  function removeAttachment(aid) {
    setForm(f => ({ ...f, attachments: (f.attachments || []).filter(a => a.id !== aid) }));
  }

  const fldQs = k => e => setQsForm(f => ({ ...f, [k]: e.target.value }));
  function openQuickSession() {
    setQsForm({ ...EMPTY_QS, date: todayStr(), time: nowTimeStr() });
    setShowQuickSession(true);
  }
  function qsAttach(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setQsForm(fm => ({ ...fm, attachData: ev.target.result, attachName: f.name }));
    r.readAsDataURL(f);
    e.target.value = '';
  }
  function saveQuickSession() {
    if (!qsForm.stuId || !qsForm.date) { toast('⚠️ اختر الطالب والتاريخ', 'er'); return; }
    lsAdd('sessions', {
      id: uid(),
      stuId: qsForm.stuId,
      type: qsForm.type,
      date: qsForm.date,
      time: qsForm.time,
      duration: Number(qsForm.duration) || 45,
      empId: qsForm.empId,
      status: 'done',
      notes: qsForm.notes,
      goals: '',
      attachmentData: qsForm.attachData || '',
      attachmentName: qsForm.attachName || '',
    });
    toast('✅ تم تسجيل الجلسة — ستظهر في تبويب الجلسات داخل ملف الطالب', 'ok');
    setShowQuickSession(false);
    reload();
  }

  if (detailId) return <StudentDetail stuId={detailId} onBack={() => { setDetailId(null); reload(); }} onEdit={stu => openForm(stu)} onDelete={deleteStu}/>;

  const activeCount = students.filter(s=>s.status==='active').length;
  const waitlistCount = students.filter(s=>s.status==='waitlist').length;

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>👦 الطلاب</h2><p>قاعدة بيانات الطلاب المسجلين</p></div>
        <div className="ph-a" style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {canAdd && <button type="button" className="btn btn-p" onClick={() => openForm()}>➕ طالب جديد</button>}
          {canEdit && <button type="button" className="btn btn-s" onClick={openQuickSession}>🩺 تسجيل جلسة</button>}
        </div>
      </div>

      <div className="tabs" style={{ flexWrap:'wrap' }}>
        {[['active','✅ نشط'],['morning','☀️ صباحي'],['evening','🌙 مسائي'],['sessions','🩺 جلسات'],['online','🌐 أونلاين'],['waitlist','⏳ انتظار'],['inactive','⏸️ منقطعون'],['graduated','🎓 تخرج'],['all','📋 الكل']].map(([v,l])=>(
          <button key={v} className={`tab ${tab===v?'on':''}`} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      <div className="tb">
        <input className="srch" value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 ابحث بالاسم أو التشخيص أو ولي الأمر..."/>
        <select className="fsel" value={filterDiag} onChange={e=>setFilterDiag(e.target.value)}>
          <option value="">كل التشخيصات</option>
          {DIAGNOSES.map(d=><option key={d}>{d}</option>)}
        </select>
        <select className="fsel" value={filterSpec} onChange={e=>setFilterSpec(e.target.value)}>
          <option value="">كل الأخصائيين</option>
          {specialists.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div className="stats" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        <div className="sc g"><div className="lb">النشطون</div><div className="vl">{activeCount}</div></div>
        <div className="sc"><div className="lb">جلسات</div><div className="vl">{students.filter(s=>s.progSessions?.enabled).length}</div></div>
        <div className="sc o"><div className="lb">قائمة الانتظار</div><div className="vl">{waitlistCount}</div></div>
        <div className="sc v"><div className="lb">الكل</div><div className="vl">{students.length}</div></div>
      </div>

      {filtered.length === 0
        ? <EmptyState icon="👦" title="لا يوجد طلاب" sub={canAdd ? 'اضغط ➕ طالب جديد' : ''}/>
        : filtered.map(s => {
          const spec = emps.find(e => e.id === s.specialistId);
          const progs = [s.progMorning?.enabled&&'☀️', s.progEvening?.enabled&&'🌙', s.progSessions?.enabled&&'🩺', s.progOnline?.enabled&&'🌐'].filter(Boolean);
          return (
            <div key={s.id} className="card clickable" onClick={() => setDetailId(s.id)}>
              <div className="av lg">
                {s.photo ? <img src={s.photo} alt={s.name}/> : (s.name||'?').slice(0,2)}
              </div>
              <div className="ci">
                <div className="cn">{s.name}</div>
                <div className="cm">{s.diagnosis||'—'} · {calcAge(s.dob)} · {spec?.name||'—'}</div>
                <div className="cm">{s.parentName&&'👨‍👩‍👦 '+s.parentName} {s.parentPhone&&'· '+s.parentPhone}</div>
              </div>
              <div className="c-badges">
                <span className={`bdg ${STATUS_BADGE[s.status]||'b-gy'}`}>{STATUSES[s.status]||s.status}</span>
                {progs.map((p,i)=><span key={i} className="bdg b-cy">{p}</span>)}
              </div>
              <div className="c-acts" onClick={ev=>ev.stopPropagation()}>
                {s.parentPhone && <a href={`https://wa.me/${s.parentPhone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-bl">💬</a>}
                {canEdit && <button className="btn btn-xs btn-g" onClick={()=>openForm(s)}>✏️</button>}
              </div>
            </div>
          );
        })
      }

      {/* Student Form Modal */}
      {showForm && (
        <div className="mbg" onClick={e=>{ if(e.target===e.currentTarget) setShowForm(false); }}>
          <div className="mb mb-xl" style={{ padding:0, overflow:'hidden', borderRadius:16 }}>
            <div className="fhd" style={{ padding:'16px 20px', borderRadius:0 }}>
              <h2>{editId ? '✏️ تعديل بيانات الطالب' : '➕ طالب جديد'}</h2>
              <p>بيانات شاملة للطالب وأسرته</p>
            </div>
            <div className="modal-body-scroll" style={{ padding:'18px 20px' }}>

              <div className="fs"><div className="fsh">👤 البيانات الشخصية</div><div className="fsb">
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ width:70, height:70, borderRadius:'50%', border:'3px dashed var(--g3)', background:'var(--g1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', cursor:'pointer', overflow:'hidden' }} onClick={()=>document.getElementById('stu-photo-inp').click()}>
                    {form.photo ? <img src={form.photo} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👦'}
                  </div>
                  <button className="btn btn-g btn-sm" type="button" onClick={()=>document.getElementById('stu-photo-inp').click()}>📷 صورة الطالب</button>
                  <input id="stu-photo-inp" type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto}/>
                </div>
                <div className="fg c3">
                  <div className="fl"><label>الاسم الكامل <span className="req">*</span></label><input value={form.name} onChange={fld('name')} placeholder="اسم الطالب كاملاً"/></div>
                  <div className="fl"><label>تاريخ الميلاد <span className="req">*</span></label><input type="date" value={form.dob} onChange={fld('dob')}/></div>
                  <div className="fl"><label>العمر</label><input value={calcAge(form.dob)} readOnly style={{ background:'var(--g0)' }}/></div>
                </div>
                <div className="fg c3" style={{ marginTop:10 }}>
                  <div className="fl"><label>الجنس</label><select value={form.gender} onChange={fld('gender')}><option value="">--</option><option>ذكر</option><option>أنثى</option></select></div>
                  <div className="fl"><label>الجنسية</label><input value={form.nationality} onChange={fld('nationality')} placeholder="سعودي"/></div>
                  <div className="fl"><label>تاريخ التسجيل</label><input type="date" value={form.joinDate} onChange={fld('joinDate')}/></div>
                </div>
                <div className="fg c3" style={{ marginTop:10 }}>
                  <div className="fl"><label>الحالة</label>
                    <select value={form.status} onChange={fld('status')}>
                      {Object.entries(STATUSES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="fl"><label>الأخصائي المسؤول</label>
                    <select value={form.specialistId} onChange={fld('specialistId')}>
                      <option value="">-- اختر --</option>
                      {specialists.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div className="fl"><label>نوع الجلسات المطلوبة</label>
                    <select multiple value={form.sessionTypes||[]} onChange={e=>setForm(f=>({...f,sessionTypes:[...e.target.selectedOptions].map(o=>o.value)}))} style={{ height:80 }}>
                      {SESSION_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div></div>

              <div className="fs"><div className="fsh">🏥 المعلومات الطبية</div><div className="fsb">
                <div className="fg c2">
                  <div className="fl"><label>التشخيص الرئيسي <span className="req">*</span></label>
                    <select value={form.diagnosis} onChange={fld('diagnosis')}>
                      <option value="">-- اختر --</option>
                      {DIAGNOSES.map(d=><option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="fl"><label>تشخيصات إضافية</label><input value={form.diagnosis2} onChange={fld('diagnosis2')} placeholder="تأخر لغوي، فرط حركة..."/></div>
                </div>
                <div className="fg c2" style={{ marginTop:10 }}>
                  <div className="fl"><label>المستشفى / العيادة</label><input value={form.hospital} onChange={fld('hospital')}/></div>
                  <div className="fl"><label>الطبيب المعالج</label><input value={form.doctor} onChange={fld('doctor')}/></div>
                </div>
                <div className="fg c2" style={{ marginTop:10 }}>
                  <div className="fl"><label>الأدوية الحالية</label><textarea value={form.medications} onChange={fld('medications')} rows={2} placeholder="اسم الدواء والجرعة..."/></div>
                  <div className="fl"><label>⚠️ ملاحظات طبية مهمة</label><textarea value={form.medNotes} onChange={fld('medNotes')} rows={2} placeholder="حساسية، تحذيرات..."/></div>
                </div>
              </div></div>

              <div className="fs"><div className="fsh">👨‍👩‍👦 بيانات الأسرة</div><div className="fsb">
                <div className="fg c3">
                  <div className="fl"><label>اسم ولي الأمر <span className="req">*</span></label><input value={form.parentName} onChange={fld('parentName')}/></div>
                  <div className="fl"><label>صلة القرابة <span className="req">*</span></label><select value={form.parentRelation} onChange={fld('parentRelation')}><option value="">-- اختر --</option><option>ولي أمر</option><option>الأب</option><option>الأم</option><option>أخرى</option></select></div>
                  <div className="fl"><label>جوال ولي الأمر <span className="req">*</span></label><input type="tel" value={form.parentPhone} onChange={fld('parentPhone')} placeholder="05xxxxxxxx"/></div>
                </div>
                <div className="fg c3" style={{ marginTop:10 }}>
                  <div className="fl"><label>جوال إضافي</label><input type="tel" value={form.parentPhone2} onChange={fld('parentPhone2')}/></div>
                  <div className="fl"><label>البريد الإلكتروني</label><input type="email" value={form.parentEmail} onChange={fld('parentEmail')}/></div>
                  <div className="fl"><label>العنوان</label><input value={form.address} onChange={fld('address')}/></div>
                </div>
              </div></div>

              <div className="fs"><div className="fsh">🗂️ الأقسام والبرامج</div><div className="fsb">
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    ['progMorning','☀️ صباحي','var(--warn)'],
                    ['progEvening','🌙 مسائي','var(--pur)'],
                  ].map(([prog, label, color]) => (
                    <div key={prog} style={{ border:`1.5px solid ${form[prog]?.enabled?color:'var(--border-color)'}`, borderRadius:10, padding:12 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontWeight:800, color }}>
                        <input type="checkbox" checked={!!form[prog]?.enabled} onChange={()=>toggleProg(prog)}/> {label}
                      </label>
                    </div>
                  ))}
                  <div style={{ border:`1.5px solid ${form.progSessions?.enabled?'var(--ok)':'var(--border-color)'}`, borderRadius:10, padding:12 }}>
                    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontWeight:800, color:'var(--ok)' }}>
                      <input type="checkbox" checked={!!form.progSessions?.enabled} onChange={()=>toggleProg('progSessions')}/> 🩺 جلسات علاجية
                    </label>
                    {form.progSessions?.enabled && (
                      <div className="fg c3" style={{ marginTop:10 }}>
                        <div className="fl"><label>الأخصائي</label><select value={form.progSessions?.emp||''} onChange={fldProg('progSessions','emp')}><option value="">-- اختر --</option>{specialists.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                        <div className="fl"><label>نوع الجلسة</label><select value={form.progSessions?.type||''} onChange={fldProg('progSessions','type')}>{SESSION_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                        <div className="fl"><label>التكرار</label><select value={form.progSessions?.freq||'أسبوعي'} onChange={fldProg('progSessions','freq')}><option>يومي</option><option>أسبوعي</option><option>مرتين أسبوعياً</option><option>ثلاث مرات أسبوعياً</option><option>شهري</option></select></div>
                      </div>
                    )}
                  </div>
                  <div style={{ border:`1.5px solid ${form.progOnline?.enabled?'var(--cyan)':'var(--border-color)'}`, borderRadius:10, padding:12 }}>
                    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontWeight:800, color:'var(--cyan)' }}>
                      <input type="checkbox" checked={!!form.progOnline?.enabled} onChange={()=>toggleProg('progOnline')}/> 🌐 أونلاين
                    </label>
                    {form.progOnline?.enabled && (
                      <div className="fg c2" style={{ marginTop:10 }}>
                        <div className="fl"><label>الأخصائي</label><select value={form.progOnline?.emp||''} onChange={fldProg('progOnline','emp')}><option value="">-- اختر --</option>{specialists.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                        <div className="fl"><label>رابط الاجتماع</label><input type="url" value={form.progOnline?.link||''} onChange={fldProg('progOnline','link')} placeholder="https://meet.google.com/..."/></div>
                      </div>
                    )}
                  </div>
                </div>
              </div></div>

              <div className="fs"><div className="fsh">📝 ملاحظات</div><div className="fsb">
                <div className="fl"><label>ملاحظات عامة</label><textarea value={form.notes} onChange={fld('notes')} rows={3} placeholder="أي معلومات إضافية..."/></div>
              </div></div>

              <div className="fs"><div className="fsh">📎 المرفقات (عقد، شهادات، مستندات)</div><div className="fsb">
                <div className="fl full">
                  <label>إضافة ملفات (متعدد)</label>
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*" onChange={addAttachments} />
                </div>
                {(form.attachments || []).length > 0 && (
                  <ul style={{ margin:'10px 0 0', padding:0, listStyle:'none', fontSize:'.84rem' }}>
                    {(form.attachments || []).map(a => (
                      <li key={a.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <a href={a.data} download={a.name} className="btn btn-xs btn-g">📥 {a.name}</a>
                        <button type="button" className="btn btn-xs btn-d" onClick={() => removeAttachment(a.id)}>إزالة</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div></div>
            </div>
            <div className="fa">
              <button className="btn btn-p" onClick={save}>💾 حفظ</button>
              <button className="btn btn-g" onClick={() => setShowForm(false)}>إلغاء</button>
              {editId && (
                <button
                  type="button"
                  className="btn btn-d btn-sm"
                  style={{ marginRight:'auto' }}
                  onClick={() => deleteStu(editId)}
                >
                  ⛔ حذف الطالب نهائياً
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showQuickSession && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setShowQuickSession(false)}>
          <div className="mb mb-xl" style={{ padding:0, overflow:'hidden', borderRadius:16 }}>
            <div className="fhd" style={{ padding:'16px 20px', borderRadius:0 }}>
              <h2>🩺 تسجيل جلسة علاجية</h2>
              <p style={{ fontSize:'.82rem', opacity:0.9 }}>تُحفظ في سجل الجلسات داخل ملف الطالب</p>
            </div>
            <div className="modal-body-scroll" style={{ padding:'18px 20px' }}>
              <div className="fg c2">
                <div className="fl full"><label>الطفل <span className="req">*</span></label>
                  <select value={qsForm.stuId} onChange={fldQs('stuId')}>
                    <option value="">— اختر من قاعدة البيانات —</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="fl"><label>نوع الجلسة</label>
                  <select value={qsForm.type} onChange={fldQs('type')}>{SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                </div>
                <div className="fl"><label>التاريخ <span className="req">*</span></label><input type="date" value={qsForm.date} onChange={fldQs('date')}/></div>
                <div className="fl"><label>الوقت</label><input type="time" value={qsForm.time} onChange={fldQs('time')}/></div>
                <div className="fl"><label>الأخصائي</label>
                  <select value={qsForm.empId} onChange={fldQs('empId')}><option value="">—</option>{specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
                </div>
                <div className="fl"><label>المدة (دقيقة)</label><input type="number" min={15} value={qsForm.duration} onChange={e => setQsForm(f => ({ ...f, duration: Number(e.target.value) }))}/></div>
                <div className="fl full"><label>ملاحظات</label><textarea value={qsForm.notes} onChange={fldQs('notes')} rows={3}/></div>
                <div className="fl full"><label>مرفق (صورة أو ملف)</label><input type="file" accept="image/*,.pdf,.doc,.docx" onChange={qsAttach}/>{qsForm.attachName && <span style={{ fontSize:'.8rem', marginRight:8 }}>{qsForm.attachName}</span>}</div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={saveQuickSession}>💾 حفظ الجلسة</button>
              <button type="button" className="btn btn-g" onClick={() => setShowQuickSession(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
