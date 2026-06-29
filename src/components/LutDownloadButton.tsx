import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePaletteCubeLut, generateSwapCubeLut } from "@/lib/lut-generator";
import type { ExtractedColor } from "@/types/color";

interface LutDownloadButtonProps {
  colors: ExtractedColor[];
  label: string;
  targetColors?: ExtractedColor[];
  targetLabel?: string;
}

export function LutDownloadButton({ colors, label, targetColors, targetLabel }: LutDownloadButtonProps) {
  const isSwap = !!targetColors && targetColors.length > 0;

  const handleDownload = () => {
    const lut = isSwap
      ? generateSwapCubeLut(colors, targetColors!, 65)
      : generatePaletteCubeLut(colors, undefined, 65);
    const fileName = isSwap
      ? `swap-${label}-to-${targetLabel}-65.cube`
      : `palette-${label}-65.cube`;
    const blob = new Blob([lut], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tooltip = isSwap
    ? `${colors.length} source + ${targetColors!.length} target → Hungarian pair → 65³ swap LUT`
    : `${colors.length} palette colors → 65³ LUT`;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      className="gap-1.5 text-xs"
      title={tooltip}
    >
      <Download className="w-3.5 h-3.5" />
      {isSwap ? `下载互换 LUT (${colors.length}→${targetColors!.length}色)` : `下载 LUT (${colors.length}色)`}
    </Button>
  );
}
