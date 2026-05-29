import { useMemo } from 'react';
import { useLang } from '../../context/LanguageContext';
import { formatDate } from '../../utils/dateHelpers';

const TYPE_META = {
  session: { icon: '🩺', color: 'var(--pr)' },
  report: { icon: '📑', color: 'var(--cyan)' },
  note: { icon: '📝', color: 'var(--g6)' },
  absence: { icon: '❌', color: 'var(--err)' },
  plan: { icon: '🎯', color: 'var(--pur)' },
  file: { icon: '📎', color: 'var(--ok)' },
  payment: { icon: '💳', color: 'var(--warn)' },
  appointment: { icon: '📅', color: 'var(--pr)' },
};

export default function StudentTimeline({
  sessions = [],
  reports = [],
  attendance = [],
  iepGoals = [],
  attachments = [],
  notes = '',
  payments = [],
  appointments = [],
}) {
  const { t } = useLang();

  const events = useMemo(() => {
    const list = [];

    sessions.forEach(s => {
      list.push({
        id: `sess-${s.id}`,
        type: 'session',
        date: s.date || '',
        time: s.time,
        title: s.type || t('timeline.session'),
        desc: s.notes || s.goals || '',
        extra: s.attachmentName,
      });
    });

    reports.forEach(r => {
      list.push({
        id: `rep-${r.id}`,
        type: 'report',
        date: r.date || '',
        title: r.title || t('timeline.report'),
        desc: r.summary || r.content || '',
      });
    });

    attendance.filter(a => a.status === 'absent' || a.status === 'غائب').forEach(a => {
      list.push({
        id: `att-${a.id || a.date}`,
        type: 'absence',
        date: a.date || '',
        title: t('timeline.absence'),
        desc: a.notes || a.reason || '',
      });
    });

    iepGoals.forEach(g => {
      if (g.updatedAt || g.start) {
        list.push({
          id: `iep-${g.id}`,
          type: 'plan',
          date: (g.updatedAt || g.start || '').slice(0, 10),
          title: t('timeline.planChange'),
          desc: g.goal || g.domain || '',
        });
      }
    });

    (attachments || []).forEach(a => {
      list.push({
        id: `file-${a.id}`,
        type: 'file',
        date: a.date || '',
        title: t('timeline.file'),
        desc: a.name || a.label || '',
      });
    });

    appointments.forEach(a => {
      list.push({
        id: `appt-${a.id}`,
        type: 'appointment',
        date: a.date || '',
        time: a.time,
        title: a.type || '📅',
        desc: a.notes || '',
      });
    });

    payments.forEach(p => {
      list.push({
        id: `pay-${p.id}`,
        type: 'payment',
        date: p.date || '',
        title: '💳',
        desc: `${p.amount} — ${p.method || ''}`,
      });
    });

    if (notes?.trim()) {
      list.push({
        id: 'note-main',
        type: 'note',
        date: '',
        title: t('timeline.note'),
        desc: notes,
      });
    }

    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [sessions, reports, attendance, iepGoals, attachments, notes, payments, appointments, t]);

  if (events.length === 0) {
    return (
      <div className="wg">
        <div className="wg-h"><h3>🕐 {t('timeline.title')}</h3></div>
        <div className="wg-b" style={{ textAlign: 'center', color: 'var(--g4)', padding: 24 }}>
          {t('timeline.empty')}
        </div>
      </div>
    );
  }

  return (
    <div className="wg">
      <div className="wg-h"><h3>🕐 {t('timeline.title')}</h3><span className="bdg b-gy">{events.length}</span></div>
      <div className="wg-b timeline-wrap">
        {events.map(ev => {
          const meta = TYPE_META[ev.type] || TYPE_META.note;
          return (
            <div key={ev.id} className="timeline-item">
              <div className="timeline-dot" style={{ borderColor: meta.color }}>
                <span>{meta.icon}</span>
              </div>
              <div className="timeline-body">
                <div className="timeline-head">
                  <strong>{ev.title}</strong>
                  {ev.date && <span className="timeline-date">{formatDate(ev.date)}{ev.time ? ` · ${ev.time}` : ''}</span>}
                </div>
                {ev.desc && <div className="timeline-desc">{ev.desc}</div>}
                {ev.extra && <div className="timeline-extra">📎 {ev.extra}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
