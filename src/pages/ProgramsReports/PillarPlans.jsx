import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr, calcAge } from '../../utils/dateHelpers';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import { GoalPickerModal, GoalsBankManagerModal, getAllGoals } from './GoalsBank';
import { DOMAINS, PROGRAMS, domainLabel, programLabel, programColor } from '../../utils/goalsBank';
import BulkImporter from './BulkImporter';
import { sendReportToWhatsApp } from './programsWhatsApp';

const EMPTY_PROG = {
  ...EMPTY_STU_PICK,
  title: '', duration: 'فصل دراسي (3 أشهر)', startDate: todayStr(), reviewDate: '', specialistName: '',
  goals: [], activities: '', notes: '', status: 'active',
};

const EMPTY_BIP = {
  ...EMPTY_STU_PICK,
  date: todayStr(),
  title: '',
  targetBehaviors: '',
  antecedents: '',
  consequences: '',
  replacementBehaviors: '',
  reinforcementStrategies: '',
  reviewDate: '',
  specialistName: '',
  notes: '',
  status: 'active',
};

export default function PillarPlans({ onDataChange }) {
  const { toast, center } = useApp();
  const [subTab, setSubTab] = useState('iep'); // 'iep' | 'bank' | 'behavior'
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');

  // IEP Programs state
  const [programs, setPrograms] = useState([]);
  const [progModal, setProgModal] = useState(false);
  const [progEditId, setProgEditId] = useState(null);
  const [progForm, setProgForm] = useState(EMPTY_PROG);

  // Modals for Goal Picker & Bank Manager
  const [goalPickerOpen, setGoalPickerOpen] = useState(false);
  const [bankManagerOpen, setBankManagerOpen] = useState(false);
  const [bulkImporterOpen, setBulkImporterOpen] = useState(false);

  // BIP Behavior Plans state
  const [bipList, setBipList] = useState([]);
  const [bipModal, setBipModal] = useState(false);
  const [bipEditId, setBipEditId] = useState(null);
  const [bipForm, setBipForm] = useState(EMPTY_BIP);

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    setPrograms((lsGet('progPrograms') || []).sort((a, b) => (b.startDate || '').localeCompare(a.startDate || '')));
    setBipList((lsGet('progBehaviorReports') || []).sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    if (onDataChange) onDataChange();
  }

  useEffect(() => { reload(); }, []);

  // ----------------------------------------------------
  // IEP Programs Actions
  // ----------------------------------------------------
  function openNewProg() {
    setProgForm({ ...EMPTY_PROG, startDate: todayStr() });
    setProgEditId(null);
    setProgModal(true);
  }

  function openEditProg(item) {
    setProgForm({ ...EMPTY_PROG, ...item });
    setProgEditId(item.id);
    setProgModal(true);
  }

  function saveProg() {
    if (!validateStudentPick(progForm)) { toast('⚠️ اختر الطالب من القائمة أو أدخل اسمه', 'er'); return; }
    if (!progForm.title.trim()) { toast('⚠️ أدخل عنوان الخطة أو البرنامج', 'er'); return; }

    const payload = {
      ...progForm,
      goals: progForm.goals || [],
      isUnregistered: progForm.mode === 'other',
      updatedAt: new Date().toISOString(),
    };

    if (progEditId) {
      lsUpd('progPrograms', progEditId, payload);
      toast('✅ تم تحديث الخطة الفردية', 'ok');
    } else {
      lsAdd('progPrograms', { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ الخطة الفردية بنجاح', 'ok');
    }
    setProgModal(false);
    reload();
  }

  function delProg(id) {
    if (!window.confirm('حذف هذه الخطة الفردية؟')) return;
    lsDel('progPrograms', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  function handleGoalsSelected(newGoals) {
    setProgForm(f => ({
      ...f,
      goals: [...(f.goals || []), ...newGoals],
    }));
    setGoalPickerOpen(false);
    toast(`✅ تمت إضافة ${newGoals.length} أهداف من البنك للخطة`, 'ok');
  }

  function removeGoalFromProg(index) {
    setProgForm(f => ({
      ...f,
      goals: (f.goals || []).filter((_, i) => i !== index),
    }));
  }

  // ----------------------------------------------------
  // Behavior Plans (BIP) Actions
  // ----------------------------------------------------
  function openNewBip() {
    setBipForm({ ...EMPTY_BIP, date: todayStr() });
    setBipEditId(null);
    setBipModal(true);
  }

  function openEditBip(item) {
    setBipForm({ ...EMPTY_BIP, ...item });
    setBipEditId(item.id);
    setBipModal(true);
  }

  function saveBip() {
    if (!validateStudentPick(bipForm)) { toast('⚠️ اختر الطالب أولاً', 'er'); return; }
    if (!bipForm.title.trim()) { toast('⚠️ أدخل عنوان خطة تعديل السلوك', 'er'); return; }

    const payload = {
      ...bipForm,
      isUnregistered: bipForm.mode === 'other',
      updatedAt: new Date().toISOString(),
    };

    if (bipEditId) {
      lsUpd('progBehaviorReports', bipEditId, payload);
      toast('✅ تم تحديث خطة تعديل السلوك', 'ok');
    } else {
      lsAdd('progBehaviorReports', { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ خطة تعديل السلوك', 'ok');
    }
    setBipModal(false);
    reload();
  }

  function delBip(id) {
    if (!window.confirm('حذف خطة السلوك هذه؟')) return;
    lsDel('progBehaviorReports', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  // Print IEP
  function printIEP(p) {
    const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const goalsRows = (p.goals || []).map((g, i) => `
      <tr>
        <td style="text-align:center;color:#64748b;">${i + 1}</td>
        <td><b>${esc(g.code || '—')}</b></td>
        <td>${esc(g.text)}</td>
        <td style="text-align:center;">${esc(domainLabel(g.domain) || 'عام')}</td>
        <td style="font-size:.78rem;">${esc(g.mastery || '—')}</td>
        <td style="text-align:center;">${esc(g.status || 'مستمر')}</td>
      </tr>
    `).join('');

    const html = `
      <div style="direction:rtl;text-align:right;">
        <h2 style="color:#7c3aed;border-bottom:2px solid #7c3aed;padding-bottom:8px;margin-bottom:14px;">
          📋 الخطة التربوية / التأهيلية الفردية (IEP)
        </h2>
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;">
          <tr>
            <td><b>اسم الطالب:</b> ${esc(p.studentName)}</td>
            <td><b>العمر:</b> ${esc(p.age || '—')}</td>
            <td><b>التشخيص:</b> ${esc(p.diagnosis || '—')}</td>
          </tr>
          <tr>
            <td><b>عنوان الخطة:</b> ${esc(p.title)}</td>
            <td><b>المدة المقررة:</b> ${esc(p.duration || '—')}</td>
            <td><b>الأخصائي المسؤول:</b> ${esc(p.specialistName || '—')}</td>
          </tr>
          <tr>
            <td><b>تاريخ البدء:</b> ${esc(p.startDate || '—')}</td>
            <td><b>تاريخ المراجعة:</b> ${esc(p.reviewDate || '—')}</td>
            <td><b>الحالة:</b> ${p.status === 'completed' ? 'مكتملة ✅' : 'نشطة ⏳'}</td>
          </tr>
        </table>

        <h3>🎯 الأهداف الإجرائية والتعليمية المحددة:</h3>
        <table border="1" style="width:100%;border-collapse:collapse;margin-top:8px;font-size:12px;">
          <thead style="background:#f1f5f9;">
            <tr>
              <th style="padding:6px;width:35px;">#</th>
              <th style="padding:6px;width:70px;">الرمز</th>
              <th style="padding:6px;">الهدف التعليمي / التأهيلي</th>
              <th style="padding:6px;width:110px;">المجال</th>
              <th style="padding:6px;width:110px;">معيار الإتقان</th>
              <th style="padding:6px;width:80px;">التقدم</th>
            </tr>
          </thead>
          <tbody>
            ${goalsRows || '<tr><td colspan="6" style="text-align:center;padding:12px;">لا توجد أهداف مسجلة</td></tr>'}
          </tbody>
        </table>

        ${p.activities ? `<h3 style="margin-top:16px;">🎨 الأنشطة والوسائل التعليمية المقترحة:</h3><p style="white-space:pre-wrap;">${esc(p.activities)}</p>` : ''}
        ${p.notes ? `<h3 style="margin-top:14px;">📝 ملاحظات وتوجيهات الخطة:</h3><p style="white-space:pre-wrap;">${esc(p.notes)}</p>` : ''}

        <div style="margin-top:30px;display:flex;justify-content:space-between;border-top:1px dashed #94a3b8;padding-top:16px;">
          <div><b>الأخصائي القائم بالخطة:</b> _______________</div>
          <div><b>توقيع ولي الأمر:</b> _______________</div>
          <div><b>اعتماد إدارة المركز:</b> _______________</div>
        </div>
      </div>
    `;

    const win = window.open('', '_blank');
    if (!win) { toast('⚠️ يرجى السماح بالنوافذ المنبثقة للطباعة', 'er'); return; }
    win.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>خطة IEP - ${p.studentName}</title>
          <style>body { font-family: 'Segoe UI', Tahoma, Arial; padding: 20px; font-size: 13px; }</style>
        </head>
        <body>
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #334155;padding-bottom:10px;margin-bottom:16px;">
            <div style="font-size:1.4rem;font-weight:bold;color:#1e40af;">${center?.name || 'مركز الأمل للتربية الخاصة'}</div>
            ${center?.logo ? `<img src="${center.logo}" style="height:60px;" />` : ''}
          </div>
          ${html}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  }

  // Filtered lists
  const filteredPrograms = programs.filter(p => {
    const matchSearch = !searchTerm || (p.studentName && p.studentName.includes(searchTerm)) || (p.title && p.title.includes(searchTerm));
    const matchStu = !selectedStudentFilter || p.stuId === selectedStudentFilter;
    return matchSearch && matchStu;
  });

  const filteredBips = bipList.filter(b => {
    const matchSearch = !searchTerm || (b.studentName && b.studentName.includes(searchTerm)) || (b.title && b.title.includes(searchTerm));
    const matchStu = !selectedStudentFilter || b.stuId === selectedStudentFilter;
    return matchSearch && matchStu;
  });

  return (
    <div>
      {/* Sub Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`tab ${subTab === 'iep' ? 'on' : ''}`}
            onClick={() => setSubTab('iep')}
          >
            📘 خطط البرامج الفردية IEP ({programs.length})
          </button>
          <button
            type="button"
            className={`tab ${subTab === 'bank' ? 'on' : ''}`}
            onClick={() => setSubTab('bank')}
          >
            🎯 بنك الأهداف التخصصي
          </button>
          <button
            type="button"
            className={`tab ${subTab === 'behavior' ? 'on' : ''}`}
            onClick={() => setSubTab('behavior')}
          >
            📐 خطط تعديل السلوك BIP ({bipList.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {subTab === 'iep' && (
            <button type="button" className="btn btn-p" onClick={openNewProg}>
              ➕ إنشاء خطة فردية IEP
            </button>
          )}
          {subTab === 'bank' && (
            <>
              <button type="button" className="btn btn-p" onClick={() => setBankManagerOpen(true)}>
                ⚙️ إدارة بنك الأهداف
              </button>
              <button type="button" className="btn btn-s" onClick={() => setBulkImporterOpen(true)}>
                📥 استيراد أهداف
              </button>
            </>
          )}
          {subTab === 'behavior' && (
            <button type="button" className="btn btn-p" onClick={openNewBip}>
              ➕ خطة تعديل سلوك جديدة
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder="🔍 بحث باسم الطالب أو عنوان الخطة..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <select value={selectedStudentFilter} onChange={e => setSelectedStudentFilter(e.target.value)}>
            <option value="">— تصفية بكل الطلاب —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {(searchTerm || selectedStudentFilter) && (
          <button type="button" className="btn btn-xs btn-g" onClick={() => { setSearchTerm(''); setSelectedStudentFilter(''); }}>
            إلغاء التصفية ✖
          </button>
        )}
      </div>

      {/* SUBTAB 1: IEP PROGRAMS */}
      {subTab === 'iep' && (
        <div>
          {filteredPrograms.length === 0 ? (
            <EmptyState icon="📋" title="لا توجد خطط فردية (IEP) مسجلة" sub="اضغط ➕ إنشاء خطة فردية IEP لتحديد الأهداف والأنشطة ومتابعة التقدم" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
              {filteredPrograms.map(item => {
                const goalsCount = item.goals?.length || 0;
                return (
                  <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-main)' }}>{item.title}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--g5)' }}>
                          الطالب: <strong>{item.studentName}</strong> {item.diagnosis && `· (${item.diagnosis})`}
                        </div>
                      </div>
                      <span className={`bdg ${item.status === 'completed' ? 'b-gr' : 'b-or'}`}>
                        {item.status === 'completed' ? 'مكتملة ✅' : 'نشطة ⏳'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, fontSize: '.78rem', color: 'var(--g5)', background: 'var(--g0)', padding: '8px 10px', borderRadius: 8 }}>
                      <div>🗓️ البدء: <strong>{item.startDate || '—'}</strong></div>
                      <div>🎯 الأهداف: <strong>{goalsCount} هدف</strong></div>
                      <div>⏳ المدة: <strong>{item.duration || 'فصل'}</strong></div>
                    </div>

                    {item.goals && item.goals.length > 0 && (
                      <div style={{ fontSize: '.8rem', color: 'var(--g6)', maxHeight: 65, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>أبرز الأهداف:</div>
                        <ul style={{ margin: 0, paddingRight: 18 }}>
                          {item.goals.slice(0, 2).map((g, i) => (
                            <li key={i}>{g.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: '.78rem' }}>
                      <span style={{ color: 'var(--g5)' }}>الأخصائي: <strong>{item.specialistName || '—'}</strong></span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {item.parentPhone && (
                          <button
                            type="button"
                            className="btn btn-xs btn-s"
                            title="إرسال الخطة لولي الأمر عبر واتساب"
                            onClick={() => {
                              const goalsSummary = (item.goals || []).map((g, i) => `${i + 1}. ${g.text}`).join('\n');
                              sendReportToWhatsApp({
                                parentPhone: item.parentPhone,
                                parentName: item.parentName,
                                studentName: item.studentName,
                                reportTitle: item.title,
                                reportType: 'الخطة الفردية (IEP)',
                                date: item.startDate,
                                summary: `مدة الخطة: ${item.duration}\nعدد الأهداف المستهدفة: ${goalsCount}\n${goalsSummary}`,
                                recommendations: item.activities || item.notes,
                                specialistName: item.specialistName,
                                centerName: center?.name,
                              });
                            }}
                          >
                            💬 واتساب
                          </button>
                        )}
                        <button type="button" className="btn btn-xs btn-bl" title="طباعة A4" onClick={() => printIEP(item)}>🖨️</button>
                        <button type="button" className="btn btn-xs btn-g" title="تعديل" onClick={() => openEditProg(item)}>✏️</button>
                        <button type="button" className="btn btn-xs btn-d" title="حذف" onClick={() => delProg(item.id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: GOALS BANK EXPLORER */}
      {subTab === 'bank' && (
        <div>
          <div className="card" style={{ marginBottom: 16, background: 'var(--pr-l)', border: '1px solid var(--pr)' }}>
            <h3 style={{ margin: '0 0 6px 0', color: 'var(--pr)' }}>🎯 بنك الأهداف التخصصي للمركز</h3>
            <p style={{ fontSize: '.86rem', color: 'var(--text-main)', margin: 0 }}>
              يحتوي على مئات الأهداف الإجرائية المقننة والموزعة حسب البرامج العالمية (لوفاس، بورتاج، إيبلز، بيب-3، هيلب) والمجالات النمائية.
              يمكنك ربطها مباشرة بأي خطة فردية (IEP)، أو تخصيص بنك الأهداف الخاص بمركزك.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {PROGRAMS.map(prog => (
              <div key={prog.key} className="card" style={{ borderTop: `4px solid ${prog.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: prog.color }}>{prog.label}</h4>
                  <span className="bdg b-bl">{prog.labelEn}</span>
                </div>
                <p style={{ fontSize: '.82rem', color: 'var(--g5)', minHeight: 40 }}>
                  أهداف وبرامج موجهة لـ {prog.label} تشمل المجالات المعرفية والتواصلية والحركية.
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="btn btn-p btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setBankManagerOpen(true);
                    }}
                  >
                    استعراض الأهداف 🔍
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: BEHAVIOR PLANS (BIP) */}
      {subTab === 'behavior' && (
        <div>
          {filteredBips.length === 0 ? (
            <EmptyState icon="📐" title="لا توجد خطط تعديل سلوك مسجلة" sub="اضغط ➕ خطة تعديل سلوك جديدة لتوثيق السلوكيات والبدائل والاستراتيجيات" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filteredBips.map(bip => (
                <div key={bip.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '.98rem' }}>{bip.title}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--g5)' }}>الطالب: {bip.studentName} · {bip.date}</div>
                    </div>
                    <span className="bdg b-or">خطة سلوك</span>
                  </div>

                  {bip.targetBehaviors && (
                    <div style={{ fontSize: '.82rem', background: 'var(--g0)', padding: '6px 8px', borderRadius: 6 }}>
                      <strong style={{ color: 'var(--err)' }}>السلوك المستهدف:</strong> {bip.targetBehaviors}
                    </div>
                  )}

                  {bip.replacementBehaviors && (
                    <div style={{ fontSize: '.82rem', background: 'var(--ok-l)', padding: '6px 8px', borderRadius: 6, color: 'var(--ok)' }}>
                      <strong>السلوك البديل المقترح:</strong> {bip.replacementBehaviors}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: '.78rem' }}>
                    <span style={{ color: 'var(--g5)' }}>الأخصائي: <strong>{bip.specialistName || '—'}</strong></span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {bip.parentPhone && (
                        <button
                          type="button"
                          className="btn btn-xs btn-s"
                          onClick={() => {
                            sendReportToWhatsApp({
                              parentPhone: bip.parentPhone,
                              parentName: bip.parentName,
                              studentName: bip.studentName,
                              reportTitle: bip.title,
                              reportType: 'خطة التدخل السلوكي (BIP)',
                              date: bip.date,
                              summary: `السلوك المستهدف: ${bip.targetBehaviors}\nالسلوك البديل: ${bip.replacementBehaviors}`,
                              recommendations: bip.reinforcementStrategies || bip.notes,
                              specialistName: bip.specialistName,
                              centerName: center?.name,
                            });
                          }}
                        >
                          💬 واتساب
                        </button>
                      )}
                      <button type="button" className="btn btn-xs btn-g" onClick={() => openEditBip(bip)}>✏️</button>
                      <button type="button" className="btn btn-xs btn-d" onClick={() => delBip(bip.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE / EDIT IEP PROGRAM */}
      {progModal && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>📋 {progEditId ? 'تعديل الخطة الفردية (IEP)' : 'إنشاء خطة تربوية / تأهيلية فردية (IEP)'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <StudentPicker form={progForm} setForm={setProgForm} students={students} emps={emps} showExtra />
                <div className="fl full">
                  <label>عنوان الخطة الفردية <span className="req">*</span></label>
                  <input
                    value={progForm.title}
                    onChange={e => setProgForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="مثال: الخطة التربوية الفردية - الفصل الأول..."
                  />
                </div>
                <div className="fl">
                  <label>تاريخ البدء</label>
                  <input type="date" value={progForm.startDate} onChange={e => setProgForm(f => ({ ...f, startDate: e.target.value }))}/>
                </div>
                <div className="fl">
                  <label>تاريخ المراجعة والتقييم</label>
                  <input type="date" value={progForm.reviewDate} onChange={e => setProgForm(f => ({ ...f, reviewDate: e.target.value }))}/>
                </div>
                <div className="fl">
                  <label>المدة الزمنية المقررة</label>
                  <input value={progForm.duration} onChange={e => setProgForm(f => ({ ...f, duration: e.target.value }))} placeholder="مثال: 3 أشهر، 6 أشهر..."/>
                </div>
                <div className="fl">
                  <label>حالة الخطة</label>
                  <select value={progForm.status} onChange={e => setProgForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">نشطة وقيد التطبيق ⏳</option>
                    <option value="completed">مكتملة ومحققة ✅</option>
                    <option value="review">تحت المراجعة 🔍</option>
                  </select>
                </div>
              </div>

              {/* GOALS SECTION */}
              <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: '.96rem' }}>
                    🎯 الأهداف المحددة للخطة ({progForm.goals?.length || 0})
                  </div>
                  <button
                    type="button"
                    className="btn btn-s btn-sm"
                    onClick={() => setGoalPickerOpen(true)}
                  >
                    ➕ اختيار أهداف من بنك الأهداف
                  </button>
                </div>

                {(!progForm.goals || progForm.goals.length === 0) ? (
                  <div style={{ padding: '16px', background: 'var(--g0)', borderRadius: 8, textAlign: 'center', fontSize: '.84rem', color: 'var(--g5)' }}>
                    لم يتم إضافة أهداف للخطة بعد. اضغط «➕ اختيار أهداف من بنك الأهداف» لإدراج أهداف جاهزة أو مخصصة.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {progForm.goals.map((goal, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '.88rem' }}>
                            {idx + 1}. {goal.text}
                          </div>
                          <div style={{ display: 'flex', gap: 8, fontSize: '.74rem', color: 'var(--g5)', marginTop: 4 }}>
                            {goal.code && <span className="bdg b-bl">{goal.code}</span>}
                            <span>المجال: <strong>{domainLabel(goal.domain) || goal.domain || 'عام'}</strong></span>
                            {goal.mastery && <span>الإتقان: {goal.mastery}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs btn-d"
                          onClick={() => removeGoalFromProg(idx)}
                          title="حذف الهدف من الخطة"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="fg c2" style={{ marginTop: 16 }}>
                <div className="fl full">
                  <label>الأنشطة والوسائل التعليمية والتأهيلية</label>
                  <textarea
                    value={progForm.activities}
                    onChange={e => setProgForm(f => ({ ...f, activities: e.target.value }))}
                    rows={3}
                    placeholder="الأدوات المعينة، المعززات، استراتيجيات التدريب والنمذجة..."
                  />
                </div>
                <div className="fl full">
                  <label>ملاحظات إضافية</label>
                  <textarea
                    value={progForm.notes}
                    onChange={e => setProgForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={saveProg}>💾 حفظ الخطة</button>
              <button type="button" className="btn btn-g" onClick={() => setProgModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT BIP */}
      {bipModal && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>📐 {bipEditId ? 'تعديل خطة السلوك' : 'إنشاء خطة تعديل سلوك (BIP)'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <StudentPicker form={bipForm} setForm={setBipForm} students={students} emps={emps} showExtra />
                <div className="fl full">
                  <label>عنوان الخطة <span className="req">*</span></label>
                  <input
                    value={bipForm.title}
                    onChange={e => setBipForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="مثال: خطة تقليل نوبات الغضب وتنمية التواصل..."
                  />
                </div>
                <div className="fl">
                  <label>تاريخ الخطة</label>
                  <input type="date" value={bipForm.date} onChange={e => setBipForm(f => ({ ...f, date: e.target.value }))}/>
                </div>
                <div className="fl">
                  <label>تاريخ المراجعة</label>
                  <input type="date" value={bipForm.reviewDate} onChange={e => setBipForm(f => ({ ...f, reviewDate: e.target.value }))}/>
                </div>
                <div className="fl full">
                  <label>السلوك المستهدف (وصف إجرائي دقيق)</label>
                  <textarea
                    value={bipForm.targetBehaviors}
                    onChange={e => setBipForm(f => ({ ...f, targetBehaviors: e.target.value }))}
                    rows={2}
                    placeholder="وصف السلوك غير المرغوب، معدل تكراره وشدته..."
                  />
                </div>
                <div className="fl">
                  <label>المثيرات القبلية (السوابق - Antecedents)</label>
                  <textarea
                    value={bipForm.antecedents}
                    onChange={e => setBipForm(f => ({ ...f, antecedents: e.target.value }))}
                    rows={2}
                    placeholder="ما يحدث قبل ظهور السلوك مباشرة..."
                  />
                </div>
                <div className="fl">
                  <label>اللواحق والوظيفة السلوكية (Consequences)</label>
                  <textarea
                    value={bipForm.consequences}
                    onChange={e => setBipForm(f => ({ ...f, consequences: e.target.value }))}
                    rows={2}
                    placeholder="الهروب، لفت الانتباه، الحصول على شيء..."
                  />
                </div>
                <div className="fl full">
                  <label>السلوك البديل المرغوب تدريبه</label>
                  <textarea
                    value={bipForm.replacementBehaviors}
                    onChange={e => setBipForm(f => ({ ...f, replacementBehaviors: e.target.value }))}
                    rows={2}
                    placeholder="السلوك الإيجابي المقبول وظيفياً..."
                  />
                </div>
                <div className="fl full">
                  <label>استراتيجيات التعزيز والتدخل</label>
                  <textarea
                    value={bipForm.reinforcementStrategies}
                    onChange={e => setBipForm(f => ({ ...f, reinforcementStrategies: e.target.value }))}
                    rows={2}
                    placeholder="جدول التعزيز، المحفزات، أسلوب التعامل مع الانتكاس..."
                  />
                </div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={saveBip}>💾 حفظ خطة السلوك</button>
              <button type="button" className="btn btn-g" onClick={() => setBipModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GOAL PICKER */}
      {goalPickerOpen && (
        <GoalPickerModal
          onSelect={handleGoalsSelected}
          onClose={() => setGoalPickerOpen(false)}
        />
      )}

      {/* MODAL: GOALS BANK MANAGER */}
      {bankManagerOpen && (
        <GoalsBankManagerModal
          onClose={() => {
            setBankManagerOpen(false);
            reload();
          }}
        />
      )}

      {/* MODAL: BULK IMPORTER */}
      {bulkImporterOpen && (
        <BulkImporter
          onClose={() => {
            setBulkImporterOpen(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
