import { useState, useCallback, useRef } from "react";
import type { ExtractedColor, HarmonyScheme } from "@/types/color";
import { generateHarmonies } from "@/lib/harmony";
import { extractColorsFromPixelData } from "@/lib/extraction";

interface UseImageColorsReturn {
  palette: ExtractedColor[] | null;
  harmonies: HarmonyScheme[] | null;
  isExtracting: boolean;
  extractColors: (file: File) => Promise<ExtractedColor[]>;
  clearPalette: () => void;
}

export function useImageColors(): UseImageColorsReturn {
  const [palette, setPalette] = useState<ExtractedColor[] | null>(null);
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
    (file: File): Promise<ExtractedColor[]> => {
      return new Promise((resolve, reject) => {
        setIsExtracting(true);
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(200 / img.width, 200 / img.height);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);

          // Run extraction synchronously (fast enough for 200px images)
          // Worker is an option for larger images
          const colors = extractColorsFromPixelData(imageData.data, w, h);

          if (colors.length === 0) {
            setIsExtracting(false);
            reject(new Error("No colors found"));
            return;
          }

          setPalette(colors);
          const hms = generateHarmonies(colors[0]);
          setHarmonies(hms);
          setIsExtracting(false);
          resolve(colors);
        };
        img.onerror = () => {
          setIsExtracting(false);
          reject(new Error("Failed to load image"));
        };
        img.src = URL.createObjectURL(file);
      });
    },
    [],
  );

  const clearPalette = useCallback(() => {
    setPalette(null);
    setHarmonies(null);
  }, []);

  return { palette, harmonies, isExtracting, extractColors, clearPalette };
}
