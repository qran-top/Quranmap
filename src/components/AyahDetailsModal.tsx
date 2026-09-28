import React, { useState } from 'react';
import { X, Volume2, VolumeX, Sparkles, BookOpen, MapPin, Share2, Check } from 'lucide-react';
import { QuranWord } from '../types/quran';
import { getSurahById, SAMPLE_VERSES } from '../data/quranDataset';

interface AyahDetailsModalProps {
  word: QuranWord | null;
  onClose: () => void;
  onSearchThisWord: (wordText: string) => void;
}

export const AyahDetailsModal: React.FC<AyahDetailsModalProps> = ({
  word,
  onClose,
  onSearchThisWord
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!word) return null;

  const surah = getSurahById(word.surah);

  // Check if we have authentic sample verse text for this word or construct context
  const sampleVerses = SAMPLE_VERSES[word.text] || [];
  const matchedSample = sampleVerses.find(v => v.surah === word.surah && v.ayah === word.ayah) || sampleVerses[0];

  const ayahText = matchedSample ? matchedSample.text : `... ${word.text} ...`;

  // Audio stream URL using EveryAyah Mishary Rashid Alafasy
  const pad3 = (num: number) => num.toString().padStart(3, '0');
  const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${pad3(word.surah)}${pad3(word.ayah)}.mp3`;

  const handlePlayAudio = () => {
    setAudioError(false);
    const audio = new Audio(audioUrl);
    setIsPlayingAudio(true);

    audio.play().catch(() => {
      setAudioError(true);
      setIsPlayingAudio(false);
    });

    audio.onended = () => {
      setIsPlayingAudio(false);
    };
  };

  const handleCopyAyah = () => {
    const shareText = `﴿ ${ayahText} ﴾ [سورة ${surah.nameArabic} - الآية ${word.ayah}]`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5 overflow-hidden">
        {/* Background glow banner */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                سورة {surah.nameArabic} <span className="text-xs font-normal text-slate-400">({surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'})</span>
              </h3>
              <p className="text-xs text-slate-400">الآية {word.ayah} من أصل {surah.totalAyahs} آية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Focus Banner */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 text-center space-y-2">
          <span className="text-xs text-slate-400">الكلمة المحددة على لوحة البكسل:</span>
          <div className="text-3xl font-serif font-bold text-amber-300 py-1 tracking-wide">
            « {word.text} »
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-mono">
            <span>الترتيب العام: #{word.id.toLocaleString('ar-EG')}</span>
            <span>·</span>
            <span>الكلمة في الآية: #{word.wordInAyah}</span>
          </div>
        </div>

        {/* Verse Text Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold">نص الآية الكريمة:</span>
            <button
              onClick={handleCopyAyah}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الآية'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <p className="text-xl sm:text-2xl font-serif text-slate-100 leading-loose">
              ﴿ {ayahText} ﴾
            </p>
            <p className="text-xs text-amber-400 font-sans mt-2">
              [سورة {surah.nameArabic} - الآية {word.ayah}]
            </p>
          </div>
        </div>

        {/* Audio Recitation & Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handlePlayAudio}
            disabled={isPlayingAudio}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm transition-all ${
              isPlayingAudio
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-4 h-4 animate-bounce text-white" />
                <span>جارٍ تلاوة الآية...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>استماع للتلاوة (بصوت العفاسي)</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onSearchThisWord(word.text);
              onClose();
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>إنارة جميع مواضعها</span>
          </button>
        </div>

        {audioError && (
          <p className="text-xs text-rose-400 text-center">
            تعذر تحميل الملف الصوتي للآية في الوقت الحالي.
          </p>
        )}
      </div>
    </div>
  );
};
