export interface ColorPreset {
  name: string;
  category: string;
  description: string;
  hex: string[];
}

export const colorPresets: ColorPreset[] = [
  // ══════════ 电影胶片模拟 ══════════
  {
    name: "Portra 160",
    category: "胶片模拟",
    description: "Kodak 暖肤、粉彩、低对比度人像",
    hex: ["#E8C4A2", "#C49A76", "#A8B8C8", "#7B9EB3", "#4A6A7D"],
  },
  {
    name: "Portra 400",
    category: "胶片模拟",
    description: "Kodak 暖调、饱和但柔和、万能通用",
    hex: ["#F0C9A2", "#D4A06A", "#9FB3C8", "#6B8BA8", "#3D5A7A"],
  },
  {
    name: "Gold 200",
    category: "胶片模拟",
    description: "Kodak 金色暖黄、标志性日常卷",
    hex: ["#F4D03F", "#D4A354", "#B8860B", "#8B7355", "#6B5344"],
  },
  {
    name: "Ektar 100",
    category: "胶片模拟",
    description: "Kodak 高饱和、深红蓝、风光强片",
    hex: ["#C0392B", "#E67E22", "#2E86C1", "#1A5276", "#117A65"],
  },
  {
    name: "Superia 400",
    category: "胶片模拟",
    description: "Fuji 冷绿偏移、强对比、青阴影",
    hex: ["#2ECC71", "#3498DB", "#7FB3D8", "#1A5276", "#145A32"],
  },
  {
    name: "Pro 400H",
    category: "胶片模拟",
    description: "Fuji 柔和粉彩绿、透气肤色",
    hex: ["#A9DFBF", "#D4EFDF", "#FADBD8", "#E8C4A2", "#7DCEA0"],
  },
  {
    name: "Velvia 50",
    category: "胶片模拟",
    description: "Fuji 超饱和、深绿蓝、风光极致色",
    hex: ["#1E8449", "#27AE60", "#F39C12", "#E74C3C", "#2C3E50"],
  },
  {
    name: "Kodachrome 64",
    category: "胶片模拟",
    description: "标志性暖红、金黄、历史厚重感",
    hex: ["#C0392B", "#F5B041", "#D4AC0D", "#2C3E50", "#7B7D7D"],
  },
  {
    name: "Polaroid 600",
    category: "胶片模拟",
    description: "褪色暖调、洋红偏绿位移感",
    hex: ["#F5D6C6", "#E8B4B8", "#C9E4DE", "#A8C8C0", "#8B9DAF"],
  },
  {
    name: "Fuji Instax",
    category: "胶片模拟",
    description: "冷粉彩调、青偏移浅影",
    hex: ["#D4E6F1", "#AED6F1", "#FADBD8", "#E8C8D8", "#85C1E9"],
  },
  {
    name: "Cinestill 800T",
    category: "胶片模拟",
    description: "钨丝灯卷、暖黄高光、青蓝暗部、电影感夜拍",
    hex: ["#F5A623", "#E8853B", "#3B6B8A", "#1A3A5A", "#0A1A2A"],
  },
  {
    name: "Tri-X 400",
    category: "胶片模拟",
    description: "Kodak 经典颗粒、丰厚黑色、纪实摄影之魂",
    hex: ["#0A0A0A", "#1A1A1A", "#3D3D3D", "#8A8A8A", "#D0D0D0"],
  },
  {
    name: "Ilford HP5",
    category: "胶片模拟",
    description: "柔韧对比、宽泛灰阶、灵活暗房风格",
    hex: ["#050505", "#252525", "#555555", "#999999", "#E0E0E0"],
  },
  {
    name: "Kodak Aerochrome",
    category: "胶片模拟",
    description: "红外假色、红外粉红、绿变青、天空金橙",
    hex: ["#FF69B4", "#FF1493", "#00CED1", "#FF8C00", "#8B0000"],
  },

  // ══════════ 导演签名色 ══════════
  {
    name: "Wes Anderson",
    category: "导演风格",
    description: "高饱和粉彩、对称暖黄粉红",
    hex: ["#F9E79F", "#F5B7B1", "#85C1E9", "#E74C3C", "#D7BDE2"],
  },
  {
    name: "David Fincher",
    category: "导演风格",
    description: "暗绿偏移、黄高光、低饱和冷色",
    hex: ["#1A3A2A", "#2E5A3E", "#C8A84A", "#7B8B6A", "#0D0D0D"],
  },
  {
    name: "Nolan",
    category: "导演风格",
    description: "冷影、暖高光、钢蓝去饱和肤色",
    hex: ["#1B2631", "#5D6D7E", "#D4AC0D", "#A8A8A8", "#2C3E50"],
  },
  {
    name: "Refn Neon",
    category: "导演风格",
    description: "霓虹洋红、高对比、赛博朋克夜",
    hex: ["#FF0080", "#FF00FF", "#00F0FF", "#0B001A", "#1A0030"],
  },
  {
    name: "Deakins Natural",
    category: "导演风格",
    description: "自然去饱和、大地棕灰、低调均衡",
    hex: ["#8B7355", "#6B7B8D", "#A8B8A0", "#C4B5A0", "#4A5A4A"],
  },
  {
    name: "Spielberg",
    category: "导演风格",
    description: "金色背光、暖琥珀、光辉高亮",
    hex: ["#F5B041", "#E67E22", "#F39C12", "#D4AC0D", "#2C3E50"],
  },
  {
    name: "Hitchcock Noir",
    category: "导演风格",
    description: "强阴影、戏剧对比、深黑红点缀",
    hex: ["#0D0D0D", "#1A1A1A", "#8B0000", "#C0C0C0", "#4A4A4A"],
  },
  {
    name: "Tim Burton",
    category: "导演风格",
    description: "哥特暗影、冷蓝紫、高对比奇幻恐怖",
    hex: ["#1A1A2E", "#2D2D5A", "#4A3A6A", "#8A8AAA", "#E8E0F0"],
  },
  {
    name: "Zack Snyder",
    category: "导演风格",
    description: "去饱和暗调、青铜质感、史诗沉重感",
    hex: ["#1A1A1A", "#3A3530", "#6B5B4A", "#9B8B7A", "#C8B8A8"],
  },
  {
    name: "Ridley Scott",
    category: "导演风格",
    description: "冷蓝青影、去饱和大气、史诗科幻",
    hex: ["#0A1A2A", "#1A3A5A", "#4A6A8A", "#8A9AAA", "#C8D0D8"],
  },
  {
    name: "Alfonso Cuaron",
    category: "导演风格",
    description: "自然暖色、手持纪实感、温柔光晕",
    hex: ["#2A2A1A", "#5A4A3A", "#8A6B5A", "#C8A898", "#F0E8D8"],
  },
  {
    name: "Kubrick",
    category: "导演风格",
    description: "对称冷白、深黑、精准对比、红点缀",
    hex: ["#0A0A0A", "#2A2A2A", "#C8C8C8", "#F0F0F0", "#C03030"],
  },
  {
    name: "Tarantino",
    category: "导演风格",
    description: "高饱和原色、红黄冲击、复古胶片热",
    hex: ["#CC0000", "#FFCC00", "#1A1A1A", "#F5F0E0", "#8B4513"],
  },
  {
    name: "Miyazaki",
    category: "导演风格",
    description: "清新蓝绿、暖阳光、柔和自然如水彩",
    hex: ["#87CEEB", "#98FB98", "#F5DEB3", "#FFB6C1", "#4682B4"],
  },
  {
    name: "Wong Kar-wai",
    category: "导演风格",
    description: "霓虹红绿、潮湿迷离、港式怀旧饱和",
    hex: ["#CC0033", "#00AA55", "#FFD700", "#1A0A2A", "#F5E0D0"],
  },

  // ══════════ 流行调色风格 ══════════
  {
    name: "Teal & Orange",
    category: "调色风格",
    description: "青橙互补、好莱坞大片标配",
    hex: ["#FF7B3D", "#F97316", "#EA580C", "#0D9488", "#0891B2"],
  },
  {
    name: "M31 LUT",
    category: "调色风格",
    description: "最经典青橙预设 — 暖肤冷影",
    hex: ["#FF8C42", "#FFB380", "#C4A882", "#007C8A", "#004D5A"],
  },
  {
    name: "Golden Hour",
    category: "调色风格",
    description: "暖琥珀、夕阳金辉、怀旧温暖",
    hex: ["#F5B041", "#D88A4A", "#F2C57C", "#6B3F2B", "#2B1D14"],
  },
  {
    name: "Moody Urban",
    category: "调色风格",
    description: "雨天街景、深蓝灰、情绪暗调",
    hex: ["#0E1116", "#2C2F3A", "#6B6F7A", "#C8B59A", "#F2EEE7"],
  },
  {
    name: "Cyberpunk",
    category: "调色风格",
    description: "霓虹洋红、暗紫蓝、赛博夜色",
    hex: ["#0B0F1A", "#1C2A5A", "#FF2D95", "#FF00FF", "#2DE2E6"],
  },
  {
    name: "Vintage Film",
    category: "调色风格",
    description: "褪色棕褐、软高光、胶片年代感",
    hex: ["#2A2521", "#6A5B4D", "#B79C7A", "#DCCFB8", "#F4F0E6"],
  },
  {
    name: "Film Noir",
    category: "调色风格",
    description: "极高对比、深黑、银灰单色阶",
    hex: ["#050505", "#1A1A1A", "#3D3D3D", "#A8A8A8", "#F2F2F2"],
  },
  {
    name: "Emerald Forest",
    category: "调色风格",
    description: "深翡翠绿、幽暗森林、寂静自然",
    hex: ["#06110C", "#0F2B1E", "#1E5A3E", "#7E9F7C", "#E7EFE8"],
  },
  {
    name: "Pastel Dream",
    category: "调色风格",
    description: "柔和粉彩、梦幻浅粉紫蓝",
    hex: ["#2A2A33", "#7B7E9C", "#E8B7C8", "#BFE6E3", "#FBF6F2"],
  },
  {
    name: "Rust & Steel",
    category: "调色风格",
    description: "锈红铁灰、工业风、粗犷力量",
    hex: ["#141414", "#3A3F44", "#7A4B3A", "#C66B3D", "#F2D3B1"],
  },
  {
    name: "Frosted Sci-Fi",
    category: "调色风格",
    description: "冰冷蓝白、未来感、极简科幻",
    hex: ["#0B0E12", "#2B3A67", "#6F8FDB", "#CFE3FF", "#EDEFF5"],
  },
  {
    name: "Smoke & Whiskey",
    category: "调色风格",
    description: "烟熏琥珀、威士忌熟成暖、成熟深沉",
    hex: ["#0F0C0A", "#3B2A1E", "#7A5636", "#C29B6C", "#EFE5D6"],
  },
  {
    name: "Desert Western",
    category: "调色风格",
    description: "荒土棕橙、日晒干裂、西部荒野",
    hex: ["#2A2018", "#7A4B2C", "#C07E4A", "#E6C9A6", "#8A8F6A"],
  },
  {
    name: "Velvet Romance",
    category: "调色风格",
    description: "深红丝绒、浪漫柔紫、戏剧舞台",
    hex: ["#1B0B13", "#4A0F2A", "#8B2C4A", "#D9A4A8", "#F6E9E6"],
  },
  {
    name: "Sapphire & Sand",
    category: "调色风格",
    description: "蓝宝石金滩、精致高级感",
    hex: ["#0A1020", "#153B6A", "#2F73B8", "#E3C7A6", "#F7F1E7"],
  },
  {
    name: "Autumn Roadtrip",
    category: "调色风格",
    description: "秋色棕橘、落叶暖途、舒适慵懒",
    hex: ["#1D1A17", "#4C3427", "#9B5B3A", "#D9A36A", "#F3E6D3"],
  },
  {
    name: "Monochrome",
    category: "调色风格",
    description: "纯灰度阶、极简黑白灰、冷峻",
    hex: ["#050505", "#1B1B1B", "#3D3D3D", "#A8A8A8", "#F2F2F2"],
  },

  // ══════════ 情绪氛围 ══════════
  // (moved here to keep categories contiguous)

  // ══════════ 情绪氛围 ══════════
  {
    name: "深海悬念",
    category: "情绪氛围",
    description: "深邃海洋蓝绿、紧张与神秘感",
    hex: ["#08121A", "#0F2D3A", "#1E6F7D", "#7BC6C9", "#E7F3F2"],
  },
  {
    name: "午夜狂欢",
    category: "情绪氛围",
    description: "紫色暗夜霓虹、华丽与狂野",
    hex: ["#120A1F", "#3A1B5A", "#B23A7A", "#F1B24A", "#F7F1E3"],
  },
  {
    name: "玫瑰金首映",
    category: "情绪氛围",
    description: "暖玫瑰金、红毯华贵、优雅精致",
    hex: ["#1A1214", "#4A2A33", "#A65A6A", "#E2B3A9", "#F7EEE9"],
  },
  {
    name: "灯笼夜色",
    category: "情绪氛围",
    description: "暖纸灯笼、橙红暗夜、温馨夜晚",
    hex: ["#0F1110", "#2B2B2B", "#8A4B2A", "#E0A04A", "#F6F0E2"],
  },
  {
    name: "珊瑚礁探险",
    category: "情绪氛围",
    description: "暖珊瑚橙、热带蓝绿、活力海洋",
    hex: ["#0A1B22", "#124B5A", "#FF6B5A", "#FFB26B", "#F7F0E8"],
  },
  {
    name: "荒原沙丘",
    category: "情绪氛围",
    description: "沙色暖金、尘土橙棕、荒漠史诗感 (Dune 风)",
    hex: ["#3A2A1A", "#6B4A2A", "#A07040", "#D4B080", "#F0E0C0"],
  },
  {
    name: "哥谭暗夜",
    category: "情绪氛围",
    description: "深蓝黑、冷灰青、暗黑都市、蝙蝠侠调",
    hex: ["#050A10", "#0F1A2A", "#1A3040", "#4A6A80", "#A0B0C0"],
  },
  {
    name: "昭和回忆",
    category: "情绪氛围",
    description: "褪色暖黄、淡青绿、日式怀旧昭和风",
    hex: ["#E8D5B0", "#D4C8A0", "#A8C8C0", "#7AA8A0", "#4A7A6A"],
  },
  {
    name: "热带落日",
    category: "情绪氛围",
    description: "浓烈橙红、紫罗兰黄昏、热带度假感",
    hex: ["#FF4500", "#FF6347", "#FF1493", "#8B008B", "#FFD700"],
  },
  {
    name: "北境冰原",
    category: "情绪氛围",
    description: "极寒蓝白、冰冷灰阶、凛冬肃杀",
    hex: ["#0A0A1A", "#1A2A4A", "#3A5A8A", "#8A9ABA", "#D8E8F8"],
  },
  {
    name: "樱花物语",
    category: "情绪氛围",
    description: "淡粉、白樱、浅绿、春日和风柔软",
    hex: ["#FFE4E1", "#FFB7C5", "#FF69B4", "#98FB98", "#FFF0F5"],
  },
  {
    name: "午夜爵士",
    category: "情绪氛围",
    description: "深蓝紫、金铜暗调、烟雾缭绕爵士吧",
    hex: ["#0A0A1A", "#1A1A3A", "#4A3A6A", "#C8A040", "#F0E0C0"],
  },

  // ══════════ 影视名作 ══════════
  {
    name: "Blade Runner",
    category: "影视名作",
    description: "深蓝青影 + 琥珀霓虹 — 赛博朋克经典",
    hex: ["#0A1A2A", "#1C3A4A", "#C8A04A", "#E8C878", "#A03030"],
  },
  {
    name: "The Matrix",
    category: "影视名作",
    description: "数字绿影 + 冷蓝现实 — 划时代风格",
    hex: ["#0A2A0A", "#1A4A1A", "#2A6A2A", "#1A2A4A", "#3A6A8A"],
  },
  {
    name: "Breaking Bad",
    category: "影视名作",
    description: "焦土金黄 + 沙漠暖褐 — 道德沉沦色调",
    hex: ["#C8A050", "#D4B060", "#B89040", "#A08030", "#2A4040"],
  },
  {
    name: "Dune",
    category: "影视名作",
    description: "沙尘暖金 + 冷灰蓝 — Denis Villeneuve 史诗",
    hex: ["#C8A870", "#A08860", "#706050", "#405060", "#A0B0C0"],
  },
  {
    name: "Joker",
    category: "影视名作",
    description: "病态黄绿 + 深红点缀 — 心理惊悚调色",
    hex: ["#1A2A1A", "#3A5A2A", "#C8A040", "#A03030", "#F0E0C0"],
  },

  // ══════════ 摄影风格 ══════════
  {
    name: "Bright & Airy",
    category: "摄影风格",
    description: "过曝柔光、浅粉彩、婚纱清新感",
    hex: ["#F8F0F0", "#F0E8E8", "#E8D8D8", "#D8C8C8", "#C8B8B8"],
  },
  {
    name: "Dark Moody",
    category: "摄影风格",
    description: "深沉暗调、戏剧阴影、氛围人像",
    hex: ["#0A0808", "#1A1412", "#3A2A24", "#6B4A3A", "#A08060"],
  },
  {
    name: "Bleach Bypass",
    category: "摄影风格",
    description: "漂白银色、去饱和金属、冷峻质感",
    hex: ["#1A1A1A", "#4A4A4A", "#8A8A8A", "#B0B0B0", "#E0E0E0"],
  },
  {
    name: "Cross Process",
    category: "摄影风格",
    description: "强烈色偏、洋红绿偏移、叛逆实验风",
    hex: ["#CC0066", "#00AA55", "#FFCC00", "#0066CC", "#1A1A1A"],
  },
  {
    name: "Lomo",
    category: "摄影风格",
    description: "暗角深绿、高饱和偏移、玩具相机趣味",
    hex: ["#1A3A1A", "#3A6A3A", "#CC3300", "#FFCC00", "#0066CC"],
  },
  {
    name: "Matte Film",
    category: "摄影风格",
    description: "褪色电影感、提亮阴影、柔和中间调",
    hex: ["#1A1A1A", "#3A3535", "#6B6060", "#A09090", "#D8D0D0"],
  },

  // ══════════ 自然光影 ══════════
  {
    name: "Blue Hour",
    category: "自然光影",
    description: "深蓝暮色、静谧冷紫、日落后的魔法时刻",
    hex: ["#0A0A2A", "#1A2A5A", "#3A5A8A", "#6A8ABA", "#A0B0D8"],
  },
  {
    name: "Forest Mist",
    category: "自然光影",
    description: "薄雾森林、青苔绿、幽静自然呼吸",
    hex: ["#1A2A1A", "#2A4A2A", "#4A6A4A", "#7A9A7A", "#B0C8B0"],
  },
  {
    name: "Coastal Light",
    category: "自然光影",
    description: "海风蓝白、沙滩暖米、清新度假色调",
    hex: ["#F5F0E8", "#E8D8C0", "#A0C8D8", "#6090B0", "#2A5070"],
  },
  {
    name: "Volcanic Warm",
    category: "自然光影",
    description: "火山暖橙、熔岩暗红、极端炽热感",
    hex: ["#0A0000", "#3A0808", "#8A2010", "#CC4400", "#FF8800"],
  },
  {
    name: "Arctic Dawn",
    category: "自然光影",
    description: "极地粉紫黎明、冰蓝折射、纯净梦幻",
    hex: ["#F0E0F0", "#D8C8E8", "#A0B8D8", "#6890C0", "#1A3050"],
  },
];

export const presetCategories = [
  "胶片模拟",
  "导演风格",
  "调色风格",
  "影视名作",
  "情绪氛围",
  "摄影风格",
  "自然光影",
] as const;
