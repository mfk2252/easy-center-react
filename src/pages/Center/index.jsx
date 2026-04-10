import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { todayStr, uid } from '../../utils/dateHelpers';
import EmptyState from '../../components/ui/EmptyState';

const DOC_TYPES = { stats:'إحصائية وزارية', policy:'لائحة / سياسة', report:'تقرير', strategy:'استراتيجية', circular:'تعميم', memo:'📝 مذكرة داخلية', other:'أخرى' };
const EXPENSE_CATS = { salary:'رواتب', rent:'إيجار', utilities:'فواتير', supplies:'مستلزمات', maintenance:'صيانة', training:'تدريب', other:'أخرى' };
const INCOME_CATS = { fees:'رسوم طلاب', donation:'تبرعات', grant:'منح', other:'أخرى' };

const EMPTY_DOC = { name:'', type:'stats', date:'', org:'', url:'', notes:'', fileData:'', fileName:'', audience:['all'] };
const EMPTY_EXP = { desc:'', cat:'salary', amount:'', date:'', notes:'' };
const EMPTY_INC = { desc:'', cat:'fees', amount:'', date:'', notes:'' };
const EMPTY_PARTNER = { name:'', type:'', contact:'', phone:'', email:'', startDate:'', notes:'' };
const EMPTY_CUSTODY = { name:'', category:'', quantity:1, location:'', condition:'جيد', notes:'' };
const EMPTY_VISIT = { name:'', date:'', type:'', delegation:'', purpose:'', result:'', notes:'' };

export default function CenterPage() {
  const { toast, currentUser } = useApp();
  const [tab, setTab] = useState('partners');
  const isManager = currentUser?.role === 'manager';
  const canView = ['manager','vice'].includes(currentUser?.role);

  // State for each section
  const [docs, setDocs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [partners, setPartners] = useState([]);
  const [custody, setCustody] = useState([]);
  const [visits, setVisits] = useState([]);

  // Form states
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState(EMPTY_DOC);
  const [docEditId, setDocEditId] = useState(null);
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState(EMPTY_EXP);
  const [expEditId, setExpEditId] = useState(null);
  const [showIncForm, setShowIncForm] = useState(false);
  const [incForm, setIncForm] = useState(EMPTY_INC);
  const [incEditId, setIncEditId] = useState(null);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerForm, setPartnerForm] = useState(EMPTY_PARTNER);
  const [partnerEditId, setPartnerEditId] = useState(null);
  const [showCustodyForm, setShowCustodyForm] = useState(false);
  const [custodyForm, setCustodyForm] = useState(EMPTY_CUSTODY);
  const [custodyEditId, setCustodyEditId] = useState(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitForm, setVisitForm] = useState(EMPTY_VISIT);
  const [visitEditId, setVisitEditId] = useState(null);
  const [docTab, setDocTab] = useState('all');

  function reload() {
    setDocs(lsGet('centerDocs'));
    setExpenses(lsGet('expenses'));
    setIncome(lsGet('income'));
    setPartners(lsGet('partners'));
    setCustody(lsGet('custody'));
    setVisits(lsGet('centerVisits'));
  }
  useEffect(() => { reload(); }, []);

  const fldD = k => e => setDocForm(f=>({...f,[k]:e.target.value}));
  const fldE = k => e => setExpForm(f=>({...f,[k]:e.target.value}));
  const fldI = k => e => setIncForm(f=>({...f,[k]:e.target.value}));
  const fldP = k => e => setPartnerForm(f=>({...f,[k]:e.target.value}));
  const fldC = k => e => setCustodyForm(f=>({...f,[k]:e.target.value}));
  const fldV = k => e => setVisitForm(f=>({...f,[k]:e.target.value}));

  // Docs
  function saveDoc() {
    if (!docForm.name.trim()) { toast('⚠️ أدخل اسم الوثيقة','er'); return; }
    if (docEditId) lsUpd('centerDocs',docEditId,docForm); else lsAdd('centerDocs',{...docForm,id:uid()});
    toast('✅ تم حفظ الوثيقة','ok'); setShowDocForm(false); reload();
  }
  function handleDocFile(e) { const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setDocForm(fm=>({...fm,fileData:ev.target.result,fileName:f.name}));r.readAsDataURL(f); }

  // Finance
  function saveExp() {
    if (!expForm.desc || !expForm.amount || !expForm.date) { toast('⚠️ أكمل الحقول المطلوبة','er'); return; }
    if (expEditId) lsUpd('expenses',expEditId,expForm); else lsAdd('expenses',{...expForm,id:uid()});
    toast('✅ تم حفظ المصروف','ok'); setShowExpForm(false); reload();
  }
  function saveInc() {
    if (!incForm.desc || !incForm.amount || !incForm.date) { toast('⚠️ أكمل الحقول المطلوبة','er'); return; }
    if (incEditId) lsUpd('income',incEditId,incForm); else lsAdd('income',{...incForm,id:uid()});
    toast('✅ تم حفظ الإيراد','ok'); setShowIncForm(false); reload();
  }

  // Partners
  function savePartner() {
    if (!partnerForm.name.trim()) { toast('⚠️ أدخل اسم الشريك','er'); return; }
    if (partnerEditId) lsUpd('partners',partnerEditId,partnerForm); else lsAdd('partners',{...partnerForm,id:uid()});
    toast('✅ تم الحفظ','ok'); setShowPartnerForm(false); reload();
  }

  // Custody
  function saveCustody() {
    if (!custodyForm.name.trim()) { toast('⚠️ أدخل اسم العهدة','er'); return; }
    if (custodyEditId) lsUpd('custody',custodyEditId,custodyForm); else lsAdd('custody',{...custodyForm,id:uid()});
    toast('✅ تم الحفظ','ok'); setShowCustodyForm(false); reload();
  }

  // Visits
  function saveVisit() {
    if (!visitForm.name.trim() || !visitForm.date) { toast('⚠️ أدخل الجهة والتاريخ','er'); return; }
    if (visitEditId) lsUpd('centerVisits',visitEditId,visitForm); else lsAdd('centerVisits',{...visitForm,id:uid()});
    toast('✅ تم تسجيل الزيارة','ok'); setShowVisitForm(false); reload();
  }

  const totalIncome = income.reduce((s,x)=>s+(Number(x.amount)||0),0);
  const totalExpenses = expenses.reduce((s,x)=>s+(Number(x.amount)||0),0);
  const filteredDocs = docTab==='all' ? docs : docs.filter(d=>d.type===docTab);

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>🏢 إدارة المركز</h2><p>الشراكات والمالية والوثائق والعهدة والزيارات</p></div>
      </div>
      <div className="tabs">
        {[['partners','🤝 الشراكات'],['finance','💳 المالية'],['docs','📄 الوثائق'],['custody','🗄️ العهدة'],['visits','🏛️ الزيارات']].map(([v,l])=>(
          <button key={v} className={`tab ${tab===v?'on':''}`} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {/* PARTNERS */}
      {tab==='partners' && (
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            {isManager&&<button className="btn btn-p" onClick={()=>{setPartnerForm({...EMPTY_PARTNER});setPartnerEditId(null);setShowPartnerForm(true);}}>➕ شريك جديد</button>}
          </div>
          <div className="stats" style={{gridTemplateColumns:'repeat(2,1fr)'}}>
            <div className="sc"><div className="lb">الشركاء</div><div className="vl">{partners.length}</div></div>
            <div className="sc g"><div className="lb">الشراكات النشطة</div><div className="vl">{partners.length}</div></div>
          </div>
          {partners.length===0 ? <EmptyState icon="🤝" title="لا يوجد شركاء"/> : partners.map(p=>(
            <div key={p.id} className="card">
              <div className="av cyan">🤝</div>
              <div className="ci">
                <div className="cn">{p.name}</div>
                <div className="cm">{p.type&&p.type+' · '}{p.contact&&p.contact}{p.phone&&' · '+p.phone}</div>
              </div>
              <div className="c-acts">
                {p.phone&&<a href={`https://wa.me/${p.phone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-bl">💬</a>}
                {isManager&&<button className="btn btn-xs btn-g" onClick={()=>{setPartnerForm({...p});setPartnerEditId(p.id);setShowPartnerForm(true);}}>✏️</button>}
                {isManager&&<button className="btn btn-xs btn-d" onClick={()=>{lsDel('partners',p.id);reload();toast('🗑️ تم الحذف','ok');}}>🗑️</button>}
              </div>
            </div>
          ))}
          {showPartnerForm&&(
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowPartnerForm(false);}}>
              <div className="mb" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{partnerEditId?'✏️ تعديل الشريك':'🤝 شريك جديد'}</h2></div>
                <div style={{padding:'18px 20px'}}>
                  <div className="fg c2">
                    <div className="fl full"><label>اسم الجهة <span className="req">*</span></label><input value={partnerForm.name} onChange={fldP('name')}/></div>
                    <div className="fl"><label>نوع الشراكة</label><input value={partnerForm.type} onChange={fldP('type')} placeholder="حكومية، خيرية..."/></div>
                    <div className="fl"><label>اسم المسؤول</label><input value={partnerForm.contact} onChange={fldP('contact')}/></div>
                    <div className="fl"><label>الجوال</label><input type="tel" value={partnerForm.phone} onChange={fldP('phone')}/></div>
                    <div className="fl"><label>البريد</label><input type="email" value={partnerForm.email} onChange={fldP('email')}/></div>
                    <div className="fl"><label>تاريخ الشراكة</label><input type="date" value={partnerForm.startDate} onChange={fldP('startDate')}/></div>
                    <div className="fl full"><label>ملاحظات</label><textarea value={partnerForm.notes} onChange={fldP('notes')} rows={2}/></div>
                  </div>
                </div>
                <div className="fa">
                  <button className="btn btn-p" onClick={savePartner}>💾 حفظ</button>
                  <button className="btn btn-g" onClick={()=>setShowPartnerForm(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FINANCE */}
      {tab==='finance' && (
        <div>
          {!isManager ? (
            <div style={{padding:'40px',textAlign:'center',color:'var(--err)'}}>🔒 المالية متاحة للمدير الرئيسي فقط</div>
          ) : (
            <>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <button className="btn btn-s" onClick={()=>{setIncForm({...EMPTY_INC,date:todayStr()});setIncEditId(null);setShowIncForm(true);}}>➕ إيراد</button>
                <button className="btn btn-w" onClick={()=>{setExpForm({...EMPTY_EXP,date:todayStr()});setExpEditId(null);setShowExpForm(true);}}>➕ مصروف</button>
              </div>
              <div className="stats" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                <div className="sc g"><div className="lb">إجمالي الإيرادات</div><div className="vl" style={{fontSize:'1.2rem'}}>{totalIncome.toLocaleString()} ر</div></div>
                <div className="sc r"><div className="lb">إجمالي المصروفات</div><div className="vl" style={{fontSize:'1.2rem'}}>{totalExpenses.toLocaleString()} ر</div></div>
                <div className={`sc ${totalIncome-totalExpenses>=0?'g':'r'}`}><div className="lb">الصافي</div><div className="vl" style={{fontSize:'1.2rem'}}>{(totalIncome-totalExpenses).toLocaleString()} ر</div></div>
              </div>
              <div className="g2">
                <div className="wg">
                  <div className="wg-h"><h3>💰 الإيرادات</h3></div>
                  <div className="wg-b p0">
                    {income.length===0 ? <div style={{padding:20,textAlign:'center',color:'var(--g4)'}}>لا توجد إيرادات</div> : [...income].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>(
                      <div key={x.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',borderBottom:'1px solid var(--border-color)'}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:'.88rem'}}>{x.desc}</div>
                          <div style={{fontSize:'.72rem',color:'var(--g5)'}}>{INCOME_CATS[x.cat]||x.cat} · {x.date}</div>
                        </div>
                        <span style={{fontWeight:900,color:'var(--ok)'}}>{Number(x.amount).toLocaleString()} ر</span>
                        <button className="btn btn-xs btn-g" onClick={()=>{setIncForm({...x});setIncEditId(x.id);setShowIncForm(true);}}>✏️</button>
                        <button className="btn btn-xs btn-d" onClick={()=>{lsDel('income',x.id);reload();}}>🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="wg">
                  <div className="wg-h"><h3>🧾 المصروفات</h3></div>
                  <div className="wg-b p0">
                    {expenses.length===0 ? <div style={{padding:20,textAlign:'center',color:'var(--g4)'}}>لا توجد مصروفات</div> : [...expenses].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>(
                      <div key={x.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',borderBottom:'1px solid var(--border-color)'}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:'.88rem'}}>{x.desc}</div>
                          <div style={{fontSize:'.72rem',color:'var(--g5)'}}>{EXPENSE_CATS[x.cat]||x.cat} · {x.date}</div>
                        </div>
                        <span style={{fontWeight:900,color:'var(--err)'}}>{Number(x.amount).toLocaleString()} ر</span>
                        <button className="btn btn-xs btn-g" onClick={()=>{setExpForm({...x});setExpEditId(x.id);setShowExpForm(true);}}>✏️</button>
                        <button className="btn btn-xs btn-d" onClick={()=>{lsDel('expenses',x.id);reload();}}>🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Income Form */}
              {showIncForm&&(
                <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowIncForm(false);}}>
                  <div className="mb mb-sm" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                    <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{incEditId?'✏️ تعديل إيراد':'💰 تسجيل إيراد'}</h2></div>
                    <div style={{padding:'18px 20px'}}>
                      <div className="fg c2">
                        <div className="fl full"><label>وصف الإيراد <span className="req">*</span></label><input value={incForm.desc} onChange={fldI('desc')}/></div>
                        <div className="fl"><label>الفئة</label><select value={incForm.cat} onChange={fldI('cat')}>{Object.entries(INCOME_CATS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
                        <div className="fl"><label>المبلغ (ريال) <span className="req">*</span></label><input type="number" value={incForm.amount} onChange={fldI('amount')} min="0"/></div>
                        <div className="fl full"><label>التاريخ <span className="req">*</span></label><input type="date" value={incForm.date} onChange={fldI('date')}/></div>
                        <div className="fl full"><label>ملاحظات</label><textarea value={incForm.notes} onChange={fldI('notes')} rows={2}/></div>
                      </div>
                    </div>
                    <div className="fa"><button className="btn btn-p" onClick={saveInc}>💾 حفظ</button><button className="btn btn-g" onClick={()=>setShowIncForm(false)}>إلغاء</button></div>
                  </div>
                </div>
              )}
              {/* Expense Form */}
              {showExpForm&&(
                <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowExpForm(false);}}>
                  <div className="mb mb-sm" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                    <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{expEditId?'✏️ تعديل مصروف':'🧾 تسجيل مصروف'}</h2></div>
                    <div style={{padding:'18px 20px'}}>
                      <div className="fg c2">
                        <div className="fl full"><label>وصف المصروف <span className="req">*</span></label><input value={expForm.desc} onChange={fldE('desc')}/></div>
                        <div className="fl"><label>الفئة</label><select value={expForm.cat} onChange={fldE('cat')}>{Object.entries(EXPENSE_CATS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
                        <div className="fl"><label>المبلغ (ريال) <span className="req">*</span></label><input type="number" value={expForm.amount} onChange={fldE('amount')} min="0"/></div>
                        <div className="fl full"><label>التاريخ <span className="req">*</span></label><input type="date" value={expForm.date} onChange={fldE('date')}/></div>
                        <div className="fl full"><label>ملاحظات</label><textarea value={expForm.notes} onChange={fldE('notes')} rows={2}/></div>
                      </div>
                    </div>
                    <div className="fa"><button className="btn btn-p" onClick={saveExp}>💾 حفظ</button><button className="btn btn-g" onClick={()=>setShowExpForm(false)}>إلغاء</button></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* DOCS */}
      {tab==='docs' && (
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            {isManager&&<button className="btn btn-p" onClick={()=>{setDocForm({...EMPTY_DOC,date:todayStr()});setDocEditId(null);setShowDocForm(true);}}>➕ إضافة وثيقة</button>}
          </div>
          <div className="tabs">
            {[['all','الكل'],['stats','إحصائية'],['policy','لائحة'],['report','تقرير'],['memo','مذكرة'],['other','أخرى']].map(([v,l])=>(
              <button key={v} className={`tab ${docTab===v?'on':''}`} onClick={()=>setDocTab(v)}>{l}</button>
            ))}
          </div>
          {filteredDocs.length===0 ? <EmptyState icon="📄" title="لا توجد وثائق"/> : filteredDocs.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(d=>(
            <div key={d.id} className="card clickable">
              <div className="av cyan">📄</div>
              <div className="ci">
                <div className="cn">{d.name}</div>
                <div className="cm">{DOC_TYPES[d.type]||'—'} · {d.org||'—'} · {d.date||'—'}</div>
                {d.notes&&<div className="cm">{d.notes}</div>}
              </div>
              <div className="c-badges">
                <span className="bdg b-cy">{DOC_TYPES[d.type]||'—'}</span>
                {d.fileData&&<span className="bdg b-gr">📎 ملف</span>}
                {d.url&&<span className="bdg b-bl">🔗 رابط</span>}
              </div>
              <div className="c-acts">
                {d.url&&<a href={d.url} target="_blank" rel="noreferrer" className="btn btn-xs btn-v">🔗</a>}
                {d.fileData&&<a href={d.fileData} download={d.fileName||'file'} className="btn btn-xs btn-g">📥</a>}
                {isManager&&<button className="btn btn-xs btn-g" onClick={()=>{setDocForm({...d});setDocEditId(d.id);setShowDocForm(true);}}>✏️</button>}
                {isManager&&<button className="btn btn-xs btn-d" onClick={()=>{lsDel('centerDocs',d.id);reload();toast('🗑️ تم الحذف','ok');}}>🗑️</button>}
              </div>
            </div>
          ))}
          {showDocForm&&(
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowDocForm(false);}}>
              <div className="mb" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{docEditId?'✏️ تعديل الوثيقة':'➕ إضافة وثيقة'}</h2></div>
                <div style={{padding:'18px 20px'}}>
                  <div className="fg c2">
                    <div className="fl full"><label>اسم الوثيقة <span className="req">*</span></label><input value={docForm.name} onChange={fldD('name')}/></div>
                    <div className="fl"><label>نوع الوثيقة</label><select value={docForm.type} onChange={fldD('type')}>{Object.entries(DOC_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
                    <div className="fl"><label>التاريخ</label><input type="date" value={docForm.date} onChange={fldD('date')}/></div>
                    <div className="fl full"><label>الجهة</label><input value={docForm.org} onChange={fldD('org')} placeholder="وزارة التنمية الاجتماعية..."/></div>
                    <div className="fl full"><label>رابط الوثيقة</label><input type="url" value={docForm.url} onChange={fldD('url')} placeholder="https://..."/></div>
                    <div className="fl full">
                      <label>رفع ملف (PDF / صورة)</label>
                      <div onClick={()=>document.getElementById('doc-file-inp').click()} style={{border:'2px dashed var(--g3)',borderRadius:8,padding:16,textAlign:'center',cursor:'pointer',color:'var(--g5)'}}>
                        {docForm.fileName ? <span style={{color:'var(--ok)'}}>{docForm.fileName} ✅</span> : <><div style={{fontSize:'1.5rem'}}>📎</div><div style={{fontSize:'.8rem',marginTop:4}}>اضغط لرفع ملف</div></>}
                      </div>
                      <input id="doc-file-inp" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{display:'none'}} onChange={handleDocFile}/>
                    </div>
                    <div className="fl full"><label>ملاحظات</label><textarea value={docForm.notes} onChange={fldD('notes')} rows={2}/></div>
                  </div>
                </div>
                <div className="fa"><button className="btn btn-p" onClick={saveDoc}>💾 حفظ</button><button className="btn btn-g" onClick={()=>setShowDocForm(false)}>إلغاء</button></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CUSTODY */}
      {tab==='custody' && (
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            {isManager&&<button className="btn btn-p" onClick={()=>{setCustodyForm({...EMPTY_CUSTODY});setCustodyEditId(null);setShowCustodyForm(true);}}>➕ إضافة عهدة</button>}
          </div>
          <div className="stats" style={{gridTemplateColumns:'repeat(2,1fr)'}}>
            <div className="sc"><div className="lb">إجمالي العهدة</div><div className="vl">{custody.length}</div><div className="sb">صنف</div></div>
            <div className="sc g"><div className="lb">الكمية الإجمالية</div><div className="vl">{custody.reduce((s,x)=>s+(Number(x.quantity)||0),0)}</div></div>
          </div>
          {custody.length===0 ? <EmptyState icon="🗄️" title="لا توجد عهد مسجلة"/> : custody.map(c=>(
            <div key={c.id} className="card">
              <div className="av">🗄️</div>
              <div className="ci">
                <div className="cn">{c.name}</div>
                <div className="cm">{c.category&&c.category+' · '}الكمية: {c.quantity} · {c.location&&c.location+' · '}{c.condition}</div>
              </div>
              <div className="c-acts">
                {isManager&&<button className="btn btn-xs btn-g" onClick={()=>{setCustodyForm({...c});setCustodyEditId(c.id);setShowCustodyForm(true);}}>✏️</button>}
                {isManager&&<button className="btn btn-xs btn-d" onClick={()=>{lsDel('custody',c.id);reload();toast('🗑️','ok');}}>🗑️</button>}
              </div>
            </div>
          ))}
          {showCustodyForm&&(
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowCustodyForm(false);}}>
              <div className="mb mb-sm" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{custodyEditId?'✏️ تعديل العهدة':'🗄️ إضافة عهدة'}</h2></div>
                <div style={{padding:'18px 20px'}}>
                  <div className="fg c2">
                    <div className="fl full"><label>اسم الصنف <span className="req">*</span></label><input value={custodyForm.name} onChange={fldC('name')}/></div>
                    <div className="fl"><label>الفئة</label><input value={custodyForm.category} onChange={fldC('category')} placeholder="أجهزة، أثاث..."/></div>
                    <div className="fl"><label>الكمية</label><input type="number" value={custodyForm.quantity} onChange={fldC('quantity')} min="1"/></div>
                    <div className="fl"><label>الموقع</label><input value={custodyForm.location} onChange={fldC('location')} placeholder="مستودع، قاعة..."/></div>
                    <div className="fl"><label>الحالة</label><select value={custodyForm.condition} onChange={fldC('condition')}><option>جيد</option><option>مقبول</option><option>يحتاج صيانة</option><option>معطل</option></select></div>
                    <div className="fl full"><label>ملاحظات</label><textarea value={custodyForm.notes} onChange={fldC('notes')} rows={2}/></div>
                  </div>
                </div>
                <div className="fa"><button className="btn btn-p" onClick={saveCustody}>💾 حفظ</button><button className="btn btn-g" onClick={()=>setShowCustodyForm(false)}>إلغاء</button></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISITS */}
      {tab==='visits' && (
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            {isManager&&<button className="btn btn-p" onClick={()=>{setVisitForm({...EMPTY_VISIT,date:todayStr()});setVisitEditId(null);setShowVisitForm(true);}}>➕ تسجيل زيارة</button>}
          </div>
          {visits.length===0 ? <EmptyState icon="🏛️" title="لا توجد زيارات مسجلة"/> : visits.sort((a,b)=>b.date.localeCompare(a.date)).map(v=>(
            <div key={v.id} className="card">
              <div className="av pur">🏛️</div>
              <div className="ci">
                <div className="cn">{v.name}</div>
                <div className="cm">{v.date} · {v.type&&v.type+' · '}{v.purpose}</div>
                {v.result&&<div className="cm">النتيجة: {v.result}</div>}
              </div>
              <div className="c-acts">
                {isManager&&<button className="btn btn-xs btn-g" onClick={()=>{setVisitForm({...v});setVisitEditId(v.id);setShowVisitForm(true);}}>✏️</button>}
                {isManager&&<button className="btn btn-xs btn-d" onClick={()=>{lsDel('centerVisits',v.id);reload();toast('🗑️','ok');}}>🗑️</button>}
              </div>
            </div>
          ))}
          {showVisitForm&&(
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowVisitForm(false);}}>
              <div className="mb" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{visitEditId?'✏️ تعديل الزيارة':'🏛️ تسجيل زيارة'}</h2></div>
                <div style={{padding:'18px 20px'}}>
                  <div className="fg c2">
                    <div className="fl full"><label>جهة الزيارة <span className="req">*</span></label><input value={visitForm.name} onChange={fldV('name')}/></div>
                    <div className="fl"><label>التاريخ <span className="req">*</span></label><input type="date" value={visitForm.date} onChange={fldV('date')}/></div>
                    <div className="fl"><label>نوع الزيارة</label><select value={visitForm.type} onChange={fldV('type')}><option value="">--</option><option>تفتيشية</option><option>إشرافية</option><option>دعم وتطوير</option><option>متابعة</option><option>أخرى</option></select></div>
                    <div className="fl full"><label>الوفد</label><input value={visitForm.delegation} onChange={fldV('delegation')} placeholder="اسم المندوب / الوفد..."/></div>
                    <div className="fl full"><label>الغرض</label><textarea value={visitForm.purpose} onChange={fldV('purpose')} rows={2}/></div>
                    <div className="fl full"><label>نتيجة / توصيات</label><textarea value={visitForm.result} onChange={fldV('result')} rows={2}/></div>
                    <div className="fl full"><label>ملاحظات</label><textarea value={visitForm.notes} onChange={fldV('notes')} rows={2}/></div>
                  </div>
                </div>
                <div className="fa"><button className="btn btn-p" onClick={saveVisit}>💾 حفظ</button><button className="btn btn-g" onClick={()=>setShowVisitForm(false)}>إلغاء</button></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
