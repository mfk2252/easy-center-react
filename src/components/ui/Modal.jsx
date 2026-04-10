export default function Modal({ id, size='', children, onClose }) {
  return (
    <div className="mbg" onClick={e => { if(e.target === e.currentTarget && onClose) onClose(); }}>
      <div className={`mb ${size}`}>
        {children}
      </div>
    </div>
  );
}
