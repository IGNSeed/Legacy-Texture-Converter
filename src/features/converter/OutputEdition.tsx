import { useTranslation } from 'react-i18next';
import type { TargetEdition } from '../../types/conversion';

interface OutputEditionProps {
  value: TargetEdition;
  disabled: boolean;
  onChange: (edition: TargetEdition) => Promise<void>;
}

export function OutputEdition({ value, disabled, onChange }: OutputEditionProps) {
  const { t } = useTranslation();
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
      </div>
    </section>
  );
}
