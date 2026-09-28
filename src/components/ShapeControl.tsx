import React from 'react';
import { BoardShape, GlowTheme, CanvasBgTheme } from '../types/quran';
import { computeGridFitStats, PERFECT_FIT_PRESETS } from '../utils/pixelLayouts';
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
  Eye,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Hash,
  Type
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
  animationEnabled: boolean;
  onToggleAnimation: (enabled: boolean) => void;
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
  onAnimationModeChange,
  animationEnabled,
  onToggleAnimation
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

  // Grid fit analysis for square / rectangle
  const isGridShape = currentShape === 'square' || currentShape === 'rectangle';
  const gridStats = isGridShape ? computeGridFitStats(columns) : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-5">
      {/* Shapes Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-arabic">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>شكل وهيئة اللوحة:</span>
          </label>
          <span className="text-[11px] text-slate-400 font-arabic">
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
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center gap-1.5 font-arabic ${
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

      {/* Grid Dimensional Fit & Row/Letter Length Analysis (for Rectangle & Square) */}
      {isGridShape && gridStats && (
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 space-y-3 font-arabic">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-amber-400" />
              <span>تحليل مقاس {currentShape === 'square' ? 'المربع' : 'المستطيل'} واكتمال السطور:</span>
            </span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
              gridStats.isFullFit
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {gridStats.isFullFit ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>كامل ومسكر تماماً (0 باقي)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>باقي {gridStats.remainingSlotsInLastRow} بكسل في السطر الأخير</span>
                </>
              )}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">طول السطر (بالكلمات):</span>
              <span className="text-white font-bold font-mono text-sm">{gridStats.columns} كلمة / سطر</span>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">طول السطر (بالحروف تقريباً):</span>
              <span className="text-amber-300 font-bold font-mono text-sm flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span>~{gridStats.estimatedLettersInRow.toLocaleString('ar-EG')} حرفاً</span>
              </span>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[11px]">إجمالي الأسطر:</span>
              <span className="text-white font-bold font-mono text-sm">{gridStats.rows} سطراً</span>
            </div>
          </div>

          {/* Status Sentence */}
          <div className="text-[11px] leading-relaxed text-slate-300 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
            {gridStats.isFullFit ? (
              <p className="text-emerald-300">
                🎉 <strong>المقاس مسكر بالكامل:</strong> الكلمة القرآنية الأخيرة رقم ٧٧,٨٢٥ تسكر السطر الأخير تماماً عند الزاوية بدون أي خانة فارغة.
              </p>
            ) : (
              <p className="text-slate-300">
                📌 السطر الأخير يحوي <strong className="text-amber-300">{gridStats.lastRowWords}</strong> كلمة، ويتبقى <strong className="text-amber-400">{gridStats.remainingSlotsInLastRow}</strong> خانة فارغة ليكتمل المستطيل. (متوسط طول الكلمة القرآنية: ٤.١٦ حرفاً).
              </p>
            )}
          </div>

          {/* Quick Fit Snap Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-400 block">مقاسات مقفلة تماماً بدون فراغ (انقر للتطبيق المباشر):</span>
            <div className="flex flex-wrap gap-1.5">
              {PERFECT_FIT_PRESETS.map((preset) => (
                <button
                  key={preset.cols}
                  type="button"
                  onClick={() => onColumnsChange(preset.cols)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                    columns === preset.cols
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:border-amber-400/50 hover:text-amber-200'
                  }`}
                  title={preset.desc}
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dimensional Controls (Sliders) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-slate-800/60">
        {/* Columns / Aspect for Square/Rectangle */}
        {(currentShape === 'square' || currentShape === 'rectangle') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-arabic">
              <span className="text-slate-300">أبعاد العرض (الأعمدة):</span>
              <span className="font-mono text-amber-400 font-bold">{columns}</span>
            </div>
            <input
              type="range"
              min={100}
              max={600}
              step={1}
              value={columns}
              onChange={(e) => onColumnsChange(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Pixel Size */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-arabic">
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
          <div className="flex items-center justify-between text-xs font-arabic">
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
          <div className="flex items-center justify-between text-xs font-arabic">
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

      {/* Colors & Animation Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-slate-800/60 font-arabic">
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

        {/* Animation Toggle & Modes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>الأنيميشن والحركة:</span>
            </label>
            <button
              type="button"
              onClick={() => onToggleAnimation(!animationEnabled)}
              className={`text-xs px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border transition-all ${
                animationEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {animationEnabled ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span>شغّال</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>متوقف (خفيف)</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['instant', 'wave', 'pulse', 'sequential'] as const).map(mode => (
              <button
                key={mode}
                disabled={!animationEnabled && mode !== 'instant'}
                onClick={() => onAnimationModeChange(mode)}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-medium transition-colors ${
                  !animationEnabled && mode !== 'instant'
                    ? 'opacity-40 cursor-not-allowed text-slate-600'
                    : animationMode === mode
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'instant' ? 'ثابت' : mode === 'wave' ? 'موجي' : mode === 'pulse' ? 'نبض' : 'تسلسلي'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
