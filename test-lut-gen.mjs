import { rgbToHsl, hslToRgb, rgbToLab, deltaE } from "./src/lib/color-converters.ts";

function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function adaptiveDampen(distToAnchor) {
  if (distToAnchor <= 10) return 0.5;
  if (distToAnchor >= 80) return 0.85;
  return 0.5 + ((distToAnchor - 10) / 70) * 0.35;
}
function generatePaletteCubeLut(palette, size) {
  if (palette.length === 0) {
    const lines = [`TITLE "Identity"`, `LUT_3D_SIZE ${size}`, ""];
    for (let ri = 0; ri < size; ri++)
      for (let gi = 0; gi < size; gi++)
        for (let bi = 0; bi < size; bi++)
          lines.push(`${(ri/(size-1)).toFixed(6)} ${(gi/(size-1)).toFixed(6)} ${(bi/(size-1)).toFixed(6)}`);
    return lines.join("\n");
  }
  const anchors = palette.map(c => ({ lab: c.lab, hsl: [c.h, c.s, c.l] }));
  const lines = [
    `# Palette Grade LUT`,
    `# ${palette.length} anchor colors`,
    `TITLE "Palette Grade"`,
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
        if (hsl.s < 3 || hsl.l < 2 || hsl.l > 98) {
          lines.push(`${(ir/255).toFixed(6)} ${(ig/255).toFixed(6)} ${(ib/255).toFixed(6)}`);
          continue;
        }
        let bestD = Infinity, bestA = anchors[0];
        for (const a of anchors) {
          const d = deltaE(pixLab, a.lab); if (d < bestD) { bestD = d; bestA = a; }
        }
        const dampen = adaptiveDampen(bestD);
        const [th, ts, tl] = bestA.hsl;
        let hDelta = th - hsl.h;
        if (hDelta > 180) hDelta -= 360; if (hDelta < -180) hDelta += 360;
        const nh = ((hsl.h + hDelta * (1 - dampen)) % 360 + 360) % 360;
        const ns = clamp01(hsl.s / 100 + (ts / 100 - hsl.s / 100) * (1 - dampen) * 0.6) * 100;
        const nl = clamp01(hsl.l / 100 + (tl / 100 - hsl.l / 100) * (1 - dampen) * 0.35) * 100;
        const [outR, outG, outB] = hslToRgb(nh, ns, nl);
        lines.push(`${(outR/255).toFixed(6)} ${(outG/255).toFixed(6)} ${(outB/255).toFixed(6)}`);
      }
    }
  }
  lines.push("");
  return lines.join("\n");
}

const palette = [
  { h: 0, s: 80, l: 45, lab: rgbToLab(200, 30, 30) },
  { h: 120, s: 70, l: 40, lab: rgbToLab(30, 160, 30) },
  { h: 240, s: 75, l: 50, lab: rgbToLab(30, 60, 200) },
  { h: 50, s: 85, l: 55, lab: rgbToLab(230, 210, 40) },
  { h: 300, s: 60, l: 35, lab: rgbToLab(140, 30, 140) },
];

const lut = generatePaletteCubeLut(palette, 5);
const dataLines = lut.split("\n").filter(l => l && \!l.startsWith("#") && \!l.startsWith("TITLE") && \!l.startsWith("LUT") && l.trim());

// Check a non-neutral grid point — should differ from identity
const point = dataLines[Math.floor(dataLines.length / 2)];
console.log("Middle point:", point);

// Check identity at black
console.log("Black:", dataLines[0]);

// Count how many points differ from identity
let changed = 0, same = 0;
for (let i = 0; i < dataLines.length; i++) {
  const [r, g, b] = dataLines[i].split(/\s+/).map(Number);
  if (\!isNaN(r)) {
    const ri = i; // approximate
    if (Math.abs(r - 0.5) > 0.001 || Math.abs(g - 0.5) > 0.001 || Math.abs(b - 0.5) > 0.001) changed++;
  }
}
// Better: compare with identity LUT
const identityLut = generatePaletteCubeLut([], 5);
const idLines = identityLut.split("\n").filter(l => l && \!l.startsWith("#") && \!l.startsWith("TITLE") && \!l.startsWith("LUT") && l.trim());

let diffs = 0;
for (let i = 0; i < dataLines.length; i++) {
  const a = dataLines[i].split(/\s+/).map(Number);
  const b = idLines[i] ? idLines[i].split(/\s+/).map(Number) : [0,0,0];
  if (Math.abs(a[0]-b[0]) > 0.001 || Math.abs(a[1]-b[1]) > 0.001 || Math.abs(a[2]-b[2]) > 0.001) diffs++;
}
console.log(`Points different from identity: ${diffs}/${dataLines.length}`);
