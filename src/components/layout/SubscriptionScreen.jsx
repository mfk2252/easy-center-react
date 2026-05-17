import { useApp } from '../../context/AppContext';

export default function SubscriptionScreen({ reason, daysLeft, message }) {
  const { logout } = useApp();

  const isTrialExpired = reason === 'trial_expired';
  const isExpired = reason === 'expired';
  const isSuspended = reason === 'suspended';
  const isTrial = reason === 'trial';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        background: 'var(--card)',
        borderRadius: 20,
        padding: '40px 32px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        textAlign: 'center'
      }}>
        {/* Icon */}
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>
          {isTrial ? '⏳' : isSuspended ? '🔒' : '💳'}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>
          {isTrial && `متبقي ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'} من التجربة`}
          {isTrialExpired && 'انتهت فترة التجربة المجانية'}
          {isExpired && 'انتهى اشتراكك'}
          {isSuspended && 'تم إيقاف الحساب'}
        </h1>

        {/* Message */}
        <p style={{ color: 'var(--g5)', fontSize: '.9rem', marginBottom: 28, lineHeight: 1.7 }}>
          {isTrial && 'استمتع بتجربة النظام مجاناً. بعد انتهاء التجربة يمكنك الاشتراك للاستمرار.'}
          {isTrialExpired && 'لقد انتهت فترة التجربة المجانية (5 أيام). اشترك الآن للاستمرار في استخدام النظام.'}
          {isExpired && 'انتهت صلاحية اشتراكك. جدّده الآن للاستمرار.'}
          {isSuspended && (message || 'تم إيقاف حسابك. تواصل مع الدعم الفني.')}
        </p>

        {/* Pricing */}
        {!isSuspended && (
          <div style={{
            background: 'var(--pr-l)',
            border: '2px solid var(--pr)',
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 24
          }}>
            <div style={{ fontSize: '.85rem', color: 'var(--g5)', marginBottom: 4 }}>الاشتراك الشهري</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--pr)' }}>
              100 <span style={{ fontSize: '1rem' }}>ريال</span>
            </div>
            <div style={{ fontSize: '.8rem', color: 'var(--g5)', marginTop: 4 }}>شهرياً — جميع الميزات مشمولة</div>
            <div style={{ marginTop: 12, fontSize: '.8rem', color: 'var(--g5)' }}>
              ✅ طلاب غير محدودين<br/>
              ✅ موظفون غير محدودين<br/>
              ✅ حفظ سحابي آمن<br/>
              ✅ دعم فني متواصل
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        {isTrial ? (
          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <a
              href="https://wa.me/966503XXXXXX?text=أريد الاشتراك في نظام إدارة المركز"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block',
                background: '#25D366',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '.95rem'
              }}
            >
              💬 تواصل معنا للاشتراك
            </a>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: '1px solid var(--g3)',
                borderRadius: 10,
                padding: '10px 24px',
                cursor: 'pointer',
                color: 'var(--g5)',
                fontFamily: 'Tajawal, sans-serif',
                fontSize: '.85rem'
              }}
            >
              تسجيل الخروج
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <a
              href="https://wa.me/966503XXXXXX?text=أريد تجديد اشتراكي في نظام إدارة المركز"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block',
                background: 'var(--pr)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '.95rem'
              }}
            >
              💬 تواصل معنا عبر واتساب
            </a>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: '1px solid var(--g3)',
                borderRadius: 10,
                padding: '10px 24px',
                cursor: 'pointer',
                color: 'var(--g5)',
                fontFamily: 'Tajawal, sans-serif',
                fontSize: '.85rem'
              }}
            >
              تسجيل الخروج
            </button>
          </div>
        )}

        {/* Contact info */}
        <div style={{
          marginTop: 24,
          padding: '12px',
          background: 'var(--g0)',
          borderRadius: 8,
          fontSize: '.78rem',
          color: 'var(--g5)'
        }}>
          📧 للتواصل: mfekry225@outlook.com<br/>
          💬 واتساب: 966503XXXXXX+
        </div>
      </div>
    </div>
  );
}
