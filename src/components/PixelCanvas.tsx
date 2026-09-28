import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { BoardShape, GlowTheme, CanvasBgTheme } from '../types/quran';
import { generatePixelLayout, LayoutResult } from '../utils/pixelLayouts';
import { getQuranWords, getSurahForWordIndex } from '../data/quranDataset';
import { TOTAL_QURAN_WORDS } from '../data/surahs';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles,
  Play,
  Pause,
  BookOpen,
  Info,
  CheckCircle2,
  MousePointerClick
} from 'lucide-react';

interface PixelCanvasProps {
  shape: BoardShape;
  columns: number;
  pixelSize: number;
  pixelGap: number;
  glowTheme: GlowTheme;
  bgTheme: CanvasBgTheme;
  glowIntensity: number;
  animationMode: 'instant' | 'wave' | 'pulse' | 'sequential';
  animationEnabled: boolean;
  onToggleAnimation: (enabled: boolean) => void;
  detailsMode: boolean;
  onToggleDetailsMode: (enabled: boolean) => void;
  highlightedIndices: Set<number>;
  searchQuery: string;
  onSelectWord: (wordIndex: number) => void;
  canvasExportRef?: React.MutableRefObject<(() => string | null) | null>;
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  shape,
  columns,
  pixelSize,
  pixelGap,
  glowTheme,
  bgTheme,
  glowIntensity,
  animationMode,
  animationEnabled,
  onToggleAnimation,
  detailsMode,
  onToggleDetailsMode,
  highlightedIndices,
  searchQuery,
  onSelectWord,
  canvasExportRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Transform / Pan & Zoom State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover state (only populated if detailsMode is active)
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layout result cache
  const [layout, setLayout] = useState<LayoutResult>(() => generatePixelLayout(shape, TOTAL_QURAN_WORDS, columns));

  // Generate layout when shape or columns change
  useEffect(() => {
    const newLayout = generatePixelLayout(shape, TOTAL_QURAN_WORDS, columns);
    setLayout(newLayout);
    resetTransform(newLayout);
  }, [shape, columns]);

  // Reset transform to fit content nicely
  const resetTransform = useCallback((currentLayout = layout) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const cWidth = container.clientWidth || 800;
    const cHeight = container.clientHeight || 600;

    const unitSize = pixelSize + pixelGap;
    const boardW = currentLayout.width * unitSize;
    const boardH = currentLayout.height * unitSize;

    const scaleX = (cWidth - 60) / boardW;
    const scaleY = (cHeight - 60) / boardH;
    const fitZoom = Math.min(Math.max(0.1, Math.min(scaleX, scaleY)), 3);

    setZoom(fitZoom);
    setPan({
      x: (cWidth - boardW * fitZoom) / 2,
      y: (cHeight - boardH * fitZoom) / 2
    });
  }, [layout, pixelSize, pixelGap]);

  useEffect(() => {
    resetTransform();
  }, []);

  // Set export ref function
  useEffect(() => {
    if (canvasExportRef) {
      canvasExportRef.current = () => {
        if (!canvasRef.current) return null;
        return canvasRef.current.toDataURL('image/png');
      };
    }
  }, [canvasExportRef]);

  // Fast O(1) spatial index when detailsMode is active
  const spatialMap = useMemo(() => {
    if (!detailsMode) return null;
    if (shape === 'square' || shape === 'rectangle') return null; // Can compute directly mathematically
    const map = new Map<string, number>();
    for (let i = 0; i < layout.points.length; i++) {
      const pt = layout.points[i];
      if (pt) {
        map.set(`${pt.x},${pt.y}`, i);
      }
    }
    return map;
  }, [layout, detailsMode, shape]);

  // Color mappings
  const getGlowColor = (theme: GlowTheme): { main: string; glow: string; halo: string } => {
    switch (theme) {
      case 'emerald':
        return { main: '#34d399', glow: '#10b981', halo: 'rgba(16, 185, 129, 0.4)' };
      case 'cyan':
        return { main: '#38bdf8', glow: '#0284c7', halo: 'rgba(56, 189, 248, 0.4)' };
      case 'ruby':
        return { main: '#fb7185', glow: '#e11d48', halo: 'rgba(244, 63, 94, 0.4)' };
      case 'purple':
        return { main: '#c084fc', glow: '#9333ea', halo: 'rgba(168, 85, 247, 0.4)' };
      case 'amber':
        return { main: '#fb923c', glow: '#ea580c', halo: 'rgba(251, 146, 60, 0.4)' };
      case 'gold':
      default:
        return { main: '#fcd34d', glow: '#f59e0b', halo: 'rgba(245, 158, 11, 0.4)' };
    }
  };

  const getBgColor = (theme: CanvasBgTheme): string => {
    switch (theme) {
      case 'kaaba-black':
        return '#050505';
      case 'midnight-blue':
        return '#090d16';
      case 'deep-emerald':
        return '#04130c';
      case 'parchment':
        return '#1c150c';
      case 'dark-slate':
      default:
        return '#0f172a';
    }
  };

  // High Performance Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = Date.now();
    const unitSize = pixelSize + pixelGap;
    const glowColors = getGlowColor(glowTheme);
    const bgColor = getBgColor(bgTheme);
    const hasHighlights = highlightedIndices.size > 0;

    const render = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // 1. Draw Unlit Base Grid (Dark/Subtle Dots)
      ctx.fillStyle = bgTheme === 'kaaba-black' ? '#18181b' : '#1e293b';
      const points = layout.points;
      const count = points.length;

      for (let i = 0; i < count; i++) {
        if (!highlightedIndices.has(i)) {
          const pt = points[i];
          if (pt) {
            ctx.fillRect(pt.x * unitSize, pt.y * unitSize, pixelSize, pixelSize);
          }
        }
      }

      // 2. Draw Illuminated Lit Pixels
      if (hasHighlights) {
        // Optional Halo pass
        if (glowIntensity > 0.6) {
          ctx.fillStyle = glowColors.halo;
          const haloPadding = Math.max(1, pixelSize * 1.2 * glowIntensity);

          highlightedIndices.forEach(idx => {
            const pt = layout.points[idx];
            if (!pt) return;

            let alphaMult = 1;
            if (animationEnabled && animationMode === 'pulse') {
              alphaMult = 0.6 + 0.4 * Math.sin(elapsed * 4 + idx * 0.05);
            } else if (animationEnabled && animationMode === 'wave') {
              alphaMult = 0.5 + 0.5 * Math.sin(elapsed * 3 - (pt.x + pt.y) * 0.08);
            }

            ctx.globalAlpha = Math.max(0.1, alphaMult * (glowIntensity * 0.4));
            ctx.fillRect(
              pt.x * unitSize - haloPadding,
              pt.y * unitSize - haloPadding,
              pixelSize + haloPadding * 2,
              pixelSize + haloPadding * 2
            );
          });
        }

        // Solid Core Lit pass
        highlightedIndices.forEach(idx => {
          const pt = layout.points[idx];
          if (!pt) return;

          let brightness = 1;
          if (animationEnabled && animationMode === 'pulse') {
            brightness = 0.8 + 0.2 * Math.sin(elapsed * 4 + idx * 0.05);
          } else if (animationEnabled && animationMode === 'wave') {
            brightness = 0.7 + 0.3 * Math.sin(elapsed * 3 - (pt.x + pt.y) * 0.08);
          } else if (animationEnabled && animationMode === 'sequential') {
            const progress = (elapsed * 2500) % TOTAL_QURAN_WORDS;
            brightness = idx <= progress ? 1 : 0.2;
          }

          ctx.globalAlpha = brightness;
          ctx.fillStyle = glowColors.main;
          ctx.fillRect(pt.x * unitSize, pt.y * unitSize, pixelSize, pixelSize);

          // For small match count (like 4 occurrences of 'محمد'), draw clear beacons
          if (highlightedIndices.size <= 25) {
            const pulseRadius = animationEnabled 
              ? (pixelSize * 3.5) + (Math.sin(elapsed * 5 + idx) + 1) * (pixelSize * 2)
              : (pixelSize * 4.5);
            ctx.save();
            ctx.strokeStyle = glowColors.main;
            ctx.lineWidth = Math.max(1, 1.5 / zoom);
            ctx.globalAlpha = animationEnabled ? (0.4 + 0.4 * Math.sin(elapsed * 5 + idx)) : 0.6;
            ctx.beginPath();
            ctx.arc(
              pt.x * unitSize + pixelSize / 2,
              pt.y * unitSize + pixelSize / 2,
              pulseRadius,
              0,
              Math.PI * 2
            );
            ctx.stroke();
            ctx.restore();
          }
        });

        ctx.globalAlpha = 1;
      }

      // 3. Draw Hover Indicator (only when detailsMode is active)
      if (detailsMode && hoveredWordIndex !== null && layout.points[hoveredWordIndex]) {
        const hPt = layout.points[hoveredWordIndex];
        const hx = hPt.x * unitSize;
        const hy = hPt.y * unitSize;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.5 / zoom, 1);
        ctx.strokeRect(hx - 2, hy - 2, pixelSize + 4, pixelSize + 4);
      }

      ctx.restore();

      // Only request next animation frame if animation is enabled and active
      if (animationEnabled && hasHighlights && (animationMode === 'pulse' || animationMode === 'wave' || animationMode === 'sequential')) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    layout, 
    pan, 
    zoom, 
    pixelSize, 
    pixelGap, 
    glowTheme, 
    bgTheme, 
    glowIntensity, 
    highlightedIndices, 
    animationMode, 
    animationEnabled, 
    hoveredWordIndex,
    detailsMode
  ]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = container.clientHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(Math.max(0.15, zoom * zoomFactor), 8);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setPan(prev => ({
      x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
      y: mouseY - (mouseY - prev.y) * (newZoom / zoom)
    }));
    setZoom(newZoom);
  };

  // Mouse Down Drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Mouse Move: Pan or Ultra-Fast O(1) Hover Detection (only when detailsMode is active)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseCanvasX = e.clientX - rect.left;
    const mouseCanvasY = e.clientY - rect.top;

    setMousePos({ x: e.clientX, y: e.clientY });

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    // If detailsMode is off, do not perform hover lookups to keep page ultra-lightweight
    if (!detailsMode) {
      if (hoveredWordIndex !== null) setHoveredWordIndex(null);
      return;
    }

    // Instant O(1) coordinate lookup
    const worldX = (mouseCanvasX - pan.x) / zoom;
    const worldY = (mouseCanvasY - pan.y) / zoom;
    const unitSize = pixelSize + pixelGap;

    const gridX = Math.round(worldX / unitSize);
    const gridY = Math.round(worldY / unitSize);

    let closestIndex: number | null = null;

    if (shape === 'square' || shape === 'rectangle') {
      if (gridX >= 0 && gridX < columns && gridY >= 0) {
        const idx = gridY * columns + gridX;
        if (idx >= 0 && idx < TOTAL_QURAN_WORDS) {
          closestIndex = idx;
        }
      }
    } else if (spatialMap) {
      closestIndex = spatialMap.get(`${gridX},${gridY}`) ?? null;
    }

    setHoveredWordIndex(closestIndex);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!detailsMode) {
      // Suggest activating details mode
      onToggleDetailsMode(true);
      return;
    }
    if (hoveredWordIndex !== null) {
      onSelectWord(hoveredWordIndex);
    }
  };

  // Lazy loaded words info only when detailsMode is on
  const words = detailsMode ? getQuranWords() : null;
  const hoveredWordObj = (detailsMode && words && hoveredWordIndex !== null) ? words[hoveredWordIndex] : null;
  const hoveredSurah = (detailsMode && hoveredWordIndex !== null) ? getSurahForWordIndex(hoveredWordIndex) : null;
  const isHoveredLit = hoveredWordIndex !== null && highlightedIndices.has(hoveredWordIndex);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[520px] sm:h-[620px] lg:h-[700px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden select-none shadow-2xl"
    >
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setHoveredWordIndex(null);
        }}
        onClick={handleClick}
        className={`w-full h-full block ${isDragging ? 'cursor-grabbing' : (detailsMode && hoveredWordIndex !== null) ? 'cursor-pointer' : 'cursor-grab'}`}
      />

      {/* Top Controls Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left: Zoom & View Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-lg backdrop-blur-md pointer-events-auto">
          <button
            onClick={() => {
              const newZoom = Math.min(8, zoom * 1.3);
              setZoom(newZoom);
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const newZoom = Math.max(0.15, zoom * 0.7);
              setZoom(newZoom);
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => resetTransform()}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="ملاءمة الشاشة"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Quick Animation Toggle */}
          <button
            onClick={() => onToggleAnimation(!animationEnabled)}
            className={`px-2 py-1 rounded-lg text-xs font-arabic font-semibold flex items-center gap-1 transition-all ${
              animationEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="تشغيل / إيقاف حركة الإنارة"
          >
            {animationEnabled ? (
              <>
                <Pause className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">حركة مفعّلة</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">حركة متوقفة</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Details Mode Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => onToggleDetailsMode(!detailsMode)}
            className={`px-3 py-1.5 rounded-xl font-arabic text-xs font-bold transition-all shadow-lg flex items-center gap-2 border ${
              detailsMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
                : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600 backdrop-blur-md'
            }`}
            title="تفعيل أو إيقاف وضع إظهار التفاصيل لتسريع الصفحة"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {detailsMode ? 'وضع إظهار التفاصيل (مفعّل)' : 'وضع الأداء السريع (اضغط لإظهار التفاصيل)'}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Status Notification if Details Mode is OFF */}
      {!detailsMode && (
        <div className="absolute bottom-4 left-4 bg-slate-900/85 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-arabic text-slate-400 backdrop-blur-md flex items-center gap-2 shadow-lg">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>اللوحة تعمل بأقصى سرعة وخفة. انقر زر «إظهار التفاصيل» بالأعلى لتفحص الكلمات والآيات.</span>
        </div>
      )}

      {/* Hover Word Tooltip Card (Only when detailsMode is active) */}
      {detailsMode && hoveredWordObj && hoveredSurah && (
        <div
          className="fixed pointer-events-none z-50 bg-slate-900/95 border border-amber-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-right font-arabic max-w-xs transition-opacity duration-150"
          style={{
            left: `${Math.min(window.innerWidth - 260, mousePos.x + 16)}px`,
            top: `${Math.min(window.innerHeight - 140, mousePos.y + 16)}px`
          }}
          dir="rtl"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
            <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>سورة {hoveredSurah.nameArabic}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              آية {hoveredWordObj.ayah}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-lg font-serif text-white font-bold">
              {hoveredWordObj.text}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>الكلمة رقم {hoveredWordObj.id.toLocaleString('ar-EG')}</span>
              {isHoveredLit && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>مطابقة للبحث</span>
                </span>
              )}
            </div>

            <div className="text-[10px] text-amber-300/80 pt-1 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" />
              <span>انقر لعرض الآية الكاملة والاستماع للتلاوة</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
