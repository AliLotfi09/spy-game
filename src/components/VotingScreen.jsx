import React from "react";
import { ArrowLeft, Check, Users } from "lucide-react";
import { toPersian } from "../utils/helpers";

export default function VotingScreen({
  players,
  selectedVote,
  onVoteSelect,
  onConfirm,
  onBack,
}) {
  const selectedPlayerName = selectedVote >= 0 ? players[selectedVote] : null;

  return (
    <div className="absolute inset-0 flex flex-col items-center p-5 screen-enter bg-white">
      <div className="flex flex-col gap-5 w-full max-w-sm pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-black">رأی‌گیری</h2>
            <p className="text-sm text-gray-400 mt-1">
              به جاسوس احتمالی رأی دهید
            </p>
          </div>

          <div className="w-10" />
        </div>

        {/* Player Options */}
        <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
          {players.map((player, i) => (
            <button
              key={i}
              onClick={() => onVoteSelect(i)}
              className={`w-full p-4 rounded-2xl text-right transition-all duration-200 flex items-center gap-4
                ${
                  selectedVote === i
                    ? "bg-black text-white scale-[1.02]"
                    : "bg-gray-50 text-black active:bg-gray-100"
                }`}
            >
              <span
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                ${
                  selectedVote === i
                    ? "bg-white/20 text-white"
                    : "bg-white text-gray-400"
                }`}
              >
                {toPersian(i + 1)}
              </span>
              <span className="font-semibold text-base flex-1">{player}</span>
              {selectedVote === i && <Check size={20} />}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={onConfirm}
            disabled={selectedVote < 0}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2
              ${
                selectedVote >= 0
                  ? "bg-black text-white active:scale-[0.98]"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
          >
            <Check size={20} />
            <span>
              {selectedVote >= 0
                ? `رأی به ${selectedPlayerName}`
                : "یک بازیکن را انتخاب کنید"}
            </span>
          </button>

          <button
            onClick={onBack}
            className="w-full py-3 text-gray-400 font-medium rounded-2xl
                       active:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>بازگشت به بحث</span>
          </button>
        </div>
      </div>
    </div>
  );
}
