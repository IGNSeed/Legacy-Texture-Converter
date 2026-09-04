import type {
  ConversionEntry,
  ConversionMessage,
  ConversionReport,
  ParsedPack,
  TargetEdition,
} from '../../types/conversion';

export function createConversionReport(
  pack: ParsedPack,
  outputEdition: TargetEdition = 'wiiu',
): ConversionReport {
  return {
    inputEdition: pack.edition,
    outputEdition,
    inputName: pack.name,
    converted: 0,
    unsupported: 0,
    skipped: 0,
    resized: 0,
    warnings: [],
    errors: [],
    entries: [],
  };
}

export function addReportEntry(report: ConversionReport, entry: ConversionEntry): void {
  report.entries.push(entry);
  if (entry.status === 'resized') {
    report.resized += 1;
    report.converted += 1;
  } else {
    report[entry.status] += 1;
  }
}

export function addWarning(report: ConversionReport, warning: ConversionMessage): void {
  report.warnings.push(warning);
}

export function addError(report: ConversionReport, error: ConversionMessage): void {
  report.errors.push(error);
}
