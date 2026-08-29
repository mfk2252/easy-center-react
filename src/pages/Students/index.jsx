import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { DIAGNOSES, SPECIALIST_ROLES } from '../../utils/constants';
import { calcAge, todayStr, uid, nowTimeStr } from '../../utils/dateHelpers';
import EmptyState from '../../components/ui/EmptyState';
import StudentDetail from './StudentDetail';
import { parentCanViewStudent, centerWhatsAppUrl } from '../../utils/parentAccess';

const STATUSES = {
  active: '✅ نشط',
  inactive: '⏸️ منقطع',
  graduated: '🎓 متخرج',
  transferred: '🔄 محوّل',
  waitlist: '⏳ انتظار',
  rejected: '❌ غير مناسب'
};
const STATUS_BADGE = {
  active: 'b-gr',
  inactive: 'b-gy',
  graduated: 'b-cy',
  transferred: 'b-bl',
  waitlist: 'b-or',
  rejected: 'b-rd'
};

const DEFAULT_SECTIONS = [
  { id: 'sec_autism', name: 'قسم اضطراب طيف التوحد (صف اللؤلؤ)', type: 'قسم متخصص', capacity: 10, supervisorId: '', color: '#1a56db', icon: '🧩', description: 'برامج التأهيل والتدريب لاضطراب طيف التوحد' },
  { id: 'sec_down', name: 'قسم متلازمة داون (صف المرجان)', type: 'قسم متخصص', capacity: 8, supervisorId: '', color: '#059669', icon: '🌟', description: 'تنمية المهارات الإدراكية والحركية والاجتماعية' },
  { id: 'sec_early', name: 'قسم التدخل المبكر (صف الزمرد)', type: 'مرحلة تأهيلية', capacity: 12, supervisorId: '', color: '#7c3aed', icon: '🌱', description: 'الرعاية التأهيلية والتدخل المبكر للأطفال' },
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
const EMPTY_SEC = { name: '', type: 'قسم متخصص', capacity: 10, supervisorId: '', color: '#1a56db', icon: '🧩', description: '' };

const ITEMS_PER_PAGE = 12;

export default function StudentsPage() {
  const { toast, currentUser, activeView, center } = useApp();
  const isParent = currentUser?.role === 'parent';

  // Data State
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [emps, setEmps] = useState([]);

  // High-Level View Control: 'sections' | 'categories' | 'all'
  const [viewGroup, setViewGroup] = useState('sections');
  // Student Render Format: 'grid' | 'list'
  const [viewMode, setViewMode] = useState('grid');

  // Filter & Search State
  const [q, setQ] = useState('');
  const [filterSec, setFilterSec] = useState('all'); // 'all' | 'none' | sectionId
  const [filterDiag, setFilterDiag] = useState('all'); // 'all' | diagnosis name
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterShift, setFilterShift] = useState('all');
  const [filterSpec, setFilterSpec] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Forms State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_STU);
  const [formTab, setFormTab] = useState('basic');

  const [detailId, setDetailId] = useState(null);

  const [showQuickSession, setShowQuickSession] = useState(false);
  const [qsForm, setQsForm] = useState(EMPTY_QS);

  const [showConsult, setShowConsult] = useState(false);
  const [consultForm, setConsultForm] = useState(EMPTY_CONSULT);

  // Section Management Modal State
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
  }, [isParent, currentUser?.studentId, currentUser?.username, detailId]);

  function reload() {
    setStudents(lsGet('students'));
    setSections(lsGet('sections') || DEFAULT_SECTIONS);
  }

  // Reset page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSec, filterDiag, filterStatus, filterShift, filterSpec, q, viewGroup]);

  // Extract all unique Diagnoses / Categories from system data
  const allCategoryOptions = useMemo(() => {
    const list = [...DIAGNOSES];
    students.forEach(s => {
      if (s.diagnosis && s.diagnosis.trim() && !list.includes(s.diagnosis.trim())) {
        list.push(s.diagnosis.trim());
      }
    });
    return list;
  }, [students]);

  // Combined Filtering Logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (isParent && !parentCanViewStudent(s, currentUser)) return false;

      // Filter by Class / Section
      if (filterSec !== 'all') {
        if (filterSec === 'none') {
          if (s.sectionId || s.className) return false;
        } else {
          const matchSec = s.sectionId === filterSec || s.className === filterSec;
          if (!matchSec) return false;
        }
      }

      // Filter by Category / Diagnosis
      if (filterDiag !== 'all') {
        if ((s.diagnosis || '').trim() !== filterDiag) return false;
      }

      // Filter by Status
      if (filterStatus !== 'all') {
        if (s.status !== filterStatus) return false;
      }

      // Filter by Shift / Program
      if (filterShift !== 'all') {
        if (filterShift === 'morning' && !s.progMorning?.enabled) return false;
        if (filterShift === 'evening' && !s.progEvening?.enabled) return false;
        if (filterShift === 'sessions' && !s.progSessions?.enabled) return false;
        if (filterShift === 'online' && !s.progOnline?.enabled) return false;
      }

      // Filter by Specialist
      if (filterSpec !== 'all') {
        if (s.specialistId !== filterSpec) return false;
      }

      // Search Query
      if (q.trim()) {
        const ql = q.toLowerCase().trim();
        const nameMatch = (s.name || '').toLowerCase().includes(ql);
        const diagMatch = (s.diagnosis || '').toLowerCase().includes(ql) || (s.diagnosis2 || '').toLowerCase().includes(ql);
        const parentMatch = (s.parentName || '').toLowerCase().includes(ql);
        const phoneMatch = (s.parentPhone || '').includes(ql) || (s.parentPhone2 || '').includes(ql);
        const classMatch = (s.className || '').toLowerCase().includes(ql);
        if (!nameMatch && !diagMatch && !parentMatch && !phoneMatch && !classMatch) return false;
      }

      return true;
    });
  }, [students, isParent, currentUser, filterSec, filterDiag, filterStatus, filterShift, filterSpec, q]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const isFiltered = filterSec !== 'all' || filterDiag !== 'all' || filterStatus !== 'all' || filterShift !== 'all' || filterSpec !== 'all' || q.trim() !== '';

  function resetFilters() {
    setQ('');
    setFilterSec('all');
    setFilterDiag('all');
    setFilterStatus('all');
    setFilterShift('all');
    setFilterSpec('all');
  }

  function handleSelectSection(secId) {
    if (filterSec === secId) {
      setFilterSec('all');
    } else {
      setFilterSec(secId);
    }
  }

  function handleSelectCategory(catName) {
    if (filterDiag === catName) {
      setFilterDiag('all');
    } else {
      setFilterDiag(catName);
    }
  }

  // Form Handlers
  const fld = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  function fldProg(prog, key) { return e => setForm(f => ({ ...f, [prog]: { ...f[prog], [key]: e.target.value } })); }
  function toggleProg(prog) { setForm(f => ({ ...f, [prog]: { ...f[prog], enabled: !f[prog].enabled } })); }

  function openForm(stu = null, defaultSecId = '') {
    setFormTab('basic');
    if (stu) {
      setForm({ ...EMPTY_STU, ...stu, attachments: stu.attachments || [] });
      setEditId(stu.id);
    } else {
      setForm({ ...EMPTY_STU, sectionId: defaultSecId || (filterSec !== 'all' && filterSec !== 'none' ? filterSec : ''), diagnosis: filterDiag !== 'all' ? filterDiag : '', joinDate: todayStr(), attachments: [] });
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
      toast('✅ تم إضافة الطالب وتخصيصه لصفه بنجاح', 'ok');
    }
    setShowForm(false);
    reload();
  }

  function deleteStu(id) {
    if (!window.confirm('⚠️ تحذير نهائي: سيتم حذف الطالب وجميع الارتباطات ببياناته.\nهل تريد المتابعة؟')) return;
    lsDel('students', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
    setDetailId(null);
  }

  // Section Handlers
  function openSecForm(sec = null) {
    if (sec) { setSecForm({ ...EMPTY_SEC, ...sec }); setSecEditId(sec.id); }
    else { setSecForm(EMPTY_SEC); setSecEditId(null); }
    setShowSecModal(true);
  }

  function saveSec() {
    if (!secForm.name.trim()) { toast('⚠️ أدخل اسم القسم / الصف', 'er'); return; }
    if (secEditId) {
      lsUpd('sections', secEditId, secForm);
      toast('✅ تم تحديث بيانات القسم/الصف', 'ok');
    } else {
      lsAdd('sections', { ...secForm, id: uid() });
      toast('✅ تم إضافة القسم/الصف الجديد', 'ok');
    }
    setShowSecModal(false);
    reload();
  }

  function deleteSec(secId) {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا القسم؟ سيصبح جميع طلاب هذا القسم غير موزعين.')) return;
    lsDel('sections', secId);
    students.forEach(s => {
      if (s.sectionId === secId) {
        lsUpd('students', s.id, { ...s, sectionId: '' });
      }
    });
    toast('🗑️ تم حذف القسم', 'ok');
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

  // Quick Session Handlers
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
    toast('✅ تم تسجيل الجلسة بنجاح', 'ok');
    setShowQuickSession(false);
    reload();
  }

  // Consultation Handlers
  const fldCo = k => e => setConsultForm(f => ({ ...f, [k]: e.target.value }));
  function openConsult() {
    setConsultForm({ ...EMPTY_CONSULT, date: todayStr(), time: nowTimeStr() });
    setShowConsult(true);
  }

  function coAttach(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setConsultForm(fm => ({ ...fm, attachData: ev.target.result, attachName: f.name }));
    r.readAsDataURL(f);
    e.target.value = '';
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

  // Statistics calculation
  const activeCount = students.filter(s => s.status === 'active').length;
  const waitlistCount = students.filter(s => s.status === 'waitlist').length;
  const unassignedCount = students.filter(s => !s.sectionId && (!s.className || !sections.some(sec => sec.name === s.className))).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1️⃣ Page Header with Centralized Actions */}
      <div className="ph" style={{ background: 'linear-gradient(135deg, var(--g0) 0%, var(--g1) 100%)', borderRadius: 16, padding: '20px 24px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div className="ph-t">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👦</span>
            <span>{isParent ? 'بيانات الطفل والبرامج' : 'إدارة الطلاب والأقسام الدراسية'}</span>
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '.88rem', marginTop: 4 }}>
            {isParent ? 'متابعة الملف الشخصي للطفل والأنشطة والجلسات المسجلة' : 'نظام تنظيمي متكامل لإدارة بيانات الطلاب وتصفيتهم حسب الصفوف والفئات التأهيلية'}
          </p>
        </div>
        {isParent && centerWa && (
          <a href={centerWa} target="_blank" rel="noreferrer" className="btn btn-bl" style={{ borderRadius: 10, padding: '8px 16px', fontWeight: 700 }}>
            💬 التواصل مع إدارة المركز
          </a>
        )}
        <div className="ph-a" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {canAdd && (
            <button type="button" className="btn btn-p" onClick={() => openForm()} style={{ padding: '9px 20px', fontWeight: 800, borderRadius: 10, fontSize: '.95rem', boxShadow: '0 4px 12px rgba(26,86,219,0.2)' }}>
              ➕ طالب جديد
            </button>
          )}
          {canAdd && (
            <button type="button" className="btn btn-g" onClick={() => openSecForm()} style={{ padding: '8px 16px', fontWeight: 700, borderRadius: 10, background: 'var(--g1)', border: '1px solid var(--border-color)' }}>
              🏫 إضافة قسم / صف
            </button>
          )}
          {canEdit && (
            <button type="button" className="btn btn-s" onClick={openQuickSession} style={{ padding: '8px 16px', fontWeight: 700, borderRadius: 10 }}>
              🩺 تسجيل جلسة
            </button>
          )}
          {canEdit && (
            <button type="button" className="btn" onClick={openConsult} style={{ padding: '8px 16px', fontWeight: 700, borderRadius: 10, background: 'var(--cyan-l,#ecfeff)', color: 'var(--cyan,#0891b2)', border: '1px solid var(--cyan,#0891b2)' }}>
              💬 تسجيل استشارة
            </button>
          )}
        </div>
      </div>

      {/* Quick Statistics KPI Cards */}
      <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div className="sc g" style={{ padding: '14px 18px', borderRadius: 12 }}>
          <div className="lb">الطلاب النشطون</div>
          <div className="vl" style={{ fontSize: '1.6rem', fontWeight: 900 }}>{activeCount}</div>
        </div>
        <div className="sc" style={{ padding: '14px 18px', borderRadius: 12 }}>
          <div className="lb">إجمالي الصفوف والأقسام</div>
          <div className="vl" style={{ fontSize: '1.6rem', fontWeight: 900 }}>{sections.length}</div>
        </div>
        <div className="sc o" style={{ padding: '14px 18px', borderRadius: 12 }}>
          <div className="lb">قائمة الانتظار</div>
          <div className="vl" style={{ fontSize: '1.6rem', fontWeight: 900 }}>{waitlistCount}</div>
        </div>
        <div className="sc v" style={{ padding: '14px 18px', borderRadius: 12 }}>
          <div className="lb">غير الموزعين على صفوف</div>
          <div className="vl" style={{ fontSize: '1.6rem', fontWeight: 900 }}>{unassignedCount}</div>
        </div>
        <div className="sc" style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--g0)' }}>
          <div className="lb">إجمالي المسجلين</div>
          <div className="vl" style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--pr)' }}>{students.length}</div>
        </div>
      </div>

      {/* 2️⃣ Modern Control Panel & Segmented View Switcher */}
      <div className="wg" style={{ margin: 0, padding: '20px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        
        {/* Top Segmented View & Layout Toggle Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
          
          {/* Segmented Group View Toggle Button */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--g1)', padding: 5, borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className={`btn ${viewGroup === 'sections' ? 'btn-p' : 'btn-g'}`}
              onClick={() => { setViewGroup('sections'); setFilterSec('all'); setFilterDiag('all'); }}
              style={{ fontSize: '.88rem', padding: '8px 18px', borderRadius: 9, fontWeight: 800, transition: 'all .2s' }}
            >
              🏫 حسب الصفوف والأقسام
            </button>
            <button
              type="button"
              className={`btn ${viewGroup === 'categories' ? 'btn-p' : 'btn-g'}`}
              onClick={() => { setViewGroup('categories'); setFilterSec('all'); setFilterDiag('all'); }}
              style={{ fontSize: '.88rem', padding: '8px 18px', borderRadius: 9, fontWeight: 800, transition: 'all .2s' }}
            >
              🏷️ حسب الفئات والتشخيصات
            </button>
            <button
              type="button"
              className={`btn ${viewGroup === 'all' ? 'btn-p' : 'btn-g'}`}
              onClick={() => { setViewGroup('all'); setFilterSec('all'); setFilterDiag('all'); }}
              style={{ fontSize: '.88rem', padding: '8px 18px', borderRadius: 9, fontWeight: 800, transition: 'all .2s' }}
            >
              👥 عرض جميع الطلاب ({students.length})
            </button>
          </div>

          {/* Render Mode Switcher (Grid vs Table) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.82rem', color: 'var(--text-sub)', fontWeight: 700 }}>نمط العرض:</span>
            <div style={{ display: 'flex', gap: 4, background: 'var(--g1)', padding: 4, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className={`btn ${viewMode === 'grid' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setViewMode('grid')}
                title="عرض الشبكة البصرية"
                style={{ fontSize: '.82rem', padding: '5px 12px', borderRadius: 7, fontWeight: 700 }}
              >
                🎴 شبكة
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'list' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setViewMode('list')}
                title="عرض الجدول المنظم"
                style={{ fontSize: '.82rem', padding: '5px 12px', borderRadius: 7, fontWeight: 700 }}
              >
                📋 جدول
              </button>
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Search Input */}
          <div className="fl" style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-sub)' }}>🔎 البحث السريع بالاسم، الهوية، أو ولي الأمر</label>
            <input
              className="srch"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="اكتب اسم الطالب، الهوية، رقم الجوال..."
              style={{ width: '100%', paddingRight: 12, height: 42, borderRadius: 10 }}
            />
          </div>

          {/* Select Class Filter */}
          <div className="fl">
            <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--pr)' }}>🏫 فلترة بالصف / القسم</label>
            <select
              className="fsel"
              value={filterSec}
              onChange={e => setFilterSec(e.target.value)}
              style={{ height: 42, borderRadius: 10, borderColor: filterSec !== 'all' ? 'var(--pr)' : 'var(--border-color)', background: filterSec !== 'all' ? 'var(--pr-l,#eff6ff)' : 'transparent', fontWeight: filterSec !== 'all' ? 800 : 400 }}
            >
              <option value="all">-- جميع الصفوف والأقسام --</option>
              <option value="none">📂 طلاب بدون صف / قسم مخصص</option>
              {sections.map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.icon || '🧩'} {sec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Category Filter */}
          <div className="fl">
            <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ok,#059669)' }}>🏷️ فلترة بالفئة / التشخيص</label>
            <select
              className="fsel"
              value={filterDiag}
              onChange={e => setFilterDiag(e.target.value)}
              style={{ height: 42, borderRadius: 10, borderColor: filterDiag !== 'all' ? 'var(--ok,#059669)' : 'var(--border-color)', background: filterDiag !== 'all' ? 'var(--ok-l,#ecfdf5)' : 'transparent', fontWeight: filterDiag !== 'all' ? 800 : 400 }}
            >
              <option value="all">-- جميع الفئات والتشخيصات --</option>
              {allCategoryOptions.map(d => (
                <option key={d} value={d}>
                  🎯 {d}
                </option>
              ))}
            </select>
          </div>

          {/* Select Status Filter */}
          <div className="fl">
            <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-sub)' }}>📌 حالة الطالب</label>
            <select
              className="fsel"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ height: 42, borderRadius: 10 }}
            >
              <option value="all">جميع الحالات</option>
              {Object.entries(STATUSES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Select Specialist Filter */}
          <div className="fl">
            <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-sub)' }}>👤 الأخصائي المشرف</label>
            <select
              className="fsel"
              value={filterSpec}
              onChange={e => setFilterSpec(e.target.value)}
              style={{ height: 42, borderRadius: 10 }}
            >
              <option value="all">جميع الأخصائيين</option>
              {specialists.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Reset Button */}
        {isFiltered && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '.83rem', color: 'var(--text-sub)' }}>
              ⚡ يتم تصفية قائمة الطلاب حالياً حسب المحددات المختارة أعلاه ({filteredStudents.length} طالباً).
            </div>
            <button
              type="button"
              className="btn btn-sm btn-d"
              onClick={resetFilters}
              style={{ borderRadius: 8, padding: '4px 12px', fontSize: '.8rem' }}
            >
              ❌ تفريغ كافة الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* 3️⃣ Compact Summary Cards (Shown when viewGroup === 'sections' or 'categories') */}
      {viewGroup === 'sections' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏫</span>
              <span>بطاقات ملخص الصفوف والأقسام (انقر لتصفية الطلاب)</span>
            </h3>
            <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>انقر على أي صف لمشاهدة طلابه فقط بالشاشات السفلية</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {/* Show All Sections Card */}
            <div
              className="card clickable"
              onClick={() => setFilterSec('all')}
              style={{
                padding: 16,
                borderRadius: 14,
                border: filterSec === 'all' ? '2px solid var(--pr,#1a56db)' : '1px solid var(--border-color)',
                background: filterSec === 'all' ? 'var(--pr-l,#eff6ff)' : 'var(--bg-card)',
                boxShadow: filterSec === 'all' ? '0 4px 12px rgba(26,86,219,0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all .2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--g1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                  🌐
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--text-main)' }}>جميع الأقسام والصفوف</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-sub)', marginTop: 2 }}>إجمالي الطلاب: <strong>{students.length}</strong></div>
                </div>
              </div>
            </div>

            {/* Individual Section Summary Cards */}
            {sections.map(sec => {
              const secCount = students.filter(s => s.sectionId === sec.id || s.className === sec.name).length;
              const capacity = Number(sec.capacity) || 10;
              const fillPercentage = Math.min(100, Math.round((secCount / capacity) * 100));
              const supervisor = emps.find(e => e.id === sec.supervisorId);
              const isSelected = filterSec === sec.id;

              return (
                <div
                  key={sec.id}
                  className="card clickable"
                  onClick={() => handleSelectSection(sec.id)}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: isSelected ? `2px solid ${sec.color || '#1a56db'}` : '1px solid var(--border-color)',
                    borderTop: `5px solid ${sec.color || '#1a56db'}`,
                    background: isSelected ? `${sec.color || '#1a56db'}0d` : 'var(--bg-card)',
                    boxShadow: isSelected ? `0 4px 12px ${sec.color || '#1a56db'}25` : '0 2px 6px rgba(0,0,0,0.02)',
                    transition: 'all .2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.4rem' }}>{sec.icon || '🧩'}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{sec.name}</h4>
                        <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', marginTop: 2 }}>
                          👤 المشرف: <strong>{supervisor ? supervisor.name : 'غير محدد'}</strong>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="bdg b-gr" style={{ fontSize: '.7rem', padding: '2px 6px' }}>محدد</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', color: 'var(--text-sub)', marginBottom: 4 }}>
                      <span>نسبة الاستيعاب</span>
                      <span><strong>{secCount} / {capacity}</strong> طالباً ({fillPercentage}%)</span>
                    </div>
                    <div style={{ height: 6, width: '100%', background: 'var(--g2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${fillPercentage}%`, height: '100%', background: sec.color || '#1a56db', transition: 'width .3s' }} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Unassigned Students Summary Card */}
            {unassignedCount > 0 && (
              <div
                className="card clickable"
                onClick={() => setFilterSec('none')}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: filterSec === 'none' ? '2px solid var(--warn,#b45309)' : '1px solid var(--border-color)',
                  borderTop: '5px solid var(--warn,#b45309)',
                  background: filterSec === 'none' ? 'var(--warn-l,#fffbeb)' : 'var(--bg-card)',
                  transition: 'all .2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.4rem' }}>📂</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: 'var(--warn,#b45309)' }}>غير موزعين على صفوف</h4>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginTop: 2 }}>العدد: <strong>{unassignedCount} طالباً</strong></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewGroup === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏷️</span>
              <span>بطاقات ملخص الفئات والتشخيصات (انقر للتصفية)</span>
            </h3>
            <span style={{ fontSize: '.8rem', color: 'var(--text-sub)' }}>انقر على الفئة المحددة لعرض طلابها فقط</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {/* Show All Categories */}
            <div
              className="card clickable"
              onClick={() => setFilterDiag('all')}
              style={{
                padding: 14,
                borderRadius: 12,
                border: filterDiag === 'all' ? '2px solid var(--ok,#059669)' : '1px solid var(--border-color)',
                background: filterDiag === 'all' ? 'var(--ok-l,#ecfdf5)' : 'var(--bg-card)',
                transition: 'all .2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '.9rem' }}>🌐 جميع التشخيصات</span>
                <span className="bdg b-gr" style={{ fontSize: '.75rem' }}>{students.length}</span>
              </div>
            </div>

            {/* Diagnosis Summary Cards */}
            {allCategoryOptions.map(cat => {
              const catCount = students.filter(s => (s.diagnosis || '').trim() === cat).length;
              const isSelected = filterDiag === cat;

              return (
                <div
                  key={cat}
                  className="card clickable"
                  onClick={() => handleSelectCategory(cat)}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: isSelected ? '2px solid var(--ok,#059669)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--ok-l,#ecfdf5)' : 'var(--bg-card)',
                    boxShadow: isSelected ? '0 4px 10px rgba(5,150,105,0.12)' : '0 1px 4px rgba(0,0,0,0.02)',
                    transition: 'all .2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>🎯</span>
                      <span style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--text-main)' }}>{cat}</span>
                    </div>
                    <span className="bdg b-bl" style={{ fontSize: '.75rem', fontWeight: 800 }}>{catCount} طالباً</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4️⃣ Unified Student Grid & List Section */}
      <div style={{ marginTop: 10 }}>
        {/* Results Bar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              👥 قائمة الطلاب المحددة ({filteredStudents.length})
            </h3>
            {filterSec !== 'all' && (
              <span className="bdg b-bl" style={{ fontSize: '.78rem' }}>
                الصف: {sections.find(s => s.id === filterSec)?.name || 'غير مخصص'}
              </span>
            )}
            {filterDiag !== 'all' && (
              <span className="bdg b-gr" style={{ fontSize: '.78rem' }}>
                الفئة: {filterDiag}
              </span>
            )}
          </div>

          <div style={{ fontSize: '.83rem', color: 'var(--text-sub)' }}>
            عرض الصفحة {currentPage} من أصل {totalPages} (إجمالي {filteredStudents.length} طالباً)
          </div>
        </div>

        {/* Student Grid View */}
        {filteredStudents.length === 0 ? (
          <EmptyState
            icon="👦"
            title="لا يوجد طلاب مطابقون للتحديد الحالي"
            sub={canAdd ? 'يمكنك إضافة طالب جديد أو تعديل خيارات التصفية أعلاه' : 'عدل خيارات التصفية'}
          />
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {paginatedStudents.map(s => {
              const spec = emps.find(e => e.id === s.specialistId);
              const sec = sections.find(sec => sec.id === s.sectionId || sec.name === s.className);
              const progs = [
                s.progMorning?.enabled && '☀️ صباحي',
                s.progEvening?.enabled && '🌙 مسائي',
                s.progSessions?.enabled && '🩺 جلسات',
                s.progOnline?.enabled && '🌐 أونلاين'
              ].filter(Boolean);

              return (
                <div
                  key={s.id}
                  className="card clickable"
                  onClick={() => setDetailId(s.id)}
                  style={{
                    padding: 18,
                    margin: 0,
                    borderRadius: 14,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'transform .15s, box-shadow .15s'
                  }}
                >
                  <div>
                    {/* Top Header Card Info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div className="av lg" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                        {s.photo ? <img src={s.photo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (s.name || '?').slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</h4>
                        </div>
                        <div style={{ fontSize: '.83rem', color: 'var(--ok,#059669)', fontWeight: 800, marginTop: 3 }}>
                          🎯 {s.diagnosis || 'لم يحدد تشخيص'}
                        </div>
                        <div style={{ fontSize: '.8rem', color: 'var(--pr,#1a56db)', fontWeight: 700, marginTop: 2 }}>
                          🏫 {sec ? sec.name : s.className || 'غير مخصص لصف'}
                        </div>
                      </div>
                    </div>

                    {/* Details Box */}
                    <div style={{ marginTop: 12, padding: 10, background: 'var(--g0)', borderRadius: 10, fontSize: '.8rem', color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>🎂 العمر: <strong>{calcAge(s.dob)}</strong> ({s.gender || 'ذكر'})</div>
                      <div>👨‍👩‍👦 ولي الأمر: <strong>{s.parentName || '—'}</strong> ({s.parentRelation || 'ولي أمر'})</div>
                      <div>📞 رقم التواصل: <strong dir="ltr">{s.parentPhone || '—'}</strong></div>
                      <div>👤 الأخصائي المسؤول: <strong>{spec ? spec.name : 'غير محدد'}</strong></div>
                    </div>

                    {/* Program badges */}
                    {progs.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {progs.map((p, idx) => (
                          <span key={idx} className="bdg b-cy" style={{ fontSize: '.72rem', padding: '2px 8px' }}>{p}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                    <span className={`bdg ${STATUS_BADGE[s.status] || 'b-gy'}`} style={{ fontSize: '.75rem' }}>
                      {STATUSES[s.status] || s.status}
                    </span>

                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      {!isParent && s.parentPhone && (
                        <a
                          href={`https://wa.me/${s.parentPhone.replace(/[^0-9+]/g, '').replace(/^0/, '966')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-xs btn-bl"
                          title="تواصل عبر الواتساب"
                          style={{ padding: '4px 8px' }}
                        >
                          💬
                        </a>
                      )}
                      {canEdit && (
                        <button type="button" className="btn btn-xs btn-g" onClick={() => openForm(s)} title="تعديل البيانات">
                          ✏️ تعديل
                        </button>
                      )}
                      <button type="button" className="btn btn-xs btn-p" onClick={() => setDetailId(s.id)}>
                        👁️ الملف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Student List / Table View */
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14, border: '1px solid var(--border-color)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--g1)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 800 }}>
                    <th style={{ padding: '12px 16px' }}>الطالب</th>
                    <th style={{ padding: '12px 16px' }}>الصف / القسم</th>
                    <th style={{ padding: '12px 16px' }}>الفئة والتشخيص</th>
                    <th style={{ padding: '12px 16px' }}>ولي الأمر والتواصل</th>
                    <th style={{ padding: '12px 16px' }}>الأخصائي</th>
                    <th style={{ padding: '12px 16px' }}>الحالة</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((s, index) => {
                    const spec = emps.find(e => e.id === s.specialistId);
                    const sec = sections.find(sec => sec.id === s.sectionId || sec.name === s.className);

                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', background: index % 2 === 0 ? 'var(--bg-card)' : 'var(--g0)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="av sm" style={{ width: 36, height: 36, borderRadius: '50%', fontSize: '.9rem' }}>
                              {s.photo ? <img src={s.photo} alt={s.name} /> : (s.name || '?').slice(0, 2)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{s.name}</div>
                              <div style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>العمر: {calcAge(s.dob)}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--pr)' }}>
                          {sec ? `${sec.icon || '🧩'} ${sec.name}` : s.className || '— غير مخصص —'}
                        </td>

                        <td style={{ padding: '12px 16px', color: 'var(--ok,#059669)', fontWeight: 700 }}>
                          🎯 {s.diagnosis || 'غير محدد'}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <div>{s.parentName || '—'} ({s.parentRelation || 'ولي أمر'})</div>
                          <div style={{ fontSize: '.78rem', color: 'var(--text-sub)' }} dir="ltr">{s.parentPhone || '—'}</div>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {spec ? spec.name : '—'}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span className={`bdg ${STATUS_BADGE[s.status] || 'b-gy'}`} style={{ fontSize: '.75rem' }}>
                            {STATUSES[s.status] || s.status}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button type="button" className="btn btn-xs btn-p" onClick={() => setDetailId(s.id)} title="عرض الملف">
                              👁️ الملف
                            </button>
                            {canEdit && (
                              <button type="button" className="btn btn-xs btn-g" onClick={() => openForm(s)} title="تعديل">
                                ✏️
                              </button>
                            )}
                            {!isParent && s.parentPhone && (
                              <a href={`https://wa.me/${s.parentPhone.replace(/[^0-9+]/g, '').replace(/^0/, '966')}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-bl" title="واتساب">
                                💬
                              </a>
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
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-g"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ padding: '6px 14px', borderRadius: 8, fontSize: '.85rem' }}
            >
              ◀️ السابق
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                type="button"
                className={`btn ${currentPage === pageNum ? 'btn-p' : 'btn-g'}`}
                onClick={() => setCurrentPage(pageNum)}
                style={{ width: 34, height: 34, padding: 0, borderRadius: 8, fontWeight: 800, fontSize: '.88rem' }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              className="btn btn-g"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: '6px 14px', borderRadius: 8, fontSize: '.85rem' }}
            >
              التالي ▶️
            </button>
          </div>
        )}
      </div>

      {/* 5️⃣ Student Add/Edit Modal (Tabbed Layout) */}
      {showForm && (
        <div className="md-bg" onClick={() => setShowForm(false)}>
          <div className="md" style={{ maxWidth: 760, width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="md-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>{editId ? '✏️ تعديل بيانات الطالب' : '➕ إضافة طالب جديد للمركز'}</h3>
              <button type="button" className="ic-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--g0)', padding: '6px 10px', gap: 6 }}>
              <button
                type="button"
                className={`btn ${formTab === 'basic' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setFormTab('basic')}
                style={{ fontSize: '.83rem', padding: '6px 14px', borderRadius: 8 }}
              >
                👤 البيانات الشخصية والصف
              </button>
              <button
                type="button"
                className={`btn ${formTab === 'medical' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setFormTab('medical')}
                style={{ fontSize: '.83rem', padding: '6px 14px', borderRadius: 8 }}
              >
                🩺 التشخيص والملف الطبي
              </button>
              <button
                type="button"
                className={`btn ${formTab === 'family' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setFormTab('family')}
                style={{ fontSize: '.83rem', padding: '6px 14px', borderRadius: 8 }}
              >
                👨‍👩‍👦 بيانات ولي الأمر
              </button>
              <button
                type="button"
                className={`btn ${formTab === 'programs' ? 'btn-p' : 'btn-g'}`}
                onClick={() => setFormTab('programs')}
                style={{ fontSize: '.83rem', padding: '6px 14px', borderRadius: 8 }}
              >
                ☀️ البرامج والمرفقات
              </button>
            </div>

            <div className="md-b" style={{ maxHeight: '65vh', overflowY: 'auto', padding: 20 }}>
              {/* TAB 1: BASIC DATA & CLASS ASSIGNMENT */}
              {formTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="av xl" style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--g2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                      {form.photo ? <img src={form.photo} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.8rem' }}>👦</span>}
                    </div>
                    <div>
                      <label className="btn btn-sm btn-g" style={{ cursor: 'pointer', padding: '6px 14px' }}>
                        📷 تحميل صورة الطالب
                        <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                      </label>
                      {form.photo && (
                        <button type="button" className="btn btn-xs btn-d" onClick={() => setForm(f => ({ ...f, photo: '' }))} style={{ marginRight: 8 }}>
                          إزالة الصورة
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="fl">
                    <label style={{ fontWeight: 800 }}>اسم الطالب الثلاثي / الرباعي *</label>
                    <input className="fi" value={form.name} onChange={fld('name')} placeholder="مثال: أحمد عبد الله الغامدي" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="fl">
                      <label style={{ fontWeight: 800 }}>تاريخ الميلاد *</label>
                      <input type="date" className="fi" value={form.dob} onChange={fld('dob')} />
                      {form.dob && <span style={{ fontSize: '.78rem', color: 'var(--pr)', marginTop: 2 }}>العمر المحسوب: {calcAge(form.dob)}</span>}
                    </div>

                    <div className="fl">
                      <label style={{ fontWeight: 800 }}>الجنس</label>
                      <select className="fi" value={form.gender} onChange={fld('gender')}>
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                      </select>
                    </div>
                  </div>

                  {/* Automatic Class & Section Assignment */}
                  <div style={{ padding: 14, background: 'var(--pr-l,#eff6ff)', borderRadius: 12, border: '1px solid var(--pr,#1a56db)' }}>
                    <label style={{ fontWeight: 800, color: 'var(--pr,#1a56db)', display: 'block', marginBottom: 6 }}>
                      🏫 تخصيص الطالب لصف / قسم دراسي آلياً
                    </label>
                    <select className="fi" value={form.sectionId} onChange={fld('sectionId')} style={{ fontWeight: 800 }}>
                      <option value="">-- اختر الصف / القسم المناسب --</option>
                      {sections.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.icon || '🧩'} {s.name} (الاستيعاب المتاح: {s.capacity || 10})
                        </option>
                      ))}
                    </select>
                    <p style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginTop: 6, margin: 0 }}>
                      💡 فور تحديد الصف وحفظ البيانات، سيظهر الطالب بشكل آلي ومنظم داخل هذا الصف في التقارير والبطاقات التلخيصية.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="fl">
                      <label style={{ fontWeight: 800 }}>حالة الطالب بالمركز</label>
                      <select className="fi" value={form.status} onChange={fld('status')}>
                        {Object.entries(STATUSES).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div className="fl">
                      <label style={{ fontWeight: 800 }}>الأخصائي المسؤول المشرف</label>
                      <select className="fi" value={form.specialistId} onChange={fld('specialistId')}>
                        <option value="">-- غير محدد --</option>
                        {specialists.map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDICAL & CATEGORY DIAGNOSIS */}
              {formTab === 'medical' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="fl">
                    <label style={{ fontWeight: 800, color: 'var(--ok,#059669)' }}>🎯 الفئة والتتشخيص الرئيسي *</label>
                    <select className="fi" value={form.diagnosis} onChange={fld('diagnosis')} style={{ fontWeight: 800 }}>
                      <option value="">-- اختر الفئة / التشخيص --</option>
                      {allCategoryOptions.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="fl">
                    <label>تشخيص ثانوي / إضافي (إن وجد)</label>
                    <input className="fi" value={form.diagnosis2} onChange={fld('diagnosis2')} placeholder="مثال: صعوبات بلع، تأخر حركي..." />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="fl">
                      <label>المستشفى المتابع</label>
                      <input className="fi" value={form.hospital} onChange={fld('hospital')} placeholder="اسم المستشفى أو المركز الطبي" />
                    </div>
                    <div className="fl">
                      <label>الطبيب المعالج</label>
                      <input className="fi" value={form.doctor} onChange={fld('doctor')} placeholder="اسم الطبيب" />
                    </div>
                  </div>

                  <div className="fl">
                    <label>الأدوية والعلاجات الحالية</label>
                    <textarea className="fi" rows={2} value={form.medications} onChange={fld('medications')} placeholder="اكتب أسماء الأدوية ومواعيد الجرعات..." />
                  </div>

                  <div className="fl">
                    <label>ملاحظات وطوارئ طبية محددة</label>
                    <textarea className="fi" rows={2} value={form.medNotes} onChange={fld('medNotes')} placeholder="حساسية، صرع، احتياطات خاصة..." />
                  </div>
                </div>
              )}

              {/* TAB 3: FAMILY & GUARDIAN */}
              {formTab === 'family' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                    <div className="fl">
                      <label style={{ fontWeight: 800 }}>اسم ولي الأمر *</label>
                      <input className="fi" value={form.parentName} onChange={fld('parentName')} placeholder="اسم ولي الأمر الكرت" />
                    </div>
                    <div className="fl">
                      <label style={{ fontWeight: 800 }}>صلة القرابة</label>
                      <select className="fi" value={form.parentRelation} onChange={fld('parentRelation')}>
                        <option value="الأب">الأب</option>
                        <option value="الأم">الأم</option>
                        <option value="الوصي الشرعي">الوصي الشرعي</option>
                        <option value="الأخ">الأخ</option>
                        <option value="الأخت">الأخت</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="fl">
                      <label style={{ fontWeight: 800 }}>رقم جوال ولي الأمر (رئيسي) *</label>
                      <input className="fi" dir="ltr" value={form.parentPhone} onChange={fld('parentPhone')} placeholder="05xxxxxxxx" />
                    </div>
                    <div className="fl">
                      <label>رقم جوال إضافي / طوارئ</label>
                      <input className="fi" dir="ltr" value={form.parentPhone2} onChange={fld('parentPhone2')} placeholder="05xxxxxxxx" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="fl">
                      <label>البريد الإلكتروني لولي الأمر</label>
                      <input type="email" className="fi" value={form.parentEmail} onChange={fld('parentEmail')} placeholder="parent@email.com" />
                    </div>
                    <div className="fl">
                      <label>العنوان والسكن</label>
                      <input className="fi" value={form.address} onChange={fld('address')} placeholder="المدينة، الحي..." />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PROGRAMS & ATTACHMENTS */}
              {formTab === 'programs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h4 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800 }}>☀️ تفعيل أنواع الدوام والخدمات المسندة:</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'var(--g0)', borderRadius: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.progMorning?.enabled || false} onChange={() => toggleProg('progMorning')} />
                      <span>☀️ دوام صباحي تأحيلي</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'var(--g0)', borderRadius: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.progEvening?.enabled || false} onChange={() => toggleProg('progEvening')} />
                      <span>🌙 دوام مسائي</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'var(--g0)', borderRadius: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.progSessions?.enabled || false} onChange={() => toggleProg('progSessions')} />
                      <span>🩺 جلسات علاجية فردية</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'var(--g0)', borderRadius: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.progOnline?.enabled || false} onChange={() => toggleProg('progOnline')} />
                      <span>🌐 خدمات أونلاين عن بعد</span>
                    </label>
                  </div>

                  <hr style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

                  <div>
                    <label style={{ fontWeight: 800, display: 'block', marginBottom: 6 }}>📎 المرفقات والمستندات الرسمية</label>
                    <input type="file" multiple onChange={addAttachments} />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {(form.attachments || []).map(a => (
                        <div key={a.id} style={{ padding: '6px 12px', background: 'var(--g1)', borderRadius: 8, fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>📄 {a.name}</span>
                          <button type="button" className="ic-btn" onClick={() => removeAttachment(a.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="md-f" style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'var(--g0)', borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn btn-g" onClick={() => setShowForm(false)}>إلغاء</button>
              <button type="button" className="btn btn-p" onClick={save} style={{ padding: '8px 24px', fontWeight: 800 }}>
                💾 حفظ بيانات الطالب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Add/Edit Modal */}
      {showSecModal && (
        <div className="md-bg" onClick={() => setShowSecModal(false)}>
          <div className="md" style={{ maxWidth: 520, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="md-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>{secEditId ? '✏️ تعديل بيانات الصف / القسم' : '🏫 إضافة قسم / صف جديد'}</h3>
              <button type="button" className="ic-btn" onClick={() => setShowSecModal(false)}>✕</button>
            </div>

            <div className="md-b" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="fl">
                <label style={{ fontWeight: 800 }}>اسم الصف / القسم *</label>
                <input className="fi" value={secForm.name} onChange={e => setSecForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: قسم اضطراب طيف التوحد (صف الياقوت)" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fl">
                  <label>رمز الأيقونة</label>
                  <input className="fi" value={secForm.icon} onChange={e => setSecForm(f => ({ ...f, icon: e.target.value }))} placeholder="🧩، 🌟، 🌱..." />
                </div>
                <div className="fl">
                  <label>لون القسم</label>
                  <input type="color" className="fi" value={secForm.color} onChange={e => setSecForm(f => ({ ...f, color: e.target.value }))} style={{ height: 40, padding: 2 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontWeight: 800 }}>الطاقة الاستيعابية للطلاب</label>
                  <input type="number" className="fi" value={secForm.capacity} onChange={e => setSecForm(f => ({ ...f, capacity: e.target.value }))} min={1} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 800 }}>المشرف الأخصائي</label>
                  <select className="fi" value={secForm.supervisorId} onChange={e => setSecForm(f => ({ ...f, supervisorId: e.target.value }))}>
                    <option value="">-- غير محدد --</option>
                    {specialists.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fl">
                <label>وصف وتفاصيل القسم</label>
                <textarea className="fi" rows={2} value={secForm.description} onChange={e => setSecForm(f => ({ ...f, description: e.target.value }))} placeholder="البرامج والأهداف المخصصة بهذا الصف..." />
              </div>
            </div>

            <div className="md-f" style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'var(--g0)', borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn btn-g" onClick={() => setShowSecModal(false)}>إلغاء</button>
              <button type="button" className="btn btn-p" onClick={saveSec} style={{ padding: '8px 20px', fontWeight: 800 }}>
                💾 حفظ القسم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Session Modal */}
      {showQuickSession && (
        <div className="md-bg" onClick={() => setShowQuickSession(false)}>
          <div className="md" style={{ maxWidth: 540, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="md-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>🩺 تسجيل جلسة تأهيلية سريعة</h3>
              <button type="button" className="ic-btn" onClick={() => setShowQuickSession(false)}>✕</button>
            </div>
            <div className="md-b" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="fl">
                <label style={{ fontWeight: 800 }}>اختر الطالب *</label>
                <select className="fi" value={qsForm.stuId} onChange={fldQs('stuId')}>
                  <option value="">-- اختر الطالب --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.diagnosis || 'بدون تشخيص'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fl">
                  <label>نوع الجلسة</label>
                  <select className="fi" value={qsForm.type} onChange={fldQs('type')}>
                    {['تخاطب ونطق', 'تعديل سلوك', 'علاج فيزيائي', 'علاج وظيفي', 'تكامل حسي', 'تعليمي وتربوي', 'مهارات اجتماعية'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label>الأخصائي المفلّذ</label>
                  <select className="fi" value={qsForm.empId} onChange={fldQs('empId')}>
                    <option value="">-- اختر الأخصائي --</option>
                    {specialists.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="fl">
                  <label>التاريخ *</label>
                  <input type="date" className="fi" value={qsForm.date} onChange={fldQs('date')} />
                </div>
                <div className="fl">
                  <label>الوقت</label>
                  <input type="time" className="fi" value={qsForm.time} onChange={fldQs('time')} />
                </div>
                <div className="fl">
                  <label>المدة (دقيقة)</label>
                  <input type="number" className="fi" value={qsForm.duration} onChange={fldQs('duration')} />
                </div>
              </div>

              <div className="fl">
                <label>ملاحظات وتوصيات الجلسة</label>
                <textarea className="fi" rows={3} value={qsForm.notes} onChange={fldQs('notes')} placeholder="مدى التجاوب، الأهداف المحققة..." />
              </div>

              <div className="fl">
                <label>مرفق أو تقرير للجلسة</label>
                <input type="file" onChange={qsAttach} />
                {qsForm.attachName && <span style={{ fontSize: '.8rem', color: 'var(--ok)' }}>📄 {qsForm.attachName}</span>}
              </div>
            </div>

            <div className="md-f" style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'var(--g0)', borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn btn-g" onClick={() => setShowQuickSession(false)}>إلغاء</button>
              <button type="button" className="btn btn-p" onClick={saveQuickSession} style={{ padding: '8px 20px', fontWeight: 800 }}>
                💾 حفظ الجلسة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      {showConsult && (
        <div className="md-bg" onClick={() => setShowConsult(false)}>
          <div className="md" style={{ maxWidth: 540, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="md-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>💬 تسجيل استشارة جديدة</h3>
              <button type="button" className="ic-btn" onClick={() => setShowConsult(false)}>✕</button>
            </div>
            <div className="md-b" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="fl">
                <label style={{ fontWeight: 800 }}>اسم المستفيد / المستشير *</label>
                <input className="fi" value={consultForm.beneficiaryName} onChange={fldCo('beneficiaryName')} placeholder="اسم الحالة أو صاحب الاستشارة" />
              </div>

              <div className="fl">
                <label>اسم ولي الأمر (إذا كان الطفل مستفيداً)</label>
                <input className="fi" value={consultForm.parentName} onChange={fldCo('parentName')} placeholder="اسم ولي الأمر" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="fl">
                  <label>التاريخ *</label>
                  <input type="date" className="fi" value={consultForm.date} onChange={fldCo('date')} />
                </div>
                <div className="fl">
                  <label>الوقت</label>
                  <input type="time" className="fi" value={consultForm.time} onChange={fldCo('time')} />
                </div>
                <div className="fl">
                  <label>المدة (دقيقة)</label>
                  <input type="number" className="fi" value={consultForm.duration} onChange={fldCo('duration')} />
                </div>
              </div>

              <div className="fl">
                <label>ملاحظات ونتائج الاستشارة</label>
                <textarea className="fi" rows={3} value={consultForm.notes} onChange={fldCo('notes')} placeholder="تفاصيل الاستشارة والتوصيات..." />
              </div>

              <div className="fl">
                <label>مرفق الاستشارة</label>
                <input type="file" onChange={coAttach} />
                {consultForm.attachName && <span style={{ fontSize: '.8rem', color: 'var(--ok)' }}>📄 {consultForm.attachName}</span>}
              </div>
            </div>

            <div className="md-f" style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'var(--g0)', borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn btn-g" onClick={() => setShowConsult(false)}>إلغاء</button>
              <button type="button" className="btn btn-p" onClick={saveConsult} style={{ padding: '8px 20px', fontWeight: 800 }}>
                💾 حفظ الاستشارة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
