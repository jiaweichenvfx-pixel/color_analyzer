import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePaletteCubeLut } from "@/lib/lut-generator";
import type { ExtractedColor } from "@/types/color";

interface LutDownloadButtonProps {
  colors: ExtractedColor[];
  label: string;
}

export function LutDownloadButton({ colors, label }: LutDownloadButtonProps) {
  const handleDownload = () => {
    const lut = generatePaletteCubeLut(colors, 65);
    const blob = new Blob([lut], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `palette-${label}-65.cube`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      className="gap-1.5 text-xs"
      title={`${colors.length} palette colors → 65³ LUT`}
    >
      <Download className="w-3.5 h-3.5" />
      下载 LUT ({colors.length}色)
    </Button>
  );
}
