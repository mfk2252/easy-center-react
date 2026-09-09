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
  secretary: {
    dash: true, calendar: true, attendance: true, hr: true,
    students: true, programs: true, reports: true, center: true,
    // Strictly restricted: NO access to finance, user management, system reset, or system configuration
    finance: false, userMgmt: false, reset: false, settings: false,
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
    dash: ['manager','vice','secretary','specialist','reception','parent'],
    calendar: ['manager','vice','secretary','specialist','reception'],
    attendance: ['manager','vice','secretary','specialist','reception','parent'],
    hr: ['manager','vice','secretary','reception'],
    students: ['manager','vice','secretary','specialist','reception','parent'],
    programs: ['manager','vice','secretary','specialist','reception'],
    'prog-reports': ['manager','vice','secretary','specialist','reception'],
    statistics: ['manager','vice'],
    reports: ['manager','vice','secretary'],
    center: ['manager','vice','secretary','reception'],
    settings: ['manager','vice','technician'],
  };
  return (tabPerms[tabId] || []).includes(role);
}

export function canEditFinance(role) {
  return ['manager'].includes(role);
}

export function canSeeHr(role) {
  return ['manager','vice','secretary','reception'].includes(role);
}

export function isSecretary(role) {
  return role === 'secretary';
}

export function canManageUsers(role) {
  return role === 'manager';
}
