import type { LabColor } from "@/types/color";

// ── RGB ↔ Linear RGB ──
function gammaExpand(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function gammaCompress(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(v * 255);
}

// ── RGB <-> XYZ (sRGB D65) ──
function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  const rl = gammaExpand(r);
  const gl = gammaExpand(g);
  const bl = gammaExpand(b);
  const x = 0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl;
  const y = 0.2126729 * rl + 0.7151522 * gl + 0.072175 * bl;
  const z = 0.0193339 * rl + 0.119192 * gl + 0.9503041 * bl;
  return [x, y, z];
}
function xyzToRgb(x: number, y: number, z: number): [number, number, number] {
  const rl = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const gl = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const bl = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
  return [gammaCompress(rl), gammaCompress(gl), gammaCompress(bl)];
}

// ── XYZ <-> CIELAB (D65 reference) ──
const D65_Xn = 0.95047;
const D65_Yn = 1.0;
const D65_Zn = 1.08883;

function xyzToLab(x: number, y: number, z: number): LabColor {
  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(x / D65_Xn);
  const fy = f(y / D65_Yn);
  const fz = f(z / D65_Zn);
  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}
function labToXyz(lab: LabColor): [number, number, number] {
  const fy = (lab.L + 16) / 116;
  const fx = lab.a / 500 + fy;
  const fz = fy - lab.b / 200;
  const finv = (t: number) =>
    t > 0.206893 ? t * t * t : (t - 16 / 116) / 7.787;
  return [finv(fx) * D65_Xn, finv(fy) * D65_Yn, finv(fz) * D65_Zn];
}

// ── Public converters ──
export function rgbToLab(r: number, g: number, b: number): LabColor {
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

export function labToRgb(lab: LabColor): [number, number, number] {
  const [x, y, z] = labToXyz(lab);
  return xyzToRgb(x, y, z).map((v) => Math.max(0, Math.min(255, v))) as [
    number,
    number,
    number,
  ];
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  const rr = r / 255,
    gg = g / 255,
    bb = b / 255;
  const max = Math.max(rr, gg, bb),
    min = Math.min(rr, gg, bb);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rr:
        h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
        break;
      case gg:
        h = ((bb - rr) / d + 2) / 6;
        break;
      case bb:
        h = ((rr - gg) / d + 4) / 6;
        break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  const ss = s / 100,
    ll = l / 100;
  const hueToRgb = (n: number) => {
    const k = (n + h / 30) % 12;
    const a = ss * Math.min(ll, 1 - ll);
    return ll - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return [
    Math.round(hueToRgb(0) * 255),
    Math.round(hueToRgb(8) * 255),
    Math.round(hueToRgb(4) * 255),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

export function deltaE(lab1: LabColor, lab2: LabColor): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}
