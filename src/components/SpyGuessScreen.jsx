import React, { useMemo } from 'react';
import { Search, TriangleAlert, Clock } from 'lucide-react';
import { WORDS } from '../utils/constants';
import { shuffleArray } from '../utils/helpers';

export default function SpyGuessScreen({ spyNames, context, selectedWord, onWordSelect, onGuess, onBack }) {
  const shuffled = useMemo(() => shuffleArray(WORDS), []);
  
  const spyNamesStr = spyNames.join(' و ');
  const isMulti = spyNames.length > 1;
  const spyLabel = isMulti ? 'جاسوس‌ها' : 'جاسوس';

  const config = {
    caught: {
      title: `${spyLabel} پیدا شدید!`,
      subtitle: `${spyNamesStr} یک شانس آخر برای حدس کلمه دارید`,
      icon: TriangleAlert,
    },
    timeout: {
      title: 'وقت تمام شد!',
      subtitle: `${spyLabel} باید کلمه مخفی را حدس بزند`,
      icon: Clock,
    },
    reveal: {
      title: `${spyLabel} خودش را لو داد!`,
      subtitle: `${spyNamesStr} حالا باید کلمه مخفی را حدس بزند`,
      icon: Search,
    }
  };

  const current = config[context] || config.reveal;
  const Icon = current.icon;

  return (
    
    <div className="absolute inset-0 flex flex-col items-center p-4 screen-enter overflow-y-auto bg-white">
      <div className="flex flex-col gap-5 w-full max-w-lg pb-6">
        {/* Context Banner */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl flex-shrink-0">
              <Icon size={24} className="text-black" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">{current.title}</h2>
              <p className="text-sm text-gray-500 mt-2">{current.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
  <button
    onClick={onBack}
    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
  >
    ←
  </button>

  <div className="text-sm text-gray-400">
    حدس جاسوس
  </div>

  <div className="w-10" />
</div>

        {/* Spy Names */}
        <div className="text-center bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-2">حدس کلمه توسط</p>
          <p className="text-lg font-bold text-black">{spyNamesStr}</p>
        </div>

        {/* Word Grid */}
        <div>
          <p className="text-xs font-medium text-gray-400 text-center mb-3 uppercase tracking-wider">
            کلمه مخفی کدام است؟
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto">
            {shuffled.map((word, i) => (
              <button
                key={i}
                onClick={() => onWordSelect(word)}
                className={`p-3.5 rounded-xl text-center transition-all duration-200 min-h-[55px] flex items-center justify-center
                  ${selectedWord === word
                    ? 'bg-black text-white scale-[1.02] font-semibold'
                    : 'bg-gray-50 text-black active:bg-gray-100 font-medium'
                  }`}
              >
                <span className="text-sm leading-relaxed break-words">{word}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => selectedWord && onGuess(selectedWord)}
          disabled={!selectedWord}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2
            ${selectedWord
              ? 'bg-black text-white active:scale-[0.98]'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
        >
          <Search size={20} />
          <span>
            {selectedWord 
              ? `تأیید کلمه "${selectedWord}"`
              : 'ابتدا یک کلمه انتخاب کنید'
            }
          </span>
        </button>
      </div>
    </div>
  );
}