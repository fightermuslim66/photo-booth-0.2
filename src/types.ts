export type StripLayoutType = 'vertical_strip' | 'grid_2x2' | 'portrait_studio' | 'horizontal_strip';

export interface LayoutPreset {
  id: StripLayoutType;
  name: string;
  frameCount: number;
  cols: number;
  rows: number;
  aspectRatio: string; // "3:4" or "2:3" or "1:1"
  description: string;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'vertical_strip',
    name: 'Korea 4-Strip Classic',
    frameCount: 4,
    cols: 1,
    rows: 4,
    aspectRatio: '3:4',
    description: 'Format strip vertikal klasik ala photobook Korea.'
  },
  {
    id: 'grid_2x2',
    name: 'Block Grid 2x2',
    frameCount: 4,
    cols: 2,
    rows: 2,
    aspectRatio: '1:1',
    description: 'Format kotak persegi 2x2 populer, cocok untuk Instagram.'
  },
  {
    id: 'portrait_studio',
    name: 'Single Professional Portrait',
    frameCount: 1,
    cols: 1,
    rows: 1,
    aspectRatio: '2:3',
    description: 'Format foto portrait studio profesional tunggal ala ID card.'
  },
  {
    id: 'horizontal_strip',
    name: 'Horizontal 3-Strip',
    frameCount: 3,
    cols: 3,
    rows: 1,
    aspectRatio: '4:3',
    description: 'Format horizontal 3-frame sinematik bergaya retro film.'
  }
];

export interface VisualFilter {
  id: string;
  name: string;
  tagline: string;
  cssFilter: string;
  vibeDescription: string;
  previewColor: string;
}

export const VISUAL_FILTERS: VisualFilter[] = [
  {
    id: 'natural_korea',
    name: 'Korea Pastel Soft',
    tagline: 'Gaya Seoul Minimalis',
    cssFilter: 'contrast(0.95) brightness(1.15) saturate(1.05) sepia(0.05)',
    vibeDescription: 'Korea style yang cerah, kontras lembut, memutihkan kulit secara alami.',
    previewColor: 'from-pink-100 to-indigo-100'
  },
  {
    id: 'vintage_90s',
    name: 'Retro 90s Film',
    tagline: 'Vibe Kodak Gold',
    cssFilter: 'contrast(1.1) brightness(0.98) saturate(1.15) sepia(0.2) hue-rotate(-5deg)',
    vibeDescription: 'Warna hangat legendaris Kodak Portra dengan saturasi skin-tone yang matang dan nostalgis.',
    previewColor: 'from-amber-100 to-amber-200'
  },
  {
    id: 'cyberpunk_neon',
    name: 'Cyberpunk Neon',
    tagline: 'Tokyo Shinjuku Vibe',
    cssFilter: 'contrast(1.25) brightness(1.05) saturate(1.6) hue-rotate(15deg) sepia(0.05)',
    vibeDescription: 'Tingkatan warna dramatis dengan rona kontras neon fuchsia-biru futuristik.',
    previewColor: 'from-fuchsia-600 to-cyan-500'
  },
  {
    id: 'classic_noir',
    name: 'Midnight Noir B&W',
    tagline: 'Artistic Black & White',
    cssFilter: 'grayscale(1) contrast(1.3) brightness(0.95)',
    vibeDescription: 'Hitam putih dramatis yang menekankan bayangan studio profesional dan struktur tulang wajah.',
    previewColor: 'from-neutral-800 to-neutral-900'
  },
  {
    id: 'soft_bloom',
    name: 'Dreamy soft-bloom',
    tagline: 'Aesthetic Dreamscapes',
    cssFilter: 'contrast(0.9) brightness(1.2) saturate(0.95) sepia(0.05) blur(0.2px)',
    vibeDescription: 'Cahaya berpendar halus (soft bloom) menghasilkan aura magis dan menawan.',
    previewColor: 'from-purple-100 to-pink-100'
  },
  {
    id: 'golden_hour',
    name: 'Sunset Golden Hour',
    tagline: 'Warm California Sun',
    cssFilter: 'contrast(1.05) brightness(1.05) saturate(1.2) sepia(0.25) hue-rotate(-10deg)',
    vibeDescription: 'Meniru pancaran cahaya hangat matahari sore pukul 5, menghasilkan kilau keemasan alami.',
    previewColor: 'from-orange-200 to-amber-300'
  },
  {
    id: 'emerald_indie',
    name: 'Emerald Green',
    tagline: 'Vibe Film Analog',
    cssFilter: 'contrast(1.1) brightness(1.02) saturate(0.9) hue-rotate(-15deg)',
    vibeDescription: 'Tingkatan warna sejuk dengan bias hijau-emerald ala film petualangan vintage.',
    previewColor: 'from-emerald-100 to-teal-100'
  }
];

export interface StudioBackdrop {
  id: string;
  name: string;
  category: 'studio' | 'aesthetic' | 'outdoor' | 'solid';
  value: string; // URL SVG, gradient, or solid hex
  isGradient?: boolean;
}

export const STUDIO_BACKDROPS: StudioBackdrop[] = [
  {
    id: 'backdrop_studio_white',
    name: 'Studio Soft Grey',
    category: 'studio',
    value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    isGradient: true
  },
  {
    id: 'backdrop_studio_beige',
    name: 'Ivory Studio Beige',
    category: 'studio',
    value: 'linear-gradient(135deg, #fdfbf7 0%, #e2d1c3 100%)',
    isGradient: true
  },
  {
    id: 'backdrop_studio_blue',
    name: 'Studio Blue Curtain',
    category: 'studio',
    value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    isGradient: true
  },
  {
    id: 'backdrop_aesthetic_arch',
    name: 'Minimalist Sand Arch',
    category: 'aesthetic',
    value: 'linear-gradient(to right, #eaddca, #f5ebe0, #d5bdaf)',
    isGradient: true
  },
  {
    id: 'backdrop_aesthetic_lavender',
    name: 'Dreamy Pastel Lilac',
    category: 'aesthetic',
    value: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
    isGradient: true
  },
  {
    id: 'backdrop_outdoor_forest',
    name: 'Serene Botanical Grove',
    category: 'outdoor',
    value: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    isGradient: true
  },
  {
    id: 'backdrop_outdoor_sunset',
    name: 'Oahu Beach Sunset',
    category: 'outdoor',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    isGradient: true
  },
  {
    id: 'solid_pink',
    name: 'Cute Pastel Pink',
    category: 'solid',
    value: '#ffd3e1',
  },
  {
    id: 'solid_black',
    name: 'Classic Deep Charcoal',
    category: 'solid',
    value: '#1a1a1a',
  },
  {
    id: 'solid_mint',
    name: 'Refreshing Mint',
    category: 'solid',
    value: '#bbf7d0',
  }
];

export interface VisualOutfit {
  id: string;
  name: string;
  category: 'formal' | 'casual' | 'vintage' | 'accessory';
  svgPath: string; // Custom vector pathways
  emoji: string;
  description: string;
}

export const VIRTUAL_OUTFITS: VisualOutfit[] = [
  {
    id: 'outfit_blazer',
    name: 'Premium Studio Blazer',
    category: 'formal',
    emoji: '🧥',
    svgPath: '', // Drawn dynamically in Canvas, custom styles
    description: 'Setelan blazer hitam dengan kerah ramping berpola elegan.'
  },
  {
    id: 'outfit_knit',
    name: 'Cozy Cardigan Rajut',
    category: 'casual',
    emoji: '🧶',
    svgPath: '',
    description: 'Cardigan rajut warna beige yang memberikan sentuhan santai dan hangat.'
  },
  {
    id: 'outfit_leather',
    name: 'Y2K Retro Jacket',
    category: 'vintage',
    emoji: '⚡',
    svgPath: '',
    description: 'Jaket kulit hitam dengan aksen ritsleting vintage Y2K.'
  },
  {
    id: 'outfit_hanbok',
    name: 'Tradisional Hanbok Han',
    category: 'vintage',
    emoji: '🌸',
    svgPath: '',
    description: 'Sentuhan pakaian tradisional Korea romantis berwarna merah muda pastel.'
  },
  {
    id: 'accessory_cool_shades',
    name: 'Retro Round Sunglasses',
    category: 'accessory',
    emoji: '🕶️',
    svgPath: '',
    description: 'Kacamata hitam bulat retro vintage gaya selebriti panggung.'
  },
  {
    id: 'accessory_cat_ears',
    name: 'Kawaii Neko Headband',
    category: 'accessory',
    emoji: '🐱',
    svgPath: '',
    description: 'Bando telinga kucing berbulu pink menggemaskan ala cosplay.'
  },
  {
    id: 'accessory_crown',
    name: 'Royal Golden Tiara',
    category: 'accessory',
    emoji: '👑',
    svgPath: '',
    description: 'Mahkota pangeran/putri berkilau keemasan bertatahkan berlian.'
  },
  {
    id: 'accessory_party',
    name: 'Fun Sparkle Glasses',
    category: 'accessory',
    emoji: '👓',
    svgPath: '',
    description: 'Kacamata mainan bentuk hati merah muda dengan kilau bintang.'
  }
];

export interface PhotoFrameState {
  id: number; // 0, 1, 2, 3
  image: string | null; // Base64
  rawImage: string | null; // Raw image before overlays for re-filtering
  mirrored: boolean;
  filterId: string; // individual filter override if wanted
  outfitId: string | null; // outfit overlay applied
  outfitParams?: {
    x: number; // relative placement percentages
    y: number;
    scale: number;
  };
}

export interface AdjustmentSettings {
  brightness: number;  // -50 to 50
  contrast: number;    // -50 to 50
  saturation: number;  // -50 to 50
  blur: number;        // 0 to 8
  vignette: number;    // 0 to 100
  sepia: number;       // 0 to 100
  grain: number;       // 0 to 100
}

export const DEFAULT_ADJUSTMENTS: AdjustmentSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  vignette: 10,
  sepia: 0,
  grain: 5,
};

export interface StickerState {
  id: string;
  text: string;
  colorStyle: string; // pink, blue, yellow, green, violet, neon
  xPercent: number; // 0 - 100 ratio
  yPercent: number; // 0 - 100 ratio
  scale?: number;
}

export interface AIReviewResponse {
  analysis: string;
  persona: string;
  tips: string[];
  recommendedDials: {
    brightnessOffset: number;
    contrastOffset: number;
    saturationOffset: number;
    blurSoftness: number;
    vignetteLevel: number;
  };
  customStripLabel: string;
  customSubtitle: string;
  stickersToInclude: {
    text: string;
    colorStyle: string;
    xPercent: number;
    yPercent: number;
  }[];
}
