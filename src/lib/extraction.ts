import type { LabColor, ExtractedColor } from "@/types/color";
import { rgbToLab, labToRgb, rgbToHex, rgbToHsl, deltaE } from "./color-converters";

interface Sample {
  lab: LabColor;
  r: number;
  g: number;
  b: number;
}

// ── K-Means++ in CIELAB ──
function kmeansPlusPlus(samples: Sample[], k: number): { centroids: LabColor[]; assignments: number[] } {
  if (samples.length <= k) {
    const centroids = samples.map((s) => s.lab);
    const assignments = samples.map((_, i) => i);
    return { centroids, assignments };
  }

  // Init first centroid randomly
  const centroids: LabColor[] = [];
  centroids.push(samples[Math.floor(Math.random() * samples.length)].lab);

  // k-means++ init for remaining
  for (let ci = 1; ci < k; ci++) {
    const dists = samples.map((s) => {
      let minD = Infinity;
      for (const c of centroids) {
        const d = deltaE(s.lab, c);
        if (d < minD) minD = d;
      }
      return minD * minD;
    });
    const sum = dists.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      centroids.push(samples[Math.floor(Math.random() * samples.length)].lab);
      continue;
    }
    let r = Math.random() * sum;
    for (let i = 0; i < dists.length; i++) {
      r -= dists[i];
      if (r <= 0) {
        centroids.push(samples[i].lab);
        break;
      }
    }
  }

  // Iterative refinement
  const assignments = new Array<number>(samples.length).fill(0);
  for (let iter = 0; iter < 20; iter++) {
    let maxShift = 0;
    // Assign
    const sums = Array.from({ length: k }, (): { L: number; a: number; b: number; count: number } => ({
      L: 0, a: 0, b: 0, count: 0,
    }));
    for (let i = 0; i < samples.length; i++) {
      let best = 0,
        bestD = Infinity;
      for (let j = 0; j < k; j++) {
        const d = deltaE(samples[i].lab, centroids[j]);
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
      assignments[i] = best;
      sums[best].L += samples[i].lab.L;
      sums[best].a += samples[i].lab.a;
      sums[best].b += samples[i].lab.b;
      sums[best].count++;
    }
    // Update
    for (let j = 0; j < k; j++) {
      if (sums[j].count > 0) {
        const newC: LabColor = {
          L: sums[j].L / sums[j].count,
          a: sums[j].a / sums[j].count,
          b: sums[j].b / sums[j].count,
        };
        maxShift = Math.max(maxShift, deltaE(centroids[j], newC));
        centroids[j] = newC;
      }
    }
    if (maxShift < 0.1) break;
  }

  return { centroids, assignments };
}

// ── Saturation helper: perceptual chroma in LAB ──
function chroma(lab: LabColor): number {
  return Math.sqrt(lab.a * lab.a + lab.b * lab.b);
}

// ── Main extraction function ──
export function extractColorsFromPixelData(
  pixelData: Uint8ClampedArray,
  width: number,
  height: number,
): ExtractedColor[] {
  // Phase 1: Sample pixels → LAB
  const samples: Sample[] = [];
  const data = pixelData;
  const step = 4;

  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3];
    if (a < 128) continue;
    const avg = (r + g + b) / 3;
    if (avg < 15 || avg > 240) continue;

    samples.push({ lab: rgbToLab(r, g, b), r, g, b });
  }

  if (samples.length < 10) return [];

  // Phase 2: K-Means++ (k=12 to capture more distinct colors)
  const k = Math.min(12, samples.length);
  const { centroids, assignments } = kmeansPlusPlus(samples, k);

  // Phase 3: Build clusters with average RGB
  const clusters = centroids.map((c, i) => {
    const assigned: Sample[] = [];
    for (let idx = 0; idx < assignments.length; idx++) {
      if (assignments[idx] === i) assigned.push(samples[idx]);
    }
    const n = assigned.length || 1;
    return {
      centroid: c,
      count: assigned.length,
      r: Math.round(assigned.reduce((s, p) => s + p.r, 0) / n),
      g: Math.round(assigned.reduce((s, p) => s + p.g, 0) / n),
      b: Math.round(assigned.reduce((s, p) => s + p.b, 0) / n),
    };
  });

  // Phase 4: Merge near-identical clusters (ΔE < 10, tighter threshold)
  const merged: typeof clusters = [];
  const sorted = clusters.sort((a, b) => b.count - a.count);
  const used = new Array(sorted.length).fill(false);

  for (let i = 0; i < sorted.length; i++) {
    if (used[i]) continue;
    let totalCount = sorted[i].count;
    let totalR = sorted[i].r * sorted[i].count;
    let totalG = sorted[i].g * sorted[i].count;
    let totalB = sorted[i].b * sorted[i].count;

    for (let j = i + 1; j < sorted.length; j++) {
      if (used[j]) continue;
      if (deltaE(sorted[i].centroid, sorted[j].centroid) < 10) {
        used[j] = true;
        totalCount += sorted[j].count;
        totalR += sorted[j].r * sorted[j].count;
        totalG += sorted[j].g * sorted[j].count;
        totalB += sorted[j].b * sorted[j].count;
      }
    }

    merged.push({
      centroid: sorted[i].centroid,
      count: totalCount,
      r: Math.round(totalR / totalCount),
      g: Math.round(totalG / totalCount),
      b: Math.round(totalB / totalCount),
    });
  }

  // Phase 5: Score clusters by count × chroma, pick top 6 with diversity
  const totalPixels = merged.reduce((s, c) => s + c.count, 0);

  // Score: normalized count (0-1) * normalized chroma (0-1) with slight chroma bias
  const maxCount = Math.max(...merged.map((c) => c.count), 1);
  const scores = merged.map((c) => {
    const cLab = rgbToLab(c.r, c.g, c.b);
    const cChroma = chroma(cLab);
    const countScore = c.count / maxCount;
    // Chroma ranges roughly 0-130 in sRGB gamut; normalize to 0-1
    const chromaScore = Math.min(cChroma / 80, 1);
    // Weight: 40% count + 60% chroma to favor vibrant colors
    return countScore * 0.4 + chromaScore * 0.6;
  });

  // Greedy selection: pick highest-score, then penalize similarity to already-picked
  const picked: number[] = [];
  const available = merged.map((_, i) => i);

  while (picked.length < 6 && available.length > 0) {
    let bestIdx = -1;
    let bestScore = -1;

    for (const i of available) {
      let penalty = 0;
      for (const p of picked) {
        const d = deltaE(rgbToLab(merged[i].r, merged[i].g, merged[i].b), rgbToLab(merged[p].r, merged[p].g, merged[p].b));
        // Heavy penalty for colors within ΔE 25 of already-picked ones
        if (d < 25) penalty += (25 - d) / 25;
      }
      const adjusted = scores[i] * (1 - penalty * 0.8);
      if (adjusted > bestScore) {
        bestScore = adjusted;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break;
    picked.push(bestIdx);
    available.splice(available.indexOf(bestIdx), 1);
  }

  // Phase 6: Classify tonal range using CIELAB L (perceptually accurate)
  const result = picked.map((i) => {
    const c = merged[i];
    const [r, g, b] = [c.r, c.g, c.b];
    const lab = rgbToLab(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const tonalRange: ExtractedColor["tonalRange"] =
      lab.L > 80 ? "highlight" : lab.L < 25 ? "shadow" : "midtone";

    return {
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
      lab,
      count: c.count,
      percentage: Math.round((c.count / totalPixels) * 1000) / 10,
      tonalRange,
    } satisfies ExtractedColor;
  });

  // Ensure at least one per tonal range
  const ranges = new Set(result.map((c) => c.tonalRange));
  if (!ranges.has("highlight")) {
    const brightest = result.reduce((a, b) => (a.lab.L > b.lab.L ? a : b));
    if (brightest.lab.L > 70) brightest.tonalRange = "highlight";
  }
  if (!ranges.has("shadow")) {
    const darkest = result.reduce((a, b) => (a.lab.L < b.lab.L ? a : b));
    if (darkest.lab.L < 30) darkest.tonalRange = "shadow";
  }

  return result.sort((a, b) => {
    const order = { highlight: 0, midtone: 1, shadow: 2 };
    return order[a.tonalRange] - order[b.tonalRange];
  });
}

// Worker message types
export type WorkerMessage =
  | { type: "extract"; id: string; pixelData: Uint8ClampedArray; width: number; height: number }
  | { type: "transfer"; id: string; sourcePalette: ExtractedColor[]; targetPalette: ExtractedColor[]; pixelData: Uint8ClampedArray; width: number; height: number };

export type WorkerResponse =
  | { type: "extract"; id: string; colors: ExtractedColor[] }
  | { type: "transfer"; id: string; resultData: Uint8ClampedArray };
