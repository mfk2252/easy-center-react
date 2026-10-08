import { useEffect, useState } from 'react';

/**
 * شريط "يتوفر تحديث" — لا نعيد تحميل الصفحة تلقائياً أبداً، فقد يكون المستخدم يكتب في نموذج.
 * كما نضيف حماية عامة: إن كان أي نموذج/نافذة مفتوحاً فلن يُغلق المتصفح الصفحة أو يعيد تحميلها بصمت.
 */
export default function UpdateBanner() {
  const [ready, setReady] = useState(() => !!window.__scsSwWaiting);
  const [snoozed, setSnoozed] = useState(false);

  useEffect(() => {
    const on = () => setReady(true);
    window.addEventListener('scs_sw_update', on);
    return () => window.removeEventListener('scs_sw_update', on);
  }, []);

  useEffect(() => {
    const guard = e => {
      if (window.__scsApplyingUpdate) return; // المستخدم أكّد التحديث بنفسه
      if (document.querySelector('.mbg')) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, []);

  if (!ready || snoozed) return null;

  function applyUpdate() {
    if (document.querySelector('.mbg') &&
        !window.confirm('هناك نموذج مفتوح لم يُحفظ بعد، وسيُفقد عند التحديث. هل تريد المتابعة؟')) return;
    window.__scsApplyingUpdate = true;
    const w = window.__scsSwWaiting;
    if (w) w.postMessage({ type: 'SKIP_WAITING' });
    // احتياط: إن لم يصل حدث التبديل خلال 3 ثوانٍ نُعيد التحميل يدوياً
    setTimeout(() => window.location.reload(), w ? 3000 : 0);
  }

  function later() {
    setSnoozed(true);
    setTimeout(() => setSnoozed(false), 30 * 60 * 1000);
  }

  const btn = { background: 'rgba(255,255,255,.2)', border: 'none', color: 'white', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 };
  return (
    <div className="no-print" style={{
      position: 'fixed', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
      background: 'var(--pr)', color: 'white', borderRadius: 10, padding: '8px 14px',
      boxShadow: '0 6px 24px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', gap: 10,
      flexWrap: 'wrap', justifyContent: 'center', maxWidth: 'calc(100vw - 20px)', fontSize: '.82rem', fontWeight: 700,
    }}>
      <span>🔄 يتوفر تحديث جديد للنظام — احفظ عملك أولاً ثم اضغط تحديث</span>
      <button type="button" style={btn} onClick={applyUpdate}>تحديث الآن</button>
      <button type="button" style={btn} onClick={later}>لاحقاً</button>
    </div>
  );
}
