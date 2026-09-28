import React from 'react';
import { X, Sparkles, BookOpen, Layers, MousePointer, Download } from 'lucide-react';
import { TOTAL_QURAN_WORDS } from '../data/surahs';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              عن لوحة بكسل كلمات القرآن الكريم
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-amber-200 font-medium">
              تضم هذه اللوحة التفاعلية <strong>{TOTAL_QURAN_WORDS.toLocaleString('ar-EG')} بكسل</strong>، يمثل كل بكسل كلمة مفردة في القرآن الكريم بالتتابع من أول سورة الفاتحة وحتى خاتمة سورة الناس عبر ١١٤ سورة و٣٠ جزءاً.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-white block text-sm">١. إنارة البكسلات بالبحث:</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  اكتب أي كلمة في مربع البحث (مثل "الله"، "نور"، "موسى"، "الجنة") لترى كل مواضع ورودها تضيء فوراً بنور وهاج على اللوحة.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-white block text-sm">٢. تغيير شكل وهيئة اللوحة:</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  يمكنك تحويل ترتيب البكسلات إلى أشكال هندسية متعددة: مربع متساوي الأضلاع، مستطيل، قرص دائري ذهبي، مصحف (٦٠٤ صفحات)، حلزوني، هلال، أو محراب إسلامي، مع التحكم بحجم البكسلات وألوان الإنارة.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <MousePointer className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-white block text-sm">٣. التكبير والتجول والاستماع:</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  استخدم عجلة الفأرة للتكبير، واسحب للتحريك في أي اتجاه. انقر على أي بكسل لمعاينة الآية كاملة والاستماع لتلاوتها بصوت الشيخ مشاري راشد العفاسي.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <Download className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-white block text-sm">٤. تصدير اللوحة:</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  يمكنك تنزيل وتصدير لوحتك المضيئة كصورة عالية الدقة لحفظها ومشاركتها.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-colors"
          >
            بدء الاستكشاف
          </button>
        </div>
      </div>
    </div>
  );
};
