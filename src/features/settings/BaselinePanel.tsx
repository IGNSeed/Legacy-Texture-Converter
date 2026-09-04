import { useRef, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  WiiUBaseAssetGroup,
  WiiUBaseAssetValidation,
} from '../../core/editions/wiiu/base-assets';

interface BaselinePanelProps {
  disabled: boolean;
  loadedName?: string;
  validation?: WiiUBaseAssetValidation;
  onFiles: (files: File[]) => Promise<void>;
}

const GROUPS: WiiUBaseAssetGroup[] = ['items', 'terrain', 'particles', 'armor', 'specialTextures'];

export function BaselinePanel({ disabled, loadedName, validation, onFiles }: BaselinePanelProps) {
  const { t } = useTranslation();
  const archiveInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  const changed = (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = '';
    if (files.length > 0) void onFiles(files);
  };

  return (
    <section className="section baseline" aria-labelledby="baseline-heading">
      <div className="baseline-copy">
        <h2 id="baseline-heading">{t('baseline.heading')}</h2>
        <p>{t('baseline.description')}</p>
        {loadedName && (
          <strong className="loaded-baseline">{t('baseline.loaded', { name: loadedName })}</strong>
        )}
        {!loadedName && validation && !validation.valid && (
          <strong className="missing-baseline">
            {t('baseline.problems', {
              missing: validation.missing.length,
              invalid: validation.invalid.length,
            })}
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
      <div className="button-row baseline-buttons">
        <button
          type="button"
          className="secondary-button"
          disabled={disabled}
          onClick={() => archiveInput.current?.click()}
        >
          {t('baseline.archives')}
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={disabled}
          onClick={() => folderInput.current?.click()}
        >
          {t('baseline.folder')}
        </button>
      </div>
      <input
        ref={archiveInput}
        className="visually-hidden"
        type="file"
        accept=".zip,application/zip"
        multiple
        onChange={changed}
      />
      <input
        ref={folderInput}
        className="visually-hidden"
        type="file"
        multiple
        {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
        onChange={changed}
      />
    </section>
  );
}
