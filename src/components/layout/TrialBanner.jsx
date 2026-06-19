import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function TrialBanner() {
  const { currentUser, subscriptionStatus } = useApp();
  const [dismissed, setDismissed] = useState(false);

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
