import type { ConversionReport, OutputFile, ParsedPack } from '../../types/conversion';
import { decodeImage, type DecodedImage } from '../image/decodeImage';
import { addReportEntry, addWarning } from '../report/createConversionReport';
import { LCE_SKY_HEIGHT, LCE_SKY_WIDTH, renderBedrockSky, renderJavaSky } from './renderSkyTexture';
import {
  bedrockCubemapCandidates,
  javaSkyCandidates,
  type BedrockCubemapCandidate,
} from './selectSkySource';

const OUTPUT_RESOLUTION = `${LCE_SKY_WIDTH}x${LCE_SKY_HEIGHT}`;

function addCandidateSkipped(
  report: ConversionReport,
  sourcePath: string,
  destination: string,
  canonicalId: string,
  messageKey: string,
): void {
  addReportEntry(report, {
    sourcePath,
    canonicalId,
    destination,
    status: 'skipped',
    messageKey,
  });
}

async function convertJavaSky(
  pack: ParsedPack,
  destination: string,
  report: ConversionReport,
  processed: Set<string>,
): Promise<OutputFile[]> {
  const candidates = javaSkyCandidates(pack);
  for (const candidate of candidates) processed.add(candidate.texture.sourcePath);

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    let image: DecodedImage;
    try {
      image = await decodeImage(candidate.texture.blob);
    } catch {
      addWarning(report, {
        code: 'sky-invalid-png',
        messageKey: 'warnings.invalidPng',
        path: candidate.texture.sourcePath,
      });
      addCandidateSkipped(
        report,
        candidate.texture.sourcePath,
        destination,
        'sky.java',
        'messages.skyCandidateInvalid',
      );
      continue;
    }

    try {
      const faceWidth = image.width / 3;
      const faceHeight = image.height / 2;
      if (
        image.width % 3 !== 0 ||
        image.height % 2 !== 0 ||
        !Number.isInteger(faceWidth) ||
        !Number.isInteger(faceHeight) ||
        faceWidth !== faceHeight
      ) {
        addWarning(report, {
          code: 'java-sky-dimensions',
          messageKey: 'warnings.javaSkyDimensions',
          path: candidate.texture.sourcePath,
        });
        addCandidateSkipped(
          report,
          candidate.texture.sourcePath,
          destination,
          'sky.java',
          'messages.skyCandidateInvalid',
        );
        continue;
      }

      let blob: Blob;
      try {
        blob = await renderJavaSky(image);
      } catch {
        addWarning(report, {
          code: 'sky-conversion',
          messageKey: 'warnings.skyConversion',
          path: candidate.texture.sourcePath,
        });
        addCandidateSkipped(
          report,
          candidate.texture.sourcePath,
          destination,
          'sky.java',
          'messages.skyCandidateInvalid',
        );
        continue;
      }

      addReportEntry(report, {
        sourcePath: candidate.texture.sourcePath,
        canonicalId: 'sky.java',
        destination,
        status:
          image.width === LCE_SKY_WIDTH && image.height === LCE_SKY_HEIGHT
            ? 'converted'
            : 'resized',
        sourceResolution: `${image.width}x${image.height}`,
        outputResolution: OUTPUT_RESOLUTION,
        messageKey: 'messages.javaSkyResized',
      });
      if (candidates.length > 1) {
        addWarning(report, {
          code: 'multiple-java-sky-candidates',
          messageKey: 'warnings.multipleJavaSkyCandidates',
          path: candidate.texture.sourcePath,
        });
      }
      for (const rejected of candidates.slice(index + 1)) {
        addCandidateSkipped(
          report,
          rejected.texture.sourcePath,
          destination,
          'sky.java',
          'messages.skyCandidateNotSelected',
        );
      }
      return [{ path: destination, blob }];
    } finally {
      image.close();
    }
  }

  return [];
}

function issueMessage(candidate: BedrockCubemapCandidate): {
  code: string;
  messageKey: string;
} {
  if (candidate.issue === 'missing') {
    return { code: 'bedrock-sky-missing-faces', messageKey: 'warnings.bedrockSkyMissingFaces' };
  }
  if (candidate.issue === 'unexpected') {
    return {
      code: 'bedrock-sky-unexpected-faces',
      messageKey: 'warnings.bedrockSkyUnexpectedFaces',
    };
  }
  return { code: 'bedrock-sky-duplicate-faces', messageKey: 'warnings.bedrockSkyDuplicateFaces' };
}

function issuePath(candidate: BedrockCubemapCandidate): string {
  if (candidate.issue === 'missing') {
    const files = candidate.missing.map((index) => `cubemap_${index}.png`).join(', ');
    return `${candidate.displayPath} [${files}]`;
  }
  if (candidate.issue === 'unexpected') {
    const files = candidate.unexpected.map((index) => `cubemap_${index}.png`).join(', ');
    return `${candidate.displayPath} [${files}]`;
  }
  return candidate.displayPath;
}

async function decodeCubemap(
  candidate: BedrockCubemapCandidate,
  report: ConversionReport,
): Promise<DecodedImage[] | undefined> {
  const decoded: DecodedImage[] = [];
  try {
    for (const face of candidate.faces ?? []) {
      try {
        decoded.push(await decodeImage(face.blob));
      } catch {
        addWarning(report, {
          code: 'sky-invalid-png',
          messageKey: 'warnings.invalidPng',
          path: face.sourcePath,
        });
        return undefined;
      }
    }
    return decoded;
  } finally {
    if (decoded.length !== 6) {
      for (const image of decoded) image.close();
    }
  }
}

async function convertBedrockSky(
  pack: ParsedPack,
  destination: string,
  report: ConversionReport,
  processed: Set<string>,
): Promise<OutputFile[]> {
  const candidates = bedrockCubemapCandidates(pack);
  for (const candidate of candidates) {
    for (const texture of candidate.textures) processed.add(texture.sourcePath);
    if (!candidate.issue) continue;
    const warning = issueMessage(candidate);
    addWarning(report, { ...warning, path: issuePath(candidate) });
    addCandidateSkipped(
      report,
      candidate.displayPath,
      destination,
      'sky.bedrock.cubemap',
      'messages.skyCubemapSetSkipped',
    );
  }

  const complete = candidates.filter((candidate) => !candidate.issue && candidate.faces);
  for (let index = 0; index < complete.length; index += 1) {
    const candidate = complete[index];
    const decoded = await decodeCubemap(candidate, report);
    if (!decoded) {
      addCandidateSkipped(
        report,
        candidate.displayPath,
        destination,
        'sky.bedrock.cubemap',
        'messages.skyCandidateInvalid',
      );
      continue;
    }

    try {
      const first = decoded[0];
      const sameSize = decoded.every(
        (image) => image.width === first.width && image.height === first.height,
      );
      const square = decoded.every((image) => image.width === image.height);
      if (!sameSize || !square) {
        addWarning(report, {
          code: 'bedrock-sky-dimensions',
          messageKey: 'warnings.bedrockSkyDimensions',
          path: candidate.displayPath,
        });
        addCandidateSkipped(
          report,
          candidate.displayPath,
          destination,
          'sky.bedrock.cubemap',
          'messages.skyCandidateInvalid',
        );
        continue;
      }

      let blob: Blob;
      try {
        blob = await renderBedrockSky(decoded);
      } catch {
        addWarning(report, {
          code: 'sky-conversion',
          messageKey: 'warnings.skyConversion',
          path: candidate.displayPath,
        });
        addCandidateSkipped(
          report,
          candidate.displayPath,
          destination,
          'sky.bedrock.cubemap',
          'messages.skyCandidateInvalid',
        );
        continue;
      }

      addReportEntry(report, {
        sourcePath: candidate.displayPath,
        canonicalId: 'sky.bedrock.cubemap',
        destination,
        status: 'resized',
        sourceResolution: `${first.width * 3}x${first.height * 2}`,
        outputResolution: OUTPUT_RESOLUTION,
        messageKey: 'messages.bedrockSkyCombined',
      });
      if (complete.length > 1) {
        addWarning(report, {
          code: 'multiple-bedrock-sky-candidates',
          messageKey: 'warnings.multipleBedrockSkyCandidates',
          path: candidate.displayPath,
        });
      }
      for (const rejected of complete.slice(index + 1)) {
        addCandidateSkipped(
          report,
          rejected.displayPath,
          destination,
          'sky.bedrock.cubemap',
          'messages.skyCandidateNotSelected',
        );
      }
      return [{ path: destination, blob }];
    } finally {
      for (const image of decoded) image.close();
    }
  }

  return [];
}

export function convertSkyTexture(
  pack: ParsedPack,
  destination: string,
  report: ConversionReport,
  processed: Set<string>,
): Promise<OutputFile[]> {
  return pack.edition === 'java'
    ? convertJavaSky(pack, destination, report, processed)
    : convertBedrockSky(pack, destination, report, processed);
}
