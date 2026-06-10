import React, { useState, useEffect } from 'react';
import { Timer, Vote, Siren, Lightbulb, MessageCircle, Users as UsersIcon, Zap, Eye } from 'lucide-react';
import { formatTime } from '../utils/helpers';
import { TIMER_SECONDS } from '../utils/constants';

const TIPS = [
  {
    icon: Lightbulb,
    text: 'سوالاتی بپرسید که نیاز به تجربه شخصی داشته باشد',
    subtext: 'جاسوس نمی‌تواند تجربه واقعی تعریف کند'
  },
  {
    icon: MessageCircle,
    text: 'به بازیکنانی که پاسخ‌های مبهم می‌دهند دقت کنید',
    subtext: 'جاسوس معمولاً کلی‌گویی می‌کند'
  },
  {
    icon: UsersIcon,
    text: 'از همه بخواهید نظرشان را درباره محل بگویند',
    subtext: 'هر بازیکن باید جزئیات متفاوتی بگوید'
  },
  {
    icon: Eye,
    text: 'به حرکات و تغییر چهره بازیکنان توجه کنید',
    subtext: 'جاسوس ممکن است استرس داشته باشد'
  },
  {
    icon: Zap,
    text: 'کلمه مخفی را مستقیم به زبان نیاورید',
    subtext: 'با توصیف غیرمستقیم صحبت کنید'
  },
  {
    icon: Lightbulb,
    text: 'از بازیکنان بخواهید خاطره تعریف کنند',
    subtext: 'جاسوس برای ساختن خاطره جعلی مردد می‌شود'
  },
];

export default function GameScreen({ players, timeLeft, onVote, onSpyReveal }) {
  const [currentTip, setCurrentTip] = useState(0);
  const [randomPlayer, setRandomPlayer] = useState(players[0]);

  // Rotate tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(tipInterval);
  }, []);

  // Random player mention
  useEffect(() => {
    const playerInterval = setInterval(() => {
      const random = players[Math.floor(Math.random() * players.length)];
      setRandomPlayer(random);
    }, 3000);
    return () => clearInterval(playerInterval);
  }, [players]);

  const circumference = 2 * Math.PI * 54;
  const progress = (timeLeft / TIMER_SECONDS) * circumference;
  
  const isUrgent = timeLeft <= 60;
  const isWarning = timeLeft <= 180 && timeLeft > 60;
  
  const timerColor = isUrgent ? '#000' : isWarning ? '#555' : '#000';

  const CurrentTipIcon = TIPS[currentTip].icon;

  return (
    <div className="absolute inset-0 flex flex-col items-center p-5 screen-enter bg-white">
      <div className="flex flex-col items-center gap-5 flex-1 w-full max-w-sm">
        {/* Header */}
        <div className="text-center pt-2">
          <h2 className="text-3xl font-black text-black">وقت بحث است!</h2>
          <p className="text-sm text-gray-400 mt-1">با سوالات هوشمندانه جاسوس را پیدا کنید</p>
        </div>

        {/* Timer */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#F5F5F5" strokeWidth="5" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={timerColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className={`transition-all duration-1000 ease-linear ${isUrgent ? 'animate-pulse-soft' : ''}`}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Timer size={20} className={isUrgent ? 'text-black' : 'text-gray-500'} strokeWidth={1.5} />
            <span className={`text-3xl font-black mt-1.5 tabular-nums font-mono ${
              isUrgent ? 'text-black animate-pulse-soft' : 'text-black'
            }`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">دقیقه</span>
          </div>
        </div>

        {/* Players Grid with names */}
        <div className="w-full">
          <p className="text-[10px] text-gray-400 mb-2 text-center uppercase tracking-wider">بازیکنان</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {players.map((player, i) => (
              <span
                key={i}
                className="px-4 py-2.5 bg-gray-50 rounded-full text-sm font-semibold text-black
                           border border-gray-100 transition-all duration-300"
              >
                {player}
              </span>
            ))}
          </div>
        </div>

        {/* Tips Card - Fills the space */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 animate-slide-up">
            {/* Tip Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                نکات کارآگاهی
              </p>
              <span className="text-[10px] text-gray-300">
                {currentTip + 1} / {TIPS.length}
              </span>
            </div>

            {/* Tip Content */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl flex-shrink-0 border border-gray-100">
                <CurrentTipIcon size={24} className="text-black" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-base font-bold text-black leading-relaxed mb-2">
                  {TIPS[currentTip].text}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {TIPS[currentTip].subtext}
                </p>
              </div>
            </div>

            {/* Random Player Mention */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-black">{randomPlayer}</span>
                {' '}نظرت چیه؟
              </p>
            </div>

            {/* Tip Progress Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {TIPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTip(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentTip ? 'w-6 bg-black' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onVote}
            className="w-full py-4 bg-black text-white font-semibold text-lg rounded-2xl
                       active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-2"
          >
            <Vote size={20} />
            <span>شروع رأی‌گیری</span>
          </button>
        </div>
      </div>
    </div>
  );
}