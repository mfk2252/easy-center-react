import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsAdd, lsUpd, lsDel } from '../../hooks/useStorage';
import { uid, todayStr } from '../../utils/dateHelpers';
import { printItem } from '../../utils/printUtils';
import EmptyState from '../../components/ui/EmptyState';
import { StudentPicker, validateStudentPick, EMPTY_STU_PICK } from './StudentPicker';
import { sendReportToWhatsApp } from './programsWhatsApp';

const EMPTY_MEETING = {
  ...EMPTY_STU_PICK,
  date: todayStr(),
  title: 'لقاء دوري مع ولي الأمر',
  attendees: '',
  meetingTopics: '',
  parentFeedback: '',
  recommendations: '',
  homePlan: '',
  specialistName: '',
  agreedPoints: '',
  notes: '',
};

export default function PillarFamily({ onDataChange }) {
  const { toast, center } = useApp();
  const [subTab, setSubTab] = useState('meetings'); // 'meetings' | 'whatsapp'
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_MEETING);

  // Quick WhatsApp Dispatcher State
  const [waSelectedStuId, setWaSelectedStuId] = useState('');
  const [waCustomMessage, setWaCustomMessage] = useState('');
  const [waMessageType, setWaMessageType] = useState('summary');

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
    setMeetings((lsGet('progParentMeetings') || []).sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    if (onDataChange) onDataChange();
  }

  useEffect(() => { reload(); }, []);

  function openNew() {
    setForm({
      ...EMPTY_MEETING,
      date: todayStr(),
    });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setForm({ ...EMPTY_MEETING, ...item });
    setEditId(item.id);
    setModalOpen(true);
  }

  function save() {
    if (!validateStudentPick(form)) { toast('⚠️ اختر الطالب أولاً', 'er'); return; }
    if (!form.title.trim()) { toast('⚠️ أدخل عنوان الاجتماع أو التقرير', 'er'); return; }

    const payload = {
      ...form,
      isUnregistered: form.mode === 'other',
      updatedAt: new Date().toISOString(),
    };

    if (editId) {
      lsUpd('progParentMeetings', editId, payload);
      toast('✅ تم تحديث تقرير لقاء ولي الأمر', 'ok');
    } else {
      lsAdd('progParentMeetings', { ...payload, id: uid(), createdAt: new Date().toISOString() });
      toast('✅ تم حفظ تقرير اللقاء بنجاح', 'ok');
    }
    setModalOpen(false);
    reload();
  }

  function del(id) {
    if (!window.confirm('حذف محضر هذا اللقاء؟')) return;
    lsDel('progParentMeetings', id);
    toast('🗑️ تم الحذف', 'ok');
    reload();
  }

  function printMeeting(item) {
    const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `
      <div style="direction:rtl;text-align:right;">
        <h2 style="color:#db2777;border-bottom:2px solid #db2777;padding-bottom:8px;margin-bottom:14px;">
          👨‍👩‍👧 محضر اجتماع ولقاء ولي الأمر
        </h2>
        <table style="width:100%;margin-bottom:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;">
          <tr>
            <td><b>اسم الطالب:</b> ${esc(item.studentName)}</td>
            <td><b>اسم ولي الأمر:</b> ${esc(item.parentName || '—')}</td>
            <td><b>تاريخ اللقاء:</b> ${esc(item.date || '—')}</td>
          </tr>
          <tr>
            <td><b>الحضور:</b> ${esc(item.attendees || 'ولي الأمر والأخصائي')}</td>
            <td><b>الأخصائي المشرف:</b> ${esc(item.specialistName || '—')}</td>
            <td><b>رقم الهاتف:</b> ${esc(item.parentPhone || '—')}</td>
          </tr>
        </table>

        ${item.meetingTopics ? `<h3>📌 موضوعات وجدول أعمال اللقاء:</h3><p style="white-space:pre-wrap;">${esc(item.meetingTopics)}</p>` : ''}
        ${item.parentFeedback ? `<h3>🗣️ مرئيات وملاحظات واستفسارات الأسرة:</h3><p style="white-space:pre-wrap;">${esc(item.parentFeedback)}</p>` : ''}
        ${item.agreedPoints ? `<h3>🤝 النقاط المتفق عليها وخطة التعاون:</h3><p style="white-space:pre-wrap;">${esc(item.agreedPoints)}</p>` : ''}
        ${item.homePlan ? `<h3>🏡 التوصيات والإرشادات المنزلية الموجهة للأسرة:</h3><p style="white-space:pre-wrap;">${esc(item.homePlan)}</p>` : ''}

        <div style="margin-top:30px;display:flex;justify-content:space-between;border-top:1px dashed #94a3b8;padding-top:16px;">
          <div><b>توقيع الأخصائي:</b> _______________</div>
          <div><b>توقيع ولي الأمر بالعلم والموافقة:</b> _______________</div>
          <div><b>اعتماد الإدارة:</b> _______________</div>
        </div>
      </div>
    `;
    printItem({ html }, 'meeting', center?.logo, center?.name);
  }

  // Quick Direct WhatsApp sender
  function handleSendCustomWhatsApp() {
    const stu = students.find(s => s.id === waSelectedStuId);
    if (!stu) { toast('⚠️ اختر الطالب لإرسال الرسالة إلى ولي أمره', 'er'); return; }
    const phone = stu.parentPhone || stu.phone;
    if (!phone) { toast('⚠️ لا يتوفر رقم هاتف لولي أمر هذا الطالب', 'er'); return; }

    const res = sendReportToWhatsApp({
      parentPhone: phone,
      parentName: stu.parentName,
      studentName: stu.name,
      reportTitle: waMessageType === 'meeting' ? 'تذكير بلقاء ولي الأمر' : 'تقرير ومتابعة أداء الطالب',
      reportType: 'تواصل وشراكة أسرية',
      date: todayStr(),
      summary: waCustomMessage || 'نحيطكم علماً بأن الطالب يظهر تحسناً مستمراً ونأمل منكم مواصلة التدريب المنزلي.',
      recommendations: 'نسعد دائماً بتواصلكم ومشاركتكم الفعالة.',
      specialistName: stu.specialistName,
      centerName: center?.name,
    });

    if (res.ok) {
      toast('✅ تم فتح محادثة WhatsApp للإرسال', 'ok');
    } else {
      toast(`⚠️ ${res.message}`, 'er');
    }
  }

  const filteredMeetings = meetings.filter(m => {
    const matchSearch = !searchTerm || (m.studentName && m.studentName.includes(searchTerm)) || (m.title && m.title.includes(searchTerm));
    const matchStu = !selectedStudentFilter || m.stuId === selectedStudentFilter;
    return matchSearch && matchStu;
  });

  return (
    <div>
      {/* Sub Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`tab ${subTab === 'meetings' ? 'on' : ''}`}
            onClick={() => setSubTab('meetings')}
          >
            👨‍👩‍👧 محاضر ولقاءات أولياء الأمور ({meetings.length})
          </button>
          <button
            type="button"
            className={`tab ${subTab === 'whatsapp' ? 'on' : ''}`}
            onClick={() => setSubTab('whatsapp')}
          >
            📱 مركز الإرسال المباشر لولي الأمر (واتساب)
          </button>
        </div>

        {subTab === 'meetings' && (
          <button type="button" className="btn btn-p" onClick={openNew}>
            ➕ تسجيل لقاء جديد مع ولي أمر
          </button>
        )}
      </div>

      {/* SUBTAB 1: MEETINGS */}
      {subTab === 'meetings' && (
        <div>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                placeholder="🔍 بحث باسم الطالب أو عنوان اللقاء..."
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

          {filteredMeetings.length === 0 ? (
            <EmptyState icon="👨‍👩‍👧" title="لا توجد محاضر لقاءات مسجلة بعد" sub="اضغط ➕ تسجيل لقاء جديد لتوثيق جلسات التوجيه الأسري وتوصيات المنزل" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 14 }}>
              {filteredMeetings.map(item => (
                <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{item.title}</div>
                      <div style={{ fontSize: '.8rem', color: 'var(--g5)' }}>
                        الطالب: <strong>{item.studentName}</strong> {item.parentName && `· ولي الأمر: ${item.parentName}`}
                      </div>
                    </div>
                    <span className="bdg b-bl">{item.date}</span>
                  </div>

                  {item.agreedPoints && (
                    <div style={{ fontSize: '.82rem', background: 'var(--ok-l)', padding: '6px 8px', borderRadius: 6, color: 'var(--ok)' }}>
                      <strong>النقاط المتفق عليها:</strong> {item.agreedPoints}
                    </div>
                  )}

                  {item.homePlan && (
                    <div style={{ fontSize: '.82rem', background: 'var(--g0)', padding: '6px 8px', borderRadius: 6 }}>
                      <strong>الإرشادات المنزلية:</strong> {item.homePlan}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: '.78rem' }}>
                    <span style={{ color: 'var(--g5)' }}>الأخصائي: <strong>{item.specialistName || '—'}</strong></span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {item.parentPhone && (
                        <button
                          type="button"
                          className="btn btn-xs btn-s"
                          title="إرسال ملخص اللقاء والتوصيات لولي الأمر عبر واتساب"
                          onClick={() => {
                            sendReportToWhatsApp({
                              parentPhone: item.parentPhone,
                              parentName: item.parentName,
                              studentName: item.studentName,
                              reportTitle: item.title,
                              reportType: 'محضر اجتماع وتوجيه أسري',
                              date: item.date,
                              summary: `الموضوعات: ${item.meetingTopics || '—'}\nالنقاط المتفق عليها: ${item.agreedPoints || '—'}`,
                              recommendations: item.homePlan || item.recommendations,
                              specialistName: item.specialistName,
                              centerName: center?.name,
                            });
                          }}
                        >
                          💬 واتساب
                        </button>
                      )}
                      <button type="button" className="btn btn-xs btn-bl" title="طباعة المحضر" onClick={() => printMeeting(item)}>🖨️</button>
                      <button type="button" className="btn btn-xs btn-g" title="تعديل" onClick={() => openEdit(item)}>✏️</button>
                      <button type="button" className="btn btn-xs btn-d" title="حذف" onClick={() => del(item.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: WHATSAPP DIRECT DISPATCHER */}
      {subTab === 'whatsapp' && (
        <div className="card" style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: '2rem' }}>📱</div>
            <div>
              <h3 style={{ margin: 0 }}>مركز إرسال الرسائل والتقارير لولي الأمر</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--g5)', fontSize: '.85rem' }}>
                تواصل مباشر مع أولياء الأمور لإرسال تقارير المتابعة أو توصيات الجلسات بنص رسمي منسق.
              </p>
            </div>
          </div>

          <div className="fg c1">
            <div className="fl">
              <label>اختر الطالب المستهدف <span className="req">*</span></label>
              <select value={waSelectedStuId} onChange={e => setWaSelectedStuId(e.target.value)}>
                <option value="">— اختر الطالب —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.parentPhone ? `(هاتف: ${s.parentPhone})` : '(لا يتوفر هاتف)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="fl">
              <label>نوع الإشعار / الرسالة</label>
              <select value={waMessageType} onChange={e => setWaMessageType(e.target.value)}>
                <option value="summary">📌 ملخص أداء ومتابعة دورية</option>
                <option value="meeting">👨‍👩‍👧 تذكير بموعد لقاء واجتماع ولي الأمر</option>
                <option value="home">🏡 توصيات وتكليفات تدريب منزلي</option>
              </select>
            </div>

            <div className="fl">
              <label>نص الرسالة أو الملاحظات الموجهة للأسرة</label>
              <textarea
                rows={5}
                value={waCustomMessage}
                onChange={e => setWaCustomMessage(e.target.value)}
                placeholder="اكتب التوجيهات أو التقرير هنا ليتم تضمينها في رسالة واتساب الرسمية..."
              />
            </div>

            <button
              type="button"
              className="btn btn-s"
              style={{ fontSize: '1rem', padding: '12px 20px', marginTop: 10 }}
              onClick={handleSendCustomWhatsApp}
            >
              💬 إرسال الرسالة عبر WhatsApp لولي الأمر الآن
            </button>
          </div>
        </div>
      )}

      {/* MODAL: MEETING FORM */}
      {modalOpen && (
        <div className="mbg">
          <div className="mb mb-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
            <div className="fhd" style={{ padding: '14px 20px' }}>
              <h2>👨‍👩‍👧 {editId ? 'تعديل محضر لقاء ولي الأمر' : 'تسجيل لقاء جديد مع ولي الأمر'}</h2>
            </div>
            <div className="modal-body-scroll" style={{ padding: '18px 20px' }}>
              <div className="fg c2">
                <StudentPicker form={form} setForm={setForm} students={students} emps={emps} showExtra />
                <div className="fl">
                  <label>تاريخ اللقاء <span className="req">*</span></label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}/>
                </div>
                <div className="fl">
                  <label>أطراف الحضور</label>
                  <input value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} placeholder="مثال: ولي الأمر، الأخصائي النفسي، أخصائي النطق..."/>
                </div>
                <div className="fl full">
                  <label>عنوان اللقاء / الهدف منه <span className="req">*</span></label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="مثال: مناقشة نتائج الخطة الفردية للفصل الأول..."/>
                </div>
                <div className="fl full">
                  <label>الموضوعات التي تمت مناقشتها</label>
                  <textarea value={form.meetingTopics} onChange={e => setForm(f => ({ ...f, meetingTopics: e.target.value }))} rows={2} placeholder="التقدم اللغوي، الاستقلالية، السلوكيات..."/>
                </div>
                <div className="fl full">
                  <label>مرئيات واستفسارات ولي الأمر</label>
                  <textarea value={form.parentFeedback} onChange={e => setForm(f => ({ ...f, parentFeedback: e.target.value }))} rows={2} placeholder="ملاحظات الأهل في المنزل..."/>
                </div>
                <div className="fl full">
                  <label>النقاط المتفق عليها</label>
                  <textarea value={form.agreedPoints} onChange={e => setForm(f => ({ ...f, agreedPoints: e.target.value }))} rows={2} placeholder="الاتفاق على تقليل الشاشات، تدريب الطفل على مسك الملعقة..."/>
                </div>
                <div className="fl full">
                  <label>التوصيات والإرشادات المنزلية المحددة للأسرة</label>
                  <textarea value={form.homePlan} onChange={e => setForm(f => ({ ...f, homePlan: e.target.value }))} rows={3} placeholder="خطة المهام المنزلية والتعزيز..."/>
                </div>
              </div>
            </div>
            <div className="fa">
              <button type="button" className="btn btn-p" onClick={save}>💾 حفظ المحضر</button>
              <button type="button" className="btn btn-g" onClick={() => setModalOpen(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
