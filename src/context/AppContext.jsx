import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getCenterSettings } from '../firebase/db';
import { signOutUser, checkSubscriptionStatus } from '../firebase/auth';
import { syncFromFirebase } from '../hooks/useStorage';
import { getWelcomeMessage } from './LanguageContext';

const AppContext = createContext(null);

const ALL_KEYS = [
  'students','employees','sessions','appointments','iepGoals',
  'attStu','attEmp','income','expenses','salaries','leaves',
  'calEvents','centerActivities','parentInteractions','consultations',
  'evaluations','warnings','stuReports','behaviorPlans',
  'studentFees','payments','notifs','manualAlerts','users'
];

function applyTheme(color) {
  if (!color) return;
  document.documentElement.style.setProperty('--pr', color);
  const h = color.replace('#','');
  const r=parseInt(h.substr(0,2),16), g=parseInt(h.substr(2,2),16), b=parseInt(h.substr(4,2),16);
  document.documentElement.style.setProperty('--pr-d',`rgb(${Math.max(0,r-35)},${Math.max(0,g-35)},${Math.max(0,b-35)})`);
  document.documentElement.style.setProperty('--pr-l',`rgba(${r},${g},${b},0.1)`);
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

  useEffect(() => {
    // timeout احتياطي - لو لم يستجب Firebase بعد 8 ثوانٍ
    const loadingTimeout = setTimeout(() => {
      setScreen(prev => prev === 'loading' ? 'login' : prev);
    }, 8000);

    // جلسة موظف محفوظة
    const savedSession = (() => {
      try { return JSON.parse(localStorage.getItem('scs_session') || 'null'); }
      catch(e) { return null; }
    })();

    if (savedSession?.centerId) {
      clearTimeout(loadingTimeout);
      localStorage.setItem('scs_current_uid', savedSession.centerId);
      setCurrentUser(savedSession);
      setSubscriptionStatus(savedSession.subscription || { allowed: true, reason: 'active' });
      loadCenterData(savedSession.centerId);
      setSyncing(true);
      syncFromFirebase(savedSession.centerId, ALL_KEYS)
        .finally(() => { setSyncing(false); setScreen('app'); });
      return;
    }

    // Google Auth
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      clearTimeout(loadingTimeout);
      if (fbUser) {
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

  function needsCenterSetup(data) {
    if (!data) return true;
    if (data.setupCompleted === true && data.status === 'active') return false;
    if (data.isSetup === true && data.status !== 'pending_setup') return false;
    return data.status === 'pending_setup' || !data.isSetup || !data.setupCompleted;
  }

  function applyCenter(data) {
    const c = {
      name: data.centerName || data.name || '',
      logo: data.logoUrl || data.logo || '',
      color: data.color || '#1a56db',
      type: data.type || '',
      phone: data.phone || '',
      email: data.email || data.ownerEmail || '',
      address: data.address || '',
      currency: data.currency || 'SAR',
      status: data.status || 'active',
      setupCompleted: !!data.setupCompleted,
      configured: data.setupCompleted || data.isSetup || false,
    };
    setCenter(c);
    if (c.name) localStorage.setItem('scs_center_name', c.name);
    if (c.logo) localStorage.setItem('scs_center_logo', c.logo);
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
