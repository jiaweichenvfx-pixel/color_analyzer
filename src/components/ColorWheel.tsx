import { useMemo } from "react";
import type { ExtractedColor } from "@/types/color";

interface ColorWheelProps {
  colors: ExtractedColor[];
  size?: number;
}

export function ColorWheel({ colors, size = 260 }: ColorWheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.4;
  const innerR = outerR * 0.38;
  const pieR = innerR * 0.9;

  const wedges = useMemo(() => {
    const result = [];
    for (let h = 0; h < 360; h++) {
      const a1 = ((h - 90) * Math.PI) / 180;
      const a2 = ((h + 1 - 90) * Math.PI) / 180;
      const x1o = cx + outerR * Math.cos(a1);
      const y1o = cy + outerR * Math.sin(a1);
      const x2o = cx + outerR * Math.cos(a2);
      const y2o = cy + outerR * Math.sin(a2);
      const x1i = cx + innerR * Math.cos(a1);
      const y1i = cy + innerR * Math.sin(a1);
      const x2i = cx + innerR * Math.cos(a2);
      const y2i = cy + innerR * Math.sin(a2);
      result.push({
        d: `M${x1o},${y1o}L${x2o},${y2o}A${outerR},${outerR} 0 0 1 ${x1o},${y1o}L${x2i},${y2i}A${innerR},${innerR} 0 0 0 ${x1i},${y1i}Z`,
        fill: `hsl(${h}, 100%, 50%)`,
      });
    }
    return result;
  }, [cx, cy, outerR, innerR]);

  const pieSegments = useMemo(() => {
    if (colors.length === 0) return [];
    let startAngle = -90;
    return colors.map((c) => {
      const sweep = (c.percentage / 100) * 360;
      const endAngle = startAngle + sweep;
      const a1 = (startAngle * Math.PI) / 180;
      const a2 = (endAngle * Math.PI) / 180;
      const x1 = cx + pieR * Math.cos(a1);
      const y1 = cy + pieR * Math.sin(a1);
      const x2 = cx + pieR * Math.cos(a2);
      const y2 = cy + pieR * Math.sin(a2);
      const large = sweep > 180 ? 1 : 0;
      const path = `M${cx},${cy}L${x1},${y1}A${pieR},${pieR} 0 ${large} 1 ${x2},${y2}Z`;
      const result = { path, fill: c.hex };
      startAngle = endAngle;
      return result;
    });
  }, [colors, cx, cy, pieR]);

  // Markers on the outer ring for each color
  const markers = useMemo(() => {
    return colors.map((c) => {
      const angle = ((c.h - 90) * Math.PI) / 180;
      const mr = outerR * 1.08;
      return {
        x: cx + mr * Math.cos(angle),
        y: cy + mr * Math.sin(angle),
        color: c.hex,
        label: `${c.h}°`,
        textFill: c.l > 50 ? "#333" : "white",
      };
    });
  }, [colors, cx, cy, outerR]);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* HSL ring */}
        {wedges.map((w, i) => (
          <path key={i} d={w.d} fill={w.fill} stroke="none" />
        ))}
        {/* White center fill */}
        <circle cx={cx} cy={cy} r={innerR * 0.95} fill="white" />
        {/* Pie chart */}
        {pieSegments.map((p, i) => (
          <path key={i} d={p.path} fill={p.fill} stroke="white" strokeWidth={1} />
        ))}
        {/* Center circle */}
        <circle cx={cx} cy={cy} r={innerR * 0.5} fill="white" />
        {/* Labels */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="#64748b">
          色轮
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fill="#64748b">
          HSL
        </text>
        {/* Markers */}
        {markers.map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r={size * 0.03} fill={m.color} stroke="white" strokeWidth={2} />
            <text x={m.x} y={m.y + 4} textAnchor="middle" fontSize="9" fill={m.textFill}>
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-xs text-slate-400 mt-2 text-center">
        外圈标记表示各颜色在色轮上的位置，内圈显示占比分布
      </p>
    </div>
  );
}
