import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { lsGet, lsAdd } from '../hooks/useStorage';
import { uid, todayStr } from '../utils/dateHelpers';

const PROGRAM_DOMAINS = [
  'التربية الخاصة', 'التدخل المبكر', 'مرحلة الروضة', 'صعوبات التعلم',
  'فرط الحركة ونقص الانتباه', 'تعديل السلوك', 'التكامل الحسي',
  'التفاعل الاجتماعي', 'الرعاية الذاتية', 'التخاطب والنطق',
];

const EMPTY_EVAL = { studentName:'', domain:'التربية الخاصة', date:'', summary:'', goals:'' };
const EMPTY_PROG = { title:'', domain:'التربية الخاصة', duration:'', objectives:'', activities:'' };
const EMPTY_REP = { title:'', domain:'التربية الخاصة', period:'', content:'' };

export default function ProgramsReports() {
  const { t } = useLang();
  const { toast } = useApp();
  const [modal, setModal] = useState(null);
  const [evalForm, setEvalForm] = useState({ ...EMPTY_EVAL, date: todayStr() });
  const [progForm, setProgForm] = useState(EMPTY_PROG);
  const [repForm, setRepForm] = useState(EMPTY_REP);
  const [helperNote, setHelperNote] = useState('');

  const evaluations = lsGet('progEvaluations');
  const programs = lsGet('progPrograms');
  const reports = lsGet('progReports');

  function openModal(type) {
    setHelperNote('');
    if (type === 'eval') setEvalForm({ ...EMPTY_EVAL, date: todayStr() });
    if (type === 'prog') setProgForm(EMPTY_PROG);
    if (type === 'rep') setRepForm(EMPTY_REP);
    setModal(type);
  }

  function fillSuggestedDraft(type, form, setForm) {
    const domain = form.domain || 'التربية الخاصة';
    const name = form.studentName || form.title || 'المستفيد';
    let draft = '';
    if (type === 'eval') {
      draft = `تقييم أولي — ${domain}\nالطالب/ة: ${name}\n\nنقاط القوة:\n• \n\nمجالات تحتاج دعم:\n• \n\nتوصيات:\n• برنامج تدخل قصير المدى وفق أهداف SMART\n• متابعة أسبوعية مع ولي الأمر`;
    } else if (type === 'prog') {
      draft = `برنامج تدخل — ${domain}\nالمدة المقترحة: ${form.duration || '8–12 أسبوع'}\n\nالأهداف:\n1. \n2. \n\nالأنشطة:\n• جلسات فردية 2× أسبوعياً\n• أنشطة منزلية موجهة\n• قياس تقدم كل 4 أسابيع`;
    } else {
      draft = `تقرير تقدم — ${domain}\nالفترة: ${form.period || 'شهري'}\n\nملخص الأداء:\n• \n\nنسبة تحقيق الأهداف: —%\n\nتوصيات الفريق:\n• `;
    }
    setForm(f => ({ ...f, ...(type === 'eval' ? { summary: draft } : type === 'prog' ? { objectives: draft.split('\n\nالأنشطة')[0], activities: '• جلسات فردية\n• أنشطة منزلية' } : { content: draft }) }));
    setHelperNote('تم تجهيز مسودة مقترحة — راجعها وعدّلها قبل الحفظ.');
  }

  function saveEval() {
    if (!evalForm.studentName.trim()) { toast('⚠️ أدخل اسم الطالب', 'er'); return; }
    lsAdd('progEvaluations', { ...evalForm, id: uid(), createdAt: todayStr() });
    toast('✅ تم حفظ التقييم', 'ok');
    setModal(null);
  }

  function saveProg() {
    if (!progForm.title.trim()) { toast('⚠️ أدخل عنوان البرنامج', 'er'); return; }
    lsAdd('progPrograms', { ...progForm, id: uid(), createdAt: todayStr() });
    toast('✅ تم حفظ البرنامج', 'ok');
    setModal(null);
  }

  function saveRep() {
    if (!repForm.title.trim()) { toast('⚠️ أدخل عنوان التقرير', 'er'); return; }
    lsAdd('progReports', { ...repForm, id: uid(), createdAt: todayStr() });
    toast('✅ تم حفظ التقرير', 'ok');
    setModal(null);
  }

  const fldE = k => e => setEvalForm(f => ({ ...f, [k]: e.target.value }));
  const fldP = k => e => setProgForm(f => ({ ...f, [k]: e.target.value }));
  const fldR = k => e => setRepForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>📚 {t('progReports.title')}</h2>
          <p>{t('progReports.sub')}</p>
        </div>
        <div className="ph-a" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-p" onClick={() => openModal('eval')}>➕ تقييم جديد</button>
          <button type="button" className="btn btn-s" onClick={() => openModal('prog')}>➕ إضافة برنامج</button>
          <button type="button" className="btn btn-g" onClick={() => openModal('rep')}>➕ إضافة تقرير</button>
        </div>
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="sc g"><div className="lb">التقييمات</div><div className="vl">{evaluations.length}</div></div>
        <div className="sc"><div className="lb">البرامج</div><div className="vl">{programs.length}</div></div>
        <div className="sc v"><div className="lb">التقارير</div><div className="vl">{reports.length}</div></div>
      </div>

      <div className="wg" style={{ marginTop: 16 }}>
        <div className="wg-h"><h3>🧩 المساعد الكتابي</h3></div>
        <div className="wg-b" style={{ fontSize: '.88rem', color: 'var(--g5)' }}>
          يمكنك استخدام المسودة المقترحة داخل كل نموذج لتسريع كتابة التقييمات والبرامج والتقارير، ثم مراجعتها وتخصيصها حسب حالة الطالب.
        </div>
      </div>

      {(evaluations.length > 0 || programs.length > 0 || reports.length > 0) && (
        <div className="g2" style={{ marginTop: 16 }}>
          {evaluations.slice(0, 5).map(e => (
            <div key={e.id} className="card">
              <div className="ci"><div className="cn">📋 {e.studentName}</div><div className="cm">{e.domain} · {e.date}</div></div>
            </div>
          ))}
          {programs.slice(0, 5).map(p => (
            <div key={p.id} className="card">
              <div className="ci"><div className="cn">📘 {p.title}</div><div className="cm">{p.domain}</div></div>
            </div>
          ))}
          {reports.slice(0, 5).map(r => (
            <div key={r.id} className="card">
              <div className="ci"><div className="cn">📑 {r.title}</div><div className="cm">{r.domain} · {r.period}</div></div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="mbg" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>{modal === 'eval' ? '📋 تقييم جديد' : modal === 'prog' ? '📘 برنامج جديد' : '📑 تقرير جديد'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              {helperNote && <div style={{ marginBottom: 12, padding: 10, background: 'var(--ok-l)', borderRadius: 8, fontSize: '.82rem' }}>{helperNote}</div>}

              {modal === 'eval' && (
                <div className="fg c2">
                  <div className="fl"><label>اسم الطالب</label><input value={evalForm.studentName} onChange={fldE('studentName')} /></div>
                  <div className="fl"><label>التاريخ</label><input type="date" value={evalForm.date} onChange={fldE('date')} /></div>
                  <div className="fl full"><label>المجال</label>
                    <select value={evalForm.domain} onChange={fldE('domain')}>{PROGRAM_DOMAINS.map(d => <option key={d}>{d}</option>)}</select>
                  </div>
                  <div className="fl full"><label>ملخص التقييم</label><textarea value={evalForm.summary} onChange={fldE('summary')} rows={8} /></div>
                  <div className="fl full">
                    <button type="button" className="btn btn-s btn-sm" onClick={() => fillSuggestedDraft('eval', evalForm, setEvalForm)}>📝 تعبئة مقترحة</button>
                  </div>
                </div>
              )}

              {modal === 'prog' && (
                <div className="fg c2">
                  <div className="fl full"><label>عنوان البرنامج</label><input value={progForm.title} onChange={fldP('title')} /></div>
                  <div className="fl"><label>المجال</label><select value={progForm.domain} onChange={fldP('domain')}>{PROGRAM_DOMAINS.map(d => <option key={d}>{d}</option>)}</select></div>
                  <div className="fl"><label>المدة</label><input value={progForm.duration} onChange={fldP('duration')} placeholder="8 أسابيع" /></div>
                  <div className="fl full"><label>الأهداف</label><textarea value={progForm.objectives} onChange={fldP('objectives')} rows={5} /></div>
                  <div className="fl full"><label>الأنشطة</label><textarea value={progForm.activities} onChange={fldP('activities')} rows={4} /></div>
                  <div className="fl full">
                    <button type="button" className="btn btn-s btn-sm" onClick={() => fillSuggestedDraft('prog', progForm, setProgForm)}>📝 تعبئة مقترحة</button>
                  </div>
                </div>
              )}

              {modal === 'rep' && (
                <div className="fg c2">
                  <div className="fl full"><label>عنوان التقرير</label><input value={repForm.title} onChange={fldR('title')} /></div>
                  <div className="fl"><label>المجال</label><select value={repForm.domain} onChange={fldR('domain')}>{PROGRAM_DOMAINS.map(d => <option key={d}>{d}</option>)}</select></div>
                  <div className="fl"><label>الفترة</label><input value={repForm.period} onChange={fldR('period')} placeholder="شهري / فصلي" /></div>
                  <div className="fl full"><label>محتوى التقرير</label><textarea value={repForm.content} onChange={fldR('content')} rows={10} /></div>
                  <div className="fl full">
                    <button type="button" className="btn btn-s btn-sm" onClick={() => fillSuggestedDraft('rep', repForm, setRepForm)}>📝 تعبئة مقترحة</button>
                  </div>
                </div>
              )}
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={modal === 'eval' ? saveEval : modal === 'prog' ? saveProg : saveRep}>💾 حفظ</button>
              <button type="button" className="btn btn-g" onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
