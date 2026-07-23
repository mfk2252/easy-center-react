import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const { online, pending } = useOnlineStatus();
  if (online && pending === 0) return null;

  return (
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
  );
}
