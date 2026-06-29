import { X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ImageState } from "@/types/color";
import { ImageUploadZone } from "./ImageUploadZone";

interface ImagePanelProps {
  label: string;
  state: ImageState;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export function ImagePanel({ label, state, onFileSelect, onClear }: ImagePanelProps) {
  if (!state.dataUrl) {
    return (
      <div>
        <div className="text-sm font-medium text-slate-500 mb-3">{label}</div>
        <ImageUploadZone onFileSelect={onFileSelect} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClear}>
            <X className="w-3 h-3" />
            清除
          </Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={state.dataUrl}
              alt={label}
              className="w-full h-48 object-cover"
            />
            {state.isExtracting && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-white text-sm">分析中...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
