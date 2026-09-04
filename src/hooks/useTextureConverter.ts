import { useCallback, useEffect, useMemo, useState } from 'react';
import { analyzePack, type PackSummary } from '../core/analysis/analyzePack';
import {
  UserProvidedWiiUBaseAssetProvider,
  type WiiUBaseAssetSet,
  type WiiUBaseAssetValidation,
} from '../core/editions/wiiu/base-assets';
import { wiiuAdapter } from '../core/editions/wiiu/wiiuAdapter';
import { readDroppedItems } from '../core/files/readDroppedItems';
import { readInputFiles, type ReadInputResult } from '../core/files/readInputFiles';
import { UnsafeArchivePathError } from '../core/files/normalizeArchivePath';
import { detectPackEdition } from '../core/parsers/detectPackEdition';
import { parsePack } from '../core/parsers/parsePack';
import type {
  ConversionProgress,
  ConversionResult,
  ParsedPack,
  SourceEdition,
} from '../types/conversion';

export type AppStatus =
  'idle' | 'reading' | 'analyzing' | 'ready' | 'converting' | 'success' | 'error';

interface RawInput extends ReadInputResult {
  detectedEdition: SourceEdition;
}

function errorCode(error: unknown): string {
  if (error instanceof UnsafeArchivePathError) return 'unsafe-path';
  if (error instanceof Error) {
    if (error.message.startsWith('canvas-limit')) return 'canvas-limit';
    if (
      [
        'empty-input',
        'empty-pack',
        'unknown-edition',
        'baseline-incomplete',
        'baseline-invalid',
      ].includes(error.message)
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
  const [baseline, setBaseline] = useState<WiiUBaseAssetSet>();
  const [baselineValidation, setBaselineValidation] = useState<WiiUBaseAssetValidation>();
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
        const provider = new UserProvidedWiiUBaseAssetProvider(files);
        const loaded = await provider.load();
        setBaselineValidation(loaded.validation);
        if (!loaded.assetSet) {
          throw new Error(
            loaded.validation.invalid.length > 0 ? 'baseline-invalid' : 'baseline-incomplete',
          );
        }
        setBaseline(loaded.assetSet);
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
      const conversion = await wiiuAdapter.convert(pack, baseline, setProgress);
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
    baselineValidation,
    downloadUrl,
    error,
    loadFiles,
    loadDrop,
    chooseEdition,
    loadBaseline,
    convert,
  };
}
