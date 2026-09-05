import type { ConversionReport, OutputFile, ParsedPack } from '../../types/conversion';
import { addReportEntry } from '../report/createConversionReport';
import { selectGuiTextures } from './selectGuiTextures';

export interface GuiTexturePaths {
  icons: string;
  widgets: string;
}

export function convertGuiTextures(
  pack: ParsedPack,
  paths: GuiTexturePaths,
  report: ConversionReport,
  processed: Set<string>,
): OutputFile[] {
  const output: OutputFile[] = [];

  for (const selection of selectGuiTextures(pack)) {
    const destination = paths[selection.destination];
    if (selection.selected) {
      processed.add(selection.selected.sourcePath);
      output.push({ path: destination, blob: selection.selected.blob });
      addReportEntry(report, {
        sourcePath: selection.selected.sourcePath,
        canonicalId: `gui.raw.${selection.destination}`,
        destination,
        status: 'converted',
        messageKey:
          selection.destination === 'widgets' && selection.selected.canonicalId === 'gui'
            ? 'messages.guiRenamedToWidgets'
            : 'messages.guiCopied',
      });
    }

    for (const rejected of selection.rejected) {
      processed.add(rejected.sourcePath);
      addReportEntry(report, {
        sourcePath: rejected.sourcePath,
        canonicalId: `gui.raw.${selection.destination}`,
        destination,
        status: 'skipped',
        messageKey: 'messages.guiCandidateNotSelected',
      });
    }
  }

  return output;
}
