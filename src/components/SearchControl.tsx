import React, { useState, useEffect } from 'react';
import { Search, Sparkles, X, ChevronDown, Check, Loader2, ArrowLeft } from 'lucide-react';
import { POPULAR_KEYWORDS } from '../data/quranDataset';

interface SearchControlProps {
  currentActiveQuery: string;
  onExecuteSearch: (query: string, exact: boolean) => void;
  exactMatch: boolean;
  onToggleExactMatch: (exact: boolean) => void;
  highlightedCount: number;
  totalWords: number;
  isSearching: boolean;
  searchProgress: number;
  searchStageText: string;
}

export const SearchControl: React.FC<SearchControlProps> = ({
  currentActiveQuery,
  onExecuteSearch,
  exactMatch,
  onToggleExactMatch,
  highlightedCount,
  totalWords,
  isSearching,
  searchProgress,
  searchStageText
}) => {
  const [inputValue, setInputValue] = useState<string>(currentActiveQuery);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [showCategories, setShowCategories] = useState<boolean>(false);
  const [showProgressBar, setShowProgressBar] = useState<boolean>(false);

  // Sync internal input when active query changes externally
  useEffect(() => {
    setInputValue(currentActiveQuery);
  }, [currentActiveQuery]);

  // Keep progress bar visible for a moment after completion before fading away
  useEffect(() => {
    if (isSearching) {
      setShowProgressBar(true);
    } else {
      const timer = setTimeout(() => {
        setShowProgressBar(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isSearching]);

  const categories = [
    'الكل',
    'أسماء الله الحسنى',
    'الأنبياء والرسل',
    'مفاهيم وقيم قرآنية',
    'الكون والطبيعة',
    'العبادات والأركان',
    'الآخرة والغيبيات'
  ];

  const filteredKeywords = activeCategory === 'الكل'
    ? POPULAR_KEYWORDS
    : POPULAR_KEYWORDS.filter(k => k.category === activeCategory);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onExecuteSearch(inputValue, exactMatch);
  };

  const handleQuickKeywordClick = (word: string) => {
    setInputValue(word);
    onExecuteSearch(word, exactMatch);
  };

  const handleClear = () => {
    setInputValue('');
    onExecuteSearch('', exactMatch);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Top Search Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="quran-search" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>اكتب الكلمة ثم اضغط زر "بحث" لإنارة مواضعها:</span>
          </label>
          
          <button
            type="button"
            onClick={() => onToggleExactMatch(!exactMatch)}
            className={`text-xs px-2.5 py-1 rounded-md transition-all flex items-center gap-1 border ${
              exactMatch
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium'
                : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Check className={`w-3 h-3 ${exactMatch ? 'opacity-100' : 'opacity-0'}`} />
            <span>مطابقة تامة</span>
          </button>
        </div>

        {/* Input and Action Button Group */}
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <input
              id="quran-search"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اكتب كلمة، مثل: الله، نور، موسى، الجنة، الصلاة، هدى..."
              className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 text-white placeholder-slate-500 text-base sm:text-lg rounded-xl px-4 py-3 pr-11 pl-11 transition-all outline-none"
              dir="rtl"
              autoComplete="off"
              spellCheck="false"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5 text-amber-400/80" />
            </div>

            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-300 p-1 hover:bg-slate-800 rounded-md transition-colors"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dedicated Search Button */}
          <button
            type="submit"
            disabled={isSearching}
            className={`px-5 sm:px-6 py-3 rounded-xl font-bold font-arabic text-sm sm:text-base flex items-center gap-2 transition-all shrink-0 select-none shadow-lg ${
              isSearching
                ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                <span>جاري البحث...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-slate-950" />
                <span>بـحـث</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Dynamic Non-Blocking Processing Progress Bar */}
      {showProgressBar && (
        <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-arabic font-medium text-amber-300 flex items-center gap-1.5">
              <Loader2 className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''} text-amber-400`} />
              <span>{searchStageText || 'جاري معالجة الكلمات ومطابقتها...'}</span>
            </span>
            <span className="font-mono font-bold text-amber-400 text-xs">
              {searchProgress}%
            </span>
          </div>

          {/* Bar track and animated fill */}
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(251,191,36,0.6)]"
              style={{ width: `${searchProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Illumination Results Status Bar */}
      {currentActiveQuery.trim() ? (
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-slate-300 font-arabic">
              الكلمة المضاءة: <strong className="text-amber-300 font-bold text-base">"{currentActiveQuery}"</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 font-mono">
            <span>
              أُنيرت <strong className="text-amber-400 font-bold">{highlightedCount.toLocaleString('ar-EG')}</strong> بكسل
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-300 font-medium">
              {((highlightedCount / totalWords) * 100).toFixed(2)}% من المصحف
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-400 flex items-center justify-between font-arabic">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            اختر كلمة من المقترحات أو اكتب في المربع ثم انقر بحث:
          </span>
          <span className="text-slate-500 font-mono">إجمالي: ٧٧,٨٢٥ بكسل</span>
        </div>
      )}

      {/* Category Tabs for Quick Keyword Chips */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-arabic font-medium">كلمات شائعة للإنارة السريعة (انقر للبحث المباشر):</span>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {categories.slice(0, 3).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-arabic whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCategories(!showCategories)}
              className="px-2 py-1 text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1 font-arabic"
            >
              <span>المزيد</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showCategories && (
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950/60 rounded-lg border border-slate-800 animate-in fade-in duration-150">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setShowCategories(false);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-arabic transition-colors ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Quick Words Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-0.5 custom-scrollbar p-1">
          {filteredKeywords.map((item) => {
            const isSelected = currentActiveQuery.trim() === item.word;
            return (
              <button
                key={item.word}
                type="button"
                onClick={() => handleQuickKeywordClick(item.word)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5 border font-arabic ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-amber-500/40 hover:bg-slate-800 hover:text-amber-200'
                }`}
                title={`بحث عن: ${item.word}`}
              >
                <span>{item.word}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-amber-950/30 text-slate-900 font-bold' : 'bg-slate-900 text-slate-400'}`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
