import { ChevronRight, Megaphone } from "lucide-react";
import officialLotus from "@/assets/bjp-official-lotus.png";

interface MobileGuestEventsSectionProps {
  lang: string;
  slideIndex: number;
  onViewAll: () => void;
  onSlideAction: () => void;
}

const mergedSlides = [
  {
    type: "banner_image",
    bannerImg: "/images/pm_schemes_explore_now.png",
    title: "Explore PM Schemes",
    isUnread: true,
  },
  {
    type: "event",
    dateMonth: "OCT",
    dateDay: "15",
    dateYear: "2026",
    ribbon: "BOOTH CONVENTION",
    ribbonMl: "ബൂത്ത് സമ്മേളനം",
    title: "VIKASITA KERALAM SAMMELAN 2026",
    subtitle: "Statewide Mega Booth Worker Convention in TVM",
    subtitleMl: "സംസ്ഥാനതല മെഗാ ബൂത്ത് സമ്മേളനം",
    ctaText: "REGISTER NOW",
    ctaTextMl: "രജിസ്റ്റർ ചെയ്യുക",
    rightGradient: "from-[#800f13] via-[#a3161a] to-[#4f080b]",
    accentBorder: "border-[#800f13]",
    dateBadgeBg: "bg-white text-[#800f13]",
    yearTagBg: "bg-red-50 text-[#800f13] border-red-200/80",
    isUnread: true,
  },
  {
    type: "announcement",
    ribbon: "MODI'S GUARANTEE",
    ribbonMl: "മോദിയുടെ ഗ്യാരണ്ടി",
    ribbonBg: "bg-red-500 text-white font-black",
    title: "SABKA SAATH · SABKA VIKAS",
    subtitle: "Sabka Vishwas · Sabka Prayaas (2047 Vision)",
    subtitleMl: "സബ്കാ സാഥ്, സബ്കാ വികാസ്, സബ്കാ വിശ്വാസ്",
    cardStyle: "bg-gradient-to-r from-[#800f13] via-[#a3161a] to-[#590a0d] text-white shadow-md border border-red-900/50",
    titleColor: "text-white font-extrabold",
    subTitleColor: "text-red-100/95 font-medium",
    rightGraphicBg: "bg-red-950/70 border-red-400/40",
    isUnread: true,
  },
  {
    type: "event",
    dateMonth: "NOV",
    dateDay: "02",
    dateYear: "2026",
    ribbon: "YOUTH RALLY",
    ribbonMl: "യുവമോർച്ച റാലി",
    title: "YUVA VIKAS YATRA & CONCLAVE",
    subtitle: "50,000+ Youth Leaders Gathering in TVM",
    subtitleMl: "തിരുവനന്തപുരത്ത് 50,000+ യുവ പ്രതിനിധികൾ",
    ctaText: "JOIN YATRA",
    ctaTextMl: "പങ്കെടുക്കുക",
    rightGradient: "from-[#ea580c] via-[#c2410c] to-[#9a3412]",
    accentBorder: "border-[#ea580c]",
    dateBadgeBg: "bg-white text-[#c2410c]",
    yearTagBg: "bg-orange-50 text-[#c2410c] border-orange-200/80",
    isUnread: true,
  },
] as const;

export function MobileGuestEventsSection({
  lang,
  slideIndex,
  onViewAll,
  onSlideAction,
}: MobileGuestEventsSectionProps) {
  const slide = mergedSlides[slideIndex % mergedSlides.length];

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between px-0.5 pb-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 dark:bg-orange-950/30 text-[#ff5500] shrink-0">
            <Megaphone className="h-3.5 w-3.5 stroke-[2.2]" />
          </span>
          <h3 className="font-display text-xs sm:text-[13px] font-black text-[#0a0f1d] dark:text-white tracking-tight truncate">
            {lang === "ml" ? "പരിപാടികളും അറിയിപ്പുകളും" : "Events & Announcements"}
          </h3>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-[11px] font-bold text-[#ff5500] hover:text-orange-600 transition-colors cursor-pointer shrink-0"
        >
          <span>{lang === "ml" ? "എല്ലാം" : "View All"}</span>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3b30] text-white text-[9.5px] font-black shadow-2xs">
            3
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[#ff5500] stroke-[2.5]" />
        </button>
      </div>

      {slide.type === "banner_image" ? (
        <div
          onClick={onSlideAction}
          className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-[80px] w-full cursor-pointer group transition-all duration-500"
        >
          <img
            src={slide.bannerImg}
            alt="Explore PM Schemes - Viksit Bharat"
            className="h-full w-full object-fill group-hover:scale-102 transition-transform duration-300"
          />
          {slide.isUnread && (
            <div className="absolute top-2 right-2 z-10">
              <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block shadow-xs" />
            </div>
          )}
        </div>
      ) : slide.type === "event" ? (
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-[80px] flex items-center justify-between transition-all duration-500">
          <div className="flex-1 min-w-0 h-full p-2.5 pl-3 pr-3 flex flex-col justify-between z-10">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <h4 className="font-display text-[11.5px] sm:text-[12px] font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate">
                  {slide.title}
                </h4>
                {slide.isUnread && (
                  <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block" />
                )}
              </div>
              <p className="text-[9.5px] font-medium text-slate-600 dark:text-slate-300 leading-tight line-clamp-1">
                {lang === "ml" ? slide.subtitleMl : slide.subtitle}
              </p>
            </div>
            <div className="pt-0.5">
              <button
                type="button"
                onClick={onSlideAction}
                className="inline-block rounded-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 px-2.5 py-0.5 text-[8px] font-black tracking-wider uppercase shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                {lang === "ml" ? slide.ctaTextMl : slide.ctaText}
              </button>
            </div>
          </div>

          <div className="relative h-full w-[38%] shrink-0 flex items-center justify-center overflow-hidden pr-0.5">
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.rightGradient} [clip-path:polygon(20%_0%,100%_0%,100%_100%,0%_100%,15%_50%)]`} />
            <div className={`absolute inset-0 border-l-2 ${slide.accentBorder} opacity-80 [clip-path:polygon(20%_0%,25%_0%,20%_50%,25%_100%,20%_100%,15%_50%)]`} />

            <div className={`relative z-10 rounded-lg px-2 py-0.5 flex flex-col items-center justify-center text-center ${slide.dateBadgeBg} min-w-[48px] shadow-md border border-white/60`}>
              <span className="block text-[8px] font-black uppercase tracking-wider leading-none">{slide.dateMonth}</span>
              <span className="block text-[15px] font-black leading-tight my-0.5 tracking-tight">{slide.dateDay}</span>
              <span className={`block text-[7px] font-black tracking-widest leading-none px-1 py-0.5 rounded-xs border ${slide.yearTagBg}`}>
                {slide.dateYear}
              </span>
            </div>

            <div className="absolute top-1 right-1 z-20 h-5 w-5 rounded-full bg-amber-400 border border-white/80 p-0.5 flex items-center justify-center shadow-xs">
              <img src={officialLotus} alt="Lotus" className="h-3.5 w-3.5 object-contain" />
            </div>
          </div>
        </div>
      ) : (
        <div className={`relative overflow-hidden rounded-xl ${slide.cardStyle} p-2 px-2.5 h-[80px] flex flex-col justify-between transition-all duration-500`}>
          <div className="absolute top-0 right-0 z-10">
            <div className={`rounded-bl-md px-2 py-0.5 text-[7px] font-black uppercase tracking-wider shadow-xs ${slide.ribbonBg}`}>
              {lang === "ml" ? slide.ribbonMl : slide.ribbon}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-1 min-h-0">
            <div className={`shrink-0 h-9 w-9 rounded-full border ${slide.rightGraphicBg} p-0.5 flex items-center justify-center shadow-xs overflow-hidden`}>
              <img src={officialLotus} alt="Lotus Emblem" className="h-5.5 w-5.5 object-contain drop-shadow-xs" />
            </div>

            <div className="min-w-0 flex-1 flex flex-col justify-center h-full pr-1 text-left space-y-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <h4 className={`font-display text-[12px] sm:text-[12.5px] font-extrabold leading-tight tracking-tight truncate ${slide.titleColor}`}>
                  {slide.title}
                </h4>
                {slide.isUnread && (
                  <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0 inline-block" />
                )}
              </div>
              <p className={`text-[9.5px] leading-tight line-clamp-2 ${slide.subTitleColor}`}>
                {lang === "ml" ? slide.subtitleMl : slide.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Powered By Wayvida */}
      <div className="mt-6 mb-3 flex items-center justify-center gap-1.5 text-center">
        <span className="text-[9.5px] font-extrabold tracking-widest text-[#8e9bb0] dark:text-slate-400 uppercase">
          POWERED BY
        </span>
        <img
          src="/wayvida-logo-transparent.png"
          alt="Wayvida"
          className="h-3.5 w-auto object-contain shrink-0"
        />
      </div>
    </div>
  );
}
