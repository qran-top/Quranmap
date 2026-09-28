import React from 'react';
import { SURAHS, TOTAL_QURAN_WORDS } from '../data/surahs';
import { getQuranWords } from '../data/quranDataset';
import { BarChart3, PieChart, Sparkles } from 'lucide-react';

interface StatsBarProps {
  searchQuery: string;
  highlightedIndices: Set<number>;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  searchQuery,
  highlightedIndices
}) => {
  if (!searchQuery.trim() || highlightedIndices.size === 0) {
    return null;
  }

  const words = getQuranWords();
  const juzCounts = new Array(30).fill(0);
  let meccanCount = 0;
  let medinanCount = 0;

  highlightedIndices.forEach(idx => {
    const w = words[idx];
    if (w) {
      const s = SURAHS.find(surah => surah.id === w.surah);
      if (s) {
        if (s.revelationType === 'Meccan') meccanCount++;
        else medinanCount++;
        const juzIdx = Math.min(29, Math.max(0, s.juzStart - 1));
        juzCounts[juzIdx]++;
      }
    }
  });

  const maxJuzCount = Math.max(...juzCounts, 1);
  const totalMatches = highlightedIndices.size;

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4" dir="rtl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white">
            إحصائيات وتوزيع كلمة <span className="text-amber-400">"{searchQuery}"</span> في القرآن الكريم:
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>مكية: <strong className="text-emerald-400">{meccanCount}</strong> ({Math.round((meccanCount / totalMatches) * 100)}%)</span>
          <span className="text-slate-600">·</span>
          <span>مدنية: <strong className="text-cyan-400">{medinanCount}</strong> ({Math.round((medinanCount / totalMatches) * 100)}%)</span>
        </div>
      </div>

      {/* 30 Juz distribution mini bars */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>التوزيع عبر أجزاء القرآن الثلاثين (من الجزء ١ إلى الجزء ٣٠):</span>
          <span>أعلى كثافة: {maxJuzCount} تكرار</span>
        </div>
        <div className="grid grid-cols-15 sm:grid-cols-30 gap-1 h-12 items-end pt-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
          {juzCounts.map((count, i) => {
            const heightPct = count > 0 ? Math.max(15, (count / maxJuzCount) * 100) : 4;
            return (
              <div
                key={i}
                title={`الجزء ${i + 1}: ${count} تكرار`}
                className="group relative flex flex-col items-center h-full justify-end"
              >
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t transition-all ${
                    count > 0
                      ? 'bg-amber-400 group-hover:bg-amber-300 shadow-sm shadow-amber-400/30'
                      : 'bg-slate-800/50'
                  }`}
                />
                <span className="text-[8px] font-mono text-slate-500 mt-1 hidden sm:block">
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
