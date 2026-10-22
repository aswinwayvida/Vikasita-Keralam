import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Layers,
  Sprout,
  HeartPulse,
  Home,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

export interface CategoryData {
  id: string;
  nameEn: string;
  nameMl: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  colorGradStart: string;
  colorGradEnd: string;
  colorShadow: string;
  bgRow: string;
  badgeBg: string;
  iconBg: string;
  iconColor: string;
}

const defaultCategories: CategoryData[] = [
  {
    id: "agri",
    nameEn: "Farmer Welfare & Agriculture",
    nameMl: "കർഷക ക്ഷേമം & കൃഷി",
    count: 38,
    icon: Sprout,
    color: "#10b981", // Emerald Green
    colorGradStart: "#34d399",
    colorGradEnd: "#059669",
    colorShadow: "rgba(16, 185, 129, 0.35)",
    bgRow: "hover:bg-emerald-500/[0.06] border-emerald-500/10",
    badgeBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "health",
    nameEn: "Health & Medical Care",
    nameMl: "ആരോഗ്യ സംരക്ഷണം",
    count: 28,
    icon: HeartPulse,
    color: "#f97316", // Warm Orange
    colorGradStart: "#fb923c",
    colorGradEnd: "#ea580c",
    colorShadow: "rgba(249, 115, 22, 0.35)",
    bgRow: "hover:bg-orange-500/[0.06] border-orange-500/10",
    badgeBg: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/20",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "housing",
    nameEn: "Housing & Infrastructure",
    nameMl: "ഭവന നിർമ്മാണം",
    count: 24,
    icon: Home,
    color: "#2563eb", // Deep Royal Blue
    colorGradStart: "#60a5fa",
    colorGradEnd: "#1d4ed8",
    colorShadow: "rgba(37, 99, 235, 0.35)",
    bgRow: "hover:bg-blue-500/[0.06] border-blue-500/10",
    badgeBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "education",
    nameEn: "Education & Skill Development",
    nameMl: "വിദ്യാഭ്യാസവും നൈപുണ്യ വികസനവും",
    count: 20,
    icon: GraduationCap,
    color: "#f59e0b", // Amber
    colorGradStart: "#fbbf24",
    colorGradEnd: "#d97706",
    colorShadow: "rgba(245, 158, 11, 0.35)",
    bgRow: "hover:bg-amber-500/[0.06] border-amber-500/10",
    badgeBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "social",
    nameEn: "Social Security & Pensions",
    nameMl: "സാമൂഹിക സുരക്ഷയും പെൻഷനും",
    count: 18,
    icon: ShieldCheck,
    color: "#9333ea", // Vibrant Purple
    colorGradStart: "#c084fc",
    colorGradEnd: "#7e22ce",
    colorShadow: "rgba(147, 51, 234, 0.35)",
    bgRow: "hover:bg-purple-500/[0.06] border-purple-500/10",
    badgeBg: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

interface SchemesByCategoryCardProps {
  categories?: CategoryData[];
}

export function SchemesByCategoryCard({
  categories = defaultCategories,
}: SchemesByCategoryCardProps) {
  const { lang } = useLang();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Dynamic calculations
  const totalSchemes = categories.reduce((sum, item) => sum + item.count, 0);

  // Math helper for arc paths
  const size = 320;
  const center = size / 2;
  const outerRadius = 128;
  const innerRadius = 82;
  const gapAngle = 0.035; // ~2 degrees gap between slices for light 3D separation

  let currentAngle = -Math.PI / 2; // Start from top

  const processedData = categories.map((cat) => {
    const percentage = totalSchemes > 0 ? (cat.count / totalSchemes) * 100 : 0;
    const angleRange = (percentage / 100) * (Math.PI * 2);

    const startAngle = currentAngle + gapAngle / 2;
    const endAngle = currentAngle + angleRange - gapAngle / 2;
    const midAngle = (startAngle + endAngle) / 2;

    currentAngle += angleRange;

    // SVG arc coordinates
    const x1_out = center + outerRadius * Math.cos(startAngle);
    const y1_out = center + outerRadius * Math.sin(startAngle);
    const x2_out = center + outerRadius * Math.cos(endAngle);
    const y2_out = center + outerRadius * Math.sin(endAngle);

    const x1_in = center + innerRadius * Math.cos(startAngle);
    const y1_in = center + innerRadius * Math.sin(startAngle);
    const x2_in = center + innerRadius * Math.cos(endAngle);
    const y2_in = center + innerRadius * Math.sin(endAngle);

    const largeArcFlag = angleRange > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1_out} ${y1_out}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2_out} ${y2_out}`,
      `L ${x2_in} ${y2_in}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1_in} ${y1_in}`,
      "Z",
    ].join(" ");

    // Label position (midpoint of arc)
    const labelRadius = (outerRadius + innerRadius) / 2;
    const labelX = center + labelRadius * Math.cos(midAngle);
    const labelY = center + labelRadius * Math.sin(midAngle);

    // Hover translate offset vector for 3D slice pop effect
    const hoverOffset = 7;
    const translateX = Math.cos(midAngle) * hoverOffset;
    const translateY = Math.sin(midAngle) * hoverOffset;

    return {
      ...cat,
      percentage,
      pathData,
      midAngle,
      labelX,
      labelY,
      translateX,
      translateY,
    };
  });

  const activeCategory = processedData.find((c) => c.id === activeId);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-2.5">
        <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2 leading-snug">
          <div className="p-1 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <Layers className="h-4 w-4 shrink-0" />
          </div>
          <span>
            {lang === "ml" ? "വിഭാഗം തിരിച്ചുള്ള പദ്ധതികൾ" : "Schemes by Category"}
          </span>
        </h2>
      </div>

      {/* Main Content Layout: Chart Centered with Horizontal Legend Underneath */}
      <div className="flex flex-col items-center justify-center space-y-4 py-1">
        {/* Centered Donut Chart Container */}
        <div className="flex flex-col items-center justify-center relative">
          {/* Custom SVG Donut Chart with Light 3D Soft-Depth Treatment */}
          <div className="relative w-60 h-60 sm:w-68 sm:h-68 flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full overflow-visible drop-shadow-sm select-none"
            >
              <defs>
                {/* 3D Segment Gradients */}
                {processedData.map((cat) => (
                  <linearGradient
                    key={`grad-${cat.id}`}
                    id={`donut-grad-${cat.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={cat.colorGradStart} />
                    <stop offset="100%" stopColor={cat.colorGradEnd} />
                  </linearGradient>
                ))}

                {/* Soft 3D Drop Shadow for Segments */}
                <filter id="soft-3d-shadow" x="-20%" y="-20%" width="150%" height="150%">
                  <feDropShadow
                    dx="0"
                    dy="5"
                    stdDeviation="4"
                    floodColor="#0f172a"
                    floodOpacity="0.12"
                  />
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="2"
                    floodColor="#0f172a"
                    floodOpacity="0.08"
                  />
                </filter>

                {/* Inset Inner Ring Soft Shadow for Center Hole */}
                <radialGradient id="center-hole-shadow" cx="50%" cy="50%" r="50%">
                  <stop offset="75%" stopColor="transparent" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.06" />
                </radialGradient>
              </defs>

              {/* 3D Base Depth / Extrusion Shadow Layer */}
              <g filter="url(#soft-3d-shadow)">
                {processedData.map((cat) => {
                  const isActive = activeId === cat.id;
                  return (
                    <path
                      key={`shadow-${cat.id}`}
                      d={cat.pathData}
                      fill={cat.colorGradEnd}
                      opacity={0.3}
                      transform={
                        isActive
                          ? `translate(${cat.translateX}, ${cat.translateY + 3})`
                          : "translate(0, 3)"
                      }
                      className="transition-transform duration-300 ease-out"
                    />
                  );
                })}
              </g>

              {/* Donut Segments Layer */}
              <g>
                {processedData.map((cat) => {
                  const isActive = activeId === cat.id;
                  const isDimmed = activeId !== null && !isActive;

                  return (
                    <path
                      key={`segment-${cat.id}`}
                      d={cat.pathData}
                      fill={`url(#donut-grad-${cat.id})`}
                      stroke="rgba(255, 255, 255, 0.85)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      opacity={isDimmed ? 0.45 : 1}
                      transform={
                        isActive
                          ? `translate(${cat.translateX}, ${cat.translateY}) scale(1.025)`
                          : "translate(0, 0) scale(1)"
                      }
                      style={{
                        transformOrigin: `${center}px ${center}px`,
                        cursor: "pointer",
                      }}
                      className="transition-all duration-300 ease-out hover:brightness-105"
                      onMouseEnter={() => setActiveId(cat.id)}
                      onMouseLeave={() => setActiveId(null)}
                    />
                  );
                })}
              </g>

              {/* Top Highlight Rim Overlay for Soft 3D Bevel */}
              <g pointerEvents="none">
                {processedData.map((cat) => (
                  <path
                    key={`bevel-${cat.id}`}
                    d={cat.pathData}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="1"
                    opacity={activeId === cat.id ? 0.6 : 0.25}
                    transform={
                      activeId === cat.id
                        ? `translate(${cat.translateX}, ${cat.translateY}) scale(1.025)`
                        : "translate(0, 0) scale(1)"
                    }
                    style={{ transformOrigin: `${center}px ${center}px` }}
                    className="transition-all duration-300 ease-out"
                  />
                ))}
              </g>

              {/* Percentage Labels on Donut Segments */}
              <g pointerEvents="none">
                {processedData.map((cat) => {
                  const isActive = activeId === cat.id;
                  return (
                    <text
                      key={`label-${cat.id}`}
                      x={cat.labelX}
                      y={cat.labelY}
                      transform={
                        isActive
                          ? `translate(${cat.translateX}, ${cat.translateY})`
                          : "translate(0, 0)"
                      }
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-white font-extrabold text-[11px] tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out"
                    >
                      {cat.percentage.toFixed(1)}%
                    </text>
                  );
                })}
              </g>
            </svg>

            {/* Center Circle Content (Navy Total & Muted Label) */}
            <div
              className="absolute inset-0 m-auto w-[148px] h-[148px] rounded-full bg-background border border-border/80 shadow-inner flex flex-col items-center justify-center p-3 text-center pointer-events-none transition-transform duration-300"
              style={{
                background:
                  "radial-gradient(circle at center, var(--background) 70%, var(--muted) 100%)",
              }}
            >
              <span className="font-display text-2xl xs:text-3xl font-extrabold text-foreground tracking-tight leading-none">
                {activeCategory
                  ? activeCategory.count.toLocaleString()
                  : totalSchemes.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground block mt-1 leading-tight">
                {activeCategory
                  ? lang === "ml"
                    ? activeCategory.nameMl
                    : activeCategory.nameEn
                  : lang === "ml"
                  ? "ആകെ പദ്ധതികൾ"
                  : "Total Schemes"}
              </span>
              {activeCategory && (
                <span
                  className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border"
                  style={{
                    backgroundColor: `${activeCategory.color}15`,
                    color: activeCategory.color,
                    borderColor: `${activeCategory.color}30`,
                  }}
                >
                  {activeCategory.percentage.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Category Legend List Underneath Chart (3 in one line) */}
        <div className="w-full pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-x-2 gap-y-2.5 justify-items-center items-center">
          {processedData.map((cat) => {
            const isActive = activeId === cat.id;

            return (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveId(cat.id)}
                onMouseLeave={() => setActiveId(null)}
                className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-150 cursor-pointer min-w-0 ${
                  isActive
                    ? "bg-accent/80 shadow-2xs scale-105"
                    : "hover:bg-accent/40"
                }`}
              >
                {/* Color Dot Indicator */}
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs transition-transform duration-150"
                  style={{
                    backgroundColor: cat.color,
                    transform: isActive ? "scale(1.25)" : "scale(1)",
                  }}
                />
                {/* Category Name in 10px Regular font size */}
                <span className="text-[10px] font-normal text-foreground leading-tight text-center sm:text-left">
                  {lang === "ml" ? cat.nameMl : cat.nameEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
