const PERMISSIONS = {
  manager: {
    all: true,
  },
  vice: {
    dash: true, calendar: true, attendance: true, hr: true,
    students: true, programs: true, reports: true, center: true,
    settings: true,
    // restricted
    finance: false, userMgmt: false, reset: false,
  },
  specialist: {
    dash: true, calendar: true, attendance: true,
    students: true, programs: true, sessions: true,
  },
  reception: {
    dash: true, calendar: true, attendance: true,
    students: true, programs: true, sessions: true,
    volunteers: true,
  },
  parent: {
    dash: true, attendance: true, students: true, sessions: true,
  },
  technician: {
    settings: true, backup: true,
  },
};

export function canDo(role, action) {
  if (!role) return false;
  const p = PERMISSIONS[role];
  if (!p) return false;
  if (p.all) return true;
  return !!p[action];
}

export function canSeeTab(role, tabId) {
  if (!role) return false;
  if (role === 'manager') return true;
  const tabPerms = {
    dash: ['manager','vice','specialist','reception','parent'],
    calendar: ['manager','vice','specialist','reception'],
    attendance: ['manager','vice','specialist','reception','parent'],
    hr: ['manager','vice','reception'],
    students: ['manager','vice','specialist','reception','parent'],
    programs: ['manager','vice','specialist','reception'],
    reports: ['manager','vice'],
    center: ['manager','vice','reception'],
    settings: ['manager','vice','technician'],
  };
  return (tabPerms[tabId] || []).includes(role);
}

export function canEditFinance(role) {
  return ['manager'].includes(role);
}

export function canSeeHr(role) {
  return ['manager','vice','reception'].includes(role);
}

export function canManageUsers(role) {
  return role === 'manager';
}
