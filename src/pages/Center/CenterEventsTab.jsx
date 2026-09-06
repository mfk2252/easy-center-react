import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsSet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { todayStr, uid } from '../../utils/dateHelpers';
import { getAcademicYears } from '../../utils/academicYears';
import { INTERNATIONAL_DAYS, getInternationalDayDate } from '../../data/internationalDays';
import EmptyState from '../../components/ui/EmptyState';
import {
  PartyPopper,
  Sparkles,
  Calendar,
  Search,
  Users,
  MapPin,
  Award,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Plus,
  Check,
  X,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Handshake,
  UserCheck,
  HelpCircle,
  Clock,
  Globe,
  Tag
} from 'lucide-react';

const EVENT_CATEGORIES = [
  { id: 'national', label: '🇸🇦 مناسبات وطنية ورسمية', color: 'b-gr' },
  { id: 'awareness', label: '♿ أيام ومناسبات عالمية للإعاقة', color: 'b-bl' },
  { id: 'graduation', label: '🎓 حفلات تخرج وتكريم وتفوق', color: 'b-yl' },
  { id: 'community', label: '🤝 ملتقيات وشراكات مجتمعية', color: 'b-or' },
  { id: 'exhibition', label: '🎨 معارض وبازارات إنتاجية', color: 'b-pr' },
  { id: 'entertainment', label: '🌟 مهرجانات وأيام مفتوحة', color: 'b-gr' },
  { id: 'other', label: '📌 فعاليات ومناسبات أخرى', color: 'b-g' },
];

const EMPTY_EVENT_FORM = {
  name: '',
  category: 'national',
  academicYearId: '',
  academicYear: '',
  date: todayStr(),
  time: '09:00 ص - 12:00 م',
  locationType: 'internal',
  location: 'مقر المركز الرئيسي',
  partnerId: '',
  partnerName: '',
  targetAudience: 'all',
  participantStudentIds: [],
  participantCountEst: '',
  supervisorEmpIds: [],
  parentsInvited: true,
  budgetEst: '',
  budgetActual: '',
  status: 'upcoming',
  objectives: '',
  qualityNotes: '',
  images: [],
  notes: ''
};

export default function CenterEventsTab() {
  const { toast, currentUser, center } = useApp();
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [partners, setPartners] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // Filter States
  const [selectedYear, setSelectedYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showIntDaysModal, setShowIntDaysModal] = useState(false);
  const [intDaysCategoryFilter, setIntDaysCategoryFilter] = useState('all');
  const [intDaysMonthFilter, setIntDaysMonthFilter] = useState('all');
  const [intDaysViewMode, setIntDaysViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [intDaysSearch, setIntDaysSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_EVENT_FORM);
  const [viewEvent, setViewEvent] = useState(null);

  const canEdit = ['manager', 'vice', 'reception', 'supervisor'].includes(currentUser?.role);

  function reload() {
    let list = lsGet('centerEvents');
    if (!Array.isArray(list)) list = [];
    // Purge any old sample entries if they existed
    const cleanList = list.filter(e => !e.id?.startsWith('evt_sample_'));
    if (cleanList.length !== list.length) {
      list = cleanList;
      lsSet('centerEvents', cleanList);
    }
    setEvents(list);
    setStudents(lsGet('students') || []);
    setEmps(lsGet('employees') || []);
    setPartners(lsGet('centerPartners') || []);

    const yearsList = getAcademicYears();
    setAcademicYears(yearsList);

    // Default filter to current active year if set
    const currentYearObj = yearsList.find(y => y.isCurrent);
    if (currentYearObj && !selectedYear) {
      setSelectedYear(currentYearObj.name);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  // Compute unique year options from events + configured academic years
  const availableYears = useMemo(() => {
    const fromConfig = academicYears.map(y => y.name);
    const fromEvents = events.map(e => e.academicYear || (e.date && e.date.slice(0, 4))).filter(Boolean);
    return Array.from(new Set([...fromConfig, ...fromEvents])).filter(Boolean);
  }, [academicYears, events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const evtYear = evt.academicYear || (evt.date && evt.date.slice(0, 4)) || '';
      const matchYear = !selectedYear || evtYear === selectedYear || evt.academicYearId === selectedYear;
      const matchCat = !selectedCategory || evt.category === selectedCategory;
      const matchStatus = !selectedStatus || evt.status === selectedStatus;
      const matchSearch = !searchQuery.trim() ||
        (evt.name && evt.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (evt.location && evt.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (evt.partnerName && evt.partnerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (evt.objectives && evt.objectives.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchYear && matchCat && matchStatus && matchSearch;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [events, selectedYear, selectedCategory, selectedStatus, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const completed = filteredEvents.filter(e => e.status === 'completed').length;
    const upcoming = filteredEvents.filter(e => e.status === 'upcoming' || e.status === 'active').length;
    const totalParticipants = filteredEvents.reduce((sum, e) => {
      const studentCount = e.participantStudentIds?.length || 0;
      const estCount = Number(e.participantCountEst) || 0;
      return sum + Math.max(studentCount, estCount);
    }, 0);

    return { total, completed, upcoming, totalParticipants };
  }, [filteredEvents]);

  // Select & Autofill from International Days Dropdown
  const handleSelectInternationalDay = (dayId) => {
    if (!dayId) return;
    const selected = INTERNATIONAL_DAYS.find(d => d.id === dayId);
    if (!selected) return;

    // Determine target year from current form academic year or current system date
    let targetYear = new Date().getFullYear();
    if (form.academicYear) {
      const yrMatch = form.academicYear.match(/\b(20\d\d)\b/);
      if (yrMatch) targetYear = parseInt(yrMatch[1], 10);
    }
    const computedDate = getInternationalDayDate(selected, targetYear);

    setForm(f => ({
      ...f,
      name: selected.name,
      category: selected.category === 'sensory' || selected.category === 'developmental' || selected.category === 'rehab' ? 'awareness' : selected.category === 'national' ? 'national' : 'other',
      date: computedDate,
      time: '09:00 ص - 12:30 م',
      location: selected.suggestedLocation || 'مسرح الاحتفالات والصالة الرئيسية بالمركز',
      locationType: 'internal',
      targetAudience: selected.targetAudience || 'all',
      parentsInvited: true,
      objectives: selected.objectives || '',
      qualityNotes: `تم اعتماد وتوثيق الفعالية تزامناً مع (${selected.name}) لتحقيق معايير الدمج المجتمعي وتنمية مهارات المستفيدين وفق متطلبات الجودة والاعتماد.`,
    }));

    toast(`✨ تم اختيار (${selected.name}) وتعبئة البيانات والأهداف تلقائياً`, 'ok');
  };

  // Adopt directly from the International Days Browser Modal
  const handleAdoptInternationalDay = (dayObj) => {
    const activeYr = academicYears.find(y => y.isCurrent)?.name || (availableYears[0] || '2025 / 2026');
    const activeYrId = academicYears.find(y => y.isCurrent)?.id || '';
    
    let targetYear = new Date().getFullYear();
    if (activeYr) {
      const yrMatch = activeYr.match(/\b(20\d\d)\b/);
      if (yrMatch) targetYear = parseInt(yrMatch[1], 10);
    }
    const computedDate = getInternationalDayDate(dayObj, targetYear);

    setForm({
      ...EMPTY_EVENT_FORM,
      academicYear: activeYr,
      academicYearId: activeYrId,
      name: dayObj.name,
      category: dayObj.category === 'sensory' || dayObj.category === 'developmental' || dayObj.category === 'rehab' ? 'awareness' : dayObj.category === 'national' ? 'national' : 'other',
      date: computedDate,
      time: '09:00 ص - 12:30 م',
      location: dayObj.suggestedLocation || 'مسرح الاحتفالات والصالة الرئيسية بالمركز',
      locationType: 'internal',
      targetAudience: dayObj.targetAudience || 'all',
      parentsInvited: true,
      objectives: dayObj.objectives || '',
      qualityNotes: `تم اعتماد وتوثيق الفعالية تزامناً مع (${dayObj.name}) لتحقيق معايير الدمج المجتمعي وتنمية مهارات المستفيدين وفق متطلبات الجودة والاعتماد.`,
    });

    setEditId(null);
    setShowIntDaysModal(false);
    setShowModal(true);
    toast(`✨ تم تجهيز نموذج الاحتفال بـ (${dayObj.name})`, 'ok');
  };

  // Print International Days Schedule
  const handlePrintInternationalDays = () => {
    const currentYear = new Date().getFullYear();
    const printItems = INTERNATIONAL_DAYS
      .filter(d => intDaysCategoryFilter === 'all' || d.category === intDaysCategoryFilter)
      .filter(d => intDaysMonthFilter === 'all' || d.month === Number(intDaysMonthFilter))
      .filter(d => {
        if (!intDaysSearch.trim()) return true;
        const q = intDaysSearch.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.objectives.toLowerCase().includes(q) ||
          d.categoryLabel.toLowerCase().includes(q)
        );
      });

    const printWindow = window.open('', '_blank', 'width=980,height=820');
    if (!printWindow) {
      window.print();
      return;
    }

    const logoHtml = center?.logo
      ? `<img src="${center.logo}" alt="Logo" style="height: 60px; max-width: 160px; object-fit: contain; margin-bottom: 4px;" />`
      : `<div style="font-size: 28px; font-weight: bold; color: #2563eb;">🏛️</div>`;
    const centerName = center?.name || 'مركز التأهيل والتربية الخاصة';
    const centerPhone = center?.phone || '';
    const centerAddress = center?.address || '';

    const rowsHtml = printItems.map((item, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
        <td style="padding: 9px 8px; border: 1px solid #d1d5db; text-align: center; font-weight: bold; width: 45px;">${idx + 1}</td>
        <td style="padding: 9px 8px; border: 1px solid #d1d5db; text-align: center; font-weight: 800; width: 100px; white-space: nowrap; color: #1e40af;">
          📅 ${item.day} / ${item.month}
        </td>
        <td style="padding: 9px 10px; border: 1px solid #d1d5db; font-weight: 800; color: #111827;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>${item.icon}</span>
            <span>${item.name}</span>
          </div>
        </td>
        <td style="padding: 9px 8px; border: 1px solid #d1d5db; text-align: center; width: 125px; font-size: 11.5px; color: #4b5563;">
          ${item.categoryLabel}
        </td>
        <td style="padding: 9px 10px; border: 1px solid #d1d5db; font-size: 11.5px; color: #374151; line-height: 1.5;">
          ${item.objectives}
        </td>
        <td style="padding: 9px 8px; border: 1px solid #d1d5db; text-align: center; width: 110px; font-size: 11px; color: #6b7280;">
          ${item.suggestedLocation || 'الصالة الرئيسية'}
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>التقويم السنوي للأيام والمناسبات العالمية والتربوية - ${centerName}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm 10mm; }
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0; padding: 14px; color: #111827; background: #fff; }
          .header-box { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #2563eb; padding-bottom: 12px; margin-bottom: 14px; }
          .center-meta { text-align: right; min-width: 220px; }
          .doc-title { text-align: center; flex: 1; padding: 0 15px; }
          .doc-title h1 { margin: 0; font-size: 17px; font-weight: 900; color: #1e3a8a; }
          .doc-title p { margin: 4px 0 0; font-size: 11.5px; color: #4b5563; }
          table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 8px; }
          th { background: #1e40af; color: #ffffff; padding: 8px 10px; border: 1px solid #1e40af; font-size: 12px; font-weight: 800; }
          .signatures { display: flex; justify-content: space-between; margin-top: 25px; padding: 10px 20px; page-break-inside: avoid; }
          .sig-col { text-align: center; font-size: 11.5px; width: 210px; }
          .sig-line { margin-top: 35px; border-top: 1px dashed #9ca3af; padding-top: 4px; color: #6b7280; font-size: 11px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="center-meta">
            ${logoHtml}
            <div style="font-size: 14px; font-weight: 800; color: #111827;">${centerName}</div>
            <div style="font-size: 10.5px; color: #6b7280;">${centerAddress} ${centerPhone ? '· هاتف: ' + centerPhone : ''}</div>
          </div>
          <div class="doc-title">
            <h1>الخطة والتقويم السنوي للأيام والمناسبات العالمية والتربوية</h1>
            <p>دليل الفعاليات التوعوية والتأهيلية المعتمدة لتعزيز الدمج المجتمعي وتنمية مهارات المستفيدين للعام ${currentYear}</p>
          </div>
          <div style="text-align: left; font-size: 10.5px; color: #6b7280; min-width: 180px;">
            <div>تاريخ الطباعة: ${todayStr()}</div>
            <div>عدد المناسبات المدرجة: ${printItems.length} مناسبة</div>
            <div style="margin-top: 4px; padding: 3px 8px; background: #e0e7ff; color: #3730a3; border-radius: 4px; display: inline-block; font-weight: bold;">معتمد وموثق</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>التاريخ واليوم</th>
              <th>المناسبة العالمية / التربوية</th>
              <th>المجال / التصنيف</th>
              <th>الأهداف التأهيلية والتوعوية</th>
              <th>المكان المقترح</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-col">
            <div style="font-weight: 800;">إعداد / مسؤول الأنشطة والفعاليات</div>
            <div class="sig-line">التوقيع: ................................</div>
          </div>
          <div class="sig-col">
            <div style="font-weight: 800;">تدقيق / مسؤول الجودة والتأهيل</div>
            <div class="sig-line">التوقيع: ................................</div>
          </div>
          <div class="sig-col">
            <div style="font-weight: 800;">اعتماد / مدير المركز والختم الرسمي</div>
            <div class="sig-line">التوقيع: ................................</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Open Add Modal
  const handleOpenNew = () => {
    const activeYr = academicYears.find(y => y.isCurrent)?.name || (availableYears[0] || '2025 / 2026');
    const activeYrId = academicYears.find(y => y.isCurrent)?.id || '';

    setForm({
      ...EMPTY_EVENT_FORM,
      academicYear: activeYr,
      academicYearId: activeYrId,
      date: todayStr(),
    });
    setEditId(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (evt) => {
    setForm({
      name: evt.name || '',
      category: evt.category || 'national',
      academicYearId: evt.academicYearId || '',
      academicYear: evt.academicYear || '',
      date: evt.date || todayStr(),
      time: evt.time || '09:00 ص - 12:00 م',
      locationType: evt.locationType || 'internal',
      location: evt.location || '',
      partnerId: evt.partnerId || '',
      partnerName: evt.partnerName || '',
      targetAudience: evt.targetAudience || 'all',
      participantStudentIds: evt.participantStudentIds || [],
      participantCountEst: evt.participantCountEst || '',
      supervisorEmpIds: evt.supervisorEmpIds || [],
      parentsInvited: evt.parentsInvited !== false,
      budgetEst: evt.budgetEst || '',
      budgetActual: evt.budgetActual || '',
      status: evt.status || 'upcoming',
      objectives: evt.objectives || '',
      qualityNotes: evt.qualityNotes || '',
      images: evt.images || [],
      notes: evt.notes || ''
    });
    setEditId(evt.id);
    setShowModal(true);
  };

  // Save Event
  const handleSave = () => {
    if (!form.name.trim()) {
      toast('⚠️ يرجى إدخال اسم الفعالية', 'er');
      return;
    }
    if (!form.date) {
      toast('⚠️ يرجى تحديد تاريخ إقامة الفعالية', 'er');
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      academicYear: form.academicYear || (form.date ? form.date.slice(0, 4) : ''),
      budgetEst: Number(form.budgetEst) || 0,
      budgetActual: Number(form.budgetActual) || 0,
      participantCountEst: Number(form.participantCountEst) || form.participantStudentIds.length || 0,
    };

    if (editId) {
      lsUpd('centerEvents', editId, payload);
      toast('✅ تم تحديث بيانات الفعالية بنجاح', 'ok');
    } else {
      const newEvt = { ...payload, id: `evt_${Date.now()}_${uid()}` };
      lsAdd('centerEvents', newEvt);
      toast('🎉 تم إضافة الفعالية الجديدة وتوثيقها', 'ok');
    }

    setShowModal(false);
    reload();
  };

  // Delete Event
  const handleDelete = (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف فعالية "${name}" نهائياً من سجلات المركز؟`)) return;
    lsDel('centerEvents', id);
    toast('🗑️ تم حذف الفعالية بنجاح', 'ok');
    if (viewEvent?.id === id) setViewEvent(null);
    reload();
  };

  // Print Event Report
  const handlePrintEvent = (evt) => {
    const partnerInfo = partners.find(p => p.id === evt.partnerId);
    const supervisingStaff = emps.filter(e => evt.supervisorEmpIds?.includes(e.id));
    const participatingStudents = students.filter(s => evt.participantStudentIds?.includes(s.id));
    const catLabel = EVENT_CATEGORIES.find(c => c.id === evt.category)?.label || 'فعالية مركز';

    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تقرير توثيق فعالية - ${evt.name}</title>
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
            <p class="sub">إدارة البرامج والأنشطة والخدمات المساندة · ملف الجودة والاعتماد المؤسسي</p>
          </div>
          <div style="text-align: left;">
            <div style="font-weight: 800; font-size: 14px;">تقرير توثيق فعالية رسمية</div>
            <div style="font-size: 12px; color: #64748b;">العام: ${evt.academicYear || '—'}</div>
          </div>
        </div>

        <div class="box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h2 style="margin:0; font-size: 17px; color: #0f172a;">🎉 ${evt.name}</h2>
            <span class="badge">${catLabel}</span>
          </div>
          <div class="grid">
            <div><strong>📅 التاريخ:</strong> ${evt.date || '—'}</div>
            <div><strong>⏰ التوقيت:</strong> ${evt.time || '—'}</div>
            <div><strong>📍 المكان:</strong> ${evt.location || 'مقر المركز'} (${evt.locationType === 'internal' ? 'داخلي' : 'خارجي'})</div>
            <div><strong>👥 الشريك / الراعي:</strong> ${evt.partnerName || partnerInfo?.name || 'تنظيم المركز'}</div>
            <div><strong>📊 حالة الفعالية:</strong> ${evt.status === 'completed' ? 'مكتملة وموثقة ✅' : 'مجدولة ⏳'}</div>
            <div><strong>👨‍👩‍👧‍👦 مشاركة أولياء الأمور:</strong> ${evt.parentsInvited ? 'نعم (حضور مفتوح)' : 'مقتصرة على الطلاب والكوادر'}</div>
          </div>
        </div>

        <div class="sec-h">🎯 أهداف الفعالية ومخرجات الدمج المجتمعي:</div>
        <div style="font-size: 13px; background: #fff; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
          ${evt.objectives || 'تعزيز الاندماج الاجتماعي وتنمية المهارات التفاعلية للمستفيدين.'}
        </div>

        <div class="sec-h">📋 مؤشرات الجودة وملاحظات التنفيذ:</div>
        <div style="font-size: 13px; background: #fff; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
          ${evt.qualityNotes || 'تم تنفيذ الفعالية وفق الخطة التشغيلية المعتمدة للمركز مع مراعاة أعلى معايير السلامة والتنظيم.'}
        </div>

        <div class="sec-h">👥 الكوادر المشرفة والطلاب المشاركون:</div>
        <div class="grid" style="font-size: 12px;">
          <div><strong>المشرفون والمنظمون:</strong> ${supervisingStaff.length > 0 ? supervisingStaff.map(s => s.name).join('، ') : 'فريق الأنشطة بالمركز'}</div>
          <div><strong>عدد الطلاب المشاركين:</strong> ${evt.participantCountEst || participatingStudents.length || 'جميع المستفيدين'} طالب وطالبة</div>
        </div>

        <div class="signatures">
          <div>
            <strong>أخصائي / مسؤول الأنشطة</strong>
            <div style="margin-top: 35px;">___________________</div>
          </div>
          <div>
            <strong>مسؤول الجودة والاعتماد</strong>
            <div style="margin-top: 35px;">___________________</div>
          </div>
          <div>
            <strong>مدير المركز</strong>
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
          
          {/* Top Bar with Add Button and Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <PartyPopper style={{ width: 20, height: 20, color: 'var(--pr)' }} />
                <span>سجل الفعاليات والمناسبات الرسمية ({filteredEvents.length})</span>
              </div>
              <div style={{ fontSize: '.76rem', color: 'var(--text-sub)' }}>
                توثيق الاحتفالات، الأيام الوطنية والعالمية، التخريج، والشراكات المجتمعية وفق معايير الجودة
              </div>
            </div>

            {canEdit && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-s"
                  onClick={() => setShowIntDaysModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    color: 'var(--text-main)'
                  }}
                  title="استعراض دليل الأيام العالمية لذوي الاحتياجات الخاصة والتربية"
                >
                  <Globe style={{ width: 16, height: 16, color: '#6366f1' }} />
                  <span>🌍 فعاليات الاحتفال بالأيام العالمية ({INTERNATIONAL_DAYS.length})</span>
                </button>

                <button
                  type="button"
                  className="btn btn-p"
                  onClick={handleOpenNew}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <Plus style={{ width: 16, height: 16 }} />
                  <span>إضافة فعالية جديدة</span>
                </button>
              </div>
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
              جميع السنوات ({events.length})
            </button>

            {availableYears.map(yr => {
              const isSelected = selectedYear === yr;
              const countInYr = events.filter(e => (e.academicYear || (e.date && e.date.slice(0, 4))) === yr).length;
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
                placeholder="ابحث باسم الفعالية، المكان، الشريك، أو الهدف..."
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
              <option value="">— جميع تصنيفات الفعاليات —</option>
              {EVENT_CATEGORIES.map(c => (
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
              <option value="upcoming">مجدولة / قادمة ⏳</option>
              <option value="active">جارية اليوم 🟢</option>
              <option value="completed">مكتملة وموثقة ✅</option>
              <option value="cancelled">ملغاة ❌</option>
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
          <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>🎯 إجمالي الفعاليات</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>{stats.total}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>في النطاق المحدد</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--sh)' }}>
          <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>✅ الفعاليات المكتملة</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ok, #10b981)', marginTop: 2 }}>{stats.completed}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>موثقة في ملف الجودة</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--sh)' }}>
          <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>⏳ الفعاليات القادمة</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warn, #f59e0b)', marginTop: 2 }}>{stats.upcoming}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>قيد التجهيز والتنظيم</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--sh)' }}>
          <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', fontWeight: 700 }}>👨‍🎓 الطلاب المستفيدون</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pr)', marginTop: 2 }}>{stats.totalParticipants}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-sub)' }}>إجمالي المشاركات المسجلة</div>
        </div>
      </div>

      {/* 3. Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="لا توجد فعاليات مطابقة لمعايير البحث"
          sub={canEdit ? 'يمكنك إضافة فعالية واحتفال جديد وتوثيق مخرجات الجودة والشركاء' : ''}
          action={canEdit ? <button type="button" className="btn btn-p" onClick={handleOpenNew}>➕ إضافة فعالية جديدة</button> : null}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filteredEvents.map(evt => {
            const catObj = EVENT_CATEGORIES.find(c => c.id === evt.category);
            const statusBdg = evt.status === 'completed' ? 'b-gr' : evt.status === 'active' ? 'b-bl' : evt.status === 'cancelled' ? 'b-r' : 'b-yl';
            const statusText = evt.status === 'completed' ? 'مكتملة وموثقة ✅' : evt.status === 'active' ? 'جارية اليوم 🟢' : evt.status === 'cancelled' ? 'ملغاة ❌' : 'مجدولة ⏳';

            return (
              <div
                key={evt.id}
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
                        {catObj?.label || 'فعالية مركز'}
                      </span>
                      {evt.academicYear && (
                        <span className="bdg b-g" style={{ fontSize: '.66rem' }}>
                          📅 {evt.academicYear}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '.98rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {evt.name}
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
                    <span><strong>التاريخ:</strong> {evt.date} · {evt.time || 'صباحاً'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)' }}>
                    <MapPin style={{ width: 14, height: 14, color: 'var(--pr)', flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>المكان:</strong> {evt.location || 'مقر المركز'}
                    </span>
                  </div>

                  {evt.partnerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)' }}>
                      <Handshake style={{ width: 14, height: 14, color: 'var(--pr)', flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <strong>الشريك / الراعي:</strong> {evt.partnerName}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
                    <span style={{ color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users style={{ width: 13, height: 13 }} />
                      <span>المستفيدون:</span>
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      {evt.participantCountEst || evt.participantStudentIds?.length || 0} مشارك
                    </span>
                  </div>
                </div>

                {/* Objectives Snippet */}
                {evt.objectives && (
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    🎯 {evt.objectives}
                  </div>
                )}

                {/* Card Actions Footer */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      className="btn btn-xs btn-p"
                      onClick={() => setViewEvent(evt)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Eye style={{ width: 12, height: 12 }} />
                      <span>تفاصيل</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-g"
                      onClick={() => handlePrintEvent(evt)}
                      title="طباعة بطاقة توثيق الفعالية الرسمية"
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
                        onClick={() => handleOpenEdit(evt)}
                        title="تعديل الفعالية"
                      >
                        <Edit2 style={{ width: 12, height: 12 }} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-d"
                        onClick={() => handleDelete(evt.id, evt.name)}
                        title="حذف الفعالية"
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
      {/* MODAL: VIEW EVENT DETAILS */}
      {/* ========================================================================= */}
      {viewEvent && (
        <div className="mbg">
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            {/* Header */}
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎉</span>
                  <span>بطاقة وتوثيق الفعالية</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '.78rem', opacity: 0.9 }}>
                  بيانات الفعالية ومؤشرات الجودة والدمج المجتمعي
                </p>
              </div>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => setViewEvent(null)}
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
                  <span className="bdg b-bl">{EVENT_CATEGORIES.find(c => c.id === viewEvent.category)?.label || 'فعالية'}</span>
                  {viewEvent.academicYear && <span className="bdg b-g">📅 {viewEvent.academicYear}</span>}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {viewEvent.name}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, background: 'var(--g0)', padding: 12, borderRadius: 10, fontSize: '.82rem', border: '1px solid var(--border-color)' }}>
                <div><strong>📅 التاريخ:</strong> {viewEvent.date}</div>
                <div><strong>⏰ التوقيت:</strong> {viewEvent.time || '—'}</div>
                <div><strong>📍 المكان:</strong> {viewEvent.location || 'مقر المركز'}</div>
                <div><strong>👥 الشريك / الراعي:</strong> {viewEvent.partnerName || 'تنظيم المركز الداخلي'}</div>
                <div><strong>📊 الحالة:</strong> {viewEvent.status === 'completed' ? 'مكتملة وموثقة ✅' : 'مجدولة ⏳'}</div>
                <div><strong>👨‍👩‍👧‍👦 دعوة أولياء الأمور:</strong> {viewEvent.parentsInvited ? 'مرحب بالحضور' : 'مقتصرة على الطلاب والكوادر'}</div>
              </div>

              {viewEvent.objectives && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.86rem', color: 'var(--text-main)', marginBottom: 4 }}>🎯 الأهداف ومخرجات الدمج:</div>
                  <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 8, fontSize: '.82rem', lineHeight: 1.6, border: '1px solid var(--border-color)' }}>
                    {viewEvent.objectives}
                  </div>
                </div>
              )}

              {viewEvent.qualityNotes && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.86rem', color: 'var(--text-main)', marginBottom: 4 }}>📋 مؤشرات وملاحظات الجودة والاعتماد:</div>
                  <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 8, fontSize: '.82rem', lineHeight: 1.6, border: '1px solid var(--border-color)' }}>
                    {viewEvent.qualityNotes}
                  </div>
                </div>
              )}

              {viewEvent.notes && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.86rem', color: 'var(--text-main)', marginBottom: 4 }}>📝 ملاحظات عامة:</div>
                  <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 8, fontSize: '.82rem', lineHeight: 1.6, border: '1px solid var(--border-color)' }}>
                    {viewEvent.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="fa" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-p"
                onClick={() => handlePrintEvent(viewEvent)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              >
                <Printer style={{ width: 15, height: 15 }} />
                <span>طباعة التقرير الرسمي للفعالية</span>
              </button>
              <button type="button" className="btn btn-g" onClick={() => setViewEvent(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT EVENT */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="mbg">
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            {/* Modal Header */}
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎉</span>
                  <span>{editId ? 'تعديل بيانات الفعالية' : 'إضافة وتوثيق فعالية جديدة'}</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '.78rem', opacity: 0.9 }}>
                  توثيق الفعاليات الميدانية والوطنية مع مراعاة متطلبات الجودة والاعتماد
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
              
              {/* International & Special Days Autofill Selector */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))',
                border: '1.5px solid rgba(99, 102, 241, 0.28)',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '.86rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles style={{ width: 16, height: 16, color: '#6366f1' }} />
                    <span>🌍 اختيار وتعبئة من الأيام والمناسبات العالمية والتربوية</span>
                  </label>
                  <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>
                    (اختياري) تعبئة تلقائية لاسم الفعالية، التاريخ، والأهداف
                  </span>
                </div>

                <select
                  defaultValue=""
                  onChange={(e) => {
                    handleSelectInternationalDay(e.target.value);
                    e.target.value = '';
                  }}
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '.85rem',
                    borderColor: 'rgba(99, 102, 241, 0.35)',
                    padding: '8px 12px',
                    borderRadius: 8
                  }}
                >
                  <option value="">— اضغط هنا للاختيار من قائمة الأيام العالمية والمناسبات التربوية —</option>
                  {INTERNATIONAL_DAYS.map(day => (
                    <option key={day.id} value={day.id}>
                      {day.icon} {day.day}/{day.month} — {day.name} ({day.categoryLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>
                  اسم الفعالية / المناسبة <span style={{ color: 'var(--err)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="مثال: الاحتفال باليوم الوطني السعودي، حفل التخرج السنوي..."
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>تصنيف الفعالية</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    {EVENT_CATEGORIES.map(c => (
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
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>تاريخ الفعالية <span style={{ color: 'var(--err)' }}>*</span></label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>وقت الفعالية</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    placeholder="مثال: 09:00 ص - 12:30 م"
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
                    <option value="external">خارجي (موقع خارجي) 📍</option>
                  </select>
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>المكان والقاعة بالتفصيل</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="مثال: المسرح الرئيسي، الصالة الرياضية، قاعة المؤتمرات..."
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>الشريك / الجهة الراعية (اختياري)</label>
                  <select
                    value={form.partnerId}
                    onChange={e => {
                      const p = partners.find(x => x.id === e.target.value);
                      setForm(f => ({
                        ...f,
                        partnerId: e.target.value,
                        partnerName: p ? p.name : ''
                      }));
                    }}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    <option value="">— تنظيم ذاتي للمركز —</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.field || 'شريك'})</option>
                    ))}
                  </select>
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>حالة الفعالية</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    <option value="upcoming">مجدولة / قادمة ⏳</option>
                    <option value="active">جارية اليوم 🟢</option>
                    <option value="completed">مكتملة وموثقة ✅</option>
                    <option value="cancelled">ملغاة ❌</option>
                  </select>
                </div>
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>الأهداف التأهيلية ومخرجات الدمج المجتمعي</label>
                <textarea
                  rows="2"
                  value={form.objectives}
                  onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))}
                  placeholder="ما هي الأهداف المراد تحقيقها من هذه الفعالية للطلاب وللمركز؟"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="fl">
                <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>مؤشرات الجودة والتوثيق والاعتماد</label>
                <textarea
                  rows="2"
                  value={form.qualityNotes}
                  onChange={e => setForm(f => ({ ...f, qualityNotes: e.target.value }))}
                  placeholder="ملاحظات إدارة الجودة، نسبة رضا الحضور، والمخرجات المحققة..."
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>العدد التقديري للمشاركين</label>
                  <input
                    type="number"
                    value={form.participantCountEst}
                    onChange={e => setForm(f => ({ ...f, participantCountEst: e.target.value }))}
                    placeholder="مثال: 50"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '.84rem' }}>الميزانية التقديرية (ريال)</label>
                  <input
                    type="number"
                    value={form.budgetEst}
                    onChange={e => setForm(f => ({ ...f, budgetEst: e.target.value }))}
                    placeholder="مثال: 3000"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--g0)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <input
                  type="checkbox"
                  id="parentsInvitedCheck"
                  checked={form.parentsInvited}
                  onChange={e => setForm(f => ({ ...f, parentsInvited: e.target.checked }))}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="parentsInvitedCheck" style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                  دعوة أولياء الأمور والأسر لحضور ومشاركة الفعالية
                </label>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="fa">
              <button type="button" className="btn btn-g" onClick={() => setShowModal(false)}>
                إلغاء
              </button>
              <button type="button" className="btn btn-p" onClick={handleSave} style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                💾 حفظ وتوثيق الفعالية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. International & Educational Days Browser Modal (نافذة التقويم السنوي للأيام والمناسبات العالمية والتربوية) */}
      {showIntDaysModal && (
        <div className="mbg" style={{ zIndex: 1200 }}>
          <div
            className="mb mb-xl"
            style={{
              maxWidth: 'min(1180px, 96vw)',
              width: '100%',
              maxHeight: 'min(94vh, 920px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1.5px solid var(--border-color)',
            }}
          >
            {/* Modal Header with Center Identity & Print Action */}
            <div
              className="fhd"
              style={{
                padding: '16px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                background: 'linear-gradient(135deg, var(--pr), var(--pr-d))',
                color: '#fff',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {center?.logo ? (
                  <img
                    src={center.logo}
                    alt="Logo"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      objectFit: 'contain',
                      background: '#fff',
                      padding: 3,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    🌍
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#fff' }}>
                      التقويم والخطة السنوية للأيام العالمية والتربوية
                    </h2>
                    <span
                      style={{
                        background: 'rgba(255,255,255,0.22)',
                        color: '#fff',
                        fontSize: '.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      {center?.name || 'المركز'}
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '.78rem', opacity: 0.92, color: 'rgba(255,255,255,0.9)' }}>
                    دليل الفعاليات التوعوية والتأهيلية المعتمدة لتعزيز الدمج المجتمعي وتوثيق متطلبات الجودة والاعتماد
                  </p>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={handlePrintInternationalDays}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                  }}
                  title="طباعة التقويم السنوي المنسق مع شعار المركز"
                >
                  <Printer style={{ width: 15, height: 15 }} />
                  <span>🖨️ طباعة التقويم الرسمي</span>
                </button>

                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setShowIntDaysModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: 15, height: 15 }} />
                  <span>إغلاق</span>
                </button>
              </div>
            </div>

            {/* Sub-Header Toolbar: Search, View Switcher & Month Scroll */}
            <div
              style={{
                padding: '12px 18px',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Top Row: Search & View Modes */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                {/* Search Bar */}
                <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 420 }}>
                  <Search
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 15,
                      height: 15,
                      color: 'var(--text-sub)',
                    }}
                  />
                  <input
                    type="text"
                    value={intDaysSearch}
                    onChange={e => setIntDaysSearch(e.target.value)}
                    placeholder="بحث في المناسبات، الأهداف، أو المجال..."
                    style={{
                      width: '100%',
                      padding: '8px 36px 8px 12px',
                      borderRadius: 10,
                      border: '1.5px solid var(--border-color)',
                      background: 'var(--g0)',
                      color: 'var(--text-main)',
                      fontSize: '.84rem',
                      outline: 'none',
                    }}
                  />
                  {intDaysSearch && (
                    <button
                      type="button"
                      onClick={() => setIntDaysSearch('')}
                      style={{
                        position: 'absolute',
                        left: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-sub)',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* View Mode Switcher (Calendar Cards vs Table View) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--g0)',
                    padding: 3,
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <button
                    type="button"
                    className={`btn btn-xs ${intDaysViewMode === 'calendar' ? 'btn-p' : 'btn-g'}`}
                    onClick={() => setIntDaysViewMode('calendar')}
                    style={{ borderRadius: 8, padding: '5px 12px', fontWeight: 700, border: 'none' }}
                  >
                    <Calendar style={{ width: 13, height: 13 }} />
                    <span>🗓️ محاكاة التقويم السنوي</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${intDaysViewMode === 'table' ? 'btn-p' : 'btn-g'}`}
                    onClick={() => setIntDaysViewMode('table')}
                    style={{ borderRadius: 8, padding: '5px 12px', fontWeight: 700, border: 'none' }}
                  >
                    <FileText style={{ width: 13, height: 13 }} />
                    <span>📊 الجدول التنفيذي الشامل</span>
                  </button>
                </div>
              </div>

              {/* Month Selector Tabs (الأشهر من 1 إلى 12) */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  overflowX: 'auto',
                  scrollbarWidth: 'thin',
                  paddingBottom: 4,
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '.76rem', fontWeight: 800, color: 'var(--text-sub)', whiteSpace: 'nowrap', paddingLeft: 6 }}>
                  📅 الشهر:
                </span>
                {[
                  { id: 'all', name: 'كامل العام' },
                  { id: 1, name: 'يناير' },
                  { id: 2, name: 'فبراير' },
                  { id: 3, name: 'مارس' },
                  { id: 4, name: 'أبريل' },
                  { id: 5, name: 'مايو' },
                  { id: 6, name: 'يونيو' },
                  { id: 7, name: 'يوليو' },
                  { id: 8, name: 'أغسطس' },
                  { id: 9, name: 'سبتمبر' },
                  { id: 10, name: 'أكتوبر' },
                  { id: 11, name: 'نوفمبر' },
                  { id: 12, name: 'ديسمبر' },
                ].map(m => {
                  const isSelected = String(intDaysMonthFilter) === String(m.id);
                  const count = m.id === 'all'
                    ? INTERNATIONAL_DAYS.length
                    : INTERNATIONAL_DAYS.filter(d => d.month === m.id).length;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setIntDaysMonthFilter(m.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: '.76rem',
                        fontWeight: isSelected ? 800 : 600,
                        border: isSelected ? '1.5px solid var(--pr)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--pr-l)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--pr)' : 'var(--text-main)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{m.name}</span>
                      <span
                        style={{
                          fontSize: '.66rem',
                          padding: '1px 5px',
                          borderRadius: 99,
                          background: isSelected ? 'var(--pr)' : 'var(--g0)',
                          color: isSelected ? '#fff' : 'var(--text-sub)',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Domain / Category Filter Badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '.76rem', fontWeight: 800, color: 'var(--text-sub)', whiteSpace: 'nowrap', paddingLeft: 6 }}>
                  🏷️ المجال:
                </span>
                {[
                  { id: 'all', label: 'جميع المجالات' },
                  { id: 'developmental', label: '🧩 التوحد واضطرابات النمو' },
                  { id: 'sensory', label: '🦯 الإعاقات الحسية والسمعية' },
                  { id: 'rehab', label: '🏃 التأهيل والعلاج الطبيعي' },
                  { id: 'educational', label: '📚 التعليم والتربية الخاصة' },
                  { id: 'national', label: '🇸🇦 المناسبات الوطنية' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`btn btn-xs ${intDaysCategoryFilter === cat.id ? 'btn-p' : 'btn-g'}`}
                    onClick={() => setIntDaysCategoryFilter(cat.id)}
                    style={{ borderRadius: 16, padding: '3px 10px', fontWeight: 700, fontSize: '.74rem' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: Cards List OR Table View */}
            <div
              className="modal-body-scroll"
              style={{
                padding: '18px 22px',
                background: 'var(--g0)',
                flex: 1,
                minHeight: 320,
              }}
            >
              {(() => {
                const filtered = INTERNATIONAL_DAYS
                  .filter(d => intDaysCategoryFilter === 'all' || d.category === intDaysCategoryFilter)
                  .filter(d => intDaysMonthFilter === 'all' || d.month === Number(intDaysMonthFilter))
                  .filter(d => {
                    if (!intDaysSearch.trim()) return true;
                    const q = intDaysSearch.toLowerCase();
                    return (
                      d.name.toLowerCase().includes(q) ||
                      d.objectives.toLowerCase().includes(q) ||
                      d.categoryLabel.toLowerCase().includes(q)
                    );
                  });

                if (filtered.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-sub)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔍</div>
                      <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>
                        لا توجد مناسبات مطابقة لمعايير البحث
                      </h4>
                      <p style={{ margin: '6px 0 0', fontSize: '.84rem' }}>
                        جرّب اختيار شهر آخر أو إلغاء فلتر البحث لعرض كافة الأيام العالمية.
                      </p>
                    </div>
                  );
                }

                // VIEW 1: Calendar Simulation Cards Grid
                if (intDaysViewMode === 'calendar') {
                  const monthsNames = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

                  return (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))',
                        gap: 14,
                      }}
                    >
                      {filtered.map(day => (
                        <div
                          key={day.id}
                          style={{
                            background: 'var(--bg-card)',
                            border: '1.5px solid var(--border-color)',
                            borderRadius: 16,
                            padding: '14px 16px',
                            display: 'flex',
                            gap: 14,
                            alignItems: 'flex-start',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }}
                        >
                          {/* Calendar Date Block */}
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 70,
                              borderRadius: 12,
                              overflow: 'hidden',
                              border: '1.5px solid var(--border-color)',
                              background: 'var(--g0)',
                              flexShrink: 0,
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: '100%',
                                background: 'var(--pr)',
                                color: '#fff',
                                padding: '3px 6px',
                                fontSize: '.68rem',
                                fontWeight: 800,
                              }}
                            >
                              {monthsNames[day.month]}
                            </div>
                            <div
                              style={{
                                padding: '6px 4px 4px',
                                fontSize: '1.45rem',
                                fontWeight: 900,
                                color: 'var(--text-main)',
                                lineHeight: 1,
                              }}
                            >
                              {day.day}
                            </div>
                            <div style={{ fontSize: '.64rem', color: 'var(--text-sub)', paddingBottom: 4 }}>
                              سنوي
                            </div>
                          </div>

                          {/* Content Details */}
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: '1.25rem' }}>{day.icon}</span>
                                <h4 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                                  {day.name}
                                </h4>
                              </div>
                            </div>

                            {/* Tags */}
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                              <span
                                style={{
                                  fontSize: '.7rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  background: 'var(--pr-l)',
                                  color: 'var(--pr)',
                                }}
                              >
                                {day.categoryLabel}
                              </span>
                              {day.suggestedLocation && (
                                <span
                                  style={{
                                    fontSize: '.7rem',
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    background: 'var(--g0)',
                                    color: 'var(--text-sub)',
                                    border: '1px solid var(--border-color)',
                                  }}
                                >
                                  📍 {day.suggestedLocation}
                                </span>
                              )}
                            </div>

                            {/* Objectives */}
                            <p
                              style={{
                                margin: '2px 0 0',
                                fontSize: '.8rem',
                                color: 'var(--text-sub)',
                                lineHeight: 1.55,
                              }}
                            >
                              {day.objectives}
                            </p>

                            {/* Action Button */}
                            {canEdit && (
                              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  className="btn btn-p btn-xs"
                                  onClick={() => handleAdoptInternationalDay(day)}
                                  style={{
                                    borderRadius: 8,
                                    padding: '5px 12px',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                  }}
                                >
                                  <PartyPopper style={{ width: 13, height: 13 }} />
                                  <span>تنظيم احتفال بالفعالية</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                // VIEW 2: Executive Table View
                return (
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 14,
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                    }}
                  >
                    <div className="tbl-wrap" style={{ margin: 0 }}>
                      <table>
                        <thead>
                          <tr>
                            <th style={{ width: 50, textAlign: 'center' }}>#</th>
                            <th style={{ width: 110, textAlign: 'center' }}>التاريخ السنوي</th>
                            <th>المناسبة العالمية / التربوية</th>
                            <th style={{ width: 140, textAlign: 'center' }}>المجال والتصنيف</th>
                            <th>الأهداف التأهيلية والتوعوية</th>
                            <th style={{ width: 130, textAlign: 'center' }}>المكان المقترح</th>
                            {canEdit && <th style={{ width: 140, textAlign: 'center' }}>الإجراء</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((day, idx) => (
                            <tr key={day.id}>
                              <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-sub)' }}>
                                {idx + 1}
                              </td>
                              <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <span
                                  style={{
                                    fontSize: '.75rem',
                                    fontWeight: 800,
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    background: 'var(--pr-l)',
                                    color: 'var(--pr)',
                                  }}
                                >
                                  📅 {day.day} / {day.month}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: 'var(--text-main)' }}>
                                  <span style={{ fontSize: '1.2rem' }}>{day.icon}</span>
                                  <span>{day.name}</span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: '.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                                  {day.categoryLabel}
                                </span>
                              </td>
                              <td style={{ fontSize: '.8rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                                {day.objectives}
                              </td>
                              <td style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--text-sub)' }}>
                                {day.suggestedLocation || 'الصالة الرئيسية'}
                              </td>
                              {canEdit && (
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    className="btn btn-p btn-xs"
                                    onClick={() => handleAdoptInternationalDay(day)}
                                    style={{ borderRadius: 6, padding: '4px 10px', fontWeight: 700 }}
                                  >
                                    🎉 تنظيم
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div
              className="fa"
              style={{
                padding: '12px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-card)',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div style={{ fontSize: '.8rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                💡 إجمالي المناسبات المعتمدة بالنظام: <strong style={{ color: 'var(--text-main)' }}>{INTERNATIONAL_DAYS.length} مناسبة عالمية وتربوية</strong>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-s btn-sm"
                  onClick={handlePrintInternationalDays}
                  style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Printer style={{ width: 14, height: 14 }} />
                  <span>طباعة التقويم</span>
                </button>
                <button
                  type="button"
                  className="btn btn-g btn-sm"
                  onClick={() => setShowIntDaysModal(false)}
                  style={{ fontWeight: 700 }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
