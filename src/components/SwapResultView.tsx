import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { TransferResult, ImageState } from "@/types/color";

interface SwapResultViewProps {
  result: TransferResult;
  imageA: ImageState;
  imageB: ImageState;
}

export function SwapResultView({ result, imageA, imageB }: SwapResultViewProps) {
  const targetImage =
    result.targetId === "a" ? imageA.dataUrl : imageB.dataUrl;
  const sourceLabel = result.sourceId === "a" ? "A" : "B";
  const targetLabel = result.targetId === "a" ? "A" : "B";

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = result.resultDataUrl;
    a.download = `color-transfer-${sourceLabel}-to-${targetLabel}.png`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">互换结果</h2>
        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          下载结果
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Before */}
        <div className="space-y-2">
          <span className="text-xs text-slate-500">原图 ({targetLabel})</span>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src={targetImage!}
                alt="Before"
                className="w-full h-48 object-cover"
              />
            </CardContent>
          </Card>
        </div>

        {/* Arrow */}
        <div className="flex justify-center md:block">
          <div className="flex md:flex-col items-center gap-1 text-slate-400">
            <span className="text-2xl">→</span>
            <span className="text-xs">
              应用图{sourceLabel}配色
            </span>
          </div>
        </div>

        {/* After */}
        <div className="space-y-2">
          <span className="text-xs text-violet-600 font-medium">
            结果（{sourceLabel}配色 + {targetLabel}图像）
          </span>
          <Card className="overflow-hidden border-violet-200">
            <CardContent className="p-0">
              <img
                src={result.resultDataUrl}
                alt="After"
                className="w-full h-48 object-cover"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
