import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getCenterSettings } from '../firebase/db';
import { signOutUser } from '../firebase/auth';

const AppContext = createContext(null);

function applyTheme(color) {
  if (!color) return;
  document.documentElement.style.setProperty('--pr', color);
  const h = color.replace('#', '');
  const r = parseInt(h.substr(0,2),16), g = parseInt(h.substr(2,2),16), b = parseInt(h.substr(4,2),16);
  document.documentElement.style.setProperty('--pr-d', `rgb(${Math.max(0,r-35)},${Math.max(0,g-35)},${Math.max(0,b-35)})`);
  document.documentElement.style.setProperty('--pr-l', `rgba(${r},${g},${b},0.1)`);
}

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('loading');
  const [center, setCenter] = useState({ name:'', logo:'', color:'#1a56db', configured:false });
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dash');
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const toastTimers = useRef({});

  useEffect(() => {
    const dm = localStorage.getItem('darkMode') === '1';
    if (dm) { document.body.classList.add('dark'); setDarkMode(true); }
    const fs = localStorage.getItem('scs_fontsize');
    const fw = localStorage.getItem('scs_fontweight');
    if (fs) document.documentElement.style.setProperty('--fs', fs + 'px');
    if (fw) document.documentElement.style.setProperty('--fw', fw);
  }, []);

  useEffect(() => {
    const savedSession = (() => {
      try { return JSON.parse(localStorage.getItem('scs_session') || 'null'); }
      catch(e) { return null; }
    })();

    if (savedSession && savedSession.centerId) {
      setCurrentUser(savedSession);
      loadCenterData(savedSession.centerId);
      setScreen('app');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const centerData = await getCenterSettings(firebaseUser.uid);
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'المدير',
          photo: firebaseUser.photoURL,
          role: 'manager',
          centerId: firebaseUser.uid,
        };
        // حفظ uid لاستخدامه في useStorage
        localStorage.setItem('scs_current_uid', firebaseUser.uid);
        setCurrentUser(user);
        if (centerData) {
          const c = {
            name: centerData.name || '',
            logo: centerData.logo || '',
            color: centerData.color || '#1a56db',
            type: centerData.type || '',
            phone: centerData.phone || '',
            configured: centerData.isSetup || false
          };
          setCenter(c);
          applyTheme(c.color);
          document.title = c.name || 'نظام إدارة المركز';
          setScreen(centerData.isSetup ? 'app' : 'setup');
        } else {
          setScreen('setup');
        }
      } else {
        setCurrentUser(null);
        setScreen('login');
      }
    });

    return () => unsubscribe();
  }, []);

  async function loadCenterData(centerId) {
    const centerData = await getCenterSettings(centerId);
    if (centerData) {
      const c = {
        name: centerData.name || '',
        logo: centerData.logo || '',
        color: centerData.color || '#1a56db',
        type: centerData.type || '',
        phone: centerData.phone || '',
        configured: centerData.isSetup || false
      };
      setCenter(c);
      applyTheme(c.color);
      document.title = c.name || 'نظام إدارة المركز';
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toast = useCallback((msg, type = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    toastTimers.current[id] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete toastTimers.current[id];
    }, 3500);
  }, []);

  const toggleDark = useCallback(() => {
    setDarkMode(d => {
      const next = !d;
      document.body.classList.toggle('dark', next);
      localStorage.setItem('darkMode', next ? '1' : '0');
      return next;
    });
  }, []);

  const login = useCallback((user) => {
    if (user.role !== 'manager') {
      localStorage.setItem('scs_session', JSON.stringify(user));
    }
    setCurrentUser(user);
    setScreen('app');
    setActiveView('dash');
    loadCenterData(user.centerId);
  }, []);

  const logout = useCallback(async () => {
    try { await signOutUser(); } catch(e) {}
    localStorage.removeItem('scs_session');
    localStorage.removeItem('userPerms');
    localStorage.removeItem('scs_current_uid');
    setCurrentUser(null);
    setCenter({ name:'', logo:'', color:'#1a56db', configured:false });
    setScreen('login');
  }, []);

  const go = useCallback((view) => setActiveView(view), []);

  const updateCenterData = useCallback((newCenter) => {
    setCenter(newCenter);
    applyTheme(newCenter.color);
    document.title = newCenter.name || 'نظام إدارة المركز';
  }, []);

  const updateCenterColor = useCallback((color) => {
    applyTheme(color);
    setCenter(prev => ({ ...prev, color }));
  }, []);

  const persistConfig = useCallback((newCenter) => {
    updateCenterData(newCenter);
  }, [updateCenterData]);

  const resetCenter = useCallback(() => {
    if (currentUser?.role !== 'manager') {
      toast('⚠️ إعادة الإعداد متاحة للمدير الرئيسي فقط', 'er');
      return;
    }
    if (!window.confirm('⚠️ هل أنت متأكد من تسجيل الخروج وإعادة الإعداد؟')) return;
    logout();
  }, [currentUser, toast, logout]);

  return (
    <AppContext.Provider value={{
      screen, center, currentUser, activeView, darkMode,
      toasts, searchOpen,
      fbCfg: {}, fbReady: true,
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
