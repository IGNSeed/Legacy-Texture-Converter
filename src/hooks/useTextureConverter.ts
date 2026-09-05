import { useCallback, useEffect, useMemo, useState } from 'react';
import { analyzePack, type PackSummary } from '../core/analysis/analyzePack';
import type { BaseAssetValidation, ConsoleBaseAssetSet } from '../core/editions/common/baseAssets';
import { targetEditionAdapter } from '../core/editions/targetEditions';
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
  TargetEdition,
} from '../types/conversion';

export type BaselineStatus = 'loading' | 'ready' | 'error';

export type AppStatus =
  'idle' | 'reading' | 'analyzing' | 'ready' | 'converting' | 'success' | 'error';

interface RawInput extends ReadInputResult {
  detectedEdition: SourceEdition;
}

interface BaselineState {
  status: BaselineStatus;
  assetSet?: ConsoleBaseAssetSet;
  validation?: BaseAssetValidation;
}

function initialBaselines(): Record<TargetEdition, BaselineState> {
  return {
    wiiu: { status: 'loading' },
    switch: { status: 'loading' },
  };
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
        'switch-baseline-incomplete',
      ].includes(error.message)
    ) {
      return error.message;
    }
  }
  return 'generic';
}

export function useTextureConverter() {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [targetEdition, setTargetEdition] = useState<TargetEdition>('wiiu');
  const [rawInput, setRawInput] = useState<RawInput>();
  const [pack, setPack] = useState<ParsedPack>();
  const [summary, setSummary] = useState<PackSummary>();
  const [progress, setProgress] = useState<ConversionProgress>();
  const [result, setResult] = useState<ConversionResult>();
  const [baselines, setBaselines] = useState(initialBaselines);
  const [error, setError] = useState<string>();

  const downloadUrl = useMemo(
    () => (result ? URL.createObjectURL(result.zipBlob) : undefined),
    [result],
  );

  useEffect(() => {
    if (downloadUrl) return () => URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  const loadTargetBaseline = useCallback(async (target: TargetEdition) => {
    try {
      const loaded = await targetEditionAdapter(target).loadBaseline();
      if (!loaded.assetSet) throw new Error('baseline-invalid');
      setBaselines((current) => ({
        ...current,
        [target]: {
          status: 'ready',
          assetSet: loaded.assetSet,
          validation: loaded.validation,
        },
      }));
    } catch {
      setBaselines((current) => ({
        ...current,
        [target]: { status: 'error' },
      }));
    }
  }, []);

  const selectedBaseline = baselines[targetEdition];

  useEffect(() => {
    if (selectedBaseline.status !== 'loading' || selectedBaseline.assetSet) return;
    const task = window.setTimeout(() => {
      void loadTargetBaseline(targetEdition);
    }, 0);
    return () => window.clearTimeout(task);
  }, [loadTargetBaseline, selectedBaseline.assetSet, selectedBaseline.status, targetEdition]);

  const analyze = useCallback(
    async (input: RawInput, edition: Exclude<SourceEdition, 'unknown'>, target: TargetEdition) => {
      setStatus('analyzing');
      setProgress({ stage: 'analyzing', percent: 8 });
      setError(undefined);
      const parsed = await parsePack(input.name, input.files, edition);
      if (parsed.textures.length === 0) throw new Error('empty-pack');
      const packSummary = await analyzePack(parsed, targetEditionAdapter(target).mappings);
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
      await analyze(raw, detectedEdition, targetEdition);
    },
    [analyze, targetEdition],
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
        await analyze(rawInput, edition, targetEdition);
      } catch (reason) {
        setError(errorCode(reason));
        setStatus('error');
      }
    },
    [analyze, rawInput, targetEdition],
  );

  const chooseTargetEdition = useCallback(
    async (target: TargetEdition) => {
      setTargetEdition(target);
      setResult(undefined);
      setProgress(undefined);
      setError(undefined);
      if (!pack) return;
      try {
        setStatus('analyzing');
        setProgress({ stage: 'analyzing', percent: 8 });
        setSummary(await analyzePack(pack, targetEditionAdapter(target).mappings));
        setProgress(undefined);
        setStatus('ready');
      } catch (reason) {
        setError(errorCode(reason));
        setStatus('error');
      }
    },
    [pack],
  );

  const loadBaseline = useCallback(() => {
    setBaselines((current) => ({
      ...current,
      [targetEdition]: { status: 'loading' },
    }));
    return loadTargetBaseline(targetEdition);
  }, [loadTargetBaseline, targetEdition]);

  const convert = useCallback(async () => {
    if (!pack) {
      setError('unknown-edition');
      setStatus('error');
      return;
    }
    const baseline = baselines[targetEdition].assetSet;
    if (!baseline) {
      setError(targetEdition === 'switch' ? 'switch-baseline-incomplete' : 'baseline-incomplete');
      setStatus('error');
      return;
    }
    try {
      setError(undefined);
      setResult(undefined);
      setStatus('converting');
      const conversion = await targetEditionAdapter(targetEdition).convert(
        pack,
        baseline,
        setProgress,
      );
      setResult(conversion);
      setStatus('success');
    } catch (reason) {
      setError(errorCode(reason));
      setStatus('error');
    }
  }, [baselines, pack, targetEdition]);

  return {
    status,
    targetEdition,
    rawInput,
    pack,
    summary,
    progress,
    result,
    baseline: selectedBaseline.assetSet,
    baselineStatus: selectedBaseline.status,
    baselineValidation: selectedBaseline.validation,
    downloadUrl,
    error,
    loadFiles,
    loadDrop,
    chooseEdition,
    chooseTargetEdition,
    loadBaseline,
    convert,
  };
}
