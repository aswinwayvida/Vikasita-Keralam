import React from "react";
import { Crown } from "lucide-react";

export interface PodiumItem {
  rank: number;
  name: string;
  val: string;
  tag?: string;
  avatarUrl?: string;
  district?: string;
}

interface LeaderboardTop3PodiumProps {
  rank1?: PodiumItem;
  rank2?: PodiumItem;
  rank3?: PodiumItem;
  category?: string;
  lang?: "en" | "ml";
}

function LaurelWreath({ rank, tag, className = "w-10 h-10 text-white" }: { rank: number; tag?: string; className?: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg className={className} viewBox="0 0 50 50" fill="currentColor">
          {/* Left Laurel Leaves */}
          <path d="M 12 36 C 8 26, 11 15, 20 8 C 18 13, 17 19, 19 24 C 15 22, 11 25, 12 36 Z" opacity="0.9" />
          <path d="M 10 30 C 5 26, 6 20, 12 18 C 12 22, 13 25, 10 30 Z" opacity="0.75" />
          <path d="M 16 16 C 11 12, 13 6, 19 7 C 19 11, 18 14, 16 16 Z" opacity="0.85" />
          <path d="M 21 8 C 18 3, 22 1, 25 4 C 24 6, 23 7, 21 8 Z" opacity="0.95" />

          {/* Right Laurel Leaves */}
          <path d="M 38 36 C 42 26, 39 15, 30 8 C 32 13, 33 19, 31 24 C 35 22, 39 25, 38 36 Z" opacity="0.9" />
          <path d="M 40 30 C 45 26, 44 20, 38 18 C 38 22, 37 25, 40 30 Z" opacity="0.75" />
          <path d="M 34 16 C 39 12, 37 6, 31 7 C 31 11, 32 14, 34 16 Z" opacity="0.85" />
          <path d="M 29 8 C 32 3, 28 1, 25 4 C 26 6, 27 7, 29 8 Z" opacity="0.95" />

          {/* Bottom Curved Ribbon Base */}
          <path d="M 14 36 C 20 41, 30 41, 36 36 C 31 39, 19 39, 14 36 Z" opacity="0.95" />
        </svg>
        <span className="absolute font-black text-xl text-white drop-shadow-md leading-none select-none z-10">{rank}</span>
      </div>

      {tag && (
        <span className="mt-0.5 px-1.5 py-0.2 rounded bg-black/25 dark:bg-black/40 text-[9px] font-black text-white uppercase tracking-wider shadow-2xs border border-white/25 whitespace-nowrap">
          {tag}
        </span>
      )}
    </div>
  );
}

export function LeaderboardTop3Podium({
  rank1,
  rank2,
  rank3,
  category = "workers",
  lang = "en"
}: LeaderboardTop3PodiumProps) {
  const pointsLabel = lang === "ml" ? "പോയിന്റ്" : "pts";

  return (
    <div className="flex items-end justify-center gap-2 pt-6 pb-2 px-1 w-full max-w-full">
      {/* --- RANK 2 (LEFT - BLUE) --- */}
      {rank2 && (
        <div className="flex-1 flex flex-col items-center min-w-0 z-10">
          {/* Avatar Container */}
          <div className="flex flex-col items-center mb-1">
            {rank2.avatarUrl && (
              <div className="relative w-12 h-12 rounded-full ring-3 ring-blue-400 p-0.5 bg-white dark:bg-slate-900 shadow-md flex items-center justify-center mb-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <img src={rank2.avatarUrl} alt={rank2.name} className="h-full w-full object-cover" />
                </div>
              </div>
            )}

            {/* Name - Displayed completely without truncation */}
            <div className="min-h-[2.25rem] flex items-center justify-center w-full px-0.5 mt-1">
              <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100 leading-[1.15] text-center line-clamp-2 break-words">
                {rank2.name}
              </p>
            </div>

            {/* Score/Points Pill Badge */}
            <div className="mt-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-2 py-0.5 shadow-2xs text-[9.5px] font-extrabold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {rank2.val} {pointsLabel}
            </div>
          </div>

          {/* 3D Pedestal Stand */}
          <div className="w-full flex flex-col items-center mt-1">
            {/* Top Slanted Cap */}
            <div
              className="w-full h-3.5 bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 rounded-t-xs border-t border-blue-200/60 shadow-inner"
              style={{ clipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)" }}
            />
            {/* Front Block Face */}
            <div className="w-full h-20 bg-gradient-to-b from-[#3b82f6] via-[#2563eb] to-[#1d4ed8] shadow-lg flex flex-col items-center justify-center p-1 border-x border-b border-blue-500/40">
              <LaurelWreath rank={2} tag={rank2.tag} className="w-9 h-9 text-white/90" />
            </div>
          </div>
        </div>
      )}

      {/* --- RANK 1 (CENTER - TALLER ORANGE / GOLD WITH CROWN) --- */}
      {rank1 && (
        <div className="flex-1 flex flex-col items-center min-w-0 z-20 -mt-5">
          {/* Crown above Avatar */}
          <div className="mb-0.5">
            <Crown className="w-7 h-7 text-amber-400 fill-amber-400 drop-shadow-md" />
          </div>

          {/* Avatar Container */}
          <div className="flex flex-col items-center mb-1">
            {rank1.avatarUrl && (
              <div className="relative w-14 h-14 rounded-full ring-3 ring-orange-500 ring-offset-2 ring-offset-background p-0.5 bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center mb-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <img src={rank1.avatarUrl} alt={rank1.name} className="h-full w-full object-cover" />
                </div>
              </div>
            )}

            {/* Name - Displayed completely without truncation */}
            <div className="min-h-[2.25rem] flex items-center justify-center w-full px-0.5 mt-1">
              <p className="text-[10.5px] font-black text-slate-900 dark:text-white leading-[1.15] text-center line-clamp-2 break-words">
                {rank1.name}
              </p>
            </div>

            {/* Score/Points Pill Badge */}
            <div className="mt-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-0.5 shadow-2xs text-[10px] font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">
              {rank1.val} {pointsLabel}
            </div>
          </div>

          {/* 3D Pedestal Stand */}
          <div className="w-full flex flex-col items-center mt-1">
            {/* Top Slanted Cap */}
            <div
              className="w-full h-4 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 rounded-t-xs border-t border-amber-200/80 shadow-inner"
              style={{ clipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)" }}
            />
            {/* Front Block Face */}
            <div className="w-full h-28 bg-gradient-to-b from-[#f97316] via-[#ea580c] to-[#c2410c] shadow-xl flex flex-col items-center justify-center p-1 border-x border-b border-orange-500/50">
              <LaurelWreath rank={1} tag={rank1.tag} className="w-11 h-11 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* --- RANK 3 (RIGHT - AMBER / GOLD) --- */}
      {rank3 && (
        <div className="flex-1 flex flex-col items-center min-w-0 z-10">
          {/* Avatar Container */}
          <div className="flex flex-col items-center mb-1">
            {rank3.avatarUrl && (
              <div className="relative w-12 h-12 rounded-full ring-3 ring-amber-400 p-0.5 bg-white dark:bg-slate-900 shadow-md flex items-center justify-center mb-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <img src={rank3.avatarUrl} alt={rank3.name} className="h-full w-full object-cover" />
                </div>
              </div>
            )}

            {/* Name - Displayed completely without truncation */}
            <div className="min-h-[2.25rem] flex items-center justify-center w-full px-0.5 mt-1">
              <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100 leading-[1.15] text-center line-clamp-2 break-words">
                {rank3.name}
              </p>
            </div>

            {/* Score/Points Pill Badge */}
            <div className="mt-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-2 py-0.5 shadow-2xs text-[9.5px] font-extrabold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {rank3.val} {pointsLabel}
            </div>
          </div>

          {/* 3D Pedestal Stand */}
          <div className="w-full flex flex-col items-center mt-1">
            {/* Top Slanted Cap */}
            <div
              className="w-full h-3.5 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 rounded-t-xs border-t border-amber-200/60 shadow-inner"
              style={{ clipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)" }}
            />
            {/* Front Block Face */}
            <div className="w-full h-16 bg-gradient-to-b from-[#eab308] via-[#ca8a04] to-[#a16207] shadow-lg flex flex-col items-center justify-center p-1 border-x border-b border-amber-500/40">
              <LaurelWreath rank={3} tag={rank3.tag} className="w-9 h-9 text-white/90" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
