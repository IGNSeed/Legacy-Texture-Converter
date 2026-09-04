interface AnimationFrame {
  index: number;
  time: number;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function positiveInteger(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback;
}

function javaFrames(animation: Record<string, unknown>, frameCount: number): AnimationFrame[] {
  const defaultTime = positiveInteger(animation.frametime, 1);
  if (!Array.isArray(animation.frames)) {
    return Array.from({ length: frameCount }, (_, index) => ({ index, time: defaultTime }));
  }

  return animation.frames.flatMap((frame): AnimationFrame[] => {
    if (typeof frame === 'number' && Number.isInteger(frame) && frame >= 0) {
      return [{ index: frame, time: defaultTime }];
    }
    const record = asRecord(frame);
    if (!record || typeof record.index !== 'number') return [];
    return [
      {
        index: Math.max(0, Math.floor(record.index)),
        time: positiveInteger(record.time, defaultTime),
      },
    ];
  });
}

export function createLceAnimationText(metadata: string, frameCount: number): string | undefined {
  try {
    const root = asRecord(JSON.parse(metadata));
    if (!root) return undefined;
    const animation = asRecord(root.animation);
    const frames = animation
      ? javaFrames(animation, frameCount)
      : Array.from({ length: frameCount }, (_, index) => ({
          index,
          time: positiveInteger(root.ticks_per_frame, 1),
        }));
    if (frames.length === 0) return undefined;
    return `${frames.map((frame) => `${frame.index}*${frame.time}`).join('\n')}\n`;
  } catch {
    return undefined;
  }
}
