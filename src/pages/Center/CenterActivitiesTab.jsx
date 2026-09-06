import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { todayStr, uid } from '../../utils/dateHelpers';
import { getAcademicYears } from '../../utils/academicYears';
import EmptyState from '../../components/ui/EmptyState';
import {
  Activity,
  Compass,
  Calendar,
  Search,
  Users,
  MapPin,
  Trophy,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Plus,
  Check,
  X,
  Bus,
  FileText,
  UserCheck,
  Smile,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const ACTIVITY_CATEGORIES = [
  { id: 'trip', label: '🚌 رحلات ميدانية واستكشافية', color: 'b-bl' },
  { id: 'sports', label: '🏊‍♂️ أنشطة رياضية وسباحة وتأهيل بدني', color: 'b-gr' },
  { id: 'art', label: '🎨 فنون تشكيلية وأشغال يدوية', color: 'b-pr' },
  { id: 'music', label: '🎵 علاج بالموسيقى وإيقاع صوتي', color: 'b-yl' },
  { id: 'lifeskills', label: '🍳 تدبير منزلي ومهارات استقلالية', color: 'b-or' },
  { id: 'horse', label: '🐴 ركوب الخيل والفروسية التأهيلية', color: 'b-gr' },
  { id: 'sensory', label: '🧩 ورش حسية وإدراكية وتفاعلية', color: 'b-bl' },
  { id: 'competition', label: '🏆 مسابقات وتحديات ترفيهية', color: 'b-yl' },
  { id: 'other', label: '📌 أنشطة تأهيلية أخرى', color: 'b-g' }
];

const DEFAULT_SAMPLE_ACTIVITIES = [
  {
    id: 'act_sample_1',
    name: 'رحلة حديقة الحيوان والتعرف على البيئة الطبيعية',
    category: 'trip',
    academicYearId: '',
    academicYear: '2025 / 2026',
    date: '2025-10-15',
    time: '08:30 ص - 11:30 ص',
    location: 'حديقة الحيوان الوطنية بالرياض',
    locationType: 'external',
    busRequired: true,
    busId: '',
    busNumber: 'باص المركز رقم 1',
    supervisorEmpIds: [],
    supervisorNames: 'أ. سارة الأحمد، أ. فهد المطيري',
    participantStudentIds: [],
    participantCountEst: 18,
    targetSkills: 'تطوير المهارات الاجتماعية الاستكشافية، التواصل البصري، والتعرف على أصوات وحركات الحيوانات.',
    parentApprovalNeeded: true,
    status: 'completed',
    outcomeRating: 'ممتاز (95%)',
    notes: 'تمت الرحلة بأعلى درجات السلامة والتفاعل من الطلاب مع توثيق مصور رائع.'
  },
  {
    id: 'act_sample_2',
    name: 'ورشة إعداد الوجبات الخفيفة والتدبير المنزلي',
    category: 'lifeskills',
    academicYearId: '',
    academicYear: '2025 / 2026',
    date: '2025-11-20',
    time: '09:30 ص - 11:00 ص',
    location: 'مطبخ التأهيل المهني بالمركز',
    locationType: 'internal',
    busRequired: false,
    busId: '',
    busNumber: '',
    supervisorEmpIds: [],
    supervisorNames: 'أ. نورة الشمري (أخصائية علاج وظيفي)',
    participantStudentIds: [],
    participantCountEst: 12,
    targetSkills: 'التآزر الحركي البصري، استخدام أدوات المطبخ الآمنة، مهارات النظافة الذاتية، ومشاركة الأقران.',
    parentApprovalNeeded: false,
    status: 'completed',
    outcomeRating: 'ممتاز (92%)',
    notes: 'أظهر الطلاب تقدماً كبيراً في تقطيع الخضار اللينة وفرد العجين باستقلالية.'
  },
  {
    id: 'act_sample_3',
    name: 'برنامج العلاج بركوب الخيل (الهيبوثيرابي)',
    category: 'horse',
    academicYearId: '',
    academicYear: '2025 / 2026',
    date: '2026-03-12',
    time: '09:00 ص - 12:00 م',
    location: 'مربط الفروسية للتأهيل الحركي',
    locationType: 'external',
    busRequired: true,
    busId: '',
    busNumber: 'باص النقل المخصص رقم 2',
    supervisorEmpIds: [],
    supervisorNames: 'د. طارق المنصور، أ. هدى خالد',
    participantStudentIds: [],
    participantCountEst: 15,
    targetSkills: 'تحسين التوازن العضلي الجذعي، خفض التوتر الحركي، وتنمية الثقة بالنفس للمستفيدين.',
    parentApprovalNeeded: true,
    status: 'upcoming',
    outcomeRating: 'قيد التنفيذ',
    notes: 'تم أخذ موافقات أولياء الأمور وتجهيز معدات السلامة والخوذات للطلاب.'
  }
];

const EMPTY_ACTIVITY_FORM = {
  name: '',
  category: 'trip',
  academicYearId: '',
  academicYear: '',
  date: todayStr(),
  time: '09:00 ص - 11:30 ص',
  location: 'مقر المركز',
  locationType: 'internal',
  busRequired: false,
  busId: '',
  busNumber: '',
  supervisorEmpIds: [],
  supervisorNames: '',
  participantStudentIds: [],
  participantCountEst: '',
  targetSkills: '',
  parentApprovalNeeded: true,
  status: 'upcoming',
  outcomeRating: '',
  notes: ''
};

export default function CenterActivitiesTab() {
  const { toast, currentUser, center } = useApp();
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [buses, setBuses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // Filter States
  const [selectedYear, setSelectedYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_ACTIVITY_FORM);
  const [viewActivity, setViewActivity] = useState(null);

  const canEdit = ['manager', 'vice', 'reception', 'supervisor', 'specialist', 'teacher'].includes(currentUser?.role);

  function reload() {
    let list = lsGet('centerActivities');
    if (!Array.isArray(list) || list.length === 0) {
      list = DEFAULT_SAMPLE_ACTIVITIES;
      lsAdd('centerActivities', list[0]);
      lsAdd('centerActivities', list[1]);
      lsAdd('centerActivities', list[2]);
    }
    setActivities(list);
    setStudents(lsGet('students') || []);
    setEmps(lsGet('employees') || []);
    setBuses(lsGet('buses') || []);

    const yearsList = getAcademicYears();
    setAcademicYears(yearsList);

    const currentYearObj = yearsList.find(y => y.isCurrent);
    if (currentYearObj && !selectedYear) {
      setSelectedYear(currentYearObj.name);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  // Compute available years
  const availableYears = useMemo(() => {
    const fromConfig = academicYears.map(y => y.name);
    const fromActs = activities.map(a => a.academicYear || (a.date && a.date.slice(0, 4))).filter(Boolean);
    return Array.from(new Set([...fromConfig, ...fromActs])).filter(Boolean);
  }, [academicYears, activities]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const actYear = act.academicYear || (act.date && act.date.slice(0, 4)) || '';
      const matchYear = !selectedYear || actYear === selectedYear || act.academicYearId === selectedYear;
      const matchCat = !selectedCategory || act.category === selectedCategory;
      const matchStatus = !selectedStatus || act.status === selectedStatus;
      const matchSearch = !searchQuery.trim() ||
        (act.name && act.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (act.location && act.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (act.supervisorNames && act.supervisorNames.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (act.targetSkills && act.targetSkills.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchYear && matchCat && matchStatus && matchSearch;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [activities, selectedYear, selectedCategory, selectedStatus, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = filteredActivities.length;
    const completed = filteredActivities.filter(a => a.status === 'completed').length;
    const upcoming = filteredActivities.filter(a => a.status === 'upcoming' || a.status === 'active').length;
    const fieldTrips = filteredActivities.filter(a => a.category === 'trip' || a.locationType === 'external').length;
    const totalParticipants = filteredActivities.reduce((sum, a) => {
      const studentCount = a.participantStudentIds?.length || 0;
      const estCount = Number(a.participantCountEst) || 0;
      return sum + Math.max(studentCount, estCount);
    }, 0);

    return { total, completed, upcoming, fieldTrips, totalParticipants };
  }, [filteredActivities]);

  // Open Add Modal
  const handleOpenNew = () => {
    const activeYr = academicYears.find(y => y.isCurrent)?.name || (availableYears[0] || '2025 / 2026');
    const activeYrId = academicYears.find(y => y.isCurrent)?.id || '';

    setForm({
      ...EMPTY_ACTIVITY_FORM,
      academicYear: activeYr,
      academicYearId: activeYrId,
      date: todayStr(),
    });
    setEditId(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (act) => {
    setForm({
      name: act.name || '',
      category: act.category || 'trip',
      academicYearId: act.academicYearId || '',
      academicYear: act.academicYear || '',
      date: act.date || todayStr(),
      time: act.time || '09:00 ص - 11:30 ص',
      location: act.location || '',
      locationType: act.locationType || 'internal',
      busRequired: act.busRequired || false,
      busId: act.busId || '',
      busNumber: act.busNumber || '',
      supervisorEmpIds: act.supervisorEmpIds || [],
      supervisorNames: act.supervisorNames || '',
      participantStudentIds: act.participantStudentIds || [],
      participantCountEst: act.participantCountEst || '',
      targetSkills: act.targetSkills || '',
      parentApprovalNeeded: act.parentApprovalNeeded !== false,
      status: act.status || 'upcoming',
      outcomeRating: act.outcomeRating || '',
      notes: act.notes || ''
    });
    setEditId(act.id);
    setShowModal(true);
  };

  // Save Activity
  const handleSave = () => {
    if (!form.name.trim()) {
      toast('⚠️ يرجى إدخال اسم النشاط أو الرحلة', 'er');
      return;
    }
    if (!form.date) {
      toast('⚠️ يرجى تحديد تاريخ النشاط', 'er');
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      academicYear: form.academicYear || (form.date ? form.date.slice(0, 4) : ''),
      participantCountEst: Number(form.participantCountEst) || form.participantStudentIds.length || 0,
    };

    if (editId) {
      lsUpd('centerActivities', editId, payload);
      toast('✅ تم تحديث بيانات النشاط بنجاح', 'ok');
    } else {
      const newAct = { ...payload, id: `act_${Date.now()}_${uid()}` };
      lsAdd('centerActivities', newAct);
      toast('🎯 تم إضافة النشاط التأهيلي وتوثيقه', 'ok');
    }

    setShowModal(false);
    reload();
  };

  // Delete Activity
  const handleDelete = (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف نشاط "${name}" نهائياً؟`)) return;
    lsDel('centerActivities', id);
    toast('🗑️ تم حذف النشاط بنجاح', 'ok');
    if (viewActivity?.id === id) setViewActivity(null);
    reload();
  };

  // Print Activity Report
  const handlePrintActivity = (act) => {
    const catLabel = ACTIVITY_CATEGORIES.find(c => c.id === act.category)?.label || 'نشاط تأهيلي';
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تقرير نشاط تأهيلي - ${act.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
          body { font-family: 'Tajawal', sans-serif; margin: 0; padding: 25px; color: #1e293b; line-height: 1.6; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
          .sub { font-size: 13px; color: #64748b; margin: 0; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 13px; }
          .sec-h { font-size: 14px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 14px 0 8px 0; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #e2e8f0; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 13px; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${center?.name || 'مركز رعاية وتأهيل ذوي الإعاقة'}</h1>
            <p class="sub">إدارة البرامج والأنشطة التأهيلية · ملف المتابعة الميدانية والدمج</p>
          </div>
          <div style="text-align: left;">
            <div style="font-weight: 800; font-size: 14px;">تقرير توثيق نشاط ميداني / تأهيلي</div>
            <div style="font-size: 12px; color: #64748b;">العام الدراسي: ${act.academicYear || '—'}</div>
          </div>
        </div>

        <div class="box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h2 style="margin:0; font-size: 17px; color: #0f172a;">🎯 ${act.name}</h2>
            <span class="badge">${catLabel}</span>
          </div>
          <div class="grid">
            <div><strong>📅 التاريخ:</strong> ${act.date || '—'}</div>
            <div><strong>⏰ التوقيت:</strong> ${act.time || '—'}</div>
            <div><strong>📍 المكان:</strong> ${act.location || 'مقر المركز'} (${act.locationType === 'internal' ? 'داخلي' : 'خارجي'})</div>
            <div><strong>🚌 وسيلة النقل:</strong> ${act.busRequired ? (act.busNumber || 'باص المركز المعتمد') : 'لا يتطلب نقل خارجي'}</div>
            <div><strong>👥 الكادر المشرف:</strong> ${act.supervisorNames || 'فريق الأنشطة والتأهيل'}</div>
            <div><strong>👨‍🎓 عدد الطلاب:</strong> ${act.participantCountEst || '—'} طالب وطالبة</div>
            <div><strong>📋 موافقة أولياء الأمور:</strong> ${act.parentApprovalNeeded ? 'تم استيفاء إقرارات الموافقة ✅' : 'نشاط داخلي معتمد'}</div>
            <div><strong>📊 تقييم المخرجات:</strong> ${act.outcomeRating || 'ممتاز (مكتمل وموثق)'}</div>
          </div>
        </div>

        <div class="sec-h">🎯 المهارات والأهداف التأهيلية والسلوكية المستهدفة:</div>
        <div style="font-size: 13px; background: #fff; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
          ${act.targetSkills || 'تطوير المهارات الحركية والاجتماعية والاستقلالية للمستفيدين وفق أهداف الخطط الفردية.'}
        </div>

        <div class="sec-h">📝 ملاحظات المشرفين وتقييم التفاعل:</div>
        <div style="font-size: 13px; background: #fff; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
          ${act.notes || 'أظهر الطلاب حماساً كبيراً وتفاعلاً إيجابياً في كافة محطات النشاط دون أي عوائق سلوكية أو تنظيمية.'}
        </div>

        <div class="signatures">
          <div>
            <strong>المعلم / الأخصائي المشرف</strong>
            <div style="margin-top: 35px;">___________________</div>
          </div>
          <div>
            <strong>مشرف الأنشطة والرحلات</strong>
            <div style="margin-top: 35px;">___________________</div>
          </div>
          <div>
            <strong>المدير التنفيذي / الفني</strong>
            <div style="margin-top: 35px;">___________________</div>
          </div>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      
      {/* 1. Smart Year & Search Filter Bar */}
      <div className="wg" style={{ margin: 0 }}>
        <div className="wg-b" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity style={{ width: 20, height: 20, color: 'var(--pr)' }} />
                <span>سجل الأنشطة الميدانية والتأهيلية ({filteredActivities.length})</span>
              </div>
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>
                توثيق الرحلات الاستكشافية، التدبير المنزلي، الأنشطة الرياضية، والفروسية التأهيلية
              </div>
            </div>

            {canEdit && (
              <button
                type="button"
                className="btn btn-p"
                onClick={handleOpenNew}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              >
                <Plus style={{ width: 16, height: 16 }} />
                <span>إضافة نشاط تأهيلي جديد</span>
              </button>
            )}
          </div>

          {/* Quick Year Pill Selectors (تصفية العام الذكية) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 4 }}>
            <span style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar style={{ width: 15, height: 15, color: 'var(--pr)' }} />
              <span>تصفية العام:</span>
            </span>

            <button
              type="button"
              className={`btn btn-xs ${!selectedYear ? 'btn-p' : 'btn-g'}`}
              onClick={() => setSelectedYear('')}
              style={{ fontWeight: 700, borderRadius: 20, padding: '4px 12px' }}
            >
              جميع السنوات ({activities.length})
            </button>

            {availableYears.map(yr => {
              const isSelected = selectedYear === yr;
              const countInYr = activities.filter(a => (a.academicYear || (a.date && a.date.slice(0, 4))) === yr).length;
              const isCurrent = academicYears.find(y => y.name === yr)?.isCurrent;

              return (
                <button
                  key={yr}
                  type="button"
                  className={`btn btn-xs ${isSelected ? 'btn-p' : 'btn-g'}`}
                  onClick={() => setSelectedYear(yr)}
                  style={{
                    fontWeight: 700,
                    borderRadius: 20,
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    border: isCurrent && !isSelected ? '1px dashed var(--pr)' : undefined
                  }}
                >
                  <span>{yr}</span>
                  {isCurrent && <span style={{ fontSize: '.68rem' }}>⭐</span>}
                  <span style={{ fontSize: '.68rem', opacity: 0.85 }}>({countInYr})</span>
                </button>
              );
            })}
          </div>

          {/* Filters Row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
              <Search style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-sub)' }} />
              <input
                type="text"
                placeholder="ابحث باسم النشاط، المكان، المشرف، أو المهارة المستهدفة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingRight: 34, width: '100%', fontSize: '.84rem', background: 'var(--bg-input)', color: 'var(--text-main)' }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ fontSize: '.84rem', background: 'var(--bg-input)', color: 'var(--text-main)', minWidth: 160 }}
            >
              <option value="">— جميع أنواع الأنشطة —</option>
              {ACTIVITY_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              style={{ fontSize: '.84rem', background: 'var(--bg-input)', color: 'var(--text-main)', minWidth: 140 }}
            >
              <option value="">— جميع الحالات —</option>
              <option value="upcoming">مجدول / قادم ⏳</option>
              <option value="active">جاري التنفيذ اليوم 🟢</option>
              <option value="completed">منفذ وموثق ✅</option>
              <option value="cancelled">ملغي ❌</option>
            </select>

            {(searchQuery || selectedCategory || selectedStatus || selectedYear) && (
              <button
                type="button"
                className="btn btn-sm btn-g"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedStatus('');
                  setSelectedYear('');
                }}
                style={{ fontSize: '.78rem' }}
              >
                إلغاء التصفية ✖
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--sh)' }}>
          <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>🎯 إجمالي الأنشطة</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>{stats.total}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>في النطاق المحدد</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--sh)' }}>
          <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>✅ أنشطة منفذة بنجاح</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ok, #10b981)', marginTop: 2 }}>{stats.completed}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>مكتملة وموثقة</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--sh)' }}>
          <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>🚌 رحلات ميدانية وخارجية</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pr)', marginTop: 2 }}>{stats.fieldTrips}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>دمج مجتمعي واستكشاف</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--sh)' }}>
          <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>👨‍🎓 مشاركات الطلاب</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warn, #f59e0b)', marginTop: 2 }}>{stats.totalParticipants}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>إجمالي الطلاب المشاركين</div>
        </div>
      </div>

      {/* 3. Activity Cards Grid */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="لا توجد أنشطة مطابقة لمعايير البحث"
          sub={canEdit ? 'يمكنك جدولة نشاط تأهيلي أو رحلة استكشافية جديدة وربطها بالكوادر والباصات' : ''}
          action={canEdit ? <button type="button" className="btn btn-p" onClick={handleOpenNew}>➕ إضافة نشاط تأهيلي</button> : null}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filteredActivities.map(act => {
            const catObj = ACTIVITY_CATEGORIES.find(c => c.id === act.category);
            const statusBdg = act.status === 'completed' ? 'b-gr' : act.status === 'active' ? 'b-bl' : act.status === 'cancelled' ? 'b-r' : 'b-yl';
            const statusText = act.status === 'completed' ? 'منفذ وموثق ✅' : act.status === 'active' ? 'جاري اليوم 🟢' : act.status === 'cancelled' ? 'ملغي ❌' : 'مجدول ⏳';

            return (
              <div
                key={act.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 14,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: 'var(--sh)',
                  transition: 'all 0.18s ease'
                }}
              >
                {/* Card Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                      <span className={`bdg ${catObj?.color || 'b-bl'}`} style={{ fontSize: '.68rem' }}>
                        {catObj?.label || 'نشاط تأهيلي'}
                      </span>
                      {act.academicYear && (
                        <span className="bdg b-g" style={{ fontSize: '.66rem' }}>
                          📅 {act.academicYear}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '.98rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {act.name}
                    </h3>
                  </div>

                  <span className={`bdg ${statusBdg}`} style={{ fontSize: '.68rem', flexShrink: 0 }}>
                    {statusText}
                  </span>
                </div>

                {/* Card Body Info */}
                <div style={{
                  background: 'var(--g0)',
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: '.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)' }}>
                    <Calendar style={{ width: 14, height: 14, color: 'var(--pr)', flexShrink: 0 }} />
                    <span><strong>التاريخ:</strong> {act.date} · {act.time || 'صباحاً'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)' }}>
                    <MapPin style={{ width: 14, height: 14, color: 'var(--pr)', flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>المكان:</strong> {act.location || 'مقر المركز'} ({act.locationType === 'external' ? 'خارجي 📍' : 'داخلي 🏫'})
                    </span>
                  </div>

                  {act.supervisorNames && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)' }}>
                      <UserCheck style={{ width: 14, height: 14, color: 'var(--pr)', flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <strong>المشرف:</strong> {act.supervisorNames}
                      </span>
                    </div>
                  )}

                  {act.busRequired && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--pr)' }}>
                      <Bus style={{ width: 14, height: 14, flexShrink: 0 }} />
                      <span>{act.busNumber || 'باص المركز مخصص للرحلة'}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
                    <span style={{ color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users style={{ width: 13, height: 13 }} />
                      <span>الطلاب المشاركون:</span>
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      {act.participantCountEst || act.participantStudentIds?.length || 0} طالب
                    </span>
                  </div>
                </div>

                {/* Target Skills Snippet */}
                {act.targetSkills && (
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    🎯 <strong>المهارات:</strong> {act.targetSkills}
                  </div>
                )}

                {/* Card Actions Footer */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      className="btn btn-xs btn-p"
                      onClick={() => setViewActivity(act)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Eye style={{ width: 12, height: 12 }} />
                      <span>تفاصيل</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-g"
                      onClick={() => handlePrintActivity(act)}
                      title="طباعة بطاقة توثيق النشاط"
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Printer style={{ width: 12, height: 12 }} />
                      <span>طباعة</span>
                    </button>
                  </div>

                  {canEdit && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        className="btn btn-xs btn-g"
                        onClick={() => handleOpenEdit(act)}
                        title="تعديل النشاط"
                      >
                        <Edit2 style={{ width: 12, height: 12 }} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-d"
                        onClick={() => handleDelete(act.id, act.name)}
                        title="حذف النشاط"
                      >
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW ACTIVITY DETAILS */}
      {/* ========================================================================= */}
      {viewActivity && (
        <div className="mbg">
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            {/* Header */}
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎯</span>
                  <span>بطاقة ومخرجات النشاط التأهيلي</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '.78rem', opacity: 0.9 }}>
                  المهارات والأهداف التأهيلية المكتسبة ومؤشرات تقييم الأداء
                </p>
              </div>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => setViewActivity(null)}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '.8rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
                title="إغلاق النافذة"
              >
                <X style={{ width: 15, height: 15 }} />
                <span>إغلاق</span>
              </button>
            </div>

            {/* Content */}
            <div className="modal-body-scroll" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  <span className="bdg b-bl">{ACTIVITY_CATEGORIES.find(c => c.id === viewActivity.category)?.label || 'نشاط تأهيلي'}</span>
                  {viewActivity.academicYear && <span className="bdg b-g">📅 {viewActivity.academicYear}</span>}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {viewActivity.name}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, background: 'var(--g0)', padding: 12, borderRadius: 10, fontSize: '.82rem', border: '1px solid var(--border-color)' }}>
                <div><strong>📅 التاريخ:</strong> {viewActivity.date}</div>
                <div><strong>⏰ التوقيت:</strong> {viewActivity.time || '—'}</div>
                <div><strong>📍 المكان:</strong> {viewActivity.location || 'مقر المركز'}</div>
                <div><strong>👥 الكادر المشرف:</strong> {viewActivity.supervisorNames || 'فريق المركز'}</div>
                <div><strong>🚌 النقل بالباص:</strong> {viewActivity.busRequired ? (viewActivity.busNumber || 'مجدول بنجاح') : 'غير مطلوب'}</div>
                <div><strong>📊 حالة النشاط:</strong> {viewActivity.status === 'completed' ? 'منفذ وموثق ✅' : 'مجدول ⏳'}</div>
              </div>

              {viewActivity.targetSkills && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.86rem', color: 'var(--text-main)', marginBottom: 4 }}>🎯 المهارات والأهداف التأهيلية المكتسبة:</div>
                  <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 8, fontSize: '.82rem', lineHeight: 1.6, border: '1px solid var(--border-color)' }}>
                    {viewActivity.targetSkills}
                  </div>
                </div>
              )}

              {viewActivity.notes && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.86rem', color: 'var(--text-main)', marginBottom: 4 }}>📝 تقييم وملاحظات الأداء:</div>
                  <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 8, fontSize: '.82rem', lineHeight: 1.6, border: '1px solid var(--border-color)' }}>
                    {viewActivity.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="fa" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-p"
                onClick={() => handlePrintActivity(viewActivity)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              >
                <Printer style={{ width: 15, height: 15 }} />
                <span>طباعة التقرير التأهيلي للنشاط</span>
              </button>
              <button type="button" className="btn btn-g" onClick={() => setViewActivity(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT ACTIVITY */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="mbg">
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            {/* Modal Header */}
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎯</span>
                  <span>{editId ? 'تعديل بيانات النشاط التأهيلي' : 'إضافة نشاط تأهيلي / رحلة جديدة'}</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '.78rem', opacity: 0.9 }}>
                  توثيق الأنشطة اليومية والتأهيلية لربط المهارات المكتسبة ببرامج الطلاب
                </p>
              </div>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '.8rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
                title="إغلاق النافذة"
              >
                <X style={{ width: 15, height: 15 }} />
                <span>إغلاق</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body-scroll" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              <div className="fl">
                <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>
                  اسم النشاط / الرحلة الاستكشافية <span style={{ color: 'var(--err)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="مثال: رحلة حديقة الحيوان، ورشة التدبير المنزلي، السباحة العلاجية..."
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>نوع وتصنيف النشاط</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    {ACTIVITY_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>العام الدراسي / الدورة</label>
                  <select
                    value={form.academicYear}
                    onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>تاريخ النشاط <span style={{ color: 'var(--err)' }}>*</span></label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>توقيت النشاط</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    placeholder="مثال: 09:00 ص - 11:30 ص"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>طبيعة المكان</label>
                  <select
                    value={form.locationType}
                    onChange={e => setForm(f => ({ ...f, locationType: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    <option value="internal">داخلي (داخل المركز) 🏫</option>
                    <option value="external">خارجي (رحلة خارجية) 📍</option>
                  </select>
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>المكان والوجهة بالتفصيل</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="مثال: حديقة الحيوان، مطبخ التأهيل، مسبح المركز..."
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>المشرفون والأخصائيون المسؤولون</label>
                  <input
                    type="text"
                    value={form.supervisorNames}
                    onChange={e => setForm(f => ({ ...f, supervisorNames: e.target.value }))}
                    placeholder="مثال: أ. سارة الأحمد، أ. فهد المطيري..."
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>حالة النشاط</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    <option value="upcoming">مجدول / قادم ⏳</option>
                    <option value="active">جاري اليوم 🟢</option>
                    <option value="completed">منفذ وموثق ✅</option>
                    <option value="cancelled">ملغي ❌</option>
                  </select>
                </div>
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>المهارات والأهداف التأهيلية والسلوكية المستهدفة</label>
                <textarea
                  rows="2"
                  value={form.targetSkills}
                  onChange={e => setForm(f => ({ ...f, targetSkills: e.target.value }))}
                  placeholder="ما هي المهارات الحركية، الحسية، الاجتماعية، أو الاستقلالية المراد تنميتها؟"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>تقييم المخرجات والملاحظات</label>
                <textarea
                  rows="2"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="ملاحظات تفاعل الطلاب، مستوى الاستقلالية، وتوصيات للأنشطة القادمة..."
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>عدد الطلاب المشاركين</label>
                  <input
                    type="number"
                    value={form.participantCountEst}
                    onChange={e => setForm(f => ({ ...f, participantCountEst: e.target.value }))}
                    placeholder="مثال: 15"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>حاجة النقل بالباص</label>
                  <select
                    value={form.busRequired ? 'yes' : 'no'}
                    onChange={e => {
                      const req = e.target.value === 'yes';
                      setForm(f => ({
                        ...f,
                        busRequired: req,
                        busNumber: req ? (f.busNumber || (buses[0] ? `باص رقم ${buses[0].plateNumber || buses[0].busNumber || 1}` : 'باص المركز')) : ''
                      }));
                    }}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    <option value="no">لا يتطلب باص (نشاط داخلي) ❌</option>
                    <option value="yes">يتطلب باص ونقل مدرسي 🚌</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <input
                  type="checkbox"
                  id="parentApprovalCheck"
                  checked={form.parentApprovalNeeded}
                  onChange={e => setForm(f => ({ ...f, parentApprovalNeeded: e.target.checked }))}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--pr)' }}
                />
                <label htmlFor="parentApprovalCheck" style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                  يتطلب الحصول على موافقة وإقرار خطي من ولي الأمر قبل التنفيذ
                </label>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="fa">
              <button type="button" className="btn btn-g" onClick={() => setShowModal(false)}>
                إلغاء
              </button>
              <button type="button" className="btn btn-p" onClick={handleSave} style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                💾 حفظ وتوثيق النشاط
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
