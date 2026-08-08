import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { lsAdd } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';
import { PROGRAMS, DOMAINS, domainsForProgram, programLabel, domainLabel } from '../../utils/goalsBank';

/**
 * مكوّن استيراد الأهداف الضخمة (Bulk Import)
 * يدعم ثلاثة مصادر:
 * 1) رفع ملف JSON (بحسب goalsSchema.json)
 * 2) رفع ملف CSV (العمود الأول: program, الثاني: domain, الثالث: code, الرابع: text, الخامس: mastery, السادس: tools, السابع: ageRange)
 * 3) لصق نصوص من Word/PDF مباشرة وتجزئتها تلقائياً إلى أهداف منفصلة
 */
export default function BulkImporter({ onClose, onDone }) {
  const { toast } = useApp();
  const [activeTab, setActiveTab] = useState('file'); // file | paste
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);

  // إعدادات اللصق اليدوي
  const [pasteText, setPasteText] = useState('');
  const [pasteProgram, setPasteProgram] = useState('custom');
  const pasteDomains = domainsForProgram(pasteProgram);
  const [pasteDomain, setPasteDomain] = useState(pasteDomains[0]?.key || 'cognitive');

  /* ───────────── معالجة الملفات ───────────── */
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(ev.target.result);
          if (!Array.isArray(data)) throw new Error('الملف يجب أن يكون مصفوفة JSON');
          validateAndPreview(data);
        } else if (file.name.endsWith('.csv')) {
          parseCSV(ev.target.result);
        } else {
          toast('⚠️ الصيغ المدعومة: JSON أو CSV فقط', 'er');
        }
      } catch (err) {
        toast('❌ خطأ في قراءة الملف: ' + err.message, 'er');
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  }

  function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const isHeader = l => isNaN(l.split(',')[0]) && l.toLowerCase().includes('program');
    const start = isHeader(lines[0]) ? 1 : 0;
    const rows = lines.slice(start).map(line => {
      const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
      return {
        program: (cols[0] || 'custom').toLowerCase(),
        domain: (cols[1] || 'cognitive').toLowerCase(),
        code: cols[2] || '',
        text: cols[3] || '',
        mastery: cols[4] || '',
        tools: cols[5] || '',
        ageRange: cols[6] || '',
      };
    }).filter(r => r.text);
    validateAndPreview(rows);
  }

  function validateAndPreview(rows) {
    const validPrograms = PROGRAMS.map(p => p.key);
    const validDomains = DOMAINS.map(d => d.key);
    const validated = rows.map(r => ({
      ...r,
      program: validPrograms.includes(r.program) ? r.program : 'custom',
      domain: validDomains.includes(r.domain) ? r.domain : 'cognitive',
      _valid: !!r.text?.trim(),
    }));
    const valid = validated.filter(r => r._valid);
    const invalid = validated.length - valid.length;
    if (invalid > 0) toast(`⚠️ تم تجاهل ${invalid} صفوف بدون نص`, 'warn');
    setPreview(valid);
    if (valid.length > 0) toast(`✅ جاهز لاستيراد ${valid.length} هدفاً`, 'ok');
    else toast('⚠️ لا توجد أهداف صالحة للاستيراد', 'er');
  }

  /* ───────────── معالجة اللصق اليدوي ───────────── */
  function parsePaste() {
    if (!pasteText.trim()) { toast('⚠️ الصق النص أولاً', 'er'); return; }
    // تجزئة حسب السطر أو النقطة أو الأرقام في بداية السطر (1. 2. -  •)
    const lines = pasteText
      .split(/\n|(?<=\.)(?=\s*\d+\.)|(?<=;)/)
      .map(l => l.replace(/^[\s\d\.\-•\*]+/, '').trim())
      .filter(l => l.length > 5);

    const rows = lines.map(text => ({
      program: pasteProgram,
      domain: pasteDomain,
      code: '',
      text,
      mastery: '',
      tools: '',
      ageRange: '',
      _valid: true,
    }));

    setPreview(rows);
    toast(`✅ تم استخلاص ${rows.length} هدفاً — راجعها قبل الاستيراد`, 'ok');
  }

  /* ───────────── الاستيراد الفعلي ───────────── */
  async function doImport() {
    if (preview.length === 0) { toast('⚠️ لا توجد أهداف للاستيراد', 'er'); return; }
    if (!window.confirm(`استيراد ${preview.length} هدفاً لبنك مركزك؟`)) return;
    setImporting(true);
    let count = 0;
    for (const g of preview) {
      lsAdd('progGoalsBank', {
        id: uid(),
        program: g.program,
        domain: g.domain,
        code: g.code || '',
        text: g.text,
        mastery: g.mastery || '',
        tools: g.tools || '',
        ageRange: g.ageRange || '',
      });
      count++;
    }
    toast(`✅ تم استيراد ${count} هدفاً بنجاح`, 'ok');
    setImporting(false);
    setPreview([]);
    onDone?.();
  }

  function updatePreviewRow(i, field, value) {
    setPreview(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  function removePreviewRow(i) {
    setPreview(prev => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        <div className="fhd" style={{ padding: '14px 20px' }}>
          <h2>📥 استيراد أهداف ضخمة لبنك المركز</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>رفع JSON/CSV أو لصق نصوص من Word مباشرة — مع مراجعة قبل الحفظ</p>
        </div>

        <div className="modal-body-scroll" style={{ padding: '16px 20px' }}>
          <div className="tabs" style={{ marginBottom: 16 }}>
            <button type="button" className={`tab ${activeTab === 'file' ? 'on' : ''}`} onClick={() => { setActiveTab('file'); setPreview([]); }}>📂 رفع ملف (JSON/CSV)</button>
            <button type="button" className={`tab ${activeTab === 'paste' ? 'on' : ''}`} onClick={() => { setActiveTab('paste'); setPreview([]); }}>📋 لصق من Word/PDF</button>
          </div>

          {/* رفع ملف */}
          {activeTab === 'file' && (
            <div>
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📂</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>ارفع ملف JSON أو CSV</div>
                <p style={{ fontSize: '.8rem', color: 'var(--g5)', marginBottom: 12 }}>
                  JSON: مصفوفة موافقة للـ Schema · CSV: program, domain, code, text, mastery, tools, ageRange
                </p>
                <label className="btn btn-p" style={{ cursor: 'pointer' }}>
                  اختر ملفاً
                  <input type="file" accept=".json,.csv" style={{ display: 'none' }} onChange={handleFile} />
                </label>
              </div>
              <div style={{ padding: 12, background: 'var(--g0)', borderRadius: 8, fontSize: '.78rem', color: 'var(--g5)' }}>
                <strong>مثال CSV:</strong><br />
                <code style={{ direction: 'ltr', display: 'block', marginTop: 4 }}>
                  program,domain,code,text,mastery,tools,ageRange<br />
                  ablls,receptive_language,ABLLS:C14,يتبع تعليمة ثنائية الخطوات,4/5 عشوائي,أشياء يومية,2-3 سنوات
                </code>
              </div>
            </div>
          )}

          {/* لصق من Word */}
          {activeTab === 'paste' && (
            <div>
              <div className="fg c2" style={{ marginBottom: 12 }}>
                <div className="fl"><label>البرنامج المرجعي</label>
                  <select value={pasteProgram} onChange={e => { setPasteProgram(e.target.value); setPasteDomain(domainsForProgram(e.target.value)[0]?.key || 'cognitive'); }}>
                    {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
                <div className="fl"><label>المجال</label>
                  <select value={pasteDomain} onChange={e => setPasteDomain(e.target.value)}>
                    {domainsForProgram(pasteProgram).map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="fl full" style={{ marginBottom: 12 }}>
                <label>الصق قائمة الأهداف (سطر أو نقطة لكل هدف)</label>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  rows={8}
                  placeholder={`1. يتبع تعليمة أحادية الخطوة\n2. يسمّي 5 صور مألوفة\n3. يطابق الألوان الأربعة الأساسية\n...`}
                />
              </div>
              <button type="button" className="btn btn-p" onClick={parsePaste}>🔍 استخلاص الأهداف من النص</button>
            </div>
          )}

          {/* معاينة وتعديل قبل الاستيراد */}
          {preview.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontWeight: 900, fontSize: '.9rem' }}>📋 معاينة — {preview.length} هدف (راجع وعدّل قبل الاستيراد)</div>
                <button type="button" className="btn btn-g btn-sm" onClick={() => setPreview([])}>مسح الكل</button>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 10 }}>
                {preview.map((g, i) => (
                  <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 8, alignItems: 'center' }}>
                    <select value={g.program} onChange={e => updatePreviewRow(i, 'program', e.target.value)} style={{ fontSize: '.78rem', padding: '3px 6px' }}>
                      {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                    <select value={g.domain} onChange={e => updatePreviewRow(i, 'domain', e.target.value)} style={{ fontSize: '.78rem', padding: '3px 6px' }}>
                      {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                    </select>
                    <input value={g.text} onChange={e => updatePreviewRow(i, 'text', e.target.value)} style={{ fontSize: '.82rem', padding: '3px 8px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-input)', color: 'var(--text-main)' }} />
                    <button type="button" className="btn btn-xs btn-d" onClick={() => removePreviewRow(i)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="fa">
          {preview.length > 0 && (
            <button type="button" className="btn btn-p" onClick={doImport} disabled={importing}>
              {importing ? '⏳ جارٍ الاستيراد...' : `💾 استيراد ${preview.length} هدف للبنك`}
            </button>
          )}
          <button type="button" className="btn btn-g" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
