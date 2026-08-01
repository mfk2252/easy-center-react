import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';
import { PROGRAMS, DOMAINS, SEED_GOALS, programLabel, programColor, domainLabel } from '../../utils/goalsBank';

/**
 * دالة لجمع الأهداف: الثابتة (من الملف) + المخصصة (من Firebase/LocalStorage)
 */
export function getAllGoals() {
  const custom = lsGet('progGoalsBank');
  const seeds = SEED_GOALS.map((g, i) => ({ ...g, id: `seed-${i}`, isSeed: true }));
  return [...seeds, ...custom];
}

/**
 * 1️⃣ نافذة اختيار الأهداف (تظهر عند إنشاء برنامج)
 * التعديلات: إضافة زر "تحديد الكل" لكل برنامج + شريط بحث سريع
 */
export function GoalPickerModal({ domain, alreadySelected, onConfirm, onClose }) {
  const [checked, setChecked] = useState(() => new Set((alreadySelected || []).map(g => g.text)));
  const [customText, setCustomText] = useState('');
  const [customProgram, setCustomProgram] = useState('custom');
  const [saveToBank, setSaveToBank] = useState(true);
  const [searchText, setSearchText] = useState('');

  // فلترة الأهداف حسب المجال المختار + البحث النصي
  const allGoals = useMemo(() => {
    const goals = getAllGoals().filter(g => g.domain === domain);
    if (!searchText.trim()) return goals;
    return goals.filter(g => g.text.includes(searchText));
  }, [domain, searchText]);

  // تجميع الأهداف حسب البرنامج
  const byProgram = useMemo(() => {
    return PROGRAMS.map(p => ({
      ...p,
      items: allGoals.filter(g => g.program === p.key)
    })).filter(p => p.items.length > 0);
  }, [allGoals]);

  function toggle(goal) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(goal.text)) next.delete(goal.text);
      else next.add(goal.text);
      return next;
    });
  }

  // ميزة تحديد الكل لبرنامج معين
  function toggleProgram(programKey) {
    const items = allGoals.filter(g => g.program === programKey);
    const allChecked = items.length > 0 && items.every(i => checked.has(i.text));
    
    setChecked(prev => {
      const next = new Set(prev);
      items.forEach(i => {
        if (allChecked) next.delete(i.text);
        else next.add(i.text);
      });
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
        
        {/* الرأس */}
        <div className="fhd" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2>🎯 اختيار أهداف — {domainLabel(domain)}</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>يمكنك الاختيار من أكثر من برنامج معاً</p>
        </div>

        {/* شريط البحث */}
        <div style={{ padding: '12px 20px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
          <input 
            type="text" 
            placeholder="🔍 ابحث عن هدف معين..." 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
          />
        </div>

        <div className="modal-body-scroll" style={{ padding: '20px' }}>
          {byProgram.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--g4)' }}>
              لا توجد أهداف في هذا المجال حتى الآن.
            </div>
          ) : (
            byProgram.map(p => {
              const count = p.items.length;
              const allChecked = count > 0 && p.items.every(i => checked.has(i.text));
              
              return (
                <div key={p.key} style={{ marginBottom: 24 }}>
                  {/* عنوان البرنامج مع زر تحديد الكل */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.color }} />
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: p.color }}>{p.label}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--g5)', background: 'var(--g1)', padding: '2px 8px', borderRadius: 12 }}>{count}</span>
                    </div>
                    <button 
                      type="button" 
                      className={`btn btn-xs ${allChecked ? 'btn-s' : 'btn-g'}`}
                      onClick={() => toggleProgram(p.key)}
                    >
                      {allChecked ? '☑️ إلغاء الكل' : '⬜ تحديد الكل'}
                    </button>
                  </div>

                  {/* قائمة الأهداف */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {p.items.map(g => (
                      <label key={g.id || g.text} style={{ 
                        display: 'flex', alignItems: 'flex-start', gap: 10, 
                        padding: '10px 12px', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 8, 
                        cursor: 'pointer', 
                        background: checked.has(g.text) ? 'var(--ok-l)' : 'transparent',
                        transition: 'all 0.2s'
                      }}>
                        <input type="checkbox" checked={checked.has(g.text)} onChange={() => toggle(g)} style={{ marginTop: 3, transform: 'scale(1.2)' }} />
                        <span style={{ flex: 1, lineHeight: 1.5, fontSize: '0.95rem' }}>{g.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* إضافة هدف مخصص سريع */}
          <div style={{ marginTop: 20, padding: 16, background: 'var(--g0)', borderRadius: 10, borderTop: '2px dashed var(--border-color)' }}>
            <div style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: 10 }}>➕ إضافة هدف يدوي لهذا المجال</div>
            <div className="fg c2">
              <div className="fl"><label>البرنامج</label>
                <select value={customProgram} onChange={e => setCustomProgram(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl"><label style={{ display: 'flex', alignItems: 'center', gap: 6, height: '100%' }}>
                <input type="checkbox" checked={saveToBank} onChange={e => setSaveToBank(e.target.checked)} />
                <span style={{fontSize: '.85rem'}}>حفظ في البنك</span>
              </label></div>
              <div className="fl full"><label>نص الهدف</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={customText} onChange={e => setCustomText(e.target.value)} placeholder="اكتب الهدف..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addCustomNow()} />
                  <button type="button" className="btn btn-s btn-sm" onClick={addCustomNow}>إضافة</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fa" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn btn-p" onClick={confirm}>✅ تأكيد ({checked.size})</button>
          <button type="button" className="btn btn-g" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

/**
 * 2️⃣ نافذة إدارة بنك الأهداف (للمشرفين فقط)
 * تعرض فقط الإضافات اليدوية للمركز، ولا تعرض الـ 800 هدف الجاهز لتجنب الزحمة.
 */
export function GoalsBankManagerModal({ onClose }) {
  const { toast } = useApp();
  const [filterDomain, setFilterDomain] = useState('all');
  const [customBank, setCustomBank] = useState(lsGet('progGoalsBank'));
  const [newProgram, setNewProgram] = useState('custom');
  const [newDomain, setNewDomain] = useState(DOMAINS[0].key);
  const [newText, setNewText] = useState('');

  function reload() { setCustomBank(lsGet('progGoalsBank')); }

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
          <h2>🗂️ إدارة بنك أهداف المركز</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>أضف هنا البنود الخاصة بدليلكم المرخّص (لا تظهر هنا أهداف لوفاس/بورتاج الجاهزة)</p>
        </div>
        
        <div className="modal-body-scroll" style={{ padding: '20px' }}>
          {/* نموذج الإضافة */}
          <div style={{ padding: 16, background: 'var(--g0)', borderRadius: 10, marginBottom: 20 }}>
            <div style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: 10 }}>➕ إضافة بند جديد للبنك</div>
            <div className="fg c3">
              <div className="fl"><label>البرنامج</label>
                <select value={newProgram} onChange={e => setNewProgram(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl"><label>المجال</label>
                <select value={newDomain} onChange={e => setNewDomain(e.target.value)}>
                  {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
              </div>
              <div className="fl"><label>&nbsp;</label>
                <button type="button" className="btn btn-p" onClick={addItem}>➕ حفظ</button>
              </div>
              <div className="fl full"><label>نص الهدف</label>
                <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="اكتب نص الهدف كما في دليلكم..." onKeyDown={e => e.key === 'Enter' && addItem()} />
              </div>
            </div>
          </div>

          {/* الفلتر */}
          <div className="tabs" style={{ marginBottom: 16, overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <button type="button" className={`tab ${filterDomain === 'all' ? 'on' : ''}`} onClick={() => setFilterDomain('all')}>الكل ({customBank.length})</button>
            {DOMAINS.map(d => (
              <button key={d.key} type="button" className={`tab ${filterDomain === d.key ? 'on' : ''}`} onClick={() => setFilterDomain(d.key)}>{d.label}</button>
            ))}
          </div>

          {/* القائمة */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--g4)' }}>لا توجد إضافات محلية في هذا الفلتر بعد.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filtered.map(g => (
                <div key={g.id} className="card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.7rem', fontWeight: 800, color: programColor(g.program), background: programColor(g.program) + '15', padding: '2px 8px', borderRadius: 12 }}>
                      {programLabel(g.program)}
                    </span>
                    <span style={{ fontSize: '.7rem', color: 'var(--g5)', background: 'var(--g1)', padding: '2px 8px', borderRadius: 12 }}>
                      {domainLabel(g.domain)}
                    </span>
                  </div>
                  <div style={{ fontSize: '.9rem', fontWeight: 500, lineHeight: 1.4 }}>{g.text}</div>
                  <div style={{ textAlign: 'right' }}>
                    <button type="button" className="btn btn-xs btn-d" onClick={() => del(g.id)}>🗑️ حذف</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fa">
          <button type="button" className="btn btn-g" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
