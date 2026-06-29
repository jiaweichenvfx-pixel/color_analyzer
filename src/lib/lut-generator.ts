import type { ExtractedColor } from "@/types/color";
import { rgbToHsl, hslToRgb } from "./color-converters";

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }

// Gaussian-weighted smooth blending — no hard boundaries between palette zones.
// All palette colors contribute to every grid point, weighted by exp(-dL² / 2σ²).
// Result is C∞ smooth: no jumps at any lightness boundary.
function generatePaletteLut(palette: ExtractedColor[], size: number): string {
  const pHSL = palette.map(c => [c.h, c.s, c.l] as const);
  const sigma = 18; // gaussian spread: palette colors influence ~±36 lightness units

  const lines: string[] = [
    `# Smooth Hue LUT — 配色分析器 Pro`,
    `# ${palette.length} palette colors, ${size}³ grid, gaussian blend σ=${sigma}`,
    `# All palette colors contribute at every point — no hard boundaries`,
    "",
    `TITLE "Smooth Palette Look"`,
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
        const is = hsl.s;
        const il = hsl.l;

        // Near-neutral / extreme: pass identity untouched
        if (is < 5 || il < 3 || il > 97) {
          lines.push(`${(ir/255).toFixed(6)} ${(ig/255).toFixed(6)} ${(ib/255).toFixed(6)}`);
          continue;
        }

        // Strength: ramps from 0 at is=5 to 0.85 at is=35
        const strength = clamp01((is - 5) / 30) * 0.88;

        // Gaussian weights over all palette colors by lightness
        const weights: number[] = pHSL.map(([, , pl]) =>
          Math.exp(-((il - pl) * (il - pl)) / (2 * sigma * sigma))
        );
        const totalW = weights.reduce((a, b) => a + b, 0);

        // Weighted blend of hue shifts
        let totalHueShift = 0;
        let totalSatTarget = 0;
        let totalLumTarget = 0;

        for (let pi = 0; pi < pHSL.length; pi++) {
          const w = weights[pi] / totalW;
          const [ph, ps, pl] = pHSL[pi];

          let hDelta = ph - hsl.h;
          if (hDelta > 180) hDelta -= 360;
          if (hDelta < -180) hDelta += 360;

          totalHueShift += hDelta * w;
          totalSatTarget += ps * w;
          totalLumTarget += pl * w;
        }

        // Apply blended shift
        const nh = ((hsl.h + totalHueShift * strength) % 360 + 360) % 360;
        const ns = clamp01(is / 100 + (totalSatTarget / 100 - is / 100) * strength * 0.35) * 100;
        const nl = clamp01(il / 100 + (totalLumTarget / 100 - il / 100) * strength * 0.2) * 100;

        const [outR, outG, outB] = hslToRgb(nh, ns, nl);
        lines.push(`${(outR/255).toFixed(6)} ${(outG/255).toFixed(6)} ${(outB/255).toFixed(6)}`);
      }
    }
  }

  lines.push("");
  return lines.join("\n");
}

export function generatePaletteCubeLut(palette: ExtractedColor[], size: number = 65): string {
  return generatePaletteLut(palette, size);
}
