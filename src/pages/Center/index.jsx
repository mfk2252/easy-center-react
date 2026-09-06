import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { todayStr, uid } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import EmptyState from '../../components/ui/EmptyState';
import { handleFileInputChange } from '../../utils/fileUpload';
import AttachmentField from '../../components/ui/AttachmentField';
import { CUSTODY_CATEGORIES } from '../../utils/custodyCategories';
import { getCurrencySymbol } from '../../utils/constants';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';
import {
  Handshake,
  DollarSign,
  Users,
  Bus,
  FileText,
  Package,
  Landmark,
  Search,
  Printer,
  Plus,
  Phone,
  MessageCircle,
  ExternalLink,
  Download,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Calendar as CalIcon,
  Filter,
  Eye,
  FileCheck,
  Building2
} from 'lucide-react';

const DOC_TYPES = {
  stats: 'إحصائية وزارية',
  policy: 'لائحة / سياسة',
  report: 'تقرير',
  strategy: 'استراتيجية',
  circular: 'تعميم',
  memo: '📝 مذكرة داخلية',
  other: 'أخرى'
};

const EXPENSE_CATS = {
  salary: 'رواتب',
  rent: 'إيجار',
  utilities: 'فواتير',
  supplies: 'مستلزمات',
  maintenance: 'صيانة',
  training: 'تدريب',
  other: 'أخرى'
};

const INCOME_CATS = {
  fees: 'رسوم طلاب',
  donation: 'تبرعات',
  grant: 'منح',
  other: 'أخرى'
};

const FINANCE_CATEGORIES = [
  { id: '1', label: '1- رسوم الطلاب', type: 'income', items: ['رسوم التسجيل', 'رسوم القبول', 'الرسوم الدراسية السنوية', 'الرسوم الفصلية', 'رسوم إعادة التسجيل', 'رسوم الملف', 'رسوم اختبار تحديد المستوى', 'رسوم الاختبارات النهائية', 'رسوم الشهادات', 'رسوم التخرج', 'رسوم تأخير السداد', 'رسوم إعادة الاختبار', 'رسوم إعادة المادة', 'رسوم الحضور الجزئي', 'رسوم التعليم الإلكتروني'] },
  { id: '2', label: '2- إيرادات الخدمات', type: 'income', items: ['رسوم الباص / النقل المدرسي', 'اشتراك الباص الشهري', 'رسوم تغيير خط الباص', 'رسوم الرحلات', 'رسوم الأنشطة', 'رسوم النوادي', 'رسوم السوبر ماركت (المقصف)', 'رسوم الوجبات', 'رسوم الكتب', 'رسوم الزي المدرسي', 'رسوم الأدوات التعليمية', 'رسوم المختبرات', 'رسوم الطباعة والتصوير', 'رسوم المنصات الإلكترونية', 'رسوم الدورات الإضافية', 'رسوم التقوية', 'رسوم التدريب الصيفي'] },
  { id: '3', label: '3- إيرادات أخرى', type: 'income', items: ['تبرعات', 'رعايات شركات', 'دعم حكومي', 'تأجير القاعات', 'تأجير الملاعب', 'تأجير الباصات', 'بيع الكتب', 'بيع الزي', 'أرباح السوبر ماركت (المقصف)', 'أرباح الفعاليات', 'غرامات التأخير', 'غرامات التلفيات'] },
  { id: '4', label: '4- الرواتب والأجور', type: 'expense', items: ['رواتب الموظفين', 'رواتب المعلمين', 'رواتب الإداريين', 'رواتب المديرين', 'رواتب المحاسبين', 'رواتب موظفي القبول والتسجيل', 'رواتب موظفي خدمة العملاء', 'رواتب المشرفين', 'رواتب الأمن', 'رواتب العمال', 'رواتب السائقين', 'رواتب المراسلين', 'رواتب عمال النظافة', 'رواتب فنيي الحاسب', 'رواتب فنيي المختبر', 'رواتب الممرضات', 'رواتب مسؤولي الباصات'] },
  { id: '5', label: '5- البدلات والمزايا', type: 'expense', items: ['بدل سكن', 'بدل نقل', 'بدل طبيعة عمل', 'بدل هاتف', 'بدل طعام', 'بدل إشراف', 'بدل ساعات إضافية', 'بدل انتداب', 'بدل تذاكر سفر', 'التأمين الطبي', 'التأمينات الاجتماعية', 'مكافآت الأداء', 'مكافآت نهاية العام', 'عمولات التسجيل', 'مكافآت الطلاب المتفوقين', 'نهاية الخدمة'] },
  { id: '6', label: '6- مصروفات الباصات والنقل', type: 'expense', items: ['مصروفات تشغيل الباص', 'رواتب السائقين', 'رواتب المشرفات', 'وقود الباصات', 'ديزل', 'بترول', 'صيانة الباصات', 'غيار الزيت', 'الإطارات', 'البطاريات', 'قطع الغيار', 'غسيل الباصات', 'تجديد الاستمارات', 'التأمين على الباصات', 'مخالفات المرور', 'أجهزة التتبع GPS', 'رسوم المواقف', 'عقود النقل الخارجي', 'إيجار الباصات', 'استهلاك الباصات'] },
  { id: '7', label: '7- المصروفات التعليمية', type: 'expense', items: ['شراء الكتب', 'المناهج', 'الوسائل التعليمية', 'السبورات الذكية', 'أجهزة العرض', 'الطابعات', 'الأحبار', 'الأوراق', 'المختبرات', 'الأدوات العلمية', 'اشتراكات البرامج التعليمية', 'اشتراكات Zoom / Teams', 'تراخيص البرامج', 'الإنترنت', 'السيرفرات', 'الصيانة التقنية', 'أجهزة الكمبيوتر', 'أجهزة التابلت'] },
  { id: '8', label: '8- المصروفات الإدارية والتشغيلية', type: 'expense', items: ['المبنى والمرافق', 'إيجار المبنى', 'إيجار الفصول', 'الكهرباء', 'الماء', 'الغاز', 'الإنترنت', 'الهاتف', 'رسوم البلدية', 'رسوم الدفاع المدني', 'رسوم التراخيص', 'رسوم وزارة التعليم', 'رسوم الغرفة التجارية', 'النظافة', 'التعقيم', 'مكافحة الحشرات', 'الأمن والحراسة', 'الصيانة العامة', 'صيانة التكييف', 'صيانة المصاعد', 'صيانة الكهرباء', 'صيانة السباكة', 'صيانة الأثاث', 'الأدوات المكتبية', 'القرطاسية', 'الملفات', 'الأحبار', 'أجهزة البصمة', 'الكاميرات', 'أنظمة الحضور والانصراف', 'أنظمة ERP', 'أنظمة المحاسبة'] },
  { id: '9', label: '9- التسويق والعلاقات العامة', type: 'expense', items: ['إعلانات السوشيال ميديا', 'تصميم الجرافيك', 'إدارة الحسابات', 'تصوير الفيديو', 'تصوير المناسبات', 'الهدايا الدعائية', 'البنرات', 'اللوحات الإعلانية', 'الحملات التسويقية', 'العمولات التسويقية', 'المعارض التعليمية', 'رعاية الفعاليات'] },
  { id: '10', label: '10- المصروفات الطلابية والأنشطة', type: 'expense', items: ['الرحلات', 'المسابقات', 'الحفلات', 'الأنشطة الرياضية', 'الأنشطة الفنية', 'الجوائز', 'الشهادات', 'الضيافة', 'الزي الرياضي', 'أدوات النشاط'] },
  { id: '11', label: '11- الأصول والمشتريات والبنود المحاسبية والمالية', type: 'expense', items: ['شراء باصات', 'شراء سيارات', 'شراء أثاث', 'شراء مكاتب', 'شراء كراسي', 'شراء تكييفات', 'شراء كاميرات', 'شراء أجهزة كمبيوتر', 'شراء شاشات', 'إنشاء ملاعب', 'إنشاء مختبرات', 'تجهيز الفصول', 'أعمال الديكور', 'التوسعات', 'الذمم المدينة', 'أقساط الطلاب المستحقة', 'شيكات آجلة', 'ديون العملاء', 'مستحقات النقل', 'الذمم الدائنة', 'الموردون', 'فواتير غير مدفوعة', 'عقود الصيانة'] },
  { id: '12', label: '12- الضرائب والالتزامات والمخصصات والتقارير', type: 'expense', items: ['ضريبة القيمة المضافة', 'ضريبة الرواتب', 'الزكاة (في الخليج)', 'التأمينات الاجتماعية', 'رسوم الإقامة', 'رسوم تجديد الإقامات', 'رسوم التأشيرات', 'مخصص نهاية الخدمة', 'مخصص الديون المشكوك فيها', 'مخصص الصيانة', 'مخصص الإجازات', 'الميزانية العمومية', 'قائمة الدخل', 'التدفقات النقدية', 'كشف الرواتب', 'تقرير الباصات', 'تقرير المتأخرات', 'تقرير المصروفات', 'تقرير الإيرادات', 'تقرير الأرباح والخسائر', 'تقرير أعمار الديون', 'ميزانية تشغيل المدرسة', 'ميزانية الأنشطة', 'ميزانية النقل'] }
];

const EMPTY_FINANCE = { type: 'income', categoryId: '1', categoryLabel: '1- رسوم الطلاب', itemType: 'رسوم التسجيل', itemTypeOther: '', desc: '', amount: '', date: '', notes: '', fileData: '', fileName: '' };
const EMPTY_DOC = { name: '', type: 'stats', date: '', org: '', url: '', notes: '', fileData: '', fileName: '', audience: ['all'] };
const EMPTY_EXP = { desc: '', cat: 'salary', amount: '', date: '', notes: '' };
const EMPTY_INC = { desc: '', cat: 'fees', amount: '', date: '', notes: '' };
const EMPTY_PARTNER = { name: '', type: '', contact: '', phone: '', email: '', startDate: '', notes: '', fileData: '', fileName: '' };
const EMPTY_CUSTODY = { name: '', category: 'أجهزة إلكترونية', quantity: 1, location: '', condition: 'جيد', notes: '', fileData: '', fileName: '' };
const EMPTY_VISIT = { name: '', date: '', type: '', delegation: '', purpose: '', result: '', notes: '', fileData: '', fileName: '' };
const EMPTY_PARENT_LOG = { parentKey: '', type: 'visit', date: '', notes: '', fileData: '', fileName: '' };
const EMPTY_BUS = { busNumber: '', driverPhone: '', route: '', notes: '', studentIds: [], fileData: '', fileName: '' };
const PARENT_TYPE_LABEL = { visit: 'زيارة', call: 'مكالمة', guidance: 'جلسة إرشادية' };

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
  const canView = ['manager', 'vice'].includes(currentUser?.role);

  // Search states for tabs
  const [searchPartner, setSearchPartner] = useState('');
  const [searchParent, setSearchParent] = useState('');
  const [searchDoc, setSearchDoc] = useState('');
  const [searchCustody, setSearchCustody] = useState('');
  const [custodyCatFilter, setCustodyCatFilter] = useState('all');
  const [searchVisit, setSearchVisit] = useState('');
  const [searchBus, setSearchBus] = useState('');

  // Selected details
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
  const [students, setStudents] = useState([]);
  const [parentLogs, setParentLogs] = useState([]);
  const [buses, setBuses] = useState([]);

  // Form states
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState(EMPTY_DOC);
  const [docEditId, setDocEditId] = useState(null);
  const [docTab, setDocTab] = useState('all');

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

  const [showBusForm, setShowBusForm] = useState(false);
  const [busForm, setBusForm] = useState(EMPTY_BUS);
  const [busEditId, setBusEditId] = useState(null);
  const [busStudentSearch, setBusStudentSearch] = useState('');

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

  const fldD = k => e => setDocForm(f => ({ ...f, [k]: e.target.value }));
  const fldP = k => e => setPartnerForm(f => ({ ...f, [k]: e.target.value }));
  const fldC = k => e => setCustodyForm(f => ({ ...f, [k]: e.target.value }));
  const fldV = k => e => setVisitForm(f => ({ ...f, [k]: e.target.value }));
  const fldPL = k => e => setParentLogForm(f => ({ ...f, [k]: e.target.value }));
  const fldB = k => e => setBusForm(f => ({ ...f, [k]: e.target.value }));

  // Parents operations
  const allParents = useMemo(() => extractParents(students), [students]);

  const filteredParents = useMemo(() => {
    if (!searchParent.trim()) return allParents;
    const q = searchParent.toLowerCase();
    return allParents.filter(p => {
      const studentNames = (p.studentIds || []).map(id => students.find(s => s.id === id)?.name || '').join(' ').toLowerCase();
      return (p.name || '').toLowerCase().includes(q) || (p.phone || '').includes(q) || studentNames.includes(q);
    });
  }, [allParents, searchParent, students]);

  function saveParentLog() {
    if (!parentLogForm.parentKey || !parentLogForm.date) { toast('⚠️ أكمل البيانات', 'er'); return; }
    lsAdd('parentInteractions', { ...parentLogForm, id: uid() });
    toast('✅ تم التسجيل', 'ok');
    setShowParentLogForm(false);
    setParentLogs(lsGet('parentInteractions'));
  }

  // Bus operations
  function toggleBusStudent(id) {
    setBusForm(f => {
      const p = f.studentIds || [];
      return { ...f, studentIds: p.includes(id) ? p.filter(x => x !== id) : [...p, id] };
    });
  }

  function saveBus() {
    if (!busForm.busNumber.trim()) { toast('⚠️ أدخل رقم الباص', 'er'); return; }
    if (busEditId) lsUpd('buses', busEditId, { ...busForm, studentIds: busForm.studentIds || [] });
    else lsAdd('buses', { ...busForm, id: uid(), studentIds: busForm.studentIds || [] });
    toast('✅ تم الحفظ', 'ok'); setShowBusForm(false); reload();
  }

  function delBus(id) {
    if (!window.confirm('حذف هذا الباص؟')) return;
    lsDel('buses', id); reload(); toast('🗑️ تم الحذف', 'ok');
  }

  const filteredBuses = useMemo(() => {
    if (!searchBus.trim()) return buses;
    const q = searchBus.toLowerCase();
    return buses.filter(b => (b.busNumber || '').includes(q) || (b.driverPhone || '').includes(q) || (b.route || '').toLowerCase().includes(q));
  }, [buses, searchBus]);

  // Docs operations
  function saveDoc() {
    if (!docForm.name.trim()) { toast('⚠️ أدخل اسم الوثيقة', 'er'); return; }
    if (docEditId) lsUpd('centerDocs', docEditId, docForm); else lsAdd('centerDocs', { ...docForm, id: uid() });
    toast('✅ تم حفظ الوثيقة', 'ok'); setShowDocForm(false); reload();
  }

  async function handleDocFile(e) {
    try {
      const res = await handleFileInputChange(e, { allowPdf: true, allowDoc: true });
      if (res) setDocForm(fm => ({ ...fm, fileData: res.data, fileName: res.name }));
    } catch (ex) {
      toast('⚠️ ' + (ex.i18nKey === 'file.tooLarge' ? 'حجم الملف يتجاوز 2 ميجابايت' : 'نوع الملف غير مدعوم'), 'er');
    }
  }

  const filteredDocs = useMemo(() => {
    let list = docTab === 'all' ? docs : docs.filter(d => d.type === docTab);
    if (searchDoc.trim()) {
      const q = searchDoc.toLowerCase();
      list = list.filter(d => (d.name || '').toLowerCase().includes(q) || (d.org || '').toLowerCase().includes(q) || (d.notes || '').toLowerCase().includes(q));
    }
    return list;
  }, [docs, docTab, searchDoc]);

  // Finance operations
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
    if (!finalDesc || !financeForm.amount || !financeForm.date) { toast('⚠️ أكمل الحقول المطلوبة', 'er'); return; }
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
    toast('✅ تم حفظ الحركة المالية', 'ok');
    setShowFinanceForm(false);
    reload();
  }

  // Partners operations
  function savePartner() {
    if (!partnerForm.name.trim()) { toast('⚠️ أدخل اسم الشريك', 'er'); return; }
    if (partnerEditId) lsUpd('partners', partnerEditId, partnerForm); else lsAdd('partners', { ...partnerForm, id: uid() });
    toast('✅ تم الحفظ بنجاح', 'ok'); setShowPartnerForm(false); reload();
  }

  const filteredPartners = useMemo(() => {
    if (!searchPartner.trim()) return partners;
    const q = searchPartner.toLowerCase();
    return partners.filter(p => (p.name || '').toLowerCase().includes(q) || (p.type || '').toLowerCase().includes(q) || (p.contact || '').toLowerCase().includes(q) || (p.phone || '').includes(q));
  }, [partners, searchPartner]);

  // Custody operations
  function saveCustody() {
    if (!custodyForm.name.trim()) { toast('⚠️ أدخل اسم العهدة', 'er'); return; }
    if (custodyEditId) lsUpd('custody', custodyEditId, custodyForm); else lsAdd('custody', { ...custodyForm, id: uid() });
    toast('✅ تم الحفظ بنجاح', 'ok'); setShowCustodyForm(false); reload();
  }

  const filteredCustody = useMemo(() => {
    let list = custody;
    if (custodyCatFilter !== 'all') {
      list = list.filter(c => c.category === custodyCatFilter);
    }
    if (searchCustody.trim()) {
      const q = searchCustody.toLowerCase();
      list = list.filter(c => (c.name || '').toLowerCase().includes(q) || (c.location || '').toLowerCase().includes(q) || (c.notes || '').toLowerCase().includes(q));
    }
    return list;
  }, [custody, custodyCatFilter, searchCustody]);

  // Visits operations
  function saveVisit() {
    if (!visitForm.name.trim() || !visitForm.date) { toast('⚠️ أدخل الجهة والتاريخ', 'er'); return; }
    if (visitEditId) lsUpd('centerVisits', visitEditId, visitForm); else lsAdd('centerVisits', { ...visitForm, id: uid() });
    toast('✅ تم تسجيل الزيارة بنجاح', 'ok'); setShowVisitForm(false); reload();
  }

  const filteredVisits = useMemo(() => {
    if (!searchVisit.trim()) return visits;
    const q = searchVisit.toLowerCase();
    return visits.filter(v => (v.name || '').toLowerCase().includes(q) || (v.delegation || '').toLowerCase().includes(q) || (v.purpose || '').toLowerCase().includes(q) || (v.type || '').toLowerCase().includes(q));
  }, [visits, searchVisit]);

  const totalIncome = income.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const totalExpenses = expenses.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const netBalance = totalIncome - totalExpenses;
  const currSym = getCurrencySymbol(centerData.currency);

  const TABS = [
    { id: 'partners', label: 'الشراكات', count: partners.length, icon: <Handshake style={{ width: 16, height: 16 }} /> },
    { id: 'finance', label: 'المالية', count: income.length + expenses.length, icon: <DollarSign style={{ width: 16, height: 16 }} />, managerOnly: true },
    { id: 'parents', label: 'أولياء الأمور', count: allParents.length, icon: <Users style={{ width: 16, height: 16 }} /> },
    { id: 'bus', label: 'خدمة الباص', count: buses.length, icon: <Bus style={{ width: 16, height: 16 }} />, managerOnly: true },
    { id: 'docs', label: 'الوثائق', count: docs.length, icon: <FileText style={{ width: 16, height: 16 }} /> },
    { id: 'custody', label: 'العهدة والموجودات', count: custody.length, icon: <Package style={{ width: 16, height: 16 }} /> },
    { id: 'visits', label: 'الزيارات والوفود', count: visits.length, icon: <Landmark style={{ width: 16, height: 16 }} /> },
  ];

  return (
    <div>
      <UnifiedPageHeader
        icon="🏢"
        title="إدارة المركز والخدمات المساندة"
        subtitle="الشراكات المؤسسية، الإدارة المالية، أولياء الأمور، النقل والباصات، العهدة والموجودات، والوثائق الرسمية"
        badge={`${partners.length} شركاء · ${buses.length} باصات · ${docs.length} وثائق`}
        actions={
          <button
            type="button"
            className="btn btn-g no-print"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <Printer style={{ width: 16, height: 16 }} />
            <span>طباعة السجل</span>
          </button>
        }
      />

      {/* شريط التبويبات الحديث الموحد */}
      <div className="tabs" style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-color)', marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'on' : ''}`}
            onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontWeight: tab === t.id ? 800 : 600 }}
          >
            {t.icon}
            <span>{t.label}</span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: 12,
                background: tab === t.id ? 'var(--pr)' : 'var(--g1)',
                color: tab === t.id ? '#fff' : 'var(--text-sub)',
                fontWeight: 800
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. تبويب الشراكات المؤسسية */}
      {/* ========================================================================= */}
      {tab === 'partners' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* شريط الإحصائيات الموحد */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pr)' }}>
              <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Handshake style={{ width: 16, height: 16, color: 'var(--pr)' }} />
                <span>إجمالي الشركاء</span>
              </div>
              <div className="stat-val" style={{ color: 'var(--pr)' }}>{partners.length}</div>
              <div className="stat-sub">جهات ومؤسسات متعاونة معتمدة</div>
            </div>

            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--ok)' }}>
              <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--ok)' }} />
                <span>اتفاقيات نشطة</span>
              </div>
              <div className="stat-val" style={{ color: 'var(--ok)' }}>{partners.length}</div>
              <div className="stat-sub">بروتوكولات ومذكرات تفاهم سارية</div>
            </div>

            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pur, #7c3aed)' }}>
              <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone style={{ width: 16, height: 16, color: 'var(--pur, #7c3aed)' }} />
                <span>قنوات التواصل</span>
              </div>
              <div className="stat-val" style={{ color: 'var(--pur, #7c3aed)' }}>
                {partners.filter(p => p.phone || p.email).length}
              </div>
              <div className="stat-sub">جهات متوفر لديها بيانات اتصال مباشرة</div>
            </div>
          </div>

          {/* شريط الإجراءات والبحث */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search style={{ position: 'absolute', right: 10, top: 11, width: 16, height: 16, color: 'var(--text-sub)' }} />
              <input
                type="text"
                placeholder="بحث باسم الشريك، النوع، أو المسؤول..."
                value={searchPartner}
                onChange={e => setSearchPartner(e.target.value)}
                style={{ width: '100%', height: 38, paddingRight: 34, borderRadius: 8, fontSize: '0.84rem' }}
              />
            </div>

            {isManager && (
              <button
                type="button"
                className="btn btn-p"
                onClick={() => { setPartnerForm({ ...EMPTY_PARTNER }); setPartnerEditId(null); setShowPartnerForm(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              >
                <Plus style={{ width: 16, height: 16 }} />
                <span>شريك جديد</span>
              </button>
            )}
          </div>

          {/* قائمة الشركاء */}
          {filteredPartners.length === 0 ? (
            <EmptyState icon="🤝" title="لا توجد شراكات مطابقة" sub="أضف اتفاقيات أو بروتوكولات تعاون مع جهات ومؤسسات داعمة" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {filteredPartners.map(p => (
                <div
                  key={p.id}
                  className="wg clickable"
                  onClick={() => setViewPartner(p)}
                  style={{ margin: 0, borderRadius: 'var(--r)', border: '1px solid var(--border-color)', padding: 16, cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--g1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        🤝
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{p.type || 'شراكة عامة'}</div>
                      </div>
                    </div>
                    {p.startDate && <span className="bdg b-bl" style={{ fontSize: '0.72rem' }}>منذ {p.startDate}</span>}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {p.contact && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600 }}>المسؤول:</span>
                        <span>{p.contact}</span>
                      </div>
                    )}
                    {p.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600 }}>الهاتف:</span>
                        <span style={{ direction: 'ltr' }}>{p.phone}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 10 }} onClick={ev => ev.stopPropagation()}>
                    {p.phone && (
                      <a
                        href={`https://wa.me/${p.phone.replace(/[^0-9+]/g, '').replace(/^0/, '966')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-xs btn-bl"
                        title="محادثة واتساب"
                      >
                        💬 واتساب
                      </a>
                    )}
                    <button
                      type="button"
                      className="btn btn-xs btn-g"
                      onClick={() => printItem(p, 'partnership', centerData.logo, centerData.name)}
                      title="طباعة بطاقة الشراكة"
                    >
                      🖨️
                    </button>
                    {isManager && (
                      <>
                        <button
                          type="button"
                          className="btn btn-xs btn-g"
                          onClick={() => { setPartnerForm({ ...p }); setPartnerEditId(p.id); setShowPartnerForm(true); }}
                          title="تعديل"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-d"
                          onClick={() => { if (!window.confirm('حذف هذا الشريك؟')) return; lsDel('partners', p.id); reload(); toast('🗑️ تم الحذف', 'ok'); }}
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal: Partner Details */}
          {viewPartner && (
            <div className="mbg" onClick={e => e.target === e.currentTarget && setViewPartner(null)}>
              <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                <div className="fhd" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem' }}>
                    <span>🤝</span>
                    <span>{viewPartner.name}</span>
                  </h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => printItem(viewPartner, 'partnership', centerData.logo, centerData.name)}>🖨️ طباعة</button>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => setViewPartner(null)}>✕</button>
                  </div>
                </div>
                <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
                    <div style={{ background: 'var(--g0)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 2 }}>نوع الشراكة</div>
                      <div style={{ fontWeight: 800 }}>{viewPartner.type || '—'}</div>
                    </div>
                    <div style={{ background: 'var(--g0)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 2 }}>المسؤول / جهة الاتصال</div>
                      <div style={{ fontWeight: 800 }}>{viewPartner.contact || '—'}</div>
                    </div>
                    {viewPartner.phone && (
                      <div style={{ background: 'var(--g0)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 2 }}>رقم الجوال</div>
                        <div style={{ fontWeight: 800, direction: 'ltr' }}>{viewPartner.phone}</div>
                      </div>
                    )}
                    {viewPartner.email && (
                      <div style={{ background: 'var(--g0)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 2 }}>البريد الإلكتروني</div>
                        <div style={{ fontWeight: 800, direction: 'ltr' }}>{viewPartner.email}</div>
                      </div>
                    )}
                    {viewPartner.startDate && (
                      <div style={{ background: 'var(--g0)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginBottom: 2 }}>تاريخ بدء الشراكة</div>
                        <div style={{ fontWeight: 800 }}>{viewPartner.startDate}</div>
                      </div>
                    )}
                  </div>
                  {viewPartner.notes && (
                    <div style={{ padding: '14px', background: 'var(--g0)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '.8rem', color: 'var(--pr)', fontWeight: 800, marginBottom: 6 }}>📝 الملاحظات وبنود التعاون:</div>
                      <div style={{ fontSize: '.88rem', lineHeight: 1.6 }}>{viewPartner.notes}</div>
                    </div>
                  )}
                </div>
                <div className="fa">
                  {isManager && (
                    <button
                      type="button"
                      className="btn btn-p"
                      onClick={() => {
                        setPartnerForm({ ...viewPartner });
                        setPartnerEditId(viewPartner.id);
                        setShowPartnerForm(true);
                        setViewPartner(null);
                      }}
                    >
                      ✏️ تعديل
                    </button>
                  )}
                  <button type="button" className="btn btn-g" onClick={() => setViewPartner(null)}>إغلاق</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Add/Edit Partner */}
          {showPartnerForm && (
            <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowPartnerForm(false); }}>
              <div className="mb" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
                  <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{partnerEditId ? '✏️ تعديل بيانات الشريك' : '🤝 شريك ومؤسسة جديدة'}</h2>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <div className="fg c2">
                    <div className="fl full">
                      <label>اسم الجهة / المؤسسة <span className="req">*</span></label>
                      <input value={partnerForm.name} onChange={fldP('name')} placeholder="اسم الشركة، الجمعية، أو الجهة الحكومية..." />
                    </div>
                    <div className="fl">
                      <label>نوع الشراكة</label>
                      <input value={partnerForm.type} onChange={fldP('type')} placeholder="حكومية، خيرية، طبية، تدريبية..." />
                    </div>
                    <div className="fl">
                      <label>اسم المنسق / المسؤول</label>
                      <input value={partnerForm.contact} onChange={fldP('contact')} placeholder="الاسم وصفته..." />
                    </div>
                    <div className="fl">
                      <label>الجوال</label>
                      <input type="tel" value={partnerForm.phone} onChange={fldP('phone')} placeholder="05XXXXXXXX" />
                    </div>
                    <div className="fl">
                      <label>البريد الإلكتروني</label>
                      <input type="email" value={partnerForm.email} onChange={fldP('email')} placeholder="partner@org.sa" />
                    </div>
                    <div className="fl">
                      <label>تاريخ بدء الشراكة</label>
                      <input type="date" value={partnerForm.startDate} onChange={fldP('startDate')} />
                    </div>
                    <AttachmentField
                      fileData={partnerForm.fileData}
                      fileName={partnerForm.fileName}
                      onAttach={(data, name) => setPartnerForm(f => ({ ...f, fileData: data, fileName: name }))}
                      onError={msg => toast('⚠️ ' + msg, 'er')}
                    />
                    <div className="fl full">
                      <label>ملاحظات وبنود الاتفاقية</label>
                      <textarea value={partnerForm.notes} onChange={fldP('notes')} rows={3} placeholder="أي شروط، خصومات، أو خدمات متبادلة..." />
                    </div>
                  </div>
                </div>
                <div className="fa">
                  <button type="button" className="btn btn-p" onClick={savePartner}>💾 حفظ الشريك</button>
                  <button type="button" className="btn btn-g" onClick={() => setShowPartnerForm(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. تبويب المالية والتحصيلات (المدير فقط) */}
      {/* ========================================================================= */}
      {tab === 'finance' && (
        <div>
          {!isManager ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--err)', background: 'var(--g0)', borderRadius: 'var(--r)', border: '1px solid var(--border-color)' }}>
              🔒 البيانات المالية متاحة للمدير الرئيسي فقط.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* شريط الإحصائيات المالي الموحد */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div className="unified-stat-box" style={{ borderRight: '4px solid var(--ok)' }}>
                  <div className="stat-label">💰 إجمالي الإيرادات المحصلة</div>
                  <div className="stat-val" style={{ color: 'var(--ok)' }}>{totalIncome.toLocaleString()} {currSym}</div>
                  <div className="stat-sub">{income.length} سندات قبض وتوريدات</div>
                </div>

                <div className="unified-stat-box" style={{ borderRight: '4px solid var(--err)' }}>
                  <div className="stat-label">🧾 إجمالي المصروفات والتشغيل</div>
                  <div className="stat-val" style={{ color: 'var(--err)' }}>{totalExpenses.toLocaleString()} {currSym}</div>
                  <div className="stat-sub">{expenses.length} فواتير وسندات صرف</div>
                </div>

                <div className="unified-stat-box" style={{ borderRight: `4px solid ${netBalance >= 0 ? 'var(--ok)' : 'var(--err)'}` }}>
                  <div className="stat-label">📊 الرصيد المالي الصافي</div>
                  <div className="stat-val" style={{ color: netBalance >= 0 ? 'var(--ok)' : 'var(--err)' }}>
                    {netBalance.toLocaleString()} {currSym}
                  </div>
                  <div className="stat-sub">{netBalance >= 0 ? 'فائض مالي متاح ✅' : 'عجز تشغيلي ⚠️'}</div>
                </div>
              </div>

              {/* شريط الإجراءات السريعة والتصنيفات */}
              <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)', border: '1px solid var(--border-color)', padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>اختيار سريع حسب البند المالي:</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="btn btn-p btn-sm" onClick={openFinanceOther} style={{ fontWeight: 700 }}>
                      ➕ تسجيل حركة عامة
                    </button>
                    <button type="button" className="btn btn-g btn-sm no-print" onClick={() => window.print()}>
                      🖨️ طباعة
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {FINANCE_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className="btn btn-g btn-xs"
                      onClick={() => openFinanceByCategory(cat.id)}
                      style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* عرض ثنائي للأعمدة: الإيرادات والمصروفات */}
              <div className="g2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                {/* عمود الإيرادات */}
                <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)' }}>
                  <div className="wg-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.1rem' }}>💰</span>
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>سجل الإيرادات</h3>
                    </div>
                    <span className="bdg b-gr">{income.length} سندات</span>
                  </div>
                  <div className="wg-b p0" style={{ maxHeight: 450, overflowY: 'auto' }}>
                    {income.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-sub)' }}>لا توجد إيرادات مسجلة بعد</div>
                    ) : (
                      [...income].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(x => (
                        <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--text-main)' }}>{x.desc}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>{x.categoryLabel || INCOME_CATS[x.cat] || x.cat} · {x.date}</div>
                          </div>
                          <span style={{ fontWeight: 900, color: 'var(--ok)', fontSize: '0.95rem' }}>{Number(x.amount).toLocaleString()} {currSym}</span>
                          {x.fileData && <a href={x.fileData} download={x.fileName || 'receipt'} className="btn btn-xs btn-g" title="تنزيل المرفق">📎</a>}
                          <button type="button" className="btn btn-xs btn-g" onClick={() => printItem({ ...x, type: 'income', currency: centerData.currency }, 'finance', centerData.logo, centerData.name)} title="طباعة">🖨️</button>
                          <button type="button" className="btn btn-xs btn-g" onClick={() => editFinanceEntry(x, 'income')} title="تعديل">✏️</button>
                          <button type="button" className="btn btn-xs btn-d" onClick={() => { if (!window.confirm('حذف هذا الإيراد؟')) return; lsDel('income', x.id); reload(); }} title="حذف">🗑️</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* عمود المصروفات */}
                <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)' }}>
                  <div className="wg-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.1rem' }}>🧾</span>
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>سجل المصروفات والتشغيل</h3>
                    </div>
                    <span className="bdg b-or">{expenses.length} سندات</span>
                  </div>
                  <div className="wg-b p0" style={{ maxHeight: 450, overflowY: 'auto' }}>
                    {expenses.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-sub)' }}>لا توجد مصروفات مسجلة بعد</div>
                    ) : (
                      [...expenses].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(x => (
                        <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--text-main)' }}>{x.desc}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>{x.categoryLabel || EXPENSE_CATS[x.cat] || x.cat} · {x.date}</div>
                          </div>
                          <span style={{ fontWeight: 900, color: 'var(--err)', fontSize: '0.95rem' }}>{Number(x.amount).toLocaleString()} {currSym}</span>
                          {x.fileData && <a href={x.fileData} download={x.fileName || 'expense'} className="btn btn-xs btn-g" title="تنزيل المرفق">📎</a>}
                          <button type="button" className="btn btn-xs btn-g" onClick={() => printItem({ ...x, type: 'expense', currency: centerData.currency }, 'finance', centerData.logo, centerData.name)} title="طباعة">🖨️</button>
                          <button type="button" className="btn btn-xs btn-g" onClick={() => editFinanceEntry(x, 'expense')} title="تعديل">✏️</button>
                          <button type="button" className="btn btn-xs btn-d" onClick={() => { if (!window.confirm('حذف هذا المصروف؟')) return; lsDel('expenses', x.id); reload(); }} title="حذف">🗑️</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Modal: Add/Edit Finance */}
              {showFinanceForm && (
                <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowFinanceForm(false); }}>
                  <div className="mb mb-sm" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                    <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
                      <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{financeEditId ? '✏️ تعديل حركة مالية' : '💳 تسجيل حركة مالية'}</h2>
                    </div>
                    <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
                      <div className="fg c2">
                        <div className="fl">
                          <label>نوع الحركة</label>
                          <select value={financeForm.type} onChange={e => setFinanceForm(f => ({ ...f, type: e.target.value }))}>
                            <option value="income">إيراد (قبض) 💰</option>
                            <option value="expense">مصروف (صرف) 🧾</option>
                          </select>
                        </div>
                        <div className="fl">
                          <label>الفئة المحاسبية</label>
                          <select
                            value={financeForm.categoryId}
                            onChange={e => {
                              const cat = FINANCE_CATEGORIES.find(c => c.id === e.target.value);
                              setFinanceForm(f => ({
                                ...f,
                                categoryId: e.target.value,
                                categoryLabel: cat?.label || '13- أخرى',
                                type: e.target.value === '13' ? f.type : (cat?.type || f.type),
                                itemType: cat?.items?.[0] || 'أخرى',
                                itemTypeOther: '',
                                desc: ''
                              }));
                            }}
                          >
                            {FINANCE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                            <option value="13">13- أخرى</option>
                          </select>
                        </div>
                        <div className="fl">
                          <label>البند المعتمد</label>
                          <select
                            value={financeForm.itemType || 'أخرى'}
                            onChange={e => setFinanceForm(f => ({ ...f, itemType: e.target.value, desc: e.target.value === 'أخرى' ? '' : (e.target.value || '') }))}
                          >
                            {((FINANCE_CATEGORIES.find(c => c.id === financeForm.categoryId)?.items) || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            <option value="أخرى">أخرى (مخصص)</option>
                          </select>
                        </div>
                        {financeForm.itemType === 'أخرى' && (
                          <div className="fl full">
                            <label>اكتب البند يدوياً <span className="req">*</span></label>
                            <input value={financeForm.itemTypeOther || ''} onChange={e => setFinanceForm(f => ({ ...f, itemTypeOther: e.target.value, desc: e.target.value }))} placeholder="اكتب اسم البند هنا..." />
                          </div>
                        )}
                        <div className="fl full">
                          <label>الوصف / البيان <span className="req">*</span></label>
                          <input value={financeForm.desc} onChange={e => setFinanceForm(f => ({ ...f, desc: e.target.value }))} placeholder="البيان التوضيحي للسند..." />
                        </div>
                        <div className="fl">
                          <label>المبلغ ({currSym}) <span className="req">*</span></label>
                          <input type="number" value={financeForm.amount} onChange={e => setFinanceForm(f => ({ ...f, amount: e.target.value }))} min="0" />
                        </div>
                        <div className="fl">
                          <label>التاريخ <span className="req">*</span></label>
                          <input type="date" value={financeForm.date} onChange={e => setFinanceForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                        <div className="fl full">
                          <label>مرفق السند (فاتورة / إيصال)</label>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFinanceFile} />
                          {financeForm.fileName && <div style={{ fontSize: '.78rem', marginTop: 6, color: 'var(--ok)' }}>📎 {financeForm.fileName}</div>}
                        </div>
                        <div className="fl full">
                          <label>ملاحظات إضافية</label>
                          <textarea value={financeForm.notes} onChange={e => setFinanceForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                        </div>
                      </div>
                    </div>
                    <div className="fa">
                      <button type="button" className="btn btn-p" onClick={saveFinanceEntry}>💾 حفظ الحركة</button>
                      <button type="button" className="btn btn-g" onClick={() => setShowFinanceForm(false)}>إلغاء</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. تبويب أولياء الأمور والتواصل الأسري */}
      {/* ========================================================================= */}
      {tab === 'parents' && (
        <div>
          {!canView ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--err)', background: 'var(--g0)', borderRadius: 'var(--r)', border: '1px solid var(--border-color)' }}>
              🔒 قسم أولياء الأمور متاح للإدارة والإشراف فقط.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* شريط الإحصائيات الموحد */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pr)' }}>
                  <div className="stat-label">👨‍👩‍👧 أولياء الأمور المسجلين</div>
                  <div className="stat-val" style={{ color: 'var(--pr)' }}>{allParents.length}</div>
                  <div className="stat-sub">أولياء أمور مستخرجون من ملفات الطلاب</div>
                </div>

                <div className="unified-stat-box" style={{ borderRight: '4px solid var(--ok)' }}>
                  <div className="stat-label">📋 التفاعلات والزيارات</div>
                  <div className="stat-val" style={{ color: 'var(--ok)' }}>{parentLogs.length}</div>
                  <div className="stat-sub">زيارات ومكالمات وجلسات إرشاد</div>
                </div>

                <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pur, #7c3aed)' }}>
                  <div className="stat-label">🎓 الطلاب المرتبطون</div>
                  <div className="stat-val" style={{ color: 'var(--pur, #7c3aed)' }}>
                    {students.filter(s => s.parentPhone || s.parentName).length}
                  </div>
                  <div className="stat-sub">طالب مربوط ببيانات ولي أمره</div>
                </div>
              </div>

              {/* إذا تم اختيار ولي أمر لعرض سجله */}
              {selParent && (
                <div className="wg" style={{ margin: 0, borderRadius: 'var(--r)', border: '2px solid var(--pr)' }}>
                  <div className="wg-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.2rem' }}>📇</span>
                      <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>
                        {selParent.name || 'ولي أمر'} · {selParent.phone}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-p btn-sm"
                        onClick={() => {
                          setParentLogForm({ ...EMPTY_PARENT_LOG, parentKey: selParent.key, type: 'visit', date: todayStr() });
                          setShowParentLogForm(true);
                        }}
                      >
                        ➕ تسجيل تفاعل جديد
                      </button>
                      <button type="button" className="btn btn-g btn-sm" onClick={() => setSelParent(null)}>إغلاق الملف ✕</button>
                    </div>
                  </div>
                  <div className="wg-b" style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '.84rem', marginBottom: 12, color: 'var(--text-sub)' }}>
                      👨‍👩‍👧 الطلاب التابعون: <b>{(selParent.studentIds || []).map(id => students.find(s => s.id === id)?.name).filter(Boolean).join('، ') || '—'}</b>
                    </div>
                    <div style={{ fontSize: '.82rem', fontWeight: 800, color: 'var(--pr)', marginBottom: 10 }}>
                      📋 سجل التواصل والمتابعة ({parentLogs.filter(l => l.parentKey === selParent.key).length} حركة):
                    </div>
                    {parentLogs.filter(l => l.parentKey === selParent.key).length === 0 ? (
                      <div style={{ color: 'var(--text-sub)', padding: '16px', textAlign: 'center', background: 'var(--g0)', borderRadius: 8 }}>
                        لا توجد سجلات تواصل بعد — يمكنك تسجيل زيارة، مكالمة، أو جلسة إرشادية الآن.
                      </div>
                    ) : (
                      parentLogs
                        .filter(l => l.parentKey === selParent.key)
                        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
                        .map(l => (
                          <div key={l.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', fontSize: '.86rem', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <span style={{ fontSize: '1.2rem' }}>
                              {l.type === 'visit' ? '🏠' : l.type === 'call' ? '📞' : l.type === 'guidance' ? '🧑‍💼' : '💬'}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 800 }}>{PARENT_TYPE_LABEL[l.type] || l.type}</span>
                                <span className="bdg b-bl" style={{ fontSize: '0.72rem' }}>{l.date}</span>
                              </div>
                              {l.notes && <div style={{ marginTop: 4, color: 'var(--text-main)', fontSize: '0.84rem' }}>{l.notes}</div>}
                              {l.fileData && (
                                <a href={l.fileData} download={l.fileName || 'parent-log'} className="btn btn-xs btn-g" style={{ marginTop: 6, display: 'inline-flex' }}>
                                  📎 {l.fileName || 'مرفق'}
                                </a>
                              )}
                            </div>
                            {isManager && (
                              <button
                                type="button"
                                className="btn btn-xs btn-d"
                                onClick={() => {
                                  if (!window.confirm('حذف هذا السجل؟')) return;
                                  lsDel('parentInteractions', l.id);
                                  setParentLogs(lsGet('parentInteractions'));
                                  toast('🗑️ تم الحذف', 'ok');
                                }}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* شريط البحث في أولياء الأمور */}
              <div style={{ position: 'relative', maxWidth: 360 }}>
                <Search style={{ position: 'absolute', right: 10, top: 11, width: 16, height: 16, color: 'var(--text-sub)' }} />
                <input
                  type="text"
                  placeholder="بحث باسم ولي الأمر، الجوال، أو اسم الطالب..."
                  value={searchParent}
                  onChange={e => setSearchParent(e.target.value)}
                  style={{ width: '100%', height: 38, paddingRight: 34, borderRadius: 8, fontSize: '0.84rem' }}
                />
              </div>

              {/* بطاقات أولياء الأمور */}
              {filteredParents.length === 0 ? (
                <EmptyState icon="👨‍👩‍👧" title="لا توجد بيانات أولياء أمور مطابقة" sub="تأكد من تسجيل أسماء وأرقام أولياء الأمور داخل ملفات الطلاب" />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                  {filteredParents.map(p => {
                    const studentNames = (p.studentIds || []).map(id => students.find(s => s.id === id)?.name).filter(Boolean);
                    return (
                      <div key={p.key} className="wg" style={{ margin: 0, borderRadius: 'var(--r)', border: '1px solid var(--border-color)', padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ cursor: 'pointer' }} onClick={() => setSelParent(p)}>
                            <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--pr)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>👤</span>
                              <span>{p.name || 'ولي أمر غير محدد'}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', direction: 'ltr', textAlign: 'right' }}>{p.phone || 'لا يوجد جوال'}</div>
                          </div>
                          <span className="bdg b-gr" style={{ fontSize: '0.72rem' }}>
                            {parentLogs.filter(l => l.parentKey === p.key).length} تفاعلات
                          </span>
                        </div>

                        {studentNames.length > 0 && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)', marginBottom: 10 }}>
                            الطلاب: <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{studentNames.join('، ')}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 10, flexWrap: 'wrap' }}>
                          {p.phone && (
                            <a
                              href={`https://wa.me/${p.phone.replace(/[^0-9+]/g, '').replace(/^0/, '966')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-xs btn-bl"
                              title="واتساب"
                            >
                              💬
                            </a>
                          )}
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => {
                              setParentLogForm({ ...EMPTY_PARENT_LOG, parentKey: p.key, type: 'visit', date: todayStr() });
                              setShowParentLogForm(true);
                            }}
                          >
                            🏠 زيارة
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => {
                              setParentLogForm({ ...EMPTY_PARENT_LOG, parentKey: p.key, type: 'call', date: todayStr() });
                              setShowParentLogForm(true);
                            }}
                          >
                            📞 مكالمة
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-s"
                            onClick={() => {
                              setParentLogForm({ ...EMPTY_PARENT_LOG, parentKey: p.key, type: 'guidance', date: todayStr() });
                              setShowParentLogForm(true);
                            }}
                          >
                            🧑‍💼 إرشاد
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-p"
                            onClick={() => setSelParent(p)}
                            title="فتح السجل الكامل"
                          >
                            الملف 📋
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Modal: Parent Log Form */}
              {showParentLogForm && (
                <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowParentLogForm(false); }}>
                  <div className="mb mb-sm" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                    <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
                      <h2 style={{ margin: 0, fontSize: '1.05rem' }}>تسجيل {PARENT_TYPE_LABEL[parentLogForm.type]} مع ولي الأمر</h2>
                    </div>
                    <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
                      <div className="fg c2">
                        <div className="fl">
                          <label>نوع التفاعل</label>
                          <select value={parentLogForm.type} onChange={fldPL('type')}>
                            <option value="visit">🏠 زيارة حضورية للمركز</option>
                            <option value="call">📞 مكالمة هاتفية</option>
                            <option value="guidance">🧑‍💼 جلسة إرشاد وتوجيه أسري</option>
                          </select>
                        </div>
                        <div className="fl">
                          <label>التاريخ</label>
                          <input type="date" value={parentLogForm.date} onChange={fldPL('date')} />
                        </div>
                        <AttachmentField
                          fileData={parentLogForm.fileData}
                          fileName={parentLogForm.fileName}
                          onAttach={(data, name) => setParentLogForm(f => ({ ...f, fileData: data, fileName: name }))}
                          onError={msg => toast('⚠️ ' + msg, 'er')}
                        />
                        <div className="fl full">
                          <label>ملاحظات وتفاصيل التفاعل</label>
                          <textarea value={parentLogForm.notes} onChange={fldPL('notes')} rows={3} placeholder="ما تم مناقشته وتوصيات الجلسة..." />
                        </div>
                      </div>
                    </div>
                    <div className="fa">
                      <button type="button" className="btn btn-p" onClick={saveParentLog}>💾 حفظ السجل</button>
                      <button type="button" className="btn btn-g" onClick={() => setShowParentLogForm(false)}>إلغاء</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. تبويب خدمة الباص والنقل (المدير فقط) */}
      {/* ========================================================================= */}
      {tab === 'bus' && (
        <div>
          {!isManager ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--err)', background: 'var(--g0)', borderRadius: 'var(--r)', border: '1px solid var(--border-color)' }}>
              🔒 إدارة خدمة الباصات والنقل المدرسي للمدير الرئيسي فقط.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* شريط الإحصائيات الموحد */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pr)' }}>
                  <div className="stat-label">🚌 إجمالي الحافلات المعتمدة</div>
                  <div className="stat-val" style={{ color: 'var(--pr)' }}>{buses.length}</div>
                  <div className="stat-sub">باصات مجهزة لنقل الطلاب</div>
                </div>

                <div className="unified-stat-box" style={{ borderRight: '4px solid var(--ok)' }}>
                  <div className="stat-label">👥 الطلاب المستفيدون</div>
                  <div className="stat-val" style={{ color: 'var(--ok)' }}>
                    {buses.reduce((acc, b) => acc + (b.studentIds || []).length, 0)}
                  </div>
                  <div className="stat-sub">طالب مسكن على خطوط السير</div>
                </div>

                <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pur, #7c3aed)' }}>
                  <div className="stat-label">📍 خطوط السير النشطة</div>
                  <div className="stat-val" style={{ color: 'var(--pur, #7c3aed)' }}>
                    {buses.filter(b => (b.route || '').trim()).length}
                  </div>
                  <div className="stat-sub">مسارات نقل محددة ومعتمدة</div>
                </div>
              </div>

              {/* شريط الإجراءات والبحث */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ position: 'relative', width: 280 }}>
                  <Search style={{ position: 'absolute', right: 10, top: 11, width: 16, height: 16, color: 'var(--text-sub)' }} />
                  <input
                    type="text"
                    placeholder="بحث برقم الباص، السائق، أو خط السير..."
                    value={searchBus}
                    onChange={e => setSearchBus(e.target.value)}
                    style={{ width: '100%', height: 38, paddingRight: 34, borderRadius: 8, fontSize: '0.84rem' }}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-p"
                  onClick={() => { setBusForm({ ...EMPTY_BUS, studentIds: [] }); setBusEditId(null); setShowBusForm(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <Plus style={{ width: 16, height: 16 }} />
                  <span>باص جديد</span>
                </button>
              </div>

              {/* بطاقات الحافلات */}
              {filteredBuses.length === 0 ? (
                <EmptyState icon="🚌" title="لا توجد حافلات مسجلة" sub="أضف باصات المركز وقم بربط الطلاب والسائقين بها" />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                  {filteredBuses.map(b => {
                    const names = (b.studentIds || []).map(id => students.find(s => s.id === id)?.name).filter(Boolean);
                    return (
                      <div key={b.id} className="wg" style={{ margin: 0, borderRadius: 'var(--r)', border: '1px solid var(--border-color)', padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--g1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                              🚌
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>باص رقم {b.busNumber}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                                السائق: {b.driverPhone || '—'}
                              </div>
                            </div>
                          </div>
                          <span className="bdg b-bl" style={{ fontWeight: 800, fontSize: '0.76rem' }}>{names.length} طلاب</span>
                        </div>

                        {b.route && (
                          <div style={{ fontSize: '0.82rem', background: 'var(--g0)', padding: '8px 12px', borderRadius: 8, marginBottom: 10, border: '1px solid var(--border-color)' }}>
                            <span style={{ fontWeight: 700, color: 'var(--pr)' }}>📍 المسار: </span>
                            <span>{b.route}</span>
                          </div>
                        )}

                        {names.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginBottom: 4 }}>الطلاب المسجلون بهذا الباص:</div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {names.map((nm, idx) => (
                                <span key={idx} className="bdg b-gy" style={{ fontSize: '0.72rem' }}>{nm}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {b.notes && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: 10 }}>
                            {b.notes}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                          <button
                            type="button"
                            className="btn btn-xs btn-g"
                            onClick={() => { setBusForm({ ...EMPTY_BUS, ...b, studentIds: b.studentIds || [] }); setBusEditId(b.id); setShowBusForm(true); }}
                            title="تعديل"
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-d"
                            onClick={() => delBus(b.id)}
                            title="حذف"
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Modal: Add/Edit Bus */}
              {showBusForm && (
                <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowBusForm(false); }}>
                  <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                    <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
                      <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{busEditId ? '✏️ تعديل بيانات الباص' : '🚌 تسجيل باص جديد'}</h2>
                    </div>
                    <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
                      <div className="fg c2">
                        <div className="fl">
                          <label>رقم أو معرف الباص <span className="req">*</span></label>
                          <input value={busForm.busNumber} onChange={fldB('busNumber')} placeholder="باص 1، حافلة 202..." />
                        </div>
                        <div className="fl">
                          <label>جوال السائق</label>
                          <input type="tel" value={busForm.driverPhone} onChange={fldB('driverPhone')} placeholder="05XXXXXXXX" />
                        </div>
                        <div className="fl full">
                          <label>خط السير والمناطق</label>
                          <textarea value={busForm.route} onChange={fldB('route')} rows={2} placeholder="الأحياء والمحطات..." />
                        </div>
                        <AttachmentField
                          fileData={busForm.fileData}
                          fileName={busForm.fileName}
                          onAttach={(data, name) => setBusForm(f => ({ ...f, fileData: data, fileName: name }))}
                          onError={msg => toast('⚠️ ' + msg, 'er')}
                        />
                        <div className="fl full">
                          <label>ملاحظات</label>
                          <textarea value={busForm.notes} onChange={fldB('notes')} rows={2} />
                        </div>
                        <div className="fl full">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label style={{ margin: 0 }}>تسكين الطلاب في هذا الباص (تم تحديد {(busForm.studentIds || []).length} طلاب)</label>
                            <input
                              type="text"
                              placeholder="تصفية أسماء الطلاب..."
                              value={busStudentSearch}
                              onChange={e => setBusStudentSearch(e.target.value)}
                              style={{ width: 180, height: 30, fontSize: '0.78rem', borderRadius: 6 }}
                            />
                          </div>
                          <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, padding: 10, background: 'var(--g0)' }}>
                            {students
                              .filter(s => !['inactive', 'transferred', 'rejected'].includes(s.status))
                              .filter(s => !busStudentSearch.trim() || (s.name || '').toLowerCase().includes(busStudentSearch.toLowerCase()))
                              .map(s => (
                                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.84rem', padding: '4px 0', cursor: 'pointer' }}>
                                  <input type="checkbox" checked={(busForm.studentIds || []).includes(s.id)} onChange={() => toggleBusStudent(s.id)} />
                                  <span style={{ fontWeight: (busForm.studentIds || []).includes(s.id) ? 800 : 500 }}>{s.name}</span>
                                  {s.className && <span className="bdg b-gy" style={{ fontSize: '0.7rem' }}>{s.className}</span>}
                                </label>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="fa">
                      <button type="button" className="btn btn-p" onClick={saveBus}>💾 حفظ الباص</button>
                      <button type="button" className="btn btn-g" onClick={() => setShowBusForm(false)}>إلغاء</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. تبويب الوثائق واللوائح والتعاميم */}
      {/* ========================================================================= */}
      {tab === 'docs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* تنويه الجزاءات */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--warn-l)', border: '1px solid #fde68a', borderRadius: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span style={{ flex: 1, fontSize: '.84rem', color: 'var(--warn)' }}>انتقل نظام "الجزاءات والإنذارات" إلى صفحة الموظفين ليكون مرتبطاً بملفات الكوادر مباشرة.</span>
            <button type="button" className="btn btn-p btn-sm" onClick={() => go('hr-warnings')}>فتح صفحة الجزاءات ←</button>
          </div>

          {/* شريط التبويبات الفرعية للوثائق والبحث */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div className="tabs" style={{ margin: 0 }}>
              {[
                ['all', 'الكل'],
                ['stats', 'إحصائية'],
                ['policy', 'لائحة'],
                ['report', 'تقرير'],
                ['memo', 'مذكرة'],
                ['circular', 'تعميم']
              ].map(([v, l]) => (
                <button key={v} type="button" className={`tab ${docTab === v ? 'on' : ''}`} onClick={() => setDocTab(v)} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  {l}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 240 }}>
                <Search style={{ position: 'absolute', right: 10, top: 11, width: 15, height: 15, color: 'var(--text-sub)' }} />
                <input
                  type="text"
                  placeholder="بحث في الوثائق..."
                  value={searchDoc}
                  onChange={e => setSearchDoc(e.target.value)}
                  style={{ width: '100%', height: 36, paddingRight: 32, borderRadius: 8, fontSize: '0.82rem' }}
                />
              </div>
              {isManager && (
                <button
                  type="button"
                  className="btn btn-p btn-sm"
                  onClick={() => { setDocForm({ ...EMPTY_DOC, date: todayStr() }); setDocEditId(null); setShowDocForm(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <Plus style={{ width: 15, height: 15 }} />
                  <span>إضافة وثيقة</span>
                </button>
              )}
            </div>
          </div>

          {/* قائمة الوثائق */}
          {filteredDocs.length === 0 ? (
            <EmptyState icon="📄" title="لا توجد وثائق" sub="قم برفع وأرشفة اللوائح، الإحصائيات الوزارية، والتقارير التنظيمية" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {filteredDocs.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(d => (
                <div key={d.id} className="wg" style={{ margin: 0, borderRadius: 'var(--r)', border: '1px solid var(--border-color)', padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.2rem' }}>📄</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>{d.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                          {d.org ? `${d.org} · ` : ''}{d.date || '—'}
                        </div>
                      </div>
                    </div>
                    <span className="bdg b-cy" style={{ fontSize: '0.72rem' }}>{DOC_TYPES[d.type] || d.type}</span>
                  </div>

                  {d.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: 10 }}>{d.notes}</div>}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 10, flexWrap: 'wrap' }}>
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noreferrer" className="btn btn-xs btn-bl" title="فتح الرابط الخارجي">
                        🔗 رابط
                      </a>
                    )}
                    {d.fileData && (
                      <a href={d.fileData} download={d.fileName || 'file'} className="btn btn-xs btn-g" title="تنزيل الملف">
                        📥 تنزيل
                      </a>
                    )}
                    <button type="button" className="btn btn-xs btn-g" onClick={() => printItem(d, 'document', centerData.logo, centerData.name)} title="طباعة">
                      🖨️
                    </button>
                    {isManager && (
                      <>
                        <button type="button" className="btn btn-xs btn-g" onClick={() => { setDocForm({ ...d }); setDocEditId(d.id); setShowDocForm(true); }} title="تعديل">
                          ✏️
                        </button>
                        <button type="button" className="btn btn-xs btn-d" onClick={() => { if (!window.confirm('حذف هذه الوثيقة؟')) return; lsDel('centerDocs', d.id); reload(); toast('🗑️ تم الحذف', 'ok'); }} title="حذف">
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal: Add/Edit Doc */}
          {showDocForm && (
            <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowDocForm(false); }}>
              <div className="mb" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
                  <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{docEditId ? '✏️ تعديل الوثيقة' : '➕ إضافة وثيقة رسمية'}</h2>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <div className="fg c2">
                    <div className="fl full">
                      <label>اسم الوثيقة <span className="req">*</span></label>
                      <input value={docForm.name} onChange={fldD('name')} placeholder="مثال: لائحة العمل الداخلية، تقرير المتابعة السنوي..." />
                    </div>
                    <div className="fl">
                      <label>نوع الوثيقة</label>
                      <select value={docForm.type} onChange={fldD('type')}>
                        {Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div className="fl">
                      <label>التاريخ</label>
                      <input type="date" value={docForm.date} onChange={fldD('date')} />
                    </div>
                    <div className="fl full">
                      <label>الجهة المصدرة</label>
                      <input value={docForm.org} onChange={fldD('org')} placeholder="وزارة الموارد البشرية، التعليم، إدارة المركز..." />
                    </div>
                    <div className="fl full">
                      <label>رابط سحابي للوثيقة (اختياري)</label>
                      <input type="url" value={docForm.url} onChange={fldD('url')} placeholder="https://..." />
                    </div>
                    <div className="fl full">
                      <label>رفع ملف (PDF / صورة)</label>
                      <div
                        onClick={() => document.getElementById('doc-file-inp').click()}
                        style={{ border: '2px dashed var(--border-color)', borderRadius: 10, padding: 18, textAlign: 'center', cursor: 'pointer', background: 'var(--g0)' }}
                      >
                        {docForm.fileName ? (
                          <span style={{ color: 'var(--ok)', fontWeight: 700 }}>{docForm.fileName} ✅</span>
                        ) : (
                          <>
                            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>📎</div>
                            <div style={{ fontSize: '.82rem', color: 'var(--text-sub)' }}>اضغط لرفع ملف PDF أو مستند رسمي</div>
                          </>
                        )}
                      </div>
                      <input id="doc-file-inp" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: 'none' }} onChange={handleDocFile} />
                    </div>
                    <div className="fl full">
                      <label>ملاحظات</label>
                      <textarea value={docForm.notes} onChange={fldD('notes')} rows={2} />
                    </div>
                  </div>
                </div>
                <div className="fa">
                  <button type="button" className="btn btn-p" onClick={saveDoc}>💾 حفظ الوثيقة</button>
                  <button type="button" className="btn btn-g" onClick={() => setShowDocForm(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. تبويب العهدة والموجودات والأصول */}
      {/* ========================================================================= */}
      {tab === 'custody' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* شريط الإحصائيات الموحد */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pr)' }}>
              <div className="stat-label">🗄️ أصناف العهدة والموجودات</div>
              <div className="stat-val" style={{ color: 'var(--pr)' }}>{custody.length}</div>
              <div className="stat-sub">صنف ومعدة مسجلة بالنظام</div>
            </div>

            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--ok)' }}>
              <div className="stat-label">📦 الكمية الإجمالية للموجودات</div>
              <div className="stat-val" style={{ color: 'var(--ok)' }}>
                {custody.reduce((s, x) => s + (Number(x.quantity) || 0), 0)}
              </div>
              <div className="stat-sub">إجمالي القطع والأجهزة المعتمدة</div>
            </div>

            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--warn)' }}>
              <div className="stat-label">🔧 بحاجة صيانة / فحص</div>
              <div className="stat-val" style={{ color: 'var(--warn)' }}>
                {custody.filter(c => c.condition === 'يحتاج صيانة' || c.condition === 'معطل').length}
              </div>
              <div className="stat-sub">أجهزة تتطلب التدخل الفني</div>
            </div>
          </div>

          {/* شريط الفلترة والبحث */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 240 }}>
                <Search style={{ position: 'absolute', right: 10, top: 11, width: 15, height: 15, color: 'var(--text-sub)' }} />
                <input
                  type="text"
                  placeholder="بحث بالاسم، الموقع..."
                  value={searchCustody}
                  onChange={e => setSearchCustody(e.target.value)}
                  style={{ width: '100%', height: 36, paddingRight: 32, borderRadius: 8, fontSize: '0.82rem' }}
                />
              </div>

              <select
                value={custodyCatFilter}
                onChange={e => setCustodyCatFilter(e.target.value)}
                style={{ height: 36, borderRadius: 8, fontSize: '0.82rem' }}
              >
                <option value="all">كل فئات العهدة</option>
                {CUSTODY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {isManager && (
              <button
                type="button"
                className="btn btn-p"
                onClick={() => { setCustodyForm({ ...EMPTY_CUSTODY }); setCustodyEditId(null); setShowCustodyForm(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              >
                <Plus style={{ width: 16, height: 16 }} />
                <span>إضافة عهدة</span>
              </button>
            )}
          </div>

          {/* بطاقات العهدة */}
          {filteredCustody.length === 0 ? (
            <EmptyState icon="🗄️" title="لا توجد عهد مسجلة" sub="قم بحصر وتوثيق أصول المركز، الأجهزة، والأثاث والوسائل التعليمية" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {filteredCustody.map(c => {
                const isGood = c.condition === 'جيد';
                const isWarning = c.condition === 'مقبول' || c.condition === 'يحتاج صيانة';
                return (
                  <div key={c.id} className="wg" style={{ margin: 0, borderRadius: 'var(--r)', border: '1px solid var(--border-color)', padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.2rem' }}>🗄️</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-main)' }}>{c.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>{c.category || 'عام'} · الموقع: {c.location || 'غير محدد'}</div>
                        </div>
                      </div>
                      <span className="bdg b-bl" style={{ fontWeight: 800 }}>الكمية: {c.quantity}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>الحالة التشغيلية:</span>
                      <span className={`bdg ${isGood ? 'b-gr' : isWarning ? 'b-or' : 'b-re'}`} style={{ fontSize: '0.72rem' }}>
                        {c.condition || 'جيد'}
                      </span>
                    </div>

                    {c.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: 10 }}>{c.notes}</div>}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                      <button type="button" className="btn btn-xs btn-g" onClick={() => printItem({ ...c, fileData: c.fileData }, 'custody', centerData.logo, centerData.name)} title="طباعة سند العهدة">
                        🖨️
                      </button>
                      {isManager && (
                        <>
                          <button type="button" className="btn btn-xs btn-g" onClick={() => { setCustodyForm({ ...c }); setCustodyEditId(c.id); setShowCustodyForm(true); }} title="تعديل">
                            ✏️
                          </button>
                          <button type="button" className="btn btn-xs btn-d" onClick={() => { if (!window.confirm('حذف هذا الصنف؟')) return; lsDel('custody', c.id); reload(); toast('🗑️ تم الحذف', 'ok'); }} title="حذف">
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal: Add/Edit Custody */}
          {showCustodyForm && (
            <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowCustodyForm(false); }}>
              <div className="mb mb-sm" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
                  <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{custodyEditId ? '✏️ تعديل بيانات العهدة' : '🗄️ إضافة عهدة / أصل جديد'}</h2>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <div className="fg c2">
                    <div className="fl full">
                      <label>اسم الصنف / المعدة <span className="req">*</span></label>
                      <input value={custodyForm.name} onChange={fldC('name')} placeholder="شاشة ذكية، جهاز حاسوب، طاولة علاج طبيعي..." />
                    </div>
                    <div className="fl full">
                      <label>الفئة</label>
                      <select value={custodyForm.category} onChange={fldC('category')}>
                        {CUSTODY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="fl">
                      <label>الكمية</label>
                      <input type="number" value={custodyForm.quantity} onChange={fldC('quantity')} min="1" />
                    </div>
                    <div className="fl">
                      <label>الموقع / القاعة</label>
                      <input value={custodyForm.location} onChange={fldC('location')} placeholder="قاعة التكامل الحسي، المستودع..." />
                    </div>
                    <div className="fl full">
                      <label>الحالة التشغيلية</label>
                      <select value={custodyForm.condition} onChange={fldC('condition')}>
                        <option>جيد</option>
                        <option>مقبول</option>
                        <option>يحتاج صيانة</option>
                        <option>معطل</option>
                      </select>
                    </div>
                    <AttachmentField
                      fileData={custodyForm.fileData}
                      fileName={custodyForm.fileName}
                      onAttach={(data, name) => setCustodyForm(f => ({ ...f, fileData: data, fileName: name }))}
                      onError={msg => toast('⚠️ ' + msg, 'er')}
                    />
                    <div className="fl full">
                      <label>ملاحظات ومواصفات إضافية</label>
                      <textarea value={custodyForm.notes} onChange={fldC('notes')} rows={2} />
                    </div>
                  </div>
                </div>
                <div className="fa">
                  <button type="button" className="btn btn-p" onClick={saveCustody}>💾 حفظ العهدة</button>
                  <button type="button" className="btn btn-g" onClick={() => setShowCustodyForm(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. تبويب الزيارات والوفود الرسمية */}
      {/* ========================================================================= */}
      {tab === 'visits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* شريط الإحصائيات الموحد */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pr)' }}>
              <div className="stat-label">🏛️ إجمالي الزيارات المسجلة</div>
              <div className="stat-val" style={{ color: 'var(--pr)' }}>{visits.length}</div>
              <div className="stat-sub">زيارات ووفود معتمدة بالمركز</div>
            </div>

            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--ok)' }}>
              <div className="stat-label">🔍 إشرافية وتفتيشية</div>
              <div className="stat-val" style={{ color: 'var(--ok)' }}>
                {visits.filter(v => v.type === 'تفتيشية' || v.type === 'إشرافية').length}
              </div>
              <div className="stat-sub">وفود جهات رسمية ورقابية</div>
            </div>

            <div className="unified-stat-box" style={{ borderRight: '4px solid var(--pur, #7c3aed)' }}>
              <div className="stat-label">🤝 دعم وتطوير وشراكات</div>
              <div className="stat-val" style={{ color: 'var(--pur, #7c3aed)' }}>
                {visits.filter(v => v.type === 'دعم وتطوير' || v.type === 'متابعة').length}
              </div>
              <div className="stat-sub">مبادرات تطويرية وتدريبية</div>
            </div>
          </div>

          {/* شريط الإجراءات والبحث */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search style={{ position: 'absolute', right: 10, top: 11, width: 16, height: 16, color: 'var(--text-sub)' }} />
              <input
                type="text"
                placeholder="بحث بالجهة، الوفد، أو الغرض..."
                value={searchVisit}
                onChange={e => setSearchVisit(e.target.value)}
                style={{ width: '100%', height: 38, paddingRight: 34, borderRadius: 8, fontSize: '0.84rem' }}
              />
            </div>

            {isManager && (
              <button
                type="button"
                className="btn btn-p"
                onClick={() => { setVisitForm({ ...EMPTY_VISIT, date: todayStr() }); setVisitEditId(null); setShowVisitForm(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              >
                <Plus style={{ width: 16, height: 16 }} />
                <span>تسجيل زيارة</span>
              </button>
            )}
          </div>

          {/* بطاقات الزيارات */}
          {filteredVisits.length === 0 ? (
            <EmptyState icon="🏛️" title="لا توجد زيارات مسجلة" sub="وثق زيارات الجهات الحكومية، وفود الوزارة، والشركاء والمشرفين" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filteredVisits.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(v => (
                <div key={v.id} className="wg" style={{ margin: 0, borderRadius: 'var(--r)', border: '1px solid var(--border-color)', padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--g1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        🏛️
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>{v.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{v.date}</div>
                      </div>
                    </div>
                    {v.type && <span className="bdg b-pu" style={{ fontSize: '0.72rem' }}>{v.type}</span>}
                  </div>

                  {v.delegation && (
                    <div style={{ fontSize: '0.82rem', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-sub)' }}>أعضاء الوفد: </span>
                      <span>{v.delegation}</span>
                    </div>
                  )}

                  {v.purpose && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: 8, background: 'var(--g0)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--pr)' }}>الغرض: </span>
                      <span>{v.purpose}</span>
                    </div>
                  )}

                  {v.result && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--ok)', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700 }}>التوصيات والنتيجة: </span>
                      <span>{v.result}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                    <button type="button" className="btn btn-xs btn-g" onClick={() => printItem({ ...v, fileData: v.fileData }, 'visit', centerData.logo, centerData.name)} title="طباعة محضر الزيارة">
                      🖨️
                    </button>
                    {isManager && (
                      <>
                        <button type="button" className="btn btn-xs btn-g" onClick={() => { setVisitForm({ ...v }); setVisitEditId(v.id); setShowVisitForm(true); }} title="تعديل">
                          ✏️
                        </button>
                        <button type="button" className="btn btn-xs btn-d" onClick={() => { if (!window.confirm('حذف هذه الزيارة؟')) return; lsDel('centerVisits', v.id); reload(); toast('🗑️ تم الحذف', 'ok'); }} title="حذف">
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal: Add/Edit Visit */}
          {showVisitForm && (
            <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowVisitForm(false); }}>
              <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
                <div className="fhd" style={{ padding: '14px 20px', borderRadius: 0 }}>
                  <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{visitEditId ? '✏️ تعديل محضر الزيارة' : '🏛️ تسجيل زيارة / وفد رسمي'}</h2>
                </div>
                <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
                  <div className="fg c2">
                    <div className="fl full">
                      <label>جهة الزيارة <span className="req">*</span></label>
                      <input value={visitForm.name} onChange={fldV('name')} placeholder="وزارة الموارد البشرية والتنمية الاجتماعية..." />
                    </div>
                    <div className="fl">
                      <label>التاريخ <span className="req">*</span></label>
                      <input type="date" value={visitForm.date} onChange={fldV('date')} />
                    </div>
                    <div className="fl">
                      <label>نوع الزيارة</label>
                      <select value={visitForm.type} onChange={fldV('type')}>
                        <option value="">-- اختياري --</option>
                        <option>تفتيشية</option>
                        <option>إشرافية</option>
                        <option>دعم وتطوير</option>
                        <option>متابعة</option>
                        <option>أخرى</option>
                      </select>
                    </div>
                    <div className="fl full">
                      <label>أعضاء الوفد والزوار</label>
                      <input value={visitForm.delegation} onChange={fldV('delegation')} placeholder="أسماء المندوبين والمشرفين الزائرين..." />
                    </div>
                    <div className="fl full">
                      <label>الغرض من الزيارة</label>
                      <textarea value={visitForm.purpose} onChange={fldV('purpose')} rows={2} placeholder="الهدف من الزيارة وأبرز الأقسام المزارة..." />
                    </div>
                    <div className="fl full">
                      <label>النتائج والتوصيات</label>
                      <textarea value={visitForm.result} onChange={fldV('result')} rows={2} placeholder="الملاحظات والتوجيهات المسجلة من الوفد..." />
                    </div>
                    <AttachmentField
                      fileData={visitForm.fileData}
                      fileName={visitForm.fileName}
                      onAttach={(data, name) => setVisitForm(f => ({ ...f, fileData: data, fileName: name }))}
                      onError={msg => toast('⚠️ ' + msg, 'er')}
                    />
                    <div className="fl full">
                      <label>ملاحظات إضافية</label>
                      <textarea value={visitForm.notes} onChange={fldV('notes')} rows={2} />
                    </div>
                  </div>
                </div>
                <div className="fa">
                  <button type="button" className="btn btn-p" onClick={saveVisit}>💾 حفظ محضر الزيارة</button>
                  <button type="button" className="btn btn-g" onClick={() => setShowVisitForm(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
