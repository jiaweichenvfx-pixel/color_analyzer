export interface LabColor {
  L: number;
  a: number;
  b: number;
}

export interface ExtractedColor {
  hex: string;
  rgb: string;
  hsl: string;
  h: number;
  s: number;
  l: number;
  lab: LabColor;
  count: number;
  percentage: number;
  tonalRange: "highlight" | "midtone" | "shadow";
}

export interface HarmonyScheme {
  name: string;
  description: string;
  colors: ExtractedColor[];
}

export interface ImageState {
  id: "a" | "b";
  dataUrl: string | null;
  palette: ExtractedColor[] | null;
  fullPalette: ExtractedColor[] | null;
  harmonies: HarmonyScheme[] | null;
  isExtracting: boolean;
}

export interface TransferResult {
  sourceId: "a" | "b";
  targetId: "a" | "b";
  resultDataUrl: string;
}
