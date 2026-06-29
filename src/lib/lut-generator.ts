import type { ExtractedColor } from "@/types/color";
import { rgbToHsl, rgbToLab, labToRgb, deltaE } from "./color-converters";
import { buildPairs, adaptiveDampen, BLEND_SIGMA } from "./color-transfer";

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }

// Download LUT: pushes all colors toward the nearest palette anchor.
// Pure grading — no source/target pairing needed.
export function generatePaletteCubeLut(palette: ExtractedColor[], _targetPalette?: unknown, size: number = 65): string {
  if (palette.length === 0) {
    const lines = [`TITLE "Identity"`, `LUT_3D_SIZE ${size}`, ""];
    for (let ri = 0; ri < size; ri++)
      for (let gi = 0; gi < size; gi++)
        for (let bi = 0; bi < size; bi++)
          lines.push(`${(ri/(size-1)).toFixed(6)} ${(gi/(size-1)).toFixed(6)} ${(bi/(size-1)).toFixed(6)}`);
    return lines.join("\n");
  }

  const anchors = palette.map(c => ({
    lab: c.lab,
    rgb: c.hex.match(/^#(..)(..)(..)$/)!.slice(1).map(x => parseInt(x, 16)) as [number, number, number],
  }));

  const SIGMA = 25;
  const lines: string[] = [
    `# Palette Grade LUT — ${palette.length} anchors`,
    `# Gaussian pull toward nearest palette color`,
    `# Strength 0.65 max, sat-adaptive, neutral-safe`,
    "",
    `TITLE "Palette Grade (${palette.length} colors)"`,
    "",
    `LUT_3D_SIZE ${size}`,
    "",
  ];

  for (let ri = 0; ri < size; ri++) {
    for (let gi = 0; gi < size; gi++) {
      for (let bi = 0; bi < size; bi++) {
        const ir = Math.round((ri / (size - 1)) * 255);
        const ig = Math.round((gi / (size - 1)) * 255);
        const ib = Math.round((bi / (size - 1)) * 255);

        const hsl = rgbToHsl(ir, ig, ib);
        const pixLab = rgbToLab(ir, ig, ib);

        if (hsl.l < 2 || hsl.l > 98) {
          lines.push(`${(ir/255).toFixed(6)} ${(ig/255).toFixed(6)} ${(ib/255).toFixed(6)}`);
          continue;
        }

        // Weight ALL anchors by LAB distance
        const rawW = anchors.map(a => Math.exp(-Math.pow(deltaE(pixLab, a.lab), 2) / (2 * SIGMA * SIGMA)));
        const totalW = rawW.reduce((a, b) => a + b, 0);

        let tr = 0, tg = 0, tb = 0;
        for (let k = 0; k < anchors.length; k++) {
          const w = rawW[k] / totalW;
          tr += (anchors[k].rgb[0] / 255) * w;
          tg += (anchors[k].rgb[1] / 255) * w;
          tb += (anchors[k].rgb[2] / 255) * w;
        }

        // Guarantee visible effect: min strength 0.35 even for neutral pixels
        const satBoost = clamp01(hsl.s / 25);
        const strength = satBoost * 0.65 + (1 - satBoost) * 0.35;

        const finalR = clamp01((ir / 255) + (tr - ir / 255) * strength);
        const finalG = clamp01((ig / 255) + (tg - ig / 255) * strength);
        const finalB = clamp01((ib / 255) + (tb - ib / 255) * strength);

        lines.push(`${finalR.toFixed(6)} ${finalG.toFixed(6)} ${finalB.toFixed(6)}`);
      }
    }
  }

  lines.push("");
  return lines.join("\n");
}

// Swap LUT: Hungarian-paired Gaussian-blend delta-preserving grade — matches
// the color-transfer pipeline so the .cube file produces the same visual result
// as the in-browser swap.
export function generateSwapCubeLut(
  sourcePalette: ExtractedColor[],
  targetPalette: ExtractedColor[],
  size: number = 65,
): string {
  const pairs = buildPairs(sourcePalette, targetPalette);
  const inv2sig2 = 1 / (2 * BLEND_SIGMA * BLEND_SIGMA);

  const lines: string[] = [
    `# Swap LUT — ${pairs.length} zone-matched pairs`,
    `# Hungarian + Gaussian blend + adaptive dampen`,
    "",
    `TITLE "Swap LUT (${sourcePalette.length}s → ${targetPalette.length}t)"`,
    "",
    `LUT_3D_SIZE ${size}`,
    "",
  ];

  for (let ri = 0; ri < size; ri++) {
    for (let gi = 0; gi < size; gi++) {
      for (let bi = 0; bi < size; bi++) {
        const ir = Math.round((ri / (size - 1)) * 255);
        const ig = Math.round((gi / (size - 1)) * 255);
        const ib = Math.round((bi / (size - 1)) * 255);

        const pixLab = rgbToLab(ir, ig, ib);

        // Gaussian weights by LAB distance to each target anchor (matches swap)
        const weights = new Float64Array(pairs.length);
        let totalW = 0;
        for (let j = 0; j < pairs.length; j++) {
          const d = deltaE(pixLab, pairs[j].tLab);
          const w = Math.exp(-(d * d) * inv2sig2);
          weights[j] = w;
          totalW += w;
        }

        if (totalW < 1e-9) {
          lines.push(
            `${(ir / 255).toFixed(6)} ${(ig / 255).toFixed(6)} ${(ib / 255).toFixed(6)}`,
          );
          continue;
        }

        // Weighted blend of delta-preserving remapped LAB (matches swap)
        let newL = 0, newA = 0, newB = 0;
        for (let j = 0; j < pairs.length; j++) {
          const w = weights[j] / totalW;
          const { sLab, tLab } = pairs[j];
          const dampen = adaptiveDampen(deltaE(pixLab, tLab));
          newL += (sLab.L + (pixLab.L - tLab.L) * dampen) * w;
          newA += (sLab.a + (pixLab.a - tLab.a) * dampen) * w;
          newB += (sLab.b + (pixLab.b - tLab.b) * dampen) * w;
        }

        newL = Math.max(0, Math.min(100, newL));
        const [nr, ng, nb] = labToRgb({ L: newL, a: newA, b: newB });
        lines.push(
          `${(nr / 255).toFixed(6)} ${(ng / 255).toFixed(6)} ${(nb / 255).toFixed(6)}`,
        );
      }
    }
  }

  lines.push("");
  return lines.join("\n");
}

