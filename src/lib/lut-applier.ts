// ── .cube LUT parser & 3D trilinear interpolation applier ──

interface CubeLutData {
  size: number;
  title: string;
  data: Float32Array; // size^3 * 3 floats (R,G,B interleaved)
}

// Parse a .cube file text into structured LUT data
export function parseCube(text: string): CubeLutData {
  const lines = text.split("\n");
  let size = 33;
  let title = "";
  const headerLines: string[] = [];
  let dataStart = 0;

  // Find LUT_3D_SIZE and data start
  const headerEnd = Math.min(100, lines.length);
  for (let i = 0; i < headerEnd; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#")) {
      headerLines.push(line);
      continue;
    }
    if (line.startsWith("TITLE")) {
      title = line.replace(/^TITLE\s+/i, "").replace(/^"|"$/g, "");
      continue;
    }
    if (line.startsWith("LUT_3D_SIZE")) {
      size = parseInt(line.split(/\s+/).pop()!, 10) || 33;
      headerLines.push(line);
      continue;
    }
    if (line.startsWith("DOMAIN_MIN") || line.startsWith("DOMAIN_MAX") || line === "" || line.startsWith("LUT_1D_SIZE")) {
      headerLines.push(line);
      continue;
    }
    // First non-header, non-empty line with numbers
    const nums = line.match(/^-?\d+\.?\d*(e[+-]?\d+)?/);
    if (nums) {
      dataStart = i;
      break;
    }
  }

  // Parse data
  const totalCells = size * size * size;
  const data = new Float32Array(totalCells * 3);
  let cellIdx = 0;

  for (let i = dataStart; i < lines.length && cellIdx < totalCells; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    for (let j = 0; j < parts.length && cellIdx < totalCells; j += 3) {
      if (j + 2 >= parts.length) break;
      data[cellIdx * 3] = parseFloat(parts[j]);
      data[cellIdx * 3 + 1] = parseFloat(parts[j + 1]);
      data[cellIdx * 3 + 2] = parseFloat(parts[j + 2]);
      cellIdx++;
    }
  }

  if (cellIdx < totalCells) {
    throw new Error(`Expected ${totalCells} LUT entries, only found ${cellIdx}`);
  }

  return { size, title, data };
}

// Fast trilinear interpolation lookup
function lutLookup(lut: CubeLutData, r: number, g: number, b: number): [number, number, number] {
  const size = lut.size;
  const data = lut.data;

  // Clamp input to [0, 1]
  const cr = Math.max(0, Math.min(1, r));
  const cg = Math.max(0, Math.min(1, g));
  const cb = Math.max(0, Math.min(1, b));

  const rf = cr * (size - 1);
  const gf = cg * (size - 1);
  const bf = cb * (size - 1);

  const r0 = Math.floor(rf);
  const g0 = Math.floor(gf);
  const b0 = Math.floor(bf);
  const r1 = Math.min(r0 + 1, size - 1);
  const g1 = Math.min(g0 + 1, size - 1);
  const b1 = Math.min(b0 + 1, size - 1);

  const dr = rf - r0;
  const dg = gf - g0;
  const db = bf - b0;

  function sample(ri: number, gi: number, bi: number): [number, number, number] {
    const idx = (ri * size + gi) * size + bi;
    return [data[idx * 3], data[idx * 3 + 1], data[idx * 3 + 2]];
  }

  const c000 = sample(r0, g0, b0);
  const c100 = sample(r1, g0, b0);
  const c010 = sample(r0, g1, b0);
  const c110 = sample(r1, g1, b0);
  const c001 = sample(r0, g0, b1);
  const c101 = sample(r1, g0, b1);
  const c011 = sample(r0, g1, b1);
  const c111 = sample(r1, g1, b1);

  // Trilinear interpolation
  const c00 = lerp3(c000, c100, dr);
  const c01 = lerp3(c001, c101, dr);
  const c10 = lerp3(c010, c110, dr);
  const c11 = lerp3(c011, c111, dr);
  const c0 = lerp3(c00, c10, dg);
  const c1 = lerp3(c01, c11, dg);

  return lerp3(c0, c1, db);
}

function lerp3(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// Apply LUT to ImageData, return new ImageData
export function applyLutToImageData(imageData: ImageData, lut: CubeLutData): ImageData {
  const src = imageData.data;
  const result = new Uint8ClampedArray(src.length);

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i] / 255;
    const g = src[i + 1] / 255;
    const b = src[i + 2] / 255;
    const a = src[i + 3];

    const [lr, lg, lb] = lutLookup(lut, r, g, b);
    result[i] = Math.round(lr * 255);
    result[i + 1] = Math.round(lg * 255);
    result[i + 2] = Math.round(lb * 255);
    result[i + 3] = a;
  }

  return new ImageData(result, imageData.width, imageData.height);
}
