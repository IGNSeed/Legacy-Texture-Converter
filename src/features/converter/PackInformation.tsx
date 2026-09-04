import { useTranslation } from 'react-i18next';
import type { PackSummary } from '../../core/analysis/analyzePack';
import type { SourceEdition } from '../../types/conversion';

interface PackInformationProps {
  name: string;
  edition: SourceEdition;
  summary?: PackSummary;
  disabled: boolean;
  onChooseEdition: (edition: 'java' | 'bedrock') => Promise<void>;
}

function resolutions(values: number[] | undefined, fallback: string): string {
  return values && values.length > 0 ? values.map((value) => `${value}px`).join(', ') : fallback;
}

export function PackInformation({
  name,
  edition,
  summary,
  disabled,
  onChooseEdition,
}: PackInformationProps) {
  const { t } = useTranslation();

  return (
    <section className="section" aria-labelledby="pack-heading">
      <h2 id="pack-heading">{t('pack.heading')}</h2>
      <dl className="info-grid">
        <div>
          <dt>{t('pack.name')}</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>{t('pack.edition')}</dt>
          <dd>{edition === 'unknown' ? t('pack.unknown') : t(`pack.${edition}`)}</dd>
        </div>
        <div>
          <dt>{t('pack.textures')}</dt>
          <dd>{summary?.textureCount ?? '—'}</dd>
        </div>
        <div>
          <dt>{t('pack.recognized')}</dt>
          <dd>{summary?.recognizedCount ?? '—'}</dd>
        </div>
        <div>
          <dt>{t('pack.items')}</dt>
          <dd>{resolutions(summary?.itemResolutions, t('pack.none'))}</dd>
        </div>
        <div>
          <dt>{t('pack.blocks')}</dt>
          <dd>{resolutions(summary?.blockResolutions, t('pack.none'))}</dd>
        </div>
      </dl>
      <div className="special-list">
        <span>{t('pack.special')}</span>
        <strong>{summary?.specialTextures.join(', ') || t('pack.none')}</strong>
      </div>
      {edition === 'unknown' && (
        <label className="edition-choice">
          <span>{t('pack.chooseEdition')}</span>
          <select
            defaultValue=""
            disabled={disabled}
            onChange={(event) => {
              if (event.target.value === 'java' || event.target.value === 'bedrock') {
                void onChooseEdition(event.target.value);
              }
            }}
          >
            <option value="" disabled>
              {t('pack.chooseEdition')}
            </option>
            <option value="java">{t('pack.java')}</option>
            <option value="bedrock">{t('pack.bedrock')}</option>
          </select>
        </label>
      )}
    </section>
  );
}
