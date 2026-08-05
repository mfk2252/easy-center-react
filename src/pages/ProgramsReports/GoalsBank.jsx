import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';
import { PROGRAMS, DOMAINS, SEED_GOALS, programLabel, programColor, domainLabel, domainsForProgram } from '../../utils/goalsBank';

export function getAllGoals() {
  const custom = lsGet('progGoalsBank');
  const seeds = SEED_GOALS.map((g, i) => ({ ...g, id: `seed-${i}`, isSeed: true }));
  return [...seeds, ...custom];
}

export function GoalPickerModal({ domain, alreadySelected, onConfirm, onClose }) {
  const [checked, setChecked] = useState(() => new Set((alreadySelected || []).map(g => g.text)));
  const [customText, setCustomText] = useState('');
  const [customProgram, setCustomProgram] = useState('custom');
  const [saveToBank, setSaveToBank] = useState(true);

  const allGoals = getAllGoals().filter(g => g.domain === domain);
  const byProgram = PROGRAMS.map(p => ({ ...p, items: allGoals.filter(g => g.program === p.key) }))
    .filter(p => p.items.length > 0);

  function toggle(goal) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(goal.text)) next.delete(goal.text);
      else next.add(goal.text);
      return next;
    });
  }

  function addCustomNow() {
    if (!customText.trim()) return;
    if (saveToBank) {
      lsAdd('progGoalsBank', { id: uid(), program: customProgram, domain, text: customText.trim() });
    }
    setChecked(prev => new Set(prev).add(customText.trim()));
    setCustomText('');
  }

  function confirm() {
    const selected = allGoals.filter(g => checked.has(g.text));
    const rawExtras = [...checked].filter(t => !allGoals.some(g => g.text === t))
      .map(t => ({ program: customProgram, domain, text: t }));
    onConfirm([...selected, ...rawExtras]);
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="fhd" style={{ padding: '14px 20px' }}>
          <h2>🎯 اختيار أهداف — {domainLabel(domain)}</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>يمكنك الاختيار من أكثر من برنامج معاً لنفس المجال</p>
        </div>
        <div className="modal-body-scroll" style={{ padding: '16px 20px' }}>
          {byProgram.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--g4)' }}>
              لا توجد بنود في هذا المجال بعد — أضف بنداً مخصصاً بالأسفل
            </div>
          )}
          {byProgram.map(p => (
            <div key={p.key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '.8rem', fontWeight: 900, color: p.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} /> {p.label} ({p.items.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.items.map(g => (
                  <label key={g.id || g.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', background: checked.has(g.text) ? 'var(--ok-l)' : 'transparent', fontSize: '.86rem' }}>
                    <input type="checkbox" checked={checked.has(g.text)} onChange={() => toggle(g)} style={{ marginTop: 2 }} />
                    <span>{g.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: 14, background: 'var(--g0)', borderRadius: 10 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 800, marginBottom: 8 }}>➕ إضافة هدف مخصص لهذا المجال</div>
            <div className="fg c2">
              <div className="fl"><label>البرنامج المصدر</label>
                <select value={customProgram} onChange={e => setCustomProgram(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl"><label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={saveToBank} onChange={e => setSaveToBank(e.target.checked)} />
                احفظه في بنك المركز لإعادة استخدامه لاحقاً
              </label></div>
              <div className="fl full"><label>نص الهدف</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={customText} onChange={e => setCustomText(e.target.value)} placeholder="اكتب نص الهدف..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addCustomNow()} />
                  <button type="button" className="btn btn-s btn-sm" onClick={addCustomNow}>➕ إضافة</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fa">
          <button type="button" className="btn btn-p" onClick={confirm}>✅ تأكيد الاختيار ({checked.size})</button>
          <button type="button" className="btn btn-g" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

export function GoalsBankManagerModal({ onClose }) {
  const { toast } = useApp();
  const [filterDomain, setFilterDomain] = useState('all');
  const [customBank, setCustomBank] = useState(lsGet('progGoalsBank'));
  const [newProgram, setNewProgram] = useState('custom');
  const availableDomains = domainsForProgram(newProgram);
  const [newDomain, setNewDomain] = useState(availableDomains[0]?.key || DOMAINS[0].key);
  const [newText, setNewText] = useState('');

  function reload() { setCustomBank(lsGet('progGoalsBank')); }

  function handleProgramChange(programKey) {
    setNewProgram(programKey);
    const domains = domainsForProgram(programKey);
    setNewDomain(domains[0]?.key || DOMAINS[0].key);
  }

  function addItem() {
    if (!newText.trim()) { toast('⚠️ اكتب نص الهدف', 'er'); return; }
    lsAdd('progGoalsBank', { id: uid(), program: newProgram, domain: newDomain, text: newText.trim() });
    setNewText('');
    toast('✅ تمت الإضافة لبنك المركز', 'ok');
    reload();
  }

  function del(id) {
    if (!window.confirm('حذف هذا البند من بنك المركز؟')) return;
    lsDel('progGoalsBank', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  const filtered = filterDomain === 'all' ? customBank : customBank.filter(g => g.domain === filterDomain);

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="fhd" style={{ padding: '14px 20px' }}>
          <h2>🗂️ إدارة بنك الأهداف الخاص بمركزك</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>أضف بنود دليلكم الرسمي المرخّص (لوفاس/بورتاج/إيبلز أو أي منهج آخر) لتظهر عند اختيار الأهداف لاحقاً</p>
        </div>
        <div className="modal-body-scroll" style={{ padding: '16px 20px' }}>
          <div style={{ padding: 14, background: 'var(--g0)', borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 800, marginBottom: 8 }}>➕ إضافة بند جديد للبنك</div>
            <div className="fg c3">
              <div className="fl"><label>1️⃣ البرنامج <span className="req">*</span></label>
                <select value={newProgram} onChange={e => handleProgramChange(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl">
                <label>2️⃣ المجال <span className="req">*</span></label>
                <select value={newDomain} onChange={e => setNewDomain(e.target.value)}>
                  {availableDomains.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
                <p style={{ fontSize: '.7rem', color: 'var(--g5)', marginTop: 4 }}>
                  {newProgram === 'custom' ? 'كل المجالات متاحة (غير مقيَّد بمنهج واحد)' : `مجالات ${programLabel(newProgram)} فقط`}
                </p>
              </div>
              <div className="fl"><label>&nbsp;</label>
                <button type="button" className="btn btn-p" onClick={addItem}>➕ إضافة</button>
              </div>
              <div className="fl full"><label>3️⃣ نص الهدف <span className="req">*</span></label>
                <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="اكتب نص الهدف كما في دليلكم..." onKeyDown={e => e.key === 'Enter' && addItem()} />
              </div>
            </div>
          </div>

          <div className="tabs" style={{ marginBottom: 12 }}>
            <button type="button" className={`tab ${filterDomain === 'all' ? 'on' : ''}`} onClick={() => setFilterDomain('all')}>الكل ({customBank.length})</button>
            {DOMAINS.map(d => (
              <button key={d.key} type="button" className={`tab ${filterDomain === d.key ? 'on' : ''}`} onClick={() => setFilterDomain(d.key)}>{d.label}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--g4)' }}>لا توجد بنود مخصّصة بعد في هذا الفلتر</div>
          ) : (
            filtered.map(g => (
              <div key={g.id} className="card">
                <div className="av" style={{ background: programColor(g.program) + '22', color: programColor(g.program) }}>{programLabel(g.program).slice(0, 2)}</div>
                <div className="ci">
                  <div className="cn">{g.text}</div>
                  <div className="cm">{programLabel(g.program)} · {domainLabel(g.domain)}</div>
                </div>
                <div className="c-acts"><button type="button" className="btn btn-xs btn-d" onClick={() => del(g.id)}>🗑️</button></div>
              </div>
            ))
          )}
        </div>
        <div className="fa">
          <button type="button" className="btn btn-g" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
