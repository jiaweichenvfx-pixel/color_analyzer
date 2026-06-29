import { useState, useMemo, useRef, useCallback } from "react";
import { Download, Palette, Tag, Upload, Image, X, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { colorPresets, presetCategories } from "@/data/presets";
import { generatePaletteCubeLut } from "@/lib/lut-generator";
import { parseCube, applyLutToImageData } from "@/lib/lut-applier";
import { rgbToLab } from "@/lib/color-converters";
import type { ExtractedColor } from "@/types/color";

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function toExtractedColors(hexes: string[]): ExtractedColor[] {
  return hexes.map((hex, i) => {
    const [r, g, b] = hexToRgb(hex);
    return {
      hex,
      rgb: `rgb(${r},${g},${b})`,
      hsl: "",
      h: 0,
      s: 0,
      l: 0,
      lab: rgbToLab(r, g, b),
      count: 0,
      percentage: 0,
      tonalRange: (["highlight", "midtone", "shadow"] as const)[i % 3],
    };
  });
}

export function PresetPicker() {
  const [activeCategory, setActiveCategory] = useState<string>(presetCategories[0]);
  const [image, setImage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => colorPresets.filter((p) => p.category === activeCategory),
    [activeCategory],
  );

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage({ file, dataUrl: reader.result as string });
      setPreviewUrl(null);
      setActivePreset(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setActivePreset(null);
  };

  const applyPreset = useCallback(
    async (preset: typeof colorPresets[number]) => {
      if (!image) return;
      setProcessing(true);
      setActivePreset(preset.name);
      try {
        // Generate LUT text from preset colors
        const colors = toExtractedColors(preset.hex);
        const lutText = generatePaletteCubeLut(colors, undefined, 65);

        // Parse and apply in-memory (no file download needed)
        const lut = parseCube(lutText);

        const img = new window.Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("图片加载失败"));
          img.src = image.dataUrl;
        });

        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const result = applyLutToImageData(imageData, lut);
        ctx.putImageData(result, 0, 0);

        const url = canvas.toDataURL("image/png");
        setPreviewUrl(url);
        toast.success(`${preset.name} 预设已应用`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "应用预设失败");
      } finally {
        setProcessing(false);
      }
    },
    [image],
  );

  const handleDownload = (preset: typeof colorPresets[number]) => {
    const colors = toExtractedColors(preset.hex);
    const lut = generatePaletteCubeLut(colors, undefined, 65);
    const blob = new Blob([lut], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preset-${preset.name.replace(/\s+/g, "-").toLowerCase()}-65.cube`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已下载 ${preset.name} .cube`);
  };

  const handleDownloadResult = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `preset-${activePreset || "result"}.png`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center gap-2 mb-2">
        <Palette className="w-5 h-5 text-violet-500" />
        <h2 className="text-base font-semibold text-slate-800">经典配色预设</h2>
        <span className="text-xs text-slate-400">上传图片 → 点击预设立即预览</span>
      </div>

      {/* Image upload + result row */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {!image ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => imgInputRef.current?.click()}
          >
            <Image className="w-3.5 h-3.5" />
            上传图片
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 bg-slate-100 rounded px-2 py-1 max-w-[160px] truncate flex items-center gap-1">
              <Image className="w-3 h-3 shrink-0" />
              {image.file.name}
            </span>
            <button onClick={clearImage} className="text-slate-400 hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {activePreset && (
          <span className="text-xs text-violet-600 bg-violet-50 rounded px-2 py-1">
            当前: {activePreset}
          </span>
        )}
        {processing && <Loader2 className="w-4 h-4 animate-spin text-violet-500" />}
        {previewUrl && (
          <Button variant="outline" size="sm" onClick={handleDownloadResult} className="gap-1 text-xs">
            <Download className="w-3 h-3" />
            下载结果
          </Button>
        )}
      </div>

      {/* Image preview + result comparison */}
      {image && (
        <div className={previewUrl ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}>
          <div className="space-y-1">
            {previewUrl && <span className="text-xs text-slate-500">原图</span>}
            <Card className="overflow-hidden border-dashed">
              <CardContent className="p-0">
                <img
                  src={image.dataUrl}
                  alt="Uploaded"
                  className={cn("w-full object-contain bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYPj/n4EBAwPD/wYGBoYnT54wMDAwMDIwMDAwMDIwMDAwMDIwMDAwMDAwMDAwMDCgBgAEXwMBG8Yy4gAAAABJRU5ErkJggg==')]", previewUrl ? "h-64" : "max-h-60")}
                />
              </CardContent>
            </Card>
          </div>
          {previewUrl && (
            <div className="space-y-1">
              <span className="text-xs text-violet-600 font-medium">{activePreset} 效果</span>
              <Card className="overflow-hidden border-violet-200">
                <CardContent className="p-0">
                  <img
                    src={previewUrl}
                    alt="Preset applied"
                    className="w-full h-64 object-contain bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYPj/n4EBAwPD/wYGBoYnT54wMDAwMDIwMDAwMDIwMDAwMDIwMDAwMDAwMDAwMDCgBgAEXwMBG8Yy4gAAAABJRU5ErkJggg==')]"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {presetCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              activeCategory === cat
                ? "bg-violet-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            <Tag className="w-3 h-3 inline mr-1" />
            {cat}
          </button>
        ))}
      </div>

      {/* Preset cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((preset) => (
          <div
            key={preset.name}
            className={cn(
              "border rounded-lg hover:shadow-sm transition-all group",
              activePreset === preset.name
                ? "border-violet-400 ring-1 ring-violet-200"
                : "border-slate-200 hover:border-violet-300",
            )}
          >
            {/* Color swatches */}
            <div className="flex h-10 rounded-t-lg overflow-hidden">
              {preset.hex.map((h, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: h }}
                  title={h}
                />
              ))}
            </div>
            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{preset.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{preset.description}</p>
              <div className="flex gap-1 pt-1 flex-wrap">
                {preset.hex.map((h) => (
                  <span
                    key={h}
                    className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1 rounded"
                  >
                    {h}
                  </span>
                ))}
              </div>
              <div className="flex gap-1 pt-1">
                {image && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    disabled={processing}
                    className="flex-1 gap-1 text-xs border-violet-200 text-violet-600 hover:bg-violet-50"
                  >
                    {processing && activePreset === preset.name ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    应用
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(preset)}
                  className={cn("gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity", image ? "flex-none" : "w-full")}
                >
                  <Download className="w-3 h-3" />
                  .cube
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
