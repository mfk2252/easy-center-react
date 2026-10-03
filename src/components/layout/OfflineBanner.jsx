import { useEffect, useState } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { getSyncFailures, onSyncFailuresChange, clearSyncFailures } from '../../utils/syncFailures';

export default function OfflineBanner() {
  const { online, pending } = useOnlineStatus();
  const [failures, setFailures] = useState(getSyncFailures());
  const [open, setOpen] = useState(false);

  useEffect(() => onSyncFailuresChange(setFailures), []);

  if (online && pending === 0 && failures.length === 0) return null;

  return (
    <>
      {failures.length > 0 && (
        <div className="no-print" style={{ background: 'var(--err)', color: 'white', fontSize: '.78rem', fontWeight: 700, padding: '6px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', textAlign: 'center' }}>
            <span>⚠️ {failures.length} تغيير لم يُحفظ في السحابة — موجود على هذا الجهاز فقط</span>
            <button type="button" onClick={() => setOpen(o => !o)} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: 'white', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
              {open ? 'إخفاء التفاصيل' : 'التفاصيل'}
            </button>
            <button type="button" onClick={() => { clearSyncFailures(); setOpen(false); }} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: 'white', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
              تجاهل
            </button>
          </div>
          {open && (
            <ul style={{ margin: '6px auto 0', padding: 0, listStyle: 'none', maxWidth: 560, textAlign: 'right', fontWeight: 500 }}>
              {failures.slice().reverse().map(f => (
                <li key={f.id} style={{ padding: '2px 0' }}>• {f.colLabel}: {f.reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {(!online || pending > 0) && (
        <div className="no-print" style={{
          background: online ? 'var(--warn)' : '#475569',
          color: 'white',
          textAlign: 'center',
          fontSize: '.78rem',
          fontWeight: 700,
          padding: '6px 10px',
        }}>
          {!online && '📡 لا يوجد اتصال بالإنترنت — التطبيق يعمل بدون اتصال، وسيتم حفظ كل التغييرات محلياً ومزامنتها تلقائياً عند عودة الاتصال.'}
          {online && pending > 0 && `☁️ جارٍ مزامنة ${pending} تغييراً مع الخادم...`}
        </div>
      )}
    </>
  );
}
