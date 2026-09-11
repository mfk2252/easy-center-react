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
        .cal-page-wrapper {
          max-width: 1240px;
          margin: 0 auto;
          padding: 16px 14px 32px;
          font-family: inherit;
        }
        .cal-main-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (min-width: 960px) {
          .cal-main-layout {
            grid-template-columns: 390px minmax(0, 1fr);
          }
        }
        .cal-widget-box {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          padding: 18px 16px 20px;
          max-width: 420px;
          margin: 0 auto;
          width: 100%;
        }
        .cal-legend-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid var(--border-color);
        }
        .cal-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
        }
        .cal-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .cal-month-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 14px;
        }
        .cal-month-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--text-main);
          margin: 0;
          letter-spacing: -0.01em;
          text-align: center;
        }
        .cal-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cal-nav-btn:hover {
          background: var(--pr-l);
          color: var(--pr);
          border-color: var(--pr);
          transform: scale(1.06);
        }
        .cal-weekdays-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          margin-bottom: 8px;
          text-align: center;
        }
        .cal-weekday-label {
          font-size: 0.82rem;
          font-weight: 800;
          color: #0284c7;
          padding: 4px 0;
        }
        .cal-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          text-align: center;
        }
        .cal-day-cell {
          height: 44px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          background: transparent;
          border: none;
          cursor: pointer;
          outline: none;
          padding: 0;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .cal-day-cell.disabled {
          cursor: default;
          opacity: 0.2;
        }
        .cal-day-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-main);
          transition: all 0.16s ease;
          position: relative;
        }
        .cal-day-cell:hover:not(.disabled) .cal-day-circle {
          transform: scale(1.1);
          background: var(--g0);
        }
        /* States matching the uploaded design */
        .cal-day-circle.selected-yellow {
          background: #facc15 !important;
          color: #1e293b !important;
          font-weight: 900 !important;
          box-shadow: 0 4px 12px rgba(250, 204, 21, 0.45);
        }
        .cal-day-circle.circle-dark {
          background: #334155 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 10px rgba(51, 65, 85, 0.3);
        }
        .cal-day-circle.circle-cyan {
          background: #06b6d4 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 10px rgba(6, 182, 212, 0.35);
        }
        .cal-day-circle.circle-purple {
          background: #8b5cf6 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 10px rgba(139, 92, 246, 0.35);
        }
        .cal-day-circle.circle-today {
          border: 2px solid #0284c7;
          color: #0284c7;
          font-weight: 800;
        }
        .cal-dots-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          position: absolute;
          bottom: 1px;
          left: 0;
          right: 0;
        }
        .cal-mini-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
        }
        .cal-detail-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          overflow: hidden;
          width: 100%;
        }
        .cal-detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
        }
      `}</style>
    <div className="cal-page-wrapper">
      <UnifiedPageHeader
        icon="🗓️"
        title={`تقويم المركز - ${MONTHS_AR[month]} ${year}`}
        subtitle="نظرة زمنية شاملة لجدول المواعيد والجلسات التأهيلية، الأحداث والتقييمات"
        badge={`${monthSummary.total} موعد وحدث`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
        }
      />

      {/* بطاقات الإحصائيات السريعة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        <div className="unified-stat-box">
          <div className="stat-label">📌 إجمالي الفعاليات</div>
          <div className="stat-val">{monthSummary.total}</div>
          <div className="stat-sub">كافة مواعيد الشهر</div>
        </div>
        <div className="unified-stat-box">
          <div className="stat-label">🩺 الجلسات التأهيلية</div>
          <div className="stat-val" style={{ color: 'var(--ok)' }}>{monthSummary.sessions}</div>
          <div className="stat-sub">جلسات نطق وتأهيل</div>
        </div>
        <div className="unified-stat-box">
          <div className="stat-label">📅 مواعيد الطلاب</div>
          <div className="stat-val" style={{ color: 'var(--pr)' }}>{monthSummary.appointments}</div>
          <div className="stat-sub">كشف ومراجعات</div>
        </div>
        <div className="unified-stat-box">
          <div className="stat-label">⚡ الفعاليات والأنشطة</div>
          <div className="stat-val" style={{ color: 'var(--warn)' }}>{monthSummary.events}</div>
          <div className="stat-sub">مناسبات وأنشطة</div>
        </div>
      </div>

      {/* المحتوى الرئيسي: عمودين متوازنين (التقويم المدمج الأنيق + تفاصيل اليوم) */}
      <div className="cal-main-layout">
        {/* حاوية التقويم المصغر والأنيق المطابق للتصميم تماماً */}
        <div className="cal-widget-box">
          {/* دليل الألوان والمؤشرات بالأعلى كما بالصورة */}
          <div className="cal-legend-bar">
            <div className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: '#facc15' }} />
              <span>صباحي</span>
            </div>
            <div className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: '#334155' }} />
              <span>مسائي</span>
            </div>
            <div className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: '#06b6d4' }} />
              <span>فعاليات</span>
            </div>
            <div className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: '#8b5cf6' }} />
              <span>أيام عالمية</span>
            </div>
          </div>

          {/* رأس الشهر مع أسهم التنقل في المنتصف كما بالصورة */}
          <div className="cal-month-header">
            <button
              type="button"
              className="cal-nav-btn"
              onClick={() => setCur(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
              title="الشهر السابق"
            >
              ›
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <h2 className="cal-month-title">
                {MONTHS_AR[month]} {year}
              </h2>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setCur(now);
                  setSelDay(now.getDate());
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: '1px 6px',
                  borderRadius: 4
                }}
              >
                الرجوع لليوم الحالي
              </button>
            </div>
            <button
              type="button"
              className="cal-nav-btn"
              onClick={() => setCur(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
              title="الشهر التالي"
            >
              ‹
            </button>
          </div>

          {/* عناوين أيام الأسبوع باللون الأزرق / السماوي الأنيق */}
          <div className="cal-weekdays-grid">
            {DAYS_AR.map(d => (
              <div key={d} className="cal-weekday-label">
                {d}
              </div>
            ))}
          </div>

          {/* شبكة الأرقام والدوائر المتطابقة مع الصورة بحجم منسق ودقيق */}
          <div className="cal-days-grid">
            {cells.map((d, i) => {
              if (!d) {
                return <div key={i} className="cal-day-cell disabled" />;
              }
              const ds = dateStr(d);
              const row = itemsOnDay(d);
              const isToday = ds === today;
              const isSel = d === (selDay || (new Date().getMonth() === month && new Date().getFullYear() === year ? new Date().getDate() : null));

              // Determine circle style matching design in screenshot
              const hasMorning = row.some(it => it.time && it.time < '13:00');
              const hasEvening = row.some(it => it.time && it.time >= '13:00');
              const hasIntDay = row.some(it => it.isInternationalDay);
              const hasCenterEvent = row.some(it => it.isCenterEvent || it.source === 'فعالية');

              let circleClass = '';
              if (isSel) {
                circleClass = 'selected-yellow'; // Solid Yellow circle like 31 in image
              } else if (hasEvening) {
                circleClass = 'circle-dark'; // Dark slate circle like 28 in image
              } else if (hasCenterEvent) {
                circleClass = 'circle-cyan'; // Cyan circle
              } else if (hasIntDay) {
                circleClass = 'circle-purple'; // Purple circle
              } else if (isToday) {
                circleClass = 'circle-today'; // Today outlined
              }

              return (
                <button
                  type="button"
                  key={i}
                  className="cal-day-cell"
                  onClick={() => {
                    setSelDay(d);
                    setSelItem(null);
                  }}
                >
                  <div className={`cal-day-circle ${circleClass}`}>
                    {d}
                  </div>

                  {/* مؤشرات النقاط الصغيرة أسفل اليوم */}
                  {row.length > 0 && !isSel && (
                    <div className="cal-dots-row">
                      {hasMorning && <span className="cal-mini-dot" style={{ background: '#facc15' }} />}
                      {hasEvening && <span className="cal-mini-dot" style={{ background: '#334155' }} />}
                      {hasCenterEvent && <span className="cal-mini-dot" style={{ background: '#06b6d4' }} />}
                      {hasIntDay && <span className="cal-mini-dot" style={{ background: '#8b5cf6' }} />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* لوحة تفاصيل اليوم المختار مثل الجزء السفلي في صورة العميل تماماً */}
        <div className="cal-detail-card">
          {/* ترويسة الفترة مع أيقونة الهلال / الشمس والتوقيت */}
          <div style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border-color)',
            background: 'linear-gradient(135deg, var(--bg-card), var(--bg-main))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.8rem' }}>
                  {dayItems.some(i => i.time && i.time >= '13:00') ? '🌙' : '☀️'}
                </span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    {dayItems.some(i => i.time && i.time >= '13:00') ? 'الفترة المسائية' : 'الفترة الصباحية والدوام'}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0284c7', marginTop: 2 }}>
                    {dayItems[0]?.time ? `${dayItems[0].time}` : '08:00 صباحاً - 04:00 مساءً'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-p btn-xs" onClick={() => openStuAppt(selDay || 1)} style={{ borderRadius: 8, padding: '5px 10px' }}>
                  📅 موعد جديد
                </button>
                <button type="button" className="btn btn-s btn-xs" onClick={() => openStuSess(selDay || 1)} style={{ borderRadius: 8, padding: '5px 10px' }}>
                  🩺 جلسة جديدة
                </button>
                <button type="button" className="btn btn-g btn-xs" onClick={() => openForm(selDay || 1)} style={{ borderRadius: 8, padding: '5px 10px' }}>
                  ➕ حدث
                </button>
              </div>
            </div>
          </div>

          {/* صفوف التفاصيل والأوقات المعتمدة (مثل جدول الدخول والخروج في الصورة) */}
          <div style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="cal-detail-row" style={{ borderBottom: '1px dashed var(--border-color)', padding: '10px 18px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>وقت بدء النشاط والجلسات (الدخول):</span>
              <span style={{ fontWeight: 900, color: '#0284c7', fontSize: '0.96rem', direction: 'ltr' }}>08:00 صباحاً</span>
            </div>
            <div className="cal-detail-row" style={{ borderBottom: '1px dashed var(--border-color)', padding: '10px 18px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>وقت انتهاء النشاط والجلسات (الخروج):</span>
              <span style={{ fontWeight: 900, color: '#0284c7', fontSize: '0.96rem', direction: 'ltr' }}>04:00 مساءً</span>
            </div>
            <div className="cal-detail-row" style={{ padding: '10px 18px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>تاريخ اليوم المعروض:</span>
              <span style={{ fontWeight: 800, color: 'var(--text-sub)', fontSize: '0.88rem' }}>
                {selDay || (new Date().getDate())} {MONTHS_AR[month]} {year}
              </span>
            </div>
          </div>

          {/* مناسبات وأيام عالمية مسجلة في هذا اليوم إن وجدت */}
          {intDaysOnSelDay.length > 0 && (
            <div style={{ padding: '14px 18px', background: 'rgba(139, 92, 246, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '.84rem', color: '#7c3aed', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🌍</span>
                <span>المناسبات والأيام العالمية المعتمدة لليوم</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {intDaysOnSelDay.map(iday => {
                  const isAdopted = (lsGet('centerEvents') || []).some(e => e.date === selDateStr && (e.name === iday.name || e.name?.includes(iday.name)));
                  return (
                    <div
                      key={iday.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(139, 92, 246, 0.25)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 6
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '.86rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{iday.icon}</span>
                          <span>{iday.name}</span>
                          <span style={{ fontSize: '.68rem', background: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed', padding: '1px 6px', borderRadius: 999 }}>
                            {iday.categoryLabel}
                          </span>
                        </div>
                        <div style={{ fontSize: '.74rem', color: 'var(--text-sub)', marginTop: 2 }}>
                          {iday.objectives}
                        </div>
                      </div>

                      {isAdopted ? (
                        <span style={{ fontSize: '.76rem', fontWeight: 800, color: '#16a34a' }}>
                          ✅ تم الاعتماد
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-p btn-xs"
                          style={{ borderRadius: 6, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', padding: '4px 8px' }}
                          onClick={() => openAdoptInternationalDayModal(iday, selDateStr)}
                        >
                          🎉 تنظيم فعالية
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* قائمة المواعيد والجلسات المجدولة لليوم */}
          <div style={{ padding: '14px 18px 18px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📋</span>
              <span>المواعيد والأنشطة المجدولة ({dayItems.length})</span>
            </div>

            {dayItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-sub)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>☕</div>
                <div style={{ fontSize: '0.8rem' }}>لا توجد فعاليات أو مواعيد مجدولة لهذا اليوم. يمكنك إضافة موعد أو جلسة بالأزرار أعلاه.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                {dayItems.map(it => {
                  const colorTheme = getColorStyles(it.color);
                  const isSelected = selItem?.id === it.id;
                  return (
                    <div
                      key={it.id}
                      onClick={() => setSelItem(it)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: isSelected ? '1.5px solid var(--pr)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--pr-l)' : 'var(--bg-main)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 6
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{
                            fontSize: '0.66rem',
                            padding: '2px 7px',
                            borderRadius: 999,
                            background: colorTheme.bg,
                            color: colorTheme.text,
                            fontWeight: 800
                          }}>
                            {it.source}
                          </span>
                          {it.time && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-sub)' }}>🕒 {it.time}</span>}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
                          {it.title}
                        </div>
                        {it.detail && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: 2, lineHeight: 1.3 }}>
                            {it.detail}
                          </div>
                        )}
                      </div>

                      {it.editable && it.raw?.id && (
                        <div style={{ display: 'flex', gap: 6, paddingTop: 4, borderTop: '1px solid var(--border-color)' }}>
                          <button
                            type="button"
                            className="btn btn-g btn-xs"
                            style={{ flex: 1, borderRadius: 6, padding: '3px 6px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm({ ...it.raw });
                              setEditId(it.raw.id);
                              setShowForm(true);
                            }}
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            type="button"
                            className="btn btn-d btn-xs"
                            style={{ flex: 1, borderRadius: 6, padding: '3px 6px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              del(it.raw.id);
                            }}
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

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
