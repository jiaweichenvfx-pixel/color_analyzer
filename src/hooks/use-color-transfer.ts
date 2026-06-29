import { useState, useCallback, useRef } from "react";
import type { ExtractedColor, TransferResult } from "@/types/color";

interface UseColorTransferReturn {
  result: TransferResult | null;
  isProcessing: boolean;
  apply: (
    sourceId: "a" | "b",
    targetId: "a" | "b",
    sourceFullPalette: ExtractedColor[],
    targetFullPalette: ExtractedColor[],
    targetImageDataUrl: string,
  ) => Promise<void>;
  clear: () => void;
}

// Dedicated transfer worker — separate from extraction worker to avoid
// onmessage conflicts. Transfer is always async (Worker) to never block UI.
let _transferWorker: Worker | null = null;
function getTransferWorker(): Worker {
  if (!_transferWorker) {
    _transferWorker = new Worker(
      new URL("@/workers/color-worker.ts", import.meta.url),
      { type: "module" },
    );
  }
  return _transferWorker;
}

export function useColorTransfer(): UseColorTransferReturn {
  const [result, setResult] = useState<TransferResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const apply = useCallback(
    async (
      sourceId: "a" | "b",
      targetId: "a" | "b",
      sourceFullPalette: ExtractedColor[],
      targetFullPalette: ExtractedColor[],
      targetImageDataUrl: string,
    ) => {
      setIsProcessing(true);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        const worker = getTransferWorker();
        const id = Math.random().toString(36).slice(2);

        const onMsg = (e: MessageEvent) => {
          if (e.data.type === "transfer" && e.data.id === id) {
            worker.removeEventListener("message", onMsg);
            const resultData = new Uint8ClampedArray(e.data.resultData);
            const outCanvas = document.createElement("canvas");
            outCanvas.width = img.width;
            outCanvas.height = img.height;
            const outCtx = outCanvas.getContext("2d")!;
            const outImageData = new ImageData(resultData, img.width, img.height);
            outCtx.putImageData(outImageData, 0, 0);
            setResult({
              sourceId,
              targetId,
              resultDataUrl: outCanvas.toDataURL("image/png"),
            });
            setIsProcessing(false);
          }
        };

        worker.addEventListener("message", onMsg);
        worker.postMessage(
          {
            type: "transfer",
            id,
            pixelData: imageData.data,
            width: img.width,
            height: img.height,
            sourcePalette: sourceFullPalette,
            targetPalette: targetFullPalette,
          },
          [imageData.data.buffer],
        );
      };
      img.onerror = () => {
        setIsProcessing(false);
      };
      img.src = targetImageDataUrl;
    },
    [],
  );

  const clear = useCallback(() => {
    setResult(null);
  }, []);

  return { result, isProcessing, apply, clear };
}
