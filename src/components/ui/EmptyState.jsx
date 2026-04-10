export default function EmptyState({ icon='📭', title='لا توجد بيانات', sub='', action }) {
  return (
    <div className="empty">
      <div className="ei">{icon}</div>
      <div className="et">{title}</div>
      {sub && <div className="es">{sub}</div>}
      {action && <div style={{marginTop:12}}>{action}</div>}
    </div>
  );
}
