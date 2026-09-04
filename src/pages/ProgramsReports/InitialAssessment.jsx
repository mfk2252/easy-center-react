import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { lsGet, lsDel } from '../../hooks/useStorage';
import { printItem } from '../../utils/printUtils';
import EmptyState from '../../components/ui/EmptyState';
import InitialAssessmentModal from '../../components/assessments/InitialAssessmentModal';

export default function InitialAssessment({ onBack }) {
  const { toast } = useApp();
  const [students, setStudents] = useState([]);
  const [emps, setEmps] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvalItem, setSelectedEvalItem] = useState(null);

  function reload() {
    setStudents(lsGet('students'));
    setEmps(lsGet('employees'));
  }
  useEffect(() => { reload(); }, []);

  const evaluations = lsGet('progEvaluations').sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  function openNew() {
    setSelectedEvalItem(null);
    setModalOpen(true);
  }
  function openEdit(item) {
    setSelectedEvalItem(item);
    setModalOpen(true);
  }

  return (
    <div className="card full">
      <div className="fhd">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--p)', display: 'flex', gap: 8, alignItems: 'center' }}>
          🎯 مركز التقييم والتشخيص
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-p" onClick={openNew}>➕ تقييم مبدئي جديد</button>
          <button type="button" className="btn btn-g" onClick={onBack}>العودة للبرامج والتقارير</button>
        </div>
      </div>

      <div className="p15" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 700 }}>
          <thead>
            <tr>
              <th>تاريخ التقييم</th>
              <th>الطالب</th>
              <th>المجال</th>
              <th>الأخصائي</th>
              <th>الخيارات</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.length === 0 ? (
              <tr><td colSpan="5"><EmptyState title="لا توجد تقييمات مسجلة" subtitle="اضغط على اضافة تقييم مبدئي جديد للبدء" /></td></tr>
            ) : evaluations.map(ev => {
              const s = students.find(x => x.id === ev.stuId) || {};
              return (
                <tr key={ev.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{ev.date}</td>
                  <td style={{ fontWeight: 600 }}>{s.name || ev.studentName}</td>
                  <td><span className="bdg">{ev.domain}</span></td>
                  <td>{ev.specialistName || 'غير محدد'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-xs btn-s" onClick={() => openEdit(ev)}>تعديل / عرض</button>
                      <button type="button" className="btn btn-xs btn-bl" onClick={() => printItem('evaluations', ev, students)}>🖨️ طباعة</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <InitialAssessmentModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedEvalItem(null); }}
          onSaved={() => { reload(); }}
          students={students}
          emps={emps}
          initialData={selectedEvalItem}
        />
      )}
    </div>
  );
}
