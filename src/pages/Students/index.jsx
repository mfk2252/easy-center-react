import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { DIAGNOSES, SPECIALIST_ROLES } from '../../utils/constants';
import { calcAge, todayStr, uid, nowTimeStr } from '../../utils/dateHelpers';
import EmptyState from '../../components/ui/EmptyState';
import StudentDetail from './StudentDetail';
import { parentCanViewStudent, centerWhatsAppUrl } from '../../utils/parentAccess';

const SESSION_TYPES = ['تخاطب ونطق', 'تعديل سلوك', 'علاج فيزيائي', 'علاج وظيفي', 'تكامل حسي', 'تعليمي وتربوي', 'مهارات اجتماعية'];
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

export default function StudentsPage() {
  const { toast, currentUser, activeView, center } = useApp();
  const isParent = currentUser?.role === 'parent';

  // Data State
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [emps, setEmps] = useState([]);

  // View & Filter State
  const [viewMode, setViewMode] = useState('sections'); // 'sections' | 'grid' | 'list'
  const [q, setQ] = useState('');
  const [filterSec, setFilterSec] = useState('all'); // 'all' | 'none' | sectionId
  const [filterDiag, setFilterDiag] = useState('all'); // 'all' | diagnosis name
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterShift, setFilterShift] = useState('all'); // 'all' | 'morning' | 'evening' | 'sessions' | 'online'
  const [filterSpec, setFilterSpec] = useState('all');

  // Modals & Forms State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_STU);
  const [formTab, setFormTab] = useState('basic'); // 'basic' | 'medical' | 'family' | 'programs'

  const [detailId, setDetailId] = useState(null);

  const [showQuickSession, setShowQuickSession] = useState(false);
  const [qsForm, setQsForm] = useState(EMPTY_QS);

  const [showConsult, setShowConsult] = useState(false);
  const [consultForm, setConsultForm] = useState(EMPTY_CONSULT);

  // Section Modal State
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
  }, [isParent, currentUser?.studentId, currentUser?.username]);

  function reload() {
    setStudents(lsGet('students'));
    setSections(lsGet('sections') || DEFAULT_SECTIONS);
  }

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
  const filtered = useMemo(() => {
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

  const isFiltered = filterSec !== 'all' || filterDiag !== 'all' || filterStatus !== 'all' || filterShift !== 'all' || filterSpec !== 'all' || q.trim() !== '';

  function resetFilters() {
    setQ('');
    setFilterSec('all');
    setFilterDiag('all');
    setFilterStatus('all');
    setFilterShift('all');
    setFilterSpec('all');
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
      setForm({ ...EMPTY_STU, sectionId: defaultSecId, joinDate: todayStr(), attachments: [] });
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
      toast('✅ تم إضافة الطالب الجديد', 'ok');
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
      {/* Page Header */}
      <div className="ph" style={{ background: 'linear-gradient(135deg, var(--g0) 0%, var(--g1) 100%)', borderRadius: 16, padding: '20px 24px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div className="ph-t">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👦</span>
            <span>{isParent ? 'بيانات الطفل والبرامج' : 'إدارة الطلاب والأقسام الدراسية'}</span>
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '.88rem', marginTop: 4 }}>
            {isParent ? 'متابعة الملف الشخصي للطفل والأنشطة والجلسات المسجلة' : 'نظام تنظيمي متكامل لإدارة بيانات الطلاب، الأقسام، الصفوف، وتوزيع الخدمات التأهيلية'}
          </p>
        </div>
        {isParent && centerWa && (
          <a href={centerWa} target="_blank" rel="noreferrer" className="btn btn-bl" style={{ borderRadius: 10, padding: '8px 16px', fontWeight: 700 }}>
            💬 التواصل مع إدارة المركز
          </a>
        )}
        <div className="ph-a" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {canAdd && (
            <button type="button" className="btn btn-p" onClick={() => openForm()} style={{ padding: '8px 18px', fontWeight: 800, borderRadius: 10 }}>
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

      {/* Smart Control & Filter Panel */}
      <div className="wg" style={{ margin: 0, padding: '18px 20px', borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>🔎</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>تصفية وبحث شامل في قاعدة الطلاب</h3>
            <span className="bdg b-bl" style={{ fontSize: '.78rem', padding: '2px 8px' }}>
              {filtered.length} من أصل {students.length}
            </span>
          </div>

          {/* View Mode Switcher */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--g1)', padding: 4, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className={`btn ${viewMode === 'sections' ? 'btn-p' : 'btn-g'}`}
              onClick={() => setViewMode('sections')}
              style={{ fontSize: '.8rem', padding: '6px 14px', borderRadius: 8, fontWeight: 700 }}
            >
              🗂️ حسب الأقسام والصفوف
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'grid' ? 'btn-p' : 'btn-g'}`}
              onClick={() => setViewMode('grid')}
              style={{ fontSize: '.8rem', padding: '6px 14px', borderRadius: 8, fontWeight: 700 }}
            >
              🎴 شبكة بطاقات الطلاب
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'list' ? 'btn-p' : 'btn-g'}`}
              onClick={() => setViewMode('list')}
              style={{ fontSize: '.8rem', padding: '6px 14px', borderRadius: 8, fontWeight: 700 }}
            >
              📋 جدول بيانات منظّم
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Search Input */}
          <div className="fl" style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-sub)' }}>البحث السريع (بالاسم / الهوية / ولي الأمر / الجوال)</label>
            <div style={{ position: 'relative' }}>
              <input
                className="srch"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="🔍 اكتب اسم الطالب، الهوية، اسم أو جوال ولي الأمر..."
                style={{ width: '100%', paddingRight: 12, height: 42, borderRadius: 10 }}
              />
            </div>
          </div>

          {/* Filter 1: Class / Section Name */}
          <div className="fl">
            <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--pr)' }}>🏫 تصفية حسب الصف / القسم</label>
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

          {/* Filter 2: Disability / Category Name */}
          <div className="fl">
            <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ok,#059669)' }}>🩺 تصفية حسب الفئة / التشخيص</label>
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

          {/* Filter 3: Status */}
          <div className="fl">
            <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-sub)' }}>📌 حالة الطالب بالمركز</label>
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

          {/* Filter 4: Shift / Program */}
          <div className="fl">
            <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-sub)' }}>☀️ الدوام والبرامج</label>
            <select
              className="fsel"
              value={filterShift}
              onChange={e => setFilterShift(e.target.value)}
              style={{ height: 42, borderRadius: 10 }}
            >
              <option value="all">جميع أنواع الدوام</option>
              <option value="morning">☀️ دوام صباحي</option>
              <option value="evening">🌙 دوام مسائي</option>
              <option value="sessions">🩺 جلسات علاجية</option>
              <option value="online">🌐 تأهيل أونلاين</option>
            </select>
          </div>

          {/* Filter 5: Specialist */}
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
              ⚠️ تظهر الآن نتائج متطابقة مع شروط التصفية المختارة.
            </div>
            <button
              type="button"
              className="btn btn-sm btn-d"
              onClick={resetFilters}
              style={{ borderRadius: 8, padding: '4px 12px', fontSize: '.8rem' }}
            >
              ❌ إعادة ضبط وتفريغ خيارات التصفية
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: SECTIONS CARDS VIEW */}
      {viewMode === 'sections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections
            .filter(sec => filterSec === 'all' || filterSec === sec.id)
            .map(sec => {
              const secStudents = filtered.filter(s => s.sectionId === sec.id || s.className === sec.name);
              const supervisor = emps.find(e => e.id === sec.supervisorId);
              const capacity = Number(sec.capacity) || 10;
              const fillPercentage = Math.min(100, Math.round((secStudents.length / capacity) * 100));

              return (
                <div
                  key={sec.id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: 14,
                    border: '1px solid var(--border-color)',
                    borderTop: `6px solid ${sec.color || '#1a56db'}`,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    background: 'var(--bg-card)'
                  }}
                >
                  {/* Section Bar Header */}
                  <div
                    style={{
                      padding: '16px 20px',
                      background: 'var(--g0)',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: `${sec.color || '#1a56db'}18`,
                          color: sec.color || '#1a56db',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.6rem'
                        }}
                      >
                        {sec.icon || '🧩'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{sec.name}</h3>
                          <span className="bdg b-gy" style={{ fontSize: '.78rem', padding: '2px 8px' }}>{sec.type || 'قسم متخصص'}</span>
                        </div>
                        <div style={{ fontSize: '.83rem', color: 'var(--text-sub)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span>👤 المشرف: <strong>{supervisor ? supervisor.name : 'غير محدد'}</strong></span>
                          <span>📊 الاستيعاب: <strong>{secStudents.length} / {capacity} طالباً ({fillPercentage}%)</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Capacity Progress bar */}
                      <div style={{ width: 120, height: 8, borderRadius: 4, background: 'var(--g2)', overflow: 'hidden' }}>
                        <div style={{ width: `${fillPercentage}%`, height: '100%', background: sec.color || '#1a56db', transition: 'width .3s' }} />
                      </div>

                      {canAdd && (
                        <button type="button" className="btn btn-xs btn-p" onClick={() => openForm(null, sec.id)} style={{ padding: '6px 12px', fontWeight: 700 }}>
                          ➕ طالب بهذا الصف
                        </button>
                      )}
                      {canEdit && (
                        <button type="button" className="btn btn-xs btn-g" onClick={() => openSecForm(sec)} title="تعديل بيانات القسم">
                          ✏️ تعديل
                        </button>
                      )}
                      {canEdit && (
                        <button type="button" className="btn btn-xs btn-d" onClick={() => deleteSec(sec.id)} title="حذف القسم">
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section Students Content */}
                  <div style={{ padding: 18 }}>
                    {secStudents.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-sub)', fontSize: '.88rem', background: 'var(--g0)', borderRadius: 10, border: '1px dashed var(--border-color)' }}>
                        لا يوجد طلاب مطبقين لمحددات التصفية داخل هذا الصف حالياً.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {secStudents.map(s => {
                          const spec = emps.find(e => e.id === s.specialistId);
                          return (
                            <div
                              key={s.id}
                              className="card clickable"
                              onClick={() => setDetailId(s.id)}
                              style={{
                                padding: 14,
                                margin: 0,
                                borderRadius: 12,
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                                transition: 'transform .15s, box-shadow .15s'
                              }}
                            >
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div className="av lg" style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                                  {s.photo ? <img src={s.photo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (s.name || '?').slice(0, 2)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                                  <div style={{ fontSize: '.8rem', color: 'var(--ok,#059669)', fontWeight: 700, marginTop: 2 }}>🎯 {s.diagnosis || 'لم يحدد تشخيص'}</div>
                                  <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginTop: 2 }}> العمر: {calcAge(s.dob)} · 👨‍👩‍👦 {s.parentName || '—'}</div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                                <span className={`bdg ${STATUS_BADGE[s.status] || 'b-gy'}`} style={{ fontSize: '.72rem', padding: '2px 8px' }}>
                                  {STATUSES[s.status] || s.status}
                                </span>
                                <span style={{ fontSize: '.75rem', color: 'var(--text-sub)' }}>
                                  👤 {spec ? spec.name : 'بدون أخصائي'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Unassigned Students Block */}
          {(filterSec === 'all' || filterSec === 'none') && (() => {
            const unassigned = filtered.filter(s => !s.sectionId && (!s.className || !sections.some(sec => sec.name === s.className)));
            if (unassigned.length === 0) return null;

            return (
              <div className="card" style={{ padding: 18, borderRadius: 14, border: '1px solid var(--border-color)', borderTop: '6px solid var(--warn,#b45309)', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--warn,#b45309)', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📂</span>
                    <span>طلاب غير توزيعهم على صفوف أو أقسام محددة ({unassigned.length})</span>
                  </h3>
                  <span style={{ fontSize: '.82rem', color: 'var(--text-sub)' }}>يمكنك الضغط على زر التعيين لتخصيص الطالب لصف مناسب</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {unassigned.map(s => (
                    <div key={s.id} className="card clickable" onClick={() => setDetailId(s.id)} style={{ padding: 12, margin: 0, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--g0)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '.92rem' }}>{s.name}</div>
                          <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginTop: 2 }}>🎯 {s.diagnosis || 'غير محدد'} · 📞 {s.parentPhone || '—'}</div>
                        </div>
                        {canEdit && (
                          <button type="button" className="btn btn-xs btn-p" onClick={(e) => { e.stopPropagation(); openForm(s); }} style={{ padding: '4px 10px', fontSize: '.78rem' }}>
                            📌 تعيين صف
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW MODE 2: VISUAL STUDENT CARDS GRID */}
      {viewMode === 'grid' && (
        filtered.length === 0 ? (
          <EmptyState icon="👦" title="لا يوجد طلاب مطبقين لشروط البحث والفلترة" sub={canAdd ? 'اضغط ➕ طالب جديد لإضافة طالب' : ''} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(s => {
              const spec = emps.find(e => e.id === s.specialistId);
              const sec = sections.find(sec => sec.id === s.sectionId || sec.name === s.className);
              const progs = [s.progMorning?.enabled && '☀️ صباحي', s.progEvening?.enabled && '🌙 مسائي', s.progSessions?.enabled && '🩺 جلسات', s.progOnline?.enabled && '🌐 أونلاين'].filter(Boolean);

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
                    justify: 'space-between',
                    gap: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
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
                        <button type="button" className="btn btn-xs btn-g" onClick={() => openForm(s)} title="تعديل">
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
        )
      )}

      {/* VIEW MODE 3: HIGH-DENSITY DATA TABLE */}
      {viewMode === 'list' && (
        filtered.length === 0 ? (
          <EmptyState icon="👦" title="لا يوجد طلاب مطبقين لشروط التصفية" sub={canAdd ? 'اضغط ➕ طالب جديد' : ''} />
        ) : (
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
                  {filtered.map((s, index) => {
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
        )
      )}

      {/* STUDENT ADD/EDIT MODAL (TABBED FORM) */}
      {showForm && (
        <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, background: 'var(--pr,#1a56db)' }}>
              <h2 style={{ color: '#fff', margin: 0 }}>{editId ? '✏️ تعديل بيانات الطالب' : '➕ تسجيل طالب جديد'}</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '.85rem', marginTop: 4 }}>بيانات شاملة ومبوبة للطالب، الفئة الطبية، الأسرة والبرامج</p>
            </div>

            {/* Modal Tabs Bar */}
            <div style={{ display: 'flex', background: 'var(--g1)', borderBottom: '1px solid var(--border-color)', padding: '4px 10px', gap: 6 }}>
              {[
                ['basic', '👤 1. البيانات الأساسية والصف'],
                ['medical', '🩺 2. الفئة والتشخيص الطبي'],
                ['family', '👨‍👩‍👦 3. بيانات ولي الأمر'],
                ['programs', '🗂️ 4. البرامج والمرفقات'],
              ].map(([tKey, label]) => (
                <button
                  key={tKey}
                  type="button"
                  className={`btn ${formTab === tKey ? 'btn-p' : 'btn-g'}`}
                  onClick={() => setFormTab(tKey)}
                  style={{ flex: 1, padding: '8px 10px', fontSize: '.82rem', fontWeight: 800, borderRadius: 8 }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              {/* TAB 1: BASIC DATA & SECTION */}
              {formTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, background: 'var(--g0)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <div
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: '50%',
                        border: '3px dashed var(--pr)',
                        background: 'var(--g1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                      onClick={() => document.getElementById('stu-photo-inp').click()}
                    >
                      {form.photo ? <img src={form.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="صورة الطالب" /> : '👦'}
                    </div>
                    <div>
                      <button className="btn btn-g btn-sm" type="button" onClick={() => document.getElementById('stu-photo-inp').click()} style={{ fontWeight: 700 }}>
                        📷 رفع صورة الطالب
                      </button>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', marginTop: 6 }}>يُنصح برفع صورة رسمية ملونة للطفل</div>
                      <input id="stu-photo-inp" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
                    </div>
                  </div>

                  <div className="fg c2">
                    <div className="fl">
                      <label>اسم الطالب الكامل <span className="req">*</span></label>
                      <input value={form.name} onChange={fld('name')} placeholder="اكتب اسم الطالب رباعياً..." />
                    </div>

                    <div className="fl">
                      <label style={{ fontWeight: 800, color: 'var(--pr)' }}>الصف / القسم التابع له <span className="req">*</span></label>
                      <select
                        value={form.sectionId || ''}
                        onChange={e => {
                          const secId = e.target.value;
                          const sec = sections.find(s => s.id === secId);
                          setForm(f => ({ ...f, sectionId: secId, className: sec ? sec.name : f.className }));
                        }}
                      >
                        <option value="">-- غير مخصص (بدون قسم حالياً) --</option>
                        {sections.map(sec => (
                          <option key={sec.id} value={sec.id}>
                            {sec.icon || '🧩'} {sec.name} ({sec.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="fg c3">
                    <div className="fl">
                      <label>تاريخ الميلاد <span className="req">*</span></label>
                      <input type="date" value={form.dob} onChange={fld('dob')} />
                    </div>
                    <div className="fl">
                      <label>العمر المحسوب تلقائياً</label>
                      <input value={calcAge(form.dob) || '—'} readOnly style={{ background: 'var(--g0)', fontWeight: 800 }} />
                    </div>
                    <div className="fl">
                      <label>الجنس</label>
                      <select value={form.gender} onChange={fld('gender')}>
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                      </select>
                    </div>
                  </div>

                  <div className="fg c3">
                    <div className="fl">
                      <label>الجنسية</label>
                      <input value={form.nationality} onChange={fld('nationality')} placeholder="سعودي" />
                    </div>
                    <div className="fl">
                      <label>تاريخ التسجيل بالمركز</label>
                      <input type="date" value={form.joinDate} onChange={fld('joinDate')} />
                    </div>
                    <div className="fl">
                      <label>حالة الطالب في المركز</label>
                      <select value={form.status} onChange={fld('status')}>
                        {Object.entries(STATUSES).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="fg c2">
                    <div className="fl">
                      <label>الأخصائي المشرف المسؤول</label>
                      <select value={form.specialistId} onChange={fld('specialistId')}>
                        <option value="">-- اختر أخصائي الحالة --</option>
                        {specialists.map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                        ))}
                      </select>
                    </div>
                    <div className="fl">
                      <label>اسم المجموعة / الفصل التفصيلي</label>
                      <input value={form.className} onChange={fld('className')} placeholder="مثال: فصل زهور الأمل..." />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDICAL & DIAGNOSIS */}
              {formTab === 'medical' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="fg c2">
                    <div className="fl">
                      <label style={{ fontWeight: 800, color: 'var(--ok,#059669)' }}>التشخيص الطبي / الفئة الرئيسية <span className="req">*</span></label>
                      <select value={form.diagnosis} onChange={fld('diagnosis')}>
                        <option value="">-- اختر الفئة / التشخيص --</option>
                        {DIAGNOSES.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="fl">
                      <label>تشخيص إضافي / تفاصيل الحالة</label>
                      <input value={form.diagnosis2} onChange={fld('diagnosis2')} placeholder="تأخر لغوي، اضطراب حسـي، فرط حركة..." />
                    </div>
                  </div>

                  <div className="fg c2">
                    <div className="fl">
                      <label>المستشفى / المجمع المتابع للحالة</label>
                      <input value={form.hospital} onChange={fld('hospital')} placeholder="اسم المستشفى المتابع..." />
                    </div>
                    <div className="fl">
                      <label>الطبيب المتابع المعالج</label>
                      <input value={form.doctor} onChange={fld('doctor')} placeholder="د. اسم الطبيب..." />
                    </div>
                  </div>

                  <div className="fl full">
                    <label>الأدوية والعلاجات الحالية</label>
                    <textarea value={form.medications} onChange={fld('medications')} rows={2} placeholder="اكتب اسم العلاج والمواعيد إن وجدت..." />
                  </div>

                  <div className="fl full">
                    <label style={{ color: 'var(--er,#dc2626)', fontWeight: 800 }}>⚠️ المحاذير والملاحظات الطبية الطارئة</label>
                    <textarea value={form.medNotes} onChange={fld('medNotes')} rows={2} placeholder="حساسية معينة، نوبات صرع، أطعمة ممنوعة..." />
                  </div>
                </div>
              )}

              {/* TAB 3: GUARDIAN & FAMILY */}
              {formTab === 'family' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="fg c3">
                    <div className="fl">
                      <label>اسم ولي الأمر الرئيسي <span className="req">*</span></label>
                      <input value={form.parentName} onChange={fld('parentName')} placeholder="اسم ولي الأمر..." />
                    </div>
                    <div className="fl">
                      <label>صلة القرابة <span className="req">*</span></label>
                      <select value={form.parentRelation} onChange={fld('parentRelation')}>
                        <option value="الأب">الأب</option>
                        <option value="الأم">الأم</option>
                        <option value="الأخ">الأخ</option>
                        <option value="الأخت">الأخت</option>
                        <option value="الجد">الجد</option>
                        <option value="الجدة">الجدة</option>
                        <option value="العم">العم</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                    <div className="fl">
                      <label>رقم جوال ولي الأمر (واتساب) <span className="req">*</span></label>
                      <input type="tel" value={form.parentPhone} onChange={fld('parentPhone')} placeholder="05xxxxxxxx" />
                    </div>
                  </div>

                  <div className="fg c3">
                    <div className="fl">
                      <label>رقم جوال إضافي للطوارئ</label>
                      <input type="tel" value={form.parentPhone2} onChange={fld('parentPhone2')} placeholder="05xxxxxxxx" />
                    </div>
                    <div className="fl">
                      <label>البريد الإلكتروني</label>
                      <input type="email" value={form.parentEmail} onChange={fld('parentEmail')} placeholder="example@mail.com" />
                    </div>
                    <div className="fl">
                      <label>مهنة ولي الأمر</label>
                      <input value={form.parentJob} onChange={fld('parentJob')} placeholder="المهنة..." />
                    </div>
                  </div>

                  <div className="fl full">
                    <label>العنوان والحي السكني</label>
                    <input value={form.address} onChange={fld('address')} placeholder="المدينة، الحي، اسم الشارع..." />
                  </div>
                </div>
              )}

              {/* TAB 4: PROGRAMS & ATTACHMENTS */}
              {formTab === 'programs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--text-main)', marginBottom: -4 }}>
                    الخدمات والبرامج التأهيلية المخصصة للطفل:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {/* Morning */}
                    <div style={{ border: `1.5px solid ${form.progMorning?.enabled ? 'var(--warn,#d97706)' : 'var(--border-color)'}`, borderRadius: 10, padding: 12, background: form.progMorning?.enabled ? 'var(--warn-l,#fefce8)' : 'transparent' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 800, color: 'var(--warn,#d97706)' }}>
                        <input type="checkbox" checked={!!form.progMorning?.enabled} onChange={() => toggleProg('progMorning')} />
                        ☀️ الدوام الصباحي المتكامل
                      </label>
                    </div>

                    {/* Evening */}
                    <div style={{ border: `1.5px solid ${form.progEvening?.enabled ? 'var(--pur,#7c3aed)' : 'var(--border-color)'}`, borderRadius: 10, padding: 12, background: form.progEvening?.enabled ? 'var(--pur-l,#f5f3ff)' : 'transparent' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 800, color: 'var(--pur,#7c3aed)' }}>
                        <input type="checkbox" checked={!!form.progEvening?.enabled} onChange={() => toggleProg('progEvening')} />
                        🌙 الدوام المسائي
                      </label>
                    </div>
                  </div>

                  {/* Individual Sessions */}
                  <div style={{ border: `1.5px solid ${form.progSessions?.enabled ? 'var(--ok,#059669)' : 'var(--border-color)'}`, borderRadius: 10, padding: 12, background: form.progSessions?.enabled ? 'var(--ok-l,#ecfdf5)' : 'transparent' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 800, color: 'var(--ok,#059669)' }}>
                      <input type="checkbox" checked={!!form.progSessions?.enabled} onChange={() => toggleProg('progSessions')} />
                      🩺 برنامج الجلسات الفردية المباشرة
                    </label>
                    {form.progSessions?.enabled && (
                      <div className="fg c3" style={{ marginTop: 10 }}>
                        <div className="fl">
                          <label>الأخصائي المعالج</label>
                          <select value={form.progSessions?.emp || ''} onChange={fldProg('progSessions', 'emp')}>
                            <option value="">-- اختر الأخصائي --</option>
                            {specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                        </div>
                        <div className="fl">
                          <label>نوع الجلسة</label>
                          <select value={form.progSessions?.type || ''} onChange={fldProg('progSessions', 'type')}>
                            {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="fl">
                          <label>التكرار</label>
                          <select value={form.progSessions?.freq || 'أسبوعي'} onChange={fldProg('progSessions', 'freq')}>
                            <option>يومي</option>
                            <option>أسبوعي</option>
                            <option>مرتين أسبوعياً</option>
                            <option>ثلاث مرات أسبوعياً</option>
                            <option>شهري</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Online Rehab */}
                  <div style={{ border: `1.5px solid ${form.progOnline?.enabled ? 'var(--cyan,#0891b2)' : 'var(--border-color)'}`, borderRadius: 10, padding: 12, background: form.progOnline?.enabled ? 'var(--cyan-l,#ecfeff)' : 'transparent' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 800, color: 'var(--cyan,#0891b2)' }}>
                      <input type="checkbox" checked={!!form.progOnline?.enabled} onChange={() => toggleProg('progOnline')} />
                      🌐 برنامج التأهيل والمتابعة أونلاين
                    </label>
                    {form.progOnline?.enabled && (
                      <div className="fg c2" style={{ marginTop: 10 }}>
                        <div className="fl">
                          <label>الأخصائي</label>
                          <select value={form.progOnline?.emp || ''} onChange={fldProg('progOnline', 'emp')}>
                            <option value="">-- اختر --</option>
                            {specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                        </div>
                        <div className="fl">
                          <label>رابط الجلسة الفافتراضية (Google Meet / Zoom)</label>
                          <input type="url" value={form.progOnline?.link || ''} onChange={fldProg('progOnline', 'link')} placeholder="https://meet.google.com/..." />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="fl full">
                    <label>ملاحظات سلوكية وتربوية عامة</label>
                    <textarea value={form.notes} onChange={fld('notes')} rows={2} placeholder="أي ملاحظات عامة حول اهتمامات الطفل أو السلوكيات..." />
                  </div>

                  <div className="fl full">
                    <label>📎 المرفقات والمستندات (عقد، تقارير طبية، شهادات)</label>
                    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,image/*" onChange={addAttachments} />
                    {(form.attachments || []).length > 0 && (
                      <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', fontSize: '.84rem' }}>
                        {(form.attachments || []).map(a => (
                          <li key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <a href={a.data} download={a.name} className="btn btn-xs btn-g">📥 {a.name}</a>
                            <button type="button" className="btn btn-xs btn-d" onClick={() => removeAttachment(a.id)}>حذف</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="fa" style={{ padding: '14px 20px', background: 'var(--g0)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-p" onClick={save} style={{ padding: '8px 24px', fontWeight: 800 }}>
                  💾 حفظ بيانات الطالب
                </button>
                <button type="button" className="btn btn-g" onClick={() => setShowForm(false)}>
                  إلغاء
                </button>
              </div>

              {editId && (
                <button
                  type="button"
                  className="btn btn-d btn-sm"
                  onClick={() => deleteStu(editId)}
                  style={{ fontWeight: 700 }}
                >
                  ⛔ حذف الطالب نهائياً
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUICK SESSION MODAL */}
      {showQuickSession && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, background: 'var(--s,#7c3aed)' }}>
              <h2 style={{ color: '#fff', margin: 0 }}>🩺 تسجيل جلسة علاجية سريعة</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '.82rem', marginTop: 4 }}>تُحفظ الجلسة تلقائياً في السجل العلاجي للطفل</p>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label>الطفل المستفيد <span className="req">*</span></label>
                  <select value={qsForm.stuId} onChange={fldQs('stuId')}>
                    <option value="">— اختر الطالب من القائمة —</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.diagnosis || 'بدون تشخيص'})</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label>نوع الجلسة</label>
                  <select value={qsForm.type} onChange={fldQs('type')}>
                    {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label>تاريخ الجلسة <span className="req">*</span></label>
                  <input type="date" value={qsForm.date} onChange={fldQs('date')} />
                </div>
                <div className="fl">
                  <label>وقت الجلسة</label>
                  <input type="time" value={qsForm.time} onChange={fldQs('time')} />
                </div>
                <div className="fl">
                  <label>الأخصائي المعالج</label>
                  <select value={qsForm.empId} onChange={fldQs('empId')}>
                    <option value="">— اختر الأخصائي —</option>
                    {specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label>المدة (بالدقائق)</label>
                  <input type="number" min={15} value={qsForm.duration} onChange={e => setQsForm(f => ({ ...f, duration: Number(e.target.value) }))} />
                </div>
                <div className="fl full">
                  <label>ملخص وملاحظات الجلسة</label>
                  <textarea value={qsForm.notes} onChange={fldQs('notes')} rows={3} placeholder="اكتب الاستجابة والأهداف المنفذة..." />
                </div>
                <div className="fl full">
                  <label>مرفق للجلسة (تقرير، صورة)</label>
                  <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={qsAttach} />
                  {qsForm.attachName && <span style={{ fontSize: '.8rem', color: 'var(--ok)', marginTop: 4 }}>📎 {qsForm.attachName}</span>}
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '14px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" onClick={saveQuickSession} style={{ padding: '8px 20px', fontWeight: 800 }}>
                💾 حفظ الجلسة
              </button>
              <button type="button" className="btn btn-g" onClick={() => setShowQuickSession(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONSULTATION MODAL */}
      {showConsult && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, background: 'var(--cyan,#0891b2)' }}>
              <h2 style={{ color: '#fff', margin: 0 }}>💬 تسجيل استشارة جديدة</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '.82rem', marginTop: 4 }}>تسجيل استشارات الحالات الجديدة أو الزوار</p>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl">
                  <label>اسم المستفيد <span className="req">*</span></label>
                  <input value={consultForm.beneficiaryName} onChange={fldCo('beneficiaryName')} placeholder="اكتب اسم الحالة..." />
                </div>
                <div className="fl">
                  <label>اسم ولي الأمر / المرافق</label>
                  <input value={consultForm.parentName} onChange={fldCo('parentName')} placeholder="اسم ولي الأمر..." />
                </div>
                <div className="fl">
                  <label>تاريخ الاستشارة <span className="req">*</span></label>
                  <input type="date" value={consultForm.date} onChange={fldCo('date')} />
                </div>
                <div className="fl">
                  <label>الساعة</label>
                  <input type="time" value={consultForm.time} onChange={fldCo('time')} />
                </div>
                <div className="fl">
                  <label>الأخصائي الاستشاري</label>
                  <select value={consultForm.empId} onChange={fldCo('empId')}>
                    <option value="">— اختر الأخصائي —</option>
                    {specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label>المدة (دقيقة)</label>
                  <input type="number" min={15} value={consultForm.duration} onChange={e => setConsultForm(f => ({ ...f, duration: Number(e.target.value) }))} />
                </div>
                <div className="fl full">
                  <label>ملخص التوصيات والنتائج</label>
                  <textarea value={consultForm.notes} onChange={fldCo('notes')} rows={3} placeholder="اكتب ملخص الاستشارة والتوصيات..." />
                </div>
                <div className="fl full">
                  <label>مرفق ملف</label>
                  <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={coAttach} />
                  {consultForm.attachName && <span style={{ fontSize: '.8rem', color: 'var(--cyan)', marginTop: 4 }}>📎 {consultForm.attachName}</span>}
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '14px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" onClick={saveConsult} style={{ padding: '8px 20px', fontWeight: 800 }}>
                💾 حفظ الاستشارة
              </button>
              <button type="button" className="btn btn-g" onClick={() => setShowConsult(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION EDIT/ADD MODAL */}
      {showSecModal && (
        <div className="mbg" onClick={e => { if (e.target === e.currentTarget) setShowSecModal(false); }}>
          <div className="mb mb-medium" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, background: 'var(--ok,#059669)' }}>
              <h2 style={{ color: '#fff', margin: 0 }}>{secEditId ? '✏️ تعديل بيانات القسم / الصف' : '➕ إضافة قسم أو صف جديد'}</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '.85rem', marginTop: 4 }}>إدارة الهيكل التنظيمي للأقسام والصفوف الدراسية</p>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label>اسم القسم أو الصف <span className="req">*</span></label>
                  <input value={secForm.name} onChange={e => setSecForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: قسم اضطراب طيف التوحد (صف اللؤلؤ)..." />
                </div>
                <div className="fl">
                  <label>تصنيف وشكل القسم</label>
                  <select value={secForm.type} onChange={e => setSecForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="قسم متخصص">قسم متخصص</option>
                    <option value="صف دراسي">صف دراسي</option>
                    <option value="مجموعة تأهيلية">مجموعة تأهيلية</option>
                    <option value="مرحلة تعليمية">مرحلة تعليمية</option>
                  </select>
                </div>
                <div className="fl">
                  <label>السعة الاستيعابية (عدد الطلاب)</label>
                  <input type="number" min={1} max={100} value={secForm.capacity} onChange={e => setSecForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
                </div>
                <div className="fl full">
                  <label>المشرف / الأخصائي المسؤول</label>
                  <select value={secForm.supervisorId} onChange={e => setSecForm(f => ({ ...f, supervisorId: e.target.value }))}>
                    <option value="">-- اختر مشرف القسم --</option>
                    {emps.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                  </select>
                </div>
                <div className="fl full">
                  <label>الرمز والأيقونة التعبيرية</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    {['🧩', '🌟', '🌱', '🏫', '🎨', '🐬', '💎', '☀️', '🚀', '📚', '🧸', '🏆'].map(ic => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setSecForm(f => ({ ...f, icon: ic }))}
                        style={{
                          width: 40, height: 40, borderRadius: 10, fontSize: '1.3rem', cursor: 'pointer',
                          border: secForm.icon === ic ? '2px solid var(--pr,#1a56db)' : '1px solid var(--border-color)',
                          background: secForm.icon === ic ? 'var(--pr-l,#eff6ff)' : 'transparent'
                        }}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="fl full">
                  <label>اللون التمييزي للقسم</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                    {['#1a56db', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#db2777', '#475569'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSecForm(f => ({ ...f, color: c }))}
                        style={{
                          width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                          border: secForm.color === c ? '3px solid #000' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="fl full">
                  <label>الوصف والأهداف الفئوية للقسم</label>
                  <textarea rows={2} value={secForm.description} onChange={e => setSecForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف موجز للبرنامج التأهيلي أو الفئة المستهدفة..." />
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '14px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" onClick={saveSec} style={{ padding: '8px 20px', fontWeight: 800 }}>
                💾 حفظ بيانات القسم
              </button>
              <button type="button" className="btn btn-g" onClick={() => setShowSecModal(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
