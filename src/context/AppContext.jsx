import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CFG_KEY } from '../utils/constants';
import { initFirebase } from '../hooks/useFirestore';

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
  const [screen, setScreen] = useState('loading'); // 'loading' | 'setup' | 'login' | 'app'
  const [center, setCenter] = useState({ name:'', logo:'', color:'#1a56db', configured:false });
  const [fbCfg, setFbCfg] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dash');
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [fbReady, setFbReady] = useState(false);
  const toastTimers = useRef({});

  // Boot: load config from localStorage
  useEffect(() => {
    const saved = (() => { try { const r = localStorage.getItem(CFG_KEY); return r ? JSON.parse(r) : null; } catch(e) { return null; } })();
    const dm = localStorage.getItem('darkMode') === '1';
    if (dm) { document.body.classList.add('dark'); setDarkMode(true); }
    
    // font size/weight
    const fs = localStorage.getItem('scs_fontsize');
    const fw = localStorage.getItem('scs_fontweight');
    if (fs) document.documentElement.style.setProperty('--fs', fs + 'px');
    if (fw) document.documentElement.style.setProperty('--fw', fw);

    if (saved?.center?.configured) {
      const c = saved.center;
      setCenter(c);
      setFbCfg(saved.firebase || {});
      applyTheme(c.color);
      document.title = c.name || 'نظام إدارة المركز المتكامل';
      // init firebase
      if (saved.firebase?.apiKey) {
        initFirebase(saved.firebase).then(ok => setFbReady(ok));
      }
      setScreen('login');
    } else {
      setScreen('setup');
    }
  }, []);

  // Ctrl+K global search
  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); } if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const persistConfig = useCallback((newCenter, newFb) => {
    localStorage.setItem(CFG_KEY, JSON.stringify({ center: newCenter, firebase: newFb || {} }));
    setCenter(newCenter);
    setFbCfg(newFb || {});
    applyTheme(newCenter.color);
    document.title = newCenter.name || 'نظام إدارة المركز المتكامل';
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
    setCurrentUser(user);
    setScreen('app');
    setActiveView('dash');
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setScreen('login');
  }, []);

  const go = useCallback((view) => {
    setActiveView(view);
  }, []);

  const resetCenter = useCallback(() => {
    if (currentUser?.role !== 'manager') { toast('⚠️ إعادة الإعداد متاحة للمدير الرئيسي فقط', 'er'); return; }
    if (!window.confirm('⚠️ تحذير: هل أنت متأكد من إعادة إعداد المركز؟\nسيتم مسح إعدادات المركز فقط — البيانات ستبقى في Firebase.')) return;
    if (!window.confirm('🔴 تأكيد نهائي: هل تريد المتابعة؟\nلا يمكن التراجع عن هذا الإجراء.')) return;
    localStorage.removeItem(CFG_KEY);
    window.location.reload();
  }, [currentUser, toast]);

  const updateCenterColor = useCallback((color) => {
    applyTheme(color);
    const updated = { ...center, color };
    setCenter(updated);
    persistConfig(updated, fbCfg);
  }, [center, fbCfg, persistConfig]);

  return (
    <AppContext.Provider value={{
      screen, center, fbCfg, currentUser, activeView, darkMode,
      toasts, searchOpen, fbReady,
      setScreen, persistConfig, login, logout, go, toast,
      toggleDark, setSearchOpen, resetCenter, updateCenterColor, applyTheme
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
