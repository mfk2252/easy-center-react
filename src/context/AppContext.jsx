import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db, auth } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { checkSubscriptionStatus, isPlatformAdminEmail, logoutUser as fbLogout } from '../firebase/auth';
import { setCenterId, getCenterId, clearCenterId, seedDemoIfEmpty } from '../hooks/useStorage';

const AppContext = createContext();

const STORAGE_KEYS = {
  theme: 'scs_theme',
  user: 'scs_user',
  center: 'scs_center',
  sidebarOpen: 'scs_sidebar_open',
};

const DEFAULT_PERMISSIONS = {
  manager: { all: true },
  vice: { dash: true, students: true, hr: true, reports: true, docs: true, parents: true, partnerships: true, visits: true, calendar: true },
  specialist_speech: { dash: true, students: true, reports: true, calendar: true },
  specialist_physio: { dash: true, students: true, reports: true, calendar: true },
  specialist_behavior: { dash: true, students: true, reports: true, calendar: true },
  specialist_occupational: { dash: true, students: true, reports: true, calendar: true },
  specialist: { dash: true, students: true, reports: true, calendar: true },
  reception: { dash: true, students: true, visits: true, calendar: true },
  admin: { dash: true, students: true, hr: true, finance: true, docs: true, calendar: true },
  technician: { dash: true, settings: true },
  parent: { dash: true, reports: true, docs: true },
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem(STORAGE_KEYS.sidebarOpen) !== 'false');
  const [toasts, setToasts] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.user);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [center, setCenter] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.center);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'مركز الأمل للتربية الخاصة',
      nameEn: 'Al-Amal Special Education Center',
      type: 'تربية خاصة وتأهيل',
      phone: '0501234567',
      phoneCode: '+966',
      email: 'info@alamal-center.com',
      address: 'الرياض - حي الملز',
      color: '#1a56db',
      configured: true,
      shifts: {
        morning: { from: '07:00', to: '12:00' },
        evening: { from: '16:00', to: '20:00' },
      },
      socialLinks: {},
      currency: 'SAR',
      logo: '',
      barcode: '',
      status: 'active',
      subscription: null,
      createdAt: null,
    };
  });

  const [subscriptionStatus, setSubscriptionStatus] = useState(() => {
    return { allowed: true, reason: 'trial', daysLeft: 5 };
  });

  // مزامنة حالة الاشتراك بناءً على كائن المركز والمستخدم الحالي
  useEffect(() => {
    if (!currentUser) return;
    if (isPlatformAdminEmail(currentUser.email)) {
      setSubscriptionStatus({ allowed: true, reason: 'platform_admin' });
      return;
    }
    if (center && (center.subscription || center.createdAt)) {
      const status = checkSubscriptionStatus(center);
      setSubscriptionStatus(status);
    }
  }, [currentUser, center]);

  const toast = useCallback((msg, type = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const persistConfig = useCallback((newConfig) => {
    setCenter(prev => {
      const merged = { ...prev, ...newConfig };
      try {
        localStorage.setItem(STORAGE_KEYS.center, JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to save center config to localStorage:', e);
      }
      return merged;
    });
  }, []);

  const updateCenterColor = useCallback((color) => {
    document.documentElement.style.setProperty('--pr', color);
    persistConfig({ color });
  }, [persistConfig]);

  const persistCenterMeta = useCallback((meta) => {
    if (!meta) return;
    try {
      if (meta.name) localStorage.setItem('scs_center_name', meta.name);
      if (meta.nameEn) localStorage.setItem('scs_center_name_en', meta.nameEn);
      if (meta.phoneCode) localStorage.setItem('scs_center_phone_code', meta.phoneCode);
      if (meta.address) localStorage.setItem('scs_center_address', meta.address);
      if (meta.logo) localStorage.setItem('scs_center_logo', meta.logo);
      if (meta.barcode) localStorage.setItem('scs_center_barcode', meta.barcode);
    } catch (e) {
      console.warn('persistCenterMeta failed:', e);
    }
  }, []);

  const applyCenter = useCallback((data) => {
    if (!data) return;
    const c = {
      name: data.centerName || data.name || '',
      nameEn: data.nameEn || '',
      type: data.type || '',
      phone: data.phone || '',
      phoneCode: data.phoneCode || '+966',
      email: data.email || '',
      address: data.address || '',
      color: data.color || '#1a56db',
      shifts: data.shifts || { morning: { from: '07:00', to: '12:00' }, evening: { from: '16:00', to: '20:00' } },
      socialLinks: data.socialLinks || {},
      currency: data.currency || 'SAR',
      logo: data.logo || '',
      barcode: data.barcode || '',
      status: data.status || 'active',
      setupCompleted: !!data.setupCompleted,
      configured: data.setupCompleted || data.isSetup || false,
      subscription: data.subscription || null,
      createdAt: data.createdAt || null,
    };
    setCenter(c);
    persistCenterMeta({
      name: c.name,
      nameEn: c.nameEn,
      phoneCode: c.phoneCode,
      address: c.address,
      logo: c.logo,
      barcode: c.barcode,
    });
    try {
      localStorage.setItem(STORAGE_KEYS.center, JSON.stringify(c));
    } catch {}
    if (c.color) {
      document.documentElement.style.setProperty('--pr', c.color);
    }
  }, [persistCenterMeta]);

  const loadCenterData = useCallback(async (cId) => {
    if (!cId) return;
    try {
      const snap = await getDoc(doc(db, 'centers', cId));
      if (snap.exists()) {
        const data = snap.data();
        applyCenter(data);
        const sub = checkSubscriptionStatus(data);
        setSubscriptionStatus(sub);
      }
    } catch (e) {
      console.warn('loadCenterData error:', e);
    }
  }, [applyCenter]);

  // استماع لحالة المصادقة
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        const savedCId = getCenterId() || user.uid;
        if (savedCId) {
          setCenterId(savedCId);
          await loadCenterData(savedCId);
        }
      } else {
        const storedUser = localStorage.getItem(STORAGE_KEYS.user);
        if (!storedUser) {
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [loadCenterData]);

  const loginUser = useCallback((userObj, centerData, subStatus) => {
    setCurrentUser(userObj);
    try {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userObj));
    } catch {}

    const cId = userObj.centerId || userObj.uid || getCenterId();
    if (cId) setCenterId(cId);

    if (centerData) {
      applyCenter(centerData);
    } else if (cId) {
      loadCenterData(cId);
    }

    if (subStatus) {
      setSubscriptionStatus(subStatus);
    }

    seedDemoIfEmpty(cId);
  }, [applyCenter, loadCenterData]);

  const logoutUser = useCallback(async () => {
    try {
      await fbLogout();
    } catch (e) {
      console.warn('Firebase logout failed:', e);
    }
    setCurrentUser(null);
    clearCenterId();
    localStorage.removeItem(STORAGE_KEYS.user);
    toast('تم تسجيل الخروج بنجاح', 'ok');
  }, [toast]);

  const hasPermission = useCallback((permKey) => {
    if (!currentUser) return false;
    if (currentUser.role === 'manager') return true;
    if (isPlatformAdminEmail(currentUser.email)) return true;
    if (currentUser.permissions && typeof currentUser.permissions[permKey] === 'boolean') {
      return currentUser.permissions[permKey];
    }
    const rolePerms = DEFAULT_PERMISSIONS[currentUser.role];
    if (rolePerms?.all) return true;
    return !!rolePerms?.[permKey];
  }, [currentUser]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEYS.theme, next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.sidebarOpen, String(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    sidebarOpen,
    toggleSidebar,
    toasts,
    toast,
    currentUser,
    center,
    subscriptionStatus,
    authLoading,
    loginUser,
    logoutUser,
    hasPermission,
    persistConfig,
    updateCenterColor,
    loadCenterData,
    applyCenter,
  }), [
    theme, toggleTheme,
    sidebarOpen, toggleSidebar,
    toasts, toast,
    currentUser, center,
    subscriptionStatus, authLoading,
    loginUser, logoutUser,
    hasPermission,
    persistConfig, updateCenterColor,
    loadCenterData, applyCenter,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
