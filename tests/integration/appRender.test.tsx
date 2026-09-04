import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';
import '../../src/i18n';

describe('application shell', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders the converter UI instead of an empty root', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(<App />));

    expect(container.textContent).toContain('Legacy Texture Converter');
    expect(container.querySelector('[aria-labelledby="baseline-heading"]')).not.toBeNull();
    expect(container.querySelector('button.convert-button')).not.toBeNull();

    act(() => root.unmount());
  });
});
