import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getCenterSettings } from '../firebase/db';
import { signOutUser, checkSubscriptionStatus, isPlatformAdminEmail } from '../firebase/auth';
import { syncFromFirebase } from '../hooks/useStorage';
import { getWelcomeMessage } from './LanguageContext';
import { persistCenterMeta } from '../utils/centerMeta';
import { updateFavicon, updateManifestIcon } from '../utils/favicon';

const AppContext = createContext(null);

const ALL_KEYS = [
  'students','employees','sessions','appointments','iepGoals',
  'attStu','attEmp','income','expenses','salaries','leaves',
  'calEvents','centerActivities','parentInteractions','consultations',
  'evaluations','warnings','stuReports','behaviorPlans',
  'studentFees','payments','notifs','manualAlerts','users',
  'progEvaluations','progPrograms','progReports',
  'progWeeklyReports','progMonthlyReports','progParentMeetings',
  'progSemiAnnualReports','progAnnualReports','progBehaviorReports',
  'progLearningDifficultyReports',
  'measurements','measureItems','studentAssessments',
  'bonuses',
  'progGoalsBank',
];

function applyTheme(color) {
  if (!color) return;
  document.documentElement.style.setProperty('--pr', color);
  const h = color.replace('#','');
  const r=parseInt(h.substr(0,2),16), g=parseInt(h.substr(2,2),16), b=parseInt(h.substr(4,2),16);
  document.documentElement.style.setProperty('--pr-d',`rgb(${Math.max(0,r-35)},${Math.max(0,g-35)},${Math.max(0,b-35)})`);
  document.documentElement.style.setProperty('--pr-l',`rgba(${r},${g},${b},0.1)`);
}

/** كائن currentUser الموحّد لمالك المنصة — نفس الشكل سواء جاء من login() المباشر
 *  أو من onAuthStateChanged (بعد تحديث الصفحة مثلاً)، لتفادي أي تعارض بينهما. */
function buildPlatformAdminUser(fbUser) {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    name: fbUser.displayName || 'مالك المنصة',
    role: 'manager',
    centerId: fbUser.uid,
    isPlatformAdmin: true,
    subscription: { allowed: true, reason: 'platform_admin' },
  };
}

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('loading');
  const [center, setCenter] = useState({ name:'', logo:'', color:'#1a56db', configured:false });
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dash');
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const toastTimers = useRef({});

  useEffect(() => {
    const dm = localStorage.getItem('darkMode') === '1';
    if (dm) { document.body.classList.add('dark'); setDarkMode(true); }
    const fs = localStorage.getItem('scs_fontsize');
    const fw = localStorage.getItem('scs_fontweight');
    if (fs) document.documentElement.style.setProperty('--fs', fs+'px');
    if (fw) document.documentElement.style.setProperty('--fw', fw);
  }, []);

  // أيقونة تبويب المتصفح (Favicon) تتحدّث تلقائياً حسب شعار المركز الحالي.
  useEffect(() => {
    updateFavicon(center.logo);
    updateManifestIcon(center.logo, { appName: center.name });
  }, [center.logo, center.name]);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setScreen(prev => prev === 'loading' ? 'login' : prev);
    }, 8000);

    const savedSession = (() => {
      try { return JSON.parse(localStorage.getItem('scs_session') || 'null'); }
      catch(e) { return null; }
    })();

    if (savedSession?.centerId) {
      clearTimeout(loadingTimeout);
      localStorage.setItem('scs_current_uid', savedSession.centerId);
      (async () => {
        const centerData = await getCenterSettings(savedSession.centerId);
        const subStatus = checkSubscriptionStatus(centerData);
        const updatedUser = { ...savedSession, subscription: subStatus };
        localStorage.setItem('scs_session', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setSubscriptionStatus(subStatus);
        if (!subStatus.allowed) {
          setScreen('subscription');
          return;
        }
        if (centerData) applyCenter(centerData);
        setSyncing(true);
        syncFromFirebase(savedSession.centerId, ALL_KEYS)
          .finally(() => { setSyncing(false); setScreen('app'); });
      })();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      clearTimeout(loadingTimeout);
      if (fbUser) {
        if (isPlatformAdminEmail(fbUser.email)) {
          const adminUser = buildPlatformAdminUser(fbUser);
          localStorage.setItem('scs_current_uid', fbUser.uid);
          setCurrentUser(adminUser);
          setSubscriptionStatus(adminUser.subscription);
          setScreen('app');
          setActiveView('admin');
          return;
        }

        localStorage.setItem('scs_current_uid', fbUser.uid);

        const centerData = await getCenterSettings(fbUser.uid);
        const subStatus = checkSubscriptionStatus(centerData);

        const user = {
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || 'المدير',
          photo: fbUser.photoURL,
          role: 'manager',
          centerId: fbUser.uid,
          subscription: subStatus
        };

        setCurrentUser(user);
        setSubscriptionStatus(subStatus);

        if (!subStatus.allowed) {
          setScreen('subscription');
          return;
        }

        if (!needsCenterSetup(centerData)) {
          applyCenter(centerData);
          setSyncing(true);
          syncFromFirebase(fbUser.uid, ALL_KEYS)
            .finally(() => { setSyncing(false); setScreen('app'); });
        } else {
          applyCenter(centerData || {});
          setScreen('setup');
        }
      } else {
        localStorage.removeItem('scs_current_uid');
        setCurrentUser(null);
        setSubscriptionStatus(null);
        setScreen('login');
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const centerId = currentUser?.centerId;
    if (!centerId || screen !== 'app' || currentUser?.isPlatformAdmin) return;

    async function refreshSub() {
      const centerData = await getCenterSettings(centerId);
      const subStatus = checkSubscriptionStatus(centerData);
      setSubscriptionStatus(subStatus);
      setCurrentUser(prev => {
        if (!prev) return prev;
        const next = { ...prev, subscription: subStatus };
        try {
          const s = JSON.parse(localStorage.getItem('scs_session') || 'null');
          if (s?.centerId === centerId) {
            localStorage.setItem('scs_session', JSON.stringify({ ...s, subscription: subStatus }));
          }
        } catch (_) { /* ignore */ }
        return next;
      });
      if (!subStatus.allowed) setScreen('subscription');
    }

    refreshSub();
    const timer = setInterval(refreshSub, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, [currentUser?.centerId, screen, currentUser?.isPlatformAdmin]);

  function needsCenterSetup(data) {
    if (!data) return true;
    if (data.setupCompleted === true && data.status === 'active') return false;
    if (data.isSetup === true && data.status !== 'pending_setup') return false;
    return data.status === 'pending_setup' || !data.isSetup || !data.setupCompleted;
  }

  function applyCenter(data) {
    const social = data.socialLinks || data.social || {};
    const c = {
      name: data.centerName || data.name || '',
      nameEn: data.nameEn || data.centerNameEn || '',
      logo: data.logoUrl || data.logo || '',
      color: data.color || '#1a56db',
      type: data.type || '',
      phone: data.phone || '',
      phoneCode: data.phoneCode || '+966',
      email: data.email || data.ownerEmail || '',
      address: data.address || '',
      currency: data.currency || 'SAR',
      website: social.website || data.website || '',
      whatsapp: social.whatsapp || data.whatsapp || '',
      instagram: social.instagram || data.instagram || '',
      barcode: data.barcode || '',
      shifts: data.shifts || {},
      status: data.status || 'active',
      setupCompleted: !!data.setupCompleted,
      configured: data.setupCompleted || data.isSetup || false,
    };
    setCenter(c);
    persistCenterMeta({
      name: c.name,
      nameEn: c.nameEn,
      logo: c.logo,
      address: c.address,
      phone: c.phone,
      phoneCode: c.phoneCode,
      email: c.email,
      currency: c.currency,
      barcode: c.barcode,
      socialLinks: { website: c.website, whatsapp: c.whatsapp, instagram: c.instagram },
      shifts: c.shifts,
    });
    if (data.fontSize) localStorage.setItem('scs_fontsize', String(data.fontSize));
    if (data.fontWeight) localStorage.setItem('scs_fontweight', String(data.fontWeight));
    if (data.platformLang) localStorage.setItem('scs_lang', data.platformLang);
    applyTheme(c.color);
    document.title = c.name || 'نظام إدارة المركز';
    return c;
  }

  async function loadCenterData(centerId) {
    const data = await getCenterSettings(centerId);
    if (data) applyCenter(data);
  }

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey||e.metaKey)&&e.key==='k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key==='Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toast = useCallback((msg, type='ok') => {
    const id = Date.now()+Math.random();
    setToasts(prev=>[...prev,{id,msg,type}]);
    toastTimers.current[id] = setTimeout(() => {
      setToasts(prev=>prev.filter(t=>t.id!==id));
      delete toastTimers.current[id];
    }, 3500);
  }, []);

  const toggleDark = useCallback(() => {
    setDarkMode(d => {
      const next=!d;
      document.body.classList.toggle('dark',next);
      localStorage.setItem('darkMode',next?'1':'0');
      return next;
    });
  }, []);

  const login = useCallback(async (user) => {
    if (user.isPlatformAdmin) {
      localStorage.setItem('scs_current_uid', user.centerId);
      setCurrentUser(user);
      setSubscriptionStatus(user.subscription);
      setScreen('app');
      setActiveView('admin');
      return;
    }

    if (user.role !== 'manager') {
      localStorage.setItem('scs_session', JSON.stringify(user));
    }
    localStorage.setItem('scs_current_uid', user.centerId);
    setCurrentUser(user);
    setSubscriptionStatus(user.subscription);

    if (user.subscription && !user.subscription.allowed) {
      setScreen('subscription');
      return;
    }

    const centerData = await getCenterSettings(user.centerId);
    applyCenter(centerData || {});

    if (user.needsSetup || user.isNewCenter || (user.role === 'manager' && needsCenterSetup(centerData))) {
      setScreen('setup');
      return;
    }

    const lang = localStorage.getItem('scs_lang') || 'ar';
    if (!user._skipWelcome) {
      toast('✅ ' + getWelcomeMessage(user.name, user.centerId, lang), 'ok');
    }

    setSyncing(true);
    syncFromFirebase(user.centerId, ALL_KEYS)
      .finally(() => { setSyncing(false); setScreen('app'); setActiveView('dash'); });
  }, [toast]);

  const logout = useCallback(async () => {
    try { await signOutUser(); } catch(e) {}
    localStorage.removeItem('scs_session');
    localStorage.removeItem('userPerms');
    localStorage.removeItem('scs_current_uid');
    setCurrentUser(null);
    setSubscriptionStatus(null);
    setCenter({ name:'', logo:'', color:'#1a56db', configured:false });
    setScreen('login');
  }, []);

  const go = useCallback((view) => setActiveView(view), []);

  const updateCenterData = useCallback((c) => {
    setCenter(c);
    applyTheme(c.color);
    document.title = c.name || 'نظام إدارة المركز';
  }, []);

  const updateCenterColor = useCallback((color) => {
    applyTheme(color);
    setCenter(prev=>({...prev,color}));
  }, []);

  const persistConfig = useCallback((c) => updateCenterData(c), [updateCenterData]);

  const resetCenter = useCallback(() => {
    if (!window.confirm('تسجيل الخروج؟')) return;
    logout();
  }, [logout]);

  if (syncing) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg)',flexDirection:'column',gap:16}}>
        <div style={{fontSize:'3rem'}}>☁️</div>
        <div style={{fontWeight:700,fontSize:'1.1rem'}}>جارٍ مزامنة البيانات...</div>
        <div style={{color:'var(--g5)',fontSize:'.85rem'}}>يتم جلب بياناتك من Firebase</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      screen, center, currentUser, activeView, darkMode,
      toasts, searchOpen, syncing, subscriptionStatus,
      fbCfg:{}, fbReady:true,
      setScreen, persistConfig, login, logout, go, toast,
      toggleDark, setSearchOpen, resetCenter, updateCenterColor,
      updateCenterData, applyTheme, loadCenterData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
