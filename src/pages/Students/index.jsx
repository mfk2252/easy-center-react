import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, Plus, Search, School, Stethoscope, User, 
  CheckCircle2, AlertCircle, MessageCircle, Edit3, Eye, Trash2, X, Filter,
  ArrowRight, FolderPlus, Building2, Calendar, FileText, ChevronLeft, ArrowUpDown, Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsSet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { DIAGNOSES, SPECIALIST_ROLES } from '../../utils/constants';
import { calcAge, todayStr, uid, nowTimeStr } from '../../utils/dateHelpers';
import StudentDetail from './StudentDetail';
import { parentCanViewStudent, centerWhatsAppUrl } from '../../utils/parentAccess';
import UnifiedBackButton from '../../components/ui/UnifiedBackButton';
import UnifiedPageHeader from '../../components/ui/UnifiedPageHeader';

// Student Statuses
const STATUSES = {
  active: 'مسجل (نشط)',
  waitlist: 'قائمة الانتظار',
  inactive: 'منقطع',
  graduated: 'خريج',
  transferred: 'محول',
  rejected: 'مفصول / غير مناسب'
};

const STATUS_BADGES = {
  active: 'b-gr',
  waitlist: 'b-or',
  inactive: 'b-gy',
  graduated: 'b-bl',
  transferred: 'b-pu',
  rejected: 'b-rd'
};

// Default Initial Classes (الصفوف)
const DEFAULT_SECTIONS = [
  { id: 'sec_autism', code: 'C-01', name: 'صف اللؤلؤ', type: 'قسم اضطراب طيف التوحد', capacity: 10, supervisorId: '', color: '#1a56db', icon: '🦪', description: 'برامج التأهيل والتدريب للطلاب ذوي طيف التوحد' },
  { id: 'sec_down', code: 'C-02', name: 'صف المرجان', type: 'قسم متلازمة داون', capacity: 8, supervisorId: '', color: '#059669', icon: '🪸', description: 'تنمية المهارات الإدراكية والحركية والاجتماعية' },
  { id: 'sec_early', code: 'C-03', name: 'صف الزمرد', type: 'قسم التدخل المبكر', capacity: 12, supervisorId: '', color: '#7c3aed', icon: '💎', description: 'الرعاية التأهيلية والتدخل المبكر للأطفال' },
];

// Default Initial Categories (الفئات والتشخيصات)
const DEFAULT_CATEGORIES = [
  { id: 'cat_autism', code: 'AUT-01', name: 'اضطراب طيف التوحد', capacity: 20, color: '#1a56db', icon: '🧩', description: 'فئة متخصصة في التأهيل السلوكي والتواصلي لطيف التوحد' },
  { id: 'cat_down', code: 'DS-01', name: 'متلازمة داون', capacity: 15, color: '#059669', icon: '🌟', description: 'برامج الدعم الإدراكي والحركي والاستقلالية' },
  { id: 'cat_learning', code: 'LD-01', name: 'صعوبات التعلم', capacity: 15, color: '#d97706', icon: '📚', description: 'برامج التربية الخاصة وتنمية المهارات الأكاديمية' },
  { id: 'cat_early', code: 'EI-01', name: 'تأخر نمائي شامل', capacity: 20, color: '#7c3aed', icon: '🌱', description: 'برامج التدخل المبكر والتحفيز النمائي' },
];

const EMPTY_STU = {
  name: '', className: '', sectionId: '', categoryId: '', dob: '', gender: 'ذكر', nationality: 'سعودي', joinDate: '',
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
const EMPTY_SEC = { name: '', code: '', type: 'قسم متخصص', capacity: 10, supervisorId: '', color: '#1a56db', icon: '🏫', description: '' };
const EMPTY_CAT = { name: '', code: '', capacity: 20, color: '#7c3aed', icon: '📂', description: '' };

const ITEMS_PER_PAGE = 12;

export default function StudentsPage() {
  const { toast, currentUser, activeView, center } = useApp();
  const isParent = currentUser?.role === 'parent';

  // Data State
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [emps, setEmps] = useState([]);

  // System Mode / Primary View Toggle: 'classes' (الصفوف) | 'categories' (الفئات) | 'all' (جميع الطلاب)
  const [systemMode, setSystemMode] = useState('classes');

  // Dedicated Active Folder Navigation State (صفحة مستقلة عند النقر على صف أو فئة)
  // activeFolder: { type: 'class' | 'category', id: string, name: string, data: object } | null
  const [activeFolder, setActiveFolder] = useState(null);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterSec, setFilterSec] = useState('all');
  const [filterDiag, setFilterDiag] = useState('all');
  const [filterSpec, setFilterSpec] = useState('all');
  const [sortOrder, setSortOrder] = useState('alpha'); // 'alpha' | 'newest' | 'oldest' | 'age'

  // Render Mode: 'grid' | 'list'
  const [viewMode, setViewMode] = useState('grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals Controls
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_STU);
  const [formTab, setFormTab] = useState('basic');

  const [detailId, setDetailId] = useState(null);

  const [showQuickSession, setShowQuickSession] = useState(false);
  const [qsForm, setQsForm] = useState(EMPTY_QS);

  const [showConsult, setShowConsult] = useState(false);
  const [consultForm, setConsultForm] = useState(EMPTY_CONSULT);

  // Modal 4: Add Class (إضافة صف)
  const [showSecModal, setShowSecModal] = useState(false);
  const [secEditId, setSecEditId] = useState(null);
  const [secForm, setSecForm] = useState(EMPTY_SEC);

  // Modal 5: Add Category / Department (إضافة قسم / فئة)
  const [showCatModal, setShowCatModal] = useState(false);
  const [catEditId, setCatEditId] = useState(null);
  const [catForm, setCatForm] = useState(EMPTY_CAT);

  const canAdd = !isParent && ['manager', 'vice', 'reception'].includes(currentUser?.role);
  const canEdit = !isParent && ['manager', 'vice', 'reception'].includes(currentUser?.role);
  const centerWa = centerWhatsAppUrl(center?.whatsapp, center?.phoneCode, center?.phone);
  const specialists = emps.filter(e => SPECIALIST_ROLES.includes(e.role) || ['manager','vice','admin'].includes(e.role));

  // Safe loaders ensuring classes and categories are always loaded and initialized
  const getLoadedSections = useCallback(() => {
    let secs = lsGet('sections');
    if (!Array.isArray(secs) || secs.length === 0) {
      try {
        const legacy = JSON.parse(localStorage.getItem('scs_sections') || '[]');
        if (Array.isArray(legacy) && legacy.length > 0) secs = legacy;
      } catch(_) {}
    }
    if (!Array.isArray(secs) || secs.length === 0) {
      secs = DEFAULT_SECTIONS;
      lsSet('sections', secs);
    }
    return secs;
  }, []);

  const getLoadedCategories = useCallback(() => {
    let cats = lsGet('categories');
    if (!Array.isArray(cats) || cats.length === 0) {
      try {
        const legacy = JSON.parse(localStorage.getItem('scs_categories') || '[]');
        if (Array.isArray(legacy) && legacy.length > 0) cats = legacy;
      } catch(_) {}
    }
    if (!Array.isArray(cats) || cats.length === 0) {
      cats = DEFAULT_CATEGORIES;
      lsSet('categories', cats);
    }
    return cats;
  }, []);

  // Initialize Data
  useEffect(() => {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));

    // Sections (Classes)
    const storedSecs = getLoadedSections();
    setSections(storedSecs);

    // Categories (فئات)
    const storedCats = getLoadedCategories();
    setCategories(storedCats);

    // التحقق من وجود طالب محدد مسبقاً من لوحة التحكم أو الإشعارات
    const directStuId = sessionStorage.getItem('scs_selected_student');
    if (directStuId) {
      sessionStorage.removeItem('scs_selected_student');
      setDetailId(directStuId);
    }
  }, [activeView, getLoadedSections, getLoadedCategories]);

  useEffect(() => {
    if (!isParent || detailId) return;
    const mine = lsGet('students').filter(s => parentCanViewStudent(s, currentUser));
    if (mine.length === 1) setDetailId(mine[0].id);
  }, [isParent, currentUser, detailId]);

  function reload() {
    setStudents(lsGet('students'));
    setSections(getLoadedSections());
    setCategories(getLoadedCategories());
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [systemMode, activeFolder, searchQuery, statusFilter, filterSec, filterDiag, filterSpec, sortOrder]);

  const allCategoryOptions = useMemo(() => {
    const list = [...DIAGNOSES];
    categories.forEach(c => {
      if (c.name && !list.includes(c.name)) list.push(c.name);
    });
    students.forEach(s => {
      if (s.diagnosis && s.diagnosis.trim() && !list.includes(s.diagnosis.trim())) {
        list.push(s.diagnosis.trim());
      }
    });
    return list;
  }, [students, categories]);

  // Main Filtered & Sorted Students List
  const filteredStudents = useMemo(() => {
    let list = students.filter(student => {
      if (isParent && !parentCanViewStudent(student, currentUser)) return false;

      // If inside a dedicated Folder Page (الصفحة المستقلة للصف أو الفئة)
      if (activeFolder) {
        if (activeFolder.type === 'class') {
          const matchSec = student.sectionId === activeFolder.id || student.className === activeFolder.name;
          if (!matchSec) return false;
        } else if (activeFolder.type === 'category') {
          const matchCat = (student.diagnosis || '').trim() === activeFolder.name || student.categoryId === activeFolder.id;
          if (!matchCat) return false;
        }
      }

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

      // Specialist / Teacher Filter
      if (filterSpec !== 'all' && student.specialistId !== filterSpec) return false;

      // Class Dropdown Filter (only when not in a dedicated class folder)
      if (!activeFolder && filterSec !== 'all') {
        if (filterSec === 'none') {
          if (student.sectionId || student.className) return false;
        } else {
          const matchSec = student.sectionId === filterSec || student.className === filterSec;
          if (!matchSec) return false;
        }
      }

      // Category Dropdown Filter (only when not in a dedicated category folder)
      if (!activeFolder && filterDiag !== 'all') {
        if ((student.diagnosis || '').trim() !== filterDiag) return false;
      }

      return true;
    });

    // Sorting Logic
    list.sort((a, b) => {
      if (sortOrder === 'alpha') {
        return (a.name || '').localeCompare(b.name || '', 'ar');
      } else if (sortOrder === 'newest') {
        return (b.joinDate || b.id || '').localeCompare(a.joinDate || a.id || '');
      } else if (sortOrder === 'oldest') {
        return (a.joinDate || a.id || '').localeCompare(b.joinDate || b.id || '');
      } else if (sortOrder === 'age') {
        return (a.dob || '').localeCompare(b.dob || '');
      }
      return 0;
    });

    return list;
  }, [students, isParent, currentUser, activeFolder, searchQuery, statusFilter, filterSpec, filterSec, filterDiag, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  // Modal Handlers
  const fld = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  function fldProg(prog, key) { return e => setForm(f => ({ ...f, [prog]: { ...f[prog], [key]: e.target.value } })); }
  function toggleProg(prog) { setForm(f => ({ ...f, [prog]: { ...f[prog], enabled: !f[prog].enabled } })); }

  // Open Add Student Modal
  function openForm(stu = null, defaultSecId = '', defaultDiag = '') {
    setFormTab('basic');
    if (stu) {
      setForm({ ...EMPTY_STU, ...stu, attachments: stu.attachments || [] });
      setEditId(stu.id);
    } else {
      let secId = defaultSecId;
      let diag = defaultDiag;

      if (activeFolder) {
        if (activeFolder.type === 'class') secId = activeFolder.id;
        if (activeFolder.type === 'category') diag = activeFolder.name;
      }

      setForm({ 
        ...EMPTY_STU, 
        sectionId: secId || (filterSec !== 'all' && filterSec !== 'none' ? filterSec : ''), 
        diagnosis: diag || (filterDiag !== 'all' ? filterDiag : ''), 
        joinDate: todayStr(), 
        attachments: [] 
      });
      setEditId(null);
    }
    setShowForm(true);
  }

  function saveStudent() {
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
      toast('✅ تم إضافة الطالب بنجاح', 'ok');
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

  // Modal 4: Class Handler
  function openSecForm(sec = null) {
    if (sec) { 
      setSecForm({ ...EMPTY_SEC, ...sec }); 
      setSecEditId(sec.id); 
    } else { 
      setSecForm({ ...EMPTY_SEC, code: `SEC-0${sections.length + 1}` }); 
      setSecEditId(null); 
    }
    setShowSecModal(true);
  }

  function saveSec() {
    if (!secForm.name.trim()) { toast('⚠️ أدخل اسم الصف', 'er'); return; }

    const oldSec = sections.find(s => s.id === secEditId);
    const oldName = oldSec?.name;

    let currentSecs = getLoadedSections();

    if (secEditId) {
      const idx = currentSecs.findIndex(s => s.id === secEditId);
      const updatedItem = { ...(idx !== -1 ? currentSecs[idx] : {}), ...secForm, id: secEditId, updatedAt: new Date().toISOString() };
      if (idx !== -1) {
        currentSecs[idx] = updatedItem;
      } else {
        currentSecs.push(updatedItem);
      }
      lsSet('sections', currentSecs);
      lsUpd('sections', secEditId, secForm);
      toast('✅ تم تحديث بيانات الصف بنجاح', 'ok');

      // Update student records if section name changed
      if (oldName && oldName !== secForm.name) {
        const allStus = lsGet('students');
        let updatedCount = 0;
        const updatedStus = allStus.map(s => {
          if (s.sectionId === secEditId || s.className === oldName) {
            updatedCount++;
            return { ...s, className: secForm.name, sectionId: secEditId };
          }
          return s;
        });
        if (updatedCount > 0) {
          lsSet('students', updatedStus);
        }
      }

      if (activeFolder && activeFolder.type === 'class' && activeFolder.id === secEditId) {
        setActiveFolder({ ...activeFolder, name: secForm.name, data: secForm });
      }
    } else {
      const newId = uid();
      const newSec = { ...secForm, id: newId, createdAt: new Date().toISOString() };
      currentSecs.push(newSec);
      lsSet('sections', currentSecs);
      lsAdd('sections', newSec);
      toast('✅ تم إضافة الصف الجديد بنجاح', 'ok');
    }
    setShowSecModal(false);
    reload();
  }

  function deleteSec(secId, secName) {
    if (!window.confirm(`⚠️ هل أنت متأكد من حذف الصف "${secName}"؟`)) return;
    const currentSecs = getLoadedSections().filter(s => s.id !== secId);
    lsSet('sections', currentSecs);
    lsDel('sections', secId);
    toast('🗑️ تم حذف الصف بنجاح', 'ok');
    if (activeFolder?.id === secId) setActiveFolder(null);
    reload();
  }

  // Modal 5: Category Handler
  function openCatForm(cat = null) {
    if (cat && typeof cat === 'object') {
      const existing = categories.find(c => c.id === cat.id || c.name === cat.name);
      if (existing) {
        setCatForm({ ...EMPTY_CAT, ...existing });
        setCatEditId(existing.id);
      } else {
        setCatForm({ ...EMPTY_CAT, ...cat });
        setCatEditId(cat.id || null);
      }
    } else if (typeof cat === 'string') {
      const existing = categories.find(c => c.name === cat);
      if (existing) {
        setCatForm({ ...EMPTY_CAT, ...existing });
        setCatEditId(existing.id);
      } else {
        setCatForm({ ...EMPTY_CAT, name: cat });
        setCatEditId(null);
      }
    } else {
      setCatForm({ ...EMPTY_CAT, code: `CAT-0${categories.length + 1}` });
      setCatEditId(null);
    }
    setShowCatModal(true);
  }

  function saveCat() {
    if (!catForm.name.trim()) { toast('⚠️ أدخل اسم القسم / الفئة', 'er'); return; }

    const oldCat = categories.find(c => c.id === catEditId || c.name === catForm.name);
    const oldName = oldCat?.name || catForm.name;

    let currentCats = getLoadedCategories();

    if (catEditId) {
      const idx = currentCats.findIndex(c => c.id === catEditId);
      const updatedItem = { ...(idx !== -1 ? currentCats[idx] : {}), ...catForm, id: catEditId, updatedAt: new Date().toISOString() };
      if (idx !== -1) {
        currentCats[idx] = updatedItem;
      } else {
        currentCats.push(updatedItem);
      }
      lsSet('categories', currentCats);
      lsUpd('categories', catEditId, catForm);
      toast('✅ تم تحديث بيانات الفئة بنجاح', 'ok');

      // Update student records if category/diagnosis name changed
      if (oldName && oldName !== catForm.name) {
        const allStus = lsGet('students');
        let updatedCount = 0;
        const updatedStus = allStus.map(s => {
          if (s.categoryId === catEditId || (s.diagnosis || '').trim() === oldName) {
            updatedCount++;
            return { ...s, diagnosis: catForm.name, categoryId: catEditId };
          }
          return s;
        });
        if (updatedCount > 0) {
          lsSet('students', updatedStus);
        }
      }

      if (activeFolder && activeFolder.type === 'category' && (activeFolder.id === catEditId || activeFolder.name === oldName)) {
        setActiveFolder({ ...activeFolder, id: catEditId, name: catForm.name, data: catForm });
      }
    } else {
      const newId = uid();
      const newCat = { ...catForm, id: newId, createdAt: new Date().toISOString() };
      currentCats.push(newCat);
      lsSet('categories', currentCats);
      lsAdd('categories', newCat);
      toast('✅ تم إضافة القسم / الفئة بنجاح', 'ok');
    }
    setShowCatModal(false);
    reload();
  }

  function deleteCat(catId, catName) {
    if (!window.confirm(`⚠️ هل أنت متأكد من حذف القسم / الفئة "${catName}"؟`)) return;
    const currentCats = getLoadedCategories().filter(c => c.id !== catId);
    lsSet('categories', currentCats);
    lsDel('categories', catId);
    toast('🗑️ تم حذف الفئة بنجاح', 'ok');
    if (activeFolder?.id === catId || activeFolder?.name === catName) setActiveFolder(null);
    reload();
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

  // Consultation
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

  function handlePhoto(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(fm => ({ ...fm, photo: ev.target.result }));
    r.readAsDataURL(f);
  }

  if (detailId) {
    return <StudentDetail stuId={detailId} onBack={() => { setDetailId(null); reload(); }} onEdit={stu => openForm(stu)} onDelete={deleteStu} />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl' }}>
      
      {/* 1️⃣ TOP HEADER BAR (ترويسة الصفحة الموحدة) */}
      {!activeFolder && (
        <UnifiedPageHeader
          icon={<Users style={{ width: 24, height: 24 }} />}
          title={isParent ? 'بيانات الطفل والبرامج' : 'إدارة الطلاب والشعب'}
          subtitle={isParent ? 'متابعة الملف الشخصي والبرامج التأهيلية للطفل' : 'نظام شامل لإدارة الطلاب حسب الصفوف، الفئات التشخيصية، والأخصائيين المشرفين'}
          badge={`${students.length} طالب`}
          actions={
            !isParent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Button 1: طالب جديد */}
                {canAdd && (
                  <button onClick={() => openForm()} className="btn btn-p" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: '0.88rem' }}>
                    <Plus style={{ width: 16, height: 16 }} />
                    <span>طالب جديد</span>
                  </button>
                )}

                {/* Button 2: تسجيل جلسة */}
                {canEdit && (
                  <button onClick={openQuickSession} className="btn btn-s" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: '0.85rem' }}>
                    <Stethoscope style={{ width: 15, height: 15 }} />
                    <span>تسجيل جلسة</span>
                  </button>
                )}

                {/* Button 3: تسجيل استشارة */}
                {canEdit && (
                  <button onClick={openConsult} className="btn btn-v" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: '0.85rem' }}>
                    <MessageCircle style={{ width: 15, height: 15 }} />
                    <span>تسجيل استشارة</span>
                  </button>
                )}

                {/* Button 4: إضافة قسم */}
                {canAdd && (
                  <button onClick={() => openCatForm()} className="btn btn-g" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: '0.85rem' }}>
                    <FolderPlus style={{ width: 15, height: 15, color: 'var(--pur)' }} />
                    <span>إضافة قسم</span>
                  </button>
                )}

                {/* Button 5: إضافة صف */}
                {canAdd && (
                  <button onClick={() => openSecForm()} className="btn btn-g" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: '0.85rem' }}>
                    <School style={{ width: 15, height: 15, color: 'var(--pr)' }} />
                    <span>إضافة صف</span>
                  </button>
                )}
              </div>
            ) : (
              centerWa && (
                <a href={centerWa} target="_blank" rel="noreferrer" className="btn btn-s">
                  💬 التواصل مع المركز
                </a>
              )
            )
          }
        />
      )}

      {/* 2️⃣ بطاقات الإحصائيات السريعة الموحدة */}
      {!activeFolder && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          <div className="unified-stat-box">
            <div className="stat-label">👦 إجمالي الطلاب المسجلين</div>
            <div className="stat-val">{students.length}</div>
            <div className="stat-sub">في كافة الأقسام والصفوف</div>
          </div>

          <div className="unified-stat-box">
            <div className="stat-label">✅ الطلاب النشطون والمستمرون</div>
            <div className="stat-val" style={{ color: 'var(--ok)' }}>{students.filter(s => s.status === 'active').length}</div>
            <div className="stat-sub">ملفات منتظمة في التدريب</div>
          </div>

          <div className="unified-stat-box">
            <div className="stat-label">⏳ قائمة الانتظار</div>
            <div className="stat-val" style={{ color: 'var(--warn)' }}>{students.filter(s => s.status === 'waitlist').length}</div>
            <div className="stat-sub">بانتظار توفر مقاعد شاغرة</div>
          </div>

          <div className="unified-stat-box">
            <div className="stat-label">🏫 الصفوف والشعب التأهيلية</div>
            <div className="stat-val" style={{ color: 'var(--pr)' }}>{sections.length}</div>
            <div className="stat-sub">موزعة على التخصصات</div>
          </div>
        </div>
      )}

      {/* 2️⃣ NAVIGATION & SUB-PAGE ROUTING SYSTEM */}
      {!activeFolder ? (
        /* MAIN LANDING NAV: Toggle between Classes System, Categories System, All Students List */
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '12px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div className="tabs" style={{ margin: 0, padding: '4px' }}>
            <button
              onClick={() => { setSystemMode('classes'); }}
              className={`tab ${systemMode === 'classes' ? 'on' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', padding: '8px 18px' }}
            >
              <School style={{ width: '16px', height: '16px' }} />
              <span>نظام الصفوف والأقسام ({sections.length})</span>
            </button>

            <button
              onClick={() => { setSystemMode('categories'); }}
              className={`tab ${systemMode === 'categories' ? 'on' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', padding: '8px 18px' }}
            >
              <Stethoscope style={{ width: '16px', height: '16px' }} />
              <span>نظام الفئات والتشخيصات ({allCategoryOptions.length})</span>
            </button>

            <button
              onClick={() => { setSystemMode('all'); }}
              className={`tab ${systemMode === 'all' ? 'on' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', padding: '8px 18px' }}
            >
              <Users style={{ width: '16px', height: '16px' }} />
              <span>جميع الطلاب بالمركز ({students.length})</span>
            </button>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
            إجمالي الطلاب المسجلين: <strong style={{ color: 'var(--pr)', fontSize: '0.95rem' }}>{students.length}</strong> طالب
          </div>
        </div>
      ) : (
        /* DEDICATED SUB-PAGE HEADER (ترويسة مخصصة موحدة عند الدخول لصفحة صف معين أو فئة معينة) */
        <UnifiedPageHeader
          icon={<span style={{ fontSize: '1.45rem' }}>{activeFolder.data?.icon || (activeFolder.type === 'class' ? '🏫' : '🧩')}</span>}
          iconBg={`${activeFolder.data?.color || 'var(--pr)'}20`}
          iconColor={activeFolder.data?.color || 'var(--pr)'}
          accentColor={activeFolder.data?.color || 'var(--pr)'}
          title={activeFolder.name}
          subtitle={activeFolder.data?.description || `قائمة طلاب ${activeFolder.type === 'class' ? 'الصف' : 'الفئة'} المسجلين`}
          badge={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {activeFolder.data?.code && (
                <span className="bdg b-gy" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  {activeFolder.data.code}
                </span>
              )}
              <span className="bdg b-bl" style={{ fontSize: '0.78rem', padding: '3px 10px', backgroundColor: `${activeFolder.data?.color || 'var(--pr)'}20`, color: activeFolder.data?.color || 'var(--pr)', fontWeight: 800 }}>
                {filteredStudents.length} طلاب
              </span>
            </div>
          }
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {canEdit && (
                <button
                  onClick={() => {
                    if (activeFolder.type === 'class') {
                      const sec = sections.find(s => s.id === activeFolder.id || s.name === activeFolder.name);
                      openSecForm(sec || activeFolder.data);
                    } else {
                      const cat = categories.find(c => c.id === activeFolder.id || c.name === activeFolder.name);
                      openCatForm(cat || activeFolder.data || { name: activeFolder.name });
                    }
                  }}
                  className="btn btn-g"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  <Edit3 style={{ width: 15, height: 15 }} />
                  <span>تعديل بيانات {activeFolder.type === 'class' ? 'الصف' : 'الفئة'}</span>
                </button>
              )}

              {canAdd && (
                <button
                  onClick={() => openForm(null, activeFolder.type === 'class' ? activeFolder.id : '', activeFolder.type === 'category' ? activeFolder.name : '')}
                  className="btn btn-p"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Plus style={{ width: 16, height: 16 }} />
                  <span>إضافة طالب {activeFolder.type === 'class' ? 'لهذا الصف' : 'لهذه الفئة'}</span>
                </button>
              )}
            </div>
          }
          onBack={() => setActiveFolder(null)}
          backLabel={`العودة لجميع ${activeFolder.type === 'class' ? 'الصفوف' : 'الفئات'}`}
        />
      )}

      {/* 3️⃣ VIEWS CONTENT */}

      {/* MODE 1: CLASSES GRID (عرض الصفوف في حاويات - النقر يفتح صفحة الصف) */}
      {systemMode === 'classes' && !activeFolder && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {sections.map((cls) => {
              const clsStudents = students.filter(s => s.sectionId === cls.id || s.className === cls.name);
              const maxCap = Number(cls.capacity) || 10;
              const percentage = Math.round((clsStudents.length / maxCap) * 100);
              const supervisor = emps.find(e => e.id === cls.supervisorId);
              const clsColor = cls.color || '#1a56db';

              return (
                <div
                  key={cls.id}
                  onClick={() => setActiveFolder({ type: 'class', id: cls.id, name: cls.name, data: cls })}
                  className="wg"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: `1.5px solid ${clsColor}40`,
                    borderRight: `6px solid ${clsColor}`,
                    borderRadius: 'var(--r)',
                    padding: '18px',
                    margin: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = clsColor;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--sh2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${clsColor}40`;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--sh)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.8rem', background: `${clsColor}15`, padding: '6px 10px', borderRadius: '10px' }}>
                        {cls.icon || '🏫'}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{cls.name}</h3>
                          {cls.code && (
                            <span className="bdg b-gy" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{cls.code}</span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{cls.type || 'قسم مخصص'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span className="bdg" style={{ fontSize: '0.76rem', padding: '4px 10px', backgroundColor: `${clsColor}20`, color: clsColor, fontWeight: '700' }}>
                        {clsStudents.length} / {maxCap} طالب
                      </span>

                      {canEdit && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); openSecForm(cls); }}
                            className="btn btn-g btn-xs"
                            title="تعديل بيانات الصف (اللون، السعة، الكود، الاسم)"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          >
                            <Edit3 style={{ width: '13px', height: '13px' }} />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteSec(cls.id, cls.name); }}
                            className="btn btn-g btn-xs"
                            title="حذف الصف"
                            style={{ padding: '3px 6px', color: 'var(--warn)' }}
                          >
                            <Trash2 style={{ width: '13px', height: '13px' }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '12px', height: '36px', overflow: 'hidden' }}>
                    {cls.description || 'فصل تأهيلي وتدريبي مجهز بالمركز'}
                  </p>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>المشرف: <strong style={{ color: 'var(--text-main)' }}>{supervisor ? supervisor.name : 'غير محدد'}</strong></span>
                    <span style={{ color: clsColor, fontWeight: '700' }}>افتح الصف ⬅️</span>
                  </div>

                  {/* Capacity Bar */}
                  <div style={{ width: '100%', background: 'var(--g1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: '100%',
                        background: percentage >= 100 ? 'var(--warn)' : clsColor,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: CATEGORIES GRID (عرض الفئات والتشخيصات في حاويات - النقر يفتح صفحة الفئة) */}
      {systemMode === 'categories' && !activeFolder && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {allCategoryOptions.map((catName) => {
              const catObj = categories.find(c => c.name === catName);
              const catStudents = students.filter(s => (s.diagnosis || '').trim() === catName);
              const catColor = catObj?.color || '#7c3aed';
              const catCap = catObj?.capacity || 20;

              return (
                <div
                  key={catName}
                  onClick={() => setActiveFolder({ type: 'category', id: catObj?.id || catName, name: catName, data: catObj })}
                  className="wg"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: `1.5px solid ${catColor}40`,
                    borderRight: `6px solid ${catColor}`,
                    borderRadius: 'var(--r)',
                    padding: '18px',
                    margin: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = catColor;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--sh2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${catColor}40`;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--sh)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.8rem', background: `${catColor}15`, padding: '6px 10px', borderRadius: '10px' }}>
                        {catObj?.icon || '🎯'}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{catName}</h3>
                          {catObj?.code && (
                            <span className="bdg b-gy" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{catObj.code}</span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>سعة الفئة: {catCap} طالب</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span className="bdg" style={{ fontSize: '0.78rem', padding: '4px 10px', backgroundColor: `${catColor}20`, color: catColor, fontWeight: '700' }}>
                        {catStudents.length} طلاب
                      </span>

                      {canEdit && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); openCatForm(catObj || { name: catName }); }}
                            className="btn btn-g btn-xs"
                            title="تعديل بيانات الفئة (اللون، السعة، الكود، الاسم)"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          >
                            <Edit3 style={{ width: '13px', height: '13px' }} />
                            <span>تعديل</span>
                          </button>
                          {catObj?.id && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteCat(catObj.id, catName); }}
                              className="btn btn-g btn-xs"
                              title="حذف الفئة"
                              style={{ padding: '3px 6px', color: 'var(--warn)' }}
                            >
                              <Trash2 style={{ width: '13px', height: '13px' }} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '12px', minHeight: '36px' }}>
                    {catObj?.description || 'مسار تشخيصي وتأهيلي متخصص بالمركز'}
                  </p>

                  <div style={{ fontSize: '0.78rem', color: catColor, fontWeight: '700', textAlign: 'left' }}>
                    عرض طلاب الفئة ⬅️
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4️⃣ FILTER TOOLBAR & STUDENTS LIST (إما عند فتح صفحة صف/فئة، أو عند اختيار "جميع الطلاب") */}
      {(activeFolder || systemMode === 'all') && (
        <div style={{ marginTop: '10px' }}>
          
          {/* COMPREHENSIVE FILTER TOOLBAR */}
          <div className="unified-filter-toolbar">
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search style={{ width: '16px', height: '16px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
              <input
                type="text"
                placeholder="ابحث باسم الطالب، الهوية، أو ولي الأمر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="srch"
                style={{ width: '100%', paddingRight: '36px', height: '40px', fontSize: '0.85rem' }}
              />
            </div>

            {/* Filter by Class (only when not in class folder) */}
            {!activeFolder || activeFolder.type !== 'class' ? (
              <select
                value={filterSec}
                onChange={(e) => setFilterSec(e.target.value)}
                className="srch"
                style={{ height: '40px', fontSize: '0.82rem', fontWeight: '600' }}
              >
                <option value="all">🏫 جميع الصفوف</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                <option value="none">بدون صف مخصص</option>
              </select>
            ) : null}

            {/* Filter by Category (only when not in category folder) */}
            {!activeFolder || activeFolder.type !== 'category' ? (
              <select
                value={filterDiag}
                onChange={(e) => setFilterDiag(e.target.value)}
                className="srch"
                style={{ height: '40px', fontSize: '0.82rem', fontWeight: '600' }}
              >
                <option value="all">🎯 جميع الفئات / التشخيصات</option>
                {allCategoryOptions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : null}

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="srch"
              style={{ height: '40px', fontSize: '0.82rem', fontWeight: '600' }}
            >
              <option value="all">📌 جميع الحالات بالمركز</option>
              {Object.entries(STATUSES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {/* Filter by Teacher / Specialist */}
            <select
              value={filterSpec}
              onChange={(e) => setFilterSpec(e.target.value)}
              className="srch"
              style={{ height: '40px', fontSize: '0.82rem', fontWeight: '600' }}
            >
              <option value="all">👨‍🏫 جميع المعلمين والأخصائيين</option>
              {specialists.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="srch"
              style={{ height: '40px', fontSize: '0.82rem', fontWeight: '600' }}
            >
              <option value="alpha">🔤 الترتيب: أبجدياً (أ-ي)</option>
              <option value="newest">🆕 الترتيب: الأحدث تسجيل</option>
              <option value="oldest">📜 الترتيب: الأقدم تسجيل</option>
              <option value="age">🔢 الترتيب: حسب العمر</option>
            </select>
          </div>

          {/* LIST BAR HEADER & VIEW MODE */}
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>قائمة الطلاب ({filteredStudents.length})</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="tabs" style={{ margin: 0, padding: '2px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`tab ${viewMode === 'grid' ? 'on' : ''}`}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  🎴 شبكة
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`tab ${viewMode === 'list' ? 'on' : ''}`}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  📋 جدول
                </button>
              </div>
            </div>
          </div>

          {/* STUDENTS DISPLAY */}
          {filteredStudents.length > 0 ? (
            viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                {paginatedStudents.map((student) => {
                  const spec = emps.find(e => e.id === student.specialistId);
                  const sec = sections.find(sec => sec.id === student.sectionId || sec.name === student.className);

                  return (
                    <div key={student.id} className="card" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '16px', margin: 0 }}>
                      
                      {/* Student Card Top */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="av lg" style={{ background: 'var(--pr-l)', color: 'var(--pr)', flexShrink: 0 }}>
                            {student.photo ? <img src={student.photo} alt={student.name} /> : student.name.substring(0, 2)}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                              {student.name}
                            </h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{calcAge(student.dob)}</span>
                          </div>
                        </div>

                        <span className={`bdg ${STATUS_BADGES[student.status] || 'b-gy'}`}>
                          {STATUSES[student.status] || student.status}
                        </span>
                      </div>

                      {/* Info Details */}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>🎯 التشخيص: <strong style={{ color: 'var(--text-main)' }}>{student.diagnosis || 'غير محدد'}</strong></div>
                        <div>🏫 الصف: <strong style={{ color: 'var(--text-main)' }}>{sec ? sec.name : student.className || 'غير مخصص'}</strong></div>
                        <div>👨‍🏫 المشرف: <strong style={{ color: 'var(--text-main)' }}>{spec ? spec.name : 'غير محدد'}</strong></div>
                      </div>

                      {/* Actions Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                        <button
                          onClick={() => setDetailId(student.id)}
                          className="btn btn-p btn-sm"
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                          <span>عرض الملف</span>
                        </button>

                        {student.parentPhone && (
                          <a
                            href={`https://wa.me/${student.parentPhone.replace(/[^0-9+]/g, '').replace(/^0/, '966')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-s btn-sm"
                            title="واتساب ولي الأمر"
                          >
                            <MessageCircle style={{ width: '14px', height: '14px' }} />
                          </a>
                        )}

                        {canEdit && (
                          <button
                            onClick={() => openForm(student)}
                            className="btn btn-g btn-sm"
                            title="تعديل"
                          >
                            <Edit3 style={{ width: '14px', height: '14px' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <div className="wg" style={{ overflowX: 'auto', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--g0)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-sub)', fontWeight: '700' }}>
                      <th style={{ padding: '12px' }}>الطالب</th>
                      <th style={{ padding: '12px' }}>الصف / القسم</th>
                      <th style={{ padding: '12px' }}>التشخيص</th>
                      <th style={{ padding: '12px' }}>ولي الأمر والتواصل</th>
                      <th style={{ padding: '12px' }}>المعلم / الأخصائي</th>
                      <th style={{ padding: '12px' }}>الحالة</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((s) => {
                      const spec = emps.find(e => e.id === s.specialistId);
                      const sec = sections.find(sec => sec.id === s.sectionId || sec.name === s.className);

                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px', fontWeight: '700' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="av" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                                {s.photo ? <img src={s.photo} alt={s.name} /> : s.name.substring(0, 2)}
                              </div>
                              <div>
                                <div>{s.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 'normal' }}>{calcAge(s.dob)}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>{sec ? sec.name : s.className || '—'}</td>
                          <td style={{ padding: '12px', color: 'var(--pr)', fontWeight: '600' }}>{s.diagnosis || '—'}</td>
                          <td style={{ padding: '12px', fontSize: '0.78rem' }}>
                            <div>{s.parentName || '—'}</div>
                            <div style={{ color: 'var(--text-sub)', direction: 'ltr', textAlign: 'right' }}>{s.parentPhone || '—'}</div>
                          </td>
                          <td style={{ padding: '12px' }}>{spec ? spec.name : '—'}</td>
                          <td style={{ padding: '12px' }}>
                            <span className={`bdg ${STATUS_BADGES[s.status] || 'b-gy'}`}>
                              {STATUSES[s.status] || s.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <button onClick={() => setDetailId(s.id)} className="btn btn-p btn-xs">
                                👁️ الملف
                              </button>
                              {canEdit && (
                                <button onClick={() => openForm(s)} className="btn btn-g btn-xs">
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
            )
          ) : (
            <div className="wg" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
              <AlertCircle style={{ width: '36px', height: '36px', color: 'var(--g4)', margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 4px' }}>لا يوجد طلاب مطبقين لمحددات التصفية</h3>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>جرب البحث عن اسم آخر أو تعديل شروط التصفية.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="btn btn-g btn-sm"
              >
                السابق
              </button>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="btn btn-g btn-sm"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5️⃣ MODAL 1: STUDENT FORM (إضافة / تعديل طالب) */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="wg" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', margin: 0 }}>
            <div className="wg-h">
              <h3>{editId ? '✏️ تعديل بيانات الطالب' : '➕ إضافة طالب جديد'}</h3>
              <button onClick={() => setShowForm(false)} className="btn btn-g btn-xs"><X style={{ width: '14px', height: '14px' }} /></button>
            </div>

            <div className="tabs" style={{ borderRadius: 0, margin: 0, padding: '6px' }}>
              <button onClick={() => setFormTab('basic')} className={`tab ${formTab === 'basic' ? 'on' : ''}`}>👤 البيانات الأساسية</button>
              <button onClick={() => setFormTab('diagnosis')} className={`tab ${formTab === 'diagnosis' ? 'on' : ''}`}>🩺 التشخيص والطبي</button>
              <button onClick={() => setFormTab('family')} className={`tab ${formTab === 'family' ? 'on' : ''}`}>👨‍👩‍👦 ولي الأمر</button>
              <button onClick={() => setFormTab('programs')} className={`tab ${formTab === 'programs' ? 'on' : ''}`}>🗂️ الدوام والمرفقات</button>
            </div>

            <div className="wg-b" style={{ overflowY: 'auto', flex: 1 }}>
              {formTab === 'basic' && (
                <div className="fg c2">
                  <div className="fl full">
                    <label>اسم الطالب رباعياً <span className="req">*</span></label>
                    <input type="text" value={form.name} onChange={fld('name')} placeholder="علي أحمد محمد العلي" />
                  </div>
                  <div className="fl">
                    <label>تاريخ الميلاد <span className="req">*</span></label>
                    <input type="date" value={form.dob} onChange={fld('dob')} />
                  </div>
                  <div className="fl">
                    <label>تخصيص الصف الدراسـي <span className="req">*</span></label>
                    <select value={form.sectionId} onChange={fld('sectionId')}>
                      <option value="">-- اختر الصف --</option>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.icon || '🏫'} {s.name}</option>)}
                    </select>
                  </div>
                  <div className="fl">
                    <label>المعلم / الأخصائي المشرف</label>
                    <select value={form.specialistId} onChange={fld('specialistId')}>
                      <option value="">-- اختر الأخصائي المشرف --</option>
                      {specialists.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                    </select>
                  </div>
                  <div className="fl">
                    <label>حالة التسجيل بالمركز</label>
                    <select value={form.status} onChange={fld('status')}>
                      {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="fl">
                    <label>الجنس</label>
                    <select value={form.gender} onChange={fld('gender')}>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div className="fl">
                    <label>الجنسية</label>
                    <input type="text" value={form.nationality} onChange={fld('nationality')} />
                  </div>
                </div>
              )}

              {formTab === 'diagnosis' && (
                <div className="fg c2">
                  <div className="fl full">
                    <label>التشخيص الرئيسي / الفئة <span className="req">*</span></label>
                    <select value={form.diagnosis} onChange={fld('diagnosis')}>
                      <option value="">-- اختر الفئة التشخيصية --</option>
                      {allCategoryOptions.map(d => <option key={d} value={d}>🎯 {d}</option>)}
                    </select>
                  </div>
                  <div className="fl">
                    <label>التشخيص الثانوي / المصاحب</label>
                    <input type="text" value={form.diagnosis2} onChange={fld('diagnosis2')} placeholder="مثال: صعوبات نطق، تشتت انتباه..." />
                  </div>
                  <div className="fl">
                    <label>جهة التشخيص (المستشفى / الطبيب)</label>
                    <input type="text" value={form.hospital} onChange={fld('hospital')} />
                  </div>
                  <div className="fl full">
                    <label>الأدوية والتعليمات الطبية الخاصة</label>
                    <textarea rows="3" value={form.medications} onChange={fld('medications')} placeholder="اكتب تفاصيل الأدوية، المواعيد، أو الحساسية..." />
                  </div>
                </div>
              )}

              {formTab === 'family' && (
                <div className="fg c2">
                  <div className="fl">
                    <label>اسم ولي الأمر <span className="req">*</span></label>
                    <input type="text" value={form.parentName} onChange={fld('parentName')} />
                  </div>
                  <div className="fl">
                    <label>صلة القرابة</label>
                    <select value={form.parentRelation} onChange={fld('parentRelation')}>
                      <option value="الأب">الأب</option>
                      <option value="الأم">الأم</option>
                      <option value="الأخ/الأخت">الأخ/الأخت</option>
                      <option value="الوصي الشرعي">الوصي الشرعي</option>
                    </select>
                  </div>
                  <div className="fl">
                    <label>رقم الجوال الرئيسي (واتساب) <span className="req">*</span></label>
                    <input type="text" value={form.parentPhone} onChange={fld('parentPhone')} placeholder="05xxxxxxxx" />
                  </div>
                  <div className="fl">
                    <label>رقم جوال إضافي / طوارئ</label>
                    <input type="text" value={form.parentPhone2} onChange={fld('parentPhone2')} />
                  </div>
                  <div className="fl full">
                    <label>العنوان والحي السكني</label>
                    <input type="text" value={form.address} onChange={fld('address')} />
                  </div>
                </div>
              )}

              {formTab === 'programs' && (
                <div className="fg">
                  <div className="fl">
                    <label>صورة الطالب الشخصية</label>
                    <input type="file" accept="image/*" onChange={handlePhoto} />
                  </div>
                  <div className="fl full">
                    <label>ملاحظات إضافية على الطالب</label>
                    <textarea rows="3" value={form.notes} onChange={fld('notes')} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 16px', background: 'var(--g0)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowForm(false)} className="btn btn-g">إلغاء</button>
              <button onClick={saveStudent} className="btn btn-p">حفظ البيانات</button>
            </div>
          </div>
        </div>
      )}

      {/* 6️⃣ MODAL 2: QUICK SESSION (تسجيل جلسة) */}
      {showQuickSession && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="wg" style={{ width: '100%', maxWidth: '550px', margin: 0 }}>
            <div className="wg-h">
              <h3>🩺 تسجيل جلسة تأهيلية سريعة</h3>
              <button onClick={() => setShowQuickSession(false)} className="btn btn-g btn-xs"><X style={{ width: '14px', height: '14px' }} /></button>
            </div>
            <div className="wg-b fg c2">
              <div className="fl full">
                <label>اختر الطالب <span className="req">*</span></label>
                <select value={qsForm.stuId} onChange={fldQs('stuId')}>
                  <option value="">-- اختر الطالب --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.className || 'بدون صف'})</option>)}
                </select>
              </div>
              <div className="fl">
                <label>نوع الجلسة</label>
                <select value={qsForm.type} onChange={fldQs('type')}>
                  <option value="تخاطب ونطق">تخاطب ونطق</option>
                  <option value="تعديل سلوك">تعديل سلوك</option>
                  <option value="علاج فيزيائي">علاج فيزيائي</option>
                  <option value="علاج وظيفي">علاج وظيفي</option>
                  <option value="تكامل حسي">تكامل حسي</option>
                  <option value="تعليمي وتربوي">تعليمي وتربوي</option>
                </select>
              </div>
              <div className="fl">
                <label>الأخصائي / المعلم</label>
                <select value={qsForm.empId} onChange={fldQs('empId')}>
                  <option value="">-- اختر الأخصائي --</option>
                  {specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="fl">
                <label>تاريخ الجلسة</label>
                <input type="date" value={qsForm.date} onChange={fldQs('date')} />
              </div>
              <div className="fl">
                <label>وقت الجلسة</label>
                <input type="time" value={qsForm.time} onChange={fldQs('time')} />
              </div>
              <div className="fl full">
                <label>ملاحظات الجلسة والأهداف المحققة</label>
                <textarea rows="3" value={qsForm.notes} onChange={fldQs('notes')} placeholder="اكتب ملخص أداء الطالب والجلسة..." />
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--g0)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowQuickSession(false)} className="btn btn-g">إلغاء</button>
              <button onClick={saveQuickSession} className="btn btn-s">حفظ الجلسة</button>
            </div>
          </div>
        </div>
      )}

      {/* 7️⃣ MODAL 3: CONSULTATION (تسجيل استشارة) */}
      {showConsult && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="wg" style={{ width: '100%', maxWidth: '550px', margin: 0 }}>
            <div className="wg-h">
              <h3>💬 تسجيل استشارة جديدة</h3>
              <button onClick={() => setShowConsult(false)} className="btn btn-g btn-xs"><X style={{ width: '14px', height: '14px' }} /></button>
            </div>
            <div className="wg-b fg c2">
              <div className="fl">
                <label>اسم المستفيد / الحالة <span className="req">*</span></label>
                <input type="text" value={consultForm.beneficiaryName} onChange={fldCo('beneficiaryName')} />
              </div>
              <div className="fl">
                <label>اسم ولي الأمر</label>
                <input type="text" value={consultForm.parentName} onChange={fldCo('parentName')} />
              </div>
              <div className="fl">
                <label>تاريخ الاستشارة</label>
                <input type="date" value={consultForm.date} onChange={fldCo('date')} />
              </div>
              <div className="fl">
                <label>وقت الاستشارة</label>
                <input type="time" value={consultForm.time} onChange={fldCo('time')} />
              </div>
              <div className="fl full">
                <label>مستشار الجلسة / الأخصائي</label>
                <select value={consultForm.empId} onChange={fldCo('empId')}>
                  <option value="">-- اختر الأخصائي المستشار --</option>
                  {specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="fl full">
                <label>تفاصيل وتوصيات الاستشارة</label>
                <textarea rows="3" value={consultForm.notes} onChange={fldCo('notes')} />
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--g0)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowConsult(false)} className="btn btn-g">إلغاء</button>
              <button onClick={saveConsult} className="btn btn-v">حفظ الاستشارة</button>
            </div>
          </div>
        </div>
      )}

      {/* 8️⃣ MODAL 4: ADD / EDIT CLASS (إضافة وتعديل بيانات الصف) */}
      {showSecModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="wg" style={{ width: '100%', maxWidth: '560px', margin: 0 }}>
            <div className="wg-h" style={{ borderBottom: '2px solid var(--border-color)', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>🏫 {secEditId ? 'تعديل كافة بيانات الصف' : 'إضافة صف / شعبة جديدة'}</h3>
              <button onClick={() => setShowSecModal(false)} className="btn btn-g btn-xs"><X style={{ width: '14px', height: '14px' }} /></button>
            </div>
            <div className="wg-b fg c2" style={{ padding: '20px' }}>
              <div className="fl">
                <label>اسم الصف الدراسي <span className="req">*</span></label>
                <input type="text" value={secForm.name} onChange={e => setSecForm(s => ({ ...s, name: e.target.value }))} placeholder="مثال: صف اللؤلؤ، صف الفرسان..." />
              </div>

              <div className="fl">
                <label>رمز / كود الصف</label>
                <input type="text" value={secForm.code || ''} onChange={e => setSecForm(s => ({ ...s, code: e.target.value }))} placeholder="مثال: SEC-01" />
              </div>

              {/* Color Picker & Presets */}
              <div className="fl full">
                <label>لون الصف المخصص (للحاويات والتقارير)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={secForm.color || '#1a56db'}
                    onChange={e => setSecForm(s => ({ ...s, color: e.target.value }))}
                    style={{ width: '45px', height: '38px', padding: '2px', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                  />
                  <input
                    type="text"
                    value={secForm.color || '#1a56db'}
                    onChange={e => setSecForm(s => ({ ...s, color: e.target.value }))}
                    style={{ width: '110px', fontFamily: 'monospace' }}
                  />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['#1a56db', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#db2777'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSecForm(s => ({ ...s, color: c }))}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          border: secForm.color === c ? '2px solid var(--text-main)' : 'none',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="fl">
                <label>الأيقونة المميزة / الرمز</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={secForm.icon || '🏫'}
                    onChange={e => setSecForm(s => ({ ...s, icon: e.target.value }))}
                    style={{ width: '60px', textAlign: 'center', fontSize: '1.2rem' }}
                  />
                  <select value={secForm.icon} onChange={e => setSecForm(s => ({ ...s, icon: e.target.value }))} style={{ flex: 1 }}>
                    <option value="🏫">🏫 مدرسة</option>
                    <option value="🦪">🦪 لؤلؤ</option>
                    <option value="🪸">🪸 مرجان</option>
                    <option value="💎">💎 زمرد</option>
                    <option value="🎨">🎨 فن وإبداع</option>
                    <option value="🌟">🌟 نجوم</option>
                    <option value="👑">👑 الفرسان</option>
                    <option value="🚀">🚀 الأمل</option>
                    <option value="🌈">🌈 قوس قزح</option>
                    <option value="🌻">🌻 عباد الشمس</option>
                  </select>
                </div>
              </div>

              <div className="fl">
                <label>السعة الاستيعابية القصوى (طلاب)</label>
                <input type="number" min="1" max="100" value={secForm.capacity || 10} onChange={e => setSecForm(s => ({ ...s, capacity: e.target.value }))} />
              </div>

              <div className="fl full">
                <label>المعلم / الأخصائي المشرف على الصف</label>
                <select value={secForm.supervisorId || ''} onChange={e => setSecForm(s => ({ ...s, supervisorId: e.target.value }))}>
                  <option value="">-- اختر الأخصائي المشرف --</option>
                  {specialists.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                </select>
              </div>

              <div className="fl full">
                <label>نوع القسم / التخصص</label>
                <input type="text" value={secForm.type || 'قسم متخصص'} onChange={e => setSecForm(s => ({ ...s, type: e.target.value }))} placeholder="مثال: قسم طيف التوحد، قسم التدخل المبكر..." />
              </div>

              <div className="fl full">
                <label>وصف الصف والبرامج المخصصة له</label>
                <textarea rows="2" value={secForm.description || ''} onChange={e => setSecForm(s => ({ ...s, description: e.target.value }))} placeholder="أدخل أهداف ورسالة هذا الصف..." />
              </div>
            </div>
            <div style={{ padding: '14px 20px', background: 'var(--g0)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowSecModal(false)} className="btn btn-g">إلغاء</button>
              <button onClick={saveSec} className="btn btn-p">حفظ بيانات الصف</button>
            </div>
          </div>
        </div>
      )}

      {/* 9️⃣ MODAL 5: ADD / EDIT CATEGORY / DEPARTMENT (إضافة وتعديل الفئة والقسم) */}
      {showCatModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="wg" style={{ width: '100%', maxWidth: '560px', margin: 0 }}>
            <div className="wg-h" style={{ borderBottom: '2px solid var(--border-color)', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>📂 {catEditId ? 'تعديل كافة بيانات الفئة / القسم' : 'إضافة قسم / فئة تشخيصية جديدة'}</h3>
              <button onClick={() => setShowCatModal(false)} className="btn btn-g btn-xs"><X style={{ width: '14px', height: '14px' }} /></button>
            </div>
            <div className="wg-b fg c2" style={{ padding: '20px' }}>
              <div className="fl">
                <label>اسم القسم / الفئة التشخيصية <span className="req">*</span></label>
                <input type="text" value={catForm.name} onChange={e => setCatForm(c => ({ ...c, name: e.target.value }))} placeholder="مثال: قسم التوحد، قسم التدخل المبكر..." />
              </div>

              <div className="fl">
                <label>رمز / كود الفئة</label>
                <input type="text" value={catForm.code || ''} onChange={e => setCatForm(c => ({ ...c, code: e.target.value }))} placeholder="مثال: AUT-01" />
              </div>

              {/* Color Picker & Presets */}
              <div className="fl full">
                <label>لون الفئة المخصص (للحاويات والبطاقات)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={catForm.color || '#7c3aed'}
                    onChange={e => setCatForm(c => ({ ...c, color: e.target.value }))}
                    style={{ width: '45px', height: '38px', padding: '2px', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                  />
                  <input
                    type="text"
                    value={catForm.color || '#7c3aed'}
                    onChange={e => setCatForm(c => ({ ...c, color: e.target.value }))}
                    style={{ width: '110px', fontFamily: 'monospace' }}
                  />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['#7c3aed', '#1a56db', '#059669', '#d97706', '#dc2626', '#0891b2', '#db2777'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCatForm(c => ({ ...c, color: c }))}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          border: catForm.color === c ? '2px solid var(--text-main)' : 'none',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="fl">
                <label>رمز / أيقونة الفئة</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={catForm.icon || '🎯'}
                    onChange={e => setCatForm(c => ({ ...c, icon: e.target.value }))}
                    style={{ width: '60px', textAlign: 'center', fontSize: '1.2rem' }}
                  />
                  <select value={catForm.icon} onChange={e => setCatForm(c => ({ ...c, icon: e.target.value }))} style={{ flex: 1 }}>
                    <option value="🧩">🧩 توحد / طيف التوحد</option>
                    <option value="🌟">🌟 متلازمة داون</option>
                    <option value="📚">📚 صعوبات التعلم</option>
                    <option value="🌱">🌱 التدخل المبكر</option>
                    <option value="🩺">🩺 العلاج الوظيفي</option>
                    <option value="👂">👂 التخاطب والسمعيات</option>
                    <option value="🎯">🎯 اضطرابات نمائية</option>
                    <option value="📂">📂 قسم عام</option>
                  </select>
                </div>
              </div>

              <div className="fl">
                <label>السعة الاستيعابية للفئة (طلاب)</label>
                <input type="number" min="1" max="200" value={catForm.capacity || 20} onChange={e => setCatForm(c => ({ ...c, capacity: e.target.value }))} />
              </div>

              <div className="fl full">
                <label>الوصف والخدمات التأهيلية المقدمة في هذا القسم</label>
                <textarea rows="3" value={catForm.description || ''} onChange={e => setCatForm(c => ({ ...c, description: e.target.value }))} placeholder="اكتب تفاصيل المسار التأهيلي والخدمات المتاحة..." />
              </div>
            </div>
            <div style={{ padding: '14px 20px', background: 'var(--g0)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowCatModal(false)} className="btn btn-g">إلغاء</button>
              <button onClick={saveCat} className="btn btn-p">حفظ بيانات الفئة</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
