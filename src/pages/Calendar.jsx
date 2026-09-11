import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { lsGet, lsSet, lsAdd, lsUpd, lsDel } from '../hooks/useStorage';
import { todayStr, uid, daysUntilDate, nextAnnualOccurrenceDate, nowTimeStr } from '../utils/dateHelpers';
import { SPECIALIST_ROLES } from '../utils/constants';
import {
  INTERNATIONAL_DAYS,
  getInternationalDayDate,
  getInternationalDayDates,
  getInternationalDaysForDate,
  OCCASION_CATEGORIES
} from '../data/internationalDays';
import UnifiedPageHeader from '../components/ui/UnifiedPageHeader';

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const EV_COLORS = [
  ['bl', 'أزرق (تعليمي وتنموي)', 'rgba(59, 130, 246, 0.12)', '#2563eb'],
  ['gr', 'أخضر (مناسبات وطنية)', 'rgba(16, 185, 129, 0.12)', '#059669'],
  ['or', 'برتقالي (أنشطة وتقييمات)', 'rgba(245, 158, 11, 0.12)', '#f59e0b'],
  ['rd', 'أحمر (طبي وصحي)', 'rgba(239, 68, 68, 0.12)', '#dc2626'],
  ['pu', 'بنفسجي (إعاقة وتأهيل)', 'rgba(139, 92, 246, 0.12)', '#7c3aed'],
  ['yl', 'ذهبي (أعياد ومناسبات رسمية)', 'rgba(245, 158, 11, 0.14)', '#d97706'],
];

const getColorStyles = (colorKey) => {
  const found = EV_COLORS.find(([c]) => c === colorKey);
  if (found) return { bg: found[2], text: found[3] };
  return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
};

const EMPTY_EV = { title: '', date: '', time: '', color: 'bl', type: 'event', notes: '' };
const EMPTY_STU_APPT = { stuId: '', type: 'تخاطب ونطق', date: '', time: '', duration: '45 دقيقة', mode: 'inperson', link: '', empId: '', notes: '' };
const EMPTY_STU_SESS = { stuId: '', type: 'تخاطب ونطق', date: '', time: '', duration: 45, empId: '', status: 'done', notes: '', goals: '', attachData: '', attachName: '' };
const EMPTY_ADOPT_EVENT = {
  name: '',
  date: '',
  time: '',
  location: '',
  locationType: 'internal',
  academicYear: '',
  targetAudience: 'all',
  supervisorEmpIds: [],
  objectives: '',
  qualityNotes: '',
  notes: '',
  internationalDayName: '',
  internationalDayIcon: '',
  internationalDayCategory: '',
  internationalDayCategoryLabel: '',
  suggestedObjectives: '',
  suggestedLocation: '',
};
const SESS_TYPES = ['تخاطب ونطق', 'تعديل سلوك', 'علاج فيزيائي', 'علاج وظيفي', 'تكامل حسي', 'تعليمي وتربوي', 'مهارات اجتماعية', 'أخرى'];

function isEvalType(type) {
  const t = (type || '').toLowerCase();
  return t.includes('تقييم') || t.includes('evaluation');
}

function isCalendarNewStudent(st) {
  return st && st.status === 'waitlist';
}

function buildCalendarItems() {
  const students = lsGet('students');
  const emps = lsGet('employees');
  const stuMap = Object.fromEntries(students.map(s => [s.id, s]));
  const empMap = Object.fromEntries(emps.map(e => [e.id, e]));
  const items = [];

  lsGet('calEvents').forEach(e => {
    items.push({
      id: `ce-${e.id}`,
      source: 'تقويم',
      date: e.date,
      time: e.time || '',
      title: e.title,
      detail: e.notes || '',
      color: e.color || 'bl',
      raw: e,
      editable: true,
    });
  });

  lsGet('appointments').forEach(a => {
    const st = stuMap[a.stuId];
    const col = isEvalType(a.type) ? 'or' : isCalendarNewStudent(st) ? 'pu' : 'gr';
    items.push({
      id: `ap-${a.id}`,
      source: isEvalType(a.type) ? 'تقييم' : 'موعد',
      date: a.date,
      time: a.time || '',
      title: `${st?.name || 'طالب'} — ${a.type || 'موعد'}${isCalendarNewStudent(st) ? ' ⭐' : ''}`,
      detail: [a.duration, a.mode === 'online' ? '🌐 أونلاين' : '', a.notes].filter(Boolean).join(' · '),
      color: col,
      raw: a,
      editable: false,
    });
  });

  lsGet('sessions').forEach(s => {
    if (!s.date) return;
    const st = stuMap[s.stuId];
    const emp = empMap[s.empId];
    const col = isCalendarNewStudent(st) ? 'pu' : s.status === 'done' ? 'gr' : 'bl';
    items.push({
      id: `se-${s.id}`,
      source: 'جلسة',
      date: s.date,
      time: s.time || '',
      title: `جلسة ${s.type || ''} — ${st?.name || 'طالب'}${isCalendarNewStudent(st) ? ' ⭐' : ''}`,
      detail: [emp?.name, s.status === 'done' ? '✅ منجزة' : '⏳ مجدولة', s.notes].filter(Boolean).join(' · '),
      color: col,
      raw: s,
      editable: false,
    });
  });

  lsGet('manualAlerts').forEach(m => {
    if (!m.date) return;
    items.push({
      id: `ma-${m.id}`,
      source: 'تنبيه يدوي',
      date: m.date,
      time: m.time || '',
      title: m.title || 'تنبيه',
      detail: m.details || '',
      color: m.severity === 'urgent' ? 'rd' : m.severity === 'warn' ? 'or' : 'bl',
      raw: m,
      editable: false,
    });
  });

  lsGet('centerActivities').forEach(act => {
    if (!act.date) return;
    items.push({
      id: `act-${act.id}`,
      source: 'فعالية',
      date: act.date,
      time: '',
      title: act.name || 'نشاط',
      detail: [act.year && `العام ${act.year}`, act.notes].filter(Boolean).join(' · '),
      color: 'or',
      raw: act,
      editable: false,
    });
  });

  lsGet('iepGoals').forEach(g => {
    if (!g.review) return;
    const st = stuMap[g.stuId];
    items.push({
      id: `iep-${g.id}`,
      source: 'مراجعة IEP',
      date: g.review,
      time: '',
      title: `مراجعة هدف — ${st?.name || 'طالب'}`,
      detail: `${g.domain || ''} — ${g.goal || ''}`,
      color: 'rd',
      raw: g,
      editable: false,
    });
  });

  students.forEach(s => {
    if (!s.dob) return;
    const nd = nextAnnualOccurrenceDate(s.dob);
    const d = daysUntilDate(nd);
    if (d == null || d < 0 || d > 14) return;
    const iso = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`;
    items.push({
      id: `bd-s-${s.id}`,
      source: 'عيد ميلاد',
      date: iso,
      time: '',
      title: `🎂 ${s.name} (طالب)`,
      detail: d === 0 ? 'اليوم' : d === 1 ? 'غداً' : `خلال ${d} يوم`,
      color: 'gr',
      raw: s,
      editable: false,
    });
  });

  emps.forEach(e => {
    if (!e.dob) return;
    const nd = nextAnnualOccurrenceDate(e.dob);
    const d = daysUntilDate(nd);
    if (d == null || d < 0 || d > 14) return;
    const iso = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`;
    items.push({
      id: `bd-e-${e.id}`,
      source: 'عيد ميلاد',
      date: iso,
      time: '',
      title: `🎂 ${e.name} (موظف)`,
      detail: d === 0 ? 'اليوم' : d === 1 ? 'غداً' : `خلال ${d} يوم`,
      color: 'gr',
      raw: e,
      editable: false,
    });
  });

  // Official Center Events (فعاليات المركز الرسمية)
  lsGet('centerEvents').forEach(evt => {
    if (!evt.date) return;
    items.push({
      id: `cevt-${evt.id}`,
      source: 'فعالية المركز 🎉',
      date: evt.date,
      time: evt.time || '',
      title: `🎉 ${evt.name || 'فعالية المركز'}`,
      detail: [evt.academicYear && `العام: ${evt.academicYear}`, evt.location, evt.objectives].filter(Boolean).join(' · '),
      color: 'gr',
      raw: evt,
      isCenterEvent: true,
      editable: false,
    });
  });

  // International & Specialized Awareness Days (الأيام والمناسبات العالمية والتربوية والوطنية والطبية)
  const currentYear = new Date().getFullYear();
  // Include past, current, and future academic/calendar years (2024 up to 2035)
  const yearsRange = [];
  for (let y = currentYear - 2; y <= currentYear + 8; y++) {
    yearsRange.push(y);
  }

  INTERNATIONAL_DAYS.forEach(iday => {
    const catConfig = OCCASION_CATEGORIES[iday.category] || {};
    yearsRange.forEach(y => {
      const dates = getInternationalDayDates(iday, y);
      dates.forEach((dIso, idx) => {
        items.push({
          id: `intday-${iday.id}-${y}-${idx}`,
          source: catConfig.shortLabel || 'يوم عالمي 🌍',
          date: dIso,
          time: '',
          title: `${iday.icon} ${iday.name}`,
          detail: `${iday.categoryLabel} · ${iday.objectives}`,
          color: catConfig.colorKey || 'pu',
          raw: iday,
          isInternationalDay: true,
          year: y,
          editable: false,
        });
      });
    });
  });

  return items;
}

export default function Calendar() {
  const { toast, activeView, viewParams } = useApp();
  const [cur, setCur] = useState(new Date());
  const [allItems, setAllItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_EV);
  const [showStuAppt, setShowStuAppt] = useState(false);
  const [stuApptForm, setStuApptForm] = useState(EMPTY_STU_APPT);
  const [showStuSess, setShowStuSess] = useState(false);
  const [stuSessForm, setStuSessForm] = useState(EMPTY_STU_SESS);
  const [showEval, setShowEval] = useState(false);
  const [evalForm, setEvalForm] = useState({ childName:'', parentName:'', diagnosis:'', date:'', time:'', notes:'' });
  const [selDay, setSelDay] = useState(null);
  const [selItem, setSelItem] = useState(null);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptForm, setAdoptForm] = useState(EMPTY_ADOPT_EVENT);

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    setAllItems(buildCalendarItems());
  }

  useEffect(() => {
    reload();
  }, [activeView]);

  // استجابة لتمرير تاريخ محدد من التنبيهات والإشعارات (مثل النقر على إشعار يوم عالمي)
  useEffect(() => {
    if (viewParams && (viewParams.targetDate || viewParams.date)) {
      const target = viewParams.targetDate || viewParams.date;
      const parts = target.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        setCur(new Date(y, m, 1));
        setSelDay(d);

        // تحديد العنصر تلقائياً لعرض بطاقة تفاصيله
        setTimeout(() => {
          const items = buildCalendarItems();
          const matched = items.find(it => it.date === target && (viewParams.intDayId ? (it.raw?.id === viewParams.intDayId || it.id?.includes(viewParams.intDayId)) : true));
          if (matched) {
            setSelItem(matched);
          }
        }, 80);
      }
    }
  }, [viewParams, activeView]);

  const year = cur.getFullYear();
  const month = cur.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function dateStr(d) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function itemsOnDay(d) {
    const ds = dateStr(d);
    return allItems.filter(it => it.date === ds).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }

  function openForm(d = null) {
    setForm({ ...EMPTY_EV, date: d ? dateStr(d) : todayStr() });
    setEditId(null);
    setShowForm(true);
  }

  function save() {
    if (!form.title || !form.title.trim() || !form.date) {
      toast('⚠️ أدخل العنوان والتاريخ', 'er');
      return;
    }
    if (editId) {
      lsUpd('calEvents', editId, form);
      toast('✅ تم التحديث', 'ok');
    } else {
      lsAdd('calEvents', { ...form, id: uid() });
      toast('✅ تم إضافة الحدث', 'ok');
    }
    setShowForm(false);
    reload();
  }

  function del(id) {
    lsDel('calEvents', id);
    reload();
    toast('🗑️ تم الحذف', 'ok');
    setSelItem(null);
  }

  const fld = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const fldA = k => e => setStuApptForm(f => ({ ...f, [k]: e.target.value }));
  const fldS = k => e => setStuSessForm(f => ({ ...f, [k]: e.target.value }));
  const specialists = emps.filter(e => SPECIALIST_ROLES.includes(e.role));
  const today = todayStr();

  function openStuAppt(d = null) {
    setStuApptForm({ ...EMPTY_STU_APPT, date: d ? dateStr(d) : todayStr(), time: nowTimeStr() });
    setShowStuAppt(true);
  }

  function saveStuAppt() {
    if (!stuApptForm.stuId || !stuApptForm.date || !stuApptForm.time) {
      toast('⚠️ اختر الطالب والتاريخ والوقت', 'er');
      return;
    }
    lsAdd('appointments', { ...stuApptForm, id: uid() });
    toast('✅ تم تسجيل الموعد', 'ok');
    setShowStuAppt(false);
    reload();
  }

  function openStuSess(d = null) {
    setStuSessForm({ ...EMPTY_STU_SESS, date: d ? dateStr(d) : todayStr(), time: nowTimeStr() });
    setShowStuSess(true);
  }

  function sessAttach(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setStuSessForm(fm => ({ ...fm, attachData: ev.target.result, attachName: f.name }));
    r.readAsDataURL(f);
    e.target.value = '';
  }

  function saveStuSess() {
    if (!stuSessForm.stuId || !stuSessForm.date) {
      toast('⚠️ اختر الطالب والتاريخ', 'er');
      return;
    }
    lsAdd('sessions', {
      id: uid(),
      stuId: stuSessForm.stuId,
      type: stuSessForm.type,
      date: stuSessForm.date,
      time: stuSessForm.time,
      duration: Number(stuSessForm.duration) || 45,
      empId: stuSessForm.empId,
      status: stuSessForm.status,
      notes: stuSessForm.notes,
      goals: stuSessForm.goals || '',
      attachmentData: stuSessForm.attachData || '',
      attachmentName: stuSessForm.attachName || '',
    });
    toast('✅ تم تسجيل الجلسة', 'ok');
    setShowStuSess(false);
    reload();
  }

  const selDateStr = selDay ? dateStr(selDay) : null;
  const dayItems = selDay ? itemsOnDay(selDay) : [];
  const intDaysOnSelDay = selDateStr ? getInternationalDaysForDate(selDateStr) : [];

  function openAdoptInternationalDayModal(iday, targetDate) {
    if (!iday) return;
    const evtYear = targetDate ? targetDate.slice(0, 4) : String(new Date().getFullYear());
    setAdoptForm({
      name: `فعالية بمناسبة ${iday.name}`,
      date: targetDate || todayStr(),
      time: '',
      location: iday.suggestedLocation || 'مقر المركز',
      locationType: 'internal',
      academicYear: evtYear,
      targetAudience: iday.targetAudience || 'all',
      supervisorEmpIds: [],
      objectives: iday.objectives || '',
      qualityNotes: `تم تنظيم وتوثيق الفعالية تزامناً مع (${iday.name}) لتحقيق معايير الدمج وتنمية مهارات المستفيدين وفق خطة المركز.`,
      notes: '',
      internationalDayName: iday.name,
      internationalDayIcon: iday.icon || '🌍',
      internationalDayCategory: iday.category || 'awareness',
      internationalDayCategoryLabel: iday.categoryLabel || '',
      suggestedObjectives: iday.objectives || '',
      suggestedLocation: iday.suggestedLocation || '',
    });
    setShowAdoptModal(true);
  }

  function saveAdoptedEvent() {
    if (!adoptForm.name || !adoptForm.name.trim() || !adoptForm.date) {
      toast('⚠️ يرجى كتابة عنوان الفعالية وتحديد تاريخ إقامتها', 'er');
      return;
    }
    const cat = adoptForm.internationalDayCategory === 'holidays'
      ? 'holidays'
      : adoptForm.internationalDayCategory === 'national'
      ? 'national'
      : adoptForm.internationalDayCategory === 'medical'
      ? 'medical'
      : adoptForm.internationalDayCategory === 'education'
      ? 'education'
      : 'awareness';

    const newEvt = {
      id: `evt_${Date.now()}_${uid()}`,
      name: adoptForm.name.trim(),
      category: cat,
      date: adoptForm.date,
      time: adoptForm.time?.trim() || '',
      location: adoptForm.location?.trim() || 'مقر المركز',
      locationType: adoptForm.locationType || 'internal',
      academicYear: adoptForm.academicYear || String(new Date().getFullYear()),
      targetAudience: adoptForm.targetAudience || 'all',
      parentsInvited: true,
      objectives: adoptForm.objectives?.trim() || '',
      qualityNotes: adoptForm.qualityNotes?.trim() || '',
      status: 'upcoming',
      participantStudentIds: [],
      supervisorEmpIds: adoptForm.supervisorEmpIds || [],
      notes: adoptForm.notes?.trim() || ''
    };
    lsAdd('centerEvents', newEvt);
    toast(`🎉 تم اعتماد وتوثيق فعالية (${newEvt.name}) بنجاح وتضمينها بالخطة!`, 'ok');
    setShowAdoptModal(false);
    reload();
  }

  function openEval(d = null) {
    setEvalForm({ childName:'', parentName:'', diagnosis:'', date: d ? dateStr(d) : todayStr(), time:'', notes:'' });
    setShowEval(true);
  }

  function saveEval() {
    if (!evalForm.childName || !evalForm.childName.trim() || !evalForm.date || !evalForm.time) {
      toast('⚠️ أدخل اسم الطفل والموعد والساعة', 'er'); return;
    }
    lsAdd('evaluations', { ...evalForm, id: uid() });
    lsAdd('manualAlerts', {
      id: uid(),
      title: `📋 تذكير: تسجيل بيانات ${evalForm.childName} كاملة`,
      details: `لديه موعد تقييم بتاريخ ${evalForm.date} الساعة ${evalForm.time} — يُنصح بتسجيل بياناته كطالب عند حضور الموعد`,
      date: evalForm.date,
      time: evalForm.time,
      severity: 'warn',
    });
    toast('✅ تم تسجيل موعد التقييم وإضافة تنبيه ذكي', 'ok');
    setShowEval(false);
    reload();
  }
  const fldEv = k => e => setEvalForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    setSelItem(null);
  }, [selDay]);

  const monthSummary = {
    total: allItems.filter(item => item.date && item.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length,
    sessions: allItems.filter(item => item.source === 'جلسة' && item.date && item.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length,
    appointments: allItems.filter(item => item.source === 'موعد' && item.date && item.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length,
    events: allItems.filter(item => item.source === 'تقويم' && item.date && item.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length,
  };

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .calendar-detail-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .calendar-detail-left-panel,
          .calendar-detail-right-panel {
            min-width: 0;
          }
          .calendar-detail-right-panel .wg-b {
            max-height: 280px;
          }
        }
        @media (min-width: 768px) and (max-width: 1120px) {
          .calendar-cell {
            min-height: clamp(48px, 7vh, 76px) !important;
          }
        }
        @media (min-width: 1121px) {
          .calendar-cell {
            min-height: clamp(54px, 6vh, 92px) !important;
          }
        }
        @media (max-width: 767px) {
          .calendar-cell {
            min-height: clamp(44px, 7vh, 58px) !important;
            padding-inline: 3px !important;
          }
          .calendar-cell .calendar-title-chip {
            font-size: 0.46rem !important;
          }
          .calendar-cell .calendar-more {
            font-size: 0.48rem !important;
          }
        }
      `}</style>
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '16px 18px 24px', fontFamily: 'inherit' }}>
      <UnifiedPageHeader
        icon="🗓️"
        title={`تقويم المركز - ${MONTHS_AR[month]} ${year}`}
        subtitle="نظرة زمنية شاملة لجدول المواعيد والجلسات التأهيلية، الأحداث والتقييمات"
        badge={`${monthSummary.total} موعد وحدث`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'var(--bg-card)', padding: 4, borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: 'var(--sh)' }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '6px 10px', color: 'var(--text-main)', fontWeight: 700 }}
                onClick={() => setCur(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
              >
                السابق
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'var(--pr-l)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: 8, padding: '6px 12px', fontWeight: 800, color: 'var(--pr)' }}
                onClick={() => setCur(new Date())}
              >
                اليوم
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '6px 10px', color: 'var(--text-main)', fontWeight: 700 }}
                onClick={() => setCur(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
              >
                التالي
              </button>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-p btn-sm" style={{ borderRadius: 10, padding: '7px 12px' }} onClick={() => openForm()}>
                ➕ حدث عام
              </button>
              <button type="button" className="btn btn-s btn-sm" style={{ borderRadius: 10, padding: '7px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.15)' }} onClick={() => openStuAppt()}>
                📅 موعد طالب
              </button>
              <button type="button" className="btn btn-s btn-sm" style={{ borderRadius: 10, padding: '7px 12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.15)' }} onClick={() => openStuSess()}>
                🩺 جلسة
              </button>
              <button type="button" className="btn btn-sm" style={{ borderRadius: 10, padding: '7px 12px', background: 'rgba(245, 158, 11, 0.09)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.2)' }} onClick={() => openEval()}>
                📋 تقييم
              </button>
            </div>
          </div>
        }
      />

      {/* بطاقات إحصائيات الشهر القياسية */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="unified-stat-box">
          <div className="stat-label">📌 إجمالي الفعاليات</div>
          <div className="stat-val">{monthSummary.total}</div>
          <div className="stat-sub">كافة مواعيد وجلسات الشهر</div>
        </div>
        <div className="unified-stat-box">
          <div className="stat-label">🩺 الجلسات التأهيلية</div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>{monthSummary.sessions}</div>
          <div className="stat-sub">جلسات نطق وعلاج طبيعي ووظيفي</div>
        </div>
        <div className="unified-stat-box">
          <div className="stat-label">📅 مواعيد الطلاب</div>
          <div className="stat-val" style={{ color: 'var(--pr)' }}>{monthSummary.appointments}</div>
          <div className="stat-sub">مواعيد كشف ومراجعات</div>
        </div>
        <div className="unified-stat-box">
          <div className="stat-label">⚡ الفعاليات والأنشطة</div>
          <div className="stat-val" style={{ color: 'var(--warn)' }}>{monthSummary.events}</div>
          <div className="stat-sub">مناسبات وأنشطة المركز</div>
        </div>
      </div>

      {/* دليل ألوان وتصنيفات التقويم المعتمدة */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        background: 'var(--bg-card)',
        padding: '10px 14px',
        borderRadius: 14,
        border: '1px solid var(--border-color)',
        marginBottom: 14,
        fontSize: '.76rem',
        fontWeight: 700
      }}>
        <span style={{ color: 'var(--text-sub)' }}>🎨 دليل وتصنيف المناسبات:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', padding: '3px 8px', borderRadius: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
          <span>🌙 أعياد ومناسبات رسمية</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.12)', color: '#059669', padding: '3px 8px', borderRadius: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
          <span>🇸🇦 مناسبات وأيام وطنية</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', padding: '3px 8px', borderRadius: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
          <span>🩺 الأيام والمجال الطبي</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed', padding: '3px 8px', borderRadius: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }} />
          <span>♿ أيام الإعاقة والتأهيل</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', padding: '3px 8px', borderRadius: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
          <span>🎓 التعليم والتنمية / جلسات</span>
        </div>
      </div>

      <div className="wg" style={{ border: '1px solid var(--border-color)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', background: 'var(--bg-card)' }}>
        <div className="wg-b" style={{ padding: '6px 8px 8px', background: 'var(--bg-card)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 3, marginBottom: 2 }}>
            {DAYS_AR.map(d => (
              <div
                key={d}
                style={{
                  textAlign: 'center',
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  color: 'var(--text-sub)',
                  padding: '2px 0 4px',
                  borderBottom: '1px solid var(--border-color)',
                  letterSpacing: '0.02em',
                  lineHeight: 1
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 3 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} style={{ minHeight: '26px', background: 'rgba(148,163,184,0.04)', borderRadius: 6, opacity: 0.45 }} />;
              const ds = dateStr(d);
              const row = itemsOnDay(d);
              const isToday = ds === today;
              const isSel = d === selDay;

              let cellBg = 'var(--bg-card)';
              let borderStyle = '1px solid var(--border-color)';
              let textWeight = '700';
              let numColor = 'var(--text-main)';

              if (isToday) {
                cellBg = 'rgba(59, 130, 246, 0.11)';
                borderStyle = '1.5px solid rgba(59,130,246,0.7)';
                textWeight = '800';
              } else if (isSel) {
                cellBg = 'rgba(26, 86, 219, 0.12)';
                borderStyle = '1.5px solid var(--pr)';
                textWeight = '800';
              }

              return (
                <button
                  type="button"
                  key={i}
                  className="calendar-cell"
                  onClick={() => {
                    setSelDay(d === selDay ? null : d);
                    setSelItem(null);
                  }}
                  style={{
                    minHeight: 'clamp(44px, 6vh, 80px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'stretch',
                    border: borderStyle,
                    borderRadius: 7,
                    padding: '2px 3px 4px',
                    background: cellBg,
                    cursor: 'pointer',
                    textAlign: 'right',
                    position: 'relative',
                    outline: 'none',
                    transition: 'all 0.16s ease',
                    boxShadow: isToday || isSel ? '0 4px 12px rgba(59,130,246,0.12)' : 'none',
                    lineHeight: 1.1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(15,23,42,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = isToday || isSel ? '0 4px 12px rgba(59,130,246,0.12)' : 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 2 }}>
                    <span style={{
                      fontSize: '0.80rem',
                      fontWeight: textWeight,
                      color: numColor,
                      width: 15,
                      height: 15,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: isToday ? 'rgba(59,130,246,0.16)' : 'transparent',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1
                    }}>
                      {d}
                    </span>
                    {row.length > 0 && (
                      <span style={{ fontSize: '0.49rem', fontWeight: 800, color: 'var(--pr)' }}>●</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 1 }}>
                    {row.slice(0, 1).map(it => {
                      const colorTheme = getColorStyles(it.color);
                      return (
                        <div
                          key={it.id}
                          className="calendar-title-chip"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '2px 4px',
                            borderRadius: 5,
                            background: colorTheme.bg,
                            color: colorTheme.text,
                            fontSize: '0.48rem',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1
                          }}
                          title={it.title}
                        >
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: colorTheme.text, flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {it.title.length > 9 ? `${it.title.slice(0, 9)}…` : it.title}
                          </span>
                        </div>
                      );
                    })}
                    {row.length > 1 && (
                      <div className="calendar-more" style={{ fontSize: '0.51rem', fontWeight: 700, color: 'var(--text-sub)' }}>+{row.length - 1}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selDay && (
        <div className="calendar-detail-layout" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)',
          gap: 16,
          marginTop: 18,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div className="wg calendar-detail-left-panel" style={{ border: '1px solid var(--border-color)', borderRadius: 18, overflow: 'hidden', background: 'var(--bg-card)' }}>
            <div className="wg-h" style={{ borderBottom: '1px solid var(--border-color)', padding: '14px 16px', background: 'linear-gradient(135deg, var(--pr-l), transparent)' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>📌 تفاصيل اليوم</h3>
            </div>
            <div className="wg-b" style={{ padding: 16, background: 'var(--bg-card)' }}>
              {selItem ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: 999, background: 'var(--g0)', color: 'var(--text-main)', fontWeight: 700 }}>
                      {selItem.source}
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: 999, background: 'var(--g0)', color: 'var(--text-main)', fontWeight: 700 }}>
                      {selItem.date}
                    </span>
                  </div>

                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {selItem.title}
                  </h4>

                  {selItem.time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--g0)', padding: '10px 12px', borderRadius: 10 }}>
                      <span style={{ fontSize: '1rem' }}>🕒</span>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{selItem.time}</div>
                    </div>
                  )}

                  {selItem.detail && (
                    <div style={{ background: 'var(--g0)', padding: 12, borderRadius: 12, fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                      {selItem.detail}
                    </div>
                  )}

                  {selItem.isInternationalDay && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-sub)' }}>
                        يمكن للأخصائيين توجيه وتنظيم فعالية خاصة بالمركز مستندة إلى هذه المناسبة وتحديد اسمها وتوقيتها ومكانها وأهدافها:
                      </div>
                      <button
                        type="button"
                        className="btn btn-p btn-sm"
                        style={{ borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        onClick={() => openAdoptInternationalDayModal(selItem.raw, selItem.date)}
                      >
                        <span>🎉</span>
                        <span>توجيه وتنظيم فعالية للمركز</span>
                      </button>
                    </div>
                  )}

                  {selItem.editable && selItem.raw?.id && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                      <button type="button" className="btn btn-g btn-sm" style={{ flex: 1, borderRadius: 10 }} onClick={() => { setForm({ ...selItem.raw }); setEditId(selItem.raw.id); setShowForm(true); }}>
                        ✏️ تعديل
                      </button>
                      <button type="button" className="btn btn-d btn-sm" style={{ flex: 1, borderRadius: 10 }} onClick={() => del(selItem.raw.id)}>
                        🗑️ حذف
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px 30px', color: 'var(--text-sub)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎯</div>
                  <p style={{ margin: 0, fontSize: '0.8rem' }}>اختر عنصرًا من القائمة على اليمين لعرض التفاصيل هنا.</p>
                </div>
              )}
            </div>
          </div>

          <div className="wg calendar-detail-right-panel" style={{ border: '1px solid var(--border-color)', borderRadius: 18, overflow: 'hidden', background: 'var(--bg-card)' }}>
            <div className="wg-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', padding: '14px 16px', background: 'var(--g0)' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                📅 {selDay} {MONTHS_AR[month]}
              </h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="btn btn-p btn-sm" onClick={() => openForm(selDay)} style={{ borderRadius: 8, padding: '6px 10px' }}>➕ عام</button>
                <button type="button" className="btn btn-s btn-sm" onClick={() => openStuAppt(selDay)} style={{ borderRadius: 8, padding: '6px 10px' }}>📅 موعد</button>
              </div>
            </div>

            <div className="wg-b" style={{ padding: 14, maxHeight: 340, overflowY: 'auto', background: 'var(--bg-card)' }}>
              
              {/* International Day Highlight Banner on Selected Day */}
              {intDaysOnSelDay.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginBottom: 12
                }}>
                  {intDaysOnSelDay.map(iday => {
                    const isAdopted = (lsGet('centerEvents') || []).some(e => e.date === selDateStr && (e.name === iday.name || e.name?.includes(iday.name)));
                    const catConfig = OCCASION_CATEGORIES[iday.category] || {};
                    return (
                      <div
                        key={iday.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          background: catConfig.hexBg || 'rgba(99, 102, 241, 0.08)',
                          border: `1.5px solid ${catConfig.hexBorder || 'rgba(99, 102, 241, 0.3)'}`,
                          borderRadius: 12,
                          padding: '12px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '.86rem', color: 'var(--text-main)' }}>
                            <span>{iday.icon}</span>
                            <span>{iday.name}</span>
                          </div>
                          <span style={{ fontSize: '.72rem', background: catConfig.badgeBg || 'rgba(99, 102, 241, 0.18)', color: catConfig.hexText || 'var(--text-main)', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                            {iday.categoryLabel}
                          </span>
                        </div>
                        <div style={{ fontSize: '.76rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                          {iday.objectives}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: '.72rem', color: 'var(--text-sub)' }}>
                            📍 المقترح: {iday.suggestedLocation || 'مقر المركز'}
                          </span>
                          {isAdopted ? (
                            <span style={{ fontSize: '.76rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                              ✅ معتمدة كفعالية للمركز
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-p btn-xs"
                              style={{ borderRadius: 8, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px' }}
                              onClick={() => openAdoptInternationalDayModal(iday, selDateStr)}
                            >
                              <span>🎉</span>
                              <span>توجيه وتنظيم الفعالية</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {dayItems.length === 0 ? (
                <div style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '28px 10px' }}>
                  <p style={{ fontSize: '1.5rem', margin: 0 }}>☕</p>
                  <p style={{ fontSize: '0.8rem', margin: '6px 0 0 0' }}>لا توجد عناصر مجدولة اليوم.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dayItems.map(it => {
                    const colorTheme = getColorStyles(it.color);
                    const isSelected = selItem?.id === it.id;
                    return (
                      <button
                        type="button"
                        key={it.id}
                        onClick={() => setSelItem(it)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'right',
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: isSelected ? '1.5px solid var(--pr)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--pr-l)' : 'var(--bg-card)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{
                            fontSize: '0.62rem',
                            padding: '3px 7px',
                            borderRadius: 999,
                            background: colorTheme.bg,
                            color: colorTheme.text,
                            fontWeight: 800,
                            letterSpacing: '0.02em'
                          }}>
                            {it.source}
                          </span>
                          {it.time && <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>🕐 {it.time}</span>}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-main)' }}>{it.title}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mbg">
          <div className="mb mb-sm" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, background: 'var(--pr)' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.15rem' }}>{editId ? '✏️ تعديل الحدث' : '➕ إضافة حدث جديد'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>عنوان الحدث <span className="req">*</span></label>
                  <input value={form.title} onChange={fld('title')} placeholder="اكتب اسم النشاط أو الحدث..." autoFocus />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>التاريخ <span className="req">*</span></label>
                  <input type="date" value={form.date} onChange={fld('date')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الوقت</label>
                  <input type="time" value={form.time} onChange={fld('time')} />
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700, marginBottom: 6 }}>تصنيف اللون</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {EV_COLORS.map(([c, l, bg, text]) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setForm(f => ({ ...f, color: c }))}
                        style={{
                          padding: '4px 10px',
                          cursor: 'pointer',
                          background: bg,
                          color: text,
                          border: form.color === c ? `2px solid ${text}` : '2px solid transparent',
                          borderRadius: 6,
                          font: 'inherit',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>ملاحظات وتفاصيل</label>
                  <textarea value={form.notes} onChange={fld('notes')} rows={3} placeholder="أي معلومات أو تفاصيل مهمة..." />
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '12px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" onClick={save}>💾 حفظ</button>
              <button type="button" className="btn btn-g" onClick={() => setShowForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showStuAppt && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0 }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>📅 تسجيل موعد مرتبط بطالب</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>اختر الطالب <span className="req">*</span></label>
                  <select value={stuApptForm.stuId} onChange={fldA('stuId')}>
                    <option value="">— ابحث باسم الطالب —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.status === 'waitlist' ? ' ⏱️ (قائمة انتظار)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>مجال أو نوع الموعد <span className="req">*</span></label>
                  <select value={stuApptForm.type} onChange={fldA('type')}>
                    {SESS_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>تاريخ الجلسة / الموعد <span className="req">*</span></label>
                  <input type="date" value={stuApptForm.date} onChange={fldA('date')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>ساعة البدء <span className="req">*</span></label>
                  <input type="time" value={stuApptForm.time} onChange={fldA('time')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الأخصائي المسؤول</label>
                  <select value={stuApptForm.empId} onChange={fldA('empId')}>
                    <option value="">— حدد الأخصائي —</option>
                    {specialists.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>المدة</label>
                  <select value={stuApptForm.duration} onChange={fldA('duration')}>
                    <option>30 دقيقة</option>
                    <option>45 دقيقة</option>
                    <option>60 دقيقة</option>
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الحضور</label>
                  <select value={stuApptForm.mode} onChange={fldA('mode')}>
                    <option value="inperson">حضوري بالمركز</option>
                    <option value="online">أونلاين (عن بعد)</option>
                  </select>
                </div>
                {stuApptForm.mode === 'online' && (
                  <div className="fl full">
                    <label style={{ fontWeight: 700 }}>رابط الغرفة الافتراضية</label>
                    <input type="url" value={stuApptForm.link} onChange={fldA('link')} placeholder="https://..." />
                  </div>
                )}
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>ملاحظات</label>
                  <textarea value={stuApptForm.notes} onChange={fldA('notes')} rows={2} />
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '12px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" onClick={saveStuAppt}>💾 حفظ الموعد</button>
              <button type="button" className="btn btn-g" onClick={() => setShowStuAppt(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showStuSess && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0 }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>🩺 تسجيل جلسة علاجية وتوثيقها</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>الطالب <span className="req">*</span></label>
                  <select value={stuSessForm.stuId} onChange={fldS('stuId')}>
                    <option value="">— اختر الطالب —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.status === 'waitlist' ? ' (انتظار)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>النوع</label>
                  <select value={stuSessForm.type} onChange={fldS('type')}>
                    {SESS_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>التاريخ <span className="req">*</span></label>
                  <input type="date" value={stuSessForm.date} onChange={fldS('date')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الوقت</label>
                  <input type="time" value={stuSessForm.time} onChange={fldS('time')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الأخصائي المنفذ</label>
                  <select value={stuSessForm.empId} onChange={fldS('empId')}>
                    <option value="">— حدد الأخصائي —</option>
                    {specialists.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>المدة الفعالة (دقائق)</label>
                  <input type="number" min={15} value={stuSessForm.duration} onChange={fldS('duration')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>الحالة</label>
                  <select value={stuSessForm.status} onChange={fldS('status')}>
                    <option value="done">✅ تم إنجازها</option>
                    <option value="scheduled">⏳ مجدولة</option>
                  </select>
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>المخرجات والملاحظات السلوكية</label>
                  <textarea value={stuSessForm.notes} onChange={fldS('notes')} rows={2} />
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700, marginBottom: 6 }}>تحميل وثيقة/ملف</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--g0)', padding: 10, borderRadius: 8, border: '1px dashed var(--border-color)' }}>
                    <input type="file" accept="image/*,.pdf" onChange={sessAttach} style={{ border: 'none', background: 'transparent', padding: 0 }} />
                    {stuSessForm.attachName && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--pr)' }}>
                        📎 {stuSessForm.attachName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '12px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" onClick={saveStuSess}>💾 حفظ الجلسة</button>
              <button type="button" className="btn btn-g" onClick={() => setShowStuSess(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showEval && (
        <div className="mbg">
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, background: 'var(--or)' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.15rem' }}>📋 تقييم مستفيد جديد</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '20px' }}>
              <div className="fg c2">
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>اسم الطفل المستهدف <span className="req">*</span></label>
                  <input value={evalForm.childName} onChange={fldEv('childName')} placeholder="الاسم ثلاثي..." />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>اسم ولي الأمر</label>
                  <input value={evalForm.parentName} onChange={fldEv('parentName')} />
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>التشخيص الأولي / الغرض من التقييم</label>
                  <input value={evalForm.diagnosis} onChange={fldEv('diagnosis')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>تاريخ الحضور <span className="req">*</span></label>
                  <input type="date" value={evalForm.date} onChange={fldEv('date')} />
                </div>
                <div className="fl">
                  <label style={{ fontWeight: 700 }}>توقيت المقابلة <span className="req">*</span></label>
                  <input type="time" value={evalForm.time} onChange={fldEv('time')} />
                </div>
                <div className="fl full">
                  <label style={{ fontWeight: 700 }}>ملاحظات أولية</label>
                  <textarea value={evalForm.notes} onChange={fldEv('notes')} rows={3} />
                </div>
              </div>
            </div>
            <div className="fa" style={{ padding: '12px 20px', background: 'var(--g0)' }}>
              <button type="button" className="btn btn-p" style={{ background: 'var(--or)', borderColor: 'var(--or)' }} onClick={saveEval}>💾 تسجيل موعد التقييم</button>
              <button type="button" className="btn btn-g" onClick={() => setShowEval(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Specialist-directed International Day Center Event Adoption */}
      {showAdoptModal && (
        <div className="mbg">
          <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '16px 20px', borderRadius: 0, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <div>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{adoptForm.internationalDayIcon || '🌍'}</span>
                  <span>توجيه وتنظيم فعالية للمركز مستندة لمناسبة عالمية</span>
                </h2>
                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '.78rem' }}>
                  تحديد اسم الفعالية وموعدها ومكانها وأهدافها الخاصة بتوجيه من إدارة المركز والأخصائيين
                </p>
              </div>
            </div>

            <div className="modal-body-scroll" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Inspiration Reference Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))',
                border: '1.5px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: '.86rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>💡 المناسبة المستند إليها كدليل استرشادي:</span>
                    <strong style={{ color: 'var(--pr)' }}>{adoptForm.internationalDayName}</strong>
                  </span>
                  {adoptForm.internationalDayCategoryLabel && (
                    <span style={{ fontSize: '.72rem', background: 'var(--pr-l)', color: 'var(--pr)', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                      {adoptForm.internationalDayCategoryLabel}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  المعلومات التالية قابلة للتخصيص الكامل من قبل الأخصائيين لاختيار عنوان الفعالية الأنسب للمركز ومكانها وتوقيتها وأهدافها المحددة.
                </div>
              </div>

              {/* Form Fields */}
              <div className="fg c2">
                <div className="fl full">
                  <label style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text-main)' }}>
                    عنوان الفعالية المعتمد بالمركز <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    value={adoptForm.name}
                    onChange={e => setAdoptForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="اكتب اسم أو عنوان الفعالية الخاص بالمركز (مثال: مهرجان أبطال التحدي بمناسبة...)"
                    style={{ background: 'var(--bg-input)', fontWeight: 600 }}
                    autoFocus
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text-main)' }}>
                    تاريخ إقامة الفعالية <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    value={adoptForm.date}
                    onChange={e => setAdoptForm(f => ({ ...f, date: e.target.value }))}
                    style={{ background: 'var(--bg-input)' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text-main)' }}>
                    توقيت وساعات الفعالية
                  </label>
                  <input
                    type="text"
                    value={adoptForm.time}
                    onChange={e => setAdoptForm(f => ({ ...f, time: e.target.value }))}
                    placeholder="مثال: 09:30 ص - 12:00 م"
                    style={{ background: 'var(--bg-input)' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text-main)' }}>
                    مكان إقامة الفعالية بالمركز / خارجه
                  </label>
                  <input
                    type="text"
                    value={adoptForm.location}
                    onChange={e => setAdoptForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="مثال: الصالة متعددة الأغراض، المسرح، حديقة المركز..."
                    style={{ background: 'var(--bg-input)' }}
                  />
                </div>

                <div className="fl">
                  <label style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text-main)' }}>
                    نوع الموقع
                  </label>
                  <select
                    value={adoptForm.locationType}
                    onChange={e => setAdoptForm(f => ({ ...f, locationType: e.target.value }))}
                    style={{ background: 'var(--bg-input)' }}
                  >
                    <option value="internal">داخلي (ضمن مرافق المركز)</option>
                    <option value="external">خارجي (ميداني / مجتمعي)</option>
                  </select>
                </div>

                <div className="fl full">
                  <label style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text-main)' }}>
                    الفئة المستهدفة من الفعالية
                  </label>
                  <select
                    value={adoptForm.targetAudience}
                    onChange={e => setAdoptForm(f => ({ ...f, targetAudience: e.target.value }))}
                    style={{ background: 'var(--bg-input)' }}
                  >
                    <option value="all">جميع المستفيدين والطلاب</option>
                    <option value="autism">مستفيدي طيف التوحد</option>
                    <option value="down">مستفيدي متلازمة داون</option>
                    <option value="cp">مستفيدي الشلل الدماغي والإعاقات الحركية</option>
                    <option value="parents">أولياء الأمور والأسر</option>
                    <option value="specialists">الكادر التعليمي والتأهيلي</option>
                    <option value="community">المجتمع المحلي والشركاء</option>
                  </select>
                </div>

                <div className="fl full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text-main)' }}>
                      الأهداف التأهيلية والتربوية الموجهة من الأخصائيين
                    </label>
                    {adoptForm.suggestedObjectives && (
                      <button
                        type="button"
                        className="btn btn-xs btn-g"
                        style={{ fontSize: '.72rem', borderRadius: 6, padding: '2px 8px' }}
                        onClick={() => setAdoptForm(f => ({ ...f, objectives: f.suggestedObjectives }))}
                      >
                        💡 استعادة الأهداف المقترحة استرشادياً
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={adoptForm.objectives}
                    onChange={e => setAdoptForm(f => ({ ...f, objectives: e.target.value }))}
                    placeholder="اكتب أهداف الفعالية المحددة من قبل الفريق التأهيلي والمخرجات المرجوة..."
                    style={{ background: 'var(--bg-input)', lineHeight: 1.6 }}
                  />
                </div>

                <div className="fl full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text-main)', margin: 0 }}>
                      👥 المشرفون والمنسقون من الكادر ({adoptForm.supervisorEmpIds.length} محددين)
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-xs btn-g"
                        style={{ fontSize: '.72rem', padding: '2px 8px', borderRadius: 6 }}
                        onClick={() => {
                          const allIds = specialists.map(sp => sp.id);
                          setAdoptForm(f => ({ ...f, supervisorEmpIds: allIds }));
                        }}
                      >
                        تحديد الكل
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-g"
                        style={{ fontSize: '.72rem', padding: '2px 8px', borderRadius: 6 }}
                        onClick={() => setAdoptForm(f => ({ ...f, supervisorEmpIds: [] }))}
                      >
                        إلغاء التحديد
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      maxHeight: 160,
                      overflowY: 'auto',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                      gap: 6,
                    }}
                  >
                    {specialists.length === 0 ? (
                      <div style={{ fontSize: '.78rem', color: 'var(--text-sub)', padding: 8 }}>
                        لا يوجد موظفون أو أخصائيون مضافون حالياً
                      </div>
                    ) : (
                      specialists.map(sp => {
                        const isChecked = adoptForm.supervisorEmpIds.includes(sp.id);
                        return (
                          <label
                            key={sp.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '6px 10px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              background: isChecked ? 'var(--pr-l)' : 'var(--bg-card)',
                              border: isChecked ? '1px solid var(--pr)' : '1px solid var(--border-color)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                const checked = e.target.checked;
                                setAdoptForm(f => ({
                                  ...f,
                                  supervisorEmpIds: checked
                                    ? [...f.supervisorEmpIds, sp.id]
                                    : f.supervisorEmpIds.filter(id => id !== sp.id),
                                }));
                              }}
                              style={{
                                width: 16,
                                height: 16,
                                accentColor: 'var(--pr)',
                                cursor: 'pointer',
                              }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sp.name}
                              </span>
                              <span style={{ fontSize: '.70rem', color: 'var(--text-sub)' }}>
                                {sp.role}
                              </span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <small style={{ fontSize: '.72rem', color: 'var(--text-sub)', marginTop: 4, display: 'block' }}>
                    قم بوضع علامة (✓) أمام كل أخصائي أو مشرف ترغب بإسناد مهام تنظيم وتوجيه الفعالية إليه.
                  </small>
                </div>

                <div className="fl full">
                  <label style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--text-main)' }}>
                    ملاحظات وتوجيهات تنظيمية
                  </label>
                  <textarea
                    rows={2}
                    value={adoptForm.notes}
                    onChange={e => setAdoptForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="أي ترتيبات لوجستية أو ملاحظات إضافية خاصة بالمؤسسة..."
                    style={{ background: 'var(--bg-input)' }}
                  />
                </div>
              </div>
            </div>

            <div className="fa" style={{ padding: '12px 20px', background: 'var(--g0)' }}>
              <button
                type="button"
                className="btn btn-p"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderColor: '#4f46e5', fontWeight: 700 }}
                onClick={saveAdoptedEvent}
              >
                💾 حفظ واعتماد الفعالية في الخطة والتقويم
              </button>
              <button
                type="button"
                className="btn btn-g"
                onClick={() => setShowAdoptModal(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
