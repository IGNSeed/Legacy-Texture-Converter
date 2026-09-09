import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { atlasOutputDimensions } from '../../core/atlas/composeAtlas';
import { ITEM_RESOLUTION_OPTIONS } from '../../core/validation/resolution';
import type { ConversionOptions, ItemResolution } from '../../types/conversion';
import type { AtlasMappingDocument } from '../../types/mappings';

interface ConversionControlsProps {
  disabled: boolean;
  converting: boolean;
  hasResult: boolean;
  suggestedItemResolution: ItemResolution;
  itemMapping: AtlasMappingDocument;
  onConvert: (options: ConversionOptions) => void | Promise<void>;
}

export function ConversionControls({
  disabled,
  converting,
  hasResult,
  suggestedItemResolution,
  itemMapping,
  onConvert,
}: ConversionControlsProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemResolution, setItemResolution] = useState<ItemResolution>(suggestedItemResolution);
  const selectedIndex = ITEM_RESOLUTION_OPTIONS.indexOf(itemResolution);
  const output = atlasOutputDimensions(itemMapping, itemResolution);

  function openDialog() {
    if (disabled) return;
    setItemResolution(suggestedItemResolution);
    setDialogOpen(true);
  }

  function updateResolution(index: number) {
    const resolution = ITEM_RESOLUTION_OPTIONS[index];
    if (resolution !== undefined) setItemResolution(resolution);
  }

  return (
    <>
      <div className="convert-row">
        <button
          className="primary-button convert-button"
          type="button"
          disabled={disabled}
          onClick={openDialog}
        >
          {converting ? t('convert.working') : hasResult ? t('convert.again') : t('convert.button')}
        </button>
      </div>
      {dialogOpen && (
        <div className="dialog-backdrop" role="presentation">
          <section
            className="version-dialog item-resolution-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="item-resolution-heading"
            aria-describedby="item-resolution-description"
          >
            <h3 id="item-resolution-heading">{t('convert.itemResolutionDialog.heading')}</h3>
            <p id="item-resolution-description">{t('convert.itemResolutionDialog.description')}</p>
            <div className="item-resolution-summary" aria-live="polite">
              <span>{t('convert.itemResolutionDialog.selected')}</span>
              <strong>{itemResolution}x</strong>
              <small>
                {t('convert.itemResolutionDialog.atlasSize', {
                  width: output.width,
                  height: output.height,
                })}
              </small>
            </div>
            <label className="item-resolution-slider" htmlFor="item-resolution-slider">
              <span className="visually-hidden">{t('convert.itemResolutionDialog.slider')}</span>
              <input
                id="item-resolution-slider"
                type="range"
                min={0}
                max={ITEM_RESOLUTION_OPTIONS.length - 1}
                step={1}
                value={selectedIndex}
                aria-valuetext={`${itemResolution}x`}
                onChange={(event) => updateResolution(Number(event.currentTarget.value))}
              />
              <span className="item-resolution-ticks" aria-hidden="true">
                {ITEM_RESOLUTION_OPTIONS.map((resolution) => (
                  <span key={resolution}>{resolution}x</span>
                ))}
              </span>
            </label>
            <div className="dialog-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setDialogOpen(false)}
              >
                {t('convert.itemResolutionDialog.cancel')}
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setDialogOpen(false);
                  void onConvert({ itemResolution });
                }}
              >
                {t('convert.itemResolutionDialog.confirm')}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
