import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Ps3Version, TargetEdition } from '../../types/conversion';

interface OutputEditionProps {
  value: TargetEdition;
  ps3Version: Ps3Version;
  disabled: boolean;
  onChange: (edition: TargetEdition, version?: Ps3Version) => Promise<void>;
}

export function OutputEdition({ value, ps3Version, disabled, onChange }: OutputEditionProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<Ps3Version>(ps3Version);

  function openPs3Dialog() {
    if (disabled) return;
    setPendingVersion(ps3Version);
    setDialogOpen(true);
  }

  return (
    <section className="section compact-section" aria-labelledby="output-heading">
      <h2 id="output-heading">{t('output.heading')}</h2>
      <div className="edition-options">
        <label>
          <input
            type="radio"
            name="output-edition"
            value="wiiu"
            checked={value === 'wiiu'}
            disabled={disabled}
            onChange={() => void onChange('wiiu')}
          />{' '}
          <span>{t('output.wiiu')}</span>
        </label>
        <label>
          <input
            type="radio"
            name="output-edition"
            value="switch"
            checked={value === 'switch'}
            disabled={disabled}
            onChange={() => void onChange('switch')}
          />{' '}
          <span>{t('output.switch')}</span>
        </label>
        <label>
          <input
            type="radio"
            name="output-edition"
            value="ps3"
            checked={value === 'ps3'}
            disabled={disabled}
            onChange={openPs3Dialog}
            onClick={openPs3Dialog}
          />{' '}
          <span>{t('output.ps3')}</span>
          {value === 'ps3' && <small>{t(`output.ps3Versions.${ps3Version}`)}</small>}
        </label>
      </div>
      {dialogOpen && (
        <div className="dialog-backdrop" role="presentation">
          <section
            className="version-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ps3-version-heading"
          >
            <h3 id="ps3-version-heading">{t('output.ps3Dialog.heading')}</h3>
            <p>{t('output.ps3Dialog.description')}</p>
            <div className="version-options">
              {(['latest', '1.8'] as const).map((version) => (
                <label key={version}>
                  <input
                    type="radio"
                    name="ps3-version"
                    checked={pendingVersion === version}
                    onChange={() => setPendingVersion(version)}
                  />
                  <span>
                    <strong>{t(`output.ps3Versions.${version}`)}</strong>
                    <small>
                      {t(`output.ps3Dialog.${version === 'latest' ? 'latestHelp' : 'oldHelp'}`)}
                    </small>
                  </span>
                </label>
              ))}
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setDialogOpen(false)}
              >
                {t('output.ps3Dialog.cancel')}
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setDialogOpen(false);
                  void onChange('ps3', pendingVersion);
                }}
              >
                {t('output.ps3Dialog.confirm')}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
