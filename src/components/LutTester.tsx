import { useState, useRef, useCallback } from "react";
import { Upload, Download, X, Loader2, Image, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { parseCube, applyLutToImageData } from "@/lib/lut-applier";

export function LutTester() {
  const [image, setImage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [lutFile, setLutFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const lutInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage({ file, dataUrl: reader.result as string });
      setPreviewUrl(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleLutUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLutFile(file);
      setPreviewUrl(null);
      toast.success(`已加载 LUT: ${file.name}`);
    }
  }, []);

  const handleApply = useCallback(async () => {
    if (!lutFile || !image) return;

    setProcessing(true);
    try {
      const lutText = await lutFile.text();
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
      toast.success(`LUT (${lut.size}³) 应用完成`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "LUT 处理失败");
    } finally {
      setProcessing(false);
    }
  }, [lutFile, image]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = "lut-result.png";
    a.click();
  }, [previewUrl]);

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };
  const clearLut = () => {
    setLutFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
      <h2 className="text-base font-semibold text-slate-800">LUT 测试工具</h2>
      <p className="text-xs text-slate-400">上传图片和 .cube LUT 文件，直接预览调色效果</p>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-wrap items-center gap-3">
        {/* Image upload */}
        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <input
          ref={lutInputRef}
          type="file"
          accept=".cube"
          onChange={handleLutUpload}
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
              <FileImage className="w-3 h-3 shrink-0" />
              {image.file.name}
            </span>
            <button onClick={clearImage} className="text-slate-400 hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {!lutFile ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => lutInputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" />
            载入 .cube LUT
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-violet-600 bg-violet-50 rounded px-2 py-1 font-mono max-w-[180px] truncate">
              {lutFile.name}
            </span>
            <button onClick={clearLut} className="text-slate-400 hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {image && lutFile && (
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

      {/* Image preview before LUT apply */}
      {image && !previewUrl && (
        <Card className="overflow-hidden border-dashed">
          <CardContent className="p-0">
            <img
              src={image.dataUrl}
              alt="Uploaded"
              className="w-full max-h-80 object-contain bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYPj/n4EBAwPD/wYGBoYnT54wMDAwMDIwMDAwMDIwMDAwMDIwMDAwMDAwMDAwMDCgBgAEXwMBG8Yy4gAAAABJRU5ErkJggg==')]"
            />
          </CardContent>
        </Card>
      )}

      {/* Before/after comparison */}
      {previewUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs text-slate-500">原图</span>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={image!.dataUrl}
                  alt="Original"
                  className="w-full h-64 object-contain bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYPj/n4EBAwPD/wYGBoYnT54wMDAwMDIwMDAwMDIwMDAwMDIwMDAwMDAwMDAwMDCgBgAEXwMBG8Yy4gAAAABJRU5ErkJggg==')]"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-violet-600 font-medium">LUT 结果</span>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1 text-xs">
                <Download className="w-3 h-3" />
                下载结果
              </Button>
            </div>
            <Card className="overflow-hidden border-violet-200">
              <CardContent className="p-0">
                <img
                  src={previewUrl}
                  alt="LUT applied"
                  className="w-full h-64 object-contain bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2NkYPj/n4EBAwPD/wYGBoYnT54wMDAwMDIwMDAwMDIwMDAwMDIwMDAwMDAwMDAwMDCgBgAEXwMBG8Yy4gAAAABJRU5ErkJggg==')]"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
