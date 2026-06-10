import React, { useState } from 'react';
import { Eye, ShieldCheck, TriangleAlert, Check, User } from 'lucide-react';

export default function RevealCardScreen({ playerName, isSpy, secretWord, onNext }) {
  const [revealed, setRevealed] = useState(false);
  const displayName = playerName || 'بازیکن';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 screen-enter bg-white">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
        {/* Player Badge */}
        <div className="flex items-center gap-2 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100">
          <User size={18} className="text-gray-400" strokeWidth={1.5} />
          <span className="text-base font-semibold text-gray-700">{displayName}</span>
        </div>

        {/* Card */}
        <div className="w-full">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full bg-gray-50 rounded-3xl p-10 border-2 border-dashed border-gray-200
                         active:scale-[0.98] transition-all duration-200 animate-scale-in"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Eye size={40} className="text-gray-300" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-black">مشاهده نقش</p>
                  <p className="text-sm text-gray-400 mt-2">روی کارت ضربه بزنید</p>
                </div>
                {/* Animated hint dots */}
                <div className="flex gap-2">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-dot-pulse" style={{ animationDelay: '0s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-dot-pulse" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-dot-pulse" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </div>
            </button>
          ) : (
            <div className={`rounded-3xl p-8 border-2 animate-scale-in ${
              isSpy ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex flex-col items-center gap-5">
                {/* Role Icon */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isSpy ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {isSpy ? (
                    <TriangleAlert size={40} className="text-red-400" strokeWidth={2} />
                  ) : (
                    <ShieldCheck size={40} className="text-black" strokeWidth={1.5} />
                  )}
                </div>

                {/* Role Title */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">نقش شما</p>
                  <h2 className={`text-3xl font-black ${
                    isSpy ? 'text-red-500' : 'text-black'
                  }`}>
                    {isSpy ? 'جاسوس' : 'شهروند'}
                  </h2>
                </div>

                {/* Word Display for Citizens */}
                {!isSpy && (
                  <div className="w-full mt-2 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">کلمه مخفی</p>
                    <p className="text-2xl font-bold text-black break-words leading-relaxed">
                      {secretWord}
                    </p>
                  </div>
                )}

                {/* Spy Warning - Bold with subtle red */}
                {isSpy && (
                  <div className="w-full mt-2 bg-red-100/50 rounded-2xl p-6 border-2 border-red-200">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-red-200 rounded-xl flex-shrink-0">
                        <TriangleAlert size={24} className="text-red-500" strokeWidth={2} />
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-xl font-extrabold text-red-600 mb-3">
                          شما جاسوس هستید!
                        </p>
                        <p className="text-sm text-red-500/80 leading-relaxed">
                          کلمه مخفی را نمی‌دانید. به دقت به صحبت‌های دیگران گوش دهید،
                          سعی کنید خودتان را لو ندهید و کلمه را از صحبت‌هایشان حدس بزنید.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Continue Button */}
        {revealed && (
          <button
            onClick={onNext}
            className="w-full py-4 bg-black text-white font-semibold text-lg rounded-2xl
                       active:scale-[0.98] transition-transform duration-150 animate-slide-up 
                       flex items-center justify-center gap-2"
          >
            <Check size={20} />
            <span>متوجه شدم، برو بعدی</span>
          </button>
        )}

        {!revealed && (
          <p className="text-xs text-gray-300">
            فقط <span className="font-medium text-gray-400">{displayName}</span> کارت را ببیند
          </p>
        )}
      </div>
    </div>
  );
}