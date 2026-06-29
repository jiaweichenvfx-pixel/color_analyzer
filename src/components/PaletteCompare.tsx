import { PaletteBar } from "./PaletteBar";
import { Separator } from "@/components/ui/separator";
import type { ExtractedColor } from "@/types/color";

interface PaletteCompareProps {
  paletteA: ExtractedColor[];
  paletteB: ExtractedColor[];
  fullPaletteA?: ExtractedColor[] | null;
  fullPaletteB?: ExtractedColor[] | null;
}

export function PaletteCompare({ paletteA, paletteB, fullPaletteA, fullPaletteB }: PaletteCompareProps) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
      <h2 className="text-base font-semibold text-slate-800">调色板对比</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaletteBar
          colors={paletteA}
          label="图片 A"
          showLutDownload
          lutColors={fullPaletteA || undefined}
          swapSourceColors={fullPaletteA || undefined}
          swapTargetColors={fullPaletteB || undefined}
          swapSourceLabel="A"
          swapTargetLabel="B"
        />
        <div className="hidden md:block">
          <Separator orientation="vertical" className="h-full" />
        </div>
        <Separator className="md:hidden" />
        <PaletteBar
          colors={paletteB}
          label="图片 B"
          showLutDownload
          lutColors={fullPaletteB || undefined}
          swapSourceColors={fullPaletteB || undefined}
          swapTargetColors={fullPaletteA || undefined}
          swapSourceLabel="B"
          swapTargetLabel="A"
        />
      </div>
    </div>
  );
}
