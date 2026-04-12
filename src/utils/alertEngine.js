import { lsGet } from '../hooks/useStorage';
import { todayStr, addDays, daysFromToday, daysUntilDate, nextAnnualOccurrenceDate } from './dateHelpers';

function monthKey(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function isEvalType(type) {
  const t = (type || '').toLowerCase();
  return t.includes('تقييم') || t.includes('evaluation') || t.includes('assessment');
}

/**
 * @returns {{ id: string, category: string, severity: 'urgent'|'warn'|'info', title: string, detail?: string, action?: string }[]}
 */
export function collectSystemAlerts() {
  const today = todayStr();
  const tomorrow = addDays(today, 1);
  const in7 = addDays(today, 7);
  const alerts = [];

  const students = lsGet('students');
  const emps = lsGet('employees');
  const sessions = lsGet('sessions');
  const appts = lsGet('appointments');
  const attStu = lsGet('attStu');
  const attEmp = lsGet('attEmp');
  const leaves = lsGet('leaves');
  const iepGoals = lsGet('iepGoals');
  const salaries = lsGet('salaries');
  const mk = monthKey();
  const activities = lsGet('centerActivities');
  const manual = lsGet('manualAlerts');

  const stuMap = Object.fromEntries(students.map(s => [s.id, s]));
  const empMap = Object.fromEntries(emps.map(e => [e.id, e]));

  // 1) Sessions today / tomorrow
  const sessSoon = sessions.filter(s => s.date === today || s.date === tomorrow);
  sessSoon.forEach(s => {
    const st = stuMap[s.stuId];
    const when = s.date === today ? 'اليوم' : 'غداً';
    alerts.push({
      id: `sess-${s.id}`,
      category: 'الجلسات',
      severity: s.date === today ? 'urgent' : 'warn',
      title: `${when}: جلسة ${s.type || ''} — ${st?.name || 'طالب'}`,
      detail: [s.time, s.notes].filter(Boolean).join(' · ') || undefined,
      action: 'sessions',
    });
  });

  // 2) Evaluations (appointments typed as evaluation)
  appts
    .filter(a => isEvalType(a.type) && (a.date === today || a.date === tomorrow))
    .forEach(a => {
      const st = stuMap[a.stuId];
      const when = a.date === today ? 'اليوم' : 'غداً';
      alerts.push({
        id: `eval-${a.id}`,
        category: 'التقييمات',
        severity: 'warn',
        title: `${when}: موعد تقييم — ${st?.name || 'طالب'}`,
        detail: [a.type, a.time, a.notes].filter(Boolean).join(' · '),
        action: 'students',
      });
    });

  // Incomplete data: attended session program today but session log incomplete
  const presentToday = attStu.filter(a => a.date === today && a.status === 'present' && a.session === 'sessions');
  const warnedIncomplete = new Set();
  presentToday.forEach(a => {
    if (warnedIncomplete.has(a.kidId)) return;
    const logsToday = sessions.filter(s => s.stuId === a.kidId && s.date === today && s.status === 'done');
    const incomplete = logsToday.length === 0 || logsToday.some(s => !(String(s.goals || '').trim() || String(s.notes || '').trim()));
    if (!incomplete) return;
    warnedIncomplete.add(a.kidId);
    const st = stuMap[a.kidId];
    alerts.push({
      id: `incomp-${a.kidId}-${today}`,
      category: 'التقييمات',
      severity: 'info',
      title: `متابعة بيانات جلسة — ${st?.name || 'طالب'}`,
      detail: 'حضر الطالب ويُنصح بإكمال محتوى/ملاحظات الجلسة.',
      action: 'students',
    });
  });

  // 3) Absent students today
  attStu
    .filter(a => a.date === today && a.status === 'absent')
    .forEach(a => {
      const st = stuMap[a.kidId];
      alerts.push({
        id: `abs-${a.id || a.kidId}`,
        category: 'غياب الطلاب',
        severity: 'warn',
        title: `غائب اليوم — ${st?.name || 'طالب'}`,
        detail: a.session === 'morning' ? 'صباحي' : a.session === 'evening' ? 'مسائي' : 'جلسات',
        action: 'attendance',
      });
    });

  // 4) IEP reviews within 7 days
  iepGoals.forEach(g => {
    if (!g.review) return;
    const df = daysFromToday(g.review);
    if (df >= 0 && df <= 7) {
      const st = stuMap[g.stuId];
      alerts.push({
        id: `iep-${g.id}`,
        category: 'مراجعة IEP',
        severity: df <= 3 ? 'urgent' : 'warn',
        title: `مراجعة هدف خلال ${df === 0 ? 'اليوم' : df + ' يوم'} — ${st?.name || 'طالب'}`,
        detail: `${g.domain || ''} — ${(g.goal || '').slice(0, 80)}${(g.goal || '').length > 80 ? '…' : ''}`,
        action: 'students',
      });
    }
  });

  // 5) Pending leaves
  leaves
    .filter(l => l.status === 'pending')
    .forEach(l => {
      const e = empMap[l.empId];
      alerts.push({
        id: `leave-${l.id}`,
        category: 'إجازات الموظفين',
        severity: 'warn',
        title: `طلب إجازة بانتظار الموافقة — ${e?.name || 'موظف'}`,
        detail: `${l.type || ''} · ${l.from} → ${l.to}`,
        action: 'hr-leaves',
      });
    });

  // 6) Waitlist
  const wl = students.filter(s => s.status === 'waitlist').length;
  if (wl > 0) {
    alerts.push({
      id: 'waitlist',
      category: 'قائمة الانتظار',
      severity: 'info',
      title: `${wl} طالب في قائمة الانتظار`,
      action: 'students',
    });
  }

  // 7) Salaries unpaid this month — يظهر من بداية يوم 26 من كل شهر
  const dayOfMonth = new Date().getDate();
  if (dayOfMonth >= 26) {
    const unpaid = emps.filter(e => {
      const sal = salaries.find(s => s.empId === e.id && s.month === mk);
      return !sal || sal.status !== 'paid';
    });
    if (emps.length && unpaid.length) {
      alerts.push({
        id: 'salary-month',
        category: 'الرواتب',
        severity: unpaid.length > emps.length * 0.3 ? 'urgent' : 'warn',
        title: `${unpaid.length} موظف لم يُصرف راتبه هذا الشهر`,
        detail: 'راجع قسم المالية ← الرواتب',
        action: 'hr-salary',
      });
    }
  }

  // 8) Contracts ending
  emps.forEach(e => {
    if (!e.contractEnd) return;
    const days = daysUntilDate(new Date(e.contractEnd + 'T12:00:00'));
    if (days == null || days < 0 || days > 30) return;
    alerts.push({
      id: `contract-${e.id}`,
      category: 'عقود الموظفين',
      severity: days <= 7 ? 'urgent' : 'warn',
      title: `عقد ينتهي خلال ${days} يوم — ${e.name}`,
      detail: `انتهاء العقد: ${e.contractEnd}`,
      action: 'hr',
    });
  });

  // 9) Birthdays — students & employees
  const bPeople = [];
  students.forEach(s => {
    const nd = nextAnnualOccurrenceDate(s.dob);
    const d = daysUntilDate(nd);
    if (d != null && d >= 0 && d <= 7) bPeople.push({ name: s.name, d, kind: 'طالب' });
  });
  emps.forEach(e => {
    const nd = nextAnnualOccurrenceDate(e.dob);
    const d = daysUntilDate(nd);
    if (d != null && d >= 0 && d <= 7) bPeople.push({ name: e.name, d, kind: 'موظف' });
  });
  bPeople.sort((a, b) => a.d - b.d).forEach((x, i) => {
    alerts.push({
      id: `bday-${i}-${x.name}`,
      category: 'أعياد الميلاد',
      severity: x.d === 0 ? 'urgent' : 'info',
      title: `${x.d === 0 ? '🎂 اليوم' : x.d === 1 ? 'غداً' : `خلال ${x.d} يوم`} — ${x.name} (${x.kind})`,
      action: x.kind === 'طالب' ? 'students' : 'hr',
    });
  });

  const curMonth = new Date().getMonth();
  const monthEmps = emps.filter(e => {
    if (!e.dob || e.dob.length < 10) return false;
    const mm = parseInt(e.dob.split('-')[1], 10) - 1;
    return mm === curMonth;
  });
  if (monthEmps.length) {
    alerts.push({
      id: 'bday-month-emp',
      category: 'أعياد الميلاد',
      severity: 'info',
      title: `أعياد ميلاد موظفين هذا الشهر (${monthEmps.length})`,
      detail: monthEmps.map(e => e.name).join('، '),
      action: 'hr',
    });
  }

  // Employee attendance not registered today
  if (emps.length) {
    const marked = new Set(attEmp.filter(a => a.date === today).map(a => a.empId));
    if (marked.size === 0) {
      alerts.push({
        id: 'hr-att-none',
        category: 'حضور الموظفين',
        severity: 'warn',
        title: 'لم يُسجَّل حضور الموظفين اليوم',
        detail: 'افتح الحضور الشهري للموظفين أو الحضور السريع حسب إجراءاتكم.',
        action: 'hr-att',
      });
    }
  }

  // Upcoming appointments (non-eval) today / tomorrow
  appts
    .filter(a => !isEvalType(a.type) && (a.date === today || a.date === tomorrow))
    .forEach(a => {
      const st = stuMap[a.stuId];
      const when = a.date === today ? 'اليوم' : 'غداً';
      alerts.push({
        id: `appt-${a.id}`,
        category: 'المواعيد',
        severity: 'info',
        title: `${when}: ${a.type} — ${st?.name || 'طالب'}`,
        detail: [a.time, a.notes].filter(Boolean).join(' · '),
        action: 'calendar',
      });
    });

  // Activities (events) soon
  activities
    .filter(act => act.date && (act.date === today || act.date === tomorrow || (act.date >= today && act.date <= in7)))
    .forEach(act => {
      alerts.push({
        id: `act-${act.id}`,
        category: 'الفعاليات',
        severity: act.date === today ? 'urgent' : 'info',
        title: `نشاط: ${act.name} — ${act.date}`,
        detail: act.notes,
        action: 'programs',
      });
    });

  // Manual alerts (stored)
  manual.forEach(m => {
    if (!m.date) return;
    const df = daysFromToday(m.date);
    if (df < -1) return;
    const sevMap = { urgent: 'urgent', تحذير: 'warn', warning: 'warn', معلومة: 'info', info: 'info' };
    alerts.push({
      id: `man-${m.id}`,
      category: 'تنبيه يدوي',
      severity: sevMap[m.severity] || 'info',
      title: m.title || 'تنبيه',
      detail: [m.details, m.time && `الوقت: ${m.time}`].filter(Boolean).join(' · '),
      action: 'dash',
    });
  });

  const order = { urgent: 0, warn: 1, info: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);
  return alerts;
}
