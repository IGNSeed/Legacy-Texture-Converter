import { useTranslation } from 'react-i18next';
import type {
  WiiUBaseAssetGroup,
  WiiUBaseAssetValidation,
} from '../../core/editions/wiiu/base-assets';

interface BaselinePanelProps {
  disabled: boolean;
  status: BaselineStatus;
  validation?: WiiUBaseAssetValidation;
  onRetry: () => Promise<void>;
}

export type BaselineStatus = 'loading' | 'ready' | 'error';

const GROUPS: WiiUBaseAssetGroup[] = ['items', 'terrain', 'particles', 'armor', 'specialTextures'];

export function BaselinePanel({ disabled, status, validation, onRetry }: BaselinePanelProps) {
  const { t } = useTranslation();

  return (
    <section className="section baseline" aria-labelledby="baseline-heading">
      <div className="baseline-copy">
        <h2 id="baseline-heading">{t('baseline.heading')}</h2>
        <p>{t('baseline.description')}</p>
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
