import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { calcAge, formatDate, todayStr, uid, nowTimeStr } from '../../utils/dateHelpers';

const IEP_DOMAINS = ['التواصل واللغة','المهارات الاجتماعية','السلوك والانتباه','المهارات الحركية','الرعاية الذاتية','الأكاديمي','أخرى'];
const EMPTY_IEP = { domain:'', goal:'', priority:'medium', start:'', review:'', progress:0, notes:'' };
const EMPTY_SESSION = { type:'تخاطب ونطق', date:'', time:'', duration:45, empId:'', status:'done', notes:'', goals:'', attachmentData:'', attachmentName:'' };
const EMPTY_APPT = { type:'تخاطب ونطق', date:'', time:'', duration:'45 دقيقة', mode:'inperson', link:'', empId:'', notes:'' };
const EMPTY_REPORT = { period:'month', title:'', summary:'', content:'', date:'' };
const EMPTY_BIP = { title:'', targetBehaviors:'', strategies:'', reviewDate:'', notes:'', active:true };
const PRIORITY_BADGE = { high:'b-rd', medium:'b-or', low:'b-gr' };
const PRIORITY_LABEL = { high:'عالية', medium:'متوسطة', low:'منخفضة' };

export default function StudentDetail({ stuId, onBack, onEdit, onDelete }) {
  const { toast, currentUser } = useApp();
  const [stu, setStu] = useState(null);
  const [tab, setTab] = useState('info');
  const [emps, setEmps] = useState([]);
  const [iepGoals, setIepGoals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [appts, setAppts] = useState([]);
  const [attStu, setAttStu] = useState([]);

  // Form states
  const [showIepForm, setShowIepForm] = useState(false);
  const [iepEditId, setIepEditId] = useState(null);
  const [iepForm, setIepForm] = useState(EMPTY_IEP);
  const [showSessForm, setShowSessForm] = useState(false);
  const [sessEditId, setSessEditId] = useState(null);
  const [sessForm, setSessForm] = useState(EMPTY_SESSION);
  const [showApptForm, setShowApptForm] = useState(false);
  const [apptEditId, setApptEditId] = useState(null);
  const [apptForm, setApptForm] = useState(EMPTY_APPT);
  const [reports, setReports] = useState([]);
  const [bipList, setBipList] = useState([]);
  const [showRepForm, setShowRepForm] = useState(false);
  const [repEditId, setRepEditId] = useState(null);
  const [repForm, setRepForm] = useState(EMPTY_REPORT);
  const [showBipForm, setShowBipForm] = useState(false);
  const [bipEditId, setBipEditId] = useState(null);
  const [bipForm, setBipForm] = useState(EMPTY_BIP);
  const [repFilter, setRepFilter] = useState('all');

  const canEdit = ['manager','vice','reception','specialist','specialist_speech','specialist_physio','specialist_behavior','specialist_occupational'].includes(currentUser?.role);

  function load() {
    setStu(lsGet('students').find(s => s.id === stuId));
    setEmps(lsGet('employees'));
    setIepGoals(lsGet('iepGoals').filter(g => g.stuId === stuId));
    setSessions(lsGet('sessions').filter(s => s.stuId === stuId).sort((a,b)=>(b.date||'').localeCompare(a.date||'')));
    setAppts(lsGet('appointments').filter(a => a.stuId === stuId).sort((a,b)=>a.date.localeCompare(b.date)));
    setAttStu(lsGet('attStu').filter(a => a.kidId === stuId));
    setReports(lsGet('stuReports').filter(r => r.stuId === stuId).sort((a,b)=>(b.date||'').localeCompare(a.date||'')));
    setBipList(lsGet('behaviorPlans').filter(b => b.stuId === stuId).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')));
  }

  useEffect(() => { load(); }, [stuId]);
  if (!stu) return <div style={{padding:40,textAlign:'center',color:'var(--g4)'}}>جاري التحميل...</div>;

  const spec = emps.find(e => e.id === stu.specialistId);
  const today = todayStr();
  const progs = [stu.progMorning?.enabled&&'☀️ صباحي', stu.progEvening?.enabled&&'🌙 مسائي', stu.progSessions?.enabled&&'🩺 جلسات', stu.progOnline?.enabled&&'🌐 أونلاين'].filter(Boolean);
  const recentAtt = attStu.filter(a=>a.date===today);
  const attendanceRate = attStu.length ? Math.round(attStu.filter(a=>a.status==='present').length / attStu.length * 100) : 0;

  // IEP
  function saveIep() {
    if (!iepForm.domain || !iepForm.goal) { toast('⚠️ أدخل المجال والهدف','er'); return; }
    if (iepEditId) { lsUpd('iepGoals', iepEditId, { ...iepForm, stuId }); toast('✅ تم التحديث','ok'); }
    else { lsAdd('iepGoals', { ...iepForm, stuId, id: uid() }); toast('✅ تم إضافة الهدف','ok'); }
    setShowIepForm(false); load();
  }
  function delIep(id) { if(!window.confirm('حذف هذا الهدف؟'))return; lsDel('iepGoals',id); load(); toast('🗑️ تم الحذف','ok'); }

  // Sessions
  function saveSess() {
    if (!sessForm.date) { toast('⚠️ أدخل تاريخ الجلسة','er'); return; }
    if (sessEditId) { lsUpd('sessions', sessEditId, { ...sessForm, stuId }); toast('✅ تم التحديث','ok'); }
    else { lsAdd('sessions', { ...sessForm, stuId, id: uid() }); toast('✅ تم تسجيل الجلسة','ok'); }
    setShowSessForm(false); load();
  }
  function delSess(id) { if(!window.confirm('حذف هذه الجلسة؟'))return; lsDel('sessions',id); load(); toast('🗑️','ok'); }

  // Appointments
  function saveAppt() {
    if (!apptForm.date || !apptForm.time) { toast('⚠️ أدخل التاريخ والوقت','er'); return; }
    if (apptEditId) { lsUpd('appointments', apptEditId, { ...apptForm, stuId }); toast('✅ تم التحديث','ok'); }
    else { lsAdd('appointments', { ...apptForm, stuId, id: uid() }); toast('✅ تم تسجيل الموعد','ok'); }
    setShowApptForm(false); load();
  }
  function delAppt(id) { if(!window.confirm('حذف هذا الموعد؟'))return; lsDel('appointments',id); load(); toast('🗑️','ok'); }

  function saveRep() {
    if (!repForm.title.trim() || !repForm.date) { toast('⚠️ أدخل عنوان التقرير والتاريخ','er'); return; }
    if (repEditId) lsUpd('stuReports', repEditId, { ...repForm, stuId });
    else lsAdd('stuReports', { ...repForm, stuId, id: uid() });
    setShowRepForm(false); load(); toast('✅ تم حفظ التقرير','ok');
  }
  function delRep(id) { if(!window.confirm('حذف التقرير؟'))return; lsDel('stuReports',id); load(); toast('🗑️','ok'); }

  function saveBip() {
    if (!bipForm.title.trim()) { toast('⚠️ أدخل عنوان الخطة','er'); return; }
    if (bipEditId) lsUpd('behaviorPlans', bipEditId, { ...bipForm, stuId, updatedAt: new Date().toISOString() });
    else lsAdd('behaviorPlans', { ...bipForm, stuId, id: uid(), updatedAt: new Date().toISOString() });
    setShowBipForm(false); load(); toast('✅ تم الحفظ','ok');
  }
  function delBip(id) { if(!window.confirm('حذف خطة تعديل السلوك؟'))return; lsDel('behaviorPlans',id); load(); toast('🗑️','ok'); }

  const fldI = k => e => setIepForm(f=>({...f,[k]:e.target.value}));
  const fldS = k => e => setSessForm(f=>({...f,[k]:e.target.value}));
  function sessAttach(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setSessForm(fm => ({ ...fm, attachmentData: ev.target.result, attachmentName: f.name }));
    r.readAsDataURL(f);
    e.target.value = '';
  }
  const fldA = k => e => setApptForm(f=>({...f,[k]:e.target.value}));
  const fldR = k => e => setRepForm(f=>({...f,[k]:e.target.value}));
  const fldB = k => e => setBipForm(f=>({...f,[k]:e.target.value}));

  const specialists = emps.filter(e=>['specialist','specialist_speech','specialist_physio','specialist_behavior','specialist_occupational','speech','physio','occ','behavior'].includes(e.role));

  return (
    <div>
      {/* Header */}
      <div className="det-hd">
        <div className="det-av" style={{ background:'var(--pr-l)' }}>
          {stu.photo ? <img src={stu.photo} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:16 }}/> : (stu.name||'?').slice(0,2)}
        </div>
        <div className="det-info">
          <h2>{stu.name}</h2>
          <div className="det-sub">
            <span>{stu.diagnosis}</span>
            <span>👶 {calcAge(stu.dob)}</span>
            {spec && <span>🩺 {spec.name}</span>}
            {stu.parentPhone && <span>👨‍👩‍👦 {stu.parentName} {stu.parentPhone}</span>}
          </div>
          {progs.length > 0 && <div style={{ marginTop:6, display:'flex', gap:6, flexWrap:'wrap' }}>{progs.map((p,i)=><span key={i} className="bdg b-cy">{p}</span>)}</div>}
        </div>
        <div className="det-acts">
          {stu.parentPhone && <a href={`https://wa.me/${stu.parentPhone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}`} target="_blank" rel="noreferrer" className="btn btn-bl btn-sm">💬 واتساب</a>}
          {canEdit && <button className="btn btn-p" onClick={() => onEdit(stu)}>✏️ تعديل</button>}
          <button className="btn btn-g" onClick={onBack}>← رجوع</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        <div className="sc g"><div className="lb">الجلسات المسجلة</div><div className="vl">{sessions.length}</div></div>
        <div className="sc"><div className="lb">المواعيد القادمة</div><div className="vl">{appts.filter(a=>a.date>=today).length}</div></div>
        <div className="sc v"><div className="lb">أهداف IEP</div><div className="vl">{iepGoals.length}</div></div>
        <div className="sc o"><div className="lb">نسبة الحضور</div><div className="vl">{attendanceRate}%</div></div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ flexWrap:'wrap' }}>
        {[['info','📋 المعلومات'],['iep','🎯 خطة IEP'],['sessions','🩺 الجلسات'],['appts','📅 المواعيد'],['attendance','📅 الحضور'],['reports','📑 التقارير'],['behavior','📐 خطة تعديل سلوك']].map(([v,l])=>(
          <button key={v} type="button" className={`tab ${tab===v?'on':''}`} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {/* INFO TAB */}
      {tab === 'info' && (
        <div className="g2">
          <div className="wg">
            <div className="wg-h"><h3>👤 البيانات الشخصية</h3></div>
            <div className="wg-b">
              <div className="info-grid">
                {[['الاسم',stu.name],['تاريخ الميلاد',stu.dob],['العمر',calcAge(stu.dob)],['الجنس',stu.gender],['الجنسية',stu.nationality],['تاريخ التسجيل',stu.joinDate],['التشخيص',stu.diagnosis],['تشخيص إضافي',stu.diagnosis2],['المستشفى',stu.hospital],['الطبيب',stu.doctor],['الأدوية',stu.medications]].filter(([,v])=>v).map(([k,v])=>(
                  <div className="ic" key={k}><div className="ik">{k}</div><div className="iv">{v}</div></div>
                ))}
              </div>
              {stu.medNotes && <div style={{ marginTop:10, padding:'10px 14px', background:'var(--err-l)', borderRadius:'var(--r2)', fontSize:'.84rem', color:'var(--err)' }}>⚠️ {stu.medNotes}</div>}
              {(stu.attachments && stu.attachments.length > 0) && (
                <div style={{ marginTop:14 }}>
                  <div style={{ fontWeight:800, fontSize:'.85rem', marginBottom:8 }}>📎 المرفقات</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {stu.attachments.map(a => (
                      <a key={a.id} href={a.data} download={a.name} className="btn btn-xs btn-g">📥 {a.name}</a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="wg">
            <div className="wg-h"><h3>👨‍👩‍👦 بيانات الأسرة</h3></div>
            <div className="wg-b">
              <div className="info-grid">
                {[['ولي الأمر',stu.parentName],['صلة القرابة',stu.parentRelation],['الجوال',stu.parentPhone],['جوال إضافي',stu.parentPhone2],['البريد',stu.parentEmail],['العنوان',stu.address]].filter(([,v])=>v).map(([k,v])=>(
                  <div className="ic" key={k}><div className="ik">{k}</div><div className="iv">{v}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IEP TAB */}
      {tab === 'iep' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
            {canEdit && <button className="btn btn-p" onClick={()=>{ setIepForm({...EMPTY_IEP, start:today}); setIepEditId(null); setShowIepForm(true); }}>➕ هدف جديد</button>}
          </div>
          {iepGoals.length === 0
            ? <div className="empty"><div className="ei">🎯</div><div className="et">لا توجد أهداف IEP</div></div>
            : iepGoals.map(g => (
              <div key={g.id} className="card">
                <div className={`av ${g.priority==='high'?'err':g.priority==='medium'?'warn':'ok'}`}>🎯</div>
                <div className="ci">
                  <div className="cn">{g.domain} — {g.goal}</div>
                  <div className="cm">أولوية: {PRIORITY_LABEL[g.priority]} · إنجاز: {g.progress||0}% {g.review&&'· مراجعة: '+g.review}</div>
                  {g.notes && <div className="cm">{g.notes}</div>}
                </div>
                <div className="c-badges"><span className={`bdg ${PRIORITY_BADGE[g.priority]}`}>{PRIORITY_LABEL[g.priority]}</span></div>
                <div className="c-acts">
                  <div style={{ fontSize:'.78rem', color:'var(--ok)', fontWeight:700 }}>{g.progress||0}%</div>
                  {canEdit && <button className="btn btn-xs btn-g" onClick={()=>{ setIepForm({...g}); setIepEditId(g.id); setShowIepForm(true); }}>✏️</button>}
                  {canEdit && <button className="btn btn-xs btn-d" onClick={()=>delIep(g.id)}>🗑️</button>}
                </div>
              </div>
            ))
          }
          {showIepForm && (
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowIepForm(false);}}>
              <div className="mb" style={{ padding:0, overflow:'hidden', borderRadius:16 }}>
                <div className="fhd" style={{ padding:'14px 20px', borderRadius:0 }}><h2>{iepEditId?'✏️ تعديل الهدف':'➕ هدف IEP جديد'}</h2></div>
                <div style={{ padding:'18px 20px' }}>
                  <div className="fg c2">
                    <div className="fl"><label>المجال <span className="req">*</span></label><select value={iepForm.domain} onChange={fldI('domain')}><option value="">--</option>{IEP_DOMAINS.map(d=><option key={d}>{d}</option>)}</select></div>
                    <div className="fl"><label>الأولوية</label><select value={iepForm.priority} onChange={fldI('priority')}><option value="high">عالية</option><option value="medium">متوسطة</option><option value="low">منخفضة</option></select></div>
                    <div className="fl full"><label>وصف الهدف <span className="req">*</span></label><textarea value={iepForm.goal} onChange={fldI('goal')} rows={2} placeholder="الهدف بشكل قابل للقياس..."/></div>
                    <div className="fl"><label>تاريخ البداية</label><input type="date" value={iepForm.start} onChange={fldI('start')}/></div>
                    <div className="fl"><label>تاريخ المراجعة</label><input type="date" value={iepForm.review} onChange={fldI('review')}/></div>
                    <div className="fl full">
                      <label>نسبة الإنجاز: {iepForm.progress||0}%</label>
                      <input type="range" min="0" max="100" value={iepForm.progress||0} onChange={e=>setIepForm(f=>({...f,progress:Number(e.target.value)}))} style={{ accentColor:'var(--pr)' }}/>
                    </div>
                    <div className="fl full"><label>ملاحظات</label><textarea value={iepForm.notes} onChange={fldI('notes')} rows={2}/></div>
                  </div>
                </div>
                <div className="fa">
                  <button className="btn btn-p" onClick={saveIep}>💾 حفظ</button>
                  <button className="btn btn-g" onClick={()=>setShowIepForm(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SESSIONS TAB */}
      {tab === 'sessions' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
            {canEdit && <button className="btn btn-p" onClick={()=>{ setSessForm({...EMPTY_SESSION,date:today,time:nowTimeStr()}); setSessEditId(null); setShowSessForm(true); }}>➕ جلسة جديدة</button>}
          </div>
          {sessions.length === 0
            ? <div className="empty"><div className="ei">🩺</div><div className="et">لا توجد جلسات مسجلة</div></div>
            : sessions.map(s=>{
              const emp = emps.find(e=>e.id===s.empId);
              return (
                <div key={s.id} className="card">
                  <div className="av ok">🩺</div>
                  <div className="ci">
                    <div className="cn">{s.type} {s.date && '· ' + s.date} {s.time && s.time}</div>
                    <div className="cm">{emp?.name||'—'} · {s.duration != null ? `${s.duration} دقيقة` : ''}{s.notes && ` · ${s.notes}`}</div>
                  </div>
                  <div className="c-badges"><span className={`bdg ${s.status==='done'?'b-gr':'b-or'}`}>{s.status==='done'?'✅ منجزة':'⏳ مجدولة'}</span>{s.attachmentData && <span className="bdg b-cy">📎 مرفق</span>}</div>
                  <div className="c-acts">
                    {s.attachmentData && <a href={s.attachmentData} download={s.attachmentName || 'مرفق'} className="btn btn-xs btn-bl">📥</a>}
                    {canEdit && <button className="btn btn-xs btn-g" onClick={()=>{ setSessForm({...EMPTY_SESSION, ...s, duration: s.duration ?? 45}); setSessEditId(s.id); setShowSessForm(true); }}>✏️</button>}
                    {canEdit && <button className="btn btn-xs btn-d" onClick={()=>delSess(s.id)}>🗑️</button>}
                  </div>
                </div>
              );
            })
          }
          {showSessForm && (
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowSessForm(false);}}>
              <div className="mb" style={{ padding:0, overflow:'hidden', borderRadius:16 }}>
                <div className="fhd" style={{ padding:'14px 20px', borderRadius:0 }}><h2>{sessEditId?'✏️ تعديل الجلسة':'🩺 تسجيل جلسة'}</h2></div>
                <div style={{ padding:'18px 20px' }}>
                  <div className="fg c2">
                    <div className="fl"><label>نوع الجلسة</label><select value={sessForm.type} onChange={fldS('type')}><option>تخاطب ونطق</option><option>تعديل سلوك</option><option>علاج فيزيائي</option><option>علاج وظيفي</option><option>تكامل حسي</option><option>تعليمي وتربوي</option><option>مهارات اجتماعية</option><option>أخرى</option></select></div>
                    <div className="fl"><label>الأخصائي</label><select value={sessForm.empId} onChange={fldS('empId')}><option value="">-- اختر --</option>{specialists.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                    <div className="fl"><label>التاريخ <span className="req">*</span></label><input type="date" value={sessForm.date} onChange={fldS('date')}/></div>
                    <div className="fl"><label>الوقت</label><input type="time" value={sessForm.time} onChange={fldS('time')}/></div>
                    <div className="fl"><label>المدة (دقيقة)</label><input type="number" value={sessForm.duration} onChange={e=>setSessForm(f=>({...f,duration:Number(e.target.value)}))} min="1"/></div>
                    <div className="fl"><label>الحالة</label><select value={sessForm.status} onChange={fldS('status')}><option value="done">✅ منجزة</option><option value="scheduled">⏳ مجدولة</option><option value="cancelled">❌ ملغاة</option></select></div>
                    <div className="fl full"><label>الأهداف / محتوى الجلسة</label><textarea value={sessForm.goals} onChange={fldS('goals')} rows={2} placeholder="ما تم العمل عليه..."/></div>
                    <div className="fl full"><label>ملاحظات</label><textarea value={sessForm.notes} onChange={fldS('notes')} rows={2}/></div>
                    <div className="fl full"><label>مرفق توثيق (صورة أو ملف)</label><input type="file" accept="image/*,.pdf,.doc,.docx" onChange={sessAttach}/>{sessForm.attachmentName && <span style={{ fontSize:'.78rem', marginRight:8 }}>{sessForm.attachmentName}</span>}{sessForm.attachmentData && <button type="button" className="btn btn-xs btn-d" style={{ marginRight:6 }} onClick={()=>setSessForm(f=>({...f,attachmentData:'',attachmentName:''}))}>إزالة المرفق</button>}</div>
                  </div>
                </div>
                <div className="fa">
                  <button className="btn btn-p" onClick={saveSess}>💾 حفظ</button>
                  <button className="btn btn-g" onClick={()=>setShowSessForm(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {tab === 'appts' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
            {canEdit && <button className="btn btn-p" onClick={()=>{ setApptForm({...EMPTY_APPT,date:today}); setApptEditId(null); setShowApptForm(true); }}>📅 موعد جديد</button>}
          </div>
          {appts.length === 0
            ? <div className="empty"><div className="ei">📅</div><div className="et">لا توجد مواعيد</div></div>
            : appts.map(a=>{
              const emp=emps.find(e=>e.id===a.empId);
              const isPast = a.date < today;
              return (
                <div key={a.id} className="card">
                  <div className={`av ${isPast?'warn':'ok'}`}>📅</div>
                  <div className="ci">
                    <div className="cn">{a.type} · {a.date} {a.time&&'— '+a.time}</div>
                    <div className="cm">{emp?.name||'—'} · {a.duration}{a.mode==='online'&&' 🌐'}{a.notes&&' · '+a.notes}</div>
                  </div>
                  <div className="c-badges">
                    {isPast?<span className="bdg b-gy">مضى</span>:<span className="bdg b-gr">قادم</span>}
                    {a.mode==='online'&&<span className="bdg b-cy">🌐 أونلاين</span>}
                  </div>
                  <div className="c-acts">
                    {a.link&&<a href={a.link} target="_blank" rel="noreferrer" className="btn btn-xs btn-v">🔗</a>}
                    {canEdit&&<button className="btn btn-xs btn-g" onClick={()=>{ setApptForm({...a}); setApptEditId(a.id); setShowApptForm(true); }}>✏️</button>}
                    {canEdit&&<button className="btn btn-xs btn-d" onClick={()=>delAppt(a.id)}>🗑️</button>}
                  </div>
                </div>
              );
            })
          }
          {showApptForm && (
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowApptForm(false);}}>
              <div className="mb" style={{ padding:0, overflow:'hidden', borderRadius:16 }}>
                <div className="fhd" style={{ padding:'14px 20px', borderRadius:0 }}><h2>{apptEditId?'✏️ تعديل الموعد':'📅 موعد جديد'}</h2></div>
                <div style={{ padding:'18px 20px' }}>
                  <div className="fg c2">
                    <div className="fl"><label>نوع الجلسة <span className="req">*</span></label><select value={apptForm.type} onChange={fldA('type')}><option>تخاطب ونطق</option><option>تعديل سلوك</option><option>علاج فيزيائي</option><option>علاج وظيفي</option><option>🌐 أونلاين</option><option>أخرى</option></select></div>
                    <div className="fl"><label>الأخصائي</label><select value={apptForm.empId} onChange={fldA('empId')}><option value="">-- اختر --</option>{specialists.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                    <div className="fl"><label>التاريخ <span className="req">*</span></label><input type="date" value={apptForm.date} onChange={fldA('date')}/></div>
                    <div className="fl"><label>الوقت <span className="req">*</span></label><input type="time" value={apptForm.time} onChange={fldA('time')}/></div>
                    <div className="fl"><label>المدة</label><select value={apptForm.duration} onChange={fldA('duration')}><option>30 دقيقة</option><option>45 دقيقة</option><option>60 دقيقة</option><option>90 دقيقة</option></select></div>
                    <div className="fl"><label>نوع الحضور</label><select value={apptForm.mode} onChange={fldA('mode')}><option value="inperson">🏥 حضوري</option><option value="online">🌐 أونلاين</option></select></div>
                    {apptForm.mode==='online'&&<div className="fl full"><label>رابط الاجتماع</label><input type="url" value={apptForm.link} onChange={fldA('link')} placeholder="https://meet.google.com/..."/></div>}
                    <div className="fl full"><label>ملاحظات</label><input value={apptForm.notes} onChange={fldA('notes')} placeholder="أي تفاصيل..."/></div>
                  </div>
                </div>
                <div className="fa">
                  <button className="btn btn-p" onClick={saveAppt}>💾 حفظ الموعد</button>
                  <button className="btn btn-g" onClick={()=>setShowApptForm(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {tab === 'attendance' && (
        <div className="wg">
          <div className="wg-h"><h3>📅 سجل الحضور</h3><span className="bdg b-gr">معدل الحضور: {attendanceRate}%</span></div>
          <div className="wg-b p0">
            {attStu.length === 0
              ? <div style={{padding:20,textAlign:'center',color:'var(--g4)'}}>لا يوجد سجل حضور بعد</div>
              : [...attStu].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30).map(a=>(
                <div key={a.id||a.date+a.session} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 14px', borderBottom:'1px solid var(--border-color)' }}>
                  <span style={{ fontSize:'.82rem', fontWeight:700, color:'var(--g5)', minWidth:90 }}>{a.date}</span>
                  <span style={{ fontSize:'.78rem', color:'var(--cyan)' }}>{a.session==='morning'?'☀️ صباحي':a.session==='evening'?'🌙 مسائي':'🩺 جلسات'}</span>
                  <span className={`bdg ${a.status==='present'?'b-gr':a.status==='absent'?'b-rd':'b-or'}`}>{a.status==='present'?'✅ حاضر':a.status==='absent'?'❌ غائب':'⚠️ متأخر'}</span>
                  {a.timeIn && <span style={{ fontSize:'.72rem', color:'var(--g4)' }}>⏰ {a.timeIn}{a.timeOut&&' → '+a.timeOut}</span>}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* REPORTS */}
      {tab === 'reports' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:8 }}>
            <div className="tabs" style={{ margin:0 }}>
              {[['all','الكل'],['week','أسبوعي'],['month','شهري'],['year','سنوي']].map(([v,l])=>(
                <button key={v} type="button" className={`tab ${repFilter===v?'on':''}`} onClick={()=>setRepFilter(v)}>{l}</button>
              ))}
            </div>
            {canEdit && <button type="button" className="btn btn-p btn-sm" onClick={()=>{ setRepForm({...EMPTY_REPORT,date:todayStr(),period:'month'}); setRepEditId(null); setShowRepForm(true); }}>➕ تقرير</button>}
          </div>
          {reports.filter(r => repFilter==='all' || r.period===repFilter).length===0
            ? <div className="empty"><div className="ei">📑</div><div className="et">لا توجد تقارير</div></div>
            : reports.filter(r => repFilter==='all' || r.period===repFilter).map(r=>(
              <div key={r.id} className="card">
                <div className="av cyan">📑</div>
                <div className="ci">
                  <div className="cn">{r.title}</div>
                  <div className="cm">{r.period==='week'?'أسبوعي':r.period==='year'?'سنوي':'شهري'} · {r.date} {r.summary&&'— '+r.summary}</div>
                  {r.content && <div className="cm" style={{whiteSpace:'pre-wrap'}}>{r.content}</div>}
                </div>
                {canEdit && <div className="c-acts">
                  <button type="button" className="btn btn-xs btn-g" onClick={()=>{ setRepForm({...r}); setRepEditId(r.id); setShowRepForm(true); }}>✏️</button>
                  <button type="button" className="btn btn-xs btn-d" onClick={()=>delRep(r.id)}>🗑️</button>
                </div>}
              </div>
            ))}
          {showRepForm && (
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowRepForm(false);}}>
              <div className="mb mb-sm" style={{ padding:0, overflow:'hidden', borderRadius:16 }}>
                <div className="fhd" style={{ padding:'14px 20px', borderRadius:0 }}><h2>{repEditId?'✏️ تعديل تقرير':'📑 تقرير جديد'}</h2></div>
                <div className="modal-body-scroll" style={{ padding:'18px 20px' }}>
                  <div className="fg c2">
                    <div className="fl"><label>نوع التقرير</label><select value={repForm.period} onChange={fldR('period')}><option value="week">أسبوعي</option><option value="month">شهري</option><option value="year">سنوي</option></select></div>
                    <div className="fl"><label>التاريخ</label><input type="date" value={repForm.date} onChange={fldR('date')}/></div>
                    <div className="fl full"><label>عنوان التقرير</label><input value={repForm.title} onChange={fldR('title')}/></div>
                    <div className="fl full"><label>ملخص</label><input value={repForm.summary} onChange={fldR('summary')} placeholder="سطر مختصر"/></div>
                    <div className="fl full"><label>المحتوى / التفاصيل</label><textarea value={repForm.content} onChange={fldR('content')} rows={5}/></div>
                  </div>
                </div>
                <div className="fa"><button type="button" className="btn btn-p" onClick={saveRep}>💾 حفظ</button><button type="button" className="btn btn-g" onClick={()=>setShowRepForm(false)}>إلغاء</button></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BEHAVIOR PLAN (optional) */}
      {tab === 'behavior' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
            {canEdit && <button type="button" className="btn btn-p" onClick={()=>{ setBipForm({...EMPTY_BIP, reviewDate:today}); setBipEditId(null); setShowBipForm(true); }}>➕ خطة تعديل سلوك</button>}
          </div>
          <p style={{ fontSize:'.82rem', color:'var(--g5)', marginBottom:12 }}>قسم اختياري لتوثيق أهداف السلوك والاستراتيجيات ومتابعة المراجعة.</p>
          {bipList.length===0
            ? <div className="empty"><div className="ei">📐</div><div className="et">لا توجد خطط مسجلة</div></div>
            : bipList.map(b=>(
              <div key={b.id} className="card">
                <div className="av warn">📐</div>
                <div className="ci">
                  <div className="cn">{b.title}</div>
                  <div className="cm">{b.active!==false?'نشطة':'مؤرشفة'}{b.reviewDate&&' · مراجعة: '+b.reviewDate}</div>
                  {b.targetBehaviors && <div className="cm" style={{whiteSpace:'pre-wrap'}}><b>السلوك المستهدف:</b> {b.targetBehaviors}</div>}
                  {b.strategies && <div className="cm" style={{whiteSpace:'pre-wrap'}}><b>الاستراتيجيات:</b> {b.strategies}</div>}
                  {b.notes && <div className="cm">{b.notes}</div>}
                </div>
                {canEdit && <div className="c-acts">
                  <button type="button" className="btn btn-xs btn-g" onClick={()=>{ setBipForm({...b}); setBipEditId(b.id); setShowBipForm(true); }}>✏️</button>
                  <button type="button" className="btn btn-xs btn-d" onClick={()=>delBip(b.id)}>🗑️</button>
                </div>}
              </div>
            ))}
          {showBipForm && (
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowBipForm(false);}}>
              <div className="mb" style={{ padding:0, overflow:'hidden', borderRadius:16 }}>
                <div className="fhd" style={{ padding:'14px 20px', borderRadius:0 }}><h2>{bipEditId?'✏️ تعديل الخطة':'📐 خطة تعديل سلوك'}</h2></div>
                <div className="modal-body-scroll" style={{ padding:'18px 20px' }}>
                  <div className="fg c2">
                    <div className="fl full"><label>عنوان الخطة</label><input value={bipForm.title} onChange={fldB('title')}/></div>
                    <div className="fl full"><label>السلوك المستهدف</label><textarea value={bipForm.targetBehaviors} onChange={fldB('targetBehaviors')} rows={3}/></div>
                    <div className="fl full"><label>الاستراتيجيات والتدخلات</label><textarea value={bipForm.strategies} onChange={fldB('strategies')} rows={3}/></div>
                    <div className="fl"><label>تاريخ المراجعة</label><input type="date" value={bipForm.reviewDate} onChange={fldB('reviewDate')}/></div>
                    <div className="fl"><label>الحالة</label><select value={bipForm.active !== false ? '1' : '0'} onChange={e=>setBipForm(f=>({...f,active:e.target.value==='1'}))}><option value="1">نشطة</option><option value="0">مؤرشفة</option></select></div>
                    <div className="fl full"><label>ملاحظات</label><textarea value={bipForm.notes} onChange={fldB('notes')} rows={2}/></div>
                  </div>
                </div>
                <div className="fa"><button type="button" className="btn btn-p" onClick={saveBip}>💾 حفظ</button><button type="button" className="btn btn-g" onClick={()=>setShowBipForm(false)}>إلغاء</button></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
