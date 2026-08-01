import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';
import { PROGRAMS, DOMAINS, SEED_GOALS, programLabel, programColor, domainLabel } from '../../utils/goalsBank';

/**
 * دالة مساعدة لجمع الأهداف وتجهيزها للعرض الهرمي
 */
function getAllGoalsList() {
  const custom = lsGet('progGoalsBank');
  const seeds = SEED_GOALS.map((g, i) => ({ ...g, id: `seed-${i}`, isSeed: true }));
  return [...seeds, ...custom];
}

// ============================================================================
// 1. نافذة إدارة بنك الأهداف (العرض الشامل المنظم)
// ============================================================================
export function GoalsBankManagerModal({ onClose }) {
  const { toast } = useApp();
  
  // حالات الفلترة العامة
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // بيانات النموذج الجديد
  const [newProgram, setNewProgram] = useState('custom');
  const [newDomain, setNewDomain] = useState(DOMAINS[0].key);
  const [newText, setNewText] = useState('');

  const allGoals = useMemo(() => getAllGoalsList(), []);

  // فلترة البيانات
  const filteredGoals = useMemo(() => {
    return allGoals.filter(g => {
      const matchProgram = filterProgram === 'all' || g.program === filterProgram;
      const matchDomain = filterDomain === 'all' || g.domain === filterDomain;
      const matchSearch = searchText === '' || g.text.includes(searchText);
      return matchProgram && matchDomain && matchSearch;
    });
  }, [allGoals, filterProgram, filterDomain, searchText]);

  // تجميع البيانات هرمياً: Program -> Domain -> Category (اختياري) -> Items
  // ملاحظة: بما أن البيانات الحالية لا تحتوي على حقل "category" صريح في كل العناصر،
  // سنعرضها grouped by Program ثم Domain مباشرة لضمان الشمولية.
  const groupedData = useMemo(() => {
    const groups = {};
    
    filteredGoals.forEach(goal => {
      if (!groups[goal.program]) groups[goal.program] = {};
      if (!groups[goal.program][goal.domain]) groups[goal.program][goal.domain] = [];
      groups[goal.program][goal.domain].push(goal);
    });
    
    return groups;
  }, [filteredGoals]);

  function handleAddItem() {
    if (!newText.trim()) { toast('⚠️ اكتب نص الهدف', 'er'); return; }
    lsAdd('progGoalsBank', { id: uid(), program: newProgram, domain: newDomain, text: newText.trim() });
    setNewText('');
    toast('✅ تمت الإضافة', 'ok');
  }

  function handleDel(id, isSeed) {
    if (isSeed) { toast('⚠️ لا يمكن حذف الأهداف المرجعية', 'er'); return; }
    if (!window.confirm('حذف هذا البند؟')) return;
    lsDel('progGoalsBank', id);
    toast('🗑️ تم الحذف', 'ok');
  }

  // حساب الإجماليات للعرض
  const totalPrograms = Object.keys(groupedData).length;
  const totalGoals = filteredGoals.length;

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="fhd" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🗂️ بنك الأهداف الشامل</h2>
              <p style={{ margin: '4px 0 0', fontSize: '.85rem', color: 'var(--g5)' }}>
                عرض منظم لأهداف بورتاج، لوفاس، وإضافاتك ({totalGoals} هدف في {totalPrograms} برامج)
              </p>
            </div>
            <button type="button" className="btn btn-p btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? '❌ إغلاق النموذج' : '➕ إضافة هدف جديد'}
            </button>
          </div>
        </div>

        {/* Add Form (Collapsible) */}
        {showAddForm && (
          <div style={{ padding: '16px 20px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="fg c4">
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
              <div className="fl full" style={{ gridColumn: 'span 4' }}>
                <label>نص الهدف</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="اكتب النص هنا..." autoFocus onKeyDown={e => e.key === 'Enter' && handleAddItem()} style={{ flex: 1 }} />
                  <button type="button" className="btn btn-s" onClick={handleAddItem}>حفظ</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div style={{ padding: '12px 20px', background: '#f8fafc', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--g6)' }}>تصفية العرض:</span>
          <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ minWidth: 160, padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
            <option value="all">كل البرامج</option>
            {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          
          <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)} style={{ minWidth: 160, padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
            <option value="all">كل المجالات</option>
            {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
          </select>

          <input 
            type="text" 
            placeholder="🔍 بحث في النص..." 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </div>

        {/* Scrollable Content - Hierarchical View */}
        <div className="modal-body-scroll" style={{ padding: '20px', background: '#f1f5f9' }}>
          {totalGoals === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--g5)', background: '#fff', borderRadius: 12 }}>
              لا توجد أهداف تطابق معايير البحث.
            </div>
          ) : (
            Object.entries(groupedData).map(([progKey, domainsObj]) => {
              const pConfig = PROGRAMS.find(p => p.key === progKey) || { label: progKey, color: '#64748b' };
              
              return (
                <div key={progKey} style={{ marginBottom: 24, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {/* Program Header */}
                  <div style={{ padding: '12px 16px', background: pConfig.color + '10', borderBottom: `2px solid ${pConfig.color}` }}>
                    <h3 style={{ margin: 0, color: pConfig.color, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: pConfig.color }}></span>
                      {pConfig.label}
                    </h3>
                  </div>

                  {/* Domains Grid */}
                  <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {Object.entries(domainsObj).map(([domKey, items]) => (
                      <div key={domKey} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, background: '#fff' }}>
                        <div style={{ fontWeight: 700, marginBottom: 10, color: '#334155', fontSize: '.95rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                          {domainLabel(domKey)} <span style={{fontWeight:400, color:'var(--g5)', fontSize:'.8rem'}}>({items.length})</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                          {items.map(g => (
                            <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, padding: '6px 8px', borderRadius: 6, background: g.isSeed ? '#f8fafc' : '#fffbeb', border: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: '.85rem', lineHeight: 1.4, flex: 1 }}>{g.text}</span>
                              {!g.isSeed && (
                                <button type="button" onClick={() => handleDel(g.id, g.isSeed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, fontSize: '.9rem' }}>🗑️</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="fa" style={{ borderTop: '1px solid var(--border-color)', padding: '12px 20px', background: '#fff' }}>
          <button type="button" className="btn btn-g" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. نافذة اختيار الأهداف (للبرامج طويلة المدى) - مع تحديد الكل الذكي
// ============================================================================
export function GoalPickerModal({ domain, alreadySelected, onConfirm, onClose }) {
  const [checked, setChecked] = useState(() => new Set((alreadySelected || []).map(g => g.text)));
  const [customText, setCustomText] = useState('');
  const [customProgram, setCustomProgram] = useState('custom');
  const [saveToBank, setSaveToBank] = useState(true);
  const [searchText, setSearchText] = useState('');

  // جلب الأهداف للمجال المحدد فقط
  const allDomainGoals = useMemo(() => {
    return getAllGoalsList().filter(g => g.domain === domain);
  }, [domain]);

  // فلترة البحث
  const filteredGoals = useMemo(() => {
    return allDomainGoals.filter(g => searchText === '' || g.text.includes(searchText));
  }, [allDomainGoals, searchText]);

  // ت grouping: Program -> SubCategory (إذا وجد) -> Items
  // ملاحظة: لاستخراج "الفئة" من نص الهدف (مثل: "يقلد حركات كبرى: قفز")
  // سنقوم بتحليل النص. إذا كان يحتوي على ":" نعتبر ما قبله فئة.
  const groupedByProgram = useMemo(() => {
    const groups = {};
    
    filteredGoals.forEach(g => {
      if (!groups[g.program]) groups[g.program] = {};
      
      // محاولة استخراج الفئة من النص (مثال: "العنوان: التفصيل")
      let category = 'عام';
      if (g.text.includes(':')) {
        category = g.text.split(':')[0].trim();
      } else if (g.text.includes('-')) {
        category = g.text.split('-')[0].trim();
      }
      
      if (!groups[g.program][category]) groups[g.program][category] = [];
      groups[g.program][category].push(g);
    });
    
    return groups;
  }, [filteredGoals]);

  function toggleGoal(text) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  }

  function toggleCategory(programKey, categoryName) {
    const items = groupedByProgram[programKey][categoryName];
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

  function toggleProgram(programKey) {
    const allItems = filteredGoals.filter(g => g.program === programKey);
    const allChecked = allItems.every(i => checked.has(i.text));
    
    setChecked(prev => {
      const next = new Set(prev);
      allItems.forEach(i => {
        if (allChecked) next.delete(i.text);
        else next.add(i.text);
      });
      return next;
    });
  }

  function addCustomNow() {
    if (!customText.trim()) return;
    if (saveToBank) lsAdd('progGoalsBank', { id: uid(), program: customProgram, domain, text: customText.trim() });
    setChecked(prev => new Set(prev).add(customText.trim()));
    setCustomText('');
  }

  function confirm() {
    const selected = allDomainGoals.filter(g => checked.has(g.text));
    const rawExtras = [...checked].filter(t => !allDomainGoals.some(g => g.text === t))
      .map(t => ({ program: customProgram, domain, text: t }));
    onConfirm([...selected, ...rawExtras]);
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="fhd" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2>🎯 اختيار أهداف — {domainLabel(domain)}</h2>
          <p style={{ fontSize: '.85rem', opacity: 0.8, marginTop: 4 }}>حدد الأهداف من الفئات أدناه (يمكن تحديد فئة كاملة)</p>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '12px 20px', background: '#f8fafc' }}>
          <input 
            type="text" 
            placeholder="🔍 تصفية الأهداف في هذا المجال..." 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.95rem' }}
          />
        </div>

        {/* Content */}
        <div className="modal-body-scroll" style={{ padding: '20px' }}>
          {Object.entries(groupedByProgram).map(([progKey, categories]) => {
            const pConfig = PROGRAMS.find(p => p.key === progKey) || { label: progKey, color: '#64748b' };
            const programTotalItems = filteredGoals.filter(g => g.program === progKey).length;
            const programCheckedCount = filteredGoals.filter(g => g.program === progKey && checked.has(g.text)).length;
            const isProgramFullyChecked = programTotalItems > 0 && programTotalItems === programCheckedCount;

            return (
              <div key={progKey} style={{ marginBottom: 24, border: `1px solid ${pConfig.color}40`, borderRadius: 12, overflow: 'hidden' }}>
                {/* Program Header with Select All */}
                <div style={{ padding: '12px 16px', background: pConfig.color + '15', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${pConfig.color}` }}>
                  <div style={{ fontWeight: 800, color: pConfig.color, fontSize: '1.05rem' }}>
                    {pConfig.label} <span style={{fontWeight:400, fontSize:'.85rem', color:'var(--g6)'}}>({programCheckedCount}/{programTotalItems})</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-xs" 
                    style={{ background: '#fff', border: `1px solid ${pConfig.color}`, color: pConfig.color, fontWeight: 700 }}
                    onClick={() => toggleProgram(progKey)}
                  >
                    {isProgramFullyChecked ? '☑️ إلغاء تحديد الكل' : '⬜ تحديد البرنامج كاملاً'}
                  </button>
                </div>

                {/* Categories Grid */}
                <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, background: '#fff' }}>
                  {Object.entries(categories).map(([catName, items]) => {
                    const catCheckedCount = items.filter(i => checked.has(i.text)).length;
                    const isCatFullyChecked = catCheckedCount === items.length;

                    return (
                      <div key={catName} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, background: '#f8fafc' }}>
                        {/* Category Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px dashed #cbd5e1' }}>
                          <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#334155' }}>{catName}</span>
                          <button 
                            type="button" 
                            onClick={() => toggleCategory(progKey, catName)}
                            style={{ fontSize: '.75rem', background: 'none', border: 'none', cursor: 'pointer', color: isCatFullyChecked ? 'var(--ok)' : 'var(--pr)', fontWeight: 700 }}
                          >
                            {isCatFullyChecked ? '☑️ الكل' : '⬜ الكل'}
                          </button>
                        </div>

                        {/* Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {items.map(g => (
                            <label key={g.id || g.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: '.88rem', lineHeight: 1.4 }}>
                              <input 
                                type="checkbox" 
                                checked={checked.has(g.text)} 
                                onChange={() => toggleGoal(g.text)} 
                                style={{ marginTop: 3, accentColor: pConfig.color }} 
                              />
                              <span style={{ color: checked.has(g.text) ? '#1e293b' : '#64748b' }}>
                                {g.text.replace(`${catName}:`, '').replace(`${catName} -`, '').trim()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Custom Input Area */}
          <div style={{ marginTop: 24, padding: 16, background: '#fffbeb', borderRadius: 10, border: '1px dashed #f59e0b' }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: '#92400e' }}>➕ إضافة هدف سريع غير موجود</div>
            <div className="fg c2">
              <div className="fl"><label>البرنامج</label>
                <select value={customProgram} onChange={e => setCustomProgram(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl"><label style={{display:'flex', alignItems:'center', gap:6, height:'100%'}}>
                <input type="checkbox" checked={saveToBank} onChange={e => setSaveToBank(e.target.checked)} />
                <span style={{fontSize:'.85rem'}}>حفظ في البنك</span>
              </label></div>
              <div className="fl full"><label>النص</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={customText} onChange={e => setCustomText(e.target.value)} placeholder="اكتب الهدف..." onKeyDown={e => e.key === 'Enter' && addCustomNow()} style={{ flex: 1 }} />
                  <button type="button" className="btn btn-s btn-sm" onClick={addCustomNow}>إضافة</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fa" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn btn-p" onClick={confirm}>✅ تأكيد ({checked.size}) هدف مختار</button>
          <button type="button" className="btn btn-g" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}
