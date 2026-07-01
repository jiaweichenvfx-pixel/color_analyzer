# 配色分析器 Pro

> 双图对比 · 智能提取 · 配色互换 · LUT 导出 — 全部在浏览器本地完成

**[打开应用](https://jiaweichenvfx-pixel.github.io/color_analyzer)**

## 功能概览

### 智能配色提取
上传图片，自动提取主色调与完整调色板，按高光/中间调/暗部分类，显示色轮分布与占比。

### 双图配色互换
两张图片的调色板通过 Hungarian 算法按色调分区一对一配对，高斯混合 delta-preserving 实现无断层颜色迁移。

### 经典配色预设（75 个）

| 分类 | 数量 | 示例 |
|------|------|------|
| 胶片模拟 | 14 | Portra 160/400、Gold 200、Velvia 50、Cinestill 800T、Tri-X 400 |
| 导演风格 | 15 | Wes Anderson、Nolan、Fincher、Wong Kar-wai、Kubrick |
| 调色风格 | 17 | Teal & Orange、Cyberpunk、M31 LUT、Pastel Dream |
| 影视名作 | 5 | Blade Runner、The Matrix、Dune、Joker、Breaking Bad |
| 情绪氛围 | 12 | 深海悬念、哥谭暗夜、昭和回忆、午夜爵士 |
| 摄影风格 | 6 | Bright & Airy、Dark Moody、Bleach Bypass、Cross Process |
| 自然光影 | 5 | Blue Hour、Forest Mist、Coastal Light、Arctic Dawn |

上传图片后点击「应用」即时预览效果，拖拽滑块调整调色强度 (0–150%)。

### LUT 导出与测试
- 一键下载调色板 LUT 或互换 LUT (`.cube` 格式, 129³ 网格)
- 内置 LUT 测试工具：载入任意 `.cube` 文件预览调色效果
- 导出 LUT 可直接用于 DaVinci Resolve、Premiere Pro、Final Cut Pro、OBS

### 中性色保护
自动检测低色度像素（白墙/灰背景/黑阴影），保持中性不染色，色彩丰富区域不受影响。

## 技术栈

- **React 19** + **TypeScript** — UI 与类型安全
- **Vite** — 构建与开发服务器
- **Tailwind CSS** + **shadcn/ui** — 样式与组件
- **Web Workers** — 配色提取与颜色迁移不阻塞主线程
- **CIELAB 色彩空间** — 全部颜色运算在感知均匀空间中进行

## 本地运行

```bash
npm install
npm run dev      # 开发模式 → localhost:5174
npm run build    # 生产构建 → dist/
```

## 隐私

所有图片处理均在浏览器本地完成，不会上传至任何服务器。
