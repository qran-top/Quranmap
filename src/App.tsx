/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { SearchControl } from './components/SearchControl';
import { ShapeControl } from './components/ShapeControl';
import { PixelCanvas } from './components/PixelCanvas';
import { AyahDetailsModal } from './components/AyahDetailsModal';
import { StatsBar } from './components/StatsBar';
import { HelpModal } from './components/HelpModal';
import { BoardShape, GlowTheme, CanvasBgTheme, QuranWord } from './types/quran';
import { searchQuranWordsAsync, searchQuranWords, getQuranWords } from './data/quranDataset';
import { TOTAL_QURAN_WORDS } from './data/surahs';
import { Sparkles, Sliders, Info } from 'lucide-react';

export default function App() {
  // Search & Filter State
  const [activeQuery, setActiveQuery] = useState<string>('الله');
  const [exactMatch, setExactMatch] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchProgress, setSearchProgress] = useState<number>(0);
  const [searchStageText, setSearchStageText] = useState<string>('');

  // Illuminated pixel indices state
  const [highlightedIndices, setHighlightedIndices] = useState<Set<number>>(() => {
    return searchQuranWords('الله', false);
  });

  // Shape & Layout Customization State
  const [currentShape, setCurrentShape] = useState<BoardShape>('square');
  const [columns, setColumns] = useState<number>(279);
  const [pixelSize, setPixelSize] = useState<number>(2);
  const [pixelGap, setPixelGap] = useState<number>(0.5);
  const [glowTheme, setGlowTheme] = useState<GlowTheme>('gold');
  const [bgTheme, setBgTheme] = useState<CanvasBgTheme>('kaaba-black');
  const [glowIntensity, setGlowIntensity] = useState<number>(1.2);
  const [animationMode, setAnimationMode] = useState<'instant' | 'wave' | 'pulse' | 'sequential'>('pulse');

  // Modals & Inspection State
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'search' | 'shape'>('search');

  // Export ref
  const canvasExportRef = useRef<(() => string | null) | null>(null);

  // Quran words list
  const allWords = useMemo(() => getQuranWords(), []);

  // Async search executor
  const handleExecuteSearch = useCallback(async (query: string, exact: boolean) => {
    setActiveQuery(query);
    setIsSearching(true);
    setSearchProgress(0);
    setSearchStageText('بدء المعالجة...');

    try {
      const results = await searchQuranWordsAsync(
        query,
        exact,
        (progress, stage) => {
          setSearchProgress(progress);
          setSearchStageText(stage);
        }
      );

      setHighlightedIndices(results);

      // Celebration confetti if matches found
      if (results.size > 0 && query.trim()) {
        confetti({
          particleCount: Math.min(60, results.size),
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#fbbf24', '#34d399', '#38bdf8', '#f59e0b']
        });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Toggle exact match
  const handleToggleExactMatch = useCallback((exact: boolean) => {
    setExactMatch(exact);
    if (activeQuery) {
      handleExecuteSearch(activeQuery, exact);
    }
  }, [activeQuery, handleExecuteSearch]);

  const selectedWord: QuranWord | null = selectedWordIndex !== null ? allWords[selectedWordIndex] || null : null;

  // Export High-Res Canvas Poster
  const handleExportImage = () => {
    if (canvasExportRef.current) {
      const dataUrl = canvasExportRef.current();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `quran-pixel-board-${activeQuery || 'full'}-${currentShape}.png`;
        link.href = dataUrl;
        link.click();
      }
    }
  };

  const handleResetView = () => {
    setPixelSize(2);
    setPixelGap(0.5);
    setGlowIntensity(1.2);
    setColumns(279);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar */}
      <Header
        onOpenHelp={() => setShowHelpModal(true)}
        onResetView={handleResetView}
        onExportImage={handleExportImage}
        highlightedCount={highlightedIndices.size}
        currentWord={activeQuery}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        
        {/* Intro banner */}
        <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-xl font-bold text-white font-arabic flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>مصحف البكسل الرقمي: ٧٧,٨٢٥ كلمة من نور</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed font-arabic">
              كل بكسل في هذه اللوحة يمثل كلمة من كلمات القرآن الكريم مرتبة بالتتابع من الفاتحة إلى الناس. اكتب أي كلمة ثم انقر <strong className="text-amber-400">بحث</strong> لإنارة كافة مواضعها دون أي تعليق، أو خصص شكل اللوحة بحرية.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold font-arabic rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'search'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>إنارة الكلمات</span>
              </button>
              <button
                onClick={() => setActiveTab('shape')}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold font-arabic rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'shape'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>أبعاد وشكل اللوحة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dual Control & Canvas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-5 order-2 lg:order-1">
            {activeTab === 'search' ? (
              <SearchControl
                currentActiveQuery={activeQuery}
                onExecuteSearch={handleExecuteSearch}
                exactMatch={exactMatch}
                onToggleExactMatch={handleToggleExactMatch}
                highlightedCount={highlightedIndices.size}
                totalWords={TOTAL_QURAN_WORDS}
                isSearching={isSearching}
                searchProgress={searchProgress}
                searchStageText={searchStageText}
              />
            ) : (
              <ShapeControl
                currentShape={currentShape}
                onShapeChange={setCurrentShape}
                columns={columns}
                onColumnsChange={setColumns}
                pixelSize={pixelSize}
                onPixelSizeChange={setPixelSize}
                pixelGap={pixelGap}
                onPixelGapChange={setPixelGap}
                glowTheme={glowTheme}
                onGlowThemeChange={setGlowTheme}
                bgTheme={bgTheme}
                onBgThemeChange={setBgTheme}
                glowIntensity={glowIntensity}
                onGlowIntensityChange={setGlowIntensity}
                animationMode={animationMode}
                onAnimationModeChange={setAnimationMode}
              />
            )}

            {/* Distribution Statistics Widget */}
            <StatsBar
              searchQuery={activeQuery}
              highlightedIndices={highlightedIndices}
            />

            {/* Quick Inspiration Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2 font-arabic">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>تلميح تفاعلي:</span>
              </span>
              <p className="leading-relaxed">
                انقر على أي بكسل مضيء أو خافت على لوحة العرض لتستكشف نص الآية الكاملة مع اسم السورة والاستماع لتلاوتها العطرة بصوت القارئ مباشرة.
              </p>
            </div>
          </div>

          {/* Interactive Pixel Canvas Column */}
          <div className="lg:col-span-8 order-1 lg:order-2 space-y-3">
            <PixelCanvas
              shape={currentShape}
              columns={columns}
              pixelSize={pixelSize}
              pixelGap={pixelGap}
              glowTheme={glowTheme}
              bgTheme={bgTheme}
              glowIntensity={glowIntensity}
              animationMode={animationMode}
              highlightedIndices={highlightedIndices}
              searchQuery={activeQuery}
              onSelectWord={(wordIdx) => setSelectedWordIndex(wordIdx)}
              canvasExportRef={canvasExportRef}
            />
          </div>
        </div>
      </main>

      {/* Ayah Details Inspection Modal */}
      {selectedWord && (
        <AyahDetailsModal
          word={selectedWord}
          onClose={() => setSelectedWordIndex(null)}
          onSearchThisWord={(wordText) => handleExecuteSearch(wordText, exactMatch)}
        />
      )}

      {/* Help & Guide Modal */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
}
