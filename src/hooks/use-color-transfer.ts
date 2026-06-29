import { useState, useCallback, useRef } from "react";
import type { ExtractedColor, TransferResult } from "@/types/color";
import { applyColorTransfer } from "@/lib/color-transfer";

interface UseColorTransferReturn {
  result: TransferResult | null;
  isProcessing: boolean;
  apply: (
    sourceId: "a" | "b",
    targetId: "a" | "b",
    sourcePalette: ExtractedColor[],
    targetPalette: ExtractedColor[],
    targetImageDataUrl: string,
  ) => Promise<void>;
  clear: () => void;
}

export function useColorTransfer(): UseColorTransferReturn {
  const [result, setResult] = useState<TransferResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const apply = useCallback(
    async (
      sourceId: "a" | "b",
      targetId: "a" | "b",
      sourcePalette: ExtractedColor[],
      targetPalette: ExtractedColor[],
      targetImageDataUrl: string,
    ) => {
      setIsProcessing(true);

      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        // Use Worker for large images
        const useWorker = img.width * img.height > 500 * 500;
        if (useWorker) {
          if (!workerRef.current) {
            workerRef.current = new Worker(
              new URL("@/workers/color-worker.ts", import.meta.url),
              { type: "module" },
            );
          }
          const id = Math.random().toString(36).slice(2);
          workerRef.current.postMessage(
            {
              type: "transfer",
              id,
              pixelData: imageData.data,
              width: img.width,
              height: img.height,
              sourcePalette,
              targetPalette,
            },
            [imageData.data.buffer],
          );
          workerRef.current.onmessage = (e) => {
            if (e.data.type === "transfer" && e.data.id === id) {
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
        } else {
          // Synchronous for small images
          const resultData = applyColorTransfer(
            sourcePalette,
            targetPalette,
            imageData.data,
            img.width,
            img.height,
          );
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
      img.src = targetImageDataUrl;
    },
    [],
  );

  const clear = useCallback(() => {
    setResult(null);
  }, []);

  return { result, isProcessing, apply, clear };
}
