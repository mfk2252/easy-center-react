import { handleFileInputChange, FILE_ACCEPT_DOCS } from '../../utils/fileUpload';

export default function AttachmentField({ fileData, fileName, onAttach, onClear, onError, label = 'إضافة مرفق' }) {
  async function onFile(e) {
    try {
      const res = await handleFileInputChange(e, { allowPdf: true, allowDoc: true });
      if (res) onAttach(res.data, res.name);
    } catch (ex) {
      const msg = ex.i18nKey === 'file.tooLarge'
        ? 'حجم الملف يتجاوز 2 ميجابايت'
        : 'نوع الملف غير مدعوم';
      throw new Error(msg);
    }
  }

  return (
    <div className="fl full">
      <label>{label}</label>
      <input type="file" accept={FILE_ACCEPT_DOCS} onChange={async e => {
        try { await onFile(e); }
        catch (err) {
          const msg = err?.message || 'خطأ في المرفق';
          if (onError) onError(msg);
          else if (onClear) onClear(msg);
          else alert(msg);
        }
      }}/>
      {fileName && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.78rem', color: 'var(--ok)' }}>📎 تم إرفاق ملف</span>
          {fileData?.startsWith('data:image') && (
            <img src={fileData} alt="" style={{ maxHeight: 48, borderRadius: 6, border: '1px solid var(--border-color)' }}/>
          )}
          <button type="button" className="btn btn-xs btn-d" onClick={() => onAttach('', '')}>إزالة</button>
        </div>
      )}
    </div>
  );
}
