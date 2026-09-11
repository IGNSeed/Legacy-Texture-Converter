import type { ConversionReport, OutputFile, ParsedPack } from '../../types/conversion';
import { addReportEntry } from '../report/createConversionReport';
import { selectJavaInventoryTexture } from './selectJavaInventoryTexture';

export function convertJavaInventoryTexture(
  pack: ParsedPack,
  destination: string,
  report: ConversionReport,
  processed: Set<string>,
): OutputFile[] {
  const selection = selectJavaInventoryTexture(pack);
  const output: OutputFile[] = [];

  if (selection.selected) {
    processed.add(selection.selected.sourcePath);
    output.push({ path: destination, blob: selection.selected.blob });
    addReportEntry(report, {
      sourcePath: selection.selected.sourcePath,
      canonicalId: 'gui.raw.inventory',
      destination,
      status: 'converted',
      messageKey: 'messages.guiCopied',
    });
  }

  for (const rejected of selection.rejected) {
    processed.add(rejected.sourcePath);
    addReportEntry(report, {
      sourcePath: rejected.sourcePath,
      canonicalId: 'gui.raw.inventory',
      destination,
      status: 'skipped',
      messageKey: 'messages.guiCandidateNotSelected',
    });
  }

  return output;
}
