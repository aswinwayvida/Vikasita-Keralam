import React, { useState } from "react";
import {
  Menu,
  Bell,
  User,
  X,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Settings,
  Globe,
  LayoutDashboard,
  ScrollText,
  FileCheck2,
  Users2,
  BarChart3,
  HelpCircle,
  LogOut,
  Sprout,
  FileText,
  Megaphone,
  Headphones,
  AlertTriangle,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { Link } from "@tanstack/react-router";
import { AdminMobileTab } from "./AdminMobileAppBottomNav";

interface AdminMobileAppHeaderProps {
  onNavigateTab?: (tab: AdminMobileTab) => void;
  onOpenNotifications?: () => void;
}

export function AdminMobileAppHeader({ onNavigateTab, onOpenNotifications }: AdminMobileAppHeaderProps = {}) {
  const { lang, setLang } = useLang();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notificationsGrouped = [
    {
      group: lang === "ml" ? "ഇന്ന്" : "Today",
      items: [
        {
          id: "n1",
          tag: "PM-KISAN",
          tagBg: "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300",
          iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
          icon: Sprout,
          title: lang === "ml" ? "പിഎം-കിസാൻ ഇ-കെവൈസി പൂർത്തിയാക്കുക" : "Complete PM-KISAN e-KYC",
          subtitle: lang === "ml" ? "ഗുണഭോക്തൃ അക്കൗണ്ടിനായി വെരിഫിക്കേഷൻ കുടിശ്ശികയാണ്." : "Verification is pending for your beneficiary account.",
          time: "10m ago",
          dotColor: "bg-amber-500",
        },
        {
          id: "n2",
          tag: lang === "ml" ? "സ്കോളർഷിപ്പ്" : "Scholarship",
          tagBg: "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300",
          iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
          icon: AlertTriangle,
          title: lang === "ml" ? "സ്കോളർഷിപ്പ് അപേക്ഷയിൽ തിരുത്തൽ വേണം" : "Scholarship application correction required",
          subtitle: lang === "ml" ? "പ്രോസസ്സിംഗ് തുടരാൻ കൂടുതൽ രേഖകൾ ആവശ്യമാണ്." : "Additional documents are needed to continue processing.",
          time: "25m ago",
          dotColor: "bg-rose-500",
        },
        {
          id: "n3",
          tag: "Kerala e-District",
          tagBg: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
          iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
          icon: FileText,
          title: lang === "ml" ? "വരുമാന സർട്ടിഫിക്കറ്റ് സമർപ്പിച്ചു" : "Income certificate submitted",
          subtitle: lang === "ml" ? "ഇ-ഡിസ്ട്രിക്റ്റ് അപേക്ഷ പരിശോധനയിലാണ്." : "Your Kerala e-District application is under review.",
          time: "1h ago",
          dotColor: "bg-blue-500",
        },
      ],
    },
    {
      group: lang === "ml" ? "ഇന്നലെ" : "Yesterday",
      items: [
        {
          id: "n4",
          tag: lang === "ml" ? "പുതിയ പദ്ധതി" : "New Scheme",
          tagBg: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
          iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
          icon: Megaphone,
          title: lang === "ml" ? "പുതിയ പദ്ധതി ലഭ്യമാണ്" : "New scheme available",
          subtitle: lang === "ml" ? "പിഎം വിശ്വകർമ്മ യോജനയിൽ ഇപ്പോൾ അപേക്ഷിക്കാം." : "PM Vishwakarma Yojana is now open for eligible users.",
          time: lang === "ml" ? "ഇന്നലെ" : "Yesterday",
          dotColor: "bg-blue-500",
        },
        {
          id: "n5",
          tag: lang === "ml" ? "സഹായം" : "Support",
          tagBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
          iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
          icon: Headphones,
          title: lang === "ml" ? "സഹായ അഭ്യർത്ഥന പുതുക്കി" : "Help request updated",
          subtitle: lang === "ml" ? "സപ്പോർട്ട് ടീം കൂടുതൽ വിവരങ്ങൾ ആവശ്യപ്പെട്ടിട്ടുണ്ട്." : "Support team requested additional information.",
          time: lang === "ml" ? "ഇന്നലെ" : "Yesterday",
          dotColor: "bg-emerald-500",
        },
      ],
    },
  ];

  return (
    <header className="relative z-40 w-full bg-[#FFFDF9] dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
      {/* Standard Header Bar Height (60px / h-15) */}
      <div className="flex h-15 items-center justify-between px-2.5">
        {/* Left Side: 3-line Menu Button & Logo positioned tight right next to it */}
        <div className="flex items-center gap-0.5 min-w-0 flex-1 mr-1">
          {/* Clean 3-line Hamburger Menu Button (No Circle) */}
          <button
            onClick={() => {
              setIsMenuOpen(true);
              setIsProfileOpen(false);
            }}
            className="flex p-0.5 items-center justify-center rounded-md text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all shrink-0 focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-6 w-6 text-slate-900 dark:text-white stroke-[2.2]" />
          </button>

          {/* Brand Logo directly adjacent to menu icon with minimal gap */}
          <div className="flex items-center min-w-0 shrink">
            <img
              src="/images/vikasita-logo.png"
              alt="Vikasita Keralam"
              className="h-11 sm:h-12 w-auto object-contain max-w-[210px] sm:max-w-[240px] shrink-0 drop-shadow-2xs"
            />
          </div>
        </div>

        {/* Right Controls: Uniform size controls with tight 4px gap [EN] [🔔4] [👤] */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Clear Compact Language Switcher Pill */}
          <button
            onClick={() => setLang(lang === "ml" ? "en" : "ml")}
            className="flex h-9 px-2.5 items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs shrink-0 focus:outline-none"
            aria-label="Switch Language"
            title={lang === "ml" ? "Switch to English" : "മലയാളത്തിലേക്ക് മാറ്റുക"}
          >
            {lang === "ml" ? "മല" : "EN"}
          </button>

          {/* Simplified Notification Bell Button */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                if (onOpenNotifications) {
                  onOpenNotifications();
                }
                setIsMenuOpen(false);
                setIsProfileOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs focus:outline-none shrink-0 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-slate-700 dark:text-slate-200 stroke-[2]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-500 text-[8.5px] font-black text-white border border-white dark:border-slate-900 shadow-2xs">
                4
              </span>
            </button>
          </div>

          {/* User Profile Circle Control (Uniform 36px size matching bell & EN) */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsMenuOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-300/80 dark:border-slate-700 bg-[#FFEDD5] text-[#F97316] hover:bg-orange-200 active:scale-95 transition-all shadow-2xs focus:outline-none shrink-0 overflow-hidden"
              aria-label="User Profile"
              title="Jayasurya Profile Options"
            >
              <img
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                alt="Jayasurya"
                className="h-full w-full object-cover rounded-full"
              />
            </button>

            {/* Profile Popover */}
            {isProfileOpen && (
              <div className="absolute right-0 top-14 z-50 w-[240px] rounded-2xl border border-amber-200/80 bg-white dark:bg-slate-900 p-3.5 shadow-2xl space-y-3 animate-in fade-in-50 zoom-in-95 text-foreground">
                <div className="flex items-center gap-2.5 border-b border-amber-100 dark:border-slate-800 pb-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#F97316] font-bold shadow-2xs overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                      alt="Jayasurya"
                      className="h-full w-full object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground">Jayasurya</h3>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> State Admin
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setLang(lang === "ml" ? "en" : "ml")}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-foreground hover:bg-amber-50 dark:hover:bg-slate-800 font-medium transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" /> {lang === "ml" ? "ഭാഷ" : "Language"}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-[#FFEDD5] text-[#F97316] px-2 py-0.5 rounded-md">
                      {lang === "ml" ? "മലയാളം" : "English"}
                    </span>
                  </button>
                  <Link
                    to="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-foreground hover:bg-amber-50 dark:hover:bg-slate-800 font-medium transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" /> {lang === "ml" ? "ക്രമീകരണങ്ങൾ" : "Settings"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Mobile Navigation Drawer Overlay (Solid Realistic Mobile Side Sheet) */}
      {isMenuOpen && (
        <div className="absolute top-0 left-0 w-full h-[660px] z-50 flex bg-card animate-in fade-in duration-150">
          <div className="w-full h-full bg-card p-4 flex flex-col justify-between shadow-2xl border-r border-border">
            <div className="space-y-4">
              {/* Drawer Top Header with Close Button */}
              <div className="flex items-center justify-between border-b border-border pb-3.5">
                <div className="flex items-center">
                  <img
                    src="/images/vikasita-logo.png"
                    alt="Vikasita Keralam"
                    className="h-12 sm:h-13 w-auto object-contain max-w-[240px] drop-shadow-xs"
                  />
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl border border-border bg-muted/60 p-2 text-foreground hover:bg-muted active:scale-95 transition-all shadow-2xs"
                  aria-label="Close Menu"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* User Identity Card inside Drawer */}
              <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-muted/40 p-3 shadow-2xs">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                    alt="Jayasurya"
                    className="h-full w-full object-cover rounded-xl"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background z-10" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">Jayasurya</p>
                  <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> {lang === "ml" ? "സംസ്ഥാന അഡ്മിൻ" : "State Nodal Admin"}
                  </p>
                </div>
              </div>

              {/* Navigation Menu List with Realistic Icons */}
              <nav className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab("overview");
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold text-foreground bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    {lang === "ml" ? "ഡാഷ്‌ബോർഡ് Overview" : "Dashboard Overview"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-primary" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab("users");
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 transition-all border border-amber-500/40 shadow-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Users2 className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                    {lang === "ml" ? "ഉപയോക്താക്കളുടെ ലിസ്റ്റ് (Users)" : "Users Directory"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab("schemes");
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-foreground bg-muted/30 hover:bg-muted hover:text-primary transition-all border border-border/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <ScrollText className="h-4 w-4 text-muted-foreground" />
                    {lang === "ml" ? "ക്ഷേമ പദ്ധതികൾ (740)" : "Welfare Schemes (740)"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab("applications");
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-foreground bg-muted/30 hover:bg-muted hover:text-primary transition-all border border-border/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <FileCheck2 className="h-4 w-4 text-muted-foreground" />
                    {lang === "ml" ? "അപേക്ഷകളും കേസും" : "Applications & Cases"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <Link
                  to="/admin/beneficiaries"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-foreground bg-muted/30 hover:bg-muted hover:text-primary transition-all border border-border/50"
                >
                  <span className="flex items-center gap-2.5">
                    <Users2 className="h-4 w-4 text-muted-foreground" />
                    {lang === "ml" ? "ഗുണഭോക്താക്കളുടെ ഡയറക്ടറി" : "Beneficiaries Directory"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link
                  to="/admin/public-pulse"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-foreground bg-muted/30 hover:bg-muted hover:text-primary transition-all border border-border/50"
                >
                  <span className="flex items-center gap-2.5">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    {lang === "ml" ? "വിശകലന റിപ്പോർട്ടുകൾ" : "Analytics & SLA Reports"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </nav>
            </div>

            {/* Drawer Footer with Official Portal Badge */}
            <div className="border-t border-border pt-3.5 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {lang === "ml" ? "കേരള സർക്കാർ e-Governance" : "Govt of Kerala e-Gov App"}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  v2.4 Live
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
