import { useTranslation } from 'react-i18next';
import type { ConversionProgress as Progress } from '../../types/conversion';

export function ConversionProgress({ progress }: { progress: Progress }) {
  const { t } = useTranslation();
  return (
    <section className="section" aria-labelledby="progress-heading" aria-live="polite">
      <div className="progress-heading">
        <h2 id="progress-heading">{t('progress.heading')}</h2>
        <span>{progress.percent}%</span>
      </div>
      <progress max="100" value={progress.percent}>
        {progress.percent}%
      </progress>
      <p>{t(`progress.${progress.stage}`)}</p>
    </section>
  );
}
