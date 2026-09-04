import { useTranslation } from 'react-i18next';
import type { ConversionReport } from '../../types/conversion';

interface ReportPanelProps {
  report: ConversionReport;
  downloadUrl: string;
  downloadName: string;
}

export function ReportPanel({ report, downloadUrl, downloadName }: ReportPanelProps) {
  const { t } = useTranslation();
  const metrics = [
    ['converted', report.converted],
    ['unsupported', report.unsupported],
    ['skipped', report.skipped],
    ['resized', report.resized],
    ['warnings', report.warnings.length],
    ['errors', report.errors.length],
  ] as const;

  return (
    <section className="section report" aria-labelledby="report-heading">
      <div className="result-heading">
        <div>
          <span className="status-dot" aria-hidden="true" />
          <div>
            <h2 id="report-heading">{t('report.heading')}</h2>
            <p>{t('report.success')}</p>
          </div>
        </div>
        <a className="primary-button" href={downloadUrl} download={downloadName}>
          {t('report.download')}
        </a>
      </div>
      <div className="metrics">
        {metrics.map(([key, value]) => (
          <div key={key}>
            <strong>{value}</strong>
            <span>{t(`report.${key}`)}</span>
          </div>
        ))}
      </div>
      {report.warnings.length > 0 && (
        <details>
          <summary>
            {t('report.warnings')} ({report.warnings.length})
          </summary>
          <ul>
            {report.warnings.map((warning, index) => (
              <li key={`${warning.code}-${index}`}>
                {t(warning.messageKey)}
                {warning.path ? ` — ${warning.path}` : ''}
              </li>
            ))}
          </ul>
        </details>
      )}
      <details>
        <summary>
          {t('report.details')} ({report.entries.length})
        </summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t('report.source')}</th>
                <th>{t('report.destination')}</th>
                <th>{t('report.status')}</th>
              </tr>
            </thead>
            <tbody>
              {report.entries.map((entry, index) => (
                <tr key={`${entry.sourcePath}-${index}`}>
                  <td>{entry.sourcePath}</td>
                  <td>{entry.destination ?? '—'}</td>
                  <td>
                    <span className={`entry-status ${entry.status}`}>
                      {t(`status.${entry.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
