import React from 'react';
import { Users, Smartphone, Search, Eye } from 'lucide-react';

export default function HomeScreen({ onStart }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 screen-enter bg-white">
      <div className="flex flex-col items-center gap-10 text-center max-w-sm w-full">
        {/* Animated Spy Logo */}
        <div className="relative w-36 h-36">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="w-full h-full rounded-full border-2 border-dashed border-gray-200"></div>
          </div>
          
          {/* Inner morphing shape */}
          <div className="absolute inset-2 bg-black animate-rotate-morph flex items-center justify-center">
            <div className="relative">
              {/* Hat */}
              <div className="w-12 h-3 bg-white mx-auto rounded-t-lg -mb-1"></div>
              <div className="w-16 h-16 rounded-full border-[3px] border-white flex items-center justify-center mx-auto">
                {/* Face */}
                <div className="flex gap-1.5 mt-1">
                  <div className="w-2 h-2.5 bg-white rounded-full"></div>
                  <div className="w-2 h-2.5 bg-white rounded-full"></div>
                </div>
              </div>
              {/* Body hint */}
              <div className="w-8 h-8 border-[3px] border-white rounded-b-full mx-auto -mt-1"></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-black tracking-tight">
            جاسوس
          </h1>
          <p className="text-lg text-gray-400 font-medium">
            بازی گروهی حدس کلمه و استنتاج
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <Users size={24} className="text-black" strokeWidth={1.5} />
            <span className="text-xs text-gray-400 font-medium">۳-۲۰ نفر</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <Smartphone size={24} className="text-black" strokeWidth={1.5} />
            <span className="text-xs text-gray-400 font-medium">تک گوشی</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <Search size={24} className="text-black" strokeWidth={1.5} />
            <span className="text-xs text-gray-400 font-medium">استنتاج</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed">
          یک جاسوس در میان شماست! با پرسیدن سوالات هوشمندانه، 
          جاسوس را پیدا کنید قبل از اینکه او کلمه مخفی را حدس بزند.
        </p>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full py-5 bg-black text-white font-semibold text-lg rounded-2xl
                     active:scale-[0.98] transition-transform duration-150
                     hover:bg-gray-900"
        >
          شروع بازی جدید
        </button>
      </div>
    </div>
  );
}