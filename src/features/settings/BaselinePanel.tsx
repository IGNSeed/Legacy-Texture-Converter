import { useTranslation } from 'react-i18next';
import type { BaseAssetGroup, BaseAssetValidation } from '../../core/editions/common/baseAssets';
import type { TargetEdition } from '../../types/conversion';

interface BaselinePanelProps {
  disabled: boolean;
  target: TargetEdition;
  status: BaselineStatus;
  validation?: BaseAssetValidation;
  onRetry: () => Promise<void>;
}

export type BaselineStatus = 'loading' | 'ready' | 'error';

const GROUPS: BaseAssetGroup[] = ['items', 'terrain', 'particles', 'armor', 'specialTextures'];

export function BaselinePanel({
  disabled,
  target,
  status,
  validation,
  onRetry,
}: BaselinePanelProps) {
  const { t } = useTranslation();
  const edition = t(`output.${target}`);

  return (
    <section className="section baseline" aria-labelledby="baseline-heading">
      <div className="baseline-copy">
        <h2 id="baseline-heading">{t('baseline.heading', { edition })}</h2>
        <p>{t('baseline.description', { edition })}</p>
        {status === 'loading' && (
          <strong className="loaded-baseline" role="status">
            {t('baseline.loading')}
          </strong>
        )}
        {status === 'ready' && <strong className="loaded-baseline">{t('baseline.loaded')}</strong>}
        {status === 'error' && (
          <strong className="missing-baseline" role="alert">
            {t('baseline.unavailable')}
          </strong>
        )}
        {validation && (
          <ul className="baseline-validation" aria-label={t('baseline.validation')}>
            {GROUPS.map((group) => (
              <li className={validation.groups[group].ok ? 'is-valid' : 'is-invalid'} key={group}>
                <span>{t(`baseline.groups.${group}`)}</span>
                <strong>
                  {validation.groups[group].ok
                    ? t('baseline.ok')
                    : t('baseline.issueCount', { count: validation.groups[group].issues.length })}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </div>
      {status === 'error' && (
        <div className="button-row baseline-buttons">
          <button
            type="button"
            className="secondary-button"
            disabled={disabled}
            onClick={() => void onRetry()}
          >
            {t('baseline.retry')}
          </button>
        </div>
      )}
    </section>
  );
}
