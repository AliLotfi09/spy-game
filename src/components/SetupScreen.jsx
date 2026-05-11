import React, { useState, useEffect } from 'react';
import { Minus, Plus, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { toPersian } from '../utils/helpers';
import { MIN_PLAYERS, MAX_PLAYERS, DEFAULT_TIMER_MINUTES, MIN_TIMER_MINUTES, MAX_TIMER_MINUTES } from '../utils/constants';
import { defaultSpyCount } from '../utils/helpers';

export default function SetupScreen({ 
  playerCount, setPlayerCount, 
  players, spyCount, setSpyCount,
  timerDuration, setTimerDuration,
  onStart, onBack 
}) {
  const [names, setNames] = useState(() => {
    const initial = [];
    for (let i = 0; i < playerCount; i++) {
      initial.push(players[i] || '');
    }
    return initial;
  });

  useEffect(() => {
    setNames(prev => {
      const updated = [...prev];
      while (updated.length < playerCount) updated.push('');
      return updated.slice(0, playerCount);
    });
  }, [playerCount]);

  const updatePlayerCount = (delta) => {
    const newCount = playerCount + delta;
    if (newCount < MIN_PLAYERS || newCount > MAX_PLAYERS) return;
    setPlayerCount(newCount);
    setSpyCount(defaultSpyCount(newCount));
  };

  const updateSpyCount = (delta) => {
    const newCount = spyCount + delta;
    if (newCount < 1 || newCount > playerCount - 2) return;
    setSpyCount(newCount);
  };

  const updateTimer = (delta) => {
    const newTime = timerDuration + delta;
    if (newTime >= MIN_TIMER_MINUTES && newTime <= MAX_TIMER_MINUTES) {
      setTimerDuration(newTime);
    }
  };

  const allNamesFilled = names.every(name => name.trim().length > 0);

  const handleStart = () => {
    if (!allNamesFilled) return;
    const finalNames = names.map(name => name.trim());
    onStart(finalNames);
  };

  return (
    <div className="absolute inset-0 overflow-y-auto screen-enter bg-white">
      <div className="flex flex-col gap-5 max-w-md mx-auto p-5 pt-8 pb-8">
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-2xl font-black text-black">بازی جدید</h2>
          <p className="text-sm text-gray-400 mt-1">نام و تعداد بازیکنان را مشخص کنید</p>
        </div>


        {/* Player Count Card */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">تعداد بازیکنان</p>
          </div>
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => updatePlayerCount(-1)}
              disabled={playerCount <= MIN_PLAYERS}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-gray-200
                         active:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={22} className="text-black" strokeWidth={2.5} />
            </button>
            
            <div className="text-center min-w-[80px]">
              <span className="text-5xl font-black text-black">{toPersian(playerCount)}</span>
              <p className="text-xs text-gray-400 mt-1">نفر</p>
            </div>
            
            <button
              onClick={() => updatePlayerCount(1)}
              disabled={playerCount >= MAX_PLAYERS}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-gray-200
                         active:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={22} className="text-black" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Spy Count Card */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">تعداد جاسوس‌ها</p>
          </div>
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => updateSpyCount(-1)}
              disabled={spyCount <= 1}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-gray-200
                         active:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={22} className="text-black" strokeWidth={2.5} />
            </button>
            
            <div className="text-center min-w-[80px]">
              <span className="text-5xl font-black text-black">{toPersian(spyCount)}</span>
              <p className="text-xs text-gray-400 mt-1">نفر</p>
            </div>
            
            <button
              onClick={() => updateSpyCount(1)}
              disabled={spyCount >= playerCount - 2}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-gray-200
                         active:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={22} className="text-black" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Timer Duration Card */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <div className="text-center mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Clock size={14} />
              مدت زمان بازی
            </p>
          </div>
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => updateTimer(-1)}
              disabled={timerDuration <= MIN_TIMER_MINUTES}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-gray-200
                         active:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={22} className="text-black" strokeWidth={2.5} />
            </button>
            
            <div className="text-center min-w-[100px]">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-black">{toPersian(timerDuration)}</span>
                <span className="text-xl font-bold text-gray-400">دقیقه</span>
              </div>
            </div>
            
            <button
              onClick={() => updateTimer(1)}
              disabled={timerDuration >= MAX_TIMER_MINUTES}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-gray-200
                         active:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={22} className="text-black" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Player Names */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              نام بازیکنان
            </p>
            {allNamesFilled ? (
              <span className="text-xs text-gray-300">همه وارد شد ✓</span>
            ) : (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} />
                همه نام‌ها الزامی است
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {names.map((name, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0 border border-gray-100">
                  {toPersian(i + 1)}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...names];
                    newNames[i] = e.target.value;
                    setNames(newNames);
                  }}
                  placeholder={`نام بازیکن ${toPersian(i + 1)}`}
                  className="flex-1 py-2 bg-transparent text-black text-base font-medium outline-none placeholder:text-gray-300"
                  autoComplete="off"
                  dir="rtl"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleStart}
            disabled={!allNamesFilled}
            className={`w-full py-4 font-semibold text-lg rounded-2xl flex items-center justify-center gap-2 transition-all duration-200
              ${allNamesFilled
                ? 'bg-black text-white active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <span>شروع بازی</span>
            <ArrowRight size={20} />
          </button>
          
          <button
            onClick={onBack}
            className="w-full py-3 text-gray-400 font-medium rounded-2xl
                       active:bg-gray-50 transition-colors"
          >
            بازگشت
          </button>
        </div>
      </div>
    </div>
  );
}