import { lsGet, lsAdd, lsUpd } from '../hooks/useStorage';
import { todayStr, addDays, daysFromToday, daysUntilDate, nextAnnualOccurrenceDate, uid } from '../utils/dateHelpers';

/**
 * دالة مساعدة لتحديد مفتاح التخزين الخاص بقائمة الإشعارات المقروءة للمستخدم
 */
function getReadNotifsKey(user) {
  const cId = user?.centerId || 'default';
  const uId = user?.uid || user?.id || user?.username || 'user';
  return `scs_read_notifs_${cId}_${uId}`;
}

/**
 * استرجاع معرّفات الإشعارات المقروءة
 */
export function getReadNotifIds(user) {
  try {
    const raw = localStorage.getItem(getReadNotifsKey(user));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * تحديد إشعار واحد كمقروء
 */
export function markNotifAsRead(notifId, user) {
  if (!notifId) return;
  try {
    const readIds = getReadNotifIds(user);
    if (!readIds.includes(notifId)) {
      readIds.push(notifId);
      localStorage.setItem(getReadNotifsKey(user), JSON.stringify(readIds));
    }
  } catch (e) {
    console.warn('markNotifAsRead error:', e);
  }
}

/**
 * تحديد قائمة إشعارات كمقروءة دفعة واحدة
 */
export function markAllNotifsAsRead(notifIds, user) {
  if (!Array.isArray(notifIds) || notifIds.length === 0) return;
  try {
    const readIds = getReadNotifIds(user);
    const set = new Set([...readIds, ...notifIds]);
    localStorage.setItem(getReadNotifsKey(user), JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('markAllNotifsAsRead error:', e);
  }
}

/**
 * مسح سجل المقروءات / إعادة تعيين
 */
export function clearAllReadNotifs(user) {
  try {
    localStorage.removeItem(getReadNotifsKey(user));
  } catch (e) {}
}

/**
 * إرسال / إضافة إشعار نظام جديد إلى قاعدة البيانات
 */
export function pushSystemNotification(centerId, notification) {
  const notif = {
    id: notification.id || uid(),
    title: notification.title || 'إشعار جديد',
    details: notification.details || '',
    category: notification.category || 'general',
    severity: notification.severity || 'info', // urgent | warn | info | success
    actionView: notification.actionView || 'dash',
    actionTab: notification.actionTab || '',
    targetRoles: notification.targetRoles || ['all'],
    targetUserId: notification.targetUserId || null,
    date: notification.date || todayStr(),
    time: notification.time || new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
  };

  try {
    lsAdd('notifs', notif);
  } catch (e) {
    console.warn('pushSystemNotification error:', e);
  }
  return notif;
}

/**
 * حساب الوقت المتبقي أو التوقيت المناسب للجلسة
 */
function getRelativeTimeLabel(dateStr, timeStr) {
  const today = todayStr();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  let prefix = '';
  if (dateStr === today) prefix = 'اليوم';
  else if (dateStr === tomorrow) prefix = 'غداً';
  else if (dateStr === yesterday) prefix = 'أمس';
  else {
    const diff = daysFromToday(dateStr);
    if (diff != null && diff > 0 && diff <= 7) prefix = `خلال ${diff} أيام`;
    else if (diff != null && diff < 0) prefix = `منذ ${Math.abs(diff)} يوم`;
    else prefix = dateStr || 'الآن';
  }

  if (timeStr) return `${prefix} ${timeStr}`;
  return prefix;
}

/**
 * المحرك الشامل لجلب وتوليد كافة التنبيهات والإشعارات اللحظية من النظام وقاعدة البيانات
 * حسب دور وصلاحيات المستخدم الحالي
 */
export function fetchGlobalNotifications(currentUser) {
  const today = todayStr();
  const tomorrow = addDays(today, 1);
  const in3Days = addDays(today, 3);
  const in7Days = addDays(today, 7);

  const role = currentUser?.role || 'manager';
  const currentEmpId = currentUser?.empId || currentUser?.id;
  const currentStudentId = currentUser?.studentId;

  // جلب كافة مجموعات البيانات من التخزين وقاعدة البيانات
  const students = lsGet('students') || [];
  const emps = lsGet('employees') || [];
  const sessions = lsGet('sessions') || [];
  const appts = lsGet('appointments') || [];
  const attStu = lsGet('attStu') || [];
  const attEmp = lsGet('attEmp') || [];
  const leaves = lsGet('leaves') || [];
  const iepGoals = lsGet('iepGoals') || [];
  const salaries = lsGet('salaries') || [];
  const studentFees = lsGet('studentFees') || [];
  const activities = lsGet('centerActivities') || [];
  const manual = lsGet('manualAlerts') || [];
  const storedNotifs = lsGet('notifs') || [];

  const stuMap = Object.fromEntries(students.map(s => [s.id, s]));
  const empMap = Object.fromEntries(emps.map(e => [e.id, e]));

  const readIds = new Set(getReadNotifIds(currentUser));
  const rawList = [];

  // ==========================================
  // 1️⃣ تنبيهات الجلسات التأهيلية والتعليمية
  // ==========================================
  const relevantSessions = sessions.filter(s => {
    if (role === 'parent' && currentStudentId) return s.stuId === currentStudentId;
    if (role === 'specialist' && currentEmpId) {
      return (s.empId === currentEmpId || s.specialistId === currentEmpId || s.specialist === currentUser?.name);
    }
    return true;
  });

  // جلسات اليوم وغداً
  relevantSessions.forEach(s => {
    if (s.date === today || s.date === tomorrow) {
      const st = stuMap[s.stuId];
      const isToday = s.date === today;
      const isDone = s.status === 'done';
      const isCancelled = s.status === 'cancelled';
      
      if (isCancelled) return;

      const timeLabel = getRelativeTimeLabel(s.date, s.time);
      const isUrgent = isToday && !isDone;

      rawList.push({
        id: `sess-${s.id}`,
        category: 'sessions',
        categoryLabel: 'الجلسات',
        categoryIcon: '⏱️',
        title: isToday ? `جلسة اليوم: ${s.type || 'تأهيلية'}` : `جلسة غداً: ${s.type || 'تأهيلية'}`,
        detail: `الطالب: ${st?.name || 'غير محدد'} · التوقيت: ${s.time || 'غير محدد'} ${s.notes ? `(${s.notes})` : ''}`,
        time: timeLabel,
        rawDate: s.date,
        severity: isUrgent ? 'urgent' : 'info',
        actionView: 'students',
        actionTab: 'sessions',
        targetRoles: ['manager', 'vice', 'specialist', 'reception', 'parent'],
      });
    }
  });

  // تنبيه: جلسات اليوم المنجزة ولكن ينقصها تدوين الأهداف أو الملاحظات (للأخصائي والمدير)
  if (['manager', 'vice', 'specialist'].includes(role)) {
    const presentStuToday = attStu.filter(a => a.date === today && a.status === 'present' && a.session === 'sessions');
    const checkedKids = new Set();

    presentStuToday.forEach(a => {
      if (checkedKids.has(a.kidId)) return;
      checkedKids.add(a.kidId);

      const st = stuMap[a.kidId];
      if (role === 'specialist' && currentEmpId && st?.specialistId && st.specialistId !== currentEmpId) return;

      const logsToday = sessions.filter(s => s.stuId === a.kidId && s.date === today && s.status === 'done');
      const missingNotes = logsToday.length === 0 || logsToday.some(s => !(String(s.goals || '').trim() || String(s.notes || '').trim()));

      if (missingNotes) {
        rawList.push({
          id: `incomp-sess-${a.kidId}-${today}`,
          category: 'sessions',
          categoryLabel: 'متابعة الجلسات',
          categoryIcon: '📝',
          title: `استكمال تقرير جلسة — ${st?.name || 'طالب'}`,
          detail: 'تم تسجيل حضور الطالب بالجلسات، يُرجى استكمال محتوى وأهداف الجلسة.',
          time: 'اليوم',
          rawDate: today,
          severity: 'warn',
          actionView: 'students',
          actionTab: 'sessions',
          targetRoles: ['manager', 'vice', 'specialist'],
        });
      }
    });
  }

  // ==========================================
  // 2️⃣ تنبيهات المواعيد والاستشارات والتقييمات
  // ==========================================
  if (['manager', 'vice', 'specialist', 'reception'].includes(role)) {
    appts.forEach(a => {
      if (a.date === today || a.date === tomorrow || (a.date >= today && a.date <= in3Days)) {
        const st = stuMap[a.stuId];
        const isEval = (a.type || '').includes('تقييم') || (a.type || '').includes('assessment');
        const timeLabel = getRelativeTimeLabel(a.date, a.time);

        rawList.push({
          id: `appt-${a.id}`,
          category: 'appointments',
          categoryLabel: isEval ? 'التقييمات' : 'المواعيد',
          categoryIcon: isEval ? '📋' : '🗓️',
          title: `${isEval ? 'موعد تقييم وتشخيص' : 'موعد مجدول'}: ${a.type || 'استشارة'}`,
          detail: `المستفيد: ${st?.name || a.clientName || 'مستفيد'} · ${[a.time && `الساعة: ${a.time}`, a.notes].filter(Boolean).join(' · ')}`,
          time: timeLabel,
          rawDate: a.date,
          severity: a.date === today ? 'urgent' : 'info',
          actionView: 'calendar',
          actionTab: 'appointments',
          targetRoles: ['manager', 'vice', 'specialist', 'reception'],
        });
      }
    });
  }

  // ==========================================
  // 3️⃣ تنبيهات المدفوعات والمالية
  // ==========================================
  if (['manager', 'vice'].includes(role)) {
    // 1) متأخرات وأقساط الرسوم الدراسية غير المسددة
    studentFees.forEach(fee => {
      const total = Number(fee.totalAmount || 0);
      const paid = Number(fee.paidAmount || 0);
      const remaining = total - paid;

      if (remaining > 0 && fee.dueDate) {
        const df = daysFromToday(fee.dueDate);
        const st = stuMap[fee.stuId || fee.studentId];

        if (df != null && df <= 5) {
          const isOverdue = df < 0;
          rawList.push({
            id: `fee-${fee.id}`,
            category: 'finance',
            categoryLabel: 'المالية',
            categoryIcon: '💰',
            title: isOverdue ? `قسط رسوم متأخر السداد — ${st?.name || 'طالب'}` : `استحقاق قسط رسوم — ${st?.name || 'طالب'}`,
            detail: `المبلغ المتبقي: ${remaining.toLocaleString()} ريال · تاريخ الاستحقاق: ${fee.dueDate}`,
            time: isOverdue ? `متأخر منذ ${Math.abs(df)} يوم` : (df === 0 ? 'مستحق اليوم' : `خلال ${df} أيام`),
            rawDate: fee.dueDate,
            severity: isOverdue ? 'urgent' : 'warn',
            actionView: 'students',
            actionTab: 'finance',
            targetRoles: ['manager', 'vice'],
          });
        }
      }
    });

    // 2) صرف الرواتب الشهرية للموظفين (يظهر بدءاً من 25 في الشهر)
    const dayOfMonth = new Date().getDate();
    const curMonthKey = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    if (dayOfMonth >= 25) {
      const unpaidEmps = emps.filter(e => {
        const sal = salaries.find(s => s.empId === e.id && s.month === curMonthKey);
        return !sal || sal.status !== 'paid';
      });

      if (emps.length > 0 && unpaidEmps.length > 0) {
        rawList.push({
          id: `salary-month-${curMonthKey}`,
          category: 'finance',
          categoryLabel: 'مسير الرواتب',
          categoryIcon: '💳',
          title: `صرف رواتب شهر ${new Date().toLocaleDateString('ar-SA', { month: 'long' })}`,
          detail: `يوجد (${unpaidEmps.length}) موظف لم يتم اعتماد صرف رواتبهم حتى الآن.`,
          time: 'نهاية الشهر',
          rawDate: today,
          severity: unpaidEmps.length > 3 ? 'urgent' : 'warn',
          actionView: 'hr',
          actionTab: 'salary',
          targetRoles: ['manager', 'vice'],
        });
      }
    }
  }

  // ==========================================
  // 4️⃣ تنبيهات التأخير والمتابعة والحضور
  // ==========================================
  // 1) غياب الطلاب اليوم
  if (['manager', 'vice', 'reception', 'specialist'].includes(role)) {
    const absents = attStu.filter(a => a.date === today && a.status === 'absent');
    absents.forEach(a => {
      const st = stuMap[a.kidId];
      if (role === 'specialist' && currentEmpId && st?.specialistId && st.specialistId !== currentEmpId) return;

      rawList.push({
        id: `att-abs-${a.id || a.kidId}`,
        category: 'attendance',
        categoryLabel: 'الغياب والتأخير',
        categoryIcon: '⚠️',
        title: `تسجيل غياب اليوم — ${st?.name || 'طالب'}`,
        detail: `الفترة: ${a.session === 'morning' ? 'الصباحية' : a.session === 'evening' ? 'المسائية' : 'الجلسات'} · يتطلب تواصل ومتابعة ولي الأمر`,
        time: 'اليوم',
        rawDate: today,
        severity: 'warn',
        actionView: 'attendance',
        actionTab: 'students',
        targetRoles: ['manager', 'vice', 'reception', 'specialist'],
      });
    });
  }

  // 2) تنبيه مراجعة الأهداف الفردية IEP
  if (['manager', 'vice', 'specialist'].includes(role)) {
    iepGoals.forEach(g => {
      if (!g.review) return;
      const df = daysFromToday(g.review);
      if (df != null && df >= -2 && df <= 7) {
        const st = stuMap[g.stuId];
        if (role === 'specialist' && currentEmpId && st?.specialistId && st.specialistId !== currentEmpId) return;

        const isOverdue = df < 0;
        rawList.push({
          id: `iep-rev-${g.id}`,
          category: 'iep',
          categoryLabel: 'الخطط الفردية IEP',
          categoryIcon: '🎯',
          title: isOverdue ? `تأخر موعد مراجعة هدف IEP — ${st?.name || 'طالب'}` : `موعد مراجعة هدف IEP — ${st?.name || 'طالب'}`,
          detail: `المجال: ${g.domain || 'عام'} · الهدف: ${(g.goal || '').slice(0, 60)}${(g.goal || '').length > 60 ? '…' : ''}`,
          time: isOverdue ? `متأخر منذ ${Math.abs(df)} يوم` : (df === 0 ? 'اليوم' : `خلال ${df} أيام`),
          rawDate: g.review,
          severity: isOverdue || df <= 2 ? 'urgent' : 'info',
          actionView: 'students',
          actionTab: 'iep',
          targetRoles: ['manager', 'vice', 'specialist'],
        });
      }
    });
  }

  // 3) طلبات إجازات الموظفين المعلقة
  if (['manager', 'vice'].includes(role)) {
    leaves.filter(l => l.status === 'pending').forEach(l => {
      const e = empMap[l.empId];
      rawList.push({
        id: `leave-req-${l.id}`,
        category: 'hr',
        categoryLabel: 'الموارد البشرية',
        categoryIcon: '🏖️',
        title: `طلب إجازة بانتظار الاعتماد — ${e?.name || 'موظف'}`,
        detail: `النوع: ${l.type || 'اعتيادية'} · الفترة: من ${l.from} إلى ${l.to} (${l.days || '—'} أيام)`,
        time: l.from || 'قريباً',
        rawDate: l.from,
        severity: 'warn',
        actionView: 'hr',
        actionTab: 'leaves',
        targetRoles: ['manager', 'vice'],
      });
    });
  }

  // 4) عقود موظفين تقترب من الانتهاء (خلال 30 يوم)
  if (['manager', 'vice'].includes(role)) {
    emps.forEach(e => {
      if (!e.contractEnd) return;
      const days = daysUntilDate(new Date(e.contractEnd + 'T12:00:00'));
      if (days != null && days >= 0 && days <= 30) {
        rawList.push({
          id: `contract-end-${e.id}`,
          category: 'hr',
          categoryLabel: 'العقود',
          categoryIcon: '📄',
          title: `عقد موظف ينتهي قريباً — ${e.name}`,
          detail: `المسمى: ${e.role || 'موظف'} · تاريخ الانتهاء: ${e.contractEnd} (متبقي ${days} يوم)`,
          time: `خلال ${days} يوم`,
          rawDate: e.contractEnd,
          severity: days <= 7 ? 'urgent' : 'warn',
          actionView: 'hr',
          actionTab: 'contracts',
          targetRoles: ['manager', 'vice'],
        });
      }
    });
  }

  // ==========================================
  // 5️⃣ الأحداث العامة والفعاليات والتنبيهات المخصصة
  // ==========================================
  // 1) مناسبات وأعياد ميلاد اليوم وهذا الأسبوع
  const upcomingBirthdays = [];
  students.forEach(s => {
    const nd = nextAnnualOccurrenceDate(s.dob);
    const d = daysUntilDate(nd);
    if (d != null && d >= 0 && d <= 3) upcomingBirthdays.push({ name: s.name, days: d, type: 'طالب', id: s.id });
  });
  emps.forEach(e => {
    const nd = nextAnnualOccurrenceDate(e.dob);
    const d = daysUntilDate(nd);
    if (d != null && d >= 0 && d <= 3) upcomingBirthdays.push({ name: e.name, days: d, type: 'موظف', id: e.id });
  });

  upcomingBirthdays.forEach(b => {
    rawList.push({
      id: `bday-${b.type}-${b.id}`,
      category: 'general',
      categoryLabel: 'مناسبات المركز',
      categoryIcon: '🎂',
      title: b.days === 0 ? `🎂 عيد ميلاد اليوم: ${b.name} (${b.type})` : `عيد ميلاد خلال ${b.days} يوم: ${b.name} (${b.type})`,
      detail: `تهنئة ومشاركة الفرحة مع ${b.type === 'طالب' ? 'الطالب وأسرته' : 'الزميل في العمل'}.`,
      time: b.days === 0 ? 'اليوم' : `خلال ${b.days} أيام`,
      rawDate: today,
      severity: b.days === 0 ? 'info' : 'info',
      actionView: b.type === 'طالب' ? 'students' : 'hr',
      targetRoles: ['manager', 'vice', 'reception', 'specialist'],
    });
  });

  // 2) فعاليات ونشاطات المركز القادمة
  activities.forEach(act => {
    if (act.date && (act.date === today || act.date === tomorrow || (act.date >= today && act.date <= in7Days))) {
      rawList.push({
        id: `act-${act.id}`,
        category: 'general',
        categoryLabel: 'الفعاليات والأنشطة',
        categoryIcon: '🎪',
        title: `فعالية مركز: ${act.name || 'نشاط مجدول'}`,
        detail: `التاريخ: ${act.date} · ${act.notes || 'استعداد وتجهيز المشاركات'}`,
        time: getRelativeTimeLabel(act.date),
        rawDate: act.date,
        severity: act.date === today ? 'urgent' : 'info',
        actionView: 'programs',
        actionTab: 'activities',
        targetRoles: ['manager', 'vice', 'specialist', 'reception'],
      });
    }
  });

  // 3) التنبيهات اليدوية المخزنة (Manual Alerts)
  manual.forEach(m => {
    if (!m.date) return;
    const df = daysFromToday(m.date);
    if (df < -3) return; // تخطي القديم جداً
    rawList.push({
      id: `manual-${m.id}`,
      category: 'general',
      categoryLabel: 'تنبيه إداري',
      categoryIcon: '📢',
      title: m.title || 'إشعار إداري',
      detail: [m.details, m.time && `الوقت: ${m.time}`].filter(Boolean).join(' · '),
      time: getRelativeTimeLabel(m.date, m.time),
      rawDate: m.date,
      severity: m.severity === 'urgent' ? 'urgent' : (m.severity === 'warn' ? 'warn' : 'info'),
      actionView: 'dash',
      targetRoles: ['manager', 'vice', 'specialist', 'reception', 'parent'],
    });
  });

  // 4) الإشعارات العامة في قاعدة البيانات (notifs collection)
  storedNotifs.forEach(n => {
    if (n.targetRoles && !n.targetRoles.includes('all') && !n.targetRoles.includes(role)) return;
    if (n.targetUserId && n.targetUserId !== (currentUser?.uid || currentUser?.id)) return;

    rawList.push({
      id: `stored-${n.id}`,
      category: n.category || 'general',
      categoryLabel: n.categoryLabel || 'إشعار النظام',
      categoryIcon: n.categoryIcon || '🔔',
      title: n.title || 'تنبيه',
      detail: n.details || n.detail || '',
      time: n.time || getRelativeTimeLabel(n.date),
      rawDate: n.date || today,
      severity: n.severity || 'info',
      actionView: n.actionView || 'dash',
      actionTab: n.actionTab || '',
      targetRoles: n.targetRoles || ['all'],
    });
  });

  // وضع علامة المقروء وحساب الحالات
  const processedList = rawList.map(item => ({
    ...item,
    isRead: readIds.has(item.id),
  }));

  // ترتيب التنبيهات:
  // 1) غير المقروء أولاً
  // 2) درجة الأهمية: urgent (0), warn (1), info (2), success (3)
  // 3) الأحدث تاريخاً
  const sevOrder = { urgent: 0, warn: 1, info: 2, success: 3 };
  processedList.sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    const sevDiff = (sevOrder[a.severity] ?? 2) - (sevOrder[b.severity] ?? 2);
    if (sevDiff !== 0) return sevDiff;
    return (b.rawDate || '').localeCompare(a.rawDate || '');
  });

  const unreadCount = processedList.filter(i => !i.isRead).length;

  return {
    list: processedList,
    unreadCount,
    totalCount: processedList.length,
    hasUrgent: processedList.some(i => !i.isRead && i.severity === 'urgent'),
  };
}
