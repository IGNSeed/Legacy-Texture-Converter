import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConversionControls } from '../../src/features/converter/ConversionControls';
import '../../src/i18n';
import { ps3Mappings } from '../../src/core/mappings/ps3Mappings';
import { itemMappings } from '../../src/core/mappings/wiiuMappings';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function setRangeValue(input: HTMLInputElement, value: number): void {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  if (!descriptor?.set) throw new Error('range value setter is unavailable');
  descriptor.set.call(input, String(value));
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('item resolution conversion controls', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('waits for confirmation, updates the atlas size, and cancels without converting', () => {
    const onConvert = vi.fn();
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    act(() =>
      root.render(
        <ConversionControls
          disabled={false}
          converting={false}
          hasResult={false}
          suggestedItemResolution={64}
          itemMapping={itemMappings}
          onConvert={onConvert}
        />,
      ),
    );

    const convertButton = container.querySelector<HTMLButtonElement>('.convert-button');
    act(() => convertButton?.click());
    expect(onConvert).not.toHaveBeenCalled();
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(container.textContent).toContain('64x');
    expect(container.textContent).toContain('items.png: 1024 × 1088');

    const slider = container.querySelector<HTMLInputElement>('#item-resolution-slider');
    if (!slider) throw new Error('item resolution slider was not rendered');
    act(() => setRangeValue(slider, 1));
    expect(container.textContent).toContain('items.png: 512 × 544');

    const cancel = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Cancel',
    );
    act(() => cancel?.click());
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(onConvert).not.toHaveBeenCalled();

    act(() => convertButton?.click());
    const reopenedSlider = container.querySelector<HTMLInputElement>('#item-resolution-slider');
    if (!reopenedSlider) throw new Error('item resolution slider was not reopened');
    expect(reopenedSlider.value).toBe('2');
    act(() => setRangeValue(reopenedSlider, 4));
    const confirm = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Confirm and convert',
    );
    act(() => confirm?.click());
    expect(onConvert).toHaveBeenCalledOnce();
    expect(onConvert).toHaveBeenCalledWith({ itemResolution: 256 });
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    act(() => root.unmount());
  });

  it('uses the selected target mapping for the live atlas dimensions', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    act(() =>
      root.render(
        <ConversionControls
          disabled={false}
          converting={false}
          hasResult={true}
          suggestedItemResolution={32}
          itemMapping={ps3Mappings('1.8').items}
          onConvert={vi.fn()}
        />,
      ),
    );
    act(() => container.querySelector<HTMLButtonElement>('.convert-button')?.click());

    expect(container.textContent).toContain('Convert again');
    expect(container.textContent).toContain('items.png: 512 × 512');
    act(() => root.unmount());
  });
});
