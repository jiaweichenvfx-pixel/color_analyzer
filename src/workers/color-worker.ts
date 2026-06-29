import { extractColorsFromPixelData, extractFullPalette } from "@/lib/extraction";
import { applyColorTransfer } from "@/lib/color-transfer";
import type { ExtractedColor } from "@/types/color";

type WMsg = {
  data: {
    type: "extract" | "transfer" | "extract-full";
    id: string;
    pixelData: Uint8ClampedArray;
    width: number;
    height: number;
    sourcePalette?: ExtractedColor[];
    targetPalette?: ExtractedColor[];
  };
};

self.onmessage = (e: WMsg) => {
  const msg = e.data;

  if (msg.type === "extract") {
    const colors = extractColorsFromPixelData(msg.pixelData, msg.width, msg.height);
    self.postMessage({ type: "extract", id: msg.id, colors });
  }

  if (msg.type === "extract-full") {
    const colors = extractFullPalette(msg.pixelData, msg.width, msg.height);
    self.postMessage({ type: "extract-full", id: msg.id, colors });
  }

  if (msg.type === "transfer") {
    const result = applyColorTransfer(
      msg.sourcePalette!,
      msg.targetPalette!,
      msg.pixelData,
      msg.width,
      msg.height,
    );
    self.postMessage({ type: "transfer", id: msg.id, resultData: result }, [result.buffer]);
  }
};
