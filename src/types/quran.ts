export interface SurahMeta {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameTransliteration: string;
  totalAyahs: number;
  totalWords: number;
  startWordIndex: number;
  revelationType: 'Meccan' | 'Medinan';
  revelationOrder: number;
  juzStart: number;
}

export interface QuranWord {
  id: number; // 0 to ~77429
  surah: number; // 1 to 114
  ayah: number; // 1 to totalAyahs
  wordInAyah: number; // 1-indexed
  text: string; // with / without tashkeel
  normalized: string; // normalized for search
}

export type BoardShape = 'square' | 'rectangle' | 'circle' | 'mushaf' | 'spiral' | 'crescent' | 'mihrab';

export interface PixelPoint {
  x: number;
  y: number;
  wordIndex: number;
}

export interface SearchMatch {
  wordIndex: number;
  surah: number;
  ayah: number;
  wordInAyah: number;
  text: string;
}

export type GlowTheme = 'gold' | 'emerald' | 'cyan' | 'ruby' | 'purple' | 'amber';
export type CanvasBgTheme = 'dark-slate' | 'kaaba-black' | 'midnight-blue' | 'deep-emerald' | 'parchment';

export interface LayoutSettings {
  shape: BoardShape;
  columns: number;
  pixelSize: number;
  gap: number;
  glowTheme: GlowTheme;
  bgTheme: CanvasBgTheme;
  glowIntensity: number; // 0.5 to 2.5
  animationMode: 'instant' | 'wave' | 'pulse' | 'sequential';
}
