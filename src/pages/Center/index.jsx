import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { todayStr, uid } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import EmptyState from '../../components/ui/EmptyState';
import { handleFileInputChange } from '../../utils/fileUpload';
import AttachmentField from '../../components/ui/AttachmentField';
import { CUSTODY_CATEGORIES } from '../../utils/custodyCategories';
import { getCurrencySymbol } from '../../utils/constants';

const DOC_TYPES = { stats:'إحصائية وزارية', policy:'لائحة / سياسة', report:'تقرير', strategy:'استراتيجية', circular:'تعميم', memo:'📝 مذكرة داخلية', other:'أخرى' };
const EXPENSE_CATS = { salary:'رواتب', rent:'إيجار', utilities:'فواتير', supplies:'مستلزمات', maintenance:'صيانة', training:'تدريب', other:'أخرى' };
const INCOME_CATS = { fees:'رسوم طلاب', donation:'تبرعات', grant:'منح', other:'أخرى' };
const FINANCE_CATEGORIES = [
  { id:'1', label:'1- رسوم الطلاب', type:'income', items:['رسوم التسجيل','رسوم القبول','الرسوم الدراسية السنوية','الرسوم الفصلية','رسوم إعادة التسجيل','رسوم الملف','رسوم اختبار تحديد المستوى','رسوم الاختبارات النهائية','رسوم الشهادات','رسوم التخرج','رسوم تأخير السداد','رسوم إعادة الاختبار','رسوم إعادة المادة','رسوم الحضور الجزئي','رسوم التعليم الإلكتروني'] },
  { id:'2', label:'2- إيرادات الخدمات', type:'income', items:['رسوم الباص / النقل المدرسي','اشتراك الباص الشهري','رسوم تغيير خط الباص','رسوم الرحلات','رسوم الأنشطة','رسوم النوادي','رسوم السوبر ماركت (المقصف)','رسوم الوجبات','رسوم الكتب','رسوم الزي المدرسي','رسوم الأدوات التعليمية','رسوم المختبرات','رسوم الطباعة والتصوير','رسوم المنصات الإلكترونية','رسوم الدورات الإضافية','رسوم التقوية','رسوم التدريب الصيفي'] },
  { id:'3', label:'3- إيرادات أخرى', type:'income', items:['تبرعات','رعايات شركات','دعم حكومي','تأجير القاعات','تأجير الملاعب','تأجير الباصات','بيع الكتب','بيع الزي','أرباح السوبر ماركت (المقصف)','أرباح الفعاليات','غرامات التأخير','غرامات التلفيات'] },
  { id:'4', label:'4- الرواتب والأجور', type:'expense', items:['رواتب الموظفين','رواتب المعلمين','رواتب الإداريين','رواتب المديرين','رواتب المحاسبين','رواتب موظفي القبول والتسجيل','رواتب موظفي خدمة العملاء','رواتب المشرفين','رواتب الأمن','رواتب العمال','رواتب السائقين','رواتب المراسلين','رواتب عمال النظافة','رواتب فنيي الحاسب','رواتب فنيي المختبر','رواتب الممرضات','رواتب مسؤولي الباصات'] },
  { id:'5', label:'5- البدلات والمزايا', type:'expense', items:['بدل سكن','بدل نقل','بدل طبيعة عمل','بدل هاتف','بدل طعام','بدل إشراف','بدل ساعات إضافية','بدل انتداب','بدل تذاكر سفر','التأمين الطبي','التأمينات الاجتماعية','مكافآت الأداء','مكافآت نهاية العام','عمولات التسجيل','مكافآت الطلاب المتفوقين','نهاية الخدمة'] },
  { id:'6', label:'6- مصروفات الباصات والنقل', type:'expense', items:['مصروفات تشغيل الباص','رواتب السائقين','رواتب المشرفات','وقود الباصات','ديزل','بترول','صيانة الباصات','غيار الزيت','الإطارات','البطاريات','قطع الغيار','غسيل الباصات','تجديد الاستمارات','التأمين على الباصات','مخالفات المرور','أجهزة التتبع GPS','رسوم المواقف','عقود النقل الخارجي','إيجار الباصات','استهلاك الباصات'] },
  { id:'7', label:'7- المصروفات التعليمية', type:'expense', items:['شراء الكتب','المناهج','الوسائل التعليمية','السبورات الذكية','أجهزة العرض','الطابعات','الأحبار','الأوراق','المختبرات','الأدوات العلمية','اشتراكات البرامج التعليمية','اشتراكات Zoom / Teams','تراخيص البرامج','الإنترنت','السيرفرات','الصيانة التقنية','أجهزة الكمبيوتر','أجهزة التابلت'] },
  { id:'8', label:'8- المصروفات الإدارية والتشغيلية', type:'expense', items:['المبنى والمرافق','إيجار المبنى','إيجار الفصول','الكهرباء','الماء','الغاز','الإنترنت','الهاتف','رسوم البلدية','رسوم الدفاع المدني','رسوم التراخيص','رسوم وزارة التعليم','رسوم الغرفة التجارية','النظافة','التعقيم','مكافحة الحشرات','الأمن والحراسة','الصيانة العامة','صيانة التكييف','صيانة المصاعد','صيانة الكهرباء','صيانة السباكة','صيانة الأثاث','الأدوات المكتبية','القرطاسية','الملفات','الأحبار','أجهزة البصمة','الكاميرات','أنظمة الحضور والانصراف','أنظمة ERP','أنظمة المحاسبة'] },
  { id:'9', label:'9- التسويق والعلاقات العامة', type:'expense', items:['إعلانات السوشيال ميديا','تصميم الجرافيك','إدارة الحسابات','تصوير الفيديو','تصوير المناسبات','الهدايا الدعائية','البنرات','اللوحات الإعلانية','الحملات التسويقية','العمولات التسويقية','المعارض التعليمية','رعاية الفعاليات'] },
  { id:'10', label:'10- المصروفات الطلابية والأنشطة', type:'expense', items:['الرحلات','المسابقات','الحفلات','الأنشطة الرياضية','الأنشطة الفنية','الجوائز','الشهادات','الضيافة','الزي الرياضي','أدوات النشاط'] },
  { id:'11', label:'11- الأصول والمشتريات والبنود المحاسبية والمالية', type:'expense', items:['شراء باصات','شراء سيارات','شراء أثاث','شراء مكاتب','شراء كراسي','شراء تكييفات','شراء كاميرات','شراء أجهزة كمبيوتر','شراء شاشات','إنشاء ملاعب','إنشاء مختبرات','تجهيز الفصول','أعمال الديكور','التوسعات','الذمم المدينة','أقساط الطلاب المستحقة','شيكات آجلة','ديون العملاء','مستحقات النقل','الذمم الدائنة','الموردون','فواتير غير مدفوعة','عقود الصيانة'] },
  { id:'12', label:'12- الضرائب والالتزامات والمخصصات والتقارير', type:'expense', items:['ضريبة القيمة المضافة','ضريبة الرواتب','الزكاة (في الخليج)','التأمينات الاجتماعية','رسوم الإقامة','رسوم تجديد الإقامات','رسوم التأشيرات','مخصص نهاية الخدمة','مخصص الديون المشكوك فيها','مخصص الصيانة','مخصص الإجازات','الميزانية العمومية','قائمة الدخل','التدفقات النقدية','كشف الرواتب','تقرير الباصات','تقرير المتأخرات','تقرير المصروفات','تقرير الإيرادات','تقرير الأرباح والخسائر','تقرير أعمار الديون','ميزانية تشغيل المدرسة','ميزانية الأنشطة','ميزانية النقل'] }
];
const EMPTY_FINANCE = { type:'income', categoryId:'1', categoryLabel:'1- رسوم الطلاب', itemType:'رسوم التسجيل', itemTypeOther:'', desc:'', amount:'', date:'', notes:'', fileData:'', fileName:'' };

const EMPTY_DOC = { name:'', type:'stats', date:'', org:'', url:'', notes:'', fileData:'', fileName:'', audience:['all'] };
const EMPTY_EXP = { desc:'', cat:'salary', amount:'', date:'', notes:'' };
const EMPTY_INC = { desc:'', cat:'fees', amount:'', date:'', notes:'' };
const EMPTY_PARTNER = { name:'', type:'', contact:'', phone:'', email:'', startDate:'', notes:'', fileData:'', fileName:'' };
const EMPTY_CUSTODY = { name:'', category:'أجهزة إلكترونية', quantity:1, location:'', condition:'جيد', notes:'', fileData:'', fileName:'' };
const EMPTY_VISIT = { name:'', date:'', type:'', delegation:'', purpose:'', result:'', notes:'', fileData:'', fileName:'' };
const EMPTY_PARENT_LOG = { parentKey:'', type:'visit', date:'', notes:'', fileData:'', fileName:'' };
const EMPTY_BUS = { busNumber:'', driverPhone:'', route:'', notes:'', studentIds:[], fileData:'', fileName:'' };
const PARENT_TYPE_LABEL = { visit:'زيارة', call:'مكالمة', guidance:'جلسة إرشادية' };

function extractParents(students) {
  const map = new Map();
  students.forEach(s => {
    const name = (s.parentName || '').trim();
    const phone = (s.parentPhone || '').trim();
    if (!name && !phone) return;
    const key = `${phone}__${name}`;
    if (!map.has(key)) map.set(key, { key, name, phone, studentIds: [] });
    if (!map.get(key).studentIds.includes(s.id)) map.get(key).studentIds.push(s.id);
  });
  return [...map.values()].sort((a, b) => (a.name || a.phone).localeCompare(b.name || b.phone, 'ar'));
}

export default function CenterPage() {
  const { toast, currentUser, go, activeView, center } = useApp();
  const centerData = center || lsGet('center') || {};
  const [tab, setTab] = useState('partners');
  const isManager = currentUser?.role === 'manager';
  const canView = ['manager','vice'].includes(currentUser?.role);
  
  // Finance protection
  const [financePassword, setFinancePassword] = useState(
    localStorage.getItem('financePassword') || null
  );
  const [financePwInput, setFinancePwInput] = useState('');
  const [reportType, setReportType] = useState('monthly');
  const [showFinanceProtect, setShowFinanceProtect] = useState(false);
  const [viewPartner, setViewPartner] = useState(null);
  const [selParent, setSelParent] = useState(null);
  const [showParentLogForm, setShowParentLogForm] = useState(false);
  const [parentLogForm, setParentLogForm] = useState(EMPTY_PARENT_LOG);

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
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [financeForm, setFinanceForm] = useState(EMPTY_FINANCE);
  const [financeEditId, setFinanceEditId] = useState(null);
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
  const [students, setStudents] = useState([]);
  const [parentLogs, setParentLogs] = useState([]);
  const [buses, setBuses] = useState([]);
  const [showBusForm, setShowBusForm] = useState(false);
  const [busForm, setBusForm] = useState(EMPTY_BUS);
  const [busEditId, setBusEditId] = useState(null);

  function reload() {
    setDocs(lsGet('centerDocs'));
    setExpenses(lsGet('expenses'));
    setIncome(lsGet('income'));
    setPartners(lsGet('partners'));
    setCustody(lsGet('custody'));
    setVisits(lsGet('centerVisits'));
    setStudents(lsGet('students'));
    setParentLogs(lsGet('parentInteractions'));
    setBuses(lsGet('buses'));
  }
  useEffect(() => { reload(); }, []);
  useEffect(() => {
    if (activeView !== 'center') return;
    const t = sessionStorage.getItem('scs_center_tab');
    if (t) { setTab(t); sessionStorage.removeItem('scs_center_tab'); }
  }, [activeView]);

  function openSalaries() {
    sessionStorage.setItem('scs_center_tab', 'finance');
    go('hr-salary');
  }

  const fldD = k => e => setDocForm(f=>({...f,[k]:e.target.value}));
  const fldE = k => e => setExpForm(f=>({...f,[k]:e.target.value}));
  const fldI = k => e => setIncForm(f=>({...f,[k]:e.target.value}));
  const fldP = k => e => setPartnerForm(f=>({...f,[k]:e.target.value}));
  const fldC = k => e => setCustodyForm(f=>({...f,[k]:e.target.value}));
  const fldV = k => e => setVisitForm(f=>({...f,[k]:e.target.value}));
  const fldPL = k => e => setParentLogForm(f=>({...f,[k]:e.target.value}));
  const fldB = k => e => setBusForm(f=>({...f,[k]:e.target.value}));

  function verifyFinancePassword() {
    if (financePwInput === financePassword) {
      setShowFinanceProtect(false);
      toast('✅ تم التحقق','ok');
    } else {
      toast('❌ كلمة السر غير صحيحة','er');
    }
  }

  function saveParentLog() {
    if (!parentLogForm.parentKey || !parentLogForm.date) { toast('⚠️ أكمل البيانات','er'); return; }
    lsAdd('parentInteractions', { ...parentLogForm, id: uid() });
    toast('✅ تم التسجيل','ok');
    setShowParentLogForm(false);
    const updatedLogs = lsGet('parentInteractions');
    setParentLogs(updatedLogs);
  }

  function toggleBusStudent(id) {
    setBusForm(f => {
      const p = f.studentIds || [];
      return { ...f, studentIds: p.includes(id) ? p.filter(x => x !== id) : [...p, id] };
    });
  }
  function saveBus() {
    if (!busForm.busNumber.trim()) { toast('⚠️ أدخل رقم الباص','er'); return; }
    if (busEditId) lsUpd('buses', busEditId, { ...busForm, studentIds: busForm.studentIds || [] });
    else lsAdd('buses', { ...busForm, id: uid(), studentIds: busForm.studentIds || [] });
    toast('✅ تم الحفظ','ok'); setShowBusForm(false); reload();
  }
  function delBus(id) { if(!window.confirm('حذف هذا الباص؟'))return; lsDel('buses',id); reload(); toast('🗑️','ok'); }

  // Docs
  function saveDoc() {
    if (!docForm.name.trim()) { toast('⚠️ أدخل اسم الوثيقة','er'); return; }
    if (docEditId) lsUpd('centerDocs',docEditId,docForm); else lsAdd('centerDocs',{...docForm,id:uid()});
    toast('✅ تم حفظ الوثيقة','ok'); setShowDocForm(false); reload();
  }
  async function handleDocFile(e) {
    try {
      const res = await handleFileInputChange(e, { allowPdf: true, allowDoc: true });
      if (res) setDocForm(fm => ({ ...fm, fileData: res.data, fileName: res.name }));
    } catch (ex) {
      toast('⚠️ ' + (ex.i18nKey === 'file.tooLarge' ? 'حجم الملف يتجاوز 2 ميجابايت' : 'نوع الملف غير مدعوم'), 'er');
    }
  }

  // Finance
  function saveExp() {
    const presetDesc = expForm.itemType === 'أخرى' ? (expForm.itemTypeOther || '').trim() : expForm.itemType;
    const finalDesc = (expForm.desc || '').trim() || presetDesc;
    if (!finalDesc || !expForm.amount || !expForm.date) { toast('⚠️ أكمل الحقول المطلوبة','er'); return; }
    const payload = { ...expForm, desc: finalDesc };
    if (expEditId) lsUpd('expenses',expEditId,payload); else lsAdd('expenses',{...payload,id:uid()});
    toast('✅ تم حفظ المصروف','ok'); setShowExpForm(false); reload();
  }
  function saveInc() {
    const presetDesc = incForm.itemType === 'أخرى' ? (incForm.itemTypeOther || '').trim() : incForm.itemType;
    const finalDesc = (incForm.desc || '').trim() || presetDesc;
    if (!finalDesc || !incForm.amount || !incForm.date) { toast('⚠️ أكمل الحقول المطلوبة','er'); return; }
    const payload = { ...incForm, desc: finalDesc };
    if (incEditId) lsUpd('income',incEditId,payload); else lsAdd('income',{...payload,id:uid()});
    toast('✅ تم حفظ الإيراد','ok'); setShowIncForm(false); reload();
  }
  function openFinanceByCategory(categoryId) {
    const cat = FINANCE_CATEGORIES.find(x => x.id === String(categoryId));
    if (!cat) return;
    setFinanceForm({
      ...EMPTY_FINANCE,
      type: cat.type,
      categoryId: cat.id,
      categoryLabel: cat.label,
      itemType: cat.items[0] || 'أخرى',
      date: todayStr()
    });
    setFinanceEditId(null);
    setShowFinanceForm(true);
  }
  function openFinanceOther() {
    setFinanceForm({
      ...EMPTY_FINANCE,
      type: 'income',
      categoryId: '13',
      categoryLabel: '13- أخرى',
      itemType: 'أخرى',
      date: todayStr()
    });
    setFinanceEditId(null);
    setShowFinanceForm(true);
  }
  function editFinanceEntry(entry, type) {
    setFinanceForm({
      ...EMPTY_FINANCE,
      ...entry,
      type,
      categoryId: entry.categoryId || '13',
      categoryLabel: entry.categoryLabel || '13- أخرى',
      itemType: entry.itemType || entry.desc || 'أخرى',
      itemTypeOther: entry.itemTypeOther || ''
    });
    setFinanceEditId(entry.id);
    setShowFinanceForm(true);
  }
  async function handleFinanceFile(e) {
    try {
      const res = await handleFileInputChange(e, { allowPdf: true });
      if (res) setFinanceForm(v => ({ ...v, fileData: res.data, fileName: res.name }));
    } catch (ex) {
      toast('⚠️ ' + (ex.i18nKey === 'file.tooLarge' ? 'حجم الملف يتجاوز 2 ميجابايت' : 'نوع الملف غير مدعوم'), 'er');
    }
  }
  function saveFinanceEntry() {
    const itemFromList = financeForm.itemType === 'أخرى' ? (financeForm.itemTypeOther || '').trim() : financeForm.itemType;
    const finalDesc = (financeForm.desc || '').trim() || itemFromList;
    if (!finalDesc || !financeForm.amount || !financeForm.date) { toast('⚠️ أكمل الحقول المطلوبة','er'); return; }
    const payload = {
      ...financeForm,
      desc: finalDesc,
      cat: financeForm.type === 'income' ? 'fees' : 'other'
    };
    if (financeForm.type === 'income') {
      if (financeEditId && income.find(x => x.id === financeEditId)) lsUpd('income', financeEditId, payload);
      else lsAdd('income', { ...payload, id: uid() });
    } else {
      if (financeEditId && expenses.find(x => x.id === financeEditId)) lsUpd('expenses', financeEditId, payload);
      else lsAdd('expenses', { ...payload, id: uid() });
    }
    toast('✅ تم حفظ الحركة المالية','ok');
    setShowFinanceForm(false);
    reload();
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
  const currSym = getCurrencySymbol(centerData.currency);

  return (
    <div>
      <div className="ph">
        <div className="ph-t"><h2>🏢 إدارة المركز</h2><p>الشراكات والمالية والوثائق وأولياء الأمور والنقل والعهدة</p></div>
      </div>
      <div className="tabs" style={{ flexWrap:'wrap' }}>
        {[['partners','🤝 الشراكات'],['finance','💳 المالية'],['parents','👨‍👩‍👧 أولياء الأمور'],['bus','🚌 خدمة الباص'],['docs','📄 الوثائق'],['custody','🗄️ العهدة'],['visits','🏛️ الزيارات']].map(([v,l])=>(
          <button key={v} type="button" className={`tab ${tab===v?'on':''}`} onClick={()=>setTab(v)}>{l}</button>
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
            <div key={p.id} className="card clickable" onClick={()=>setViewPartner(p)}>
              <div className="av cyan">🤝</div>
              <div className="ci">
                <div className="cn">{p.name}</div>
                <div className="cm">{p.type&&p.type+' · '}{p.contact&&p.contact}{p.phone&&' · '+p.phone}</div>
              </div>
              <div className="c-acts" onClick={ev=>ev.stopPropagation()}>
                {p.phone&&<a href={`https://wa.me/${p.phone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-bl">💬</a>}
                <button className="btn btn-xs btn-bl" onClick={()=>printItem(p,'partnership',centerData.logo,centerData.name)}>🖨️</button>
                {isManager&&<button className="btn btn-xs btn-g" onClick={()=>{setPartnerForm({...p});setPartnerEditId(p.id);setShowPartnerForm(true);}}>✏️</button>}
                {isManager&&<button className="btn btn-xs btn-d" onClick={()=>{lsDel('partners',p.id);reload();toast('🗑️ تم الحذف','ok');}}>🗑️</button>}
              </div>
            </div>
          ))}

          {/* Partner Detail View Modal */}
          {viewPartner && (
            <div className="mbg" onClick={e=>e.target===e.currentTarget && setViewPartner(null)}>
              <div className="mb mb-large" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                <div className="fhd" style={{padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <h2>🤝 {viewPartner.name}</h2>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-g btn-sm" onClick={()=>printItem(viewPartner,'partnership',centerData.logo,centerData.name)}>🖨️ طباعة</button>
                    <button className="btn btn-g btn-sm" onClick={()=>setViewPartner(null)}>✕</button>
                  </div>
                </div>
                <div className="modal-body-scroll" style={{padding:'18px 20px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                    <div style={{background:'var(--g0)',borderRadius:8,padding:'10px 14px'}}>
                      <div style={{fontSize:'.72rem',color:'var(--g5)',marginBottom:2}}>النوع</div>
                      <div style={{fontWeight:700}}>{viewPartner.type || '—'}</div>
                    </div>
                    <div style={{background:'var(--g0)',borderRadius:8,padding:'10px 14px'}}>
                      <div style={{fontSize:'.72rem',color:'var(--g5)',marginBottom:2}}>جهة الاتصال</div>
                      <div style={{fontWeight:700}}>{viewPartner.contact || '—'}</div>
                    </div>
                    {viewPartner.phone && (
                      <div style={{background:'var(--g0)',borderRadius:8,padding:'10px 14px',gridColumn:'1/-1'}}>
                        <div style={{fontSize:'.72rem',color:'var(--g5)',marginBottom:2}}>الهاتف</div>
                        <div style={{fontWeight:700,direction:'ltr'}}>{viewPartner.phone}</div>
                      </div>
                    )}
                    {viewPartner.email && (
                      <div style={{background:'var(--g0)',borderRadius:8,padding:'10px 14px',gridColumn:'1/-1'}}>
                        <div style={{fontSize:'.72rem',color:'var(--g5)',marginBottom:2}}>الإيميل</div>
                        <div style={{fontWeight:700,direction:'ltr'}}>{viewPartner.email}</div>
                      </div>
                    )}
                    {viewPartner.startDate && (
                      <div style={{background:'var(--g0)',borderRadius:8,padding:'10px 14px',gridColumn:'1/-1'}}>
                        <div style={{fontSize:'.72rem',color:'var(--g5)',marginBottom:2}}>تاريخ البدء</div>
                        <div style={{fontWeight:700}}>{viewPartner.startDate}</div>
                      </div>
                    )}
                  </div>
                  {viewPartner.notes && (
                    <div style={{padding:'12px',background:'var(--pr-l)',borderRadius:8}}>
                      <div style={{fontSize:'.78rem',color:'var(--pr)',fontWeight:700,marginBottom:4}}>📝 الملاحظات</div>
                      <div style={{fontSize:'.86rem'}}>{viewPartner.notes}</div>
                    </div>
                  )}
                </div>
                <div className="fa">
                  {isManager && (
                    <button className="btn btn-p" onClick={()=>{
                      setPartnerForm({...viewPartner});
                      setPartnerEditId(viewPartner.id);
                      setShowPartnerForm(true);
                      setViewPartner(null);
                    }}>✏️ تعديل</button>
                  )}
                  <button className="btn btn-g" onClick={()=>setViewPartner(null)}>إغلاق</button>
                </div>
              </div>
            </div>
          )}

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
                    <AttachmentField
                      fileData={partnerForm.fileData}
                      fileName={partnerForm.fileName}
                      onAttach={(data, name) => setPartnerForm(f => ({ ...f, fileData: data, fileName: name }))}
                      onError={msg => toast('⚠️ ' + msg, 'er')}
                    />
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
              <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                <button type="button" className="btn btn-bl" onClick={openFinanceOther}>➕ الإيرادات والمصاريف</button>
                {FINANCE_CATEGORIES.map(cat=>(
                  <button key={cat.id} type="button" className="btn btn-s" onClick={()=>openFinanceByCategory(cat.id)}>{cat.label}</button>
                ))}
                <button type="button" className="btn btn-g btn-sm no-print" onClick={()=>window.print()} style={{marginRight:'auto'}}>🖨️ طباعة</button>
              </div>
              <div className="stats" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                <div className="sc g"><div className="lb">إجمالي الإيرادات</div><div className="vl" style={{fontSize:'1.2rem'}}>{totalIncome.toLocaleString()} {currSym}</div></div>
                <div className="sc r"><div className="lb">إجمالي المصروفات</div><div className="vl" style={{fontSize:'1.2rem'}}>{totalExpenses.toLocaleString()} {currSym}</div></div>
                <div className={`sc ${totalIncome-totalExpenses>=0?'g':'r'}`}><div className="lb">الصافي</div><div className="vl" style={{fontSize:'1.2rem'}}>{(totalIncome-totalExpenses).toLocaleString()} {currSym}</div></div>
              </div>
              <div className="g2">
                <div className="wg">
                  <div className="wg-h"><h3>💰 الإيرادات</h3></div>
                  <div className="wg-b p0">
                    {income.length===0 ? <div style={{padding:20,textAlign:'center',color:'var(--g4)'}}>لا توجد إيرادات</div> : [...income].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>(
                      <div key={x.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',borderBottom:'1px solid var(--border-color)'}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:'.88rem'}}>{x.desc}</div>
                          <div style={{fontSize:'.72rem',color:'var(--g5)'}}>{x.categoryLabel || INCOME_CATS[x.cat]||x.cat} · {x.date}</div>
                        </div>
                        <span style={{fontWeight:900,color:'var(--ok)'}}>{Number(x.amount).toLocaleString()} {currSym}</span>
                        {x.fileData&&<a href={x.fileData} download={x.fileName||'finance-file'} className="btn btn-xs btn-v">📎</a>}
                        <button className="btn btn-xs btn-bl" onClick={()=>printItem({ ...x, type:'income', currency: centerData.currency },'finance',centerData.logo,centerData.name)}>🖨️</button>
                        <button className="btn btn-xs btn-g" onClick={()=>editFinanceEntry(x,'income')}>✏️</button>
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
                          <div style={{fontSize:'.72rem',color:'var(--g5)'}}>{x.categoryLabel || EXPENSE_CATS[x.cat]||x.cat} · {x.date}</div>
                        </div>
                        <span style={{fontWeight:900,color:'var(--err)'}}>{Number(x.amount).toLocaleString()} {currSym}</span>
                        {x.fileData&&<a href={x.fileData} download={x.fileName||'finance-file'} className="btn btn-xs btn-v">📎</a>}
                        <button className="btn btn-xs btn-bl" onClick={()=>printItem({ ...x, type:'expense', currency: centerData.currency },'finance',centerData.logo,centerData.name)}>🖨️</button>
                        <button className="btn btn-xs btn-g" onClick={()=>editFinanceEntry(x,'expense')}>✏️</button>
                        <button className="btn btn-xs btn-d" onClick={()=>{lsDel('expenses',x.id);reload();}}>🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Unified Finance Form */}
              {showFinanceForm&&(
                <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowFinanceForm(false);}}>
                  <div className="mb mb-sm" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                    <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{financeEditId?'✏️ تعديل حركة مالية':'💳 تسجيل حركة مالية'}</h2></div>
                    <div className="modal-body-scroll" style={{padding:'18px 20px'}}>
                      <div className="fg c2">
                        <div className="fl"><label>نوع الحركة</label>
                          <select value={financeForm.type} onChange={e=>setFinanceForm(f=>({...f,type:e.target.value}))}>
                            <option value="income">إيراد</option>
                            <option value="expense">مصروف</option>
                          </select>
                        </div>
                        <div className="fl"><label>الفئة</label>
                          <select value={financeForm.categoryId} onChange={e=>{
                            const cat = FINANCE_CATEGORIES.find(c=>c.id===e.target.value);
                            setFinanceForm(f=>({
                              ...f,
                              categoryId: e.target.value,
                              categoryLabel: cat?.label || '13- أخرى',
                              type: e.target.value==='13' ? f.type : (cat?.type || f.type),
                              itemType: cat?.items?.[0] || 'أخرى',
                              itemTypeOther:'',
                              desc:''
                            }));
                          }}>
                            {FINANCE_CATEGORIES.map(cat=><option key={cat.id} value={cat.id}>{cat.label}</option>)}
                            <option value="13">13- أخرى</option>
                          </select>
                        </div>
                        <div className="fl">
                          <label>البند الثابت</label>
                          <select value={financeForm.itemType || 'أخرى'} onChange={e=>setFinanceForm(f=>({...f,itemType:e.target.value,desc:e.target.value==='أخرى'?'':(e.target.value||'')}))}>
                            {((FINANCE_CATEGORIES.find(c=>c.id===financeForm.categoryId)?.items) || []).map(opt=><option key={opt} value={opt}>{opt}</option>)}
                            <option value="أخرى">أخرى</option>
                          </select>
                        </div>
                        {financeForm.itemType==='أخرى' && (
                          <div className="fl full">
                            <label>أخرى (يدوي) <span className="req">*</span></label>
                            <input value={financeForm.itemTypeOther || ''} onChange={e=>setFinanceForm(f=>({...f,itemTypeOther:e.target.value,desc:e.target.value}))} placeholder="اكتب البند هنا..."/>
                          </div>
                        )}
                        <div className="fl full"><label>الوصف <span className="req">*</span></label><input value={financeForm.desc} onChange={e=>setFinanceForm(f=>({...f,desc:e.target.value}))} placeholder="يُملأ تلقائيًا من القائمة ويمكن تعديله"/></div>
                        <div className="fl"><label>المبلغ ({currSym}) <span className="req">*</span></label><input type="number" value={financeForm.amount} onChange={e=>setFinanceForm(f=>({...f,amount:e.target.value}))} min="0"/></div>
                        <div className="fl full"><label>التاريخ <span className="req">*</span></label><input type="date" value={financeForm.date} onChange={e=>setFinanceForm(f=>({...f,date:e.target.value}))}/></div>
                        <div className="fl full">
                          <label>رفع صورة / PDF</label>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFinanceFile}/>
                          {financeForm.fileName && <div style={{fontSize:'.78rem',marginTop:6,color:'var(--ok)'}}>📎 {financeForm.fileName}</div>}
                        </div>
                        <div className="fl full"><label>ملاحظات</label><textarea value={financeForm.notes} onChange={e=>setFinanceForm(f=>({...f,notes:e.target.value}))} rows={2}/></div>
                      </div>
                    </div>
                    <div className="fa"><button className="btn btn-p" onClick={saveFinanceEntry}>💾 حفظ</button><button className="btn btn-g" onClick={()=>setShowFinanceForm(false)}>إلغاء</button></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PARENTS */}
      {tab==='parents' && (
        <div>
          {!canView ? (
            <div style={{padding:'40px',textAlign:'center',color:'var(--err)'}}>🔒 القسم متاح للإدارة فقط</div>
          ) : (
            <>
              {selParent && (
                <div className="wg" style={{ marginBottom:12 }}>
                  <div className="wg-h">
                    <h3>📇 {selParent.name || 'ولي أمر'} · {selParent.phone}</h3>
                    <div style={{display:'flex',gap:8}}>
                      <button type="button" className="btn btn-p btn-sm" onClick={()=>{ setParentLogForm({...EMPTY_PARENT_LOG, parentKey:selParent.key, type:'visit', date:todayStr()}); setShowParentLogForm(true); }}>➕ تسجيل</button>
                      <button type="button" className="btn btn-g btn-sm" onClick={()=>setSelParent(null)}>إغلاق</button>
                    </div>
                  </div>
                  <div className="wg-b">
                    <div style={{ fontSize:'.84rem', marginBottom:10, color:'var(--g5)' }}>
                      👨‍👩‍👧 طلاب مرتبطون: <b>{(selParent.studentIds||[]).map(id=>students.find(s=>s.id===id)?.name).filter(Boolean).join('، ') || '—'}</b>
                    </div>
                    <div style={{ fontSize:'.78rem', fontWeight:800, color:'var(--pr)', marginBottom:8 }}>
                      📋 سجل التواصل ({parentLogs.filter(l=>l.parentKey===selParent.key).length} سجل)
                    </div>
                    {parentLogs.filter(l=>l.parentKey===selParent.key).length===0
                      ? <div style={{ color:'var(--g4)', padding:'12px 0', textAlign:'center' }}>لا توجد سجلات بعد — استخدم الأزرار أدناه لإضافة تفاعل</div>
                      : parentLogs.filter(l=>l.parentKey===selParent.key).sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(l=>(
                        <div key={l.id} style={{ padding:'10px 12px', borderBottom:'1px solid var(--border-color)', fontSize:'.86rem', display:'flex', alignItems:'flex-start', gap:10 }}>
                          <span style={{ fontSize:'1.1rem' }}>
                            {l.type==='visit'?'🏠':l.type==='call'?'📞':l.type==='guidance'?'🧑‍💼':'💬'}
                          </span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:800 }}>{PARENT_TYPE_LABEL[l.type]||l.type}</div>
                            <div style={{ color:'var(--g5)', fontSize:'.78rem' }}>{l.date}</div>
                            {l.notes && <div style={{ marginTop:4, color:'var(--g6)' }}>{l.notes}</div>}
                          </div>
                          {isManager && <button type="button" className="btn btn-xs btn-d" onClick={()=>{ if(!window.confirm('حذف هذا السجل؟'))return; lsDel('parentInteractions',l.id); setParentLogs(lsGet('parentInteractions')); toast('🗑️ تم الحذف','ok'); }}>🗑️</button>}
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              <div className="stats" style={{ gridTemplateColumns:'repeat(2,1fr)' }}>
                <div className="sc"><div className="lb">أولياء الأمور</div><div className="vl">{extractParents(students).length}</div></div>
                <div className="sc g"><div className="lb">تفاعلات مسجلة</div><div className="vl">{parentLogs.length}</div></div>
              </div>
              {extractParents(students).length===0
                ? <EmptyState icon="👨‍👩‍👧" title="لا يوجد بيانات أولياء أمور" sub="أضف أسماء وجوالات في ملفات الطلاب"/>
                : extractParents(students).map(p=>(
                  <div key={p.key} className="card">
                    <div className="av cyan">👤</div>
                    <div className="ci clickable" style={{ cursor:'pointer' }} onClick={()=>setSelParent(p)}>
                      <div className="cn">{p.name || '—'}</div>
                      <div className="cm">{p.phone || 'لا يوجد جوال'}</div>
                    </div>
                    <div className="c-acts" onClick={e=>e.stopPropagation()}>
                      {p.phone&&<a href={`https://wa.me/${p.phone.replace(/[^0-9+]/g,'').replace(/^0/,'966')}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-bl">💬</a>}
                      <button type="button" className="btn btn-xs btn-g" onClick={()=>{ setParentLogForm({...EMPTY_PARENT_LOG, parentKey:p.key, type:'visit', date:todayStr() }); setShowParentLogForm(true); }}>زيارة</button>
                      <button type="button" className="btn btn-xs btn-g" onClick={()=>{ setParentLogForm({...EMPTY_PARENT_LOG, parentKey:p.key, type:'call', date:todayStr() }); setShowParentLogForm(true); }}>مكالمة</button>
                      <button type="button" className="btn btn-xs btn-s" onClick={()=>{ setParentLogForm({...EMPTY_PARENT_LOG, parentKey:p.key, type:'guidance', date:todayStr() }); setShowParentLogForm(true); }}>إرشاد</button>
                    </div>
                  </div>
                ))}
              {showParentLogForm&&(
                <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowParentLogForm(false);}}>
                  <div className="mb mb-sm" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                    <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>تسجيل {PARENT_TYPE_LABEL[parentLogForm.type]}</h2></div>
                    <div className="modal-body-scroll" style={{padding:'18px 20px'}}>
                      <div className="fg c2">
                        <div className="fl"><label>التاريخ</label><input type="date" value={parentLogForm.date} onChange={fldPL('date')}/></div>
                        <AttachmentField
                          fileData={parentLogForm.fileData}
                          fileName={parentLogForm.fileName}
                          onAttach={(data, name) => setParentLogForm(f => ({ ...f, fileData: data, fileName: name }))}
                          onError={msg => toast('⚠️ ' + msg, 'er')}
                        />
                        <div className="fl full"><label>ملاحظات</label><textarea value={parentLogForm.notes} onChange={fldPL('notes')} rows={3}/></div>
                      </div>
                    </div>
                    <div className="fa"><button type="button" className="btn btn-p" onClick={saveParentLog}>💾 حفظ</button><button type="button" className="btn btn-g" onClick={()=>setShowParentLogForm(false)}>إلغاء</button></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* BUS */}
      {tab==='bus' && (
        <div>
          {!isManager ? (
            <div style={{padding:'40px',textAlign:'center',color:'var(--err)'}}>🔒 خدمة الباص للمدير فقط</div>
          ) : (
            <>
              <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
                <button type="button" className="btn btn-p" onClick={()=>{ setBusForm({...EMPTY_BUS, studentIds:[] }); setBusEditId(null); setShowBusForm(true); }}>➕ باص جديد</button>
              </div>
              {buses.length===0 ? <EmptyState icon="🚌" title="لا توجد باصات مسجلة"/> : buses.map(b=>{
                const names = (b.studentIds||[]).map(id=>students.find(s=>s.id===id)?.name).filter(Boolean);
                return (
                  <div key={b.id} className="card">
                    <div className="av">🚌</div>
                    <div className="ci">
                      <div className="cn">باص رقم {b.busNumber}</div>
                      <div className="cm">السائق: {b.driverPhone||'—'} · {names.length} طالب</div>
                      {b.route&&<div className="cm">خط السير: {b.route}</div>}
                      {b.notes&&<div className="cm">{b.notes}</div>}
                      {names.length>0&&<div className="cm" style={{fontSize:'.78rem'}}>👥 {names.join('، ')}</div>}
                    </div>
                    <div className="c-acts">
                      <button type="button" className="btn btn-xs btn-g" onClick={()=>{ setBusForm({...EMPTY_BUS, ...b, studentIds:b.studentIds||[] }); setBusEditId(b.id); setShowBusForm(true); }}>✏️</button>
                      <button type="button" className="btn btn-xs btn-d" onClick={()=>delBus(b.id)}>🗑️</button>
                    </div>
                  </div>
                );
              })}
              {showBusForm&&(
                <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowBusForm(false);}}>
                  <div className="mb mb-xl" style={{padding:0,overflow:'hidden',borderRadius:16}}>
                    <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{busEditId?'✏️ تعديل باص':'🚌 باص جديد'}</h2></div>
                    <div className="modal-body-scroll" style={{padding:'18px 20px'}}>
                      <div className="fg c2">
                        <div className="fl"><label>رقم الباص <span className="req">*</span></label><input value={busForm.busNumber} onChange={fldB('busNumber')}/></div>
                        <div className="fl"><label>جوال السائق</label><input type="tel" value={busForm.driverPhone} onChange={fldB('driverPhone')}/></div>
                        <div className="fl full"><label>خط السير</label><textarea value={busForm.route} onChange={fldB('route')} rows={2} placeholder="المناطق / المحطات..."/></div>
                        <AttachmentField
                          fileData={busForm.fileData}
                          fileName={busForm.fileName}
                          onAttach={(data, name) => setBusForm(f => ({ ...f, fileData: data, fileName: name }))}
                          onError={msg => toast('⚠️ ' + msg, 'er')}
                        />
                        <div className="fl full"><label>ملاحظات</label><textarea value={busForm.notes} onChange={fldB('notes')} rows={2}/></div>
                        <div className="fl full"><label>الطلاب المشتركون</label>
                          <div style={{ maxHeight:180, overflowY:'auto', border:'1px solid var(--border-color)', borderRadius:8, padding:8 }}>
                            {students.filter(s=>!['inactive','transferred','rejected'].includes(s.status)).map(s=>(
                              <label key={s.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:'.84rem',marginBottom:4}}>
                                <input type="checkbox" checked={(busForm.studentIds||[]).includes(s.id)} onChange={()=>toggleBusStudent(s.id)}/> {s.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="fa"><button type="button" className="btn btn-p" onClick={saveBus}>💾 حفظ</button><button type="button" className="btn btn-g" onClick={()=>setShowBusForm(false)}>إلغاء</button></div>
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
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12,gap:8,flexWrap:'wrap'}}>
            {isManager&&<button className="btn btn-p" onClick={()=>{setDocForm({...EMPTY_DOC,date:todayStr()});setDocEditId(null);setShowDocForm(true);}}>➕ إضافة وثيقة</button>}
          </div>

          {/* تنويه: الجزاءات (كانت "الإنذارات" هنا) انتقلت لصفحة الموظفين */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'var(--warn-l)', border:'1px solid #fde68a', borderRadius:10, marginBottom:14, flexWrap:'wrap' }}>
            <span style={{ fontSize:'1.2rem' }}>⚠️</span>
            <span style={{ flex:1, fontSize:'.84rem', color:'var(--warn)' }}>انتقل نظام "الجزاءات" (الإنذارات) إلى صفحة الموظفين لأنه يخص الكوادر البشرية مباشرة.</span>
            <button type="button" className="btn btn-p btn-sm" onClick={() => go('hr-warnings')}>فتح صفحة الجزاءات ←</button>
          </div>

          <div className="tabs">
            {[['all','الكل'],['stats','إحصائية'],['policy','لائحة'],['report','تقرير'],['memo','مذكرة']].map(([v,l])=>(
              <button key={v} className={`tab ${docTab===v?'on':''}`} onClick={()=>setDocTab(v)}>{l}</button>
            ))}
          </div>

          {/* Documents Section */}
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
                <button className="btn btn-xs btn-bl" onClick={()=>printItem(d,'document',centerData.logo,centerData.name)}>🖨️</button>
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
                <button className="btn btn-xs btn-bl" onClick={()=>printItem({...c,fileData:c.fileData},'custody',centerData.logo,centerData.name)}>🖨️</button>
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
                    <div className="fl full"><label>الفئة</label>
                      <select value={custodyForm.category} onChange={fldC('category')}>
                        {CUSTODY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="fl"><label>الكمية</label><input type="number" value={custodyForm.quantity} onChange={fldC('quantity')} min="1"/></div>
                    <div className="fl"><label>الموقع</label><input value={custodyForm.location} onChange={fldC('location')} placeholder="مستودع، قاعة..."/></div>
                    <div className="fl"><label>الحالة</label><select value={custodyForm.condition} onChange={fldC('condition')}><option>جيد</option><option>مقبول</option><option>يحتاج صيانة</option><option>معطل</option></select></div>
                    <AttachmentField
                      fileData={custodyForm.fileData}
                      fileName={custodyForm.fileName}
                      onAttach={(data, name) => setCustodyForm(f => ({ ...f, fileData: data, fileName: name }))}
                      onError={msg => toast('⚠️ ' + msg, 'er')}
                    />
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
                <button className="btn btn-xs btn-bl" onClick={()=>printItem({...v,fileData:v.fileData},'visit',centerData.logo,centerData.name)}>🖨️</button>
                {isManager&&<button className="btn btn-xs btn-g" onClick={()=>{setVisitForm({...v});setVisitEditId(v.id);setShowVisitForm(true);}}>✏️</button>}
                {isManager&&<button className="btn btn-xs btn-d" onClick={()=>{lsDel('centerVisits',v.id);reload();toast('🗑️','ok');}}>🗑️</button>}
              </div>
            </div>
          ))}
          {showVisitForm&&(
            <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setShowVisitForm(false);}}>
              
            <div className="mb mb-large" style={{padding:0,overflow:'hidden',borderRadius:16,maxHeight:'95vh',display:'flex',flexDirection:'column'}}>
                <div className="fhd" style={{padding:'14px 20px',borderRadius:0}}><h2>{visitEditId?'✏️ تعديل الزيارة':'🏛️ تسجيل زيارة'}</h2></div>
                <div style={{padding:'18px 20px'}}>
                  <div className="fg c2">
                    <div className="fl full"><label>جهة الزيارة <span className="req">*</span></label><input value={visitForm.name} onChange={fldV('name')}/></div>
                    <div className="fl"><label>التاريخ <span className="req">*</span></label><input type="date" value={visitForm.date} onChange={fldV('date')}/></div>
                    <div className="fl"><label>نوع الزيارة</label><select value={visitForm.type} onChange={fldV('type')}><option value="">--</option><option>تفتيشية</option><option>إشرافية</option><option>دعم وتطوير</option><option>متابعة</option><option>أخرى</option></select></div>
                    <div className="fl full"><label>الوفد</label><input value={visitForm.delegation} onChange={fldV('delegation')} placeholder="اسم المندوب / الوفد..."/></div>
                    <div className="fl full"><label>الغرض</label><textarea value={visitForm.purpose} onChange={fldV('purpose')} rows={2}/></div>
                    <div className="fl full"><label>نتيجة / توصيات</label><textarea value={visitForm.result} onChange={fldV('result')} rows={2}/></div>
                    <AttachmentField
                      fileData={visitForm.fileData}
                      fileName={visitForm.fileName}
                      onAttach={(data, name) => setVisitForm(f => ({ ...f, fileData: data, fileName: name }))}
                      onError={msg => toast('⚠️ ' + msg, 'er')}
                    />
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
