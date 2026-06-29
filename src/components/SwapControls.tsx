import { ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwapControlsProps {
  hasBothPalettes: boolean;
  isProcessing: boolean;
  onSwap: (direction: "a-to-b" | "b-to-a") => void;
  activeDirection: "a-to-b" | "b-to-a" | null;
}

export function SwapControls({
  hasBothPalettes,
  isProcessing,
  onSwap,
  activeDirection,
}: SwapControlsProps) {
  if (!hasBothPalettes) return null;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h2 className="text-base font-semibold text-slate-800 mb-3">配色互换</h2>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => onSwap("a-to-b")}
          disabled={isProcessing}
          className="gap-2"
        >
          {isProcessing && activeDirection === "a-to-b" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowLeftRight className="w-4 h-4" />
          )}
          A 的配色 → B 图
        </Button>
        <Button
          variant="outline"
          onClick={() => onSwap("b-to-a")}
          disabled={isProcessing}
          className="gap-2"
        >
          {isProcessing && activeDirection === "b-to-a" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowLeftRight className="w-4 h-4" />
          )}
          B 的配色 → A 图
        </Button>
      </div>
    </div>
  );
}
