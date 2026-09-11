import type { ConversionReport, OutputFile, ParsedPack } from '../../types/conversion';
import { addReportEntry } from '../report/createConversionReport';
import { selectPackIcon } from './selectPackIcon';

export function convertPackIcon(
  pack: ParsedPack,
  destination: string,
  report: ConversionReport,
  processed: Set<string>,
): OutputFile[] {
  const selection = selectPackIcon(pack);
  const output: OutputFile[] = [];

  if (selection.selected) {
    processed.add(selection.selected.path);
    output.push({ path: destination, blob: selection.selected.blob });
    addReportEntry(report, {
      sourcePath: selection.selected.path,
      canonicalId: 'gui.raw.pack_icon',
      destination,
      status: 'converted',
      messageKey:
        pack.edition === 'java' ? 'messages.javaPackIconRenamed' : 'messages.packIconCopied',
    });
  }

  for (const rejected of selection.rejected) {
    processed.add(rejected.path);
    addReportEntry(report, {
      sourcePath: rejected.path,
      canonicalId: 'gui.raw.pack_icon',
      destination,
      status: 'skipped',
      messageKey: 'messages.packIconCandidateNotSelected',
    });
  }

  return output;
}
