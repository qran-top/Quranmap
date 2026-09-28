import React from 'react';
import { BoardShape, GlowTheme, CanvasBgTheme } from '../types/quran';
import { 
  Square, 
  RectangleHorizontal, 
  Circle, 
  BookOpen, 
  Orbit, 
  Moon, 
  Sliders, 
  Sparkles, 
  Layers,
  Palette,
  Eye
} from 'lucide-react';

interface ShapeControlProps {
  currentShape: BoardShape;
  onShapeChange: (shape: BoardShape) => void;
  columns: number;
  onColumnsChange: (cols: number) => void;
  pixelSize: number;
  onPixelSizeChange: (size: number) => void;
  pixelGap: number;
  onPixelGapChange: (gap: number) => void;
  glowTheme: GlowTheme;
  onGlowThemeChange: (theme: GlowTheme) => void;
  bgTheme: CanvasBgTheme;
  onBgThemeChange: (theme: CanvasBgTheme) => void;
  glowIntensity: number;
  onGlowIntensityChange: (intensity: number) => void;
  animationMode: 'instant' | 'wave' | 'pulse' | 'sequential';
  onAnimationModeChange: (mode: 'instant' | 'wave' | 'pulse' | 'sequential') => void;
}

export const ShapeControl: React.FC<ShapeControlProps> = ({
  currentShape,
  onShapeChange,
  columns,
  onColumnsChange,
  pixelSize,
  onPixelSizeChange,
  pixelGap,
  onPixelGapChange,
  glowTheme,
  onGlowThemeChange,
  bgTheme,
  onBgThemeChange,
  glowIntensity,
  onGlowIntensityChange,
  animationMode,
  onAnimationModeChange
}) => {
  const shapes: { id: BoardShape; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'square', label: 'مربع', icon: <Square className="w-4 h-4" />, desc: 'شبكة متساوية الأضلاع (279 × 279)' },
    { id: 'rectangle', label: 'مستطيل', icon: <RectangleHorizontal className="w-4 h-4" />, desc: 'نسبة أبعاد عريضة 16:9 أو مخصصة' },
    { id: 'circle', label: 'دائرة', icon: <Circle className="w-4 h-4" />, desc: 'قرص شعاعي بنسبة ذهبية متناسقة' },
    { id: 'mushaf', label: 'مصحف ٦٠٤', icon: <BookOpen className="w-4 h-4" />, desc: 'توزيع صفحات المصحف الشريف' },
    { id: 'spiral', label: 'حلزوني', icon: <Orbit className="w-4 h-4" />, desc: 'مسار حلزوني يبدأ بالفاتحة حتى الناس' },
    { id: 'crescent', label: 'هلال', icon: <Moon className="w-4 h-4" />, desc: 'تشكيل بكسلي على هيئة هلال إسلامي' },
    { id: 'mihrab', label: 'محراب', icon: <Layers className="w-4 h-4" />, desc: 'قوس معماري إسلامي بديع' }
  ];

  const glowThemes: { id: GlowTheme; label: string; bgClass: string; color: string }[] = [
    { id: 'gold', label: 'ذهب ملكي', bgClass: 'bg-amber-400', color: '#fbbf24' },
    { id: 'emerald', label: 'زمرد قرآني', bgClass: 'bg-emerald-400', color: '#34d399' },
    { id: 'cyan', label: 'سماوي ياقوتي', bgClass: 'bg-cyan-400', color: '#38bdf8' },
    { id: 'amber', label: 'وهج الغروب', bgClass: 'bg-orange-400', color: '#fb923c' },
    { id: 'ruby', label: 'عقيق قرمزي', bgClass: 'bg-rose-400', color: '#f43f5e' },
    { id: 'purple', label: 'أرجوان ملكي', bgClass: 'bg-purple-400', color: '#c084fc' }
  ];

  const bgThemes: { id: CanvasBgTheme; label: string; bgClass: string }[] = [
    { id: 'kaaba-black', label: 'أسود كعبة', bgClass: 'bg-black border-slate-700' },
    { id: 'dark-slate', label: 'رمادي ليلي', bgClass: 'bg-slate-950 border-slate-700' },
    { id: 'midnight-blue', label: 'أزرق لجي', bgClass: 'bg-slate-900 border-indigo-900' },
    { id: 'deep-emerald', label: 'أخضر داكن', bgClass: 'bg-emerald-950 border-emerald-800' },
    { id: 'parchment', label: 'مخطوطة عتيقة', bgClass: 'bg-amber-950/70 border-amber-800' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-5">
      {/* Shapes Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>شكل وهيئة اللوحة:</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {shapes.find(s => s.id === currentShape)?.desc}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {shapes.map((shape) => {
            const isSelected = currentShape === shape.id;
            return (
              <button
                key={shape.id}
                onClick={() => onShapeChange(shape.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20 scale-102'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className={isSelected ? 'text-slate-950' : 'text-amber-400'}>
                  {shape.icon}
                </div>
                <span className="text-xs font-medium">{shape.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dimensional Controls (Sliders) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-slate-800/60">
        {/* Columns / Aspect for Square/Rectangle */}
        {(currentShape === 'square' || currentShape === 'rectangle') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">أبعاد العرض (الأعمدة):</span>
              <span className="font-mono text-amber-400 font-bold">{columns}</span>
            </div>
            <input
              type="range"
              min={100}
              max={600}
              step={10}
              value={columns}
              onChange={(e) => onColumnsChange(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Pixel Size */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">حجم البكسل:</span>
            <span className="font-mono text-amber-400 font-bold">{pixelSize}px</span>
          </div>
          <input
            type="range"
            min={1}
            max={7}
            step={0.5}
            value={pixelSize}
            onChange={(e) => onPixelSizeChange(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Pixel Spacing */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">التباعد بين البكسلات:</span>
            <span className="font-mono text-amber-400 font-bold">{pixelGap}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={3}
            step={0.5}
            value={pixelGap}
            onChange={(e) => onPixelGapChange(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Glow Intensity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">شدة التوهج والإنارة:</span>
            <span className="font-mono text-amber-400 font-bold">{Math.round(glowIntensity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.1}
            value={glowIntensity}
            onChange={(e) => onGlowIntensityChange(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Colors & Themes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-slate-800/60">
        {/* Glow Color */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>لون الإنارة:</span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {glowThemes.map(t => (
              <button
                key={t.id}
                onClick={() => onGlowThemeChange(t.id)}
                title={t.label}
                className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${t.bgClass} ${
                  glowTheme === t.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Background Canvas Theme */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>خلفية اللوحة:</span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {bgThemes.map(t => (
              <button
                key={t.id}
                onClick={() => onBgThemeChange(t.id)}
                title={t.label}
                className={`w-6 h-6 rounded-md border transition-transform ${t.bgClass} ${
                  bgTheme === t.id ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Animation Mode */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>طريقة الإنارة:</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['instant', 'wave', 'pulse', 'sequential'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => onAnimationModeChange(mode)}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-medium transition-colors ${
                  animationMode === mode
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'instant' ? 'فوري' : mode === 'wave' ? 'موجي' : mode === 'pulse' ? 'نبض' : 'تسلسلي'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
