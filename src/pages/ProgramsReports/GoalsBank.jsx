import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';
import { PROGRAMS, DOMAINS, SEED_GOALS, programLabel, programColor, domainLabel } from '../../utils/goalsBank';

/**
 * دالة مساعدة لجمع الأهداف: البذور الثابتة + أهداف المركز المخصصة
 */
export function getAllGoals() {
  const custom = lsGet('progGoalsBank');
  const seeds = SEED_GOALS.map((g, i) => ({ ...g, id: `seed-${i}`, isSeed: true }));
  return [...seeds, ...custom];
}

/**
 * نافذة اختيار الأهداف (تستخدم عند إنشاء برنامج)
 * العرض هنا يكون منظماً: قائمة بالبرامج، وعند اختيار برنامج تظهر مجالاته، ثم أهدافه.
 * هذا يمنع الزحمة ويحسن تجربة المستخدم.
 */
export function GoalPickerModal({ domain, alreadySelected, onConfirm, onClose }) {
  const [checked, setChecked] = useState(() => new Set((alreadySelected || []).map(g => g.text)));
  const [customText, setCustomText] = useState('');
  const [customProgram, setCustomProgram] = useState('custom');
  const [saveToBank, setSaveToBank] = useState(true);
  
  // فلترة الأهداف حسب المجال المختار من البرنامج الرئيسي
  const allGoals = getAllGoals().filter(g => g.domain === domain);
  
  // تجميع الأهداف حسب البرنامج لعرضها بشكل مرتب
  const byProgram = PROGRAMS.map(p => ({ 
    ...p, 
    items: allGoals.filter(g => g.program === p.key) 
  })).filter(p => p.items.length > 0);

  function toggle(goal) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(goal.text)) next.delete(goal.text);
      else next.add(goal.text);
      return next;
    });
  }

  // ميزة "تحديد الكل" لبرنامج معين ضمن المجال المختار
  function toggleProgram(programKey) {
    const items = allGoals.filter(g => g.program === programKey);
    if (items.length === 0) return;
    
    const allChecked = items.every(i => checked.has(i.text));
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
        <div className="fhd" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2>🎯 اختيار أهداف — {domainLabel(domain)}</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>حدد الأهداف من البرامج المختلفة (يمكن الجمع بين لوفاس وبورتاج)</p>
        </div>
        
        <div className="modal-body-scroll" style={{ padding: '20px' }}>
          {byProgram.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--g4)' }}>
              لا توجد أهداف مسجلة في هذا المجال بعد.<br/>
              <span style={{fontSize: '.85rem'}}>يمكنك إضافة هدف مخصص من الأسفل.</span>
            </div>
          ) : (
            byProgram.map(p => {
              const count = p.items.length;
              const allChecked = count > 0 && p.items.every(i => checked.has(i.text));
              
              return (
                <div key={p.key} style={{ marginBottom: 24, background: '#fff', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  {/* رأس القسم: اسم البرنامج وزر تحديد الكل */}
                  <div style={{ 
                    padding: '12px 16px', 
                    background: p.color + '08', // خلفية شفافة بلون البرنامج
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.color }} />
                      <span style={{ fontWeight: 800, color: p.color, fontSize: '.95rem' }}>{p.label}</span>
                      <span style={{ fontSize: '.8rem', color: 'var(--g5)', background: '#fff', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--border-color)' }}>{count} هدف</span>
                    </div>
                    {count > 0 && (
                      <button 
                        type="button" 
                        className={`btn btn-xs ${allChecked ? 'btn-p' : 'btn-g'}`}
                        onClick={() => toggleProgram(p.key)}
                        style={{ fontWeight: 700 }}
                      >
                        {allChecked ? '✅ تحديد الكل' : '⬜ تحديد الكل'}
                      </button>
                    )}
                  </div>

                  {/* قائمة الأهداف */}
                  <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 6, background: '#fff' }}>
                    {p.items.map(g => (
                      <label key={g.id || g.text} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: 12, 
                        padding: '10px', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 8, 
                        cursor: 'pointer', 
                        background: checked.has(g.text) ? (p.color + '15') : '#fff',
                        transition: 'all 0.2s'
                      }}>
                        <input 
                          type="checkbox" 
                          checked={checked.has(g.text)} 
                          onChange={() => toggle(g)} 
                          style={{ marginTop: 3, transform: 'scale(1.3)', accentColor: p.color }} 
                        />
                        <span style={{ flex: 1, fontSize: '.9rem', lineHeight: 1.5, color: '#333' }}>{g.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* قسم الإضافة السريعة */}
          <div style={{ marginTop: 24, padding: 16, background: 'var(--g0)', borderRadius: 12, border: '1px dashed var(--border-color)' }}>
            <div style={{ fontSize: '.85rem', fontWeight: 800, marginBottom: 12, color: 'var(--g6)' }}>➕ إضافة هدف مخصص لهذا المجال</div>
            <div className="fg c2">
              <div className="fl"><label>البرنامج المصدر</label>
                <select value={customProgram} onChange={e => setCustomProgram(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl"><label style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%', paddingTop: '22px' }}>
                <input type="checkbox" checked={saveToBank} onChange={e => setSaveToBank(e.target.checked)} />
                <span style={{fontSize: '.85rem', fontWeight: 600}}>حفظ في بنك المركز</span>
              </label></div>
              <div className="fl full"><label>نص الهدف</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={customText} onChange={e => setCustomText(e.target.value)} placeholder="اكتب نص الهدف..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addCustomNow()} />
                  <button type="button" className="btn btn-s btn-sm" onClick={addCustomNow}>إضافة</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="fa" style={{ borderTop: '1px solid var(--border-color)', padding: '14px 20px' }}>
          <button type="button" className="btn btn-p" onClick={confirm} style={{ minWidth: 140 }}>
            ✅ تأكيد ({checked.size})
          </button>
          <button type="button" className="btn btn-g" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

/**
 * إدارة بنك الأهداف الخاص بالمركز
 * تعرض فقط الأهداف المضافة يدوياً من قبل المركز (Custom Goals) لتسهيل إدارتها.
 * الأهداف الجاهزة (SEED) لا تظهر هنا لتجنب الزحمة ولأنها غير قابلة للتعديل.
 */
export function GoalsBankManagerModal({ onClose }) {
  const { toast } = useApp();
  const [filterDomain, setFilterDomain] = useState('all');
  const [customBank, setCustomBank] = useState([]);
  const [newProgram, setNewProgram] = useState('custom');
  const [newDomain, setNewDomain] = useState(DOMAINS[0].key);
  const [newText, setNewText] = useState('');

  // تحميل البيانات عند الفتح
  useEffect(() => {
    setCustomBank(lsGet('progGoalsBank'));
  }, []);

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
        <div className="fhd" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2>🗂️ إدارة بنك أهداف مركزك</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>
            أضف أو احذف الأهداف الخاصة بدليلكم المرخّص. <br/>
            <span style={{color: 'var(--g5)'}}>(أهداف بورتاج ولوفاس الجاهزة تظهر تلقائياً عند الإنشاء ولا تحتاج إدارة)</span>
          </p>
        </div>
        
        <div className="modal-body-scroll" style={{ padding: '20px' }}>
          {/* نموذج الإضافة */}
          <div style={{ padding: 16, background: 'var(--pr-l)', borderRadius: 12, marginBottom: 24, border: '1px solid var(--pr)' }}>
            <div style={{ fontSize: '.9rem', fontWeight: 800, marginBottom: 12, color: 'var(--pr-d)' }}>➕ إضافة بند جديد للبنك</div>
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
                <button type="button" className="btn btn-p" onClick={addItem} style={{height: '42px'}}>➕ إضافة</button>
              </div>
              <div className="fl full"><label>نص الهدف</label>
                <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="اكتب نص الهدف كما في دليلكم..." onKeyDown={e => e.key === 'Enter' && addItem()} style={{height: '42px'}} />
              </div>
            </div>
          </div>

          {/* فلاتر العرض */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className={`tab ${filterDomain === 'all' ? 'on' : ''}`} 
              onClick={() => setFilterDomain('all')}
              style={{fontSize: '.85rem', padding: '6px 12px'}}
            >
              الكل ({customBank.length})
            </button>
            {DOMAINS.map(d => {
              const count = customBank.filter(g => g.domain === d.key).length;
              if (count === 0) return null;
              return (
                <button 
                  key={d.key} 
                  type="button" 
                  className={`tab ${filterDomain === d.key ? 'on' : ''}`} 
                  onClick={() => setFilterDomain(d.key)}
                  style={{fontSize: '.85rem', padding: '6px 12px'}}
                >
                  {d.label} ({count})
                </button>
              );
            })}
          </div>

          {/* قائمة الأهداف المخصصة */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--g4)', background: 'var(--g0)', borderRadius: 12, border: '1px dashed var(--border-color)' }}>
              <div style={{fontSize: '2rem', marginBottom: 8}}>📝</div>
              {filterDomain === 'all' 
                ? 'لم تضف أي أهداف مخصصة بعد. استخدم النموذج أعلاه.' 
                : 'لا توجد أهداف مخصصة في هذا المجال.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filtered.map(g => (
                <div key={g.id} className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.7rem', fontWeight: 800, color: programColor(g.program), background: programColor(g.program) + '15', padding: '2px 8px', borderRadius: 12 }}>
                      {programLabel(g.program)}
                    </span>
                    <span style={{ fontSize: '.7rem', color: 'var(--g5)', background: 'var(--g0)', padding: '2px 8px', borderRadius: 12 }}>
                      {domainLabel(g.domain)}
                    </span>
                  </div>
                  <div style={{ fontSize: '.9rem', fontWeight: 500, lineHeight: 1.4, color: '#333' }}>{g.text}</div>
                  <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-xs btn-d" onClick={() => del(g.id)}>
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="fa" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn btn-g" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
