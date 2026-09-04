import { describe, expect, it } from 'vitest';
import {
  addReportEntry,
  createConversionReport,
} from '../../src/core/report/createConversionReport';

describe('unsupported handling', () => {
  it('records unsupported textures without failing the conversion', () => {
    const report = createConversionReport({
      name: 'pack',
      edition: 'bedrock',
      files: [],
      textures: [],
    });
    addReportEntry(report, {
      sourcePath: 'textures/items/future_item.png',
      canonicalId: 'future_item',
      status: 'unsupported',
    });
    expect(report.unsupported).toBe(1);
    expect(report.errors).toEqual([]);
  });

  it('counts resized textures as converted and resized', () => {
    const report = createConversionReport({
      name: 'pack',
      edition: 'java',
      files: [],
      textures: [],
    });
    addReportEntry(report, { sourcePath: 'stone.png', canonicalId: 'stone', status: 'resized' });
    expect(report.converted).toBe(1);
    expect(report.resized).toBe(1);
  });
});
