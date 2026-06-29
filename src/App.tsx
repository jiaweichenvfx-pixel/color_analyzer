import { useState, useCallback } from "react";
import { Palette, Sparkles } from "lucide-react";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { ImagePanel } from "@/components/ImagePanel";
import { PaletteBar } from "@/components/PaletteBar";
import { PaletteCompare } from "@/components/PaletteCompare";
import { ColorWheel } from "@/components/ColorWheel";
import { HarmonyTabs } from "@/components/HarmonyTabs";
import { SwapControls } from "@/components/SwapControls";
import { SwapResultView } from "@/components/SwapResultView";
import { LutPreview } from "@/components/LutPreview";
import { LutTester } from "@/components/LutTester";
import { Separator } from "@/components/ui/separator";
import { useImageColors } from "@/hooks/use-image-colors";
import { useColorTransfer } from "@/hooks/use-color-transfer";
import type { ImageState } from "@/types/color";

function createEmptyState(id: "a" | "b"): ImageState {
  return { id, dataUrl: null, palette: null, fullPalette: null, harmonies: null, isExtracting: false };
}

export default function App() {
  const [imageA, setImageA] = useState<ImageState>(createEmptyState("a"));
  const [imageB, setImageB] = useState<ImageState>(createEmptyState("b"));
  const [selectedImage, setSelectedImage] = useState<"a" | "b">("a");

  const colorsA = useImageColors();
  const colorsB = useImageColors();
  const transfer = useColorTransfer();

  const handleFileA = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setImageA((s) => ({ ...s, dataUrl, isExtracting: true }));
        try {
          const result = await colorsA.extractColors(file);
          setImageA((s) => ({
            ...s,
            palette: result.palette,
            fullPalette: result.fullPalette,
            harmonies: colorsA.harmonies,
            isExtracting: false,
          }));
          toast.success("图片 A 配色分析完成！");
        } catch {
          setImageA((s) => ({ ...s, isExtracting: false }));
          toast.error("图片 A 配色分析失败");
        }
      };
      reader.readAsDataURL(file);
    },
    [colorsA],
  );

  const handleFileB = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setImageB((s) => ({ ...s, dataUrl, isExtracting: true }));
        try {
          const result = await colorsB.extractColors(file);
          setImageB((s) => ({
            ...s,
            palette: result.palette,
            fullPalette: result.fullPalette,
            harmonies: colorsB.harmonies,
            isExtracting: false,
          }));
          toast.success("图片 B 配色分析完成！");
        } catch {
          setImageB((s) => ({ ...s, isExtracting: false }));
          toast.error("图片 B 配色分析失败");
        }
      };
      reader.readAsDataURL(file);
    },
    [colorsB],
  );

  const handleClearA = useCallback(() => {
    colorsA.clearPalette();
    setImageA(createEmptyState("a"));
  }, [colorsA]);

  const handleClearB = useCallback(() => {
    colorsB.clearPalette();
    setImageB(createEmptyState("b"));
  }, [colorsB]);

  const handleSwap = useCallback(
    async (direction: "a-to-b" | "b-to-a") => {
      const sourceId = direction === "a-to-b" ? "a" : "b";
      const targetId = direction === "a-to-b" ? "b" : "a";
      const source = sourceId === "a" ? imageA : imageB;
      const target = targetId === "a" ? imageA : imageB;

      if (!source.fullPalette || !target.fullPalette || !target.dataUrl) {
        toast.error("请先上传两张图片并完成配色分析");
        return;
      }

      const nPairs = Math.min(source.fullPalette.length, target.fullPalette.length);
      toast.info(`正在建立 ${nPairs} 组颜色映射...`);
      try {
        await transfer.apply(
          sourceId,
          targetId,
          source.fullPalette,
          target.fullPalette,
          target.dataUrl,
        );
        toast.success(`配色互换完成 (${nPairs} 对映射)`);
      } catch {
        toast.error("配色互换失败");
      }
    },
    [imageA, imageB, transfer],
  );

  const hasAnyImage = imageA.dataUrl || imageB.dataUrl;
  const hasBothPalettes = !!imageA.palette && !!imageB.palette;
  const selectedPalette =
    selectedImage === "a" ? imageA.palette : imageB.palette;
  const selectedHarmonies =
    selectedImage === "a" ? imageA.harmonies : imageB.harmonies;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              配色分析器 Pro
            </h1>
          </div>
          <span className="text-sm text-slate-500 hidden sm:block">
            双图对比 · 智能提取 · 配色互换
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dual image panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImagePanel
            label="图片 A"
            state={imageA}
            onFileSelect={handleFileA}
            onClear={handleClearA}
          />
          <ImagePanel
            label="图片 B"
            state={imageB}
            onFileSelect={handleFileB}
            onClear={handleClearB}
          />
        </div>

        {/* Single palette display (when only one image) */}
        {hasAnyImage && !hasBothPalettes && selectedPalette && (
          <>
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <PaletteBar colors={selectedPalette} label="提取的配色" showLutDownload lutColors={selectedImage === "a" ? imageA.fullPalette || undefined : imageB.fullPalette || undefined} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium text-slate-700">色轮分布</h3>
                </div>
                <div className="p-6 flex justify-center">
                  <ColorWheel colors={selectedPalette} />
                </div>
              </div>

              <div>
                {selectedHarmonies && (
                  <HarmonyTabs harmonies={selectedHarmonies} />
                )}
              </div>
            </div>
          </>
        )}

        {/* Dual palette compare + swap */}
        {hasBothPalettes && (
          <>
            <PaletteCompare paletteA={imageA.palette!} paletteB={imageB.palette!} fullPaletteA={imageA.fullPalette} fullPaletteB={imageB.fullPalette} />

            <SwapControls
              hasBothPalettes={hasBothPalettes}
              isProcessing={transfer.isProcessing}
              onSwap={handleSwap}
              activeDirection={
                transfer.isProcessing
                  ? transfer.result?.sourceId === "a"
                    ? "a-to-b"
                    : "b-to-a"
                  : null
              }
            />

            {transfer.result && (
              <SwapResultView
                result={transfer.result}
                imageA={imageA}
                imageB={imageB}
              />
            )}

            {/* LUT test panel */}
            <LutPreview
              imageDataUrl={
                selectedImage === "a" ? imageA.dataUrl : imageB.dataUrl
              }
              imageLabel={selectedImage === "a" ? "A" : "B"}
            />

            <Separator />

            {/* Selected image detail */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">查看配色方案：</span>
              <button
                onClick={() => setSelectedImage("a")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedImage === "a"
                    ? "bg-violet-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                图片 A
              </button>
              <button
                onClick={() => setSelectedImage("b")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedImage === "b"
                    ? "bg-violet-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                图片 B
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium text-slate-700">色轮分布</h3>
                </div>
                <div className="p-6 flex justify-center">
                  <ColorWheel colors={selectedPalette!} />
                </div>
              </div>

              <div>
                {selectedHarmonies && (
                  <HarmonyTabs harmonies={selectedHarmonies} />
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Standalone LUT Tester */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <LutTester />
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          所有图片处理均在浏览器本地完成，不会上传至服务器
        </div>
      </footer>
    </div>
  );
}
