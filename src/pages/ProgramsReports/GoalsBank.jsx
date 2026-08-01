import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsDel } from '../../hooks/useStorage';
import { uid } from '../../utils/dateHelpers';
import { PROGRAMS, DOMAINS, SEED_GOALS, programLabel, programColor, domainLabel } from '../../utils/goalsBank';

/**
 * دالة مساعدة لجمع الأهداف: البذور الثابتة + أهداف المركز المخصصة
 */
function getAllGoalsList() {
  const custom = lsGet('progGoalsBank');
  // تحويل البذور الثابتة إلى كائنات قابلة للعرض
  const seeds = SEED_GOALS.map((g, i) => ({ ...g, id: `seed-${i}`, isSeed: true }));
  return [...seeds, ...custom];
}

/**
 * النافذة الرئيسية: إدارة وعرض بنك الأهداف
 * تعرض القائمة الكاملة (بورتاج، لوفاس، إلخ) مع إمكانية البحث والفلترة والإضافة.
 */
export function GoalsBankManagerModal({ onClose }) {
  const { toast } = useApp();
  
  // حالات الفلترة والبحث
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // حالة نموذج الإضافة اليدوية
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProgram, setNewProgram] = useState('custom');
  const [newDomain, setNewDomain] = useState(DOMAINS[0].key);
  const [newText, setNewText] = useState('');

  // جلب البيانات ومعالجتها
  const allGoals = useMemo(() => getAllGoalsList(), []);
  
  const filteredGoals = useMemo(() => {
    return allGoals.filter(g => {
      const matchProgram = filterProgram === 'all' || g.program === filterProgram;
      const matchDomain = filterDomain === 'all' || g.domain === filterDomain;
      const matchSearch = searchText === '' || g.text.includes(searchText);
      return matchProgram && matchDomain && matchSearch;
    });
  }, [allGoals, filterProgram, filterDomain, searchText]);

  // تجميع الأهداف لعرضها بشكل أفضل (اختياري، لكن هنا سنعرضها قائمة مسطحة مع badges للوضوح)
  
  function handleAddItem() {
    if (!newText.trim()) { toast('⚠️ اكتب نص الهدف', 'er'); return; }
    lsAdd('progGoalsBank', { id: uid(), program: newProgram, domain: newDomain, text: newText.trim() });
    setNewText('');
    setShowAddForm(false);
    toast('✅ تمت الإضافة لبنك المركز', 'ok');
  }

  function handleDel(id, isSeed) {
    if (isSeed) {
      toast('⚠️ لا يمكن حذف الأهداف المرجعية (بورتاج/لوفاس)', 'er');
      return;
    }
    if (!window.confirm('حذف هذا البند من بنك المركز؟')) return;
    lsDel('progGoalsBank', id);
    toast('🗑️ تم الحذف', 'ok');
  }

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* الرأس: العنوان والأزرار */}
        <div className="fhd" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>🗂️ بنك الأهداف الشامل</h2>
              <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>
                عرض وأهداف بورتاج، لوفاس، وإضافات مركزك ({filteredGoals.length} هدف)
              </p>
            </div>
            <button type="button" className="btn btn-p btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? '❌ إلغاء' : '➕ إضافة هدف'}
            </button>
          </div>
        </div>

        {/* نموذج الإضافة اليدوية (يظهر عند الطلب) */}
        {showAddForm && (
          <div style={{ padding: '16px 20px', background: 'var(--g0)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: 10 }}>إضافة بند جديد للبنك</div>
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
              <div className="fl full" style={{ gridColumn: 'span 2' }}>
                <label>نص الهدف</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="اكتب نص الهدف..." autoFocus onKeyDown={e => e.key === 'Enter' && handleAddItem()} style={{ flex: 1 }} />
                  <button type="button" className="btn btn-s" onClick={handleAddItem}>حفظ</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* شريط الفلترة والبحث */}
        <div style={{ padding: '12px 20px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', background: '#fff' }}>
          <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ minWidth: 150 }}>
            <option value="all">كل البرامج</option>
            {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          
          <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)} style={{ minWidth: 150 }}>
            <option value="all">كل المجالات</option>
            {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
          </select>

          <input 
            type="text" 
            placeholder="🔍 ابحث في نص الهدف..." 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}
          />
        </div>

        {/* قائمة النتائج */}
        <div className="modal-body-scroll" style={{ padding: '0 20px 20px', flex: 1 }}>
          {filteredGoals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--g4)' }}>
              لا توجد أهداف تطابق بحثك. جرب تغيير الفلتر.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10, marginTop: 10 }}>
              {filteredGoals.map(g => (
                <div key={g.id} className="card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.7rem', fontWeight: 800, color: programColor(g.program), background: programColor(g.program) + '15', padding: '2px 8px', borderRadius: 12 }}>
                      {programLabel(g.program)}
                    </span>
                    <span style={{ fontSize: '.7rem', color: 'var(--g5)', background: 'var(--g0)', padding: '2px 8px', borderRadius: 12 }}>
                      {domainLabel(g.domain)}
                    </span>
                  </div>
                  <div style={{ fontSize: '.9rem', fontWeight: 500, lineHeight: 1.4 }}>{g.text}</div>
                  {!g.isSeed && (
                    <button type="button" className="btn btn-xs btn-d" style={{ alignSelf: 'flex-end', marginTop: 4 }} onClick={() => handleDel(g.id, g.isSeed)}>
                      🗑️ حذف
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* التذييل */}
        <div className="fa" style={{ borderTop: '1px solid var(--border-color)', padding: '12px 20px' }}>
          <button type="button" className="btn btn-g" onClick={onClose}>إغلاق</button>
          <div style={{ fontSize: '.8rem', color: 'var(--g5)' }}>
            إجمالي المعروض: {filteredGoals.length} من {allGoals.length}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * نافذة اختيار الأهداف (تستخدم عند إنشاء برنامج)
 * لم تتغير وظيفتها الأساسية، لكنها ستستفيد من البيانات المحدثة
 */
export function GoalPickerModal({ domain, alreadySelected, onConfirm, onClose }) {
  const [checked, setChecked] = useState(() => new Set((alreadySelected || []).map(g => g.text)));
  const [customText, setCustomText] = useState('');
  const [customProgram, setCustomProgram] = useState('custom');
  const [saveToBank, setSaveToBank] = useState(true);
  const [searchText, setSearchText] = useState(''); // إضافة بحث سريع هنا أيضاً

  const allGoals = getAllGoalsList().filter(g => g.domain === domain);
  
  // فلترة حسب البحث النصي داخل النافذة المنبثقة
  const filteredGoals = allGoals.filter(g => 
    searchText === '' || g.text.includes(searchText)
  );

  const byProgram = PROGRAMS.map(p => ({ 
    ...p, 
    items: filteredGoals.filter(g => g.program === p.key) 
  })).filter(p => p.items.length > 0);

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

  // دالة لتحديد الكل لبرنامج معين
  function toggleProgram(programKey) {
    const items = filteredGoals.filter(g => g.program === programKey);
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

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="fhd" style={{ padding: '14px 20px' }}>
          <h2>🎯 اختيار أهداف — {domainLabel(domain)}</h2>
          <p style={{ fontSize: '.8rem', opacity: .85, marginTop: 4 }}>حدد الأهداف المطلوبة من البرامج المختلفة</p>
        </div>
        
        {/* شريط بحث داخل نافذة الاختيار */}
        <div style={{ padding: '10px 20px', background: 'var(--g0)' }}>
          <input 
            type="text" 
            placeholder="🔍 بحث سريع في الأهداف..." 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)' }}
          />
        </div>

        <div className="modal-body-scroll" style={{ padding: '16px 20px' }}>
          {byProgram.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--g4)' }}>
              لا توجد بنود في هذا المجال بعد.
            </div>
          )}
          
          {byProgram.map(p => {
            const allChecked = p.items.every(i => checked.has(i.text));
            return (
              <div key={p.key} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid ' + p.color + '33' }}>
                  <div style={{ fontSize: '.9rem', fontWeight: 900, color: p.color, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} /> 
                    {p.label} <span style={{fontSize: '.8rem', opacity: 0.7}}>({p.items.length})</span>
                  </div>
                  <button type="button" className="btn btn-xs btn-g" onClick={() => toggleProgram(p.key)}>
                    {allChecked ? '☑️ تحديد الكل' : '⬜ تحديد الكل'}
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                  {p.items.map(g => (
                    <label key={g.id || g.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', background: checked.has(g.text) ? 'var(--ok-l)' : 'transparent', fontSize: '.9rem', transition: 'background 0.2s' }}>
                      <input type="checkbox" checked={checked.has(g.text)} onChange={() => toggle(g)} style={{ marginTop: 3, transform: 'scale(1.2)' }} />
                      <span style={{ flex: 1, lineHeight: 1.5 }}>{g.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 20, padding: 14, background: 'var(--g0)', borderRadius: 10, borderTop: '2px dashed var(--border-color)' }}>
            <div style={{ fontSize: '.85rem', fontWeight: 800, marginBottom: 10 }}>➕ إضافة هدف مخصص سريع</div>
            <div className="fg c2">
              <div className="fl"><label>البرنامج</label>
                <select value={customProgram} onChange={e => setCustomProgram(e.target.value)}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl"><label style={{ display: 'flex', alignItems: 'center', gap: 6, height: '100%' }}>
                <input type="checkbox" checked={saveToBank} onChange={e => setSaveToBank(e.target.checked)} />
                <span style={{fontSize: '.8rem'}}>حفظ في البنك</span>
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
        
        <div className="fa">
          <button type="button" className="btn btn-p" onClick={confirm}>✅ تأكيد الاختيار ({checked.size})</button>
          <button type="button" className="btn btn-g" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}
