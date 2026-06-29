import type { ExtractedColor } from "@/types/color";
import { rgbToLab, labToRgb, deltaE } from "./color-converters";

// ── Build palette mapping between source and target ──
export function buildPaletteMapping(
  sourcePalette: ExtractedColor[],
  targetPalette: ExtractedColor[],
): Map<string, ExtractedColor> {
  const mapping = new Map<string, ExtractedColor>();

  for (const tonal of ["highlight", "midtone", "shadow"] as const) {
    const src = sourcePalette
      .filter((c) => c.tonalRange === tonal)
      .sort((a, b) => a.lab.L - b.lab.L);
    const tgt = targetPalette
      .filter((c) => c.tonalRange === tonal)
      .sort((a, b) => a.lab.L - b.lab.L);

    for (let i = 0; i < tgt.length; i++) {
      // Map target colors to the closest source color in same tonal range
      const tgtColor = tgt[i];
      if (src.length > 0) {
        let best = src[0],
          bestD = Infinity;
        for (const s of src) {
          const d = Math.abs(s.lab.L - tgtColor.lab.L);
          if (d < bestD) {
            bestD = d;
            best = s;
          }
        }
        mapping.set(tgtColor.hex, best);
      }
    }
  }

  return mapping;
}

// ── Apply color transfer to pixel data ──
export function applyColorTransfer(
  sourcePalette: ExtractedColor[],
  targetPalette: ExtractedColor[],
  pixelData: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(pixelData.length);
  const mapping = buildPaletteMapping(sourcePalette, targetPalette);

  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];
    const a = pixelData[i + 3];

    if (a < 128) {
      result[i] = r;
      result[i + 1] = g;
      result[i + 2] = b;
      result[i + 3] = a;
      continue;
    }

    // Find closest target palette color
    const pixelLab = rgbToLab(r, g, b);
    let bestTgt = targetPalette[0],
      bestD = Infinity;
    for (const t of targetPalette) {
      const d = deltaE(pixelLab, t.lab);
      if (d < bestD) {
        bestD = d;
        bestTgt = t;
      }
    }

    const sourceColor = mapping.get(bestTgt.hex);
    if (!sourceColor) {
      result[i] = r;
      result[i + 1] = g;
      result[i + 2] = b;
      result[i + 3] = a;
      continue;
    }

    // Delta-preserving remap with dampening
    const dampen = 0.7;
    const newL = Math.max(0, Math.min(100, sourceColor.lab.L + (pixelLab.L - bestTgt.lab.L) * dampen));
    const newA = sourceColor.lab.a + (pixelLab.a - bestTgt.lab.a) * dampen;
    const newB = sourceColor.lab.b + (pixelLab.b - bestTgt.lab.b) * dampen;

    const [nr, ng, nb] = labToRgb({ L: newL, a: newA, b: newB });
    result[i] = nr;
    result[i + 1] = ng;
    result[i + 2] = nb;
    result[i + 3] = a;
  }

  return result;
}
