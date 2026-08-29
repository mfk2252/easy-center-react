import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getCenterSettings } from '../firebase/db';
import { signOutUser, checkSubscriptionStatus, isPlatformAdminEmail } from '../firebase/auth';
import { syncFromFirebase, SYSTEM_DATA_KEYS } from '../hooks/useStorage';
import { getWelcomeMessage } from './LanguageContext';
import { persistCenterMeta, getCenterPrintMeta } from '../utils/centerMeta';
import { updateFavicon, updateManifestIcon } from '../utils/favicon';

const AppContext = createContext(null);

const ALL_KEYS = SYSTEM_DATA_KEYS;

function applyTheme(color) {
  if (!color) return;
  document.documentElement.style.setProperty('--pr', color);
  const h = color.replace('#','');
  const r=parseInt(h.substr(0,2),16), g=parseInt(h.substr(2,2),16), b=parseInt(h.substr(4,2),16);
  document.documentElement.style.setProperty('--pr-d',`rgb(${Math.max(0,r-35)},${Math.max(0,g-35)},${Math.max(0,b-35)})`);
  document.documentElement.style.setProperty('--pr-l',`rgba(${r},${g},${b},0.1)`);
}

export const FONT_OPTIONS = [
  { id: 'arabicui', name: 'خط ون يو آي (Arabic UI One UI)', family: "'Arabic UI One UI', 'ArabicUIOneUI', 'ArabicUI', 'MainFont', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  { id: 'tajawal', name: 'خط تجوال (Tajawal)', family: "'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  { id: 'cairo', name: 'خط كايرو (Cairo)', family: "'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  { id: 'almarai', name: 'خط المراعي (Almarai)', family: "'Almarai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  { id: 'alexandria', name: 'خط الإسكندرية (Alexandria)', family: "'Alexandria', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  { id: 'calibri', name: 'خط كاليبري (Calibri)', family: "'Calibri', 'Carlito', 'Segoe UI', Arial, sans-serif" },
  { id: 'system', name: 'خط النظام', family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
];

export function applyFontVariables(size, weight) {
  const s = Math.max(12, Math.min(24, parseInt(size, 10) || 15));
  const w = String(weight || '400');
  const wNum = parseInt(w, 10) || 400;

  // Set font size variables and html root font size for relative rem units
  document.documentElement.style.fontSize = `${s}px`;
  document.documentElement.style.setProperty('--fs', `${s}px`);
  document.documentElement.style.setProperty('--app-font-size', `${s}px`);

  // Base font weight variables
  document.documentElement.style.setProperty('--fw', w);
  document.documentElement.style.setProperty('--fw-base', w);
  document.documentElement.style.setProperty('--app-font-weight', w);

  // Dynamic weight scale based on base weight
  const boldWeight = wNum <= 400 ? '700' : (wNum <= 600 ? '800' : '900');
  const semiBoldWeight = wNum <= 400 ? '600' : (wNum <= 600 ? '700' : '800');
  const mediumWeight = wNum <= 400 ? '500' : (wNum <= 600 ? '600' : '700');
  const blackWeight = wNum <= 400 ? '800' : '900';

  document.documentElement.style.setProperty('--fw-bold', boldWeight);
  document.documentElement.style.setProperty('--fw-semibold', semiBoldWeight);
  document.documentElement.style.setProperty('--fw-medium', mediumWeight);
  document.documentElement.style.setProperty('--fw-black', blackWeight);
  document.documentElement.style.setProperty('--fw-normal', String(wNum));

  localStorage.setItem('scs_fontsize', String(s));
  localStorage.setItem('scs_fontweight', w);
}

export function applyFontFamily(fontId) {
  const selected = FONT_OPTIONS.find(f => f.id === fontId) || FONT_OPTIONS[0];
  document.documentElement.style.setProperty('--font-main', selected.family);
  localStorage.setItem('scs_fontfamily', selected.id);
  return selected.id;
}

export function applyFontSettings(size, weight, family) {
  if (size || weight) {
    applyFontVariables(size || 15, weight || '400');
  }
  if (family) {
    applyFontFamily(family);
  }
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
    subscription: { allowed: true, reason: 'platform_admin', status: 'active', isPermanent: true },
  };
}

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('loading');
  const [center, setCenter] = useState(() => {
    const localMeta = getCenterPrintMeta();
    return {
      name: localMeta.name || localMeta.nameAr || '',
      nameEn: localMeta.nameEn || '',
      logo: localMeta.logo || '',
      color: localStorage.getItem('scs_color') || '#1a56db',
      type: localMeta.type || '',
      phone: localMeta.phone || '',
      phoneCode: localMeta.phoneCode || '+966',
      email: localMeta.email || '',
      address: localMeta.address || '',
      currency: localMeta.currency || 'SAR',
      website: localMeta.website || '',
      whatsapp: localMeta.whatsapp || '',
      instagram: localMeta.instagram || '',
      barcode: localMeta.barcode || '',
      shifts: localMeta.shifts || {},
      configured: Boolean(localMeta.name || localMeta.nameAr),
    };
  });
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
    const fs = localStorage.getItem('scs_fontsize') || '15';
    const fw = localStorage.getItem('scs_fontweight') || '400';
    const ff = localStorage.getItem('scs_fontfamily') || 'arabicui';
    const col = localStorage.getItem('scs_color') || center.color || '#1a56db';
    applyFontVariables(fs, fw);
    applyFontFamily(ff);
    applyTheme(col);
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
        if (centerData) {
          applyCenter(centerData);
        } else {
          applyCenter(getCenterPrintMeta());
        }
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
          localStorage.setItem('scs_session', JSON.stringify(adminUser));
          setCurrentUser(adminUser);
          setSubscriptionStatus(adminUser.subscription);
          
          const centerData = await getCenterSettings(fbUser.uid);
          if (centerData) {
            applyCenter(centerData);
          } else {
            applyCenter(getCenterPrintMeta());
          }
          setSyncing(true);
          syncFromFirebase(fbUser.uid, ALL_KEYS)
            .finally(() => { setSyncing(false); setScreen('app'); setActiveView('admin'); });
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
        localStorage.setItem('scs_session', JSON.stringify(user));
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
          applyCenter(centerData || getCenterPrintMeta());
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
    if (!data) return;
    const social = data.socialLinks || data.social || {};
    const localSocial = (() => {
      try { return JSON.parse(localStorage.getItem('scs_center_social') || '{}'); } catch(e) { return {}; }
    })();
    const localShifts = (() => {
      try { return JSON.parse(localStorage.getItem('scs_center_shifts') || '{}'); } catch(e) { return {}; }
    })();

    const c = {
      name: data.centerName || data.name || data.nameAr || localStorage.getItem('scs_center_name') || '',
      nameEn: data.nameEn || data.centerNameEn || localStorage.getItem('scs_center_name_en') || '',
      country: data.country || data.countryCode || localStorage.getItem('scs_center_country') || 'SA',
      countryCode: data.countryCode || data.country || localStorage.getItem('scs_center_country_code') || 'SA',
      countryNameAr: data.countryNameAr || localStorage.getItem('scs_center_country_name_ar') || 'المملكة العربية السعودية',
      countryNameEn: data.countryNameEn || localStorage.getItem('scs_center_country_name_en') || 'Saudi Arabia',
      logo: data.logoUrl || data.logo || localStorage.getItem('scs_center_logo') || '',
      color: data.color || localStorage.getItem('scs_color') || '#1a56db',
      type: data.type || localStorage.getItem('scs_center_type') || '',
      phone: data.phone || localStorage.getItem('scs_center_phone') || '',
      phoneCode: data.phoneCode || localStorage.getItem('scs_center_phone_code') || '+966',
      email: data.email || data.ownerEmail || localStorage.getItem('scs_center_email') || '',
      address: data.address || localStorage.getItem('scs_center_address') || '',
      currency: data.currency || localStorage.getItem('scs_center_currency') || 'SAR',
      website: social.website || data.website || localSocial.website || localStorage.getItem('scs_center_website') || '',
      whatsapp: social.whatsapp || data.whatsapp || localSocial.whatsapp || localStorage.getItem('scs_center_whatsapp') || '',
      instagram: social.instagram || data.instagram || localSocial.instagram || localStorage.getItem('scs_center_instagram') || '',
      barcode: data.barcode || localStorage.getItem('scs_center_barcode') || '',
      shifts: data.shifts || localShifts || {},
      status: data.status || 'active',
      setupCompleted: data.setupCompleted ?? (data.isSetup ?? true),
      configured: Boolean(data.centerName || data.name || data.nameAr || localStorage.getItem('scs_center_name')),
      subscription: data.subscription || null,
      createdAt: data.createdAt || null,
    };
    setCenter(c);
    persistCenterMeta({
      name: c.name,
      nameEn: c.nameEn,
      country: c.country,
      countryCode: c.countryCode,
      countryNameAr: c.countryNameAr,
      countryNameEn: c.countryNameEn,
      logo: c.logo,
      type: c.type,
      address: c.address,
      phone: c.phone,
      phoneCode: c.phoneCode,
      email: c.email,
      currency: c.currency,
      barcode: c.barcode,
      socialLinks: { website: c.website, whatsapp: c.whatsapp, instagram: c.instagram },
      shifts: c.shifts,
    });
    if (c.color) localStorage.setItem('scs_color', c.color);
    const centerFs = data.fontSize || localStorage.getItem('scs_fontsize') || '15';
    const centerFw = data.fontWeight || localStorage.getItem('scs_fontweight') || '400';
    const centerFf = data.fontFamily || localStorage.getItem('scs_fontfamily') || 'arabicui';
    applyFontVariables(centerFs, centerFw);
    applyFontFamily(centerFf);
    if (data.platformLang) localStorage.setItem('scs_lang', data.platformLang);
    applyTheme(c.color);
    document.title = c.name || 'نظام إدارة المركز';
    return c;
  }

  async function loadCenterData(centerId) {
    const data = await getCenterSettings(centerId);
    if (data) applyCenter(data);
    else applyCenter(getCenterPrintMeta());
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
    localStorage.setItem('scs_session', JSON.stringify(user));
    localStorage.setItem('scs_current_uid', user.centerId || user.uid);
    setCurrentUser(user);
    setSubscriptionStatus(user.subscription);

    if (user.isPlatformAdmin) {
      const centerData = await getCenterSettings(user.centerId || user.uid);
      if (centerData) applyCenter(centerData);
      else applyCenter(getCenterPrintMeta());
      setSyncing(true);
      syncFromFirebase(user.centerId || user.uid, ALL_KEYS)
        .finally(() => { setSyncing(false); setScreen('app'); setActiveView('admin'); });
      return;
    }

    if (user.subscription && !user.subscription.allowed) {
      setScreen('subscription');
      return;
    }

    const centerData = await getCenterSettings(user.centerId);
    applyCenter(centerData || getCenterPrintMeta());

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
    if (c.color) {
      applyTheme(c.color);
      localStorage.setItem('scs_color', c.color);
    }
    if (c.name) document.title = c.name;
    persistCenterMeta({
      name: c.name,
      nameEn: c.nameEn,
      logo: c.logo,
      type: c.type,
      address: c.address,
      phone: c.phone,
      phoneCode: c.phoneCode,
      email: c.email,
      currency: c.currency,
      barcode: c.barcode,
      socialLinks: { website: c.website, whatsapp: c.whatsapp, instagram: c.instagram },
      shifts: c.shifts,
    });
  }, []);

  const updateCenterColor = useCallback((color) => {
    applyTheme(color);
    localStorage.setItem('scs_color', color);
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
        <div style={{color:'var(--g5)',fontSize:'.85rem'}}>يتم جلب وحفظ بياناتك السحابية بأمان</div>
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
