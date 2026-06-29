import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadZoneProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export function ImageUploadZone({ onFileSelect, className }: ImageUploadZoneProps) {
  return (
    <div
      className={cn(
        "border-2 border-dashed border-slate-300 hover:border-violet-400 transition-colors bg-white/50 backdrop-blur-sm rounded-xl cursor-pointer",
        className,
      )}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) onFileSelect(file);
        };
        input.click();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelect(file);
      }}
    >
      <div className="p-8 sm:p-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-violet-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          点击或拖拽上传图片
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-xs">
          支持 JPG、PNG、GIF 等常见图片格式，图片将仅在本地处理，不会上传至服务器
        </p>
      </div>
    </div>
  );
}
