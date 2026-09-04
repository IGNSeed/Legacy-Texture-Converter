import { useTranslation } from 'react-i18next';

export function OutputEdition() {
  const { t } = useTranslation();
  return (
    <section className="section compact-section" aria-labelledby="output-heading">
      <h2 id="output-heading">{t('output.heading')}</h2>
      <div className="edition-options">
        <label>
          <input type="radio" checked readOnly /> <span>{t('output.wiiu')}</span>
        </label>
        <label className="disabled-option">
          <input type="radio" disabled />{' '}
          <span>
            {t('output.switch')} · {t('output.later')}
          </span>
        </label>
      </div>
    </section>
  );
}
