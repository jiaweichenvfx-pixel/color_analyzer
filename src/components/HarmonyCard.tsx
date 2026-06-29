import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { HarmonyScheme, ExtractedColor } from "@/types/color";

interface HarmonyCardProps {
  scheme: HarmonyScheme;
}

function ColorDetail({ color, index }: { color: ExtractedColor; index: number }) {
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const copy = async (v: string, k: string) => {
    await navigator.clipboard.writeText(v);
    setCopied({ [k]: true });
    toast.success(`已复制 ${v}`);
    setTimeout(() => setCopied({}), 1500);
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-md border shrink-0 cursor-pointer"
        style={{ backgroundColor: color.hex }}
        onClick={() => copy(color.hex, `hex-${index}`)}
        title="点击复制 HEX"
      />
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-mono font-medium">{color.hex}</span>
        <div className="flex gap-2">
          <button
            onClick={() => copy(color.rgb, `rgb-${index}`)}
            className="text-[10px] text-slate-400 hover:text-slate-600"
          >
            {copied[`rgb-${index}`] ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              "RGB"
            )}
          </button>
          <button
            onClick={() => copy(color.hsl, `hsl-${index}`)}
            className="text-[10px] text-slate-400 hover:text-slate-600"
          >
            {copied[`hsl-${index}`] ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              "HSL"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function HarmonyCard({ scheme }: HarmonyCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          {scheme.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{scheme.description}</p>
      </CardHeader>
      <CardContent>
        <div className="h-8 rounded-md flex overflow-hidden mb-4">
          {scheme.colors.map((c, i) => (
            <div
              key={i}
              className="flex-1 cursor-pointer relative group"
              style={{ backgroundColor: c.hex }}
              onClick={() => {
                navigator.clipboard.writeText(c.hex);
                toast.success(`已复制 ${c.hex}`);
              }}
              title="点击复制"
            />
          ))}
        </div>
        <div className="space-y-2">
          {scheme.colors.map((c, i) => (
            <div key={i}>
              {i > 0 && <Separator className="my-2" />}
              <ColorDetail color={c} index={i} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
