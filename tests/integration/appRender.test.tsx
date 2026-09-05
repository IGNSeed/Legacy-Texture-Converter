import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/app/App';
import '../../src/i18n';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('application shell', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it('renders the converter UI without a baseline panel and selects Switch as output', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    );

    act(() => root.render(<App />));

    expect(container.textContent).toContain('Legacy Texture Converter');
    expect(container.textContent).not.toContain('1.0.17');
    expect(container.querySelector('[aria-labelledby="baseline-heading"]')).toBeNull();
    expect(container.querySelector('button.convert-button')).not.toBeNull();
    const outputChoices = container.querySelectorAll<HTMLInputElement>(
      'input[name="output-edition"]',
    );
    expect(outputChoices).toHaveLength(2);
    expect([...outputChoices].map((choice) => choice.value)).toEqual(['wiiu', 'switch']);
    expect([...outputChoices].every((choice) => !choice.disabled)).toBe(true);
    act(() => outputChoices[1].click());
    expect(outputChoices[1].checked).toBe(true);
    expect(outputChoices[0].checked).toBe(false);

    act(() => root.unmount());
  });
});
