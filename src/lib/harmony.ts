import type { ExtractedColor, HarmonyScheme } from "@/types/color";
import { hslToRgb, rgbToHex, rgbToHsl } from "./color-converters";

function makeColor(h: number, s: number, l: number): Omit<ExtractedColor, "lab" | "count" | "percentage" | "tonalRange"> & { lab: null } {
  const [r, g, b] = hslToRgb(h, s, l);
  const hsl = rgbToHsl(r, g, b);
  return {
    hex: rgbToHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    h: hsl.h,
    s: hsl.s,
    l: hsl.l,
    lab: null as unknown as ExtractedColor["lab"],
  };
}

export function generateHarmonies(
  dominant: ExtractedColor,
): HarmonyScheme[] {
  const { h, s, l } = dominant;
  const mk = (hue: number) => makeColor((hue + 360) % 360, s, l) as ExtractedColor;

  return [
    {
      name: "互补配色",
      description: "色轮上相对的两种颜色，形成强烈对比",
      colors: [dominant, mk(h + 180)],
    },
    {
      name: "类比配色",
      description: "色轮上相邻的颜色，和谐统一",
      colors: [mk(h - 30), dominant, mk(h + 30)],
    },
    {
      name: "三角配色",
      description: "色轮上等距的三种颜色，平衡且丰富",
      colors: [dominant, mk(h + 120), mk(h + 240)],
    },
    {
      name: "分裂互补",
      description: "基础色与互补色两侧的颜色，对比柔和",
      colors: [dominant, mk(h + 150), mk(h + 210)],
    },
    {
      name: "四角配色",
      description: "色轮上矩形分布的四种颜色，丰富多彩",
      colors: [dominant, mk(h + 60), mk(h + 180), mk(h + 240)],
    },
  ];
}
