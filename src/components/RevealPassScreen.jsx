import React from 'react';
import { ChevronLeft, UserCircle2, Users } from 'lucide-react';
import { toPersian } from '../utils/helpers';

export default function RevealPassScreen({ playerName, currentNum, totalNum, onNext }) {
  // Always use the actual player name passed from game state
  const displayName = playerName || `نفر ${toPersian(currentNum)}`;
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 screen-enter bg-white">
      <div className="flex flex-col items-center gap-8 text-center max-w-sm w-full">
        {/* Progress Indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalNum }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${
                i < currentNum - 1 
                  ? 'w-8 h-1.5 bg-black' 
                  : i === currentNum - 1 
                    ? 'w-6 h-1.5 bg-gray-600' 
                    : 'w-1.5 h-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Share Icon */}
        <div className="relative">
          <div className="w-28 h-28 bg-gray-50 rounded-[40%] flex items-center justify-center animate-float border-2 border-gray-100">
            <Users size={48} className="text-black" strokeWidth={1.5} />
          </div>
          {/* Passing animation dots */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-dot-pulse" style={{ animationDelay: '0s' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-dot-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-dot-pulse" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>

        {/* Instruction */}
        <div className="space-y-4">
          <p className="text-gray-400 text-xl">گوشی را بدهید به</p>
          <div className="flex items-center justify-center gap-3">
            <UserCircle2 size={32} className="text-gray-400" strokeWidth={1.5} />
            <h2 className="text-4xl font-black text-black">{displayName}</h2>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-gray-50 rounded-2xl p-5 w-full border border-gray-100">
          <p className="text-sm text-gray-500 leading-relaxed">
            فقط <span className="font-bold text-black">{displayName}</span> صفحه را ببیند و 
            بعد از دیدن نقش، دکمه را بزند
          </p>
        </div>

        {/* Ready Button */}
        <button
          onClick={onNext}
          className="w-full py-4 bg-black text-white font-semibold text-lg rounded-2xl
                     active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-2"
        >
          <span>آماده‌ام</span>
          <ChevronLeft size={20} />
        </button>
      </div>
    </div>
  );
}