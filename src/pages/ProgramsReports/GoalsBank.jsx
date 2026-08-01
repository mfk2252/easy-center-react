import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';
import { PROGRAMS, DOMAINS, SEED_GOALS, programLabel, programColor, domainLabel } from '../../utils/goalsBank';

/**
 * يجمع البذور الثابتة + إضافات المركز الخاصة
 */
export function getAllGoals() {
  const custom = lsGet('progGoalsBank');
  const seeds = SEED_GOALS.map((g, i) => ({ ...g, id: `seed-${i}`, isSeed: true }));
  return [...seeds, ...custom];
}

/**
 * نافذة اختيار الأهداف المحسنة
 */
export function GoalPickerModal({ domain, alreadySelected, onConfirm, onClose }) {
  const [checked, setChecked] = useState(() => new Set((alreadySelected || []).map(g => g.text)));
  const [customText, setCustomText] = useState('');
  const [customProgram, setCustomProgram] = useState('custom');
  const [saveToBank, setSaveToBank] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // جلب الأهداف وتصفيتها حسب المجال المختار
  const allDomainGoals = useMemo(() => {
    return getAllGoals().filter(g => g.domain === domain);
  }, [domain]);

  // تصفية الأهداف بناءً على البحث
  const filteredGoals = useMemo(() => {
    if (!searchQuery.trim()) return allDomainGoals;
    const q = searchQuery.toLowerCase();
    return allDomainGoals.filter(g => g.text.toLowerCase().includes(q));
  }, [allDomainGoals, searchQuery]);

  // تجميع الأهداف: أولاً حسب البرنامج، ثم حسب الفئة العمرية
  const groupedData = useMemo(() => {
    const groups = {};
    
    filteredGoals.forEach(goal => {
      // تحديد البرنامج
      const pKey = goal.program;
      if (!groups[pKey]) {
        groups[pKey] = { program: pKey, ages: {} };
      }

      // استخراج الفئة العمرية من النص (بحث عن نمط مثل "(0-1 سنة)" أو "صفر - 1 سنة")
      let ageGroup = 'أخرى';
      const ageMatch = goal.text.match(/\(([^)]+)\)|\[([^\]]+)\]|(\d+\s*[-–]\s*\d+\s*سنة)/);
      if (ageMatch) {
        ageGroup = ageMatch[1] || ageMatch[2] || ageMatch[3] || 'أخرى';
        // تنظيف النص قليلاً للعنوان
        ageGroup = ageGroup.trim();
      } else if (goal.text.includes('رضيع')) {
        ageGroup = 'الرضع';
      }

      if (!groups[pKey].ages[ageGroup]) {
        groups[pKey].ages[ageGroup] = [];
      }
      groups[pKey].ages[ageGroup].push(goal);
    });

    return groups;
  }, [filteredGoals]);

  function toggle(goal) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(goal.text)) next.delete(goal.text);
      else next.add(goal.text);
      return next;
    });
  }

  function toggleAll(programKey, ageKey) {
    const group = groupedData[programKey]?.ages[ageKey];
    if (!group) return;

    setChecked(prev => {
      const next = new Set(prev);
      const allChecked = group.every(g => next.has(g.text));

      if (allChecked) {
        // إلغاء الكل
        group.forEach(g => next.delete(g.text));
      } else {
        // تحديد الكل
        group.forEach(g => next.add(g.text));
      }
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
    const selected = allDomainGoals.filter(g => checked.has(g.text));
    const rawExtras = [...checked].filter(t => !allDomainGoals.some(g => g.text === t))
      .map(t => ({ program: customProgram, domain, text: t }));
    onConfirm([...selected, ...rawExtras]);
  }

  // حساب حالة "تحديد الكل" العامة للبرنامج
  function isProgramFullyChecked(pKey) {
    const pGroups = groupedData[pKey]?.ages;
    if (!pGroups) return false;
    const allGoalsInProgram = Object.values(pGroups).flat();
    if (allGoalsInProgram.length === 0) return false;
    return allGoalsInProgram.every(g => checked.has(g.text));
  }

  function toggleProgramAll(pKey) {
    const pGroups = groupedData[pKey]?.ages;
    if (!pGroups) return;
    const allGoalsInProgram = Object.values(pGroups).flat();
    
    setChecked(prev => {
      const next = new Set(prev);
      const allChecked = allGoalsInProgram.every(g => next.has(g.text));
      
      if (allChecked) {
        allGoalsInProgram.forEach(g => next.delete(g.text));
      } else {
        allGoalsInProgram.forEach(g => next.add(g.text));
      }
      return next;
    });
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        <div className="fhd" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2>🎯 اختيار أهداف — {domainLabel(domain)}</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>يمكنك الاختيار من أكثر من برنامج وفئة عمرية معاً</p>
        </div>
        
        {/* شريط البحث */}
        <div style={{ padding: '12px 20px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
          <input 
            type="text" 
            placeholder="🔍 ابحث باسم الهدف..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
          />
        </div>

        <div className="modal-body-scroll" style={{ padding: '20px' }}>
          {Object.keys(groupedData).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--g4)' }}>
              لا توجد أهداف مطابقة للبحث في هذا المجال
            </div>
          )}

          {Object.entries(groupedData).map(([pKey, pData]) => {
            const pInfo = PROGRAMS.find(p => p.key === pKey) || { label: pKey, color: '#666' };
            const isAllChecked = isProgramFullyChecked(pKey);

            return (
              <div key={pKey} style={{ marginBottom: 24, border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                {/* رأس البرنامج */}
                <div style={{ 
                  padding: '12px 16px', 
                  background: `${pInfo.color}11`, 
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: pInfo.color }} />
                    <h3 style={{ margin: 0, fontSize: '1rem', color: pInfo.color, fontWeight: 800 }}>{pInfo.label}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--g5)', background: '#fff', padding: '2px 8px', borderRadius: 12 }}>
                      {Object.values(pData.ages).flat().length} هدف
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => toggleProgramAll(pKey)}
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '6px 12px', 
                      borderRadius: 6, 
                      border: 'none', 
                      cursor: 'pointer',
                      background: isAllChecked ? 'var(--g2)' : 'var(--pr)',
                      color: '#fff',
                      fontWeight: 700
                    }}
                  >
                    {isAllChecked ? '✅ إلغاء الكل' : '☑️ تحديد الكل'}
                  </button>
                </div>

                {/* الفئات العمرية داخل البرنامج */}
                <div style={{ padding: '16px' }}>
                  {Object.entries(pData.ages).map(([age, goals]) => (
                    <div key={age} style={{ marginBottom: 16 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        paddingBottom: 4,
                        borderBottom: '1px dashed var(--border-color)'
                      }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--g6)' }}>
                          📅 {age}
                        </span>
                        <button 
                          type="button"
                          onClick={() => toggleAll(pKey, age)}
                          style={{ 
                            fontSize: '0.75rem', 
                            padding: '4px 8px', 
                            borderRadius: 4, 
                            border: '1px solid var(--border-color)', 
                            cursor: 'pointer',
                            background: 'transparent',
                            color: 'var(--g5)'
                          }}
                        >
                          {goals.every(g => checked.has(g.text)) ? 'إلغاء' : 'تحديد'}
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {goals.map(g => (
                          <label key={g.id || g.text} style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: 10, 
                            padding: '10px 12px', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: 8, 
                            cursor: 'pointer', 
                            background: checked.has(g.text) ? 'var(--ok-l)' : 'transparent',
                            transition: 'background 0.2s',
                            fontSize: '.9rem'
                          }}>
                            <input 
                              type="checkbox" 
                              checked={checked.has(g.text)} 
                              onChange={() => toggle(g)} 
                              style={{ marginTop: 3, accentColor: 'var(--pr)' }} 
                            />
                            <span style={{ flex: 1, lineHeight: 1.4 }}>{g.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* إضافة هدف مخصص */}
          <div style={{ marginTop: 24, padding: 16, background: 'var(--g0)', borderRadius: 10, border: '1px dashed var(--border-color)' }}>
            <div style={{ fontSize: '.85rem', fontWeight: 800, marginBottom: 10, color: 'var(--g7)' }}>➕ إضافة هدف مخصص جديد</div>
            <div className="fg c2">
              <div className="fl"><label>البرنامج المصدر</label>
                <select value={customProgram} onChange={e => setCustomProgram(e.target.value)} style={{ fontSize: '0.9rem' }}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl"><label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', marginTop: 24 }}>
                <input type="checkbox" checked={saveToBank} onChange={e => setSaveToBank(e.target.checked)} />
                حفظ في بنك المركز
              </label></div>
              <div className="fl full"><label>نص الهدف</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    value={customText} 
                    onChange={e => setCustomText(e.target.value)} 
                    placeholder="اكتب نص الهدف..." 
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)' }} 
                    onKeyDown={e => e.key === 'Enter' && addCustomNow()} 
                  />
                  <button type="button" className="btn btn-s btn-sm" onClick={addCustomNow}>➕ إضافة</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fa" style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px' }}>
          <button type="button" className="btn btn-p" onClick={confirm}>
            ✅ تأكيد الاختيار ({checked.size})
          </button>
          <button type="button" className="btn btn-g" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

/**
 * إدارة بنك الأهداف (لم تتغير كثيراً، فقط تحسينات بسيطة)
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
          <h2>🗂️ إدارة بنك الأهداف الخاص بمركزك</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>أضف بنود دليلكم الرسمي المرخّص لتظهر عند اختيار الأهداف لاحقاً</p>
        </div>
        <div className="modal-body-scroll" style={{ padding: '16px 20px' }}>
          <div style={{ padding: 14, background: 'var(--g0)', borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 800, marginBottom: 8 }}>➕ إضافة بند جديد للبنك</div>
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
                <button type="button" className="btn btn-p" onClick={addItem}>➕ إضافة</button>
              </div>
              <div className="fl full"><label>نص الهدف</label>
                <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="اكتب نص الهدف كما في دليلكم..." onKeyDown={e => e.key === 'Enter' && addItem()} />
              </div>
            </div>
          </div>

          <div className="tabs" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
            <button type="button" className={`tab ${filterDomain === 'all' ? 'on' : ''}`} onClick={() => setFilterDomain('all')}>الكل ({customBank.length})</button>
            {DOMAINS.map(d => (
              <button key={d.key} type="button" className={`tab ${filterDomain === d.key ? 'on' : ''}`} onClick={() => setFilterDomain(d.key)}>{d.label}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--g4)' }}>لا توجد بنود مخصّصة بعد في هذا الفلتر</div>
          ) : (
            filtered.map(g => (
              <div key={g.id} className="card" style={{ marginBottom: 8 }}>
                <div className="av" style={{ background: programColor(g.program) + '22', color: programColor(g.program), fontSize: '0.8rem' }}>{programLabel(g.program).slice(0, 2)}</div>
                <div className="ci">
                  <div className="cn" style={{ fontSize: '0.9rem' }}>{g.text}</div>
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
