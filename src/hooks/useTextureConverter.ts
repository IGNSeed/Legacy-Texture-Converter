import { useCallback, useEffect, useMemo, useState } from 'react';
import { analyzePack, type PackSummary } from '../core/analysis/analyzePack';
import { wiiuAdapter } from '../core/editions/wiiu/wiiuAdapter';
import { resolveDefaultAssets } from '../core/editions/wiiu/resolveDefaultAssets';
import { readDroppedItems } from '../core/files/readDroppedItems';
import { readInputFiles, type ReadInputResult } from '../core/files/readInputFiles';
import { readWiiUBaseline } from '../core/files/readWiiUBaseline';
import { UnsafeArchivePathError } from '../core/files/normalizeArchivePath';
import { detectPackEdition } from '../core/parsers/detectPackEdition';
import { parsePack } from '../core/parsers/parsePack';
import type {
  ConversionProgress,
  ConversionResult,
  OutputFile,
  ParsedPack,
  SourceEdition,
} from '../types/conversion';

export type AppStatus =
  'idle' | 'reading' | 'analyzing' | 'ready' | 'converting' | 'success' | 'error';

interface RawInput extends ReadInputResult {
  detectedEdition: SourceEdition;
}

export interface BaselineState {
  name: string;
  files: OutputFile[];
}

function errorCode(error: unknown): string {
  if (error instanceof UnsafeArchivePathError) return 'unsafe-path';
  if (error instanceof Error) {
    if (error.message.startsWith('canvas-limit')) return 'canvas-limit';
    if (
      ['empty-input', 'empty-pack', 'unknown-edition', 'baseline-incomplete'].includes(
        error.message,
      )
    )
      return error.message;
  }
  return 'generic';
}

export function useTextureConverter() {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [rawInput, setRawInput] = useState<RawInput>();
  const [pack, setPack] = useState<ParsedPack>();
  const [summary, setSummary] = useState<PackSummary>();
  const [progress, setProgress] = useState<ConversionProgress>();
  const [result, setResult] = useState<ConversionResult>();
  const [baseline, setBaseline] = useState<BaselineState>();
  const [baselineMissing, setBaselineMissing] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  const downloadUrl = useMemo(
    () => (result ? URL.createObjectURL(result.zipBlob) : undefined),
    [result],
  );

  useEffect(() => {
    if (downloadUrl) return () => URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  const analyze = useCallback(
    async (input: RawInput, edition: Exclude<SourceEdition, 'unknown'>) => {
      setStatus('analyzing');
      setProgress({ stage: 'analyzing', percent: 8 });
      setError(undefined);
      const parsed = await parsePack(input.name, input.files, edition);
      if (parsed.textures.length === 0) throw new Error('empty-pack');
      const packSummary = await analyzePack(parsed);
      setPack(parsed);
      setSummary(packSummary);
      setStatus('ready');
    },
    [],
  );

  const acceptInput = useCallback(
    async (input: ReadInputResult) => {
      setResult(undefined);
      setProgress(undefined);
      setSummary(undefined);
      setPack(undefined);
      setStatus('reading');
      setProgress({ stage: 'reading', percent: 2 });
      setError(undefined);
      const detectedEdition = detectPackEdition(input.files);
      const raw = { ...input, detectedEdition };
      setRawInput(raw);
      if (detectedEdition === 'unknown') {
        setStatus('ready');
        return;
      }
      await analyze(raw, detectedEdition);
    },
    [analyze],
  );

  const loadFiles = useCallback(
    async (files: readonly File[]) => {
      try {
        await acceptInput(await readInputFiles(files));
      } catch (reason) {
        setError(errorCode(reason));
        setStatus('error');
      }
    },
    [acceptInput],
  );

  const loadDrop = useCallback(
    async (dataTransfer: DataTransfer) => {
      try {
        await acceptInput(await readDroppedItems(dataTransfer));
      } catch (reason) {
        setError(errorCode(reason));
        setStatus('error');
      }
    },
    [acceptInput],
  );

  const chooseEdition = useCallback(
    async (edition: Exclude<SourceEdition, 'unknown'>) => {
      if (!rawInput) return;
      try {
        setRawInput({ ...rawInput, detectedEdition: edition });
        await analyze(rawInput, edition);
      } catch (reason) {
        setError(errorCode(reason));
        setStatus('error');
      }
    },
    [analyze, rawInput],
  );

  const loadBaseline = useCallback(
    async (files: readonly File[]) => {
      try {
        setStatus('reading');
        setProgress({ stage: 'reading', percent: 2 });
        setError(undefined);
        setResult(undefined);
        const input = await readWiiUBaseline(files);
        const resolved = resolveDefaultAssets(input.files);
        setBaselineMissing(resolved.missing);
        if (resolved.missing.length > 0) throw new Error('baseline-incomplete');
        setBaseline({ name: input.name, files: resolved.files });
        setStatus(pack ? 'ready' : 'idle');
      } catch (reason) {
        setBaseline(undefined);
        setError(errorCode(reason));
        setStatus('error');
      }
    },
    [pack],
  );

  const convert = useCallback(async () => {
    if (!pack) {
      setError('unknown-edition');
      setStatus('error');
      return;
    }
    if (!baseline) {
      setError('baseline-incomplete');
      setStatus('error');
      return;
    }
    try {
      setError(undefined);
      setResult(undefined);
      setStatus('converting');
      const conversion = await wiiuAdapter.convert(pack, baseline.files, setProgress);
      setResult(conversion);
      setStatus('success');
    } catch (reason) {
      setError(errorCode(reason));
      setStatus('error');
    }
  }, [baseline, pack]);

  return {
    status,
    rawInput,
    pack,
    summary,
    progress,
    result,
    baseline,
    baselineMissing,
    downloadUrl,
    error,
    loadFiles,
    loadDrop,
    chooseEdition,
    loadBaseline,
    convert,
  };
}
