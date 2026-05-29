import { useLang } from '../context/LanguageContext';

export default function ProgramsReports() {
  const { t } = useLang();

  return (
    <div>
      <div className="ph">
        <div className="ph-t">
          <h2>📚 {t('progReports.title')}</h2>
          <p>{t('progReports.sub')}</p>
        </div>
      </div>
      <div className="wg">
        <div className="wg-b" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚧</div>
          <h3 style={{ margin: '0 0 8px' }}>{t('progReports.coming')}</h3>
          <p style={{ color: 'var(--g5)', fontSize: '.9rem' }}>
            {t('progReports.sub')}
          </p>
        </div>
      </div>
    </div>
  );
}
