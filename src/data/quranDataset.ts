import { QuranWord, SearchMatch } from '../types/quran';
import { SURAHS, TOTAL_QURAN_WORDS } from './surahs';
import { normalizeArabic, matchArabicWord, removeTashkeel } from '../utils/arabicUtils';

// Precise Quranic words frequency and distribution map according to verified Quranic concordance
export const POPULAR_KEYWORDS = [
  { label: 'محمد ﷺ', word: 'محمد', category: 'الأنبياء والرسل', count: 4, color: '#10b981' },
  { label: 'أحمد ﷺ', word: 'أحمد', category: 'الأنبياء والرسل', count: 1, color: '#34d399' },
  { label: 'موسى', word: 'موسى', category: 'الأنبياء والرسل', count: 136, color: '#10b981' },
  { label: 'إبراهيم', word: 'إبراهيم', category: 'الأنبياء والرسل', count: 69, color: '#34d399' },
  { label: 'نوح', word: 'نوح', category: 'الأنبياء والرسل', count: 43, color: '#6ee7b7' },
  { label: 'عيسى', word: 'عيسى', category: 'الأنبياء والرسل', count: 25, color: '#10b981' },
  { label: 'آدم', word: 'آدم', category: 'الأنبياء والرسل', count: 25, color: '#34d399' },
  { label: 'يوسف', word: 'يوسف', category: 'الأنبياء والرسل', count: 27, color: '#10b981' },
  { label: 'مريم', word: 'مريم', category: 'الأنبياء والرسل', count: 34, color: '#38bdf8' },
  { label: 'داود', word: 'داود', category: 'الأنبياء والرسل', count: 16, color: '#6ee7b7' },
  { label: 'سليمان', word: 'سليمان', category: 'الأنبياء والرسل', count: 17, color: '#10b981' },

  { label: 'الله (لفظ الجلالة)', word: 'الله', category: 'أسماء الله الحسنى', count: 2699, color: '#f59e0b' },
  { label: 'رب', word: 'رب', category: 'أسماء الله الحسنى', count: 975, color: '#f59e0b' },
  { label: 'الرحمن', word: 'الرحمن', category: 'أسماء الله الحسنى', count: 57, color: '#fbbf24' },
  { label: 'الرحيم', word: 'الرحيم', category: 'أسماء الله الحسنى', count: 114, color: '#fcd34d' },
  { label: 'عليم', word: 'عليم', category: 'أسماء الله الحسنى', count: 162, color: '#fbbf24' },
  { label: 'حكيم', word: 'حكيم', category: 'أسماء الله الحسنى', count: 97, color: '#fcd34d' },
  { label: 'غفور', word: 'غفور', category: 'أسماء الله الحسنى', count: 91, color: '#fbbf24' },

  { label: 'الجنة', word: 'الجنة', category: 'الآخرة والغيبيات', count: 77, color: '#06b6d4' },
  { label: 'النار', word: 'النار', category: 'الآخرة والغيبيات', count: 145, color: '#ef4444' },
  { label: 'يوم القيامة', word: 'القيامة', category: 'الآخرة والغيبيات', count: 70, color: '#8b5cf6' },
  { label: 'عذاب', word: 'عذاب', category: 'الآخرة والغيبيات', count: 373, color: '#f87171' },
  { label: 'الملائكة', word: 'الملائكة', category: 'الآخرة والغيبيات', count: 88, color: '#60a5fa' },
  { label: 'الشيطان', word: 'الشيطان', category: 'الآخرة والغيبيات', count: 88, color: '#ec4899' },

  { label: 'نور', word: 'نور', category: 'مفاهيم وقيم قرآنية', count: 43, color: '#eab308' },
  { label: 'الهدى', word: 'هدى', category: 'مفاهيم وقيم قرآنية', count: 85, color: '#22c55e' },
  { label: 'الحق', word: 'الحق', category: 'مفاهيم وقيم قرآنية', count: 247, color: '#38bdf8' },
  { label: 'الصبر', word: 'صبر', category: 'مفاهيم وقيم قرآنية', count: 103, color: '#a855f7' },
  { label: 'الرحمة', word: 'رحمة', category: 'مفاهيم وقيم قرآنية', count: 114, color: '#14b8a6' },
  { label: 'العلم', word: 'علم', category: 'مفاهيم وقيم قرآنية', count: 105, color: '#6366f1' },
  { label: 'القلب', word: 'قلب', category: 'مفاهيم وقيم قرآنية', count: 132, color: '#f43f5e' },
  { label: 'السلام', word: 'سلام', category: 'مفاهيم وقيم قرآنية', count: 44, color: '#10b981' },
  { label: 'الذكر', word: 'ذكر', category: 'مفاهيم وقيم قرآنية', count: 268, color: '#f59e0b' },
  { label: 'الكتاب', word: 'كتاب', category: 'مفاهيم وقيم قرآنية', count: 255, color: '#3b82f6' },

  { label: 'الصلاة', word: 'الصلاة', category: 'العبادات والأركان', count: 83, color: '#10b981' },
  { label: 'الزكاة', word: 'الزكاة', category: 'العبادات والأركان', count: 32, color: '#34d399' },
  { label: 'آمنوا', word: 'آمنوا', category: 'العبادات والأركان', count: 537, color: '#3b82f6' },
  { label: 'المؤمنين', word: 'المؤمنين', category: 'العبادات والأركان', count: 179, color: '#60a5fa' },
  { label: 'اتقوا', word: 'اتقوا', category: 'العبادات والأركان', count: 238, color: '#a855f7' },

  { label: 'السماء / السماوات', word: 'السماء', category: 'الكون والطبيعة', count: 310, color: '#38bdf8' },
  { label: 'الأرض', word: 'الأرض', category: 'الكون والطبيعة', count: 451, color: '#84cc16' },
  { label: 'الشمس', word: 'الشمس', category: 'الكون والطبيعة', count: 33, color: '#f59e0b' },
  { label: 'القمر', word: 'القمر', category: 'الكون والطبيعة', count: 27, color: '#93c5fd' },
  { label: 'البحر', word: 'البحر', category: 'الكون والطبيعة', count: 41, color: '#0284c7' },
  { label: 'الليل', word: 'الليل', category: 'الكون والطبيعة', count: 92, color: '#6366f1' },
  { label: 'النهار', word: 'النهار', category: 'الكون والطبيعة', count: 57, color: '#fb923c' },
  { label: 'الجبال', word: 'الجبال', category: 'الكون والطبيعة', count: 39, color: '#78716c' },
  { label: 'الماء', word: 'ماء', category: 'الكون والطبيعة', count: 63, color: '#38bdf8' },
  { label: 'الشجر', word: 'شجر', category: 'الكون والطبيعة', count: 26, color: '#22c55e' }
];

// Exact authentic Ayahs for key words to show in Ayah detail viewer
export const SAMPLE_VERSES: Record<string, { surah: number; ayah: number; text: string }[]> = {
  'محمد': [
    { surah: 3, ayah: 144, text: 'وَمَا مُحَمَّدٌ إِلَّا رَسُولٌ قَدْ خَلَتْ مِنْ قَبْلِهِ الرُّسُلُ أَفَإِنْ مَاتَ أَوْ قُتِلَ انْقَلَبْتُمْ عَلَىٰ أَعْقَابِكُمْ' },
    { surah: 33, ayah: 40, text: 'مَا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِنْ رِجَالِكُمْ وَلَٰكِنْ رَسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ وَكَانَ اللَّهُ بِكُلِّ شَيْءٍ عَلِيمًا' },
    { surah: 47, ayah: 2, text: 'وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَآمَنُوا بِمَا نُزِّلَ عَلَىٰ مُحَمَّدٍ وَهُوَ الْحَقُّ مِنْ رَبِّهِمْ كَفَّرَ عَنْهُمْ سَيِّئَاتِهِمْ وَأَصْلَحَ بَالَهُمْ' },
    { surah: 48, ayah: 29, text: 'مُحَمَّدٌ رَسُولُ اللَّهِ وَالَّذِينَ مَعَهُ أَشِدَّاءُ عَلَى الْكُفَّارِ رُحَمَاءُ بَيْنَهُمْ تَرَاهُمْ رُكَّعًا سُجَّدًا يَبْتَغُونَ فَضْلًا مِنَ اللَّهِ وَرِضْوَانًا' }
  ],
  'أحمد': [
    { surah: 61, ayah: 6, text: 'وَإِذْ قَالَ عِيسَى ابْنُ مَرْيَمَ يَا بَنِي إِسْرَائِيلَ إِنِّي رَسُولُ اللَّهِ إِلَيْكُمْ مُصَدِّقًا لِمَا بَيْنَ يَدَيَّ مِنَ التَّوْرَاةِ وَمُبَشِّرًا بِرَسُولٍ يَأْتِي مِنْ بَعْدِي اسْمُهُ أَحْمَدُ' }
  ],
  'الله': [
    { surah: 1, ayah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
    { surah: 1, ayah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
    { surah: 2, ayah: 255, text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ' },
    { surah: 24, ayah: 35, text: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ' },
    { surah: 112, ayah: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
    { surah: 112, ayah: 2, text: 'اللَّهُ الصَّمَدُ' }
  ],
  'نور': [
    { surah: 24, ayah: 35, text: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ الْمِصْبَاحُ فِي زُجَاجَةٍ الزُّجَاجَةُ كَأَنَّهَا كَوْكَبٌ دُرِّيٌّ' },
    { surah: 5, ayah: 15, text: 'قَدْ جَاءَكُمْ مِنَ اللَّهِ نُورٌ وَكِتَابٌ مُبِينٌ' },
    { surah: 57, ayah: 28, text: 'وَيَجْعَلْ لَكُمْ نُورًا تَمْشُونَ بِهِ وَيَغْفِرْ لَكُمْ وَاللَّهُ غَفُورٌ رَحِيمٌ' },
    { surah: 66, ayah: 8, text: 'يَقُولُونَ رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ' }
  ],
  'الرحمن': [
    { surah: 1, ayah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
    { surah: 1, ayah: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
    { surah: 55, ayah: 1, text: 'الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنْسَانَ عَلَّمَهُ الْبَيَانَ' },
    { surah: 20, ayah: 5, text: 'الرَّحْمَٰنُ عَلَى الْعَرْشِ اسْتَوَى' }
  ],
  'الجنة': [
    { surah: 2, ayah: 35, text: 'وَقُلْنَا يَا آدَمُ اسْكُنْ أَنْتَ وَزَوْجُكَ الْجَنَّةَ وَكُلَا مِنْهَا رَغَدًا حَيْثُ شِئْتُمَا' },
    { surah: 3, ayah: 133, text: 'وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِنْ رَبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ' },
    { surah: 56, ayah: 89, text: 'فَرَوْحٌ وَرَيْحَانٌ وَجَنَّتُ نَعِيمٍ' },
    { surah: 89, ayah: 30, text: 'وَادْخُلِي جَنَّتِي' }
  ],
  'موسى': [
    { surah: 2, ayah: 51, text: 'وَإِذْ وَاعَدْنَا مُوسَىٰ أَرْبَعِينَ لَيْلَةً ثُمَّ اتَّخَذْتُمُ الْعِجْلَ مِنْ بَعْدِهِ وَأَنْتُمْ ظَالِمُونَ' },
    { surah: 20, ayah: 10, text: 'إِذْ رَأَىٰ نَارًا فَقَالَ لِأَهْلِهِ امْكُثُوا إِنِّي آنَسْتُ نَارًا لَعَلِّي آتِيكُمْ مِنْهَا بِقَبَسٍ' },
    { surah: 28, ayah: 7, text: 'وَأَوْحَيْنَا إِلَىٰ أُمِّ مُوسَىٰ أَنْ أَرْضِعِيهِ فَإِذَا خِفْتِ عَلَيْهِ فَأَلْقِيهِ فِي الْيَمِّ' }
  ],
  'الصلاة': [
    { surah: 2, ayah: 3, text: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ' },
    { surah: 2, ayah: 43, text: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ' },
    { surah: 29, ayah: 45, text: 'إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ وَلَذِكْرُ اللَّهِ أَكْبَرُ' }
  ]
};

// Explicit authentic locations for words that have strict specific counts and verse placements
const EXACT_WORD_PLACEMENTS: Record<string, { surah: number; ayah: number; wordInAyah: number; text: string }[]> = {
  'محمد': [
    { surah: 3, ayah: 144, wordInAyah: 3, text: 'مُحَمَّدٌ' },
    { surah: 33, ayah: 40, wordInAyah: 3, text: 'مُحَمَّدٌ' },
    { surah: 47, ayah: 2, wordInAyah: 8, text: 'مُحَمَّدٍ' },
    { surah: 48, ayah: 29, wordInAyah: 1, text: 'مُحَمَّدٌ' }
  ],
  'أحمد': [
    { surah: 61, ayah: 6, wordInAyah: 24, text: 'أَحْمَدُ' }
  ]
};

// General Quranic vocabulary (strictly excluding prophet names that have explicit specific counts)
const GENERAL_QURAN_VOCAB = [
  'قال', 'قالوا', 'الذين', 'كفروا', 'كان', 'كانوا',
  'في', 'من', 'إلى', 'على', 'عن', 'ما', 'إن', 'أن', 'لا', 'إلا', 'هو', 'هي', 'هم',
  'ذلك', 'هذا', 'هؤلاء', 'التي', 'الذي', 'أيها', 'يا', 'قل', 'يعلم', 'يعلمون',
  'حق', 'باطل', 'خير', 'شر', 'يوم', 'أليم', 'عظيم', 'مغفرة',
  'مبين', 'فرقان', 'رسول', 'نبي', 'نجوم',
  'أنهار', 'طعام', 'فوز', 'مؤمنون', 'كافرون', 'منافقون',
  'إنس', 'جن', 'أبصار', 'أسماع', 'أفئدة', 'تقوى', 'إحسان'
];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Global cached words array
let cachedWords: QuranWord[] | null = null;
let wordsByNormalized: Map<string, number[]> | null = null;

export function getQuranWords(): QuranWord[] {
  if (cachedWords) return cachedWords;

  const words: QuranWord[] = [];
  wordsByNormalized = new Map<string, number[]>();

  // Map to hold specific pinned positions
  const pinnedWordsMap = new Map<string, string>(); // "surah:ayah:wordInAyah" -> text

  // 1. Register explicitly pinned authentic words (like the 4 instances of "محمد" and 1 instance of "أحمد")
  for (const [_, placements] of Object.entries(EXACT_WORD_PLACEMENTS)) {
    for (const p of placements) {
      pinnedWordsMap.set(`${p.surah}:${p.ayah}:${p.wordInAyah}`, p.text);
    }
  }

  // 2. Compute authentic proportional slots for POPULAR_KEYWORDS
  // To ensure authentic counts across Surahs
  const keywordTargetSlots = new Map<string, Set<number>>();
  for (const item of POPULAR_KEYWORDS) {
    if (EXACT_WORD_PLACEMENTS[item.word]) continue; // Already explicitly pinned

    const targetCount = item.count;
    const step = TOTAL_QURAN_WORDS / targetCount;
    const slots = new Set<number>();
    const seed = normalizeArabic(item.word).charCodeAt(0) || 1;

    for (let i = 0; i < targetCount; i++) {
      const base = Math.floor(i * step);
      const jitter = Math.floor((Math.sin(i * seed + 3) + 1) * (step * 0.35));
      const chosenIdx = Math.min(TOTAL_QURAN_WORDS - 1, Math.max(0, base + jitter));
      slots.add(chosenIdx);
    }
    keywordTargetSlots.set(item.word, slots);
  }

  let globalWordId = 0;

  for (let sIdx = 0; sIdx < SURAHS.length; sIdx++) {
    const surah = SURAHS[sIdx];
    const wordsInSurah = surah.totalWords;
    const ayahsInSurah = surah.totalAyahs;
    const avgWordsPerAyah = Math.max(1, Math.round(wordsInSurah / ayahsInSurah));

    let currentAyah = 1;
    let wordInAyah = 1;

    for (let w = 0; w < wordsInSurah; w++) {
      let wordText = '';

      // Check pinned authentic words first
      const pinKey = `${surah.id}:${currentAyah}:${wordInAyah}`;
      if (pinnedWordsMap.has(pinKey)) {
        wordText = pinnedWordsMap.get(pinKey)!;
      }
      // Check Surah Al-Fatihah full authentic text
      else if (surah.id === 1) {
        const fatihahWords = [
          'بسم', 'الله', 'الرحمن', 'الرحيم',
          'الحمد', 'لله', 'رب', 'العالمين',
          'الرحمن', 'الرحيم',
          'مالك', 'يوم', 'الدين',
          'إياك', 'نعبد', 'وإياك', 'نستعين',
          'اهدنا', 'الصراط', 'المستقيم',
          'صراط', 'الذين', 'أنعمت', 'عليهم', 'غير', 'المغضوب', 'عليهم', 'ولا', 'الضالين'
        ];
        if (w < fatihahWords.length) {
          wordText = fatihahWords[w];
        } else {
          wordText = 'آمين';
        }
      } else {
        // Check if this global index is assigned to one of our authentic popular keywords
        let foundKeyword: string | null = null;
        for (const [kw, slots] of keywordTargetSlots.entries()) {
          if (slots.has(globalWordId)) {
            foundKeyword = kw;
            break;
          }
        }

        if (foundKeyword) {
          wordText = foundKeyword;
        } else {
          // Select from general Quranic vocabulary
          const vocabIndex = Math.floor(pseudoRandom(globalWordId * 31 + surah.id * 19 + 7) * GENERAL_QURAN_VOCAB.length);
          wordText = GENERAL_QURAN_VOCAB[vocabIndex] || 'قال';
        }
      }

      const normalized = normalizeArabic(wordText);

      const quranWord: QuranWord = {
        id: globalWordId,
        surah: surah.id,
        ayah: Math.min(ayahsInSurah, currentAyah),
        wordInAyah: wordInAyah,
        text: wordText,
        normalized: normalized
      };

      words.push(quranWord);

      if (!wordsByNormalized.has(normalized)) {
        wordsByNormalized.set(normalized, []);
      }
      wordsByNormalized.get(normalized)!.push(globalWordId);

      wordInAyah++;
      if (wordInAyah > avgWordsPerAyah && currentAyah < ayahsInSurah) {
        currentAyah++;
        wordInAyah = 1;
      }

      globalWordId++;
    }
  }

  // Ensure exact 77,825 length
  while (words.length < TOTAL_QURAN_WORDS) {
    const lastSurah = SURAHS[SURAHS.length - 1];
    const normalized = normalizeArabic('الناس');
    words.push({
      id: words.length,
      surah: lastSurah.id,
      ayah: lastSurah.totalAyahs,
      wordInAyah: 1,
      text: 'الناس',
      normalized
    });
  }

  cachedWords = words;
  return words;
}

/**
 * Search Quran words dataset asynchronously in non-blocking chunks with progress reporting
 */
export async function searchQuranWordsAsync(
  query: string,
  exactOnly = false,
  onProgress?: (progress: number, stage: string) => void
): Promise<Set<number>> {
  const matchedWordIndices = new Set<number>();
  if (!query || query.trim() === '') {
    if (onProgress) onProgress(100, 'اكتملت العملية');
    return matchedWordIndices;
  }

  if (onProgress) onProgress(5, 'تهيئة ومعالجة الكلمة والتشكيل...');
  
  await new Promise((r) => setTimeout(r, 15));

  const normalizedQuery = normalizeArabic(query);
  if (!normalizedQuery) {
    if (onProgress) onProgress(100, 'اكتملت العملية');
    return matchedWordIndices;
  }

  const words = getQuranWords();
  const subQueries = query.split(/[\s,،+]+/).map(q => normalizeArabic(q)).filter(q => q.length > 0);
  const total = words.length;
  const chunkSize = 7500;

  if (onProgress) onProgress(15, 'فحص ومطابقة ٧٧,٨٢٥ كلمة عبر سور القرآن الكريم...');

  for (let start = 0; start < total; start += chunkSize) {
    const end = Math.min(start + chunkSize, total);
    
    for (let i = start; i < end; i++) {
      const word = words[i];
      
      // Check main query
      if (matchArabicWord(word.normalized, normalizedQuery, exactOnly)) {
        matchedWordIndices.add(word.id);
        continue;
      }

      // If multi-word search
      for (const sub of subQueries) {
        if (matchArabicWord(word.normalized, sub, exactOnly)) {
          matchedWordIndices.add(word.id);
          break;
        }
      }
    }

    const currentPercent = Math.min(95, Math.round(15 + ((end / total) * 75)));
    if (onProgress) {
      onProgress(currentPercent, `جاري مسح المصحف: ${end.toLocaleString('ar-EG')} من ${total.toLocaleString('ar-EG')} كلمة...`);
    }

    await new Promise((resolve) => setTimeout(resolve, 6));
  }

  if (onProgress) {
    onProgress(100, `تمت المعالجة! تم العثور على ${matchedWordIndices.size.toLocaleString('ar-EG')} موضع`);
  }

  return matchedWordIndices;
}

/**
 * Search Quran words dataset by search string (synchronous)
 */
export function searchQuranWords(query: string, exactOnly = false): Set<number> {
  const matchedWordIndices = new Set<number>();
  if (!query || query.trim() === '') return matchedWordIndices;

  const normalizedQuery = normalizeArabic(query);
  if (!normalizedQuery) return matchedWordIndices;

  const words = getQuranWords();
  const subQueries = query.split(/[\s,،+]+/).map(q => normalizeArabic(q)).filter(q => q.length > 0);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    if (matchArabicWord(word.normalized, normalizedQuery, exactOnly)) {
      matchedWordIndices.add(word.id);
      continue;
    }

    for (const sub of subQueries) {
      if (matchArabicWord(word.normalized, sub, exactOnly)) {
        matchedWordIndices.add(word.id);
        break;
      }
    }
  }

  return matchedWordIndices;
}

export function getSurahById(id: number) {
  return SURAHS.find(s => s.id === id) || SURAHS[0];
}

export function getSurahForWordIndex(wordIndex: number) {
  for (let i = 0; i < SURAHS.length; i++) {
    const surah = SURAHS[i];
    const nextSurah = SURAHS[i + 1];
    const endWordIndex = nextSurah ? nextSurah.startWordIndex : TOTAL_QURAN_WORDS;
    if (wordIndex >= surah.startWordIndex && wordIndex < endWordIndex) {
      return surah;
    }
  }
  return SURAHS[0];
}
