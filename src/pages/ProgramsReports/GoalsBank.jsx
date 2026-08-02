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
  // تحويل الأهداف الثابتة (Seeds) إلى كائنات مع معرف فريد
  const seeds = SEED_GOALS.map((g, i) => ({ ...g, id: `seed-${i}`, isSeed: true }));
  return [...seeds, ...custom];
}

/**
 * 1️⃣ نافذة اختيار الأهداف (تظهر عند إنشاء برنامج)
 * تم تحسينها لتوضيح مصدر الأهداف وطريقة عمل الفلترة حسب المجال
 */
export function GoalPickerModal({ domain, alreadySelected, onConfirm, onClose }) {
  const [checked, setChecked] = useState(() => new Set((alreadySelected || []).map(g => g.text)));
  const [customText, setCustomText] = useState('');
  const [customProgram, setCustomProgram] = useState('custom');
  const [saveToBank, setSaveToBank] = useState(true);
  const [searchText, setSearchText] = useState('');

  // فلترة الأهداف: نجلب فقط الأهداف التابعة للمجال المختار حالياً
  const allGoals = useMemo(() => {
    const goals = getAllGoals().filter(g => g.domain === domain);
    if (!searchText.trim()) return goals;
    return goals.filter(g => g.text.toLowerCase().includes(searchText.toLowerCase()));
  }, [domain, searchText]);

  // تجميع الأهداف حسب البرنامج لعرضها في أقسام منفصلة
  const byProgram = useMemo(() => {
    return PROGRAMS.map(p => ({
      ...p,
      items: allGoals.filter(g => g.program === p.key)
    })).filter(p => p.items.length > 0); // إخفاء البرامج التي لا تملك أهدافاً في هذا المجال
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
        
        {/* الرأس مع شرح واضح */}
        <div className="fhd" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--g0)' }}>
          <h2>🎯 اختيار أهداف — {domainLabel(domain)}</h2>
          <div style={{ fontSize: '.85rem', color: 'var(--g5)', marginTop: 8, lineHeight: 1.5 }}>
            <strong>كيف يعمل هذا الشاشة؟</strong><br/>
            النظام يعرض هنا <u>جميع الأهداف المتاحة</u> في مجال "{domainLabel(domain)}" من المصادر التالية:<br/>
            ✅ الأهداف الجاهزة المدمجة (لوفاس، بورتاج، إيبلز)<br/>
            ✅ الأهداف المخصصة التي أضافها مركزك سابقاً<br/>
            <span style={{color: 'var(--primary)'}}>💡 ملاحظة: البرامج مرتبة حسب عدد الأهداف المتوفرة فيها لهذا المجال.</span>
          </div>
        </div>

        {/* شريط البحث */}
        <div style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid var(--border-color)' }}>
          <input 
            type="text" 
            placeholder="🔍 ابحث عن نص هدف معين داخل هذا المجال..." 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <div className="modal-body-scroll" style={{ padding: '20px', flex: 1 }}>
          {byProgram.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--g4)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 10 }}>📭</div>
              <h3>لا توجد أهداف مسجلة في هذا المجال حتى الآن</h3>
              <p style={{ maxWidth: 400, margin: '0 auto 20px' }}>
                هذا يعني أنه لا توجد أهداف جاهزة (من لوفاس/بورتاج) ولا أهداف مضافة يدوياً لمركزك في مجال "{domainLabel(domain)}".
              </p>
              
              <div style={{ background: 'var(--g0)', padding: 15, borderRadius: 8, textAlign: 'right', maxWidth: 500, margin: '0 auto' }}>
                <strong>💡 ماذا يمكنك أن تفعل؟</strong>
                <ol style={{ paddingRight: 20, marginTop: 8, fontSize: '0.9rem' }}>
                  <li>تحقق من اختيارك للمجال (ربما تحتاج مجالاً آخر).</li>
                  <li>استخدم النموذج في الأسفل لإضافة هدف جديد يدوياً.</li>
                  <li>سيتم حفظ الهدف الجديد ليظهر دائماً عند اختيار هذا المجال مستقبلاً.</li>
                </ol>
              </div>
            </div>
          ) : (
            byProgram.map(p => {
              const count = p.items.length;
              const allChecked = count > 0 && p.items.every(i => checked.has(i.text));
              
              return (
                <div key={p.key} style={{ marginBottom: 30 }}>
                  {/* عنوان البرنامج مع زر تحديد الكل وشرح مصغر */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: p.color }}>{p.label}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--g6)', background: 'var(--g1)', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>
                        {count} هدف متاح
                      </span>
                    </div>
                    <button 
                      type="button" 
                      className={`btn btn-xs ${allChecked ? 'btn-s' : 'btn-g'}`}
                      onClick={() => toggleProgram(p.key)}
                      style={{ fontWeight: 600 }}
                    >
                      {allChecked ? '☑️ إلغاء تحديد الكل' : '⬜ تحديد الكل'}
                    </button>
                  </div>

                  {/* شرح صغير تحت العنوان */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--g5)', marginBottom: 10, background: `${p.color}10`, padding: '6px 12px', borderRadius: 6, display: 'inline-block' }}>
                    📌 هذه أهداف برنامج <strong>{p.label}</strong> الخاصة بمجال <strong>{domainLabel(domain)}</strong>. اختر ما يناسب خطة الطالب.
                  </div>

                  {/* قائمة الأهداف */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {p.items.map(g => (
                      <label key={g.id || g.text} style={{ 
                        display: 'flex', alignItems: 'flex-start', gap: 12, 
                        padding: '12px 14px', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 10, 
                        cursor: 'pointer', 
                        background: checked.has(g.text) ? 'var(--ok-l)' : '#fff',
                        transition: 'all 0.2s',
                        boxShadow: checked.has(g.text) ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                      }}>
                        <input type="checkbox" checked={checked.has(g.text)} onChange={() => toggle(g)} style={{ marginTop: 4, transform: 'scale(1.3)', accentColor: p.color }} />
                        <span style={{ flex: 1, lineHeight: 1.6, fontSize: '0.95rem', color: checked.has(g.text) ? '#000' : 'var(--g7)' }}>{g.text}</span>
                        {g.isSeed && <span title="هدف جاهز من النظام" style={{fontSize: '0.7rem', color: 'var(--g5)'}}>🏛️</span>}
                        {!g.isSeed && <span title="هدف مضاف من قبلكم" style={{fontSize: '0.7rem', color: 'var(--primary)'}}>✏️</span>}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* إضافة هدف مخصص سريع */}
          <div style={{ marginTop: 30, padding: 20, background: 'var(--g0)', borderRadius: 12, borderTop: '3px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>➕ إضافة هدف يدوي جديد</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--g5)', maxWidth: 300, textAlign: 'right' }}>
                <strong>لماذا أكتب نص الهدف هنا؟</strong><br/>
                استخدم هذا القسم إذا لم تجد الهدف الذي تريده في القوائم أعلاه. سيتم إضافته فوراً وتحديدُه.
              </div>
            </div>
            
            <div className="fg c2" style={{ gap: 15 }}>
              <div className="fl" style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>البرنامج التابع له</label>
                <select value={customProgram} onChange={e => setCustomProgram(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              
              <div className="fl" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={saveToBank} onChange={e => setSaveToBank(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                  <span style={{fontSize: '0.9rem', fontWeight: 600}}>💾 حفظ في بنك المركز للاستخدام المستقبلي</span>
                </label>
              </div>
              
              <div className="fl full">
                <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>نص الهدف</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input 
                    value={customText} 
                    onChange={e => setCustomText(e.target.value)} 
                    placeholder="اكتب نص الهدف بدقة كما تريد أن يظهر في الخطة..." 
                    style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid var(--border-color)' }} 
                    onKeyDown={e => e.key === 'Enter' && addCustomNow()} 
                  />
                  <button type="button" className="btn btn-p" onClick={addCustomNow} disabled={!customText.trim()}>إضافة وتحديد</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fa" style={{ borderTop: '1px solid var(--border-color)', padding: '15px 20px', background: '#fff' }}>
          <button type="button" className="btn btn-p" onClick={confirm} style={{ fontSize: '1rem', padding: '10px 30px' }}>
            ✅ تأكيد الاختيار ({checked.size}) هدف
          </button>
          <button type="button" className="btn btn-g" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

/**
 * 2️⃣ نافذة إدارة بنك الأهداف (للمشرفين فقط)
 * تعرض فقط الإضافات اليدوية للمركز، وتوضح الفرق بينها وبين الأهداف الجاهزة.
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
    if (!newText.trim()) { toast('⚠️ يرجى كتابة نص الهدف', 'er'); return; }
    lsAdd('progGoalsBank', { id: uid(), program: newProgram, domain: newDomain, text: newText.trim() });
    setNewText('');
    toast('✅ تمت الإضافة لبنك المركز بنجاح', 'ok');
    reload();
  }

  function del(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذا البند من بنك المركز؟\nهذا الإجراء لا يؤثر على الأهداف الجاهزة المدمجة.')) return;
    lsDel('progGoalsBank', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  const filtered = filterDomain === 'all' ? customBank : customBank.filter(g => g.domain === filterDomain);

  return (
    <div className="mbg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb mb-large" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="fhd" style={{ padding: '14px 20px', background: 'var(--g0)' }}>
          <h2>🗂️ إدارة بنك أهداف المركز</h2>
          <div style={{ fontSize: '.85rem', opacity: .9, marginTop: 8, lineHeight: 1.6 }}>
            <strong>ما هو "مخصص للمركز"؟</strong><br/>
            هذه الصفحة تعرض <u>فقط</u> الأهداف التي قام فريقكم بإضافتها يدوياً. <br/>
            الأهداف الجاهزة (لوفاس، بورتاج، إيبلز) لا تظهر هنا لأنها مثبتة في النظام ولا يمكن تعديلها أو حذفها من قبل المركز.
          </div>
        </div>
        
        <div className="modal-body-scroll" style={{ padding: '20px' }}>
          {/* نموذج الإضافة */}
          <div style={{ padding: 20, background: '#fff', borderRadius: 12, marginBottom: 25, border: '1px solid var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 15, color: 'var(--primary)' }}>➕ إضافة بند جديد للبنك</div>
            <div className="fg c3" style={{ gap: 15 }}>
              <div className="fl"><label style={{ fontWeight: 600 }}>البرنامج</label>
                <select value={newProgram} onChange={e => setNewProgram(e.target.value)} style={{ width: '100%' }}>
                  {PROGRAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div className="fl"><label style={{ fontWeight: 600 }}>المجال</label>
                <select value={newDomain} onChange={e => setNewDomain(e.target.value)} style={{ width: '100%' }}>
                  {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
              </div>
              <div className="fl full"><label style={{ fontWeight: 600 }}>نص الهدف</label>
                <input 
                  value={newText} 
                  onChange={e => setNewText(e.target.value)} 
                  placeholder="اكتب نص الهدف كما في دليلكم المرخّص..." 
                  onKeyDown={e => e.key === 'Enter' && addItem()} 
                  style={{ width: '100%' }}
                />
              </div>
              <div className="fl" style={{ alignSelf: 'flex-end' }}>
                <button type="button" className="btn btn-p" onClick={addItem} style={{ width: '100%', fontWeight: 700 }}>➕ حفظ في البنك</button>
              </div>
            </div>
          </div>

          {/* الفلتر */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 700, marginBottom: 10, display: 'block' }}>تصفية حسب المجال:</label>
            <div className="tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 5 }}>
              <button type="button" className={`tab ${filterDomain === 'all' ? 'on' : ''}`} onClick={() => setFilterDomain('all')}>الكل ({customBank.length})</button>
              {DOMAINS.map(d => {
                const count = customBank.filter(g => g.domain === d.key).length;
                return (
                  <button key={d.key} type="button" className={`tab ${filterDomain === d.key ? 'on' : ''}`} onClick={() => setFilterDomain(d.key)}>
                    {d.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* القائمة */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--g4)', background: 'var(--g0)', borderRadius: 12 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📝</div>
              <h3>لا توجد إضافات محلية</h3>
              <p>لم يقم المركز بإضافة أي أهداف يدوياً في هذا التصنيف حتى الآن.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 15 }}>
              {filtered.map(g => (
                <div key={g.id} className="card" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--border-color)', borderRadius: 10, background: '#fff' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: programColor(g.program), background: programColor(g.program) + '15', padding: '4px 10px', borderRadius: 20 }}>
                      {programLabel(g.program)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--g6)', background: 'var(--g1)', padding: '4px 10px', borderRadius: 20 }}>
                      {domainLabel(g.domain)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.5, color: '#333' }}>{g.text}</div>
                  <div style={{ textAlign: 'left', marginTop: 'auto', paddingTop: 10, borderTop: '1px dashed var(--border-color)' }}>
                    <button type="button" className="btn btn-xs btn-d" onClick={() => del(g.id)}>🗑️ حذف من البنك</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fa" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn btn-g" onClick={onClose}>إغلاق النافذة</button>
        </div>
      </div>
    </div>
  );
}
