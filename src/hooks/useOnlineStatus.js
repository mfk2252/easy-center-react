import { useEffect, useState } from 'react';
import { getPendingCount, onQueueChange, processQueue } from '../utils/offlineQueue';

export function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pending, setPending] = useState(getPendingCount());

  useEffect(() => {
    const goOnline = () => { setOnline(true); processQueue(); };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    const unsub = onQueueChange(setPending);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      unsub();
    };
  }, []);

  return { online, pending };
}
