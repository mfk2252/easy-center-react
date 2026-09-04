import React from 'react';

/**
 * UnifiedBackButton (زر العودة الموحد)
 * مكون قياسي موحد لجميع شاشات وأقسام النظام للرجوع إلى القائمة أو الصفحة السابقة.
 * يوضع دائماً في الجهة اليسرى داخل حاوية ترويسة/عنوان القسم لتوفير تجربة بصرية وتفاعلية متناسقة.
 *
 * @param {Function} onClick دالة الرجوع
 * @param {string} label نص الزر (افتراضياً: 'العودة للقائمة السابقة')
 * @param {string} title تلميح عند التحويم (tooltip)
 * @param {string} className فئات CSS إضافية
 * @param {object} style كائن التنسيقات المخصصة
 * @param {boolean} showIcon إظهار سهم الرجوع
 * @param {React.ReactNode} customIcon أيقونة بديلة مخصصة
 * @param {'default'|'sm'|'xs'} size حجم الزر
 */
export default function UnifiedBackButton({
  onClick,
  label = 'العودة للقائمة السابقة',
  title,
  className = '',
  style = {},
  showIcon = true,
  customIcon = null,
  size = 'default',
  ...props
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'xs' ? 'btn-xs' : '';
  const combinedClasses = `btn-unified-back ${sizeClass} ${className}`.trim();

  return (
    <button
      type="button"
      onClick={onClick}
      className={combinedClasses}
      style={style}
      title={title || label}
      aria-label={label}
      {...props}
    >
      {showIcon && (
        customIcon || (
          <span className="back-arrow-icon" aria-hidden="true">
            ←
          </span>
        )
      )}
      <span>{label}</span>
    </button>
  );
}
