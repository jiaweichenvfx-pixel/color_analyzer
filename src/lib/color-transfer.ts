import type { ExtractedColor } from "@/types/color";
import { rgbToLab, labToRgb, deltaE } from "./color-converters";

// ── Hungarian algorithm for optimal one-to-one assignment ──
function hungarian(costMatrix: number[][]): number[] {
  const n = costMatrix.length;
  const m = costMatrix[0].length;
  const size = Math.max(n, m);

  const cost: number[][] = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) =>
      i < n && j < m ? costMatrix[i][j] : i < n ? 1e9 : 0
    )
  );

  const u = new Array<number>(size + 1).fill(0);
  const v = new Array<number>(size + 1).fill(0);
  const p = new Array<number>(size + 1).fill(0);
  const way = new Array<number>(size + 1).fill(0);

  for (let i = 1; i <= size; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array<number>(size + 1).fill(1e9);
    const used = new Array<boolean>(size + 1).fill(false);

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = 1e9, j1 = 0;

      for (let j = 1; j <= size; j++) {
        if (!used[j]) {
          const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
          if (minv[j] < delta) { delta = minv[j]; j1 = j; }
        }
      }

      for (let j = 0; j <= size; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else { minv[j] -= delta; }
      }
      j0 = j1;
    } while (p[j0] !== 0);

    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const assignment = new Array<number>(n).fill(0);
  for (let j = 1; j <= size; j++) {
    if (p[j] >= 1 && p[j] <= n) {
      assignment[p[j] - 1] = j - 1;
    }
  }
  return assignment;
}

// ── Build pairs: Hungarian matching within each tonal zone ──
interface PairData {
  tLab: { L: number; a: number; b: number };
  sLab: { L: number; a: number; b: number };
}

function buildPairs(
  sourcePalette: ExtractedColor[],
  targetPalette: ExtractedColor[],
): PairData[] {
  const zones = ["shadow", "midtone", "highlight"] as const;
  const pairs: PairData[] = [];

  for (const zone of zones) {
    const src = sourcePalette.filter(c => c.tonalRange === zone);
    const tgt = targetPalette.filter(c => c.tonalRange === zone);

    if (tgt.length === 0) continue;

    if (src.length === 0) {
      const allSrc = sourcePalette.length > 0 ? sourcePalette : src;
      for (const tc of tgt) {
        let best = allSrc[0], bestD = Infinity;
        for (const sc of allSrc) {
          const d = deltaE(tc.lab, sc.lab);
          if (d < bestD) { bestD = d; best = sc; }
        }
        pairs.push({ tLab: tc.lab, sLab: best.lab });
      }
      continue;
    }

    // Hungarian: min total ΔE across target→source
    const costMatrix = tgt.map(tc => src.map(sc => deltaE(tc.lab, sc.lab)));
    const assignment = hungarian(costMatrix);

    for (let ti = 0; ti < tgt.length; ti++) {
      const si = assignment[ti];
      if (si >= src.length) {
        let best = src[0], bestD = Infinity;
        for (const sc of src) {
          const d = deltaE(tgt[ti].lab, sc.lab);
          if (d < bestD) { bestD = d; best = sc; }
        }
        pairs.push({ tLab: tgt[ti].lab, sLab: best.lab });
      } else {
        pairs.push({ tLab: tgt[ti].lab, sLab: src[si].lab });
      }
    }
  }

  return pairs;
}

// ── Adaptive dampening ──
const DAMPEN_MIN = 0.3;
const DAMPEN_MAX = 0.85;
const DAMPEN_SIGMA = 45;

function adaptiveDampen(distToAnchor: number): number {
  if (distToAnchor <= 15) return DAMPEN_MIN;
  if (distToAnchor >= 60) return DAMPEN_MAX;
  const t = (distToAnchor - 15) / DAMPEN_SIGMA;
  return DAMPEN_MIN + t * (DAMPEN_MAX - DAMPEN_MIN);
}

// ── Gaussian-blended delta-preserving color transfer ──
// Instead of snapping each pixel to ONE nearest anchor (which creates hard
// boundaries / banding), ALL pairs contribute via Gaussian weight by LAB
// distance to the target anchor.  The result is C∞ smooth across the image.

const BLEND_SIGMA = 20; // wider = smoother but less precise mapping

export function applyColorTransfer(
  sourcePalette: ExtractedColor[],
  targetPalette: ExtractedColor[],
  pixelData: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray {
  const pairs = buildPairs(sourcePalette, targetPalette);
  if (pairs.length === 0) return new Uint8ClampedArray(pixelData);

  const result = new Uint8ClampedArray(pixelData.length);
  const inv2sig2 = 1 / (2 * BLEND_SIGMA * BLEND_SIGMA);

  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i], g = pixelData[i + 1], b = pixelData[i + 2], a = pixelData[i + 3];
    if (a < 128) {
      result[i] = r; result[i + 1] = g; result[i + 2] = b; result[i + 3] = a;
      continue;
    }

    const pixLab = rgbToLab(r, g, b);

    // Gaussian weights by LAB distance to each target anchor
    const weights = new Float64Array(pairs.length);
    let totalW = 0;
    for (let j = 0; j < pairs.length; j++) {
      const d = deltaE(pixLab, pairs[j].tLab);
      const w = Math.exp(-(d * d) * inv2sig2);
      weights[j] = w;
      totalW += w;
    }

    if (totalW < 1e-9) {
      result[i] = r; result[i + 1] = g; result[i + 2] = b; result[i + 3] = a;
      continue;
    }

    // Weighted blend of delta-preserving remapped LAB values
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
    result[i] = nr;
    result[i + 1] = ng;
    result[i + 2] = nb;
    result[i + 3] = a;
  }

  return result;
}
