import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Plus, Search, School, Stethoscope, User, 
  CheckCircle2, AlertCircle, MessageCircle, Edit3, Eye, Trash2, X, Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { DIAGNOSES, SPECIALIST_ROLES } from '../../utils/constants';
import { calcAge, todayStr, uid, nowTimeStr } from '../../utils/dateHelpers';
import StudentDetail from './StudentDetail';
import { parentCanViewStudent, centerWhatsAppUrl } from '../../utils/parentAccess';

const STATUSES = {
  active: 'نشط',
  inactive: 'منقطع',
  graduated: 'متخرج',
  transferred: 'محوّل',
  waitlist: 'قائمة الانتظار',
  rejected: 'غير مناسب'
};

const DEFAULT_SECTIONS = [
  { id: 'sec_autism', name: 'صف اللؤلؤ', type: 'قسم اضطراب طيف التوحد', capacity: 10, supervisorId: '', color: '#4f46e5', icon: '🦪', description: 'برامج التأهيل والتدريب لاضطراب طيف التوحد' },
  { id: 'sec_down', name: 'صف المرجان', type: 'قسم متلازمة داون', capacity: 8, supervisorId: '', color: '#059669', icon: '🪸', description: 'تنمية المهارات الإدراكية والحركية والاجتماعية' },
  { id: 'sec_early', name: 'صف الزمرد', type: 'قسم التدخل المبكر', capacity: 12, supervisorId: '', color: '#7c3aed', icon: '💎', description: 'الرعاية التأهيلية والتدخل المبكر للأطفال' },
];

const EMPTY_STU = {
  name: '', className: '', sectionId: '', dob: '', gender: 'ذكر', nationality: 'سعودي', joinDate: '',
  status: 'active', specialistId: '', sessionTypes: [], diagnosis: '', diagnosis2: '',
  hospital: '', doctor: '', medications: '', medNotes: '', parentName: '', parentPhone: '', parentPhone2: '',
  parentRelation: 'الأب', parentJob: '', parentEmail: '', address: '',
  progMorning: { enabled: false }, progEvening: { enabled: false },
  progSessions: { enabled: false, emp: '', type: 'تخاطب ونطق', freq: 'أسبوعي' },
  progOnline: { enabled: false, emp: '', type: 'تخاطب ونطق', dur: '45 دقيقة', link: '' },
  notes: '', photo: '', attachments: []
};

const EMPTY_QS = { stuId: '', type: 'تخاطب ونطق', date: '', time: '', duration: 45, empId: '', notes: '', attachData: '', attachName: '' };
const EMPTY_CONSULT = { beneficiaryName: '', parentName: '', date: '', time: '', empId: '', duration: 45, notes: '', attachData: '', attachName: '' };
const EMPTY_SEC = { name: '', type: 'قسم متخصص', capacity: 10, supervisorId: '', color: '#4f46e5', icon: '🧩', description: '' };

const ITEMS_PER_PAGE = 12;

export default function StudentsPage() {
  const { toast, currentUser, activeView, center } = useApp();
  const isParent = currentUser?.role === 'parent';

  // Data State
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [emps, setEmps] = useState([]);

  // Segmented View Toggle: 'classes' | 'categories' | 'all'
  const [filterType, setFilterType] = useState('classes');
  // Selected Group Name (when clicking a summary card)
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterSec, setFilterSec] = useState('all');
  const [filterDiag, setFilterDiag] = useState('all');
  const [filterSpec, setFilterSpec] = useState('all');

  // Render Mode: 'grid' | 'list'
  const [viewMode, setViewMode] = useState('grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_STU);
  const [formTab, setFormTab] = useState('basic');

  const [detailId, setDetailId] = useState(null);

  const [showQuickSession, setShowQuickSession] = useState(false);
  const [qsForm, setQsForm] = useState(EMPTY_QS);

  const [showConsult, setShowConsult] = useState(false);
  const [consultForm, setConsultForm] = useState(EMPTY_CONSULT);

  const [showSecModal, setShowSecModal] = useState(false);
  const [secEditId, setSecEditId] = useState(null);
  const [secForm, setSecForm] = useState(EMPTY_SEC);

  const canAdd = !isParent && ['manager', 'vice', 'reception'].includes(currentUser?.role);
  const canEdit = !isParent && ['manager', 'vice', 'reception'].includes(currentUser?.role);
  const centerWa = centerWhatsAppUrl(center?.whatsapp, center?.phoneCode, center?.phone);
  const specialists = emps.filter(e => SPECIALIST_ROLES.includes(e.role));

  useEffect(() => {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    let storedSecs = lsGet('sections');
    if (!storedSecs || storedSecs.length === 0) {
      storedSecs = DEFAULT_SECTIONS;
      localStorage.setItem('scs_sections', JSON.stringify(storedSecs));
    }
    setSections(storedSecs);
  }, [activeView]);

  useEffect(() => {
    if (!isParent || detailId) return;
    const mine = lsGet('students').filter(s => parentCanViewStudent(s, currentUser));
    if (mine.length === 1) setDetailId(mine[0].id);
  }, [isParent, currentUser, detailId]);

  function reload() {
    setStudents(lsGet('students'));
    setSections(lsGet('sections') || DEFAULT_SECTIONS);
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, selectedGroup, searchQuery, statusFilter, filterSec, filterDiag, filterSpec]);

  const allCategoryOptions = useMemo(() => {
    const list = [...DIAGNOSES];
    students.forEach(s => {
      if (s.diagnosis && s.diagnosis.trim() && !list.includes(s.diagnosis.trim())) {
        list.push(s.diagnosis.trim());
      }
    });
    return list;
  }, [students]);

  // Main Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (isParent && !parentCanViewStudent(student, currentUser)) return false;

      // Text Search
      if (searchQuery.trim()) {
        const ql = searchQuery.toLowerCase().trim();
        const matchesName = (student.name || '').toLowerCase().includes(ql);
        const matchesDiag = (student.diagnosis || '').toLowerCase().includes(ql);
        const matchesClass = (student.className || '').toLowerCase().includes(ql);
        const matchesParent = (student.parentName || '').toLowerCase().includes(ql);
        const matchesPhone = (student.parentPhone || '').includes(ql);
        if (!matchesName && !matchesDiag && !matchesClass && !matchesParent && !matchesPhone) return false;
      }

      // Status Filter
      if (statusFilter !== 'all' && student.status !== statusFilter) return false;

      // Specialist Filter
      if (filterSpec !== 'all' && student.specialistId !== filterSpec) return false;

      // Dropdown Class Filter
      if (filterSec !== 'all') {
        if (filterSec === 'none') {
          if (student.sectionId || student.className) return false;
        } else {
          const matchSec = student.sectionId === filterSec || student.className === filterSec;
          if (!matchSec) return false;
        }
      }

      // Dropdown Diagnosis Filter
      if (filterDiag !== 'all') {
        if ((student.diagnosis || '').trim() !== filterDiag) return false;
      }

      // Card Selection Filter (from Summary Cards)
      if (selectedGroup) {
        if (filterType === 'classes') {
          const matchedClass = sections.find(sec => sec.id === selectedGroup || sec.name === selectedGroup);
          const classNameToMatch = matchedClass ? matchedClass.name : selectedGroup;
          if (student.className !== classNameToMatch && student.sectionId !== selectedGroup) return false;
        } else if (filterType === 'categories') {
          if ((student.diagnosis || '').trim() !== selectedGroup) return false;
        }
      }

      return true;
    });
  }, [students, isParent, currentUser, searchQuery, statusFilter, filterSpec, filterSec, filterDiag, selectedGroup, filterType, sections]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setSelectedGroup(null);
    setFilterSec('all');
    setFilterDiag('all');
  };

  const handleCardClick = (groupName) => {
    setSelectedGroup(prev => prev === groupName ? null : groupName);
  };

  // Student Form
  const fld = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  function fldProg(prog, key) { return e => setForm(f => ({ ...f, [prog]: { ...f[prog], [key]: e.target.value } })); }
  function toggleProg(prog) { setForm(f => ({ ...f, [prog]: { ...f[prog], enabled: !f[prog].enabled } })); }

  function openForm(stu = null, defaultSecId = '') {
    setFormTab('basic');
    if (stu) {
      setForm({ ...EMPTY_STU, ...stu, attachments: stu.attachments || [] });
      setEditId(stu.id);
    } else {
      setForm({ 
        ...EMPTY_STU, 
        sectionId: defaultSecId || (filterSec !== 'all' && filterSec !== 'none' ? filterSec : ''), 
        diagnosis: filterDiag !== 'all' ? filterDiag : '', 
        joinDate: todayStr(), 
        attachments: [] 
      });
      setEditId(null);
    }
    setShowForm(true);
  }

  function save() {
    if (!form.name.trim()) { toast('⚠️ أدخل اسم الطالب', 'er'); setFormTab('basic'); return; }
    if (!form.dob) { toast('⚠️ أدخل تاريخ الميلاد', 'er'); setFormTab('basic'); return; }
    if (!form.parentName?.trim()) { toast('⚠️ أدخل اسم ولي الأمر', 'er'); setFormTab('family'); return; }
    if (!form.parentPhone?.trim()) { toast('⚠️ أدخل جوال ولي الأمر', 'er'); setFormTab('family'); return; }

    let updatedForm = { ...form };
    if (form.sectionId) {
      const sec = sections.find(s => s.id === form.sectionId);
      if (sec) updatedForm.className = sec.name;
    }

    if (editId) {
      lsUpd('students', editId, updatedForm);
      toast('✅ تم تحديث بيانات الطالب', 'ok');
    } else {
      lsAdd('students', { ...updatedForm, id: uid() });
      toast('✅ تم إضافة الطالب وتخصيصه للصف آلياً', 'ok');
    }
    setShowForm(false);
    reload();
  }

  function deleteStu(id) {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف الطالب كلياً؟')) return;
    lsDel('students', id);
    toast('🗑️ تم حذف الطالب', 'ok');
    reload();
    setDetailId(null);
  }

  // Section Form
  function openSecForm(sec = null) {
    if (sec) { setSecForm({ ...EMPTY_SEC, ...sec }); setSecEditId(sec.id); }
    else { setSecForm(EMPTY_SEC); setSecEditId(null); }
    setShowSecModal(true);
  }

  function saveSec() {
    if (!secForm.name.trim()) { toast('⚠️ أدخل اسم القسم / الصف', 'er'); return; }
    if (secEditId) {
      lsUpd('sections', secEditId, secForm);
      toast('✅ تم تحديث بيانات الصف', 'ok');
    } else {
      lsAdd('sections', { ...secForm, id: uid() });
      toast('✅ تم إضافة الصف الجديد بنجاح', 'ok');
    }
    setShowSecModal(false);
    reload();
  }

  function handlePhoto(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(fm => ({ ...fm, photo: ev.target.result }));
    r.readAsDataURL(f);
  }

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

  // Quick Session
  const fldQs = k => e => setQsForm(f => ({ ...f, [k]: e.target.value }));
  function openQuickSession() {
    setQsForm({ ...EMPTY_QS, date: todayStr(), time: nowTimeStr() });
    setShowQuickSession(true);
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
    toast('✅ تم تسجيل الجلسة بنجاح', 'ok');
    setShowQuickSession(false);
    reload();
  }

  // Consultations
  const fldCo = k => e => setConsultForm(f => ({ ...f, [k]: e.target.value }));
  function openConsult() {
    setConsultForm({ ...EMPTY_CONSULT, date: todayStr(), time: nowTimeStr() });
    setShowConsult(true);
  }

  function saveConsult() {
    if (!consultForm.beneficiaryName.trim() || !consultForm.date) { toast('⚠️ أدخل اسم المستفيد والتاريخ', 'er'); return; }
    lsAdd('consultations', {
      id: uid(),
      beneficiaryName: consultForm.beneficiaryName,
      parentName: consultForm.parentName,
      date: consultForm.date,
      time: consultForm.time,
      duration: Number(consultForm.duration) || 45,
      empId: consultForm.empId,
      notes: consultForm.notes,
      attachmentData: consultForm.attachData || '',
      attachmentName: consultForm.attachName || '',
    });
    toast('✅ تم تسجيل الاستشارة بنجاح', 'ok');
    setShowConsult(false);
  }

  if (detailId) {
    return <StudentDetail stuId={detailId} onBack={() => { setDetailId(null); reload(); }} onEdit={stu => openForm(stu)} onDelete={deleteStu} />;
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 dir-rtl flex flex-col gap-6">
      
      {/* 1️⃣ Top Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            <span>{isParent ? 'بيانات الطفل والبرامج' : 'إدارة الطلاب'}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isParent ? 'متابعة الملف الشخصي للطفل والأنشطة والجلسات المسجلة' : 'عرض وتصفية ملفات الطلاب وإدارتها بكل سهولة بمرونة تامة'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canAdd && (
            <button 
              onClick={() => openForm()}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>طالب جديد</span>
            </button>
          )}

          {canAdd && (
            <button 
              onClick={() => openSecForm()}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm"
            >
              <School className="w-4 h-4 text-slate-600" />
              <span>إضافة صف / قسم</span>
            </button>
          )}

          {canEdit && (
            <button 
              onClick={openQuickSession}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-4 py-2.5 rounded-xl border border-emerald-200 transition-all text-sm"
            >
              <Stethoscope className="w-4 h-4" />
              <span>تسجيل جلسة</span>
            </button>
          )}

          {canEdit && (
            <button 
              onClick={openConsult}
              className="flex items-center gap-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold px-4 py-2.5 rounded-xl border border-cyan-200 transition-all text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تسجيل استشارة</span>
            </button>
          )}

          {isParent && centerWa && (
            <a href={centerWa} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-emerald-700 transition-all text-sm">
              💬 التواصل مع المركز
            </a>
          )}
        </div>
      </div>

      {/* 2️⃣ Search and Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search Bar */}
        <div className="relative md:col-span-2">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث باسم الطالب، الهوية، التشخيص أو ولي الأمر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-11 pl-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm px-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700"
          >
            <option value="all">جميع الحالات بالمركز</option>
            {Object.entries(STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Specialist Dropdown */}
        <div>
          <select
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm px-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700"
          >
            <option value="all">جميع الأخصائيين المشرفين</option>
            {specialists.map(e => (
              <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3️⃣ Segmented View Toggle & Layout Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl gap-1 text-sm font-medium flex-wrap">
          <button
            onClick={() => handleFilterTypeChange('classes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              filterType === 'classes'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            <span>حسب الصفوف والأقسام</span>
          </button>

          <button
            onClick={() => handleFilterTypeChange('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              filterType === 'categories'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>حسب الفئات والتشخيصات</span>
          </button>

          <button
            onClick={() => handleFilterTypeChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>عرض جميع الطلاب ({students.length})</span>
          </button>
        </div>

        {/* View Mode & Reset Group Filter */}
        <div className="flex items-center gap-3">
          {selectedGroup && (
            <button
              onClick={() => setSelectedGroup(null)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition-all flex items-center gap-1"
            >
              <span>إلغاء تصفية ({selectedGroup})</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="inline-flex p-1 bg-slate-200/70 rounded-lg text-xs font-medium gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'}`}
            >
              🎴 شبكة
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'}`}
            >
              📋 جدول
            </button>
          </div>
        </div>
      </div>

      {/* 4️⃣ Summary Cards (Shown based on filterType) */}
      {filterType === 'classes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((cls) => {
            const count = students.filter(s => s.sectionId === cls.id || s.className === cls.name).length;
            const maxCapacity = Number(cls.capacity) || 10;
            const isSelected = selectedGroup === cls.name || selectedGroup === cls.id;
            const percentage = Math.round((count / maxCapacity) * 100);
            const supervisor = emps.find(e => e.id === cls.supervisorId);

            return (
              <div
                key={cls.id}
                onClick={() => handleCardClick(cls.name)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/60 border-indigo-500 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{cls.icon || '🧩'}</span>
                      <h3 className="font-bold text-slate-800 text-base">{cls.name}</h3>
                    </div>
                    <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-700 font-bold border border-slate-200">
                      {count} / {maxCapacity} طالب
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
                    <span>المشرف: <strong className="text-slate-700">{supervisor ? supervisor.name : 'غير محدد'}</strong></span>
                    {cls.type && <span className="text-[11px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded">{cls.type}</span>}
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>مؤشر الاستيعاب</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${percentage >= 100 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filterType === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCategoryOptions.map((cat) => {
            const count = students.filter(s => (s.diagnosis || '').trim() === cat).length;
            const isSelected = selectedGroup === cat;

            return (
              <div
                key={cat}
                onClick={() => handleCardClick(cat)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-50/60 border-indigo-500 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🎯</span>
                    <h3 className="font-bold text-slate-800 text-base">{cat}</h3>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full font-bold">
                    {count} طالب
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">فئة ومسار تأهيلي متخصص بالمركز</p>
              </div>
            );
          })}
        </div>
      )}

      {/* 5️⃣ Unified Student Grid */}
      <div className="mt-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>قائمة الطلاب</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
              {filteredStudents.length} طالب مطبق للتصفية
            </span>
          </h2>

          <div className="text-xs text-slate-500">
            صفحة {currentPage} من {totalPages}
          </div>
        </div>

        {filteredStudents.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedStudents.map((student) => {
                const spec = emps.find(e => e.id === student.specialistId);
                const sec = sections.find(sec => sec.id === student.sectionId || sec.name === student.className);

                return (
                  <div
                    key={student.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-slate-100 text-indigo-600 font-bold flex items-center justify-center text-sm border border-slate-200 overflow-hidden flex-shrink-0">
                            {student.photo ? (
                              <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              student.name.substring(0, 2)
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-base leading-snug truncate">
                              {student.name}
                            </h4>
                            <span className="text-xs text-slate-400">{calcAge(student.dob)}</span>
                          </div>
                        </div>

                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                          student.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {STATUSES[student.status] || student.status}
                        </span>
                      </div>

                      {/* Diagnostic & Class Info */}
                      <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="text-slate-400">التشخيص:</span>
                          <span className="font-semibold text-slate-800 truncate">{student.diagnosis || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="text-slate-400">الصف:</span>
                          <span className="font-semibold text-slate-800 truncate">{sec ? sec.name : student.className || 'غير مخصص'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <User className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>المشرف:</span>
                          <span className="text-slate-700 font-medium truncate">{spec ? spec.name : 'غير محدد'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setDetailId(student.id)}
                        className="flex-1 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-semibold border border-slate-200/60 hover:border-indigo-200 transition-all text-center flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>الملف الكامل</span>
                      </button>

                      {student.parentPhone && (
                        <a
                          href={`https://wa.me/${student.parentPhone.replace(/[^0-9+]/g, '').replace(/^0/, '966')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl border border-emerald-200 transition-all"
                          title="واتساب ولي الأمر"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {canEdit && (
                        <button
                          onClick={() => openForm(student)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all"
                          title="تعديل البيانات"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List / Table View */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-3.5">الطالب</th>
                      <th className="p-3.5">الصف / القسم</th>
                      <th className="p-3.5">التشخيص الفئة</th>
                      <th className="p-3.5">ولي الأمر والتواصل</th>
                      <th className="p-3.5">الأخصائي المشرف</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedStudents.map((s) => {
                      const spec = emps.find(e => e.id === s.specialistId);
                      const sec = sections.find(sec => sec.id === s.sectionId || sec.name === s.className);

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="p-3.5 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-indigo-600 font-bold flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
                                {s.photo ? <img src={s.photo} alt={s.name} className="w-full h-full object-cover" /> : s.name.substring(0, 2)}
                              </div>
                              <div>
                                <div>{s.name}</div>
                                <div className="text-xs text-slate-400 font-normal">{calcAge(s.dob)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-slate-800">{sec ? sec.name : s.className || '—'}</td>
                          <td className="p-3.5 font-medium text-indigo-600">{s.diagnosis || 'غير محدد'}</td>
                          <td className="p-3.5 text-xs text-slate-600">
                            <div>{s.parentName || '—'}</div>
                            <div dir="ltr" className="text-slate-400">{s.parentPhone || '—'}</div>
                          </td>
                          <td className="p-3.5 text-slate-700">{spec ? spec.name : '—'}</td>
                          <td className="p-3.5">
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                              s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {STATUSES[s.status] || s.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setDetailId(s.id)} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-all">
                                👁️ الملف
                              </button>
                              {canEdit && (
                                <button onClick={() => openForm(s)} className="p-1 text-slate-500 hover:text-slate-800">
                                  ✏️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base mb-1">لا يوجد طلاب مطبقين لمحددات التصفية</h3>
            <p className="text-xs text-slate-400">جرب تغيير كلمة البحث أو اختيار صف آخر.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              السابق
            </button>
            <span className="text-xs font-medium text-slate-600">
              {currentPage} من {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* 6️⃣ Student Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col dir-rtl">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <span>{editId ? '✏️ تعديل بيانات الطالب' : '➕ إضافة طالب جديد'}</span>
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100/60 p-1 text-xs font-bold gap-1">
              <button onClick={() => setFormTab('basic')} className={`flex-1 py-2 rounded-lg transition-all ${formTab === 'basic' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}>
                👤 البيانات الأساسية والصف
              </button>
              <button onClick={() => setFormTab('diagnosis')} className={`flex-1 py-2 rounded-lg transition-all ${formTab === 'diagnosis' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}>
                🩺 الفئة والتشخيص الطبي
              </button>
              <button onClick={() => setFormTab('family')} className={`flex-1 py-2 rounded-lg transition-all ${formTab === 'family' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}>
                👨‍👩‍👦 ولي الأمر والتواصل
              </button>
              <button onClick={() => setFormTab('programs')} className={`flex-1 py-2 rounded-lg transition-all ${formTab === 'programs' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}>
                🗂️ الدوام والمرفقات
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-sm">
              {formTab === 'basic' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب رباعياً *</label>
                    <input type="text" value={form.name} onChange={fld('name')} className="w-full h-10 border border-slate-300 rounded-lg px-3" placeholder="مثال: علي أحمد محمد العلي" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الميلاد *</label>
                    <input type="date" value={form.dob} onChange={fld('dob')} className="w-full h-10 border border-slate-300 rounded-lg px-3" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تخصيص الصف / القسم *</label>
                    <select value={form.sectionId} onChange={fld('sectionId')} className="w-full h-10 border border-slate-300 rounded-lg px-3 font-medium">
                      <option value="">-- اختر الصف / القسم --</option>
                      {sections.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.icon || '🧩'} {sec.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الأخصائي المشرف</label>
                    <select value={form.specialistId} onChange={fld('specialistId')} className="w-full h-10 border border-slate-300 rounded-lg px-3">
                      <option value="">-- اختر الأخصائي المشرف --</option>
                      {specialists.map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الجنس</label>
                    <select value={form.gender} onChange={fld('gender')} className="w-full h-10 border border-slate-300 rounded-lg px-3">
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">حالة الطالب</label>
                    <select value={form.status} onChange={fld('status')} className="w-full h-10 border border-slate-300 rounded-lg px-3">
                      {Object.entries(STATUSES).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formTab === 'diagnosis' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">التشخيص الرئيسي / الفئة *</label>
                    <select value={form.diagnosis} onChange={fld('diagnosis')} className="w-full h-10 border border-slate-300 rounded-lg px-3 font-medium">
                      <option value="">-- اختر التشخيص الرئيسي --</option>
                      {allCategoryOptions.map(d => (
                        <option key={d} value={d}>🎯 {d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">التشخيص الثانوي / الإضافي</label>
                    <input type="text" value={form.diagnosis2} onChange={fld('diagnosis2')} className="w-full h-10 border border-slate-300 rounded-lg px-3" placeholder="مثال: تأخر نطق، صعوبة انتباه..." />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المستشفى / الجهة المشخصة</label>
                    <input type="text" value={form.hospital} onChange={fld('hospital')} className="w-full h-10 border border-slate-300 rounded-lg px-3" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">الأدوية والتعليمات الطبية الخاصة</label>
                    <textarea value={form.medications} onChange={fld('medications')} className="w-full h-20 border border-slate-300 rounded-lg p-3" placeholder="اكتب أي ملاحظات أدوية أو حساسية غذائية أو محاذير..." />
                  </div>
                </div>
              )}

              {formTab === 'family' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم ولي الأمر *</label>
                    <input type="text" value={form.parentName} onChange={fld('parentName')} className="w-full h-10 border border-slate-300 rounded-lg px-3" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">صلة القرابة</label>
                    <select value={form.parentRelation} onChange={fld('parentRelation')} className="w-full h-10 border border-slate-300 rounded-lg px-3">
                      <option value="الأب">الأب</option>
                      <option value="الأم">الأم</option>
                      <option value="الأخ/الأخت">الأخ/الأخت</option>
                      <option value="الوصي الشرعي">الوصي الشرعي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم الجوال الرئيسي (واتساب) *</label>
                    <input type="text" dir="ltr" value={form.parentPhone} onChange={fld('parentPhone')} className="w-full h-10 border border-slate-300 rounded-lg px-3" placeholder="05xxxxxxxx" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم جوال إضافي / طوارئ</label>
                    <input type="text" dir="ltr" value={form.parentPhone2} onChange={fld('parentPhone2')} className="w-full h-10 border border-slate-300 rounded-lg px-3" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">العنوان والحي السكني</label>
                    <input type="text" value={form.address} onChange={fld('address')} className="w-full h-10 border border-slate-300 rounded-lg px-3" />
                  </div>
                </div>
              )}

              {formTab === 'programs' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 font-bold text-slate-800">
                      <input type="checkbox" checked={form.progMorning?.enabled || false} onChange={() => toggleProg('progMorning')} className="w-4 h-4 text-indigo-600 rounded" />
                      <span>☀️ برنامج الدوام الصباحي</span>
                    </label>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 font-bold text-slate-800">
                      <input type="checkbox" checked={form.progSessions?.enabled || false} onChange={() => toggleProg('progSessions')} className="w-4 h-4 text-indigo-600 rounded" />
                      <span>🩺 برنامج الجلسات العلاجية الفردية</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رفع صوة الشخصية أو مرفقات</label>
                    <input type="file" accept="image/*" onChange={handlePhoto} className="block text-xs" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium text-xs">إلغاء</button>
              <button onClick={save} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700">حفظ الطالب</button>
            </div>
          </div>
        </div>
      )}

      {/* 7️⃣ Add Section / Class Modal */}
      {showSecModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col dir-rtl">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">
                {secEditId ? '✏️ تعديل بيانات الصف' : '🏫 إضافة صف / قسم جديد'}
              </h3>
              <button onClick={() => setShowSecModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الصف / القسم *</label>
                <input type="text" value={secForm.name} onChange={e => setSecForm(f => ({ ...f, name: e.target.value }))} className="w-full h-10 border border-slate-300 rounded-lg px-3" placeholder="مثال: صف اللؤلؤ" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الرمز التعبيري (الأيقونة)</label>
                <input type="text" value={secForm.icon} onChange={e => setSecForm(f => ({ ...f, icon: e.target.value }))} className="w-full h-10 border border-slate-300 rounded-lg px-3" placeholder="مثال: 🦪" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الطاقة الاستيعابية القصوى (عدد الطلاب) *</label>
                <input type="number" value={secForm.capacity} onChange={e => setSecForm(f => ({ ...f, capacity: e.target.value }))} className="w-full h-10 border border-slate-300 rounded-lg px-3" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المشرف المسؤول</label>
                <select value={secForm.supervisorId} onChange={e => setSecForm(f => ({ ...f, supervisorId: e.target.value }))} className="w-full h-10 border border-slate-300 rounded-lg px-3">
                  <option value="">-- اختر المشرف --</option>
                  {emps.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowSecModal(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium text-xs">إلغاء</button>
              <button onClick={saveSec} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700">حفظ الصف</button>
            </div>
          </div>
        </div>
      )}

      {/* 8️⃣ Quick Session Modal */}
      {showQuickSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 dir-rtl">
            <h3 className="font-bold text-slate-800 text-base">🩺 تسجيل جلسة علاجية فردية</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الطالب *</label>
                <select value={qsForm.stuId} onChange={fldQs('stuId')} className="w-full h-10 border border-slate-300 rounded-lg px-3">
                  <option value="">-- اختر الطالب --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع الجلسة</label>
                <select value={qsForm.type} onChange={fldQs('type')} className="w-full h-10 border border-slate-300 rounded-lg px-3">
                  <option value="تخاطب ونطق">تخاطب ونطق</option>
                  <option value="علاج وظيفي">علاج وظيفي</option>
                  <option value="علاج طبيعي">علاج طبيعي</option>
                  <option value="تعديل سلوك">تعديل سلوك</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
                <input type="date" value={qsForm.date} onChange={fldQs('date')} className="w-full h-10 border border-slate-300 rounded-lg px-3" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowQuickSession(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs">إلغاء</button>
              <button onClick={saveQuickSession} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">تسجيل الجلسة</button>
            </div>
          </div>
        </div>
      )}

      {/* 9️⃣ Consultation Modal */}
      {showConsult && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 dir-rtl">
            <h3 className="font-bold text-slate-800 text-base">💬 تسجيل استشارة</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستفيد / الحالة *</label>
                <input type="text" value={consultForm.beneficiaryName} onChange={fldCo('beneficiaryName')} className="w-full h-10 border border-slate-300 rounded-lg px-3" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم ولي الأمر</label>
                <input type="text" value={consultForm.parentName} onChange={fldCo('parentName')} className="w-full h-10 border border-slate-300 rounded-lg px-3" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
                <input type="date" value={consultForm.date} onChange={fldCo('date')} className="w-full h-10 border border-slate-300 rounded-lg px-3" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowConsult(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs">إلغاء</button>
              <button onClick={saveConsult} className="px-5 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold">تسجيل الاستشارة</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
