import { useState, useRef, useCallback } from "react";
import { Upload, Download, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { parseCube, applyLutToImageData } from "@/lib/lut-applier";

interface LutPreviewProps {
  imageDataUrl: string | null;
  imageLabel: string;
}

export function LutPreview({ imageDataUrl, imageLabel }: LutPreviewProps) {
  const [lutFile, setLutFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLutUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLutFile(file);
      setPreviewUrl(null);
      toast.success(`已加载: ${file.name}`);
    }
  }, []);

  const handleApply = useCallback(async () => {
    if (!lutFile || !imageDataUrl) return;

    setProcessing(true);
    try {
      const lutText = await lutFile.text();
      const lut = parseCube(lutText);
      toast.success(`LUT 解析成功: ${lut.size}³`);

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageDataUrl;
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
      toast.success("LUT 应用完成");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "LUT 处理失败");
    } finally {
      setProcessing(false);
    }
  }, [lutFile, imageDataUrl]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `lut-preview-${imageLabel}.png`;
    a.click();
  }, [previewUrl, imageLabel]);

  const clearLut = useCallback(() => {
    setLutFile(null);
    setPreviewUrl(null);
  }, []);

  if (!imageDataUrl) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <p className="text-sm text-slate-400 text-center">上传图片后可在此测试 LUT 效果</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
      <h2 className="text-base font-semibold text-slate-800">LUT 测试</h2>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept=".cube"
          onChange={handleLutUpload}
          className="hidden"
          id={`lut-upload-${imageLabel}`}
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-3.5 h-3.5" />
          载入 .cube LUT
        </Button>

        {lutFile && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 bg-slate-100 rounded px-2 py-1 font-mono max-w-[180px] truncate">
              {lutFile.name}
            </span>
            <button onClick={clearLut} className="text-slate-400 hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {lutFile && (
          <Button
            size="sm"
            onClick={handleApply}
            disabled={processing}
            className="gap-1.5 bg-violet-500 hover:bg-violet-600 text-white"
          >
            {processing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "应用 LUT"
            )}
          </Button>
        )}
      </div>

      {previewUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs text-slate-500">原图</span>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={imageDataUrl}
                  alt="Original"
                  className="w-full h-52 object-contain bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYPj/n4EBAwPD/wYGBoYnT54wMDAwMDIwMDAwMDIwMDAwMDIwMDAwMDAwMDAwMDCgBgAEXwMBG8Yy4gAAAABJRU5ErkJggg==')]"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-violet-600 font-medium">LUT 应用结果</span>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1 text-xs">
                <Download className="w-3 h-3" />
                下载
              </Button>
            </div>
            <Card className="overflow-hidden border-violet-200">
              <CardContent className="p-0">
                <img
                  src={previewUrl}
                  alt="LUT applied"
                  className="w-full h-52 object-contain bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYPj/n4EBAwPD/wYGBoYnT54wMDAwMDIwMDAwMDIwMDAwMDIwMDAwMDAwMDAwMDCgBgAEXwMBG8Yy4gAAAABJRU5ErkJggg==')]"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
