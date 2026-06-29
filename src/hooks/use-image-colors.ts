import { useState, useCallback, useRef } from "react";
import type { ExtractedColor, HarmonyScheme } from "@/types/color";
import { generateHarmonies } from "@/lib/harmony";
import { extractColorsFromPixelData } from "@/lib/extraction";

interface UseImageColorsReturn {
  palette: ExtractedColor[] | null;
  fullPalette: ExtractedColor[] | null;
  harmonies: HarmonyScheme[] | null;
  isExtracting: boolean;
  extractColors: (file: File) => Promise<{ palette: ExtractedColor[]; fullPalette: ExtractedColor[] }>;
  clearPalette: () => void;
}

export function useImageColors(): UseImageColorsReturn {
  const [palette, setPalette] = useState<ExtractedColor[] | null>(null);
  const [fullPalette, setFullPalette] = useState<ExtractedColor[] | null>(null);
  const [harmonies, setHarmonies] = useState<HarmonyScheme[] | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("@/workers/color-worker.ts", import.meta.url),
        { type: "module" },
      );
    }
    return workerRef.current;
  }, []);

  const extractColors = useCallback(
    (file: File): Promise<{ palette: ExtractedColor[]; fullPalette: ExtractedColor[] }> => {
      return new Promise((resolve, reject) => {
        setIsExtracting(true);
        const img = new Image();
        img.onload = () => {
          // Display palette: small version, sync (fast)
          const scaleSmall = Math.min(200 / img.width, 200 / img.height);
          const wSmall = Math.round(img.width * scaleSmall);
          const hSmall = Math.round(img.height * scaleSmall);

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = wSmall;
          canvas.height = hSmall;
          ctx.drawImage(img, 0, 0, wSmall, hSmall);
          const imageDataSmall = ctx.getImageData(0, 0, wSmall, hSmall);
          const colors = extractColorsFromPixelData(imageDataSmall.data, wSmall, hSmall);

          if (colors.length === 0) {
            setIsExtracting(false);
            reject(new Error("No colors found"));
            return;
          }

          setPalette(colors);
          const hms = generateHarmonies(colors[0]);
          setHarmonies(hms);

          // Full palette: run in web worker to avoid blocking main thread
          const scaleLarge = Math.min(600 / img.width, 600 / img.height, 1);
          const wLarge = Math.round(img.width * scaleLarge);
          const hLarge = Math.round(img.height * scaleLarge);

          canvas.width = wLarge;
          canvas.height = hLarge;
          ctx.drawImage(img, 0, 0, wLarge, hLarge);
          const imageDataLarge = ctx.getImageData(0, 0, wLarge, hLarge);

          const worker = getWorker();
          const id = Math.random().toString(36).slice(2);
          worker.onmessage = (e) => {
            if (e.data.type === "extract-full" && e.data.id === id) {
              setFullPalette(e.data.colors);
              setIsExtracting(false);
              resolve({ palette: colors, fullPalette: e.data.colors });
            }
          };
          worker.postMessage({
            type: "extract-full",
            id,
            pixelData: imageDataLarge.data,
            width: wLarge,
            height: hLarge,
          });
        };
        img.onerror = () => {
          setIsExtracting(false);
          reject(new Error("Failed to load image"));
        };
        img.src = URL.createObjectURL(file);
      });
    },
    [getWorker],
  );

  const clearPalette = useCallback(() => {
    setPalette(null);
    setFullPalette(null);
    setHarmonies(null);
  }, []);

  return { palette, fullPalette, harmonies, isExtracting, extractColors, clearPalette };
}
