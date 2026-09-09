import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function TrialBanner() {
  const { currentUser, subscriptionStatus, logout, center } = useApp();
  const [dismissed, setDismissed] = useState(false);

  // إذا كان الحساب ديمو تجريبي معزول
  if (currentUser?.isDemo) {
    const daysLeft = currentUser?.demoAccount?.daysLeft || subscriptionStatus?.daysLeft || 3;
    const cName = currentUser?.demoAccount?.centerName || center?.name || 'العرض التجريبي';
    return (
      <div
        id="demo-mode-indicator-bar"
        style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontSize: '.84rem',
          fontWeight: 600,
          flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          borderBottom: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>🎮</span>
          <span>
            <strong>بيئة تجريبية معزولة:</strong> أنت تتصفح العرض المخصص لـ <u style={{ textDecorationColor: '#93c5fd' }}>{cName}</u> (متبقي <strong>{daysLeft} {daysLeft === 1 ? 'يوم' : 'أيام'}</strong>). البيانات نموذجية مستقلة 100% ولا تظهر بيانات المركز الأساسي.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            id="demo-exit-btn"
            onClick={() => logout()}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '5px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            <span>🚪</span>
            <span>خروج من الديمو والعودة للحساب الأساسي</span>
          </button>
        </div>
      </div>
    );
  }

  const sub = subscriptionStatus || currentUser?.subscription;
  if (!sub || sub.reason !== 'trial' || dismissed) return null;

  const daysLeft = sub.daysLeft || 0;
  const isUrgent = daysLeft <= 2;

  return (
    <div style={{
      background: isUrgent ? 'var(--err)' : 'var(--warn)',
      color: 'white',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      fontSize: '.82rem',
      fontWeight: 600,
      flexWrap: 'wrap'
    }}>
      <span>
        {isUrgent ? '🚨' : '⏳'} فترة التجربة المجانية — متبقي{' '}
        <strong>{daysLeft} {daysLeft === 1 ? 'يوم' : 'أيام'}</strong> فقط
      </span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <a
          href="https://wa.me/966503XXXXXX?text=أريد الاشتراك في نظام إدارة المركز"
          target="_blank"
          rel="noreferrer"
          style={{
            background: 'white',
            color: isUrgent ? 'var(--err)' : 'var(--warn)',
            padding: '4px 12px',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '.78rem',
            whiteSpace: 'nowrap'
          }}
        >
          اشترك الآن
        </a>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0 4px'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
