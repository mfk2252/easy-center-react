export default function Modal({ id, size='', children, onClose }) {
  return (
    <div className="mbg">
      <div className={`mb ${size}`}>
        {children}
      </div>
    </div>
  );
}
