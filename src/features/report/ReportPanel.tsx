import { useTranslation } from 'react-i18next';
import type { ConversionReport } from '../../types/conversion';

interface ReportPanelProps {
  report: ConversionReport;
  downloadUrl: string;
  downloadName: string;
}

export function ReportPanel({ report, downloadUrl, downloadName }: ReportPanelProps) {
  const { t } = useTranslation();
  const outputEdition = t(`output.${report.outputEdition}`);
  const metrics = [
    ['converted', report.converted],
    ['unsupported', report.unsupported],
    ['skipped', report.skipped],
    ['resized', report.resized],
    ['preserved', report.preserved],
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
            <p>
              {report.outputEdition === 'switch'
                ? t('report.switchReady')
                : t('report.success', { edition: outputEdition })}
            </p>
          </div>
        </div>
        <a className="primary-button" href={downloadUrl} download={downloadName}>
          {t('report.download', { edition: outputEdition })}
        </a>
      </div>
      <dl className="info-grid report-info">
        <div>
          <dt>{t('report.inputName')}</dt>
          <dd>{report.inputName}</dd>
        </div>
        <div>
          <dt>{t('report.inputEdition')}</dt>
          <dd>{t(`pack.${report.inputEdition}`)}</dd>
        </div>
        <div>
          <dt>{t('report.outputEdition')}</dt>
          <dd>{outputEdition}</dd>
        </div>
        <div>
          <dt>{t('report.itemResolution')}</dt>
          <dd>{report.itemResolution ? `${report.itemResolution}px` : t('pack.none')}</dd>
        </div>
        <div>
          <dt>{t('report.blockResolution')}</dt>
          <dd>{report.blockResolution ? `${report.blockResolution}px` : t('pack.none')}</dd>
        </div>
      </dl>
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
                    {entry.messageKey && <small>{t(entry.messageKey)}</small>}
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
