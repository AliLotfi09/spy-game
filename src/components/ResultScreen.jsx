import React, { useEffect, useState } from 'react';
import { Trophy, RotateCcw, Home, Award, XCircle } from 'lucide-react';

export default function ResultScreen({ result, spyNames, secretWord, onNewGame, onHome }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const isSpyWin = result.winner === 'spy';
  const isMulti = spyNames.length > 1;
  const spyNamesStr = spyNames.join(' و ');

  useEffect(() => {
    if (!isSpyWin) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isSpyWin]);

  const confettiColors = ['#000000', '#333333', '#555555', '#777777', '#999999', '#BBBBBB'];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 screen-enter bg-white">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-sm animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                '--duration': `${Math.random() * 2 + 1.5}s`,
                '--delay': `${Math.random() * 0.8}s`,
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
        {/* Result Icon */}
        <div className="animate-bounce-in">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center ${
            isSpyWin ? 'bg-gray-100' : 'bg-gray-50'
          }`}>
            {isSpyWin ? (
              <XCircle size={52} className="text-black" strokeWidth={1.5} />
            ) : (
              <Trophy size={52} className="text-black" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className={`text-3xl font-extrabold text-black`}>
            {isSpyWin
              ? (isMulti ? 'جاسوس‌ها برنده شدند!' : 'جاسوس برنده شد!')
              : 'شهروندان برنده شدند!'
            }
          </h1>
          <p className="text-gray-400 mt-2">{result.message}</p>
        </div>

        {/* Details Card */}
        <div className="w-full bg-gray-50 rounded-2xl p-5">
          <div className="divide-y divide-gray-200">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-400">{isMulti ? 'جاسوس‌ها' : 'جاسوس'}</span>
              <span className="text-sm font-semibold text-black">{spyNamesStr}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-400">کلمه مخفی</span>
              <span className="text-sm font-semibold text-black">{secretWord}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onNewGame}
            className="w-full py-4 bg-black text-white font-semibold text-lg rounded-2xl
                       active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            <span>بازی جدید</span>
          </button>
          
          <button
            onClick={onHome}
            className="w-full py-3 bg-gray-50 text-black font-semibold rounded-2xl
                       active:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={20} />
            <span>صفحه اصلی</span>
          </button>
        </div>
      </div>
    </div>
  );
}