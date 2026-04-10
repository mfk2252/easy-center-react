import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();
  const typeClass = { ok:'toast-ok', er:'toast-er', warn:'toast-warn', bl:'toast-info', info:'toast-info' };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item ${typeClass[t.type] || 'toast-info'}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
