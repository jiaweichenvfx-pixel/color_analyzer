import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExtractedColor } from "@/types/color";
import { toast } from "sonner";
import { LutDownloadButton } from "./LutDownloadButton";

interface PaletteBarProps {
  colors: ExtractedColor[];
  label?: string;
  compact?: boolean;
  showLutDownload?: boolean;
  lutColors?: ExtractedColor[];
  swapSourceColors?: ExtractedColor[];
  swapTargetColors?: ExtractedColor[];
  swapSourceLabel?: string;
  swapTargetLabel?: string;
}

const tonalLabels: Record<ExtractedColor["tonalRange"], string> = {
  highlight: "高光",
  midtone: "中间调",
  shadow: "暗部",
};

const tonalColors: Record<ExtractedColor["tonalRange"], string> = {
  highlight: "bg-amber-100 text-amber-700 border-amber-200",
  midtone: "bg-violet-100 text-violet-700 border-violet-200",
  shadow: "bg-slate-100 text-slate-700 border-slate-200",
};

function Swatch({ color, compact }: { color: ExtractedColor; compact?: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (v: string, label: string) => {
    await navigator.clipboard.writeText(v);
    setCopied(label);
    toast.success(`已复制 ${v}`);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div
        className={cn("rounded-lg border cursor-pointer group relative", compact ? "h-12" : "h-20")}
        style={{ backgroundColor: color.hex }}
        onClick={() => copy(color.hex, "hex")}
        title="点击复制 HEX"
      >
        <Badge className={cn("absolute top-1 left-1 text-[10px] px-1.5 py-0 border", tonalColors[color.tonalRange])}>
          {tonalLabels[color.tonalRange]}
        </Badge>
        <span className="absolute top-1 right-1 text-[10px] bg-white/80 rounded px-1.5 py-0.5 font-mono">
          {color.percentage}%
        </span>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Copy className="w-4 h-4 text-white drop-shadow-md" />
        </div>
      </div>
      {!compact && (
        <div className="flex flex-col gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); copy(color.hex, "hex"); }}
            className="text-xs font-mono text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            {color.hex}
            {copied === "hex" && <Check className="w-3 h-3 text-green-500" />}
          </button>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); copy(color.rgb, "rgb"); }}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              RGB
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); copy(color.hsl, "hsl"); }}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              HSL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PaletteBar({ colors, label, compact, showLutDownload, lutColors, swapSourceColors, swapTargetColors, swapSourceLabel, swapTargetLabel }: PaletteBarProps) {
  const isSwap = !!(swapSourceColors && swapTargetColors && swapSourceColors.length > 0 && swapTargetColors.length > 0);
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-500">{label}</h3>
          {showLutDownload && (
            <div className="flex gap-2">
              {isSwap && (
                <LutDownloadButton
                  colors={swapSourceColors}
                  label={swapSourceLabel || "src"}
                  targetColors={swapTargetColors}
                  targetLabel={swapTargetLabel || "tgt"}
                />
              )}
              <LutDownloadButton colors={lutColors && lutColors.length > 0 ? lutColors : colors} label={label || "palette"} />
            </div>
          )}
        </div>
      )}      <div className={cn("grid gap-3", compact ? "grid-cols-6" : "grid-cols-3 sm:grid-cols-6")}>
        {colors.map((c, i) => (
          <Swatch key={i} color={c} compact={compact} />
        ))}
      </div>
    </div>
  );
}
