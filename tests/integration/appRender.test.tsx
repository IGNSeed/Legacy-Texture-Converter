import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/app/App';
import { ReportPanel } from '../../src/features/report/ReportPanel';
import type { ConversionReport } from '../../src/types/conversion';
import '../../src/i18n';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('application shell', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it('renders three outputs and confirms PS3 1.8 through the version dialog', () => {
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
    const uploadInput = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(uploadInput?.accept).toContain('.rar');
    expect(uploadInput?.accept).toContain('.tar.gz');
    expect(uploadInput?.accept).toContain('.tgz');
    expect(container.textContent).toContain('ZIP, MCPACK, RAR, TAR, TAR.GZ, TGZ');
    const outputChoices = container.querySelectorAll<HTMLInputElement>(
      'input[name="output-edition"]',
    );
    expect(outputChoices).toHaveLength(3);
    expect([...outputChoices].map((choice) => choice.value)).toEqual(['wiiu', 'switch', 'ps3']);
    expect([...outputChoices].every((choice) => !choice.disabled)).toBe(true);
    act(() => outputChoices[1].click());
    expect(outputChoices[1].checked).toBe(true);
    expect(outputChoices[0].checked).toBe(false);

    act(() => outputChoices[2].click());
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(container.textContent).toContain('Latest');
    expect(container.textContent).toContain('1.8');
    const versionChoices = container.querySelectorAll<HTMLInputElement>(
      'input[name="ps3-version"]',
    );
    expect(versionChoices).toHaveLength(2);
    act(() => versionChoices[1].click());
    expect(versionChoices[1].checked).toBe(true);
    const confirm = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Use this version'),
    );
    act(() => confirm?.click());
    expect(outputChoices[2].checked).toBe(true);
    expect(container.querySelector('.edition-options label:last-child small')?.textContent).toBe(
      '1.8',
    );

    act(() => root.unmount());
  });

  it('shows the selected PS3 version in the conversion report', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    const report: ConversionReport = {
      inputEdition: 'java',
      outputEdition: 'ps3',
      ps3Version: '1.8',
      inputName: 'pack.zip',
      converted: 1,
      unsupported: 0,
      skipped: 0,
      resized: 0,
      preserved: 0,
      warnings: [],
      errors: [],
      entries: [],
    };

    act(() =>
      root.render(
        <ReportPanel report={report} downloadUrl="blob:test" downloadName="pack_PS3_1.8.zip" />,
      ),
    );

    const terms = [...container.querySelectorAll('dt')].map((element) => element.textContent);
    const values = [...container.querySelectorAll('dd')].map((element) => element.textContent);
    expect(terms).toContain('Version');
    expect(values).toContain('PlayStation 3 Edition');
    expect(values).toContain('1.8');
    act(() => root.unmount());
  });
});
