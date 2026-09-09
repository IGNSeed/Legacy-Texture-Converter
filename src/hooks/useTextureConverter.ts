import { useCallback, useEffect, useMemo, useState } from 'react';
import { analyzePack, type PackSummary } from '../core/analysis/analyzePack';
import type { BaseAssetValidation, ConsoleBaseAssetSet } from '../core/editions/common/baseAssets';
import {
  targetAdapterKey,
  targetEditionAdapter,
  type TargetAdapterKey,
} from '../core/editions/targetEditions';
import { readDroppedItems } from '../core/files/readDroppedItems';
import { readInputFiles, type ReadInputResult } from '../core/files/readInputFiles';
import { UnsafeArchivePathError } from '../core/files/normalizeArchivePath';
import { detectPackEdition } from '../core/parsers/detectPackEdition';
import { parsePack } from '../core/parsers/parsePack';
import type {
  ConversionOptions,
  ConversionProgress,
  ConversionResult,
  ParsedPack,
  Ps3Version,
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

function initialBaselines(): Record<TargetAdapterKey, BaselineState> {
  return {
    wiiu: { status: 'loading' },
    switch: { status: 'loading' },
    'ps3-latest': { status: 'loading' },
    'ps3-1.8': { status: 'loading' },
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
        'ps3-baseline-incomplete',
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
  const [ps3Version, setPs3Version] = useState<Ps3Version>('latest');
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

  const loadTargetBaseline = useCallback(async (target: TargetEdition, version?: Ps3Version) => {
    const key = targetAdapterKey(target, version);
    try {
      const loaded = await targetEditionAdapter(target, version).loadBaseline();
      if (!loaded.assetSet) throw new Error('baseline-invalid');
      setBaselines((current) => ({
        ...current,
        [key]: {
          status: 'ready',
          assetSet: loaded.assetSet,
          validation: loaded.validation,
        },
      }));
    } catch {
      setBaselines((current) => ({
        ...current,
        [key]: { status: 'error' },
      }));
    }
  }, []);

  const selectedKey = targetAdapterKey(targetEdition, ps3Version);
  const selectedBaseline = baselines[selectedKey];
  const selectedAdapter = useMemo(
    () => targetEditionAdapter(targetEdition, ps3Version),
    [ps3Version, targetEdition],
  );

  useEffect(() => {
    if (selectedBaseline.status !== 'loading' || selectedBaseline.assetSet) return;
    const task = window.setTimeout(() => {
      void loadTargetBaseline(targetEdition, ps3Version);
    }, 0);
    return () => window.clearTimeout(task);
  }, [
    loadTargetBaseline,
    ps3Version,
    selectedBaseline.assetSet,
    selectedBaseline.status,
    targetEdition,
  ]);

  const analyze = useCallback(
    async (
      input: RawInput,
      edition: Exclude<SourceEdition, 'unknown'>,
      target: TargetEdition,
      version?: Ps3Version,
    ) => {
      setStatus('analyzing');
      setProgress({ stage: 'analyzing', percent: 8 });
      setError(undefined);
      const parsed = await parsePack(input.name, input.files, edition);
      if (parsed.textures.length === 0) throw new Error('empty-pack');
      const packSummary = await analyzePack(parsed, targetEditionAdapter(target, version).mappings);
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
      await analyze(raw, detectedEdition, targetEdition, ps3Version);
    },
    [analyze, ps3Version, targetEdition],
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
        await analyze(rawInput, edition, targetEdition, ps3Version);
      } catch (reason) {
        setError(errorCode(reason));
        setStatus('error');
      }
    },
    [analyze, ps3Version, rawInput, targetEdition],
  );

  const chooseTargetEdition = useCallback(
    async (target: TargetEdition, version?: Ps3Version) => {
      const selectedVersion = target === 'ps3' ? (version ?? ps3Version) : ps3Version;
      setTargetEdition(target);
      if (target === 'ps3') setPs3Version(selectedVersion);
      setResult(undefined);
      setProgress(undefined);
      setError(undefined);
      if (!pack) return;
      try {
        setStatus('analyzing');
        setProgress({ stage: 'analyzing', percent: 8 });
        setSummary(await analyzePack(pack, targetEditionAdapter(target, selectedVersion).mappings));
        setProgress(undefined);
        setStatus('ready');
      } catch (reason) {
        setError(errorCode(reason));
        setStatus('error');
      }
    },
    [pack, ps3Version],
  );

  const loadBaseline = useCallback(() => {
    setBaselines((current) => ({
      ...current,
      [selectedKey]: { status: 'loading' },
    }));
    return loadTargetBaseline(targetEdition, ps3Version);
  }, [loadTargetBaseline, ps3Version, selectedKey, targetEdition]);

  const convert = useCallback(
    async (options: ConversionOptions) => {
      if (!pack) {
        setError('unknown-edition');
        setStatus('error');
        return;
      }
      const baseline = baselines[selectedKey].assetSet;
      if (!baseline) {
        setError(
          targetEdition === 'switch'
            ? 'switch-baseline-incomplete'
            : targetEdition === 'ps3'
              ? 'ps3-baseline-incomplete'
              : 'baseline-incomplete',
        );
        setStatus('error');
        return;
      }
      try {
        setError(undefined);
        setResult(undefined);
        setStatus('converting');
        const conversion = await selectedAdapter.convert(pack, baseline, options, setProgress);
        setResult(conversion);
        setStatus('success');
      } catch (reason) {
        setError(errorCode(reason));
        setStatus('error');
      }
    },
    [baselines, pack, selectedAdapter, selectedKey, targetEdition],
  );

  return {
    status,
    targetEdition,
    ps3Version,
    rawInput,
    pack,
    summary,
    progress,
    result,
    baseline: selectedBaseline.assetSet,
    baselineStatus: selectedBaseline.status,
    baselineValidation: selectedBaseline.validation,
    itemMapping: selectedAdapter.mappings.items,
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
