import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BoardShape, GlowTheme, CanvasBgTheme, PixelPoint } from '../types/quran';
import { generatePixelLayout, LayoutResult } from '../utils/pixelLayouts';
import { getQuranWords, getSurahForWordIndex, SAMPLE_VERSES } from '../data/quranDataset';
import { TOTAL_QURAN_WORDS, SURAHS } from '../data/surahs';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Compass, 
  Sparkles,
  Info,
  BookOpen
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

  // Hover state
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layout result cache
  const [layout, setLayout] = useState<LayoutResult>(() => generatePixelLayout(shape, TOTAL_QURAN_WORDS, columns));

  // Animation frame
  const animTimeRef = useRef<number>(0);
  const animStartTimeRef = useRef<number>(Date.now());

  // Generate layout when shape or columns change
  useEffect(() => {
    const newLayout = generatePixelLayout(shape, TOTAL_QURAN_WORDS, columns);
    setLayout(newLayout);
    // Reset view position to center
    resetTransform(newLayout);
    animStartTimeRef.current = Date.now();
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

    const scaleX = (cWidth - 80) / boardW;
    const scaleY = (cHeight - 80) / boardH;
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
        return '#030712';
    }
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Fill background
      ctx.fillStyle = getBgColor(bgTheme);
      ctx.fillRect(0, 0, width, height);

      // Apply zoom & pan transformations
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      const unitSize = pixelSize + pixelGap;
      const glowColors = getGlowColor(glowTheme);
      const words = getQuranWords();
      const now = Date.now();
      const elapsed = (now - animStartTimeRef.current) / 1000;

      // 1. Draw Subtle Unlit Pixels
      const defaultUnlitColor = bgTheme === 'parchment' ? 'rgba(160, 130, 90, 0.18)' : 'rgba(255, 255, 255, 0.12)';
      const alternateUnlitColor = bgTheme === 'parchment' ? 'rgba(180, 150, 100, 0.25)' : 'rgba(255, 255, 255, 0.2)';

      // Batch draw unlit pixels
      for (let i = 0; i < layout.points.length; i++) {
        const pt = layout.points[i];
        if (!pt) continue;

        const isHighlighted = highlightedIndices.has(i);
        if (isHighlighted) continue; // Draw lit pixels in second pass for layering

        const px = pt.x * unitSize;
        const py = pt.y * unitSize;

        // Subtle Juz / Surah rhythm visualization
        const wordObj = words[i];
        const surahId = wordObj ? wordObj.surah : 1;
        ctx.fillStyle = surahId % 2 === 0 ? defaultUnlitColor : alternateUnlitColor;
        
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }

      // 2. Draw Highlighted / Illuminated Pixels with Glow
      const hasHighlights = highlightedIndices.size > 0;

      if (hasHighlights) {
        // Glow Halo pass (if zoom is sufficient or high intensity)
        if (glowIntensity > 0.6) {
          ctx.fillStyle = glowColors.halo;
          const haloPadding = Math.max(1, pixelSize * 1.2 * glowIntensity);

          highlightedIndices.forEach(idx => {
            const pt = layout.points[idx];
            if (!pt) return;

            let alphaMult = 1;
            if (animationMode === 'pulse') {
              alphaMult = 0.6 + 0.4 * Math.sin(elapsed * 4 + idx * 0.05);
            } else if (animationMode === 'wave') {
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
          if (animationMode === 'pulse') {
            brightness = 0.8 + 0.2 * Math.sin(elapsed * 4 + idx * 0.05);
          } else if (animationMode === 'wave') {
            brightness = 0.7 + 0.3 * Math.sin(elapsed * 3 - (pt.x + pt.y) * 0.08);
          } else if (animationMode === 'sequential') {
            const progress = (elapsed * 2500) % TOTAL_QURAN_WORDS;
            brightness = idx <= progress ? 1 : 0.2;
          }

          ctx.globalAlpha = brightness;
          ctx.fillStyle = glowColors.main;
          ctx.fillRect(pt.x * unitSize, pt.y * unitSize, pixelSize, pixelSize);

          // For rare/few occurrences (like 'محمد' 4 times or 'أحمد' 1 time), draw an attention-drawing beacon halo
          if (highlightedIndices.size <= 25) {
            const pulseRadius = (pixelSize * 3.5) + (Math.sin(elapsed * 5 + idx) + 1) * (pixelSize * 2);
            ctx.save();
            ctx.strokeStyle = glowColors.main;
            ctx.lineWidth = Math.max(1, 1.5 / zoom);
            ctx.globalAlpha = 0.4 + 0.4 * Math.sin(elapsed * 5 + idx);
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

      // 3. Draw Hover Indicator
      if (hoveredWordIndex !== null && layout.points[hoveredWordIndex]) {
        const hPt = layout.points[hoveredWordIndex];
        const hx = hPt.x * unitSize;
        const hy = hPt.y * unitSize;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.5 / zoom, 1);
        ctx.strokeRect(hx - 2, hy - 2, pixelSize + 4, pixelSize + 4);
      }

      ctx.restore();

      // If animated, loop
      if (hasHighlights && (animationMode === 'pulse' || animationMode === 'wave' || animationMode === 'sequential')) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [layout, pan, zoom, pixelSize, pixelGap, glowTheme, bgTheme, glowIntensity, highlightedIndices, animationMode, hoveredWordIndex]);

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

    // Zoom centered around mouse pointer
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

  // Mouse Move: Pan or Hover Detection
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

    // Hover search: map mouse canvas pos to world coordinate
    const worldX = (mouseCanvasX - pan.x) / zoom;
    const worldY = (mouseCanvasY - pan.y) / zoom;
    const unitSize = pixelSize + pixelGap;

    const gridX = Math.round(worldX / unitSize);
    const gridY = Math.round(worldY / unitSize);

    // Find nearest point within proximity
    let closestIndex: number | null = null;
    let minDist = 4 * 4;

    for (let i = 0; i < layout.points.length; i++) {
      const pt = layout.points[i];
      if (!pt) continue;
      const dx = pt.x - gridX;
      const dy = pt.y - gridY;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }

    setHoveredWordIndex(closestIndex);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (hoveredWordIndex !== null) {
      onSelectWord(hoveredWordIndex);
    }
  };

  // Hovered Word Info
  const words = getQuranWords();
  const hoveredWordObj = hoveredWordIndex !== null ? words[hoveredWordIndex] : null;
  const hoveredSurah = hoveredWordIndex !== null ? getSurahForWordIndex(hoveredWordIndex) : null;
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
        className={`w-full h-full block ${isDragging ? 'cursor-grabbing' : hoveredWordIndex !== null ? 'cursor-pointer' : 'cursor-grab'}`}
      />

      {/* Floating Canvas View Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-lg backdrop-blur-md">
        <button
          onClick={() => {
            const newZoom = Math.min(8, zoom * 1.3);
            setZoom(newZoom);
          }}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="تكبير"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const newZoom = Math.max(0.15, zoom * 0.7);
            setZoom(newZoom);
          }}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="تصغير"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => resetTransform()}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="إعادة التمركز والتكبير الافتراضي"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Shape Indicator Tag */}
      <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs text-slate-300 flex items-center gap-2 font-medium">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>
          {shape === 'square' ? 'لوحة مربعة' :
           shape === 'rectangle' ? 'لوحة مستطيلة' :
           shape === 'circle' ? 'قرص دائري ذهبي' :
           shape === 'mushaf' ? 'مصحف ٦٠٤ صفحات' :
           shape === 'spiral' ? 'مسار حلزوني' :
           shape === 'crescent' ? 'هلال إسلامي' : 'محراب معماري'}
        </span>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-amber-300">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Interactive Tooltip when hovering over any pixel */}
      {hoveredWordObj && hoveredSurah && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-950/95 border border-amber-500/40 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md text-right min-w-[220px] max-w-[320px] transition-all"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 12}px`
          }}
          dir="rtl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              سورة {hoveredSurah.nameArabic}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              الآية {hoveredWordObj.ayah}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-serif text-slate-100 font-bold">
              الكلمة: <span className={isHoveredLit ? 'text-amber-300 underline font-extrabold' : 'text-slate-200'}>«{hoveredWordObj.text}»</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>ترتيب الكلمة: #{hoveredWordObj.id.toLocaleString('ar-EG')}</span>
              <span className="text-amber-400/90 text-[10px]">اضغط لعرض تفاصيل الآية</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom status bar in Canvas */}
      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between pointer-events-none text-xs text-slate-400">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-lg pointer-events-auto flex items-center gap-2">
          <span>اسحب للتحريك</span>
          <span className="text-slate-600">·</span>
          <span>عجلة الفأرة للتكبير</span>
          <span className="text-slate-600">·</span>
          <span>اضغط على أي بكسل للاستكشاف</span>
        </div>
        
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-lg pointer-events-auto font-mono text-amber-400">
          ٧٧,٨٢٥ بكسل قرآنية
        </div>
      </div>
    </div>
  );
};
