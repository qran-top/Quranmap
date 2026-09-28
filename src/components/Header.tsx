import React from 'react';
import { Sparkles, Download, HelpCircle, RotateCcw } from 'lucide-react';
import { TOTAL_QURAN_WORDS } from '../data/surahs';

interface HeaderProps {
  onOpenHelp: () => void;
  onResetView: () => void;
  onExportImage: () => void;
  highlightedCount: number;
  currentWord: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onResetView,
  onExportImage,
  highlightedCount,
  currentWord
}) => {
  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-serif">
            لوحة بكسل كلمات القرآن الكريم
          </h1>
        </div>
      </div>

      {/* Zone 2: Informational Unboxed Metadata */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 tabular-nums">
        <span className="text-slate-300 font-medium">{TOTAL_QURAN_WORDS.toLocaleString('ar-EG')} كلمة</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>١١٤ سورة</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>٣٠ جزء</span>
        {currentWord && (
          <>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-amber-400 font-medium">
              المنار: {highlightedCount.toLocaleString('ar-EG')} بكسل ({((highlightedCount / TOTAL_QURAN_WORDS) * 100).toFixed(2)}%)
            </span>
          </>
        )}
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetView}
          title="إعادة ضبط الرؤية والموضع"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">إعادة ضبط</span>
        </button>

        <button
          onClick={onExportImage}
          title="تصدير اللوحة كصورة عالية الدقة"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-200 hover:text-amber-100 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/50 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-950/40"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">تصدير لوحة</span>
        </button>

        <button
          onClick={onOpenHelp}
          title="عن المشروع ودليل الاستخدام"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
